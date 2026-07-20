# Semantium String Classifier — Level 0 (standalone)

Walks a string through the full 8-step Semantium Level 0 wizard — real WordNet sense
retrieval, Subject Area, Q6 Facet, Quant Class, Level/Type, Quant Edge, contextual
example, commit — into a governed Lexical Object inventory. Includes an Edit-All-Fields
inventory manager, Predicate Registry (direction, registered inverse, five-defect
checklist, FCO-IM verbalizations), derived Thesaurus view, and canonical-first Excel
export/import compatible with `semantium-lexical-gate` / `semantium-inventory-auditor`.

## Files
| File | Purpose |
|---|---|
| `string-classifier.html` | The app — single self-contained file |
| `wordnet-data.json` | WordNet 3.0 dataset (nouns+verbs+relations, ~17 MB / ~5 MB gzipped) — **must sit in the same folder** |
| `wordnet-data.js` | Offline twin for `file://` use (see below) |
| `gen_wordnet.py` | Regenerates both dataset files from NLTK (documentation of provenance) |

## Deploy — GitHub Pages (primary)
Put `string-classifier.html` and `wordnet-data.json` in the same folder
(`Glossary_SemanticModel/`). The app fetches the dataset same-origin on load. Done.

## Offline / file:// fallback
Browsers block `fetch` on `file://`. Either:
1. add `<script src="wordnet-data.js"></script>` just above the app's `<script>` in the HTML, or
2. open the app and use the **Load dataset…** button in the red banner to pick `wordnet-data.json`.

## Data
- Autosaves to the browser's localStorage (namespace `semantium.sc.*`) on every change.
- **The exported workbook is the portable truth** — Export before switching machines;
  Load (Open/Merge) to continue.
- Audit round-trip: export → run the `semantium-inventory-auditor` Claude skill →
  Load the audited copy back; verdicts/health display read-only.

WordNet® — Princeton University, WordNet 3.0 License.
