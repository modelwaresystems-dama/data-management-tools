/* wb_embed_test.js — the in-app glue (v4.85). <EmbeddedModelSite> must render the live
 * Semantic Model site into an iframe srcDoc: the SAME self-contained, offline, controls-
 * bearing HTML buildSiteHtml() produces for the export — one implementation, both places. */
const { loadApp, Runner } = require('./wb_common.js');

process.on('unhandledRejection', () => {});

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

(async () => {
  const app = loadApp({ realReactDOM: true });
  const { EmbeddedModelSite } = app.wb;
  const React = globalThis.React;
  const ReactDOM = globalThis.ReactDOM;
  const r = Runner('wb_embed_test');

  r.ok(typeof EmbeddedModelSite === 'function', 'EmbeddedModelSite is exposed');

  const terms = [
    { Term: 'Data Governance', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved', Definition: 'Hub.' },
    { Term: 'Semantic Scope', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved', Definition: 'A.' },
  ];
  const spo = [{ Term: 'Data Governance', Subject: 'Data Governance', Predicate: 'delimits', Object: 'Semantic Scope', 'Sign-off': 'Approved' }];
  const corpus = terms.map((t) => ({ gId: 'g', gName: 'Test', areas: [], term: t, spo: spo.filter((s) => norm(s.Term) === norm(t.Term)) }));

  const host = app.win.document.createElement('div');
  app.win.document.body.appendChild(host);
  const root = ReactDOM.createRoot(host);
  root.render(React.createElement(EmbeddedModelSite, { corpus }));

  await new Promise((res) => setTimeout(res, 300)); // let the build effect run

  const txt = host.textContent || '';
  r.ok(/Rebuild from current glossaries/.test(txt), 'shows the manual "Rebuild from current glossaries" control');

  const iframe = host.querySelector('iframe');
  r.ok(!!iframe, 'renders an <iframe> for the embedded site');
  const doc = iframe ? (iframe.getAttribute('srcdoc') || '') : '';
  r.ok(doc.length > 1000, 'iframe srcDoc carries the built site (' + doc.length + ' chars)');
  r.ok(/id="gFit"/.test(doc) && /id="gFull"/.test(doc), 'embedded site includes the Fit / Full-screen controls');
  r.ok(/D3 v7\.8\.5 inlined/.test(doc), 'embedded site has D3 INLINED (not a CDN script)');
  r.ok(!/cdnjs\.cloudflare\.com\/ajax\/libs\/d3/.test(doc), 'embedded site makes no external D3 reference (offline-safe)');
  r.ok(iframe && iframe.getAttribute('allow') === 'fullscreen', 'iframe allows fullscreen so the Full-screen button works');
  r.ok(/Data Governance/.test(doc), 'the corpus actually reached the built site');

  const green = r.done();
  try { root.unmount(); } catch (e) {}
  app.cleanup();
  process.exit(green ? 0 : 1);
})().catch((e) => { console.error('wb_embed_test CRASHED:', e); process.exit(1); });
