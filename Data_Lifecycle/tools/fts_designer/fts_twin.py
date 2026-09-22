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

VERSION = "0.2"

# v0.2 (Howard, 22 Sep 2026, twin structure "two levels"): the Data Asset (a table, dataset, feed or data product) carries the Global
# vector and the per-asset Knowledge Area regions; an entity record inside it (a customer or party golden record) is its own instance
# of kind "record" carrying only the record-level regions below, evaluated against its parent asset's vector and facts. The asset's own
# copy of a record-level region is the roll-up of its records (ROLLUP below), logged as a "rollup" event so the replay shows it.
RECORD_REGIONS = {"KA-RMD": ["REG-RMD-GLD"]}
ROLLUP = {"conflictShare": 0.05, "reliableShare": 0.90, "matchedShare": 0.90}
GLD = {"candidate": "STS-GLD-01", "matched": "STS-GLD-02", "reliable": "STS-GLD-03", "conflict": "STS-GLD-04", "split": "STS-GLD-05", "retired": "STS-GLD-06"}

class Twin:
    def __init__(self, models_dir, db_path):
        self.fed = Federation.load(models_dir); self.store = TwinStore(db_path); self.models_dir = models_dir

    # ---------------------------------------------------------------- intake
    def post_event(self, instance_id, model_id, event=None, transition=None, facts=None, actor=None, at=None, authorizations=None):
        asset = self.store.get_instance(instance_id)
        if not asset or asset.get("kind") != "asset": return {"error": f"no asset instance {instance_id}"}
        if model_id not in self.fed.models: return {"error": f"no model {model_id}"}
        els = self.store.elements()
        if facts:
            asset["facts"] = {**(asset.get("facts") or {}), **facts}
        tids = [transition] if transition else self.fed.transitions_for_event(asset, model_id, event, els)
        if not tids: return {"error": f"event {event} triggers no transition of {model_id}"}
        v = self.fed.evaluate(asset, model_id, tids[0], els, authorizations)
        if v.get("fired"): self.fed.apply(asset, v, els)
        rec = {**v, "instanceId": instance_id, "event": event or self.fed.tr[model_id][tids[0]].get("event"), "actor": actor, "at": at or now_iso(), "override": False,
               "candidates": tids, "factsApplied": facts or {}}
        # the log keeps the verdict compact: the failing guards in full, the passing ones as a count, the region moved rather than whole vectors
        rec["guardCount"] = len(v.get("guards", [])); rec["guards"] = [g for g in v.get("guards", []) if not g.get("verdict")]
        rec.pop("vectorBefore", None); rec["stateAfter"] = self.fed.full_vector(asset, model_id, els).get(v.get("region"))
        asset["updatedAt"] = rec["at"]; self.store.put_instance(asset)
        if v.get("fired") and v.get("sharedRegion") and v.get("elementId") in els:
            el = els[v["elementId"]]; el["updatedAt"] = rec["at"]; self.store.put_instance(el)
        return self.store.log_event(rec)

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

    def post_record_event(self, record_id, model_id, transition, actor=None, at=None):
        rec = self.store.get_instance(record_id)
        if not rec or rec.get("kind") != "record": return {"error": f"no record {record_id}"}
        parent = self.store.get_instance(rec["parentId"]); els = self.store.elements(); view = self._view(rec, parent)
        v = self.fed.evaluate(view, model_id, transition, els)
        if v.get("fired"): self.fed.apply(view, v, els)
        rid = v.get("region")
        if rid in rec["regions"].get(model_id, {}): rec["regions"][model_id][rid] = view["vectors"][model_id][rid]
        out = {**v, "instanceId": record_id, "parentId": rec["parentId"], "event": self.fed.tr[model_id][transition].get("event"), "actor": actor, "at": at or now_iso(), "override": False, "candidates": [transition], "factsApplied": {}}
        out["guardCount"] = len(v.get("guards", [])); out["guards"] = [g for g in v.get("guards", []) if not g.get("verdict")]; out.pop("vectorBefore", None)
        out["stateAfter"] = rec["regions"].get(model_id, {}).get(rid)
        rec["updatedAt"] = out["at"]; self.store.put_instance(rec); logged = self.store.log_event(out)
        self.rollup(rec["parentId"], at=out["at"], cause=record_id)
        return logged

    def records(self, parent_id=None):
        return [r for r in self.store.instances("record") if not parent_id or r["parentId"] == parent_id]

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
        els = self.store.elements(); stats = self.store.event_stats(); rows = []; recs_by = {}
        for r in self.store.instances("record"): recs_by.setdefault(r["parentId"], []).append(r)
        for a in self.store.instances("asset"):
            s = self.fed.summary(a, els); st = stats.get(a["id"], {})
            last = self.store.last_event(a["id"]) if st else None
            rows.append({"id": a["id"], "name": a.get("name"), "assetClass": a.get("assetClass"), "global": s["global"], "kaRegionsMoved": s["kaRegionsMoved"], "kaRegions": s["kaRegions"],
                         "fired": st.get("fired", 0), "refused": st.get("refused", 0), "overrides": st.get("overrides", 0), "lastAt": st.get("lastAt"),
                         "last": ({"transition": last.get("transition"), "name": last.get("name"), "result": last.get("result"), "model": last.get("model")} if last else None),
                         "holdActive": bool((a.get("facts") or {}).get("hold_active")), "updatedAt": a.get("updatedAt"), "records": len(recs_by.get(a["id"], [])), "scope": a.get("scope"), "org": a.get("org")})
        by_state = {}
        for r in rows:
            for code, v in r["global"].items(): by_state.setdefault(code, {}).setdefault(v["name"], 0); by_state[code][v["name"]] += 1
        return {"generatedAt": now_iso(), "engine": f"fts_twin v{VERSION}", "models": len(self.fed.models), "assets": len(rows), "records": sum(len(v) for v in recs_by.values()), "elements": len(els),
                "events": sum(v["fired"] + v["refused"] + v["overrides"] for v in stats.values()), "refused": sum(v["refused"] for v in stats.values()), "overrides": sum(v["overrides"] for v in stats.values()),
                "byGlobalState": by_state, "rows": rows}

    def instance(self, iid):
        a = self.store.get_instance(iid)
        if not a: return None
        if a.get("kind") == "element": return {**a, "stateName": self.fed.state[a["modelId"]].get(a["state"], {}).get("name"), "timeline": []}
        if a.get("kind") == "record": return {**a, "timeline": self.store.timeline(iid)}
        els = self.store.elements(); vectors = {}
        for mid in [GLOBAL_ID] + self.fed.applicable(a):
            vec = self.fed.full_vector(a, mid, els)
            vectors[mid] = {"name": self.fed.models[mid]["meta"].get("knowledgeArea") or self.fed.models[mid]["meta"].get("name"), "regions": [
                {"region": rid, "regionName": self.fed.regions[mid][rid]["name"], "code": self.fed.code_of[mid][rid], "state": sid, "stateName": self.fed.state[mid].get(sid, {}).get("name", sid),
                 "initial": sid == self.fed.initial[mid].get(rid), "shared": rid in self.fed.shared.get(mid, ()), "elementId": a["refs"].get(rid) if rid in self.fed.shared.get(mid, ()) else None} for rid, sid in vec.items()]}
        return {**a, "vectorsResolved": vectors, "facts": self.fed.facts(a, els), "timeline": self.store.timeline(iid), "summary": self.fed.summary(a, els), "records": len(self.records(iid))}

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
                if p.startswith("/instances/"):
                    r = twin.instance(p.split("/", 2)[2]); return self._send(200 if r else 404, r or {"error": "not found"})
                if p == "" or p == "/": return self._send(200, {"service": f"fts_twin v{VERSION}", "models": len(twin.fed.models), "assets": twin.store.count("asset"), "elements": twin.store.count("element")})
                self._send(404, {"error": "no such path"})
            except Exception as ex: self._send(500, {"error": str(ex)})
        def do_POST(self):
            n = int(self.headers.get("Content-Length") or 0); body = json.loads(self.rfile.read(n) or b"{}"); p = urlparse(self.path).path.rstrip("/")
            try:
                if p == "/events": return self._send(200, twin.post_event(body.get("instanceId"), body.get("modelId"), body.get("event"), body.get("transition"), body.get("facts"), body.get("actor"), body.get("at")))
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
    ap = argparse.ArgumentParser(); ap.add_argument("cmd", choices=["serve", "export", "import", "event", "override", "facts", "fleet"])
    ap.add_argument("--models", required=True); ap.add_argument("--db", default="twin.sqlite"); ap.add_argument("--port", type=int, default=8765); ap.add_argument("--export-dir", default="twin")
    ap.add_argument("--instance"); ap.add_argument("--model"); ap.add_argument("--event"); ap.add_argument("--transition"); ap.add_argument("--region"); ap.add_argument("--state"); ap.add_argument("--reason", default=""); ap.add_argument("--actor"); ap.add_argument("--facts")
    a = ap.parse_args(); tw = Twin(a.models, a.db)
    if a.cmd == "serve": serve(tw, a.port, a.export_dir)
    elif a.cmd == "export": print(json.dumps(tw.export(a.export_dir)))
    elif a.cmd == "import": print(json.dumps({"instancesLoaded": tw.store.import_dir(a.export_dir), "events": tw.store.db.execute("select count(*) from events").fetchone()[0]}))
    elif a.cmd == "event": print(json.dumps(tw.post_event(a.instance, a.model, a.event, a.transition, json.loads(a.facts) if a.facts else None, a.actor), indent=1))
    elif a.cmd == "override": print(json.dumps(tw.override(a.instance, a.model, a.region, a.state, a.reason, a.actor), indent=1))
    elif a.cmd == "facts": print(json.dumps(tw.set_facts(a.instance, json.loads(a.facts or "{}"), a.actor), indent=1))
    elif a.cmd == "fleet": f = tw.fleet(); print(json.dumps({k: v for k, v in f.items() if k != "rows"}, indent=1)); print(len(f["rows"]), "assets")

if __name__ == "__main__":
    main()
