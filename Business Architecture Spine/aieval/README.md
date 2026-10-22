# AI Evaluation Framework, source

Builds `AI_Evaluation_Framework.html` and `AI_Evaluation_Framework_FACILITATOR.html`, the two
editions of the third HTML application. Both are single self-contained files: no server, no
install, the spreadsheet reader inlined, and they read the same authoritative
`<Company>_FutureState_Model.xlsx` as the Lineage Explorer and the Business Architecture app.

Current version: **v2.1.0**.

## Build

```
python3 build.py
```

No dependencies beyond Python 3. The two HTML files are written beside `build.py`, and the
script asserts that the student edition contains none of the model-answer text before it
finishes. If that assertion fails the build is unsafe to distribute.

Copy the two outputs up one level, to the folder that serves the other apps.

## The two editions

Both are built from the same source. The difference is not a password and not a hidden panel:
the facilitator material is **absent from the student file**.

| | Student | Facilitator |
| :--- | :--- | :--- |
| The application | yes | yes |
| Eighteen model answers | no | yes |
| Worked AGGPSA U05 evaluation | no | yes |
| Facilitator guide and role cards | no | yes |

`build.py` includes `10_answers.js`, `08_guide.js` and `09_guide_ui.js` only in the facilitator
build, and substitutes a stub that sets `FACILITATOR = false` and empties `MODEL_ANSWERS` in the
student build. The leak check at the end greps the student output for nine probe strings drawn
from the answers, the worked example and the guide.

## Layout

| Path | What it is |
| :--- | :--- |
| `build.py` | Concatenates the sources into the two editions and runs the leak check |
| `vendor/xlsx.mini.min.js` | SheetJS 0.18.5 mini, inlined so the app runs fully offline |
| `src/01_head.html` | House theme tokens, all CSS, the guide drawer, print rules |
| `src/02_body.html` | Markup for the twelve tabs and every view |
| `src/03_spec.js` | v1 spec: pillars and dimensions kept as the legacy view, the ninety-minute flow, eighteen steps, the canvas |
| `src/03b_v2spec.js` | v2 spec: five assurance lenses, eight concerns, the Ethical Assessment Review structures, both schemas, the S1 to G6 lifecycle |
| `src/04_core.js` | Workbook parsing, spine resolution, threshold recomputation, state |
| `src/04b_req.js` | The v2 engine: requirement, specification, run and result, and all seeding from the model |
| `src/05_views.js` | Tabs, setup, session flow, spine, register, remediation, gates |
| `src/05b_reqviews.js` | Requirements, assurance and lifecycle views, plus the v2 reference tab |
| `src/06_canvas.js` | Data Product Canvas and the evidence pack checklist |
| `src/07_export.js` | Excel, markdown, JSON and print exports, and application init |
| `src/08_guide.js` | Facilitator guide content, per screen and per step |
| `src/09_guide_ui.js` | The guide drawer, docking and printing |
| `src/10_answers.js` | Model answers and the worked AGGPSA U05 evaluation. Facilitator only |
| `src/11_mindmap.js` | The supplied mind map and its crops, base64 encoded |

## Three rules the code holds

These are load-bearing. Relaxing any of them breaks the argument the framework exists to make.

1. **A requirement is generated from a claim, a risk, an obligation or an architecture anchor.
   It is never generated from a model.** Starting from the model is how an evaluation ends up
   measuring what happens to be measurable.
2. **A specification is typed.** Operator, threshold, warning level, stop threshold and tolerance
   are values, not prose.
3. **Status is computed at read time from the observed value.** Nothing writes a Pass or a Fail
   into storage anywhere in the application or in any export. A human exception is a separate
   signed override recorded beside the run, and the computed result stays visible underneath it.

A fourth follows from them: a concern has no RAG control, because a score typed in by hand is an
opinion detached from the underlying tests. Concern status is derived from the requirements filed
under it, and a concern with nothing specified reads **Unevidenced**, never green.

## Two em dashes in the code must stay

`src/04_core.js` parses em dashes out of the company's own workbook, in two places: reading the
company name from row 2, and normalising threshold ranges. Neither produces an em dash in any
output. `noem()` in the same file strips U+2014 from everything the application generates,
including every exported cell, so em dashes in a source workbook do not reach a deliverable. En
dashes are deliberately left alone, because they carry meaning in ranges such as `0.80-1.25`.

## Verification

Verified against `model/AGGPSA_FutureState_Model.xlsx` and `model/AGGPSA_FutureState_Model_v2.xlsx`
with use case U05, in headless Chromium: all twelve tabs render, all eighteen steps and all
eighteen model answers render, the facilitator guide resolves for every tab, zero console errors,
zero em dashes in rendered text or in any export, and no `TODO` marker read as a value. Seventy
requirements from the original workbook and seventy-four from the v2 one, thirty-six carrying real
runs, twenty-four computed passes and twelve computed failures.
