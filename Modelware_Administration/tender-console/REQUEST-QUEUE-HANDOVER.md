# Tender Console — Assessment Request Queue · Handover

**Status:** design agreed (register `JEZw6qDkq7kogYKAuMSdHS`), not yet built.
**Decisions this implements:** RX0 = request queue + Claude worker · RX1 = a separate `requests.json` queue · RX2 = the worker auto-commits & pushes with its own token.
**Date:** 2026-10-20 · **App today:** v1.9.0 (no request button yet) · **Data contract:** v1.4.1

---

## 1. Why this exists (the one-paragraph version)

A salesperson should be able to click **Request assessment** in the Tender Console and get a bid / partner / leave recommendation back — without you running anything by hand. The Console is a *static public web page with no backend*, so it cannot run the `rfp-cv-tailor` skill itself: a page can read and write files in the repo, but it cannot reason over the CVs. The queue bridges that gap. The app **writes a request** into `data/requests.json`; a **Claude worker** (a scheduled, or on-demand, Claude session) reads the queue, runs the real `rfp-cv-tailor` triage against the proposed team's CVs, writes the `assessment{}` back onto the tender, marks the request done, and **commits & pushes with its own token**. The staff member sees “Requested → In progress → Done” and the assessment appears on the next sync. No second copy of the assessment logic exists — the worker runs the actual skill.

---

## 2. The moving parts

```
  Salesperson (browser, their own PAT)
        │  clicks "Request assessment" on a tender
        ▼
  App appends a request to  data/requests.json   (status: queued)   ──commit via their PAT──►  GitHub (private data repo)
                                                                                                      │
                                                                     ┌────────────────────────────────┘
                                                                     ▼
  Claude WORKER  (scheduled task OR fired on demand; its OWN bot PAT)
     1. pull requests.json  →  find status="queued"
     2. claim it            →  status="running", claimedBy, claimedAt   (commit)
     3. read the tender, team.json, each proposed person's CV, the RFP
     4. run rfp-cv-tailor  TRIAGE MODE  →  per-person fit, partner needs, disqualifiers, bid/partner/leave
     5. write assessment{} onto the tender in tenders.json
     6. request  →  status="done", result summary, completedAt
     7. COMMIT & PUSH tenders.json + requests.json   (worker's own PAT)
        on failure → status="error", error message, attempts++
                                                                     │
        ┌────────────────────────────────────────────────────────────┘
        ▼
  App (any staff browser) syncs the remote → shows the assessment + "Done"
```

There is **no server** anywhere in this picture. The only new long-lived credential is the worker's own scoped token (§6).

---

## 3. The queue file — `data/requests.json`

Lives alongside the other data files, in the app's data folder (`tender-console-data/data/`). One file, append-only in practice (old `done` rows are trimmed periodically).

```json
{
  "schemaVersion": 1,
  "_type": "assessment-request-queue",
  "updatedAt": "ISO",
  "requests": [
    {
      "id": "req-<epoch36>-<rand>",   // unique, app-generated
      "type": "triage",               // triage (now) | tailor | esa (future)
      "tenderId": "mict-seta-...",    // the tender to assess
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

**Status lifecycle**

| status | set by | meaning |
|---|---|---|
| `queued` | app | staff asked for it; waiting for the worker |
| `running` | worker | worker has claimed it and is working |
| `done` | worker | `assessment{}` written to the tender; `result` summarises |
| `error` | worker | run failed; `error` says why; `attempts` incremented |
| `cancelled` | admin (app) | request withdrawn before it ran |

**Rules**
- The **request `id` is the idempotency key.** The worker only acts on `queued` (or `running` rows older than the stale timeout — see §7). A `done` row is never re-processed.
- A request is a *pointer*, not a copy: it names the `tenderId`; the worker reads the live tender, team and CVs at run time.
- The worker **never** sets `goNoGo.decision` — that stays an admin's call in the app (decision SI4). It only writes `assessment{}` (the proposal) and the request's own status.

---

## 4. The app side (to build — app v1.10.0)

Small, additive changes to `index.html`, in the same style as the existing panels. **Nothing here runs the skill** — it only reads and writes `requests.json`.

1. **Load `requests.json`** — add `requests:"requests.json"` to the `FILES` map, a `data.requests` branch in `parseFile`, and a `fileBody` writer (schemaVersion 1). Create the file lazily on first request if missing.
2. **A “Request assessment” button** in the tender modal's Assessment panel (`#tmAssess`), enabled when the tender has a `teamProposed[]` and at least one uploaded RFP. On click: append a `{id,type:"triage",tenderId,requestedBy:me(),requestedAt,status:"queued",attempts:0}` row and `saveKey("requests", …)`.
3. **Status display** — the Assessment panel shows the newest request's status for that tender: *Requested by Jane · queued* / *in progress…* / *done* (with `result`) / *error* (with message + a Retry that re-queues). It already renders `assessment{}` when present (v1.9.0).
4. **Admin controls** (role = admin): Cancel a queued request; Retry an errored one.

Version bump to **1.10.0** (minor, additive) via the `<meta name="version">` standard already in place.

---

## 5. The worker — runbook

The worker is a **Claude session** running the `rfp-cv-tailor` skill in **triage mode** (per `DATA-CONTRACT.md` v1.4.1). It can run two ways; pick per §9.

- **Scheduled** — a recurring Claude task (created with the scheduled-task tools, *not* the local cron) fires on a cadence, processes all `queued` requests, and exits.
- **On demand** — the same task fired manually when something is waiting (lower cost; you or an admin trigger it).

**Each run:**

1. **Authenticate** with the worker's own PAT (§6). Read `data/requests.json` via the GitHub Contents API.
2. **Select** the oldest `status:"queued"` request (and any `running` row whose `claimedAt` is older than the stale timeout, §7).
3. **Claim it:** set `status:"running"`, `claimedBy`, `claimedAt`; write `requests.json` back (store the returned blob SHA). This marks it so a second run won't double-process.
4. **Gather inputs** for `tenderId`: the tender record from `tenders.json`; `team.json`; each `teamProposed[]` person's `cvRefs` (CV files under `cvs/base/<id>/`, fetched + text-extracted); the uploaded RFP under `rfp/<tenderId>/`; plus `experience.json` and `sfia-profile.json`.
5. **Run triage** (the skill's triage mode): per-person fit (codes covered / gaps), team collective coverage, `partnerNeeds[]`, hard `disqualifiers[]` from the mandatory `compliance[]`, and a `recommendation` of bid / partner / leave / at-risk.
6. **Write results:** merge `assessment{}` onto the tender in `tenders.json` (read whole file, change the one record, write back — last-writer-wins). Integrity: every `assessment.people[].personId` ∈ `teamProposed[]` ∈ `team.json`.
7. **Close the request:** `status:"done"`, `completedAt`, `result` (one-line summary). Trim `done` rows older than, say, 30 days.
8. **Commit & push** `tenders.json` and `requests.json` with the worker's PAT, message e.g. `"worker: assessment for <client> (req <id>)"`.
9. **On any failure:** set the request `status:"error"`, `error` (the message), `attempts++`, commit the queue, and move on. Never leave a row stuck in `running` on a handled error.

The worker is **stateless** between runs — the queue file is the entire shared state.

---

## 6. Credentials & security (decision RX2 = a)

For staff to get results **without you in the loop**, the worker pushes on its own authority. That means one new secret, handled carefully:

- **Worker PAT** — a dedicated fine-grained personal access token (ideally on a separate “bot” GitHub identity, or your account), scoped to **only the private data repo**, permission **Contents: Read and write**, with an **expiry** and a calendar reminder to rotate it.
- **Where it lives:** in the worker's run configuration (the scheduled task's setup / the session that runs it) — **never** in the app, the public app repo, or any client. The public Pages page must never see this token; it is categorically different from the per-person staff PATs.
- **Blast radius:** the token can read/write the data repo only. It cannot touch the public app repo, other repos, or account settings. If leaked, revoke + rotate; nothing else is exposed.
- **Identity & authority:** the worker stamps its writes as a bot (`assessment.assessedBy:"rfp-cv-tailor"`, request `claimedBy:"worker:…"`). It writes `assessment{}` and request status **only** — it never sets `goNoGo.decision`, never edits `team.json` or `sfia-profile.json`, never writes to the public app repo.
- **Honest caveat (carried from the register):** auto-push means a bad run reaches the remote unreviewed. Mitigations: the worker writes a *proposal* (`assessment{}`), not the decision; the recommendation is clearly the skill's, not an admin's; and an admin can disregard or re-run. If you later want a gate, that's a one-line switch to RX2 = b (worker writes locally, you push).

---

## 7. Concurrency, idempotency & safety

- **One worker at a time.** A single scheduled worker avoids contention. If two ever overlap, the **claim step** (§5.3) is the guard: a worker only proceeds on a row it successfully set to `running`; a `running` row owned by another worker is skipped until a **stale timeout** (e.g. 20 min) passes, after which it may be reclaimed (a crashed run left it dangling).
- **Last-writer-wins on `tenders.json`.** Staff may be editing a tender while the worker runs. The worker must **re-pull `tenders.json` immediately before writing**, modify only the one record's `assessment{}`, and write back — never hold a stale copy across the whole run. The app's existing save path already uses read-whole / change-one / write-back; the worker mirrors it, and retries once on a `409`/SHA conflict.
- **Idempotent by request id.** Re-running the queue never double-writes: `done` rows are ignored; a re-queued retry is a *new* request id.
- **No partial state.** Claim (commit) → work → results + close (commit). If it dies mid-work, the row sits in `running` until the stale timeout reclaims it; nothing is half-written to the tender because `assessment{}` is written in the single close step.

---

## 8. What staff and admins see

- **Salesperson:** clicks **Request assessment** → the panel shows *queued* → *in progress…* → the assessment, with a one-line *result*. On error, the message plus **Retry**.
- **Admin:** the same, plus **Cancel** (queued) and **Retry** (errored), and the full read-only assessment. The **Go / No-Go** decision stays admin-only (unchanged from v1.9.0).
- **Latency:** equals the worker cadence. Hourly polling → up to ~1 hour; on-demand firing → minutes. Assessment is not time-critical, so either is fine; start with on-demand + a slow safety poll.

---

## 9. Build checklist (what's left)

| # | Item | Where | Status |
|---|---|---|---|
| 1 | `requests.json` in `FILES`/`parseFile`/`fileBody` | app `index.html` | to build |
| 2 | “Request assessment” button + status display + Cancel/Retry | app tender modal | to build |
| 3 | App version → **1.10.0** | app `<meta name="version">` | to build |
| 4 | Worker PAT (scoped, expiring) | GitHub + worker config | **Howard** |
| 5 | Worker = scheduled Claude task running `rfp-cv-tailor` triage over the queue | scheduled task | to build |
| 6 | `rfp-cv-tailor` triage mode saved | skill (review card) | **Howard — pending save** |
| 7 | Cadence chosen (on-demand vs hourly) + stale timeout | worker config | decide at build |
| 8 | Push the app repo (v1.10.0) + hard-refresh Pages | **Howard** | after build |

Items 4, 6 and 8 are yours; the rest I build on your go.

---

## 10. References

- **Register (decisions):** `JEZw6qDkq7kogYKAuMSdHS` — RX0 a · RX1 b · RX2 a.
- **`DATA-CONTRACT.md` v1.4.1** — the `assessment{}` schema, `teamProposed[]`, `team.json`, `rfp/<id>/`, and the triage integrity rules.
- **`rfp-cv-tailor` (triage mode)** — reads the proposed team's CVs + the RFP, writes `assessment{}`, leaves the decision to an admin. (Review card pending save.)
- **Access model (SI0):** per-person collaborator + scoped PAT for staff; the worker's bot PAT is separate and never touches the public app.

---

*Prepared for handover. The queue is deliberately the simplest thing that keeps the “static app, no backend, reuse the real skill” shape: one JSON file as the mailbox, one Claude worker as the runtime, one scoped token as the authority.*
