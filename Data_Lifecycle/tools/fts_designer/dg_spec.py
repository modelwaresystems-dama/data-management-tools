#!/usr/bin/env python3
"""
dg_spec.py  -  Data Governance FTS v0.5 (v0.2 base; v0.4 adds seven per-asset regions, v0.5 the register v3 answers, 28 Sep 2026): five state regions, each its own FTS over one managed element of the
Knowledge Area, derived from the DMBOK Data Governance context diagram (deck pages 18 to 21) and aligned to the
Global Data Asset Protocol.

Howard's regions (20 Sep 2026): 1 Strategy and Value Realisation; 2 Operating Model (federation,
ownership, stewardship / custody); 3 Readiness (maturity, culture, change); 4 Principles, Policies,
Procedures and Business Reference Architecture; 5 Data Asset Issue Management.
Decision 21 Sep 2026: the regions are separate FTSs, one per managed element, not conditions of a single
"capability" subject. Each region names the element it manages and the conditions that matter to the KA.
Region 5 manages Data Asset issues raised by every Knowledge Area: DG handles issue management for all of them.
v0.2 also renames STS-OPM-04 to "Assigned Roles" and gives every transition a Decision Right (drafted holders
flagged REVIEW; holders confirmed 22 Sep 2026 from role_vocabulary.json).

Usage: python dg_spec.py [out_dir] [--overrides spec/data_governance_overrides.json]   -> data_governance.fts.json
"""
import json, os, sys
from ka_build import build

SRC_DECK = "DMBOK Data Lifecycle and KA Context Diagrams.pdf, Data Governance pages 18 to 21 (What, Why, Activities, Role Players and Technical Drivers)"
SRC_HOWARD = "Howard Diesel, 20 and 21 Sep 2026: five DG state regions as separate FTSs over the KA's managed elements, the start-from-definition method, Assigned Roles naming, a Decision Right on every transition"
SRC_PROTOCOL = "global_protocol.fts.json v0.2.1 (Global Data Asset Protocol) for the contribution targets"

CONTEXT = {
    "knowledgeArea": "Data Governance",
    "definition": "The exercise of authority, control, and shared decision-making (planning, monitoring, and enforcement) over the management of data assets.",
    "ensures": "Data Governance ensures that data is managed properly, according to policies and best practices: Strategy; Policy; Standards and quality; Oversight / Stewardship; Compliance; Issue management; Data management projects; Data asset valuation.",
    "goals": ["Enable an organization to manage its data as an asset.", "Define, approve, communicate, and implement principles, policies, procedures, metrics, tools.", "Monitor and guide policy compliance, data usage, and management activities."],
    "businessDrivers": ["Reducing risk: general risk management, data security, privacy", "Improving processes: regulatory compliance, data quality improvement, metadata management, efficiency in development projects, vendor management"],
    "inputs": ["Business Strategies and Goals", "IT Strategies and Goals", "Data Management and Data Strategies", "Organization Policies and Standards", "Business Culture Assessment", "Data Maturity Assessment", "IT Practices", "Regulatory Requirements"],
    "processes": [
        {"id": "1", "name": "Define Data Governance for the Organization", "phase": "P", "subActivities": ["1.1 Develop Data Governance Strategy", "1.2 Perform Readiness Assessment", "1.3 Perform Discovery and Business Alignment", "1.4 Develop Organizational Touchpoints"]},
        {"id": "2", "name": "Define the Data Governance Strategy", "phase": "P", "subActivities": ["2.1 Define the Data Governance Operating Framework", "2.2 Develop Goals, Principles, and Policies", "2.3 Underwrite Data Management Projects", "2.4 Engage Change Management", "2.5 Engage in Issue Management", "2.6 Assess Regulatory Compliance Requirements"]},
        {"id": "3", "name": "Implement Data Governance", "phase": "O", "subActivities": ["3.1 Sponsor Data Standards and Procedures", "3.2 Develop a Business Glossary", "3.3 Co-ordinate with Architecture Groups", "3.4 Sponsor Data Asset Valuation"]},
        {"id": "4", "name": "Embed Data Governance", "phase": "C,O", "subActivities": [], "note": "The DMBOK context diagram lists no sub-activities for this process. Its scope is taken from the region definitions: operating model in force, instruments in force and monitored, the readiness change programme, issue management operating for all Knowledge Areas."},
    ],
    "deliverables": ["Data Governance Strategy", "Data Strategy", "Business / Data Governance Strategy Roadmap", "Data Principles, Data Governance Policies, Processes", "Operating Framework", "Roadmap and Implementation Strategy", "Operations Plan", "Business Glossary", "Data Governance Scorecard", "Data Governance Website", "Communications Plan", "Recognized Data Value", "Maturing Data Management Practices"],
    "suppliers": ["Business Executives", "Data Stewards", "Data Owners", "Subject Matter Experts", "Maturity Assessors", "Regulators", "Enterprise Architects"],
    "participants": ["Steering Committees", "CIO", "CDO / Chief Data Stewards", "Executive Data Stewards", "Coordinating Data Stewards", "Business Data Stewards", "Data Governance Bodies", "Compliance Team", "DM Executives", "Change Managers", "Enterprise Data Architects", "Project Management Office", "Governance Bodies", "Audit", "Data Professionals"],
    "consumers": ["Data Governance Bodies", "Project Managers", "Compliance Team", "DM Communities of Interest", "DM Team", "Business Management", "Architecture Groups", "Partner Organizations"],
    "techniques": ["Concise Messaging", "Contact List", "Logo"],
    "tools": ["Websites", "Business Glossary Tools", "Workflow Tools", "Document Management Tools", "Data Governance Scorecards"],
    "metrics": ["Compliance to regulatory and internal data policies", "Value", "Effectiveness", "Sustainability"],
    "phaseTags": "(P) Planning, (C) Control, (D) Development, (O) Operations",
}

KA_SUBJECT = "Data Governance Knowledge Area: five managed elements, one FTS (state region) each; the Data Asset is the Global subject reached through contributions"
REGIONS = [
    ("REG-DG-STR", "Strategy and Value Realisation", "STR", "Whether an approved data and data management strategy exists, is being executed, and is realising recognised data value.", "STS-STR-01", "Exactly one active state; a revised strategy supersedes, never coexists with, the approved one.",
     "Data and Data Management Strategy of the governed scope",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Governing element", "contributesTo": "Existence and Custody: strategy execution underwrites the projects that register, source and preserve Data Assets (TR-EX-01, TR-CP-01); value realisation is the Global Governance service's evidence of benefit.", "conditionsThatMatter": "Approved or not; in execution; value evidenced; under revision."}),
    ("REG-DG-OPM", "Operating Model", "OPM", "Whether the federated operating model, ownership and stewardship (custody) arrangements are defined, staffed and operating.", "STS-OPM-01", "Exactly one active state; decision rights exist only from Assigned Roles onward.",
     "Data Governance Operating Model of the governed scope: federation, ownership, stewardship / custody",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Governing element", "contributesTo": "All four Global regions: the Data Owner, Steward (custodian) and governance bodies that hold the Global Decision Rights exist only from Assigned Roles; DR-08 emergency access needs the model in force (TR-EX-01, TR-EX-02, TR-AV-01, TR-AV-08, TR-CP-01, TR-CP-05).", "conditionsThatMatter": "Defined; approved; roles assigned; in force; under restructuring; vacancy."}),
    ("REG-DG-RDY", "Readiness", "RDY", "Whether the organisation's maturity, culture and change capacity for data governance are known and being raised.", "STS-RDY-01", "Exactly one active state; readiness is a measured condition, never asserted.",
     "Organisational readiness of the governed scope: maturity, culture and change capacity",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Measured condition", "contributesTo": "Assurance: the readiness baseline and target set how much assurance the organisation can sustain (assurance criteria, TR-AS-01) and evidence GA-011 proportionality; no Global transition is gated on readiness directly.", "conditionsThatMatter": "Unassessed; assessment underway; baseline known; change programme active; target reached."}),
    ("REG-DG-POL", "Principles, Policies, Procedures and Business Reference Architecture", "POL", "Whether the governing instruments (principles, policies, procedures, standards, glossary, reference architecture) exist, are approved and are in force.", "STS-POL-01", "Exactly one active state; an instrument in force is the only one a Global guard may cite.",
     "Governing instruments of the governed scope: principles, policies, procedures, standards, business glossary, business reference architecture",
     {"instanceScope": "One instance per governed scope (the instrument set as a whole).", "elementKind": "Governing element", "contributesTo": "Existence, Availability and Custody: registration, disposition, access, withdrawal, external custody and transfer are permitted only under instruments in force (TR-EX-01, TR-EX-05, TR-EX-06, TR-AV-01, TR-AV-05, TR-CP-04, TR-CP-05); approved instruments supply the assurance criteria (TR-AS-01).", "conditionsThatMatter": "None; in development; approved; in force; under review."}),
    ("REG-DG-ISS", "Data Asset Issue Management", "ISS", "Whether an issue raised against a Data Asset is open, being resolved, escalated, or resolved.", "STS-ISS-01", "Exactly one active state per issue case; an escalated issue blocks material Global transitions on its Data Asset until resolved or the risk is accepted.",
     "Data Asset issue: an issue raised against a Data Asset by any Knowledge Area and managed by Data Governance",
     {"instanceScope": "One instance per issue case; many issues can be open on one Data Asset at a time. The Data Asset's blocking condition is the worst open issue.", "elementKind": "Managed case", "issueSources": ["Data Quality Management", "Metadata Management", "Data Security (including Data Privacy)", "Data Architecture", "Data Modelling and Design", "Data Storage and Operations", "Data Integration and Interoperability", "Document and Content Management", "Reference and Master Data", "Data Warehousing and Business Intelligence", "Data Governance itself (policy compliance)"], "contributesTo": "Existence, Availability and Assurance: an escalated issue blocks destruction, disposition and access restoration (TR-EX-05, TR-EX-06, TR-AV-04) and emits the monitoring triggers for assurance suspension and access suspension (TR-AS-05, TR-AV-03).", "conditionsThatMatter": "No open issue; open; in resolution; escalated; resolved."}),
    ("REG-DG-INS", "Governing Instrument Version", "INS", "Whether one version of a policy or procedure is drafted, reviewed, approved, in force, superseded or withdrawn.", "STS-INS-01", "Exactly one active state per version; at most one version of an instrument is in force; a version goes in force only when its document is published or declared a record.",
     "A version of a governing instrument: the Policy of a policy domain, or one of the Procedures that implement it, managed as the record of an unstructured asset",
     {"instanceScope": "One instance per version of a policy or procedure, carrying the instrument it versions, its version number, its predecessor and its policy domain. Record level, like the golden record in Reference and Master Data: versions roll up to the instrument set of their policy domain, and the sets roll up to REG-DG-POL.", "elementKind": "Managed record", "contributesTo": "None directly: the roll-up of the versions sets REG-DG-POL, whose in-force state gates registration, disposition, access, withdrawal, external custody and transfer; each policy domain's set gives its own fact.", "conditionsThatMatter": "No version; drafted; reviewed; approved; in force; superseded; withdrawn."}),
]
STATES = [
    ("STS-STR-01", "REG-DG-STR", "No Approved Strategy", True, False, "No approved data or data management strategy exists for the governed scope.", "The absence of an approved strategy remains visible to governance bodies.", ["inputs:Business Strategies and Goals", "inputs:Data Management and Data Strategies"]),
    ("STS-STR-02", "REG-DG-STR", "Strategy Formulation", False, False, "A data governance and data strategy is being developed through discovery and business alignment.", "Sponsor, scope and alignment evidence remain identifiable.", ["process:1.1", "process:1.3"]),
    ("STS-STR-03", "REG-DG-STR", "Approved Strategy", False, False, "A data governance strategy, data strategy and roadmap are approved by the accountable body.", "The approved strategy, roadmap and approving authority remain current and traceable.", ["deliverable:Data Governance Strategy", "deliverable:Data Strategy", "deliverable:Business / Data Governance Strategy Roadmap"]),
    ("STS-STR-04", "REG-DG-STR", "Strategy Execution", False, False, "The roadmap is in execution and data management projects are underwritten against it.", "Roadmap milestones, underwritten projects and their sponsors remain traceable.", ["process:2.3", "deliverable:Roadmap and Implementation Strategy"]),
    ("STS-STR-05", "REG-DG-STR", "Value Realisation", False, False, "Recognised data value is being evidenced against the strategy through data asset valuation.", "Value measures, valuation basis and beneficiaries remain current.", ["process:3.4", "deliverable:Recognized Data Value", "metric:Value"]),
    ("STS-STR-06", "REG-DG-STR", "Strategy Revision", False, False, "The approved strategy is under review after a material change in business or regulatory direction.", "The trigger, scope of revision and the strategy still in force remain explicit.", ["inputs:Business Strategies and Goals", "inputs:Regulatory Requirements"]),
    ("STS-OPM-01", "REG-DG-OPM", "Undefined Operating Model", True, False, "No data governance operating model, ownership or stewardship arrangement is defined.", "Accountability gaps remain visible.", ["inputs:Organization Policies and Standards"]),
    ("STS-OPM-02", "REG-DG-OPM", "Operating Model Design", False, False, "The federated operating framework and organisational touchpoints are being defined.", "Design scope, federation choices and touchpoints under design remain identifiable.", ["process:2.1", "process:1.4"]),
    ("STS-OPM-03", "REG-DG-OPM", "Approved Operating Model", False, False, "The operating framework, federation model and role definitions are approved.", "The approved framework and its approving authority remain traceable.", ["deliverable:Operating Framework"]),
    ("STS-OPM-04", "REG-DG-OPM", "Assigned Roles", False, False, "Data Owners, Data Stewards (custodians) and governance bodies are assigned and constituted for the governed scope.", "Every governed Data Asset has an accountable owner and a steward on record.", ["participants:Data Governance Bodies", "suppliers:Data Owners", "suppliers:Data Stewards"]),
    ("STS-OPM-05", "REG-DG-OPM", "Operating Model in Force", False, False, "Governance bodies meet, stewardship is exercised and decision rights are being used under the operations plan.", "Decision rights, escalation paths and the operations plan remain current.", ["deliverable:Operations Plan", "metric:Effectiveness"]),
    ("STS-OPM-06", "REG-DG-OPM", "Operating Model Revision", False, False, "The operating model is being restructured while existing roles and decision rights remain in force.", "Roles and decision rights in force remain valid until the revised model is approved.", ["process:2.1"]),
    ("STS-RDY-01", "REG-DG-RDY", "Unassessed Readiness", True, False, "Maturity, culture and change capacity for data governance have not been assessed.", "The absence of a baseline remains visible.", ["inputs:Business Culture Assessment", "inputs:Data Maturity Assessment"]),
    ("STS-RDY-02", "REG-DG-RDY", "Readiness Assessment", False, False, "A readiness, culture or maturity assessment is underway.", "Assessment scope, assessors and criteria remain identifiable.", ["process:1.2", "suppliers:Maturity Assessors"]),
    ("STS-RDY-03", "REG-DG-RDY", "Assessed Readiness", False, False, "A baseline maturity level, culture assessment and gap analysis are known and accepted.", "The baseline, its date and the gaps remain current.", ["inputs:Data Maturity Assessment"]),
    ("STS-RDY-04", "REG-DG-RDY", "Change Programme", False, False, "A change management and communications programme is active to close the readiness gaps.", "Change objectives, communications plan and sponsors remain active.", ["process:2.4", "deliverable:Communications Plan", "participants:Change Managers"]),
    ("STS-RDY-05", "REG-DG-RDY", "Target Readiness", False, False, "The targeted maturity level and culture indicators are reached and data management practices are maturing.", "Target evidence remains current; a lapse triggers reassessment.", ["deliverable:Maturing Data Management Practices", "metric:Sustainability"]),
    ("STS-POL-01", "REG-DG-POL", "No Governing Instruments", True, False, "No approved data principles, policies, procedures, standards or reference architecture exist for the governed scope.", "The absence of governing instruments remains visible.", ["inputs:Organization Policies and Standards"]),
    ("STS-POL-02", "REG-DG-POL", "Instrument Development", False, False, "Principles, policies, procedures, standards, the business glossary or the business reference architecture are being developed.", "Drafts, owners and the regulatory requirements they address remain identifiable.", ["process:2.2", "process:3.1", "process:3.2", "process:3.3", "process:2.6"]),
    ("STS-POL-03", "REG-DG-POL", "Approved Instruments", False, False, "The governing instruments are approved but not yet communicated or enforced.", "Approved instruments, versions and approving authority remain traceable.", ["deliverable:Data Principles, Data Governance Policies, Processes", "deliverable:Business Glossary"]),
    ("STS-POL-04", "REG-DG-POL", "Instruments in Force", False, False, "The governing instruments are communicated, embedded and monitored for compliance.", "Compliance to regulatory and internal data policies is measured and reported.", ["process:4", "metric:Compliance to regulatory and internal data policies", "deliverable:Data Governance Scorecard"]),
    ("STS-POL-05", "REG-DG-POL", "Instrument Review", False, False, "Instruments are under review after a regulatory, strategic or compliance trigger while the current versions stay in force.", "The instruments in force remain valid until the revision is approved.", ["process:2.6", "inputs:Regulatory Requirements"]),
    ("STS-ISS-01", "REG-DG-ISS", "No Open Issue", True, False, "No governance issue is open against the Data Asset.", "Issue history remains retrievable.", ["process:2.5"]),
    ("STS-ISS-02", "REG-DG-ISS", "Open Issue", False, False, "A governance issue is logged and triaged against the Data Asset.", "Issue owner, severity and target date remain recorded.", ["process:2.5", "tools:Workflow Tools"]),
    ("STS-ISS-03", "REG-DG-ISS", "Issue Resolution", False, False, "A resolution is being worked by the assigned steward under the operating model.", "Assigned resolver, plan and progress remain visible.", ["process:2.5"]),
    ("STS-ISS-04", "REG-DG-ISS", "Escalated Issue", False, False, "The issue is escalated to a governance body and blocks material transitions of the Data Asset.", "Escalation authority, decision due date and blocked transitions remain explicit.", ["participants:Governance Bodies", "participants:Steering Committees"]),
    ("STS-ISS-05", "REG-DG-ISS", "Resolved Issue", False, False, "The issue is resolved or the risk formally accepted; closure evidence is retained.", "Resolution or acceptance decision and evidence remain retrievable.", ["participants:Audit"]),
    ("STS-INS-01", "REG-DG-INS", "No Version", True, False, "No version of this instrument has been started.", "The instrument's identity and policy domain are recorded.", ["Howard, 24 Sep 2026 (Instrument Versions Register)"]),
    ("STS-INS-02", "REG-DG-INS", "Drafted Version", False, False, "A version of the policy or procedure is drafted with its owner and predecessor recorded.", "The draft, its author and the version it would replace remain identifiable.", ["Howard, 24 Sep 2026 (Instrument Versions Register)"]),
    ("STS-INS-03", "REG-DG-INS", "Reviewed Version", False, False, "The draft has been reviewed against the policy it serves and the regulatory requirements.", "Review findings and reviewer remain traceable.", ["Howard, 24 Sep 2026 (Instrument Versions Register)"]),
    ("STS-INS-04", "REG-DG-INS", "Approved Version", False, False, "The version is approved by its approving authority but not yet in force.", "Approval decision, authority and date remain traceable.", ["Howard, 24 Sep 2026 (Instrument Versions Register)"]),
    ("STS-INS-05", "REG-DG-INS", "Version in Force", False, False, "The version is communicated and in force; it is the version a guard may cite.", "Exactly one version of the instrument is in force; its document is published or declared.", ["Howard, 24 Sep 2026 (Instrument Versions Register)"]),
    ("STS-INS-06", "REG-DG-INS", "Superseded Version", False, True, "A successor version has been put in force and has replaced this one.", "The superseded version, its successor and the date remain retrievable; its document is declared a record under retention.", ["Howard, 24 Sep 2026 (Instrument Versions Register)"]),
    ("STS-INS-07", "REG-DG-INS", "Withdrawn Version", False, True, "The version is retired with no successor (a scope closed, a regulation repealed), or withdrawn before it went in force.", "The withdrawal decision and its reason remain retrievable.", ["Howard, 24 Sep 2026 (Instrument Versions Register)"]),
]
EVENTS = {
    "EV-STR-01": ("Strategy initiation", "Request"), "EV-STR-02": ("Strategy approval", "Decision outcome"), "EV-STR-03": ("Roadmap execution start", "Decision outcome"), "EV-STR-04": ("Value evidenced", "Evidence trigger"), "EV-STR-05": ("Material change in direction", "Monitoring trigger"), "EV-STR-06": ("Revised strategy approval", "Decision outcome"), "EV-STR-07": ("Strategy withdrawal", "Decision outcome"),
    "EV-OPM-01": ("Operating model design initiation", "Request"), "EV-OPM-02": ("Operating model approval", "Decision outcome"), "EV-OPM-03": ("Roles assigned and bodies constituted", "Evidence trigger"), "EV-OPM-04": ("Operations plan activation", "Decision outcome"), "EV-OPM-05": ("Restructuring trigger", "Monitoring trigger"), "EV-OPM-06": ("Revised operating model approval", "Decision outcome"), "EV-OPM-07": ("Role vacancy", "Monitoring trigger"),
    "EV-RDY-01": ("Assessment initiation", "Request"), "EV-RDY-02": ("Assessment completion", "Assessment outcome"), "EV-RDY-03": ("Change programme launch", "Decision outcome"), "EV-RDY-04": ("Target reached", "Assessment outcome"), "EV-RDY-05": ("Reassessment due", "Time trigger"),
    "EV-POL-01": ("Instrument development initiation", "Request"), "EV-POL-02": ("Instrument approval", "Decision outcome"), "EV-POL-03": ("Instrument publication", "Decision outcome"), "EV-POL-04": ("Regulatory or compliance trigger", "Monitoring trigger"), "EV-POL-05": ("Revised instrument approval", "Decision outcome"), "EV-POL-06": ("Instrument retirement", "Decision outcome"),
    "EV-ISS-01": ("Issue logged by a Knowledge Area or raised by a refused transition", "Request"), "EV-ISS-02": ("Resolution assigned", "Decision outcome"), "EV-ISS-03": ("Escalation", "Decision outcome"), "EV-ISS-04": ("Resolution or risk acceptance", "Decision outcome"), "EV-ISS-05": ("Issue closure", "Evidence trigger"), "EV-ISS-06": ("Issue reopened", "Monitoring trigger"),
    "EV-INS-01": ("Version drafted", "Request"), "EV-INS-02": ("Version submitted for review", "Request"), "EV-INS-03": ("Version returned for rework", "Decision outcome"), "EV-INS-04": ("Version approved", "Decision outcome"), "EV-INS-05": ("Version put in force", "Decision outcome"), "EV-INS-08": ("Procedure version withdrawn", "Decision outcome"), "EV-INS-06": ("Successor version put in force", "Evidence trigger"), "EV-INS-07": ("Version withdrawn", "Decision outcome"),
}
DR = {
    "DR-DG-01": ("Approve Data Governance Strategy and Roadmap", "ROLE-DGSC", "Confirmed 22 Sep 2026: Data Governance Steering Committee; drafted as Steering Committees"), "DR-DG-02": ("Approve Operating Framework and Federation Model", "ROLE-DGSC", "Confirmed 22 Sep 2026: Data Governance Steering Committee; drafted as Steering Committees"), "DR-DG-03": ("Assign Data Owners and Stewards", "ROLE-CDS", "Confirmed 22 Sep 2026: Chief Data Steward; drafted as CDO / Chief Data Stewards"),
    "DR-DG-04": ("Approve Governing Instruments", "ROLE-DGC", "Confirmed 22 Sep 2026: Data Governance Council; drafted as Data Governance Bodies"), "DR-DG-05": ("Authorize Change Programme", "ROLE-DGSC", "Confirmed 22 Sep 2026: Data Governance Steering Committee; drafted as CIO"), "DR-DG-06": ("Escalate and Decide Data Asset Issues", "ROLE-DGC", "Confirmed 22 Sep 2026: Data Governance Council; drafted as Data Governance Bodies"), "DR-DG-07": ("Accept Residual Risk on an Issue", "ROLE-DO", "Confirmed 22 Sep 2026: Data Owner; drafted as Steering Committees"),
    # v0.2: decision 21 Sep 2026, every transition carries a Decision Right; holders confirmed 22 Sep 2026 from role_vocabulary.json
    "DR-DG-08": ("Mandate Strategy Formulation", "ROLE-DGSC", "Confirmed 22 Sep 2026 (holder register): Data Governance Steering Committee; drafted as Steering Committees"),
    "DR-DG-09": ("Sponsor Data Asset Valuation and Recognise Value", "ROLE-CDO", "Confirmed 22 Sep 2026 (holder register): Chief Data Officer; drafted as DM Executives"),
    "DR-DG-10": ("Open a Strategy Revision", "ROLE-CDS", "Confirmed 22 Sep 2026 (holder register): Chief Data Steward; drafted as CDO / Chief Data Stewards"),
    "DR-DG-11": ("Mandate Operating Model Design or Restructuring", "ROLE-PM-DG", "Confirmed 22 Sep 2026 (holder register): Data Governance Practice Manager; drafted as CDO / Chief Data Stewards"),
    "DR-DG-12": ("Declare a Role Vacancy", "ROLE-PM-DG", "Confirmed 22 Sep 2026 (holder register): Data Governance Practice Manager; drafted as CDO / Chief Data Stewards"),
    "DR-DG-13": ("Commission a Readiness Assessment", "ROLE-PM-DG", "Confirmed 22 Sep 2026 (holder register): Data Governance Practice Manager; drafted as CDO / Chief Data Stewards"),
    "DR-DG-14": ("Accept Readiness Baseline and Target", "ROLE-DGSC", "Confirmed 22 Sep 2026 (holder register): Data Governance Steering Committee; drafted as Steering Committees"),
    "DR-DG-15": ("Mandate Instrument Development or Review", "ROLE-DGC", "Confirmed 22 Sep 2026 (holder register): Data Governance Council; drafted as Data Governance Bodies"),
    "DR-DG-16": ("Log, Triage and Reopen a Data Asset Issue", "ROLE-BDS", "Confirmed 22 Sep 2026 (holder register): Business Data Steward; drafted as Business Data Stewards"),
    "DR-DG-17": ("Assign Issue Resolution", "ROLE-CODS", "Confirmed 22 Sep 2026 (holder register): Coordinating Data Steward; drafted as Coordinating Data Stewards"),
    "DR-DG-18": ("Accept Issue Resolution and Close", "ROLE-DO", "Confirmed 22 Sep 2026 (holder register): Data Owner; drafted as Data Owners"),
    "DR-DG-19": ("Approve and Put in Force a Procedure Version", "ROLE-DO", "Confirmed 24 Sep 2026 (Instrument Versions Register, card 7): Data Owner approves procedures; the Council keeps policies under DR-DG-04. Extended 24 Sep 2026 (Open Decisions C3 option a): the Data Owner also withdraws procedure versions (TR-INS-11)"),
}
ROLES = [
    ("ROLE-DG-S01", "Business Executives", "Supplier", "Supply business strategies and goals."), ("ROLE-DG-S02", "Data Stewards", "Supplier", "Supply stewardship knowledge; act as custodians."), ("ROLE-DG-S03", "Data Owners", "Supplier", "Own Data Assets; hold asset-level decision rights."), ("ROLE-DG-S04", "Subject Matter Experts", "Supplier", "Supply domain knowledge."), ("ROLE-DG-S05", "Maturity Assessors", "Supplier", "Supply maturity and readiness assessments."), ("ROLE-DG-S06", "Regulators", "Supplier", "Supply regulatory requirements."), ("ROLE-DG-S07", "Enterprise Architects", "Supplier", "Supply the business reference architecture."),
    ("ROLE-DG-P01", "Steering Committees", "Participant", "Approve strategy, operating model and risk acceptance."), ("ROLE-DG-P02", "CIO", "Participant", "Sponsor change and IT alignment."), ("ROLE-DG-P03", "CDO / Chief Data Stewards", "Participant", "Lead governance; assign owners and stewards."), ("ROLE-DG-P04", "Executive Data Stewards", "Participant", "Exercise executive stewardship."), ("ROLE-DG-P05", "Coordinating Data Stewards", "Participant", "Coordinate stewardship across domains."), ("ROLE-DG-P06", "Business Data Stewards", "Participant", "Steward Data Assets day to day; resolve issues."), ("ROLE-DG-P07", "Data Governance Bodies", "Participant", "Approve instruments; decide escalated issues."), ("ROLE-DG-P08", "Compliance Team", "Participant", "Assess regulatory compliance requirements."), ("ROLE-DG-P09", "DM Executives", "Participant", "Sponsor data management projects."), ("ROLE-DG-P10", "Change Managers", "Participant", "Run the change programme."), ("ROLE-DG-P11", "Enterprise Data Architects", "Participant", "Co-ordinate architecture."), ("ROLE-DG-P12", "Project Management Office", "Participant", "Underwrite and track projects."), ("ROLE-DG-P13", "Governance Bodies", "Participant", "Decide escalations."), ("ROLE-DG-P14", "Audit", "Participant", "Provide assurance evidence."), ("ROLE-DG-P15", "Data Professionals", "Participant", "Execute governance activities."),
    ("ROLE-DG-C01", "Data Governance Bodies", "Consumer", "Consume scorecards and decisions."), ("ROLE-DG-C02", "Project Managers", "Consumer", "Consume policies and standards."), ("ROLE-DG-C03", "Compliance Team", "Consumer", "Consume compliance results."), ("ROLE-DG-C04", "DM Communities of Interest", "Consumer", "Consume glossary and communications."), ("ROLE-DG-C05", "DM Team", "Consumer", "Consume operations plan."), ("ROLE-DG-C06", "Business Management", "Consumer", "Consume recognised data value."), ("ROLE-DG-C07", "Architecture Groups", "Consumer", "Consume reference architecture."), ("ROLE-DG-C08", "Partner Organizations", "Consumer", "Consume policies for shared data."),
]
TRANS = [
    ("TR-STR-01", "Formulate Strategy", "STS-STR-01", "STS-STR-02", "EV-STR-01", "A sponsor and scope exist; business and IT strategies and goals are available as inputs.", "DR-DG-08", ["SVC-DG-01"], ["ACT-DG-1.1", "ACT-DG-1.3"]),
    ("TR-STR-02", "Approve Strategy", "STS-STR-02", "STS-STR-03", "EV-STR-02", "Strategy, data strategy and roadmap are aligned to business goals and readiness findings.", "DR-DG-01", ["SVC-DG-01"], ["ACT-DG-1.1"]),
    ("TR-STR-03", "Start Roadmap Execution", "STS-STR-03", "STS-STR-04", "EV-STR-03", "Roadmap and implementation strategy exist; projects are underwritten.", "DR-DG-01", ["SVC-DG-02"], ["ACT-DG-2.3"]),
    ("TR-STR-04", "Evidence Value", "STS-STR-04", "STS-STR-05", "EV-STR-04", "Data asset valuation is sponsored and recognised value is reported.", "DR-DG-09", ["SVC-DG-02"], ["ACT-DG-3.4"]),
    ("TR-STR-05", "Revise Strategy after Execution", "STS-STR-04", "STS-STR-06", "EV-STR-05", "A material change in business or regulatory direction is recorded.", "DR-DG-10", ["SVC-DG-01"], ["ACT-DG-1.3"]),
    ("TR-STR-06", "Revise Strategy after Value", "STS-STR-05", "STS-STR-06", "EV-STR-05", "A material change in business or regulatory direction is recorded.", "DR-DG-10", ["SVC-DG-01"], ["ACT-DG-1.3"]),
    ("TR-STR-07", "Approve Revised Strategy", "STS-STR-06", "STS-STR-03", "EV-STR-06", "The revised strategy and roadmap are approved.", "DR-DG-01", ["SVC-DG-01"], ["ACT-DG-1.1"]),
    ("TR-STR-08", "Withdraw Strategy", "STS-STR-06", "STS-STR-01", "EV-STR-07", "The strategy is withdrawn without replacement and the withdrawal is recorded.", "DR-DG-01", ["SVC-DG-01"], ["ACT-DG-1.1"]),
    ("TR-OPM-01", "Design Operating Model", "STS-OPM-01", "STS-OPM-02", "EV-OPM-01", "A design mandate exists; organisational touchpoints are being identified.", "DR-DG-11", ["SVC-DG-03"], ["ACT-DG-2.1", "ACT-DG-1.4"]),
    ("TR-OPM-02", "Approve Operating Model", "STS-OPM-02", "STS-OPM-03", "EV-OPM-02", "The operating framework and federation model are approved.", "DR-DG-02", ["SVC-DG-03"], ["ACT-DG-2.1"]),
    ("TR-OPM-03", "Assign Roles", "STS-OPM-03", "STS-OPM-04", "EV-OPM-03", "Data Owners, Data Stewards and governance bodies are assigned for the governed scope.", "DR-DG-03", ["SVC-DG-03", "SVC-DG-04"], ["ACT-DG-1.4"]),
    ("TR-OPM-04", "Activate Operations Plan", "STS-OPM-04", "STS-OPM-05", "EV-OPM-04", "The operations plan is approved and governance bodies are meeting.", "DR-DG-02", ["SVC-DG-04"], ["ACT-DG-4"]),
    ("TR-OPM-05", "Restructure Operating Model", "STS-OPM-05", "STS-OPM-06", "EV-OPM-05", "A restructuring trigger is recorded; roles in force are retained meanwhile.", "DR-DG-11", ["SVC-DG-03"], ["ACT-DG-2.1"]),
    ("TR-OPM-06", "Approve Revised Operating Model", "STS-OPM-06", "STS-OPM-04", "EV-OPM-06", "The revised model is approved and roles reassigned where changed.", "DR-DG-02", ["SVC-DG-03"], ["ACT-DG-2.1"]),
    ("TR-OPM-07", "Record Role Vacancy", "STS-OPM-05", "STS-OPM-03", "EV-OPM-07", "An owner, steward or body role required for the scope is vacant.", "DR-DG-12", ["SVC-DG-04"], ["ACT-DG-4"]),
    ("TR-RDY-01", "Initiate Readiness Assessment", "STS-RDY-01", "STS-RDY-02", "EV-RDY-01", "Assessment scope, assessors and criteria are defined.", "DR-DG-13", ["SVC-DG-05"], ["ACT-DG-1.2"]),
    ("TR-RDY-02", "Establish Readiness Baseline", "STS-RDY-02", "STS-RDY-03", "EV-RDY-02", "Maturity level, culture findings and gaps are accepted by the sponsor.", "DR-DG-14", ["SVC-DG-05"], ["ACT-DG-1.2"]),
    ("TR-RDY-03", "Launch Change Programme", "STS-RDY-03", "STS-RDY-04", "EV-RDY-03", "Change objectives, communications plan and sponsors are authorised.", "DR-DG-05", ["SVC-DG-06"], ["ACT-DG-2.4"]),
    ("TR-RDY-04", "Confirm Target Readiness", "STS-RDY-04", "STS-RDY-05", "EV-RDY-04", "Reassessment shows the target maturity and culture indicators are reached.", "DR-DG-14", ["SVC-DG-05"], ["ACT-DG-1.2"]),
    ("TR-RDY-05", "Reassess Readiness", "STS-RDY-05", "STS-RDY-02", "EV-RDY-05", "The reassessment interval has elapsed or a lapse is detected.", "DR-DG-13", ["SVC-DG-05"], ["ACT-DG-1.2"]),
    ("TR-RDY-06", "Reassess during Change", "STS-RDY-04", "STS-RDY-02", "EV-RDY-05", "A scheduled interim reassessment is due.", "DR-DG-13", ["SVC-DG-05"], ["ACT-DG-1.2"]),
    ("TR-POL-01", "Develop Instruments", "STS-POL-01", "STS-POL-02", "EV-POL-01", "Regulatory requirements and organisation policies are assessed as inputs.", "DR-DG-15", ["SVC-DG-07"], ["ACT-DG-2.2", "ACT-DG-2.6", "ACT-DG-3.1", "ACT-DG-3.2", "ACT-DG-3.3"]),
    ("TR-POL-02", "Approve Instruments", "STS-POL-02", "STS-POL-03", "EV-POL-02", "Principles, policies, procedures, standards and reference architecture are approved.", "DR-DG-04", ["SVC-DG-07"], ["ACT-DG-2.2"]),
    ("TR-POL-03", "Publish Instruments", "STS-POL-03", "STS-POL-04", "EV-POL-03", "Instruments are communicated and compliance monitoring is in place.", "DR-DG-04", ["SVC-DG-08"], ["ACT-DG-4"]),
    ("TR-POL-04", "Review Instruments", "STS-POL-04", "STS-POL-05", "EV-POL-04", "A regulatory, strategic or compliance trigger is recorded.", "DR-DG-15", ["SVC-DG-07"], ["ACT-DG-2.6"]),
    ("TR-POL-05", "Approve Revised Instruments", "STS-POL-05", "STS-POL-03", "EV-POL-05", "Revised instruments are approved.", "DR-DG-04", ["SVC-DG-07"], ["ACT-DG-2.2"]),
    ("TR-POL-06", "Retire Instruments", "STS-POL-05", "STS-POL-01", "EV-POL-06", "All instruments for the scope are retired without replacement.", "DR-DG-04", ["SVC-DG-07"], ["ACT-DG-2.2"]),
    ("TR-ISS-01", "Log Issue", "STS-ISS-01", "STS-ISS-02", "EV-ISS-01", "An issue against the Data Asset is logged with its source Knowledge Area, severity and owner; a transition refused by a Non-waivable or Required guard raises one automatically, carrying the requested transition, the requesting activity and role, the decision right and every guard that answered false (Howard, 23 Sep 2026).", "DR-DG-16", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-ISS-02", "Assign Resolution", "STS-ISS-02", "STS-ISS-03", "EV-ISS-02", "A steward is assigned under the operating model and a plan exists.", "DR-DG-17", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-ISS-03", "Escalate Issue", "STS-ISS-03", "STS-ISS-04", "EV-ISS-03", "Resolution is blocked or exceeds tolerance; escalation authority is engaged.", "DR-DG-06", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-ISS-04", "Escalate Open Issue", "STS-ISS-02", "STS-ISS-04", "EV-ISS-03", "Severity requires immediate escalation.", "DR-DG-06", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-ISS-05", "Resolve Issue", "STS-ISS-03", "STS-ISS-05", "EV-ISS-04", "Resolution evidence is accepted by the issue owner.", "DR-DG-18", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-ISS-06", "Decide Escalated Issue", "STS-ISS-04", "STS-ISS-05", "EV-ISS-04", "The governance body resolves the issue or accepts the residual risk.", "DR-DG-07", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-ISS-07", "Close Issue", "STS-ISS-05", "STS-ISS-01", "EV-ISS-05", "Closure evidence is retained.", "DR-DG-18", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-ISS-08", "Reopen Issue", "STS-ISS-05", "STS-ISS-02", "EV-ISS-06", "The resolution failed or recurred.", "DR-DG-16", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-INS-01", "Draft Version", "STS-INS-01", "STS-INS-02", "EV-INS-01", "A new policy or procedure, or a new version of one, is drafted with its owner, policy domain and predecessor recorded.", "DR-DG-15", ["SVC-DG-07"], ["ACT-DG-2.2", "ACT-DG-3.1"]),
    ("TR-INS-02", "Review Version", "STS-INS-02", "STS-INS-03", "EV-INS-02", "The draft is reviewed against the policy it serves and the regulatory requirements.", "DR-DG-15", ["SVC-DG-07"], ["ACT-DG-2.6", "ACT-DG-3.1"]),
    ("TR-INS-03", "Return Version for Rework", "STS-INS-03", "STS-INS-02", "EV-INS-03", "The review returns the draft with findings.", "DR-DG-15", ["SVC-DG-07"], ["ACT-DG-2.6"]),
    ("TR-INS-04", "Approve Policy Version", "STS-INS-03", "STS-INS-04", "EV-INS-04", "The Data Governance Council approves the policy version.", "DR-DG-04", ["SVC-DG-07"], ["ACT-DG-2.2"]),
    ("TR-INS-05", "Approve Procedure Version", "STS-INS-03", "STS-INS-04", "EV-INS-04", "The Data Owner approves the procedure version.", "DR-DG-19", ["SVC-DG-07"], ["ACT-DG-3.1"]),
    ("TR-INS-06", "Put Policy Version in Force", "STS-INS-04", "STS-INS-05", "EV-INS-05", "The policy version is communicated and in force; its predecessor, if any, is superseded in the same act.", "DR-DG-04", ["SVC-DG-08"], ["ACT-DG-4"]),
    ("TR-INS-07", "Put Procedure Version in Force", "STS-INS-04", "STS-INS-05", "EV-INS-05", "The procedure version is communicated and in force; its predecessor, if any, is superseded in the same act.", "DR-DG-19", ["SVC-DG-08"], ["ACT-DG-4"]),
    ("TR-INS-08", "Supersede Version", "STS-INS-05", "STS-INS-06", "EV-INS-06", "Its successor has been put in force; recorded automatically in the same act, naming the successor.", "DR-DG-04", ["SVC-DG-07"], ["ACT-DG-2.2"]),
    ("TR-INS-09", "Withdraw Policy Version", "STS-INS-05", "STS-INS-07", "EV-INS-07", "The policy version in force is retired with no successor and the reason is recorded.", "DR-DG-04", ["SVC-DG-07"], ["ACT-DG-2.2"]),
    ("TR-INS-11", "Withdraw Procedure Version", "STS-INS-05", "STS-INS-07", "EV-INS-08", "The Data Owner retires the procedure version in force with no successor and records the reason (Howard, 24 Sep 2026, Open Decisions C3 option a).", "DR-DG-19", ["SVC-DG-07"], ["ACT-DG-3.1"]),
    ("TR-INS-10", "Withdraw Approved Version", "STS-INS-04", "STS-INS-07", "EV-INS-07", "An approved version is withdrawn before it goes in force.", "DR-DG-15", ["SVC-DG-07"], ["ACT-DG-2.2"]),
]
SERVICES = [
    ("SVC-DG-01", "Governance", "Strategy Definition and Approval", "Strategy initiation or material change.", "Approved data governance and data strategy; roadmap."),
    ("SVC-DG-02", "Governance", "Project Underwriting and Value Sponsorship", "Roadmap execution; valuation request.", "Underwritten projects; recognised data value."),
    ("SVC-DG-03", "Governance", "Operating Model Definition", "Design or restructuring mandate.", "Approved operating framework; federation model."),
    ("SVC-DG-04", "Governance", "Decision Rights and Stewardship Administration", "Decision or transition requires an accountable holder.", "Valid Decision Right holder; assigned owner and steward for a Data Asset."),
    ("SVC-DG-05", "Assurance", "Readiness and Maturity Assessment", "Assessment initiation or reassessment due.", "Readiness baseline; maturity level; gap analysis."),
    ("SVC-DG-06", "Governance", "Change and Communications Programme", "Readiness gaps accepted.", "Communications plan; change objectives."),
    ("SVC-DG-07", "Governance", "Policy and Standards Definition", "Regulatory or strategic trigger.", "Approved principles, policies, procedures, standards, glossary, reference architecture."),
    ("SVC-DG-08", "Control", "Policy Compliance Monitoring", "Instruments in force.", "Compliance result; Data Governance Scorecard."),
    ("SVC-DG-09", "Governance", "Data Asset Issue Management", "Issue logged against a Data Asset by any Knowledge Area (quality, metadata, security or privacy, architecture, integration, content, reference and master data, warehousing, governance compliance).", "Issue decision; resolution or risk acceptance; blocking condition on the Data Asset."),
]
ACTS = [
    ("ACT-DG-1.1", "Develop Data Governance Strategy", "1.1", "Transition-causing", ["REG-DG-STR"], ["TR-STR-01", "TR-STR-02", "TR-STR-07"], ["SVC-DG-01"]),
    ("ACT-DG-1.2", "Perform Readiness Assessment", "1.2", "Transition-causing", ["REG-DG-RDY"], ["TR-RDY-01", "TR-RDY-02", "TR-RDY-04", "TR-RDY-05", "TR-RDY-06"], ["SVC-DG-05"]),
    ("ACT-DG-1.3", "Perform Discovery and Business Alignment", "1.3", "Transition-supporting", ["REG-DG-STR"], ["TR-STR-01", "TR-STR-05", "TR-STR-06"], ["SVC-DG-01"]),
    ("ACT-DG-1.4", "Develop Organizational Touchpoints", "1.4", "Transition-supporting", ["REG-DG-OPM"], ["TR-OPM-01", "TR-OPM-03"], ["SVC-DG-03"]),
    ("ACT-DG-2.1", "Define the Data Governance Operating Framework", "2.1", "Transition-causing", ["REG-DG-OPM"], ["TR-OPM-01", "TR-OPM-02", "TR-OPM-05", "TR-OPM-06"], ["SVC-DG-03"]),
    ("ACT-DG-2.2", "Develop Goals, Principles, and Policies", "2.2", "Transition-causing", ["REG-DG-POL", "REG-DG-INS"], ["TR-POL-01", "TR-POL-02", "TR-POL-05", "TR-INS-01", "TR-INS-04", "TR-INS-08", "TR-INS-09", "TR-INS-10"], ["SVC-DG-07"]),
    ("ACT-DG-2.3", "Underwrite Data Management Projects", "2.3", "Transition-causing", ["REG-DG-STR"], ["TR-STR-03"], ["SVC-DG-02"]),
    ("ACT-DG-2.4", "Engage Change Management", "2.4", "Transition-causing", ["REG-DG-RDY"], ["TR-RDY-03"], ["SVC-DG-06"]),
    ("ACT-DG-2.5", "Engage in Issue Management", "2.5", "Transition-causing", ["REG-DG-ISS"], ["TR-ISS-01", "TR-ISS-02", "TR-ISS-03", "TR-ISS-04", "TR-ISS-05", "TR-ISS-06", "TR-ISS-07", "TR-ISS-08"], ["SVC-DG-09"]),
    ("ACT-DG-2.6", "Assess Regulatory Compliance Requirements", "2.6", "Transition-supporting", ["REG-DG-POL", "REG-DG-INS"], ["TR-POL-01", "TR-POL-04", "TR-INS-02", "TR-INS-03"], ["SVC-DG-07"]),
    ("ACT-DG-3.1", "Sponsor Data Standards and Procedures", "3.1", "Transition-supporting", ["REG-DG-POL", "REG-DG-INS"], ["TR-POL-01", "TR-INS-01", "TR-INS-02", "TR-INS-05", "TR-INS-11"], ["SVC-DG-07"]),
    ("ACT-DG-3.2", "Develop a Business Glossary", "3.2", "State-preserving", ["REG-DG-POL"], ["TR-POL-01"], ["SVC-DG-07"]),
    ("ACT-DG-3.3", "Co-ordinate with Architecture Groups", "3.3", "Transition-supporting", ["REG-DG-POL"], ["TR-POL-01"], ["SVC-DG-07"]),
    ("ACT-DG-3.4", "Sponsor Data Asset Valuation", "3.4", "Transition-causing", ["REG-DG-STR"], ["TR-STR-04"], ["SVC-DG-02"]),
    ("ACT-DG-4", "Embed Data Governance", "4", "Transition-causing", ["REG-DG-OPM", "REG-DG-POL", "REG-DG-RDY", "REG-DG-INS"], ["TR-OPM-04", "TR-OPM-07", "TR-POL-03", "TR-RDY-04", "TR-INS-06", "TR-INS-07"], ["SVC-DG-08", "SVC-DG-06"]),
]
ARTEFACTS = [
    ("ART-DG-01", "Data Governance Strategy", "STS-STR-03", "Develop Data Governance Strategy", "Evidences Approved Strategy."), ("ART-DG-02", "Data Strategy", "STS-STR-03", "Develop Data Governance Strategy", "Evidences Approved Strategy."), ("ART-DG-03", "Business / Data Governance Strategy Roadmap", "STS-STR-03", "Develop Data Governance Strategy", "Evidences Approved Strategy; drives Strategy Execution."),
    ("ART-DG-04", "Data Principles, Data Governance Policies, Processes", "STS-POL-03", "Develop Goals, Principles, and Policies", "Evidences Approved Instruments."), ("ART-DG-05", "Operating Framework", "STS-OPM-03", "Define the Data Governance Operating Framework", "Evidences Approved Operating Model."), ("ART-DG-06", "Roadmap and Implementation Strategy", "STS-STR-04", "Underwrite Data Management Projects", "Evidences Strategy Execution."), ("ART-DG-07", "Operations Plan", "STS-OPM-05", "Embed Data Governance", "Evidences Operating Model in Force."), ("ART-DG-08", "Business Glossary", "STS-POL-03", "Develop a Business Glossary", "Governing instrument; feeds Metadata Management."), ("ART-DG-09", "Data Governance Scorecard", "STS-POL-04", "Embed Data Governance", "Evidences Instruments in Force and compliance."), ("ART-DG-10", "Data Governance Website", "STS-POL-04", "Embed Data Governance", "Communication channel for instruments."), ("ART-DG-11", "Communications Plan", "STS-RDY-04", "Engage Change Management", "Evidences Change Programme."), ("ART-DG-12", "Recognized Data Value", "STS-STR-05", "Sponsor Data Asset Valuation", "Evidences Value Realisation."), ("ART-DG-13", "Maturing Data Management Practices", "STS-RDY-05", "Perform Readiness Assessment", "Evidences Target Readiness."),
]
# How DG contributes to the Global Data Asset Protocol. Expressions use boolean facts the viewer derives from
# the DG State Vector when the DG model is loaded (see factBindings), or from the user's fact toggles otherwise.
CONTRIB = [
    ("CON-DG-01", "TR-EX-01", "guard", {"OPM": ["STS-OPM-04", "STS-OPM-05"]}, "An accountable Data Owner and Steward can be assigned: the DG Operating Model is at Assigned Roles or in force.", "DG_roles_assigned", "Required", "Register Asset needs an owner on record (GA-001)."),
    ("CON-DG-02", "TR-EX-01", "guard", {"POL": ["STS-POL-04"]}, "A registration policy is in force.", "DG_instruments_in_force", "Required", ""),
    ("CON-DG-03", "TR-EX-02", "guard", {"OPM": ["STS-OPM-04", "STS-OPM-05"]}, "Custody accountability exists under the operating model.", "DG_roles_assigned", "Required", ""),
    ("CON-DG-04", "TR-EX-05", "guard", {"POL": ["STS-POL-04"], "ISS": ["STS-ISS-01", "STS-ISS-05"]}, "A retention and disposition policy is in force and no escalated issue is open on the asset.", "DG_instruments_in_force and DG_no_blocking_issue", "Non-waivable", "Escalated issue blocks destruction (region ISS invariant)."),
    ("CON-DG-05", "TR-EX-06", "guard", {"POL": ["STS-POL-04"], "ISS": ["STS-ISS-01", "STS-ISS-05"]}, "A retention and disposition policy is in force and no escalated issue is open on the asset.", "DG_instruments_in_force and DG_no_blocking_issue", "Non-waivable", ""),
    ("CON-DG-06", "TR-AV-01", "guard", {"POL": ["STS-POL-04"], "OPM": ["STS-OPM-04", "STS-OPM-05"]}, "An access and use policy is in force and the Data Owner who may release access is assigned.", "DG_instruments_in_force and DG_roles_assigned", "Required", ""),
    ("CON-DG-07", "TR-AV-04", "guard", {"ISS": ["STS-ISS-01", "STS-ISS-05"]}, "No escalated issue remains open on the asset.", "DG_no_blocking_issue", "Required", ""),
    ("CON-DG-08", "TR-AV-08", "decisionRight", {"OPM": ["STS-OPM-05"]}, "Emergency access authority (DR-08) is exercised by a governance body operating under the operations plan.", "DG_operating_model_in_force", "Required", "DR-08 holder comes from the DG operating model."),
    ("CON-DG-09", "TR-CP-01", "guard", {"OPM": ["STS-OPM-04", "STS-OPM-05"]}, "A custodian (steward) is assigned and accountable.", "DG_roles_assigned", "Required", ""),
    ("CON-DG-10", "TR-CP-04", "guard", {"POL": ["STS-POL-04"]}, "A third-party and external custody policy is in force.", "DG_instruments_in_force", "Required", ""),
    ("CON-DG-11", "TR-CP-05", "guard", {"POL": ["STS-POL-04"], "OPM": ["STS-OPM-05"]}, "Transfer policy in force and the Disposition and Transfer Authorization decision holder exists.", "DG_instruments_in_force and DG_operating_model_in_force", "Required", ""),
    ("CON-DG-12", "TR-AS-01", "service", {"POL": ["STS-POL-03", "STS-POL-04"]}, "Assurance criteria are drawn from approved standards and policies.", "DG_instruments_approved", "Conditional", "Service SVC-DG-07 supplies the criteria."),
    ("CON-DG-13", "TR-AS-05", "event", {"ISS": ["STS-ISS-04"]}, "An escalated governance issue on the asset is a monitoring trigger for assurance suspension.", "DG_escalated_issue", "Conditional", "DG emits EV-AS-05 when an issue is escalated."),
    ("CON-DG-14", "TR-AV-03", "event", {"ISS": ["STS-ISS-04"]}, "An escalated governance issue may require immediate access suspension.", "DG_escalated_issue", "Conditional", "DG emits EV-AV-03 on escalation where severity requires."),
    ("CON-DG-15", "TR-AV-05", "guard", {"POL": ["STS-POL-04"]}, "Withdrawal obligations come from instruments in force.", "DG_instruments_in_force", "Conditional", ""),
    ("CON-DG-16", "TR-AV-07", "event", {"ISS": ["STS-ISS-05"], "POL": ["STS-POL-04"]}, "A resolved or risk-accepted issue under instruments in force is the trigger to reconsider a withdrawal of access.", "DG_instruments_in_force", "Conditional", "Howard, 23 Sep 2026: TR-AV-07 had no contribution of any kind; reconsideration follows a governance decision (DR-DG-07) or a new instrument. Data Governance emits EV-AV-06."),
    ("CON-DG-17", "TR-AV-09", "event", {"POL": ["STS-POL-04"]}, "Emergency access is closed by the authority that granted it (DR-08) once the emergency is over and the access is accounted for.", "DG_instruments_in_force", "Conditional", "Howard, 23 Sep 2026: TR-AV-09 had no contribution of any kind; Data Governance holds the emergency access authority through CON-DG-08. Data Governance emits EV-AV-08."),
]
FACT_BINDINGS = {
    "DG_roles_assigned": {"region": "REG-DG-OPM", "states": ["STS-OPM-04", "STS-OPM-05"]},
    "DG_operating_model_in_force": {"region": "REG-DG-OPM", "states": ["STS-OPM-05"]},
    "DG_instruments_approved": {"region": "REG-DG-POL", "states": ["STS-POL-03", "STS-POL-04"]},
    "DG_instruments_in_force": {"region": "REG-DG-POL", "states": ["STS-POL-04"]},
    "DG_strategy_approved": {"region": "REG-DG-STR", "states": ["STS-STR-03", "STS-STR-04", "STS-STR-05"]},
    "DG_readiness_assessed": {"region": "REG-DG-RDY", "states": ["STS-RDY-03", "STS-RDY-04", "STS-RDY-05"]},
    "DG_no_blocking_issue": {"region": "REG-DG-ISS", "states": ["STS-ISS-01", "STS-ISS-02", "STS-ISS-03", "STS-ISS-05"]},
    "DG_escalated_issue": {"region": "REG-DG-ISS", "states": ["STS-ISS-04"]},
    "DG_version_in_force": {"region": "REG-DG-INS", "states": ["STS-INS-05"]},
    "DG_version_superseded": {"region": "REG-DG-INS", "states": ["STS-INS-06"]},
}
XRG = [
    ("XRG-DG-01", "Roles cannot be assigned before an operating model is approved; the operating model cannot be approved before a strategy is at least in formulation.", ["TR-OPM-02"], "Required", "STR in ('STS-STR-02','STS-STR-03','STS-STR-04','STS-STR-05','STS-STR-06')"),
    ("XRG-DG-02", "Instruments can be published only when roles are assigned to own and enforce them.", ["TR-POL-03"], "Required", "OPM in ('STS-OPM-04','STS-OPM-05')"),
    ("XRG-DG-03", "A change programme is launched only against an accepted readiness baseline and an approved strategy.", ["TR-RDY-03"], "Required", "STR in ('STS-STR-03','STS-STR-04','STS-STR-05')"),
    ("XRG-DG-04", "An issue can be assigned for resolution only when stewards are assigned.", ["TR-ISS-02"], "Required", "OPM in ('STS-OPM-04','STS-OPM-05','STS-OPM-06')"),
    ("XRG-DG-05", "Value realisation requires instruments in force and the operating model in force.", ["TR-STR-04"], "Required", "POL == 'STS-POL-04' and OPM == 'STS-OPM-05'"),
    ("XRG-DG-06", "A policy version is approved, put in force and withdrawn by the Data Governance Council.", ["TR-INS-04", "TR-INS-06", "TR-INS-09"], "Required", "INS_is_policy"),
    ("XRG-DG-07", "A procedure version is approved, put in force and withdrawn by the Data Owner.", ["TR-INS-05", "TR-INS-07", "TR-INS-11"], "Required", "INS_is_procedure"),
    ("XRG-DG-08", "A version goes in force only when its document is published through the repository or declared a record.", ["TR-INS-06", "TR-INS-07"], "Required", "DCM_content_released"),
    ("XRG-DG-09", "At most one version of an instrument is in force: a version goes in force only when it has no predecessor, or its predecessor is the version in force (superseded in the same act) or was withdrawn.", ["TR-INS-06", "TR-INS-07"], "Non-waivable", "INS_predecessor_ok"),
]
KA_COUPLINGS = [
    ("KAC-DG-01", "KA-DCM", "TR-REC-06", "EV-REC-05", "DG_version_superseded", "Superseding a policy or procedure version declares its document a record, so the old version is kept under the retention schedule (TR-INS-08 emits EV-REC-05 on the version's own document).", "Howard, 24 Sep 2026 (Instrument Versions Register), card 6."),
]
VECTORS = [
    ("CFG-DG-01", "Greenfield", {"REG-DG-STR": "STS-STR-01", "REG-DG-OPM": "STS-OPM-01", "REG-DG-RDY": "STS-RDY-01", "REG-DG-POL": "STS-POL-01", "REG-DG-ISS": "STS-ISS-01", "REG-DG-INS": "STS-INS-01"}, "Initial configuration: nothing governs; Global registration is blocked by CON-DG-01 and CON-DG-02."),
    ("CFG-DG-02", "Foundations approved", {"REG-DG-STR": "STS-STR-03", "REG-DG-OPM": "STS-OPM-03", "REG-DG-RDY": "STS-RDY-03", "REG-DG-POL": "STS-POL-03", "REG-DG-ISS": "STS-ISS-01", "REG-DG-INS": "STS-INS-01"}, "Strategy, operating model and instruments approved; roles not yet assigned, so Global registration still blocked."),
    ("CFG-DG-03", "Operating governance", {"REG-DG-STR": "STS-STR-04", "REG-DG-OPM": "STS-OPM-05", "REG-DG-RDY": "STS-RDY-04", "REG-DG-POL": "STS-POL-04", "REG-DG-ISS": "STS-ISS-01", "REG-DG-INS": "STS-INS-01"}, "Legal: all Global contributions satisfied; the Data Asset protocol can run end to end."),
    ("CFG-DG-04", "Escalated issue", {"REG-DG-STR": "STS-STR-04", "REG-DG-OPM": "STS-OPM-05", "REG-DG-RDY": "STS-RDY-04", "REG-DG-POL": "STS-POL-04", "REG-DG-ISS": "STS-ISS-04", "REG-DG-INS": "STS-INS-01"}, "Legal: destruction and access restoration blocked by CON-DG-04, -05, -07; assurance suspension and access suspension events emitted."),
    ("CFG-DG-05", "Mature governance", {"REG-DG-STR": "STS-STR-05", "REG-DG-OPM": "STS-OPM-05", "REG-DG-RDY": "STS-RDY-05", "REG-DG-POL": "STS-POL-04", "REG-DG-ISS": "STS-ISS-01", "REG-DG-INS": "STS-INS-01"}, "Legal: value realised, target readiness, instruments in force."),
]
EVIDENCE = [
    ("EVD-DG-01", "Strategy approval record", "Decision evidence", "TR-STR-02", "Minutes and signed strategy, data strategy and roadmap."), ("EVD-DG-02", "Role assignment register", "Governance evidence", "TR-OPM-03", "Owner and steward assignments per Data Asset; constituted bodies."), ("EVD-DG-03", "Readiness baseline report", "Assessment evidence", "TR-RDY-02", "Maturity level, culture findings, gaps."), ("EVD-DG-04", "Instrument approval and publication record", "Decision evidence", "TR-POL-03", "Approved versions, publication date, compliance monitoring in place."), ("EVD-DG-05", "Issue decision record", "Decision evidence", "TR-ISS-06", "Governance body decision: resolution or risk acceptance."), ("EVD-DG-06", "Data Governance Scorecard", "Control evidence", "TR-POL-04", "Compliance, value, effectiveness and sustainability metrics."), ("EVD-DG-08", "Supersession record", "Governance evidence", "TR-INS-08", "The version superseded, its successor, the date and the approving authority; the superseded document declared a record under the retention schedule."), ("EVD-DG-07", "Refusal record", "Governance evidence", "TR-ISS-01", "The refused request: the Data Asset, the transition asked for, the activity and role that asked, the requesting system and purpose where given, the decision right and its holder, and every guard that answered false with the Knowledge Area that set it and its requirement level."),
]
EXC = [("EXC-DG-01", "Interim Governance Exception", "TR-EX-01", "Registration of an urgent Data Asset before the operating model reaches Assigned Roles.", "DR-DG-03", "Interim owner named, expiry set, compensating oversight by a governance body, evidence retained; never waives CON-DG-04.", "Draft / Approved / Expired / Closed")]

# Coupling roles (Howard, 24 Sep 2026, Influence Map Register card 2 option a): each coupling says which Knowledge Area produces
# the fact and which transitions depend on it. kind condition: the twin engine adds the fact as a guard on every dependent
# transition (Required, or Conditional with a qualifier fact that must be true for the guard to apply). kind event: the
# emitter transitions raise the event in the target Knowledge Area (effect resolve: evidence that resolves the issue the
# named coupling raised). Generated from the coupling text and the fact names, then kept here as the source of truth.
COUPLING_ROLES = {'KAC-DG-01': {'emitters': ['TR-INS-08'],
               'handledBy': "instrument versions (fts_twin.py): the superseded version's own document",
               'kind': 'event',
               'producer': 'KA-DG'}}

# State Contracts register (Howard, 25 Sep 2026, cards 7 and 8 option a): each transition names the policy controls that govern it, by
# policy domain and control number of the Knowledge Area policy in the FutureState workbooks (the wording and the implementing
# procedure are resolved per organisation from the private catalogue spec/policy_controls.json and the workbooks). Drafted
# 25 Sep 2026 for Howard's review (status Proposed); an empty list means no control of the allowed domains fits the step.
POLICY_CONTROLS = {'TR-STR-01': {'controls': [],
               'why': 'No PD-DATA control governs data strategy formulation, approval or execution; the Steering Committee is not the Council named in C06.'},
 'TR-STR-02': {'controls': [],
               'why': 'No PD-DATA control governs data strategy formulation, approval or execution; the Steering Committee is not the Council named in C06.'},
 'TR-STR-03': {'controls': [],
               'why': 'No PD-DATA control governs data strategy formulation, approval or execution; the Steering Committee is not the Council named in C06.'},
 'TR-STR-04': {'controls': [('PD-DATA', 'C15')], 'why': 'Recognised value is reported to the governance forum as a KPI.'},
 'TR-STR-05': {'controls': [],
               'why': 'No PD-DATA control governs data strategy formulation, approval or execution; the Steering Committee is not the Council named in C06. '
                      'C16 reviews the policy, not the strategy.'},
 'TR-STR-06': {'controls': [],
               'why': 'No PD-DATA control governs data strategy formulation, approval or execution; the Steering Committee is not the Council named in C06. '
                      'C16 reviews the policy, not the strategy.'},
 'TR-STR-07': {'controls': [],
               'why': 'No PD-DATA control governs data strategy formulation, approval or execution; the Steering Committee is not the Council named in C06.'},
 'TR-STR-08': {'controls': [],
               'why': 'No PD-DATA control governs data strategy formulation, approval or execution; the Steering Committee is not the Council named in C06.'},
 'TR-OPM-01': {'controls': [('PD-DATA', 'C02')], 'why': 'The operating model design defines the accountable ownership and RACI for Data Governance.'},
 'TR-OPM-02': {'controls': [('PD-DATA', 'C02')], 'why': 'Approving the operating model approves the Data Governance ownership and RACI.'},
 'TR-OPM-03': {'controls': [('PD-DATA', 'C04'), ('PD-DATA', 'C05')],
               'why': 'Owners and stewards are assigned to the governed scope and recorded in the stewardship RACI.'},
 'TR-OPM-04': {'controls': [('PD-DATA', 'C06')], 'why': 'The operating model comes into force when the governance bodies are convened and meeting.'},
 'TR-OPM-05': {'controls': [('PD-DATA', 'C02')], 'why': 'Restructuring reopens the Data Governance ownership and RACI.'},
 'TR-OPM-06': {'controls': [('PD-DATA', 'C02'), ('PD-DATA', 'C04')],
               'why': 'The revised model is approved and changed owner and steward roles are reassigned.'},
 'TR-OPM-07': {'controls': [('PD-DATA', 'C04'), ('PD-DATA', 'C05')],
               'why': 'A vacancy reverses an ownership or stewardship assignment and is recorded against the RACI.'},
 'TR-RDY-01': {'controls': [('PD-DATA', 'C15')], 'why': 'The readiness assessment measures maturity for reporting to the governance forum.'},
 'TR-RDY-02': {'controls': [('PD-DATA', 'C15')], 'why': 'The accepted maturity baseline is a measured result reported to the governance forum.'},
 'TR-RDY-03': {'controls': [], 'why': 'No PD-DATA control governs launching an organisational change programme.'},
 'TR-RDY-04': {'controls': [('PD-DATA', 'C15')], 'why': 'Target readiness is confirmed by measured maturity indicators reported to the forum.'},
 'TR-RDY-05': {'controls': [('PD-DATA', 'C15')], 'why': 'A reassessment re-measures maturity for reporting to the governance forum.'},
 'TR-RDY-06': {'controls': [('PD-DATA', 'C15')], 'why': 'An interim reassessment re-measures maturity for reporting to the governance forum.'},
 'TR-POL-01': {'controls': [('PD-DATA', 'C10')], 'why': 'Instruments under development are entered in the data-policy register and mapped to controls.'},
 'TR-POL-02': {'controls': [('PD-DATA', 'C01'), ('PD-DATA', 'C10')], 'why': 'Instruments are approved and recorded in the data-policy register.'},
 'TR-POL-03': {'controls': [('PD-DATA', 'C01'), ('PD-DATA', 'C11')], 'why': 'Instruments are published and compliance monitoring must be in place.'},
 'TR-POL-04': {'controls': [('PD-DATA', 'C16')], 'why': 'A recorded trigger opens a review of the instruments on change.'},
 'TR-POL-05': {'controls': [('PD-DATA', 'C01'), ('PD-DATA', 'C10')], 'why': 'Revised instruments are approved and the register updated.'},
 'TR-POL-06': {'controls': [('PD-DATA', 'C10')], 'why': 'Retirement removes the instruments from the data-policy register, reversing their registration.'},
 'TR-ISS-01': {'controls': [('PD-DATA', 'C13')], 'why': 'Logging an issue, including one raised by a refused guard, is the compliance exception log.'},
 'TR-ISS-02': {'controls': [('PD-DATA', 'C05'), ('PD-DATA', 'C12')], 'why': 'A steward is assigned under the stewardship RACI and the remediation is tracked.'},
 'TR-ISS-03': {'controls': [('PD-DATA', 'C11'), ('PD-DATA', 'C06')], 'why': 'A blocked issue is escalated as a material breach to the Council.'},
 'TR-ISS-04': {'controls': [('PD-DATA', 'C11'), ('PD-DATA', 'C06')], 'why': 'A severe issue is escalated immediately to the Council.'},
 'TR-ISS-05': {'controls': [('PD-DATA', 'C12')], 'why': 'Resolution evidence closes the tracked remediation.'},
 'TR-ISS-06': {'controls': [('PD-DATA', 'C06'), ('PD-DATA', 'C17')], 'why': 'The Council decides the escalated issue or accepts and treats the residual risk.'},
 'TR-ISS-07': {'controls': [('PD-DATA', 'C14')], 'why': 'Closure evidence is retained as assurance evidence.'},
 'TR-ISS-08': {'controls': [('PD-DATA', 'C13')], 'why': 'A failed or recurring resolution is re-logged through compliance monitoring.'},
 'TR-INS-01': {'controls': [('PD-DATA', 'C10')], 'why': 'The draft is registered with owner, policy domain and predecessor in the data-policy register.'},
 'TR-INS-02': {'controls': [('PD-DATA', 'C16')], 'why': 'The draft is reviewed against the policy it serves and regulatory requirements.'},
 'TR-INS-03': {'controls': [('PD-DATA', 'C16')], 'why': 'Return for rework is an outcome of the same review.'},
 'TR-INS-04': {'controls': [('PD-DATA', 'C01'), ('PD-DATA', 'C10')], 'why': 'The Council approves the policy version and the register records it.'},
 'TR-INS-05': {'controls': [('PD-DATA', 'C10')], 'why': 'The procedure version is approved and recorded against the policy and controls it implements.'},
 'TR-INS-06': {'controls': [('PD-DATA', 'C01'), ('PD-DATA', 'C10')],
               'why': 'The policy version is published and in force and its predecessor superseded in the register.'},
 'TR-INS-07': {'controls': [('PD-DATA', 'C10')], 'why': 'The procedure version goes in force and its predecessor is superseded in the register.'},
 'TR-INS-08': {'controls': [('PD-DATA', 'C10')], 'why': 'Supersession is recorded in the data-policy register naming the successor.'},
 'TR-INS-09': {'controls': [('PD-DATA', 'C01'), ('PD-DATA', 'C10')],
               'why': 'Withdrawing a policy version reverses its approval and publication and is recorded in the register.'},
 'TR-INS-11': {'controls': [('PD-DATA', 'C10')], 'why': 'Withdrawing a procedure version is recorded in the register, reversing its entry into force.'},
 'TR-INS-10': {'controls': [('PD-DATA', 'C10')], 'why': 'Withdrawing an approved version before it is in force is recorded in the register.'}}

# ---------------------------------------------------------------------------------------------------------------
# v0.4 (Howard, 28 Sep 2026, DG Reconstruction register v1 r2 a, v2 s2 c and s8 a): seven per-asset regions, one
# instance per Data Asset (per change request for DCR). They carry the Data Strategy proposal and enhancement, the
# stewardship and policy controls embedded from the operating model, the business term binding, the standards
# conformance evidence and the valuation, and reach the Global protocol through CON-DG-18 to CON-DG-35. Source of the
# content: D:\KA FTS Definitions\DG_Global_FTS_Reconstructed.xlsx (DMBOK2R Chapter 3, pages cited there).
SRC_RECON = "DG_Global_FTS_Reconstructed.xlsx, 28 Sep 2026 (DMBOK2R Chapter 3 pp.71 to 93; DG Reconstruction register v1 and v2)"
REGIONS += [
    ("REG-DG-DAP", "Data Asset Proposal", "DAP", "Whether the Data Strategy has identified a new Data Asset.", "STS-DAP-01", "Exactly one active state per proposed Data Asset.",
     "Data Asset proposal: a new Data Asset identified by the Data Strategy", {"instanceScope": "One instance per proposed Data Asset.", "elementKind": "Per-asset element", "contributesTo": "Existence: identification brings the Digital Twin into being (TR-INIT-EX).", "source": SRC_RECON}),
    ("REG-DG-DCR", "Data Asset Change Request", "DCR", "Whether an enhancement to an existing Data Asset identified by the Data Strategy is raised and how it was approved.", "STS-DCR-01", "Exactly one active state per change request.",
     "Data Asset change request: an enhancement to an existing Data Asset", {"instanceScope": "One instance per change request on a registered Data Asset.", "elementKind": "Per-asset case", "contributesTo": "Existence (replacement triggers TR-EX-03) and Assurance (material change triggers TR-AS-05 or TR-AS-06).", "source": SRC_RECON}),
    ("REG-DG-STW", "Data Asset Stewardship Assignment", "STW", "Whether the Data Asset has a designated Data Owner and an assigned Data Steward.", "STS-STW-01", "Exactly one active state per Data Asset.",
     "Owner and steward accountable for one Data Asset", {"instanceScope": "One instance per Data Asset.", "elementKind": "Per-asset element", "contributesTo": "Existence (owner gates TR-EX-01) and Custody (steward triggers TR-CP-01; gates TR-CP-04 and TR-CP-05).", "source": SRC_RECON}),
    ("REG-DG-PCB", "Data Asset Policy Control Binding", "PCB", "Whether the controls of the policies that apply to the Data Asset are bound and active.", "STS-PCB-01", "Exactly one active state per Data Asset.",
     "Policy controls bound to and operated on one Data Asset", {"instanceScope": "One instance per registered Data Asset.", "elementKind": "Per-asset element", "contributesTo": "Existence, Availability and Custody (active controls gate TR-EX-02, TR-EX-05, TR-EX-06, TR-AV-01, TR-CP-01, TR-CP-04, TR-CP-05) and Assurance (control evidence for TR-AS-02).", "source": SRC_RECON}),
    ("REG-DG-GLS", "Data Asset Business Term Binding", "GLS", "Whether the business terms that give the Data Asset its meaning are bound to it.", "STS-GLS-01", "Exactly one active state per Data Asset.",
     "Business glossary terms bound to one Data Asset (its conceptual meaning)", {"instanceScope": "One instance per Data Asset.", "elementKind": "Per-asset metadata", "contributesTo": "Existence: registration needs the asset described (TR-EX-01).", "source": SRC_RECON}),
    ("REG-DG-SPE", "Data Asset Standards Conformance Evidence", "SPE", "Whether the Data Asset has evidence of conformance with the standards and procedures that apply to it.", "STS-SPE-01", "Exactly one active state per Data Asset.",
     "Conformance evidence for one Data Asset against the standards and procedures sponsored by Data Governance", {"instanceScope": "One instance per registered Data Asset.", "elementKind": "Per-asset evidence", "contributesTo": "Assurance: Confirm Assurance reads the evidence and is blocked by a recorded nonconformance (TR-AS-02).", "source": SRC_RECON}),
    ("REG-DG-VAL", "Data Asset Valuation", "VAL", "Whether a value estimate is recorded for the Data Asset.", "STS-VAL-01", "Exactly one active state per Data Asset.",
     "Value estimate of one Data Asset", {"instanceScope": "One instance per Data Asset.", "elementKind": "Per-asset evidence", "contributesTo": "None directly: the valuation reads Availability (value comes from use).", "source": SRC_RECON}),
]
_R = "DG Reconstruction, 28 Sep 2026"
STATES += [
    ("STS-DAP-01", "REG-DG-DAP", "No Proposal", True, False, "The Data Strategy has not identified this Data Asset.", "Nothing is proposed.", [_R]),
    ("STS-DAP-03", "REG-DG-DAP", "Realised Proposal", False, True, "The proposed Data Asset has been registered (Global TR-EX-01); the proposal has done its work.", "The proposal and the registration that realised it remain traceable.", [_R]),
    ("STS-DAP-02", "REG-DG-DAP", "Proposed Data Asset", False, False, "The Data Strategy identifies the Data Asset with its purpose and sponsor; its Digital Twin exists in Proposal.", "Purpose, sponsor and the strategy that proposed it remain traceable.", ["deliverable:Data Strategy", "p.34", "p.71"]),
    ("STS-DCR-01", "REG-DG-DCR", "No Change Request", True, False, "No enhancement is requested.", "Nothing is requested.", [_R]),
    ("STS-DCR-02", "REG-DG-DCR", "Raised Change Request", False, False, "An enhancement to the Data Asset is raised from the Data Strategy, discovery, a project or a term revision.", "Requester, asset and change remain identifiable.", ["p.82", "p.86", "p.92"]),
    ("STS-DCR-03", "REG-DG-DCR", "Approved Replacement", False, True, "The change is approved as a replacement of the current version.", "Approval, successor and approving authority remain traceable.", [_R]),
    ("STS-DCR-04", "REG-DG-DCR", "Approved Material Change", False, True, "The change is approved and is material to the assurance claim.", "Approval and the reason it is material remain traceable.", [_R]),
    ("STS-DCR-05", "REG-DG-DCR", "Approved Minor Change", False, True, "The change is approved and is not material.", "Approval and the materiality check remain traceable.", [_R]),
    ("STS-STW-01", "REG-DG-STW", "No Accountable Owner", True, False, "No Data Owner is designated for the Data Asset.", "The absence of an owner remains visible.", [_R]),
    ("STS-STW-02", "REG-DG-STW", "Owner Designated", False, False, "A Data Owner is designated and approved by the Data Governance Office (p.86).", "The owner and the approving body remain current.", ["p.84", "p.86"]),
    ("STS-STW-03", "REG-DG-STW", "Stewarded", False, False, "The Data Owner has designated a Data Steward, who accepts accountability for the Data Asset (p.86).", "Owner and steward remain current and accountable.", ["p.78", "p.86"]),
    ("STS-PCB-01", "REG-DG-PCB", "No Controls Bound", True, False, "No policy controls are bound to the Data Asset.", "Nothing is bound.", [_R]),
    ("STS-PCB-02", "REG-DG-PCB", "Controls Bound", False, False, "The controls of the applicable policies are bound to the Data Asset but not yet operating.", "The bound controls and the policies they come from remain traceable.", ["p.83", "p.87"]),
    ("STS-PCB-03", "REG-DG-PCB", "Controls Active", False, False, "The bound controls operate on the Data Asset and produce evidence.", "Each active control, its operator and its evidence remain current.", ["p.93"]),
    ("STS-GLS-01", "REG-DG-GLS", "No Terms Bound", True, False, "No business terms are bound to the Data Asset.", "Nothing is bound.", [_R]),
    ("STS-GLS-02", "REG-DG-GLS", "Terms Bound", False, False, "Business terms from the glossary are bound to the Data Asset, giving it its business meaning.", "Each bound term, its definition and its steward remain current.", ["p.92"]),
    ("STS-SPE-01", "REG-DG-SPE", "No Conformance Evidence", True, False, "No evidence of conformance with standards and procedures is recorded.", "Nothing is recorded.", [_R]),
    ("STS-SPE-02", "REG-DG-SPE", "Conforming", False, False, "Evidence shows the Data Asset conforms to the standards and procedures that apply.", "Evidence, standard and assessor remain traceable.", ["p.91"]),
    ("STS-SPE-03", "REG-DG-SPE", "Nonconforming", False, False, "A nonconformance with a standard or procedure is recorded.", "The nonconformance and the standard remain traceable.", ["p.91"]),
    ("STS-VAL-01", "REG-DG-VAL", "No Valuation", True, False, "No value estimate is recorded.", "Nothing is recorded.", [_R]),
    ("STS-VAL-02", "REG-DG-VAL", "Valued", False, False, "A value estimate of the Data Asset is recorded using the approved valuation method.", "Method, basis and date remain traceable.", ["p.80", "p.93"]),
]
EVENTS.update({
    "EV-DAP-01": ("New Data Asset identified in the Data Strategy", "Decision outcome"),
    "EV-DCR-01": ("Change request raised", "Request"), "EV-DCR-02": ("Replacement approved", "Decision outcome"), "EV-DCR-03": ("Material change approved", "Decision outcome"), "EV-DCR-04": ("Minor change approved", "Decision outcome"),
    "EV-STW-01": ("Data Owner designated", "Decision outcome"), "EV-STW-02": ("Data Steward assigned", "Decision outcome"), "EV-STW-03": ("Steward vacancy recorded", "Monitoring trigger"),
    "EV-PCB-01": ("Policy controls bound", "Decision outcome"), "EV-PCB-02": ("Policy controls activated", "Decision outcome"),
    "EV-GLS-01": ("Business terms bound", "Decision outcome"),
    "EV-SPE-01": ("Conformance evidence recorded", "Evidence trigger"), "EV-SPE-02": ("Nonconformance recorded", "Assessment outcome"),
    "EV-VAL-01": ("Valuation recorded", "Evidence trigger"),
    "EV-DAP-02": ("Proposal withdrawn in a Data Strategy revision", "Decision outcome"),
    "EV-DAP-03": ("Data Asset registered (Global TR-EX-01 fired)", "State change notification"),
    "EV-PCB-03": ("Governing policy version superseded", "Monitoring trigger"),
    "EV-GLS-02": ("Bound business term revised", "Monitoring trigger"),
    "EV-SPE-03": ("Nonconformance corrected", "Evidence trigger"),
    "EV-VAL-02": ("Valuation refreshed", "Evidence trigger"),
})
DR.update({
    "DR-DG-20": ("Approve a Minor Data Asset Change", "ROLE-DO", "Confirmed 28 Sep 2026 (DG Reconstruction register t5 b): the Data Owner approves minor changes"),
    "DR-DG-26": ("Approve a Data Asset Replacement or Material Change", "ROLE-DGC", "Confirmed 28 Sep 2026 (DG Reconstruction register t5 b): the Data Governance Council approves replacements and material changes, which affect other assets and consumers"),
    "DR-DG-21": ("Raise a Data Asset Change Request", "ROLE-BDS", "Confirmed 28 Sep 2026 (DG Reconstruction register t5 b): Business Data Steward"),
    "DR-DG-22": ("Designate a Data Steward", "ROLE-DO", "Confirmed 28 Sep 2026 (DG Reconstruction register t5 b): 'Data owners will designate Data Stewards' (DMBOK2R p.86)"),
    "DR-DG-23": ("Bind and Activate Policy Controls on a Data Asset", "ROLE-DO", "Confirmed 28 Sep 2026 (DG Reconstruction register t5 b): the Data Owner"),
    "DR-DG-24": ("Approve Business Term Binding", "ROLE-BDS", "Confirmed 28 Sep 2026 (DG Reconstruction register t5 b): Business Data Stewards are responsible for glossary content (DMBOK2R p.92)"),
    "DR-DG-25": ("Record Standards Conformance", "ROLE-DGC", "Confirmed 28 Sep 2026 (DG Reconstruction register t5 b): audited by the DGC or a Data Standards Steering Committee (DMBOK2R p.91)"),
})
TRANS += [
    ("TR-DAP-01", "Identify New Data Asset in the Data Strategy", "STS-DAP-01", "STS-DAP-02", "EV-DAP-01", "The Data Strategy names the Data Asset with its purpose and sponsor.", "DR-DG-01", ["SVC-DG-01"], ["ACT-DG-1.1"]),
    ("TR-DCR-01", "Raise Change Request for an Existing Data Asset", "STS-DCR-01", "STS-DCR-02", "EV-DCR-01", "The asset is registered and the requested change is described.", "DR-DG-21", ["SVC-DG-01"], ["ACT-DG-1.1"]),
    ("TR-DCR-02", "Approve Replacement", "STS-DCR-02", "STS-DCR-03", "EV-DCR-02", "A successor is identified and the change replaces the current version.", "DR-DG-26", ["SVC-DG-01"], ["ACT-DG-1.1"]),
    ("TR-DCR-03", "Approve Material Change", "STS-DCR-02", "STS-DCR-04", "EV-DCR-03", "The change is material to identity, representation, custody or use.", "DR-DG-26", ["SVC-DG-01"], ["ACT-DG-1.1"]),
    ("TR-DCR-04", "Approve Minor Change", "STS-DCR-02", "STS-DCR-05", "EV-DCR-04", "The change is not material to the assurance claim.", "DR-DG-20", ["SVC-DG-01"], ["ACT-DG-1.1"]),
    ("TR-STW-01", "Designate Data Owner", "STS-STW-01", "STS-STW-02", "EV-STW-01", "An owner role exists under the operating model and the Data Governance Office approves the owner.", "DR-DG-03", ["SVC-DG-04"], ["ACT-DG-2.1"]),
    ("TR-STW-02", "Assign Data Steward", "STS-STW-02", "STS-STW-03", "EV-STW-02", "The Data Owner designates a steward who accepts accountability.", "DR-DG-22", ["SVC-DG-04"], ["ACT-DG-4"]),
    ("TR-STW-03", "Record Stewardship Vacancy", "STS-STW-03", "STS-STW-02", "EV-STW-03", "The steward has left the role and no successor is designated.", "DR-DG-12", ["SVC-DG-04"], ["ACT-DG-4"]),
    ("TR-PCB-01", "Bind Policy Controls", "STS-PCB-01", "STS-PCB-02", "EV-PCB-01", "The asset is registered and the applicable policies and their controls are identified.", "DR-DG-23", ["SVC-DG-08"], ["ACT-DG-4"]),
    ("TR-PCB-02", "Activate Policy Controls", "STS-PCB-02", "STS-PCB-03", "EV-PCB-02", "Each bound control has an operator and produces evidence.", "DR-DG-23", ["SVC-DG-08"], ["ACT-DG-4"]),
    ("TR-GLS-01", "Bind Business Terms to Data Asset", "STS-GLS-01", "STS-GLS-02", "EV-GLS-01", "The terms are defined in the glossary with their steward.", "DR-DG-24", ["SVC-DG-07"], ["ACT-DG-3.2"]),
    ("TR-SPE-01", "Record Standards Conformance Evidence", "STS-SPE-01", "STS-SPE-02", "EV-SPE-01", "The asset is measured against the standards that apply and conforms.", "DR-DG-25", ["SVC-DG-08"], ["ACT-DG-3.1"]),
    ("TR-SPE-02", "Record Standards Nonconformance", "STS-SPE-02", "STS-SPE-03", "EV-SPE-02", "A measurement or audit finds a nonconformance.", "DR-DG-25", ["SVC-DG-08"], ["ACT-DG-3.1"]),
    ("TR-VAL-01", "Record Data Asset Valuation", "STS-VAL-01", "STS-VAL-02", "EV-VAL-01", "The approved valuation method is applied to the asset.", "DR-DG-09", ["SVC-DG-02"], ["ACT-DG-3.4"]),
    ("TR-DAP-02", "Withdraw Data Asset Proposal", "STS-DAP-02", "STS-DAP-01", "EV-DAP-02", "A revision of the Data Strategy no longer identifies the Data Asset and it was never registered.", "DR-DG-01", ["SVC-DG-01"], ["ACT-DG-1.1"]),
    ("TR-DAP-03", "Realise Data Asset Proposal", "STS-DAP-02", "STS-DAP-03", "EV-DAP-03", "Register Asset (Global TR-EX-01) has fired for this Data Asset.", "DR-DG-01", ["SVC-DG-01"], ["ACT-DG-1.1"]),
    ("TR-PCB-03", "Rebind Controls after Policy Change", "STS-PCB-03", "STS-PCB-02", "EV-PCB-03", "A policy that applies to the asset has a new version in force and its controls must be bound again.", "DR-DG-23", ["SVC-DG-08"], ["ACT-DG-4"]),
    ("TR-GLS-02", "Unbind Revised Business Terms", "STS-GLS-02", "STS-GLS-01", "EV-GLS-02", "A bound term is revised in the glossary and the binding must be confirmed again.", "DR-DG-24", ["SVC-DG-07"], ["ACT-DG-3.2"]),
    ("TR-SPE-03", "Record Corrected Conformance", "STS-SPE-03", "STS-SPE-02", "EV-SPE-03", "The nonconformance is corrected and new evidence shows conformance.", "DR-DG-25", ["SVC-DG-08"], ["ACT-DG-3.1"]),
    ("TR-VAL-02", "Refresh Data Asset Valuation", "STS-VAL-02", "STS-VAL-02", "EV-VAL-02", "The approved valuation method is applied again on its review cycle.", "DR-DG-09", ["SVC-DG-02"], ["ACT-DG-3.4"]),
]
CONTRIB += [
    ("CON-DG-18", "TR-INIT-EX", "event", {"DAP": ["STS-DAP-02"]}, "A Data Asset identified in the Data Strategy brings its Digital Twin into being in Proposal.", "DG_asset_proposed", "Conditional", "DG Reconstruction DG-RL-005 to 008."),
    ("CON-DG-19", "TR-EX-01", "guard", {"STW": ["STS-STW-02", "STS-STW-03"]}, "The Data Asset has a designated Data Owner.", "DG_owner_designated", "Required", "Per-asset owner; CON-DG-01 keeps the organisation-level roles (register s5 b)."),
    ("CON-DG-20", "TR-EX-01", "guard", {"GLS": ["STS-GLS-02"]}, "The business terms that give the asset its meaning are bound.", "DG_terms_bound", "Required", "Register s2 comment: the glossary gives the asset its meaning."),
    ("CON-DG-21", "TR-EX-03", "event", {"DCR": ["STS-DCR-03"]}, "An approved replacement supersedes the current version.", "DG_replacement_approved", "Conditional", ""),
    ("CON-DG-22", "TR-AS-05", "event", {"DCR": ["STS-DCR-04"]}, "An approved material change suspends the assurance claim until reassessed.", "DG_material_change_approved", "Conditional", ""),
    ("CON-DG-23", "TR-AS-06", "event", {"DCR": ["STS-DCR-04"]}, "An approved material change suspends conditional assurance until reassessed.", "DG_material_change_approved", "Conditional", ""),
    ("CON-DG-24", "TR-CP-01", "event", {"STW": ["STS-STW-03"]}, "Assigning the steward establishes active custody of the materialised asset.", "DG_asset_stewarded", "Conditional", ""),
    ("CON-DG-25", "TR-CP-04", "guard", {"STW": ["STS-STW-03"]}, "An accountable steward is assigned before external custody.", "DG_asset_stewarded", "Required", ""),
    ("CON-DG-26", "TR-CP-05", "guard", {"STW": ["STS-STW-03"]}, "An accountable steward is assigned before a custody transfer.", "DG_asset_stewarded", "Required", ""),
    ("CON-DG-27", "TR-EX-02", "guard", {"PCB": ["STS-PCB-03"]}, "Minimum policy controls are active on the asset.", "DG_controls_active", "Required", ""),
    ("CON-DG-28", "TR-AV-01", "guard", {"PCB": ["STS-PCB-03"]}, "Policy controls are active before access is released.", "DG_controls_active", "Required", ""),
    ("CON-DG-29", "TR-CP-01", "guard", {"PCB": ["STS-PCB-03"]}, "Protection controls are active when custody is established.", "DG_controls_active", "Required", ""),
    ("CON-DG-30", "TR-EX-05", "guard", {"PCB": ["STS-PCB-03"]}, "Disposition controls are active before destruction.", "DG_controls_active", "Required", ""),
    ("CON-DG-31", "TR-EX-06", "guard", {"PCB": ["STS-PCB-03"]}, "Disposition controls are active before destruction of a superseded asset.", "DG_controls_active", "Required", ""),
    ("CON-DG-32", "TR-CP-04", "guard", {"PCB": ["STS-PCB-03"]}, "Controls are active before external custody.", "DG_controls_active", "Required", ""),
    ("CON-DG-33", "TR-CP-05", "guard", {"PCB": ["STS-PCB-03"]}, "Controls are active before a custody transfer.", "DG_controls_active", "Required", ""),
    ("CON-DG-34", "TR-AS-02", "service", {"PCB": ["STS-PCB-03"], "SPE": ["STS-SPE-02"]}, "Operating controls and standards conformance supply the evidence Confirm Assurance cites.", "DG_controls_active and DG_standards_conforming", "Conditional", ""),
    ("CON-DG-35", "TR-AS-02", "guard", {"SPE": ["STS-SPE-01", "STS-SPE-02"]}, "No nonconformance with a standard is recorded.", "DG_no_nonconformance", "Required", ""),
]
FACT_BINDINGS.update({
    "DG_asset_proposed": {"region": "REG-DG-DAP", "states": ["STS-DAP-02"]},
    "DG_owner_designated": {"region": "REG-DG-STW", "states": ["STS-STW-02", "STS-STW-03"]},
    "DG_asset_stewarded": {"region": "REG-DG-STW", "states": ["STS-STW-03"]},
    "DG_terms_bound": {"region": "REG-DG-GLS", "states": ["STS-GLS-02"]},
    "DG_replacement_approved": {"region": "REG-DG-DCR", "states": ["STS-DCR-03"]},
    "DG_material_change_approved": {"region": "REG-DG-DCR", "states": ["STS-DCR-04"]},
    "DG_controls_active": {"region": "REG-DG-PCB", "states": ["STS-PCB-03"]},
    "DG_standards_conforming": {"region": "REG-DG-SPE", "states": ["STS-SPE-02"]},
    "DG_no_nonconformance": {"region": "REG-DG-SPE", "states": ["STS-SPE-01", "STS-SPE-02"]},
})
_ADD = {"ACT-DG-1.1": (["REG-DG-DAP", "REG-DG-DCR"], ["TR-DAP-01", "TR-DCR-01", "TR-DCR-02", "TR-DCR-03", "TR-DCR-04"], None),
        "ACT-DG-2.1": (["REG-DG-STW"], ["TR-STW-01"], None),
        "ACT-DG-3.1": (["REG-DG-SPE"], ["TR-SPE-01", "TR-SPE-02"], "Transition-causing"),
        "ACT-DG-3.2": (["REG-DG-GLS"], ["TR-GLS-01"], "Transition-causing"),
        "ACT-DG-3.4": (["REG-DG-VAL"], ["TR-VAL-01"], None),
        "ACT-DG-4": (["REG-DG-STW", "REG-DG-PCB"], ["TR-STW-02", "TR-STW-03", "TR-PCB-01", "TR-PCB-02"], None)}
for _i, _a in enumerate(ACTS):
    if _a[0] in _ADD:
        _rg, _tr, _cls = _ADD[_a[0]]
        _trs = [t for t in _a[5] if not (_a[0] == "ACT-DG-3.2" and t == "TR-POL-01")] + _tr
        ACTS[_i] = (_a[0], _a[1], _a[2], _cls or _a[3], _a[4] + _rg, _trs, _a[6])
_INIT = {r[0]: r[4] for r in REGIONS}
for _v in VECTORS:
    for _rid in ("REG-DG-DAP", "REG-DG-DCR", "REG-DG-STW", "REG-DG-PCB", "REG-DG-GLS", "REG-DG-SPE", "REG-DG-VAL"):
        _v[2].setdefault(_rid, _INIT[_rid])
for _t in ["TR-DAP-01", "TR-DCR-01", "TR-DCR-02", "TR-DCR-03", "TR-DCR-04", "TR-STW-01", "TR-STW-02", "TR-STW-03", "TR-PCB-01", "TR-PCB-02", "TR-GLS-01", "TR-SPE-01", "TR-SPE-02", "TR-VAL-01"]:
    POLICY_CONTROLS.setdefault(_t, {"controls": [], "why": "Drafted 28 Sep 2026 (DG Reconstruction): policy controls for this per-asset transition not yet mapped; REVIEW."})
POLICY_CONTROLS["TR-STW-01"] = {"controls": [("PD-DATA", "C04")], "why": "The Data Owner is designated for the asset and recorded in the stewardship RACI."}
POLICY_CONTROLS["TR-STW-02"] = {"controls": [("PD-DATA", "C05")], "why": "The Data Steward is assigned for the asset and recorded in the stewardship RACI."}
POLICY_CONTROLS["TR-STW-03"] = {"controls": [("PD-DATA", "C05")], "why": "A steward vacancy reverses the stewardship assignment."}

SPEC = {
    "meta": {"modelId": "KA-DG", "name": "Data Governance FTS", "knowledgeArea": "Data Governance", "version": "0.5", "subjectType": KA_SUBJECT, "regionModel": "One FTS per managed element: the regions are separate machines that run concurrently and are coupled by events, facts and cross-region constraints, never a single subject.", "source": SRC_DECK + "; " + SRC_HOWARD + "; " + SRC_PROTOCOL,
             "note": "Five state regions, each its own FTS over one managed element of the Knowledge Area (strategy, operating model, readiness, governing instruments, Data Asset issue), derived from the DMBOK context diagram. Region 5 manages issues raised by every Knowledge Area. The KA never becomes a region of the Data Asset; each region reaches the Global protocol through contributions (guards, decision rights, services, events) listed on the Contributions sheet and federated onto the Global transitions in the viewer.",
             "definition": CONTEXT["definition"], "factBindings": FACT_BINDINGS,
             "assetFacts": {"INS_is_policy": {"default": False, "meaning": "the instrument version is a Policy (the Council approves it)"},
                            "INS_is_procedure": {"default": False, "meaning": "the instrument version is a Procedure of a policy (the Data Owner approves it)"},
                            "INS_predecessor_ok": {"default": True, "meaning": "the version has no predecessor, or its predecessor is the version in force or was withdrawn (XRG-DG-09)"}},
             "derivedFacts": {"<KA>_policy_set_in_force": "For each Knowledge Area (DG, DA, DMD, DSO, DII, MM, DQ, DS, DHE, DWBI, BDA, RMD, DCM): the instrument set of the policy domain named for it is in force, that is its Policy and every Procedure of that Policy has a version in force. Computed per governed scope from the REG-DG-INS instances by the twin.",
                              "POLDOM_<domain>_in_force": "The same test for every other policy domain of the organisation (Howard, 24 Sep 2026: every policy domain is its own set).",
                              "REG-DG-POL": "The scope's roll-up of the sets: Instruments in Force when every counted set is in force; otherwise Approved Instruments when any version is approved or in force, Instrument Development when any is drafted, No Governing Instruments when none exists. Instrument Review is entered only by TR-POL-04 so a successor in draft never withdraws the set in force."}},
    "context": CONTEXT, "regions": REGIONS, "states": STATES, "transitions": TRANS, "events": EVENTS, "decisionRights": DR, "roles": ROLES, "artefacts": ARTEFACTS, "activities": ACTS, "services": SERVICES, "contributions": CONTRIB, "crossRegionConstraints": XRG, "kaCouplings": KA_COUPLINGS, "couplingRoles": COUPLING_ROLES, "policyControls": POLICY_CONTROLS, "stateVectors": VECTORS, "evidence": EVIDENCE, "exceptions": EXC,
    "sources": [
        {"id": "SRC-DG-001", "source": SRC_DECK, "type": "Primary (image pages, captured)", "location": "Chat upload; OneDrive Data Lifecycle folder", "use": "Definition, goals, drivers, inputs, processes and sub-activities, deliverables, role players, techniques, tools, metrics", "limitations": "Process 4 Embed Data Governance carries no sub-activities on the diagram."},
        {"id": "SRC-DG-002", "source": SRC_HOWARD, "type": "Design direction", "location": "Chat", "use": "Region set, subject, start-from-definition method", "limitations": ""},
        {"id": "SRC-DG-003", "source": SRC_PROTOCOL, "type": "Alignment target", "location": "Private repo models/", "use": "Global transition IDs for contributions", "limitations": ""},
    ],
    "qaNotes": [
        {"severity": "note", "rule": "decision", "element": "ACT-DG-3.1, ACT-DG-3.2", "finding": "One class per activity (DG Reconstruction register t4 a, 28 Sep 2026): 3.1 and 3.2 are Transition-causing because they fire TR-SPE and TR-GLS. Their supporting links to the policy and instrument transitions are recorded in DG_Global_FTS_Reconstructed.xlsx (06 Transition Analysis), not in this model."},
        {"severity": "note", "rule": "decision", "element": "DR-DG-20, DR-DG-26", "finding": "Register t5 b, 28 Sep 2026: the Data Governance Council approves replacements and material changes (DR-DG-26 on TR-DCR-02, TR-DCR-03); the Data Owner approves minor changes (DR-DG-20 on TR-DCR-04). DR-DG-21 to DR-DG-25 confirmed as drafted."},
        {"severity": "note", "rule": "decision", "element": "REG-DG-DAP", "finding": "Register t6 a, 28 Sep 2026: the proposal ends in Realised Proposal when Register Asset fires (TR-DAP-03). A proposal withdrawn before registration (TR-DAP-02) leaves the Global twin in Proposal, because the Global FTS has no transition out of Proposal other than TR-EX-01 (open item DG-OPEN-006)."},
        {"severity": "note", "rule": "capture", "element": "process:4", "finding": "Embed Data Governance (C,O) has no sub-activities on the DMBOK context diagram; ACT-DG-4 is scoped from the region definitions (decision 21 Sep 2026)."},
        {"severity": "note", "rule": "GA-005", "element": "KA-DG", "finding": "Regions STR, OPM, RDY and POL manage scope-level elements that change rarely relative to a Data Asset; they gate Global transitions as preconditions (contributions), which is the loose coupling GA-009 asks for. Region ISS manages one case per issue and is the only region instantiated per Data Asset event."},
        {"severity": "note", "rule": "N-016", "element": "DR-DG-08..18", "finding": "Decision Rights DR-DG-08 to DR-DG-18 exist so that every transition carries one (decision 21 Sep 2026); holders confirmed 22 Sep 2026 on the holder register."},
        {"severity": "note", "rule": "derived", "element": "STATES", "finding": "All state names, events, decision rights and services are first-pass drafts from the context diagram; every one is for Howard's review."},
        {"severity": "note", "rule": "decision", "element": "TR-ISS-01", "finding": "Refusals raise issues (Howard, 23 Sep 2026): a refused transition raises one Data Governance Data Issue when at least one Non-waivable or Required guard answered false. One issue per refusal, not one per guard, listing every failing guard and its source Knowledge Area. A Conditional-only refusal is recorded but raises nothing. In the twin the issue is its own instance carrying REG-DG-ISS, as the region's rule requires, and the Data Asset's own issue state is the most severe state of the issues open against it, so CON-DG-04, CON-DG-05 and CON-DG-07 keep working."},
        {"severity": "note", "rule": "decision", "element": "TR-ISS-01", "finding": "The twin assigns (TR-ISS-02) and resolves (TR-ISS-05) a refusal-sourced issue when the refused transition later fires, because the guards that refused it then answer true. Closure, TR-ISS-07, stays a deliberate act of the Data Owner under DR-DG-18: the twin has no evidence that closure records were retained."},
        {"severity": "note", "rule": "N-016", "element": "GDA-GLOBAL-PROTOCOL ACT-19, ACT-20", "finding": "Requester block (Howard, 23 Sep 2026): every event must name the activity that asked for the transition and the role that asked. Ten Global transitions were claimed by no activity, among them the whole Availability release, restriction and withdrawal family that DR-06 authorises. Closed on 23 Sep 2026 by ACT-19 Release, Restrict or Withdraw Access (TR-AV-01, -02, -05, -06, -07, -10) and ACT-20 Grant and Close Emergency Access (TR-AV-08, -09) in Global protocol v0.2.2. TR-AS-09 and TR-AS-10 stay unclaimed by design: assurance expiry is a time trigger raised by Data Quality (CON-DQ-09, CON-DQ-10), not an act anyone performs."},
        {"severity": "note", "rule": "decision", "element": "REG-DG-INS", "finding": "Governing instrument versions (Howard, 24 Sep 2026 (Instrument Versions Register)): one instance per version of a policy or procedure, seven states, automatic supersession when a successor goes in force (XRG-DG-09 keeps one version in force), the version's document in DCM gates going in force (XRG-DG-08) and is declared a record when superseded (KAC-DG-01), the Council approves policies (DR-DG-04) and the Data Owner procedures (DR-DG-19), every policy domain is its own set with its own fact, and REG-DG-POL becomes the roll-up of the sets. Drafted by Claude for confirmation: DR-DG-15 on draft, review, rework and the withdrawal of an approved version; DR-DG-04 on supersession and on withdrawal of a version in force."},
        {"severity": "note", "rule": "N-017", "element": "TR-STR-08, TR-OPM-07, TR-POL-06", "finding": "Three Data Governance transitions were claimed by no activity (24 Sep 2026). TR-OPM-07 Record Role Vacancy is claimed by ACT-DG-4 Embed Data Governance on Howard's pick: the vacancy is found while the operating model is in force. TR-STR-08 and TR-POL-06 already named ACT-DG-1.1 and ACT-DG-2.2; the builder now adds the back-link. Howard asked whether withdrawal is really supersession by a newly approved version; that question is open."},
    ],
}

if __name__ == "__main__":
    from ka_build import run_spec
    run_spec(SPEC, "data_governance.fts.json")
