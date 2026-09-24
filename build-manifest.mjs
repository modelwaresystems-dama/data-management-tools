#!/usr/bin/env node
/**
 * build-manifest.mjs — Modelware Asset Navigator catalog builder.
 *
 * assets.json is the master catalog, curated inside the navigator's
 * "Manage" mode (directory-main convention). This script stamps each
 * included asset with its VERSION and writes assets-manifest.json, the
 * file index.html renders from.
 *
 * VERSION per asset — the meaningful number the app declares in its own
 * source (what Claude bumped when building it). Detected in priority order:
 *   1. <meta name="version" content="X">
 *   2. APP_VERSION = "X"        (JS constant; quotes/spaces/`v` prefix vary)
 *   3. data-version="X"         (HTML attribute)
 *   4. appVersion / VERSION = "X"
 *   5. a version alone inside a tag, e.g. <span>v1.33.0</span> (visible badge;
 *      the trailing "<" means changelog lines like "v3.24 - added ..." don't match)
 *   6. fallback: the file's git last-commit date + short SHA
 *
 * The git last-commit date is always recorded as the "updated" date, so a
 * card can show both "vX.Y.Z" and "updated YYYY-MM-DD".
 *
 * Runs in CI on every push and locally.
 */

import { readFileSync, writeFileSync, statSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const ASSETS_JSON = join(ROOT, "assets.json");
const OUT = join(ROOT, "assets-manifest.json");

function readText(file) {
  try { return readFileSync(file, "utf8"); } catch { return ""; }
}

const VERSION_PATTERNS = [
  /<meta\s+[^>]*name\s*=\s*["']version["'][^>]*content\s*=\s*["']v?(\d+(?:\.\d+){1,3})["']/i,
  /<meta\s+[^>]*content\s*=\s*["']v?(\d+(?:\.\d+){1,3})["'][^>]*name\s*=\s*["']version["']/i,
  /\bAPP_VERSION\s*[:=]\s*["']v?(\d+(?:\.\d+){1,3})["']/i,
  /\bdata-version\s*=\s*["']v?(\d+(?:\.\d+){1,3})["']/i,
  /\bappVersion\s*[:=]\s*["']v?(\d+(?:\.\d+){1,3})["']/i,
  /(?:^|[^A-Za-z0-9_])VERSION\s*[:=]\s*["']v?(\d+(?:\.\d+){1,3})["']/i,
  />\s*v(\d+(?:\.\d+){1,3})\s*</i
];

function extractVersion(html) {
  for (const re of VERSION_PATTERNS) {
    const m = html.match(re);
    if (m) return m[1];
  }
  return null;
}

function gitInfo(relPath) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs%x09%h", "--", relPath], { cwd: ROOT, encoding: "utf8" }).trim();
    if (!out) return { date: "", sha: "" };
    const [date, sha] = out.split("\t");
    return { date: date || "", sha: sha || "" };
  } catch { return { date: "", sha: "" }; }
}

let curated = { audiences: {}, assets: [] };
try {
  curated = JSON.parse(readFileSync(ASSETS_JSON, "utf8"));
} catch (e) {
  console.error("ERROR: could not read assets.json (" + e.message + ")");
  process.exit(1);
}

const included = (curated.assets || []).filter((a) => a && a.href && a.include !== false);

const assets = [];
let withVersion = 0;
for (const a of included) {
  const abs = join(ROOT, a.href);
  if (!existsSync(abs)) {
    console.warn("WARN: catalog entry has no file on disk (skipped): " + a.href);
    continue;
  }
  const html = readText(abs);
  const git = gitInfo(a.href);
  const version = extractVersion(html);
  if (version) withVersion++;
  let updated = git.date;
  if (!updated) {
    try { updated = new Date(statSync(abs).mtime).toISOString().slice(0, 10); } catch { updated = ""; }
  }
  assets.push({
    href: a.href,
    title: a.title || a.href,
    group: a.group || "General",
    audience: a.audience || "technical",
    icon: a.icon || "fa-file-code",
    desc: a.desc || "",
    tags: Array.isArray(a.tags) ? a.tags : [],
    version: version,
    gitDate: git.date,
    gitSha: git.sha,
    updated
  });
}

const manifest = {
  generatedAt: new Date().toISOString(),
  count: assets.length,
  withVersion,
  audiences: curated.audiences || {},
  assets
};

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log("Wrote " + relative(ROOT, OUT) + " with " + assets.length + " assets (" + withVersion + " with a declared version).");
