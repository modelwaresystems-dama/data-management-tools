/* "I need to have functionality to merge 2 deals that are 1." (Howard, 6 Oct 2026.)

   The case on screen was Wakamoso: two WON deals — "Ethical Assessment
   Framework" at R23,000 with NO INVOICE LOGGED, and "Low-bono consulting -
   20 days" at R23,500 — giving Won-by-deal-value R46,500 against R27,025
   actually invoiced, plus the line "Not counted above: 1 won deal with no
   invoice logged".

   Folding already existed (1.50.0) and already did the right thing. The control
   was built inside `if (d.status === "open")`, so the one case where the
   arithmetic visibly lies could not reach it. This test holds that open:
   folding is offered on a closed deal, it says what it will do to the tallies
   BEFORE the press, it never sums the two values on its own initiative, and it
   still undoes cleanly. */
const { chromium } = require('playwright');
const path = require('path');
let pass = 0, fail = 0; const fails = [];
const ok = (c, m, extra) => { if (c){ pass++; console.log('  \x1b[32m✓\x1b[0m ' + m); }
  else { fail++; fails.push(m); console.log('  \x1b[31m✗ ' + m + '\x1b[0m' + (extra ? '  [' + String(extra).slice(0, 500) + ']' : '')); } };
const describe = t => console.log('\n\x1b[1m' + t + '\x1b[0m');

(async () => {
  const file = path.resolve(process.argv[2] || 'crm.html');
  const b = await chromium.launch(require('./browser.js'));
  for (const vp of [{ tag:'desktop', width:1440, height:950 }, { tag:'phone', width:390, height:844 }]){
    const page = await b.newPage({ viewport:{ width:vp.width, height:vp.height } });
    const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.goto('file://' + file); await page.waitForTimeout(900);

    /* Wakamoso as the screenshot showed it. Dates are relative to the app's own
       `today` so this test does not start failing on a calendar boundary. */
    const seed = () => page.evaluate(() => {
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      try { localStorage.removeItem('crm.settings.shut'); localStorage.removeItem('crm.cos.open'); } catch (e){}
      const A = window.CRMApp.App, E = window.CRMApp.emit, C = window.CRMCore;
      A.lens = null; A.scope = 'team'; A.workspace = 'team'; A.events = []; A.seq = 0;
      const d = n => C.addDays(A.today, n);
      E('company.created', { companyId:'wak', name:'Wakamoso', domain:'wakamoso.africa' });
      /* the engagement that was actually invoiced */
      E('deal.created', { dealId:'lowbono', companyId:'wak', name:'Low-bono consulting - 20 days',
                          owner:A.me, stage:'proposal', value:23500, currency:'ZAR' });
      E('invoice.raised', { invoiceId:'i1', dealId:'lowbono', number:'INV0001601',
                            issuedOn:d(-40), dueDate:d(-10), currency:'ZAR',
                            net:23500, vat:3525 });
      E('payment.received', { paymentId:'pm1', invoiceId:'i1', amount:27025,
                              currency:'ZAR', receivedOn:d(-5) });
      E('deal.closed', { dealId:'lowbono', outcome:'won' });
      /* the same engagement, logged twice */
      E('deal.created', { dealId:'ethical', companyId:'wak', name:'Ethical Assessment Framework',
                          owner:A.me, stage:'proposal', value:23000, currency:'ZAR' });
      E('interaction.logged', { interactionId:'x1', subjectType:'deal', subjectId:'ethical',
                                kind:'meeting', occurredAt:d(-50),
                                summary:'Scoped the assessment framework with Wakamoso.' });
      E('quote.issued', { quoteId:'q1', dealId:'ethical', number:'QUO0001188',
                          amount:23000, currency:'ZAR', issuedOn:d(-48) });
      E('deal.closed', { dealId:'ethical', outcome:'won' });
      window.CRMApp.refold();
    });

    describe(vp.tag + ' — the company card shows the double count, and offers the fix');
    await seed();
    const card = await page.evaluate(async () => {
      const A = window.CRMApp.App, C = window.CRMCore;
      const sum = C.companySummary(A.st, A.config, 'wak', A.today);
      A.view = 'companies'; window.CRMApp.render();
      await new Promise(r => setTimeout(r, 400));
      const head = Array.from(document.querySelectorAll('#content .co-head'))
        .find(x => /Wakamoso/.test(x.textContent));
      if (!head) return { fail:'no Wakamoso card' };
      head.click();
      await new Promise(r => setTimeout(r, 300));
      const sec = head.parentNode;
      const txt = sec.textContent.replace(/\s+/g, ' ');
      const folds = Array.from(sec.querySelectorAll('a')).filter(a => /^fold/.test(a.textContent));
      return { wonValue: sum.wonValue, invoiced: sum.invoiced, received: sum.received,
               wonNoInvoice: sum.wonNoInvoice, won: sum.deals.won,
               txt, folds: folds.length };
    });
    ok(!card.fail, 'the Wakamoso card opens', card.fail);
    if (!card.fail){
      ok(card.wonValue.ZAR === 46500, 'won-by-deal-value double counts the engagement at first',
         JSON.stringify(card.wonValue));
      ok(card.received.ZAR === 27025, '…against R27,025 actually received', JSON.stringify(card.received));
      ok(card.wonNoInvoice === 1, '…and one won deal has no invoice logged', String(card.wonNoInvoice));
      ok(/1 won deal with no invoice logged/.test(card.txt),
         '…which the card says out loud rather than leaving out of a total', card.txt.slice(0, 300));
      ok(card.folds === 2, 'each deal row offers "fold…" where the duplicate is spotted', String(card.folds));
    }

    describe(vp.tag + ' — a WON deal is offered the fold at all');
    const prompt = await page.evaluate(async () => {
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      window.CRMApp.openDeal('ethical');
      await new Promise(r => setTimeout(r, 400));
      const btns = Array.from(document.querySelectorAll('.panel button')).map(x => x.textContent.trim());
      const btn = Array.from(document.querySelectorAll('.panel button'))
        .find(x => /Fold into/.test(x.textContent));
      if (!btn) return { fail:'no "Fold into…" on a won deal', btns };
      btn.click();
      await new Promise(r => setTimeout(r, 300));
      const sel = document.querySelector('select[aria-label="Fold into which deal"]');
      if (!sel) return { fail:'no deal picker' };
      const opts = Array.from(sel.querySelectorAll('option')).map(o => o.textContent);
      sel.value = 'lowbono'; sel.dispatchEvent(new Event('change'));
      await new Promise(r => setTimeout(r, 150));
      const pop = document.querySelector('.pop');
      const says = pop.textContent.replace(/\s+/g, ' ');
      /* fmtMoney renders "R 23 000", so amounts are matched against a
         whitespace-stripped copy rather than against a guess at the spacing. */
      const tight = pop.textContent.replace(/[\s\u00a0]+/g, '');
      const cb = pop.querySelector('input[type="checkbox"]');
      return { btns, opts, says, tight, hasBox: !!cb, boxChecked: cb ? cb.checked : null,
               boxShown: cb ? (cb.parentNode.style.display !== 'none') : null };
    });
    ok(!prompt.fail, 'a won deal offers "Fold into…"', (prompt.fail || '') + ' ' + (prompt.btns || []).join(','));
    if (!prompt.fail){
      ok(/Reopen/.test(prompt.btns.join(',')),
         '…beside Reopen, not instead of it', prompt.btns.join(','));
      ok(prompt.opts.some(t => /Low-bono consulting/.test(t) && /\(won\)/.test(t)),
         'the other won deal is offered, and labelled won', prompt.opts.join(' | '));
      ok(/stops counting as a deal of its own/.test(prompt.says) &&
         /win tally/.test(prompt.says),
         'the dialog says what folding a closed deal costs the tallies', prompt.says.slice(0, 400));
      ok(/Two wins become one/.test(prompt.says),
         '…naming the actual consequence: two wins become one', prompt.says.slice(0, 500));
      ok(/dropsbyR23000/.test(prompt.tight) && /leavingR23500/.test(prompt.tight),
         '…and what won-by-deal-value becomes', prompt.says.slice(0, 600));
      ok(prompt.hasBox && prompt.boxShown && prompt.boxChecked === false,
         'adding the two values together is OFFERED, and off by default',
         JSON.stringify({ has:prompt.hasBox, shown:prompt.boxShown, checked:prompt.boxChecked }));
      ok(/makingitR46500/.test(prompt.tight),
         '…saying exactly what ticking it would make the value', prompt.says.slice(0, 700));
    }

    describe(vp.tag + ' — folding it, without inventing a number');
    const after = await page.evaluate(async () => {
      const btn = Array.from(document.querySelectorAll('.pop button')).find(x => /Fold it in/.test(x.textContent));
      if (!btn) return { fail:'no confirm button' };
      btn.click();
      await new Promise(r => setTimeout(r, 500));
      const A = window.CRMApp.App, C = window.CRMCore, st = A.st;
      const sum = C.companySummary(A.st, A.config, 'wak', A.today);
      const panel = (document.querySelector('.panel') || {}).textContent || '';
      return { gone: !st.deals.ethical, inMerged: !!(st.mergedDeals && st.mergedDeals.ethical),
               outcome: (st.mergedDeals.ethical || {}).outcome,
               value: st.deals.lowbono ? st.deals.lowbono.value : null,
               wonValue: sum.wonValue, won: sum.deals.won, wonNoInvoice: sum.wonNoInvoice,
               received: sum.received,
               ix: C.interactionsFor(st, 'lowbono').map(x => x.id).sort().join(','),
               quotes: C.quotesFor(st, 'lowbono').map(q => q.id).join(','),
               live: C.liveDeal(st, 'ethical'),
               panel: panel.replace(/\s+/g, ' '),
               tight: panel.replace(/[\s\u00a0]+/g, '') };
    });
    ok(!after.fail, 'it can be confirmed', after.fail);
    if (!after.fail){
      ok(after.gone && after.inMerged, 'the duplicate stops being a deal, without being deleted',
         JSON.stringify({ gone:after.gone, inMerged:after.inMerged }));
      ok(after.outcome === 'won',
         '…and its own Won is not rewritten — the mark is all that changed', String(after.outcome));
      ok(after.won === 1 && after.wonValue.ZAR === 23500,
         'one win, R23,500 — the double count is gone',
         JSON.stringify({ won:after.won, v:after.wonValue }));
      ok(after.value === 23500,
         'the receiving deal’s value was NOT silently summed', String(after.value));
      ok(after.wonNoInvoice === 0,
         'and "1 won deal with no invoice logged" resolves, because there is no such deal any more',
         String(after.wonNoInvoice));
      ok(after.received.ZAR === 27025, 'what was actually received is untouched', JSON.stringify(after.received));
      ok(after.ix === 'x1' && after.quotes === 'q1',
         'the logged meeting and the quote travelled across', after.ix + ' / ' + after.quotes);
      ok(after.live === 'lowbono', 'the old id resolves to where the work went', after.live);
      ok(/wascarriedatR23000\(won\)/.test(after.tight),
         'the receiving deal records what the folded one was carrying', after.panel.slice(0, 900));
    }

    describe(vp.tag + ' — the sum is one press away, and only if asked');
    const summed = await page.evaluate(async () => {
      const A = window.CRMApp.App;
      const link = Array.from(document.querySelectorAll('.panel .folded-in a'))
        .find(x => /^makeit/.test(x.textContent.replace(/[\s\u00a0]+/g, '')));
      if (!link) return { fail:'no "make it R46 500" on the folded-in line' };
      link.click();
      await new Promise(r => setTimeout(r, 450));
      return { value: A.st.deals.lowbono.value };
    });
    ok(!summed.fail, 'the combined figure is offered on the deal afterwards too', summed.fail);
    if (!summed.fail) ok(summed.value === 46500, '…and setting it works', String(summed.value));

    describe(vp.tag + ' — undo puts both the fold and the value back');
    const undone = await page.evaluate(async () => {
      const A = window.CRMApp.App, C = window.CRMCore;
      /* re-fold from scratch with the box ticked, so Undo has a value to restore */
      window.CRMApp.unfoldDeal('ethical');
      await new Promise(r => setTimeout(r, 300));
      window.CRMApp.emit('deal.updated', { dealId:'lowbono', value:23500 });
      window.CRMApp.refold();
      /* Toasts stack, and an earlier fold's Undo is still on screen carrying its
         own closure. Clear them, or the test presses the wrong one and proves
         nothing. */
      const box = document.querySelector('#toasts');
      if (box) box.textContent = '';
      window.CRMApp.foldDeal(A.st.deals.ethical, 'lowbono', 'same engagement', 46500);
      await new Promise(r => setTimeout(r, 450));
      const mid = A.st.deals.lowbono.value;
      const undo = Array.from(document.querySelectorAll('#toasts button'))
        .filter(x => /^Undo$/.test(x.textContent.trim())).pop();
      if (!undo) return { fail:'no Undo on the toast', mid };
      undo.click();
      await new Promise(r => setTimeout(r, 500));
      return { mid, back: !!A.st.deals.ethical, value: A.st.deals.lowbono.value,
               won: C.companySummary(A.st, A.config, 'wak', A.today).deals.won };
    });
    ok(!undone.fail, 'folding with the value ticked offers Undo', undone.fail);
    if (!undone.fail){
      ok(undone.mid === 46500, 'ticking the box does change the value', String(undone.mid));
      ok(undone.back, 'Undo brings the deal back');
      ok(undone.value === 23500, '…and puts the value back exactly as it was', String(undone.value));
      ok(undone.won === 2, '…so both wins count again', String(undone.won));
    }

    describe(vp.tag + ' — a won deal folded into a LOST one says so first');
    const mixed = await page.evaluate(() => {
      const A = window.CRMApp.App, C = window.CRMCore;
      window.CRMApp.emit('deal.closed', { dealId:'lowbono', outcome:'lost', reason:'Budget cut' });
      window.CRMApp.refold();
      const im = C.foldImpact(A.st, A.config, 'ethical', 'lowbono');
      const open = C.foldImpact(A.st, A.config, 'lowbono', 'ethical');
      return { changes: im.outcomeChanges, after: im.afterOutcome,
               fromO: im.fromOutcome, drops: im.wonValueDrops,
               lostDrops: open.wonValueDrops,
               self: C.foldImpact(A.st, A.config, 'ethical', 'ethical') };
    });
    ok(mixed.changes === true && mixed.after === 'lost',
       'folding a won deal into a lost one is flagged as changing the outcome', JSON.stringify(mixed));
    ok(mixed.drops === 23000, '…and names the won value that disappears', String(mixed.drops));
    ok(mixed.lostDrops === 0, 'folding a LOST deal away takes nothing off the won total', String(mixed.lostDrops));
    ok(mixed.self === null, 'a deal cannot be folded into itself', JSON.stringify(mixed.self));

    ok(errs.length === 0, 'no page errors', errs.join(' | '));
    await page.close();
  }
  await b.close();
  console.log('\n' + (fail ? '\x1b[31m' : '\x1b[32m') + pass + ' passed, ' + fail + ' failed\x1b[0m');
  if (fail){ console.log(fails.map(f => '  - ' + f).join('\n')); process.exit(1); }
})();
