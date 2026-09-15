# Tender Console — data contract (v1)

This is the **contract** between the Tender Console app and the `rfp-cv-tailor` skill (decision **D4 = Contract**). Both read and write the same files in the **private data repo**, so they must agree on this shape. Keep `schemaVersion` in step when it changes.

## Repo layout (private data repo, default folder `data/`)

```
data/
  tenders.json        # all tender records
  experience.json     # the experience bank (single source of truth)
  harvest.json        # proposed reusable bullets awaiting your approval
cvs/
  base/               # your base CV(s)
  tailored/<tenderId>/  # tailored CV + coverage map per tender (skill writes here)
```

> Phase-1 stores all tenders in one `tenders.json` for simplicity and reliable syncing. If per-tender files are wanted later (cleaner git diffs), that's a Phase-2 change to this contract.

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
      "requirements": [ { "text": "...", "weight": "25%" } ],
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

## How the skill uses this (Phase 1 target)
1. Read `experience.json` + the tender's record from `tenders.json`.
2. Produce the tailored CV + coverage map; write them under `cvs/tailored/<tenderId>/`.
3. Update that tender's `cv.*` refs and `updatedAt` in `tenders.json`.
4. Append any new reusable bullets to `harvest.json`.

All writes use the GitHub Contents API against the **private data repo**.
