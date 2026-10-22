<script>
/* =====================================================================
   v2 VIEWS: Requirements, Assurance (lenses and concerns), Lifecycle.
   ===================================================================== */

var REQ_FILTER = {concern:"", phase:"", crit:"", status:"", q:""};
var REQ_OPEN = {};

function optList(list, cur, blank){
  var h = blank ? '<option value="">'+esc(blank)+'</option>' : '';
  return h + list.map(function(v){
    var val = (typeof v==="object")?v.id:v, lab=(typeof v==="object")?v.name:v;
    return '<option value="'+esc(val)+'"'+(String(cur)===String(val)?" selected":"")+'>'+lab+'</option>';
  }).join("");
}
function concernName(id){ var c=CONCERNS.filter(function(x){return x.id===id;})[0]; return c?c.name:id; }
function lensOf(id){ var c=CONCERNS.filter(function(x){return x.id===id;})[0]; return c?c.lens:"business"; }
function lensObj(id){ return LENSES.filter(function(l){return l.id===id;})[0]||LENSES[0]; }
function phaseName(id){ var p=LIFECYCLE_PHASES.filter(function(x){return x.id===id;})[0]; return p?p.name:id; }

/* ------------------------------ REQUIREMENTS ------------------------------ */
function renderRequirements(){
  if(!STATE.useCaseId){ $("#rq-guard").style.display=""; $("#rq-body").style.display="none"; return; }
  $("#rq-guard").style.display="none"; $("#rq-body").style.display="";
  STATE.requirements = STATE.requirements||[];

  var all = STATE.requirements;
  var rows = all.filter(function(r){
    if(REQ_FILTER.concern && r.concern!==REQ_FILTER.concern) return false;
    if(REQ_FILTER.phase && r.phase!==REQ_FILTER.phase) return false;
    if(REQ_FILTER.crit && r.criticality!==REQ_FILTER.crit) return false;
    if(REQ_FILTER.status){
      var s=reqStatus(r).s;
      if(REQ_FILTER.status==="open" && (s==="Pass"||s==="Satisfied")) return false;
      if(REQ_FILTER.status==="failing" && !(s==="Fail"||s==="Stop"||s==="Not satisfied")) return false;
      if(REQ_FILTER.status==="unspecified" && !(s==="Unspecified"||s==="Not run"||s==="Not computable")) return false;
    }
    if(REQ_FILTER.q){
      var hay=(r.id+" "+r.title+" "+r.businessClaim+" "+r.riskClaim+" "+r.obligationClaim+" "+
               r.sourceRecordId+" "+r.anchorId+" "+r.controlId).toLowerCase();
      if(hay.indexOf(REQ_FILTER.q.toLowerCase())<0) return false;
    }
    return true;
  });

  /* KPI strip */
  var k={total:all.length,pass:0,warn:0,fail:0,stop:0,open:0,crit:0,seeded:0,attest:0};
  all.forEach(function(r){
    var s=reqStatus(r).s;
    if(s==="Pass"||s==="Satisfied")k.pass++;
    else if(s==="Warn"||s==="Satisfied with reservation")k.warn++;
    else if(s==="Fail"||s==="Not satisfied")k.fail++;
    else if(s==="Stop")k.stop++;
    else k.open++;
    if(r.criticality==="Gate-critical")k.crit++;
    if(r.seeded)k.seeded++;
    if(r.type==="Attestation")k.attest++;
  });
  $("#rq-kpis").innerHTML=
    '<div class="kpi"><b>'+k.total+'</b><span>requirements</span></div>'+
    '<div class="kpi ok"><b>'+k.pass+'</b><span>computed pass</span></div>'+
    '<div class="kpi amb"><b>'+k.warn+'</b><span>warning band</span></div>'+
    '<div class="kpi bad"><b>'+(k.fail+k.stop)+'</b><span>fail or stop</span></div>'+
    '<div class="kpi"><b>'+k.open+'</b><span>not yet measurable</span></div>'+
    '<div class="kpi"><b>'+k.crit+'</b><span>gate-critical</span></div>'+
    '<div class="kpi"><b>'+k.seeded+'</b><span>seeded from the model</span></div>';

  /* rows */
  var h="";
  if(!rows.length){
    h='<div class="empty">No requirement matches this filter. Seed from the model, or add one.</div>';
  } else {
    rows.forEach(function(r){
      var idx = all.indexOf(r);
      var st = reqStatus(r), open = !!REQ_OPEN[r.id];
      var L = lensObj(r.lens);
      var runs = r.runs||[], last = latestRun(r);
      h += '<div class="reqcard '+(st.cls==="ok"?"g":(st.cls==="amb"?"a":(st.cls==="warn"?"r":"")))+'">'+
        '<div class="reqhead" data-toggle="'+esc(r.id)+'">'+
          '<span class="pl '+L.cls+'">'+(L.short||L.name)+'</span>'+
          '<span class="mono rq-id">'+esc(r.id)+'</span>'+
          '<b class="rq-title">'+esc(r.title||"Untitled requirement")+'</b>'+
          '<span class="spacer"></span>'+
          (r.criticality==="Gate-critical"?'<span class="pill warn">gate-critical</span>':'')+
          '<span class="pill '+st.cls+'">'+esc(st.s)+'</span>'+
          '<span class="chev">'+(open?"&#9660;":"&#9654;")+'</span>'+
        '</div>'+
        '<div class="reqsub">'+esc(concernName(r.concern).replace(/&amp;/g,"&"))+' &middot; '+esc(r.evalType)+
          ' &middot; '+esc(phaseName(r.phase))+
          (r.sourceArtefact?' &middot; from <span class="mono">'+esc(r.sourceArtefact)+
            (r.sourceRecordId?" / "+esc(r.sourceRecordId):"")+'</span>':'')+
          (st.why?' &middot; <i>'+esc(st.why)+'</i>':'')+'</div>';

      if(open){
        h += '<div class="reqbody">'+
          reqGroup("Identity and classification",[
            fld(idx,"title","Requirement title","textarea"),
            sel(idx,"type","Requirement type",REQ_TYPES),
            sel(idx,"concern","Assurance concern",CONCERNS.map(function(c){return {id:c.id,name:c.n+". "+c.name};})),
            sel(idx,"evalType","Eval type",EVAL_TYPES),
            sel(idx,"phase","Lifecycle phase",LIFECYCLE_PHASES.map(function(p){return {id:p.id,name:p.name};})),
            sel(idx,"criticality","Gate criticality",GATE_CRITICALITY),
            fld(idx,"version","Version"),
            sel(idx,"approval","Approval status",APPROVAL_STATES)
          ])+
          reqGroup("Source and traceability",[
            fld(idx,"sourceArtefact","Source artefact"),
            fld(idx,"sourceRecordId","Source record ID"),
            fld(idx,"sourceConditionId","Source condition ID"),
            fld(idx,"sourceUri","Source URI"),
            fld(idx,"anchorType","Golden thread anchor type"),
            fld(idx,"anchorId","Golden thread anchor ID"),
            fld(idx,"related","Related requirement IDs")
          ])+
          reqGroup("Claim",[
            fld(idx,"businessClaim","Business claim","textarea"),
            fld(idx,"riskClaim","Risk claim","textarea"),
            fld(idx,"obligationClaim","Obligation claim","textarea")
          ])+
          reqGroup("Scope and behaviour",[
            sel(idx,"componentType","Component type",COMPONENT_TYPES),
            fld(idx,"componentId","Component ID"),
            fld(idx,"componentVersion","Component version"),
            fld(idx,"contextOfUse","Context of use"),
            fld(idx,"behaviour","Behaviour or outcome under test","textarea"),
            fld(idx,"failureConsequence","Failure consequence","textarea"),
            fld(idx,"stakeholderId","Affected stakeholder"),
            fld(idx,"segmentId","Affected segment")
          ])+
          reqGroup("Control and accountability",[
            fld(idx,"controlId","Control ID"),
            fld(idx,"humanControlId","Human-control requirement"),
            fld(idx,"prohibited","Prohibited behaviour","textarea"),
            fld(idx,"fallback","Fallback requirement","textarea"),
            fld(idx,"ownerRole","Requirement owner role"),
            fld(idx,"reviewerRole","Reviewer role"),
            sel(idx,"independence","Independence required",["No","Yes"])
          ])+
          '<div class="reqgrp"><h4>Change</h4><p class="hint" style="margin:-3px 0 7px">'+
            'Retest trigger vocabulary: '+RETEST_TRIGGERS.join("; ")+'. Several may apply.</p></div>'+
          reqGroup("",[
            fld(idx,"effectiveFrom","Effective from"),
            fld(idx,"effectiveTo","Effective to"),
            fld(idx,"supersedes","Supersedes"),
            fld(idx,"retestTrigger","Retest trigger","textarea"),
            fld(idx,"retirement","Retirement condition","textarea")
          ])+
          specHTML(idx,r)+
          runsHTML(idx,r,runs,last)+
        '</div>';
      }
      h += '</div>';
    });
  }
  $("#rq-list").innerHTML=h;
  wireRequirements();
}

function fld(i,k,label,type){
  return {k:k,label:label,type:type||"text",i:i};
}
function sel(i,k,label,opts,blank){
  return {k:k,label:label,type:"select",opts:opts,blank:blank,i:i};
}
function reqGroup(title, fields){
  var r=STATE.requirements;
  return '<div class="reqgrp"'+(title?'':' style="margin-top:0"')+'>'+
    (title?'<h4>'+esc(title)+'</h4>':'')+'<div class="reqgrid">'+
    fields.map(function(f){
      var v=r[f.i][f.k]==null?"":r[f.i][f.k];
      var ctl;
      if(f.type==="textarea") ctl='<textarea data-rq="'+f.i+'" data-k="'+f.k+'">'+esc(v)+'</textarea>';
      else if(f.type==="select") ctl='<select data-rq="'+f.i+'" data-k="'+f.k+'">'+
        optList(f.opts,v,f.blank?"not set":null)+'</select>';
      else ctl='<input type="text" class="fw" data-rq="'+f.i+'" data-k="'+f.k+'" value="'+esc(v)+'">';
      return '<div class="fld-b"><label>'+esc(f.label)+'</label>'+ctl+'</div>';
    }).join("")+'</div></div>';
}

function specHTML(i,r){
  function s(k,label,type,opts){
    var v=r.spec[k]==null?"":r.spec[k];
    var ctl;
    if(type==="textarea") ctl='<textarea data-sp="'+i+'" data-k="'+k+'">'+esc(v)+'</textarea>';
    else if(type==="select") ctl='<select data-sp="'+i+'" data-k="'+k+'">'+optList(opts,v)+'</select>';
    else ctl='<input type="text" class="fw" data-sp="'+i+'" data-k="'+k+'" value="'+esc(v)+'">';
    return '<div class="fld-b"><label>'+esc(label)+'</label>'+ctl+'</div>';
  }
  function grp(t,inner){ return '<div class="reqgrp"><h4>'+t+'</h4><div class="reqgrid">'+inner+'</div></div>'; }
  return '<div class="specwrap"><div class="specbar">Eval Specification <span class="hint">'+
    'Typed. Operator, threshold and tolerance are values, not prose.</span></div>'+
    grp("Measure", s("metricId","Metric ID")+s("construct","Construct name")+
        s("opDef","Operational definition","textarea")+s("formula","Formula")+
        s("unit","Unit")+s("aggregation","Aggregation")+s("slices","Slice dimensions"))+
    grp("Acceptance criterion", s("baseline","Baseline")+s("target","Target")+
        s("operator","Operator","select",[">=","<=",">","<","=","!=","range"])+
        s("threshold","Threshold (lo-hi for range)")+s("warn","Warning threshold")+
        s("stop","Stop threshold")+s("tolerance","Tolerance"))+
    grp("Uncertainty", s("confidence","Confidence level")+s("ciMethod","CI method")+
        s("minSample","Minimum sample size")+s("power","Power or precision requirement"))+
    grp("Test material", s("datasetId","Dataset ID")+s("datasetVersion","Dataset version")+
        s("scenarioSet","Scenario set")+s("testCase","Test case")+
        s("groundTruth","Ground-truth source")+s("coverage","Coverage requirement"))+
    grp("Method", s("method","Measurement method")+
        s("evaluatorType","Evaluator type","select",EVALUATOR_TYPES)+
        s("evaluatorId","Evaluator ID")+s("rubricVersion","Rubric version")+
        s("judgeModel","Judge model version")+s("judgePrompt","Judge prompt version"))+
    grp("Environment", s("environment","Environment ID")+s("configVersion","Configuration version")+
        s("toolVersion","Tool version")+s("seed","Random seed")+s("repetitions","Repetition count"))+
    grp("Evidence", s("evidenceType","Evidence type required")+
        s("evidenceAcceptance","Evidence acceptance criteria","textarea")+
        s("retentionClass","Retention class")+s("evidenceUri","Evidence repository URI"))+
    grp("Operations", s("cadence","Execution cadence")+s("monitoringWindow","Monitoring window")+
        s("trigger","Trigger condition")+s("retestDeadline","Retest deadline")+
        s("status","Specification status","select",SPEC_STATES))+
    '</div>';
}

function runsHTML(i,r,runs,last){
  var isAttest = r.type==="Attestation" || r.spec.evaluatorType==="Attestation" ||
                 r.spec.evaluatorType==="Independent review";
  var h='<div class="specwrap"><div class="specbar">Eval Runs and Results <span class="hint">'+
    'Observations are immutable. Status is computed at read time and never stored.</span>'+
    '<span class="spacer"></span><button class="btn sm" data-runadd="'+i+'">+ Record a run</button></div>';
  if(!runs.length){ h+='<div class="empty sm">No run recorded. '+
    (r.spec.status==="Draft"?"The specification is still a draft.":"The specification is approved and awaiting execution.")+
    '</div></div>'; return h; }
  h+='<div class="tbl-wrap"><table class="runs"><thead><tr><th style="width:96px">Run</th><th style="width:96px">Executed</th>'+
     (isAttest?'<th>Attestation and rationale</th>':'<th style="width:90px">Observed</th><th style="width:130px">n / coverage</th><th style="width:130px">Confidence interval</th>')+
     '<th style="width:110px">Computed</th><th style="width:140px">Evidence</th><th style="width:34px"></th></tr></thead><tbody>';
  runs.forEach(function(run,j){
    var st = (run===last) ? reqStatus(r) : null;
    var ev = isAttest ? null : evalAcceptance(r.spec, run.actual);
    var cls = st? st.cls : (ev && ev.status? (ev.status==="Pass"?"ok":(ev.status==="Warn"?"amb":"warn")) : "mut");
    var lab = isAttest ? (run.attestation||"not recorded")
                       : (ev && ev.status ? ev.status : "not computable");
    h+='<tr'+(run===last?' class="last"':'')+'><td class="mono">'+esc(run.id)+
      (run===last?'<div class="hint" style="margin:0">latest</div>':'')+'</td>'+
      '<td><input type="text" data-run="'+i+'.'+j+'" data-k="executedAt" value="'+esc(run.executedAt)+'"></td>';
    if(isAttest){
      h+='<td><select data-run="'+i+'.'+j+'" data-k="attestation">'+
        optList(["Satisfied","Satisfied with reservation","Not satisfied"],run.attestation,"not recorded")+'</select>'+
        '<textarea data-run="'+i+'.'+j+'" data-k="note" placeholder="Rationale, dissent recorded, reviewer">'+esc(run.note||"")+'</textarea></td>';
    } else {
      h+='<td><input type="text" data-run="'+i+'.'+j+'" data-k="actual" value="'+esc(run.actual)+'"></td>'+
        '<td><input type="text" data-run="'+i+'.'+j+'" data-k="sample" placeholder="n" value="'+esc(run.sample||"")+'">'+
          '<input type="text" data-run="'+i+'.'+j+'" data-k="coverage" placeholder="coverage" value="'+esc(run.coverage||"")+'"></td>'+
        '<td><input type="text" data-run="'+i+'.'+j+'" data-k="ciLow" placeholder="low" value="'+esc(run.ciLow||"")+'">'+
          '<input type="text" data-run="'+i+'.'+j+'" data-k="ciHigh" placeholder="high" value="'+esc(run.ciHigh||"")+'"></td>';
    }
    h+='<td><span class="pill '+cls+'">'+esc(lab)+'</span>'+
       (run.override&&run.override.approved?'<div class="hint" style="margin:0">override on file</div>':'')+'</td>'+
      '<td><input type="text" data-run="'+i+'.'+j+'" data-k="evidenceId" placeholder="EvidenceID" value="'+esc(run.evidenceId||"")+'">'+
        '<input type="text" data-run="'+i+'.'+j+'" data-k="hash" placeholder="hash" value="'+esc(run.hash||"")+'"></td>'+
      '<td><button class="btn sm dz" data-rundel="'+i+'.'+j+'">&times;</button></td></tr>';
    if(!isAttest && run.note){
      h+='<tr class="runnote"><td></td><td colspan="7"><span class="hint">'+esc(run.note)+'</span></td></tr>';
    }
  });
  h+='</tbody></table></div>';
  h+='<div class="overridebox"><b>Override</b><span class="hint">'+esc(COMPUTED_ONLY_RULE)+'</span>'+
     '<div class="reqgrid" style="margin-top:8px">'+
     '<div class="fld-b"><label>Override decision</label><select data-ovr="'+i+'" data-k="approved">'+
       optList(["No","Yes"], (r.runs.length&&latestRun(r).override&&latestRun(r).override.approved)?"Yes":"No")+'</select></div>'+
     '<div class="fld-b"><label>Signed by</label><input type="text" class="fw" data-ovr="'+i+'" data-k="signedBy" value="'+
       esc((latestRun(r)&&latestRun(r).override&&latestRun(r).override.signedBy)||"")+'"></div>'+
     '<div class="fld-b"><label>Rationale, retained with the measurement</label><textarea data-ovr="'+i+'" data-k="rationale">'+
       esc((latestRun(r)&&latestRun(r).override&&latestRun(r).override.rationale)||"")+'</textarea></div>'+
     '</div></div>';
  return h+'</div>';
}

function wireRequirements(){
  $$("[data-toggle]").forEach(function(d){ d.addEventListener("click",function(){
    var id=d.dataset.toggle; REQ_OPEN[id]=!REQ_OPEN[id]; renderRequirements(); });});
  $$("[data-rq]").forEach(function(i){ i.addEventListener("change",function(){
    var r=STATE.requirements[+i.dataset.rq];
    r[i.dataset.k]=i.value;
    if(i.dataset.k==="concern") r.lens=lensOf(i.value);
    save(); renderRequirements(); ticks(); });});
  $$("[data-sp]").forEach(function(i){ i.addEventListener("change",function(){
    STATE.requirements[+i.dataset.sp].spec[i.dataset.k]=i.value; save(); renderRequirements(); ticks(); });});
  $$("[data-run]").forEach(function(i){ i.addEventListener("change",function(){
    var p=i.dataset.run.split("."); STATE.requirements[+p[0]].runs[+p[1]][i.dataset.k]=i.value;
    save(); renderRequirements(); ticks(); });});
  $$("[data-runadd]").forEach(function(b){ b.addEventListener("click",function(e){
    e.stopPropagation();
    var r=STATE.requirements[+b.dataset.runadd];
    r.runs.push({id:uid("RUN"),executedAt:nowISO(),actual:"",numerator:"",denominator:"",
      ciLow:"",ciHigh:"",sample:"",coverage:"",agreement:"",evidenceId:"",hash:"",
      environment:r.spec.environment||"",note:"",attestation:"",override:null});
    save(); renderRequirements(); ticks(); });});
  $$("[data-rundel]").forEach(function(b){ b.addEventListener("click",function(){
    var p=b.dataset.rundel.split("."); STATE.requirements[+p[0]].runs.splice(+p[1],1);
    save(); renderRequirements(); ticks(); });});
  $$("[data-ovr]").forEach(function(i){ i.addEventListener("change",function(){
    var r=STATE.requirements[+i.dataset.ovr], run=latestRun(r); if(!run) return;
    run.override=run.override||{approved:false,signedBy:"",rationale:""};
    if(i.dataset.k==="approved") run.override.approved=(i.value==="Yes");
    else run.override[i.dataset.k]=i.value;
    save(); renderRequirements(); });});
}

function addRequirement(){
  STATE.requirements=STATE.requirements||[];
  var r=blankReq(STATE.useCaseId); r.title="New requirement";
  STATE.requirements.unshift(r); REQ_OPEN[r.id]=true; save(); renderRequirements(); ticks();
}
function doSeedRequirements(){
  STATE.requirements=STATE.requirements||[];
  var made=seedRequirements(STATE.useCaseId, STATE.spine||{}, {});
  STATE.requirements=STATE.requirements.concat(made);
  save(); renderRequirements(); renderAssurance(); renderLifecycle(); ticks();
  toast(made.length ? (made.length+" requirements generated from the model.")
                    : "No new requirements. Everything the model asserts is already represented.");
}

/* ------------------------------ ASSURANCE ------------------------------ */
var ASSURANCE_VIEW="concerns";
function renderAssurance(){
  if(!STATE.useCaseId){ $("#as-guard").style.display=""; $("#as-body").style.display="none"; return; }
  $("#as-guard").style.display="none"; $("#as-body").style.display="";

  $("#lenses").innerHTML=LENSES.map(function(L){
    var a=lensRollup(L.id);
    var cls=a.rag==="Green"?"g":(a.rag==="Amber"||a.rag==="Unevidenced"?"a":(a.rag==="Red"?"r":""));
    var cs=CONCERNS.filter(function(c){return c.lens===L.id;});
    return '<div class="dimcard '+cls+'"><span class="pl '+L.cls+'">'+L.name+'</span>'+
      '<div class="q" style="margin-top:8px">'+L.blurb+'</div>'+
      '<div class="hint">Concerns '+cs.map(function(c){return c.n;}).join(", ")+
        ' &middot; '+a.total+' requirements &middot; '+a.pass+' pass, '+a.fail+' fail, '+a.open+' open'+
        (a.critical?' &middot; <b class="miss">'+a.critical+' gate-critical failing</b>':'')+'</div>'+
      (L.why?'<div class="hint" style="margin-top:6px"><i>'+L.why+'</i></div>':'')+
      '<div class="hint" style="margin-top:6px">Owns: '+L.owns+'</div></div>';}).join("");

  var only=$("#as-onlyopen").checked;
  var list=CONCERNS.filter(function(c){ if(!only) return true;
    return concernRollup(c.id).rag!=="Green"; });

  $("#concerns").innerHTML=list.map(function(c){
    var a=concernRollup(c.id), L=lensObj(c.lens);
    var cls=a.rag==="Green"?"g":(a.rag==="Amber"||a.rag==="Unevidenced"?"a":(a.rag==="Red"?"r":""));
    var att=STATE.assurance&&STATE.assurance[c.id]||{finding:"",attest:"",owner:c.lead};
    var legacy=(c.from||[]).map(function(n){
      var d=DIMENSIONS.filter(function(x){return x.n===n;})[0]; return d?("v1 "+n+" "+d.name):""; }).filter(Boolean);
    return '<div class="dimcard '+cls+'">'+
      '<div class="row" style="gap:8px"><span class="pl '+L.cls+'">'+(L.short||L.name)+'</span>'+
        '<b>'+c.n+'. '+c.name+'</b></div>'+
      '<div class="q" style="margin-top:7px">'+c.q+'</div>'+
      '<div class="derived">'+
        '<span class="pill '+(a.rag==="Green"?"ok":(a.rag==="Amber"||a.rag==="Unevidenced"?"amb":(a.rag==="Red"?"warn":"mut")))+'">'+a.rag+'</span>'+
        '<span class="hint">derived from '+a.total+' requirement'+(a.total===1?"":"s")+
        (a.total?': '+a.pass+' pass, '+a.warn+' warn, '+(a.fail+a.stop)+' fail, '+a.open+' not yet measurable':
                 '. Nothing has been specified for this concern yet.')+'</span>'+
        (a.total?'<div class="bar"><i style="width:'+Math.round(100*a.pass/Math.max(1,a.total))+'%"></i></div>':'')+
      '</div>'+
      '<div class="hint" style="margin-top:6px"><b>v2 treatment:</b> '+c.treat+
        (legacy.length?' <b>Absorbs:</b> '+legacy.join("; ")+'.':'')+
        (!legacy.length?' <b>New in v2.</b>':'')+'</div>'+
      '<div class="hint" style="margin-top:4px"><b>Tests:</b> '+c.tests+'</div>'+
      '<div class="fld-b" style="margin-top:8px"><label>Finding <i>&middot; what the evidence actually shows</i></label>'+
        '<textarea data-as="'+c.id+'" data-k="finding">'+esc(att.finding)+'</textarea></div>'+
      (c.id==="safety"||c.id==="accountability"
        ? '<div class="fld-b"><label>Qualitative attestation <i>&middot; rubric, reviewer, rationale, dissent</i></label>'+
          '<textarea data-as="'+c.id+'" data-k="attest" placeholder="'+esc(QUALITATIVE_RULE)+'">'+esc(att.attest||"")+'</textarea></div>'
        : '')+
      '<div class="fld-b" style="margin-bottom:0"><label>Owner</label>'+
        '<input type="text" class="fw" data-as="'+c.id+'" data-k="owner" value="'+esc(att.owner||c.lead)+'"></div>'+
      '<div class="row" style="margin-top:8px"><button class="btn sm" data-asjump="'+c.id+'">'+
        'Open the '+a.total+' requirements &rarr;</button></div>'+
      '</div>';}).join("") || '<div class="empty">Every concern is green.</div>';

  var assessed=CONCERNS.filter(function(c){var r=concernRollup(c.id).rag;
    return r!=="Not assessed"&&r!=="Unevidenced";}).length;
  var specd=CONCERNS.filter(function(c){return concernRollup(c.id).total>0;}).length;
  $("#as-progress").textContent=specd+" of 8 concerns specified, "+assessed+" carrying evidence";

  $("#legacybox").innerHTML=
    '<table><thead><tr><th style="width:56px">v1</th><th style="width:270px">v1 dimension</th>'+
    '<th style="width:110px">Fate in v2</th><th>Where it went, and why</th></tr></thead><tbody>'+
    DIMENSIONS.map(function(d){
      var into=CONCERNS.filter(function(c){return (c.from||[]).indexOf(d.n)>=0;});
      var note=LEGACY_NOTES.filter(function(n){return n.n===d.n;})[0];
      var fate = into.length ? (into.length>1?"Split":"Carried") : (note?note.fate:"Retired");
      var where = into.length
        ? into.map(function(c){return "Concern "+c.n+", "+c.name;}).join(". ")+"."
        : "";
      if(note) where = (where?where+" ":"")+note.why;
      return '<tr><td class="mono">'+d.n+'</td><td>'+esc(d.name)+'</td>'+
        '<td><span class="pill '+(fate==="Carried"?"ok":(fate==="Split"?"amb":"mut"))+'">'+fate+'</span></td>'+
        '<td>'+where+'</td></tr>';}).join("")+
    CONCERNS.filter(function(c){return !(c.from||[]).length;}).map(function(c){
      return '<tr><td class="mono">new</td><td><i>no v1 equivalent</i></td>'+
        '<td><span class="pill warn">New</span></td><td>Concern '+c.n+', '+c.name+'. '+c.treat+'</td></tr>';}).join("")+
    '</tbody></table>';

  $("#weakbox").innerHTML='<table><thead><tr><th style="width:290px">Weakness in v1</th>'+
    '<th style="width:290px">Consequence</th><th>v2 correction</th></tr></thead><tbody>'+
    V1_WEAKNESS.map(function(r){return '<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td></tr>';}).join("")+
    '</tbody></table>';

  $$("[data-as]").forEach(function(i){ i.addEventListener("change",function(){
    STATE.assurance=STATE.assurance||{};
    STATE.assurance[i.dataset.as]=STATE.assurance[i.dataset.as]||{};
    STATE.assurance[i.dataset.as][i.dataset.k]=i.value; save(); });});
  $$("[data-asjump]").forEach(function(b){ b.addEventListener("click",function(){
    REQ_FILTER.concern=b.dataset.asjump; $("#rq-concern").value=b.dataset.asjump;
    showTab("requirements"); renderRequirements(); });});
}

/* ------------------------------ LIFECYCLE ------------------------------ */
function renderLifecycle(){
  if(!STATE.useCaseId){ $("#lc-guard").style.display=""; $("#lc-body").style.display="none"; return; }
  $("#lc-guard").style.display="none"; $("#lc-body").style.display="";
  STATE.lifecycle=STATE.lifecycle||{};

  $("#lc-rail").innerHTML=LIFECYCLE.map(function(g){
    var d=STATE.lifecycle[g.id]||{};
    var blockers=g.kind==="gate"?gateBlockers(g.id):[];
    var cls = g.kind!=="gate" ? "stage"
            : (d.outcome && blockers.length===0) ? "closed"
            : (blockers.length ? "blocked" : "opengate");
    return '<div class="lcchip '+cls+'" data-lcjump="'+g.id+'">'+
      '<b>'+g.id+'</b><span>'+esc(g.name)+'</span>'+
      (g.kind==="gate"?'<i>'+(d.outcome?esc(d.outcome):(blockers.length?blockers.length+" blocking":"open"))+'</i>':
        '<i>'+(g.iterative?"iterative":"stage")+'</i>')+'</div>';}).join("");

  var h="";
  LIFECYCLE.forEach(function(g){
    var isGate=g.kind==="gate";
    var d=isGate?gateDecision(g.id):null;
    var blockers=isGate?gateBlockers(g.id):[];
    var comp=(g.component||[]).map(function(cid){
      var gt=(STATE.gates||[]).filter(function(x){return x.id===cid;})[0];
      var def=DEFAULT_GATES.filter(function(x){return x.id===cid;})[0];
      return {id:cid, name:def?def.name:cid, status:gt?gt.status:"Not assessed"};});
    h+='<div class="lcard '+(isGate?(g.hard?"hard":"soft"):"stagecard")+'" id="lc-'+g.id+'">'+
      '<div class="lchead"><span class="lcid">'+g.id+'</span><b>'+esc(g.name)+'</b>'+
        (isGate?'<span class="pill '+(g.hard?"warn":"amb")+'">'+(g.hardNote?esc(g.hardNote):"HARD gate")+'</span>':
                '<span class="pill mut">'+(g.iterative?"iterative stage":"stage")+'</span>')+
        '<span class="spacer"></span>'+
        (isGate?'<span class="pill '+(d.outcome&&!blockers.length?"ok":(blockers.length?"warn":"mut"))+'">'+
          (d.outcome?esc(d.outcome):"no decision recorded")+'</span>':'')+'</div>'+
      '<div class="lcgrid">'+
        '<div><h5>Purpose and entry</h5><p>'+esc(g.purpose)+'</p></div>'+
        '<div><h5>Mandatory inputs and assessment questions</h5><p>'+esc(g.inputs)+'</p></div>'+
        '<div><h5>Evidence, accountability and outcomes</h5><p>'+esc(g.who)+'</p></div>'+
        '<div><h5>Exit artefact and handoff</h5><p>'+esc(g.exit)+'</p></div>'+
      '</div>';
    if(comp.length){
      h+='<div class="compbox"><b>Component gates nested here</b> '+
        '<span class="hint">The six U05 gates are component assurance gates. They sit inside this enterprise gate, they do not replace it.</span>'+
        '<div class="row" style="margin-top:6px">'+comp.map(function(c){
          return '<span class="pill '+(/closed|met|pass/i.test(c.status)?"ok":"mut")+'">'+
            c.id+' '+esc(c.name)+': '+esc(c.status||"Not assessed")+'</span>';}).join("")+'</div></div>';
    }
    if(isGate){
      if(blockers.length){
        h+='<div class="blockbox"><b>'+blockers.length+' gate-critical requirement'+
          (blockers.length===1?" blocks":"s block")+' this gate</b><ul>'+blockers.slice(0,8).map(function(r){
            return '<li><span class="mono">'+esc(r.id)+'</span> '+esc(r.title)+
              ' <span class="pill warn">'+esc(reqStatus(r).s)+'</span></li>';}).join("")+
          (blockers.length>8?'<li class="hint">and '+(blockers.length-8)+' more</li>':'')+'</ul></div>';
      } else {
        h+='<div class="okbox">No gate-critical requirement in scope is failing, unspecified or unrun.</div>';
      }
      h+='<div class="reqgrid lcdec">'+
        '<div class="fld-b"><label>Outcome</label><select data-lc="'+g.id+'" data-k="outcome">'+
          optList(g.outcomes||["Proceed","Hold","Reject"], d.outcome, "not decided")+'</select></div>'+
        '<div class="fld-b"><label>Accountable decision maker</label>'+
          '<input type="text" class="fw" data-lc="'+g.id+'" data-k="decisionMaker" value="'+esc(d.decisionMaker||"")+'"></div>'+
        '<div class="fld-b"><label>Decision date</label>'+
          '<input type="date" class="fw" data-lc="'+g.id+'" data-k="date" value="'+esc(d.date||"")+'"></div>'+
        '<div class="fld-b"><label>Expiry or review trigger</label>'+
          '<input type="text" class="fw" data-lc="'+g.id+'" data-k="expiry" value="'+esc(d.expiry||"")+'"></div>'+
        '<div class="fld-b"><label>Conditions attached</label>'+
          '<textarea data-lc="'+g.id+'" data-k="conditions">'+esc(d.conditions||"")+'</textarea></div>'+
        '<div class="fld-b"><label>Evidence IDs</label>'+
          '<textarea data-lc="'+g.id+'" data-k="evidence">'+esc(d.evidence||"")+'</textarea></div>'+
      '</div>';
    }
    h+='</div>';
  });
  $("#lc-list").innerHTML=h;

  $("#lc-lineage").innerHTML='<table><thead><tr><th style="width:320px">Authoritative information</th>'+
    '<th style="width:260px">System of record</th><th>Flows by reference, not by copied prose</th></tr></thead><tbody>'+
    LINEAGE.map(function(r){return '<tr><td>'+esc(r[0])+'</td><td><b>'+esc(r[1])+'</b></td><td class="mono sm">'+esc(r[2])+'</td></tr>';}).join("")+
    '</tbody></table>';

  $$("[data-lc]").forEach(function(i){ i.addEventListener("change",function(){
    var d=gateDecision(i.dataset.lc); d[i.dataset.k]=i.value; save(); renderLifecycle(); ticks(); });});
  $$("[data-lcjump]").forEach(function(c){ c.addEventListener("click",function(){
    var t=document.getElementById("lc-"+c.dataset.lcjump); if(t) t.scrollIntoView({behavior:"smooth",block:"start"}); });});
}

/* ------------------------------ REFERENCE ------------------------------ */
function renderReference(){
  function tbl(head,rows,widths){
    return '<div class="tbl-wrap"><table><thead><tr>'+head.map(function(hh,i){
      return '<th'+(widths&&widths[i]?' style="width:'+widths[i]+'px"':'')+'>'+hh+'</th>';}).join("")+
      '</tr></thead><tbody>'+rows.map(function(r){
        return '<tr>'+r.map(function(c){return '<td>'+c+'</td>';}).join("")+'</tr>';}).join("")+'</tbody></table></div>';
  }
  function list(items){ return '<ol class="reflist">'+items.map(function(i){return '<li>'+i+'</li>';}).join("")+'</ol>'; }

  $("#ref-body").innerHTML =
   '<div class="panel"><div class="panel-head"><h2>The v2 conceptual model</h2></div>'+
    '<div class="chain">'+
      '<div>AIUseCase / Condition / BusinessClaim / RiskClaim</div><i>generates</i>'+
      '<div>EvalRequirement, anchored to a GoldenThreadNode</div><i>is operationalised by</i>'+
      '<div>EvalSpecification, using Metric + Dataset + Scenario + Method + Evaluator</div><i>scheduled in</i>'+
      '<div>EvalPlan &rarr; EvalRun &rarr; EvalResult &rarr; EvidenceItem</div><i>produces</i>'+
      '<div>Finding &rarr; Remediation &rarr; Retest</div><i>consumed by</i>'+
      '<div>GateAssessment</div><i>writes back to</i>'+
      '<div>Cards / EAR / Monitoring / Value Realisation / Change Record</div>'+
    '</div>'+
    '<div class="rules"><b>Core relationships</b>'+list([
      "One ConditionID may generate many EvalRequirementIDs.",
      "One requirement may have several specifications where multiple methods are needed.",
      "A specification may be executed repeatedly in different environments or lifecycle phases.",
      "Results are immutable observations. Findings are reviewer conclusions.",
      "A gate consumes requirement statuses but never overwrites them.",
      "A Model Card is a governed projection of model facts and verified results, not the Eval system of record."])+
    '</div></div>'+

   '<div class="panel"><div class="panel-head"><h2>Eval Requirement schema</h2></div>'+
    tbl(["Field group","Final fields","Lifecycle"],REQ_SCHEMA.map(function(r){
      return [r[0],'<span class="mono sm">'+esc(r[1])+'</span>',r[2]];}),[150,null,130])+'</div>'+

   '<div class="panel"><div class="panel-head"><h2>Eval Specification schema</h2></div>'+
    tbl(["Field group","Final fields"],SPEC_SCHEMA.map(function(r){
      return [r[0],'<span class="mono sm">'+esc(r[1])+'</span>'];}),[150,null])+
    '<div class="rules"><b>Eval-produced write-back fields</b><p class="mono sm">'+esc(RUN_FIELDS)+'</p>'+
    '<p>'+esc(COMPUTED_ONLY_RULE)+'</p></div></div>'+

   '<div class="panel"><div class="panel-head"><h2>Source to Eval population</h2></div>'+
    '<p class="hint">B means upstream-seeded and progressively enriched. D means the Eval result is written back. '+
    'REF means the fact remains authoritative elsewhere and is never copied.</p>'+
    tbl(["Authoritative artefact","Seeds Eval (B)","Receives from Eval (D)","Stays authoritative (REF)"],
      SOURCE_MAP.map(function(r){return ['<b>'+esc(r[0])+'</b>',esc(r[1]),esc(r[2]),esc(r[3])];}),[190,null,null,null])+'</div>'+

   '<div class="panel"><div class="panel-head"><h2>Golden thread to Eval mapping</h2></div>'+
    tbl(["Layer","Evaluation question and pre-population","Evidence and test family","Failure and decision impact"],
      THREAD_EVAL_MAP.map(function(r){
        return ['<b>'+esc(r.lay)+'</b>',esc(r.q)+'<div class="hint" style="margin:0">'+esc(r.pre)+'</div>',
                esc(r.fam),esc(r.fail)];}),[160,null,180,null])+
    '<div class="rules"><b>Where the two lanes join</b><p>'+esc(LANE_JOIN)+'</p></div></div>'+

   '<div class="panel"><div class="panel-head"><h2>EAR condition expansion</h2></div>'+
    '<p class="hint">One ConditionID becomes four requirements. Each link records: '+esc(EAR_LINK_FIELDS)+'</p>'+
    tbl(["Suffix","Requirement type","What it is","What it must not become"],
      EAR_PATTERN.map(function(p){return ['<span class="mono">'+p.suffix+'</span>',p.type,'<b>'+esc(p.name)+'</b>',esc(p.hint)];}),[70,160,230,null])+
    '<div class="rules"><b>The qualitative rule</b><p>'+esc(QUALITATIVE_RULE)+'</p></div></div>'+

   '<div class="panel"><div class="panel-head"><h2>Value to Eval</h2></div>'+
    tbl(["Value input","Initial requirement","Maturation"],VALUE_MATURATION.map(function(r){
      return ['<b>'+esc(r[0])+'</b>',esc(r[1]),esc(r[2])];}),[220,260,null])+
    '<div class="rules"><p>'+esc(VALUE_RULE)+'</p></div></div>'+

   '<div class="panel"><div class="panel-head"><h2>Readiness domains</h2></div>'+
    '<p class="hint">'+esc(READINESS_RULE)+'</p>'+
    tbl(["ID","Domain","Assurance lens","The question it must answer"],READINESS_DOMAINS.map(function(d){
      var L=lensObj(d.lens);
      return ['<span class="mono">'+d.id+'</span>','<b>'+esc(d.name)+'</b>',
              '<span class="pl '+L.cls+'">'+(L.short||L.name)+'</span>',esc(d.ask)];}),[90,200,190,null])+'</div>'+

   '<div class="panel"><div class="panel-head"><h2>Eval types and measurement integrity</h2></div>'+
    '<p class="hint">EvalType is a controlled tag, not a parallel framework.</p>'+
    '<div class="row">'+EVAL_TYPES.map(function(t){return '<span class="pill mut">'+esc(t)+'</span>';}).join("")+'</div>'+
    '<p class="hint" style="margin-top:12px">For GenAI, RAG and agents, add:</p>'+
    '<div class="row">'+GENAI_METRICS.map(function(t){return '<span class="pill amb">'+esc(t)+'</span>';}).join("")+'</div>'+
    '<div class="rules" style="margin-top:14px"><b>Mandatory integrity controls</b>'+list(INTEGRITY_CONTROLS)+'</div></div>'+

   '<div class="panel"><div class="panel-head"><h2>Progressive population by lifecycle phase</h2></div>'+
    tbl(["Phase","Requirement and specification state","Required enrichment and write-back"],
      LIFECYCLE_PHASES.map(function(p){return ['<b>'+esc(p.name)+'</b>','<span class="pill mut">'+esc(p.state)+'</span>',esc(p.need)];}),[210,200,null])+
    '<div class="rules"><b>Retest triggers</b><div class="row" style="margin-top:6px">'+
      RETEST_TRIGGERS.map(function(t){return '<span class="pill mut">'+esc(t)+'</span>';}).join("")+'</div></div></div>'+

   '<div class="panel"><div class="panel-head"><h2>System of record and synchronisation</h2></div>'+
    '<div class="rules">'+list(SYNC_RULES)+'</div>'+
    '<p class="hint" style="margin-top:10px"><b>Change events:</b> '+
      CHANGE_EVENTS.map(function(e){return '<span class="mono">'+e+'</span>';}).join(", ")+
      '. Each event runs impact analysis against the linked EvalRequirementIDs.</p>'+
    '<p class="hint"><b>Minimum shared metadata:</b> '+esc(SHARED_METADATA)+'</p></div>'+

   '<div class="panel"><div class="panel-head"><h2>Card projections</h2></div>'+
    '<p class="hint">'+esc(CARD_RULE)+'</p>'+
    tbl(["Card","Before executable Eval","Enriched during design","Written back from Eval","When it is created"],
      CARD_LEVELS.map(function(c){return ['<b>'+esc(c.name)+'</b>',esc(c.before),esc(c.during),esc(c.after),
        '<span class="hint">'+esc(c.when)+'</span>'];}),[190,null,null,null,170])+'</div>'+

   '<div class="panel"><div class="panel-head"><h2>Roadmap from v1 to v2</h2></div>'+
    tbl(["Priority","Remediation"],V2_ROADMAP.map(function(r){
      return ['<span class="pill '+(r[0]==="P0"?"warn":(r[0]==="P1"?"amb":"mut"))+'">'+r[0]+'</span>',esc(r[1])];}),[90,null])+
    '<div class="rules"><b>Bottom line</b><p>'+esc(V2_BOTTOM_LINE)+'</p></div></div>';
}
</script>
