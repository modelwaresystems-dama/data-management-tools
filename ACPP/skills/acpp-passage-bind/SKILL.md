---
name: "acpp-passage-bind"
description: "Bind verbatim passages to ACPP evidence: for a section whose G4 sources are chosen but passage-pending, map each source to its full text in the sources store, extract the exact sentence/paragraph + locator, propose 2-3 candidates per claim, confirm with Howard, then write the verbatim passage + locator into evidence_links.json (and the Source Manager). Use for 'find the passage', 'bind passages', 'harvest the quotes', 'fill the passages for 1.1', 'the sources have no passage', or clearing passage-pending evidence."
---

# ACPP · Passage Bind (G4 passage harvester)

The companion to the G4 Evidence gate. `acpp-evidence-forward` and `acpp-evidence-backfill`
choose **which source** supports each claim; they leave the **verbatim passage** for Howard to
paste whenever the text cannot be obtained — a row sits `passage_status: pending`. This skill
closes that gap: it reads the source's full text from the sources store, proposes the exact
sentence(s) that do the supporting with a precise locator, and — once Howard confirms — writes the
verbatim passage into the registers. **The passage is the evidence; without it a claim cannot pass
G4 or freeze at G5.**

Howard is the author. This skill extracts and ranks real source text and proposes it; it never
decides what the passage is, never fabricates a quote, and never commits to git.

## When to use

- A section's G4 sources are chosen but one or more links are `passage_status: pending` (or the
  board shows "N with passage" < sources accepted) — e.g. `dmbok-v3-ch1` / 1.1, where 30 candidate
  sources carry no quote.
- Howard says "find the passage(s)", "bind the passages", "harvest the quotes", "fill in the
  passages", "the references have no source text".
- Do **not** use this to pick sources (that is `acpp-evidence-forward/-backfill`) or to add a new
  warrant (that is G3 / the AIQ).

## The sources store (private repo `modelware_app_storage/ACPP/sources/`)

- `*.rdf` — the Zotero export: reference identity, and which attachment file backs each item.
- `_fulltext/` — the attached source documents (PDF, HTML snapshots). **Git-ignored, local only**
  (copyright: full third-party text is never committed — only confirmed quotations enter the
  registers).
- `sources_map.json` — explicit overrides mapping a board `src_id` to a file in `_fulltext/`, for
  sources not in the Zotero library (e.g. the DMBOK v2 PDF → the 7 `DAMA-DMBOK2-*` facets). See
  `references/sources-store.md`.

## Data

- Read: `database/evidence_links*.json` (the links + their `src_id`, `passage`, `passage_status`),
  `database/propositions.json` (the claim text), `sources/` (above). The board's in-app G4 review
  rows (`id, quote, locator, supports`) are the same data when you work from the app.
- Write (only after Howard confirms): `database/evidence_links*.json` — set `passage` (verbatim),
  `locator`, `passage_status: "present"` on the rows he confirmed. Mirror the same `passage` +
  `locator` into the Source Manager's `sources.json` link for that `src_id`/`p_id`. Nothing else
  changes; never set `human_approved` yourself.

## Procedure

1. **Scope.** Take the section (e.g. 1.1). List every evidence link that is `passage_status:
   pending` or has an accepted `src_id` with an empty `passage`. These are the rows to bind. Pair
   each with its claim text from `propositions.json` and its "why it supports" note.
2. **Resolve each source to its full text.** Run `scripts/zotero_index.py <export.rdf> --resolve
   "<cite or title+author+year>" --fulltext-root sources/_fulltext`, or take the file from
   `sources_map.json` when the `src_id` is listed there. If no file is found, **leave the row
   passage-pending and say so** — never guess a passage for a source whose text you do not have.
3. **Extract and propose.** For each (claim, source file) run `scripts/passage_find.py --claim
   "<proposition text>" --hint "<why it supports>" --n 3 <file>`. It returns 2-3 **verbatim**
   candidate passages, each with a locator (`p.<n>` for PDF, nearest heading + `¶<n>` for HTML) and
   the containing paragraph for context. For a PDF whose text tools are not on the host, stage it
   into the container first, then run the script there. Read each candidate yourself and drop any
   that does not actually support the claim — present only real fits.
4. **Confirm with Howard (the gate).** Present the candidates as a **decision-register** artifact
   (invoke the `decision-register` skill): one card per claim, showing the claim, the chosen
   source, and its 2-3 candidate passages each with locator and the "why it supports" line, one
   marked recommended; a comment box per card for "a passage I did not give you — paste it".
   Nothing is written until he answers. He may accept a candidate, paste his own exact text, or
   leave the row pending.
5. **Apply exactly what he chose.** Read his picks/comments back, report the tally, and write to
   `evidence_links*.json`: `passage` = the verbatim text he accepted (his pasted text wins over any
   candidate), `locator` = the confirmed locator, `passage_status: "present"`. Mirror `passage` +
   `locator` into the Source Manager `sources.json` for that link. Rows he left pending stay
   `pending`. Never alter his `src_id`, `support_strength`, interpretation, or `human_approved`.
6. **Report and hand back.** Tell Howard how many links now carry a passage, which remain pending
   and why (no full text on file / he deferred), and which files changed. Advancing the gate /
   freeze stays with `acpp-evidence-*` and `acpp-freeze`. **Do not run git** — Howard commits.

## Hard rules (ACPP integrity)

- **Verbatim only, never fabricated.** Every `passage` is copied character-for-character from the
  source. If the text cannot be obtained, the row stays `passage_status: pending` — a missing
  passage is never filled with a paraphrase or an AI summary.
- **AI proposes, Howard disposes.** The script only *orders* real source text; Howard chooses the
  passage. His pasted text always overrides a proposed candidate.
- **A locator with every passage.** No passage is written without where it was found (page or
  heading/paragraph), so it can be verified and cited.
- **Quotes only — honour the copyright store.** The full source text stays in `_fulltext/`
  (git-ignored). Only the confirmed short quotation enters the registers. Never copy a source's
  body text into a committed file.
- **Don't touch the interpretation.** The "why it supports the claim" line and `src_id` are the
  evidence gate's output; this skill fills the passage beside them, it does not rewrite them.
- **No source-laundering, AIQ stays out** — as in `acpp-evidence-forward`. A passage from the brief
  that requested the claim is not evidence; an `AIQ-ID` is never a source.

## Tools

- `scripts/zotero_index.py` — parse the Zotero RDF; `--list` audits item↔file coverage, `--resolve`
  maps a citation/`src_id` to its `_fulltext/` file (with `sources_map.json` overrides).
- `scripts/passage_find.py` — extract a PDF/HTML/TXT into verbatim units with locators and return
  the top-N candidate passages for a claim (pdftotext/pdfplumber + TF-IDF, pure-python fallbacks).
- `scripts/selftest.sh` — runs both on a tiny fixture to confirm the host can extract and rank.

## Worked example — `dmbok-v3-ch1` / 1.1

Thirty candidate sources, zero passages. The 7 `DAMA-DMBOK2-*` facets all point at one work, DMBOK
v2 — add `VDiesel DMBOK2R (002)_unlocked.pdf` to `sources/_fulltext/` and map the 7 `src_id`s to it
in `sources_map.json`. Then, for P-01.01-01 ("Data Management is the coordinated discipline for
managing data…"), the skill resolves `DAMA-DMBOK2-DEF` → that PDF, extracts the DMBOK definition
sentence with its page as locator, and offers it (plus two alternates) in the register. Howard
confirms the exact wording; `evidence_links.DM-01-01-01.json` gets `passage` + `locator` +
`passage_status: present`, and the Source Manager link mirrors it. The non-DMBOK claims resolve
against the Zotero library's attachments the same way (e.g. Carlson & Anderson 2007, Myers et al.
on data-quality dimensions).
