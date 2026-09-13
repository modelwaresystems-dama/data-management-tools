# The `CRM/` folder

What sits here and how it gets served. The folder is named `CRM/` so it can live
alongside other applications without any of the `index.html` files colliding.

| File | What it is |
|---|---|
| `index.html` | Landing page — three cards |
| `crm.html` | The CRM application, build 1.33.0 |
| `manual.html` | The staff guide |
| `loose-ends.html` | The six open backfill questions — **committed separately** |

`loose-ends.html` is not in this folder yet. `index.html` links to it by relative
path and probes for it on load: until the file is committed the card greys out
and says so, instead of handing anyone a 404. Drop the file in beside
`index.html` and the card lights up on its own — nothing to edit.

## Where the folder goes for Pages

GitHub Pages serves only from the repository root or from `/docs` — never from an
arbitrary folder. So `CRM/` goes **inside whichever of those two the site already
uses**:

| If Pages serves from | Put the folder at | Address |
|---|---|---|
| root (`/`) | `CRM/` | `https://<site>/CRM/` |
| `/docs` | `docs/CRM/` | `https://<site>/CRM/` |

Either way the address is `/CRM/`, and other applications keep their own
`index.html` untouched. Nothing inside the folder refers to its own location —
every link is relative — so it works from either place unchanged.

**Settings → Pages → Visibility: Private.** This is the part that matters.
`loose-ends.html` carries real customer names, invoice numbers and amounts. On a
public Pages site that is all on the open web, whether or not the repository
itself is private. Private Pages needs GitHub Enterprise Cloud, or Pro/Team on
some plans; if the Visibility control is missing or greyed out, do not commit
`loose-ends.html` at all — the landing page will simply show the card as
unpublished.

## How answers come back

`loose-ends.html` has no backend and holds no credential. Each person picks their
name, answers, and then either:

- **Save my answers file** — downloads `<name>-<date>.json` for someone to commit, or
- **Commit it straight to GitHub** — pushes the same file using **their own**
  fine-grained token, scoped to this one repository with *Contents: read and write*.

The token lives in that person's browser and is sent nowhere but `github.com`.
Nothing shared is ever embedded in the page — the same reasoning that keeps a
token out of `crm.html`.

Files land in `CRM_Data/loose-ends/` by default, which is configurable on the
page. Answering twice updates the same file rather than failing.

## Build 1.33.0 — one thing to check

`verify.sh` has **not** been run against this build — only `selftest.sh` (16
passed) and a 36-assertion suite covering the new credit note, refund and
`documentsOnly` behaviour, plus a regression proving all 57 deals' money is
unchanged from 1.32.0. Run `verify.sh` before anyone relies on it.

The previous build, 1.32.0, was overwritten in place on 10 September 2026 and is
recoverable from git history.
