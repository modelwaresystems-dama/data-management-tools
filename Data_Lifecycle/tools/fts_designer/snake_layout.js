// snake_layout.js  -  the viewer's own "wrapped" layout: an FTS reads from the top left, left to right, and wraps to the next
// row when the pane width is used up; rows are justified to the full width; the initial pseudostate sits before the first state.
// Collapsed regions are drawn as single boxes in a row at the top; expanded regions are stacked bands. Transitions between
// rows run orthogonally through lanes in the gap below a row and, when rows are not adjacent, through a channel at the band's
// left (upward) or right (downward) edge, so no path crosses a state box. Output is an SVG string whose elements carry the same
// classes and ids as the Mermaid output (g.node id state-<id>-0, g.statediagram-cluster id <id>, g.edgeLabel) so the viewer's
// click, hover and collapse handlers work unchanged.
function snakeSvg(G, tops, availW, opts){
  opts=opts||{}; const mid=id=>String(id).replace(/[^A-Za-z0-9_]/g,"_"); const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const FONT=13, CH=7.3, BOXH=44, GAPX=112, PAD=18, TITLE=30, BANDPAD=22, MARG=16, LANE=15, GAP0=26, GAPEND=14;
  const W=Math.max(700, availW|0);
  const nodes=Object.fromEntries(G.nodes.map(n=>[n.id,n]));
  const inner=W-2*MARG, bandW=inner-2*PAD;
  function wrapName(name){ const words=String(name).split(/\s+/); const lines=[]; let cur=""; words.forEach(w=>{ if((cur+" "+w).trim().length>22 && cur){ lines.push(cur); cur=w; } else cur=(cur+" "+w).trim(); }); if(cur) lines.push(cur); return lines.slice(0,3); }
  function boxW(lines){ return Math.max(120, Math.min(260, Math.max(...lines.map(l=>l.length))*CH+28)); }
  const out=[], lab=[], pos={};
  let y=MARG+TITLE+14;
  // 1 collapsed tops in one row (wrapping if needed)
  const collapsedTops=tops.filter(t=>nodes[t.id]&&nodes[t.id].collapsedTop); const expandedTops=tops.filter(t=>nodes[t.id]&&!nodes[t.id].collapsedTop);
  if(collapsedTops.length){
    let x=MARG+PAD, rowTop=y, rowH=0;
    collapsedTops.forEach(t=>{ const lines=wrapName(t.name); const w=boxW(lines)+24, h=BOXH+18+(lines.length-1)*15; if(x+w>MARG+inner-PAD){ x=MARG+PAD; rowTop+=rowH+18; rowH=0; } rowH=Math.max(rowH,h);
      out.push('<g class="statediagram-cluster fts-collapsed-frame"><rect x="'+x+'" y="'+rowTop+'" width="'+w+'" height="'+h+'" rx="6" fill="var(--panel-2,#eef1f5)" stroke="var(--ink-faint,#888)" stroke-dasharray="6 4"/></g>');
      out.push('<g class="node statediagram-state fts-collapsed" id="state-'+mid(t.id)+'-0" style="cursor:pointer"><title>Click to expand '+esc(t.name)+'</title><rect x="'+(x+12)+'" y="'+(rowTop+9)+'" width="'+(w-24)+'" height="'+(h-18)+'" rx="6" fill="var(--panel,#fff)" stroke="var(--ink,#333)"/>'+lines.map((l,i)=>'<text x="'+(x+w/2)+'" y="'+(rowTop+h/2+(i-(lines.length-1)/2)*15+5)+'" text-anchor="middle" font-size="'+FONT+'" fill="var(--ink,#111)">'+esc(l)+'</text>').join("")+'</g>');
      pos[t.id]={x,y:rowTop,w,h,cx:x+w/2,cy:rowTop+h/2,row:-1}; x+=w+18; });
    y=rowTop+rowH+30;
  }
  // 2 expanded tops as bands
  expandedTops.forEach(top=>{
    const kids=G.nodes.filter(n=>n.parent===top.id); if(!kids.length) return;
    const ids=new Set(kids.map(k=>k.id)); const fwd={}; kids.forEach(k=>fwd[k.id]=[]);
    G.edges.forEach(e=>{ if(!e.inner && ids.has(e.a) && ids.has(e.b) && e.a!==e.b) fwd[e.a].push(e.b); });
    const startId=(G.initials.find(i=>ids.has(i)))||(kids.find(k=>k.initial)||kids[0]).id;
    // reading order: rank each state by its longest simple path from the initial state (so a retired, superseded or withdrawn
    // state reached early by a short cut still sits after the states it follows in the main flow); ties keep the model's declared order
    const declared={}; kids.forEach((k,i)=>declared[k.id]=i);
    const rank={}; rank[startId]=0;
    if(kids.length<=14){ const onPath=new Set(); (function dfs(x,d){ onPath.add(x); fwd[x].forEach(b=>{ if(onPath.has(b)) return; if(!(b in rank)||rank[b]<d+1) rank[b]=d+1; dfs(b,d+1); }); onPath.delete(x); })(startId,0); }
    else { const q=[startId]; while(q.length){ const x=q.shift(); fwd[x].forEach(b=>{ if(!(b in rank)){ rank[b]=rank[x]+1; q.push(b); } }); } }
    const order=kids.map(k=>k.id).sort((a,b)=>((a in rank)?rank[a]:999)-((b in rank)?rank[b]:999)||declared[a]-declared[b]);
    // pass 1: rows and x (typewriter wrap), then justify each row to the band width
    const bandX=MARG+PAD, x0=bandX+BANDPAD+40, xEnd=bandX+bandW-BANDPAD; let rx=x0, row=0; const rows=[[]];
    order.forEach(id=>{ const lines=wrapName(nodes[id].name); const w=boxW(lines); if(rx+w>xEnd && rows[row].length){ rx=x0; row++; rows.push([]); } pos[id]={x:rx,w,h:BOXH,row,lines}; rows[row].push(id); rx+=w+GAPX; });
    rows.forEach((r,ri)=>{ if(r.length>=2 && (ri<rows.length-1 || r.length>=3)){ const L=pos[r[r.length-1]]; const extra=(xEnd-(L.x+L.w))/(r.length-1); if(extra>0) r.forEach((id,i)=>{ pos[id].x+=extra*i; }); } r.forEach((id,i)=>{ pos[id].cx=pos[id].x+pos[id].w/2; if(r[i+1]) pos[id].next=r[i+1]; }); });
    // pass 2: lane demand per gap (gap g lies below row g; the gap after the last row exists too)
    const edges=G.edges.filter(e=>!e.inner && ids.has(e.a) && ids.has(e.b)); const pairIdx={}; const laneCount=new Array(rows.length+1).fill(0); const chanCount={L:0,R:0};
    const plans=edges.map(e=>{ const k=e.a+">"+e.b; const idx=(pairIdx[k]=(pairIdx[k]||0)); pairIdx[k]++; const A=pos[e.a], B=pos[e.b]; const p={e,idx,A,B};
      if(A.row===B.row){ if(A.next===e.b && idx===0) p.kind="straight"; else { p.kind="samerow"; p.l0=laneCount[A.row]++; } }
      else if(B.row>A.row){ if(B.row===A.row+1){ p.kind="down"; p.l0=laneCount[A.row]++; } else { p.kind="downchan"; p.l0=laneCount[A.row]++; p.c=chanCount.R++; p.l1=laneCount[B.row-1]++; } }
      else { if(A.row===B.row+1){ p.kind="up"; p.l0=laneCount[B.row]++; } else { p.kind="upchan"; p.l0=laneCount[A.row-1]++; p.c=chanCount.L++; p.l1=laneCount[B.row]++; } }
      return p; });
    // pass 3: row y from the gap sizes
    const bandY=y; const rowY=[]; let ry=bandY+TITLE+26; const gapY=[];
    rows.forEach((r,ri)=>{ rowY[ri]=ry; const gapH=GAP0+laneCount[ri]*LANE+GAPEND; gapY[ri]=ry+BOXH+GAP0; ry+=BOXH+gapH; });
    const lastGap=laneCount[rows.length-1]? 0 : -GAPEND-GAP0+BANDPAD;   // trim the last gap when unused
    const bandH=(ry+lastGap)-bandY+8;
    order.forEach(id=>{ const p=pos[id]; p.y=rowY[p.row]; p.cy=p.y+BOXH/2; });
    const laneY=(g,i)=>gapY[g]+i*LANE, chanX=(side,i)=>side==="L"? bandX+16+i*7 : bandX+bandW-16-i*7;
    // band frame and title
    out.push('<g class="statediagram-cluster fts-top" id="'+mid(top.id)+'"><rect x="'+bandX+'" y="'+bandY+'" width="'+bandW+'" height="'+bandH+'" rx="8" fill="var(--panel-2,#f2f4f7)" stroke="var(--ink-faint,#888)" stroke-dasharray="6 4"/><rect x="'+(bandX+8)+'" y="'+(bandY+8)+'" width="'+(bandW-16)+'" height="'+(bandH-16)+'" rx="6" fill="var(--panel,#fff)" stroke="var(--ink,#333)"/><rect x="'+(bandX+8)+'" y="'+(bandY+8)+'" width="'+(bandW-16)+'" height="'+TITLE+'" rx="6" fill="var(--panel-3,#e6e9ee)" stroke="var(--ink,#333)"/><text class="cluster-label" x="'+(bandX+bandW/2)+'" y="'+(bandY+8+TITLE/2+5)+'" text-anchor="middle" font-size="14" font-weight="600" fill="var(--ink,#111)" style="cursor:pointer"><title>Click to collapse '+esc(top.name)+'</title>'+esc(top.name)+'</text></g>');
    // initial dot and terminal marks
    const s0=pos[startId]; if(s0 && G.initials.includes(startId)) out.push('<circle cx="'+(s0.x-28)+'" cy="'+s0.cy+'" r="6" fill="var(--ink,#111)"/><path d="M'+(s0.x-22)+' '+s0.cy+' L'+(s0.x-2)+' '+s0.cy+'" stroke="var(--ink,#333)" stroke-width="1.4" marker-end="url(#fts-arrow)"/>');
    // states
    order.forEach(id=>{ const n=nodes[id], p=pos[id]; out.push('<g class="node statediagram-state" id="state-'+mid(id)+'-0"><rect x="'+p.x+'" y="'+p.y+'" width="'+p.w+'" height="'+p.h+'" rx="6" fill="var(--panel-2,#eef1f5)" stroke="var(--ink,#333)"'+(n.terminal?' stroke-width="2.5"':'')+'/>'+p.lines.map((l,i)=>'<text x="'+p.cx+'" y="'+(p.cy+(i-(p.lines.length-1)/2)*15+5)+'" text-anchor="middle" font-size="'+FONT+'" fill="var(--ink,#111)">'+esc(l)+'</text>').join("")+'</g>');
      if(n.terminal){ const tx=p.x+p.w+26; out.push('<path d="M'+(p.x+p.w)+' '+p.cy+' L'+(tx-9)+' '+p.cy+'" stroke="var(--ink,#333)" stroke-width="1.4"/><circle cx="'+tx+'" cy="'+p.cy+'" r="8" fill="none" stroke="var(--ink,#333)" stroke-width="1.4"/><circle cx="'+tx+'" cy="'+p.cy+'" r="4.5" fill="var(--ink,#111)"/>'); } });
    // edges
    const seg=pts=>"M"+pts.map(p=>p[0]+" "+p[1]).join(" L");
    plans.forEach(p=>{ const {e,idx,A,B}=p; const off=idx*12; let d,lx,ly;
      if(p.kind==="straight"){ d='M'+(A.x+A.w)+' '+A.cy+' L'+(B.x-2)+' '+B.cy; lx=(A.x+A.w+B.x)/2; ly=A.cy-8; }
      else if(p.kind==="samerow"){ const L0=laneY(A.row,p.l0); const xa=A.cx+off, xb=B.cx-off; d=seg([[xa,A.y+A.h],[xa,L0],[xb,L0],[xb,B.y+B.h+2]]); lx=(xa+xb)/2; ly=L0-6; }
      else if(p.kind==="down"){ const L0=laneY(A.row,p.l0); const xa=A.cx+off, xb=B.cx-off; d=seg([[xa,A.y+A.h],[xa,L0],[xb,L0],[xb,B.y-2]]); lx=(xa+xb)/2; ly=L0-6; }
      else if(p.kind==="downchan"){ const L0=laneY(A.row,p.l0), L1=laneY(B.row-1,p.l1), cx=chanX("R",p.c); const xa=A.cx+off, xb=B.cx-off; d=seg([[xa,A.y+A.h],[xa,L0],[cx,L0],[cx,L1],[xb,L1],[xb,B.y-2]]); lx=(xa+cx)/2; ly=L0-6; }
      else if(p.kind==="up"){ const L0=laneY(B.row,p.l0); const xa=A.cx-off, xb=B.cx+off; d=seg([[xa,A.y],[xa,L0],[xb,L0],[xb,B.y+B.h+2]]); lx=(xa+xb)/2; ly=L0-6; }
      else { const L0=laneY(A.row-1,p.l0), L1=laneY(B.row,p.l1), cx=chanX("L",p.c); const xa=A.cx-off, xb=B.cx+off; d=seg([[xa,A.y],[xa,L0],[cx,L0],[cx,L1],[xb,L1],[xb,B.y+B.h+2]]); lx=(xa+cx)/2; ly=L0-6; }
      out.push('<path class="transition"'+(e.id?' data-tr="'+esc(e.id)+'"':'')+' data-a="'+esc(e.a)+'" data-b="'+esc(e.b)+'" d="'+d+'" fill="none" stroke="var(--ink,#333)" stroke-width="1.4" stroke-linejoin="round" marker-end="url(#fts-arrow)"/>');
      const tw=String(e.label).length*6.6+10;
      lab.push('<g class="edgeLabel" style="cursor:help"><rect x="'+(lx-tw/2)+'" y="'+(ly-9)+'" width="'+tw+'" height="16" rx="3" fill="var(--panel,#fff)" fill-opacity="0.92"/><text x="'+lx+'" y="'+(ly+3)+'" text-anchor="middle" font-size="11" fill="var(--ink,#111)">'+esc(e.label)+'</text></g>'); });
    y=bandY+bandH+22;
  });
  // cross-region edges (rare): straight lines between centres
  G.edges.filter(e=>!e.inner && pos[e.a] && pos[e.b] && nodes[e.a].parent!==nodes[e.b].parent).forEach(e=>{ const A=pos[e.a], B=pos[e.b]; out.push('<path class="transition" d="M'+A.cx+' '+A.cy+' L'+B.cx+' '+B.cy+'" fill="none" stroke="var(--ink,#333)" stroke-width="1.4" stroke-dasharray="4 3" marker-end="url(#fts-arrow)"/>'); const lx=(A.cx+B.cx)/2, ly=(A.cy+B.cy)/2-8, tw=String(e.label).length*6.6+10; lab.push('<g class="edgeLabel" style="cursor:help"><rect x="'+(lx-tw/2)+'" y="'+(ly-9)+'" width="'+tw+'" height="16" rx="3" fill="var(--panel,#fff)" fill-opacity="0.92"/><text x="'+lx+'" y="'+(ly+3)+'" text-anchor="middle" font-size="11" fill="var(--ink,#111)">'+esc(e.label)+'</text></g>'); });
  const H=y+MARG;
  const frame='<rect x="'+MARG+'" y="'+MARG+'" width="'+inner+'" height="'+(H-2*MARG)+'" rx="8" fill="var(--panel,#fff)" stroke="var(--ink,#333)"/><rect x="'+MARG+'" y="'+MARG+'" width="'+inner+'" height="'+TITLE+'" rx="8" fill="var(--panel-3,#e6e9ee)" stroke="var(--ink,#333)"/><text x="'+(MARG+inner/2)+'" y="'+(MARG+TITLE/2+5)+'" text-anchor="middle" font-size="14" font-weight="600" fill="var(--ink,#111)">'+esc(opts.title||G.protocolName)+'</text>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" style="font-family:Segoe UI,system-ui,sans-serif;max-width:none"><defs><marker id="fts-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--ink,#333)"/></marker></defs>'+frame+out.join("")+lab.join("")+'</svg>';
}

// ftsSummarySvg: the Knowledge Area's FTSs with their internal states collapsed, one card per region: managed element, region ID,
// instance scope, initial state, terminal states, state and transition counts, the Global transitions the region's states gate and the
// cross-region guards it takes part in. Used at the head of the reference section before the individual FTSs (fts_docs.py and the viewer).
function ftsSummarySvg(M, availW, opts){
  opts=opts||{}; const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const W=Math.max(700, availW|0), MARG=16, TITLE=30, GAP=14, CW=Math.max(250, Math.floor((W-2*MARG-GAP*3)/3)), LH=15;
  const regs=(M.regions&&M.regions.length)?M.regions:(M.globalStates||[]).map(g=>({id:g.id,name:g.name}));
  const sub=M.subStates||[]; const regOf=id=>{ const st=sub.find(x=>x.id===id); return st?(st.region||st.parent):null; };
  const sName=id=>{ const st=sub.find(x=>x.id===id); return st?st.name:id; };
  const wrap=(text,max)=>{ const words=String(text).split(/\s+/); const lines=[]; let cur=""; words.forEach(w=>{ if((cur+" "+w).trim().length>max && cur){ lines.push(cur); cur=w; } else cur=(cur+" "+w).trim(); }); if(cur) lines.push(cur); return lines; };
  const cpc=Math.floor((CW-20)/6.6);
  const cards=regs.map(r=>{ const code=r.code||String(r.id).split("-").pop();
    const states=sub.filter(x=>(x.region||x.parent)===r.id); const trs=(M.transitions||[]).filter(t=>!t.id.startsWith("TR-INIT")&&(regOf(t.target)===r.id||regOf(t.source)===r.id));
    const init=r.initialState?sName(r.initialState):(states.find(x=>x.initial)||{}).name||""; const term=states.filter(x=>x.terminal).map(x=>x.name);
    const gates=[]; (M.contributions||[]).forEach(c=>{ if(Object.keys(c.requiredStates||{}).includes(code) && !gates.includes(c.globalTransition)) gates.push(c.globalTransition); });
    const xrg=(M.crossRegionConstraints||[]).filter(x=>{ const ap=x.transitions||x.appliesTo||[]; return Array.isArray(ap)&&ap.some(t=>trs.some(tt=>tt.id===t)); }).map(x=>x.id);
    const lines=[]; lines.push(["b",wrap(r.managedElement&&r.managedElement!==r.name?r.name:r.name,cpc)]); lines.push(["m",[r.id+(r.instanceScope?" · "+r.instanceScope:"")]]);
    lines.push(["n",wrap("Starts: "+init+(term.length?". Ends: "+term.join(", "):". No terminal state"),cpc)]);
    lines.push(["n",[states.length+" states · "+trs.length+" transitions"]]);
    if((M.contributions||[]).length) lines.push(["n",wrap("Gates: "+(gates.length?gates.join(", "):"no Global transition"),cpc)]);
    if(xrg.length) lines.push(["n",wrap("Cross-region: "+xrg.join(", "),cpc)]);
    const h=16+lines.reduce((a,[k,ls])=>a+ls.length*LH,0)+8; return {r,lines,h}; });
  // lay the cards out in rows of three, equal height per row
  const out=[]; let y=MARG+TITLE+16, x=MARG; const rows=[]; cards.forEach((c,i)=>{ if(i%3===0) rows.push([]); rows[rows.length-1].push(c); });
  rows.forEach(row=>{ const rh=Math.max(...row.map(c=>c.h)); x=MARG; row.forEach(c=>{ out.push('<g class="statediagram-cluster fts-collapsed-frame"><rect x="'+x+'" y="'+y+'" width="'+CW+'" height="'+rh+'" rx="8" fill="var(--panel-2,#eef1f5)" stroke="var(--ink-faint,#888)" stroke-dasharray="6 4"/></g>');
      let ty=y+18; c.lines.forEach(([k,ls])=>{ ls.forEach(l=>{ out.push('<text x="'+(x+10)+'" y="'+ty+'" font-size="'+(k==="b"?13:k==="m"?10.5:11.5)+'" '+(k==="b"?'font-weight="600" fill="var(--ink,#111)"':k==="m"?'font-family="Consolas, Menlo, monospace" fill="var(--ink-faint,#5f6f78)"':'fill="var(--ink,#1e2a30)"')+'>'+esc(l)+'</text>'); ty+=LH; }); });
      x+=CW+GAP; }); y+=rh+GAP; });
  const H=y+MARG-GAP+8; const inner=W-2*MARG;
  const frame='<rect x="'+MARG+'" y="'+MARG+'" width="'+inner+'" height="'+(H-2*MARG)+'" rx="8" fill="var(--panel,#fff)" stroke="var(--ink,#333)"/><rect x="'+MARG+'" y="'+MARG+'" width="'+inner+'" height="'+TITLE+'" rx="8" fill="var(--panel-3,#e6e9ee)" stroke="var(--ink,#333)"/><text x="'+(W/2)+'" y="'+(MARG+20)+'" text-anchor="middle" font-size="14" font-weight="600" fill="var(--ink,#111)">'+esc(opts.title||"")+'</text>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" style="font-family:Segoe UI,system-ui,sans-serif;max-width:none">'+frame+out.join("")+'</svg>';
}
if(typeof module!=="undefined") module.exports={snakeSvg, ftsSummarySvg};
