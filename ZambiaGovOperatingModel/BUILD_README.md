# Zambia Government Operating Model — build (generator)

**App:** Zambia Government Operating Model navigator (`index.html`)
**Current version:** v1.7.0
**Project:** Digital Zambia Acceleration (ZM-SZ-466193-CS-QBS) · Modelware Systems

This folder's `index.html` is a **generated** file. Do not hand-edit it. It is
produced by `build_opmodel.py` from two inputs:

```
zambia_opmodel.json     the model data — the single source of truth
opmodel_template.html    the UI shell (tabs, render functions, styling, figures)
```

## How it works

`build_opmodel.py` embeds the model JSON into the template's one data slot and
stamps the version + build date, then writes `index.html`:

- `const DATA = __DATA__;`  ← the whole model, serialized exactly as the app
  expects: `json.dumps(model, ensure_ascii=False).replace("</", "<\\/")`
  (minified; `</` escaped so the embedded JSON can never close the `<script>`
  tag early).
- `<meta name="version" content="__VERSION__">`  ← `model.meta.version`
- `<meta name="updated" content="__UPDATED__">`   ← `model.meta.generated`
  (SAST). This keeps the on-screen version badge and build date data-driven —
  never typed into the HTML by hand. The Navigator card's version also reads the
  `version` meta; its "updated" date comes from git.

## Usage

```bash
python3 build_opmodel.py                 # reads zambia_opmodel.json + opmodel_template.html,
                                         # writes index.html, stamps from model.meta
python3 build_opmodel.py --stamp-now     # use current SAST for the build date instead
python3 build_opmodel.py --model X.json --template Y.html --out Z.html
```

## What to edit where

- **Model content** (domains, subject areas, concepts, entities, ownership,
  control library, policy model): edit / regenerate `zambia_opmodel.json`.
  Targeted merges (e.g. the Policy-to-Data-Asset model) are applied to the JSON
  by their own merge scripts — e.g. `merge_policy_model.py` — then run
  `build_opmodel.py` to rebuild `index.html`.
- **UI** (tabs, render functions, CSS, embedded figures): edit
  `opmodel_template.html`, then rebuild. Never edit the generated `index.html`.
- **Version bump**: edit `meta.version` in `zambia_opmodel.json` (SemVer:
  PATCH fix / MINOR feature / MAJOR redesign), then rebuild. The badge and the
  Navigator card follow it.

## Verification (this build)

`build_opmodel.py` reproduces the deployed v1.7.0 `index.html`
**byte-for-byte** — same size (1,712,665 bytes), identical except the
`<meta name="updated">` line, which the generator sets from
`model.meta.generated` (`2026-10-31 12:48 SAST`) rather than the hand-written
`2026-10-31 10:29 SAST` in the currently deployed file. In other words, the
template was lifted from the live file with only the data, version and
build-date swapped out for placeholders; everything else — every render
function, every embedded figure — is preserved exactly. The next real rebuild
will carry the data-driven build date.

## Provenance of the template

`opmodel_template.html` was derived from the deployed v1.7.0 `index.html` by a
single, exact substring swap of the embedded `const DATA = …;` payload for
`const DATA = __DATA__;`, plus the two meta-tag placeholders. No other bytes
were changed, which is why reproduction is exact.
