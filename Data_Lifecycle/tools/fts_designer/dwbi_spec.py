#!/usr/bin/env python3
"""
dwbi_spec.py  -  Data Warehousing and Business Intelligence FTS v0.1: five state regions, each its own FTS over one
managed element of the Knowledge Area, derived from the DMBOK Data Warehousing and Business Intelligence context
diagram (deck pages 75 to 78) and aligned to the Global Data Asset Protocol.

Howard's managed elements (21 Sep 2026): 1 the DW and BI Architecture of the scope; 2 a Data Warehouse or Data Mart
(one per store); 3 the Population of a Data Asset (one per asset load into the warehouse); 4 a Data Product (one per
report, dashboard or dataset); 5 the BI Portfolio of the scope (learning and adoption plan, release plan, BI activity
monitoring) as a governing element.
Decisions 21 Sep 2026: DWBI gates Global materialisation of a warehoused asset (warehouse in production, population
loaded and reconciled), release of a data product (released under the release plan with lineage in the dictionary),
supersession by a refreshed population; a failed load or a monitoring breach emits the Assurance trigger; load
reconciliation is an assurance service; guards are Conditional so assets outside the warehouse are unaffected; every
transition carries a Decision Right (holders confirmed 22 Sep 2026 from the shared role vocabulary, role_vocabulary.json).

Usage: python dwbi_spec.py [out_dir] [--overrides spec/data_warehousing_bi_overrides.json]   -> data_warehousing_bi.fts.json
"""
import json, os, sys
from ka_build import build

SRC_DECK = "DMBOK Data Lifecycle and KA Context Diagrams.pdf, Data Warehousing and Business Intelligence pages 75 to 78 (What, Why, Activities, Role Players and Technical Drivers)"
SRC_HOWARD = "Howard Diesel, 21 Sep 2026: five DWBI managed elements (DW and BI Architecture; Data Warehouse or Data Mart; Population of a Data Asset; Data Product; BI Portfolio), Global gating of materialise, release, supersede and the assurance triggers, Conditional so assets outside the warehouse are unaffected"
SRC_PROTOCOL = "global_protocol.fts.json v0.2.1 for the contribution targets; data_governance v0.2, data_quality, metadata_management, data_security, data_storage_operations and data_integration_interoperability v0.1 for the couplings"

CONTEXT = {
    "knowledgeArea": "Data Warehousing and Business Intelligence",
    "definition": "Planning, implementation, and control processes to provide decision support data and support knowledge workers engaged in reporting, query, and analysis. The data warehouse is meant to enable decision support systems which could share core enterprise data from a common data model. The enterprise warehouse reduces data redundancy, improves the consistency on information, and enables the enterprise to make better decisions.",
    "ensures": "Decision support data is delivered through warehouses and marts built to the DW and BI architecture, populated by governed, reconciled and lineage-recorded loads, and consumed through data products released under a release plan, adopted and monitored.",
    "goals": ["To build and maintain the technical environment and technical and business processes needed to deliver integrated data in support of operational functions, compliance requirements, and business intelligence activities", "To support and enable effective business analysis and decision making by knowledge workers"],
    "businessDrivers": ["Business Intelligence support", "Compliance requirements", "Support operational activities", "Enables effective business analysis and decision-making", "Find ways to innovate based on insights from data"],
    "inputs": ["Business Requirements", "Scalability, Operational, Infrastructure and Support Requirements", "Data Quality, Security and Access Requirements", "IT Strategy", "Related IT Policies and Standards", "Internal Data Feeds", "Master and Reference Data", "Industry and External Data"],
    "processes": [
        {"id": "1", "name": "Understand Requirements", "phase": "P", "subActivities": []},
        {"id": "2", "name": "Define and Maintain the DW and BI Architecture", "phase": "P", "subActivities": []},
        {"id": "3", "name": "Develop the Data Warehouse and Data Marts", "phase": "D", "subActivities": []},
        {"id": "4", "name": "Populate the Data Warehouse", "phase": "D", "subActivities": []},
        {"id": "5", "name": "Implement the Business Intelligence Portfolio", "phase": "D", "subActivities": []},
        {"id": "6", "name": "Maintain Data Products", "phase": "O", "subActivities": []},
    ],
    "deliverables": ["DW and BI Architecture", "Data Products", "Population Process", "Governance Activities", "Lineage Dictionary", "Learning and Adoption Plan", "Release Plan", "Production Support Process", "Load Tuning Activities", "BI Activity Monitoring"],
    "suppliers": ["Business Executive", "Governance Body", "Enterprise Architecture", "Data Producers", "Information Consumers", "Subject Matter Experts"],
    "participants": ["Sponsors and Product Owner", "Architects and Analysts", "DW/BI Specialists (BI Platform, Data Storage, Information Management)", "Project Management", "Change Management"],
    "consumers": ["Information Consumers", "Customers", "Managers and Executives"],
    "techniques": ["Prototypes to Drive Requirements", "Self Service BI", "Queryable Audit Data"],
    "tools": ["Metadata Repositories", "Data Integration Tools", "Analytic Applications"],
    "metrics": ["Usage Metrics", "Customer/User Satisfaction", "Subject Area Coverage %s", "Response/Performance Metrics"],
    "phaseTags": "(P) Planning, (C) Control, (D) Development, (O) Operations",
}

KA_SUBJECT = "Data Warehousing and Business Intelligence Knowledge Area: five managed elements, one FTS (state region) each; the Data Asset is the Global subject reached through contributions"
REGIONS = [
    ("REG-DWBI-ARC", "DW and BI Architecture", "ARC", "Whether the warehouse and BI architecture of the scope (subject areas, layers, platform, population and governance processes) has its requirements understood, is defined, in force, or under maintenance.", "STS-ARC-01", "Exactly one active state; a maintained architecture supersedes, never coexists with, the architecture in force.",
     "DW and BI Architecture of the governed scope: the subject areas, layers, platform standards, population process pattern and governance activities every warehouse, load and data product is built to",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Governing element (architecture)", "contributesTo": "No Global transition is gated on the architecture directly; it gates the warehouses, loads and products through cross-region constraints.", "conditionsThatMatter": "None; requirements understood; defined; in force; under maintenance."}),
    ("REG-DWBI-DWH", "Data Warehouse or Data Mart", "DWH", "Whether a warehouse or mart is required, developed, in production under the production support process, under load tuning, or retired.", "STS-DWH-01", "Exactly one active state per store; In Production means the store is supported and its response and performance metrics are measured.",
     "Data Warehouse or Data Mart: one decision-support store (enterprise warehouse, subject-area mart, lakehouse zone) developed to the architecture, released to production, supported, tuned and retired",
     {"instanceScope": "One instance per warehouse or mart.", "elementKind": "Managed platform element", "contributesTo": "Existence: a warehoused asset is materialised only in a store in production (TR-EX-02); Assurance: a production-support breach emits the assurance trigger (TR-AS-05).", "conditionsThatMatter": "None; required; developed; in production; under tuning; retired."}),
    ("REG-DWBI-POP", "Population of a Data Asset", "POP", "Whether one asset's population into the warehouse has its process designed, is loaded, reconciled with lineage recorded, failed, refreshed or retired.", "STS-POP-01", "Exactly one active state per warehoused asset; Reconciled means the load balances to source and its lineage is in the dictionary.",
     "Population of a Data Asset: the governed load of one source asset into the warehouse under the Population Process, with its reconciliation, lineage dictionary entry, refresh cycle and load tuning",
     {"instanceScope": "One instance per asset populated into a store.", "elementKind": "Managed per-asset element", "contributesTo": "Existence: a warehoused asset is materialised only when loaded and reconciled (TR-EX-02) and a refresh supersedes the previous population (TR-EX-03); Assurance: a failed load emits the assurance trigger (TR-AS-05) and load reconciliation supplies assurance evidence (TR-AS-02).", "conditionsThatMatter": "None; process designed; loaded; reconciled; load failed; refresh pending; retired."}),
    ("REG-DWBI-PRD", "Data Product", "PRD", "Whether a data product (report, dashboard, dataset, self-service model) is specified, built, released under the release plan, adopted, under a usage alert or a data alert, or retired.", "STS-PRD-01", "Exactly one active state per product; Adopted means usage and satisfaction metrics are measured against the learning and adoption plan.",
     "Data Product: one report, dashboard, dataset or self-service model of the BI portfolio, specified from requirements, built on reconciled populations, released under the release plan, adopted and monitored",
     {"instanceScope": "One instance per data product.", "elementKind": "Managed per-product element (deliverable)", "contributesTo": "Availability: a data product is released only under the release plan with its lineage in the dictionary (TR-AV-01) and restored only when released again (TR-AV-04); Assurance: a BI activity monitoring breach emits the assurance trigger (TR-AS-05).", "conditionsThatMatter": "None; specified; built; released; adopted; usage alert; data alert (suspends access); retired."}),
    ("REG-DWBI-BIP", "BI Portfolio", "BIP", "Whether the BI portfolio of the scope has its learning and adoption plan and release plan approved, is in operation with BI activity monitoring, or under review.", "STS-BIP-01", "Exactly one active state; a portfolio under review keeps its release plan in force.",
     "BI Portfolio of the governed scope: the learning and adoption plan, the release plan and the BI activity monitoring that govern every data product",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Governing element (plan)", "contributesTo": "No Global transition is gated on the portfolio directly; it gates every data product release through cross-region constraints (release plan in force).", "conditionsThatMatter": "None; planned; approved; in operation; under review."}),
]
STATES = [
    ("STS-ARC-01", "REG-DWBI-ARC", "No DW and BI Architecture", True, False, "No warehouse or BI architecture exists for the scope; decision support is ad hoc.", "The absence of an architecture remains visible to governance bodies.", ["inputs:IT Strategy"]),
    ("STS-ARC-02", "REG-DWBI-ARC", "Understood DW Requirements", False, False, "Business, scalability, operational, quality, security and access requirements for decision support are understood, driven by prototypes.", "Each requirement remains traceable to its business or IT input.", ["process:1", "inputs:Business Requirements", "techniques:Prototypes to Drive Requirements"]),
    ("STS-ARC-03", "REG-DWBI-ARC", "Defined DW and BI Architecture", False, False, "Subject areas, layers, platform standards, the population process pattern and governance activities are defined and await approval.", "The design remains consistent with the enterprise and data architectures.", ["process:2", "deliverable:DW and BI Architecture", "deliverable:Governance Activities"]),
    ("STS-ARC-04", "REG-DWBI-ARC", "DW and BI Architecture in Force", False, False, "The architecture is approved and every warehouse, load and product is built to it; subject area coverage is measured.", "Every store in production conforms to the architecture in force; coverage remains current.", ["process:2", "metric:Subject Area Coverage %s"]),
    ("STS-ARC-05", "REG-DWBI-ARC", "DW and BI Architecture Maintenance", False, False, "The architecture is under maintenance after a requirement, platform or strategy trigger while the architecture in force stays in force.", "The architecture in force remains valid until the maintenance is approved.", ["process:2"]),
    ("STS-DWH-01", "REG-DWBI-DWH", "No Warehouse", True, False, "No warehouse or mart exists for the subject area.", "The uncovered subject area remains visible.", ["inputs:Scalability, Operational, Infrastructure and Support Requirements"]),
    ("STS-DWH-02", "REG-DWBI-DWH", "Required Warehouse", False, False, "The store's subject areas, scalability and support requirements are agreed under the architecture.", "Requirements remain traceable to the architecture and the business need.", ["process:1", "process:3"]),
    ("STS-DWH-03", "REG-DWBI-DWH", "Developed Warehouse", False, False, "The store is developed (structures, integration, security) and awaits release to production.", "Acceptance results remain recorded against the requirements.", ["process:3", "tools:Data Integration Tools"]),
    ("STS-DWH-04", "REG-DWBI-DWH", "Warehouse in Production", False, False, "The store is released to production under the production support process; response and performance metrics are measured.", "Response and performance metrics remain within target; the support process is in force.", ["process:6", "deliverable:Production Support Process", "metric:Response/Performance Metrics"]),
    ("STS-DWH-05", "REG-DWBI-DWH", "Warehouse under Tuning", False, False, "A performance or support breach is open; load tuning activities run while the store stays in production.", "The breach, its owner and the DG issue reference remain explicit.", ["deliverable:Load Tuning Activities", "metric:Response/Performance Metrics"]),
    ("STS-DWH-06", "REG-DWBI-DWH", "Retired Warehouse", False, False, "The store is decommissioned after its populations and products are retired or migrated.", "The decommission record and the destination of migrated data remain recorded.", ["process:6"]),
    ("STS-POP-01", "REG-DWBI-POP", "Not Populated", True, False, "The asset is not populated into the warehouse.", "The absence of the asset in the warehouse remains visible.", ["inputs:Internal Data Feeds"]),
    ("STS-POP-02", "REG-DWBI-POP", "Designed Population Process", False, False, "The population process for the asset (source feed, transformation, schedule, reconciliation rules) is designed under the architecture.", "The process design remains consistent with the source exchange and the architecture.", ["process:4", "deliverable:Population Process", "inputs:Master and Reference Data"]),
    ("STS-POP-03", "REG-DWBI-POP", "Loaded Population", False, False, "The asset is loaded into the store by the population process; reconciliation and lineage recording are pending.", "The load record (source, run, row counts) remains recorded.", ["process:4"]),
    ("STS-POP-04", "REG-DWBI-POP", "Reconciled Population", False, False, "The load reconciles to source, queryable audit data is retained and the lineage is recorded in the lineage dictionary.", "Reconciliation balances; the lineage dictionary entry is current.", ["process:4", "deliverable:Lineage Dictionary", "techniques:Queryable Audit Data"]),
    ("STS-POP-05", "REG-DWBI-POP", "Failed Load", False, False, "A load run failed or did not reconcile; the previous reconciled population stays available and a Data Asset issue is logged.", "The failure, its cause and the DG issue reference remain explicit.", ["process:4", "deliverable:Load Tuning Activities"]),
    ("STS-POP-06", "REG-DWBI-POP", "Refresh Pending", False, False, "A new refresh run is loaded and awaits reconciliation while the current reconciled population stays in use.", "The refresh run's differences and reconciliation status remain explicit.", ["process:4"]),
    ("STS-POP-07", "REG-DWBI-POP", "Retired Population", False, False, "The asset is withdrawn from the warehouse; its audit data and lineage are retained.", "Retained audit data and lineage remain retrievable.", ["process:6"]),
    ("STS-PRD-01", "REG-DWBI-PRD", "No Data Product", True, False, "No data product exists for the information need.", "The unmet need remains visible.", ["inputs:Business Requirements"]),
    ("STS-PRD-02", "REG-DWBI-PRD", "Specified Data Product", False, False, "The product's requirements, populations and audience are specified with the product owner, driven by prototypes.", "The specification remains traceable to the requirements and populations.", ["process:1", "process:5", "techniques:Prototypes to Drive Requirements"]),
    ("STS-PRD-03", "REG-DWBI-PRD", "Built Data Product", False, False, "The product is built on reconciled populations and tested; it awaits release under the release plan.", "Test results remain recorded against the specification.", ["process:5", "tools:Analytic Applications", "techniques:Self Service BI"]),
    ("STS-PRD-04", "REG-DWBI-PRD", "Released Data Product", False, False, "The product is released to consumers under the release plan with its lineage in the dictionary and learning material from the adoption plan.", "The release record, lineage and audience remain current.", ["process:5", "deliverable:Release Plan", "deliverable:Data Products"]),
    ("STS-PRD-05", "REG-DWBI-PRD", "Adopted Data Product", False, False, "Usage and satisfaction metrics show the product is adopted; it is maintained under BI activity monitoring.", "Usage and satisfaction remain measured against the adoption plan.", ["process:6", "metric:Usage Metrics", "metric:Customer/User Satisfaction", "deliverable:BI Activity Monitoring"]),
    ("STS-PRD-06", "REG-DWBI-PRD", "Product Usage Alert", False, False, "BI activity monitoring flags a usage or satisfaction shortfall; the product stays available while investigated.", "The alert, its owner and the DG issue reference remain explicit.", ["deliverable:BI Activity Monitoring", "metric:Usage Metrics"]),
    ("STS-PRD-07", "REG-DWBI-PRD", "Retired Data Product", False, False, "The product is withdrawn under the release plan; its specification and lineage are retained.", "The retirement record remains retrievable; consumers are redirected.", ["process:6"]),
    ("STS-PRD-08", "REG-DWBI-PRD", "Product Data Alert", False, False, "BI activity monitoring flags a data or performance issue in the product; access is suspended until resolved.", "The alert, its owner and the DG issue reference remain explicit; consumers are notified.", ["deliverable:BI Activity Monitoring", "metric:Response/Performance Metrics"]),
    ("STS-BIP-01", "REG-DWBI-BIP", "No BI Portfolio", True, False, "No portfolio plans exist; products are released ad hoc.", "The absence of a release plan remains visible.", ["process:5"]),
    ("STS-BIP-02", "REG-DWBI-BIP", "Planned BI Portfolio", False, False, "The learning and adoption plan and the release plan are drafted from the requirements.", "Each planned release remains traceable to a specified product.", ["process:5", "deliverable:Learning and Adoption Plan", "deliverable:Release Plan"]),
    ("STS-BIP-03", "REG-DWBI-BIP", "Approved BI Portfolio", False, False, "The plans are approved by the sponsors and product owner.", "The approved plans and approving authority remain traceable.", ["process:5"]),
    ("STS-BIP-04", "REG-DWBI-BIP", "BI Portfolio in Operation", False, False, "Products are released under the release plan, adoption is supported and BI activity is monitored.", "Every released product is on the release plan; monitoring is active.", ["process:6", "deliverable:BI Activity Monitoring"]),
    ("STS-BIP-05", "REG-DWBI-BIP", "BI Portfolio under Review", False, False, "The plans are under review after usage, satisfaction or strategy findings while the release plan in force stays in force.", "The release plan in force remains valid until the review is approved.", ["metric:Usage Metrics", "metric:Customer/User Satisfaction"]),
]
EVENTS = {
    "EV-ARC-01": ("Requirements understanding", "Request"), "EV-ARC-02": ("Architecture definition", "Evidence trigger"), "EV-ARC-03": ("Architecture approval", "Decision outcome"), "EV-ARC-04": ("Definition rejection", "Decision outcome"), "EV-ARC-05": ("Maintenance trigger", "Monitoring trigger"), "EV-ARC-06": ("Maintained architecture approval", "Decision outcome"), "EV-ARC-07": ("Architecture retirement", "Decision outcome"),
    "EV-DWH-01": ("Warehouse request", "Request"), "EV-DWH-02": ("Development completion", "Evidence trigger"), "EV-DWH-03": ("Production release", "Decision outcome"), "EV-DWH-04": ("Development rejection", "Decision outcome"), "EV-DWH-05": ("Performance breach", "Monitoring trigger"), "EV-DWH-06": ("Tuning completion", "Assessment outcome"), "EV-DWH-07": ("Warehouse retirement", "Decision outcome"),
    "EV-POP-01": ("Population request", "Request"), "EV-POP-02": ("Load completion", "Evidence trigger"), "EV-POP-03": ("Reconciliation success", "Assessment outcome"), "EV-POP-04": ("Load failure", "Monitoring trigger"), "EV-POP-05": ("Refresh run", "Time trigger"), "EV-POP-06": ("Population retirement", "Decision outcome"), "EV-POP-07": ("Load remediation", "Evidence trigger"),
    "EV-PRD-01": ("Product request", "Request"), "EV-PRD-02": ("Build completion", "Evidence trigger"), "EV-PRD-03": ("Product release", "Decision outcome"), "EV-PRD-04": ("Build rejection", "Decision outcome"), "EV-PRD-05": ("Adoption confirmation", "Assessment outcome"), "EV-PRD-06": ("Usage alert", "Monitoring trigger"), "EV-PRD-10": ("Data or performance alert", "Monitoring trigger"), "EV-PRD-07": ("Alert resolution", "Assessment outcome"), "EV-PRD-08": ("Product retirement", "Decision outcome"), "EV-PRD-09": ("Product change request", "Request"),
    "EV-BIP-01": ("Portfolio planning", "Request"), "EV-BIP-02": ("Portfolio approval", "Decision outcome"), "EV-BIP-03": ("Portfolio activation", "Decision outcome"), "EV-BIP-04": ("Portfolio review trigger", "Monitoring trigger"), "EV-BIP-05": ("Reviewed portfolio approval", "Decision outcome"), "EV-BIP-06": ("Portfolio retirement", "Decision outcome"), "EV-BIP-07": ("Plan rejection", "Decision outcome"),
}
DR = {
    "DR-DWBI-01": ("Approve the DW and BI Architecture", "ROLE-PM-DWBI", "Confirmed 22 Sep 2026 (holder register): Data Warehousing and Business Intelligence Practice Manager; drafted as Architects and Analysts"),
    "DR-DWBI-02": ("Understand Requirements, Maintain and Retire the Architecture", "ROLE-DARCH", "Confirmed 22 Sep 2026 (holder register): Data Architect; drafted as Architects and Analysts"),
    "DR-DWBI-03": ("Develop, Release, Tune and Retire a Warehouse or Mart", "ROLE-DENG", "Confirmed 22 Sep 2026 (holder register): Data Engineer; drafted as DW/BI Specialists (BI Platform, Data Storage, Information Management)"),
    "DR-DWBI-04": ("Design, Load, Reconcile, Refresh and Retire a Population", "ROLE-DENG", "Confirmed 22 Sep 2026 (holder register): Data Engineer; drafted as DW/BI Specialists (BI Platform, Data Storage, Information Management)"),
    "DR-DWBI-05": ("Specify, Build and Change a Data Product", "ROLE-DPO", "Confirmed 22 Sep 2026 (holder register): Data Product Owner; drafted as Sponsors and Product Owner"),
    "DR-DWBI-06": ("Release, Confirm Adoption and Retire a Data Product", "ROLE-DPO", "Confirmed 22 Sep 2026 (holder register): Data Product Owner; drafted as Sponsors and Product Owner"),
    "DR-DWBI-07": ("Raise and Resolve a Monitoring Alert", "ROLE-DENG", "Confirmed 22 Sep 2026 (holder register): Data Engineer; drafted as DW/BI Specialists (BI Platform, Data Storage, Information Management)"),
    "DR-DWBI-08": ("Approve, Activate, Review and Retire the BI Portfolio Plans", "ROLE-PM-DWBI", "Confirmed 22 Sep 2026 (holder register): Data Warehousing and Business Intelligence Practice Manager; drafted as Sponsors and Product Owner"),
}
ROLES = [
    ("ROLE-DWBI-S01", "Business Executive", "Supplier", "Supplies business requirements and priorities."), ("ROLE-DWBI-S02", "Governance Body", "Supplier", "Supplies governance activities and policies."), ("ROLE-DWBI-S03", "Enterprise Architecture", "Supplier", "Supplies the enterprise and data architectures."), ("ROLE-DWBI-S04", "Data Producers", "Supplier", "Supply the internal data feeds."), ("ROLE-DWBI-S05", "Information Consumers", "Supplier", "Supply information needs and feedback."), ("ROLE-DWBI-S06", "Subject Matter Experts", "Supplier", "Supply business meaning."),
    ("ROLE-DWBI-P01", "Sponsors and Product Owner", "Participant", "Own the portfolio plans and the data products."), ("ROLE-DWBI-P02", "Architects and Analysts", "Participant", "Define the architecture; analyse requirements."), ("ROLE-DWBI-P03", "DW/BI Specialists (BI Platform, Data Storage, Information Management)", "Participant", "Develop, populate, support and tune the warehouses; monitor BI activity."), ("ROLE-DWBI-P04", "Project Management", "Participant", "Deliver warehouses and products."), ("ROLE-DWBI-P05", "Change Management", "Participant", "Run the learning and adoption plan."),
    ("ROLE-DWBI-C01", "Information Consumers", "Consumer", "Consume data products."), ("ROLE-DWBI-C02", "Customers", "Consumer", "Consume customer-facing products."), ("ROLE-DWBI-C03", "Managers and Executives", "Consumer", "Consume decision support."),
]
TRANS = [
    ("TR-ARC-01", "Understand DW Requirements", "STS-ARC-01", "STS-ARC-02", "EV-ARC-01", "Business, scalability, quality, security and access requirements and the IT strategy are available as inputs.", "DR-DWBI-02", ["SVC-DWBI-01"], ["ACT-DWBI-1"]),
    ("TR-ARC-02", "Define DW and BI Architecture", "STS-ARC-02", "STS-ARC-03", "EV-ARC-02", "Subject areas, layers, platform standards, the population process pattern and governance activities are defined within the data architecture in force.", "DR-DWBI-02", ["SVC-DWBI-01"], ["ACT-DWBI-2"]),
    ("TR-ARC-03", "Approve DW and BI Architecture", "STS-ARC-03", "STS-ARC-04", "EV-ARC-03", "The architecture is approved by the governance body and sponsors.", "DR-DWBI-01", ["SVC-DWBI-01"], ["ACT-DWBI-2"]),
    ("TR-ARC-04", "Return Architecture Definition", "STS-ARC-03", "STS-ARC-02", "EV-ARC-04", "The definition is rejected with recorded reasons.", "DR-DWBI-01", ["SVC-DWBI-01"], ["ACT-DWBI-2"]),
    ("TR-ARC-05", "Open Architecture Maintenance", "STS-ARC-04", "STS-ARC-05", "EV-ARC-05", "A requirement, platform or strategy trigger is recorded; the architecture in force is retained meanwhile.", "DR-DWBI-02", ["SVC-DWBI-01"], ["ACT-DWBI-2"]),
    ("TR-ARC-06", "Approve Maintained Architecture", "STS-ARC-05", "STS-ARC-04", "EV-ARC-06", "The maintained architecture is approved.", "DR-DWBI-01", ["SVC-DWBI-01"], ["ACT-DWBI-2"]),
    ("TR-ARC-07", "Retire DW and BI Architecture", "STS-ARC-05", "STS-ARC-01", "EV-ARC-07", "No store is in production under the architecture and the retirement is recorded.", "DR-DWBI-02", ["SVC-DWBI-01"], ["ACT-DWBI-2"]),
    ("TR-DWH-01", "Require Warehouse", "STS-DWH-01", "STS-DWH-02", "EV-DWH-01", "The store's subject areas and requirements are agreed under the architecture.", "DR-DWBI-03", ["SVC-DWBI-02"], ["ACT-DWBI-1", "ACT-DWBI-3"]),
    ("TR-DWH-02", "Develop Warehouse", "STS-DWH-02", "STS-DWH-03", "EV-DWH-02", "The store is developed in an environment in service and accepted against its requirements.", "DR-DWBI-03", ["SVC-DWBI-02"], ["ACT-DWBI-3"]),
    ("TR-DWH-03", "Release Warehouse to Production", "STS-DWH-03", "STS-DWH-04", "EV-DWH-03", "The production support process is in place and monitoring active.", "DR-DWBI-03", ["SVC-DWBI-03"], ["ACT-DWBI-3", "ACT-DWBI-6"]),
    ("TR-DWH-04", "Return Warehouse for Rework", "STS-DWH-03", "STS-DWH-02", "EV-DWH-04", "Acceptance fails with recorded reasons.", "DR-DWBI-03", ["SVC-DWBI-02"], ["ACT-DWBI-3"]),
    ("TR-DWH-05", "Open Load Tuning", "STS-DWH-04", "STS-DWH-05", "EV-DWH-05", "A response, performance or support breach is detected; a Data Asset issue is logged and the assurance trigger emitted.", "DR-DWBI-03", ["SVC-DWBI-03"], ["ACT-DWBI-6"]),
    ("TR-DWH-06", "Complete Tuning", "STS-DWH-05", "STS-DWH-04", "EV-DWH-06", "Load tuning returns the store within its targets.", "DR-DWBI-03", ["SVC-DWBI-03"], ["ACT-DWBI-6"]),
    ("TR-DWH-07", "Retire Warehouse", "STS-DWH-04", "STS-DWH-06", "EV-DWH-07", "All populations and products are retired or migrated and the decommission recorded.", "DR-DWBI-03", ["SVC-DWBI-02"], ["ACT-DWBI-6"]),
    ("TR-DWH-08", "Retire Warehouse under Tuning", "STS-DWH-05", "STS-DWH-06", "EV-DWH-07", "A store that cannot be tuned to target is replaced; populations and products migrated or retired first.", "DR-DWBI-03", ["SVC-DWBI-02"], ["ACT-DWBI-6"]),
    ("TR-DWH-09", "Rebuild Warehouse", "STS-DWH-06", "STS-DWH-02", "EV-DWH-01", "A retired store is required again and its requirements re-agreed.", "DR-DWBI-03", ["SVC-DWBI-02"], ["ACT-DWBI-1"]),
    ("TR-POP-01", "Design Population Process", "STS-POP-01", "STS-POP-02", "EV-POP-01", "The source feed, transformations, schedule and reconciliation rules are designed for the asset under the architecture.", "DR-DWBI-04", ["SVC-DWBI-04"], ["ACT-DWBI-4"]),
    ("TR-POP-02", "Load Asset", "STS-POP-02", "STS-POP-03", "EV-POP-02", "The population process runs into a store in production over the asset's exchange.", "DR-DWBI-04", ["SVC-DWBI-04"], ["ACT-DWBI-4"]),
    ("TR-POP-03", "Reconcile Load", "STS-POP-03", "STS-POP-04", "EV-POP-03", "The load balances to source, audit data is retained and the lineage recorded in the dictionary.", "DR-DWBI-04", ["SVC-DWBI-05"], ["ACT-DWBI-4"]),
    ("TR-POP-04", "Fail Load", "STS-POP-03", "STS-POP-05", "EV-POP-04", "The load run fails or does not reconcile; a Data Asset issue is logged and the assurance trigger emitted.", "DR-DWBI-07", ["SVC-DWBI-05"], ["ACT-DWBI-4"]),
    ("TR-POP-05", "Remediate Load", "STS-POP-05", "STS-POP-03", "EV-POP-07", "The cause is remediated and the load rerun.", "DR-DWBI-04", ["SVC-DWBI-04"], ["ACT-DWBI-4"]),
    ("TR-POP-06", "Run Refresh", "STS-POP-04", "STS-POP-06", "EV-POP-05", "A scheduled or requested refresh run loads new data; the current reconciled population stays in use.", "DR-DWBI-04", ["SVC-DWBI-04"], ["ACT-DWBI-4"]),
    ("TR-POP-07", "Reconcile Refresh", "STS-POP-06", "STS-POP-04", "EV-POP-03", "The refresh reconciles and supersedes the previous population; lineage updated.", "DR-DWBI-04", ["SVC-DWBI-05"], ["ACT-DWBI-4"]),
    ("TR-POP-08", "Fail Refresh", "STS-POP-06", "STS-POP-05", "EV-POP-04", "The refresh fails; the previous reconciled population stays available and an issue is logged.", "DR-DWBI-07", ["SVC-DWBI-05"], ["ACT-DWBI-4"]),
    ("TR-POP-09", "Retire Population", "STS-POP-04", "STS-POP-07", "EV-POP-06", "The asset is withdrawn from the warehouse with no product depending on it; audit data and lineage retained.", "DR-DWBI-04", ["SVC-DWBI-04"], ["ACT-DWBI-6"]),
    ("TR-POP-10", "Retire Failed Population", "STS-POP-05", "STS-POP-07", "EV-POP-06", "A failed population is withdrawn instead of remediated.", "DR-DWBI-04", ["SVC-DWBI-04"], ["ACT-DWBI-6"]),
    ("TR-POP-11", "Re-populate Asset", "STS-POP-07", "STS-POP-02", "EV-POP-01", "A retired population is needed again and its process redesigned.", "DR-DWBI-04", ["SVC-DWBI-04"], ["ACT-DWBI-4"]),
    ("TR-PRD-01", "Specify Data Product", "STS-PRD-01", "STS-PRD-02", "EV-PRD-01", "The product is specified with the product owner from the requirements, using prototypes.", "DR-DWBI-05", ["SVC-DWBI-06"], ["ACT-DWBI-1", "ACT-DWBI-5"]),
    ("TR-PRD-02", "Build Data Product", "STS-PRD-02", "STS-PRD-03", "EV-PRD-02", "The product is built on reconciled populations and tested against its specification.", "DR-DWBI-05", ["SVC-DWBI-06"], ["ACT-DWBI-5"]),
    ("TR-PRD-03", "Return Product for Rework", "STS-PRD-03", "STS-PRD-02", "EV-PRD-04", "Testing fails against the specification.", "DR-DWBI-05", ["SVC-DWBI-06"], ["ACT-DWBI-5"]),
    ("TR-PRD-04", "Release Data Product", "STS-PRD-03", "STS-PRD-04", "EV-PRD-03", "The product is released under the release plan with its lineage in the dictionary and learning material available.", "DR-DWBI-06", ["SVC-DWBI-07"], ["ACT-DWBI-5"]),
    ("TR-PRD-05", "Confirm Adoption", "STS-PRD-04", "STS-PRD-05", "EV-PRD-05", "Usage and satisfaction metrics meet the adoption plan.", "DR-DWBI-06", ["SVC-DWBI-08"], ["ACT-DWBI-6"]),
    ("TR-PRD-06", "Raise Usage Alert", "STS-PRD-05", "STS-PRD-06", "EV-PRD-06", "BI activity monitoring flags a usage or satisfaction shortfall; a Data Asset issue is logged and the assurance trigger emitted.", "DR-DWBI-07", ["SVC-DWBI-08"], ["ACT-DWBI-6"]),
    ("TR-PRD-13", "Raise Data Alert", "STS-PRD-05", "STS-PRD-08", "EV-PRD-10", "BI activity monitoring flags a data or performance issue; a Data Asset issue is logged and the assurance and access-suspension triggers emitted.", "DR-DWBI-07", ["SVC-DWBI-08"], ["ACT-DWBI-6"]),
    ("TR-PRD-14", "Resolve Data Alert", "STS-PRD-08", "STS-PRD-05", "EV-PRD-07", "The data or performance cause is resolved and the product verified.", "DR-DWBI-07", ["SVC-DWBI-08"], ["ACT-DWBI-6"]),
    ("TR-PRD-15", "Retire Product on Data Alert", "STS-PRD-08", "STS-PRD-07", "EV-PRD-08", "An unresolved data alert leads to withdrawal under the release plan.", "DR-DWBI-06", ["SVC-DWBI-07"], ["ACT-DWBI-6"]),
    ("TR-PRD-07", "Resolve Usage Alert", "STS-PRD-06", "STS-PRD-05", "EV-PRD-07", "The cause is resolved and the metrics recover.", "DR-DWBI-07", ["SVC-DWBI-08"], ["ACT-DWBI-6"]),
    ("TR-PRD-08", "Change Data Product", "STS-PRD-05", "STS-PRD-02", "EV-PRD-09", "A change request re-opens the specification; the released product stays available until the new version is released.", "DR-DWBI-05", ["SVC-DWBI-06"], ["ACT-DWBI-5"]),
    ("TR-PRD-09", "Retire Data Product", "STS-PRD-05", "STS-PRD-07", "EV-PRD-08", "The product is withdrawn under the release plan and consumers redirected.", "DR-DWBI-06", ["SVC-DWBI-07"], ["ACT-DWBI-6"]),
    ("TR-PRD-10", "Retire Product on Usage Alert", "STS-PRD-06", "STS-PRD-07", "EV-PRD-08", "An unresolved usage alert leads to withdrawal under the release plan.", "DR-DWBI-06", ["SVC-DWBI-07"], ["ACT-DWBI-6"]),
    ("TR-PRD-11", "Retire Unadopted Product", "STS-PRD-04", "STS-PRD-07", "EV-PRD-08", "A released product that is not adopted is withdrawn under the release plan.", "DR-DWBI-06", ["SVC-DWBI-07"], ["ACT-DWBI-6"]),
    ("TR-PRD-12", "Respecify Retired Product", "STS-PRD-07", "STS-PRD-02", "EV-PRD-01", "A retired product is requested again and respecified.", "DR-DWBI-05", ["SVC-DWBI-06"], ["ACT-DWBI-5"]),
    ("TR-BIP-01", "Plan BI Portfolio", "STS-BIP-01", "STS-BIP-02", "EV-BIP-01", "The learning and adoption plan and release plan are drafted from the specified products.", "DR-DWBI-08", ["SVC-DWBI-09"], ["ACT-DWBI-5"]),
    ("TR-BIP-02", "Approve BI Portfolio", "STS-BIP-02", "STS-BIP-03", "EV-BIP-02", "The sponsors and product owner approve the plans.", "DR-DWBI-08", ["SVC-DWBI-09"], ["ACT-DWBI-5"]),
    ("TR-BIP-03", "Return Portfolio Plans", "STS-BIP-02", "STS-BIP-01", "EV-BIP-07", "The plans are rejected with recorded reasons.", "DR-DWBI-08", ["SVC-DWBI-09"], ["ACT-DWBI-5"]),
    ("TR-BIP-04", "Activate BI Portfolio", "STS-BIP-03", "STS-BIP-04", "EV-BIP-03", "The release plan is in force and BI activity monitoring active.", "DR-DWBI-08", ["SVC-DWBI-08", "SVC-DWBI-09"], ["ACT-DWBI-5", "ACT-DWBI-6"]),
    ("TR-BIP-05", "Open Portfolio Review", "STS-BIP-04", "STS-BIP-05", "EV-BIP-04", "Usage, satisfaction or strategy findings trigger a review; the release plan in force is retained meanwhile.", "DR-DWBI-08", ["SVC-DWBI-09"], ["ACT-DWBI-6"]),
    ("TR-BIP-06", "Approve Reviewed Portfolio", "STS-BIP-05", "STS-BIP-04", "EV-BIP-05", "The reviewed plans are approved and in operation.", "DR-DWBI-08", ["SVC-DWBI-09"], ["ACT-DWBI-5"]),
    ("TR-BIP-07", "Retire BI Portfolio", "STS-BIP-05", "STS-BIP-01", "EV-BIP-06", "No product is released under the plans and the retirement is recorded.", "DR-DWBI-08", ["SVC-DWBI-09"], ["ACT-DWBI-6"]),
]
SERVICES = [
    ("SVC-DWBI-01", "Governance", "DW Requirements and Architecture", "Requirements understanding; architecture definition, approval, maintenance, retirement.", "Understood requirements; DW and BI Architecture; governance activities."),
    ("SVC-DWBI-02", "Control", "Warehouse Development and Decommission", "Warehouse request; development; retirement.", "Developed store accepted against requirements; decommission record."),
    ("SVC-DWBI-03", "Assurance", "Production Support and Performance Monitoring", "Production release; performance breach; tuning.", "Production support process; response and performance metrics; load tuning results."),
    ("SVC-DWBI-04", "Control", "Population Process", "Population request; load; refresh; remediation; retirement.", "Designed population process; load runs; refresh runs."),
    ("SVC-DWBI-05", "Assurance", "Load Reconciliation and Lineage Recording", "Load completion; refresh; failure.", "Reconciliation result; queryable audit data; lineage dictionary entry."),
    ("SVC-DWBI-06", "Control", "Data Product Specification and Build", "Product request; change request; build.", "Specified and built data product tested against its specification."),
    ("SVC-DWBI-07", "Governance", "Product Release under the Release Plan", "Built product; retirement.", "Released product with lineage and learning material; retirement record."),
    ("SVC-DWBI-08", "Assurance", "BI Activity Monitoring and Adoption Measurement", "Portfolio activation; adoption confirmation; alerts.", "Usage and satisfaction metrics; monitoring alerts."),
    ("SVC-DWBI-09", "Governance", "BI Portfolio Planning", "Portfolio planning, approval, activation, review, retirement.", "Learning and adoption plan; release plan."),
]
ACTS = [
    ("ACT-DWBI-1", "Understand Requirements", "1", "Transition-causing", ["REG-DWBI-ARC", "REG-DWBI-DWH", "REG-DWBI-PRD"], ["TR-ARC-01", "TR-DWH-01", "TR-DWH-09", "TR-PRD-01"], ["SVC-DWBI-01", "SVC-DWBI-02", "SVC-DWBI-06"]),
    ("ACT-DWBI-2", "Define and Maintain the DW and BI Architecture", "2", "Transition-causing", ["REG-DWBI-ARC"], ["TR-ARC-02", "TR-ARC-03", "TR-ARC-04", "TR-ARC-05", "TR-ARC-06", "TR-ARC-07"], ["SVC-DWBI-01"]),
    ("ACT-DWBI-3", "Develop the Data Warehouse and Data Marts", "3", "Transition-causing", ["REG-DWBI-DWH"], ["TR-DWH-01", "TR-DWH-02", "TR-DWH-03", "TR-DWH-04"], ["SVC-DWBI-02", "SVC-DWBI-03"]),
    ("ACT-DWBI-4", "Populate the Data Warehouse", "4", "Transition-causing", ["REG-DWBI-POP"], ["TR-POP-01", "TR-POP-02", "TR-POP-03", "TR-POP-04", "TR-POP-05", "TR-POP-06", "TR-POP-07", "TR-POP-08", "TR-POP-11"], ["SVC-DWBI-04", "SVC-DWBI-05"]),
    ("ACT-DWBI-5", "Implement the Business Intelligence Portfolio", "5", "Transition-causing", ["REG-DWBI-PRD", "REG-DWBI-BIP"], ["TR-PRD-01", "TR-PRD-02", "TR-PRD-03", "TR-PRD-04", "TR-PRD-08", "TR-PRD-12", "TR-BIP-01", "TR-BIP-02", "TR-BIP-03", "TR-BIP-04", "TR-BIP-06"], ["SVC-DWBI-06", "SVC-DWBI-07", "SVC-DWBI-09"]),
    ("ACT-DWBI-6", "Maintain Data Products", "6", "Transition-causing", ["REG-DWBI-DWH", "REG-DWBI-POP", "REG-DWBI-PRD", "REG-DWBI-BIP"], ["TR-DWH-03", "TR-DWH-05", "TR-DWH-06", "TR-DWH-07", "TR-DWH-08", "TR-POP-09", "TR-POP-10", "TR-PRD-05", "TR-PRD-06", "TR-PRD-07", "TR-PRD-09", "TR-PRD-10", "TR-PRD-11", "TR-PRD-13", "TR-PRD-14", "TR-PRD-15", "TR-BIP-04", "TR-BIP-05", "TR-BIP-07"], ["SVC-DWBI-03", "SVC-DWBI-08"]),
]
ARTEFACTS = [
    ("ART-DWBI-01", "DW and BI Architecture", "STS-ARC-04", "Define and Maintain the DW and BI Architecture", "Evidences the architecture in force."), ("ART-DWBI-02", "Population Process", "STS-POP-02", "Populate the Data Warehouse", "Evidences Designed Population Process."), ("ART-DWBI-03", "Lineage Dictionary", "STS-POP-04", "Populate the Data Warehouse", "Evidences Reconciled Population; cited by Global materialisation and release."), ("ART-DWBI-04", "Data Products", "STS-PRD-04", "Implement the Business Intelligence Portfolio", "Evidences Released Data Product; cited by Global release."), ("ART-DWBI-05", "Release Plan", "STS-BIP-03", "Implement the Business Intelligence Portfolio", "Evidences Approved BI Portfolio; gates every product release."), ("ART-DWBI-06", "Learning and Adoption Plan", "STS-BIP-03", "Implement the Business Intelligence Portfolio", "Evidences Approved BI Portfolio."), ("ART-DWBI-07", "Production Support Process", "STS-DWH-04", "Develop the Data Warehouse and Data Marts", "Evidences Warehouse in Production."), ("ART-DWBI-08", "BI Activity Monitoring", "STS-BIP-04", "Maintain Data Products", "Evidences BI Portfolio in Operation."), ("ART-DWBI-09", "Governance Activities", "STS-ARC-03", "Define and Maintain the DW and BI Architecture", "Evidences Defined DW and BI Architecture."), ("ART-DWBI-10", "Load Tuning Activities", "STS-DWH-05", "Maintain Data Products", "Evidences Warehouse under Tuning."),
]
CONTRIB = [
    ("CON-DWBI-01", "TR-EX-02", "guard", {"DWH": ["STS-DWH-04", "STS-DWH-05"], "POP": ["STS-POP-04", "STS-POP-06"]}, "A warehoused asset is materialised only in a store in production with its population loaded and reconciled.", "(DWBI_warehouse_in_production and DWBI_population_reconciled) or not DWBI_population_active", "Conditional", "Applies when the asset is populated into a warehouse; assets outside the warehouse are unaffected."),
    ("CON-DWBI-02", "TR-AV-01", "guard", {"PRD": ["STS-PRD-04", "STS-PRD-05", "STS-PRD-06", "STS-PRD-08"], "POP": ["STS-POP-04", "STS-POP-06"]}, "Access to a data product is released only when the product is released under the release plan on a reconciled population with lineage in the dictionary.", "(DWBI_product_released and DWBI_population_reconciled) or not DWBI_product_active", "Conditional", "Applies to the data product as its own asset instance."),
    ("CON-DWBI-03", "TR-AV-04", "guard", {"PRD": ["STS-PRD-04", "STS-PRD-05", "STS-PRD-06"]}, "Suspended access to a data product is restored only when the product is released and free of data alerts.", "DWBI_product_released_clear or not DWBI_product_active", "Conditional", ""),
    ("CON-DWBI-04", "TR-EX-03", "event", {"POP": ["STS-POP-06"]}, "A reconciled refresh supersedes the previous population of the asset.", "DWBI_refresh_pending", "Conditional", "DWBI emits EV-EX-03 when TR-POP-07 reconciles a refresh."),
    ("CON-DWBI-05", "TR-AS-05", "event", {"POP": ["STS-POP-05"], "DWH": ["STS-DWH-05"], "PRD": ["STS-PRD-06", "STS-PRD-08"]}, "A failed load, a warehouse performance breach or a product alert is a material change affecting the assurance claim.", "DWBI_load_failed or DWBI_warehouse_tuning or DWBI_product_alert", "Conditional", "DWBI emits EV-AS-05 when TR-POP-04, TR-POP-08, TR-DWH-05, TR-PRD-06 or TR-PRD-13 fires."),
    ("CON-DWBI-06", "TR-AS-02", "service", {"POP": ["STS-POP-04"]}, "Load Reconciliation and Lineage Recording supplies assurance evidence for the warehoused asset.", "SVC-DWBI-05", "Conditional", "Assurance service; evidence EVD-DWBI-04."),
    ("CON-DWBI-07", "TR-AV-03", "event", {"PRD": ["STS-PRD-08"]}, "A product data or performance alert suspends access to the product until resolved; a usage alert does not.", "DWBI_product_data_alert", "Conditional", "DWBI emits EV-AV-03 when TR-PRD-13 fires (Howard, 21 Sep: suspend only on a data issue)."),
    ("CON-DWBI-08", "TR-CP-01", "guard", {"DWH": ["STS-DWH-04", "STS-DWH-05"], "POP": ["STS-POP-02", "STS-POP-03", "STS-POP-04", "STS-POP-05", "STS-POP-06"]}, "A warehouse population is taken into active custody only in a warehouse in production.", "DWBI_warehouse_in_production or not DWBI_population_active", "Conditional", "Howard, 22 Sep (open decisions record, Custody sweep)."),
    ("CON-DWBI-09", "TR-CP-02", "guard", {"POP": ["STS-POP-04", "STS-POP-06"]}, "A population enters preservation custody only when reconciled; a failed load is never preserved.", "DWBI_population_reconciled or not DWBI_population_active", "Conditional", "Howard, 22 Sep (open decisions record, Custody sweep)."),
    ("CON-DWBI-10", "TR-CP-05", "event", {"DWH": ["STS-DWH-06"]}, "Retirement of a warehouse (TR-DWH-07 or TR-DWH-08) triggers the custody transfer of the populations it held.", "DWBI_warehouse_retired", "Conditional", "Howard, 22 Sep (open decisions record, Custody sweep): event emitted into the Global protocol; the DSO, DII and DG guards on TR-CP-05 still decide."),
    ("CON-DWBI-11", "TR-CP-10", "guard", {"POP": ["STS-POP-01", "STS-POP-07"], "PRD": ["STS-PRD-01", "STS-PRD-07"]}, "Custody is closed after destruction only when no live population or data product still depends on the asset.", "not DWBI_population_active and not DWBI_product_active", "Conditional", "Howard, 22 Sep (open decisions record, Custody sweep)."),
    ("CON-DWBI-12", "TR-AV-01", "event", {"PRD": ["STS-PRD-04"]}, "A data product released under the release plan is the request to release access to it.", "DWBI_product_active and DWBI_product_released", "Conditional", "Howard, 23 Sep 2026: eleven Knowledge Areas gated TR-AV-01 and none raised it. Each Knowledge Area that owns an asset kind now raises the release request for the assets of its kind. Data Warehousing and BI owns the data product; DWBI emits EV-AV-01 when TR-PRD-04 fires."),
]
KA_COUPLINGS = [
    ("KAC-DWBI-01", "KA-DA", "TR-EDA-05", "", "DA_architecture_in_force", "The DW and BI architecture is defined within the Enterprise Data Architecture in force (TR-ARC-02 cites the DA fact).", "Reverse coupling: a DWBI transition cites a DA fact."),
    ("KAC-DWBI-02", "KA-DSO", "TR-ENV-03", "", "DSO_environment_in_service", "A warehouse is developed and released only in an environment in service (TR-DWH-02 and TR-DWH-03 cite the DSO fact).", "Reverse coupling: a DWBI transition cites a DSO fact."),
    ("KAC-DWBI-03", "KA-DII", "TR-EXC-07", "", "DII_exchange_operating", "An asset is loaded into the warehouse over an exchange in operation (TR-POP-02 and TR-POP-06 cite the DII fact).", "Reverse coupling: a DWBI transition cites a DII fact."),
    ("KAC-DWBI-04", "KA-MM", "TR-AST-03", "", "DWBI_population_reconciled", "The lineage dictionary entry of a reconciled population is published as the asset's lineage metadata (the MM transition cites the DWBI fact).", "Forward coupling: an MM transition cites a DWBI fact."),
    ("KAC-DWBI-05", "KA-DQ", "TR-PDCA-03", "", "DQ_conforming", "A data product is released only on populations whose quality is confirmed conforming (TR-PRD-04 cites the DQ fact).", "Reverse coupling: a DWBI transition cites a DQ fact."),
    ("KAC-DWBI-06", "KA-DS", "TR-CLS-02", "", "DS_classified", "A data product is released only for classified data to an audience allowed by the classification and privacy basis (TR-PRD-04 cites DS_classified and DS_privacy_basis_ok).", "Reverse coupling: a DWBI transition cites DS facts."),
    ("KAC-DWBI-07", "KA-DG", "TR-ISS-01", "EV-ISS-01", "DWBI_load_failed", "A failed load, a warehouse breach or a product alert is logged as a Data Asset issue with source Data Warehousing and BI (TR-POP-04, TR-POP-08, TR-DWH-05 and TR-PRD-06 emit EV-ISS-01).", "DG owns escalation; DWBI owns the remediation."),
    ("KAC-DWBI-08", "KA-RMD", "TR-DOM-05", "", "RMD_domain_shared", "Master and reference data are populated into the warehouse from a shared domain (TR-POP-01 cites the RMD fact for master data feeds).", "Reverse coupling: a DWBI transition cites an RMD fact."),
]
FACT_BINDINGS = {
    "DWBI_warehouse_retired": {"region": "REG-DWBI-DWH", "states": ["STS-DWH-06"]},
    "DWBI_architecture_in_force": {"region": "REG-DWBI-ARC", "states": ["STS-ARC-04", "STS-ARC-05"]},
    "DWBI_warehouse_in_production": {"region": "REG-DWBI-DWH", "states": ["STS-DWH-04", "STS-DWH-05"]},
    "DWBI_warehouse_tuning": {"region": "REG-DWBI-DWH", "states": ["STS-DWH-05"]},
    "DWBI_population_active": {"region": "REG-DWBI-POP", "states": ["STS-POP-02", "STS-POP-03", "STS-POP-04", "STS-POP-05", "STS-POP-06"]},
    "DWBI_population_reconciled": {"region": "REG-DWBI-POP", "states": ["STS-POP-04", "STS-POP-06"]},
    "DWBI_load_failed": {"region": "REG-DWBI-POP", "states": ["STS-POP-05"]},
    "DWBI_refresh_pending": {"region": "REG-DWBI-POP", "states": ["STS-POP-06"]},
    "DWBI_product_active": {"region": "REG-DWBI-PRD", "states": ["STS-PRD-02", "STS-PRD-03", "STS-PRD-04", "STS-PRD-05", "STS-PRD-06", "STS-PRD-08"]},
    "DWBI_product_released": {"region": "REG-DWBI-PRD", "states": ["STS-PRD-04", "STS-PRD-05", "STS-PRD-06", "STS-PRD-08"]},
    "DWBI_product_released_clear": {"region": "REG-DWBI-PRD", "states": ["STS-PRD-04", "STS-PRD-05", "STS-PRD-06"]},
    "DWBI_product_alert": {"region": "REG-DWBI-PRD", "states": ["STS-PRD-06", "STS-PRD-08"]},
    "DWBI_product_data_alert": {"region": "REG-DWBI-PRD", "states": ["STS-PRD-08"]},
    "DWBI_release_plan_in_force": {"region": "REG-DWBI-BIP", "states": ["STS-BIP-04", "STS-BIP-05"]},
}
XRG = [
    ("XRG-DWBI-01", "A warehouse is required and developed only under an approved or in-force architecture.", ["TR-DWH-01", "TR-DWH-02", "TR-DWH-09"], "Required", "ARC in ('STS-ARC-04','STS-ARC-05')"),
    ("XRG-DWBI-02", "A population process is designed only under an architecture in force.", ["TR-POP-01", "TR-POP-11"], "Required", "ARC in ('STS-ARC-04','STS-ARC-05')"),
    ("XRG-DWBI-03", "An asset is loaded or refreshed only into a store in production.", ["TR-POP-02", "TR-POP-05", "TR-POP-06"], "Required", "DWH in ('STS-DWH-04','STS-DWH-05')"),
    ("XRG-DWBI-04", "A data product is built only on a reconciled population.", ["TR-PRD-02"], "Required", "POP in ('STS-POP-04','STS-POP-06')"),
    ("XRG-DWBI-05", "A data product is released or retired only under a release plan in force.", ["TR-PRD-04", "TR-PRD-09", "TR-PRD-10", "TR-PRD-11", "TR-PRD-15"], "Required", "BIP in ('STS-BIP-04','STS-BIP-05')"),
    ("XRG-DWBI-06", "A population is retired only when no product depends on it.", ["TR-POP-09", "TR-POP-10"], "Required", "PRD in ('STS-PRD-01','STS-PRD-07')"),
    ("XRG-DWBI-07", "A warehouse is retired only when its populations are retired or absent.", ["TR-DWH-07", "TR-DWH-08"], "Required", "POP in ('STS-POP-01','STS-POP-07')"),
    ("XRG-DWBI-08", "The architecture is retired only when no store is in production.", ["TR-ARC-07"], "Required", "DWH in ('STS-DWH-01','STS-DWH-06')"),
    ("XRG-DWBI-09", "The portfolio plans are retired only when no product is released.", ["TR-BIP-07"], "Required", "PRD in ('STS-PRD-01','STS-PRD-07')"),
]
VECTORS = [
    ("CFG-DWBI-01", "Greenfield", {"REG-DWBI-ARC": "STS-ARC-01", "REG-DWBI-DWH": "STS-DWH-01", "REG-DWBI-POP": "STS-POP-01", "REG-DWBI-PRD": "STS-PRD-01", "REG-DWBI-BIP": "STS-BIP-01"}, "Initial configuration: no warehouse, population or product; Global guards pass for assets outside the warehouse."),
    ("CFG-DWBI-02", "Warehouse in production, population reconciled", {"REG-DWBI-ARC": "STS-ARC-04", "REG-DWBI-DWH": "STS-DWH-04", "REG-DWBI-POP": "STS-POP-04", "REG-DWBI-PRD": "STS-PRD-01", "REG-DWBI-BIP": "STS-BIP-04"}, "Legal: the warehoused asset can be materialised; no product yet."),
    ("CFG-DWBI-03", "Product released and adopted", {"REG-DWBI-ARC": "STS-ARC-04", "REG-DWBI-DWH": "STS-DWH-04", "REG-DWBI-POP": "STS-POP-04", "REG-DWBI-PRD": "STS-PRD-05", "REG-DWBI-BIP": "STS-BIP-04"}, "Legal: all DWBI contributions satisfied; reconciliation supplies assurance evidence."),
    ("CFG-DWBI-04", "Failed load", {"REG-DWBI-ARC": "STS-ARC-04", "REG-DWBI-DWH": "STS-DWH-04", "REG-DWBI-POP": "STS-POP-05", "REG-DWBI-PRD": "STS-PRD-05", "REG-DWBI-BIP": "STS-BIP-04"}, "Legal: EV-AS-05 emitted; DG issue logged; materialisation of a new instance blocked until remediated."),
    ("CFG-DWBI-05", "Refresh pending", {"REG-DWBI-ARC": "STS-ARC-04", "REG-DWBI-DWH": "STS-DWH-04", "REG-DWBI-POP": "STS-POP-06", "REG-DWBI-PRD": "STS-PRD-05", "REG-DWBI-BIP": "STS-BIP-04"}, "Legal: EV-EX-03 emitted when the refresh reconciles; the current population stays in use."),
    ("CFG-DWBI-06", "Product usage alert", {"REG-DWBI-ARC": "STS-ARC-04", "REG-DWBI-DWH": "STS-DWH-04", "REG-DWBI-POP": "STS-POP-04", "REG-DWBI-PRD": "STS-PRD-06", "REG-DWBI-BIP": "STS-BIP-04"}, "Legal: EV-AS-05 emitted; access stays released."),
    ("CFG-DWBI-07", "Product data alert", {"REG-DWBI-ARC": "STS-ARC-04", "REG-DWBI-DWH": "STS-DWH-04", "REG-DWBI-POP": "STS-POP-04", "REG-DWBI-PRD": "STS-PRD-08", "REG-DWBI-BIP": "STS-BIP-04"}, "Legal: EV-AS-05 and EV-AV-03 emitted; restoration blocked until the data alert is resolved."),
]
EVIDENCE = [
    ("EVD-DWBI-01", "Architecture approval record", "Decision evidence", "TR-ARC-03", "Approved architecture; governance activities; approving authority."), ("EVD-DWBI-02", "Production release record", "Decision evidence", "TR-DWH-03", "Acceptance; production support process; monitoring activation."), ("EVD-DWBI-03", "Population process design", "Control evidence", "TR-POP-01", "Source feed, transformations, schedule, reconciliation rules."), ("EVD-DWBI-04", "Reconciliation and lineage record", "Assurance evidence", "TR-POP-03", "Reconciliation result; queryable audit data; lineage dictionary entry."), ("EVD-DWBI-05", "Load failure record", "Control evidence", "TR-POP-04", "Failure, cause, DG issue reference, remediation."), ("EVD-DWBI-06", "Product release record", "Governance evidence", "TR-PRD-04", "Release plan entry; lineage; learning material; audience."), ("EVD-DWBI-07", "Adoption measurement", "Assurance evidence", "TR-PRD-05", "Usage and satisfaction metrics against the adoption plan."), ("EVD-DWBI-08", "Monitoring alert record", "Control evidence", "TR-PRD-13", "Alert kind (usage or data), cause, owner, DG issue reference, resolution."), ("EVD-DWBI-09", "Portfolio approval record", "Decision evidence", "TR-BIP-02", "Approved learning and adoption plan and release plan."), ("EVD-DWBI-10", "Tuning record", "Control evidence", "TR-DWH-05", "Breach, load tuning activities, result."),
]
EXC = [("EXC-DWBI-01", "Pre-release Product Access", "TR-AV-01", "Release of a built data product to a pilot audience before its release plan slot.", "DR-DWBI-06", "Product built and tested on a reconciled population, pilot audience named, release plan entry scheduled with a date, Data Security classification confirmed, DG informed, evidence retained; expires at the scheduled release date.", "Draft / Approved / Expired / Closed")]

# Coupling roles (Howard, 24 Sep 2026, Influence Map Register card 2 option a): each coupling says which Knowledge Area produces
# the fact and which transitions depend on it. kind condition: the twin engine adds the fact as a guard on every dependent
# transition (Required, or Conditional with a qualifier fact that must be true for the guard to apply). kind event: the
# emitter transitions raise the event in the target Knowledge Area (effect resolve: evidence that resolves the issue the
# named coupling raised). Generated from the coupling text and the fact names, then kept here as the source of truth.
COUPLING_ROLES = {'KAC-DWBI-01': {'dependents': [{'model': 'KA-DWBI', 'transition': 'TR-ARC-02'}],
                 'kind': 'condition',
                 'producer': 'KA-DA',
                 'requirement': 'Required'},
 'KAC-DWBI-02': {'dependents': [{'model': 'KA-DWBI', 'transition': 'TR-DWH-02'}, {'model': 'KA-DWBI', 'transition': 'TR-DWH-03'}],
                 'kind': 'condition',
                 'producer': 'KA-DSO',
                 'requirement': 'Required'},
 'KAC-DWBI-03': {'dependents': [{'model': 'KA-DWBI', 'transition': 'TR-POP-02'}, {'model': 'KA-DWBI', 'transition': 'TR-POP-06'}],
                 'kind': 'condition',
                 'producer': 'KA-DII',
                 'requirement': 'Required'},
 'KAC-DWBI-04': {'dependents': [{'model': 'KA-MM', 'transition': 'TR-AST-03'}],
                 'kind': 'condition',
                 'producer': 'KA-DWBI',
                 'requirement': 'Required'},
 'KAC-DWBI-05': {'dependents': [{'model': 'KA-DWBI', 'transition': 'TR-PRD-04'}],
                 'kind': 'condition',
                 'producer': 'KA-DQ',
                 'requirement': 'Required'},
 'KAC-DWBI-06': {'dependents': [{'model': 'KA-DWBI', 'transition': 'TR-PRD-04'}],
                 'kind': 'condition',
                 'producer': 'KA-DS',
                 'requirement': 'Required'},
 'KAC-DWBI-07': {'emitters': ['TR-POP-04', 'TR-POP-08', 'TR-DWH-05', 'TR-PRD-06'], 'kind': 'event', 'producer': 'KA-DWBI'},
 'KAC-DWBI-08': {'dependents': [{'model': 'KA-DWBI', 'transition': 'TR-POP-01'}],
                 'kind': 'condition',
                 'producer': 'KA-RMD',
                 'qualifier': 'source_is_master_data',
                 'requirement': 'Conditional'}}

SPEC = {
    "meta": {"modelId": "KA-DWBI", "name": "Data Warehousing and Business Intelligence FTS", "knowledgeArea": "Data Warehousing and Business Intelligence", "version": "0.1", "subjectType": KA_SUBJECT,
             "regionModel": "One FTS per managed element: the DW and BI Architecture (scope level), a Data Warehouse or Data Mart (one per store), the Population of a Data Asset (one per warehoused asset), a Data Product (one per product) and the BI Portfolio (scope level) run concurrently and are coupled by cross-region constraints, facts and events, never a single subject.",
             "source": SRC_DECK + "; " + SRC_HOWARD + "; " + SRC_PROTOCOL,
             "note": "Five state regions, each its own FTS over one managed element of the Knowledge Area: the DW and BI Architecture, a Data Warehouse or Data Mart, the Population of a Data Asset, a Data Product and the BI Portfolio. The KA never becomes a region of the Data Asset; the store, the population and the product reach the Global protocol through contributions (materialisation of a warehoused asset, release and restoration of a data product, supersession by a reconciled refresh, the assurance and access-suspension triggers and the reconciliation service), all Conditional so assets outside the warehouse are unaffected, and couple to Data Architecture, DSO, DII, Metadata, DQ, Data Security, DG and RMD.",
             "definition": CONTEXT["definition"], "factBindings": FACT_BINDINGS},
    "context": CONTEXT, "regions": REGIONS, "states": STATES, "transitions": TRANS, "events": EVENTS, "decisionRights": DR, "roles": ROLES, "artefacts": ARTEFACTS, "activities": ACTS, "services": SERVICES, "contributions": CONTRIB, "kaCouplings": KA_COUPLINGS, "couplingRoles": COUPLING_ROLES, "crossRegionConstraints": XRG, "stateVectors": VECTORS, "evidence": EVIDENCE, "exceptions": EXC,
    "sources": [
        {"id": "SRC-DWBI-001", "source": SRC_DECK, "type": "Primary (image pages, captured)", "location": "Chat upload; OneDrive Data Lifecycle folder", "use": "Definition, goals, drivers, inputs, processes, deliverables, role players, techniques, tools, metrics", "limitations": "The context diagram lists the activities and ten deliverables but no store, load or product lifecycle; the Population and Data Product states are drafted from Populate the Data Warehouse, Implement the BI Portfolio and Maintain Data Products with the Release Plan, Lineage Dictionary and BI Activity Monitoring deliverables."},
        {"id": "SRC-DWBI-002", "source": SRC_HOWARD, "type": "Design direction", "location": "Chat", "use": "Managed elements (five, BI Portfolio split out), Global gating", "limitations": ""},
        {"id": "SRC-DWBI-003", "source": SRC_PROTOCOL, "type": "Alignment target", "location": "Private repo models/", "use": "Global transition IDs for contributions; KA transition IDs for couplings", "limitations": ""},
    ],
    "qaNotes": [
        {"severity": "note", "rule": "GA-005", "element": "KA-DWBI", "finding": "The architecture, the store and the portfolio change rarely relative to a load or a product and gate them through XRG-DWBI-01..09; the Population and the Data Product are per instance and are the DWBI regions that gate Global materialisation and release."},
        {"severity": "note", "rule": "capture", "element": "REG-DWBI-POP", "finding": "Population states (designed, loaded, reconciled, failed, refresh pending, retired) and Data Product states (specified, built, released, adopted, usage alert, data alert, retired) are drafted from the activities and deliverables; the context diagram gives no lifecycle. For Howard's review."},
        {"severity": "note", "rule": "scope", "element": "CON-DWBI-01", "finding": "All DWBI contributions are Conditional and pass when the asset has no population or product, so assets outside the warehouse are unaffected."},
        {"severity": "note", "rule": "derived", "element": "STATES", "finding": "All state names, events, decision rights, holders and services are first-pass drafts from the context diagram; every one is for Howard's review."},
    ],
}

if __name__ == "__main__":
    from ka_build import run_spec
    run_spec(SPEC, "data_warehousing_bi.fts.json")
