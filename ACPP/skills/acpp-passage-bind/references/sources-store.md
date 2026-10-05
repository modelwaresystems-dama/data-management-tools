# The sources store

Lives in the private repo at `modelware_app_storage/ACPP/sources/`.

```
sources/
  <library>.rdf        Zotero RDF export — reference identity + which file backs each item
  _fulltext/           the attached source documents (PDF, HTML). GIT-IGNORED, local only.
    files/<n>/...       (Zotero's own attachment layout, preserved)
  sources_map.json     explicit src_id -> file overrides for sources NOT in the Zotero library
  .gitignore           ignores _fulltext/
  README.md
```

## Why `_fulltext/` is git-ignored

The store decision is **quotes only**: Howard is entitled to quote short passages, but the full
text of a copyrighted work (DMBOK v2, ISO standards, journal PDFs) is never committed. The text
stays local for searching; only the confirmed quotation lands in the registers. Keep the
`_fulltext/` line in `.gitignore`.

## Re-exporting from Zotero

Export the collection as **Zotero RDF** with *"Export Files"* ticked — that is what produces the
`.rdf` plus the `files/` attachments this skill reads. (CSL-JSON / BibTeX do **not** carry the
attachment file paths, so they cannot drive passage-finding; keep the RDF.)

## `sources_map.json` — for sources the Zotero library does not hold

Format: an object of `src_id` → path relative to `sources/_fulltext/`.

```json
{
  "DAMA-DMBOK2-DEF":   "DMBOK2/VDiesel DMBOK2R (002)_unlocked.pdf",
  "DAMA-DMBOK2-GOV":   "DMBOK2/VDiesel DMBOK2R (002)_unlocked.pdf",
  "DAMA-DMBOK2-CH1":   "DMBOK2/VDiesel DMBOK2R (002)_unlocked.pdf",
  "DAMA-DMBOK2-VAL":   "DMBOK2/VDiesel DMBOK2R (002)_unlocked.pdf",
  "DAMA-DMBOK2-FRAME": "DMBOK2/VDiesel DMBOK2R (002)_unlocked.pdf",
  "DAMA-DMBOK2-STEW":  "DMBOK2/VDiesel DMBOK2R (002)_unlocked.pdf",
  "DAMA-DMBOK2-DQ":    "DMBOK2/VDiesel DMBOK2R (002)_unlocked.pdf"
}
```

To bind the 30 DMBOK-cited candidates in 1.1 / 1.2 / 2.x: drop the DMBOK v2 PDF into
`sources/_fulltext/DMBOK2/` (git-ignored) and keep the map above. The ISO/OECD/BIS standards are
paywalled — leave those passage-pending for Howard to paste unless he adds a licensed copy to
`_fulltext/` and maps it here.
