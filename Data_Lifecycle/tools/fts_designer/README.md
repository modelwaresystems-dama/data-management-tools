# fts_designer engine

Scripts the fts-designer skill runs. The skill drafts the semantic content of a Finite State Transition model into a design spec; these scripts do the mechanical part.

- `fts_build.py spec.json out.fts.json`: compile a design spec into the canonical model. Assigns stable IDs, derives KA Interaction rows from the KA placement, composite state vectors and the relationship graph, records a derivation trace per row, runs the soft QA (the retained decisions guide, they do not gate) and stamps version and build time (SAST). Inherits the 24 Important Retained Decisions from `ird_rules.json` unless the spec carries its own.
- `fts_workbook.py model.fts.json out.xlsx`: the 27-sheet review workbook in the Plan-Design v2 layout, plus Context Capture, Derivation Trace, QA Findings and Legend sheets.
- `fts_diagrams.js model.fts.json outdir`: UML, simplified and global-only Mermaid sources plus the code legend (uses `fsm_source.js`, the same generator as the viewer).
- `fts_scxml.py model.fts.json out.scxml`: W3C SCXML export (compound states, initial, final, transitions with event and cond).
- `../convert_fts.py workbook.xlsx out.fts.json`: re-import an edited workbook.

Design specs and models are data and live in the private repo, never here.
