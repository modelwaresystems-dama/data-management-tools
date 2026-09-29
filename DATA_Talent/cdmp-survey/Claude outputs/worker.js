/**
 * CDMP Survey write-proxy — Cloudflare Worker
 * -------------------------------------------
 * The ONE server-side piece. It holds the GitHub token (never the browser)
 * and commits each survey response to the PRIVATE data repo as one JSON file.
 *
 * It writes two things, to keep PII isolated (decision D4):
 *   - responses/<id>.json  — the answers, WITHOUT any email
 *   - contacts/<id>.json    — the email only, IF one was given
 *
 * Configuration (set in the Cloudflare dashboard / wrangler.toml):
 *   Secret : GITHUB_TOKEN    fine-grained PAT, Contents: Read+Write on the DATA repo ONLY
 *   Var    : GH_OWNER        e.g. modelwaresystems-dama
 *   Var    : GH_REPO         e.g. cdmp-survey-data   (the PRIVATE repo)
 *   Var    : GH_BRANCH       e.g. main
 *   Var    : ALLOWED_ORIGIN  e.g. https://modelwaresystems-dama.github.io  (your Pages origin)
 *   Var    : SURVEY_ID       e.g. cdmp-barriers-v1   (optional; rejects other surveys)
 *
 * Version 1.0.0
 */

const MAX_BODY = 96 * 1024; // 96 KB — a single response is a few KB; this is a generous cap

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, 405, cors);
    }
    // Origin allow-list (only enforced if ALLOWED_ORIGIN is set)
    if (env.ALLOWED_ORIGIN && origin && origin !== env.ALLOWED_ORIGIN) {
      return json({ ok: false, error: "origin_not_allowed" }, 403, cors);
    }

    // Body size guard
    const len = parseInt(request.headers.get("Content-Length") || "0", 10);
    if (len && len > MAX_BODY) {
      return json({ ok: false, error: "too_large" }, 413, cors);
    }

    let payload;
    try {
      const text = await request.text();
      if (text.length > MAX_BODY) return json({ ok: false, error: "too_large" }, 413, cors);
      payload = JSON.parse(text);
    } catch (_) {
      return json({ ok: false, error: "bad_json" }, 400, cors);
    }

    // Honeypot: a hidden field bots fill in. Pretend success, write nothing.
    if (payload && payload.hp) {
      return json({ ok: true, id: "ignored" }, 200, cors);
    }

    // Shape checks
    if (!payload || payload.schema !== 1 || typeof payload.answers !== "object" || payload.answers === null) {
      return json({ ok: false, error: "bad_shape" }, 400, cors);
    }
    if (env.SURVEY_ID && payload.survey !== env.SURVEY_ID) {
      return json({ ok: false, error: "wrong_survey" }, 400, cors);
    }

    const id = safeId(payload);
    const email = typeof payload.email === "string" && payload.email.trim() ? payload.email.trim() : null;

    // Strip email out of the stored response — PII lives in its own file
    const responseDoc = Object.assign({}, payload);
    delete responseDoc.email;
    responseDoc.storedAt = new Date().toISOString();
    responseDoc.id = id;

    // Optional subfolder inside the repo, e.g. "Data_Talent/cdmp_survey_data"
    const prefix = (env.GH_PATH_PREFIX || "").replace(/^\/+|\/+$/g, "");
    const rp = (p) => (prefix ? `${prefix}/${p}` : p);

    try {
      await putFile(env, rp(`responses/${id}.json`), responseDoc, `response ${id}`);
      if (email) {
        await putFile(env, rp(`contacts/${id}.json`),
          { id, email, respondentToken: payload.respondentToken || null, at: responseDoc.storedAt },
          `contact ${id}`);
      }
    } catch (e) {
      return json({ ok: false, error: "store_failed", detail: String(e && e.message || e) }, 502, cors);
    }

    return json({ ok: true, id }, 200, cors);
  }
};

/* ---------- helpers ---------- */

function corsHeaders(origin, env) {
  const allow = env.ALLOWED_ORIGIN || origin || "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: Object.assign({ "Content-Type": "application/json" }, cors)
  });
}

function safeId(payload) {
  // Sortable, unique, filesystem-safe: <ISO date>-<short random>
  const d = new Date();
  const stamp = d.toISOString().replace(/[:.]/g, "-");
  let rand;
  try { rand = crypto.randomUUID().slice(0, 8); }
  catch (_) { rand = Math.random().toString(16).slice(2, 10); }
  return `${stamp}-${rand}`;
}

function b64utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function putFile(env, path, obj, message) {
  const url = `https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/contents/${path}`;
  const body = {
    message: message || ("add " + path),
    content: b64utf8(JSON.stringify(obj, null, 2)),
    branch: env.GH_BRANCH || "main"
  };
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "cdmp-survey-proxy",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`github ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}
