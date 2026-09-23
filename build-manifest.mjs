#!/usr/bin/env node
/**
 * build-manifest.mjs — Modelware Asset Navigator catalog builder.
 *
 * assets.json is the master catalog, curated inside the navigator's
 * "Manage" mode (which auto-detects assets by the directory-main
 * convention: a folder's index.html is its main; folders without one
 * expose each page). This script does one job on top of that: stamp each
 * included asset with its current VERSION and write assets-manifest.json,
 * the file index.html renders from.
 *
 * Version per asset:
 *   - <meta name="version" content="..."> in the file, if present (semver);
 *   - otherwise the file's git last-commit date + short SHA (the fallback).
 *
 * Runs in CI on every push (so versions refresh automatically) and locally.
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

function metaVersion(html) {
  const m = html.match(/<meta\s+[^>]*name\s*=\s*["']version["'][^>]*content\s*=\s*["']([^"']+)["']/i)
    || html.match(/<meta\s+[^>]*content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']version["']/i);
  return m ? m[1].trim() : null;
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
for (const a of included) {
  const abs = join(ROOT, a.href);
  if (!existsSync(abs)) {
    console.warn("WARN: catalog entry has no file on disk (skipped): " + a.href);
    continue;
  }
  const html = readText(abs);
  const git = gitInfo(a.href);
  const semver = metaVersion(html);
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
    version: semver,
    gitDate: git.date,
    gitSha: git.sha,
    updated
  });
}

const manifest = {
  generatedAt: new Date().toISOString(),
  count: assets.length,
  audiences: curated.audiences || {},
  assets
};

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log("Wrote " + relative(ROOT, OUT) + " with " + assets.length + " assets.");
