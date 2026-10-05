#!/usr/bin/env python3
"""
acpp-passage-bind · zotero_index.py

Parse a Zotero RDF export into an index of references and their attached
full-text files, and resolve a board source (a src_id, a citation string, or a
title/author/year) to the file(s) on disk that hold its text.

The attachments live, git-ignored, under <sources>/_fulltext/ ; the RDF records
which file backs each reference. Combined with passage_find.py this turns a
"passage-pending" evidence row into concrete verbatim candidates.

Usage:
    python3 zotero_index.py <export.rdf> --list
    python3 zotero_index.py <export.rdf> --resolve "DMBOK2 definition of data management" [--map sources_map.json] [--fulltext-root /path/to/_fulltext]
"""
import argparse, json, os, re, sys
import xml.etree.ElementTree as ET

RDF = "{http://www.w3.org/1999/02/22-rdf-syntax-ns#}"

def _local(tag):
    return tag.split("}", 1)[1] if "}" in tag else tag

def _text(el, names):
    for ch in el:
        if _local(ch.tag) in names and (ch.text and ch.text.strip()):
            return ch.text.strip()
    return ""

def _attr_resource(el):
    for k, v in el.attrib.items():
        if _local(k) == "resource":
            return v
    return None

def _about(el):
    return el.attrib.get(RDF + "about") or el.attrib.get(RDF + "nodeID")

def _file_res(node):
    for ch in node.iter():
        for k, v in ch.attrib.items():
            if _local(k) == "resource" and v and (
                    v.startswith("files/") or v.lower().endswith((".pdf", ".html", ".htm"))):
                return v
    return None

def parse(rdf_path):
    tree = ET.parse(rdf_path)
    root = tree.getroot()
    nodes = list(root)
    # --- pass 1: register every attachment (they appear AFTER the items linking them) ---
    attach = {}     # id -> {"file": rel path, "title": ...}
    for node in nodes:
        tag = _local(node.tag)
        itemtype = _text(node, ["itemType"])
        if tag == "Attachment" or itemtype == "attachment":
            nid = _about(node)
            if nid:
                attach[nid] = {"file": _file_res(node), "title": _text(node, ["title"])}
    # --- pass 2: bibliographic items, now resolving their attachment links ---
    items = []
    for node in nodes:
        tag = _local(node.tag)
        nid = _about(node)
        itemtype = _text(node, ["itemType"])
        if tag == "Attachment" or itemtype == "attachment":
            continue
        file_res = _file_res(node)
        title = _text(node, ["title"])
        if not title and tag in ("Journal", "Series", "Periodical", "authors", "editors", "Seq", "Person"):
            continue
        if not title:
            continue
        # creators: surnames found anywhere under this node
        creators = []
        for ch in node.iter():
            if _local(ch.tag) == "surname" and ch.text:
                creators.append(ch.text.strip())
        date = _text(node, ["date"]) or _text(node, ["issued"])
        year = ""
        m = re.search(r"\b(1[5-9]\d\d|20\d\d|21\d\d)\b", date)
        if m:
            year = m.group(1)
        # url
        url = ""
        for ch in node.iter():
            lt = _local(ch.tag)
            if lt in ("identifier", "URI") and ch.text and ch.text.strip().startswith("http"):
                url = ch.text.strip()
            r = _attr_resource(ch)
            if lt == "URI" and r and r.startswith("http"):
                url = r
        # linked attachments (link:link rdf:resource="#item_NN")
        files = []
        if file_res:
            files.append(file_res)
        for ch in node.iter():
            if _local(ch.tag) == "link":
                ref = _attr_resource(ch)
                if ref and ref in attach and attach[ref]["file"] and attach[ref]["file"] not in files:
                    files.append(attach[ref]["file"])
        items.append({"id": nid, "type": tag, "title": title,
                      "creators": creators[:6], "year": year, "url": url, "files": files})
    # second pass: attachments linked by child-of pointers we captured after the item
    for it in items:
        if it["files"]:
            continue
        # match attachment whose own nodeID path embeds the item key number
        pass
    return {"items": items, "attachments": attach}

# ---------- resolve a board source to file(s) ----------

_W = re.compile(r"[A-Za-z0-9]+")
def _toks(s):
    return set(w.lower() for w in _W.findall(s or "") if len(w) > 2)

def resolve(idx, query, srcmap=None, fulltext_root=None):
    # 1) explicit override map (src_id or exact key -> file path)
    if srcmap and query in srcmap:
        f = srcmap[query]
        return {"match": "map", "query": query, "title": query,
                "files": [_abs(f, fulltext_root)], "score": 1.0}
    q = _toks(query)
    yr = ""
    m = re.search(r"\b(1[5-9]\d\d|20\d\d|21\d\d)\b", query)
    if m:
        yr = m.group(1)
    best, bestscore = None, 0.0
    for it in idx["items"]:
        hay = _toks(it["title"]) | _toks(" ".join(it["creators"]))
        if not hay:
            continue
        ov = len(q & hay) / (len(q) or 1)
        if yr and it["year"] == yr:
            ov += 0.25
        if it["files"]:
            ov += 0.1  # prefer items that actually have a file
        if ov > bestscore:
            best, bestscore = it, ov
    if best and bestscore >= 0.34:
        return {"match": "zotero", "query": query, "title": best["title"],
                "creators": best["creators"], "year": best["year"],
                "files": [_abs(f, fulltext_root) for f in best["files"]],
                "score": round(bestscore, 3)}
    return {"match": "none", "query": query, "files": [], "score": round(bestscore, 3)}

def _abs(rel, root):
    if not rel:
        return rel
    if root:
        return os.path.join(root, rel)
    return rel

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("rdf")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--resolve", default=None)
    ap.add_argument("--map", default=None, help="sources_map.json of src_id -> file")
    ap.add_argument("--fulltext-root", default=None)
    a = ap.parse_args()
    idx = parse(a.rdf)
    if a.list:
        withfile = [i for i in idx["items"] if i["files"]]
        print(json.dumps({"items": len(idx["items"]),
                          "attachments": len(idx["attachments"]),
                          "items_with_fulltext": len(withfile),
                          "sample_with_file": withfile[:8],
                          "sample_titles": [i["title"] for i in idx["items"][:12]]},
                         ensure_ascii=False, indent=2))
        return
    if a.resolve is not None:
        srcmap = json.load(open(a.map)) if a.map and os.path.exists(a.map) else None
        print(json.dumps(resolve(idx, a.resolve, srcmap, a.fulltext_root),
                         ensure_ascii=False, indent=2))
        return
    ap.error("give --list or --resolve")

if __name__ == "__main__":
    main()
