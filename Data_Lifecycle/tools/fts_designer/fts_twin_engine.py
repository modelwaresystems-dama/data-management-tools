#!/usr/bin/env python3
"""
fts_twin_engine.py  -  the rules engine of the digital twin: one federation of models, many asset instances.

Howard's decisions (twin register, 22 Sep 2026): the unit of instance is a Data Asset instance plus shared Element instances
(one per governing or platform region, referenced by the assets it governs); state arrives as events evaluated by the engine,
fired or refused, with a steward's assertion recorded as a logged override; the engine is this module, lifted out of the
scenario walker (fts_sim.py), which now calls it, so the scenario runs stay the regression suite.

  fed = Federation.load(models_dir)            # the Global protocol and every KA model, indexed once
  asset = fed.new_asset("CM-000123", "Customer Master record", refs=fed.default_refs(elements))
  v = fed.evaluate(asset, "GDA-GLOBAL-PROTOCOL", "TR-EX-01", elements)   # verdict, nothing changes
  fed.apply(asset, v)                                                    # moves the region when the verdict fired

Instances are plain dicts so the store can persist them as JSON:
  asset   {"id", "kind": "asset", "name", "assetClass", "vectors": {modelId: {regionId: stateId}} (per-asset regions only),
           "refs": {regionId: elementId} (shared regions), "facts": {...}, "createdAt", "updatedAt"}
  element {"id", "kind": "element", "modelId", "regionId", "name", "state": stateId, "createdAt", "updatedAt"}
"""
import json, os, glob, re, datetime

GLOBAL_ID = "GDA-GLOBAL-PROTOCOL"
SHARED_SCOPE = re.compile(r"governed scope|per platform|per database|per warehouse|per master data domain|per data service|per reference data set", re.I)
DEFAULT_FACTS = {"hold_active": False, "disposition_control_verified": True, "supersession_use_authorized": False, "use_requires_assurance": True,
                 "material_change": False, "atomic_withdrawal": False, "recipient_acceptance_evidenced": True, "enhanced_monitoring": True,
                 "time_bounded_authority": True, "post_event_review_planned": True}

def now_iso(): return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=2))).isoformat(timespec="seconds")

def eval_expression(expr, env):
    try: return bool(eval(expr, {"__builtins__": {}}, dict(env)))
    except Exception: return None

class Federation:
    def __init__(self, models):
        self.models = {}
        for m in models:
            mid = (m.get("meta") or {}).get("modelId")
            if mid == GLOBAL_ID or (mid or "").startswith("KA-"): self.models[mid] = m
        self.global_model = self.models.get(GLOBAL_ID)
        self.ka_ids = sorted(k for k in self.models if k != GLOBAL_ID)
        # indexes
        self.tr = {mid: {t["id"]: t for t in m.get("transitions", [])} for mid, m in self.models.items()}
        self.region_of = {mid: {s["id"]: (s.get("region") or s.get("parent")) for s in m.get("subStates", [])} for mid, m in self.models.items()}
        self.state = {mid: {s["id"]: s for s in m.get("subStates", [])} for mid, m in self.models.items()}
        self.code_of = {mid: {r["id"]: r.get("code") or r["id"].split("-")[-1] for r in m.get("regions", [])} for mid, m in self.models.items()}
        self.regions = {mid: {r["id"]: r for r in m.get("regions", [])} for mid, m in self.models.items()}
        self.shared = {mid: {r["id"] for r in m.get("regions", []) if SHARED_SCOPE.search(r.get("instanceScope") or "")} for mid, m in self.models.items()}
        self.initial = {mid: {r["id"]: next((s["id"] for s in m.get("subStates", []) if (s.get("region") or s.get("parent")) == r["id"] and s.get("initial")), r.get("initialState")) for r in m.get("regions", [])} for mid, m in self.models.items()}
        self.guards_by_tr = {mid: {} for mid in self.models}
        self.fed = {}   # Global transition -> contributed guards from the KA models
        for mid, m in self.models.items():
            for g in m.get("guards", []):
                if g.get("contribution"):
                    if g.get("transition") in self.tr.get(GLOBAL_ID, {}): self.fed.setdefault(g["transition"], []).append({**g, "fromModel": mid})
                else: self.guards_by_tr[mid].setdefault(g.get("transition"), []).append(g)
        self.by_event = {mid: {} for mid in self.models}
        for mid, m in self.models.items():
            for t in m.get("transitions", []):
                if t.get("event"): self.by_event[mid].setdefault(t["event"], []).append(t["id"])
        self.dr = {mid: {d["id"]: d for d in m.get("decisionRights", [])} for mid, m in self.models.items()}
        self.evidence_by_tr = {mid: {} for mid in self.models}
        for mid, m in self.models.items():
            for e in m.get("evidence", []): self.evidence_by_tr[mid].setdefault(e.get("relatesTo"), []).append(e["id"])

    @classmethod
    def load(cls, models_dir):
        ms = []
        for f in sorted(glob.glob(os.path.join(models_dir, "*.fts.json"))):
            try: ms.append(json.load(open(f, encoding="utf-8")))
            except Exception: pass
        return cls(ms)

    # ---------------------------------------------------------------- instances
    def new_element(self, eid, model_id, region_id, name=None, state=None):
        return {"id": eid, "kind": "element", "modelId": model_id, "regionId": region_id, "name": name or self.regions[model_id][region_id]["name"],
                "state": state or self.initial[model_id][region_id], "createdAt": now_iso(), "updatedAt": now_iso()}

    def default_elements(self, scope="default"):
        """one element instance per shared region of every KA model, named for the scope"""
        out = []
        for mid in self.ka_ids:
            for rid in self.shared[mid]:
                out.append(self.new_element(f"EL-{scope}-{rid}", mid, rid, f"{self.regions[mid][rid]['name']} ({scope})"))
        return out

    def default_refs(self, elements):
        els = elements.values() if isinstance(elements, dict) else elements
        return {e["regionId"]: e["id"] for e in els if e.get("kind") == "element"}

    def new_asset(self, aid, name, asset_class="Data Asset", refs=None, facts=None, ka_models=None):
        vectors = {GLOBAL_ID: dict(self.initial[GLOBAL_ID])}
        for mid in (ka_models or self.ka_ids):
            vectors[mid] = {rid: sid for rid, sid in self.initial[mid].items() if rid not in self.shared[mid]}
        return {"id": aid, "kind": "asset", "name": name, "assetClass": asset_class, "vectors": vectors, "refs": dict(refs or {}),
                "kaModels": list(ka_models or self.ka_ids), "facts": {**DEFAULT_FACTS, **(facts or {})}, "createdAt": now_iso(), "updatedAt": now_iso()}

    def applicable(self, asset):
        """the KA models whose guards and facts apply to this asset (all of them unless the asset says otherwise)"""
        return [k for k in asset.get("kaModels") or self.ka_ids if k in self.models]

    def full_vector(self, asset, model_id, elements):
        """the asset's own regions plus the shared regions read through its element references"""
        vec = dict(asset["vectors"].get(model_id, {}))
        for rid in self.shared.get(model_id, ()):
            eid = asset["refs"].get(rid); el = elements.get(eid) if eid else None
            if el: vec[rid] = el["state"]
            else: vec.setdefault(rid, self.initial[model_id][rid])
        return vec

    def facts(self, asset, elements):
        """asset facts plus every KA fact derived from the State Vectors through meta.factBindings"""
        env = dict(DEFAULT_FACTS)
        for mid in self.applicable(asset):
            vec = self.full_vector(asset, mid, elements)
            for fact, b in (self.models[mid]["meta"].get("factBindings") or {}).items():
                env[fact] = vec.get(b.get("region")) in (b.get("states") or [])
        env.update(asset.get("facts") or {})   # the asset's own facts last, as the scenario walker orders them
        return env

    # ---------------------------------------------------------------- evaluation
    def evaluate(self, asset, model_id, transition_id, elements, authorizations=None):
        """Verdict for firing one transition of one model on one asset; nothing is changed."""
        t = self.tr.get(model_id, {}).get(transition_id)
        if not t: return {"model": model_id, "transition": transition_id, "result": "unknown transition", "fired": False}
        rid = self.region_of[model_id].get(t["target"])
        vec = self.full_vector(asset, model_id, elements)
        src_active = vec.get(rid) == t["source"]
        env = {**self.facts(asset, elements), **{self.code_of[model_id][r]: s for r, s in vec.items() if r in self.code_of[model_id]}}
        verdicts = []; ok = src_active
        guards = list(self.guards_by_tr[model_id].get(transition_id, []))
        if model_id == GLOBAL_ID: guards += [g for g in self.fed.get(transition_id, []) if g.get("fromModel") in self.applicable(asset)]
        for g in guards:
            if g.get("expression"):
                v = eval_expression(g["expression"], env); src = "expression"
                if v is None: v, src = True, "default (expression not evaluable)"
            else: v, src = True, "default"
            verdicts.append({"guard": g["id"], "verdict": v, "source": src, "requirement": g.get("requirement"), "contributedBy": g.get("fromModel"), "predicate": g.get("predicate") or g.get("constraint")})
            if not v: ok = False
        dr = t.get("decisionRight")
        authorised = ok and (dr is None or (authorizations or {}).get(dr, True))
        shared_region = rid in self.shared.get(model_id, ())
        return {"model": model_id, "transition": transition_id, "name": t.get("name"), "region": rid, "sharedRegion": shared_region,
                "elementId": asset["refs"].get(rid) if shared_region else None, "sourceActive": src_active, "guards": verdicts, "eligible": ok,
                "decisionRight": dr, "authorised": authorised, "from": t["source"], "to": t["target"], "vectorBefore": vec, "evidence": self.evidence_by_tr[model_id].get(transition_id, []),
                "result": "fired" if authorised else ("blocked: source not active" if not src_active else "blocked: guard false" if not ok else "blocked: not authorised"), "fired": authorised}

    def apply(self, asset, verdict, elements):
        """move the region when the verdict fired: on the asset, or on the referenced element for a shared region"""
        if not verdict.get("fired"): return False
        mid, rid, to = verdict["model"], verdict["region"], verdict["to"]
        if verdict.get("sharedRegion"):
            el = elements.get(verdict.get("elementId"))
            if el is None: return False
            el["state"] = to; el["updatedAt"] = now_iso()
        else:
            asset["vectors"].setdefault(mid, {})[rid] = to; asset["updatedAt"] = now_iso()
        return True

    def transitions_for_event(self, asset, model_id, event_id, elements):
        """the transitions of the model this event triggers, the one whose source is active first"""
        ids = self.by_event.get(model_id, {}).get(event_id, [])
        vec = self.full_vector(asset, model_id, elements)
        active = [tid for tid in ids if vec.get(self.region_of[model_id].get(self.tr[model_id][tid]["target"])) == self.tr[model_id][tid]["source"]]
        return active + [tid for tid in ids if tid not in active]

    def summary(self, asset, elements):
        """the Global vector by region code plus the count of non-initial KA regions, for a fleet view"""
        g = self.full_vector(asset, GLOBAL_ID, elements)
        out = {self.code_of[GLOBAL_ID][r]: {"state": s, "name": self.state[GLOBAL_ID].get(s, {}).get("name", s)} for r, s in g.items()}
        moved = 0; total = 0
        for mid in self.applicable(asset):
            for rid, sid in self.full_vector(asset, mid, elements).items():
                total += 1
                if sid != self.initial[mid].get(rid): moved += 1
        return {"global": out, "kaRegionsMoved": moved, "kaRegions": total}
