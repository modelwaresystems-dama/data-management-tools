// viewer_twin.js: the Twin tab (viewer v0.24). The descriptive view of the digital twin (Howard's picks, twin register d4 and d6):
// the fleet of asset instances with each one's Global State Vector, the Knowledge Area regions moved, refusals, overrides and holds;
// one instance opened shows every region of every applicable model (shared regions read through the element it references), the
// facts the engine derives, and the event timeline with the guards that refused. Source: the local service (python fts_twin.py serve,
// http://127.0.0.1:8765) or the exported files (fleet.json, instances.json, events.json from twin/) loaded from disk.
(function(){
  const e=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const T={url:"http://127.0.0.1:8765", mode:"none", fleet:null, files:{instances:null, events:null}, filter:{cls:"", ex:"", refused:false, hold:false, q:""}, sel:null};
  try{ T.url=localStorage.getItem("fts.twin.url")||T.url; }catch(x){}
  const $=s=>document.querySelector(s);
  const fmt=t=>t?String(t).replace("T"," ").slice(0,16):"";
  async function getJ(path){ const r=await fetch(T.url.replace(/\/$/,"")+path); if(!r.ok) throw new Error(r.status+" "+path); return r.json(); }
  function status(msg,bad){ const el=$("#twinStatus"); if(el){ el.textContent=msg; el.style.color=bad?"var(--danger,#a33)":"var(--ink-faint)"; } }
  // ---- sources
  async function connect(){
    T.url=$("#twinUrl").value.trim()||T.url; try{ localStorage.setItem("fts.twin.url",T.url); }catch(x){}
    status("connecting to "+T.url+" ...");
    try{ const info=await getJ("/"); T.fleet=await getJ("/fleet"); T.mode="api"; status(info.service+" · "+T.fleet.assets+" assets, "+T.fleet.elements+" elements, "+T.fleet.events+" events · "+fmt(T.fleet.generatedAt)); renderFleet(); }
    catch(ex){ T.mode="none"; status("no twin service at "+T.url+" (start it with: python tools/fts_designer/fts_twin.py serve --models models --db twin.sqlite), or load the exported files",true); }
  }
  async function loadFiles(files){
    const got={};
    for(const f of files){ try{ got[f.name]=JSON.parse(await f.text()); }catch(ex){ status("could not read "+f.name,true); return; } }
    if(got["fleet.json"]){ T.fleet=got["fleet.json"]; }
    if(got["instances.json"]){ T.files.instances={}; (got["instances.json"].assets||[]).forEach(a=>T.files.instances[a.id]=a); }
    if(got["elements.json"]){ T.files.elements={}; (got["elements.json"].elements||[]).forEach(x=>T.files.elements[x.id]=x); }
    if(got["events.json"]){ T.files.events={}; (got["events.json"].events||[]).forEach(ev=>{ (T.files.events[ev.instanceId]=T.files.events[ev.instanceId]||[]).push(ev); }); }
    if(!T.fleet){ status("fleet.json is needed for the fleet view (export it with: python fts_twin.py export)",true); return; }
    T.mode="files"; status("exported files · "+T.fleet.assets+" assets, "+T.fleet.events+" events · exported "+fmt(T.fleet.exportedAt||T.fleet.generatedAt)+(T.files.instances?" · instances loaded":"")+(T.files.events?" · events loaded":"")); renderFleet();
  }
  // ---- fleet
  function renderFleet(){
    const F=T.fleet; if(!F){ $("#twinFleet").innerHTML='<div class="docnone">Connect to the twin service or load the exported files.</div>'; return; }
    const rows=F.rows||[]; const f=T.filter;
    const cls=[...new Set(rows.map(r=>r.assetClass))].sort(); const exs=[...new Set(rows.map(r=>r.global.EX&&r.global.EX.name))].filter(Boolean).sort();
    const sel=$("#twinCls"); if(sel&&sel.options.length!==cls.length+1){ sel.innerHTML='<option value="">all classes</option>'+cls.map(c=>'<option'+(c===f.cls?' selected':'')+'>'+e(c)+'</option>').join(""); }
    const sex=$("#twinEx"); if(sex&&sex.options.length!==exs.length+1){ sex.innerHTML='<option value="">any Existence</option>'+exs.map(c=>'<option'+(c===f.ex?' selected':'')+'>'+e(c)+'</option>').join(""); }
    const vis=rows.filter(r=>(!f.cls||r.assetClass===f.cls)&&(!f.ex||(r.global.EX&&r.global.EX.name)===f.ex)&&(!f.refused||r.refused>0)&&(!f.hold||r.holdActive)&&(!f.q||(r.id+" "+r.name).toLowerCase().includes(f.q.toLowerCase())));
    // counts by Global state
    const bs=F.byGlobalState||{}; const cards=["EX","AS","AV","CP"].map(code=>'<div class="twincard"><div class="twincard-h">'+code+'</div>'+Object.entries(bs[code]||{}).sort((a,b)=>b[1]-a[1]).map(([n,c])=>'<div class="twincard-r"><span>'+e(n)+'</span><b>'+c+'</b></div>').join("")+'</div>').join("");
    $("#twinCards").innerHTML='<div class="twincard"><div class="twincard-h">Fleet</div><div class="twincard-r"><span>assets</span><b>'+F.assets+'</b></div><div class="twincard-r"><span>elements (shared)</span><b>'+F.elements+'</b></div><div class="twincard-r"><span>events</span><b>'+F.events+'</b></div><div class="twincard-r"><span>refused</span><b>'+F.refused+'</b></div><div class="twincard-r"><span>overrides</span><b>'+F.overrides+'</b></div><div class="twincard-r"><span>on hold</span><b>'+rows.filter(r=>r.holdActive).length+'</b></div></div>'+cards;
    $("#twinFleet").innerHTML='<div class="tscroll"><table class="stab doct twintbl"><thead><tr><th>Instance</th><th>Name</th><th>Class</th><th>EX</th><th>AS</th><th>AV</th><th>CP</th><th>KA regions moved</th><th>Fired</th><th>Refused</th><th>Overrides</th><th>Hold</th><th>Last event</th><th>At</th></tr></thead><tbody>'+
      vis.map(r=>'<tr data-id="'+e(r.id)+'" class="'+(T.sel===r.id?'twinsel':'')+(r.refused?' twinref':'')+'"><td class="mono">'+e(r.id)+'</td><td>'+e(r.name)+'</td><td>'+e(r.assetClass)+'</td>'+["EX","AS","AV","CP"].map(c=>'<td>'+e(r.global[c]?r.global[c].name:"")+'</td>').join("")+'<td class="num">'+r.kaRegionsMoved+' / '+r.kaRegions+'</td><td class="num">'+r.fired+'</td><td class="num">'+(r.refused||"")+'</td><td class="num">'+(r.overrides||"")+'</td><td>'+(r.holdActive?'<span class="pill">hold</span>':'')+'</td><td>'+(r.last?(r.last.result==="facts"?'facts set':e((r.last.transition||"")+" "+(r.last.name||"")))+(r.last.result&&r.last.result!=="fired"&&r.last.result!=="facts"?' <span class="pill">'+e(r.last.result)+'</span>':''):'')+'</td><td class="mono">'+fmt(r.lastAt)+'</td></tr>').join("")+'</tbody></table></div><div class="docsub">'+vis.length+' of '+rows.length+' assets shown. Click a row to open the instance.</div>';
    $("#twinFleet").querySelectorAll("tr[data-id]").forEach(tr=>tr.onclick=()=>openInstance(tr.dataset.id));
  }
  // ---- instance
  async function openInstance(id){
    T.sel=id; let d=null;
    if(T.mode==="api"){ try{ d=await getJ("/instances/"+encodeURIComponent(id)); }catch(ex){ status("could not read "+id+": "+ex.message,true); return; } }
    else { const a=T.files.instances&&T.files.instances[id]; if(!a){ $("#twinInst").innerHTML='<div class="docnone">Load instances.json (and events.json for the timeline) to open an instance offline.</div>'; return; } d=resolveOffline(a); }
    renderInstance(d); $("#twinFleet").querySelectorAll("tr[data-id]").forEach(tr=>tr.classList.toggle("twinsel",tr.dataset.id===id));
    const p=$("#twinInst"); if(p) p.scrollIntoView({block:"start",behavior:"smooth"});
  }
  function resolveOffline(a){
    // resolve the asset's vectors against the loaded models (same rule as the engine: shared regions read through the referenced element)
    const ms={}; (MODELS||[]).forEach(m=>{ const id=m.meta&&m.meta.modelId; if(id) ms[id]=m; });
    const els=T.files.elements||{}; const out={...a, vectorsResolved:{}, timeline:(T.files.events&&T.files.events[a.id])||[]};
    Object.keys(a.vectors||{}).forEach(mid=>{ const m=ms[mid]; if(!m) return; const regs=m.regions||[]; const sName=id=>{ const s=(m.subStates||[]).find(x=>x.id===id); return s?s.name:id; };
      out.vectorsResolved[mid]={name:m.meta.knowledgeArea||m.meta.name, regions:regs.map(r=>{ const shared=!(r.id in (a.vectors[mid]||{})); const eid=shared?(a.refs||{})[r.id]:null; const el=eid?els[eid]:null; const sid=shared?(el?el.state:(r.initialState||"")):a.vectors[mid][r.id]; const init=(m.subStates||[]).find(x=>(x.region||x.parent)===r.id&&x.initial); return {region:r.id, regionName:r.name, code:r.code||r.id.split("-").pop(), state:sid, stateName:sName(sid), initial:init&&init.id===sid, shared, elementId:eid}; })}; });
    return out;
  }
  function renderInstance(d){
    const g=d.vectorsResolved||{}; const order=Object.keys(g).sort((a,b)=>(a==="GDA-GLOBAL-PROTOCOL"?-1:b==="GDA-GLOBAL-PROTOCOL"?1:a.localeCompare(b)));
    const facts=Object.entries(d.facts||{}).filter(([k,v])=>v===true).map(([k])=>k);
    const h=['<h3 class="doch3">'+e(d.id)+' · '+e(d.name||"")+' <span class="docsub" style="display:inline">'+e(d.assetClass||"")+' · created '+fmt(d.createdAt)+' · updated '+fmt(d.updatedAt)+'</span></h3>'];
    h.push('<div class="twinvec">'+order.map(mid=>{ const m=g[mid]; return '<div class="twinmodel"><div class="twinmodel-h">'+e(m.name)+'</div>'+m.regions.map(r=>'<div class="twinreg'+(r.initial?' init':'')+'"><span class="mono">'+e(r.code)+'</span> <b>'+e(r.stateName)+'</b>'+(r.shared?' <span class="pill" title="shared region, read through '+e(r.elementId||"")+'">shared</span>':'')+'<div class="docsub">'+e(r.regionName)+'</div></div>').join("")+'</div>'; }).join("")+'</div>');
    if(facts.length) h.push('<div class="docsub" style="margin:8px 0">Facts true now: <span class="mono">'+facts.map(e).join(", ")+'</span></div>');
    const tl=(d.timeline||[]).slice().reverse();
    h.push('<h4 class="doch4">Timeline ('+tl.length+' events, newest first)</h4><div class="tscroll"><table class="stab doct"><thead><tr><th>At</th><th>Model</th><th>Transition</th><th>Result</th><th>Region</th><th>Why (guards that refused)</th><th>Actor</th></tr></thead><tbody>'+
      tl.slice(0,300).map(ev=>'<tr class="'+(ev.result==="fired"?"":ev.result==="override"?"twinovr":ev.result==="facts"?"":"twinref")+'"><td class="mono">'+fmt(ev.at)+'</td><td class="mono">'+e(ev.model||"")+'</td><td>'+e((ev.transition||"")+" "+(ev.name||""))+(ev.result==="facts"?'facts set: '+e(JSON.stringify(ev.factsApplied||{})):'')+'</td><td>'+e(ev.result)+'</td><td class="mono">'+e(ev.region||"")+(ev.stateAfter?' → '+e(ev.stateAfter):'')+'</td><td>'+(ev.override?e(ev.reason||""):(ev.guards||[]).filter(x=>x.verdict===false).map(x=>'<span class="mono">'+e(x.guard)+'</span>'+(x.contributedBy?' ['+e(x.contributedBy)+']':'')+(x.requirement==="Non-waivable"?' <b>non-waivable</b>':'')+': '+e(x.predicate||"")).join("<br>"))+(ev.result==="blocked: source not active"?'source state not active':'')+'</td><td class="mono">'+e(ev.actor||"")+'</td></tr>').join("")+'</tbody></table></div>');
    $("#twinInst").innerHTML=h.join("");
  }
  window.renderTwinTab=function(){
    const pane=document.getElementById("pane-twin"); if(!pane||pane._wired){ if(pane&&pane._wired&&!T.fleet&&T.mode==="none") connect(); return; }
    pane._wired=true; $("#twinUrl").value=T.url;
    $("#twinConnect").onclick=connect; $("#twinFiles").onchange=ev=>loadFiles([...ev.target.files]);
    $("#twinCls").onchange=ev=>{ T.filter.cls=ev.target.value; renderFleet(); }; $("#twinEx").onchange=ev=>{ T.filter.ex=ev.target.value; renderFleet(); };
    $("#twinRefused").onchange=ev=>{ T.filter.refused=ev.target.checked; renderFleet(); }; $("#twinHold").onchange=ev=>{ T.filter.hold=ev.target.checked; renderFleet(); };
    $("#twinQ").oninput=ev=>{ T.filter.q=ev.target.value; renderFleet(); };
    $("#twinRefresh").onclick=()=>{ if(T.mode==="api") connect(); else renderFleet(); };
    connect();
  };
})();
