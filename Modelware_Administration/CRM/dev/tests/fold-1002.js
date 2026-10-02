/* "There are times where interactions have created a new deal but they are part
   of another deal. I would like to fold the interaction into another deal and
   not have to DELETE or WON / LOST." (Howard, 2 Oct 2026 — "iTiQ - introduction"
   against the real iTiQ engagement.) */
const { chromium } = require('playwright');
const path = require('path');
let pass = 0, fail = 0; const fails = [];
const ok = (c, m, extra) => { if (c){ pass++; console.log('  \x1b[32m✓\x1b[0m ' + m); }
  else { fail++; fails.push(m); console.log('  \x1b[31m✗ ' + m + '\x1b[0m' + (extra ? '  [' + String(extra).slice(0, 400) + ']' : '')); } };
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
      try { localStorage.removeItem('crm.settings.shut'); } catch (e){}
      const A = window.CRMApp.App, E = window.CRMApp.emit;
      A.lens = null; A.scope = 'team'; A.events = []; A.seq = 0;
      E('company.created', { companyId:'itiq', name:'IT-IQ Botswana' });
      /* the real engagement */
      E('deal.created', { dealId:'real', companyId:'itiq', name:'CDMP and Data Quality training',
                          owner:A.me, stage:'proposal' });
      E('followup.created', { followupId:'fr', subjectType:'deal', subjectId:'real',
                              owner:A.me, dueDate:window.CRMCore.addDays(A.today, 3), what:'Chase HRDC pre-approval' });
      E('interaction.logged', { interactionId:'xr', subjectType:'deal', subjectId:'real',
                                kind:'email', occurredAt:'2026-09-10', summary:'Quote sent for the CDMP cohort.' });
      /* the stray one a thread created */
      E('deal.created', { dealId:'stray', companyId:'itiq', name:'iTiQ - introduction',
                          owner:A.me, stage:'lead' });
      E('interaction.logged', { interactionId:'x1', subjectType:'deal', subjectId:'stray',
                                kind:'meeting', occurredAt:'2026-09-16',
                                summary:'Debbie had a catch-up with Gaone and Mariam at iTiQ on 16 Sept.' });
      E('interaction.logged', { interactionId:'x2', subjectType:'deal', subjectId:'stray',
                                kind:'email', occurredAt:'2026-09-17',
                                summary:'Mariam is sending the supporting documents for HRDC pre-approval.' });
      E('followup.created', { followupId:'f1', subjectType:'deal', subjectId:'stray',
                              owner:A.me, dueDate:window.CRMCore.addDays(A.today, 5), what:'Get the HRDC documents' });
      E('quote.issued', { quoteId:'q1', dealId:'stray', number:'QUO0000999', amount:50000,
                          currency:'BWP', issuedOn:'2026-09-18' });
      window.CRMApp.refold();
    });

    describe(vp.tag + ' — folding is offered, and says what will move');
    await seed();
    const prompt = await page.evaluate(async () => {
      window.CRMApp.openDeal('stray');
      await new Promise(r => setTimeout(r, 350));
      const btn = Array.from(document.querySelectorAll('.panel button'))
        .find(x => /Fold into/.test(x.textContent));
      if (!btn) return { fail:'no "Fold into…" on the deal panel' };
      const headButtons = Array.from(document.querySelectorAll('.panel button')).map(x => x.textContent.trim());
      btn.click();
      await new Promise(r => setTimeout(r, 300));
      const sel = document.querySelector('select[aria-label="Fold into which deal"]');
      if (!sel) return { fail:'no deal picker' };
      const groups = Array.from(sel.querySelectorAll('optgroup')).map(g => g.label);
      const first = Array.from(sel.querySelectorAll('optgroup')[0].querySelectorAll('option')).map(o => o.textContent);
      sel.value = 'real'; sel.dispatchEvent(new Event('change'));
      await new Promise(r => setTimeout(r, 120));
      const says = Array.from(document.querySelectorAll('.pop .note')).map(n => n.textContent).join(' | ');
      return { headButtons, groups, first, says };
    });
    ok(!prompt.fail, 'the deal panel offers "Fold into…"', prompt.fail);
    if (!prompt.fail){
      ok(/Won/.test(prompt.headButtons.join(',')) && /Delete/.test(prompt.headButtons.join(',')),
         '…beside Won, Lost and Delete, not instead of them', prompt.headButtons.join(','));
      ok(/IT-IQ Botswana/.test(prompt.groups.join('|')),
         'the same customer\'s deals are offered first', prompt.groups.join('|'));
      ok(prompt.first.some(t => /CDMP and Data Quality training/.test(t)), '…including the real engagement');
      ok(/2 logged interactions/.test(prompt.says) && /1 open next step/.test(prompt.says) &&
         /1 quote/.test(prompt.says),
         'it says exactly what will move before anything happens', prompt.says);
      ok(/move to .CDMP and Data Quality training/.test(prompt.says), '…and where to', prompt.says);
    }

    describe(vp.tag + ' — the fold itself');
    const after = await page.evaluate(async () => {
      const btn = Array.from(document.querySelectorAll('.pop button')).find(x => /Fold it in/.test(x.textContent));
      if (!btn) return { fail:'no confirm button' };
      btn.click();
      await new Promise(r => setTimeout(r, 450));
      const A = window.CRMApp.App, C = window.CRMCore, st = A.st;
      const panel = (document.querySelector('.panel') || {}).textContent || '';
      return { gone: !st.deals.stray, inMerged: !!(st.mergedDeals && st.mergedDeals.stray),
               ix: C.interactionsFor(st, 'real').map(x => x.id).sort().join(','),
               fu: C.followupsFor(st, 'real').map(f => f.id).sort().join(','),
               quotes: C.quotesFor(st, 'real').map(q => q.id).join(','),
               open: C.openDeals(st).map(d => d.id).sort().join(','),
               live: C.liveDeal(st, 'stray'),
               openedTitle: (document.querySelector('.panel h3') || {}).textContent || '',
               panel: panel.replace(/\s+/g, ' '),
               outcome: (st.mergedDeals.stray || {}).outcome,
               status: (st.mergedDeals.stray || {}).status,
               deleted: (st.mergedDeals.stray || {}).deleted };
    });
    ok(!after.fail, 'it can be confirmed', after.fail);
    if (!after.fail){
      ok(after.gone && after.inMerged, 'the stray deal stops being a deal, without being deleted',
         JSON.stringify({ gone:after.gone, inMerged:after.inMerged }));
      ok(!after.outcome && after.status === 'open' && !after.deleted,
         'it is NOT marked won, lost or deleted — the three lies', JSON.stringify(after));
      ok(after.ix === 'x1,x2,xr', 'both logged interactions moved to the real deal', after.ix);
      ok(after.fu === 'f1,fr', '…and the open next step with them', after.fu);
      ok(after.quotes === 'q1', '…and the quote', after.quotes);
      ok(after.open === 'real', 'only one deal is open now', after.open);
      ok(after.live === 'real', 'the old id still resolves — it points at where the work went', after.live);
      ok(/CDMP and Data Quality training/.test(after.openedTitle),
         'the panel lands on the deal it was folded into', after.openedTitle);
      ok(/was part of this deal, folded/.test(after.panel) && /iTiQ - introduction/.test(after.panel),
         'which says what was folded in', after.panel.slice(0, 400));
      ok(/from .iTiQ - introduction/.test(after.panel),
         '…and the history lines say where they came from', after.panel.slice(0, 900));
    }

    describe(vp.tag + ' — Today and the pipeline follow');
    const today = await page.evaluate(async () => {
      const A = window.CRMApp.App, C = window.CRMCore;
      const b = C.bands(A.st, A.config, A.today, { scope:'team' });
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      A.view = 'pipeline'; window.CRMApp.render();
      await new Promise(r => setTimeout(r, 300));
      const pipe = (document.querySelector('#content') || {}).textContent || '';
      return { steps: b.overdue.concat(b.dueToday).length,
               noNext: b.noNextStep.map(d => d.id).join(','),
               stray: /iTiQ - introduction/.test(pipe) };
    });
    ok(today.noNext === '', 'the stray deal is no longer an open deal with no next step', today.noNext);
    ok(!today.stray, '…and it is out of the pipeline', String(today.stray));

    describe(vp.tag + ' — and it can be undone');
    const undone = await page.evaluate(async () => {
      const A = window.CRMApp.App, C = window.CRMCore;
      window.CRMApp.unfoldDeal('stray');
      await new Promise(r => setTimeout(r, 400));
      const st = A.st;
      return { back: !!st.deals.stray,
               ix: C.interactionsFor(st, 'stray').map(x => x.id).sort().join(','),
               realIx: C.interactionsFor(st, 'real').map(x => x.id).join(','),
               fu: C.followupsFor(st, 'stray').map(f => f.id).join(','),
               quotes: C.quotesFor(st, 'stray').map(q => q.id).join(','),
               open: C.openDeals(st).map(d => d.id).sort().join(',') };
    });
    ok(undone.back, 'separating it again brings the deal back');
    ok(undone.ix === 'x1,x2' && undone.realIx === 'xr',
       '…with its own interactions, and the other deal keeps its own', undone.ix + ' / ' + undone.realIx);
    ok(undone.fu === 'f1' && undone.quotes === 'q1', '…and its step and quote', undone.fu + ' / ' + undone.quotes);
    ok(undone.open === 'real,stray', 'both deals are open again', undone.open);

    describe(vp.tag + ' — Settings lists what has been folded');
    const settings = await page.evaluate(async () => {
      const A = window.CRMApp.App;
      window.CRMApp.foldDeal(A.st.deals.stray, 'real', 'same engagement');
      await new Promise(r => setTimeout(r, 400));
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      A.view = 'settings'; window.CRMApp.render();
      await new Promise(r => setTimeout(r, 400));
      const heads = Array.from(document.querySelectorAll('#content .co-head'))
        .filter(x => /Folded deals/.test(x.textContent));
      if (heads.length) heads[0].click();
      await new Promise(r => setTimeout(r, 200));
      const sec = Array.from(document.querySelectorAll('#content section'))
        .find(x => /Folded deals/.test(x.textContent));
      const txt = sec ? sec.textContent.replace(/\s+/g, ' ') : '';
      const btn = sec && Array.from(sec.querySelectorAll('button')).find(x => /Separate again/.test(x.textContent));
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 400));
      return { found: !!heads.length, txt, hadBtn: !!btn, back: !!A.st.deals.stray };
    });
    ok(settings.found, 'Settings has a "Folded deals" section');
    ok(/iTiQ - introduction/.test(settings.txt) && /same engagement/.test(settings.txt),
       '…naming the deal, where it went and why', settings.txt.slice(0, 300));
    ok(settings.hadBtn && settings.back, '…with "Separate again" that works', String(settings.back));

    describe(vp.tag + ' — a fold cannot eat itself');
    const guards = await page.evaluate(() => {
      const C = window.CRMCore, cfg = window.CRMApp.App.config;
      let n = 0;
      const ev = (type, payload) => ({ id:'g'+n, ts:'2026-10-0' + (1 + (n % 8)) + 'T08:00:00Z', seq:n++, actor:'howard', type, payload });
      const base = [
        ev('company.created', { companyId:'c1', name:'X' }),
        ev('deal.created', { dealId:'a', companyId:'c1', name:'A', owner:'howard', stage:'lead' }),
        ev('deal.created', { dealId:'b', companyId:'c1', name:'B', owner:'howard', stage:'lead' }),
        ev('deal.created', { dealId:'c', companyId:'c1', name:'C', owner:'howard', stage:'lead' }),
        ev('interaction.logged', { interactionId:'i1', subjectType:'deal', subjectId:'a',
                                   kind:'email', occurredAt:'2026-10-01', summary:'A line on A.' })
      ];
      const self = C.foldEvents(base.concat([ev('deal.merged', { fromId:'a', intoId:'a' })]), cfg, '2026-10-02');
      const chain = C.foldEvents(base.concat([
        ev('deal.merged', { fromId:'a', intoId:'b' }),
        ev('deal.merged', { fromId:'b', intoId:'c' })]), cfg, '2026-10-02');
      const cycle = C.foldEvents(base.concat([
        ev('deal.merged', { fromId:'a', intoId:'b' }),
        ev('deal.merged', { fromId:'b', intoId:'a' })]), cfg, '2026-10-02');
      return { self: !!self.deals.a,
               chainIx: C.interactionsFor(chain, 'c').map(x => x.id).join(','),
               chainOpen: C.openDeals(chain).map(d => d.id).sort().join(','),
               cycleOpen: C.openDeals(cycle).map(d => d.id).sort().join(','),
               cycleIx: C.interactionsFor(cycle, 'a').map(x => x.id).join(',') };
    });
    ok(guards.self, 'a deal cannot be folded into itself');
    ok(guards.chainIx === 'i1' && guards.chainOpen === 'c',
       'A into B into C lands everything on C', guards.chainIx + ' / ' + guards.chainOpen);
    ok(guards.cycleOpen === 'a,b,c' && guards.cycleIx === 'i1',
       'a cycle is broken rather than swallowing both deals — two visible deals beats none',
       guards.cycleOpen + ' / ' + guards.cycleIx);

    describe(vp.tag + ' — an import row naming the old deal still lands');
    const imp = await page.evaluate(() => {
      const C = window.CRMCore, cfg = window.CRMApp.App.config;
      let n = 0;
      const ev = (type, payload) => ({ id:'m'+n, ts:'2026-10-0' + (1 + (n % 8)) + 'T08:00:00Z', seq:n++, actor:'howard', type, payload });
      const st = C.foldEvents([
        ev('company.created', { companyId:'c1', name:'IT-IQ Botswana' }),
        ev('deal.created', { dealId:'real', companyId:'c1', name:'CDMP training', owner:'howard', stage:'lead' }),
        ev('deal.created', { dealId:'stray', companyId:'c1', name:'iTiQ - introduction', owner:'howard', stage:'lead' }),
        ev('deal.merged', { fromId:'stray', intoId:'real' })
      ], cfg, '2026-10-02');
      const res = C.importTriage(JSON.stringify({ version:2, rows:[{
        dealId:'stray', kind:'email', occurredAt:'2026-10-02',
        summary:'Mariam confirmed the HRDC paperwork is in.', messageId:'<z1@x>' }] }),
        st, cfg, { actor:'howard', today:'2026-10-02' });
      const landed = res.events.filter(e => e.type === 'interaction.logged').map(e => e.payload.subjectId);
      return { errors:res.errors, landed:landed.join(','), logged:res.summary.logged };
    });
    ok(!imp.errors.length, 'a batch written before the fold is not refused', imp.errors.join(' | '));
    ok(imp.landed === 'real' && imp.logged === 1,
       '…its line lands on the deal the work was folded into', imp.landed + ' / ' + imp.logged);

    describe(vp.tag + ' — no page errors');
    ok(!errs.length, 'nothing threw', errs.join(' | '));
    await page.close();
  }
  await b.close();
  console.log('\n' + '─'.repeat(58));
  console.log(fail ? '\x1b[31m\x1b[1m' + pass + ' passed, ' + fail + ' FAILED.\x1b[0m' : '\x1b[32m\x1b[1m' + pass + ' passed, 0 failed.\x1b[0m');
  if (fail){ console.log('\nFailures:'); fails.forEach(f => console.log('  • ' + f)); process.exit(1); }
})();
