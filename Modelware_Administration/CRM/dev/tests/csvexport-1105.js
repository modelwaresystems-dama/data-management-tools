/* "This CSV export of deals is including funny characters in the Invoiced,
   Paid, Outstanding, and Commission Columns. Please also add the Invoice
   Number, Quote Number, Receipt Number and VAT." (Howard, 5 Nov 2026.)

   The export was writing `fmtMoney` into those cells — the string the app
   DRAWS: "R", a no-break space (U+00A0), then digits grouped by narrow
   no-break spaces (U+202F). Excel opens a local .csv as the system codepage
   and ignores the blob's charset, so every one of those bytes came back as
   mojibake.

   The encoding is the smaller fault. A cell holding "R 53 658" is TEXT — it
   cannot be summed, filtered above a threshold, or charted, and an export
   exists to be added up. So the money columns carry bare numbers to the cent
   with the currency in a column of its own, the download gets a UTF-8 BOM so
   the words in every other column survive, and the documents behind the money
   are named by their own numbers. */
const { chromium } = require('playwright');
const path = require('path');
let pass = 0, fail = 0; const fails = [];
const ok = (c, m, extra) => { if (c){ pass++; console.log('  \x1b[32m✓\x1b[0m ' + m); }
  else { fail++; fails.push(m); console.log('  \x1b[31m✗ ' + m + '\x1b[0m' + (extra ? '  [' + String(extra).slice(0, 500) + ']' : '')); } };
const describe = t => console.log('\n\x1b[1m' + t + '\x1b[0m');

const HEAD = ['Deal id','Company','Deal','Stage','Owner','Value','Currency','Expected close',
  'Status','Next step','Next step due','Pushed','Last contact',
  'Quote number','Invoice number','Receipt number',
  'Money currency','Invoiced','VAT','Paid','Outstanding',
  'Commission %','Commission earned','Other currencies','Flags'];

(async () => {
  const file = path.resolve(process.argv[2] || 'crm.html');
  const b = await chromium.launch(require('./browser.js'));
  for (const vp of [{ tag:'desktop', width:1440, height:950 }, { tag:'phone', width:390, height:844 }]){
    const page = await b.newPage({ viewport:{ width:vp.width, height:vp.height } });
    const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.goto('file://' + file); await page.waitForTimeout(900);

    /* One customer, billed properly: a quote, two live invoices and a cancelled
       one, a payment carrying its remittance reference, VAT on the lines. */
    const seed = () => page.evaluate(() => {
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      const A = window.CRMApp.App, E = window.CRMApp.emit, C = window.CRMCore;
      A.lens = null; A.scope = 'team'; A.workspace = 'team'; A.events = []; A.seq = 0;
      const d = n => C.addDays(A.today, n);
      E('company.created', { companyId:'sb', name:'Standard Bank' });
      E('deal.created', { dealId:'d1', companyId:'sb', name:'CDMP Fundamentals',
                          owner:'thabo', stage:'proposal', value:40000, currency:'ZAR',
                          commissionRate:0.2 });
      E('quote.issued', { quoteId:'q1', dealId:'d1', number:'QUO0001188',
                          amount:40000, currency:'ZAR', issuedOn:d(-30) });
      E('quote.issued', { quoteId:'q0', dealId:'d1', number:'QUO0001100',
                          amount:38000, currency:'ZAR', issuedOn:d(-40),
                          status:'superseded' });
      E('invoice.raised', { invoiceId:'i1', dealId:'d1', number:'INV0001560',
                            issuedOn:d(-20), dueDate:d(10), currency:'ZAR',
                            vatRate:0.15, net:40000, vat:6000,
                            lines:[{ description:'DMC course', net:40000, commissionRate:0.2 }] });
      E('invoice.raised', { invoiceId:'i2', dealId:'d1', number:'INV0001561',
                            issuedOn:d(-10), dueDate:d(20), currency:'ZAR',
                            vatRate:0.15, net:10000, vat:1500,
                            lines:[{ description:'Exam vouchers', net:10000, commissionRate:0 }] });
      /* cancelled — history, not a reference anybody should quote back */
      E('invoice.raised', { invoiceId:'i3', dealId:'d1', number:'INV0001499',
                            issuedOn:d(-25), currency:'ZAR', net:999, vat:0 });
      E('invoice.cancelled', { invoiceId:'i3', reason:'raised in error' });
      E('payment.received', { paymentId:'p1', invoiceId:'i1', amount:46000,
                              currency:'ZAR', receivedOn:d(-2), reference:'EFT 889321' });
      E('payment.received', { paymentId:'p2', invoiceId:'i2', amount:1000,
                              currency:'ZAR', receivedOn:d(-1), reference:'' });
      E('deal.closed', { dealId:'d1', outcome:'won' });
      window.CRMApp.refold();
    });
    await seed();

    const grab = () => page.evaluate(() => {
      const A = window.CRMApp.App, C = window.CRMCore;
      const csv = C.exportCSV(A.st, A.config, A.today);
      const rows = C.parseCSV(csv);
      return { csv:csv, head:rows[0], row: rows.filter(r => r[0] === 'd1')[0] };
    });

    describe(vp.tag + ' — the funny characters are gone, because the numbers are numbers');
    const g = await grab();
    const col = name => g.row[HEAD.indexOf(name)];

    ok(!/[   ]/.test(g.csv),
       'no no-break or narrow spaces anywhere — the two characters that mojibake’d',
       JSON.stringify((g.csv.match(/[   ]/g) || []).slice(0, 5)));
    ok(!/R\s*\d/.test(col('Invoiced') + col('Paid') + col('Outstanding') + col('Commission earned')),
       'no currency symbol is glued to a figure',
       [col('Invoiced'), col('Paid'), col('Outstanding'), col('Commission earned')].join(' / '));
    ['Invoiced','VAT','Paid','Outstanding','Commission earned'].forEach(function (c){
      ok(/^\d+\.\d{2}$/.test(col(c)),
         c + ' is a bare number to the cent, so a spreadsheet can add it', c + ' = ' + col(c));
    });
    ok(col('Money currency') === 'ZAR',
       'and the currency is named in a column of its own', col('Money currency'));
    ok(col('Commission %') === '20',
       'the commission rate is a number too, not the text "20%"', col('Commission %'));

    describe(vp.tag + ' — the figures are right');
    ok(col('Invoiced') === '57500.00',
       'Invoiced is the gross of the live invoices: 46,000 + 11,500', col('Invoiced'));
    ok(col('VAT') === '7500.00',
       'VAT is their VAT: 6,000 + 1,500 — the part nobody earns on (C21)', col('VAT'));
    ok(col('Paid') === '47000.00', 'Paid is what arrived', col('Paid'));
    ok(col('Outstanding') === '10500.00', 'Outstanding is the rest', col('Outstanding'));
    ok(col('Commission earned') === '8000.00',
       'commission is 20% of the settled invoice’s NET, never of the VAT',
       col('Commission earned'));
    ok(col('Value') === '40000' && col('Currency') === 'ZAR',
       'the deal’s own value and currency are untouched', col('Value') + ' ' + col('Currency'));

    describe(vp.tag + ' — the documents behind the money, by their own numbers');
    ok(col('Quote number') === 'QUO0001188',
       'the live quote is named; the superseded one is not', col('Quote number'));
    ok(/INV0001560/.test(col('Invoice number')) && /INV0001561/.test(col('Invoice number')),
       'every live invoice is named', col('Invoice number'));
    ok(!/INV0001499/.test(col('Invoice number')),
       '…and the cancelled one is left out — it is history, not a reference',
       col('Invoice number'));
    ok(col('Receipt number') === 'EFT 889321',
       'the payment reference IS the receipt number, and a blank one is left blank',
       col('Receipt number'));

    describe(vp.tag + ' — the header says what each column is');
    ok(JSON.stringify(g.head) === JSON.stringify(HEAD),
       'the columns are exactly as documented, in order', JSON.stringify(g.head));

    describe(vp.tag + ' — two currencies on one deal are named, never added');
    const multi = await page.evaluate(() => {
      const A = window.CRMApp.App, E = window.CRMApp.emit, C = window.CRMCore;
      const d = n => C.addDays(A.today, n);
      E('invoice.raised', { invoiceId:'i4', dealId:'d1', number:'INV-US-01',
                            issuedOn:d(-5), currency:'USD', net:1000, vat:0 });
      window.CRMApp.refold();
      const rows = C.parseCSV(C.exportCSV(A.st, A.config, A.today));
      return { head:rows[0], row: rows.filter(r => r[0] === 'd1')[0] };
    });
    const mcol = name => multi.row[HEAD.indexOf(name)];
    ok(mcol('Money currency') === 'ZAR',
       'the numeric columns stay in the deal’s own currency', mcol('Money currency'));
    ok(mcol('Invoiced') === '57500.00',
       '…and the dollars are NOT added into the rand total (C16)', mcol('Invoiced'));
    ok(/USD/.test(mcol('Other currencies')) && /1000\.00/.test(mcol('Other currencies')),
       'the other currency is spelled out instead of being dropped',
       mcol('Other currencies'));
    ok(/INV-US-01/.test(mcol('Invoice number')),
       '…and its invoice number is still named', mcol('Invoice number'));

    describe(vp.tag + ' — a deal with no money at all leaves the columns empty');
    const bare = await page.evaluate(() => {
      const A = window.CRMApp.App, E = window.CRMApp.emit, C = window.CRMCore;
      E('deal.created', { dealId:'d2', companyId:'sb', name:'Nothing billed yet',
                          owner:'thabo', stage:'lead', currency:'ZAR' });
      window.CRMApp.refold();
      const rows = C.parseCSV(C.exportCSV(A.st, A.config, A.today));
      return rows.filter(r => r[0] === 'd2')[0];
    });
    const bcol = name => bare[HEAD.indexOf(name)];
    ok(['Money currency','Invoiced','VAT','Paid','Outstanding','Commission earned',
        'Quote number','Invoice number','Receipt number','Other currencies']
         .every(c => bcol(c) === ''),
       'blank, not 0.00 — nothing has happened, which is not the same as zero',
       JSON.stringify(['Invoiced','VAT','Paid'].map(bcol)));
    ok(bcol('Commission %') === '',
       'and no rate set stays blank, which is not 0% (C23)', JSON.stringify(bcol('Commission %')));

    describe(vp.tag + ' — the file Excel actually opens');
    const dl = await page.evaluate(async () => {
      const A = window.CRMApp.App;
      let captured = null;
      const realCreate = URL.createObjectURL;
      URL.createObjectURL = function (blob){ captured = blob; return 'blob:stub'; };
      A.view = 'settings'; window.CRMApp.render();
      await new Promise(r => setTimeout(r, 450));
      const btn = Array.from(document.querySelectorAll('button'))
        .find(x => /Export deals as CSV/.test(x.textContent));
      if (!btn){ URL.createObjectURL = realCreate; return { fail:'no export button' }; }
      btn.click();
      await new Promise(r => setTimeout(r, 300));
      URL.createObjectURL = realCreate;
      if (!captured) return { fail:'nothing was handed to the browser to download' };
      /* Blob.text() decodes as UTF-8, and UTF-8 decode STRIPS a leading byte
         order mark — so it cannot see the thing under test. Read the bytes. */
      const bytes = Array.from(new Uint8Array(await captured.arrayBuffer()).slice(0, 10));
      const text = await captured.text();
      return { head3: bytes.slice(0, 3), type: captured.type,
               afterMark: String.fromCharCode.apply(null, bytes.slice(3, 10)),
               /* and it must still re-import: parseCSV strips the mark */
               reparsed: window.CRMCore.parseCSV(text)[0][0] };
    });
    ok(!dl.fail, 'the export button hands a file to the browser', dl.fail);
    if (!dl.fail){
      ok(JSON.stringify(dl.head3) === '[239,187,191]',
         'the first three bytes are EF BB BF — the only thing that tells Excel it is UTF-8',
         JSON.stringify(dl.head3));
      ok(/charset=utf-8/.test(dl.type), '…and says so in its type too', dl.type);
      ok(dl.afterMark === 'Deal id', 'the mark sits before the header, not inside it', dl.afterMark);
      ok(dl.reparsed === 'Deal id',
         'and the app can still read its own export back', dl.reparsed);
    }

    describe(vp.tag + ' — the exported text itself carries no mark');
    const clean = await page.evaluate(() => {
      const A = window.CRMApp.App, C = window.CRMCore;
      return C.exportCSV(A.st, A.config, A.today).charCodeAt(0);
    });
    ok(clean !== 0xFEFF,
       'exportCSV returns plain text; the mark belongs to the download, not the data',
       String(clean));

    ok(errs.length === 0, 'no page errors', errs.join(' | '));
    await page.close();
  }
  await b.close();
  console.log('\n' + (fail ? '\x1b[31m' : '\x1b[32m') + pass + ' passed, ' + fail + ' failed\x1b[0m');
  if (fail){ console.log(fails.map(f => '  - ' + f).join('\n')); process.exit(1); }
})();
