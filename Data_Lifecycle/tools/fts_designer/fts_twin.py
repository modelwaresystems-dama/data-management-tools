#!/usr/bin/env python3
"""
fts_twin.py  -  the digital twin: engine plus store plus intake, and the local service the viewer's Twin tab reads.

  python fts_twin.py serve  --models <dir> --db twin.sqlite [--port 8765] [--export-dir <private>/twin]
  python fts_twin.py export --models <dir> --db twin.sqlite --export-dir <private>/twin
  python fts_twin.py import --models <dir> --db twin.sqlite --export-dir <private>/twin     # rebuild the working store from the repo copy
  python fts_twin.py event  --models <dir> --db twin.sqlite --instance CM-000001 --model GDA-GLOBAL-PROTOCOL --event EV-EX-01 [--actor name]
  python fts_twin.py override --models <dir> --db twin.sqlite --instance CM-000001 --model KA-DS --region REG-DS-CLS --state STS-CLS-03 --reason "..." --actor name

The intake (Howard's pick, twin register d2): an event names an instance, a model and an EV-xx (or a transition ID); the engine
finds the transition whose source is active, evaluates every guard including the Knowledge Area contributions, fires or refuses,
and the store logs the verdict either way. An override asserts a region's state directly and is logged with a reason, as the
protocol's exception route is.

The service is the Python standard library's HTTP server (no FastAPI or uvicorn to install); it answers JSON on
  GET  /models            GET /fleet            GET /instances/<id>       GET /elements       GET /events?limit=n
  POST /events  {instanceId, modelId, event | transition, facts?, actor?, at?}
  POST /override {instanceId, modelId, regionId, stateId, reason, actor?, at?}
  POST /facts   {instanceId, facts}          POST /export
with CORS open so fts_viewer.html can read it from a file:// page.
"""
import json, os, sys, argparse, datetime
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fts_twin_engine import Federation, GLOBAL_ID, now_iso
from fts_twin_store import TwinStore

VERSION = "0.3"

# v0.2 (Howard, 22 Sep 2026, twin structure "two levels"): the Data Asset (a table, dataset, feed or data product) carries the Global
# vector and the per-asset Knowledge Area regions; an entity record inside it (a customer or party golden record) is its own instance
# of kind "record" carrying only the record-level regions below, evaluated against its parent asset's vector and facts. The asset's own
# copy of a record-level region is the roll-up of its records (ROLLUP below), logged as a "rollup" event so the replay shows it.
RECORD_REGIONS = {"KA-RMD": ["REG-RMD-GLD"]}
ROLLUP = {"conflictShare": 0.05, "reliableShare": 0.90, "matchedShare": 0.90}
GLD = {"candidate": "STS-GLD-01", "matched": "STS-GLD-02", "reliable": "STS-GLD-03", "conflict": "STS-GLD-04", "split": "STS-GLD-05", "retired": "STS-GLD-06"}

# v0.3 (Howard, 23 Sep 2026, refusal register): a refusal is itself a governance event. Two decisions are wired in here.
#  1 the requester block: every posted event must name the activity that asked for the transition and the role that asked for it,
#    or the twin rejects it before any guard is evaluated. A request with no accountable origin cannot be governed. The requesting
#    system and the purpose are recorded when given. claimsTransition records whether the named activity actually lists this
#    transition in the model, so a requester naming an activity that does not own the transition is visible rather than silent.
#  2 refusals raise a Data Governance Data Issue: one issue per refusal. The issue is its own instance (kind "issue") carrying only
#    REG-DG-ISS, parented to the Data Asset, as the region's own rule requires: exactly one active state per issue case, many issues
#    open on one Data Asset. Severity follows what said no: High when a Non-waivable guard answered false, Medium when a Required
#    one did, and Low (Howard, 23 Sep 2026) when every guard answered true and only the source state was wrong, because "the request
#    should not be allowed on the asset because of the state of the asset. This requires controls to prevent it from happening
#    again": the Low issues are the control gap in whatever system sent the request. A Conditional-only refusal raises nothing.
ISSUE_MODEL = "KA-DG"
ISSUE_REGION = "REG-DG-ISS"
ISSUE_REQUIREMENTS = ("Non-waivable", "Required")
ISSUE_SEVERITY = {"Non-waivable": "High", "Required": "Medium", None: "Low"}
ISSUE_RANK = ["STS-ISS-04", "STS-ISS-03", "STS-ISS-02", "STS-ISS-05", "STS-ISS-01"]   # the asset's own issue state is the most severe of its open issues
ISSUE_OPEN = ("STS-ISS-02", "STS-ISS-03", "STS-ISS-04")
# who the twin itself acts as when it logs, assigns and resolves an issue (the decision-right holders of TR-ISS-01, -02 and -05)
ISSUE_REQ = {"TR-ISS-01": {"activity": "ACT-DG-2.5", "role": "ROLE-BDS", "system": "fts_twin", "purpose": "log a refused transition as a Data Asset issue"},
             "TR-ISS-02": {"activity": "ACT-DG-2.5", "role": "ROLE-CODS", "system": "fts_twin", "purpose": "assign the resolution of a refusal-sourced issue"},
             "TR-ISS-05": {"activity": "ACT-DG-2.5", "role": "ROLE-DO", "system": "fts_twin", "purpose": "record that the refused transition has since fired"}}

class Twin:
    def __init__(self, models_dir, db_path):
        self.fed = Federation.load(models_dir); self.store = TwinStore(db_path); self.models_dir = models_dir
        self.acts = {}
        for mid, m in self.fed.models.items():
            for a in (m.get("activities") or []):
                self.acts[a["id"]] = {"id": a["id"], "name": a.get("name"), "model": mid, "claims": set(a.get("relatedTransitions") or [])}
        try:
            self.roles = {r["id"]: r for r in json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "role_vocabulary.json"), encoding="utf-8"))["roles"]}
        except Exception:
            self.roles = {}

    # ---------------------------------------------------------------- the requester block (Howard, 23 Sep 2026)
    def requester(self, req, model_id=None, transition_id=None):
        """Resolve and validate who asked. Activity and role are required; system and purpose are optional."""
        if not isinstance(req, dict) or not req:
            return None, "no requester: the event must name the activity and the role that asked for the transition"
        act = str(req.get("activity") or "").strip(); role = str(req.get("role") or "").strip()
        missing = [n for n, v in (("activity", act), ("role", role)) if not v]
        if missing: return None, "requester incomplete: " + " and ".join(missing) + " required"
        if act not in self.acts: return None, "unknown activity " + act
        if self.roles and role not in self.roles: return None, "unknown role " + role
        a = self.acts[act]
        return {"activity": act, "activityName": a["name"], "activityModel": a["model"], "role": role,
                "roleName": (self.roles.get(role) or {}).get("name", role), "roleTier": (self.roles.get(role) or {}).get("stewardTier"),
                "system": str(req.get("system") or "").strip() or None, "purpose": str(req.get("purpose") or "").strip() or None,
                "claimsTransition": (transition_id in a["claims"]) if transition_id else None}, None

    # ---------------------------------------------------------------- intake
    def post_event(self, instance_id, model_id, event=None, transition=None, facts=None, actor=None, at=None, authorizations=None, requester=None):
        asset = self.store.get_instance(instance_id)
        if not asset or asset.get("kind") != "asset": return {"error": f"no asset instance {instance_id}"}
        if model_id not in self.fed.models: return {"error": f"no model {model_id}"}
        els = self.store.elements()
        tids = [transition] if transition else self.fed.transitions_for_event(asset, model_id, event, els)
        if not tids: return {"error": f"event {event} triggers no transition of {model_id}"}
        # the requester is checked before anything moves: an event with no accountable origin is rejected, not evaluated
        req, err = self.requester(requester, model_id, tids[0])
        if err:
            return self.store.log_event({"instanceId": instance_id, "model": model_id, "transition": tids[0], "name": self.fed.tr[model_id][tids[0]].get("name"),
                                         "event": event or self.fed.tr[model_id][tids[0]].get("event"), "result": "rejected: " + err, "fired": False, "override": False,
                                         "guards": [], "guardCount": 0, "actor": actor, "at": at or now_iso(), "requester": requester if isinstance(requester, dict) else None})
        if facts:
            asset["facts"] = {**(asset.get("facts") or {}), **facts}
        v = self.fed.evaluate(asset, model_id, tids[0], els, authorizations)
        if v.get("fired"): self.fed.apply(asset, v, els)
        rec = {**v, "instanceId": instance_id, "event": event or self.fed.tr[model_id][tids[0]].get("event"), "actor": actor, "at": at or now_iso(), "override": False,
               "candidates": tids, "factsApplied": facts or {}, "requester": req}
        # the log keeps the verdict compact: the failing guards in full, the passing ones as a count, the region moved rather than whole vectors
        rec["guardCount"] = len(v.get("guards", [])); rec["guards"] = [g for g in v.get("guards", []) if not g.get("verdict")]
        rec.pop("vectorBefore", None); rec["stateAfter"] = self.fed.full_vector(asset, model_id, els).get(v.get("region"))
        asset["updatedAt"] = rec["at"]; self.store.put_instance(asset)
        if v.get("fired") and v.get("sharedRegion") and v.get("elementId") in els:
            el = els[v["elementId"]]; el["updatedAt"] = rec["at"]; self.store.put_instance(el)
        logged = self.store.log_event(rec)
        if v.get("fired"):
            self.resolve_issues(instance_id, model_id, tids[0], at=rec["at"])
        else:
            blocking = [g for g in rec["guards"] if g.get("requirement") in ISSUE_REQUIREMENTS]
            # Low severity (Howard, 23 Sep 2026): a request the asset was in no position to satisfy, with every guard answering true,
            # is a control gap in the requesting system rather than a guard failure, and is raised so it can be monitored and stopped.
            out_of_order = not blocking and not rec.get("sourceActive")
            if blocking or out_of_order: logged["issueRaised"] = (self.raise_issue(instance_id, logged, blocking, at=rec["at"], out_of_order=out_of_order) or {}).get("id")
        return logged

    def override(self, instance_id, model_id, region_id, state_id, reason, actor=None, at=None):
        asset = self.store.get_instance(instance_id)
        if not asset or asset.get("kind") != "asset": return {"error": f"no asset instance {instance_id}"}
        if model_id not in self.fed.models or region_id not in self.fed.regions.get(model_id, {}): return {"error": "unknown model or region"}
        if self.fed.region_of[model_id].get(state_id) != region_id: return {"error": f"{state_id} is not a state of {region_id}"}
        els = self.store.elements(); before = self.fed.full_vector(asset, model_id, els)
        if region_id in self.fed.shared.get(model_id, ()):
            el = els.get(asset["refs"].get(region_id))
            if not el: return {"error": "no element referenced for the shared region"}
            el["state"] = state_id; el["updatedAt"] = at or now_iso(); self.store.put_instance(el)
        else:
            asset["vectors"].setdefault(model_id, {})[region_id] = state_id
        asset["updatedAt"] = at or now_iso(); self.store.put_instance(asset)
        rec = {"instanceId": instance_id, "model": model_id, "region": region_id, "transition": None, "event": None, "to": state_id, "from": before.get(region_id), "name": "override: " + self.fed.state[model_id].get(state_id, {}).get("name", state_id),
               "result": "override", "fired": True, "override": True, "reason": reason, "actor": actor, "at": at or now_iso(), "stateAfter": state_id, "guards": [], "guardCount": 0}
        return self.store.log_event(rec)

    def set_facts(self, instance_id, facts, actor=None, at=None):
        asset = self.store.get_instance(instance_id)
        if not asset: return {"error": f"no asset instance {instance_id}"}
        asset["facts"] = {**(asset.get("facts") or {}), **facts}; asset["updatedAt"] = at or now_iso(); self.store.put_instance(asset)
        return self.store.log_event({"instanceId": instance_id, "model": None, "transition": None, "event": None, "result": "facts", "fired": False, "override": False, "factsApplied": facts, "actor": actor, "at": at or now_iso(), "guards": []})


    # ---------------------------------------------------------------- v0.2 records inside an asset
    def new_record(self, rid, parent_id, name, record_type="Golden Record", at=None):
        parent = self.store.get_instance(parent_id)
        if not parent or parent.get("kind") != "asset": return {"error": f"no asset instance {parent_id}"}
        regions = {mid: {r: self.fed.initial[mid][r] for r in regs} for mid, regs in RECORD_REGIONS.items() if mid in self.fed.applicable(parent)}
        rec = {"id": rid, "kind": "record", "parentId": parent_id, "name": name, "recordType": record_type, "regions": regions, "createdAt": at or now_iso(), "updatedAt": at or now_iso()}
        self.store.put_instance(rec); return rec

    def _view(self, rec, parent):
        v = json.loads(json.dumps(parent))
        for mid, regs in rec["regions"].items(): v["vectors"].setdefault(mid, {}).update(regs)
        return v

    def post_record_event(self, record_id, model_id, transition, actor=None, at=None, requester=None):
        rec = self.store.get_instance(record_id)
        if not rec or rec.get("kind") != "record": return {"error": f"no record {record_id}"}
        req, err = self.requester(requester, model_id, transition)
        if err: return self.store.log_event({"instanceId": record_id, "parentId": rec.get("parentId"), "model": model_id, "transition": transition, "name": self.fed.tr[model_id][transition].get("name"),
                                             "result": "rejected: " + err, "fired": False, "override": False, "guards": [], "guardCount": 0, "actor": actor, "at": at or now_iso(),
                                             "requester": requester if isinstance(requester, dict) else None})
        parent = self.store.get_instance(rec["parentId"]); els = self.store.elements(); view = self._view(rec, parent)
        v = self.fed.evaluate(view, model_id, transition, els)
        if v.get("fired"): self.fed.apply(view, v, els)
        rid = v.get("region")
        if rid in rec["regions"].get(model_id, {}): rec["regions"][model_id][rid] = view["vectors"][model_id][rid]
        out = {**v, "instanceId": record_id, "parentId": rec["parentId"], "event": self.fed.tr[model_id][transition].get("event"), "actor": actor, "at": at or now_iso(), "override": False, "candidates": [transition], "factsApplied": {}, "requester": req}
        out["guardCount"] = len(v.get("guards", [])); out["guards"] = [g for g in v.get("guards", []) if not g.get("verdict")]; out.pop("vectorBefore", None)
        out["stateAfter"] = rec["regions"].get(model_id, {}).get(rid)
        rec["updatedAt"] = out["at"]; self.store.put_instance(rec); logged = self.store.log_event(out)
        # a refusal on a record is a refusal on its Data Asset: the issue is raised against the parent, naming the record
        if not v.get("fired"):
            blocking = [g for g in out["guards"] if g.get("requirement") in ISSUE_REQUIREMENTS]
            ooo = not blocking and not out.get("sourceActive")
            if blocking or ooo:
                iss = self.raise_issue(rec["parentId"], logged, blocking, at=out["at"], out_of_order=ooo, record_id=record_id)
                if iss: logged["issueRaised"] = iss.get("id")
        self.rollup(rec["parentId"], at=out["at"], cause=record_id)
        return logged

    def records(self, parent_id=None):
        return [r for r in self.store.instances("record") if not parent_id or r["parentId"] == parent_id]

    # ---------------------------------------------------------------- v0.3 issues raised by refusals
    def issues(self, parent_id=None, open_only=False):
        out = [i for i in self.store.instances("issue") if not parent_id or i.get("parentId") == parent_id]
        return [i for i in out if i.get("state") in ISSUE_OPEN] if open_only else out

    def raise_issue(self, asset_id, ev, blocking, at=None, out_of_order=False, record_id=None):
        """One Data Governance Data Issue for one refusal, naming the transition asked for, who asked, the decision right and its
        holder, and every Non-waivable or Required guard that answered false with the Knowledge Area that set it. An out-of-order
        request, where every guard answered true and only the source state was wrong, raises a Low severity issue instead."""
        asset = self.store.get_instance(asset_id)
        if not asset or ISSUE_MODEL not in self.fed.applicable(asset): return None
        n = len(self.issues(asset_id)) + 1
        mid = ev.get("model"); dr = (self.fed.dr.get(mid) or {}).get(ev.get("decisionRight")) or {}
        srcs = sorted({g.get("contributedBy") or mid for g in blocking})
        sev = ISSUE_SEVERITY[None] if out_of_order else ("High" if any(g.get("requirement") == "Non-waivable" for g in blocking) else "Medium")
        issue = {"id": f"ISS-{asset_id}-{n:03d}", "kind": "issue", "parentId": asset_id, "assetName": asset.get("name"), "org": asset.get("org"), "scope": asset.get("scope"),
                 "name": (ev.get("name") or ev.get("transition")) + (" asked for out of order on " if out_of_order else " refused on ") + (("record " + record_id + " of ") if record_id else "") + (asset.get("name") or asset_id),
                 "severity": sev, "outOfOrder": bool(out_of_order),
                 "regions": {ISSUE_MODEL: {ISSUE_REGION: self.fed.initial[ISSUE_MODEL][ISSUE_REGION]}},
                 "state": self.fed.initial[ISSUE_MODEL][ISSUE_REGION],
                 "source": {"kind": "refusal", "eventSeq": ev.get("seq"), "model": mid, "transition": ev.get("transition"), "transitionName": ev.get("name"),
                            "region": ev.get("region"), "from": ev.get("from"), "to": ev.get("to"), "result": ev.get("result"), "at": ev.get("at"),
                            "decisionRight": ev.get("decisionRight"), "decisionRightName": dr.get("name"), "holder": dr.get("holder"), "holderName": dr.get("holderName"),
                            "requester": ev.get("requester"), "actor": ev.get("actor"), "sourceKnowledgeAreas": srcs, "sourceActive": ev.get("sourceActive"), "recordId": record_id,
                            "controlGap": ("The transition can only start from " + str(ev.get("from")) + ", and the asset was elsewhere. Every guard answered true, so nothing in the protocol refused it on its merits: the request should not have been sent. The control belongs in the requesting system." if out_of_order else None),
                            "guards": [{k: g.get(k) for k in ("guard", "requirement", "contributedBy", "predicate")} for g in blocking]},
                 "createdAt": at or now_iso(), "updatedAt": at or now_iso()}
        self.store.put_instance(issue)
        reason = ("raised by the twin: " + str(ev.get("transition")) + " was asked for while the asset was not in a state it can start from; every guard answered true"
                  if out_of_order else
                  "raised by the twin: " + str(len(blocking)) + " " + ("guard" if len(blocking) == 1 else "guards") + " of requirement " + ", ".join(sorted({g.get("requirement") or "?" for g in blocking})) + " refused " + str(ev.get("transition")))
        self.post_issue_event(issue["id"], "TR-ISS-01", actor="twin:refusal", at=at, requester=ISSUE_REQ["TR-ISS-01"], reason=reason)
        return self.store.get_instance(issue["id"])

    def post_issue_event(self, issue_id, transition, actor=None, at=None, requester=None, reason=None):
        iss = self.store.get_instance(issue_id)
        if not iss or iss.get("kind") != "issue": return {"error": f"no issue {issue_id}"}
        req, err = self.requester(requester, ISSUE_MODEL, transition)
        if err: return {"error": err}
        parent = self.store.get_instance(iss["parentId"]); els = self.store.elements(); view = self._view(iss, parent)
        v = self.fed.evaluate(view, ISSUE_MODEL, transition, els)
        if v.get("fired"): self.fed.apply(view, v, els)
        rid = v.get("region")
        if rid in iss["regions"].get(ISSUE_MODEL, {}): iss["regions"][ISSUE_MODEL][rid] = view["vectors"][ISSUE_MODEL][rid]
        out = {**v, "instanceId": issue_id, "parentId": iss["parentId"], "event": self.fed.tr[ISSUE_MODEL][transition].get("event"), "actor": actor,
               "at": at or now_iso(), "override": False, "candidates": [transition], "factsApplied": {}, "requester": req, "reason": reason}
        out["guardCount"] = len(v.get("guards", [])); out["guards"] = [g for g in v.get("guards", []) if not g.get("verdict")]; out.pop("vectorBefore", None)
        out["stateAfter"] = iss["regions"].get(ISSUE_MODEL, {}).get(rid)
        iss["state"] = out["stateAfter"]; iss["stateName"] = self.fed.state[ISSUE_MODEL].get(out["stateAfter"], {}).get("name", out["stateAfter"])
        iss["updatedAt"] = out["at"]; self.store.put_instance(iss)
        logged = self.store.log_event(out)
        self.issue_rollup(iss["parentId"], at=out["at"], cause=issue_id)
        return logged

    def resolve_issues(self, asset_id, model_id, transition_id, at=None):
        """When the refused transition later fires, the twin has evidence the blocking conditions were met: it assigns the
        resolution (TR-ISS-02) and records the resolution (TR-ISS-05). Closure, TR-ISS-07, stays a deliberate act of the Data Owner."""
        out = []
        for iss in self.issues(asset_id):
            src = iss.get("source") or {}
            if src.get("transition") != transition_id or src.get("model") != model_id: continue
            if iss.get("state") not in ("STS-ISS-02", "STS-ISS-03"): continue
            if iss.get("state") == "STS-ISS-02":
                self.post_issue_event(iss["id"], "TR-ISS-02", actor="twin:resolution assigned", at=at, requester=ISSUE_REQ["TR-ISS-02"],
                                      reason="the conditions that refused " + str(transition_id) + " are being worked")
                iss = self.store.get_instance(iss["id"])
            if iss.get("state") == "STS-ISS-03":
                out.append(self.post_issue_event(iss["id"], "TR-ISS-05", actor="twin:the refused transition has since fired", at=at, requester=ISSUE_REQ["TR-ISS-05"],
                                                 reason=str(transition_id) + " fired on " + asset_id + ": the guards that refused it now answer true"))
        return out

    def issue_rollup(self, parent_id, at=None, cause=None):
        """the Data Asset's own issue state is the most severe state of its open issues, so CON-DG-04, -05 and -07 keep working"""
        parent = self.store.get_instance(parent_id)
        if not parent or ISSUE_MODEL not in (parent.get("vectors") or {}): return None
        states = [i.get("state") or self.fed.initial[ISSUE_MODEL][ISSUE_REGION] for i in self.issues(parent_id)]
        new = next((x for x in ISSUE_RANK if x in states), self.fed.initial[ISSUE_MODEL][ISSUE_REGION])
        old = parent["vectors"][ISSUE_MODEL].get(ISSUE_REGION)
        if new == old: return None
        parent["vectors"][ISSUE_MODEL][ISSUE_REGION] = new; parent["updatedAt"] = at or now_iso(); self.store.put_instance(parent)
        n = len(self.issues(parent_id, open_only=True))
        return self.store.log_event({"instanceId": parent_id, "model": ISSUE_MODEL, "region": ISSUE_REGION, "transition": None, "event": None,
                                     "name": "roll-up of " + str(n) + " open " + ("issue" if n == 1 else "issues"), "result": "rollup", "fired": True, "override": False,
                                     "from": old, "stateAfter": new, "cause": cause, "actor": "twin:rollup", "at": at or now_iso(), "guards": [], "guardCount": 0,
                                     "reason": "the Data Asset's issue state is the most severe state of the issues open against it"})

    def rollup_state(self, recs):
        """the asset-level Golden Record state from its records: Record Conflict when at least 5% of the active records are in
        conflict; Reliable Record when at least 90% are reliable; Matched Record when at least 90% are matched or reliable;
        otherwise Candidate Record. Retired records are not active; split records count as not yet matched."""
        act = [r["regions"]["KA-RMD"]["REG-RMD-GLD"] for r in recs if "KA-RMD" in r["regions"] and r["regions"]["KA-RMD"]["REG-RMD-GLD"] != GLD["retired"]]
        if not act: return None
        n = len(act); share = lambda *s: sum(1 for x in act if x in s) / n
        if share(GLD["conflict"]) >= ROLLUP["conflictShare"]: return GLD["conflict"]
        if share(GLD["reliable"]) >= ROLLUP["reliableShare"]: return GLD["reliable"]
        if share(GLD["reliable"], GLD["matched"]) >= ROLLUP["matchedShare"]: return GLD["matched"]
        return GLD["candidate"]

    def rollup(self, parent_id, at=None, cause=None):
        parent = self.store.get_instance(parent_id); new = self.rollup_state(self.records(parent_id))
        if not new or "KA-RMD" not in parent["vectors"]: return None
        old = parent["vectors"]["KA-RMD"].get("REG-RMD-GLD")
        if new == old: return None
        parent["vectors"]["KA-RMD"]["REG-RMD-GLD"] = new; parent["updatedAt"] = at or now_iso(); self.store.put_instance(parent)
        recs = self.records(parent_id)
        return self.store.log_event({"instanceId": parent_id, "model": "KA-RMD", "region": "REG-RMD-GLD", "transition": None, "event": None, "name": "roll-up of " + str(len(recs)) + " golden records",
                                     "result": "rollup", "fired": True, "override": False, "from": old, "stateAfter": new, "cause": cause, "actor": "twin:rollup", "at": at or now_iso(), "guards": [], "guardCount": 0,
                                     "reason": "asset-level Golden Record state derived from its records (conflict at 5% or more, reliable at 90% or more, matched at 90% or more)"})

    # ---------------------------------------------------------------- views
    def fleet(self):
        els = self.store.elements(); stats = self.store.event_stats(); rows = []; recs_by = {}; iss_by = {}
        for r in self.store.instances("record"): recs_by.setdefault(r["parentId"], []).append(r)
        for i in self.store.instances("issue"): iss_by.setdefault(i["parentId"], []).append(i)
        for a in self.store.instances("asset"):
            s = self.fed.summary(a, els); st = stats.get(a["id"], {})
            last = self.store.last_event(a["id"]) if st else None
            rows.append({"id": a["id"], "name": a.get("name"), "assetClass": a.get("assetClass"), "global": s["global"], "kaRegionsMoved": s["kaRegionsMoved"], "kaRegions": s["kaRegions"],
                         "fired": st.get("fired", 0), "refused": st.get("refused", 0), "overrides": st.get("overrides", 0), "lastAt": st.get("lastAt"),
                         "last": ({"transition": last.get("transition"), "name": last.get("name"), "result": last.get("result"), "model": last.get("model")} if last else None),
                         "holdActive": bool((a.get("facts") or {}).get("hold_active")), "updatedAt": a.get("updatedAt"), "records": len(recs_by.get(a["id"], [])), "scope": a.get("scope"), "org": a.get("org"),
                         "issues": len(iss_by.get(a["id"], [])), "openIssues": len([i for i in iss_by.get(a["id"], []) if i.get("state") in ISSUE_OPEN]),
                         "rejected": st.get("rejected", 0)})
        by_state = {}
        for r in rows:
            for code, v in r["global"].items(): by_state.setdefault(code, {}).setdefault(v["name"], 0); by_state[code][v["name"]] += 1
        return {"generatedAt": now_iso(), "engine": f"fts_twin v{VERSION}", "models": len(self.fed.models), "assets": len(rows), "records": sum(len(v) for v in recs_by.values()), "elements": len(els),
                "events": sum(v["fired"] + v["refused"] + v["overrides"] for v in stats.values()), "refused": sum(v["refused"] for v in stats.values()), "overrides": sum(v["overrides"] for v in stats.values()),
                "rejected": sum(v.get("rejected", 0) for v in stats.values()),
                "issues": sum(len(v) for v in iss_by.values()), "openIssues": sum(len([i for i in v if i.get("state") in ISSUE_OPEN]) for v in iss_by.values()),
                "byGlobalState": by_state, "rows": rows}

    def instance(self, iid):
        a = self.store.get_instance(iid)
        if not a: return None
        if a.get("kind") == "element": return {**a, "stateName": self.fed.state[a["modelId"]].get(a["state"], {}).get("name"), "timeline": []}
        if a.get("kind") == "record": return {**a, "timeline": self.store.timeline(iid)}
        if a.get("kind") == "issue": return {**a, "stateName": self.fed.state[ISSUE_MODEL].get(a.get("state"), {}).get("name", a.get("state")), "timeline": self.store.timeline(iid)}
        els = self.store.elements(); vectors = {}
        for mid in [GLOBAL_ID] + self.fed.applicable(a):
            vec = self.fed.full_vector(a, mid, els)
            vectors[mid] = {"name": self.fed.models[mid]["meta"].get("knowledgeArea") or self.fed.models[mid]["meta"].get("name"), "regions": [
                {"region": rid, "regionName": self.fed.regions[mid][rid]["name"], "code": self.fed.code_of[mid][rid], "state": sid, "stateName": self.fed.state[mid].get(sid, {}).get("name", sid),
                 "initial": sid == self.fed.initial[mid].get(rid), "shared": rid in self.fed.shared.get(mid, ()), "elementId": a["refs"].get(rid) if rid in self.fed.shared.get(mid, ()) else None} for rid, sid in vec.items()]}
        return {**a, "vectorsResolved": vectors, "facts": self.fed.facts(a, els), "timeline": self.store.timeline(iid), "summary": self.fed.summary(a, els),
                "records": len(self.records(iid)), "issues": self.issues(iid)}

    def models(self):
        return [{"id": mid, "name": m["meta"].get("name"), "knowledgeArea": m["meta"].get("knowledgeArea"), "version": m["meta"].get("version"), "regions": len(m.get("regions", [])), "shared": sorted(self.fed.shared[mid])} for mid, m in self.fed.models.items()]

    def export(self, out_dir):
        return self.store.export(out_dir, self.fleet())

# ---------------------------------------------------------------- service
def serve(twin, port, export_dir):
    class H(BaseHTTPRequestHandler):
        def _send(self, code, obj):
            body = json.dumps(obj).encode("utf-8")
            self.send_response(code); self.send_header("Content-Type", "application/json; charset=utf-8"); self.send_header("Content-Length", str(len(body)))
            self.send_header("Access-Control-Allow-Origin", "*"); self.send_header("Access-Control-Allow-Headers", "Content-Type"); self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); self.end_headers(); self.wfile.write(body)
        def do_OPTIONS(self): self._send(200, {})
        def log_message(self, *a): pass
        def do_GET(self):
            u = urlparse(self.path); p = u.path.rstrip("/"); q = parse_qs(u.query)
            try:
                if p == "/models": return self._send(200, {"service": f"fts_twin v{VERSION}", "models": twin.models()})
                if p == "/fleet": return self._send(200, twin.fleet())
                if p == "/elements": return self._send(200, {"elements": twin.store.instances("element")})
                if p == "/events": return self._send(200, {"events": twin.store.recent(int(q.get("limit", ["200"])[0]))})
                if p == "/issues": return self._send(200, {"issues": twin.issues(q.get("asset", [None])[0], open_only=q.get("open", ["0"])[0] in ("1", "true"))})
                if p.startswith("/instances/"):
                    r = twin.instance(p.split("/", 2)[2]); return self._send(200 if r else 404, r or {"error": "not found"})
                if p == "" or p == "/": return self._send(200, {"service": f"fts_twin v{VERSION}", "models": len(twin.fed.models), "assets": twin.store.count("asset"), "elements": twin.store.count("element")})
                self._send(404, {"error": "no such path"})
            except Exception as ex: self._send(500, {"error": str(ex)})
        def do_POST(self):
            n = int(self.headers.get("Content-Length") or 0); body = json.loads(self.rfile.read(n) or b"{}"); p = urlparse(self.path).path.rstrip("/")
            try:
                if p == "/events": return self._send(200, twin.post_event(body.get("instanceId"), body.get("modelId"), body.get("event"), body.get("transition"), body.get("facts"), body.get("actor"), body.get("at"), requester=body.get("requester")))
                if p == "/issueEvents": return self._send(200, twin.post_issue_event(body.get("issueId"), body.get("transition"), body.get("actor"), body.get("at"), body.get("requester"), body.get("reason")))
                if p == "/override": return self._send(200, twin.override(body.get("instanceId"), body.get("modelId"), body.get("regionId"), body.get("stateId"), body.get("reason") or "", body.get("actor"), body.get("at")))
                if p == "/facts": return self._send(200, twin.set_facts(body.get("instanceId"), body.get("facts") or {}, body.get("actor"), body.get("at")))
                if p == "/export": return self._send(200, twin.export(body.get("dir") or export_dir))
                self._send(404, {"error": "no such path"})
            except Exception as ex: self._send(500, {"error": str(ex)})
    srv = ThreadingHTTPServer(("127.0.0.1", port), H)
    print(f"fts_twin v{VERSION} serving {twin.store.count('asset')} assets, {twin.store.count('element')} elements, {len(twin.fed.models)} models on http://127.0.0.1:{port}/  (Ctrl+C stops; export to {export_dir})")
    try: srv.serve_forever()
    except KeyboardInterrupt: pass

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("cmd", choices=["serve", "export", "import", "event", "override", "facts", "fleet", "issues"])
    ap.add_argument("--models", required=True); ap.add_argument("--db", default="twin.sqlite"); ap.add_argument("--port", type=int, default=8765); ap.add_argument("--export-dir", default="twin")
    ap.add_argument("--instance"); ap.add_argument("--model"); ap.add_argument("--event"); ap.add_argument("--transition"); ap.add_argument("--region"); ap.add_argument("--state"); ap.add_argument("--reason", default=""); ap.add_argument("--actor"); ap.add_argument("--facts")
    ap.add_argument("--activity"); ap.add_argument("--role"); ap.add_argument("--system"); ap.add_argument("--purpose")
    a = ap.parse_args(); tw = Twin(a.models, a.db)
    if a.cmd == "serve": serve(tw, a.port, a.export_dir)
    elif a.cmd == "export": print(json.dumps(tw.export(a.export_dir)))
    elif a.cmd == "import": print(json.dumps({"instancesLoaded": tw.store.import_dir(a.export_dir), "events": tw.store.db.execute("select count(*) from events").fetchone()[0]}))
    elif a.cmd == "event": print(json.dumps(tw.post_event(a.instance, a.model, a.event, a.transition, json.loads(a.facts) if a.facts else None, a.actor,
                                                           requester={"activity": a.activity, "role": a.role, "system": a.system, "purpose": a.purpose}), indent=1))
    elif a.cmd == "issues": print(json.dumps(tw.issues(a.instance), indent=1))
    elif a.cmd == "override": print(json.dumps(tw.override(a.instance, a.model, a.region, a.state, a.reason, a.actor), indent=1))
    elif a.cmd == "facts": print(json.dumps(tw.set_facts(a.instance, json.loads(a.facts or "{}"), a.actor), indent=1))
    elif a.cmd == "fleet": f = tw.fleet(); print(json.dumps({k: v for k, v in f.items() if k != "rows"}, indent=1)); print(len(f["rows"]), "assets")

if __name__ == "__main__":
    main()
