# Tender Console — Assessment Request Queue · Handover

**Status:** worker mechanism decided (register `EJwjtgC8WToykzEqK1vm3n`) — **GitHub Actions**, draft-then-confirm. App request-queue support built (v1.10.0); worker + Confirm button to deploy.
**Decisions:** RX0 = request queue + Claude worker · RX1 = separate `requests.json` · ~~RX2 = worker auto-pushes with its own PAT~~ **superseded** → **A** draft-then-confirm · **B** official `claude-code-action` runs the real skill · **C** Claude subscription OAuth token · **D** trigger on push to `requests.json` · **E** commit with built-in `GITHUB_TOKEN`, no PAT.
**Date:** 2026-10-20 · **App:** v1.10.0 (request button live; Confirm button = v1.11.0, to build) · **Data contract:** v1.6.0 · **Setup/runbook:** `WORKER-SETUP.md`

---

## 1. Why this exists (the one-paragraph version)

A salesperson should be able to click **Request assessment** in the Tender Console and get a bid / partner / leave recommendation back — without you running anything by hand. The Console is a *static public web page with no backend*, so it cannot run the `rfp-cv-tailor` skill itself: a page can read and write files in the repo, but it cannot reason over the CVs. The queue bridges that gap. The app **writes a request** into `data/requests.json`; a **GitHub Actions workflow in the private data repo** reads the queue, runs the real `rfp-cv-tailor` triage against the proposed team's CVs, writes a **draft** `assessment{}` (`status:"proposed"`) back onto the tender, marks the request done, and commits with the built-in `GITHUB_TOKEN`. An admin then taps **Confirm** in the app to finalise it. The staff member sees "Requested → In progress → Done → (a drafted assessment awaiting confirm)". No second copy of the assessment logic exists — the Action runs the actual skill.

---

## 2. The moving parts

```
  Salesperson (browser, their own PAT)
        │  clicks "Request assessment" on a tender
        ▼
  App appends a request to  data/requests.json  (status: queued)  ──commit via their PAT──►  GitHub (private data repo)
                                                                                                     │
                                                                          push to requests.json fires│
                                                                                                     ▼
  GitHub Actions: "Assessment worker"  (.github/workflows/assessment-worker.yml)
     1. checkout the data repo  (for the data files + the commit step)
     2. anthropics/claude-code-action@v1  — auth: CLAUDE_CODE_OAUTH_TOKEN
          installs the `tender` plugin from the modelware-skills marketplace,
          then runs  /tender:rfp-cv-tailor  in WORKER MODE (headless, no gates):
            · find the oldest queued request → its tenderId
            · read the tender, team.json, each proposed person's CV, the RFP
            · run triage → per-person fit, partner needs, disqualifiers, bid/partner/leave
            · write assessment{} onto the tender  (status:"proposed")
            · request → status:"done", result summary, completedAt
     3. workflow step: git commit + push  (GITHUB_TOKEN — no PAT, does not re-trigger)
                                                                                                     │
        ┌────────────────────────────────────────────────────────────────────────────────────────┘
        ▼
  App (any staff browser) syncs the remote → shows the DRAFT assessment + "Done"
        │
        ▼
  Admin taps CONFIRM  →  assessment.status:"confirmed", confirmedBy, confirmedAt  (commit via their PAT)
```

There is **no server** anywhere in this picture, and **no long-lived GitHub PAT for the worker** — the Action commits with the per-run `GITHUB_TOKEN`. The only secret is the Claude subscription OAuth token, used to authenticate the model (§6).

---

## 3. The queue file — `data/requests.json`

Lives alongside the other data files in the app's data folder. One file, append-only in practice (old `done` rows are trimmed periodically).

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
      "requestedBy": "jane-sales",
      "requestedAt": "ISO",
      "status": "queued",             // queued → running → done | error | cancelled
      "claimedBy": null,              // worker id (e.g. "worker:gha")
      "claimedAt": null,
      "completedAt": null,
      "attempts": 0,
      "result": null,                 // e.g. "partner · team fit 71% (2 people) · proposed"
      "error": null
    }
  ]
}
```

**Status lifecycle**

| status | set by | meaning |
|---|---|---|
| `queued` | app | staff asked for it; waiting for the worker |
| `running` | worker | the Action has claimed it and is working |
| `done` | worker | a **draft** `assessment{}` written to the tender; `result` summarises |
| `error` | worker | run failed; `error` says why; `attempts` incremented |
| `cancelled` | admin (app) | request withdrawn before it ran |

The *request* reaching `done` means the worker drafted the assessment. Whether that draft is **confirmed** is tracked separately, on the assessment itself (`assessment.status`: `proposed` → `confirmed`).

**Rules**
- The **request `id` is the idempotency key.** The worker only acts on `queued` (or `running` rows older than the stale timeout — §7). A `done` row is never re-processed; a retry is a **new** id.
- A request is a *pointer*, not a copy: it names the `tenderId`; the worker reads the live tender, team and CVs at run time.
- The worker **never** sets `goNoGo.decision` — that stays an admin's call in the app (SI4). It writes `assessment{}` (always `status:"proposed"`) and the request's own status, nothing else.

---

## 4. The app side

**Built (v1.10.0):** `requests.json` in the `FILES` map, a `data.requests` branch in `parseFile`, a `fileBody` writer (schemaVersion 1), the **Request assessment** button in the tender modal's Assessment panel (enabled with a `teamProposed[]` + an uploaded RFP), the queued/running/done/error status display, and admin Cancel/Retry. Nothing here runs the skill — it only reads and writes `requests.json`.

**To build (v1.11.0) — the Confirm button (draft-then-confirm, register card A):** the Assessment panel reads `assessment.status`. A **`proposed`** draft shows a *Drafted by the worker — review and confirm* banner; an **admin-only Confirm** sets `assessment.status:"confirmed"`, `confirmedBy:me()`, `confirmedAt:now` and commits. (Edit-before-confirm is optional.) A `confirmed` (or legacy, status-absent) assessment renders as it does today. Version bump to **1.11.0** via the `<meta name="version">` standard.

---

## 5. The worker — runbook (GitHub Actions)

The worker is a **GitHub Actions workflow** (`.github/workflows/assessment-worker.yml`) in the private data repo, running `anthropics/claude-code-action@v1`, which installs the **`tender` plugin from the `modelware-skills` marketplace** (the single skill source — not vendored in this repo, so it never drifts from Howard's Claude) and runs **`/tender:rfp-cv-tailor`** in **Worker mode**. Full setup: `WORKER-SETUP.md`.

**Trigger (D):** `on: push` to `**/requests.json`, plus `workflow_dispatch` for manual test runs. A `concurrency` group serialises runs. One worker at a time; stateless between runs (the queue file is the entire shared state).

**Each run:**

1. **Checkout** the data repo (brings the skill onto the runner).
2. **claude-code-action** authenticates the model with `CLAUDE_CODE_OAUTH_TOKEN` (C), installs the `tender` plugin from the `modelware-skills` marketplace, and runs `/tender:rfp-cv-tailor` in Worker mode, headless — **no Phase 0/1 approval gates** (there is no human in CI; the human gate is the app's Confirm). Allowed tools: `Read, Edit, Write, Glob, Grep`; `--max-turns` caps cost.
3. The skill: pick the oldest `queued` request; gather inputs for its `tenderId` (tender record, `team.json`, each `teamProposed[]` person's CV, the RFP, `experience.json`, `sfia-profile.json`); run triage (per-person fit, team coverage, `partnerNeeds[]`, `disqualifiers[]`, recommendation); merge `assessment{}` onto the one tender record with **`status:"proposed"`**, `assessedBy:"worker:gha"`; close the request (`done`, `result`, `completedAt`). Integrity: every `assessment.people[].personId` ∈ `teamProposed[]` ∈ `team.json`.
4. **The workflow commits** the edited `tenders.json` + `requests.json` with `GITHUB_TOKEN` and pushes (E). The skill does **not** run git.
5. **On any failure** handling a request: the skill sets it `status:"error"`, `error`, `attempts++`, leaves `tenders.json` untouched, and stops — never a row stuck in `running`.

The worker never writes to the public app repo, never edits `team.json`/`sfia-profile.json`, never sets `goNoGo.decision`, and never confirms its own assessment.

---

## 6. Credentials & security (register C + E)

No worker PAT exists any more. Two mechanisms, both scoped to the data repo:

- **Model auth — `CLAUDE_CODE_OAUTH_TOKEN`** (a repository Actions secret). A long-lived Claude subscription token from `claude setup-token`. It authorises the *model*, not GitHub. It is tied to your subscription (worker runs draw on your plan) and expires — rotate it when it does. It never appears in the app, the public repo, or any client.
- **Git write — the built-in `GITHUB_TOKEN`.** GitHub mints a scoped, per-run token for the workflow (repo: *Settings → Actions → General → Workflow permissions → Read and write*). It can write only this repo, for the length of the run; nothing to store or rotate. Crucially, **pushes made with `GITHUB_TOKEN` do not trigger workflows**, so the worker's own commit cannot re-fire the worker (a job-level `if` guard on the `worker:` commit message is a second line of defence).
- **Blast radius:** both are data-repo-only. Neither can touch the public app repo, other repos, or account settings.
- **Identity & authority:** the worker stamps `assessment.assessedBy:"worker:gha"`, request `claimedBy:"worker:gha"`. It writes a **proposal** (`status:"proposed"`), never a decision — a bad run is disregardable, re-runnable, and cannot be mistaken for a signed-off assessment or the bid call.
- **Draft-then-confirm (A) is the review gate** that RX2=a lacked: nothing the worker writes is treated as final until an admin taps Confirm. Auto-push reaches the remote unreviewed, but it arrives clearly marked `proposed`.

---

## 7. Concurrency, idempotency & safety

- **One worker at a time** — the workflow's `concurrency` group serialises runs; `cancel-in-progress: false` lets a run finish.
- **No self-trigger loop** — the worker commits with `GITHUB_TOKEN`, which GitHub does not use to trigger workflows, so the worker's push to `requests.json` does not re-fire the worker. Belt-and-braces: a job `if` skips any push whose head commit message starts with `worker:`.
- **Last-writer-wins on `tenders.json`** — staff may edit a tender while the worker runs. The worker checks out fresh at run start and changes only the one record's `assessment{}`; on the rare overlap, re-run (idempotent by request id).
- **Idempotent by request id** — `done` rows are ignored; a re-queued retry is a *new* id.
- **No partial state** — the worker edits files in the workspace and the workflow commits once at the end; a crash before the commit leaves the remote untouched (and the row stays `queued`/`running` to be picked up again).

---

## 8. What staff and admins see

- **Salesperson:** clicks **Request assessment** → *queued* → *in progress…* → a drafted assessment with a one-line *result*. On error, the message plus **Retry**.
- **Admin:** the same, plus **Cancel** (queued), **Retry** (errored), and — new in v1.11.0 — **Confirm** on a `proposed` assessment (finalises it: `confirmedBy`, `confirmedAt`). The **Go / No-Go** decision stays a separate admin-only step (unchanged).
- **Latency:** push-triggered, so seconds-to-minutes after the request commits (plus runner start-up). No polling cadence to tune.

---

## 9. Build checklist

| # | Item | Where | Status |
|---|---|---|---|
| 1 | `requests.json` in `FILES`/`parseFile`/`fileBody` | app `index.html` | **done (v1.10.0)** |
| 2 | "Request assessment" button + status + Cancel/Retry | app tender modal | **done (v1.10.0)** |
| 3 | `assessment.status` render + **Confirm** button (admin) | app `index.html` → **v1.11.0** | **built — push app repo** |
| 4 | Workflow `assessment-worker.yml` | data repo `.github/workflows/` | **delivered — Howard installs** |
| 5 | Skill published once in the `modelware-skills` plugin marketplace repo; plugin installed in Claude + old synced skill retired | separate repo | **Howard** |
| 6 | `CLAUDE_CODE_OAUTH_TOKEN` secret (`claude setup-token`) | data repo Actions secrets | **Howard** |
| 7 | Workflow permissions → Read and write | data repo settings | **Howard** |
| 8 | `rfp-cv-tailor` Worker mode (GitHub Actions + `proposed`) saved | skill (review card) | **Howard — pending save** |
| 9 | First live test via **Run workflow** | data repo Actions | **Howard + me** |
| 10 | Revoke the pasted PAT | GitHub | **Howard** |

Items 5–10 are yours (with me on 3 and 9); I've delivered 4 and will build 3.

---

## 10. References

- **Register (worker mechanism):** `EJwjtgC8WToykzEqK1vm3n` — A draft · B claude-code-action · C oauth · D push · E GITHUB_TOKEN. (Earlier queue-design register: `JEZw6qDkq7kogYKAuMSdHS` — RX0 a · RX1 b · RX2 a, with RX2 now superseded.)
- **`WORKER-SETUP.md`** — step-by-step setup + runbook for the GitHub Actions worker.
- **`DATA-CONTRACT.md` v1.6.0** — `assessment{}` (incl. `status`/`confirmedBy`/`confirmedAt`), `requests.json`, `teamProposed[]`, `team.json`, triage integrity rules.
- **`rfp-cv-tailor` (Worker mode)** — reads the proposed team's CVs + the RFP, writes a `proposed` `assessment{}`, leaves confirm + the decision to an admin. (Review card pending save.)

---

*The queue keeps the "static app, no backend, run the real skill" shape: one JSON file as the mailbox, one GitHub Action as the runtime, the built-in token as the authority, and your Confirm tap as the one human gate.*
