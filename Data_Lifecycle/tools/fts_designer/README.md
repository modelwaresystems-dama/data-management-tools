# fts_designer engine

Scripts the fts-designer skill runs. The skill drafts the semantic content of a Finite State Transition model into a design spec; these scripts do the mechanical part.

- `fts_build.py spec.json out.fts.json`: compile a design spec into the canonical model. Assigns stable IDs, derives KA Interaction rows from the KA placement, composite state vectors and the relationship graph, records a derivation trace per row, runs the soft QA (the retained decisions guide, they do not gate) and stamps version and build time (SAST). Inherits the 24 Important Retained Decisions from `ird_rules.json` unless the spec carries its own.
- `fts_workbook.py model.fts.json out.xlsx`: the 27-sheet review workbook in the Plan-Design v2 layout, plus Context Capture, Derivation Trace, QA Findings and Legend sheets.
- `fts_diagrams.js model.fts.json outdir`: UML, simplified and global-only Mermaid sources plus the code legend (uses `fsm_source.js`, the same generator as the viewer).
- `fts_scxml.py model.fts.json out.scxml`: W3C SCXML export (compound states, initial, final, transitions with event and cond).
- `../convert_fts.py workbook.xlsx out.fts.json`: re-import an edited workbook.

Design specs and models are data and live in the private repo, never here.

## fts_sim.py (batch validation and coverage engine, v0.1)

    python fts_sim.py <model.fts.json> [--scenario scenario.json] [--out dir] [--loop-bound 1]

Runs the minimum validation suite (referential integrity, initial and terminal states, reachability at Global and sub-state level, dead transitions and trap states, non-determinism, missing events and missing denial paths, invariant and contract presence, exception applicability, elementary cycles, terminal irreversibility, hold-before-destruction), then a coverage run that fires every reachable transition at least once and evaluates every guard both TRUE and FALSE. Writes `<model>_sim_report.json` and `<model>_sim_report.xlsx` (Run Summary, Validation Findings, State Coverage, Transition Coverage, Guard Verdicts, Cycles, Trace, Asset Profile). A scenario file supplies an asset profile, explicit guard outcomes and a default verdict; a guard or condition may carry an optional `expression` evaluated over the asset profile.
