#!/usr/bin/env python3
"""fts_feedback.py: read one or more viewer feedback files (reviews/*_feedback.json) and attach the
notes to the model as reviewItems, then write a Review Items sheet-ready JSON and a summary.

Usage: python fts_feedback.py model.fts.json reviews/*.json [--out reviewed.fts.json]
Each item: id, at, model, modelVersion, elementType, elementId, elementName, verdict, note, context.
Notes whose elementId is not in the model are kept and flagged 'unknown element'.
"""
import json, sys, argparse, datetime
from collections import Counter

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("model"); ap.add_argument("feedback", nargs="+"); ap.add_argument("--out")
    a = ap.parse_args()
    m = json.load(open(a.model, encoding="utf-8"))
    ids = set()
    for k, v in m.items():
        if isinstance(v, list):
            for x in v:
                if isinstance(x, dict) and x.get("id"): ids.add(x["id"])
    for p in (m.get("lifecycle", {}) or {}).get("phases", []): ids.add(p["id"])
    ids.add(m["meta"].get("modelId"))
    items = []
    for f in a.feedback:
        d = json.load(open(f, encoding="utf-8"))
        for it in (d if isinstance(d, list) else d.get("items", [])):
            it = dict(it); it["source"] = f; it["known"] = it.get("elementId") in ids; items.append(it)
    seen = set(); uniq = []
    for it in items:
        if it.get("id") in seen: continue
        seen.add(it.get("id")); uniq.append(it)
    m["reviewItems"] = uniq
    m["meta"]["reviewedAt"] = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=2))).strftime("%d %b %Y, %H:%M SAST")
    out = a.out or a.model.replace(".fts.json", ".reviewed.fts.json")
    json.dump(m, open(out, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    c = Counter(it.get("verdict") for it in uniq); e = Counter(it.get("elementType") for it in uniq)
    print(f"{len(uniq)} review items attached to {m['meta'].get('modelId')} v{m['meta'].get('version')} -> {out}")
    print("by verdict:", dict(c)); print("by element type:", dict(e))
    unk = [it for it in uniq if not it["known"]]
    if unk: print("unknown elements:", [it.get("elementId") for it in unk])
    for it in uniq: print(f"  {it.get('verdict','?'):9} {it.get('elementType','')} {it.get('elementId','')}: {it.get('note','')}")

if __name__ == "__main__":
    main()
