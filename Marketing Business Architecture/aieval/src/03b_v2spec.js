<script>
/* =====================================================================
   v2 SPEC. Modelware AI Evaluation Framework v2: five assurance lenses,
   eight configurable assurance concerns, the Requirement / Specification
   / Run / Result separation, and the governance lifecycle from S1 to G6.

   Source: "Modelware AI Evaluation Framework v2" and "Modelware AI
   Governance Lifecycle: Research Challenge and Target Design".
   ===================================================================== */

/* ---------------- five assurance lenses ---------------- */
var LENSES = [
  {id:"business", cls:"b",  name:"Business &amp; Value Assurance", short:"Business &amp; Value",
   blurb:"The claim is falsifiable, the outcome moves, and the value is worth sustaining.",
   owns:"Value hypothesis, outcome, KPI, baseline, target, adoption, unit economics, no-AI alternative."},
  {id:"decision", cls:"d",  name:"Decision &amp; Human-Control Assurance", short:"Decision &amp; Control",
   blurb:"The decision is improved, governable, contestable and owned by a named human.",
   owns:"Decision specification, HITL boundary, override, appeal, escalation, automation bias, fairness in outcome."},
  {id:"data",     cls:"da", name:"Information, Data &amp; Semantic Assurance", short:"Data &amp; Semantic",
   blurb:"Inputs are fit, lawful, timely and mean what the user believes they mean.",
   owns:"Data products, CDEs, contracts, DQ rules, semantic binding, construct validity, consent and lineage."},
  {id:"system",   cls:"s",  name:"System &amp; Engineering Assurance", short:"System &amp; Engineering",
   blurb:"New in v2. The model, the agent, the integration and the operational envelope are separately assured.",
   owns:"Model validity, robustness, calibration, interfaces, dependencies, fallback, latency, availability, security, tool behaviour, change control.",
   why:"v1 combined agent and model into one spine layer and filed technical performance under Decision Quality, leaving no home for integration, component interaction, operational resilience, cybersecurity or tool behaviour."},
  {id:"records",  cls:"r",  name:"Evidence &amp; Accountability Assurance", short:"Evidence &amp; Accountability",
   blurb:"Renamed from Records Quality. Control effectiveness and evidence quality are separate constructs.",
   owns:"Governance controls, approvals, decision logs, model and system cards, evidence integrity, retention, traceability."}
];

/* ---------------- eight configurable assurance concerns ---------------- */
var CONCERNS = [
  {n:1, id:"purpose", lens:"business",
   name:"Purpose, Relevance &amp; Value Realisation",
   q:"Is the claim falsifiable, is AI the right instrument, and did the outcome actually change?",
   treat:"Retains Relevance. Absorbs cost-effectiveness, adoption and sustainability.",
   lead:"Programme / Strategy / M&amp;E", contrib:"Executive; portfolio investment authority; beneficiaries",
   tests:"Value hypothesis, no-AI comparison, proxy to intermediate to realised outcome, unit economics, adoption.",
   evidence:"Benefit hypothesis, baseline and target, outcome study, cost per successful decision, adoption record.",
   from:[1,8]},

  {n:2, id:"control", lens:"decision",
   name:"Decision Quality &amp; Human Control",
   q:"Is the decision improved, and can a human understand, challenge, override and appeal it?",
   treat:"Strengthens HITL, appeal, override, automation bias and decision consequences.",
   lead:"Decision owner", contrib:"Programme; Responsible AI; users",
   tests:"Decision accuracy, calibration, override rate, escalation precision, automation-bias probe, appeal feasibility.",
   evidence:"Decision specification, HITL protocol, override and appeal logs, user comprehension evidence.",
   from:[5]},

  {n:3, id:"datafit", lens:"data",
   name:"Data, Semantic &amp; Measurement Fitness",
   q:"Are inputs fit, lawful and timely, and does the metric measure the construct it claims to measure?",
   treat:"Splits data quality from ethics. Adds construct validity and semantic correctness.",
   lead:"Data / Semantic steward", contrib:"Decision owner; privacy; M&amp;E",
   tests:"Contract conformance, DQ rules, CDE profile, semantic conformance, construct validity, measurement error.",
   evidence:"Data Product Canvas, DQ scorecard, CDE register, contract version, semantic binding, construct-validity note.",
   from:[2], co:["decision"]},

  {n:4, id:"modelval", lens:"system",
   name:"Model Validity, Reliability &amp; Explainability",
   q:"Is the component valid and reliable for this decision, not merely strong in the abstract?",
   treat:"Replaces generic Technical Performance.",
   lead:"Model owner", contrib:"Independent evaluator; decision owner",
   tests:"Performance by slice, calibration, robustness, drift, repeatability, explanation fidelity.",
   evidence:"Model card, validation set and version, slice results, calibration curve, robustness suite.",
   from:[3]},

  {n:5, id:"resilience", lens:"system",
   name:"System, Integration &amp; Operational Resilience",
   q:"Does the assembled system behave correctly, degrade safely and recover?",
   treat:"New in v2. Interfaces, dependencies, fallback, latency, availability and graceful degradation.",
   lead:"System owner", contrib:"Engineering; operations; supplier management",
   tests:"End-to-end task completion, tool-use correctness, interface contract, failover, latency, availability, recovery.",
   evidence:"System card, integration test results, fallback drill, SLO dashboard, incident and dependency register.",
   from:[]},

  {n:6, id:"safety", lens:"decision",
   name:"Safety, Fairness &amp; Societal Impact",
   q:"Who could be misclassified, excluded or harmed, and how would we know before they are?",
   treat:"Retains harms and fairness. Permits qualitative impact review where numbers would distort the question.",
   lead:"Responsible AI / Safeguarding", contrib:"Affected communities; programme; ethical reviewer",
   tests:"Subgroup outcome, representation, guardrail violation, misuse scenario, structured impact rubric.",
   evidence:"Fairness results by slice, guardrail test, community consultation record, reviewer rationale and dissent.",
   from:[4], co:["business"]},

  {n:7, id:"security", lens:"system",
   name:"Security, Privacy &amp; Misuse Resistance",
   q:"Can this be attacked, leaked, jailbroken or used for something it was never authorised to do?",
   treat:"New explicit concern in v2. Adversarial testing, leakage, prompt injection, tooling and access.",
   lead:"Security / Privacy", contrib:"System owner; data owner; legal",
   tests:"Red-team, prompt injection, data leakage, access control, tool permission boundary, retention conformance.",
   evidence:"Red-team report, leakage test, access-control evidence, privacy assessment, permission matrix.",
   from:[], co:["data"]},

  {n:8, id:"accountability", lens:"records",
   name:"Transparency, Governance &amp; Evidence Integrity",
   q:"Do the controls operate, and can every claim be reconstructed from retained evidence?",
   treat:"Combines demonstrability, traceability, control effectiveness and evidence quality.",
   lead:"Records / Governance / Responsible AI", contrib:"All lens owners; internal audit",
   tests:"Control design and operating effectiveness, evidence completeness, integrity, locatability, approval trail.",
   evidence:"Gate decision register, approval record, decision log, evidence hash and URI, retention class.",
   from:[6]}
];

/* v1 dimensions that did not survive as concerns, and why */
var LEGACY_NOTES = [
  {n:7, name:"Monitoring &amp; Evaluation over Time",
   fate:"Cross-cutting attribute",
   why:"Monitoring is a lifecycle activity, not a quality property. Cadence, monitoring window, trigger condition and retest deadline are now fields on every applicable requirement rather than a separate dimension."},
  {n:6, name:"Governance, Accountability &amp; Compliance",
   fate:"Split",
   why:"Control effectiveness and evidence quality are different constructs. Both now sit inside concern 8, which tests them separately."},
  {n:2, name:"Data Quality, Governance &amp; Ethics",
   fate:"Split",
   why:"Data fitness moved to concern 3. The ethics half moved to concern 6, where a qualitative rubric is permitted."}
];

/* ---------------- structural weaknesses of v1 ---------------- */
var V1_WEAKNESS = [
  ["AIEval is a results and check register, not a requirements model","No defensible pre-execution specification","Separate Requirement, Specification, Plan, Run and Result"],
  ["Target-driven extraction only","Evals start from model or agent rather than claims, risks and obligations","Generate requirements from Golden Thread, EAR, value and readiness"],
  ["Agent and model combined","Component-level failures become ambiguous","Separate System, Agent, Model, Tool, Retriever, Prompt and Interface"],
  ["Result and threshold stored as text","Weak typing, units, tolerances and uncertainty","Typed MetricDefinition and AcceptanceCriterion"],
  ["Eight RAG dimensions are manually assessed","Score can become opinion detached from underlying tests","Compute concern-level views from requirements and results"],
  ["Monitoring is a dimension","Monitoring is a lifecycle activity, not a quality property","Attach cadence and triggers to every applicable requirement"],
  ["Governance and records are grouped","Control effectiveness and evidence quality are different constructs","Distinguish Governance Control Eval from Evidence Integrity Eval"],
  ["No write-back contract","Cards, EAR and FutureState become stale","Event-driven write-back with version and ownership rules"],
  ["No evaluator, dataset or rubric versions","Reproduction and comparison are weak","Version the complete measurement configuration"],
  ["No explicit privacy, security or integration concern","Material risks can disappear inside broad dimensions","Make them selectable assurance concerns"]
];


/* =====================================================================
   THE ETHICAL ASSESSMENT REVIEW.

   The EAR is authoritative for ethical determination and risk acceptance.
   The Eval layer references its stable IDs and never restates its findings.

   Seven domain assessments carry the substance. Each one names a harm, a
   mitigation, an affected group or a continue criterion, which is what a
   v2 Eval Requirement needs. Conditions are therefore generated from the
   domains rather than from the single Conditions field on the verdict,
   which in the current model carries one placeholder string on every row.
   ===================================================================== */

/* the five tiering questions, weighted, COLLECT and SUM.
   ImpactScore >= 5 Full review, 2 to 4 Short form, below 2 Out of scope. */
var EAR_TIERING = [
  {k:"person",     q:"Does it decide about a person?",                       pulls:["human","authority"]},
  {k:"vulnerable", q:"Does it touch a vulnerable, beneficiary or minor segment?", pulls:["community","equity"]},
  {k:"personal",   q:"Does it use consent-bearing or personal data?",        pulls:["authority"]},
  {k:"reverse",    q:"Is it hard to reverse?",                               pulls:["human","sustain"]},
  {k:"scale",      q:"Does it operate at scale?",                            pulls:["equity","sustain"]}
];

var EAR_DEPTHS = [
  {id:"Full review", steps:"11 of 11", drops:"nothing", min:5},
  {id:"Short form",  steps:"varies with the answers", drops:"the domains no answer reached for", min:2},
  {id:"Out of scope",steps:"3: tiering, verdict, sign-off", drops:"all seven domains and the evidence record", min:0}
];

var EAR_SCOPE_RULE = "The depth is proposed by the tiering answers and set by a person. A depth "+
  "lighter than the proposal is the accountable owner's call, recorded in their name, never the "+
  "assessor's. A dropped domain is never closed: it stays visible, labelled not required at this "+
  "depth, with the answers that would have required it and a route to assess it anyway on a "+
  "written basis.";

/* the seven domains, in the order the EAR assesses them */
var EAR_DOMAINS = [
  {k:"purpose", always:true, sheet:"PurposeAssessment", idf:"PurposeID",
   name:"Purpose", concern:"purpose", lens:"business", type:"Attestation",
   why:"Nothing proceeds without a legitimate human reason.",
   claimF:"PurposeStatement", harmF:"", mitF:"", altF:"NonAIAlternative", decF:"Decision",
   behaviour:"The stated purpose is a legitimate human need, and AI is the right instrument for it."},

  {k:"human", sheet:"HumanOutcomesAssessment", idf:"HumanOutcomeID",
   name:"Human outcomes", concern:"safety", lens:"decision", type:"Outcome",
   why:"It is measured on the person it lands on.",
   claimF:"IntendedOutcome", harmF:"PotentialHarm", mitF:"Mitigation", stakeF:"StakeholderID", ownerF:"Owner",
   behaviour:"The intended outcome is realised and the named potential harm does not occur."},

  {k:"benefit", always:true, sheet:"CollectiveBenefitAssessme", idf:"BenefitID",
   name:"Collective benefit", concern:"purpose", lens:"business", type:"Outcome",
   why:"A harm weighed without a benefit beside it is half an argument.",
   claimF:"CustomerBenefit", altClaimF:"EntrepreneurBenefit", groupF:"BeneficiaryGroup", metricF:"EvidenceMetric",
   behaviour:"The claimed collective benefit is evidenced, not asserted."},

  {k:"authority", sheet:"AuthorityToControlReview", idf:"AuthorityID",
   name:"Authority to control", concern:"control", lens:"decision", type:"Attestation",
   why:"Who may say no, and how.",
   claimF:"AuthorityBasis", subjF:"DataSubject", consentF:"ConsentRequired", appealF:"AppealRoute", decF:"Decision",
   behaviour:"The authority basis holds, and the appeal route is one a person could actually use."},

  {k:"equity", sheet:"OutcomeEquityAssessment", idf:"EquityID",
   name:"Outcome equity", concern:"safety", lens:"decision", type:"Performance",
   why:"Once a segment is named, who does worse is unavoidable.",
   claimF:"PositiveImpact", harmF:"NegativeImpact", segF:"Segment", riskF:"EquityRisk", decF:"ReviewDecision",
   behaviour:"No named segment experiences a materially worse outcome than the others."},

  {k:"sustain", sheet:"EthicalSustainabilityAsse", idf:"SustainabilityID",
   name:"Ethical sustainability", concern:"purpose", lens:"business", type:"Monitoring trigger",
   why:"It has to be survivable over time.",
   claimF:"TrustImpact", harmF:"LongTermRisk", scaleF:"ScaleScenario", contF:"ContinueCriteria",
   behaviour:"The continue criteria hold as the use case scales."},

  {k:"community", sheet:"CommunityImpactAssessment", idf:"CommunityImpactID",
   name:"Community impact", concern:"safety", lens:"decision", type:"Attestation",
   why:"A segment is a community, not a set of data subjects.",
   claimF:"ImpactType", groupF:"Group", consultF:"ConsultationNeed", feedF:"FeedbackMechanism",
   behaviour:"The community affected has a real feedback route, and consultation happened where it was needed."}
];

/* the five EAR roles and what each may not do. This is where v2 gets
   IndependenceRequired from, rather than inventing a rule of its own. */
var EAR_ROLES = [
  {r:"Respondent",       owns:"The facts: what it does, who it touches, what data. The maturity artefacts.",
   cannot:"Record a verdict or sign off."},
  {r:"Assessor",         owns:"Tiering, the seven domain assessments, the evidence record.",
   cannot:"Record the verdict on a use case they assessed. Set a lighter depth in their own name."},
  {r:"Reviewer",         owns:"The reasoning, then the verdict. Exceptions, retirement reviews, minutes.",
   cannot:"Verdict on their own assessment. Sign off."},
  {r:"Accountable owner",owns:"Lighter depth, sign-off, maturity targets, confirming dependencies.",
   cannot:"Sign off a verdict they recorded."},
  {r:"Sponsor",          owns:"Exceptions, renewals, retirement.", cannot:"Sign off."}
];

var EAR_VERDICTS = ["Approve","Approve with monitoring","Conditional approve","Redesign","Reject"];

/* the Council decides four things and no others */
var COUNCIL_DECIDES = [
  "Renew, close, or accept the loss on a lapsed exception",
  "Confirm a suspension, or restore the use case",
  "Confirm, extend or withdraw the conditions on a conditional approval",
  "Accept an exposure, or fund the capability that would close it"
];
var COUNCIL_DOES_NOT_DECIDE = "The pre-gate verdict, the sign-off, and any of the seven domain assessments.";

/* evidence integrity, as the EAR tests it: four booleans, all must hold */
var EAR_EVIDENCE_TESTS = ["Dated","Attributed","Owned","Locatable"];

var EAR_SUSPENSION_RULE = "Suspension is a consequence, not a status. A lapsed exception withdraws "+
  "approval automatically and outranks sign-off. In v2 that is a stop threshold, and it fires "+
  "G5 triggered change and revalidation.";

/* ---------------- controlled tags ---------------- */
var EVAL_TYPES = ["Business/outcome","Decision/human-control","Data/semantic/privacy","Model",
  "System/integration","GenAI/RAG","Agent/tool-use","Security/red-team","Governance/control",
  "Operational/monitoring","Evidence-quality"];

var GENAI_METRICS = ["Groundedness","Citation correctness","Retrieval coverage","Context sufficiency",
  "Instruction adherence","Tool selection","Parameter correctness"];

var REQ_TYPES = ["Performance","Control effectiveness","Outcome","Attestation","Monitoring trigger",
  "Constraint","Prohibition","Comparative baseline"];

var GATE_CRITICALITY = ["Gate-critical","Gate-relevant","Informational"];
var APPROVAL_STATES  = ["Draft","Proposed","Approved","Superseded","Retired"];
var SPEC_STATES      = ["Draft","Proposed","Approved","Measured","Verified","Superseded","Retired"];

var COMPONENT_TYPES = ["System","Agent","Model","Tool","Retriever","Prompt","Interface","Data product","Human process"];

var EVALUATOR_TYPES = ["Automated metric","Human rubric","LLM-as-judge","Statistical test",
  "Independent review","Attestation","Observational study"];

/* lifecycle phase of a requirement: where in the life of the use case it bites */
var LIFECYCLE_PHASES = [
  {id:"intake",   name:"Intake / Qualification", state:"Draft",
   need:"Purpose, stakeholders, decision, prohibited use, initial claims"},
  {id:"ear",      name:"EAR / Value / Readiness", state:"Proposed",
   need:"Conditions, harms, assumptions, KPI, baseline, readiness constraints"},
  {id:"design",   name:"Design", state:"Approved",
   need:"Components, failure modes, methods, datasets, thresholds, evidence and owners"},
  {id:"build",    name:"Build", state:"Approved / Measured",
   need:"Test cases, environment versions, early results and remediation"},
  {id:"predeploy",name:"Pre-deployment", state:"Verified",
   need:"Independent evidence, residual findings and assurance-gate decisions"},
  {id:"deploy",   name:"Deployment", state:"Measured",
   need:"Production configuration, launch evidence and monitoring activation"},
  {id:"monitor",  name:"Monitoring", state:"Measured / Verified",
   need:"Drift, incidents, override, outcomes, control effectiveness"},
  {id:"change",   name:"Change / Revalidation", state:"Superseded to Approved",
   need:"New versions and affected-requirement impact analysis"},
  {id:"retire",   name:"Retirement", state:"Retired",
   need:"Stop evidence, retained records, dependency and access closure"}
];

/* ---------------- the two schemas, shown as reference ---------------- */
var REQ_SCHEMA = [
  ["Identity","EvalRequirementID, RequirementTitle, RequirementType, RequirementVersionID","Eval-owned"],
  ["Source","SourceArtefactType, SourceRecordID, SourceVersionID, SourceConditionID, SourceURI, SourceHash","Seeded / reference"],
  ["Traceability","AIUseCaseID, GoldenThreadAnchorType, GoldenThreadAnchorID, RelatedRequirementIDs","Seeded"],
  ["Claim","BusinessClaim, RiskClaim, ObligationClaim, AssumptionID","Seeded, refined by Eval"],
  ["Scope","SystemID, ComponentType, ComponentID, ComponentVersionID, ContextOfUseID","Seeded / reference"],
  ["Behaviour","BehaviourOrOutcome, FailureModeID, FailureConsequence, AffectedStakeholderID, AffectedSegmentID","Seeded"],
  ["Classification","AssuranceLens, AssuranceConcern, EvalType, LifecyclePhase, GateCriticality","Eval-enriched"],
  ["Control","HumanControlRequirementID, ControlID, ProhibitedBehaviour, FallbackRequirement","Seeded"],
  ["Accountability","RequirementOwnerRoleID, ReviewerRoleID, IndependenceRequired, ApprovalStatus","Seeded"],
  ["Change","EffectiveFrom, EffectiveTo, SupersedesRequirementID, RetestTriggerID, RetirementCondition","Eval-owned"]
];

var SPEC_SCHEMA = [
  ["Measure","MetricID, ConstructName, OperationalDefinition, Formula, Unit, Aggregation, SliceDimensions"],
  ["Acceptance","BaselineValue, TargetValue, ThresholdValue, WarningThreshold, StopThreshold, Operator, Tolerance"],
  ["Uncertainty","ConfidenceLevel, ConfidenceIntervalMethod, MinimumSampleSize, PowerOrPrecisionRequirement"],
  ["Test material","DatasetID, DatasetVersionID, ScenarioSetID, TestCaseID, GroundTruthSource, CoverageRequirement"],
  ["Method","MeasurementMethodID, EvaluatorType, EvaluatorID, RubricVersionID, JudgeModelVersionID, JudgePromptVersionID"],
  ["Environment","EnvironmentID, ConfigurationVersionID, ToolVersion, RandomSeed, RepetitionCount"],
  ["Evidence","EvidenceTypeRequired, EvidenceAcceptanceCriteria, RetentionClassID, EvidenceRepositoryURI"],
  ["Operations","ExecutionCadence, MonitoringWindow, TriggerCondition, RetestDeadline, SpecificationStatus"]
];

var RUN_FIELDS = "EvalRunID, ExecutedAt, ActualValue, Numerator, Denominator, ConfidenceInterval, "+
  "ComputedStatus, CoverageAchieved, EvaluatorAgreement, EvidenceID, EvidenceHash, EnvironmentID.";

/* ---------------- source to eval population ---------------- */
var SOURCE_MAP = [
  ["Business Architecture",
   "Golden Thread IDs, stakeholder, outcome and KPI, stage, capability, process, decision, CDE, control",
   "Validated or failed link, architecture gap, capability and readiness finding",
   "Architecture identity and relationships"],
  ["AI Use-Case Governance Record",
   "Purpose, users, role boundary, intended and prohibited use, decision, outputs, assumptions, success criteria",
   "Approved context, proven limitations, realised outcomes, use restrictions",
   "Use-case intent and accountable owner"],
  ["WAKAMOSO EAR",
   "ConditionID, harm, group, mitigation, oversight, redress, continue and stop criteria",
   "Test evidence, residual finding, control effectiveness, incident or trigger",
   "Ethical determination and risk acceptance"],
  ["Prioritisation Value",
   "Value hypothesis, KPI, baseline, target, cost ceiling, adoption assumption",
   "Proxy and result, realised benefit, value variance",
   "Portfolio priority decision"],
  ["Readiness / System Design",
   "Boundaries, dependencies, interfaces, controls, fallback, observability, constraints",
   "Tested readiness, integration failures, operational limitations",
   "Architecture and design specification"],
  ["System Card",
   "System composition, context, interfaces, supplier and version facts",
   "End-to-end results, operational limits, incidents, monitoring posture",
   "System identity and configuration"],
  ["Model Card",
   "Model identity, training provenance, intended task, initial limitations",
   "Performance, slices, robustness, fairness, validation and failures",
   "Model identity and development facts"],
  ["Data and semantic artefacts",
   "Concepts, CDEs, contracts, lineage, quality rules",
   "Observed quality, semantic mismatch, fitness finding",
   "Definitions, schemas and contracts"],
  ["Eval",
   "Requirements, specifications, runs, computed status, evidence and remediation",
   "Not applicable",
   "Eval execution records"]
];

/* ---------------- golden thread to eval mapping ---------------- */
var THREAD_EVAL_MAP = [
  {k:"stakeholder", lay:"Stakeholder", q:"Who receives benefit or bears harm?", pre:"StakeholderID, segment",
   fam:"Engagement, subgroup outcome", fail:"Unrepresented stakeholder. EAR or gate escalation.", concern:"safety"},
  {k:"vp", lay:"Value Proposition", q:"Is the promised value testable?", pre:"Business claim",
   fam:"Claim review", fail:"Unfalsifiable value. Stop or reshape.", concern:"purpose"},
  {k:"outcome", lay:"Outcome + KPI", q:"Did the outcome change?", pre:"Metric, baseline, target",
   fam:"Outcome study", fail:"The model works but the value fails.", concern:"purpose"},
  {k:"vstream", lay:"Value Stream / Stage", q:"Where should value appear?", pre:"Context, phase",
   fam:"Stage-cycle metrics", fail:"Benefit lands at the wrong stage.", concern:"purpose"},
  {k:"capability", lay:"Capability", q:"Can the organisation sustain it?", pre:"Owner, readiness",
   fam:"Capability evidence", fail:"Pilot-only or conditional.", concern:"purpose"},
  {k:"process", lay:"Process / Step", q:"Does the workflow perform safely?", pre:"Environment, fallback",
   fam:"Process simulation", fail:"Bottleneck or control bypass.", concern:"resilience"},
  {k:"decision", lay:"Decision", q:"Is the decision improved and governable?", pre:"Inputs, outputs, HITL",
   fam:"Decision accuracy, calibration, override", fail:"Wrong or unchallengeable decision.", concern:"control"},
  {k:"usecase", lay:"AI Use Case", q:"Is AI appropriate within scope?", pre:"Purpose, prohibited use",
   fam:"No-AI comparison, misuse scenarios", fail:"Reject or narrow the context.", concern:"purpose"},
  {k:"agent", lay:"Agent / System", q:"Does orchestration behave correctly?", pre:"Tools, interfaces",
   fam:"Task completion, tool-use, recovery", fail:"Unauthorised action or system failure.", concern:"resilience"},
  {k:"model", lay:"Model", q:"Is the component valid and reliable?", pre:"Model and version",
   fam:"Performance, robustness, calibration", fail:"Retrain, replace or restrict.", concern:"modelval"},
  {k:"semantic", lay:"Semantic Model / Concept", q:"Does the output mean what users think?", pre:"Bound concepts",
   fam:"Semantic conformance", fail:"Invalid interpretation. Semantic gate.", concern:"datafit"},
  {k:"dataproduct", lay:"Data Product / CDE", q:"Are inputs fit, lawful and timely?", pre:"Contract, CDE",
   fam:"Contract, DQ and privacy testing", fail:"Block deployment.", concern:"datafit"},
  {k:"records", lay:"Records / Evidence", q:"Can claims be reconstructed?", pre:"Evidence class",
   fam:"Completeness, integrity, locatability", fail:"Assurance claim prohibited.", concern:"accountability"},
  {k:"governance", lay:"Governance / Controls", q:"Are controls operating effectively?", pre:"ControlID, owner",
   fam:"Design and operating effectiveness", fail:"Gate remains open or risk acceptance.", concern:"accountability"}
];

var LANE_JOIN = "The value lane and the decision and evidence lane join at Outcome and KPI, on the "+
  "decision consequence. A technically accurate output matters only if it improves the governed decision, "+
  "and only if that decision contributes to the declared outcome. This is what stops one use case being "+
  "associated with two different outcomes and collecting two different evaluation verdicts.";

/* ---------------- EAR condition expansion pattern ---------------- */
var EAR_PATTERN = [
  {suffix:"A", type:"Performance", name:"Measurable control-performance requirement",
   hint:"The control that mitigates the harm, measured. Typed metric, operator, threshold and tolerance."},
  {suffix:"B", type:"Outcome", name:"Affected-group outcome review",
   hint:"Did the group named in the condition experience the outcome the condition was written to protect?"},
  {suffix:"C", type:"Attestation", name:"Qualitative human-oversight attestation",
   hint:"Structured rubric, independent reviewer, rationale, dissent and evidence attestation. Not a number."},
  {suffix:"D", type:"Monitoring trigger", name:"Post-deployment monitoring trigger",
   hint:"The continue or stop criterion, wired to a production signal and a suspension route."}
];

var EAR_LINK_FIELDS = "ConditionID, harm or claim, stakeholder, failure mode, mitigation or control, "+
  "method, evidence, continue and stop threshold, retest trigger.";

var QUALITATIVE_RULE = "Conditions involving dignity, legitimacy, proportionality, meaningful appeal, "+
  "community acceptability or ethical justification must not be forced into numbers. Use a structured "+
  "rubric, an independent reviewer, recorded rationale, recorded dissent and an evidence attestation.";

/* ---------------- value to eval ---------------- */
var VALUE_MATURATION = [
  ["Benefit hypothesis","Falsifiable causal claim","Proxy, then intermediate outcome, then realised KPI"],
  ["Baseline and target","Acceptance criterion","Re-baseline only through approved change"],
  ["Theory of Change assumptions","Separate assumption requirements","Confirmed, weakened or falsified"],
  ["Adoption expectation","Human and process behaviour metric","Actual utilisation and override pattern"],
  ["Cost ceiling","Unit-economics threshold","Total cost and cost per successful decision"],
  ["No-AI alternative","Comparative baseline","Continue only where incremental value is demonstrated"]
];

var VALUE_RULE = "Model performance and business value must remain separate. Accuracy is neither "+
  "adoption nor outcome realisation.";

/* ---------------- readiness domains replacing Benefit x Risk ---------------- */
var READINESS_DOMAINS = [
  {id:"RD-DATA",   name:"Data",                      lens:"data",     ask:"Are the inputs governed, available, lawful and of known quality?"},
  {id:"RD-TECH",   name:"Technology / Model",        lens:"system",   ask:"Does a validated component exist, and is its version controlled?"},
  {id:"RD-INT",    name:"Integration",               lens:"system",   ask:"Do the interfaces, contracts and dependencies exist and hold?"},
  {id:"RD-PROC",   name:"Process",                   lens:"decision", ask:"Is the workflow defined, with the decision point and fallback named?"},
  {id:"RD-PEOP",   name:"People / Skills",           lens:"business", ask:"Do the named roles exist, with the skill and the time to operate this?"},
  {id:"RD-GOV",    name:"Governance / Controls",     lens:"records",  ask:"Are the controls designed, owned and operating?"},
  {id:"RD-OBS",    name:"Observability / Operations",lens:"system",   ask:"Can we see it running, and would we know when it stopped being safe?"},
  {id:"RD-SUP",    name:"Supplier / Dependency",     lens:"system",   ask:"What do we not control, and what happens when it changes?"},
  {id:"RD-CHG",    name:"Change / Recovery",         lens:"records",  ask:"Can we roll back, and is the change route governed?"}
];

var READINESS_RULE = "Business Benefit multiplied by Delivery Risk is useful for portfolio sequencing "+
  "and too coarse to seed assurance specifications. Every readiness weakness must generate a requirement, "+
  "a design constraint, a dependency, a remediation item or an explicit not-testable-yet finding. "+
  "Lowering a composite score is not a response.";

/* ---------------- measurement integrity ---------------- */
var INTEGRITY_CONTROLS = [
  "Version the metric, formula, dataset, scenario set, rubric, judge model and prompt, environment and code.",
  "Preserve raw observations and calculate status at read time.",
  "Record sample size, missingness, slices, confidence interval and coverage.",
  "Calibrate human rubrics. Record inter-rater agreement and adjudication.",
  "Validate LLM-as-judge against a human gold set. Test position and order bias and repeatability.",
  "Keep developer, evaluator and approver roles distinct where risk warrants it.",
  "Prohibit silent threshold changes. Supersede the specification instead.",
  "Hash evidence and retain source URI, provenance and chain of custody.",
  "Treat overrides as governed decisions, never as altered measurements.",
  "Evaluate whether the metric measures the intended construct. NIST recommends measurement-error models and construct-validity assessment."
];

var COMPUTED_ONLY_RULE = "There is no editable final Pass or Fail field. ComputedStatus is derived from "+
  "the typed observed value, the operator, the threshold and the tolerance. A human exception is a "+
  "separate signed override decision, recorded against the run and never written over the measurement.";

/* ---------------- retest triggers ---------------- */
var RETEST_TRIGGERS = ["Component or version change","Prompt or tool change","New data product or semantic definition",
  "Threshold or KPI change","New affected group","Incident","Supplier change","Population shift",
  "Legal or regulatory change","Scheduled cadence","Monitoring breach of continue criteria"];

/* ---------------- system of record and synchronisation ---------------- */
var SYNC_RULES = [
  "Every entity gets a stable business ID plus an immutable VersionID.",
  "References carry SourceURI, SourceVersionID, SourceHash, EffectiveFrom and RetrievedAt.",
  "Excel and HTML may cache a snapshot, but cached values are read-only and visibly versioned.",
  "Never manually copy names, KPI definitions, CDE definitions, model versions or control text.",
  "Publish change events and run impact analysis against every linked EvalRequirementID.",
  "Write-back sends IDs, verified values, evidence references and effective dates, not flattened prose.",
  "On a factual conflict the source owner wins. Eval records the discrepancy and blocks the affected assurance claim."
];

var CHANGE_EVENTS = ["UseCaseChanged","ConditionApproved","ArchitectureLinkChanged","ModelReleased",
  "DataContractChanged","EvalCompleted","ThresholdBreached","IncidentRaised"];

/* ---------------- the governance lifecycle, S1 to G6 ---------------- */
var LIFECYCLE = [
  {id:"S1", kind:"stage", hard:false, name:"Intake",
   purpose:"Register the complete candidate before analysis.",
   inputs:"Purpose; affected decision; intended users; sponsor; affected parties; data classes; jurisdiction; AI and non-AI alternative.",
   who:"Portfolio owner validates completeness.",
   exit:"Living Use-Case Governance Record; UseCaseID."},

  {id:"G0", kind:"gate", hard:true, name:"Admissibility",
   purpose:"Prevent prohibited, clearly unlawful or ethically indefensible concepts entering investment scoring.",
   inputs:"Legal and prohibited-use screen; foreseeable harms; affected rights; reversibility; vulnerability; appeal feasibility. Could this use be permissible at all?",
   who:"Legal and Compliance plus Ethical Reviewer. Proceed, redesign, hold, reject.",
   exit:"Triage record; preliminary risk and impact tier; reasons; required EAR depth.",
   outcomes:["Proceed","Redesign","Hold","Reject"]},

  {id:"S2", kind:"stage", hard:false, iterative:true, name:"Qualification bundle",
   purpose:"Develop sufficient evidence for an investment decision.",
   inputs:"Value hypothesis, baseline and target, architecture link, readiness, cost range, data dependency, EAR conditions, candidate failure modes, HITL boundary and eval intent.",
   who:"Business owner, architect, data owner, evaluator and steward work in parallel.",
   exit:"Qualification pack; provisional Eval Requirements; assurance plan."},

  {id:"G1", kind:"gate", hard:true, name:"Candidate investment",
   purpose:"Decide whether to fund discovery or concept work. This is not ethical approval and not deployment approval.",
   inputs:"Is the candidate admissible? Is value falsifiable? Can critical conditions be tested? Is evidence proportionate to spend?",
   who:"Portfolio Investment Authority. Fund, conditional fund, defer, redesign, stop.",
   exit:"Priority decision, funding envelope, assurance intensity and accountable owner.",
   outcomes:["Fund","Conditional fund","Defer","Redesign","Stop"]},

  {id:"S3", kind:"stage", hard:false, name:"Proportionate EAR and design",
   purpose:"Complete the short or full EAR and translate findings into solution constraints.",
   inputs:"Full affected-party analysis; purpose; harms; equity; authority; oversight; consultation; conditions; system boundary; non-AI alternative.",
   who:"Independent assessor, then reviewer verdict, then accountable-owner sign-off, retaining the existing segregation of duties.",
   exit:"Signed EAR; ConditionIDs; System Card v0.x; detailed Eval Plan."},

  {id:"G2", kind:"gate", hard:true, hardNote:"HARD for material-impact use", name:"Design and pilot authorisation",
   purpose:"Prevent solution lock, real-person testing or procurement without acceptable design controls.",
   inputs:"Are EAR conditions implemented in requirements? Are data lawful and governed? Are human controls and eval thresholds defined?",
   who:"Ethical Reviewer, Legal and Privacy, Risk, Data Owner and System Owner. Proceed, conditional proceed, redesign, hold, reject.",
   exit:"Approved requirements baseline; data-product contracts; authorised test scope.",
   outcomes:["Proceed","Conditional proceed","Redesign","Hold","Reject"],
   component:["G1","G2"]},

  {id:"S4", kind:"stage", hard:false, iterative:true, name:"Build, configure and development evals",
   purpose:"Produce evidence and remediate failure.",
   inputs:"Functional tests; model and system tests; fairness; robustness; security; data quality; usability; HITL and override; benefit proxy; records quality.",
   who:"Engineering and model owner execute; an independent evaluator verifies; risk owners accept no result merely because it was recorded.",
   exit:"Versioned EvalRuns, defects, remediation decisions, updated cards."},

  {id:"G3", kind:"gate", hard:true, name:"Pre-deployment evidence acceptance",
   purpose:"Determine whether the tested version meets the thresholds set before testing and the EAR conditions.",
   inputs:"Correct environment and version? Representative eval data? Thresholds met? Exceptions approved and expiring? Residual risk acceptable?",
   who:"Independent validation and eval lead; condition owners; Responsible AI; accountable system owner.",
   exit:"Signed evidence pack, resolved and open conditions, residual-risk record.",
   outcomes:["Accept","Accept with conditions","Reject","Return to build"],
   component:["G3","G5","G6"]},

  {id:"G4", kind:"gate", hard:true, name:"Deployment authorisation",
   purpose:"Authorise one specific system and model version in one defined context.",
   inputs:"G3 closed; policies and legal obligations satisfied; monitoring, incident, appeal, fallback and rollback plans operational; release documentation complete.",
   who:"Deployment and Release Authority, distinct from the builder.",
   exit:"GateDecisionID; release System Card and Model Card; deployment record; monitoring baseline.",
   outcomes:["Authorise","Authorise with conditions","Hold","Refuse"],
   component:["G4"]},

  {id:"S5", kind:"stage", hard:false, iterative:true, name:"Operate and monitor",
   purpose:"Confirm continued safety, value and control effectiveness.",
   inputs:"Performance, fairness and drift; overrides; escalation queues; complaints; incidents; data and supplier changes; realised value against baseline.",
   who:"Operations owner, model owner, data owner, business owner and Responsible AI monitor.",
   exit:"Monitoring evidence; condition attestations; value-realisation record."},

  {id:"G5", kind:"gate", hard:true, hardNote:"HARD when triggered", name:"Triggered change and revalidation",
   purpose:"Control material changes, threshold breaches or context expansion.",
   inputs:"Has intended use, data, model, supplier, population, risk or law changed? Did monitoring breach the continue criteria?",
   who:"Change Authority plus the original gate owners. Continue, restrict, rollback, redesign, suspend, retire.",
   exit:"New version lineage; revised EAR, evals and cards; supersession record.",
   outcomes:["Continue","Restrict","Rollback","Redesign","Suspend","Retire"]},

  {id:"G6", kind:"gate", hard:true, name:"Retirement closure",
   purpose:"Retire without losing accountability or creating residual risk.",
   inputs:"Dependencies removed? Access revoked? Records retained? Data and model disposal lawful? Stakeholders informed?",
   who:"System Owner plus Records plus Security and Privacy.",
   exit:"RetirementID, final card status, retained evidence and lessons learned.",
   outcomes:["Closed","Closed with residual risk","Blocked"]}
];

var LIFECYCLE_PRINCIPLE = "Ethical acceptability is a precondition, not a business-value weight. A high-value "+
  "quadrant means investment priority. It never means ethical approval or deployment approval.";

var LIFECYCLE_CHANGES = [
  "Use a tiered ethical process. Universal legal and ethical admissibility screening for every candidate, then a proportionate full EAR before solution commitment, pilot or build for material-impact use.",
  "Start eval specification during qualification. Success claims, failure modes, human-control rules, metrics and provisional thresholds should exist before prioritisation commits funding.",
  "Execute evals iteratively during development and before deployment, then continue them in production.",
  "Start documentation early, but distinguish the records. A living Use-Case Governance Record at intake, a System Card when the solution concept exists, and a Model Card only when a specific model exists."
];

var OLD_SEQUENCE = "Portfolio, then EAR, then Prioritisation, then Evals, then Model Card.";
var NEW_MNEMONIC = "Identify, establish acceptability, select investment, prove claims, disclose and govern. "+
  "Valid as an executive mnemonic. Not defensible as a literal waterfall.";

/* ---------------- systems of record ---------------- */
var LINEAGE = [
  ["Use-case identity, purpose, decision node, sponsor, lifecycle status","AI Use-Case Portfolio Register","UseCaseID into every artefact"],
  ["Ethical impacts, review depth, verdict, conditions, exceptions","EAR Register","EARReviewID, RiskTier, ConditionID"],
  ["Value hypothesis, baseline, target, cost, readiness and rank","Prioritisation Register","PriorityAssessmentID and ValueHypothesisID into the eval plan"],
  ["Data products, CDEs, semantics, contracts and lineage","Data Product Catalogue and Contract Register","DataProductID, ContractVersionID and CDEID"],
  ["Metrics, thresholds, datasets, methods, results and remediation","Eval Plan and Eval Run Register","EvalPlanID, EvalRunID, MetricID, RemediationID"],
  ["System composition and dependencies","System Registry and System Card","SystemID, ComponentID, deployed context"],
  ["Specific model design, version, training and fine-tuning, model limitations","Model Registry and Model Card","ModelID and ModelVersionID"],
  ["Formal gate outcomes and decision rights","Gate Decision Register","GateDecisionID, decision maker, date, conditions"],
  ["Evidence files","Controlled Evidence Repository","EvidenceID, immutable URI and hash, owner, retention class"],
  ["Production metrics, incidents, overrides, complaints and retirement","Monitoring and Incident Register","MonitoringPlanID, RiskID, IncidentID, RetirementID"]
];

var SHARED_METADATA = "UseCaseID, SystemID, ModelID and ModelVersionID, DecisionID, DataProductID, "+
  "EARReviewID, ConditionID, EvalPlanID and EvalRunID, GateDecisionID and EvidenceID, plus owner, "+
  "status, effective date and version on every one of them.";

/* ---------------- card projections ---------------- */
var CARD_LEVELS = [
  {id:"uc", name:"Use-Case Governance Record",
   before:"Purpose, owner, users, decision, intended and prohibited use",
   during:"Success criteria, role boundary, assumptions",
   after:"Approved context, value evidence, restrictions",
   when:"Created at intake. Lives for the whole life of the use case."},
  {id:"sys", name:"System Card",
   before:"Components, interfaces, environment, suppliers, autonomy, tools",
   during:"System tests, fallback, monitoring and threat scenarios",
   after:"Integration reliability, incidents, tool failures, operational limitations",
   when:"Created when the solution concept exists, at S3."},
  {id:"mod", name:"Model Card",
   before:"Model and version, task, training and data provenance, architecture",
   during:"Datasets, metrics, slices, thresholds, judge and rubric",
   after:"Actual performance, uncertainty, fairness, robustness, limitations and the validation decision",
   when:"Created only when a specific model exists. Never at idea stage."}
];

var CARD_RULE = "A Model Card is a governed projection of model facts and verified results. It is not the "+
  "Eval system of record. Do not call an idea-stage business record a Model Card when no model exists.";

/* ---------------- roadmap ---------------- */
var V2_ROADMAP = [
  ["P0","Requirement, Specification, Run and Result separation; stable IDs and versions; source provenance; explicit system and component scope; the computed-status-only rule; EAR condition mapping; the write-back contract; security, privacy and system assurance; lifecycle and change triggers."],
  ["P1","Replace RAG dimension entry with result-derived assurance views; revise the readiness domains; add evaluator, dataset and rubric governance; card projections; the Golden Thread relationship table; gate criticality and the remediation and retest entities."],
  ["P2","Dataverse implementation; event automation; dashboards; reusable scenario libraries; evaluator-calibration analytics; external assurance-pack views."]
];

var V2_BOTTOM_LINE = "v1 is a strong facilitated assurance workshop and evidence-pack generator. v2 must "+
  "become a living, versioned assurance control plane whose central object is the Eval Requirement, "+
  "anchored to the Golden Thread and proven by evidence.";
</script>
