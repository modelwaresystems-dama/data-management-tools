/* ============================================================================
   New-schema importer — maps the standardized 53-sheet Business Architecture
   workbook (00_ReadMe … 52_EndToEndTrace, the template MS Copilot emits) UP
   into the app's canonical GENERIC model, so a Copilot workbook loads through
   the existing Import page (PACK.setImportedModel).  D9: old schema canonical;
   new schema is an import that maps up.

   Pure core: buildModelFromNewSchema(sheets) where sheets = { "<sheetName>":
   [rowObject,...] }.  Runs in Node (for testing) and in the browser (PACK.*).
   Graceful: the new template is leaner than the old 96-sheet model, so entities
   it does not carry are simply absent, never faked.
   ========================================================================== */
(function(root){
  "use strict";

  function A(v){ return Array.isArray(v)?v:(v==null?[]:[v]); }
  function S(v){ return v==null?"":String(v).trim(); }
  function L(v){ if(Array.isArray(v)) return v.slice();
    return S(v).split(/[,;|\n]/).map(function(x){return x.trim();}).filter(Boolean); }
  function N(v){ if(v===""||v==null) return v; var n=Number(v); return isNaN(n)?v:n; }
  function B(v){ if(typeof v==="boolean") return v; var s=S(v).toLowerCase();
    return s==="yes"||s==="true"||s==="y"||s==="1"; }
  function groupBy(rows, key){ var m={}; A(rows).forEach(function(r){ var k=S(r[key]); if(!k) return; (m[k]=m[k]||[]).push(r); }); return m; }
  function mapList(rows, keyFrom, keyTo){ var m={}; A(rows).forEach(function(r){ var k=S(r[keyFrom]), v=S(r[keyTo]); if(!k||!v) return; (m[k]=m[k]||[]); if(m[k].indexOf(v)<0) m[k].push(v); }); return m; }

  /* a row is "live" unless its Status marks it struck/removed; blank = keep */
  function live(rows){ return A(rows).filter(function(r){ var st=S(r.Status).toLowerCase(); return st!=="removed"&&st!=="deleted"&&st!=="n/a"; }); }

  function detect(sheetNames){
    var set={}; A(sheetNames).forEach(function(n){ set[n]=1; });
    // the template's signature sheets
    return !!(set["52_EndToEndTrace"] || set["00_ReadMe_SourceStatus"] ||
      (set["03_Stakeholder"] && set["09_ValueStage"] && set["33_ElementRegistry"]));
  }

  function buildModelFromNewSchema(sheets){
    function S_(name){ return A(sheets[name]); }
    var G = {};

    /* ---- stakeholders -------------------------------------------------- */
    G.stakeholders = live(S_("03_Stakeholder")).map(function(r){
      return { id:S(r.StakeholderID), name:S(r.Name), members:S(r.Members),
        value:S(r.ValueExpected), segment:S(r.SegmentNotes) }; });

    /* ---- personas ------------------------------------------------------ */
    G.personas = live(S_("04_Persona")).map(function(r){
      return { id:S(r.PersonaID), stakeholderId:S(r.StakeholderID), segment:S(r.Segment),
        name:S(r.PersonaName), desc:S(r.Description), journeys:L(r.RelatedJourneys) }; });

    /* ---- KPIs: detail, name index, themed groups ----------------------- */
    var kd={}, kbn={}, themes={}, tOrder=[];
    live(S_("07_OutcomeKPI")).forEach(function(r){
      var id=S(r.KPIID), nm=S(r.KPIName), th=S(r.OutcomeTheme)||"Outcomes";
      kd[id]={ name:nm, theme:th, definition:S(r.Definition), calculation:S(r.Calculation),
        unit:S(r.Unit), owner:S(r.PrimaryOwner), appliesTo:S(r.AppliesTo) };
      kbn[nm]=id;
      if(!themes[th]){ themes[th]=[]; tOrder.push(th); } themes[th].push(nm);
    });
    if(tOrder.length){ G.kpiDetail=kd; G.kpiByName=kbn;
      G.kpis=tOrder.map(function(t,i){ return { id:"KT"+(i+1), theme:t, items:themes[t] }; }); }

    /* ---- business outcomes (+ KPIs via 36_Outcome_KPI_Map) ------------- */
    var outKpi = mapList(live(S_("36_Outcome_KPI_Map")), "OutcomeID", "KPIID");
    var vpOut = {}; live(S_("35_VP_Outcome_Map")).forEach(function(r){
      var vp=S(r.ValuePropositionID), o=S(r.OutcomeID); if(!vp||!o) return; (vpOut[vp]=vpOut[vp]||[]).push(o); });
    if(Object.keys(vpOut).length) G.vpOutcomes=vpOut;
    G.businessOutcomes = live(S_("06_BusinessOutcome")).map(function(r){
      var id=S(r.OutcomeID);
      return { id:id, name:S(r.OutcomeName), desc:S(r.Definition), owner:S(r.PrimaryOwner),
        type:S(r.OutcomeTheme),
        kpis:(outKpi[id]||[]).map(function(k){ return { kpiId:k, weight:"" }; }) }; });

    /* ---- value streams / stages (+ caps via 40_ValueStage_Capability) -- */
    G.valueStreams = live(S_("08_ValueStream")).map(function(r){
      return { id:S(r.ValueStreamID), name:S(r.Name), trigger:S(r.TriggerStakeholderID),
        desc:S(r.Description), expectedValue:S(r.ExpectedValue), vp:S(r.RelatedValuePropositions) }; });
    var stageCaps = mapList(live(S_("40_ValueStage_Capability")), "ValueStageID", "CapabilityID");
    G.valueStages = live(S_("09_ValueStage")).map(function(r){
      var id=S(r.ValueStageID);
      return { id:id, vs:S(r.ValueStreamID), seq:N(r.Sequence), name:S(r.Name),
        entrance:S(r.EntryCriterion), exit:S(r.ExitCriterion), valueItem:S(r.ValueItem),
        primaryKPI:S(r.PrimaryKPI), caps:(stageCaps[id]||[]) }; });

    /* ---- value propositions (+ stakeholders[], journeys[]) ------------- */
    // segment columns differ by industry; carry the insurance-lifecycle four
    G.valuePropositions = live(S_("05_ValueProposition")).map(function(r){
      return { id:S(r.ValuePropositionID), name:S(r.ValuePropositionName)||S(r.Group), group:S(r.Group),
        stakeholders:[S(r.StakeholderID)], generic:S(r.GenericPromise),
        retail:S(r.DistributionAdvice), commercial:S(r.QuoteApplication),
        wealth:S(r.Underwriting), trade:S(r.PolicyServicingClaims), journeys:[] }; });

    /* ---- capabilities -------------------------------------------------- */
    G.capabilities = live(S_("12_Capability")).map(function(r){
      return { id:S(r.CapabilityID), name:S(r.Name), maturity:N(r.MaturityCurrent),
        maturityTarget:N(r.MaturityTarget), status:S(r.Status), def:S(r.Definition),
        level:S(r.Level), parent:S(r.ParentCapabilityID), owner:S(r.OwnerRoleID) }; });

    /* ---- processes (+ decisions via 42_Process_Decision_Map) ----------- */
    var procDec = mapList(live(S_("42_Process_Decision_Map")), "ProcessID", "DecisionID");
    var capProc = mapList(live(S_("41_Capability_Process_Map")), "ProcessID", "CapabilityID");
    G.processes = live(S_("13_Process")).map(function(r){
      var id=S(r.ProcessID);
      var caps = capProc[id] && capProc[id].length ? capProc[id] : (S(r.CapabilityID)?[S(r.CapabilityID)]:[]);
      return { id:id, name:S(r.Name), inputs:S(r.Trigger), outputs:S(r.Outcome),
        purpose:S(r.Purpose), capabilities:caps, participants:S(r.OwnerRoleID) }; });
    G.processDecisions = procDec;

    /* ---- decisions ----------------------------------------------------- */
    G.decisions = live(S_("15_Decision")).map(function(r){
      return { id:S(r.DecisionID), name:S(r.Name), question:S(r.DecisionQuestion),
        inputs:S(r.Inputs), rules:S(r.Rules), outcome:S(r.Outcome), owner:S(r.AuthorityRoleID),
        hitl:S(r.HITL), evidence:S(r.EvidenceRequired) }; });

    /* ---- process steps (new schema has them at step grain) ------------- */
    G.processSteps = live(S_("14_ProcessStep")).map(function(r){
      return { id:S(r.ProcessStepID), process:S(r.ProcessID), seq:N(r.Sequence), name:S(r.Name),
        desc:S(r.Description), input:S(r.Input), output:S(r.Output), role:S(r.RoleID) }; });

    /* ---- AI use-cases (+ decisions via 44_Decision_AIUseCase_Map) ------ */
    var ucDec = {}; live(S_("44_Decision_AIUseCase_Map")).forEach(function(r){
      var uc=S(r.AIUseCaseID), d=S(r.DecisionID); if(!uc||!d) return; (ucDec[uc]=ucDec[uc]||[]).push(d); });
    var ucDP = mapList(live(S_("46_AIUseCase_DataProduct")), "AIUseCaseID", "DataProductID");
    G.aiUseCases = live(S_("19_AIUseCase")).map(function(r){
      var id=S(r.AIUseCaseID);
      var decs = ucDec[id] && ucDec[id].length ? ucDec[id] : (S(r.DecisionID)?[S(r.DecisionID)]:[]);
      return { id:id, name:S(r.Name), theme:S(r.GateStatus), phase:S(r.LifecycleStatus),
        desc:S(r.Description), decisions:decs, value:S(r.BusinessValue), risk:S(r.RiskLevel),
        oversight:S(r.HumanOversight), dataProducts:(ucDP[id]||[]), gate:S(r.GateStatus) }; });

    /* ---- model/agents (+ data products & semantic via 45/47 maps) ------ */
    var agUC = {}; live(S_("45_AIUseCase_ModelAgent")).forEach(function(r){
      var ag=S(r.ModelAgentID), uc=S(r.AIUseCaseID); if(!ag||!uc) return; (agUC[ag]=agUC[ag]||[]).push(uc); });
    G.aiAgents = live(S_("20_ModelAgent")).map(function(r){
      var id=S(r.ModelAgentID);
      var ucs = agUC[id] && agUC[id].length ? agUC[id] : (S(r.AIUseCaseID)?[S(r.AIUseCaseID)]:[]);
      return { id:id, name:S(r.Name), def:S(r.Purpose), type:S(r.Type), useCases:ucs,
        dataProducts:[], semanticModels:[], hitl:B(r.HumanOversight), owner:S(r.OwnerRoleID),
        lifecycle:S(r.LifecycleStatus) }; });

    /* ---- AI evals (21_AIEval) — status computed at read time ----------- */
    var evByUC={}; live(S_("21_AIEval")).forEach(function(r){
      var uc=S(r.AIUseCaseID);
      (evByUC[uc]=evByUC[uc]||[]).push({ id:S(r.EvalID), pillar:S(r.QualityPillar), metric:S(r.Metric),
        threshold:S(r.Threshold), observed:S(r.ObservedValue), recorded:S(r.RecordedStatus),
        computed:S(r.ComputedStatus), evidence:S(r.EvidenceID) }); });
    if(Object.keys(evByUC).length) G.aiEvals=evByUC;

    /* ---- semantic models / information concepts ------------------------ */
    G.semanticModels = live(S_("27_SemanticModel")).map(function(r){
      return { id:S(r.SemanticModelID), name:S(r.Name), def:S(r.Purpose),
        terms:L(r.InformationConcepts), metrics:L(r.CanonicalMetrics), owner:S(r.OwnerRoleID) }; });
    G.informationConcepts = live(S_("26_InformationConcept")).map(function(r){
      return { id:S(r.InformationConceptID), name:S(r.Name), def:S(r.Definition),
        subjectArea:S(r.SubjectArea), related:L(r.RelatedConcepts), steward:S(r.StewardRoleID) }; });

    /* ---- data products (+ domains synth, contracts, consumers) --------- */
    var dpConcept = mapList(live(S_("47_DataProduct_Concept_Map")), "DataProductID", "InformationConceptID");
    var ucByDP = {}; live(S_("46_AIUseCase_DataProduct")).forEach(function(r){
      var dp=S(r.DataProductID), uc=S(r.AIUseCaseID); if(!dp||!uc) return; (ucByDP[dp]=ucByDP[dp]||[]).push(uc); });
    var dpRows = live(S_("22_DataProduct"));
    G.dataProducts = dpRows.map(function(r){
      var id=S(r.DataProductID);
      return { id:id, name:S(r.Name), domain:S(r.DataDomainID), domainName:S(r.DataDomainID),
        desc:S(r.Description), cdp:[], ai:(ucByDP[id]||[]), consumers:(ucByDP[id]||[]).map(function(uc){ return {uc:uc}; }),
        owner:S(r.OwnerRoleID), steward:S(r.StewardRoleID), classification:S(r.Classification),
        contract:S(r.ContractID), concepts:(dpConcept[id]||[]), lifecycle:S(r.LifecycleStatus) }; });
    // synthesize data domains from the DataDomainID values on products (new schema has no domain register)
    var domMap={};
    dpRows.forEach(function(r){ var d=S(r.DataDomainID); if(!d) return;
      if(!domMap[d]) domMap[d]={ id:d, name:d, owner:"", steward:"", def:"", products:[] };
      domMap[d].products.push(S(r.DataProductID)); if(!domMap[d].owner) domMap[d].owner=S(r.OwnerRoleID); });
    G.dataDomains = Object.keys(domMap).map(function(k){ return domMap[k]; });

    /* data contracts (23_DataContract) keyed by data product */
    var dc={}; live(S_("23_DataContract")).forEach(function(r){ var dp=S(r.DataProductID); if(!dp) return;
      dc[dp]={ purpose:S(r.Purpose), consumers:S(r.Consumers), schemaRef:S(r.SchemaReference),
        qualitySLO:S(r.QualitySLO), refresh:S(r.Refresh), permittedUse:S(r.PermittedUse),
        access:S(r.AccessMode), evidence:S(r.EvidenceID) }; });
    if(Object.keys(dc).length) G.dataContracts=dc;

    /* critical data elements + DQ rules */
    G.criticalDataElements = live(S_("24_CriticalDataElement")).map(function(r){
      return { id:S(r.CDEID), dp:S(r.DataProductID), name:S(r.Name), def:S(r.Definition),
        type:S(r.DataType), classification:S(r.Classification), rule:S(r.QualityRuleID), owner:S(r.OwnerRoleID) }; });
    G.dataQualityRules = live(S_("25_DataQualityRule")).map(function(r){
      return { id:S(r.DQRuleID), name:S(r.Name), dim:S(r.Dimension), rule:S(r.RuleStatement),
        threshold:S(r.Threshold), cde:S(r.AppliesToCDE), owner:S(r.OwnerRoleID) }; });

    /* ---- ownership roles (32_Role_RACI) -------------------------------- */
    G.ownershipRoles = live(S_("32_Role_RACI")).map(function(r){
      return { id:S(r.RoleID), name:S(r.RoleName), type:S(r.RoleType),
        accountableFor:S(r.Accountability), owns:S(r.ResponsibleFor),
        collaborators:S(r.ConsultedOn) }; });

    /* ---- governance: policies, controls, evidence ---------------------- */
    G.policies = live(S_("17_Policy")).map(function(r){
      return { id:S(r.PolicyID), domain:"", statement:S(r.PolicyIntent)||S(r.Name),
        name:S(r.Name), appliesTo:S(r.AppliesTo), owner:S(r.PolicyOwnerRoleID), status:S(r.Status) }; });
    G.controls = live(S_("18_Control")).map(function(r){
      return { id:S(r.ControlID), name:S(r.Name), objective:S(r.ControlObjective),
        type:S(r.ControlType), freq:S(r.Frequency), owner:S(r.OwnerRoleID),
        appliesTo:S(r.AppliesTo), evidence:S(r.EvidenceID) }; });
    G.evidenceRegister = live(S_("31_RecordsEvidence")).map(function(r){
      return { id:S(r.EvidenceID), name:S(r.Name), cls:S(r.RecordClass), desc:S(r.Description),
        producedBy:S(r.ProducedBy), retention:S(r.Retention), owner:S(r.EvidenceOwnerRoleID) }; });

    /* ---- end-to-end traceability (52) ---------------------------------- */
    G.traceRows = live(S_("52_EndToEndTrace")).map(function(r){
      return { id:S(r.TraceID), stakeholder:S(r.StakeholderID), vp:S(r.ValuePropositionID),
        outcome:S(r.OutcomeID), kpi:S(r.KPIID), valueStream:S(r.ValueStreamID), valueStage:S(r.ValueStageID),
        capability:S(r.CapabilityID), process:S(r.ProcessID), step:S(r.ProcessStepID), decision:S(r.DecisionID),
        aiUseCase:S(r.AIUseCaseID), modelAgent:S(r.ModelAgentID), dataProduct:S(r.DataProductID),
        concept:S(r.InformationConceptID), semantic:S(r.SemanticModelID), evidence:S(r.EvidenceID),
        role:S(r.AccountableRoleID) }; });

    /* back-fill VP.journeys & VP.stakeholders[] from journeys/personas ---- */
    var persSH={}; G.personas.forEach(function(p){ persSH[p.id]=p.stakeholderId; });

    /* ---- relationship journeys (10/11) --------------------------------- */
    var jStages = groupBy(live(S_("11_JourneyStage")), "JourneyID");
    var js2vs={}; live(S_("39_JourneyStage_ValueStage")).forEach(function(r){ js2vs[S(r.JourneyStageID)]=S(r.ValueStageID); });
    G.journeys = live(S_("10_RelationshipJourney")).map(function(j){
      var jid=S(j.JourneyID);
      var rows=(jStages[jid]||[]).slice().sort(function(a,b){ return (N(a.Sequence)||0)-(N(b.Sequence)||0); });
      var stages=rows.map(function(s){
        return { stage:S(s.Name), emotion:"", touchpoints:S(s.Touchpoint), kpis:[],
          goal:S(s.CustomerGoal), pain:S(s.PainPoint), experience:S(s.DesiredExperience),
          valueStage:js2vs[S(s.JourneyStageID)]||S(s.MappedValueStageID), capabilities:[], processes:[], decisions:[] }; });
      var persId=S(j.PersonaID);
      return { id:jid, lob:"", name:S(j.Name), persona:persId, personaStakeholder:persSH[persId]||"", stages:stages }; });

    /* ---- defaults the baked base carries but a fresh tenant does not ---- */
    // AI value/risk driver rubric (ai_usecases portfolio scores against these)
    G.aiDrivers = { value:[ {key:"strategic",label:"Strategic value"}, {key:"customer",label:"Customer value"},
        {key:"financial",label:"Financial value"}, {key:"feasibility",label:"Feasibility"} ],
      risk:[ {key:"data",label:"Data risk"}, {key:"ethical",label:"Ethical risk"},
        {key:"regulatory",label:"Regulatory risk"}, {key:"operational",label:"Operational risk"} ] };
    // governance success-measure scorecard is a baked overlay; empty for a fresh tenant
    G.successMeasures = [];
    // end-to-end traceability threads (business_architecture renders these) from 52_EndToEndTrace
    G.threads = (G.traceRows||[]).map(function(t,i){
      return { name:t.id||("Thread "+(i+1)), stakeholders:t.stakeholder, vp:t.vp, journeys:[],
        kpis:t.kpi, capabilities:t.capability, processes:t.process, decisions:t.decision }; });

    return G;
  }

  var api = { detect:detect, buildModelFromNewSchema:buildModelFromNewSchema,
    // browser helper: wb (SheetJS workbook) -> GENERIC-shaped model
    importNewSchema:function(wb, XLSX){
      var sheets={}; (wb.SheetNames||[]).forEach(function(nm){
        sheets[nm]=XLSX.utils.sheet_to_json(wb.Sheets[nm], { defval:"" }); });
      return buildModelFromNewSchema(sheets);
    } };

  if(typeof module!=="undefined" && module.exports){ module.exports=api; }
  if(root && root.PACK){ root.PACK.NEWSCHEMA=api; }
  else if(root){ root.__NEWSCHEMA=api; }
})(typeof window!=="undefined"?window:(typeof globalThis!=="undefined"?globalThis:this));
