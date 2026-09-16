# Tender Console — data contract (v1.1)

This is the **contract** between the Tender Console app and the `rfp-cv-tailor` skill (decision **D4 = Contract**). Both read and write the same files in the **private data repo**, so they must agree on this shape. Keep `schemaVersion` in step when it changes.

**v1.1 (2026-09-16):** added the **SFIA layer** — `requirements[].sfia`, `requirements[].sfiaNote`, tender-level `sfiaFit`, and a new **`sfia-profile.json`**. All additions are optional and backward-compatible; the app recomputes SFIA fit live from `sfia-profile.json`, so older records without `sfia[]` simply show no SFIA fit.

## Repo layout (private data repo, default folder `data/`)

```
data/
  tenders.json        # all tender records
  experience.json     # the experience bank (single source of truth)
  harvest.json        # proposed reusable bullets awaiting your approval
  sfia-profile.json   # governed SFIA 9 profile, exported from the SFIA Skills Ledger (read-only for the app)
cvs/
  base/               # your base CV(s)
  tailored/<tenderId>/  # tailored CV + coverage map per tender (skill writes here)
```

> Phase-1 stores all tenders in one `tenders.json` for simplicity and reliable syncing.

## `tenders.json`
```json
{
  "schemaVersion": 1,
  "tenders": [
    {
      "id": "tender-xxxx",
      "client": "Riyadh Re",
      "title": "IT Strategy RFP",
      "sector": "Reinsurance",
      "source": "RFP ref / link",
      "deadline": "YYYY-MM-DD",
      "status": "prospect | reviewing | bidding | submitted | won | lost | withdrawn | passed",
      "goNoGo": { "decision": "undecided | bid | pass", "reason": "..." },
      "scoringWeights": [ { "criterion": "...", "weight": 20 } ],
      "requirements": [
        {
          "text": "W2 — Enterprise Data Strategy & Target Platform",
          "weight": "11%",
          "rating": "strong | partial | gap",
          "evidence": "coverage-map evidence (feeds the coverage Fit)",
          "sfia": [ { "code": "DATM", "requiredLevel": 6 }, { "code": "ARCH", "requiredLevel": 5 } ],
          "sfiaNote": "optional caveat, e.g. 'IT-strategy breadth here is data-centric'"
        }
      ],
      "sfiaFit": { "score": 85, "basis": "weighted: meets=1, partial=0.5, gap=0; floored; profile = sfia-profile.json (recomputed live by the app)" },
      "compliance":   [ { "label": "...", "done": false } ],
      "cv": { "baseRef": "cvs/base/...", "tailoredRef": "cvs/tailored/<id>/...", "coverageRef": "cvs/tailored/<id>/..." },
      "outcome": { "result": "pending | won | lost | withdrawn", "notes": "what went right/wrong (feeds trend analysis)" },
      "notes": "...",
      "createdAt": "ISO", "updatedAt": "ISO"
    }
  ]
}
```
Status split: **Console** shows `prospect, reviewing, bidding, submitted`; **Archive** shows `won, lost, withdrawn, passed`.

### Two independent fit lenses
- **Coverage Fit** — from `requirements[].rating` (`strong`/`partial`/`gap`) weighted by `weight`. Evidence-coverage against the coverage map. Unchanged.
- **SFIA Fit** — from `requirements[].sfia[]` (each `{code, requiredLevel}`) compared to the skill's level in `sfia-profile.json`. A requirement **meets** when every mapped skill's profile level ≥ its `requiredLevel`, **partial** when some do, **gap** when none do; the tender score is the weighted mean (floored), computed live by the app. A requirement may map to **one or many** SFIA skills (decision D4 = 1..n). Use `code: "(language)"` (or any non-SFIA marker) for a requirement with no SFIA skill (e.g. Arabic); it scores as not-met.

## `sfia-profile.json`  (governed profile — exported from the SFIA Skills Ledger)
```json
{
  "schemaVersion": 1,
  "_type": "sfia-profile",
  "subject": "Howard Diesel",
  "framework": "SFIA 9",
  "generated": "YYYY-MM-DD",
  "source": "SFIA 9 Skills Ledger artifact <id>",
  "skills": [
    { "code": "DATM", "name": "Data management", "category": "Development and Implementation",
      "band": "core", "level": 6, "status": "self-assessed", "validators": ["DAMA International","NDMO/PwC"], "ai": false }
  ]
}
```
**Read-only for the app and skill.** It is the single source of the profile levels. Re-export it from the SFIA Skills Ledger whenever levels change; the app and skill pick up the new levels on next sync. Only skills with a genuine level are included (band ≠ n/a).

## `experience.json`
```json
{ "schemaVersion": 1, "items": [
  { "id": "exp-xxxx", "cat": "KSA / GCC", "text": "...", "tags": ["..."], "source": "seed | manual | harvest:<tenderId>", "addedAt": "ISO" }
] }
```
This is the bank `rfp-cv-tailor` pulls from (decision **D3 = app owns the bank**). The skill should **read** it before tailoring, and never invent facts not represented here or in the tender.

## `harvest.json`  (decision **R2 = harvest**)
```json
{ "schemaVersion": 1, "queue": [
  { "id": "hv-xxxx", "tenderId": "tender-xxxx", "tenderClient": "Riyadh Re", "cat": "suggested category", "text": "proposed reusable bullet", "tags": ["..."] }
] }
```
When `rfp-cv-tailor` re-voices real experience for a tender and spots a reusable bullet not yet in the bank, it **appends a proposal here** — it does not write to `experience.json` directly. You approve/reject in the app; approval moves it into the bank.

## How the skill uses this (target)
1. Read `experience.json`, `sfia-profile.json`, and the tender's record from `tenders.json`.
2. Produce the tailored CV + coverage map; write them under `cvs/tailored/<tenderId>/`.
3. Fill `requirements[]` with `rating` + `evidence` (coverage) **and** `sfia[]` (`{code, requiredLevel}`) proposed from the requirement wording, for your confirmation (decision D2 = skill proposes, you confirm). Set `sfiaNote` where a requirement is domain/language knowledge rather than a SFIA skill.
4. Update that tender's `cv.*` refs and `updatedAt`; append any new reusable bullets to `harvest.json`.

Anti-fabrication: the skill never invents a `requiredLevel` or a mapping it cannot ground in the requirement text, and never edits `sfia-profile.json` (that is the Ledger's job). All writes use the GitHub Contents API against the **private data repo**.
