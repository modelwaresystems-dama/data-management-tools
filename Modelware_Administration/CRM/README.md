# The `CRM/` folder

What sits here and how it gets served. The folder is named `CRM/` so it can live
alongside other applications without any of the `index.html` files colliding.

| File | What it is |
|---|---|
| `index.html` | Landing page — three cards |
| `crm.html` | The CRM application, **build 1.39.0** (`63893563e7ef`, 16 Sep 2026) |
| `manual.html` | The staff guide, rebuilt against 1.39.0 |
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

## Build 1.39.0 — what changed since 1.33.2

**1.34.0 / 1.35.x — a person could not be made a partner, then every student became
a row.** The holder rule (don't turn a person into a company) was written for
*private buyers* and was being applied to a sole proprietor. A person in the holder
can now be given a record of their own. Browsing shows the holder as one row;
**typing** a name turns that person into their own row with their deals, their
history and the button that makes them a partner. Searching is the act of looking
somebody up; browsing is not.

**1.36.0 — the five training channels.** `channel` on the deal, `partnerRef` on the
partner, `facilitatorRef` for who delivered it. On channels 3, 4, 5.2 and 5.3 **the
partner is the customer** — they contract their own client and pay us — which
reverses the old "a partner-led deal belongs to the end customer" rule. The partner
taxonomy is read from the Partner Pack Builder's register, never held twice.

**1.37.0 — one Edit form per company.** Name and domain had no control on the
Companies page at all; five other facts were five separate links. All seven are now
one form and one Save.

**1.38.0 — a cancelled invoice can be reinstated.** Cancelling was one-way, and it
sits in the same dialog as Save. Reinstating brings back the value, the payments and
the commission; the cancellation stays in the log. Same for a purchase order.

**1.39.0 — a batch can close the step the mail actually did.** Only when the row
*names* the step by id, only when the mail IS the step, never somebody else's, and
dated the day the mail went. Every open step it passed over is listed beside it as a
near miss — because a list of what was ticked off, with no list of what was left,
reads as though everything is handled.

## Verification

`./verify.sh` **has** been run against this build, in full:

| Suite | Result |
|---|---|
| `tests/harness.js` — fold, arithmetic, importer | 1134 passed, 0 failed |
| `tests/layout.js` — real Chromium, three viewports | 1161 passed, 0 failed |
| `tests/manual-check.js` — the manual against the app | 196 passed, 0 failed |
| `tests/connection-diagnostic.js` | 10 scenarios, all diagnosed correctly |
| `tests/pull-failure.js` | 4 passed |

The skill's `selftest.sh` also passes 16/16 against this `crm.html`, which is the
C20 fold contract holding — `crm_state.js` extracts `<script id="crm-core">` from
this exact file.
