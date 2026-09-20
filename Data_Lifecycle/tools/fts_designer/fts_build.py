#!/usr/bin/env python3
"""fts_build.py: compile an authored FTS design spec into the canonical .fts.json model.

The spec carries the semantic content the skill drafts (states, predicates, activities,
transitions, governance chain). The compiler does everything mechanical: stable IDs,
KA interactions from KA placement, composite state vectors, the relationship graph,
counts, derivation trace, soft QA findings (the IRDs guide, they do not gate), and the
version and build stamp (SAST).

Usage: python fts_build.py spec.json out.fts.json [--rules ird_rules.json]
"""
import json, sys, re, datetime, zoneinfo, os, argparse

HERE = os.path.dirname(os.path.abspath(__file__))
STATUS = "Proposed / illustrative"

PREFIX = {
    "activities":"ACT", "events":"EV", "transitions":"TR", "entryConditions":"EC", "exitConditions":"XC",
    "invariants":"INV", "guards":"GRD", "kaInteractions":"KAI", "rulesGov":"RULE", "controls":"CTRL",
    "roles":"ROLE", "decisionRights":"DR", "exceptions":"EXC", "artefacts":"ART", "evidence":"EVD",
    "compositeStates":"COMP", "relationships":"REL",
}
LISTS = ["rules","globalStates","subStates","activities","transitions","events","entryConditions","exitConditions",
         "invariants","guards","kaInteractions","kaMatrix","rulesGov","controls","roles","decisionRights","exceptions",
         "artefacts","evidence","compositeStates","relationships"]

KA_STANDARD = ["Data Governance","Data Architecture","Data Modeling and Design","Data Storage and Operations",
               "Data Security","Data Integration and Interoperability","Document and Content Management",
               "Reference and Master Data","Metadata Management","Data Quality","Data Consumption / Analytics",
               "Other applicable KA"]

def now_sast():
    return datetime.datetime.now(zoneinfo.ZoneInfo("Africa/Johannesburg")).strftime("%d %b %Y, %H:%M SAST")

def assign_ids(rows, prefix, width=3):
    """Give every row without an id a sequential id with the prefix."""
    used = {r.get("id") for r in rows if r.get("id")}
    n = 0
    for r in rows:
        if r.get("id"):
            continue
        while True:
            n += 1
            cand = f"{prefix}-{n:0{width}d}"
            if cand not in used:
                break
        r["id"] = cand
        used.add(cand)
    return rows

def build(spec, rules_path=None):
    m = {}
    meta = dict(spec.get("meta", {}))
    meta.setdefault("status", STATUS)
    meta["buildStamp"] = now_sast()
    meta.setdefault("generator", "fts_build.py")
    m["meta"] = meta
    for k in LISTS:
        v = spec.get(k, [])
        m[k] = [] if v in ("derive","inherit",None) else [dict(r) for r in v]

    # rules: inherit the 24 IRDs unless the spec carries its own
    if spec.get("rules", "inherit") == "inherit" or not m["rules"]:
        p = rules_path or os.path.join(HERE, "ird_rules.json")
        if os.path.exists(p):
            m["rules"] = json.load(open(p, encoding="utf-8"))
    extra_rules = spec.get("extraRules", [])
    for r in extra_rules:
        if not any(x["id"] == r["id"] for x in m["rules"]):
            m["rules"].append(r)

    # states
    for s in m["globalStates"]:
        s["kind"] = "global"; s.setdefault("status", STATUS); s.setdefault("stateType", "Composite Global Data State")
        s.setdefault("semanticClass", "Noun / condition"); s.setdefault("retainedRuleIds", ["IRD-001","IRD-002","IRD-021","IRD-024"])
        s.setdefault("nameQA", {"status":"Review", "rationale":"Board working label; state test to be recorded."})
        s.setdefault("initial", False); s.setdefault("terminal", False)
    for s in m["subStates"]:
        s["kind"] = "sub"; s.setdefault("status", STATUS); s.setdefault("semanticClass", "Noun / condition")
        s.setdefault("retainedRuleIds", ["IRD-001","IRD-006","IRD-021"]); s.setdefault("readiness", False)
        s.setdefault("nameQA", {"status":"Pass", "rationale":f"Passes the state test: “The Data Asset is in {s['name']}.”"})
    all_states = m["globalStates"] + m["subStates"]
    sid = {s["id"] for s in all_states}
    by_id = {s["id"]: s for s in all_states}
    def top_of(x):
        s = by_id.get(x); g = 0
        while s and s["kind"] != "global" and s.get("parent") and g < 30:
            s = by_id.get(s["parent"]); g += 1
        return s["id"] if s else None

    # ids and defaults on the other lists
    for k, pre in PREFIX.items():
        if k in ("compositeStates","relationships","kaInteractions"): continue
        assign_ids(m[k], pre)
        for r in m[k]:
            r.setdefault("status", STATUS)
    for a in m["activities"]:
        a.setdefault("activityType", "State-preserving / may support transition"); a.setdefault("nounVerb","Verb"); a.setdefault("permissibility","Permissible")
    for t in m["transitions"]:
        t.setdefault("level", "Global" if (by_id.get(t["source"],{}).get("kind")=="global" and by_id.get(t["target"],{}).get("kind")=="global") else ("Initial" if str(t["source"]).startswith("[") else "Sub-State"))
        t.setdefault("transitionType", "Global State Transition" if t["level"]=="Global" else "Sub-State Transition")
        t.setdefault("optionality", "Conditional")
    for c in m["entryConditions"]:
        c.setdefault("requirement","Required"); c.setdefault("conditionType", "Global entry" if by_id.get(c["appliesTo"],{}).get("kind")=="global" else "Sub-State entry")
    for c in m["exitConditions"]: c.setdefault("requirement","Required")
    for c in m["invariants"]: c.setdefault("severity","High")
    for g in m["guards"]: g.setdefault("requirement","Required"); g.setdefault("scope","Global lifecycle")

    # KA interactions from placement: {KA: {"scope": "...", "stages": "all" | [global ids], "interactionType": optional}}
    placement = spec.get("kaPlacement", {})
    if spec.get("kaInteractions", "derive") == "derive" and placement:
        rows = []
        for ss in sorted(m["subStates"], key=lambda s: (top_of(s["id"]) or "", float(s.get("sequence") or 99))):
            top = top_of(ss["id"])
            for ka, pl in placement.items():
                stages = pl.get("stages", "all")
                if stages != "all" and top not in stages: continue
                itype = pl.get("interactionType") or ss.get("interactionType") or ss["name"]
                rows.append({"subState": ss["id"], "knowledgeArea": ka, "interactionType": itype,
                             "applicability": pl.get("applicability", "Applicable as determined by scope"),
                             "description": f"{ka} {itype} state may contribute predicates, artefacts, controls or evidence to {ss['id']}.",
                             "status": STATUS, "notes": pl.get("notes", "Category-level interaction; detailed KA state defined in the KA FTS."),
                             "trace": f"kaPlacement:{ka}"})
        m["kaInteractions"] = rows
    assign_ids(m["kaInteractions"], "KAI")
    # KA matrix
    if not m["kaMatrix"]:
        subs = [s for s in m["subStates"] if not s.get("readiness")]
        cols = [f"{by_id[top_of(s['id'])]['name']}.{s['name']}" for s in subs]
        for ka in (list(placement.keys()) or KA_STANDARD):
            cells = {}
            for s, col in zip(subs, cols):
                hit = any(k["knowledgeArea"]==ka and k["subState"]==s["id"] for k in m["kaInteractions"])
                cells[col] = "Applicable as determined by scope" if hit else "Not recorded"
            m["kaMatrix"].append({"knowledgeArea": ka, "scopeNote": placement.get(ka,{}).get("scope","Category-level interaction only"), "cells": cells})

    # composite states: one per sub-state (and per global without sub-states)
    if spec.get("compositeStates", "derive") == "derive":
        rows = []
        for ss in m["subStates"]:
            top = top_of(ss["id"])
            kas = sorted({k["knowledgeArea"] for k in m["kaInteractions"] if k["subState"]==ss["id"]})
            dims = "; ".join(f"{k} State" for k in kas if k != "Other applicable KA") + ("; other applicable KA States" if "Other applicable KA" in kas else "")
            rows.append({"name": f"{by_id[top]['name']} / {ss['name']} composite", "globalState": top, "subState": ss["id"],
                         "kaDimensions": dims or "Applicable KA States", "context": f"While the Data Asset occupies {ss['name']}.",
                         "vectorType": "Illustrative vector", "status": STATUS, "trace": "derived:compositeStates"})
        m["compositeStates"] = rows
    assign_ids(m["compositeStates"], "COMP")

    # relationships
    if spec.get("relationships", "derive") == "derive":
        R = []
        def rel(src, typ, tgt, card, opt, why):
            R.append({"source":src, "type":typ, "target":tgt, "cardinality":card, "optionality":opt, "rationale":why, "status":STATUS})
        for s in m["subStates"]:
            if s.get("parent"): rel(s["parent"], "contains", s["id"], "1 to 0..*", "As modeled", "Parent state contains Sub-State; Sub-State inherits parent rules.")
        for c in m["entryConditions"]: rel(c["appliesTo"], "has entry condition", c["id"], "1 to 0..*", c.get("requirement",""), "Predicate required before entry.")
        for c in m["exitConditions"]: rel(c["appliesTo"], "has exit condition", c["id"], "1 to 0..*", c.get("requirement",""), "Predicate required before exit.")
        for c in m["invariants"]: rel(c["appliesTo"], "maintains invariant", c["id"], "1 to 0..*", "Required", "Predicate that must remain true during occupancy.")
        for a in m["activities"]: rel(a["permittedIn"], "permits", a["id"], "1 to 0..*", a.get("permissibility",""), "Permissible activity; state-preserving unless a transition contract is met.")
        for t in m["transitions"]:
            rel(t["id"], "has source", t["source"], "1 to 1", "As modeled", "Transition source.")
            rel(t["id"], "has target", t["target"], "1 to 1", "As modeled", "Transition target.")
            if t.get("event"): rel(t["event"], "triggers", t["id"], "1 to 0..*", t.get("optionality",""), "Event triggers evaluation of the transition.")
        for g in m["guards"]: rel(g["transition"], "constrained by", g["id"], "1 to 0..*", g.get("requirement",""), "Guard predicate on the transition.")
        for a in m["artefacts"]:
            if a.get("producedIn"): rel(a["producedIn"], "produces / modifies", a["id"], "1 to 0..*", "As modeled", "Artefact produced or modified in the state or transition.")
        for e in m["evidence"]:
            if e.get("relatesTo"): rel(e["relatesTo"], "supported by evidence", e["id"], "1 to 0..*", e.get("requirement",""), "Evidence demonstrating satisfaction.")
        for d in m["decisionRights"]:
            if d.get("appliesTo"): rel(d["appliesTo"], "authorized by", d["id"], "1 to 0..*", d.get("requirement",""), "Decision right authorizes the element.")
        for c in m["controls"]:
            if c.get("appliesTo"): rel(c["appliesTo"], "evaluated by", c["id"], "1 to 0..*", "Required", "Control evaluates the element.")
        for x in m["exceptions"]:
            if x.get("transition"): rel(x["transition"], "may be conditionally authorized by", x["id"], "1 to 0..*", "Conditional", "Governed deviation.")
        for k in m["kaInteractions"]: rel(k["subState"], "interacts with KA state category", k["id"], "1 to 0..*", k.get("applicability",""), "Orthogonal KA state category interaction.")
        m["relationships"] = R
    assign_ids(m["relationships"], "REL", 4)

    # derivation trace: every row that carries a trace
    trace = []
    for k in LISTS:
        for r in m[k]:
            if isinstance(r, dict) and r.get("trace"):
                trace.append({"elementId": r.get("id"), "elementType": k, "name": r.get("name") or r.get("predicate") or "", "derivedFrom": r["trace"]})
    m["derivationTrace"] = trace
    if spec.get("contextCapture"): m["contextCapture"] = spec["contextCapture"]
    if spec.get("sources"): m["sources"] = spec["sources"]

    # soft QA (IRDs guide, do not gate)
    m["qaFindings"] = qa(m, by_id, top_of)
    m["meta"]["counts"] = {k: len(m[k]) for k in LISTS}
    m["meta"]["qaCounts"] = {"warnings": sum(1 for f in m["qaFindings"] if f["severity"]=="Warning"), "notes": sum(1 for f in m["qaFindings"] if f["severity"]=="Note")}
    return m

VERB_LEAD = re.compile(r"^(define|develop|perform|implement|embed|create|assess|manage|monitor|plan|design|store|maintain|enhance|use|dispose|source|identify|establish|deliver|conduct|review|approve|validate|integrate)\b", re.I)
PAST = re.compile(r"\b\w+ed$", re.I)

def qa(m, by_id, top_of):
    F = []
    def add(sev, rule, elem, msg): F.append({"severity":sev, "rule":rule, "element":elem, "finding":msg})
    states = m["globalStates"] + m["subStates"]
    ids = [s["id"] for s in states] + [r["id"] for k in PREFIX for r in m.get(k, []) if isinstance(r, dict) and r.get("id")]
    seen = set();
    for i in ids:
        if i in seen: add("Warning","ID","", f"Duplicate ID {i}")
        seen.add(i)
    for s in states:
        n = s["name"]
        board = {x["name"].split()[0].lower() for x in m["globalStates"]}
        if s["kind"]=="sub" and not s.get("readiness") and VERB_LEAD.match(n) and n.split()[0].lower() not in board: add("Warning","IRD-002",s["id"],f"State name '{n}' begins with a verb; states are nouns describing a condition.")
        if PAST.search(n.split()[-1]) and s["kind"]=="sub": add("Note","ADR-02",s["id"],f"State name '{n}' ends in a past-tense form; past-tense completion labels are avoided.")
        if s["kind"]=="global" and (s.get("nameQA",{}).get("status","").lower().startswith("review")): add("Note","IRD-021",s["id"],f"Global State '{n}' carries a REVIEW label; formal state test pending (Board vocabulary retained).")
        ec = [c for c in m["entryConditions"] if c["appliesTo"]==s["id"]]
        xc = [c for c in m["exitConditions"] if c["appliesTo"]==s["id"]]
        inv = [c for c in m["invariants"] if c["appliesTo"]==s["id"]]
        act = [a for a in m["activities"] if a["permittedIn"]==s["id"]]
        if not s.get("readiness"):
            if not ec: add("Warning","IRD-007",s["id"],f"'{n}' has no entry conditions.")
            if not xc: add("Warning","IRD-008",s["id"],f"'{n}' has no exit conditions.")
            if not inv: add("Warning","IRD-009",s["id"],f"'{n}' has no invariants.")
            if not act and s["kind"]=="sub": add("Note","IRD-004",s["id"],f"'{n}' has no permitted activities recorded.")
        # orphan: no transition in or out (except initial-target)
        if not any(t["source"]==s["id"] or t["target"]==s["id"] for t in m["transitions"]) and s["kind"]=="sub":
            add("Warning","IRD-016",s["id"],f"'{n}' has no transitions in or out.")
    for g in m["globalStates"]:
        kids = [s for s in m["subStates"] if s.get("parent")==g["id"]]
        if kids and not any(k.get("readiness") for k in kids): add("Note","Readiness",g["id"],f"'{g['name']}' has sub-states but no readiness sub-state.")
    for t in m["transitions"]:
        if t.get("event") and not any(e["id"]==t["event"] for e in m["events"]): add("Warning","Event",t["id"],f"Transition {t['id']} references unknown event {t['event']}.")
        for end in ("source","target"):
            v = t[end]
            if not str(v).startswith("[") and v not in by_id: add("Warning","ID",t["id"],f"Transition {t['id']} {end} '{v}' is not a state.")
        if t.get("level")=="Global" and not any(g["transition"]==t["id"] for g in m["guards"]):
            add("Warning","IRD-011",t["id"],f"Global transition '{t['name']}' has no guards.")
        if t.get("level")=="Global" and not any(d.get("appliesTo")==t["id"] for d in m["decisionRights"]):
            add("Warning","IRD-012",t["id"],f"Global transition '{t['name']}' has no decision right authorising it.")
    for g in m["guards"]:
        if not any(t["id"]==g["transition"] for t in m["transitions"]): add("Warning","ID",g["id"],f"Guard {g['id']} references unknown transition {g['transition']}.")
    for k in ("entryConditions","exitConditions","invariants","activities"):
        key = "permittedIn" if k=="activities" else "appliesTo"
        for r in m[k]:
            if r[key] not in by_id: add("Warning","ID",r["id"],f"{k} row {r['id']} applies to unknown state {r[key]}.")
    for r in m["rulesGov"]:
        if str(r.get("scope","")).lower() in ("metamodel","editorial"): continue
        if not any(c.get("appliesTo") and (c["appliesTo"]==r["id"] or r["id"] in str(c.get("objective",""))) for c in m["controls"]):
            add("Note","IRD-019",r["id"],f"Rule '{r['name']}' has no control that evaluates it.")
    return F

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec"); ap.add_argument("out"); ap.add_argument("--rules", default=None)
    a = ap.parse_args()
    spec = json.load(open(a.spec, encoding="utf-8"))
    m = build(spec, a.rules)
    json.dump(m, open(a.out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print("Wrote", a.out); print(json.dumps(m["meta"]["counts"], indent=1)); print("QA:", m["meta"]["qaCounts"])
    for f in m["qaFindings"][:40]: print(f"  [{f['severity']}] {f['rule']} {f['element']}: {f['finding']}")
    if len(m["qaFindings"])>40: print(f"  ... {len(m['qaFindings'])-40} more")

if __name__ == "__main__":
    main()
