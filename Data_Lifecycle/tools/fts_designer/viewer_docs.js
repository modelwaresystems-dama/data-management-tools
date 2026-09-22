// viewer_docs.js: the Documentation tab (viewer v0.22). Renders the selected model's chapter live from the loaded models:
// the executive page (what it manages, what it gates, a context diagram, whom it depends on, what is drafted for review)
// and the reference (regions and states, transitions, contributions, couplings both ways, facts, constraints, decision
// rights, services, events, metadata assets, exceptions, roles, sources). On the Global model it also renders the system
// book: model inventory, Knowledge Area by Global transition, Knowledge Area by Knowledge Area, metadata register counts and
// the Global-only transitions. Same content as tools/fts_designer/fts_docs.py, computed in the browser.
(function(){
  const GLOBAL_ID="GDA-GLOBAL-PROTOCOL";
  const ORDER=["KA-DHE","KA-DG","KA-DA","KA-DMD","KA-DSO","KA-DS","KA-DII","KA-DCM","KA-RMD","KA-DWBI","KA-MM","KA-DQ","KA-BDA"];
  const CHAPTER={"KA-DHE":2,"KA-DG":3,"KA-DA":4,"KA-DMD":5,"KA-DSO":6,"KA-DS":7,"KA-DII":8,"KA-DCM":9,"KA-RMD":10,"KA-DWBI":11,"KA-MM":12,"KA-DQ":13,"KA-BDA":14};
  const KIND={guard:"G",event:"E",service:"S",decisionRight:"D",control:"C"};
  const e=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  function models(){ const ms={}; (window.MODELS||[]).forEach(m=>{ const id=m.meta&&m.meta.modelId; if(id&&(id===GLOBAL_ID||id.startsWith("KA-"))) ms[id]=m; }); return ms; }
  const kaIds=ms=>ORDER.filter(k=>ms[k]).concat(Object.keys(ms).filter(k=>k.startsWith("KA-")&&!ORDER.includes(k)).sort());
  const short=id=>id.startsWith("KA-")?id.slice(3):"Global";
  const kaName=(ms,id)=>ms[id]?(ms[id].meta.knowledgeArea||ms[id].meta.name):id;
  const sName=(m,id)=>{ const s=(m.subStates||[]).concat(m.globalStates||[]).find(x=>x.id===id); return s?s.name:id; };
  const trName=(m,id)=>{ const t=m&&(m.transitions||[]).find(x=>x.id===id); return t?t.name:""; };
  const incoming=(ms,mid)=>{ const out=[]; Object.entries(ms).forEach(([oid,om])=>{ if(oid===mid) return; (om.kaCouplings||[]).forEach(k=>{ if(k.targetModel===mid) out.push([oid,k]); }); }); return out; };
  const gt=g=>(g.transitions||[]).filter(t=>!t.id.startsWith("TR-INIT"));
  function table(headers,rows,id){ if(!rows.length) return '<div class="docnone">none</div>'; return '<div class="tscroll"><table class="stab doct"'+(id?' data-doc="'+e(id)+'"':'')+'><thead><tr>'+headers.map(h=>'<th>'+e(h)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map((c,j)=>'<td'+(j===0&&/^[A-Z]{2,4}-[A-Z0-9][A-Z0-9-]*$/.test(String(c))?' class="mono"':'')+'>'+e(c)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>'; }
  function contextSvg(ms,mid){
    const m=ms[mid], g=ms[GLOBAL_ID];
    const gregs=g?g.regions:[{id:"REG-EX",name:"Existence"},{id:"REG-AS",name:"Assurance"},{id:"REG-AV",name:"Availability"},{id:"REG-CP",name:"Custody / Preservation"}];
    const by={}; gregs.forEach(r=>by[r.id]=[]);
    (m.contributions||[]).forEach(c=>{ const code=(c.globalTransition.split("-")[1]||""); const rid={EX:"REG-EX",AS:"REG-AS",AV:"REG-AV",CP:"REG-CP"}[code]; if(by[rid]) by[rid].push(c.globalTransition+" "+(KIND[c.kind]||"?")+(c.requirement==="Non-waivable"?"*":"")); });
    const others={}; (m.kaCouplings||[]).forEach(k=>{ (others[k.targetModel]=others[k.targetModel]||{out:[],in:[]}).out.push(k.id+(k.event?"*":"")); });
    incoming(ms,mid).forEach(([oid,k])=>{ (others[oid]=others[oid]||{out:[],in:[]}).in.push(k.id); });
    const order=ORDER.filter(x=>others[x]).concat(Object.keys(others).filter(x=>!ORDER.includes(x)).sort());
    const W=1180, cL=40, cC=430, cR=800, bw=300, lh=14; const bh=n=>34+lh*Math.max(1,n);
    let y=60; const L=gregs.map(r=>{ const lines=by[r.id]||[]; const o=[r,lines,y]; y+=bh(lines.length)+14; return o; }); const hL=y;
    y=60; const C=(m.regions||[]).map(r=>{ const o=[r,y]; y+=58; return o; }); const hC=y;
    y=60; const R=order.map(oid=>{ const o=others[oid].out, i=others[oid].in; const lines=["declares "+o.length+" · receives "+i.length]; if(o.length) lines.push("out: "+o.slice(0,3).join(", ")+(o.length>3?" +"+(o.length-3):"")); if(i.length) lines.push("in: "+i.slice(0,3).join(", ")+(i.length>3?" +"+(i.length-3):"")); const r=[oid,lines,y]; y+=bh(lines.length)+10; return r; }); const hR=y;
    const Hh=Math.max(hL,hC,hR,200)+30; const s=[];
    s.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+Hh+'" style="width:100%;max-width:1180px;height:auto;background:#fff;border:1px solid var(--line);border-radius:8px" font-family="Segoe UI, Arial, sans-serif" font-size="12"><defs><marker id="docarr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#2f6f9a"/></marker></defs>');
    s.push('<text x="'+cL+'" y="34" font-size="13" font-weight="600" fill="#1e2a30">Global Data Asset Protocol (what this KA gates)</text><text x="'+cC+'" y="34" font-size="13" font-weight="600" fill="#1e2a30">'+e(kaName(ms,mid))+': managed elements</text><text x="'+cR+'" y="34" font-size="13" font-weight="600" fill="#1e2a30">Other Knowledge Areas (couplings)</text>');
    L.forEach(([r,lines,yy])=>{ const h=bh(lines.length); s.push('<rect x="'+cL+'" y="'+yy+'" width="'+bw+'" height="'+h+'" rx="6" fill="#e6eef5" stroke="#2f6f9a"/><text x="'+(cL+10)+'" y="'+(yy+18)+'" font-weight="600" fill="#1e2a30">'+e(r.name)+' <tspan font-weight="400" fill="#5f6f78">'+e(r.id)+'</tspan></text>'); lines.forEach((ln,i)=>s.push('<text x="'+(cL+10)+'" y="'+(yy+34+i*lh)+'" fill="#1e2a30" font-family="Consolas, Menlo, monospace" font-size="11">'+e(ln)+'</text>')); if(!lines.length) s.push('<text x="'+(cL+10)+'" y="'+(yy+34)+'" fill="#9aa5ab" font-size="11">no contribution</text>'); else s.push('<line x1="'+cC+'" y1="'+Math.round(yy+h/2)+'" x2="'+(cL+bw)+'" y2="'+Math.round(yy+h/2)+'" stroke="#2f6f9a" stroke-width="1.4" marker-end="url(#docarr)"/>'); });
    C.forEach(([r,yy])=>{ s.push('<rect x="'+cC+'" y="'+yy+'" width="'+bw+'" height="48" rx="6" fill="#e3f1f0" stroke="#0f6b6e"/><text x="'+(cC+10)+'" y="'+(yy+19)+'" font-weight="600" fill="#1e2a30">'+e(r.name.slice(0,44))+'</text><text x="'+(cC+10)+'" y="'+(yy+36)+'" fill="#5f6f78" font-size="11">'+e(r.id)+' · '+e((r.instanceScope||"").slice(0,40))+'</text>'); });
    R.forEach(([oid,lines,yy])=>{ const h=bh(lines.length); s.push('<rect x="'+cR+'" y="'+yy+'" width="'+bw+'" height="'+h+'" rx="6" fill="#efe8f6" stroke="#6a3d9a"/><text x="'+(cR+10)+'" y="'+(yy+18)+'" font-weight="600" fill="#1e2a30">'+e(kaName(ms,oid).replace("Business Intelligence","BI").replace("Interoperability","Interop.").slice(0,36))+' <tspan font-weight="400" fill="#5f6f78">'+e(oid)+'</tspan></text>'); lines.forEach((ln,i)=>s.push('<text x="'+(cR+10)+'" y="'+(yy+34+i*lh)+'" fill="#1e2a30" font-family="Consolas, Menlo, monospace" font-size="11">'+e(ln)+'</text>')); s.push('<line x1="'+(cC+bw)+'" y1="'+Math.round(yy+h/2)+'" x2="'+cR+'" y2="'+Math.round(yy+h/2)+'" stroke="#6a3d9a" stroke-width="1.4"/>'); });
    s.push('<text x="'+cL+'" y="'+(Hh-10)+'" fill="#5f6f78" font-size="11">G guard · E event · S service · D decision right · * Non-waivable (left) or event emitted into the other KA (right) · out: declared by this KA · in: declared by the other KA against this one</text></svg>');
    return s.join("");
  }
  function book(ms){
    const g=ms[GLOBAL_ID]; const kas=kaIds(ms); const h=[];
    h.push('<h2 class="doch2">The system book</h2><p class="lede">One Global Data Asset Protocol and one FTS per Knowledge Area. A Knowledge Area never becomes a region of the Data Asset: it reaches the Global protocol through contributions (a guard, event, service or decision right on a named Global transition) and other Knowledge Areas through couplings (an event emitted into another FTS, or a fact of another FTS cited). Every artefact and evidence record is a Metadata Asset described in Metadata Management and quality-controlled in Data Quality (rule of 22 Sep 2026); couplings are shown from both sides.</p>');
    h.push('<h3 class="doch3">The models</h3>'+table(["Model","Version","DMBOK chapter","Regions","States","Transitions","Contributions","Couplings declared","Decision rights","Metadata assets"],
      [["Global protocol",g.meta.version||"","–",g.regions.length,g.subStates.length,gt(g).length,"–","–",(g.decisionRights||[]).length,(g.evidence||[]).length]].concat(kas.map(k=>{const m=ms[k]; return [kaName(ms,k),m.meta.version||"",CHAPTER[k]||"",m.regions.length,m.subStates.length,gt(m).length,(m.contributions||[]).length,(m.kaCouplings||[]).length,(m.decisionRights||[]).length,(m.artefacts||[]).length+(m.evidence||[]).length];})),"TBL-MODELS"));
    const rows=[]; const unc=[];
    gt(g).forEach(t=>{ const r=[t.id+" "+t.name]; let tot=0; kas.forEach(k=>{ const cs=(ms[k].contributions||[]).filter(c=>c.globalTransition===t.id); r.push(cs.map(c=>(KIND[c.kind]||"?")+(c.requirement==="Non-waivable"?"*":"")).join(" ")); tot+=cs.length; }); r.push(tot); rows.push(r); if(!tot) unc.push(t); });
    rows.push(["Per Knowledge Area"].concat(kas.map(k=>(ms[k].contributions||[]).length)).concat([kas.reduce((a,k)=>a+(ms[k].contributions||[]).length,0)]));
    h.push('<h3 class="doch3">Knowledge Area by Global transition</h3><p class="lede">G guard, E event, S service, D decision right; a star marks a Non-waivable guard.</p>'+table(["Global transition"].concat(kas.map(short)).concat(["Total"]),rows,"TBL-KA-GLOBAL"));
    if(unc.length) h.push('<p class="lede">Global-only transitions (no Knowledge Area contribution): '+unc.map(t=>e(t.id+" "+t.name)).join("; ")+'.</p>');
    const kr=kas.map(a=>{ const r=[short(a)]; let n=0; kas.forEach(b=>{ const cell=[]; (ms[a].kaCouplings||[]).forEach(k=>{ if(k.targetModel!==b) return; n++; cell.push(k.trace==="derived:metadata-assets"?"m":k.event?"e":/Forward/.test(k.note||"")?"f":"c"); }); r.push(cell.sort().join("")); }); r.push(n); return r; });
    kr.push(["Received"].concat(kas.map(b=>kas.reduce((a,x)=>a+(ms[x].kaCouplings||[]).filter(k=>k.targetModel===b).length,0))).concat([""]));
    h.push('<h3 class="doch3">Knowledge Area by Knowledge Area</h3><p class="lede">Rows declare, columns receive: e event emitted, c fact cited, f fact of the row KA cited by the column KA, m generated metadata-asset couplings.</p>'+table(["Declares \\ receives"].concat(kas.map(short)).concat(["Declared"]),kr,"TBL-KA-KA"));
    const na=kas.reduce((a,k)=>a+(ms[k].artefacts||[]).length,0), ne=kas.reduce((a,k)=>a+(ms[k].evidence||[]).length,0);
    h.push('<h3 class="doch3">The metadata output register</h3><p class="lede">'+na+' artefacts and '+ne+' evidence records across '+kas.length+' Knowledge Areas, each a Metadata Asset. The full register is in each chapter (Artefacts and evidence) and in docs/fts_system_book.docx.</p>');
    return h.join("");
  }
  function chapter(ms,mid){
    const m=ms[mid], g=ms[GLOBAL_ID], isG=mid===GLOBAL_ID; const h=[];
    h.push('<div class="docsub">'+(isG?'Layer 2 of the Global Data Asset Architecture':'Knowledge Area FTS, DMBOK chapter '+(CHAPTER[mid]||''))+' · model '+e(mid)+' v'+e(m.meta.version||"")+' · built '+e(m.meta.buildStamp||"")+' · rendered live from the loaded models</div>');
    h.push('<h2 class="doch2">In one page</h2><p class="docp"><span class="mono docid">[META-DEF]</span> '+e(m.meta.definition||(m.contextCapture||{}).definition||m.meta.note||"")+'</p>');
    if(!isG){
      const cc=m.contextCapture||{}; if(cc.ensures) h.push('<p class="docp"><span class="mono docid">[META-ENSURES]</span> What the Knowledge Area ensures: '+e(cc.ensures)+'</p>');
      h.push('<h3 class="doch3">What it manages</h3>'+table(["Managed element","Region","Instance scope","Kind","States","Initial state"],(m.regions||[]).map(r=>[r.managedElement||r.name,r.id+" ("+(r.code||"")+")",r.instanceScope||"",r.elementKind||"",m.subStates.filter(s=>(s.region||s.parent)===r.id).length,sName(m,r.initialState)]),"TBL-MANAGES"));
      h.push('<h3 class="doch3">What it gates in the Global protocol</h3>'+table(["ID","Global transition","Kind","Requirement","What it says"],(m.contributions||[]).map(c=>[c.id,c.globalTransition+" "+(g?trName(g,c.globalTransition):""),c.kind,c.requirement||"",c.predicate||""]),"TBL-GATES"));
      h.push('<figure class="docfig">'+contextSvg(ms,mid)+'<figcaption>Context of the '+e(kaName(ms,mid))+' FTS: Global regions it gates (left), its managed elements (centre), Knowledge Areas it is coupled to (right).</figcaption></figure>');
      const outs=(m.kaCouplings||[]).filter(k=>k.trace!=="derived:metadata-assets"); const ins=incoming(ms,mid);
      h.push('<h3 class="doch3">Whom it depends on and who depends on it</h3><p class="docp"><span class="mono docid">[META-COUPLING-SUMMARY]</span> '+outs.length+' couplings declared to '+new Set(outs.map(k=>k.targetModel)).size+' other Knowledge Areas; '+ins.length+' couplings declared by '+new Set(ins.map(x=>x[0])).size+' other Knowledge Areas against this one; its '+(m.artefacts||[]).length+' artefacts and '+(m.evidence||[]).length+' evidence records are metadata assets described in Metadata Management and quality-controlled in Data Quality.</p>');
      const items=(m.qaFindings||[]).filter(f=>["capture","phase","scope","derived","GA-005"].includes(f.rule)||(f.severity==="note"&&f.rule==="N-007")).map(f=>e(f.element||"")+": "+e(f.finding||""));
      const drs=(m.decisionRights||[]).filter(d=>/REVIEW/.test(d.notes||"")); if(drs.length) items.push(drs.length+" decision-right holders drafted (REVIEW): "+drs.map(d=>e(d.id+" "+(d.holder||""))).join(", "));
      h.push('<h3 class="doch3">Drafted for review</h3><ul class="docul">'+(items.length?items.map(x=>'<li>'+x+'</li>').join(""):'<li>Nothing marked for review.</li>')+'</ul>');
    } else {
      h.push('<h3 class="doch3">The four regions</h3>'+table(["Region","ID","Initial state","States"],m.regions.map(r=>[r.name,r.id,sName(m,r.initialState),m.subStates.filter(s=>(s.region||s.parent)===r.id).length]),"TBL-REGIONS"));
      h.push('<h3 class="doch3">What the Knowledge Areas contribute</h3>'+table(["Transition","Name","Count","Contributions (KA, ID, kind)"],gt(m).map(t=>{ const cs=[]; kaIds(ms).forEach(k=>(ms[k].contributions||[]).forEach(c=>{ if(c.globalTransition===t.id) cs.push(short(k)+" "+c.id+" ("+(KIND[c.kind]||"?")+(c.requirement==="Non-waivable"?"*":"")+")"); })); return [t.id,t.name,cs.length,cs.join(", ")]; }),"TBL-CONTRIB-IN"));
      h.push(book(ms));
    }
    h.push('<hr class="docpb"><h2 class="doch2">Reference</h2><h3 class="doch3">Regions and states</h3>');
    (m.regions||[]).forEach(r=>{ h.push('<h4 class="doch4"><span class="mono">'+e(r.id)+'</span> '+e(r.name)+'</h4>'+(r.question?'<p class="docp"><span class="mono docid">['+e(r.id)+']</span> '+e(r.question)+' Invariant: '+e(r.regionInvariant||"")+'</p>':'')+table(["ID","State","Definition","Invariant",""],m.subStates.filter(s=>(s.region||s.parent)===r.id).map(s=>[s.id,s.name,s.definition||"",s.invariant||s.stateInvariant||"",(s.initial?"initial ":"")+(s.terminal?"terminal":"")]),"TBL-"+r.id)); });
    h.push('<h3 class="doch3">Transitions</h3>'+table(["ID","Transition","From → to","Event","Guard","Decision right","Services","XRG"],gt(m).map(t=>[t.id,t.name,sName(m,t.source)+" → "+sName(m,t.target),t.event||"",t.guardSummary||"",t.decisionRight||"",(t.services||[]).join(", "),(t.crossRegionConstraints||[]).join(", ")]),"TBL-TRANSITIONS"));
    if(!isG){
      h.push('<h3 class="doch3">Contributions to the Global protocol</h3>'+table(["ID","Global transition","Kind","Requirement","Required KA states","Predicate","Expression","Note"],(m.contributions||[]).map(c=>[c.id,c.globalTransition+" "+(g?trName(g,c.globalTransition):""),c.kind,c.requirement||"",Object.entries(c.requiredStates||{}).map(([code,ids])=>code+": "+ids.map(x=>sName(m,x)).join(", ")).join("; "),c.predicate||"",c.expression||"",c.note||""]),"TBL-CONTRIBUTIONS"));
      h.push('<h3 class="doch3">Couplings declared by this Knowledge Area</h3>'+table(["ID","Target KA","Target transition","Event","Fact","Predicate","Note"],(m.kaCouplings||[]).map(k=>[k.id,kaName(ms,k.targetModel)+" ("+k.targetModel+")",(k.targetTransition||"")+" "+(ms[k.targetModel]?trName(ms[k.targetModel],k.targetTransition):""),k.event||"",k.expression||"",k.predicate||"",k.note||""]),"TBL-COUPLINGS-OUT"));
      const ins=incoming(ms,mid); h.push('<h3 class="doch3">Couplings declared by other Knowledge Areas against this one (derived)</h3>'+(ins.length?table(["ID","Declared by","Transition of this FTS","Event","Fact","Predicate","Note"],ins.map(([o,k])=>[k.id,kaName(ms,o)+" ("+o+")",(k.targetTransition||"")+" "+trName(m,k.targetTransition),k.event||"",k.expression||"",k.predicate||"",k.note||""]),"TBL-COUPLINGS-IN"):'<div class="docnone">No loaded model declares a coupling into this FTS'+((window.MODELS||[]).length<3?' (load the other Knowledge Area models to see them)':'')+'.</div>'));
      const fb=m.meta.factBindings||{}; if(Object.keys(fb).length) h.push('<h3 class="doch3">Facts derived from the State Vector</h3>'+table(["Fact","Region","True in states"],Object.entries(fb).map(([f,v])=>[f,v.region||"",(v.states||[]).map(x=>sName(m,x)).join(", ")]),"TBL-FACTS"));
    }
    h.push('<h3 class="doch3">Cross-region constraints</h3>'+table(["ID","Constraint","Applies to","Requirement","Expression"],(m.crossRegionConstraints||[]).map(x=>[x.id,x.constraint||x.text||"",Array.isArray(x.transitions||x.appliesTo)?(x.transitions||x.appliesTo).join(", "):String(x.appliesTo||""),x.requirement||"",x.expression||""]),"TBL-XRG"));
    h.push('<h3 class="doch3">Decision rights</h3>'+table(["ID","Decision right","Holder","Applies to","Note"],(m.decisionRights||[]).map(d=>[d.id,d.name||"",d.holder||"",d.appliesTo||"",d.notes||""]),"TBL-DR"));
    h.push('<h3 class="doch3">Services</h3>'+table(["ID","Family","Service","Trigger","Output"],(m.services||[]).map(s=>[s.id,s.family||"",s.name||"",s.trigger||"",s.output||""]),"TBL-SERVICES"));
    if((m.events||[]).length) h.push('<h3 class="doch3">Events</h3>'+table(["ID","Event","Type","Meaning"],m.events.map(x=>[x.id,x.name||"",x.eventType||"",x.meaning||""]),"TBL-EVENTS"));
    h.push('<h3 class="doch3">Artefacts and evidence (metadata assets)</h3>'+table(["ID","Name","Type","Produced or evidenced","Use"],(m.artefacts||[]).map(a=>[a.id,a.name,a.artefactType||"","produced in "+(a.producedIn||"")+" "+sName(m,a.producedIn),a.evidenceUse||""]).concat((m.evidence||[]).map(x=>[x.id,x.name,x.evidenceType||"","evidences "+(x.relatesTo||"")+" "+trName(m,x.relatesTo),x.description||""])),"TBL-ARTEFACTS"));
    if((m.exceptions||[]).length) h.push('<h3 class="doch3">Exceptions</h3>'+table(["ID","Exception","Transition","Basis","Conditions"],m.exceptions.map(x=>[x.id,x.name||"",x.transition||"",x.basis||"",x.conditions||""]),"TBL-EXC"));
    if((m.roles||[]).length) h.push('<h3 class="doch3">Roles</h3>'+table(["ID","Role","Accountability","Responsibility"],m.roles.map(r=>[r.id,r.name||"",r.accountability||"",r.responsibility||""]),"TBL-ROLES"));
    h.push('<h3 class="doch3">Sources</h3><ul class="docul">'+((m.sources||[]).length?m.sources.map(s=>'<li>'+e((s.id||"")+": "+(s.source||"")+" ("+(s.type||"")+"). "+(s.limitations||""))+'</li>').join(""):'<li>'+e(m.meta.source||"")+'</li>')+'</ul>');
    h.push('<div class="docsub">Rendered '+new Date().toLocaleString("en-GB")+' from the loaded models by the viewer. The commentable Word chapters and the system book are generated by tools/fts_designer/fts_docs.py into docs/. Status: Proposed / illustrative.</div>');
    return h.join("");
  }
  window.renderDocTab=function(){
    const el=document.getElementById("docBody"); if(!el) return; const cur=window.M; const ms=models();
    if(!cur||!cur.meta||!(cur.meta.modelId===GLOBAL_ID||String(cur.meta.modelId).startsWith("KA-"))){ el.innerHTML='<div class="docnone">Select the Global protocol or a Knowledge Area model.</div>'; return; }
    document.getElementById("docTitle").textContent=cur.meta.name||cur.meta.modelId;
    el.innerHTML=chapter(ms,cur.meta.modelId);
  };
  window.printDocTab=function(){
    const w=window.open("","_blank"); if(!w) return;
    const css='body{font-family:Segoe UI,Arial,sans-serif;font-size:11px;color:#1e2a30;margin:20px} h1{font-size:20px} h2{font-size:15px;color:#0f6b6e;margin-top:18px} h3{font-size:12.5px;margin-top:14px} h4{font-size:11.5px} table{border-collapse:collapse;width:100%;font-size:9.5px;margin:4px 0 10px} th,td{border:1px solid #d3dbe0;padding:3px 5px;vertical-align:top;text-align:left} th{background:#e6eef5} .mono{font-family:Consolas,Menlo,monospace;font-size:9px;color:#5f6f78} figure{margin:8px 0} svg{max-width:100%} .docsub{color:#5f6f78;font-size:10px} hr{margin:16px 0}';
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+e(document.getElementById("docTitle").textContent)+'</title><style>'+css+'</style></head><body><h1>'+e(document.getElementById("docTitle").textContent)+'</h1>'+document.getElementById("docBody").innerHTML+'</body></html>');
    w.document.close(); setTimeout(()=>w.print(),400);
  };
})();
