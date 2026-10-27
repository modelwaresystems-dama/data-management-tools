/* wb_site_graph_smoke.js — drives the EXPORTED D3 site in a real headless browser
 * to prove the v4.84 graph-navigation controls work: Fit / zoom-in / zoom-out /
 * full screen, and click-a-node-to-focus (the ego-fit that gives a simplified view).
 * These controls live inside the base64 site template, which the jsdom unit suites
 * cannot exercise. Requires playwright (pre-installed in this environment). */
const fs = require('fs');
const path = require('path');
const { loadApp } = require('./wb_common.js');

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function buildCorpus() {
  // A hub term with several neighbours, so focusing on it is visibly a subgraph.
  const terms = [
    { Term: 'Data Governance', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved', Definition: 'Hub.' },
    { Term: 'Semantic Scope', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved', Definition: 'A.' },
    { Term: 'Knowledge Area', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved', Definition: 'B.' },
    { Term: 'Data Asset', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved', Definition: 'C.' },
    { Term: 'Policy', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved', Definition: 'D.' },
    { Term: 'Far Term', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved', Definition: 'Unconnected-ish.' },
    { Term: 'Far Friend', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved', Definition: 'Connected to Far Term only.' },
  ];
  const spo = [
    { Term: 'Data Governance', Subject: 'Data Governance', Predicate: 'delimits', Object: 'Semantic Scope', 'Sign-off': 'Approved' },
    { Term: 'Data Governance', Subject: 'Data Governance', Predicate: 'organises', Object: 'Knowledge Area', 'Sign-off': 'Approved' },
    { Term: 'Data Governance', Subject: 'Data Governance', Predicate: 'governs', Object: 'Data Asset', 'Sign-off': 'Approved' },
    { Term: 'Data Governance', Subject: 'Data Governance', Predicate: 'applies', Object: 'Policy', 'Sign-off': 'Approved' },
    { Term: 'Far Term', Subject: 'Far Term', Predicate: 'knows', Object: 'Far Friend', 'Sign-off': 'Approved' },
  ];
  return terms.map((t) => ({ gId: 'g', gName: 'Smoke', areas: [], term: t, spo: spo.filter((s) => norm(s.Term) === norm(t.Term)) }));
}

(async () => {
  const app = loadApp();
  const { buildSiteHtml } = app.wb;
  if (typeof buildSiteHtml !== 'function') { console.error('  ✗ buildSiteHtml not exposed'); process.exit(1); }
  const html = buildSiteHtml(buildCorpus());
  app.cleanup();

  const out = path.join(__dirname, '_smoke_site.html');
  fs.writeFileSync(out, html);

  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch (e) { console.error('  ✗ playwright not available:', e.message); process.exit(1); }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  // v4.85: D3 is inlined into the site template (offline, single-source). Prove it by
  // BLOCKING any external D3 request — the graph must still build from the inlined copy.
  let cdnD3Hits = 0;
  await page.route(/d3(\.min)?\.js|cdnjs\.cloudflare\.com/, (route) => { cdnD3Hits++; return route.abort(); });

  let pass = 0, fail = 0;
  const ok = (c, label) => { if (c) { pass++; console.log('  ✓ ' + label); } else { fail++; console.log('  ✗ ' + label); } };

  await page.goto('file://' + out, { waitUntil: 'load' });
  // d3 comes from cdnjs; wait for it, then for the graph to build + settle.
  await page.waitForFunction(() => !!window.d3, null, { timeout: 15000 }).catch(() => {});
  ok(await page.evaluate(() => !!window.d3), 'd3 available from INLINED copy (external D3 blocked)');
  ok(cdnD3Hits === 0, 'site made no external D3 request (offline-safe) — blocked hits: ' + cdnD3Hits);
  await page.waitForFunction(() => document.querySelectorAll('#graph g.node circle').length > 0, null, { timeout: 15000 });
  await page.waitForTimeout(1500); // let the force simulation settle so nodes have x/y

  // controls exist
  for (const id of ['gFit', 'gZoomOut', 'gZoomIn', 'gFull', 'gReset']) {
    ok(await page.$('#' + id) !== null, 'control present: #' + id);
  }

  // edge predicate labels must be hidden until a term is focused
  const labelsAtRest = await page.evaluate(() => [...document.querySelectorAll('#graph text.elab')].filter(t => t.getAttribute('display') !== 'none').length);
  ok(labelsAtRest === 0, 'edge predicate labels hidden until a term is focused (' + labelsAtRest + ' shown)');
  const labelCount = await page.evaluate(() => document.querySelectorAll('#graph text.elab').length);
  ok(labelCount > 0, 'edge label elements exist for the links (' + labelCount + ')');

  const transform = () => page.evaluate(() => {
    const g = document.querySelector('#graph g'); return g ? (g.getAttribute('transform') || '') : null;
  });
  const scaleOf = (t) => { const m = /scale\(([-0-9.e]+)/.exec(t || ''); return m ? parseFloat(m[1]) : 1; };

  // zoom in increases scale
  const t0 = await transform();
  await page.click('#gZoomIn'); await page.waitForTimeout(400);
  const t1 = await transform();
  ok(scaleOf(t1) > scaleOf(t0) + 1e-6, 'Zoom in (+) increases scale (' + scaleOf(t0).toFixed(3) + ' -> ' + scaleOf(t1).toFixed(3) + ')');

  // zoom out decreases scale
  await page.click('#gZoomOut'); await page.waitForTimeout(400);
  const t2 = await transform();
  ok(scaleOf(t2) < scaleOf(t1) - 1e-6, 'Zoom out (-) decreases scale (' + scaleOf(t1).toFixed(3) + ' -> ' + scaleOf(t2).toFixed(3) + ')');

  // Fit changes the transform (pans/scales to frame all nodes)
  await page.click('#gFit'); await page.waitForTimeout(600);
  const tFit = await transform();
  ok(tFit && tFit !== t2, 'Fit re-frames the view (transform changed)');

  // click a node -> drawer opens AND the view re-frames to that ego subgraph (simplified view)
  const beforeClick = await transform();
  await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('#graph g.node')];
    const hub = nodes.find(n => (n.textContent || '').includes('Data Governance')) || nodes[0];
    hub.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await page.waitForTimeout(700);
  const drawerOn = await page.evaluate(() => document.getElementById('drawer').classList.contains('on'));
  ok(drawerOn, 'clicking a node opens the detail drawer');
  const afterClick = await transform();
  ok(afterClick && afterClick !== beforeClick, 'clicking a node re-frames the view to the term + its neighbours');
  const dimmed = await page.evaluate(() => document.querySelectorAll('#graph g.node.dim').length);
  ok(dimmed > 0, 'non-neighbour terms are dimmed on focus (' + dimmed + ' dimmed)');

  // drawer now shows narrative + the term's SPO statements (not just reference chips)
  const drawerTxt = await page.evaluate(() => document.getElementById('drawer').textContent || '');
  ok(/SPO statements/.test(drawerTxt), 'drawer shows an "SPO statements" section');
  ok(/delimits|organises|governs|applies/.test(drawerTxt), "drawer lists the term's predicates (SPO detail, not just target names)");
  // edge predicate labels appear on the focused term's edges
  const labelsOnFocus = await page.evaluate(() => [...document.querySelectorAll('#graph text.elab')].filter(t => t.getAttribute('display') !== 'none').length);
  ok(labelsOnFocus > 0, 'edge predicate labels appear on focus (' + labelsOnFocus + ' shown)');

  // full-screen button is wired (requestFullscreen is blocked without a user gesture in headless,
  // so we assert the handler exists and does not throw rather than that the mode engages)
  const fullNoThrow = await page.evaluate(() => {
    try { document.getElementById('gFull').click(); return true; } catch (e) { return false; }
  });
  ok(fullNoThrow, 'Full screen button click does not throw');

  ok(errors.length === 0, 'no uncaught page errors' + (errors.length ? ' — ' + errors.join(' | ') : ''));

  await browser.close();
  try { fs.unlinkSync(out); } catch (e) {}
  console.log('\nwb_site_graph_smoke: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => { console.error('  ✗ smoke crashed:', e); process.exit(1); });
