#!/usr/bin/env python3
"""
dhe_spec.py  -  Data Handling Ethics FTS v0.1: five state regions, each its own FTS over one managed element of the
Knowledge Area, derived from the DMBOK Data Handling Ethics context diagram (deck pages 13 to 16) and aligned to the
Global Data Asset Protocol.

Howard's managed elements (22 Sep 2026): 1 the Ethical Data Handling Strategy of the scope (practices review,
principles, practices and risk factors, strategy, corporate statements, updated policies); 2 a Practice Gap (one per gap
from the practices review); 3 the Ethics Communication and Training Programme of the scope; 4 the Ethical Use of a Data
Asset (one per asset and intended use); 5 an Ethics Compliance Incident (one per incident, split out as Data Security
splits its Security Incident).
Decisions 22 Sep 2026: Data Ethics gates Global access release on ethical clearance of the intended use (Non-waivable,
not Conditional: every release needs a cleared use), external custody and custody transfer on the sharing conditions of
a cleared use (Conditional), restoration on the incident being resolved and the clearance restored; a compliance
incident emits the access-suspension and assurance triggers; the ethics risk assessment is an assurance service; every
transition carries a Decision Right (holders confirmed 22 Sep 2026 from the shared role vocabulary, role_vocabulary.json).

Usage: python dhe_spec.py [out_dir] [--overrides spec/data_handling_ethics_overrides.json]   -> data_handling_ethics.fts.json
"""
import json, os, sys
from ka_build import build

SRC_DECK = "DMBOK Data Lifecycle and KA Context Diagrams.pdf, Data Handling Ethics pages 13 to 16 (What, Why, Activities with Role Players and Technical Drivers on one page)"
SRC_HOWARD = "Howard Diesel, 22 Sep 2026: five Data Ethics managed elements (Ethical Data Handling Strategy; Practice Gap; Ethics Communication and Training Programme; Ethical Use of a Data Asset; Ethics Compliance Incident), Global gating of release (Non-waivable), sharing, restoration, the incident triggers and the assessment service; both Customer Master runs with an incident in the banking run"
SRC_PROTOCOL = "global_protocol.fts.json v0.2.1 for the contribution targets; data_governance v0.2, data_security, metadata_management, data_integration_interoperability, data_warehousing_bi and big_data_data_science v0.1 for the couplings"

CONTEXT = {
    "knowledgeArea": "Data Handling Ethics",
    "definition": "Data handling ethics are concerned with how to procure, store, manage, interpret, analyse/apply and dispose of data in ways that are aligned with ethical principles, including community responsibility. \"Doing it right when no one is looking.\"",
    "ensures": "Every intended use of a Data Asset is assessed against the organisation's ethical principles and risk factors and cleared with conditions before access is released or the asset shared; staff are educated under a communication and training programme; practice gaps are closed; compliance incidents are reported, investigated and remediated; and the strategy is kept aligned with the regulatory environment.",
    "goals": ["To define ethical handling of data in the organization", "To educate staff on the organization risks of improper data handling", "To change/instil preferred culture and behaviours on handling data", "To monitor regulatory environment, measure, monitor, and adjust organization approaches for ethics in data"],
    "businessDrivers": ["Trustworthiness and improved relationships, a competitive advantage", "Reducing the risk of misuse of data", "Responsibilities when sharing data", "Organisation wide commitment to handling data ethically"],
    "inputs": ["Existing and Preferred Organization Ethics", "Business Strategy and Goals", "Organizational Structure", "Business Culture", "Regulations", "Existing Corporate Policies"],
    "processes": [
        {"id": "1", "name": "Review Data-Handling Practices", "phase": "P", "subActivities": []},
        {"id": "2", "name": "Identify Principles, Practices, and Risk Factors", "phase": "P", "subActivities": []},
        {"id": "3", "name": "Create an Ethical Data Handling Strategy", "phase": "P", "subActivities": [], "note": "The diagram reads 'Create and Ethical Data Handling Strategy' with no phase tag; (P) inferred from its place among the planning activities and the title corrected to 'an'."},
        {"id": "4", "name": "Address Practices Gaps", "phase": "D", "subActivities": []},
        {"id": "5", "name": "Communicate and Educate Staff", "phase": "D", "subActivities": []},
        {"id": "6", "name": "Monitor and Maintain Alignment", "phase": "C", "subActivities": []},
    ],
    "deliverables": ["Current Practices and Gaps", "Ethical Data Handling Strategy", "Communication Plan", "Ethics Training Program", "Ethical Corporate Statements on Data", "Awareness to Ethical Data Issues", "Aligned Incentives, KPIs, and Targets", "Updated Policies", "Ethical Data Handling Reporting"],
    "suppliers": ["Executives", "Data Stewards", "Executive Data Stewards", "IT Executives", "Data Providers", "Regulators"],
    "participants": ["Data Governance Bodies", "CDO / CIO", "Executives", "Coordinating Data Stewards", "Subject Matter Experts", "Change Managers", "DM Services"],
    "consumers": ["Employees", "Executives", "Regulators"],
    "techniques": ["Communication Plan Checklists", "Annual Ethics Statement Affirmations"],
    "tools": ["Wikis, Knowledge Bases, Intranet Sites", "Microblogs, other internal communication tools"],
    "metrics": ["Number of Employees Trained", "Compliance / non-compliance Incidents", "Corporate Executive Involvement"],
    "phaseTags": "(P) Planning, (C) Control, (D) Development, (O) Operations",
}

KA_SUBJECT = "Data Handling Ethics Knowledge Area: five managed elements, one FTS (state region) each; the Data Asset is the Global subject reached through contributions"
REGIONS = [
    ("REG-DHE-EDS", "Ethical Data Handling Strategy", "EDS", "Whether the ethical data handling strategy of the scope has its practices reviewed, its principles and risk factors identified, is defined, approved, in force or under alignment review.", "STS-EDS-01", "Exactly one active state; a strategy under review keeps the policies and corporate statements in force.",
     "Ethical Data Handling Strategy of the governed scope: the practices review, the principles, practices and risk factors, the strategy itself, the ethical corporate statements on data and the updated policies every use of data is assessed against",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Governing element (strategy and policy)", "contributesTo": "No Global transition is gated on the strategy directly; it gates use assessment and gap identification through cross-region constraints.", "conditionsThatMatter": "None; practices reviewed; principles and risk factors identified; defined; approved; in force; under alignment review."}),
    ("REG-DHE-GAP", "Practice Gap", "GAP", "Whether one gap between current and preferred data-handling practice is identified, has its remediation planned, is addressed, or is closed (verified or accepted).", "STS-GAP-01", "Exactly one active state per gap; Closed Gap records either verified closure or an accepted risk with its authority.",
     "Practice Gap: one gap between current and preferred data-handling practice found by the practices review or an incident, with its remediation plan, its closure or its acceptance as a risk",
     {"instanceScope": "One instance per gap.", "elementKind": "Managed per-case element", "contributesTo": "No Global transition is gated on a gap; a gap is a Data Asset issue for Data Governance and feeds the strategy review.", "conditionsThatMatter": "None; identified; remediation planned; addressed; closed."}),
    ("REG-DHE-ECP", "Ethics Communication and Training Programme", "ECP", "Whether the communication plan and training programme of the scope are planned, developed, in operation with staff educated and affirmations collected, or under refresh.", "STS-ECP-01", "Exactly one active state; a programme under refresh keeps the training in operation.",
     "Ethics Communication and Training Programme of the governed scope: the communication plan with its checklists, the ethics training programme, the annual ethics statement affirmations, the aligned incentives, KPIs and targets and the awareness of ethical data issues they produce",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Governing element (programme)", "contributesTo": "No Global transition is gated on the programme directly; a use is cleared only while the programme is in operation (cross-region constraint).", "conditionsThatMatter": "None; communication planned; training developed; in operation; under refresh."}),
    ("REG-DHE-EUS", "Ethical Use of a Data Asset", "EUS", "Whether one intended use of a Data Asset is unassessed, risk assessed, conditioned, cleared, suspended, declined or withdrawn.", "STS-EUS-01", "Exactly one active state per asset and intended use; Cleared Use means the use and its sharing run under recorded conditions with reporting active.",
     "Ethical Use of a Data Asset: one intended use (a purpose, an audience, a sharing arrangement) of one asset, assessed against the principles and risk factors, conditioned, cleared, monitored, suspended on an incident or change, restored, withdrawn or declined",
     {"instanceScope": "One instance per asset and intended use.", "elementKind": "Managed per-asset element", "contributesTo": "Availability: access is released only for a cleared use (TR-AV-01, Non-waivable) and restored only when the clearance is restored with no open incident (TR-AV-04); Custody: external custody and custody transfer only under the sharing conditions of a cleared use (TR-CP-04, TR-CP-05); Assurance: the ethics risk assessment supplies assurance evidence (TR-AS-02).", "conditionsThatMatter": "None; assessed; conditioned; cleared; suspended; declined; withdrawn."}),
    ("REG-DHE-ECI", "Ethics Compliance Incident", "ECI", "Whether one compliance or non-compliance incident is reported, investigated, remediated or closed.", "STS-ECI-01", "Exactly one active state per incident; while an incident is reported or under investigation the clearance of the affected use is suspended.",
     "Ethics Compliance Incident: one reported breach or suspected breach of the ethical handling conditions (use beyond the cleared purpose, improper sharing, misuse), investigated, remediated with learnings to the strategy and programme, dismissed or closed",
     {"instanceScope": "One instance per incident.", "elementKind": "Managed per-incident element", "contributesTo": "Availability: a reported incident emits the access-suspension trigger (TR-AV-03) and blocks restoration until resolved (TR-AV-04); Assurance: a reported incident emits the assurance trigger (TR-AS-05).", "conditionsThatMatter": "None; reported; under investigation; remediated; closed."}),
]
STATES = [
    ("STS-EDS-01", "REG-DHE-EDS", "No Ethics Strategy", True, False, "No ethical data handling strategy exists for the scope; handling follows existing corporate policies and culture.", "The absence of a strategy remains visible to governance bodies.", ["inputs:Existing and Preferred Organization Ethics", "inputs:Existing Corporate Policies"]),
    ("STS-EDS-02", "REG-DHE-EDS", "Reviewed Practices", False, False, "Current data-handling practices are reviewed against the preferred organisation ethics and the gaps recorded.", "The current practices and gaps record remains traceable to the review.", ["process:1", "deliverable:Current Practices and Gaps", "inputs:Business Culture"]),
    ("STS-EDS-03", "REG-DHE-EDS", "Identified Principles and Risk Factors", False, False, "The ethical principles, preferred practices and risk factors are identified from the organisation ethics, regulations and business strategy.", "Each principle and risk factor remains traceable to its source.", ["process:2", "inputs:Regulations", "inputs:Business Strategy and Goals"]),
    ("STS-EDS-04", "REG-DHE-EDS", "Defined Ethics Strategy", False, False, "The ethical data handling strategy, the ethical corporate statements on data and the updated policies are drafted and await approval.", "The strategy remains consistent with the principles, regulations and corporate policies.", ["process:3", "deliverable:Ethical Data Handling Strategy", "deliverable:Ethical Corporate Statements on Data", "deliverable:Updated Policies"]),
    ("STS-EDS-05", "REG-DHE-EDS", "Approved Ethics Strategy", False, False, "The strategy, statements and policies are approved by the executives and governance bodies.", "The approved documents and approving authority remain traceable.", ["process:3", "metric:Corporate Executive Involvement"]),
    ("STS-EDS-06", "REG-DHE-EDS", "Ethics Strategy in Force", False, False, "The policies and corporate statements are published and applied; the regulatory environment is monitored and ethical data handling reporting runs.", "Every use assessment applies the principles in force; reporting remains current.", ["process:6", "deliverable:Ethical Data Handling Reporting", "metric:Compliance / non-compliance Incidents"]),
    ("STS-EDS-07", "REG-DHE-EDS", "Ethics Strategy under Alignment Review", False, False, "A regulatory change, incident learnings or a business change trigger a review while the policies in force stay in force.", "The policies in force remain valid until the realigned strategy is approved.", ["process:6", "inputs:Regulations"]),
    ("STS-GAP-01", "REG-DHE-GAP", "No Gap", True, False, "No gap between current and preferred practice is identified for the case.", "The absence of a gap remains visible in the practices record.", ["process:1"]),
    ("STS-GAP-02", "REG-DHE-GAP", "Identified Gap", False, False, "A gap is identified by the practices review or an incident and logged as a Data Asset issue.", "The gap, its practice and its risk remain recorded.", ["process:1", "process:4", "deliverable:Current Practices and Gaps"]),
    ("STS-GAP-03", "REG-DHE-GAP", "Planned Remediation", False, False, "The remediation of the gap (policy, practice, training, control) is planned with an owner and date.", "The plan, owner and date remain explicit.", ["process:4"]),
    ("STS-GAP-04", "REG-DHE-GAP", "Addressed Gap", False, False, "The remediation is executed; verification is pending.", "The executed remediation remains recorded.", ["process:4"]),
    ("STS-GAP-05", "REG-DHE-GAP", "Closed Gap", False, False, "The gap is closed: verified as remediated, or accepted as a risk with executive sign-off.", "The closure basis (verified or accepted) and its authority remain recorded.", ["process:4", "process:6"]),
    ("STS-ECP-01", "REG-DHE-ECP", "No Programme", True, False, "No ethics communication or training programme exists.", "The absence of a programme remains visible.", ["process:5"]),
    ("STS-ECP-02", "REG-DHE-ECP", "Planned Communication", False, False, "The communication plan is drafted with its checklists and audiences.", "The plan remains traceable to the strategy.", ["process:5", "deliverable:Communication Plan", "techniques:Communication Plan Checklists"]),
    ("STS-ECP-03", "REG-DHE-ECP", "Developed Training", False, False, "The ethics training programme is developed and the incentives, KPIs and targets aligned.", "Training content remains consistent with the policies in force.", ["process:5", "deliverable:Ethics Training Program", "deliverable:Aligned Incentives, KPIs, and Targets"]),
    ("STS-ECP-04", "REG-DHE-ECP", "Programme in Operation", False, False, "Staff are educated, awareness is raised, annual ethics statement affirmations are collected and the number of employees trained is measured.", "Training coverage and affirmations remain measured against target.", ["process:5", "deliverable:Awareness to Ethical Data Issues", "techniques:Annual Ethics Statement Affirmations", "metric:Number of Employees Trained", "tools:Wikis, Knowledge Bases, Intranet Sites"]),
    ("STS-ECP-05", "REG-DHE-ECP", "Programme under Refresh", False, False, "The plan and training are refreshed after a policy change, a regulatory change or incident learnings while training stays in operation.", "The programme in operation remains valid until the refresh is complete.", ["process:5", "process:6"]),
    ("STS-EUS-01", "REG-DHE-EUS", "Unassessed Use", True, False, "The intended use of the asset has not been assessed against the ethical principles.", "The unassessed use remains visible and blocks release.", ["process:6"]),
    ("STS-EUS-02", "REG-DHE-EUS", "Assessed Use", False, False, "The ethics risk assessment of the intended use is done: purpose, fairness, transparency, harm, community responsibility, sharing responsibilities and lawful basis.", "The assessment remains traceable to the principles and risk factors in force.", ["process:6", "deliverable:Ethical Data Handling Reporting"]),
    ("STS-EUS-03", "REG-DHE-EUS", "Conditioned Use", False, False, "Conditions for the use are set: purpose limits, audience, sharing conditions, monitoring and reporting.", "The conditions remain explicit and owned.", ["process:6"]),
    ("STS-EUS-04", "REG-DHE-EUS", "Cleared Use", False, False, "The use is cleared under its conditions; access and sharing may proceed; reporting is active.", "The use and any sharing stay within the conditions; reporting remains current.", ["process:6", "deliverable:Ethical Data Handling Reporting"]),
    ("STS-EUS-05", "REG-DHE-EUS", "Suspended Use", False, False, "The clearance is suspended on a reported incident, a purpose change or a regulatory change; access is suspended.", "The suspension cause and the incident reference remain explicit.", ["process:6", "metric:Compliance / non-compliance Incidents"]),
    ("STS-EUS-06", "REG-DHE-EUS", "Declined Use", False, False, "The assessment fails; the intended use is declined with recorded reasons.", "The decline and its reasons remain recorded.", ["process:6"]),
    ("STS-EUS-07", "REG-DHE-EUS", "Withdrawn Use", False, False, "The use has ended or its clearance was withdrawn; the record is retained.", "The withdrawal record remains retrievable.", ["process:6"]),
    ("STS-ECI-01", "REG-DHE-ECI", "No Incident", True, False, "No compliance incident is reported for the case.", "The absence of an incident remains visible in the reporting.", ["process:6"]),
    ("STS-ECI-02", "REG-DHE-ECI", "Reported Incident", False, False, "A breach or suspected breach of the handling conditions is reported and logged as a Data Asset issue; the affected clearance is suspended.", "The report, reporter and affected use remain recorded.", ["process:6", "metric:Compliance / non-compliance Incidents"]),
    ("STS-ECI-03", "REG-DHE-ECI", "Investigated Incident", False, False, "The facts are established: the breach is confirmed with its cause and scope, or not confirmed.", "The investigation record remains complete.", ["process:6"]),
    ("STS-ECI-04", "REG-DHE-ECI", "Remediated Incident", False, False, "The remediation is executed and learnings passed to the strategy, gaps and programme; closure is pending.", "The remediation and learnings remain recorded.", ["process:6"]),
    ("STS-ECI-05", "REG-DHE-ECI", "Closed Incident", False, False, "The incident is closed (remediated or dismissed) and the reporting updated.", "The closure basis and its authority remain recorded.", ["process:6", "deliverable:Ethical Data Handling Reporting"]),
]
EVENTS = {
    "EV-EDS-01": ("Practices review", "Request"), "EV-EDS-02": ("Principles identification", "Evidence trigger"), "EV-EDS-03": ("Strategy definition", "Evidence trigger"), "EV-EDS-04": ("Strategy approval", "Decision outcome"), "EV-EDS-05": ("Strategy rejection", "Decision outcome"), "EV-EDS-06": ("Policy publication", "Decision outcome"), "EV-EDS-07": ("Alignment review trigger", "Monitoring trigger"), "EV-EDS-08": ("Realigned strategy approval", "Decision outcome"), "EV-EDS-09": ("Strategy retirement", "Decision outcome"),
    "EV-GAP-01": ("Gap identification", "Evidence trigger"), "EV-GAP-02": ("Remediation planning", "Decision outcome"), "EV-GAP-03": ("Remediation completion", "Evidence trigger"), "EV-GAP-04": ("Closure verification", "Assessment outcome"), "EV-GAP-05": ("Verification failure", "Assessment outcome"), "EV-GAP-06": ("Gap reopening", "Monitoring trigger"), "EV-GAP-07": ("Risk acceptance", "Decision outcome"),
    "EV-ECP-01": ("Communication planning", "Request"), "EV-ECP-02": ("Training development", "Evidence trigger"), "EV-ECP-03": ("Programme launch", "Decision outcome"), "EV-ECP-04": ("Training rejection", "Decision outcome"), "EV-ECP-05": ("Refresh trigger", "Time trigger"), "EV-ECP-06": ("Refresh completion", "Evidence trigger"), "EV-ECP-07": ("Programme retirement", "Decision outcome"),
    "EV-EUS-01": ("Use assessment", "Request"), "EV-EUS-02": ("Conditions setting", "Decision outcome"), "EV-EUS-03": ("Use clearance", "Decision outcome"), "EV-EUS-04": ("Use decline", "Decision outcome"), "EV-EUS-05": ("Clearance suspension", "Monitoring trigger"), "EV-EUS-06": ("Clearance restoration", "Decision outcome"), "EV-EUS-07": ("Clearance withdrawal", "Decision outcome"), "EV-EUS-08": ("Use reassessment", "Request"), "EV-EUS-09": ("Conditions rejection", "Decision outcome"),
    "EV-ECI-01": ("Incident report", "Request"), "EV-ECI-02": ("Investigation completion", "Evidence trigger"), "EV-ECI-03": ("Remediation completion", "Evidence trigger"), "EV-ECI-04": ("Incident dismissal", "Decision outcome"), "EV-ECI-05": ("Incident closure", "Decision outcome"), "EV-ECI-06": ("Incident reopening", "Monitoring trigger"), "EV-ECI-07": ("Remediation rejection", "Assessment outcome"),
}
DR = {
    "DR-DHE-01": ("Approve the Ethical Data Handling Strategy, Statements and Policies", "ROLE-CDO", "Confirmed 22 Sep 2026 (holder register): Chief Data Officer; drafted as CDO / CIO"),
    "DR-DHE-02": ("Review Practices, Define, Realign and Retire the Strategy", "ROLE-DGC", "Confirmed 22 Sep 2026 (holder register): Data Governance Council; drafted as Data Governance Bodies"),
    "DR-DHE-03": ("Identify, Plan, Address, Verify and Accept a Practice Gap", "ROLE-CODS", "Confirmed 22 Sep 2026 (holder register): Coordinating Data Steward; drafted as Coordinating Data Stewards"),
    "DR-DHE-04": ("Plan, Develop, Launch, Refresh and Retire the Programme", "ROLE-CHG", "Confirmed 22 Sep 2026 (holder register): Change Manager; drafted as Change Managers"),
    "DR-DHE-05": ("Assess a Use and Set its Conditions", "ROLE-CODS", "Confirmed 22 Sep 2026 (holder register): Coordinating Data Steward; drafted as Coordinating Data Stewards"),
    "DR-DHE-06": ("Clear, Suspend, Restore, Withdraw and Decline a Use", "ROLE-DGC", "Confirmed 22 Sep 2026 (holder register): Data Governance Council; drafted as Data Governance Bodies"),
    "DR-DHE-07": ("Report and Investigate an Incident", "ROLE-PM-DHE", "Confirmed 22 Sep 2026 (holder register): Data Handling Ethics Practice Manager; drafted as DM Services"),
    "DR-DHE-08": ("Remediate, Dismiss, Close and Reopen an Incident", "ROLE-DGC", "Confirmed 22 Sep 2026 (holder register): Data Governance Council; drafted as Data Governance Bodies"),
}
ROLES = [
    ("ROLE-DHE-S01", "Executives", "Supplier", "Supply the preferred organisation ethics and business strategy."), ("ROLE-DHE-S02", "Data Stewards", "Supplier", "Supply current practices."), ("ROLE-DHE-S03", "Executive Data Stewards", "Supplier", "Supply domain accountability."), ("ROLE-DHE-S04", "IT Executives", "Supplier", "Supply systems practices."), ("ROLE-DHE-S05", "Data Providers", "Supplier", "Supply data and its handling conditions."), ("ROLE-DHE-S06", "Regulators", "Supplier", "Supply regulations."),
    ("ROLE-DHE-P01", "Data Governance Bodies", "Participant", "Own the strategy review, use clearance and incident closure."), ("ROLE-DHE-P02", "CDO / CIO", "Participant", "Approve the strategy, statements and policies."), ("ROLE-DHE-P03", "Executives", "Participant", "Sponsor and affirm the ethics statements."), ("ROLE-DHE-P04", "Coordinating Data Stewards", "Participant", "Assess uses, set conditions, manage gaps."), ("ROLE-DHE-P05", "Subject Matter Experts", "Participant", "Advise on principles, risk factors and assessments."), ("ROLE-DHE-P06", "Change Managers", "Participant", "Run the communication and training programme."), ("ROLE-DHE-P07", "DM Services", "Participant", "Report and investigate incidents; run the reporting."),
    ("ROLE-DHE-C01", "Employees", "Consumer", "Receive training and affirm the ethics statements."), ("ROLE-DHE-C02", "Executives", "Consumer", "Receive the ethical data handling reporting."), ("ROLE-DHE-C03", "Regulators", "Consumer", "Receive compliance reporting."),
]
TRANS = [
    ("TR-EDS-01", "Review Practices", "STS-EDS-01", "STS-EDS-02", "EV-EDS-01", "Current data-handling practices are reviewed against the preferred organisation ethics and the gaps recorded.", "DR-DHE-02", ["SVC-DHE-01"], ["ACT-DHE-1"]),
    ("TR-EDS-02", "Identify Principles and Risk Factors", "STS-EDS-02", "STS-EDS-03", "EV-EDS-02", "Principles, preferred practices and risk factors are identified from the organisation ethics, regulations and business strategy.", "DR-DHE-02", ["SVC-DHE-01"], ["ACT-DHE-2"]),
    ("TR-EDS-03", "Define Ethics Strategy", "STS-EDS-03", "STS-EDS-04", "EV-EDS-03", "The strategy, corporate statements and updated policies are drafted.", "DR-DHE-02", ["SVC-DHE-01"], ["ACT-DHE-3"]),
    ("TR-EDS-04", "Approve Ethics Strategy", "STS-EDS-04", "STS-EDS-05", "EV-EDS-04", "The executives and governance bodies approve the strategy, statements and policies.", "DR-DHE-01", ["SVC-DHE-01"], ["ACT-DHE-3"]),
    ("TR-EDS-05", "Return Strategy for Rework", "STS-EDS-04", "STS-EDS-03", "EV-EDS-05", "The strategy is rejected with recorded reasons.", "DR-DHE-01", ["SVC-DHE-01"], ["ACT-DHE-3"]),
    ("TR-EDS-06", "Bring Policies into Force", "STS-EDS-05", "STS-EDS-06", "EV-EDS-06", "The policies and corporate statements are published as governance instruments and the reporting and regulatory monitoring started.", "DR-DHE-02", ["SVC-DHE-01", "SVC-DHE-07"], ["ACT-DHE-3", "ACT-DHE-6"]),
    ("TR-EDS-07", "Open Alignment Review", "STS-EDS-06", "STS-EDS-07", "EV-EDS-07", "A regulatory change, incident learnings or a business change is recorded; the policies in force are retained meanwhile.", "DR-DHE-02", ["SVC-DHE-07"], ["ACT-DHE-6"]),
    ("TR-EDS-08", "Approve Realigned Strategy", "STS-EDS-07", "STS-EDS-06", "EV-EDS-08", "The realigned strategy, statements and policies are approved and published.", "DR-DHE-01", ["SVC-DHE-01"], ["ACT-DHE-6"]),
    ("TR-EDS-09", "Retire Ethics Strategy", "STS-EDS-07", "STS-EDS-01", "EV-EDS-09", "No use is cleared under the strategy and the retirement is recorded.", "DR-DHE-02", ["SVC-DHE-01"], ["ACT-DHE-6"]),
    ("TR-GAP-01", "Identify Gap", "STS-GAP-01", "STS-GAP-02", "EV-GAP-01", "A gap between current and preferred practice is found by the practices review or an incident and logged as a Data Asset issue.", "DR-DHE-03", ["SVC-DHE-02"], ["ACT-DHE-1", "ACT-DHE-4"]),
    ("TR-GAP-02", "Plan Remediation", "STS-GAP-02", "STS-GAP-03", "EV-GAP-02", "The remediation is planned with an owner and date.", "DR-DHE-03", ["SVC-DHE-02"], ["ACT-DHE-4"]),
    ("TR-GAP-03", "Address Gap", "STS-GAP-03", "STS-GAP-04", "EV-GAP-03", "The remediation (policy, practice, training or control) is executed.", "DR-DHE-03", ["SVC-DHE-02"], ["ACT-DHE-4"]),
    ("TR-GAP-04", "Verify Closure", "STS-GAP-04", "STS-GAP-05", "EV-GAP-04", "The remediation is verified as effective and the gap closed.", "DR-DHE-03", ["SVC-DHE-02"], ["ACT-DHE-4"]),
    ("TR-GAP-05", "Return Gap for Rework", "STS-GAP-04", "STS-GAP-03", "EV-GAP-05", "Verification fails with recorded reasons.", "DR-DHE-03", ["SVC-DHE-02"], ["ACT-DHE-4"]),
    ("TR-GAP-06", "Reopen Gap", "STS-GAP-05", "STS-GAP-02", "EV-GAP-06", "An incident or review shows the gap has recurred.", "DR-DHE-03", ["SVC-DHE-02"], ["ACT-DHE-6"]),
    ("TR-GAP-07", "Accept Gap as Risk", "STS-GAP-02", "STS-GAP-05", "EV-GAP-07", "The gap is accepted as a risk with executive sign-off and recorded reasons.", "DR-DHE-03", ["SVC-DHE-02"], ["ACT-DHE-4"]),
    ("TR-ECP-01", "Plan Communication", "STS-ECP-01", "STS-ECP-02", "EV-ECP-01", "The communication plan is drafted with its checklists and audiences from the strategy.", "DR-DHE-04", ["SVC-DHE-03"], ["ACT-DHE-5"]),
    ("TR-ECP-02", "Develop Training", "STS-ECP-02", "STS-ECP-03", "EV-ECP-02", "The training programme is developed and the incentives, KPIs and targets aligned.", "DR-DHE-04", ["SVC-DHE-03"], ["ACT-DHE-5"]),
    ("TR-ECP-03", "Launch Programme", "STS-ECP-03", "STS-ECP-04", "EV-ECP-03", "Training and communication start; affirmations and the number of employees trained are measured.", "DR-DHE-04", ["SVC-DHE-03"], ["ACT-DHE-5"]),
    ("TR-ECP-04", "Return Training for Rework", "STS-ECP-03", "STS-ECP-02", "EV-ECP-04", "The training content is rejected with recorded reasons.", "DR-DHE-04", ["SVC-DHE-03"], ["ACT-DHE-5"]),
    ("TR-ECP-05", "Open Programme Refresh", "STS-ECP-04", "STS-ECP-05", "EV-ECP-05", "The annual refresh, a policy change or incident learnings trigger a refresh while training stays in operation.", "DR-DHE-04", ["SVC-DHE-03"], ["ACT-DHE-5", "ACT-DHE-6"]),
    ("TR-ECP-06", "Complete Programme Refresh", "STS-ECP-05", "STS-ECP-04", "EV-ECP-06", "The refreshed plan and training are in operation and affirmations renewed.", "DR-DHE-04", ["SVC-DHE-03"], ["ACT-DHE-5"]),
    ("TR-ECP-07", "Retire Programme", "STS-ECP-05", "STS-ECP-01", "EV-ECP-07", "No use is cleared and the retirement is recorded.", "DR-DHE-04", ["SVC-DHE-03"], ["ACT-DHE-5"]),
    ("TR-EUS-01", "Assess Use", "STS-EUS-01", "STS-EUS-02", "EV-EUS-01", "The intended use is assessed against the principles and risk factors in force, citing the lawful basis of the asset.", "DR-DHE-05", ["SVC-DHE-04"], ["ACT-DHE-6"]),
    ("TR-EUS-02", "Set Conditions", "STS-EUS-02", "STS-EUS-03", "EV-EUS-02", "Purpose limits, audience, sharing conditions, monitoring and reporting are set for the use.", "DR-DHE-05", ["SVC-DHE-04"], ["ACT-DHE-6"]),
    ("TR-EUS-03", "Clear Use", "STS-EUS-03", "STS-EUS-04", "EV-EUS-03", "The governance body clears the use under its conditions while the training programme is in operation.", "DR-DHE-06", ["SVC-DHE-05"], ["ACT-DHE-6"]),
    ("TR-EUS-04", "Decline Use", "STS-EUS-02", "STS-EUS-06", "EV-EUS-04", "The assessment fails; the use is declined with recorded reasons.", "DR-DHE-06", ["SVC-DHE-05"], ["ACT-DHE-6"]),
    ("TR-EUS-05", "Suspend Clearance", "STS-EUS-04", "STS-EUS-05", "EV-EUS-05", "A reported incident, a purpose change or a regulatory change suspends the clearance; the access-suspension trigger is emitted.", "DR-DHE-06", ["SVC-DHE-05"], ["ACT-DHE-6"]),
    ("TR-EUS-06", "Restore Clearance", "STS-EUS-05", "STS-EUS-04", "EV-EUS-06", "The incident is closed or the change assessed and the conditions reconfirmed; no incident is open.", "DR-DHE-06", ["SVC-DHE-05"], ["ACT-DHE-6"]),
    ("TR-EUS-07", "Withdraw Suspended Clearance", "STS-EUS-05", "STS-EUS-07", "EV-EUS-07", "The suspension is not resolved or the use ends; the clearance is withdrawn.", "DR-DHE-06", ["SVC-DHE-05"], ["ACT-DHE-6"]),
    ("TR-EUS-08", "Withdraw Cleared Use", "STS-EUS-04", "STS-EUS-07", "EV-EUS-07", "The purpose is fulfilled or the basis for the use ends (consent withdrawn, contract ended).", "DR-DHE-06", ["SVC-DHE-05"], ["ACT-DHE-6"]),
    ("TR-EUS-09", "Reassess Withdrawn Use", "STS-EUS-07", "STS-EUS-02", "EV-EUS-08", "A new purpose is proposed and assessed under the principles in force.", "DR-DHE-05", ["SVC-DHE-04"], ["ACT-DHE-6"]),
    ("TR-EUS-10", "Reassess Declined Use", "STS-EUS-06", "STS-EUS-02", "EV-EUS-08", "The use is revised and reassessed.", "DR-DHE-05", ["SVC-DHE-04"], ["ACT-DHE-6"]),
    ("TR-EUS-11", "Return Conditions", "STS-EUS-03", "STS-EUS-02", "EV-EUS-09", "The governance body rejects the conditions; the use is reassessed.", "DR-DHE-06", ["SVC-DHE-04"], ["ACT-DHE-6"]),
    ("TR-ECI-01", "Report Incident", "STS-ECI-01", "STS-ECI-02", "EV-ECI-01", "A breach or suspected breach of the handling conditions of an assessed use is reported and logged as a Data Asset issue; the access-suspension and assurance triggers are emitted.", "DR-DHE-07", ["SVC-DHE-06"], ["ACT-DHE-6"]),
    ("TR-ECI-02", "Investigate Incident", "STS-ECI-02", "STS-ECI-03", "EV-ECI-02", "The facts, cause and scope are established.", "DR-DHE-07", ["SVC-DHE-06"], ["ACT-DHE-6"]),
    ("TR-ECI-03", "Remediate Incident", "STS-ECI-03", "STS-ECI-04", "EV-ECI-03", "The confirmed breach is remediated and learnings passed to the strategy, gaps and programme.", "DR-DHE-08", ["SVC-DHE-06"], ["ACT-DHE-6"]),
    ("TR-ECI-04", "Dismiss Incident", "STS-ECI-03", "STS-ECI-05", "EV-ECI-04", "The investigation does not confirm a breach; the incident is closed as dismissed with reasons.", "DR-DHE-08", ["SVC-DHE-06"], ["ACT-DHE-6"]),
    ("TR-ECI-05", "Close Incident", "STS-ECI-04", "STS-ECI-05", "EV-ECI-05", "The remediation is verified and the reporting updated.", "DR-DHE-08", ["SVC-DHE-06", "SVC-DHE-07"], ["ACT-DHE-6"]),
    ("TR-ECI-06", "Reopen Incident", "STS-ECI-05", "STS-ECI-02", "EV-ECI-06", "New facts or a recurrence reopen the incident.", "DR-DHE-08", ["SVC-DHE-06"], ["ACT-DHE-6"]),
    ("TR-ECI-07", "Return Remediation", "STS-ECI-04", "STS-ECI-03", "EV-ECI-07", "Verification of the remediation fails; the investigation is reopened.", "DR-DHE-08", ["SVC-DHE-06"], ["ACT-DHE-6"]),
]
SERVICES = [
    ("SVC-DHE-01", "Governance", "Practices Review and Ethics Strategy", "Practices review; principles identification; strategy definition, approval, publication, realignment, retirement.", "Current practices and gaps; ethical data handling strategy; corporate statements; updated policies."),
    ("SVC-DHE-02", "Control", "Practice Gap Remediation", "Gap identification; remediation planning; execution; verification; acceptance; reopening.", "Gap record; remediation plan; verification or acceptance record."),
    ("SVC-DHE-03", "Governance", "Ethics Communication and Training", "Communication planning; training development; launch; refresh; retirement.", "Communication plan; training programme; affirmations; number of employees trained."),
    ("SVC-DHE-04", "Assurance", "Ethics Risk Assessment", "Use assessment; conditions setting; reassessment.", "Ethics risk assessment record; conditions of use."),
    ("SVC-DHE-05", "Governance", "Ethical Use Clearance", "Clearance; decline; suspension; restoration; withdrawal.", "Clearance decision with conditions; suspension and restoration records."),
    ("SVC-DHE-06", "Control", "Ethics Incident Management", "Incident report; investigation; remediation; dismissal; closure; reopening.", "Incident record; investigation and remediation records; learnings."),
    ("SVC-DHE-07", "Assurance", "Ethical Data Handling Reporting and Monitoring", "Policy publication; incident closure; alignment review trigger.", "Ethical data handling reporting; compliance incident metric; regulatory environment monitoring."),
]
ACTS = [
    ("ACT-DHE-1", "Review Data-Handling Practices", "1", "Transition-causing", ["REG-DHE-EDS", "REG-DHE-GAP"], ["TR-EDS-01", "TR-GAP-01"], ["SVC-DHE-01", "SVC-DHE-02"]),
    ("ACT-DHE-2", "Identify Principles, Practices, and Risk Factors", "2", "Transition-causing", ["REG-DHE-EDS"], ["TR-EDS-02"], ["SVC-DHE-01"]),
    ("ACT-DHE-3", "Create an Ethical Data Handling Strategy", "3", "Transition-causing", ["REG-DHE-EDS"], ["TR-EDS-03", "TR-EDS-04", "TR-EDS-05", "TR-EDS-06"], ["SVC-DHE-01"]),
    ("ACT-DHE-4", "Address Practices Gaps", "4", "Transition-causing", ["REG-DHE-GAP"], ["TR-GAP-01", "TR-GAP-02", "TR-GAP-03", "TR-GAP-04", "TR-GAP-05", "TR-GAP-07"], ["SVC-DHE-02"]),
    ("ACT-DHE-5", "Communicate and Educate Staff", "5", "Transition-causing", ["REG-DHE-ECP"], ["TR-ECP-01", "TR-ECP-02", "TR-ECP-03", "TR-ECP-04", "TR-ECP-05", "TR-ECP-06", "TR-ECP-07"], ["SVC-DHE-03"]),
    ("ACT-DHE-6", "Monitor and Maintain Alignment", "6", "Transition-causing", ["REG-DHE-EDS", "REG-DHE-GAP", "REG-DHE-ECP", "REG-DHE-EUS", "REG-DHE-ECI"], ["TR-EDS-06", "TR-EDS-07", "TR-EDS-08", "TR-EDS-09", "TR-GAP-06", "TR-ECP-05", "TR-EUS-01", "TR-EUS-02", "TR-EUS-03", "TR-EUS-04", "TR-EUS-05", "TR-EUS-06", "TR-EUS-07", "TR-EUS-08", "TR-EUS-09", "TR-EUS-10", "TR-EUS-11", "TR-ECI-01", "TR-ECI-02", "TR-ECI-03", "TR-ECI-04", "TR-ECI-05", "TR-ECI-06", "TR-ECI-07"], ["SVC-DHE-04", "SVC-DHE-05", "SVC-DHE-06", "SVC-DHE-07"]),
]
ARTEFACTS = [
    ("ART-DHE-01", "Current Practices and Gaps", "STS-EDS-02", "Review Data-Handling Practices", "Evidences Reviewed Practices; seeds the Practice Gap FTS."), ("ART-DHE-02", "Ethical Data Handling Strategy", "STS-EDS-05", "Create an Ethical Data Handling Strategy", "Evidences Approved Ethics Strategy."), ("ART-DHE-03", "Ethical Corporate Statements on Data", "STS-EDS-06", "Create an Ethical Data Handling Strategy", "Published with the policies; affirmed annually."), ("ART-DHE-04", "Updated Policies", "STS-EDS-06", "Create an Ethical Data Handling Strategy", "Evidences Ethics Strategy in Force; governance instruments."), ("ART-DHE-05", "Communication Plan", "STS-ECP-02", "Communicate and Educate Staff", "Evidences Planned Communication."), ("ART-DHE-06", "Ethics Training Program", "STS-ECP-03", "Communicate and Educate Staff", "Evidences Developed Training."), ("ART-DHE-07", "Aligned Incentives, KPIs, and Targets", "STS-ECP-03", "Communicate and Educate Staff", "Evidences Developed Training."), ("ART-DHE-08", "Awareness to Ethical Data Issues", "STS-ECP-04", "Communicate and Educate Staff", "Evidences Programme in Operation."), ("ART-DHE-09", "Ethical Data Handling Reporting", "STS-EUS-04", "Monitor and Maintain Alignment", "Evidences Cleared Use and the incident metric; cited by Global release."),
]
CONTRIB = [
    ("CON-DHE-01", "TR-AV-01", "guard", {"EUS": ["STS-EUS-04"]}, "Access is released only when the asset's intended use is ethically cleared under its conditions.", "DHE_use_cleared", "Non-waivable", "Howard, 22 Sep: Non-waivable and not Conditional; every release needs a cleared use."),
    ("CON-DHE-02", "TR-CP-04", "guard", {"EUS": ["STS-EUS-04"]}, "The asset is placed in external custody only under the sharing conditions of a cleared use.", "DHE_use_cleared or not DHE_use_active", "Conditional", "Responsibilities when sharing data."),
    ("CON-DHE-03", "TR-CP-05", "guard", {"EUS": ["STS-EUS-04"]}, "Custody transfer is initiated only under the sharing conditions of a cleared use.", "DHE_use_cleared or not DHE_use_active", "Conditional", "Responsibilities when sharing data."),
    ("CON-DHE-04", "TR-AV-03", "event", {"ECI": ["STS-ECI-02", "STS-ECI-03"]}, "A reported compliance incident suspends access to the asset until resolved.", "DHE_open_incident", "Conditional", "Data Ethics emits EV-AV-03 when TR-ECI-01 or TR-ECI-06 fires."),
    ("CON-DHE-05", "TR-AS-05", "event", {"ECI": ["STS-ECI-02", "STS-ECI-03"]}, "A reported compliance incident is a material change affecting the assurance claim.", "DHE_open_incident", "Conditional", "Data Ethics emits EV-AS-05 when TR-ECI-01 or TR-ECI-06 fires."),
    ("CON-DHE-06", "TR-AV-04", "guard", {"EUS": ["STS-EUS-04"], "ECI": ["STS-ECI-01", "STS-ECI-04", "STS-ECI-05"]}, "Suspended access is restored only when the clearance is restored and no incident is open.", "DHE_use_cleared and not DHE_open_incident", "Required", "Mirrors the Non-waivable release guard."),
    ("CON-DHE-07", "TR-AS-02", "service", {"EUS": ["STS-EUS-02", "STS-EUS-03", "STS-EUS-04"]}, "The Ethics Risk Assessment supplies assurance evidence for the asset's intended use.", "SVC-DHE-04", "Conditional", "Assurance service; evidence EVD-DHE-04."),
]
KA_COUPLINGS = [
    ("KAC-DHE-01", "KA-DG", "TR-ISS-01", "EV-ISS-01", "DHE_open_incident", "A reported ethics incident and an identified practice gap are logged as Data Asset issues with source Data Handling Ethics (TR-ECI-01 and TR-GAP-01 emit EV-ISS-01).", "DG owns escalation; Data Ethics owns the remediation."),
    ("KAC-DHE-02", "KA-DG", "TR-POL-03", "", "DHE_policy_set_in_force", "The ethics policies and corporate statements are published as governance instruments (TR-EDS-06 cites the DG fact).", "Reverse coupling: a Data Ethics transition cites a DG fact."),
    ("KAC-DHE-03", "KA-DS", "TR-PRV-02", "", "DS_privacy_basis_ok", "The ethics assessment of a use cites the lawful basis of the asset (TR-EUS-01 cites the DS fact).", "Reverse coupling: a Data Ethics transition cites a DS fact."),
    ("KAC-DHE-04", "KA-DS", "TR-INC-01", "EV-ECI-01", "DS_open_incident", "A security incident flagged as misuse of data raises an ethics incident report: Data Security's Detect Incident (TR-INC-01) raises Report Incident (TR-ECI-01) here when incident_is_misuse is set.", "Howard, 24 Sep 2026 (Open Decisions A1 option a): a trigger, not a precondition; an ethics incident no longer needs an open security incident."),
    ("KAC-DHE-05", "KA-BDA", "TR-INS-02", "", "DHE_use_cleared", "The trust and ethics review of an insight cites the ethical clearance of the model's use (the BDA transition cites the Data Ethics fact).", "Forward coupling: a BDA transition cites a Data Ethics fact."),
    ("KAC-DHE-06", "KA-DWBI", "TR-PRD-04", "", "DHE_use_cleared", "A data product is released only for an ethically cleared use (the DWBI transition cites the Data Ethics fact).", "Forward coupling: a DWBI transition cites a Data Ethics fact."),
    ("KAC-DHE-07", "KA-DII", "TR-EXC-05", "", "DHE_use_cleared", "A data access agreement carries the sharing conditions of the cleared use (the DII transition cites the Data Ethics fact).", "Forward coupling: a DII transition cites a Data Ethics fact."),
    ("KAC-DHE-08", "KA-MM", "TR-AST-02", "", "DHE_use_cleared", "The conditions of a cleared use are described as metadata of the asset (the MM transition cites the Data Ethics fact).", "Forward coupling: an MM transition cites a Data Ethics fact."),
    ("KAC-DHE-09", "KA-DHE", "TR-ECI-01", "EV-ECI-01", "True", "An ethical assessment that finds a use unacceptable raises an ethics incident report: Decline Use (TR-EUS-04) and Suspend Clearance (TR-EUS-05) raise Report Incident (TR-ECI-01) on the same asset. Community feedback is the other source: it arrives as the Report Incident request itself, with its source named on the request (system: community feedback).", "Howard, 24 Sep 2026 (Open Decisions A1 comment and D3 option a): ethics incidents typically come from an ethical assessment (report) and from community feedback; KAC-DHE-04 (security incident) withdrawn."),
]
FACT_BINDINGS = {
    "DHE_strategy_in_force": {"region": "REG-DHE-EDS", "states": ["STS-EDS-06", "STS-EDS-07"]},
    "DHE_gap_open": {"region": "REG-DHE-GAP", "states": ["STS-GAP-02", "STS-GAP-03", "STS-GAP-04"]},
    "DHE_programme_operating": {"region": "REG-DHE-ECP", "states": ["STS-ECP-04", "STS-ECP-05"]},
    "DHE_use_active": {"region": "REG-DHE-EUS", "states": ["STS-EUS-02", "STS-EUS-03", "STS-EUS-04", "STS-EUS-05"]},
    "DHE_use_assessed": {"region": "REG-DHE-EUS", "states": ["STS-EUS-02", "STS-EUS-03", "STS-EUS-04", "STS-EUS-05"]},
    "DHE_use_cleared": {"region": "REG-DHE-EUS", "states": ["STS-EUS-04"]},
    "DHE_use_suspended": {"region": "REG-DHE-EUS", "states": ["STS-EUS-05"]},
    "DHE_use_declined": {"region": "REG-DHE-EUS", "states": ["STS-EUS-06"]},
    "DHE_open_incident": {"region": "REG-DHE-ECI", "states": ["STS-ECI-02", "STS-ECI-03"]},
    "DHE_incident_remediated": {"region": "REG-DHE-ECI", "states": ["STS-ECI-04", "STS-ECI-05"]},
}
XRG = [
    ("XRG-DHE-01", "A use is assessed only under an ethics strategy in force.", ["TR-EUS-01", "TR-EUS-09", "TR-EUS-10"], "Required", "EDS in ('STS-EDS-06','STS-EDS-07')"),
    ("XRG-DHE-02", "A use is cleared only while the communication and training programme is in operation.", ["TR-EUS-03"], "Required", "ECP in ('STS-ECP-04','STS-ECP-05')"),
    ("XRG-DHE-03", "A clearance is restored only when no incident is open.", ["TR-EUS-06"], "Required", "ECI in ('STS-ECI-01','STS-ECI-04','STS-ECI-05')"),
    ("XRG-DHE-04", "An incident is reported only against an assessed use.", ["TR-ECI-01", "TR-ECI-06"], "Required", "EUS in ('STS-EUS-02','STS-EUS-03','STS-EUS-04','STS-EUS-05')"),
    ("XRG-DHE-05", "A gap is identified only after the practices review.", ["TR-GAP-01"], "Required", "EDS in ('STS-EDS-02','STS-EDS-03','STS-EDS-04','STS-EDS-05','STS-EDS-06','STS-EDS-07')"),
    ("XRG-DHE-06", "The strategy is retired only when no use is cleared or suspended.", ["TR-EDS-09"], "Required", "EUS in ('STS-EUS-01','STS-EUS-06','STS-EUS-07')"),
    ("XRG-DHE-07", "The programme is retired only when no use is cleared or suspended.", ["TR-ECP-07"], "Required", "EUS in ('STS-EUS-01','STS-EUS-06','STS-EUS-07')"),
]
VECTORS = [
    ("CFG-DHE-01", "Greenfield", {"REG-DHE-EDS": "STS-EDS-01", "REG-DHE-GAP": "STS-GAP-01", "REG-DHE-ECP": "STS-ECP-01", "REG-DHE-EUS": "STS-EUS-01", "REG-DHE-ECI": "STS-ECI-01"}, "Initial configuration: no strategy, programme, assessed use or incident; Global release is blocked (Non-waivable) until a use is cleared."),
    ("CFG-DHE-02", "Strategy and programme in force, use unassessed", {"REG-DHE-EDS": "STS-EDS-06", "REG-DHE-GAP": "STS-GAP-01", "REG-DHE-ECP": "STS-ECP-04", "REG-DHE-EUS": "STS-EUS-01", "REG-DHE-ECI": "STS-ECI-01"}, "Legal: uses can be assessed; release still blocked."),
    ("CFG-DHE-03", "Use cleared", {"REG-DHE-EDS": "STS-EDS-06", "REG-DHE-GAP": "STS-GAP-01", "REG-DHE-ECP": "STS-ECP-04", "REG-DHE-EUS": "STS-EUS-04", "REG-DHE-ECI": "STS-ECI-01"}, "Legal: release, external custody and transfer pass; the assessment supplies assurance evidence."),
    ("CFG-DHE-04", "Incident reported, clearance suspended", {"REG-DHE-EDS": "STS-EDS-06", "REG-DHE-GAP": "STS-GAP-01", "REG-DHE-ECP": "STS-ECP-04", "REG-DHE-EUS": "STS-EUS-05", "REG-DHE-ECI": "STS-ECI-02"}, "Legal: EV-AV-03 and EV-AS-05 emitted; DG issue logged; restoration blocked until the incident is closed and the clearance restored."),
    ("CFG-DHE-05", "Incident closed, clearance restored", {"REG-DHE-EDS": "STS-EDS-06", "REG-DHE-GAP": "STS-GAP-02", "REG-DHE-ECP": "STS-ECP-05", "REG-DHE-EUS": "STS-EUS-04", "REG-DHE-ECI": "STS-ECI-05"}, "Legal: restoration passes; a gap from the learnings is open and the programme under refresh."),
    ("CFG-DHE-06", "Use declined", {"REG-DHE-EDS": "STS-EDS-06", "REG-DHE-GAP": "STS-GAP-01", "REG-DHE-ECP": "STS-ECP-04", "REG-DHE-EUS": "STS-EUS-06", "REG-DHE-ECI": "STS-ECI-01"}, "Legal: release blocked; no exception can waive it."),
]
EVIDENCE = [
    ("EVD-DHE-01", "Strategy approval record", "Decision evidence", "TR-EDS-04", "Approved strategy, statements, policies; approving authority; executive involvement."), ("EVD-DHE-02", "Gap closure record", "Control evidence", "TR-GAP-04", "Verification result or risk acceptance; authority."), ("EVD-DHE-03", "Programme launch record", "Governance evidence", "TR-ECP-03", "Training coverage; affirmations; incentives and KPIs aligned."), ("EVD-DHE-04", "Ethics risk assessment record", "Assurance evidence", "TR-EUS-01", "Purpose, fairness, transparency, harm, community responsibility, sharing responsibilities, lawful basis cited."), ("EVD-DHE-05", "Clearance record", "Decision evidence", "TR-EUS-03", "Conditions of use; clearing authority; reporting activated."), ("EVD-DHE-06", "Suspension record", "Control evidence", "TR-EUS-05", "Cause, incident reference, access suspended."), ("EVD-DHE-07", "Incident report", "Control evidence", "TR-ECI-01", "Reported breach, reporter, affected use, DG issue reference."), ("EVD-DHE-08", "Investigation record", "Control evidence", "TR-ECI-02", "Facts, cause, scope, confirmation or dismissal."), ("EVD-DHE-09", "Remediation record", "Control evidence", "TR-ECI-03", "Remediation, learnings to strategy, gaps and programme."), ("EVD-DHE-10", "Affirmation record", "Assurance evidence", "TR-ECP-06", "Annual ethics statement affirmations renewed; number of employees trained."),
]
EXC = [("EXC-DHE-01", "Conditional Sharing Pilot", "TR-CP-04", "External custody for a named partner under interim sharing conditions before the full conditions are set.", "DR-DHE-06", "Use assessed, partner named, interim conditions recorded with monitoring, full conditions scheduled with a date, Data Security and DG informed, evidence retained; expires at the scheduled date. Never waives the release guard (CON-DHE-01 is Non-waivable).", "Draft / Approved / Expired / Closed")]

# Coupling roles (Howard, 24 Sep 2026, Influence Map Register card 2 option a): each coupling says which Knowledge Area produces
# the fact and which transitions depend on it. kind condition: the twin engine adds the fact as a guard on every dependent
# transition (Required, or Conditional with a qualifier fact that must be true for the guard to apply). kind event: the
# emitter transitions raise the event in the target Knowledge Area (effect resolve: evidence that resolves the issue the
# named coupling raised). Generated from the coupling text and the fact names, then kept here as the source of truth.
COUPLING_ROLES = {'KAC-DHE-09': {'emitters': ['TR-EUS-04', 'TR-EUS-05'], 'kind': 'event', 'producer': 'KA-DHE', 'raises': {'model': 'KA-DHE', 'transition': 'TR-ECI-01'}},
 'KAC-DHE-01': {'emitters': ['TR-ECI-01', 'TR-GAP-01'], 'kind': 'event', 'producer': 'KA-DHE'},
 'KAC-DHE-02': {'dependents': [{'model': 'KA-DHE', 'transition': 'TR-EDS-06'}], 'kind': 'condition', 'producer': 'KA-DG', 'requirement': 'Required'},
 'KAC-DHE-03': {'dependents': [{'model': 'KA-DHE', 'transition': 'TR-EUS-01'}], 'kind': 'condition', 'producer': 'KA-DS', 'requirement': 'Required'},
 'KAC-DHE-04': {'kind': 'withdrawn', 'withdrawnBy': 'Howard, 24 Sep 2026, Open Decisions D3 option a: a security incident is not in itself an ethics incident'},
 'KAC-DHE-05': {'dependents': [{'model': 'KA-BDA', 'transition': 'TR-INS-02'}], 'kind': 'condition', 'producer': 'KA-DHE', 'requirement': 'Required'},
 'KAC-DHE-06': {'dependents': [{'model': 'KA-DWBI', 'transition': 'TR-PRD-04'}],
                'kind': 'condition',
                'producer': 'KA-DHE',
                'requirement': 'Required'},
 'KAC-DHE-07': {'dependents': [{'model': 'KA-DII', 'transition': 'TR-EXC-05'}], 'kind': 'condition', 'producer': 'KA-DHE', 'requirement': 'Required'},
 'KAC-DHE-08': {'kind': 'citation', 'producer': 'KA-DHE', 'cites': {'model': 'KA-MM', 'transition': 'TR-AST-02'}, 'raises': {'model': 'KA-MM', 'event': 'EV-AST-05'}, 'onlyIf': 'MM_asset_described'}}

SPEC = {
    "meta": {"modelId": "KA-DHE", "name": "Data Handling Ethics FTS", "knowledgeArea": "Data Handling Ethics", "version": "0.1", "subjectType": KA_SUBJECT,
             "regionModel": "One FTS per managed element: the Ethical Data Handling Strategy (scope level), a Practice Gap (one per gap), the Ethics Communication and Training Programme (scope level), the Ethical Use of a Data Asset (one per asset and intended use) and an Ethics Compliance Incident (one per incident) run concurrently and are coupled by cross-region constraints, facts and events, never a single subject.",
             "source": SRC_DECK + "; " + SRC_HOWARD + "; " + SRC_PROTOCOL,
             "note": "Five state regions, each its own FTS over one managed element of the Knowledge Area: the Ethical Data Handling Strategy, a Practice Gap, the Ethics Communication and Training Programme, the Ethical Use of a Data Asset and an Ethics Compliance Incident. The KA never becomes a region of the Data Asset; the use and the incident reach the Global protocol through contributions (release only for a cleared use, Non-waivable; external custody and transfer under the sharing conditions of a cleared use; restoration only with the clearance restored and no open incident; a reported incident as the access-suspension and assurance triggers; the ethics risk assessment as the assurance service) and couple to DG, Data Security, BDA, DWBI, DII and Metadata.",
             "definition": CONTEXT["definition"], "factBindings": FACT_BINDINGS},
    "context": CONTEXT, "regions": REGIONS, "states": STATES, "transitions": TRANS, "events": EVENTS, "decisionRights": DR, "roles": ROLES, "artefacts": ARTEFACTS, "activities": ACTS, "services": SERVICES, "contributions": CONTRIB, "kaCouplings": KA_COUPLINGS, "couplingRoles": COUPLING_ROLES, "crossRegionConstraints": XRG, "stateVectors": VECTORS, "evidence": EVIDENCE, "exceptions": EXC,
    "sources": [
        {"id": "SRC-DHE-001", "source": SRC_DECK, "type": "Primary (image pages, captured)", "location": "Chat upload; OneDrive Data Lifecycle folder", "use": "Definition, goals, drivers, inputs, processes, deliverables, role players, techniques, tools, metrics", "limitations": "The context diagram lists six activities and nine deliverables but no lifecycle for a use, a gap or an incident; the Ethical Use states are drafted from the goals (ethical handling defined, monitored, adjusted) and the responsibilities when sharing data, the Practice Gap states from Address Practices Gaps, the Incident states from the compliance / non-compliance incidents metric. Activity 3 reads 'Create and Ethical Data Handling Strategy' with no phase tag; (P) inferred."},
        {"id": "SRC-DHE-002", "source": SRC_HOWARD, "type": "Design direction", "location": "Chat", "use": "Managed elements (five, incident split out), Global gating, Non-waivable release", "limitations": ""},
        {"id": "SRC-DHE-003", "source": SRC_PROTOCOL, "type": "Alignment target", "location": "Private repo models/", "use": "Global transition IDs for contributions; KA transition IDs for couplings", "limitations": ""},
    ],
    "qaNotes": [
        {"severity": "note", "rule": "GA-005", "element": "KA-DHE", "finding": "The strategy and the programme change rarely relative to a use, a gap or an incident and gate them through XRG-DHE-01..07; the Ethical Use and the Compliance Incident are per instance and are the Data Ethics regions that gate Global release, sharing, suspension and restoration."},
        {"severity": "note", "rule": "capture", "element": "REG-DHE-EUS", "finding": "Use states (assessed, conditioned, cleared, suspended, declined, withdrawn), gap states and incident states are drafted from the goals, activities, deliverables and metrics; the context diagram gives no lifecycle. For Howard's review."},
        {"severity": "note", "rule": "scope", "element": "CON-DHE-01", "finding": "CON-DHE-01 is Non-waivable and unconditional: once the Data Ethics model is loaded, every Global access release needs a cleared use; the sharing guards and the assessment service are Conditional and pass for assets with no assessed use."},
        {"severity": "note", "rule": "phase", "element": "process:3", "finding": "Create an Ethical Data Handling Strategy carries no phase tag on the diagram; (P) inferred and marked so; the diagram's 'and' read as 'an'."},
        {"severity": "note", "rule": "derived", "element": "STATES", "finding": "All state names, events, decision rights, holders and services are first-pass drafts from the context diagram; every one is for Howard's review."},
    ],
}

if __name__ == "__main__":
    from ka_build import run_spec
    run_spec(SPEC, "data_handling_ethics.fts.json")
