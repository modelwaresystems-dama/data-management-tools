/* wb_mount_smoke.js — the app mounts in default (browser) storage mode with
 * zero network calls, and the GitHub-storage UI is present and pre-filled. */
const { loadApp, Runner } = require('./wb_common.js');

process.on('unhandledRejection', () => {});   // a stray mount fetch must fail the count, not crash node

(async () => {
  // Default storage: empty localStorage/indexedDB => GH stays disabled => no network.
  const app = loadApp({
    realReactDOM: true,
    fetch: async () => ({ ok: false, status: 0, json: async () => ({}), text: async () => '' }),
  });
  const { GH } = app.wb;

  // Let the initial render + effects (load workspaces / index / corpus) settle.
  await new Promise((res) => setTimeout(res, 250));

  const r = Runner('wb_mount_smoke');
  const root = app.win.document.getElementById('root');
  const bodyText = app.win.document.body.textContent || '';

  r.ok(!!root && root.childNodes.length > 0, 'app mounts into #root');
  r.ok(app.fetchCount() === 0, 'no network calls during mount');
  r.ok(/Set up GitHub storage/.test(bodyText), 'GitHub-storage button present on the home screen');
  r.eq(GH.enabled, false, 'starts in browser storage mode (GH disabled)');
  r.eq(GH.owner, 'modelwaresystems-dama', 'storage owner pre-filled');
  r.eq(GH.repo, 'modelware_app_storage', 'storage repo pre-filled');
  r.eq(GH.folder, 'Semantic Model', 'storage folder pre-filled');

  const green = r.done();
  app.cleanup();
  process.exit(green ? 0 : 1);
})().catch((e) => { console.error('wb_mount_smoke CRASHED:', e); process.exit(1); });
