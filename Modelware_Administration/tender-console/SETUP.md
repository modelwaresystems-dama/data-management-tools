# Tender Console — setup (one-time, ~10 minutes)

Two repos, by design: a **public** one to host the app (so GitHub Pages works on any plan), and a **private** one that holds all your data. Your token only ever touches the private one.

## 1. Public repo for the app
1. Create a new **public** repo, e.g. `tender-console`.
2. Add `index.html` (the app) to it.
3. Settings → **Pages** → Source: `main` / root → Save. After a minute your app is live at
   `https://<your-username>.github.io/tender-console/`.

*(The page is public, but it shows nothing until it's given your token — all data lives in the private repo below.)*

## 2. Private repo for your data
1. Create a new **private** repo, e.g. `tender-console-data`.
2. Add the three seed files under a `data/` folder:
   - `data/tenders.json`
   - `data/experience.json`
   - `data/harvest.json`
3. Optionally add a `cvs/` folder for base and tailored CVs.

## 3. Fine-grained personal access token
GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new token.
- **Resource owner:** you.
- **Repository access:** *Only select repositories* → pick **`tender-console-data`** only.
- **Permissions:** Repository permissions → **Contents: Read and write**.
- **Expiry:** set one (e.g. 90 days) and renew when it lapses.
- Copy the `github_pat_…` value.

## 4. Connect the app
Open the app → **Settings**:
- Owner: your GitHub username
- Private data repository: `tender-console-data`
- Branch: `main` · Data folder: `data`
- Token: paste the fine-grained token
- **Save & test connection** — it should report *Connected (private)* and sync your data in.

The token is stored only in your browser's localStorage on that device, and is never written to either repo. On another device, re-enter it once.

## Security notes
- The app shell is public; **your tender and CV data are not** — they sit behind the token in the private repo.
- Because the token lives in the browser, only use the app on machines you trust, and scope the token to just the data repo as above. Revoke it in GitHub any time.
- Private **GitHub Pages** (hiding even the shell) needs GitHub Enterprise; the two-repo split avoids that.

## What works now (Phase 1)
Store/console/archive of tenders (full-lifecycle records), go/no-go, requirements, compliance checklist, CV & pack links, outcomes; the experience bank (single source of truth) with an approve/reject harvest queue; offline viewing from cache with sync to GitHub.

## Phase 2 (next)
Active fit-scoring against your coverage, richer filtering, team access, and win/loss trend analytics — plus wiring `rfp-cv-tailor` to read/write this repo per `DATA-CONTRACT.md`.
