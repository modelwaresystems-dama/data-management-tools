#!/usr/bin/env node
/**
 * build-manifest.mjs — Modelware Asset Navigator catalog builder.
 *
 * Runs in CI (GitHub Actions) on every push, and can be run locally.
 * It produces assets-manifest.json, the file index.html renders from.
 *
 * What it does:
 *   1. Reads the curated metadata in assets.json (titles, groups, audiences,
 *      icons, descriptions, tags).
 *   2. Scans the repo for HTML files that opt in with <meta name="mw-asset">.
 *      Only tagged "main" files are assets; untagged sub-pages are ignored.
 *   3. For each asset, resolves a VERSION automatically:
 *        - <meta name="version" content="..."> in the file, if present (semver);
 *        - otherwise the file's git last-commit date + short SHA (the fallback).
 *   4. Merges curated metadata with the resolved version and writes
 *      assets-manifest.json.
 *
 * This is the "automatic version refresh": every deploy re-reads git, so each
 * asset's version reflects its true last change with no manual step.
 *
 * Exit code is always 0 on a successful write; discrepancies (a curated entry
 * with no tag, or a tagged file with no curated metadata) are printed as
 * warnings so the catalog still builds.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const ASSETS_JSON = join(ROOT, "assets.json");
const OUT = join(ROOT, "assets-manifest.json");

// Directories never scanned for assets.
const SKIP_DIRS = new Set([
  ".git", ".github", ".vscode", "node_modules", "__pycache__", "assets", "model", "src",
]);

function toPosix(p) {
  return p.split(sep).join("/");
}

function walk(dir, acc) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(full, acc);
    } else if (e.isFile() && /\.html?$/i.test(e.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function readText(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function hasAssetTag(html) {
  return /<meta\s+[^>]*name\s*=\s*["']mw-asset["']/i.test(html);
}

function metaVersion(html) {
  const m = html.match(/<meta\s+[^>]*name\s*=\s*["']version["'][^>]*content\s*=\s*["']([^"']+)["']/i)
    || html.match(/<meta\s+[^>]*content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']version["']/i);
  return m ? m[1].trim() : null;
}

function pageTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  if (!m) return null;
  // Keep the meaningful part before an em-dash / pipe separator.
  return m[1].split(/\s+[—–|]\s+/)[0].trim() || m[1].trim();
}

function gitInfo(relPath) {
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%cs%x09%h", "--", relPath],
      { cwd: ROOT, encoding: "utf8" }
    ).trim();
    if (!out) return { date: "", sha: "" };
    const [date, sha] = out.split("\t");
    return { date: date || "", sha: sha || "" };
  } catch {
    return { date: "", sha: "" };
  }
}

function titleCase(value) {
  return value
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function deriveGroup(relPath) {
  const folder = relPath.split("/")[0] || "";
  return folder ? titleCase(folder) : "General";
}

// ---- load curated metadata ----
let curated = { audiences: {}, assets: [] };
try {
  curated = JSON.parse(readFileSync(ASSETS_JSON, "utf8"));
} catch (e) {
  console.warn("WARN: could not read assets.json (" + e.message + "); continuing with auto-discovery only.");
}
const curatedByHref = new Map((curated.assets || []).map((a) => [a.href, a]));
const audiences = curated.audiences || {};

// ---- discover tagged files ----
const files = walk(ROOT, []).map((f) => toPosix(relative(ROOT, f)));
const taggedHrefs = new Set();
for (const rel of files) {
  const html = readText(join(ROOT, rel));
  if (hasAssetTag(html)) taggedHrefs.add(rel);
}

// The asset set is the opt-in tagged files. Curated entries should all be
// tagged; warn about any that are not, and about tagged files with no metadata.
for (const href of curatedByHref.keys()) {
  if (!taggedHrefs.has(href)) {
    console.warn('WARN: curated asset is not tagged with <meta name="mw-asset">: ' + href);
  }
}

// Build in curated order first (stable, human-ordered), then any extra tagged
// files that have no curated entry (auto-derived).
const orderedHrefs = [];
for (const a of curated.assets || []) if (taggedHrefs.has(a.href)) orderedHrefs.push(a.href);
for (const href of taggedHrefs) if (!curatedByHref.has(href)) orderedHrefs.push(href);

const assets = [];
for (const href of orderedHrefs) {
  const abs = join(ROOT, href);
  const html = readText(abs);
  const meta = curatedByHref.get(href) || null;
  const git = gitInfo(href);
  const semver = metaVersion(html);

  let updated = git.date;
  if (!updated) {
    try { updated = new Date(statSync(abs).mtime).toISOString().slice(0, 10); } catch { updated = ""; }
  }

  if (!meta) {
    console.warn("WARN: tagged file has no curated metadata (auto-derived): " + href);
  }

  assets.push({
    href,
    title: (meta && meta.title) || pageTitle(html) || titleCase(href.split("/").pop().replace(/\.html?$/i, "")),
    group: (meta && meta.group) || deriveGroup(href),
    audience: (meta && meta.audience) || "technical",
    icon: (meta && meta.icon) || "fa-file-code",
    desc: (meta && meta.desc) || "Auto-discovered asset. Add an entry in assets.json for a description.",
    tags: (meta && meta.tags) || ["auto", href.split("/")[0] || "root"],
    version: semver,          // null when no <meta name="version">; git drives it then
    gitDate: git.date,        // YYYY-MM-DD of the last commit that touched the file
    gitSha: git.sha,          // short commit hash
    updated,                  // best-effort last-updated date
    source: meta ? "curated" : "auto"
  });
}

const manifest = {
  generatedAt: new Date().toISOString(),
  count: assets.length,
  audiences,
  assets
};

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log("Wrote " + relative(ROOT, OUT) + " with " + assets.length + " assets.");
