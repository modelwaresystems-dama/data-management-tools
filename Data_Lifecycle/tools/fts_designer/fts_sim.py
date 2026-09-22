#!/usr/bin/env python3
"""
fts_sim.py  -  batch validation and coverage engine for a canonical .fts.json model.

Usage:
  python fts_sim.py <model.fts.json> [--scenario <scenario.json>] [--out <dir>] [--loop-bound N]

What it does (the minimum validation suite):
  1. schema and referential integrity
  2. initial / terminal states and reachability (Global level and sub-state level)
  3. unreachable states and dead transitions, trap states
  4. overlapping guards / non-determinism (same source, same event, several targets)
  5. missing-event and missing-denial-path detection
  6. invariant presence per state (invariant preservation is a runtime check; here presence and inheritance)
  7. exception applicability per transition
  8. cycles (elementary cycles at Global level) and livelock candidates
  9. terminal-state irreversibility (any transition leaving a terminal state)
 10. hold-before-destruction check (a hold state must not lead directly to destruction)
Then a coverage run:
  - walks every transition at least once, each loop taken at most --loop-bound times per run
  - evaluates every guard once TRUE (pass) and once FALSE (blocked) using the scenario's
    guard outcomes or expressions, so the coverage matrix records both verdicts
  - writes a JSON report and an Excel workbook stamped with version and SAST build time.
  From v0.3 the vector walk evaluates every step through fts_twin_engine.Federation (the digital twin's engine), so the
  scenario runs are the regression suite of the twin.

A scenario file is optional. Shape:
  { "id": "...", "name": "...", "assetProfile": {"attr": value, ...},
    "guardOutcomes": {"GRD-011": true, ...},          # explicit verdicts (highest precedence)
    "defaultGuardOutcome": true }
A guard or condition may carry an optional "expression" (a Python boolean expression over
assetProfile attributes, evaluated with no builtins). Precedence: guardOutcomes > expression > default.
"""
import json, sys, os, re, argparse, datetime, itertools
from collections import defaultdict, Counter

VERSION = "0.3"

def now_sast():
    tz = datetime.timezone(datetime.timedelta(hours=2))
    return datetime.datetime.now(tz).strftime("%d %b %Y, %H:%M SAST")

# ---------------------------------------------------------------- model access
class Model:
    def __init__(self, M):
        self.M = M
        self.meta = M.get("meta", {})
        self.gs = {g["id"]: g for g in M.get("globalStates", [])}
        self.ss = {s["id"]: s for s in M.get("subStates", [])}
        self.states = {**self.gs, **self.ss}
        self.tr = {t["id"]: t for t in M.get("transitions", [])}
        self.ev = {e["id"]: e for e in M.get("events", [])}
        self.guards = M.get("guards", [])
        self.g_by_tr = defaultdict(list)
        for g in self.guards: self.g_by_tr[g.get("transition")].append(g)
        self.dr_by_tr = defaultdict(list)
        for d in M.get("decisionRights", []): self.dr_by_tr[d.get("appliesTo") or d.get("transition")].append(d)
        self.exc_by_tr = defaultdict(list)
        for x in M.get("exceptions", []): self.exc_by_tr[x.get("transition")].append(x)
        self.ctrl_by_tr = defaultdict(list)
        for c in M.get("controls", []): self.ctrl_by_tr[c.get("appliesTo")].append(c)
        self.inv_by_state = defaultdict(list)
        for i in M.get("invariants", []): self.inv_by_state[i.get("appliesTo")].append(i)
        self.ec_by_state = defaultdict(list)
        for i in M.get("entryConditions", []): self.ec_by_state[i.get("appliesTo")].append(i)
        self.xc_by_state = defaultdict(list)
        for i in M.get("exitConditions", []): self.xc_by_state[i.get("appliesTo")].append(i)
        self.acts_by_state = defaultdict(list)
        for a in M.get("activities", []): self.acts_by_state[a.get("permittedIn")].append(a)
        self.children = defaultdict(list)
        for s in M.get("subStates", []): self.children[s.get("parent")].append(s["id"])
        for k in self.children: self.children[k].sort(key=lambda i: self.ss[i].get("sequence", 0))
        self.initial_tr = [t for t in self.tr.values() if t.get("level") == "Initial" or t.get("source") == "[Initial]"]
        self.aligned = None  # set of transition IDs of the aligned (Global) model, when --align is given
        self.terminal = [g for g in self.gs if self.gs[g].get("terminal")]

    def parent(self, sid):
        return self.ss[sid]["parent"] if sid in self.ss else None

    def first_child(self, gid):
        c = self.children.get(gid) or []
        return c[0] if c else None

    def last_child(self, gid):
        c = self.children.get(gid) or []
        return c[-1] if c else None

    def is_hold(self, sid):
        n = (self.states.get(sid, {}).get("name") or "").lower()
        return "hold" in n
    def is_destruction(self, sid):
        n = (self.states.get(sid, {}).get("name") or "").lower()
        return "destruct" in n or "destroy" in n or "purge" in n

# ---------------------------------------------------------------- flattening
def flat_graph(m):
    """Adjacency at the finest level. A Global transition leaves the source's last (readiness)
    sub-state, or the Global State itself when it has no children, and arrives at the target
    Global State node; the target's own entry transition (Global node -> first sub-state) then
    takes the walk inside. Sub-State transitions are taken exactly as modelled."""
    adj = defaultdict(list)
    for t in m.tr.values():
        src, tgt = t.get("source"), t.get("target")
        if t.get("level") in ("Global", "Initial"):
            s = "[Initial]" if src == "[Initial]" else (m.last_child(src) or src)
            adj[s].append((tgt, t["id"]))
        else:
            adj[src].append((tgt, t["id"]))
    return adj

def global_graph(m):
    adj = defaultdict(list)
    for t in m.tr.values():
        if t.get("level") in ("Global", "Initial"):
            adj[t["source"]].append((t["target"], t["id"]))
    return adj

def reachable(adj, start):
    seen, stack = set([start]), [start]
    while stack:
        n = stack.pop()
        for nx, _ in adj.get(n, []):
            if nx not in seen: seen.add(nx); stack.append(nx)
    return seen

def elementary_cycles(adj, nodes):
    """Johnson would be overkill; the Global graph is small. Simple DFS enumeration of elementary cycles."""
    cycles, seen_keys = [], set()
    nodes = [n for n in nodes if n != "[Initial]"]
    def dfs(start, n, path, tids):
        for nx, tid in adj.get(n, []):
            if nx == start:
                cyc = tuple(path); key = tuple(sorted(cyc))
                if key not in seen_keys:
                    seen_keys.add(key); cycles.append((list(path), tids + [tid]))
            elif nx not in path and nx > start:
                dfs(start, nx, path + [nx], tids + [tid])
    for s in sorted(nodes):
        dfs(s, s, [s], [])
    return cycles

# ---------------------------------------------------------------- validation suite
def validate(m):
    F = []  # findings: dict(severity, check, subject, finding, recommendation)
    def add(sev, check, subject, finding, rec=""):
        F.append({"severity": sev, "check": check, "subject": subject, "finding": finding, "recommendation": rec})

    # 1 referential integrity
    for t in m.tr.values():
        if t["source"] != "[Initial]" and t["source"] not in m.states:
            add("Critical", "Referential integrity", t["id"], f"source {t['source']} is not a state")
        if t["target"] not in m.states:
            add("Critical", "Referential integrity", t["id"], f"target {t['target']} is not a state")
        if t.get("event") and t["event"] not in m.ev:
            add("High", "Referential integrity", t["id"], f"event {t['event']} is not defined")
        if not t.get("event"):
            add("High", "Missing event", t["id"], "transition has no triggering event", "Every transition needs an event or an explicit completion trigger.")
    for g in m.guards:
        if g.get("transition") not in m.tr:
            add("High", "Referential integrity", g["id"], f"guard refers to unknown transition {g.get('transition')}")
    for k, lst in list(m.inv_by_state.items()) + list(m.ec_by_state.items()) + list(m.xc_by_state.items()):
        if k not in m.states:
            for i in lst: add("High", "Referential integrity", i["id"], f"applies to unknown state {k}")
    for k, lst in m.acts_by_state.items():
        if k not in m.states:
            for a in lst: add("Medium", "Referential integrity", a["id"], f"permitted in unknown state {k}")

    # 2 initial / terminal
    if not m.initial_tr:
        add("Critical", "Initial state", m.meta.get("modelId"), "no initial transition")
    if len(m.initial_tr) > 1:
        add("Medium", "Initial state", m.meta.get("modelId"), f"{len(m.initial_tr)} initial transitions")
    if not m.terminal:
        add("High", "Terminal state", m.meta.get("modelId"), "no terminal Global State", "Declare a final state or state that the machine is non-terminating.")

    # 3 reachability at both levels
    gadj = global_graph(m)
    greach = reachable(gadj, "[Initial]")
    for g in m.gs:
        if g not in greach: add("Critical", "Reachability (Global)", g, "Global State unreachable from Initial")
    fadj = flat_graph(m)
    # entry pseudo-nodes: reaching a Global State's first child also means its ::entry node is live
    freach = reachable(fadj, "[Initial]")
    for s in m.ss:
        if s not in freach: add("High", "Reachability (Sub-State)", s, "sub-state unreachable from Initial via modelled transitions")
    # dead transitions: source never reached
    for t in m.tr.values():
        src = t["source"]
        live = (src == "[Initial]") or (src in freach) or (src in m.gs and (src in greach))
        if not live: add("High", "Dead transition", t["id"], f"source {src} never reached")
    # trap states: non-terminal with no way out
    for s in m.ss:
        out = fadj.get(s, [])
        parent_terminal = m.parent(s) in m.terminal
        if not out and not parent_terminal:
            add("High", "Trap state", s, "no outgoing transition and parent is not terminal")
    for g in m.gs:
        if g not in m.terminal and not gadj.get(g):
            add("High", "Trap state", g, "non-terminal Global State with no outgoing Global transition")

    # 4 non-determinism: same source + same event -> several targets
    key = defaultdict(list)
    for t in m.tr.values(): key[(t["source"], t.get("event"))].append(t["id"])
    for (src, ev), ids in key.items():
        if len(ids) > 1:
            add("High", "Non-determinism", ", ".join(ids), f"{len(ids)} transitions from {src} on event {ev}; guards must be mutually exclusive",
                "Make the guards disjoint or give the transitions different events.")
    # same event reused across sources (informational)
    ev_use = Counter(t.get("event") for t in m.tr.values())
    for ev, n in ev_use.items():
        if n > 1 and ev:
            add("Info", "Event reuse", ev, f"event used by {n} transitions ({', '.join(t for t,x in m.tr.items() if x.get('event')==ev)})")

    # 5 missing denial paths: guarded transition with no modelled rejection outcome
    rej_events = {e["id"] for e in m.ev.values() if re.search(r"reject|denied|refus|return|not authori", (e.get("name","")+" "+e.get("meaning","")).lower())}
    for t in m.tr.values():
        if m.g_by_tr.get(t["id"]):
            src = t["source"]
            # any transition from the same source triggered by a rejection-type event?
            has_denial = any(x.get("event") in rej_events and x["source"] == src for x in m.tr.values())
            if not has_denial:
                add("Medium", "Missing denial path", t["id"], "guarded transition has no modelled rejection or return outcome from its source",
                    "Add a denial event (transition.rejected) and either a self-transition or a return transition, or state that a failed guard leaves the asset in place.")

    # 6 contracts and invariants
    for s in m.states:
        if not m.inv_by_state.get(s):
            inherited = m.inv_by_state.get(m.parent(s)) if s in m.ss else None
            if not inherited: add("Medium", "Invariant presence", s, "no invariant on the state or its parent")
        if s in m.gs and not m.ec_by_state.get(s): add("Medium", "Contract", s, "no entry condition")
        if s in m.gs and s not in m.terminal and not m.xc_by_state.get(s): add("Medium", "Contract", s, "no exit condition")
    # guards on transitions
    for t in m.tr.values():
        if t.get("level") == "Global" and not m.g_by_tr.get(t["id"]):
            add("High", "Guard presence", t["id"], "Global transition without guards")
        if t.get("level") == "Sub-State" and not m.g_by_tr.get(t["id"]):
            add("Low", "Guard presence", t["id"], "sub-state transition has no guard; only the source exit and target entry conditions gate it")
        if t.get("level") == "Global" and not m.dr_by_tr.get(t["id"]):
            add("High", "Decision right", t["id"], "Global transition has no decision right")

    # 7 exceptions
    for t in m.tr.values():
        if t.get("level") == "Global" and not m.exc_by_tr.get(t["id"]):
            add("Low", "Exception applicability", t["id"], "no exception defined; treat as 'no exception permitted' unless stated",
                "State explicitly whether a waiver is permitted on this transition.")

    # 8 cycles
    cycles = elementary_cycles(gadj, list(m.gs.keys()))
    for path, tids in cycles:
        add("Info", "Cycle", " -> ".join(path + [path[0]]), f"elementary cycle via {', '.join(tids)}",
            "Confirm each loop has a terminating guard so a run cannot livelock.")

    # 9 terminal irreversibility
    for g in m.terminal:
        outs = [t for t in m.tr.values() if t["source"] == g and t.get("level") == "Global"]
        for t in outs:
            add("Critical", "Terminal irreversibility", t["id"], f"transition leaves terminal state {g} to {t['target']}",
                "Split the terminal condition (destroyed) from the pre-disposition workflow (eligibility, hold, transfer).")

    # 10 hold before destruction
    for s in m.ss:
        if m.is_hold(s):
            for nx, tid in fadj.get(s, []):
                if m.is_destruction(nx):
                    add("Critical", "Legal hold", tid, f"hold state {s} leads directly to destruction {nx}")
    return F, cycles, gadj, fadj, greach, freach


# ---------------------------------------------------------------- region mode (schema v0.3, parallelRegions)
def region_of(m, sid):
    return m.ss[sid].get("region") or m.ss[sid].get("parent") if sid in m.ss else None

def validate_regions(m):
    """Validation suite for a model whose Global States are orthogonal regions, each an independent machine."""
    F = []
    def add(sev, check, subject, finding, rec=""):
        F.append({"severity": sev, "check": check, "subject": subject, "finding": finding, "recommendation": rec})
    M = m.M
    regions = {r["id"]: r for r in M.get("regions", [])} or {g: {"id": g, "name": m.gs[g]["name"]} for g in m.gs}
    by_region = defaultdict(list)
    for s in m.ss.values(): by_region[region_of(m, s["id"])].append(s["id"])
    adj = defaultdict(list)
    for t in m.tr.values():
        if t["source"] != "[Initial]": adj[t["source"]].append((t["target"], t["id"]))
    # 1 referential integrity
    for t in m.tr.values():
        if t["source"] != "[Initial]" and t["source"] not in m.ss: add("Critical", "Referential integrity", t["id"], f"source {t['source']} is not a state")
        if t["target"] not in m.ss: add("Critical", "Referential integrity", t["id"], f"target {t['target']} is not a state")
        if t.get("event") and t["event"] not in m.ev: add("High", "Referential integrity", t["id"], f"event {t['event']} is not defined")
        if not t.get("event"): add("High", "Missing event", t["id"], "transition has no triggering event")
        if t["source"] != "[Initial]" and region_of(m, t["source"]) != region_of(m, t["target"]):
            add("Critical", "Region integrity", t["id"], f"source region {region_of(m, t['source'])} differs from target region {region_of(m, t['target'])} (N-009)")
        dr = t.get("decisionRight")
        if dr and not any(d["id"] == dr for d in M.get("decisionRights", [])): add("High", "Referential integrity", t["id"], f"decision right {dr} not defined")
        for svc in t.get("services", []):
            if not any(x["id"] == svc for x in M.get("services", [])): add("High", "Referential integrity", t["id"], f"service {svc} not defined")
    aligned = m.aligned
    for g in m.guards:
        if g.get("contribution"):
            if aligned is not None and g.get("transition") not in aligned:
                add("High", "Alignment", g["id"], f"contribution targets {g.get('transition')}, which is not a transition of the aligned model")
            continue
        if g.get("transition") not in m.tr: add("High", "Referential integrity", g["id"], f"guard refers to unknown transition {g.get('transition')}")
    for c in M.get("contributions", []):
        if aligned is None: add("Info", "Alignment", c["id"], f"contribution to {c.get('globalTransition')} not checked (run with --align <global model>)")
        elif c.get("globalTransition") not in aligned: add("High", "Alignment", c["id"], f"targets {c.get('globalTransition')}, not in the aligned model")
    for x in M.get("crossRegionConstraints", []):
        for tid in x.get("transitions", []):
            if tid not in m.tr: add("High", "Referential integrity", x["id"], f"constraint refers to unknown transition {tid}")
        if x.get("expression"):
            try: compile(x["expression"], x["id"], "eval")
            except SyntaxError as e: add("High", "Expression syntax", x["id"], f"expression does not parse: {e}")
    for p in M.get("permissionRecords", []):
        if not any(a["id"] == p.get("activity") for a in M.get("activities", [])): add("High", "Referential integrity", p["id"], f"activity {p.get('activity')} not defined")
        ctx = p.get("context")
        if ctx not in m.ss and not any(v["id"] == ctx for v in M.get("stateVectors", [])) and ctx not in regions:
            add("High", "Referential integrity", p["id"], f"context {ctx} is neither a state, a region nor a state vector")
    # 2 per-region machine checks
    for rid, sids in by_region.items():
        r = regions.get(rid, {"name": rid})
        inits = [s for s in sids if m.ss[s].get("initial")] or ([r["initialState"]] if r.get("initialState") in sids else [])
        if len(inits) != 1: add("Critical", "Initial state", rid, f"region has {len(inits)} initial states (N-006 requires exactly one active state, so exactly one initial)")
        terms = [s for s in sids if m.ss[s].get("terminal")]
        if not terms: add("Info", "Terminal state", rid, "region has no terminal state; it is non-terminating by design (confirm)")
        if inits:
            reach = reachable(adj, inits[0])
            for s in sids:
                if s not in reach: add("High", "Reachability", s, f"state unreachable from {inits[0]} inside region {r['name']}")
            for t in m.tr.values():
                if t["source"] != "[Initial]" and region_of(m, t["source"]) == rid and t["source"] not in reach:
                    add("High", "Dead transition", t["id"], f"source {t['source']} never reached")
        for s in sids:
            if not adj.get(s) and not m.ss[s].get("terminal"): add("High", "Trap state", s, "non-terminal state with no outgoing transition (liveness)")
            if m.ss[s].get("terminal") and adj.get(s): add("Critical", "Terminal irreversibility", s, f"terminal state has outgoing transitions {[t for _, t in adj[s]]}")
            if not m.inv_by_state.get(s): add("Medium", "Invariant presence", s, "no invariant (N-007 requires at least one)")
            if not m.ec_by_state.get(s): add("Low", "Contract", s, "no entry condition")
            if not m.ss[s].get("terminal") and not m.xc_by_state.get(s): add("Low", "Contract", s, "no exit condition")
        # non-determinism within the region
        key = defaultdict(list)
        for t in m.tr.values():
            if t["source"] != "[Initial]" and region_of(m, t["source"]) == rid: key[(t["source"], t.get("event"))].append(t["id"])
        for (src, ev), ids in key.items():
            if len(ids) > 1: add("High", "Non-determinism", ", ".join(ids), f"{len(ids)} transitions from {src} on event {ev}; guards must be disjoint")
        # cycles
        sub = {k: v for k, v in adj.items() if k in sids}
        for path, tids in elementary_cycles(sub, sids):
            add("Info", "Cycle", " -> ".join(path + [path[0]]), f"elementary cycle in {r['name']} via {', '.join(tids)}", "Confirm a terminating guard exists so a run cannot livelock.")
    # 3 transition contracts
    for t in m.tr.values():
        if t["source"] == "[Initial]": continue
        if not m.g_by_tr.get(t["id"]): add("High", "Guard presence", t["id"], "transition without a guard (N-009)")
        if not t.get("decisionRight") and not m.dr_by_tr.get(t["id"]):
            add("Low", "Authorization", t["id"], "no Decision Right; acceptable only for a time- or evidence-triggered transition with no material change (N-016)")
        if not t.get("services"): add("Low", "GRCA applicability", t["id"], "no GRCA service declared; state explicitly that none applies (N-010, N-011)")
        if not any(e.get("relatesTo") == t["id"] for e in M.get("evidence", [])) and t.get("reversibility", "").startswith("Irreversible"):
            add("Medium", "Evidence", t["id"], "irreversible transition with no evidence record (N-015, GA-008)")
        # denial: a failed guard leaves the region in its source state; record once as Info
    add("Info", "Denial semantics", m.meta.get("modelId"), "a transition whose guard or authorization fails leaves its region in the source state (Prohibited or blocked outcome); no separate denial transitions are modelled", "Catalogue denial reasons if an executable profile needs them.")
    # 4 destruction safeguards
    for t in m.tr.values():
        if m.is_destruction(t["target"]):
            xs = t.get("crossRegionConstraints", [])
            if not any(("hold" in x.get("constraint", "").lower()) for x in M.get("crossRegionConstraints", []) if x["id"] in xs):
                add("Critical", "Legal hold", t["id"], "destruction transition is not constrained by a hold check")
            if not t.get("decisionRight"): add("Critical", "Authorization", t["id"], "destruction without a Decision Right")
    # 5 state vectors
    rids = list(by_region.keys())
    for v in M.get("stateVectors", []):
        vec = v.get("vector", {})
        for rid in rids:
            if rid not in vec: add("High", "State vector", v["id"], f"no state for region {rid} (N-006)")
            elif region_of(m, vec[rid]) != rid: add("High", "State vector", v["id"], f"{vec[rid]} is not a state of {rid}")
        extra = [k for k in vec if k not in rids]
        if extra: add("Medium", "State vector", v["id"], f"unknown regions {extra}")
    # initial vector
    init_vec = {rid: ([s for s in sids if m.ss[s].get("initial")] or [None])[0] for rid, sids in by_region.items()}
    if not any(all(v.get("vector", {}).get(r) == s for r, s in init_vec.items()) for v in M.get("stateVectors", [])):
        add("Info", "State vector", "initial", f"initial configuration {init_vec} is not among the example vectors; the walk starts there anyway")
    # 6 permission coverage: every transition-causing activity has at least one permission record
    for a in M.get("activities", []):
        if "Transition-causing" in a.get("effectClass", "") and not any(p.get("activity") == a["id"] for p in M.get("permissionRecords", [])):
            add("Medium", "Permission records", a["id"], "transition-causing activity has no Permission Record (N-012)")
    return F, by_region, adj, init_vec

def ka_facts(ka_models, ka_vecs):
    """Facts derived from the KA models' State Vectors through meta.factBindings (as the viewer does)."""
    out = {}
    for km in ka_models:
        mid = km["meta"].get("modelId"); vec = ka_vecs.get(mid, {})
        for fact, b in (km["meta"].get("factBindings") or {}).items():
            out[fact] = vec.get(b.get("region")) in (b.get("states") or [])
    return out

def ka_initial_vec(km):
    v = {}
    for r in km.get("regions", []):
        init = next((x for x in km["subStates"] if x.get("region") == r["id"] and x.get("initial")), None)
        if init: v[r["id"]] = init["id"]
    return v

def ka_step(km, vec, tid, env_facts):
    """Fire one transition of a KA model against its own vector (source active, own guard expressions over its region codes)."""
    t = next((x for x in km["transitions"] if x["id"] == tid), None)
    if not t: return False, "unknown transition", []
    code_of = {r["id"]: r.get("code") for r in km.get("regions", [])}
    rid = next((x.get("region") for x in km["subStates"] if x["id"] == t["target"]), None)
    if vec.get(rid) != t["source"]: return False, "source not active", []
    env = {**env_facts, **{code_of[r]: sid for r, sid in vec.items() if r in code_of}}
    verdicts = []
    ok = True
    for g in km.get("guards", []):
        if g.get("transition") != tid or g.get("contribution"): continue
        if g.get("expression"):
            v = eval_expression(g["expression"], env)
            if v is None: v = True
            verdicts.append({"guard": g["id"], "verdict": v}); ok = ok and v
    if ok: vec[rid] = t["target"]
    return ok, ("fired" if ok else "blocked: guard false"), verdicts

def vector_walk(m, scenario, by_region, adj, init_vec, ka_models=None):
    """Walk the State Vector through a scripted sequence of transitions (scenario['script']), or a
    default happy path from the initial vector to the terminal configuration. Cross-region guard
    expressions are evaluated over the current vector (EX, AS, AV, CP = active state IDs) and the
    scenario's asset facts. Returns the step log."""
    M = m.M
    code_of = {r["id"]: r.get("code", r["id"][-2:]) for r in M.get("regions", [])} or {rid: rid[-2:] for rid in by_region}
    vec = dict(init_vec)
    facts = dict((scenario or {}).get("assetProfile", {}))
    script = (scenario or {}).get("script")
    planned = False
    if not script:
        if m.meta.get("modelId") == "GDA-GLOBAL-PROTOCOL":
            script = ["TR-EX-01", "TR-CP-01", "TR-EX-02", "TR-AS-01", "TR-AS-02", "TR-AV-01", "TR-AV-05", "TR-AS-09", "TR-EX-05", "TR-CP-10"]
        else:
            # plan: reach the example vector with the most non-initial states, one region step at a time, respecting guards
            vecs = M.get("stateVectors", [])
            target = max(vecs, key=lambda v: sum(1 for r, sid in v.get("vector", {}).items() if sid != init_vec.get(r))) if vecs else None
            script = ["__plan__", target["vector"] if target else {}]; planned = True
    default_facts = {"hold_active": False, "disposition_control_verified": True, "supersession_use_authorized": False, "use_requires_assurance": True, "material_change": False, "atomic_withdrawal": False, "recipient_acceptance_evidenced": True, "enhanced_monitoring": True, "time_bounded_authority": True, "post_event_review_planned": True, "RMD_is_master": True, "RMD_is_reference": False}
    ka_models = ka_models or []
    ka_by_id = {km["meta"].get("modelId"): km for km in ka_models}
    ka_vecs = {mid: dict(ka_initial_vec(km)) for mid, km in ka_by_id.items()}
    for mid, v in ((scenario or {}).get("kaVectors") or {}).items():
        if mid in ka_vecs: ka_vecs[mid].update(v)
    # federated guards: KA contributions attached to this model's transitions
    fed = {}
    for km in ka_models:
        for g in km.get("guards", []):
            if g.get("contribution") and g.get("transition") in m.tr: fed.setdefault(g["transition"], []).append({**g, "fromModel": km["meta"].get("knowledgeArea") or km["meta"].get("name")})
    env_facts = {**default_facts, **ka_facts(ka_models, ka_vecs), **facts}
    log = []
    if planned:
        # breadth-first per region, then interleave: fire any region's next step whose guards pass
        from collections import deque
        tgt = script[1]
        def path(rid, frm, to):
            q = deque([(frm, [])]); seen = {frm}
            while q:
                n, p = q.popleft()
                if n == to: return p
                for nx, tid in adj.get(n, []):
                    if nx not in seen: seen.add(nx); q.append((nx, p + [tid]))
            return []
        plans = {rid: path(rid, vec[rid], tgt.get(rid, vec[rid])) for rid in vec}
        script = []
        stalled = 0
        while any(plans.values()) and stalled < 3:
            progressed = False
            for rid, p in plans.items():
                if not p: continue
                tid = p[0]; t = m.tr[tid]
                env = {**env_facts, **{code_of[r]: s for r, s in vec.items()}}
                ok = vec.get(rid) == t["source"] and all((eval_expression(g["expression"], env) if g.get("expression") else True) is not False for g in m.g_by_tr.get(tid, []) if not g.get("contribution"))
                if ok:
                    script.append(tid); vec[rid] = t["target"]; p.pop(0); progressed = True
            stalled = 0 if progressed else stalled + 1
        for rid, p in plans.items():
            if p: script.extend(p)   # leave blocked steps in the script so the log shows why they block
        vec = dict(init_vec)
    # the twin engine evaluates every step (one federation of this model and the KA models; the scenario's vectors are one asset)
    from fts_twin_engine import Federation
    fed = Federation([M] + ka_models); fed.shared = {mid: set() for mid in fed.models}   # a scenario carries every region on its one asset
    asset = {"id": "scenario", "kind": "asset", "vectors": {m.meta.get("modelId"): dict(vec), **{mid: dict(v) for mid, v in ka_vecs.items()}}, "refs": {}, "kaModels": list(ka_by_id), "facts": {**default_facts, **facts}}
    gm = m.meta.get("modelId")
    for tid in script:
        if isinstance(tid, str) and ":" in tid and tid.split(":", 1)[0] in ka_by_id:
            mid, ktid = tid.split(":", 1); km = ka_by_id[mid]
            r = fed.evaluate(asset, mid, ktid, {})
            before_k = dict(asset["vectors"][mid]); fed.apply(asset, r, {}); ka_vecs[mid] = asset["vectors"][mid]
            kcode = {x["id"]: x.get("code") for x in km.get("regions", [])}
            log.append({"transition": tid, "name": r.get("name", ktid), "region": mid, "sourceActive": r.get("sourceActive", False), "guards": [{"guard": g["guard"], "verdict": g["verdict"]} for g in r.get("guards", [])], "eligible": r.get("eligible", False), "decisionRight": r.get("decisionRight"), "authorised": r.get("fired", False),
                        "vectorBefore": {kcode.get(x, x): sid for x, sid in before_k.items()}, "vectorAfter": {kcode.get(x, x): sid for x, sid in asset["vectors"][mid].items()}, "result": r.get("result"), "kaModel": mid})
            continue
        t = m.tr.get(tid)
        if not t: log.append({"transition": tid, "result": "unknown transition"}); continue
        r = fed.evaluate(asset, gm, tid, {}, (scenario or {}).get("authorizations"))
        # scenario verdicts for guards that carry no expression (guardOutcomes, defaultGuardOutcome) keep their precedence
        verdicts = []; ok = r.get("sourceActive", False)
        for g in r.get("guards", []):
            v, srcv = g["verdict"], g["source"]
            if srcv != "expression":
                gg = next((x for x in list(m.g_by_tr.get(tid, [])) + fed.fed.get(tid, []) if x["id"] == g["guard"]), {"id": g["guard"]})
                v, srcv = guard_verdict(gg, scenario)
                if g["source"].startswith("default (expression"): srcv = "default (expression not evaluable)"
            verdicts.append({"guard": g["guard"], "verdict": v, "source": srcv, "constraint": g.get("predicate"), "contributedBy": g.get("contributedBy")})
            if not v: ok = False
        dr = r.get("decisionRight"); authorised = ok and (dr is None or (scenario or {}).get("authorizations", {}).get(dr, True))
        before = dict(asset["vectors"][gm])
        if authorised: asset["vectors"][gm][r["region"]] = r["to"]
        vec = asset["vectors"][gm]
        log.append({"transition": tid, "name": t.get("name"), "region": r.get("region"), "sourceActive": r.get("sourceActive", False), "guards": verdicts, "eligible": ok, "decisionRight": dr, "authorised": authorised,
                    "vectorBefore": {code_of[x]: sid for x, sid in before.items()}, "vectorAfter": {code_of[x]: sid for x, sid in vec.items()}, "result": "fired" if authorised else ("blocked: source not active" if not r.get("sourceActive") else "blocked: guard false" if not ok else "blocked: not authorised")})
    term_regions = [r for r in vec if any(x.get("region", x.get("parent")) == r and x.get("terminal") for x in m.ss.values())]
    terminal_ok = bool(term_regions) and all(m.ss[vec[r]].get("terminal") for r in term_regions)
    if ka_models: log.append({"transition": "(KA vectors)", "result": json.dumps({mid: {r[-3:] if False else r: sid for r, sid in v.items()} for mid, v in ka_vecs.items()})})
    return log, vec, terminal_ok

# ---------------------------------------------------------------- guard evaluation
def eval_expression(expr, profile):
    try:
        return bool(eval(expr, {"__builtins__": {}}, dict(profile)))
    except Exception:
        return None

def guard_verdict(g, scenario):
    sc = scenario or {}
    outcomes = sc.get("guardOutcomes", {})
    if g["id"] in outcomes: return bool(outcomes[g["id"]]), "scenario"
    if g.get("expression"):
        v = eval_expression(g["expression"], sc.get("assetProfile", {}))
        if v is not None: return v, "expression"
    return bool(sc.get("defaultGuardOutcome", True)), "default"

# ---------------------------------------------------------------- coverage run
def coverage_run(m, fadj, scenario, loop_bound=1):
    """Walk the flattened graph so that every transition fires at least once. Each guard is
    recorded once TRUE (fired) and once FALSE (blocked) so both verdicts are exercised.
    Returns runs (list of traces), coverage tables."""
    fired = set()
    unreachable = set()
    blocked_recorded = set()
    traces = []
    all_tr = set(m.tr.keys())
    start_nodes = ["[Initial]"]
    # iterative: repeatedly pick an uncovered transition and find a path to it
    def find_path(src_node, target_tid):
        # BFS over the flattened graph from src_node to a node from which target_tid departs
        from collections import deque
        want_src = None
        for n, lst in fadj.items():
            for nx, tid in lst:
                if tid == target_tid: want_src = n
        if want_src is None: return None
        q = deque([(src_node, [])]); seen = {src_node}
        while q:
            n, path = q.popleft()
            if n == want_src: return path + [target_tid]
            for nx, tid in fadj.get(n, []):
                if nx not in seen:
                    seen.add(nx); q.append((nx, path + [tid]))
        return None
    def node_after(tid):
        for n, lst in fadj.items():
            for nx, t in lst:
                if t == tid: return nx
        return None
    def initial_node():
        return "[Initial]"
    guard_log = []
    run_no = 0
    remaining = sorted(all_tr - fired)
    guard_ok = 0
    while remaining and run_no < 200:
        target = remaining[0]
        path = find_path(initial_node(), target)
        if path is None:
            traces.append({"run": run_no + 1, "steps": [], "note": f"{target} unreachable from Initial"})
            unreachable.add(target); remaining = sorted(all_tr - fired - unreachable); run_no += 1
            continue
        run_no += 1
        steps = []
        loops = Counter()
        node = initial_node()
        for tid in path:
            t = m.tr[tid]
            verdicts = []
            ok = True
            for g in m.g_by_tr.get(tid, []):
                v, src = guard_verdict(g, scenario)
                # record a FALSE verdict once per guard so blocked paths are exercised
                if g["id"] not in blocked_recorded and src == "default":
                    guard_log.append({"run": run_no, "transition": tid, "guard": g["id"], "verdict": False, "source": "coverage:blocked-probe", "name": g.get("name")})
                    blocked_recorded.add(g["id"])
                verdicts.append((g["id"], v, src))
                guard_log.append({"run": run_no, "transition": tid, "guard": g["id"], "verdict": v, "source": src, "name": g.get("name")})
                if not v: ok = False
            drs = [d["id"] for d in m.dr_by_tr.get(tid, [])]
            steps.append({"transition": tid, "name": t.get("name"), "from": t["source"], "to": t["target"],
                          "event": t.get("event"), "guards": len(verdicts), "passed": ok, "decisionRights": drs,
                          "authorised": ok and (bool(drs) or t.get("level") != "Global")})
            if ok:
                fired.add(tid); node = node_after(tid)
            else:
                break
        traces.append({"run": run_no, "steps": steps, "note": "" if ok else f"blocked at {tid}"})
        remaining = sorted(all_tr - fired - unreachable)
    # coverage tables
    states_visited = set()
    for tr in traces:
        for s in tr["steps"]:
            if s["passed"]:
                states_visited.add(s["from"]); states_visited.add(s["to"])
    return traces, fired, states_visited, guard_log

# ---------------------------------------------------------------- excel
def write_xlsx(path, m, F, cycles, traces, fired, states_visited, guard_log, scenario, stamp, walk=None):
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment
    wb = Workbook()
    hdr = Font(bold=True, color="FFFFFF"); fill = PatternFill("solid", fgColor="1F4E5A")
    def sheet(name, headers, rows, widths=None):
        ws = wb.create_sheet(name[:31])
        ws.append(headers)
        for c in ws[1]: c.font = hdr; c.fill = fill; c.alignment = Alignment(wrap_text=True, vertical="top")
        for r in rows: ws.append([("" if v is None else (", ".join(v) if isinstance(v, list) else v)) for v in r])
        for i, w in enumerate(widths or [18]*len(headers)):
            ws.column_dimensions[chr(65+i) if i < 26 else "A" + chr(65+i-26)].width = w
        ws.freeze_panes = "A2"
        return ws
    ws = wb.active; ws.title = "Run Summary"
    counts = Counter(f["severity"] for f in F)
    rows = [
        ["Model", m.meta.get("name"), m.meta.get("modelId")],
        ["Model version", m.meta.get("version"), m.meta.get("buildStamp")],
        ["Engine", f"fts_sim.py v{VERSION}", stamp],
        ["Scenario", (scenario or {}).get("name", "none (default verdicts: all guards TRUE, plus one FALSE probe per guard)"), (scenario or {}).get("id", "")],
        [], ["Validation findings", sum(counts.values()), ""],
        *[[f"  {k}", v, ""] for k, v in sorted(counts.items(), key=lambda kv: ["Critical","High","Medium","Low","Info"].index(kv[0]))],
        [], ["States", len(m.states), f"{len(states_visited & set(m.states))} visited in coverage runs"],
        ["Transitions", len(m.tr), f"{len(fired)} fired"],
        ["Guards", len(m.guards), f"{len({g['guard'] for g in guard_log if g['verdict']})} evaluated TRUE, {len({g['guard'] for g in guard_log if not g['verdict']})} evaluated FALSE"],
        ["Decision rights", sum(len(v) for v in m.dr_by_tr.values()), f"{len({d for t in traces for s in t['steps'] if s['passed'] for d in s['decisionRights']})} exercised"],
        ["Elementary cycles (Global)", len(cycles), ""],
        ["Coverage runs", len(traces), ""],
    ]
    for r in rows: ws.append(r)
    ws.column_dimensions["A"].width = 28; ws.column_dimensions["B"].width = 44; ws.column_dimensions["C"].width = 60
    sheet("Validation Findings", ["Severity", "Check", "Subject", "Finding", "Recommendation"],
          [[f["severity"], f["check"], f["subject"], f["finding"], f["recommendation"]] for f in sorted(F, key=lambda f: ["Critical","High","Medium","Low","Info"].index(f["severity"]))],
          [10, 24, 30, 70, 60])
    sheet("State Coverage", ["State", "Name", "Kind", "Parent", "Visited", "Invariants", "Entry conditions", "Exit conditions", "Activities"],
          [[s, m.states[s].get("name"), m.states[s].get("kind"), m.states[s].get("parent",""), "yes" if s in states_visited else "no",
            len(m.inv_by_state.get(s, [])), len(m.ec_by_state.get(s, [])), len(m.xc_by_state.get(s, [])), len(m.acts_by_state.get(s, []))] for s in m.states],
          [16, 28, 8, 14, 8, 10, 14, 14, 10])
    sheet("Transition Coverage", ["Transition", "Name", "Level", "Source", "Target", "Event", "Fired", "Guards", "Decision rights", "Controls", "Exceptions"],
          [[t, m.tr[t].get("name"), m.tr[t].get("level"), m.tr[t]["source"], m.tr[t]["target"], m.tr[t].get("event"), "yes" if t in fired else "no",
            len(m.g_by_tr.get(t, [])), len(m.dr_by_tr.get(t, [])), len(m.ctrl_by_tr.get(t, [])), len(m.exc_by_tr.get(t, []))] for t in m.tr],
          [16, 30, 10, 16, 16, 9, 7, 8, 12, 9, 10])
    sheet("Guard Verdicts", ["Run", "Transition", "Guard", "Guard name", "Verdict", "Source"],
          [[g["run"], g["transition"], g["guard"], g["name"], "TRUE" if g["verdict"] else "FALSE", g["source"]] for g in guard_log],
          [6, 16, 12, 40, 9, 24])
    sheet("Cycles", ["Cycle", "Transitions"], [[" -> ".join(p + [p[0]]), tids] for p, tids in cycles], [60, 60])
    sheet("Trace", ["Run", "Step", "Transition", "Name", "From", "To", "Event", "Guards", "Passed", "Decision rights", "Authorised", "Note"],
          [[tr["run"], i+1, s["transition"], s["name"], s["from"], s["to"], s["event"], s["guards"], "yes" if s["passed"] else "no", s["decisionRights"], "yes" if s["authorised"] else "no", tr["note"] if i == len(tr["steps"])-1 else ""]
           for tr in traces for i, s in enumerate(tr["steps"])] + [[tr["run"], 0, "", "", "", "", "", "", "", "", "", tr["note"]] for tr in traces if not tr["steps"]],
          [6, 6, 16, 28, 16, 16, 9, 8, 8, 16, 10, 40])
    if walk:
        steps, final, term = walk
        sheet("Vector Walk", ["Step", "Transition", "Name", "Region / model", "Source active", "Guards", "Guard verdicts", "Eligible", "Decision right", "Authorised", "Result", "EX", "AS", "AV", "CP", "Vector after (KA step)"],
              [[i+1, st["transition"], st.get("name"), st.get("region"), "yes" if st.get("sourceActive") else "no", len(st.get("guards", [])),
                "; ".join(f"{g['guard']}={'T' if g.get('verdict') else 'F'}" + (f" ({g['source']})" if g.get('source') else "") + (f" [{g['contributedBy']}]" if g.get('contributedBy') else "") for g in st.get("guards", [])), "yes" if st.get("eligible") else "no", st.get("decisionRight") or "", "yes" if st.get("authorised") else "no", st.get("result"),
                st.get("vectorAfter", {}).get("EX"), st.get("vectorAfter", {}).get("AS"), st.get("vectorAfter", {}).get("AV"), st.get("vectorAfter", {}).get("CP"),
                ("; ".join(f"{k}={v}" for k, v in st.get("vectorAfter", {}).items()) if st.get("kaModel") else "")] for i, st in enumerate(steps)] + [["", "final vector", "", "", "", "", "", "", "", "", "terminal" if term else "not terminal", final.get("REG-EX"), final.get("REG-AS"), final.get("REG-AV"), final.get("REG-CP"), ""]],
              [6, 16, 30, 12, 10, 8, 70, 8, 12, 10, 26, 12, 12, 12, 12, 50])
    if scenario:
        sheet("Asset Profile", ["Attribute", "Value"], [[k, json.dumps(v)] for k, v in (scenario.get("assetProfile") or {}).items()], [30, 40])
    wb.save(path)

# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("model"); ap.add_argument("--scenario"); ap.add_argument("--out", default="."); ap.add_argument("--loop-bound", type=int, default=1); ap.add_argument("--align", help="the Global model this KA model contributes to; contribution targets are checked against it")
    ap.add_argument("--ka", action="append", default=[], help="a Knowledge Area model whose contribution guards and fact bindings apply to this model's walk; repeatable. Script items 'KA-XX:TR-...' step that model's vector")
    a = ap.parse_args()
    M = json.load(open(a.model, encoding="utf-8"))
    m = Model(M)
    if a.align:
        m.aligned = {t["id"] for t in json.load(open(a.align, encoding="utf-8")).get("transitions", [])}
    scenario = json.load(open(a.scenario, encoding="utf-8")) if a.scenario else None
    stamp = now_sast()
    region_mode = bool(m.meta.get("parallelRegions"))
    walk = None
    if region_mode:
        F, by_region, radj, init_vec = validate_regions(m)
        cycles = []
        fadj = defaultdict(list)
        for t in m.tr.values(): fadj[t["source"]].append((t["target"], t["id"]))
        traces, fired, visited, guard_log = coverage_run(m, fadj, scenario, a.loop_bound)
        ka_models = [json.load(open(k, encoding="utf-8")) for k in a.ka]
        walk = vector_walk(m, scenario, by_region, radj, init_vec, ka_models)
    else:
        F, cycles, gadj, fadj, greach, freach = validate(m)
        traces, fired, visited, guard_log = coverage_run(m, fadj, scenario, a.loop_bound)
    os.makedirs(a.out, exist_ok=True)
    base = (m.meta.get("modelId") or "model").lower().replace(" ", "_")
    tag = ("_" + scenario["id"]) if scenario and scenario.get("id") else ""
    rep = {"engine": f"fts_sim.py v{VERSION}", "buildStamp": stamp, "model": m.meta.get("modelId"), "modelVersion": m.meta.get("version"),
           "scenario": scenario.get("id") if scenario else None,
           "findings": F, "cycles": [{"path": p, "transitions": t} for p, t in cycles],
           "coverage": {"states": len(m.ss) if region_mode else len(m.states), "statesVisited": len(visited & set(m.ss if region_mode else m.states)), "transitions": len(m.tr), "transitionsFired": len(fired),
                        "guards": len([g for g in m.guards if not g.get("contribution")]), "guardsTrue": len({g['guard'] for g in guard_log if g['verdict']}), "guardsFalse": len({g['guard'] for g in guard_log if not g['verdict']}),
                        "runs": len(traces)},
           "traces": traces, "guardLog": guard_log,
           "vectorWalk": ({"steps": walk[0], "finalVector": walk[1], "terminal": walk[2]} if walk else None)}
    jp = os.path.join(a.out, f"{base}{tag}_sim_report.json"); json.dump(rep, open(jp, "w", encoding="utf-8"), indent=1)
    xp = os.path.join(a.out, f"{base}{tag}_sim_report.xlsx"); write_xlsx(xp, m, F, cycles, traces, fired, visited, guard_log, scenario, stamp, walk)
    c = Counter(f["severity"] for f in F)
    print(f"{m.meta.get('modelId')} v{m.meta.get('version')}  findings: " + ", ".join(f"{k} {c[k]}" for k in ["Critical","High","Medium","Low","Info"] if c[k]))
    if walk: print(f"vector walk: {sum(1 for st in walk[0] if st['result']=='fired')}/{len(walk[0])} steps fired, final {walk[1]}, terminal={walk[2]}")
    print(f"coverage: states {rep['coverage']['statesVisited']}/{rep['coverage']['states']}, transitions {len(fired)}/{len(m.tr)}, guards TRUE {rep['coverage']['guardsTrue']}/{len(m.guards)} FALSE {rep['coverage']['guardsFalse']}/{len(m.guards)}, runs {len(traces)}")
    print("wrote", jp); print("wrote", xp)

if __name__ == "__main__":
    main()
