#!/usr/bin/env python3
"""
da_spec.py  -  Data Architecture FTS v0.1: four state regions, each its own FTS over one managed element of the
Knowledge Area, derived from the DMBOK Data Architecture context diagram (deck pages 39 to 42) and aligned to the
Global Data Asset Protocol.

Howard's managed elements (21 Sep 2026): 1 the Enterprise Data Architecture of the scope (the master blueprint:
architecture design, data flows, data value chains, standards); 2 the Enterprise Data Model (its own versioned
blueprint, split from the architecture); 3 the Implementation Roadmap; 4 the Architectural Conformance of a Data
Asset (one per asset).
Decisions 21 Sep 2026: DA gates Global registration (blueprint in force, model published, asset placed in the
enterprise data model and data flows), materialisation (conforming or approved exception) and external custody (the
flow is in the blueprint); a blueprint revision that affects the asset emits the Assurance suspension trigger; every
transition carries a Decision Right (holders confirmed 22 Sep 2026 from the shared role vocabulary, role_vocabulary.json).

Usage: python da_spec.py [out_dir] [--overrides spec/data_architecture_overrides.json]   -> data_architecture.fts.json
"""
import json, os, sys
from ka_build import build

SRC_DECK = "DMBOK Data Lifecycle and KA Context Diagrams.pdf, Data Architecture pages 39 to 42 (What, Why, Activities, Role Players and Technical Drivers)"
SRC_HOWARD = "Howard Diesel, 21 Sep 2026: four Data Architecture managed elements (Enterprise Data Architecture; Enterprise Data Model; Implementation Roadmap; Architectural Conformance of a Data Asset), Global gating of register and materialise with conformance, external custody flow, revision trigger"
SRC_PROTOCOL = "global_protocol.fts.json v0.2.1 for the contribution targets; data_governance v0.2, metadata_management, reference_master_data and data_security v0.1 for the couplings"

CONTEXT = {
    "knowledgeArea": "Data Architecture",
    "definition": "Identifying the data needs of the enterprise (regardless of structure), and designing and maintaining the master blueprints to meet those needs. Using master blueprints to guide data integration, control data assets, and align data investments with business strategy.",
    "ensures": "The master blueprints (architecture design, data flows, data value chains, enterprise data model) exist, are in force and are used to place, integrate and control every Data Asset and to align data investments with business strategy.",
    "goals": ["Identify data storage and processing requirements", "Design structures and plans to meet the current and long-term data requirements of the enterprise", "Strategically prepare organizations to quickly evolve their products, services, and data to take advantage of business opportunities inherent in emerging technologies."],
    "businessDrivers": ["Strategic preparation of evolution of products, services and data to take advantage of business opportunities in emerging technologies", "Translate business needs into data and system requirements", "Manage complex data delivery throughout the enterprise", "Facilitate alignment between business and IT", "Act as agents for transformation", "Influence measures of the value of data"],
    "inputs": ["Enterprise Architecture", "Business Architecture", "IT Standards and Goals", "Data Strategies"],
    "processes": [
        {"id": "1", "name": "Establish Enterprise Data Architecture", "phase": "P", "subActivities": ["1.1 Evaluate Existing Data Architecture Specifications", "1.2 Develop a Roadmap", "1.3 Manage Enterprise Requirements within Projects (D)"]},
        {"id": "2", "name": "Integrate with Enterprise Architecture", "phase": "O", "subActivities": []},
    ],
    "deliverables": ["Data Architecture Design", "Data Flows", "Data Value Chains", "Enterprise Data Model", "Implementation Roadmap"],
    "suppliers": ["Enterprise Architects", "Data Stewards", "Subject Matter Experts", "Data Analysts"],
    "participants": ["Enterprise Data Architects", "Data Modelers"],
    "consumers": ["Database Administrators", "Software Developers", "Project Managers", "Support Teams"],
    "techniques": ["Lifecycle Reviews", "Diagramming Clarity"],
    "tools": ["Data modeling tools", "Asset management software", "Graphical design applications"],
    "metrics": ["Architecture standards compliance rates", "Trends in implementation", "Business value metrics"],
    "phaseTags": "(P) Planning, (C) Control, (D) Development, (O) Operations",
}

KA_SUBJECT = "Data Architecture Knowledge Area: four managed elements, one FTS (state region) each; the Data Asset is the Global subject reached through contributions"
REGIONS = [
    ("REG-DA-EDA", "Enterprise Data Architecture", "EDA", "Whether the master blueprint of the scope (architecture design, data flows, data value chains and architecture standards) exists, is approved, is in force through the Enterprise Architecture, or is under revision.", "STS-EDA-01", "Exactly one active state; a revised blueprint supersedes, never coexists with, the blueprint in force.",
     "Enterprise Data Architecture of the governed scope: the master blueprint made of the Data Architecture Design, the Data Flows, the Data Value Chains and the architecture standards, integrated with the Enterprise Architecture",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Governing element (blueprint)", "contributesTo": "Existence: an asset is registered only when a blueprint is in force to place it in (TR-EX-01); Custody: an asset is placed in external custody only when the flow is in the blueprint in force (TR-CP-04). The architecture standards are governing instruments held with Data Governance.", "conditionsThatMatter": "None; existing specifications evaluated; designed; approved; in force; under revision."}),
    ("REG-DA-EDM", "Enterprise Data Model", "EDM", "Whether the enterprise data model (subject areas, conceptual and logical structures the assets are placed in) is scoped, approved as a version, published as the current version, or has a new version pending.", "STS-EDM-01", "Exactly one active state; exactly one published model version is current at a time.",
     "Enterprise Data Model: the versioned blueprint of the enterprise's subject areas and data structures, split from the architecture design, that every Data Asset and domain model is placed in and conforms to",
     {"instanceScope": "One instance per governed scope; versions are successive states of the same instance.", "elementKind": "Governing element (versioned blueprint)", "contributesTo": "Existence: an asset is registered only when a published model version exists to place it in (TR-EX-01). The published version is the standard the Reference and Master Data domain models and the Metadata stores cite.", "conditionsThatMatter": "None; draft; approved version; published version; new version pending."}),
    ("REG-DA-RMP", "Implementation Roadmap", "RMP", "Whether the roadmap that moves the enterprise from the current to the target architecture is planned, approved, in execution, delivered or being re-planned.", "STS-RMP-01", "Exactly one active state; a roadmap in execution is re-planned, never silently replaced.",
     "Implementation Roadmap: the sequenced plan of projects and changes that implements the target architecture, with the enterprise requirements managed within those projects",
     {"instanceScope": "One instance per governed scope (one roadmap cycle at a time).", "elementKind": "Governing element (plan)", "contributesTo": "No Global transition is gated on the roadmap directly; it gates conformance work through cross-region constraints (assets are placed and assessed within roadmap projects) and reports Trends in implementation.", "conditionsThatMatter": "None; planned; approved; in execution; delivered; re-planning."}),
    ("REG-DA-CNF", "Architectural Conformance of a Data Asset", "CNF", "Whether one Data Asset is placed in the enterprise data model and data flows and assessed as conforming to the architecture, deviating under an approved exception, non-conforming, or due for reassessment after a blueprint revision.", "STS-CNF-01", "Exactly one active state per asset; Conforming means the asset's placement and structures match the blueprint in force at the last lifecycle review.",
     "Architectural Conformance of a Data Asset: one asset's placement in the enterprise data model and data flows and its assessed conformance to the architecture standards (lifecycle review result, exception, remediation)",
     {"instanceScope": "One instance per Data Asset.", "elementKind": "Managed per-asset element", "contributesTo": "Existence: an asset is registered only when placed in the enterprise data model and data flows (TR-EX-01) and materialised only when conforming or under an approved exception (TR-EX-02); Custody: external custody requires the placement (TR-CP-04); Assurance: a blueprint revision affecting the asset emits the assurance suspension trigger (TR-AS-05); the conformance assessment supplies assurance evidence (TR-AS-02).", "conditionsThatMatter": "Unassessed; placed; conforming; approved exception; non-conforming; reassessment due."}),
]
STATES = [
    ("STS-EDA-01", "REG-DA-EDA", "No Enterprise Data Architecture", True, False, "No master blueprint exists for the governed scope; data structures and flows are undocumented or project-local.", "The absence of a blueprint remains visible to governance bodies.", ["inputs:Enterprise Architecture"]),
    ("STS-EDA-02", "REG-DA-EDA", "Evaluated Specifications", False, False, "Existing data architecture specifications are evaluated against the Enterprise Architecture, Business Architecture, IT standards and data strategies; gaps and requirements are recorded.", "Each gap remains traceable to the specification and the business or IT input that exposed it.", ["process:1", "process:1.1", "inputs:Business Architecture", "inputs:IT Standards and Goals", "inputs:Data Strategies"]),
    ("STS-EDA-03", "REG-DA-EDA", "Designed Architecture", False, False, "The Data Architecture Design, Data Flows, Data Value Chains and architecture standards are drafted for the scope and await approval.", "The design remains internally consistent and diagrammed to the clarity standard.", ["process:1", "deliverable:Data Architecture Design", "deliverable:Data Flows", "deliverable:Data Value Chains", "techniques:Diagramming Clarity"]),
    ("STS-EDA-04", "REG-DA-EDA", "Approved Architecture", False, False, "The blueprint is approved by the architecture authority and its standards are approved as governing instruments, but it is not yet integrated with the Enterprise Architecture.", "The approved blueprint, its standards and the approving authority remain traceable.", ["process:1", "metric:Architecture standards compliance rates"]),
    ("STS-EDA-05", "REG-DA-EDA", "Architecture in Force", False, False, "The blueprint is integrated with the Enterprise Architecture, published and used to place, integrate and control Data Assets; compliance rates are measured.", "Every registered asset is placed in the blueprint in force; compliance rates remain current.", ["process:2", "metric:Architecture standards compliance rates", "metric:Business value metrics"]),
    ("STS-EDA-06", "REG-DA-EDA", "Architecture Revision", False, False, "The blueprint is under revision after a business, technology or Enterprise Architecture trigger while the blueprint in force stays in force; affected assets are flagged for reassessment.", "The blueprint in force remains valid until the revision is approved; affected assets are identified.", ["process:1.1", "techniques:Lifecycle Reviews"]),
    ("STS-EDM-01", "REG-DA-EDM", "No Enterprise Data Model", True, False, "No enterprise data model exists for the scope; assets cannot be placed in subject areas.", "The absence of a model remains visible.", ["inputs:Data Strategies"]),
    ("STS-EDM-02", "REG-DA-EDM", "Draft Model", False, False, "The subject areas and conceptual or logical structures of the model are scoped and being modelled.", "Each subject area remains traceable to a business or data requirement.", ["process:1", "tools:Data modeling tools"]),
    ("STS-EDM-03", "REG-DA-EDM", "Approved Model Version", False, False, "A model version is approved by the architecture authority and awaits publication.", "The approved version, its differences from the current version and the approving authority remain traceable.", ["process:1", "deliverable:Enterprise Data Model"]),
    ("STS-EDM-04", "REG-DA-EDM", "Published Model Version", False, False, "The approved version is published through the metadata stores as the current enterprise data model that assets and domain models are placed in.", "Exactly one current version; every placed asset resolves to a subject area of it.", ["process:2", "deliverable:Enterprise Data Model"]),
    ("STS-EDM-05", "REG-DA-EDM", "Pending Model Version", False, False, "A new version is approved and awaiting publication while the current version stays published.", "The pending version's differences and effective date remain explicit.", ["process:1.3", "metric:Trends in implementation"]),
    ("STS-RMP-01", "REG-DA-RMP", "No Roadmap", True, False, "No implementation roadmap exists; architecture change is unsequenced.", "The absence of a roadmap remains visible.", ["inputs:Data Strategies"]),
    ("STS-RMP-02", "REG-DA-RMP", "Planned Roadmap", False, False, "The roadmap of projects and changes that implement the target architecture is drafted and sequenced.", "Each roadmap item remains traceable to an architecture gap or requirement.", ["process:1.2", "deliverable:Implementation Roadmap"]),
    ("STS-RMP-03", "REG-DA-RMP", "Approved Roadmap", False, False, "The roadmap is approved with its funding and sequence.", "The approved roadmap, its sequence and the approving authority remain traceable.", ["process:1.2"]),
    ("STS-RMP-04", "REG-DA-RMP", "Roadmap in Execution", False, False, "Roadmap projects are running and enterprise requirements are managed within them; implementation trends are measured.", "Every running project carries its enterprise data requirements; trends remain current.", ["process:1.3", "metric:Trends in implementation"]),
    ("STS-RMP-05", "REG-DA-RMP", "Delivered Roadmap", False, False, "The roadmap's projects are delivered and their business value measured; the next roadmap cycle can be planned.", "Delivered value and outstanding items remain recorded.", ["metric:Business value metrics"]),
    ("STS-RMP-06", "REG-DA-RMP", "Roadmap Re-planning", False, False, "The roadmap is being re-planned after a scope, priority or architecture change while running projects continue.", "Running projects remain under the last approved roadmap until the re-plan is approved.", ["process:1.2"]),
    ("STS-CNF-01", "REG-DA-CNF", "Unassessed Asset", True, False, "The asset has no place in the enterprise data model or data flows and no conformance assessment.", "The unplaced asset remains visible as an architecture gap.", ["techniques:Lifecycle Reviews"]),
    ("STS-CNF-02", "REG-DA-CNF", "Placed Asset", False, False, "The asset is placed in a subject area of the published enterprise data model and in the data flows of the blueprint in force; its conformance is not yet assessed.", "The placement (subject area, flows, value chain) remains recorded.", ["process:1.3", "deliverable:Data Flows", "deliverable:Enterprise Data Model"]),
    ("STS-CNF-03", "REG-DA-CNF", "Conforming Asset", False, False, "A lifecycle review confirms the asset's placement and structures conform to the architecture standards in force.", "The review result, the blueprint version reviewed against and the reviewer remain recorded.", ["techniques:Lifecycle Reviews", "metric:Architecture standards compliance rates"]),
    ("STS-CNF-04", "REG-DA-CNF", "Approved Exception", False, False, "The asset deviates from the standards under an approved, dated exception with a remediation plan.", "The exception, its expiry and its remediation plan remain explicit.", ["metric:Architecture standards compliance rates"]),
    ("STS-CNF-05", "REG-DA-CNF", "Non-conforming Asset", False, False, "A lifecycle review finds a deviation with no approved exception; a Data Asset issue is logged.", "The deviation, its owner and the DG issue reference remain explicit.", ["techniques:Lifecycle Reviews", "metric:Architecture standards compliance rates"]),
    ("STS-CNF-06", "REG-DA-CNF", "Reassessment Due", False, False, "A blueprint or model revision affects the asset; its last assessment no longer holds and a new lifecycle review is due.", "The revision that triggered the reassessment remains recorded.", ["techniques:Lifecycle Reviews"]),
]
EVENTS = {
    "EV-EDA-01": ("Architecture evaluation initiation", "Request"), "EV-EDA-02": ("Design completion", "Evidence trigger"), "EV-EDA-03": ("Architecture approval", "Decision outcome"), "EV-EDA-04": ("Enterprise Architecture integration", "Decision outcome"), "EV-EDA-05": ("Architecture revision trigger", "Monitoring trigger"), "EV-EDA-06": ("Revised architecture approval", "Decision outcome"), "EV-EDA-07": ("Architecture retirement", "Decision outcome"), "EV-EDA-08": ("Design rejection", "Decision outcome"),
    "EV-EDM-01": ("Model scoping", "Request"), "EV-EDM-02": ("Model version approval", "Decision outcome"), "EV-EDM-03": ("Model publication", "Decision outcome"), "EV-EDM-04": ("New version approval", "Decision outcome"), "EV-EDM-05": ("Version supersession", "Decision outcome"), "EV-EDM-06": ("Model rejection", "Decision outcome"), "EV-EDM-07": ("Model withdrawal", "Decision outcome"),
    "EV-RMP-01": ("Roadmap planning", "Request"), "EV-RMP-02": ("Roadmap approval", "Decision outcome"), "EV-RMP-03": ("Execution start", "Decision outcome"), "EV-RMP-04": ("Delivery confirmation", "Evidence trigger"), "EV-RMP-05": ("Re-planning trigger", "Monitoring trigger"), "EV-RMP-06": ("Re-planned roadmap approval", "Decision outcome"), "EV-RMP-07": ("Roadmap rejection", "Decision outcome"),
    "EV-CNF-01": ("Asset placement", "Request"), "EV-CNF-02": ("Conformance confirmation", "Assessment outcome"), "EV-CNF-03": ("Deviation finding", "Assessment outcome"), "EV-CNF-04": ("Exception approval", "Decision outcome"), "EV-CNF-05": ("Remediation confirmation", "Assessment outcome"), "EV-CNF-06": ("Exception expiry", "Time trigger"), "EV-CNF-07": ("Blueprint revision affecting the asset", "Monitoring trigger"), "EV-CNF-08": ("Placement removal", "Decision outcome"),
}
DR = {
    "DR-DA-01": ("Approve the Enterprise Data Architecture and its Standards", "ROLE-PM-DA", "Confirmed 22 Sep 2026 (holder register): Data Architecture Practice Manager; drafted as Enterprise Data Architects"),
    "DR-DA-02": ("Evaluate, Bring into Force, Revise and Retire the Architecture", "ROLE-DARCH", "Confirmed 22 Sep 2026 (holder register): Data Architect; drafted as Enterprise Data Architects"),
    "DR-DA-03": ("Approve, Publish and Supersede an Enterprise Data Model Version", "ROLE-DARCH", "Confirmed 22 Sep 2026 (holder register): Data Architect; drafted as Enterprise Data Architects"),
    "DR-DA-04": ("Approve, Execute, Deliver and Re-plan the Roadmap", "ROLE-PM-DA", "Confirmed 22 Sep 2026 (holder register): Data Architecture Practice Manager; drafted as Enterprise Data Architects"),
    "DR-DA-05": ("Place an Asset and Confirm its Conformance", "ROLE-DMOD", "Confirmed 22 Sep 2026 (holder register): Data Modeller; drafted as Data Modelers"),
    "DR-DA-06": ("Grant, Expire and Close a Conformance Exception", "ROLE-DARCH", "Confirmed 22 Sep 2026 (holder register): Data Architect; drafted as Enterprise Data Architects"),
    "DR-DA-07": ("Declare an Asset Non-conforming", "ROLE-DARCH", "Confirmed 22 Sep 2026 (holder register): Data Architect; drafted as Enterprise Data Architects"),
}
ROLES = [
    ("ROLE-DA-S01", "Enterprise Architects", "Supplier", "Supply the Enterprise and Business Architecture and IT standards."), ("ROLE-DA-S02", "Data Stewards", "Supplier", "Supply data requirements and asset knowledge."), ("ROLE-DA-S03", "Subject Matter Experts", "Supplier", "Supply business meaning and value chains."), ("ROLE-DA-S04", "Data Analysts", "Supplier", "Supply analysis of existing specifications and flows."),
    ("ROLE-DA-P01", "Enterprise Data Architects", "Participant", "Design, approve and maintain the blueprints; review conformance."), ("ROLE-DA-P02", "Data Modelers", "Participant", "Model the enterprise data model; place assets."),
    ("ROLE-DA-C01", "Database Administrators", "Consumer", "Consume the blueprints and model to implement storage."), ("ROLE-DA-C02", "Software Developers", "Consumer", "Consume the blueprints to build conforming systems."), ("ROLE-DA-C03", "Project Managers", "Consumer", "Consume the roadmap and enterprise requirements."), ("ROLE-DA-C04", "Support Teams", "Consumer", "Consume the data flows and value chains."),
]
TRANS = [
    ("TR-EDA-01", "Evaluate Existing Specifications", "STS-EDA-01", "STS-EDA-02", "EV-EDA-01", "The Enterprise Architecture, Business Architecture, IT standards and data strategies are available as inputs.", "DR-DA-02", ["SVC-DA-01"], ["ACT-DA-1", "ACT-DA-1.1"]),
    ("TR-EDA-02", "Design Architecture", "STS-EDA-02", "STS-EDA-03", "EV-EDA-02", "The architecture design, data flows, value chains and standards are drafted to the diagramming clarity standard.", "DR-DA-02", ["SVC-DA-02"], ["ACT-DA-1"]),
    ("TR-EDA-03", "Approve Architecture", "STS-EDA-03", "STS-EDA-04", "EV-EDA-03", "The blueprint is approved and its standards approved as governing instruments under Data Governance.", "DR-DA-01", ["SVC-DA-02"], ["ACT-DA-1"]),
    ("TR-EDA-04", "Return Design for Rework", "STS-EDA-03", "STS-EDA-02", "EV-EDA-08", "The design is rejected with recorded reasons.", "DR-DA-01", ["SVC-DA-02"], ["ACT-DA-1"]),
    ("TR-EDA-05", "Bring Architecture into Force", "STS-EDA-04", "STS-EDA-05", "EV-EDA-04", "The blueprint is integrated with the Enterprise Architecture and published for use.", "DR-DA-02", ["SVC-DA-05"], ["ACT-DA-2"]),
    ("TR-EDA-06", "Open Revision", "STS-EDA-05", "STS-EDA-06", "EV-EDA-05", "A business, technology or Enterprise Architecture trigger is recorded; the blueprint in force is retained meanwhile and affected assets identified.", "DR-DA-02", ["SVC-DA-01"], ["ACT-DA-1.1"]),
    ("TR-EDA-07", "Approve Revised Architecture", "STS-EDA-06", "STS-EDA-05", "EV-EDA-06", "The revised blueprint is approved and integrated; affected assets are flagged for reassessment.", "DR-DA-01", ["SVC-DA-02", "SVC-DA-05"], ["ACT-DA-1", "ACT-DA-2"]),
    ("TR-EDA-08", "Retire Architecture", "STS-EDA-06", "STS-EDA-01", "EV-EDA-07", "The blueprint is retired without replacement and the retirement recorded.", "DR-DA-02", ["SVC-DA-05"], ["ACT-DA-2"]),
    ("TR-EDM-01", "Scope Model", "STS-EDM-01", "STS-EDM-02", "EV-EDM-01", "Subject areas are scoped from the data strategies and the evaluated specifications.", "DR-DA-03", ["SVC-DA-03"], ["ACT-DA-1"]),
    ("TR-EDM-02", "Approve Model Version", "STS-EDM-02", "STS-EDM-03", "EV-EDM-02", "The model version is approved under the architecture standards.", "DR-DA-03", ["SVC-DA-03"], ["ACT-DA-1"]),
    ("TR-EDM-03", "Return Model for Rework", "STS-EDM-03", "STS-EDM-02", "EV-EDM-06", "The model version is rejected with recorded reasons.", "DR-DA-03", ["SVC-DA-03"], ["ACT-DA-1"]),
    ("TR-EDM-04", "Publish Model Version", "STS-EDM-03", "STS-EDM-04", "EV-EDM-03", "The approved version is published through the metadata stores as the current model.", "DR-DA-03", ["SVC-DA-05"], ["ACT-DA-2"]),
    ("TR-EDM-05", "Approve New Version", "STS-EDM-04", "STS-EDM-05", "EV-EDM-04", "A new version is approved from enterprise requirements managed within projects; the current version stays published.", "DR-DA-03", ["SVC-DA-03"], ["ACT-DA-1.3"]),
    ("TR-EDM-06", "Supersede Published Version", "STS-EDM-05", "STS-EDM-04", "EV-EDM-05", "The new version is published and the previous version retained; assets in changed subject areas are flagged for reassessment.", "DR-DA-03", ["SVC-DA-05"], ["ACT-DA-2"]),
    ("TR-EDM-07", "Withdraw Model", "STS-EDM-04", "STS-EDM-01", "EV-EDM-07", "The model is withdrawn with the architecture and no placed asset remains.", "DR-DA-03", ["SVC-DA-05"], ["ACT-DA-2"]),
    ("TR-RMP-01", "Plan Roadmap", "STS-RMP-01", "STS-RMP-02", "EV-RMP-01", "The roadmap is drafted from the architecture gaps and sequenced.", "DR-DA-04", ["SVC-DA-04"], ["ACT-DA-1.2"]),
    ("TR-RMP-02", "Approve Roadmap", "STS-RMP-02", "STS-RMP-03", "EV-RMP-02", "The roadmap is approved with its sequence and funding.", "DR-DA-04", ["SVC-DA-04"], ["ACT-DA-1.2"]),
    ("TR-RMP-03", "Return Roadmap for Rework", "STS-RMP-02", "STS-RMP-01", "EV-RMP-07", "The roadmap is rejected with recorded reasons.", "DR-DA-04", ["SVC-DA-04"], ["ACT-DA-1.2"]),
    ("TR-RMP-04", "Start Execution", "STS-RMP-03", "STS-RMP-04", "EV-RMP-03", "Roadmap projects start with their enterprise data requirements assigned.", "DR-DA-04", ["SVC-DA-04"], ["ACT-DA-1.3"]),
    ("TR-RMP-05", "Deliver Roadmap", "STS-RMP-04", "STS-RMP-05", "EV-RMP-04", "The roadmap's projects are delivered and business value measured.", "DR-DA-04", ["SVC-DA-04"], ["ACT-DA-1.3"]),
    ("TR-RMP-06", "Re-plan Roadmap", "STS-RMP-04", "STS-RMP-06", "EV-RMP-05", "A scope, priority or architecture change requires re-planning; running projects continue.", "DR-DA-04", ["SVC-DA-04"], ["ACT-DA-1.2"]),
    ("TR-RMP-07", "Approve Re-planned Roadmap", "STS-RMP-06", "STS-RMP-03", "EV-RMP-06", "The re-planned roadmap is approved.", "DR-DA-04", ["SVC-DA-04"], ["ACT-DA-1.2"]),
    ("TR-RMP-08", "Plan Next Roadmap", "STS-RMP-05", "STS-RMP-02", "EV-RMP-01", "The next roadmap cycle is drafted from outstanding items and new gaps.", "DR-DA-04", ["SVC-DA-04"], ["ACT-DA-1.2"]),
    ("TR-CNF-01", "Place Asset", "STS-CNF-01", "STS-CNF-02", "EV-CNF-01", "The asset is placed in a subject area of the published model and in the data flows of the blueprint in force.", "DR-DA-05", ["SVC-DA-03"], ["ACT-DA-1.3"]),
    ("TR-CNF-02", "Confirm Conformance", "STS-CNF-02", "STS-CNF-03", "EV-CNF-02", "A lifecycle review confirms conformance to the standards in force.", "DR-DA-05", ["SVC-DA-06"], ["ACT-DA-1.3"]),
    ("TR-CNF-03", "Find Deviation", "STS-CNF-02", "STS-CNF-05", "EV-CNF-03", "A lifecycle review finds a deviation; a Data Asset issue is logged with Data Governance.", "DR-DA-07", ["SVC-DA-06"], ["ACT-DA-1.3"]),
    ("TR-CNF-04", "Grant Exception", "STS-CNF-05", "STS-CNF-04", "EV-CNF-04", "A dated exception with a remediation plan is approved for the deviation.", "DR-DA-06", ["SVC-DA-07"], ["ACT-DA-1.3"]),
    ("TR-CNF-05", "Remediate to Conformance", "STS-CNF-05", "STS-CNF-03", "EV-CNF-05", "The deviation is remediated and a lifecycle review confirms conformance.", "DR-DA-05", ["SVC-DA-06"], ["ACT-DA-1.3"]),
    ("TR-CNF-06", "Expire Exception", "STS-CNF-04", "STS-CNF-05", "EV-CNF-06", "The exception reaches its expiry without remediation.", "DR-DA-06", ["SVC-DA-07"], ["ACT-DA-1.3"]),
    ("TR-CNF-07", "Close Exception by Remediation", "STS-CNF-04", "STS-CNF-03", "EV-CNF-05", "The remediation plan is completed and a lifecycle review confirms conformance.", "DR-DA-06", ["SVC-DA-06"], ["ACT-DA-1.3"]),
    ("TR-CNF-08", "Flag for Reassessment", "STS-CNF-03", "STS-CNF-06", "EV-CNF-07", "A blueprint or model revision affects the asset's subject area, flows or standards.", "DR-DA-05", ["SVC-DA-06"], ["ACT-DA-2"]),
    ("TR-CNF-09", "Flag Exception for Reassessment", "STS-CNF-04", "STS-CNF-06", "EV-CNF-07", "A blueprint or model revision affects the asset under exception.", "DR-DA-06", ["SVC-DA-06"], ["ACT-DA-2"]),
    ("TR-CNF-10", "Reassess as Conforming", "STS-CNF-06", "STS-CNF-03", "EV-CNF-02", "The new lifecycle review confirms conformance to the revised blueprint.", "DR-DA-05", ["SVC-DA-06"], ["ACT-DA-1.3"]),
    ("TR-CNF-11", "Reassess as Deviating", "STS-CNF-06", "STS-CNF-05", "EV-CNF-03", "The new lifecycle review finds a deviation against the revised blueprint; a Data Asset issue is logged.", "DR-DA-07", ["SVC-DA-06"], ["ACT-DA-1.3"]),
    ("TR-CNF-12", "Remove Placement", "STS-CNF-03", "STS-CNF-01", "EV-CNF-08", "The asset is disposed or descoped and its placement removed from the model and flows.", "DR-DA-05", ["SVC-DA-03"], ["ACT-DA-2"]),
    ("TR-CNF-13", "Remove Non-conforming Placement", "STS-CNF-05", "STS-CNF-01", "EV-CNF-08", "The non-conforming asset is disposed or descoped and its placement removed; the DG issue is closed.", "DR-DA-07", ["SVC-DA-03"], ["ACT-DA-2"]),
]
SERVICES = [
    ("SVC-DA-01", "Governance", "Architecture Specification Evaluation", "Architecture initiation or revision trigger.", "Evaluated specifications; gaps and requirements against the Enterprise Architecture and data strategies."),
    ("SVC-DA-02", "Governance", "Enterprise Data Architecture Design and Approval", "Evaluated specifications; revision.", "Data Architecture Design; Data Flows; Data Value Chains; approved architecture standards."),
    ("SVC-DA-03", "Governance", "Enterprise Data Model Management", "Model scoping; new version; asset placement or removal.", "Approved model version; asset placed in a subject area and in the data flows."),
    ("SVC-DA-04", "Control", "Roadmap Planning and Execution Tracking", "Roadmap planning, approval, execution, delivery, re-planning.", "Approved roadmap; project requirements; trends in implementation; business value metrics."),
    ("SVC-DA-05", "Control", "Enterprise Architecture Integration and Publication", "Architecture approval; model publication or supersession; retirement.", "Blueprint in force; published model version; compliance rates."),
    ("SVC-DA-06", "Assurance", "Architectural Conformance Review", "Asset placed; remediation; reassessment.", "Lifecycle review result: conforming or deviating; blueprint version reviewed against."),
    ("SVC-DA-07", "Risk", "Conformance Exception Management", "Deviation found; exception expiry.", "Approved, dated exception with remediation plan; expiry tracking."),
]
ACTS = [
    ("ACT-DA-1", "Establish Enterprise Data Architecture", "1", "Transition-causing", ["REG-DA-EDA", "REG-DA-EDM"], ["TR-EDA-01", "TR-EDA-02", "TR-EDA-03", "TR-EDA-04", "TR-EDA-07", "TR-EDM-01", "TR-EDM-02", "TR-EDM-03"], ["SVC-DA-01", "SVC-DA-02", "SVC-DA-03"]),
    ("ACT-DA-1.1", "Evaluate Existing Data Architecture Specifications", "1.1", "Transition-causing", ["REG-DA-EDA"], ["TR-EDA-01", "TR-EDA-06"], ["SVC-DA-01"]),
    ("ACT-DA-1.2", "Develop a Roadmap", "1.2", "Transition-causing", ["REG-DA-RMP"], ["TR-RMP-01", "TR-RMP-02", "TR-RMP-03", "TR-RMP-06", "TR-RMP-07", "TR-RMP-08"], ["SVC-DA-04"]),
    ("ACT-DA-1.3", "Manage Enterprise Requirements within Projects", "1.3", "Transition-causing", ["REG-DA-EDM", "REG-DA-RMP", "REG-DA-CNF"], ["TR-EDM-05", "TR-RMP-04", "TR-RMP-05", "TR-CNF-01", "TR-CNF-02", "TR-CNF-03", "TR-CNF-04", "TR-CNF-05", "TR-CNF-06", "TR-CNF-07", "TR-CNF-10", "TR-CNF-11"], ["SVC-DA-03", "SVC-DA-04", "SVC-DA-06", "SVC-DA-07"]),
    ("ACT-DA-2", "Integrate with Enterprise Architecture", "2", "Transition-causing", ["REG-DA-EDA", "REG-DA-EDM", "REG-DA-CNF"], ["TR-EDA-05", "TR-EDA-07", "TR-EDA-08", "TR-EDM-04", "TR-EDM-06", "TR-EDM-07", "TR-CNF-08", "TR-CNF-09", "TR-CNF-12", "TR-CNF-13"], ["SVC-DA-05", "SVC-DA-06"]),
]
ARTEFACTS = [
    ("ART-DA-01", "Data Architecture Design", "STS-EDA-03", "Establish Enterprise Data Architecture", "Evidences Designed Architecture; in force from STS-EDA-05."), ("ART-DA-02", "Data Flows", "STS-EDA-03", "Establish Enterprise Data Architecture", "Evidences the flows every placed asset sits in; cited by Global external custody."), ("ART-DA-03", "Data Value Chains", "STS-EDA-03", "Establish Enterprise Data Architecture", "Evidences the value chains the placed assets serve."), ("ART-DA-04", "Enterprise Data Model", "STS-EDM-04", "Establish Enterprise Data Architecture", "Evidences Published Model Version; cited by Global registration."), ("ART-DA-05", "Implementation Roadmap", "STS-RMP-03", "Develop a Roadmap", "Evidences Approved Roadmap."),
]
CONTRIB = [
    ("CON-DA-01", "TR-EX-01", "guard", {"EDA": ["STS-EDA-05", "STS-EDA-06"]}, "An asset is registered only when an Enterprise Data Architecture is in force to place it in.", "DA_architecture_in_force", "Required", "Register Asset cites the blueprint in force."),
    ("CON-DA-02", "TR-EX-01", "guard", {"EDM": ["STS-EDM-04", "STS-EDM-05"]}, "Registration requires a published enterprise data model version to place the asset in.", "DA_model_published", "Required", ""),
    ("CON-DA-03", "TR-EX-01", "guard", {"CNF": ["STS-CNF-02", "STS-CNF-03", "STS-CNF-04", "STS-CNF-05", "STS-CNF-06"]}, "Registration requires the asset to be placed in the enterprise data model and the data flows.", "DA_asset_placed", "Required", "TR-CNF-01 precedes TR-EX-01 in every scenario."),
    ("CON-DA-04", "TR-EX-02", "guard", {"CNF": ["STS-CNF-03", "STS-CNF-04"]}, "An asset is materialised only when conforming to the architecture or deviating under an approved exception.", "DA_conformance_cleared", "Required", "Materialize Asset cites the lifecycle review or the exception."),
    ("CON-DA-05", "TR-CP-04", "guard", {"EDA": ["STS-EDA-05", "STS-EDA-06"], "CNF": ["STS-CNF-02", "STS-CNF-03", "STS-CNF-04", "STS-CNF-06"]}, "An asset is placed in external custody only when the flow to the external custodian is in the data flows of the blueprint in force and the asset is not non-conforming.", "DA_architecture_in_force and DA_asset_placed and not DA_non_conforming", "Required", "Data Security adds the classification and transfer guards on the same transition."),
    ("CON-DA-06", "TR-AS-05", "event", {"CNF": ["STS-CNF-06"]}, "A blueprint or model revision affecting the asset is a material change affecting the assurance claim.", "DA_reassessment_due", "Conditional", "DA emits EV-AS-05 when TR-CNF-08 or TR-CNF-09 fires."),
    ("CON-DA-07", "TR-AS-02", "service", {"CNF": ["STS-CNF-03"]}, "The Architectural Conformance Review supplies assurance evidence for the asset.", "SVC-DA-06", "Conditional", "Assurance service; evidence EVD-DA-06."),
]
KA_COUPLINGS = [
    ("KAC-DA-01", "KA-DG", "TR-POL-03", "", "DA_policy_set_in_force", "The architecture standards are governing instruments published under Data Governance (TR-EDA-03 and TR-EDA-07 cite this Knowledge Area's own instrument set (Howard, 24 Sep 2026: one policy with its procedures per Knowledge Area, each set its own fact)).", "Reverse coupling: a DA transition cites a DG fact."),
    ("KAC-DA-02", "KA-DG", "TR-ISS-01", "EV-ISS-01", "DA_non_conforming", "A deviation without exception is logged as a Data Asset issue in the DG issue FTS with source Data Architecture (TR-CNF-03 and TR-CNF-11 emit EV-ISS-01).", "DG owns escalation; DA owns the remediation or exception."),
    ("KAC-DA-03", "KA-MM", "TR-ARC-03", "", "MM_stores_operating", "The enterprise data model is published through the metadata stores; publication requires operating stores (TR-EDM-04 and TR-EDM-06 cite the MM fact).", "Reverse coupling: a DA transition cites an MM fact."),
    ("KAC-DA-04", "KA-MM", "TR-AST-02", "", "DA_asset_placed", "An asset's placement (subject area, flows, value chain) is recorded as its business and technical metadata when the asset is described (the MM transition cites the DA fact).", "Forward coupling: an MM transition cites a DA fact."),
    ("KAC-DA-05", "KA-RMD", "TR-DOM-03", "", "DA_model_published", "A master data domain model is approved only against the published enterprise data model (the RMD transition cites the DA fact).", "Forward coupling: an RMD transition cites a DA fact."),
    ("KAC-DA-06", "KA-DS", "TR-CLS-02", "", "DS_classified", "A data flow to an external custodian is placed in the blueprint only for classified data; the flow carries the classification (TR-CNF-01 cites the DS fact for external flows).", "Reverse coupling: a DA transition cites a DS fact."),
]
FACT_BINDINGS = {
    "DA_architecture_approved": {"region": "REG-DA-EDA", "states": ["STS-EDA-04", "STS-EDA-05", "STS-EDA-06"]},
    "DA_architecture_in_force": {"region": "REG-DA-EDA", "states": ["STS-EDA-05", "STS-EDA-06"]},
    "DA_architecture_revision": {"region": "REG-DA-EDA", "states": ["STS-EDA-06"]},
    "DA_model_published": {"region": "REG-DA-EDM", "states": ["STS-EDM-04", "STS-EDM-05"]},
    "DA_roadmap_in_execution": {"region": "REG-DA-RMP", "states": ["STS-RMP-04"]},
    "DA_asset_placed": {"region": "REG-DA-CNF", "states": ["STS-CNF-02", "STS-CNF-03", "STS-CNF-04", "STS-CNF-05", "STS-CNF-06"]},
    "DA_asset_conforming": {"region": "REG-DA-CNF", "states": ["STS-CNF-03"]},
    "DA_exception_approved": {"region": "REG-DA-CNF", "states": ["STS-CNF-04"]},
    "DA_conformance_cleared": {"region": "REG-DA-CNF", "states": ["STS-CNF-03", "STS-CNF-04"]},
    "DA_non_conforming": {"region": "REG-DA-CNF", "states": ["STS-CNF-05"]},
    "DA_reassessment_due": {"region": "REG-DA-CNF", "states": ["STS-CNF-06"]},
}
XRG = [
    ("XRG-DA-01", "A model version is approved only under an approved or in-force architecture.", ["TR-EDM-02"], "Required", "EDA in ('STS-EDA-04','STS-EDA-05','STS-EDA-06')"),
    ("XRG-DA-02", "A model version is published only under an architecture in force.", ["TR-EDM-04", "TR-EDM-06"], "Required", "EDA in ('STS-EDA-05','STS-EDA-06')"),
    ("XRG-DA-03", "A roadmap is approved only under an approved or in-force architecture.", ["TR-RMP-02", "TR-RMP-07"], "Required", "EDA in ('STS-EDA-04','STS-EDA-05','STS-EDA-06')"),
    ("XRG-DA-04", "An asset is placed only in a published model under an architecture in force.", ["TR-CNF-01"], "Required", "EDA in ('STS-EDA-05','STS-EDA-06') and EDM in ('STS-EDM-04','STS-EDM-05')"),
    ("XRG-DA-05", "Conformance is confirmed only against an architecture in force.", ["TR-CNF-02", "TR-CNF-05", "TR-CNF-07", "TR-CNF-10"], "Required", "EDA in ('STS-EDA-05','STS-EDA-06')"),
    ("XRG-DA-06", "The model is withdrawn only when the architecture is retired and no asset is placed.", ["TR-EDM-07"], "Required", "EDA in ('STS-EDA-01',) and CNF in ('STS-CNF-01',)"),
    ("XRG-DA-07", "The architecture is retired only when no asset remains placed.", ["TR-EDA-08"], "Required", "CNF in ('STS-CNF-01',)"),
]
VECTORS = [
    ("CFG-DA-01", "Greenfield", {"REG-DA-EDA": "STS-EDA-01", "REG-DA-EDM": "STS-EDM-01", "REG-DA-RMP": "STS-RMP-01", "REG-DA-CNF": "STS-CNF-01"}, "Initial configuration: no blueprint; Global registration blocked by CON-DA-01..03."),
    ("CFG-DA-02", "Blueprint in force, asset placed", {"REG-DA-EDA": "STS-EDA-05", "REG-DA-EDM": "STS-EDM-04", "REG-DA-RMP": "STS-RMP-04", "REG-DA-CNF": "STS-CNF-02"}, "Legal: registration guards satisfied; materialisation blocked until the lifecycle review."),
    ("CFG-DA-03", "Conforming asset", {"REG-DA-EDA": "STS-EDA-05", "REG-DA-EDM": "STS-EDM-04", "REG-DA-RMP": "STS-RMP-04", "REG-DA-CNF": "STS-CNF-03"}, "Legal: all DA contributions satisfied; the asset can be materialised and placed in external custody."),
    ("CFG-DA-04", "Approved exception", {"REG-DA-EDA": "STS-EDA-05", "REG-DA-EDM": "STS-EDM-04", "REG-DA-RMP": "STS-RMP-04", "REG-DA-CNF": "STS-CNF-04"}, "Legal: materialisation allowed under the exception until its expiry."),
    ("CFG-DA-05", "Non-conforming asset", {"REG-DA-EDA": "STS-EDA-05", "REG-DA-EDM": "STS-EDM-04", "REG-DA-RMP": "STS-RMP-04", "REG-DA-CNF": "STS-CNF-05"}, "Legal: DG issue logged; materialisation and external custody blocked."),
    ("CFG-DA-06", "Architecture revision, reassessment due", {"REG-DA-EDA": "STS-EDA-06", "REG-DA-EDM": "STS-EDM-05", "REG-DA-RMP": "STS-RMP-06", "REG-DA-CNF": "STS-CNF-06"}, "Legal: EV-AS-05 emitted; registration still allowed under the blueprint in force; materialisation blocked until reassessed."),
]
EVIDENCE = [
    ("EVD-DA-01", "Specification evaluation record", "Governance evidence", "TR-EDA-01", "Evaluated specifications, gaps, inputs used."), ("EVD-DA-02", "Architecture approval record", "Decision evidence", "TR-EDA-03", "Approved design, flows, value chains, standards; approving authority."), ("EVD-DA-03", "Enterprise Architecture integration record", "Control evidence", "TR-EDA-05", "Integration and publication of the blueprint."), ("EVD-DA-04", "Model version approval and publication record", "Decision evidence", "TR-EDM-04", "Published version, differences, effective date."), ("EVD-DA-05", "Roadmap approval record", "Decision evidence", "TR-RMP-02", "Approved roadmap, sequence, funding."), ("EVD-DA-06", "Lifecycle review result", "Assurance evidence", "TR-CNF-02", "Placement, standards reviewed, blueprint version, reviewer, result."), ("EVD-DA-07", "Conformance exception record", "Risk evidence", "TR-CNF-04", "Exception, expiry, remediation plan, approver."), ("EVD-DA-08", "Deviation record", "Control evidence", "TR-CNF-03", "Deviation, owner, DG issue reference."), ("EVD-DA-09", "Reassessment trigger record", "Control evidence", "TR-CNF-08", "Revision that affected the asset; assurance trigger emitted."),
]
EXC = [("EXC-DA-01", "Provisional Placement", "TR-EX-02", "Materialisation of an asset whose lifecycle review is scheduled but not complete.", "DR-DA-06", "Asset placed, review scheduled with a date, remediation owner named, DG informed, evidence retained; expires at the review date.", "Draft / Approved / Expired / Closed")]

# Coupling roles (Howard, 24 Sep 2026, Influence Map Register card 2 option a): each coupling says which Knowledge Area produces
# the fact and which transitions depend on it. kind condition: the twin engine adds the fact as a guard on every dependent
# transition (Required, or Conditional with a qualifier fact that must be true for the guard to apply). kind event: the
# emitter transitions raise the event in the target Knowledge Area (effect resolve: evidence that resolves the issue the
# named coupling raised). Generated from the coupling text and the fact names, then kept here as the source of truth.
COUPLING_ROLES = {'KAC-DA-01': {'dependents': [{'model': 'KA-DA', 'transition': 'TR-EDA-03'}, {'model': 'KA-DA', 'transition': 'TR-EDA-07'}],
               'kind': 'condition',
               'producer': 'KA-DG',
               'requirement': 'Required'},
 'KAC-DA-02': {'emitters': ['TR-CNF-03', 'TR-CNF-11'], 'kind': 'event', 'producer': 'KA-DA'},
 'KAC-DA-03': {'dependents': [{'model': 'KA-DA', 'transition': 'TR-EDM-04'}, {'model': 'KA-DA', 'transition': 'TR-EDM-06'}],
               'kind': 'condition',
               'producer': 'KA-MM',
               'requirement': 'Required'},
 'KAC-DA-04': {'kind': 'citation', 'producer': 'KA-DA', 'cites': {'model': 'KA-MM', 'transition': 'TR-AST-02'}, 'raises': {'model': 'KA-MM', 'event': 'EV-AST-05'}, 'onlyIf': 'MM_asset_described'},
 'KAC-DA-05': {'dependents': [{'model': 'KA-RMD', 'transition': 'TR-DOM-03'}], 'kind': 'condition', 'producer': 'KA-DA', 'requirement': 'Required'},
 'KAC-DA-06': {'dependents': [{'model': 'KA-DA', 'transition': 'TR-CNF-01'}],
               'kind': 'condition',
               'producer': 'KA-DS',
               'qualifier': 'flow_is_external',
               'requirement': 'Conditional'}}

# State Contracts register (Howard, 25 Sep 2026, cards 7 and 8 option a): each transition names the policy controls that govern it, by
# policy domain and control number of the Knowledge Area policy in the FutureState workbooks (the wording and the implementing
# procedure are resolved per organisation from the private catalogue spec/policy_controls.json and the workbooks). Drafted
# 25 Sep 2026 for Howard's review (status Proposed); an empty list means no control of the allowed domains fits the step.
POLICY_CONTROLS = {'TR-EDA-01': {'controls': [('PD-DARCH', 'C04')], 'why': 'Evaluating existing specifications is the first step in maintaining the target data architecture.'},
 'TR-EDA-02': {'controls': [('PD-DARCH', 'C04'), ('PD-DARCH', 'C05')],
               'why': 'The architecture and its standards are designed as the target and reference architecture.'},
 'TR-EDA-03': {'controls': [('PD-DARCH', 'C04'), ('PD-DARCH', 'C05')],
               'why': 'The blueprint and its standards are approved as the target architecture and technology standards.'},
 'TR-EDA-04': {'controls': [('PD-DARCH', 'C04')], 'why': 'Rejecting the design returns it within target architecture maintenance.'},
 'TR-EDA-05': {'controls': [('PD-DARCH', 'C04'), ('PD-DARCH', 'C05')], 'why': 'The approved blueprint and standards are published for use.'},
 'TR-EDA-06': {'controls': [('PD-DARCH', 'C06')], 'why': 'Opening a revision starts a governed change to the target architecture.'},
 'TR-EDA-07': {'controls': [('PD-DARCH', 'C06')], 'why': 'The revised blueprint is approved as a governed architecture change.'},
 'TR-EDA-08': {'controls': [('PD-DARCH', 'C06')], 'why': 'Retiring the blueprint is a governed change to the target architecture.'},
 'TR-EDM-01': {'controls': [('PD-DARCH', 'C04')], 'why': 'The enterprise data model is scoped as part of the target data architecture.'},
 'TR-EDM-02': {'controls': [('PD-DARCH', 'C04')], 'why': 'The model version is approved under the target architecture standards.'},
 'TR-EDM-03': {'controls': [('PD-DARCH', 'C04')], 'why': 'Rejecting the model version returns it within target architecture maintenance.'},
 'TR-EDM-04': {'controls': [('PD-DARCH', 'C04')], 'why': 'Publishing the approved model makes it the current target architecture model.'},
 'TR-EDM-05': {'controls': [('PD-DARCH', 'C06')], 'why': 'A new model version is a governed change to the target architecture.'},
 'TR-EDM-06': {'controls': [('PD-DARCH', 'C06')], 'why': 'Superseding the published version is a governed architecture change with impact flagging.'},
 'TR-EDM-07': {'controls': [('PD-DARCH', 'C06')], 'why': 'Withdrawing the model is a governed change to the target architecture.'},
 'TR-RMP-01': {'controls': [('PD-DARCH', 'C04')], 'why': 'The roadmap sequences delivery of the target data architecture from its gaps.'},
 'TR-RMP-02': {'controls': [('PD-DARCH', 'C04')], 'why': 'The roadmap sequences delivery of the target data architecture from its gaps.'},
 'TR-RMP-03': {'controls': [('PD-DARCH', 'C04')], 'why': 'Rejecting the roadmap reverses its planning under target architecture maintenance.'},
 'TR-RMP-04': {'controls': [('PD-DARCH', 'C04')], 'why': 'The roadmap sequences delivery of the target data architecture from its gaps.'},
 'TR-RMP-05': {'controls': [('PD-DARCH', 'C15')], 'why': 'Delivery is confirmed by measured business value reported to the governance forum.'},
 'TR-RMP-06': {'controls': [('PD-DARCH', 'C04'), ('PD-DARCH', 'C06')], 'why': 'Re-planning follows a scope, priority or architecture change.'},
 'TR-RMP-07': {'controls': [('PD-DARCH', 'C04')], 'why': 'The roadmap sequences delivery of the target data architecture from its gaps.'},
 'TR-RMP-08': {'controls': [('PD-DARCH', 'C04')], 'why': 'The roadmap sequences delivery of the target data architecture from its gaps.'},
 'TR-CNF-01': {'controls': [('PD-DARCH', 'C10'), ('PD-DARCH', 'C11')],
               'why': 'Placement records the asset in the store and interface inventory and in the governed data flows.'},
 'TR-CNF-02': {'controls': [('PD-DARCH', 'C07')], 'why': 'A conformance review confirms the asset meets the standards in force.'},
 'TR-CNF-03': {'controls': [('PD-DARCH', 'C07')], 'why': 'A conformance review finds the deviation.'},
 'TR-CNF-04': {'controls': [('PD-DARCH', 'C08')], 'why': 'A dated exception is recorded and time-bound in the architecture exception register.'},
 'TR-CNF-05': {'controls': [('PD-DARCH', 'C12'), ('PD-DARCH', 'C07')], 'why': 'The non-conformant asset is remediated and a conformance review confirms it.'},
 'TR-CNF-06': {'controls': [('PD-DARCH', 'C08'), ('PD-DARCH', 'C09')], 'why': 'The time-bound exception expires without its remediation closed.'},
 'TR-CNF-07': {'controls': [('PD-DARCH', 'C09')], 'why': 'Exception remediation is tracked to closure and conformance confirmed.'},
 'TR-CNF-08': {'controls': [('PD-DARCH', 'C06')], 'why': 'An architecture change flags affected assets for reassessment.'},
 'TR-CNF-09': {'controls': [('PD-DARCH', 'C06')], 'why': 'An architecture change flags the asset under exception for reassessment.'},
 'TR-CNF-10': {'controls': [('PD-DARCH', 'C07')], 'why': 'A new conformance review confirms conformance to the revised blueprint.'},
 'TR-CNF-11': {'controls': [('PD-DARCH', 'C07')], 'why': 'A new conformance review finds a deviation against the revised blueprint.'},
 'TR-CNF-12': {'controls': [('PD-DARCH', 'C10')], 'why': 'The disposed or descoped asset is removed from the store and interface inventory.'},
 'TR-CNF-13': {'controls': [('PD-DARCH', 'C12'), ('PD-DARCH', 'C10')], 'why': 'The non-conformant asset is retired and removed from the inventory.'}}

SPEC = {
    "meta": {"modelId": "KA-DA", "name": "Data Architecture FTS", "knowledgeArea": "Data Architecture", "version": "0.1", "subjectType": KA_SUBJECT,
             "regionModel": "One FTS per managed element: the Enterprise Data Architecture (scope level), the Enterprise Data Model (scope level, versioned), the Implementation Roadmap (scope level) and the Architectural Conformance of a Data Asset (one per asset) run concurrently and are coupled by cross-region constraints, facts and events, never a single subject.",
             "source": SRC_DECK + "; " + SRC_HOWARD + "; " + SRC_PROTOCOL,
             "note": "Four state regions, each its own FTS over one managed element of the Knowledge Area: the Enterprise Data Architecture (master blueprint), the Enterprise Data Model (split out as its own versioned blueprint), the Implementation Roadmap and the Architectural Conformance of a Data Asset. The KA never becomes a region of the Data Asset; the blueprints and the per-asset conformance reach the Global protocol through contributions (registration, materialisation, external custody, the assurance suspension trigger and the conformance review service), and couple to DG, Metadata, Reference and Master Data and Data Security.",
             "definition": CONTEXT["definition"], "factBindings": FACT_BINDINGS},
    "context": CONTEXT, "regions": REGIONS, "states": STATES, "transitions": TRANS, "events": EVENTS, "decisionRights": DR, "roles": ROLES, "artefacts": ARTEFACTS, "activities": ACTS, "services": SERVICES, "contributions": CONTRIB, "kaCouplings": KA_COUPLINGS, "couplingRoles": COUPLING_ROLES, "policyControls": POLICY_CONTROLS, "crossRegionConstraints": XRG, "stateVectors": VECTORS, "evidence": EVIDENCE, "exceptions": EXC,
    "sources": [
        {"id": "SRC-DA-001", "source": SRC_DECK, "type": "Primary (image pages, captured)", "location": "Chat upload; OneDrive Data Lifecycle folder", "use": "Definition, goals, drivers, inputs, processes and sub-activities, deliverables, role players, techniques, tools, metrics", "limitations": "The context diagram gives no per-asset conformance lifecycle; the Conformance states (placed, conforming, exception, non-conforming, reassessment due) are drafted from the Lifecycle Reviews technique and the Architecture standards compliance rates metric."},
        {"id": "SRC-DA-002", "source": SRC_HOWARD, "type": "Design direction", "location": "Chat", "use": "Managed elements, Global gating", "limitations": ""},
        {"id": "SRC-DA-003", "source": SRC_PROTOCOL, "type": "Alignment target", "location": "Private repo models/", "use": "Global transition IDs for contributions; KA transition IDs for couplings", "limitations": ""},
    ],
    "qaNotes": [
        {"severity": "note", "rule": "GA-005", "element": "KA-DA", "finding": "The three blueprint regions change rarely relative to an asset and gate the conformance region through XRG-DA-01..07; the Architectural Conformance region is per asset and is the DA region that gates Global materialisation."},
        {"severity": "note", "rule": "capture", "element": "REG-DA-CNF", "finding": "Conformance states are drafted from the Lifecycle Reviews technique and the compliance-rate metric; the context diagram lists no per-asset lifecycle. For Howard's review."},
        {"severity": "note", "rule": "derived", "element": "STATES", "finding": "All state names, events, decision rights, holders and services are first-pass drafts from the context diagram; every one is for Howard's review."},
    ],
}

if __name__ == "__main__":
    from ka_build import run_spec
    run_spec(SPEC, "data_architecture.fts.json")
