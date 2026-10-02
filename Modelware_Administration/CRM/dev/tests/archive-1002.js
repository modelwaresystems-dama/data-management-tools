/* "I want to be able to archive certain companies. Partly because we dont want
   to do business with them." (Howard, 2 Oct 2026.)

   Not a merge (that is for a duplicate) and not a delete (that is for a
   mistake). The company and its history are real; the decision is that there
   will be no more business. */
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
      try { localStorage.removeItem('crm.companies.open'); } catch (e){}
      const A = window.CRMApp.App, E = window.CRMApp.emit;
      A.lens = null; A.scope = 'team'; A.events = []; A.seq = 0;
      E('company.created', { companyId:'bad', name:'Awkward Corp', domain:'awkward.test' });
      E('contact.created', { contactId:'c1', companyId:'bad', name:'Their Person', email:'p@awkward.test' });
      E('deal.created', { dealId:'d1', companyId:'bad', name:'Training that went wrong',
                          owner:A.me, stage:'proposal', commissionRate:0.2 });
      E('followup.created', { followupId:'f1', subjectType:'deal', subjectId:'d1',
                              owner:A.me, dueDate:A.today, what:'Chase the unpaid invoice' });
      E('interaction.logged', { interactionId:'x1', subjectType:'deal', subjectId:'d1',
                                kind:'email', occurredAt:'2026-08-01', summary:'They disputed the scope.' });
      E('invoice.raised', { invoiceId:'i1', dealId:'d1', number:'INV9', issuedOn:'2026-08-01',
                            dueDate:'2026-08-31', currency:'ZAR', net:10000, vat:1500, passThrough:0 });
      E('company.created', { companyId:'good', name:'Good Corp', domain:'good.test' });
      E('deal.created', { dealId:'d2', companyId:'good', name:'CDMP cohort', owner:A.me, stage:'lead' });
      window.CRMApp.refold();
      A.view = 'companies'; window.CRMApp.render();
    });

    describe(vp.tag + ' — the question is asked with the facts on the table');
    await seed();
    await page.waitForTimeout(350);
    const prompt = await page.evaluate(async () => {
      const heads = Array.from(document.querySelectorAll('#content .co-head'))
        .filter(x => /Awkward Corp/.test(x.textContent));
      if (!heads.length) return { fail:'Awkward Corp is not listed' };
      heads[0].click();
      await new Promise(r => setTimeout(r, 300));
      const link = Array.from(document.querySelectorAll('#content a'))
        .find(a => /archive/i.test(a.textContent));
      if (!link) return { fail:'no archive link on the company card' };
      link.click();
      await new Promise(r => setTimeout(r, 300));
      const pop = document.querySelector('.pop');
      return { txt: pop ? pop.textContent.replace(/[   ]/g, ' ').replace(/\s+/g, ' ') : '' };
    });
    ok(!prompt.fail, 'a company card offers "archive…"', prompt.fail);
    if (!prompt.fail){
      ok(/Nothing is deleted/.test(prompt.txt), 'it says nothing is deleted', prompt.txt.slice(0, 200));
      ok(/1 open deal/.test(prompt.txt) && /Training that went wrong/.test(prompt.txt),
         '…names the open deal that will stay open', prompt.txt.slice(0, 500));
      ok(/still owe R 11 500/.test(prompt.txt),
         '…and the money they still owe, which stays on Debtors', prompt.txt);
    }

    describe(vp.tag + ' — archiving changes what is OFFERED, not what happened');
    const after = await page.evaluate(async () => {
      const A = window.CRMApp.App, C = window.CRMCore;
      document.querySelector('.pop input[aria-label="Reason"]').value = 'we are not doing business with them';
      Array.from(document.querySelectorAll('.pop button')).find(x => /Archive them/.test(x.textContent)).click();
      await new Promise(r => setTimeout(r, 400));
      const st = A.st;
      const book = C.moneyBook(st, A.config, A.today, { scope:'team' });
      const debt = C.agedDebtors(st, A.config, A.today);
      const bands = C.bands(st, A.config, A.today, { scope:'team' });
      return {
        stillThere: !!st.companies.bad, archived: st.companies.bad.archived,
        reason: st.companies.bad.archiveReason,
        dealOpen: st.deals.d1.status, ix: C.interactionsFor(st, 'd1').length,
        contacts: Object.keys(st.contacts).length,
        active: C.activeCompanies(st).map(c => c.id).sort().join(','),
        archivedList: C.archivedCompanies(st).map(c => c.id).join(','),
        onDebtors: debt.rows.some(r => r.companyId === 'bad'),
        owed: debt.rows.filter(r => r.companyId === 'bad').map(r => r.balance).join(','),
        stillInToday: bands.overdue.concat(bands.dueToday).some(f => f.subjectId === 'd1'),
        noDomainMentions: book.noDomain.some(x => x.company.id === 'bad')
      };
    });
    ok(after.stillThere && after.archived, 'the company is marked, not removed', JSON.stringify(after));
    ok(after.reason === 'we are not doing business with them', 'the reason is kept', after.reason);
    ok(after.dealOpen === 'open' && after.ix === 1 && after.contacts === 1,
       'the open deal, its history and their people are untouched', JSON.stringify(after));
    ok(after.active === 'good' && after.archivedList === 'bad',
       'they are out of the active list and in the archived one', after.active + ' / ' + after.archivedList);
    ok(after.onDebtors && after.owed === '11500',
       'and they are STILL on Debtors — not dealing with somebody is not forgiving their invoice',
       after.owed);
    ok(after.stillInToday,
       'the open next step still shows: archiving is about new business, not closing what is running');

    describe(vp.tag + ' — no new business can start with them');
    const guards = await page.evaluate(async () => {
      const A = window.CRMApp.App, C = window.CRMCore;
      /* the triage importer refuses both doors */
      const logged = C.importTriage(JSON.stringify({ version:2, rows:[{
        dealId:'d1', kind:'email', occurredAt:'2026-10-02',
        summary:'They are asking about another course.', messageId:'<a1@x>' }] }),
        A.st, A.config, { actor:A.me, today:A.today });
      const created = C.triageCreate([{ company:'Awkward Corp', deal:'Another round',
        owner:A.me, stage:'lead', contactName:'Their Person', contactEmail:'p@awkward.test',
        nextStep:{ what:'Send a quote', dueDate:'2026-10-09' } }],
        A.st, A.config, { actor:A.me, today:A.today });
      /* and the new-deal form does not offer them */
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      const nd = Array.from(document.querySelectorAll('button')).find(x => /New deal/.test(x.textContent));
      if (nd) nd.click();
      await new Promise(r => setTimeout(r, 300));
      const list = document.querySelector('datalist');
      const offered = list ? Array.from(list.querySelectorAll('option')).map(o => o.value) : [];
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      return { loggedErr: logged.errors.join(' | '), loggedEvents: logged.events.length,
               createdErr: created.errors.join(' | '), createdEvents: created.events.length,
               offered: offered.join(',') };
    });
    ok(/is archived/.test(guards.loggedErr) && /not doing business with them/.test(guards.loggedErr),
       'a batch logging against them is refused, with the reason', guards.loggedErr);
    ok(guards.loggedEvents === 0, '…and nothing from that row is written', String(guards.loggedEvents));
    ok(/is archived/.test(guards.createdErr) && guards.createdEvents === 0,
       'a batch trying to create a new deal for them is refused too', guards.createdErr);
    ok(!/Awkward/.test(guards.offered) && /Good Corp/.test(guards.offered),
       'the New deal form does not offer them at all', guards.offered);

    describe(vp.tag + ' — they are out of the way, and one press from being seen');
    const list = await page.evaluate(async () => {
      const A = window.CRMApp.App;
      A.view = 'companies'; window.CRMApp.render();
      await new Promise(r => setTimeout(r, 350));
      const names = () => Array.from(document.querySelectorAll('#content .co-head .nm')).map(x => x.textContent);
      const hidden = names();
      const btn = Array.from(document.querySelectorAll('#content button')).find(x => /archived/.test(x.textContent));
      const label = btn ? btn.textContent : '';
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 300));
      const shown = names();
      const chip = Array.from(document.querySelectorAll('#content .chip')).map(x => x.textContent).join(',');
      /* searching finds them even while hidden */
      const back = Array.from(document.querySelectorAll('#content button')).find(x => /Hide the/.test(x.textContent));
      if (back) back.click();
      await new Promise(r => setTimeout(r, 250));
      const q = document.querySelector('#content input[aria-label="Filter"]');
      q.value = 'awkward'; q.dispatchEvent(new Event('input'));
      await new Promise(r => setTimeout(r, 300));
      return { hidden:hidden.join(','), label, shown:shown.join(','), chip,
               searched: names().join(',') };
    });
    ok(!/Awkward/.test(list.hidden) && /Good Corp/.test(list.hidden),
       'archived companies are off the list by default', list.hidden);
    ok(/Show 1 archived/.test(list.label), '…with a button that says how many', list.label);
    ok(/Awkward/.test(list.shown), 'pressing it shows them', list.shown);
    ok(/Archived/.test(list.chip), '…marked as archived on the row', list.chip);
    ok(/Awkward/.test(list.searched),
       'and searching by name finds them even while they are hidden', list.searched);

    describe(vp.tag + ' — and it can be undone');
    const undone = await page.evaluate(async () => {
      const A = window.CRMApp.App, C = window.CRMCore;
      const btn = Array.from(document.querySelectorAll('#content button')).find(x => /Un-archive/.test(x.textContent));
      const found = !!btn;
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 400));
      return { found, archived: !!A.st.companies.bad.archived,
               active: C.activeCompanies(A.st).map(c => c.id).sort().join(',') };
    });
    ok(undone.found, 'an archived card offers "Un-archive"');
    ok(!undone.archived && undone.active === 'bad,good', '…and they are active again', undone.active);

    describe(vp.tag + ' — no page errors');
    ok(!errs.length, 'nothing threw', errs.join(' | '));
    await page.close();
  }
  await b.close();
  console.log('\n' + '─'.repeat(58));
  console.log(fail ? '\x1b[31m\x1b[1m' + pass + ' passed, ' + fail + ' FAILED.\x1b[0m' : '\x1b[32m\x1b[1m' + pass + ' passed, 0 failed.\x1b[0m');
  if (fail){ console.log('\nFailures:'); fails.forEach(f => console.log('  • ' + f)); process.exit(1); }
})();
