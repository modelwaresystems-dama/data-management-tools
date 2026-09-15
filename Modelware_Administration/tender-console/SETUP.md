# Tender Console — setup (one-time, ~10 minutes)

Two repos, by design: a **public** one to host the app (so GitHub Pages works on any plan), and a **private** one that holds all your data. Your token only ever touches the private one.

## 1. Public repo for the app
1. Create a new **public** repo, e.g. `tender-console`.
2. Add `index.html` (the app) to it.
3. Settings → **Pages** → Source: `main` / root → Save. After a minute your app is live at
   `https://<your-username>.github.io/tender-console/`.

*(The page is public, but it shows nothing until it's given your token — all data lives in the private repo below.)*

## 2. Private repo for your data
You can **reuse your existing shared private repo** (`modelwaresystems-dama/modelware_app_storage`) — the app writes only under its own folder, exactly like the CRM (`CRM_Data/`) and partner pack builder. Or create a new private repo. Either way:
1. Pick a **data folder** for this app, e.g. `tender_console_data`.
2. Put the three seed files under it:
   - `<folder>/tenders.json`
   - `<folder>/experience.json`
   - `<folder>/harvest.json`
   *(The zip ships them under `data/` — rename that folder, or drop the files into your chosen folder.)*
3. Optionally add a `cvs/` area (e.g. `<folder>/cvs/base/`) for base and tailored CVs.

## 3. Fine-grained personal access token
GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new token.
- **Resource owner:** the owner of the data repo (e.g. `modelwaresystems-dama`).
- **Repository access:** *Only select repositories* → pick **just the data repo**.
- **Permissions:** Repository permissions → **Contents: Read and write**.
- **Expiry:** set one (e.g. 90 days) and renew when it lapses.
- Copy the `github_pat_…` value. (If you already have a token for `modelware_app_storage` with Contents write, reuse it.)

## 4. Connect the app
Open the app → **Settings**:
- Owner: the repo owner (your username or `modelwaresystems-dama`)
- Private data repository: e.g. `modelware_app_storage`
- Branch: `main` · Data folder: e.g. `tender_console_data`
- Token: paste the fine-grained token
- **Save & test connection** — it should report *Connected (private)* and sync your data in.
  *(If it says a repo is PUBLIC, stop and point it at a private one — your data shouldn't live in a public repo.)*

The token is stored only in your browser's localStorage on that device, and is never written to either repo. On another device, re-enter it once.

## Security notes
- The app shell is public; **your tender and CV data are not** — they sit behind the token in the private repo.
- Because the token lives in the browser, only use the app on machines you trust, and scope the token to just the data repo as above. Revoke it in GitHub any time.
- Private **GitHub Pages** (hiding even the shell) needs GitHub Enterprise; the two-repo split avoids that.

## What works now (Phase 1)
Store/console/archive of tenders (full-lifecycle records), go/no-go, requirements, compliance checklist, CV & pack links, outcomes; the experience bank (single source of truth) with an approve/reject harvest queue; offline viewing from cache with sync to GitHub.

## Phase 2 (next)
Active fit-scoring against your coverage, richer filtering, team access, and win/loss trend analytics — plus wiring `rfp-cv-tailor` to read/write this repo per `DATA-CONTRACT.md`.
