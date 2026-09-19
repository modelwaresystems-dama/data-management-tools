# Data Lifecycle: Finite State Transition tools

Tools for describing the Data Lifecycle as a Finite State Transition (FST) model of a Data Asset rather than a linear sequence of stages. A stage becomes a state with a contract: conditions to enter, conditions to remain (invariants), permitted activities, conditions to leave, and guarded, authorised transitions. Knowledge Areas are orthogonal state machines that contribute guards and evidence to the global transitions.

This folder is public and holds **no model data**. Models live in a private store and are loaded into the viewer at runtime.

## Contents

- `fts_viewer.html`: single-file, offline viewer. Open it in a browser and point it at the `models` folder of the private repo: every `.fts.json` in it loads (the Global FTS and each Knowledge Area FTS), and you switch between them in the bar at the top. The loaded set is remembered in the browser on that computer, so the next open needs no re-selection; use Load models folder to refresh after the models change. Where a Knowledge Area model contributes guards to a Global transition (by transition ID), the Global transition's contract shows them, labelled with the contributing model. Tabs: Contrast (simple lifecycle against the state model), State map, Transitions (the full eligibility and authorisation contract per transition), Knowledge Areas, Rules. Nothing is uploaded; files are read in the browser only.
- `tools/convert_fts.py`: converts a DMBOK State Transition metadata workbook (the 27-sheet format) into the `.fts.json` model. Usage: `python convert_fts.py <workbook.xlsx> <out.fts.json>`. Requires `openpyxl`.
- `schema/fts_model.md`: the model shape the viewer reads and the skill populates.

## Versioning

The viewer carries its version and build date and time (SAST) in the header and footer. A model carries its own version, status and build stamp in `meta`.
