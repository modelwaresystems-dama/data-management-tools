/* One person, several addresses. Build instruction of 1 Oct 2026
   (CRM_App_Build_Instruction_contact_emails.md), from the Amanda Emmanuel case:
   work address on the deal, replies from gmail, gmail matched nobody, so the
   importer made a duplicate contact and the interaction never reached the deal. */
const { chromium } = require('playwright');
const path = require('path');
let pass = 0, fail = 0; const fails = [];
const ok = (c, m, extra) => { if (c){ pass++; console.log('  \x1b[32m✓\x1b[0m ' + m); }
  else { fail++; fails.push(m); console.log('  \x1b[31m✗ ' + m + '\x1b[0m' + (extra ? '  [' + String(extra).slice(0, 400) + ']' : '')); } };
const describe = t => console.log('\n\x1b[1m' + t + '\x1b[0m');

const WORK = 'Amanda.Emmanuel@oldmutual.com';
const HOME = 'amanda.emmanuel09@gmail.com';

(async () => {
  const file = path.resolve(process.argv[2] || 'crm.html');
  const b = await chromium.launch(require('./browser.js'));
  for (const vp of [{ tag:'desktop', width:1440, height:950 }, { tag:'phone', width:390, height:844 }]){
    const page = await b.newPage({ viewport:{ width:vp.width, height:vp.height } });
    const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.goto('file://' + file); await page.waitForTimeout(900);

    /* a pure fold, built the way the app's own importer would see it */
    const base = (extra) => page.evaluate(([WORK, HOME, extra]) => {
      const C = window.CRMCore;
      const cfg = { stages:[{id:'lead',label:'Lead',probability:0.1},{id:'proposal',label:'Proposal',probability:0.6}],
        thresholds:{ pushedCount:3, silentDays:30, stalledDays:45 }, currencies:['ZAR'], defaultCurrency:'ZAR',
        users:[{ id:'howard', name:'Howard Diesel', email:'howard@modelwaresystems.com' },
               { id:'debbie', name:'Debbie Diesel', sales:true }] };
      let n = 0;
      const ev = (type, payload) => ({ id:'e'+n, ts:'2026-09-0' + (1 + (n % 8)) + 'T08:00:00Z', seq:n++, actor:'howard', type, payload });
      const evs = [
        ev('company.created', { companyId:'ind', name:'Individual', isHolder:true }),
        ev('contact.created', { contactId:'amanda', companyId:'ind', name:'Amanda Emmanuel', email:WORK }),
        ev('deal.created', { dealId:'coach', companyId:'ind', name:'Career Coaching',
                             owner:'debbie', stage:'proposal', contactId:'amanda' }),
        ev('company.created', { companyId:'ts', name:'Tools & Solutions', domain:'ts.test' }),
        ev('contact.created', { contactId:'other', companyId:'ts', name:'Someone Else',
                                email:'someone@ts.test' })
      ].concat((extra || []).map(x => ev(x[0], x[1])));
      window.__cfg = cfg;
      window.__st = C.foldEvents(evs, cfg, '2026-10-01');
      return Object.keys(window.__st.contacts).length;
    }, [WORK, HOME, extra || []]);

    describe(vp.tag + ' — the data model');
    await base();
    const model = await page.evaluate(([WORK, HOME]) => {
      const C = window.CRMCore, st = window.__st;
      const legacy = st.contacts.amanda;
      const withAlt = C.foldEvents([{ id:'a', ts:'2026-09-01T08:00:00Z', seq:0, actor:'howard',
        type:'contact.created', payload:{ contactId:'x', companyId:'ind', name:'X',
          email:'  Amanda <' + WORK + '>  ', altEmails:[HOME.toUpperCase(), '', HOME] } }],
        window.__cfg, '2026-10-01').contacts.x;
      return { legacyEmails: legacy.emails, legacyRead: C.contactEmails(legacy),
               normalised: withAlt.emails, primaryKept: withAlt.email,
               norm: C.normEmail('  Amanda <' + WORK + '> ') };
    }, [WORK, HOME]);
    ok(model.legacyRead.length === 1 && model.legacyRead[0] === WORK.toLowerCase(),
       'a contact that only ever carried one address reads as a list of one — nothing to migrate',
       JSON.stringify(model.legacyRead));
    ok(model.norm === WORK.toLowerCase(), 'an address is normalised: display name stripped, lower-cased', model.norm);
    ok(model.normalised.length === 2 && model.normalised[0] === WORK.toLowerCase() &&
       model.normalised[1] === HOME.toLowerCase(),
       'alternates are normalised and de-duplicated, primary first', JSON.stringify(model.normalised));

    describe(vp.tag + ' — mail from either address finds the same person and deal');
    const match = await page.evaluate(([WORK, HOME]) => {
      const C = window.CRMCore;
      const before = C.matchContact(window.__st, HOME, '');
      const st2 = (function (){
        const add = { id:'z', ts:'2026-09-09T08:00:00Z', seq:99, actor:'howard',
          type:'contact.updated', payload:{ contactId:'amanda', addEmails:[HOME] } };
        return C.foldEvents([].concat(window.__evs || [], [add]), window.__cfg, '2026-10-01');
      })();
      return { before: { c: before.contact && before.contact.name, co: before.company && before.company.name } };
    }, [WORK, HOME]);
    ok(!match.before.c, 'before the alternate is known, the gmail address matches nobody', JSON.stringify(match.before));
    ok(!match.before.co, '…and never matches a COMPANY by its free-mail domain either');

    await base([['contact.updated', { contactId:'amanda', addEmails:[HOME] }]]);
    const after = await page.evaluate(([WORK, HOME]) => {
      const C = window.CRMCore, st = window.__st;
      const work = C.matchContact(st, WORK, '');
      const home = C.matchContact(st, HOME.toUpperCase(), '');
      return { workC: work.contact && work.contact.id, homeC: home.contact && home.contact.id,
               homeDeal: home.deal && home.deal.id, workDeal: work.deal && work.deal.id,
               emails: st.contacts.amanda.emails, primary: st.contacts.amanda.email,
               byEmail: C.contactByEmail(st, HOME) && C.contactByEmail(st, HOME).id };
    }, [WORK, HOME]);
    ok(after.homeC === 'amanda' && after.workC === 'amanda',
       'once the alternate is on the contact, BOTH addresses reach Amanda', JSON.stringify(after));
    ok(after.homeDeal === 'coach' && after.workDeal === 'coach', '…and both reach Career Coaching');
    ok(after.primary === WORK, 'the primary is unchanged — it is still what the app displays', after.primary);
    ok(after.byEmail === 'amanda', 'and the address resolves to exactly one contact');

    describe(vp.tag + ' — an import row can attach the second address');
    await base();                       /* back to Amanda with her work address only */
    const imp = await page.evaluate(([WORK, HOME]) => {
      const C = window.CRMCore;
      const run = (rows, st) => C.importTriage(JSON.stringify({ version:2, rows }), st || window.__st,
        window.__cfg, { actor:'howard', today:'2026-10-01' });
      const row = { dealId:'coach', contactEmail:WORK, contactAltEmails:[HOME],
                    kind:'email', occurredAt:'2026-10-01',
                    summary:'Amanda confirmed the coaching dates from her personal address.',
                    messageId:'<m1@x>' };
      const res = run([row]);
      const evs = res.events.filter(e => e.type === 'contact.updated');
      /* fold the result and check both addresses now match */
      const st2 = C.foldEvents(
        Object.keys(window.__st.contacts).length ? [] : [], window.__cfg, '2026-10-01');
      return { errors: res.errors, logged: res.summary.logged, alt: res.summary.altEmails,
               ev: evs.map(e => e.type + ':' + JSON.stringify(e.payload)),
               ids: res.events.map(e => e.id).filter(i => /^ev_cte_/.test(i)),
               rowSaid: (res.rows[0] || {}).addedEmails,
               /* re-running the same batch must not add it twice */
               second: run([row]).events.filter(e => e.type === 'contact.updated')
                 .map(e => e.id).join(',') };
    }, [WORK, HOME]);
    ok(!imp.errors.length, 'the row is accepted — contactAltEmails is a known field', imp.errors.join(' | '));
    ok(imp.ev.length === 1 && /addEmails/.test(imp.ev[0]), 'it emits one event adding the address to Amanda', imp.ev.join(' | '));
    ok(/amanda/.test(imp.ev[0]) && new RegExp(HOME).test(imp.ev[0]), '…to HER contact, not a new one', imp.ev[0]);
    ok(imp.alt === 1, 'the summary counts it', String(imp.alt));
    ok(imp.rowSaid && imp.rowSaid[0] === HOME, 'the review table says the address was added', JSON.stringify(imp.rowSaid));
    ok(imp.ids.length === 1 && imp.second === imp.ids[0],
       'the event id is derived, so re-importing the batch is a no-op', imp.ids + ' / ' + imp.second);

    describe(vp.tag + ' — an address that belongs to somebody else refuses the row');
    const clash = await page.evaluate(([WORK, HOME]) => {
      const C = window.CRMCore;
      const res = C.importTriage(JSON.stringify({ version:2, rows:[{
        dealId:'coach', contactEmail:WORK, contactAltEmails:['someone@ts.test'],
        kind:'email', occurredAt:'2026-10-01', summary:'A line that must not be logged.',
        messageId:'<m2@x>' }] }), window.__st, window.__cfg, { actor:'howard', today:'2026-10-01' });
      const ours = C.importTriage(JSON.stringify({ version:2, rows:[{
        dealId:'coach', contactEmail:WORK, contactAltEmails:['howard@modelwaresystems.com'],
        kind:'email', occurredAt:'2026-10-01', summary:'Another line that must not be logged.',
        messageId:'<m3@x>' }] }), window.__st, window.__cfg, { actor:'howard', today:'2026-10-01' });
      return { err: res.errors.join(' | '), logged: res.summary.logged, events: res.events.length,
               oursErr: ours.errors.join(' | '), oursLogged: ours.summary.logged };
    }, [WORK, HOME]);
    ok(/already belongs to Someone Else/.test(clash.err), 'it says whose address it is', clash.err);
    ok(/One address is one person/.test(clash.err), '…and why that cannot be re-pointed');
    ok(clash.logged === 0 && clash.events === 0, 'and nothing from the row is imported — not even the interaction',
       clash.logged + '/' + clash.events);
    ok(/is one of ours/.test(clash.oursErr) && clash.oursLogged === 0,
       'our own address is refused the same way', clash.oursErr);

    describe(vp.tag + ' — a free-mail alternate never becomes a company');
    const dom = await page.evaluate(([WORK, HOME]) => {
      const C = window.CRMCore, st = window.__st;
      const hit = C.matchContact(st, 'nobody@gmail.com', '');
      const sug = C.suggestDomain(st, window.__cfg, 'ind');
      return { company: hit.company && hit.company.name, contact: hit.contact && hit.contact.name,
               suggested: sug && sug.domain };
    }, [WORK, HOME]);
    ok(!dom.company, 'an unknown gmail sender matches no company at all', JSON.stringify(dom));
    ok(dom.suggested !== 'gmail.com', '…and a gmail alternate is never proposed as a company domain', String(dom.suggested));

    describe(vp.tag + ' — a NEW individual row carries its alternates from the start');
    const create = await page.evaluate(([WORK, HOME]) => {
      const C = window.CRMCore;
      const res = C.triageCreate([{ individual:true, company:'Individual', contactName:'Zanele N',
        contactEmail:'zanele@bigcorp.test', contactAltEmails:['zanele.n@gmail.com'],
        deal:'CDMP certification', owner:'debbie', stage:'lead',
        nextStep:{ what:'Send the quote', dueDate:'2026-10-08' } }],
        window.__st, window.__cfg, { actor:'howard', today:'2026-10-01' });
      const made = res.events.filter(e => e.type === 'contact.created')
        .map(e => e.payload).filter(p => /Zanele/.test(p.name))[0];
      const st2 = C.foldEvents(res.events.map((e, i) =>
        Object.assign({ id:'c'+i, ts:'2026-10-01T08:00:00Z', seq:i, actor:'howard' }, e)),
        window.__cfg, '2026-10-01');
      const byAlt = C.contactByEmail(st2, 'ZANELE.N@gmail.com');
      return { errors:res.errors, emails: made && made.emails, byAlt: byAlt && byAlt.name };
    }, [WORK, HOME]);
    ok(!create.errors.length, 'contactAltEmails is accepted on a row that creates the person', create.errors.join(' | '));
    ok(create.emails && create.emails.length === 2, '…seeded onto the new contact', JSON.stringify(create.emails));
    ok(create.byAlt === 'Zanele N', '…so her second address matches her from the first sweep', String(create.byAlt));

    describe(vp.tag + ' — typing them in by hand');
    const ui = await page.evaluate(([WORK, HOME]) => {
      const A = window.CRMApp.App, E = window.CRMApp.emit;
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      A.lens = null; A.scope = 'team'; A.events = []; A.seq = 0;
      E('company.created', { companyId:'ind', name:'Individual', isHolder:true });
      E('contact.created', { contactId:'amanda', companyId:'ind', name:'Amanda Emmanuel', email:WORK });
      E('contact.created', { contactId:'other', companyId:'ind', name:'Someone Else', email:'someone@ts.test' });
      E('deal.created', { dealId:'coach', companyId:'ind', name:'Career Coaching',
                          owner:A.me, stage:'proposal', contactId:'amanda' });
      window.CRMApp.refold();
      A.view = 'companies'; window.CRMApp.render();
      return new Promise(res => setTimeout(() => {
        const open = Array.from(document.querySelectorAll('#content .co-head'))
          .find(x => /Individual|Amanda/.test(x.textContent));
        if (open) open.click();
        setTimeout(() => {
          const link = Array.from(document.querySelectorAll('#content a'))
            .find(a => a.textContent.trim() === 'other addresses');
          if (!link) return res({ fail:'no "other addresses" link on the contact card' });
          link.click();
          setTimeout(() => {
            const ta = document.querySelector('textarea[aria-label="Other addresses"]');
            if (!ta) return res({ fail:'no popover' });
            /* first try one that belongs to somebody else */
            ta.value = 'someone@ts.test';
            ta.dispatchEvent(new Event('input'));
            const warn = document.querySelector('.pop .note[style*="overdue"], .pop .note');
            const warned = Array.from(document.querySelectorAll('.pop .note'))
              .map(n => n.textContent).join(' ');
            const save = Array.from(document.querySelectorAll('.pop button'))
              .find(x => x.textContent.trim() === 'Save');
            save.click();
            setTimeout(() => {
              const refusedStill = !!document.querySelector('textarea[aria-label="Other addresses"]');
              const amandaAfterRefusal = window.CRMApp.App.st.contacts.amanda.emails.length;
              const ta2 = document.querySelector('textarea[aria-label="Other addresses"]');
              ta2.value = ' ' + HOME.toUpperCase() + ' ';
              ta2.dispatchEvent(new Event('input'));
              Array.from(document.querySelectorAll('.pop button'))
                .find(x => x.textContent.trim() === 'Save').click();
              setTimeout(() => {
                const st = window.CRMApp.App.st;
                const card = (document.querySelector('#content') || {}).textContent || '';
                res({ warned, refusedStill, amandaAfterRefusal,
                      emails: st.contacts.amanda.emails,
                      card: card.replace(/\s+/g, ' ') });
              }, 300);
            }, 250);
          }, 300);
        }, 300);
      }, 350));
    }, [WORK, HOME]);
    ok(!ui.fail, 'a contact card offers "other addresses"', ui.fail);
    if (!ui.fail){
      ok(/already belongs to Someone Else/.test(ui.warned), 'typing a taken address warns, in the dialog', ui.warned.slice(0, 200));
      ok(ui.refusedStill && ui.amandaAfterRefusal === 1, '…and Save refuses to write it',
         ui.refusedStill + '/' + ui.amandaAfterRefusal);
      ok(ui.emails && ui.emails.length === 2 && ui.emails[1] === HOME.toLowerCase(),
         'a free address saves, normalised', JSON.stringify(ui.emails));
      ok(new RegExp('also ' + HOME.toLowerCase()).test(ui.card),
         'and the card says the person also writes from it', ui.card.slice(0, 300));
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
