<script>
/* =====================================================================
   DATA PRODUCT CANVAS
   ===================================================================== */
function newCanvasFromProduct(dpid){
  var dp = dpid? findRow("DataProduct","DataProductID",dpid) : null;
  var c={id:uid("CV"), productId:dpid||"", proposed:!dp, f:{}, cdes:[], usability:{}};
  var sp=STATE.spine||{};
  if(dp){
    var dom=resolveDomainId(dp.Domain), domRow=findRow("DataDomain","DataDomainID",dom);
    c.f.dp_name=String(dp.Name||dpid);
    c.f.dp_domain=(dom||"")+(domRow?" "+String(domRow.Name||""):"");
    c.f.dp_owner=String(dp.Owner||(domRow?domRow.Owner:"")||"");
    c.f.dp_steward=String(domRow?domRow.Steward||"":"");
    c.f.dp_class=String(dp.Classification||"Internal");
    c.f.dp_status="Assessed"; c.f.dp_version="v1.0.0";
    c.f.purpose=String(dp.Description||"");
    /* schema -> CDE rows */
    splitList(String(dp["Schema (field:type[:pii])"]||"").replace(/[,;]/g,",")).forEach(function(fdef){
      var parts=fdef.split(":");
      if(parts[0]) c.cdes.push({field:parts[0].trim(), type:(parts[1]||"string").trim(),
        nullable:"No", pii:/pii|true|y/i.test(parts[2]||"")?"Yes":"No", term:"", ref:""});});
    var ct=findRow("DataContract","DataProductID",dpid);
    if(ct){ c.f.dq_rules=String(ct.QualityRules||""); c.f.slo_fresh=String(ct.SLA||""); }
    var tl=String(dp.TimelinessSLA||""); if(tl&&!c.f.slo_fresh) c.f.slo_fresh=tl;
    var pm=String(dp.PipelineMode||""), rr=String(dp.DataRefreshRate||"");
    if(pm||rr) c.f.input_ports=(String(dp.Producers||"")+" · "+pm+" · "+rr).replace(/^ · | · $/g,"");
  }else{
    c.f.dp_status="Idea"; c.f.dp_version="v0.1.0";
    c.f.purpose="PROPOSED PRODUCT. Not present in the FutureState model. Define the purpose this product must serve for "+
      (STATE.useCaseId||"the use case")+".";
  }
  /* golden thread + CDEs from the evaluation */
  c.f.gt_stakeholder=((sp.stakeholder||{}).ids||[]).join(", ")+" "+((sp.stakeholder||{}).names||[]).join(" · ");
  c.f.gt_vp=((sp.vp||{}).ids||[]).join(", ")+" "+((sp.vp||{}).names||[]).join(" · ");
  c.f.gt_outcome=((sp.outcome||{}).names||[]).join(" · ");
  c.f.gt_threshold=getF("target");
  c.f.no_ai_alt=getF("no_ai");
  c.f.sem_model=((sp.semantic||{}).ids||[]).join(", ")+" "+((sp.semantic||{}).names||[]).join(" · ");
  c.f.consumers=(STATE.useCaseId||"")+" "+(STATE.useCaseName||"")+
    (((sp.agent||{}).ids||[]).length?" via agents "+sp.agent.ids.join(", "):"");
  ((sp.cde||{}).ids||[]).forEach(function(cid){
    var r=findRow("CriticalDataElement","CDEID",cid); if(!r) return;
    if(dp && String(r.GoldenSource||"").indexOf(dpid)<0 && String(r.GoldenSource||"")!=="") { /* keep anyway */ }
    c.cdes.push({field:String(r.Name||cid), type:String(r.DataType||""), nullable:"No",
      pii:/restricted|confidential|pii/i.test(String(r.Classification||""))?"Yes":"No",
      term:String(r.BusinessTerm||""), ref:cid});});
  /* dedupe by field name */
  var seen={}; c.cdes=c.cdes.filter(function(x){ var k=x.field.toLowerCase(); if(seen[k])return false; seen[k]=1; return !!x.field;});
  return c;
}
function activeCanvas(){
  if(!STATE.canvases.length) return null;
  var c=STATE.canvases.filter(function(x){return x.id===STATE.activeCanvas;})[0];
  return c||STATE.canvases[0];
}
function renderCanvas(){
  if(!STATE.useCaseId){ $("#cv-guard").style.display=""; $("#cv-guard").textContent="Select an AI Use Case first."; $("#cv-body").style.display="none"; return; }
  $("#cv-guard").style.display="none"; $("#cv-body").style.display="";
  var sel=$("#cv-select"), c=activeCanvas();
  sel.innerHTML=STATE.canvases.map(function(x){
    return '<option value="'+x.id+'"'+(c&&x.id===c.id?" selected":"")+'>'+
      esc((x.productId||"NEW")+" · "+(x.f.dp_name||"untitled")+(x.proposed?"  (proposed)":""))+'</option>';}).join("");
  if(!c){ $("#cv-sections").innerHTML='<div class="panel empty">No canvas yet. Add one for each data product this use case requires.</div>';
    $("#cv-seedrow").innerHTML=""; return; }
  var need=((STATE.spine||{}).dataproduct||{}).ids||[];
  var covered=STATE.canvases.map(function(x){return x.productId;}).filter(Boolean);
  var missing=need.filter(function(d){return covered.indexOf(d)<0;});
  $("#cv-seedrow").innerHTML= (missing.length?
    '<div class="notice amb"><b>'+missing.length+'</b> mapped data product(s) have no canvas yet: <span class="mono">'+esc(missing.join(", "))+
    '</span> <button class="btn sm" id="cv-seedall">Create them</button></div>':'')+
    (c.proposed?'<div class="notice warn"><b>Proposed product.</b> This product does not exist in the FutureState model. '+
      'Until it is created, certified and contracted, gate G1 cannot close.</div>':'');
  var se=$("#cv-seedall"); if(se) se.addEventListener("click",function(){
    missing.forEach(function(d){STATE.canvases.push(newCanvasFromProduct(d));}); save(); renderCanvas(); ticks();});
  $("#cv-sections").innerHTML=CANVAS_SECTIONS.map(function(S_,i){
    var open=i<2?" open":"";
    var body="";
    if(S_.fields) body+='<div class="grid '+(S_.fields.length>3?"g2":"")+'">'+S_.fields.map(function(f){
      var v=c.f[f.k]||"";
      var inp = f.type==="textarea" ? '<textarea data-cf="'+f.k+'">'+esc(v)+'</textarea>'
        : f.type==="select" ? '<select class="fw" data-cf="'+f.k+'">'+f.opts.map(function(o){
            return '<option'+(o===v?" selected":"")+'>'+esc(o)+'</option>';}).join("")+'</select>'
        : '<input type="text" class="fw" data-cf="'+f.k+'" value="'+esc(v)+'">';
      return '<div class="fld-b"><label>'+esc(f.l)+(f.hint?' <i>&middot; '+esc(f.hint)+'</i>':'')+'</label>'+inp+'</div>';}).join("")+'</div>';
    if(S_.table==="cde"){
      body+='<h4 style="margin-top:6px">Critical data elements &amp; schema</h4>'+
        '<div class="tbl-wrap"><table><thead><tr><th>Field</th><th style="width:110px">Datatype</th><th style="width:90px">Nullable</th>'+
        '<th style="width:90px">PII</th><th>Semantic glossary binding</th><th style="width:110px">CDE ref</th><th style="width:34px"></th></tr></thead><tbody>'+
        c.cdes.map(function(r,j){
          return '<tr><td><input type="text" data-cde="'+j+'" data-k="field" value="'+esc(r.field)+'"></td>'+
          '<td><input type="text" data-cde="'+j+'" data-k="type" value="'+esc(r.type)+'"></td>'+
          '<td><select data-cde="'+j+'" data-k="nullable"><option'+(r.nullable==="No"?" selected":"")+'>No</option><option'+(r.nullable==="Yes"?" selected":"")+'>Yes</option></select></td>'+
          '<td><select data-cde="'+j+'" data-k="pii"><option'+(r.pii==="No"?" selected":"")+'>No</option><option'+(r.pii==="Yes"?" selected":"")+'>Yes</option></select></td>'+
          '<td><input type="text" data-cde="'+j+'" data-k="term" value="'+esc(r.term)+'"></td>'+
          '<td><input type="text" data-cde="'+j+'" data-k="ref" value="'+esc(r.ref)+'"></td>'+
          '<td><button class="btn sm dz" data-cdedel="'+j+'">&times;</button></td></tr>';}).join("")+
        '</tbody></table></div><button class="btn sm" id="cde-add" style="margin-top:8px">+ Add field</button>';
    }
    if(S_.table==="usability"){
      body+='<div class="tbl-wrap"><table><thead><tr><th style="width:190px">Characteristic</th><th style="width:90px">Score 1–5</th>'+
        '<th>Required evidence</th><th>Action to close the gap</th></tr></thead><tbody>'+
        USABILITY.map(function(u,j){
          var v=c.usability[j]||{score:"",action:""};
          return '<tr><td><b>'+(j+1)+'. '+esc(u[0])+'</b></td>'+
            '<td><select data-us="'+j+'" data-k="score"><option value=""></option>'+[1,2,3,4,5].map(function(n){
              return '<option'+(String(v.score)===String(n)?" selected":"")+'>'+n+'</option>';}).join("")+'</select></td>'+
            '<td class="hint">'+esc(u[1])+'</td>'+
            '<td><textarea data-us="'+j+'" data-k="action">'+esc(v.action)+'</textarea></td></tr>';}).join("")+
        '</tbody></table></div>';
    }
    return '<div class="sect'+open+'" data-sect="'+S_.id+'"><div class="sh"><span class="caret">&#9656;</span><h3>'+esc(S_.name)+'</h3>'+
      '<span class="spacer"></span><span class="hint" style="margin:0">'+esc(S_.blurb)+'</span></div>'+
      '<div class="sb">'+body+'</div></div>';}).join("");
  $$("[data-sect] .sh").forEach(function(sh){ sh.addEventListener("click",function(){ sh.parentNode.classList.toggle("open"); });});
  $$("[data-cf]").forEach(function(i){ i.addEventListener("change",function(){ c.f[i.dataset.cf]=i.value; save();
    if(i.dataset.cf==="dp_name") renderCanvas(); });});
  $$("[data-cde]").forEach(function(i){ i.addEventListener("change",function(){ c.cdes[+i.dataset.cde][i.dataset.k]=i.value; save(); });});
  $$("[data-cdedel]").forEach(function(b){ b.addEventListener("click",function(){ c.cdes.splice(+b.dataset.cdedel,1); save(); renderCanvas(); });});
  var ca=$("#cde-add"); if(ca) ca.addEventListener("click",function(){
    c.cdes.push({field:"",type:"string",nullable:"No",pii:"No",term:"",ref:""}); save(); renderCanvas();});
  $$("[data-us]").forEach(function(i){ i.addEventListener("change",function(){
    var j=+i.dataset.us; c.usability[j]=c.usability[j]||{}; c.usability[j][i.dataset.k]=i.value; save(); });});
  ticks();
}

/* ------------------------------ PACK ------------------------------ */
function packChecks(){
  var open=STATE.gates.filter(function(g){return g.status==="Open";}).length;
  var crit=STATE.evals.filter(function(e){return flagOf(e.recorded,computeStatus(e.result,e.threshold))==="Critical";}).length;
  var assessed=CONCERNS.filter(function(c){var r=concernRollup(c.id).rag;
    return r!=="Not assessed"&&r!=="Unevidenced";}).length;
  var specified=CONCERNS.filter(function(c){return concernRollup(c.id).total>0;}).length;
  var reqs=STATE.requirements||[];
  var gateCrit=reqs.filter(function(r){return r.criticality==="Gate-critical";});
  var gcOpen=gateCrit.filter(function(r){var x=reqStatus(r).s;
    return x!=="Pass"&&x!=="Satisfied"&&x!=="Warn"&&x!=="Satisfied with reservation";}).length;
  var unspec=reqs.filter(function(r){return reqStatus(r).s==="Unspecified";}).length;
  var stops=reqs.filter(function(r){return reqStatus(r).s==="Stop";}).length;
  var hardGates=LIFECYCLE.filter(function(g){return g.kind==="gate"&&g.hard;});
  var decided=hardGates.filter(function(g){return ((STATE.lifecycle||{})[g.id]||{}).outcome;}).length;
  return [
    {ok:!!STATE.useCaseId, t:"AI use case selected from the Future State Model"},
    {ok:Object.keys(STATE.stepsDone).length>=STEPS.length-2, t:"Session flow worked through ("+Object.keys(STATE.stepsDone).length+"/"+STEPS.length+" steps)"},
    {ok:!!getF("benefit_hypothesis"), t:"Benefit hypothesis stated"},
    {ok:!!getF("no_ai"), t:"No-AI alternative considered"},
    {ok:!!getF("dec_threshold")&&!!getF("dec_escalation"), t:"Decision specification and HITL protocol defined"},
    {ok:STATE.evals.length>0, t:"Eval register populated ("+STATE.evals.length+" checks)"},
    {ok:crit===0, t:"No critical status mismatch (recorded pass over computed fail)"},
    {ok:reqs.length>0, t:"Eval Requirements generated ("+reqs.length+")"},
    {ok:unspec===0, t:"Every requirement carries a typed specification ("+unspec+" still draft)"},
    {ok:stops===0, t:"No stop threshold breached"},
    {ok:gcOpen===0, t:"Every gate-critical requirement is evidenced ("+gcOpen+" of "+gateCrit.length+" outstanding)"},
    {ok:specified===8, t:"All eight assurance concerns have at least one requirement ("+specified+"/8)"},
    {ok:assessed===8, t:"All eight assurance concerns carry evidence ("+assessed+"/8)"},
    {ok:decided===hardGates.length, t:"Every hard lifecycle gate has a recorded decision ("+decided+"/"+hardGates.length+")"},
    {ok:!!getF("rai_owner"), t:"Responsible AI accountability assigned"},
    {ok:!!getF("monitoring_plan"), t:"Monitoring plan and rollback stated"},
    {ok:STATE.canvases.length>0, t:"Data Product Canvas prepared ("+STATE.canvases.length+")"},
    {ok:open===0, t:"All gates resolved ("+open+" open)"},
    {ok:STATE.decision.choice!=="Not decided"&&!!STATE.decision.rationale, t:"Decision recorded with a written rationale"},
    {ok:!!STATE.decision.approver, t:"Accountable approver named"}
  ];
}
function renderPack(){
  var s=STATE;
  var hn=$("#hosted-note");
  if(hn && HOSTED){ hn.style.display="";
    hn.innerHTML='<b>Hosted copy.</b> Markdown and JSON exports save straight to your device. '+
      'The Excel evaluation workbook can only be written by the downloadable HTML file. The hosted viewer will not accept an .xlsx file.'; }
  $("#pack-status").innerHTML = s.useCaseId ?
    '<div class="notice"><b>'+esc(s.company||MODEL.company)+'</b> &middot; <span class="mono">'+esc(s.useCaseId)+'</span> '+esc(s.useCaseName)+
    '<br><span class="hint">Session '+esc(s.session.date)+' · facilitated by '+esc(s.session.facilitator||"not set")+
    ' · intensity '+esc(s.session.intensity)+' · decision: <b>'+esc(s.decision.choice)+'</b></span></div>'
    : '<div class="notice warn">No use case selected. The pack will be empty.</div>';
  var ch=packChecks(), done=ch.filter(function(c){return c.ok;}).length;
  $("#pack-check").innerHTML='<div class="kpi" style="margin-bottom:10px"><b>'+done+' / '+ch.length+'</b><span>evidence items complete</span>'+
    '<div class="bar"><i style="width:'+Math.round(100*done/ch.length)+'%"></i></div></div>'+
    ch.map(function(c){ return '<div style="padding:3px 0;font-size:.83rem">'+
      (c.ok?'<span style="color:var(--ok);font-weight:800">&#10003;</span> ':'<span style="color:var(--warn);font-weight:800">&#10007;</span> ')+
      esc(c.t)+'</div>';}).join("");
  var h='<thead><tr><th style="width:60px">Ref</th><th style="width:280px">Source</th><th>How used</th><th style="width:34px"></th></tr></thead><tbody>';
  STATE.sources.forEach(function(r,i){
    h+='<tr><td><input type="text" data-src="'+i+'" data-k="ref" value="'+esc(r.ref)+'"></td>'+
      '<td><input type="text" data-src="'+i+'" data-k="src" value="'+esc(r.src)+'"></td>'+
      '<td><textarea data-src="'+i+'" data-k="use">'+esc(r.use)+'</textarea></td>'+
      '<td><button class="btn sm dz" data-srcdel="'+i+'">&times;</button></td></tr>';});
  $("#src-table").innerHTML=h+"</tbody>";
  $$("[data-src]").forEach(function(i){ i.addEventListener("change",function(){
    STATE.sources[+i.dataset.src][i.dataset.k]=i.value; save(); });});
  $$("[data-srcdel]").forEach(function(b){ b.addEventListener("click",function(){
    STATE.sources.splice(+b.dataset.srcdel,1); save(); renderPack(); });});
}
</script>
