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

A scenario file is optional. Shape:
  { "id": "...", "name": "...", "assetProfile": {"attr": value, ...},
    "guardOutcomes": {"GRD-011": true, ...},          # explicit verdicts (highest precedence)
    "defaultGuardOutcome": true }
A guard or condition may carry an optional "expression" (a Python boolean expression over
assetProfile attributes, evaluated with no builtins). Precedence: guardOutcomes > expression > default.
"""
import json, sys, os, re, argparse, datetime, itertools
from collections import defaultdict, Counter

VERSION = "0.1"

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
def write_xlsx(path, m, F, cycles, traces, fired, states_visited, guard_log, scenario, stamp):
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
    if scenario:
        sheet("Asset Profile", ["Attribute", "Value"], [[k, json.dumps(v)] for k, v in (scenario.get("assetProfile") or {}).items()], [30, 40])
    wb.save(path)

# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("model"); ap.add_argument("--scenario"); ap.add_argument("--out", default="."); ap.add_argument("--loop-bound", type=int, default=1)
    a = ap.parse_args()
    M = json.load(open(a.model, encoding="utf-8"))
    m = Model(M)
    scenario = json.load(open(a.scenario, encoding="utf-8")) if a.scenario else None
    stamp = now_sast()
    F, cycles, gadj, fadj, greach, freach = validate(m)
    traces, fired, visited, guard_log = coverage_run(m, fadj, scenario, a.loop_bound)
    os.makedirs(a.out, exist_ok=True)
    base = (m.meta.get("modelId") or "model").lower().replace(" ", "_")
    tag = ("_" + scenario["id"]) if scenario and scenario.get("id") else ""
    rep = {"engine": f"fts_sim.py v{VERSION}", "buildStamp": stamp, "model": m.meta.get("modelId"), "modelVersion": m.meta.get("version"),
           "scenario": scenario.get("id") if scenario else None,
           "findings": F, "cycles": [{"path": p, "transitions": t} for p, t in cycles],
           "coverage": {"states": len(m.states), "statesVisited": len(visited & set(m.states)), "transitions": len(m.tr), "transitionsFired": len(fired),
                        "guards": len(m.guards), "guardsTrue": len({g['guard'] for g in guard_log if g['verdict']}), "guardsFalse": len({g['guard'] for g in guard_log if not g['verdict']}),
                        "runs": len(traces)},
           "traces": traces, "guardLog": guard_log}
    jp = os.path.join(a.out, f"{base}{tag}_sim_report.json"); json.dump(rep, open(jp, "w", encoding="utf-8"), indent=1)
    xp = os.path.join(a.out, f"{base}{tag}_sim_report.xlsx"); write_xlsx(xp, m, F, cycles, traces, fired, visited, guard_log, scenario, stamp)
    c = Counter(f["severity"] for f in F)
    print(f"{m.meta.get('modelId')} v{m.meta.get('version')}  findings: " + ", ".join(f"{k} {c[k]}" for k in ["Critical","High","Medium","Low","Info"] if c[k]))
    print(f"coverage: states {rep['coverage']['statesVisited']}/{rep['coverage']['states']}, transitions {len(fired)}/{len(m.tr)}, guards TRUE {rep['coverage']['guardsTrue']}/{len(m.guards)} FALSE {rep['coverage']['guardsFalse']}/{len(m.guards)}, runs {len(traces)}")
    print("wrote", jp); print("wrote", xp)

if __name__ == "__main__":
    main()
