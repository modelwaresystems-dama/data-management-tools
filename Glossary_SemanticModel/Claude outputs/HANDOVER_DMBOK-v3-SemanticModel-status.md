# Handover — DMBOK v3 01. Data Management: Semantic Model status

**Glossary:** `Ch 01 Key Terms - Final Glossary` (customer *DMBOK v3 01. Data Management*)
**Snapshot:** 2026-10-27 (live glossary — figures are a point-in-time read; the glossary is being actively edited)
**Workbench build analysed:** `glossary-workbench.html` **v4.81**
**For:** whoever continues the DMBOK v3 Chapter 1 editorial / glossary work

---

## 1. Snapshot

| | |
|---|---|
| Terms | **193** (190 counted in the model; 3 Retired excluded) |
| SPO statements | 669 |
| Term Type | all 193 are `Entity` |
| Lifecycle | In Review **167** · Draft **19** · Approved **3** · Deprecated **1** · Retired **3** |

---

## 2. What the Workbench now computes (tooling status — no action needed)

The reference graph is now built from the **governed columns**, not from parsing Definition prose. This was the fix made across v4.77–v4.81:

- **Is-a hierarchy** → read from the **`Hypernym`** column only (single parent; blank = a root or an undefined stub). No SPO or definition fallback.
- **Reference edges, Missing terms, Orphans** → read from the **`SPO`** sheet (Subject → Predicate → Object). Rejected SPO rows skipped.
- **Retired / Deprecated / Draft** excluded from the checks where appropriate (Draft/Deprecated treated as intentionally incomplete).
- Definition text is now purely human-readable — wording ("is one of", "the", plurals, parentheticals) no longer affects structure.

The build carries a version badge (`v4.81`, meta tag + header/footer) and is gated by a 6-suite test harness (`preship.sh`, all green). It is committed in the `data-management-tools/Glossary_SemanticModel` repo folder.

---

## 3. Governance checks — current results

| Check | Result | Status |
|---|---|---|
| Duplicates | 0 | ✅ clean |
| Orphans | **0** | ✅ clean (Draft/Deprecated/Retired excluded) |
| Is-a statements | 179 across **3 roots** | ✅ clean, no unresolved parents |
| Missing referenced terms | **44** | ⚠ worklist — see §5 |

All Hypernyms resolve to defined terms (no "amber" undefined-parent nodes in the tree).

---

## 4. The is-a taxonomy

Three roots, with child counts:

- **Abstract Thing** — 120 descendants
- **Activity** — 11
- **Process** — 2

The Data Management spine is correct end to end:

```
Abstract Thing
  └─ Discipline
       └─ Data Management Discipline
            └─ Data Management Subdiscipline
                 └─ Knowledge Area
                      ├─ Core Knowledge Area
                      └─ Relational Knowledge Area
```

---

## 5. Worklist

### 5a. Undefined referenced terms — 44 (define, or re-point the SPO Object to an existing term)

These are terms used as SPO Objects that are **not** defined in the glossary. (`×n` = referenced n times.)

AI System · Algorithm · Communication · Concept ×2 · Conduct · Consumption ×2 · Continuous Improvement · Data Origin · Dimension · Disposal ×2 · Ethical Boundary · Fact · Fitness · Human Intelligence · Legal Obligation · Meaning ×2 · Mitigation · Operation · Operations · Organization · Origin ×2 · Owner · Party ×2 · Pattern · Performance · Personal Data ×2 · Processing · Protection · Quality Service Level · Reasoning · Regulation · Repeatability · Requirement · Retention Schedule · Role · Safeguard · Stage · Stakeholder Trust · Storage · Training Data · Transformation · Unauthorized Access · Understanding ×2 · Usage

Worth a quick pass for near-duplicates/variants to consolidate rather than define twice: **Operation / Operations**, **Origin / Data Origin**, **Organization** (spelling).

### 5b. Short-name edges auto-applied — 7 (confirm or reject)

Where an SPO Object was not a defined term but exactly one defined term ended with it, v4.81 resolves it (so it is **not** counted as missing). These create reference edges — confirm they are semantically intended:

| SPO Object | resolved to | confidence |
|---|---|---|
| Consumer | Data Consumer | solid |
| Policy | Data Policy | solid |
| Capability | Data Capability | solid |
| Content | Knowledge Content | plausible |
| Context | Strategic Context | **check** — "Context" is generic |
| Learning | Machine Learning | **check** |
| Decision-Making | Shared Decision-Making | **check** |

`Party` and `Performance` were **not** auto-resolved (two candidates each — ambiguous), so they remain on the missing list for an explicit decision.

### 5c. Still pending (intentionally incomplete, not defects)

- **19 Draft stubs** (Lifecycle = Draft) — definitions being authored; excluded from Orphans/Missing by design.
- **10 terms with a blank Hypernym** — the taxonomy roots plus any not-yet-parented term; give each a Hypernym to place it in the tree.

---

## 6. Notes

- The glossary is **live** — these counts move as terms are edited. Re-run from the Workbench (Semantic model → the checks, or Export site) for a current read.
- No further tooling changes were made while producing this report. The short-name mappings in §5b (specifically Context / Learning / Decision-Making) are the one open tooling decision — they can be kept, narrowed to the three "Data …" matches, or dropped entirely.
