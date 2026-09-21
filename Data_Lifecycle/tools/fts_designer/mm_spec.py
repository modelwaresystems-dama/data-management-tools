#!/usr/bin/env python3
"""
mm_spec.py  -  Metadata Management FTS v0.1: three state regions, each its own FTS over one managed element of
the Knowledge Area, derived from the DMBOK Metadata context diagram (deck pages 84 to 87) and aligned to the
Global Data Asset Protocol.

Howard's managed elements (21 Sep 2026): 1 the Metadata Programme (strategy, requirements, organisation);
2 the Metadata Architecture and Stores (metamodel, standards, repositories, control process); 3 the Metadata of
a Data Asset, one instance per asset.
Decisions 21 Sep 2026: the Metadata of a Data Asset gates Global registration (described), access release
(published), custody transfer and disposition (lineage and dependencies known) and stale metadata emits the
material-change trigger for Assurance; metadata quality and security are handled by the Data Quality PDCA
cycle and the Data Security FTS (metadata is itself a Data Asset), so this model keeps no quality or security
states and couples to them instead; every transition carries a Decision Right (holders drafted, REVIEW).

Usage: python mm_spec.py [out_dir]   -> metadata_management.fts.json
"""
import json, os, sys
from ka_build import build

SRC_DECK = "DMBOK Data Lifecycle and KA Context Diagrams.pdf, Metadata pages 84 to 87 (What, Why, Activities, Role Players and Technical Drivers)"
SRC_HOWARD = "Howard Diesel, 21 Sep 2026: three Metadata managed elements (Programme; Architecture and Stores; Metadata of a Data Asset), gating of register / release / transfer, quality and security reused from DQ and Data Security"
SRC_PROTOCOL = "global_protocol.fts.json v0.2.1 for the contribution targets; data_governance.fts.json v0.2 and data_quality.fts.json v0.1 for the couplings"

CONTEXT = {
    "knowledgeArea": "Metadata Management",
    "definition": "Planning, implementation, and control activities to enable access to high quality, integrated metadata.",
    "ensures": "Metadata helps an organisation understand its data, systems and workflows. Metadata includes information about: technical and business processes; data rules and constraints; logical and physical data structures; descriptions of the data (databases, data elements, data models); concepts the data represents; relationships between data and concepts.",
    "goals": ["Provide organizational understanding of business terms and usage.", "Collect and integrate metadata from diverse sources.", "Provide a standard way to access metadata.", "Ensure metadata quality and security."],
    "businessDrivers": ["Increase confidence in data by providing context, and measurement of data quality", "Increase value of strategic information (Master data) by enabling multiple uses", "Operational efficiency by identifying redundant data and processes", "Prevent the use of out of date or incorrect data", "Reduce data-oriented research time", "Improve communication between business and IT", "Create accurate impact analysis", "Reduce system development lifecycle time", "Support regulatory compliance"],
    "inputs": ["Business Requirements", "Metadata Issues", "Data Architecture", "Business Metadata", "Technical Metadata", "Process Metadata", "Operational Metadata", "Data Governance Metadata"],
    "processes": [
        {"id": "1", "name": "Define Metadata Strategy", "phase": "P", "subActivities": []},
        {"id": "2", "name": "Understand Metadata Requirements", "phase": "P", "subActivities": ["2.1 Business User Requirements", "2.2 Technical User Requirements"]},
        {"id": "3", "name": "Define Metadata Architecture", "phase": "P", "subActivities": ["3.1 Create MetaModel (D)", "3.2 Apply Metadata Standards (C)", "3.3 Manage Metadata Stores (C)"]},
        {"id": "4", "name": "Create and Maintain Metadata", "phase": "O", "subActivities": ["4.1 Integrate Metadata (O)", "4.2 Distribute and Deliver Metadata (O)"]},
        {"id": "5", "name": "Query, Report and Analyze Metadata", "phase": "O", "subActivities": [], "note": "No phase tag on the slide; (O) inferred (decision 21 Sep 2026)."},
    ],
    "deliverables": ["Metadata Strategy", "Metadata Standards", "Metadata Architecture", "MetaModel", "Unified Metadata", "Metadata Stores", "Data Lineage", "Impact Analysis", "Dependency Analysis", "Metadata Control Process"],
    "suppliers": ["Business Data Stewards", "Data Managers", "Data Governance Bodies", "Data Modelers", "Database Administrators"],
    "participants": ["Data Stewards", "Project Managers", "Data Architects", "Business Analysts", "System Analysts"],
    "consumers": ["Application Developers Analyst", "Data Integrators", "Business Users", "Knowledge Workers", "Customers and Collaborators", "Data Scientists", "Data Journalists"],
    "techniques": ["Data Lineage and Impact Analysis", "Metadata for Big Data Ingest"],
    "tools": ["Metadata Repository Management Tools", "Metadata Repositories in other Tools"],
    "metrics": ["Metadata Coverage Scorecard", "Metadata Repository Contribution", "Metadata Usage Reports", "Metadata Quality Scorecard"],
    "phaseTags": "(P) Planning, (C) Control, (D) Development, (O) Operations",
}

KA_SUBJECT = "Metadata Management Knowledge Area: three managed elements, one FTS (state region) each; the Data Asset is the Global subject reached through contributions"
REGIONS = [
    ("REG-MM-PRG", "Metadata Programme", "PRG", "Whether a metadata strategy with understood business and technical requirements exists, is approved and is operating for the governed scope.", "STS-PRG-01", "Exactly one active state; a revised programme supersedes, never coexists with, the approved one.",
     "Metadata Programme of the governed scope: metadata strategy, business and technical user requirements, programme organisation",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Governing element", "contributesTo": "Governance: the strategy and requirements set which metadata the Global services may cite; no Global transition is gated on the programme directly, it gates the architecture and the per-asset metadata through cross-region constraints.", "conditionsThatMatter": "None; in definition; approved; operating; under revision."}),
    ("REG-MM-ARC", "Metadata Architecture and Stores", "ARC", "Whether the metamodel, metadata standards, repositories and the metadata control process are designed, approved and operating.", "STS-ARC-01", "Exactly one active state; only an operating store can hold the published metadata that a Global guard cites.",
     "Metadata Architecture and Stores of the governed scope: metamodel, metadata standards, metadata repositories and their integration, metadata control process",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Governing element (platform)", "contributesTo": "Existence and Availability indirectly: the operating stores are where described and published metadata live; the control process is the Control service that keeps them current. Metadata standards are governing instruments published under Data Governance.", "conditionsThatMatter": "None; in design; approved; stores operating; under revision."}),
    ("REG-MM-AST", "Metadata of a Data Asset", "AST", "Whether a Data Asset is described (business, technical, process, operational and governance metadata, lineage and dependencies), published for access, stale, or archived.", "STS-AST-01", "Exactly one active state per Data Asset; published metadata is only ever a delivered copy of described metadata held in an operating store.",
     "Metadata of a Data Asset: its business, technical, process, operational and governance metadata, data lineage, impact and dependency analysis, one instance per asset",
     {"instanceScope": "One instance per Data Asset.", "elementKind": "Managed description", "contributesTo": "Existence: registration requires the asset described (TR-EX-01); disposition requires lineage and dependencies known (TR-EX-05, TR-EX-06). Availability: access release requires published metadata (TR-AV-01). Custody: transfer requires lineage and dependencies known (TR-CP-05, TR-CP-06). Assurance: stale metadata is a material-change trigger (TR-AS-05, TR-AS-06); assessment criteria draw on technical metadata (TR-AS-01).", "conditionsThatMatter": "Undescribed; requirements understood; described; published; stale; archived."}),
]
STATES = [
    ("STS-PRG-01", "REG-MM-PRG", "No Metadata Programme", True, False, "No metadata strategy or understood metadata requirements exist for the governed scope.", "The absence of a strategy remains visible to governance bodies.", ["inputs:Business Requirements"]),
    ("STS-PRG-02", "REG-MM-PRG", "Programme Definition", False, False, "The metadata strategy is being defined and business and technical user requirements are being understood.", "Sponsor, scope and requirement sources remain identifiable.", ["process:1", "process:2.1", "process:2.2"]),
    ("STS-PRG-03", "REG-MM-PRG", "Approved Programme", False, False, "The metadata strategy and the requirements it serves are approved.", "The approved strategy, requirements and approving authority remain traceable.", ["deliverable:Metadata Strategy"]),
    ("STS-PRG-04", "REG-MM-PRG", "Operating Programme", False, False, "The programme organisation is staffed and metadata coverage, contribution and usage are measured and reported.", "Coverage, contribution and usage metrics remain current.", ["metric:Metadata Coverage Scorecard", "metric:Metadata Repository Contribution", "metric:Metadata Usage Reports"]),
    ("STS-PRG-05", "REG-MM-PRG", "Programme Revision", False, False, "The strategy or requirements are under revision after a business, architectural or regulatory trigger while the current programme stays in force.", "The programme in force remains valid until the revision is approved.", ["inputs:Metadata Issues"]),
    ("STS-ARC-01", "REG-MM-ARC", "No Metadata Architecture", True, False, "No metamodel, metadata standards or managed metadata store exists for the governed scope.", "The absence of a managed store remains visible.", ["inputs:Data Architecture"]),
    ("STS-ARC-02", "REG-MM-ARC", "Architecture Design", False, False, "The metamodel is being created and metadata standards selected against the approved requirements.", "Design scope, candidate standards and the metamodel draft remain identifiable.", ["process:3.1", "process:3.2"]),
    ("STS-ARC-03", "REG-MM-ARC", "Approved Architecture", False, False, "The metadata architecture, metamodel and standards are approved but the stores are not yet operating.", "Approved architecture, metamodel version and standards remain traceable.", ["deliverable:Metadata Architecture", "deliverable:MetaModel", "deliverable:Metadata Standards"]),
    ("STS-ARC-04", "REG-MM-ARC", "Operating Stores", False, False, "Metadata stores are managed under the metadata control process, integrated across sources and delivering metadata to consumers.", "Store availability, the control process and integration schedules remain in force.", ["process:3.3", "process:4.1", "process:4.2", "deliverable:Metadata Stores", "deliverable:Metadata Control Process", "deliverable:Unified Metadata"]),
    ("STS-ARC-05", "REG-MM-ARC", "Architecture Revision", False, False, "The metamodel, standards or stores are under revision while the operating stores stay in service.", "Stores in service remain valid until the revised architecture is approved.", ["process:3.1", "process:3.2"]),
    ("STS-AST-01", "REG-MM-AST", "Undescribed Asset", True, False, "The Data Asset has no metadata on record beyond its identity.", "The absence of a description remains visible on the asset record.", ["inputs:Business Metadata", "inputs:Technical Metadata"]),
    ("STS-AST-02", "REG-MM-AST", "Understood Requirements", False, False, "The business and technical metadata requirements for the Data Asset are understood and the metadata to be captured is scoped.", "The requirement owners and the metadata scope remain identifiable.", ["process:2.1", "process:2.2"]),
    ("STS-AST-03", "REG-MM-AST", "Described Asset", False, False, "Business, technical, process, operational and governance metadata for the Data Asset are created and integrated in the operating store, with lineage and dependencies captured.", "The description, its sources, lineage and dependency records remain current and integrated.", ["process:4.1", "deliverable:Unified Metadata", "deliverable:Data Lineage", "deliverable:Dependency Analysis"]),
    ("STS-AST-04", "REG-MM-AST", "Published Metadata", False, False, "The description is distributed and delivered to consumers through the standard access path and supports impact analysis.", "Published metadata matches the described metadata; access path and usage remain monitored.", ["process:4.2", "process:5", "deliverable:Impact Analysis", "techniques:Data Lineage and Impact Analysis"]),
    ("STS-AST-05", "REG-MM-AST", "Stale Metadata", False, False, "A source, structure, process or rule change means the description no longer matches the Data Asset; the published metadata is flagged until refreshed.", "The change that invalidated the description and the refresh due date remain explicit.", ["inputs:Metadata Issues", "metric:Metadata Quality Scorecard"]),
    ("STS-AST-06", "REG-MM-AST", "Archived Metadata", False, True, "The Data Asset has been destroyed or its custody closed; its description is retained as a record and no longer published.", "The archived description remains retrievable for evidence and lineage of surviving assets.", ["deliverable:Data Lineage"]),
]
EVENTS = {
    "EV-PRG-01": ("Strategy initiation", "Request"), "EV-PRG-02": ("Strategy and requirements approval", "Decision outcome"), "EV-PRG-03": ("Programme activation", "Decision outcome"), "EV-PRG-04": ("Programme revision trigger", "Monitoring trigger"), "EV-PRG-05": ("Revised strategy approval", "Decision outcome"), "EV-PRG-06": ("Programme retirement", "Decision outcome"),
    "EV-ARC-01": ("Architecture design initiation", "Request"), "EV-ARC-02": ("Architecture approval", "Decision outcome"), "EV-ARC-03": ("Store activation", "Decision outcome"), "EV-ARC-04": ("Architecture revision trigger", "Monitoring trigger"), "EV-ARC-05": ("Revised architecture approval", "Decision outcome"), "EV-ARC-06": ("Architecture retirement", "Decision outcome"),
    "EV-AST-01": ("Data Asset brought into metadata scope", "Request"), "EV-AST-02": ("Metadata requirements agreed", "Decision outcome"), "EV-AST-03": ("Metadata integrated", "Evidence trigger"), "EV-AST-04": ("Metadata publication", "Decision outcome"), "EV-AST-05": ("Source or structure change detected", "Monitoring trigger"), "EV-AST-06": ("Metadata refresh completed", "Evidence trigger"), "EV-AST-07": ("Publication withdrawal", "Decision outcome"), "EV-AST-08": ("Data Asset destroyed or custody closed", "Monitoring trigger"),
}
DR = {
    "DR-MM-01": ("Approve Metadata Strategy and Requirements", "ROLE-MM-S03", "REVIEW: drafted holder"),
    "DR-MM-02": ("Activate, Revise and Retire the Programme", "ROLE-MM-S02", "REVIEW: drafted holder"),
    "DR-MM-03": ("Approve Metadata Architecture, Metamodel and Standards", "ROLE-MM-P03", "REVIEW: drafted holder"),
    "DR-MM-04": ("Activate, Revise and Retire Metadata Stores", "ROLE-MM-S02", "REVIEW: drafted holder"),
    "DR-MM-05": ("Bring a Data Asset into Metadata Scope and Agree its Requirements", "ROLE-MM-S01", "REVIEW: drafted holder"),
    "DR-MM-06": ("Accept Integrated Metadata and Authorize Publication", "ROLE-MM-P01", "REVIEW: drafted holder"),
    "DR-MM-07": ("Declare Metadata Stale, Refreshed or Archived", "ROLE-MM-P01", "REVIEW: drafted holder"),
}
ROLES = [
    ("ROLE-MM-S01", "Business Data Stewards", "Supplier", "Supply business metadata and requirements."), ("ROLE-MM-S02", "Data Managers", "Supplier", "Sponsor the programme and stores."), ("ROLE-MM-S03", "Data Governance Bodies", "Supplier", "Supply governance metadata; approve strategy and standards."), ("ROLE-MM-S04", "Data Modelers", "Supplier", "Supply logical and physical structures."), ("ROLE-MM-S05", "Database Administrators", "Supplier", "Supply technical and operational metadata."),
    ("ROLE-MM-P01", "Data Stewards", "Participant", "Create, maintain and accept metadata; declare staleness."), ("ROLE-MM-P02", "Project Managers", "Participant", "Plan metadata delivery in projects."), ("ROLE-MM-P03", "Data Architects", "Participant", "Design the architecture and metamodel."), ("ROLE-MM-P04", "Business Analysts", "Participant", "Capture business user requirements."), ("ROLE-MM-P05", "System Analysts", "Participant", "Capture technical user requirements."),
    ("ROLE-MM-C01", "Application Developers Analyst", "Consumer", "Consume technical metadata."), ("ROLE-MM-C02", "Data Integrators", "Consumer", "Consume lineage and structures."), ("ROLE-MM-C03", "Business Users", "Consumer", "Consume business metadata."), ("ROLE-MM-C04", "Knowledge Workers", "Consumer", "Consume published metadata."), ("ROLE-MM-C05", "Customers and Collaborators", "Consumer", "Consume shared metadata."), ("ROLE-MM-C06", "Data Scientists", "Consumer", "Consume lineage and quality context."), ("ROLE-MM-C07", "Data Journalists", "Consumer", "Consume published metadata."),
]
TRANS = [
    ("TR-PRG-01", "Define Strategy", "STS-PRG-01", "STS-PRG-02", "EV-PRG-01", "A sponsor exists; business requirements, data architecture and metadata issues are available as inputs.", "DR-MM-01", ["SVC-MM-01"], ["ACT-MM-1", "ACT-MM-2.1", "ACT-MM-2.2"]),
    ("TR-PRG-02", "Approve Strategy and Requirements", "STS-PRG-02", "STS-PRG-03", "EV-PRG-02", "The strategy and the business and technical requirements it serves are approved.", "DR-MM-01", ["SVC-MM-01"], ["ACT-MM-1"]),
    ("TR-PRG-03", "Operate Programme", "STS-PRG-03", "STS-PRG-04", "EV-PRG-03", "Programme roles are staffed and coverage, contribution and usage reporting is in place.", "DR-MM-02", ["SVC-MM-07"], ["ACT-MM-5"]),
    ("TR-PRG-04", "Revise Programme", "STS-PRG-04", "STS-PRG-05", "EV-PRG-04", "A business, architectural or regulatory trigger is recorded; the programme in force is retained meanwhile.", "DR-MM-02", ["SVC-MM-01"], ["ACT-MM-1"]),
    ("TR-PRG-05", "Approve Revised Strategy", "STS-PRG-05", "STS-PRG-03", "EV-PRG-05", "The revised strategy or requirements are approved.", "DR-MM-01", ["SVC-MM-01"], ["ACT-MM-1"]),
    ("TR-PRG-06", "Retire Programme", "STS-PRG-05", "STS-PRG-01", "EV-PRG-06", "The programme is retired without replacement and the retirement is recorded.", "DR-MM-02", ["SVC-MM-01"], ["ACT-MM-1"]),
    ("TR-ARC-01", "Design Architecture", "STS-ARC-01", "STS-ARC-02", "EV-ARC-01", "An approved programme and data architecture inputs exist.", "DR-MM-03", ["SVC-MM-02"], ["ACT-MM-3.1", "ACT-MM-3.2"]),
    ("TR-ARC-02", "Approve Architecture", "STS-ARC-02", "STS-ARC-03", "EV-ARC-02", "The metamodel, standards and store design are approved.", "DR-MM-03", ["SVC-MM-02"], ["ACT-MM-3.1", "ACT-MM-3.2"]),
    ("TR-ARC-03", "Activate Stores", "STS-ARC-03", "STS-ARC-04", "EV-ARC-03", "Repositories are in service, integration runs and the metadata control process is in force.", "DR-MM-04", ["SVC-MM-03", "SVC-MM-04"], ["ACT-MM-3.3", "ACT-MM-4.1"]),
    ("TR-ARC-04", "Revise Architecture", "STS-ARC-04", "STS-ARC-05", "EV-ARC-04", "A metamodel, standards or store change is required; stores stay in service meanwhile.", "DR-MM-04", ["SVC-MM-02"], ["ACT-MM-3.1", "ACT-MM-3.2"]),
    ("TR-ARC-05", "Approve Revised Architecture", "STS-ARC-05", "STS-ARC-03", "EV-ARC-05", "The revised metamodel, standards or store design is approved.", "DR-MM-03", ["SVC-MM-02"], ["ACT-MM-3.1"]),
    ("TR-ARC-06", "Retire Architecture", "STS-ARC-05", "STS-ARC-01", "EV-ARC-06", "Stores are decommissioned with their metadata archived and the retirement is recorded.", "DR-MM-04", ["SVC-MM-03"], ["ACT-MM-3.3"]),
    ("TR-AST-01", "Scope Metadata Requirements", "STS-AST-01", "STS-AST-02", "EV-AST-01", "The Data Asset is in the programme's scope and a steward is assigned.", "DR-MM-05", ["SVC-MM-05"], ["ACT-MM-2.1", "ACT-MM-2.2"]),
    ("TR-AST-02", "Describe Asset", "STS-AST-02", "STS-AST-03", "EV-AST-03", "Metadata is created and integrated in an operating store against the metamodel; lineage and dependencies are captured.", "DR-MM-06", ["SVC-MM-04", "SVC-MM-05"], ["ACT-MM-4.1"]),
    ("TR-AST-03", "Publish Metadata", "STS-AST-03", "STS-AST-04", "EV-AST-04", "The description is accepted and delivered through the standard access path.", "DR-MM-06", ["SVC-MM-06"], ["ACT-MM-4.2"]),
    ("TR-AST-04", "Flag Stale Metadata", "STS-AST-04", "STS-AST-05", "EV-AST-05", "A source, structure, process or rule change is detected by the control process or reported as a metadata issue.", "DR-MM-07", ["SVC-MM-03"], ["ACT-MM-3.3", "ACT-MM-5"]),
    ("TR-AST-05", "Refresh Metadata", "STS-AST-05", "STS-AST-03", "EV-AST-06", "The description is re-integrated and lineage re-verified.", "DR-MM-07", ["SVC-MM-04"], ["ACT-MM-4.1"]),
    ("TR-AST-06", "Withdraw Publication", "STS-AST-04", "STS-AST-03", "EV-AST-07", "Publication is withdrawn (for example on access withdrawal) while the description is retained.", "DR-MM-06", ["SVC-MM-06"], ["ACT-MM-4.2"]),
    ("TR-AST-07", "Flag Described Asset Stale", "STS-AST-03", "STS-AST-05", "EV-AST-05", "A change invalidates a description that is not yet published.", "DR-MM-07", ["SVC-MM-03"], ["ACT-MM-3.3"]),
    ("TR-AST-08", "Archive Metadata after Destruction", "STS-AST-04", "STS-AST-06", "EV-AST-08", "The Data Asset is destroyed or its custody closed; the description is retained and publication ends.", "DR-MM-07", ["SVC-MM-03"], ["ACT-MM-3.3"]),
    ("TR-AST-09", "Archive Described Asset", "STS-AST-03", "STS-AST-06", "EV-AST-08", "The Data Asset is destroyed or its custody closed before publication.", "DR-MM-07", ["SVC-MM-03"], ["ACT-MM-3.3"]),
    ("TR-AST-10", "Archive Stale Asset", "STS-AST-05", "STS-AST-06", "EV-AST-08", "The Data Asset is destroyed or its custody closed while its description is stale.", "DR-MM-07", ["SVC-MM-03"], ["ACT-MM-3.3"]),
]
SERVICES = [
    ("SVC-MM-01", "Governance", "Metadata Strategy and Requirements Definition", "Programme initiation or revision.", "Approved metadata strategy; business and technical requirements."),
    ("SVC-MM-02", "Governance", "Metadata Architecture Definition", "Architecture design or revision.", "Approved architecture, metamodel and metadata standards."),
    ("SVC-MM-03", "Control", "Metadata Control Process", "Operating stores.", "Change detection; staleness flags; archive on destruction; store management."),
    ("SVC-MM-04", "Control", "Metadata Integration", "Store activation; asset description; refresh.", "Unified metadata; lineage and dependency records."),
    ("SVC-MM-05", "Governance", "Asset Metadata Requirements", "Data Asset in metadata scope.", "Scoped metadata requirements for the asset."),
    ("SVC-MM-06", "Control", "Metadata Distribution and Delivery", "Description accepted.", "Published metadata on the standard access path; impact analysis available."),
    ("SVC-MM-07", "Assurance", "Metadata Coverage and Usage Reporting", "Operating programme.", "Coverage scorecard; contribution and usage reports."),
]
ACTS = [
    ("ACT-MM-1", "Define Metadata Strategy", "1", "Transition-causing", ["REG-MM-PRG"], ["TR-PRG-01", "TR-PRG-02", "TR-PRG-04", "TR-PRG-05", "TR-PRG-06"], ["SVC-MM-01"]),
    ("ACT-MM-2.1", "Business User Requirements", "2.1", "Transition-supporting", ["REG-MM-PRG", "REG-MM-AST"], ["TR-PRG-01", "TR-AST-01"], ["SVC-MM-01", "SVC-MM-05"]),
    ("ACT-MM-2.2", "Technical User Requirements", "2.2", "Transition-supporting", ["REG-MM-PRG", "REG-MM-AST"], ["TR-PRG-01", "TR-AST-01"], ["SVC-MM-01", "SVC-MM-05"]),
    ("ACT-MM-3.1", "Create MetaModel", "3.1", "Transition-causing", ["REG-MM-ARC"], ["TR-ARC-01", "TR-ARC-02", "TR-ARC-04", "TR-ARC-05"], ["SVC-MM-02"]),
    ("ACT-MM-3.2", "Apply Metadata Standards", "3.2", "Transition-supporting", ["REG-MM-ARC"], ["TR-ARC-01", "TR-ARC-02", "TR-ARC-04"], ["SVC-MM-02"]),
    ("ACT-MM-3.3", "Manage Metadata Stores", "3.3", "Transition-causing", ["REG-MM-ARC", "REG-MM-AST"], ["TR-ARC-03", "TR-ARC-06", "TR-AST-04", "TR-AST-07", "TR-AST-08", "TR-AST-09", "TR-AST-10"], ["SVC-MM-03"]),
    ("ACT-MM-4.1", "Integrate Metadata", "4.1", "Transition-causing", ["REG-MM-ARC", "REG-MM-AST"], ["TR-ARC-03", "TR-AST-02", "TR-AST-05"], ["SVC-MM-04"]),
    ("ACT-MM-4.2", "Distribute and Deliver Metadata", "4.2", "Transition-causing", ["REG-MM-AST"], ["TR-AST-03", "TR-AST-06"], ["SVC-MM-06"]),
    ("ACT-MM-5", "Query, Report and Analyze Metadata", "5", "State-preserving", ["REG-MM-PRG", "REG-MM-AST"], ["TR-PRG-03", "TR-AST-04"], ["SVC-MM-07"]),
]
ARTEFACTS = [
    ("ART-MM-01", "Metadata Strategy", "STS-PRG-03", "Define Metadata Strategy", "Evidences Approved Programme."), ("ART-MM-02", "Metadata Standards", "STS-ARC-03", "Apply Metadata Standards", "Governing instrument published under Data Governance."), ("ART-MM-03", "Metadata Architecture", "STS-ARC-03", "Create MetaModel", "Evidences Approved Architecture."), ("ART-MM-04", "MetaModel", "STS-ARC-03", "Create MetaModel", "Evidences Approved Architecture."), ("ART-MM-05", "Unified Metadata", "STS-AST-03", "Integrate Metadata", "Evidences Described Asset."), ("ART-MM-06", "Metadata Stores", "STS-ARC-04", "Manage Metadata Stores", "Evidences Operating Stores."), ("ART-MM-07", "Data Lineage", "STS-AST-03", "Integrate Metadata", "Cited by custody transfer and disposition."), ("ART-MM-08", "Impact Analysis", "STS-AST-04", "Query, Report and Analyze Metadata", "Available from published metadata."), ("ART-MM-09", "Dependency Analysis", "STS-AST-03", "Integrate Metadata", "Cited by disposition."), ("ART-MM-10", "Metadata Control Process", "STS-ARC-04", "Manage Metadata Stores", "Control service SVC-MM-03."),
]
CONTRIB = [
    ("CON-MM-01", "TR-EX-01", "guard", {"AST": ["STS-AST-03", "STS-AST-04"]}, "A Data Asset can be registered only when it is described: business and technical metadata on record in an operating store.", "MM_asset_described", "Required", "Register Asset cites the description (GA-001 identity and context)."),
    ("CON-MM-02", "TR-AV-01", "guard", {"AST": ["STS-AST-04"]}, "Access is released only when the asset's metadata is published on the standard access path.", "MM_metadata_published", "Required", "Consumers need the published description to use the asset correctly."),
    ("CON-MM-03", "TR-CP-05", "guard", {"AST": ["STS-AST-03", "STS-AST-04"]}, "Custody transfer requires lineage and dependencies known.", "MM_lineage_known", "Required", ""),
    ("CON-MM-04", "TR-CP-06", "guard", {"AST": ["STS-AST-03", "STS-AST-04"]}, "Preserved transfer requires lineage and dependencies known.", "MM_lineage_known", "Required", ""),
    ("CON-MM-05", "TR-EX-05", "guard", {"AST": ["STS-AST-03", "STS-AST-04"]}, "Destruction requires dependency analysis: no surviving asset depends on this one without a recorded successor.", "MM_lineage_known", "Required", "Dependency Analysis deliverable."),
    ("CON-MM-06", "TR-EX-06", "guard", {"AST": ["STS-AST-03", "STS-AST-04"]}, "Destruction of a superseded asset requires dependency analysis.", "MM_lineage_known", "Required", ""),
    ("CON-MM-07", "TR-AS-05", "event", {"AST": ["STS-AST-05"]}, "Stale metadata is a material change affecting the assurance claim.", "MM_metadata_stale", "Conditional", "MM emits EV-AS-05 when TR-AST-04 fires."),
    ("CON-MM-08", "TR-AS-06", "event", {"AST": ["STS-AST-05"]}, "Stale metadata breaches a condition of conditional assurance.", "MM_metadata_stale", "Conditional", "MM emits EV-AS-05 when TR-AST-04 fires."),
    ("CON-MM-09", "TR-AS-01", "guard", {"AST": ["STS-AST-03", "STS-AST-04"]}, "Assessment criteria draw on the asset's technical and business metadata.", "MM_asset_described", "Conditional", "Conditional: assessment may proceed on partial description with the gap recorded."),
    ("CON-MM-10", "TR-EX-05", "service", {"AST": ["STS-AST-04"]}, "Impact analysis from published metadata informs the disposition decision.", "SVC-MM-06", "Conditional", "Control service; artefact ART-MM-08."),
]
KA_COUPLINGS = [
    ("KAC-MM-01", "KA-DQ", "TR-PDCA-01", "EV-PDCA-01", "MM_metadata_published", "Metadata is itself a Data Asset: the metadata of the governed scope enters the Data Quality PDCA cycle (metadata quality scorecard), so this model keeps no quality states.", "Decision 21 Sep 2026: reuse the DQ FTS."),
    ("KAC-MM-02", "KA-DQ", "TR-PDCA-01", "", "MM_metadata_published", "The DQ cycle's inputs Business Metadata, Technical Metadata and Data Lineage are available for a Data Asset only when its metadata is published.", "Reverse coupling: a DQ transition cites an MM fact."),
    ("KAC-MM-03", "KA-DG", "TR-ISS-01", "EV-ISS-01", "MM_metadata_stale", "A metadata issue (input Metadata Issues) is logged as a Data Asset issue in the Data Governance issue FTS with source Metadata Management.", "DG owns escalation; MM owns the refresh."),
    ("KAC-MM-04", "KA-DG", "TR-POL-03", "", "DG_instruments_in_force", "Metadata Standards are governing instruments: their publication is a Data Governance instrument publication (TR-POL-03), which TR-ARC-03 cites.", "Reverse coupling: an MM transition cites a DG fact."),
    ("KAC-MM-05", "KA-DS", "TR-AST-03", "", "DS_protected", "Protection of metadata stores and of published metadata (goal 4, security) is handled by the Data Security FTS: publication (TR-AST-03) cites the asset's protection, and the classification attribute is part of the description (see KAC-DS-04, KAC-DS-05).", "Reverse coupling: an MM transition cites a DS fact."),
]
FACT_BINDINGS = {
    "MM_programme_operating": {"region": "REG-MM-PRG", "states": ["STS-PRG-04", "STS-PRG-05"]},
    "MM_stores_operating": {"region": "REG-MM-ARC", "states": ["STS-ARC-04", "STS-ARC-05"]},
    "MM_asset_described": {"region": "REG-MM-AST", "states": ["STS-AST-03", "STS-AST-04"]},
    "MM_metadata_published": {"region": "REG-MM-AST", "states": ["STS-AST-04"]},
    "MM_lineage_known": {"region": "REG-MM-AST", "states": ["STS-AST-03", "STS-AST-04"]},
    "MM_metadata_stale": {"region": "REG-MM-AST", "states": ["STS-AST-05"]},
}
XRG = [
    ("XRG-MM-01", "The architecture is designed only against an approved or operating programme.", ["TR-ARC-01"], "Required", "PRG in ('STS-PRG-03','STS-PRG-04','STS-PRG-05')"),
    ("XRG-MM-02", "A Data Asset can be described only in an operating store.", ["TR-AST-02", "TR-AST-05"], "Required", "ARC in ('STS-ARC-04','STS-ARC-05')"),
    ("XRG-MM-03", "Metadata is published only under an operating programme and operating stores.", ["TR-AST-03"], "Required", "PRG in ('STS-PRG-04','STS-PRG-05') and ARC in ('STS-ARC-04','STS-ARC-05')"),
    ("XRG-MM-04", "The architecture is retired only when no Data Asset holds published metadata in its stores.", ["TR-ARC-06"], "Required", "AST in ('STS-AST-01','STS-AST-06')"),
]
VECTORS = [
    ("CFG-MM-01", "Greenfield", {"REG-MM-PRG": "STS-PRG-01", "REG-MM-ARC": "STS-ARC-01", "REG-MM-AST": "STS-AST-01"}, "Initial configuration: no programme, no stores, asset undescribed; Global registration blocked by CON-MM-01."),
    ("CFG-MM-02", "Platform operating, asset undescribed", {"REG-MM-PRG": "STS-PRG-04", "REG-MM-ARC": "STS-ARC-04", "REG-MM-AST": "STS-AST-01"}, "Legal: programme and stores operating; the asset has no description yet, so registration stays blocked."),
    ("CFG-MM-03", "Described", {"REG-MM-PRG": "STS-PRG-04", "REG-MM-ARC": "STS-ARC-04", "REG-MM-AST": "STS-AST-03"}, "Legal: registration, transfer and disposition guards satisfied; access release still blocked by CON-MM-02."),
    ("CFG-MM-04", "Published", {"REG-MM-PRG": "STS-PRG-04", "REG-MM-ARC": "STS-ARC-04", "REG-MM-AST": "STS-AST-04"}, "Legal: all Metadata contributions satisfied."),
    ("CFG-MM-05", "Stale", {"REG-MM-PRG": "STS-PRG-04", "REG-MM-ARC": "STS-ARC-04", "REG-MM-AST": "STS-AST-05"}, "Legal: EV-AS-05 emitted; registration, release, transfer and disposition guards fail until refreshed; metadata issue logged with DG."),
    ("CFG-MM-06", "Archived", {"REG-MM-PRG": "STS-PRG-04", "REG-MM-ARC": "STS-ARC-04", "REG-MM-AST": "STS-AST-06"}, "Legal terminal for the asset: description retained after destruction or custody closure."),
]
EVIDENCE = [
    ("EVD-MM-01", "Strategy approval record", "Decision evidence", "TR-PRG-02", "Approved strategy and requirements."), ("EVD-MM-02", "Architecture approval record", "Decision evidence", "TR-ARC-02", "Approved metamodel, standards, store design."), ("EVD-MM-03", "Store activation record", "Control evidence", "TR-ARC-03", "Repositories in service; control process in force."), ("EVD-MM-04", "Integrated description", "Governance evidence", "TR-AST-02", "Unified metadata, lineage and dependency records for the asset."), ("EVD-MM-05", "Publication record", "Control evidence", "TR-AST-03", "Access path, publication date, consumers notified."), ("EVD-MM-06", "Staleness flag", "Control evidence", "TR-AST-04", "Change detected, affected metadata, refresh due date."), ("EVD-MM-07", "Archive record", "Control evidence", "TR-AST-08", "Destruction or custody-closure reference; archived description location."), ("EVD-MM-08", "Archive record (unpublished description)", "Control evidence", "TR-AST-09", "Destruction or custody-closure reference; archived description location."), ("EVD-MM-09", "Archive record (stale description)", "Control evidence", "TR-AST-10", "Destruction or custody-closure reference; archived description with the unresolved staleness flag."),
]
EXC = [("EXC-MM-01", "Provisional Description", "TR-EX-01", "Registration of an urgent Data Asset with a partial description.", "DR-MM-06", "Identity, owner, classification and technical location recorded; full description scheduled with a date; steward assigned; evidence retained; expires at the scheduled date.", "Draft / Approved / Expired / Closed")]

SPEC = {
    "meta": {"modelId": "KA-MM", "name": "Metadata Management FTS", "knowledgeArea": "Metadata Management", "version": "0.1", "subjectType": KA_SUBJECT,
             "regionModel": "One FTS per managed element: the Programme and the Architecture and Stores (scope level) and the Metadata of a Data Asset (one per asset) run concurrently and are coupled by cross-region constraints, facts and events, never a single subject.",
             "source": SRC_DECK + "; " + SRC_HOWARD + "; " + SRC_PROTOCOL,
             "note": "Three state regions, each its own FTS over one managed element of the Knowledge Area: the Metadata Programme, the Metadata Architecture and Stores, and the Metadata of a Data Asset. The KA never becomes a region of the Data Asset; the Metadata of a Data Asset reaches the Global protocol through contributions (registration, access release, custody transfer, disposition, assurance triggers), and metadata quality and security are delegated to the Data Quality and Data Security FTSs by coupling.",
             "definition": CONTEXT["definition"], "factBindings": FACT_BINDINGS},
    "context": CONTEXT, "regions": REGIONS, "states": STATES, "transitions": TRANS, "events": EVENTS, "decisionRights": DR, "roles": ROLES, "artefacts": ARTEFACTS, "activities": ACTS, "services": SERVICES, "contributions": CONTRIB, "kaCouplings": KA_COUPLINGS, "crossRegionConstraints": XRG, "stateVectors": VECTORS, "evidence": EVIDENCE, "exceptions": EXC,
    "sources": [
        {"id": "SRC-MM-001", "source": SRC_DECK, "type": "Primary (image pages, captured)", "location": "Chat upload; OneDrive Data Lifecycle folder", "use": "Definition, goals, drivers, inputs, processes and sub-activities, deliverables, role players, techniques, tools, metrics", "limitations": "Process 5 carries no phase tag on the slide; (O) inferred by decision."},
        {"id": "SRC-MM-002", "source": SRC_HOWARD, "type": "Design direction", "location": "Chat", "use": "Managed elements, Global gating, quality and security delegation", "limitations": ""},
        {"id": "SRC-MM-003", "source": SRC_PROTOCOL, "type": "Alignment target", "location": "Private repo models/", "use": "Global transition IDs for contributions; DG and DQ transition IDs for couplings", "limitations": ""},
    ],
    "qaNotes": [
        {"severity": "note", "rule": "N-007", "element": "STS-AST-06", "finding": "Archived Metadata is terminal per Data Asset instance, mirroring the Global Destruction and Custody Closure terminals (decision 21 Sep 2026, Howard: keep terminal); the scope-level regions have no terminal state."},
        {"severity": "note", "rule": "GA-005", "element": "KA-MM", "finding": "The Programme and the Architecture and Stores change rarely relative to a Data Asset and gate the per-asset metadata through XRG-MM-02/03; the Metadata of a Data Asset is the only MM region that gates Global transitions."},
        {"severity": "note", "rule": "derived", "element": "STATES", "finding": "All state names, events, decision rights, holders and services are first-pass drafts from the context diagram; every one is for Howard's review."},
    ],
}

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(out, exist_ok=True)
    m = build(SPEC)
    p = os.path.join(out, "metadata_management.fts.json")
    json.dump(m, open(p, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("wrote", p); print(json.dumps(m["meta"]["counts"])); print("QA", m["meta"]["qaCounts"])
    for f in m["qaFindings"]: print(" ", f["severity"], f["rule"], f["element"], "|", f["finding"])
