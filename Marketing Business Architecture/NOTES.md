# Nedbank Marketing Data & AI — Project Notes (parallel-task handoff)

_Last updated: 2026-08-03 14:12 SAST · Live pack version: **v1.7.2**_

This is the single brief a fresh Cowork session should read before doing any work on this
project. It captures the project, where the **shared content lives (the Excel model etc.)**,
how the pack is built/verified/deployed, and **5 independent tasks you can run in parallel**
without stepping on each other.

---

## 0 · How to use this file (READ FIRST)

1. **Get the content.** Clone the repo (below). All shared content — the 97‑sheet Excel model,
   the derived JSON, and the whole live pack — is in it. Nothing else is needed to start.
2. **Work on your OWN branch.** If several tasks run at once, each MUST use its own git branch
   `task/NN-slug` and open a PR. **Do not all push to `main`** — you will collide. The human
   integrator merges the branches (the only shared touch‑points are tiny append‑only blocks in
   `assets/data.js` and `index.html`; keep yours at the end of the file so merges stay trivial).
3. **Don't bump the global version or edit existing lines** in shared files. Add new files and
   append‑only blocks. The integrator bumps `version` / `changelog` once, after merging.
4. **Never commit a token.** Pushing uses a fine‑grained GitHub PAT the human supplies at runtime
   (see §5). It is not stored anywhere in the repo.

---

## 1 · What this project is

An interactive, **self‑contained static HTML "pack"** (no server, no build step, works offline
from a folder) that presents Nedbank Marketing's **Data & AI Business Architecture** as a
navigable, parallel‑mapped model (BIZBOK/TOGAF aligned). It is deployed via **GitHub Pages** from
the folder `Marketing Business Architecture/` of the repo below.

- **Repo:** `https://github.com/modelwaresystems-dama/data-management-tools`
- **Pack folder (deployed):** `Marketing Business Architecture/`
- **Spec source of truth:** `Marketing Business Architecture/model/Nedbank_FutureState_Model_Enhanced.xlsx`
  (97 sheets; the model the app renders is derived from this).

Clone it:
```bash
git clone https://github.com/modelwaresystems-dama/data-management-tools.git
cd data-management-tools/"Marketing Business Architecture"
```

---

## 2 · Where the shared content lives

Everything a task needs is in the repo:

| Path | What it is |
|---|---|
| `model/Nedbank_FutureState_Model_Enhanced.xlsx` | **Canonical 97‑sheet model** (masters 1‑20, mappings 21‑37, EndToEnd 38, ElementRegistry 39, implementation‑control extension 40‑97). The source of truth for all content. |
| `model/Nedbank_NewGenericContent_intake.xlsx` | The "new generic content" intake workbook (gaps highlighted). |
| `model/full.json` | Base model extracted to JSON (stakeholders, VPs, journeys, capabilities, processes, decisions, AI use‑cases, agents, semantic models, CDP services, data products, domains, HITL). |
| `model/futurestate_appdata.json` | The future‑state data the app already uses (personas, valueStreams, valueStages, businessOutcomes, kpiDetail, cxJourneys, ownershipRoles, journeyMeta, journeyStage→valueStage). |
| `model/gov_appdata.json` | Ownership + governance data (boGovernance, governanceCouncils, raci, policyDomains, policies, controls, riskRegister). |
| `assets/*` | The live pack (see §4). `data.js` already carries the future‑state data app‑wide. |
| `*.html` | The 15 pages (see §4). |

To pull any sheet fresh from the Excel (Python, preinstalled `openpyxl`):
```python
import openpyxl
wb = openpyxl.load_workbook("model/Nedbank_FutureState_Model_Enhanced.xlsx")
ws = wb["46 · UseCasePortfolio"]                 # tabs are "NN · Name"
hdr = [c.value for c in ws[4]]                    # header row is row 4; data from row 5
rows = [dict(zip(hdr,[c.value for c in r])) for r in ws.iter_rows(min_row=5) if r[0].value]
```

---

## 3 · The model — parallel‑mapped hierarchy (BIZBOK/TOGAF)

Value Stream and Customer Journey are **separate first‑class domains** joined by mapping tables
(not a single parent‑child chain), cross‑mapped to Capabilities.

```
Stakeholder / Persona
  → Value Proposition
      → Business Outcome → KPI        (measurement branch)
      → Value Stream → Value Stage    (delivery branch)
            ↔ Customer Relationship Journey / Journey Stage
            ↔ Customer Experience Journey
            ↔ Business Capability
  → Business Process → Step → Decision Model (+ Human‑in‑the‑Loop)
  → AI Use‑Case → AI Agent → {Data Product → Data Domain · Semantic Model · HITL}
  → CDP Service supplies the data
  (Ownership Roles are accountable across all of the above; Policy → Control → Evidence governs it)
```

**Cardinality rules (enforced & FK‑verified):** every Stakeholder has a Value Proposition; every VP
is realised by a Value Stream; every Value Stream has a Customer Journey + enabling Capabilities;
every Value/Journey Stage has a KPI that rolls up to the VP.

**Key ID sets:** SH01‑11, VP01‑11, BO01‑05, EVM01‑06, K01‑44 (K41=CLV), ROLE‑{CMO,CXO,JRN,CDO,
CDP‑PO,DPO,RAI,FIN‑CLV}, VS01‑11, value stages `VS01‑01…`, C1‑17, P1‑8/PX1‑8, D1‑10/DX1‑8,
U01‑18, AG01‑09, SM1‑7, CDP1‑8, DP01‑17, DM1‑9. Extension IDs (40‑97) follow the doc conventions
(POL‑AI‑001, CTL‑AI‑001, EM‑FAIR‑001, AIRA‑U01, …).

---

## 4 · The live pack — how it works

**Shared assets (`assets/`):**
- `data.js` — the whole content model. `window.GENERIC` (all data) + `window.PACK_CONFIG`
  (version, pages, chain, sources, scales). Base arrays first, then append blocks:
  **v8/v9** = future‑state data (personas, valueStreams, valueStages, businessOutcomes, kpiDetail,
  kpiByName, cxJourneys, ownershipRoles, journeyMeta, journeyStageValueStage, vpOutcomes, agentStep);
  **v10** = governance (boGovernance, governanceCouncils, raci, policyDomains, policies, controls,
  riskRegister) + page registration. `PACK_CONFIG.chain` (the 13‑step navigator chain) is set at the
  very end of `data.js`.
- `pack.js` — the `window.PACK` namespace: source management + **import‑as‑live‑source**
  (`PACK.data()`, `PACK.setImportedModel`), lookup `PACK.MAP`, chip/deep‑link builders, sign‑off,
  sliding panel, nav + breadcrumb (`PACK.renderBreadcrumb`, `PACK.chainLabelFor`, `PACK.navUrl`,
  `PACK.ctx()`/chain context in localStorage `nbpack.chain`), value‑stream heat, SIPOC, decision
  table, data‑product/contract panels, `PACK.footer()`.
- `pack.css` — all styling (append‑only override blocks at the end; latest is v11 breadcrumb).
- `model_io.js` + `xlsx.full.min.js` — the Model Export/Import engine (one sheet per level).
- `d3.min.js` + `d3-sankey.min.js` — the Navigation Graph's Value‑Flow (Sankey) view.

**Pages (15):** `index.html` (landing/directory), `architecture_navigator.html` (13‑step guided walk),
`navigation_graph.html` (expandable tree **+ Value‑Flow Sankey**), `business_architecture.html`,
`customer_journey.html` (future‑state: persona/value‑stream/CX/outcomes), `business_process.html`,
`decisions.html`, `hyperpersonalisation_cdp.html`, `data_products.html`, `ai_usecases.html`,
`training_adoption.html`, `value_streams.html` (**Ownership & Governance**), `governance_responsible_ai.html`,
`model_export_import.html`, `glossary_settings.html`.

**Every page** follows the same skeleton: `<div id="nav">` + `<div id="breadcrumb">` + content,
then `<script src="assets/data.js">`, `<script src="assets/pack.js">`, then a page script that calls
`PACK.renderNav("<file>")`, `PACK.renderBreadcrumb(...)`, reads `var D = PACK.data()`, renders, and
ends with `document.body.insertAdjacentHTML("beforeend", PACK.footer())`.

**To add a new page (the standard recipe used for `value_streams.html`):**
1. Create `<page>.html` (copy an existing page's skeleton, e.g. `value_streams.html`).
2. If you need model data not already on `window.GENERIC`, create **your own** module
   `assets/data_<slug>.js` that does `window.GENERIC.<foo> = [...]` (extract from the Excel, mirror
   the v8/v9/v10 pattern) and include it in your page after `data.js`. **Do not edit shared `data.js`
   data blocks.**
3. Register the page: append a small self‑contained block **at the end of `assets/data.js`**:
   ```js
   /* ---- register <Nav label> page ---- */
   (function(){ var p=window.PACK_CONFIG.pages;
     if(!p.some(function(x){return x.file==="<page>.html";})){
       var i=p.findIndex(function(x){return x.file==="glossary_settings.html";});
       p.splice((i>=0?i:p.length),0,{file:"<page>.html", nav:"<Nav>", title:"<Title>"});
     }})();
   ```
   and append its landing‑directory `meta` + `icon` entries in `index.html` (the two objects near the
   bottom of its page directory script).
4. Keep it offline & self‑contained; match the existing look (reuse `.card`, `.chip`, `.tbl`, `.pill`,
   `.section`, `.grid`, etc. from `pack.css`).

---

## 5 · Build / verify / deploy workflow

**Extract data from the Excel** — Node reads `data.js` to get `window.GENERIC`; Python (`openpyxl`)
reads the workbook. See §2 snippet. Existing derivations are in `model/*.json`.

**Verify (headless, before every commit).** Serve the pack folder and drive it with Playwright
(preinstalled at `/home/claude/.npm-global/lib/node_modules/playwright`, Chromium ready). Pattern:
start a tiny `http.createServer` over the folder, `page.goto` each page, assert your content rendered,
and **collect `console`/`pageerror` — every page must report 0 errors.** (The session that built this
used files like `verify*.js`; write your own equivalent.)

**Version stamp (integrator only).** `PACK_CONFIG.version` = `vMAJOR.MINOR.PATCH`; `built` is a
**SAST** timestamp: `TZ='Africa/Johannesburg' date '+%Y-%m-%d %H:%M SAST'`. Add a `changelog` entry.

**Commit & push.** The sandbox's ambient `GITHUB_TOKEN` is read‑only and the REST API is proxy‑blocked,
so push over a **tokenized HTTPS URL** with the human‑supplied fine‑grained PAT (Contents R/W on this
repo). Do **not** hardcode it — take it from the human at runtime:
```bash
git checkout -b task/NN-slug
git add -A && git commit -m "…"
GIT_ASKPASS= GIT_TERMINAL_PROMPT=0 git -c credential.helper= \
  push "https://x-access-token:${TOK}@github.com/modelwaresystems-dama/data-management-tools.git" HEAD:task/NN-slug
git fetch origin        # pushing by URL doesn't advance the local tracking ref; fetch to reconcile
```
Open a PR for the human to merge. (Reminder to the human: rotate the PAT when the batch is done.)

---

## 6 · Conventions

- Self‑contained, offline‑capable; single‑file pages; vendor libraries into `assets/` (no CDN).
- New/authored generic content is highlighted **green** in the intake/master workbooks; derived
  content is left plain. Cross‑references must resolve (FK‑clean) — 1,478 + 286 FK checks currently pass.
- Prose over heavy formatting in any docs; SAST for all timestamps; hard‑refresh note to users
  (Cmd/Ctrl+Shift+R) after deploys because GitHub Pages caches.

---

## 7 · The 5 parallel tasks

Each is **independent** (its own new page + its own `assets/data_<slug>.js`), so five sessions can run
at once. Each: work on branch `task/NN-slug`, create the two new files, append the page registration +
landing entry (per §4), verify headless (0 console errors), push the branch, open a PR. Do **not** bump
the global version. All read the **same** `model/Nedbank_FutureState_Model_Enhanced.xlsx`.

### Task 1 — AI Portfolio (Value × Readiness)   ·  branch `task/01-ai-portfolio`
- **Page:** `ai_portfolio.html` · **Data:** `assets/data_ai_portfolio.js`
- **Sheets:** 45 EnterpriseValueMap, 46 UseCasePortfolio, 48 AI_Readiness_Assessment, 49 ReadinessDimension,
  50 UseCase_PriorityScore, 47 InvestmentCase, 51 ImplementationGate, 53 UseCase_BusinessOutcome_Map.
- **Build:** a Value × Readiness matrix (bubble/scatter of all 18 use‑cases: value score vs readiness,
  colour = roadmap bucket), a sortable portfolio table (theme, outcome, value, readiness, risk, bucket),
  a readiness radar/rubric per selected use‑case, and the Intake→Readiness→Eval→Pilot→Scale gate strip.
- **Accept:** all 18 use‑cases shown; picking one shows its readiness breakdown + gates; 0 console errors.

### Task 2 — Semantic Governance   ·  branch `task/02-semantic`
- **Page:** `semantic_model.html` · **Data:** `assets/data_semantic.js`
- **Sheets:** 16 SemanticModel, 54 LexicalInventory, 55 BusinessGlossary, 56 SPO_Definition,
  57 Taxonomy, 58 Ontology_Relationship, 59 SemanticBinding, 60 ReferenceData_CodeSet, 61 BusinessRule.
- **Build:** the 7 semantic models with their terms + relationships + data elements + KPIs; a glossary
  table (term → definition → owner/steward → status → model); SPO triples; an ontology relationship
  view (concept → relationship → target, cardinality); and semantic bindings (term → data product/field).
- **Accept:** each semantic model expands to its terms/relationships; glossary + SPO + bindings render; 0 errors.

### Task 3 — Observability & Evals   ·  branch `task/03-observability`
- **Page:** `observability.html` · **Data:** `assets/data_observability.js`
- **Sheets:** 76 EvalMetric, 77 EvalDataset, 78 EvalPlan, 79 MonitoringPlan, 80 DataQualityRule,
  81 ModelMonitoring, 82 FairnessMonitoring, 83 ExplainabilityMonitoring, 84 JourneySLO,
  85 BusinessExpectation, 86 Incident_Error_Log.
- **Build:** an eval/monitoring dashboard per AI use‑case (eval metrics + plan, monitoring thresholds,
  drift/fairness/explainability), data‑quality rules per data product, journey SLOs, and an incident log.
- **Accept:** pick a use‑case → its eval plan + monitors; DQ rules per data product listed; 0 errors.

### Task 4 — Implementation Roadmap   ·  branch `task/04-roadmap`
- **Page:** `roadmap.html` · **Data:** `assets/data_roadmap.js`
- **Sheets:** 89 Initiative, 90 Roadmap (Quick Win/Foundation/Strategic/Future waves), 91 Release,
  92 Dependency, 93 ArchitectureDecisionRecord, 95 ImplementationBacklog, 96 TraceabilityCompleteness_Check,
  94 ChangeRequest.
- **Build:** a wave/roadmap board (initiatives grouped by wave with owner + related objects), a
  dependency view, the ADR log, and the backlog with acceptance criteria.
- **Accept:** four waves render with their initiatives; dependencies + ADRs + backlog shown; 0 errors.

### Task 5 — Policy · Control · Evidence   ·  branch `task/05-controls`
- **Page:** `controls.html` · **Data:** `assets/data_controls.js`
- **Sheets:** 62 PolicyDomain, 63 Policy, 64 Standard_Control, 65 Control_Evidence_Map, 66 EvidenceRegister,
  67 GovernanceCouncil, 68 DecisionRights_RACI, 69 RiskRegister, 71 Audit_Assurance, 72 AIInventory,
  73 ModelCard, 70 RecordsRetention.
- **Build:** the Policy → Control → Evidence chain (9 policy domains drilling to policies → controls →
  evidence), the AI inventory (use‑case → agent → model card → risk tier → approval), the RACI grid, the
  risk register, and records‑retention. (This is the governance *deep‑dive*; `value_streams.html` only
  shows a summary governance layer, so no overlap in files.)
- **Accept:** policy→control→evidence traceable; AI inventory + RACI + risk render; 0 errors.

> Merge order note for the integrator: each task appended a page‑registration block at the end of
> `data.js` and a landing entry in `index.html`. Merge branches one at a time; the only conflicts (if
> any) are those end‑of‑file appends — trivial to resolve. Then bump `version` once and push to `main`.

---

## 8 · Backlog beyond the 5

- Rewire `business_architecture.html` capability map to the future‑state (capability ↔ value stage ↔
  journey stage cross‑maps, capability types).
- A KPI dictionary page (44 KPIs with definition/calculation/unit/owner/appliesTo + roll‑up weights).
- Extend the Navigation Graph Sankey with a Business‑Outcome column, or a whole‑model overview mode.
- Wire the Model Export/Import to round‑trip the 97‑sheet workbook (currently the 13‑level core).
- Nedbank Public/Private source layers (currently only the baked‑in Generic + Imported sources exist).
```
