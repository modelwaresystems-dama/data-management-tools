<script>
/* =====================================================================
   VIEWS
   ===================================================================== */
var CURTAB="setup";
function showTab(t){
  CURTAB=t;
  $$(".tab").forEach(function(x){x.classList.toggle("on",x.dataset.tab===t);});
  $$(".view").forEach(function(v){v.classList.toggle("on",v.id==="v-"+t);});
  window.scrollTo(0,0);
  if(t==="session")   renderSession();
  if(t==="spine")     renderSpine();
  if(t==="register")     renderRegister();
  if(t==="requirements") renderRequirements();
  if(t==="assurance")    renderAssurance();
  if(t==="remed")        renderRemediation();
  if(t==="lifecycle")    renderLifecycle();
  if(t==="gates")        renderGates();
  if(t==="canvas")       renderCanvas();
  if(t==="pack")         renderPack();
  if(t==="reference")    renderReference();
}
function ticks(){
  var s=STATE; if(!s) return;
  var done=Object.keys(s.stepsDone).length;
  $("#tick-session").textContent = done?("· "+done+"/"+STEPS.length):"";
  var mism=s.evals.filter(function(e){return flagOf(e.recorded,computeStatus(e.result,e.threshold));}).length;
  $("#tick-register").textContent = s.evals.length?("· "+(s.evals.length-mism)+"/"+s.evals.length+" clean"):"";
  var reqs=s.requirements||[];
  var rpass=reqs.filter(function(r){var x=reqStatus(r).s;return x==="Pass"||x==="Satisfied";}).length;
  $("#tick-requirements").textContent = reqs.length?("· "+rpass+"/"+reqs.length):"";
  var ac=CONCERNS.filter(function(c){return concernRollup(c.id).total>0;}).length;
  $("#tick-assurance").textContent = ac?("· "+ac+"/8"):"";
  var lg=LIFECYCLE.filter(function(g){return g.kind==="gate";});
  var lgd=lg.filter(function(g){return (s.lifecycle||{})[g.id]&&s.lifecycle[g.id].outcome;}).length;
  $("#tick-lifecycle").textContent = lgd?("· "+lgd+"/"+lg.length+" decided"):"";
  var cg=s.gates.filter(function(g){return g.status==="Closed";}).length;
  $("#tick-gates").textContent = s.gates.length?("· "+cg+"/"+s.gates.length+" closed"):"";
  $("#tick-canvas").textContent = s.canvases.length?("· "+s.canvases.length):"";
}

/* ------------------------------ SETUP ------------------------------ */
function renderLoadSummary(){
  var n=Object.keys(MODEL.sheets).length;
  $("#loadsummary").innerHTML = MODEL.loaded ?
    '<div class="notice ok" style="margin-top:14px"><b>'+esc(MODEL.company)+'</b> loaded from <span class="mono">'+esc(MODEL.file)+
    '</span>, '+n+' sheets, '+S("AIUseCase").length+' AI use cases, '+S("DataProduct").length+' data products, '+
    S("AIEval").length+' recorded eval checks.</div>' : "";
  if(MODEL.loaded){ $("#tenant").style.display=""; $("#tenant").textContent=MODEL.company; }
}
function renderUseCases(){
  if(!MODEL.loaded){ $("#ucpanel").style.display="none"; return; }
  $("#ucpanel").style.display="";
  var rows=S("AIUseCase");
  var themes=[""].concat(rows.map(function(r){return String(r.Theme||"");}).filter(function(v,i,a){return v&&a.indexOf(v)===i;}).sort());
  var phases=[""].concat(rows.map(function(r){return String(r.Phase||"");}).filter(function(v,i,a){return v&&a.indexOf(v)===i;}).sort());
  function opts(sel,list,cur){ sel.innerHTML=list.map(function(v){
    return '<option value="'+esc(v)+'"'+(v===cur?" selected":"")+'>'+(v?esc(v):"All")+'</option>';}).join(""); }
  if(!$("#uc-theme").dataset.init){ opts($("#uc-theme"),themes,""); opts($("#uc-phase"),phases,"");
    $("#uc-theme").dataset.init="1"; }
  var q=($("#uc-filter").value||"").toLowerCase(), th=$("#uc-theme").value, ph=$("#uc-phase").value;
  var list=rows.filter(function(r){
    if(th&&String(r.Theme||"")!==th) return false;
    if(ph&&String(r.Phase||"")!==ph) return false;
    if(!q) return true;
    return (String(r.AIUseCaseID)+" "+r.Name+" "+r.Theme+" "+r.Description).toLowerCase().indexOf(q)>=0;});
  $("#uc-count").textContent=list.length+" of "+rows.length;
  var pri={};
  S("UseCase_PriorityScore").forEach(function(p){pri[String(p.UseCaseID)]=p;});
  var pf={}; S("UseCasePortfolio").forEach(function(p){pf[String(p.UseCaseID)]=p;});
  var h='<thead><tr><th>ID</th><th>AI use case</th><th>Theme</th><th>Phase</th><th class="num">Value</th><th class="num">Readiness</th><th>Risk</th><th>Decision</th><th></th></tr></thead><tbody>';
  list.forEach(function(r){
    var id=String(r.AIUseCaseID), p=pri[id]||{}, f=pf[id]||{};
    h+='<tr'+(STATE.useCaseId===id?' style="background:var(--accent-soft)"':'')+'>'+
      '<td class="mono">'+esc(id)+'</td><td><b>'+esc(r.Name)+'</b><div class="hint" style="margin:2px 0 0">'+esc(String(r.Description||"").slice(0,120))+'</div></td>'+
      '<td>'+esc(r.Theme)+'</td><td>'+esc(r.Phase)+'</td>'+
      '<td class="num">'+esc(p.ValueScore||f.ValueScore||"")+'</td><td class="num">'+esc(p.ReadinessScore||f.ReadinessScore||"")+'</td>'+
      '<td>'+esc(f.RiskTier||"")+'</td><td>'+esc(p.Decision||f.RoadmapBucket||"")+'</td>'+
      '<td><button class="btn sm pri" data-pick="'+esc(id)+'">'+(STATE.useCaseId===id?"Selected":"Select")+'</button></td></tr>';
  });
  $("#uc-table").innerHTML=h+"</tbody>";
  $$("[data-pick]",$("#uc-table")).forEach(function(b){
    b.addEventListener("click",function(){ pickUseCase(b.dataset.pick); });});
  renderChosen();
}
function renderChosen(){
  var id=STATE.useCaseId;
  if(!id){ $("#uc-chosen").innerHTML=""; $("#sesspanel").style.display="none"; return; }
  var uc=findRow("AIUseCase","AIUseCaseID",id)||{};
  var sp=STATE.spine||{};
  var reach=SPINE_LAYERS.filter(function(l){return sp[l.k]&&sp[l.k].ids.length;}).length;
  $("#uc-chosen").innerHTML=
    '<div class="notice"><b>Selected:</b> <span class="mono">'+esc(id)+'</span> &middot; '+esc(uc.Name)+
    '<div class="hint" style="margin-top:5px">'+esc(uc.Description)+'</div>'+
    '<div style="margin-top:8px">'+
      '<span class="pill">'+reach+' of '+SPINE_LAYERS.length+' spine layers reachable</span>'+
      '<span class="pill mut">'+((sp.dataproduct&&sp.dataproduct.ids.length)||0)+' data products</span>'+
      '<span class="pill mut">'+((sp.decision&&sp.decision.ids.length)||0)+' decisions</span>'+
      '<span class="pill mut">'+STATE.evals.length+' eval checks</span>'+
    '</div></div>';
  $("#sesspanel").style.display="";
}
function pickUseCase(id){
  var uc=findRow("AIUseCase","AIUseCaseID",id); if(!uc) return;
  var switching = STATE.useCaseId && STATE.useCaseId!==id;
  if(switching && !confirm("Switching the use case re-seeds the spine, eval register, framework, gates, backlog and canvases. "+
     "Your written session answers are kept. Continue?")) return;
  if(switching){
    STATE.evals=[]; STATE.canvases=[]; STATE.activeCanvas="";
    STATE.gates=[]; STATE.remediation=[]; STATE.framework={};
    STATE.requirements=[]; STATE.assurance={}; STATE.lifecycle={}; REQ_SEQ=0;
    STATE.lanes={asis:"",prop:""}; STATE.spine={};
    delete STATE.fields.scenario;
    SPINE_LAYERS.forEach(function(L){ delete STATE.fields["spine_"+L.k]; });
  }
  STATE.useCaseId=id; STATE.useCaseName=String(uc.Name||""); STATE.company=MODEL.company; STATE.modelFile=MODEL.file;
  seedFromModel();
  save(); renderUseCases(); ticks();
}
function seedFromModel(){
  var id=STATE.useCaseId; if(!id) return;
  STATE.spine=resolveSpine(id);
  STATE.evals=evalRowsFor(id,STATE.spine);
  if(!STATE.gates.length) STATE.gates=DEFAULT_GATES.map(function(g){
    return {id:g.id,name:g.name,crit:g.crit,rule:g.rule,status:"Open",owner:"",evidence:""};});
  DIMENSIONS.forEach(function(d){ if(!STATE.framework[d.id])
    STATE.framework[d.id]={rag:"Not assessed",owner:d.lead,finding:"",evidence:""};});
  /* v2: generate the Eval Requirements from the authoritative upstream facts */
  STATE.requirements=STATE.requirements||[];
  if(!STATE.requirements.length){
    STATE.requirements=seedRequirements(id,STATE.spine,{});
  }
  /* lanes + scenario seeds */
  var sp=STATE.spine, uc=findRow("AIUseCase","AIUseCaseID",id)||{};
  var lane=[];
  ["stakeholder","vp","outcome","vstream","vstage","capability","process","decision","usecase","agent","dataproduct"].forEach(function(k){
    if(sp[k]&&sp[k].ids.length) lane.push(sp[k].ids.slice(0,2).join("/"));});
  if(!STATE.lanes.asis) STATE.lanes.asis=lane.join(" → ");
  if(!getF("scenario")) setF("scenario",
    "A programme is delivering activity, but the outcome the organisation cares about is not consistently evident. "+
    "The decision in front of us is where to intervene next, and "+id+" ("+String(uc.Name||"")+") is the AI use case proposed to support that judgement. "+
    "Treat this as a hypothetical training case: no result you record today is an operational decision.");
  /* seed canvases from the mapped data products */
  if(!STATE.canvases.length && sp.dataproduct){
    sp.dataproduct.ids.forEach(function(dpid){ STATE.canvases.push(newCanvasFromProduct(dpid)); });
    if(STATE.canvases.length) STATE.activeCanvas=STATE.canvases[0].id;
  }
  save();
}

/* ------------------------------ SESSION ------------------------------ */
var TIMER={t0:null,int:null,limit:0};
function renderSession(){
  if(!STATE.useCaseId){ $("#sess-guard").style.display=""; $("#sess-body").style.display="none"; return; }
  $("#sess-guard").style.display="none"; $("#sess-body").style.display="";
  var cur=STEPS.filter(function(s){return s.n===STATE.step;})[0]||STEPS[0];
  STATE.phase=cur.ph;
  $("#phasebar").innerHTML=PHASES.map(function(p){
    var done=STEPS.filter(function(s){return s.ph===p.id&&STATE.stepsDone[s.n];}).length;
    var tot=STEPS.filter(function(s){return s.ph===p.id;}).length;
    return '<button class="phasebtn'+(p.id===cur.ph?" on":"")+'" data-ph="'+p.id+'"><b>'+esc(p.name)+'</b>'+
      '<span>'+esc(p.time)+' · '+done+'/'+tot+' complete</span></button>';}).join("");
  $$("[data-ph]",$("#phasebar")).forEach(function(b){ b.addEventListener("click",function(){
    var first=STEPS.filter(function(s){return s.ph===b.dataset.ph;})[0]; STATE.step=first.n; save(); renderSession();});});
  $("#steplist").innerHTML=STEPS.filter(function(s){return s.ph===cur.ph;}).map(function(s){
    return '<button class="stepchip'+(s.n===cur.n?" on":"")+(STATE.stepsDone[s.n]?" done":"")+'" data-step="'+s.n+'">'+
      s.n+'. '+esc(s.title)+'</button>';}).join("");
  $$("[data-step]",$("#steplist")).forEach(function(b){ b.addEventListener("click",function(){
    STATE.step=+b.dataset.step; save(); renderSession();});});
  $("#slide").innerHTML=slideHTML(cur);
  wireSlide(cur);
  ticks();
}
function slideHTML(s){
  var h='<div class="slidehead"><span class="tcode">'+esc(s.t)+' min</span><h2>'+s.n+'. '+esc(s.title)+'</h2>'+
        '<span class="spacer"></span><span class="timer" id="timer">--:--</span>'+
        '<button class="btn sm" id="timer-btn">Start timer</button></div>';
  h+='<div class="facil"><h4>On screen</h4><p>'+esc(s.slide)+'</p></div>';
  h+='<div class="facil"><h4>Facilitator</h4><p class="say">'+esc(s.facil)+'</p>'+
     (s.out?'<p class="hint" style="margin-bottom:0"><b>Canvas output:</b> '+esc(s.out)+'</p>':'')+'</div>';
  var mmPos=(MINDMAP_STEPS[s.n]||{}).pos;
  if(mmPos!=="after") h+=MINDMAP_HTML(s.n);
  if(s.link) h+='<p><button class="btn pri" data-go="'+s.link+'">'+esc(s.linkLabel||"Open")+' &rarr;</button>'+
     (s.link2?' <button class="btn pri" data-go="'+s.link2+'">'+esc(s.link2Label||"Open")+' &rarr;</button>':'')+
     ' <span class="hint" style="display:inline-block;margin-left:8px">This step is completed on that tab; come back here to continue the flow.</span></p>';
  if(s.custom) h+=customHTML(s.custom);
  if(mmPos==="after") h+=MINDMAP_HTML(s.n);
  if(s.fields) h+='<div class="grid '+(s.fields.length>4?"g2":"")+'" style="margin-top:6px">'+
     s.fields.map(function(f){return fieldHTML(f);}).join("")+'</div>';
  if(s.concerns) h+='<div class="notice amb" style="margin-top:12px"><b>Assurance concerns in play:</b> '+
     s.concerns.map(function(id){var c=CONCERNS.filter(function(x){return x.id===id;})[0];
       return c?(c.n+". "+c.name):id;}).join(" &middot; ")+
     (s.dims?'<div class="hint" style="margin:6px 0 0">Carried over from v1 dimension'+(s.dims.length>1?"s":"")+' '+
       s.dims.map(function(n){var d=DIMENSIONS[n-1];return esc(d.n+". "+d.name);}).join("; ")+'.</div>':'')+
     '<div class="row" style="margin-top:8px">'+
     '<button class="btn sm" data-go="assurance">Open the assurance view &rarr;</button>'+
     '<button class="btn sm" data-go="requirements">Write the requirements &rarr;</button></div></div>';
  if(s.pivot) h+='<div class="notice"><b>Facilitator pivot:</b> &ldquo;'+esc(s.pivot)+'&rdquo;</div>';
  var ans=answerFor(s.n);
  if(ans) h+='<div class="reveal" id="reveal"><button class="btn" id="reveal-btn">&#128065; Reveal the model answer</button>'+
     '<div class="answer">'+ans+'</div></div>';
  h+='<div class="navrow"><button class="btn" id="prev"'+(s.n===1?" disabled":"")+'>&larr; Previous</button>'+
     '<label class="chk"><input type="checkbox" id="stepdone"'+(STATE.stepsDone[s.n]?" checked":"")+'> Step complete</label>'+
     '<span class="spacer"></span><button class="btn pri" id="next"'+(s.n===STEPS.length?" disabled":"")+'>Next &rarr;</button></div>';
  return h;
}
function fieldHTML(f){
  var v=getF(f.k);
  var inp;
  if(f.type==="textarea") inp='<textarea data-f="'+f.k+'">'+esc(v)+'</textarea>';
  else if(f.type==="select") inp='<select class="fw" data-f="'+f.k+'">'+f.opts.map(function(o){
      return '<option'+(o===v?" selected":"")+'>'+esc(o)+'</option>';}).join("")+'</select>';
  else inp='<input type="'+(f.type||"text")+'" class="fw" data-f="'+f.k+'" value="'+esc(v)+'">';
  return '<div class="fld-b"><label>'+esc(f.l||f.label)+(f.hint?' <i>&middot; '+esc(f.hint)+'</i>':'')+'</label>'+inp+'</div>';
}
/* Progressive reveal: what AI contributes at each depth, and what it must not decide. */
var AIROLE_SVG = [
'<div style="border:1px solid var(--line);border-radius:10px;background:#fbfdff;padding:10px;margin:6px 0 12px;overflow-x:auto">',
'<svg viewBox="0 0 780 290" width="100%" style="min-width:640px;display:block" role="img" aria-label="Where AI contributes at each iceberg depth and where human judgement must remain">',
'<style>',
'.hd{font:700 11px system-ui,Segoe UI,sans-serif;fill:#5b6b7f;letter-spacing:.06em;text-transform:uppercase}',
'.ly{font:700 13px system-ui,Segoe UI,sans-serif;fill:#1a2a3a}',
'.lv{font:400 10.5px system-ui,Segoe UI,sans-serif;fill:#5b6b7f}',
'.tx{font:400 12px system-ui,Segoe UI,sans-serif;fill:#1a2a3a}',
'.wl{font:700 9.5px system-ui,Segoe UI,sans-serif;fill:#1f5c9e;letter-spacing:.08em}',
'.ft{font:400 11px system-ui,Segoe UI,sans-serif;fill:#5b6b7f}',
'</style>',
'<text class="hd" x="16" y="16">Iceberg depth</text>',
'<text class="hd" x="266" y="16">AI contributes</text>',
'<text class="hd" x="530" y="16">Human judgement owns</text>',
'<line x1="256" y1="24" x2="256" y2="252" stroke="#d9e2ec"/>',
'<line x1="520" y1="24" x2="520" y2="252" stroke="#d9e2ec"/>',
/* rows */
'<rect x="14" y="28"  width="232" height="48" rx="7" fill="#f2f7fc" stroke="#d9e2ec"/>',
'<text class="ly" x="26" y="48">Events</text><text class="lv" x="26" y="64">React: visible tip</text>',
'<text class="tx" x="266" y="50">Organise the evidence</text>',
'<text class="lv" x="266" y="66">assemble, deduplicate, structure</text>',
'<text class="tx" x="530" y="50">Decide what counts as a result</text>',
'<text class="lv" x="530" y="66">and which evidence is admissible</text>',

'<line x1="14" y1="84" x2="766" y2="84" stroke="#1f5c9e" stroke-width="2" stroke-dasharray="6 4"/>',
'<rect x="24" y="77" width="66" height="14" fill="#fbfdff"/><text class="wl" x="30" y="88">WATERLINE</text>',

'<rect x="14" y="96"  width="232" height="48" rx="7" fill="#e9f1f9" stroke="#d9e2ec"/>',
'<text class="ly" x="26" y="116">Patterns &amp; trends</text><text class="lv" x="26" y="132">Anticipate</text>',
'<text class="tx" x="266" y="118">Detect patterns</text>',
'<text class="lv" x="266" y="134">recurrence across time, cohort, setting</text>',
'<text class="tx" x="530" y="118">Judge whether it is meaningful</text>',
'<text class="lv" x="530" y="134">signal, artefact or measurement error</text>',

'<rect x="14" y="152" width="232" height="48" rx="7" fill="#dfeaf6" stroke="#d9e2ec"/>',
'<text class="ly" x="26" y="172">Systemic structures</text><text class="lv" x="26" y="188">Redesign</text>',
'<text class="tx" x="266" y="174">Classify depth, as a proposal</text>',
'<text class="lv" x="266" y="190">with a confidence and its drivers</text>',
'<text class="tx" x="530" y="174">Choose the intervention</text>',
'<text class="lv" x="530" y="190">and accept the consequences of it</text>',

'<rect x="14" y="208" width="232" height="48" rx="7" fill="#d5e3f2" stroke="#d9e2ec"/>',
'<text class="ly" x="26" y="228">Mental models</text><text class="lv" x="26" y="244">Transform: foundation</text>',
'<text class="tx" x="266" y="230">Surface candidate assumptions</text>',
'<text class="lv" x="266" y="246">as hypotheses, never as findings</text>',
'<text class="tx" x="530" y="230">Name, test and change the belief</text>',
'<text class="lv" x="530" y="246">no model has standing here</text>',

/* depth arrow */
'<line x1="7" y1="30" x2="7" y2="254" stroke="#1f5c9e" stroke-width="1.5" marker-end="url(#ar)"/>',
'<defs><marker id="ar" markerWidth="7" markerHeight="7" refX="3" refY="3" orient="auto">',
'<path d="M0,0 L6,3 L0,6 z" fill="#1f5c9e"/></marker></defs>',
'<text class="ft" x="14" y="278">Leverage rises with depth, and the evidence thins. The deeper the layer, the more the model proposes and the less it decides.</text>',
'</svg></div>'].join("");
/* The supplied mind map, one branch per step. The session design says reveal
   progressively, so each step shows only the branch that belongs to it and the
   panel stays collapsed until the facilitator opens it. */
var MINDMAP_STEPS = {
 6:{img:"leverage", title:"Mind map: the Hierarchy of Leverage branch",
    lead:"This is the branch that carries the four levels the room has just been given. Open it after the reclassification, "+
         "not before, so it confirms the vocabulary rather than supplying it.",
    order:["<b>Events (Visible Tip)</b>, then its three children: observable outcomes, immediate symptoms, reactive quick-fix responses. "+
           "Ask which of the six cards sits here.",
           "<b>Patterns and Trends</b>, then: recurring behaviours over time, systemic tendencies, anticipatory interventions. "+
           "This is where the room usually realises card 2 is a pattern and not an event.",
           "<b>Systemic Structures</b>, then: policies and processes, physical and digital infrastructure, information and power flows. "+
           "Name the AGGPSA equivalents out loud: educator capacity, the measurement-to-decision lag, the funding cycle.",
           "<b>Mental Models (Core Foundation)</b>, then its four children: deeply held beliefs and assumptions, organisational "+
           "worldviews, shared values and attitudes, drivers of system architecture. Reveal this last and dwell on it."],
    close:"Four parent nodes, thirteen children, revealed in that order. Do not open the other three branches on this step."},
 7:{img:"frameworks", title:"Mind map: the Strategic Change Frameworks branch",
    lead:"Open only the Theory of Change node and the Iceberg Sensemaking Model. Together they are the causal bridge this step builds.",
    order:["<b>Theory of Change (ToC)</b>, then its three children. <i>Inputs, Activities, Outputs, Outcomes, Impact</i> is the chain "+
           "the tables are filling in. <i>Backward mapping from vision</i> is the technique to use when a table is stuck. "+
           "<i>Mapping to AI architectural layers</i> can wait until step 8.",
           "<b>Iceberg Sensemaking Model</b>, then: add (dataset acquisition), check (interpret schemas), refine (formulate findings). "+
           "This is the loop that connects the theory of change to DP05, DP11 and DP17.",
           "<b>Action Scales Model (ASM)</b> is optional. Show it only if a table asks how the four levels turn into coordinated action, "+
           "and keep it to the three children on screen."],
    close:"Two nodes to open, one held in reserve. The Hierarchy of Leverage branch stays open from step 6 if you have it on a second screen."},
 8:{img:"ai", alt:"full", pos:"after", title:"Mind map: the AI Applications branch, as the contrast",
    lead:"Open this only after the room has given its own answer and after the four roles above. This branch is the contrast, "+
         "not the source. The four roles are not on this map.",
    order:["<b>Ask before you show anything.</b> Which parts of what we did in steps 6 and 7 could a model actually do? "+
           "Take the room's answers onto the canvas first. The four roles above land far harder when the room reached for "+
           "them before you showed them.",
           "<b>Then show this branch as the contrast.</b> This is what the research offers when you ask the general question, "+
           "AI for systems thinking: NLP cultural diagnostics mapping text to OCS dimensions with fine-tuned BERTje "+
           "transformers, AI-driven performance evaluation with emotion recognition, modeling and simulation with the Iceberg "+
           "Index and large population models.",
           "<b>Name what it is, and be precise about what it is not.</b> It is a credible branch aimed at organisational "+
           "culture and workforce analytics. It is not U05, which classifies interventions by system depth to support D7 using "+
           "DP05, DP11 and DP17. Do <i>not</i> tell the room that nothing on this map applies, because most of it does: the "+
           "Hierarchy of Leverage is step 6, Theory of Change and the Iceberg Sensemaking Model are step 7, and Systems "+
           "Evaluation under Implementation is Phase C. It is this one branch that does not fit.",
           "<b>The principle to land.</b> Your AI role boundary comes from your decision and your data, not from a catalogue "+
           "of techniques. A capability list tells you what is possible. Only D7 and the products that feed it tell you what "+
           "is warranted."],
    close:"Show the whole map once for the wide view, then close it and return to the four roles, which are what goes onto the canvas."}
};
function MINDMAP_HTML(step){
  if(typeof MINDMAP==="undefined") return "";
  var C=MINDMAP_STEPS[step]; if(!C) return "";
  return '<div class="mapbox" id="mapbox">'+
    '<div class="mh" id="map-toggle"><span class="caret">&#9656;</span>'+
      '<b>'+esc(C.title)+'</b>'+
      '<span class="hint" style="margin:0">NotebookLM &middot; 24 Aug 2026</span>'+
      '<span class="spacer"></span><span class="pill mut">reveal in order</span></div>'+
    '<div class="mb">'+
      '<p class="hint" style="margin:0 0 10px">'+esc(C.lead)+'</p>'+
      '<div class="scroller"><img id="map-img" data-a="'+C.img+'"'+(C.alt?' data-b="'+C.alt+'"':'')+
        ' src="'+MINDMAP[C.img]+'" alt="Mind map branch"></div>'+
      '<div class="notice" style="margin:12px 0 0;font-size:.82rem"><b>Reveal in this order</b><ol style="margin:.5em 0 .3em 1.2em;padding:0">'+
        C.order.map(function(o){return "<li style='margin-bottom:5px'>"+o+"</li>";}).join("")+
      '</ol>'+esc(C.close)+'</div>'+
      '<div class="row" style="margin-top:10px">'+
        '<button class="btn sm" id="map-fit">Fit to width</button>'+
        (C.alt?'<button class="btn sm" id="map-whole">Show the whole map</button>':'')+
        '<span class="hint" style="margin:0">Scroll the panel to pan. Source: The Iceberg Model, Navigating Deeper Systemic Change.</span>'+
      '</div>'+
    '</div></div>';
}

function customHTML(kind){
  if(kind==="evidence"){
    return '<div class="tbl-wrap" style="margin:6px 0 10px"><table><thead><tr><th style="width:70px">Card</th><th>Evidence</th>'+
      '<th style="width:150px">Observation or hypothesis</th><th style="width:40px"></th></tr></thead><tbody>'+
      STATE.evidence.map(function(e,i){
        return '<tr><td class="mono">'+esc(e.id)+'</td>'+
          '<td><textarea data-ev="'+i+'" data-k="text">'+esc(e.text)+'</textarea></td>'+
          '<td><select data-ev="'+i+'" data-k="kind"><option>Observation</option><option>Hypothesis</option></select></td>'+
          '<td><button class="btn sm dz" data-evdel="'+i+'">&times;</button></td></tr>';}).join("")+
      '</tbody></table></div><button class="btn sm" id="ev-add">+ Add card</button>';
  }
  if(kind==="classify"){
    return '<div class="iceberg" style="margin:6px 0 12px">'+
      ICE_LAYERS.map(function(L,i){
        var cards=STATE.evidence.filter(function(e){return e.layer===L.k;});
        return (i===1?'<div class="waterline"><span>waterline</span></div>':'')+
          '<div class="icelayer l'+(i+1)+'"><div class="lev">'+esc(L.lev)+'</div><h4>'+esc(L.name)+'</h4>'+
          '<div class="hint" style="margin:0 0 6px">'+esc(L.hint)+'</div>'+
          (cards.length?cards.map(function(c){return '<span class="pill">'+esc(c.id)+' · '+esc(c.text.slice(0,60))+'</span>';}).join(""):
            '<span class="hint">no cards placed</span>')+'</div>';}).join("")+'</div>'+
      '<div class="tbl-wrap" style="margin-bottom:12px"><table><thead><tr><th style="width:70px">Card</th><th>Evidence</th><th style="width:210px">Place at layer</th></tr></thead><tbody>'+
      STATE.evidence.map(function(e,i){
        return '<tr><td class="mono">'+esc(e.id)+'</td><td>'+esc(e.text)+'</td><td><select data-lay="'+i+'">'+
          '<option value="">(unplaced)</option>'+ICE_LAYERS.map(function(L){
            return '<option value="'+L.k+'"'+(e.layer===L.k?" selected":"")+'>'+esc(L.name)+'</option>';}).join("")+
          '</select></td></tr>';}).join("")+'</tbody></table></div>';
  }
  if(kind==="votes"){
    var n=STATE.session.tables||4;
    while(STATE.votes.length<n) STATE.votes.push({table:"Table "+(STATE.votes.length+1),vote:"",why:""});
    STATE.votes=STATE.votes.slice(0,n);
    var tally={}; ICE_LAYERS.forEach(function(L){tally[L.k]=0;});
    STATE.votes.forEach(function(v){ if(tally[v.vote]!=null) tally[v.vote]++; });
    return '<div class="kpis" style="margin:6px 0 10px">'+ICE_LAYERS.map(function(L){
        return '<div class="kpi"><b>'+tally[L.k]+'</b><span>'+esc(L.name)+'</span></div>';}).join("")+'</div>'+
      '<div class="tbl-wrap" style="margin-bottom:12px"><table><thead><tr><th style="width:140px">Table</th><th style="width:220px">Vote</th><th>Why</th></tr></thead><tbody>'+
      STATE.votes.map(function(v,i){
        return '<tr><td><input type="text" data-vt="'+i+'" data-k="table" value="'+esc(v.table)+'"></td>'+
          '<td><select data-vt="'+i+'" data-k="vote"><option value="">(none)</option>'+ICE_LAYERS.map(function(L){
            return '<option value="'+L.k+'"'+(v.vote===L.k?" selected":"")+'>'+esc(L.name)+'</option>';}).join("")+'</select></td>'+
          '<td><textarea data-vt="'+i+'" data-k="why">'+esc(v.why)+'</textarea></td></tr>';}).join("")+
      '</tbody></table></div>';
  }
  if(kind==="vocab"){
    return '<div class="grid g2" style="margin:6px 0 4px">'+ICE_LAYERS.map(function(L){
      return '<div class="fld-b"><label>'+esc(L.name)+' <i>&middot; '+esc(L.lev)+'</i></label>'+
        '<textarea data-vocab="'+L.k+'" placeholder="'+esc(L.hint)+'">'+esc(STATE.vocab[L.k]||"")+'</textarea></div>';}).join("")+'</div>';
  }
  if(kind==="airoles"){
    return AIROLE_SVG + '<div class="grid g2" style="margin:6px 0 4px">'+AI_ROLES.map(function(r){
      var v=STATE.airoles[r.k]||{on:false,note:""};
      return '<div class="dimcard"><label class="chk" style="font-weight:700"><input type="checkbox" data-air="'+r.k+'"'+
        (v.on?" checked":"")+'> '+esc(r.name)+'</label><div class="q" style="margin:6px 0">'+esc(r.d)+'</div>'+
        '<textarea data-airnote="'+r.k+'" placeholder="How it contributes here, and its limit">'+esc(v.note||"")+'</textarea></div>';}).join("")+'</div>';
  }
  if(kind==="pillars"){
    return '<div class="grid g2" style="margin:6px 0 4px">'+LENSES.map(function(p){
      var v=STATE.pillarOwners[p.id]||{owner:"",review:""};
      return '<div class="dimcard"><span class="pl '+p.cls+'">'+p.name+'</span>'+
        '<div class="q" style="margin:8px 0 4px">'+p.blurb+'</div>'+
        '<div class="hint" style="margin:0 0 8px"><b>Owns:</b> '+p.owns+'</div>'+
        (p.why?'<div class="hint" style="margin:0 0 8px"><b>Why it exists:</b> <i>'+p.why+'</i></div>':'')+
        '<div class="fld-b"><label>Primary owner</label><input type="text" class="fw" data-po="'+p.id+'" data-k="owner" value="'+esc(v.owner)+'"></div>'+
        '<div class="fld-b" style="margin-bottom:0"><label>Cross-reviewer</label><input type="text" class="fw" data-po="'+p.id+'" data-k="review" value="'+esc(v.review)+'"></div></div>';}).join("")+'</div>';
  }
  if(kind==="dimowners"){
    return '<div class="tbl-wrap" style="margin:6px 0 4px"><table><thead><tr><th style="width:250px">Assurance concern</th><th style="width:110px">Lens</th>'+
      '<th>Workshop question</th><th style="width:160px">Lead</th><th style="width:160px">Contributors</th></tr></thead><tbody>'+
      CONCERNS.map(function(d){
        var v=STATE.dimOwners[d.id]||{lead:d.lead,contrib:d.contrib};
        var p=lensObj(d.lens);
        return '<tr><td><b>'+d.n+'. '+d.name+'</b>'+
          '<div class="hint" style="margin:0">'+d.treat+'</div></td>'+
          '<td><span class="pl '+p.cls+'">'+(p.short||p.name)+'</span></td>'+
          '<td>'+d.q+'</td>'+
          '<td><input type="text" data-do="'+d.id+'" data-k="lead" value="'+esc(v.lead)+'"></td>'+
          '<td><input type="text" data-do="'+d.id+'" data-k="contrib" value="'+esc(v.contrib)+'"></td></tr>';}).join("")+
      '</tbody></table></div>'+
      '<div class="notice amb" style="margin-top:12px;font-size:.82rem"><b>Two of the v1 eight did not survive as concerns.</b> '+
      'Monitoring became a cross-cutting attribute: cadence, monitoring window, trigger condition and retest deadline now sit on '+
      'every applicable requirement, because monitoring is a lifecycle activity and not a quality property. Data Quality, '+
      'Governance and Ethics split: the fitness half went to concern 3, and the ethics half went to concern 6, where a '+
      'qualitative rubric is permitted instead of a forced number.</div>';
  }
  return "";
}
function wireSlide(s){
  $$("[data-f]",$("#slide")).forEach(function(i){
    i.addEventListener("change",function(){ setF(i.dataset.f,i.value); });});
  $$("[data-go]",$("#slide")).forEach(function(b){ b.addEventListener("click",function(){ showTab(b.dataset.go); });});
  var rv=$("#reveal-btn"); if(rv) rv.addEventListener("click",function(){ $("#reveal").classList.toggle("open");
    rv.textContent = $("#reveal").classList.contains("open") ? "Hide the model answer" : "👁 Reveal the model answer"; });
  $$("[data-ev]",$("#slide")).forEach(function(i){ i.addEventListener("change",function(){
    STATE.evidence[+i.dataset.ev][i.dataset.k]=i.value; save(); });});
  $$("[data-evdel]",$("#slide")).forEach(function(b){ b.addEventListener("click",function(){
    STATE.evidence.splice(+b.dataset.evdel,1); save(); renderSession(); });});
  var ea=$("#ev-add"); if(ea) ea.addEventListener("click",function(){
    STATE.evidence.push({id:"EC"+(STATE.evidence.length+1),text:"",kind:"Observation",layer:""}); save(); renderSession(); });
  $$("[data-lay]",$("#slide")).forEach(function(sel){ sel.addEventListener("change",function(){
    STATE.evidence[+sel.dataset.lay].layer=sel.value; save(); renderSession(); });});
  $$("[data-vt]",$("#slide")).forEach(function(i){ i.addEventListener("change",function(){
    STATE.votes[+i.dataset.vt][i.dataset.k]=i.value; save(); if(i.dataset.k==="vote") renderSession(); });});
  $$("[data-vocab]",$("#slide")).forEach(function(i){ i.addEventListener("change",function(){
    STATE.vocab[i.dataset.vocab]=i.value; save(); });});
  var mt=$("#map-toggle");
  if(mt) mt.addEventListener("click",function(){ $("#mapbox").classList.toggle("open"); });
  var mw=$("#map-whole");
  if(mw) mw.addEventListener("click",function(){
    var img=$("#map-img"), on=img.dataset.on==="1";
    img.src = MINDMAP[on?img.dataset.a:img.dataset.b];
    img.dataset.on = on?"":"1";
    mw.textContent = on?"Show the whole map":"Back to this branch"; });
  var mf=$("#map-fit");
  if(mf) mf.addEventListener("click",function(){
    var mb=$("#mapbox"); mb.classList.toggle("wide");
    mf.textContent = mb.classList.contains("wide") ? "Actual size" : "Fit to width"; });
  $$("[data-air]",$("#slide")).forEach(function(i){ i.addEventListener("change",function(){
    var k=i.dataset.air; STATE.airoles[k]=STATE.airoles[k]||{}; STATE.airoles[k].on=i.checked; save(); });});
  $$("[data-airnote]",$("#slide")).forEach(function(i){ i.addEventListener("change",function(){
    var k=i.dataset.airnote; STATE.airoles[k]=STATE.airoles[k]||{}; STATE.airoles[k].note=i.value; save(); });});
  $$("[data-po]",$("#slide")).forEach(function(i){ i.addEventListener("change",function(){
    var k=i.dataset.po; STATE.pillarOwners[k]=STATE.pillarOwners[k]||{}; STATE.pillarOwners[k][i.dataset.k]=i.value; save(); });});
  $$("[data-do]",$("#slide")).forEach(function(i){ i.addEventListener("change",function(){
    var k=i.dataset.do; STATE.dimOwners[k]=STATE.dimOwners[k]||{}; STATE.dimOwners[k][i.dataset.k]=i.value;
    if(i.dataset.k==="lead"&&STATE.framework[k]) STATE.framework[k].owner=i.value; save(); });});
  $("#stepdone").addEventListener("change",function(){
    if(this.checked) STATE.stepsDone[s.n]=true; else delete STATE.stepsDone[s.n];
    save(); renderSession(); });
  $("#prev").addEventListener("click",function(){ if(s.n>1){STATE.step=s.n-1;save();renderSession();} });
  $("#next").addEventListener("click",function(){ if(s.n<STEPS.length){STATE.step=s.n+1;save();renderSession();} });
  setupTimer(s);
}
function setupTimer(s){
  var m=String(s.t).split(/[–-]/), mins=(+m[1]||0)-(+m[0]||0);
  TIMER.limit=mins*60;
  var out=$("#timer"), btn=$("#timer-btn");
  function paint(sec){
    var mm=Math.floor(Math.abs(sec)/60), ss=Math.abs(sec)%60;
    out.textContent=(sec<0?"+":"")+String(mm).padStart(2,"0")+":"+String(ss).padStart(2,"0");
    out.className="timer "+(sec<0?"over":"run");}
  if(TIMER.int){clearInterval(TIMER.int);TIMER.int=null;}
  out.textContent=String(mins).padStart(2,"0")+":00"; out.className="timer";
  btn.textContent="Start "+mins+"-min timer";
  btn.onclick=function(){
    if(TIMER.int){ clearInterval(TIMER.int); TIMER.int=null; btn.textContent="Resume"; return; }
    if(TIMER.left==null) TIMER.left=TIMER.limit;
    btn.textContent="Pause";
    TIMER.int=setInterval(function(){ TIMER.left--; paint(TIMER.left); },1000);
    paint(TIMER.left);};
  TIMER.left=null;
}

/* ------------------------------ SPINE ------------------------------ */
function renderSpine(){
  if(!STATE.useCaseId){ $("#spine-guard").style.display=""; $("#spine-body").style.display="none"; return; }
  $("#spine-guard").style.display="none"; $("#spine-body").style.display="";
  var sp=STATE.spine||{}, reach=0;
  var h="";
  SPINE_LAYERS.forEach(function(L){
    var v=sp[L.k]||{ids:[],names:[],note:""}; if(v.ids.length)reach++;
    var ids=v.ids.length?v.ids.join(", "):"none";
    h+='<div class="vert'+(v.ids.length?"":" gap")+'"><div class="lay">'+esc(L.lay)+'</div>'+
       '<div class="idm">'+esc(ids)+'</div><div class="nm">'+
       (v.ids.length? esc(v.names.filter(Boolean).join(" · ")) :
         '<span class="miss">not reachable from the model for this use case, a real gap</span>')+
       (v.note?'<em>'+esc(v.note)+'</em>':'')+
       '<em><input type="text" class="fw" data-spn="'+L.k+'" placeholder="Interpretation / action" value="'+
         esc((STATE.fields["spine_"+L.k]||""))+'"></em></div></div>';
  });
  $("#spine-list").innerHTML=h;
  $("#spine-cov").textContent=reach+" of "+SPINE_LAYERS.length+" layers reachable";
  $$("[data-spn]").forEach(function(i){ i.addEventListener("change",function(){
    setF("spine_"+i.dataset.spn,i.value); });});
  $("#lane-asis").value=STATE.lanes.asis||"";
  $("#lane-prop").value=STATE.lanes.prop||"";
}

/* ------------------------------ REGISTER ------------------------------ */
function renderRegister(){
  if(!STATE.useCaseId){ $("#reg-guard").style.display=""; $("#reg-body").style.display="none"; return; }
  $("#reg-guard").style.display="none"; $("#reg-body").style.display="";
  var rows=STATE.evals, pass=0,fail=0,mis=0,crit=0,man=0;
  var h='<thead><tr><th style="width:155px">Target</th><th>Check</th><th style="width:90px">Result</th>'+
    '<th style="width:110px">Threshold</th><th style="width:105px">Recorded</th><th style="width:95px">Computed</th>'+
    '<th style="width:95px">Flag</th><th style="width:150px">Evidence</th><th style="width:34px"></th></tr></thead><tbody>';
  rows.forEach(function(e,i){
    var c=computeStatus(e.result,e.threshold), f=flagOf(e.recorded,c);
    if(c==="Pass")pass++; else if(c==="Fail")fail++; else man++;
    if(f==="Mismatch")mis++; if(f==="Critical")crit++;
    var cb=c==="Pass"?"ok":(c==="Fail"?"warn":"mut");
    var fb=f==="Critical"?"warn":(f==="Mismatch"?"amb":"mut");
    h+='<tr><td class="mono">'+esc(e.target)+'<div class="hint" style="margin:0">'+esc(e.targetName)+'</div></td>'+
      '<td><b>'+esc(e.evalName||e.category)+'</b><div class="hint" style="margin:0">'+esc(e.metric)+(e.method?" · "+esc(e.method):"")+'</div></td>'+
      '<td><input type="text" data-ev2="'+i+'" data-k="result" value="'+esc(e.result)+'"></td>'+
      '<td><input type="text" data-ev2="'+i+'" data-k="threshold" value="'+esc(e.threshold)+'"></td>'+
      '<td><select data-ev2="'+i+'" data-k="recorded"><option value=""></option>'+
        ["Pass","Warn","Fail"].map(function(o){return '<option'+(e.recorded===o?" selected":"")+'>'+o+'</option>';}).join("")+'</select></td>'+
      '<td><span class="pill '+cb+'">'+(c||"manual")+'</span></td>'+
      '<td>'+(f?'<span class="pill '+fb+'">'+esc(f)+'</span>':'<span class="hint">none</span>')+'</td>'+
      '<td><input type="text" data-ev2="'+i+'" data-k="evidence" value="'+esc(e.evidence)+'"></td>'+
      '<td><button class="btn sm dz" data-evdel2="'+i+'">&times;</button></td></tr>';});
  $("#reg-table").innerHTML=h+"</tbody>";
  var tot=rows.length;
  $("#reg-kpis").innerHTML=
    '<div class="kpi"><b>'+tot+'</b><span>checks</span></div>'+
    '<div class="kpi ok"><b>'+pass+'</b><span>computed pass</span></div>'+
    '<div class="kpi bad"><b>'+fail+'</b><span>computed fail</span></div>'+
    '<div class="kpi amb"><b>'+mis+'</b><span>status mismatches</span></div>'+
    '<div class="kpi bad"><b>'+crit+'</b><span>critical (recorded pass over computed fail)</span></div>'+
    '<div class="kpi"><b>'+(tot?Math.round(100*pass/Math.max(1,pass+fail))+"%":"n/a")+'</b><span>computed pass rate</span>'+
      '<div class="bar"><i style="width:'+(pass+fail?Math.round(100*pass/(pass+fail)):0)+'%"></i></div></div>';
  $$("[data-ev2]").forEach(function(i){ i.addEventListener("change",function(){
    STATE.evals[+i.dataset.ev2][i.dataset.k]=i.value; save(); renderRegister(); ticks(); });});
  $$("[data-evdel2]").forEach(function(b){ b.addEventListener("click",function(){
    STATE.evals.splice(+b.dataset.evdel2,1); save(); renderRegister(); ticks(); });});
}

/* ------------------------------ REMEDIATION ------------------------------ */
function renderRemediation(){
  if(!STATE.useCaseId){ $("#rm-guard").style.display=""; $("#rm-body").style.display="none"; return; }
  $("#rm-guard").style.display="none"; $("#rm-body").style.display="";
  var h='<thead><tr><th style="width:70px">Priority</th><th style="width:230px">Action</th><th>Description</th>'+
    '<th style="width:140px">Pillar</th><th style="width:100px">Status</th><th style="width:150px">Owner</th><th style="width:34px"></th></tr></thead><tbody>';
  STATE.remediation.forEach(function(r,i){
    h+='<tr><td><select data-rm="'+i+'" data-k="priority">'+["P0","P1","P2"].map(function(o){
        return '<option'+(r.priority===o?" selected":"")+'>'+o+'</option>';}).join("")+'</select></td>'+
      '<td><textarea data-rm="'+i+'" data-k="action">'+esc(r.action)+'</textarea></td>'+
      '<td><textarea data-rm="'+i+'" data-k="desc">'+esc(r.desc)+'</textarea></td>'+
      '<td><select data-rm="'+i+'" data-k="pillar"><option value=""></option>'+PILLARS.map(function(p){
        return '<option'+(r.pillar===p.name?" selected":"")+'>'+esc(p.name)+'</option>';}).join("")+'</select></td>'+
      '<td><select data-rm="'+i+'" data-k="status">'+["Open","In progress","Closed","Risk accepted"].map(function(o){
        return '<option'+(r.status===o?" selected":"")+'>'+o+'</option>';}).join("")+'</select></td>'+
      '<td><input type="text" data-rm="'+i+'" data-k="owner" value="'+esc(r.owner)+'"></td>'+
      '<td><button class="btn sm dz" data-rmdel="'+i+'">&times;</button></td></tr>';});
  $("#rm-table").innerHTML=h+"</tbody>";
  $$("[data-rm]").forEach(function(i){ i.addEventListener("change",function(){
    STATE.remediation[+i.dataset.rm][i.dataset.k]=i.value; save(); });});
  $$("[data-rmdel]").forEach(function(b){ b.addEventListener("click",function(){
    STATE.remediation.splice(+b.dataset.rmdel,1); save(); renderRemediation(); });});
}
function suggestRemediation(){
  var add=[], have={}; STATE.remediation.forEach(function(r){have[r.action]=1;});
  function push(p,a,d,pl){ if(!have[a]) add.push({priority:p,action:a,desc:d,pillar:pl,status:"Open",owner:""}); }
  STATE.evals.forEach(function(e){
    var c=computeStatus(e.result,e.threshold), f=flagOf(e.recorded,c);
    if(f==="Critical") push("P0","Correct eval status logic for "+e.target+" · "+e.evalName,
      "Recorded status is "+e.recorded+" but "+e.result+" against threshold "+e.threshold+" computes "+c+
      ". Recompute, correct the register and preserve both observed and computed values.","Records Quality");
    else if(f==="Mismatch") push("P1","Reconcile recorded status for "+e.target+" · "+e.evalName,
      "Recorded "+e.recorded+" vs computed "+c+". Either correct the record or document an approved rationale.","Records Quality");
    if(c==="Fail") push("P1","Meet or risk-accept "+e.evalName+" on "+e.target,
      "Result "+e.result+" fails threshold "+e.threshold+". Improve the metric before the scale decision, or record a formal risk acceptance.","Decision Quality");});
  SPINE_LAYERS.forEach(function(L){
    var v=(STATE.spine||{})[L.k];
    if(!v||!v.ids.length){
      var pri = (L.k==="dataproduct"||L.k==="semantic"||L.k==="cde")?"P0":"P2";
      push(pri,"Bind the use case to "+L.lay,
        "The model cannot reach the "+L.lay+" layer from this use case. Either create the mapping or record why the layer does not apply.",
        (L.k==="dataproduct"||L.k==="cde"||L.k==="semantic")?"Data Quality":"Business Quality");}});
  (STATE.requirements||[]).forEach(function(r){
    var st=reqStatus(r).s;
    var L=lensObj(r.lens).name.replace(/&amp;/g,"&");
    if(st==="Stop") push("P0","Stop condition breached: "+r.id+" "+r.title,
      "The latest run breaches the stop threshold on this requirement. "+(reqStatus(r).why||"")+
      " A stop threshold is not a target that was missed. Suspend or restrict before anything else.",L);
    else if(st==="Fail"||st==="Not satisfied") push(
      r.criticality==="Gate-critical"?"P0":"P1",
      "Close the failing requirement "+r.id+" "+r.title,
      (reqStatus(r).why||"The requirement is not met.")+" Owner: "+(r.ownerRole||"unassigned")+
      ". Required evidence: "+(r.spec.evidenceType||"not specified")+".",L);
    else if(st==="Unspecified"&&r.criticality==="Gate-critical") push("P0",
      "Specify the gate-critical requirement "+r.id,
      "This requirement is gate-critical and still carries a draft specification. A gate cannot be closed on a requirement "+
      "that was never made testable. Set metric, operator, threshold, tolerance, dataset and evaluator.",L);
    else if(st==="Not run"&&r.criticality==="Gate-critical") push("P1",
      "Execute "+r.id+" before the gate",
      "The specification is approved and no run exists. Execute it, or record an explicit not-testable-yet finding "+
      "with the reason and the date it becomes testable.",L);
    else if(st==="Awaiting attestation") push("P1",
      "Obtain the attestation for "+r.id,
      "This is a qualitative requirement. It needs a structured rubric, an independent reviewer, a recorded rationale "+
      "and any dissent. It must not be converted into a number to make it look measured.",L);});
  CONCERNS.forEach(function(c){
    var a=concernRollup(c.id);
    if(a.total===0) push("P1","Specify at least one requirement for concern "+c.n,
      c.name.replace(/&amp;/g,"&")+" carries no requirement at all. An unpopulated concern reads as green and is not. "+
      "Question to answer: "+c.q.replace(/&amp;/g,"&"),lensObj(c.lens).name.replace(/&amp;/g,"&"));});
  if(!getF("rai_owner")) push("P0","Assign Responsible AI accountability",
    "Name the accountable reviewer for model governance, risk acceptance and ethical stewardship.","Records Quality");
  STATE.remediation=STATE.remediation.concat(add);
  save(); renderRemediation();
  alert(add.length? add.length+" item(s) added from the current findings." : "No new items. The backlog already covers every finding.");
}

/* ------------------------------ GATES ------------------------------ */
function renderGates(){
  if(!STATE.useCaseId){ $("#gt-guard").style.display=""; $("#gt-body").style.display="none"; return; }
  $("#gt-guard").style.display="none"; $("#gt-body").style.display="";
  var h='<thead><tr><th style="width:52px">Gate</th><th style="width:180px">Name</th><th>Pass criterion</th>'+
    '<th style="width:180px">Decision rule</th><th style="width:120px">Status</th><th style="width:140px">Owner</th>'+
    '<th style="width:150px">Evidence</th><th style="width:34px"></th></tr></thead><tbody>';
  STATE.gates.forEach(function(g,i){
    h+='<tr><td class="mono">'+esc(g.id)+'</td><td><input type="text" data-gt="'+i+'" data-k="name" value="'+esc(g.name)+'"></td>'+
      '<td><textarea data-gt="'+i+'" data-k="crit">'+esc(g.crit)+'</textarea></td>'+
      '<td><textarea data-gt="'+i+'" data-k="rule">'+esc(g.rule)+'</textarea></td>'+
      '<td><select data-gt="'+i+'" data-k="status">'+["Open","Closed","Risk accepted","Not applicable"].map(function(o){
        return '<option'+(g.status===o?" selected":"")+'>'+o+'</option>';}).join("")+'</select></td>'+
      '<td><input type="text" data-gt="'+i+'" data-k="owner" value="'+esc(g.owner||"")+'"></td>'+
      '<td><input type="text" data-gt="'+i+'" data-k="evidence" value="'+esc(g.evidence||"")+'"></td>'+
      '<td><button class="btn sm dz" data-gtdel="'+i+'">&times;</button></td></tr>';});
  $("#gt-table").innerHTML=h+"</tbody>";
  var open=STATE.gates.filter(function(g){return g.status==="Open";}).length;
  $("#gt-summary").textContent=open? (open+" gate"+(open>1?"s":"")+" open") : "all gates resolved";
  $$("[data-gt]").forEach(function(i){ i.addEventListener("change",function(){
    STATE.gates[+i.dataset.gt][i.dataset.k]=i.value; save(); renderGates(); ticks(); });});
  $$("[data-gtdel]").forEach(function(b){ b.addEventListener("click",function(){
    STATE.gates.splice(+b.dataset.gtdel,1); save(); renderGates(); });});
  var d=STATE.decision;
  $("#dec-choice").value=d.choice; $("#dec-rationale").value=d.rationale;
  $("#dec-conditions").value=d.conditions; $("#dec-approver").value=d.approver; $("#dec-review").value=d.review;
  renderAdvice();
}
function renderAdvice(){
  var open=STATE.gates.filter(function(g){return g.status==="Open";});
  var crit=STATE.evals.filter(function(e){return flagOf(e.recorded,computeStatus(e.result,e.threshold))==="Critical";}).length;
  var red=CONCERNS.filter(function(c){return concernRollup(c.id).rag==="Red";});
  var stops=(STATE.requirements||[]).filter(function(r){return reqStatus(r).s==="Stop";});
  var hardBlocked=LIFECYCLE.filter(function(g){return g.kind==="gate"&&g.hard&&gateBlockers(g.id).length;});
  var h="";
  if(open.length||crit||red.length||stops.length||hardBlocked.length){
    h='<div class="notice warn"><b>The evidence does not currently support scale.</b><ul style="margin:.4em 0 0 1.1em;padding:0">'+
      (open.length?'<li>'+open.length+' gate(s) open: '+esc(open.map(function(g){return g.id;}).join(", "))+'</li>':'')+
      (crit?'<li>'+crit+' critical eval status mismatch(es): a recorded pass stands over a computed fail</li>':'')+
      (red.length?'<li>'+red.length+' assurance concern(s) Red: '+red.map(function(c){return c.n+". "+c.name;}).join("; ")+'</li>':'')+
      (stops.length?'<li><b>'+stops.length+' requirement(s) breach a stop threshold.</b> A stop threshold is a floor, not a target</li>':'')+
      (hardBlocked.length?'<li>'+hardBlocked.length+' hard lifecycle gate(s) blocked by gate-critical requirements: '+
        esc(hardBlocked.map(function(g){return g.id;}).join(", "))+'</li>':'')+
      '</ul><p style="margin:.6em 0 0">The defensible posture is a controlled pilot with the open gates attached as explicit conditions, each with an owner and a date.</p></div>';
  } else if(STATE.gates.length){
    h='<div class="notice ok"><b>Every gate is resolved and no critical mismatch remains.</b> Scale is defensible provided the signed evidence pack exists and the approver is named.</div>';
  }
  var d=STATE.decision;
  if(d.choice==="Scale to production"&&(open.length||crit))
    h+='<div class="notice warn"><b>Warning:</b> scale has been selected while gates remain open. Record the risk acceptance and the accountable approver explicitly, or revert to a controlled pilot.</div>';
  if(d.choice!=="Not decided"&&!d.rationale)
    h+='<div class="notice amb">A decision without a written rationale is not auditable. Record why.</div>';
  $("#dec-advice").innerHTML=h;
}
</script>
