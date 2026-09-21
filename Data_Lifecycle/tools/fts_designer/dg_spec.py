#!/usr/bin/env python3
"""
dg_spec.py  -  Data Governance FTS v0.2: five state regions, each its own FTS over one managed element of the
Knowledge Area, derived from the DMBOK Data Governance context diagram (deck pages 18 to 21) and aligned to the
Global Data Asset Protocol.

Howard's regions (20 Sep 2026): 1 Strategy and Value Realisation; 2 Operating Model (federation,
ownership, stewardship / custody); 3 Readiness (maturity, culture, change); 4 Principles, Policies,
Procedures and Business Reference Architecture; 5 Data Asset Issue Management.
Decision 21 Sep 2026: the regions are separate FTSs, one per managed element, not conditions of a single
"capability" subject. Each region names the element it manages and the conditions that matter to the KA.
Region 5 manages Data Asset issues raised by every Knowledge Area: DG handles issue management for all of them.
v0.2 also renames STS-OPM-04 to "Assigned Roles" and gives every transition a Decision Right (drafted holders
flagged REVIEW).

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
]
EVENTS = {
    "EV-STR-01": ("Strategy initiation", "Request"), "EV-STR-02": ("Strategy approval", "Decision outcome"), "EV-STR-03": ("Roadmap execution start", "Decision outcome"), "EV-STR-04": ("Value evidenced", "Evidence trigger"), "EV-STR-05": ("Material change in direction", "Monitoring trigger"), "EV-STR-06": ("Revised strategy approval", "Decision outcome"), "EV-STR-07": ("Strategy withdrawal", "Decision outcome"),
    "EV-OPM-01": ("Operating model design initiation", "Request"), "EV-OPM-02": ("Operating model approval", "Decision outcome"), "EV-OPM-03": ("Roles assigned and bodies constituted", "Evidence trigger"), "EV-OPM-04": ("Operations plan activation", "Decision outcome"), "EV-OPM-05": ("Restructuring trigger", "Monitoring trigger"), "EV-OPM-06": ("Revised operating model approval", "Decision outcome"), "EV-OPM-07": ("Role vacancy", "Monitoring trigger"),
    "EV-RDY-01": ("Assessment initiation", "Request"), "EV-RDY-02": ("Assessment completion", "Assessment outcome"), "EV-RDY-03": ("Change programme launch", "Decision outcome"), "EV-RDY-04": ("Target reached", "Assessment outcome"), "EV-RDY-05": ("Reassessment due", "Time trigger"),
    "EV-POL-01": ("Instrument development initiation", "Request"), "EV-POL-02": ("Instrument approval", "Decision outcome"), "EV-POL-03": ("Instrument publication", "Decision outcome"), "EV-POL-04": ("Regulatory or compliance trigger", "Monitoring trigger"), "EV-POL-05": ("Revised instrument approval", "Decision outcome"), "EV-POL-06": ("Instrument retirement", "Decision outcome"),
    "EV-ISS-01": ("Issue logged by a Knowledge Area", "Request"), "EV-ISS-02": ("Resolution assigned", "Decision outcome"), "EV-ISS-03": ("Escalation", "Decision outcome"), "EV-ISS-04": ("Resolution or risk acceptance", "Decision outcome"), "EV-ISS-05": ("Issue closure", "Evidence trigger"), "EV-ISS-06": ("Issue reopened", "Monitoring trigger"),
}
DR = {
    "DR-DG-01": ("Approve Data Governance Strategy and Roadmap", "ROLE-DG-P01"), "DR-DG-02": ("Approve Operating Framework and Federation Model", "ROLE-DG-P01"), "DR-DG-03": ("Assign Data Owners and Stewards", "ROLE-DG-P03"),
    "DR-DG-04": ("Approve Governing Instruments", "ROLE-DG-P07"), "DR-DG-05": ("Authorize Change Programme", "ROLE-DG-P02"), "DR-DG-06": ("Escalate and Decide Data Asset Issues", "ROLE-DG-P07"), "DR-DG-07": ("Accept Residual Risk on an Issue", "ROLE-DG-P01"),
    # v0.2: decision 21 Sep 2026, every transition carries a Decision Right; holders drafted, flagged REVIEW
    "DR-DG-08": ("Mandate Strategy Formulation", "ROLE-DG-P01", "REVIEW: drafted holder"),
    "DR-DG-09": ("Sponsor Data Asset Valuation and Recognise Value", "ROLE-DG-P09", "REVIEW: drafted holder"),
    "DR-DG-10": ("Open a Strategy Revision", "ROLE-DG-P03", "REVIEW: drafted holder"),
    "DR-DG-11": ("Mandate Operating Model Design or Restructuring", "ROLE-DG-P03", "REVIEW: drafted holder"),
    "DR-DG-12": ("Declare a Role Vacancy", "ROLE-DG-P03", "REVIEW: drafted holder"),
    "DR-DG-13": ("Commission a Readiness Assessment", "ROLE-DG-P03", "REVIEW: drafted holder"),
    "DR-DG-14": ("Accept Readiness Baseline and Target", "ROLE-DG-P01", "REVIEW: drafted holder"),
    "DR-DG-15": ("Mandate Instrument Development or Review", "ROLE-DG-P07", "REVIEW: drafted holder"),
    "DR-DG-16": ("Log, Triage and Reopen a Data Asset Issue", "ROLE-DG-P06", "REVIEW: drafted holder"),
    "DR-DG-17": ("Assign Issue Resolution", "ROLE-DG-P05", "REVIEW: drafted holder"),
    "DR-DG-18": ("Accept Issue Resolution and Close", "ROLE-DG-S03", "REVIEW: drafted holder"),
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
    ("TR-OPM-07", "Record Role Vacancy", "STS-OPM-05", "STS-OPM-03", "EV-OPM-07", "An owner, steward or body role required for the scope is vacant.", "DR-DG-12", ["SVC-DG-04"], []),
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
    ("TR-ISS-01", "Log Issue", "STS-ISS-01", "STS-ISS-02", "EV-ISS-01", "An issue against the Data Asset is logged with its source Knowledge Area, severity and owner.", "DR-DG-16", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-ISS-02", "Assign Resolution", "STS-ISS-02", "STS-ISS-03", "EV-ISS-02", "A steward is assigned under the operating model and a plan exists.", "DR-DG-17", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-ISS-03", "Escalate Issue", "STS-ISS-03", "STS-ISS-04", "EV-ISS-03", "Resolution is blocked or exceeds tolerance; escalation authority is engaged.", "DR-DG-06", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-ISS-04", "Escalate Open Issue", "STS-ISS-02", "STS-ISS-04", "EV-ISS-03", "Severity requires immediate escalation.", "DR-DG-06", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-ISS-05", "Resolve Issue", "STS-ISS-03", "STS-ISS-05", "EV-ISS-04", "Resolution evidence is accepted by the issue owner.", "DR-DG-18", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-ISS-06", "Decide Escalated Issue", "STS-ISS-04", "STS-ISS-05", "EV-ISS-04", "The governance body resolves the issue or accepts the residual risk.", "DR-DG-07", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-ISS-07", "Close Issue", "STS-ISS-05", "STS-ISS-01", "EV-ISS-05", "Closure evidence is retained.", "DR-DG-18", ["SVC-DG-09"], ["ACT-DG-2.5"]),
    ("TR-ISS-08", "Reopen Issue", "STS-ISS-05", "STS-ISS-02", "EV-ISS-06", "The resolution failed or recurred.", "DR-DG-16", ["SVC-DG-09"], ["ACT-DG-2.5"]),
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
    ("ACT-DG-2.2", "Develop Goals, Principles, and Policies", "2.2", "Transition-causing", ["REG-DG-POL"], ["TR-POL-01", "TR-POL-02", "TR-POL-05"], ["SVC-DG-07"]),
    ("ACT-DG-2.3", "Underwrite Data Management Projects", "2.3", "Transition-causing", ["REG-DG-STR"], ["TR-STR-03"], ["SVC-DG-02"]),
    ("ACT-DG-2.4", "Engage Change Management", "2.4", "Transition-causing", ["REG-DG-RDY"], ["TR-RDY-03"], ["SVC-DG-06"]),
    ("ACT-DG-2.5", "Engage in Issue Management", "2.5", "Transition-causing", ["REG-DG-ISS"], ["TR-ISS-01", "TR-ISS-02", "TR-ISS-03", "TR-ISS-04", "TR-ISS-05", "TR-ISS-06", "TR-ISS-07", "TR-ISS-08"], ["SVC-DG-09"]),
    ("ACT-DG-2.6", "Assess Regulatory Compliance Requirements", "2.6", "Transition-supporting", ["REG-DG-POL"], ["TR-POL-01", "TR-POL-04"], ["SVC-DG-07"]),
    ("ACT-DG-3.1", "Sponsor Data Standards and Procedures", "3.1", "Transition-supporting", ["REG-DG-POL"], ["TR-POL-01"], ["SVC-DG-07"]),
    ("ACT-DG-3.2", "Develop a Business Glossary", "3.2", "State-preserving", ["REG-DG-POL"], ["TR-POL-01"], ["SVC-DG-07"]),
    ("ACT-DG-3.3", "Co-ordinate with Architecture Groups", "3.3", "Transition-supporting", ["REG-DG-POL"], ["TR-POL-01"], ["SVC-DG-07"]),
    ("ACT-DG-3.4", "Sponsor Data Asset Valuation", "3.4", "Transition-causing", ["REG-DG-STR"], ["TR-STR-04"], ["SVC-DG-02"]),
    ("ACT-DG-4", "Embed Data Governance", "4", "Transition-causing", ["REG-DG-OPM", "REG-DG-POL", "REG-DG-RDY"], ["TR-OPM-04", "TR-POL-03", "TR-RDY-04"], ["SVC-DG-08", "SVC-DG-06"]),
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
}
XRG = [
    ("XRG-DG-01", "Roles cannot be assigned before an operating model is approved; the operating model cannot be approved before a strategy is at least in formulation.", ["TR-OPM-02"], "Required", "STR in ('STS-STR-02','STS-STR-03','STS-STR-04','STS-STR-05','STS-STR-06')"),
    ("XRG-DG-02", "Instruments can be published only when roles are assigned to own and enforce them.", ["TR-POL-03"], "Required", "OPM in ('STS-OPM-04','STS-OPM-05')"),
    ("XRG-DG-03", "A change programme is launched only against an accepted readiness baseline and an approved strategy.", ["TR-RDY-03"], "Required", "STR in ('STS-STR-03','STS-STR-04','STS-STR-05')"),
    ("XRG-DG-04", "An issue can be assigned for resolution only when stewards are assigned.", ["TR-ISS-02"], "Required", "OPM in ('STS-OPM-04','STS-OPM-05','STS-OPM-06')"),
    ("XRG-DG-05", "Value realisation requires instruments in force and the operating model in force.", ["TR-STR-04"], "Required", "POL == 'STS-POL-04' and OPM == 'STS-OPM-05'"),
]
VECTORS = [
    ("CFG-DG-01", "Greenfield", {"REG-DG-STR": "STS-STR-01", "REG-DG-OPM": "STS-OPM-01", "REG-DG-RDY": "STS-RDY-01", "REG-DG-POL": "STS-POL-01", "REG-DG-ISS": "STS-ISS-01"}, "Initial configuration: nothing governs; Global registration is blocked by CON-DG-01 and CON-DG-02."),
    ("CFG-DG-02", "Foundations approved", {"REG-DG-STR": "STS-STR-03", "REG-DG-OPM": "STS-OPM-03", "REG-DG-RDY": "STS-RDY-03", "REG-DG-POL": "STS-POL-03", "REG-DG-ISS": "STS-ISS-01"}, "Strategy, operating model and instruments approved; roles not yet assigned, so Global registration still blocked."),
    ("CFG-DG-03", "Operating governance", {"REG-DG-STR": "STS-STR-04", "REG-DG-OPM": "STS-OPM-05", "REG-DG-RDY": "STS-RDY-04", "REG-DG-POL": "STS-POL-04", "REG-DG-ISS": "STS-ISS-01"}, "Legal: all Global contributions satisfied; the Data Asset protocol can run end to end."),
    ("CFG-DG-04", "Escalated issue", {"REG-DG-STR": "STS-STR-04", "REG-DG-OPM": "STS-OPM-05", "REG-DG-RDY": "STS-RDY-04", "REG-DG-POL": "STS-POL-04", "REG-DG-ISS": "STS-ISS-04"}, "Legal: destruction and access restoration blocked by CON-DG-04, -05, -07; assurance suspension and access suspension events emitted."),
    ("CFG-DG-05", "Mature governance", {"REG-DG-STR": "STS-STR-05", "REG-DG-OPM": "STS-OPM-05", "REG-DG-RDY": "STS-RDY-05", "REG-DG-POL": "STS-POL-04", "REG-DG-ISS": "STS-ISS-01"}, "Legal: value realised, target readiness, instruments in force."),
]
EVIDENCE = [
    ("EVD-DG-01", "Strategy approval record", "Decision evidence", "TR-STR-02", "Minutes and signed strategy, data strategy and roadmap."), ("EVD-DG-02", "Role assignment register", "Governance evidence", "TR-OPM-03", "Owner and steward assignments per Data Asset; constituted bodies."), ("EVD-DG-03", "Readiness baseline report", "Assessment evidence", "TR-RDY-02", "Maturity level, culture findings, gaps."), ("EVD-DG-04", "Instrument approval and publication record", "Decision evidence", "TR-POL-03", "Approved versions, publication date, compliance monitoring in place."), ("EVD-DG-05", "Issue decision record", "Decision evidence", "TR-ISS-06", "Governance body decision: resolution or risk acceptance."), ("EVD-DG-06", "Data Governance Scorecard", "Control evidence", "TR-POL-04", "Compliance, value, effectiveness and sustainability metrics."),
]
EXC = [("EXC-DG-01", "Interim Governance Exception", "TR-EX-01", "Registration of an urgent Data Asset before the operating model reaches Assigned Roles.", "DR-DG-03", "Interim owner named, expiry set, compensating oversight by a governance body, evidence retained; never waives CON-DG-04.", "Draft / Approved / Expired / Closed")]

SPEC = {
    "meta": {"modelId": "KA-DG", "name": "Data Governance FTS", "knowledgeArea": "Data Governance", "version": "0.2", "subjectType": KA_SUBJECT, "regionModel": "One FTS per managed element: the regions are separate machines that run concurrently and are coupled by events, facts and cross-region constraints, never a single subject.", "source": SRC_DECK + "; " + SRC_HOWARD + "; " + SRC_PROTOCOL,
             "note": "Five state regions, each its own FTS over one managed element of the Knowledge Area (strategy, operating model, readiness, governing instruments, Data Asset issue), derived from the DMBOK context diagram. Region 5 manages issues raised by every Knowledge Area. The KA never becomes a region of the Data Asset; each region reaches the Global protocol through contributions (guards, decision rights, services, events) listed on the Contributions sheet and federated onto the Global transitions in the viewer.",
             "definition": CONTEXT["definition"], "factBindings": FACT_BINDINGS},
    "context": CONTEXT, "regions": REGIONS, "states": STATES, "transitions": TRANS, "events": EVENTS, "decisionRights": DR, "roles": ROLES, "artefacts": ARTEFACTS, "activities": ACTS, "services": SERVICES, "contributions": CONTRIB, "crossRegionConstraints": XRG, "stateVectors": VECTORS, "evidence": EVIDENCE, "exceptions": EXC,
    "sources": [
        {"id": "SRC-DG-001", "source": SRC_DECK, "type": "Primary (image pages, captured)", "location": "Chat upload; OneDrive Data Lifecycle folder", "use": "Definition, goals, drivers, inputs, processes and sub-activities, deliverables, role players, techniques, tools, metrics", "limitations": "Process 4 Embed Data Governance carries no sub-activities on the diagram."},
        {"id": "SRC-DG-002", "source": SRC_HOWARD, "type": "Design direction", "location": "Chat", "use": "Region set, subject, start-from-definition method", "limitations": ""},
        {"id": "SRC-DG-003", "source": SRC_PROTOCOL, "type": "Alignment target", "location": "Private repo models/", "use": "Global transition IDs for contributions", "limitations": ""},
    ],
    "qaNotes": [
        {"severity": "note", "rule": "capture", "element": "process:4", "finding": "Embed Data Governance (C,O) has no sub-activities on the DMBOK context diagram; ACT-DG-4 is scoped from the region definitions (decision 21 Sep 2026)."},
        {"severity": "note", "rule": "GA-005", "element": "KA-DG", "finding": "Regions STR, OPM, RDY and POL manage scope-level elements that change rarely relative to a Data Asset; they gate Global transitions as preconditions (contributions), which is the loose coupling GA-009 asks for. Region ISS manages one case per issue and is the only region instantiated per Data Asset event."},
        {"severity": "note", "rule": "N-016", "element": "DR-DG-08..18", "finding": "Decision Rights DR-DG-08 to DR-DG-18 and their holders are drafted so that every transition carries one (decision 21 Sep 2026); each is flagged REVIEW."},
        {"severity": "note", "rule": "derived", "element": "STATES", "finding": "All state names, events, decision rights and services are first-pass drafts from the context diagram; every one is for Howard's review."},
    ],
}

if __name__ == "__main__":
    from ka_build import run_spec
    run_spec(SPEC, "data_governance.fts.json")
