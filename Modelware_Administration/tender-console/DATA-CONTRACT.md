# Tender Console — data contract (v1.3)

Contract between the Tender Console app and the `rfp-cv-tailor` skill (decision **D4 = Contract**). Both read/write the same files in the **private data repo**, so they must agree on this shape.

**v1.3 (2026-09-26):** added the **Expert Services Agreement (ESA)** layer. Each tender gains an optional `esa{}` block (parties, commercials, milestone deliverables linked to scope, clause-set reference, doc refs, status). A shared, versioned **`esa-standard-clauses.json`** holds Modelware's reusable protective clauses. Generated ESA documents live under `esa/<tenderId>/`. `rfp-cv-tailor` gains an ESA mode (decision **E5 = extend the existing skill**).
**v1.2 (2026-09-16):** SFIA profile gained a **responsibility layer**; **app is the profile master**; `sfia-profile.json` schemaVersion **2**.
**v1.1 (2026-09-16):** added `requirements[].sfia`, `requirements[].sfiaNote`, tender `sfiaFit`, and `sfia-profile.json`.

## Repo layout (private data repo, default folder `data/`)

```
data/
  tenders.json                # all tender records
  experience.json             # the experience bank
  harvest.json                # proposed reusable bullets awaiting approval
  sfia-profile.json           # governed SFIA 9 profile (app is master)
  esa-standard-clauses.json   # Modelware ESA Standard Clauses — reusable protective overlay (versioned)
cvs/
  base/                       # base CV(s)
  tailored/<tenderId>/        # tailored CV + coverage map per tender
esa/
  <tenderId>/                 # generated ESA docs per tender (ESA, Annex A, redline against base)
```

## `tenders.json`  (esa{} block added — otherwise unchanged from v1.2)
```json
{
  "schemaVersion": 1,
  "tenders": [
    {
      "id": "tender-xxxx", "client": "...", "title": "...", "sector": "...",
      "status": "prospect|reviewing|bidding|submitted|won|lost|withdrawn|passed",
      "requirements": [ { "text": "...", "weight": "11%", "rating": "strong|partial|gap", "evidence": "...", "sfia": [...], "responsibility": [...] } ],
      "compliance": [ { "label": "...", "done": false } ],
      "cv": { "baseRef": "...", "tailoredRef": "...", "coverageRef": "..." },
      "esa": { "…see below…" },
      "outcome": { "result": "pending|won|lost|withdrawn", "notes": "..." },
      "notes": "...", "createdAt": "ISO", "updatedAt": "ISO"
    }
  ]
}
```
(SFIA fit lenses, `sfiaFit`, `responsibilityFit`, `scoringWeights`, `goNoGo`, `owner` unchanged — see v1.2.)

## The `esa{}` block  (optional, per tender)
```json
"esa": {
  "status": "none|drafting|proposed|negotiating|signed|na",
  "role": "Data Governance Expert — Key Expert 2 (K-2)",
  "roleShort": "K-2",
  "parties": {
    "expert": "Modelware Systems (Pty) Limited",
    "expertRep": "Howard Diesel",
    "consultant": "Serefaco Consultants Limited",
    "client": "Government of Zambia (SMART Zambia)"
  },
  "reference": "ZM-SZ-466193-CS-QBS",
  "commercial": { "currency": "USD", "dailyRate": 1050, "loeDays": 45, "maxFee": 47250 },
  "baseAgreement": { "source": "consultant|client|modelware", "ref": "esa/<id>/base-esa.docx", "note": "whose paper the ESA sits on" },
  "clauseSet": {
    "ref": "esa-standard-clauses.json", "version": "1.0.0",
    "included": ["scope-boundaries","named-key-expert","milestone-deliverables","level-of-effort","acceptance","payment-protection","dependencies","change-control","background-ip","separation","order-of-precedence","continuity"],
    "excluded": []
  },
  "milestones": [
    {
      "id": "M1", "name": "Inception & Situational Assessment", "days": 5, "fee": 5250,
      "outputs": [
        { "text": "Data Governance & Classification methodology", "reqRef": "W2", "done": false },
        { "text": "Contribution to the Inception Report", "reqRef": null, "done": false }
      ]
    }
  ],
  "docs": {
    "esaRef": "esa/<id>/ESA_<id>.docx",
    "annexRef": "esa/<id>/AnnexA_<id>.docx",
    "redlineRef": "esa/<id>/Redline_<id>.docx"
  },
  "updatedAt": "ISO"
}
```

**Field notes**
- `status` — drives the ESA badge in the app: `none` (not started), `drafting`, `proposed` (sent to the prime), `negotiating`, `signed`, `na` (no ESA needed).
- `roleShort` — the short role tag (e.g. `K-2`) substituted into the standard clauses.
- `commercial.maxFee` = `dailyRate × loeDays`; the app can recompute and flag a mismatch.
- `baseAgreement.source` — records whose paper the ESA sits on (decision **E2 = client/consultant base + Modelware overlay**, but `modelware` is allowed when Modelware's own master is the base).
- `clauseSet.included` / `excluded` — which standard clauses apply to this tender; ids come from `esa-standard-clauses.json`.
- `milestones[].outputs[].reqRef` — links a deliverable output to a `requirements[].text` code (e.g. `"W2"`, `"C1"`) so ESA deliverables trace to the RFP scope already scored (decision **E4 = structured, linked**). `null` = no scope link.
- `milestones[].days` / `fee` — the day/fee allocation per milestone; these feed the Separation clause's pro-rata valuation.
- `docs.*` — repo-relative paths to the generated ESA, Annex A and (optional) redline against the base agreement.

## `esa-standard-clauses.json`  (shared, versioned — Modelware's reusable overlay)
```json
{
  "schemaVersion": 1, "_type": "esa-standard-clauses", "version": "1.0.0",
  "placeholders": { "EXPERT": "...", "ROLE": "...", "DAILY_RATE": "...", "LOE_DAYS": "...", "...": "..." },
  "defaults": { "dailyRateUSD": 1050, "reviewBusinessDays": 10, "revisionCyclesIncluded": 1, "paymentLongstopDays": 90, "postSeparationPayDays": 30 },
  "clauses": [ { "id": "scope-boundaries", "no": "1", "title": "...", "category": "scope", "include": "always|conditional", "intent": "...", "body": "markdown with {{PLACEHOLDERS}}" } ],
  "annexTemplate": { "...": "..." }
}
```
- 12 clauses in v1.0.0: `scope-boundaries`, `named-key-expert`, `milestone-deliverables`, `level-of-effort`, `acceptance`, `payment-protection`, `dependencies`, `change-control`, `background-ip`, `separation`, `order-of-precedence`, `continuity`.
- `body` is markdown with `{{PLACEHOLDER}}` tokens filled per tender from the `esa{}` block (role, parties, rate, LoE, fees).
- Versioned: bump `version` on any clause change; a tender records the `clauseSet.version` it was built against.
- **The app reads this file** (to show which clauses apply and the clause-set version). The `rfp-cv-tailor` skill reads it to assemble the ESA. Neither the app nor the skill should hand-edit clause bodies inline on a tender — change the standard set and re-generate.

## How `rfp-cv-tailor` uses this (ESA mode — target, decision E5 = extend)
When asked for the ESA (or when a tender needs one), after the usual CV/coverage flow:
1. Read the tender record, `esa-standard-clauses.json`, and the client/consultant **base ESA** if supplied (under `esa/<id>/`).
2. Extract/confirm the ESA specifics from the RFP/TOR and the tender: parties, role, reference, level of effort, daily rate, max fee, and the milestone deliverables — each output linked to a `requirements[]` code where it maps to scope.
3. Present the ESA plan for approval (the two-gate pattern): the milestone/deliverable breakdown, the day/fee split, and which standard clauses to include/exclude — recommend the full set, flag any the tender makes irrelevant.
4. On approval, assemble the tailored **ESA `.docx`** (base terms + Modelware Standard Clauses with placeholders filled) and **Annex A** (deliverables, responsibilities, day/fee budget) into `esa/<id>/`; optionally a **redline** against the base.
5. Write the `esa{}` block into `tenders.json` (status `proposed`), set `docs.*`, `updatedAt`. Never hand-edit clause bodies — reference the clause-set version.
6. Tell Howard which files/records changed and that he still needs to **commit & push**.

## `sfia-profile.json` / `experience.json` / `harvest.json`
Unchanged from v1.2 — see prior contract.
