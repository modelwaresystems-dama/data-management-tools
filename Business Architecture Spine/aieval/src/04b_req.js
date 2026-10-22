<script>
/* =====================================================================
   v2 ENGINE. Eval Requirement, Eval Specification, Eval Run and Result.

   Three rules hold this together and none of them may be relaxed:
     1. A requirement is generated from a claim, a risk, an obligation or
        an architecture anchor. It is never generated from a model.
     2. A specification is typed. Operator, threshold and tolerance are
        values, not prose.
     3. Status is computed at read time from the run's observed value.
        Nothing writes a Pass or a Fail into storage.
   ===================================================================== */

var REQ_SEQ = 0;
function nextReqId(uc){ REQ_SEQ++; return "EVR-"+(uc||"UC")+"-"+("00"+REQ_SEQ).slice(-3); }
function verId(){ return "v1.0"; }

function blankSpec(){
  return {
    metricId:"", construct:"", opDef:"", formula:"", unit:"", aggregation:"", slices:"",
    baseline:"", target:"", threshold:"", warn:"", stop:"", operator:">=", tolerance:"",
    confidence:"95%", ciMethod:"", minSample:"", power:"",
    datasetId:"", datasetVersion:"", scenarioSet:"", testCase:"", groundTruth:"", coverage:"",
    method:"", evaluatorType:"Automated metric", evaluatorId:"", rubricVersion:"",
    judgeModel:"", judgePrompt:"",
    environment:"", configVersion:"", toolVersion:"", seed:"", repetitions:"",
    evidenceType:"", evidenceAcceptance:"", retentionClass:"", evidenceUri:"",
    cadence:"", monitoringWindow:"", trigger:"", retestDeadline:"", status:"Draft"
  };
}

function blankReq(uc){
  return {
    id:nextReqId(uc), title:"", type:"Performance", version:verId(),
    sourceArtefact:"", sourceRecordId:"", sourceVersionId:"", sourceConditionId:"", sourceUri:"",
    useCaseId:uc||"", anchorType:"", anchorId:"", related:"",
    businessClaim:"", riskClaim:"", obligationClaim:"", assumptionId:"",
    systemId:"", componentType:"System", componentId:"", componentVersion:"", contextOfUse:"",
    behaviour:"", failureModeId:"", failureConsequence:"", stakeholderId:"", segmentId:"",
    lens:"business", concern:"purpose", evalType:"Business/outcome",
    phase:"design", criticality:"Gate-relevant",
    humanControlId:"", controlId:"", prohibited:"", fallback:"",
    ownerRole:"", reviewerRole:"", independence:"No", approval:"Draft",
    effectiveFrom:nowISO(), effectiveTo:"", supersedes:"", retestTrigger:"", retirement:"",
    spec:blankSpec(), runs:[], seeded:false
  };
}

/* ---- typed acceptance evaluation ------------------------------- */
/* Returns Pass, Warn, Fail, Stop or "" when the criterion is not numeric. */
function evalAcceptance(spec, value){
  var v = num(value);
  if(v===null) return {status:"", why:"No observed value."};
  var op = String(spec.operator||"").trim();
  var tol = num(spec.tolerance) || 0;
  function cmp(target, o){
    var t = num(target);
    if(t===null) return null;
    switch(o){
      case ">=": return v >= (t - tol);
      case "<=": return v <= (t + tol);
      case ">":  return v >  (t - tol);
      case "<":  return v <  (t + tol);
      case "=":  return Math.abs(v - t) <= tol;
      case "!=": return Math.abs(v - t) >  tol;
      default:   return null;
    }
  }
  /* range operator carries "lo-hi" in threshold */
  if(op==="range"){
    var p = parseThreshold(spec.threshold);
    if(p.op!=="range") return {status:"", why:"Range operator with no lo-hi threshold."};
    var inR = (v >= p.lo - tol && v <= p.hi + tol);
    return {status: inR?"Pass":"Fail",
            why: v+" against "+p.lo+" to "+p.hi+(tol?" with tolerance "+tol:"")};
  }
  /* stop threshold is checked first: it is the hard floor */
  if(String(spec.stop||"").trim()!==""){
    var stopBreached = cmp(spec.stop, op)===false;
    if(stopBreached) return {status:"Stop", why:v+" breaches the stop threshold "+spec.stop};
  }
  var main = cmp(spec.threshold, op);
  if(main===null) return {status:"", why:"Threshold is not numeric. Assess by rubric."};
  if(main) return {status:"Pass", why:v+" "+op+" "+spec.threshold+(tol?" (tolerance "+tol+")":"")};
  if(String(spec.warn||"").trim()!==""){
    var warnOk = cmp(spec.warn, op);
    if(warnOk) return {status:"Warn", why:v+" misses "+spec.threshold+" but holds the warning level "+spec.warn};
  }
  return {status:"Fail", why:v+" fails "+op+" "+spec.threshold+(tol?" (tolerance "+tol+")":"")};
}

/* latest run for a requirement, by ExecutedAt then insertion order */
function latestRun(req){
  if(!req.runs || !req.runs.length) return null;
  var best=null;
  req.runs.forEach(function(r){
    if(!best) { best=r; return; }
    if(String(r.executedAt||"") >= String(best.executedAt||"")) best=r;
  });
  return best;
}

/* the requirement's status, computed. Never stored. */
function reqStatus(req){
  var r = latestRun(req);
  if(!r) {
    if(req.spec.status==="Draft"||req.spec.status==="Proposed") return {s:"Unspecified", cls:"mut"};
    return {s:"Not run", cls:"mut"};
  }
  if(req.type==="Attestation" || String(req.spec.evaluatorType||"")==="Attestation"
     || String(req.spec.evaluatorType||"")==="Independent review"){
    var a = String(r.attestation||"").trim();
    if(!a) return {s:"Awaiting attestation", cls:"mut"};
    return {s:a, cls:(a==="Satisfied"?"ok":(a==="Satisfied with reservation"?"amb":"warn"))};
  }
  var e = evalAcceptance(req.spec, r.actual);
  if(!e.status) return {s:"Not computable", cls:"mut", why:e.why};
  var cls = e.status==="Pass"?"ok":(e.status==="Warn"?"amb":"warn");
  if(r.override && r.override.approved) {
    return {s:e.status, cls:cls, override:true, why:e.why};
  }
  return {s:e.status, cls:cls, why:e.why};
}

/* coverage of a concern: derived, not typed in by a facilitator */
function concernRollup(concernId){
  var reqs = (STATE.requirements||[]).filter(function(r){return r.concern===concernId;});
  var out = {total:reqs.length, pass:0, warn:0, fail:0, stop:0, open:0, critical:0, attest:0};
  reqs.forEach(function(r){
    var st = reqStatus(r).s;
    if(st==="Pass"||st==="Satisfied") out.pass++;
    else if(st==="Warn"||st==="Satisfied with reservation") out.warn++;
    else if(st==="Fail"||st==="Not satisfied") out.fail++;
    else if(st==="Stop") out.stop++;
    else out.open++;
    if(r.criticality==="Gate-critical" && (st==="Fail"||st==="Stop")) out.critical++;
    if(r.type==="Attestation") out.attest++;
  });
  out.rag = out.total===0 ? "Not assessed"
          : (out.stop||out.critical||out.fail) ? "Red"
          : out.open===out.total ? "Unevidenced"
          : (out.warn||out.open) ? "Amber"
          : "Green";
  return out;
}

function lensRollup(lensId){
  var cs = CONCERNS.filter(function(c){return c.lens===lensId;});
  var agg = {total:0,pass:0,warn:0,fail:0,stop:0,open:0,critical:0};
  cs.forEach(function(c){ var r=concernRollup(c.id);
    ["total","pass","warn","fail","stop","open","critical"].forEach(function(k){agg[k]+=r[k];}); });
  agg.rag = agg.total===0 ? "Not assessed"
          : (agg.stop||agg.critical||agg.fail) ? "Red"
          : agg.open===agg.total ? "Unevidenced"
          : (agg.warn||agg.open) ? "Amber" : "Green";
  return agg;
}

/* =====================================================================
   SEEDING. Requirements are generated from upstream authoritative facts.
   Each seeded requirement records where it came from so that the source
   owner, not the eval, remains authoritative for the fact.
   ===================================================================== */

function seedRequirements(ucId, spine, opts){
  opts = opts || {};
  var made = [], seen = {};
  (STATE.requirements||[]).forEach(function(r){ if(r.sourceRecordId) seen[r.sourceArtefact+"|"+r.sourceRecordId+"|"+(r.sourceConditionId||"")+"|"+r.type]=1; });

  function add(o){
    var key = o.sourceArtefact+"|"+(o.sourceRecordId||"")+"|"+(o.sourceConditionId||"")+"|"+(o.type||"Performance");
    if(seen[key]) return null;
    seen[key]=1;
    var r = blankReq(ucId);
    for(var k in o){ if(k!=="spec") r[k]=o[k]; }
    if(o.spec) for(var s in o.spec) r.spec[s]=o.spec[s];
    r.seeded = true;
    made.push(r);
    return r;
  }

  var ucName = STATE.useCaseName||"";

  /* ---- 1. The Ethical Assessment Review. ------------------------------
     The EAR is authoritative for ethical determination. Requirements are
     generated from the seven domain assessments, because that is where the
     harm, the mitigation, the affected group and the continue criterion
     actually live. The Conditions field on the verdict carries one
     placeholder string on every row in the current model, so it is used as
     supporting text and never as the condition itself. ------------------- */
  var earVerdict = findRow("StewardshipDecision","ObjectID",ucId) || {};
  var earTier    = cell(earVerdict.ImpactTier);     /* present once the EAR has written back */
  var earApprover= cell(earVerdict.ApprovedBy);
  var earTrace   = findRow("StewardshipTraceability","UseCaseID",ucId) || {};
  var earCond    = cell(earVerdict.Conditions);
  var earForum   = cell(earVerdict.ApproverForum)||"Ethical Stewardship Council";
  var earDec     = cell(earVerdict.Decision);

  /* criticality follows the EAR impact tier where the EAR has set one */
  var tierCrit = /full/i.test(earTier) ? "Gate-critical"
               : /short/i.test(earTier) ? "Gate-critical"
               : /out of scope/i.test(earTier) ? "Informational"
               : "Gate-critical";

  EAR_DOMAINS.forEach(function(D){
    var row = findRow(D.sheet, "ObjectID", ucId);
    if(!row) return;
    var id = String(row[D.idf]||(D.k.toUpperCase()+"-"+ucId));
    var na = cell(row.NA).toLowerCase();
    var isNA = (na==="true"||na==="yes"||na==="1");
    var naWhy = cell(row.NAReason);
    var assessedBy = cell(row.AssessedBy);
    var harm = D.harmF ? cell(row[D.harmF]) : "";
    var mit  = D.mitF  ? cell(row[D.mitF])  : "";
    var claim= cell(row[D.claimF]) || (D.altClaimF?cell(row[D.altClaimF]):"");
    var cont = D.contF ? cell(row[D.contF]) : "";
    var appeal = D.appealF ? cell(row[D.appealF]) : "";
    var seg  = (D.segF && row[D.segF]) || (D.groupF && row[D.groupF]) || "";
    var c = CONCERNS.filter(function(x){return x.id===D.concern;})[0];

    add({title:"["+id+"] "+D.name+": "+D.behaviour,
      type:(isNA?"Attestation":D.type),
      sourceArtefact:"Ethical Assessment Review", sourceRecordId:id, sourceConditionId:id,
      useCaseId:ucId, anchorType:"AI Use Case", anchorId:ucId,
      businessClaim:claim,
      riskClaim:(harm||(isNA?("Marked not applicable: "+(naWhy||"no reason recorded.")):"")),
      obligationClaim:(mit?("Mitigation on the record: "+mit+"."):"")+
        (cont?(" Continue criteria: "+cont+"."):"")+
        (appeal?(" Appeal route: "+appeal+"."):"")+
        (earCond?(" Verdict conditions: "+earCond+"."):""),
      behaviour:D.behaviour+" "+D.why,
      failureConsequence:(harm?("The harm the EAR recorded occurs undetected: "+harm):
        "The domain the EAR assessed is never re-tested after approval."),
      stakeholderId:String((D.stakeF&&row[D.stakeF])||earTrace.StakeholderID||""),
      segmentId:String(seg||""),
      controlId:cell(earTrace.ControlID),
      fallback:(D.altF?String(row[D.altF]||""):""),
      lens:(c?c.lens:D.lens), concern:D.concern,
      evalType:(D.type==="Attestation"?"Governance/control":
                D.type==="Monitoring trigger"?"Operational/monitoring":"Business/outcome"),
      phase:(D.type==="Monitoring trigger"?"monitor":(D.type==="Outcome"?"predeploy":"design")),
      criticality:(isNA?"Informational":tierCrit),
      ownerRole:String((D.ownerF&&row[D.ownerF])||assessedBy||earForum),
      reviewerRole:"Ethical Reviewer", independence:"Yes",
      approval:(earApprover?"Approved":"Proposed"),
      retestTrigger:"New affected group; incident; monitoring breach of continue criteria; population shift",
      retirement:(isNA?("Marked not applicable at this review depth. "+naWhy):""),
      spec:{construct:D.name+" holds for "+ucId,
            opDef:(isNA?
              "Not required at this review depth. It is not closed: it stays here with the reason it was dropped, and assessing it anyway needs a written basis in a named person's name.":
              D.behaviour),
            evaluatorType:(D.type==="Performance"?"Automated metric":
                           D.type==="Outcome"?"Observational study":"Attestation"),
            evidenceType:"Ethical review record",
            evidenceUri:cell(earTrace.EvidenceID)||cell(earVerdict.EvidenceID),
            trigger:cont||"", cadence:(D.type==="Monitoring trigger"?"Continuous":"Per release"),
            status:"Draft"}});
  });

  /* the verdict itself, and the sign-off that is missing on every AGGPSA row */
  if(earVerdict.StewardshipDecisionID){
    var sdid=cell(earVerdict.StewardshipDecisionID);
    var r0 = add({title:"["+sdid+"] The ethical verdict is signed off by an accountable owner",
      type:"Attestation",
      sourceArtefact:"Ethical Assessment Review", sourceRecordId:sdid, sourceConditionId:sdid,
      useCaseId:ucId, anchorType:"AI Use Case", anchorId:ucId,
      obligationClaim:"Verdict recorded: "+(earDec||"not recorded")+
        ". Approver forum: "+earForum+". "+
        "The reviewer records the verdict and the accountable owner signs it off. "+
        "They are never the same person, and neither of them may be the assessor.",
      riskClaim:"An unsigned verdict is a recommendation, not a determination. "+
        "It cannot carry an admissibility gate.",
      behaviour:"A named accountable owner has signed this verdict, and is not the person who recorded it.",
      failureConsequence:"G0 admissibility cannot be recorded, because the ethical determination is unsigned.",
      lens:"records", concern:"accountability", evalType:"Governance/control",
      phase:"intake", criticality:"Gate-critical",
      ownerRole:earForum, reviewerRole:"Accountable owner", independence:"Yes",
      approval:(earApprover?"Approved":"Draft"),
      supersedes:cell(earVerdict.SupersededBy),
      spec:{construct:"Signed ethical determination",
            opDef:"ApprovedBy and ApprovedOn are both present on the stewardship decision, and ApprovedBy is not the recording reviewer.",
            evaluatorType:"Attestation", evidenceType:"Signed verdict record",
            evidenceUri:cell(earVerdict.EvidenceID),
            status:(earApprover?"Measured":"Draft")}});
    if(r0 && earApprover){
      r0.runs.push({id:uid("RUN"),executedAt:cell(earVerdict.ApprovedOn)||nowISO(),actual:"",
        numerator:"",denominator:"",ciLow:"",ciHigh:"",sample:"",coverage:"",agreement:"",
        evidenceId:cell(earVerdict.EvidenceID),hash:"",environment:"",
        attestation:"Satisfied",
        note:"Signed off by "+earApprover+(earVerdict.ApprovedOn?(" on "+earVerdict.ApprovedOn):"")+".",
        override:null});
    }
  }

  /* evidence integrity, exactly as the EAR tests it: four booleans, all must hold */
  var earEv = findRow("StewardshipEvidence","ObjectID",ucId);
  if(earEv){
    var evid=cell(earEv.EvidenceID);
    var present = EAR_EVIDENCE_TESTS.filter(function(t){
      var v=cell(earEv[t]).toLowerCase();
      return v==="true"||v==="yes"||v==="1"; });
    var tested = EAR_EVIDENCE_TESTS.filter(function(t){ return cell(earEv[t])!==""; });
    var rE = add({title:"["+evid+"] The ethical evidence record is dated, attributed, owned and locatable",
      type:"Control effectiveness",
      sourceArtefact:"Ethical Assessment Review", sourceRecordId:evid,
      useCaseId:ucId, anchorType:"Records / Evidence", anchorId:evid,
      obligationClaim:"Evidence must be dated, attributed, owned and locatable. "+
        "Four separate tests, because an evidence record can fail any one of them on its own.",
      riskClaim:"A claim that cannot be reconstructed is not assurance, whatever the register says.",
      behaviour:"All four evidence-integrity tests hold on "+evid+".",
      failureConsequence:"The assurance claim resting on this evidence is prohibited.",
      lens:"records", concern:"accountability", evalType:"Evidence-quality",
      phase:"predeploy", criticality:"Gate-critical",
      ownerRole:cell(earEv.AssessedBy)||earForum, reviewerRole:"Records owner", independence:"Yes",
      approval:"Proposed",
      retestTrigger:"Scheduled cadence; incident",
      spec:{metricId:evid, construct:"Evidence integrity",
            opDef:"Count of the four tests that hold: "+EAR_EVIDENCE_TESTS.join(", ")+".",
            unit:"tests", operator:"=", threshold:"4", stop:"3",
            evaluatorType:"Independent review",
            evidenceType:cell(earEv.EvidenceType)||"Ethical review record",
            evidenceUri:cell(earEv.Repository),
            cadence:"Per release",
            status:(tested.length?"Measured":"Draft")}});
    if(rE && tested.length){
      rE.runs.push({id:uid("RUN"),executedAt:cell(earEv.AssessedOn)||nowISO(),
        actual:String(present.length),numerator:String(present.length),denominator:"4",
        ciLow:"",ciHigh:"",sample:"4",coverage:String(tested.length)+" of 4 tested",
        agreement:"",evidenceId:evid,hash:"",environment:"",attestation:"",
        note:"Holding: "+(present.join(", ")||"none")+". Not holding or not tested: "+
             EAR_EVIDENCE_TESTS.filter(function(t){return present.indexOf(t)<0;}).join(", ")+".",
        override:null});
    }
  }

  /* stewardship monitoring: an acceptance criterion and a last observation
     are a specification and a run, so they are imported as both */
  S("StewardshipMonitoring").filter(function(r){return String(r.ObjectID||"").trim()===ucId;})
  .forEach(function(mon){
    var mid=cell(mon.MonitorID);
    var metric=findRow("StewardshipMetric","MetricID",cell(mon.MetricID)) || {};
    var accept=cell(mon.AcceptanceCriterion)||cell(metric.Target)||cell(mon.Threshold);
    var p=parseThreshold(accept);
    var op=p.op==="range"?"range":(p.op==="manual"?"":p.op);
    var th=p.op==="range"?(p.lo+"-"+p.hi):(p.op==="manual"?"":String(p.v));
    var last=cell(mon.LastObserved);
    var rM = add({title:"["+mid+"] "+(cell(metric.Name)||cell(mon.MetricID)||"Stewardship monitor")+
        " stays within its acceptance criterion",
      type:"Monitoring trigger",
      sourceArtefact:"Ethical Assessment Review", sourceRecordId:mid,
      useCaseId:ucId, anchorType:"AI Use Case", anchorId:ucId,
      riskClaim:cell(metric.Definition)||"The ethical risk this monitor exists to catch recurs undetected.",
      obligationClaim:"On breach: "+cell(mon.Action)||"review and escalate"+".",
      behaviour:"The monitored value holds its acceptance criterion in production.",
      failureConsequence:"Breach of a continue criterion fires G5 triggered change and revalidation.",
      lens:"decision", concern:"safety", evalType:"Operational/monitoring",
      phase:"monitor", criticality:"Gate-critical",
      ownerRole:cell(mon.AlertOwner)||cell(metric.OwnerRoleID),
      reviewerRole:"Ethical Reviewer", independence:"Yes", approval:"Proposed",
      retestTrigger:"Monitoring breach of continue criteria; scheduled cadence",
      spec:{metricId:cell(mon.MetricID), construct:cell(metric.Name),
            opDef:cell(metric.Definition), target:cell(metric.Target),
            operator:op||"<=", threshold:th,
            evaluatorType:"Automated metric", evidenceType:"Monitoring record",
            trigger:accept, cadence:"Continuous", monitoringWindow:"",
            status:(last!==""?"Measured":(op?"Approved":"Draft"))}});
    if(rM && last!==""){
      rM.runs.push({id:uid("RUN"),executedAt:nowISO(),actual:last,
        numerator:"",denominator:"",ciLow:"",ciHigh:"",sample:"",coverage:"",agreement:"",
        evidenceId:"",hash:"",environment:"production",attestation:"",
        note:"Last observed value carried across from the stewardship monitoring record.",
        override:null});
    }
  });

  /* ---- 2. Stewardship exceptions. A lapsed exception is a stop, not a warning. ---- */
  S("StewardshipException").filter(function(r){return String(r.ObjectID||"").trim()===ucId;})
  .forEach(function(ex){
    var id=cell(ex.ExceptionID);
    var status=cell(ex.Status).toLowerCase();
    var expiry=cell(ex.Expiry);
    var lapsed = status==="lapsed" || (!status && expiry && expiry < nowISO());
    var rX = add({title:"["+id+"] Compensating control holds, and the exception has not lapsed",
      type:"Control effectiveness",
      sourceArtefact:"Ethical Assessment Review", sourceRecordId:id, sourceConditionId:id,
      useCaseId:ucId, anchorType:"AI Use Case", anchorId:ucId,
      obligationClaim:cell(ex.Reason)+
        " Compensating control: "+cell(ex.CompensatingControl)||"none recorded"+".",
      riskClaim:"The exception outlives its expiry and the compensating control is never tested. "+
        EAR_SUSPENSION_RULE,
      behaviour:"The exception is live, in date, and its compensating control is operating.",
      failureConsequence:"A lapsed exception withdraws approval automatically and outranks sign-off. "+
        "The use case opens suspended.",
      lens:"records", concern:"accountability", evalType:"Governance/control",
      phase:"monitor", criticality:"Gate-critical",
      ownerRole:cell(ex.Approver), reviewerRole:"Sponsor", independence:"Yes",
      approval:"Proposed", effectiveTo:expiry,
      supersedes:cell(ex.RenewalOfID),
      retirement:"Exception expires "+expiry+". An exception has no extend control: renewal creates a "+
        "new exception linked by RenewalOfID and supersedes this one.",
      retestTrigger:"Scheduled cadence; incident",
      spec:{construct:"Exception currency and compensating-control effectiveness",
            opDef:"Days remaining before expiry. Zero or fewer is a suspension, not a warning.",
            unit:"days", operator:">=", threshold:"1", stop:"0",
            evaluatorType:"Attestation", evidenceType:"Exception record",
            trigger:"Exception expiry "+expiry, cadence:"Monthly",
            status:(expiry?"Measured":"Draft")}});
    if(rX && expiry){
      var days = Math.round((new Date(expiry) - new Date(nowISO()))/86400000);
      rX.runs.push({id:uid("RUN"),executedAt:nowISO(),actual:String(days),
        numerator:"",denominator:"",ciLow:"",ciHigh:"",sample:"",coverage:"",agreement:"",
        evidenceId:"",hash:"",environment:"",attestation:"",
        note:(lapsed?
          "LAPSED on "+expiry+". Approval is withdrawn automatically and this use case is suspended.":
          "Expires "+expiry+", "+days+" days remaining."),
        override:null});
    }
  });

  /* ---- 3. Risk register. A risk claim is a requirement, not a note. ---- */
  S("RiskRegister").filter(function(r){return String(r.ObjectID||"").trim()===ucId;})
  .forEach(function(rk){
    var id=cell(rk.RiskID);
    var ctl=cell(rk.MitigationControlID);
    add({title:"["+id+"] Mitigation is effective: "+cell(rk.RiskType)+" risk", type:"Control effectiveness",
      sourceArtefact:"Risk Register", sourceRecordId:id,
      useCaseId:ucId, anchorType:"AI Use Case", anchorId:ucId,
      riskClaim:cell(rk.Description),
      failureConsequence:"Likelihood "+cell(rk.Likelihood)+", impact "+cell(rk.Impact)+".",
      controlId:ctl,
      lens:"records", concern:"accountability", evalType:"Governance/control",
      phase:"predeploy", criticality:(cell(rk.Impact)==="High"?"Gate-critical":"Gate-relevant"),
      ownerRole:cell(rk.OwnerRoleID), approval:"Proposed",
      retestTrigger:"Incident; population shift; supplier change",
      spec:{method:"Control operating-effectiveness test", evaluatorType:"Independent review",
            evidenceType:"Test result", cadence:"Per release", status:"Draft"}});
  });

  /* ---- 4. Controls bound to the use case, with their policy rules,
     prohibitions, obligations and any control test that has been run. ---- */
  /* controls reach this use case three ways: bound to the use case directly,
     named on the EAR traceability row, or governing the decision it supports */
  var decIds = (spine && spine.decision && spine.decision.ids) || [];
  var ctlIds = {};
  S("AIUseCase_Control_Map").filter(function(r){return String(r.AIUseCaseID||"").trim()===ucId;})
    .forEach(function(m){ var c=cell(m.ControlID); if(c) ctlIds[c]={id:c,via:"bound to the use case",rel:cell(m.Relationship)}; });
  if(cell(earTrace.ControlID)) ctlIds[cell(earTrace.ControlID)]=
    {id:cell(earTrace.ControlID),via:"named on the EAR traceability row",rel:"governs the ethical determination"};
  S("BusinessPolicyControl").forEach(function(c){
    var g=cell(c.GovernsDecisionID); if(!g) return;
    if(decIds.indexOf(g)<0) return;
    var id=cell(c.ControlID); if(!id) return;
    if(!ctlIds[id]) ctlIds[id]={id:id,via:"governs decision "+g+", which this use case supports",rel:"governs"};
  });
  Object.keys(ctlIds).map(function(k){return ctlIds[k];})
  .forEach(function(m){
    var cid=m.id;
    var c=findRow("BusinessPolicyControl","ControlID",cid) ||
          findRow("Standard_Control","ControlID",cid) ||
          findRow("PolicyControl","ControlID",cid) || {};
    var polId=cell(c.PolicyID)||cell(c.GoverningPolicyID);
    var pol=polId?findRow("Policy","PolicyID",polId):null;

    /* every rule under the same policy, split into what is forbidden and what is owed */
    var rules=polId?S("PolicyRule").filter(function(r){return String(r.PolicyID||"")===polId;}):[];
    var prohib=rules.filter(function(r){return /prohibit/i.test(String(r.RuleType||""));});
    var oblig =rules.filter(function(r){return /obligat/i.test(String(r.RuleType||""));});
    var extraProhib=polId?S("Prohibition").filter(function(r){return String(r.PolicyID||"")===polId;}):[];
    var extraOblig =polId?S("Obligation").filter(function(r){return String(r.PolicyID||"")===polId;}):[];

    var prohibText=prohib.map(function(r){
        return String(r.NaturalLanguageRule||"")+" ("+String(r.RuleID||"")+", severity "+
               String(r.Severity||"")+", effect "+String(r.DecisionEffect||"")+")";})
      .concat(extraProhib.map(function(r){
        return String(r.ProhibitedAction||"")+" ("+String(r.ProhibitionID||"")+", "+
               String(r.Condition||"")+", enforcement "+String(r.EnforcementAction||"")+")";}))
      .join(" ");
    var obligText=oblig.map(function(r){
        return String(r.NaturalLanguageRule||"")+" ("+String(r.RuleID||"")+")";})
      .concat(extraOblig.map(function(r){
        return String(r.ActionRequired||"")+" ("+String(r.ObligationID||"")+", "+
               String(r.Timing||"")+", evidence: "+String(r.EvidenceRequired||"")+")";}))
      .join(" ");

    /* a control test compares an expected decision with an actual one.
       That is already the v2 pattern, so it is imported as a run. */
    var tests=rules.length?S("ControlTest").filter(function(t){
      return rules.some(function(r){return String(r.RuleID||"")===String(t.RuleID||"");});}):[];
    var matched=tests.filter(function(t){
      return String(t.ExpectedDecision||"")===String(t.ActualDecision||"");});
    var sev=prohib.concat(oblig).map(function(r){return String(r.Severity||"");});
    var crit=(sev.indexOf("Critical")>=0)?"Gate-critical":"Gate-relevant";

    var rC = add({title:"["+cid+"] "+(c.ControlName||"Control")+" operates as designed",
      type:"Control effectiveness",
      sourceArtefact:"Business / Policy Control", sourceRecordId:cid,
      sourceVersionId:polId,
      useCaseId:ucId, anchorType:"Governance / Controls", anchorId:cid,
      controlId:cid,
      obligationClaim:("Reaches this use case because it is "+m.via+". "+
        cell(c.Objective||c.ControlActivity||c.ControlObjective)+
        (obligText?(" Obligations under "+polId+": "+obligText):"")),
      prohibited:prohibText,
      riskClaim:(pol?String(pol.Statement||""):"")||
        "The control is assumed to operate because it is documented.",
      behaviour:"The control decides consistently, and the prohibited outcomes stay prohibited.",
      failureConsequence:"A documented control that has never been tested is a claim, not an assurance.",
      humanControlId:cell(c.GovernsDecisionID),
      lens:"records", concern:"accountability", evalType:"Governance/control",
      phase:"predeploy", criticality:crit,
      ownerRole:String(c.OwnerRole||c.AccountableRoleID||""),
      reviewerRole:"Internal audit", independence:"Yes", approval:"Proposed",
      retestTrigger:"Legal or regulatory change; scheduled cadence",
      spec:{metricId:cid,
            construct:"Control operating effectiveness",
            opDef:(tests.length?
              "Count of control tests whose actual decision equals the expected decision.":
              "Design and operating effectiveness, assessed by independent review."),
            unit:(tests.length?"tests":""), aggregation:(tests.length?"count":""),
            operator:(tests.length?"=":">="),
            threshold:(tests.length?String(tests.length):""),
            stop:(tests.length?String(Math.max(0,tests.length-1)):""),
            method:"Design and operating effectiveness",
            evaluatorType:(tests.length?"Automated metric":"Independent review"),
            evidenceType:String(c.Evidence||c.EvidenceType||c.MinimumEvidence||"Review record"),
            cadence:cell(c.Frequency),
            status:(tests.length?"Measured":"Draft")}});

    if(rC && tests.length){
      rC.runs.push({id:uid("RUN"),executedAt:nowISO(),actual:String(matched.length),
        numerator:String(matched.length),denominator:String(tests.length),
        ciLow:"",ciHigh:"",sample:String(tests.length),coverage:tests.length+" rule test(s)",
        agreement:"",evidenceId:"",hash:"",environment:"",attestation:"",
        note:"Control tests: "+tests.map(function(t){
          return String(t.TestID||"")+" "+String(t.RuleID||"")+" expected "+
                 String(t.ExpectedDecision||"")+", actual "+String(t.ActualDecision||"");}).join("; ")+".",
        override:null});
    }
  });

  /* ---- 4b. Stewardship metrics carry real typed targets, unlike EvalMetric. ---- */
  var seenMetric={};
  S("StewardshipMonitoring").filter(function(r){return String(r.ObjectID||"").trim()===ucId;})
  .forEach(function(mon){ seenMetric[cell(mon.MetricID)]=1; });
  S("StewardshipMetric").forEach(function(mt){
    var mid=cell(mt.MetricID);
    if(seenMetric[mid]) return;           /* already carried by a monitor above */
    if(!/equity|harm|inclusion|complaint/i.test(mid+" "+cell(mt.Type)+" "+cell(mt.Name))) return;
    var p=parseThreshold(cell(mt.Target));
    var op=p.op==="range"?"range":(p.op==="manual"?"":p.op);
    var th=p.op==="range"?(p.lo+"-"+p.hi):(p.op==="manual"?"":String(p.v));
    add({title:"["+mid+"] "+String(mt.Name||"Stewardship metric")+" holds its target",
      type:"Performance",
      sourceArtefact:"Ethical Assessment Review", sourceRecordId:mid,
      useCaseId:ucId, anchorType:"Stakeholder", anchorId:"",
      riskClaim:cell(mt.Definition),
      behaviour:"The portfolio-level stewardship metric holds while this use case is running.",
      failureConsequence:"A breach here is a Council matter, not a model matter.",
      lens:"decision", concern:"safety", evalType:"Decision/human-control",
      phase:"monitor", criticality:"Gate-relevant",
      ownerRole:cell(mt.OwnerRoleID), reviewerRole:"Ethical Reviewer",
      independence:"Yes", approval:"Proposed",
      retestTrigger:"Monitoring breach of continue criteria; scheduled cadence",
      spec:{metricId:mid, construct:cell(mt.Name), opDef:cell(mt.Definition),
            target:cell(mt.Target), operator:op||"<=", threshold:th,
            evaluatorType:"Automated metric", evidenceType:"Monitoring record",
            cadence:"Quarterly",
            status:(op?"Approved":"Draft")}});
  });

  /* ---- 4c. Data-quality scorecards. A target plus an observed score is a
     specification plus a run, so both are imported and the status is computed
     here rather than read from the RAG the scorecard already carries. ---- */
  var dpIds = (spine && spine.dataproduct && spine.dataproduct.ids) || [];
  dpIds.forEach(function(dp){
    var ctl = findRow("DataProductDQControl","DataProductID",dp) || {};
    S("DataProductDQScorecard").filter(function(r){return cell(r.DataProductID)===dp;})
    .forEach(function(sc){
      var dim=cell(sc.Dimension);
      var tgt=cell(sc.Target), score=cell(sc.Score);
      var p=parseThreshold(tgt);
      var op=p.op==="range"?"range":(p.op==="manual"?"":p.op);
      var th=p.op==="range"?(p.lo+"-"+p.hi):(p.op==="manual"?"":String(p.v));
      var rD = add({title:"["+dp+"] "+dim+" of "+cell(sc.DataProductName)+" meets its target",
        type:"Performance",
        sourceArtefact:"Data / Semantic artefacts", sourceRecordId:dp+"-"+dim,
        sourceVersionId:cell(sc.GoverningPolicyID),
        useCaseId:ucId, anchorType:"Data Product / CDE", anchorId:dp,
        componentType:"Data product", componentId:dp,
        businessClaim:"The use case may rely on "+dp+" for this decision.",
        riskClaim:"An input that misses its quality target moves the decision without anyone noticing, "+
          "because the model does not degrade, it simply becomes confidently wrong.",
        behaviour:dim+" of "+dp+" holds "+(tgt||"its target")+".",
        failureConsequence:"Blocks deployment. A data-quality miss on a governed input is a G2 and G3 matter.",
        controlId:cell(ctl.DQControlID),
        lens:"data", concern:"datafit", evalType:"Data/semantic/privacy",
        phase:"predeploy",
        criticality:(/accuracy|completeness|validity/i.test(dim)?"Gate-critical":"Gate-relevant"),
        ownerRole:cell(ctl.OwnerRole), reviewerRole:"Data steward", independence:"No",
        approval:"Proposed",
        retestTrigger:"New data product or semantic definition; scheduled cadence",
        spec:{metricId:dp+"-"+dim, construct:dim,
              opDef:cell(ctl.ControlActivity)||("Automated data-quality profiling of "+dim+" on "+dp+"."),
              unit:"%", target:tgt, operator:op||">=", threshold:th,
              method:"Automated DQ profiling", evaluatorType:"Automated metric",
              evidenceType:"Data-quality scorecard", evidenceUri:cell(ctl.EvidenceID),
              cadence:cell(ctl.Frequency)||"Monthly",
              status:(score!==""?"Measured":(op?"Approved":"Draft"))}});
      if(rD && score!==""){
        rD.runs.push({id:uid("RUN"),executedAt:nowISO(),actual:score,
          numerator:"",denominator:"",ciLow:"",ciHigh:"",sample:"",coverage:"",agreement:"",
          evidenceId:cell(ctl.EvidenceID),hash:"",environment:"",attestation:"",
          note:"Scorecard reads "+score+" against "+(tgt||"no target")+
               ", recorded RAG "+(cell(sc.RAG)||"none")+", trend "+(cell(sc.Trend)||"none")+
               ". The RAG is not carried across: the status here is computed.",
          override:null});
      }
    });
    /* the product-level DQ control itself */
    if(ctl.DQControlID){
      var overall=cell(ctl.OverallScore);
      var rO = add({title:"["+dp+"] Data-quality control operates across all dimensions",
        type:"Control effectiveness",
        sourceArtefact:"Data / Semantic artefacts", sourceRecordId:cell(ctl.DQControlID),
        useCaseId:ucId, anchorType:"Data Product / CDE", anchorId:dp,
        componentType:"Data product", componentId:dp,
        obligationClaim:cell(ctl.ControlObjective),
        riskClaim:"A composite score hides a single failing dimension, which is the one that will "+
          "move the decision.",
        behaviour:"Every dimension on the scorecard holds, not merely the composite.",
        failureConsequence:"Block deployment on the affected input.",
        controlId:cell(ctl.DQControlID),
        lens:"data", concern:"datafit", evalType:"Data/semantic/privacy",
        phase:"monitor", criticality:"Gate-relevant",
        ownerRole:cell(ctl.OwnerRole), reviewerRole:"Data steward", approval:"Proposed",
        retestTrigger:"Scheduled cadence; new data product or semantic definition",
        spec:{metricId:cell(ctl.DQControlID), construct:"Composite data quality",
              opDef:cell(ctl.ControlActivity), unit:"%", operator:">=", threshold:"98",
              method:"Automated DQ profiling", evaluatorType:"Automated metric",
              evidenceType:"Data-quality scorecard", evidenceUri:cell(ctl.EvidenceID),
              cadence:cell(ctl.Frequency)||"Monthly",
              status:(overall?"Measured":"Approved")}});
      if(rO && overall){
        rO.runs.push({id:uid("RUN"),executedAt:nowISO(),actual:overall,
          numerator:"",denominator:"",ciLow:"",ciHigh:"",sample:"",coverage:"",agreement:"",
          evidenceId:cell(ctl.EvidenceID),hash:"",environment:"",attestation:"",
          note:"Composite score "+overall+", recorded RAG "+(cell(ctl.OverallRAG)||"none")+
               ". Supplies decisions "+(cell(ctl.SuppliesDecisions)||"none recorded")+
               " and agents "+(cell(ctl.SuppliesAIAgents)||"none recorded")+".",
          override:null});
      }
    }
  });

  /* ---- 5. Value assessment. The benefit hypothesis must be falsifiable. ---- */
  S("UseCase_ValueAssessment").filter(function(r){return String(r.UseCaseID||"").trim()===ucId;})
  .forEach(function(v){
    add({title:"Benefit hypothesis is falsifiable and the outcome moves", type:"Outcome",
      sourceArtefact:"Prioritisation Value", sourceRecordId:ucId,
      useCaseId:ucId, anchorType:"Outcome + KPI", anchorId:cell(v.PrimaryOutcomeID),
      businessClaim:cell(v.Rationale),
      behaviour:"Value theme "+cell(v.ValueTheme)+", value score "+cell(v.ValueScore)+", commercial rating "+cell(v.CommercialRating)+".",
      lens:"business", concern:"purpose", evalType:"Business/outcome",
      phase:"monitor", criticality:"Gate-critical", approval:"Proposed",
      retestTrigger:"Threshold or KPI change; scheduled cadence",
      spec:{construct:"Realised outcome against baseline",
            opDef:"Proxy first, then intermediate outcome, then realised KPI. Accuracy is not adoption and adoption is not realisation.",
            operator:">=", evaluatorType:"Observational study",
            evidenceType:"Outcome study", cadence:"Quarterly", status:"Draft"}});

    add({title:"The no-AI alternative does not deliver the value more cheaply", type:"Comparative baseline",
      sourceArtefact:"Prioritisation Value", sourceRecordId:ucId+"-noai",
      useCaseId:ucId, anchorType:"AI Use Case", anchorId:ucId,
      businessClaim:"AI is the right instrument for this decision.",
      lens:"business", concern:"purpose", evalType:"Business/outcome",
      phase:"intake", criticality:"Gate-critical", approval:"Proposed",
      spec:{construct:"Incremental value over the manual or rules-based alternative",
            evaluatorType:"Observational study", evidenceType:"Comparison record",
            status:"Draft"}});
  });

  /* ---- 6. Readiness weaknesses. Never merely a lower composite score. ---- */
  S("UseCase_ReadinessAssessme").filter(function(r){return String(r.UseCaseID||"").trim()===ucId;})
  .forEach(function(rd){
    var score = num(cell(rd.Score));
    var rag = cell(rd.RAG);
    var unscored = (score===null && rag==="");
    if(!unscored && score!==null && score>=4 && rag!=="Red" && rag!=="Amber") return;
    var dn = cell(rd.DimensionName)||cell(rd.DimensionID);
    var dom = READINESS_DOMAINS.filter(function(d){
      return d.name.toLowerCase().indexOf(dn.toLowerCase())>=0 || dn.toLowerCase().indexOf(d.name.split(" ")[0].toLowerCase())>=0; })[0];
    add({title:(unscored
        ? "Readiness not yet assessed: "+dn
        : "Readiness weakness: "+dn+" scores "+(score===null?"no score":String(score))+
          (rag?" ("+rag+")":"")), type:"Constraint",
      sourceArtefact:"Readiness / System Design", sourceRecordId:ucId+"-"+cell(rd.DimensionID)||dn,
      useCaseId:ucId, anchorType:"Capability", anchorId:cell(rd.DimensionID),
      riskClaim:cell(rd.Basis)||(unscored?
        "This readiness domain carries no score. An unassessed domain is not a passing domain.":""),
      behaviour:(dom?dom.ask:"Is this readiness domain sufficient to carry the use case into the next stage?"),
      failureConsequence:(unscored?
        "Nothing can be concluded about this domain, which is not the same as nothing being wrong with it.":
        "Maturity: "+cell(rd.MaturityLevel)+". Elements: "+cell(rd.Elements)+"."),
      lens:(dom?dom.lens:"business"), concern:(dom?({data:"datafit",system:"resilience",decision:"control",records:"accountability",business:"purpose"})[dom.lens]:"purpose"),
      evalType:"Operational/monitoring", phase:"design",
      criticality:(rag==="Red"?"Gate-critical":"Gate-relevant"), approval:"Draft",
      retestTrigger:(unscored?"Scheduled cadence":""),
      spec:{construct:"Readiness domain sufficiency",
            opDef:"Generates a requirement, a design constraint, a dependency, a remediation item, or an explicit not-testable-yet finding.",
            evaluatorType:"Independent review", evidenceType:"Readiness evidence", status:"Draft"}});
  });

  /* ---- 7. Existing AIEval checks. Each becomes a requirement with a spec. ---- */
  (STATE.evals||[]).forEach(function(e){
    var lensGuess="system", concernGuess="modelval", et="Model";
    var cat=(e.category+" "+e.evalName+" "+e.metric).toLowerCase();
    if(/fair|bias|equit|inclusion|harm|safeguard/.test(cat)){ lensGuess="decision"; concernGuess="safety"; et="Decision/human-control"; }
    else if(/hitl|human|override|escalat|appeal|decision/.test(cat)){ lensGuess="decision"; concernGuess="control"; et="Decision/human-control"; }
    else if(/data|quality|complete|freshness|lineage|semantic|concept/.test(cat)){ lensGuess="data"; concernGuess="datafit"; et="Data/semantic/privacy"; }
    else if(/privacy|consent|security|leak|access|injection/.test(cat)){ lensGuess="system"; concernGuess="security"; et="Security/red-team"; }
    else if(/latency|availab|uptime|integrat|fallback|recovery|tool/.test(cat)){ lensGuess="system"; concernGuess="resilience"; et="System/integration"; }
    else if(/cost|adoption|outcome|benefit|value|kpi/.test(cat)){ lensGuess="business"; concernGuess="purpose"; et="Business/outcome"; }
    else if(/evidence|record|audit|retention|log|governance|approval/.test(cat)){ lensGuess="records"; concernGuess="accountability"; et="Governance/control"; }
    else if(/guardrail|violation|refusal|ground|citation|retriev/.test(cat)){ lensGuess="system"; concernGuess="security"; et="GenAI/RAG"; }

    var p=parseThreshold(e.threshold);
    var op = p.op==="range" ? "range" : (p.op==="manual" ? ">=" : p.op);
    var th = p.op==="range" ? (p.lo+"-"+p.hi) : (p.op==="manual" ? "" : String(p.v));
    var isAgent = cell(e.target)!==ucId;

    var r = add({title:(e.evalName||e.category||"Check")+(isAgent?" ("+e.target+")":""),
      type:"Performance",
      sourceArtefact:"Eval", sourceRecordId:e.id,
      useCaseId:ucId, anchorType:(isAgent?"Agent / System":"AI Use Case"), anchorId:String(e.target||ucId),
      componentType:(isAgent?"Model":"System"), componentId:cell(e.target),
      behaviour:cell(e.metric),
      lens:lensGuess, concern:concernGuess, evalType:et,
      phase:"build", criticality:"Gate-relevant",
      ownerRole:cell(e.owner), approval:"Proposed",
      retestTrigger:"Component or version change; scheduled cadence",
      spec:{metricId:e.id, construct:cell(e.metric), opDef:cell(e.metric),
            operator:op, threshold:th,
            method:cell(e.method), evaluatorType:"Automated metric",
            evidenceUri:cell(e.evidence), evidenceType:"Measurement record",
            cadence:cell(e.freq), status:(e.result!==""?"Measured":"Approved")}});

    /* the recorded result becomes an immutable run. The recorded status does not travel. */
    if(r && cell(e.result).trim()!==""){
      r.runs.push({id:uid("RUN"), executedAt:nowISO(), actual:String(e.result),
        numerator:"", denominator:"", ciLow:"", ciHigh:"", sample:"", coverage:"",
        agreement:"", evidenceId:cell(e.evidence), hash:"", environment:"",
        note:"Imported from the AIEval register. The recorded status in that register was \""+
             (e.recorded||"blank")+"\" and is deliberately not carried across: status is computed here.",
        attestation:"", override:null});
    }
  });

  /* ---- 8. Golden thread anchors with no requirement yet. ---- */
  if(opts.anchors!==false){
    THREAD_EVAL_MAP.forEach(function(L){
      var node = spine && spine[L.k];
      if(!node || !(node.ids||[]).length) return;
      var covered = made.concat(STATE.requirements||[]).some(function(r){
        return r.anchorType===L.lay && (node.ids||[]).indexOf(r.anchorId)>=0; });
      if(covered) return;
      var c = CONCERNS.filter(function(x){return x.id===L.concern;})[0];
      add({title:L.lay+": "+L.q, type:(L.k==="outcome"||L.k==="vp"?"Outcome":"Performance"),
        sourceArtefact:"Business Architecture", sourceRecordId:(node.ids[0]||L.k),
        useCaseId:ucId, anchorType:L.lay, anchorId:String(node.ids[0]||""),
        businessClaim:(node.names||[]).slice(0,3).join("; "),
        behaviour:L.pre,
        failureConsequence:L.fail,
        lens:(c?c.lens:"business"), concern:L.concern, evalType:"Business/outcome",
        phase:"design", criticality:"Gate-relevant", approval:"Draft",
        spec:{construct:L.q, opDef:L.fam, method:L.fam, status:"Draft"}});
    });
  }

  return made;
}

/* ---- gate decision helpers ------------------------------------- */
function gateDecision(gid){
  STATE.lifecycle = STATE.lifecycle||{};
  if(!STATE.lifecycle[gid]) STATE.lifecycle[gid] =
    {outcome:"", decisionMaker:"", date:"", conditions:"", evidence:"", expiry:"", note:""};
  return STATE.lifecycle[gid];
}

/* requirements that block a hard gate */
function gateBlockers(gid){
  var g = LIFECYCLE.filter(function(x){return x.id===gid;})[0];
  if(!g || g.kind!=="gate") return [];
  var phaseOrder = LIFECYCLE_PHASES.map(function(p){return p.id;});
  var upto = {G0:["intake"], G1:["intake","ear"], G2:["intake","ear","design"],
              G3:["intake","ear","design","build","predeploy"],
              G4:["intake","ear","design","build","predeploy","deploy"],
              G5:phaseOrder, G6:phaseOrder}[gid] || phaseOrder;
  return (STATE.requirements||[]).filter(function(r){
    if(r.criticality!=="Gate-critical") return false;
    if(upto.indexOf(r.phase)<0) return false;
    var s = reqStatus(r).s;
    return s==="Fail" || s==="Stop" || s==="Not satisfied" ||
           s==="Unspecified" || s==="Not run" || s==="Awaiting attestation";
  });
}
</script>
