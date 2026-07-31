/* ============================================================================
   Nedbank Marketing Data & AI Engagement — HTML Pack
   Generic baked-in content layer (self-contained, no login, works offline)
   Modelware · Data Management  ·  Client: Nedbank
   ----------------------------------------------------------------------------
   This file is the single source of truth for the GENERIC (industry-generic
   Banking Marketing Architecture) content source. The Nedbank Public and
   Nedbank Private sources are loaded at runtime from the GitHub layer (wired
   later); this Generic layer always ships inside the app.

   Canonical architecture spine (traceability chain):
     Stakeholders → Value Propositions → Customer Journeys → Capabilities
       → Processes → Decision Models,  with KPIs/Outcomes measuring value
       and feeding back into targeting, propositions and experience.

   Customer Journeys are the layer added vs the Trade Finance Pack: they sit
   between the promise (value proposition) and the delivery (capabilities).
   ========================================================================== */

window.GENERIC = {

  /* ---- Stakeholders (BA doc Table 2) — SH01..SH11 ---------------------- */
  stakeholders: [
    { id:"SH01", name:"Customers & prospects",
      members:"Retail individuals, families, SMEs, commercial clients, affluent/HNW clients, importers/exporters",
      value:"Relevant propositions, financial education, trust, product clarity, timely offers, channel convenience",
      segment:"All; Wealth needs trust and advisory credibility; Trade needs risk/payment confidence" },
    { id:"SH02", name:"Relationship & sales channels",
      members:"Branch bankers, relationship managers, advisors, treasury/trade specialists, call-centre/service teams",
      value:"Qualified leads, next-best-action prompts, campaign narratives, customer insight, referral triggers",
      segment:"Commercial, Wealth, Trade especially relationship-led; Retail hybrid digital + branch" },
    { id:"SH03", name:"Product & pricing teams",
      members:"Deposits, lending, cards, payments, insurance, wealth, treasury, trade finance",
      value:"Market demand insight, proposition positioning, launch support, adoption feedback",
      segment:"All segments" },
    { id:"SH04", name:"Digital & physical channels",
      members:"Mobile, web, app, social, email, branch, ATM, contact centre, events",
      value:"Traffic, engagement, conversion, journey optimization, service continuity",
      segment:"Retail digital scale; Wealth and Commercial human+digital" },
    { id:"SH05", name:"Marketing function",
      members:"Strategy, brand, research, insights, campaign, communications, operations, MarTech, content, events",
      value:"Clear priorities, reusable assets, journey insight, performance learning",
      segment:"All" },
    { id:"SH06", name:"Operations & fulfilment",
      members:"Onboarding, account opening, credit fulfilment, KYC, trade ops, service operations",
      value:"Better demand forecasting, cleaner handoffs, reduced rework, SLA visibility",
      segment:"Trade and Commercial operationally complex" },
    { id:"SH07", name:"Risk, compliance, legal, privacy, cyber",
      members:"Conduct risk, AML/KYC, data protection, financial crime, suitability, brand/comms review",
      value:"Compliant messaging, consent controls, audit evidence, responsible targeting",
      segment:"All; Wealth suitability and Trade AML/sanctions are high-sensitivity" },
    { id:"SH08", name:"Executives & finance",
      members:"CEO/Exco, CMO, CFO, heads of segments, strategy",
      value:"Growth, ROI, brand equity, customer value, risk visibility, investment prioritization",
      segment:"All" },
    { id:"SH09", name:"Data, analytics, AI & architecture",
      members:"Data owners, stewards, analysts, AI governance, enterprise/business architects",
      value:"Customer 360, governed definitions, experimentation, attribution, decision models",
      segment:"All; foundational for personalization and measurement" },
    { id:"SH10", name:"Partners & intermediaries",
      members:"Agencies, media, fintechs, affiliates, brokers, correspondents, insurers, logistics/trade bodies",
      value:"Brief clarity, co-marketing, lead/referral flows, partner performance",
      segment:"Retail fintech, Wealth COIs, Trade ecosystem" },
    { id:"SH11", name:"Regulators & society",
      members:"Prudential/conduct regulators, consumer protection bodies, communities, industry bodies",
      value:"Fair, clear, non-misleading communication; privacy; inclusion; responsible impact",
      segment:"All; public trust and conduct outcomes" }
  ],

  /* ---- Value propositions (BA doc Table 3) — VP01.. --------------------- */
  valuePropositions: [
    { id:"VP01", group:"Customers / prospects", stakeholders:["SH01"],
      generic:"“Relevant, trusted financial solutions at the right moment, through the right channel.”",
      retail:"Everyday banking, credit, savings, education, onboarding ease",
      commercial:"Cash-flow, lending, payments, treasury, sector insight",
      wealth:"Trusted advice, holistic planning, life-event guidance, human+digital service",
      trade:"Payment assurance, working-capital support, risk mitigation, documentary/trade advisory",
      journeys:["CJ-RET-01","CJ-COM-01","CJ-WEA-01","CJ-TRD-01"] },
    { id:"VP02", group:"RMs / sales / advisors", stakeholders:["SH02"],
      generic:"“Better conversations with better-qualified opportunities.”",
      retail:"Lead routing to branch / contact centre",
      commercial:"Account triggers, sector campaigns, pipeline support",
      wealth:"Referral prompts, content for advisory trust",
      trade:"Trade opportunity triage and transaction triggers",
      journeys:["CJ-COM-01","CJ-WEA-01"] },
    { id:"VP03", group:"Product teams", stakeholders:["SH03"],
      generic:"“Evidence-led product-market fit and adoption.”",
      retail:"Adoption, usage, cross-sell",
      commercial:"Bundles by industry or lifecycle",
      wealth:"Relationship pricing, tiering, AUM growth",
      trade:"Product education for LC, guarantees, supply-chain finance",
      journeys:["CJ-RET-01"] },
    { id:"VP04", group:"Risk / compliance", stakeholders:["SH07"],
      generic:"“Growth with controlled, explainable, auditable marketing.”",
      retail:"Consent, fair-lending / comms review",
      commercial:"Credit and conduct controls",
      wealth:"Suitability and disclosure",
      trade:"AML / sanctions / documentary risk",
      journeys:[] },
    { id:"VP05", group:"Executives / finance", stakeholders:["SH08"],
      generic:"“Marketing contribution to growth, retention, brand, and profitability.”",
      retail:"Acquisition and primary-bank growth",
      commercial:"Deposit / loan growth, wallet share",
      wealth:"AUM, retention, referrals",
      trade:"Fee income, transaction volume, client stickiness",
      journeys:[] },
    { id:"VP06", group:"Partners / agencies", stakeholders:["SH10"],
      generic:"“Clear briefs, governance, data boundaries, and measurable contribution.”",
      retail:"Digital / media campaigns",
      commercial:"ABM, events, content",
      wealth:"COI / event-based engagement",
      trade:"Trade ecosystem content / events",
      journeys:[] },
    { id:"VP07", group:"Regulators / society", stakeholders:["SH11"],
      generic:"“Transparent, responsible, inclusive financial communication.”",
      retail:"Financial literacy, fair offers",
      commercial:"SME access and clarity",
      wealth:"Advice integrity",
      trade:"Trade integrity and compliance",
      journeys:[] }
  ],

  /* ---- Customer Journeys — the added layer ----------------------------- */
  /* Lifecycle backbone: Acquire → Onboard → Serve → Grow → Retain → Advocate
     specialised per line of business. Each stage links to the capabilities,
     processes and decisions that deliver it (shared objects). Emotion is a
     1–5 experience rating used to colour the journey map.                  */
  journeyStages: ["Acquire","Onboard","Serve","Grow","Retain","Advocate"],
  journeys: [
    { id:"CJ-RET-01", lob:"Retail", name:"Open & activate a primary banking relationship",
      persona:"Everyday retail customer / young professional",
      stages:[
        { stage:"Acquire", emotion:3, touchpoints:"Social & search ads, comparison sites, branch walk-in, referral",
          kpis:["CAC","Qualified leads","Conversion rate"], capabilities:["C4","C5"], processes:["P1","P2"], decisions:["D1","D6"] },
        { stage:"Onboard", emotion:2, touchpoints:"Mobile app sign-up, ID/KYC upload, branch assist, e-sign",
          kpis:["Digital onboarding completion","Lead-to-open cycle time"], capabilities:["C5","C8"], processes:["P6"], decisions:["D4","D5"] },
        { stage:"Serve", emotion:4, touchpoints:"App/web day-to-day use, card activation, contact centre, dispute resolution",
          kpis:["Activation rate","CSAT","Complaint rate"], capabilities:["C11","C12"], processes:["PX2"], decisions:["DX2"] },
        { stage:"Grow", emotion:3, touchpoints:"In-app next-best-offer, savings/credit nudges, email nurture",
          kpis:["Product penetration","Cross-sell conversion","Primary-bank indicator"], capabilities:["C13","C16"], processes:["P7","PX4"], decisions:["D7","DX3"] },
        { stage:"Retain", emotion:3, touchpoints:"Proactive financial-wellness nudges, attrition-risk outreach, service recovery",
          kpis:["Retention","Churn rate","NPS"], capabilities:["C11","C16"], processes:["PX2","PX6"], decisions:["DX6","D7"] },
        { stage:"Advocate", emotion:4, touchpoints:"Referral prompts, reviews, community, advocacy programme",
          kpis:["Referral rate","Advocacy / NPS promoters"], capabilities:["C6","C11"], processes:["P7"], decisions:["DX3"] }
      ] },
    { id:"CJ-COM-01", lob:"Commercial", name:"Onboard & grow an SME / corporate relationship",
      persona:"Growing SME owner / corporate treasurer",
      stages:[
        { stage:"Acquire", emotion:3, touchpoints:"RM prospecting, sector campaigns, events, LinkedIn/ABM, referrals",
          kpis:["Qualified leads","Pipeline value"], capabilities:["C4","C5"], processes:["P2","P5"], decisions:["D1","D8"] },
        { stage:"Onboard", emotion:2, touchpoints:"KYB/KYC, account opening, mandate capture, cash-management setup",
          kpis:["Time-to-value","Onboarding completion"], capabilities:["C5","C8"], processes:["P6"], decisions:["D4","D5"] },
        { stage:"Serve", emotion:3, touchpoints:"RM servicing, digital business banking, merchant/payment enablement",
          kpis:["SLA adherence","Service request resolution","CSAT"], capabilities:["C11","C12"], processes:["PX2"], decisions:["DX2"] },
        { stage:"Grow", emotion:4, touchpoints:"Account triggers, lending applications, treasury cross-sell, sector insight",
          kpis:["Deposit / loan growth","Wallet share","RM productivity"], capabilities:["C13","C15"], processes:["P7","PX4"], decisions:["D7","DX7"] },
        { stage:"Retain", emotion:3, touchpoints:"Renewal management, relationship reviews, churn-risk intervention",
          kpis:["Retention","Renewal rate"], capabilities:["C16","C11"], processes:["PX6"], decisions:["DX6"] },
        { stage:"Advocate", emotion:4, touchpoints:"Case studies, referrals, sector community, co-marketing",
          kpis:["Referral rate","Reference accounts"], capabilities:["C6"], processes:["P7"], decisions:["DX3"] }
      ] },
    { id:"CJ-WEA-01", lob:"Wealth", name:"Acquire & advise an affluent / HNW client",
      persona:"Affluent / HNW individual, family or intergenerational client",
      stages:[
        { stage:"Acquire", emotion:3, touchpoints:"COI referrals, thought leadership, exclusive events, advisor outreach",
          kpis:["Qualified prospects","Advisory meeting conversion"], capabilities:["C6","C5"], processes:["P2"], decisions:["D1","D2"] },
        { stage:"Onboard", emotion:2, touchpoints:"Suitability & profile capture, KYC/AML, proposal & mandate, funding",
          kpis:["Onboarding completion","Net new money at onboarding"], capabilities:["C5","C8"], processes:["P6"], decisions:["D4","D5","DX8"] },
        { stage:"Serve", emotion:4, touchpoints:"Advisor reviews, digital portfolio, planning tools, life-event guidance",
          kpis:["Advisory review completion","CSAT / trust"], capabilities:["C11","C15"], processes:["PX2","PX6"], decisions:["DX2","DX8"] },
        { stage:"Grow", emotion:4, touchpoints:"Portfolio expansion, relationship pricing, next-best-conversation prompts",
          kpis:["AUM growth","Net new money","Share of wallet"], capabilities:["C13","C15"], processes:["P7","PX4"], decisions:["D7","DX7"] },
        { stage:"Retain", emotion:3, touchpoints:"Proactive reviews, intergenerational planning, retention conversations",
          kpis:["Retention","Advisor continuity"], capabilities:["C16","C11"], processes:["PX6"], decisions:["DX6"] },
        { stage:"Advocate", emotion:5, touchpoints:"Referrals, family introductions, exclusive community",
          kpis:["Referral rate","Family / COI introductions"], capabilities:["C6"], processes:["P7"], decisions:["DX3"] }
      ] },
    { id:"CJ-TRD-01", lob:"Trade Finance", name:"Grow an importer / exporter trade relationship",
      persona:"Importer / exporter, supply-chain finance client",
      stages:[
        { stage:"Acquire", emotion:3, touchpoints:"Trade advisory, corporate RM, trade webinars, partner ecosystem",
          kpis:["Trade leads","Advisory conversion"], capabilities:["C5","C6"], processes:["P2"], decisions:["D1","D8"] },
        { stage:"Onboard", emotion:2, touchpoints:"Facility setup, KYC/KYB, sanctions screening, documentation",
          kpis:["Facility setup time","Onboarding completion"], capabilities:["C5","C8"], processes:["P6"], decisions:["D4","D5"] },
        { stage:"Serve", emotion:3, touchpoints:"LC / guarantee request, document prep, issuance / advising, presentation",
          kpis:["Application / document turnaround","SLA adherence","Discrepancy rate"], capabilities:["C11","C12"], processes:["PX2"], decisions:["DX2"] },
        { stage:"Grow", emotion:4, touchpoints:"Working-capital expansion, supply-chain finance, transaction triggers",
          kpis:["Transaction volume","Trade fee income"], capabilities:["C13","C15"], processes:["P7","PX4"], decisions:["D7","DX7"] },
        { stage:"Retain", emotion:3, touchpoints:"Renewal, discrepancy resolution, compliance escalation handling",
          kpis:["Retention","Compliance escalation rate"], capabilities:["C16","C11"], processes:["PX6"], decisions:["DX6"] },
        { stage:"Advocate", emotion:4, touchpoints:"Trade ecosystem references, partner co-marketing",
          kpis:["Referral rate","Ecosystem references"], capabilities:["C6"], processes:["P7"], decisions:["DX3"] }
      ] }
  ],

  /* ---- Capability map (BA doc Table 5 = C1..C10; Extension §7 = C11..C17)
     Each capability carries an AGREED MATURITY (0..5) or null=unrated.
     Maturity scale: 0 Absent · 1 Ad-hoc · 2 Developing · 3 Defined ·
                     4 Managed · 5 Optimising.
     The seeded values below are ILLUSTRATIVE workshop starting points
     (status "Proposed") — capabilities are re-scored and signed off live. */
  capabilities: [
    { id:"C1", name:"Strategy, brand & portfolio governance", maturity:3, status:"Proposed",
      def:"Define marketing strategy, brand architecture, segment priorities, value propositions, budgets, governance, and performance objectives.",
      children:[
        {id:"C1.1", name:"Marketing strategy & planning"},
        {id:"C1.2", name:"Brand architecture & identity"},
        {id:"C1.3", name:"Segment prioritisation"},
        {id:"C1.4", name:"Budget & portfolio governance"},
        {id:"C1.5", name:"Performance objective setting"}
      ]},
    { id:"C2", name:"Market, customer & relationship insight", maturity:2, status:"Proposed",
      def:"Research markets, understand needs, segment customers, manage personas, identify life/business events, and produce customer/relationship insight.",
      children:[
        {id:"C2.1", name:"Market & competitor research"},
        {id:"C2.2", name:"Customer segmentation & personas"},
        {id:"C2.3", name:"Life / business event detection"},
        {id:"C2.4", name:"Relationship insight production"}
      ]},
    { id:"C3", name:"Proposition & offer management", maturity:3, status:"Proposed",
      def:"Translate products into customer-facing propositions, offers, bundles, pricing narratives, proof points, and RM/advisor enablement content.",
      children:[
        {id:"C3.1", name:"Proposition design"},
        {id:"C3.2", name:"Offer & bundle management"},
        {id:"C3.3", name:"Pricing narrative & proof points"},
        {id:"C3.4", name:"RM / advisor enablement content"}
      ]},
    { id:"C4", name:"Campaign & journey orchestration", maturity:2, status:"Proposed",
      def:"Plan, execute, personalize, and optimize campaigns across digital, physical, social, events, RM, and partner channels; omnichannel success depends on integrated online/physical touchpoints and coherent end-to-end journeys.",
      children:[
        {id:"C4.1", name:"Campaign planning"},
        {id:"C4.2", name:"Omnichannel execution"},
        {id:"C4.3", name:"Personalisation of campaigns"},
        {id:"C4.4", name:"Campaign optimisation"}
      ]},
    { id:"C5", name:"Lead, referral & sales enablement", maturity:2, status:"Proposed",
      def:"Manage lead capture, scoring, qualification, routing, next-best-action, pipeline handoff, and sales conversation support.",
      children:[
        {id:"C5.1", name:"Lead capture & scoring"},
        {id:"C5.2", name:"Qualification & routing"},
        {id:"C5.3", name:"Next-best-action prompting"},
        {id:"C5.4", name:"Pipeline handoff & sales support"}
      ]},
    { id:"C6", name:"Content, communications & reputation", maturity:3, status:"Proposed",
      def:"Manage messaging, thought leadership, financial education, internal communications, employee advocacy, public relations, events, sponsorships, and reputation.",
      children:[
        {id:"C6.1", name:"Messaging & content management"},
        {id:"C6.2", name:"Thought leadership & financial education"},
        {id:"C6.3", name:"PR, events & sponsorships"},
        {id:"C6.4", name:"Reputation & advocacy"}
      ]},
    { id:"C7", name:"Data, MarTech, analytics & AI enablement", maturity:2, status:"Proposed",
      def:"Manage consented data use, marketing automation, customer 360, experimentation, attribution, dashboards, AI-assisted content/insight, and governed definitions.",
      children:[
        {id:"C7.1", name:"Consented data use"},
        {id:"C7.2", name:"Marketing automation & MarTech"},
        {id:"C7.3", name:"Experimentation & attribution"},
        {id:"C7.4", name:"AI-assisted content & insight"},
        {id:"C7.5", name:"Governed definitions & dashboards"}
      ]},
    { id:"C8", name:"Risk, compliance & responsible marketing", maturity:3, status:"Proposed",
      def:"Apply conduct, privacy, AML/KYC, suitability, disclosure, accessibility, and evidence controls to campaigns and decisions.",
      children:[
        {id:"C8.1", name:"Conduct & privacy controls"},
        {id:"C8.2", name:"AML / KYC & suitability"},
        {id:"C8.3", name:"Disclosure & accessibility"},
        {id:"C8.4", name:"Evidence & audit controls"}
      ]},
    { id:"C9", name:"Marketing operations & partner management", maturity:2, status:"Proposed",
      def:"Manage briefs, workflow, resources, agencies, media, creative operations, SLAs, asset reuse, and delivery quality.",
      children:[
        {id:"C9.1", name:"Brief & workflow management"},
        {id:"C9.2", name:"Agency & media management"},
        {id:"C9.3", name:"Creative operations & asset reuse"},
        {id:"C9.4", name:"SLA & delivery quality"}
      ]},
    { id:"C10", name:"Measurement, learning & optimization", maturity:2, status:"Proposed",
      def:"Close the loop from outcomes to insight, update segments/offers, manage KPI definitions, and prioritize improvement.",
      children:[
        {id:"C10.1", name:"Outcome-to-insight loop"},
        {id:"C10.2", name:"KPI definition management"},
        {id:"C10.3", name:"Improvement prioritisation"}
      ]},
    /* Extension domains (Extension §7) — C11..C17 */
    { id:"C11", name:"Customer Experience Management", maturity:1, status:"Proposed", ext:true,
      def:"Own experience strategy, standards and voice-of-customer, turning friction and complaint insight into measured experience improvement and service recovery.",
      children:[
        {id:"C11.1", name:"CX strategy"},
        {id:"C11.2", name:"Experience standards"},
        {id:"C11.3", name:"VoC management"},
        {id:"C11.4", name:"Complaint insight"},
        {id:"C11.5", name:"Experience measurement"},
        {id:"C11.6", name:"Service recovery design"}
      ]},
    { id:"C12", name:"Journey Management", maturity:1, status:"Proposed", ext:true,
      def:"Manage the journey portfolio: mapping, ownership, analytics, governance and optimisation of end-to-end customer journeys.",
      children:[
        {id:"C12.1", name:"Journey portfolio management"},
        {id:"C12.2", name:"Journey mapping"},
        {id:"C12.3", name:"Journey ownership"},
        {id:"C12.4", name:"Journey analytics"},
        {id:"C12.5", name:"Journey governance"},
        {id:"C12.6", name:"Journey optimisation"}
      ]},
    { id:"C13", name:"Personalisation Management", maturity:1, status:"Proposed", ext:true,
      def:"Select governed, context-aware treatments in real time: segmentation, propensity, next-best-action/offer, channel selection, contact policy, content personalisation and experimentation.",
      children:[
        {id:"C13.1", name:"Segmentation"},
        {id:"C13.2", name:"Propensity modelling"},
        {id:"C13.3", name:"NBA / NBO"},
        {id:"C13.4", name:"Channel selection"},
        {id:"C13.5", name:"Contact policy"},
        {id:"C13.6", name:"Content personalisation"},
        {id:"C13.7", name:"Experimentation"}
      ]},
    { id:"C14", name:"CDP Management", maturity:0, status:"Proposed", ext:true,
      def:"Operate the customer data platform as a governed data-product platform: identity, Customer 360, consent/preference, event ingestion, enrichment, activation and data quality/lineage.",
      children:[
        {id:"C14.1", name:"Customer identity"},
        {id:"C14.2", name:"Customer 360"},
        {id:"C14.3", name:"Consent / preference"},
        {id:"C14.4", name:"Event ingestion"},
        {id:"C14.5", name:"Profile enrichment"},
        {id:"C14.6", name:"Activation integration"},
        {id:"C14.7", name:"Data quality / lineage"}
      ]},
    { id:"C15", name:"Customer Intelligence", maturity:2, status:"Proposed", ext:true,
      def:"Generate insight from behaviour: pathing, cohort and attribution analysis and customer needs / jobs-to-be-done analytics.",
      children:[
        {id:"C15.1", name:"Insight generation"},
        {id:"C15.2", name:"Behavioural analytics"},
        {id:"C15.3", name:"Pathing analysis"},
        {id:"C15.4", name:"Cohort analysis"},
        {id:"C15.5", name:"Attribution"},
        {id:"C15.6", name:"Needs / JTBD analytics"}
      ]},
    { id:"C16", name:"CLV Management", maturity:1, status:"Proposed", ext:true,
      def:"Govern customer lifetime value: CLV model governance, customer profitability, retention and cross-sell economics, customer equity and value-based prioritisation.",
      children:[
        {id:"C16.1", name:"CLV model governance"},
        {id:"C16.2", name:"Customer profitability"},
        {id:"C16.3", name:"Retention economics"},
        {id:"C16.4", name:"Cross-sell economics"},
        {id:"C16.5", name:"Customer equity"},
        {id:"C16.6", name:"Value-based prioritisation"}
      ]},
    { id:"C17", name:"Feedback & Measurement", maturity:2, status:"Proposed", ext:true,
      def:"Close the loop on experience: NPS/CSAT/CES, journey KPIs, closed-loop feedback, improvement backlog, benefit realisation and KPI-definition governance.",
      children:[
        {id:"C17.1", name:"NPS / CSAT / CES"},
        {id:"C17.2", name:"Journey KPIs"},
        {id:"C17.3", name:"Closed-loop feedback"},
        {id:"C17.4", name:"Improvement backlog"},
        {id:"C17.5", name:"Benefit realisation"},
        {id:"C17.6", name:"KPI definition governance"}
      ]}
  ],

  /* ---- Processes (BA doc Table 6 = P1..P8; Extension §8 = PX1..PX8) ----- */
  processes: [
    { id:"P1", name:"Define segment strategy & value proposition",
      inputs:"Strategy, market research, segment economics, brand position",
      outputs:"Segment CVP, priority outcomes, KPI tree",
      capabilities:["C1","C2","C3"], participants:"Executives, marketing strategy, product, segment heads, finance" },
    { id:"P2", name:"Identify opportunity & target audience",
      inputs:"Customer data, market triggers, consent, relationship insight",
      outputs:"Target segments, personas, propensity lists",
      capabilities:["C2","C7","C8"], participants:"Analytics, data owners, RMs, product, risk/compliance" },
    { id:"P3", name:"Design offer, message & journey",
      inputs:"CVP, product rules, channel constraints, compliance rules",
      outputs:"Campaign brief, offer logic, content, journey design",
      capabilities:["C3","C4","C6","C8"], participants:"Marketing, product, legal/compliance, channel owners" },
    { id:"P4", name:"Approve & activate campaign",
      inputs:"Brief, content, rules, budget, channel plan",
      outputs:"Approved campaign, channel deployment, RM packs",
      capabilities:["C4","C6","C8","C9"], participants:"Marketing ops, agencies, digital, comms, RMs" },
    { id:"P5", name:"Capture, qualify & route demand",
      inputs:"Responses, event leads, digital signals, referrals",
      outputs:"Scored leads, RM tasks, nurturing journeys",
      capabilities:["C5","C7","C9"], participants:"Sales/RM, CRM, digital, contact centre" },
    { id:"P6", name:"Convert, onboard & fulfil",
      inputs:"Qualified lead, customer intent, documents, eligibility",
      outputs:"New/expanded relationship, fulfilled product/service",
      capabilities:["C5","C8","C9"], participants:"Sales, onboarding, KYC, operations, product" },
    { id:"P7", name:"Retain, deepen & advocate",
      inputs:"Usage, satisfaction, attrition signals, relationship data",
      outputs:"Cross-sell, retention interventions, referrals",
      capabilities:["C2","C3","C5","C6","C7"], participants:"RMs, service, wealth advisors, product, analytics" },
    { id:"P8", name:"Measure, learn & optimize",
      inputs:"Campaign, sales, CX, risk and cost data",
      outputs:"Performance report, decision learning, revised models",
      capabilities:["C7","C10"], participants:"Marketing, finance, analytics, executives, risk" },
    /* Extension cross-functional processes */
    { id:"PX1", name:"Journey Design", ext:true,
      inputs:"Persona, JTBD, stage & touchpoint definitions, pain/gain",
      outputs:"Journey map, moment-of-truth register, KPI map",
      capabilities:["C11","C12"], participants:"CX / Journey Owner" },
    { id:"PX2", name:"Journey Monitoring", ext:true,
      inputs:"Journey performance, drop-offs, complaints, sentiment",
      outputs:"Journey dashboard, issue backlog",
      capabilities:["C12","C15","C17"], participants:"CX Analytics" },
    { id:"PX3", name:"Journey Optimisation", ext:true,
      inputs:"Issue backlog, test results, priorities",
      outputs:"Improvement backlog, releases, test results",
      capabilities:["C12","C17"], participants:"CXO / Product / Operations" },
    { id:"PX4", name:"Personalisation Operations", ext:true,
      inputs:"Targeting rules, treatment selection, content & channel rules",
      outputs:"Active journeys, NBA rules, contact policy",
      capabilities:["C13","C7"], participants:"Marketing / Personalisation CoE" },
    { id:"PX5", name:"Customer Insight Management", ext:true,
      inputs:"Data, VoC, behavioural analytics",
      outputs:"Insight briefs, segment definitions, opportunity hypotheses",
      capabilities:["C15","C2"], participants:"Customer Intelligence" },
    { id:"PX6", name:"CLV Optimisation", ext:true,
      inputs:"CLV forecast, cost, margin, retention uplift",
      outputs:"CLV scenarios, value-based treatments",
      capabilities:["C16"], participants:"Finance + Marketing + Product" },
    { id:"PX7", name:"Customer Feedback Management", ext:true,
      inputs:"NPS/CSAT/CES, feedback, driver analysis",
      outputs:"Driver analysis, action plan, closed loop",
      capabilities:["C17","C11"], participants:"CX / VoC" },
    { id:"PX8", name:"CDP Operations", ext:true,
      inputs:"Identity, consent, profiles, activation, lineage",
      outputs:"Customer 360, audiences, audit logs",
      capabilities:["C14"], participants:"Data / CDP Product Owner" }
  ],

  /* ---- Decision models (BA doc Table 7 = D1..D10; Extension §9 = DX1..DX8) */
  decisions: [
    { id:"D1", name:"Segment & target selection",
      inputs:"Segment value, eligibility, consent, propensity, risk flags",
      rules:"Exclude non-consented customers; prioritize high-value needs",
      outcome:"Target list / persona", owner:"Marketing + Analytics + Risk" },
    { id:"D2", name:"Value proposition selection",
      inputs:"Segment needs, product fit, competitor position",
      rules:"Message must state customer benefit, not only product feature",
      outcome:"CVP / message theme", owner:"Marketing strategy + Product" },
    { id:"D3", name:"Campaign go/no-go & prioritisation",
      inputs:"Budget, capacity, expected ROI, risk rating",
      rules:"Launch only when owner, KPI, compliance approval and fulfilment capacity exist",
      outcome:"Approved / deferred campaign", owner:"CMO / segment sponsor" },
    { id:"D4", name:"Offer eligibility & suitability",
      inputs:"Product criteria, affordability, risk, needs",
      rules:"Do not present unsuitable or ineligible offers",
      outcome:"Eligible offer set", owner:"Product + Risk / Compliance" },
    { id:"D5", name:"Consent, privacy & data-use",
      inputs:"Consent, purpose, data sensitivity, channel preference",
      rules:"Use only approved data for approved purpose; provide opt-out",
      outcome:"Allowed / blocked data use", owner:"Privacy / Data owner" },
    { id:"D6", name:"Channel & contact strategy",
      inputs:"Preference, engagement history, urgency, cost",
      rules:"Use preferred channel unless regulatory or service need overrides",
      outcome:"Channel / contact plan", owner:"Channel owner + Marketing" },
    { id:"D7", name:"Next-best-action",
      inputs:"Relationship state, event trigger, propensity, service issues",
      rules:"Service recovery may outrank sales offer",
      outcome:"Action recommendation", owner:"Analytics + Sales" },
    { id:"D8", name:"Lead scoring & routing",
      inputs:"Lead source, intent, value, segment, geography, RM ownership",
      rules:"Route high-value commercial/wealth leads to named RM/advisor",
      outcome:"Lead owner and SLA", owner:"Sales operations" },
    { id:"D9", name:"Content & disclosure approval",
      inputs:"Claim, product terms, risk rating, audience",
      rules:"Claims must be substantiated; required disclosures included",
      outcome:"Approved content", owner:"Legal / Compliance + Brand" },
    { id:"D10", name:"Measurement & optimization",
      inputs:"KPI results, control group, cost, conversion, complaints",
      rules:"Stop/adjust if lift is negative or risk complaints exceed threshold",
      outcome:"Continue / scale / stop", owner:"Marketing performance + Finance" },
    /* Extension decisions */
    { id:"DX1", name:"Journey Prioritisation", ext:true,
      inputs:"CLV, NPS/CSAT/CES, complaint volume, drop-off, cost-to-serve",
      rules:"Prioritise journeys with highest value-at-risk and worst experience",
      outcome:"Journey improvement backlog priority", owner:"CXO / Journey Council" },
    { id:"DX2", name:"Journey Stage Treatment", ext:true,
      inputs:"Journey state, persona, product, behaviour, risk, consent",
      rules:"Treatment must fit stage intent and consent basis",
      outcome:"Treatment category", owner:"Personalisation CoE" },
    { id:"DX3", name:"Next Best Action (extended)", ext:true,
      inputs:"Propensity, CLV, churn risk, eligibility, journey state",
      rules:"Rank actions by value × eligibility × consent",
      outcome:"Ranked action", owner:"Analytics + Marketing" },
    { id:"DX4", name:"Channel Selection", ext:true,
      inputs:"Preference, urgency, sensitivity, cost, consent, RM/advisor context",
      rules:"Respect preference and sensitivity before cost",
      outcome:"Channel and contact timing", owner:"Channel owner" },
    { id:"DX5", name:"Customer Treatment Eligibility", ext:true,
      inputs:"Consent, risk, affordability, vulnerability, product eligibility",
      rules:"Suppress if consent, vulnerability or eligibility fails",
      outcome:"Allow / suppress / refer", owner:"Risk + Personalisation" },
    { id:"DX6", name:"Retention Decision", ext:true,
      inputs:"Churn risk, complaint state, value, tenure, product usage",
      rules:"High-value + high-churn enters priority retention path",
      outcome:"Retention path", owner:"CLV + Marketing + RM" },
    { id:"DX7", name:"CLV Optimisation", ext:true,
      inputs:"CLV forecast, cost, margin, retention uplift, expected response",
      rules:"Invest where marginal CLV uplift exceeds cost",
      outcome:"Treatment investment recommendation", owner:"Finance + Marketing" },
    { id:"DX8", name:"Human Review", ext:true,
      inputs:"Risk level, regulated advice, vulnerable customer, complaint, GenAI output",
      rules:"Route high-risk / regulated / GenAI actions to human review",
      outcome:"Auto / review / block", owner:"Risk / Compliance" }
  ],

  /* ---- KPIs (BA doc Table 4) — KT1..KT7 themes ------------------------- */
  kpis: [
    { id:"KT1", theme:"Acquisition & onboarding",
      items:["Qualified leads","Conversion rate","Funded new accounts","Cost per acquired customer","Digital onboarding completion","Lead-to-open cycle time"] },
    { id:"KT2", theme:"Relationship growth & cross-sell",
      items:["Product penetration","Share of wallet","Deposit/loan balance growth","Fee income","Primary-bank indicator","Cross-sell conversion"] },
    { id:"KT3", theme:"Engagement & experience",
      items:["Campaign response","Digital engagement","Event/webinar attendance","RM follow-up completion","NPS / CSAT","Complaint rate","Journey drop-off"] },
    { id:"KT4", theme:"Wealth relationship value",
      items:["AUM growth","Net new money","Advisory meeting conversion","Referral rate","Retention","Trust / content engagement"] },
    { id:"KT5", theme:"Trade finance growth & service",
      items:["Trade leads","Transaction volume","Trade fee income","Application/document turnaround","SLA adherence","Compliance escalation rate"] },
    { id:"KT6", theme:"Brand & trust",
      items:["Brand awareness","Consideration","Reputation sentiment","Consent opt-in rate","Privacy complaints","Content compliance pass rate"] },
    { id:"KT7", theme:"Marketing performance",
      items:["Marketing ROI","Attributed revenue","CAC","CLV","Experiment lift","Campaign learning-cycle time","Reuse of approved assets"] }
  ],

  /* ---- Traceability threads (BA doc Table 8) --------------------------- */
  threads: [
    { name:"Retail acquisition", stakeholders:"Prospects, digital, branches, product, compliance",
      vp:"Relevant everyday banking, easy onboarding, trust",
      journeys:["CJ-RET-01"], kpis:"CAC, funded accounts, conversion, onboarding completion, NPS",
      capabilities:"C1–C9", processes:"P1–P6", decisions:"D1–D6, D8, D9" },
    { name:"Commercial relationship growth", stakeholders:"Business clients, RMs, treasury, product, credit",
      vp:"Cash-flow and growth support through relationship-led insight",
      journeys:["CJ-COM-01"], kpis:"Qualified leads, deposit/loan growth, wallet share, RM productivity",
      capabilities:"C2–C5, C7–C10", processes:"P1–P8", decisions:"D1, D3–D8, D10" },
    { name:"Wealth trust & advice", stakeholders:"Affluent/HNW clients, families, advisors, COIs",
      vp:"Trusted, personalized, holistic financial planning",
      journeys:["CJ-WEA-01"], kpis:"AUM, net new money, advisory conversion, retention, referrals",
      capabilities:"C1–C8, C10", processes:"P1–P8", decisions:"D2, D4–D9, D10" },
    { name:"Trade finance growth", stakeholders:"Importers/exporters, trade RMs, trade ops, risk, partners",
      vp:"Risk mitigation, payment assurance, working capital, trade advisory",
      journeys:["CJ-TRD-01"], kpis:"Trade leads, transactions, fees, turnaround, compliance escalations",
      capabilities:"C2–C5, C7–C10", processes:"P1–P8", decisions:"D1, D3–D9, D10" },
    { name:"Enterprise trust & brand", stakeholders:"Executives, regulators, communities, employees, customers",
      vp:"Clear, responsible, purpose-aligned communication",
      journeys:[], kpis:"Brand consideration, NPS, complaints, consent, compliance pass rate",
      capabilities:"C1, C6, C8, C10", processes:"P1, P3, P4, P8", decisions:"D3, D5, D9, D10" },
    { name:"Marketing learning system", stakeholders:"Marketing, finance, analytics, product, sales",
      vp:"Evidence-led improvement and accountable ROI",
      journeys:[], kpis:"ROI, CLV, attribution, experiment lift, learning-cycle time",
      capabilities:"C7, C10, C15, C17", processes:"P8, PX2, PX7", decisions:"D10, DX1" }
  ],

  /* ---- Segment comparison (BA doc Table 9) ----------------------------- */
  segmentComparison: {
    dimensions:["Dominant marketing logic","Key decision sensitivity","Core value metrics","Best-fit channels"],
    rows:{
      "Dominant marketing logic":{ Retail:"Scale, digital onboarding, lifecycle triggers", Commercial:"Relationship-led growth and sector relevance", Wealth:"Trust, credibility, referrals, advice-led engagement", Trade:"Expertise, risk mitigation, operational confidence" },
      "Key decision sensitivity":{ Retail:"Consent, eligibility, fair communication", Commercial:"Credit appetite, relationship ownership, sector fit", Wealth:"Suitability, disclosure, privacy, advisor fit", Trade:"AML/sanctions, document quality, counterparty risk" },
      "Core value metrics":{ Retail:"Acquisition, activation, retention, primary-bank status", Commercial:"Wallet share, deposits, loans, RM productivity", Wealth:"AUM, retention, referral, advisory conversion", Trade:"Trade volume, fee income, SLA, compliance quality" },
      "Best-fit channels":{ Retail:"Digital, branch, social, email, contact centre", Commercial:"RM, ABM, events, LinkedIn, sector content", Wealth:"Advisor, events, thought leadership, referrals", Trade:"Trade specialists, corporate RM, webinars, partner ecosystems" }
    }
  }
};

/* ============================================================================
   AI USE-CASE PORTFOLIO (marketing-specific) — U01..U18
   Value drivers (1–5): growth, personalisation relevance, retention/CLV, CX,
   cost efficiency.  Risk drivers (1–5, higher = more risk/less ready):
   data readiness, model maturity, integration complexity, regulatory/consent
   exposure.  cost (1–5) = relative build size (bubble size).
   phase: concept | pilot | production.  Scores are ILLUSTRATIVE workshop
   starting points — tune with risk & compliance.
   ========================================================================== */
window.GENERIC.aiDrivers = {
  value: [
    {key:"growth",      label:"Growth"},
    {key:"relevance",   label:"Personalisation relevance"},
    {key:"retention",   label:"Retention / CLV"},
    {key:"cx",          label:"Customer experience"},
    {key:"cost",        label:"Cost efficiency"}
  ],
  risk: [
    {key:"data",        label:"Data readiness"},
    {key:"model",       label:"Model maturity"},
    {key:"integration", label:"Integration complexity"},
    {key:"regulatory",  label:"Regulatory / consent exposure"}
  ]
};
window.GENERIC.aiThemes = ["Personalisation","Next-best-action","Churn & retention","Campaign optimisation","Content generation","Journey analytics","Experimentation","Insight & segmentation","Governance & responsible AI"];
window.GENERIC.aiUseCases = [
  { id:"U01", name:"Real-time next-best-action engine", theme:"Next-best-action", phase:"pilot", cost:4,
    desc:"Rank the best action (offer, service, nudge) per customer in real time from propensity, CLV, churn and journey state, enforcing consent and contact policy.",
    value:{growth:5,relevance:5,retention:5,cx:4,cost:3}, risk:{data:4,model:4,integration:4,regulatory:4},
    decisions:["D7","DX3"], terms:["Next Best Action","Contact Policy"] },
  { id:"U02", name:"Propensity-to-buy modelling", theme:"Insight & segmentation", phase:"production", cost:3,
    desc:"Score product propensity to prioritise cross-sell and target audiences with better fit and lower fatigue.",
    value:{growth:5,relevance:4,retention:3,cx:3,cost:4}, risk:{data:3,model:2,integration:3,regulatory:3},
    decisions:["D1","D7"], terms:["Propensity Model"] },
  { id:"U03", name:"Churn-risk prediction & save", theme:"Churn & retention", phase:"pilot", cost:3,
    desc:"Predict attrition early and trigger retention treatments, prioritised by value at risk.",
    value:{growth:3,relevance:3,retention:5,cx:4,cost:3}, risk:{data:3,model:3,integration:3,regulatory:3},
    decisions:["DX6","D7"], terms:["Churn Model","CLV"] },
  { id:"U04", name:"Customer lifetime value forecasting", theme:"Insight & segmentation", phase:"pilot", cost:3,
    desc:"Forecast CLV to steer acquisition quality, retention economics and value-based prioritisation.",
    value:{growth:4,relevance:3,retention:5,cx:3,cost:3}, risk:{data:4,model:4,integration:3,regulatory:2},
    decisions:["DX7"], terms:["CLV","Customer Equity"] },
  { id:"U05", name:"Hyper-personalised content & offers", theme:"Personalisation", phase:"pilot", cost:4,
    desc:"Assemble message, offer and creative per customer and context, governed by consent, fairness and frequency caps.",
    value:{growth:4,relevance:5,retention:4,cx:5,cost:3}, risk:{data:4,model:4,integration:4,regulatory:5},
    decisions:["DX2","DX5"], terms:["Hyper-personalisation","Consent Basis"] },
  { id:"U06", name:"GenAI marketing copy & creative", theme:"Content generation", phase:"pilot", cost:3,
    desc:"Draft campaign copy, variants and creative at scale with human review, brand and disclosure controls.",
    value:{growth:3,relevance:4,retention:2,cx:3,cost:5}, risk:{data:2,model:4,integration:3,regulatory:4},
    decisions:["D9","DX8"], terms:["GenAI","Content Approval"] },
  { id:"U07", name:"Campaign budget & mix optimisation", theme:"Campaign optimisation", phase:"concept", cost:3,
    desc:"Allocate spend across channels and campaigns to maximise ROI / attributed revenue under constraints.",
    value:{growth:5,relevance:3,retention:3,cx:2,cost:5}, risk:{data:4,model:4,integration:3,regulatory:2},
    decisions:["D3","D10"], terms:["Marketing ROI","Attribution"] },
  { id:"U08", name:"Channel & send-time optimisation", theme:"Campaign optimisation", phase:"production", cost:2,
    desc:"Choose channel and timing per customer from preference, engagement history and cost.",
    value:{growth:3,relevance:4,retention:3,cx:4,cost:4}, risk:{data:3,model:2,integration:3,regulatory:3},
    decisions:["D6","DX4"], terms:["Channel Selection"] },
  { id:"U09", name:"Lead scoring & intelligent routing", theme:"Next-best-action", phase:"production", cost:2,
    desc:"Score and route leads to the right RM/advisor with SLA, lifting conversion and RM productivity.",
    value:{growth:4,relevance:3,retention:2,cx:3,cost:4}, risk:{data:3,model:2,integration:3,regulatory:2},
    decisions:["D8"], terms:["Lead Score"] },
  { id:"U10", name:"Journey analytics & drop-off detection", theme:"Journey analytics", phase:"pilot", cost:3,
    desc:"Detect friction, drop-off and bottlenecks across journeys and feed the improvement backlog.",
    value:{growth:3,relevance:3,retention:4,cx:5,cost:3}, risk:{data:4,model:3,integration:4,regulatory:2},
    decisions:["DX1"], terms:["Journey Analytics","Moment of Truth"] },
  { id:"U11", name:"Sentiment & voice-of-customer mining", theme:"Insight & segmentation", phase:"pilot", cost:2,
    desc:"Mine complaints, surveys and interactions for driver insight and emerging issues.",
    value:{growth:2,relevance:3,retention:4,cx:5,cost:3}, risk:{data:3,model:3,integration:2,regulatory:3},
    decisions:["DX1"], terms:["Voice of Customer","CSAT"] },
  { id:"U12", name:"ML-driven micro-segmentation", theme:"Insight & segmentation", phase:"production", cost:2,
    desc:"Cluster customers into behavioural micro-segments for sharper targeting and proposition design.",
    value:{growth:4,relevance:5,retention:3,cx:3,cost:3}, risk:{data:3,model:3,integration:2,regulatory:3},
    decisions:["D1","D2"], terms:["Segmentation"] },
  { id:"U13", name:"Automated A/B & experiment engine", theme:"Experimentation", phase:"pilot", cost:2,
    desc:"Design, run and read experiments continuously to prove lift before scaling.",
    value:{growth:3,relevance:3,retention:2,cx:3,cost:4}, risk:{data:3,model:3,integration:3,regulatory:2},
    decisions:["D10"], terms:["Experiment Lift"] },
  { id:"U14", name:"Next-best-conversation for RMs/advisors", theme:"Next-best-action", phase:"concept", cost:3,
    desc:"Surface the right talking points and offers to RMs/advisors ahead of a client conversation.",
    value:{growth:4,relevance:4,retention:4,cx:4,cost:3}, risk:{data:4,model:4,integration:4,regulatory:4},
    decisions:["D7","DX3"], terms:["Next Best Conversation"] },
  { id:"U15", name:"Consent & preference intelligence", theme:"Governance & responsible AI", phase:"concept", cost:3,
    desc:"Keep consent, purpose and preferences enforced across every treatment and channel, with audit.",
    value:{growth:2,relevance:3,retention:3,cx:4,cost:2}, risk:{data:4,model:2,integration:4,regulatory:5},
    decisions:["D5","DX5"], terms:["Consent Basis","Preference Management"] },
  { id:"U16", name:"AI fairness & bias monitoring", theme:"Governance & responsible AI", phase:"concept", cost:3,
    desc:"Test marketing models for bias and monitor fairness, explainability and drift in production.",
    value:{growth:1,relevance:2,retention:2,cx:3,cost:2}, risk:{data:4,model:4,integration:3,regulatory:5},
    decisions:["DX8"], terms:["Fairness Testing","Explainability"] },
  { id:"U17", name:"Financial-wellness & proactive nudges", theme:"Personalisation", phase:"concept", cost:3,
    desc:"Detect life events and financial-wellness signals to serve helpful, non-sales nudges that build trust.",
    value:{growth:3,relevance:4,retention:4,cx:5,cost:3}, risk:{data:4,model:3,integration:4,regulatory:4},
    decisions:["DX2","DX5"], terms:["Life-event Signal"] },
  { id:"U18", name:"Marketing attribution & ROI modelling", theme:"Campaign optimisation", phase:"pilot", cost:3,
    desc:"Attribute outcomes to marketing touches to prove contribution and reallocate to what works.",
    value:{growth:4,relevance:2,retention:3,cx:2,cost:5}, risk:{data:5,model:4,integration:4,regulatory:2},
    decisions:["D10"], terms:["Attribution","Marketing ROI"] }
];

/* ============================================================================
   HYPER-PERSONALISATION & CDP (Extension §5–6)
   ========================================================================== */
window.GENERIC.hyperPersonalisation = {
  definition:"Context-aware, governed, real-time treatment selection across journeys — not simply more targeted campaigns. It blends real-time data, behavioural insight and AI-driven context to tailor messages, offers, actions and nudges, across digital, advisor, branch and contact-centre workflows.",
  objectives:[
    "Improve relevance, conversion, product adoption, retention, trust and CLV",
    "Reduce irrelevant outreach, campaign fatigue, churn, complaints and service friction",
    "Support proactive servicing as well as selling — fraud alerts, financial-wellness nudges, onboarding support, RM/advisor prompts"
  ],
  dataNeeds:[
    "Customer identity & household / business relationships","Product holdings","Transaction behaviour",
    "Digital events","Channel preferences","Consent","Complaints & service interactions",
    "Risk indicators & eligibility","Life-event / contextual signals"
  ],
  models:[
    {name:"Propensity", note:"Likelihood to take up a product / offer"},
    {name:"Churn risk", note:"Likelihood of attrition"},
    {name:"CLV", note:"Forecast lifetime value"},
    {name:"Next best action", note:"Best action now"},
    {name:"Next best conversation", note:"Best talking point for RM / advisor"},
    {name:"Contact policy", note:"How often / when to contact"},
    {name:"Channel selection", note:"Best channel to use"},
    {name:"Content personalisation", note:"Best message & creative"}
  ],
  governance:[
    "Consent & preference enforcement","Frequency caps","Treatment-conflict rules","Fairness / bias testing",
    "Explainability","Model monitoring","Human review for high-risk actions","Complaint-sensitive suppression","Audit logs"
  ],
  loop:["Governed customer data","Next-best-action decision","Journey orchestration","Channel activation","Feedback","CLV optimisation"]
};
window.GENERIC.cdpServices = [
  { id:"CDP1", name:"Customer identity management", cap:"C14",
    desc:"Party, person, household, business, beneficial owner, signatory, advisor/RM relationship." },
  { id:"CDP2", name:"Consent & preference management", cap:"C14",
    desc:"Channel, purpose, product, jurisdiction and campaign permissions." },
  { id:"CDP3", name:"Customer 360 profile management", cap:"C14",
    desc:"Demographic, behavioural, transactional, product, service, complaint and journey state." },
  { id:"CDP4", name:"Event streaming & journey state", cap:"C14",
    desc:"Live behavioural and transactional events." },
  { id:"CDP5", name:"Segmentation & audience management", cap:"C13",
    desc:"Rules, ML clusters, lifecycle segments, eligibility filters." },
  { id:"CDP6", name:"Feature & model input management", cap:"C13",
    desc:"Propensity, churn, CLV, affordability/risk features, explainability attributes." },
  { id:"CDP7", name:"Activation & orchestration services", cap:"C13",
    desc:"API, reverse ETL, batch audiences, event triggers, contact-centre / advisor surfaces." },
  { id:"CDP8", name:"Governance, lineage & quality controls", cap:"C14",
    desc:"Data provenance, match confidence, quality scores, masking, audit." }
];

/* ============================================================================
   CLV GOVERNANCE (Extension §3) and CXO OPERATING MODEL (Extension §4)
   ========================================================================== */
window.GENERIC.clv = {
  definition:"The total net revenue attributable to a customer over the life of the relationship — a discounted cash-flow view of customer profitability, discounted at the bank's target return, modelled as a governed business outcome and decisioning metric, not merely a marketing KPI.",
  accountability:[
    {fn:"Finance", owns:"Profitability definitions, discount/hurdle rate, revenue/cost allocation, validation against financial performance", marketing:"Co-designs marketing ROI, campaign incrementality and CLV-uplift reporting"},
    {fn:"Product", owns:"Product economics, pricing, product adoption and lifecycle value", marketing:"Provides propositions, bundles, content and proof points"},
    {fn:"Sales / RM", owns:"Relationship growth & depth, cross-sell/upsell, retention conversations", marketing:"Supplies NBA, propensity, trigger and journey insight for timely engagement"},
    {fn:"CX / CXO", owns:"Friction reduction, experience quality, loyalty, complaint learning and advocacy", marketing:"Turns VoC and journey analytics into campaigns, content and improvement themes"},
    {fn:"Data / Analytics", owns:"CLV model, identity resolution, features, model monitoring and data quality", marketing:"Enables targeting, segmentation, attribution, experimentation and personalisation"},
    {fn:"Marketing", owns:"Lifecycle engagement, acquisition quality, nurture, activation, retention messaging, advocacy and experimentation", marketing:"Contributes directly through orchestration, content, triggers, channel optimisation and treatment design"}
  ]
};
window.GENERIC.cxo = {
  definition:"The Customer Experience Officer is the enterprise experience integrator — owner of experience strategy, journey governance and cross-functional alignment — not a customer-service role. The CXO chairs a Customer Journey Council spanning Marketing, Digital, Product, Operations, Data/Analytics, Risk/Compliance, Finance, Sales/RM, Contact Centre, Branch/Advisor and Technology.",
  decisionRights:[
    {area:"Experience principles", cxo:"Approves journey principles, experience standards and journey prioritisation", shared:"Marketing, Product, Digital, Operations"},
    {area:"Journey ownership", cxo:"Defines journey owners, stage owners and issue-escalation paths", shared:"Business-line executives, Product, Operations"},
    {area:"KPI framework", cxo:"Ensures NPS/CSAT/CES, effort, complaint, retention and CLV are connected", shared:"Finance, Data, Marketing"},
    {area:"Customer treatment policy", cxo:"Sets guardrails for frequency caps, fairness, vulnerable customers, complaint-sensitive actions", shared:"Risk, Compliance, Data, Marketing"},
    {area:"Cross-channel consistency", cxo:"Resolves conflicts across branch, digital, contact centre, RM/advisor and campaign channels", shared:"Digital, Operations, Sales/RM"},
    {area:"Experience investment", cxo:"Prioritises journey fixes that reduce friction and improve value", shared:"Finance, Product, Technology"}
  ]
};

/* ============================================================================
   TRAINING & ADOPTION FRAMEWORK (Recommended Complete Matrix Content)
   ========================================================================== */
window.GENERIC.training = {
  phases:[
    {id:"LP1", name:"Awareness & Alignment"},
    {id:"LP2", name:"Shared Foundations"},
    {id:"LP3", name:"Role-Based Enablement"},
    {id:"LP4", name:"Adoption Reinforcement"}
  ],
  groups:[
    {id:"TG1", name:"Executive Sponsors & GMCA Exco", cells:[
      "Strategy, Business Value, Risk Appetite, AI Vision",
      "Data & AI Acumen, Governance Fundamentals",
      "Investment Decisions, Portfolio Oversight, AI Governance",
      "Executive Sponsorship, KPI Reviews, Benefits Realisation" ]},
    {id:"TG2", name:"Strategic Leaders & COE Leads", cells:[
      "Marketing Transformation Vision, Customer-Centric AI",
      "Data Literacy, AI Literacy, Responsible AI",
      "Use Case Prioritisation, Governance-by-Design, Value Measurement",
      "Portfolio Reviews, Value Tracking, Operating Model Refinement" ]},
    {id:"TG3", name:"Pod/Squad Leads & Product/Campaign Owners", cells:[
      "Agile Marketing Opportunities, AI Use Cases",
      "Responsible AI, Data Governance, Privacy",
      "Sprint Planning, Experimentation, Campaign Optimisation, Workflow Integration",
      "Coaching, Adoption Metrics, Backlog Refinement" ]},
    {id:"TG4", name:"Practitioners & Specialists", cells:[
      "Why Data & AI Matter, Customer Outcomes",
      "Data Literacy, AI Literacy, Data Quality",
      "Analytics, Prompt Engineering, Segmentation, Personalisation, Journey Analytics, Insight Storytelling",
      "Communities of Practice, Playbooks, Best Practices, Peer Learning" ]},
    {id:"TG5", name:"Data & AI Champions", cells:[
      "Champion Responsibilities, Change Leadership",
      "Advanced Responsible AI, Governance, Ethics",
      "Coaching, Facilitation, Risk Escalation, Use Case Incubation, Enablement Support",
      "Community Leadership, Office Hours, Adoption Monitoring, Continuous Improvement" ]}
  ],
  feedbackLoop:["Champions","Practitioners","Leaders","Executives"]
};

/* ============================================================================
   GOVERNANCE & RESPONSIBLE AI (matrix doc horizontal layers)
   ========================================================================== */
window.GENERIC.governance = {
  layers:[
    { id:"GL1", name:"Data Governance", subs:[
      {name:"Data Quality", maturity:2, decisions:["D5"], measure:"Data quality score"},
      {name:"Metadata", maturity:2, decisions:[], measure:"Metadata coverage"},
      {name:"Stewardship", maturity:2, decisions:[], measure:"Stewardship coverage"},
      {name:"Ownership", maturity:3, decisions:[], measure:"Owned data domains"},
      {name:"Data Products", maturity:1, decisions:["D5"], measure:"Governed data products"}
    ]},
    { id:"GL2", name:"Responsible AI", subs:[
      {name:"Fairness", maturity:1, decisions:["DX8"], measure:"Models bias-tested"},
      {name:"Transparency", maturity:1, decisions:["D9"], measure:"Model cards published"},
      {name:"Explainability", maturity:1, decisions:["DX8"], measure:"Explainable decisions"},
      {name:"Human Oversight", maturity:2, decisions:["DX8"], measure:"High-risk actions reviewed"},
      {name:"Risk Management", maturity:2, decisions:["DX8"], measure:"AI risks logged & mitigated"},
      {name:"Compliance", maturity:3, decisions:["D5","D9"], measure:"Compliance pass rate"}
    ]},
    { id:"GL3", name:"Change & Adoption", subs:[
      {name:"Champion Network", maturity:1, decisions:[], measure:"Active champions"},
      {name:"Communities of Practice", maturity:1, decisions:[], measure:"CoP participation"},
      {name:"Office Hours", maturity:0, decisions:[], measure:"Office-hours attendance"},
      {name:"Coaching", maturity:1, decisions:[], measure:"People coached"},
      {name:"Success Stories", maturity:1, decisions:[], measure:"Stories published"},
      {name:"Adoption Metrics", maturity:1, decisions:[], measure:"Tool / practice adoption"}
    ]}
  ],
  successMeasures:[
    "Capability Maturity","Data Literacy Growth","AI Literacy Growth","Governance Adoption",
    "Responsible AI Compliance","Use Case Delivery","Practice Adoption","Business Impact",
    "Marketing Performance","Stakeholder Engagement","Champion Network Effectiveness"
  ]
};

/* ============================================================================
   PACK CONFIG — sources, maturity scale, glossary link settings
   ========================================================================== */
window.PACK_CONFIG = {
  client:"Nedbank",
  identity:"Modelware · Data Management",
  engagement:"Nedbank Marketing Data & AI Engagement",
  publishStatus:"Draft — working copy (Generic content live; Nedbank content pending sign-off)",
  maturityScale:[
    {v:0, name:"Absent",    color:"#6b7280"},
    {v:1, name:"Ad-hoc",    color:"#b91c1c"},
    {v:2, name:"Developing",color:"#d97706"},
    {v:3, name:"Defined",   color:"#ca8a04"},
    {v:4, name:"Managed",   color:"#65a30d"},
    {v:5, name:"Optimising",color:"#15803d"}
  ],
  unratedColor:"#3a4358",
  statuses:["Proposed","Agreed","Needs work"],
  sources:[
    {id:"generic", label:"Generic (baked-in)", auth:"none",
     role:"Industry-generic Banking Marketing Architecture — the teaching / reference baseline, always available offline", available:true},
    {id:"nedbank_public", label:"Nedbank Public", auth:"none",
     role:"The agreed, cleared Nedbank architecture the wider audience reads", available:false},
    {id:"nedbank_private", label:"Nedbank Private", auth:"github-token",
     role:"The live working content the working group edits / votes / signs off", available:false}
  ],
  glossary:{
    enabled:false,
    baseUrl:"",
    linkTemplate:"{base}?term={key}",
    note:"Set the Nedbank Glossary Workbench base URL and link template on the Glossary settings page. Until set, term chips are shown but inert."
  },
  pages:[
    {file:"index.html", nav:"Home", title:"Landing"},
    {file:"business_architecture.html", nav:"Architecture", title:"Business Architecture"},
    {file:"customer_journey.html", nav:"Journeys", title:"Customer Journey & CX"},
    {file:"hyperpersonalisation_cdp.html", nav:"Personalisation", title:"Hyper-personalisation & CDP"},
    {file:"ai_usecases.html", nav:"AI Use-Cases", title:"AI Use-Cases"},
    {file:"training_adoption.html", nav:"Training", title:"Training & Adoption"},
    {file:"governance_responsible_ai.html", nav:"Governance", title:"Governance & Responsible AI"},
    {file:"glossary_settings.html", nav:"Glossary", title:"Glossary settings"}
  ]
};

/* ============================================================================
   REWORK ADD-ONS (v2): attention levels, SIPOC, decision tables, chain config
   ========================================================================== */

/* ---- Attention level per capability (heatmap 2nd dimension) -------------- */
/* Scale from the recruit-employee example: New · High · Medium · Low.        */
window.GENERIC.capAttention = {
  C1:"Medium", C2:"High", C3:"Medium", C4:"High", C5:"High", C6:"Low",
  C7:"High", C8:"Medium", C9:"Medium", C10:"High",
  C11:"New", C12:"New", C13:"New", C14:"New", C15:"High", C16:"New", C17:"High"
};

/* ---- SIPOC per process (Suppliers · Inputs · Process steps · Outputs · Customers)
   suppliers/customers carry an optional stakeholder id (sh) for cross-linking. */
window.GENERIC.processSIPOC = {
  P1:{ suppliers:[{l:"Executives & strategy",sh:"SH08"},{l:"Market research",sh:"SH05"},{l:"Finance",sh:"SH08"},{l:"Product",sh:"SH03"}],
       inputs:["Strategy","Market research","Segment economics","Brand position"],
       steps:["Review market & segment economics","Set segment priorities","Draft segment CVP","Define KPI tree","Approve strategy"],
       outputs:["Segment CVP","Priority outcomes","KPI tree"],
       customers:[{l:"Marketing",sh:"SH05"},{l:"Product",sh:"SH03"},{l:"Segment heads",sh:"SH08"}] },
  P2:{ suppliers:[{l:"Analytics & data",sh:"SH09"},{l:"Data owners",sh:"SH09"},{l:"RMs",sh:"SH02"},{l:"Risk/Compliance",sh:"SH07"}],
       inputs:["Customer data","Market triggers","Consent","Relationship insight"],
       steps:["Assemble consented data","Detect triggers & events","Score propensity","Build target segments & personas"],
       outputs:["Target segments","Personas","Propensity lists"],
       customers:[{l:"Marketing",sh:"SH05"},{l:"RMs",sh:"SH02"},{l:"Product",sh:"SH03"}] },
  P3:{ suppliers:[{l:"Marketing",sh:"SH05"},{l:"Product",sh:"SH03"},{l:"Legal/Compliance",sh:"SH07"},{l:"Channel owners",sh:"SH04"}],
       inputs:["CVP","Product rules","Channel constraints","Compliance rules"],
       steps:["Draft campaign brief","Design offer logic","Create content","Design journey","Compliance review"],
       outputs:["Campaign brief","Offer logic","Content","Journey design"],
       customers:[{l:"Marketing ops",sh:"SH05"},{l:"Agencies",sh:"SH10"},{l:"Channels",sh:"SH04"}] },
  P4:{ suppliers:[{l:"Marketing ops",sh:"SH05"},{l:"Agencies",sh:"SH10"},{l:"Digital",sh:"SH04"},{l:"Comms",sh:"SH05"}],
       inputs:["Brief","Content","Rules","Budget","Channel plan"],
       steps:["Final go/no-go approval","Configure channels","Deploy campaign","Brief RMs"],
       outputs:["Approved campaign","Channel deployment","RM packs"],
       customers:[{l:"Digital & channels",sh:"SH04"},{l:"RMs",sh:"SH02"},{l:"Customers",sh:"SH01"}] },
  P5:{ suppliers:[{l:"Digital",sh:"SH04"},{l:"Contact centre",sh:"SH04"},{l:"CRM / Sales ops",sh:"SH02"},{l:"Partners",sh:"SH10"}],
       inputs:["Responses","Event leads","Digital signals","Referrals"],
       steps:["Capture responses","Score leads","Qualify","Route to owner","Start nurture"],
       outputs:["Scored leads","RM tasks","Nurturing journeys"],
       customers:[{l:"Sales / RM",sh:"SH02"},{l:"Contact centre",sh:"SH04"}] },
  P6:{ suppliers:[{l:"Sales",sh:"SH02"},{l:"Onboarding & Ops",sh:"SH06"},{l:"KYC",sh:"SH07"},{l:"Product",sh:"SH03"}],
       inputs:["Qualified lead","Customer intent","Documents","Eligibility"],
       steps:["Confirm intent & eligibility","Capture KYC/KYB","Open account","Fulfil product / service"],
       outputs:["New / expanded relationship","Fulfilled product / service"],
       customers:[{l:"Customers",sh:"SH01"},{l:"RMs",sh:"SH02"},{l:"Product",sh:"SH03"}] },
  P7:{ suppliers:[{l:"RMs",sh:"SH02"},{l:"Service",sh:"SH04"},{l:"Analytics",sh:"SH09"},{l:"Product",sh:"SH03"}],
       inputs:["Usage","Satisfaction","Attrition signals","Relationship data"],
       steps:["Monitor usage & attrition","Identify cross-sell / retention","Trigger next-best-action","Capture referrals"],
       outputs:["Cross-sell","Retention interventions","Referrals"],
       customers:[{l:"Customers",sh:"SH01"},{l:"RMs / advisors",sh:"SH02"}] },
  P8:{ suppliers:[{l:"Analytics",sh:"SH09"},{l:"Finance",sh:"SH08"},{l:"Marketing",sh:"SH05"},{l:"Risk",sh:"SH07"}],
       inputs:["Campaign data","Sales data","CX data","Risk & cost data"],
       steps:["Consolidate results","Analyse lift & ROI","Update models & segments","Prioritise improvement"],
       outputs:["Performance report","Decision learning","Revised models"],
       customers:[{l:"Executives",sh:"SH08"},{l:"Marketing",sh:"SH05"},{l:"Product",sh:"SH03"}] },
  PX1:{ suppliers:[{l:"CX / Journey owner",sh:"SH05"},{l:"Product",sh:"SH03"},{l:"Operations",sh:"SH06"}],
        inputs:["Persona","JTBD","Stage & touchpoint definitions","Pain / gain"],
        steps:["Define persona & JTBD","Map stages & touchpoints","Mark moments of truth","Set journey KPIs"],
        outputs:["Journey map","Moment-of-truth register","KPI map"],
        customers:[{l:"CX Analytics",sh:"SH09"},{l:"Marketing",sh:"SH05"}] },
  PX2:{ suppliers:[{l:"CX Analytics",sh:"SH09"},{l:"Digital",sh:"SH04"},{l:"Contact centre",sh:"SH04"}],
        inputs:["Journey performance","Drop-offs","Complaints","Sentiment"],
        steps:["Collect journey telemetry","Detect drop-offs","Analyse sentiment","Log issues"],
        outputs:["Journey dashboard","Issue backlog"],
        customers:[{l:"CXO",sh:"SH08"},{l:"Product",sh:"SH03"}] },
  PX3:{ suppliers:[{l:"CXO",sh:"SH08"},{l:"Product",sh:"SH03"},{l:"Operations",sh:"SH06"}],
        inputs:["Issue backlog","Test results","Priorities"],
        steps:["Prioritise fixes","Design change","Test","Release"],
        outputs:["Improvement backlog","Releases","Test results"],
        customers:[{l:"Customers",sh:"SH01"},{l:"Journey owners",sh:"SH05"}] },
  PX4:{ suppliers:[{l:"Personalisation CoE",sh:"SH05"},{l:"Data & Analytics",sh:"SH09"},{l:"Channels",sh:"SH04"}],
        inputs:["Targeting rules","Treatment selection","Content & channel rules"],
        steps:["Configure treatments","Apply consent & frequency caps","Activate journeys","Monitor"],
        outputs:["Active journeys","NBA rules","Contact policy"],
        customers:[{l:"Customers",sh:"SH01"},{l:"Channels",sh:"SH04"}] },
  PX5:{ suppliers:[{l:"Customer Intelligence",sh:"SH09"},{l:"Voice of Customer",sh:"SH05"},{l:"Data",sh:"SH09"}],
        inputs:["Data","VoC","Behavioural analytics"],
        steps:["Aggregate signals","Analyse behaviour","Form hypotheses","Publish insight briefs"],
        outputs:["Insight briefs","Segment definitions","Opportunity hypotheses"],
        customers:[{l:"Marketing",sh:"SH05"},{l:"Product",sh:"SH03"}] },
  PX6:{ suppliers:[{l:"Finance",sh:"SH08"},{l:"Marketing",sh:"SH05"},{l:"Product",sh:"SH03"}],
        inputs:["CLV forecast","Cost","Margin","Retention uplift"],
        steps:["Forecast CLV","Model treatment ROI","Prioritise investment","Recommend"],
        outputs:["CLV scenarios","Value-based treatments"],
        customers:[{l:"Executives",sh:"SH08"},{l:"Marketing",sh:"SH05"}] },
  PX7:{ suppliers:[{l:"CX / VoC",sh:"SH05"},{l:"Contact centre",sh:"SH04"},{l:"Digital",sh:"SH04"}],
        inputs:["NPS / CSAT / CES","Feedback","Driver analysis"],
        steps:["Collect feedback","Analyse drivers","Plan actions","Close the loop"],
        outputs:["Driver analysis","Action plan","Closed loop"],
        customers:[{l:"CXO",sh:"SH08"},{l:"Customers",sh:"SH01"}] },
  PX8:{ suppliers:[{l:"Data / CDP Product Owner",sh:"SH09"},{l:"Source systems",sh:"SH09"},{l:"Risk / Privacy",sh:"SH07"}],
        inputs:["Identity","Consent","Profiles","Activation","Lineage"],
        steps:["Resolve identity","Enforce consent","Build Customer 360","Activate audiences","Log lineage"],
        outputs:["Customer 360","Audiences","Audit logs"],
        customers:[{l:"Personalisation CoE",sh:"SH05"},{l:"Analytics",sh:"SH09"}] }
};

/* ---- DMN-style decision-table rows (when → then) per decision ------------ */
window.GENERIC.decisionRules = {
  D1:[{when:"Customer not consented",then:"Exclude from targeting"},{when:"High value & high propensity & consented",then:"Include in priority target list"},{when:"Risk flag present",then:"Refer to Risk before targeting"}],
  D2:[{when:"Message states product feature only",then:"Reject — restate as customer benefit"},{when:"Segment need matches proposition",then:"Select CVP / message theme"}],
  D3:[{when:"Owner, KPI, compliance approval & capacity all present",then:"Approve"},{when:"Any of the above missing",then:"Defer"},{when:"Expected ROI below threshold",then:"No-go"}],
  D4:[{when:"Product criteria or affordability fails",then:"Suppress offer"},{when:"Eligible & suitable",then:"Add to eligible offer set"}],
  D5:[{when:"Purpose not covered by consent",then:"Block data use"},{when:"Consent valid for purpose",then:"Allow — honour opt-out"}],
  D6:[{when:"Preferred channel known & no override",then:"Use preferred channel"},{when:"Regulatory or service need",then:"Override to required channel"}],
  D7:[{when:"Open service issue",then:"Service recovery outranks sales offer"},{when:"No service issue & high propensity",then:"Recommend top offer"}],
  D8:[{when:"High-value commercial / wealth lead",then:"Route to named RM / advisor with SLA"},{when:"Retail lead",then:"Route to contact centre / branch queue"}],
  D9:[{when:"Claim unsubstantiated",then:"Reject content"},{when:"Required disclosures included & claims substantiated",then:"Approve"}],
  D10:[{when:"Lift negative",then:"Stop"},{when:"Lift positive & complaints below threshold",then:"Scale"},{when:"Complaints exceed threshold",then:"Adjust / hold"}],
  DX1:[{when:"High CLV-at-risk & poor experience",then:"Top of improvement backlog"},{when:"Low value & good experience",then:"Deprioritise"}],
  DX2:[{when:"Treatment fits stage intent & consent",then:"Apply treatment"},{when:"Consent absent",then:"Suppress"}],
  DX3:[{when:"Ranked by value × eligibility × consent",then:"Serve top-ranked action"},{when:"No eligible action",then:"No action"}],
  DX4:[{when:"Sensitive treatment",then:"Use secure / preferred channel"},{when:"Low sensitivity",then:"Optimise for cost"}],
  DX5:[{when:"Vulnerability or eligibility fails",then:"Suppress or refer"},{when:"All checks pass",then:"Allow"}],
  DX6:[{when:"High value & high churn risk",then:"Priority retention path"},{when:"Low value & high churn",then:"Standard / self-serve retention"}],
  DX7:[{when:"Marginal CLV uplift > cost",then:"Invest"},{when:"Uplift ≤ cost",then:"Do not invest"}],
  DX8:[{when:"High-risk / regulated advice / GenAI output",then:"Route to human review"},{when:"Low-risk automated",then:"Auto-proceed"}]
};

/* ---- Attention scale + traceability chain + new pages -------------------- */
window.PACK_CONFIG.attentionScale = [
  {k:"New",    color:"#7f1010"},
  {k:"High",   color:"#dc2626"},
  {k:"Medium", color:"#eab308"},
  {k:"Low",    color:"#16a34a"}
];
window.PACK_CONFIG.chain = [
  {key:"sh",  label:"Stakeholder"},
  {key:"vp",  label:"Value Proposition"},
  {key:"kpi", label:"KPI"},
  {key:"cap", label:"Capability Map"},
  {key:"cj",  label:"Customer Journey"},
  {key:"proc",label:"Business Process"},
  {key:"dec", label:"Decision"}
];
/* register the 3 new pages in nav order */
(function(){
  var p = window.PACK_CONFIG.pages;
  function has(f){ return p.some(function(x){return x.file===f;}); }
  if(!has("architecture_navigator.html")) p.splice(1,0,{file:"architecture_navigator.html", nav:"Navigator", title:"Architecture Navigator"});
  if(!has("business_process.html")){ var i=p.findIndex(function(x){return x.file==="customer_journey.html";}); p.splice(i+1,0,{file:"business_process.html", nav:"Processes", title:"Business Processes (SIPOC)"}); }
  if(!has("decisions.html")){ var j=p.findIndex(function(x){return x.file==="business_process.html";}); p.splice(j+1,0,{file:"decisions.html", nav:"Decisions", title:"Decision Models"}); }
})();

/* ---- version control stamp ---------------------------------------------- */
window.PACK_CONFIG.version = "v1.2.4";
window.PACK_CONFIG.built   = "2026-07-31 16:26 SAST";
window.PACK_CONFIG.changelog = [
  { v:"v1.2.4", date:"2026-07-31 16:26 SAST",
    note:"Navigator selections now persist across ANY navigation (top-nav links, cross-page chips, reloads) via saved chain context, so the breadcrumb never comes up empty; \"Start a new walk\" clears it. Decluttered the header: single-row nav (no wrapping into the breadcrumb), workbook row hidden until real downloads exist, version/last-change moved into the breadcrumb bar, slimmer Navigator heading." },
  { v:"v1.2.3", date:"2026-07-31 16:12 SAST",
    note:"Lightened the app header for readability (white header, dark text, higher contrast) and made the last-change time visible in the header (\"Updated <date-time> SAST\") rather than only on hover." },
  { v:"v1.2.2", date:"2026-07-31 16:08 SAST",
    note:"Fixed context loss in the Navigator: clicking a value stream on the Capability Map now advances in place to the journey step (keeping Stakeholder / Value Proposition / KPI), instead of linking out and dropping the chain. Returning to the Capability Map re-renders the heat map for the same value proposition." },
  { v:"v1.2.1", date:"2026-07-31 15:56 SAST",
    note:"Navigator now moves between steps in place (no page reload / jump); selections persist across the chain and the Capability Map node reflects the value-stream context. Back/forward supported." },
  { v:"v1.2.0", date:"2026-07-31 15:42 SAST",
    note:"Version-control stamp added (number + build date-time, SAST). Pack linked from the site's top-level Asset Navigator." },
  { v:"v1.1.0", date:"2026-07-31 SAST",
    note:"Architecture Navigator (guided walk of the full traceability chain) with a breadcrumb rail on every page; Business Processes as SIPOC; Decision Models as DMN-style tables; capability map recast under a value proposition as a value-stream heat map with an Attention / Maturity toggle." },
  { v:"v1.0.0", date:"2026-07-31 SAST",
    note:"Initial 8-page pack — Landing, Business Architecture, Customer Journey & CX, Hyper-personalisation & CDP, AI Use-Cases, Training & Adoption, Governance & Responsible AI, Glossary settings. Generic baked-in content layer." }
];
