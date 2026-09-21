#!/usr/bin/env bash
# Runs every check on ../crm.html. From the dev folder:  ./verify.sh
# Needs Node and Playwright (npm i -D playwright && npx playwright install chromium).
set -u -o pipefail
cd "$(dirname "$0")"
APP="$(cd .. && pwd)/crm.html"
fail=0
echo "== stamp";            python3 stamp-build.py --file "$APP" --check || fail=1
echo "== owner hand-over";  node tests/handover.js "$APP" | tail -2 || fail=1
echo "== register 21 Sep";  node tests/register-0921.js "$APP" | tail -2 || fail=1
echo "== every screen";     node tests/smoke.js "$APP" | tail -1 || fail=1
[ $fail -eq 0 ] && echo "ALL GREEN" || { echo "SOMETHING FAILED"; exit 1; }
