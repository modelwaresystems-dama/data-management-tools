# CDMP Survey — deployment checklist

Reference for the whole pipeline. We go through it one step at a time in chat;
this is the map. Layout matches the folders you created.

## The shape
```
Respondent's browser                     Cloudflare Worker              GitHub
(public Pages form)          ──POST──▶   (holds the token)   ──API──▶   modelware_app_storage (PRIVATE)
data-management-tools/                    worker.js                       Data_Talent/cdmp_survey_data/
  DATA_Talent/cdmp-survey/                                                  responses/<id>.json
    index.html + survey.json                                                contacts/<id>.json (if email)

You (admin), later:  admin dashboard  ──your read-only token, in your browser──▶ reads that private folder
```

## Locations (already created)
- **App**  → `data-management-tools / DATA_Talent / cdmp-survey/`  (PUBLIC repo → Pages serves it, Navigator picks it up)
- **Data** → `modelware_app_storage / Data_Talent / cdmp_survey_data/`  (PRIVATE repo, responses land here)

## Step 2 — Publish the form
- Put `index.html` + `survey.json` in `data-management-tools/DATA_Talent/cdmp-survey/`, commit.
- Confirm GitHub Pages is enabled on `data-management-tools` (Settings → Pages). It likely already is if the Navigator is served from it.
- Live at `https://modelwaresystems-dama.github.io/data-management-tools/DATA_Talent/cdmp-survey/`.
- Open it — works in **preview mode** (shows the JSON it would save) until Step 5.

## Step 3 — A fine-grained token for the Worker
- GitHub → Settings → Developer settings → Fine-grained tokens → Generate new.
- **Repository access:** Only select repositories → **`modelware_app_storage`**.
- **Permissions:** Repository → **Contents: Read and write**. Nothing else.
- Copy the token (it goes into the Worker as a secret — never into any file).
- Note: a fine-grained token can't be scoped below repo level, so this token can write
  anywhere in `modelware_app_storage`, not only the survey folder. (See the decision we discussed.)

## Step 4 — Deploy the Worker
- Use `worker.js` + `wrangler.toml`. Set the vars (owner, repo, path prefix, branch, origin, survey id).
- Set the secret: `npx wrangler secret put GITHUB_TOKEN` → paste the Step-3 token.
- Deploy. Note the Worker URL, e.g. `https://cdmp-survey-proxy.<you>.workers.dev`.

## Step 5 — Wire the form to the Worker
- In the deployed `survey.json`, set `config.endpoint` to the Worker URL. Commit.
- Submit one real test response → confirm a file appears in `Data_Talent/cdmp_survey_data/responses/`.

## Step 6 — Analysis (built after Step 5 works)
- **Admin dashboard**: your fine-grained **read-only** token, kept in your browser (your
  "Read the library from GitHub" pattern), reads `Data_Talent/cdmp_survey_data/` and computes
  the 6 segments + 5 indices.
- **Public aggregate page**: aggregate results only, no raw responses.

## Notes
- Cloudflare's dashboard has rate-limiting rules for the Worker route if the endpoint is abused.
  The Worker already caps body size and drops bot submissions via a honeypot.
- Email (if given) is stored in `contacts/`, separate from `responses/`, so PII is isolated.
