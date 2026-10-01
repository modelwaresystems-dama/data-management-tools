/* "Monica from Finance believes that the Commission Tab on the Money area is
   calculating the commission on the Amount and the VAT and not just the amount."
   (Howard, 1 Oct 2026.)

   These pin the arithmetic she is asking about, and the one place VAT really
   was leaking into a commission base: a credit note was coming off it gross. */
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

    describe(vp.tag + ' — the base is the net, and VAT is nowhere near it');
    const core = await page.evaluate(() => {
      const C = window.CRMCore;
      const cfg = { stages:[{id:'won',label:'Won',probability:1}],
        thresholds:{ pushedCount:3, silentDays:30, stalledDays:45 },
        currencies:['ZAR'], defaultCurrency:'ZAR',
        users:[{ id:'debbie', name:'Debbie Diesel', sales:true }] };
      let n = 0;
      const ev = (type, payload) => ({ id:'v'+n, ts:'2026-09-0' + (1 + (n % 8)) + 'T08:00:00Z',
        seq:n++, actor:'debbie', type, payload });
      const evs = [
        ev('company.created', { companyId:'c1', name:'Nedbank' }),
        ev('deal.created', { dealId:'d1', companyId:'c1', name:'CDMP cohort', owner:'debbie',
                             stage:'won', commissionRate:0.2 }),
        /* R10,000 of work, R1,500 of VAT. Commission must be R2,000, not R2,300. */
        ev('invoice.raised', { invoiceId:'i1', dealId:'d1', number:'INV1', issuedOn:'2026-08-01',
                               dueDate:'2026-08-31', currency:'ZAR', net:10000, vat:1500, passThrough:0 }),
        ev('payment.received', { paymentId:'p1', invoiceId:'i1', amount:11500, receivedOn:'2026-08-20' }),
        /* …and one with resale on it, to show both exclusions at once */
        ev('deal.created', { dealId:'d2', companyId:'c1', name:'Venue + training', owner:'debbie',
                             stage:'won', commissionRate:0.2 }),
        ev('invoice.raised', { invoiceId:'i2', dealId:'d2', number:'INV2', issuedOn:'2026-08-01',
                               dueDate:'2026-08-31', currency:'ZAR', net:10000, vat:1500, passThrough:2000 })
      ];
      const st = C.foldEvents(evs, cfg, '2026-10-01');
      const s1 = C.invoiceState(st, st.invoices.i1);
      const s2 = C.invoiceState(st, st.invoices.i2);
      const cm1 = C.invoiceCommission(st.deals.d1, st.invoices.i1, s1);
      const cm2 = C.invoiceCommission(st.deals.d2, st.invoices.i2, s2);
      window.__st = st; window.__cfg = cfg;
      return { gross1:s1.gross, base1:s1.commissionBase, com1:cm1.total,
               base2:s2.commissionBase, com2:cm2.total,
               onGross: C.round2(s1.gross * 0.2) };
    });
    ok(core.gross1 === 11500, 'the customer owes the VAT-inclusive total', String(core.gross1));
    ok(core.base1 === 10000, '…and the commission base is the NET, without the VAT', String(core.base1));
    ok(core.com1 === 2000, '20% of R10,000 is R2,000 — the figure Finance should see', String(core.com1));
    ok(core.com1 !== core.onGross, '…and NOT R2,300, which is 20% of the VAT-inclusive total',
       core.com1 + ' vs ' + core.onGross);
    ok(core.base2 === 8000 && core.com2 === 1600,
       'resale comes out of the base as well, so it is net minus what we collect for somebody else',
       core.base2 + '/' + core.com2);

    describe(vp.tag + " — a credit note's VAT must not come off a net base");
    const credit = await page.evaluate(() => {
      const C = window.CRMCore;
      const cfg = window.__cfg;
      let n = 0;
      const ev = (type, payload) => ({ id:'k'+n, ts:'2026-09-0' + (1 + (n % 8)) + 'T08:00:00Z',
        seq:n++, actor:'debbie', type, payload });
      const st = C.foldEvents([
        ev('company.created', { companyId:'c1', name:'Nedbank' }),
        ev('deal.created', { dealId:'d1', companyId:'c1', name:'CDMP cohort', owner:'debbie',
                             stage:'won', commissionRate:0.2 }),
        ev('invoice.raised', { invoiceId:'i1', dealId:'d1', number:'INV1', issuedOn:'2026-08-01',
                               dueDate:'2026-08-31', currency:'ZAR', net:10000, vat:1500, passThrough:0 }),
        /* one delegate short: R1,000 of work credited, plus its R150 of VAT */
        ev('creditnote.issued', { creditNoteId:'cn1', dealId:'d1', number:'CRN1', issuedOn:'2026-08-10',
                                  currency:'ZAR', net:1000, vat:150, againstInvoiceId:'i1' }),
        ev('payment.received', { paymentId:'p1', invoiceId:'i1', amount:10350, receivedOn:'2026-08-20' })
      ], cfg, '2026-10-01');
      const s = C.invoiceState(st, st.invoices.i1);
      const cm = C.invoiceCommission(st.deals.d1, st.invoices.i1, s);
      return { balance:s.balance, settled:s.settled, credited:s.credited, creditedNet:s.creditedNet,
               base:s.commissionBase, com:cm.total };
    });
    ok(credit.credited === 1150, 'what the CUSTOMER owes moves by the gross credit', String(credit.credited));
    ok(credit.balance === 0 && credit.settled, '…so R10,350 settles the invoice in full', String(credit.balance));
    ok(credit.creditedNet === 1000, 'what anybody EARNS moves by the net of the credit', String(credit.creditedNet));
    ok(credit.base === 9000, 'the base is R9,000, not R8,850 — the VAT was being docked from it',
       String(credit.base));
    ok(credit.com === 1800, '…so the commission is R1,800', String(credit.com));

    describe(vp.tag + ' — a credit note on an invoice with LINES splits on net too');
    const lines = await page.evaluate(() => {
      const C = window.CRMCore, cfg = window.__cfg;
      let n = 0;
      const ev = (type, payload) => ({ id:'l'+n, ts:'2026-09-0' + (1 + (n % 8)) + 'T08:00:00Z',
        seq:n++, actor:'debbie', type, payload });
      const st = C.foldEvents([
        ev('company.created', { companyId:'c1', name:'Nedbank' }),
        ev('deal.created', { dealId:'d1', companyId:'c1', name:'Two rates', owner:'debbie',
                             stage:'won', commissionRate:0.2 }),
        ev('invoice.raised', { invoiceId:'i1', dealId:'d1', number:'INV1', issuedOn:'2026-08-01',
                               dueDate:'2026-08-31', currency:'ZAR', vat:1500, net:10000,
                               lines:[{ description:'Training', net:6000, passThrough:0 },
                                      { description:'Exams', net:4000, passThrough:0, commissionRate:0.1 }] }),
        ev('creditnote.issued', { creditNoteId:'cn1', dealId:'d1', number:'CRN1', issuedOn:'2026-08-10',
                                  currency:'ZAR', net:1000, vat:150, againstInvoiceId:'i1' })
      ], cfg, '2026-10-01');
      const s = C.invoiceState(st, st.invoices.i1);
      const cm = C.invoiceCommission(st.deals.d1, st.invoices.i1, s);
      return { bases: cm.parts.map(p => p.base), total: cm.total };
    });
    ok(lines.bases.join(',') === '5400,3600',
       'the credit comes off each line in proportion to its NET, not its VAT-inclusive share',
       lines.bases.join(','));
    ok(lines.total === 1440, '…6,000→5,400 at 20% plus 4,000→3,600 at 10%', String(lines.total));

    describe(vp.tag + ' — the screen shows its working, so Finance can check it');
    const screen = await page.evaluate(async () => {
      const A = window.CRMApp.App, E = window.CRMApp.emit;
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      A.lens = null; A.scope = 'team'; A.events = []; A.seq = 0;
      E('company.created', { companyId:'c1', name:'Nedbank' });
      E('deal.created', { dealId:'d1', companyId:'c1', name:'CDMP cohort', owner:A.me,
                          stage:'won', commissionRate:0.2 });
      E('invoice.raised', { invoiceId:'i1', dealId:'d1', number:'INV1', issuedOn:'2026-08-01',
                            dueDate:'2026-08-31', currency:'ZAR', net:10000, vat:1500, passThrough:0 });
      E('payment.received', { paymentId:'p1', invoiceId:'i1', amount:11500, receivedOn:'2026-08-20' });
      /* one with no VAT at all — the data smell that WOULD pay commission on VAT */
      E('deal.created', { dealId:'d2', companyId:'c1', name:'Export job', owner:A.me,
                          stage:'won', commissionRate:0.2 });
      E('invoice.raised', { invoiceId:'i2', dealId:'d2', number:'INV2', issuedOn:'2026-08-01',
                            dueDate:'2026-08-31', currency:'ZAR', net:5750, vat:0, passThrough:0 });
      window.CRMApp.refold();
      A.view = 'money'; window.CRMApp.render();
      await new Promise(r => setTimeout(r, 400));
      const panes = Array.from(document.querySelectorAll('#content section'));
      const work = panes.find(x => /How every commission figure is made up/.test(
        ((x.querySelector('h3') || {}).textContent || '')));
      const txt = work ? work.textContent.replace(/[   ]/g, ' ') : '';
      const heads = work ? Array.from(work.querySelectorAll('thead th')).map(x => x.textContent) : [];
      const rows = work ? Array.from(work.querySelectorAll('tbody tr')).map(tr =>
        Array.from(tr.querySelectorAll('td')).map(td =>
          td.textContent.replace(/[   ]/g, ' ').trim())) : [];
      const sub = (panes.find(x => /^Commission/.test(((x.querySelector('h3') || {}).textContent || ''))) || {})
        .textContent || '';
      return { heads, rows, txt, sub: sub.replace(/\s+/g, ' ') };
    });
    ok(/Net\|VAT\|Resale\|Credited\|Base\|Rate\|Commission/.test(screen.heads.join('|')),
       'the breakdown names every term of the calculation', screen.heads.join(' | '));
    const inv1 = screen.rows.find(r => /INV1/.test(r[0] || ''));
    ok(!!inv1, 'the settled invoice is listed', JSON.stringify(screen.rows));
    if (inv1){
      ok(/10 000/.test(inv1[2]) && /1 500/.test(inv1[3]), 'with its net and its VAT side by side', inv1.join(' | '));
      ok(/\(out\)/.test(inv1[3]), '…the VAT marked as being out of the calculation', inv1[3]);
      ok(/10 000/.test(inv1[6]) && /2 000/.test(inv1[8]),
         'base R10,000, commission R2,000 — the answer to the question, on screen', inv1.join(' | '));
    }
    ok(/VAT left out of commission altogether/.test(screen.txt) && /R 1 500/.test(screen.txt),
       'and the VAT nobody earned on is totalled', screen.txt.slice(-400));
    ok(/The base is the invoice NET/.test(screen.sub), 'the heading says what the base is', screen.sub.slice(0, 200));
    ok(/carries no VAT at all/.test(screen.txt) && /INV2/.test(screen.txt),
       'an invoice with no VAT is flagged, because that is how VAT reaches a commission through the DATA',
       screen.txt.slice(-500));

    describe(vp.tag + ' — the Rene du Bruyn case: a VAT-inclusive amount in the net box');
    const rene = await page.evaluate(async () => {
      const C = window.CRMCore, A = window.CRMApp.App, E = window.CRMApp.emit;
      /* the split itself, as pure arithmetic */
      const sp = C.splitVatInclusive(14905, 0.15);

      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      A.lens = null; A.scope = 'team'; A.events = []; A.seq = 0;
      E('company.created', { companyId:'ind', name:'Individual', isHolder:true });
      E('contact.created', { contactId:'rene', companyId:'ind', name:'Rene du Bruyn',
                             email:'renedubruyn@gmail.com' });
      E('deal.created', { dealId:'dr', companyId:'ind', name:'CDMP Fundamentals - Rene du Bruyn',
                          owner:A.me, stage:'proposal', contactId:'rene' });
      E('deal.closed', { dealId:'dr', outcome:'won' });
      /* exactly as it stands today: the gross typed as the net, no VAT */
      E('invoice.raised', { invoiceId:'ir', dealId:'dr', number:'INV0001547', issuedOn:'2026-09-11',
                            dueDate:'2026-09-30', currency:'ZAR', net:14905, vat:0, passThrough:0,
                            commissionRate:0.2 });
      E('payment.received', { paymentId:'pr', invoiceId:'ir', amount:14905, receivedOn:'2026-09-20' });
      window.CRMApp.refold();
      window.CRMApp.openDeal('dr');
      await new Promise(r => setTimeout(r, 400));
      const before = (document.querySelector('.panel') || {}).textContent || '';

      /* open the invoice's Edit and use the split */
      const edit = Array.from(document.querySelectorAll('.panel button, .panel a'))
        .filter(x => x.textContent.trim() === 'Edit').pop();
      if (!edit) return { fail:'no Edit on the invoice row' };
      edit.click();
      await new Promise(r => setTimeout(r, 300));
      const hint = document.querySelector('.vat-hint');
      const hintText = (hint ? hint.textContent : '').replace(/[\u00a0\u202f\u2009]/g, ' ');
      const row = document.querySelector('.vat-split');
      const shown = row && row.style.display !== 'none';
      const btn = Array.from(document.querySelectorAll('.pop button'))
        .find(x => x.textContent.trim() === 'Split it');
      if (!btn) return { fail:'no Split it button' };
      btn.click();
      await new Promise(r => setTimeout(r, 200));
      const netv = document.querySelector('input[aria-label="Net"]').value;
      const vatv = document.querySelector('input[aria-label="VAT"]').value;
      const stillShown = document.querySelector('.vat-split').style.display !== 'none';
      Array.from(document.querySelectorAll('.pop button'))
        .find(x => /^(Save|Raise)/.test(x.textContent.trim())).click();
      await new Promise(r => setTimeout(r, 350));
      const st = A.st, inv = st.invoices.ir;
      const s2 = C.invoiceState(st, inv);
      const cm = C.invoiceCommission(st.deals.dr, inv, s2);
      window.CRMApp.openDeal('dr');
      await new Promise(r => setTimeout(r, 350));
      const after = (document.querySelector('.panel') || {}).textContent || '';
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      return { sp, before: before.replace(/[\u00a0\u202f\u2009]/g, ' '), hintText, shown,
               netv, vatv, stillShown,
               after: after.replace(/[\u00a0\u202f\u2009]/g, ' '),
               net:inv.net, vat:inv.vat, gross:s2.gross, base:s2.commissionBase,
               balance:s2.balance, settled:s2.settled, com:cm.total };
    });
    ok(rene.sp && rene.sp.net === 12960.87 && rene.sp.vat === 1944.13,
       'R14,905 including VAT is R12,960.87 of work plus R1,944.13', JSON.stringify(rene.sp));
    ok(!rene.fail, 'the invoice can be edited from the deal panel', rene.fail);
    if (!rene.fail){
      ok(/no VAT recorded/.test(rene.before),
         'as it stands, the deal panel says the base may be too high', rene.before.slice(-600));
      ok(/20% of R 14 905/.test(rene.before),
         '…and names the base the 20% was taken of — R14,905, the VAT-inclusive amount',
         rene.before.slice(-600));
      ok(rene.shown && /already INCLUDES VAT/.test(rene.hintText),
         'the Edit dialog offers the split, with the numbers', rene.hintText.slice(0, 260));
      ok(/R 2 592\.17/.test(rene.hintText) && /R 2 981/.test(rene.hintText),
         '…saying what the commission should be and what it currently is', rene.hintText);
      ok(rene.netv === '12960.87' && rene.vatv === '1944.13', 'pressing Split fills both boxes',
         rene.netv + ' / ' + rene.vatv);
      ok(!rene.stillShown, '…and the warning goes once there is VAT on it');
      ok(rene.net === 12960.87 && rene.vat === 1944.13, 'saving keeps the split', rene.net + '/' + rene.vat);
      ok(rene.gross === 14905 && rene.balance === 0 && rene.settled,
         'the customer still owes exactly R14,905, and it is still settled',
         rene.gross + '/' + rene.balance);
      ok(rene.base === 12960.87 && rene.com === 2592.17,
         'the commission is now R2,592.17 — R388.83 less than before', rene.base + '/' + rene.com);
      ok(/20% of R 12 960\.87/.test(rene.after) && !/no VAT recorded/.test(rene.after),
         'and the panel says what the 20% is of', rene.after.slice(-600));
    }

    describe(vp.tag + ' — no page errors');
    ok(!errs.length, 'nothing threw', errs.join(' | '));
    await page.close();
  }
  await b.close();
  console.log('\n' + '─'.repeat(58));
  console.log(fail ? '\x1b[31m\x1b[1m' + pass + ' passed, ' + fail + ' FAILED.\x1b[0m' : '\x1b[32m\x1b[1m' + pass + ' passed, 0 failed.\x1b[0m');
  if (fail){ console.log('\nFailures:'); fails.forEach(f => console.log('  • ' + f)); process.exit(1); }
})();
