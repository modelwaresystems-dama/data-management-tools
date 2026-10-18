/* ============================================================================
 * Regression suite — modelware_partner_pack_builder.html
 *
 * Rebuilt 18 October 2026. The original suite (verify.py, escapecheck.py,
 * layoutcheck.py, flowtest.py, ghtest.py, intaketest.py) was never committed and
 * no longer exists; this replaces it, covering the same classes of bug, in one
 * runnable file driving the real app through its window.MW hook.
 *
 *     node Tests/test_partner_pack.js              control — must be clean
 *     node Tests/test_partner_pack.js --sabotage X one break — must be CAUGHT
 *     node Tests/test_partner_pack.js --all        control, then every sabotage
 *
 * Needs node, playwright and a chromium. Export validation (openpyxl,
 * python-docx, pypdf) runs only when python3 has them; it is reported as SKIPPED
 * rather than silently passing when it cannot run — an unrun check must never
 * read as a passing one.
 *
 * Every sabotage breaks one line of the shipped file in a plausible wrong way and
 * must be caught. The control run, with nothing broken, must be clean: that is
 * what exposes a harness reporting CAUGHT for everything.
 * ========================================================================== */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const HERE = __dirname;
const SRC = path.join(HERE, '..', 'modelware_partner_pack_builder.html');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ppb-'));
const CHROME = process.env.PPB_CHROME || '';

const argv = process.argv.slice(2);
const SAB = (argv.indexOf('--sabotage') >= 0) ? argv[argv.indexOf('--sabotage') + 1] : '';
const ALL = argv.includes('--all');

/* ------------------------------------------------------------------ sabotages */
const SABOTAGES = {
  'predicate':     [`function usesContentLicence(k){ return k!=="RESELLER"; }`,
                    `function usesContentLicence(k){ return true; }`],
  'gate-courses':  [`if(usesContentLicence(d.modelKey) && !ctActiveItems(d).length)`,
                    `if(true && !ctActiveItems(d).length)`],
  'gate-library':  [`if(usesContentLicence(d.modelKey) && !String(ct(d).libraryUrl||"").trim())`,
                    `if(true && !String(ct(d).libraryUrl||"").trim())`],
  'no-strip':      [`  return clearTermsNotInModel(d);\n}`, `  return [];\n}`],
  'load-no-strip': [`  LAST_MODEL_CLEARED = clearTermsNotInModel(base);`,
                    `  LAST_MODEL_CLEARED = [];`],
  'inv-norefill':  [`  if(usesInventory(base.modelKey) &&\n     (!Array.isArray(base.inventory.lines) || !base.inventory.lines.length)){`,
                    `  if(false){`],
  'docs-10-11':    [`  if(usesContentLicence(d.modelKey)){\n  b=[];\n  b.push(h1("COURSEWARE PROTECTION`,
                    `  if(true){\n  b=[];\n  b.push(h1("COURSEWARE PROTECTION`],
  'schedD1':       [`  if(d.modelKey==="RESELLER"){\n    /* The obligation runs the other way on this model.`,
                    `  if(false){\n    /* The obligation runs the other way on this model.`],
  'schedD2':       [`  if(d.modelKey==="RESELLER"){\n    /* The generic list below never names who owes the duty.`,
                    `  if(false){\n    /* The generic list below never names who owes the duty.`],
  'cert-trim':     [`  return cut.trim() || t;`, `  return t;`],
  /* Classes of bug the lost suite existed to catch. Both of these must break something
     the browser actually RENDERS — an earlier pair of these sabotages added an unused
     variable and an unused CSS class, broke nothing, and were reported as MISSED. A
     sabotage that changes no behaviour tests the harness, not the app. */
  /* The model blurbs are on screen in the left pane whatever model is selected, so a
     double-escaped character here is one the browser really renders as literal text.
     (versionLine() looked like the obvious target and is in fact dead code — breaking it
     changed nothing, which is how this sabotage first came back MISSED.) */
  'escape-leak':   [`blurb: "Strict brand alignment, centralised content IP, DAMA REP compliance. Entry tier."`,
                    `blurb: "Strict brand alignment \\\\u2014 centralised content IP, DAMA REP compliance. Entry tier."`],
  'overflow':      [`<style>`, `<style>\nbody{min-width:2600px}\n`],
  /* The repo's versioning standard. The meta tag is the only place the number may live,
     the changelog must keep up with it, and no second copy may creep back in. */
  'meta-missing':  [`<meta name="version" content="1.31.0">`, `<!-- tag removed -->`],
  'meta-typed':    [`var v = m ? String(m.content || "").trim() : "";`,
                    `var v = "1.29.2";`],
  'stray-comment': [`<meta name="version" content="1.31.0">`,
                    `<meta name="version" content="1.31.0">\n<!-- Partner Pack Builder v1.10.2 -->`],
  'no-changelog':  [`var APP_CHANGELOG = [\n  ["1.31.0"`, `var APP_CHANGELOG = [\n  ["0.0.1"`],
  /* Issued packs. */
  'issued-utf8':   [`  var body={message:message,content:bytesToB64(bytes),branch:GH.branch};`,
                    `  var body={message:message,content:strToB64(String.fromCharCode.apply(null,bytes.subarray(0,100))),branch:GH.branch};`],
  'issued-internal':[`    contractFiles("docx").forEach(function(f){ files.push(f); });`,
                    `    contractFiles("docx").forEach(function(f){ files.push(f); });\n    contractFiles("docx","internal").forEach(function(f){ files.push(f); });`],
  'issued-silent': [`    if(failed.length){`, `    if(false){`],
  'signed-flag':   [`  man.signed={received:true,`, `  man.signed={received:false,`],
  /* The panel put somewhere nothing renders — the v1.31.0 defect itself. */
  'panel-orphan':  [`function repoHtml_UNUSED(){`, `function repoHtml(){`],
  'panel-gone':    [`  h+='<div style="margin:10px 0 18px"><button class="btn" id="btnRecordIssued">Record what was issued</button></div>';`,
                    `  /* control removed */`],
  'new-partner':   [`  d.partner.legalName=o.name||"";`, `  /* leak */`],
  'merge-clobber': [`      for(j in obj[k]){ if(obj[k][j]!==undefined) base[k][j]=obj[k][j]; }`,
                    `      /* dropped */`],
};

/* ------------------------------------------------------------------ fixtures */
const RESELLER_REC = {
  schema: 'modelware-partner/1', slug: 'your-partner-technologies-sdn-bhd',
  data: {
    ref: 'MWS-PP-2026-010', slug: 'your-partner-technologies-sdn-bhd',
    status: 'Due diligence', modelKey: 'RESELLER',
    franchisor: { legalName: 'Modelware Systems (Pty) Ltd', address: 'Cape Town, South Africa',
                  repName: 'Howard Diesel', repRole: 'Managing Director',
                  email: 'howard@modelwaresystems.com', brand: 'Modelware Systems' },
    partner: { legalName: 'Your Partner Technologies Sdn. Bhd.', legalForm: 'Private company',
               regNo: '202401023226 (1569075-K)', countryOfIncorporation: 'Malaysia',
               address: 'Kuala Lumpur, Malaysia', repName: 'Agha M', repRole: 'Director',
               email: 'mustafaqiz@yourpartnertechnologies.com' },
    territory: { countries: ['Malaysia'], exclusivity: 'Non-exclusive', subLicence: false,
                 channels: 'Public training, in-house corporate training, advisory services' },
    term: { agreementDate: '2026-10-18', commencementDate: '2026-11-02', termYears: 2,
            renewYears: 2, renewalNoticeMonths: 6, terminationNoticeMonths: 3, cureDays: 30 },
    /* Carried over from when this record was an ADP. The whole point of the fixture. */
    commercial: { currency: 'USD', initialFee: 0, royaltyPct: 25, marketingPct: 2,
                  minAnnualRoyalty: 0, overridePct: 5, reportFrequency: 'Quarterly',
                  reportingDays: 15, paymentDays: 30, latePct: 2, contribFeePerDelivery: 0,
                  marketingFundUse: 'Brand-level campaigns',
                  tiers: [{ from: 250000, pct: 22 }, { from: 500000, pct: 20 }] },
    quality: { minSatisfaction: 4.5, auditsPerYear: 2, minCertifiedTrainers: 1,
               certification: 'CDMP Master level (or equivalent) for at least one nominated trainer',
               responseSLAHours: 24, contentUpdateDays: 30, piLimit: 0, plLimit: 0 },
    targets: { year1Revenue: 0, year1Courses: 10, year1Delegates: 100, ttfsDays: 90,
               breakEvenMonths: 15, year2Growth: 25 },
    inventory: { phase1Months: 12, recoverable: true, recoveryDays: 60, triggerDelegates: 8,
                 revTrigger: 0, partnerIsCdmpMaster: false, excludedRevenue: 0,
                 partnerOnboarding: 8000, partnerSystems: 3000,
                 lines: [{ key: 'cert', label: 'Training certification', qty: 1, rate: 1000, pct: 100, unit: 'fixed fee' },
                         { key: 'roy', label: 'Course royalty', qty: 0, rate: 0, pct: 25, isRoyalty: true, qtyLabel: 'delegates', unit: 'per delegate' },
                         { key: 'rep', label: 'DAMA REP', qty: 1, rate: 100, pct: 100, qtyLabel: 'years', unit: 'fixed annual fee' }] },
    reseller: { basePrice: 12000, forecastWeeks: 10, marketPrice: 1300, travelEstimate: 3200,
                tripWeeks: 3, clustered: true, travelPayDaysBefore: 14, deliveryPayDays: 14,
                paxPlan: 16, paxStepsText: '8, 10, 12, 14, 16, 20',
                weekStepsText: '2, 4, 6, 8, 10, 12, 16, 20, 24',
                deliveryBy: 'Modelware trainer', travelBasis: 'At cost, with receipts, per trip',
                deliveryInvoice: 'On completion of each course week',
                trueUp: 'Annually, on course weeks actually delivered in the contract year',
                bands: [{ from: 1, to: 4, price: 12000 }, { from: 5, to: 9, price: 11000 },
                        { from: 10, to: 19, price: 10200 }, { from: 20, to: 0, price: 9600 }] },
    content: { platform: 'Microsoft 365 (SharePoint Online), Modelware Systems tenant',
               libraryUrl: '', labelName: 'Modelware Licensed Courseware — Partner View',
               accessMode: 'Browser only — view in Office for the web', offlineDays: 1,
               reviewMonths: 6, withdrawHours: 24, supersededDays: 30, watermark: true,
               watermarkText: 'Licensed to {partner} · {ref} · not for distribution',
               teams: { hostedBy: 'Modelware Systems tenant',
                        organiser: 'A Modelware Systems account. The partner never organises.',
                        templateName: 'Modelware Course Delivery', partnerMayHost: false,
                        recording: false, transcription: false, attendeeShare: false,
                        anonymousJoin: false, lobby: 'Everyone waits in the lobby except the organiser',
                        watermark: false, noticeDays: 5 },
               items: [], trainers: [] },
    diligence: { yearEstablished: 2024, deliveryRoute: 'Modelware trainer for everything',
                 solvent: 'Yes', antiBribery: 'Yes', sanctions: 'No' },
    ops: { lms: 'Modelware LMS instance', crm: 'Modelware CRM (partner tenant)',
           playbook: 'Partner Operations Manual v1', onboardingWeeks: 8 },
    notes: ''
  }
};

/* An ADP with real licensed content, so the delivery-model path is exercised fully. */
function adpRecord() {
  const r = JSON.parse(JSON.stringify(RESELLER_REC));
  r.data.modelKey = 'ADP';
  r.data.ref = 'MWS-PP-2026-011';
  r.data.content.items = [{ code: 'CDMP-FUND', title: 'CDMP Fundamentals', version: '2.1', status: 'Active' }];
  r.data.content.trainers = [{ name: 'A Trainer', email: 'a@partner.example', certifiedTo: 'CDMP-FUND', status: 'Active' }];
  r.data.content.libraryUrl = 'https://example.sharepoint.com/sites/Partner-XY/Shared%20Documents';
  return r;
}

/* ------------------------------------------------------------------ scoring */
let pass = 0, fail = 0, skip = 0;
const check = (what, got, want) => {
  if (String(got) === String(want)) { pass++; return true; }
  fail++; console.log(`  FAIL  ${what}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
  return false;
};
const skipped = (what, why) => { skip++; console.log(`  SKIP  ${what} — ${why}`); };

function findChrome() {
  if (CHROME) return CHROME;
  const roots = ['/opt/pw-browsers'];
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    for (const d of fs.readdirSync(r)) {
      const c = path.join(r, d, 'chrome-linux', 'chrome');
      if (fs.existsSync(c)) return c;
    }
  }
  return undefined;   /* let playwright find its own */
}

async function run() {
  let src = fs.readFileSync(SRC, 'utf8');
  if (SAB) {
    const s = SABOTAGES[SAB];
    if (!s) { console.error('no such sabotage: ' + SAB); process.exit(3); }
    if (!src.includes(s[0])) { console.error(`sabotage '${SAB}' target not found — the harness is stale`); process.exit(3); }
    src = src.replace(s[0], s[1]);
    console.log('sabotage applied: ' + SAB);
  }
  const RUN = path.join(TMP, 'run.html');
  fs.writeFileSync(RUN, src);

  const browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + RUN);
  await page.waitForFunction(() => typeof window.MW !== 'undefined', { timeout: 20000 }).catch(() => {});

  // ============================================================ A. loads clean
  console.log('A. page');
  check('MW hook present', await page.evaluate(() => typeof window.MW), 'object');
  check('page errors on load', errors.length, 0);
  if (errors.length) console.log('    ' + errors.slice(0, 3).join('\n    '));
  const ver = await page.evaluate(() => MW.version());
  check('version stamped', /^\d+\.\d+\.\d+$/.test(ver.version), true);
  check('build stamped SAST', /SAST$/.test(ver.build), true);

  /* Every other place the version shows is generated from APP_VERSION, so only the
     hand-written HTML comment near the top can drift — and it did, sitting at v1.10.2
     through nineteen releases. The changelog has the same problem: a release with no
     entry has no record of what changed. */
  /* The repo's versioning standard: <meta name="version"> in the head is the single
     source of truth, the Asset Navigator's build-manifest.mjs reads it, and nothing else
     may carry the number independently. Before this, the version was typed in script and
     again in a hand-written comment — which sat at v1.10.2 through nineteen releases. */
  const meta = (src.match(/<meta\s+name=["']version["']\s+content=["']([^"']*)["']\s*\/?>/i) || [])[1];
  check('head carries a version meta tag', meta !== undefined, true);
  check('meta version is semver', /^\d+\.\d+\.\d+$/.test(meta || ''), true);
  check('APP_VERSION comes from the meta tag', ver.version, meta);
  check('APP_VERSION is not the missing-tag fallback', ver.version !== '0.0.0-unknown', true);
  /* Nothing else may declare a version of its own, or there are two sources again. */
  const strayComment = (src.slice(0, 6000).match(/<!--[^>]*?\bv\d+\.\d+\.\d+[^>]*?-->/) || [])[0];
  check('no comment declares a version of its own', strayComment === undefined, true);
  if (strayComment) console.log('    stray: ' + strayComment.slice(0, 120));
  const onScreen = await page.evaluate(() => {
    const el = document.getElementById('verChip');
    return el ? (el.textContent || '').trim() : '(no chip)';
  });
  check('version badge shows it on screen', onScreen, 'v' + ver.version);

  const logged = await page.evaluate((v) => APP_CHANGELOG.some(c => c[0] === v), ver.version);
  check('changelog has an entry for this version', logged, true);
  const newest = await page.evaluate(() => APP_CHANGELOG[0][0]);
  check('changelog newest entry is this version', newest, ver.version);

  // ============================================================ B. every model builds
  console.log('B. models');
  for (const key of Object.keys(await page.evaluate(() => MW.MODELS))) {
    errors.length = 0;
    const r = await page.evaluate((k) => {
      try {
        const d = MW.data; d.modelKey = k; applyModelDefaults(d, k); MW.data = d;
        return { ok: true, docs: MW.buildDocs().length, sheets: MW.buildWorkbook().length };
      } catch (e) { return { ok: false, err: String(e) }; }
    }, key);
    check(`${key} builds`, r.ok, true);
    if (!r.ok) { console.log('    ' + r.err); continue; }
    check(`${key} produces documents`, r.docs > 0, true);
    check(`${key} produces sheets`, r.sheets > 0, true);
    check(`${key} page errors`, errors.length, 0);
  }

  // ============================================================ C. reseller rules
  console.log('C. reseller');
  const loaded = await page.evaluate((rec) => {
    const d = mergeIntoBlank(recordToData(rec));
    return {
      modelKey: d.modelKey,
      royalty: Number(d.commercial.royaltyPct), override: Number(d.commercial.overridePct),
      tiers: (d.commercial.tiers || []).length, lines: (d.inventory.lines || []).length,
      onboarding: Number(d.inventory.partnerOnboarding), systems: Number(d.inventory.partnerSystems),
      cleared: LAST_MODEL_CLEARED.length,
      basePrice: Number(d.reseller.basePrice), bands: (d.reseller.bands || []).length,
      termYears: Number(d.term.termYears), exclusivity: d.territory.exclusivity,
      commencement: d.term.commencementDate, currency: d.commercial.currency
    };
  }, RESELLER_REC);
  check('model preserved', loaded.modelKey, 'RESELLER');
  check('royalty cleared', loaded.royalty, 0);
  check('override cleared', loaded.override, 0);
  check('tiers cleared', loaded.tiers, 0);
  check('inventory lines cleared', loaded.lines, 0);
  check('partner onboarding cleared', loaded.onboarding, 0);
  check('partner systems cleared', loaded.systems, 0);
  check('clearing is reported', loaded.cleared > 0, true);
  /* The merge-on-import rule: a strip that takes negotiated terms is worse than the bug. */
  check('base price survives', loaded.basePrice, 12000);
  check('price bands survive', loaded.bands, 4);
  check('term survives', loaded.termYears, 2);
  check('exclusivity survives', loaded.exclusivity, 'Non-exclusive');
  check('commencement survives', loaded.commencement, '2026-11-02');
  check('currency survives', loaded.currency, 'USD');

  const gates = await page.evaluate((rec) => {
    const g = packIssues(mergeIntoBlank(recordToData(rec)));
    return { err: g.filter(x => x.k === 'err').map(x => x.t), warn: g.filter(x => x.k === 'warn').map(x => x.t) };
  }, RESELLER_REC);
  check('nothing blocks the reseller pack', gates.err.length, 0);
  if (gates.err.length) console.log('    blocking: ' + gates.err.join(' | '));
  check('no courseware warning', gates.warn.includes('No partner library address'), false);
  check('no trainers warning', gates.warn.includes('No named trainers'), false);

  const rdocs = await page.evaluate((rec) => {
    const d = mergeIntoBlank(recordToData(rec));
    const built = buildDocs(d);
    const j = (id) => JSON.stringify(built.find(x => x.id === id));
    return { ids: built.map(x => x.id), count: built.length, schedD: j('SCH-D'), schedF: j('SCH-F') };
  }, RESELLER_REC);
  check('no onboarding checklist', rdocs.ids.includes('ONBOARD-CP'), false);
  check('no withdrawal runbook', rdocs.ids.includes('RUNBOOK'), false);
  check('agreement built', rdocs.ids.includes('AGREEMENT'), true);
  check('schedule F built', rdocs.ids.includes('SCH-F'), true);
  check('nine documents', rdocs.count, 9);
  check('D1 is our warranty', /warranty given by the/.test(rdocs.schedD), true);
  check('D1 drops the partner minimum', /Not fewer than .* at all times/.test(rdocs.schedD), false);
  check('D1 trims the obligation phrase', /for at least one nominated trainer/.test(rdocs.schedD), false);
  check('D2 names the parties', /D2\.1 The Supplier will/.test(rdocs.schedD), true);
  check('D2 gives the reseller its own list', /D2\.2 The Reseller will/.test(rdocs.schedD), true);
  check('F2 denies facilitator access', /not granted access to the Facilitator Materials/.test(rdocs.schedF), true);

  // ============================================================ D. delivery models unchanged
  console.log('D. delivery models');
  const ADP = adpRecord();
  const adp = await page.evaluate((rec) => {
    const d = mergeIntoBlank(recordToData(rec));
    const built = buildDocs(d);
    return { ids: built.map(x => x.id), count: built.length,
             schedD: JSON.stringify(built.find(x => x.id === 'SCH-D')),
             royalty: Number(d.commercial.royaltyPct), lines: (d.inventory.lines || []).length,
             err: packIssues(d).filter(x => x.k === 'err').map(x => x.t) };
  }, ADP);
  check('ADP keeps checklist', adp.ids.includes('ONBOARD-CP'), true);
  check('ADP keeps runbook', adp.ids.includes('RUNBOOK'), true);
  check('ADP eleven documents', adp.count, 11);
  check('ADP D1 unchanged', /Not fewer than .* at all times/.test(adp.schedD), true);
  check('ADP D1 keeps the full certification text', /for at least one nominated trainer/.test(adp.schedD), true);
  check('ADP royalty preserved', adp.royalty, 25);
  check('ADP cost lines preserved', adp.lines > 0, true);
  check('ADP with content is not blocked', adp.err.length, 0);

  const adpEmpty = await page.evaluate((rec) => {
    const r = JSON.parse(JSON.stringify(rec)); r.data.content.items = [];
    return packIssues(mergeIntoBlank(recordToData(r))).filter(x => x.k === 'err').map(x => x.t);
  }, ADP);
  check('ADP without courseware IS blocked', adpEmpty.includes('No courseware licensed'), true);

  const refill = await page.evaluate(({ a, r }) => {
    const x = JSON.parse(JSON.stringify(a)); x.data.inventory.lines = [];
    const y = JSON.parse(JSON.stringify(r)); y.data.inventory.lines = [];
    return { adp: (mergeIntoBlank(recordToData(x)).inventory.lines || []).length,
             res: (mergeIntoBlank(recordToData(y)).inventory.lines || []).length };
  }, { a: ADP, r: RESELLER_REC });
  check('ADP with no cost lines is refilled', refill.adp > 0, true);
  check('reseller with no cost lines stays empty', refill.res, 0);

  // ============================================================ E. model switch
  console.log('E. model switch');
  const sw = await page.evaluate((rec) => {
    const d = mergeIntoBlank(recordToData(rec));
    d.modelKey = 'ADP'; applyModelDefaults(d, 'ADP');
    const before = { royalty: Number(d.commercial.royaltyPct), lines: (d.inventory.lines || []).length };
    d.commercial.overridePct = 5;
    d.modelKey = 'RESELLER';
    const cleared = applyModelDefaults(d, 'RESELLER') || [];
    return { before, royalty: Number(d.commercial.royaltyPct), override: Number(d.commercial.overridePct),
             tiers: (d.commercial.tiers || []).length, lines: (d.inventory.lines || []).length,
             cleared: cleared.length };
  }, RESELLER_REC);
  check('ADP switch sets a royalty', sw.before.royalty, 25);
  check('ADP switch seeds cost lines', sw.before.lines > 0, true);
  check('switch clears royalty', sw.royalty, 0);
  check('switch clears override', sw.override, 0);
  check('switch clears tiers', sw.tiers, 0);
  check('switch clears cost lines', sw.lines, 0);
  check('switch reports what it cleared', sw.cleared > 0, true);

  // ============================================================ F. new partner leakage
  console.log('F. new partner');
  const np = await page.evaluate(() => {
    MW.data = MW.demo();                       /* load the example first — this is the trap */
    MW.newPartner({ name: 'Clean Co', countries: 'Kenya' });
    const d = MW.data;
    return { name: d.partner.legalName, address: d.partner.address, email: d.partner.email,
             notes: d.notes, items: (d.content.items || []).length };
  });
  check('new partner takes the name', np.name, 'Clean Co');
  check('new partner has no address', String(np.address || ''), '');
  check('new partner has no email', String(np.email || ''), '');
  check('new partner has no notes', String(np.notes || ''), '');
  check('new partner has no courseware', np.items, 0);

  // ============================================================ G. merge keeps negotiation
  console.log('G. merge on import');
  const merged = await page.evaluate((rec) => {
    const r = JSON.parse(JSON.stringify(rec));
    r.data.modelKey = 'ADP';
    r.data.commercial.royaltyPct = 18;         /* a negotiated rate, not a default */
    r.data.content.items = [{ code: 'X', title: 'X', status: 'Active' }];
    const d = mergeIntoBlank(recordToData(r));
    return { royalty: Number(d.commercial.royaltyPct), model: d.modelKey };
  }, RESELLER_REC);
  check('negotiated 18% survives import', merged.royalty, 18);
  check('model survives import', merged.model, 'ADP');

  // ============================================================ H. questionnaire
  console.log('H. questionnaire');
  const intake = await page.evaluate(() => {
    const out = {};
    for (const k of Object.keys(MW.MODELS)) {
      const d = MW.data; d.modelKey = k; applyModelDefaults(d, k);
      d.partner.legalName = 'Q Co'; MW.data = d;
      const h = MW.intakeHtml();
      out[k] = { bytes: h.length, states: /ISSUED/.test(h), model: h.indexOf(MW.MODELS[k].name) >= 0 };
    }
    return out;
  });
  for (const k of Object.keys(intake)) {
    check(`${k} questionnaire builds`, intake[k].bytes > 5000, true);
    check(`${k} questionnaire carries the issued block`, intake[k].states, true);
    check(`${k} questionnaire names the model`, intake[k].model, true);
  }
  const distinct = new Set(Object.values(intake).map(x => x.bytes));
  check('questionnaires differ by model', distinct.size > 1, true);

  // ============================================================ I. escaped text
  console.log('I. rendered text');
  const leaked = await page.evaluate(() => {
    const seen = [];
    for (const k of Object.keys(MW.MODELS)) {
      const d = MW.data; d.modelKey = k; applyModelDefaults(d, k); MW.data = d;
      for (const t of ['WB', 'AGREEMENT']) {
        MW.tab(t);
        const txt = document.body.innerText || '';
        const hits = txt.match(/\\u[0-9a-fA-F]{4}|\\n(?![a-z])|\\"/g);
        if (hits) seen.push(k + '/' + t + ': ' + hits.slice(0, 3).join(' '));
      }
    }
    /* the documents themselves, not just the screen */
    const j = JSON.stringify(MW.buildDocs());
    const dh = j.match(/\\\\u[0-9a-fA-F]{4}/g);
    if (dh) seen.push('documents: ' + dh.slice(0, 3).join(' '));
    return seen;
  });
  check('no escape sequences rendered', leaked.length, 0);
  if (leaked.length) console.log('    ' + leaked.join('\n    '));

  // ============================================================ J. layout
  console.log('J. layout');
  for (const w of [1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width: w, height: 900 });
    let worst = 0, where = '';
    for (const k of ['ADP', 'MASTER', 'RESELLER']) {
      await page.evaluate((kk) => { const d = MW.data; d.modelKey = kk; applyModelDefaults(d, kk); MW.data = d; }, k);
      for (const t of ['WB', 'AGREEMENT', 'PIPE']) {
        const over = await page.evaluate((tt) => {
          try { MW.tab(tt); } catch (e) { /* tab may not exist */ }
          return document.documentElement.scrollWidth - document.documentElement.clientWidth;
        }, t);
        if (over > worst) { worst = over; where = k + '/' + t; }
      }
    }
    check(`no horizontal overflow at ${w}px`, worst <= 1, true);
    if (worst > 1) console.log(`    worst ${worst}px at ${where}`);
  }

  // ============================================================ K. left alignment
  /* Howard's standing rule, with no exceptions: every value is left-aligned. */
  console.log('K. alignment');
  await page.setViewportSize({ width: 1440, height: 1000 });
  const rightAligned = await page.evaluate(() => {
    const bad = [];
    for (const k of ['ADP', 'RESELLER']) {
      const d = MW.data; d.modelKey = k; applyModelDefaults(d, k); MW.data = d;
      MW.tab('WB');
      document.querySelectorAll('td,th').forEach(el => {
        const a = getComputedStyle(el).textAlign;
        if (a === 'right' || a === 'end' || a === 'center') {
          bad.push(k + ': ' + a + ' — ' + (el.textContent || '').trim().slice(0, 30));
        }
      });
    }
    return bad.slice(0, 6);
  });
  check('no centre or right aligned cells', rightAligned.length, 0);
  if (rightAligned.length) console.log('    ' + rightAligned.join('\n    '));

  // ============================================================ L. exports open
  console.log('L. exports');
  const haveLibs = (() => {
    try { execFileSync('python3', ['-I', '-c', 'import openpyxl,docx,pypdf']); return true; }
    catch (e) { return false; }
  })();
  if (!haveLibs) {
    skipped('exports open in openpyxl / python-docx / pypdf', 'python3 lacks openpyxl, python-docx or pypdf');
  } else {
    await page.evaluate((rec) => { MW.data = mergeIntoBlank(recordToData(rec)); }, RESELLER_REC);
    const files = await page.evaluate(() => {
      const b64 = (u8) => { let s = ''; const a = new Uint8Array(u8); for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); };
      const docs = MW.buildDocs();
      return { xlsx: b64(MW.xlsxBytes()), docx: b64(MW.docxBytes(0)), pdf: b64(MW.pdfBytes(0)),
               zip: b64(MW.zipBytes()), docCount: docs.length };
    });
    for (const [name, data] of Object.entries(files)) {
      if (name === 'docCount') continue;
      fs.writeFileSync(path.join(TMP, 'out.' + name), Buffer.from(data, 'base64'));
    }
    const py = `
import sys, zipfile
import openpyxl, docx, pypdf
t = sys.argv[1]
wb = openpyxl.load_workbook(t + '/out.xlsx'); assert len(wb.sheetnames) > 0, 'no sheets'
d = docx.Document(t + '/out.docx'); assert len(d.paragraphs) > 5, 'docx too short'
r = pypdf.PdfReader(t + '/out.pdf'); assert len(r.pages) > 0, 'pdf has no pages'
z = zipfile.ZipFile(t + '/out.zip'); names = z.namelist()
assert any(n.endswith('.xlsx') for n in names), 'zip has no workbook'
assert sum(1 for n in names if n.endswith('.docx')) >= 9, 'zip docx count ' + str(sum(1 for n in names if n.endswith('.docx')))
assert sum(1 for n in names if n.endswith('.pdf')) >= 9, 'zip pdf count'
bad = z.testzip(); assert bad is None, 'corrupt member ' + str(bad)
print('OK', len(wb.sheetnames), len(d.paragraphs), len(r.pages), len(names))
`;
    fs.writeFileSync(path.join(TMP, 'chk.py'), py);
    try {
      const out = execFileSync('python3', ['-I', path.join(TMP, 'chk.py'), TMP], { encoding: 'utf8' });
      check('exports open in openpyxl / python-docx / pypdf', out.startsWith('OK'), true);
      console.log('    ' + out.trim());
    } catch (e) {
      check('exports open in openpyxl / python-docx / pypdf', 'threw: ' + String(e.stderr || e).slice(-300), true);
    }
  }

  // ============================================================ M. github sync, mocked
  /* The container proxies api.github.com through a gateway, so the real round trip
     cannot be tested here — only against this mock. Say so when handing over. */
  console.log('M. github sync (mock)');
  await page.route('**/__mockgh/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    const m = /__mockgh\/repos\/[^/]+\/[^/]+\/contents\/(.*)$/.exec(url.split('?')[0]);
    const p = m ? decodeURIComponent(m[1]) : '';
    const store = global.__ghStore || (global.__ghStore = {});
    if (method === 'GET') {
      /* An exact file wins; otherwise behave like the Contents API and return a directory
         listing for any prefix that has children, with type "dir" for sub-paths and
         "file" for direct children. The first version of this mock only listed the root
         and partners/, so a feature that lists its own subfolder could not be tested at
         all — the check failed and looked like an app bug. */
      if (store[p]) {
        return route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ content: store[p].content, sha: store[p].sha, path: p }) });
      }
      const prefix = p === '' ? '' : p.replace(/\/+$/, '') + '/';
      const seen = new Map();
      for (const k of Object.keys(store)) {
        if (prefix && k.indexOf(prefix) !== 0) continue;
        const rest = k.slice(prefix.length);
        if (!rest) continue;
        const cut = rest.indexOf('/');
        const name = cut < 0 ? rest : rest.slice(0, cut);
        const full = prefix + name;
        if (!seen.has(name)) {
          seen.set(name, cut < 0
            ? { name, path: full, sha: store[k].sha, type: 'file' }
            : { name, path: full, sha: '', type: 'dir' });
        }
      }
      if (!seen.size) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"message":"Not Found"}' });
      return route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify(Array.from(seen.values())) });
    }
    if (method === 'PUT') {
      /* Injected failure, so the "a pack with a failed write is INCOMPLETE" path can be
         exercised. Without it that branch never runs against the mock and a sabotage
         that silences it goes undetected. */
      if (global.__ghFailOn && global.__ghFailOn.test(p)) {
        return route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"injected failure"}' });
      }
      const body = JSON.parse(route.request().postData() || '{}');
      if (store[p] && body.sha && body.sha !== store[p].sha) {
        return route.fulfill({ status: 409, contentType: 'application/json', body: '{"message":"sha mismatch"}' });
      }
      store[p] = { content: body.content, sha: 'sha' + (Math.random().toString(16).slice(2)) };
      return route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ content: { path: p, sha: store[p].sha } }) });
    }
    return route.fulfill({ status: 405, body: '' });
  });
  const ghOk = await page.evaluate(() => {
    try { MW.setApi('https://api.github.com/__mockgh'); return typeof MW.ghSave === 'function'; }
    catch (e) { return false; }
  });
  if (!ghOk) skipped('github sync round trip', 'MW.setApi / MW.ghSave not reachable');
  else {
    const r404 = await page.evaluate(async () => {
      try { const x = await ghGetFile('partners/nope.json'); return { ok: x.ok, status: x.status || 0 }; }
      catch (e) { return { ok: false, status: -1 }; }
    });
    check('missing file reports not-found, does not throw', r404.ok, false);
  }

  // ============================================================ N. issued packs
  /* Against the same mock. Everything written goes through ghPutBytes/ghPutFile, so the
     store below is what the repository would actually contain. */
  console.log('N. issued packs');
  const issued = await page.evaluate(async (rec) => {
    MW.setApi('https://api.github.com/__mockgh');
    GH.connected = true; GH.owner = 'o'; GH.repo = 'r'; GH.branch = 'main'; GH.token = 't';
    GH.login = 'tester';
    MW.data = mergeIntoBlank(recordToData(rec));
    const dir = MW.issuedDir();
    await MW.recordIssued();
    return { dir, status: GH.status, kind: GH.statusKind };
  }, RESELLER_REC);

  const store = global.__ghStore || {};
  const written = Object.keys(store);
  const inDir = written.filter(p => p.indexOf('/issued/') >= 0);
  check('issued pack wrote files', inDir.length > 0, true);
  check('path is partners/<slug>/issued/...',
        /partners\/your-partner-technologies-sdn-bhd\/issued\/MWS-PP-2026-010_\d{4}-\d{2}-\d{2}_v\d+\.\d+\.\d+\//.test(inDir[0] || ''), true);
  check('a manifest was written', inDir.some(p => /\/manifest\.json$/.test(p)), true);
  check('nine docx issued', inDir.filter(p => /\.docx$/.test(p)).length, 9);
  check('nine pdf issued', inDir.filter(p => /\.pdf$/.test(p)).length, 9);
  check('workbook issued', inDir.filter(p => /\.xlsx$/.test(p)).length, 1);
  /* Internal documents are ours. A pack claiming to be what the partner received must
     not contain the runbook or the provisioning checklist. */
  check('no runbook in the issued pack', inDir.some(p => /Runbook/i.test(p)), false);
  check('no onboarding checklist in the issued pack', inDir.some(p => /Onboarding Checklist/i.test(p)), false);

  /* Read a stored file's leading bytes, reporting a miss as a failure rather than
     throwing. A broken build legitimately writes nothing, and the harness dying on the
     first absent file hides every check after it. */
  const head = (what, re, n, want) => {
    const p = inDir.filter(x => re.test(x))[0];
    if (!p || !store[p]) { fail++; console.log(`  FAIL  ${what}: no such file was written`); return; }
    check(what, Buffer.from(store[p].content, 'base64').slice(0, n).toString('latin1'), want);
  };
  /* The documents must survive the round trip as bytes. A docx is a zip: PK\x03\x04.
     The magic bytes alone are NOT enough: every byte below 0x80 survives a UTF-8 text
     encode unchanged, so a document mangled or truncated by the wrong encoder still
     starts "PK\x03\x04". A sabotage that encoded the first 100 bytes as text passed this
     check until the length comparison below was added. */
  head('docx round-trips as bytes, not text', /\.docx$/, 4, 'PK\u0003\u0004');
  head('pdf round-trips as bytes', /\.pdf$/, 5, '%PDF-');
  head('xlsx round-trips as bytes', /\.xlsx$/, 2, 'PK');

  const manPath = inDir.filter(p => /\/manifest\.json$/.test(p))[0];
  let man = null;
  if (manPath && store[manPath]) {
    try { man = JSON.parse(Buffer.from(store[manPath].content, 'base64').toString('utf8')); }
    catch (e) { man = null; }
  }
  if (!man) {
    fail++; console.log('  FAIL  manifest could not be read back');
  } else {
    check('manifest names the reference', man.ref, 'MWS-PP-2026-010');
    check('manifest names the model', man.modelKey, 'RESELLER');
    check('manifest records the builder version', man.builder.version, ver.version);
    check('manifest records the build stamp', man.builder.build, ver.build);
    check('manifest lists every file', man.files.length, 19);
    check('manifest records who issued it', man.issuedBy && man.issuedBy.length > 0, true);
    check('manifest starts with no signed copy', man.signed.received, false);
    check('manifest reports nothing failed', (man.failed || []).length, 0);
    /* Every file in the repo must be exactly as long as the manifest says. This is what
       catches a document written through the wrong encoder, which the magic-byte check
       above cannot see. */
    let wrongLen = [];
    for (const f of man.files) {
      const rec = store[man.path + '/' + f.name];
      if (!rec) { wrongLen.push(f.name + ': missing'); continue; }
      const got = Buffer.from(rec.content, 'base64').length;
      if (got !== f.bytes) wrongLen.push(f.name + ': ' + got + ' vs ' + f.bytes);
    }
    check('every stored file is the length the manifest records', wrongLen.length, 0);
    if (wrongLen.length) console.log('    ' + wrongLen.slice(0, 3).join('\n    '));
  }
  check('status line says it was recorded', /recorded/i.test(issued.status), true);

  /* IT MUST BE ON THE SCREEN. The whole feature was first written into repoHtml(), which
     has been unreferenced since v1.17.0 — so every check above passed while the panel
     rendered nowhere, because they drive the app through window.MW rather than the UI.
     Reach it the way Howard does: switch to the tab and look for the control. */
  const ui = await page.evaluate(async () => {
    MW.tab('SYNC');
    const btn = document.getElementById('btnRecordIssued');
    /* Match case-insensitively: h2.sec is uppercased by CSS and innerText returns the
       TRANSFORMED text, so a case-sensitive test against "Issued packs" fails on a
       heading that is rendering perfectly well. Measure the box too — present in the
       DOM is not the same as drawn on the screen, which is the whole point here. */
    const body = document.body.innerText || '';
    const h = Array.from(document.querySelectorAll('h2.sec'))
      .filter(x => /issued packs/i.test(x.textContent || ''))[0];
    const r = h ? h.getBoundingClientRect() : null;
    const br = btn ? btn.getBoundingClientRect() : null;
    return { button: !!btn, heading: /issued packs/i.test(body),
             label: btn ? (btn.textContent || '').trim() : '',
             drawn: !!(r && r.width > 0 && r.height > 0 && h.offsetParent !== null),
             btnDrawn: !!(br && br.width > 0 && br.height > 0 && btn.offsetParent !== null) };
  });
  check('the Record control is on the Team sync tab', ui.button, true);
  check('the issued packs heading renders', ui.heading, true);
  check('the heading is actually drawn, not just in the DOM', ui.drawn, true);
  check('the Record control is actually drawn', ui.btnDrawn, true);
  check('the control is labelled', ui.label, 'Record what was issued');
  /* And no panel may be built by a function nothing calls. */
  const orphan = /function\s+(repoHtml)\s*\(/.test(src);
  check('no live-looking orphan named repoHtml', orphan, false);

  /* The signed copy: the app records that it exists, it does not upload it. */
  await page.evaluate(() => MW.refreshIssued());
  const sg = await page.evaluate(async () => {
    const list = MW.issued();
    if (!list.length) return { err: 'no packs listed' };
    await MW.recordSigned(list[0].path, list[0].sha,
      { fileName: 'MWS-PP-2026-010 countersigned.pdf', signedOn: '2026-11-02', signatory: 'Agha M' });
    return { path: list[0].path, status: GH.status };
  });
  check('issued packs are listed back from the repo', !sg.err, true);
  const man2rec = !sg.err && store[sg.path + '/manifest.json'];
  if (!man2rec) {
    if (!sg.err) { fail++; console.log('  FAIL  signed-copy manifest could not be read back'); }
  } else {
    const man2 = JSON.parse(Buffer.from(man2rec.content, 'base64').toString('utf8'));
    check('signed copy is recorded', man2.signed.received, true);
    check('signed file name is recorded', man2.signed.fileName, 'MWS-PP-2026-010 countersigned.pdf');
    check('signed date is recorded', man2.signed.signedOn, '2026-11-02');
    check('signatory is recorded', man2.signed.signatory, 'Agha M');
    check('the pack itself is unchanged', man2.files.length, 19);
    /* The executed document is filed by hand — the app must not have written one. */
    const after = Object.keys(global.__ghStore || {}).filter(p => p.indexOf('/issued/') >= 0);
    check('no signed document was uploaded', after.some(p => /countersigned/i.test(p)), false);
  }

  /* The partner listing must be unaffected by the new subfolders. */
  const listed = await page.evaluate(async () => {
    await ghRefresh(true);
    return GH.files.map(f => f.slug);
  });
  check('issued subfolders do not appear as partners', listed.some(s => /issued/.test(s)), false);

  /* A DELIVERY model has internal documents. They are ours and were never issued, so
     they must not be in the pack — which is only testable on a model that has them. */
  const adpIssued = await page.evaluate(async (rec) => {
    MW.data = mergeIntoBlank(recordToData(rec));
    await MW.recordIssued();
    return { dir: MW.issuedDir(), status: GH.status };
  }, ADP);
  /* Filter by the ADP's own reference, not its slug — adpRecord() is built from the
     reseller fixture and shares its slug, so a slug filter picks up both packs and the
     docx count came back as 18. */
  const adpFiles = Object.keys(global.__ghStore || {}).filter(p => p.indexOf('/MWS-PP-2026-011_') >= 0);
  check('ADP pack was written', adpFiles.length > 0, true);
  check('ADP pack excludes the runbook', adpFiles.some(p => /Runbook/i.test(p)), false);
  check('ADP pack excludes the onboarding checklist', adpFiles.some(p => /Onboarding Checklist/i.test(p)), false);
  check('ADP pack has nine issued docx, not eleven', adpFiles.filter(p => /\.docx$/.test(p)).length, 9);

  /* A pack where a write failed must say so. Reporting only the successes makes an
     incomplete pack read as a sent one. */
  console.log('O. a failed write');
  global.__ghFailOn = /Schedule A.*\.pdf$/;
  const broke = await page.evaluate(async (rec) => {
    const r = JSON.parse(JSON.stringify(rec));
    r.data.ref = 'MWS-PP-2026-099';
    MW.data = mergeIntoBlank(recordToData(r));
    await MW.recordIssued();
    return { dir: MW.issuedDir(), status: GH.status, kind: GH.statusKind };
  }, RESELLER_REC);
  global.__ghFailOn = null;
  check('a failed write is reported as a failure', broke.kind, 'err');
  check('the status says the pack is incomplete', /incomplete/i.test(broke.status), true);
  if (!/incomplete/i.test(broke.status)) console.log('    status: ' + broke.status);
  const brokeMan = Object.keys(global.__ghStore || {}).filter(p => p.indexOf('MWS-PP-2026-099') >= 0 && /manifest\.json$/.test(p))[0];
  if (!brokeMan) { fail++; console.log('  FAIL  no manifest written for the incomplete pack'); }
  else {
    const bm = JSON.parse(Buffer.from(global.__ghStore[brokeMan].content, 'base64').toString('utf8'));
    check('the manifest names what failed', (bm.failed || []).length > 0, true);
    check('the manifest does not claim every file was written', bm.written < bm.files.length, true);
  }

  await browser.close();
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) {}

  console.log('');
  console.log(`passed ${pass}, failed ${fail}${skip ? ', skipped ' + skip : ''}`);
  if (SAB) {
    if (fail > 0) { console.log('CAUGHT  ' + SAB); return 0; }
    console.log('MISSED  ' + SAB + ' — the suite does not detect this break'); return 2;
  }
  if (fail > 0) { console.log('CONTROL RUN FAILED'); return 1; }
  if (skip) console.log('Note: ' + skip + ' check(s) skipped — not the same as passing.');
  console.log('CONTROL RUN CLEAN'); return 0;
}

if (ALL) {
  const { spawnSync } = require('child_process');
  const names = Object.keys(SABOTAGES);
  let bad = 0;
  console.log('CONTROL (no sabotage)');
  let r = spawnSync(process.execPath, [__filename], { stdio: 'inherit' });
  if (r.status !== 0) bad++;
  for (const n of names) {
    console.log('\nSABOTAGE ' + n);
    r = spawnSync(process.execPath, [__filename, '--sabotage', n], { stdio: 'inherit' });
    if (r.status !== 0) bad++;
  }
  console.log('');
  if (bad) { console.log(bad + ' run(s) did not do what they should. The suite is NOT trustworthy.'); process.exit(1); }
  console.log('Control clean and all ' + names.length + ' sabotages caught.');
  process.exit(0);
} else {
  run().then(c => process.exit(c)).catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(3); });
}
