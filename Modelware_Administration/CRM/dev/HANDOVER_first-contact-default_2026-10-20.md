# Handover — stop `triageCreate` defaulting to "Make first contact"

**Date:** 20 Oct 2026 · **Build seen:** 1.55.2 · **For:** the CRM build session
**Written from:** a Cowork session that read `crm.html` but did **not** change it.

## The problem

A triage import that **creates** a deal gives it a default next step
`Make first contact` (+7 days). But an import row always carries a summary, so the
new deal has **already** logged the email that is its first contact. The step is
therefore false from birth. On the 20 Oct export, **11 of 13** open "Make first
contact" steps were this — every one created by the 13–16 Oct triage imports
(the tell: each step id is `fu_` + the deal id). The 11 were cleared in the app by
hand; this handover is the forward cure so it stops recurring.

## Why it can't be fixed by an import after the fact

Both retrofit routes are dead ends, confirmed against 1.55.2:

- A correction row that re-logs the existing email is `sameLine` and the importer
  short-circuits it (`if (sameLine){ ... return; }`, ~line 5131) **before** the
  `nextStep` block (~5165). So an already-logged email can never set a next step.
- The only thing that runs before that return is `completes`, and it is owner-
  guarded (`if (f.owner && f.owner !== actor)`, ~line 5048) — these steps are
  Debbie's, so only she could complete them, and even then the replacement next
  step is still skipped.

So the cure has to be at **deal creation**, not in a later import.

## The change (one spot)

`crm.html` → `triageCreate()` → the next-step default. Search
`what:"Make first contact"` (~line 5638). Current:

```js
var closed = (outcome === "won" || outcome === "lost");
var ns = (r.nextStep && r.nextStep.what) ? r.nextStep
       : (closed ? null : { what:"Make first contact", dueDate:deferBy(today, 7) });
```

Proposed — a triage-created deal has already logged the email that created it, so
leave it on the honest `No next step` flag when the row names none:

```js
// A triage-created deal has already logged the email that created it, so it is
// not an invisible cold deal. With no next step named, leave it on "No next step"
// (honest) rather than inventing "Make first contact".
var closed = (outcome === "won" || outcome === "lost");
var ns = (r.nextStep && r.nextStep.what) ? r.nextStep : null;
```

Update the comment block just above it (the band-3 rationale), whose premise — a
deal with no step is an invisible cold deal — does not hold for a triage-created
deal that just logged activity.

Alternative, if the "always born with a step" invariant is worth keeping: default
to a neutral `{ what:"Follow up", ... }` instead of `"Make first contact"`.
"No next step" is the more truthful of the two.

## Leave the manual path alone

The in-app new-deal form (search `what: first.value.trim() || "Make first contact"`,
~line 8155) legitimately defaults to "Make first contact" — a hand-created deal may
genuinely have had no contact yet. Only `triageCreate` changes.

## Done means

- New test file `dev/tests/firstcontact-1020.js`: a triage row that creates a new
  deal **and** logs an interaction emits **no** `Make first contact` follow-up and
  the deal lands on `No next step`; a row that names its own `nextStep` still gets
  it; a closed (won/lost) row still gets no step; the manual new-deal form still
  defaults to "Make first contact".
- `./verify.sh` green.
- `python3 stamp-build.py --file ../crm.html --version 1.55.3 --date "D Mon 2026"`
  (bug fix → PATCH; builder's call if it's treated as MINOR).

## Note

This fix stops the problem recurring. It does **not** remove existing false steps —
those were handled in-app on 20 Oct.
