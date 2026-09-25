#!/usr/bin/env python3
"""
dii_spec.py  -  Data Integration and Interoperability FTS v0.1: three state regions, each its own FTS over one managed
element of the Knowledge Area, derived from the DMBOK Data Integration and Interoperability context diagram (deck pages
59 to 63) and aligned to the Global Data Asset Protocol.

Howard's managed elements (21 Sep 2026): 1 the DII Architecture of the scope; 2 a Data Exchange of a Data Asset (one per
source-to-target flow, carrying its Data Exchange Specification, Data Access Agreement and the complex event
thresholds and alerts as its monitoring states); 3 a Data Service (one per service).
Decisions 21 Sep 2026: DII gates Global access release through a data service (published service, exchange in
operation under an agreement), custody transfer and external custody (orchestrated exchange with documented lineage),
supersession by a completed migration exchange; an alert or suspension emits the assurance and access-suspension
triggers; profiling and business rule compliance is an assurance service; every transition carries a Decision Right
(holders confirmed 22 Sep 2026 from the shared role vocabulary, role_vocabulary.json).

Usage: python dii_spec.py [out_dir] [--overrides spec/data_integration_interoperability_overrides.json]   -> data_integration_interoperability.fts.json
"""
import json, os, sys
from ka_build import build

SRC_DECK = "DMBOK Data Lifecycle and KA Context Diagrams.pdf, Data Integration and Interoperability pages 59 to 63 (What, Why, Activities, Role Players and Technical Drivers)"
SRC_HOWARD = "Howard Diesel, 21 Sep 2026: three DII managed elements (DII Architecture; Data Exchange of a Data Asset with the alert thresholds folded in; Data Service), Global gating of release, transfer, external custody and supersession with the assurance and suspension triggers"
SRC_PROTOCOL = "global_protocol.fts.json v0.2.1 for the contribution targets; data_governance v0.2, data_architecture, data_security, data_quality, metadata_management, reference_master_data and data_storage_operations v0.1 for the couplings"

CONTEXT = {
    "knowledgeArea": "Data Integration and Interoperability",
    "definition": "Managing the movement and consolidation of data within and between applications and organizations. DII describes processes relating to the movement and consolidation of data within and between data stores, applications and organisations. Data Integration consolidates data into consistent forms. Data interoperability is the ability for multiple systems to communicate.",
    "ensures": "Every movement or consolidation of a Data Asset runs through a designed, agreed, orchestrated and monitored exchange under the DII architecture, delivered through published data services, with lineage documented and alerts raised on threshold breaches.",
    "goals": ["Provide data securely, with regulatory compliance, in the format and timeframe needed", "Lower cost and complexity of managing solutions by developing shared models and interfaces", "Identify meaningful events and automatically trigger alerts and actions", "Support business intelligence, analytics, master data management, and operational efficiency efforts"],
    "businessDrivers": ["The need to manage data movement efficiently", "Data stores from purchased applications must integrate with the organisation's other data stores", "An enterprise view of data integration is more cost effective than point to point solutions", "Data hubs such as data warehouses and Master Data solutions", "Managing the cost of support: standard tools and reducing complexity of interface management", "DII supports the organisation's ability to comply with data handling standards and regulations"],
    "inputs": ["Business Goals and Strategies", "Data Needs and Standards", "Regulatory, Compliance, and Security Requirements", "Data, Process, Application, and Technical Architectures", "Data Semantics", "Source Data"],
    "processes": [
        {"id": "1", "name": "Plan and Analyze", "phase": "P", "subActivities": ["1.1 Define data integration and lifecycle requirements", "1.2 Perform Data Discovery", "1.3 Document Data Lineage", "1.4 Profile Data", "1.5 Examine Business Rule Compliance"]},
        {"id": "2", "name": "Design DII Solutions", "phase": "P", "subActivities": ["2.1 Design Solution Components", "2.2 Map Sources to Targets", "2.3 Design Data Orchestration"]},
        {"id": "3", "name": "Develop DII Solutions", "phase": "D", "subActivities": ["3.1 Develop Data Services", "3.2 Develop Data Flow Orchestration", "3.3 Develop Data Migration Approach", "3.4 Develop Complex Event Processing", "3.5 Maintain DII Metadata"]},
        {"id": "4", "name": "Implement and Monitor", "phase": "O", "subActivities": []},
    ],
    "deliverables": ["DII Architecture", "Data Exchange Specifications", "Data Access Agreements", "Data Services", "Complex Event Processing Thresholds and Alerts"],
    "suppliers": ["Data Producers", "IT Steering Committee", "Executives and Managers", "Subject Matter Experts"],
    "participants": ["Data Architects", "Business and Data Analysts", "Data Modelers", "Data Stewards", "ETL, Service, Interface Developers", "Project and Program Managers"],
    "consumers": ["Information Consumers", "Knowledge Workers", "Managers and Executives"],
    "techniques": ["Hub and Spoke Integration", "Extract Transformation Load (ELT)", "Enterprise Application Integration (EAI)", "Service Oriented Architecture (SOA)"],
    "tools": ["Data Transformation Engine", "Data Virtualization Server", "Enterprise Service Bus", "Data and Process Modeling Tools", "Data Profiling Tool", "Metadata Repository"],
    "metrics": ["Data volumes and speed of delivery", "Data Latency", "Time to Market for Enhancements", "Solution Costs and Complexity", "Value Delivered"],
    "phaseTags": "(P) Planning, (C) Control, (D) Development, (O) Operations",
}

KA_SUBJECT = "Data Integration and Interoperability Knowledge Area: three managed elements, one FTS (state region) each; the Data Asset is the Global subject reached through contributions"
REGIONS = [
    ("REG-DII-DIA", "DII Architecture", "DIA", "Whether the integration architecture of the scope (patterns: hub and spoke, ELT, EAI, SOA; platforms: transformation engine, virtualisation server, service bus; standards) exists, is approved, is in force or is under revision.", "STS-DIA-01", "Exactly one active state; a revised architecture supersedes, never coexists with, the architecture in force.",
     "DII Architecture of the governed scope: the integration patterns, platforms, interface standards and the data integration and lifecycle requirements every exchange and data service is designed to",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Governing element (architecture)", "contributesTo": "No Global transition is gated on the architecture directly; it gates every exchange and data service through cross-region constraints and sits within the Enterprise Data Architecture's data flows.", "conditionsThatMatter": "None; requirements analysed; designed; approved; in force; under revision."}),
    ("REG-DII-EXC", "Data Exchange of a Data Asset", "EXC", "Whether one source-to-target exchange of a Data Asset is defined, has its sources discovered and profiled, is mapped with lineage documented, orchestrated with thresholds set, agreed under a Data Exchange Specification and Data Access Agreement, in operation, under alert, suspended or retired.", "STS-EXC-01", "Exactly one active state per exchange; In Operation means the exchange runs within its thresholds under an agreement in force.",
     "Data Exchange of a Data Asset: one movement or consolidation flow of the asset from a source to a target (or between parties), with its Data Exchange Specification, Data Access Agreement, mapping, lineage, orchestration and the complex event processing thresholds and alerts that monitor it",
     {"instanceScope": "One instance per exchange (flow) of a Data Asset.", "elementKind": "Managed per-exchange element", "contributesTo": "Availability: access through a data service is released only over an exchange in operation under an agreement (TR-AV-01) and restored only when the exchange operates again (TR-AV-04); Custody: transfer and external custody need an orchestrated exchange with documented lineage (TR-CP-05, TR-CP-04); Existence: a completed migration exchange supersedes the source asset (TR-EX-03); Assurance: an alert or suspension emits the assurance trigger (TR-AS-05) and the suspension trigger (TR-AV-03); profiling and business rule compliance supply assurance evidence (TR-AS-02).", "conditionsThatMatter": "None; defined; profiled; mapped; orchestrated; agreed; in operation; alert raised; suspended; retired."}),
    ("REG-DII-DSV", "Data Service", "DSV", "Whether a data service (interface, API, subscription, virtualised view) is designed, developed, published, versioned, deprecated or retired.", "STS-DSV-01", "Exactly one active state per service; exactly one published version is current at a time.",
     "Data Service: one reusable interface through which consumers obtain data (API, message, subscription, virtualised view), designed as a solution component, developed, published in the service catalogue, versioned and deprecated",
     {"instanceScope": "One instance per data service; versions are successive states of the same instance.", "elementKind": "Managed shared element", "contributesTo": "Availability: access through a data service is released only when the service is published (TR-AV-01).", "conditionsThatMatter": "None; designed; developed; published; new version pending; deprecated; retired."}),
]
STATES = [
    ("STS-DIA-01", "REG-DII-DIA", "No DII Architecture", True, False, "No integration architecture exists for the scope; interfaces are point to point.", "The absence of an architecture remains visible to governance bodies.", ["inputs:Business Goals and Strategies"]),
    ("STS-DIA-02", "REG-DII-DIA", "Analysed Integration Requirements", False, False, "The data integration and lifecycle requirements of the scope are defined from the business goals, data needs, regulatory requirements and the architectures.", "Each requirement remains traceable to its business, data or regulatory input.", ["process:1", "process:1.1", "inputs:Data Needs and Standards", "inputs:Regulatory, Compliance, and Security Requirements"]),
    ("STS-DIA-03", "REG-DII-DIA", "Designed DII Architecture", False, False, "The integration patterns, platforms and interface standards are designed and await approval.", "The design remains consistent with the data, process, application and technical architectures.", ["process:2", "process:2.1", "deliverable:DII Architecture", "techniques:Hub and Spoke Integration", "techniques:Service Oriented Architecture (SOA)"]),
    ("STS-DIA-04", "REG-DII-DIA", "Approved DII Architecture", False, False, "The architecture is approved and its interface standards approved as governing instruments.", "The approved architecture and approving authority remain traceable.", ["process:2"]),
    ("STS-DIA-05", "REG-DII-DIA", "DII Architecture in Force", False, False, "The platforms are in service and every exchange and data service is built to the architecture; delivery, latency and cost metrics are measured.", "Every operating exchange and published service conforms to the architecture in force.", ["process:4", "tools:Enterprise Service Bus", "metric:Solution Costs and Complexity", "metric:Value Delivered"]),
    ("STS-DIA-06", "REG-DII-DIA", "DII Architecture Revision", False, False, "The architecture is under revision after a platform, pattern or regulatory trigger while the architecture in force stays in force.", "The architecture in force remains valid until the revision is approved.", ["process:1.1"]),
    ("STS-EXC-01", "REG-DII-EXC", "No Exchange", True, False, "No exchange is defined for the asset between the source and target.", "The absence of an exchange remains visible.", ["inputs:Source Data"]),
    ("STS-EXC-02", "REG-DII-EXC", "Defined Exchange Requirements", False, False, "The exchange's integration and lifecycle requirements (format, timeframe, latency, security, retention) are defined.", "Requirements remain traceable to the consumer need and the regulatory requirements.", ["process:1.1", "inputs:Data Semantics"]),
    ("STS-EXC-03", "REG-DII-EXC", "Profiled Sources", False, False, "Source data is discovered and profiled and business rule compliance examined; findings are recorded.", "Profiling results and rule compliance findings remain current for the source version.", ["process:1.2", "process:1.4", "process:1.5", "tools:Data Profiling Tool"]),
    ("STS-EXC-04", "REG-DII-EXC", "Mapped Exchange", False, False, "Sources are mapped to targets with transformations and the data lineage documented in the metadata repository.", "Every target element traces to a source element and transformation.", ["process:1.3", "process:2.2", "tools:Metadata Repository"]),
    ("STS-EXC-05", "REG-DII-EXC", "Orchestrated Exchange", False, False, "The data flow orchestration and complex event processing thresholds are designed, developed and DII metadata maintained; the exchange awaits agreement.", "Orchestration, thresholds and metadata remain consistent with the mapping.", ["process:2.3", "process:3.2", "process:3.4", "process:3.5", "deliverable:Complex Event Processing Thresholds and Alerts"]),
    ("STS-EXC-06", "REG-DII-EXC", "Agreed Exchange", False, False, "The Data Exchange Specification and the Data Access Agreement between the parties are agreed and the exchange awaits implementation acceptance.", "The agreed specification, agreement, parties and conditions remain explicit.", ["deliverable:Data Exchange Specifications", "deliverable:Data Access Agreements"]),
    ("STS-EXC-07", "REG-DII-EXC", "Exchange in Operation", False, False, "The exchange runs in production within its thresholds under the agreement; volumes, latency and delivery are monitored.", "Volumes, speed of delivery and latency remain within the thresholds; the agreement remains in force.", ["process:4", "metric:Data volumes and speed of delivery", "metric:Data Latency"]),
    ("STS-EXC-08", "REG-DII-EXC", "Alert Raised", False, False, "A complex event processing threshold is breached (latency, volume, failure, rule compliance); the exchange continues under alert while the cause is investigated.", "The alert, its threshold, owner and DG issue reference remain explicit.", ["process:3.4", "process:4", "deliverable:Complex Event Processing Thresholds and Alerts"]),
    ("STS-EXC-09", "REG-DII-EXC", "Suspended Exchange", False, False, "The exchange is stopped (unresolved alert, agreement lapse, security or regulatory cause); consumers receive no data until resumed.", "The suspension cause and the conditions for resumption remain explicit.", ["process:4"]),
    ("STS-EXC-10", "REG-DII-EXC", "Retired Exchange", False, False, "The exchange is decommissioned; its specification, agreement and lineage are retained for the record.", "The retirement record and retained lineage remain retrievable.", ["process:4"]),
    ("STS-DSV-01", "REG-DII-DSV", "No Data Service", True, False, "No data service exists for the consumer need.", "The unmet need remains visible.", ["inputs:Data Needs and Standards"]),
    ("STS-DSV-02", "REG-DII-DSV", "Designed Data Service", False, False, "The service is designed as a solution component (interface contract, shared model, security) to the architecture.", "The design remains consistent with the shared models and interface standards.", ["process:2.1", "techniques:Service Oriented Architecture (SOA)"]),
    ("STS-DSV-03", "REG-DII-DSV", "Developed Data Service", False, False, "The service is developed and tested and awaits publication.", "Test results remain recorded against the interface contract.", ["process:3.1", "deliverable:Data Services"]),
    ("STS-DSV-04", "REG-DII-DSV", "Published Data Service", False, False, "The service is published in the service catalogue and in operation; consumers bind to it under access agreements.", "Exactly one current version; consumers resolve the published contract.", ["process:4", "deliverable:Data Services", "metric:Time to Market for Enhancements"]),
    ("STS-DSV-05", "REG-DII-DSV", "Pending Service Version", False, False, "A new version is developed and awaiting release while the current version stays published.", "The pending version's contract differences and effective date remain explicit.", ["process:3.1"]),
    ("STS-DSV-06", "REG-DII-DSV", "Deprecated Data Service", False, False, "The service is marked for withdrawal; existing consumers are migrated to a successor and no new binding is allowed.", "The successor service and the migration deadline remain explicit.", ["process:4"]),
    ("STS-DSV-07", "REG-DII-DSV", "Retired Data Service", False, False, "The service is withdrawn from the catalogue with no consumer bound; its contract is retained.", "The retirement record and retained contract remain retrievable.", ["process:4"]),
]
EVENTS = {
    "EV-DIA-01": ("Integration requirements analysis", "Request"), "EV-DIA-02": ("Architecture design completion", "Evidence trigger"), "EV-DIA-03": ("Architecture approval", "Decision outcome"), "EV-DIA-04": ("Design rejection", "Decision outcome"), "EV-DIA-05": ("Platform activation", "Decision outcome"), "EV-DIA-06": ("Architecture revision trigger", "Monitoring trigger"), "EV-DIA-07": ("Revised architecture approval", "Decision outcome"), "EV-DIA-08": ("Architecture retirement", "Decision outcome"),
    "EV-EXC-01": ("Exchange request", "Request"), "EV-EXC-02": ("Discovery and profiling completion", "Assessment outcome"), "EV-EXC-03": ("Mapping and lineage completion", "Evidence trigger"), "EV-EXC-04": ("Orchestration development completion", "Evidence trigger"), "EV-EXC-05": ("Specification and agreement sign-off", "Decision outcome"), "EV-EXC-06": ("Implementation acceptance", "Decision outcome"), "EV-EXC-07": ("Threshold breach", "Monitoring trigger"), "EV-EXC-08": ("Threshold restored", "Assessment outcome"), "EV-EXC-09": ("Suspension decision", "Decision outcome"), "EV-EXC-10": ("Resumption decision", "Decision outcome"), "EV-EXC-11": ("Exchange retirement", "Decision outcome"), "EV-EXC-12": ("Exchange change request", "Request"), "EV-EXC-13": ("Agreement rejection", "Decision outcome"),
    "EV-DSV-01": ("Service request", "Request"), "EV-DSV-02": ("Service development completion", "Evidence trigger"), "EV-DSV-03": ("Service publication", "Decision outcome"), "EV-DSV-04": ("Service change request", "Request"), "EV-DSV-05": ("Deprecation decision", "Decision outcome"), "EV-DSV-06": ("Service retirement", "Decision outcome"), "EV-DSV-07": ("Service test failure", "Assessment outcome"),
}
DR = {
    "DR-DII-01": ("Approve the DII Architecture and its Interface Standards", "ROLE-PM-DII", "Confirmed 22 Sep 2026 (holder register): Data Integration and Interoperability Practice Manager; drafted as Data Architects"),
    "DR-DII-02": ("Bring into Force, Revise and Retire the DII Architecture", "ROLE-DARCH", "Confirmed 22 Sep 2026 (holder register): Data Architect; drafted as Data Architects"),
    "DR-DII-03": ("Define, Profile and Map an Exchange", "ROLE-BA", "Confirmed 22 Sep 2026 (holder register): Business Analyst; drafted as Business and Data Analysts"),
    "DR-DII-04": ("Orchestrate, Accept and Change an Exchange", "ROLE-DENG", "Confirmed 22 Sep 2026 (holder register): Data Engineer; drafted as ETL, Service, Interface Developers"),
    "DR-DII-05": ("Agree and Retire an Exchange (Specification and Access Agreement)", "ROLE-TDS", "Confirmed 22 Sep 2026 (holder register): Technical Data Steward; drafted as Data Stewards"),
    "DR-DII-06": ("Raise and Clear Alerts, Suspend and Resume an Exchange", "ROLE-DENG", "Confirmed 22 Sep 2026 (holder register): Data Engineer; drafted as ETL, Service, Interface Developers"),
    "DR-DII-07": ("Design, Publish, Version, Deprecate and Retire a Data Service", "ROLE-DARCH", "Confirmed 22 Sep 2026 (holder register): Data Architect; drafted as Data Architects"),
}
ROLES = [
    ("ROLE-DII-S01", "Data Producers", "Supplier", "Supply source data."), ("ROLE-DII-S02", "IT Steering Committee", "Supplier", "Supplies priorities and platform direction."), ("ROLE-DII-S03", "Executives and Managers", "Supplier", "Supply business goals and strategies."), ("ROLE-DII-S04", "Subject Matter Experts", "Supplier", "Supply data semantics and business rules."),
    ("ROLE-DII-P01", "Data Architects", "Participant", "Design and approve the DII architecture; design and govern data services."), ("ROLE-DII-P02", "Business and Data Analysts", "Participant", "Define requirements; discover, profile and map."), ("ROLE-DII-P03", "Data Modelers", "Participant", "Model shared formats and mappings."), ("ROLE-DII-P04", "Data Stewards", "Participant", "Agree specifications and access agreements; examine rule compliance."), ("ROLE-DII-P05", "ETL, Service, Interface Developers", "Participant", "Develop and operate orchestration, services and event processing."), ("ROLE-DII-P06", "Project and Program Managers", "Participant", "Plan and deliver DII solutions."),
    ("ROLE-DII-C01", "Information Consumers", "Consumer", "Consume data through exchanges and services."), ("ROLE-DII-C02", "Knowledge Workers", "Consumer", "Consume integrated data."), ("ROLE-DII-C03", "Managers and Executives", "Consumer", "Consume delivery, latency and value metrics."),
]
TRANS = [
    ("TR-DIA-01", "Analyse Integration Requirements", "STS-DIA-01", "STS-DIA-02", "EV-DIA-01", "Business goals, data needs, regulatory requirements and the architectures are available as inputs.", "DR-DII-02", ["SVC-DII-01"], ["ACT-DII-1", "ACT-DII-1.1"]),
    ("TR-DIA-02", "Design DII Architecture", "STS-DIA-02", "STS-DIA-03", "EV-DIA-02", "Patterns, platforms and interface standards are designed within the data architecture in force.", "DR-DII-02", ["SVC-DII-01"], ["ACT-DII-2", "ACT-DII-2.1"]),
    ("TR-DIA-03", "Approve DII Architecture", "STS-DIA-03", "STS-DIA-04", "EV-DIA-03", "The architecture is approved and its interface standards approved as governing instruments.", "DR-DII-01", ["SVC-DII-01"], ["ACT-DII-2"]),
    ("TR-DIA-04", "Return Architecture Design", "STS-DIA-03", "STS-DIA-02", "EV-DIA-04", "The design is rejected with recorded reasons.", "DR-DII-01", ["SVC-DII-01"], ["ACT-DII-2"]),
    ("TR-DIA-05", "Bring DII Architecture into Force", "STS-DIA-04", "STS-DIA-05", "EV-DIA-05", "The platforms are in service and the standards published to the developers.", "DR-DII-02", ["SVC-DII-01"], ["ACT-DII-4"]),
    ("TR-DIA-06", "Open Architecture Revision", "STS-DIA-05", "STS-DIA-06", "EV-DIA-06", "A platform, pattern or regulatory trigger is recorded; the architecture in force is retained meanwhile.", "DR-DII-02", ["SVC-DII-01"], ["ACT-DII-1.1"]),
    ("TR-DIA-07", "Approve Revised DII Architecture", "STS-DIA-06", "STS-DIA-05", "EV-DIA-07", "The revised architecture is approved and its platforms in service.", "DR-DII-01", ["SVC-DII-01"], ["ACT-DII-2"]),
    ("TR-DIA-08", "Retire DII Architecture", "STS-DIA-06", "STS-DIA-01", "EV-DIA-08", "No exchange operates and no service is published under the architecture; the retirement is recorded.", "DR-DII-02", ["SVC-DII-01"], ["ACT-DII-4"]),
    ("TR-EXC-01", "Define Exchange Requirements", "STS-EXC-01", "STS-EXC-02", "EV-EXC-01", "A consumer or migration need for the asset is recorded with its format, timeframe, security and lifecycle requirements.", "DR-DII-03", ["SVC-DII-02"], ["ACT-DII-1.1"]),
    ("TR-EXC-02", "Profile Sources", "STS-EXC-02", "STS-EXC-03", "EV-EXC-02", "Source data is discovered and profiled and business rule compliance examined.", "DR-DII-03", ["SVC-DII-03"], ["ACT-DII-1.2", "ACT-DII-1.4", "ACT-DII-1.5"]),
    ("TR-EXC-03", "Map Exchange", "STS-EXC-03", "STS-EXC-04", "EV-EXC-03", "Sources are mapped to targets and the lineage documented in the metadata repository.", "DR-DII-03", ["SVC-DII-04"], ["ACT-DII-1.3", "ACT-DII-2.2"]),
    ("TR-EXC-04", "Orchestrate Exchange", "STS-EXC-04", "STS-EXC-05", "EV-EXC-04", "The orchestration, migration approach where applicable, event thresholds and DII metadata are developed under the architecture in force.", "DR-DII-04", ["SVC-DII-05"], ["ACT-DII-2.3", "ACT-DII-3.2", "ACT-DII-3.3", "ACT-DII-3.4", "ACT-DII-3.5"]),
    ("TR-EXC-05", "Agree Exchange", "STS-EXC-05", "STS-EXC-06", "EV-EXC-05", "The Data Exchange Specification and Data Access Agreement are agreed for classified data with its privacy basis.", "DR-DII-05", ["SVC-DII-06"], ["ACT-DII-2"]),
    ("TR-EXC-06", "Return Exchange for Rework", "STS-EXC-06", "STS-EXC-05", "EV-EXC-13", "The agreement is rejected or withdrawn before acceptance.", "DR-DII-05", ["SVC-DII-06"], ["ACT-DII-2"]),
    ("TR-EXC-07", "Operate Exchange", "STS-EXC-06", "STS-EXC-07", "EV-EXC-06", "Implementation is accepted and monitoring against the thresholds active.", "DR-DII-04", ["SVC-DII-07"], ["ACT-DII-4"]),
    ("TR-EXC-08", "Raise Alert", "STS-EXC-07", "STS-EXC-08", "EV-EXC-07", "A threshold is breached; the alert is raised, a Data Asset issue logged and the assurance trigger emitted.", "DR-DII-06", ["SVC-DII-07"], ["ACT-DII-4"]),
    ("TR-EXC-09", "Clear Alert", "STS-EXC-08", "STS-EXC-07", "EV-EXC-08", "The cause is resolved and the metrics are back within the thresholds.", "DR-DII-06", ["SVC-DII-07"], ["ACT-DII-4"]),
    ("TR-EXC-10", "Suspend Exchange on Alert", "STS-EXC-08", "STS-EXC-09", "EV-EXC-09", "An unresolved alert requires the exchange to stop; the access-suspension trigger is emitted.", "DR-DII-06", ["SVC-DII-07"], ["ACT-DII-4"]),
    ("TR-EXC-11", "Suspend Exchange", "STS-EXC-07", "STS-EXC-09", "EV-EXC-09", "An agreement lapse, security or regulatory cause stops the exchange.", "DR-DII-06", ["SVC-DII-07"], ["ACT-DII-4"]),
    ("TR-EXC-12", "Resume Exchange", "STS-EXC-09", "STS-EXC-07", "EV-EXC-10", "The suspension cause is resolved and the agreement is in force.", "DR-DII-06", ["SVC-DII-07"], ["ACT-DII-4"]),
    ("TR-EXC-13", "Retire Suspended Exchange", "STS-EXC-09", "STS-EXC-10", "EV-EXC-11", "The exchange is decommissioned; specification, agreement and lineage retained.", "DR-DII-05", ["SVC-DII-07"], ["ACT-DII-4"]),
    ("TR-EXC-14", "Retire Exchange", "STS-EXC-07", "STS-EXC-10", "EV-EXC-11", "The exchange completes its purpose (a migration finished, a consumer need ended) and is decommissioned.", "DR-DII-05", ["SVC-DII-07"], ["ACT-DII-4"]),
    ("TR-EXC-15", "Change Exchange", "STS-EXC-07", "STS-EXC-04", "EV-EXC-12", "A change to sources, targets or rules re-opens the mapping; the current exchange keeps running until the change is accepted.", "DR-DII-04", ["SVC-DII-04"], ["ACT-DII-2.2"]),
    ("TR-EXC-16", "Re-establish Exchange", "STS-EXC-10", "STS-EXC-02", "EV-EXC-01", "A retired exchange is needed again and its requirements redefined.", "DR-DII-03", ["SVC-DII-02"], ["ACT-DII-1.1"]),
    ("TR-DSV-01", "Design Data Service", "STS-DSV-01", "STS-DSV-02", "EV-DSV-01", "The service is designed as a solution component to the architecture in force.", "DR-DII-07", ["SVC-DII-08"], ["ACT-DII-2.1"]),
    ("TR-DSV-02", "Develop Data Service", "STS-DSV-02", "STS-DSV-03", "EV-DSV-02", "The service is developed and tested against its contract.", "DR-DII-07", ["SVC-DII-08"], ["ACT-DII-3.1"]),
    ("TR-DSV-03", "Return Data Service for Rework", "STS-DSV-03", "STS-DSV-02", "EV-DSV-07", "Testing fails against the contract.", "DR-DII-07", ["SVC-DII-08"], ["ACT-DII-3.1"]),
    ("TR-DSV-04", "Publish Data Service", "STS-DSV-03", "STS-DSV-04", "EV-DSV-03", "The service is published in the catalogue and in operation.", "DR-DII-07", ["SVC-DII-08"], ["ACT-DII-4"]),
    ("TR-DSV-05", "Version Data Service", "STS-DSV-04", "STS-DSV-05", "EV-DSV-04", "A change request opens a new version; the current version stays published.", "DR-DII-07", ["SVC-DII-08"], ["ACT-DII-3.1"]),
    ("TR-DSV-06", "Release Service Version", "STS-DSV-05", "STS-DSV-04", "EV-DSV-03", "The new version is released and the previous version retained.", "DR-DII-07", ["SVC-DII-08"], ["ACT-DII-4"]),
    ("TR-DSV-07", "Deprecate Data Service", "STS-DSV-04", "STS-DSV-06", "EV-DSV-05", "A successor is named and consumers given a migration deadline.", "DR-DII-07", ["SVC-DII-08"], ["ACT-DII-4"]),
    ("TR-DSV-08", "Reinstate Data Service", "STS-DSV-06", "STS-DSV-04", "EV-DSV-03", "The deprecation is reversed.", "DR-DII-07", ["SVC-DII-08"], ["ACT-DII-4"]),
    ("TR-DSV-09", "Retire Data Service", "STS-DSV-06", "STS-DSV-07", "EV-DSV-06", "No consumer is bound and the service is withdrawn from the catalogue.", "DR-DII-07", ["SVC-DII-08"], ["ACT-DII-4"]),
    ("TR-DSV-10", "Redesign Data Service", "STS-DSV-07", "STS-DSV-02", "EV-DSV-01", "A retired service is needed again and redesigned.", "DR-DII-07", ["SVC-DII-08"], ["ACT-DII-2.1"]),
]
SERVICES = [
    ("SVC-DII-01", "Governance", "DII Requirements and Architecture", "Requirements analysis; architecture design, approval, revision, retirement.", "Data integration and lifecycle requirements; DII Architecture; interface standards."),
    ("SVC-DII-02", "Governance", "Exchange Requirements Definition", "Exchange request; re-establishment.", "Exchange requirements: format, timeframe, latency, security, lifecycle."),
    ("SVC-DII-03", "Assurance", "Data Discovery, Profiling and Business Rule Compliance", "Requirements defined.", "Profiling results; business rule compliance findings."),
    ("SVC-DII-04", "Control", "Lineage and Mapping", "Sources profiled; change request.", "Source-to-target mapping; documented lineage in the metadata repository."),
    ("SVC-DII-05", "Control", "Orchestration and Complex Event Processing Development", "Exchange mapped.", "Data flow orchestration; migration approach; thresholds; DII metadata."),
    ("SVC-DII-06", "Governance", "Exchange Specification and Access Agreement", "Exchange orchestrated.", "Agreed Data Exchange Specification and Data Access Agreement."),
    ("SVC-DII-07", "Control", "Exchange Operation and Monitoring", "Implementation acceptance; threshold breach; suspension; retirement.", "Operating exchange; alerts; volumes, delivery and latency metrics."),
    ("SVC-DII-08", "Control", "Data Service Development and Publication", "Service request; development; publication; versioning; deprecation.", "Designed, developed and published data service; catalogue entry; versions."),
]
ACTS = [
    ("ACT-DII-1", "Plan and Analyze", "1", "Transition-causing", ["REG-DII-DIA"], ["TR-DIA-01"], ["SVC-DII-01"]),
    ("ACT-DII-1.1", "Define data integration and lifecycle requirements", "1.1", "Transition-causing", ["REG-DII-DIA", "REG-DII-EXC"], ["TR-DIA-01", "TR-DIA-06", "TR-EXC-01", "TR-EXC-16"], ["SVC-DII-01", "SVC-DII-02"]),
    ("ACT-DII-1.2", "Perform Data Discovery", "1.2", "Transition-causing", ["REG-DII-EXC"], ["TR-EXC-02"], ["SVC-DII-03"]),
    ("ACT-DII-1.3", "Document Data Lineage", "1.3", "Transition-causing", ["REG-DII-EXC"], ["TR-EXC-03"], ["SVC-DII-04"]),
    ("ACT-DII-1.4", "Profile Data", "1.4", "Transition-causing", ["REG-DII-EXC"], ["TR-EXC-02"], ["SVC-DII-03"]),
    ("ACT-DII-1.5", "Examine Business Rule Compliance", "1.5", "Transition-causing", ["REG-DII-EXC"], ["TR-EXC-02"], ["SVC-DII-03"]),
    ("ACT-DII-2", "Design DII Solutions", "2", "Transition-causing", ["REG-DII-DIA", "REG-DII-EXC"], ["TR-DIA-02", "TR-DIA-03", "TR-DIA-04", "TR-DIA-07", "TR-EXC-05", "TR-EXC-06"], ["SVC-DII-01", "SVC-DII-06"]),
    ("ACT-DII-2.1", "Design Solution Components", "2.1", "Transition-causing", ["REG-DII-DIA", "REG-DII-DSV"], ["TR-DIA-02", "TR-DSV-01", "TR-DSV-10"], ["SVC-DII-01", "SVC-DII-08"]),
    ("ACT-DII-2.2", "Map Sources to Targets", "2.2", "Transition-causing", ["REG-DII-EXC"], ["TR-EXC-03", "TR-EXC-15"], ["SVC-DII-04"]),
    ("ACT-DII-2.3", "Design Data Orchestration", "2.3", "Transition-causing", ["REG-DII-EXC"], ["TR-EXC-04"], ["SVC-DII-05"]),
    ("ACT-DII-3", "Develop DII Solutions", "3", "Transition-causing", ["REG-DII-EXC", "REG-DII-DSV"], ["TR-EXC-04", "TR-DSV-02"], ["SVC-DII-05", "SVC-DII-08"]),
    ("ACT-DII-3.1", "Develop Data Services", "3.1", "Transition-causing", ["REG-DII-DSV"], ["TR-DSV-02", "TR-DSV-03", "TR-DSV-05"], ["SVC-DII-08"]),
    ("ACT-DII-3.2", "Develop Data Flow Orchestration", "3.2", "Transition-causing", ["REG-DII-EXC"], ["TR-EXC-04"], ["SVC-DII-05"]),
    ("ACT-DII-3.3", "Develop Data Migration Approach", "3.3", "Transition-causing", ["REG-DII-EXC"], ["TR-EXC-04"], ["SVC-DII-05"]),
    ("ACT-DII-3.4", "Develop Complex Event Processing", "3.4", "Transition-causing", ["REG-DII-EXC"], ["TR-EXC-04"], ["SVC-DII-05"]),
    ("ACT-DII-3.5", "Maintain DII Metadata", "3.5", "Transition-causing", ["REG-DII-EXC"], ["TR-EXC-04"], ["SVC-DII-05"]),
    ("ACT-DII-4", "Implement and Monitor", "4", "Transition-causing", ["REG-DII-DIA", "REG-DII-EXC", "REG-DII-DSV"], ["TR-DIA-05", "TR-DIA-08", "TR-EXC-07", "TR-EXC-08", "TR-EXC-09", "TR-EXC-10", "TR-EXC-11", "TR-EXC-12", "TR-EXC-13", "TR-EXC-14", "TR-DSV-04", "TR-DSV-06", "TR-DSV-07", "TR-DSV-08", "TR-DSV-09"], ["SVC-DII-07", "SVC-DII-08"]),
]
ARTEFACTS = [
    ("ART-DII-01", "DII Architecture", "STS-DIA-05", "Design DII Solutions", "Evidences DII Architecture in Force."), ("ART-DII-02", "Data Exchange Specifications", "STS-EXC-06", "Design DII Solutions", "Evidences Agreed Exchange; cited by Global release and transfer."), ("ART-DII-03", "Data Access Agreements", "STS-EXC-06", "Design DII Solutions", "Evidences Agreed Exchange; cited by Global release."), ("ART-DII-04", "Data Services", "STS-DSV-04", "Develop Data Services", "Evidences Published Data Service; cited by Global release."), ("ART-DII-05", "Complex Event Processing Thresholds and Alerts", "STS-EXC-05", "Develop Complex Event Processing", "Evidences Orchestrated Exchange; alerts raised from Exchange in Operation."),
]
CONTRIB = [
    ("CON-DII-01", "TR-AV-01", "guard", {"DSV": ["STS-DSV-04", "STS-DSV-05"], "EXC": ["STS-EXC-07", "STS-EXC-08"]}, "Access delivered through a data service is released only when the service is published and the exchange is in operation under its Data Access Agreement.", "(DII_service_published and DII_exchange_operating) or not DII_exchange_active", "Conditional", "Applies when an exchange is defined for the asset; direct access without an exchange is gated by Data Security and RMD alone."),
    ("CON-DII-02", "TR-AV-04", "guard", {"EXC": ["STS-EXC-07"]}, "Suspended access delivered through an exchange is restored only when the exchange operates again.", "DII_exchange_operating or not DII_exchange_active", "Conditional", ""),
    ("CON-DII-03", "TR-CP-05", "guard", {"EXC": ["STS-EXC-05", "STS-EXC-06", "STS-EXC-07", "STS-EXC-08"]}, "A custody transfer is initiated only over an orchestrated exchange with documented lineage.", "DII_exchange_orchestrated", "Required", "Initiate Custody Transfer cites the exchange specification and lineage."),
    ("CON-DII-04", "TR-CP-04", "guard", {"EXC": ["STS-EXC-06", "STS-EXC-07", "STS-EXC-08"]}, "External custody is entered only over an agreed exchange with documented lineage.", "DII_exchange_agreed", "Required", "Data Architecture and Data Security add the flow and classification guards on the same transition."),
    ("CON-DII-05", "TR-EX-03", "event", {"EXC": ["STS-EXC-10"]}, "A completed migration exchange supersedes the source asset by its target.", "DII_exchange_retired", "Conditional", "DII emits EV-EX-03 when TR-EXC-14 retires a migration exchange (activity 3.3)."),
    ("CON-DII-06", "TR-AS-05", "event", {"EXC": ["STS-EXC-08", "STS-EXC-09"]}, "An exchange alert or suspension is a material change affecting the assurance claim.", "DII_exchange_alert or DII_exchange_suspended", "Conditional", "DII emits EV-AS-05 when TR-EXC-08, TR-EXC-10 or TR-EXC-11 fires."),
    ("CON-DII-07", "TR-AV-03", "event", {"EXC": ["STS-EXC-09"]}, "A suspended exchange suspends the access it delivers.", "DII_exchange_suspended", "Conditional", "DII emits EV-AV-03 when TR-EXC-10 or TR-EXC-11 fires."),
    ("CON-DII-08", "TR-AS-02", "service", {"EXC": ["STS-EXC-03", "STS-EXC-04", "STS-EXC-05", "STS-EXC-06", "STS-EXC-07", "STS-EXC-08"]}, "Data Discovery, Profiling and Business Rule Compliance supplies assurance evidence for the exchanged asset.", "SVC-DII-03", "Conditional", "Assurance service; evidence EVD-DII-02."),
    ("CON-DII-09", "TR-CP-07", "guard", {"EXC": ["STS-EXC-07", "STS-EXC-08"]}, "An external transfer completes only when the transfer package is delivered over an exchange in operation.", "DII_exchange_operating or not DII_exchange_active", "Conditional", "Howard, 22 Sep: the obvious contribution on TR-CP-07."),
    ("CON-DII-10", "TR-CP-09", "guard", {"EXC": ["STS-EXC-01", "STS-EXC-10"]}, "Custody after transfer is closed only when no exchange for the asset remains defined or in operation (the migration exchange is retired).", "not DII_exchange_active", "Conditional", "Howard, 22 Sep: the obvious contribution on TR-CP-09."),
    ("CON-DII-11", "TR-AV-01", "event", {"DSV": ["STS-DSV-04", "STS-DSV-05"], "EXC": ["STS-EXC-07"]}, "A published data service over an exchange in operation is the request to release access through it.", "DII_exchange_active and DII_service_published", "Conditional", "Howard, 23 Sep 2026: eleven Knowledge Areas gated TR-AV-01 and none raised it. Each Knowledge Area that owns an asset kind now raises the release request for the assets of its kind. Data Integration and Interoperability owns the data service; DII emits EV-AV-01 when TR-DSV-04 fires."),
]
KA_COUPLINGS = [
    ("KAC-DII-01", "KA-DA", "TR-EDA-05", "", "DA_architecture_in_force", "The DII architecture is designed within the Enterprise Data Architecture in force and its exchanges are the data flows of the blueprint (TR-DIA-02 and TR-EXC-04 cite the DA fact).", "Reverse coupling: a DII transition cites a DA fact."),
    ("KAC-DII-02", "KA-DS", "TR-CLS-02", "", "DS_classified", "An exchange is agreed only for classified data with its privacy basis; the Data Access Agreement carries the classification (TR-EXC-05 cites DS_classified and DS_privacy_basis_ok).", "Reverse coupling: a DII transition cites DS facts."),
    ("KAC-DII-03", "KA-MM", "TR-AST-02", "", "DII_exchange_mapped", "Documented lineage and DII metadata are recorded as the asset's metadata (the MM transition cites the DII fact).", "Forward coupling: an MM transition cites a DII fact."),
    ("KAC-DII-04", "KA-DQ", "TR-PDCA-02", "", "DII_sources_profiled", "The quality assessment of an exchanged asset cites the exchange's profiling and rule compliance findings (the DQ transition cites the DII fact).", "Forward coupling: a DQ transition cites a DII fact."),
    ("KAC-DII-05", "KA-DG", "TR-ISS-01", "EV-ISS-01", "DII_exchange_alert", "An exchange alert is logged as a Data Asset issue with source Data Integration and Interoperability (TR-EXC-08 emits EV-ISS-01).", "DG owns escalation; DII owns the resolution."),
    ("KAC-DII-06", "KA-RMD", "TR-DOM-05", "", "DII_service_published", "A master data domain's sharing service is published as a data service (the RMD transition cites the DII fact).", "Forward coupling: an RMD transition cites a DII fact."),
    ("KAC-DII-07", "KA-DSO", "TR-STO-06", "", "DII_exchange_orchestrated", "A migration of a stored instance runs over an orchestrated migration exchange (the DSO transition cites the DII fact).", "Forward coupling: a DSO transition cites a DII fact."),
]
FACT_BINDINGS = {
    "DII_architecture_in_force": {"region": "REG-DII-DIA", "states": ["STS-DIA-05", "STS-DIA-06"]},
    "DII_exchange_active": {"region": "REG-DII-EXC", "states": ["STS-EXC-02", "STS-EXC-03", "STS-EXC-04", "STS-EXC-05", "STS-EXC-06", "STS-EXC-07", "STS-EXC-08", "STS-EXC-09"]},
    "DII_sources_profiled": {"region": "REG-DII-EXC", "states": ["STS-EXC-03", "STS-EXC-04", "STS-EXC-05", "STS-EXC-06", "STS-EXC-07", "STS-EXC-08"]},
    "DII_exchange_mapped": {"region": "REG-DII-EXC", "states": ["STS-EXC-04", "STS-EXC-05", "STS-EXC-06", "STS-EXC-07", "STS-EXC-08"]},
    "DII_exchange_orchestrated": {"region": "REG-DII-EXC", "states": ["STS-EXC-05", "STS-EXC-06", "STS-EXC-07", "STS-EXC-08"]},
    "DII_exchange_agreed": {"region": "REG-DII-EXC", "states": ["STS-EXC-06", "STS-EXC-07", "STS-EXC-08"]},
    "DII_exchange_operating": {"region": "REG-DII-EXC", "states": ["STS-EXC-07", "STS-EXC-08"]},
    "DII_exchange_alert": {"region": "REG-DII-EXC", "states": ["STS-EXC-08"]},
    "DII_exchange_suspended": {"region": "REG-DII-EXC", "states": ["STS-EXC-09"]},
    "DII_exchange_retired": {"region": "REG-DII-EXC", "states": ["STS-EXC-10"]},
    "DII_service_published": {"region": "REG-DII-DSV", "states": ["STS-DSV-04", "STS-DSV-05"]},
}
XRG = [
    ("XRG-DII-01", "An exchange is orchestrated only under a DII architecture in force.", ["TR-EXC-04"], "Required", "DIA in ('STS-DIA-05','STS-DIA-06')"),
    ("XRG-DII-02", "A data service is designed and published only under an approved or in-force DII architecture.", ["TR-DSV-01", "TR-DSV-04", "TR-DSV-06", "TR-DSV-10"], "Required", "DIA in ('STS-DIA-04','STS-DIA-05','STS-DIA-06')"),
    ("XRG-DII-03", "An exchange delivered through a data service operates only while the service is published.", ["TR-EXC-07", "TR-EXC-12"], "Required", "DSV in ('STS-DSV-04','STS-DSV-05','STS-DSV-06')"),
    ("XRG-DII-04", "A data service is retired only when no exchange it delivers is in operation.", ["TR-DSV-09"], "Required", "EXC in ('STS-EXC-01','STS-EXC-09','STS-EXC-10')"),
    ("XRG-DII-05", "The DII architecture is retired only when no exchange operates and no service is published.", ["TR-DIA-08"], "Required", "EXC in ('STS-EXC-01','STS-EXC-10') and DSV in ('STS-DSV-01','STS-DSV-07')"),
]
VECTORS = [
    ("CFG-DII-01", "Greenfield", {"REG-DII-DIA": "STS-DIA-01", "REG-DII-EXC": "STS-EXC-01", "REG-DII-DSV": "STS-DSV-01"}, "Initial configuration: no architecture, exchange or service; Global release unaffected (no exchange defined), custody transfer blocked."),
    ("CFG-DII-02", "Exchange agreed, service published", {"REG-DII-DIA": "STS-DIA-05", "REG-DII-EXC": "STS-EXC-06", "REG-DII-DSV": "STS-DSV-04"}, "Legal: external custody and transfer allowed; release through the service waits for implementation acceptance."),
    ("CFG-DII-03", "Exchange in operation", {"REG-DII-DIA": "STS-DIA-05", "REG-DII-EXC": "STS-EXC-07", "REG-DII-DSV": "STS-DSV-04"}, "Legal: all DII contributions satisfied; profiling supplies assurance evidence."),
    ("CFG-DII-04", "Alert raised", {"REG-DII-DIA": "STS-DIA-05", "REG-DII-EXC": "STS-EXC-08", "REG-DII-DSV": "STS-DSV-04"}, "Legal: EV-AS-05 emitted; DG issue logged; the exchange continues under alert."),
    ("CFG-DII-05", "Exchange suspended", {"REG-DII-DIA": "STS-DIA-05", "REG-DII-EXC": "STS-EXC-09", "REG-DII-DSV": "STS-DSV-04"}, "Legal: EV-AV-03 emitted; release and restoration through the exchange blocked."),
    ("CFG-DII-06", "Migration exchange retired", {"REG-DII-DIA": "STS-DIA-05", "REG-DII-EXC": "STS-EXC-10", "REG-DII-DSV": "STS-DSV-04"}, "Legal: EV-EX-03 emitted for a migration exchange; the source asset is superseded by its target."),
]
EVIDENCE = [
    ("EVD-DII-01", "Architecture approval record", "Decision evidence", "TR-DIA-03", "Approved patterns, platforms, interface standards; approving authority."), ("EVD-DII-02", "Profiling and rule compliance report", "Assurance evidence", "TR-EXC-02", "Profiling results; business rule compliance findings."), ("EVD-DII-03", "Lineage record", "Control evidence", "TR-EXC-03", "Source-to-target mapping; documented lineage."), ("EVD-DII-04", "Orchestration and threshold record", "Control evidence", "TR-EXC-04", "Orchestration design; thresholds; DII metadata."), ("EVD-DII-05", "Exchange specification and access agreement", "Governance evidence", "TR-EXC-05", "Agreed specification; agreement parties, conditions, classification."), ("EVD-DII-06", "Implementation acceptance", "Decision evidence", "TR-EXC-07", "Acceptance test; monitoring activation."), ("EVD-DII-07", "Alert record", "Control evidence", "TR-EXC-08", "Threshold, breach, owner, DG issue reference, resolution."), ("EVD-DII-08", "Suspension record", "Control evidence", "TR-EXC-11", "Cause, conditions for resumption."), ("EVD-DII-09", "Service publication record", "Control evidence", "TR-DSV-04", "Catalogue entry, contract version."), ("EVD-DII-10", "Exchange retirement record", "Control evidence", "TR-EXC-14", "Reason; retained specification, agreement and lineage; migration completion where applicable."),
]
EXC = [("EXC-DII-01", "Interim Exchange", "TR-AV-01", "Release through a data service over an orchestrated exchange whose Data Access Agreement is not yet signed.", "DR-DII-05", "Exchange orchestrated, agreement drafted with a signature date, consumer accepts the interim conditions, Data Security classification and privacy basis confirmed, DG informed, evidence retained; expires at the signature date.", "Draft / Approved / Expired / Closed")]

# Coupling roles (Howard, 24 Sep 2026, Influence Map Register card 2 option a): each coupling says which Knowledge Area produces
# the fact and which transitions depend on it. kind condition: the twin engine adds the fact as a guard on every dependent
# transition (Required, or Conditional with a qualifier fact that must be true for the guard to apply). kind event: the
# emitter transitions raise the event in the target Knowledge Area (effect resolve: evidence that resolves the issue the
# named coupling raised). Generated from the coupling text and the fact names, then kept here as the source of truth.
COUPLING_ROLES = {'KAC-DII-01': {'dependents': [{'model': 'KA-DII', 'transition': 'TR-DIA-02'}, {'model': 'KA-DII', 'transition': 'TR-EXC-04'}],
                'kind': 'condition',
                'producer': 'KA-DA',
                'requirement': 'Required'},
 'KAC-DII-02': {'dependents': [{'model': 'KA-DII', 'transition': 'TR-EXC-05'}], 'kind': 'condition', 'producer': 'KA-DS', 'requirement': 'Required'},
 'KAC-DII-03': {'kind': 'citation', 'producer': 'KA-DII', 'cites': {'model': 'KA-MM', 'transition': 'TR-AST-02'}, 'raises': {'model': 'KA-MM', 'event': 'EV-AST-05'}, 'onlyIf': 'MM_asset_described'},
 'KAC-DII-04': {'dependents': [{'model': 'KA-DQ', 'transition': 'TR-PDCA-02'}], 'kind': 'condition', 'producer': 'KA-DII', 'requirement': 'Required'},
 'KAC-DII-05': {'emitters': ['TR-EXC-08'], 'kind': 'event', 'producer': 'KA-DII'},
 'KAC-DII-06': {'dependents': [{'model': 'KA-RMD', 'transition': 'TR-DOM-05'}], 'kind': 'condition', 'producer': 'KA-DII', 'requirement': 'Required'},
 'KAC-DII-07': {'dependents': [{'model': 'KA-DSO', 'transition': 'TR-STO-06'}], 'kind': 'condition', 'producer': 'KA-DII', 'requirement': 'Required'}}

# State Contracts register (Howard, 25 Sep 2026, cards 7 and 8 option a): each transition names the policy controls that govern it, by
# policy domain and control number of the Knowledge Area policy in the FutureState workbooks (the wording and the implementing
# procedure are resolved per organisation from the private catalogue spec/policy_controls.json and the workbooks). Drafted
# 25 Sep 2026 for Howard's review (status Proposed); an empty list means no control of the allowed domains fits the step.
POLICY_CONTROLS = {'TR-DIA-01': {'controls': [], 'why': 'Requirements analysis for the architecture precedes any interface or contract, and no PD-DINT control governs it.'},
 'TR-DIA-02': {'controls': [('PD-DINT', 'C07')], 'why': 'The interface standards designed here define the canonical formats for shared data.'},
 'TR-DIA-03': {'controls': [('PD-DINT', 'C07')], 'why': 'Approving the interface standards agrees the canonical formats for shared data.'},
 'TR-DIA-04': {'controls': [('PD-DINT', 'C07')], 'why': 'Rejecting the design reverses the agreement of the interface standards.'},
 'TR-DIA-05': {'controls': [('PD-DINT', 'C07')], 'why': 'Publishing the standards to developers puts the agreed canonical formats into use.'},
 'TR-DIA-06': {'controls': [('PD-DINT', 'C07')], 'why': 'Revising the architecture reopens the agreed interface standards and formats.'},
 'TR-DIA-07': {'controls': [('PD-DINT', 'C07')], 'why': 'Approving the revised architecture agrees the revised interface standards.'},
 'TR-DIA-08': {'controls': [('PD-DINT', 'C05')], 'why': 'Retirement depends on the interface inventory showing no exchange or service remains.'},
 'TR-EXC-01': {'controls': [], 'why': 'Recording a consumer need precedes any contract or movement, and no PD-DINT control governs it.'},
 'TR-EXC-02': {'controls': [], 'why': 'Source profiling is a data quality activity, and no PD-DINT control governs it.'},
 'TR-EXC-03': {'controls': [('PD-DINT', 'C10')], 'why': 'Mapping documents the lineage of the governed movement.'},
 'TR-EXC-04': {'controls': [('PD-DINT', 'C07'), ('PD-DINT', 'C11')],
               'why': 'Orchestration is built to the agreed formats and sets the thresholds used to monitor movements.'},
 'TR-EXC-05': {'controls': [('PD-DINT', 'C04'), ('PD-DINT', 'C05')],
               'why': 'Agreeing the exchange specification and access agreement is the data contract, recorded in the interface inventory.'},
 'TR-EXC-06': {'controls': [('PD-DINT', 'C04')], 'why': 'Rejecting or withdrawing the agreement reverses the data contract.'},
 'TR-EXC-07': {'controls': [('PD-DINT', 'C11'), ('PD-DINT', 'C09')],
               'why': 'Operation starts movement monitoring and validates payloads against the contract schema.'},
 'TR-EXC-08': {'controls': [('PD-DINT', 'C11'), ('PD-DINT', 'C12')], 'why': 'A threshold breach found by monitoring is alerted for remediation.'},
 'TR-EXC-09': {'controls': [('PD-DINT', 'C12')], 'why': 'Clearing the alert once remediated closes the break.'},
 'TR-EXC-10': {'controls': [('PD-DINT', 'C12')], 'why': 'An unresolved alert escalates to stopping the exchange under the remediation control.'},
 'TR-EXC-11': {'controls': [('PD-DINT', 'C04')], 'why': 'The exchange stops because its data contract has lapsed or may no longer be relied on.'},
 'TR-EXC-12': {'controls': [('PD-DINT', 'C04'), ('PD-DINT', 'C11')], 'why': 'Resuming needs the contract in force and movement monitoring restarted.'},
 'TR-EXC-13': {'controls': [('PD-DINT', 'C05'), ('PD-DINT', 'C10')], 'why': 'Decommissioning updates the interface inventory and keeps the lineage records.'},
 'TR-EXC-14': {'controls': [('PD-DINT', 'C05'), ('PD-DINT', 'C10')], 'why': 'Decommissioning updates the interface inventory and keeps the lineage records.'},
 'TR-EXC-15': {'controls': [('PD-DINT', 'C06'), ('PD-DINT', 'C10')],
               'why': 'A change to sources, targets or rules is a governed interface change that updates lineage.'},
 'TR-EXC-16': {'controls': [], 'why': 'Redefining requirements precedes any contract or movement, and no PD-DINT control governs it.'},
 'TR-DSV-01': {'controls': [('PD-DINT', 'C04')], 'why': 'A data service must be designed as a governed API.'},
 'TR-DSV-02': {'controls': [('PD-DINT', 'C04'), ('PD-DINT', 'C09')], 'why': 'The service is built and tested against its contract schema.'},
 'TR-DSV-03': {'controls': [('PD-DINT', 'C09')], 'why': 'Failing validation against the contract returns the service for rework.'},
 'TR-DSV-04': {'controls': [('PD-DINT', 'C05')], 'why': 'Publishing records the service in the interface inventory and catalogue.'},
 'TR-DSV-05': {'controls': [('PD-DINT', 'C06')], 'why': 'A change request opens a governed new version of the interface.'},
 'TR-DSV-06': {'controls': [('PD-DINT', 'C06')], 'why': 'Releasing the version is a governed interface change.'},
 'TR-DSV-07': {'controls': [('PD-DINT', 'C06')], 'why': 'Deprecation with a successor and deadline is a governed interface change.'},
 'TR-DSV-08': {'controls': [('PD-DINT', 'C06')], 'why': 'Reinstating reverses the deprecation under the same change control.'},
 'TR-DSV-09': {'controls': [('PD-DINT', 'C05')], 'why': 'Withdrawing the service from the catalogue reverses publication in the interface inventory.'},
 'TR-DSV-10': {'controls': [('PD-DINT', 'C04')], 'why': 'Redesigning a retired service is designing a governed API again.'}}

SPEC = {
    "meta": {"modelId": "KA-DII", "name": "Data Integration and Interoperability FTS", "knowledgeArea": "Data Integration and Interoperability", "version": "0.1", "subjectType": KA_SUBJECT,
             "regionModel": "One FTS per managed element: the DII Architecture (scope level), a Data Exchange of a Data Asset (one per flow, with the complex event thresholds and alerts as its monitoring states and the specification and access agreement as its Agreed state) and a Data Service (one per service) run concurrently and are coupled by cross-region constraints, facts and events, never a single subject.",
             "source": SRC_DECK + "; " + SRC_HOWARD + "; " + SRC_PROTOCOL,
             "note": "Three state regions, each its own FTS over one managed element of the Knowledge Area: the DII Architecture, a Data Exchange of a Data Asset and a Data Service. The KA never becomes a region of the Data Asset; the exchange and the service reach the Global protocol through contributions (release and restoration through a service, custody transfer and external custody, supersession by a completed migration, the assurance and access-suspension triggers and the profiling service), and couple to Data Architecture, Data Security, Metadata, DQ, DG, RMD and Data Storage and Operations.",
             "definition": CONTEXT["definition"], "factBindings": FACT_BINDINGS},
    "context": CONTEXT, "regions": REGIONS, "states": STATES, "transitions": TRANS, "events": EVENTS, "decisionRights": DR, "roles": ROLES, "artefacts": ARTEFACTS, "activities": ACTS, "services": SERVICES, "contributions": CONTRIB, "kaCouplings": KA_COUPLINGS, "couplingRoles": COUPLING_ROLES, "policyControls": POLICY_CONTROLS, "crossRegionConstraints": XRG, "stateVectors": VECTORS, "evidence": EVIDENCE, "exceptions": EXC,
    "sources": [
        {"id": "SRC-DII-001", "source": SRC_DECK, "type": "Primary (image pages, captured)", "location": "Chat upload; OneDrive Data Lifecycle folder", "use": "Definition, goals, drivers, inputs, processes and sub-activities, deliverables, role players, techniques, tools, metrics", "limitations": "The context diagram gives the activities and deliverables but no exchange lifecycle; the Data Exchange states follow the activity sequence (define, discover and profile, map and document lineage, orchestrate, agree, implement and monitor) with alert, suspension and retirement drafted from Implement and Monitor and the CEP deliverable."},
        {"id": "SRC-DII-002", "source": SRC_HOWARD, "type": "Design direction", "location": "Chat", "use": "Managed elements (events folded into the exchange), Global gating", "limitations": ""},
        {"id": "SRC-DII-003", "source": SRC_PROTOCOL, "type": "Alignment target", "location": "Private repo models/", "use": "Global transition IDs for contributions; KA transition IDs for couplings", "limitations": ""},
    ],
    "qaNotes": [
        {"severity": "note", "rule": "GA-005", "element": "KA-DII", "finding": "The architecture and the services change rarely relative to an exchange and gate it through XRG-DII-01..05; the Data Exchange is per flow of an asset and is the DII region that gates Global release, transfer, custody and supersession."},
        {"severity": "note", "rule": "capture", "element": "REG-DII-EXC", "finding": "Exchange states follow the activity sequence on the context diagram; Alert Raised and Suspended Exchange fold the Complex Event Processing Thresholds and Alerts deliverable into the exchange (Howard, 21 Sep). For Howard's review."},
        {"severity": "note", "rule": "scope", "element": "CON-DII-01", "finding": "The release guard is Conditional and passes when no exchange is defined for the asset, so direct access not delivered through an exchange stays gated by Data Security and RMD alone."},
        {"severity": "note", "rule": "derived", "element": "STATES", "finding": "All state names, events, decision rights, holders and services are first-pass drafts from the context diagram; every one is for Howard's review."},
    ],
}

if __name__ == "__main__":
    from ka_build import run_spec
    run_spec(SPEC, "data_integration_interoperability.fts.json")
