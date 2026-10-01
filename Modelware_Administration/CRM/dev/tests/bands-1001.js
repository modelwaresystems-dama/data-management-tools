/* "Please allow me to collapse the 'No Next Step' there is lots of items in there."
   (Howard, 1 Oct 2026 — 16 rows in that band, 3 things actually due above it.)
   Every Today band with rows folds, remembers, and takes its own footnote with it. */
const { chromium } = require('playwright');
const path = require('path');
let pass = 0, fail = 0; const fails = [];
const ok = (c, m, extra) => { if (c){ pass++; console.log('  \x1b[32m✓\x1b[0m ' + m); }
  else { fail++; fails.push(m); console.log('  \x1b[31m✗ ' + m + '\x1b[0m' + (extra ? '  [' + String(extra).slice(0, 300) + ']' : '')); } };
const describe = t => console.log('\n\x1b[1m' + t + '\x1b[0m');

(async () => {
  const file = path.resolve(process.argv[2] || 'crm.html');
  const b = await chromium.launch(require('./browser.js'));
  for (const vp of [{ tag:'desktop', width:1440, height:950 }, { tag:'phone', width:390, height:844 }]){
    const page = await b.newPage({ viewport:{ width:vp.width, height:vp.height } });
    const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.goto('file://' + file); await page.waitForTimeout(900);

    const seed = () => page.evaluate(() => {
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      try { localStorage.removeItem('crm.today.shut'); } catch (e){}
      const A = window.CRMApp.App, E = window.CRMApp.emit, C = window.CRMCore;
      A.lens = null; A.scope = 'team'; A.events = []; A.seq = 0;
      E('company.created', { companyId:'c1', name:'Telkom' });
      E('deal.created', { dealId:'d1', companyId:'c1', name:'AI Governance advisory', owner:A.me, stage:'lead' });
      E('followup.created', { followupId:'f1', subjectType:'deal', subjectId:'d1',
                              owner:A.me, dueDate:C.addDays(A.today, -23), what:'Get Telkom’s numbers' });
      E('deal.created', { dealId:'d2', companyId:'c1', name:'Due today deal', owner:A.me, stage:'lead' });
      E('followup.created', { followupId:'f2', subjectType:'deal', subjectId:'d2',
                              owner:A.me, dueDate:A.today, what:'Follow up' });
      /* sixteen deals with no next step — the band Howard is scrolling past */
      for (let i = 0; i < 16; i++)
        E('deal.created', { dealId:'n' + i, companyId:'c1', name:'Silent deal ' + i, owner:A.me, stage:'lead' });
      window.CRMApp.refold();
      A.view = 'today'; window.CRMApp.render();
    });

    const look = () => page.evaluate(() => {
      const sec = document.querySelector('.band-none');
      const head = sec && sec.querySelector('.band-head');
      const list = sec && sec.querySelector('.band-list');
      const note = sec && Array.from(sec.querySelectorAll('.note'))
        .find(n => /defect, not a gap/.test(n.textContent));
      const vis = el => !!(el && el.getBoundingClientRect().height > 0);
      return { isButton: head && head.tagName === 'BUTTON',
               expanded: head && head.getAttribute('aria-expanded'),
               headText: head ? head.textContent.replace(/\s+/g, ' ').trim() : '',
               rows: list ? list.querySelectorAll('.item').length : -1,
               rowsVisible: vis(list), noteVisible: vis(note),
               noteInside: !!note,
               overdueOpen: (document.querySelector('.band-overdue .band-head') || {}).getAttribute
                 ? document.querySelector('.band-overdue .band-head').getAttribute('aria-expanded') : null,
               stored: (() => { try { return localStorage.getItem('crm.today.shut'); } catch (e){ return 'x'; } })(),
               pageHeight: document.querySelector('#content').scrollHeight };
    });
    const click = () => page.evaluate(() => { document.querySelector('.band-none .band-head').click(); });

    describe(vp.tag + ' — the No next step band folds away');
    await seed(); await page.waitForTimeout(350);
    const open = await look();
    ok(open.rows === 16, 'sixteen deals with no next step, as on the real pipeline', String(open.rows));
    ok(open.isButton, 'the band heading is a control you can press');
    ok(open.expanded === 'true', '…open to begin with, so nothing moved for anyone');
    ok(open.noteInside, 'the line explaining the band is inside it');

    await click(); await page.waitForTimeout(250);
    const shut = await look();
    ok(shut.expanded === 'false', 'pressing it collapses the band');
    ok(!shut.rowsVisible, '…the sixteen rows are gone from the page');
    ok(!shut.noteVisible, '…and its footnote goes with them, not stranded explaining nothing');
    ok(/16 hidden/.test(shut.headText), '…the heading says how many are hidden', shut.headText);
    ok(/· 16/.test(shut.headText), '…and still carries the count');
    ok(shut.pageHeight < open.pageHeight - 200, 'the page is genuinely shorter',
       open.pageHeight + ' → ' + shut.pageHeight);
    ok(shut.overdueOpen === 'true', 'the other bands are untouched — Overdue is still open');
    ok(/band-none/.test(String(shut.stored)), 'the choice is remembered', String(shut.stored));

    describe(vp.tag + ' — and it stays that way');
    await page.reload(); await page.waitForTimeout(900);
    await page.evaluate(() => { window.CRMApp.App.view = 'today'; window.CRMApp.render(); });
    await page.waitForTimeout(300);
    const after = await look();
    ok(after.expanded === 'false' && !after.rowsVisible,
       'after a reload the band is still folded', JSON.stringify(after));
    await page.evaluate(() => { document.querySelector('.band-none .band-head').click(); });
    await page.waitForTimeout(250);
    const re = await look();
    ok(re.expanded === 'true' && re.rowsVisible && re.noteVisible, 'pressing again opens it');
    ok(!/band-none/.test(String(re.stored)), '…and forgets the exception rather than storing the default', String(re.stored));

    describe(vp.tag + ' — a band with nothing in it has no control to press');
    const empty = await page.evaluate(async () => {
      const A = window.CRMApp.App, E = window.CRMApp.emit;
      /* give every silent deal a step: the band empties */
      for (let i = 0; i < 16; i++)
        E('followup.created', { followupId:'g' + i, subjectType:'deal', subjectId:'n' + i,
                                owner:A.me, dueDate:window.CRMCore.addDays(A.today, 30), what:'Later' });
      window.CRMApp.refold(); window.CRMApp.render();
      await new Promise(r => setTimeout(r, 250));
      const sec = document.querySelector('.band-none');
      const head = sec && sec.querySelector('.band-head');
      return { tag: head && head.tagName, text: sec ? sec.textContent.replace(/\s+/g, ' ').trim() : '' };
    });
    ok(empty.tag === 'DIV', 'an empty band keeps a plain heading', empty.tag);
    ok(/Every open deal has a next step/.test(empty.text), '…and still says what that means', empty.text.slice(0, 120));

    describe(vp.tag + ' — no page errors');
    ok(!errs.length, 'nothing threw', errs.join(' | '));
    await page.close();
  }
  await b.close();
  console.log('\n' + '─'.repeat(58));
  console.log(fail ? '\x1b[31m\x1b[1m' + pass + ' passed, ' + fail + ' FAILED.\x1b[0m' : '\x1b[32m\x1b[1m' + pass + ' passed, 0 failed.\x1b[0m');
  if (fail){ console.log('\nFailures:'); fails.forEach(f => console.log('  • ' + f)); process.exit(1); }
})();
