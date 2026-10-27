/* wb_roster_test.js — the customer-roster self-repair (v4.83). A transient empty roster must
 * never wipe customers whose glossaries are still in the store; customers with data are
 * restored (known names recovered, unknowns given a recovery name); a default always exists. */
const { loadApp, Runner } = require('./wb_common.js');

const app = loadApp();
const { repairWorkspaceRoster } = app.wb;
const r = Runner('wb_roster_test');
const nameFor = (id) => ({ gwq3tn8aamv1: 'DMBOK v3 01. Data Management', g9hgda0vli4f: 'Governing Business Meaning' }[id] || ('Recovered ' + id));

r.ok(typeof repairWorkspaceRoster === 'function', 'repairWorkspaceRoster is exposed');

// 1. the real scenario: roster clobbered to [default], data present for several customers
let res = repairWorkspaceRoster([{ id: 'default', name: 'My Glossaries' }], ['gwq3tn8aamv1', 'g9hgda0vli4f', 'gapfx0w2kvw2'], nameFor);
r.ok(res.changed, 'rebuild reports changed when customers are missing');
const ids = res.list.map((w) => w.id);
r.ok(ids.includes('default') && ids.includes('gwq3tn8aamv1') && ids.includes('g9hgda0vli4f') && ids.includes('gapfx0w2kvw2'),
  'all customers with data are restored, default kept');
r.eq(res.list.find((w) => w.id === 'gwq3tn8aamv1').name, 'DMBOK v3 01. Data Management', 'known customer recovers its real name');
r.eq(res.list.find((w) => w.id === 'gapfx0w2kvw2').name, 'Recovered gapfx0w2kvw2', 'unknown customer gets a recovery name');

// 2. empty roster still yields a default plus the data customers
res = repairWorkspaceRoster([], ['a'], nameFor);
r.ok(res.list.some((w) => w.id === 'default') && res.list.some((w) => w.id === 'a'), 'empty roster -> default + data customers');

// 3. no duplicates; no change when already complete
res = repairWorkspaceRoster([{ id: 'default' }, { id: 'a', name: 'A' }], ['a'], nameFor);
r.ok(!res.changed, 'complete roster reports no change');
r.eq(res.list.filter((w) => w.id === 'a').length, 1, 'no duplicate entries');

// 4. THE guarantee: an empty data scan never drops existing customers
res = repairWorkspaceRoster([{ id: 'default' }, { id: 'gwq3tn8aamv1', name: 'DMBOK' }], [], nameFor);
r.ok(res.list.some((w) => w.id === 'gwq3tn8aamv1'), 'existing customers are NEVER dropped when the data scan is empty');
r.ok(!res.changed, 'no spurious change when nothing is missing');

const green = r.done();
app.cleanup();
process.exit(green ? 0 : 1);
