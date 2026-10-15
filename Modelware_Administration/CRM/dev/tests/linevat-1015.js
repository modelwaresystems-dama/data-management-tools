/* "The VAT is not calculating properly when I add the Invoice Line. We need to
   be able to set the VAT % on the line and the total VAT should be the VAT on
   all the lines." (Howard, 15 Oct 2026.)

   The shape he hit: an invoice billing two things — a course and a book — and
   one VAT box for the pair. Adding a line moved the net to follow the lines and
   left the VAT sitting at a figure that now belonged to nothing, with no way to
   say that the course is standard-rated and the book, shipped as an export, is
   zero-rated.

   F6b gives a line its own VAT rate on the same line → invoice → nothing ladder
   commission already uses, and makes the invoice's VAT the sum of the lines
   whenever anything carries a rate. Blank is not 0% (C23), and every invoice
   raised before this build must go on folding to exactly the same numbers. */
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

    /* ------------------------------------------------------------------ core */
    describe(vp.tag + ' — the arithmetic, with nothing on screen');
    const core = await page.evaluate(() => {
      const C = window.CRMCore, cfg = window.CRMApp.App.config;
      let n = 0;
      const ev = (type, payload) => ({ id:'e'+n, ts:'2026-10-1' + (n % 9) + 'T08:00:00Z',
                                       seq:n++, actor:'howard', type, payload });
      /* One invoice, two things on it: the course, and the book we ship. */
      const LINES = rates => ([
        { description:'DMC course', net:40000, passThrough:0,
          vatRate: rates[0], commissionRate:0.2 },
        { description:'DMBOK', net:4890, passThrough:4890,
          vatRate: rates[1], commissionRate:0 }
      ]);
      const build = (extra, rates) => {
        const base = [
          ev('company.created', { companyId:'sb', name:'Standard Bank' }),
          ev('deal.created', { dealId:'d1', companyId:'sb', name:'DAMA exam completions',
                               owner:'debbie', stage:'proposal', value:44890, currency:'ZAR',
                               commissionRate:0.2 }),
          ev('invoice.raised', Object.assign({
            invoiceId:'i1', dealId:'d1', number:'INV0001560', issuedOn:'2026-10-14',
            currency:'ZAR', lines:LINES(rates) }, extra))
        ];
        return C.foldEvents(base, cfg, '2026-10-15');
      };
      const look = st => {
        const inv = st.invoices.i1, s = C.invoiceState(st, inv);
        return { carries: C.linesCarryVat(inv), vat: C.invoiceVat(inv),
                 stateVat: s.vat, gross: s.gross, net: s.net,
                 fromLines: s.vatFromLines, missing: s.vatMissing.length,
                 mismatch: s.vatMismatch, base: s.commissionBase,
                 parts: C.invoiceVatParts(inv).map(p => [p.rate, p.from, p.vat]) };
      };
      return {
        /* 1. nothing carries a rate: exactly as it has always folded */
        old:   look(build({ vat:5795.56 }, [null, null])),
        /* 2. one rate on the invoice, inherited by both lines */
        inv15: look(build({ vatRate:0.15 }, [null, null])),
        /* 3. the book zero-rated on the line, overriding the invoice */
        mixed: look(build({ vatRate:0.15 }, [null, 0])),
        /* 4. the course rated, the book left blank — blank is not 0% */
        blank: look(build({}, [0.15, null])),
        /* 5. a stored VAT that disagrees with the rates */
        clash: look(build({ vat:999, vatRate:0.15 }, [null, null])),
        /* 6. the gross is what the customer owes, and a payment of it settles */
        settles: (function (){
          const st = build({ vatRate:0.15 }, [null, 0]);
          const s = C.invoiceState(st, st.invoices.i1);
          const st2 = C.foldEvents([
            ev('company.created', { companyId:'sb', name:'Standard Bank' }),
            ev('deal.created', { dealId:'d1', companyId:'sb', name:'DAMA exam completions',
                                 owner:'debbie', stage:'proposal', commissionRate:0.2 }),
            ev('invoice.raised', { invoiceId:'i1', dealId:'d1', number:'INV0001560',
                                   issuedOn:'2026-10-14', currency:'ZAR', vatRate:0.15,
                                   lines:LINES([null, 0]) }),
            ev('payment.received', { paymentId:'p1', invoiceId:'i1', amount:s.gross,
                                     currency:'ZAR', receivedOn:'2026-10-15' })
          ], cfg, '2026-10-15');
          const s2 = C.invoiceState(st2, st2.invoices.i1);
          return { gross:s2.gross, balance:s2.balance, settled:s2.settled };
        })()
      };
    });

    ok(core.old.carries === false && core.old.vat === 5795.56 && core.old.gross === 50685.56,
       'an invoice with lines and no rates folds exactly as it always did', JSON.stringify(core.old));
    ok(core.old.parts.length === 0, '…and offers no per-line VAT to read', JSON.stringify(core.old.parts));

    ok(core.inv15.carries === true && core.inv15.vat === 6733.5,
       'one rate on the invoice: VAT is the sum of the lines, 6000 + 733.50',
       JSON.stringify(core.inv15));
    ok(core.inv15.parts[0][1] === 'invoice' && core.inv15.parts[1][1] === 'invoice',
       '…and each line says the rate came from the invoice', JSON.stringify(core.inv15.parts));
    ok(core.inv15.gross === 51623.5, '…the customer owes net plus that VAT', String(core.inv15.gross));

    ok(core.mixed.vat === 6000 && core.mixed.parts[1][0] === 0 && core.mixed.parts[1][1] === 'line',
       'a line can be zero-rated against the invoice — the book shipped as an export',
       JSON.stringify(core.mixed));
    ok(core.mixed.missing === 0,
       '…and 0% is a decision, so nothing is flagged as unrated', String(core.mixed.missing));

    ok(core.blank.vat === 6000 && core.blank.missing === 1,
       'a line with no rate anywhere adds nothing AND is counted as unrated',
       JSON.stringify(core.blank));
    ok(core.blank.parts[1][0] === null,
       '…blank is not 0%: it is reported as no rate at all', JSON.stringify(core.blank.parts));

    ok(core.clash.mismatch && core.clash.mismatch.stated === 999 &&
       core.clash.mismatch.fromLines === 6733.5,
       'a stored VAT that disagrees with the lines is surfaced, not resolved quietly',
       JSON.stringify(core.clash.mismatch));
    ok(core.clash.vat === 6733.5, '…and the lines are the ones used', String(core.clash.vat));

    ok(core.inv15.base === 40000 && core.mixed.base === 40000 && core.old.base === 40000,
       'VAT never reaches the commission base, whichever way it is worked out (C21)',
       [core.old.base, core.inv15.base, core.mixed.base].join(' / '));

    ok(core.settles.balance === 0 && core.settles.settled === true,
       'a payment of the gross settles the invoice', JSON.stringify(core.settles));

    /* ------------------------------------------------------------- the dialog */
    describe(vp.tag + ' — adding a line, which is where it went wrong');
    const seed = () => page.evaluate(() => {
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      const A = window.CRMApp.App, E = window.CRMApp.emit;
      A.lens = null; A.scope = 'team'; A.workspace = 'team'; A.events = []; A.seq = 0;
      E('company.created', { companyId:'sb', name:'Standard Bank' });
      E('deal.created', { dealId:'d1', companyId:'sb', name:'DAMA exam completions',
                          owner:A.me, stage:'proposal', value:44890, currency:'ZAR',
                          commissionRate:0.2 });
      E('invoice.raised', { invoiceId:'i1', dealId:'d1', number:'INV0001560',
                            issuedOn:'2026-10-14', currency:'ZAR',
                            net:44890, passThrough:0, vat:0 });
      window.CRMApp.refold();
    });
    await seed();

    const dialog = await page.evaluate(async () => {
      window.CRMApp.openDeal('d1');
      await new Promise(r => setTimeout(r, 400));
      const edit = Array.from(document.querySelectorAll('.panel a, .panel button'))
        .find(x => /^edit$/i.test(x.textContent.trim()) && x.closest('td'));
      /* the invoice row's own edit control, wherever it sits */
      const anyEdit = edit || Array.from(document.querySelectorAll('.panel a'))
        .find(x => /edit/i.test(x.textContent));
      if (!anyEdit) return { fail:'no way to edit the invoice from the panel' };
      anyEdit.click();
      await new Promise(r => setTimeout(r, 350));
      const pop = document.querySelector('.pop');
      if (!pop || !/EDIT INVOICE|Edit invoice/i.test(pop.textContent))
        return { fail:'the invoice editor did not open' };
      const vatBox  = pop.querySelector('input[aria-label="VAT"]');
      const rateBox = pop.querySelector('input[aria-label="VAT rate %"]');
      if (!rateBox) return { fail:'no invoice-level "VAT % on this invoice" field' };
      const beforeDisabled = vatBox.disabled;

      /* the no-VAT warning, with a single net and no lines */
      const warnedBefore = /No VAT on this invoice/.test(pop.textContent);

      const add = Array.from(pop.querySelectorAll('button')).find(x => /Add a line/.test(x.textContent));
      add.click(); await new Promise(r => setTimeout(r, 120));
      add.click(); await new Promise(r => setTimeout(r, 120));
      const lvat = pop.querySelectorAll('input[aria-label$="VAT %"]');
      if (lvat.length !== 2) return { fail:'each line did not get its own VAT % box, found ' + lvat.length };

      const type = (el, v) => { el.value = v; el.dispatchEvent(new Event('input')); };
      const nets = pop.querySelectorAll('input[aria-label$="net"]');
      const thrus = pop.querySelectorAll('input[aria-label$="resale"]');
      const descs = pop.querySelectorAll('input[aria-label$="description"]');
      type(descs[0], 'DMC course'); type(nets[0], '40000');
      type(descs[1], 'DMBOK');      type(nets[1], '4890'); type(thrus[1], '4890');
      await new Promise(r => setTimeout(r, 120));
      /* no rate anywhere yet */
      const noRateYet = { vat: vatBox.value, disabled: vatBox.disabled,
                          says: pop.textContent.replace(/\s+/g, ' ') };

      /* set the invoice rate — both lines inherit it */
      type(rateBox, '15');
      await new Promise(r => setTimeout(r, 150));
      const inherited = { vat: vatBox.value, disabled: vatBox.disabled,
                          says: pop.textContent.replace(/\s+/g, ' ') };

      /* zero-rate the book on its own line */
      type(lvat[1], '0');
      await new Promise(r => setTimeout(r, 150));
      const zeroRated = { vat: vatBox.value, says: pop.textContent.replace(/\s+/g, ' ') };

      /* and blank the book's rate while clearing the invoice's, to prove blank ≠ 0 */
      type(lvat[1], ''); type(rateBox, ''); type(lvat[0], '15');
      await new Promise(r => setTimeout(r, 150));
      const blanked = { vat: vatBox.value, says: pop.textContent.replace(/\s+/g, ' ') };

      /* put it back the way an invoice would really be saved and save it */
      type(rateBox, '15'); type(lvat[0], ''); type(lvat[1], '0');
      await new Promise(r => setTimeout(r, 150));
      const save = Array.from(pop.querySelectorAll('button')).find(x => /^Save$/.test(x.textContent.trim()));
      save.click();
      await new Promise(r => setTimeout(r, 500));
      const inv = window.CRMApp.App.st.invoices.i1;
      const s = window.CRMCore.invoiceState(window.CRMApp.App.st, inv);
      const panel = (document.querySelector('.panel') || {}).textContent || '';
      return { beforeDisabled, warnedBefore, noRateYet, inherited, zeroRated, blanked,
               saved: { vatRate: inv.vatRate, vat: inv.vat, net: inv.net,
                        lineRates: inv.lines.map(l => l.vatRate),
                        gross: s.gross, fromLines: s.vatFromLines },
               panel: panel.replace(/\s+/g, ' '),
               tight: panel.replace(/[\s ]+/g, '') };
    });

    ok(!dialog.fail, 'the invoice editor opens', dialog.fail);
    if (!dialog.fail){
      ok(dialog.beforeDisabled === false,
         'with no lines the VAT box is still the one you type in', String(dialog.beforeDisabled));
      ok(dialog.warnedBefore,
         '…and a net with no VAT beside it is still called out', String(dialog.warnedBefore));

      ok(dialog.noRateYet.disabled === false && /No VAT rate on the invoice or on any line/.test(dialog.noRateYet.says),
         'lines with no rate leave the VAT box typed, and the dialog says why',
         dialog.noRateYet.says.slice(0, 300));
      ok(/No VAT on this invoice/.test(dialog.noRateYet.says),
         '…and the no-VAT warning now fires WITH lines, which is where it was silent before',
         dialog.noRateYet.says.slice(0, 300));

      ok(dialog.inherited.disabled === true && Number(dialog.inherited.vat) === 6733.5,
         'setting the invoice VAT % makes the box follow the lines: 6000 + 733.50',
         JSON.stringify(dialog.inherited.vat) + ' disabled=' + dialog.inherited.disabled);
      ok(/VAT is the sum of the lines below/.test(dialog.inherited.says),
         '…and says so, rather than leaving a number to be guessed at',
         dialog.inherited.says.slice(0, 300));
      ok(/DMC course .*VAT 15% from the invoice/.test(dialog.inherited.says),
         '…with the rate and its provenance on each line',
         dialog.inherited.says.slice(0, 600));

      ok(Number(dialog.zeroRated.vat) === 6000,
         'zero-rating the book on its own line drops the VAT to 6000', dialog.zeroRated.vat);
      ok(/DMBOK .*VAT 0% from the line/.test(dialog.zeroRated.says),
         '…and the line says the 0% is its own', dialog.zeroRated.says.slice(0, 600));

      ok(Number(dialog.blanked.vat) === 6000,
         'a blank line rate with no invoice rate adds nothing', dialog.blanked.vat);
      ok(/no VAT rate anywhere/.test(dialog.blanked.says) && /Blank is not 0%/.test(dialog.blanked.says),
         '…and is flagged as undecided rather than counted as zero',
         dialog.blanked.says.slice(0, 500));

      ok(dialog.saved.vatRate === 0.15 && JSON.stringify(dialog.saved.lineRates) === '[null,0]',
         'saving keeps the invoice rate and each line’s own', JSON.stringify(dialog.saved));
      ok(dialog.saved.vat === 6000 && dialog.saved.net === 44890 && dialog.saved.fromLines === true,
         '…and writes the derived VAT into the invoice as well', JSON.stringify(dialog.saved));
      ok(dialog.saved.gross === 50890, '…so the customer owes 50,890', String(dialog.saved.gross));
      ok(/44890net\+6000VAT\u2014workedoutperline/.test(dialog.tight.replace(/R/g, '')),
         'the invoice row says the split and that it was worked out per line',
         dialog.tight.replace(/R/g, '').slice(0, 1200));
    }

    describe(vp.tag + ' — and it comes back when the invoice is opened again');
    const reopened = await page.evaluate(async () => {
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      window.CRMApp.openDeal('d1');
      await new Promise(r => setTimeout(r, 400));
      const ed = Array.from(document.querySelectorAll('.panel a, .panel button'))
        .find(x => /^edit$/i.test(x.textContent.trim()) && x.closest('td'));
      if (!ed) return { fail:'no edit control on the invoice row' };
      ed.click();
      await new Promise(r => setTimeout(r, 350));
      const pop = document.querySelector('.pop');
      const rateBox = pop.querySelector('input[aria-label="VAT rate %"]');
      const lvat = Array.from(pop.querySelectorAll('input[aria-label$="VAT %"]'))
        .filter(x => /^Line /.test(x.getAttribute('aria-label')));
      return { rate: rateBox ? rateBox.value : null,
               lines: lvat.map(x => x.value),
               vat: pop.querySelector('input[aria-label="VAT"]').value,
               disabled: pop.querySelector('input[aria-label="VAT"]').disabled };
    });
    ok(!reopened.fail, 'the saved invoice opens again', reopened.fail);
    if (!reopened.fail){
      /* The regression this exists to catch: the field was built before its own
         input existed, so it rendered empty and the rate looked unset. */
      ok(reopened.rate === '15',
         'the invoice VAT % shows what was saved, not an empty box', JSON.stringify(reopened.rate));
      ok(JSON.stringify(reopened.lines) === '["","0"]',
         '…and each line shows its own rate, blank staying blank', JSON.stringify(reopened.lines));
      ok(Number(reopened.vat) === 6000 && reopened.disabled === true,
         '…with the VAT still derived', reopened.vat + ' disabled=' + reopened.disabled);
    }

    /* ----------------------------------------------------------- the importer */
    describe(vp.tag + ' — a batch can carry the rates, and cannot contradict itself');
    const imp = await page.evaluate(() => {
      const C = window.CRMCore, A = window.CRMApp.App;
      const run = iv => C.importTriage(JSON.stringify({ version:2, rows:[{
        dealId:'d1', kind:'email', occurredAt:'2026-10-15',
        summary:'Monica raised the invoice for the exam completions.',
        messageId:'<m-' + Math.random() + '@x>', invoices:[iv] }] }),
        A.st, A.config, { actor:'howard', today:'2026-10-15' });
      const good = run({ number:'INV0001601', currency:'ZAR', vatRate:0.15, lines:[
        { description:'DMC course', net:40000, commissionRate:0.2 },
        { description:'DMBOK', net:4890, passThrough:4890, vatRate:0, commissionRate:0 }] });
      const bad = run({ number:'INV0001602', currency:'ZAR', vatRate:0.15, vat:999, lines:[
        { description:'DMC course', net:40000, commissionRate:0.2 }] });
      const unknown = run({ number:'INV0001603', currency:'ZAR', lines:[
        { description:'DMC course', net:40000, vatPercent:15, commissionRate:0.2 }] });
      const gp = (good.events.find(e => /^invoice\./.test(e.type)) || {}).payload || {};
      /* the review table lives on the row's money block, which is what the
         import screen actually renders */
      const rec = (((good.money[0] || {}).records || {}).invoices || [])[0] || {};
      return { goodErr: good.errors.join(' | '), vat: gp.vat, rate: gp.vatRate, rec: rec,
               badErr: bad.errors.join(' | '), badEvents: bad.events.filter(e => /^invoice\./.test(e.type)).length,
               unknownErr: unknown.errors.join(' | ') };
    });
    ok(!imp.goodErr, 'a batch carrying vatRate on the invoice and the lines is accepted', imp.goodErr);
    ok(imp.rate === 0.15 && imp.vat === 6000,
       '…and imports with the VAT worked out from the lines', JSON.stringify({ r:imp.rate, v:imp.vat }));
    ok(imp.rec.vatFromLines === true && imp.rec.vat === 6000,
       '…and the review table says so before anything is written', JSON.stringify(imp.rec));
    ok(/VAT on the lines adds to 6000 but the invoice says 999/.test(imp.badErr) && imp.badEvents === 0,
       'a batch stating a VAT that the rates contradict is refused, not reconciled', imp.badErr);
    ok(/vatPercent/.test(imp.unknownErr),
       'and a misspelt field is still refused rather than silently dropped', imp.unknownErr);

    ok(errs.length === 0, 'no page errors', errs.join(' | '));
    await page.close();
  }
  await b.close();
  console.log('\n' + (fail ? '\x1b[31m' : '\x1b[32m') + pass + ' passed, ' + fail + ' failed\x1b[0m');
  if (fail){ console.log(fails.map(f => '  - ' + f).join('\n')); process.exit(1); }
})();
