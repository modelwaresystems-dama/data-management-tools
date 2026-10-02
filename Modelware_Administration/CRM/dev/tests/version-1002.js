/* "CRM Console Version Number is not updating - the app is at 1.50 and I am
   seeing 1.33." (Howard, 2 Oct 2026.)

   The Asset Navigator's card reads Modelware_Administration/CRM/index.html, not
   crm.html. index.html had no <meta name="version"> at all and carried 1.33.0
   as typed text in two places, so the card sat seventeen versions behind.
   These pin the repo's versioning standard for BOTH files. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
let pass = 0, fail = 0; const fails = [];
const ok = (c, m, extra) => { if (c){ pass++; console.log('  \x1b[32m✓\x1b[0m ' + m); }
  else { fail++; fails.push(m); console.log('  \x1b[31m✗ ' + m + '\x1b[0m' + (extra ? '  [' + String(extra).slice(0, 300) + ']' : '')); } };
const describe = t => console.log('\n\x1b[1m' + t + '\x1b[0m');

(async () => {
  const app = path.resolve(process.argv[2] || 'crm.html');
  const dir = path.dirname(app);
  const index = path.join(dir, 'index.html');
  const stamp = path.join(__dirname, '..', 'stamp-build.py');

  const metaOf = f => (/<meta name="version" content="([^"]*)">/.exec(fs.readFileSync(f, 'utf8')) || [])[1];

  describe('the number lives in one place, in both files');
  const appV = metaOf(app), idxV = metaOf(index);
  ok(!!appV, 'crm.html carries <meta name="version">', String(appV));
  ok(!!idxV, 'index.html carries one too — it is what the Navigator build reads', String(idxV));
  ok(appV === idxV, 'and they are the same number', appV + ' vs ' + idxV);

  const idxSrc = fs.readFileSync(index, 'utf8');
  ok(!/>v?1\.33\.0</.test(idxSrc), 'the old hard-coded 1.33.0 is gone from index.html');
  ok(/getElementById\("appVersion"\)/.test(idxSrc) || /getElementById\('appVersion'\)/.test(idxSrc),
     'the badge is read from the meta rather than typed');

  describe('stamp-build.py keeps them together');
  const check = (args) => { try { return { out:execFileSync('python3', [stamp].concat(args), { encoding:'utf8' }), code:0 }; }
                            catch (e){ return { out:(e.stdout || '') + (e.stderr || ''), code:e.status }; } };
  const before = check(['--file', app, '--check']);
  ok(before.code === 0 && /^OK/.test(before.out), '--check passes when the two agree', before.out.trim());

  /* break index.html on purpose, in a copy-safe way */
  fs.writeFileSync(index, idxSrc.replace(/<meta name="version" content="[^"]*">/,
    '<meta name="version" content="1.33.0">'));
  const drift = check(['--file', app, '--check']);
  ok(drift.code !== 0 && /index\.html says 1\.33\.0/.test(drift.out),
     'and FAILS when index.html falls behind, naming what the card would show', drift.out.trim());

  const bumped = check(['--file', app, '--version', appV, '--date', '2 Oct 2026']);
  ok(/index\.html -> v/.test(bumped.out), 'stamping writes index.html as well as crm.html', bumped.out.trim());
  ok(metaOf(index) === appV, '…back in step without anybody typing it twice', metaOf(index));
  const after = check(['--file', app, '--check']);
  ok(after.code === 0, '…and the check passes again', after.out.trim());

  describe('the page shows what the meta says');
  const b = await chromium.launch(require('./browser.js'));
  const page = await b.newPage({ viewport:{ width:1100, height:800 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + index);
  await page.waitForTimeout(400);
  const shown = await page.evaluate(() => ({
    badge: (document.getElementById('appVersion') || {}).textContent || '',
    foot: (document.getElementById('buildVersion') || {}).textContent || '',
    body: document.body.textContent }));
  ok(shown.badge === 'v' + appV, 'the card badge renders the version', shown.badge);
  ok(shown.foot === appV, 'and so does the footer build line', shown.foot);
  ok(!/1\.33\.0/.test(shown.body), 'nothing on the page still says 1.33.0');
  ok(!errs.length, 'nothing threw', errs.join(' | '));
  await b.close();

  console.log('\n' + '─'.repeat(58));
  console.log(fail ? '\x1b[31m\x1b[1m' + pass + ' passed, ' + fail + ' FAILED.\x1b[0m' : '\x1b[32m\x1b[1m' + pass + ' passed, 0 failed.\x1b[0m');
  if (fail){ console.log('\nFailures:'); fails.forEach(f => console.log('  • ' + f)); process.exit(1); }
})();
