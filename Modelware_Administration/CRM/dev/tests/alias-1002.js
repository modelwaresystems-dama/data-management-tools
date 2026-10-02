/* "Why isnt Paul Bolton and paul bolton" (Howard, 2 Oct 2026.)

   Settings' "Your user id" is free text, and it is the id stamped on every
   event that browser writes — and the name of the file it writes to. Paul typed
   "paul bolton"; config.json calls him "paul". So the version table showed
   "Paul Bolton — never opened" beside a stranger with the same name, and
   everything Paul logged belonged to nobody. */
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

    describe(vp.tag + ' — an alias makes one person of two ids, over the whole log');
    const core = await page.evaluate(() => {
      const C = window.CRMCore;
      const cfg = { stages:[{id:'lead',label:'Lead',probability:0.1}],
        thresholds:{ pushedCount:3, silentDays:30, stalledDays:45 },
        currencies:['ZAR'], defaultCurrency:'ZAR',
        users:[{ id:'howard', name:'Howard Diesel' }, { id:'paul', name:'Paul Bolton', sales:true }] };
      let n = 0;
      const ev = (actor, type, payload) => ({ id:'a'+n, ts:'2026-09-0' + (1 + (n % 8)) + 'T08:00:00Z',
        seq:n++, actor:actor, type, payload });
      /* everything Paul wrote while calling himself "paul bolton" */
      const base = [
        ev('howard', 'company.created', { companyId:'c1', name:'NBFIRA' }),
        ev('paul bolton', 'deal.created', { dealId:'d1', companyId:'c1', name:'Awareness training',
                                            owner:'paul bolton', stage:'lead' }),
        ev('paul bolton', 'interaction.logged', { interactionId:'x1', subjectType:'deal', subjectId:'d1',
                                                  kind:'email', occurredAt:'2026-09-18', summary:'Chased for feedback.' }),
        ev('paul bolton', 'followup.created', { followupId:'f1', subjectType:'deal', subjectId:'d1',
                                                owner:'paul bolton', dueDate:'2026-10-02', what:'Chase again' }),
        ev('paul bolton', 'client.build', { build:'47741f90', version:'1.51.0', builtAt:'2 Oct 2026' })
      ];
      const before = C.foldEvents(base, cfg, '2026-10-02');
      const after = C.foldEvents(base.concat([
        ev('howard', 'user.aliased', { from:'paul bolton', to:'paul' })]), cfg, '2026-10-02');
      const mine = (st, who) => C.bands(st, cfg, '2026-10-02', { scope:'mine', user:who })
        .overdue.concat(C.bands(st, cfg, '2026-10-02', { scope:'mine', user:who }).dueToday).length;
      return {
        beforeOwner: before.deals.d1.owner, afterOwner: after.deals.d1.owner,
        beforeStep: before.followups.f1.owner, afterStep: after.followups.f1.owner,
        beforeActor: before.interactions.x1.actor, afterActor: after.interactions.x1.actor,
        beforeClients: Object.keys(before.clients).sort().join(','),
        afterClients: Object.keys(after.clients).sort().join(','),
        beforeMine: mine(before, 'paul'), afterMine: mine(after, 'paul'),
        aliases: after.userAliases,
        /* and the way back */
        undone: C.foldEvents(base.concat([
          ev('howard', 'user.aliased', { from:'paul bolton', to:'paul' }),
          ev('howard', 'user.unaliased', { from:'paul bolton' })]), cfg, '2026-10-02').deals.d1.owner
      };
    });
    ok(core.beforeOwner === 'paul bolton' && core.beforeStep === 'paul bolton',
       'before: the deal and the step belong to an id nobody on the roster has',
       core.beforeOwner + ' / ' + core.beforeStep);
    ok(core.beforeMine === 0, '…so nothing of his shows in Paul\'s own Today', String(core.beforeMine));
    ok(core.afterOwner === 'paul' && core.afterStep === 'paul',
       'after one alias, the deal and the step are Paul\'s', core.afterOwner + ' / ' + core.afterStep);
    ok(core.afterActor === 'paul', '…and so is everything he logged', core.afterActor);
    ok(core.afterMine === 1, '…and it reaches his Today', String(core.afterMine));
    ok(core.beforeClients === 'paul bolton' && core.afterClients === 'paul',
       'the version row stops being a stranger and becomes his',
       core.beforeClients + ' -> ' + core.afterClients);
    ok(core.undone === 'paul bolton', 'separating them puts it back exactly as it was', core.undone);

    describe(vp.tag + ' — it applies to what was written BEFORE anybody noticed');
    const ordering = await page.evaluate(() => {
      const C = window.CRMCore;
      const cfg = { stages:[{id:'lead',label:'Lead',probability:0.1}],
        thresholds:{ pushedCount:3, silentDays:30, stalledDays:45 }, currencies:['ZAR'],
        users:[{ id:'paul', name:'Paul Bolton' }] };
      let n = 0;
      const ev = (actor, type, payload) => ({ id:'o'+n, ts:'2026-09-0' + (1 + (n % 8)) + 'T08:00:00Z',
        seq:n++, actor, type, payload });
      /* the alias arrives LAST, long after the work */
      const st = C.foldEvents([
        ev('paul bolton', 'company.created', { companyId:'c1', name:'X' }),
        ev('paul bolton', 'deal.created', { dealId:'d1', companyId:'c1', name:'D', owner:'paul bolton', stage:'lead' }),
        ev('howard', 'user.aliased', { from:'paul bolton', to:'paul' })
      ], cfg, '2026-10-02');
      /* a chain, and a loop that must not hang */
      const chain = C.foldEvents([
        ev('a', 'company.created', { companyId:'c1', name:'X' }),
        ev('a', 'deal.created', { dealId:'d1', companyId:'c1', name:'D', owner:'a', stage:'lead' }),
        ev('h', 'user.aliased', { from:'a', to:'b' }),
        ev('h', 'user.aliased', { from:'b', to:'paul' })
      ], cfg, '2026-10-02');
      const loop = C.foldEvents([
        ev('a', 'company.created', { companyId:'c1', name:'X' }),
        ev('a', 'deal.created', { dealId:'d1', companyId:'c1', name:'D', owner:'a', stage:'lead' }),
        ev('h', 'user.aliased', { from:'a', to:'b' }),
        ev('h', 'user.aliased', { from:'b', to:'a' })
      ], cfg, '2026-10-02');
      return { retro: st.deals.d1.owner, chain: chain.deals.d1.owner, loop: loop.deals.d1.owner };
    });
    ok(ordering.retro === 'paul',
       'an alias written today fixes work logged last month', ordering.retro);
    ok(ordering.chain === 'paul', 'a chain of ids resolves to the end of it', ordering.chain);
    ok(!!ordering.loop, 'a loop resolves to something rather than hanging the tab', String(ordering.loop));

    describe(vp.tag + ' — and the field that caused it now refuses');
    const field = await page.evaluate(async () => {
      const A = window.CRMApp.App;
      Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      A.config = Object.assign({}, A.config, { users:[
        { id:'howard', name:'Howard Diesel' }, { id:'paul', name:'Paul Bolton', sales:true }] });
      A.view = 'settings'; window.CRMApp.render();
      await new Promise(r => setTimeout(r, 400));
      const heads = Array.from(document.querySelectorAll('#content .co-head'))
        .filter(x => /Team sync|GitHub|sync/i.test(x.textContent));
      if (heads.length) heads[0].click();
      await new Promise(r => setTimeout(r, 250));
      const inp = document.querySelector('#content input[aria-label="Your user id"]');
      if (!inp) return { fail:'no user id field' };
      const list = inp.getAttribute('list');
      const opts = list ? Array.from(document.querySelectorAll('#' + list + ' option')).map(o => o.value) : [];
      inp.value = 'paul bolton'; inp.dispatchEvent(new Event('input'));
      await new Promise(r => setTimeout(r, 150));
      const warn = (inp.parentNode.querySelector('.note[style*="overdue"]') ||
                    Array.from(inp.parentNode.querySelectorAll('.note')).pop() || {}).textContent || '';
      inp.value = 'paul'; inp.dispatchEvent(new Event('input'));
      await new Promise(r => setTimeout(r, 150));
      const cleared = (Array.from(inp.parentNode.querySelectorAll('.note')).pop() || {}).textContent || '';
      return { opts: opts.join(','), warn, cleared };
    });
    ok(!field.fail, 'Settings has the user id field', field.fail);
    if (!field.fail){
      ok(/howard/.test(field.opts) && /paul/.test(field.opts),
         'the roster is offered rather than left to typing', field.opts);
      ok(/not an id in config\.json/.test(field.warn), 'typing an id nobody has is called out', field.warn);
      ok(/did you mean .paul./.test(field.warn), '…with the one they meant', field.warn);
      ok(/events\/paul bolton\.jsonl/.test(field.warn),
         '…and what it would do: write to a file of its own', field.warn);
      ok(cleanedUp(field.cleared), 'a valid id clears the warning', field.cleared);
    }
    function cleanedUp(t){ return !/not an id in config/.test(t); }

    describe(vp.tag + ' — the version table offers the repair');
    const table = await page.evaluate(async () => {
      const A = window.CRMApp.App, E = window.CRMApp.emit;
      A.events = []; A.seq = 0; A.scope = 'team'; A.lens = null;
      A.workspace = 'team';          /* the version table only exists there */
      A.config = Object.assign({}, A.config, { users:[
        { id:'howard', name:'Howard Diesel' }, { id:'paul', name:'Paul Bolton', sales:true }] });
      E('client.build', { build:'47741f90', version:'1.51.0', builtAt:'2 Oct 2026' });
      /* a row written by the stray id */
      A.events.push({ id:'ev_stray', ts:'2026-10-02T06:00:00Z', seq:999, actor:'paul bolton',
                      type:'client.build', payload:{ build:'2a5b0e02', version:'1.45.0' } });
      window.CRMApp.refold();
      A.view = 'settings'; window.CRMApp.render();
      await new Promise(r => setTimeout(r, 400));
      const head = Array.from(document.querySelectorAll('#content .co-head'))
        .find(x => /Who.s on which version/.test(x.textContent));
      if (head) head.click();
      await new Promise(r => setTimeout(r, 250));
      const sec = Array.from(document.querySelectorAll('#content section'))
        .find(x => /Who.s on which version/.test(x.textContent));
      const txt = sec ? sec.textContent.replace(/\s+/g, ' ') : '';
      const sel = sec && sec.querySelector('select[aria-label="Who is paul bolton"]');
      const preset = sel ? sel.value : '';
      const btn = sec && Array.from(sec.querySelectorAll('button')).find(x => /same person/.test(x.textContent));
      if (btn) btn.click();
      await new Promise(r => setTimeout(r, 400));
      return { txt, preset, hadBtn: !!btn,
               alias: JSON.stringify(A.st.userAliases || {}),
               after: (document.querySelector('#content') || {}).textContent.replace(/\s+/g, ' ') };
    });
    ok(/not in config\.json/.test(table.txt), 'the stray id is shown, not hidden', table.txt.slice(0, 200));
    ok(table.preset === 'paul', '…with the likely person already picked', table.preset);
    ok(table.hadBtn, '…and a button that says they are the same person');
    ok(/"paul bolton":"paul"/.test(table.alias), 'pressing it records the alias', table.alias);
    ok(/counts as Paul Bolton/.test(table.after) && /separate them/.test(table.after),
       '…and the table then says so, with the way back', table.after.slice(0, 400));

    describe(vp.tag + ' — no page errors');
    ok(!errs.length, 'nothing threw', errs.join(' | '));
    await page.close();
  }
  await b.close();
  console.log('\n' + '─'.repeat(58));
  console.log(fail ? '\x1b[31m\x1b[1m' + pass + ' passed, ' + fail + ' FAILED.\x1b[0m' : '\x1b[32m\x1b[1m' + pass + ' passed, 0 failed.\x1b[0m');
  if (fail){ console.log('\nFailures:'); fails.forEach(f => console.log('  • ' + f)); process.exit(1); }
})();
