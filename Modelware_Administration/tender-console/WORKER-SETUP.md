# Tender Console — Assessment Worker · Setup & Runbook (GitHub Actions)

**What this sets up:** a worker that turns a salesperson's "Request assessment"
click into a drafted bid / partner / leave recommendation on the tender — no PC
of yours running, no backend. The app enqueues a request to `requests.json`; a
GitHub Action in the **private data repo** runs the real `rfp-cv-tailor` skill,
writes a **draft** `assessment{}` (`status:"proposed"`) onto the tender, and
commits it back. You then tap **Confirm** in the app to finalise it.

**Decisions** (register `EJwjtgC8WToykzEqK1vm3n`, 20 Oct 2026):
A = draft-then-confirm · B = official `claude-code-action` runs the real skill ·
C = Claude subscription OAuth token · D = trigger on push to `requests.json` ·
E = commit with the built-in `GITHUB_TOKEN`, no PAT. **Skill source:** a single
**plugin marketplace** repo that both your Claude and the worker read — so
there is never a second copy to drift.

## Where everything lives

- **Skill** → its own repo `modelwaresystems-dama/modelware-skills` (the
  `tender` plugin). This is the single source. **Not** copied into the data
  repo.
- **Workflow** → `modelware_app_storage/.github/workflows/assessment-worker.yml`
  (repo root, one level above the `tender-console-data/` folder).
- **Data** → `modelware_app_storage/tender-console-data/data/…` (unchanged).
- **App** → `data-management-tools/…/tender-console/index.html` (the Confirm
  button, v1.11.0, already built — just needs pushing).

---

## Step 1 — Create the skill marketplace repo (the single source)

I've delivered a ready `modelware-skills/` folder. Create a new GitHub repo
**`modelwaresystems-dama/modelware-skills`** and push that folder's contents to
it (so the repo root holds `.claude-plugin/marketplace.json`,
`plugins/tender/…`, `README.md`).

**Public or private?**
- **Public (simplest, recommended):** the worker clones it with no token. The
  repo holds the skill's methodology and your confirmed-experience notes — no
  credentials or client data. If you'd rather not have the experience notes
  public, tell me and I'll slim `experience-bank.md` out of the plugin (the
  sensitive specifics already live in the private `tender-console-data/data/experience.json`,
  which the worker reads at run time).
- **Private:** the worker's clone then needs read access to this repo. The
  built-in `GITHUB_TOKEN` is scoped to the data repo only, so you'd add a
  small read-only token for `modelware-skills` as a secret and I'll wire the
  workflow to use it. Say the word.

The delivered workflow points at
`https://github.com/modelwaresystems-dama/modelware-skills.git` — change it only
if you use a different repo name.

## Step 2 — Install the plugin in your Claude, retire the old skill

So your interactive work and the worker share the one source, install the
plugin in your Claude:

```
/plugin marketplace add modelwaresystems-dama/modelware-skills
/plugin install tender@modelware-skills
```

The skill is now **`/tender:rfp-cv-tailor`** (plugin skills are always
prefixed). **Then remove the old synced `rfp-cv-tailor` account skill** — if you
leave it, you're back to two copies. From here on you edit the skill in the
`modelware-skills` repo, commit, push; `/plugin update` pulls it into your
Claude and the next worker run picks it up. One edit, one source.

## Step 3 — Add the workflow

Put the delivered `assessment-worker.yml` at
`modelware_app_storage/.github/workflows/assessment-worker.yml` and push the
data repo. (I can't write `.github/` from here — it's protected from remote
tools — so this one's yours.)

## Step 4 — The subscription token

On your machine:

```
claude setup-token
```

Copy the token, then in the **data repo** on GitHub:
**Settings → Secrets and variables → Actions → New repository secret**
— name `CLAUDE_CODE_OAUTH_TOKEN`, value the token. (It's tied to your
subscription and expires; worker runs draw on your plan. Re-run and update the
secret when it lapses.)

## Step 5 — Let the workflow commit

**Settings → Actions → General → Workflow permissions** → **Read and write
permissions** → Save. That lets the built-in `GITHUB_TOKEN` push the assessment
back (card E — no PAT).

## Step 6 — Test before trusting it

I can't run any of this against GitHub from here, so the first live run is the
proof:

1. Ensure a tender has a `teamProposed[]`, an uploaded RFP, and a `queued`
   request in `requests.json` (request one from the app, or add a row).
2. **Actions → Assessment worker → Run workflow.**
3. Watch the log. On success: a `worker: assessment draft` commit, and the
   tender's `assessment{}` carries `status:"proposed"`.
4. Sync the app — the draft shows in the Assessment panel with a **Confirm**
   button.

Likely first-run snags: the plugin didn't install (check the
`plugin_marketplaces`/`plugins` lines and that the repo is reachable — private
needs step 1's token); auth error (bad/expired `CLAUDE_CODE_OAUTH_TOKEN`); push
rejected (step 5 not saved). Send me the log line and I'll adjust.

---

## Known limits — worth knowing, not blockers

- **Binary CVs.** PDFs read fine in CI; `.pptx` / `.docx` CVs may not parse
  cleanly — a person whose CV is a deck gets a weaker fit. Howard's own CV deck
  is the one to watch. If it bites, we add a text-extraction step.
- **Model.** The workflow uses the Action's default model (no `--model` pin).
  One line in `claude_args` changes it.
- **Cost.** Two meters — your Claude subscription (the OAuth token) and GitHub
  Actions minutes. `--max-turns 60` and the concurrency guard cap runaways.
- **Autonomy.** Worker mode runs triage with no approval gates (there's no
  human in CI). The gate you kept is the app's **Confirm**. A bad draft is
  disregardable and re-runnable; it's a *proposal*, never the `goNoGo.decision`.

---

## The app-side Confirm (card A) — built

`index.html` is now **v1.11.0** on your disk: a `proposed` assessment shows a
*Draft — awaiting review* banner with an admin-only **Confirm** button that
stamps `confirmed` / `confirmedBy` / `confirmedAt` and commits. A confirmed or
legacy assessment renders as before. JS syntax-checked. **Push the app repo
(`data-management-tools`) so v1.11.0 goes live on Pages.** (A
`index.html.bak-v111-…` backup sits beside it — ignore or delete.)

## Still yours

- **Revoke the PAT you pasted earlier** (register card F). The worker doesn't
  use it, but it's in the chat history and shouldn't exist.
- Add your salespeople as data-repo collaborators with their own fine-grained
  PATs (so the app enqueues requests as them) — unchanged from the sales plan.

---

*The shape: one marketplace repo as the single skill source, one JSON file as
the mailbox, one GitHub Action as the runtime, the built-in token as the
authority, and your Confirm tap as the one human gate.*
