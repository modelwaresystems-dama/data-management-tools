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
window.PACK_CONFIG.version = "v1.8.0";
window.PACK_CONFIG.built   = "2026-08-03 14:34 SAST";
window.PACK_CONFIG.changelog = [
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
window.PACK_CONFIG.chain = [{key:'sh',label:'Stakeholder'},{key:'vp',label:'Value Proposition'},{key:'bo',label:'Business Outcome'},{key:'vs',label:'Value Stream'},{key:'vsg',label:'Value Stage'},{key:'cj',label:'Customer Journey'},{key:'cap',label:'Capability'},{key:'proc',label:'Business Process'},{key:'dec',label:'Decision'},{key:'ai',label:'AI Use Case'},{key:'ag',label:'AI Agent'},{key:'dp',label:'Data Product'},{key:'dm',label:'Data Domain'}];

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
