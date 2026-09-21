/* Reassigning a deal carries its open steps.
   "In some cases we get the wrong Owner and it needs to be reassigned — you must
   transfer the Outstanding Tasks as well." (Howard, 21 Sep 2026, NMG Botswana)
   Runs the real crm.html in Chromium: core, the Edit form, the deal panel, the import. */
const { chromium } = require('playwright');
const path = require('path');
let pass = 0, fail = 0; const fails = [];
const ok = (c, m, extra) => { if (c){ pass++; console.log('  \x1b[32m✓\x1b[0m ' + m); }
  else { fail++; fails.push(m + (extra ? '  [' + extra + ']' : '')); console.log('  \x1b[31m✗ ' + m + '\x1b[0m' + (extra ? '  [' + extra + ']' : '')); } };
const describe = t => console.log('\n\x1b[1m' + t + '\x1b[0m');

(async () => {
  const file = path.resolve(process.argv[2] || 'crm.html');
  const b = await chromium.launch(require('./browser.js'));
  for (const vp of [{ tag:'desktop', width:1440, height:950 }, { tag:'phone', width:390, height:844 }]){
    const page = await b.newPage({ viewport:{ width:vp.width, height:vp.height } });
    const errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    await page.goto('file://' + file);
    await page.waitForTimeout(900);

    const seed = async () => page.evaluate(() => {
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      const A = window.CRMApp.App, E = window.CRMApp.emit;
      A.config = Object.assign({}, A.config, { users:[
        { id:'howard', name:'Howard Diesel', sales:false },
        { id:'paul', name:'Paul Bolton', sales:true },
        { id:'debbie', name:'Debbie Diesel', sales:true },
        { id:'veronica', name:'Veronica', sales:false } ] });
      A.lens = null; A.events = []; A.seq = 0; A.me = 'howard';
      E('company.created', { companyId:'nmg', name:'NMG Administrators Botswana' });
      E('deal.created', { dealId:'dn', companyId:'nmg', name:'CDMP quotation', owner:'paul', stage:'lead' });
      E('followup.created', { followupId:'f1', subjectType:'deal', subjectId:'dn', owner:'paul',
                              dueDate:'2026-09-21', what:"Get Otsile's response to the CDMP quotation" });
      E('followup.created', { followupId:'f2', subjectType:'deal', subjectId:'dn', owner:'paul',
                              dueDate:'2026-09-21', what:'Send NMG the full quotation with banking details' });
      /* deliberately delegated — must be offered, and must survive being unticked */
      E('followup.created', { followupId:'f3', subjectType:'deal', subjectId:'dn', owner:'veronica',
                              dueDate:'2026-09-22', what:'Raise the invoice' });
      /* already done — must never move */
      E('followup.created', { followupId:'f4', subjectType:'deal', subjectId:'dn', owner:'paul',
                              dueDate:'2026-09-01', what:'Old step' });
      E('followup.completed', { followupId:'f4' });
      window.CRMApp.refold();
    });

    describe(vp.tag + ' — core');
    await seed();
    const core = await page.evaluate(() => {
      const C = window.CRMCore, st = window.CRMApp.App.st;
      return { hand: C.stepsToHandOver(st, 'dn', 'debbie').map(f => f.id).join(','),
               handSame: C.stepsToHandOver(st, 'dn', 'paul').map(f => f.id).join(','),
               strand: C.strandedSteps(st, 'dn').map(f => f.id).join(',') };
    });
    ok(core.hand === 'f1,f2,f3', 'every OPEN step not already with the new owner is offered', core.hand);
    ok(core.handSame === 'f3', '…and a step already with that person is not', core.handSame);
    ok(core.strand === 'f3', 'a step with somebody other than the owner is reported as stranded', core.strand);

    describe(vp.tag + ' — the Edit form moves the steps with the deal');
    await seed();
    const form = await page.evaluate(async () => {
      const A = window.CRMApp.App;
      window.CRMApp.openDeal('dn');
      await new Promise(r => setTimeout(r, 300));
      const edit = Array.from(document.querySelectorAll('.panel button')).find(x => x.textContent.trim() === 'Edit');
      if (!edit) return { fail:'no Edit button on the deal panel' };
      edit.click();
      await new Promise(r => setTimeout(r, 300));
      const sel = document.querySelector('select[aria-label="Owner"]');
      if (!sel) return { fail:'no Owner select' };
      const before = document.querySelectorAll('.handover input[type=checkbox]').length;
      sel.value = 'debbie'; sel.dispatchEvent(new Event('change'));
      await new Promise(r => setTimeout(r, 150));
      const boxes = Array.from(document.querySelectorAll('.handover input[type=checkbox]'));
      const listed = boxes.length, allTicked = boxes.every(x => x.checked);
      const note = document.querySelector('.handover').textContent;
      /* untick the delegated one */
      const vero = boxes.find(x => /Raise the invoice/.test(x.getAttribute('aria-label')));
      if (vero) vero.checked = false;
      const save = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === 'Save');
      if (!save) return { fail:'no Save button' };
      save.click();
      await new Promise(r => setTimeout(r, 300));
      const st = A.st;
      const out = { before, listed, allTicked, note,
        deal: st.deals.dn.owner, f1: st.followups.f1.owner, f2: st.followups.f2.owner,
        f3: st.followups.f3.owner, f4: st.followups.f4.owner,
        evs: A.events.filter(e => e.type === 'followup.updated').length,
        panel: (document.querySelector('.panel') || {}).textContent || '' };
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      return out;
    });
    ok(!form.fail, 'the Edit form opens with an Owner choice', form.fail);
    if (!form.fail){
      ok(form.listed === 3, 'changing the owner lists the three open steps', String(form.listed));
      ok(form.allTicked, '…all ticked, because moving them is the default');
      ok(/go to Debbie Diesel with the deal/.test(form.note), '…saying where they are going', form.note.slice(0, 120));
      ok(form.deal === 'debbie', 'the deal is Debbie\'s');
      ok(form.f1 === 'debbie' && form.f2 === 'debbie', 'Paul\'s open steps went with it', form.f1 + ',' + form.f2);
      ok(form.f3 === 'veronica', 'the unticked delegated step stayed with Veronica', form.f3);
      ok(form.f4 === 'paul', 'a completed step is history and is left alone', form.f4);
      ok(form.evs === 2, 'exactly one event per step moved', String(form.evs));
    }

    describe(vp.tag + ' — Today follows the steps');
    const today = await page.evaluate(() => {
      const C = window.CRMCore, st = window.CRMApp.App.st;
      const mine = u => Object.values(st.followups).filter(f => f.status === 'open' && f.owner === u).map(f => f.id).sort().join(',');
      return { paul: mine('paul'), debbie: mine('debbie') };
    });
    ok(today.paul === '', 'nothing on NMG is left in Paul\'s list', today.paul);
    ok(today.debbie === 'f1,f2', '…and Debbie has both steps', today.debbie);

    describe(vp.tag + ' — a deal already stranded (the NMG case as it stands) is fixable in one press');
    await seed();
    const stranded = await page.evaluate(async () => {
      const A = window.CRMApp.App, E = window.CRMApp.emit;
      /* the state in the screenshot: the deal was moved to Debbie before this build */
      E('deal.updated', { dealId:'dn', owner:'debbie' });
      window.CRMApp.openDeal('dn');
      await new Promise(r => setTimeout(r, 300));
      const panel = document.querySelector('.panel');
      const box = panel.querySelector('.stranded');
      const txt = box ? box.textContent : '';
      const btn = box && Array.from(box.querySelectorAll('button')).find(x => /Give them to Debbie Diesel/.test(x.textContent));
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 300));
      const after = document.querySelector('.panel .stranded');
      const st = A.st;
      const out = { txt, hasBtn: !!btn, gone: !after,
        owners: ['f1','f2','f3'].map(k => st.followups[k].owner).join(',') };
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      return out;
    });
    ok(/3 of these are with/.test(stranded.txt) && /Paul Bolton/.test(stranded.txt) && /Veronica/.test(stranded.txt),
       'the panel says which steps are with somebody other than the owner', stranded.txt.slice(0, 160));
    ok(/Today/.test(stranded.txt), '…and what that means: they are in the wrong person\'s Today');
    ok(stranded.hasBtn, '…with a button that fixes it');
    ok(stranded.owners === 'debbie,debbie,debbie', 'pressing it gives them to the owner', stranded.owners);
    ok(stranded.gone, '…and the warning goes away');

    describe(vp.tag + ' — an unchanged owner moves nothing by default');
    await seed();
    const same = await page.evaluate(async () => {
      const A = window.CRMApp.App;
      window.CRMApp.openDeal('dn');
      await new Promise(r => setTimeout(r, 300));
      Array.from(document.querySelectorAll('.panel button')).find(x => x.textContent.trim() === 'Edit').click();
      await new Promise(r => setTimeout(r, 300));
      const boxes = Array.from(document.querySelectorAll('.handover input[type=checkbox]'));
      const ticked = boxes.filter(x => x.checked).length;
      Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === 'Save').click();
      await new Promise(r => setTimeout(r, 300));
      const out = { listed: boxes.length, ticked, f3: A.st.followups.f3.owner,
        evs: A.events.filter(e => e.type === 'followup.updated').length };
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      return out;
    });
    ok(same.listed === 1 && same.ticked === 0, 'with the owner unchanged, the delegated step is shown but not ticked',
       same.listed + '/' + same.ticked);
    ok(same.f3 === 'veronica' && same.evs === 0, '…so saving other edits never moves anybody\'s work', same.f3 + ' ' + same.evs);

    describe(vp.tag + ' — no page errors');
    ok(!errs.length, 'nothing threw', errs.join(' | '));
    await page.close();
  }

  /* the import path — pure, once */
  describe('import — a row that corrects the owner carries the open steps');
  const page = await b.newPage();
  await page.goto('file://' + file);
  await page.waitForTimeout(600);
  const imp = await page.evaluate(() => {
    const C = window.CRMCore;
    const cfg = { stages:[{id:'lead',label:'Lead',probability:0.1}], thresholds:{pushedCount:3,silentDays:30,stalledDays:45},
                  currencies:['BWP'], defaultCurrency:'BWP',
                  users:[{ id:'howard', name:'Howard Diesel' }, { id:'paul', name:'Paul Bolton', sales:true },
                         { id:'debbie', name:'Debbie Diesel', sales:true }] };
    let n = 0;
    const ev = (type, payload) => ({ id:'x'+n, ts:'2026-09-0' + (1 + (n % 8)) + 'T08:00:00Z', seq:n++, actor:'howard', type, payload });
    const st = C.foldEvents([
      ev('company.created', { companyId:'nmg', name:'NMG Administrators Botswana' }),
      ev('deal.created', { dealId:'dn', companyId:'nmg', name:'CDMP quotation', owner:'paul', stage:'lead' }),
      ev('followup.created', { followupId:'f1', subjectType:'deal', subjectId:'dn', owner:'paul', dueDate:'2026-09-21', what:'Chase Otsile' }),
      ev('followup.created', { followupId:'f2', subjectType:'deal', subjectId:'dn', owner:'paul', dueDate:'2026-09-21', what:'Send banking details' })
    ], cfg, '2026-09-21');
    const batch = { version:2, rows:[{ dealId:'dn', owner:'debbie', kind:'note', occurredAt:'2026-09-21',
      summary:'Owner corrected to Debbie.', messageId:'<t1@x>' }] };
    const res = C.importTriage(JSON.stringify(batch), st, cfg, { actor:'howard', today:'2026-09-21' });
    const dc = res.dealChanges[0];
    if (!dc) return { fail:'no deal change came back', errors:res.errors.join(' | ') };
    const evs = dc.events;
    const after = C.foldEvents([].concat(
      [ev('company.created', { companyId:'nmg', name:'NMG Administrators Botswana' })]), cfg, '2026-09-21');
    return { types: evs.map(e => e.type).join(','),
             moved: evs.filter(e => e.type === 'followup.updated').map(e => e.payload.followupId + '>' + e.payload.owner).join(','),
             note: (dc.changes.find(c => c.what === 'owner') || {}).note || '',
             ids: evs.map(e => e.id) };
  });
  ok(!imp.fail, 'an import row that names a different owner comes back as a deal change', (imp.fail || '') + ' ' + (imp.errors || ''));
  if (!imp.fail){
    ok(/^deal\.updated/.test(imp.types), 'the deal moves first', imp.types);
    ok(imp.moved === 'f1>debbie,f2>debbie', '…and both open steps move with it', imp.moved);
    ok(/2 open steps move with it/.test(imp.note), 'the review table says so before anything is applied', imp.note);
    ok(imp.ids.every(i => /^ev_/.test(i)) && new Set(imp.ids).size === imp.ids.length,
       'the ids are derived, so applying the batch twice cannot move them twice', imp.ids.join(','));
  }
  await page.close();
  await b.close();
  console.log('\n' + '─'.repeat(58));
  console.log(fail ? '\x1b[31m\x1b[1m' + pass + ' passed, ' + fail + ' FAILED.\x1b[0m' : '\x1b[32m\x1b[1m' + pass + ' passed, 0 failed.\x1b[0m');
  if (fail){ console.log('\nFailures:'); fails.forEach(f => console.log('  • ' + f)); process.exit(1); }
})();
