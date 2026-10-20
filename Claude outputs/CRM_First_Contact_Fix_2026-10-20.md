# CRM handover — false "Make first contact" steps (20 Oct 2026)

Run from export **crm-events-2026-10-20** (build 1.55.2, 2,281 events, taken 04:01).
App source read from the connected repo; **no app code was changed in this session** — the
importer fix below is a spec for the build session.

Decisions came from the register **First-Contact Cleanup**
(https://claude.ai/artifact/5KWN4SPE5usVG4CJS4QsZf): method **A**, Lungelo **keep (reworded)**,
importer **fix**. No comments, no row exceptions.

---

## 1 · The finding (counted)

Folded the event log: **175 deals, 413 follow-ups.** Thirteen deals carry an open
"Make first contact" step.

- **11 are false** — the deal already has logged interactions, i.e. contact was made. All 11
  were created by the triage imports between 13–16 Oct; the tell is that each step's id is
  `fu_` + the deal id, so it was auto-generated at deal creation, not set by a person.
- **2 are genuine** and were left untouched: `MetLife · DCAM Certification`
  (`dl_mt1bunb05jth6c`) and `Individual · CDMP DQ Specialist Training` (`dl_mt1bwpxsckps3l`),
  both created 20 Aug with no interaction ever logged.

Root cause is my own: the triage imports create each new deal with a default first-contact
step even when the same row logs the email that *is* the first contact.

---

## 2 · Deliverable — the correction batch (data, ready to import)

**File:** `2026-10-20-first-contact-fix.json` (version-2 envelope, 11 rows). Validated against
the export: 11 rows, 0 errors; every `completes` id exists, is open, is on the named deal, and
is owned by Debbie; every `interactionId` matches the deal's logged email exactly.

Each row: re-emits the deal's **existing** email verbatim (same `interactionId`, so the fold
rewrites that one line rather than adding a second), then **`completes`** the stale
first-contact step and sets a real **`nextStep`** (owner `debbie`). For Lungelo the next step is
the reworded first-contact action, per the register.

### ⚠ This batch must be imported from **Debbie's** CRM, not Howard's

All 11 steps are owned by Debbie. The importer refuses to let one person tick off another's
step — `crm.html`, in the completion guard (search `"is " + userName_(cfg, f.owner)`):

```js
if (f.owner && f.owner !== actor){
  out.errors.push(... "is " + userName_(cfg, f.owner) + "'s step, not yours. ...");
  return false;
}
```

If Howard imports it (actor = `howard`), **all 11 completion rows error** and nothing lands.
Run it from Debbie's browser (actor = `debbie`) via **Settings → Import approved interactions**.
If that isn't practical, the fallback is Howard clearing the 11 steps by hand in the app — the
next steps below are what each should become.

### The 11 rows

| Deal | Deal id | Clears | New next step (owner Debbie) | Due |
|---|---|---|---|---|
| Abdul Mobeen — CDMP Masters | `d_1534f7fca1a009bf` | Make first contact | Follow up on Specialist/Master prep course decision | 24 Oct |
| Vikas — Specialist Exam Prep | `d_b7a3fd9e201b00f4` | Make first contact | Follow up on Nov vs 2027 / DIY decision | 24 Oct |
| Nonkululeko — Specialist Training | `d_d0bb3486e926ae1d` | Make first contact | Follow up on DG & DQ Specialist (9-11 Nov) interest | 27 Oct |
| SARB (Phokoje +2) — CDMP Exam | `d_e7a7538635acf739` | Make first contact | Confirm finance issued the exam-coupon invoices (Beverly +2) | 22 Oct |
| Corleen Reynders — CDMP enquiry | `d_561599e0d2b1bf50` | Make first contact | Follow up after CDMP Q&A on Fri 23 Oct | 24 Oct |
| Jane Makgeledisa — renewal + DG | `d_e311844557a66f4e` | Make first contact | Follow up on DG course (9-11 Nov) + renewal | 27 Oct |
| Rahul Vanmali (Investec) | `d_81d551a940fb84d4` | Make first contact | Confirm Investec payment approval; seat held 7-10 Dec | 23 Oct |
| Transnet (8 attendees) | `d_07a609404b5d5409` | Make first contact | Follow up on cohort choice - public vs custom private | 23 Oct |
| Andile Ndlovu | `d_75cabc01c97e40a2` | Make first contact | Await ACSA L&D admin contact; confirm quotes accepted | 27 Oct |
| Hollard (Gomez Nkosi) | `d_35414511eea701ba` | Make first contact | Follow up on CDMP Fundamentals enquiry | 23 Oct |
| Lungelo (SARB) — *reworded* | `d_ae124bc49f5e1a02` | Make first contact | Reach out to Lungelo directly re CDMP Fundamentals | 22 Oct |

Due dates are drafts — Debbie can change any of them on import or after.

---

## 3 · Deliverable — the importer fix (spec for the build session; NOT done here)

**Where:** `crm.html` → `triageCreate()` → the next-step default (search
`what:"Make first contact"`, ~line 5638):

```js
var closed = (outcome === "won" || outcome === "lost");
var ns = (r.nextStep && r.nextStep.what) ? r.nextStep
       : (closed ? null : { what:"Make first contact", dueDate:deferBy(today, 7) });
```

**Why it's wrong:** a triage row that *creates* a deal always carries a summary (the importer
requires one and logs an interaction per row). So a deal born via import has **already** had its
first contact — the email that created it. Defaulting to "Make first contact" is therefore wrong
on every import-created deal that didn't set an explicit `nextStep`. (The comment just above
defends the default on the premise that a deal with no step is an invisible cold deal — that
premise doesn't hold here, because the deal just logged activity.)

**Recommended change:** when a triage-created deal carries no explicit `nextStep`, create **no**
default step. The deal then shows the honest `No next step` flag — correct, because contact was
made and the next action is simply undecided. Update the adjacent comment to say so.

```js
// A triage-created deal has already logged the email that created it, so it is
// not an invisible cold deal. With no next step named, leave it on "No next step"
// (honest) rather than inventing "Make first contact".
var closed = (outcome === "won" || outcome === "lost");
var ns = (r.nextStep && r.nextStep.what) ? r.nextStep : null;
```

Alternative, if the "always born with a step" invariant is worth keeping: default to a neutral
`{ what:"Follow up", ... }` instead of "Make first contact". Either removes the false flag;
"No next step" is the more truthful of the two.

**Leave the manual path alone.** The in-app new-deal form (search
`what: first.value.trim() || "Make first contact"`, ~line 8155) legitimately defaults to
"Make first contact", because a hand-created deal may genuinely have had no contact yet. The fix
is specific to `triageCreate` (the import path).

**Version:** bug fix → **PATCH, 1.55.2 → 1.55.3** (edit only the `<meta name="version">` tag per
the repo standard). Builder's call if they'd rather treat the behaviour change as MINOR.

**Tests (`CRM/dev/tests/`):** add a case — a triage row that creates a new deal and logs an
interaction emits **no** `Make first contact` follow-up (asserts the deal lands on `No next
step`). Run the existing fold/import suites.

**Note:** this fix stops the problem recurring; it does **not** remove the 11 existing steps —
that's what the batch in §2 does.

---

## 4 · Open items / carryovers

- **Who imports the batch** (§2) is the one decision left: Debbie imports, or Howard clears the
  11 by hand. Flagged above, not resolved here.
- The 2 genuine first-contact steps (MetLife DCAM, CDMP DQ Specialist) are correct and untouched.
- Carryover from prior sweeps still open: **Layla's mailbox returns 403** (no delegate grant) —
  her CRM-tagged mail is still never captured; needs a delegate grant to fix.
