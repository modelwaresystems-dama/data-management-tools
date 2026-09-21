/* Every screen, every demo deal panel and edit form, both widths: nothing throws.
   A stand-in for the full layout suite, which was lost with the old workspace. */
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const file = path.resolve(process.argv[2] || 'crm.html');
  const b = await chromium.launch(require('./browser.js'));
  let bad = 0, checked = 0;
  for (const vp of [[1440,950],[390,844]]){
    const p = await b.newPage({ viewport:{ width:vp[0], height:vp[1] } });
    const errs = []; p.on('pageerror', e => errs.push(String(e)));
    await p.goto('file://' + file); await p.waitForTimeout(900);
    const r = await p.evaluate(async () => {
      const A = window.CRMApp.App, out = [];
      for (const v of ['today','pipeline','companies','week','people','money','debtors','settings']){
        A.view = v; window.CRMApp.render(); await new Promise(r => setTimeout(r, 120));
        out.push(v + ':' + (document.querySelector('#content') || {}).childElementCount);
      }
      const ids = Object.keys(A.st.deals);
      for (const id of ids){
        window.CRMApp.openDeal(id); await new Promise(r => setTimeout(r, 40));
        const e = Array.from(document.querySelectorAll('.panel button')).find(x => x.textContent.trim() === 'Edit');
        if (e){ e.click(); await new Promise(r => setTimeout(r, 40)); }
        Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
      }
      return { views: out, deals: ids.length };
    });
    checked += r.views.length + r.deals;
    console.log(vp.join('x') + '  views ' + r.views.join(' ') + '  · ' + r.deals + ' deal panels + edit forms');
    if (errs.length){ bad += errs.length; console.log('  ERRORS: ' + errs.join(' | ')); }
    await p.close();
  }
  await b.close();
  console.log(bad ? bad + ' page errors' : 'no page errors across ' + checked + ' screens');
  process.exit(bad ? 1 : 0);
})();
