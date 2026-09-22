#!/usr/bin/env python3
"""
fts_twin_fleet.py  -  a synthetic fleet for the digital twin, generated from a federated scenario through the twin engine.

  python fts_twin_fleet.py --models <dir> --scenario <banking.sim.json> --db twin.sqlite --n 120 [--seed 1] [--days 180] [--scope bank]

Howard's pick (twin register d5, phase 1): 50 to 200 Customer Master instances from the banking scenario with randomised
timing and a share of refused events and holds, so the machinery (many instances, events, refusals, holds, overrides,
evidence) is proven before a real adapter exists. Every step goes through Federation.evaluate, so a refusal is a real
refusal by the guards, not a label.

How the fleet is made:
  1. one set of shared Element instances for the scope (strategy, policies, programmes, platforms, architectures) is created
     and the scenario's shared-region steps are applied to them once, in order, as the governing set-up;
  2. each asset instance replays the scenario's per-asset steps up to a random cut point (about one in five completes the
     story), each step stamped at a random interval after the previous one, starting on a random day in the window;
  3. one in three assets receives one out-of-order event (a release attempted before assurance, a use before the privacy
     basis, a destruction under an active hold) which the guards refuse and the log records;
  4. one in twenty assets carries a steward override with a reason, and one in ten has a legal hold set as a fact.
"""
import json, os, sys, argparse, random, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fts_twin_engine import Federation, GLOBAL_ID
from fts_twin import Twin

FIRST = ["Naledi", "Thabo", "Aisha", "Pieter", "Zanele", "Sipho", "Anika", "Lerato", "Johan", "Fatima", "Kagiso", "Megan", "Tumelo", "Priya", "Bongani", "Elna", "Mpho", "Riaan", "Nomsa", "Daniel"]
LAST = ["Dlamini", "van der Merwe", "Naidoo", "Mokoena", "Botha", "Khumalo", "Pillay", "Nel", "Sithole", "Jacobs", "Mahlangu", "Petersen", "Ndlovu", "Steyn", "Abrahams", "Zulu", "Joubert", "Molefe", "Adams", "Radebe"]
SEGMENTS = ["Retail", "Retail", "Retail", "Private", "Business", "Youth"]
OUT_OF_ORDER = [("GDA-GLOBAL-PROTOCOL", "TR-AV-01", "release attempted before assurance"), ("GDA-GLOBAL-PROTOCOL", "TR-EX-05", "disposition attempted under hold", {"hold_active": True}),
                ("GDA-GLOBAL-PROTOCOL", "TR-AV-04", "onward use attempted before release"), ("KA-DS", "TR-PRV-03", "privacy use before basis recorded")]

def iso(dt): return dt.replace(microsecond=0).isoformat()

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--models", required=True); ap.add_argument("--scenario", required=True); ap.add_argument("--db", default="twin.sqlite")
    ap.add_argument("--n", type=int, default=120); ap.add_argument("--seed", type=int, default=1); ap.add_argument("--days", type=int, default=180); ap.add_argument("--scope", default="bank"); ap.add_argument("--prefix", default="CM")
    a = ap.parse_args(); random.seed(a.seed)
    if os.path.exists(a.db): os.remove(a.db)
    tw = Twin(a.models, a.db); fed = tw.fed; store = tw.store
    sc = json.load(open(a.scenario, encoding="utf-8"))
    tz = datetime.timezone(datetime.timedelta(hours=2)); now = datetime.datetime.now(tz); t0 = now - datetime.timedelta(days=a.days)
    # 1 shared elements for the scope, set up by the scenario's shared-region steps
    elements = {e["id"]: e for e in fed.default_elements(a.scope)}
    for e in elements.values(): store.put_instance(e)
    setup = fed.new_asset(f"{a.prefix}-SETUP", "governing set-up", "set-up", refs=fed.default_refs(elements), facts=sc.get("assetProfile"))
    for mid, v in (sc.get("kaVectors") or {}).items():
        for rid, sid in v.items():
            if rid in fed.shared.get(mid, ()): elements[setup["refs"][rid]]["state"] = sid
    shared_steps, asset_steps = [], []
    for step in sc["script"]:
        mid, tid = (step.split(":", 1) if ":" in step else (GLOBAL_ID, step))
        rid = fed.region_of[mid].get(fed.tr[mid][tid]["target"])
        (shared_steps if rid in fed.shared.get(mid, ()) else asset_steps).append((mid, tid))
    t = t0 - datetime.timedelta(days=30); setup_log = []
    for mid, tid in shared_steps:
        t += datetime.timedelta(hours=random.randint(2, 72))
        v = fed.evaluate(setup, mid, tid, elements, sc.get("authorizations"))
        if v["fired"]: fed.apply(setup, v, elements)
        setup_log.append((tid, v["result"]))
    for e in elements.values(): e["updatedAt"] = iso(t); store.put_instance(e)
    print(f"governing set-up: {sum(1 for _, r in setup_log if r == 'fired')} of {len(shared_steps)} shared-region steps fired on {len(elements)} elements")
    # 2 the assets
    preset_asset = {mid: {rid: sid for rid, sid in v.items() if rid not in fed.shared.get(mid, ())} for mid, v in (sc.get("kaVectors") or {}).items()}
    counts = {"assets": 0, "fired": 0, "refused": 0, "outOfOrder": 0, "overrides": 0, "holds": 0, "complete": 0}
    for i in range(1, a.n + 1):
        aid = f"{a.prefix}-{i:06d}"; name = f"{random.choice(FIRST)} {random.choice(LAST)}"; seg = random.choice(SEGMENTS)
        facts = dict(sc.get("assetProfile") or {})
        hold = random.random() < 0.10
        asset = fed.new_asset(aid, f"Customer Master record: {name}", f"Customer Master ({seg})", refs=fed.default_refs(elements), facts=facts)
        for mid, v in preset_asset.items(): asset["vectors"].setdefault(mid, {}).update(v)
        asset["createdAt"] = asset["updatedAt"] = iso(t0 + datetime.timedelta(days=random.uniform(0, a.days * 0.7)))
        store.put_instance(asset); counts["assets"] += 1
        cut = len(asset_steps) if random.random() < 0.2 else random.randint(max(3, len(asset_steps) // 6), len(asset_steps) - 1)
        t = datetime.datetime.fromisoformat(asset["createdAt"])
        ooo_at = random.randint(2, max(3, cut - 1)) if random.random() < 0.33 else None
        ooo = random.choice(OUT_OF_ORDER) if ooo_at else None
        for k, (mid, tid) in enumerate(asset_steps[:cut]):
            t += datetime.timedelta(hours=random.choice([1, 2, 4, 8, 24, 48, 72, 120]))
            if t > now: break
            if ooo and k == ooo_at:
                extra = ooo[3] if len(ooo) > 3 else None
                r = tw.post_event(aid, ooo[0], transition=ooo[1], facts=extra, actor="synthetic:" + ooo[2], at=iso(t))
                if extra: tw.set_facts(aid, {k2: False for k2 in extra}, actor="synthetic:hold lifted", at=iso(t + datetime.timedelta(hours=1)))
                counts["outOfOrder"] += 1; counts["refused" if str(r.get("result", "")).startswith("blocked") else "fired"] += 1
            r = tw.post_event(aid, mid, transition=tid, actor="synthetic:scenario", at=iso(t))
            counts["fired" if r.get("fired") else "refused"] += 1
        else:
            if cut == len(asset_steps): counts["complete"] += 1
        if hold:
            tw.set_facts(aid, {"hold_active": True}, actor="synthetic:legal hold", at=iso(min(now, t + datetime.timedelta(hours=6)))); counts["holds"] += 1
        if random.random() < 0.05:
            tw.override(aid, "KA-DQ", "REG-DQ-PDCA", "STS-PDCA-06", "steward accepted the assessment on review", actor="synthetic:steward", at=iso(min(now, t + datetime.timedelta(hours=12)))); counts["overrides"] += 1
    print(json.dumps(counts)); f = tw.fleet()
    print("fleet:", f["assets"], "assets,", f["events"], "events,", f["refused"], "refused,", f["overrides"], "overrides; Global EX states:", f["byGlobalState"].get("EX"))

if __name__ == "__main__":
    main()
