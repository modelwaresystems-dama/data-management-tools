# Tender Console — data contract (v1.2)

Contract between the Tender Console app and the `rfp-cv-tailor` skill (decision **D4 = Contract**). Both read/write the same files in the **private data repo**, so they must agree on this shape.

**v1.2 (2026-09-16):** the SFIA profile gained a **responsibility layer** and the **app is now the profile master**. `sfia-profile.json` schemaVersion is **2** and holds `attributes[]` (5 generic) + `behaviours[]` (12 SFIA 9 behavioural factors) alongside all 141 `skills[]`. Requirements gained optional `responsibility[]`, and tenders an optional `responsibilityFit`. The app's **SFIA Profile** tab reads *and writes* `sfia-profile.json`; the standalone SFIA Skills Ledger artifact is superseded (kept only as a backup).
**v1.1 (2026-09-16):** added `requirements[].sfia`, `requirements[].sfiaNote`, tender `sfiaFit`, and `sfia-profile.json`.

## Repo layout (private data repo, default folder `data/`)

```
data/
  tenders.json        # all tender records
  experience.json     # the experience bank
  harvest.json        # proposed reusable bullets awaiting approval
  sfia-profile.json   # governed SFIA 9 profile — skills + generic attributes + behavioural factors (app is master)
cvs/
  base/               # base CV(s)
  tailored/<tenderId>/  # tailored CV + coverage map per tender
```

## `tenders.json`
```json
{
  "schemaVersion": 1,
  "tenders": [
    {
      "id": "tender-xxxx", "client": "Riyadh Re", "title": "IT Strategy RFP", "sector": "Reinsurance",
      "source": "...", "deadline": "YYYY-MM-DD",
      "status": "prospect|reviewing|bidding|submitted|won|lost|withdrawn|passed",
      "goNoGo": { "decision": "undecided|bid|pass", "reason": "..." },
      "owner": "Howard Diesel",
      "scoringWeights": [ { "criterion": "...", "weight": 20 } ],
      "requirements": [
        {
          "text": "W2 — Enterprise Data Strategy & Target Platform",
          "weight": "11%",
          "rating": "strong|partial|gap",
          "evidence": "coverage-map evidence (feeds the coverage Fit)",
          "sfia": [ { "code": "DATM", "requiredLevel": 6 }, { "code": "ARCH", "requiredLevel": 5 } ],
          "responsibility": [ { "attr": "complexity", "requiredLevel": 5 }, { "attr": "knowledge", "requiredLevel": 6 } ],
          "sfiaNote": "optional caveat"
        }
      ],
      "sfiaFit": { "score": 85, "basis": "..." },
      "responsibilityFit": { "score": 100, "basis": "..." },
      "compliance": [ { "label": "...", "done": false } ],
      "cv": { "baseRef": "...", "tailoredRef": "...", "coverageRef": "..." },
      "outcome": { "result": "pending|won|lost|withdrawn", "notes": "..." },
      "notes": "...", "createdAt": "ISO", "updatedAt": "ISO"
    }
  ]
}
```

### Three fit lenses (all recomputed live by the app)
- **Coverage Fit** — from `requirements[].rating` weighted by `weight`. Evidence coverage vs the coverage map.
- **SFIA Fit** — from `requirements[].sfia[]` (`{code, requiredLevel}`) vs each skill's level in `sfia-profile.json`. Meets = all mapped skills ≥ required; partial = some; gap = none. `code:"(language)"` marks a non-SFIA (e.g. Arabic) requirement.
- **Responsibility Fit** — from `requirements[].responsibility[]` (`{attr, requiredLevel}`) vs the profile's generic-attribute levels. `attr` ∈ `autonomy | influence | complexity | knowledge | business_skills`. Same meets/partial/gap logic, weighted.

A requirement may map to **one or many** skills and/or attributes (D4 = 1..n).

## `sfia-profile.json`  (schemaVersion 2 — app is master)
```json
{
  "schemaVersion": 2, "_type": "sfia-profile", "subject": "Howard Diesel", "framework": "SFIA 9",
  "generated": "YYYY-MM-DD", "source": "...",
  "levelNames": { "1": "Follow", "...": "...", "7": "Set strategy/inspire" },
  "evidence": { "engagements": [...], "assets": [...], "certs": [...] },
  "skills": [
    { "code": "DATM", "name": "Data management", "category": "...", "subcategory": "...",
      "band": "core|working|foundational|na", "level": 6, "status": "self-assessed|validated|n/a",
      "validators": ["..."], "ai": false, "rationale": "...", "evidence": ["E-NDMO", "..."] }
  ],
  "attributes": [
    { "key": "autonomy", "name": "Autonomy", "level": 6, "definition": "...", "rationale": "..." }
  ],
  "behaviours": [
    { "key": "communication", "name": "Communication", "level": 7, "rationale": "..." }
  ]
}
```
- `skills[]` holds **all 141** SFIA 9 skills; `band:"na"` (level `null`) marks non-applicable ones (editable/promotable in the app).
- `attributes[]` — the **5 generic attributes** (autonomy, influence, complexity, knowledge, business_skills), each level 1–7.
- `behaviours[]` — the **12 SFIA 9 behavioural factors** (collaboration, communication, improvement_mindset, creativity, decision_making, digital_mindset, leadership, learning_development, planning, problem_solving, adaptability, security_privacy_ethics).
- **The app's SFIA Profile tab reads and writes this file.** The `rfp-cv-tailor` skill reads it (never edits it). Editing a level in the app and clicking **Save profile** rewrites the file; commit & push to publish.

## `experience.json` / `harvest.json`
Unchanged from v1 — see prior contract.

## How the skill uses this (target)
1. Read `experience.json`, `sfia-profile.json`, and the tender record.
2. Produce the tailored CV + coverage map into `cvs/tailored/<tenderId>/`.
3. Fill `requirements[]` with `rating`+`evidence` (coverage), `sfia[]` (`{code, requiredLevel}`) and, for seniority/credential requirements, `responsibility[]` (`{attr, requiredLevel}`) — proposed from the wording for confirmation (D2). Use `sfiaNote` for domain/language requirements.
4. Update `cv.*`, `updatedAt`; append reusable bullets to `harvest.json`. Never edit `sfia-profile.json` — the app owns it.
