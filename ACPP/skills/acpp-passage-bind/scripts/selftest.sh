#!/usr/bin/env bash
# acpp-passage-bind selftest — proves the host can extract text and rank passages.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
TMP="$(mktemp -d)"
cat > "$TMP/fixture.txt" <<'EOF'
Data Management is the coordinated discipline for managing data and information assets across
their lifecycles to deliver, control, protect and enhance their value.

Within quality literature, the concept of fitness for use has been widely adopted as a definition
for data quality. Data quality is therefore a multi-dimensional concept.

The weather on Tuesday was mild with a light breeze and occasional cloud.
EOF

echo "# passage_find on a text fixture"
python3 "$HERE/passage_find.py" --claim "Data management manages data assets across their lifecycle to deliver and protect value." --n 1 "$TMP/fixture.txt"

echo
echo "# python version / backends"
python3 - <<'PY'
import importlib
for m in ("pdfplumber","bs4","sklearn"):
    try: importlib.import_module(m); print(m, "ok")
    except Exception: print(m, "MISSING (fallback used)")
import shutil; print("pdftotext", "ok" if shutil.which("pdftotext") else "MISSING (pdfplumber used)")
PY
rm -rf "$TMP"
echo "selftest done"
