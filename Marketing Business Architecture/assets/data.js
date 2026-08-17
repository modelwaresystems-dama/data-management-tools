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
  archTitle:"Marketing Business Architecture",
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
  /* the four ValueProposition segment columns — workbook header names (keys)
     and the labels shown in the app. Overridden per organisation (AGGPSA uses
     ecosystem focus segments). */
  vpSegments:{ keys:["Retail","Commercial","Wealth","TradeFinance"],
               labels:["Retail","Commercial","Wealth","Trade Finance"] },
  sources:[
    {id:"generic", label:"Nedbank — Marketing Data & AI", auth:"none",
     role:"Nedbank Marketing Data & AI Business Architecture — the banking engagement", available:true},
    {id:"aggpsa", label:"AGGPSA — Ecosystem Data & Analytics", auth:"none",
     role:"Allan & Gill Gray Philanthropy SA — catalytic ecosystem business architecture", available:true},
    {id:"modelware", label:"Modelware Systems — Whole-Business", auth:"none",
     role:"Modelware Systems — Option C whole-business architecture (Training + Advisory + Consulting)", available:true},
    {id:"nedbank_private", label:"Nedbank Private", auth:"github-token",
     role:"The live working content the working group edits / votes / signs off", available:false}
  ],
  glossary:{
    enabled:false,
    baseUrl:"",
    linkTemplate:"{base}?term={key}",
    note:"Set the Nedbank Glossary Workbench base URL and link template on the Glossary settings page. Until set, term chips are shown but inert."
  },
  policyInspector:{
    enabled:false,
    baseUrl:"",
    linkTemplate:"{base}?id={key}",
    note:"Point the pack at your external Policy Inspector HTML app here. Once set, every policy, theme, control and process shows an 'Open in Inspector ↗' deep-link. Until set, the pack's own built-in inspector is used."
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
  if(!has("ai_use_case_gate.html")){ var ug=p.findIndex(function(x){return x.file==="ai_usecases.html";}); p.splice((ug>=0?ug+1:p.length),0,{file:"ai_use_case_gate.html", nav:"AI Use-Case Gate", title:"AI Use-Case Gate"}); }
  if(!has("ai_agents.html")){ var k=p.findIndex(function(x){return x.file==="decisions.html";}); p.splice((k>=0?k+1:p.length),0,{file:"ai_agents.html", nav:"AI Agents", title:"AI Agents & Models"}); }
  if(!has("critical_data_elements.html")){ var q=p.findIndex(function(x){return x.file==="decisions.html";}); p.splice((q>=0?q+1:p.length),0,{file:"critical_data_elements.html", nav:"Critical Data", title:"Critical Data Elements"}); }
  if(!has("north_star.html")){ var vi=p.findIndex(function(x){return x.file==="value_streams.html";}); p.splice((vi>=0?vi+1:1),0,{file:"north_star.html", nav:"North Star", title:"North Star & Metric Tree"}); }
  if(!has("operating_model.html")){ var gi=p.findIndex(function(x){return x.file==="governance_responsible_ai.html";}); p.splice((gi>=0?gi+1:p.length),0,{file:"operating_model.html", nav:"Operating Model", title:"Operating Model"}); }
  if(!has("policy_inspector.html")){ var pgi=p.findIndex(function(x){return x.file==="operating_model.html";}); p.splice((pgi>=0?pgi+1:p.length),0,{file:"policy_inspector.html", nav:"Policy Inspector", title:"Policy Inspector"}); }
  if(!has("business_policies.html")){ var bpi=p.findIndex(function(x){return x.file==="policy_inspector.html";}); p.splice((bpi>=0?bpi+1:p.length),0,{file:"business_policies.html", nav:"Business Policies", title:"Business Policies & Controls"}); }
  if(!has("data_maturity.html")){ var dmi=p.findIndex(function(x){return x.file==="business_policies.html";}); p.splice((dmi>=0?dmi+1:p.length),0,{file:"data_maturity.html", nav:"DM Maturity", title:"Data Management Maturity"}); }
  if(!has("architecture_elements.html")){ var cdi=p.findIndex(function(x){return x.file==="critical_data_elements.html";}); p.splice((cdi>=0?cdi+1:p.length),0,{file:"architecture_elements.html", nav:"Arch Elements", title:"Architecture Elements"}); }
  if(!has("model_review.html")) p.push({file:"model_review.html", nav:"Model Review", title:"Architecture Model — Full Review"});
  if(!has("element_relationships.html")) p.push({file:"element_relationships.html", nav:"Relationships", title:"Element Relationships"});
})();

/* ============================================================================
   Rich-visual config (value proposition, capability map, process landscape).
   Nedbank baseline; AGGPSA overrides the same keys via org_switch.
   ========================================================================== */
window.PACK_CONFIG.valueProp = {
  statement:"Marketing bridges the relevance and trust gap between the bank and its customers — turning governed data and AI into relevant, well-timed, trusted propositions that grow value for the customer and the bank.",
  pillars:[
    {n:1,title:"Relevance & Personalisation",desc:"The right proposition, at the right moment, in the right channel — powered by governed data and AI."},
    {n:2,title:"Growth & Acquisition",desc:"Attract and convert the right customers efficiently, lifting quality acquisition and share of wallet."},
    {n:3,title:"Relationship & Lifetime Value",desc:"Deepen relationships and grow customer lifetime value through relevant, timely engagement."},
    {n:4,title:"Trust & Responsible Marketing",desc:"Consent-led, compliant and fair engagement that protects and builds long-term trust."}
  ],
  beneficiaries:[
    {name:"The Customer",benefit:"Relevant offers, less noise, and financial help at the moment it matters."},
    {name:"The Bank",benefit:"Efficient acquisition, deeper relationships and measurable marketing ROI."},
    {name:"Risk & Compliance",benefit:"Consent-led, auditable, fair-by-design engagement across every channel."}
  ],
  instruments:["Segments","Journeys","Offers","Campaigns","Next-Best-Action","CLV models"]
};
window.PACK_CONFIG.capabilityMap = {
  steering:[
    {id:"C1",name:"Strategy, brand & portfolio governance"},
    {id:"C8",name:"Risk, compliance & responsible marketing"},
    {id:"C10",name:"Measurement, learning & optimization"},
    {id:"C9",name:"Marketing operations & partner management"}
  ],
  core:[
    {domain:"1 · Insight & Intelligence",caps:[{id:"C2",name:"Market, customer & relationship insight"},{id:"C15",name:"Customer Intelligence"},{id:"C17",name:"Feedback & Measurement"}]},
    {domain:"2 · Proposition & Value",caps:[{id:"C3",name:"Proposition & offer management"},{id:"C16",name:"CLV Management"}]},
    {domain:"3 · Engagement & Journeys",caps:[{id:"C4",name:"Campaign & journey orchestration"},{id:"C12",name:"Journey Management"},{id:"C11",name:"Customer Experience Management"}]},
    {domain:"4 · Personalisation & Activation",caps:[{id:"C13",name:"Personalisation Management"},{id:"C5",name:"Lead, referral & sales enablement"}]},
    {domain:"5 · Content & Communications",caps:[{id:"C6",name:"Content, communications & reputation"}]}
  ],
  data:[
    {name:"Data Governance & Stewardship"},
    {name:"Data Quality Management"},
    {name:"Metadata & Business Glossary"},
    {name:"Master & Reference Data"},
    {name:"Data Integration & Pipelines"},
    {name:"Data Platform & Storage (Lakehouse)"},
    {name:"Data Privacy & Consent Management"},
    {name:"CDP & Customer Data Management"}
  ],
  enabling:[
    {name:"Advanced Analytics & BI",type:"support"},
    {name:"MarTech & Channel Platforms",type:"support"},
    {name:"Agentic AI & Intelligent Automation",type:"ai"},
    {name:"Audit, Assurance & Controls",type:"gov"}
  ]
};
window.PACK_CONFIG.processLandscape = {
  streams:["Acquire","Onboard","Serve","Grow","Retain","Advocate"],
  steering:["Product & Proposition Management","Risk Appetite & Marketing Policy","Regulatory & Compliance Governance","Performance, Portfolio & Assurance"],
  core:[
    {domain:"1 · Insight & Targeting",procs:[{id:"P1",name:"Define segment strategy & value proposition"},{id:"P2",name:"Identify opportunity & target audience"},{id:"PX5",name:"Customer Insight Management"}]},
    {domain:"2 · Design & Origination",procs:[{id:"P3",name:"Design offer, message & journey",ai:true},{id:"P4",name:"Approve & activate campaign"},{id:"PX1",name:"Journey Design"}]},
    {domain:"3 · Engage & Convert",procs:[{id:"P5",name:"Capture, qualify & route demand",ai:true},{id:"P6",name:"Convert, onboard & fulfil"},{id:"PX4",name:"Personalisation Operations",ai:true}]},
    {domain:"4 · Retain & Grow",procs:[{id:"P7",name:"Retain, deepen & advocate",ai:true},{id:"PX6",name:"CLV Optimisation",ai:true},{id:"PX7",name:"Customer Feedback Management"}]},
    {domain:"5 · Measure & Optimise",procs:[{id:"P8",name:"Measure, learn & optimize",ai:true},{id:"PX2",name:"Journey Monitoring"},{id:"PX3",name:"Journey Optimisation",ai:true}]}
  ],
  enabling:[
    {name:"Trade / Marketing Operations & Processing",type:"support"},
    {name:"Data, CDP & Platform Operations",type:"support"},
    {name:"AI Model Lifecycle & Governance (MLOps)",type:"ai"},
    {name:"Human-in-the-Loop Exception Adjudication",type:"gov"},
    {name:"Audit, Traceability & Assurance",type:"gov"}
  ]
};

/* ---- version control stamp ---------------------------------------------- */
window.PACK_CONFIG.version = "v1.73.0";
window.PACK_CONFIG.built   = "2026-08-17 14:20 SAST";
window.PACK_CONFIG.changelog = [
  { v:"v1.73.0", date:"2026-08-17 14:20 SAST",
    note:"Fixed a data-extraction defect in the process alternate-flow / exceptions. 'Reconcile Sales, Admin and Class Data' (P48 / UC-48), being the last use case in the specification, had over-run its Exceptions section and absorbed the trailing document sections — the whole Future-State Data Model concept list, Functional Requirements and glossary lines — so it showed ~78 'exceptions' instead of 5. Separately, Capture Marketing Contact (P4 / UC-04) had its 5 exceptions listed twice (10 rows). Both are corrected: P48 and P4 now carry exactly their real exceptions (5 each), and the build (build_modelware.py) now sanitises every use case's alternate-flow list — it truncates at any trailing section heading (Future-State Data Model, Functional Requirements, glossary, etc.) and de-duplicates exact repeats — so this class of defect cannot recur on a rebuild. Across all 68 Modelware processes the maximum alternate-flow count is now 5. The Modelware model, bundle and workbook were regenerated (126 sheets); execution mix unchanged (H 127 / DS 114 / AIS 46). Re-verified by the full sweep of all 100 processes (Modelware 68, Nedbank 16, AGGPSA 16): every diagram distinct, zero elements outside a swimlane, zero console errors." },
  { v:"v1.72.0", date:"2026-08-17 13:10 SAST",
    note:"Fixed — for good, and checked across every process — the problem of elements sitting outside a swimlane. Decision-outcome message end events (e.g. 'assign Student Group', 'self-study') and the exception boundary events were being drawn below the pool with no lane. Now: (1) swimlanes are variable-height — a lane grows to contain everything in it, so a decision's outcome end events stack inside the lane of the accountable party (the AI Steward who owns the decision) instead of spilling below; and (2) exception / alternate flows get their own 'Exception & alternate flows' lane at the foot of the pool, so those boundary events are inside a swimlane too. Nothing is drawn outside the pool any more. For the record, the two flagged outcomes belong to their decisions' steward, the Business Administration Specialist: 'assign Student Group' (from D027 Student Group Scheduling) creates a student-group assignment and notifies the Trainer; 'self-study' (from D011 Delivery Mode) creates a self-study enrolment and notifies the learner. Verified by an automated sweep of ALL 100 processes across Modelware (68), Nedbank (16) and AGGPSA (16): every diagram distinct, zero elements below the pool, zero console errors." },
  { v:"v1.71.0", date:"2026-08-17 11:35 SAST",
    note:"Brought the Modelware Future-State workbook (Modelware_FutureState_Model.xlsx) back in sync and made the decision outcome handlers part of the model. The workbook is a generated export of the model; its copy inside the pack had gone stale (it predated the whole process-step architecture). It is now regenerated from the current model — 126 sheets, including the process-step architecture (Process_Actor_Map, ProcessMainFlow, Process_Evidence …), the corrected execution types and information concepts, and a NEW sheet '215 · DecisionOutcomeHandler'. That sheet records, for every decision outcome, the action (Create & notify / Notify), the artefact created, the party notified, and whether the value was Authored or Derived from the process's SIPOC customer. The BPMN message end events now read this sheet as the source of truth (hydrated to decisionOutcomeHandlers) — so editing the handler data in the model flows straight through to the diagram — with the authored decision_handlers.js and SIPOC derivation kept as the fallback for Nedbank / AGGPSA, which do not carry the sheet. Polarity vocabulary extended (drop / abandon / discard now read as negative outcomes). The refreshed workbook is shipped in pack/model and the repo. Verified with no functional errors." },
  { v:"v1.70.0", date:"2026-08-17 03:00 SAST",
    note:"Decision-outcome end events now name the SPECIFIC party and artefact, driven by a new authorable outcome-handler field instead of generic wording. Each decision outcome can declare what it creates and whom it notifies (assets/decision_handlers.js, keyed by org → decision → outcome). Where an outcome is not authored, the notified party defaults to the process's real SIPOC party (its customer / requesting party) rather than the word 'requester', so every end event still names a real party. On AGGPSA's Partnership & Relational Capital the Partner outcome now ends in 'create partnership agreement · notify the partner' and the decline outcome in 'notify the requesting partner · declined'; Capture Marketing Contact shows 'create outreach task · notify Sales' vs 'notify the contact · added to suppression list'; Create & Maintain Student Group names the scheduled session / student group and the learner / trainer. The field is partial-friendly — you can specify just the created artefact or just the party and the rest is derived. Applies to Modelware, Nedbank and AGGPSA; verified with no functional errors." },
  { v:"v1.69.0", date:"2026-08-17 02:10 SAST",
    note:"Every decision-gateway outcome now terminates properly instead of dangling — a general fix across all processes. Previously an alternate outcome (e.g. 'decline') was drawn as a small label that went nowhere, so the flow looked unfinished. Now each outcome ends in a BPMN message end event with the action it triggers: a positive / accept outcome ends in a 'create & notify' event (create the result and notify the party — e.g. AGGPSA's Partner selection now shows the Partner outcome creating and notifying the new partner), and a negative / decline outcome ends in a 'notify requester' event (the request is returned to the party that raised it — so 'decline' now goes to a real end event rather than to nobody). When a decision is the final step of a flow every one of its outcomes becomes its own end event (no more generic single 'end'); when it is mid-flow the primary outcome continues to the next step and the off-ramp outcomes end below the pool. Applies to Modelware, Nedbank and AGGPSA. Verified with no functional errors." },
  { v:"v1.68.0", date:"2026-08-17 01:20 SAST",
    note:"Reworked the BPMN swimlane model across EVERY process (not one diagram) so the lanes reflect who really performs each step. Previously most steps — including AI-supported and data-support ones — collapsed into a single department lane. Now: (1) one lane per department / actor that performs the human (H) work, so a flow touched by more than one party shows a lane each instead of everything stacked in one; (2) a single AI / Automation lane for everything the system or AI performs — Automated, AI-Supported, AI-Executed and Data-Support steps; and (3) an AI Steward lane that appears whenever the flow has a human-in-the-loop decision. Each HITL decision now drops into the AI Steward lane, is labelled with the accountable role that performs the review (resolved from the decision's owner — e.g. Capture Marketing Contact shows 'HITL review · Marketing Director', and the lane header names that role), and the flow then hands back up to the department / AI lane for the next step. So Capture Marketing Contact renders as Marketing (human capture) → AI / Automation (campaign match, propensity, eligibility) → AI Steward · Marketing Director (the two governed outreach decisions) rather than one crowded Marketing lane. Empty lanes are still dropped, and the change applies to Modelware, Nedbank and AGGPSA. Verified with no functional errors." },
  { v:"v1.67.0", date:"2026-08-17 00:20 SAST",
    note:"Every diagram is now zoomable, so nothing has to be read squashed in-page. Each SVG diagram across the pack — the BPMN process flows, the DMN decision-requirement diagrams, the capability and value maps, the journey timelines — carries an 'Expand' control (and is itself clickable) that opens it full-screen in a lightbox with the diagram title, scroll-to-zoom, +/− and Fit/100% buttons, and drag-to-pan; Esc or Close (or clicking the backdrop) returns to the page. In-diagram links (a decision box linking to its DMN, for example) still work — only non-link clicks open the viewer. The feature is global and dependency-free, added once in the shared script and picked up automatically by any diagram on any page, including late-rendered ones. No change to any diagram's content or data." },
  { v:"v1.66.0", date:"2026-08-16 23:30 SAST",
    note:"The whole SIPOC now aligns with the process steps, not just its process column. For every Modelware process the five SIPOC bands are derived from the process's own step-level model instead of inheriting placeholder values from the baseline: Inputs are the process's Required Information (the concepts its steps consume); Outputs are the concept end-states the steps produce plus the process's evidence output (for Create and Maintain Student Group: Student Group (Scheduled), Certificate (Issued), Course (Designed), and the unique scheduled training record); and Suppliers and Customers are split from the process actor map by information flow — an actor that receives the process's output (detected where a step makes something available / delivered / issued / reported to it, or an external customer/student/learner party) is a Customer, and the remaining feeding actors are Suppliers. So Create and Maintain Student Group now shows Suppliers Management and Trainers, Customers Sales and Marketing (the functions step 5 makes the student group available to), instead of the previous Consent / Market-triggers / Propensity-list placeholders. Nedbank and AGGPSA keep their curated SIPOC stakeholder chips unchanged. Verified across all three sources with no functional errors." },
  { v:"v1.65.0", date:"2026-08-16 22:40 SAST",
    note:"Three fixes to the Business Process page from direct feedback. (1) The SIPOC's PROCESS steps now match the 'Main Flow · Process Steps' section. The SIPOC was showing a generic, baked step list (Assemble consented data, Detect triggers, Score propensity, Build target segments) that did not correspond to the process's actual main flow; the SIPOC now derives its process steps from the same Main Flow source (sheet 204), so for Create and Maintain Student Group it reads Admin identifies a planned training session → A student group is created → Course and certification details recorded → Start date and training type recorded → student group becomes available → student records linked, identical to the Main Flow section. (2) Decisions are now integrated into the BPMN the way the reference diagram shows them, rather than as a stray diamond hanging off the flow. Each governed decision now appears inline, in the lane of the step that makes it, as a business-rule task (amber box with a decision-table grid icon, the decision id and name, and a HITL tag where human-in-the-loop) immediately followed by an XOR (×) gateway whose branch labels come from the decision's outcomes — so Student Group Scheduling branches Create / assign Student Group and Delivery Mode branches Live / online / self-study, exactly like the reference's Determine delivery mode → Online / Onsite. The decision task and gateway are clickable through to the decision's DMN, with the input-data annotation carried above the task. The separate 'Human review' lane was removed since decisions now sit in their performer's lane. (3) Alternate / exception flows now appear in the BPMN. The Alternate Flow · Exceptions listed in the process structure (e.g. Training date changes, Course postponed, Training cancelled, Student group classification changes) are drawn as BPMN boundary error events in a dedicated 'Exception & alternate flows' band beneath the pool, so the diagram shows the exception paths the process must handle, not just the happy path. Verified across Modelware, Nedbank and AGGPSA with no functional errors. Note: for Modelware the SIPOC suppliers, inputs, outputs and customers still carry placeholder values inherited from the baseline and can be modelled per-process in a follow-up." },
  { v:"v1.64.0", date:"2026-08-16 21:30 SAST",
    note:"Three fixes to the Business Process page, all from direct feedback on the BPMN. (1) Each step now shows the information (data) concept it works on. Under every activity in the BPMN, a BPMN data object is attached by a dashed association showing the governed concept the step reads or writes and the CRUD action with its lifecycle transition — e.g. 'Management/Admin reviews the planned training offering' carries Student Group · Create → Planned, and 'Training delivery method is recorded' carries Course · Read/Validate → Designed. The concept name resolves from the model's governed information concepts, so the diagram reads as data-in-motion rather than bare tasks. (2) Empty swimlanes are removed. The BPMN now draws only lanes that actually contain a performed step: a department lane appears only if a step is performed there, the AI / Automation lane only if the process has a truly automated or AI-executed step, and the Human-review lane only if the process has a human-in-the-loop decision. So Annual Training Calendar Setup — all human/data-support work owned by Management — renders as a single Management lane instead of empty AI and Human-review bands. Participating actors that touch the process but perform no step are shown as 'Supports' touchpoint pills beneath the diagram rather than as empty lanes, and AI-Supported steps now stay in their owning department lane (only fully Automated / AI-Executed steps move to the AI lane). (3) The traceability spine no longer leaves chevrons hanging in mid-air. Trailing segments with no content (a process with no governed decision, AI use-case or control) are now dropped from the end of the spine, so the chevron connectors stop at the last populated link — the spine for a process ending at Data · concepts ends there cleanly. Pure presentation layer over the v1.63.0 corrected step data; verified across Modelware, Nedbank and AGGPSA with 0 console errors." },
  { v:"v1.63.0", date:"2026-08-16 20:10 SAST",
    note:"Fixed the ROOT cause behind the wrong BPMN — the process-step DATA itself, not the diagram. Two pipeline bugs were corrected for Modelware. (1) Execution type — a heuristic classified any step containing 'review / monitor / assess' as a 'service task' and then typed every service task as A (Automated), so a human step like 'Management/Admin reviews the planned training offering' was labelled Automated and drawn in the AI/Automation lane. Execution type is now derived correctly: operational steps are Human (H) by default, reporting / reconciliation / Power-BI-refresh steps are Data Support (DS), governed-decision steps are AI-Supported / AI-Executed (AIS/AIE), and a step is only Automated when the text actually signals automation. Modelware's step mix went from A:6 / DS:204 / AIS:45 / H:32 to a realistic H:127 / DS:114 / AIS:46. (2) Information concept — the pipeline was overwriting the model's 37 governed concepts (Person, Company, Campaign, Student Group, Enrollment, Attendance, Assessment, Certificate, Coupon, …) with a thin 14-concept list, and matched keywords by substring, so 'ai' matched inside 'tr-ai-ning' and steps like 'Student groups are planned' were tagged 'AI Agent Output'. The pipeline now uses the 37 real governed concepts and matches keywords on whole words only, so steps map to the correct concept — 'Student groups are planned' → Student Group, 'Monitor attendance' → Attendance, 'Generate certificate' → Certificate, 'Refresh Power BI' → KPI (Data Support). The BPMN, step architecture and the process's decision/knowledge views all now render correct, aligned data. Nedbank and AGGPSA improved by the same whole-word fix with no regressions. 0 console errors across all pages in all three sources." },
  { v:"v1.62.0", date:"2026-08-16 18:30 SAST",
    note:"Surfaced each business process's decisions with their DMN link, inputs and knowledge sources. A new 'Decisions this process makes — DMN, inputs & knowledge' section on the Business Process page lists every governed decision the process reaches and, for each, shows: a link to the full DMN decision-requirements diagram and decision table; its input data (the information it consumes plus the governed critical data elements, with criticality tier); its knowledge sources (glossary, semantic model, policy and the knowledge assets it applies); its rule set; the decision owner; the automation posture and advising AI agent (linked); the outcome; and the human-in-the-loop flag — with the DMN decision-requirements diagram rendered inline for each decision. The BPMN decision gateway is now a clickable link to the decision's DMN and carries an input-data annotation above it, so the decision, its inputs and its knowledge are visible at the exact point in the flow where the process makes it. 0 console errors across all pages in all three sources." },
  { v:"v1.61.1", date:"2026-08-16 17:20 SAST",
    note:"Fixed the BPMN swimlane to show ALL the touchpoints of a business process, not just the actor(s) named in step text. It now builds its lanes from the process's full actor map: every internal actor gets a lane (Responsible first, then Supporting), so a process like Annual Training Calendar Setup shows Management, Admin, Sales, Marketing, Finance and Trainer lanes instead of only one. A participating actor with no performed step is marked 'Supports · consulted' so it reads as a touchpoint rather than a gap. Automated / AI-supported / AI-executed steps sit in the AI / Automation lane and human-in-the-loop decisions in the Human review lane (unchanged). External and system touchpoints the process interacts with — Customer, Contact, LinkedIn, Moodle, Power BI, the external certification body — are now listed as an 'External / system touchpoints' band under the diagram. Nedbank and AGGPSA (no actor map) keep their previous lane behaviour with no change. 0 console errors across all pages in all three sources." },
  { v:"v1.61.0", date:"2026-08-16 16:30 SAST",
    note:"Added the AI Use-Case Gate — the governed gate from the Business-Centered framework that every AI opportunity passes before build. A new page assesses each of the 10 Modelware AI use cases and shows: a build verdict and portfolio bucket (Sprint Now / Prepare-Roadmap / Incubate / Hold-Retire) with a value-vs-readiness portfolio matrix; the four prerequisite gates (Business Architecture, Process Architecture, Data & Information, Responsible AI) each scored PASS / PARTIAL / FAIL from real model evidence; the ten-link traceability chain (Strategy→Outcome→KPI→Value Stream→Capability→Process→Decision→Data→AI use-case→Controls→Measurement) with every link's evidence linked back to its page; and the eight prioritisation dimensions (strategic alignment, business value, capability criticality, process fit, data readiness, technology readiness, responsible-AI readiness, change readiness) scored 1–5 from the use-case value and six readiness dimensions. The Responsible-AI gate counts controls, step-level controls, risks, human-in-the-loop oversight and measurement, so it reflects the model's real governance rather than one control source. Reachable from the nav after AI Use-Cases. Nedbank and AGGPSA show a 'switch to Modelware' notice (no use-case value/readiness assessment). Pure presentation layer over existing model data; 0 console errors across all pages in all three sources." },
  { v:"v1.60.0", date:"2026-08-16 15:10 SAST",
    note:"Applied the Business-Centered Enterprise Framework for AI Use-Case Identification to structure the Business Process spine and definition. (1) Traceability spine — each business process is now shown explicitly in the framework's spine (Strategy → Outcome → KPI → Value Stream → Capability → Process → Decision → Data → AI use-case → Control → Benefit): the Business Process page renders a spine strip that resolves the process UPSTREAM to the Business Outcome(s) it serves (via a new Business-Outcome → Value-Stream map, then Value-Stream → Capability → Process) and its KPI/benefit, and DOWNSTREAM to the Business Decisions it makes, then on to the governed data concepts, AI use-cases and policy controls. So every process now traces to a named outcome and an accountable decision, as the framework requires. (2) Process definition — a 'Process definition — architecture gate' summary defines each process against the paper's Process Architecture gate: trigger, flow (steps + execution types), pre/post-condition, the decision(s) it changes (modelled as DMN), where AI acts (Automated / AI-supported / AI-executed / human-only), the human-oversight pattern (human-in-the-loop / on-the-loop / over-the-loop), records & evidence, controls, and how performance improves (cycle time / error rate / quality / learner-or-customer outcome). Added the Business-Outcome → Value-Stream spine link to the model so the upstream chain resolves (66 of 68 processes trace to an outcome; the two enabling processes whose capability sits outside a value stream show the decision side only). Nedbank and AGGPSA are unchanged (the spine strip and gate render only where the outcome/decision links exist). 0 console errors across all pages in all three sources." },
  { v:"v1.59.0", date:"2026-08-16 13:40 SAST",
    note:"Fixed three things on the Business Process and Decisions views. (1) BPMN swimlane lane placement — Automated (A) steps were being drawn in the Business Operations lane; A, AI-Supported (AIS) and AI-Executed (AIE) steps now correctly sit in the AI / Automation lane, while Human (H) and Data-Support (DS) steps stay in the business (department) lanes and human-in-the-loop decision gateways drop into the Human review & approval lane. (2) The single 'Business operations' lane is now split into a lane per department / actor — the actor is read from each step (e.g. 'Marketing identifies…', 'Admin generates invoice…', 'Sales confirms…', 'Support trainer'), so a cross-functional process shows a lane for Marketing, Sales, Admin, Management, Trainer, Finance, etc., with the flow crossing lanes at each hand-off; decision gateways continue to render on the steps that carry a decision. (3) The Decisions page 'Where this decision is used' panel now includes a Business Processes section (it previously showed only Customer Journeys and AI Use-Cases) — every decision now lists the business process(es) whose steps make it, linking back to the process. Model unchanged; these are presentation fixes. 0 console errors across all pages in all three sources." },
  { v:"v1.58.1", date:"2026-08-16 12:20 SAST",
    note:"Fixed the Navigator dead-ending on several Modelware value streams (e.g. VS02 · Generate Qualified Demand showed 'no customer journeys', so the walk couldn't reach capabilities/processes). Root cause: each Modelware journey was pinned to a single primary value stream, leaving 6 of the 13 streams — the whole demand-generation, onboarding, strategy, curriculum, finance and governance front — with no journey. A customer journey actually traverses several value streams (a learner journey runs Generate Demand → Convert → Onboard → Deliver → Community), so a CustomerJourney→ValueStage map was added that distributes each journey's stages across the value streams it traverses, and the Navigator now reaches a journey from every stream it runs through (not only its primary). All 13 Modelware value streams now resolve to at least one journey and onward to capabilities and processes — e.g. Generate Qualified Demand now surfaces the Individual-learner, Corporate, Executive and Partner journeys. Nedbank is unchanged; AGGPSA is unchanged (its journeys map to a single stream each, so the traversal fallback adds nothing there). 0 console errors across all pages in all three sources." },
  { v:"v1.58.0", date:"2026-08-16 11:15 SAST",
    note:"Promoted the Modelware business rules to first-class Decisions AND to governed Policy Controls, as requested. (1) Every rule in the Business-Rule Register (BR-01…BR-25) is now its own first-class Decision (D021…D045) — each with a full DMN Decision Requirement diagram and decision table generated by the pipeline, homed on its owning process and wired to that process's steps. The Decision Model grew from 20 to 45 governed decisions, e.g. Certificate Level Determination (BR-18), Exam/PDF Release Eligibility (BR-14), Moodle Extension Approval (BR-19), Absence Handling (BR-21), Lost Reason Capture (BR-22). (2) A new operational Business Policy set was created — Marketing & Outreach, Sales & Commercial, Pricing/Quoting/Discount, Payment/PO/Credit, Entitlement & Certification, Delivery/Attendance/Access, and Records/Identity/Data — with one Policy Control per rule (25 controls). Each control carries an Objective, a Guideline (how to comply) and a Tip (practical advice), and links to the rule, the first-class decision it governs, the process(es) it applies to, its owner and its evidence. A new 'Business Policies & Controls' page presents the policies → controls with guidelines and tips; the Business Process page's rules card now shows each process's governing controls (with guideline and tip) and links each rule to its promoted decision. All 45 decisions render with DMN diagrams and resolve to use-case names (no raw numbers), and every decision remains reachable from a customer journey. Nedbank and AGGPSA are unchanged (the promoted decisions and operational policy set are Modelware-only). 0 console errors across all pages in all three sources." },
  { v:"v1.57.0", date:"2026-08-16 09:30 SAST",
    note:"Merged the 48 business-operations processes from the 'Modelware Use Cases v2' specification into the Modelware business-process model as ONE flat, de-duplicated catalogue, and gave every process its full eight-element structure on the Business Process page. The document's 'use cases' are business processes spanning the whole operating value chain (Marketing → Sales → Administration → Training → Completion → Follow-up), not only Administration; they were parsed straight from the Word document (primary actor, supporting actors, trigger, required information, main flow, alternate/exception flow, business rules, output and future system requirement) and merged with the existing Modelware processes that lie outside that spine (curriculum development, advisory delivery, partner channel, community, platform/data operations, governance and people) — 68 processes total, no duplicates. The Business Process page now shows: (1) a Core Process band — the end-to-end operating flow across the seven phases; (2) Core Actors — the eight critical actors including the external certification body and Power BI; (3) the process list grouped by phase; and (4) for every process, its eight structural elements — Primary Actor (Responsible) and Supporting Actors, Required Information mapped to governed Information Concepts, Main Flow steps, Alternate Flow (exceptions), Business Rules linked to the Business-Rule Register (BR-01…BR-25), Output (evidence) and System Requirement. The journey → process → decision spine and the decision→use-case naming were rebuilt onto the new catalogue, so all 20 decisions remain reachable from a customer journey and no decision shows a raw use-case number. Nedbank and AGGPSA are unchanged (the catalogue and structure layer is Modelware-only). 0 console errors across all pages in all three sources." },
  { v:"v1.56.2", date:"2026-08-16 07:00 SAST",
    note:"Fixed the two decision-linkage problems the review flagged on the Modelware source. (1) 'Use Cases are showing as numbers' — the DMN Decision Requirements Diagram labelled its analytics sub-decision nodes with a raw use-case id (e.g. 'U14 analytics'). Root cause: the pipeline had no Modelware decision→use-case map, so every Modelware decision reused AGGPSA's keyword rules and fell through to the default 'U14' — a use-case that doesn't exist for Modelware (whose use-cases are U01–U10), so it couldn't resolve to a name. Added a Modelware decision→use-case mapping (all 20 decisions now map to the right Modelware AI use-case, e.g. Outreach Eligibility → Lead prioritisation assistant + Community engagement recommender), so the DMN and the 'Supporting AI use-cases' panel now show use-case NAMES, not numbers. (2) 'Several decisions are not used anywhere / implies a Business Process has not been defined' — the 'Where this decision is used' panel showed no customer journeys and no AI use-cases for Modelware decisions. The processes and their decisions WERE defined, but Modelware's journey stages had no link to the processes that run them, so nothing joined a decision back to a journey. Added a JourneyStage→Process map for all 43 Modelware journey stages, and the journey hydrator now derives each stage's decisions from the processes it operationalises when a tenant has no baseline overlay. All 20 decisions are now reachable from a customer journey, journey stages show their processes, and both sides of the 'Where this decision is used' panel populate. Nedbank and AGGPSA are unchanged (both already carried these links from their baseline). 0 console errors across every page in all three sources." },
  { v:"v1.56.1", date:"2026-08-15 21:45 SAST",
    note:"Made the Modelware model more realistic on two fronts the review flagged. (1) Customer-journey & CX experience scores were a flat 3/5 on every stage — they now follow believable per-journey emotion curves that dip at friction points (registration, procurement, due-diligence, reconciliation) and peak at value moments (certification, expansion, alumni), ranging 2–5. (2) KPI attainment was clustered high (mostly 90–103%, nearly all green) because the synthetic attainment used a weak hash on short similar ids; Modelware now uses a positional-hash attainment spread across a realistic 68–102% band, so the North Star metric tree shows a genuine mix — the North Star sits at 86% (behind its ≥75 stretch target) with strategic drivers and KPIs split across red / amber / green rather than uniformly on-plan. Nedbank and AGGPSA attainment is unchanged (the new band is Modelware-only). 0 console errors across every Modelware page." },
  { v:"v1.56.0", date:"2026-08-15 21:10 SAST",
    note:"Ran the Modelware Systems tenant through the FULL build pipeline, so the deep layers that were previously empty are now generated — resolving the review findings. Modelware now has: a North Star (Measurable Data Capability Uplift, index 0–100, target ≥ 75) with its strategic + execution/enablement metric tree and leading indicators; 92 execution-level Process Steps with H/A/AIS/AIE/DS execution types and RACI; DMN decision requirements (20) and decision tables (60) for the 20 decisions; the governed Value + six-dimension Readiness assessment across the 10 AI use-cases; the DMBOK Data Management policies; the full policy meta-model (143 principles, 328 themed controls with evidence and RACI, 5 themes / 14 controls per policy); 48 Critical Data Elements with DQ profiles; and the Operating Model (8 teams across 6 departments, 22 named role allocations with FTE and staffing status from the company's core team — Veronica, Howard, Monica, Paul, Debbie, Lachlann, Layla). To make this work the pipeline was parameterised for a third org: Modelware information concepts, keyword→concept rules, concept lifecycles, control/evidence maps, North Star, application landscape, theme→outcome map and operating model. DMMA (data-management maturity) is intentionally absent for Modelware — that requires an actual assessment (as was conducted for AGGPSA); the DM Maturity page shows the correct 'no assessment for this source' notice. Nedbank and AGGPSA rebuilt unchanged; 0 console errors across every page in all three sources." },
  { v:"v1.55.2", date:"2026-08-15 19:55 SAST",
    note:"Fixed Modelware capabilities (and processes and journeys) showing their raw id instead of their name in the Graph and relationship views. The pack detects an element's type from its id prefix — capabilities must be C1..Cn, processes P1..Pn and journeys CJ01..CJn — but the Modelware model had been built with spec-native ids (CAP02, A1..L1, J01), which the type detector didn't recognise, so a capability rendered as 'CAP02 / CAP02' with no name. Remapped the Modelware ids to the pack's conventions (CAP01→C1 … CAP24→C24; A1..L1→P1..P33; J01→CJ01 … J08→CJ08) across every cross-reference, so all 24 capabilities, 33 processes and 8 journeys now type and name correctly everywhere. The Modelware Future State workbook was regenerated with the corrected ids. Nedbank and AGGPSA unaffected; 0 console errors across all Modelware pages." },
  { v:"v1.55.1", date:"2026-08-15 19:20 SAST",
    note:"Fixed customer journeys not appearing for the Modelware source. The journey hydrator only kept journeys that existed in the Nedbank baseline overlay, so a new tenant's journeys were dropped and the Navigator's Customer Journey step showed 'no customer journeys mapped'. Journeys with their own sheet-defined stages are now built directly, so Modelware's 8 journeys appear and map to their value streams (e.g. the Corporate journey to Convert Client Opportunity). Nedbank (14) and AGGPSA (8) journey sets are unchanged. Verified 0 console errors across the journey pages in all three organisations." },
  { v:"v1.55.0", date:"2026-08-15 18:50 SAST",
    note:"Added Modelware Systems as a third selectable source alongside Nedbank and AGGPSA — a complete whole-business (Option C) architecture built from the Modelware specification packs. Pick 'Modelware Systems — Whole-Business' in the Source dropdown to switch the entire pack to Modelware content: 10 stakeholders and personas, 10 value propositions, 10 business outcomes with KPIs, 13 value streams and their stages, 8 journeys, 24 capabilities across 5 domains, ~33 processes (preserving the existing 14 BPMN/DMN processes and filling the missing business areas — curriculum, advisory, community, partner, platform, strategy and people), 20 decisions, 37 information concepts, 10 data domains, 10 semantic models, and 15 domain-owned data products consumed (not defined) by 10 AI use cases and 9 agents — plus the physical layer (storage platforms, data assets, applications, evaluation registers) and a governance layer (policy domains, policies, controls, evidence, councils, RACI, risk, records). The data products are domain-first with AI use-cases as consumers, exactly like the other tenants, and the whole spine traces end-to-end through the Navigator, Graph and every register page. Also made the Decisions and Business Process pages default to the first available element rather than a hardcoded id, so they work under any source. Modelware has no baked glossary yet, so term-highlighting stays off for that source (Nedbank and AGGPSA unaffected). Verified 0 console errors across every page in all three organisations." },
  { v:"v1.54.0", date:"2026-08-15 17:35 SAST",
    note:"New Architecture Elements page surfacing the governed registers beneath the business architecture that were previously in the model but not viewable in the app. A single tabbed page (added to the nav after Critical Data) presents: Information Concepts (the conceptual data model — owning capability, steward, system-of-record data product, lifecycle); Data Assets (physical tables/files/streams with product, type & layer, Output-Port vs Internal role, refresh rate, storage platform, PII); Storage Platforms (lakes/warehouses/stores with zone, region, owner and assets-hosted count); Applications (the application landscape — category, type, hosting, lifecycle, criticality and the processes each supports); Evaluation (the AI-assurance layer — evaluation datasets, metrics and plans, with results-logged count); and, for AGGPSA, DMBOK / DMMA (the DAMA-DMBOK knowledge areas with current→target maturity and the DMMA deliverables/evidence artefacts). Tabs show only where the source has data (Nedbank shows five; the DMBOK/DMMA tab is AGGPSA-only). Added hydration for the Application landscape and the evaluation dataset/metric/plan registers. Every element participates in the global term-highlighting. Verified 0 console errors across both organisations." },
  { v:"v1.53.0", date:"2026-08-15 16:40 SAST",
    note:"Global glossary term-highlighting. Every governed business term now highlights wherever it appears anywhere in the app — element names, card titles, prose, table cells — as a dotted-underlined chip; clicking any term opens a definition popover (term, subject area, type and the full definition) with a one-click deep-link to the exact term in the Glossary Workbench. So the Governance councils (Board & Committees, Executive Committee, Grant Committee, …), Data Products terms, roles and every other governed noun are now clickable-to-define throughout. Implementation: the AGGPSA glossary was re-baked to carry each term's Definition and Type (not just name + subject area); a MutationObserver-driven highlighter scans rendered content — including dynamically-loaded tabs, panels and cards — wrapping matches longest-first with word-boundary matching, and skipping inputs, links, code, ids and the nav. Physical schema-field attributes (all-lowercase / underscore names like 'withdrawn_at') are excluded from prose to avoid noise but still deep-link where shown as schema fields. A per-page cap protects the densest reference page. A new toggle on the Glossary settings page — 'Highlight governed terms throughout the app' — turns it on/off. Nedbank (no baked glossary) is unaffected. Verified 0 console errors across both organisations." },
  { v:"v1.52.2", date:"2026-08-15 15:20 SAST",
    note:"Re-baked the AGGPSA Business Glossary from the updated deep-link export — the dictionary grew from 903 to 1,162 governed terms, now covering the data-product governed terms, schema fields (data elements), Value Propositions, Business Data Stewards and other elements that were previously inert. App-term coverage rose from 209/748 to 388/763 resolving; the Data Products are now effectively fully linked (only one schema field, 'reading_for_meaning' on DP06, remains absent from the export). Also fixed Semantic Model governed-term chips, which used ';' as a separator and so rendered as a single un-matchable compound chip — they are now split into individual terms, each of which deep-links. Remaining un-linked: the 374 Policy Control activity statements (e.g. 'Approve and publish the Data Governance policy'), which are control activities rather than business terms and are intentionally out of the glossary unless you want them added. Verified 0 console errors across both organisations." },
  { v:"v1.52.1", date:"2026-08-15 14:05 SAST",
    note:"Corrected the Navigator (and traceability chain) ordering to match the domain-owns-product hierarchy from v1.52.0: the walk now steps AI Agent → Data Domain → Data Product (Data Domain was previously listed after Data Product). Selecting an AI Agent now surfaces the Data Domains it draws on, and choosing a domain surfaces the Data Products that domain owns — so the numbered levels read Data Domain (12) then Data Product (13), consistent with the Graph tree and the Data Products page. Verified 0 console errors across both organisations." },
  { v:"v1.52.0", date:"2026-08-15 13:10 SAST",
    note:"Made the Data Product layer domain-first, consumer-aware and timeliness-provisioned, per the Domain-First Data Product Catalog research and the Standalone Data Product Playbook. (1) OWNERSHIP INVERTED — the Data Domain now OWNS the Data Product, not the other way round. The product no longer carries a DomainID foreign key that rendered the domain 'under' it; each domain's product list is rebuilt from the product's own domain as the single source of truth (MECE — one product, one domain), which also fixed the AGGPSA phantom aliases DP12b / DP08b / DP17b. The relationship map (37) is reversed to DataDomain→owns→DataProduct, and the Navigator/Graph tree now reads AI Agent → Data Domain → Data Product (domain is the parent; product is a leaf). (2) AI USE-CASES ARE CONSUMERS, NOT BOUNDARIES — the old ServesAIUseCases field on the product (which made the product 'define' its use-cases) is replaced by a proper many-to-many consumer map (189 · DataProduct_AIUseCase_Map) carrying, per consumer: consumption purpose, access mode, criticality, timeliness need, contract and approval status. In the explorer the edge is now UseCase→consumes→Product. (3) PIPELINES MEET TIMELINESS — every product now has a Data Refresh Rate, Pipeline Mode and SLA, provisioned to its strictest consumer's timeliness need (e.g. a product read by the real-time NBA engine is Real-time / Streaming), with a 'Meets consumer timeliness ✓' check. (4) CORRECT DATA ASSETS — each product's Data Assets are tagged Output Port (the governed, exposed interface consumers read) vs Internal (processing-only) and carry the pipeline refresh rate. The Data Products page shows product-type + refresh pills and 'Consumed by'; the contract panel adds Pipeline & timeliness, Data assets & output ports, and a full consumer table. Note: AGGPSA's 'Research & Knowledge' domain (DM9) now owns no products — its only entry had been the phantom DP17b; DP17's real owner is Impact & Analytics — flagged for you to re-assign if a product belongs there. Verified 0 console errors across both organisations." },
  { v:"v1.51.2", date:"2026-08-14 16:10 SAST",
    note:"Reworked the Glossary settings page to match the baked dictionary. It previously previewed terms via the old {base}?term={key} template and defaulted to a Nedbank sample ('Next Best Action'), which isn't an AGGPSA governed term — so it showed a wrong-format URL while the chip was (correctly) inert. Now the page shows how many governed terms are loaded for the source (AGGPSA: 903), defaults the tester to a real governed term, and resolves via the actual app resolver: a governed term shows a green tick and its exact workbench deep-link with a live chip; a non-governed term (like 'Next Best Action') shows a clear 'not a governed term — stays inert' message with no broken link. Clarified that the governed terms come from the glossary export baked into the source and the Base URL is simply which glossary the links point at (the Link template is only a fallback for sources with no baked term list)." },
  { v:"v1.51.1", date:"2026-08-14 15:20 SAST",
    note:"Wired the AGGPSA Business Glossary Workbench into the app. Baked the full 903-term glossary dictionary (from the deep-links export) into the AGGPSA source and pre-enabled glossary linking. Every governed term now resolves to its EXACT workbench deep link — glossary-workbench.html#glossary={Subject Area}&term={Term} — matching the export byte-for-byte. Term chips (Data Products, Analytics use-cases, Knowledge assets) deep-link to the term; and every element's detail panel now shows an 'Open … in the Glossary Workbench ↗' link whenever that element is a governed term, so any of the 903 terms is one click from the workbench anywhere in the app. Terms not in the glossary render inert (no broken links). Coverage note: the export predates the policy-control consolidation and DMMA work — 683/903 terms match live elements and link today; 220 glossary terms are stale (old pre-consolidation controls); ~600 current elements (374 controls, 132 processes/SOPs, DMMA/steward/etc.) are not yet in the glossary and were exported as a 'terms to add' list for re-sync. Nedbank unaffected." },
  { v:"v1.51.0", date:"2026-08-14 14:30 SAST",
    note:"Rebuilt the User Manual into a complete, screenshot-rich reference for every page in the app — for building the training material. The 'Every page' section now documents all 26 pages in navigation order (plus the standalone Policy Meta-Model), each with a live AGGPSA screenshot, a detailed description of what the page is for, an explicit 'Architecture message' (which layer of the model the page presents and the point it makes), and what you'll see and do on it. Added Policy Inspector and DM Maturity (previously undocumented), a per-page contents list for quick jumps, and screenshots embedded from assets/manual/ so the whole manual prints/exports to a single PDF. Nothing is skipped." },
  { v:"v1.50.5", date:"2026-08-14 13:05 SAST",
    note:"Fixed the Home page directory cards showing 'undefined' with no description. Nine pages added since the original directory — North Star, Operating Model, Policy Inspector, DM Maturity, Critical Data Elements, AI Agents & Models, Ethical Stewardship, Model Review and Relationships — had no entry in the Home page's icon and description maps, so they rendered an 'undefined' icon and a blank blurb. Added an icon, description and tag for each (in both the Nedbank and AGGPSA directories) and a fallback icon so any future page can never render 'undefined' again." },
  { v:"v1.50.4", date:"2026-08-14 12:20 SAST",
    note:"The DM Maturity page is now interactive: select a Business Data Steward or a Unit / Department to see how they scored. Picking a steward (or clicking their card) recomputes the whole view to that person's ratings — tiles, radar, DMBOK-layer cards, knowledge-area table and their comments — and overlays their maturity polygon (red) against the whole-organisation average (grey) so you can see where they scored above or below the baseline. Picking a unit aggregates its stewards the same way and narrows the steward list to that unit. Added model sheet 187 DMMA_StewardScore (per-steward × per-knowledge-area maturity, 238 rows). Reset returns to the whole organisation. E.g. Keren Swanson (Head of Dept) averages 0.3 vs the org 0.1, scoring higher on Change Management, Security and Metadata." },
  { v:"v1.50.3", date:"2026-08-14 11:10 SAST",
    note:"Two corrections. (1) Readiness now cannot sit above the maturity foundation: the DMMA maturity is a hard ceiling on each Use-Case Readiness dimension (Unaware→1), with local use-case evidence allowed only a marginal lift above it and never past the evidence. So AGGPSA readiness now reads Red (1–2) across the board — e.g. Governance drops from 3 to 2 — consistent with the Unaware baseline, instead of the earlier 3/5. (2) All 17 knowledge areas are marked In scope: the workbook's per-deliverable 'Out of Scope' marker was not a domain-review flag — every area was assessed with the 14 stewards — so the radar no longer greys or dashes any axis and the table shows all areas In scope. Removed the misleading 'areas in scope 2/17' tiles." },
  { v:"v1.50.2", date:"2026-08-14 10:05 SAST",
    note:"Two updates. (1) Business Data Stewards now show their actual business positions in the Operating Model — Programme Manager, Financial Accountant, Grant Making Officer, Head of Department, Research Specialist, M&E Specialist, etc. (from the DMMA interviewee roles) — each tagged 'BD Steward' and still holding the shared Business Data Steward role. (2) The measured DMMA maturity now feeds the AI Use-Case Readiness assessment for AGGPSA: each readiness dimension (People, Process, Technology, Data, Governance, Measurement) is blended 50/50 with the organisation's DMMA maturity for that capability, so use-case readiness is held to the real data-management foundations. AGGPSA readiness drops from ~3.9 to ~2.5 (all dimensions now cite the DMMA and cap at Amber given Unaware foundations); Nedbank is unchanged (no DMMA). The North Star Delivery Readiness Index follows." },
  { v:"v1.50.1", date:"2026-08-14 09:10 SAST",
    note:"Added the traditional maturity radar (spider) to the DM Maturity page — the 17 knowledge areas on their axes, the current-maturity polygon against the Defined (3) target polygon, so the gap is visible at a glance. Added scope flags throughout: each knowledge area is marked In scope / Partial / Out of scope from the assessment's deliverable-level scope, out-of-scope axes are dashed and greyed on the radar, out-of-scope areas are flagged in the table (with in-scope deliverable counts), and Data Value Realization is flagged 'not assessed'. New tiles show areas-in-scope (2 of 17) and deliverables-in-scope (10 of 139). New model columns on 183 (InScopeDeliverables, OutOfScopeDeliverables, ScopeStatus, ReviewedDeliverables) and 184 (Scope)." },
  { v:"v1.50.0", date:"2026-08-14 07:20 SAST",
    note:"Added the AGGPSA Data Management Maturity Assessment (DMMA / DMBOK) as governance-readiness evidence, wired into the model. A new 'DM Maturity' page shows overall current-vs-target maturity (current ≈ Unaware 0.1 against a Defined 3 target — a ~2.9-level gap), maturity by DMBOK layer and by knowledge area mapped to its governing policy domain, the Define→Implement→Operationalise mandate, the 14 Business Data Stewards as a network by business unit, and the 48 steward comments (challenges & perceptions) filterable by domain and steward. The 14 interviewed stewards are mapped onto the Operating Model — they appear per business unit as named holders of the shared Business Data Steward role (status 'Steward', no incremental FTE), each showing their DMMA maturity and comment count. New model sheets 183 DMMA_KnowledgeArea, 184 DMMA_Deliverable, 185 BusinessDataSteward, 186 DMMA_Comment (AGGPSA), with graph relationships area→domain, deliverable→area, steward→role/team and comment→steward/area. Verified: 17 areas, 139 deliverables, 14 stewards, 48 comments, 0 console errors both orgs." },
  { v:"v1.49.2", date:"2026-08-13 09:20 SAST",
    note:"Consolidated the control 'Responsible' roles. The ~22–30 per-domain specialists are replaced by ONE shared Business Data Steward (business Responsible, across every control) plus a small set of Technical Specialists by discipline — Data Management, Security & Privacy, AI & Model, Marketing & CX, and Governance/Risk & Compliance — with each policy domain routed to the appropriate discipline. Every control's Responsible is now 'Business Data Steward + the domain's Technical Specialist'; both are governed shared-capacity roles in the Operating Model and both accrue the control's responsibility load. This flows through the Policy Control RACI, the Operating Model and the graph relationships. Verified: NB 6 Responsible roles (Business Data Steward + 5 disciplines), AGGPSA 5, Business Data Steward Responsible on all controls (NB 510, AGGPSA 374), 0 dangling role FKs, 0 console errors both orgs." },
  { v:"v1.49.1", date:"2026-08-13 08:40 SAST",
    note:"Brought the Operating Model up to date with the Policy & Control roles and responsibilities. Every policy control's RACI now resolves to a real, linkable Operating-Model role: the Accountable owner maps to the existing governed role, and the Responsible specialist (Data Governance Specialist, Model Risk & Validation Lead, Records & Retention Officer, …) is now a governed role in its own right (sheet 20 + Role Allocation), placed under its accountable owner's team as SHARED capacity — shown on the page but adding no phantom FTE and not counted as a vacancy. Each role's 'Responsibility load' column now shows both AI use-cases and the policy controls it is Accountable/Responsible for. Added AccountableRoleID/ResponsibleRoleID foreign keys to the control sheet (176) so the graph explorer links controls↔roles. Verified: all control RACI RoleIDs resolve (AGGPSA 22 specialists, NB 30), 0 dangling references, 0 console errors both orgs." },
  { v:"v1.49.0", date:"2026-08-13 08:02 SAST",
    note:"Authored real, domain-specific policy content for all 15 Nedbank marketing & AI/model-governance domains and consolidated each to a single authoritative policy (AI Governance, Model Risk, Marketing Conduct, Consent, Contactability, Next-Best-Action, Offer Governance, Vulnerable Customer, Content Governance, Channel, Experience, Attribution, CX, Partner Data). Each policy now carries its own Management Intent, Principles and Controls under its own Themes — e.g. AI Governance has Value & Readiness Gating and Explainability & Human Oversight; Marketing Conduct has Fair & Non-Discriminatory Treatment and Responsible Targeting; Vulnerable Customer has Identification & Flagging and Protective Treatment — rather than reusing Data Governance boilerplate. Consolidating PD-AI/PD-MODEL also refreshed the AGGPSA AI & Model policies. Verified: exactly one policy per Nedbank domain, 100% referential integrity across Theme→Control→Evidence in both orgs (NB 30 policies/180 themes/510 controls/510 evidence; AGGPSA 22/132/374/374), 0 console errors." },
  { v:"v1.48.3", date:"2026-08-13 03:55 SAST",
    note:"Fixed the Policy Inspector domain filter so the detail panel follows the filter. Previously, choosing a domain (or typing a search) narrowed the policy list on the left but left the detail showing the previously-selected policy — so filtering to Data Quality could still show the AI policy on the right. Now, when the current policy is filtered out, the Inspector automatically selects the first matching policy. Verified: filter → Data Quality shows POL-DQ-001; search 'safeguard' shows POL-SAFE-001." },
  { v:"v1.48.2", date:"2026-08-13 03:30 SAST",
    note:"The Governance page's hierarchy tab now shows the full Area → Policy → Theme → Control → Evidence chain (the Theme/Article level was previously missing between Policy and Control). Controls are scoped to their policy and grouped under their themes (with an 'Other controls' fallback), the tab is relabelled and the legend now includes Theme. Verified in AGGPSA: 9 areas → 28 policies → 168 themes → 476 controls → 476 evidence, 0 console errors." },
  { v:"v1.48.1", date:"2026-08-13 03:05 SAST",
    note:"Hardened the Policy Inspector's control filtering so it can never show another policy's controls. Controls are now scoped to the selected policy (by control id) first and then grouped under its themes, with an 'Other controls' fallback for any whose theme link doesn't resolve — so even a stale or mismatched cached model shows only the selected policy's controls instead of 'everything'. Verified: with every theme link deliberately broken, Data Architecture still shows exactly its 17 controls and zero from other policies. (If you saw Grant-Making 'POL-GM-002' controls under Data Architecture, that was a cached pre-v1.48.0 model — a hard refresh, Ctrl/Cmd+Shift+R, loads the current one.)" },
  { v:"v1.48.0", date:"2026-08-13 02:40 SAST",
    note:"Extended the one-policy-per-domain treatment and real domain-specific content to the AGGPSA business-governance domains. Grant-Making Governance, Financial Stewardship, Impact & Evaluation, Partnership & Advocacy, Risk & Compliance, Safeguarding and Ethical Stewardship are each now a single authoritative policy (their previous multiple policies folded in, all references re-pointed), with the domain's real obligations as its Management Intent and its own authored principles and controls — e.g. Grant-Making now establishes catalytic grant-making via real controls (screen against Theory-of-Change fit, due diligence on governance/finance/safeguarding, approve through the mandated committee, set milestones & conditions, disburse against verified milestones, monitor the portfolio, act on underperforming grants) with grant-making principles and a Grants Compliance Officer as responsible; Risk & Compliance, Safeguarding, Finance, Impact, Partnership and Ethical Stewardship likewise carry their own controls and principles. Ethical Stewardship, shared by both organisations, is authored and consolidated in each. Verified: one policy per domain, distinct controls/principles per domain, 100% referential integrity, 0 console errors. (Remaining Nedbank business domains — AI Governance, Model Governance and the Marketing domains — are the next pass.)" },
  { v:"v1.47.0", date:"2026-08-13 02:05 SAST",
    note:"Each DMBOK data-management policy now carries its OWN domain-specific principles and controls — not a generic template with the domain name swapped in. Authored real content for all 14 knowledge areas: Data Governance, Data Quality, Data Security, Data Privacy & Consent, Records & Retention, Metadata, Reference & Master Data, Data Architecture, Data Modelling & Design, Data Storage & Operations, Data Integration & Interoperability, Document & Content, Data Warehousing & BI, and Information. For example, Data Quality now establishes fit-for-purpose data through real controls (define quality dimensions & thresholds per critical data element, assign a DQ owner, profile and publish scorecards, alert on threshold breach, log & root-cause & remediate at source, and gate customer/AI decisions on quality) with Data Quality principles (Fit for Purpose, Measured not Assumed, Owned at Source, Remediate don't Mask, Quality Gates Decisions) and a Data Quality Analyst as the responsible role — while Data Security has classification/least-privilege/encryption/access-review controls and its own principles. Management intent is already the domain's real codified obligations. The cross-cutting Governance, Monitoring/Evidence and Review/Risk backbone remains (every policy is approved, monitored and reviewed). Verified: distinct controls & principles per domain, 100% referential integrity, 0 console errors both orgs. (The AGGPSA/Nedbank business-governance domains — Grant-Making, Finance, Marketing, etc. — still use the themed template and can be authored next.)" },
  { v:"v1.46.1", date:"2026-08-13 01:20 SAST",
    note:"Made the Thematic Category (Theme) a first-class level in the hierarchy so it sits between Policy and Control everywhere, including foreign-key-driven tree builders. PolicyTheme is now keyed by ThemeID (a proper id the relationship engine indexes as a node), and the policy hierarchy is a strict single-parent tree: a Control's only parent is its Theme (the PolicyID shortcut was removed from PolicyControl), an Evidence artefact's only parent is its Control (PolicyID removed from PolicyEvidenceArtefact), and a Theme's parent is its Policy — so any workbook FK walker now nests Policy → Theme → Control → Evidence → RACI rather than hanging controls straight off the policy. Policy is still derivable internally from the id, so grouping, the Policy Inspector, governance pages and the control crosswalk are unaffected. Verified: control's sole structural parent is its theme, evidence's is its control, 100% referential integrity and 0 console errors across both organisations." },
  { v:"v1.46.0", date:"2026-08-13 00:45 SAST",
    note:"Restructured the Data Management policies to one authoritative policy per DMBOK domain. Each DMBOK knowledge area — Data Governance, Data Architecture, Data Modelling & Design, Data Storage & Operations, Data Security, Data Integration, Document & Content, Reference & Master Data, Data Warehousing & BI, Metadata, Data Quality, Records & Retention, Data Privacy & Consent (and Information) — is now exactly ONE policy (Nedbank 14, AGGPSA 13), replacing the previous 40+ overlapping policies. The many obligation statements a domain used to hold are now the policy's Management Intent (what the policy codifies), so themes and controls are no longer duplicated across sibling policies. All prior policies were folded into their domain's canonical policy via a crosswalk, and every policy reference (controls, DQ scorecards, CDEs, agent policy maps, rules, obligations, stewardship, regulatory map) re-pointed with zero dangling references. Controls now carry a full RACI — Responsible, Accountable, Consulted and Informed. The Policy Inspector leads with the hierarchy you asked for — Policy → Theme → Control → Evidence → RACI — with each control showing the evidence it creates & delivers (and its approval state) and its R/A/C/I, and Management Intent shown as what the policy codifies. Nedbank now has 57 policies / 966 controls, AGGPSA 36 / 606. Verified: one policy per DMBOK domain, 100% referential integrity, 0 console errors across both organisations." },
  { v:"v1.45.3", date:"2026-08-13 00:05 SAST",
    note:"Re-pointed every legacy control reference to the new PolicyControl model, so the whole pack now speaks one control model. A deterministic crosswalk maps each legacy Standard_Control (CTL-…) to the best-matching new control in the same policy (published as 182 · Control_Crosswalk — 116 Nedbank / 65 AGGPSA rows), and every cross-object reference was rewritten to the new controls: process steps (125, 138), evidence→control assurance (141), the risk register's mitigation control (69), audit & assurance (71), regulatory-obligation map (109), stewardship traceability (122), extended end-to-end traceability (97), decision-rights RACI (68) and the use-case readiness Governance evidence chips (164). The governance and value-stream pages, and the relationship engine, now render and link the new controls; control→evidence uses the new evidence artefacts with their approval state. Verified: 0 legacy references left, 0 dangling ids, all re-pointed ids resolve in the relationship engine, and existing pages load clean across both organisations." },
  { v:"v1.45.2", date:"2026-08-12 23:35 SAST",
    note:"Completed and verified every relationship in the policy meta-model. Three gaps were found and closed: (1) the 40 DAMA data-management policies per org (Data Quality, Security, Privacy, Records, Metadata, Master/Reference Data, Architecture, Modelling, Integration, BI/DW, Document, Storage & Operations, Governance, Information) were falling back to generic themes — they now get domain-specific themes and a Data Management principle set; (2) the review/continuous-improvement theme now has its own operating procedure, so every control is implemented by a process (previously ~166 review controls were unlinked); (3) a principle-coverage safety net guarantees every control maps to at least one principle. Referential integrity is now 100% both ways: 0 controls without evidence, acceptance, a principle or an implementing process, and 0 dangling evidence→process, principle→control or process→control references, across both organisations. Nedbank now carries 1,408 controls; AGGPSA 980. Policy Inspector re-verified." },
  { v:"v1.45.1", date:"2026-08-12 23:05 SAST",
    note:"New Policy Inspector page (under Governance / Operating Model). It renders the full policy meta-model for every policy: a searchable, domain-filtered policy list on the left, and on the right the selected policy's principles, management intent (with RPN priority), themes (articles) with their themed controls, and the implementing processes and KPIs. Each control shows its core intent, objective, Responsible + Accountable roles, minimum evidence and Pass/Fail acceptance rule, and cross-links to the process that implements it, the evidence artefact it produces (with an Approved/Draft state) and the principles it embodies; processes link to their mapped capability. Everything is deep-linkable by id — open a policy with #POL-DATA-001 or jump straight to a control with #POL-DATA-001-C04. And a 'Connect Inspector app' panel lets you point the pack at your own external Policy Inspector HTML app (base URL + link template, saved in-browser like the Glossary Workbench); once set, every policy, theme, control and process shows an 'Open in Inspector ↗' deep-link. Verified across both organisations." },
  { v:"v1.45.0", date:"2026-08-12 22:40 SAST",
    note:"Populated the full Policy meta-model for every policy in both organisations (Nedbank 83, AGGPSA 58), lifting each policy from a single thin control to a themed, traceable control set. Nine governed sheets were added — 173 · PolicyPrinciple, 174 · PolicyManagementIntent, 175 · PolicyTheme (Articles), 176 · PolicyControl (the extended controls, right-sized to ~15–20 per policy across ~5–6 themes, each with core intent, objective, minimum & assurance evidence, frequency and a Responsible + Accountable role), 177 · PolicyControl_Acceptance (Pass/Fail rule per control), 178 · PolicyEvidenceArtefact (created & delivered by the process, with an approval state), 179 · PolicyKPI, 180 · PolicyProcess (the former SOPs, now modelled as processes and mapped to the nearest existing business capability), and 181 · Principle_Control_Map. Controls are generated to implement the policy's Management Intent and Principles, so every control traces up to a theme, a principle and an intent. Nedbank now carries 1,309 controls / 464 themes / 398 principles / 464 intents / 381 processes; AGGPSA 881 / 313 / 249 / 313 / 255. Deterministic content; existing pages verified with no new errors. (Policy Inspector wiring to follow.)" },
  { v:"v1.44.5", date:"2026-08-12 22:10 SAST",
    note:"Graph Explorer: fixed CDP-service nodes that rendered as a bare id (e.g. 'AS2') with no type, name or children in the AGGPSA model. The type resolver only recognised CDP services by a 'CDP' id prefix, but AGGPSA's CDP services are 'AS1…AS6'; it is now data-driven, so a CDP service resolves by identity regardless of its id prefix. 'AS2' now shows as the 'Grantee & Enterprise Registry' CDP service and expands to its five realising data products. Added ?v= cache-busting to the Graph page's model scripts. Verified in both organisations with no regression." },
  { v:"v1.44.4", date:"2026-08-12 21:55 SAST",
    note:"Hardened the North Star strategic→operational roll-up against stale caches. Some browsers were serving a cached older model file (same filename) alongside the newer page, which left every strategic driver reading '0 KPIs' because the cached model still used the un-suffixed parent id. The page now matches each driver's KPIs whether the model uses the suffixed ('BO01·M') or bare ('BO01') parent id — with no double-counting on the Execution & Enablement node — so a driver's KPIs always appear. Added cache-busting (?v=) to the model/data script tags so a new page always fetches fresh model data. Verified against both the current and a simulated stale model in both organisations." },
  { v:"v1.44.3", date:"2026-08-12 21:40 SAST",
    note:"Readability fix on the North Star hero — the definition line under the progress bar was inheriting a dark/muted colour from a global style and became hard to read on the coloured (RAG) banner. It is now solid white with a subtle shadow for contrast on all three RAG backgrounds." },
  { v:"v1.44.2", date:"2026-08-12 21:25 SAST",
    note:"Fixed the roll-up of the Strategic layer to the North Star. The operational KPIs now correctly nest under their strategic business-outcome driver (a parent-id suffix mismatch was leaving every strategic card reading '0 KPIs'); each of the 44 (Nedbank) / 18 (AGGPSA) KPIs now links to its driver. Each strategic driver card on the North Star page is now clickable — its title and a 'source ↗' link open the governed Business Outcome behind it — and shows the explicit roll-up arithmetic (e.g. '92% = average of 6 KPIs · (…) ÷ 6'), with the child KPIs expandable and each clickable to its own governed KPI element. Verified 0 console errors across both organisations." },
  { v:"v1.44.1", date:"2026-08-11 03:30 SAST",
    note:"Added a North Star tile to the Home page — a colour-coded (RAG) banner showing the One Metric That Matters, its target, attainment-to-plan, the count of strategic drivers, operational KPIs and AI evals (with pass rate), linking straight to the North Star & Metric Tree dashboard. Adapts per organisation. Verified 0 console errors." },
  { v:"v1.44.0", date:"2026-08-11 03:10 SAST",
    note:"North Star (OMTM), a metric tree that rolls up to it, and an AI model & agent eval framework — all on a new dashboard. A single North Star is defined per organisation (Nedbank: Customer Lifetime Value Growth; AGGPSA: Entrepreneurial Ecosystem Health Index) and every metric rolls up to it through four layers held in the model — 170 · NorthStarMetric and 171 · MetricTree: North Star ← Strategic (the business outcomes, plus an Execution & Enablement branch) ← Operational (the KPIs under each outcome) ← Leading (four enabler indices computed from real signals: Data Quality from the DQ scorecards, AI Assurance from the eval pass-rate, Delivery Readiness from the use-case assessment, and Process health). Attainment rolls up bottom-to-top with a RAG at every layer. A new 172 · AIEval framework runs a standard eval suite on every AI model (predictive accuracy, calibration, fairness, robustness, drift) and every AI agent (groundedness, instruction adherence, safety/guardrails, HITL escalation, hallucination) with a metric, threshold, method, result and Pass/Warn/Fail. A new North Star page (under Value Streams) shows the North Star hero, the strategic drivers with their KPIs, the leading indicators, and the full eval dashboard (filterable, fails first); each agent on the AI Agents page now shows its own and its models' evals. Verified 0 console errors across both organisations." },
  { v:"v1.43.0", date:"2026-08-11 02:20 SAST",
    note:"Technology readiness is now the whole technology stack, not just AI models. A new application architecture is added — 168 · Application (the business applications that run the processes, each with category, type, hosting, TIME lifecycle, owner and criticality) and 169 · Process_Application_Map (which applications support each process). Technology readiness is recomposed as three parts, each shown with its own clickable chips: (1) AI — models, model cards and monitoring; (2) Data-management technology — the storage platforms behind the supplying data products (via data assets) and the CDP/data services it consumes; (3) Applications — the applications that support the use-case's processes, with a penalty when any is on a legacy (Tolerate/Retire) lifecycle. So a use-case on a strong AI + data + application stack scores high, while one with no application mapped to its processes or on legacy systems scores lower (e.g. it now reads 'AI: 2 models, 2 model-carded; Data-management: 3 storage platforms, 3 CDP services; Applications: Campaign Management, NBA, Journey Orchestration, Analytics'). Verified 0 console errors across both organisations." },
  { v:"v1.42.0", date:"2026-08-11 01:40 SAST",
    note:"New Operating Model page (under Governance) showing the whole model at once. The operating model now has a Department level above functions, so the org reads Department → Function → Role → Person: a new page lists every department and its functions, the governed roles in each, and the people allocated to them with FTE and a Filled / Partially staffed / Vacant status, plus a summary (departments, functions, roles, people allocated, resourcing gaps, committed FTE) and a gaps banner. Each role shows its use-case load (how many use-cases it is accountable / responsible for) and is clickable to open its element panel; the page is searchable and printable. Nedbank: 3 departments, 5 functions, 8 roles; AGGPSA: 5 departments, 8 functions, 12 roles. This is the source that grounds People readiness — a vacant accountable role is a visible resourcing gap. Verified 0 console errors across both organisations." },
  { v:"v1.41.0", date:"2026-08-11 01:00 SAST",
    note:"Operating Model, and every readiness dimension now links to its governed elements. A new operating-model layer names who holds each governed role and how they are resourced: 165 · OperatingModel_Team (functional teams with a lead and headcount), 166 · Role_Allocation (each role's named holder, team, FTE and staffing status — Filled / Partially staffed / Vacant, with a couple deliberately unfilled to reflect real gaps), and 167 · UseCase_RoleAllocation (the Accountable/Responsible/Consulted/Informed roles per use-case, from the DecisionRights RACI where present, otherwise derived from the outcome owner and delivery roles, each joined to its staffing). People readiness is now derived from this — whether the accountable and responsible roles are actually staffed and the FTE allocated — so a vacant accountable role visibly drops the score (e.g. Nedbank U04's accountable Finance CLV Owner is Vacant → People 3/5). And, like Data, every readiness dimension now shows its evidence as clickable chips that open the element panel: roles (People), process steps (Process), models & model cards (Technology), data products & CDEs (Data), the agent, policy domains & controls (Governance), and the outcome, KPIs & models (Measurement). Verified 0 console errors across both organisations." },
  { v:"v1.40.0", date:"2026-08-11 00:10 SAST",
    note:"All six Use-Case readiness dimensions are now derived from concrete governed evidence — not just Data. Previously People, Process, Technology, Governance and Measurement were anchored to the use-case's overall readiness rating; each is now computed from real model signals, each with a transparent basis line: People from accountable owners (the AI agent, the supplying data-product owners, the outcome owner) plus RACI coverage on its process steps and its adoption phase; Process from how many governed process steps it runs in and how many carry RACI and policy/control; Technology from its lifecycle phase, model cards and whether drift/performance monitoring is configured; Data (unchanged) from the supplying data products' DQ scorecards and CDE status; Governance from the agent's policy domains, HITL posture, step-level controls and evidence, and data products under DQ control; Measurement from the outcome's KPIs, step-level metrics, model eval thresholds and the fairness/drift monitoring register. The result is a genuine 1–5 spread across the portfolio rather than a flat anchor. Verified 0 console errors across both organisations." },
  { v:"v1.39.0", date:"2026-08-10 23:30 SAST",
    note:"Governed two-part Use-Case Assessment. Every AI use-case now carries an explicit assessment in two parts, surfaced on the AI Use-Cases page and held as two new governed sheets. (1) Value / Commercial (163 · UseCase_ValueAssessment) maps each use-case to its Enterprise Value theme with a value score and a commercial rating — which links the Enterprise Value Map into the model. (2) Readiness (164 · UseCase_ReadinessAssessment) scores each use-case across the six Readiness Dimensions (People, Process, Technology, Data, Governance, Measurement), each with a maturity level, RAG and basis — which links the previously-unlinked Readiness Dimensions into the model. The Data readiness dimension is DERIVED, not authored: it rolls up the DQ scorecard RAG of the data products that supply the use-case and their Critical Data Element status (e.g. Nedbank U01 shows 13 CDEs governed, 3 at risk, pulling Data readiness from 5 to 4). This resolves the Readiness-Dimension elements from the unlinked list. Verified 0 console errors across both organisations." },
  { v:"v1.38.1", date:"2026-08-10 22:45 SAST",
    note:"Print/PDF fix: the fixed navigation sidebar is now hidden when a page is printed or exported to PDF. It was surviving into the PDF because renderNav replaces the #nav element with a nav.sidebar element, so each page's #nav-only print rule missed it — leaving a sidebar whose links were baked as absolute authoring-host URLs (localhost), which refused to connect when the PDF was opened offline. A global print rule now hides nav.sidebar and reclaims the left offset, so PDFs contain only content. The Model Review and Element Relationships catalogue PDFs were regenerated (and are now roughly half the size)." },
  { v:"v1.38.0", date:"2026-08-10 22:10 SAST",
    note:"Review fixes across data products, the Model Editor and the manual. (1) AGGPSA data products now carry comprehensive descriptions and full multi-field schemas (8–10 governed fields each, with types and PII flags) instead of a one-line description and a single attribute; a schema-parser bug is also fixed — the parser now accepts both '|' and ';' field separators, so the schema no longer collapsed into one mis-parsed field. (2) A data-product's Purpose is now sourced authoritatively from its own governed Description, closing a leak where AGGPSA inherited Nedbank purpose text. (3) The Model Editor now edits the ACTIVE organisation's model instead of always Nedbank's — so under AGGPSA it shows AGGPSA sheets (e.g. the EnterpriseValueMap correctly reads Systemic ecosystem change / Foundational talent, not Nedbank's marketing value themes), and Save-for-repo / Export name the correct org files. (4) The User Manual now documents every tab — Critical Data Elements, AI Agents & Models, Ethical Stewardship, Model Review and Element Relationships were previously skipped — and adds plain-language entries and ID-legend rows for Process Steps, AI Agents & Models, Critical Data Elements and Data Contracts. Verified 0 console errors across both organisations." },
  { v:"v1.37.2", date:"2026-08-10 21:05 SAST",
    note:"Advisory chips on a decision are now clickable, like the supporting AI use-cases. In the 'Advised by AI agent' block, each AI Model, Knowledge Management and Business Policy chip resolves to its governed element by name and opens a detail panel: an AI model shows its type, advising agent, purpose, knowledge sources, confidence threshold, owner and risk tier; a knowledge asset shows its type, steward and using agents; a business-policy chip resolves to its policy domain and lists the policies it contains — each with a link through to the AI Agents & Models or Governance & Responsible AI page. Chips whose names cannot be resolved fall back to plain (non-clickable) labels. Applies to both organisations." },
  { v:"v1.37.1", date:"2026-08-10 20:40 SAST",
    note:"BPMN lifecycle fix: a human-in-the-loop (HITL) decision gateway is now drawn in the 'Human review & approval' lane instead of the AI/Automation lane. Previously every decision diamond was placed at the same lane as the step that preceded it, so a HITL decision following an AI-Supported step rendered inside the AI lane while being labelled HITL — a contradiction. The gateway now drops into the human lane, with the sequence flow handing down from the AI/ops step to the human decision and back up to the next step, correctly showing that the AI supports the work but a person makes or approves the decision. Non-HITL gateways are unchanged (they stay in their step's lane). Applies to both organisations." },
  { v:"v1.37.0", date:"2026-08-10 20:05 SAST",
    note:"Relationships reworked to true foreign keys, and every KPI now traces to an outcome. Two fixes in response to review of the Element Relationships catalogue. (1) The relationship engine no longer uses co-occurrence — a relationship now exists only where one element's row carries another element's governed ID in a column (a real foreign key), so map/join sheets link their key to each referenced ID and denormalised end-to-end / registry views are excluded from derivation. Related elements are now shown by NAME (ID secondary) with a display-name resolver that reads the correct name column per sheet (e.g. ValuePropositionName, StageName), grouped by architecture layer with direction (→ references, ← referenced by, ↔ both). This removes the spurious foreign keys and the unreadable raw-ID lists. (2) A governance gap is closed: every KPI is now wired to the Business Outcome named by its declared OutcomeTheme via a new map sheet, 162 · KPI_BusinessOutcome_Map, so no KPI is left without an outcome relationship (previously only 10 of 44 Nedbank and 14 of 18 AGGPSA KPIs were mapped; K03 'Funded new accounts' had none). Two Nedbank outcomes were added to home the Brand & trust and Marketing performance themes (BO06, BO07). The catalogue now also reports the count of genuinely unlinked reference elements (retention schedules, readiness dimensions, glossary/QA rows) transparently rather than manufacturing links. Verified 0 KPI orphans and 0 console errors across both organisations." },
  { v:"v1.36.0", date:"2026-08-10 17:27 SAST",
    note:"Detailed per-element view showing all relationships. A new shared explorer resolves every governed ID reference in the model into an entity index (1,427 elements for Nedbank, 1,193 for AGGPSA) and a relationship index — every ID that co-occurs in a row is a relationship, labelled by the sheet and field and by direction (references / referenced by / both). On the Model Review page every ID is now clickable and opens an element panel showing that element's full attributes plus every relationship it has across the whole model, grouped by architecture layer, each related element clickable to traverse (e.g. the Consent CDE shows the 5 decisions, the information concept, the 2 data products and the 3 governance elements it links to). A new 'Element Relationships' page renders a detailed card for every element — its attributes and all its relationships grouped by layer — with search and a Print button for a PDF of the complete relationship catalogue. Nothing in the model changed; this is a review lens over it. Verified 0 console errors across all pages under both organisations." },
  { v:"v1.35.0", date:"2026-08-10 07:10 SAST",
    note:"New Model Review page — every element of the architecture, for complete review. The workbook has grown to 161 sheets and is hard to review end-to-end, so this page renders the entire governed model — all sheets, all 4,279 elements (3,297 for AGGPSA) — directly from the source, grouped into 14 architecture layers (Strategy & Value, Capabilities, Journeys, Processes & Steps, Data Quality, Decisions, Semantics & Reference Data, AI Agents & Models, Information Concepts & Records, Data Products & Contracts, Governance/Policy/Controls, Ethical Stewardship, Delivery/Change/Adoption, Traceability & Mappings). It has a layered table of contents with per-sheet element counts, a live search across every element by ID or any text, expand/collapse per sheet and globally, and a Print button that produces a PDF of the whole model with page breaks by layer. Every sheet is shown as a full table of its rows with sticky column headers, so nothing is hidden behind a screen-by-screen view. Source-switchable like the rest of the pack, so it reviews whichever organisation is selected. No model changes. Verified 0 console errors across all pages under both organisations." },
  { v:"v1.34.0", date:"2026-08-10 06:55 SAST",
    note:"The reverse, decision's-eye view — 'is my data fit?'. A DQ Assessment now rolls up, for each decision, the measured quality of the data it depends on (its Critical Data Elements' supplying data-product scorecards) and judges it against that decision's expectations (each CDE's threshold and criticality), returning a fitness verdict — Fit for use, Fit with caveats, or Not fit for use. This is the assessment layer, deliberately distinct from the consumer-independent profiles and scorecards: the same data can be fit for one decision and not another. Each CDE is rated Fit / At risk / Unfit / Not assessed from the weakest quality dimension of its supplying data product, and the decision verdict rolls these up weighted by criticality — a High-criticality CDE below target blocks the decision, a High at-risk or a Medium/Low failure raises a caveat. The Decision Models page gains an 'Is my data fit?' panel with the verdict, per-CDE fitness (weakest dimension, measured vs target, supplying product), the blocking issues and a remediation recommendation, and the decision list shows a fitness dot per decision. Across the estate: Nedbank 3 decisions fit / 10 with caveats / 5 not fit; AGGPSA 6 / 9 / 3. New model sheets Decision_DQ_Assessment (160) and Decision_CDE_Fitness (161); the data-product scorecard spread was tuned to a realistic 96–99.9%. Both workbooks regenerated (161 sheets); verified 0 console errors across all pages under both organisations." },
  { v:"v1.33.0", date:"2026-08-10 06:47 SAST",
    note:"Data type is now a declared, governed attribute of each Critical Data Element — it is no longer inferred. The previous DQ-profile build guessed a CDE's data type by keyword-scanning its name (after an earlier version scanned the definition, which contaminated the result — e.g. Consent's definition mentions 'channel preference', and 'Customer needs' says 'Identified…'). That was the wrong approach: a data element's logical type is a property of the element, so it is now declared explicitly per CDE and stored on the CriticalDataElement sheet as a DataType column (Categorical — code, Boolean / flag, Numeric — score / currency / ratio / count, Identifier, Temporal — date/time, or Text — free text). The DQ profiler reads that declared type and no longer infers anything, so the profile and its distribution always match the governed type — Vulnerability indicator and Control group now profile as Boolean flags, Relationship-manager ownership as an Identifier, Delivery capacity as a count, Expected ROI as a ratio, and so on. The CDE register's DQ Profile column and expandable profile show the declared type. No change to the statistics themselves. Both workbooks regenerated (159 sheets); verified 0 console errors across all pages under both organisations." },
  { v:"v1.32.0", date:"2026-08-10 06:39 SAST",
    note:"The Critical Data Element DQ rules are now part of the Data Contract. Each CDE's data-quality rule is a quality guarantee, so it is bound to the data contract of the product that carries the CDE (CDE → owning concept → data product) as an enforceable clause: the CDE, its quality dimensions and threshold, a severity derived from the CDE's criticality (High = blocking, Medium, Low) and the enforcement action on breach (reject & quarantine / warn & quarantine / monitor & report), governed by the Data Quality policy (POL-DQ). Nedbank binds 27 CDE quality rules across 9 data-product contracts and AGGPSA 29 across 8; the DataContract sheet's QualityRules field is stamped with the rule set and a contract row is ensured for every supplying product. The data-product contract panel now shows these CDE rules as the contract's Data Quality Rules — with severity, enforcement and rule ID, linked to the CDE register — above the general schema-level clauses, and ahead of the DQ scorecard. New model sheet DataContract_DQRule (159). Both workbooks regenerated (159 sheets); verified 0 console errors across all pages under both organisations." },
  { v:"v1.31.0", date:"2026-08-10 06:30 SAST",
    note:"DQ Profiles for the Critical Data Elements — the objective statistical profile of each CDE, kept deliberately distinct from a DQ assessment. A profile describes the data as it is, independent of any consumer: its data type, records profiled, populated/null rate, cardinality (distinct count and %), and — by type — value range, mean, median, standard deviation and percentiles for numerics, a dominant format pattern and conformance for identifiers, and length statistics for free text, plus the value distribution itself. Every CDE now has a profile (Nedbank 46, AGGPSA 32) with a value distribution (204 / 122 distribution buckets), inferred data type (score, currency, ratio, count, categorical, identifier, temporal, text) and realistic, stable statistics — e.g. Consent status profiles as a five-value categorical (Granted 52%, Withdrawn 21%, …) and Propensity score as a numeric with mean 0.58, σ 0.22 and a value histogram. The Critical Data Elements register gains a DQ Profile column and an expandable per-CDE profile with the statistics and a distribution bar chart. Whether a profile is good enough is treated as a separate DQ assessment against a consumer's expectations — the CDE's own quality threshold and the data-product DQ scorecard — and the profile view says so. New model sheets CDE_DQ_Profile (157) and CDE_DQ_Distribution (158). Both workbooks regenerated (158 sheets); verified 0 console errors across all pages under both organisations." },
  { v:"v1.30.0", date:"2026-08-10 06:04 SAST",
    note:"Data-quality control and scorecard for the data products that supply the decisions and the AI agents. The data products feeding decisions (through their Critical Data Elements → owning concept → data product) and feeding AI agents (through the agent → data-product map) each now carry a DQ Control and a six-dimension DQ Scorecard — accuracy, completeness, timeliness, validity, consistency and uniqueness — with a target, a score, a RAG status and a trend per dimension, and an overall composite score and RAG. Nedbank scores 16 supplying data products and AGGPSA 15; each DQ control is governed by the Data Quality policy and wired into its control → evidence → assurance chain (the scorecard is the evidence), so it appears in the Governance & Responsible AI register. The scorecard shows in the data-product contract panel (with the decisions and agents each product supplies), the AI Agents & Models registry lists the data products each agent consumes with a DQ status dot, and the Decision Models CDE panel shows the supplying data products with their DQ score. New model sheets DataProductDQControl (155) and DataProductDQScorecard (156). Both workbooks regenerated (156 sheets); verified 0 console errors across all pages under both organisations." },
  { v:"v1.29.0", date:"2026-08-10 05:52 SAST",
    note:"Critical Data Elements (CDEs) for every decision. The data each decision depends on is now governed as a Critical Data Element — an owning information concept and golden source, a data steward, a sensitivity classification (with PII/special-category flagged), the data-quality dimensions and threshold it must meet, and a criticality tier. Each decision's inputs were normalised into a governed CDE inventory (Nedbank: 46 CDEs; AGGPSA: 32) and every one of the 18 decisions per organisation is mapped to the CDEs it relies on. Each CDE also has a data-quality rule registered against the Data Quality policy, so a CDE that falls below its threshold is a governed policy breach. The Decision Models page now shows a 'Critical Data Elements' panel for each decision (element, criticality, classification, quality dimensions & threshold, golden source, steward), and a new 'Critical Data Elements' register page lists the whole inventory — filterable by criticality, with PII/sensitive and decision-coverage counts and links from each CDE back to the decisions it feeds. New model sheets CriticalDataElement (153) and Decision_CDE_Map (154), plus per-CDE data-quality rules on the PolicyRule sheet. Both workbooks regenerated (154 sheets); verified 0 console errors across all pages under both organisations." },
  { v:"v1.28.1", date:"2026-08-10 05:10 SAST",
    note:"Completed the assurance chain for the Data Management policies — every DMBOK policy now has a control and an evidence artefact, with the evidence being a recognised DMBOK deliverable wherever possible. Each of the new Data Management policies gains a Standard Control (objective, control activity, frequency), a linked Evidence-register entry naming the DMBOK deliverable (e.g. Data Governance Strategy & Operating Model, Data Policy Register, Enterprise Data Model, Conceptual/Logical/Physical Data Models, Backup & Recovery Test Log, Data Classification Scheme, Access Review Report, Data Flow & Lineage Diagrams, Content Taxonomy, Master Data Match/Merge & Survivorship Rules, Reference Data Value Sets, Certified Data Product Catalogue, Governed Metric & KPI Definitions, Metadata Repository / Data Catalogue, End-to-End Data Lineage, Data Quality Rules & Thresholds, Data Quality Scorecard, Data Quality Issue Log, Records Retention Schedule, Legal Hold Register, Disposal Certificate, DPIA, RoPA, Consent & Subject-Rights Register), and an Audit & Assurance test recording a design/operating-effectiveness review. The Governance & Responsible AI register now shows the full policy → control → evidence chain, with an assurance result, for all 40 Nedbank and 35 AGGPSA Data Management policies. Both workbooks regenerated (152 sheets); verified 0 console errors across all pages under both organisations." },
  { v:"v1.28.0", date:"2026-08-09 22:44 SAST",
    note:"Comprehensive Data Management policy set aligned to the DMBOK knowledge areas, for both organisations. The pack is a Data Management pack but carried only a handful of data policies; it now has a governed policy for every DMBOK knowledge area — Data Governance, Data Architecture, Data Modelling & Design, Data Storage & Operations, Data Security, Data Integration & Interoperability, Document & Content Management, Reference & Master Data, Data Warehousing & BI, Metadata Management and Data Quality — plus Records & Data Retention and Data Privacy & Consent, grouped under a single 'Data Management' category. Nedbank now carries 40 Data Management policies across 14 domains and AGGPSA 35 across 13 (AGGPSA gained Data Security and Records domains it previously lacked). Domain names were canonicalised across both orgs (e.g. 'Security' → 'Data Security', 'Records' → 'Records & Data Retention', 'Privacy' → 'Data Privacy & Consent'). The Governance & Responsible AI register now derives its category tabs from the data rather than a fixed list, so the new Data Management group leads the register — and this also surfaced categories that were previously being dropped from the view (Ethical Stewardship, and for AGGPSA its Grant-Making, Finance, Impact, Safeguarding, Partnership and Risk policies). Injected reproducibly via build_process_step.ensure_data_management_policies (idempotent). Both workbooks regenerated (152 sheets); verified 0 console errors across all pages under both organisations." },
  { v:"v1.27.1", date:"2026-08-09 22:36 SAST",
    note:"AGGPSA now has a first-class AI Governance policy domain, on the same footing as Nedbank's. Previously the philanthropy's advisory AI agents were governed only by Risk & Compliance and Ethical Stewardship; AGGPSA had no dedicated AI or model-governance policy. Added an AI Governance domain and a Model Governance domain (owned by a new Responsible AI & Model Governance Lead role), five AI-governance policies (approved eval plan + accountable human + proportionate HITL; trace every use case to a process step, decision and governed knowledge; explainable, contestable, human-overridable recommendations; no autonomous final call on grant approval, disbursement or beneficiary exit; consent-, inclusion- and minimisation-respecting use of beneficiary data) and three model-governance policies (approved model card; drift/annual re-validation with monitoring and escalation; versioned, auditable agent instructions), plus an AI Governance Council mirroring the bank's. Every AGGPSA AI agent now applies AI Governance and Model Governance as its baseline policy, shown first on each decision, on the step AI-execution detail and in the AI Agents & Models registry. Both workbooks regenerated (152 sheets); verified 0 console errors across all pages under both organisations." },
  { v:"v1.27.0", date:"2026-08-09 22:17 SAST",
    note:"AI Agents & Models made explicit as the advisory intelligence. Every AI-Supported and AI-Executed decision and process step is now attributed to a named AI agent that runs one or more named AI models to make its recommendation, and every recommendation is grounded in Knowledge Management (governed semantic models, business glossary, decision precedent, regulatory guidance and impact evidence) and Business Policy guidance (the policy domains the agent must apply), with a human-in-the-loop posture that scales with the stakes. A new 'AI Agents & Models' registry page lists each agent — its purpose, execution posture (AIS/AIE), the models it runs, the knowledge assets it draws on and how, the business-policy domains it applies with example policy IDs, its owner and inherent risk tier, and the decisions it advises — plus an AI Model register and a Knowledge Management asset catalogue. Inline, the Decision Models page now shows an 'Advised by AI agent' block (agent, models, knowledge, policy) on every decision; the Business Process step table names the advising agent and model on each AI-run step; and the AI Use-Cases page shows the agent and models that realise each use-case, grounded in knowledge and policy. The model carries this as five new sheets — AIModel (148), KnowledgeAsset (149), AIAgent_KnowledgeAsset_Map (150), AIAgent_Policy_Map (151) and Decision_AIAgent_Map (152) — wired to the existing AIAgent, SemanticModel, Policy and ModelCard registers; the ProcessStep and DecisionRequirement sheets gained the advising-agent / model / knowledge / policy columns. Both workbooks regenerated (152 sheets); verified 0 console errors across all pages under both organisations." },
  { v:"v1.26.0", date:"2026-08-09 18:58 SAST",
    note:"Execution-level process definition, applied from the APQC/BIAN process review and the Target Execution-Level Process Definition. Every process step now carries exactly ONE primary execution type on a governed taxonomy — H (Human, performed entirely by a person), A (Automated, run by a system with no human in the loop), AIS (AI-Supported, AI recommends and a human makes the final decision), AIE (AI-Executed, AI acts autonomously within policy guardrails), and DS (Data Support, information supplied to another step) — together with an explicit Responsible and Accountable party. The Business Process tab shows an Execution · Role column with colour-coded execution badges, a legend, and a per-process execution profile; the BPMN swimlane is now coloured by execution type (rather than a binary AI/non-AI split) with a matching legend, and lanes are assigned from the execution type. On the Decision Models page each decision now shows its AI Involvement (AI-Supported vs AI-Executed) alongside the automation posture. Five new model sheets were added: ExecutionType (143, the taxonomy), ProcessStep_RACI_Map (144, Responsible/Accountable/Consulted/Informed per step), ProcessStep_AIExecution_Map (145, use-case/agent/model/confidence/HITL/guardrail for the AIS and AIE steps), ProcessStep_Evidence_Map (146) and ProcessStep_StateTransition_Map (147); the ProcessStep and DecisionRequirement sheets gained the execution-type and AI-involvement columns. A framework-alignment note records that processes sit on the APQC Process Classification Framework and, where relevant, BIAN service domains, with this execution-level layer added beneath. Both workbooks regenerated (147 sheets); verified 0 console errors across all pages under both organisations." },
  { v:"v1.25.0", date:"2026-08-09 17:21 SAST",
    note:"Model-integrity review across four issues. (1) Data Management foundation — added a dedicated Data Management band to the capability map (Data Governance & Stewardship, Data Quality, Metadata & Glossary, Master & Reference Data, Integration/Ingestion, Platform & Storage, Privacy/Consent, and org-specific data publishing), positioned beneath the core value chain and BEFORE the AI enabler, because AI and analytics build on data management. (2) Concept lifecycle across processes — CRUD is now governed end-to-end: each information concept is CREATED by one process, UPDATED by later processes (advancing its state), and DELETED/retired by the last, instead of every process re-creating it. Beneficiary: Create (Programme Incubation) → Update → Update → Delete (Governance & Assurance, on exit); Grant: Create (Inquiry) → Update × 3 → Delete (Closeout); Campaign (Nedbank): Create → Update → Update → Delete (Archived). A new ConceptProcessLifecycle sheet (142) records which process creates/updates/deletes each concept and to which state, and the Business Process tab shows this lifecycle-across-processes track on every concept, colour-coded. (3) Decision placement — decisions are no longer forced onto the first step; a process's decisions are distributed across its steps and biased toward the end (gates/approvals last), and a process can carry multiple decisions. (4) Every process ↔ information-concept interaction was reviewed against the lifecycle: steps that consume a concept read it; only the owning process creates or disposes it. Both workbooks regenerated (142 sheets); verified 0 console errors across all pages under both organisations." },
  { v:"v1.24.1", date:"2026-08-09 16:49 SAST",
    note:"Fixed a contradiction on the Decision Models page. The 'Agentic AI decision support' panel named the AI use-cases supporting a decision, but the 'Where this decision is used → AI use-cases' section below showed none, because the two read different links (the panel used the decision's supporting-use-cases; the lower section only listed use-cases that name the decision in their own definition). The lower section now unions both, so it always agrees with the panel — e.g. AGGPSA's grant-screening decision shows Next-best-intervention for grant officers and Ecosystem condition mapping in both places." },
  { v:"v1.24.0", date:"2026-08-09 03:02 SAST",
    note:"Major visual uplift — five architecture views rebuilt to a professional standard, driven by config and model data so each organisation renders its own. (1) Value Proposition: a hero statement, four numbered value pillars, 'who benefits and how' cards and a core-instruments strip, on the Architecture page. (2) Business Capability Map: a layered map — Steering & Governance, the Core value chain in five domains, and Enabling & Supporting capabilities colour-coded by type — with maturity shown on each core capability and a legend. (3) Business Process Landscape: value-stream tabs, a Steering band, five core process domains mirroring the capability map, and an Enabling & Governance band, with AI-assisted processes highlighted; clicking a process opens its steps. (4) BPMN 2.0 swimlane: each process's steps as a governed flow across three lanes — business operations, AI/automation, and human review & approval — with tasks, decision gateways, start/end events, AI-assisted badges and human-in-the-loop markers. (5) DMN Decision Requirements Diagram: the decision, the sub-decisions (analytics) that inform it, its input data, and the knowledge sources and HITL authority that govern it. New shared module assets/pack_diagrams.js; per-org config for the value proposition, capability map and process landscape. Verified 0 console errors across all pages under both organisations." },
  { v:"v1.23.2", date:"2026-08-09 02:34 SAST",
    note:"Made agentic AI decision support explicit for every decision. The principle is that any decision can be supported by an AI agent, with a human-in-the-loop posture that scales with the decision's stakes — so no decision should show 'no AI support'. Each decision now carries an automation posture (AI advisory — human decides for high-stakes approvals/board/capital/escalation; AI recommends — human approves for screening, selection, targeting and prioritisation; AI enforces rules — human on exceptions for consent and data-sharing; AI-assisted — human reviews for measurement and research), a HITL requirement, and one or more supporting AI use-cases. The Decision Models page gains an 'Agentic AI decision support' panel showing the posture, the HITL flag and the supporting use-cases; the DecisionRequirement sheet carries the same, and the Decision→AI-use-case map was completed so every decision (including AGGPSA's ToC screening, grant go/no-go, board approval, partner selection and risk escalation) is covered. Process steps that carry a decision now also record the supporting use-case and automation posture. Both workbooks regenerated." },
  { v:"v1.23.1", date:"2026-08-09 02:26 SAST",
    note:"Fixed the CRUD/lifecycle semantics on process steps. Previously every step that touched an information concept was marked Create/Update with the same state transition, so a concept looked like it was created several times in one process. Now a concept is CREATED once — at the first step that produces it — and UPDATED on later steps, advancing one lifecycle state each time (e.g. the Ecosystem Diagnostic Study now reads Create (new)→Scoped, Update Scoped→Measured, Update Measured→Mapped, Update Mapped→Published). Consumed concepts (validated but not produced, such as Consent) stay Read/Validate with no state change. Also improved step classification: steps that don't match a specific keyword now fall back to the owning process's primary concept rather than a global default, so a diagnostic study's steps read as Ecosystem Condition instead of Beneficiary. Both workbooks regenerated. Nedbank and AGGPSA only; no other behaviour changed." },
  { v:"v1.23.0", date:"2026-08-08 18:00 SAST",
    note:"Added the Process Step Architecture — the governed step-grain layer from the redesign research — to BOTH organisations. Business processes were under-normalised: process steps lived as text inside a process row. Now every atomic step is a first-class object that declares its decision, the information concept it acts on with a CRUD/lifecycle transition, the data product it touches, the control it runs, and the record and evidence it produces. Added 17 workbook sheets to each model (125–141): seven masters — ProcessStep, InformationConcept, InformationConceptLifecycle, RecordClass, DecisionRequirement, DecisionTable, EvidencePattern — and ten mapping sheets (Outcome/Process/Decision/InformationConcept/DataProduct/Record/Control to ProcessStep, plus Capability→InformationConcept, Record→Evidence and Evidence→Control assurance). Normalised 68 Nedbank steps and 54 AGGPSA steps from the process step lists, each mapped to its concept, CRUD/state transition, data product, control, record and evidence. Extended the End-to-End traceability to step grain (StepID, ConceptID, CRUDAction, LifecycleState, RecordClass, EvidenceProducedAtStep). The Business Process tab now shows steps as first-class rows with a new Information Concepts & lifecycle view (state chains, owning capability, data product, record, evidence) and a Records & Evidence architecture view; the Architecture Navigator surfaces the same step architecture when a process is selected. Nedbank and AGGPSA each get the layer in their own language (Customer/Consent/Offer/Segment/Campaign/CLV/NBA for Nedbank; Beneficiary/Grant/Ecosystem Condition/Programme/Impact Evidence/Catalytic Leverage/Targeting for AGGPSA). Both workbooks regenerated. Verified 0 console errors across all pages under both organisations." },
  { v:"v1.22.8", date:"2026-08-08 17:29 SAST",
    note:"Systematic sweep of the AGGPSA pack for leftover Nedbank wording, page by page. Rendered every page under both organisations and cleared the residual banking/marketing copy that the multi-tenant swap did not yet cover — now all seventeen tabs read as AGGPSA ecosystem content, not Nedbank marketing. Fixes: the Architecture traceability threads (was Retail/Commercial/Wealth/Trade acquisition → now Foundational talent, Enterprise support & survival, Catalytic grant-making, Ecosystem evidence & impact, Policy dialogue & institutionalisation, Entrepreneurship culture & networks); data-product governed terms (Propensity/Churn/Marketing ROI → ecosystem-analytics terms); the landing directory cards and workbook chips; the Ethical Stewardship page's specialisation table, domain examples and forums (banking-marketing → ecosystem analytics); the Beneficiary Journeys, Ecosystem Targeting, Data & Analytics, Data Products, Glossary and Business Process page copy; the User Manual's worked example (customer-churn story → entrepreneur-survival story), page guidance and playbook; the Navigation Graph service labels; page titles used in cards, breadcrumbs and the manual; and browser-tab titles and the 'Client:' line. All page copy is now organisation-configurable, so Nedbank is byte-for-byte unaffected and renders exactly as before. Verified: 0 console errors across all 18 pages under both organisations. Model workbook unchanged (this was a presentation-layer sweep only)." },
  { v:"v1.22.7", date:"2026-08-08 16:40 SAST",
    note:"Fixed the AGGPSA use-case prioritisation matrix showing only three bubbles. Each AGGPSA data-and-analytics use case had been given the same value/risk scores by lifecycle phase, so all production use cases plotted on one point, all pilots on another and all concepts on a third — overlapping into three dots. Every use case now has its own distinct value and risk driver scores reflecting its real character, so all 18 spread meaningfully across the Do-Now / Plan-Now / Reassess / Hold quadrants. Nedbank unaffected." },
  { v:"v1.22.6", date:"2026-08-08 02:38 SAST",
    note:"Fixed the empty AGGPSA capability heat-map on the Architecture page (every value-stage cell showed '—'). A build-script variable name collision had written single characters into the JourneyStage→Capability map (e.g. 'C','4' instead of 'C13'), so no capability resolved; each journey stage now correctly inherits its value stream's capabilities. Also made the Architecture page title organisation-configurable — Nedbank keeps 'Marketing Business Architecture', AGGPSA shows 'Ecosystem Business Architecture'. Nedbank unaffected." },
  { v:"v1.22.5", date:"2026-08-08 02:22 SAST",
    note:"Removed the Nedbank banking segments (Retail / Commercial / Wealth / Trade Finance) from the AGGPSA model. The ValueProposition segment columns are now organisation-configurable (PACK_CONFIG.vpSegments): AGGPSA uses ecosystem focus segments — Township & Micro, Growth & Scale, Artisan & Trade, Talent & Youth — in both the workbook (sheet 4 headers) and the app (the Architecture value-proposition and segment-comparison tables), with content rewritten to match. Nedbank keeps its banking lines of business unchanged." },
  { v:"v1.22.4", date:"2026-08-08 02:14 SAST",
    note:"Business Outcome now filters the Value-flow (Sankey). Previously a Business Outcome was a leaf branch — selecting one only changed which outcome chips showed, it did not narrow the value streams, capabilities, use-cases etc. that feed it. Now selecting one or more outcomes keeps only the value propositions that deliver them, so the whole downstream chain (value streams, journeys, stages, capabilities, processes, decisions, use-cases, agents, data products, domains) filters to the focused path — e.g. picking 'Professionalise enterprise support' narrows the value stream to 'Support Entrepreneurs & ESOs'. Also let a value stream serve several value propositions (comma-separated), so the outcome→value-stream mapping is accurate (AGGPSA). This behaviour benefits Nedbank too. Nedbank's own data is unchanged." },
  { v:"v1.22.3", date:"2026-08-08 01:58 SAST",
    note:"Gave the AGGPSA beneficiary journeys realistic, uneven experience arcs. Previously every journey stage was flat at 3/5 with identical touchpoints and metrics; each stage now carries its own experience score (1–5), stage-appropriate touchpoints and stage metrics. The arcs reflect where experience is genuinely won or lost — e.g. the township micro-entrepreneur dips at Discover (2, awareness & trust) then rises to Grow (4); the educator journey dips at Practise (2) in stressed schools; the grant lifecycle dips at Due diligence (2) then peaks at Approval and Closeout (4). Applied to both the Beneficiary Journeys page and the Graph/Explorer stage cards. Nedbank unaffected." },
  { v:"v1.22.2", date:"2026-08-08 01:50 SAST",
    note:"Fixed the AGGPSA Graph/Explorer getting stuck at Value Stage. The Explorer types each node by its ID pattern (e.g. a value stage must look like VS07-01), but AGGPSA value-stage IDs were VSG-07-1, so the Explorer couldn't recognise them and stopped expanding. Value-stage IDs now follow the VS<nn>-<nn> convention, and beneficiary-journey IDs were realigned from CRJ… to CJ… so they type and label correctly too. The Explorer now expands the whole parallel-mapped map end-to-end — Stakeholder → Persona → Journey / Value Stream → Value Stage → Capability → Process → Decision → Data & Analytics use-case → Agent → Data Product → Data Domain. Nedbank unaffected." },
  { v:"v1.22.1", date:"2026-08-08 01:33 SAST",
    note:"Fixed AGGPSA reachability in the Architecture Navigator (and the Graph), which was dead-ending with 'Nothing is reachable'. Three data-linkage gaps in the AGGPSA model: (1) three value propositions (VP01/VP03/VP05) had no value stream, so the walk stopped at the Value Stream step — the value-stream↔proposition mapping is now a complete 1:1 cover; (2) the value stages carried no enabling capabilities, so the Capability step dead-ended — each stage now lists its enabling capabilities; (3) beneficiary journeys weren't hydrating (the Nedbank line-of-business journeys leaked through) because the AGGPSA journey base was missing — AGGPSA now supplies its own journey base. Verified: a full walk from every stakeholder and value proposition reaches every downstream level with zero gaps. Nedbank is unaffected." },
  { v:"v1.22.0", date:"2026-08-07 23:14 SAST",
    note:"Made the pack multi-tenant: the Source selector now swaps between two whole organisations — 'Nedbank — Marketing Data & AI' and 'AGGPSA — Ecosystem Data & Analytics' (Allan & Gill Gray Philanthropy SA) — and every page re-renders with the chosen organisation's data, labels and narrative, offline, no upload. Built a full parallel AGGPSA business-architecture model: a new 124-sheet workbook (AGGPSA_FutureState_Model.xlsx) mirroring the Nedbank schema exactly, populated with AGGPSA content — beneficiaries, ESOs, educators and government as stakeholders; the Diagnose–Demonstrate–Dialogue framework and the five-phase grant-making lifecycle as value streams and processes; ecosystem-diagnostic tools (Connecten, AEEI, IMM) as the data & analytics use-cases; and the full governance, Policy-as-Code and Ethical Stewardship layers adapted for catalytic philanthropy. Labels adapt where it aids clarity (Journeys→Beneficiary Journeys, AI Use-Cases→Data & Analytics, Personalisation→Ecosystem Targeting). Implemented via an org resolver (org_switch.js) that rebuilds the model for the selected organisation, so the pages themselves are unchanged; Nedbank remains the default and behaves exactly as before." },
  { v:"v1.21.0", date:"2026-08-07 16:50 SAST",
    note:"Built in the Ethical Stewardship Architecture — the orientation layer above Corporate, Data and AI Governance that asks 'should this exist at all, for whom, under whose authority, with what human benefit?' before the safety-and-compliance gates. Added 15 workbook sheets (110–124: EthicalStewardshipPrinciple, PurposeAssessment, HumanOutcomesAssessment, CollectiveBenefitAssessment, AuthorityToControlReview, OutcomeEquityAssessment, EthicalSustainabilityAssessment, CommunityImpactAssessment, StewardshipDecision, StewardshipEvidence, StewardshipMetric, StewardshipMonitoring, StewardshipTraceability, StewardshipException, StewardshipRetirementReview) with comprehensive coverage — one full stewardship assessment per AI use case (U01–U18) across every domain. Added six stewardship policies (PD-STEW) and the Ethical Stewardship Council (GC-STEW) above the existing forums. New 'Ethical Stewardship' tab (next to Governance): orientation-layer diagram with five pillars, nine CARE-derived domains, the ten-step lifecycle with the ethical pre-gate, the pre-gate-vs-delivery-gates comparison, the council, the banking-marketing specialisation, a maturity model, and the full registers including a 'review by use case' rollup. Wired the ethical pre-gate into the Architecture Navigator: the AI use-case step now surfaces the stewardship verdict (approve / conditional / redesign), equity risk and authority for the use-cases on the walk, before Value × Readiness. Refreshed the risk/compliance/legal review as a new Word document covering the layer." },
  { v:"v1.20.1", date:"2026-08-07 16:19 SAST",
    note:"Reordered the left sidebar to follow the golden-thread navigation order. The tabs had accumulated in the order features were added, so overview and content pages were interleaved. They now read top-to-bottom as: the three overview tools (Home, Navigator, Value-Flow Graph), then the golden-thread content pages in chain order (Value Streams → Journeys → Architecture/Capabilities → Processes → Decisions → AI Use-Cases → Personalisation → Data Products), then the supporting and admin pages (Governance, Training, Glossary, Model I/O, Editor, Manual). No pages were added or removed — only reordered." },
  { v:"v1.20.0", date:"2026-08-07 05:45 SAST",
    note:"Rebuilt the Value-Flow (Sankey) so it carries every element type the Navigator does. It previously had six levels and jumped Capability straight to AI Use-Case; it now shows the full chain — Stakeholder → Value Proposition → Value Stream → Value Stage → Capability → Business Process → Decision → AI Use-Case → AI Agent → Data Product → Data Domain — with Business Outcome and Customer Journey branching off Value Proposition and Value Stream. The filter rail gains all twelve levels (Business Outcome, Customer Journey, Business Process, Decision, AI Agent and Data Domain join the rest), each colour-coded, and flow width still reflects AI value (or KPI roll-up weight) aggregated across the longer chain. 'My Navigator path' now carries all of those levels too, so the Graph mirrors the Navigator exactly — including the Business Process and Decision steps that were missing." },
  { v:"v1.19.0", date:"2026-08-07 05:11 SAST",
    note:"Three fixes off the Navigator/Graph review. (1) Filled a mapping gap: decision D4 'Offer eligibility & suitability' had no AI use-case; it now maps to Propensity-to-buy (U02), Next-best-conversation for RMs (U14) and CLV forecasting (U04). Every decision now reaches at least one use-case. (2) Added a cue on the Navigator: when a selected item upstream maps to nothing at the current step (e.g. a decision with no AI use-case), a small note now says so, instead of silently showing fewer cards. (3) The Graph now follows the Navigator. 'My Navigator path' (and opening the Value-flow view after a walk) seeds the Sankey from the full resolved selection at every level — including the AI use-case set that the decision layer narrowed to — so the flow mirrors the walk rather than showing a broader capability→use-case set. 'Whole model' still resets to everything." },
  { v:"v1.18.1", date:"2026-08-07 04:40 SAST",
    note:"Fixed a Navigator reachability bug: parent selections now carry down transitively. Previously, leaving an intermediate step on ‘All’ (e.g. Value Stage) reset the next step to every item in the model, so choosing one Value Stream still showed all 17 capabilities. Now ‘All’ at an intermediate level means ‘all reachable from the selection above’, so Build Customer Relationship narrows to its 11 enabling capabilities, Publish Governed Data Product to 4, and picking a single value stage narrows further — the constraint flows the whole way down the chain." },
  { v:"v1.18.0", date:"2026-08-07 04:25 SAST",
    note:"Applied BIZBOK/TOGAF-aligned naming to the value architecture, as a naming-layer change with every ID frozen. Value propositions gained a canonical ValuePropositionName (Trusted Financial Progress, Qualified Relationship Conversations, Accountable Marketing Value, …) kept alongside the long-form GenericPromise; the app now shows these names instead of the stakeholder group. The eleven value streams were renamed to active verb + business object (Build Customer Relationship, Convert Relationship Opportunity, Launch Market Proposition, Execute Marketing Campaign, Clear Marketing Treatment, Publish Governed Data Product, Prove Regulatory Compliance, …) and the value stages to 2–3 word value-producing state changes (Engage Prospect, Convert Opportunity, Launch Offer, Learn from Results, Produce Evidence, …). Names were propagated to the ValueStage map and the Element Registry, and a NamingStandard reference sheet was added. No mapping IDs changed, so all traceability, the Navigator, the Graph and governance are unaffected." },
  { v:"v1.17.0", date:"2026-08-07 04:13 SAST",
    note:"Brought All / one / several multi-select to the Architecture Navigator. Every step now has an ‘All’ toggle plus tickable cards — pick all, one, or several elements at any level and the whole set carries forward, with each later step filtered to what’s reachable from the selection above it (widen an earlier step to ‘All’ to open it back up). The stepper summarises each level (— all —, a single name, or an ‘N selected’ badge), Continue/Back move through the walk, and the single-item detail (SIPOC, decision table, agent and data-product cards) still appears when exactly one element is selected. The carried breadcrumb stays in sync with the primary selection." },
  { v:"v1.16.2", date:"2026-08-07 01:05 SAST",
    note:"Grouped the governance chain by broad policy area instead of fine-grained domain. The tree now opens on a single Marketing area holding all 30 marketing policies (and AI & Model, Data & Privacy, Records, Enterprise alongside), rather than twelve separate marketing domains — the fine domain (Consent & Preference, Contact Strategy, etc.) is now a small tag on each policy so nothing is lost. Added a Category column to the Policy sheet so the same Marketing grouping works when filtering in Excel." },
  { v:"v1.16.1", date:"2026-08-06 03:05 SAST",
    note:"Made the marketing policies visible and gave them real depth. Every policy domain now carries a Category (Marketing · AI & Model · Data & Privacy · Records · Enterprise), and the marketing catalogue was expanded from a thin one-policy-per-domain set to 30 marketing policies across the 12 marketing domains — each with its own control and evidence link — so Marketing Conduct, Consent & Preference, Contact Strategy, Personalisation & NBA, Offer Eligibility, Vulnerable Customer, Content & Brand, Channel Activation, Experimentation, Attribution, Customer Experience and Partner/Agency are all properly populated. The Domain → Policy → Control → Evidence tree gains a category filter (All · Marketing · AI & Model · Data & Privacy · Records · Enterprise) and each domain now shows its category, and the Tables view adds a Category column. Previously only the two policies literally under 'Marketing Conduct' were easy to find; the rest were spread across sibling domains with nothing marking them as marketing." },
  { v:"v1.16.0", date:"2026-08-06 02:50 SAST",
    note:"Added the Policy-as-Code layer that turns the governance registers from govern-on-paper into govern-by-wire. Expanded the policy taxonomy to the 15-domain banking-marketing set (Consent & Preference, Contact Strategy, Personalisation & NBA, Offer Eligibility, Vulnerable Customer, Content & Brand, Channel Activation, Experimentation, Attribution, Customer Experience, Partner/Agency joining the existing AI/Data/Records/Conduct domains), each with policies and controls. Added ten machine-readable sheets — PolicyRule (with a runtime decision-effect: allow/deny/suppress/escalate/require_human_review/require_disclosure/log_only), Obligation, Prohibition, Permission, EnforcementPoint, PolicyBundle, PolicyException, PolicyDecisionLog (with a tamper-evident input hash), ControlTest and RegulatoryObligationMap tying POPIA s69/s11, the FSCA TCF outcomes, NIST AI RMF, ISO/IEC 42001 and BCBS 239 down to specific controls. The Governance page gains a 'Policy-as-Code' tab — the observability control tower — showing the rule layer, decision-effect distribution, control-test pass rate, enforcement points, the regulatory obligation map and a live policy decision log." },
  { v:"v1.15.1", date:"2026-08-06 02:17 SAST",
    note:"Made the governance relationships visible. The Governance registers now open on a 'Domain → Policy → Control → Evidence' tree that shows the chain explicitly: each governance domain expands to its policies, each policy to the controls that enforce it, and each control to the evidence that proves it (with the control's audit result shown inline). Colour-banded and indented by level, expand/collapse per node or all at once, with counts at every level (e.g. a domain's policy count, a policy's control count, a control's evidence count). The flat lookup tables are still there under a 'Tables' tab; Risk, Councils & RACI, Records & Evidence and AI governance are unchanged." },
  { v:"v1.15.0", date:"2026-08-05 17:10 SAST",
    note:"Built out the governance layer — the model's 'immune system' — and surfaced it in the app. The Policy & Controls, Risk, Governance-council/RACI, Records/Evidence and AI-governance sheets (63–75) are now populated with representative Nedbank marketing content, fully cross-referenced to the spine (use cases, data products, decisions, roles): 16 policies across 9 domains, 20 standard controls, an 18-item evidence register with control→evidence mapping, 6 councils and a RACI, a 16-line risk register, 12 record-retention classes, a 14-test audit/assurance log, plus AI model cards, a prompt/instruction register and an AI decision log. The Governance & Responsible AI page now has a live 'Governance registers' section with five tabs (Policies & Controls · Risk · Councils & RACI · Records & Evidence · AI governance) drawn straight from the model via the hydrator, so editing the sheets flows through to the page. Also added the two data-foundation sheets the metaphor recommends — DataAsset and StoragePlatform (the 'feet that touch the ground') — mapping every data product down to its physical asset and storage platform." },
  { v:"v1.14.2", date:"2026-08-05 06:44 SAST",
    note:"Made the Explorer (expand map) use the full screen. The view now breaks out of the centred page column and spans the width to the right of the sidebar, the detail panel on the right is slimmer so the map gets the room, the first level opens automatically so you land on a full picture rather than a lone card, and the cards sit further apart with longer connectors — so the map fills the screen instead of hugging the top-left corner." },
  { v:"v1.14.1", date:"2026-08-05 06:16 SAST",
    note:"Reworked the Explorer (expand map) into a clean card-based mind-map, so it reads clearly even with several branches open. Each element is now a rounded card — tinted and colour-banded by type, with a category line, the element name, a count badge, and small pills summarising what it connects to (e.g. ‘4 Persona · 1 Value Proposition’, ‘6 Value Stage’) — joined by smooth colour-coded connectors that fan left to right. Click a card to expand or collapse just that branch and read the full detail on the right. Replaces the earlier dense text layout." },
  { v:"v1.14.0", date:"2026-08-05 02:41 SAST",
    note:"Added a third view to the Navigation Graph — Explorer (expand map) — for when the Sankey gets crowded. It draws the same parallel-mapped hierarchy as an expand/collapse node-link map that traverses left to right: click any node to open or close just that branch, so you only ever see the part of the tree you care about, and the detail panel on the right shows the selected element's type, definition (with the ‘i’ primer), explanation and value. Start from Stakeholders, Value Propositions, Value Streams, Business Outcomes or AI Use-Cases, with a Collapse-all reset. The hierarchy tree, the value-weighted Sankey and the new Explorer are three lenses on the same model." },
  { v:"v1.13.0", date:"2026-08-04 19:37 SAST",
    note:"Brought the User-Guide definitions into the app itself, so the teaching happens in context while you explore. Every architectural element now carries a small “i” you can click for a plain-language pop-up — what it is, why it matters, and a link into the guide. Wired into the Architecture Navigator (each step title and every level in the stepper) and the Navigation Graph (each level of the Value-Flow filter rail, and the node detail panel). The definitions live in one shared place, so they stay consistent everywhere and can be reused on other pages. Someone new to business architecture can now learn the model by hovering, without leaving the page." },
  { v:"v1.12.0", date:"2026-08-04 18:40 SAST",
    note:"Rewrote the User Guide as a Data & AI education primer for executives, assuming no prior knowledge of business architecture. It now opens with 'the big idea' — why AI initiatives need a business architecture and the 'golden thread' from a stakeholder down to governed data — then defines every one of the thirteen building blocks in plain language, each with the question it answers, why it matters to a sponsor, a worked example from a single running story (preventing customer churn), and a clear call-out wherever AI enters. Added a six-step playbook for taking one AI idea through the model (start from an outcome, find the decision, name the use-case, check the data, set human oversight, close the loop on the KPI), a guide to reading each visualisation (Navigator, hierarchy tree, Value-Flow Sankey, value-vs-risk portfolio, capability heatmap), and refreshed the 'finding your way around' section for the new sidebar. The downloadable PDF is regenerated to match." },
  { v:"v1.11.0", date:"2026-08-03 20:12 SAST",
    note:"Reworked the top of the screen for clarity. The navigation moved from a crowded top strip to a clean left sidebar: the Modelware brand sits top-left, the source selector and the version/last-updated stamp live in the rail, and every page is listed as a numbered tab down the side (1–17) with the current page highlighted. Content now uses the full width to the right of the rail. The traceability path (the Stakeholder → … → Data Domain selection breadcrumb) now appears only on the Architecture Navigator — the one place you build it — instead of on every page, which removes the biggest source of clutter. On narrow screens the sidebar collapses back to a wrapped top bar." },
  { v:"v1.10.3", date:"2026-08-03 20:01 SAST",
    note:"Refined the Value Flow multi-select so it keeps your focus. Levels are now independent: choosing 'All' at one level (e.g. all Value Stages) no longer forces the levels below it open. Every value stage is shown, but a stage that has none of the capabilities you've selected at the next level is displayed and then stops there — a thin stub carrying its name and KPI — rather than being force-connected to everything. So you can hold, say, all six value stages on screen while the flow still concentrates on the two capabilities (and their use-cases and data products) you're focused on. Picking 'All' at the next level reconnects them." },
  { v:"v1.10.2", date:"2026-08-03 19:50 SAST",
    note:"Value Flow multi-select now cascades top-down so 'All' really means all. Previously, choosing All at a level (e.g. all Value Stages) could still collapse to one or two branches because a deeper level was left narrowed to a subset — the value-weighted flow pruned every stage that didn't reach the chosen capabilities. Now, opening any level to All forces every deeper level to All as well and fans the flow fully down to the Data Products; the forced-open levels are shown greyed and marked '· all' so it's clear they can't be narrowed beneath an open level (narrow a level above first). Picking all Value Stages now shows all of them branching to every capability, use-case and data product." },
  { v:"v1.10.1", date:"2026-08-03 19:37 SAST",
    note:"Value Flow (Sankey) now supports multiple elements per level. A new filter rail sits above the chart: for every level — Value Proposition, Value Stream, Value Stage, Capability, AI Use-Case, Data Product — you can pick 'All' or tick several specific items, and the flow splits across all of them, fanning all the way down to the Data Products. Whatever path you walked in the Navigator seeds the rail (so you start where you were), and 'My Navigator path' / 'Whole model' reset it. This fixes the case where you wanted, say, all Value Stages: previously the flow collapsed to a single path because the levels below were pinned; now choosing 'All' at a level clears the deeper pins and branches out." },
  { v:"v1.10.0", date:"2026-08-03 15:47 SAST",
    note:"Added a User Manual (new 'Manual' tab, and a card on the front page). It's a complete guide to the pack — the top-bar controls (navigation, source selector, traceability breadcrumb and carried selection, versioning), the 13-step Navigator flow explained step by step, and every tab documented with 'what you'll see' and 'how to use it', plus an editing-and-publishing workflow and an element-ID quick reference. The tab list and the Navigator flow are generated from the same configuration the app runs on, so the manual stays in step with the pack. It reads in the app (with a contents rail) and downloads as a formatted PDF for onboarding and offline sharing." },
  { v:"v1.9.1", date:"2026-08-03 15:25 SAST",
    note:"Fixed the traceability path being cut off: the chain was forced onto one horizontally-scrolling line, so only the first eight steps showed and the rest (Decision, AI Use-Case, AI Agent, Data Product, Data Domain) were hidden behind a scrollbar. The path now wraps so every step is visible at once — with or without a selection — while the version/last-updated block stays pinned top-right and never overlaps it." },
  { v:"v1.9.0", date:"2026-08-03 15:05 SAST",
    note:"Every page now derives its content directly from the editable model bundle (assets/model_all.js) at load time, via a new hydrator (assets/model_hydrate.js) that rebuilds the app's data from the 96 workbook sheets and overlays the base content the sheets don't carry (AI value/risk scores, data contracts, SIPOC detail, decision rules and the page-narrative blocks). The upshot: an approved editor's changes — saved to the private repo through the Model Editor — now flow automatically to the Navigator, Graph, Customer Journey, Value Streams, AI Use-Cases and every other page, with no separate extraction step to re-run. The Model Editor itself continues to edit the raw sheets. Verified: all pages render identically to the baked model with zero console errors, and the model now carries a value proposition for every stakeholder (the parallel-mapped cardinality rule)." },
  { v:"v1.8.0", date:"2026-08-03 14:34 SAST",
    note:"Added a Model Editor (approved editors only, passphrase-gated) for the PRIVATE repository: edit every element of the model — all 96 data sheets. Relationship (…_Map) sheets are editable grids where you add a new relationship; every other sheet is a list+form. Add and delete rows anywhere. You edit a local draft in the browser, then ‘Save for repo’ (downloads assets/model_all.js) and ‘Export .xlsx’, and pull → commit → push to publish. ‘Load published’ discards the local draft and reloads the repository baseline. Read-only until unlocked. (Client-side soft-gate — set the passphrase in data.js; the private repo + Pull/Push is the real access control.)" },
  { v:"v1.7.2", date:"2026-08-02 17:24 SAST",
    note:"Value Flow (Sankey) now starts at the Stakeholder and follows the selected navigation path: Stakeholder → Value Proposition → Value Stream → Value Stage → Capability → AI Use-Case → Data Product. Wherever you've made a selection in the Navigator (the carried chain), the flow narrows to just that path; where you haven't, it fans out. Added a 'Start from' stakeholder picker, a live 'Selected path' readout and a Clear-path button; with nothing selected it shows the whole model from every stakeholder." },
  { v:"v1.7.1", date:"2026-08-02 17:08 SAST",
    note:"Value Flow (Sankey) enhancements: added a “Weight by” selector — choose AI value score (bottom-up mean use-case value) or KPI roll-up weight (top-down % of the value proposition, per value stage) — and extended the flow one level further, down to the Data Products, so it now runs Value Stream → Value Stage → Capability → AI Use-Case → Data Product." },
  { v:"v1.7.0", date:"2026-08-02 16:52 SAST",
    note:"Fixed the version stamp overlapping the traceability breadcrumb — the version / last-updated block now sits in its own fixed region beside the scrollable path. Added a Value Flow (Sankey) view to the Navigation Graph: for a selected value stream it flows Value Stream → Value Stage → Capability → AI Use-Case, with flow width = AI value contribution (mean use-case value score) and each value stage labelled with its KPI — showing the value relation and the improvement metric at a glance. Toggle between the hierarchy tree and the value flow." },
  { v:"v1.6.0", date:"2026-08-02 16:31 SAST",
    note:"Added the Value Streams — Ownership & Governance page: pick a value stream and trace it down to who owns and governs it — value stages with primary KPIs, the business outcomes it delivers (each with its accountable role and review forum/cadence), the ownership-role model, and the governance operating layer (governance councils, decision-rights RACI, policy domains → policies → controls, and the risk register). Loaded the ownership + governance data from the future-state model into the pack." },
  { v:"v1.5.0", date:"2026-08-02 16:14 SAST",
    note:"Rewired the Architecture Navigator and Navigation Graph to walk the full parallel-mapped hierarchy: Stakeholder / Persona → Value Proposition → {Business Outcome → KPI · Value Stream → Value Stage} → Customer Journey (relationship + CX) → Capability → Business Process → Step → Decision → AI Use-Case → AI Agent → {Data Product → Data Domain · Semantic Model · Human-in-the-Loop}, with CDP Services supplying the data. The Navigator's guided walk and breadcrumb now span all 13 steps; the Graph expands every level with the new node types and cross-mappings. Value Stream and Customer Journey are separate first-class domains cross-mapped to Capabilities, per BIZBOK/TOGAF." },
  { v:"v1.4.0", date:"2026-08-02 15:59 SAST",
    note:"Upgraded to the future-state model: loaded the new data elements app-wide (Personas, Value Streams & Value Stages, Business Outcomes with weighted KPI roll-up, per-KPI Definitions & Calculations, Customer Experience Journeys, Ownership Roles, journey meta and the journey-stage → value-stage mapping). Rebuilt the Customer Journey page: each relationship journey now shows its persona, value stream, development objective, the value proposition and business outcomes it rolls up to, per-stage value-stage mapping, enriched KPI detail on click, and the mapped Customer Experience Journeys (experience focus, moment of truth, touchpoints). Navigator & Graph rewire to the parallel-mapped hierarchy follows next." },
  { v:"v1.3.0", date:"2026-08-01 18:54 SAST",
    note:"Added a Model Export / Import page: export the complete architecture model to Excel as one sheet per level in the corrected hierarchy (Stakeholder → Value Proposition → Stream → Stage → KPI → Capability → Business Process → Decision Model incl. Human-in-the-Loop → AI Use-Case → AI Agent → Semantic Model → Data Product → Data Domain), with every attribute and parent/child link plus a referential-integrity validation sheet. Import an edited workbook back as a live “Imported (Excel)” source that drives the Navigator, Graph and all pages. Offline (SheetJS vendored, no CDN)." },
  { v:"v1.2.9", date:"2026-08-01 18:09 SAST",
    note:"Corrected the Navigation Graph hierarchy to the real model: Stakeholder \u2192 Value Proposition \u2192 Value Stream \u2192 Stage; a Stage has KPIs and required Capabilities; a Capability has a Business Process; a Process has Decisions; Processes/Decisions are automated by AI Use-Cases \u2192 AI Agents; an AI Agent requires Data Products (\u2192 Domain) and Semantic Models, and a Human-in-the-Loop for crucial, high-risk decisions. Added AI Agents, Semantic Models, Human-in-the-Loop and Value-Stream Stages as first-class nodes." },
  { v:"v1.2.8", date:"2026-08-01 17:49 SAST",
    note:"Top bar made readable — all navigation links now show on one row (no longer hidden behind the source selector) and the traceability breadcrumb sits on a single tidy scrollable line. Navigation Graph rebuilt as a full expandable hierarchy: expand any node to drill down every level (Stakeholder → Value Prop → Journey → Capability/Process/Decision → AI Use-Case → CDP → Data Product → Domain), with a path-from-top, explanation and value panel; it no longer stops at one hop." },
  { v:"v1.2.7", date:"2026-08-01 16:52 SAST",
    note:"Added an interactive Navigation Graph (click a node to focus it, see its explanation + value, and step up/down/across to connected nodes). Data products now carry a full Data Contract (fundamentals, schema, semantics, quality, SLA, terms of use, producers/consumers) shown in a detail panel. AI Use-Case step now shows its supporting CDP services inline so the CDP context is visible." },
  { v:"v1.2.6", date:"2026-07-31 16:48 SAST",
    note:"Introduced Data Products: the governed, owned data assets that deliver the AI use-cases and CDP, each mapped to a data domain (owner/steward) to align demand to the Data Strategy. Added a Data Products catalog page (filter by domain) and a 10th Navigator step showing the data products required by the selected AI use-case and its CDP services, grouped by domain." },
  { v:"v1.2.5", date:"2026-07-31 16:39 SAST",
    note:"Extended the Navigator chain past Decision with two steps: AI Use Case (the use-cases that apply the chosen decision) and Personalisation (CDP) (the CDP services, models, data and governance guardrails that use-case requires). Breadcrumb/stepper now span all nine steps." },
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

/* ============================================================================
   v3: extend the traceability chain past Decision → AI Use Case → CDP
   ========================================================================== */
window.PACK_CONFIG.chain.push(
  { key:"ai",  label:"AI Use Case" },
  { key:"cdp", label:"Personalisation (CDP)" }
);

/* Required Personalisation on the Customer Data Platform, per AI use case:
   the CDP services (CDP1..CDP8) and models each use case depends on, plus the
   most relevant data. Governance guardrails are the shared CDP set. */
window.GENERIC.aiCdp = {
  U01:{ services:["CDP1","CDP3","CDP4","CDP6","CDP7","CDP2","CDP8"], models:["Propensity","Churn risk","CLV","Next best action","Contact policy"], data:["Customer identity","Product holdings","Transaction behaviour","Digital events","Consent"] },
  U02:{ services:["CDP1","CDP3","CDP5","CDP6"], models:["Propensity"], data:["Product holdings","Transaction behaviour"] },
  U03:{ services:["CDP1","CDP3","CDP4","CDP6"], models:["Churn risk","CLV","Next best action"], data:["Transaction behaviour","Complaints & service interactions"] },
  U04:{ services:["CDP1","CDP3","CDP6"], models:["CLV"], data:["Product holdings","Transaction behaviour"] },
  U05:{ services:["CDP1","CDP2","CDP3","CDP5","CDP6","CDP7","CDP8"], models:["Content personalisation","Next best action","Propensity","Contact policy"], data:["Consent","Channel preferences","Transaction behaviour","Life-event / contextual signals"] },
  U06:{ services:["CDP2","CDP8"], models:["Content personalisation"], data:["Consent"] },
  U07:{ services:["CDP3","CDP5","CDP6"], models:["Propensity"], data:["Digital events"] },
  U08:{ services:["CDP2","CDP3","CDP6","CDP7"], models:["Channel selection","Contact policy"], data:["Channel preferences","Digital events"] },
  U09:{ services:["CDP1","CDP3","CDP6"], models:["Propensity"], data:["Product holdings"] },
  U10:{ services:["CDP3","CDP4","CDP8"], models:[], data:["Digital events"] },
  U11:{ services:["CDP3","CDP8"], models:[], data:["Complaints & service interactions"] },
  U12:{ services:["CDP1","CDP3","CDP5","CDP6"], models:["Propensity"], data:["Transaction behaviour"] },
  U13:{ services:["CDP5","CDP6","CDP7"], models:[], data:["Digital events"] },
  U14:{ services:["CDP1","CDP3","CDP6","CDP7"], models:["Next best conversation","Propensity","CLV"], data:["Customer identity","Product holdings"] },
  U15:{ services:["CDP2","CDP8"], models:[], data:["Consent","Channel preferences"] },
  U16:{ services:["CDP6","CDP8"], models:[], data:["Risk indicators & eligibility"] },
  U17:{ services:["CDP1","CDP2","CDP3","CDP4","CDP6","CDP7"], models:["Next best action","Content personalisation"], data:["Life-event / contextual signals","Transaction behaviour","Consent"] },
  U18:{ services:["CDP3","CDP4","CDP6","CDP8"], models:[], data:["Digital events"] }
};

/* ============================================================================
   v4: Data Products — the governed, owned data assets that deliver the AI
   use-cases and the CDP. Each sits in a data DOMAIN (with owner/steward),
   connecting demand (AI/CDP) to the Data Strategy's governed supply.
   ========================================================================== */
window.GENERIC.dataDomains = [
  { id:"DM1", name:"Party & Customer",       owner:"Chief Data Office",        steward:"Customer Data Steward",  def:"Identity, household/business relationships and the unified customer profile." },
  { id:"DM2", name:"Product & Offer",         owner:"Product Data Office",      steward:"Product Data Steward",   def:"Products held, offers, eligibility and pricing data." },
  { id:"DM3", name:"Interaction & Event",     owner:"Digital & Channels",       steward:"Event Data Steward",     def:"Behavioural events, transactions and journey state." },
  { id:"DM4", name:"Consent & Preference",    owner:"Privacy Office",           steward:"Consent Steward",        def:"Consent, purpose and preference permissions." },
  { id:"DM5", name:"Risk & Eligibility",      owner:"Risk & Compliance",        steward:"Risk Data Steward",      def:"Risk indicators, affordability, eligibility and fraud signals." },
  { id:"DM6", name:"Insight & Model",         owner:"Data Science / Analytics", steward:"Model Data Steward",     def:"Features, model scores, segments and audiences." },
  { id:"DM7", name:"Experience & Feedback",   owner:"CX Office",                steward:"Voice-of-Customer Steward", def:"Voice-of-customer, complaints and journey analytics." },
  { id:"DM8", name:"Activation & Measurement",owner:"Marketing Data Office",    steward:"Marketing Data Steward", def:"Activation audiences, next-best-action decisions, attribution and ROI." },
  { id:"DM9", name:"Governance & Metadata",   owner:"Chief Data Office",        steward:"Metadata Steward",       def:"Data quality, lineage, provenance and audit across products." }
];
/* Each data product: domain, description, the CDP services it realises, the AI
   use-cases it serves, and the governed glossary terms it carries. */
window.GENERIC.dataProducts = [
  { id:"DP01", name:"Customer Identity Graph", domain:"DM1",
    desc:"Resolved party / person / household / business identity and relationships (the golden customer record).",
    cdp:["CDP1"], ai:["U01","U02","U03","U04","U09","U12","U14","U17"], terms:["Party","Match Key","Beneficial Owner (UBO)"] },
  { id:"DP02", name:"Customer 360 Profile", domain:"DM1",
    desc:"Unified demographic, behavioural, product, service, complaint and journey-state profile per customer.",
    cdp:["CDP3"], ai:["U01","U02","U03","U04","U05","U07","U09","U10","U11","U12","U14","U17","U18"], terms:["Customer 360"] },
  { id:"DP03", name:"Product Holdings", domain:"DM2",
    desc:"Products and services currently held per customer, with tenure and balances.",
    cdp:["CDP3","CDP6"], ai:["U02","U04","U14"], terms:["Product Holding"] },
  { id:"DP04", name:"Offer & Eligibility Catalogue", domain:"DM2",
    desc:"Available offers with product rules, affordability and eligibility criteria.",
    cdp:["CDP6"], ai:["U02","U05","U09"], terms:["Offer","Eligibility"] },
  { id:"DP05", name:"Behavioural Event Stream", domain:"DM3",
    desc:"Real-time digital and behavioural events (taps, swipes, sessions, triggers).",
    cdp:["CDP4"], ai:["U01","U07","U08","U10","U13","U17","U18"], terms:["Behavioural Event"] },
  { id:"DP06", name:"Transaction Ledger", domain:"DM3",
    desc:"Transaction behaviour used for propensity, churn, CLV and affordability.",
    cdp:["CDP3","CDP6"], ai:["U01","U03","U04","U12"], terms:["Transaction"] },
  { id:"DP07", name:"Journey State", domain:"DM3",
    desc:"Current lifecycle stage and journey context per customer (moments of truth).",
    cdp:["CDP4"], ai:["U01","U10","U17"], terms:["Journey State","Moment of Truth"] },
  { id:"DP08", name:"Consent & Preference Ledger", domain:"DM4",
    desc:"Consent, purpose, channel and campaign permissions, with opt-out enforcement.",
    cdp:["CDP2"], ai:["U05","U06","U08","U15","U17"], terms:["Consent Basis","Preference Management"] },
  { id:"DP09", name:"Risk & Affordability Signals", domain:"DM5",
    desc:"Risk indicators, affordability, eligibility and fraud/vulnerability flags.",
    cdp:["CDP6"], ai:["U03","U16","U17"], terms:["Risk Rating","Affordability"] },
  { id:"DP10", name:"Feature Store", domain:"DM6",
    desc:"Governed, reusable features feeding the marketing models, with explainability attributes.",
    cdp:["CDP6"], ai:["U01","U02","U03","U04","U12","U14","U16"], terms:["Feature Store"] },
  { id:"DP11", name:"Model Score Products", domain:"DM6",
    desc:"Published propensity, churn, CLV and next-best-action scores as governed products.",
    cdp:["CDP6","CDP7"], ai:["U01","U02","U03","U04","U14"], terms:["Propensity Model","Churn Model","CLV"] },
  { id:"DP12", name:"Segment & Audience Product", domain:"DM6",
    desc:"Lifecycle and ML segments and activation-ready audiences with eligibility filters.",
    cdp:["CDP5"], ai:["U05","U07","U12","U13"], terms:["Segmentation","Audience"] },
  { id:"DP13", name:"Voice-of-Customer & Complaints", domain:"DM7",
    desc:"Complaints, surveys, sentiment and service interactions for driver insight.",
    cdp:["CDP3"], ai:["U03","U11","U17"], terms:["Voice of Customer","CSAT"] },
  { id:"DP14", name:"Journey Analytics Product", domain:"DM7",
    desc:"Drop-off, pathing and journey KPIs feeding the improvement backlog.",
    cdp:["CDP8"], ai:["U10","U11"], terms:["Journey Analytics"] },
  { id:"DP15", name:"Activation Audience & NBA Decisions", domain:"DM8",
    desc:"Activation-ready audiences and next-best-action decisions surfaced to channels, RMs and advisors.",
    cdp:["CDP7"], ai:["U01","U05","U08","U14","U17"], terms:["Next Best Action","Activation"] },
  { id:"DP16", name:"Attribution & Marketing ROI", domain:"DM8",
    desc:"Attributed outcomes, marketing ROI and experiment lift for accountability.",
    cdp:["CDP8"], ai:["U07","U13","U18"], terms:["Attribution","Marketing ROI"] },
  { id:"DP17", name:"Data Quality & Lineage", domain:"DM9",
    desc:"Provenance, match confidence, quality scores, masking and audit across every product.",
    cdp:["CDP8"], ai:["U15","U16","U18"], terms:["Data Quality","Lineage"] }
];
/* chain step 10 + catalog page registration */
window.PACK_CONFIG.chain.push({ key:"dp", label:"Data Products" });
(function(){
  var p = window.PACK_CONFIG.pages;
  if(!p.some(function(x){return x.file==="data_products.html";})){
    var i = p.findIndex(function(x){return x.file==="hyperpersonalisation_cdp.html";});
    p.splice((i>=0?i+1:p.length),0,{file:"data_products.html", nav:"Data Products", title:"Data Products"});
  }
})();

/* ============================================================================
   v5: Data Contracts — every element of a data contract, per data product.
   A shared default (SLA, terms, quality) + per-product specifics (purpose,
   sources, classification, schema fields). Consumers derive from the product's
   AI use-cases & CDP services; owner/steward from its domain.
   ========================================================================== */
window.GENERIC.contractDefaults = {
  sla:{ freshness:"Near-real-time to daily (per source)", availability:"99.5% monthly", latency:"< 15 min for streaming feeds", retention:"7 years (regulatory)", frequency:"Streaming / batch per source", support:"Domain data team · business hours" },
  terms:{ access:"Request via Data Catalog; approved by the domain owner", purposes:"Approved marketing personalisation & analytics only", restrictions:"No onward sharing; purpose-bound; masked in non-prod", consent:"Enforced against the Consent & Preference Ledger (DP08)" },
  quality:["Completeness ≥ agreed threshold per field","Validity against schema & reference data","Freshness within SLA","Uniqueness on the primary key"]
};
window.GENERIC.dataContracts = {
  DP01:{ purpose:"Provide the single resolved customer identity and relationships as the join key for all personalisation.",
    sources:["Core banking CIF","CRM","KYC / onboarding"], classification:"Confidential · PII",
    schema:[["partyId","string","pii"],["personName","string","pii"],["householdId","string",""],["businessId","string",""],["matchKey","string",""],["advisorId","string",""],["relationshipType","string",""]],
    extraQuality:["Match confidence ≥ 0.95 for auto-merge"] },
  DP02:{ purpose:"Unified customer view for targeting, treatment selection and journey context.",
    sources:["CIF","CRM","CDP","Servicing"], classification:"Confidential · PII",
    schema:[["partyId","string","pii"],["segment","string",""],["tenureMonths","int",""],["productCount","int",""],["lastInteractionTs","timestamp",""],["journeyStage","string",""],["churnRisk","decimal",""],["clv","decimal",""]] },
  DP03:{ purpose:"Products and services currently held per customer, with tenure and balances.",
    sources:["Core banking","Cards","Lending"], classification:"Confidential",
    schema:[["partyId","string","pii"],["productId","string",""],["productType","string",""],["openedDate","date",""],["balance","decimal",""],["status","string",""]] },
  DP04:{ purpose:"Available offers with product, affordability and eligibility rules.",
    sources:["Product","Pricing","Risk"], classification:"Internal",
    schema:[["offerId","string",""],["productType","string",""],["eligibilityRule","string",""],["affordabilityRule","string",""],["validFrom","date",""],["validTo","date",""]] },
  DP05:{ purpose:"Real-time digital and behavioural events for triggers and context.",
    sources:["Mobile app","Web","Contact centre"], classification:"Confidential · PII",
    schema:[["eventId","string",""],["partyId","string","pii"],["eventType","string",""],["channel","string",""],["eventTs","timestamp",""],["context","json",""]],
    slaOverride:{ freshness:"Real-time (< 5s)", latency:"< 5s" } },
  DP06:{ purpose:"Transaction behaviour feeding propensity, churn, CLV and affordability.",
    sources:["Core banking","Cards","Payments"], classification:"Confidential · PII",
    schema:[["txnId","string",""],["partyId","string","pii"],["amount","decimal",""],["currency","string",""],["mcc","string",""],["txnTs","timestamp",""]] },
  DP07:{ purpose:"Current lifecycle stage and journey context per customer.",
    sources:["CDP","Journey orchestration"], classification:"Confidential",
    schema:[["partyId","string","pii"],["journeyId","string",""],["stage","string",""],["enteredTs","timestamp",""],["nextBestAction","string",""]] },
  DP08:{ purpose:"Authoritative consent, purpose and channel permissions, with opt-out enforcement.",
    sources:["Preference centre","Privacy platform"], classification:"Confidential · PII · Sensitive",
    schema:[["partyId","string","pii"],["purpose","string",""],["channel","string",""],["consentStatus","string",""],["consentTs","timestamp",""],["expiryTs","timestamp",""]],
    extraQuality:["Consent basis present for every downstream purpose","Opt-out propagated within 1 hour"] },
  DP09:{ purpose:"Risk, affordability, eligibility and vulnerability signals.",
    sources:["Risk engine","Credit bureau","Fraud"], classification:"Confidential · Sensitive",
    schema:[["partyId","string","pii"],["riskRating","string",""],["affordabilityScore","decimal",""],["vulnerabilityFlag","boolean",""],["eligibilityFlags","json",""]] },
  DP10:{ purpose:"Governed, reusable model features with explainability attributes.",
    sources:["Feature pipelines"], classification:"Confidential",
    schema:[["partyId","string","pii"],["featureName","string",""],["featureValue","decimal",""],["asOfTs","timestamp",""],["version","string",""]] },
  DP11:{ purpose:"Published propensity, churn, CLV and next-best-action model scores.",
    sources:["Model serving"], classification:"Confidential",
    schema:[["partyId","string","pii"],["modelId","string",""],["score","decimal",""],["scoredTs","timestamp",""],["explanation","json",""]],
    extraQuality:["Model version & drift status attached to every score"] },
  DP12:{ purpose:"Lifecycle and ML segments and activation-ready audiences with eligibility.",
    sources:["Segmentation engine","CDP"], classification:"Confidential",
    schema:[["audienceId","string",""],["partyId","string","pii"],["segment","string",""],["eligibility","boolean",""],["refreshedTs","timestamp",""]] },
  DP13:{ purpose:"Complaints, surveys, sentiment and service interactions.",
    sources:["Complaints","Survey","Contact centre"], classification:"Confidential · Sensitive",
    schema:[["interactionId","string",""],["partyId","string","pii"],["channel","string",""],["sentiment","decimal",""],["topic","string",""],["createdTs","timestamp",""]] },
  DP14:{ purpose:"Drop-off, pathing and journey KPIs for the improvement backlog.",
    sources:["Journey analytics"], classification:"Internal",
    schema:[["journeyId","string",""],["stage","string",""],["dropoffRate","decimal",""],["npsScore","decimal",""],["periodStart","date",""]] },
  DP15:{ purpose:"Activation-ready audiences and next-best-action decisions surfaced to channels, RMs and advisors.",
    sources:["Decisioning","CDP activation"], classification:"Confidential · PII",
    schema:[["decisionId","string",""],["partyId","string","pii"],["action","string",""],["channel","string",""],["treatmentId","string",""],["decidedTs","timestamp",""],["consentChecked","boolean",""]],
    extraQuality:["Consent & contact policy checked on every decision"] },
  DP16:{ purpose:"Attributed outcomes, marketing ROI and experiment lift for accountability.",
    sources:["Campaign","Finance","Web analytics"], classification:"Internal",
    schema:[["campaignId","string",""],["partyId","string","pii"],["touchType","string",""],["conversionFlag","boolean",""],["attributedValue","decimal",""],["periodStart","date",""]] },
  DP17:{ purpose:"Provenance, quality scores, lineage and audit across every product.",
    sources:["Catalog","Quality engine","Lineage"], classification:"Internal",
    schema:[["productId","string",""],["qualityScore","decimal",""],["lineageRef","string",""],["lastProfiledTs","timestamp",""],["issuesOpen","int",""]] }
};

/* navigation graph page registration (v5) */
(function(){ var p=window.PACK_CONFIG.pages;
  if(!p.some(function(x){return x.file==="navigation_graph.html";})){
    var i=p.findIndex(function(x){return x.file==="architecture_navigator.html";});
    p.splice((i>=0?i+1:1),0,{file:"navigation_graph.html", nav:"Graph", title:"Navigation Graph"});
  }
})();

/* ============================================================================
   v6: AI Agents, Semantic Models — the automation layer under AI Use-Cases.
   Hierarchy (Howard): Value-Stream Stage → KPI + required Capabilities;
   Capability → Business Process → Decision; Process/Decision automated by
   AI Use-Cases → AI Agents; AI Agents require Data Products + Semantic Models
   and Human-in-the-Loop for crucial / high-risk decisions.
   ========================================================================== */
window.GENERIC.semanticModels = [
  { id:"SM1", name:"Customer Semantic Model",           def:"Party, customer 360, household and relationship meaning.", terms:["Party","Customer 360","Beneficial Owner (UBO)"] },
  { id:"SM2", name:"Consent & Preference Semantic Model",def:"Consent, purpose, channel and preference semantics.",     terms:["Consent Basis","Preference Management"] },
  { id:"SM3", name:"Product & Offer Semantic Model",     def:"Product, holding, offer and eligibility meaning.",         terms:["Product Holding","Offer","Eligibility"] },
  { id:"SM4", name:"Campaign & Attribution Semantic Model",def:"Campaign, touch, attribution and ROI meaning.",         terms:["Attribution","Marketing ROI"] },
  { id:"SM5", name:"Journey & Experience Semantic Model",def:"Journey, stage, moment-of-truth and experience meaning.", terms:["Journey State","Moment of Truth","CSAT"] },
  { id:"SM6", name:"Responsible-AI Semantic Model",      def:"Fairness, explainability, risk and oversight meaning.",    terms:["Fairness Testing","Explainability"] },
  { id:"SM7", name:"Brand & Content Semantic Model",     def:"Brand, content, claim and disclosure meaning.",           terms:["GenAI","Content Approval"] }
];
window.GENERIC.aiAgents = [
  { id:"AG01", name:"Next-Best-Action Decisioning Agent", def:"Selects and sequences the best action per customer in real time.",
    useCases:["U01","U14"], dataProducts:["DP01","DP02","DP11","DP15"], semanticModels:["SM1","SM2","SM3"],
    hitl:true, hitlReason:"High-value and relationship treatment decisions are confirmed by an RM / advisor." },
  { id:"AG02", name:"Propensity & CLV Scoring Agent", def:"Produces propensity, churn and CLV scores as governed products.",
    useCases:["U02","U03","U04"], dataProducts:["DP06","DP10","DP11"], semanticModels:["SM1","SM3"], hitl:false },
  { id:"AG03", name:"Content Generation Agent", def:"Drafts copy, variants and creative at scale.",
    useCases:["U05","U06"], dataProducts:["DP08","DP02"], semanticModels:["SM7","SM2"],
    hitl:true, hitlReason:"Brand, claims and disclosure are reviewed by a human before publication." },
  { id:"AG04", name:"Campaign Optimisation Agent", def:"Allocates spend, channel and timing to maximise ROI.",
    useCases:["U07","U08","U18"], dataProducts:["DP16","DP05","DP12"], semanticModels:["SM4"], hitl:false },
  { id:"AG05", name:"Lead Routing Agent", def:"Scores and routes leads to the right owner with SLA.",
    useCases:["U09"], dataProducts:["DP01","DP11"], semanticModels:["SM1"], hitl:false },
  { id:"AG06", name:"Journey Insight Agent", def:"Detects drop-off, mines sentiment and feeds the backlog.",
    useCases:["U10","U11"], dataProducts:["DP14","DP13"], semanticModels:["SM5"], hitl:false },
  { id:"AG07", name:"Segmentation & Experiment Agent", def:"Builds micro-segments and runs experiments.",
    useCases:["U12","U13"], dataProducts:["DP12","DP10"], semanticModels:["SM1"], hitl:false },
  { id:"AG08", name:"Consent & Fairness Guardrail Agent", def:"Enforces consent and monitors fairness / bias.",
    useCases:["U15","U16"], dataProducts:["DP08","DP17"], semanticModels:["SM2","SM6"],
    hitl:true, hitlReason:"Fairness, consent and compliance are regulated, high-risk decisions requiring human sign-off." },
  { id:"AG09", name:"Financial-Wellness Nudge Agent", def:"Serves proactive, non-sales life-event and wellness nudges.",
    useCases:["U17"], dataProducts:["DP07","DP09"], semanticModels:["SM1","SM2"],
    hitl:true, hitlReason:"Vulnerable-customer and life-event nudges require human oversight." }
];

/* Process → Decision(s) map (a business process invokes these decisions) */
window.GENERIC.processDecisions = {
  P1:["D1","D2"], P2:["D1","D5"], P3:["D2","D4","D9","DX2"], P4:["D3","D6","D9"],
  P5:["D8","D7"], P6:["D4","D5"], P7:["D7","DX6","DX3"], P8:["D10"],
  PX1:["DX1"], PX2:["DX1"], PX3:["DX1"], PX4:["DX2","DX3","DX4","DX5"],
  PX5:["D1"], PX6:["DX7","DX6"], PX7:["DX1"], PX8:["D5","DX5"]
};

/* ============================================================================
   v7: Model Export / Import page (complete hierarchy to Excel, one sheet per
   level, and Excel → live "Imported" source). Registered last in the nav.
   ========================================================================== */
(function(){ var p=window.PACK_CONFIG.pages;
  if(!p.some(function(x){return x.file==="model_export_import.html";})){
    var i=p.findIndex(function(x){return x.file==="glossary_settings.html";});
    p.splice((i>=0?i:p.length),0,{file:"model_export_import.html", nav:"Model I/O", title:"Model Export / Import"});
  }
})();

/* ============================================================================
   v8: FUTURE-STATE data elements (from the 97-sheet Nedbank_FutureState_Model).
   Personas, Value Streams / Value Stages, Business Outcomes, KPI detail,
   Customer Experience Journeys, Ownership Roles, journey meta, and the
   journey-stage -> value-stage mapping. Loaded app-wide; the Customer Journey
   page renders the new CJ information. (Navigator/Graph rewire follows.)
   ========================================================================== */
window.GENERIC.personas = [{"id": "PER-RET-01", "stakeholderId": "SH01", "segment": "Retail", "name": "Everyday retail customer / young professional", "desc": "Individual seeking simple, trusted, convenient banking", "journeys": ["CJ-RET-01"]}, {"id": "PER-COM-01", "stakeholderId": "SH01", "segment": "Commercial", "name": "Growing SME owner / corporate treasurer", "desc": "Business customer seeking cash-flow, payments and lending support", "journeys": ["CJ-COM-01"]}, {"id": "PER-WEA-01", "stakeholderId": "SH01", "segment": "Wealth", "name": "Affluent / HNW individual or family client", "desc": "Client seeking advice, planning and relationship trust", "journeys": ["CJ-WEA-01"]}, {"id": "PER-TRD-01", "stakeholderId": "SH01", "segment": "Trade Finance", "name": "Importer / exporter", "desc": "Trade client seeking payment assurance and working-capital support", "journeys": ["CJ-TRD-01"]}, {"id": "PER-SAL-01", "stakeholderId": "SH02", "segment": "Internal", "name": "Relationship manager / advisor", "desc": "Needs qualified opportunities and next-best-action prompts", "journeys": ["CJ-SAL-01"]}, {"id": "PER-PRD-01", "stakeholderId": "SH03", "segment": "Internal", "name": "Product & proposition manager", "desc": "Shapes propositions from insight and evidence", "journeys": ["CJ-PRD-01"]}, {"id": "PER-CHN-01", "stakeholderId": "SH04", "segment": "Internal", "name": "Channel / digital experience owner", "desc": "Delivers consistent experience across channels", "journeys": ["CJ-CHN-01"]}, {"id": "PER-MKT-01", "stakeholderId": "SH05", "segment": "Internal", "name": "Marketing planner / campaign manager", "desc": "Plans, runs and proves marketing activity", "journeys": ["CJ-MKT-01"]}, {"id": "PER-OPS-01", "stakeholderId": "SH06", "segment": "Internal", "name": "Operations / fulfilment officer", "desc": "Fulfils requests right-first-time at low cost-to-serve", "journeys": ["CJ-OPS-01"]}, {"id": "PER-GOV-01", "stakeholderId": "SH07", "segment": "Internal", "name": "Risk / compliance / privacy officer", "desc": "Clears and monitors responsible treatment", "journeys": ["CJ-GOV-01"]}, {"id": "PER-FIN-01", "stakeholderId": "SH08", "segment": "Internal", "name": "Marketing executive / finance partner", "desc": "Sets targets, allocates budget, proves value", "journeys": ["CJ-FIN-01"]}, {"id": "PER-DAT-01", "stakeholderId": "SH09", "segment": "Internal", "name": "Data / analytics / AI steward", "desc": "Publishes governed data products and decision models", "journeys": ["CJ-DAT-01"]}, {"id": "PER-PAR-01", "stakeholderId": "SH10", "segment": "External", "name": "Partner / intermediary manager", "desc": "Runs governed co-marketing and referral", "journeys": ["CJ-PAR-01"]}, {"id": "PER-REG-01", "stakeholderId": "SH11", "segment": "External", "name": "Regulator / society representative", "desc": "Requires transparent, responsible, compliant marketing", "journeys": ["CJ-REG-01"]}];
window.GENERIC.valueStreams = [{"id": "VS01", "name": "Develop Customer Relationship", "trigger": "SH01", "desc": "Creates and grows a trusted banking relationship across lifecycle stages", "expectedValue": "Activated, deepened, retained and advocacy-generating relationship", "vp": "VP01"}, {"id": "VS02", "name": "Enable Relationship-Led Sales", "trigger": "SH02", "desc": "Equips RMs, advisors and sales teams with insight-led opportunities", "expectedValue": "Better-qualified conversations and stronger conversion", "vp": "VP02"}, {"id": "VS03", "name": "Shape Products & Propositions", "trigger": "SH03", "desc": "Turns market and customer insight into governed propositions and offers", "expectedValue": "Relevant, evidence-led propositions in market", "vp": "VP03"}, {"id": "VS04", "name": "Orchestrate Channel Experience", "trigger": "SH04", "desc": "Delivers a consistent, personalised experience across every channel", "expectedValue": "Coherent cross-channel experience", "vp": "VP08"}, {"id": "VS05", "name": "Plan & Run Marketing", "trigger": "SH05", "desc": "Plans, executes and learns from marketing activity", "expectedValue": "Effective, measurable marketing activity", "vp": "VP09"}, {"id": "VS06", "name": "Fulfil & Service Requests", "trigger": "SH06", "desc": "Fulfils and services customer requests reliably and efficiently", "expectedValue": "Right-first-time fulfilment at low cost-to-serve", "vp": "VP10"}, {"id": "VS07", "name": "Govern Responsible Marketing Treatment", "trigger": "SH07", "desc": "Ensures marketing treatment is compliant, explainable and consent-aware", "expectedValue": "Controlled, auditable and responsible growth", "vp": "VP04"}, {"id": "VS08", "name": "Steer Marketing Value & Investment", "trigger": "SH08", "desc": "Sets targets, allocates investment and proves marketing contribution", "expectedValue": "Value-based, accountable marketing investment", "vp": "VP05"}, {"id": "VS09", "name": "Provide Governed Data & Decisioning", "trigger": "SH09", "desc": "Publishes governed data products and serves decision models", "expectedValue": "Trusted data and decisioning at point of need", "vp": "VP11"}, {"id": "VS10", "name": "Manage Partner & Intermediary Value", "trigger": "SH10", "desc": "Onboards, enables and governs partners and intermediaries", "expectedValue": "Compliant, productive partner value", "vp": "VP06"}, {"id": "VS11", "name": "Assure Compliance & Transparency", "trigger": "SH11", "desc": "Interprets obligations, evidences compliance and discloses transparently", "expectedValue": "Demonstrable, transparent compliance", "vp": "VP07"}];
window.GENERIC.valueStages = [{"id": "VS01-01", "vs": "VS01", "seq": 1, "name": "Attract Relationship", "entrance": "Stakeholder has a need or trigger", "exit": "Prospect engages or expresses intent", "valueItem": "Relevant opportunity identified", "primaryKPI": "Qualified leads", "caps": ["C4", "C2"]}, {"id": "VS01-02", "vs": "VS01", "seq": 2, "name": "Initiate Relationship", "entrance": "Prospect expresses intent", "exit": "Identity/KYC path started", "valueItem": "Relationship initiation enabled", "primaryKPI": "Conversion rate", "caps": ["C5", "C8"]}, {"id": "VS01-03", "vs": "VS01", "seq": 3, "name": "Activate Relationship", "entrance": "Product/service opened", "exit": "Customer starts using service", "valueItem": "Active relationship created", "primaryKPI": "Digital onboarding completion", "caps": ["C8", "C14"]}, {"id": "VS01-04", "vs": "VS01", "seq": 4, "name": "Deepen Relationship", "entrance": "Usage / need signals exist", "exit": "Additional value accepted", "valueItem": "Relationship value increased", "primaryKPI": "Cross-sell conversion", "caps": ["C13", "C3"]}, {"id": "VS01-05", "vs": "VS01", "seq": 5, "name": "Retain Relationship", "entrance": "Attrition or renewal context exists", "exit": "Retention path completed", "valueItem": "Relationship protected", "primaryKPI": "Retention", "caps": ["C16", "C15"]}, {"id": "VS01-06", "vs": "VS01", "seq": 6, "name": "Build Advocacy", "entrance": "Customer has positive experience", "exit": "Referral / review / community action", "valueItem": "Advocacy generated", "primaryKPI": "Referral rate", "caps": ["C11", "C6"]}, {"id": "VS02-01", "vs": "VS02", "seq": 1, "name": "Identify Opportunity", "entrance": "Trigger / signal exists", "exit": "Opportunity qualified", "valueItem": "Opportunity surfaced", "primaryKPI": "Qualified leads", "caps": ["C5", "C2"]}, {"id": "VS02-02", "vs": "VS02", "seq": 2, "name": "Equip Conversation", "entrance": "Opportunity assigned", "exit": "RM briefed with insight", "valueItem": "Insight-led conversation", "primaryKPI": "RM follow-up completion", "caps": ["C5", "C7"]}, {"id": "VS02-03", "vs": "VS02", "seq": 3, "name": "Convert & Handover", "entrance": "Conversation held", "exit": "Outcome captured", "valueItem": "Conversion recorded", "primaryKPI": "Conversion rate", "caps": ["C5", "C10"]}, {"id": "VS03-01", "vs": "VS03", "seq": 1, "name": "Sense Demand", "entrance": "Market / insight input", "exit": "Need validated", "valueItem": "Demand understood", "primaryKPI": "Consideration", "caps": ["C2", "C15"]}, {"id": "VS03-02", "vs": "VS03", "seq": 2, "name": "Design Proposition", "entrance": "Demand validated", "exit": "Proposition approved", "valueItem": "CVP defined", "primaryKPI": "Product penetration", "caps": ["C3", "C1"]}, {"id": "VS03-03", "vs": "VS03", "seq": 3, "name": "Launch & Price", "entrance": "Proposition approved", "exit": "Offer live", "valueItem": "Offer available", "primaryKPI": "Cross-sell conversion", "caps": ["C3", "C4"]}, {"id": "VS04-01", "vs": "VS04", "seq": 1, "name": "Plan Experience", "entrance": "Journey / persona input", "exit": "Experience blueprint ready", "valueItem": "Consistent design", "primaryKPI": "Digital engagement", "caps": ["C11", "C12"]}, {"id": "VS04-02", "vs": "VS04", "seq": 2, "name": "Deliver Touchpoint", "entrance": "Blueprint ready", "exit": "Touchpoint served", "valueItem": "Relevant experience", "primaryKPI": "NPS / CSAT", "caps": ["C13", "C4"]}, {"id": "VS04-03", "vs": "VS04", "seq": 3, "name": "Optimise Channel", "entrance": "Experience data available", "exit": "Improvement shipped", "valueItem": "Friction reduced", "primaryKPI": "Journey drop-off", "caps": ["C10", "C17"]}, {"id": "VS05-01", "vs": "VS05", "seq": 1, "name": "Plan Campaign", "entrance": "Objective / budget set", "exit": "Brief approved", "valueItem": "Plan agreed", "primaryKPI": "Campaign response", "caps": ["C1", "C4"]}, {"id": "VS05-02", "vs": "VS05", "seq": 2, "name": "Execute Campaign", "entrance": "Brief approved", "exit": "Campaign live", "valueItem": "Activity delivered", "primaryKPI": "Digital engagement", "caps": ["C4", "C7"]}, {"id": "VS05-03", "vs": "VS05", "seq": 3, "name": "Measure & Learn", "entrance": "Campaign complete", "exit": "Insights captured", "valueItem": "Learning applied", "primaryKPI": "Marketing ROI", "caps": ["C10", "C17"]}, {"id": "VS06-01", "vs": "VS06", "seq": 1, "name": "Receive Request", "entrance": "Customer request made", "exit": "Request logged", "valueItem": "Demand captured", "primaryKPI": "Application/document turnaround", "caps": ["C9", "C8"]}, {"id": "VS06-02", "vs": "VS06", "seq": 2, "name": "Fulfil Request", "entrance": "Request logged", "exit": "Request completed", "valueItem": "Service delivered", "primaryKPI": "SLA adherence", "caps": ["C9", "C8"]}, {"id": "VS06-03", "vs": "VS06", "seq": 3, "name": "Resolve & Recover", "entrance": "Issue raised", "exit": "Issue resolved", "valueItem": "Trust preserved", "primaryKPI": "Complaint rate", "caps": ["C11", "C9"]}, {"id": "VS07-01", "vs": "VS07", "seq": 1, "name": "Set Guardrails", "entrance": "Policy / regulation input", "exit": "Controls defined", "valueItem": "Compliant framework", "primaryKPI": "Content compliance pass rate", "caps": ["C8", "C1"]}, {"id": "VS07-02", "vs": "VS07", "seq": 2, "name": "Screen Treatment", "entrance": "Treatment proposed", "exit": "Treatment cleared", "valueItem": "Responsible treatment", "primaryKPI": "Consent opt-in rate", "caps": ["C8", "C13"]}, {"id": "VS07-03", "vs": "VS07", "seq": 3, "name": "Monitor & Assure", "entrance": "Treatment live", "exit": "Assurance evidenced", "valueItem": "Auditable growth", "primaryKPI": "Compliance escalation rate", "caps": ["C8", "C17"]}, {"id": "VS08-01", "vs": "VS08", "seq": 1, "name": "Set Targets", "entrance": "Strategy / plan input", "exit": "Targets agreed", "valueItem": "Direction set", "primaryKPI": "Marketing ROI", "caps": ["C1", "C10"]}, {"id": "VS08-02", "vs": "VS08", "seq": 2, "name": "Allocate Investment", "entrance": "Targets agreed", "exit": "Budget allocated", "valueItem": "Value-based allocation", "primaryKPI": "CAC", "caps": ["C1", "C16"]}, {"id": "VS08-03", "vs": "VS08", "seq": 3, "name": "Prove Contribution", "entrance": "Activity delivered", "exit": "Contribution reported", "valueItem": "Value demonstrated", "primaryKPI": "Attributed revenue", "caps": ["C10", "C16"]}, {"id": "VS09-01", "vs": "VS09", "seq": 1, "name": "Govern Data", "entrance": "Demand for data", "exit": "Data product published", "valueItem": "Governed supply", "primaryKPI": "Consent opt-in rate", "caps": ["C7", "C14"]}, {"id": "VS09-02", "vs": "VS09", "seq": 2, "name": "Serve Decisioning", "entrance": "Data product available", "exit": "Decision / model served", "valueItem": "Decisioning enabled", "primaryKPI": "Experiment lift", "caps": ["C7", "C13"]}, {"id": "VS09-03", "vs": "VS09", "seq": 3, "name": "Assure Quality", "entrance": "Product in use", "exit": "Quality assured", "valueItem": "Trusted data", "primaryKPI": "Content compliance pass rate", "caps": ["C14", "C17"]}, {"id": "VS10-01", "vs": "VS10", "seq": 1, "name": "Onboard Partner", "entrance": "Partner need exists", "exit": "Partner enabled", "valueItem": "Partnership ready", "primaryKPI": "Qualified leads", "caps": ["C9", "C1"]}, {"id": "VS10-02", "vs": "VS10", "seq": 2, "name": "Enable Co-Marketing", "entrance": "Partner enabled", "exit": "Campaign co-run", "valueItem": "Joint value", "primaryKPI": "Campaign response", "caps": ["C9", "C4"]}, {"id": "VS10-03", "vs": "VS10", "seq": 3, "name": "Govern Performance", "entrance": "Activity delivered", "exit": "Performance reviewed", "valueItem": "Controlled value", "primaryKPI": "Compliance escalation rate", "caps": ["C9", "C8"]}, {"id": "VS11-01", "vs": "VS11", "seq": 1, "name": "Interpret Obligation", "entrance": "Regulation / change input", "exit": "Obligation mapped", "valueItem": "Clarity of duty", "primaryKPI": "Compliance escalation rate", "caps": ["C8", "C1"]}, {"id": "VS11-02", "vs": "VS11", "seq": 2, "name": "Evidence Compliance", "entrance": "Obligation mapped", "exit": "Evidence produced", "valueItem": "Demonstrable compliance", "primaryKPI": "Privacy complaints", "caps": ["C8", "C17"]}, {"id": "VS11-03", "vs": "VS11", "seq": 3, "name": "Report & Disclose", "entrance": "Evidence ready", "exit": "Disclosure made", "valueItem": "Transparency achieved", "primaryKPI": "Reputation sentiment", "caps": ["C8", "C6"]}];
window.GENERIC.kpiDetail = {"K01": {"name": "Qualified leads", "theme": "Acquisition & onboarding", "definition": "Prospects meeting qualification criteria and ready for engagement", "calculation": "Count of leads passing qualification rules", "unit": "count", "owner": "Marketing + Sales", "appliesTo": "Acquire"}, "K02": {"name": "Conversion rate", "theme": "Acquisition & onboarding", "definition": "Share of qualified prospects that convert to a relationship / product", "calculation": "Conversions ÷ qualified prospects × 100", "unit": "%", "owner": "Marketing + Sales", "appliesTo": "Acquire, Onboard"}, "K03": {"name": "Funded new accounts", "theme": "Acquisition & onboarding", "definition": "New accounts opened and funded within the period", "calculation": "Count of accounts with first funding event", "unit": "count", "owner": "Sales + Ops", "appliesTo": "Onboard"}, "K04": {"name": "Cost per acquired customer", "theme": "Acquisition & onboarding", "definition": "Marketing + sales cost to acquire one funded customer", "calculation": "Acquisition spend ÷ funded new customers", "unit": "currency", "owner": "Finance + Marketing", "appliesTo": "Acquire"}, "K05": {"name": "Digital onboarding completion", "theme": "Acquisition & onboarding", "definition": "Share of started digital onboardings completed straight-through", "calculation": "Completed ÷ started digital onboardings × 100", "unit": "%", "owner": "Digital + Ops", "appliesTo": "Onboard"}, "K06": {"name": "Lead-to-open cycle time", "theme": "Acquisition & onboarding", "definition": "Elapsed time from qualified lead to opened relationship", "calculation": "Median days from lead to account open", "unit": "days", "owner": "Sales + Ops", "appliesTo": "Onboard"}, "K07": {"name": "Product penetration", "theme": "Relationship growth & cross-sell", "definition": "Average number of products held per customer", "calculation": "Total product holdings ÷ customers", "unit": "ratio", "owner": "Product + RM", "appliesTo": "Grow"}, "K08": {"name": "Share of wallet", "theme": "Relationship growth & cross-sell", "definition": "Depth of the customer's financial relationship held by the bank", "calculation": "Bank balances ÷ estimated total wallet × 100", "unit": "%", "owner": "Product + RM", "appliesTo": "Grow"}, "K09": {"name": "Deposit/loan balance growth", "theme": "Relationship growth & cross-sell", "definition": "Period-on-period growth in deposit and loan balances", "calculation": "(End − start balances) ÷ start × 100", "unit": "%", "owner": "Finance + Product", "appliesTo": "Grow"}, "K10": {"name": "Fee income", "theme": "Relationship growth & cross-sell", "definition": "Fee and commission income attributable to the relationship", "calculation": "Sum of fee revenue in period", "unit": "currency", "owner": "Finance", "appliesTo": "Grow"}, "K11": {"name": "Primary-bank indicator", "theme": "Relationship growth & cross-sell", "definition": "Share of customers for whom the bank is the primary bank", "calculation": "Primary-bank customers ÷ total × 100", "unit": "%", "owner": "Marketing + Data", "appliesTo": "Grow, Retain"}, "K12": {"name": "Cross-sell conversion", "theme": "Relationship growth & cross-sell", "definition": "Share of cross-sell offers accepted", "calculation": "Accepted offers ÷ offers made × 100", "unit": "%", "owner": "Marketing + Sales", "appliesTo": "Grow"}, "K13": {"name": "Campaign response", "theme": "Engagement & experience", "definition": "Share of targeted customers responding to a campaign", "calculation": "Responders ÷ targeted × 100", "unit": "%", "owner": "Marketing", "appliesTo": "Grow"}, "K14": {"name": "Digital engagement", "theme": "Engagement & experience", "definition": "Level of active engagement across digital channels", "calculation": "Active digital users ÷ eligible × 100", "unit": "%", "owner": "Digital", "appliesTo": "Serve, Grow"}, "K15": {"name": "Event/webinar attendance", "theme": "Engagement & experience", "definition": "Attendance at marketing events and webinars", "calculation": "Attendees ÷ registrations × 100", "unit": "%", "owner": "Marketing", "appliesTo": "Serve"}, "K16": {"name": "RM follow-up completion", "theme": "Engagement & experience", "definition": "Share of RM next-best-action prompts actioned", "calculation": "Completed follow-ups ÷ prompts × 100", "unit": "%", "owner": "Sales", "appliesTo": "Serve, Grow"}, "K17": {"name": "NPS / CSAT", "theme": "Engagement & experience", "definition": "Customer perception and satisfaction across journeys", "calculation": "Standard NPS / CSAT survey scoring", "unit": "score", "owner": "CX Office", "appliesTo": "Serve, Retain"}, "K18": {"name": "Complaint rate", "theme": "Engagement & experience", "definition": "Complaints raised relative to active customers", "calculation": "Complaints ÷ active customers × 1000", "unit": "per 1k", "owner": "CX + Ops", "appliesTo": "Serve"}, "K19": {"name": "Journey drop-off", "theme": "Engagement & experience", "definition": "Share of customers abandoning a journey before completion", "calculation": "Drop-offs ÷ journey entries × 100", "unit": "%", "owner": "CX / Journey Owner", "appliesTo": "Serve"}, "K20": {"name": "AUM growth", "theme": "Wealth relationship value", "definition": "Growth in assets under management for advisory relationships", "calculation": "(End − start AUM) ÷ start × 100", "unit": "%", "owner": "Wealth + Finance", "appliesTo": "Grow"}, "K21": {"name": "Net new money", "theme": "Wealth relationship value", "definition": "Net inflow of client money in the period", "calculation": "Inflows − outflows", "unit": "currency", "owner": "Wealth", "appliesTo": "Grow"}, "K22": {"name": "Advisory meeting conversion", "theme": "Wealth relationship value", "definition": "Share of advisory meetings leading to an accepted recommendation", "calculation": "Accepted recommendations ÷ meetings × 100", "unit": "%", "owner": "Wealth", "appliesTo": "Grow"}, "K23": {"name": "Referral rate", "theme": "Wealth relationship value", "definition": "Share of customers generating a referral", "calculation": "Referring customers ÷ active × 100", "unit": "%", "owner": "Marketing + RM", "appliesTo": "Advocate"}, "K24": {"name": "Retention", "theme": "Wealth relationship value", "definition": "Share of customers retained over the period", "calculation": "Retained ÷ start-of-period customers × 100", "unit": "%", "owner": "CX + Product", "appliesTo": "Retain"}, "K25": {"name": "Trust / content engagement", "theme": "Wealth relationship value", "definition": "Engagement with trust-building content and communications", "calculation": "Engaged recipients ÷ reached × 100", "unit": "%", "owner": "Brand + Content", "appliesTo": "Serve, Advocate"}, "K26": {"name": "Trade leads", "theme": "Trade finance growth & service", "definition": "Qualified trade-finance opportunities identified", "calculation": "Count of qualified trade opportunities", "unit": "count", "owner": "Trade + Sales", "appliesTo": "Acquire"}, "K27": {"name": "Transaction volume", "theme": "Trade finance growth & service", "definition": "Volume of trade / payment transactions processed", "calculation": "Count of transactions in period", "unit": "count", "owner": "Trade + Ops", "appliesTo": "Grow"}, "K28": {"name": "Trade fee income", "theme": "Trade finance growth & service", "definition": "Fee income from trade-finance products", "calculation": "Sum of trade fee revenue", "unit": "currency", "owner": "Finance + Trade", "appliesTo": "Grow"}, "K29": {"name": "Application/document turnaround", "theme": "Trade finance growth & service", "definition": "Time to process a trade application or document set", "calculation": "Median hours from request to issuance", "unit": "hours", "owner": "Trade Ops", "appliesTo": "Serve"}, "K30": {"name": "SLA adherence", "theme": "Trade finance growth & service", "definition": "Share of requests fulfilled within agreed service levels", "calculation": "Within-SLA requests ÷ total × 100", "unit": "%", "owner": "Ops", "appliesTo": "Serve"}, "K31": {"name": "Compliance escalation rate", "theme": "Trade finance growth & service", "definition": "Rate of treatments escalated for compliance concern", "calculation": "Escalations ÷ treatments × 100", "unit": "%", "owner": "Risk & Compliance", "appliesTo": "Govern"}, "K32": {"name": "Brand awareness", "theme": "Brand & trust", "definition": "Share of target audience aware of the brand", "calculation": "Aware respondents ÷ surveyed × 100", "unit": "%", "owner": "Brand", "appliesTo": "Acquire"}, "K33": {"name": "Consideration", "theme": "Brand & trust", "definition": "Share of aware audience considering the bank", "calculation": "Considering ÷ aware × 100", "unit": "%", "owner": "Brand + Marketing", "appliesTo": "Acquire"}, "K34": {"name": "Reputation sentiment", "theme": "Brand & trust", "definition": "Net sentiment of brand mentions and coverage", "calculation": "(Positive − negative) ÷ total mentions × 100", "unit": "index", "owner": "Brand + Comms", "appliesTo": "Advocate"}, "K35": {"name": "Consent opt-in rate", "theme": "Brand & trust", "definition": "Share of customers with valid marketing consent", "calculation": "Consented ÷ contactable customers × 100", "unit": "%", "owner": "Privacy + Marketing", "appliesTo": "Govern"}, "K36": {"name": "Privacy complaints", "theme": "Brand & trust", "definition": "Privacy-related complaints raised", "calculation": "Count of privacy complaints", "unit": "count", "owner": "Privacy Office", "appliesTo": "Govern"}, "K37": {"name": "Content compliance pass rate", "theme": "Brand & trust", "definition": "Share of content passing compliance review first time", "calculation": "First-pass approvals ÷ submissions × 100", "unit": "%", "owner": "Risk + Content", "appliesTo": "Govern"}, "K38": {"name": "Marketing ROI", "theme": "Marketing performance", "definition": "Return on marketing investment", "calculation": "Attributed value ÷ marketing spend", "unit": "ratio", "owner": "Finance + Marketing", "appliesTo": "All"}, "K39": {"name": "Attributed revenue", "theme": "Marketing performance", "definition": "Revenue attributed to marketing activity", "calculation": "Sum of attributed conversions × value", "unit": "currency", "owner": "Finance + Data", "appliesTo": "Grow"}, "K40": {"name": "CAC", "theme": "Marketing performance", "definition": "Customer acquisition cost", "calculation": "Acquisition spend ÷ new customers", "unit": "currency", "owner": "Finance + Marketing", "appliesTo": "Acquire"}, "K41": {"name": "CLV", "theme": "Marketing performance", "definition": "Customer lifetime value contribution", "calculation": "Discounted expected margin over customer lifetime", "unit": "currency", "owner": "Finance + Marketing + Data", "appliesTo": "Acquire, Grow, Retain"}, "K42": {"name": "Experiment lift", "theme": "Marketing performance", "definition": "Incremental effect of a treatment vs control", "calculation": "(Treatment − control) ÷ control × 100", "unit": "%", "owner": "Data Science", "appliesTo": "Grow"}, "K43": {"name": "Campaign learning-cycle time", "theme": "Marketing performance", "definition": "Time to turn a campaign into a validated learning", "calculation": "Median days from launch to insight", "unit": "days", "owner": "Marketing + Data", "appliesTo": "All"}, "K44": {"name": "Reuse of approved assets", "theme": "Marketing performance", "definition": "Share of campaigns reusing pre-approved assets", "calculation": "Reused assets ÷ assets used × 100", "unit": "%", "owner": "Content + Ops", "appliesTo": "Govern"}};
window.GENERIC.kpiByName = {"Qualified leads": "K01", "Conversion rate": "K02", "Funded new accounts": "K03", "Cost per acquired customer": "K04", "Digital onboarding completion": "K05", "Lead-to-open cycle time": "K06", "Product penetration": "K07", "Share of wallet": "K08", "Deposit/loan balance growth": "K09", "Fee income": "K10", "Primary-bank indicator": "K11", "Cross-sell conversion": "K12", "Campaign response": "K13", "Digital engagement": "K14", "Event/webinar attendance": "K15", "RM follow-up completion": "K16", "NPS / CSAT": "K17", "Complaint rate": "K18", "Journey drop-off": "K19", "AUM growth": "K20", "Net new money": "K21", "Advisory meeting conversion": "K22", "Referral rate": "K23", "Retention": "K24", "Trust / content engagement": "K25", "Trade leads": "K26", "Transaction volume": "K27", "Trade fee income": "K28", "Application/document turnaround": "K29", "SLA adherence": "K30", "Compliance escalation rate": "K31", "Brand awareness": "K32", "Consideration": "K33", "Reputation sentiment": "K34", "Consent opt-in rate": "K35", "Privacy complaints": "K36", "Content compliance pass rate": "K37", "Marketing ROI": "K38", "Attributed revenue": "K39", "CAC": "K40", "CLV": "K41", "Experiment lift": "K42", "Campaign learning-cycle time": "K43", "Reuse of approved assets": "K44"};
window.GENERIC.businessOutcomes = [{"id": "BO01", "name": "Increase quality acquisition", "desc": "Acquire customers likely to activate and grow", "owner": "ROLE-CMO", "type": "Growth", "segment": "Retail/Commercial/Wealth/Trade", "horizon": "Annual", "kpis": [{"kpiId": "K02", "weight": 40}, {"kpiId": "K40", "weight": 30}, {"kpiId": "K01", "weight": 30}]}, {"id": "BO02", "name": "Increase customer lifetime value", "desc": "Grow discounted margin over the customer lifetime", "owner": "ROLE-FIN-CLV", "type": "Value", "segment": "All", "horizon": "Annual", "kpis": [{"kpiId": "K41", "weight": 60}, {"kpiId": "K24", "weight": 40}]}, {"id": "BO03", "name": "Increase relationship depth", "desc": "Grow products held and share of wallet", "owner": "ROLE-CMO", "type": "Growth", "segment": "All", "horizon": "Annual", "kpis": [{"kpiId": "K08", "weight": 50}, {"kpiId": "K12", "weight": 50}]}, {"id": "BO04", "name": "Improve customer experience", "desc": "Raise satisfaction and reduce friction across journeys", "owner": "ROLE-CXO", "type": "Experience", "segment": "All", "horizon": "Annual", "kpis": [{"kpiId": "K17", "weight": 60}, {"kpiId": "K19", "weight": 40}]}, {"id": "BO05", "name": "Increase trade revenue", "desc": "Grow trade volumes and fee income", "owner": "ROLE-CMO", "type": "Growth", "segment": "Trade Finance", "horizon": "Annual", "kpis": [{"kpiId": "K28", "weight": 100}]}];
window.GENERIC.cxJourneys = [{"id": "CX-RET-ONB-01", "crJourney": "CJ-RET-01", "name": "Retail digital onboarding experience", "focus": "Reduce onboarding friction", "moment": "ID/KYC upload and e-sign", "touchpoints": "Mobile app, branch assist, e-sign"}, {"id": "CX-RET-GRW-01", "crJourney": "CJ-RET-01", "name": "Retail personalised growth experience", "focus": "Relevant, timely next-best-offers", "moment": "In-app offer acceptance", "touchpoints": "Mobile app, email, contact centre"}, {"id": "CX-COM-ONB-01", "crJourney": "CJ-COM-01", "name": "Commercial onboarding experience", "focus": "Reduce KYB/KYC time-to-value", "moment": "KYB/KYC and mandate capture", "touchpoints": "RM, onboarding ops, digital business banking"}, {"id": "CX-WEA-ADV-01", "crJourney": "CJ-WEA-01", "name": "Wealth advisory trust experience", "focus": "Build confidence in advice", "moment": "Suitability/profile capture and proposal", "touchpoints": "Advisor, events, planning tools"}, {"id": "CX-WEA-SRV-01", "crJourney": "CJ-WEA-01", "name": "Wealth ongoing service experience", "focus": "Proactive, personal relationship service", "moment": "Portfolio review and life-event outreach", "touchpoints": "Advisor, portal, reviews"}, {"id": "CX-TRD-SRV-01", "crJourney": "CJ-TRD-01", "name": "Trade document servicing experience", "focus": "Improve turnaround and confidence", "moment": "LC/guarantee request and document presentation", "touchpoints": "RM, trade ops, document workflow"}];
window.GENERIC.ownershipRoles = [{"id": "ROLE-CMO", "name": "Marketing Executive / CMO", "accountableFor": "Marketing contribution to growth, retention and brand", "owns": "ValueProposition, Campaign processes", "collaborators": "CXO, Sales, Product, Finance"}, {"id": "ROLE-CXO", "name": "Customer Experience Officer / CX Lead", "accountableFor": "Experience strategy, journey governance, VoC, journey prioritisation", "owns": "CustomerExperienceJourney, JourneyStage, CX KPIs", "collaborators": "Marketing, Product, Digital, Ops, Data"}, {"id": "ROLE-JRN", "name": "Journey Owner", "accountableFor": "Ownership of specific customer journeys and their outcomes", "owns": "CustomerRelationshipJourney, JourneyStage", "collaborators": "CXO, Marketing, Ops"}, {"id": "ROLE-CDO", "name": "Chief Data Officer", "accountableFor": "Governed data products, domains and metadata", "owns": "DataDomain, DataProduct, SemanticModel", "collaborators": "Privacy, MarTech, Analytics"}, {"id": "ROLE-CDP-PO", "name": "CDP Product Owner", "accountableFor": "CDP services, identity, consent, Customer 360, lineage", "owns": "CDPService, DataProduct", "collaborators": "Data Office, Privacy, MarTech"}, {"id": "ROLE-DPO", "name": "Data Protection / Privacy Officer", "accountableFor": "Consent, privacy, lawful data use", "owns": "Consent & Preference, Privacy KPIs", "collaborators": "Legal, Risk, Marketing"}, {"id": "ROLE-RAI", "name": "Responsible AI Lead", "accountableFor": "Fairness, explainability, human-in-the-loop governance", "owns": "AIAgent HITL, Responsible-AI model", "collaborators": "Risk, Data Science, Legal"}, {"id": "ROLE-FIN-CLV", "name": "Finance CLV Owner", "accountableFor": "CLV method, profitability, value validation", "owns": "OutcomeKPI, CLV Management", "collaborators": "Marketing, Product, Data"}];
window.GENERIC.journeyMeta = {"CJ-RET-01": {"persona": "PER-RET-01", "vp": "VP01", "valueStream": "VS01", "developmentObjective": "Move from prospect to active primary-banking customer", "stageBackbone": "Acquire → Onboard → Serve → Grow → Retain → Advocate", "outcomes": ["BO01", "BO02", "BO03", "BO04"]}, "CJ-COM-01": {"persona": "PER-COM-01", "vp": "VP01", "valueStream": "VS01", "developmentObjective": "Move from prospect to productive business relationship", "stageBackbone": "Acquire → Onboard → Serve → Grow → Retain → Advocate", "outcomes": ["BO01", "BO02", "BO03", "BO04"]}, "CJ-WEA-01": {"persona": "PER-WEA-01", "vp": "VP01", "valueStream": "VS01", "developmentObjective": "Move from prospect to trusted advisory relationship", "stageBackbone": "Acquire → Onboard → Serve → Grow → Retain → Advocate", "outcomes": ["BO01", "BO02", "BO03", "BO04"]}, "CJ-TRD-01": {"persona": "PER-TRD-01", "vp": "VP01", "valueStream": "VS01", "developmentObjective": "Move from trade prospect to active transaction relationship", "stageBackbone": "Acquire → Onboard → Serve → Grow → Retain → Advocate", "outcomes": ["BO01", "BO02", "BO03", "BO04"]}, "CJ-SAL-01": {"persona": "PER-SAL-01", "vp": "VP02", "valueStream": "VS02", "developmentObjective": "Convert qualified opportunities efficiently", "stageBackbone": "Trigger / signal exists → Opportunity assigned → Conversation held", "outcomes": ["BO01"]}, "CJ-PRD-01": {"persona": "PER-PRD-01", "vp": "VP03", "valueStream": "VS03", "developmentObjective": "Bring evidence-led propositions to market", "stageBackbone": "Market / insight input → Demand validated → Proposition approved", "outcomes": ["BO03"]}, "CJ-CHN-01": {"persona": "PER-CHN-01", "vp": "VP08", "valueStream": "VS04", "developmentObjective": "Make the experience consistent across channels", "stageBackbone": "Journey / persona input → Blueprint ready → Experience data available", "outcomes": []}, "CJ-MKT-01": {"persona": "PER-MKT-01", "vp": "VP09", "valueStream": "VS05", "developmentObjective": "Run measurable, compliant campaigns", "stageBackbone": "Objective / budget set → Brief approved → Campaign complete", "outcomes": []}, "CJ-OPS-01": {"persona": "PER-OPS-01", "vp": "VP10", "valueStream": "VS06", "developmentObjective": "Fulfil requests right-first-time", "stageBackbone": "Customer request made → Request logged → Issue raised", "outcomes": []}, "CJ-GOV-01": {"persona": "PER-GOV-01", "vp": "VP04", "valueStream": "VS07", "developmentObjective": "Keep treatment responsible and auditable", "stageBackbone": "Policy / regulation input → Treatment proposed → Treatment live", "outcomes": []}, "CJ-FIN-01": {"persona": "PER-FIN-01", "vp": "VP05", "valueStream": "VS08", "developmentObjective": "Direct investment to the highest value", "stageBackbone": "Strategy / plan input → Targets agreed → Activity delivered", "outcomes": ["BO02"]}, "CJ-DAT-01": {"persona": "PER-DAT-01", "vp": "VP11", "valueStream": "VS09", "developmentObjective": "Supply trusted governed data & decisions", "stageBackbone": "Demand for data → Data product available → Product in use", "outcomes": []}, "CJ-PAR-01": {"persona": "PER-PAR-01", "vp": "VP06", "valueStream": "VS10", "developmentObjective": "Grow compliant partner value", "stageBackbone": "Partner need exists → Partner enabled → Activity delivered", "outcomes": []}, "CJ-REG-01": {"persona": "PER-REG-01", "vp": "VP07", "valueStream": "VS11", "developmentObjective": "Demonstrate transparent compliance", "stageBackbone": "Regulation / change input → Obligation mapped → Evidence ready", "outcomes": []}};
window.GENERIC.journeyStageValueStage = {"JS-RET-01-01": "VS01-01", "JS-RET-01-02": "VS01-02", "JS-RET-01-03": "VS01-03", "JS-RET-01-04": "VS01-04", "JS-RET-01-05": "VS01-05", "JS-RET-01-06": "VS01-06", "JS-COM-01-01": "VS01-01", "JS-COM-01-02": "VS01-02", "JS-COM-01-03": "VS01-03", "JS-COM-01-04": "VS01-04", "JS-COM-01-05": "VS01-05", "JS-COM-01-06": "VS01-06", "JS-WEA-01-01": "VS01-01", "JS-WEA-01-02": "VS01-02", "JS-WEA-01-03": "VS01-03", "JS-WEA-01-04": "VS01-04", "JS-WEA-01-05": "VS01-05", "JS-WEA-01-06": "VS01-06", "JS-TRD-01-01": "VS01-01", "JS-TRD-01-02": "VS01-02", "JS-TRD-01-03": "VS01-03", "JS-TRD-01-04": "VS01-04", "JS-TRD-01-05": "VS01-05", "JS-TRD-01-06": "VS01-06", "JS-SAL-01-01": "VS02-01", "JS-SAL-01-02": "VS02-02", "JS-SAL-01-03": "VS02-03", "JS-PRD-01-01": "VS03-01", "JS-PRD-01-02": "VS03-02", "JS-PRD-01-03": "VS03-03", "JS-CHN-01-01": "VS04-01", "JS-CHN-01-02": "VS04-02", "JS-CHN-01-03": "VS04-03", "JS-MKT-01-01": "VS05-01", "JS-MKT-01-02": "VS05-02", "JS-MKT-01-03": "VS05-03", "JS-OPS-01-01": "VS06-01", "JS-OPS-01-02": "VS06-02", "JS-OPS-01-03": "VS06-03", "JS-GOV-01-01": "VS07-01", "JS-GOV-01-02": "VS07-02", "JS-GOV-01-03": "VS07-03", "JS-FIN-01-01": "VS08-01", "JS-FIN-01-02": "VS08-02", "JS-FIN-01-03": "VS08-03", "JS-DAT-01-01": "VS09-01", "JS-DAT-01-02": "VS09-02", "JS-DAT-01-03": "VS09-03", "JS-PAR-01-01": "VS10-01", "JS-PAR-01-02": "VS10-02", "JS-PAR-01-03": "VS10-03", "JS-REG-01-01": "VS11-01", "JS-REG-01-02": "VS11-02", "JS-REG-01-03": "VS11-03"};

/* ---- v9: VP->BusinessOutcome map, agent->step, and the PARALLEL-MAPPED navigator chain ---- */
window.GENERIC.vpOutcomes = {"VP01": ["BO01", "BO02", "BO03", "BO04"], "VP02": ["BO01"], "VP03": ["BO03"], "VP05": ["BO02"]};
window.GENERIC.agentStep = {"AG01": {"pid": "P5", "idx": 0, "text": "Capture responses"}, "AG02": {"pid": "P1", "idx": 0, "text": "Review market & segment economics"}, "AG03": {"pid": "P3", "idx": 0, "text": "Draft campaign brief"}, "AG04": {"pid": "P4", "idx": 0, "text": "Final go/no-go approval"}, "AG05": {"pid": "P5", "idx": 0, "text": "Capture responses"}, "AG06": {"pid": "PX1", "idx": 0, "text": "Define persona & JTBD"}, "AG07": {"pid": "P1", "idx": 0, "text": "Review market & segment economics"}, "AG08": {"pid": "P2", "idx": 0, "text": "Assemble consented data"}, "AG09": {"pid": "P3", "idx": 0, "text": "Draft campaign brief"}};
window.PACK_CONFIG.chain = [{key:'sh',label:'Stakeholder'},{key:'vp',label:'Value Proposition'},{key:'bo',label:'Business Outcome'},{key:'vs',label:'Value Stream'},{key:'vsg',label:'Value Stage'},{key:'cj',label:'Customer Journey'},{key:'cap',label:'Capability'},{key:'proc',label:'Business Process'},{key:'dec',label:'Decision'},{key:'ai',label:'AI Use Case'},{key:'ag',label:'AI Agent'},{key:'dm',label:'Data Domain'},{key:'dp',label:'Data Product'}];

/* ---- v10: ownership + governance layer (from the future-state model, sheets 41/62-69) ---- */
window.GENERIC.boGovernance = {"BO01": {"role": "ROLE-CMO", "forum": "Marketing Value Council", "cadence": "Monthly", "rights": "Approve targets and investment shifts"}, "BO02": {"role": "ROLE-FIN-CLV", "forum": "Marketing Value Council", "cadence": "Monthly", "rights": "Approve CLV method and value-based allocation"}, "BO03": {"role": "ROLE-CMO", "forum": "Marketing Value Council", "cadence": "Quarterly", "rights": "Approve cross-sell and depth targets"}, "BO04": {"role": "ROLE-CXO", "forum": "CX Governance Forum", "cadence": "Monthly", "rights": "Approve journey backlog and CX targets"}, "BO05": {"role": "ROLE-CMO", "forum": "Trade Growth Forum", "cadence": "Quarterly", "rights": "Approve trade growth targets"}};
window.GENERIC.governanceCouncils = [{"id": "GC-AI", "name": "AI Governance Council", "mandate": "Approve AI gates and controls", "members": ["ROLE-RAI", "ROLE-CDO", "ROLE-DPO"], "cadence": "Monthly", "escalation": "Executive Risk"}, {"id": "GC-CX", "name": "CX Governance Forum", "mandate": "Own journey backlog and CX targets", "members": ["ROLE-CXO", "ROLE-JRN", "ROLE-CMO"], "cadence": "Monthly", "escalation": "Exco"}, {"id": "GC-DATA", "name": "Data Governance Council", "mandate": "Approve data products and quality", "members": ["ROLE-CDO", "ROLE-CDP-PO"], "cadence": "Monthly", "escalation": "Executive Risk"}];
window.GENERIC.raci = [{"id": "RACI-U01", "objType": "AIUseCase", "objId": "U01", "a": "ROLE-RAI", "r": "ROLE-CDO", "c": ["ROLE-DPO", "ROLE-CMO"], "i": ["ROLE-CXO"]}, {"id": "RACI-U04", "objType": "AIUseCase", "objId": "U04", "a": "ROLE-FIN-CLV", "r": "ROLE-CDO", "c": ["ROLE-RAI"], "i": ["ROLE-CMO"]}, {"id": "RACI-DP02", "objType": "DataProduct", "objId": "DP02", "a": "ROLE-CDO", "r": "ROLE-CDP-PO", "c": ["ROLE-DPO"], "i": ["ROLE-CMO"]}];
window.GENERIC.policyDomains = [{"id": "PD-AI", "name": "AI Governance", "scope": "AI use cases, agents, models and evals", "owner": "ROLE-RAI"}, {"id": "PD-DATA", "name": "Data Governance", "scope": "Data products, quality, lineage", "owner": "ROLE-CDO"}, {"id": "PD-PRIV", "name": "Privacy", "scope": "Consent, purpose, lawful use", "owner": "ROLE-DPO"}, {"id": "PD-REC", "name": "Records", "scope": "Retention, disposal, legal hold", "owner": "ROLE-CDO"}, {"id": "PD-CORP", "name": "Corporate", "scope": "Corporate oversight and conduct", "owner": "ROLE-CMO"}, {"id": "PD-MKT", "name": "Marketing Conduct", "scope": "Responsible marketing treatment", "owner": "ROLE-CMO"}, {"id": "PD-SEC", "name": "Security", "scope": "Data and platform security", "owner": "ROLE-CDO"}, {"id": "PD-INFO", "name": "Information", "scope": "Information management", "owner": "ROLE-CDO"}, {"id": "PD-MODEL", "name": "Model Governance", "scope": "Model lifecycle and monitoring", "owner": "ROLE-RAI"}];
window.GENERIC.policies = [{"id": "POL-AI-001", "domain": "PD-AI", "statement": "AI use cases require Value × Readiness and an eval plan", "owner": "ROLE-RAI", "status": "Draft"}, {"id": "POL-PRIV-001", "domain": "PD-PRIV", "statement": "Only consented data may be used for the approved purpose", "owner": "ROLE-DPO", "status": "Draft"}, {"id": "POL-DATA-001", "domain": "PD-DATA", "statement": "Data products must meet quality and lineage standards", "owner": "ROLE-CDO", "status": "Draft"}];
window.GENERIC.controls = [{"id": "CTL-AI-001", "policy": "POL-AI-001", "objective": "Evidence-based selection", "activity": "Complete readiness assessment", "freq": "Per use case", "evidence": "Readiness record"}, {"id": "CTL-AI-002", "policy": "POL-AI-001", "objective": "Responsible personalisation", "activity": "Fairness + consent screening", "freq": "Per treatment", "evidence": "Fairness/consent record"}, {"id": "CTL-PRIV-001", "policy": "POL-PRIV-001", "objective": "Consent enforcement", "activity": "Check consent before treatment", "freq": "Per treatment", "evidence": "Consent log"}];
window.GENERIC.riskRegister = [{"id": "R-AI-001", "obj": "U05", "type": "AI/conduct", "desc": "Inappropriate personalisation", "like": "Medium", "impact": "High", "control": "CTL-AI-002", "owner": "ROLE-RAI"}, {"id": "R-AI-002", "obj": "U16", "type": "AI/fairness", "desc": "Undetected model bias", "like": "Medium", "impact": "High", "control": "CTL-AI-002", "owner": "ROLE-RAI"}, {"id": "R-PRIV-001", "obj": "D5", "type": "Compliance", "desc": "Use of non-consented data", "like": "Low", "impact": "High", "control": "CTL-PRIV-001", "owner": "ROLE-DPO"}];

/* ---- v10: register the Value Streams (Ownership & Governance) page ---- */
(function(){ var p=window.PACK_CONFIG.pages;
  if(!p.some(function(x){return x.file==="value_streams.html";})){
    var i=p.findIndex(function(x){return x.file==="governance_responsible_ai.html";});
    p.splice((i>=0?i:p.length),0,{file:"value_streams.html", nav:"Value Streams", title:"Value Streams — Ownership & Governance"});
  }
})();

/* ---- v12: Model Editor — passphrase (CHANGE THIS) + page registration ---- */
window.PACK_CONFIG.editUnlock = "nedbank-edit";   // <-- change to your team's editor passphrase
(function(){ var p=window.PACK_CONFIG.pages;
  if(!p.some(function(x){return x.file==="model_editor.html";})){
    var i=p.findIndex(function(x){return x.file==="model_export_import.html";});
    p.splice((i>=0?i+1:p.length),0,{file:"model_editor.html", nav:"Editor", title:"Model Editor"});
  }
})();

/* ---- v13: User Manual — registered last so it reads as reference material ---- */
(function(){ var p=window.PACK_CONFIG.pages;
  if(!p.some(function(x){return x.file==="user_manual.html";})){
    p.push({file:"user_manual.html", nav:"Manual", title:"User Manual"});
  }
})();

/* ---- v1.21.0: Ethical Stewardship — the orientation layer ---------------- */
(function(){ var p=window.PACK_CONFIG.pages;
  if(!p.some(function(x){return x.file==="ethical_stewardship.html";})){
    var i=p.findIndex(function(x){return x.file==="governance_responsible_ai.html";});
    p.splice((i>=0?i:p.length),0,{file:"ethical_stewardship.html", nav:"Ethical Stewardship", title:"Ethical Stewardship — the orientation layer"});
  }
})();

/* ---- v1.20.1: sidebar order follows the golden-thread navigation --------- *
   The tabs above are registered in the order features were built. This final
   pass sorts them into the order a user actually walks the model:
     · overview tools first (Home, Navigator, Value-Flow Graph)
     · golden-thread content pages in chain order
       (Value Streams → Journeys → Architecture/Capabilities → Processes →
        Decisions → AI Use-Cases → Personalisation → Data Products)
     · supporting / admin pages last
       (Governance, Training, Glossary, Model I/O, Editor, Manual)
   Runs last so it re-sorts whatever the splices above produced. Any page not
   listed keeps its relative position at the end (rank 999, stable sort).      */
(function(){
  var order = [
    "index.html",
    "architecture_navigator.html",
    "navigation_graph.html",
    "value_streams.html",
    "north_star.html",
    "customer_journey.html",
    "business_architecture.html",
    "business_process.html",
    "decisions.html",
    "ai_usecases.html",
    "hyperpersonalisation_cdp.html",
    "data_products.html",
    "ethical_stewardship.html",
    "governance_responsible_ai.html",
    "operating_model.html",
    "training_adoption.html",
    "glossary_settings.html",
    "model_export_import.html",
    "model_editor.html",
    "user_manual.html"
  ];
  var rank = function(f){ var i = order.indexOf(f); return i < 0 ? 999 : i; };
  var p = window.PACK_CONFIG.pages;
  // stable sort: decorate with original index so unlisted pages keep their order
  p.map(function(x,i){ x.__i = i; return x; });
  p.sort(function(a,b){ var d = rank(a.file) - rank(b.file); return d !== 0 ? d : (a.__i - b.__i); });
  p.forEach(function(x){ delete x.__i; });
})();
