"""scenario_reorder.py v0.1  -  reorder a scenario script so the Knowledge Area couplings the twin enforces are respected.

Howard, 24 Sep 2026 (Open Decisions D2 option a): the reference scenarios are replaced by the order the couplings force, the originals
kept under scenarios/superseded. A step is deferred until the facts it needs hold, then placed as early as possible, so the script keeps
its own order wherever it can; the deliberate refusals (steps refused with the couplings off) stay where the story put them.

  python scenario_reorder.py <scenario.sim.json> <out.sim.json> --models <private>/models [--ka-only KA-BDA ...]"""
import json, os, sys, copy, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fts_sim
from fts_twin_engine import Federation
args = sys.argv[1:]
scen_path, out_path = args[0], args[1]
P = args[args.index("--models") + 1] if "--models" in args else os.path.expanduser("~/mnt/modelware_app_storage--Data Lifecycle/models")
only = args[args.index("--ka-only") + 1:] if "--ka-only" in args else None
S = json.load(open(scen_path, encoding="utf-8"))
G = json.load(open(P + "/global_protocol.fts.json", encoding="utf-8")); m = fts_sim.Model(G)
kas = []
for f in sorted(glob.glob(P + "/*.fts.json")):
    j = json.load(open(f, encoding="utf-8")); mid = j["meta"]["modelId"]
    if mid.startswith("KA-") and (not only or mid in only): kas.append(j)
F, by_region, radj, init_vec = fts_sim.validate_regions(m)
def fresh(couplings=True):
    fed = Federation([G] + kas); fed.shared = {mid: set() for mid in fed.models}
    if not couplings: fed.coupled = {}   # the order the story had, with the couplings off: its refusals are the deliberate ones
    drop = set(filter(None, os.environ.get("DROP", "").split(",")))
    if drop:
        for k in list(fed.coupled): fed.coupled[k] = [x for x in fed.coupled[k] if not set(x["couplings"]) & drop]
    default_facts = {"hold_active": False, "disposition_control_verified": True, "supersession_use_authorized": False, "use_requires_assurance": True, "material_change": False, "atomic_withdrawal": False, "recipient_acceptance_evidenced": True, "enhanced_monitoring": True, "time_bounded_authority": True, "post_event_review_planned": True, "RMD_is_master": True, "RMD_is_reference": False, "MM_is_metadata_asset": False}
    ka_vecs = {km["meta"]["modelId"]: dict(fts_sim.ka_initial_vec(km)) for km in kas}
    for mid, v in (S.get("kaVectors") or {}).items():
        if mid in ka_vecs: ka_vecs[mid].update(v)
    asset = {"id": "scenario", "kind": "asset", "vectors": {G["meta"]["modelId"]: dict(init_vec), **ka_vecs}, "refs": {}, "kaModels": list(ka_vecs), "facts": {**default_facts, **S.get("assetProfile", {})}}
    return fed, asset
gm = G["meta"]["modelId"]
def step(fed, asset, item):
    if ":" in item and item.split(":", 1)[0] in fed.models:
        mid, t = item.split(":", 1); r = fed.evaluate(asset, mid, t, {}); fed.apply(asset, r, {}); return r.get("fired", False)
    if item not in m.tr: return False
    r = fed.evaluate(asset, gm, item, {}, S.get("authorizations")); ok = r.get("sourceActive", False)
    for g in r.get("guards", []):
        v = g["verdict"]
        if g["source"] != "expression":
            gg = next((x for x in list(m.g_by_tr.get(item, [])) + fed.fed.get(item, []) if x["id"] == g["guard"]), {"id": g["guard"]})
            v, _ = fts_sim.guard_verdict(gg, S)
        if not v: ok = False
    dr = r.get("decisionRight"); auth = ok and (dr is None or S.get("authorizations", {}).get(dr, True))
    if auth: asset["vectors"][gm][r["region"]] = r["to"]
    return auth
script = [x for x in S["script"] if isinstance(x, str)]
assert len(script) == len(S["script"]), "non-string script items"
fed, asset = fresh(False); base = [step(fed, asset, x) for x in script]
deliberate = {i for i, ok in enumerate(base) if not ok}
fed, asset = fresh(True); before = sum(step(fed, asset, x) for x in script)
fed, asset = fresh(True)
pending = list(range(len(script))); order = []
while pending:
    placed = False
    for i in pending:
        if i in deliberate:
            if all(j in deliberate or j not in pending for j in range(i)):
                step(fed, asset, script[i]); order.append(i); pending.remove(i); placed = True; break
            continue
        f2, a2 = fed, copy.deepcopy(asset)
        if step(f2, a2, script[i]):
            asset = a2; order.append(i); pending.remove(i); placed = True; break
    if not placed:
        for i in pending: step(fed, asset, script[i]); order.append(i)
        break
new = [script[i] for i in order]
fed, asset = fresh(True); after = [step(fed, asset, x) for x in new]
stuck = [new[k] for k, ok in enumerate(after) if not ok and order[k] not in deliberate]
moved = sum(1 for k, i in enumerate(order) if k != i)
print(f"{S['id']}: {len(script)} steps, deliberate refusals {len(deliberate)} {[script[i] for i in sorted(deliberate)]}; fired before {before}, after {sum(after)}; moved {moved}; still refused {stuck}")
S2 = dict(S); S2["script"] = new
S2["reorderedOn"] = "24 Sep 2026 (Open Decisions D2 option a): steps reordered by scenario_reorder.py so the Knowledge Area couplings the twin enforces are met; deliberate refusals kept in place; the original is in scenarios/superseded"
json.dump(S2, open(out_path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
