# Tender Console — Assessment Worker · Setup & Runbook (GitHub Actions)

**What this sets up:** a worker that turns a salesperson's "Request assessment"
click into a drafted bid / partner / leave recommendation on the tender — with
no PC of yours running, and no backend. The app enqueues a request to
`requests.json`; a GitHub Action in the **private data repo** runs the real
`rfp-cv-tailor` skill, writes a **draft** `assessment{}` (`status:"proposed"`)
onto the tender, and commits it back. You then tap **Confirm** in the app to
finalise it.

**Decisions it implements** (register `EJwjtgC8WToykzEqK1vm3n`, 20 Oct 2026):
A = draft-then-confirm · B = official `claude-code-action` running the real
skill · C = Claude subscription OAuth token · D = trigger on push to
`requests.json` · E = commit with the built-in `GITHUB_TOKEN`, no PAT.

Everything here goes in the **private data repo (`modelware_app_storage`)** —
never the public app repo.

---

## Before you start

You need admin access to `modelware_app_storage`, and the Claude CLI installed
locally (to mint the subscription token in step 3). Two files from this
delivery go into the repo: `assessment-worker.yml` and the `rfp-cv-tailor`
skill.

---

> **Where things sit.** Your data lives in `modelware_app_storage/tender-console-data/` (that's the folder connected to this session). The two new pieces — `.github/` and `.claude/` — go at the **repo root**, i.e. `modelware_app_storage/.github/...` and `modelware_app_storage/.claude/...`, one level *above* `tender-console-data/`. I can't reach the repo root from here (only the `tender-console-data/` subfolder is shared), so these two you place yourself and push. The worker finds the data by glob, so the nesting doesn't trip it up.

## Step 1 — Put the skill in the data repo

The Action runs the skill from the repo it checks out, so the skill must live
there:

```
modelware_app_storage/
  .claude/
    skills/
      rfp-cv-tailor/
        SKILL.md
        references/
          config-register.md
          experience-bank.md
          build-recipe.md
```

Copy your current `rfp-cv-tailor` skill folder (the one in your account) into
`.claude/skills/` in the data repo. **Save the updated skill first** (the
review card I'm sending alongside this) so the copy carries the GitHub-Actions
Worker mode and the `proposed` status — then copy that version in.

> **Honest wrinkle (card B).** You picked "one source of truth, no drift," but
> the Action can only load a skill that's committed to the repo — so there are
> now two copies: your account skill, and this repo copy. Keep them in sync
> (re-copy on any change). If that bothers you later, the clean fix is to make
> the data-repo copy the canonical one and point your account skill at it, or
> add a tiny CI check that fails when they diverge. Say the word and I'll build
> the check.

## Step 2 — Add the workflow

Put `assessment-worker.yml` at:

```
modelware_app_storage/.github/workflows/assessment-worker.yml
```

It triggers on a push that changes any `requests.json`, plus a manual
**Run workflow** button for testing. It runs one job at a time (concurrency
guard) and will not re-fire on its own commit.

## Step 3 — Create the subscription token and store it as a secret

On your machine, in any directory:

```
claude setup-token
```

This mints a long-lived OAuth token tied to your Claude subscription (Pro / Max
/ Team / Enterprise). Copy it, then in the data repo on GitHub:

**Settings → Secrets and variables → Actions → New repository secret**
- **Name:** `CLAUDE_CODE_OAUTH_TOKEN`
- **Value:** the token from `claude setup-token`

That is the only secret this worker needs. (You chose the subscription token
over a metered API key — card C. Two things that come with that choice: the
token is tied to *your* subscription, so worker runs draw on your plan's usage
alongside your own; and it expires, so set a reminder to re-run
`claude setup-token` and update the secret when it does.)

## Step 4 — Allow the workflow to commit

**Settings → Actions → General → Workflow permissions** → select
**Read and write permissions** → Save. This lets the built-in `GITHUB_TOKEN`
push the assessment back (card E — no PAT anywhere). The workflow itself also
requests `contents: write`, but the repo setting must permit it.

You do **not** need to install the Claude GitHub App for this worker — the
workflow passes `GITHUB_TOKEN` to the Action for its GitHub operations. (If a
run ever complains about GitHub App auth, installing the app at
<https://github.com/apps/claude> on this one repo resolves it.)

## Step 5 — Test it before trusting it

I cannot run any of this against GitHub from here, so the first live run is the
proof. Do a dry run:

1. Make sure one tender in the data has a `teamProposed[]`, an uploaded RFP, and
   a `queued` request in `requests.json` (request one from the app, or hand-add
   a row).
2. In the data repo: **Actions → Assessment worker → Run workflow**.
3. Watch the run log. On success you'll see a new commit `worker: assessment
   draft (run …)`, and the tender's `assessment{}` will carry
   `status:"proposed"`.
4. Sync the app — the proposed assessment appears in the tender's Assessment
   panel.

If the run fails, the log says where. The likely first-run snags, and the fix:

- **Tool not allowed / skill didn't act** → the skill folder isn't at
  `.claude/skills/rfp-cv-tailor/` in the repo, or `--allowedTools` needs a tool
  the skill uses. Tell me the log line and I'll adjust `claude_args`.
- **Auth error** → the token in `CLAUDE_CODE_OAUTH_TOKEN` is wrong or expired;
  test it locally with `claude` first.
- **Push rejected** → step 4 (Read and write permissions) wasn't saved.

---

## Known limits — worth knowing, not blockers

- **Binary CVs.** The worker reads CVs with the Read tool. PDFs read fine.
  `.pptx` / `.docx` CVs may not parse cleanly in CI — if a person's CV is a
  deck, the worker's fit for that person is only as good as what it can read.
  If that bites, we add a text-extraction step. Howard's own CV deck is the
  one to watch here.
- **Model.** The workflow uses the Action's default model (no `--model` pin).
  If you want a specific model for triage quality or cost, it's one line in
  `claude_args`.
- **Cost.** Two meters: your Claude subscription usage (the OAuth token) and
  GitHub Actions minutes. `--max-turns 60` caps a runaway run; the concurrency
  guard caps parallelism.
- **Autonomy.** Worker mode runs the triage with no approval gates — by design
  (there's no human in CI). The gate you kept is the app's **Confirm** step
  (next section). A bad draft is disregardable and re-runnable; it is a
  *proposal*, never the `goNoGo.decision`.

---

## The remaining app-side piece (draft-then-confirm, card A)

Card A means the worker drafts and a **human confirms in the app**. That needs
one additive change to `index.html` (a v1.11.0 bump):

- The Assessment panel renders `assessment.status` — a **"proposed"** draft
  shows a *Drafted by the worker — review and confirm* banner.
- An **admin-only Confirm button** sets `assessment.status = "confirmed"`,
  `confirmedBy = me()`, `confirmedAt = now`, then commits — turning the draft
  into a signed-off assessment. (Edit-before-confirm optional.)

This is the one piece that still touches the public app repo. I'll build it
next and verify it live.

---

## Still yours to do

- **Revoke the PAT you pasted earlier** (register card F — you marked it "not
  yet"). The worker doesn't use it, but it's in this chat's history and should
  not exist. GitHub → Settings → Developer settings → Fine-grained tokens →
  revoke it.
- **Add your salespeople as data-repo collaborators** with their own
  fine-grained PATs (so the app can enqueue requests as them) — unchanged from
  the sales-intake plan.

---

*The shape is deliberately the simplest thing that keeps "static app, no
backend, run the real skill": one JSON file as the mailbox, one GitHub Action
as the runtime, the built-in token as the authority, and your Confirm tap as
the one human gate.*
