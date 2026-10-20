# Tender Console — data contract (v1.5.0)

Contract between the Tender Console app and the `rfp-cv-tailor` skill. Both read/write the same files in the **private data repo**, so they must agree on this shape.

**v1.5.0 (2026-10-20):** **Assessment Request Queue** — a new `data/requests.json` lets the app enqueue a triage request (staff click "Request assessment") that a **Claude worker** (scheduled or on-demand) fulfils by running `rfp-cv-tailor` triage and writing `assessment{}` back onto the tender, then **auto-commits & pushes** with its own scoped bot token. No second copy of the assessment logic — the worker runs the real skill. Decisions **RX0=a** (request queue + Claude worker), **RX1=b** (separate `requests.json`), **RX2=a** (worker auto-pushes with its own token). Full design: `REQUEST-QUEUE-HANDOVER.md` (app repo). App support = v1.10.0 (to build); worker = a scheduled Claude task (to build) using the worker's own PAT.
**v1.4.1 (2026-10-20):** review of v1.4 against live data (decisions R1–R4). **R1** — `goNoGo.decision` enum gains **`at-risk`**; **`reason`** is the single free-text field (the `note` field used by some records is migrated to `reason` and retired). **R2** — external / JV people are now first-class in `team.json` via an **`external`** flag; the ad-hoc `cv.teamRefs[]` is **retired** in favour of `teamProposed[]` + each person's `cvRefs`. **R3** — every person's base CV lives under **`cvs/base/<personId>/`** (including Howard's); loose files at `cvs/base/` root are retired. **R4** — `createdBy` and `loadedBy` are both kept, with distinct meanings. (Migration applied 2026-10-20; app support landed in v1.9.0.)
**v1.4 (2026-10-20):** opened the Console to **salespeople** — team registry (`team.json`), RFP uploads per tender (`rfp/<id>/`), proposed team (`teamProposed[]`), skill-written `assessment{}`, identity stamps. Access model (decision **SI0**): each person is a repo collaborator with their own fine-grained PAT. Salespeople **propose**, Howard **decides** (**SI4**).
**v1.3 (2026-09-26):** ESA layer — `esa{}` block, `esa-standard-clauses.json`, `esa/<id>/`.
**v1.2 (2026-09-16):** SFIA responsibility layer; app is the profile master; `sfia-profile.json` schemaVersion 2.

## Access & enforcement (honest note)

The app is a **public GitHub Pages page with no backend**. The `role: sales|admin` setting and the "salespeople propose, Howard decides" gate (**SI4**) are **conventions, not enforcement** — any viewer can flip the role in their own browser. The real control is **who holds a write-capable PAT** (decision **SI0**: per-person collaborator + scoped fine-grained PAT). Treat `goNoGo.decision` as Howard's call by agreement, not by a lock the app imposes. The **worker's** bot PAT (v1.5.0) is a separate, long-lived, data-repo-only token that must never reach the public app or any client.

## Repo layout (private data repo, default folder `data/`)

```
data/
  tenders.json                # all tender records
  team.json                   # team registry — people (incl. external/JV) who can be proposed  (v1.4; external flag v1.4.1)
  requests.json               # assessment request queue — app enqueues, worker fulfils          (NEW v1.5.0)
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
- **The app's Team tab reads and writes `team.json`** and uploads CVs to `cvs/base/<id>/` *(built in app v1.9.0)*. The skill (and the worker) **read** it, never edit it.

## `assessment{}`  (skill-written triage — v1.4)
```json
"assessment": {
  "recommendation": "bid|partner|leave|at-risk|undecided",
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
- Written by `rfp-cv-tailor` **triage mode** (**SI3** = extend the skill), either run directly or via the request-queue **worker** (v1.5.0). The app shows it read-only in the tender's Assessment panel *(built in app v1.9.0)*.
- **Integrity rule:** every `assessment.people[].personId` must appear in the record's `teamProposed[]`, and every id in `teamProposed[]` must exist in `team.json`.
- `recommendation` is the skill's **proposal**; the human `goNoGo.decision` is the actual call (Howard's). Neither the skill nor the worker ever sets `goNoGo.decision`.
- `people[]` — one entry per proposed team member: fit %, requirement codes covered, gaps. `partnerNeeds[]` names capabilities missing from the team that a partner would supply.

## `requests.json`  (the assessment request queue — NEW v1.5.0)

The bridge that lets a static, backend-less app get an assessment without anyone running the skill by hand: the **app enqueues** a request; a **Claude worker** fulfils it. Full design and runbook: **`REQUEST-QUEUE-HANDOVER.md`** (app repo).

```json
{
  "schemaVersion": 1, "_type": "assessment-request-queue", "updatedAt": "ISO",
  "requests": [
    {
      "id": "req-<epoch36>-<rand>",   // unique, app-generated; the idempotency key
      "type": "triage",               // triage (now) | tailor | esa (future)
      "tenderId": "mict-seta-...",    // pointer to the tender; worker reads it live
      "requestedBy": "jane-sales",    // person-id / Settings "Your name"
      "requestedAt": "ISO",
      "status": "queued",             // queued → running → done | error | cancelled
      "claimedBy": null,              // worker id while running (e.g. "worker:cloud")
      "claimedAt": null,
      "completedAt": null,
      "attempts": 0,
      "result": null,                 // short summary on success, e.g. "partner · team fit 71% (2 people)"
      "error": null                   // message on failure
    }
  ]
}
```

**Status lifecycle:** `queued` (app: staff asked) → `running` (worker claimed) → `done` (worker wrote `assessment{}`; `result` summarises) | `error` (worker: run failed, `error` says why, `attempts++`) | `cancelled` (admin withdrew before it ran).

**Rules**
- The request **`id` is the idempotency key.** The worker acts only on `queued` rows (or `running` rows older than the stale timeout, ~20 min). A `done` row is never re-processed; a retry is a **new** request id.
- A request is a **pointer, not a copy** — it names `tenderId`; the worker reads the live tender, `team.json` and CVs at run time.
- The worker **never** sets `goNoGo.decision`, never edits `team.json` or `sfia-profile.json`, and never writes to the public app repo. It writes only `assessment{}` (onto the tender) and request status.
- **Last-writer-wins on `tenders.json`:** the worker re-reads the whole file immediately before writing, changes only the one record's `assessment{}`, writes back, and retries once on a SHA/409 conflict.
- The queue is trimmed periodically (drop `done` rows older than ~30 days). The app may create `requests.json` lazily on the first request if it is absent.

## How `rfp-cv-tailor` uses this

**Triage mode (SI3)** — when a tender has a proposed team (`teamProposed[]`) and someone asks to review/assess it: read the tender, the RFP under `rfp/<id>/`, `team.json`, each proposed person's `cvRefs`, plus `experience.json` and `sfia-profile.json`; map each person's CV to the requirements (per-person fit); compute team coverage, `partnerNeeds[]`, hard `disqualifiers[]`; write `assessment{}` with a `bid`/`partner`/`leave`/`at-risk` recommendation — a **proposal only**, leaving `goNoGo.decision` to Howard.

**Worker mode (v1.5.0)** — the same triage, driven off `requests.json`: claim the oldest `queued` request (set `running` + stamps, write back), run triage for its `tenderId`, merge `assessment{}` onto the tender, close the request (`done` + `result`), and commit & push both files with the worker's own PAT. On failure, set the request `error` + `attempts++` and move on — never leave a row stuck in `running`. Stateless between runs; the queue file is the whole shared state. Full runbook in the handover.

The CV/coverage mode and ESA mode from v1.3 are unchanged.

## `esa{}` / `esa-standard-clauses.json`
Unchanged from v1.3 — see that section above.

## `sfia-profile.json` / `experience.json` / `harvest.json`
Unchanged — see v1.2/v1.1.
