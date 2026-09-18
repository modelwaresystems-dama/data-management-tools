<script>
/* =====================================================================
   EXPORTS
   ===================================================================== */
function clean(rows){
  /* no em dashes in a generated workbook either; see noem() */
  return rows.map(function(r){ return (r||[]).map(function(c){
    return (typeof c==="string") ? noem(c) : c; }); });
}
function aoaSheet(title,rows){
  var head=[[title],[ (STATE.company||MODEL.company||"")+" | "+(STATE.useCaseId||"")+" "+(STATE.useCaseName||"") ],[""]];
  return XLSX.utils.aoa_to_sheet(clean(head.concat(rows)));
}
function setCols(ws,widths){ ws["!cols"]=widths.map(function(w){return {wch:w};}); return ws; }

function exportXLSX(){
  if(!STATE.useCaseId){ alert("Select an AI use case first."); return; }
  var wb=XLSX.utils.book_new(), s=STATE;

  /* ReadMe */
  var rm=[["Section","Description"],
    ["Purpose","Full-spine AI evaluation pack produced in the 90-minute AI Evaluation Framework session."],
    ["Company",s.company||MODEL.company],
    ["AI use case",s.useCaseId+" "+s.useCaseName],
    ["Session date",s.session.date],["Facilitator",s.session.facilitator],
    ["Assessment intensity",s.session.intensity],
    ["Decision posture",s.decision.choice],
    ["Decision rationale",s.decision.rationale],
    ["Approver",s.decision.approver],["Review date",s.decision.review],
    ["Source model",s.modelFile||MODEL.file],
    ["How to use","Start with Full_Spine, then Eval_Requirements with Eval_Specifications and Eval_Runs beside it, then Assurance, Remediation_Backlog, Governance_Lifecycle and Decision_Gates. AI_Eval_Register holds the v1 recomputation exercise. Legacy_v1_Framework is the superseded four pillars and eight dimensions, retained so earlier evaluations still resolve."],["Framework version","Modelware AI Evaluation Framework v2: five assurance lenses, eight configurable assurance concerns, and the Requirement, Specification, Run and Result separation."],["Computed status rule","No editable Pass or Fail field exists anywhere in this workbook. ComputedStatus is derived from the observed value, the operator, the threshold and the tolerance. A human exception is a separate signed override recorded against the run, and it never alters the measurement."],
    ["Generated","AI Evaluation Framework v"+APP_VERSION+" on "+new Date().toISOString().slice(0,16).replace("T"," ")]];
  XLSX.utils.book_append_sheet(wb,setCols(aoaSheet("Workbook guide",rm),[26,110]),"ReadMe");

  /* Full spine */
  var sp=[["Spine layer","ID","Element","Interpretation / action"]];
  SPINE_LAYERS.forEach(function(L){ var v=(s.spine||{})[L.k]||{ids:[],names:[]};
    sp.push([L.lay, v.ids.join(", ")||"none",
      v.names.filter(Boolean).join(" · ")||"NOT REACHABLE, architecture gap",
      s.fields["spine_"+L.k]||v.note||""]);});
  sp.push([""],["As-is lane",s.lanes.asis||""],["Proposed lane",s.lanes.prop||""]);
  XLSX.utils.book_append_sheet(wb,setCols(aoaSheet("Full spine traceability",sp),[22,26,52,80]),"Full_Spine");

  /* Eval register */
  var er=[["Component","Check","Metric","Result","Threshold","Recorded status","Computed status","Flag","Pass?","Method","Frequency","Owner","Evidence"]];
  var pass=0,fail=0,mis=0,crit=0;
  s.evals.forEach(function(e){ var c=computeStatus(e.result,e.threshold), f=flagOf(e.recorded,c);
    if(c==="Pass")pass++; if(c==="Fail")fail++; if(f==="Mismatch")mis++; if(f==="Critical")crit++;
    er.push([e.target,e.evalName||e.category,e.metric,e.result,e.threshold,e.recorded,c||"manual",f,c==="Pass"?1:0,
      e.method,e.freq,e.owner,e.evidence]);});
  er.push([""],["Summary"],["Total checks",s.evals.length],["Computed passes",pass],["Computed fails",fail],
    ["Computed pass rate",(pass+fail)?Math.round(100*pass/(pass+fail))+"%":"n/a"],
    ["Status mismatches",mis],["Critical (recorded pass over computed fail)",crit]);
  XLSX.utils.book_append_sheet(wb,setCols(aoaSheet("AI eval recomputation",er),[16,28,26,10,14,15,15,12,7,20,12,14,26]),"AI_Eval_Register");

  /* Eval Requirements */
  function txt(x){ return String(x==null?"":x).replace(/&amp;/g,"&"); }
  var rq=[["EvalRequirementID","Title","RequirementType","Version","AssuranceLens","AssuranceConcern",
    "EvalType","LifecyclePhase","GateCriticality","ComputedStatus","StatusBasis",
    "SourceArtefactType","SourceRecordID","SourceConditionID","SourceURI",
    "AIUseCaseID","GoldenThreadAnchorType","GoldenThreadAnchorID","RelatedRequirementIDs",
    "BusinessClaim","RiskClaim","ObligationClaim",
    "SystemID","ComponentType","ComponentID","ComponentVersionID","ContextOfUseID",
    "BehaviourOrOutcome","FailureConsequence","AffectedStakeholderID","AffectedSegmentID",
    "HumanControlRequirementID","ControlID","ProhibitedBehaviour","FallbackRequirement",
    "RequirementOwnerRoleID","ReviewerRoleID","IndependenceRequired","ApprovalStatus",
    "EffectiveFrom","EffectiveTo","SupersedesRequirementID","RetestTriggerID","RetirementCondition",
    "RunCount","SeededFromModel"]];
  (s.requirements||[]).forEach(function(r){
    var st=reqStatus(r);
    rq.push([r.id,txt(r.title),r.type,r.version,
      txt(lensObj(r.lens).name),txt(concernName(r.concern)),
      r.evalType,phaseName(r.phase),r.criticality,st.s,txt(st.why||""),
      r.sourceArtefact,r.sourceRecordId,r.sourceConditionId,r.sourceUri,
      r.useCaseId,r.anchorType,r.anchorId,r.related,
      txt(r.businessClaim),txt(r.riskClaim),txt(r.obligationClaim),
      r.systemId,r.componentType,r.componentId,r.componentVersion,r.contextOfUse,
      txt(r.behaviour),txt(r.failureConsequence),r.stakeholderId,r.segmentId,
      r.humanControlId,r.controlId,txt(r.prohibited),txt(r.fallback),
      r.ownerRole,r.reviewerRole,r.independence,r.approval,
      r.effectiveFrom,r.effectiveTo,r.supersedes,r.retestTrigger,txt(r.retirement),
      (r.runs||[]).length, r.seeded?"Yes":"No"]);});
  rq.push([""],["Rule","ComputedStatus is derived at read time from the observed value, the operator, the threshold and the tolerance. No editable Pass or Fail field exists. A human exception is a separate signed override recorded against the run."]);
  XLSX.utils.book_append_sheet(wb,setCols(aoaSheet("Eval Requirements",rq),
    [16,46,18,9,30,34,20,20,15,14,44,24,18,18,22,10,22,18,20,52,52,52,12,14,14,14,16,52,44,18,18,20,16,36,36,18,18,14,14,13,13,18,30,44,9,10]),"Eval_Requirements");

  /* Eval Specifications */
  var sp2=[["EvalRequirementID","MetricID","ConstructName","OperationalDefinition","Formula","Unit","Aggregation","SliceDimensions",
    "BaselineValue","TargetValue","Operator","ThresholdValue","WarningThreshold","StopThreshold","Tolerance",
    "ConfidenceLevel","ConfidenceIntervalMethod","MinimumSampleSize","PowerOrPrecisionRequirement",
    "DatasetID","DatasetVersionID","ScenarioSetID","TestCaseID","GroundTruthSource","CoverageRequirement",
    "MeasurementMethodID","EvaluatorType","EvaluatorID","RubricVersionID","JudgeModelVersionID","JudgePromptVersionID",
    "EnvironmentID","ConfigurationVersionID","ToolVersion","RandomSeed","RepetitionCount",
    "EvidenceTypeRequired","EvidenceAcceptanceCriteria","RetentionClassID","EvidenceRepositoryURI",
    "ExecutionCadence","MonitoringWindow","TriggerCondition","RetestDeadline","SpecificationStatus"]];
  (s.requirements||[]).forEach(function(r){ var c=r.spec;
    sp2.push([r.id,c.metricId,txt(c.construct),txt(c.opDef),c.formula,c.unit,c.aggregation,c.slices,
      c.baseline,c.target,c.operator,c.threshold,c.warn,c.stop,c.tolerance,
      c.confidence,c.ciMethod,c.minSample,c.power,
      c.datasetId,c.datasetVersion,c.scenarioSet,c.testCase,c.groundTruth,c.coverage,
      txt(c.method),c.evaluatorType,c.evaluatorId,c.rubricVersion,c.judgeModel,c.judgePrompt,
      c.environment,c.configVersion,c.toolVersion,c.seed,c.repetitions,
      c.evidenceType,txt(c.evidenceAcceptance),c.retentionClass,c.evidenceUri,
      c.cadence,c.monitoringWindow,txt(c.trigger),c.retestDeadline,c.status]);});
  XLSX.utils.book_append_sheet(wb,setCols(aoaSheet("Eval Specifications",sp2),
    [16,14,30,64,18,10,14,20,12,12,10,14,14,14,10,12,20,14,20,14,14,16,14,20,18,34,20,16,14,18,18,14,18,12,10,12,22,44,14,26,16,16,30,14,16]),"Eval_Specifications");

  /* Eval Runs and Results */
  var rn=[["EvalRunID","EvalRequirementID","RequirementTitle","ExecutedAt","ActualValue","Attestation",
    "ComputedStatus","StatusBasis","SampleSize","CoverageAchieved","CI low","CI high","EvaluatorAgreement",
    "EvidenceID","EvidenceHash","EnvironmentID","OverrideApproved","OverrideSignedBy","OverrideRationale","Note"]];
  (s.requirements||[]).forEach(function(r){
    (r.runs||[]).forEach(function(run){
      var e=evalAcceptance(r.spec,run.actual);
      var isAtt=r.type==="Attestation"||r.spec.evaluatorType==="Attestation"||r.spec.evaluatorType==="Independent review";
      rn.push([run.id,r.id,txt(r.title),run.executedAt,run.actual,run.attestation||"",
        isAtt?(run.attestation||"not recorded"):(e.status||"not computable"),
        isAtt?"Qualitative. Assessed by rubric and independent reviewer.":txt(e.why||""),
        run.sample,run.coverage,run.ciLow,run.ciHigh,run.agreement,
        run.evidenceId,run.hash,run.environment,
        (run.override&&run.override.approved)?"Yes":"No",
        (run.override&&run.override.signedBy)||"",txt((run.override&&run.override.rationale)||""),
        txt(run.note||"")]);});});
  rn.push([""],["Rule","Observations are immutable. An override never alters the measurement: the computed status remains visible beneath it."]);
  XLSX.utils.book_append_sheet(wb,setCols(aoaSheet("Eval runs and results",rn),
    [14,16,46,12,12,24,14,52,11,14,10,10,14,18,18,14,15,20,60,70]),"Eval_Runs");

  /* Assurance view, derived */
  var av=[["Assurance lens","Concern","Evaluation question","Derived status","Requirements","Pass","Warn","Fail or stop","Not yet measurable","Gate-critical failing","Finding","Qualitative attestation","Owner","v2 treatment","Absorbs from v1"]];
  CONCERNS.forEach(function(c){ var a=concernRollup(c.id), at=(s.assurance||{})[c.id]||{};
    av.push([txt(lensObj(c.lens).name),c.n+". "+txt(c.name),txt(c.q),a.rag,a.total,a.pass,a.warn,a.fail+a.stop,a.open,a.critical,
      txt(at.finding||""),txt(at.attest||""),txt(at.owner||c.lead),txt(c.treat),
      (c.from||[]).map(function(n){var d=DIMENSIONS[n-1];return d?("v1 "+n+" "+d.name):"";}).filter(Boolean).join("; ")||"New in v2"]);});
  av.push([""],["Assurance lens","Primary owner","Cross-reviewer","Derived status","Requirements","Owns"]);
  LENSES.forEach(function(L){ var o=s.pillarOwners[L.id]||{}, a=lensRollup(L.id);
    av.push([txt(L.name),txt(o.owner||""),txt(o.review||""),a.rag,a.total,txt(L.owns)]);});
  av.push([""],["Where the v1 eight dimensions went"],["v1","v1 dimension","Fate","Destination or reason"]);
  DIMENSIONS.forEach(function(d){
    var into=CONCERNS.filter(function(c){return (c.from||[]).indexOf(d.n)>=0;});
    var note=LEGACY_NOTES.filter(function(n){return n.n===d.n;})[0];
    var fate=into.length?(into.length>1?"Split":"Carried"):(note?txt(note.fate):"Retired");
    var where=into.map(function(c){return "Concern "+c.n+", "+txt(c.name);}).join(". ");
    if(note) where=(where?where+" ":"")+txt(note.why);
    av.push([d.n,d.name,fate,where]);});
  av.push([""],["Rule","A concern's status is derived from the requirements filed under it. There is no manually entered RAG value, because a score typed in by hand is an opinion detached from the underlying tests."]);
  XLSX.utils.book_append_sheet(wb,setCols(aoaSheet("Assurance lenses and concerns",av),
    [32,36,58,15,12,7,7,12,18,18,80,80,26,64,42]),"Assurance");

  /* Legacy v1 framework, retained */
  var fw=[["v1 quality pillar","v1 dimension","Evaluation question","RAG","Finding","Evidence held","Required evidence","Owner"]];
  DIMENSIONS.forEach(function(d){ var f=s.framework[d.id]||{};
    var p=PILLARS.filter(function(x){return x.id===d.pillar;})[0];
    fw.push([p.name,d.n+". "+d.name,d.q,f.rag||"Not assessed",f.finding||"",f.evidence||"",d.evidence,f.owner||d.lead]);});
  fw.push([""],["This sheet is the superseded v1 model, retained so that earlier evaluations still resolve. The live model is on the Assurance sheet."]);
  XLSX.utils.book_append_sheet(wb,setCols(aoaSheet("v1 four pillars and eight dimensions (superseded)",fw),[18,32,52,12,60,50,50,22]),"Legacy_v1_Framework");

  /* Governance lifecycle */
  var lc=[["Gate or stage","Kind","Name","Purpose and entry","Mandatory inputs and assessment questions",
    "Evidence, accountability and outcomes","Exit artefact and handoff","Component gates nested here",
    "Recorded outcome","Accountable decision maker","Decision date","Conditions attached","Evidence IDs",
    "Expiry or review trigger","Gate-critical requirements blocking"]];
  LIFECYCLE.forEach(function(g){
    var d=(s.lifecycle||{})[g.id]||{};
    var bl=g.kind==="gate"?gateBlockers(g.id):[];
    lc.push([g.id,(g.kind==="gate"?(g.hard?(g.hardNote||"HARD gate"):"Gate"):(g.iterative?"Iterative stage":"Stage")),
      txt(g.name),txt(g.purpose),txt(g.inputs),txt(g.who),txt(g.exit),
      (g.component||[]).join(", "),
      d.outcome||"",d.decisionMaker||"",d.date||"",txt(d.conditions||""),txt(d.evidence||""),txt(d.expiry||""),
      bl.length?bl.map(function(r){return r.id+" ("+reqStatus(r).s+")";}).join("; "):"none"]);});
  lc.push([""],["Principle",LIFECYCLE_PRINCIPLE]);
  lc.push([""],["Information lineage and systems of record"],["Authoritative information","System of record","Flows by reference"]);
  LINEAGE.forEach(function(r){ lc.push([r[0],r[1],r[2]]);});
  XLSX.utils.book_append_sheet(wb,setCols(aoaSheet("Governance lifecycle S1 to G6",lc),
    [14,18,34,64,80,64,54,20,22,28,12,70,26,36,52]),"Governance_Lifecycle");

  /* Remediation */
  var rb=[["Priority","Action","Description","Quality pillar","Status","Owner"]];
  s.remediation.forEach(function(r){ rb.push([r.priority,r.action,r.desc,r.pillar,r.status,r.owner]);});
  XLSX.utils.book_append_sheet(wb,setCols(aoaSheet("Remediation backlog",rb),[9,44,80,18,14,22]),"Remediation_Backlog");

  /* Gates */
  var gt=[["Gate","Name","Pass criterion","Decision rule","Status","Owner","Evidence"]];
  s.gates.forEach(function(g){ gt.push([g.id,g.name,g.crit,g.rule,g.status,g.owner||"",g.evidence||""]);});
  gt.push([""],["Decision",s.decision.choice],["Rationale",s.decision.rationale],
    ["Conditions",s.decision.conditions],["Approver",s.decision.approver],["Review date",s.decision.review]);
  XLSX.utils.book_append_sheet(wb,setCols(aoaSheet("Conditional progression gates",gt),[8,26,64,40,14,20,24]),"Decision_Gates");

  /* Session record */
  var sr=[["Step","Phase","Time","Title","Canvas output","Complete"]];
  STEPS.forEach(function(st){ sr.push([st.n,st.ph,st.t,st.title,st.out||"",s.stepsDone[st.n]?"Yes":"No"]);});
  sr.push([""],["Captured answers"],["Key","Value"]);
  Object.keys(s.fields).sort().forEach(function(k){ sr.push([k,String(s.fields[k])]);});
  sr.push([""],["Evidence cards"],["Card","Evidence","Kind","Iceberg layer"]);
  s.evidence.forEach(function(e){ sr.push([e.id,e.text,e.kind,(ICE_LAYERS.filter(function(L){return L.k===e.layer;})[0]||{}).name||""]);});
  sr.push([""],["Table votes"],["Table","Vote","Why"]);
  s.votes.forEach(function(v){ sr.push([v.table,(ICE_LAYERS.filter(function(L){return L.k===v.vote;})[0]||{}).name||"",v.why]);});
  XLSX.utils.book_append_sheet(wb,setCols(aoaSheet("Session record",sr),[8,8,10,44,34,80]),"Session_Record");

  /* Canvas summary */
  var cv=[["Canvas","Data product","Status","Purpose","Owner","Steward","Classification","Fields","Mean usability"]];
  s.canvases.forEach(function(c){
    var sc=Object.keys(c.usability).map(function(k){return +c.usability[k].score||0;}).filter(Boolean);
    cv.push([c.f.dp_name||"",c.productId||"PROPOSED",c.f.dp_status||"",c.f.purpose||"",c.f.dp_owner||"",
      c.f.dp_steward||"",c.f.dp_class||"",c.cdes.length, sc.length?(sc.reduce(function(a,b){return a+b;},0)/sc.length).toFixed(1):""]);});
  s.canvases.forEach(function(c){
    cv.push([""],["Canvas: "+(c.f.dp_name||c.productId)],["Field","Datatype","Nullable","PII","Semantic binding","CDE ref"]);
    c.cdes.forEach(function(r){ cv.push([r.field,r.type,r.nullable,r.pii,r.term,r.ref]);});});
  XLSX.utils.book_append_sheet(wb,setCols(aoaSheet("Data product canvases",cv),[28,16,14,70,20,20,14,10,12]),"Data_Products");

  /* Sources */
  var sc=[["Ref","Source","How used"]];
  s.sources.forEach(function(r){ sc.push([r.ref,r.src,r.use]);});
  XLSX.utils.book_append_sheet(wb,setCols(aoaSheet("Source trail",sc),[8,44,90]),"Source_Trail");

  var fn=(s.company||"Model").replace(/[^A-Za-z0-9]+/g,"_")+"_"+s.useCaseId+"_AI_Evaluation_Workbook_"+s.session.date+".xlsx";
  var buf=XLSX.write(wb,{bookType:"xlsx",type:"array"});
  download(fn,new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));
}

function canvasMD(c){
  var L=[];
  L.push("# DATA PRODUCT CANVAS");
  L.push("**A Collaborative Blueprint for Designing, Scoping, and Governing Independent Data Products**");
  L.push("");
  L.push("> Prepared in the AI Evaluation Framework session for **"+(STATE.useCaseId||"")+" "+(STATE.useCaseName||"")+
         "** · "+(STATE.company||MODEL.company||"")+" · "+STATE.session.date+
         (c.proposed?"  \n> **PROPOSED PRODUCT. Not present in the FutureState model.**":""));
  L.push("");
  CANVAS_SECTIONS.forEach(function(S_){
    L.push("---"); L.push("");
    L.push("## "+S_.name.toUpperCase().replace(/^(\d+) · /,"SECTION $1: "));
    L.push("*"+S_.blurb+"*"); L.push("");
    if(S_.fields){
      L.push("| Attribute | Value |");
      L.push("| :--- | :--- |");
      S_.fields.forEach(function(f){
        L.push("| **"+f.l+"** | "+String(c.f[f.k]||"").replace(/\n+/g,"<br>").replace(/\|/g,"\\|")+" |");});
      L.push("");
    }
    if(S_.table==="cde"){
      L.push("### Critical Data Elements (CDEs) & Schema Specifications"); L.push("");
      L.push("| Field Name | Datatype | Nullable? | PII / Sensitive? | Semantic Glossary Binding | CDE Reference |");
      L.push("| :--- | :--- | :--- | :--- | :--- | :--- |");
      (c.cdes.length?c.cdes:[{field:"",type:"",nullable:"",pii:"",term:"",ref:""}]).forEach(function(r){
        L.push("| `"+r.field+"` | `"+r.type+"` | "+r.nullable+" | "+r.pii+" | "+r.term+" | `"+r.ref+"` |");});
      L.push("");
    }
    if(S_.table==="usability"){
      L.push("| Usability Characteristic | Score (1-5) | Required Evidence | Action to Improve |");
      L.push("| :--- | :--- | :--- | :--- |");
      USABILITY.forEach(function(u,j){ var v=c.usability[j]||{};
        L.push("| **"+(j+1)+". "+u[0]+"** | "+(v.score||"")+" | "+u[1]+" | "+String(v.action||"").replace(/\n+/g,"<br>")+" |");});
      L.push("");
    }
  });
  L.push("---"); L.push("");
  L.push("## LINKAGE TO THE AI EVALUATION FRAMEWORK"); L.push("");
  L.push("| Item | Value |"); L.push("| :--- | :--- |");
  L.push("| AI use case | `"+STATE.useCaseId+"` "+STATE.useCaseName+" |");
  L.push("| Decision supported | "+(((STATE.spine||{}).decision||{}).ids||[]).join(", ")+" |");
  L.push("| Benefit hypothesis | "+String(getF("benefit_hypothesis")).replace(/\n+/g,"<br>")+" |");
  var dfa=concernRollup("datafit");
  L.push("| Data, Semantic and Measurement Fitness | "+dfa.rag+" ("+dfa.total+" requirements: "+
    dfa.pass+" pass, "+(dfa.fail+dfa.stop)+" fail, "+dfa.open+" not yet measurable) |");
  var dfReqs=(STATE.requirements||[]).filter(function(r){return r.concern==="datafit";});
  var dfCrit=dfReqs.filter(function(r){return r.criticality==="Gate-critical";});
  L.push("| Gate-critical data requirements | "+(dfCrit.length?dfCrit.map(function(r){
    return "`"+r.id+"` "+r.title.replace(/\|/g,"/")+" ("+reqStatus(r).s+")";}).join("<br>"):"none")+" |");
  L.push("| Gate G1 (product binding) | "+((STATE.gates.filter(function(g){return g.id==="G1";})[0]||{}).status||"not set")+" |");
  L.push("| Gate G2 (semantic binding) | "+((STATE.gates.filter(function(g){return g.id==="G2";})[0]||{}).status||"not set")+" |");
  L.push("| Decision | "+STATE.decision.choice+" |");
  var g3=(STATE.lifecycle||{}).G3||{}, g4=(STATE.lifecycle||{}).G4||{};
  L.push("| Lifecycle G3 pre-deployment evidence acceptance | "+(g3.outcome||"no decision recorded")+" |");
  L.push("| Lifecycle G4 deployment authorisation | "+(g4.outcome||"no decision recorded")+" |");
  L.push("");
  L.push("> This canvas supplies a use case whose assurance is expressed as versioned Eval Requirements. "+
    "A data product that satisfies this canvas has not thereby satisfied those requirements: it has made them testable.");
  L.push("");
  return L.join("\n");
}
function exportMD(){
  if(!STATE.canvases.length){ alert("No canvas to export yet."); return; }
  var parts=STATE.canvases.map(function(c){return canvasMD(c);});
  var txt=noem(parts.join("\n\n<div style=\"page-break-after:always\"></div>\n\n"));
  download((STATE.useCaseId||"UC")+"_Data_Product_Canvas_"+STATE.session.date+".md",
    new Blob([txt],{type:"text/markdown"}));
}
function exportJSON(){
  download((STATE.useCaseId||"session")+"_AI_Eval_Session_"+STATE.session.date+".json",
    new Blob([JSON.stringify(STATE,null,2)],{type:"application/json"}));
}

/* ---------------- print pack ---------------- */
function printPack(){
  var s=STATE, sp=s.spine||{};
  function tbl(head,rows){ return '<div class="tbl-wrap"><table><thead><tr>'+head.map(function(h){return "<th>"+esc(h)+"</th>";}).join("")+
    '</tr></thead><tbody>'+rows.map(function(r){return "<tr>"+r.map(function(c){return "<td>"+String(c==null?"":c)+"</td>";}).join("")+"</tr>";}).join("")+
    '</tbody></table></div>'; }
  var h='<div class="panel"><h1 style="font-size:1.4rem">AI Evaluation Framework: evidence pack</h1>'+
    '<p><b>'+esc(s.company||MODEL.company)+'</b> &middot; <span class="mono">'+esc(s.useCaseId)+'</span> '+esc(s.useCaseName)+'<br>'+
    'Session '+esc(s.session.date)+' &middot; facilitator '+esc(s.session.facilitator||"not set")+' &middot; intensity '+esc(s.session.intensity)+
    ' &middot; source model <span class="mono">'+esc(s.modelFile||MODEL.file)+'</span></p>'+
    '<p><b>Decision:</b> '+esc(s.decision.choice)+'<br><b>Rationale:</b> '+esc(s.decision.rationale||"not set")+
    '<br><b>Conditions:</b> '+esc(s.decision.conditions||"not set")+
    '<br><b>Approver:</b> '+esc(s.decision.approver||"not set")+' &middot; review '+esc(s.decision.review||"not set")+'</p></div>';

  h+='<div class="panel"><h2>Problem, value and theory of change</h2>'+
    tbl(["Item","Value"],[
      ["Beneficiary",esc(getF("beneficiary"))],["Outcome",esc(getF("outcome_stmt"))],["KPI",esc(getF("kpi"))],
      ["Baseline",esc(getF("baseline"))],["Target",esc(getF("target"))],["Mechanism",esc(getF("mechanism"))],
      ["Benefit hypothesis",esc(getF("benefit_hypothesis"))],["No-AI alternative",esc(getF("no_ai"))],
      ["Value-for-money",esc(getF("vfm"))]])+'</div>';

  h+='<div class="panel"><h2>Decision specification and human control</h2>'+
    tbl(["Item","Value"],[
      ["Inputs",esc(getF("dec_inputs"))],["Permissible outputs",esc(getF("dec_outputs"))],
      ["Confidence threshold",esc(getF("dec_threshold"))],["Explanation",esc(getF("dec_explanation"))],
      ["Escalation",esc(getF("dec_escalation"))],["Override and appeal",esc(getF("dec_override"))],
      ["Who could be harmed",esc(getF("dec_harm"))],["Responsible AI owner",esc(getF("rai_owner"))]])+'</div>';

  h+='<div class="panel"><h2>Full spine traceability</h2>'+
    tbl(["Layer","ID","Element","Interpretation / action"],SPINE_LAYERS.map(function(L){
      var v=sp[L.k]||{ids:[],names:[]};
      return [esc(L.lay),'<span class="mono">'+esc(v.ids.join(", ")||"none")+'</span>',
        v.ids.length?esc(v.names.filter(Boolean).join(" · ")):'<span class="miss">not reachable, gap</span>',
        esc(s.fields["spine_"+L.k]||"")];}))+'</div>';

  var pass=0,fail=0,mis=0,crit=0;
  var evrows=s.evals.map(function(e){ var c=computeStatus(e.result,e.threshold), f=flagOf(e.recorded,c);
    if(c==="Pass")pass++; if(c==="Fail")fail++; if(f==="Mismatch")mis++; if(f==="Critical")crit++;
    return [esc(e.target),esc(e.evalName||e.category),esc(e.result),esc(e.threshold),esc(e.recorded),
      '<b>'+esc(c||"manual")+'</b>',esc(f||"none")];});
  h+='<div class="panel"><h2>AI eval register: recorded vs recomputed</h2>'+
    '<p>'+s.evals.length+' checks · '+pass+' computed pass · '+fail+' computed fail · '+mis+' mismatch · '+crit+' critical.</p>'+
    tbl(["Target","Check","Result","Threshold","Recorded","Computed","Flag"],evrows)+'</div>';

  /* Eval requirements */
  var reqs=s.requirements||[];
  var rk={pass:0,warn:0,fail:0,open:0,crit:0};
  reqs.forEach(function(r){ var x=reqStatus(r).s;
    if(x==="Pass"||x==="Satisfied")rk.pass++;
    else if(x==="Warn"||x==="Satisfied with reservation")rk.warn++;
    else if(x==="Fail"||x==="Stop"||x==="Not satisfied")rk.fail++;
    else rk.open++;
    if(r.criticality==="Gate-critical")rk.crit++;});
  h+='<div class="panel"><h2>Eval Requirements</h2>'+
    '<p>'+reqs.length+' requirements &middot; '+rk.pass+' computed pass &middot; '+rk.warn+' warning band &middot; '+
    rk.fail+' fail or stop &middot; '+rk.open+' not yet measurable &middot; '+rk.crit+' gate-critical. '+
    'Status is computed from the observed value, the operator, the threshold and the tolerance. '+
    'No Pass or Fail is stored anywhere in this pack.</p>'+
    tbl(["ID","Requirement","Concern","Source","Phase","Criticality","Operator and threshold","Computed","Basis","Owner"],
      reqs.map(function(r){ var st=reqStatus(r);
        return ['<span class="mono">'+esc(r.id)+'</span>',esc(r.title),
          concernName(r.concern)+'',
          esc(r.sourceArtefact+(r.sourceRecordId?" / "+r.sourceRecordId:"")),
          esc(phaseName(r.phase)),
          r.criticality==="Gate-critical"?'<b>'+esc(r.criticality)+'</b>':esc(r.criticality),
          esc((r.spec.operator||"")+" "+(r.spec.threshold||"")+(r.spec.tolerance?" ±"+r.spec.tolerance:"")),
          '<b>'+esc(st.s)+'</b>',esc(st.why||""),esc(r.ownerRole||"unassigned")];}))+'</div>';

  /* Assurance, derived */
  h+='<div class="panel"><h2>Assurance lenses and concerns</h2>'+
    '<p>Every status below is derived from the requirements filed under it. There is no manually entered rating in this '+
    'framework, because a score typed in by hand is an opinion detached from the underlying tests.</p>'+
    tbl(["Lens","Derived","Requirements","Owns"],LENSES.map(function(L){
      var a=lensRollup(L.id), o=s.pillarOwners[L.id]||{};
      return [L.name+'<div class="hint" style="margin:0">'+esc(o.owner||"no owner assigned")+'</div>',
        '<b>'+esc(a.rag)+'</b>',a.total,L.owns];}))+
    tbl(["Concern","Derived","Req","Pass","Fail or stop","Open","Finding","Owner"],CONCERNS.map(function(c){
      var a=concernRollup(c.id), at=(s.assurance||{})[c.id]||{};
      return [c.n+". "+c.name+'<div class="hint" style="margin:0">'+c.q+'</div>',
        '<b>'+esc(a.rag)+'</b>',a.total,a.pass,a.fail+a.stop,a.open,
        esc(at.finding||"")+(at.attest?'<div class="hint" style="margin:4px 0 0"><b>Attestation:</b> '+esc(at.attest)+'</div>':''),
        esc(at.owner||c.lead)];}))+'</div>';

  /* Governance lifecycle */
  h+='<div class="panel"><h2>Governance lifecycle, S1 to G6</h2>'+
    '<p>'+esc(LIFECYCLE_PRINCIPLE)+'</p>'+
    tbl(["Gate or stage","Kind","Purpose","Outcome","Decision maker","Date","Conditions","Blocking requirements"],
      LIFECYCLE.map(function(g){
        var d=(s.lifecycle||{})[g.id]||{}, bl=g.kind==="gate"?gateBlockers(g.id):[];
        return ['<b>'+g.id+'</b> '+esc(g.name),
          g.kind==="gate"?(g.hard?'<b>'+esc(g.hardNote||"HARD gate")+'</b>':"Gate"):(g.iterative?"Iterative stage":"Stage"),
          esc(g.purpose),
          d.outcome?'<b>'+esc(d.outcome)+'</b>':(g.kind==="gate"?'<span class="miss">no decision recorded</span>':""),
          esc(d.decisionMaker||""),esc(d.date||""),esc(d.conditions||""),
          bl.length?'<span class="miss">'+bl.map(function(r){return esc(r.id);}).join(", ")+'</span>':(g.kind==="gate"?"none":"")];}))+
    '<p style="margin-top:12px"><b>The six component gates below sit inside G2, G3 and G4.</b> They test whether this '+
    'component, in this configuration, meets criteria set for it. None of them decides whether the use case is '+
    'permissible, whether the spend was authorised, or what happens when the model, the data or the law changes.</p></div>';

  /* Legacy v1 */
  h+='<div class="panel"><h2>Legacy view: v1 four pillars and eight dimensions</h2>'+
    '<p>Superseded by the assurance lenses and concerns above, and retained so that earlier evaluations still resolve.</p>'+
    tbl(["v1 pillar","v1 dimension","RAG","Went to","Finding","Owner"],DIMENSIONS.map(function(d){
      var f=s.framework[d.id]||{}, p=PILLARS.filter(function(x){return x.id===d.pillar;})[0];
      var into=CONCERNS.filter(function(c){return (c.from||[]).indexOf(d.n)>=0;});
      var note=LEGACY_NOTES.filter(function(n){return n.n===d.n;})[0];
      var where=into.map(function(c){return "Concern "+c.n+", "+c.name;}).join(". ");
      if(note) where=(where?where+" ":"")+note.why;
      return [esc(p.name),esc(d.n+". "+d.name),esc(f.rag||"Not assessed"),where||"Retired",
        esc(f.finding||""),esc(f.owner||d.lead)];}))+'</div>';

  h+='<div class="panel"><h2>Remediation backlog</h2>'+
    tbl(["Priority","Action","Description","Lens","Status","Owner"],s.remediation.map(function(r){
      return [esc(r.priority),esc(r.action),esc(r.desc),esc(r.pillar),esc(r.status),esc(r.owner)];}))+'</div>';

  h+='<div class="panel"><h2>Component gates</h2>'+
    tbl(["Gate","Name","Pass criterion","Status","Owner","Evidence"],s.gates.map(function(g){
      return [esc(g.id),esc(g.name),esc(g.crit),'<b>'+esc(g.status)+'</b>',esc(g.owner||""),esc(g.evidence||"")];}))+'</div>';

  h+='<div class="panel"><h2>Data products</h2>'+
    tbl(["Product","Status","Purpose","Owner","Fields"],s.canvases.map(function(c){
      return [esc((c.productId||"PROPOSED")+" · "+(c.f.dp_name||"")),esc(c.f.dp_status||""),esc(c.f.purpose||""),
        esc(c.f.dp_owner||""),c.cdes.length];}))+'</div>';

  var ch=packChecks();
  h+='<div class="panel"><h2>Signed evidence checklist</h2>'+
    tbl(["","Item"],ch.map(function(c){return [c.ok?"&#10003;":"&#10007;",esc(c.t)];}))+
    '<p style="margin-top:14px">Signed: ______________________________  Date: ______________</p></div>';

  $("#printarea").innerHTML=h;
  $$(".view").forEach(function(v){v.classList.remove("printing");});
  $("#printarea").classList.add("printing");
  window.print();
  setTimeout(function(){ $("#printarea").classList.remove("printing"); },900);
}


/* =====================================================================
   INIT
   ===================================================================== */
function readModelFile(f){
  MODEL.file=f.name;
  var fr=new FileReader();
  fr.onload=function(e){
    try{ parseWorkbook(new Uint8Array(e.target.result)); }
    catch(err){ alert("Could not read that workbook: "+err.message); return; }
    renderLoadSummary(); renderUseCases();
    if(STATE.useCaseId && findRow("AIUseCase","AIUseCaseID",STATE.useCaseId)){ seedFromModelSoft(); }
    save();
  };
  fr.readAsArrayBuffer(f);
}
function seedFromModelSoft(){
  STATE.spine=resolveSpine(STATE.useCaseId);
  if(!STATE.evals.length) STATE.evals=evalRowsFor(STATE.useCaseId,STATE.spine);
  renderChosen(); ticks();
}
function bindSimple(id,get,set){
  var e=$(id); if(!e) return;
  e.value=get()||"";
  e.addEventListener("change",function(){ set(e.value); save(); });
}
function init(){
  STATE=load()||blankState();
  if(!STATE.fields)STATE.fields={};
  $("#appver").textContent="v"+APP_VERSION;

  $$(".tab").forEach(function(t){ t.addEventListener("click",function(){ showTab(t.dataset.tab); });});

  /* file inputs */
  $("#file-model").addEventListener("change",function(){ if(this.files[0]) readModelFile(this.files[0]); });
  var dz=$("#drop");
  dz.addEventListener("click",function(){ $("#file-model").click(); });
  ["dragenter","dragover"].forEach(function(ev){ dz.addEventListener(ev,function(e){
    e.preventDefault(); dz.classList.add("over"); });});
  ["dragleave","drop"].forEach(function(ev){ dz.addEventListener(ev,function(e){
    e.preventDefault(); dz.classList.remove("over"); });});
  dz.addEventListener("drop",function(e){ if(e.dataTransfer.files[0]) readModelFile(e.dataTransfer.files[0]); });

  $("#file-session").addEventListener("change",function(){
    var f=this.files[0]; if(!f) return;
    var fr=new FileReader();
    fr.onload=function(e){ try{ var st=JSON.parse(e.target.result);
      if(!st.version){ alert("That does not look like a session file."); return; }
      STATE=st; save();
      renderLoadSummary(); if(MODEL.loaded) renderUseCases();
      showTab("setup"); paintSession(); ticks();
      alert("Session restored. Re-open the FutureState workbook if you need to re-seed from the model.");
    }catch(err){ alert("Could not read that session file."); } };
    fr.readAsText(f);
  });
  $("#btn-save").addEventListener("click",exportJSON);

  /* setup fields */
  ["uc-filter","uc-theme","uc-phase"].forEach(function(id){
    $("#"+id).addEventListener("input",renderUseCases);
    $("#"+id).addEventListener("change",renderUseCases);});
  bindSimple("#s-date",  function(){return STATE.session.date;},  function(v){STATE.session.date=v;});
  bindSimple("#s-facil", function(){return STATE.session.facilitator;},function(v){STATE.session.facilitator=v;});
  bindSimple("#s-intensity",function(){return STATE.session.intensity;},function(v){STATE.session.intensity=v;});
  bindSimple("#s-tables",function(){return STATE.session.tables;},  function(v){STATE.session.tables=+v||4;});
  bindSimple("#s-parts", function(){return STATE.session.participants;},function(v){STATE.session.participants=+v||0;});
  bindSimple("#s-posture",function(){return STATE.session.posture;},function(v){STATE.session.posture=v;});
  bindSimple("#s-tablecomp",function(){return STATE.session.tableComp;},function(v){STATE.session.tableComp=v;});
  $("#btn-start").addEventListener("click",function(){
    if(!STATE.useCaseId){ alert("Select an AI use case first."); return; }
    showTab("session"); });
  $("#btn-reset").addEventListener("click",function(){
    if(!confirm("Clear the whole session? The loaded workbook stays.")) return;
    STATE=blankState(); save(); paintSession(); renderUseCases(); showTab("setup"); });

  /* spine */
  $("#btn-spine-reseed").addEventListener("click",function(){
    if(!MODEL.loaded){alert("Open the workbook first.");return;}
    STATE.spine=resolveSpine(STATE.useCaseId); save(); renderSpine(); });
  bindSimple("#lane-asis",function(){return STATE.lanes.asis;},function(v){STATE.lanes.asis=v;});
  bindSimple("#lane-prop",function(){return STATE.lanes.prop;},function(v){STATE.lanes.prop=v;});

  /* register */
  $("#btn-reg-reseed").addEventListener("click",function(){
    if(!MODEL.loaded){alert("Open the workbook first.");return;}
    if(!confirm("Replace the register with the checks recorded in the model?")) return;
    STATE.evals=evalRowsFor(STATE.useCaseId,STATE.spine); save(); renderRegister(); ticks(); });
  $("#btn-reg-add").addEventListener("click",function(){
    STATE.evals.push({id:uid("EV"),target:((STATE.spine.agent||{}).ids||[""])[0]||"",targetName:"",evalName:"",
      category:"",metric:"",threshold:"",method:"",freq:"",result:"",recorded:"",evidence:"",owner:""});
    save(); renderRegister(); });

  /* framework */

  /* remediation */
  $("#btn-rm-suggest").addEventListener("click",suggestRemediation);
  $("#btn-rm-add").addEventListener("click",function(){
    STATE.remediation.push({priority:"P1",action:"",desc:"",pillar:"",status:"Open",owner:""});
    save(); renderRemediation(); });

  /* gates */
  $("#btn-gt-add").addEventListener("click",function(){
    STATE.gates.push({id:"G"+(STATE.gates.length+1),name:"",crit:"",rule:"",status:"Open",owner:"",evidence:""});
    save(); renderGates(); });
  ["choice","rationale","conditions","approver","review"].forEach(function(k){
    var id="#dec-"+k;
    $(id).addEventListener("change",function(){ STATE.decision[k]=$(id).value; save(); renderAdvice(); });});

  /* canvas */
  $("#cv-select").addEventListener("change",function(){ STATE.activeCanvas=this.value; save(); renderCanvas(); });
  $("#btn-cv-add").addEventListener("click",function(){
    var c=newCanvasFromProduct(""); STATE.canvases.push(c); STATE.activeCanvas=c.id; save(); renderCanvas(); });
  $("#btn-cv-del").addEventListener("click",function(){
    var c=activeCanvas(); if(!c) return;
    if(!confirm("Delete the canvas for "+(c.f.dp_name||c.productId||"this product")+"?")) return;
    STATE.canvases=STATE.canvases.filter(function(x){return x.id!==c.id;});
    STATE.activeCanvas=STATE.canvases.length?STATE.canvases[0].id:""; save(); renderCanvas(); });

  /* requirements */
  $("#btn-rq-seed").addEventListener("click",doSeedRequirements);
  $("#btn-rq-add").addEventListener("click",addRequirement);
  $("#rq-concern").innerHTML='<option value="">All concerns</option>'+
    CONCERNS.map(function(c){return '<option value="'+c.id+'">'+c.n+". "+c.name+'</option>';}).join("");
  $("#rq-phase").innerHTML='<option value="">All phases</option>'+
    LIFECYCLE_PHASES.map(function(p){return '<option value="'+p.id+'">'+p.name+'</option>';}).join("");
  $("#rq-crit").innerHTML='<option value="">All</option>'+
    GATE_CRITICALITY.map(function(g){return '<option value="'+g+'">'+g+'</option>';}).join("");
  ["concern","phase","crit","status"].forEach(function(k){
    $("#rq-"+k).addEventListener("change",function(){ REQ_FILTER[k]=this.value; renderRequirements(); });});
  $("#rq-q").addEventListener("input",function(){ REQ_FILTER.q=this.value; renderRequirements(); });

  /* assurance */
  $("#as-onlyopen").addEventListener("change",renderAssurance);

  /* pack */
  $("#btn-x-xlsx").addEventListener("click",exportXLSX);
  $("#btn-x-md").addEventListener("click",exportMD);
  $("#btn-x-json").addEventListener("click",exportJSON);
  $("#btn-x-print").addEventListener("click",printPack);
  $("#btn-src-add").addEventListener("click",function(){
    STATE.sources.push({ref:"",src:"",use:""}); save(); renderPack(); });

  if(!isFacilitator()){ $("#btn-guide").style.display="none"; }
  if(isFacilitator()){
    document.body.classList.add("fac");
    $("#facbadge").style.display="";
    $("#btn-worked").style.display="";
    if(typeof loadWorkedExample==="function") $("#btn-worked").addEventListener("click",loadWorkedExample);
    else $("#btn-worked").style.display="none";
    $("#worked-note").innerHTML='<div class="notice amb" style="margin-top:12px"><b>Facilitator edition.</b> '+
      'This build carries the model answers for all eighteen steps and a fully worked AGGPSA U05 evaluation. '+
      'Do not distribute it to participants. The student edition is the same application with the answers removed.</div>';
  }
  paintSession(); ticks(); showTab("setup");
}
function paintSession(){
  $("#s-date").value=STATE.session.date||nowISO();
  $("#s-facil").value=STATE.session.facilitator||"";
  $("#s-intensity").value=STATE.session.intensity||"Standard";
  $("#s-tables").value=STATE.session.tables||4;
  $("#s-parts").value=STATE.session.participants||0;
  $("#s-posture").value=STATE.session.posture||"Unassessed";
  $("#s-tablecomp").value=STATE.session.tableComp||"";
  renderLoadSummary(); renderChosen();
}
document.addEventListener("DOMContentLoaded",init);
</script>
</body>
</html>
