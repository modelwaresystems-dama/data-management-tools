#!/usr/bin/env python3
"""
fts_contracts.py  -  the state and transition contracts every FTS model carries, derived from its transitions (v0.1, 25 Sep 2026).

Howard's State Contracts register (25 Sep 2026), all ten cards option a:
  card 3  an exit condition per way out: the transition, its target, the decision right holder, the guard, the evidence and the
          policy controls. A terminal state keeps "No exit". A spec may replace a state's rows (spec["exitConditions"][stateId]).
  card 4  an entry condition per way in (and the region starting, for the initial state); spec["entryConditions"] overrides.
  card 5  every transition has at least one Required evidence record: the spec's own first; else the evidence of another transition
          into the same target state on the same event (reused, and said so in its trace; 25 Sep 2026: same target alone gave
          Withdraw Content the classification record); else a generated "Record of <transition>" (derived).
          Each evidence record lists every transition it evidences in "transitions"; "relatesTo" keeps the spec's first one.
          The permission records name the evidence of the transition they cause.
  card 7  each transition names its policy controls by policy domain and control number (spec["policyControls"]); every
          control used becomes a control of type "Policy control", worded from the private catalogue
          (spec/policy_controls.json in the private repository, FTS_POLICY_CATALOG); without the catalogue the rows carry
          the domain and number only. The service-mechanism controls stay beside them.
Used by ka_build.py (Knowledge Area models) and protocol_build.py (the Global protocol).
"""
import json, os, re

STATUS = "Proposed / illustrative"
TRID = re.compile(r"\bTR-[A-Z0-9]+(?:-[A-Z0-9]+)*\b")

def load_catalog(path=None):
    path = path or os.environ.get("FTS_POLICY_CATALOG")
    if path and os.path.exists(path):
        try: return json.load(open(path, encoding="utf-8")).get("domains", {})
        except Exception: return {}
    return {}

def _trs(x):
    return TRID.findall(x) if isinstance(x, str) else list(x or [])

def derive(m, spec=None, catalog=None, origin=None):
    spec = spec or {}; catalog = catalog if catalog is not None else load_catalog()
    states = {s["id"]: s for s in m.get("subStates", [])}
    region_of = {s["id"]: (s.get("region") or s.get("parent")) for s in m.get("subStates", [])}
    regions = {r["id"]: r for r in m.get("regions", [])}
    trs = [t for t in m.get("transitions", []) if t.get("source") != "[Initial]" and t.get("level") != "Initial"]
    dr = {d["id"]: d for d in m.get("decisionRights", [])}
    sname = lambda sid: (states.get(sid) or {}).get("name", sid)
    holder = lambda t: (dr.get(t.get("decisionRight")) or {}).get("holderName") or (dr.get(t.get("decisionRight")) or {}).get("holder")
    def row(d, trace):
        d.setdefault("origin", origin or "derived"); d["trace"] = trace; d.setdefault("status", STATUS); return d

    # ---- card 5: evidence for every transition
    ev = m.setdefault("evidence", [])
    for e in ev: e["transitions"] = e.get("transitions") or _trs(e.get("relatesTo"))
    by_tr = {}
    for e in ev:
        for tid in e["transitions"]: by_tr.setdefault(tid, []).append(e)
    reused = generated = 0
    tr_by = {t["id"]: t for t in trs}
    for t in trs:
        if by_tr.get(t["id"]): continue
        cand = [e for e in ev if any((tr_by.get(x) or {}).get("target") == t["target"] and (tr_by.get(x) or {}).get("event") == t.get("event") for x in e["transitions"])]
        if cand:
            e = cand[0]; e["transitions"].append(t["id"]); by_tr.setdefault(t["id"], []).append(e)
            e["trace"] = (e.get("trace", "") + "; derived:reused for " + t["id"] + " (same target state and event, State Contracts card 5)").strip("; "); reused += 1
    ids = [e["id"] for e in ev]
    pfx = (re.match(r"^(.*-)\d+$", ids[0]).group(1) if ids and re.match(r"^(.*-)\d+$", ids[0]) else "EVD-" + (m.get("meta", {}).get("modelId", "X")[3:] + "-" if m.get("meta", {}).get("modelId", "").startswith("KA-") else ""))
    width = max([len(re.search(r"(\d+)$", i).group(1)) for i in ids if re.search(r"(\d+)$", i)] or [2])
    n = max([int(re.search(r"(\d+)$", i).group(1)) for i in ids if re.search(r"(\d+)$", i) and i.startswith(pfx)] or [0])
    for t in trs:
        if by_tr.get(t["id"]): continue
        n += 1; h = holder(t)
        who = (f"the {h} decision under {t['decisionRight']}" if t.get("decisionRight") else "the automatic step (no decision right)")
        e = row({"id": f"{pfx}{n:0{width}d}", "name": "Record of " + t["name"], "evidenceType": "Decision evidence" if t.get("decisionRight") else "System evidence",
                 "relatesTo": t["id"], "transitions": [t["id"]],
                 "description": f"Who requested {t['name']} and under which activity, {who}, the guard verdict and the date, for the move from {sname(t['source'])} to {sname(t['target'])}.",
                 "requirement": "Required", "metadataAsset": True}, "derived:transition evidence (State Contracts card 5, 25 Sep 2026)")
        ev.append(e); by_tr[t["id"]] = [e]; generated += 1
    for p in m.get("permissionRecords", []):
        tids = _trs(p.get("effect", ""))
        if tids and not p.get("evidence"): p["evidence"] = ", ".join(e["id"] for tid in tids for e in by_tr.get(tid, []))

    # ---- card 7: policy controls
    pcmap = spec.get("policyControls") or {}
    ctl = m.setdefault("controls", [])
    for c in ctl:
        c["transitions"] = c.get("transitions") or _trs(c.get("appliesTo", ""))
        c.setdefault("controlType", "Mechanism (control service)")
    pcs = {}; gaps = 0
    for t in trs:
        b = pcmap.get(t["id"])
        if b is None: continue
        t["policyControls"] = []
        for dom, num in b.get("controls", []):
            cid = f"PC-{dom.replace('PD-', '')}-{num}"
            t["policyControls"].append({"control": cid, "domain": dom, "number": num, "why": b.get("why", "")})
            pcs.setdefault(cid, {"domain": dom, "number": num, "transitions": []})["transitions"].append(t["id"])
        if not b.get("controls"): t["policyControlGap"] = b.get("why", "no control of the allowed policy domains fits this step"); gaps += 1
    for cid, x in sorted(pcs.items()):
        d = catalog.get(x["domain"], {}); c = (d.get("controls") or {}).get(x["number"], {})
        ctl.append(row({"id": cid, "name": c.get("name") or f"{x['domain']} {x['number']}", "controlType": "Policy control", "appliesTo": ", ".join(x["transitions"]),
                        "transitions": x["transitions"], "policyDomain": x["domain"], "controlNumber": x["number"], "policyTemplate": d.get("policy"),
                        "theme": c.get("theme"), "procedure": c.get("procedure"), "evidenceArtefact": c.get("artefact"), "minimumEvidence": c.get("evidence"),
                        "frequency": c.get("frequency"), "synthetic": bool(d.get("synthetic")), "objective": c.get("name"), "outcome": c.get("evidence"),
                        "notes": "Wording from the policy catalogue (the FutureState workbooks' template, identical in the three organisations); the twin resolves each organisation's own control, procedure and evidence artefact." if c else "No catalogue loaded: domain and number only."},
                       "spec:policyControls (State Contracts cards 7 and 8, 25 Sep 2026; drafted for review)"))
    ctl_by = {}
    for c in ctl:
        for tid in c["transitions"]: ctl_by.setdefault(tid, []).append(c)

    # ---- cards 3 and 4: entry and exit per way in and way out
    eo, xo = spec.get("entryConditions") or {}, spec.get("exitConditions") or {}
    outs, ins = {}, {}
    for t in trs: outs.setdefault(t["source"], []).append(t); ins.setdefault(t["target"], []).append(t)
    initial = {s["id"] for s in m.get("subStates", []) if s.get("initial")} | {r.get("initialState") for r in regions.values()}
    def contract(t):
        h = holder(t); g = (t.get("guardSummary") or "").strip()
        s = f" when the {h} authorises it ({t['decisionRight']})" if t.get("decisionRight") else " automatically"
        s += (" and its guard holds: " + g.rstrip(".") + "." if g else ".")
        evs = by_tr.get(t["id"], []); pcl = [c["id"] for c in ctl_by.get(t["id"], []) if c.get("controlType") == "Policy control"]
        if evs: s += " Evidence: " + "; ".join(f"{e['name']} ({e['id']})" for e in evs) + "."
        if pcl: s += " Policy controls: " + ", ".join(pcl) + "."
        return s
    ecs, xcs = [], []
    for sid, st in states.items():
        code = sid[4:] if sid.startswith("STS-") else sid
        if sid in eo:
            for k, txt in enumerate(eo[sid] if isinstance(eo[sid], list) else [eo[sid]], 1):
                ecs.append(row({"id": f"EC-{code}-{k}", "appliesTo": sid, "predicate": txt, "requirement": "Required", "conditionType": "State entry", "notes": "Written in the spec."}, "spec:entryConditions"))
        else:
            k = 0
            if sid in initial:
                k += 1; rn = (regions.get(region_of.get(sid)) or {}).get("name", region_of.get(sid))
                ecs.append(row({"id": f"EC-{code}-{k}", "appliesTo": sid, "transition": None, "predicate": f"Entered when the region starts: {rn} begins in {st['name']} when its managed element is first observed.", "requirement": "Required", "conditionType": "Region start", "notes": "Derived from the ways in; the spec may replace it."}, "derived:ways in (State Contracts card 4, 25 Sep 2026)"))
            for t in ins.get(sid, []):
                k += 1
                ecs.append(row({"id": f"EC-{code}-{k}", "appliesTo": sid, "transition": t["id"], "predicate": f"Entered by {t['name']} ({t['id']}) from {sname(t['source'])}" + contract(t), "requirement": "Required", "conditionType": "State entry", "notes": "Derived from the ways in; the spec may replace it."}, "derived:ways in (State Contracts card 4, 25 Sep 2026)"))
            if not k: ecs.append(row({"id": f"EC-{code}-1", "appliesTo": sid, "transition": None, "predicate": "No way in: no transition reaches this state and it is not the region's initial state.", "requirement": "Review", "conditionType": "State entry"}, "derived:ways in"))
        if st.get("terminal"):
            xcs.append(row({"id": f"XC-{code}", "appliesTo": sid, "predicate": "No exit: terminal state.", "requirement": "Not applicable"}, "derived:terminal"))
        elif sid in xo:
            for k, txt in enumerate(xo[sid] if isinstance(xo[sid], list) else [xo[sid]], 1):
                xcs.append(row({"id": f"XC-{code}-{k}", "appliesTo": sid, "predicate": txt, "requirement": "Required", "notes": "Written in the spec."}, "spec:exitConditions"))
        else:
            ways = outs.get(sid, [])
            for k, t in enumerate(ways, 1):
                xcs.append(row({"id": f"XC-{code}-{k}", "appliesTo": sid, "transition": t["id"], "predicate": f"Leaves by {t['name']} ({t['id']}) to {sname(t['target'])}" + contract(t), "requirement": "Required", "notes": "One of the ways out; the state is left when any one of them fires."}, "derived:ways out (State Contracts card 3, 25 Sep 2026)"))
            if not ways: xcs.append(row({"id": f"XC-{code}-1", "appliesTo": sid, "predicate": "No way out: the state is not terminal but no transition leaves it.", "requirement": "Review"}, "derived:ways out"))
    m["entryConditions"], m["exitConditions"] = ecs, xcs
    m.setdefault("meta", {})["contracts"] = {"version": "0.1", "decidedBy": "Howard Diesel, State Contracts register, 25 Sep 2026 (cards 3, 4, 5 and 7, option a)",
        "evidenceReused": reused, "evidenceGenerated": generated, "policyControls": len(pcs), "transitionsMapped": sum(1 for t in trs if t["id"] in pcmap),
        "transitionsWithoutPolicyControl": gaps, "catalogue": bool(catalog)}
    qa = m.setdefault("qaFindings", [])
    for t in trs:
        if t.get("policyControlGap"): qa.append({"severity": "note", "rule": "PC-01", "element": t["id"], "finding": "no policy control governs this step: " + t["policyControlGap"]})
    return m
