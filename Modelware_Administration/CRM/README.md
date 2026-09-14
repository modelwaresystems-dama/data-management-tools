# The `CRM/` folder

What sits here and how it gets served. The folder is named `CRM/` so it can live
alongside other applications without any of the `index.html` files colliding.

| File | What it is |
|---|---|
| `index.html` | Landing page — three cards |
| `crm.html` | The CRM application, **build 1.33.2** (`242370434a8d`, 14 Sep 2026) |
| `manual.html` | The staff guide, rebuilt against 1.33.2 |
| `loose-ends.html` | The six open backfill questions |

`index.html` links to `loose-ends.html` by relative path and probes for it on
load: if the file is ever absent the card greys out and says so, instead of
handing anyone a 404. Nothing to edit either way.

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
some plans; if the Visibility control is missing or greyed out, remove
`loose-ends.html` from the folder — the landing page will show the card as
unpublished rather than breaking.

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

---

## Build 1.33.2 — what changed since 1.33.0

The file previously here was **1.33.0** (`fe32cb5bad9e`). Two defect fixes on top
of it, both found by Howard in use:

**1.33.1 — a private buyer's deal showed the whole Individual bucket.** The deal
panel listed "everyone at this company", which is right for a real customer and
nonsense for the holder: twelve independents share one holder record, so all
twelve of their deals listed all twelve people. A deal filed under a holder now
shows its own buyer and nobody else. A deal at a real company still lists
everyone at it, because there they genuinely are colleagues.

**1.33.2 — a person could not be found in the partner and channel pickers.**
Independents were sorted silently to the top of a flat list, so the list *looked*
alphabetical and was not — somebody hunted for at the letter M was concluded to
be absent. Both pickers now split into labelled groups (*Independents* first,
then *At a company*), and the channel picker has a filter box. A sort nobody can
see is a sort that lies.

## Verification

`./verify.sh` **has** been run against this build, in full:

| Suite | Result |
|---|---|
| `tests/harness.js` — fold, arithmetic, importer | 1043 passed, 0 failed |
| `tests/layout.js` — real Chromium, three viewports | 1041 passed, 0 failed |
| `tests/manual-check.js` — the manual against the app | 187 passed, 0 failed |
| `tests/connection-diagnostic.js` | 10 scenarios, all diagnosed correctly |
| `tests/pull-failure.js` | 4 passed |

The skill's `selftest.sh` also passes 16/16 against this `crm.html`, which is the
C20 fold contract holding — `crm_state.js` extracts `<script id="crm-core">` from
this exact file.

## Two corrections to the previous README

It described **credit note, refund and `documentsOnly` behaviour** and a
**57-deal regression**. None of that is in the build that was in this folder —
`creditNote` and `documentsOnly` appear zero times in it. Either that work went
somewhere else or the note was written ahead of it. Nothing has been removed:
1.33.2 is 1.33.0 plus the two fixes above.

It also said `loose-ends.html` "is not in this folder yet". It is, and was.
