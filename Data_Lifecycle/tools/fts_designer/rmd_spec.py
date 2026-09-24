#!/usr/bin/env python3
"""
rmd_spec.py  -  Reference and Master Data FTS v0.1: four state regions, each its own FTS over one managed element
of the Knowledge Area, derived from the DMBOK Reference and Master Data context diagram (deck pages 70 to 73) and
aligned to the Global Data Asset Protocol.

Howard's managed elements (21 Sep 2026): 1 the Master and Reference Data Programme of the scope; 2 a Master Data
Domain (one per domain, for example Customer); 3 a Reference Data Set (one per code set); 4 a Golden Record (one
per master entity, for example one customer), which is the Customer Master asset the scenarios run.
Decisions 21 Sep 2026: RMD gates Global registration (validated definitions, assessed source), materialisation
(data model and integration pattern), access release (sharing service published, conditions of use agreed) and
supersession (new reference version or merged golden record); a match conflict or split emits the Assurance
material-change trigger; every transition carries a Decision Right (holders confirmed 22 Sep 2026 from the shared role vocabulary, role_vocabulary.json).

Usage: python rmd_spec.py [out_dir] [--overrides spec/reference_master_data_overrides.json]   -> reference_master_data.fts.json
"""
import json, os, sys
from ka_build import build

SRC_DECK = "DMBOK Data Lifecycle and KA Context Diagrams.pdf, Reference and Master Data pages 70 to 73 (What, Why, Activities, Role Players and Technical Drivers)"
SRC_HOWARD = "Howard Diesel, 21 Sep 2026: four RMD managed elements (Programme; Master Data Domain; Reference Data Set; Golden Record), Global gating of register, materialise, release and supersede, Customer Master scenarios extended"
SRC_PROTOCOL = "global_protocol.fts.json v0.2.1 for the contribution targets; data_governance, data_quality, metadata_management and data_security v0.1+ for the couplings"

CONTEXT = {
    "knowledgeArea": "Reference and Master Data",
    "definition": "Managing shared data to meet organizational goals, reduce risks associated with data redundancy, ensure higher quality, and reduce the costs of data integration.",
    "ensures": "An organisation and its customers benefit if the data required across business areas, processes and systems is shared, allowing the same customer lists, geographic codes, parts codes etc. to be accessed, to produce a level of consistency. Systems and data evolve organically resulting in multiple systems executing similar functions isolated from each other, leading to inconsistencies in data structure and values, and increased costs and risks. Both can be reduced through the management of reference and master data.",
    "goals": ["Enable sharing of information assets across business domains and applications within an organization.", "Provide authoritative source of reconciled and quality-assessed master and reference data.", "Lower cost and complexity through use of standards, common data models, and integration patterns."],
    "businessDrivers": ["Master Data management program: meeting organisational data requirements; managing data quality; managing the costs of data integration; reducing risk", "Centrally managed Reference Data enables the organisation to: meet data requirements for multiple initiatives, reduce costs and risks of data integration; manage quality of reference data"],
    "inputs": ["Business Drivers", "Cross Functional Requirements", "Industry Standards", "Data Glossary", "Purchased Data and/or Open Data and Code Sets", "Business Rules"],
    "processes": [
        {"id": "1", "name": "Identify Drivers and Requirements", "phase": "P", "subActivities": ["1.1 Validate Data Definitions (C)"]},
        {"id": "2", "name": "Evaluate and Assess Data Sources", "phase": "P", "subActivities": []},
        {"id": "3", "name": "Define Architectural Approach", "phase": "D", "subActivities": []},
        {"id": "4", "name": "Model Data", "phase": "D", "subActivities": []},
        {"id": "5", "name": "Define Stewardship and Maintenance Processes", "phase": "C", "subActivities": []},
        {"id": "6", "name": "Establish Governance Policies", "phase": "C", "subActivities": []},
        {"id": "7", "name": "Implement Data Sharing/Integration Services", "phase": "D,O", "subActivities": ["7.1 Acquire Data Sources for Sharing", "7.2 Publish Reference and Master Data"]},
    ],
    "deliverables": ["Master and Reference Data Requirements", "Data Models and Integration Patterns", "Reliable Reference and Master Data", "Reusable Data Services"],
    "suppliers": ["Subject Matter Experts", "Data Stewards", "Application Developers", "Data Providers", "Business Analysts", "Infrastructure Systems Analysts"],
    "participants": ["Data Analysts", "Data Modelers", "Data Stewards", "Data Integrators", "Data Architects", "Data Quality Analysts"],
    "consumers": ["Master Data Analysts", "Data Integrators", "Data Architects", "Application Users", "Application Developers", "Solution Architects"],
    "techniques": ["Conditions-of-use agreements", "Business key cross references", "Processing Log analysis"],
    "tools": ["Data Modeling Tools", "Metadata Repositories", "Data Profiling and Quality Tools", "Data Integration Tools", "MDM Application Platforms", "Data Sharing/Integration Architecture"],
    "metrics": ["Data Quality and Compliance", "Data Change Activity", "Data Consumption and Services", "Data Sharing Availability", "Data Steward Coverage", "Data Sharing Volume and Utilization"],
    "phaseTags": "(P) Planning, (C) Control, (D) Development, (O) Operations",
}

KA_SUBJECT = "Reference and Master Data Knowledge Area: four managed elements, one FTS (state region) each; the shared Data Asset is the Global subject reached through contributions"
REGIONS = [
    ("REG-RMD-PRG", "Master and Reference Data Programme", "PRG", "Whether the drivers and requirements, architectural approach, stewardship and maintenance processes and governance policies for shared data exist, are approved and are operating for the governed scope.", "STS-PRG-01", "Exactly one active state; a revised programme supersedes, never coexists with, the approved one.",
     "Master and Reference Data Programme of the governed scope: drivers and requirements, architectural approach, stewardship and maintenance processes, governance policies, data sharing and integration architecture",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Governing element", "contributesTo": "Governance: the programme's policies and stewardship processes are governing instruments held with Data Governance; the architectural approach and integration patterns are the standards every domain and set is built to. No Global transition is gated on the programme directly; it gates the domains, sets and golden records through cross-region constraints.", "conditionsThatMatter": "None; requirements identified; approach and policies approved; operating; under revision."}),
    ("REG-RMD-DOM", "Master Data Domain", "DOM", "Whether a master data domain (for example Customer, Product, Party) has validated definitions, assessed sources, an approved data model and integration pattern, defined stewardship, and an implemented, published sharing service.", "STS-DOM-01", "Exactly one active state per domain; a domain is Shared only while its sharing service is published and its stewardship is staffed.",
     "Master Data Domain: one shared subject area of master data (for example Customer) with its validated definitions, assessed sources, data model and integration pattern, stewardship, and data sharing service",
     {"instanceScope": "One instance per master data domain.", "elementKind": "Managed platform element", "contributesTo": "Existence: golden records of the domain are registered only under validated definitions and an assessed source (TR-EX-01) and materialised only under an approved model and integration pattern (TR-EX-02); Availability: access is released only through a published sharing service under conditions of use (TR-AV-01).", "conditionsThatMatter": "Unscoped; requirements validated; sources assessed; modelled; stewardship defined; shared; under change."}),
    ("REG-RMD-REF", "Reference Data Set", "REF", "Whether a reference data set (code set) is sourced, has validated definitions, is published as a version, is superseded by a new version, or is retired.", "STS-REF-01", "Exactly one active state per reference data set; exactly one published version is current at a time.",
     "Reference Data Set: one code set or classification (for example country codes, product categories) with its source, validated definitions and mappings, published version and version history",
     {"instanceScope": "One instance per reference data set; versions are successive states of the same instance.", "elementKind": "Managed shared asset", "contributesTo": "Existence: a set is registered only with validated definitions and a source (TR-EX-01); a new version supersedes the current one (TR-EX-03) and the old version may be reinstated (TR-EX-04); Availability: a set is released only when published under conditions of use (TR-AV-01); retirement is a disposition trigger (TR-EX-05).", "conditionsThatMatter": "Unsourced; definitions validated; published version; new version pending; retired."}),
    ("REG-RMD-GLD", "Golden Record", "GLD", "Whether one master entity instance (for example one customer) is a candidate, matched and merged into a reliable golden record, in conflict, split, or retired.", "STS-GLD-01", "Exactly one active state per golden record; Reliable means the record is reconciled across sources, quality-assessed and published through the domain's sharing service.",
     "Golden Record: the reconciled, quality-assessed master record of one entity instance (for example one customer) with its business key cross references to the contributing sources",
     {"instanceScope": "One instance per master entity instance (the Customer Master record of one customer).", "elementKind": "Managed shared asset (the Customer Master asset of the scenarios)", "contributesTo": "Existence: a golden record is registered as a candidate with cross references (TR-EX-01), materialised when matched and merged (TR-EX-02), superseded by a merge into another record (TR-EX-03) and reinstated on a split (TR-EX-04); Availability: released only when Reliable (TR-AV-01); a match conflict emits the Assurance material-change trigger (TR-AS-05) and blocks release; retirement is a disposition trigger (TR-EX-05).", "conditionsThatMatter": "Candidate; matched and merged; reliable; in conflict; split; retired."}),
]
STATES = [
    ("STS-PRG-01", "REG-RMD-PRG", "No Shared Data Programme", True, False, "No drivers, requirements, architectural approach or policies for shared data exist for the governed scope.", "The absence of a programme remains visible to governance bodies.", ["inputs:Business Drivers"]),
    ("STS-PRG-02", "REG-RMD-PRG", "Identified Requirements", False, False, "Business drivers and cross-functional requirements for master and reference data are identified and definitions are being validated.", "Each requirement remains traceable to its driver and business area.", ["process:1", "process:1.1", "deliverable:Master and Reference Data Requirements"]),
    ("STS-PRG-03", "REG-RMD-PRG", "Approved Approach", False, False, "The architectural approach, stewardship and maintenance processes and governance policies for shared data are approved.", "The approved approach, processes, policies and approving authority remain traceable.", ["process:3", "process:5", "process:6", "deliverable:Data Models and Integration Patterns"]),
    ("STS-PRG-04", "REG-RMD-PRG", "Operating Programme", False, False, "The data sharing and integration architecture is in service, stewardship coverage is measured and reusable data services are offered.", "Steward coverage, sharing availability and consumption metrics remain current.", ["process:7", "deliverable:Reusable Data Services", "metric:Data Steward Coverage", "metric:Data Sharing Availability"]),
    ("STS-PRG-05", "REG-RMD-PRG", "Programme Revision", False, False, "The approach, processes or policies are under revision after a business, architectural or regulatory trigger while the current programme stays in force.", "The programme in force remains valid until the revision is approved.", ["inputs:Industry Standards"]),
    ("STS-DOM-01", "REG-RMD-DOM", "Unscoped Domain", True, False, "The master data domain is not in the programme's scope; no shared definitions exist.", "The absence of shared definitions for the domain remains visible.", ["inputs:Cross Functional Requirements"]),
    ("STS-DOM-02", "REG-RMD-DOM", "Validated Definitions", False, False, "The domain's data definitions are validated against the glossary and the cross-functional requirements.", "Validated definitions, their glossary references and the approving stewards remain current.", ["process:1.1", "inputs:Data Glossary"]),
    ("STS-DOM-03", "REG-RMD-DOM", "Assessed Sources", False, False, "Candidate sources (internal, purchased, open) are evaluated and assessed for the domain and a system of record or reference is designated.", "Source assessments and the designated source remain recorded.", ["process:2", "inputs:Purchased Data and/or Open Data and Code Sets"]),
    ("STS-DOM-04", "REG-RMD-DOM", "Modelled Domain", False, False, "The domain's data model and integration pattern (registry, consolidation, coexistence, transaction hub) are approved.", "Model version and integration pattern remain traceable.", ["process:3", "process:4", "deliverable:Data Models and Integration Patterns"]),
    ("STS-DOM-05", "REG-RMD-DOM", "Defined Stewardship", False, False, "Stewardship, maintenance processes and governance policies for the domain are defined and stewards assigned.", "Assigned stewards and maintenance procedures remain current.", ["process:5", "process:6", "metric:Data Steward Coverage"]),
    ("STS-DOM-06", "REG-RMD-DOM", "Shared Domain", False, False, "The domain's sharing and integration service is implemented, sources acquired and reliable master data published under conditions-of-use agreements.", "The sharing service is available; conditions of use are agreed; sharing volume and utilisation are measured.", ["process:7", "process:7.1", "process:7.2", "techniques:Conditions-of-use agreements", "metric:Data Sharing Volume and Utilization"]),
    ("STS-DOM-07", "REG-RMD-DOM", "Domain Change", False, False, "The domain's definitions, model or service are under change while the current service stays in service.", "The service in force remains valid until the change is approved.", ["metric:Data Change Activity"]),
    ("STS-REF-01", "REG-RMD-REF", "Unsourced Set", True, False, "No source or definitions exist for the reference data set.", "The absence of a source remains visible.", ["inputs:Industry Standards"]),
    ("STS-REF-02", "REG-RMD-REF", "Validated Set", False, False, "The set's source is assessed and its definitions and mappings validated against the glossary and industry standards.", "Source, definitions, mappings and validator remain recorded.", ["process:1.1", "process:2", "inputs:Data Glossary"]),
    ("STS-REF-03", "REG-RMD-REF", "Published Version", False, False, "A version of the set is published through the sharing service under conditions of use and is the current version.", "Exactly one current version; consumers can resolve every code.", ["process:7.2", "deliverable:Reliable Reference and Master Data"]),
    ("STS-REF-04", "REG-RMD-REF", "Pending Version", False, False, "A new version (industry update, added or deprecated codes) is validated and awaiting publication; the current version stays published.", "The pending version's differences and effective date remain explicit.", ["metric:Data Change Activity"]),
    ("STS-REF-05", "REG-RMD-REF", "Retired Set", False, False, "The set is withdrawn from sharing; its versions are retained for the record and for lineage of the data that used them.", "Retired versions remain retrievable for historical resolution.", ["techniques:Processing Log analysis"]),
    ("STS-GLD-01", "REG-RMD-GLD", "Candidate Record", True, False, "A source record for a master entity instance is acquired with its business key cross references and is not yet matched.", "Source, business keys and acquisition time remain recorded.", ["process:7.1", "techniques:Business key cross references"]),
    ("STS-GLD-02", "REG-RMD-GLD", "Matched Record", False, False, "The candidate is matched against existing golden records and merged or created according to the match rules; survivorship applied.", "Match decision, rule version and survivorship remain traceable.", ["process:4", "tools:MDM Application Platforms"]),
    ("STS-GLD-03", "REG-RMD-GLD", "Reliable Record", False, False, "The golden record is reconciled across sources, quality-assessed as conforming and published through the domain's sharing service.", "Cross references resolve; quality conforms; the record is the authoritative source for its entity.", ["process:7.2", "deliverable:Reliable Reference and Master Data", "metric:Data Quality and Compliance"]),
    ("STS-GLD-04", "REG-RMD-GLD", "Record Conflict", False, False, "A match conflict, survivorship dispute or quality non-conformance is open on the record; it is not authoritative until resolved.", "The conflict, its owner and the DG issue reference remain explicit.", ["metric:Data Quality and Compliance"]),
    ("STS-GLD-05", "REG-RMD-GLD", "Split Record", False, False, "A previous merge is undone; the record is split into separate entities and each part re-matched.", "The split decision and the resulting records remain traceable.", ["techniques:Business key cross references"]),
    ("STS-GLD-06", "REG-RMD-GLD", "Retired Record", False, False, "The entity instance is no longer active (merged into another record, or ended); the record is withdrawn from sharing and retained.", "The successor record (if merged) and retention remain recorded.", ["techniques:Processing Log analysis"]),
]
EVENTS = {
    "EV-PRG-01": ("Programme initiation", "Request"), "EV-PRG-02": ("Approach and policy approval", "Decision outcome"), "EV-PRG-03": ("Sharing architecture activation", "Decision outcome"), "EV-PRG-04": ("Programme revision trigger", "Monitoring trigger"), "EV-PRG-05": ("Revised approach approval", "Decision outcome"), "EV-PRG-06": ("Programme retirement", "Decision outcome"),
    "EV-DOM-01": ("Domain brought into scope", "Request"), "EV-DOM-02": ("Definitions validated", "Evidence trigger"), "EV-DOM-03": ("Sources assessed", "Assessment outcome"), "EV-DOM-04": ("Model and pattern approval", "Decision outcome"), "EV-DOM-05": ("Stewardship assignment", "Decision outcome"), "EV-DOM-06": ("Sharing service publication", "Decision outcome"), "EV-DOM-07": ("Domain change request", "Request"), "EV-DOM-08": ("Domain change approval", "Decision outcome"), "EV-DOM-09": ("Domain withdrawal", "Decision outcome"),
    "EV-REF-01": ("Set sourced", "Request"), "EV-REF-02": ("Version publication", "Decision outcome"), "EV-REF-03": ("New version validated", "Evidence trigger"), "EV-REF-04": ("Version supersession", "Decision outcome"), "EV-REF-05": ("Set retirement", "Decision outcome"), "EV-REF-06": ("Set reinstatement", "Decision outcome"),
    "EV-GLD-01": ("Match completion", "Assessment outcome"), "EV-GLD-02": ("Reconciliation and quality confirmation", "Assessment outcome"), "EV-GLD-03": ("Conflict detection", "Monitoring trigger"), "EV-GLD-04": ("Conflict resolution", "Decision outcome"), "EV-GLD-05": ("Split decision", "Decision outcome"), "EV-GLD-06": ("Record retirement", "Decision outcome"), "EV-GLD-07": ("Re-match after split", "Assessment outcome"), "EV-GLD-08": ("Source update", "Monitoring trigger"),
}
DR = {
    "DR-RMD-01": ("Approve Shared Data Approach, Processes and Policies", "ROLE-PM-RMD", "Confirmed 22 Sep 2026 (holder register): Reference and Master Data Practice Manager; drafted as Data Architects"),
    "DR-RMD-02": ("Activate, Revise and Retire the Programme", "ROLE-PM-RMD", "Confirmed 22 Sep 2026 (holder register): Reference and Master Data Practice Manager; drafted as Data Architects"),
    "DR-RMD-03": ("Bring a Domain into Scope and Validate its Definitions", "ROLE-DDS", "Confirmed 22 Sep 2026 (holder register): Domain Data Steward; drafted as Data Stewards"),
    "DR-RMD-04": ("Designate Sources and Approve the Domain Model", "ROLE-DARCH", "Confirmed 22 Sep 2026 (holder register): Data Architect; drafted as Data Architects"),
    "DR-RMD-05": ("Assign Domain Stewardship and Publish the Sharing Service", "ROLE-EDS", "Confirmed 22 Sep 2026 (holder register): Enterprise Data Steward; drafted as Data Stewards"),
    "DR-RMD-06": ("Publish, Supersede and Retire a Reference Data Version", "ROLE-BDS", "Confirmed 22 Sep 2026 (holder register): Business Data Steward; drafted as Data Stewards"),
    "DR-RMD-07": ("Confirm Match, Merge, Split and Retirement of a Golden Record", "ROLE-BDS", "Confirmed 22 Sep 2026 (holder register): Business Data Steward; drafted as Data Stewards"),
    "DR-RMD-08": ("Declare and Resolve a Golden Record Conflict", "ROLE-DQA", "Confirmed 22 Sep 2026 (holder register): Data Quality Analyst; drafted as Data Quality Analysts"),
}
ROLES = [
    ("ROLE-RMD-S01", "Subject Matter Experts", "Supplier", "Supply definitions and business rules."), ("ROLE-RMD-S02", "Data Stewards", "Supplier", "Supply stewardship knowledge and requirements."), ("ROLE-RMD-S03", "Application Developers", "Supplier", "Supply source records and consuming applications."), ("ROLE-RMD-S04", "Data Providers", "Supplier", "Supply purchased and open data and code sets."), ("ROLE-RMD-S05", "Business Analysts", "Supplier", "Supply cross-functional requirements."), ("ROLE-RMD-S06", "Infrastructure Systems Analysts", "Supplier", "Supply platform constraints."),
    ("ROLE-RMD-P01", "Data Analysts", "Participant", "Analyse requirements and sources."), ("ROLE-RMD-P02", "Data Modelers", "Participant", "Model the domains and sets."), ("ROLE-RMD-P03", "Data Stewards", "Participant", "Validate definitions; steward domains, sets and records; publish."), ("ROLE-RMD-P04", "Data Integrators", "Participant", "Acquire sources; implement sharing services."), ("ROLE-RMD-P05", "Data Architects", "Participant", "Define the architectural approach; approve models and patterns."), ("ROLE-RMD-P06", "Data Quality Analysts", "Participant", "Assess quality; resolve conflicts."),
    ("ROLE-RMD-C01", "Master Data Analysts", "Consumer", "Consume reliable master data."), ("ROLE-RMD-C02", "Data Integrators", "Consumer", "Consume sharing services."), ("ROLE-RMD-C03", "Data Architects", "Consumer", "Consume models and patterns."), ("ROLE-RMD-C04", "Application Users", "Consumer", "Consume shared data in applications."), ("ROLE-RMD-C05", "Application Developers", "Consumer", "Consume reusable data services."), ("ROLE-RMD-C06", "Solution Architects", "Consumer", "Consume integration patterns."),
]
TRANS = [
    ("TR-PRG-01", "Identify Requirements", "STS-PRG-01", "STS-PRG-02", "EV-PRG-01", "Business drivers, cross-functional requirements, industry standards and the glossary are available as inputs.", "DR-RMD-02", ["SVC-RMD-01"], ["ACT-RMD-1", "ACT-RMD-1.1"]),
    ("TR-PRG-02", "Approve Approach and Policies", "STS-PRG-02", "STS-PRG-03", "EV-PRG-02", "The architectural approach, stewardship and maintenance processes and governance policies are approved.", "DR-RMD-01", ["SVC-RMD-01", "SVC-RMD-02"], ["ACT-RMD-3", "ACT-RMD-5", "ACT-RMD-6"]),
    ("TR-PRG-03", "Activate Sharing Architecture", "STS-PRG-03", "STS-PRG-04", "EV-PRG-03", "The data sharing and integration architecture is in service and reusable data services are offered.", "DR-RMD-02", ["SVC-RMD-06"], ["ACT-RMD-7"]),
    ("TR-PRG-04", "Revise Programme", "STS-PRG-04", "STS-PRG-05", "EV-PRG-04", "A business, architectural or regulatory trigger is recorded; the programme in force is retained meanwhile.", "DR-RMD-02", ["SVC-RMD-01"], ["ACT-RMD-1"]),
    ("TR-PRG-05", "Approve Revised Approach", "STS-PRG-05", "STS-PRG-03", "EV-PRG-05", "The revised approach, processes or policies are approved.", "DR-RMD-01", ["SVC-RMD-01"], ["ACT-RMD-3"]),
    ("TR-PRG-06", "Retire Programme", "STS-PRG-05", "STS-PRG-01", "EV-PRG-06", "The programme is retired without replacement and the retirement is recorded.", "DR-RMD-02", ["SVC-RMD-01"], ["ACT-RMD-6"]),
    ("TR-DOM-01", "Validate Domain Definitions", "STS-DOM-01", "STS-DOM-02", "EV-DOM-01", "The domain is in the programme's scope; definitions are validated against the glossary and requirements.", "DR-RMD-03", ["SVC-RMD-02"], ["ACT-RMD-1.1"]),
    ("TR-DOM-02", "Assess Domain Sources", "STS-DOM-02", "STS-DOM-03", "EV-DOM-03", "Candidate sources are evaluated and a system of record or reference is designated.", "DR-RMD-04", ["SVC-RMD-03"], ["ACT-RMD-2"]),
    ("TR-DOM-03", "Model Domain", "STS-DOM-03", "STS-DOM-04", "EV-DOM-04", "The domain data model and integration pattern are approved under the programme's approach.", "DR-RMD-04", ["SVC-RMD-04"], ["ACT-RMD-3", "ACT-RMD-4"]),
    ("TR-DOM-04", "Define Domain Stewardship", "STS-DOM-04", "STS-DOM-05", "EV-DOM-05", "Stewards are assigned and maintenance processes and policies defined for the domain.", "DR-RMD-05", ["SVC-RMD-05"], ["ACT-RMD-5", "ACT-RMD-6"]),
    ("TR-DOM-05", "Publish Sharing Service", "STS-DOM-05", "STS-DOM-06", "EV-DOM-06", "The sharing and integration service is implemented, sources acquired and conditions-of-use agreements in place.", "DR-RMD-05", ["SVC-RMD-06"], ["ACT-RMD-7", "ACT-RMD-7.1", "ACT-RMD-7.2"]),
    ("TR-DOM-06", "Open Domain Change", "STS-DOM-06", "STS-DOM-07", "EV-DOM-07", "A definition, model or service change is requested; the current service stays in service.", "DR-RMD-04", ["SVC-RMD-04"], ["ACT-RMD-4"]),
    ("TR-DOM-07", "Approve Domain Change", "STS-DOM-07", "STS-DOM-06", "EV-DOM-08", "The change is approved and deployed to the sharing service.", "DR-RMD-04", ["SVC-RMD-04", "SVC-RMD-06"], ["ACT-RMD-4", "ACT-RMD-7"]),
    ("TR-DOM-08", "Withdraw Domain", "STS-DOM-07", "STS-DOM-01", "EV-DOM-09", "The domain leaves the programme's scope; its sharing service is decommissioned and its records retired.", "DR-RMD-03", ["SVC-RMD-06"], ["ACT-RMD-7"]),
    ("TR-REF-01", "Validate Set", "STS-REF-01", "STS-REF-02", "EV-REF-01", "A source (industry standard, purchased, open or internal) is assessed and definitions and mappings validated.", "DR-RMD-06", ["SVC-RMD-02", "SVC-RMD-03"], ["ACT-RMD-1.1", "ACT-RMD-2"]),
    ("TR-REF-02", "Publish Version", "STS-REF-02", "STS-REF-03", "EV-REF-02", "The validated version is published through the sharing service under conditions of use.", "DR-RMD-06", ["SVC-RMD-06"], ["ACT-RMD-7.2"]),
    ("TR-REF-03", "Validate New Version", "STS-REF-03", "STS-REF-04", "EV-REF-03", "An industry update or internal change is validated as a new version; the current version stays published.", "DR-RMD-06", ["SVC-RMD-02"], ["ACT-RMD-1.1"]),
    ("TR-REF-04", "Supersede Version", "STS-REF-04", "STS-REF-03", "EV-REF-04", "The new version is published and the previous version retained for historical resolution.", "DR-RMD-06", ["SVC-RMD-06"], ["ACT-RMD-7.2"]),
    ("TR-REF-05", "Retire Set", "STS-REF-03", "STS-REF-05", "EV-REF-05", "The set is withdrawn from sharing with no consumer dependency outstanding.", "DR-RMD-06", ["SVC-RMD-06"], ["ACT-RMD-7.2"]),
    ("TR-REF-06", "Reinstate Set", "STS-REF-05", "STS-REF-02", "EV-REF-06", "A retired set is needed again and re-validated.", "DR-RMD-06", ["SVC-RMD-02"], ["ACT-RMD-1.1"]),
    ("TR-GLD-01", "Match Record", "STS-GLD-01", "STS-GLD-02", "EV-GLD-01", "The candidate is matched by the domain's match rules and merged or created; survivorship applied.", "DR-RMD-07", ["SVC-RMD-07"], ["ACT-RMD-7.1"]),
    ("TR-GLD-02", "Confirm Reliable Record", "STS-GLD-02", "STS-GLD-03", "EV-GLD-02", "The record is reconciled across sources, quality-assessed as conforming and published.", "DR-RMD-07", ["SVC-RMD-07", "SVC-RMD-08"], ["ACT-RMD-7.2"]),
    ("TR-GLD-03", "Detect Conflict", "STS-GLD-03", "STS-GLD-04", "EV-GLD-03", "A match conflict, survivorship dispute or quality non-conformance is detected and a DG issue logged.", "DR-RMD-08", ["SVC-RMD-08"], ["ACT-RMD-7.1"]),
    ("TR-GLD-04", "Detect Conflict on Match", "STS-GLD-02", "STS-GLD-04", "EV-GLD-03", "The match result is disputed before confirmation.", "DR-RMD-08", ["SVC-RMD-08"], ["ACT-RMD-7.1"]),
    ("TR-GLD-05", "Resolve Conflict", "STS-GLD-04", "STS-GLD-02", "EV-GLD-04", "The conflict is resolved (survivorship decided, quality remediated) and the record re-matched.", "DR-RMD-08", ["SVC-RMD-07"], ["ACT-RMD-7.1"]),
    ("TR-GLD-06", "Split Record", "STS-GLD-04", "STS-GLD-05", "EV-GLD-05", "The conflict shows a false merge; the record is split into separate entities.", "DR-RMD-07", ["SVC-RMD-07"], ["ACT-RMD-7.1"]),
    ("TR-GLD-07", "Re-match after Split", "STS-GLD-05", "STS-GLD-02", "EV-GLD-07", "Each split part is re-matched and merged or created.", "DR-RMD-07", ["SVC-RMD-07"], ["ACT-RMD-7.1"]),
    ("TR-GLD-08", "Update Reliable Record", "STS-GLD-03", "STS-GLD-02", "EV-GLD-08", "A source update requires re-matching and survivorship; the published record stays available until reconfirmed.", "DR-RMD-07", ["SVC-RMD-07"], ["ACT-RMD-7.1"]),
    ("TR-GLD-09", "Retire Record", "STS-GLD-03", "STS-GLD-06", "EV-GLD-06", "The entity instance ends or is merged into another record; the record is withdrawn from sharing and retained.", "DR-RMD-07", ["SVC-RMD-07"], ["ACT-RMD-7.2"]),
    ("TR-GLD-10", "Retire Conflicted Record", "STS-GLD-04", "STS-GLD-06", "EV-GLD-06", "The conflict is resolved by retiring the record (duplicate merged elsewhere).", "DR-RMD-07", ["SVC-RMD-07"], ["ACT-RMD-7.1"]),
    ("TR-GLD-11", "Reactivate Record", "STS-GLD-06", "STS-GLD-01", "EV-GLD-08", "A retired entity returns (for example a re-onboarded customer) and is treated as a new candidate with its history.", "DR-RMD-07", ["SVC-RMD-07"], ["ACT-RMD-7.1"]),
]
SERVICES = [
    ("SVC-RMD-01", "Governance", "Shared Data Requirements and Approach Definition", "Programme initiation or revision.", "Approved drivers and requirements; architectural approach; governance policies."),
    ("SVC-RMD-02", "Governance", "Definition Validation", "Domain in scope; set sourced; new version.", "Validated data definitions and mappings against the glossary and standards."),
    ("SVC-RMD-03", "Risk", "Source Evaluation and Assessment", "Candidate sources identified.", "Assessed sources; designated system of record or reference; source risk."),
    ("SVC-RMD-04", "Governance", "Domain Modelling and Integration Pattern", "Sources assessed; change request.", "Approved data model and integration pattern."),
    ("SVC-RMD-05", "Governance", "Stewardship and Maintenance Process Definition", "Domain modelled.", "Assigned stewards; maintenance procedures."),
    ("SVC-RMD-06", "Control", "Data Sharing and Integration Service", "Stewardship defined; publication; supersession; retirement.", "Published sharing service; conditions-of-use agreements; sharing availability."),
    ("SVC-RMD-07", "Control", "Matching, Merging and Survivorship", "Candidate record; source update; conflict resolution; split.", "Matched golden record; business key cross references; survivorship result."),
    ("SVC-RMD-08", "Assurance", "Reconciliation and Quality Confirmation", "Record matched; conflict detection.", "Reconciled record; quality confirmation; conflict findings."),
]
ACTS = [
    ("ACT-RMD-1", "Identify Drivers and Requirements", "1", "Transition-causing", ["REG-RMD-PRG"], ["TR-PRG-01", "TR-PRG-04"], ["SVC-RMD-01"]),
    ("ACT-RMD-1.1", "Validate Data Definitions", "1.1", "Transition-causing", ["REG-RMD-PRG", "REG-RMD-DOM", "REG-RMD-REF"], ["TR-PRG-01", "TR-DOM-01", "TR-REF-01", "TR-REF-03", "TR-REF-06"], ["SVC-RMD-02"]),
    ("ACT-RMD-2", "Evaluate and Assess Data Sources", "2", "Transition-causing", ["REG-RMD-DOM", "REG-RMD-REF"], ["TR-DOM-02", "TR-REF-01"], ["SVC-RMD-03"]),
    ("ACT-RMD-3", "Define Architectural Approach", "3", "Transition-causing", ["REG-RMD-PRG", "REG-RMD-DOM"], ["TR-PRG-02", "TR-PRG-05", "TR-DOM-03"], ["SVC-RMD-01", "SVC-RMD-04"]),
    ("ACT-RMD-4", "Model Data", "4", "Transition-causing", ["REG-RMD-DOM"], ["TR-DOM-03", "TR-DOM-06", "TR-DOM-07"], ["SVC-RMD-04"]),
    ("ACT-RMD-5", "Define Stewardship and Maintenance Processes", "5", "Transition-causing", ["REG-RMD-PRG", "REG-RMD-DOM"], ["TR-PRG-02", "TR-DOM-04"], ["SVC-RMD-05"]),
    ("ACT-RMD-6", "Establish Governance Policies", "6", "Transition-causing", ["REG-RMD-PRG", "REG-RMD-DOM"], ["TR-PRG-02", "TR-PRG-06", "TR-DOM-04"], ["SVC-RMD-01", "SVC-RMD-05"]),
    ("ACT-RMD-7", "Implement Data Sharing/Integration Services", "7", "Transition-causing", ["REG-RMD-PRG", "REG-RMD-DOM"], ["TR-PRG-03", "TR-DOM-05", "TR-DOM-07", "TR-DOM-08"], ["SVC-RMD-06"]),
    ("ACT-RMD-7.1", "Acquire Data Sources for Sharing", "7.1", "Transition-causing", ["REG-RMD-DOM", "REG-RMD-GLD"], ["TR-DOM-05", "TR-GLD-01", "TR-GLD-03", "TR-GLD-04", "TR-GLD-05", "TR-GLD-06", "TR-GLD-07", "TR-GLD-08", "TR-GLD-10", "TR-GLD-11"], ["SVC-RMD-07"]),
    ("ACT-RMD-7.2", "Publish Reference and Master Data", "7.2", "Transition-causing", ["REG-RMD-DOM", "REG-RMD-REF", "REG-RMD-GLD"], ["TR-DOM-05", "TR-REF-02", "TR-REF-04", "TR-REF-05", "TR-GLD-02", "TR-GLD-09"], ["SVC-RMD-06", "SVC-RMD-08"]),
]
ARTEFACTS = [
    ("ART-RMD-01", "Master and Reference Data Requirements", "STS-PRG-02", "Identify Drivers and Requirements", "Evidences Identified Requirements."), ("ART-RMD-02", "Data Models and Integration Patterns", "STS-DOM-04", "Model Data", "Evidences Modelled Domain; cited by Global materialisation."), ("ART-RMD-03", "Reliable Reference and Master Data", "STS-GLD-03", "Publish Reference and Master Data", "Evidences Reliable Record and Published Version."), ("ART-RMD-04", "Reusable Data Services", "STS-DOM-06", "Implement Data Sharing/Integration Services", "Evidences Shared Domain; cited by Global access release."),
]
CONTRIB = [
    ("CON-RMD-01", "TR-EX-01", "guard", {"DOM": ["STS-DOM-02", "STS-DOM-03", "STS-DOM-04", "STS-DOM-05", "STS-DOM-06", "STS-DOM-07"]}, "A master record or reference set is registered only under validated definitions for its domain.", "RMD_definitions_validated", "Required", "Register Asset for shared data cites the validated definitions."),
    ("CON-RMD-02", "TR-EX-01", "guard", {"DOM": ["STS-DOM-03", "STS-DOM-04", "STS-DOM-05", "STS-DOM-06", "STS-DOM-07"]}, "Registration requires an assessed, designated source for the domain.", "RMD_source_assessed", "Required", ""),
    ("CON-RMD-03", "TR-EX-02", "guard", {"DOM": ["STS-DOM-04", "STS-DOM-05", "STS-DOM-06", "STS-DOM-07"], "GLD": ["STS-GLD-02", "STS-GLD-03"]}, "A master data asset is materialised only under an approved domain model and integration pattern and once its golden records are matched and merged.", "not RMD_is_master or (RMD_domain_modelled and RMD_record_matched)", "Required", "Materialize Asset = the merged golden records exist in the hub. Howard, 22 Sep 2026: applies to master data assets only (asset fact RMD_is_master); a reference data set is gated by CON-RMD-16."),
    ("CON-RMD-04", "TR-AV-01", "guard", {"DOM": ["STS-DOM-06"], "GLD": ["STS-GLD-03"]}, "Access to a master data asset is released only through a published sharing service under conditions of use and only when its golden records are Reliable.", "not RMD_is_master or (RMD_domain_shared and RMD_record_reliable)", "Required", "Howard, 22 Sep 2026: master data assets only (RMD_is_master); reference data sets are gated by CON-RMD-05."),
    ("CON-RMD-05", "TR-AV-01", "guard", {"REF": ["STS-REF-03", "STS-REF-04"]}, "Access to a reference data set is released only when a version is published under conditions of use.", "not RMD_is_reference or RMD_version_published", "Required", "Howard, 22 Sep 2026: reference data assets only (asset fact RMD_is_reference); the Reference Data Set region is one per set, held by the asset, not shared per scope."),
    ("CON-RMD-06", "TR-EX-03", "event", {"REF": ["STS-REF-04"], "GLD": ["STS-GLD-06"]}, "A new reference version, or a merge of this golden record into another, supersedes the asset.", "RMD_version_pending or RMD_record_retired", "Conditional", "RMD emits EV-EX-03 when TR-REF-04 or TR-GLD-09 (merge) fires."),
    ("CON-RMD-07", "TR-EX-04", "event", {"GLD": ["STS-GLD-05"]}, "A split reinstates a superseded record as its own asset.", "RMD_record_split", "Conditional", "RMD emits EV-EX-04 when TR-GLD-06 fires."),
    ("CON-RMD-08", "TR-AS-05", "event", {"GLD": ["STS-GLD-04"]}, "A golden record conflict is a material change affecting the assurance claim.", "RMD_record_conflict", "Conditional", "RMD emits EV-AS-05 when TR-GLD-03 fires."),
    ("CON-RMD-09", "TR-AV-03", "event", {"GLD": ["STS-GLD-04"]}, "A golden record conflict requires access suspension until resolved.", "RMD_record_conflict", "Conditional", "RMD emits EV-AV-03 when TR-GLD-03 fires."),
    ("CON-RMD-10", "TR-AV-04", "guard", {"GLD": ["STS-GLD-03"]}, "Suspended access to a master data asset is restored only when its golden records are Reliable again.", "not RMD_is_master or RMD_record_reliable", "Required", "Master data assets only (RMD_is_master)."),
    ("CON-RMD-11", "TR-EX-05", "event", {"GLD": ["STS-GLD-06"], "REF": ["STS-REF-05"]}, "Retirement of a record or set with no dependency is a disposition trigger.", "RMD_record_retired or RMD_set_retired", "Conditional", "RMD emits EV-EX-05 when TR-GLD-09 or TR-REF-05 fires and retention allows."),
    ("CON-RMD-12", "TR-AS-02", "service", {"GLD": ["STS-GLD-03"]}, "Reconciliation and Quality Confirmation supplies the assurance evidence for a golden record.", "SVC-RMD-08", "Conditional", "Assurance service; artefact ART-RMD-03."),
    ("CON-RMD-13", "TR-CP-01", "guard", {"DOM": ["STS-DOM-05", "STS-DOM-06", "STS-DOM-07"]}, "A master domain is taken into active custody only once its stewardship is defined.", "RMD_stewardship_defined or not RMD_domain_scoped", "Conditional", "Howard, 22 Sep (open decisions record, Custody sweep): non-master assets are unaffected."),
    ("CON-RMD-14", "TR-CP-04", "guard", {"DOM": ["STS-DOM-06", "STS-DOM-07"]}, "A master domain is placed in external custody only as a Shared Domain.", "RMD_domain_shared or not RMD_domain_scoped", "Conditional", "Howard, 22 Sep (open decisions record, Custody sweep)."),
    ("CON-RMD-15", "TR-CP-10", "guard", {"GLD": ["STS-GLD-01", "STS-GLD-06"]}, "Custody of a golden record is closed after destruction only when the record is retired.", "RMD_record_retired or not RMD_record_matched", "Conditional", "Howard, 22 Sep (open decisions record, Custody sweep)."),
    ("CON-RMD-16", "TR-EX-02", "guard", {"REF": ["STS-REF-02", "STS-REF-03", "STS-REF-04"]}, "A reference data set is materialised only once its source is assessed and its definitions and values are validated.", "not RMD_is_reference or RMD_set_validated", "Required", "Howard, 22 Sep 2026: the reference data counterpart of CON-RMD-03."),
    ("CON-RMD-17", "TR-AV-01", "event", {"DOM": ["STS-DOM-06"], "REF": ["STS-REF-03", "STS-REF-04"]}, "A master data domain published for sharing, or a published version of a reference data set, is the request to release access to that asset.", "(RMD_is_master and RMD_domain_shared) or (RMD_is_reference and RMD_version_published)", "Conditional", "Howard, 23 Sep 2026: eleven Knowledge Areas gated TR-AV-01 and none raised it. Each Knowledge Area that owns an asset kind now raises the release request for the assets of its kind. Reference and Master Data owns master data assets and reference data sets; RMD emits EV-AV-01 when TR-DOM-05 or TR-REF-04 fires."),
]
KA_COUPLINGS = [
    ("KAC-RMD-01", "KA-DQ", "TR-PDCA-03", "", "DQ_conforming", "A golden record is Reliable only when its DQ PDCA cycle is at Conforming Quality (TR-GLD-02 cites the DQ fact).", "Reverse coupling: an RMD transition cites a DQ fact."),
    ("KAC-RMD-02", "KA-DG", "TR-ISS-01", "EV-ISS-01", "RMD_record_conflict", "A golden record conflict is logged as a Data Asset issue in the DG issue FTS with source Reference and Master Data (TR-GLD-03 and TR-GLD-04 emit EV-ISS-01).", "DG owns escalation; RMD owns the resolution."),
    ("KAC-RMD-03", "KA-MM", "TR-AST-02", "", "MM_asset_described", "Domain definitions are validated against the glossary and recorded as business metadata; the domain's model is technical metadata (TR-DOM-01 and TR-DOM-03 cite the Metadata FTS).", "Reverse coupling: an RMD transition cites an MM fact."),
    ("KAC-RMD-04", "KA-DS", "TR-CLS-02", "", "DS_classified", "A domain's sharing service is published only for classified data; the conditions-of-use agreement carries the classification and, for personal data, the privacy basis (TR-DOM-05 cites DS facts).", "Reverse coupling: an RMD transition cites DS facts."),
    ("KAC-RMD-05", "KA-DG", "TR-POL-03", "", "RMD_policy_set_in_force", "The programme's governance policies are governing instruments published under Data Governance (TR-PRG-02 cites the DG fact).", "Reverse coupling."),
]
FACT_BINDINGS = {
    "RMD_domain_scoped": {"region": "REG-RMD-DOM", "states": ["STS-DOM-02", "STS-DOM-03", "STS-DOM-04", "STS-DOM-05", "STS-DOM-06", "STS-DOM-07"]},
    "RMD_stewardship_defined": {"region": "REG-RMD-DOM", "states": ["STS-DOM-05", "STS-DOM-06", "STS-DOM-07"]},
    "RMD_programme_operating": {"region": "REG-RMD-PRG", "states": ["STS-PRG-04", "STS-PRG-05"]},
    "RMD_definitions_validated": {"region": "REG-RMD-DOM", "states": ["STS-DOM-02", "STS-DOM-03", "STS-DOM-04", "STS-DOM-05", "STS-DOM-06", "STS-DOM-07"]},
    "RMD_source_assessed": {"region": "REG-RMD-DOM", "states": ["STS-DOM-03", "STS-DOM-04", "STS-DOM-05", "STS-DOM-06", "STS-DOM-07"]},
    "RMD_domain_modelled": {"region": "REG-RMD-DOM", "states": ["STS-DOM-04", "STS-DOM-05", "STS-DOM-06", "STS-DOM-07"]},
    "RMD_domain_shared": {"region": "REG-RMD-DOM", "states": ["STS-DOM-06", "STS-DOM-07"]},
    "RMD_version_published": {"region": "REG-RMD-REF", "states": ["STS-REF-03", "STS-REF-04"]},
    "RMD_set_validated": {"region": "REG-RMD-REF", "states": ["STS-REF-02", "STS-REF-03", "STS-REF-04"]},
    "RMD_version_pending": {"region": "REG-RMD-REF", "states": ["STS-REF-04"]},
    "RMD_set_retired": {"region": "REG-RMD-REF", "states": ["STS-REF-05"]},
    "RMD_record_matched": {"region": "REG-RMD-GLD", "states": ["STS-GLD-02", "STS-GLD-03"]},
    "RMD_record_reliable": {"region": "REG-RMD-GLD", "states": ["STS-GLD-03"]},
    "RMD_record_conflict": {"region": "REG-RMD-GLD", "states": ["STS-GLD-04"]},
    "RMD_record_split": {"region": "REG-RMD-GLD", "states": ["STS-GLD-05"]},
    "RMD_record_retired": {"region": "REG-RMD-GLD", "states": ["STS-GLD-06"]},
}
XRG = [
    ("XRG-RMD-01", "A domain enters scope only under an approved or operating programme.", ["TR-DOM-01"], "Required", "PRG in ('STS-PRG-03','STS-PRG-04','STS-PRG-05')"),
    ("XRG-RMD-02", "A sharing service is published only under an operating programme (sharing architecture in service).", ["TR-DOM-05", "TR-REF-02", "TR-REF-04"], "Required", "PRG in ('STS-PRG-04','STS-PRG-05')"),
    ("XRG-RMD-03", "A golden record is matched only in a modelled domain with stewardship defined.", ["TR-GLD-01", "TR-GLD-07"], "Required", "DOM in ('STS-DOM-05','STS-DOM-06','STS-DOM-07')"),
    ("XRG-RMD-04", "A golden record is confirmed Reliable only in a shared domain.", ["TR-GLD-02"], "Required", "DOM in ('STS-DOM-06','STS-DOM-07')"),
    ("XRG-RMD-05", "A domain is withdrawn only when its golden records are retired.", ["TR-DOM-08"], "Required", "GLD in ('STS-GLD-01','STS-GLD-06')"),
]
VECTORS = [
    ("CFG-RMD-01", "Greenfield", {"REG-RMD-PRG": "STS-PRG-01", "REG-RMD-DOM": "STS-DOM-01", "REG-RMD-REF": "STS-REF-01", "REG-RMD-GLD": "STS-GLD-01"}, "Initial configuration: nothing shared; Global registration of shared data blocked by CON-RMD-01."),
    ("CFG-RMD-02", "Customer domain shared, candidate record", {"REG-RMD-PRG": "STS-PRG-04", "REG-RMD-DOM": "STS-DOM-06", "REG-RMD-REF": "STS-REF-03", "REG-RMD-GLD": "STS-GLD-01"}, "Legal: registration and materialisation guards satisfied for the domain; the record is a candidate, so release stays blocked."),
    ("CFG-RMD-03", "Reliable golden record", {"REG-RMD-PRG": "STS-PRG-04", "REG-RMD-DOM": "STS-DOM-06", "REG-RMD-REF": "STS-REF-03", "REG-RMD-GLD": "STS-GLD-03"}, "Legal: all RMD contributions satisfied; the Customer Master record can be released."),
    ("CFG-RMD-04", "Record conflict", {"REG-RMD-PRG": "STS-PRG-04", "REG-RMD-DOM": "STS-DOM-06", "REG-RMD-REF": "STS-REF-03", "REG-RMD-GLD": "STS-GLD-04"}, "Legal: EV-AS-05 and EV-AV-03 emitted; DG issue logged; release and restoration blocked."),
    ("CFG-RMD-05", "Reference version pending", {"REG-RMD-PRG": "STS-PRG-04", "REG-RMD-DOM": "STS-DOM-06", "REG-RMD-REF": "STS-REF-04", "REG-RMD-GLD": "STS-GLD-03"}, "Legal: EV-EX-03 emitted for the reference set on supersession."),
    ("CFG-RMD-06", "Retired record", {"REG-RMD-PRG": "STS-PRG-04", "REG-RMD-DOM": "STS-DOM-06", "REG-RMD-REF": "STS-REF-03", "REG-RMD-GLD": "STS-GLD-06"}, "Legal: EV-EX-05 emitted; the record is withdrawn from sharing and retained."),
]
EVIDENCE = [
    ("EVD-RMD-01", "Approach and policy approval record", "Decision evidence", "TR-PRG-02", "Approved architectural approach, stewardship processes, governance policies."), ("EVD-RMD-02", "Definition validation record", "Governance evidence", "TR-DOM-01", "Validated definitions, glossary references, validating stewards."), ("EVD-RMD-03", "Source assessment", "Risk evidence", "TR-DOM-02", "Evaluated sources; designated system of record."), ("EVD-RMD-04", "Model and pattern approval", "Decision evidence", "TR-DOM-03", "Approved data model version and integration pattern."), ("EVD-RMD-05", "Conditions-of-use agreement", "Governance evidence", "TR-DOM-05", "Agreed conditions of use per consumer; sharing service publication."), ("EVD-RMD-06", "Version publication record", "Control evidence", "TR-REF-02", "Published version, effective date, differences."), ("EVD-RMD-07", "Match and survivorship record", "Control evidence", "TR-GLD-01", "Match decision, rule version, survivorship, cross references."), ("EVD-RMD-08", "Reconciliation and quality confirmation", "Assurance evidence", "TR-GLD-02", "Reconciled sources, quality result, publication."), ("EVD-RMD-09", "Conflict record", "Control evidence", "TR-GLD-03", "Conflict, owner, DG issue reference, resolution."), ("EVD-RMD-10", "Retirement record", "Control evidence", "TR-GLD-09", "Reason, successor record, retention."),
]
EXC = [("EXC-RMD-01", "Provisional Sharing", "TR-AV-01", "Release of a matched but not yet reconciled record to an urgent consumer.", "DR-RMD-07", "Record matched, quality assessment scheduled with a date, consumer accepts the provisional status in the conditions of use, DG informed, evidence retained; expires at the assessment date.", "Draft / Approved / Expired / Closed")]

SPEC = {
    "meta": {"modelId": "KA-RMD", "name": "Reference and Master Data FTS", "knowledgeArea": "Reference and Master Data", "version": "0.1", "subjectType": KA_SUBJECT,
             "regionModel": "One FTS per managed element: the Programme (scope level), a Master Data Domain (one per domain), a Reference Data Set (one per set) and a Golden Record (one per entity instance) run concurrently and are coupled by cross-region constraints, facts and events, never a single subject.",
             "source": SRC_DECK + "; " + SRC_HOWARD + "; " + SRC_PROTOCOL,
             "note": "Four state regions, each its own FTS over one managed element of the Knowledge Area: the Master and Reference Data Programme, a Master Data Domain, a Reference Data Set and a Golden Record. The Golden Record is the Customer Master asset the scenarios run. The KA never becomes a region of the Data Asset; the domain, set and record reach the Global protocol through contributions (registration, materialisation, access release and restoration, supersession, reinstatement, disposition and the assurance and suspension triggers), and couple to DQ, DG, Metadata and Data Security.",
             "definition": CONTEXT["definition"], "factBindings": FACT_BINDINGS,
             "assetFacts": {"RMD_is_master": {"default": True, "meaning": "the asset is master data whose entities have golden records (a party, customer, product or supplier master)"},
                            "RMD_is_reference": {"default": False, "meaning": "the asset is a reference data set (a code set, catalogue or glossary) whose releases are versions"}}},
    "context": CONTEXT, "regions": REGIONS, "states": STATES, "transitions": TRANS, "events": EVENTS, "decisionRights": DR, "roles": ROLES, "artefacts": ARTEFACTS, "activities": ACTS, "services": SERVICES, "contributions": CONTRIB, "kaCouplings": KA_COUPLINGS, "crossRegionConstraints": XRG, "stateVectors": VECTORS, "evidence": EVIDENCE, "exceptions": EXC,
    "sources": [
        {"id": "SRC-RMD-001", "source": SRC_DECK, "type": "Primary (image pages, captured)", "location": "Chat upload; OneDrive Data Lifecycle folder", "use": "Definition, goals, drivers, inputs, processes and sub-activities, deliverables, role players, techniques, tools, metrics", "limitations": "The context diagram gives no record-level lifecycle; the Golden Record states (candidate, matched, reliable, conflict, split, retired) are drafted from the match, merge and survivorship practice in the DMBOK chapter."},
        {"id": "SRC-RMD-002", "source": SRC_HOWARD, "type": "Design direction", "location": "Chat", "use": "Managed elements, Global gating, scenario extension", "limitations": ""},
        {"id": "SRC-RMD-003", "source": SRC_PROTOCOL, "type": "Alignment target", "location": "Private repo models/", "use": "Global transition IDs for contributions; KA transition IDs for couplings", "limitations": ""},
    ],
    "qaNotes": [
        {"severity": "note", "rule": "GA-005", "element": "KA-RMD", "finding": "The Programme and each Domain change rarely relative to a record and gate the sets and records through XRG-RMD-01..05; the Golden Record and Reference Data Set are per instance and are the RMD regions that gate Global transitions."},
        {"severity": "note", "rule": "capture", "element": "REG-RMD-GLD", "finding": "Golden Record states are drafted from match, merge, survivorship and split practice; the context diagram lists the activities (Acquire Data Sources for Sharing, Publish Reference and Master Data) but no record lifecycle. For Howard's review."},
        {"severity": "note", "rule": "derived", "element": "STATES", "finding": "All state names, events, decision rights, holders and services are first-pass drafts from the context diagram; every one is for Howard's review."},
    ],
}

if __name__ == "__main__":
    from ka_build import run_spec
    run_spec(SPEC, "reference_master_data.fts.json")
