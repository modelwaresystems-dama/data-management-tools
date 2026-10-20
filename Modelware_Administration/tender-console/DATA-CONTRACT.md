# Tender Console — data contract (v1.4.1)

Contract between the Tender Console app and the `rfp-cv-tailor` skill. Both read/write the same files in the **private data repo**, so they must agree on this shape.

**v1.4.1 (2026-10-20):** review of v1.4 against live data (decisions R1–R4). **R1** — `goNoGo.decision` enum gains **`at-risk`**; **`reason`** is the single free-text field (the `note` field used by some records is migrated to `reason` and retired). **R2** — external / JV people are now first-class in `team.json` via an **`external`** flag; the ad-hoc `cv.teamRefs[]` is **retired** in favour of `teamProposed[]` + each person's `cvRefs`. **R3** — every person's base CV lives under **`cvs/base/<personId>/`** (including Howard's); loose files at `cvs/base/` root are retired. **R4** — `createdBy` and `loadedBy` are both kept, with distinct meanings. App-side support for these (Team tab, RFP upload, Assessment panel, external people, the `cvs/base/<id>/` move) is a **target** until the salespeople app build lands; the app is v1.8.0 today.
**v1.4 (2026-10-20):** opened the Console to **salespeople** — team registry (`team.json`), RFP uploads per tender (`rfp/<id>/`), proposed team (`teamProposed[]`), skill-written `assessment{}`, identity stamps. Access model (decision **SI0**): each person is a repo collaborator with their own fine-grained PAT. Salespeople **propose**, Howard **decides** (**SI4**).
**v1.3 (2026-09-26):** ESA layer — `esa{}` block, `esa-standard-clauses.json`, `esa/<id>/`.
**v1.2 (2026-09-16):** SFIA responsibility layer; app is the profile master; `sfia-profile.json` schemaVersion 2.

## Access & enforcement (honest note)

The app is a **public GitHub Pages page with no backend**. The `role: sales|admin` setting and the "salespeople propose, Howard decides" gate (**SI4**) are **conventions, not enforcement** — any viewer can flip the role in their own browser. The real control is **who holds a write-capable PAT** (decision **SI0**: per-person collaborator + scoped fine-grained PAT). Treat `goNoGo.decision` as Howard's call by agreement, not by a lock the app imposes.

## Repo layout (private data repo, default folder `data/`)

```
data/
  tenders.json                # all tender records
  team.json                   # team registry — people (incl. external/JV) who can be proposed  (v1.4; external flag v1.4.1)
  experience.json             # the experience bank
  harvest.json                # proposed reusable bullets awaiting approval
  sfia-profile.json           # governed SFIA 9 profile (app is master)
  esa-standard-clauses.json   # Modelware ESA Standard Clauses (versioned)
cvs/
  base/<personId>/            # each person's base CV(s) — Howard included        (v1.4.1: no loose files at cvs/base/ root)
  tailored/<tenderId>/        # tailored CV + coverage map per tender
rfp/
  <tenderId>/                 # the uploaded RFP document(s) + addenda per tender  (v1.4)
esa/
  <tenderId>/                 # generated ESA docs per tender
```

## `tenders.json`  (v1.4 fields added — all optional, backwards-compatible)
```json
{
  "id": "tender-xxxx", "client": "...", "title": "...", "sector": "...",
  "status": "prospect|reviewing|bidding|submitted|won|lost|withdrawn|passed",
  "goNoGo": { "decision": "undecided|bid|partner|leave|at-risk", "reason": "..." },
  "owner": "Howard Diesel",
  "createdBy": "jane-sales", "loadedBy": "jane-sales",
  "teamProposed": ["howard-diesel", "debbie"],
  "requirements": [ { "text": "...", "weight": "11%", "rating": "strong|partial|gap", "evidence": "...", "sfia": [...], "responsibility": [...] } ],
  "compliance": [ { "label": "...", "done": false } ],
  "cv": { "baseRef": "...", "tailoredRef": "...", "coverageRef": "..." },
  "rfp": { "files": [ { "name": "RFP.pdf", "path": "rfp/<id>/RFP.pdf", "uploadedBy": "jane-sales", "uploadedAt": "ISO" } ] },
  "esa": { "…see v1.3…" },
  "assessment": { "…see below…" },
  "outcome": { "result": "pending|won|lost|withdrawn", "notes": "..." },
  "notes": "...", "createdAt": "ISO", "updatedAt": "ISO"
}
```
- **`goNoGo.decision`** — the human bid call: **`bid`**, **`partner`** (bid jointly with another firm), **`leave`** (decline), **`at-risk`** (pursuing, but eligibility or fit is at risk — e.g. a mandatory gate unmet, or team gaps a partner must fill), or **`undecided`**. Old records using `pass` are read as `leave`. **`reason`** is the single free-text explanation (R1); any legacy `note` on `goNoGo` is migrated into `reason` and the `note` key dropped.
- **Three separate states, never conflated** — `status` is the pipeline stage (where the tender sits in the process), `goNoGo.decision` is the bid call (whether/how to pursue), and `outcome.result` is what finally happened. A scoring gap in `requirements[]` is not a knockout; a knockout is a failed mandatory in `compliance[]`.
- **`createdBy`** — the person-id who first created the record. **`loadedBy`** — the person-id who last loaded or updated it via the app. Same person in the common case; they differ when one person opens a tender another first created. Both are person-ids from `team.json` (or the Settings "Your name"), stamped by the app.
- **`teamProposed[]`** — person-ids (from `team.json`, internal or external) proposed for this tender; the skill reviews these people's CVs for fit. `owner` stays the single lead. **This replaces the old `cv.teamRefs[]`** (R2): a record's people now live in `teamProposed[]`, and their CVs come from each person's `team.json` `cvRefs`, not from free-text paths on the record.
- **`cv.baseRef`** — the **lead's** base CV (under `cvs/base/<id>/`). Per-person CVs used in triage come from each proposed person's `team.json` `cvRefs`, not from `baseRef`.
- **`rfp.files[]`** — the uploaded RFP document(s) for this tender, stored under `rfp/<id>/`.

## `team.json`  (the team registry — v1.4; `external` flag v1.4.1)
```json
{
  "schemaVersion": 2, "_type": "team-registry", "updatedAt": "ISO",
  "people": [
    {
      "id": "howard-diesel", "name": "Howard Diesel", "role": "Founder / Principal Consultant",
      "org": "Modelware Systems", "external": false, "email": "howard@modelwaresystems.com", "active": true,
      "cvRefs": [ { "label": "Base CV", "ref": "cvs/base/howard-diesel/CV.pdf" } ],
      "sfiaRef": "sfia-profile.json", "tags": ["data governance", "..."],
      "addedBy": "seed", "addedAt": "ISO"
    }
  ]
}
```
- `id` — slug, unique; used by `teamProposed[]`, `createdBy`, `loadedBy`, and the CV folder `cvs/base/<id>/`.
- **`external`** (R2) — `false`/absent for Modelware people; **`true`** for partner, JV, or associate people brought onto a specific bid (e.g. a JV PM, a consortium partner). `org` names their firm. External people are first-class ids so they can appear in `teamProposed[]` and carry their own `cvRefs`.
- `cvRefs[]` — repo-relative paths to the person's CV file(s) under `cvs/base/<id>/`; uploaded via the app's Team tab.
- `sfiaRef` — optional link to a SFIA profile (only Howard has one today; the app owns `sfia-profile.json`).
- **The app's Team tab reads and writes `team.json`** and uploads CVs to `cvs/base/<id>/` *(target — not yet in app v1.8.0)*. The skill reads it (never edits it).

## `assessment{}`  (skill-written triage — v1.4)
```json
"assessment": {
  "recommendation": "bid|partner|leave|undecided",
  "rationale": "one-paragraph why",
  "overallFit": 78,
  "people": [
    { "personId": "howard-diesel", "fit": 89, "verdict": "strong|partial|gap",
      "covers": ["W2", "W3", "C1"], "gaps": ["W1 cloud/infra"], "note": "..." }
  ],
  "partnerNeeds": ["cloud architecture", "local Zambian presence"],
  "disqualifiers": ["none"],
  "assessedBy": "rfp-cv-tailor", "assessedAt": "ISO"
}
```
- Written by `rfp-cv-tailor` **triage mode** (**SI3** = extend the skill) *(target — not yet built)*; the app shows it read-only in the tender's Assessment panel *(target)*.
- **Integrity rule:** every `assessment.people[].personId` must appear in the record's `teamProposed[]`, and every id in `teamProposed[]` must exist in `team.json`.
- `recommendation` is the skill's **proposal**; the human `goNoGo.decision` is the actual call (Howard's).
- `people[]` — one entry per proposed team member: fit %, requirement codes covered, gaps. `partnerNeeds[]` names capabilities missing from the team that a partner would supply.

## How `rfp-cv-tailor` uses this (triage mode — target, SI3 = extend)
When a salesperson has loaded a tender (+ RFP) and proposed a team, and asks to **review / assess** it:
1. Read the tender record, the uploaded RFP under `rfp/<id>/`, `team.json`, and each proposed person's `cvRefs` (CVs under `cvs/base/<id>/`), plus `experience.json` and `sfia-profile.json`.
2. Extract the tender's requirements (as in CV mode) and, **for each proposed person**, map their CV to the requirements → a per-person fit (codes covered, gaps).
3. Compute the **team's collective coverage**, name the **gaps a partner would fill**, and flag any hard **disqualifiers** (mandatory clauses the team/firm can't meet).
4. Write `assessment{}` with a **recommendation** of `bid` / `partner` / `leave` and a rationale — a **proposal only**. Leave `goNoGo.decision` for Howard.
5. (As before) on request, produce tailored CVs / coverage / the ESA. Then tell the user what changed and that someone still needs to **commit & push**.

The CV/coverage mode and ESA mode from v1.3 are unchanged; triage mode is the new multi-person, pre-decision step.

## `esa{}` / `esa-standard-clauses.json`
Unchanged from v1.3 — see that section above.

## `sfia-profile.json` / `experience.json` / `harvest.json`
Unchanged — see v1.2/v1.1.

## Migration from v1.4 → v1.4.1 (apply once, as its own commit)
- **`goNoGo.note` → `goNoGo.reason`** on every record that has it (MICT SETA, WCG, IRBA, data-ai-literacy, Parliament), then drop the `note` key. Records already using `at-risk` stay valid.
- **`cv.teamRefs[]` → `teamProposed[]`**: for MICT SETA, add Melissa Tsalicoglou to `team.json` with `external: true`, set `teamProposed: ["howard-diesel", "<melissa-id>"]`, and move/keep her CV under `cvs/base/<melissa-id>/`.
- **`cvs/base/` move**: relocate Howard's base CVs to `cvs/base/howard-diesel/`, populate his `team.json` `cvRefs`, and repoint the `cv.baseRef` of every record that references the old loose paths.
