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
  /* The build DATE the app is actually carrying. This test re-stamps the real
     crm.html to prove the two files move together, and it used to pass a
     hard-coded "2 Oct 2026" — so every run quietly dated the build wrong and
     the Navigator card would have shown it. Put back what was there. */
  const builtOf = f => (/<meta name="crm-build" content="[^"]*" data-built="([^"]*)"/
    .exec(fs.readFileSync(f, 'utf8')) || [])[1];

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

  const appBuilt = builtOf(app);
  const bumped = check(['--file', app, '--version', appV, '--date', appBuilt]);
  ok(/index\.html -> v/.test(bumped.out), 'stamping writes index.html as well as crm.html', bumped.out.trim());
  ok(metaOf(index) === appV, '…back in step without anybody typing it twice', metaOf(index));
  const after = check(['--file', app, '--check']);
  ok(after.code === 0, '…and the check passes again', after.out.trim());
  ok(builtOf(app) === appBuilt,
     '…and the test left the build date exactly as it found it', builtOf(app) + ' vs ' + appBuilt);

  /* 16 Oct 2026: the number also sat in data-version on the crm-build line, and
     stamping copied THAT over the meta, so a bump made the standard way (edit
     the meta only) was silently put back. The meta is the only place now. */
  describe('a bump made only in the meta survives stamping');
  const appSrc = fs.readFileSync(app, 'utf8');
  ok(!/data-version=/.test(appSrc), 'crm.html writes the version nowhere but the meta');
  const probe = appV.replace(/(\d+)$/, n => String(+n + 1));
  fs.writeFileSync(app, appSrc.replace(/<meta name="version" content="[^"]*">/,
    '<meta name="version" content="' + probe + '">'));
  const restamp = check(['--file', app, '--date', appBuilt]);
  ok(metaOf(app) === probe, 'stamping keeps the bumped meta in crm.html', metaOf(app) + ' ' + restamp.out.trim());
  ok(metaOf(index) === probe, '…and copies it to index.html for the Navigator card', metaOf(index));
  fs.writeFileSync(app, appSrc);
  check(['--file', app, '--date', appBuilt]);
  ok(metaOf(app) === appV && metaOf(index) === appV && check(['--file', app, '--check']).code === 0,
     '…and the test put both files back as it found them', metaOf(app) + ' / ' + metaOf(index));

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

  const appPage = await b.newPage({ viewport:{ width:1100, height:800 } });
  const appErrs = []; appPage.on('pageerror', e => appErrs.push(String(e)));
  await appPage.goto('file://' + app);
  await appPage.waitForTimeout(800);
  /* Read the BADGE, not the function behind it. crm-app is an IIFE, so
     `buildInfo` is private and `typeof buildInfo === 'function'` was false in
     page scope on every build — this assertion could never pass and had been
     holding verify.sh red. The repo standard asks for the number to be shown on
     screen so it can be verified; the badge is that, so the badge is what the
     test should read. */
  const inApp = await appPage.evaluate(() => {
    const el = document.querySelector('.buildline');
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
  });
  ok(!!inApp && inApp.indexOf('v' + appV) === 0,
     'the app\'s own version badge shows the meta on screen', String(inApp));
  ok(!appErrs.length, 'and the app loaded without throwing', appErrs.join(' | '));
  await b.close();

  console.log('\n' + '─'.repeat(58));
  console.log(fail ? '\x1b[31m\x1b[1m' + pass + ' passed, ' + fail + ' FAILED.\x1b[0m' : '\x1b[32m\x1b[1m' + pass + ' passed, 0 failed.\x1b[0m');
  if (fail){ console.log('\nFailures:'); fails.forEach(f => console.log('  • ' + f)); process.exit(1); }
})();
