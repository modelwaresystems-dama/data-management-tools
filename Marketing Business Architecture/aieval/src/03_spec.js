<script>
/* =====================================================================
   SPEC: the training design, the evaluation framework and the canvas.
   Content follows the redesigned 90-minute session: experience the
   ambiguity first, reveal the theory second, build the framework third,
   decide last.
   ===================================================================== */
var APP_VERSION = "2.1.0";

var PILLARS = [
  {id:"business", cls:"b",  name:"Business Quality",  blurb:"Align AI with strategic outcomes and KPIs: the theory of change holds and the value is real.",
   owns:"Value proposition, outcome, KPI, benefit hypothesis, cost and sustainment."},
  {id:"decision", cls:"d",  name:"Decision Quality",  blurb:"Establish precise, governable decision nodes with human-in-the-loop oversight.",
   owns:"Decision specification, thresholds, escalation, override, technical performance, fairness."},
  {id:"data",     cls:"da", name:"Data Quality",      blurb:"Certified data products, critical data elements, contracts and semantic binding.",
   owns:"Data products, CDEs, contracts, DQ rules, semantic model, consent and lineage."},
  {id:"records",  cls:"r",  name:"Records Quality",   blurb:"Audit trails, model cards, decision logs and evidence retention.",
   owns:"Model card, prompt register, decision logs, approvals, retention, evidence pack."}
];

var DIMENSIONS = [
  {n:1, id:"relevance",  name:"Relevance & Problem Definition", pillar:"business",
   q:"Are we solving the right decision, and is AI the right instrument for it?",
   lead:"Programme / Strategy / M&E", contrib:"Executive; beneficiaries",
   tests:"Value proposition, outcome, KPI, theory of change, stakeholder value.",
   evidence:"Outcome/KPI trace, benefit hypothesis, baseline and target, no-AI alternative."},
  {n:2, id:"data",       name:"Data Quality, Governance & Ethics", pillar:"data",
   q:"Is the evidence representative, lawful, semantically clear and fit for purpose?",
   lead:"Data / Research", contrib:"Programme; privacy; safeguarding",
   tests:"CDEs, data contract, semantic binding, consent and lineage.",
   evidence:"Data Product Canvas, DQ rules, CDE register, contract, lineage."},
  {n:3, id:"technical",  name:"Technical Performance", pillar:"decision",
   q:"Does the model perform sufficiently for this decision, not merely in the abstract?",
   lead:"AI team", contrib:"M&E; decision owner",
   tests:"Accuracy, calibration, drift, robustness, explainability.",
   evidence:"AI Eval metrics, model card, validation set, calibration evidence."},
  {n:4, id:"equity",     name:"Equity, Fairness & Do-No-Harm", pillar:"decision",
   q:"Who could be misclassified, excluded or harmed, and how would we know?",
   lead:"Responsible AI / Safeguarding", contrib:"Beneficiaries; programme; data",
   tests:"Outcome equity, representation, guardrails.",
   evidence:"Fairness check, representation check, guardrail test, risk log."},
  {n:5, id:"human",      name:"Human-Centred Design & Usability", pillar:"decision",
   q:"Can users understand, challenge, override and escalate?",
   lead:"Decision users / Programme", contrib:"AI; M&E; beneficiaries",
   tests:"HITL clarity, override, trust, escalation precision.",
   evidence:"HITL logs, escalation precision, override rate, user feedback."},
  {n:6, id:"governance", name:"Governance, Accountability & Compliance", pillar:"records",
   q:"Who approves, who accepts the risk, and who retains the evidence?",
   lead:"Executive / RAI / Records", contrib:"All pillar owners",
   tests:"Owners, decision logs, model registry, policy evidence.",
   evidence:"Role allocation, decision log, model card, approval record, policy evidence."},
  {n:7, id:"monitoring", name:"Monitoring & Evaluation over Time", pillar:"records",
   q:"What drift, outcome and human-override signals trigger action?",
   lead:"M&E and AI", contrib:"Data; programme; RAI",
   tests:"Drift, semantic SLIs, rollback and monitoring.",
   evidence:"Monitoring plan, SLO dashboard, incident log, rollback plan."},
  {n:8, id:"cost",       name:"Cost-Effectiveness & Sustainability", pillar:"business",
   q:"Is the deeper intervention, and the AI that supports it, worth sustaining?",
   lead:"Executive / Finance", contrib:"Programme; M&E; Data/AI",
   tests:"Total cost of ownership and sustainability of the intervention evidence.",
   evidence:"Cost model, adoption evidence, sustainment plan, unit cost per decision."}
];

var DEFAULT_GATES = [
  {id:"G1", name:"Data product binding",  crit:"The use case has certified source data products, or a defined certified input product.", rule:"Block scale if no governed source."},
  {id:"G2", name:"Semantic binding",      crit:"The use case binds to governed information concepts and semantic model terms.",           rule:"Block scale if terms undefined."},
  {id:"G3", name:"Eval integrity",        crit:"Recorded and computed statuses align across every check.",                                 rule:"Block scale if a mismatch is unresolved."},
  {id:"G4", name:"Responsible AI accountability", crit:"A named accountable reviewer owns model governance, risk acceptance and ethics.",  rule:"Block scale if the owner is absent."},
  {id:"G5", name:"HITL and guardrails",   crit:"Escalation precision and guardrail thresholds are met or formally risk-accepted.",         rule:"Block scale if thresholds fail."},
  {id:"G6", name:"Evidence pack",         crit:"A signed pack holds the model card, lineage, logs, results, decisions and retention.",     rule:"Block external assurance if absent."}
];

var SPINE_LAYERS = [
  {k:"stakeholder", lay:"Stakeholder"},        {k:"vp",        lay:"Value Proposition"},
  {k:"outcome",     lay:"Outcome + KPI"},      {k:"vstream",   lay:"Value Stream"},
  {k:"vstage",      lay:"Value Stage"},        {k:"capability",lay:"Capability"},
  {k:"process",     lay:"Process / Step"},     {k:"decision",  lay:"Decision"},
  {k:"usecase",     lay:"AI Use Case"},        {k:"agent",     lay:"AI Agent / Model"},
  {k:"semantic",    lay:"Semantic Model"},     {k:"dataproduct",lay:"Data Product"},
  {k:"domain",      lay:"Data Domain"},        {k:"cde",       lay:"Critical Data Elements"},
  {k:"records",     lay:"Records / Evidence"}, {k:"governance",lay:"Governance"}
];

/* ---------------- the 90-minute flow ---------------- */
var PHASES = [
  {id:"A", name:"Phase A: Practical challenge before theory", time:"0–25 min",
   note:"Participants must experience the ambiguity of classifying an intervention before any model is shown."},
  {id:"B", name:"Phase B: Reveal the theory", time:"25–45 min",
   note:"The Iceberg Model and Theory of Change are introduced only once the room has felt why a deeper model is needed."},
  {id:"C", name:"Phase C: Build the AI Evaluation Framework", time:"45–80 min",
   note:"Five assurance lenses, eight configurable concerns, one shared canvas. Every exercise generates Eval Requirements rather than a flipchart."},
  {id:"D", name:"Phase D: Decide and close", time:"80–90 min",
   note:"Gates, a conditional decision, and the completed evaluation framework."}
];

var STEPS = [
 {n:1, ph:"A", t:"0–3", title:"The challenge: where would you intervene?",
  slide:"Title only, no theory. Present the situation: the programme is delivering activity, but the desired outcome is not consistently evident. Where should the next intervention focus? State plainly that this is a hypothetical training case.",
  facil:"Welcome participants. Say: “You have 20 minutes before I show you any model.” Do not define terms, do not show the Iceberg, do not mention AI.",
  out:"None",
  fields:[{k:"scenario", label:"Training case statement", type:"textarea", hint:"Seeded from the selected use case. Edit to fit the room."}]},

 {n:2, ph:"A", t:"3–7", title:"Evidence cards",
  slide:"Six short cards: a current result; a repeated trend; a delivery or support constraint; a measurement-feedback delay; a policy or incentive issue; an assumption about who is responsible for the outcome.",
  facil:"Explain that some cards are observations and others are hypotheses requiring validation. Do not tell the room which is which.",
  out:"Candidate evidence list",
  custom:"evidence"},

 {n:3, ph:"A", t:"7–15", title:"Table exercise: classify and recommend",
  slide:"Four blank zones: immediate event; recurring pattern; system structure; underlying assumption. Then: choose one intervention and state what evidence would justify it.",
  facil:"Tables classify the cards, choose an intervention depth and record their assumptions. No definitions yet. The difficulty is the lesson.",
  out:"First iceberg map; first intervention recommendation",
  custom:"classify",
  fields:[{k:"intervention", label:"Chosen intervention", type:"textarea"},
          {k:"intervention_evidence", label:"Evidence that would justify it", type:"textarea"}]},

 {n:4, ph:"A", t:"15–20", title:"Room vote: one problem, several answers",
  slide:"Voting grid: Event / Pattern / Structure / Mental model.",
  facil:"Ask each table to vote. Surface disagreement rather than resolving it. Prompt: “What made the classification difficult?”",
  out:"Disagreements and ambiguous terms",
  custom:"votes",
  fields:[{k:"ambiguous_terms", label:"Terms the room could not agree on", type:"textarea",
           hint:"These are the terms the semantic model will have to govern."},
          {k:"disagreements", label:"What the disagreement was really about", type:"textarea"}]},

 {n:5, ph:"A", t:"20–25", title:"Debrief: classification is a decision problem",
  slide:"Reveal three issues: inconsistent definitions; incomplete evidence; different stakeholder values. Introduce the decision node that must consume the classification.",
  facil:"Ask: “Would you permit an AI model to make this call alone?” Capture yes, no, or under what conditions.",
  out:"Initial HITL rule",
  fields:[{k:"hitl_initial", label:"Would you permit the model to make this call alone?", type:"select", opts:["Not captured","No, advisory only","Yes, under stated conditions","Yes, unconditionally"]},
          {k:"hitl_conditions", label:"Conditions the room attached", type:"textarea"}],
  pivot:"You have just uncovered why this use case needs systems theory, a theory of change, governed data, human judgement and an AI Evaluation Framework."},

 {n:6, ph:"B", t:"25–31", title:"The Iceberg Model revealed",
  slide:"Events → patterns → structures → mental models. Alongside: react → anticipate → redesign → transform.",
  facil:"Reclassify two of the exercise cards together. Emphasise that the Iceberg connects events to patterns, structures and mental models in order to seek system-level rather than purely reactive solutions.",
  out:"Agreed classification vocabulary",
  custom:"vocab"},

 {n:7, ph:"B", t:"31–36", title:"Theory of Change: the causal bridge",
  slide:"Need → activities → outputs → outcomes → impact, with assumptions and external factors wrapped around the chain.",
  facil:"Ask: “If we change the structure identified below the waterline, what outcome should change, through what mechanism?”",
  out:"Benefit hypothesis and assumptions",
  fields:[{k:"toc_need", label:"Need", type:"textarea"},
          {k:"toc_activities", label:"Activities", type:"textarea"},
          {k:"toc_outputs", label:"Outputs", type:"textarea"},
          {k:"toc_outcomes", label:"Outcomes", type:"textarea"},
          {k:"toc_impact", label:"Impact", type:"textarea"},
          {k:"toc_assumptions", label:"Assumptions", type:"textarea"},
          {k:"toc_external", label:"External factors", type:"textarea"},
          {k:"benefit_hypothesis", label:"Benefit hypothesis in one sentence", type:"textarea",
           hint:"“If we <do X at depth Y>, then <outcome> will change by <amount>, because <mechanism>.”"}]},

 {n:8, ph:"B", t:"36–40", title:"Where AI contributes, and where it does not",
  slide:"Four AI roles, written for this use case: organise evidence, detect patterns, classify depth, support a decision. These four are not nodes on the supplied mind map. Show the map AI branch only in order to say what we are not doing.",
  facil:"Ask participants to mark where human judgement must remain. AI is a contributor to the classification, never the owner of the intervention choice.",
  out:"AI role boundary",
  custom:"airoles",
  fields:[{k:"human_judgement", label:"Where human judgement must remain", type:"textarea"}]},

 {n:9, ph:"B", t:"40–45", title:"The use case's full golden thread",
  slide:"Two lanes: the value / outcome lane and the decision / evidence lane. Show honestly where the intended framing and the current model mapping diverge.",
  facil:"Explain the evidence distinction: what the model actually asserts today, versus the bridge the workshop proposes. Make the bridge explicit rather than pretending it already exists.",
  out:"Agreed as-is and proposed spines",
  link:"spine", linkLabel:"Open the golden thread"},

 {n:10, ph:"C", t:"45–50", title:"Who owns assurance?",
  slide:"Five assurance lenses: Business and Value; Decision and Human-Control; Information, Data and Semantic; System and Engineering; Evidence and Accountability.",
  facil:"Assign each table member a primary lens but require cross-review. A lens is an accountability view, not a complete quality taxonomy. Name the fifth lens deliberately: System and Engineering Assurance is new, and it exists because the earlier model combined agent and model into one layer and filed technical performance under decision quality, which left integration, component interaction, operational resilience, cybersecurity and tool behaviour with no owner.",
  out:"Lens ownership",
  custom:"pillars"},

 {n:11, ph:"C", t:"50–54", title:"Eight assurance concerns, and what they replaced",
  slide:"All eight concerns displayed as evaluation questions, not definitions. Two concerns are new: System, Integration and Operational Resilience, and Security, Privacy and Misuse Resistance.",
  facil:"Each participant places one question under their primary lens. Correct the overlaps openly, and be honest about what changed: a manually entered RAG score is an opinion detached from the underlying tests, so in this framework a concern's status is derived from the requirements filed under it. There is no RAG button to press. If a concern shows nothing, that is because nothing has been specified for it, and an unpopulated concern reads as green and is not.",
  out:"Concern ownership",
  custom:"dimowners"},

 {n:12, ph:"C", t:"54–61", title:"Build 1: problem, value and theory of change",
  slide:"Concern 1: Purpose, Relevance and Value Realisation. It absorbs the old cost-effectiveness and sustainability dimension.",
  facil:"Executives and programme or M&E participants define beneficiary, outcome, KPI, baseline, target, mechanism and the value-for-money question. Then hold the line that matters: model performance and business value are separate. Accuracy is neither adoption nor outcome realisation. The benefit hypothesis matures from a proxy, to an intermediate outcome, to a realised KPI, and it may only be re-baselined through an approved change.",
  out:"Problem statement; theory of change; benefit hypothesis",
  fields:[{k:"beneficiary", label:"Beneficiary", type:"text"},
          {k:"outcome_stmt", label:"Outcome", type:"text"},
          {k:"kpi", label:"KPI", type:"text"},
          {k:"baseline", label:"Baseline", type:"text"},
          {k:"target", label:"Target", type:"text"},
          {k:"mechanism", label:"Mechanism: why the AI changes the outcome", type:"textarea"},
          {k:"no_ai", label:"The no-AI alternative", type:"textarea",
           hint:"What happens if this is not built? Could rules or a manual process achieve the value more cheaply?"},
          {k:"vfm", label:"Value-for-money question and cost ceiling", type:"textarea"}],
  dims:[1,8], concerns:["purpose"]},

 {n:13, ph:"C", t:"61–68", title:"Build 2: decision and human control",
  slide:"Concern 2 Decision Quality and Human Control; Concern 6 Safety, Fairness and Societal Impact; Concern 4 Model Validity, Reliability and Explainability.",
  facil:"Define the decision node's inputs, permissible outputs, confidence threshold, explanation, escalation, override and appeal. Differentiate clearly between the human decision role and the human oversight role. The model may act, defer, or offer an additional opinion, and these are not the same thing. On concern 6, say plainly that conditions involving dignity, legitimacy, proportionality, meaningful appeal or community acceptability must not be forced into numbers. Those take a structured rubric, an independent reviewer, a recorded rationale and recorded dissent.",
  out:"Decision specification and HITL protocol",
  fields:[{k:"dec_inputs", label:"Decision inputs", type:"textarea"},
          {k:"dec_outputs", label:"Permissible outputs", type:"textarea"},
          {k:"dec_threshold", label:"Confidence threshold and what happens below it", type:"textarea"},
          {k:"dec_explanation", label:"Explanation required with each output", type:"textarea"},
          {k:"dec_escalation", label:"Escalation rule", type:"textarea"},
          {k:"dec_override", label:"Override and appeal route", type:"textarea"},
          {k:"dec_harm", label:"Who could be misclassified, excluded or harmed", type:"textarea"}],
  dims:[3,4,5], concerns:["control","safety","modelval"]},

 {n:14, ph:"C", t:"68–74", title:"Build 3: data, governance and evidence",
  slide:"Concern 3 Data, Semantic and Measurement Fitness; Concern 8 Transparency, Governance and Evidence Integrity; Concern 5 System, Integration and Operational Resilience; Concern 7 Security, Privacy and Misuse Resistance.",
  facil:"Data and AI participants identify products, CDEs, semantics and metrics, and then answer the harder question concern 3 adds: does the metric measure the construct it claims to measure? Records and governance participants specify owners, approval records, cards, logs, retention and monitored thresholds, and keep control effectiveness separate from evidence quality, because they are different constructs and they fail differently. Monitoring is not a dimension here. It is cadence, monitoring window, trigger condition and retest deadline attached to every applicable requirement.",
  out:"Product boundary; evidence register; monitoring plan",
  fields:[{k:"product_boundary", label:"Data product boundary: what the use case may and may not consume", type:"textarea"},
          {k:"semantic_binding", label:"Semantic binding: governed terms this use case inherits", type:"textarea"},
          {k:"evidence_register", label:"Evidence register: what will be retained and where", type:"textarea"},
          {k:"monitoring_plan", label:"Monitoring plan: signals, thresholds and rollback", type:"textarea"},
          {k:"rai_owner", label:"Accountable Responsible-AI owner", type:"text"}],
  dims:[2,6,7], concerns:["datafit","accountability","resilience","security"]},

 {n:15, ph:"C", t:"74–80", title:"Eval integrity challenge",
  slide:"Give participants the current results and ask them to recompute Pass or Fail themselves. Then show them where the recorded status came from, and why this framework has no field to store one.",
  facil:"Tables independently apply value, operator and threshold. Reveal why a recorded status must never substitute for a computed status. Then make the structural point: a check register is not a requirements model. Open the Requirements tab and show that the same check now carries a claim it exists to test, a typed specification written before the run, and an immutable observation. The status you are reading was computed the moment you looked at it. A human exception is a separate signed override, recorded beside the measurement and never written over it.",
  out:"Corrected metric decisions; the requirement behind each check",
  link:"register", linkLabel:"Open the eval register",
  link2:"requirements", link2Label:"Open the requirements"},

 {n:16, ph:"D", t:"80–85", title:"The gates and the signed evaluation pack",
  slide:"Six component gates: product binding, semantic binding, eval integrity, Responsible-AI owner, HITL and guardrails, signed evidence pack. Then the wider frame: where those six sit inside the governance lifecycle.",
  facil:"Ask each lens owner whether their evidence is sufficient to close its gate. An open gate is not a failure. It is a condition. Then open the Lifecycle tab and place the six honestly: they are component assurance gates, and they sit inside G2 design authorisation, G3 pre-deployment evidence acceptance and G4 deployment authorisation. They do not replace them, and none of them is the gate that decides whether this may be deployed at all. Say the principle out loud: ethical acceptability is a precondition, not a business-value weight. A high-value quadrant means investment priority. It never means ethical approval, and it never means deployment approval.",
  out:"Gate register and lifecycle gate decisions",
  link:"gates", linkLabel:"Open the gate register",
  link2:"lifecycle", link2Label:"Open the lifecycle"},

 {n:17, ph:"D", t:"85–88", title:"Table decision: stop, pilot or scale?",
  slide:"Decision options with required rationale and conditions.",
  facil:"Each table gives a 30-second decision. Reveal the model answer only after voting.",
  out:"Decision and conditions",
  link:"gates", linkLabel:"Record the decision"},

 {n:18, ph:"D", t:"88–90", title:"Close: what we built",
  slide:"Show the completed chain: problem → theory of change → decision → use case → requirement → specification → run → evidence → concern → gate → data product.",
  facil:"Final message: “AI quality is not model accuracy alone; it is the defensibility of the entire decision and evidence chain.” Add the v2 sentence: the central object is not the score. It is the Eval Requirement, anchored to the golden thread and proven by evidence.",
  out:"Agreed AI Eval Framework",
  link:"pack", linkLabel:"Open the evidence pack",
  fields:[{k:"close_commitments", label:"Commitments leaving the room: who does what, by when", type:"textarea"}]}
];

var EVIDENCE_SEED = [
  {t:"A current result is below the desired outcome.", kind:"Observation"},
  {t:"Similar results recur across time, cohorts or settings.", kind:"Observation"},
  {t:"A delivery or frontline support constraint limits what can be achieved.", kind:"Hypothesis"},
  {t:"Measurement reaches decision-makers too late to change anything.", kind:"Observation"},
  {t:"A policy or incentive arrangement rewards activity rather than outcome.", kind:"Hypothesis"},
  {t:"An assumption about who is responsible for the outcome goes unexamined.", kind:"Hypothesis"}
];

var ICE_LAYERS = [
  {k:"event",   name:"Events",           lev:"React: visible tip",  hint:"Observable outcomes, immediate symptoms, reactive 'quick fix' responses."},
  {k:"pattern", name:"Patterns & trends",lev:"Anticipate",           hint:"Recurring behaviour over time, systemic tendencies, anticipatory intervention."},
  {k:"structure",name:"Systemic structures",lev:"Redesign",          hint:"Policies and processes, physical and digital infrastructure, information and power flows."},
  {k:"mental",  name:"Mental models",    lev:"Transform: foundation",hint:"Deeply held beliefs and assumptions, organisational worldviews, shared values."}
];

var AI_ROLES = [
  {k:"organise", name:"Organise evidence", d:"Assemble, deduplicate and structure the evidence base behind a classification."},
  {k:"detect",   name:"Detect patterns",   d:"Surface recurrence across time, cohort and setting that a human would miss."},
  {k:"classify", name:"Classify depth",    d:"Propose an iceberg depth with a confidence and the features that drove it."},
  {k:"support",  name:"Support a decision",d:"Present the classification into a named decision node. Never make the intervention choice."}
];

var CANVAS_SECTIONS = [
  {id:"s1", name:"1 · System & administrative metadata",
   blurb:"Logical ownership, classification and operational boundaries within the enterprise topology.",
   fields:[
    {k:"dp_name", l:"Data Product Name", hint:"Unique business-aligned slug, e.g. learner-outcomes-store"},
    {k:"dp_domain", l:"Data Domain ID & Name"},
    {k:"dp_owner", l:"Domain Product Owner", hint:"Accountable for value, roadmap and consumer satisfaction"},
    {k:"dp_steward", l:"Domain Data Steward", hint:"Accountable for semantic integrity, glossary alignment and access approvals"},
    {k:"dp_version", l:"Product Version", hint:"Semantic versioning, e.g. v1.0.0"},
    {k:"dp_status", l:"Lifecycle Status", type:"select", opts:["Idea","Assessed","Prioritized","Approved","Pilot","Operational","Retired"]},
    {k:"dp_class", l:"Sensitivity Classification", type:"select", opts:["Public","Internal","Confidential","Restricted"]},
    {k:"dp_masking", l:"Security & Masking Rules", type:"textarea", hint:"Policy IDs and column- or row-level constraints"}]},
  {id:"s2", name:"2 · Business intent & value proposition (the head)",
   blurb:"If you cannot define the consumer, the problem and the value in one sentence, the product should not be built.",
   fields:[
    {k:"purpose", l:"Purpose statement", type:"textarea", hint:"A single Verb + Object sentence"},
    {k:"consumers", l:"Target consumers & personas", type:"textarea", hint:"Active, immediate customers. Avoid speculative audiences"},
    {k:"gt_stakeholder", l:"Golden thread: stakeholder"},
    {k:"gt_vp", l:"Golden thread: value proposition"},
    {k:"gt_outcome", l:"Primary business outcome & KPI"},
    {k:"gt_threshold", l:"Target KPI metric threshold"},
    {k:"no_ai_alt", l:"The no-AI alternative", type:"textarea", hint:"What is the impact of not building this? Could rules or manual process do it more cheaply?"}]},
  {id:"s3", name:"3 · The semantic core (the cognitive layer)",
   blurb:"Map physical reality to logical business concepts and ground the product in the enterprise semantic layer.",
   fields:[
    {k:"sem_model", l:"Bound semantic model / information concept"},
    {k:"relationships", l:"Canonical core relationships", type:"textarea", hint:"How these entities relate to other established data products"}],
   table:"cde"},
  {id:"s4", name:"4 · The data contract & quality guarantees (the knees)",
   blurb:"Machine-readable assertions validating schema, quality dimensions and operational SLAs.",
   fields:[
    {k:"dq_rules", l:"Data quality rules & thresholds", type:"textarea", hint:"Freshness, uniqueness, completeness, validity, schema"},
    {k:"slo_fresh", l:"SLO: data freshness / latency"},
    {k:"slo_uptime", l:"SLO: uptime / availability"},
    {k:"slo_quality", l:"SLO: composite quality score"},
    {k:"slo_support", l:"SLO: support response"}]},
  {id:"s5", name:"5 · Input & experience ports (the apparatus)",
   blurb:"How data enters the product, and how it is exposed natively to consumers.",
   fields:[
    {k:"input_ports", l:"Ingestion / input ports", type:"textarea", hint:"Source system, protocol/format, frequency, permitted use"},
    {k:"output_ports", l:"Consumption / output & experience ports", type:"textarea", hint:"SQL, API, stream, BI. Polyglot interfaces without copying files"}]},
  {id:"s6", name:"6 · Usability scorecard",
   blurb:"Rate readiness against the eight usability characteristics before release.",
   table:"usability"},
  {id:"s7", name:"7 · Operation, maintenance & TCO",
   blurb:"Lifecycle, deployment pipelines, cost and deprecation.",
   fields:[
    {k:"cicd", l:"Deployment pipeline (CI/CD)", type:"textarea"},
    {k:"compute", l:"Compute & storage resources", type:"textarea"},
    {k:"versioning", l:"Evolutionary versioning strategy", type:"select", opts:["Backward","Forward","Full","Not set"]},
    {k:"deprecation", l:"Deprecation and decommissioning", type:"textarea"}]}
];

var USABILITY = [
  ["Discoverable","Published descriptor registered in the data catalog."],
  ["Addressable","Unique, stable universal address documented in the registry."],
  ["Understandable","Data dictionary, column descriptions and sample queries published."],
  ["Trustworthy","Live quality scorecards showing freshness, uniqueness and completeness."],
  ["Natively accessible","Polyglot output interfaces matching consumer tooling."],
  ["Interoperable","Global identifier standards and harmonised metric formulas."],
  ["Secure","Masking policies, row-level filters and sensitivity tags enforced natively."],
  ["Valuable on its own","Explicit mapping to a validated decision context or use case."]
];

var DEFAULT_SOURCES = [
  {ref:"E1", src:"<Company>_FutureState_Model.xlsx", use:"Authoritative enterprise model for the spine, use case, agents, data products and evals."},
  {ref:"E2", src:"Data Product Canvas", use:"Enterprise canvas defining purpose, consumers, semantic core, CDEs, contracts and ports."},
  {ref:"E3", src:"Modelware AI Evaluation Framework v2", use:"Five assurance lenses, eight configurable concerns, and the Requirement, Specification, Run and Result separation."},
  {ref:"E4", src:"Modelware AI Governance Lifecycle: Research Challenge and Target Design", use:"The S1 to G6 stage-and-gate lifecycle, tiered ethical screening and the systems-of-record lineage."},
  {ref:"E5", src:"The Four Pillars of Enterprise AI Quality (v1, superseded)", use:"Retained as the legacy view so earlier evaluations and facilitator material still resolve."},
  {ref:"W1", src:"NIST AI Risk Management Framework", use:"External grounding for trustworthy AI across design, development, use and evaluation."},
  {ref:"W2", src:"OECD evaluation criteria", use:"Relevance, coherence, effectiveness, efficiency, impact and sustainability."},
  {ref:"W3", src:"ISO/IEC 42001 and ISO/IEC 23894", use:"AI management system requirements, continual improvement and customisable AI risk management."},
  {ref:"W5", src:"EU AI Act, Article 9", use:"Documented, continuous and iterative lifecycle risk management for high-risk systems."},
  {ref:"W6", src:"OECD traceability guidance and the Model Cards paper", use:"Traceability of datasets, processes and lifecycle decisions. Model-specific reporting kept separate from use-case governance."},
  {ref:"W4", src:"Meadows, systems thinking / iceberg model", use:"Moving from events to patterns, structures and mental models."}
];
</script>
