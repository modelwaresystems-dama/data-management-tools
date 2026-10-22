/* "Why am I getting 'Make first contact' when contact has been made?"
   (Howard, 22 Oct 2026.)

   The deal on screen was Corleen Reynders — CDMP Training enquiry: created by
   the 14 Oct triage batch, three emails logged against it from the 13th, 14th
   and 16th, and an open "Make first contact" step due the 21st, a day overdue.
   On the 20 Oct export, eleven of the thirteen open "Make first contact" steps
   were this same thing.

   `triageCreate` defaulted every open deal it made to
   { "Make first contact", +7 days }, on the reasoning that a deal with no step
   is born into band three and is invisible. But a row that creates a deal is a
   row about an email, and the press that makes the deal is followed in the same
   sitting by the press that logs the conversation — so the step was false from
   birth. And band three is not invisible: Today has a band whose whole job is
   to say an open deal with no next step is a defect.

   So: a created deal gets a step only when the batch names one. This file holds
   that open, and holds open the two things that must NOT change — a named step
   still lands, and the in-app new-deal form keeps its own default. */
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

    /* An empty team workspace, so the batch below matches nothing and every row
       goes down the create path — which is the path that was wrong. */
    const seed = () => page.evaluate(() => {
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      try { localStorage.removeItem('crm.today.shut'); } catch (e){}
      const A = window.CRMApp.App;
      A.lens = null; A.scope = 'team'; A.workspace = 'team'; A.events = []; A.seq = 0;
      window.CRMApp.refold();
    });
    await seed();

    /* The real shape: one thread about a new enquiry, already carrying the line
       that IS the first contact. Dates are relative to the app's own today so
       this does not start failing on a calendar boundary. */
    const batch = (extra) => page.evaluate((extra) => {
      const A = window.CRMApp.App, C = window.CRMCore;
      const d = n => C.addDays(A.today, n);
      const row = Object.assign({
        company:'Corleen Reynders Ltd', deal:'CDMP Training enquiry',
        owner:'thabo', stage:'lead',
        contactName:'Corleen Reynders', contactEmail:'corleen@reynders.test',
        kind:'email', occurredAt:d(-9),
        summary:'New CDMP enquiry; sent the fundamentals and practitioner outline.',
        messageId:'<c1@mail>' }, extra || {});
      const res = C.importTriage(JSON.stringify({ version:2, rows:[row] }),
        A.st, A.config, { actor:A.me, today:A.today });
      const plan = C.triageCreate(res.unmatched, A.st, A.config,
        { actor:A.me, today:A.today });
      const steps = plan.events.filter(e => e.type === 'followup.created');
      return { unmatched: res.unmatched.length,
               errors: plan.errors, events: plan.events.map(e => e.type),
               steps: steps.map(e => ({ what:e.payload.what, due:e.payload.dueDate })),
               created: plan.created.map(c => ({ deal:c.deal, nextStep:c.nextStep,
                                                 dueDate:c.dueDate,
                                                 defaulted:c.defaultedNextStep })) };
    }, extra);

    describe(vp.tag + ' — a created deal is not given a first contact it has already had');
    const plain = await batch(null);
    ok(plain.unmatched === 1, 'the row matches no deal, so it goes down the create path',
       String(plain.unmatched));
    ok(!plain.errors.length, 'the plan is clean', plain.errors.join(' | '));
    ok(plain.steps.length === 0,
       'NO follow-up is emitted — the invented "Make first contact" is gone',
       JSON.stringify(plain.steps));
    ok(!plain.events.some(t => t === 'followup.created'),
       '…not under any other name either', plain.events.join(','));
    ok(plain.created[0] && plain.created[0].dueDate === null,
       'and the preview carries no due date to show', JSON.stringify(plain.created[0]));

    describe(vp.tag + ' — the deal lands on "No next step", which is the honest place');
    const landed = await page.evaluate(async () => {
      const A = window.CRMApp.App, C = window.CRMCore;
      const d = n => C.addDays(A.today, n);
      const row = { company:'Corleen Reynders Ltd', deal:'CDMP Training enquiry',
        owner:'thabo', stage:'lead',
        contactName:'Corleen Reynders', contactEmail:'corleen@reynders.test',
        kind:'email', occurredAt:d(-9),
        summary:'New CDMP enquiry; sent the fundamentals and practitioner outline.',
        messageId:'<c1@mail>' };
      const text = JSON.stringify({ version:2, rows:[row] });
      /* press one: create the deal */
      const plan = C.triageCreate(
        C.importTriage(text, A.st, A.config, { actor:A.me, today:A.today }).unmatched,
        A.st, A.config, { actor:A.me, today:A.today });
      plan.events.forEach(e => window.CRMApp.emit(e.type, e.payload, e.id));
      window.CRMApp.refold();
      /* press two: the very same file now matches, and logs the conversation */
      const second = C.importTriage(text, A.st, A.config, { actor:A.me, today:A.today });
      second.events.forEach(e => window.CRMApp.emit(e.type, e.payload, e.id));
      window.CRMApp.refold();

      const deal = Object.keys(A.st.deals).map(k => A.st.deals[k])
        .filter(x => /CDMP Training enquiry/.test(x.name))[0];
      if (!deal) return { fail:'the deal was not created' };
      const bands = C.bands(A.st, A.config, A.today, { scope:'team' });
      const flags = C.computeFlags(A.st, A.config, A.today)[deal.id] || [];
      return { ix: C.interactionsFor(A.st, deal.id).length,
               open: C.openFollowupsFor(A.st, deal.id).map(f => f.what),
               noNextStep: bands.noNextStep.some(x => x.id === deal.id),
               overdue: bands.overdue.map(f => f.what),
               dueToday: bands.dueToday.map(f => f.what),
               flags: flags };
    });
    ok(!landed.fail, 'the two presses create the deal and log its email', landed.fail);
    if (!landed.fail){
      ok(landed.ix === 1,
         'the conversation that created the deal IS logged against it', String(landed.ix));
      ok(landed.open.length === 0,
         '…and no open step was invented alongside it', JSON.stringify(landed.open));
      ok(landed.noNextStep === true,
         'it shows in Today’s "No next step" band — a visible absence, not an invented task',
         String(landed.noNextStep));
      ok(!landed.overdue.concat(landed.dueToday).some(w => /Make first contact/.test(w)),
         'nothing anywhere in Today says "Make first contact"',
         landed.overdue.concat(landed.dueToday).join(','));
      ok(landed.flags.indexOf('No next step') >= 0,
         'and the deal carries the No-next-step flag, which asks the owner what happens next',
         JSON.stringify(landed.flags));
    }

    describe(vp.tag + ' — a step the batch actually names still lands');
    await seed();
    const due = await page.evaluate(() =>
      window.CRMCore.addDays(window.CRMApp.App.today, 9));
    const named = await batch({ nextStep:{ what:'Send the Q&A invite', dueDate:due } });
    ok(named.steps.length === 1 && named.steps[0].what === 'Send the Q&A invite',
       'a named next step is created exactly as before', JSON.stringify(named.steps));
    if (named.steps.length){
      ok(named.steps[0].due === due, '…on the date the batch gave it', named.steps[0].due);
      ok(named.created[0].defaulted === false,
         '…and the preview does not mark it as a default', String(named.created[0].defaulted));
    }

    describe(vp.tag + ' — a deal that arrives already won still gets none');
    await seed();
    const won = await batch({ outcome:'won' });
    ok(won.steps.length === 0, 'winning releases the next-step invariant (C7)',
       JSON.stringify(won.steps));

    describe(vp.tag + ' — the preview says what it will do, and no longer promises a step');
    const preview = await page.evaluate(async () => {
      const A = window.CRMApp.App, C = window.CRMCore;
      const d = n => C.addDays(A.today, n);
      A.events = []; A.seq = 0; window.CRMApp.refold();
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      A.triageText = JSON.stringify({ version:2, rows:[{
        company:'Corleen Reynders Ltd', deal:'CDMP Training enquiry',
        owner:'thabo', stage:'lead',
        contactName:'Corleen Reynders', contactEmail:'corleen@reynders.test',
        kind:'email', occurredAt:d(-9),
        summary:'New CDMP enquiry; sent the fundamentals and practitioner outline.',
        messageId:'<c1@mail>' }] });
      A.view = 'settings'; window.CRMApp.render();
      await new Promise(r => setTimeout(r, 500));
      const txt = (document.querySelector('#content') || {}).textContent || '';
      return { txt: txt.replace(/\s+/g, ' ') };
    });
    ok(!/Every new deal gets a first next step/.test(preview.txt),
       'the old promise that every new deal gets a step is gone',
       preview.txt.slice(0, 200));

    describe(vp.tag + ' — the new-deal FORM keeps its own default, deliberately');
    const form = await page.evaluate(async () => {
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      const A = window.CRMApp.App, C = window.CRMCore;
      A.view = 'pipeline'; window.CRMApp.render();
      await new Promise(r => setTimeout(r, 350));
      const nd = Array.from(document.querySelectorAll('button')).find(x => /New deal/.test(x.textContent));
      if (!nd) return { fail:'no New deal button' };
      nd.click();
      await new Promise(r => setTimeout(r, 350));
      const pop = document.querySelector('.pop');
      if (!pop) return { fail:'the new-deal form did not open' };
      /* Exercise it rather than reading the placeholder: the default is applied
         on SAVE when the step box is left blank, which is the behaviour that
         must survive. */
      const set = (label, v) => {
        const el = pop.querySelector('[aria-label="' + label + '"]');
        if (el){ el.value = v; el.dispatchEvent(new Event('input')); el.dispatchEvent(new Event('change')); }
        return !!el;
      };
      set('Company', 'Typed By Hand Ltd');
      set('Deal name', 'A deal nobody has called yet');
      const own = pop.querySelector('[aria-label="Owner"]');
      if (own && !own.value) own.value = (own.querySelector('option[value]:not([value=""])') || {}).value || '';
      const save = Array.from(pop.querySelectorAll('button')).find(x => /^Create$/.test(x.textContent.trim()));
      if (!save) return { fail:'no Create button', txt: pop.textContent.replace(/\s+/g, ' ') };
      save.click();
      await new Promise(r => setTimeout(r, 500));
      const deal = Object.keys(A.st.deals).map(k => A.st.deals[k])
        .filter(x => /A deal nobody has called yet/.test(x.name))[0];
      return { made: !!deal,
               steps: deal ? C.openFollowupsFor(A.st, deal.id).map(f => f.what) : [] };
    });
    ok(!form.fail, 'the in-app new-deal form opens and saves', form.fail);
    if (!form.fail){
      ok(form.made, 'a deal typed by hand is created', String(form.made));
      ok(form.steps.length === 1 && form.steps[0] === 'Make first contact',
         'and with the step box left blank it still defaults to "Make first contact" \u2014 ' +
         'a hand-typed deal may genuinely have had no contact yet',
         JSON.stringify(form.steps));
    }

    ok(errs.length === 0, 'no page errors', errs.join(' | '));
    await page.close();
  }
  await b.close();
  console.log('\n' + (fail ? '\x1b[31m' : '\x1b[32m') + pass + ' passed, ' + fail + ' failed\x1b[0m');
  if (fail){ console.log(fails.map(f => '  - ' + f).join('\n')); process.exit(1); }
})();
