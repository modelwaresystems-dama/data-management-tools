/* The register answers of 21 Sep 2026, each against the real crm.html in Chromium.
   B2  seven days: an unpaid direct seat shows on Today before the course
   N3  terms:      an invoice with no due date ages on 30 days from issue, said as derived
   N2  propose:    domains drafted from contacts' addresses, set only when ticked
   N1  nexus:      a partner company can be created from the deal, so Comotion can
                   name Nexus Data */
const { chromium } = require('playwright');
const path = require('path');
let pass = 0, fail = 0; const fails = [];
const ok = (c, m, extra) => { if (c){ pass++; console.log('  \x1b[32m✓\x1b[0m ' + m); }
  else { fail++; fails.push(m + (extra ? '  [' + extra + ']' : '')); console.log('  \x1b[31m✗ ' + m + '\x1b[0m' + (extra ? '  [' + String(extra).slice(0, 300) + ']' : '')); } };
const describe = t => console.log('\n\x1b[1m' + t + '\x1b[0m');
const T = '2026-09-21';

(async () => {
  const file = path.resolve(process.argv[2] || 'crm.html');
  const b = await chromium.launch(require('./browser.js'));
  for (const vp of [{ tag:'desktop', width:1440, height:950 }, { tag:'phone', width:390, height:844 }]){
    const page = await b.newPage({ viewport:{ width:vp.width, height:vp.height } });
    const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.goto('file://' + file); await page.waitForTimeout(900);

    const seed = () => page.evaluate((T) => {
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      const A = window.CRMApp.App, E = window.CRMApp.emit;
      A.today = T;
      A.config = Object.assign({}, A.config, { thresholds:Object.assign({}, A.config.thresholds),
        currencies:['ZAR','USD'], users:[
        { id:'howard', name:'Howard Diesel', email:'howard@modelwaresystems.com' },
        { id:'paul', name:'Paul Bolton', sales:true, email:'paul@modelwaresystems.com' },
        { id:'debbie', name:'Debbie Diesel', sales:true } ] });
      A.lens = null; A.scope = 'team'; A.events = []; A.seq = 0; A.me = 'howard';
      window.CRMApp.refold();
    }, T);

    /* ---------------- B2 ---------------- */
    describe(vp.tag + ' — B2: an unpaid direct seat shows on Today, seven days out');
    await seed();
    const b2 = await page.evaluate(async (T) => {
      const A = window.CRMApp.App, E = window.CRMApp.emit, C = window.CRMCore;
      const add = C.addDays;
      E('company.created', { companyId:'ind', name:'Individual', isHolder:true });
      const mk = (id, name, starts, ch, extra) => E('deal.created', Object.assign({ dealId:id, companyId:'ind', name,
        owner:'debbie', stage:'proposal', channel:ch, courseStartsOn:starts }, extra || {}));
      mk('s1', 'CDMP seat — in 7 days, not invoiced', add(T, 7), '1');
      mk('s2', 'CDMP seat — in 3 days, invoiced unpaid', add(T, 3), '1');
      E('invoice.raised', { invoiceId:'i2', dealId:'s2', number:'INV2', issuedOn:add(T,-5), dueDate:add(T,2),
                            currency:'ZAR', net:14905, vat:0, passThrough:0 });
      mk('s3', 'CDMP seat — in 2 days, PAID', add(T, 2), '1');
      E('invoice.raised', { invoiceId:'i3', dealId:'s3', number:'INV3', issuedOn:add(T,-5), dueDate:add(T,2),
                            currency:'ZAR', net:100, vat:0, passThrough:0 });
      E('payment.received', { paymentId:'p3', invoiceId:'i3', amount:100, receivedOn:add(T,-1) });
      mk('s4', 'CDMP seat — in 8 days', add(T, 8), '1');
      mk('s5', 'Corporate — in 2 days', add(T, 2), '2');
      mk('s6', 'CDMP seat — started 2 days ago, unpaid', add(T, -2), '1');
      mk('s7', 'CDMP seat — lost', add(T, 1), '1');
      E('deal.closed', { dealId:'s7', outcome:'lost', reason:'x' });
      mk('s8', 'Direct, no start date', null, '1');
      window.CRMApp.refold();
      const list = C.unpaidSeats(A.st, A.config, T, { scope:'team' });
      const mine = C.unpaidSeats(A.st, A.config, T, { scope:'mine', user:'paul' });
      A.view = 'today'; window.CRMApp.render(); await new Promise(r => setTimeout(r, 250));
      const band = document.querySelector('.band-seats');
      const txt = band ? band.textContent.replace(/[   ]/g, ' ') : '';
      const first = band && band.querySelector('.item');
      if (first) first.click();
      await new Promise(r => setTimeout(r, 300));
      const panel = document.querySelector('.panel');
      const ptxt = panel ? panel.textContent : '';
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      /* the edit form carries the field and saves it */
      window.CRMApp.openDeal('s8'); await new Promise(r => setTimeout(r, 250));
      Array.from(document.querySelectorAll('.panel button')).find(x => x.textContent.trim() === 'Edit').click();
      await new Promise(r => setTimeout(r, 250));
      const inp = document.querySelector('input[aria-label="Course starts"]');
      if (inp){ inp.value = '+5'; }
      Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === 'Save').click();
      await new Promise(r => setTimeout(r, 250));
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      return { ids: list.map(x => x.deal.id).join(','), mine: mine.length, txt, ptxt: ptxt.slice(0, 1500),
               hasInput: !!inp, saved: A.st.deals.s8.courseStartsOn,
               after: C.unpaidSeats(A.st, A.config, T, { scope:'team' }).map(x => x.deal.id).join(',') };
    }, T);
    ok(b2.ids === 's6,s2,s1', 'shows the started-unpaid seat first, then 3 days, then 7 days', b2.ids);
    ok(!/s3/.test(b2.ids), '…not a seat that is paid');
    ok(!/s4/.test(b2.ids), '…not one eight days out');
    ok(!/s5/.test(b2.ids), '…not a corporate deal, which is invoiced after the course');
    ok(!/s7/.test(b2.ids), '…not a lost deal');
    ok(b2.mine === 0, 'Paul\'s own Today does not show Debbie\'s seats', String(b2.mine));
    ok(/Unpaid before the course/.test(b2.txt), 'Today has its own band for them', b2.txt.slice(0, 100));
    ok(/started 2 days ago/.test(b2.txt), '…saying when the course starts or started');
    ok(/not invoiced/.test(b2.txt) && /14 905/.test(b2.txt), '…and what is owed, or that nothing is invoiced', b2.txt);
    ok(/Course starts/.test(b2.ptxt), 'the deal panel shows the course start', b2.ptxt.slice(0, 300));
    ok(b2.hasInput, 'the Edit form has a Course starts field');
    ok(b2.saved === '2026-09-26', '…which saves a typed "+5" as a date', b2.saved);
    ok(/s8/.test(b2.after), '…and the seat is on Today straight away', b2.after);

    /* ---------------- N3 ---------------- */
    describe(vp.tag + ' — N3: no due date means 30 days from issue, said as derived');
    await seed();
    const n3 = await page.evaluate(async (T) => {
      const A = window.CRMApp.App, E = window.CRMApp.emit, C = window.CRMCore;
      E('company.created', { companyId:'ts', name:'Tools & Solutions' });
      E('deal.created', { dealId:'d1', companyId:'ts', name:'DCAM', owner:'paul', stage:'won' });
      /* issued 21 Jul, no due date: derived due 20 Aug, 32 days late on 21 Sep */
      E('invoice.raised', { invoiceId:'i1', dealId:'d1', number:'INV9000389', issuedOn:'2026-07-21',
                            currency:'USD', net:12000, vat:0, passThrough:0 });
      /* a stated due date always wins, even if it is later than 30 days */
      E('invoice.raised', { invoiceId:'i2', dealId:'d1', number:'INV2', issuedOn:'2026-07-21', dueDate:'2026-10-01',
                            currency:'USD', net:1000, vat:0, passThrough:0 });
      /* no issue date given: the fold records the day it was entered, so it
         too ages on derived terms rather than falling out of the book */
      E('invoice.raised', { invoiceId:'i3', dealId:'d1', number:'INV3', currency:'USD', net:50, vat:0, passThrough:0 });
      window.CRMApp.refold();
      const inv = A.st.invoices;
      const e1 = C.effectiveDue(inv.i1), e2 = C.effectiveDue(inv.i2), e3 = C.effectiveDue(inv.i3);
      const book = C.agedDebtors(A.st, A.config, T);
      const r = book.rows[0];
      const agg = C.debtorsByCompany(A.st, A.config, T).byCurrency.USD;
      const led = C.customerLedger(A.st, 'ts', T).byCurrency.USD;
      A.view = 'debtors'; window.CRMApp.render(); await new Promise(r => setTimeout(r, 300));
      const body = document.querySelector('#content').textContent.replace(/[   ]/g, ' ');
      window.CRMApp.openDeal('d1'); await new Promise(r => setTimeout(r, 250));
      const ptxt = (document.querySelector('.panel') || {}).textContent || '';
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      return { e1, e2, e3, aged:r.aged, derived:r.derived, stored: inv.i1.dueDate || null,
               aggDerived: agg.derived, ledDerived: led.derived, ledCount: led.derivedCount,
               flags: (C.flags ? '' : ''), body, ptxt: ptxt.slice(0, 2000) };
    }, T);
    ok(n3.e1.date === '2026-08-20' && n3.e1.derived, 'an invoice with no due date is due 30 days from issue, marked derived', JSON.stringify(n3.e1));
    ok(n3.e2.date === '2026-10-01' && !n3.e2.derived, 'a stated due date always wins', JSON.stringify(n3.e2));
    ok(n3.e3.date && n3.e3.derived, 'an invoice entered with no issue date ages from the day it was recorded, still marked derived', JSON.stringify(n3.e3));
    ok(n3.stored === null, 'the derived date is never written back to the invoice');
    ok(n3.aged.d60 === 12000, '$12,000 now sits in the 31–60 bucket instead of nowhere', JSON.stringify(n3.aged));
    ok(n3.aged.current === 1050 && n3.aged.undated === 0, '…the stated one and the new one are current, and nothing is left undated', JSON.stringify(n3.aged));
    ok(n3.derived === 12050 && n3.aggDerived === 12050 && n3.ledDerived === 12050 && n3.ledCount === 2,
       'every reader carries how much is aged on derived terms', [n3.derived, n3.aggDerived, n3.ledDerived, n3.ledCount].join(','));
    ok(/aged on 30-day terms from issue/.test(n3.body), 'the Debtors row says so', n3.body.slice(0, 400));
    ok(/is aged on 30-day terms from its issue date/.test(n3.body), '…and so does the Sage footing, with what it does to the reconciliation');
    ok(/treated as due 20 Aug/.test(n3.ptxt), 'the deal panel shows the date it is treated as due', n3.ptxt.slice(0, 600));

    /* ---------------- N2 ---------------- */
    describe(vp.tag + ' — N2: domains drafted from contacts, set only when ticked');
    await seed();
    const n2 = await page.evaluate(async (T) => {
      const A = window.CRMApp.App, E = window.CRMApp.emit, C = window.CRMCore;
      E('company.created', { companyId:'sarb', name:'SARB' });
      E('contact.created', { contactId:'c1', companyId:'sarb', name:'Johan B', email:'johan.b@resbank.co.za' });
      E('contact.created', { contactId:'c2', companyId:'sarb', name:'Thandi', email:'Thandi <thandi@RESBANK.co.za>' });
      E('contact.created', { contactId:'c3', companyId:'sarb', name:'Private', email:'someone@gmail.com' });
      E('company.created', { companyId:'mcb', name:'MCB' });
      E('contact.created', { contactId:'c4', companyId:'mcb', name:'Anil', email:'anil@mcb.mu' });
      /* only webmail and our own address: nothing to propose */
      E('company.created', { companyId:'priv', name:'Private Co' });
      E('contact.created', { contactId:'c5', companyId:'priv', name:'P', email:'p@outlook.com' });
      E('contact.created', { contactId:'c6', companyId:'priv', name:'Us', email:'x@modelwaresystems.com' });
      /* a clash: the domain already belongs to another company */
      E('company.created', { companyId:'fnb', name:'FNB', domain:'fnb.co.za' });
      E('company.created', { companyId:'fnb2', name:'FNB Botswana' });
      E('contact.created', { contactId:'c7', companyId:'fnb2', name:'K', email:'k@fnb.co.za' });
      window.CRMApp.refold();
      const sug = C.suggestDomain(A.st, A.config, 'sarb');
      const none = C.suggestDomain(A.st, A.config, 'priv');
      const clash = C.suggestDomain(A.st, A.config, 'fnb2');
      A.view = 'money'; window.CRMApp.render(); await new Promise(r => setTimeout(r, 300));
      const list = document.querySelector('.nodomain-list');
      const boxes = list ? Array.from(list.querySelectorAll('input[type=checkbox]')) : [];
      const label = boxes.map(x => x.getAttribute('aria-label') + ':' + x.checked + ':' + x.disabled).join(' | ');
      const beforeSarb = A.st.companies.sarb.domain;
      /* untick MCB, set the rest */
      const mcb = boxes.find(x => /mcb\.mu/.test(x.getAttribute('aria-label')));
      if (mcb){ mcb.checked = false; mcb.dispatchEvent(new Event('change')); }
      const btn = Array.from(document.querySelectorAll('#content button')).find(x => /ticked domain/.test(x.textContent));
      const btnText = btn ? btn.textContent : '';
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 250));
      return { sug, none, clash, label, beforeSarb, btnText,
               sarb: A.st.companies.sarb.domain, mcb: A.st.companies.mcb.domain, fnb2: A.st.companies.fnb2.domain,
               section: (document.querySelector('#content').textContent || '').slice(0, 50) };
    }, T);
    ok(n2.sug && n2.sug.domain === 'resbank.co.za', 'SARB is proposed resbank.co.za from its contacts', JSON.stringify(n2.sug));
    ok(n2.sug && n2.sug.from.join(',') === 'Johan B,Thandi', '…naming who it came from, and ignoring the gmail address', JSON.stringify(n2.sug));
    ok(n2.none === null, 'webmail and our own domain are never proposed', JSON.stringify(n2.none));
    ok(n2.clash && n2.clash.clashWith === 'FNB', 'a domain another company already has is reported as a clash', JSON.stringify(n2.clash));
    ok(/SARB:true:false/.test(n2.label) && /MCB:true:false/.test(n2.label), 'the safe proposals arrive ticked', n2.label);
    ok(/FNB Botswana:false:true/.test(n2.label), '…and the clash is shown but cannot be ticked', n2.label);
    ok(n2.beforeSarb === '', 'nothing is written until the button is pressed');
    ok(/Set the 1 ticked domain/.test(n2.btnText), 'the button counts what it will do', n2.btnText);
    ok(n2.sarb === 'resbank.co.za', 'pressing it sets the ticked ones', n2.sarb);
    ok(n2.mcb === '' && n2.fnb2 === '', '…and only those', n2.mcb + '|' + n2.fnb2);

    /* ---------------- N1 ---------------- */
    describe(vp.tag + ' — N1: a partner company can be created from the deal');
    await seed();
    const n1 = await page.evaluate(async (T) => {
      const A = window.CRMApp.App, E = window.CRMApp.emit;
      E('company.created', { companyId:'com', name:'Comotion' });
      E('deal.created', { dealId:'dc', companyId:'com', name:'DMBOK advisory', owner:'howard', stage:'proposal' });
      window.CRMApp.refold();
      const run = async (name, dom) => {
        window.CRMApp.openDeal('dc'); await new Promise(r => setTimeout(r, 250));
        Array.from(document.querySelectorAll('.panel button')).find(x => x.textContent.trim() === 'Edit').click();
        await new Promise(r => setTimeout(r, 250));
        const sel = document.querySelector('select[aria-label="Partner"]');
        const hasNew = !!sel.querySelector('option[value="new"]');
        sel.value = 'new'; sel.dispatchEvent(new Event('change'));
        await new Promise(r => setTimeout(r, 80));
        const wrap = document.querySelector('.newpartner');
        const shown = wrap && wrap.style.display !== 'none';
        document.querySelector('input[aria-label="New partner company"]').value = name;
        document.querySelector('input[aria-label="New partner domain"]').value = dom;
        Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === 'Save').click();
        await new Promise(r => setTimeout(r, 250));
        Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
        return { hasNew, shown };
      };
      const r1 = await run('Nexus Data', 'https://nexusdata.example/');
      const nx = Object.values(A.st.companies).filter(c => c.name === 'Nexus Data');
      const d = A.st.deals.dc;
      const first = { r1, count: nx.length, partner: d.partnerCompanyId, isPartner: nx[0] && nx[0].isPartner,
                      domain: nx[0] && nx[0].domain };
      /* doing it again with the same name reuses it, never a second copy */
      await run('  nexus data ', '');
      const again = Object.values(A.st.companies).filter(c => /nexus data/i.test(c.name)).length;
      /* naming the customer itself is refused */
      const before = A.st.deals.dc.partnerCompanyId;
      await run('Comotion', '');
      const self = A.st.deals.dc.partnerCompanyId;
      return { first, again, before, self, nxId: nx[0] && nx[0].id };
    }, T);
    ok(n1.first.r1.hasNew && n1.first.r1.shown, 'the Partner list offers a company not in the CRM yet, and asks for its name');
    ok(n1.first.count === 1 && n1.first.partner === n1.nxId, 'Nexus Data is created and becomes the partner on the deal', JSON.stringify(n1.first));
    ok(n1.first.isPartner === true, '…marked a partner, where the next deal can find it');
    ok(n1.first.domain === 'nexusdata.example', '…with the domain cleaned of any address furniture', n1.first.domain);
    ok(n1.again === 1, 'naming it again reuses it — never a second copy', String(n1.again));
    ok(n1.self === n1.before, 'a customer cannot be named as its own partner', n1.self);

    describe(vp.tag + ' — no page errors');
    ok(!errs.length, 'nothing threw', errs.join(' | '));
    await page.close();
  }
  await b.close();
  console.log('\n' + '─'.repeat(58));
  console.log(fail ? '\x1b[31m\x1b[1m' + pass + ' passed, ' + fail + ' FAILED.\x1b[0m' : '\x1b[32m\x1b[1m' + pass + ' passed, 0 failed.\x1b[0m');
  if (fail){ console.log('\nFailures:'); fails.forEach(f => console.log('  • ' + f)); process.exit(1); }
})();
