#!/usr/bin/env bash
# preship.sh — ship gate for glossary-workbench.html.
# Injects a fresh machine-generated build stamp, compiles the app, and runs the
# four test suites. Prints "✅ GREEN" (exit 0) or "⛔ RED …" (exit 1).
# SHIP ONLY ON GREEN: gate the copy/commit on this script's exit code, e.g.
#     if ./preship.sh; then <commit>; else echo RED; fi
set -uo pipefail
cd "$(dirname "$0")" || exit 1
APP="glossary-workbench.html"

RED(){ echo ""; echo "⛔ RED — $1"; exit 1; }

[ -f "$APP" ] || RED "no $APP next to preship.sh"

# 1. Ensure test deps (installed with --no-save; skipped once present).
if [ ! -d node_modules/@babel/standalone ] || [ ! -d node_modules/jsdom ]; then
  echo "· installing test deps…"
  npm install --no-save react@18.2.0 react-dom@18.2.0 @babel/standalone@7.23.10 \
    @babel/parser@7.23.9 xlsx@0.18.5 jsdom@24 fake-indexeddb@5 >/tmp/wb_npm.log 2>&1 \
    || { tail -20 /tmp/wb_npm.log; RED "npm install failed"; }
fi

# 2. Machine-inject a fresh UTC build stamp (NEVER hand-authored).
STAMP="$(date -u '+%Y-%m-%d %H:%M UTC')"
grep -qE '^const APP_BUILD = ".*";' "$APP" || RED "APP_BUILD stamp not found in $APP"
if sed --version >/dev/null 2>&1; then
  sed -i -E "s/^const APP_BUILD = \".*\";/const APP_BUILD = \"${STAMP}\";/" "$APP"
else
  sed -i '' -E "s/^const APP_BUILD = \".*\";/const APP_BUILD = \"${STAMP}\";/" "$APP"
fi
echo "· APP_BUILD = ${STAMP}"

# 3. Compile check, then the four suites. First failure stops the gate.
echo "· compiling…";           node wb_compile.js     || RED "compile failed"
echo "· lint (duplicate keys)"; node wb_lint.js        || RED "lint failed"
echo "· quant-edge normalize";  node wb_edge_test.js   || RED "edge test failed"
echo "· hierarchy (Hypernym)";  node wb_hier_test.js   || RED "hierarchy test failed"
echo "· github storage adapter";node wb_gh_test.js     || RED "gh storage test failed"
echo "· mount smoke";           node wb_mount_smoke.js || RED "mount smoke failed"

VER="$(grep -oE '^const APP_VERSION = "[^"]+"' "$APP" | head -1 | sed -E 's/.*"([^"]+)".*/\1/')"
echo ""
echo "✅ GREEN — v${VER} @ ${STAMP} · compile + lint + 4 suites pass"
exit 0
