// State machine source (Mermaid stateDiagram-v2) generated from an FTS model, with
// simplification controls after Harel (clustering / zoom), SCXML (compound vs atomic,
// initial, final) and the Visual Paradigm guidance (super-state / sub-state, hide detail).
//
// opts:
//   direction  "LR" | "TB"
//   level      "all" (full hierarchy) | "sub" (globals expanded one level, deeper nesting collapsed) | "global" (composites collapsed)
//   contracts  true: entry / do / exit / {invariant} compartments
//   labelMode  "full" | "code" | "id"     (transition and activity labels)
//   showEvent, showGuard, showEffect      (parts of the transition label in "full" mode; in code mode the code is always shown)
//   hideLoops, hideReadiness, hideInnerInitial, hideNotes
//   ids        true: append the state ID to the state name
//   focus      {type:"all"} | {type:"composite", id} | {type:"neighbourhood", id} | {type:"path", id}
//   highlight  [stateId, ...]  states drawn as "current" (used by the simulator for the active State Vector)
// returns { src, legend:{transitions:[], activities:[], guards:[], events:[]}, visible:{states:[], transitions:[]} }
function fsmSource(M, opts){
  opts = Object.assign({direction:"LR", level:"all", contracts:true, labelMode:"full", showEvent:true, showGuard:true, showEffect:true,
                        hideLoops:false, hideReadiness:false, hideInnerInitial:false, hideNotes:false, ids:false, focus:{type:"all"}}, opts||{});
  const mid = id => String(id).replace(/[^A-Za-z0-9_]/g,"_");
  const q = s => String(s==null?"":s).replace(/"/g,"'").replace(/[\r\n]+/g," ").replace(/[{}]/g,"").replace(/;/g,",").replace(/:/g,"∶");
  const all = M.globalStates.concat(M.subStates);
  const byId = id => all.find(s=>s.id===id);
  const kidsOf = pid => M.subStates.filter(s=>s.parent===pid).sort((a,b)=>(Number(a.sequence)||99)-(Number(b.sequence)||99)||String(a.id).localeCompare(String(b.id)));
  const depthOf = id => { let d=0, s=byId(id); while(s && s.kind!=="global" && s.parent){ s=byId(s.parent); d++; if(d>30) break; } return d; };
  const topOf = id => { let s=byId(id), g=0; while(s && s.kind!=="global" && s.parent && g++<30) s=byId(s.parent); return s?s.id:null; };
  const isInit = t => /initial/i.test(t.level||"") || String(t.source).startsWith("[");
  const isLoop = t => /recurs|iterat|self|return|revisit/i.test((t.optionality||"")+" "+(t.transitionType||"")+" "+(t.name||""));
  const evOf = id => (M.events||[]).find(x=>x.id===id);

  // ---- codes (stable within a model: order of appearance) ----
  const code = {tr:{}, ev:{}, act:{}, gd:{}};
  M.transitions.forEach((t,i)=>code.tr[t.id]="T"+(i+1));
  (M.events||[]).forEach((e,i)=>code.ev[e.id]="E"+(i+1));
  (M.activities||[]).forEach((a,i)=>code.act[a.id]="A"+(i+1));
  (M.guards||[]).forEach((g,i)=>code.gd[g.id]="G"+(i+1));

  // ---- visibility: which states are drawn, and where a hidden state maps to ----
  const maxDepth = opts.level==="global"?0 : opts.level==="sub"?1 : 99;
  function visibleRep(id){                       // the drawn state that represents id
    let s=byId(id); if(!s) return null;
    while(s && depthOf(s.id)>maxDepth && s.parent){ s=byId(s.parent); }
    if(s && opts.hideReadiness && s.readiness){ return s.parent? visibleRep(s.parent) : null; }
    return s? s.id : null;
  }
  let visStates = new Set(all.filter(s=>depthOf(s.id)<=maxDepth && !(opts.hideReadiness&&s.readiness)).map(s=>s.id));
  // focus reduces the visible set
  const f = opts.focus||{type:"all"};
  let pathTrs=null, nbRep=null;
  if(f.type==="composite" && f.id){
    const keep=new Set([f.id]); (function walk(p){ kidsOf(p).forEach(c=>{ keep.add(c.id); walk(c.id); }); })(f.id);
    let anc=byId(f.id); while(anc && anc.parent){ keep.add(anc.parent); anc=byId(anc.parent); }
    visStates = new Set([...visStates].filter(x=>keep.has(x)));
  }
  if(f.type==="neighbourhood" && f.id){
    const rep=visibleRep(f.id); nbRep=rep; const keep=new Set([rep]);
    M.transitions.forEach(t=>{ if(isInit(t)) return; const a=visibleRep(t.source), b=visibleRep(t.target); if(a===rep&&b) keep.add(b); if(b===rep&&a) keep.add(a); });
    [...keep].forEach(id=>{ let s=byId(id); while(s && s.parent){ keep.add(s.parent); s=byId(s.parent); } });
    visStates = new Set([...visStates].filter(x=>keep.has(x)));
  }
  if(f.type==="path" && f.id){
    // BFS over drawn states from the initial state to the target
    const target=visibleRep(f.id);
    const init=M.transitions.find(isInit); const start=init?visibleRep(init.target):null;
    const prev={}; const q0=[start]; const seen=new Set([start]);
    while(q0.length){ const cur=q0.shift(); if(cur===target) break;
      M.transitions.forEach(t=>{ if(isInit(t)) return; const a=visibleRep(t.source), b=visibleRep(t.target); if(a===cur && b && !seen.has(b) && a!==b){ seen.add(b); prev[b]={from:a,t}; q0.push(b);} }); }
    const keep=new Set(); pathTrs=new Set();
    if(seen.has(target)){ let cur=target; keep.add(cur); while(prev[cur]){ pathTrs.add(prev[cur].t.id); cur=prev[cur].from; keep.add(cur); } }
    [...keep].forEach(id=>{ let s=byId(id); while(s && s.parent){ keep.add(s.parent); s=byId(s.parent); } });
    visStates = new Set([...visStates].filter(x=>keep.has(x)));
  }
  const drawn = id => visStates.has(id);

  // ---- transitions to draw (mapped onto drawn states, de-duplicated) ----
  const edges=[]; const seenEdge=new Set();
  M.transitions.forEach(t=>{
    if(isInit(t)) return;
    if(opts.hideLoops && isLoop(t)) return;
    if(pathTrs && !pathTrs.has(t.id)) return;
    const a=visibleRep(t.source), b=visibleRep(t.target);
    if(!a||!b||!drawn(a)||!drawn(b)) return;
    if(nbRep && a!==nbRep && b!==nbRep) return;
    if(a===b) return;                                   // collapsed inside one drawn state
    // an entry from a composite into its own child is the inner initial pseudostate, handled in emit
    const sa=byId(a), sb=byId(b);
    if(sb && sb.parent===a) { edges.push({t,a,b,inner:true}); return; }
    const key=a+">"+b+"|"+(opts.labelMode==="full"?t.id:t.id);
    if(seenEdge.has(key)) return; seenEdge.add(key);
    edges.push({t,a,b,inner:false});
  });

  const legend={transitions:[],activities:[],guards:[],events:[]};
  function trLabel(t){
    const ev=evOf(t.event); const gcount=(M.guards||[]).filter(g=>g.transition===t.id).length;
    if(opts.labelMode==="code"){ let l=code.tr[t.id]; if(opts.showGuard&&gcount) l+=" [G×"+gcount+"]"; return l; }
    if(opts.labelMode==="id"){ let l=t.id; if(opts.showGuard&&gcount) l+=" ["+gcount+" g]"; return l; }
    const parts=[]; if(opts.showEvent && ev) parts.push(ev.name);
    let l=parts.join("");
    if(opts.showGuard && gcount) l+=" ["+gcount+" guard"+(gcount===1?"":"s")+"]";
    if(opts.showEffect && t.name && (!ev || t.name!==ev.name)) l+=(l?" / ":"")+t.name;
    if(!l) l=t.name||t.id;
    return l;
  }
  function actLabel(a){ return opts.labelMode==="code"?code.act[a.id]: opts.labelMode==="id"?a.id: a.name; }

  const L=["stateDiagram-v2","direction "+opts.direction];
  function name(s){ return q(s.name)+(opts.ids?" ("+s.id+")":""); }
  function contract(s, pad){
    if(!opts.contracts) return;
    const id=mid(s.id);
    const ec=(M.entryConditions||[]).filter(x=>x.appliesTo===s.id).length;
    const xc=(M.exitConditions||[]).filter(x=>x.appliesTo===s.id).length;
    const inv=(M.invariants||[]).filter(x=>x.appliesTo===s.id).length;
    const acts=(M.activities||[]).filter(x=>x.permittedIn===s.id);
    if(ec) L.push(pad+id+" : entry / ["+ec+" entry condition"+(ec===1?"":"s")+"]");
    if(acts.length){ const lab=acts.map(actLabel); const shown=(opts.labelMode==="full"?lab.slice(0,4):lab.slice(0,8)).join(", ")+(lab.length>(opts.labelMode==="full"?4:8)?" +"+(lab.length-(opts.labelMode==="full"?4:8))+" more":""); L.push(pad+id+" : do / "+q(shown)); }
    if(xc) L.push(pad+id+" : exit / ["+xc+" exit condition"+(xc===1?"":"s")+"]");
    if(inv) L.push(pad+id+" : {invariant × "+inv+"}");
    if(s.readiness) L.push(pad+id+" : «readiness»");
  }
  function note(s, pad){
    if(!opts.contracts || opts.hideNotes) return;
    const ec=(M.entryConditions||[]).filter(x=>x.appliesTo===s.id).length;
    const xc=(M.exitConditions||[]).filter(x=>x.appliesTo===s.id).length;
    const inv=(M.invariants||[]).filter(x=>x.appliesTo===s.id).length;
    const acts=(M.activities||[]).filter(x=>x.permittedIn===s.id).length;
    const parts=[]; if(ec) parts.push("entry / ["+ec+"]"); if(acts) parts.push("do / "+acts+" activities"); if(xc) parts.push("exit / ["+xc+"]"); if(inv) parts.push("{invariant × "+inv+"}");
    if(parts.length) L.push(pad+"note right of "+mid(s.id)+" : "+parts.join("  "));
  }
  const parallel = !!(M.meta && M.meta.parallelRegions);
  function emit(s, indent){
    const pad="  ".repeat(indent), id=mid(s.id);
    const ch=kidsOf(s.id).filter(c=>drawn(c.id));
    if(ch.length){
      L.push(pad+'state "'+name(s)+'" as '+id+" {");
      L.push(pad+"  direction TB");
      if(!opts.hideInnerInitial) edges.filter(e=>e.inner && e.a===s.id).forEach(e=>{ L.push(pad+"  [*] --> "+mid(e.b)+" : "+q(trLabel(e.t))); pushLegendTr(e.t); });
      if(parallel && s.kind==="region"){
        // each region is its own machine: initial pseudostate and final states live inside it
        M.transitions.filter(isInit).forEach(t=>{ const b=visibleRep(t.target); if(b && drawn(b) && (byId(b)||{}).parent===s.id){ L.push(pad+"  [*] --> "+mid(b)); pushLegendTr(t); } });
      }
      ch.forEach(c=>emit(c, indent+1));
      const desc=new Set(descendants(s.id));
      edges.filter(e=>!e.inner && desc.has(e.a) && desc.has(e.b)).forEach(e=>{ if(!e.done){ L.push(pad+"  "+edge(e)); e.done=true; } });
      if(parallel && s.kind==="region") ch.filter(c=>c.terminal).forEach(c=>L.push(pad+"  "+mid(c.id)+" --> [*]"));
      L.push(pad+"}");
      note(s, pad);
    }else{
      L.push(pad+'state "'+name(s)+'" as '+id);
      contract(s, pad);
    }
  }
  function descendants(pid){ const out=[]; kidsOf(pid).forEach(c=>{ out.push(c.id); out.push(...descendants(c.id)); }); return out; }
  function pushLegendTr(t){
    if(legend.transitions.some(x=>x.id===t.id)) return;
    const ev=evOf(t.event); const gs=(M.guards||[]).filter(g=>g.transition===t.id);
    legend.transitions.push({code:code.tr[t.id], id:t.id, name:t.name, from:byId(t.source)?byId(t.source).name:t.source, to:byId(t.target)?byId(t.target).name:t.target, event:ev?ev.name:"", eventCode:ev?code.ev[ev.id]:"", guards:gs.length, loop:isLoop(t), optionality:t.optionality||""});
    gs.forEach(g=>{ if(!legend.guards.some(x=>x.id===g.id)) legend.guards.push({code:code.gd[g.id], id:g.id, transition:code.tr[t.id], predicate:g.predicate, scope:g.scope||""}); });
    if(ev && !legend.events.some(x=>x.id===ev.id)) legend.events.push({code:code.ev[ev.id], id:ev.id, name:ev.name, type:ev.eventType||""});
  }
  function edge(e){ pushLegendTr(e.t); return mid(e.a)+" --> "+mid(e.b)+" : "+q(trLabel(e.t)); }

  if(parallel){
    // orthogonal regions: one composite holding concurrent regions separated by --
    const regs=M.globalStates.filter(g=>drawn(g.id));
    L.push('state "'+q(opts.protocolName||(M.meta&&M.meta.protocolLabel)||"Formal Data Asset Protocol")+'" as PROTOCOL {');
    L.push("  direction "+opts.direction);
    regs.forEach((g,i)=>{ if(i) L.push("  --"); emit(g,1); });
    L.push("}");
    edges.filter(e=>!e.inner && !e.done).forEach(e=>{ L.push(edge(e)); e.done=true; });
  } else {
  // initial pseudostate
  M.transitions.filter(isInit).forEach(t=>{ const b=visibleRep(t.target); if(b && drawn(b)){ L.push("[*] --> "+mid(b)+" : "+q(trLabel(t))); pushLegendTr(t); } });
  // top level
  M.globalStates.filter(g=>drawn(g.id)).forEach(g=>emit(g,0));
  // cross-composite edges
  edges.filter(e=>!e.inner && !e.done).forEach(e=>{ L.push(edge(e)); e.done=true; });
  // final
  M.globalStates.filter(g=>g.terminal && drawn(g.id)).forEach(g=>L.push(mid(g.id)+" --> [*]"));
  }
  // activities legend (for drawn states)
  (M.activities||[]).forEach(a=>{ if(drawn(a.permittedIn) || drawn(visibleRep(a.permittedIn)||"")) legend.activities.push({code:code.act[a.id], id:a.id, name:a.name, state:byId(a.permittedIn)?byId(a.permittedIn).name:a.permittedIn, type:a.activityType||""}); });
  // styling
  L.push("classDef readiness fill:#e8f0fb,stroke:#2b5fa8,color:#1b202b");
  L.push("classDef focus fill:#dff3ef,stroke:#0f6e64,color:#1b202b,stroke-width:2px");
  const ready=M.subStates.filter(s=>s.readiness && drawn(s.id)).map(s=>mid(s.id));
  if(ready.length) L.push("class "+ready.join(",")+" readiness");
  if((f.type==="neighbourhood"||f.type==="path") && f.id){ const rep=visibleRep(f.id); if(rep && drawn(rep)) L.push("class "+mid(rep)+" focus"); }
  if(Array.isArray(opts.highlight) && opts.highlight.length){
    L.push("classDef current fill:#0f6e64,stroke:#0a4f48,color:#ffffff,stroke-width:2px");
    const hl=opts.highlight.map(id=>visibleRep(id)).filter(id=>id && drawn(id)).map(mid);
    if(hl.length) L.push("class "+hl.join(",")+" current");
  }
  return {src:L.join("\n"), legend, visible:{states:[...visStates], transitions:edges.map(e=>e.t.id)}};
}
if(typeof module!=="undefined") module.exports={fsmSource};
