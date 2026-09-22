#!/usr/bin/env python3
"""
fts_docs.py  -  generate the FTS documentation set from the models, and read Word review comments back.

  python fts_docs.py <models_dir> --out <docs_dir> [--scenarios <dir>] [--runs <dir>] [--figures <dir>] [--docx] [--html]
      writes one Word document per model plus the system book, and one standalone HTML page per document under <docs_dir>/html
      (fixed table of contents on the left, index.html linking the pages) from the same content. State diagrams are the viewer's
      wrapped layout, rendered by render_figs.js (node) into <docs_dir>/figures on the first run: the whole Knowledge Area with every
      region expanded, then one figure per region in the section that describes that region.
  python fts_docs.py --readback <docs_dir>/<file>.docx [...] --reviews <reviews_dir>
      reads the Word comments of a generated document and writes <reviews_dir>/<model>_doc_comments.json, each comment
      anchored to the element ID of the paragraph or table row it sits on.

Howard's decisions (register, 22 Sep 2026): a system book plus one chapter per model; Word and HTML from one generator;
matrices in the book and a context diagram per chapter; every artefact and evidence record is a metadata asset; the
incoming side of every coupling is derived; two levels per chapter (executive opening, then the reference); Word comments
anchored to element IDs and read back into a review register.
"""
import json, os, sys, re, glob, datetime, zipfile, html as H, subprocess, io

SAST = datetime.timezone(datetime.timedelta(hours=2))
def stamp(): return datetime.datetime.now(SAST).strftime("%d %b %Y, %H:%M SAST")
VERSION = "0.2"
ID_RE = re.compile(r"^\[([A-Z]{2,4}-[A-Z0-9][A-Z0-9-]*)\]")

# DMBOK chapter order for the Knowledge Areas
ORDER = ["KA-DHE", "KA-DG", "KA-DA", "KA-DMD", "KA-DSO", "KA-DS", "KA-DII", "KA-DCM", "KA-RMD", "KA-DWBI", "KA-MM", "KA-DQ", "KA-BDA"]
CHAPTER = {"KA-DHE": 2, "KA-DG": 3, "KA-DA": 4, "KA-DMD": 5, "KA-DSO": 6, "KA-DS": 7, "KA-DII": 8, "KA-DCM": 9, "KA-RMD": 10, "KA-DWBI": 11, "KA-MM": 12, "KA-DQ": 13, "KA-BDA": 14}
GLOBAL_ID = "GDA-GLOBAL-PROTOCOL"
KIND_CODE = {"guard": "G", "event": "E", "service": "S", "decisionRight": "D", "control": "C"}

# ---------------------------------------------------------------- loading
def load_models(models_dir):
    ms = {}
    for f in sorted(glob.glob(os.path.join(models_dir, "*.fts.json"))):
        try: m = json.load(open(f, encoding="utf-8"))
        except Exception: continue
        mid = (m.get("meta") or {}).get("modelId")
        if not mid: continue
        if mid == GLOBAL_ID or mid.startswith("KA-"):
            m["_file"] = os.path.basename(f); ms[mid] = m
    return ms

def ka_ids(ms): return [k for k in ORDER if k in ms] + sorted(k for k in ms if k.startswith("KA-") and k not in ORDER)
def short(mid): return mid[3:] if mid.startswith("KA-") else "Global"
def kaname(ms, mid): return ms[mid]["meta"].get("knowledgeArea") or ms[mid]["meta"].get("name") if mid in ms else mid
def state_name(m, sid):
    for s in m.get("subStates", []) + m.get("globalStates", []):
        if s["id"] == sid: return s["name"]
    return sid
def tr(m, tid):
    for t in m.get("transitions", []):
        if t["id"] == tid: return t
    return None
def tr_name(m, tid): t = tr(m, tid); return t["name"] if t else ""
def region_of_state(m, sid):
    for s in m.get("subStates", []):
        if s["id"] == sid: return s.get("region") or s.get("parent")
    return None
def figure_svg(figures_dir, m, suffix):
    """the wrapped-layout SVG rendered by render_figs.js: <stem>_all.svg or <stem>_<REGIONCODE>.svg; None when absent"""
    if not figures_dir: return None
    p = os.path.join(figures_dir, m["_file"].replace(".fts.json", suffix + ".svg"))
    return open(p, encoding="utf-8").read() if os.path.exists(p) else None
def render_figures(models_dir, figures_dir):
    """run render_figs.js (beside this script) for every model; returns True when node produced the figures"""
    here = os.path.dirname(os.path.abspath(__file__)); js = os.path.join(here, "render_figs.js")
    if not os.path.exists(js): return False
    ok = True
    for f in sorted(glob.glob(os.path.join(models_dir, "*.fts.json"))):
        r = subprocess.run(["node", js, f, figures_dir], capture_output=True, text=True)
        if r.returncode != 0: ok = False; print("render_figs.js failed for", os.path.basename(f), r.stderr.strip()[:200])
    return ok
def incoming(ms, mid):
    out = []
    for oid, om in ms.items():
        if oid == mid: continue
        for k in om.get("kaCouplings", []):
            if k.get("targetModel") == mid: out.append((oid, k))
    return out
def contributions_to(ms, gtid):
    out = []
    for kid in ka_ids(ms):
        for c in ms[kid].get("contributions", []):
            if c["globalTransition"] == gtid: out.append((kid, c))
    return out

# ---------------------------------------------------------------- content IR
# blocks: ("h", level, text, id) ("p", text, id) ("t", headers, rows, id, note) ("fig", svg, caption, id) ("ul", items) ("pb",)
class Doc:
    def __init__(self, title, subtitle): self.title = title; self.subtitle = subtitle; self.blocks = []
    def h(self, level, text, id=None): self.blocks.append(("h", level, text, id))
    def p(self, text, id=None): self.blocks.append(("p", text, id))
    def t(self, headers, rows, id=None, note=None): self.blocks.append(("t", headers, rows, id, note))
    def fig(self, svg, caption, id=None): self.blocks.append(("fig", svg, caption, id))
    def ul(self, items): self.blocks.append(("ul", items))
    def pb(self): self.blocks.append(("pb",))

# ---------------------------------------------------------------- context diagram (SVG)
def context_svg(ms, mid):
    m = ms[mid]; g = ms.get(GLOBAL_ID)
    regs = m.get("regions", [])
    gregs = g["regions"] if g else [{"id": "REG-EX", "name": "Existence"}, {"id": "REG-AS", "name": "Assurance"}, {"id": "REG-AV", "name": "Availability"}, {"id": "REG-CP", "name": "Custody / Preservation"}]
    # left: Global regions with the contribution labels grouped by region
    by_greg = {r["id"]: [] for r in gregs}
    for c in m.get("contributions", []):
        gt = c["globalTransition"]; code = gt.split("-")[1] if gt.startswith("TR-") else ""
        rid = {"EX": "REG-EX", "AS": "REG-AS", "AV": "REG-AV", "CP": "REG-CP"}.get(code)
        if rid in by_greg: by_greg[rid].append(f"{gt} {KIND_CODE.get(c['kind'], '?')}{'*' if c.get('requirement') == 'Non-waivable' else ''}")
    # right: other KAs, outgoing and incoming
    others = {}
    for k in m.get("kaCouplings", []):
        others.setdefault(k["targetModel"], {"out": [], "in": []})["out"].append(k["id"] + (" ev" if k.get("event") else ""))
    for oid, k in incoming(ms, mid):
        others.setdefault(oid, {"out": [], "in": []})["in"].append(k["id"])
    order = [x for x in ORDER if x in others] + sorted(x for x in others if x not in ORDER)
    # geometry: Global regions (left), managed elements (centre, wider gap for the arrow lanes), coupled KAs (right, hung off a spine)
    W = 1180; colL, colC, colR = 40, 470, 860; bw = 290; lh = 14
    def box_h(lines): return 34 + lh * max(1, len(lines))
    y = 60; L = []
    for r in gregs:
        lines = by_greg.get(r["id"], []); L.append((r, lines, y)); y += box_h(lines) + 22
    hL = y
    y = 60; C = []; cpos = {}
    for r in regs:
        C.append((r, y)); cpos[r.get("code") or r["id"].split("-")[-1]] = (r, y); y += 66
    hC = y
    y = 60; R = []
    for oid in order:
        o, i = others[oid]["out"], others[oid]["in"]
        lines = [f"declares {len(o)} · receives {len(i)}"]
        if o: lines.append("out: " + ", ".join(x.replace(" ev", "*") for x in o[:3]) + (f" +{len(o)-3}" if len(o) > 3 else ""))
        if i: lines.append("in: " + ", ".join(i[:3]) + (f" +{len(i)-3}" if len(i) > 3 else ""))
        R.append((oid, lines, y)); y += box_h(lines) + 10
    hR = y
    Hh = max(hL, hC, hR, 200) + 48
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{Hh}" viewBox="0 0 {W} {Hh}" font-family="Segoe UI, Arial, sans-serif" font-size="12">',
         f'<rect x="0" y="0" width="{W}" height="{Hh}" fill="#ffffff"/>',
         f'<text x="{colL}" y="34" font-size="13" font-weight="600" fill="#1e2a30">Global Data Asset Protocol (what this KA gates)</text>',
         f'<text x="{colC}" y="34" font-size="13" font-weight="600" fill="#1e2a30">{H.escape(kaname(ms, mid))}: managed elements</text>',
         f'<text x="{colR}" y="34" font-size="13" font-weight="600" fill="#1e2a30">Other Knowledge Areas (couplings)</text>']
    gy = {}
    for r, lines, yy in L:
        h = box_h(lines); gy[r["id"]] = yy + h / 2
        s.append(f'<rect x="{colL}" y="{yy}" width="{bw}" height="{h}" rx="6" fill="#e6eef5" stroke="#2f6f9a"/>')
        s.append(f'<text x="{colL+10}" y="{yy+18}" font-weight="600" fill="#1e2a30">{H.escape(r["name"])} <tspan font-weight="400" fill="#5f6f78">{r["id"]}</tspan></text>')
        for i, ln in enumerate(lines): s.append(f'<text x="{colL+10}" y="{yy+34+i*lh}" fill="#1e2a30" font-family="Consolas, Menlo, monospace" font-size="11">{H.escape(ln)}</text>')
        if not lines: s.append(f'<text x="{colL+10}" y="{yy+34}" fill="#9aa5ab" font-size="11">no contribution</text>')
    # frame: the Knowledge Area's FTSs as one box, so the coupling spine joins the whole set and not one element
    if C:
        fy0 = C[0][1] - 12; fy1 = C[-1][1] + 48 + 12
        s.append(f'<rect x="{colC-12}" y="{fy0}" width="{bw+24}" height="{fy1-fy0}" rx="10" fill="none" stroke="#0f6b6e" stroke-width="1.6" stroke-dasharray="6 4"/>')
        s.append(f'<text x="{colC+bw+6}" y="{fy1+14}" text-anchor="end" fill="#0f6b6e" font-size="11">{H.escape(short(mid))} FTSs, {len(C)} regions</text>')
    for r, yy in C:
        s.append(f'<rect x="{colC}" y="{yy}" width="{bw}" height="48" rx="6" fill="#e3f1f0" stroke="#0f6b6e"/>')
        s.append(f'<text x="{colC+10}" y="{yy+19}" font-weight="600" fill="#1e2a30">{H.escape(r["name"][:40])}</text>')
        s.append(f'<text x="{colC+10}" y="{yy+36}" fill="#5f6f78" font-size="11">{r["id"]} · {H.escape((r.get("instanceScope") or "")[:30])}</text>')
    # left arrows: one per contribution per required region, from that managed element to the Global region it gates (orthogonal, own lane)
    # one arrow per (managed element, Global region) pair; entry and exit points spread evenly over each box
    pairs = {}
    for c in m.get("contributions", []):
        gt = c["globalTransition"]; code = gt.split("-")[1] if gt.startswith("TR-") else ""
        rid = {"EX": "REG-EX", "AS": "REG-AS", "AV": "REG-AV", "CP": "REG-CP"}.get(code)
        if rid not in gy: continue
        for key in (list((c.get("requiredStates") or {}).keys()) or [None]):
            pairs.setdefault((key if key in cpos else None, rid), []).append(c["id"])
    gh = {r["id"]: box_h(lines) for r, lines, yy in L}; gtop = {r["id"]: yy for r, lines, yy in L}
    by_g = {}; by_c = {}
    for (key, rid) in pairs: by_g.setdefault(rid, []).append((key, rid)); by_c.setdefault(key, []).append((key, rid))
    ent = {}; ext = {}
    for rid, lst in by_g.items():
        for i, pr in enumerate(lst): ent[pr] = gtop[rid] + gh[rid] * (i + 1) / (len(lst) + 1)
    for key, lst in by_c.items():
        for i, pr in enumerate(lst): ext[pr] = (cpos[key][1] + 48 * (i + 1) / (len(lst) + 1)) if key else None
    for lane, (pr, ids) in enumerate(sorted(pairs.items(), key=lambda kv: (ent[kv[0]], kv[0][0] or ""))):
        key, rid = pr; xm = colC - 24 - (lane % 14) * 8; ty = ent[pr]
        if key:
            s.append(f'<path d="M{colC},{ext[pr]:.0f} L{xm},{ext[pr]:.0f} L{xm},{ty:.0f} L{colL+bw+2},{ty:.0f}" fill="none" stroke="#2f6f9a" stroke-width="1.2" marker-end="url(#a)"><title>{H.escape(", ".join(ids))}</title></path>')
        else:
            s.append(f'<path d="M{colC-8},{ty:.0f} L{colL+bw+2},{ty:.0f}" fill="none" stroke="#2f6f9a" stroke-width="1.2" stroke-dasharray="4 3" marker-end="url(#a)"><title>{H.escape(", ".join(ids))}</title></path>')
    # right: the coupled KAs hang off one spine joined to the KA column
    if R:
        sx = colR - 34; top = R[0][2]; bot = R[-1][2] + box_h(R[-1][1])
        s.append(f'<line x1="{sx}" y1="{top}" x2="{sx}" y2="{bot}" stroke="#6a3d9a" stroke-width="1.6"/>')
        cmid = (C[0][1] - 12 + C[-1][1] + 60) / 2 if C else (top + bot) / 2
        s.append(f'<path d="M{colC+bw+12},{cmid:.0f} L{sx},{cmid:.0f}" fill="none" stroke="#6a3d9a" stroke-width="1.6"/>')
        if not (top <= cmid <= bot): s.append(f'<line x1="{sx}" y1="{min(top, cmid):.0f}" x2="{sx}" y2="{max(bot, cmid):.0f}" stroke="#6a3d9a" stroke-width="1.6"/>')
    for oid, lines, yy in R:
        h = box_h(lines)
        s.append(f'<line x1="{colR-34}" y1="{yy+h/2:.0f}" x2="{colR}" y2="{yy+h/2:.0f}" stroke="#6a3d9a" stroke-width="1.2"/>')
        s.append(f'<rect x="{colR}" y="{yy}" width="{bw}" height="{h}" rx="6" fill="#efe8f6" stroke="#6a3d9a"/>')
        s.append(f'<text x="{colR+10}" y="{yy+18}" font-weight="600" fill="#1e2a30">{H.escape(kaname(ms, oid).replace("Business Intelligence","BI").replace("Interoperability","Interop.")[:34])} <tspan font-weight="400" fill="#5f6f78">{oid}</tspan></text>')
        for i, ln in enumerate(lines): s.append(f'<text x="{colR+10}" y="{yy+34+i*lh}" fill="#1e2a30" font-family="Consolas, Menlo, monospace" font-size="11">{H.escape(ln)}</text>')
    s.insert(1, '<defs><marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#2f6f9a"/></marker></defs>')
    for i, ln in enumerate(["Left arrows: one per managed element and Global region pair, from the element whose states the contribution requires to the region it gates (dashed: no required state recorded).",
                            "Letters: G guard, E event, S service, D decision right, * Non-waivable. Right: the Knowledge Areas this KA is coupled to, hung off one spine that joins the frame around all of this KA's FTSs (the model does not",
                            "record which managed element a coupling belongs to, so the couplings are the Knowledge Area's as a whole). out: declared by this KA (* event emitted) · in: declared by the other KA against this one."]):
        s.append(f'<text x="{colL}" y="{Hh-36+i*13}" fill="#5f6f78" font-size="10.5">{H.escape(ln)}</text>')
    s.append("</svg>")
    return "\n".join(s)

def system_svg(ms):
    kas = ka_ids(ms); n = len(kas); W = 1100; Hh = 640; cx, cy = W / 2, Hh / 2
    import math
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{Hh}" viewBox="0 0 {W} {Hh}" font-family="Segoe UI, Arial, sans-serif" font-size="12"><rect width="{W}" height="{Hh}" fill="#fff"/>']
    s.append(f'<rect x="{cx-150}" y="{cy-60}" width="300" height="120" rx="8" fill="#e6eef5" stroke="#2f6f9a" stroke-width="1.5"/>')
    s.append(f'<text x="{cx}" y="{cy-30}" text-anchor="middle" font-weight="600" font-size="14">Global Data Asset Protocol</text>')
    for i, ln in enumerate(["Existence · Assurance", "Availability · Custody / Preservation", "36 transitions, 4 orthogonal regions"]): s.append(f'<text x="{cx}" y="{cy-6+i*18}" text-anchor="middle" fill="#5f6f78">{ln}</text>')
    pos = {}
    for i, kid in enumerate(kas):
        a = -math.pi / 2 + 2 * math.pi * i / n; x = cx + 430 * math.cos(a); y = cy + 250 * math.sin(a); pos[kid] = (x, y)
    for kid in kas:
        x, y = pos[kid]; nc = len(ms[kid].get("contributions", [])); s.append(f'<line x1="{x:.0f}" y1="{y:.0f}" x2="{cx:.0f}" y2="{cy:.0f}" stroke="#2f6f9a" stroke-width="{0.6+nc/6:.1f}" opacity="0.6"/>')
    for kid in kas:
        for k in ms[kid].get("kaCouplings", []):
            t = k.get("targetModel")
            if t in pos and t != kid:
                (x1, y1), (x2, y2) = pos[kid], pos[t]; s.append(f'<line x1="{x1:.0f}" y1="{y1:.0f}" x2="{x2:.0f}" y2="{y2:.0f}" stroke="#6a3d9a" stroke-width="0.6" opacity="0.35"/>')
    for kid in kas:
        x, y = pos[kid]; nm = kaname(ms, kid)
        s.append(f'<rect x="{x-78:.0f}" y="{y-20:.0f}" width="156" height="40" rx="6" fill="#e3f1f0" stroke="#0f6b6e"/>')
        s.append(f'<text x="{x:.0f}" y="{y-4:.0f}" text-anchor="middle" font-weight="600" font-size="11">{H.escape(nm[:26])}</text>')
        s.append(f'<text x="{x:.0f}" y="{y+12:.0f}" text-anchor="middle" fill="#5f6f78" font-size="10">{kid} · {len(ms[kid].get("contributions", []))} contributions · {len(ms[kid].get("kaCouplings", []))} couplings</text>')
    s.append(f'<text x="20" y="{Hh-12}" fill="#5f6f78" font-size="11">Blue: contributions to the Global protocol (width by count). Purple: couplings between Knowledge Areas.</text></svg>')
    return "\n".join(s)

# ---------------------------------------------------------------- content: system book
def build_book(ms, scen_dir=None, runs_dir=None):
    g = ms[GLOBAL_ID]; kas = ka_ids(ms)
    d = Doc("Global Data Asset Architecture: the FTS system book", f"How the Global Data Asset Protocol and the {len(kas)} Knowledge Area FTSs work together · generated {stamp()} · fts_docs v{VERSION}")
    d.h(1, "1. What this set is")
    d.p("This book describes one system: a Global Data Asset Protocol (the Global FTS) that states the durable conditions and permissible changes of any governed Data Asset, and one Finite State Transition model per Knowledge Area that states the durable conditions of the elements that Knowledge Area manages. The Knowledge Areas never become regions of the Data Asset. They reach the Global protocol through contributions (a guard, an event, a service or a decision right attached to a named Global transition) and reach each other through couplings (an event emitted into another Knowledge Area's FTS, or a fact of another FTS cited in a guard). Every claim in this book is generated from the models; the identifiers are the identifiers in the workbooks and the viewer.")
    d.p("The set has one chapter per model. Each chapter opens with an executive page (what the Knowledge Area manages, what it gates, the choices drafted for review) and continues with the full reference (regions, states, transitions, contributions, couplings in both directions, constraints, decision rights, evidence and artefacts). Comments made on a chapter in Word are read back against the element ID that starts each paragraph or row.")
    d.h(1, "2. The three layers")
    d.ul(["Layer 1, the Data Lifecycle: six phases (Plan and Specify, Create or Acquire, Manage and Preserve, Use and Reuse, Transform or Derive, Retain or Dispose) and eighteen activities with effect classes. Phases recur and overlap; they are never states and authorise nothing.",
          "Layer 2, the Formal Data Asset Protocol (the Global FTS): four orthogonal regions running concurrently, Existence, Assurance, Availability and Custody / Preservation. The asset's condition at a time is the State Vector <EX, AS, AV, CP>; legality comes from region invariants and cross-region constraints XRG-001..008. A transition never crosses regions.",
          "Layer 3, the GRCA services: Governance, Risk, Control and Assurance (with Evidence inside it), consumed by transitions and activities, never a fifth region. Eligibility is not authorization; an exception is limited to waivable requirements."])
    d.h(1, "3. The federation rule")
    d.p("Each Knowledge Area FTS is built from its DMBOK context diagram in one method: its definition, the managed elements Howard chose (one FTS, that is one state region, per element), the permissible states of each element, the contributions to the Global regions, and the couplings to the other Knowledge Areas. A contribution names a Global transition and attaches to it a guard (a predicate over the Knowledge Area's facts, derived from its State Vector), an event (the Knowledge Area emits the Global event), a service (the Knowledge Area supplies evidence) or a decision right. A guard marked Conditional passes for assets that have no instance of the managed element; a guard marked Non-waivable cannot be bypassed by any exception. A coupling names a transition of another Knowledge Area and either emits an event into it or cites one of its facts.")
    d.p("Two rules were decided on 22 September 2026 and are applied by the builder to every model. First, every artefact and evidence record of a Knowledge Area is a Metadata Asset: it is described in the Metadata Management FTS (Metadata of a Data Asset) and its quality is controlled in the Data Quality PDCA cycle; the builder emits the two couplings for every model, Metadata Management and Data Quality included. Second, couplings are shown from both sides: the model that declares a coupling carries it, and this book and the viewer derive the incoming side for the model it points at.")
    d.h(1, "4. The models")
    rows = []
    gt = [t for t in g["transitions"] if not t["id"].startswith("TR-INIT")]
    rows.append(["Global protocol", g["meta"].get("version", ""), "–", str(len(g["regions"])), str(len(g["subStates"])), str(len(gt)), "–", "–", str(len(g.get("decisionRights", []))), str(len(g.get("evidence", [])))])
    for kid in kas:
        m = ms[kid]; rows.append([kaname(ms, kid), m["meta"].get("version", ""), str(CHAPTER.get(kid, "")), str(len(m["regions"])), str(len(m["subStates"])), str(len([t for t in m["transitions"] if not t["id"].startswith("TR-INIT")])), str(len(m.get("contributions", []))), str(len(m.get("kaCouplings", []))), str(len(m.get("decisionRights", []))), str(len(m.get("artefacts", [])) + len(m.get("evidence", [])))])
    d.t(["Model", "Version", "DMBOK chapter", "Regions", "States", "Transitions", "Contributions", "Couplings declared", "Decision rights", "Metadata assets"], rows, "TBL-MODELS")
    d.fig(system_svg(ms), "The system: thirteen Knowledge Area FTSs around the Global protocol.", "FIG-SYSTEM")
    d.h(1, "5. Knowledge Area by Global transition")
    d.p("Each cell shows the kind of contribution the Knowledge Area makes to the Global transition: G guard, E event, S service, D decision right; a star marks a Non-waivable guard. A blank cell means no contribution. The last row counts contributions per transition; the last column counts per Knowledge Area.")
    hdr = ["Global transition"] + [short(k) for k in kas] + ["Total"]
    rows = []; uncontributed = []
    for t in gt:
        r = [f"{t['id']} {t['name']}"]; tot = 0
        for kid in kas:
            cs = [c for c in ms[kid].get("contributions", []) if c["globalTransition"] == t["id"]]
            r.append(" ".join(KIND_CODE.get(c["kind"], "?") + ("*" if c.get("requirement") == "Non-waivable" else "") for c in cs)); tot += len(cs)
        r.append(str(tot)); rows.append(r)
        if tot == 0: uncontributed.append(t)
    rows.append(["Per Knowledge Area"] + [str(len(ms[k].get("contributions", []))) for k in kas] + [str(sum(len(ms[k].get("contributions", [])) for k in kas))])
    d.t(hdr, rows, "TBL-KA-GLOBAL")
    if uncontributed:
        d.p("Global transitions carrying no Knowledge Area contribution (Global-only by design, or a gap for the review round):")
        d.ul([f"{t['id']} {t['name']}: {t.get('guardSummary', '')}" for t in uncontributed])
    else:
        d.p("Every Global transition now carries at least one Knowledge Area contribution.")
    d.h(1, "6. Knowledge Area by Knowledge Area")
    d.p("Rows declare, columns receive. A cell lists the coupling rows the row Knowledge Area declares against the column Knowledge Area: e for an event emitted, c for a fact cited, f for a fact of the row Knowledge Area that the column Knowledge Area is said to cite (a forward coupling), m for the generated metadata-asset couplings. The diagonal is blank except for Metadata Management and Data Quality, whose generated rows apply to their own outputs.")
    hdr = ["Declares \\ receives"] + [short(k) for k in kas] + ["Declared"]
    rows = []
    for a in kas:
        r = [short(a)]; n = 0
        for b in kas:
            cell = []
            for k in ms[a].get("kaCouplings", []):
                if k.get("targetModel") != b: continue
                n += 1
                if k.get("trace") == "derived:metadata-assets": cell.append("m")
                elif k.get("event"): cell.append("e")
                elif "Forward" in (k.get("note") or ""): cell.append("f")
                else: cell.append("c")
            r.append("".join(sorted(cell)))
        r.append(str(n)); rows.append(r)
    rows.append(["Received"] + [str(sum(1 for a in kas for k in ms[a].get("kaCouplings", []) if k.get("targetModel") == b)) for b in kas] + [""])
    d.t(hdr, rows, "TBL-KA-KA")
    d.h(1, "7. The metadata output register")
    d.p("Every artefact (a deliverable named on the context diagram) and every evidence record of every Knowledge Area, with the state that produces it or the transition it evidences, and the generated couplings under which Metadata Management describes it and Data Quality controls its quality.")
    rows = []
    for kid in kas:
        m = ms[kid]; mm = [k["id"] for k in m.get("kaCouplings", []) if k.get("trace") == "derived:metadata-assets" and k.get("targetModel") == "KA-MM"]; dq = [k["id"] for k in m.get("kaCouplings", []) if k.get("trace") == "derived:metadata-assets" and k.get("targetModel") == "KA-DQ"]
        for a in m.get("artefacts", []): rows.append([short(kid), a["id"], a["name"], a.get("artefactType", ""), f"produced in {a.get('producedIn', '')} {state_name(m, a.get('producedIn', ''))}", ", ".join(mm), ", ".join(dq)])
        for e in m.get("evidence", []): rows.append([short(kid), e["id"], e["name"], e.get("evidenceType", ""), f"evidences {e.get('relatesTo', '')} {tr_name(m, e.get('relatesTo', ''))}", ", ".join(mm), ", ".join(dq)])
    d.t(["KA", "ID", "Metadata asset", "Type", "Produced or evidenced", "Described (MM)", "Quality (DQ)"], rows, "TBL-METADATA")
    d.h(1, "8. The Customer Master stories")
    if scen_dir and os.path.isdir(scen_dir):
        for f in sorted(glob.glob(os.path.join(scen_dir, "*.sim.json"))):
            try: sc = json.load(open(f, encoding="utf-8"))
            except Exception: continue
            if not sc.get("kaVectors"): continue
            d.h(2, f"{sc.get('id', '')}: {sc.get('name', '')}", "SCN-" + str(sc.get("id", "")))
            d.p(sc.get("description", ""))
            kas_step = sorted({s.split(":")[0] for s in sc.get("script", []) if ":" in s})
            d.p(f"{len(sc.get('script', []))} steps; Knowledge Areas stepped: {', '.join(short(k) for k in kas_step)}; presets in kaVectors for {', '.join(short(k) for k in sc.get('kaVectors', {}))}.")
            if runs_dir:
                stem = os.path.basename(f).replace(".sim.json", "")
                for rf in glob.glob(os.path.join(runs_dir, stem + "*_sim_report.json")):
                    try: r = json.load(open(rf, encoding="utf-8")); st = r["vectorWalk"]["steps"]
                    except Exception: continue
                    fired = sum(1 for s in st if s.get("result") == "fired"); real = [s for s in st if s.get("transition") != "(KA vectors)"]
                    blocked = [(i + 1, s["transition"], [x["guard"] for x in s.get("guards", []) if x.get("verdict") is False]) for i, s in enumerate(real) if s.get("result") != "fired"]
                    d.p(f"Engine result: {fired} of {len(real)} steps fired; final Global vector {r['vectorWalk'].get('final') or ''}; blocked steps: {blocked or 'none'}.")
    else:
        d.p("No scenario folder was given to the generator.")
    d.h(1, "9. Review status")
    drs = [(kid, dr) for kid in kas for dr in ms[kid].get("decisionRights", []) if "REVIEW" in (dr.get("notes") or "")]
    d.p(f"{len(drs)} decision-right holders are drafted and marked REVIEW across the thirteen Knowledge Areas; they are settled in each workbook's Decision Rights sheet or by a comment on the chapter's decision-right row. Every state name, event, service and lifecycle drafted from a context diagram that shows no lifecycle is marked in the chapter's 'Drafted for review' list.")
    d.p("Status of every element: Proposed / illustrative until the Board says otherwise.")
    return d

# ---------------------------------------------------------------- content: a chapter
def build_chapter(ms, mid, figures_dir=None):
    m = ms[mid]; is_global = mid == GLOBAL_ID; g = ms.get(GLOBAL_ID)
    title = m["meta"].get("name", mid); ch = CHAPTER.get(mid)
    d = Doc(title, f"{'Layer 2 of the Global Data Asset Architecture' if is_global else 'Knowledge Area FTS, DMBOK chapter ' + str(ch)} · model {mid} v{m['meta'].get('version', '')} · built {m['meta'].get('buildStamp', '')} · document generated {stamp()} · fts_docs v{VERSION}")
    # ---- executive opening
    d.h(1, "In one page")
    d.p(m["meta"].get("definition") or (m.get("contextCapture") or {}).get("definition") or m["meta"].get("note") or "", "META-DEF")
    if not is_global:
        cc = m.get("contextCapture") or {}
        if cc.get("ensures"): d.p("What the Knowledge Area ensures: " + cc["ensures"], "META-ENSURES")
        d.h(2, "What it manages")
        d.t(["Managed element", "Region", "Instance scope", "Kind", "States", "Initial state"], [[r.get("managedElement", r["name"]), f"{r['id']} ({r.get('code', '')})", r.get("instanceScope", ""), r.get("elementKind", ""), str(sum(1 for s in m["subStates"] if (s.get("region") or s.get("parent")) == r["id"])), state_name(m, r.get("initialState", ""))] for r in m["regions"]], "TBL-MANAGES")
        fa = figure_svg(figures_dir, m, "_all")
        if fa: d.fig(fa, f"The {kaname(ms, mid)} FTSs: one state region per managed element, every region expanded, transition IDs on the arrows (the viewer's wrapped layout).", "FIG-ALL")
        d.h(2, "What it gates in the Global protocol")
        rows = []
        for c in m.get("contributions", []):
            rows.append([c["id"], f"{c['globalTransition']} {tr_name(g, c['globalTransition']) if g else ''}", c["kind"], c.get("requirement", ""), c.get("predicate", "")])
        d.t(["ID", "Global transition", "Kind", "Requirement", "What it says"], rows, "TBL-GATES")
        d.fig(context_svg(ms, mid), f"Context of the {kaname(ms, mid)} FTS: Global regions it gates (left), its managed elements (centre), Knowledge Areas it is coupled to (right).", "FIG-CONTEXT")
        d.h(2, "Whom it depends on and who depends on it")
        outs = [k for k in m.get("kaCouplings", []) if k.get("trace") != "derived:metadata-assets"]
        ins = incoming(ms, mid)
        d.p(f"{len(outs)} couplings declared to {len({k['targetModel'] for k in outs})} other Knowledge Areas; {len(ins)} couplings declared by {len({o for o, _ in ins})} other Knowledge Areas against this one; its {len(m.get('artefacts', []))} artefacts and {len(m.get('evidence', []))} evidence records are metadata assets described in Metadata Management and quality-controlled in Data Quality.", "META-COUPLING-SUMMARY")
        d.h(2, "Drafted for review")
        items = []
        for f in m.get("qaFindings", []):
            if f.get("rule") in ("capture", "phase", "scope", "derived", "GA-005") or (f.get("severity") == "note" and f.get("rule") == "N-007"): items.append(f"{f.get('element', '')}: {f.get('finding', '')}")
        drs = [dr for dr in m.get("decisionRights", []) if "REVIEW" in (dr.get("notes") or "")]
        if drs: items.append(f"{len(drs)} decision-right holders drafted (REVIEW): " + ", ".join(f"{dr['id']} {dr.get('holder', '')}" for dr in drs))
        d.ul(items or ["Nothing marked for review."])
    else:
        d.h(2, "The four regions")
        d.t(["Region", "ID", "Initial state", "States"], [[r["name"], r["id"], state_name(m, r.get("initialState", "")), str(sum(1 for s in m["subStates"] if (s.get("region") or s.get("parent")) == r["id"]))] for r in m["regions"]], "TBL-REGIONS")
        fa = figure_svg(figures_dir, m, "_all")
        if fa: d.fig(fa, "The Global protocol: four orthogonal regions, every region expanded, transition IDs on the arrows.", "FIG-ALL")
        d.h(2, "What the Knowledge Areas contribute")
        rows = []
        for t in [t for t in m["transitions"] if not t["id"].startswith("TR-INIT")]:
            cs = contributions_to(ms, t["id"]); rows.append([t["id"], t["name"], str(len(cs)), ", ".join(f"{short(k)} {c['id']} ({KIND_CODE.get(c['kind'], '?')}{'*' if c.get('requirement') == 'Non-waivable' else ''})" for k, c in cs)])
        d.t(["Transition", "Name", "Count", "Contributions (KA, ID, kind)"], rows, "TBL-CONTRIB-IN")
    d.pb()
    # ---- reference
    d.h(1, "Reference")
    d.h(2, "The FTSs: one region per managed element" if not is_global else "The four regions of the Data Asset")
    d.p("Each region below is one Finite State Transition model: its question, its states, and its own transitions with their events, guards, decision rights, services and cross-region constraints. A transition never crosses regions. The summary first shows every FTS with its internal states collapsed: where it starts and ends, how many states and transitions it has, which Global transitions its states gate and which cross-region guards it takes part in.")
    fs_ = figure_svg(figures_dir, m, "_summary")
    if fs_: d.fig(fs_, f"The {kaname(ms, mid) if not is_global else 'Global protocol'} FTSs with their internal states collapsed, one card per region.", "FIG-SUMMARY")
    for r in m["regions"]:
        code = r.get("code") or r["id"].split("-")[-1]
        d.h(3, f"{r['id']} {r['name']}", r["id"])
        if r.get("question"): d.p(f"[{r['id']}] Question the region answers: {r['question']} Invariant: {r.get('regionInvariant', '')}", r["id"])
        if r.get("managedElement") and not is_global: d.p(f"Managed element: {r['managedElement']}. Instance scope: {r.get('instanceScope', '')}. Initial state: {state_name(m, r.get('initialState', ''))}.", "REG-SCOPE-" + code)
        fr = figure_svg(figures_dir, m, "_" + code)
        if fr: d.fig(fr, f"{r['name']} ({r['id']}): the region alone, its states and its own transitions.", "FIG-" + code)
        rows = []
        for s in m["subStates"]:
            if (s.get("region") or s.get("parent")) != r["id"]: continue
            flags = ("initial " if s.get("initial") else "") + ("terminal" if s.get("terminal") else "")
            rows.append([s["id"], s["name"], s.get("definition", ""), s.get("invariant") or s.get("stateInvariant") or "", flags.strip()])
        d.t(["ID", "State", "Definition", "Invariant", ""], rows, "TBL-" + r["id"])
        rows = []
        for t in m["transitions"]:
            if t["id"].startswith("TR-INIT"): continue
            if region_of_state(m, t["target"]) != r["id"] and region_of_state(m, t["source"]) != r["id"]: continue
            rows.append([t["id"], t["name"], f"{state_name(m, t['source'])} → {state_name(m, t['target'])}", t.get("event", ""), t.get("guardSummary", ""), t.get("decisionRight", "") or "", ", ".join(t.get("services") or []), ", ".join(t.get("crossRegionConstraints") or [])])
        d.t(["ID", "Transition", "From → to", "Event", "Guard", "Decision right", "Services", "XRG"], rows, "TBL-TR-" + code)
    if not is_global:
        d.h(2, "Contributions to the Global protocol")
        rows = []
        for c in m.get("contributions", []):
            req = "; ".join(f"{code}: {', '.join(state_name(m, x) for x in ids)}" for code, ids in (c.get("requiredStates") or {}).items())
            rows.append([c["id"], f"{c['globalTransition']} {tr_name(g, c['globalTransition']) if g else ''}", c["kind"], c.get("requirement", ""), req, c.get("predicate", ""), c.get("expression", ""), c.get("note", "")])
        d.t(["ID", "Global transition", "Kind", "Requirement", "Required KA states", "Predicate", "Expression", "Note"], rows, "TBL-CONTRIBUTIONS")
        d.h(2, "Couplings declared by this Knowledge Area")
        rows = [[k["id"], f"{kaname(ms, k['targetModel'])} ({k['targetModel']})", f"{k.get('targetTransition', '')} {tr_name(ms[k['targetModel']], k.get('targetTransition', '')) if k.get('targetModel') in ms else ''}", k.get("event", "") or "", k.get("expression", "") or "", k.get("predicate", ""), k.get("note", "")] for k in m.get("kaCouplings", [])]
        d.t(["ID", "Target KA", "Target transition", "Event", "Fact", "Predicate", "Note"], rows, "TBL-COUPLINGS-OUT")
        d.h(2, "Couplings declared by other Knowledge Areas against this one (derived)")
        rows = [[k["id"], f"{kaname(ms, o)} ({o})", f"{k.get('targetTransition', '')} {tr_name(m, k.get('targetTransition', ''))}", k.get("event", "") or "", k.get("expression", "") or "", k.get("predicate", ""), k.get("note", "")] for o, k in incoming(ms, mid)]
        d.t(["ID", "Declared by", "Transition of this FTS", "Event", "Fact", "Predicate", "Note"], rows or [["", "none", "", "", "", "", ""]], "TBL-COUPLINGS-IN")
        fb = m["meta"].get("factBindings") or {}
        if fb:
            d.h(2, "Facts derived from the State Vector")
            d.t(["Fact", "Region", "True in states"], [[f, v.get("region", ""), ", ".join(state_name(m, x) for x in v.get("states", []))] for f, v in fb.items()], "TBL-FACTS")
    d.h(2, "Cross-region constraints")
    d.t(["ID", "Constraint", "Applies to", "Requirement", "Expression"], [[x["id"], x.get("constraint") or x.get("text", ""), ", ".join(x.get("transitions") or x.get("appliesTo") or []) if isinstance(x.get("transitions") or x.get("appliesTo"), list) else str(x.get("appliesTo") or ""), x.get("requirement", ""), x.get("expression") or ""] for x in m.get("crossRegionConstraints", [])], "TBL-XRG")
    d.h(2, "Decision rights")
    d.t(["ID", "Decision right", "Holder", "Applies to", "Note"], [[dr["id"], dr.get("name", ""), dr.get("holder", ""), dr.get("appliesTo", ""), dr.get("notes", "")] for dr in m.get("decisionRights", [])], "TBL-DR")
    d.h(2, "Services")
    d.t(["ID", "Family", "Service", "Trigger", "Output"], [[s["id"], s.get("family", ""), s.get("name", ""), s.get("trigger", ""), s.get("output", "")] for s in m.get("services", [])], "TBL-SERVICES")
    if m.get("events"):
        d.h(2, "Events")
        d.t(["ID", "Event", "Type", "Meaning"], [[e["id"], e.get("name", ""), e.get("eventType", ""), e.get("meaning", "")] for e in m["events"]], "TBL-EVENTS")
    d.h(2, "Artefacts and evidence (metadata assets)")
    rows = [[a["id"], a["name"], a.get("artefactType", ""), f"produced in {a.get('producedIn', '')} {state_name(m, a.get('producedIn', ''))}", a.get("evidenceUse", "")] for a in m.get("artefacts", [])]
    rows += [[e["id"], e["name"], e.get("evidenceType", ""), f"evidences {e.get('relatesTo', '')} {tr_name(m, e.get('relatesTo', ''))}", e.get("description", "")] for e in m.get("evidence", [])]
    d.t(["ID", "Name", "Type", "Produced or evidenced", "Use"], rows, "TBL-ARTEFACTS")
    if m.get("exceptions"):
        d.h(2, "Exceptions")
        d.t(["ID", "Exception", "Transition", "Basis", "Conditions"], [[x["id"], x.get("name", ""), x.get("transition", ""), x.get("basis", ""), x.get("conditions", "")] for x in m["exceptions"]], "TBL-EXC")
    if m.get("roles"):
        d.h(2, "Roles")
        d.t(["ID", "Role", "Accountability", "Responsibility"], [[r["id"], r.get("name", ""), r.get("accountability", ""), r.get("responsibility", "")] for r in m["roles"]], "TBL-ROLES")
    d.h(2, "Sources")
    d.ul([f"{s.get('id', '')}: {s.get('source', '')} ({s.get('type', '')}). {s.get('limitations', '')}" for s in m.get("sources", [])] or [m["meta"].get("source", "")])
    return d

# ---------------------------------------------------------------- renderers
def slug(text): return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60]
def toc_of(d):
    """(level, text, anchor) for every heading; anchors are element IDs when the heading has one, else a slug"""
    out = []; seen = set()
    for i, b in enumerate(d.blocks):
        if b[0] != "h": continue
        anc = b[3] or slug(b[2]) or f"h{i}"
        while anc in seen: anc += "-"
        seen.add(anc); out.append((b[1], b[2], anc)); b_ = ("h", b[1], b[2], anc); d.blocks[i] = b_
    return out

HTML_CSS = """:root{--ink:#1e2a30;--faint:#5f6f78;--line:#d3dbe0;--teal:#0f6b6e;--bg:#f6f7f8}
body{font-family:Segoe UI,Arial,sans-serif;font-size:14px;color:var(--ink);background:var(--bg);margin:0}
.top{position:sticky;top:0;z-index:3;background:#fff;border-bottom:1px solid var(--line);padding:8px 16px;font-size:13px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.top a{color:var(--teal);text-decoration:none} .top .sp{flex:1} .top select{font:inherit;padding:3px 6px}
.wrap{display:flex;align-items:flex-start;gap:0}
nav.toc{position:sticky;top:41px;height:calc(100vh - 41px);overflow:auto;width:300px;flex:0 0 300px;background:#fff;border-right:1px solid var(--line);padding:12px 10px 40px;font-size:12.5px;box-sizing:border-box}
nav.toc a{display:block;color:var(--ink);text-decoration:none;padding:3px 6px;border-radius:4px;line-height:1.3} nav.toc a:hover{background:#e6eef5}
nav.toc a.l1{font-weight:600;margin-top:8px} nav.toc a.l2{padding-left:16px} nav.toc a.l3{padding-left:30px;color:var(--faint)} nav.toc a.cur{background:#e3f1f0;color:var(--teal)}
nav.toc .ttl{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);margin:0 6px 6px}
main{flex:1;min-width:0;padding:16px 28px 60px;max-width:1240px;box-sizing:border-box}
h1{font-size:1.5rem;margin:14px 0 6px} h2{font-size:1.15rem;margin:26px 0 8px;color:var(--teal);scroll-margin-top:52px} h3{font-size:1rem;margin:18px 0 6px;scroll-margin-top:52px} h1{scroll-margin-top:52px} .sub{color:var(--faint);font-size:12.5px}
table{border-collapse:collapse;width:100%;font-size:12px;margin:6px 0 12px} th,td{border:1px solid var(--line);padding:4px 6px;vertical-align:top;text-align:left} th{background:#e6eef5}
.tw{overflow-x:auto} .id{font-family:Consolas,Menlo,monospace;font-size:11.5px;color:var(--faint);white-space:nowrap} figure{margin:10px 0;background:#fff;border:1px solid var(--line);border-radius:6px;padding:8px} figcaption{font-size:12px;color:var(--faint);padding-top:6px} figure svg{max-width:100%;height:auto;display:block} .pb{border-top:2px dashed var(--line);margin:24px 0}
.index{padding:24px 28px;max-width:1100px} .index table td a{color:var(--teal);text-decoration:none}
@media (max-width:900px){nav.toc{display:none}}
@media print{.top,nav.toc{display:none} main{padding:0;max-width:none} body{background:#fff}}"""

TOC_JS = """(function(){var links=[].slice.call(document.querySelectorAll('nav.toc a[href^="#"]'));var hs=links.map(function(a){return document.getElementById(a.getAttribute('href').slice(1));});
function upd(){var y=window.scrollY+70,cur=null;hs.forEach(function(h,i){if(h&&h.offsetTop<=y)cur=i;});links.forEach(function(a,i){a.classList.toggle('cur',i===cur);});}
window.addEventListener('scroll',upd,{passive:true});upd();})();"""

def render_blocks(d):
    out = []
    for b in d.blocks:
        if b[0] == "h": out.append(f"<h{b[1]} id=\"{H.escape(b[3])}\">{H.escape(b[2])}</h{b[1]}>")
        elif b[0] == "p": out.append(f"<p>{('<span class=id>[' + H.escape(b[2]) + ']</span> ') if b[2] and not b[1].startswith('[') else ''}{H.escape(b[1])}</p>")
        elif b[0] == "ul": out.append("<ul>" + "".join(f"<li>{H.escape(x)}</li>" for x in b[1]) + "</ul>")
        elif b[0] == "pb": out.append("<div class='pb'></div>")
        elif b[0] == "fig":
            svg = b[1]; fid = f' id="{H.escape(b[3])}"' if b[3] else ""
            if svg.lstrip().startswith("<svg"): out.append(f"<figure{fid}>{svg}<figcaption>{('[' + b[3] + '] ') if b[3] else ''}{H.escape(b[2])}</figcaption></figure>")
            elif os.path.exists(svg):
                import base64; out.append(f"<figure{fid}><img src='data:image/png;base64,{base64.b64encode(open(svg, 'rb').read()).decode()}' style='max-width:100%'><figcaption>{H.escape(b[2])}</figcaption></figure>")
        elif b[0] == "t":
            tid = f' id="{H.escape(b[3])}"' if b[3] else ""
            out.append(f"<div class='tw'{tid}><table><thead><tr>" + "".join(f"<th>{H.escape(h)}</th>" for h in b[1]) + "</tr></thead><tbody>")
            for r in b[2]: out.append("<tr>" + "".join(f"<td{' class=id' if j == 0 and ID_RE.match('[' + str(c) + ']') else ''}>{H.escape(str(c))}</td>" for j, c in enumerate(r)) + "</tr>")
            out.append("</tbody></table></div>")
    return "\n".join(out)

def render_pages(docs, names, out_dir):
    """one standalone HTML page per document with a fixed left table of contents, plus index.html linking them"""
    os.makedirs(out_dir, exist_ok=True); written = []
    for i, (d, n) in enumerate(zip(docs, names)):
        toc = toc_of(d)
        prev_ = f"<a href='{names[i-1]}.html'>&larr; {H.escape(docs[i-1].title[:40])}</a>" if i > 0 else ""
        next_ = f"<a href='{names[i+1]}.html'>{H.escape(docs[i+1].title[:40])} &rarr;</a>" if i + 1 < len(docs) else ""
        sel = "<select onchange=\"location.href=this.value\">" + "".join(f"<option value='{nn}.html'{' selected' if nn == n else ''}>{H.escape(dd.title[:70])}</option>" for dd, nn in zip(docs, names)) + "</select>"
        page = [f"<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>{H.escape(d.title)}</title><style>{HTML_CSS}</style></head><body>",
                f"<div class='top'><a href='index.html'>FTS documentation set</a> {sel} <span class='sp'></span> {prev_} {next_} <a href='#' onclick='window.print();return false'>Print or save as PDF</a></div>",
                "<div class='wrap'><nav class='toc'><div class='ttl'>On this page</div>" + "".join(f"<a class='l{lv}' href='#{H.escape(anc)}'>{H.escape(tx)}</a>" for lv, tx, anc in toc) + "</nav>",
                f"<main><h1 id='top'>{H.escape(d.title)}</h1><div class='sub'>{H.escape(d.subtitle)}</div>", render_blocks(d),
                f"<div class='sub' style='margin-top:30px'>Generated {stamp()} by fts_docs.py v{VERSION} from the model files; every ID is the model's ID and the same ID anchors the Word chapter's comments.</div></main></div><script>{TOC_JS}</script></body></html>"]
        p = os.path.join(out_dir, n + ".html"); open(p, "w", encoding="utf-8").write("\n".join(page)); written.append(p)
    rows = "".join(f"<tr><td><a href='{n}.html'>{H.escape(d.title)}</a></td><td>{H.escape(d.subtitle[:160])}</td></tr>" for d, n in zip(docs, names))
    idx = [f"<!doctype html><html lang='en'><head><meta charset='utf-8'><title>FTS documentation set</title><style>{HTML_CSS}</style></head><body><div class='index'><h1>FTS documentation set</h1>",
           "<p class='sub'>One page per model: the Global Data Asset Protocol and one Knowledge Area FTS per DMBOK chapter, each with a table of contents on the left. The system book comes first. The Word copies in this folder carry the same element IDs and are the commentable copies.</p>",
           f"<table><thead><tr><th>Document</th><th>About</th></tr></thead><tbody>{rows}</tbody></table>",
           f"<div class='sub' style='margin-top:20px'>Generated {stamp()} by fts_docs.py v{VERSION}.</div></div></body></html>"]
    p = os.path.join(out_dir, "index.html"); open(p, "w", encoding="utf-8").write("\n".join(idx)); written.append(p)
    return written

def render_docx(d, out_path, png_cache):
    from docx import Document
    from docx.shared import Pt, Inches, RGBColor
    from docx.enum.section import WD_ORIENT
    doc = Document()
    st = doc.styles["Normal"]; st.font.name = "Calibri"; st.font.size = Pt(10)
    sec = doc.sections[0]; sec.orientation = WD_ORIENT.LANDSCAPE; sec.page_width, sec.page_height = sec.page_height, sec.page_width
    for side in ("left_margin", "right_margin", "top_margin", "bottom_margin"): setattr(sec, side, Inches(0.6))
    doc.add_heading(d.title, 0); p = doc.add_paragraph(d.subtitle); p.runs[0].font.size = Pt(9); p.runs[0].font.color.rgb = RGBColor(0x5f, 0x6f, 0x78)
    def idpara(text, eid, style=None):
        para = doc.add_paragraph(style=style) if style else doc.add_paragraph()
        if eid:
            r = para.add_run(f"[{eid}] "); r.font.name = "Consolas"; r.font.size = Pt(8); r.font.color.rgb = RGBColor(0x5f, 0x6f, 0x78)
        para.add_run(text); return para
    for b in d.blocks:
        if b[0] == "h":
            h = doc.add_heading(b[2], min(b[1], 3))
        elif b[0] == "p":
            idpara(b[1], b[2] if b[2] and not b[1].startswith("[") else None)
        elif b[0] == "ul":
            for x in b[1]: doc.add_paragraph(x, style="List Bullet")
        elif b[0] == "pb":
            doc.add_page_break()
        elif b[0] == "fig":
            src = b[1]; png = None
            if src.lstrip().startswith("<svg"):
                key = str(hash(src))
                if key not in png_cache:
                    try:
                        import cairosvg
                        mm = re.search(r'viewBox="0 0 (\d+) (\d+)"', src)
                        src2 = src.replace('style="font-family:Segoe UI,system-ui,sans-serif;width:100%;height:auto"', f'width="{mm.group(1)}" height="{mm.group(2)}" style="font-family:Segoe UI,system-ui,sans-serif"') if mm else src
                        png_cache[key] = cairosvg.svg2png(bytestring=src2.encode("utf-8"), output_width=1800)
                    except Exception as ex: png_cache[key] = None; print("figure rasterisation failed:", ex)
                png = png_cache[key]
                if png: doc.add_picture(io.BytesIO(png), width=Inches(9.5))
            elif os.path.exists(src): doc.add_picture(src, width=Inches(9.5))
            cap = doc.add_paragraph(b[2]); cap.runs[0].font.size = Pt(8.5); cap.runs[0].italic = True
        elif b[0] == "t":
            headers, rows = b[1], b[2]
            if not rows: continue
            tbl = doc.add_table(rows=1, cols=len(headers)); tbl.style = "Light Grid Accent 1"
            for j, h in enumerate(headers):
                c = tbl.rows[0].cells[j]; c.text = ""; r = c.paragraphs[0].add_run(h); r.bold = True; r.font.size = Pt(8)
            for row in rows:
                cells = tbl.add_row().cells
                for j, v in enumerate(row):
                    cells[j].text = ""; r = cells[j].paragraphs[0].add_run(str(v)); r.font.size = Pt(8)
                    if j == 0 and ID_RE.match("[" + str(v) + "]"): r.font.name = "Consolas"
            doc.add_paragraph()
    foot = doc.add_paragraph(f"Generated {stamp()} by fts_docs.py v{VERSION} from the model files; every ID is the model's ID and comments on a row or paragraph are read back against it. Status: Proposed / illustrative."); foot.runs[0].font.size = Pt(8)
    doc.save(out_path); return out_path

# ---------------------------------------------------------------- read-back of Word comments
def readback(docx_path, reviews_dir):
    from lxml import etree
    z = zipfile.ZipFile(docx_path); names = z.namelist()
    if "word/comments.xml" not in names: return None
    NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    com = etree.fromstring(z.read("word/comments.xml")); doc = etree.fromstring(z.read("word/document.xml"))
    comments = {}
    for c in com.findall("w:comment", NS):
        cid = c.get("{%s}id" % NS["w"]); text = " ".join("".join(t.text or "" for t in p.iter("{%s}t" % NS["w"])) for p in c.findall(".//w:p", NS))
        comments[cid] = {"commentId": cid, "author": c.get("{%s}author" % NS["w"], ""), "date": c.get("{%s}date" % NS["w"], ""), "text": text.strip()}
    out = []
    body = doc.find("w:body", NS)
    # walk paragraphs (including inside tables); remember the last element ID seen and the current table row's first cell
    last_id = None; last_heading = ""
    for p in body.iter("{%s}p" % NS["w"]):
        ptext = "".join(t.text or "" for t in p.iter("{%s}t" % NS["w"]))
        mm = ID_RE.match(ptext)
        style = p.find("w:pPr/w:pStyle", NS); sname = style.get("{%s}val" % NS["w"]) if style is not None else ""
        if sname and sname.lower().startswith("heading"): last_heading = ptext
        # a table row: the first cell text is the ID
        tc = p.getparent()
        if tc is not None and tc.tag == "{%s}tc" % NS["w"]:
            tr_ = tc.getparent(); first = tr_.find("w:tc", NS)
            ftext = "".join(t.text or "" for t in first.iter("{%s}t" % NS["w"])) if first is not None else ""
            if re.match(r"^[A-Z]{2,4}-[A-Z0-9][A-Z0-9-]*$", ftext.strip()): last_id = ftext.strip()
        elif mm: last_id = mm.group(1)
        for ref in p.iter("{%s}commentRangeStart" % NS["w"]):
            cid = ref.get("{%s}id" % NS["w"])
            if cid in comments: out.append({**comments[cid], "elementId": last_id, "heading": last_heading, "paragraph": ptext[:300], "document": os.path.basename(docx_path)})
        for ref in p.iter("{%s}commentReference" % NS["w"]):
            cid = ref.get("{%s}id" % NS["w"])
            if cid in comments and not any(o["commentId"] == cid for o in out): out.append({**comments[cid], "elementId": last_id, "heading": last_heading, "paragraph": ptext[:300], "document": os.path.basename(docx_path)})
    os.makedirs(reviews_dir, exist_ok=True)
    stem = os.path.basename(docx_path).replace(".docx", "")
    outp = os.path.join(reviews_dir, stem + "_doc_comments.json")
    json.dump({"document": os.path.basename(docx_path), "readAt": stamp(), "comments": out}, open(outp, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    return outp, len(out)

# ---------------------------------------------------------------- main
def main(argv=None):
    import argparse
    ap = argparse.ArgumentParser(); ap.add_argument("models", nargs="?"); ap.add_argument("--out", default="docs"); ap.add_argument("--scenarios"); ap.add_argument("--runs")
    ap.add_argument("--figures", help="folder of wrapped-layout SVGs from render_figs.js; default <out>/figures, rendered here with node when absent")
    ap.add_argument("--docx", action="store_true"); ap.add_argument("--html", action="store_true"); ap.add_argument("--readback", nargs="*"); ap.add_argument("--reviews", default="reviews")
    a = ap.parse_args(argv)
    if a.readback:
        for f in a.readback:
            r = readback(f, a.reviews); print("no comments in" if r is None else f"wrote {r[0]} ({r[1]} comments) from", f)
        return
    if not a.models: ap.error("models dir required")
    ms = load_models(a.models); os.makedirs(a.out, exist_ok=True)
    if GLOBAL_ID not in ms: print("warning: global_protocol.fts.json not found; chapters will lack Global names")
    figs = a.figures or os.path.join(a.out, "figures")
    if not glob.glob(os.path.join(figs, "*_all.svg")):
        os.makedirs(figs, exist_ok=True)
        print("rendering figures with node render_figs.js into", figs, "(ok)" if render_figures(a.models, figs) else "(failed: chapters will have no state diagrams)")
    docs = [build_book(ms, a.scenarios, a.runs)]
    order = ([GLOBAL_ID] if GLOBAL_ID in ms else []) + ka_ids(ms)
    for mid in order: docs.append(build_chapter(ms, mid, figs))
    names = ["fts_system_book"] + [ms[mid]["_file"].replace(".fts.json", "") for mid in order]
    written = []
    if a.docx or not a.html:
        cache = {}
        for d, n in zip(docs, names):
            written.append(render_docx(d, os.path.join(a.out, n + ".docx"), cache))
    if a.html or not a.docx:
        written += render_pages(docs, names, os.path.join(a.out, "html"))
    for w in written: print("wrote", w)

if __name__ == "__main__":
    main()
