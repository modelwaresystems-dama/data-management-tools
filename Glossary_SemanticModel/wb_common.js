/* wb_common.js — shared loader for the Glossary Workbench test suites.
 *
 * The built HTML is the source of truth. These helpers extract the single
 * <script type="text/babel"> block, Babel-transform it (classic runtime), and
 * evaluate it inside a jsdom window with React / ReactDOM / XLSX / fake-indexeddb
 * and a controllable fetch, exposing the app's internal symbols on globalThis.__WB__.
 *
 * Deps (install with --no-save, see preship.sh):
 *   react@18.2.0 react-dom@18.2.0 @babel/standalone@7.23.10 @babel/parser@7.23.x
 *   xlsx@0.18.5 jsdom@24 fake-indexeddb@5
 */
const fs = require('fs');
const path = require('path');
const Babel = require('@babel/standalone');

const APP = process.env.WB_APP || path.join(__dirname, 'glossary-workbench.html');

function readHtml() { return fs.readFileSync(APP, 'utf8'); }

function extractBlock(html) {
  const m = html.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('no <script type="text/babel"> block found in ' + APP);
  return m[1];
}

function readBlock() { return extractBlock(readHtml()); }

function transform(code) {
  return Babel.transform(code, { presets: [['react', { runtime: 'classic' }]] }).code;
}

// Symbols we lift out of the app's top-level scope for the unit suites.
const EXPOSE = [
  'GH', 'GH_ON', 'sGet', 'sSet', 'sDel',
  'idbGet', 'idbSet', 'idbDel', 'idbGetRaw', 'idbSetRaw', 'idbDelRaw', 'idbKeys',
  'QUANT_EDGES', 'QE_SHORT', 'QE_FROM_SHORT', 'QE_ORDER', 'qeParse', 'qeJoin',
  'INDEX_KEY', 'gKey', 'GH_CFG_KEY',
  'isaEdgesFor', 'buildIsaTree', 'analyzeCorpus', 'termSpos', 'buildSiteHtml', 'StorageSettings', 'repairWorkspaceRoster',
];

/*
 * loadApp({ fetch, realReactDOM }) -> { win, wb, fetchCount, setFetch, cleanup }
 *   fetch         async (url, init) => Response-like; default throws (network-forbidden)
 *   realReactDOM  true to mount the real app (mount smoke); default stubs createRoot
 */
function loadApp(opts = {}) {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',
    { url: 'https://localhost/', pretendToBeVisual: true });
  const win = dom.window;

  const React = require('react');
  const ReactDOM = opts.realReactDOM
    ? require('react-dom/client')
    : { createRoot: () => ({ render() {}, unmount() {} }) };
  let XLSX = {}; try { XLSX = require('xlsx'); } catch (e) {}
  const fakeIDB = require('fake-indexeddb');

  // Controllable, counting fetch. Default: forbid the network.
  let handler = opts.fetch || (async () => { throw new Error('network call not allowed'); });
  let fetchCount = 0;
  const countingFetch = (...a) => { fetchCount++; return handler(...a); };

  const g = globalThis;
  const prior = {};
  const set = (k, v) => { if (!(k in prior)) prior[k] = Object.getOwnPropertyDescriptor(g, k); g[k] = v; };

  set('window', win);
  set('document', win.document);
  set('navigator', win.navigator);
  set('localStorage', win.localStorage);
  set('sessionStorage', win.sessionStorage);
  set('location', win.location);
  set('indexedDB', fakeIDB.indexedDB);
  set('IDBKeyRange', fakeIDB.IDBKeyRange);
  set('React', React);
  set('ReactDOM', ReactDOM);
  set('XLSX', XLSX);
  set('fetch', countingFetch);
  if (!win.matchMedia) {
    win.matchMedia = () => ({ matches: false, media: '', onchange: null,
      addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; } });
  }
  set('matchMedia', win.matchMedia);
  // Keep animation loops from running under node unless asked.
  set('requestAnimationFrame', opts.realRAF ? (cb) => win.setTimeout(() => cb(Date.now()), 16) : () => 0);
  set('cancelAnimationFrame', () => {});

  const shim = ';try{globalThis.__WB__={' +
    EXPOSE.map((n) => n + ':(typeof ' + n + '!=="undefined"?' + n + ':undefined)').join(',') +
    '};}catch(e){globalThis.__WB_ERR__=e;}';

  const src = transform(readBlock()) + shim;
  // eslint-disable-next-line no-new-func
  const fn = new Function(src);
  fn();

  if (g.__WB_ERR__) throw g.__WB_ERR__;

  return {
    win,
    dom,
    wb: g.__WB__,
    fetchCount: () => fetchCount,
    setFetch: (h) => { handler = h; },
    cleanup: () => {
      Object.keys(prior).forEach((k) => {
        const d = prior[k];
        if (d === undefined) delete g[k];
        else Object.defineProperty(g, k, d);
      });
      delete g.__WB__; delete g.__WB_ERR__;
    },
  };
}

// Tiny assertion harness shared by the suites.
function Runner(title) {
  let pass = 0, fail = 0; const fails = [];
  return {
    ok(cond, label) { if (cond) { pass++; console.log('  ✓ ' + label); } else { fail++; fails.push(label); console.log('  ✗ ' + label); } },
    eq(a, b, label) { const c = JSON.stringify(a) === JSON.stringify(b); if (!c) label += ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'; this.ok(c, label); },
    done() {
      console.log('\n' + title + ': ' + pass + ' passed, ' + fail + ' failed (' + (pass + fail) + ' checks)');
      return fail === 0;
    },
    get fail() { return fail; },
  };
}

module.exports = { readHtml, readBlock, transform, loadApp, APP, Babel, EXPOSE, Runner };
