/* wb_storageui_test.js — the GitHub-sync Storage panel renders with its Pull/Push controls.
 * Guards the v4.82 sync UI (Test connection / Connect & pull / Pull now / Push now). */
const { loadApp, Runner } = require('./wb_common.js');
const React = require('react');

(async () => {
  const app = loadApp({ realReactDOM: true });
  const { StorageSettings } = app.wb;
  const r = Runner('wb_storageui_test');

  r.ok(typeof StorageSettings === 'function', 'StorageSettings component is exposed');

  const ReactDOMClient = require('react-dom/client');
  const doc = app.win.document;
  const host = doc.createElement('div'); doc.body.appendChild(host);
  let err = null;
  try { ReactDOMClient.createRoot(host).render(React.createElement(StorageSettings, { onClose: () => {} })); }
  catch (e) { err = e; }
  await new Promise((res) => setTimeout(res, 250));

  r.ok(!err, 'Storage panel renders without error' + (err ? ' (' + err.message + ')' : ''));
  const txt = host.textContent || '';
  ['Test connection', 'Connect & pull', 'Pull now', 'Push now'].forEach((l) =>
    r.ok(txt.includes(l), 'control present: "' + l + '"'));
  r.ok(/git pull/.test(txt), 'note about running git pull locally is shown');

  const green = r.done();
  app.cleanup();
  process.exit(green ? 0 : 1);
})().catch((e) => { console.error('wb_storageui_test CRASHED:', e); process.exit(1); });
