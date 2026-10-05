#!/usr/bin/env python3
"""
acpp-passage-bind · passage_find.py

Given a CLAIM (a proposition, plus an optional "why it supports" hint) and one or
more SOURCE files (PDF / HTML / TXT), extract the source text with locators and
return the top-N VERBATIM candidate passages that best support the claim.

The skill NEVER fabricates a quote: every candidate's `passage` is copied
character-for-character from the source, and `locator` is where it was found
(page for PDF, paragraph index / nearest heading for HTML). Ranking only orders
real source text for Howard to confirm — it does not decide.

Backends (first available wins): pdftotext (poppler) → pdfplumber for PDF;
BeautifulSoup for HTML. Ranking: scikit-learn TF-IDF cosine, with a pure-python
fallback so the script still runs with no third-party packages.

CLI:
    python3 passage_find.py --claim "<proposition text>" \
            [--hint "<why it supports>"] [--n 3] [--min-words 6] [--max-words 80] \
            SOURCE [SOURCE ...]
Outputs JSON: {"claim":..., "candidates":[{passage, locator, source, score, unit}]}.
"""
import argparse, json, os, re, subprocess, sys, math
from collections import Counter

# ---------- text extraction (verbatim units with locators) ----------

def _paras(text):
    """Split a block of text into paragraphs on blank lines; collapse soft wraps."""
    out = []
    for chunk in re.split(r"\n\s*\n", text):
        p = re.sub(r"[ \t]*\n[ \t]*", " ", chunk).strip()
        p = re.sub(r"[ \t]{2,}", " ", p)
        if p:
            out.append(p)
    return out

def extract_pdf(path):
    """Return [(text, locator)] paragraph units, locator='p.<page>'. Verbatim."""
    units = []
    # Prefer poppler's pdftotext: default reading order, form-feed (\f) between pages.
    try:
        raw = subprocess.run(["pdftotext", "-q", path, "-"],
                             capture_output=True, text=True, timeout=180).stdout
        if raw.strip():
            for pageno, page in enumerate(raw.split("\f"), start=1):
                for para in _paras(page):
                    units.append((para, "p.%d" % pageno))
            if units:
                return units
    except Exception:
        pass
    # Fallback: pdfplumber
    try:
        import pdfplumber
        with pdfplumber.open(path) as pdf:
            for pageno, page in enumerate(pdf.pages, start=1):
                txt = page.extract_text() or ""
                for para in _paras(txt):
                    units.append((para, "p.%d" % pageno))
    except Exception as e:
        sys.stderr.write("PDF extract failed for %s: %s\n" % (path, e))
    return units

def extract_html(path):
    """Return [(text, locator)] units from HTML, locator tracks nearest heading + ¶ index."""
    units = []
    try:
        from bs4 import BeautifulSoup
        with open(path, "rb") as fh:
            soup = BeautifulSoup(fh.read(), "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
            tag.decompose()
        heading = ""
        idx = 0
        for el in soup.find_all(["h1", "h2", "h3", "h4", "p", "li", "blockquote"]):
            t = re.sub(r"\s+", " ", el.get_text(" ", strip=True)).strip()
            if not t:
                continue
            if el.name in ("h1", "h2", "h3", "h4"):
                heading = t[:80]
                continue
            idx += 1
            loc = ("“%s” ¶%d" % (heading, idx)) if heading else ("¶%d" % idx)
            units.append((t, loc))
    except Exception as e:
        sys.stderr.write("HTML extract failed for %s: %s\n" % (path, e))
    return units

def extract_docx(path):
    """Return [(text, locator)] from a .docx, locator = nearest heading + ¶index. Verbatim."""
    units = []
    try:
        import docx
        d = docx.Document(path)
        heading, idx = "", 0
        for p in d.paragraphs:
            t = re.sub(r"\s+", " ", p.text).strip()
            if not t:
                continue
            style = ((p.style.name if p.style else "") or "").lower()
            if style.startswith("heading") or style.startswith("title"):
                heading = t[:80]
                continue
            idx += 1
            loc = ("“%s” ¶%d" % (heading, idx)) if heading else ("¶%d" % idx)
            units.append((t, loc))
        if units:
            return units
    except Exception as e:
        sys.stderr.write("python-docx failed for %s: %s (using xml fallback)\n" % (path, e))
    # no-dependency fallback: read word/document.xml and split on paragraph marks
    try:
        import zipfile
        with zipfile.ZipFile(path) as z:
            xml = z.read("word/document.xml").decode("utf-8", "ignore")
        idx = 0
        for pr in re.split(r"</w:p>", xml):
            txt = "".join(re.findall(r"<w:t[^>]*>(.*?)</w:t>", pr, re.S))
            txt = re.sub(r"<[^>]+>", "", txt)
            t = re.sub(r"\s+", " ", txt).strip()
            if not t:
                continue
            idx += 1
            units.append((t, "¶%d" % idx))
    except Exception as e:
        sys.stderr.write("DOCX extract failed for %s: %s\n" % (path, e))
    return units

def extract_txt(path):
    try:
        with open(path, encoding="utf-8", errors="ignore") as fh:
            return [(p, "¶%d" % i) for i, p in enumerate(_paras(fh.read()), start=1)]
    except Exception as e:
        sys.stderr.write("TXT extract failed for %s: %s\n" % (path, e))
        return []

def extract_units(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".pdf":
        return extract_pdf(path)
    if ext in (".html", ".htm"):
        return extract_html(path)
    if ext == ".docx":
        return extract_docx(path)
    if ext == ".doc":
        sys.stderr.write("%s: legacy .doc not supported — save as .docx or PDF first\n" % path)
        return []
    return extract_txt(path)

# ---------- sentence splitting (keep passages quotable) ----------

_SENT = re.compile(r"(?<=[.!?])\s+(?=[A-Z(“\"])")

def to_sentences(para):
    parts = [s.strip() for s in _SENT.split(para) if s.strip()]
    return parts or [para]

# ---------- ranking ----------

_WORD = re.compile(r"[A-Za-z][A-Za-z\-']+")
_STOP = set("""the a an and or of to in for on with as by is are be been being that this these those it its
from at into over under about across their there which who whom whose what when where why how not no also
such than then so can may must should would could we our you your they them he she his her i me my""".split())

def _tok(s):
    return [w.lower() for w in _WORD.findall(s) if w.lower() not in _STOP and len(w) > 2]

def rank(claim, hint, units, n, min_words, max_words):
    query = (claim + " " + (hint or "")).strip()
    # Build sentence-level candidates with a pointer back to their paragraph+locator.
    cands = []
    for (para, loc) in units:
        for sent in to_sentences(para):
            wc = len(sent.split())
            if wc < min_words or wc > max_words:
                continue
            cands.append({"passage": sent, "locator": loc, "unit": para})
    if not cands:
        # fall back to paragraph units if sentences were all filtered
        cands = [{"passage": p, "locator": l, "unit": p} for (p, l) in units
                 if min_words <= len(p.split()) <= max_words * 2]
    if not cands:
        return []
    texts = [c["passage"] for c in cands]
    scores = _score(query, texts)
    key = set(_tok(query))
    for c, s in zip(cands, scores):
        ov = key & set(_tok(c["passage"]))
        c["score"] = round(float(s) + 0.04 * len(ov), 4)  # small boost for shared key terms
        c["shared_terms"] = sorted(ov)[:8]
    cands.sort(key=lambda c: c["score"], reverse=True)
    # de-duplicate near-identical passages
    seen, out = set(), []
    for c in cands:
        k = re.sub(r"\W+", "", c["passage"].lower())[:120]
        if k in seen:
            continue
        seen.add(k)
        out.append(c)
        if len(out) >= n:
            break
    return out

def _score(query, texts):
    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        vec = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        m = vec.fit_transform([query] + texts)
        return cosine_similarity(m[0:1], m[1:]).ravel().tolist()
    except Exception:
        # pure-python TF-IDF cosine fallback
        docs = [Counter(_tok(t)) for t in texts]
        q = Counter(_tok(query))
        df = Counter()
        for d in docs:
            for term in d:
                df[term] += 1
        N = len(docs) + 1
        def idf(t):
            return math.log((N + 1) / (df.get(t, 0) + 1)) + 1
        def vecify(c):
            return {t: c[t] * idf(t) for t in c}
        qv = vecify(q)
        qn = math.sqrt(sum(v * v for v in qv.values())) or 1.0
        res = []
        for d in docs:
            dv = vecify(d)
            dn = math.sqrt(sum(v * v for v in dv.values())) or 1.0
            dot = sum(qv.get(t, 0) * dv.get(t, 0) for t in qv)
            res.append(dot / (qn * dn))
        return res

# ---------- CLI ----------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sources", nargs="+")
    ap.add_argument("--claim", required=True)
    ap.add_argument("--hint", default="")
    ap.add_argument("--n", type=int, default=3)
    ap.add_argument("--min-words", type=int, default=6)
    ap.add_argument("--max-words", type=int, default=80)
    a = ap.parse_args()
    all_units = []
    for src in a.sources:
        for (txt, loc) in extract_units(src):
            all_units.append((txt, "%s · %s" % (os.path.basename(src), loc)))
    cands = rank(a.claim, a.hint, all_units, a.n, a.min_words, a.max_words)
    print(json.dumps({"claim": a.claim, "hint": a.hint,
                      "units_scanned": len(all_units),
                      "candidates": cands}, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
