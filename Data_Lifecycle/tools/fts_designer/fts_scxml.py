#!/usr/bin/env python3
"""fts_scxml.py: export a canonical .fts.json model as SCXML (W3C State Chart XML).
Global States become compound <state>; sub-states nested; readiness states kept; the [Initial]
transition becomes the initial attribute; terminal Global States get a <final>. Transitions carry
event="EV-id" and cond="guards: G1 & G2 ..." as documentation of the contract.
Usage: python fts_scxml.py model.fts.json out.scxml
"""
import json, sys
from xml.sax.saxutils import escape, quoteattr

def export(m, out):
    states = m["globalStates"] + m["subStates"]
    by = {s["id"]: s for s in states}
    kids = lambda p: sorted([s for s in m["subStates"] if s.get("parent")==p], key=lambda s: float(s.get("sequence") or 99))
    ev = {e["id"]: e for e in m["events"]}
    init = next((t for t in m["transitions"] if str(t["source"]).startswith("[")), None)
    L = ['<?xml version="1.0" encoding="UTF-8"?>',
         f'<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0" name={quoteattr(m["meta"].get("name",""))} initial={quoteattr(init["target"] if init else (m["globalStates"][0]["id"] if m["globalStates"] else ""))} datamodel="null">',
         f'  <!-- {escape(m["meta"].get("modelId",""))} v{escape(str(m["meta"].get("version","")))} built {escape(m["meta"].get("buildStamp",""))}; status {escape(m["meta"].get("status",""))} -->']
    def emit(s, ind):
        pad = "  "*ind; ch = kids(s["id"])
        inner_init = next((t for t in m["transitions"] if t["source"]==s["id"] and any(c["id"]==t["target"] for c in ch)), None)
        attrs = f' id={quoteattr(s["id"])}' + (f' initial={quoteattr(inner_init["target"])}' if inner_init else "")
        L.append(f'{pad}<state{attrs}>')
        L.append(f'{pad}  <!-- {escape(s["name"])}: {escape(s.get("definition",""))} -->')
        ec = [c for c in m["entryConditions"] if c["appliesTo"]==s["id"]]; xc = [c for c in m["exitConditions"] if c["appliesTo"]==s["id"]]
        inv = [c for c in m["invariants"] if c["appliesTo"]==s["id"]]; act = [a for a in m["activities"] if a.get("permittedIn")==s["id"]]
        if ec: L.append(f'{pad}  <onentry><!-- entry conditions: ' + "; ".join(escape(c["id"]+" "+c["predicate"]) for c in ec) + ' --></onentry>')
        if inv or act: L.append(f'{pad}  <!-- invariants: ' + "; ".join(escape(c["id"]) for c in inv) + ' | permitted activities: ' + ", ".join(escape(a["name"]) for a in act) + ' -->')
        if xc: L.append(f'{pad}  <onexit><!-- exit conditions: ' + "; ".join(escape(c["id"]+" "+c["predicate"]) for c in xc) + ' --></onexit>')
        for t in m["transitions"]:
            if t["source"]!=s["id"] or (inner_init and t["id"]==inner_init["id"]): continue
            gs = [g for g in m["guards"] if g["transition"]==t["id"]]
            cond = " and ".join(g["id"] for g in gs)
            e = ev.get(t.get("event"))
            L.append(f'{pad}  <transition event={quoteattr(t.get("event") or t["id"])} target={quoteattr(t["target"])}' + (f' cond={quoteattr(cond)}' if cond else "") + f'><!-- {escape(t["name"])}' + (f' on {escape(e["name"])}' if e else "") + f' [{escape(t.get("optionality",""))}] --></transition>')
        for c in ch: emit(c, ind+1)
        L.append(f'{pad}</state>')
    if m["meta"].get("parallelRegions"):
        # orthogonal regions: one <parallel> holding a compound <state> per region with its own initial and <final>
        L[1] = L[1].replace(f'initial={quoteattr(init["target"] if init else "")}', 'initial="PROTOCOL"')
        L.append('  <parallel id="PROTOCOL">')
        for r in m["globalStates"]:
            rinit = next((t for t in m["transitions"] if str(t["source"]).startswith("[") and by.get(t["target"],{}).get("parent")==r["id"]), None)
            L.append(f'    <state id={quoteattr(r["id"])}' + (f' initial={quoteattr(rinit["target"])}' if rinit else "") + '>')
            L.append(f'      <!-- region {escape(r["name"])}: {escape(r.get("definition",""))} -->')
            for c in kids(r["id"]):
                emit(c, 3)
                if c.get("terminal"): L.append(f'      <final id={quoteattr(c["id"]+"_final")}/>')
            L.append('    </state>')
        L.append('  </parallel>')
        L.append('</scxml>')
    else:
        for gsx in m["globalStates"]: emit(gsx, 1)
        for gsx in m["globalStates"]:
            if gsx.get("terminal"): L.append(f'  <final id={quoteattr(gsx["id"]+"_final")}/>')
        L.append('</scxml>')
    open(out, "w", encoding="utf-8").write("\n".join(L)); return out

if __name__ == "__main__":
    print("Wrote", export(json.load(open(sys.argv[1], encoding="utf-8")), sys.argv[2]))
