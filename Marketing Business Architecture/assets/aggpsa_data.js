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
    archTitle:"Ecosystem Business Architecture",
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
    /* philanthropy page-title overrides (used in cards, breadcrumbs, manual headers) */
    pageTitles:{
      "hyperpersonalisation_cdp.html":"Ecosystem Targeting",
      "ai_usecases.html":"Ecosystem Analytics",
      "customer_journey.html":"Beneficiary Journeys & CX"
    },
    /* landing-page copy */
    landing:{
      title:"AGGPSA Ecosystem Data & Analytics Architecture",
      lede:"An interactive business-architecture pack for Allan & Gill Gray Philanthropy South Africa — a catalytic ecosystem architect. It traces one golden thread from beneficiaries and systemic outcomes, through the Diagnose–Demonstrate–Dialogue value streams and the grant-making lifecycle, to the data, analytics and governance that make catalytic philanthropy accountable."
    },
    /* ValueProposition segment columns — ecosystem focus segments, not banking
       lines of business. keys match the AGGPSA workbook headers (sheet 4). */
    vpSegments:{ keys:["TownshipMicro","GrowthScale","ArtisanTrade","TalentYouth"],
                 labels:["Township & Micro","Growth & Scale","Artisan & Trade","Talent & Youth"] },
    /* browser-tab title suffix (static pages read "… — Nedbank Marketing Pack") */
    packName:"AGGPSA Ecosystem Pack",
    /* landing-page workbook chips */
    workbooks:[
      "Data & Analytics Scoring Model .xlsx",
      "Ecosystem Business Architecture .docx",
      "Capability Building Framework .xlsx"
    ],
    /* landing-page directory cards (file → description + audience tag) */
    pageDir:{
      "index.html":{d:"The front door — engagement overview, this directory, workbooks and publish status.",tag:"Everyone"},
      "architecture_navigator.html":{d:"Walk the full parallel-mapped model in one place — Stakeholder → Value Prop → Systemic Outcome → Value Stream → Value Stage → Beneficiary Journey → Capability → Process → Decision → Analytics Use Case → AI Agent → Data Product → Domain — with your selection carried at every step.",tag:"Everyone · start here"},
      "navigation_graph.html":{d:"An interactive graph of every element and how it connects across the parallel-mapped hierarchy — Value Stream ↔ Beneficiary Journey ↔ Capability — click a node to focus it, see its explanation and value, and drill down every level.",tag:"Everyone"},
      "business_architecture.html":{d:"The centrepiece. Capability map shown under a value proposition (value-stream heat, Attention/Maturity toggle), plus the full capability grid; click any capability to drill and sign off.",tag:"Working group + readers"},
      "customer_journey.html":{d:"Beneficiary journey-map explorer across the grant & impact lifecycle, per programme area, with catalytic-leverage governance and the impact & learning operating model.",tag:"Programmes, IMM"},
      "data_products.html":{d:"The governed, owned data products that deliver the analytics use-cases and ecosystem targeting — organised by data domain with owner and steward, aligning demand to the Data Strategy.",tag:"Data governance"},
      "business_process.html":{d:"Every high-level process as a SIPOC — Suppliers, Inputs, Process, Outputs, Customers — with its capabilities and participants, linked back to stakeholders.",tag:"Process, Ops"},
      "decisions.html":{d:"Every decision as a DMN-style decision table — inputs, when→then rules, outcome and owner — with where each one is used.",tag:"Risk, Analytics"},
      "hyperpersonalisation_cdp.html":{d:"The closed-loop targeting engine and the ecosystem data-product model — data, models and the governance around them.",tag:"Data, Targeting"},
      "ai_usecases.html":{d:"A value-vs-risk portfolio of ecosystem analytics use cases with live 1–5 driver scoring and Excel round-trip.",tag:"Sponsors, Risk"},
      "training_adoption.html":{d:"Role pathways across four learning phases, with Champions as the Responsible-Analytics engine and the feedback loop.",tag:"L&D, Champions"},
      "governance_responsible_ai.html":{d:"A layered heatmap of Data Governance, Responsible Analytics and Change &amp; Adoption, with a success-measure scorecard.",tag:"Governance"},
      "glossary_settings.html":{d:"Point the pack at the AGGPSA glossary — base URL and link template — so governed terms deep-link out.",tag:"Stewards"},
      "model_export_import.html":{d:"Export the complete model to Excel — one sheet per level, every attribute and link, with a referential-integrity check — and import an edited workbook back as a live source that drives the Navigator, Graph and every page.",tag:"Everyone · verify the model"},
      "value_streams.html":{d:"Trace each value stream down to who owns and governs it — value stages and KPIs, the systemic outcomes it delivers with their accountable roles and review forums, the ownership-role model, and the governance operating layer (councils, RACI, policy → control, risk).",tag:"Executives · Governance"},
      "model_editor.html":{d:"Edit every element of the model — all sheets. Relationship (…_Map) sheets are editable grids where you add a new relationship; every other sheet is a form. Add and delete rows; changes save locally and export to Excel. Restricted to approved editors (passphrase).",tag:"Approved editors only"},
      "user_manual.html":{d:"A complete guide to the pack — the top-bar controls, the traceability spine, the Navigator flow, and every tab explained (what you'll see and how to use it). Reads in the app and downloads as a PDF for onboarding.",tag:"Everyone · reference"}
    },
    /* static-copy overrides (elements with data-copy="key"; JS-built strings via PACK.copyText) */
    copy:{
      /* customer_journey */
      "cjEyebrow":"The beneficiary view — Beneficiary Journey, cross-mapped to the Value Stream",
      "cjH1":"Beneficiary Journeys & Experience",
      "cjLede":"The grant &amp; impact lifecycle — <strong>Diagnose → Support → Grow → Measure → Institutionalise</strong> — specialised per programme area. Each journey carries its <em>persona</em>, the <em>value stream</em> it maps to, the <em>systemic outcomes</em> it rolls up to, and — per stage — the mapped value stage, experience rating, KPIs, capabilities, processes and decisions.",
      "cjClvH2":"Catalytic-Leverage Governance",
      "cjClvDef":"A shared, governed systemic outcome — not just a programme metric.",
      "cjClvColOwn":"Accountable for catalytic leverage",
      "cjClvColSup":"Contribution",
      "cjWb1":"Beneficiary Journey Architecture .docx",
      "cjWb2":"Catalytic-Leverage Governance .docx",
      /* hyperpersonalisation_cdp */
      "hpH1":"Ecosystem Targeting",
      "hpLoopDesc":"Governed ecosystem &amp; beneficiary data becomes decisions, orchestration and activation — then feeds back to optimise catalytic leverage. Click a stage.",
      "hpFb":"↻ Feedback continuously updates programme performance, catalytic leverage and capability priorities",
      "hpCdpH2":"Ecosystem data-product model",
      "hpCdpDesc":"Governed data-product services. Each links to the Business Architecture capability that owns it.",
      "hpWb1":"Ecosystem Targeting Model .docx",
      "hpWb2":"Model Catalogue .xlsx",
      /* data_products */
      "dpLede":"The governed, owned, reusable data assets that deliver the analytics use-cases and ecosystem targeting. Each sits in a <strong>data domain</strong> with an owner and steward — connecting the demand (analytics &amp; targeting) to the Data Strategy's supply. Filter by domain, analytics use-case or targeting service.",
      "dpCdpStat":"Targeting services realised",
      /* glossary_settings */
      "glLede":"The pack doesn't ship its own glossary. Governed terms live in the AGGPSA <strong>Glossary &amp; Term Lexicon</strong>. Point the pack at it here — set once, and every term chip and dotted term across the pack deep-links straight to the term.",
      "glBaseHint":"The root of the AGGPSA glossary. Can differ per content source.",
      "glBuildNote":"Because the template is a settings value, the whole pack works without glossary links until you provide them — turning them on is configuration, not a rebuild. Build-time input still needed: the base URL, one example term link (or the template), and the term → key/URL export from the glossary.",
      "glTmplHint":"Use <span class=\"mono\">{base}</span> and <span class=\"mono\">{key}</span>. Match the glossary scheme exactly.",
      /* ai_usecases */
      "aiH1":"Ecosystem Analytics Prioritisation",
      "aiLede":"A value-vs-risk portfolio of ecosystem analytics use cases. Each is scored on 1–5 drivers you can adjust on the page; the matrix re-plots instantly. Scores are illustrative starting points — tune them with risk &amp; compliance.",
      /* business_process */
      "bpEyebrow":"How the ecosystem delivers — SIPOC & Process Step Architecture",
      "bpLede":"Each high-level process as a <strong>SIPOC</strong> — and, beneath it, its <strong>process steps as first-class objects</strong>: every atomic step declares the decision it makes, the information concept it acts on (with a CRUD/lifecycle transition), the data product it touches, the control it runs, and the record and evidence it produces.",
      /* ethical_stewardship static + spec column */
      "esLifecycleIntro":"Every high-impact data, analytics or decisioning initiative runs this sequence. Ethical review is a pre-gate, not a scoring dimension hidden inside readiness — a high-value, high-readiness item cannot be accelerated past it.",
      "esSpecH2":"Ecosystem-analytics specialisation",
      "esSpecDesc":"What ethical stewardship asks of each analytics capability, and the artefacts each one must produce.",
      "esSpecCol":"Ecosystem-analytics area",
      /* data_products detail-panel label */
      "dpRealisesCdp":"Realises targeting service",
      /* business_architecture */
      "baWb1":"Ecosystem Business Architecture .docx",
      "baExtNote":"Core groups and <strong>EXT</strong> extension domains (beneficiary journey, experience, targeting, ecosystem data, intelligence, catalytic leverage, feedback).",
      /* user_manual prose */
      "umMapIntro":"This pack lays out one such map for AGGPSA's ecosystem work.",
      "umStory":"improving entrepreneur survival & scale",
      "umPlayNote":"The example in blue continues the survival story.",
      "umServes":"the ecosystem serves",
      /* navigation_graph */
      "ngIntroCdp":"targeting services supplying the data",
      "ngCdpType":"Targeting Service",
      "ngCdpVal":"Supplies governed ecosystem data to the use-case."
    },
    /* ethical_stewardship page-level arrays (Nedbank-hardcoded otherwise) */
    ethical:{
      domainX:{
        "Purpose":"Is beneficiary segmentation intended to target support fairly, or to ration scarce catalytic capital?",
        "Collective Benefit":"Does an ecosystem index improve allocation for communities, not just funders?",
        "Human Outcomes":"Does a readiness score help an entrepreneur grow, or merely gate them out?",
        "Authority to Control":"Do beneficiaries and ESOs control consent, data-sharing and appeal?",
        "Responsibility":"Who owns the harm if targeting disadvantages a marginalised region?",
        "Outcome Equity":"Are township, rural or informal enterprises excluded from support by the model?",
        "Ethical Sustainability":"Does repeated data collection erode community trust over time?",
        "Community / Segment Impact":"Do youth, women-led, rural or informal segments experience different outcomes?",
        "Stewardship Accountability":"Ethical approval record tied to the analytics use case and policy decision log."
      },
      pillarD:{
        "Collective Benefit":"Benefit is identified for beneficiaries and the ecosystem separately, and shared fairly.",
        "Authority to Control":"Beneficiaries and ESOs retain consent, preference, data-sharing and appeal rights."
      },
      conductForum:{ name:"Programme & Beneficiary Conduct Forum", pos:"Beneficiary-treatment forum",
        mandate:"Approves responsible targeting, outreach and safeguarding" },
      spec:[
        {a:"Beneficiary targeting",q:"Does targeting extend support to those most in need, or ration it?",arts:["PurposeAssessment","OutcomeEquityAssessment","PolicyDecisionLog"]},
        {a:"Catalytic leverage",q:"Is leverage used to grow impact or to justify withdrawing support?",arts:["CollectiveBenefitAssessment","OutcomeEquityAssessment"]},
        {a:"Ecosystem diagnostics",q:"Do diagnostics respect community context and avoid deficit framing?",arts:["AuthorityToControlReview","Community Impact Review"]},
        {a:"Grant allocation",q:"Are grants suitable, transparent and matched to real needs?",arts:["Eligibility Review","OutcomeEquityAssessment"]},
        {a:"Consent & data-sharing",q:"Can beneficiaries and ESOs understand and control use?",arts:["AuthorityToControlReview","Consent Evidence"]},
        {a:"Impact attribution",q:"Does measurement over-credit the funder and distort learning?",arts:["EthicalSustainabilityAssessment","IMM governance"]},
        {a:"Ecosystem data activation",q:"Are datasets built from governed, permitted, fit-for-purpose sources?",arts:["DataContract","Sharing Agreement","StewardshipTraceability"]},
        {a:"Beneficiary journeys",q:"Does orchestration reduce friction without coercion or surveillance?",arts:["HumanOutcomesAssessment","Safeguarding Review","Feedback monitoring"]}
      ]
    },
    /* user_manual: page guidance + worked example (Nedbank-hardcoded otherwise) */
    manual:{
      guide:{
        "customer_journey.html":{ purpose:"The beneficiary journey-map explorer across the grant & impact lifecycle, per programme area, with the catalytic-leverage governance view and the impact & learning operating model.",
          see:["Journey tabs per programme area (Enterprise Support, Talent, Grant-Making, Impact)","Each stage with its experience score, touchpoints, capabilities, processes and KPIs","The mapped value stream and systemic outcomes"],
          use:["Pick a programme-area tab","Read left-to-right along the journey stages","Click a KPI or stage to see detail"] },
        "ai_usecases.html":{ purpose:"A value-vs-risk portfolio of ecosystem analytics use cases, with live 1–5 driver scoring and an Excel round-trip.",
          see:["A value-vs-risk bubble chart of every use-case","Live driver sliders (systemic, evidence, leverage, reach, efficiency; data, model, equity, safeguarding, adoption)","Export/import of the scoring model"],
          use:["Read the portfolio: top-right = high value, watch the risk axis","Adjust drivers to test scenarios","Export to Excel, score offline, import back"] },
        "hyperpersonalisation_cdp.html":{ purpose:"The closed-loop ecosystem targeting engine and the data-product model — the data, models and governance that make evidence-led targeting work.",
          see:["The targeting closed loop","The ecosystem data-product service model","The governance guardrails around it"],
          use:["Follow the loop from signal to action to measurement","See which services each use-case needs","Use it to frame the data and model dependencies"] },
        "data_products.html":{ purpose:"The governed, owned data products that deliver the analytics use-cases and ecosystem targeting — organised by data domain, each with an owner, steward and data contract.",
          see:["Data products grouped by domain","Owner and steward per product","A data-contract panel (schema, classification, sources)"],
          use:["Filter by domain","Click a product to open its data contract","Trace a product up to the use-cases it serves"] },
        "glossary_settings.html":{ purpose:"Point the pack at the AGGPSA glossary — base URL and link template — so governed terms deep-link out to their definitions.",
          see:["A base-URL setting","A link-template setting","A live preview of a resolved term link"],
          use:["Set the glossary base URL and template","Save the settings","Governed terms across the pack then deep-link to the glossary"] }
      },
      blocks:{
        sh:{ plain:"The people or groups the ecosystem work serves or must answer to — beneficiaries and entrepreneurs, ESOs and partners, funders and regulators, and internal teams like Programmes or Data & Research.",
          ex:"Beneficiaries &amp; entrepreneurs — the people AGGPSA's ecosystem work exists to support and must answer to." },
        vp:{ ex:"“Right-fit catalytic support at the right moment, through the right intermediary.”" },
        bo:{ ex:"Outcome: improve entrepreneur survival &amp; scale. KPI: survival rate, and jobs created." },
        vs:{ ex:"Support Entrepreneurs &amp; ESOs — everything from first contact to a resilient, growing enterprise." },
        vsg:{ ex:"Sustain — the stage where enterprises are kept alive and growing. KPI: survival rate." },
        cj:{ plain:"The beneficiary journey is the same value seen from the beneficiary's side — the experience they actually go through, moment by moment.",
          why:"Analytics that improves an internal number but worsens the experience destroys value. Modelling the journey alongside the stream keeps the beneficiary in the picture.",
          ex:"A township entrepreneur struggles quietly; an ESO notices and connects timely, relevant support — rather than a generic programme." },
        cap:{ ex:"Enterprise Support and Ecosystem Intelligence — the abilities to understand, target and grow enterprise support." },
        proc:{ ex:"Support Targeting — the process that scores enterprises for need and potential, then triggers the right support." },
        dec:{ ex:"Support Decision — is this enterprise viable and underserved, and what is the best support for them?" },
        ai:{ ex:"Enterprise survival prediction &amp; support — predict who is at risk and recommend the best support." },
        ag:{ ex:"Diagnostic &amp; Targeting agent — scores enterprises; high-value support is routed to a programme officer for approval." },
        dp:{ ex:"Township Enterprise Data and Impact Model Store — the trusted data the targeting model consumes and the scores it produces." },
        dm:{ ex:"Impact &amp; Evidence — the domain that owns enterprise scores and model outputs across programmes." }
      },
      extra:[
        { t:"Persona", d:"A named, representative example of a stakeholder — e.g. a specific beneficiary segment. Personas make an abstract stakeholder concrete so teams design for a real person, not an average." },
        { t:"Semantic model / governed term", d:"The agreed, written definition of a business term — what “survival”, “active enterprise” or “catalytic leverage” actually mean. When everyone's analytics and every report uses the same definition, the numbers reconcile. This is the vocabulary layer beneath the data products." },
        { t:"Ecosystem targeting engine", d:"The engine that unifies ecosystem and beneficiary signals in near-real-time and activates them — the plumbing that lets the right support reach the right beneficiary at the right moment. In the model it is a set of capabilities and services the targeting use-cases draw on." },
        { t:"Human-in-the-Loop (HITL)", d:"A control where a person reviews or approves an analytics or AI output before it takes effect. Used for high-value, sensitive or regulated decisions. The presence or absence of HITL is one of the clearest signals of how much trust you are placing in a model." }
      ],
      play:[
        ['Start from an outcome, not a technology','Name the systemic result you want to move and the KPI that measures it. Resist starting with “let\'s use GenAI.” Start with the number.','Outcome: improve entrepreneur survival & scale · KPI: survival rate.'],
        ['Find the decision that moves it','Trace to the value stage that most affects that KPI, then to the decision made there. Analytics acts on decisions — so this is where a real initiative forms.','Stage: Sustain → Decision: which enterprises are at risk and what is the best support?'],
        ['Name the analytics use-case','State plainly what the analytics will do for that decision, and score it: how much value (systemic, evidence, leverage, reach, efficiency) against how much risk (data, model, equity, safeguarding, adoption).','Use-case: enterprise survival prediction & support · high value, moderate risk.'],
        ['Check the data it depends on','List the data products the use-case needs and whether they are owned, defined and trustworthy. This is where most initiatives quietly fail — surface it early.','Needs: Township Enterprise Data, model scores · owner: Impact & Evidence domain.'],
        ['Decide the human oversight','Choose where a person stays in the loop. High-value or sensitive actions get human approval; low-stakes, high-volume ones can run automatically.','Auto-score everyone; a programme officer approves support above a value threshold.'],
        ['Close the loop on the KPI','Ship it, then watch the same KPI you started with. If it moves, you have proof; if not, you have a precise place to look. The thread makes the feedback loop obvious.','Track survival on the supported group vs a control; feed results back into targeting.']
      ]
    }
  },
  generic:{
    /* ---- baked journeys base: the hydrator only builds a Customer/Beneficiary
       journey whose id exists in GENERIC.journeys, so AGGPSA must supply its own
       base (CRJ01..CRJ08) or the Nedbank LOB journeys leak through --------- */
    journeys:[{"id": "CJ01", "lob": "Enterprise Support", "name": "Township micro-entrepreneur journey", "persona": "Township micro-entrepreneur", "stages": [{"stage": "Discover", "emotion": 2, "touchpoints": "Community networks; word of mouth; ESO outreach", "kpis": ["Awareness; trust; reach"], "capabilities": ["C13"], "processes": ["P13"], "decisions": ["D12"]}, {"stage": "Access support", "emotion": 3, "touchpoints": "ESO intake; mobile; documentation", "kpis": ["Intake conversion; time-to-support"], "capabilities": ["C5"], "processes": ["P9"], "decisions": ["D7"]}, {"stage": "Grow", "emotion": 4, "touchpoints": "Mentoring; market access; working capital", "kpis": ["Revenue growth; jobs created"], "capabilities": ["C13"], "processes": ["P13"], "decisions": ["D12"]}, {"stage": "Sustain", "emotion": 3, "touchpoints": "Ongoing coaching; networks; markets", "kpis": ["Survival rate; resilience"], "capabilities": ["C5"], "processes": ["P9"], "decisions": ["D7"]}]}, {"id": "CJ02", "lob": "Enterprise Support", "name": "Artisan enterprise journey", "persona": "Artisan entrepreneur", "stages": [{"stage": "Train", "emotion": 4, "touchpoints": "TVET colleges; Makers Fest; workshops", "kpis": ["Skills gained; completion"], "capabilities": ["C12"], "processes": ["P12"], "decisions": ["D18"]}, {"stage": "Launch", "emotion": 2, "touchpoints": "Startup support; tooling; first customers", "kpis": ["Ventures launched; early revenue"], "capabilities": ["C10"], "processes": ["P12"], "decisions": ["D18"]}, {"stage": "Scale", "emotion": 3, "touchpoints": "Market linkages; finance; branding", "kpis": ["Growth; jobs created"], "capabilities": ["C12"], "processes": ["P12"], "decisions": ["D18"]}]}, {"id": "CJ03", "lob": "Enterprise Support", "name": "High-growth founder journey", "persona": "High-potential founder", "stages": [{"stage": "Diagnose", "emotion": 3, "touchpoints": "Diagnostic assessment; needs analysis", "kpis": ["Needs identified; fit"], "capabilities": ["C13"], "processes": ["P13"], "decisions": ["D12"]}, {"stage": "Support", "emotion": 4, "touchpoints": "Incubation; catalytic capital; mentoring", "kpis": ["Milestones met; validation"], "capabilities": ["C5"], "processes": ["P9"], "decisions": ["D7"]}, {"stage": "Scale", "emotion": 3, "touchpoints": "Growth capital; market expansion", "kpis": ["Scale; jobs created"], "capabilities": ["C13"], "processes": ["P13"], "decisions": ["D12"]}]}, {"id": "CJ04", "lob": "ESO", "name": "ESO capacitation journey", "persona": "ESO programme manager", "stages": [{"stage": "Apply", "emotion": 3, "touchpoints": "RFP; application portal; screening", "kpis": ["Application quality"], "capabilities": ["C13"], "processes": ["P13"], "decisions": ["D12"]}, {"stage": "Capacitate", "emotion": 4, "touchpoints": "Capability building; grants; technical assistance", "kpis": ["Capability uplift"], "capabilities": ["C5"], "processes": ["P9"], "decisions": ["D7"]}, {"stage": "Deliver", "emotion": 3, "touchpoints": "Programme delivery; field support", "kpis": ["Entrepreneurs reached"], "capabilities": ["C13"], "processes": ["P13"], "decisions": ["D12"]}, {"stage": "Report", "emotion": 2, "touchpoints": "M&E; reporting portal; evidence", "kpis": ["Reporting compliance; data quality"], "capabilities": ["C5"], "processes": ["P9"], "decisions": ["D7"]}]}, {"id": "CJ05", "lob": "Talent", "name": "Educator development journey", "persona": "Foundation-phase educator", "stages": [{"stage": "Recruit", "emotion": 3, "touchpoints": "Fellowship intake; school partnerships", "kpis": ["Fellows recruited"], "capabilities": ["C11"], "processes": ["P11"], "decisions": ["D11"]}, {"stage": "Train", "emotion": 4, "touchpoints": "Training; coaching; classroom materials", "kpis": ["Educators trained"], "capabilities": ["C15"], "processes": ["P11"], "decisions": ["D11"]}, {"stage": "Practise", "emotion": 2, "touchpoints": "Classroom practice; peer support; supervision", "kpis": ["Classroom adoption in stressed schools"], "capabilities": ["C11"], "processes": ["P11"], "decisions": ["D11"]}, {"stage": "Measure", "emotion": 3, "touchpoints": "Assessments; learner data", "kpis": ["Reading-for-meaning; learning gains"], "capabilities": ["C15"], "processes": ["P11"], "decisions": ["D11"]}]}, {"id": "CJ06", "lob": "Talent", "name": "Learner outcomes journey", "persona": "Foundation & youth learner", "stages": [{"stage": "Reach", "emotion": 3, "touchpoints": "Classroom; AGEC platform; materials", "kpis": ["Learners reached"], "capabilities": ["C11"], "processes": ["P11"], "decisions": ["D11"]}, {"stage": "Learn", "emotion": 3, "touchpoints": "Lessons; guided practice; assessment", "kpis": ["Literacy & numeracy gains"], "capabilities": ["C15"], "processes": ["P11"], "decisions": ["D11"]}, {"stage": "Progress", "emotion": 4, "touchpoints": "Progression; recognition; showcase", "kpis": ["Reading for meaning; progression"], "capabilities": ["C11"], "processes": ["P11"], "decisions": ["D11"]}]}, {"id": "CJ07", "lob": "Grant-Making", "name": "Grant lifecycle journey", "persona": "Grant officer", "stages": [{"stage": "Inquiry", "emotion": 3, "touchpoints": "RFP; concept notes; ToC screening", "kpis": ["Pipeline quality"], "capabilities": ["C3"], "processes": ["P1"], "decisions": ["D1"]}, {"stage": "Due diligence", "emotion": 2, "touchpoints": "Governance & financial review; site visits", "kpis": ["DD pass rate; cycle time"], "capabilities": ["C4"], "processes": ["P2"], "decisions": ["D4"]}, {"stage": "Approve", "emotion": 4, "touchpoints": "Grant committee; board approval", "kpis": ["Approval rate; strategic fit"], "capabilities": ["C14"], "processes": ["P3"], "decisions": ["D3"]}, {"stage": "Manage", "emotion": 3, "touchpoints": "Milestone gates; site visits; technical assistance", "kpis": ["Milestone adherence"], "capabilities": ["C3"], "processes": ["P4"], "decisions": ["D6"]}, {"stage": "Close", "emotion": 4, "touchpoints": "Evaluation; IMM ingestion; dialogue", "kpis": ["Outcomes; systemic learning"], "capabilities": ["C4"], "processes": ["P5"], "decisions": ["D10"]}]}, {"id": "CJ08", "lob": "Impact", "name": "IMM & learning journey", "persona": "IMM analyst", "stages": [{"stage": "Collect", "emotion": 3, "touchpoints": "Field data; surveys; instruments", "kpis": ["Data coverage & quality"], "capabilities": ["C6"], "processes": ["P8"], "decisions": ["D10"]}, {"stage": "Analyse", "emotion": 4, "touchpoints": "Systems mapping; analytics", "kpis": ["Insight generated"], "capabilities": ["C15"], "processes": ["P8"], "decisions": ["D10"]}, {"stage": "Adapt", "emotion": 3, "touchpoints": "Portfolio review; redesign", "kpis": ["Adaptations made"], "capabilities": ["C6"], "processes": ["P8"], "decisions": ["D10"]}, {"stage": "Scale", "emotion": 4, "touchpoints": "Policy engagement; institutionalisation", "kpis": ["Models scaled"], "capabilities": ["C15"], "processes": ["P8"], "decisions": ["D10"]}]}],
    /* ---- segment comparison (Architecture page) — AGGPSA ecosystem segments.
       Internal keys Retail/Commercial/Wealth/Trade map positionally to
       Township&Micro / Growth&Scale / Artisan&Trade / Talent&Youth; the column
       labels are drawn from PACK_CONFIG.vpSegments.labels. ------------------- */
    segmentComparison:{
      dimensions:["Primary intervention logic","Key decision sensitivity","Core impact metrics","Best-fit delivery channels"],
      rows:{
        "Primary intervention logic":{ Retail:"ESO capacitation and market access", Commercial:"Incubation and catalytic growth capital", Wealth:"Vocational pathways and enterprise support", Trade:"Foundational literacy and entrepreneurial mindset" },
        "Key decision sensitivity":{ Retail:"Inclusion, reach, safeguarding", Commercial:"Milestone rigour, leverage, viability", Wealth:"Curriculum fit, market linkage", Trade:"Safeguarding, equity, learning quality" },
        "Core impact metrics":{ Retail:"Enterprises supported; jobs; survival", Commercial:"Scale; leverage per rand", Wealth:"Artisan ventures; TVET adoption", Trade:"Reading for meaning; learners reached" },
        "Best-fit delivery channels":{ Retail:"ESOs; community; mobile", Commercial:"Incubation; mentoring; capital", Wealth:"TVET colleges; Makers Fest", Trade:"Schools; AGEC; fellowships" }
      }
    },
    /* ---- clear baked arrays the hydrator merges-keep from, so AGGPSA
       does not inherit Nedbank per-item value/risk/ext (name/theme/phase
       still come from the AGGPSA workbook) --------------------------------- */
    decisions:[],

    /* ---- End-to-end traceability threads (business_architecture §8) -----
       Pure baked section (no model sheet). Nedbank's banking threads leak
       here unless AGGPSA supplies its own ecosystem threads. ------------- */
    threads:[
      { name:"Foundational talent", stakeholders:"Learners, educators, schools, fellowship partners",
        vp:"Reading-for-meaning and numeracy foundations in stressed schools",
        journeys:["CJ05","CJ06"], kpis:"Educators trained, classroom adoption, reading-for-meaning, learning gains",
        capabilities:"C11, C15", processes:"P11", decisions:"D11" },
      { name:"Enterprise support & survival", stakeholders:"Township & growth entrepreneurs, artisans, ESOs, mentors",
        vp:"Right-fit catalytic support that lifts survival, growth and jobs",
        journeys:["CJ01","CJ02","CJ03","CJ04"], kpis:"Entrepreneurs reached, survival rate, revenue growth, jobs created, ESO capability uplift",
        capabilities:"C5, C12, C13", processes:"P9, P12, P13", decisions:"D7, D12, D18" },
      { name:"Catalytic grant-making", stakeholders:"Grantees, grant committee, board, finance, due-diligence",
        vp:"Milestone-gated capital that maximises systemic leverage per rand",
        journeys:["CJ07"], kpis:"Pipeline quality, DD pass rate, approval fit, milestone adherence, catalytic leverage",
        capabilities:"C3, C4, C14", processes:"P1, P2, P3, P4, P5", decisions:"D1, D3, D4, D6, D16" },
      { name:"Ecosystem evidence & impact", stakeholders:"IMM analysts, researchers, ESOs, funders, evaluators",
        vp:"Governed diagnostics and impact evidence that steer the portfolio",
        journeys:["CJ08"], kpis:"Data coverage & quality, insight generated, adaptations made, models scaled",
        capabilities:"C6, C15", processes:"P8", decisions:"D10, D14" },
      { name:"Policy dialogue & institutionalisation", stakeholders:"Government, policymakers, communities, sector bodies",
        vp:"Proven models transitioned onto public balance sheets and policy",
        journeys:[], kpis:"Policy windows convened, institutionalisation, state adoption, systemic learning",
        capabilities:"C1, C7, C16", processes:"P6, P7", decisions:"D5, D17" },
      { name:"Entrepreneurship culture & networks", stakeholders:"Youth, media, funder & partner network, ESOs, convenors",
        vp:"A normalised entrepreneurship culture and stronger ecosystem networks",
        journeys:[], kpis:"Culture normalisation, network density, partner leverage, reach",
        capabilities:"C8, C10, C17", processes:"P10, P14", decisions:"D8, D9, D13" }
    ],

    /* ---- Data-product governed terms (business_architecture / data_products)
       Data-product names/domains hydrate from the AGGPSA model; only the
       `terms` chips mergeKeep from the baked section, so Nedbank model names
       (Propensity/Churn/Marketing ROI) leak unless overridden here. ------- */
    dataProducts:[
      { id:"DP01", terms:["Ecosystem Diagnostic","Systemic Constraint"] },
      { id:"DP02", terms:["Ecosystem Index","Benchmarking"] },
      { id:"DP03", terms:["Grantee Registry","Due Diligence"] },
      { id:"DP04", terms:["Grant Portfolio","Milestone Gate"] },
      { id:"DP05", terms:["Impact Measurement","Theory of Change"] },
      { id:"DP06", terms:["Reading for Meaning","Learning Gain"] },
      { id:"DP07", terms:["Programme Reach","Participation"] },
      { id:"DP08", terms:["Consent Basis","Data-Sharing"] },
      { id:"DP09", terms:["ESO Capability","Intermediary"] },
      { id:"DP10", terms:["Township Enterprise","Informal Economy"] },
      { id:"DP11", terms:["Contribution Analysis","Attribution"] },
      { id:"DP12", terms:["Policy Evidence","Advocacy"] },
      { id:"DP13", terms:["Narrative","Sentiment"] },
      { id:"DP14", terms:["Educator Development","Fellowship"] },
      { id:"DP15", terms:["Institutionalisation","State Adoption"] },
      { id:"DP16", terms:["Beneficiary Segment","Targeting"] },
      { id:"DP17", terms:["Impact Evidence","Systemic Leverage"] }
    ],
    /* per-use-case value/risk/cost drive the Data & Analytics radar; keys
       match the aiDrivers below (systemic/evidence/leverage/reach/efficiency;
       data/model/equity/safeguard/adoption) */
    aiUseCases:[{"id": "U01", "value": {"systemic": 5, "evidence": 5, "leverage": 4, "reach": 4, "efficiency": 4}, "risk": {"data": 2, "model": 2, "equity": 2, "safeguard": 1, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U02", "value": {"systemic": 4, "evidence": 5, "leverage": 3, "reach": 4, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 2, "safeguard": 2, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U03", "value": {"systemic": 3, "evidence": 4, "leverage": 3, "reach": 3, "efficiency": 4}, "risk": {"data": 3, "model": 3, "equity": 4, "safeguard": 3, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U04", "value": {"systemic": 4, "evidence": 3, "leverage": 4, "reach": 2, "efficiency": 3}, "risk": {"data": 4, "model": 4, "equity": 3, "safeguard": 2, "adoption": 4}, "cost": 2, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U05", "value": {"systemic": 4, "evidence": 4, "leverage": 4, "reach": 3, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 2, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U06", "value": {"systemic": 5, "evidence": 5, "leverage": 4, "reach": 4, "efficiency": 4}, "risk": {"data": 2, "model": 2, "equity": 2, "safeguard": 2, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U07", "value": {"systemic": 3, "evidence": 3, "leverage": 4, "reach": 2, "efficiency": 5}, "risk": {"data": 4, "model": 4, "equity": 3, "safeguard": 3, "adoption": 4}, "cost": 2, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U08", "value": {"systemic": 5, "evidence": 4, "leverage": 3, "reach": 5, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 4, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U09", "value": {"systemic": 4, "evidence": 4, "leverage": 3, "reach": 4, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 3, "adoption": 4}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U10", "value": {"systemic": 3, "evidence": 4, "leverage": 3, "reach": 3, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 3, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U11", "value": {"systemic": 3, "evidence": 3, "leverage": 3, "reach": 3, "efficiency": 3}, "risk": {"data": 4, "model": 4, "equity": 3, "safeguard": 2, "adoption": 4}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U12", "value": {"systemic": 5, "evidence": 4, "leverage": 4, "reach": 5, "efficiency": 4}, "risk": {"data": 2, "model": 2, "equity": 3, "safeguard": 2, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U13", "value": {"systemic": 4, "evidence": 4, "leverage": 3, "reach": 3, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 3, "adoption": 3}, "cost": 4, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U14", "value": {"systemic": 4, "evidence": 3, "leverage": 4, "reach": 3, "efficiency": 3}, "risk": {"data": 4, "model": 4, "equity": 3, "safeguard": 2, "adoption": 4}, "cost": 2, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U15", "value": {"systemic": 3, "evidence": 3, "leverage": 3, "reach": 4, "efficiency": 3}, "risk": {"data": 2, "model": 2, "equity": 3, "safeguard": 2, "adoption": 2}, "cost": 2, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U16", "value": {"systemic": 3, "evidence": 3, "leverage": 3, "reach": 4, "efficiency": 3}, "risk": {"data": 2, "model": 2, "equity": 2, "safeguard": 2, "adoption": 2}, "cost": 2, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U17", "value": {"systemic": 2, "evidence": 2, "leverage": 3, "reach": 2, "efficiency": 2}, "risk": {"data": 3, "model": 4, "equity": 3, "safeguard": 2, "adoption": 4}, "cost": 2, "terms": ["Ecosystem", "Catalytic grant"]}, {"id": "U18", "value": {"systemic": 4, "evidence": 5, "leverage": 4, "reach": 3, "efficiency": 3}, "risk": {"data": 3, "model": 3, "equity": 3, "safeguard": 2, "adoption": 3}, "cost": 3, "terms": ["Ecosystem", "Catalytic grant"]}],

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
