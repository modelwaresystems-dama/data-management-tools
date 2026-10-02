# datasherpa Live Quiz + Workbench Player (public app)

The **public** half of the Mentimeter replacement. This repo holds only app code — **no assets, no student data**. Those live in the private repo and are served by a small backend.

## Architecture (data separation)
```
PUBLIC repo  (data-management-tools/Workbench_Player)   ← this
   index.html         launcher
   app-config.js      your keys + which asset to load (client-side only)
   live/              live quiz (host projector + phones, Ably realtime)
   player/            self-paced quiz + flashcards
PRIVATE repo (modelware_app_storage/Workbench_Player)   ← see README-private.md
   data/…             quiz/flashcard JSON (never public)
   netlify/functions/asset.js   serves those assets to the app, key-gated
   results/           saved student scores (CSV) land here
```
The public page never contains assets or scores. It fetches assets through the private backend and, at the end of a live session, **downloads a results CSV that you save into the private `results/` folder**. Student names + scores never touch a public repo or a third-party database.

## Setup
1. **Backend first** — deploy the private backend and get its function URL (see `README-private.md`).
2. Edit **`app-config.js`** — **no secrets, just URLs**:
   - `tokenUrl` — your backend's Ably-token function, e.g. `…/.netlify/functions/ably-token`
   - `assetApi` — your backend's asset function, e.g. `…/.netlify/functions/asset`
   - `quizPath` / `cardsPath` — which private assets this deployment loads.
3. Serve this repo (GitHub Pages / Netlify). Pages:
   - Launcher: `/`
   - Live: `/live/` (host opens → **Host this quiz**)
   - Player: `/player/`

**Dev mode:** leave `assetApi` blank and the tools run off the bundled sample data (`live/quiz.sample.json`, `player/flashcards.sample.json`) — good for testing the UX with no backend.

## Running a live session
- Host opens `/live/` on the projector → **Host this quiz** → room code + QR appear.
- Learners scan / enter code + name on phones.
- Drive: **Start round → Reveal → Next**. Leaderboard builds live.
- Results **save automatically to your private repo** as you finish each quiz (connect it once via **GitHub settings** on the host screen). They appear under **Saved sessions**, named by *Course – Cohort*, and you can resume or review them from any machine. A per-session Export CSV and **Certificates** (print-ready PDFs) sit on each saved row. Student data lives only in the private repo.

## Cohorts — resume or start fresh?

**Rule of thumb: a new cohort → _start fresh_. Resume / Re-open are only for the _same_ cohort.**

Every saved session is identified by **session title + cohort** (`sessionId = slug(day/session title)__slug(cohort)`), so the cohort is part of the record's identity. A new group of learners therefore gets its own clean record, history and certificates automatically — there is nothing to resume.

| Situation | Do this | Why |
|---|---|---|
| New intake / new cohort | **Start fresh** — pick the course + the new cohort on the host screen and open the room | New people have no prior run; they get a clean record and clean certificates |
| Same cohort, session was interrupted (end of day 1, dropped connection) | **Saved sessions → Resume** | Carries that cohort's running scores forward to the next quiz; won't restart a finished quiz |
| Same cohort, session finished — review results, print certificates, add a quiz | **Saved sessions → Re-open** | Opens the final review without restarting anything |

**Give every cohort its own distinct name** (e.g. `DAMA Cape Town — Oct 2026`). Because the cohort is half the session ID, two different groups run under the same cohort name will **merge into one record**. Distinct names keep every intake — and its certificates — cleanly separate.

Note on the live views: the leaderboard and final-results screen show only the people in the **current run** (present, or who answered this run). Resuming the same cohort still carries their scores; re-opening a finished session for review shows everyone. The underlying saved record keeps the full roster either way, so certificates are never short.

## Wiring the Workbench "Play" buttons
- Self-paced quiz: `/player/?quiz=<asset path>`
- Flashcards: `/player/?cards=<asset path>`
- Run live: `/live/?quiz=<asset path>`
(`<asset path>` is relative to the backend's `data/` dir, e.g. `ai-activate-2026-bias/AI Quiz.json`.)

## Security — no secrets in this repo
The public page holds **no keys**. Realtime uses Ably **token auth**: the page asks the backend (`tokenUrl`) for a short-lived token scoped to `quiz:*` (publish/subscribe/presence); the real Ably key stays server-side as `ABLY_API_KEY` and never reaches the browser. The asset endpoint needs no client key — it is CORS-locked to your app origin (`APP_ORIGIN`) and returns quiz JSON, not credentials. For per-user access control (learner logins), ask and I'll add it.
