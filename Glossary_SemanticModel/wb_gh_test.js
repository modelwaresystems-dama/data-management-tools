/* wb_gh_test.js — GitHub storage adapter (GH) against a mocked fetch.
 * base64 UTF-8 round-trip, URL construction, testConnection, load via the RAW
 * endpoint (incl. a >1MB file), sGet/sSet/idbGet/idbSet routing, and clear-then-save. */
const { loadApp, Runner } = require('./wb_common.js');

function resp({ status = 200, ok, json, text }) {
  return { status, ok: ok != null ? ok : (status >= 200 && status < 300),
    json: async () => (typeof json === 'function' ? json() : json),
    text: async () => (typeof text === 'function' ? text() : text) };
}

(async () => {
  const app = loadApp();
  const { GH, sGet, sSet, idbGet, idbSet, GH_CFG_KEY } = app.wb;
  const r = Runner('wb_gh_test');

  // 1-3. base64 helpers
  r.eq(GH.b64dec(GH.b64enc('hello')), 'hello', 'b64 ASCII round-trip');
  r.eq(GH.b64dec(GH.b64enc('héllo 🌍')), 'héllo 🌍', 'b64 UTF-8 round-trip (accents + emoji)');
  r.eq(GH.b64enc('hello'), Buffer.from('hello', 'utf8').toString('base64'), 'b64enc matches canonical base64');

  // 4. file URL construction (folder "Semantic Model" -> %20)
  r.eq(GH.fileUrl('ig_index'),
    'https://api.github.com/repos/modelwaresystems-dama/modelware_app_storage/contents/Semantic%20Model/ig_index.json',
    'fileUrl builds the Contents API path with encoded folder');

  // 5-7. testConnection status handling
  app.setFetch(async () => resp({ status: 401, ok: false }));
  let threw = false; try { await GH.testConnection(); } catch (e) { threw = true; } r.ok(threw, 'testConnection throws on 401');
  app.setFetch(async () => resp({ status: 404, ok: false }));
  threw = false; try { await GH.testConnection(); } catch (e) { threw = true; } r.ok(threw, 'testConnection throws on 404');
  app.setFetch(async () => resp({ status: 200, ok: true, json: { full_name: 'modelwaresystems-dama/modelware_app_storage', private: true } }));
  let okConn = false; try { const j = await GH.testConnection(); okConn = j.full_name.includes('modelware_app_storage'); } catch (e) {}
  r.ok(okConn, 'testConnection returns repo json on 200');

  // 8-9. load() via the RAW endpoint, incl. a >1MB file
  const bigStr = 'x'.repeat(1100000);                      // > 1MB of JSON content
  const rawById = {
    'https://raw.example/ig_index': JSON.stringify({ hello: 'world' }),
    'https://raw.example/ig_big': JSON.stringify({ big: bigStr }),
  };
  let rawAcceptSeen = false;
  app.setFetch(async (url, init) => {
    if (/\?ref=/.test(url)) {
      return resp({ ok: true, json: [
        { type: 'file', name: 'ig_index.json', sha: 's1', url: 'https://raw.example/ig_index' },
        { type: 'file', name: 'ig_big.json', sha: 's2', url: 'https://raw.example/ig_big' },
      ] });
    }
    const acc = init && init.headers && init.headers.Accept;
    if (acc && /github\.raw/.test(acc)) rawAcceptSeen = true;
    return resp({ ok: true, text: rawById[url] });
  });
  const n = await GH.load();
  r.ok(n === 2, 'load() populates the cache from the folder listing (2 files)');
  r.ok(rawAcceptSeen, 'load() fetches file content via the RAW endpoint (Accept: github.raw)');
  r.eq(GH.get('ig_index'), { hello: 'world' }, 'small file loaded back from raw');
  r.ok(GH.get('ig_big') && GH.get('ig_big').big.length === 1100000, '>1MB file round-trips through the raw endpoint intact');

  // 10. write routing: with GH.enabled, sSet/idbSet go to GH, not localStorage
  GH.enabled = true; GH.loaded = true;
  try { localStorage.removeItem('ig_x'); localStorage.removeItem('ig_z'); } catch (e) {}
  await sSet('ig_x', { a: 1 });
  await idbSet('ig_z', { c: 3 });
  r.eq(GH.get('ig_x'), { a: 1 }, 'sSet routes to GH cache when enabled');
  r.ok(GH.pending.has('ig_x'), 'sSet queues a pending GH write');
  r.eq(GH.get('ig_z'), { c: 3 }, 'idbSet routes to GH cache when enabled');
  r.ok(localStorage.getItem('ig_x') == null, 'sSet does NOT touch localStorage when GH is enabled');
  GH.timers.forEach((t) => clearTimeout(t));   // cancel the debounced flushes

  // 11. read routing: with GH_ON(), sGet/idbGet read from the GH cache
  GH.cache.set('ig_y', { b: 2 });
  r.eq(await sGet('ig_y'), { b: 2 }, 'sGet reads from GH cache when GH_ON()');
  r.eq(await idbGet('ig_y'), { b: 2 }, 'idbGet reads from GH cache when GH_ON()');

  // 12. clear-then-save: clearBrowserData wipes ig_* but keeps the config; migrate pushes
  GH.enabled = false;   // clearBrowserData/migrate read raw browser storage
  try {
    localStorage.setItem('ig_index', JSON.stringify([1, 2]));
    localStorage.setItem('ig_other', 'keepme-or-not');
    localStorage.setItem(GH_CFG_KEY, '{}');
  } catch (e) {}
  await GH.clearBrowserData();
  r.ok(localStorage.getItem('ig_index') == null && localStorage.getItem('ig_other') == null, 'clearBrowserData removes ig_* keys');
  r.ok(localStorage.getItem(GH_CFG_KEY) != null, 'clearBrowserData keeps the GH config key');

  let puts = 0;
  app.setFetch(async (url, init) => { if (init && init.method === 'PUT') { puts++; return resp({ ok: true, json: { content: { sha: 'newsha' } } }); } return resp({ ok: true, json: {} }); });
  try { localStorage.setItem('ig_m', JSON.stringify({ m: 1 })); } catch (e) {}
  GH.cache.clear();
  const migrated = await GH.migrate();
  r.ok(migrated >= 1 && GH.get('ig_m') && GH.get('ig_m').m === 1 && puts >= 1, 'migrate() uploads browser data to GH (PUT issued, cached)');

  const green = r.done();
  app.cleanup();
  process.exit(green ? 0 : 1);
})().catch((e) => { console.error('wb_gh_test CRASHED:', e); process.exit(1); });
