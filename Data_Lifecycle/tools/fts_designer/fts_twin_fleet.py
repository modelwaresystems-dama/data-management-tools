#!/usr/bin/env python3
"""
fts_twin_fleet.py v0.4  -  the twin's fleet: the Data Products of three business architectures as Data Assets, with the golden
records of their party masters as records inside them. Every step goes through the twin engine, so a refusal is a real refusal.

  python fts_twin_fleet.py --models <dir> --scenario <banking.sim.json> --architecture <private>/twin/architecture --db twin.sqlite [--seed 1]

Howard, 22 Sep 2026: the first fleet (120 "Customer Master records" each run as its own Data Asset) was wrong: a customer record
is not a Data Asset. Decisions: two levels (Data Assets carry the Global vector and the per-asset Knowledge Area regions; golden
records sit inside their asset and carry the record-level region, rolled up to the asset), and the Data Products of the Modelware,
AGGPSA and Nedbank FutureState workbooks as the assets, until his Catalog of Data Products replaces them.

How the fleet is made (all of it synthetic apart from the product names, types, domains, owners and classifications):
  1 each organisation is a governed scope with its own shared elements (strategy, programmes, platforms, architectures), set up by
    the banking scenario's shared-region steps;
  2 each Data Product becomes an asset whose Knowledge Areas follow its type and name (the rules in KA_RULES, stated below), and
    which replays the scenario's per-asset steps of those Knowledge Areas up to a stage: products the workbook leaves without a type
    are still proposed (cut before materialisation); the others are released; about half of those with an Amber quality score are
    cut inside the incident, so their access and assurance are suspended;
  3 each party master (a Master, Registry or Identity Graph of type Core / master) gets 30 to 70 golden records that are matched and
    confirmed around the asset's own match and confirm steps, then keep arriving, updating, conflicting, splitting and retiring after
    release; the asset's Golden Record region is their roll-up (fts_twin.ROLLUP). One master suffers a match-rule defect that puts 8%
    of its records in conflict for a week, which suspends its assurance and access through the Global protocol and restores them;
  3a (v0.3) an RMD product that is not a master (a catalogue, a glossary) is a reference data set: asset facts RMD_is_master false and
     RMD_is_reference true, no golden record path; it holds its own Reference Data Set region and is gated on a validated set and a
     published version (CON-RMD-16, CON-RMD-05);
  4 about one asset in four receives one out-of-order event the guards refuse, one in twelve a legal hold, one in twenty an override.
"""
import json, os, re, sys, glob, argparse, random, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fts_twin_engine import GLOBAL_ID
from fts_twin import Twin, GLD

BASE = ["KA-DG", "KA-DA", "KA-DMD", "KA-DSO", "KA-DII", "KA-MM", "KA-DQ", "KA-DS", "KA-DHE"]
KA_RULES = [  # (model, rule on product type or name)
    ("KA-DWBI", lambda t, n: t in ("Analytical / metric", "Decision / activation") or re.search(r"Dashboard|Product|KPI|Funnel|Analytics", n)),
    ("KA-BDA", lambda t, n: re.search(r"Model|Feature|Score|Index|Attribution|Segment|Signals|Sentiment|Insight", n)),
    ("KA-RMD", lambda t, n: t == "Core / master" or re.search(r"Master|Registry|Identity Graph|Glossary|Catalog", n)),
    ("KA-DCM", lambda t, n: re.search(r"Record|Content|Corpus|Evidence|Register|Narrative", n)),
]
PARTY_MASTER = re.compile(r"Master|Registry|Identity Graph")
ORGS = {"Modelware": ("MWS", "modelware"), "AGGPSA": ("AGG", "aggpsa"), "Nedbank": ("NED", "nedbank")}
FIRST = ["Naledi", "Thabo", "Aisha", "Pieter", "Zanele", "Sipho", "Anika", "Lerato", "Johan", "Fatima", "Kagiso", "Megan", "Tumelo", "Priya", "Bongani", "Elna", "Mpho", "Riaan", "Nomsa", "Daniel"]
LAST = ["Dlamini", "van der Merwe", "Naidoo", "Mokoena", "Botha", "Khumalo", "Pillay", "Nel", "Sithole", "Jacobs", "Mahlangu", "Petersen", "Ndlovu", "Steyn", "Abrahams", "Zulu", "Joubert", "Molefe", "Adams", "Radebe"]
ORGN = ["Ubuntu", "Ikhaya", "Lesedi", "Thrive", "Kasi", "Masakhane", "Siyakha", "Vuka", "Imbali", "Letsatsi"]
ORGT = ["Enterprise Hub", "Youth Trust", "Makers Co-op", "Incubator", "Learning Centre", "Foundation", "Growth Partners", "Skills Network"]
OUT_OF_ORDER = [("GDA-GLOBAL-PROTOCOL", "TR-AV-01", "release attempted before assurance"), ("GDA-GLOBAL-PROTOCOL", "TR-EX-05", "disposition attempted under hold", {"hold_active": True}),
                ("GDA-GLOBAL-PROTOCOL", "TR-AV-04", "onward use attempted before release"), ("KA-DS", "TR-PRV-03", "privacy use before basis recorded")]

def iso(dt): return dt.replace(microsecond=0).isoformat()

def read_products(arch_dir):
    import openpyxl
    out = []
    for f in sorted(glob.glob(os.path.join(arch_dir, "*_FutureState_Model.xlsx"))):
        org = os.path.basename(f).split("_")[0]; wb = openpyxl.load_workbook(f, read_only=True, data_only=True)
        rows = list(wb["18 · DataProduct"].iter_rows(values_only=True)); hdr = rows[3]
        dq = {}
        if "155 · DataProductDQControl" in wb.sheetnames:
            for r in list(wb["155 · DataProductDQControl"].iter_rows(values_only=True))[4:]:
                if r and r[1]: dq[r[1]] = {"score": r[11], "rag": r[12]}
        # v0.4 (Howard, 22 Sep 2026, dashboard): the operational facts the workbook does hold, so no dashboard tile is invented
        def count(sheet, col):
            if sheet not in wb.sheetnames: return {}
            c = {}
            for r in list(wb[sheet].iter_rows(values_only=True))[4:]:
                if r and len(r) > col and r[col]: c[r[col]] = c.get(r[col], 0) + 1
            return c
        uses = count("189 · DataProduct_AIUseCase_Map", 1); agents = count("34 · AIAgent_DataProduct_Map", 1)
        steps = count("136 · ProcessStep_DataProduct_M", 1) or count("136 · ProcessStep_DataProduct_Map", 1)
        controls = count("220 · DataProduct_Control_Map", 1) or count("220 · DataProduct_Control_Map", 0)
        dims = {}
        if "156 · DataProductDQScorecard" in wb.sheetnames:
            for r in list(wb["156 · DataProductDQScorecard"].iter_rows(values_only=True))[4:]:
                if r and r[0]: dims.setdefault(r[0], []).append({"dimension": r[2], "target": r[3], "score": r[4], "rag": r[5], "trend": r[6]})
        for r in rows[4:]:
            if not r or not r[0]: continue
            d = dict(zip(hdr, r)); pid = d["DataProductID"]; d["org"] = org; d["dq"] = dq.get(pid); d["pii"] = ":pii" in str(d.get("Schema (field:type[:pii])") or "")
            sch = str(d.get("Schema (field:type[:pii])") or "")
            d["product"] = {"id": pid, "domain": d.get("Domain"), "owner": d.get("Owner"), "description": d.get("Description"), "classification": d.get("Classification"),
                            "productType": d.get("ProductType"), "refreshRate": d.get("DataRefreshRate"), "pipelineMode": d.get("PipelineMode"), "timelinessSLA": d.get("TimelinessSLA"),
                            "meetsTimeliness": d.get("MeetsTimeliness"), "realisesCDP": d.get("RealisesCDP"), "producers": d.get("Producers"), "pii": d["pii"],
                            "schemaFields": len([x for x in re.split(r"[;|\n]", sch) if x.strip()]), "piiFields": sch.count(":pii"),
                            "consumers": {"aiUseCases": uses.get(pid, 0), "aiAgents": agents.get(pid, 0), "processSteps": steps.get(pid, 0), "controls": controls.get(pid, 0)},
                            "dq": dq.get(pid), "dqDimensions": dims.get(pid, []), "source": f"{org}_FutureState_Model.xlsx"}
            out.append(d)
    return out

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--models", required=True); ap.add_argument("--scenario", required=True); ap.add_argument("--architecture", required=True)
    ap.add_argument("--db", default="twin.sqlite"); ap.add_argument("--seed", type=int, default=1); ap.add_argument("--days", type=int, default=240)
    a = ap.parse_args(); random.seed(a.seed)
    if os.path.exists(a.db): os.remove(a.db)
    tw = Twin(a.models, a.db); fed = tw.fed; store = tw.store
    sc = json.load(open(a.scenario, encoding="utf-8")); products = read_products(a.architecture)
    tz = datetime.timezone(datetime.timedelta(hours=2)); now = datetime.datetime.now(tz); t0 = now - datetime.timedelta(days=a.days)
    # the scenario split into shared-region steps and per-asset steps, keeping each step's position in the script
    shared_steps, asset_steps = [], []
    for i, step in enumerate(sc["script"]):
        mid, tid = (step.split(":", 1) if ":" in step else (GLOBAL_ID, step))
        rid = fed.region_of[mid].get(fed.tr[mid][tid]["target"])
        (shared_steps if rid in fed.shared.get(mid, ()) else asset_steps).append((i, mid, tid))
    pos = lambda tid: next(i for i, s in enumerate(sc["script"]) if s.split(":")[-1] == tid)
    I_REG, I_MAT, I_REL, I_INC, I_REST, I_TAIL = pos("TR-EX-01"), pos("TR-EX-02"), pos("TR-AV-01"), pos("TR-AV-03"), pos("TR-AV-04"), pos("TR-AV-05")
    GLD_STEPS = {pos("TR-GLD-01"): "match", pos("TR-GLD-02"): "confirm"}
    # 1 the governed scopes
    scopes = {}
    for org, (pfx, scope) in ORGS.items():
        elements = {e["id"]: e for e in fed.default_elements(scope)}
        setup = fed.new_asset(f"{pfx}-SETUP", "governing set-up", "set-up", refs=fed.default_refs(elements), facts=sc.get("assetProfile"))
        for mid, v in (sc.get("kaVectors") or {}).items():
            for rid, sid in v.items():
                if rid in fed.shared.get(mid, ()): elements[setup["refs"][rid]]["state"] = sid
        t = t0 - datetime.timedelta(days=45)
        for _, mid, tid in shared_steps:
            t += datetime.timedelta(hours=random.randint(2, 30)); v = fed.evaluate(setup, mid, tid, elements, sc.get("authorizations"))
            if v["fired"]: fed.apply(setup, v, elements)
        for e in elements.values(): e["updatedAt"] = iso(t); e["scope"] = scope; e["org"] = org; store.put_instance(e)
        scopes[org] = elements
    preset = {mid: {rid: sid for rid, sid in v.items() if rid not in fed.shared.get(mid, ())} for mid, v in (sc.get("kaVectors") or {}).items()}
    counts = {"assets": 0, "records": 0, "refused": 0, "holds": 0, "overrides": 0, "proposed": 0, "released": 0, "suspended": 0}
    defect_asset = next((f"NED-{p['DataProductID']}" for p in products if p["org"] == "Nedbank" and PARTY_MASTER.search(p["Name"] or "") and p.get("ProductType") == "Core / master"), None)
    def rec_ev(aid, rid, tid, actor, when):
        """a record event; when the roll-up moves the asset into or out of Record Conflict, the RMD event contributions fire on the
        asset's Global protocol: the assurance and suspension triggers (CON-RMD-08, 09) on entry, reassessment, confirmation and
        restoration of access (CON-RMD-10 needs Reliable) on the way back"""
        before = store.get_instance(aid)["vectors"].get("KA-RMD", {}).get("REG-RMD-GLD")
        tw.post_record_event(rid, "KA-RMD", tid, actor=actor, at=iso(when))
        after = store.get_instance(aid)["vectors"].get("KA-RMD", {}).get("REG-RMD-GLD")
        if before != GLD["conflict"] and after == GLD["conflict"]:
            for k, t2 in enumerate(["TR-AS-05", "TR-AV-03"]): tw.post_event(aid, GLOBAL_ID, transition=t2, actor="twin:roll-up entered Record Conflict (CON-RMD-08, 09)", at=iso(when + datetime.timedelta(minutes=k + 1)))
        if before == GLD["conflict"] and after == GLD["reliable"]:
            for k, t2 in enumerate(["TR-AS-08", "TR-AS-02", "TR-AV-04"]): tw.post_event(aid, GLOBAL_ID, transition=t2, actor="synthetic:reassessed and restored after the conflict", at=iso(when + datetime.timedelta(hours=2 + 4 * k)))
    for p in products:
        org = p["org"]; pfx, scope = ORGS[org]; aid = f"{pfx}-{p['DataProductID']}"; name = p["Name"]; ptype = p.get("ProductType")
        kas = BASE + [k for k, rule in KA_RULES if rule(ptype or "", name)]
        # RMD asset kind (Howard, 22 Sep 2026: split by master or reference): a Core / master product or a party master is master data;
        # any other product in RMD scope (a catalogue, a glossary) is a reference data set whose releases are versions
        is_master = "KA-RMD" in kas and (ptype == "Core / master" or bool(PARTY_MASTER.search(name)))
        is_reference = "KA-RMD" in kas and not is_master
        asset = fed.new_asset(aid, name, ptype or "Proposed data product", refs=fed.default_refs(scopes[org]), facts={**(sc.get("assetProfile") or {}), "RMD_is_master": is_master, "RMD_is_reference": is_reference}, ka_models=kas)
        asset.update({"rmdKind": "master" if is_master else "reference" if is_reference else None, "org": org, "scope": scope, "domain": p.get("Domain"), "owner": p.get("Owner"), "classification": p.get("Classification"), "productType": ptype, "dq": p.get("dq"),
                      "source": f"{org}_FutureState_Model.xlsx, 18 · DataProduct {p['DataProductID']}", "product": p.get("product")})
        for mid, v in preset.items():
            if mid in asset["vectors"]: asset["vectors"][mid].update(v)
        asset["createdAt"] = asset["updatedAt"] = iso(t0 + datetime.timedelta(days=random.uniform(0, a.days * 0.45)))
        store.put_instance(asset); counts["assets"] += 1
        # the stage the product has reached
        amber = (p.get("dq") or {}).get("rag") == "Amber"
        if not ptype: cut = random.randint(I_REG - 3, I_MAT - 1); counts["proposed"] += 1
        elif amber and random.random() < 0.5: cut = random.randint(I_INC + 1, I_REST - 1); counts["suspended"] += 1
        else: cut = random.randint(I_REL + 1, I_INC - 1); counts["released"] += 1
        has_records = "KA-RMD" in kas and PARTY_MASTER.search(name) and ptype == "Core / master"
        persons = bool(re.search(r"Person|Customer|Party|Participant|Identity", name))
        recs = []
        steps = [(i, mid, tid) for i, mid, tid in asset_steps if i < cut and (mid == GLOBAL_ID or mid in kas)]
        t = datetime.datetime.fromisoformat(asset["createdAt"])
        ooo_i = None; ooo = None
        if random.random() < 0.25 and len(steps) > 4:
            ooo = random.choice(OUT_OF_ORDER)
            limit = {"TR-AV-01": pos("TR-AS-02"), "TR-AV-04": I_REL, "TR-PRV-03": pos("TR-PRV-02"), "TR-EX-05": 10**6}[ooo[1]]
            cand = [k for k, (i, _, _) in enumerate(steps) if i < limit and k > 1]
            ooo_i = random.choice(cand) if cand else None
        for k, (i, mid, tid) in enumerate(steps):
            t += datetime.timedelta(hours=random.choice([2, 4, 8, 24, 24, 48, 72]))
            if t > now: break
            if ooo_i == k:
                o = ooo; extra = o[3] if len(o) > 3 else None
                if o[0] == GLOBAL_ID or o[0] in kas:
                    r = tw.post_event(aid, o[0], transition=o[1], facts=extra, actor="synthetic:" + o[2], at=iso(t))
                    if extra: tw.set_facts(aid, {x: False for x in extra}, actor="synthetic:hold lifted", at=iso(t + datetime.timedelta(hours=1)))
                    if str(r.get("result", "")).startswith("blocked"): counts["refused"] += 1
            if has_records and i in GLD_STEPS:
                if GLD_STEPS[i] == "match":   # the initial load: candidates created and matched
                    for j in range(random.randint(30, 70)):
                        nm = f"{random.choice(FIRST)} {random.choice(LAST)}" if persons else f"{random.choice(ORGN)} {random.choice(ORGT)}"
                        rec = tw.new_record(f"{aid}-R{j+1:04d}", aid, nm, "Golden Record: " + ("person" if persons else "organisation"), at=iso(t)); recs.append(rec["id"])
                    for j, rid in enumerate(recs):
                        if random.random() < 0.99: tw.post_record_event(rid, "KA-RMD", "TR-GLD-01", actor="synthetic:initial match", at=iso(t + datetime.timedelta(minutes=j)))
                    counts["records"] += len(recs)
                else:                          # confirmed reliable, a few left matched for review
                    for j, rid in enumerate(recs):
                        if random.random() < 0.98: tw.post_record_event(rid, "KA-RMD", "TR-GLD-02", actor="synthetic:confirmation", at=iso(t + datetime.timedelta(minutes=j)))
                continue
            if (has_records or is_reference) and mid == "KA-RMD" and fed.region_of[mid].get(fed.tr[mid][tid]["target"]) == "REG-RMD-GLD": continue
            tw.post_event(aid, mid, transition=tid, actor="synthetic:scenario", at=iso(t))
        # records after release, in time order: arrivals, updates, disputes resolved within days, splits, retirements; on the
        # defect master a match-rule defect puts 8% of the records in conflict for a week
        if has_records and recs and cut > I_REL:
            import heapq
            q = []; seq = [0]
            def later(when, fn): seq[0] += 1; heapq.heappush(q, (when, seq[0], fn))
            tr = datetime.datetime.fromisoformat(store.get_instance(aid)["updatedAt"])
            while tr < now - datetime.timedelta(days=2):
                tr += datetime.timedelta(hours=random.randint(12, 72)); later(tr, "tick")
            if aid == defect_asset: later(now - datetime.timedelta(days=random.randint(40, 70)), "defect")
            n0 = len(recs)
            while q:
                when, _, fn = heapq.heappop(q); at = iso(when)
                if when > now: continue
                if callable(fn): fn(when); continue
                if fn == "defect":
                    live = [r for r in recs if store.get_instance(r)["regions"]["KA-RMD"]["REG-RMD-GLD"] == GLD["reliable"]]
                    hit = random.sample(live, max(1, int(len(live) * 0.08) + 1))
                    for j, rid in enumerate(hit): rec_ev(aid, rid, "TR-GLD-03", "synthetic:match-rule defect", when + datetime.timedelta(minutes=j))
                    def fix(w, hit=hit):
                        for j, rid in enumerate(hit):
                            rec_ev(aid, rid, "TR-GLD-05", "synthetic:match rule corrected", w + datetime.timedelta(minutes=j))
                            rec_ev(aid, rid, "TR-GLD-02", "synthetic:confirmation", w + datetime.timedelta(hours=2, minutes=j))
                    later(when + datetime.timedelta(days=7), fix); continue
                roll = random.random()
                if roll < 0.35:
                    j = len(recs) + 1; nm = f"{random.choice(FIRST)} {random.choice(LAST)}" if persons else f"{random.choice(ORGN)} {random.choice(ORGT)}"
                    rec = tw.new_record(f"{aid}-R{j:04d}", aid, nm, "Golden Record: " + ("person" if persons else "organisation"), at=at); recs.append(rec["id"])
                    rec_ev(aid, rec["id"], "TR-GLD-01", "synthetic:new arrival", when)
                    later(when + datetime.timedelta(hours=random.randint(2, 30)), lambda w, rid=rec["id"]: rec_ev(aid, rid, "TR-GLD-02", "synthetic:confirmation", w))
                    continue
                rid = random.choice(recs); st = store.get_instance(rid)["regions"]["KA-RMD"]["REG-RMD-GLD"]
                if st != GLD["reliable"]: continue
                x = random.random()
                if x < 0.5:
                    rec_ev(aid, rid, "TR-GLD-08", "synthetic:source update", when)
                    later(when + datetime.timedelta(hours=6), lambda w, rid=rid: rec_ev(aid, rid, "TR-GLD-02", "synthetic:confirmation", w))
                elif x < 0.58:
                    rec_ev(aid, rid, "TR-GLD-03", "synthetic:survivorship dispute", when); y = random.random()
                    if y < 0.75:
                        later(when + datetime.timedelta(days=random.randint(1, 4)), lambda w, rid=rid: (rec_ev(aid, rid, "TR-GLD-05", "synthetic:steward resolved", w), rec_ev(aid, rid, "TR-GLD-02", "synthetic:confirmation", w + datetime.timedelta(hours=4))))
                    elif y < 0.9:
                        later(when + datetime.timedelta(days=random.randint(1, 4)), lambda w, rid=rid: (rec_ev(aid, rid, "TR-GLD-06", "synthetic:false merge found", w), rec_ev(aid, rid, "TR-GLD-07", "synthetic:re-match", w + datetime.timedelta(hours=8)), rec_ev(aid, rid, "TR-GLD-02", "synthetic:confirmation", w + datetime.timedelta(hours=12))))
                    else:
                        later(when + datetime.timedelta(days=random.randint(1, 4)), lambda w, rid=rid: rec_ev(aid, rid, "TR-GLD-10", "synthetic:duplicate retired", w))
                elif x < 0.66: rec_ev(aid, rid, "TR-GLD-09", "synthetic:entity ended", when)
            counts["records"] += len(recs) - n0
        if random.random() < 1 / 12: tw.set_facts(aid, {"hold_active": True}, actor="synthetic:legal hold", at=iso(min(now, t + datetime.timedelta(hours=6)))); counts["holds"] += 1
        if random.random() < 0.05 and "KA-DQ" in kas:
            tw.override(aid, "KA-DQ", "REG-DQ-PDCA", "STS-PDCA-06", "steward accepted the assessment on review", actor="synthetic:steward", at=iso(min(now, t + datetime.timedelta(hours=12)))); counts["overrides"] += 1
    f = tw.fleet(); counts["refused"] = f["refused"]
    print(json.dumps(counts)); print("fleet:", f["assets"], "assets,", f["records"], "records,", f["events"], "events,", f["refused"], "refused; Global EX:", f["byGlobalState"].get("EX"), "AV:", f["byGlobalState"].get("AV"))
    print("defect on", defect_asset)

if __name__ == "__main__":
    main()
