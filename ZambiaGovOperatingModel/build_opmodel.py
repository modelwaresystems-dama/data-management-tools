#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_opmodel.py - regenerate the Zambia Government Operating Model navigator (index.html) from
its data (zambia_opmodel.json) and the UI template (opmodel_template.html).

The model data is the single source of truth. This script embeds it into the template's
`const DATA = __DATA__;` slot (same serialization the app expects), and stamps the version
badge (<meta name="version">) and build date (<meta name="updated">) from the model's own
meta.version / meta.generated. Run after any change to zambia_opmodel.json:

    python3 build_opmodel.py

Optional: --model <path> --template <path> --out <path> --stamp-now (use current SAST instead
of model.meta.generated for the build date).

To change the UI (tabs, render functions, styling), edit opmodel_template.html - never the
generated index.html, which this script overwrites. To change the model, edit / regenerate
zambia_opmodel.json. Targeted data merges (e.g. the policy model) are applied to the JSON by
their own merge scripts, then this rebuilds index.html.
"""
import json, argparse, datetime, sys
from pathlib import Path

ap=argparse.ArgumentParser()
ap.add_argument("--model", default="zambia_opmodel.json")
ap.add_argument("--template", default="opmodel_template.html")
ap.add_argument("--out", default="index.html")
ap.add_argument("--stamp-now", action="store_true",
                help="use current SAST for the build date instead of model.meta.generated")
a=ap.parse_args()

model=json.loads(Path(a.model).read_text(encoding="utf-8"))
tpl=Path(a.template).read_text(encoding="utf-8")

meta=model.get("meta",{})
version=meta.get("version","0.0.0")
if a.stamp_now or not meta.get("generated"):
    updated=(datetime.datetime.utcnow()+datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M")+" SAST"
    meta["generated"]=updated
else:
    updated=meta["generated"]

# same serialization the navigator embeds (minified, </ escaped so no premature </script>)
data_json=json.dumps(model, ensure_ascii=False).replace("</","<\\/")

for ph in ("__DATA__","__VERSION__","__UPDATED__"):
    if ph not in tpl: sys.exit("template missing placeholder: "+ph)
html=(tpl.replace("__VERSION__",version)
         .replace("__UPDATED__",updated)
         .replace("__DATA__",data_json))

Path(a.out).write_text(html, encoding="utf-8")
print("built", a.out, "| version", version, "| built", updated, "|", len(html), "bytes")
