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
- At the end press **Save results ⤓** → a `results-<code>-<date>.csv` (rank, name, score) downloads. **Save that file into the private repo's `Workbench_Player/results/` folder.** That's the only place student data is kept.

## Wiring the Workbench "Play" buttons
- Self-paced quiz: `/player/?quiz=<asset path>`
- Flashcards: `/player/?cards=<asset path>`
- Run live: `/live/?quiz=<asset path>`
(`<asset path>` is relative to the backend's `data/` dir, e.g. `ai-activate-2026-bias/AI Quiz.json`.)

## Security — no secrets in this repo
The public page holds **no keys**. Realtime uses Ably **token auth**: the page asks the backend (`tokenUrl`) for a short-lived token scoped to `quiz:*` (publish/subscribe/presence); the real Ably key stays server-side as `ABLY_API_KEY` and never reaches the browser. The asset endpoint needs no client key — it is CORS-locked to your app origin (`APP_ORIGIN`) and returns quiz JSON, not credentials. For per-user access control (learner logins), ask and I'll add it.
