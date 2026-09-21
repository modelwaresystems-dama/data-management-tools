#!/usr/bin/env python3
"""
ds_spec.py  -  Data Security (including Data Privacy) FTS v0.1: five state regions, each its own FTS over one
managed element of the Knowledge Area, derived from the DMBOK Data Security context diagram (deck pages 54 to
58) and aligned to the Global Data Asset Protocol.

Howard's managed elements (21 Sep 2026): 1 Security Policy and Standards of the scope; 2 Security Classification
of a Data Asset; 3 Protection of a Data Asset; 4 Privacy Basis of personal data in a Data Asset; 5 Security
Incident (one instance per incident).
Decisions 21 Sep 2026: a Security Incident has its own FTS and also logs a Data Governance issue; Data Security
gates access release, external custody and destruction, and emits the withdraw, destroy, suspend and
material-change triggers; every transition carries a Decision Right (holders drafted, REVIEW).

Usage: python ds_spec.py [out_dir]   -> data_security.fts.json
"""
import json, os, sys
from ka_build import build

SRC_DECK = "DMBOK Data Lifecycle and KA Context Diagrams.pdf, Data Security pages 54 to 58 (What, Why, Security Requirements come from, Activities, Role Players and Technical Drivers)"
SRC_HOWARD = "Howard Diesel, 21 Sep 2026: five Data Security managed elements (Policy and Standards; Classification; Protection; Privacy Basis; Security Incident), incident FTS plus DG issue, Global gating of release, external custody and destruction with triggers; Data Privacy included"
SRC_PROTOCOL = "global_protocol.fts.json v0.2.1 for the contribution targets; data_governance.fts.json v0.2, data_quality.fts.json v0.1 and metadata_management.fts.json v0.1 for the couplings"

CONTEXT = {
    "knowledgeArea": "Data Security",
    "definition": "Definition, planning, development, and execution of security policies and procedures to provide proper authentication, authorization, access, and auditing of data and information assets.",
    "ensures": "Effective data security policies and procedures ensure the right people can use and update data the right way, and all inappropriate access and update is restricted (Ray, 2012).",
    "goals": ["Enable appropriate, and prevent inappropriate, access to enterprise data assets.", "Understand and comply with all relevant regulations and policies for privacy, protection, and confidentiality.", "Ensure that the privacy and confidentiality needs of all stakeholders are enforced and audited."],
    "businessDrivers": ["Risk Reduction", "Business growth", "Security as an asset"],
    "requirementSources": ["Stakeholder concerns: privacy and confidentiality of clients' information, trade secrets, business partner activity, mergers and acquisitions (everyone in an organisation must be a responsible trustee of stakeholders' data)", "Government regulation: regulations may restrict access to information, acts ensure openness and accountability, provision of subject access rights", "Legitimate business concerns: trade secrets, research and other IP, knowledge of customer needs, business partner relationships and impending deals (data which provides competitive advantage must be protected)", "Necessary business access needs: data security must be appropriate, not too onerous to prevent users from doing their jobs (Goldilocks principle)", "Contractual obligations: contractual and non-disclosure agreements"],
    "inputs": ["Business goals and strategy", "Business rules and processes", "Regulatory requirements", "Enterprise Architecture standards", "Enterprise Data Model"],
    "processes": [
        {"id": "1", "name": "Identify Relevant Data Security Requirements", "phase": "P", "subActivities": []},
        {"id": "2", "name": "Define Data Security Policy", "phase": "C", "subActivities": []},
        {"id": "3", "name": "Define Data Security Standards", "phase": "D", "subActivities": []},
        {"id": "4", "name": "Assess Current Security Risks", "phase": "P", "subActivities": []},
        {"id": "5", "name": "Implement Controls and Procedures", "phase": "O", "subActivities": []},
    ],
    "deliverables": ["Data security architecture", "Data security policies", "Data privacy and confidentiality standards", "Data security access controls", "Regulatory compliant data access views", "Documented security classifications", "Authentication and user access history", "Data Security audit reports"],
    "suppliers": ["IT Steering Committee", "Enterprise Architects", "Government", "Regulatory Bodies"],
    "participants": ["Data Stewards", "Information Security Team", "Internal Auditors", "Process Analysts"],
    "consumers": ["Business Users", "Regulatory Auditors"],
    "techniques": ["CRUDE Matrix Usage", "Immediate Security Patch Deployment", "Data Security Attributes in Metadata", "Security Needs in Project Requirements", "Document Sanitization"],
    "tools": ["Access Control Systems", "Protective Software", "Identity Management Technology", "Intrusion Detection / Prevention Software", "Metadata tracking", "Data Masking / Encryption"],
    "metrics": ["Security Implementation Metrics", "Security Awareness Metrics", "Data Protection Metrics", "Security Incident Metrics", "Confidential Data Proliferation Rate"],
    "phaseTags": "(P) Planning, (C) Control, (D) Development, (O) Operations",
}

KA_SUBJECT = "Data Security Knowledge Area (including Data Privacy): five managed elements, one FTS (state region) each; the Data Asset is the Global subject reached through contributions"
REGIONS = [
    ("REG-DS-POL", "Security Policy and Standards", "POL", "Whether the security requirements are identified from their five sources and the security policy, privacy and confidentiality standards and security architecture are defined, approved and in force.", "STS-POL-01", "Exactly one active state; only instruments in force may be cited by a classification or a Global guard.",
     "Security Policy and Standards of the governed scope: identified security requirements, data security policy, data privacy and confidentiality standards, data security architecture",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Governing element", "contributesTo": "Governance: security policies and standards are governing instruments held with Data Governance; they define the classification scheme and the protection required per class, so every asset-level Data Security guard is derived from them.", "conditionsThatMatter": "None; requirements identified; policy and standards approved; in force; under review."}),
    ("REG-DS-CLS", "Security Classification of a Data Asset", "CLS", "Whether a Data Asset carries a documented confidentiality, regulatory and privacy classification that is current.", "STS-CLS-01", "Exactly one active state per Data Asset; a classification is assigned only under standards in force and is never inferred.",
     "Security Classification of a Data Asset: its confidentiality level, regulatory category and privacy category (personal, sensitive personal, none), documented as a security attribute in its metadata",
     {"instanceScope": "One instance per Data Asset.", "elementKind": "Managed attribute", "contributesTo": "Availability: access is released only to a classified asset (TR-AV-01); Custody: external custody requires the classification to set the contract terms (TR-CP-04). The classification decides whether the Privacy Basis FTS applies.", "conditionsThatMatter": "Unclassified; under assessment; classified; reclassification due."}),
    ("REG-DS-PRT", "Protection of a Data Asset", "PRT", "Whether the security risk of a Data Asset is assessed and the controls its classification requires (access control, authentication, masking or encryption, audit) are implemented and effective.", "STS-PRT-01", "Exactly one active state per Data Asset; Protected means every control required by the classification is implemented and its last audit passed.",
     "Protection of a Data Asset: its assessed security risk and the access, authentication, masking or encryption and audit controls implemented against its classification",
     {"instanceScope": "One instance per Data Asset.", "elementKind": "Managed condition", "contributesTo": "Availability: access is released only to a protected asset (TR-AV-01) and restored only after a deficiency is remediated (TR-AV-04); Custody: external custody needs protection in transit and at the custodian (TR-CP-04); Existence: destruction needs sanitisation controls (TR-EX-05, TR-EX-06); Assurance: a control deficiency is a control failure (TR-AS-05).", "conditionsThatMatter": "Unprotected; risk assessed; protected; control deficiency; sanitised."}),
    ("REG-DS-PRV", "Privacy Basis of a Data Asset", "PRV", "Whether personal data in a Data Asset has a lawful basis, purpose and (where required) consent in force, whether a data subject request is open, and whether the basis has lapsed or been withdrawn.", "STS-PRV-01", "Exactly one active state per Data Asset holding personal data; processing is permitted only in Basis in Force.",
     "Privacy Basis of a Data Asset holding personal data: lawful basis, purpose limitation, consent where required, retention period, data subject rights handling",
     {"instanceScope": "One instance per Data Asset whose classification includes personal data.", "elementKind": "Managed condition (Data Privacy)", "contributesTo": "Availability: access to personal data is released only with a basis in force (TR-AV-01); consent withdrawal or basis lapse emits the withdraw trigger (TR-AV-05, TR-AV-06); Existence: retention expiry or a right-to-erasure request emits the destruction trigger (TR-EX-05, TR-EX-06); Custody: external custody of personal data needs a transfer basis (TR-CP-04).", "conditionsThatMatter": "No personal data; basis being established; basis in force; subject request open; basis lapsed or withdrawn."}),
    ("REG-DS-INC", "Security Incident", "INC", "Whether a security incident or breach affecting a Data Asset is open, contained, notified to the regulator and data subjects where required, or closed.", "STS-INC-01", "Exactly one active state per incident; an open incident suspends access and assurance on the affected Data Asset until contained.",
     "Security Incident: a detected unauthorised access, disclosure, alteration, loss or breach affecting a Data Asset, one instance per incident",
     {"instanceScope": "One instance per incident; several incidents can be open on one Data Asset. Every incident is also logged as a Data Governance issue.", "elementKind": "Managed case", "contributesTo": "Availability: a detected incident emits the suspend trigger (TR-AV-03); Assurance: it is a control failure (TR-AS-05, TR-AS-06); an emergency response may need emergency access (TR-AV-08); access is restored only after containment (TR-AV-04).", "conditionsThatMatter": "No open incident; detected; contained; notified; closed."}),
]
STATES = [
    ("STS-POL-01", "REG-DS-POL", "No Security Instruments", True, False, "No identified security requirements, policy or standards exist for the governed scope.", "The absence of a policy remains visible to governance bodies.", ["inputs:Regulatory requirements"]),
    ("STS-POL-02", "REG-DS-POL", "Identified Requirements", False, False, "Security requirements are identified from stakeholder concerns, government regulation, legitimate business concerns, necessary business access needs and contractual obligations.", "Each requirement remains traceable to its source.", ["process:1", "requirementSources"]),
    ("STS-POL-03", "REG-DS-POL", "Approved Instruments", False, False, "The data security policy, privacy and confidentiality standards and security architecture are approved but not yet in force.", "Approved versions and approving authority remain traceable.", ["process:2", "process:3", "deliverable:Data security policies", "deliverable:Data privacy and confidentiality standards", "deliverable:Data security architecture"]),
    ("STS-POL-04", "REG-DS-POL", "Instruments in Force", False, False, "The policy and standards are published, applied to classification and protection, and audited.", "Compliance to the policy is measured; audit reports are produced.", ["process:5", "deliverable:Data Security audit reports", "metric:Security Implementation Metrics", "metric:Security Awareness Metrics"]),
    ("STS-POL-05", "REG-DS-POL", "Instrument Review", False, False, "The policy or standards are under review after a regulatory, incident or business trigger while the current versions stay in force.", "The instruments in force remain valid until the revision is approved.", ["inputs:Regulatory requirements"]),
    ("STS-CLS-01", "REG-DS-CLS", "Unclassified Asset", True, False, "The Data Asset carries no documented security classification.", "The absence of a classification remains visible on the asset record.", ["deliverable:Documented security classifications"]),
    ("STS-CLS-02", "REG-DS-CLS", "Classification Assessment", False, False, "The asset's confidentiality, regulatory and privacy categories are being assessed against the standards in force.", "The assessor, criteria and candidate classification remain identifiable.", ["techniques:CRUDE Matrix Usage", "techniques:Data Security Attributes in Metadata"]),
    ("STS-CLS-03", "REG-DS-CLS", "Classified Asset", False, False, "A documented classification (confidentiality level, regulatory category, privacy category) is recorded as a security attribute of the asset.", "The classification, its date and the standard it applied remain current.", ["deliverable:Documented security classifications", "techniques:Data Security Attributes in Metadata"]),
    ("STS-CLS-04", "REG-DS-CLS", "Reclassification Due", False, False, "A change in content, use, regulation or standards means the classification must be reassessed; the current classification stays in force meanwhile.", "The trigger and the reassessment due date remain explicit.", ["inputs:Regulatory requirements"]),
    ("STS-PRT-01", "REG-DS-PRT", "Unprotected Asset", True, False, "No security risk assessment or controls exist for the Data Asset.", "The absence of controls remains visible on the asset record.", ["process:4"]),
    ("STS-PRT-02", "REG-DS-PRT", "Assessed Risk", False, False, "The asset's security risks are assessed against its classification and the required controls are specified.", "Risk assessment, required controls and residual risk remain recorded.", ["process:4", "deliverable:Data security access controls"]),
    ("STS-PRT-03", "REG-DS-PRT", "Protected Asset", False, False, "Access control, authentication, masking or encryption and audit controls required by the classification are implemented and the last audit passed.", "Every required control is implemented; access history is recorded; audit is current.", ["process:5", "deliverable:Data security access controls", "deliverable:Regulatory compliant data access views", "deliverable:Authentication and user access history", "metric:Data Protection Metrics"]),
    ("STS-PRT-04", "REG-DS-PRT", "Control Deficiency", False, False, "An audit, incident or change shows a required control missing or ineffective; the asset is not to be released or restored until remediated.", "The deficient control, its severity and the remediation due date remain explicit.", ["deliverable:Data Security audit reports"]),
    ("STS-PRT-05", "REG-DS-PRT", "Sanitised Asset", False, False, "The asset's content has been sanitised or securely destroyed and the destruction evidenced; keys and access revoked.", "Sanitisation evidence and key revocation remain retrievable.", ["techniques:Document Sanitization"]),
    ("STS-PRV-01", "REG-DS-PRV", "No Personal Data", True, False, "The Data Asset holds no personal data under its classification, so no privacy basis applies.", "The classification supporting this condition remains current.", ["deliverable:Documented security classifications"]),
    ("STS-PRV-02", "REG-DS-PRV", "Basis Establishment", False, False, "The lawful basis, purpose, retention period and, where required, consent for the personal data are being established.", "The candidate basis and the regulation it relies on remain identifiable.", ["deliverable:Data privacy and confidentiality standards"]),
    ("STS-PRV-03", "REG-DS-PRV", "Basis in Force", False, False, "A lawful basis, purpose and retention period are recorded, consent obtained where required, and data subject rights can be exercised.", "Processing stays within the recorded purpose; consent and retention remain current.", ["deliverable:Regulatory compliant data access views"]),
    ("STS-PRV-04", "REG-DS-PRV", "Open Subject Request", False, False, "A data subject access, correction, objection or erasure request is open against the asset and must be answered within the statutory period.", "The request, its type, receipt date and statutory deadline remain explicit.", ["requirementSources:Government regulation"]),
    ("STS-PRV-05", "REG-DS-PRV", "Lapsed Basis", False, False, "Consent is withdrawn, the purpose is fulfilled or the retention period has expired; processing must stop and the data be withdrawn from access and destroyed or anonymised.", "The lapse reason and the withdrawal and destruction obligations remain explicit.", ["requirementSources:Government regulation"]),
    ("STS-INC-01", "REG-DS-INC", "No Open Incident", True, False, "No security incident is open against the Data Asset.", "Incident history remains retrievable.", ["metric:Security Incident Metrics"]),
    ("STS-INC-02", "REG-DS-INC", "Detected Incident", False, False, "An unauthorised access, disclosure, alteration, loss or breach is detected and logged; access to the asset is suspended.", "Detection time, scope and the suspended access remain recorded.", ["tools:Intrusion Detection / Prevention Software"]),
    ("STS-INC-03", "REG-DS-INC", "Contained Incident", False, False, "The cause is contained (patches applied, credentials revoked, access blocked) and the impact assessed.", "Containment actions and the impact assessment remain recorded.", ["techniques:Immediate Security Patch Deployment"]),
    ("STS-INC-04", "REG-DS-INC", "Notified Incident", False, False, "Where the impact requires it, the regulator and affected data subjects are notified within the statutory period.", "Notification recipients, dates and content remain retrievable.", ["requirementSources:Government regulation"]),
    ("STS-INC-05", "REG-DS-INC", "Closed Incident", False, False, "Root cause is addressed, controls are remediated, the incident is reviewed and closed; the DG issue is resolved.", "Closure review and evidence remain retrievable.", ["deliverable:Data Security audit reports"]),
]
EVENTS = {
    "EV-POL-01": ("Requirements identification", "Request"), "EV-POL-02": ("Policy and standards approval", "Decision outcome"), "EV-POL-03": ("Policy publication", "Decision outcome"), "EV-POL-04": ("Regulatory, incident or business trigger", "Monitoring trigger"), "EV-POL-05": ("Revised instrument approval", "Decision outcome"), "EV-POL-06": ("Instrument retirement", "Decision outcome"),
    "EV-CLS-01": ("Classification request", "Request"), "EV-CLS-02": ("Classification decision", "Decision outcome"), "EV-CLS-03": ("Content, use or standard change", "Monitoring trigger"), "EV-CLS-04": ("Reclassification decision", "Decision outcome"), "EV-CLS-05": ("Declassification decision", "Decision outcome"),
    "EV-PRT-01": ("Risk assessment initiation", "Request"), "EV-PRT-02": ("Controls implemented and audited", "Evidence trigger"), "EV-PRT-03": ("Control failure detected", "Monitoring trigger"), "EV-PRT-04": ("Remediation verified", "Evidence trigger"), "EV-PRT-05": ("Sanitisation completed", "Evidence trigger"), "EV-PRT-06": ("Classification change", "Monitoring trigger"),
    "EV-PRV-01": ("Personal data identified", "Monitoring trigger"), "EV-PRV-02": ("Lawful basis recorded", "Decision outcome"), "EV-PRV-03": ("Data subject request received", "Request"), "EV-PRV-04": ("Request answered", "Evidence trigger"), "EV-PRV-08": ("Erasure or objection upheld", "Decision outcome"), "EV-PRV-05": ("Consent withdrawal, purpose fulfilled or retention expiry", "Monitoring trigger"), "EV-PRV-06": ("Basis re-established", "Decision outcome"), "EV-PRV-07": ("Personal data removed or anonymised", "Evidence trigger"),
    "EV-INC-01": ("Incident detection", "Monitoring trigger"), "EV-INC-02": ("Containment confirmed", "Evidence trigger"), "EV-INC-03": ("Notification decision", "Decision outcome"), "EV-INC-04": ("Incident closure", "Decision outcome"), "EV-INC-05": ("Incident reopened", "Monitoring trigger"),
}
DR = {
    "DR-DS-01": ("Approve Data Security Policy and Standards", "ROLE-DS-S01", "REVIEW: drafted holder"),
    "DR-DS-02": ("Publish, Review and Retire Security Instruments", "ROLE-DS-P02", "REVIEW: drafted holder"),
    "DR-DS-03": ("Assign and Change a Security Classification", "ROLE-DS-P01", "REVIEW: drafted holder"),
    "DR-DS-04": ("Accept Residual Security Risk and Confirm Protection", "ROLE-DS-P02", "REVIEW: drafted holder"),
    "DR-DS-05": ("Declare and Close a Control Deficiency", "ROLE-DS-P03", "REVIEW: drafted holder"),
    "DR-DS-06": ("Establish, Lapse and Re-establish a Privacy Basis", "ROLE-DS-P01", "REVIEW: drafted holder"),
    "DR-DS-07": ("Answer a Data Subject Request", "ROLE-DS-P01", "REVIEW: drafted holder"),
    "DR-DS-08": ("Declare, Contain, Notify and Close a Security Incident", "ROLE-DS-P02", "REVIEW: drafted holder"),
    "DR-DS-09": ("Confirm Sanitisation", "ROLE-DS-P02", "REVIEW: drafted holder"),
}
ROLES = [
    ("ROLE-DS-S01", "IT Steering Committee", "Supplier", "Sponsor and approve the security policy."), ("ROLE-DS-S02", "Enterprise Architects", "Supplier", "Supply architecture standards and the security architecture."), ("ROLE-DS-S03", "Government", "Supplier", "Supply regulation and acts."), ("ROLE-DS-S04", "Regulatory Bodies", "Supplier", "Supply regulatory requirements and receive notifications."),
    ("ROLE-DS-P01", "Data Stewards", "Participant", "Classify assets; establish privacy basis; answer subject requests."), ("ROLE-DS-P02", "Information Security Team", "Participant", "Implement controls; run incident response; confirm protection and sanitisation."), ("ROLE-DS-P03", "Internal Auditors", "Participant", "Audit controls; declare deficiencies."), ("ROLE-DS-P04", "Process Analysts", "Participant", "Identify access needs in processes (CRUDE)."),
    ("ROLE-DS-C01", "Business Users", "Consumer", "Use data under appropriate access."), ("ROLE-DS-C02", "Regulatory Auditors", "Consumer", "Consume audit reports and access history."),
]
TRANS = [
    ("TR-POL-01", "Identify Requirements", "STS-POL-01", "STS-POL-02", "EV-POL-01", "Business goals, rules, regulatory requirements, architecture standards and the enterprise data model are available as inputs.", "DR-DS-01", ["SVC-DS-01"], ["ACT-DS-1"]),
    ("TR-POL-02", "Approve Policy and Standards", "STS-POL-02", "STS-POL-03", "EV-POL-02", "Policy, privacy and confidentiality standards and security architecture are approved against the identified requirements.", "DR-DS-01", ["SVC-DS-01"], ["ACT-DS-2", "ACT-DS-3"]),
    ("TR-POL-03", "Publish Instruments", "STS-POL-03", "STS-POL-04", "EV-POL-03", "Instruments are published as governing instruments with Data Governance and audit is scheduled.", "DR-DS-02", ["SVC-DS-01", "SVC-DS-07"], ["ACT-DS-5"]),
    ("TR-POL-04", "Review Instruments", "STS-POL-04", "STS-POL-05", "EV-POL-04", "A regulatory, incident or business trigger is recorded; current versions stay in force.", "DR-DS-02", ["SVC-DS-01"], ["ACT-DS-1"]),
    ("TR-POL-05", "Approve Revised Instruments", "STS-POL-05", "STS-POL-03", "EV-POL-05", "Revised instruments are approved.", "DR-DS-01", ["SVC-DS-01"], ["ACT-DS-2", "ACT-DS-3"]),
    ("TR-POL-06", "Retire Instruments", "STS-POL-05", "STS-POL-01", "EV-POL-06", "All security instruments for the scope are retired without replacement and the retirement is recorded.", "DR-DS-02", ["SVC-DS-01"], ["ACT-DS-2"]),
    ("TR-CLS-01", "Assess Classification", "STS-CLS-01", "STS-CLS-02", "EV-CLS-01", "The asset is in scope and standards in force define the classification scheme.", "DR-DS-03", ["SVC-DS-02"], ["ACT-DS-4"]),
    ("TR-CLS-02", "Classify Asset", "STS-CLS-02", "STS-CLS-03", "EV-CLS-02", "Confidentiality, regulatory and privacy categories are decided and recorded as a security attribute in the metadata.", "DR-DS-03", ["SVC-DS-02"], ["ACT-DS-4"]),
    ("TR-CLS-03", "Trigger Reclassification", "STS-CLS-03", "STS-CLS-04", "EV-CLS-03", "Content, use, regulation or standards have changed.", "DR-DS-03", ["SVC-DS-02"], ["ACT-DS-4"]),
    ("TR-CLS-04", "Reclassify Asset", "STS-CLS-04", "STS-CLS-03", "EV-CLS-04", "The reassessed classification is decided and recorded; protection is re-evaluated.", "DR-DS-03", ["SVC-DS-02"], ["ACT-DS-4"]),
    ("TR-CLS-05", "Declassify Asset", "STS-CLS-04", "STS-CLS-01", "EV-CLS-05", "The asset leaves the scope (for example after destruction) and its classification is retired.", "DR-DS-03", ["SVC-DS-02"], ["ACT-DS-4"]),
    ("TR-PRT-01", "Assess Security Risk", "STS-PRT-01", "STS-PRT-02", "EV-PRT-01", "The asset is classified and the standards in force specify the controls per class.", "DR-DS-04", ["SVC-DS-03"], ["ACT-DS-4"]),
    ("TR-PRT-02", "Confirm Protection", "STS-PRT-02", "STS-PRT-03", "EV-PRT-02", "Every required control is implemented, tested and audited; residual risk accepted.", "DR-DS-04", ["SVC-DS-04", "SVC-DS-05"], ["ACT-DS-5"]),
    ("TR-PRT-03", "Declare Deficiency", "STS-PRT-03", "STS-PRT-04", "EV-PRT-03", "An audit, incident or change shows a required control missing or ineffective.", "DR-DS-05", ["SVC-DS-05"], ["ACT-DS-5"]),
    ("TR-PRT-04", "Remediate Deficiency", "STS-PRT-04", "STS-PRT-03", "EV-PRT-04", "The deficient control is remediated and verified.", "DR-DS-05", ["SVC-DS-04", "SVC-DS-05"], ["ACT-DS-5"]),
    ("TR-PRT-05", "Reassess after Classification Change", "STS-PRT-03", "STS-PRT-02", "EV-PRT-06", "The classification changed, so the required controls must be re-specified.", "DR-DS-04", ["SVC-DS-03"], ["ACT-DS-4"]),
    ("TR-PRT-06", "Sanitise Asset", "STS-PRT-03", "STS-PRT-05", "EV-PRT-05", "Destruction is authorised; content is sanitised or securely destroyed and keys revoked.", "DR-DS-09", ["SVC-DS-06"], ["ACT-DS-5"]),
    ("TR-PRT-07", "Sanitise Deficient Asset", "STS-PRT-04", "STS-PRT-05", "EV-PRT-05", "Destruction is authorised while a deficiency is open; sanitisation is evidenced.", "DR-DS-09", ["SVC-DS-06"], ["ACT-DS-5"]),
    ("TR-PRT-08", "Release Sanitised Record", "STS-PRT-05", "STS-PRT-01", "EV-PRT-05", "Sanitisation evidence is retained and the protection record closed.", "DR-DS-09", ["SVC-DS-06"], ["ACT-DS-5"]),
    ("TR-PRV-01", "Identify Personal Data", "STS-PRV-01", "STS-PRV-02", "EV-PRV-01", "The classification records a privacy category other than none.", "DR-DS-06", ["SVC-DS-08"], ["ACT-DS-4"]),
    ("TR-PRV-02", "Record Lawful Basis", "STS-PRV-02", "STS-PRV-03", "EV-PRV-02", "Lawful basis, purpose and retention are recorded and consent obtained where required.", "DR-DS-06", ["SVC-DS-08"], ["ACT-DS-2"]),
    ("TR-PRV-03", "Receive Subject Request", "STS-PRV-03", "STS-PRV-04", "EV-PRV-03", "A data subject request is received and logged with its statutory deadline.", "DR-DS-07", ["SVC-DS-08"], ["ACT-DS-5"]),
    ("TR-PRV-04", "Answer Subject Request", "STS-PRV-04", "STS-PRV-03", "EV-PRV-04", "The request is answered within the statutory period and the basis remains in force.", "DR-DS-07", ["SVC-DS-08"], ["ACT-DS-5"]),
    ("TR-PRV-05", "Lapse Basis", "STS-PRV-03", "STS-PRV-05", "EV-PRV-05", "Consent is withdrawn, the purpose is fulfilled or the retention period has expired.", "DR-DS-06", ["SVC-DS-08"], ["ACT-DS-5"]),
    ("TR-PRV-06", "Lapse Basis on Erasure Request", "STS-PRV-04", "STS-PRV-05", "EV-PRV-08", "An erasure or objection request is upheld.", "DR-DS-07", ["SVC-DS-08"], ["ACT-DS-5"]),
    ("TR-PRV-07", "Re-establish Basis", "STS-PRV-05", "STS-PRV-02", "EV-PRV-06", "A new lawful basis or renewed consent is sought before any further processing.", "DR-DS-06", ["SVC-DS-08"], ["ACT-DS-2"]),
    ("TR-PRV-08", "Remove Personal Data", "STS-PRV-05", "STS-PRV-01", "EV-PRV-07", "Personal data is destroyed or anonymised and the removal evidenced.", "DR-DS-06", ["SVC-DS-06", "SVC-DS-08"], ["ACT-DS-5"]),
    ("TR-INC-01", "Detect Incident", "STS-INC-01", "STS-INC-02", "EV-INC-01", "An incident is detected and logged; access to the asset is suspended and a DG issue logged.", "DR-DS-08", ["SVC-DS-09"], ["ACT-DS-5"]),
    ("TR-INC-02", "Contain Incident", "STS-INC-02", "STS-INC-03", "EV-INC-02", "Cause contained and impact assessed.", "DR-DS-08", ["SVC-DS-09"], ["ACT-DS-5"]),
    ("TR-INC-03", "Notify Regulator and Subjects", "STS-INC-03", "STS-INC-04", "EV-INC-03", "The impact assessment requires notification; notifications are sent within the statutory period.", "DR-DS-08", ["SVC-DS-09"], ["ACT-DS-5"]),
    ("TR-INC-04", "Close Notified Incident", "STS-INC-04", "STS-INC-05", "EV-INC-04", "Root cause addressed, controls remediated, review completed.", "DR-DS-08", ["SVC-DS-09"], ["ACT-DS-5"]),
    ("TR-INC-05", "Close Contained Incident", "STS-INC-03", "STS-INC-05", "EV-INC-04", "No notification required; root cause addressed and review completed.", "DR-DS-08", ["SVC-DS-09"], ["ACT-DS-5"]),
    ("TR-INC-06", "Archive Incident", "STS-INC-05", "STS-INC-01", "EV-INC-04", "Closure evidence retained; the DG issue is resolved.", "DR-DS-08", ["SVC-DS-09"], ["ACT-DS-5"]),
    ("TR-INC-07", "Reopen Incident", "STS-INC-05", "STS-INC-02", "EV-INC-05", "The incident recurs or new impact is found.", "DR-DS-08", ["SVC-DS-09"], ["ACT-DS-5"]),
]
SERVICES = [
    ("SVC-DS-01", "Governance", "Security Policy and Standards Definition", "Requirements identification; review trigger.", "Approved and published data security policy, privacy and confidentiality standards, security architecture."),
    ("SVC-DS-02", "Governance", "Security Classification", "Asset in scope; change trigger.", "Documented security classification as a metadata attribute."),
    ("SVC-DS-03", "Risk", "Security Risk Assessment", "Asset classified; classification change.", "Assessed risks; required controls; residual risk."),
    ("SVC-DS-04", "Control", "Access and Protection Controls", "Required controls specified; deficiency remediation.", "Implemented access control, authentication, masking or encryption; regulatory compliant access views."),
    ("SVC-DS-05", "Assurance", "Security Audit", "Controls implemented; audit schedule.", "Audit reports; authentication and user access history; deficiency findings."),
    ("SVC-DS-06", "Control", "Sanitisation and Secure Destruction", "Destruction authorised; personal data removal.", "Sanitisation evidence; key revocation."),
    ("SVC-DS-07", "Assurance", "Security Awareness and Compliance Reporting", "Instruments in force.", "Security implementation, awareness, protection and incident metrics; confidential data proliferation rate."),
    ("SVC-DS-08", "Governance", "Privacy Basis and Data Subject Rights", "Personal data identified; subject request; lapse trigger.", "Recorded lawful basis, purpose, retention, consent; answered subject requests."),
    ("SVC-DS-09", "Control", "Security Incident Response", "Incident detected.", "Containment; impact assessment; notifications; closure review."),
]
ACTS = [
    ("ACT-DS-1", "Identify Relevant Data Security Requirements", "1", "Transition-causing", ["REG-DS-POL"], ["TR-POL-01", "TR-POL-04"], ["SVC-DS-01"]),
    ("ACT-DS-2", "Define Data Security Policy", "2", "Transition-causing", ["REG-DS-POL", "REG-DS-PRV"], ["TR-POL-02", "TR-POL-05", "TR-POL-06", "TR-PRV-02", "TR-PRV-07"], ["SVC-DS-01", "SVC-DS-08"]),
    ("ACT-DS-3", "Define Data Security Standards", "3", "Transition-supporting", ["REG-DS-POL"], ["TR-POL-02", "TR-POL-05"], ["SVC-DS-01"]),
    ("ACT-DS-4", "Assess Current Security Risks", "4", "Transition-causing", ["REG-DS-CLS", "REG-DS-PRT", "REG-DS-PRV"], ["TR-CLS-01", "TR-CLS-02", "TR-CLS-03", "TR-CLS-04", "TR-CLS-05", "TR-PRT-01", "TR-PRT-05", "TR-PRV-01"], ["SVC-DS-02", "SVC-DS-03"]),
    ("ACT-DS-5", "Implement Controls and Procedures", "5", "Transition-causing", ["REG-DS-POL", "REG-DS-PRT", "REG-DS-PRV", "REG-DS-INC"], ["TR-POL-03", "TR-PRT-02", "TR-PRT-03", "TR-PRT-04", "TR-PRT-06", "TR-PRT-07", "TR-PRT-08", "TR-PRV-03", "TR-PRV-04", "TR-PRV-05", "TR-PRV-06", "TR-PRV-08", "TR-INC-01", "TR-INC-02", "TR-INC-03", "TR-INC-04", "TR-INC-05", "TR-INC-06", "TR-INC-07"], ["SVC-DS-04", "SVC-DS-05", "SVC-DS-06", "SVC-DS-08", "SVC-DS-09"]),
]
ARTEFACTS = [
    ("ART-DS-01", "Data security architecture", "STS-POL-03", "Define Data Security Standards", "Evidences Approved Instruments."), ("ART-DS-02", "Data security policies", "STS-POL-03", "Define Data Security Policy", "Governing instrument held with Data Governance."), ("ART-DS-03", "Data privacy and confidentiality standards", "STS-POL-03", "Define Data Security Standards", "Defines the classification scheme and privacy basis rules."), ("ART-DS-04", "Data security access controls", "STS-PRT-03", "Implement Controls and Procedures", "Evidences Protected Asset."), ("ART-DS-05", "Regulatory compliant data access views", "STS-PRT-03", "Implement Controls and Procedures", "Evidences protection of personal and regulated data."), ("ART-DS-06", "Documented security classifications", "STS-CLS-03", "Assess Current Security Risks", "Evidences Classified Asset; security attribute in metadata."), ("ART-DS-07", "Authentication and user access history", "STS-PRT-03", "Implement Controls and Procedures", "Audit evidence; Global Assurance evidence."), ("ART-DS-08", "Data Security audit reports", "STS-POL-04", "Implement Controls and Procedures", "Evidences Instruments in Force and deficiencies."),
]
CONTRIB = [
    ("CON-DS-01", "TR-AV-01", "guard", {"CLS": ["STS-CLS-03", "STS-CLS-04"], "PRT": ["STS-PRT-03"]}, "Access is released only to a classified asset protected to its classification.", "DS_classified and DS_protected", "Required", "Goal 1: enable appropriate, prevent inappropriate access."),
    ("CON-DS-02", "TR-AV-01", "guard", {"PRV": ["STS-PRV-01", "STS-PRV-03"]}, "Access to personal data is released only with a lawful basis in force (or the asset holds no personal data).", "DS_privacy_basis_ok", "Non-waivable", "Data Privacy: never waived by exception."),
    ("CON-DS-03", "TR-AV-04", "guard", {"PRT": ["STS-PRT-03"], "INC": ["STS-INC-01", "STS-INC-03", "STS-INC-04", "STS-INC-05"]}, "Suspended access is restored only when protection is confirmed and any incident is at least contained.", "DS_protected and DS_incident_contained", "Required", ""),
    ("CON-DS-04", "TR-AV-03", "event", {"INC": ["STS-INC-02"]}, "A detected incident requires immediate access suspension.", "DS_open_incident", "Conditional", "DS emits EV-AV-03 when TR-INC-01 fires."),
    ("CON-DS-05", "TR-AV-05", "event", {"PRV": ["STS-PRV-05"]}, "A lapsed privacy basis (consent withdrawn, purpose fulfilled, retention expired) is a withdrawal obligation.", "DS_privacy_basis_lapsed", "Conditional", "DS emits EV-AV-05 when TR-PRV-05 or TR-PRV-06 fires."),
    ("CON-DS-06", "TR-AV-06", "event", {"PRV": ["STS-PRV-05"]}, "A lapsed privacy basis withdraws suspended access as well.", "DS_privacy_basis_lapsed", "Conditional", ""),
    ("CON-DS-07", "TR-AV-08", "guard", {"INC": ["STS-INC-02", "STS-INC-03"]}, "Emergency access is granted only against a recorded incident or emergency response.", "DS_open_incident or DS_incident_contained_open", "Conditional", "Time-bounded; DR-08 holder from the DG operating model."),
    ("CON-DS-08", "TR-CP-04", "guard", {"CLS": ["STS-CLS-03"], "PRT": ["STS-PRT-03"], "PRV": ["STS-PRV-01", "STS-PRV-03"]}, "External custody requires the classification to set contract terms, protection in transit and at the custodian, and a transfer basis for personal data.", "DS_classified and DS_protected and DS_privacy_basis_ok", "Required", ""),
    ("CON-DS-09", "TR-EX-05", "guard", {"PRT": ["STS-PRT-05"]}, "Destruction is complete only with sanitisation evidenced.", "DS_sanitised", "Required", "Document Sanitization technique; keys revoked."),
    ("CON-DS-10", "TR-EX-06", "guard", {"PRT": ["STS-PRT-05"]}, "Destruction of a superseded asset is complete only with sanitisation evidenced.", "DS_sanitised", "Required", ""),
    ("CON-DS-11", "TR-EX-05", "event", {"PRV": ["STS-PRV-05"]}, "Retention expiry or an upheld erasure request is a destruction trigger for the personal data.", "DS_privacy_basis_lapsed", "Conditional", "DS emits EV-EX-05 when TR-PRV-05 or TR-PRV-06 fires."),
    ("CON-DS-12", "TR-AS-05", "event", {"PRT": ["STS-PRT-04"], "INC": ["STS-INC-02"]}, "A control deficiency or a detected incident is a control failure affecting the assurance claim.", "DS_control_deficiency or DS_open_incident", "Conditional", "DS emits EV-AS-05."),
    ("CON-DS-13", "TR-AS-06", "event", {"PRT": ["STS-PRT-04"], "INC": ["STS-INC-02"]}, "A control deficiency or a detected incident breaches a condition of conditional assurance.", "DS_control_deficiency or DS_open_incident", "Conditional", ""),
    ("CON-DS-14", "TR-AS-02", "service", {"PRT": ["STS-PRT-03"]}, "Security Audit supplies the control evidence (access history, audit reports) that assurance confirmation cites.", "SVC-DS-05", "Conditional", "Assurance service; artefacts ART-DS-07, ART-DS-08."),
]
KA_COUPLINGS = [
    ("KAC-DS-01", "KA-DG", "TR-ISS-01", "EV-ISS-01", "DS_open_incident", "Every detected security incident is also logged as a Data Asset issue in the Data Governance issue FTS with source Data Security (TR-INC-01 emits EV-ISS-01).", "Decision 21 Sep 2026: own FTS plus DG issue. DG owns escalation and residual-risk acceptance."),
    ("KAC-DS-02", "KA-DG", "TR-ISS-05", "EV-ISS-04", "DS_incident_closed", "Closure of the incident evidences resolution of the DG issue (TR-INC-04 or TR-INC-05 emits EV-ISS-04).", "Evidence, not a guard."),
    ("KAC-DS-03", "KA-DG", "TR-POL-03", "", "DG_instruments_in_force", "Data security policies and standards are governing instruments: TR-POL-03 here is a Data Governance instrument publication.", "Reverse coupling: a DS transition cites a DG fact."),
    ("KAC-DS-04", "KA-MM", "TR-AST-02", "", "DS_classified", "The documented security classification is recorded as a security attribute in the asset's metadata (technique: Data Security Attributes in Metadata); the Metadata of a Data Asset is Described only with the classification attribute present.", "Reverse coupling: an MM transition cites a DS fact."),
    ("KAC-DS-05", "KA-MM", "TR-AST-03", "", "DS_protected", "Published metadata about a Data Asset is itself protected under the asset's classification (metadata security, MM goal 4).", "Closes the KAC-MM-05 placeholder."),
    ("KAC-DS-06", "KA-DQ", "TR-PDCA-03", "", "DS_privacy_basis_ok", "Quality assessment that processes personal data (profiling) runs only under a privacy basis in force.", "Reverse coupling: a DQ transition cites a DS fact."),
]
FACT_BINDINGS = {
    "DS_instruments_in_force": {"region": "REG-DS-POL", "states": ["STS-POL-04", "STS-POL-05"]},
    "DS_classified": {"region": "REG-DS-CLS", "states": ["STS-CLS-03", "STS-CLS-04"]},
    "DS_protected": {"region": "REG-DS-PRT", "states": ["STS-PRT-03"]},
    "DS_control_deficiency": {"region": "REG-DS-PRT", "states": ["STS-PRT-04"]},
    "DS_sanitised": {"region": "REG-DS-PRT", "states": ["STS-PRT-05"]},
    "DS_privacy_basis_ok": {"region": "REG-DS-PRV", "states": ["STS-PRV-01", "STS-PRV-03"]},
    "DS_privacy_basis_lapsed": {"region": "REG-DS-PRV", "states": ["STS-PRV-05"]},
    "DS_open_incident": {"region": "REG-DS-INC", "states": ["STS-INC-02"]},
    "DS_incident_contained_open": {"region": "REG-DS-INC", "states": ["STS-INC-03"]},
    "DS_incident_contained": {"region": "REG-DS-INC", "states": ["STS-INC-01", "STS-INC-03", "STS-INC-04", "STS-INC-05"]},
    "DS_incident_closed": {"region": "REG-DS-INC", "states": ["STS-INC-05"]},
}
XRG = [
    ("XRG-DS-01", "An asset is classified only under standards in force.", ["TR-CLS-02", "TR-CLS-04"], "Required", "POL in ('STS-POL-04','STS-POL-05')"),
    ("XRG-DS-02", "Security risk is assessed only for a classified asset.", ["TR-PRT-01"], "Required", "CLS in ('STS-CLS-03','STS-CLS-04')"),
    ("XRG-DS-03", "A privacy basis is established only for an asset whose classification is current.", ["TR-PRV-01", "TR-PRV-02"], "Required", "CLS in ('STS-CLS-03','STS-CLS-04')"),
    ("XRG-DS-04", "An incident is closed only when protection is confirmed (no open deficiency).", ["TR-INC-04", "TR-INC-05"], "Required", "PRT in ('STS-PRT-03','STS-PRT-05','STS-PRT-01')"),
    ("XRG-DS-05", "Personal data is removed only with sanitisation evidenced or the asset unprotected (never held).", ["TR-PRV-08"], "Required", "PRT in ('STS-PRT-05','STS-PRT-01')"),
]
VECTORS = [
    ("CFG-DS-01", "Greenfield", {"REG-DS-POL": "STS-POL-01", "REG-DS-CLS": "STS-CLS-01", "REG-DS-PRT": "STS-PRT-01", "REG-DS-PRV": "STS-PRV-01", "REG-DS-INC": "STS-INC-01"}, "Initial configuration: no instruments, asset unclassified and unprotected; Global access release blocked by CON-DS-01."),
    ("CFG-DS-02", "Protected, no personal data", {"REG-DS-POL": "STS-POL-04", "REG-DS-CLS": "STS-CLS-03", "REG-DS-PRT": "STS-PRT-03", "REG-DS-PRV": "STS-PRV-01", "REG-DS-INC": "STS-INC-01"}, "Legal: release, external custody guards satisfied."),
    ("CFG-DS-03", "Protected personal data, basis in force", {"REG-DS-POL": "STS-POL-04", "REG-DS-CLS": "STS-CLS-03", "REG-DS-PRT": "STS-PRT-03", "REG-DS-PRV": "STS-PRV-03", "REG-DS-INC": "STS-INC-01"}, "Legal: all Data Security contributions satisfied for personal data."),
    ("CFG-DS-04", "Open incident", {"REG-DS-POL": "STS-POL-04", "REG-DS-CLS": "STS-CLS-03", "REG-DS-PRT": "STS-PRT-04", "REG-DS-PRV": "STS-PRV-03", "REG-DS-INC": "STS-INC-02"}, "Legal: EV-AV-03 and EV-AS-05 emitted; release and restoration blocked; DG issue logged."),
    ("CFG-DS-05", "Lapsed privacy basis", {"REG-DS-POL": "STS-POL-04", "REG-DS-CLS": "STS-CLS-03", "REG-DS-PRT": "STS-PRT-03", "REG-DS-PRV": "STS-PRV-05", "REG-DS-INC": "STS-INC-01"}, "Legal: EV-AV-05 and EV-EX-05 emitted; release blocked by CON-DS-02."),
    ("CFG-DS-06", "Sanitised", {"REG-DS-POL": "STS-POL-04", "REG-DS-CLS": "STS-CLS-04", "REG-DS-PRT": "STS-PRT-05", "REG-DS-PRV": "STS-PRV-01", "REG-DS-INC": "STS-INC-01"}, "Legal: destruction guards satisfied; classification due for retirement."),
]
EVIDENCE = [
    ("EVD-DS-01", "Policy approval and publication record", "Decision evidence", "TR-POL-03", "Approved versions, publication date, audit schedule."), ("EVD-DS-02", "Classification record", "Governance evidence", "TR-CLS-02", "Confidentiality level, regulatory and privacy category, standard applied, approver."), ("EVD-DS-03", "Risk assessment and control specification", "Risk evidence", "TR-PRT-01", "Assessed risks, required controls, residual risk."), ("EVD-DS-04", "Control implementation and audit record", "Control evidence", "TR-PRT-02", "Implemented controls, test results, audit report, access history."), ("EVD-DS-05", "Sanitisation certificate", "Control evidence", "TR-PRT-06", "Method, date, keys revoked, verifier."), ("EVD-DS-06", "Sanitisation certificate (deficient asset)", "Control evidence", "TR-PRT-07", "Method, date, keys revoked, verifier, open deficiency noted."), ("EVD-DS-07", "Lawful basis record", "Governance evidence", "TR-PRV-02", "Basis, purpose, retention, consent record."), ("EVD-DS-08", "Subject request log", "Governance evidence", "TR-PRV-04", "Request type, receipt, deadline, answer."), ("EVD-DS-09", "Incident record", "Control evidence", "TR-INC-01", "Detection, scope, suspension, DG issue reference."), ("EVD-DS-10", "Notification record", "Control evidence", "TR-INC-03", "Regulator and data subject notifications, dates, content."),
]
EXC = [("EXC-DS-01", "Provisional Protection", "TR-AV-01", "Release of access to an urgently needed asset before the full control set is audited.", "DR-DS-04", "Classification recorded, core access control and authentication in place, compensating monitoring, residual risk accepted, audit scheduled with a date; never waives CON-DS-02 (privacy basis).", "Draft / Approved / Expired / Closed")]
REGULATORY_FACTS = [
    # Decision 21 Sep 2026: Privacy Basis states stay regulation-neutral; the regulations' obligations are recorded here as facts
    # the guards and time triggers cite. Statutory periods are to be verified against the current text of each Act.
    ("REG-POPIA-01", "POPIA (South Africa)", "Lawful processing conditions", "Sections 8 to 25: accountability, processing limitation (consent, justification, objection), purpose specification, further processing limitation, information quality, openness, security safeguards, data subject participation.", "STS-PRV-03 Basis in Force; TR-PRV-02", "verify"),
    ("REG-POPIA-02", "POPIA (South Africa)", "Consent and objection", "Section 11: processing with consent, or on another justification; the data subject may withdraw consent or object at any time.", "EV-PRV-05; TR-PRV-05", "verify"),
    ("REG-POPIA-03", "POPIA (South Africa)", "Data subject participation", "Sections 23 to 25: access and correction requests (Information Regulator forms); response within a reasonable time, PAIA periods applied in practice.", "STS-PRV-04 Open Subject Request; TR-PRV-03, TR-PRV-04", "verify period"),
    ("REG-POPIA-04", "POPIA (South Africa)", "Retention", "Section 14: records not retained longer than necessary for the purpose, subject to lawful exceptions; destroy or de-identify afterwards.", "EV-PRV-05 retention expiry; TR-PRV-08", "verify"),
    ("REG-POPIA-05", "POPIA (South Africa)", "Security compromise notification", "Section 22: notify the Information Regulator and the data subjects as soon as reasonably possible after discovery of a compromise.", "STS-INC-04 Notified Incident; TR-INC-03", "verify"),
    ("REG-GDPR-01", "GDPR (EU)", "Lawful bases", "Article 6: consent, contract, legal obligation, vital interests, public task, legitimate interests; Article 9 conditions for special categories.", "STS-PRV-03 Basis in Force; TR-PRV-02", "verify"),
    ("REG-GDPR-02", "GDPR (EU)", "Consent withdrawal and objection", "Article 7(3) consent may be withdrawn at any time; Article 21 right to object.", "EV-PRV-05; TR-PRV-05", "verify"),
    ("REG-GDPR-03", "GDPR (EU)", "Data subject rights response period", "Article 12(3): respond without undue delay and within one month, extendable by two further months for complex requests; Articles 15 to 22 rights (access, rectification, erasure, restriction, portability, objection).", "STS-PRV-04 Open Subject Request; TR-PRV-03, TR-PRV-04, TR-PRV-06", "verify"),
    ("REG-GDPR-04", "GDPR (EU)", "Storage limitation and erasure", "Article 5(1)(e) storage limitation; Article 17 right to erasure.", "EV-PRV-05 retention expiry; TR-PRV-06, TR-PRV-08", "verify"),
    ("REG-GDPR-05", "GDPR (EU)", "Breach notification", "Article 33: notify the supervisory authority within 72 hours of becoming aware; Article 34: communicate to data subjects without undue delay where high risk.", "STS-INC-04 Notified Incident; TR-INC-03", "verify"),
]

SPEC = {
    "meta": {"modelId": "KA-DS", "name": "Data Security FTS (including Data Privacy)", "knowledgeArea": "Data Security", "version": "0.1", "subjectType": KA_SUBJECT,
             "regionModel": "One FTS per managed element: Policy and Standards (scope level), Classification, Protection and Privacy Basis (one per Data Asset) and Security Incident (one per incident) run concurrently and are coupled by cross-region constraints, facts and events, never a single subject.",
             "source": SRC_DECK + "; " + SRC_HOWARD + "; " + SRC_PROTOCOL,
             "note": "Five state regions, each its own FTS over one managed element of the Knowledge Area: Security Policy and Standards; Security Classification of a Data Asset; Protection of a Data Asset; Privacy Basis of a Data Asset (Data Privacy); Security Incident. The KA never becomes a region of the Data Asset; the asset-level regions reach the Global protocol through contributions (access release, restoration, emergency access, external custody, destruction, and the suspend, withdraw, destroy and material-change triggers), and every incident is also a Data Governance issue.",
             "definition": CONTEXT["definition"], "factBindings": FACT_BINDINGS},
    "context": CONTEXT, "regulatoryFacts": REGULATORY_FACTS, "regions": REGIONS, "states": STATES, "transitions": TRANS, "events": EVENTS, "decisionRights": DR, "roles": ROLES, "artefacts": ARTEFACTS, "activities": ACTS, "services": SERVICES, "contributions": CONTRIB, "kaCouplings": KA_COUPLINGS, "crossRegionConstraints": XRG, "stateVectors": VECTORS, "evidence": EVIDENCE, "exceptions": EXC,
    "sources": [
        {"id": "SRC-DS-001", "source": SRC_DECK, "type": "Primary (image pages, captured)", "location": "Chat upload; OneDrive Data Lifecycle folder", "use": "Definition, goals, drivers, requirement sources, inputs, processes, deliverables, role players, techniques, tools, metrics", "limitations": "The context diagram lists no sub-activities; the privacy lifecycle (lawful basis, consent, subject rights, retention) is drafted from the goals and requirement sources, not from a DMBOK activity list."},
        {"id": "SRC-DS-002", "source": SRC_HOWARD, "type": "Design direction", "location": "Chat", "use": "Managed elements, incident handling, Global gating", "limitations": ""},
        {"id": "SRC-DS-003", "source": SRC_PROTOCOL, "type": "Alignment target", "location": "Private repo models/", "use": "Global transition IDs for contributions; DG, DQ and MM transition IDs for couplings", "limitations": ""},
    ],
    "qaNotes": [
        {"severity": "note", "rule": "GA-005", "element": "KA-DS", "finding": "Policy and Standards changes rarely and gates classification through XRG-DS-01; Classification, Protection and Privacy Basis are per Data Asset and gate Global transitions; Security Incident is per incident and only emits triggers and guards restoration."},
        {"severity": "note", "rule": "capture", "element": "REG-DS-PRV", "finding": "Data Privacy states are regulation-neutral (decision 21 Sep 2026); POPIA and GDPR obligations and periods are recorded on the Regulatory Facts sheet and are to be verified against the current Acts."},
        {"severity": "note", "rule": "derived", "element": "STATES", "finding": "All state names, events, decision rights, holders and services are first-pass drafts from the context diagram; every one is for Howard's review."},
    ],
}

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(out, exist_ok=True)
    m = build(SPEC)
    p = os.path.join(out, "data_security.fts.json")
    json.dump(m, open(p, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("wrote", p); print(json.dumps(m["meta"]["counts"])); print("QA", m["meta"]["qaCounts"])
    for f in m["qaFindings"]: print(" ", f["severity"], f["rule"], f["element"], "|", f["finding"])
