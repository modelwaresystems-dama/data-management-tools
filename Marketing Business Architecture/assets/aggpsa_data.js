/* ============================================================================
   AGGPSA org pack — config + baked narrative overrides.
   window.ORG.aggpsa = { config: {...PACK_CONFIG overrides},
                         generic:{...GENERIC baked-section overrides} }
   The org resolver (org_switch.js) merges these when the AGGPSA source is
   selected. Model arrays come from window.AGGPSA_MODEL_SHEETS via the hydrator;
   this file only supplies the config and the baked sections the hydrator does
   NOT rebuild (aiDrivers, aiThemes, hyperPersonalisation, clv, cxo, training,
   governance narrative, capAttention, processSIPOC, decisionRules, etc.).
   ========================================================================== */
window.ORG = window.ORG || {};
window.ORG.aggpsa = {
  config:{
    client:"AGGPSA",
    identity:"Modelware · Data Management",
    engagement:"AGGPSA Ecosystem Data & Analytics Architecture",
    publishStatus:"Draft — working copy (AGGPSA business architecture, pending sign-off)",
    /* philanthropy-adapted sidebar labels (by page file) */
    navLabels:{
      "hyperpersonalisation_cdp.html":"Ecosystem Targeting",
      "ai_usecases.html":"Data & Analytics",
      "customer_journey.html":"Beneficiary Journeys",
      "governance_responsible_ai.html":"Governance",
      "business_architecture.html":"Architecture",
      "data_products.html":"Data Products"
    },
    /* landing-page copy */
    landing:{
      title:"AGGPSA Ecosystem Data & Analytics Architecture",
      lede:"An interactive business-architecture pack for Allan & Gill Gray Philanthropy South Africa — a catalytic ecosystem architect. It traces one golden thread from beneficiaries and systemic outcomes, through the Diagnose–Demonstrate–Dialogue value streams and the grant-making lifecycle, to the data, analytics and governance that make catalytic philanthropy accountable."
    }
  },
  generic:{
    /* ---- baked journeys base: the hydrator only builds a Customer/Beneficiary
       journey whose id exists in GENERIC.journeys, so AGGPSA must supply its own
       base (CRJ01..CRJ08) or the Nedbank LOB journeys leak through --------- */
    journeys:[{"id": "CJ01", "lob": "Enterprise Support", "name": "Township micro-entrepreneur journey", "persona": "Township micro-entrepreneur", "stages": [{"stage": "Discover", "emotion": 2, "touchpoints": "Community networks; word of mouth; ESO outreach", "kpis": ["Awareness; trust; reach"], "capabilities": ["C13"], "processes": ["P13"], "decisions": ["D12"]}, {"stage": "Access support", "emotion": 3, "touchpoints": "ESO intake; mobile; documentation", "kpis": ["Intake conversion; time-to-support"], "capabilities": ["C5"], "processes": ["P9"], "decisions": ["D7"]}, {"stage": "Grow", "emotion": 4, "touchpoints": "Mentoring; market access; working capital", "kpis": ["Revenue growth; jobs created"], "capabilities": ["C13"], "processes": ["P13"], "decisions": ["D12"]}, {"stage": "Sustain", "emotion": 3, "touchpoints": "Ongoing coaching; networks; markets", "kpis": ["Survival rate; resilience"], "capabilities": ["C5"], "processes": ["P9"], "decisions": ["D7"]}]}, {"id": "CJ02", "lob": "Enterprise Support", "name": "Artisan enterprise journey", "persona": "Artisan entrepreneur", "stages": [{"stage": "Train", "emotion": 4, "touchpoints": "TVET colleges; Makers Fest; workshops", "kpis": ["Skills gained; completion"], "capabilities": ["C12"], "processes": ["P12"], "decisions": ["D18"]}, {"stage": "Launch", "emotion": 2, "touchpoints": "Startup support; tooling; first customers", "kpis": ["Ventures launched; early revenue"], "capabilities": ["C10"], "processes": ["P12"], "decisions": ["D18"]}, {"stage": "Scale", "emotion": 3, "touchpoints": "Market linkages; finance; branding", "kpis": ["Growth; jobs created"], "capabilities": ["C12"], "processes": ["P12"], "decisions": ["D18"]}]}, {"id": "CJ03", "lob": "Enterprise Support", "name": "High-growth founder journey", "persona": "High-potential founder", "stages": [{"stage": "Diagnose", "emotion": 3, "touchpoints": "Diagnostic assessment; needs analysis", "kpis": ["Needs identified; fit"], "capabilities": ["C13"], "processes": ["P13"], "decisions": ["D12"]}, {"stage": "Support", "emotion": 4, "touchpoints": "Incubation; catalytic capital; mentoring", "kpis": ["Milestones met; validation"], "capabilities": ["C5"], "processes": ["P9"], "decisions": ["D7"]}, {"stage": "Scale", "emotion": 3, "touchpoints": "Growth capital; market expansion", "kpis": ["Scale; jobs created"], "capabilities": ["C13"], "processes": ["P13"], "decisions": ["D12"]}]}, {"id": "CJ04", "lob": "ESO", "name": "ESO capacitation journey", "persona": "ESO programme manager", "stages": [{"stage": "Apply", "emotion": 3, "touchpoints": "RFP; application portal; screening", "kpis": ["Application quality"], "capabilities": ["C13"], "processes": ["P13"], "decisions": ["D12"]}, {"stage": "Capacitate", "emotion": 4, "touchpoints": "Capability building; grants; technical assistance", "kpis": ["Capability uplift"], "capabilities": ["C5"], "processes": ["P9"], "decisions": ["D7"]}, {"stage": "Deliver", "emotion": 3, "touchpoints": "Programme delivery; field support", "kpis": ["Entrepreneurs reached"], "capabilities": ["C13"], "processes": ["P13"], "decisions": ["D12"]}, {"stage": "Report", "emotion": 2, "touchpoints": "M&E; reporting portal; evidence", "kpis": ["Reporting compliance; data quality"], "capabilities": ["C5"], "processes": ["P9"], "decisions": ["D7"]}]}, {"id": "CJ05", "lob": "Talent", "name": "Educator development journey", "persona": "Foundation-phase educator", "stages": [{"stage": "Recruit", "emotion": 3, "touchpoints": "Fellowship intake; school partnerships", "kpis": ["Fellows recruited"], "capabilities": ["C11"], "processes": ["P11"], "decisions": ["D11"]}, {"stage": "Train", "emotion": 4, "touchpoints": "Training; coaching; classroom materials", "kpis": ["Educators trained"], "capabilities": ["C15"], "processes": ["P11"], "decisions": ["D11"]}, {"stage": "Practise", "emotion": 2, "touchpoints": "Classroom practice; peer support; supervision", "kpis": ["Classroom adoption in stressed schools"], "capabilities": ["C11"], "processes": ["P11"], "decisions": ["D11"]}, {"stage": "Measure", "emotion": 3, "touchpoints": "Assessments; learner data", "kpis": ["Reading-for-meaning; learning gains"], "capabilities": ["C15"], "processes": ["P11"], "decisions": ["D11"]}]}, {"id": "CJ06", "lob": "Talent", "name": "Learner outcomes journey", "persona": "Foundation & youth learner", "stages": [{"stage": "Reach", "emotion": 3, "touchpoints": "Classroom; AGEC platform; materials", "kpis": ["Learners reached"], "capabilities": ["C11"], "processes": ["P11"], "decisions": ["D11"]}, {"stage": "Learn", "emotion": 3, "touchpoints": "Lessons; guided practice; assessment", "kpis": ["Literacy & numeracy gains"], "capabilities": ["C15"], "processes": ["P11"], "decisions": ["D11"]}, {"stage": "Progress", "emotion": 4, "touchpoints": "Progression; recognition; showcase", "kpis": ["Reading for meaning; progression"], "capabilities": ["C11"], "processes": ["P11"], "decisions": ["D11"]}]}, {"id": "CJ07", "lob": "Grant-Making", "name": "Grant lifecycle journey", "persona": "Grant officer", "stages": [{"stage": "Inquiry", "emotion": 3, "touchpoints": "RFP; concept notes; ToC screening", "kpis": ["Pipeline quality"], "capabilities": ["C3"], "processes": ["P1"], "decisions": ["D1"]}, {"stage": "Due diligence", "emotion": 2, "touchpoints": "Governance & financial review; site visits", "kpis": ["DD pass rate; cycle time"], "capabilities": ["C4"], "processes": ["P2"], "decisions": ["D4"]}, {"stage": "Approve", "emotion": 4, "touchpoints": "Grant committee; board approval", "kpis": ["Approval rate; strategic fit"], "capabilities": ["C14"], "processes": ["P3"], "decisions": ["D3"]}, {"stage": "Manage", "emotion": 3, "touchpoints": "Milestone gates; site visits; technical assistance", "kpis": ["Milestone adherence"], "capabilities": ["C3"], "processes": ["P4"], "decisions": ["D6"]}, {"stage": "Close", "emotion": 4, "touchpoints": "Evaluation; IMM ingestion; dialogue", "kpis": ["Outcomes; systemic learning"], "capabilities": ["C4"], "processes": ["P5"], "decisions": ["D10"]}]}, {"id": "CJ08", "lob": "Impact", "name": "IMM & learning journey", "persona": "IMM analyst", "stages": [{"stage": "Collect", "emotion": 3, "touchpoints": "Field data; surveys; instruments", "kpis": ["Data coverage & quality"], "capabilities": ["C6"], "processes": ["P8"], "decisions": ["D10"]}, {"stage": "Analyse", "emotion": 4, "touchpoints": "Systems mapping; analytics", "kpis": ["Insight generated"], "capabilities": ["C15"], "processes": ["P8"], "decisions": ["D10"]}, {"stage": "Adapt", "emotion": 3, "touchpoints": "Portfolio review; redesign", "kpis": ["Adaptations made"], "capabilities": ["C6"], "processes": ["P8"], "decisions": ["D10"]}, {"stage": "Scale", "emotion": 4, "touchpoints": "Policy engagement; institutionalisation", "kpis": ["Models scaled"], "capabilities": ["C15"], "processes": ["P8"], "decisions": ["D10"]}]}],
    /* ---- clear baked arrays the hydrator merges-keep from, so AGGPSA
       does not inherit Nedbank per-item value/risk/ext (name/theme/phase
       still come from the AGGPSA workbook) --------------------------------- */
    decisions:[],
    /* per-use-case value/risk/cost drive the Data & Analytics radar; keys
       match the aiDrivers below (systemic/evidence/leverage/reach/efficiency;
       data/model/equity/safeguard/adoption) */
    aiUseCases:[{"id": "U01", "value": {"systemic": 5, "evidence": 5, "leverage": 4, "reach": 4, "efficiency": 4}, "risk": {"data": 2, "model": 2, "equity": 2, "safeguard": 2, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U02", "value": {"systemic": 4, "evidence": 4, "leverage": 3, "reach": 3, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 3, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U03", "value": {"systemic": 4, "evidence": 4, "leverage": 3, "reach": 3, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 3, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U04", "value": {"systemic": 3, "evidence": 2, "leverage": 3, "reach": 2, "efficiency": 2}, "risk": {"data": 4, "model": 4, "equity": 3, "safeguard": 3, "adoption": 4}, "cost": 2, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U05", "value": {"systemic": 4, "evidence": 4, "leverage": 3, "reach": 3, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 3, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U06", "value": {"systemic": 5, "evidence": 5, "leverage": 4, "reach": 4, "efficiency": 4}, "risk": {"data": 2, "model": 2, "equity": 2, "safeguard": 2, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U07", "value": {"systemic": 3, "evidence": 2, "leverage": 3, "reach": 2, "efficiency": 2}, "risk": {"data": 4, "model": 4, "equity": 3, "safeguard": 3, "adoption": 4}, "cost": 2, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U08", "value": {"systemic": 4, "evidence": 4, "leverage": 3, "reach": 3, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 3, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U09", "value": {"systemic": 4, "evidence": 4, "leverage": 3, "reach": 3, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 3, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U10", "value": {"systemic": 4, "evidence": 4, "leverage": 3, "reach": 3, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 3, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U11", "value": {"systemic": 4, "evidence": 4, "leverage": 3, "reach": 3, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 3, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U12", "value": {"systemic": 5, "evidence": 5, "leverage": 4, "reach": 4, "efficiency": 4}, "risk": {"data": 2, "model": 2, "equity": 2, "safeguard": 2, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U13", "value": {"systemic": 4, "evidence": 4, "leverage": 3, "reach": 3, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 3, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U14", "value": {"systemic": 3, "evidence": 2, "leverage": 3, "reach": 2, "efficiency": 2}, "risk": {"data": 4, "model": 4, "equity": 3, "safeguard": 3, "adoption": 4}, "cost": 2, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U15", "value": {"systemic": 3, "evidence": 2, "leverage": 3, "reach": 2, "efficiency": 2}, "risk": {"data": 4, "model": 4, "equity": 3, "safeguard": 3, "adoption": 4}, "cost": 2, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U16", "value": {"systemic": 3, "evidence": 2, "leverage": 3, "reach": 2, "efficiency": 2}, "risk": {"data": 4, "model": 4, "equity": 3, "safeguard": 3, "adoption": 4}, "cost": 2, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U17", "value": {"systemic": 3, "evidence": 2, "leverage": 3, "reach": 2, "efficiency": 2}, "risk": {"data": 4, "model": 4, "equity": 3, "safeguard": 3, "adoption": 4}, "cost": 2, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U18", "value": {"systemic": 4, "evidence": 4, "leverage": 3, "reach": 3, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 3, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}],

    /* ---- AI Use-Cases framing (Data & Analytics) ---------------------- */
    aiThemes:["Ecosystem diagnostics","Impact analytics","Grant analytics","Talent analytics",
      "Enterprise analytics","Programme analytics","Advocacy analytics","Segmentation","Governance"],
    aiDrivers:{
      value:[
        {key:"systemic",  label:"Systemic change"},
        {key:"evidence",  label:"Evidence & diagnostics"},
        {key:"leverage",  label:"Catalytic leverage"},
        {key:"reach",     label:"Beneficiary reach"},
        {key:"efficiency",label:"Capital efficiency"}
      ],
      risk:[
        {key:"data",      label:"Data readiness"},
        {key:"model",     label:"Method maturity"},
        {key:"equity",    label:"Inclusion & equity"},
        {key:"safeguard", label:"Safeguarding"},
        {key:"adoption",  label:"State adoption capacity"}
      ]
    },

    /* ---- Ecosystem Targeting (was hyper-personalisation) -------------- */
    hyperPersonalisation:{
      definition:"Evidence-led targeting of catalytic support — matching the right intervention to the right beneficiary, ecosystem condition and region, governed by consent, inclusion and safeguarding. Not mass outreach, but diagnostic-driven allocation of scarce catalytic capital.",
      objectives:[
        "Direct support to the ecosystem conditions and segments with the highest systemic leverage",
        "Reduce exclusion of marginalised, township and youth segments from beneficial support",
        "Enable proactive help — early-literacy remediation, ESO capacitation, artisan pathways — not just reactive grants"
      ],
      dataNeeds:[
        "Beneficiary & enterprise identity","ESO capability & reach","Ecosystem condition scores",
        "Regional & municipal data","Consent & data-sharing","Learner & educator outcomes",
        "Programme engagement","Safeguarding indicators","Impact & M&E signals"
      ],
      models:[
        {name:"Ecosystem condition score", note:"Where the binding constraints are"},
        {name:"Grantee risk", note:"Due-diligence risk of an applicant"},
        {name:"Impact forecast", note:"Expected systemic leverage"},
        {name:"Iceberg depth", note:"Event / structure / deep classification"},
        {name:"Next best intervention", note:"Best support action for a grantee"},
        {name:"Inclusion check", note:"Is any segment excluded?"},
        {name:"Segmentation", note:"Beneficiary & enterprise segments"},
        {name:"Attribution", note:"Systemic change attributable to an intervention"}
      ],
      governance:[
        "Consent, data-sharing and safeguarding enforced before any beneficiary-level use",
        "Inclusion floor: marginalised segments are not excluded from beneficial support",
        "Human review for youth-facing and vulnerable-segment interventions"
      ],
      loop:["Governed ecosystem & beneficiary data","Diagnostic insight","Next-best-intervention decision","Programme & grant activation","Impact feedback (IMM)","Catalytic-leverage optimisation"]
    },

    /* ---- Catalytic Capital & Leverage (was CLV) ---------------------- */
    clv:{
      definition:"Catalytic leverage is the systemic change achieved per rand of grant deployed — a stewardship metric, not a return metric. AGGPSA's perpetual endowment lets it optimise for multi-decade systemic impact rather than short-term output counts.",
      accountability:[
        {fn:"Finance & Endowment", owns:"Endowment stewardship, capital allocation, controls", marketing:"Models catalytic leverage and capital efficiency"},
        {fn:"Grant-Making", owns:"Grant economics, due diligence, milestone value", marketing:"Provides pipeline, appraisal and portfolio value"},
        {fn:"Strategy & IMM", owns:"Theory of Change, impact definitions, attribution", marketing:"Turns field evidence into portfolio steering"},
        {fn:"Data & Research", owns:"Diagnostics, indices, data quality", marketing:"Enables targeting, segmentation and evidence"},
        {fn:"Convening & Advocacy", owns:"Institutionalisation and policy scale", marketing:"Transitions proven models onto public balance sheets"}
      ],
      drivers:["Diagnostic precision","Milestone-gated capital","Relational capital","State adoption","Evidence integrity"]
    },

    /* ---- Impact & Learning Lead (was CXO) ---------------------------- */
    cxo:{
      definition:"The Strategy & Learning function is AGGPSA's systemic-impact integrator — owner of the Theory of Change, the IMM framework and organisational learning — ensuring diagnostic evidence, capital deployment and policy advocacy reinforce one another across the portfolio.",
      council:"Impact & Learning Forum",
      spans:["Grant-Making","Programmes","Data & Research","Convening & Advocacy","Finance","Board"]
    },

    /* ---- Training & Adoption (AGGPSA learning pathways) --------------- */
    training:{
      phases:[
        {id:"LP1", name:"Awareness & Alignment"},
        {id:"LP2", name:"Shared Foundations"},
        {id:"LP3", name:"Role-Based Enablement"},
        {id:"LP4", name:"Adoption Reinforcement"}
      ],
      groups:[
        {id:"TG1", name:"Board & Executive", cells:[
          "Theory of Change, Systemic Impact, Fiduciary Duty",
          "Data & Evidence Literacy, Governance Fundamentals",
          "Capital Allocation, Portfolio Oversight, Ethical Stewardship",
          "Board Reviews, Impact Realisation, Risk Oversight" ]},
        {id:"TG2", name:"Strategy, Learning & IMM", cells:[
          "Systems Thinking, Iceberg Model, Diagnose–Demonstrate–Dialogue",
          "IMM Literacy, Evidence Standards, Attribution",
          "Portfolio Steering, Evaluation Design, Adaptive Management",
          "Learning Reviews, Evidence Curation, Method Refinement" ]},
        {id:"TG3", name:"Grant-Making & Programmes", cells:[
          "Catalytic Grant-Making, ESO Capacitation, Incubation",
          "Due-Diligence Rigour, Safeguarding, Data Governance",
          "Milestone Management, Site Visits, Technical Assistance",
          "Coaching, Portfolio Reviews, Grantee Support" ]},
        {id:"TG4", name:"Data, Research & Analytics", cells:[
          "Ecosystem Diagnostics, Connecten, AEEI",
          "Data Quality, Consent, Responsible Analytics",
          "Index Compilation, Segmentation, Impact Analytics",
          "Communities of Practice, Playbooks, Open Data" ]}
      ],
      columns:["Awareness & Alignment","Shared Foundations","Role-Based Enablement","Adoption Reinforcement"],
      feedbackLoop:["Data & Research","Grant-Making & Programmes","Strategy & Learning","Board & Executive"]
    },

    /* ---- Governance layers (heatmap) --------------------------------- */
    governance:{
      layers:[
        { id:"GL1", name:"Data & Impact Governance", subs:[
          {name:"Data Quality", maturity:3, decisions:["D13"], measure:"Data quality score"},
          {name:"Evidence & IMM", maturity:3, decisions:["D10"], measure:"Evidence integrity"},
          {name:"Stewardship", maturity:2, decisions:[], measure:"Stewardship coverage"},
          {name:"Ownership", maturity:3, decisions:[], measure:"Owned data domains"},
          {name:"Data Products", maturity:2, decisions:["D13"], measure:"Governed data products"}
        ]},
        { id:"GL2", name:"Responsible Analytics & Ethics", subs:[
          {name:"Inclusion & Equity", maturity:2, decisions:["D18"], measure:"Inclusion rate"},
          {name:"Transparency", maturity:2, decisions:["D8"], measure:"Method cards published"},
          {name:"Safeguarding", maturity:3, decisions:["D18"], measure:"Programmes safeguarded"},
          {name:"Human Oversight", maturity:3, decisions:["D3","D6"], measure:"High-stakes decisions reviewed"},
          {name:"Consent & Privacy", maturity:3, decisions:["D13"], measure:"Consent-honour rate"},
          {name:"Compliance", maturity:3, decisions:["D15"], measure:"Compliance pass rate"}
        ]},
        { id:"GL3", name:"Grant & Fiduciary Governance", subs:[
          {name:"Due Diligence", maturity:4, decisions:["D4"], measure:"DD pass rate"},
          {name:"Board Approval", maturity:4, decisions:["D5"], measure:"Approved grants"},
          {name:"Milestone Control", maturity:3, decisions:["D6"], measure:"Milestone adherence"},
          {name:"Risk & Compliance", maturity:3, decisions:["D15"], measure:"Risks mitigated"},
          {name:"Financial Stewardship", maturity:4, decisions:["D16"], measure:"Capital efficiency"}
        ]}
      ],
      note:"Three governance layers run across every grant, programme and dataset — data & impact, responsible analytics & ethics, and grant & fiduciary governance — heat-mapped on the same 0–5 maturity scale as the capability map.",
      successMeasures:["Capability Maturity","Data & Evidence Literacy","Responsible-Analytics Adoption","Governance Adoption",
        "Safeguarding Compliance","Grant Delivery","Inclusion & Equity","Systemic Impact",
        "Catalytic Leverage","Stakeholder Engagement","Ecosystem Network Effectiveness"]
    },

    /* ---- capability attention (C1..C17) ------------------------------ */
    capAttention:{
      C1:"High", C2:"New", C3:"High", C4:"High", C5:"High", C6:"High",
      C7:"Medium", C8:"High", C9:"Medium", C10:"New",
      C11:"High", C12:"High", C13:"High", C14:"Medium", C15:"Medium", C16:"Medium", C17:"High"
    },

    /* ---- process SIPOC (P1..P16) ------------------------------------- */
    processSIPOC:{
      P1:{ suppliers:[{l:"Applicants & ESOs",sh:"SH02"},{l:"Strategy & Learning",sh:"SH06"}],
           inputs:["Concept notes","Ecosystem gaps","Theory of Change"],
           steps:["Screen against ToC","Map to ecosystem gaps","Shortlist pipeline"],
           outputs:["Screened pipeline"], customers:[{l:"Grant-Making",sh:"SH05"}] },
      P2:{ suppliers:[{l:"Shortlisted applicants",sh:"SH02"}],
           inputs:["Governance","Financials","Compliance","Work plan","M&E capability"],
           steps:["Assess governance","Assess financials","Check compliance","Test feasibility","Review M&E"],
           outputs:["Due-diligence findings"], customers:[{l:"Grant-Making Lead",sh:"SH05"}] },
      P3:{ suppliers:[{l:"Grant-Making Lead",sh:"SH05"},{l:"Finance",sh:"SH08"}],
           inputs:["DD findings","Investment recommendation"],
           steps:["Formulate recommendation","Committee review","Board approval"],
           outputs:["Approved grants"], customers:[{l:"Board",sh:"SH07"}] },
      P4:{ suppliers:[{l:"Grant officers",sh:"SH05"}],
           inputs:["Approved grants","Milestones"],
           steps:["Milestone gates","Site visits","Financial monitoring","Technical assistance"],
           outputs:["Disbursements","Oversight"], customers:[{l:"Grantees",sh:"SH02"}] },
      P5:{ suppliers:[{l:"IMM",sh:"SH06"},{l:"Convening",sh:"SH11"}],
           inputs:["Portfolio performance","Field data"],
           steps:["Ingest to IMM","Evaluate","Transition to Dialogue"],
           outputs:["Evidence","Policy inputs"], customers:[{l:"Government",sh:"SH11"}] },
      P6:{ suppliers:[{l:"Data & research",sh:"SH09"}],
           inputs:["Region selection","Survey instruments"],
           steps:["Scope","Collect","Map interdependencies","Publish"],
           outputs:["Ecosystem condition map"], customers:[{l:"Municipalities",sh:"SH11"}] },
      P7:{ suppliers:[{l:"AGCAE & partners",sh:"SH09"}],
           inputs:["Multi-market data"],
           steps:["Design index","Compile","Benchmark","Release"],
           outputs:["AEEI index"], customers:[{l:"Policymakers",sh:"SH11"}] },
      P8:{ suppliers:[{l:"IMM",sh:"SH06"}],
           inputs:["Field data"],
           steps:["Ingest","Map behaviour/market/policy","Adapt portfolio"],
           outputs:["Systems-level insight"], customers:[{l:"Strategy",sh:"SH06"}] },
      P9:{ suppliers:[{l:"Programmes",sh:"SH05"}],
           inputs:["Diagnosed bottleneck"],
           steps:["Design pilot","Incubate","Validate","Scale"],
           outputs:["Piloted model"], customers:[{l:"Beneficiaries",sh:"SH01"}] },
      P10:{ suppliers:[{l:"Convening",sh:"SH11"}],
           inputs:["Demonstration evidence"],
           steps:["Convene (Table 15)","Present evidence","Secure adoption"],
           outputs:["Policy commitments"], customers:[{l:"Government",sh:"SH11"}] },
      P11:{ suppliers:[{l:"Programmes",sh:"SH05"},{l:"Educators",sh:"SH03"}],
           inputs:["Programme design"],
           steps:["Train educators","Reach learners","Measure outcomes"],
           outputs:["Educator & learner outcomes"], customers:[{l:"Learners",sh:"SH04"}] },
      P12:{ suppliers:[{l:"Programmes & Comms",sh:"SH05"}],
           inputs:["Programme design"],
           steps:["Run AGEC / Makers","Measure engagement"],
           outputs:["Reach & narrative shift"], customers:[{l:"Learners & youth",sh:"SH04"}] },
      P13:{ suppliers:[{l:"Grant-Making",sh:"SH05"}],
           inputs:["ESO selection"],
           steps:["Select","Grant","Build capability","Measure reach"],
           outputs:["Strengthened ESOs"], customers:[{l:"ESOs",sh:"SH02"}] },
      P14:{ suppliers:[{l:"Partnerships",sh:"SH10"}],
           inputs:["Partner opportunities"],
           steps:["Source","Exchange blueprints","Co-fund"],
           outputs:["Aligned partnerships"], customers:[{l:"Funder peers",sh:"SH10"}] },
      P15:{ suppliers:[{l:"Finance",sh:"SH08"}],
           inputs:["Capital flows"],
           steps:["Steward endowment","Allocate","Control"],
           outputs:["Governed allocations"], customers:[{l:"Portfolio",sh:"SH05"}] },
      P16:{ suppliers:[{l:"Board & Risk",sh:"SH07"}],
           inputs:["Portfolio & risk"],
           steps:["Oversee","Assess risk","Assure compliance"],
           outputs:["Assurance"], customers:[{l:"Society & regulators",sh:"SH11"}] }
    },

    /* ---- decision rules (D1..D18) ------------------------------------ */
    decisionRules:{
      D1:[{when:"Concept not aligned to Theory of Change",then:"Decline"},{when:"Aligned and addresses a priority gap",then:"Shortlist"},{when:"Aligned but weak evidence",then:"Request more information"}],
      D2:[{when:"Condition has low leverage",then:"Deprioritise"},{when:"Binding constraint with high leverage",then:"Prioritise"}],
      D3:[{when:"Fails strategic or fiduciary test",then:"Decline"},{when:"Passes and capital available",then:"Fund"},{when:"Promising but unproven",then:"Fund a milestone-gated pilot"}],
      D4:[{when:"Governance or financial red flag",then:"Fail"},{when:"All dimensions pass",then:"Pass"},{when:"Minor gaps",then:"Pass with conditions"}],
      D5:[{when:"Not strategically aligned",then:"Defer"},{when:"Fiduciary and strategic fit confirmed",then:"Approve"}],
      D6:[{when:"Milestone evidence missing",then:"Hold disbursement"},{when:"Milestone met",then:"Disburse tranche"}],
      D7:[{when:"Surface-level event only",then:"Low priority"},{when:"Deep structural / policy leverage",then:"High priority"}],
      D8:[{when:"State absorption capacity low",then:"Iterate & build evidence"},{when:"Proven and adoptable",then:"Drive to scale"}],
      D9:[{when:"Partner adds no relational value",then:"Decline"},{when:"Adds relational capital & alignment",then:"Partner"}],
      D10:[{when:"Outcomes diverge from purpose",then:"Redesign"},{when:"Proven",then:"Close and transition to Dialogue"}],
      D11:[{when:"Below potential threshold",then:"Waitlist"},{when:"High potential & underserved",then:"Select"}],
      D12:[{when:"Limited reach or capability",then:"Decline"},{when:"Strong reach in marginalised economy",then:"Select"}],
      D13:[{when:"Beyond consent or sensitive",then:"Restrict"},{when:"Governed agreement in place",then:"Share"}],
      D14:[{when:"Low knowledge value",then:"Defer"},{when:"Fills a priority ecosystem gap",then:"Commission"}],
      D15:[{when:"Material risk or breach",then:"Escalate to Board"},{when:"Within appetite",then:"Monitor"}],
      D16:[{when:"Over-capitalising unproven work",then:"Hold"},{when:"Catalytic leverage clear",then:"Allocate"}],
      D17:[{when:"No policy window",then:"Defer"},{when:"Policy window open with evidence",then:"Convene"}],
      D18:[{when:"Would exclude a marginalised segment",then:"Broaden targeting"},{when:"Equitable and needs-based",then:"Target"}]
    }
  }
};
