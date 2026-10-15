/* "Please extend the size of the dialog on the right hand side as it is getting
   squashed and the Invoice line items dont align." (Howard, 15 Oct 2026.)

   Two faults in one sentence. The slide-over was fixed at 560px, chosen when it
   held a deal's facts and its history and not the purchase orders, quotes,
   six-column money table and six-field invoice editor it carries now. And the
   line editor's column heads were right-aligned over left-aligned inputs, so
   the label and the figure it named never lined up.

   The width is now 760 by default, draggable, and remembered per browser —
   because one number cannot be right on a laptop and a 32-inch monitor both. */
const { chromium } = require('playwright');
const path = require('path');
let pass = 0, fail = 0; const fails = [];
const ok = (c, m, extra) => { if (c){ pass++; console.log('  \x1b[32m✓\x1b[0m ' + m); }
  else { fail++; fails.push(m); console.log('  \x1b[31m✗ ' + m + '\x1b[0m' + (extra ? '  [' + String(extra).slice(0, 400) + ']' : '')); } };
const describe = t => console.log('\n\x1b[1m' + t + '\x1b[0m');

const seedScript = () => {
  const A = window.CRMApp.App, E = window.CRMApp.emit;
  Array.from(document.querySelectorAll('#layers > *')).forEach(n => n.remove());
  A.lens = null; A.scope = 'team'; A.workspace = 'team'; A.events = []; A.seq = 0;
  E('company.created', { companyId:'sb', name:'Standard Bank' });
  E('deal.created', { dealId:'d1', companyId:'sb', name:'DAMA exam completions',
                      owner:A.me, stage:'proposal', value:44890, currency:'ZAR',
                      commissionRate:0.2 });
  E('invoice.raised', { invoiceId:'i1', dealId:'d1', number:'INV0001560',
                        issuedOn:'2026-10-14', dueDate:'2026-11-13', currency:'ZAR',
                        vatRate:0.15, net:44890, passThrough:4890, vat:6000,
                        lines:[
                          { description:'DMC course', net:40000, commissionRate:0.2 },
                          { description:'DMBOK Second Edition', net:4890,
                            passThrough:4890, vatRate:0, commissionRate:0 }] });
  window.CRMApp.refold();
};

(async () => {
  const file = path.resolve(process.argv[2] || 'crm.html');
  const b = await chromium.launch(require('./browser.js'));

  /* ------------------------------------------------------------- the desktop */
  {
    const page = await b.newPage({ viewport:{ width:1440, height:950 } });
    const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.goto('file://' + file); await page.waitForTimeout(900);
    await page.evaluate(() => { try { localStorage.removeItem('crm.panel.width'); } catch (e){} });
    await page.evaluate(seedScript);

    describe('desktop — the panel opens wider than it used to');
    const opened = await page.evaluate(async () => {
      window.CRMApp.openDeal('d1');
      await new Promise(r => setTimeout(r, 400));
      const p = document.querySelector('.panel');
      if (!p) return { fail:'no panel' };
      const grip = p.querySelector('.grip');
      const head = p.querySelector('header');
      return { w: p.offsetWidth, grip: !!grip,
               gripLabel: grip ? grip.getAttribute('aria-label') : null,
               /* the header buttons used to wrap onto a second row at 560 */
               headLines: head ? head.offsetHeight : null };
    });
    ok(!opened.fail, 'the deal panel opens', opened.fail);
    ok(opened.w === 760, 'it is 760px wide, not 560', String(opened.w));
    ok(opened.grip, 'and it has a grab edge on the left', String(opened.grip));
    ok(/resize/i.test(opened.gripLabel || ''),
       '…which says what it is for, to a screen reader as well', opened.gripLabel);

    describe('desktop — dragging it, and the width sticking');
    const dragged = await page.evaluate(async () => {
      const p = document.querySelector('.panel'), grip = p.querySelector('.grip');
      const fire = (type, x) => grip.dispatchEvent(new PointerEvent(type, {
        bubbles:true, cancelable:true, clientX:x, clientY:400, pointerId:1 }));
      const startX = p.getBoundingClientRect().left;
      fire('pointerdown', startX);
      const sizingClass = p.classList.contains('sizing');
      fire('pointermove', startX - 180);          /* drag LEFT = wider */
      const wider = p.offsetWidth;
      fire('pointermove', startX + 600);          /* drag far right = past the floor */
      const floored = p.offsetWidth;
      fire('pointermove', startX - 5000);         /* and far left = past the ceiling */
      const capped = p.offsetWidth;
      fire('pointermove', startX - 180);
      fire('pointerup', startX - 180);
      const stillSizing = p.classList.contains('sizing');
      let stored = null; try { stored = localStorage.getItem('crm.panel.width'); } catch (e){}
      /* close and reopen: the width has to come back */
      window.CRMApp.closePanel();
      await new Promise(r => setTimeout(r, 120));
      window.CRMApp.openDeal('d1');
      await new Promise(r => setTimeout(r, 350));
      return { sizingClass, wider, floored, capped, stillSizing, stored,
               reopened: document.querySelector('.panel').offsetWidth,
               viewport: document.documentElement.clientWidth };
    });
    ok(dragged.sizingClass === true && dragged.stillSizing === false,
       'the drag marks the panel while it is happening, and unmarks it after',
       JSON.stringify({ during:dragged.sizingClass, after:dragged.stillSizing }));
    ok(dragged.wider === 940, 'dragging left by 180 makes it 180 wider', String(dragged.wider));
    ok(dragged.floored === 420,
       'it cannot be dragged narrower than 420 — below that the money table is unreadable',
       String(dragged.floored));
    ok(dragged.capped === dragged.viewport - 80,
       'nor wider than the viewport less 80, so the scrim stays clickable',
       dragged.capped + ' of ' + dragged.viewport);
    ok(Number(dragged.stored) === 940, 'the width is remembered', dragged.stored);
    ok(dragged.reopened === 940, '…and the next panel opens at it', String(dragged.reopened));

    describe('desktop — the keyboard can do it too');
    const keys = await page.evaluate(async () => {
      const p = document.querySelector('.panel'), grip = p.querySelector('.grip');
      const key = (k, shift) => grip.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles:true, cancelable:true, key:k, shiftKey:!!shift }));
      key('ArrowLeft');  const a = p.offsetWidth;
      key('ArrowRight'); const bb = p.offsetWidth;
      key('ArrowLeft', true); const c = p.offsetWidth;
      key('Home'); const home = p.offsetWidth;
      grip.dispatchEvent(new MouseEvent('dblclick', { bubbles:true }));
      return { a, b:bb, c, home, reset: p.offsetWidth };
    });
    ok(keys.a === 960 && keys.b === 940, 'left and right arrows move it 20px', JSON.stringify(keys));
    ok(keys.c === 1020, 'shift makes the step 80', String(keys.c));
    ok(keys.home === 760 && keys.reset === 760,
       'Home, and a double-click, put it back to 760', JSON.stringify({ home:keys.home, dbl:keys.reset }));

    describe('desktop — the invoice line items line up');
    const lines = await page.evaluate(async () => {
      const ed = Array.from(document.querySelectorAll('.panel a, .panel button'))
        .find(x => /^edit$/i.test(x.textContent.trim()) && x.closest('td'));
      if (!ed) return { fail:'no edit control on the invoice row' };
      ed.click();
      await new Promise(r => setTimeout(r, 400));
      const pop = document.querySelector('.pop');
      const row = pop.querySelector('.line-row'), head = pop.querySelector('.line-head');
      if (!row || !head) return { fail:'no line editor' };
      const cols = getComputedStyle(row).gridTemplateColumns.split(' ');
      const headCols = getComputedStyle(head).gridTemplateColumns.split(' ');
      const ins = Array.from(row.querySelectorAll('input'));
      const px = v => Math.round(parseFloat(v));
      return { popW: pop.offsetWidth,
               cols: cols.length, same: cols.join('|') === headCols.join('|'),
               colPx: cols.map(px),
               desc: ins[0].offsetWidth,
               descAlign: getComputedStyle(ins[0]).textAlign,
               numAlign: ins.slice(1).map(i => getComputedStyle(i).textAlign),
               headAlign: Array.from(head.querySelectorAll('span'))
                 .map(sp => getComputedStyle(sp).textAlign),
               /* nothing clipped: every input fits inside its own cell */
               overflow: ins.some((i, k) => i.offsetWidth > px(cols[k]) + 1) };
    });
    ok(!lines.fail, 'the invoice editor opens from the panel', lines.fail);
    if (!lines.fail){
      ok(lines.popW === 600, 'the editor is 600px wide, not 380', String(lines.popW));
      ok(lines.cols === 6, 'the line grid has six columns — description, net, resale, vat %, comm %, remove',
         String(lines.cols));
      ok(lines.same, 'the head row uses exactly the same column widths as the inputs',
         JSON.stringify(lines.colPx));
      ok(lines.desc >= 200,
         'the description is wide enough to read a line name, not "DMC cou"', String(lines.desc));
      /* an untouched input computes as "start", which is the same thing */
      ok(/^(left|start)$/.test(lines.descAlign) && lines.numAlign.every(a => a === 'right'),
         'the description reads left and every figure reads right',
         lines.descAlign + ' / ' + lines.numAlign.join(','));
      ok(/^(left|start)$/.test(lines.headAlign[0]) && lines.headAlign.slice(1, 5).every(a => a === 'right'),
         '…and each head sits over its own column the same way',
         lines.headAlign.join(','));
      ok(lines.overflow === false, 'nothing overflows its cell', String(lines.overflow));
    }

    ok(errs.length === 0, 'no page errors', errs.join(' | '));
    await page.close();
  }

  /* --------------------------------------------------------------- the phone */
  {
    const page = await b.newPage({ viewport:{ width:390, height:844 } });
    const errs = []; page.on('pageerror', e => errs.push(String(e)));
    await page.goto('file://' + file); await page.waitForTimeout(900);
    /* a remembered desktop width must not follow the panel onto a phone */
    await page.evaluate(() => { try { localStorage.setItem('crm.panel.width', '940'); } catch (e){} });
    await page.evaluate(seedScript);

    describe('phone — the panel is the screen, so there is nothing to drag');
    const small = await page.evaluate(async () => {
      window.CRMApp.openDeal('d1');
      await new Promise(r => setTimeout(r, 400));
      const p = document.querySelector('.panel');
      return { w: p.offsetWidth, vw: document.documentElement.clientWidth,
               grip: !!p.querySelector('.grip'), inline: p.style.width || '' };
    });
    ok(small.grip === false, 'no grab edge below the mobile floor', String(small.grip));
    ok(small.inline === '', '…and no inline width, so the CSS keeps it full-bleed',
       JSON.stringify(small.inline));
    ok(small.w === small.vw, 'the panel still fills the screen', small.w + ' of ' + small.vw);

    describe('phone — and the line editor still fits');
    const fits = await page.evaluate(async () => {
      const ed = Array.from(document.querySelectorAll('.panel a, .panel button'))
        .find(x => /^edit$/i.test(x.textContent.trim()) && x.closest('td'));
      if (!ed) return { fail:'no edit control' };
      ed.click();
      await new Promise(r => setTimeout(r, 400));
      const pop = document.querySelector('.pop');
      const row = pop.querySelector('.line-row');
      const cols = getComputedStyle(row).gridTemplateColumns.split(' ');
      return { popW: pop.offsetWidth, vw: document.documentElement.clientWidth,
               cols: cols.length,
               scrolls: document.documentElement.scrollWidth > document.documentElement.clientWidth };
    });
    ok(!fits.fail, 'the editor opens on a phone', fits.fail);
    if (!fits.fail){
      ok(fits.popW <= fits.vw - 16, 'it is clamped to the viewport', fits.popW + ' of ' + fits.vw);
      ok(fits.cols === 6, 'with all six columns still there', String(fits.cols));
      ok(fits.scrolls === false, 'and the page does not scroll sideways', String(fits.scrolls));
    }

    ok(errs.length === 0, 'no page errors', errs.join(' | '));
    await page.close();
  }

  await b.close();
  console.log('\n' + (fail ? '\x1b[31m' : '\x1b[32m') + pass + ' passed, ' + fail + ' failed\x1b[0m');
  if (fail){ console.log(fails.map(f => '  - ' + f).join('\n')); process.exit(1); }
})();
