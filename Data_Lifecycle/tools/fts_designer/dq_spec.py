#!/usr/bin/env python3
"""
dq_spec.py  -  Data Quality Management FTS v0.1: two state regions, each its own FTS over one managed element
of the Knowledge Area, derived from the DMBOK Data Quality context diagram (deck pages 89 to 93) and aligned to
the Global Data Asset Protocol.

Howard's managed elements (21 Sep 2026): 1 the Data Quality Programme; 2 the PDCA cycle for a Data Asset, which
holds every quality assessment task for that asset, including its Data Quality Expectation.
Decisions 21 Sep 2026: Non-conforming Quality logs a Data Asset issue in the Data Governance issue FTS (EV-ISS-01,
source Data Quality); the assessed level gates the Global Assurance region (assessment, confirmation, suspension,
expiry); every transition carries a Decision Right (holders drafted, flagged REVIEW).

Usage: python dq_spec.py [out_dir]   -> data_quality.fts.json
"""
import json, os, sys
from ka_build import build

SRC_DECK = "DMBOK Data Lifecycle and KA Context Diagrams.pdf, Data Quality pages 89 to 93 (What, Why, DQ Activities, Role Players and Technical Drivers, DG / DQ / Metadata triangle)"
SRC_HOWARD = "Howard Diesel, 21 Sep 2026: two DQ managed elements (Programme; PDCA for a Data Asset including its DQ Expectation), DQ issues logged in the DG issue FTS, assessed level gates Global Assurance"
SRC_PROTOCOL = "global_protocol.fts.json v0.2.1 (Global Data Asset Protocol) for the contribution targets; data_governance.fts.json v0.2 for the issue coupling"

CONTEXT = {
    "knowledgeArea": "Data Quality Management",
    "definition": "The planning, implementation, and control of activities that apply quality management techniques to data, in order to assure it is fit for consumption and meets the needs of data consumers.",
    "ensures": "High quality data should be the goal of all data management disciplines and they all contribute to the quality of data. Data Quality should be managed by a Data Quality Program team as Data Quality is an enterprise program like Data Governance.",
    "goals": ["Develop a governed approach to make data fit for purpose based on data consumers' requirements.", "Define standards, requirements, and specifications for data quality controls as part of the data lifecycle.", "Define and implement processes to measure, monitor, and report on data quality levels.", "Identify and advocate for opportunities to improve the quality of data, through process and system improvements."],
    "businessDrivers": ["Increase value of business data and opportunities to use it", "Reduce risks associated with poor quality data", "Improve organisational efficiency and productivity", "Protect and enhance the organisation's reputation"],
    "inputs": ["Data Policies and Standards", "Data Quality Expectations", "Business Requirements", "Business Rules", "Data Requirements", "Business Metadata", "Technical Metadata", "Data Sources and Data Stores", "Data Lineage"],
    "processes": [
        {"id": "1", "name": "Define High Quality Data", "phase": "P", "subActivities": []},
        {"id": "2", "name": "Define a Data Quality Strategy", "phase": "P", "subActivities": []},
        {"id": "3", "name": "Define Scope of Initial Assessment", "phase": "P", "subActivities": ["3.1 Identify Critical Data", "3.2 Identify Existing Rules and Patterns"]},
        {"id": "4", "name": "Perform Initial Data Quality Assessment", "phase": "P", "subActivities": ["4.1 Identify and prioritize issues", "4.2 Perform root cause analysis of issues"]},
        {"id": "5", "name": "Identify and Prioritize Improvements", "phase": "", "subActivities": ["5.1 Prioritize Actions based on Business Impact", "5.2 Develop Preventative and Corrective Actions", "5.3 Confirm Planned Actions"], "note": "No phase tag on the slide."},
        {"id": "6", "name": "Develop and Deploy Data Quality Operations", "phase": "D", "subActivities": ["6.1 Develop Data Quality Operational Procedures", "6.2 Correct Data Quality Defects", "6.3 Measure and Monitor Data Quality", "6.4 Report on Data Quality levels and findings"]},
    ],
    "deliverables": ["Data Quality Strategy and framework", "Data Quality Program organization", "Analyses from Data Profiling", "Recommendations based on root cause analysis of issues", "DQM Procedures", "Data Quality Reports", "Data Quality Governance Reports", "Data Quality Service Level Agreements", "DQ Policies and Guidelines"],
    "suppliers": ["Business Management", "Subject Matter Experts", "Data Architects", "Data Modelers", "System Specialists", "Data Stewards", "Business Process Analysts"],
    "participants": ["CDO", "Data Quality Analysts", "Data Stewards", "Data Owners", "Data Analysts", "Database Administrators", "Data Professionals", "DQ Managers", "IT Operations", "Data Integration Architects", "Compliance Team"],
    "consumers": ["Business Data Consumers", "Data Stewards", "Data Professionals", "IT Professionals", "Knowledge Workers", "Data Governance Bodies", "Partner Organizations", "Centers of Excellence"],
    "techniques": ["Spot-Checking using Multiple Subsets", "Tags and Notes to Mark Data Issues", "Root Cause Analysis", "Statistical Process Control"],
    "tools": ["Profiling engines, query tools", "Data Quality Rule Templates", "Quality Check and Audit Code Modules"],
    "metrics": ["Governance and Conformance Metrics", "Data Quality Measurement Results", "Improvement trends", "Issue Management Metrics"],
    "phaseTags": "(P) Planning, (C) Control, (D) Development, (O) Operations",
    "kaTriangle": "Page 93: Data Quality gives Data Governance the DQ Expectation (CDE), Data Issue and Remediation, and Data Quality Rules under Authority and Responsibility; Data Governance gives back policy, standards, methodology, tools and plan; Data Quality and Metadata Management exchange Standards: DQ Profile for Data Lineage and Root Cause Analysis against Business Glossary and Rules, Data Model scorecard and Data Lineage. Lack of structure and formality feeds DG and Metadata; root causes feed DQ.",
}

KA_SUBJECT = "Data Quality Management Knowledge Area: two managed elements, one FTS (state region) each; the Data Asset is the Global subject reached through contributions"
REGIONS = [
    ("REG-DQ-PRG", "Data Quality Programme", "PRG", "Whether a governed data quality programme (strategy, framework, organisation, policies, procedures) exists, is approved and is operating for the governed scope.", "STS-PRG-01", "Exactly one active state; a revised programme supersedes, never coexists with, the approved one.",
     "Data Quality Programme of the governed scope: strategy and framework, programme organisation, DQ policies and guidelines, DQM procedures, reporting",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Governing element", "contributesTo": "Assurance: an operating programme supplies the quality criteria, measurement procedures and reporting that the Global Assurance service relies on (TR-AS-01); Governance: DQ policies and SLAs are governing instruments held with Data Governance.", "conditionsThatMatter": "None; in definition; approved; operating; under revision."}),
    ("REG-DQ-PDCA", "Quality PDCA Cycle for a Data Asset", "PDCA", "Where a Data Asset stands in its plan-do-check-act quality cycle: expectation defined, assessed, conforming or non-conforming, under improvement, or due for reassessment.", "STS-PDCA-01", "Exactly one active state per Data Asset; a conforming level is only ever a measured result against the expectation in force, never asserted.",
     "Quality PDCA cycle of a Data Asset: its Data Quality Expectation (critical data, rules, thresholds, service level), assessment, improvement actions and monitored quality level",
     {"instanceScope": "One instance per Data Asset under quality management.", "elementKind": "Managed cycle", "contributesTo": "Assurance: assessment can start only with an expectation defined (TR-AS-01); assurance is confirmed only on Conforming Quality (TR-AS-02, TR-AS-07, TR-AS-08); Non-conforming Quality emits the assessment failure and the material-change trigger (TR-AS-04, TR-AS-05, TR-AS-06); Lapsed Assessment emits the expiry trigger (TR-AS-09, TR-AS-10). Data Governance: Non-conforming Quality logs a Data Asset issue in the DG issue FTS.", "conditionsThatMatter": "Unmanaged; expectation in definition; under assessment; conforming; non-conforming; improvement planned; remediation in execution; assessment lapsed."}),
]
STATES = [
    ("STS-PRG-01", "REG-DQ-PRG", "No Quality Programme", True, False, "No data quality strategy, framework or programme organisation exists for the governed scope.", "The absence of a programme remains visible to governance bodies.", ["inputs:Data Policies and Standards"]),
    ("STS-PRG-02", "REG-DQ-PRG", "Programme Definition", False, False, "High quality data is being defined and the data quality strategy, framework and programme organisation are being developed.", "Sponsor, scope and the definition of high quality data remain identifiable.", ["process:1", "process:2"]),
    ("STS-PRG-03", "REG-DQ-PRG", "Approved Programme", False, False, "The data quality strategy and framework, programme organisation and DQ policies and guidelines are approved.", "The approved strategy, framework, policies and approving authority remain current and traceable.", ["deliverable:Data Quality Strategy and framework", "deliverable:DQ Policies and Guidelines"]),
    ("STS-PRG-04", "REG-DQ-PRG", "Operating Programme", False, False, "The programme organisation is staffed, DQM procedures are in force and quality governance reports are produced.", "Procedures, reporting cadence and programme roles remain current.", ["process:6.1", "process:6.4", "deliverable:Data Quality Program organization", "deliverable:DQM Procedures", "deliverable:Data Quality Governance Reports"]),
    ("STS-PRG-05", "REG-DQ-PRG", "Programme Revision", False, False, "The programme is under revision after a strategic, regulatory or performance trigger while the current procedures stay in force.", "Procedures in force remain valid until the revised programme is approved.", ["metric:Governance and Conformance Metrics", "metric:Improvement trends"]),
    ("STS-PDCA-01", "REG-DQ-PDCA", "Unmanaged Quality", True, False, "The Data Asset has no data quality expectation and no assessment; its fitness for consumption is unknown.", "The absence of an expectation and assessment remains visible on the asset record.", ["inputs:Data Quality Expectations"]),
    ("STS-PDCA-02", "REG-DQ-PDCA", "Expectation Definition", False, False, "Plan: critical data elements, existing rules and patterns, consumer requirements and the scope of the initial assessment are being defined for the Data Asset.", "Critical data elements, draft rules and the requirement sources remain identifiable.", ["process:3.1", "process:3.2", "inputs:Business Rules", "inputs:Data Requirements", "inputs:Business Metadata"]),
    ("STS-PDCA-03", "REG-DQ-PDCA", "Quality Assessment", False, False, "Plan: the Data Asset is being profiled and measured against its approved expectation; issues are identified and prioritised and root causes analysed.", "The expectation in force, the profiling scope and the assessment evidence remain current.", ["process:4.1", "process:4.2", "deliverable:Analyses from Data Profiling", "tools:Profiling engines, query tools"]),
    ("STS-PDCA-04", "REG-DQ-PDCA", "Planned Improvement", False, False, "Plan to Do: preventative and corrective actions are prioritised by business impact and confirmed with the Data Owner.", "Confirmed actions, owners and target dates remain recorded.", ["process:5.1", "process:5.2", "process:5.3", "deliverable:Recommendations based on root cause analysis of issues"]),
    ("STS-PDCA-05", "REG-DQ-PDCA", "Remediation", False, False, "Do: the confirmed actions are in execution; defects are corrected and root causes addressed.", "Progress against the confirmed actions remains visible; corrections are traceable to defects.", ["process:6.2", "techniques:Root Cause Analysis"]),
    ("STS-PDCA-06", "REG-DQ-PDCA", "Conforming Quality", False, False, "Check: the measured quality level meets the expectation and service level in force and is monitored.", "Monitoring is active; the last measurement is within threshold and within its validity interval.", ["process:6.3", "deliverable:Data Quality Reports", "deliverable:Data Quality Service Level Agreements", "metric:Data Quality Measurement Results"]),
    ("STS-PDCA-07", "REG-DQ-PDCA", "Non-conforming Quality", False, False, "Check: the measured quality level is below the expectation or service level; a Data Asset issue is logged with Data Governance.", "The breached rules, the measurement and the logged issue remain identifiable.", ["process:4.1", "techniques:Tags and Notes to Mark Data Issues", "metric:Issue Management Metrics"]),
    ("STS-PDCA-08", "REG-DQ-PDCA", "Lapsed Assessment", False, False, "Act: the monitoring interval has elapsed or the expectation, data or process has changed, so the last measurement no longer stands.", "The reason for the lapse and the reassessment due date remain explicit.", ["process:6.3", "techniques:Statistical Process Control"]),
]
EVENTS = {
    "EV-PRG-01": ("Programme initiation", "Request"), "EV-PRG-02": ("Programme approval", "Decision outcome"), "EV-PRG-03": ("Programme activation", "Decision outcome"), "EV-PRG-04": ("Programme revision trigger", "Monitoring trigger"), "EV-PRG-05": ("Revised programme approval", "Decision outcome"), "EV-PRG-06": ("Programme retirement", "Decision outcome"),
    "EV-PDCA-01": ("Data Asset brought into quality scope", "Request"), "EV-PDCA-02": ("Expectation approval", "Decision outcome"), "EV-PDCA-03": ("Assessment pass", "Assessment outcome"), "EV-PDCA-04": ("Assessment failure", "Assessment outcome"), "EV-PDCA-05": ("Improvement plan confirmation", "Decision outcome"), "EV-PDCA-06": ("Remediation authorization", "Decision outcome"), "EV-PDCA-07": ("Remediation completion", "Evidence trigger"), "EV-PDCA-08": ("Monitoring breach", "Monitoring trigger"), "EV-PDCA-09": ("Measurement validity lapse", "Time trigger"), "EV-PDCA-10": ("Reassessment authorization", "Decision outcome"), "EV-PDCA-11": ("Expectation revision", "Decision outcome"), "EV-PDCA-12": ("Data Asset withdrawn from quality scope", "Decision outcome"),
}
DR = {
    "DR-DQ-01": ("Approve Data Quality Strategy, Framework and Policies", "ROLE-DQ-P01", "REVIEW: drafted holder"),
    "DR-DQ-02": ("Activate, Revise and Retire the Programme", "ROLE-DQ-P08", "REVIEW: drafted holder"),
    "DR-DQ-03": ("Bring a Data Asset into or out of Quality Scope", "ROLE-DQ-P04", "REVIEW: drafted holder"),
    "DR-DQ-04": ("Approve the Data Quality Expectation and Rules", "ROLE-DQ-P04", "REVIEW: drafted holder"),
    "DR-DQ-05": ("Declare the Assessment or Monitoring Outcome", "ROLE-DQ-P08", "REVIEW: drafted holder"),
    "DR-DQ-06": ("Confirm and Authorize Improvement Actions", "ROLE-DQ-P04", "REVIEW: drafted holder"),
}
ROLES = [
    ("ROLE-DQ-S01", "Business Management", "Supplier", "Supply consumer requirements and business impact."), ("ROLE-DQ-S02", "Subject Matter Experts", "Supplier", "Supply business rules and expectations."), ("ROLE-DQ-S03", "Data Architects", "Supplier", "Supply data requirements and lineage."), ("ROLE-DQ-S04", "Data Modelers", "Supplier", "Supply data models and rules."), ("ROLE-DQ-S05", "System Specialists", "Supplier", "Supply sources, stores and technical metadata."), ("ROLE-DQ-S06", "Data Stewards", "Supplier", "Supply stewardship knowledge and expectations."), ("ROLE-DQ-S07", "Business Process Analysts", "Supplier", "Supply process context for root causes."),
    ("ROLE-DQ-P01", "CDO", "Participant", "Sponsor and approve the programme."), ("ROLE-DQ-P02", "Data Quality Analysts", "Participant", "Profile, measure and analyse root causes."), ("ROLE-DQ-P03", "Data Stewards", "Participant", "Define expectations; steward remediation."), ("ROLE-DQ-P04", "Data Owners", "Participant", "Own the Data Asset; approve expectation and actions."), ("ROLE-DQ-P05", "Data Analysts", "Participant", "Analyse measurements."), ("ROLE-DQ-P06", "Database Administrators", "Participant", "Execute corrections and controls."), ("ROLE-DQ-P07", "Data Professionals", "Participant", "Execute quality activities."), ("ROLE-DQ-P08", "DQ Managers", "Participant", "Run the programme; declare outcomes."), ("ROLE-DQ-P09", "IT Operations", "Participant", "Operate monitoring."), ("ROLE-DQ-P10", "Data Integration Architects", "Participant", "Embed controls in integration."), ("ROLE-DQ-P11", "Compliance Team", "Participant", "Assess regulatory quality requirements."),
    ("ROLE-DQ-C01", "Business Data Consumers", "Consumer", "Consume fit-for-purpose data and reports."), ("ROLE-DQ-C02", "Data Stewards", "Consumer", "Consume quality reports."), ("ROLE-DQ-C03", "Data Professionals", "Consumer", "Consume procedures and rules."), ("ROLE-DQ-C04", "IT Professionals", "Consumer", "Consume controls and defects."), ("ROLE-DQ-C05", "Knowledge Workers", "Consumer", "Consume quality levels."), ("ROLE-DQ-C06", "Data Governance Bodies", "Consumer", "Consume governance reports and issues."), ("ROLE-DQ-C07", "Partner Organizations", "Consumer", "Consume service levels."), ("ROLE-DQ-C08", "Centers of Excellence", "Consumer", "Consume methods and results."),
]
TRANS = [
    ("TR-PRG-01", "Define Programme", "STS-PRG-01", "STS-PRG-02", "EV-PRG-01", "A sponsor exists; data policies and standards and consumer requirements are available as inputs.", "DR-DQ-01", ["SVC-DQ-01"], ["ACT-DQ-1", "ACT-DQ-2"]),
    ("TR-PRG-02", "Approve Programme", "STS-PRG-02", "STS-PRG-03", "EV-PRG-02", "Strategy and framework, programme organisation and DQ policies and guidelines are approved.", "DR-DQ-01", ["SVC-DQ-01"], ["ACT-DQ-2"]),
    ("TR-PRG-03", "Operate Programme", "STS-PRG-03", "STS-PRG-04", "EV-PRG-03", "Programme roles are staffed, DQM procedures are in force and reporting is in place.", "DR-DQ-02", ["SVC-DQ-07", "SVC-DQ-08"], ["ACT-DQ-6.1", "ACT-DQ-6.4"]),
    ("TR-PRG-04", "Revise Programme", "STS-PRG-04", "STS-PRG-05", "EV-PRG-04", "A strategic, regulatory or performance trigger is recorded; procedures in force are retained meanwhile.", "DR-DQ-02", ["SVC-DQ-01"], ["ACT-DQ-2"]),
    ("TR-PRG-05", "Approve Revised Programme", "STS-PRG-05", "STS-PRG-03", "EV-PRG-05", "The revised strategy, framework or organisation is approved.", "DR-DQ-01", ["SVC-DQ-01"], ["ACT-DQ-2"]),
    ("TR-PRG-06", "Retire Programme", "STS-PRG-05", "STS-PRG-01", "EV-PRG-06", "The programme is retired without replacement and the retirement is recorded.", "DR-DQ-01", ["SVC-DQ-01"], ["ACT-DQ-2"]),
    ("TR-PDCA-01", "Define Expectation", "STS-PDCA-01", "STS-PDCA-02", "EV-PDCA-01", "The Data Asset is in the programme's scope and a Data Owner and Steward are assigned.", "DR-DQ-03", ["SVC-DQ-02"], ["ACT-DQ-1", "ACT-DQ-3.1", "ACT-DQ-3.2"]),
    ("TR-PDCA-02", "Approve Expectation and Assess", "STS-PDCA-02", "STS-PDCA-03", "EV-PDCA-02", "Critical data, rules, thresholds and service level are approved and the assessment scope is set.", "DR-DQ-04", ["SVC-DQ-02", "SVC-DQ-03"], ["ACT-DQ-3.2", "ACT-DQ-4"]),
    ("TR-PDCA-03", "Confirm Conforming Quality", "STS-PDCA-03", "STS-PDCA-06", "EV-PDCA-03", "Measured results meet the expectation and service level; monitoring is deployed.", "DR-DQ-05", ["SVC-DQ-03", "SVC-DQ-06"], ["ACT-DQ-4", "ACT-DQ-6.3"]),
    ("TR-PDCA-04", "Record Non-conformance", "STS-PDCA-03", "STS-PDCA-07", "EV-PDCA-04", "Measured results breach the expectation; issues are identified, prioritised and logged with Data Governance.", "DR-DQ-05", ["SVC-DQ-03", "SVC-DQ-04"], ["ACT-DQ-4.1", "ACT-DQ-4.2"]),
    ("TR-PDCA-05", "Plan Improvement", "STS-PDCA-07", "STS-PDCA-04", "EV-PDCA-05", "Root causes are analysed and actions are prioritised by business impact and confirmed.", "DR-DQ-06", ["SVC-DQ-04"], ["ACT-DQ-5.1", "ACT-DQ-5.2", "ACT-DQ-5.3"]),
    ("TR-PDCA-06", "Execute Remediation", "STS-PDCA-04", "STS-PDCA-05", "EV-PDCA-06", "Confirmed actions are resourced and authorised.", "DR-DQ-06", ["SVC-DQ-05"], ["ACT-DQ-5.3", "ACT-DQ-6.2"]),
    ("TR-PDCA-07", "Verify Remediation", "STS-PDCA-05", "STS-PDCA-03", "EV-PDCA-07", "Actions are complete and the Data Asset is reassessed against the expectation.", "DR-DQ-05", ["SVC-DQ-03"], ["ACT-DQ-6.2", "ACT-DQ-4"]),
    ("TR-PDCA-08", "Detect Non-conformance", "STS-PDCA-06", "STS-PDCA-07", "EV-PDCA-08", "Monitoring shows a breach of threshold or service level.", "DR-DQ-05", ["SVC-DQ-06"], ["ACT-DQ-6.3"]),
    ("TR-PDCA-09", "Lapse Assessment", "STS-PDCA-06", "STS-PDCA-08", "EV-PDCA-09", "The measurement validity interval has elapsed or the expectation, data or process has changed.", "DR-DQ-05", ["SVC-DQ-06"], ["ACT-DQ-6.3"]),
    ("TR-PDCA-10", "Reassess", "STS-PDCA-08", "STS-PDCA-03", "EV-PDCA-10", "Reassessment scope is authorised against the expectation in force.", "DR-DQ-05", ["SVC-DQ-03"], ["ACT-DQ-4"]),
    ("TR-PDCA-11", "Revise Expectation after Non-conformance", "STS-PDCA-07", "STS-PDCA-02", "EV-PDCA-11", "The Data Owner revises the expectation (with Data Governance risk acceptance where a threshold is relaxed).", "DR-DQ-04", ["SVC-DQ-02"], ["ACT-DQ-3.2"]),
    ("TR-PDCA-12", "Revise Expectation after Lapse", "STS-PDCA-08", "STS-PDCA-02", "EV-PDCA-11", "The expectation is revised before reassessment.", "DR-DQ-04", ["SVC-DQ-02"], ["ACT-DQ-3.2"]),
    ("TR-PDCA-13", "Withdraw from Quality Scope", "STS-PDCA-08", "STS-PDCA-01", "EV-PDCA-12", "The Data Asset leaves the programme's scope (for example on disposition) and the withdrawal is recorded.", "DR-DQ-03", ["SVC-DQ-02"], ["ACT-DQ-3.1"]),
]
SERVICES = [
    ("SVC-DQ-01", "Governance", "Quality Programme Definition", "Programme initiation or revision.", "Approved DQ strategy and framework; programme organisation; DQ policies and guidelines."),
    ("SVC-DQ-02", "Governance", "Quality Expectation and Rule Definition", "Data Asset in quality scope; expectation revision.", "Approved critical data elements, rules, thresholds, service level."),
    ("SVC-DQ-03", "Assurance", "Quality Assessment and Profiling", "Expectation approved; reassessment due; remediation complete.", "Measured quality level against the expectation; profiling analyses; assessment evidence."),
    ("SVC-DQ-04", "Risk", "Issue Prioritisation and Root Cause Analysis", "Non-conformance recorded.", "Prioritised issues by business impact; root causes; recommendations."),
    ("SVC-DQ-05", "Control", "Quality Remediation", "Improvement actions authorised.", "Corrected defects; preventative and corrective actions in place."),
    ("SVC-DQ-06", "Control", "Quality Measurement and Monitoring", "Conforming quality confirmed.", "Monitoring results; breach and lapse triggers; control evidence for Assurance."),
    ("SVC-DQ-07", "Assurance", "Quality Reporting", "Operating programme.", "Data Quality Reports; Data Quality Governance Reports."),
    ("SVC-DQ-08", "Governance", "Quality Service Level Agreement", "Operating programme; expectation approved.", "Agreed service levels between producers and consumers."),
]
ACTS = [
    ("ACT-DQ-1", "Define High Quality Data", "1", "Transition-supporting", ["REG-DQ-PRG", "REG-DQ-PDCA"], ["TR-PRG-01", "TR-PDCA-01"], ["SVC-DQ-01", "SVC-DQ-02"]),
    ("ACT-DQ-2", "Define a Data Quality Strategy", "2", "Transition-causing", ["REG-DQ-PRG"], ["TR-PRG-01", "TR-PRG-02", "TR-PRG-04", "TR-PRG-05", "TR-PRG-06"], ["SVC-DQ-01"]),
    ("ACT-DQ-3.1", "Identify Critical Data", "3.1", "Transition-causing", ["REG-DQ-PDCA"], ["TR-PDCA-01", "TR-PDCA-13"], ["SVC-DQ-02"]),
    ("ACT-DQ-3.2", "Identify Existing Rules and Patterns", "3.2", "Transition-causing", ["REG-DQ-PDCA"], ["TR-PDCA-02", "TR-PDCA-11", "TR-PDCA-12"], ["SVC-DQ-02"]),
    ("ACT-DQ-4", "Perform Initial Data Quality Assessment", "4", "Transition-causing", ["REG-DQ-PDCA"], ["TR-PDCA-02", "TR-PDCA-03", "TR-PDCA-07", "TR-PDCA-10"], ["SVC-DQ-03"]),
    ("ACT-DQ-4.1", "Identify and prioritize issues", "4.1", "Transition-causing", ["REG-DQ-PDCA"], ["TR-PDCA-04"], ["SVC-DQ-04"]),
    ("ACT-DQ-4.2", "Perform root cause analysis of issues", "4.2", "Transition-supporting", ["REG-DQ-PDCA"], ["TR-PDCA-04", "TR-PDCA-05"], ["SVC-DQ-04"]),
    ("ACT-DQ-5.1", "Prioritize Actions based on Business Impact", "5.1", "Transition-supporting", ["REG-DQ-PDCA"], ["TR-PDCA-05"], ["SVC-DQ-04"]),
    ("ACT-DQ-5.2", "Develop Preventative and Corrective Actions", "5.2", "Transition-supporting", ["REG-DQ-PDCA"], ["TR-PDCA-05"], ["SVC-DQ-04"]),
    ("ACT-DQ-5.3", "Confirm Planned Actions", "5.3", "Transition-causing", ["REG-DQ-PDCA"], ["TR-PDCA-05", "TR-PDCA-06"], ["SVC-DQ-05"]),
    ("ACT-DQ-6.1", "Develop Data Quality Operational Procedures", "6.1", "Transition-causing", ["REG-DQ-PRG"], ["TR-PRG-03"], ["SVC-DQ-07"]),
    ("ACT-DQ-6.2", "Correct Data Quality Defects", "6.2", "Transition-causing", ["REG-DQ-PDCA"], ["TR-PDCA-06", "TR-PDCA-07"], ["SVC-DQ-05"]),
    ("ACT-DQ-6.3", "Measure and Monitor Data Quality", "6.3", "Transition-causing", ["REG-DQ-PDCA"], ["TR-PDCA-03", "TR-PDCA-08", "TR-PDCA-09"], ["SVC-DQ-06"]),
    ("ACT-DQ-6.4", "Report on Data Quality levels and findings", "6.4", "State-preserving", ["REG-DQ-PRG", "REG-DQ-PDCA"], ["TR-PRG-03"], ["SVC-DQ-07"]),
]
ARTEFACTS = [
    ("ART-DQ-01", "Data Quality Strategy and framework", "STS-PRG-03", "Define a Data Quality Strategy", "Evidences Approved Programme."), ("ART-DQ-02", "Data Quality Program organization", "STS-PRG-04", "Define a Data Quality Strategy", "Evidences Operating Programme."), ("ART-DQ-03", "Analyses from Data Profiling", "STS-PDCA-03", "Perform Initial Data Quality Assessment", "Assessment evidence."), ("ART-DQ-04", "Recommendations based on root cause analysis of issues", "STS-PDCA-04", "Identify and Prioritize Improvements", "Evidences Planned Improvement."), ("ART-DQ-05", "DQM Procedures", "STS-PRG-04", "Develop Data Quality Operational Procedures", "Evidences Operating Programme."), ("ART-DQ-06", "Data Quality Reports", "STS-PDCA-06", "Report on Data Quality levels and findings", "Evidences the measured level; control evidence for Global Assurance."), ("ART-DQ-07", "Data Quality Governance Reports", "STS-PRG-04", "Report on Data Quality levels and findings", "Governance evidence; consumed by Data Governance bodies."), ("ART-DQ-08", "Data Quality Service Level Agreements", "STS-PDCA-06", "Define High Quality Data", "Service level the conforming state is measured against."), ("ART-DQ-09", "DQ Policies and Guidelines", "STS-PRG-03", "Define a Data Quality Strategy", "Governing instrument held with Data Governance."),
]
# Contributions to the Global Data Asset Protocol (Assurance region), decided 21 Sep 2026.
CONTRIB = [
    ("CON-DQ-01", "TR-AS-01", "guard", {"PDCA": ["STS-PDCA-03", "STS-PDCA-04", "STS-PDCA-05", "STS-PDCA-06", "STS-PDCA-07", "STS-PDCA-08"], "PRG": ["STS-PRG-04"]}, "Assurance criteria for the Data Asset come from an approved quality expectation under an operating programme.", "DQ_expectation_defined and DQ_programme_operating", "Required", "Initiate Assessment needs the quality criteria that only an approved expectation supplies."),
    ("CON-DQ-02", "TR-AS-02", "guard", {"PDCA": ["STS-PDCA-06"]}, "Assurance is confirmed only when the Data Asset's measured quality level conforms to its expectation.", "DQ_conforming", "Required", "Conforming Quality is the required fact for Confirm Assurance."),
    ("CON-DQ-03", "TR-AS-03", "guard", {"PDCA": ["STS-PDCA-04", "STS-PDCA-05", "STS-PDCA-06"]}, "Conditional assurance may be granted while improvement is planned or in execution, never on an unassessed or lapsed asset.", "DQ_conforming or DQ_improvement_underway", "Conditional", "Residual limitation = the confirmed improvement plan."),
    ("CON-DQ-04", "TR-AS-04", "event", {"PDCA": ["STS-PDCA-07"]}, "Non-conforming Quality is an assessment failure.", "DQ_non_conforming", "Conditional", "DQ emits EV-AS-04 when TR-PDCA-04 fires."),
    ("CON-DQ-05", "TR-AS-05", "event", {"PDCA": ["STS-PDCA-07"]}, "A monitoring breach on a confirmed asset is a control failure affecting the assurance claim.", "DQ_non_conforming", "Conditional", "DQ emits EV-AS-05 when TR-PDCA-08 fires."),
    ("CON-DQ-06", "TR-AS-06", "event", {"PDCA": ["STS-PDCA-07"]}, "A monitoring breach on a conditionally assured asset breaches its condition.", "DQ_non_conforming", "Conditional", "DQ emits EV-AS-05 when TR-PDCA-08 fires."),
    ("CON-DQ-07", "TR-AS-07", "guard", {"PDCA": ["STS-PDCA-06"]}, "Reassessment after a deficiency requires remediation verified as conforming.", "DQ_conforming", "Required", ""),
    ("CON-DQ-08", "TR-AS-08", "guard", {"PDCA": ["STS-PDCA-06"]}, "Reassessment after a suspension requires the quality cause addressed and conforming.", "DQ_conforming", "Required", ""),
    ("CON-DQ-09", "TR-AS-09", "event", {"PDCA": ["STS-PDCA-08"]}, "A lapsed quality measurement is the expiry trigger for assurance.", "DQ_assessment_lapsed", "Conditional", "DQ emits EV-AS-07 when TR-PDCA-09 fires."),
    ("CON-DQ-10", "TR-AS-10", "event", {"PDCA": ["STS-PDCA-08"]}, "A lapsed quality measurement is the expiry trigger for conditional assurance.", "DQ_assessment_lapsed", "Conditional", "DQ emits EV-AS-07 when TR-PDCA-09 fires."),
    ("CON-DQ-11", "TR-AS-02", "service", {"PDCA": ["STS-PDCA-06"]}, "Quality Measurement and Monitoring supplies the control evidence that assurance confirmation cites.", "SVC-DQ-06", "Conditional", "Control service; evidence ART-DQ-06."),
]
# Couplings to other Knowledge Area FTSs (not Global transitions): DQ raises its issues in the DG issue FTS.
KA_COUPLINGS = [
    ("KAC-DQ-01", "KA-DG", "TR-ISS-01", "EV-ISS-01", "DQ_non_conforming", "Non-conforming Quality logs a Data Asset issue in the Data Governance issue FTS with source Data Quality (TR-PDCA-04 and TR-PDCA-08 emit EV-ISS-01).", "DQ owns the improvement; DG owns escalation and residual-risk acceptance."),
    ("KAC-DQ-02", "KA-DG", "TR-ISS-05", "EV-ISS-04", "DQ_conforming", "Resolution of a quality-sourced issue is evidenced by the Data Asset returning to Conforming Quality (TR-PDCA-03 after remediation emits EV-ISS-04).", "Evidence, not a guard: DG may still resolve on other grounds."),
    ("KAC-DQ-03", "KA-DG", "TR-PDCA-11", "", "DG_no_blocking_issue or DG_escalated_issue", "Relaxing a threshold when revising the expectation after non-conformance needs Data Governance risk acceptance (DR-DG-07) where the issue was escalated.", "Reverse coupling: DG decision cited by a DQ transition."),
]
FACT_BINDINGS = {
    "DQ_programme_operating": {"region": "REG-DQ-PRG", "states": ["STS-PRG-04", "STS-PRG-05"]},
    "DQ_expectation_defined": {"region": "REG-DQ-PDCA", "states": ["STS-PDCA-03", "STS-PDCA-04", "STS-PDCA-05", "STS-PDCA-06", "STS-PDCA-07", "STS-PDCA-08"]},
    "DQ_conforming": {"region": "REG-DQ-PDCA", "states": ["STS-PDCA-06"]},
    "DQ_non_conforming": {"region": "REG-DQ-PDCA", "states": ["STS-PDCA-07"]},
    "DQ_improvement_underway": {"region": "REG-DQ-PDCA", "states": ["STS-PDCA-04", "STS-PDCA-05"]},
    "DQ_assessment_lapsed": {"region": "REG-DQ-PDCA", "states": ["STS-PDCA-08"]},
}
XRG = [
    ("XRG-DQ-01", "A Data Asset enters quality scope only under an approved or operating programme.", ["TR-PDCA-01"], "Required", "PRG in ('STS-PRG-03','STS-PRG-04','STS-PRG-05')"),
    ("XRG-DQ-02", "Conforming quality can be confirmed only under an operating programme (procedures and monitoring in force).", ["TR-PDCA-03"], "Required", "PRG in ('STS-PRG-04','STS-PRG-05')"),
    ("XRG-DQ-03", "Retiring the programme requires no Data Asset still under assessment or remediation.", ["TR-PRG-06"], "Required", "PDCA in ('STS-PDCA-01','STS-PDCA-06','STS-PDCA-08')"),
]
VECTORS = [
    ("CFG-DQ-01", "Greenfield", {"REG-DQ-PRG": "STS-PRG-01", "REG-DQ-PDCA": "STS-PDCA-01"}, "Initial configuration: no programme, asset unmanaged; Global assurance assessment blocked by CON-DQ-01."),
    ("CFG-DQ-02", "Programme operating, asset unmanaged", {"REG-DQ-PRG": "STS-PRG-04", "REG-DQ-PDCA": "STS-PDCA-01"}, "Legal: programme in force; the asset has no expectation yet, so TR-AS-01 stays blocked."),
    ("CFG-DQ-03", "Conforming", {"REG-DQ-PRG": "STS-PRG-04", "REG-DQ-PDCA": "STS-PDCA-06"}, "Legal: all Assurance contributions satisfied; TR-AS-01 and TR-AS-02 eligible from the DQ side."),
    ("CFG-DQ-04", "Non-conforming", {"REG-DQ-PRG": "STS-PRG-04", "REG-DQ-PDCA": "STS-PDCA-07"}, "Legal: EV-AS-04 or EV-AS-05 emitted; issue logged with DG (KAC-DQ-01); TR-AS-02 blocked."),
    ("CFG-DQ-05", "Lapsed", {"REG-DQ-PRG": "STS-PRG-04", "REG-DQ-PDCA": "STS-PDCA-08"}, "Legal: EV-AS-07 emitted; reassessment or expectation revision due."),
]
EVIDENCE = [
    ("EVD-DQ-01", "Programme approval record", "Decision evidence", "TR-PRG-02", "Approved strategy and framework, organisation, policies."), ("EVD-DQ-02", "Expectation record", "Governance evidence", "TR-PDCA-02", "Critical data elements, rules, thresholds, service level, approver."), ("EVD-DQ-03", "Profiling and assessment results", "Assessment evidence", "TR-PDCA-03", "Measured results against each rule; pass or fail per threshold."), ("EVD-DQ-04", "Issue and root cause record", "Risk evidence", "TR-PDCA-04", "Breached rules, prioritised issues, root causes, DG issue reference."), ("EVD-DQ-05", "Remediation completion record", "Control evidence", "TR-PDCA-07", "Actions completed, defects corrected, verification results."), ("EVD-DQ-06", "Monitoring log", "Control evidence", "TR-PDCA-08", "Measurement series, breaches and validity intervals."),
]
EXC = [("EXC-DQ-01", "Provisional Quality Acceptance", "TR-AS-03", "Conditional assurance for an urgently needed Data Asset whose initial assessment is incomplete.", "DR-DQ-04", "Expectation approved, assessment scheduled with a date, Data Owner accepts interim risk with Data Governance, monitoring active, evidence retained; expires at the assessment date.", "Draft / Approved / Expired / Closed")]

SPEC = {
    "meta": {"modelId": "KA-DQ", "name": "Data Quality Management FTS", "knowledgeArea": "Data Quality Management", "version": "0.1", "subjectType": KA_SUBJECT,
             "regionModel": "One FTS per managed element: the Programme (scope level) and the PDCA cycle (one per Data Asset) run concurrently and are coupled by cross-region constraints, facts and events, never a single subject.",
             "source": SRC_DECK + "; " + SRC_HOWARD + "; " + SRC_PROTOCOL,
             "note": "Two state regions, each its own FTS over one managed element of the Knowledge Area: the Data Quality Programme of the governed scope, and the plan-do-check-act quality cycle of a Data Asset, which holds that asset's Data Quality Expectation, assessment, improvement actions and monitored level. The KA never becomes a region of the Data Asset; the PDCA cycle reaches the Global Assurance region through contributions (guards and events on TR-AS-01 to TR-AS-10), and logs its non-conformances as Data Asset issues in the Data Governance issue FTS.",
             "definition": CONTEXT["definition"], "factBindings": FACT_BINDINGS},
    "context": CONTEXT, "regions": REGIONS, "states": STATES, "transitions": TRANS, "events": EVENTS, "decisionRights": DR, "roles": ROLES, "artefacts": ARTEFACTS, "activities": ACTS, "services": SERVICES, "contributions": CONTRIB, "kaCouplings": KA_COUPLINGS, "crossRegionConstraints": XRG, "stateVectors": VECTORS, "evidence": EVIDENCE, "exceptions": EXC,
    "sources": [
        {"id": "SRC-DQ-001", "source": SRC_DECK, "type": "Primary (image pages, captured)", "location": "Chat upload; OneDrive Data Lifecycle folder", "use": "Definition, goals, drivers, inputs, processes and sub-activities, deliverables, role players, techniques, tools, metrics, KA triangle", "limitations": "Process 5 carries no phase tag on the slide."},
        {"id": "SRC-DQ-002", "source": SRC_HOWARD, "type": "Design direction", "location": "Chat", "use": "Managed elements, issue coupling, Assurance gating", "limitations": ""},
        {"id": "SRC-DQ-003", "source": SRC_PROTOCOL, "type": "Alignment target", "location": "Private repo models/", "use": "Global transition IDs for contributions; DG transition IDs for couplings", "limitations": ""},
    ],
    "qaNotes": [
        {"severity": "note", "rule": "GA-005", "element": "KA-DQ", "finding": "The Programme changes rarely relative to a Data Asset and gates the PDCA cycle through XRG-DQ-01/02; the PDCA cycle is instantiated per Data Asset and is the only DQ region that gates Global transitions."},
        {"severity": "note", "rule": "PDCA", "element": "REG-DQ-PDCA", "finding": "Plan = Expectation Definition, Quality Assessment, Planned Improvement; Do = Remediation; Check = Conforming or Non-conforming Quality; Act = Lapsed Assessment leading to reassessment or expectation revision (DMBOK Data Quality improvement lifecycle)."},
        {"severity": "note", "rule": "derived", "element": "STATES", "finding": "All state names, events, decision rights, holders and services are first-pass drafts from the context diagram; every one is for Howard's review."},
    ],
}

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(out, exist_ok=True)
    m = build(SPEC)
    p = os.path.join(out, "data_quality.fts.json")
    json.dump(m, open(p, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("wrote", p); print(json.dumps(m["meta"]["counts"])); print("QA", m["meta"]["qaCounts"])
    for f in m["qaFindings"]: print(" ", f["severity"], f["rule"], f["element"], "|", f["finding"])
