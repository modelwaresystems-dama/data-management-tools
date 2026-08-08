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
  var crj=recs("8 ·");
  var journeys=[];
  crj.forEach(function(j){
    var base=baseJById[j.CRJourneyID]; if(!base) return;            // only journeys that exist in base (the 4 customer LOB journeys)
    var perName=perById[j.PersonaID]?perById[j.PersonaID].PersonaName:base.persona;
    var srows=jsRows.filter(function(s){return s.JourneyID===j.CRJourneyID;}).sort(function(a,b){return (N(a.StageNo)||0)-(N(b.StageNo)||0);});
    var stages=srows.map(function(s,i){ var jsid=s.JourneyStageID, bs=(base.stages||[])[i]||{};
      return { stage:s.StageName, emotion:N(s.ExperienceScore), touchpoints:s.Touchpoints,
        kpis:(bs.kpis&&bs.kpis.length)?bs.kpis:L(s.StageMetrics),
        capabilities:(capMap[jsid]||bs.capabilities||[]),
        processes:(procMap[jsid]||bs.processes||[]),
        decisions:(bs.decisions||[]) };
    });
    journeys.push({id:j.CRJourneyID, lob:j.LineOfBusiness, name:j.Name, persona:perName, stages:stages.length?stages:(base.stages||[])});
  });
  set("journeys", journeys);

  /* ---- journey meta + stage→value-stage + CX journeys ----------------- */
  var jm={}; crj.forEach(function(j){ jm[j.CRJourneyID]={persona:j.PersonaID,vp:j.ValuePropositionID,valueStream:j.ValueStreamID,developmentObjective:j.DevelopmentObjective,stageBackbone:j.StageBackbone,outcomes:(vpo[j.ValuePropositionID]||[])}; });
  if(Object.keys(jm).length) G.journeyMeta=jm;
  var jvs={}; recs("26 ·").forEach(function(r){ jvs[r.JourneyStageID]=r.ValueStageID; });
  if(Object.keys(jvs).length) G.journeyStageValueStage=jvs;
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
  set("semanticModels", recs("16 ·").map(function(r){ return {id:r.SemanticModelID,name:r.Name,def:r.Definition,terms:L(r.GovernedTerms)}; }));
  set("cdpServices", recs("17 ·").map(function(r){ return {id:r.CDPServiceID,name:r.Name,desc:r.Description}; }));

  /* ---- data products (merge keep terms) + data contract overlay ------- */
  var dpD=recs("18 ·").map(function(r){ return {id:r.DataProductID,name:r.Name,domain:r.DomainID,desc:r.Description,cdp:L(r.RealisesCDP),ai:L(r.ServesAIUseCases)}; });
  if(dpD.length) G.dataProducts=mergeKeep(G.dataProducts, dpD, ["terms"]);
  G.dataContracts=G.dataContracts||{};
  recs("18 ·").forEach(function(r){ var b=G.dataContracts[r.DataProductID]||{};
    var schema=String(r["Schema (field:type[:pii])"]||"").split(/\s*\|\s*/).map(function(x){return x.trim();}).filter(Boolean).map(function(f){ var p=f.split(":"); return [p[0]||"", p[1]||"", (p[2]||"")]; });
    G.dataContracts[r.DataProductID]=Object.assign({}, b, {classification:r.Classification||b.classification, sources:(L(r.Producers).length?L(r.Producers):b.sources), schema:(schema.length?schema:b.schema)}); });

  /* ---- data domains / ownership roles --------------------------------- */
  set("dataDomains", recs("19 ·").map(function(r){ return {id:r.DataDomainID,name:r.Name,owner:r.Owner,steward:r.Steward,def:r.Definition}; }));
  set("ownershipRoles", recs("20 ·").map(function(r){ return {id:r.RoleID,name:r.RoleName,accountableFor:r.AccountableFor,owns:r.OwnsObjects,collaborators:r.KeyCollaborators}; }));

  /* ---- governance layer ----------------------------------------------- */
  var bg={}; recs("41 ·").forEach(function(r){ bg[r.OutcomeID]={role:r.AccountableRole,forum:r.ReviewForum,cadence:r.ReviewCadence,rights:r.DecisionRights}; });
  if(Object.keys(bg).length) G.boGovernance=bg;
  set("governanceCouncils", recs("67 ·").map(function(r){ return {id:r.CouncilID,name:r.Name,mandate:r.Mandate,members:L(r.MembersRoles),cadence:r.Cadence,escalation:r.EscalationPath}; }));
  set("raci", recs("68 ·").map(function(r){ return {id:r.RACI_ID,objType:r.ObjectType,objId:r.ObjectID,a:r.Accountable,r:r.Responsible,c:L(r.Consulted),i:L(r.Informed)}; }));
  set("policyDomains", recs("62 ·").map(function(r){ return {id:r.PolicyDomainID,name:r.Name,scope:r.Scope,owner:r.OwnerRoleID,category:r.Category||"Enterprise"}; }));
  set("policies", recs("63 ·").map(function(r){ return {id:r.PolicyID,domain:r.PolicyDomainID,statement:r.Statement,owner:r.OwnerRoleID,status:r.Status}; }));
  set("controls", recs("64 ·").map(function(r){ return {id:r.ControlID,policy:r.PolicyID,objective:r.ControlObjective,activity:r.ControlActivity,freq:r.Frequency,evidence:r.EvidenceType}; }));
  set("riskRegister", recs("69 ·").map(function(r){ return {id:r.RiskID,obj:r.ObjectID,type:r.RiskType,desc:r.Description,like:r.Likelihood,impact:r.Impact,control:r.MitigationControlID,owner:r.OwnerRoleID}; }));
  set("controlEvidence", recs("65 ·").map(function(r){ return {control:r.ControlID,evidence:r.EvidenceID,required:r.EvidenceRequired,freq:r.ReviewFrequency}; }));
  set("evidenceRegister", recs("66 ·").map(function(r){ return {id:r.EvidenceID,name:r.EvidenceName,obj:r.ObjectID,owner:r.OwnerRoleID,repo:r.RepositoryLocation,status:r.ReviewStatus}; }));
  set("recordsRetention", recs("70 ·").map(function(r){ return {id:r.RecordClassID,cls:r.RecordClass,objType:r.ObjectType,retention:r.RetentionRule,disposal:r.DisposalRule,legalHold:B(r.LegalHoldFlag)}; }));
  set("auditAssurance", recs("71 ·").map(function(r){ return {id:r.AssuranceID,control:r.ControlID,method:r.TestMethod,result:r.Result,finding:r.Finding,owner:r.RemediationOwner}; }));
  set("modelCards", recs("73 ·").map(function(r){ return {id:r.ModelCardID,uc:r.UseCaseID,use:r.IntendedUse,limits:r.Limitations,metrics:r.Metrics,fairness:r.FairnessNotes,monitoring:r.MonitoringPlanID}; }));
  set("promptRegister", recs("74 ·").map(function(r){ return {id:r.PromptID,agent:r.AgentID,purpose:r.PromptPurpose,version:r.Version,status:r.ApprovalStatus,records:r.RecordsClassID}; }));
  set("aiDecisionLog", recs("75 ·").map(function(r){ return {id:r.DecisionLogID,uc:r.UseCaseID,segment:r.CustomerSegment,output:r.DecisionOutput,override:B(r.HumanOverride),ts:r.Timestamp,evidence:r.EvidenceID}; }));
  set("dataAssets", recs("98 ·").map(function(r){ return {id:r.DataAssetID,dp:r.DataProductID,name:r.AssetName,type:r.AssetType,layer:r.Layer,platform:r.StoragePlatformID,format:r.Format,pii:B(r.PII),owner:r.Owner}; }));
  set("storagePlatforms", recs("99 ·").map(function(r){ return {id:r.StoragePlatformID,name:r.Name,type:r.PlatformType,zone:r.Zone,region:r.Region,owner:r.Owner,notes:r.Notes}; }));

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
  set("purposeAssessments", recs("111 ·").map(function(r){ return {id:r.PurposeID,objType:r.ObjectType,obj:r.ObjectID,purpose:r.PurposeStatement,need:r.HumanNeed,nonai:r.NonAIAlternative,decision:r.Decision}; }));
  set("humanOutcomes", recs("112 ·").map(function(r){ return {id:r.HumanOutcomeID,obj:r.ObjectID,stakeholder:r.StakeholderID,intended:r.IntendedOutcome,harm:r.PotentialHarm,mitig:r.Mitigation,owner:r.Owner}; }));
  set("collectiveBenefits", recs("113 ·").map(function(r){ return {id:r.BenefitID,obj:r.ObjectID,group:r.BeneficiaryGroup,type:r.BenefitType,bank:r.BankBenefit,customer:r.CustomerBenefit,metric:r.EvidenceMetric}; }));
  set("authorityReviews", recs("114 ·").map(function(r){ return {id:r.AuthorityID,obj:r.ObjectID,subject:r.DataSubject,basis:r.AuthorityBasis,consent:r.ConsentRequired,appeal:r.AppealRoute,decision:r.Decision}; }));
  set("equityAssessments", recs("115 ·").map(function(r){ return {id:r.EquityID,obj:r.ObjectID,segment:r.Segment,pos:r.PositiveImpact,neg:r.NegativeImpact,risk:r.EquityRisk,decision:r.ReviewDecision}; }));
  set("sustainabilityAssessments", recs("116 ·").map(function(r){ return {id:r.SustainabilityID,obj:r.ObjectID,scale:r.ScaleScenario,ltRisk:r.LongTermRisk,trust:r.TrustImpact,cont:r.ContinueCriteria}; }));
  set("communityImpacts", recs("117 ·").map(function(r){ return {id:r.CommunityImpactID,obj:r.ObjectID,group:r.Group,impact:r.ImpactType,consult:r.ConsultationNeed,feedback:r.FeedbackMechanism}; }));
  set("stewardshipDecisions", recs("118 ·").map(function(r){ return {id:r.StewardshipDecisionID,obj:r.ObjectID,decision:r.Decision,conditions:r.Conditions,forum:r.ApproverForum,evidence:r.EvidenceID}; }));
  set("stewardshipEvidence", recs("119 ·").map(function(r){ return {id:r.EvidenceID,obj:r.ObjectID,type:r.EvidenceType,repo:r.Repository,status:r.ReviewStatus}; }));
  set("stewardshipMetrics", recs("120 ·").map(function(r){ return {id:r.MetricID,name:r.Name,type:r.Type,def:r.Definition,target:r.Target,owner:r.OwnerRoleID}; }));
  set("stewardshipMonitoring", recs("121 ·").map(function(r){ return {id:r.MonitorID,obj:r.ObjectID,metric:r.MetricID,threshold:r.Threshold,alertOwner:r.AlertOwner,action:r.Action}; }));
  set("stewardshipTraceability", recs("122 ·").map(function(r){ return {stakeholder:r.StakeholderID,vp:r.VPID,outcome:r.OutcomeID,useCase:r.UseCaseID,dataProduct:r.DataProductID,policy:r.PolicyID,control:r.ControlID,humanOutcome:r.HumanOutcomeID,equity:r.EquityID,evidence:r.EvidenceID}; }));
  set("stewardshipExceptions", recs("123 ·").map(function(r){ return {id:r.ExceptionID,obj:r.ObjectID,principle:r.PrincipleID,reason:r.Reason,approver:r.Approver,expiry:r.Expiry,control:r.CompensatingControl}; }));
  set("stewardshipRetirement", recs("124 ·").map(function(r){ return {id:r.RetirementID,obj:r.ObjectID,trigger:r.Trigger,finding:r.Finding,decision:r.Decision,evidence:r.EvidenceID}; }));

  W.NB_HYDRATED=true; try{ W.PACK && (W.PACK._hydrated=true); }catch(e){}
})();
