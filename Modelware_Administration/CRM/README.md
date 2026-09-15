# The `CRM/` folder

What sits here and how it gets served. The folder is named `CRM/` so it can live
alongside other applications without any of the `index.html` files colliding.

| File | What it is |
|---|---|
| `index.html` | Landing page — three cards |
| `crm.html` | The CRM application, **build 1.35.0** (`07365d82ba6d`, 14 Sep 2026) |
| `manual.html` | The staff guide, rebuilt against 1.35.0 |
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

## Build 1.35.0 — what changed since 1.33.2

**1.34.0 — a person could not be made a partner.** The holder rule (don't turn a
person into a company) was written to stop a *student buying a course* becoming
an organisation. It was being applied to a business partner who trades under her
own name, which is a different thing. A person in the holder can now be given a
record of their own — marked both *partner* and *person* — taking their deals
with them and leaving everyone else in the bucket untouched.

**1.35.0 — the holder is no longer a row; its people are.** The control above
existed in 1.34.0 and could not be found: it was an 11.5px link at the bottom of
a stack of contact tiles, inside a card you had to know to open. Somebody looked
up under M was not under M, because the row was called *Individual*.

Companies & contacts now lists each person in a holder **under their own name**,
in the one alphabetical list, with their own deals, their own logged history and
their own totals. `companySummary` and `interactionsForCompany` take an optional
contact id so the arithmetic is theirs and not the bucket's. Their card carries
**Make ⟨name⟩ a partner** as a button at the top, and their sales channels as a
chip on the row. One line under the list keeps the holder's own
*stop holding individuals* toggle reachable.

A control nobody can find is a feature the application does not have.

## Verification

`./verify.sh` **has** been run against this build, in full:

| Suite | Result |
|---|---|
| `tests/harness.js` — fold, arithmetic, importer | 1043 passed, 0 failed |
| `tests/layout.js` — real Chromium, three viewports | 1101 passed, 0 failed |
| `tests/manual-check.js` — the manual against the app | 189 passed, 0 failed |
| `tests/connection-diagnostic.js` | 10 scenarios, all diagnosed correctly |
| `tests/pull-failure.js` | 4 passed |

The skill's `selftest.sh` also passes 16/16 against this `crm.html`, which is the
C20 fold contract holding — `crm_state.js` extracts `<script id="crm-core">` from
this exact file.
