/* ============================================================================
   Model hydrator — rebuild window.GENERIC from window.NB_MODEL_SHEETS (the
   editable 96-sheet workbook the Model Editor writes) so edits published to the
   repo flow to EVERY page. Runs after data.js + model_all.js, before pack.js.

   OVERLAY strategy: the baked GENERIC is the base (it carries content that isn't
   in the sheets — AI value/risk scores, full data contracts, SIPOC detail,
   decision rules, capAttention, and the page-content blocks clv/cxo/training/
   governance/hyperPersonalisation/etc.). We rebuild the arrays the sheets fully
   define and MERGE (preserving base-only fields) the ones they partly define.
   If NB_MODEL_SHEETS is absent the page just uses the baked data unchanged.
   ========================================================================== */
(function(){
  // ACTIVE_MODEL_SHEETS is set by org_switch.js (Nedbank or AGGPSA); fall back to NB.
  var W=window, G=W.GENERIC, S=W.ACTIVE_MODEL_SHEETS || W.NB_MODEL_SHEETS;
  if(!G || !S || !S.length) return;

  function sheet(pre){ return S.filter(function(x){return x.name.indexOf(pre)===0;})[0]; }
  function recs(pre){ var s=sheet(pre); if(!s) return []; return s.rows.map(function(r){ var o={}; s.headers.forEach(function(h,i){ o[h]=r[i]; }); return o; }); }
  function L(v){ if(Array.isArray(v)) return v.slice(); return String(v==null?"":v).split(/[,|\n]/).map(function(x){return String(x).trim();}).filter(Boolean); }
  function N(v){ if(v===""||v==null) return v; var n=Number(v); return isNaN(n)?v:n; }
  function B(v){ if(typeof v==="boolean") return v; var s=String(v==null?"":v).trim().toLowerCase(); return s==="yes"||s==="true"||s==="y"||s==="1"; }
  function idx(a){ var m={}; (a||[]).forEach(function(o){ if(o&&o.id!=null) m[o.id]=o; }); return m; }
  /* derived rows get base-only `keep` fields copied in (supports add/delete via sheet order) */
  function mergeKeep(baseArr, derived, keep){ var b=idx(baseArr); return derived.map(function(d){ var o=b[d.id]; if(o) keep.forEach(function(k){ if(d[k]===undefined && o[k]!==undefined) d[k]=o[k]; }); return d; }); }
  function set(field, arr){ if(arr && arr.length) G[field]=arr; }

  /* ---- stakeholders / personas ---------------------------------------- */
  set("stakeholders", recs("2 ·").map(function(r){ return {id:r.StakeholderID,name:r.Name,members:r.Members,value:r.ValueExpected,segment:r.SegmentNotes}; }));
  set("personas", recs("3 ·").map(function(r){ return {id:r.PersonaID,stakeholderId:r.StakeholderID,segment:r.Segment,name:r.PersonaName,desc:r.Description,journeys:L(r.RelatedJourneys)}; }));

  /* ---- KPIs (detail + name index + themes) ---------------------------- */
  var kd={}, kbn={}, themes={}, tOrder=[];
  recs("5 ·").forEach(function(r){ kd[r.KPIID]={name:r.KPIName,theme:r.OutcomeTheme,definition:r.Definition,calculation:r.Calculation,unit:r.Unit,owner:r.PrimaryOwner,appliesTo:r.AppliesTo};
    kbn[r.KPIName]=r.KPIID; if(!themes[r.OutcomeTheme]){themes[r.OutcomeTheme]=[];tOrder.push(r.OutcomeTheme);} themes[r.OutcomeTheme].push(r.KPIName); });
  if(tOrder.length){ G.kpiDetail=kd; G.kpiByName=kbn; G.kpis=tOrder.map(function(t,i){return {id:"KT"+(i+1),theme:t,items:themes[t]};}); }

  /* ---- value streams / stages ----------------------------------------- */
  set("valueStreams", recs("6 ·").map(function(r){ return {id:r.ValueStreamID,name:r.Name,trigger:r.TriggerStakeholderID,desc:r.Description,expectedValue:r.ExpectedValue,vp:r.RelatedValuePropositions}; }));
  set("valueStages", recs("7 ·").map(function(r){ return {id:r.ValueStageID,vs:r.ValueStreamID,seq:N(r.Sequence),name:r.StageName,entrance:r.EntranceCriteria,exit:r.ExitCriteria,valueItem:r.ValueItem,primaryKPI:r.PrimaryKPI,caps:L(r.EnablingCapabilities)}; }));

  /* ---- outcomes + vp→outcome map -------------------------------------- */
  var vpo={}; recs("43 ·").forEach(function(r){ (vpo[r.ValuePropositionID]=vpo[r.ValuePropositionID]||[]).push(r.OutcomeID); });
  if(Object.keys(vpo).length) G.vpOutcomes=vpo;
  var bok={}; recs("44 ·").forEach(function(r){ (bok[r.OutcomeID]=bok[r.OutcomeID]||[]).push({kpiId:r.KPIID,weight:N(r.Weight)}); });
  set("businessOutcomes", recs("40 ·").map(function(r){ return {id:r.OutcomeID,name:r.Name,desc:r.Description,owner:r.OwnerRoleID,type:r.OutcomeType,segment:r.Segment,horizon:r.TargetHorizon,kpis:bok[r.OutcomeID]||[]}; }));

  /* ---- journeys (overlay onto base — keep per-stage decisions & kpis) -- */
  var baseJById=idx(G.journeys);
  var perById={}; recs("3 ·").forEach(function(p){ perById[p.PersonaID]=p; });
  var jsRows=recs("10 ·");
  var capMap={}, procMap={};
  recs("28 ·").forEach(function(r){ (capMap[r.JourneyStageID]=capMap[r.JourneyStageID]||[]).push(r.CapabilityID); });
  recs("29 ·").forEach(function(r){ (procMap[r.JourneyStageID]=procMap[r.JourneyStageID]||[]).push(r.ProcessID); });
  // process -> decisions (from sheet 12), so a stage's decisions can be derived
  // from the processes it operationalises when no base overlay supplies them.
  var procDecMap={}; recs("12 ·").forEach(function(r){ procDecMap[r.ProcessID]=L(r.Decisions); });
  function decsForProcesses(pids){ var seen={},out=[]; (pids||[]).forEach(function(pid){ (procDecMap[pid]||[]).forEach(function(d){ if(d&&!seen[d]){ seen[d]=1; out.push(d); } }); }); return out; }
  var crj=recs("8 ·");
  var journeys=[];
  crj.forEach(function(j){
    var base=baseJById[j.CRJourneyID]||null;                        // base overlay (NB/AGGPSA); may be absent for a new tenant
    var srows=jsRows.filter(function(s){return s.JourneyID===j.CRJourneyID;}).sort(function(a,b){return (N(a.StageNo)||0)-(N(b.StageNo)||0);});
    // keep only journeys that have a base overlay OR sheet-defined stages (so a new tenant's journeys aren't dropped)
    if(!base && !srows.length) return;
    var perName=perById[j.PersonaID]?perById[j.PersonaID].PersonaName:(base?base.persona:j.PersonaID);
    var baseStages=(base&&base.stages)||[];
    var stages=srows.map(function(s,i){ var jsid=s.JourneyStageID, bs=baseStages[i]||{};
      var stProcs=(procMap[jsid]||bs.processes||[]);
      var stDecs=(bs.decisions&&bs.decisions.length)?bs.decisions:decsForProcesses(stProcs);
      return { stage:s.StageName, emotion:N(s.ExperienceScore), touchpoints:s.Touchpoints,
        kpis:(bs.kpis&&bs.kpis.length)?bs.kpis:L(s.StageMetrics),
        capabilities:(capMap[jsid]||bs.capabilities||[]),
        processes:stProcs,
        decisions:stDecs };
    });
    journeys.push({id:j.CRJourneyID, lob:j.LineOfBusiness, name:j.Name, persona:perName, stages:stages.length?stages:baseStages});
  });
  set("journeys", journeys);

  /* ---- journey meta + stage→value-stage + CX journeys ----------------- */
  var jm={}; crj.forEach(function(j){ jm[j.CRJourneyID]={persona:j.PersonaID,vp:j.ValuePropositionID,valueStream:j.ValueStreamID,developmentObjective:j.DevelopmentObjective,stageBackbone:j.StageBackbone,outcomes:(vpo[j.ValuePropositionID]||[])}; });
  if(Object.keys(jm).length) G.journeyMeta=jm;
  var jvs={}; recs("26 ·").forEach(function(r){ jvs[r.JourneyStageID]=r.ValueStageID; });
  if(Object.keys(jvs).length) G.journeyStageValueStage=jvs;
  // journey -> the value streams it traverses (many-to-many), so the Navigator
  // can reach a journey from every value stream it runs through, not just its
  // single primary stream.
  var jvsStreams={}; recs("26 ·").forEach(function(r){ if(!r.ValueStreamID) return;
    (jvsStreams[r.JourneyID]=jvsStreams[r.JourneyID]||[]); if(jvsStreams[r.JourneyID].indexOf(r.ValueStreamID)<0) jvsStreams[r.JourneyID].push(r.ValueStreamID); });
  if(Object.keys(jvsStreams).length) G.journeyValueStreams=jvsStreams;
  set("cxJourneys", recs("9 ·").map(function(r){ return {id:r.CXJourneyID,crJourney:r.RelatedCRJourneyID,name:r.Name,focus:r.ExperienceFocus,moment:r.MomentOfTruth,touchpoints:r.PrimaryTouchpoints}; }));

  /* ---- value propositions (with derived stakeholders[] + journeys[]) --- */
  var custJids=(G.journeys||[]).map(function(x){return x.id;});
  set("valuePropositions", recs("4 ·").map(function(r){
    var js=custJids.filter(function(jid){ return jm[jid] && jm[jid].vp===r.ValuePropositionID; });
    var _sk=((W.PACK_CONFIG&&W.PACK_CONFIG.vpSegments&&W.PACK_CONFIG.vpSegments.keys)||["Retail","Commercial","Wealth","TradeFinance"]);
    return {id:r.ValuePropositionID,name:(r.ValuePropositionName||r.Group),group:r.Group,stakeholders:[r.StakeholderID],generic:r.GenericPromise,retail:r[_sk[0]],commercial:r[_sk[1]],wealth:r[_sk[2]],trade:r[_sk[3]],journeys:js};
  }));

  /* ---- capabilities (merge: keep child-ids & extension flag) ---------- */
  var capD=recs("11 ·").map(function(r){ return {id:r.CapabilityID,name:r.Name,maturity:N(r.Maturity),status:r.Status,def:r.Definition}; });
  if(capD.length) G.capabilities=mergeKeep(G.capabilities, capD, ["children","ext"]);

  /* ---- processes (+ process→decisions) merge keep ext ----------------- */
  var procD=recs("12 ·").map(function(r){ return {id:r.ProcessID,name:r.Name,inputs:r.Inputs,outputs:r.Outputs,capabilities:L(r.Capabilities),participants:r.Participants}; });
  if(procD.length){ G.processes=mergeKeep(G.processes, procD, ["ext"]);
    var pd={}; recs("12 ·").forEach(function(r){ pd[r.ProcessID]=L(r.Decisions); }); G.processDecisions=pd; }

  /* ---- decisions (merge keep ext; decisionRules stay from base) ------- */
  var decD=recs("13 ·").map(function(r){ return {id:r.DecisionID,name:r.Name,inputs:r.Inputs,rules:r.RuleSummary,outcome:r.Outcome,owner:r.Owner}; });
  if(decD.length) G.decisions=mergeKeep(G.decisions, decD, ["ext"]);

  /* ---- AI use-cases (merge keep value/risk/cost/terms) + aiCdp services */
  var ucD=recs("14 ·").map(function(r){ return {id:r.AIUseCaseID,name:r.Name,theme:r.Theme,phase:r.Phase,desc:r.Description,decisions:L(r.Decisions)}; });
  if(ucD.length) G.aiUseCases=mergeKeep(G.aiUseCases, ucD, ["value","risk","cost","terms"]);
  G.aiCdp=G.aiCdp||{};
  recs("14 ·").forEach(function(r){ var b=G.aiCdp[r.AIUseCaseID]||{services:[],models:[],data:[]}; G.aiCdp[r.AIUseCaseID]={services:L(r.CDPServices),models:b.models||[],data:b.data||[]}; });

  /* ---- AI agents / semantic models / CDP services --------------------- */
  set("aiAgents", recs("15 ·").map(function(r){ var o={id:r.AgentID,name:r.Name,def:r.Definition,useCases:L(r.AIUseCases),dataProducts:L(r.DataProducts),semanticModels:L(r.SemanticModels),hitl:B(r.HITL)}; if(r["HITL Reason"]) o.hitlReason=r["HITL Reason"]; return o; }));
  set("semanticModels", recs("16 ·").map(function(r){ return {id:r.SemanticModelID,name:r.Name,def:r.Definition,terms:L(String(r.GovernedTerms==null?"":r.GovernedTerms).replace(/;/g,","))}; }));
  set("cdpServices", recs("17 ·").map(function(r){ return {id:r.CDPServiceID,name:r.Name,desc:r.Description}; }));

  /* ---- domain-first ownership: the Data Domain OWNS its Data Products.
     The product no longer carries a DomainID foreign key (which used to render
     the domain "under" the product); its owning domain is derived here from the
     domain's product list (SSOT) — MECE, one product one domain. -------- */
  var dpToDom={};                                   // dpid -> owning domain id
  recs("19 ·").forEach(function(r){ L(r.DataProducts).forEach(function(dp){ dpToDom[dp]=r.DataDomainID; }); });

  /* consumer map (sheet 38): AI use-cases are CONSUMERS of data products,
     not fields on the product. Group by product. --------------------------- */
  var dpConsumers={};                               // dpid -> [{uc,purpose,access,crit,need,contract,status}]
  recs("189 ·").forEach(function(r){ (dpConsumers[r.DataProductID]=dpConsumers[r.DataProductID]||[]).push(
    {uc:r.AIUseCaseID, purpose:r.ConsumptionPurpose, access:r.AccessMode, crit:r.Criticality,
     need:r.TimelinessNeed, contract:r.ContractID, status:r.ApprovalStatus}); });

  /* ---- data products (merge keep terms) + data contract overlay ------- */
  var dpD=recs("18 ·").map(function(r){
    var cons=dpConsumers[r.DataProductID]||[];
    return {id:r.DataProductID,name:r.Name,domain:dpToDom[r.DataProductID]||"",domainName:r.Domain,
      desc:r.Description,cdp:L(r.RealisesCDP),
      ai:cons.map(function(c){return c.uc;}),
      consumers:cons,
      productType:r.ProductType, refresh:r.DataRefreshRate, pipeline:r.PipelineMode,
      timelinessSLA:r.TimelinessSLA, meetsTimeliness:r.MeetsTimeliness}; });
  if(dpD.length) G.dataProducts=mergeKeep(G.dataProducts, dpD, ["terms"]);
  G.dataContracts=G.dataContracts||{};
  recs("18 ·").forEach(function(r){ var b=G.dataContracts[r.DataProductID]||{};
    var schema=String(r["Schema (field:type[:pii])"]||"").split(/\s*[|;]\s*/).map(function(x){return x.trim();}).filter(Boolean).map(function(f){ var p=f.split(":"); return [p[0]||"", p[1]||"", (p[2]||"")]; });
    G.dataContracts[r.DataProductID]=Object.assign({}, b, {purpose:(r.Description||b.purpose), classification:r.Classification||b.classification, sources:(L(r.Producers).length?L(r.Producers):b.sources), schema:(schema.length?schema:b.schema)}); });

  /* ---- data domains / ownership roles --------------------------------- */
  set("dataDomains", recs("19 ·").map(function(r){ return {id:r.DataDomainID,name:r.Name,owner:r.Owner,steward:r.Steward,def:r.Definition,products:L(r.DataProducts)}; }));
  set("ownershipRoles", recs("20 ·").map(function(r){ return {id:r.RoleID,name:r.RoleName,accountableFor:r.AccountableFor,owns:r.OwnsObjects,collaborators:r.KeyCollaborators}; }));

  /* ---- governance layer ----------------------------------------------- */
  var bg={}; recs("41 ·").forEach(function(r){ bg[r.OutcomeID]={role:r.AccountableRole,forum:r.ReviewForum,cadence:r.ReviewCadence,rights:r.DecisionRights}; });
  if(Object.keys(bg).length) G.boGovernance=bg;
  set("governanceCouncils", recs("67 ·").map(function(r){ return {id:r.CouncilID,name:r.Name,mandate:r.Mandate,members:L(r.MembersRoles),cadence:r.Cadence,escalation:r.EscalationPath}; }));
  set("raci", recs("68 ·").map(function(r){ return {id:r.RACI_ID,objType:r.ObjectType,objId:r.ObjectID,a:r.Accountable,r:r.Responsible,c:L(r.Consulted),i:L(r.Informed)}; }));
  set("policyDomains", recs("62 ·").map(function(r){ return {id:r.PolicyDomainID,name:r.Name,scope:r.Scope,owner:r.OwnerRoleID,category:r.Category||"Enterprise"}; }));
  set("policies", recs("63 ·").map(function(r){ return {id:r.PolicyID,domain:r.PolicyDomainID,statement:r.Statement,owner:r.OwnerRoleID,status:r.Status}; }));
  /* Controls: the pack now speaks ONE control model — the PolicyControl set (176),
     superseding the legacy Standard_Control (64). Fields mapped for back-compat so
     existing pages (governance, value streams) render the richer controls. */
  var _pc=recs("176 ·");
  if(_pc.length){
    set("controls", _pc.map(function(r){ return {id:r.ControlID,policy:String(r.ControlID).replace(/-C\d+$/,""),theme:r.ThemeID,name:r.ControlName,objective:r.Objective,activity:r.ControlName,intent:r.CoreIntent,freq:r.Frequency,evidence:r.MinimumEvidence,responsible:r.ResponsibleRole,accountable:r.AccountableRole,accRoleId:r.AccountableRoleID,bdsRoleId:r.BusinessStewardRoleID,tsRoleId:r.TechnicalSpecialistRoleID,consulted:r.ConsultedRoles,informed:r.InformedRoles}; }));
  } else {
    set("controls", recs("64 ·").map(function(r){ return {id:r.ControlID,policy:r.PolicyID,objective:r.ControlObjective,activity:r.ControlActivity,freq:r.Frequency,evidence:r.EvidenceType,acceptance:r.AcceptanceCriterion}; }));
  }
  set("controlCrosswalk", recs("182 ·").map(function(r){ return {legacy:r.LegacyControlID,policy:r.PolicyID,control:r.NewControlID,name:r.NewControlName,basis:r.MatchBasis}; }));
  set("riskRegister", recs("69 ·").map(function(r){ return {id:r.RiskID,obj:r.ObjectID,type:r.RiskType,desc:r.Description,like:r.Likelihood,impact:r.Impact,control:r.MitigationControlID,owner:r.OwnerRoleID}; }));
  /* Control → evidence: from the new PolicyEvidenceArtefact set (178) so the
     governance "control → evidence" view speaks the one control model. */
  var _pe=recs("178 ·");
  if(_pe.length){
    set("controlEvidence", _pe.map(function(r){ return {control:r.ControlID,evidence:r.ArtefactID,required:r.Artefact,freq:r.ApprovalState}; }));
  } else {
    set("controlEvidence", recs("65 ·").map(function(r){ return {control:r.ControlID,evidence:r.EvidenceID,required:r.EvidenceRequired,freq:r.ReviewFrequency}; }));
  }
  set("evidenceRegister", recs("66 ·").map(function(r){ return {id:r.EvidenceID,name:r.EvidenceName,obj:r.ObjectID,owner:r.OwnerRoleID,repo:r.RepositoryLocation,status:r.ReviewStatus}; }));
  set("recordsRetention", recs("70 ·").map(function(r){ return {id:r.RecordClassID,cls:r.RecordClass,objType:r.ObjectType,retention:r.RetentionRule,disposal:r.DisposalRule,legalHold:B(r.LegalHoldFlag)}; }));
  set("auditAssurance", recs("71 ·").map(function(r){ return {id:r.AssuranceID,control:r.ControlID,method:r.TestMethod,result:r.Result,finding:r.Finding,owner:r.RemediationOwner}; }));
  set("modelCards", recs("73 ·").map(function(r){ return {id:r.ModelCardID,uc:r.UseCaseID,use:r.IntendedUse,limits:r.Limitations,metrics:r.Metrics,fairness:r.FairnessNotes,monitoring:r.MonitoringPlanID}; }));
  set("promptRegister", recs("74 ·").map(function(r){ return {id:r.PromptID,agent:r.AgentID,purpose:r.PromptPurpose,version:r.Version,status:r.ApprovalStatus,records:r.RecordsClassID}; }));
  set("aiDecisionLog", recs("75 ·").map(function(r){ return {id:r.DecisionLogID,uc:r.UseCaseID,segment:r.CustomerSegment,output:r.DecisionOutput,override:B(r.HumanOverride),ts:r.Timestamp,evidence:r.EvidenceID}; }));
  set("dataAssets", recs("98 ·").map(function(r){ return {id:r.DataAssetID,dp:r.DataProductID,name:r.AssetName,type:r.AssetType,layer:r.Layer,platform:r.StoragePlatformID,format:r.Format,pii:B(r.PII),owner:r.Owner,port:r.PortRole,refresh:r.RefreshRate}; }));
  set("storagePlatforms", recs("99 ·").map(function(r){ return {id:r.StoragePlatformID,name:r.Name,type:r.PlatformType,zone:r.Zone,region:r.Region,owner:r.Owner,notes:r.Notes}; }));
  /* ---- application landscape + AI evaluation registers ---------------- */
  set("applications", recs("168 ·").map(function(r){ return {id:r.AppID,name:r.AppName,category:r.Category,appType:r.AppType,hosting:r.Hosting,lifecycle:r.Lifecycle,owner:r.OwnerRole,criticality:r.Criticality,desc:r.Description}; }));
  var appProc={}; recs("169 ·").forEach(function(r){ (appProc[r.AppID]=appProc[r.AppID]||[]).push({proc:r.ProcessID,procName:r.ProcessName,role:r.SystemRole}); });
  G.appProcesses=appProc;
  set("evalMetrics", recs("76 ·").map(function(r){ return {id:r.EvalMetricID,name:r.MetricName,type:r.MetricType,appliesTo:r.AppliesTo,threshold:r.Threshold,owner:r.OwnerRoleID}; }));
  set("evalDatasets", recs("77 ·").map(function(r){ return {id:r.EvalDatasetID,name:r.Name,purpose:r.Purpose,source:r.SourceDataProductID,repCheck:r.RepresentativenessCheck,retention:r.RetentionClassID}; }));
  set("evalPlans", recs("78 ·").map(function(r){ return {id:r.EvalPlanID,useCase:r.UseCaseID,dataset:r.EvalDatasetID,metrics:r.Metrics,passFail:r.PassFailCriteria,reviewer:r.ReviewerRole}; }));

  /* ---- Policy-as-Code layer ------------------------------------------- */
  set("policyRules", recs("100 ·").map(function(r){ return {id:r.RuleID,policy:r.PolicyID,ruleType:r.RuleType,nl:r.NaturalLanguageRule,ref:r.MachineRuleRef,severity:r.Severity,effect:r.DecisionEffect}; }));
  set("obligations", recs("101 ·").map(function(r){ return {id:r.ObligationID,policy:r.PolicyID,actor:r.Actor,action:r.ActionRequired,timing:r.Timing,evidence:r.EvidenceRequired}; }));
  set("prohibitions", recs("102 ·").map(function(r){ return {id:r.ProhibitionID,policy:r.PolicyID,action:r.ProhibitedAction,cond:r.Condition,enforce:r.EnforcementAction}; }));
  set("permissions", recs("103 ·").map(function(r){ return {id:r.PermissionID,policy:r.PolicyID,action:r.PermittedAction,cond:r.Conditions,expiry:r.Expiry}; }));
  set("enforcementPoints", recs("104 ·").map(function(r){ return {id:r.EnforcementPointID,type:r.Type,obj:r.ObjectID,loc:r.RuntimeLocation,input:r.InputPayload,output:r.OutputDecision}; }));
  set("policyBundles", recs("105 ·").map(function(r){ return {id:r.BundleID,version:r.Version,rules:L(r.RulesIncluded),owner:r.Owner,status:r.ApprovalStatus,from:r.EffectiveFrom}; }));
  set("policyExceptions", recs("106 ·").map(function(r){ return {id:r.ExceptionID,rule:r.RuleID,obj:r.ObjectID,reason:r.Reason,approver:r.Approver,expiry:r.Expiry,evidence:r.EvidenceID}; }));
  set("policyDecisionLog", recs("107 ·").map(function(r){ return {id:r.LogID,rule:r.RuleID,decision:r.DecisionID,agent:r.AgentID,hash:r.InputHash,effect:r.Decision,reason:r.Reason,evidence:r.EvidenceID}; }));
  set("controlTests", recs("108 ·").map(function(r){ return {id:r.TestID,rule:r.RuleID,test:r.TestCase,expected:r.ExpectedDecision,actual:r.ActualDecision,result:r.Result}; }));
  set("regObligationMap", recs("109 ·").map(function(r){ return {source:r.Source,clause:r.Clause,obligation:r.ObligationID,policy:r.PolicyID,control:r.ControlID}; }));

  /* ---- Ethical Stewardship Architecture (orientation layer) ----------- */
  set("stewardshipPrinciples", recs("110 ·").map(function(r){ return {id:r.PrincipleID,name:r.Name,def:r.Definition,source:r.Source,owner:r.OwnerRoleID,status:r.Status}; }));
  set("purposeAssessments", recs("111 ·").map(function(r){ return {id:r.PurposeID,objType:r.ObjectType,obj:r.ObjectID,purpose:r.PurposeStatement,need:r.HumanNeed,nonai:r.NonAIAlternative,decision:r.Decision,assessedBy:r.AssessedBy,assessedOn:r.AssessedOn,na:B(r.NA),naReason:r.NAReason}; }));
  set("humanOutcomes", recs("112 ·").map(function(r){ return {id:r.HumanOutcomeID,obj:r.ObjectID,stakeholder:r.StakeholderID,intended:r.IntendedOutcome,harm:r.PotentialHarm,mitig:r.Mitigation,owner:r.Owner,assessedBy:r.AssessedBy,assessedOn:r.AssessedOn,na:B(r.NA),naReason:r.NAReason}; }));
  set("collectiveBenefits", recs("113 ·").map(function(r){ return {id:r.BenefitID,obj:r.ObjectID,group:r.BeneficiaryGroup,type:r.BenefitType,bank:r.BankBenefit,customer:r.CustomerBenefit,metric:r.EvidenceMetric,assessedBy:r.AssessedBy,assessedOn:r.AssessedOn,na:B(r.NA),naReason:r.NAReason}; }));
  set("authorityReviews", recs("114 ·").map(function(r){ return {id:r.AuthorityID,obj:r.ObjectID,subject:r.DataSubject,basis:r.AuthorityBasis,consent:r.ConsentRequired,appeal:r.AppealRoute,decision:r.Decision,assessedBy:r.AssessedBy,assessedOn:r.AssessedOn,na:B(r.NA),naReason:r.NAReason}; }));
  set("equityAssessments", recs("115 ·").map(function(r){ return {id:r.EquityID,obj:r.ObjectID,segment:r.Segment,pos:r.PositiveImpact,neg:r.NegativeImpact,risk:r.EquityRisk,decision:r.ReviewDecision,assessedBy:r.AssessedBy,assessedOn:r.AssessedOn,na:B(r.NA),naReason:r.NAReason}; }));
  set("sustainabilityAssessments", recs("116 ·").map(function(r){ return {id:r.SustainabilityID,obj:r.ObjectID,scale:r.ScaleScenario,ltRisk:r.LongTermRisk,trust:r.TrustImpact,cont:r.ContinueCriteria,assessedBy:r.AssessedBy,assessedOn:r.AssessedOn,na:B(r.NA),naReason:r.NAReason}; }));
  set("communityImpacts", recs("117 ·").map(function(r){ return {id:r.CommunityImpactID,obj:r.ObjectID,group:r.Group,impact:r.ImpactType,consult:r.ConsultationNeed,feedback:r.FeedbackMechanism,assessedBy:r.AssessedBy,assessedOn:r.AssessedOn,na:B(r.NA),naReason:r.NAReason}; }));
  set("stewardshipDecisions", recs("118 ·").map(function(r){ return {id:r.StewardshipDecisionID,obj:r.ObjectID,decision:r.Decision,conditions:r.Conditions,forum:r.ApproverForum,evidence:r.EvidenceID,assessedBy:r.AssessedBy,assessedOn:r.AssessedOn}; }));
  set("stewardshipEvidence", recs("119 ·").map(function(r){ return {id:r.EvidenceID,obj:r.ObjectID,type:r.EvidenceType,repo:r.Repository,status:r.ReviewStatus}; }));
  set("stewardshipMetrics", recs("120 ·").map(function(r){ return {id:r.MetricID,name:r.Name,type:r.Type,def:r.Definition,target:r.Target,owner:r.OwnerRoleID}; }));
  set("stewardshipMonitoring", recs("121 ·").map(function(r){ return {id:r.MonitorID,obj:r.ObjectID,metric:r.MetricID,threshold:r.Threshold,alertOwner:r.AlertOwner,action:r.Action}; }));
  set("stewardshipTraceability", recs("122 ·").map(function(r){ return {stakeholder:r.StakeholderID,vp:r.VPID,outcome:r.OutcomeID,useCase:r.UseCaseID,dataProduct:r.DataProductID,policy:r.PolicyID,control:r.ControlID,humanOutcome:r.HumanOutcomeID,equity:r.EquityID,evidence:r.EvidenceID}; }));
  set("stewardshipExceptions", recs("123 ·").map(function(r){ return {id:r.ExceptionID,obj:r.ObjectID,principle:r.PrincipleID,reason:r.Reason,approver:r.Approver,expiry:r.Expiry,control:r.CompensatingControl}; }));
  set("stewardshipRetirement", recs("124 ·").map(function(r){ return {id:r.RetirementID,obj:r.ObjectID,trigger:r.Trigger,finding:r.Finding,decision:r.Decision,evidence:r.EvidenceID}; }));

  /* ---- Process Step Architecture (research redesign: step-grain governed layer) --- */
  set("processSteps", recs("125 ·").map(function(r){ return {
    id:r.StepID, process:r.ProcessID, name:r.StepName, seq:N(r.StepSequence), type:r.StepType,
    trigger:r.TriggerEvent, taskType:r.TaskType, gateway:r.GatewayType, lane:r.RoleLane,
    pre:r.Precondition, post:r.Postcondition,
    inConcepts:L(r.InputInformationConcepts), inProducts:L(r.InputDataProducts),
    outConcepts:L(r.OutputInformationConcepts), outProducts:L(r.OutputDataProducts),
    decision:r.DecisionID, decisionType:r.DecisionType, decisionInput:r.DecisionInput,
    ruleSet:r.RuleSet, hitl:B(r.HITLRequired), decisionOutcome:r.DecisionOutcome,
    concept:r.ConceptID, crud:r.CRUDAction, fromState:r.FromState, toState:r.ToState, lifecycleRule:r.LifecycleRule,
    policy:r.PolicyID, control:r.ControlID, risk:r.RiskID, obligation:r.ObligationID, sod:B(r.SegregationOfDutiesFlag),
    aiUseCase:r.AIUseCaseID, aiAgent:r.AIAgentID, automation:r.AutomationRole, model:r.ModelID, confidence:r.ConfidenceThreshold,
    recordClass:r.RecordClassID, recordProduced:r.RecordProduced, evidence:r.EvidenceID, retention:r.RetentionRule, repository:r.Repository,
    kpi:r.KPIID, outcome:r.OutcomeID, quality:r.QualityMetric, cycleTime:r.CycleTimeMetric, errorMetric:r.ErrorMetric,
    execType:r.ExecutionType, responsible:r.ResponsibleParty, accountable:r.AccountableParty }; }));
  /* information concepts + lifecycle transitions attached */
  var icL={}; recs("127 ·").forEach(function(r){ (icL[r.ConceptID]=icL[r.ConceptID]||[]).push({from:r.FromState,to:r.ToState,decision:r.TriggerDecisionID,event:r.TriggerEvent,crud:r.CRUDAction,rule:r.LifecycleRule}); });
  set("informationConcepts", recs("126 ·").map(function(r){ return {id:r.ConceptID,name:r.Name,def:r.Definition,glossary:r.GlossaryTerm,capability:r.OwningCapabilityID,steward:r.StewardRole,dataProduct:r.PrimaryDataProductID,evidencePattern:r.EvidencePattern,recordClass:r.RecordClassID,lifecycle:(icL[r.ConceptID]||[])}; }));
  set("recordClasses", recs("128 ·").map(function(r){ return {id:r.RecordClassID,name:r.RecordClass,objType:r.ObjectType,retention:r.RetentionRule,disposal:r.DisposalRule,legalHold:B(r.LegalHoldFlag),owner:r.OwnerRoleID}; }));
  set("decisionRequirements", recs("129 ·").map(function(r){ return {id:r.DecisionID,name:r.DecisionName,level:r.DecisionLevel,question:r.Question,input:r.InputData,knowledge:r.KnowledgeSource,hitl:B(r.HITLRequired),hitlText:r.HITLRequired,impact:r.OutcomeImpact,aiSupport:r.AISupport,posture:r.AutomationPosture,supportUseCases:L(r.SupportingUseCases),aiInvolvement:r.AIInvolvement,advisingAgentId:r.AdvisingAgentID,advisingAgent:r.AdvisingAgent,aiModels:r.AIModels,knowledgeManagement:r.KnowledgeManagement,businessPolicy:r.BusinessPolicy}; }));
  var dt={}; recs("130 ·").forEach(function(r){ (dt[r.DecisionID]=dt[r.DecisionID]||[]).push({rule:r.RuleID,when:r.When,then:r.Then,hit:r.HitPolicy,outcome:r.OutcomeState}); }); set("decisionTables", dt);
  set("evidencePatterns", recs("131 ·").map(function(r){ return {id:r.PatternID,name:r.Pattern,when:r.WhenUsed,example:r.ExampleEvidence,recordClass:r.RecordClassID}; }));
  set("capabilityConcepts", recs("139 ·").map(function(r){ return {capability:r.CapabilityID,concept:r.ConceptID,ownership:r.OwnershipType,dataOwner:r.DataOwnerRole,steward:r.DataStewardRole,policyOwner:r.PolicyOwnerRole,quality:r.QualityDimensions,lifecycle:r.LifecycleResponsibility,records:r.RecordResponsibility}; }));
  set("recordEvidence", recs("140 ·").map(function(r){ return {recordClass:r.RecordClassID,evidence:r.EvidenceID,type:r.EvidenceType}; }));
  /* concept lifecycle ACROSS processes: which process creates / updates / deletes a concept */
  var clcBy={}; recs("142 ·").forEach(function(r){ (clcBy[r.ConceptID]=clcBy[r.ConceptID]||[]).push({seq:N(r.Seq),concept:r.Concept,process:r.ProcessID,processName:r.ProcessName,crud:r.CRUD,state:r.ToState}); });
  Object.keys(clcBy).forEach(function(k){ clcBy[k].sort(function(a,b){return a.seq-b.seq;}); });
  if(Object.keys(clcBy).length) G.conceptProcessLifecycle=clcBy;

  /* ---- Execution-level layer (Target Execution-Level Process Definition) ---- */
  set("executionTypes", recs("143 ·").map(function(r){ return {code:r.ExecutionTypeCode,name:r.ExecutionType,def:r.Definition,responsible:r.DefaultResponsible,accountable:r.DefaultAccountable}; }));
  set("stepRaci", recs("144 ·").map(function(r){ return {step:r.StepID,name:r.StepName,process:r.ProcessID,execType:r.ExecutionType,responsible:r.Responsible,accountable:r.Accountable,consulted:r.Consulted,informed:r.Informed}; }));
  set("stepAiExecution", recs("145 ·").map(function(r){ return {step:r.StepID,name:r.StepName,process:r.ProcessID,execType:r.ExecutionType,agent:r.AIAgentID,agentName:r.AgentName,model:r.ModelID,modelName:r.ModelName,useCase:r.AIUseCaseID,knowledge:r.KnowledgeManagement,policy:r.BusinessPolicy,confidence:r.ConfidenceThreshold,hitl:r.HITLRequired,guardrail:r.Guardrail}; }));
  set("stepEvidence", recs("146 ·").map(function(r){ return {step:r.StepID,name:r.StepName,recordClass:r.RecordClassID,recordProduced:r.RecordProduced,evidence:r.EvidenceID,retention:r.RetentionRule,repository:r.Repository}; }));
  set("stepStateTransitions", recs("147 ·").map(function(r){ return {step:r.StepID,name:r.StepName,concept:r.ConceptID,conceptName:r.Concept,crud:r.CRUDAction,fromState:r.FromState,toState:r.ToState}; }));

  /* ---- AI advisory spine: models, knowledge assets, agent maps, decision map --- */
  set("aiModels", recs("148 ·").map(function(r){ return {id:r.ModelID,name:r.ModelName,type:r.ModelType,agent:r.AgentID,agentName:r.AgentName,purpose:r.Purpose,knowledge:L(r.KnowledgeSources),confidence:r.ConfidenceThreshold,modelCard:r.ModelCardID,monitoring:r.MonitoringID,owner:r.OwnerRole,risk:r.RiskTier}; }));
  set("knowledgeAssets", recs("149 ·").map(function(r){ return {id:r.KnowledgeAssetID,name:r.Name,type:r.Type,steward:r.StewardRole,description:r.Description,usedBy:L(r.UsedByAgents)}; }));
  var akBy={}; recs("150 ·").forEach(function(r){ (akBy[r.AgentID]=akBy[r.AgentID]||[]).push({id:r.KnowledgeAssetID,name:r.KnowledgeAsset,howUsed:r.HowUsed}); });
  if(Object.keys(akBy).length) G.agentKnowledge=akBy;
  var apBy={}; recs("151 ·").forEach(function(r){ (apBy[r.AgentID]=apBy[r.AgentID]||[]).push({domain:r.PolicyDomainID,name:r.PolicyDomain,examples:L(r.ExamplePolicyIDs),guidance:r.GuidanceApplied}); });
  if(Object.keys(apBy).length) G.agentPolicy=apBy;
  var daBy={}; recs("152 ·").forEach(function(r){ daBy[r.DecisionID]={agent:r.AgentID,agentName:r.AgentName,role:r.AdvisoryRole,models:r.AIModels,knowledge:r.KnowledgeManagement,policy:r.BusinessPolicy,hitl:r.HITLRequired}; });
  if(Object.keys(daBy).length) G.decisionAgents=daBy;
  /* ---- Use-Case Assessment: Value/Commercial + Readiness (6 dimensions) ---- */
  var ucv={}; recs("163 ·").forEach(function(r){ var outs=(r.OutcomeIDs?String(r.OutcomeIDs).split(","):[r.PrimaryOutcomeID]).map(function(x){return String(x||"").trim();}).filter(Boolean); ucv[r.UseCaseID]={uc:r.UseCaseID,name:r.UseCaseName,phase:r.Phase,themeId:r.ValueThemeID,theme:r.ValueTheme,outcome:r.PrimaryOutcomeID,outcomes:outs,score:N(r.ValueScore),rating:r.CommercialRating,rationale:r.Rationale}; });
  if(Object.keys(ucv).length) G.ucValue=ucv;
  var ucr={}; recs("164 ·").forEach(function(r){ (ucr[r.UseCaseID]=ucr[r.UseCaseID]||[]).push({dim:r.DimensionID,name:r.DimensionName,score:N(r.Score),level:r.MaturityLevel,rag:r.RAG,basis:r.Basis,els:String(r.Elements||"").split(/[;,]/).map(function(s){return s.trim();}).filter(Boolean)}); });
  if(Object.keys(ucr).length) G.ucReadiness=ucr;
  /* ---- Operating Model: teams, named role-holders (FTE + staffing), use-case RACI ---- */
  set("operatingTeams", recs("165 ·").map(function(r){ return {id:r.TeamID,name:r.TeamName,dept:r.Department,fn:r.Function,lead:r.LeadRoleID,leadPerson:r.LeadPerson,fte:N(r.HeadcountFTE)}; }));
  var ra={}; recs("166 ·").forEach(function(r){ ra[r.RoleID]={role:r.RoleID,name:r.RoleName,dept:r.Department,team:r.TeamID,teamName:r.TeamName,holder:r.RoleHolder,fte:N(r.FTE),status:r.AllocationStatus,notes:r.Notes}; });
  if(Object.keys(ra).length) G.roleAllocation=ra;
  var ucra={}; recs("167 ·").forEach(function(r){ (ucra[r.UseCaseID]=ucra[r.UseCaseID]||[]).push({raci:r.RACIType,role:r.RoleID,name:r.RoleName,holder:r.RoleHolder,status:r.StaffingStatus,fte:N(r.FTEAllocated)}); });
  if(Object.keys(ucra).length) G.ucRoleAllocation=ucra;
  /* ---- North Star (OMTM) + metric tree + AI evals ---- */
  var nsr=recs("170 ·"); if(nsr.length) G.northStar={id:nsr[0].NorthStarID,name:nsr[0].Name,def:nsr[0].Definition,metric:nsr[0].Metric,unit:nsr[0].Unit,target:nsr[0].Target,current:nsr[0].Current,rag:nsr[0].RAG,owner:nsr[0].OwnerRole,cadence:nsr[0].Cadence};
  set("metricTree", recs("171 ·").map(function(r){ return {id:r.MetricID,name:r.Name,layer:r.Layer,parent:r.ParentMetricID,parentName:r.ParentName,owner:r.OwnerRole,unit:r.Unit,target:r.Target,att:N(r.Attainment),rag:r.RAG,srcType:r.SourceType,srcId:r.SourceID}; }));
  var evb={}; recs("172 ·").forEach(function(r){ (evb[r.TargetID]=evb[r.TargetID]||[]).push({id:r.EvalID,tType:r.TargetType,target:r.TargetID,targetName:r.TargetName,name:r.EvalName,cat:r.Category,metric:r.Metric,threshold:r.Threshold,method:r.Method,freq:r.Frequency,result:r.Result,status:r.Status,owner:r.OwnerRole}); });
  if(Object.keys(evb).length) G.aiEvals=evb;

  /* ---- Policy meta-model (173..181) — for the Policy Inspector ---- */
  set("policyPrinciples", recs("173 ·").map(function(r){ return {id:r.PrincipleID,policy:r.PolicyID,number:N(r.Number),name:r.Name,def:r.Definition,source:r.SourceAlignment,rationale:r.Rationale}; }));
  set("policyIntents", recs("174 ·").map(function(r){ return {id:r.IntentID,policy:r.PolicyID,category:r.OutcomeCategory,statement:r.OutcomeStatement,scope:r.Scope,severity:N(r.Severity),occurrence:N(r.Occurrence),detection:N(r.Detection),rpn:N(r.RPN),priority:r.Priority,owner:r.OwnerRole,approval:r.ApprovalStatus,theme:r.ThemeID,controls:L(r.ControlIDs)}; }));
  set("policyThemes", recs("175 ·").map(function(r){ return {code:r.ThemeID,policy:r.PolicyID,name:r.ThemeName,purpose:r.ThemePurpose,article:r.ArticleNumber,risk:r.InherentRisk,desc:r.ThemeDescription}; }));
  set("policyControls", recs("176 ·").map(function(r){ return {id:r.ControlID,policy:String(r.ControlID).replace(/-C\d+$/,""),theme:r.ThemeID,name:r.ControlName,intent:r.CoreIntent,objective:r.Objective,evidence:r.MinimumEvidence,assurance:r.AssuranceEvidence,freq:r.Frequency,responsible:r.ResponsibleRole,accountable:r.AccountableRole,accRoleId:r.AccountableRoleID,bdsRoleId:r.BusinessStewardRoleID,tsRoleId:r.TechnicalSpecialistRoleID,consulted:r.ConsultedRoles,informed:r.InformedRoles,spec:r.SpecCode}; }));
  var accBy={}; recs("177 ·").forEach(function(r){ accBy[r.ControlID]={criteria:r.AcceptanceCriteria,examples:r.EvidenceExamples,rule:r.MinimumPassRule}; });
  if(Object.keys(accBy).length) G.policyAcceptance=accBy;
  set("policyEvidence", recs("178 ·").map(function(r){ return {id:r.ArtefactID,control:r.ControlID,policy:String(r.ControlID).replace(/-C\d+$/,""),process:r.ProcessID,artefact:r.Artefact,owner:r.OwnerRole,location:r.Location,retention:r.Retention,approval:r.ApprovalState}; }));
  set("policyKPIs", recs("179 ·").map(function(r){ return {id:r.KPIID,policy:r.PolicyID,theme:r.ThemeID,controls:L(r.Controls),name:r.KPIName,target:r.Target,rationale:r.Rationale}; }));
  set("policyProcesses", recs("180 ·").map(function(r){ return {id:r.ProcessID,policy:r.PolicyID,name:r.ProcessName,desc:r.Description,cap:r.CapabilityID,capName:r.CapabilityName,responsible:r.ResponsibleRole,freq:r.Frequency,inputs:r.Inputs,outputs:r.Outputs,implements:L(r.ImplementsControls)}; }));
  set("principleControlMap", recs("181 ·").map(function(r){ return {principle:r.PrincipleID,policy:r.PolicyID,control:r.ControlID,constraint:r.ConstraintType,evidence:r.EvidenceOfAlignment}; }));

  /* ---- DMMA / Governance Readiness (AGGPSA) — knowledge areas, deliverables, stewards, comments ---- */
  set("dmmaAreas", recs("183 ·").map(function(r){ return {id:r.KnowledgeAreaID,area:r.KnowledgeArea,abbr:r.ABBR,domain:r.PolicyDomainID,level:r.DMBOKLevel,sub:r.SubLevel,attention:N(r.Attention),current:N(r.CurrentMaturity),currentLabel:r.CurrentLabel,target:N(r.TargetMaturity),targetLabel:r.TargetLabel,gap:N(r.Gap),rag:r.RAG,deliverables:N(r.Deliverables),responses:N(r.Responses),comments:N(r.Comments),inScope:N(r.InScopeDeliverables),outScope:N(r.OutOfScopeDeliverables),scopeStatus:r.ScopeStatus,reviewed:N(r.ReviewedDeliverables)}; }));
  set("dmmaDeliverables", recs("184 ·").map(function(r){ return {id:r.DeliverableID,area:r.KnowledgeAreaID,areaName:r.KnowledgeArea,domain:r.PolicyDomainID,phase:r.ActivityPhase,activity:r.Activity,deliverable:r.Deliverable,generic:r.Generic,done:r.Done,scope:r.Scope,current:N(r.CurrentMaturity),target:N(r.TargetMaturity),gap:N(r.Gap)}; }));
  set("businessStewards", recs("185 ·").map(function(r){ return {id:r.StewardID,name:r.Name,fn:r.Function,unit:r.BusinessUnit,email:r.Email,holdsRole:r.HoldsRoleID,team:r.TeamID,teamName:r.TeamName,dept:r.Department,current:N(r.CurrentMaturity),responses:N(r.Responses),comments:N(r.Comments)}; }));
  set("dmmaComments", recs("186 ·").map(function(r){ return {id:r.CommentID,steward:r.StewardID,name:r.StewardName,unit:r.BusinessUnit,area:r.KnowledgeAreaID,domain:r.PolicyDomainID,deliverable:r.Deliverable,text:r.Comment}; }));
  set("dmmaStewardScores", recs("187 ·").map(function(r){ return {steward:r.StewardID,name:r.StewardName,unit:r.BusinessUnit,area:r.KnowledgeAreaID,areaName:r.KnowledgeArea,current:N(r.CurrentMaturity),responses:N(r.Responses)}; }));

  /* ---- Critical Data Elements + decision→CDE map ---- */
  set("criticalDataElements", recs("153 ·").map(function(r){ return {id:r.CDEID,name:r.Name,def:r.Definition,term:r.BusinessTerm,concept:r.OwningConceptID,source:r.GoldenSource,steward:r.StewardRole,classification:r.Classification,dimensions:r.QualityDimensions,threshold:r.QualityThreshold,policy:r.GoverningPolicyID,tier:r.CriticalityTier,decisions:L(r.Decisions),dataType:r.DataType}; }));
  var cdeByDec={}; recs("154 ·").forEach(function(r){ (cdeByDec[r.DecisionID]=cdeByDec[r.DecisionID]||[]).push({cde:r.CDEID,name:r.CDEName,role:r.InputRole,classification:r.Classification,tier:r.CriticalityTier}); });
  if(Object.keys(cdeByDec).length) G.decisionCDEs=cdeByDec;

  /* ---- Data-product DQ control + scorecard (supplying decisions & AI agents) ---- */
  set("dataProductDQ", recs("155 ·").map(function(r){ return {id:r.DataProductID,dp:r.DataProductID,name:r.DataProductName,owner:r.OwnerRole,decisions:L(r.SuppliesDecisions),agents:L(r.SuppliesAIAgents),objective:r.ControlObjective,activity:r.ControlActivity,freq:r.Frequency,policy:r.GoverningPolicyID,evidence:r.EvidenceID,score:r.OverallScore,rag:r.OverallRAG,control:r.DQControlID}; }));
  var dqScoreBy={}; recs("156 ·").forEach(function(r){ (dqScoreBy[r.DataProductID]=dqScoreBy[r.DataProductID]||[]).push({dim:r.Dimension,target:r.Target,score:r.Score,rag:r.RAG,trend:r.Trend}); });
  if(Object.keys(dqScoreBy).length) G.dataProductScorecard=dqScoreBy;
  var agDp={}; recs("34 ·").forEach(function(r){ (agDp[r.AgentID]=agDp[r.AgentID]||[]).push({dp:r.DataProductID,purpose:r.UsagePurpose}); });
  if(Object.keys(agDp).length) G.agentDataProducts=agDp;

  /* ---- CDE DQ Profile (statistical) + value distribution ---- */
  set("cdeProfiles", recs("157 ·").map(function(r){ return {id:r.CDEID,name:r.CDEName,type:r.DataType,records:r.RecordsProfiled,nonNull:r.NonNullPct,nullPct:r.NullPct,distinct:r.DistinctCount,distinctPct:r.DistinctPct,min:r.Min,max:r.Max,mean:r.Mean,median:r.Median,std:r.StdDev,p5:r.P5,p95:r.P95,minLen:r.MinLen,maxLen:r.MaxLen,pattern:r.DominantPattern,patternPct:r.PatternPct,outlier:r.OutlierPct,lastProfiled:r.LastProfiled,profiler:r.Profiler}; }));
  var cdeDist={}; recs("158 ·").forEach(function(r){ (cdeDist[r.CDEID]=cdeDist[r.CDEID]||[]).push({bucket:r.Bucket,value:r.Value,freq:r.Frequency,pct:parseFloat(r.Percent)||0}); });
  if(Object.keys(cdeDist).length) G.cdeDistribution=cdeDist;

  /* ---- CDE DQ rules as data-contract clauses (keyed by data product) ---- */
  var cdcBy={}; recs("159 ·").forEach(function(r){ (cdcBy[r.DataProductID]=cdcBy[r.DataProductID]||[]).push({contract:r.ContractID,cde:r.CDEID,cdeName:r.CDEName,dims:r.Dimensions,threshold:r.Threshold,expr:r.RuleExpression,severity:r.Severity,enforcement:r.Enforcement,rule:r.DQRuleID,policy:r.GoverningPolicyID}); });
  if(Object.keys(cdcBy).length) G.contractDQRules=cdcBy;

  /* ---- DQ Assessment (reverse view): is each decision's data fit? ---- */
  var decA={}; recs("160 ·").forEach(function(r){ decA[r.DecisionID]={cdeCount:N(r.CDECount),fit:N(r.Fit),atRisk:N(r.AtRisk),unfit:N(r.Unfit),notAssessed:N(r.NotAssessed),dataProducts:L(r.SupplyingDataProducts),worstDP:r.WorstDPScorecardRAG,verdict:r.OverallFitness,blocking:r.BlockingIssues,recommendation:r.Recommendation,assessedOn:r.AssessedOn}; });
  if(Object.keys(decA).length) G.decisionAssessment=decA;
  var decF={}; recs("161 ·").forEach(function(r){ (decF[r.DecisionID]=decF[r.DecisionID]||[]).push({cde:r.CDEID,name:r.CDEName,tier:r.Criticality,expectation:r.Expectation,dim:r.WorstDimension,measured:r.MeasuredScore,target:r.DimensionTarget,status:r.Status,dp:r.SupplyingDataProduct,dpRag:r.DPScorecardRAG,issue:r.Issue}); });
  if(Object.keys(decF).length) G.decisionCDEFitness=decF;

  /* ---- Business-operations process structure (spec-derived) ---------- */
  // Core process flow + core actors (business-operations value chain)
  set("coreProcessFlow", recs("200 ·").map(function(r){ return {seq:N(r.Seq),phase:r.Phase,desc:r.Description,narrative:r.FlowNarrative}; }));
  set("coreActors", recs("201 ·").map(function(r){ return {id:r.ActorID,actor:r.Actor,type:r.ActorType,role:r.MappedRoleID,responsibility:r.Responsibility}; }));
  // per-process structural elements, grouped by process id
  function _group(sheet, key, mapfn){ var o={}; recs(sheet).forEach(function(r){ (o[r[key]]=o[r[key]]||[]).push(mapfn(r)); }); return o; }
  var _pact=_group("202 ·","ProcessID",function(r){ return {actor:r.Actor,raci:r.RACIRole,type:r.ActorType,role:r.MappedRoleID}; });
  if(Object.keys(_pact).length) G.processActors=_pact;
  var _pic=_group("203 ·","ProcessID",function(r){ return {item:r.InformationItem,concept:r.MappedConceptID}; });
  if(Object.keys(_pic).length) G.processInfoItems=_pic;
  var _pmf=_group("204 ·","ProcessID",function(r){ return {no:N(r.StepNo),step:r.Step}; });
  if(Object.keys(_pmf).length) G.processMainFlow=_pmf;
  var _paf=_group("205 ·","ProcessID",function(r){ return {no:N(r.StepNo),step:r.ExceptionStep}; });
  if(Object.keys(_paf).length) G.processAltFlow=_paf;
  var _pbr=_group("206 ·","ProcessID",function(r){ return {rule:r.BusinessRule,ruleId:r.MappedRuleID}; });
  if(Object.keys(_pbr).length) G.processBusinessRules=_pbr;
  var _pev={}; recs("207 ·").forEach(function(r){ _pev[r.ProcessID]=r.Output; });
  if(Object.keys(_pev).length) G.processEvidence=_pev;
  var _psr={}; recs("208 ·").forEach(function(r){ _psr[r.ProcessID]=r.SystemRequirement; });
  if(Object.keys(_psr).length) G.processSystemReq=_psr;
  set("businessRuleRegister", recs("209 ·").map(function(r){ return {id:r.RuleID,rule:r.Rule,requirement:r.Requirement}; }));
  // Business Outcome -> Value Stream (framework spine link), so a process resolves
  // upstream to the outcomes it serves via Process→Capability→ValueStream→Outcome.
  var _ovs={}, _vso={}; recs("214 ·").forEach(function(r){
    (_ovs[r.OutcomeID]=_ovs[r.OutcomeID]||[]).push(r.ValueStreamID);
    (_vso[r.ValueStreamID]=_vso[r.ValueStreamID]||[]).push(r.OutcomeID); });
  if(Object.keys(_ovs).length){ G.outcomeValueStreams=_ovs; G.valueStreamOutcomes=_vso; }
  set("processCatalogue", recs("210 ·").map(function(r){ return {id:r.ProcessID,specId:r.SpecID,name:r.Name,phase:r.Phase,owner:r.Owner,trigger:r.Trigger}; }));
  var _pca={}; recs("210 ·").forEach(function(r){ _pca[r.ProcessID]={phase:r.Phase,owner:r.Owner,trigger:r.Trigger,specId:r.SpecID}; });
  if(Object.keys(_pca).length) G.processMeta=_pca;
  // decision outcome handlers (what each outcome creates + whom it notifies) — the
  // BPMN message end events read this so the workbook is the source of truth.
  var _doh={}; recs("215 ·").forEach(function(r){
    (_doh[r.DecisionID]=_doh[r.DecisionID]||{})[r.Outcome]={
      action:r.Action, artefact:r.Artefact, party:r.NotifyParty, note:r.Note,
      pos:!/^\s*Notify\s*$/i.test(r.Action||"") };
  });
  if(Object.keys(_doh).length) G.decisionOutcomeHandlers=_doh;

  /* ---- Operational Business Policies + Policy Controls (Guidelines/Tips) ---- */
  set("businessPolicies", recs("211 ·").map(function(r){ return {id:r.PolicyID,name:r.Name,area:r.Area,owner:r.OwnerRole,purpose:r.Purpose}; }));
  set("businessPolicyControls", recs("212 ·").map(function(r){ return {id:r.ControlID,policy:r.PolicyID,policyName:r.PolicyName,name:r.ControlName,objective:r.Objective,guideline:r.Guideline,tip:r.Tip,rule:r.BusinessRuleID,requirement:r.RuleRequirement,decision:r.GovernsDecisionID,decisionName:r.DecisionName,processes:L(r.Processes),owner:r.OwnerRole,evidence:r.Evidence}; }));
  // by-decision and by-process indexes for cross-linking on other pages
  var _ctlByDec={}, _ctlByProc={};
  recs("212 ·").forEach(function(r){
    if(r.GovernsDecisionID) _ctlByDec[r.GovernsDecisionID]=r.ControlID;
    L(r.Processes).forEach(function(p){ (_ctlByProc[p]=_ctlByProc[p]||[]).push(r.ControlID); });
  });
  if(Object.keys(_ctlByDec).length) G.controlByDecision=_ctlByDec;
  if(Object.keys(_ctlByProc).length) G.controlsByProcess=_ctlByProc;
  // business-rule -> decision + control cross-reference
  set("ruleDecisionControl", recs("213 ·").map(function(r){ return {rule:r.BusinessRuleID,ruleText:r.Rule,decision:r.DecisionID,decisionName:r.DecisionName,control:r.ControlID,policy:r.PolicyID}; }));
  var _rdc={}; recs("213 ·").forEach(function(r){ _rdc[r.BusinessRuleID]={decision:r.DecisionID,decisionName:r.DecisionName,control:r.ControlID,policy:r.PolicyID}; });
  if(Object.keys(_rdc).length) G.ruleDecisionControlByRule=_rdc;

  W.NB_HYDRATED=true; try{ W.PACK && (W.PACK._hydrated=true); }catch(e){}
})();
