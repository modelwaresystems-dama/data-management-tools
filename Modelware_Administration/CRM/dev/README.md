# CRM — dev folder

The checks and build scripts for `../crm.html`. **Commit this folder with the app.**
It lives here, not in a cloud workspace, because on 21 Sep 2026 a workspace reset
took 2,748 checks with it (register T1).

## Run everything

```bash
cd dev
npm i -D playwright && npx playwright install chromium   # first time only
./verify.sh
```

`ALL GREEN` or it names what failed. Set `CRM_CHROMIUM=/path/to/chrome` to use a
browser you already have.

## What is here

| File | What it checks |
|---|---|
| `stamp-build.py` | Stamps `crm.html` with version, date and a content fingerprint, and writes the repo-standard `<meta name="version">` from the same number; `--check` verifies both. Run after every change: `python3 stamp-build.py --file ../crm.html --version 1.x.0 --date "D Mon YYYY"` |
| `tests/handover.js` | Reassigning a deal carries its open steps; stranded steps are shown and fixable; imports carry them too (49 checks) |
| `tests/register-0921.js` | Unpaid seats before a course; 30-day default terms; domain proposals; creating a partner from a deal (80 checks) |
| `tests/vat-1001.js` | Commission is on the net: VAT and resale out of the base, a credit note reducing it by its net, the per-line split, and the on-screen breakdown (42 checks) |
| `tests/altemails-1001.js` | One contact, several email addresses: the fold, matching either address, the import field, the collision guard, free-mail never becoming a company, the dialog (60 checks) |
| `tests/bands-1001.js` | Folding the Today bands: the fold, the hidden-count, persistence across a reload, empty bands keeping a plain heading (36 checks) |
| `tests/smoke.js` | Every screen, every demo deal panel and edit form, desktop and phone: nothing throws |
| `tests/browser.js` | Where Chromium is |

## The rule

A change is not done until `./verify.sh` is green **and** the change has its own
test file here. The suites that were lost are being rebuilt this way, one change
at a time.
