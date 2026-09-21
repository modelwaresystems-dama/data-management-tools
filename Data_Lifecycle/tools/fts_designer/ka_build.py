#!/usr/bin/env python3
"""
ka_build.py  -  compiles a Knowledge Area FTS spec (orthogonal regions, schema v0.3) into a canonical
.fts.json aligned to the Global Data Asset Protocol.

A KA spec is a Python dict (see dg_spec.py) with:
  meta        modelId, name, knowledgeArea, subjectType, version, note, sources
  context     the captured context diagram: definition, goals, drivers, inputs, processes (with tags and
              sub-activities), deliverables, suppliers, participants, consumers, techniques, tools, metrics
  regions     [(id, name, code, question, initialStateId, regionInvariant, managedElement, extras{})]
              managedElement: the element this region's FTS manages (one FTS per managed element);
              extras: instanceScope, elementKind, contributesTo, conditionsThatMatter, issueSources, ...
  states      [(id, regionId, name, initial, terminal, definition, invariant, contextRefs)]
  transitions [(id, name, source, target, eventId, guardSummary, decisionRight, services, activityRefs)]
  events      {eventId: (name, type)}
  decisionRights {id: (name, holderRole)}
  roles       [(id, name, category, responsibility)]      categories: Supplier | Participant | Consumer
  artefacts   [(id, name, producedIn stateId, producingActivity, evidenceUse)]
  activities  [(id, name, processRef, effectClass, regions [ids], relatedTransitions, services)]
  services    [(id, family, name, trigger, output)]       KA services offered to the Global architecture
  contributions [(id, globalTransition, kind, requiredStates {regionCode:[stateIds]}, predicate, expression, requirement, note)]
  crossRegionConstraints [(id, constraint, transitions, requirement, expression)]
  stateVectors [(id, name, {regionId: stateId}, legality)]
  exceptions, evidence as in protocol_build
Naming QA and relationships follow protocol_build.py.
"""
import json, re, datetime
from collections import Counter

STATUS = "Proposed / illustrative"
def now_sast():
    return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=2))).strftime("%d %b %Y, %H:%M SAST")

VERB_FIRST = re.compile(r"^(Define|Develop|Perform|Engage|Underwrite|Assess|Implement|Sponsor|Co-ordinate|Embed|Approve|Assign|Initiate|Revise|Log|Triage|Escalate|Resolve|Close|Reassess|Activate|Retire|Formulate|Publish|Monitor|Adopt|Establish|Constitute|Confirm|Reopen|Complete|Start|Withdraw|Register|Create|Assess|Operate|Validate|Authorize|Access|Share|Transform|Preserve|Transfer|Suspend|Restore|Supersede|Destroy|Plan|Manage|Use|Retain)\b", re.I)
PARTICIPLE = re.compile(r"\b\w+(ed|en)\b$", re.I)
def name_qa(kind, name):
    if kind == "state":
        if VERB_FIRST.match(name) and not re.search(r"(Model|Strategy|Instruments|Readiness|Programme|Issue|Assessment|Formulation|Execution|Realisation|Revision|Design|Development|Review|Resolution|Closure|Escalation|Triage)\b", name):
            return ("REVIEW", "Verb-led label; a state must name a condition that holds.")
        if PARTICIPLE.search(name): return ("REVIEW", "Participial label; passes only as a persistent resultant condition.")
        return ("PASS", f"Condition noun phrase: “The subject is in {name}” reads as a condition that endures while activities occur.")
    if kind in ("transition", "activity"):
        return ("PASS", "Active verb-object.") if VERB_FIRST.match(name) else ("REVIEW", "Expected an active verb-object name.")
    return ("PASS", "")

def build(spec):
    stamp = now_sast(); meta = dict(spec["meta"])
    srcs = spec.get("sources", [])
    SRC = meta.get("source", "; ".join(s.get("source", "") for s in srcs))
    def row(d, trace, origin=None):
        d.setdefault("origin", origin or SRC); d["trace"] = trace; d.setdefault("status", STATUS); return d
    regions = spec["regions"]; states = spec["states"]; trans = spec["transitions"]
    rcode = {r[0]: r[2] for r in regions}
    region_of = {s[0]: s[1] for s in states}
    m = {"meta": {**meta, "level": "knowledge-area", "schemaVersion": "0.3", "status": STATUS, "parallelRegions": True, "buildStamp": stamp, "generator": "ka_build.py",
                  "protocolLabel": meta.get("name")}}
    m["contextCapture"] = spec.get("context", {})
    m["rules"] = spec.get("rules", [])
    m["lifecycle"] = {"phases": [], "effectClasses": [], "mappingRule": spec.get("mappingRule", "A Knowledge Area process describes work and is never a state of the Knowledge Area; each region names a durable condition of the KA's governed subject, and the KA reaches the Global protocol only through services, predicates, decision rights, controls, events and evidence (GA-005, GA-009).")}
    m["regions"] = [row({"id": r[0], "name": r[1], "code": r[2], "question": r[3], "initialState": r[4], "regionInvariant": r[5], "subject": r[6] if len(r) > 6 else meta.get("subjectType"), "managedElement": r[6] if len(r) > 6 else meta.get("subjectType"), **(r[7] if len(r) > 7 and isinstance(r[7], dict) else {})}, "spec:regions") for r in regions]
    m["globalStates"] = [row({"id": r[0], "name": r[1], "definition": r[3], "kind": "region", "stateType": "Orthogonal State Region (one FTS per managed element)", "initial": False, "terminal": False, "semanticClass": "Region", "nameQA": {"status": "Pass", "rationale": "Region, not a state."}, "retainedRuleIds": ["N-005", "N-006", "GA-010"], "notes": ("Manages: " + r[6]) if len(r) > 6 else ""}, "spec:regions") for r in regions]
    m["meta"]["managedElements"] = [{"region": r[0], "name": r[1], "managedElement": r[6] if len(r) > 6 else meta.get("subjectType"), "instanceScope": (r[7].get("instanceScope", "") if len(r) > 7 and isinstance(r[7], dict) else "")} for r in regions]
    m["subStates"] = []
    for s in states:
        qa = name_qa("state", s[2])
        m["subStates"].append(row({"id": s[0], "name": s[2], "parent": s[1], "region": s[1], "definition": s[5], "initial": s[3], "terminal": s[4], "sequence": int(re.sub(r"\D", "", s[0][-2:]) or 0), "requirement": "Required", "readiness": False, "kind": "sub", "semanticClass": "Condition noun phrase", "nameQA": {"status": qa[0], "rationale": qa[1]}, "retainedRuleIds": ["N-007", "N-008"], "contextRefs": s[7] if len(s) > 7 else [], "notes": ""}, "spec:states; context:" + ", ".join(s[7] if len(s) > 7 else [])))
    m["invariants"] = [row({"id": "INV-" + s[0][4:], "appliesTo": s[0], "predicate": s[6], "severity": "High"}, "spec:states") for s in states]
    m["entryConditions"] = [row({"id": "EC-" + s[0][4:], "appliesTo": s[0], "predicate": f"The condition “{s[5].rstrip('.')}” can be established and its invariant made true.", "requirement": "Required", "conditionType": "State entry", "notes": "Generic; refine into a domain-testable predicate in review."}, "derived:generic entry") for s in states]
    m["exitConditions"] = [row({"id": "XC-" + s[0][4:], "appliesTo": s[0], "predicate": "No exit: terminal state." if s[4] else "The state's invariant has been recorded and a triggering event with a satisfiable guard exists.", "requirement": "Not applicable" if s[4] else "Required"}, "derived:generic exit") for s in states]
    ev = spec["events"]
    m["events"] = [row({"id": k, "name": v[0], "eventType": v[1], "meaning": "Triggers " + ", ".join(t[0] for t in trans if t[4] == k) + "."}, "spec:events") for k, v in ev.items()]
    m["transitions"] = []
    for t in trans:
        m["transitions"].append(row({"id": t[0], "name": t[1], "level": "Sub-State", "region": region_of[t[2]], "source": t[2], "target": t[3], "event": t[4], "transitionType": "Regional State Transition", "transitionKind": "external", "optionality": "Conditional", "guardSummary": t[5], "decisionRight": t[6], "services": t[7] if len(t) > 7 else [], "activityRefs": t[8] if len(t) > 8 else [], "crossRegionConstraints": [x[0] for x in spec.get("crossRegionConstraints", []) if t[0] in x[2]], "reversibility": "Irreversible" if any(s[0] == t[3] and s[4] for s in states) else "Reversible by a further transition", "nameQA": dict(zip(("status", "rationale"), name_qa("transition", t[1])))}, "spec:transitions"))
    for r in regions:
        m["transitions"].append(row({"id": f"TR-INIT-{r[2]}", "name": f"Initialize {r[1]}", "level": "Initial", "region": r[0], "source": "[Initial]", "target": r[4], "event": "EV-INIT", "transitionType": "Initial", "transitionKind": "external", "optionality": "Mandatory", "guardSummary": f"Region {r[1]} starts in {r[4]} when the subject is first observed.", "decisionRight": None, "services": [], "crossRegionConstraints": [], "reversibility": "n/a"}, "spec:regions initial"))
    m["events"].append(row({"id": "EV-INIT", "name": "Subject first observed", "eventType": "Initial", "meaning": "Instantiates the regions at their initial states."}, "builder convention", "builder convention"))
    m["guards"] = [row({"id": "GRD-" + t[0][3:], "name": t[1] + " Guard", "transition": t[0], "predicate": t[5], "scope": "Transition", "requirement": "Required", "expression": None}, "spec:guard summary") for t in trans]
    xrg = spec.get("crossRegionConstraints", [])
    for x in xrg:
        for tid in x[2]:
            m["guards"].append(row({"id": f"GRD-{x[0]}-{tid[3:]}", "name": f"{x[0]} on {tid}", "transition": tid, "predicate": x[1], "scope": "Cross-region", "requirement": x[3], "expression": x[4], "constraint": x[0]}, "spec:crossRegionConstraints"))
    m["crossRegionConstraints"] = [row({"id": x[0], "constraint": x[1], "transitions": x[2], "requirement": x[3], "expression": x[4]}, "spec:crossRegionConstraints") for x in xrg]
    # contributions to the Global protocol: also emitted as guards on the Global transition IDs so the viewer federates them
    contrib = spec.get("contributions", [])
    m["contributions"] = [row({"id": c[0], "globalTransition": c[1], "kind": c[2], "requiredStates": c[3], "predicate": c[4], "expression": c[5], "requirement": c[6], "note": c[7] if len(c) > 7 else ""}, "spec:contributions") for c in contrib]
    for c in contrib:
        if c[2] in ("guard", "decisionRight", "control"):
            m["guards"].append(row({"id": "GRD-" + c[0], "name": f"{meta.get('knowledgeArea')} contribution {c[0]}", "transition": c[1], "predicate": c[4], "scope": f"{meta.get('knowledgeArea')} (federated)", "requirement": c[6], "expression": c[5], "contribution": c[0]}, "spec:contributions"))
    m["kaCouplings"] = [row({"id": k[0], "targetModel": k[1], "targetTransition": k[2], "event": k[3], "expression": k[4], "predicate": k[5], "note": k[6] if len(k) > 6 else ""}, "spec:kaCouplings") for k in spec.get("kaCouplings", [])]
    m["kaInteractions"] = [row({"id": "KAI-" + c[0][4:], "subState": c[1], "knowledgeArea": meta.get("knowledgeArea"), "interactionType": c[2], "applicability": c[6], "description": c[4], "notes": "requires " + json.dumps(c[3])}, "spec:contributions") for c in contrib]
    m["kaMatrix"] = []
    m["stateVectors"] = [row({"id": v[0], "name": v[1], "vector": v[2], "legality": v[3], "vectorType": "Example configuration"}, "spec:stateVectors") for v in spec.get("stateVectors", [])]
    m["compositeStates"] = [{"id": v["id"], "name": v["name"], "globalState": "", "subState": "; ".join(v["vector"].values()), "kaDimensions": "", "context": v["legality"], "vectorType": "State Vector", "origin": SRC, "trace": "alias of stateVectors", "status": STATUS} for v in m["stateVectors"]]
    m["services"] = [row({"id": s[0], "family": s[1], "name": s[2], "trigger": s[3], "output": s[4], "usedByTransitions": [t[0] for t in trans if len(t) > 7 and s[0] in t[7]] + [c[1] for c in contrib if c[2] == "service" and s[0] in (c[5] or "")]}, "spec:services") for s in spec.get("services", [])]
    fam = Counter(s["family"] for s in m["services"])
    m["serviceFamilies"] = [{"family": f, "question": "", "outputs": f"{n} services"} for f, n in fam.items()]
    m["controls"] = [row({"id": s["id"].replace("SVC", "CTRL"), "name": s["name"], "controlType": "Mechanism (control service)", "appliesTo": ", ".join(s["usedByTransitions"]), "objective": s["trigger"], "outcome": s["output"], "service": s["id"]}, "spec:services control family") for s in m["services"] if s["family"] == "Control"]
    m["roles"] = [row({"id": r[0], "name": r[1], "accountability": r[2], "responsibility": r[3], "appliesTo": ""}, "context:role players") for r in spec.get("roles", [])]
    m["decisionRights"] = [row({"id": k, "name": v[0], "holder": v[1], "appliesTo": ", ".join(t[0] for t in trans if t[6] == k) + ("; " + ", ".join(c[1] for c in contrib if c[2] == "decisionRight" and k in (c[4] or "")) if any(c[2] == "decisionRight" and k in (c[4] or "") for c in contrib) else ""), "definition": v[0] + ".", "requirement": "Required", "notes": v[2] if len(v) > 2 else ""}, "spec:decisionRights") for k, v in spec.get("decisionRights", {}).items()]
    m["activities"] = [row({"id": a[0], "name": a[1], "processRef": a[2], "effectClass": a[3], "regions": a[4], "relatedTransitions": a[5], "services": a[6] if len(a) > 6 else [], "lifecyclePhases": [], "permittedIn": "see regions", "activityType": a[3], "nounVerb": "Verb", "permissibility": "Evaluated by the region contracts", "nameQA": dict(zip(("status", "rationale"), name_qa("activity", a[1])))}, "context:" + a[2]) for a in spec.get("activities", [])]
    m["permissionRecords"] = [row({"id": p[0], "activity": p[1], "context": p[2], "outcome": p[3], "guard": p[4], "authority": p[5], "services": p[6], "evidence": p[7], "effect": p[8], "basis": p[9]}, "spec:permissions") for p in spec.get("permissions", [])]
    if not m["permissionRecords"]:
        # derive one Conditional record per (transition-causing activity, source state of a related transition)
        n = 0; tr_by = {t[0]: t for t in trans}
        for a in spec.get("activities", []):
            if "Transition-causing" not in a[3]: continue
            for tid in a[5]:
                t = tr_by.get(tid)
                if not t: continue
                n += 1
                m["permissionRecords"].append(row({"id": f"PRM-{meta['modelId'][3:]}-{n:02d}", "activity": a[0], "context": t[2], "outcome": "Conditional", "guard": t[5], "authority": t[6] or "None", "services": t[7] if len(t) > 7 else [], "evidence": "", "effect": f"Transition-causing ({tid})", "basis": "derived from the related transition's contract"}, "derived:permissions"))
        for a in spec.get("activities", []):
            if "Transition-causing" in a[3]: continue
            n += 1
            m["permissionRecords"].append(row({"id": f"PRM-{meta['modelId'][3:]}-{n:02d}", "activity": a[0], "context": a[4][0] if a[4] else "", "outcome": "Permitted", "guard": "Region invariant holds.", "authority": "None", "services": a[6] if len(a) > 6 else [], "evidence": "", "effect": a[3], "basis": "derived: state-preserving or transition-supporting work permitted in any state of its region"}, "derived:permissions"))
    m["artefacts"] = [row({"id": a[0], "name": a[1], "artefactType": "Deliverable", "producedIn": a[2], "producingActivity": a[3], "evidenceUse": a[4]}, "context:deliverables") for a in spec.get("artefacts", [])]
    m["exceptions"] = [row({"id": x[0], "name": x[1], "transition": x[2], "basis": x[3], "authority": x[4], "conditions": x[5], "statusValues": x[6]}, "spec:exceptions") for x in spec.get("exceptions", [])]
    m["evidence"] = [row({"id": e[0], "name": e[1], "evidenceType": e[2], "relatesTo": e[3], "description": e[4], "requirement": "Required"}, "spec:evidence") for e in spec.get("evidence", [])]
    m["rulesGov"] = spec.get("rulesGov", []); m["conformance"] = spec.get("conformance", []); m["recommendations"] = []; m["editorialDecisions"] = []; m["namingStandard"] = spec.get("namingStandard", [])
    m["sources"] = srcs
    # relationships and trace
    rel = []; n = [0]
    def R(s, typ, t, why=""):
        n[0] += 1; rel.append({"id": f"REL-{n[0]:04d}", "source": s, "type": typ, "target": t, "cardinality": "1..*", "optionality": "Required", "rationale": why, "origin": "derived", "status": STATUS})
    for s in states: R(s[1], "contains", s[0]); R(s[0], "maintains invariant", "INV-" + s[0][4:])
    for t in m["transitions"]:
        if t["source"] != "[Initial]": R(t["id"], "has source", t["source"])
        R(t["id"], "has target", t["target"]); R(t["event"], "triggers", t["id"])
        if t.get("decisionRight"): R(t["id"], "authorized by", t["decisionRight"])
        for s in t.get("services", []): R(t["id"], "requires service", s)
        for a in t.get("activityRefs", []): R(a, "may cause", t["id"])
    for c in m["contributions"]: R(meta["modelId"], "contributes " + c["kind"] + " to", c["globalTransition"], c["predicate"])
    for a in m["artefacts"]: R(a["producedIn"], "produces", a["id"])
    m["relationships"] = rel
    m["derivationTrace"] = [{"elementId": r["id"], "elementType": k, "name": r.get("name") or r.get("predicate") or r.get("constraint", ""), "derivedFrom": r.get("trace", "")} for k in ["regions", "subStates", "transitions", "events", "guards", "contributions", "activities", "artefacts", "roles", "services", "decisionRights"] for r in m[k]]
    # QA
    qa = []
    ids = Counter(x["id"] for k in ["subStates", "globalStates", "transitions", "events", "guards", "services", "decisionRights", "activities", "contributions", "roles", "artefacts"] for x in m[k])
    for i, c in ids.items():
        if c > 1: qa.append({"severity": "warning", "rule": "ID", "element": i, "finding": f"duplicate ID ({c})"})
    for s in m["subStates"]:
        if s["nameQA"]["status"] != "PASS": qa.append({"severity": "note", "rule": "N-007", "element": s["id"], "finding": s["nameQA"]["rationale"]})
    # one FTS per managed element (decision 21 Sep 2026): every region must name what it manages
    for r in m["regions"]:
        if not r.get("managedElement"): qa.append({"severity": "warning", "rule": "N-002 / GA-010", "element": r["id"], "finding": "region does not name the element it manages; each region is its own FTS over one managed element"})
        if not any(s["region"] == r["id"] and s["terminal"] for s in m["subStates"]): qa.append({"severity": "note", "rule": "N-007", "element": r["id"], "finding": "region has no terminal state (non-terminating condition of the managed element; confirm)"})
    for t in m["transitions"]:
        if t["level"] != "Initial" and not t.get("decisionRight"): qa.append({"severity": "warning", "rule": "N-016", "element": t["id"], "finding": "no Decision Right; every KA transition needs one (decision 21 Sep 2026)"})
    for d in m["decisionRights"]:
        if "REVIEW" in (d.get("notes") or ""): qa.append({"severity": "note", "rule": "N-016", "element": d["id"], "finding": d["notes"]})
    for c in m["contributions"]:
        if not c.get("expression"): qa.append({"severity": "note", "rule": "SIM-03", "element": c["id"], "finding": "contribution has no simulator expression; the guard will be answered by the user"})
    m["qaFindings"] = qa + spec.get("qaNotes", [])
    m["meta"]["counts"] = {k: len(m[k]) for k in ["regions", "subStates", "transitions", "events", "guards", "crossRegionConstraints", "contributions", "stateVectors", "activities", "artefacts", "roles", "services", "decisionRights", "permissionRecords", "exceptions", "evidence", "invariants", "relationships"]}
    m["meta"]["qaCounts"] = {"warnings": sum(1 for f in m["qaFindings"] if f["severity"] == "warning"), "notes": sum(1 for f in m["qaFindings"] if f["severity"] == "note")}
    return m
