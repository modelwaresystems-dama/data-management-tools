#!/usr/bin/env python3
"""
dso_spec.py  -  Data Storage and Operations FTS v0.1: five state regions, each its own FTS over one managed element
of the Knowledge Area, derived from the DMBOK Data Storage and Operations context diagram (deck pages 48 to 52) and
aligned to the Global Data Asset Protocol.

Howard's managed elements (21 Sep 2026): 1 a Database Technology (one per technology); 2 a Database Environment (one
per environment); 3 the Stored Instance of a Data Asset (one per asset); 4 the Business Continuity Plan of an
environment; 5 a Test Dataset (one per dataset), added on Howard's decision the same day; replication is split from
migration as its own state.
Decisions 21 Sep 2026: DSO gates Global materialisation (environment in service, instance loaded), active custody
(environment in service under a tested continuity plan), preservation custody (archive copy), restoration of active
custody (restored and protected instance), destruction and custody closure (purge confirmed); a migration or
replication is a custody transfer trigger; an OLA breach or a continuity invocation emits the Assurance trigger;
monitoring is an assurance service; every transition carries a Decision Right (holders drafted, REVIEW).

Usage: python dso_spec.py [out_dir] [--overrides spec/data_storage_operations_overrides.json]   -> data_storage_operations.fts.json
"""
import json, os, sys
from ka_build import build

SRC_DECK = "DMBOK Data Lifecycle and KA Context Diagrams.pdf, Data Storage and Operations pages 48 to 52 (What, Why, Activities, Role Players and Technical Drivers)"
SRC_HOWARD = "Howard Diesel, 21 Sep 2026: five Data Storage and Operations managed elements (Database Technology; Database Environment; Stored Instance of a Data Asset; Business Continuity Plan; Test Dataset), Global gating of materialise, custody, preservation and destruction with the transfer and assurance triggers, active custody gated on the environment and plan, replication split from migration, masked test data gates its release"
SRC_PROTOCOL = "global_protocol.fts.json v0.2.1 for the contribution targets; data_governance v0.2, data_architecture, data_modelling_design, metadata_management and data_security v0.1 for the couplings"

CONTEXT = {
    "knowledgeArea": "Data Storage and Operations",
    "definition": "The design, implementation, and support of stored data to maximize its value throughout its lifecycle, from creation/acquisition to disposal. There are two sub-activities: Database support (activities related to the data lifecycle from implementation of a database environment, through obtaining, backing up and purging data, including ensuring the database performs well, monitoring and tuning) and Database technology support (defining technical requirements that meet organisational needs, defining technical architecture, installing, maintaining technology, and resolving related issues).",
    "ensures": "Every stored Data Asset sits in a database environment built on adopted technology, in service under a performance OLA, backed up and recoverable under a tested business continuity plan, migrated, replicated or versioned under control, and purged at disposal.",
    "goals": ["Manage availability of data throughout the data lifecycle", "Ensure the integrity of data assets", "Manage performance of data transactions"],
    "businessDrivers": ["Business continuity"],
    "inputs": ["Data Architecture", "Data Requirements", "Data Models", "Service Level Agreements"],
    "processes": [
        {"id": "1", "name": "Manage Database Technology", "phase": "P,D,O", "subActivities": ["1.1 Understand Database Technology (P)", "1.2 Evaluate Database Technology (D)", "1.3 Manage and Monitor Database Technology (O)"]},
        {"id": "2", "name": "Manage Database Operations", "phase": "P,D,C,O", "subActivities": ["2.1 Understand Requirements (P)", "2.2 Plan for Business Continuity (P)", "2.3 Develop Database Instances (D)", "2.4 Manage Database Performance (C,O)", "2.5 Manage Test Datasets (O)", "2.6 Manage Data Migration (O)"]},
    ],
    "deliverables": ["Database Technology Evaluation Criteria", "Database Environments", "Migrated/Replicated/Versioned Data", "Business Continuity Plans", "Database Performance OLA"],
    "suppliers": ["Data Architect", "Data Modeler", "Software Developer", "Application Testing Team"],
    "participants": ["Database Administrator", "Data Architect"],
    "consumers": ["Data Modeler", "Software Developer", "Application Testing Team", "Infrastructure Operations"],
    "techniques": ["Change Implementation Path", "Physical Naming Standards", "Data Lifecycle Management", "Script Usage for All Changes"],
    "tools": ["Data Modeling Tools", "Database Monitoring Tools", "Database Management Tools", "Developer Support Tools"],
    "metrics": ["Data Storage Metrics", "Performance Metrics", "Operations Metrics", "Service Metrics"],
    "phaseTags": "(P) Planning, (C) Control, (D) Development, (O) Operations",
}

KA_SUBJECT = "Data Storage and Operations Knowledge Area: five managed elements, one FTS (state region) each; the Data Asset is the Global subject reached through contributions"
REGIONS = [
    ("REG-DSO-TEC", "Database Technology", "TEC", "Whether a database technology is understood, evaluated against the evaluation criteria, adopted, monitored in operation, or retired.", "STS-TEC-01", "Exactly one active state per technology; an adopted technology is monitored while any environment runs on it.",
     "Database Technology: one database product or platform (relational, document, graph, file, cloud service) with its evaluation against the Database Technology Evaluation Criteria, adoption decision and monitoring record",
     {"instanceScope": "One instance per database technology.", "elementKind": "Governing element (technology position)", "contributesTo": "No Global transition is gated on the technology directly; it gates the environments through cross-region constraints (an environment is developed only on an adopted technology).", "conditionsThatMatter": "Unassessed; understood; evaluated; adopted; monitored; retired."}),
    ("REG-DSO-ENV", "Database Environment", "ENV", "Whether a database environment is required, developed, accepted into service under its performance OLA, degraded by an OLA breach, or decommissioned.", "STS-ENV-01", "Exactly one active state per environment; In Service means the environment meets its OLA and is monitored.",
     "Database Environment: one database instance or cluster (production, test, archive) developed on an adopted technology from the data architecture, data models and service level agreements, operated under a Database Performance OLA",
     {"instanceScope": "One instance per database environment.", "elementKind": "Managed platform element", "contributesTo": "Existence: an asset is materialised only in an environment in service (TR-EX-02); Custody: active custody is established only in an environment in service under a tested continuity plan (TR-CP-01); Assurance: an OLA breach emits the assurance trigger (TR-AS-05) and monitoring supplies assurance evidence (TR-AS-02).", "conditionsThatMatter": "None; required; developed; in service; degraded; decommissioned."}),
    ("REG-DSO-STO", "Stored Instance of a Data Asset", "STO", "Whether the stored instance of one Data Asset is loaded, protected by a verified backup under the OLA, archived, replicated to a second live copy, in migration or versioning, or purged.", "STS-STO-01", "Exactly one active state per asset; Protected means the last backup is verified within the OLA recovery point.",
     "Stored Instance of a Data Asset: the physical copy of one asset held in a database environment, with its backups, archive copy, migration, replication and version history, and its purge record",
     {"instanceScope": "One instance per Data Asset (its primary stored copy).", "elementKind": "Managed per-asset element", "contributesTo": "Existence: materialisation needs the instance loaded (TR-EX-02); destruction needs the purge confirmed (TR-EX-05, TR-EX-06); Custody: preservation custody needs the archive copy (TR-CP-02), restoration needs the restored and protected instance (TR-CP-03), custody closure after destruction needs the purge (TR-CP-10), and a migration is a custody transfer trigger (TR-CP-05); replication is a second live copy under the same custody, not a transfer.", "conditionsThatMatter": "Unstored; loaded; protected; archived; replicated; in migration; purged."}),
    ("REG-DSO-BCP", "Business Continuity Plan", "BCP", "Whether the business continuity plan of an environment is planned, tested and in force, invoked after a continuity event, or recovered and under review.", "STS-BCP-01", "Exactly one active state per environment's plan; Tested means the last test succeeded within the plan's test interval.",
     "Business Continuity Plan: the backup, recovery and continuity plan of one database environment, its test results, invocations and recoveries",
     {"instanceScope": "One instance per database environment.", "elementKind": "Governing element (plan)", "contributesTo": "Custody: active custody is established only under a tested plan (TR-CP-01); Assurance: an invocation emits the assurance trigger (TR-AS-05).", "conditionsThatMatter": "None; planned; tested; invoked; recovered."}),
    ("REG-DSO-TST", "Test Dataset", "TST", "Whether a test dataset drawn from a stored instance is requested, provisioned, masked to the asset's classification, due for refresh against its source, or retired.", "STS-TST-01", "Exactly one active state per test dataset; Masked means de-identification to the classification is verified.",
     "Test Dataset: one copy or subset of a stored instance provisioned for the application testing team, masked to the asset's security classification, refreshed from its source and retired",
     {"instanceScope": "One instance per test dataset.", "elementKind": "Managed per-dataset element (derived asset)", "contributesTo": "Availability: a test dataset is released to the testing team only when masked (TR-AV-01, applies to the test dataset asset); the production asset's release is unaffected.", "conditionsThatMatter": "None; requested; provisioned; masked; refresh due; retired."}),
]
STATES = [
    ("STS-TEC-01", "REG-DSO-TEC", "Unassessed Technology", True, False, "The technology has no position: it is not understood or evaluated for the scope.", "The absence of a position remains visible.", ["inputs:Data Architecture"]),
    ("STS-TEC-02", "REG-DSO-TEC", "Understood Technology", False, False, "The technology's characteristics, fit to the data architecture and requirements are understood.", "The understanding remains traceable to the architecture and requirements.", ["process:1.1", "inputs:Data Requirements"]),
    ("STS-TEC-03", "REG-DSO-TEC", "Evaluated Technology", False, False, "The technology is evaluated against the Database Technology Evaluation Criteria and awaits the adoption decision.", "The evaluation result and criteria version remain recorded.", ["process:1.2", "deliverable:Database Technology Evaluation Criteria"]),
    ("STS-TEC-04", "REG-DSO-TEC", "Adopted Technology", False, False, "The technology is adopted for the scope; environments may be developed on it.", "The adoption decision and its conditions remain traceable.", ["process:1.2"]),
    ("STS-TEC-05", "REG-DSO-TEC", "Monitored Technology", False, False, "Environments run on the technology; it is managed and monitored (versions, patches, licences, capacity).", "Version, patch and capacity status remain current.", ["process:1.3", "tools:Database Monitoring Tools", "metric:Operations Metrics"]),
    ("STS-TEC-06", "REG-DSO-TEC", "Retired Technology", False, False, "The technology is retired for the scope; no environment runs on it.", "The retirement decision and successor technology remain recorded.", ["process:1.3"]),
    ("STS-ENV-01", "REG-DSO-ENV", "No Environment", True, False, "No database environment exists for the requirement.", "The unmet requirement remains visible.", ["inputs:Data Requirements"]),
    ("STS-ENV-02", "REG-DSO-ENV", "Required Environment", False, False, "The environment's requirements (architecture, models, service levels, naming standards) are understood and agreed.", "Requirements remain traceable to the architecture, models and SLAs.", ["process:2.1", "inputs:Service Level Agreements", "techniques:Physical Naming Standards"]),
    ("STS-ENV-03", "REG-DSO-ENV", "Developed Environment", False, False, "The database instance is developed on an adopted technology by scripted change and awaits acceptance into service.", "Every change is scripted and follows the change implementation path.", ["process:2.3", "techniques:Change Implementation Path", "techniques:Script Usage for All Changes", "deliverable:Database Environments"]),
    ("STS-ENV-04", "REG-DSO-ENV", "Environment in Service", False, False, "The environment is accepted into service under its Database Performance OLA and monitored; performance is managed.", "Performance, storage and service metrics remain within the OLA.", ["process:2.4", "deliverable:Database Performance OLA", "metric:Performance Metrics", "metric:Service Metrics"]),
    ("STS-ENV-05", "REG-DSO-ENV", "Degraded Environment", False, False, "An OLA breach (performance, capacity or availability) is open; the environment stays in use while it is tuned or repaired.", "The breach, its owner and the DG issue reference remain explicit.", ["process:2.4", "metric:Performance Metrics"]),
    ("STS-ENV-06", "REG-DSO-ENV", "Decommissioned Environment", False, False, "The environment is taken out of service after its stored instances are purged or migrated.", "The decommission record and the destination of migrated data remain recorded.", ["process:2.6", "techniques:Data Lifecycle Management"]),
    ("STS-STO-01", "REG-DSO-STO", "Unstored Asset", True, False, "The asset has no stored instance.", "The absence of a stored copy remains visible.", ["inputs:Data Models"]),
    ("STS-STO-02", "REG-DSO-STO", "Loaded Instance", False, False, "The asset's data is loaded into an environment in service under the deployed physical model; no verified backup yet.", "The load record (source, environment, model version) remains recorded.", ["process:2.3", "metric:Data Storage Metrics"]),
    ("STS-STO-03", "REG-DSO-STO", "Protected Instance", False, False, "The instance is backed up and the backup verified within the OLA recovery point and time.", "The last verified backup is within the recovery point objective.", ["process:2.4", "process:2.2", "metric:Operations Metrics"]),
    ("STS-STO-04", "REG-DSO-STO", "Archived Instance", False, False, "An archive copy is taken and verified and the instance is held for preservation rather than active use.", "The archive copy is retrievable and its retention remains recorded.", ["techniques:Data Lifecycle Management"]),
    ("STS-STO-05", "REG-DSO-STO", "Instance in Migration", False, False, "The instance is being migrated or versioned to another environment or version under an approved migration plan; the source stays protected until verified.", "Source and target remain reconciled; the migration plan and cut-over remain recorded.", ["process:2.6", "deliverable:Migrated/Replicated/Versioned Data"]),
    ("STS-STO-06", "REG-DSO-STO", "Purged Instance", False, False, "The instance and its backups are purged as confirmed by the purge record; only the purge record remains.", "The purge record (scope, method, confirmation) remains retrievable.", ["techniques:Data Lifecycle Management"]),
    ("STS-STO-07", "REG-DSO-STO", "Replicated Instance", False, False, "A second live copy of the protected instance is maintained in another environment by replication; both copies stay under the same custody.", "Replica lag stays within the OLA; the primary remains the authoritative copy.", ["process:2.6", "deliverable:Migrated/Replicated/Versioned Data"]),
    ("STS-TST-01", "REG-DSO-TST", "No Test Dataset", True, False, "No test dataset exists for the request.", "The absence of test data remains visible to the testing team.", ["process:2.5"]),
    ("STS-TST-02", "REG-DSO-TST", "Requested Test Dataset", False, False, "The testing team's request (source instance, subset, refresh interval) is recorded and awaits provisioning.", "The request remains traceable to the source instance and test need.", ["process:2.5"]),
    ("STS-TST-03", "REG-DSO-TST", "Provisioned Test Dataset", False, False, "The dataset is copied or subset from a protected stored instance into a test environment; not yet masked.", "The provisioning record (source, subset rule, environment) remains recorded.", ["process:2.5", "tools:Developer Support Tools"]),
    ("STS-TST-04", "REG-DSO-TST", "Masked Test Dataset", False, False, "The dataset is de-identified to the asset's security classification and the masking verified; it may be released to the testing team.", "Masking verification remains current for the classification in force.", ["process:2.5"]),
    ("STS-TST-05", "REG-DSO-TST", "Refresh Due", False, False, "The source instance or its model has changed beyond the refresh interval; the dataset is stale until refreshed and re-masked.", "The source change that triggered the refresh remains recorded.", ["process:2.5"]),
    ("STS-TST-06", "REG-DSO-TST", "Retired Test Dataset", False, False, "The dataset is withdrawn and purged from the test environment.", "The retirement and purge record remain recorded.", ["process:2.5"]),
    ("STS-BCP-01", "REG-DSO-BCP", "No Continuity Plan", True, False, "No business continuity plan exists for the environment.", "The absence of a plan remains visible.", ["businessDrivers:Business continuity"]),
    ("STS-BCP-02", "REG-DSO-BCP", "Planned Continuity", False, False, "The backup, recovery and continuity plan is drafted with its recovery objectives and awaits a successful test.", "Recovery objectives remain traceable to the service level agreements.", ["process:2.2", "deliverable:Business Continuity Plans"]),
    ("STS-BCP-03", "REG-DSO-BCP", "Tested Continuity", False, False, "The plan is tested successfully within its test interval and is in force.", "The last successful test is within the test interval.", ["process:2.2"]),
    ("STS-BCP-04", "REG-DSO-BCP", "Invoked Continuity", False, False, "A continuity event has invoked the plan; recovery is in progress.", "The invocation, its cause and the recovery progress remain recorded.", ["process:2.2", "process:2.4"]),
    ("STS-BCP-05", "REG-DSO-BCP", "Recovered Operations", False, False, "Operations are recovered; the post-incident review decides whether the plan stands or is revised.", "The recovery result against the recovery objectives remains recorded.", ["process:2.2"]),
]
EVENTS = {
    "EV-TEC-01": ("Technology requirement", "Request"), "EV-TEC-02": ("Evaluation completion", "Assessment outcome"), "EV-TEC-03": ("Adoption decision", "Decision outcome"), "EV-TEC-04": ("Rejection decision", "Decision outcome"), "EV-TEC-05": ("First environment in service", "Evidence trigger"), "EV-TEC-06": ("Re-evaluation trigger", "Monitoring trigger"), "EV-TEC-07": ("Technology retirement", "Decision outcome"),
    "EV-ENV-01": ("Environment request", "Request"), "EV-ENV-02": ("Development completion", "Evidence trigger"), "EV-ENV-03": ("Service acceptance", "Decision outcome"), "EV-ENV-04": ("OLA breach", "Monitoring trigger"), "EV-ENV-05": ("Service restoration", "Assessment outcome"), "EV-ENV-06": ("Decommission decision", "Decision outcome"), "EV-ENV-07": ("Acceptance rejection", "Decision outcome"),
    "EV-STO-01": ("Load request", "Request"), "EV-STO-02": ("Backup verification", "Evidence trigger"), "EV-STO-03": ("Archive decision", "Decision outcome"), "EV-STO-04": ("Restore request", "Request"), "EV-STO-05": ("Migration approval", "Decision outcome"), "EV-STO-06": ("Migration verification", "Evidence trigger"), "EV-STO-07": ("Migration rollback", "Decision outcome"), "EV-STO-08": ("Purge confirmation", "Evidence trigger"), "EV-STO-09": ("Backup failure", "Monitoring trigger"), "EV-STO-10": ("Replication activation", "Decision outcome"), "EV-STO-11": ("Replication withdrawal", "Decision outcome"),
    "EV-TST-01": ("Test data request", "Request"), "EV-TST-02": ("Provisioning completion", "Evidence trigger"), "EV-TST-03": ("Masking verification", "Evidence trigger"), "EV-TST-04": ("Source change", "Monitoring trigger"), "EV-TST-05": ("Refresh completion", "Evidence trigger"), "EV-TST-06": ("Test dataset retirement", "Decision outcome"), "EV-TST-07": ("Request rejection", "Decision outcome"),
    "EV-BCP-01": ("Continuity planning", "Request"), "EV-BCP-02": ("Test success", "Assessment outcome"), "EV-BCP-03": ("Test failure", "Assessment outcome"), "EV-BCP-04": ("Continuity event", "Monitoring trigger"), "EV-BCP-05": ("Recovery confirmation", "Evidence trigger"), "EV-BCP-06": ("Post-incident review", "Decision outcome"), "EV-BCP-07": ("Plan revision trigger", "Monitoring trigger"), "EV-BCP-08": ("Plan retirement", "Decision outcome"),
}
DR = {
    "DR-DSO-01": ("Evaluate, Adopt and Retire a Database Technology", "ROLE-DSO-P02", "REVIEW: drafted holder"),
    "DR-DSO-02": ("Approve Environment Requirements and Development", "ROLE-DSO-P02", "REVIEW: drafted holder"),
    "DR-DSO-03": ("Accept an Environment into Service, Declare Degradation and Decommission", "ROLE-DSO-P01", "REVIEW: drafted holder"),
    "DR-DSO-04": ("Load, Protect, Archive and Restore a Stored Instance", "ROLE-DSO-P01", "REVIEW: drafted holder"),
    "DR-DSO-05": ("Approve and Verify Migration, Replication and Versioning", "ROLE-DSO-P01", "REVIEW: drafted holder"),
    "DR-DSO-06": ("Confirm the Purge of a Stored Instance", "ROLE-DSO-P01", "REVIEW: drafted holder"),
    "DR-DSO-07": ("Approve, Test, Invoke and Stand Down the Continuity Plan", "ROLE-DSO-P01", "REVIEW: drafted holder"),
    "DR-DSO-08": ("Provision, Mask, Refresh and Retire a Test Dataset", "ROLE-DSO-P01", "REVIEW: drafted holder"),
}
ROLES = [
    ("ROLE-DSO-S01", "Data Architect", "Supplier", "Supplies the data architecture and technology direction."), ("ROLE-DSO-S02", "Data Modeler", "Supplier", "Supplies the physical data models."), ("ROLE-DSO-S03", "Software Developer", "Supplier", "Supplies application requirements and change scripts."), ("ROLE-DSO-S04", "Application Testing Team", "Supplier", "Supplies test requirements and datasets."),
    ("ROLE-DSO-P01", "Database Administrator", "Participant", "Develops, operates, protects, migrates and purges; runs the continuity plan."), ("ROLE-DSO-P02", "Data Architect", "Participant", "Evaluates and adopts technology; approves environment requirements."),
    ("ROLE-DSO-C01", "Data Modeler", "Consumer", "Consumes the environments for model deployment."), ("ROLE-DSO-C02", "Software Developer", "Consumer", "Consumes the environments and OLA."), ("ROLE-DSO-C03", "Application Testing Team", "Consumer", "Consumes test environments and datasets."), ("ROLE-DSO-C04", "Infrastructure Operations", "Consumer", "Consumes the continuity plans and operations metrics."),
]
TRANS = [
    ("TR-TEC-01", "Understand Technology", "STS-TEC-01", "STS-TEC-02", "EV-TEC-01", "A technology requirement arises from the data architecture or data requirements.", "DR-DSO-01", ["SVC-DSO-01"], ["ACT-DSO-1", "ACT-DSO-1.1"]),
    ("TR-TEC-02", "Evaluate Technology", "STS-TEC-02", "STS-TEC-03", "EV-TEC-02", "The technology is evaluated against the evaluation criteria.", "DR-DSO-01", ["SVC-DSO-01"], ["ACT-DSO-1.2"]),
    ("TR-TEC-03", "Adopt Technology", "STS-TEC-03", "STS-TEC-04", "EV-TEC-03", "The evaluation supports adoption and the decision is recorded.", "DR-DSO-01", ["SVC-DSO-01"], ["ACT-DSO-1.2"]),
    ("TR-TEC-04", "Reject Technology", "STS-TEC-03", "STS-TEC-01", "EV-TEC-04", "The evaluation does not support adoption.", "DR-DSO-01", ["SVC-DSO-01"], ["ACT-DSO-1.2"]),
    ("TR-TEC-05", "Monitor Technology", "STS-TEC-04", "STS-TEC-05", "EV-TEC-05", "The first environment on the technology is in service; monitoring starts.", "DR-DSO-01", ["SVC-DSO-03"], ["ACT-DSO-1.3"]),
    ("TR-TEC-06", "Re-evaluate Technology", "STS-TEC-05", "STS-TEC-03", "EV-TEC-06", "A version, licence, capacity or architecture trigger requires re-evaluation; environments keep running.", "DR-DSO-01", ["SVC-DSO-01"], ["ACT-DSO-1.2"]),
    ("TR-TEC-07", "Retire Technology", "STS-TEC-05", "STS-TEC-06", "EV-TEC-07", "No environment runs on the technology and the retirement is recorded.", "DR-DSO-01", ["SVC-DSO-01"], ["ACT-DSO-1.3"]),
    ("TR-TEC-08", "Reconsider Retired Technology", "STS-TEC-06", "STS-TEC-02", "EV-TEC-01", "A new requirement reopens a retired technology.", "DR-DSO-01", ["SVC-DSO-01"], ["ACT-DSO-1.1"]),
    ("TR-ENV-01", "Understand Environment Requirements", "STS-ENV-01", "STS-ENV-02", "EV-ENV-01", "Architecture, models, service levels and naming standards for the environment are agreed.", "DR-DSO-02", ["SVC-DSO-02"], ["ACT-DSO-2", "ACT-DSO-2.1"]),
    ("TR-ENV-02", "Develop Environment", "STS-ENV-02", "STS-ENV-03", "EV-ENV-02", "The instance is developed on an adopted technology by scripted change along the change implementation path.", "DR-DSO-02", ["SVC-DSO-02"], ["ACT-DSO-2.3"]),
    ("TR-ENV-03", "Accept into Service", "STS-ENV-03", "STS-ENV-04", "EV-ENV-03", "The environment meets its OLA in acceptance testing and monitoring is active.", "DR-DSO-03", ["SVC-DSO-03"], ["ACT-DSO-2.4"]),
    ("TR-ENV-04", "Return Environment for Rework", "STS-ENV-03", "STS-ENV-02", "EV-ENV-07", "Acceptance fails with recorded reasons.", "DR-DSO-03", ["SVC-DSO-02"], ["ACT-DSO-2.3"]),
    ("TR-ENV-05", "Declare Degradation", "STS-ENV-04", "STS-ENV-05", "EV-ENV-04", "Monitoring detects an OLA breach; a Data Asset issue is logged and the assurance trigger emitted.", "DR-DSO-03", ["SVC-DSO-03"], ["ACT-DSO-2.4"]),
    ("TR-ENV-06", "Restore Service", "STS-ENV-05", "STS-ENV-04", "EV-ENV-05", "Tuning or repair returns the environment within its OLA.", "DR-DSO-03", ["SVC-DSO-03"], ["ACT-DSO-2.4"]),
    ("TR-ENV-07", "Decommission Environment", "STS-ENV-04", "STS-ENV-06", "EV-ENV-06", "All stored instances are purged or migrated and the decommission recorded.", "DR-DSO-03", ["SVC-DSO-02"], ["ACT-DSO-2.6"]),
    ("TR-ENV-08", "Decommission Degraded Environment", "STS-ENV-05", "STS-ENV-06", "EV-ENV-06", "A degraded environment is replaced; its instances are migrated or purged first.", "DR-DSO-03", ["SVC-DSO-02"], ["ACT-DSO-2.6"]),
    ("TR-ENV-09", "Rebuild Environment", "STS-ENV-06", "STS-ENV-02", "EV-ENV-01", "A decommissioned environment is required again and its requirements re-agreed.", "DR-DSO-02", ["SVC-DSO-02"], ["ACT-DSO-2.1"]),
    ("TR-STO-01", "Load Instance", "STS-STO-01", "STS-STO-02", "EV-STO-01", "The asset's data is loaded into an environment in service under the deployed physical model and a protected classification.", "DR-DSO-04", ["SVC-DSO-02"], ["ACT-DSO-2.3"]),
    ("TR-STO-02", "Protect Instance", "STS-STO-02", "STS-STO-03", "EV-STO-02", "A backup is taken and verified within the OLA recovery point and time.", "DR-DSO-04", ["SVC-DSO-04"], ["ACT-DSO-2.4"]),
    ("TR-STO-03", "Lose Protection", "STS-STO-03", "STS-STO-02", "EV-STO-09", "A backup fails verification or falls outside the recovery point.", "DR-DSO-04", ["SVC-DSO-04"], ["ACT-DSO-2.4"]),
    ("TR-STO-04", "Archive Instance", "STS-STO-03", "STS-STO-04", "EV-STO-03", "An archive copy is taken and verified and the instance withdrawn from active use.", "DR-DSO-04", ["SVC-DSO-04"], ["ACT-DSO-2.6"]),
    ("TR-STO-05", "Restore Instance", "STS-STO-04", "STS-STO-03", "EV-STO-04", "The instance is restored from the archive copy and re-protected.", "DR-DSO-04", ["SVC-DSO-04"], ["ACT-DSO-2.6"]),
    ("TR-STO-06", "Start Migration", "STS-STO-03", "STS-STO-05", "EV-STO-05", "A migration, replication or versioning plan is approved; the source stays protected.", "DR-DSO-05", ["SVC-DSO-05"], ["ACT-DSO-2.6"]),
    ("TR-STO-07", "Complete Migration", "STS-STO-05", "STS-STO-03", "EV-STO-06", "Source and target are reconciled and the target protected; cut-over recorded.", "DR-DSO-05", ["SVC-DSO-05", "SVC-DSO-04"], ["ACT-DSO-2.6"]),
    ("TR-STO-08", "Roll Back Migration", "STS-STO-05", "STS-STO-02", "EV-STO-07", "The migration is abandoned; the source is re-verified before protection is confirmed again.", "DR-DSO-05", ["SVC-DSO-05"], ["ACT-DSO-2.6"]),
    ("TR-STO-09", "Purge Instance", "STS-STO-03", "STS-STO-06", "EV-STO-08", "The sanitised instance and its backups are purged and the purge confirmed.", "DR-DSO-06", ["SVC-DSO-06"], ["ACT-DSO-2.6"]),
    ("TR-STO-10", "Purge Archived Instance", "STS-STO-04", "STS-STO-06", "EV-STO-08", "The archive copy reaches the end of its retention and is purged with confirmation.", "DR-DSO-06", ["SVC-DSO-06"], ["ACT-DSO-2.6"]),
    ("TR-STO-11", "Reload Instance", "STS-STO-06", "STS-STO-02", "EV-STO-01", "A new instance of a previously purged asset is loaded (reinstated asset).", "DR-DSO-04", ["SVC-DSO-02"], ["ACT-DSO-2.3"]),
    ("TR-STO-12", "Replicate Instance", "STS-STO-03", "STS-STO-07", "EV-STO-10", "Replication to a second environment is activated and the replica verified within the OLA lag.", "DR-DSO-05", ["SVC-DSO-05"], ["ACT-DSO-2.6"]),
    ("TR-STO-13", "Cease Replication", "STS-STO-07", "STS-STO-03", "EV-STO-11", "Replication is withdrawn; the primary stays protected.", "DR-DSO-05", ["SVC-DSO-05"], ["ACT-DSO-2.6"]),
    ("TR-STO-14", "Start Migration of Replicated Instance", "STS-STO-07", "STS-STO-05", "EV-STO-05", "A migration or versioning plan is approved for a replicated instance; replication is folded into the migration.", "DR-DSO-05", ["SVC-DSO-05"], ["ACT-DSO-2.6"]),
    ("TR-TST-01", "Request Test Dataset", "STS-TST-01", "STS-TST-02", "EV-TST-01", "The testing team's request names the source instance, subset and refresh interval.", "DR-DSO-08", ["SVC-DSO-08"], ["ACT-DSO-2.5"]),
    ("TR-TST-02", "Provision Test Dataset", "STS-TST-02", "STS-TST-03", "EV-TST-02", "The dataset is copied or subset from a protected or replicated stored instance into a test environment.", "DR-DSO-08", ["SVC-DSO-08"], ["ACT-DSO-2.5"]),
    ("TR-TST-03", "Reject Test Data Request", "STS-TST-02", "STS-TST-01", "EV-TST-07", "The request is rejected with recorded reasons.", "DR-DSO-08", ["SVC-DSO-08"], ["ACT-DSO-2.5"]),
    ("TR-TST-04", "Mask Test Dataset", "STS-TST-03", "STS-TST-04", "EV-TST-03", "De-identification to the asset's security classification is applied and verified.", "DR-DSO-08", ["SVC-DSO-08"], ["ACT-DSO-2.5"]),
    ("TR-TST-05", "Flag Refresh Due", "STS-TST-04", "STS-TST-05", "EV-TST-04", "The source instance or its model changed beyond the refresh interval.", "DR-DSO-08", ["SVC-DSO-08"], ["ACT-DSO-2.5"]),
    ("TR-TST-06", "Refresh Test Dataset", "STS-TST-05", "STS-TST-03", "EV-TST-05", "The dataset is re-provisioned from the source and awaits re-masking.", "DR-DSO-08", ["SVC-DSO-08"], ["ACT-DSO-2.5"]),
    ("TR-TST-07", "Retire Test Dataset", "STS-TST-04", "STS-TST-06", "EV-TST-06", "The dataset is withdrawn and purged from the test environment.", "DR-DSO-08", ["SVC-DSO-08", "SVC-DSO-06"], ["ACT-DSO-2.5"]),
    ("TR-TST-08", "Retire Stale Test Dataset", "STS-TST-05", "STS-TST-06", "EV-TST-06", "A stale dataset is withdrawn instead of refreshed and purged.", "DR-DSO-08", ["SVC-DSO-08", "SVC-DSO-06"], ["ACT-DSO-2.5"]),
    ("TR-TST-09", "Re-request Test Dataset", "STS-TST-06", "STS-TST-02", "EV-TST-01", "A retired dataset is requested again.", "DR-DSO-08", ["SVC-DSO-08"], ["ACT-DSO-2.5"]),
    ("TR-BCP-01", "Plan Continuity", "STS-BCP-01", "STS-BCP-02", "EV-BCP-01", "Recovery objectives are drawn from the service level agreements and the plan drafted.", "DR-DSO-07", ["SVC-DSO-07"], ["ACT-DSO-2.2"]),
    ("TR-BCP-02", "Test Plan", "STS-BCP-02", "STS-BCP-03", "EV-BCP-02", "A recovery test meets the recovery objectives.", "DR-DSO-07", ["SVC-DSO-07"], ["ACT-DSO-2.2"]),
    ("TR-BCP-03", "Fail Test", "STS-BCP-03", "STS-BCP-02", "EV-BCP-03", "A scheduled test misses the recovery objectives; the plan is out of force until retested.", "DR-DSO-07", ["SVC-DSO-07"], ["ACT-DSO-2.2"]),
    ("TR-BCP-04", "Invoke Plan", "STS-BCP-03", "STS-BCP-04", "EV-BCP-04", "A continuity event (loss, corruption, outage) invokes the plan; the assurance trigger is emitted.", "DR-DSO-07", ["SVC-DSO-07"], ["ACT-DSO-2.2"]),
    ("TR-BCP-05", "Recover Operations", "STS-BCP-04", "STS-BCP-05", "EV-BCP-05", "Recovery is confirmed against the recovery objectives.", "DR-DSO-07", ["SVC-DSO-07", "SVC-DSO-04"], ["ACT-DSO-2.2"]),
    ("TR-BCP-06", "Stand Down Plan", "STS-BCP-05", "STS-BCP-03", "EV-BCP-06", "The post-incident review confirms the plan stands.", "DR-DSO-07", ["SVC-DSO-07"], ["ACT-DSO-2.2"]),
    ("TR-BCP-07", "Revise Plan after Recovery", "STS-BCP-05", "STS-BCP-02", "EV-BCP-07", "The post-incident review requires plan changes; the plan is retested.", "DR-DSO-07", ["SVC-DSO-07"], ["ACT-DSO-2.2"]),
    ("TR-BCP-08", "Revise Plan", "STS-BCP-03", "STS-BCP-02", "EV-BCP-07", "An environment, technology or service-level change requires plan revision and retest.", "DR-DSO-07", ["SVC-DSO-07"], ["ACT-DSO-2.2"]),
    ("TR-BCP-09", "Retire Plan", "STS-BCP-03", "STS-BCP-01", "EV-BCP-08", "The environment is decommissioned and its plan retired.", "DR-DSO-07", ["SVC-DSO-07"], ["ACT-DSO-2.2"]),
]
SERVICES = [
    ("SVC-DSO-01", "Governance", "Database Technology Evaluation", "Technology requirement; re-evaluation; retirement.", "Evaluation against the criteria; adoption or rejection; technology position."),
    ("SVC-DSO-02", "Control", "Environment Development and Change Implementation", "Environment request; development; load; decommission.", "Developed environment by scripted change; load record."),
    ("SVC-DSO-03", "Assurance", "Database Performance and Availability Monitoring", "Environment in service; OLA breach; restoration.", "Performance, storage, operations and service metrics against the OLA; breach findings."),
    ("SVC-DSO-04", "Control", "Backup, Archive and Restore", "Loaded instance; archive decision; restore request; recovery.", "Verified backups within the recovery objectives; archive copy; restored instance."),
    ("SVC-DSO-05", "Control", "Migration, Replication and Versioning", "Migration approval; verification; rollback.", "Migrated, replicated or versioned data reconciled between source and target."),
    ("SVC-DSO-06", "Control", "Purge Confirmation", "End of retention; destruction decision.", "Purge record: scope, method, confirmation."),
    ("SVC-DSO-07", "Risk", "Business Continuity Planning and Testing", "Planning; test; continuity event; post-incident review.", "Continuity plan; test results; invocation and recovery record."),
    ("SVC-DSO-08", "Control", "Test Dataset Provisioning and Masking", "Test data request; source change; retirement.", "Provisioned and masked test dataset; masking verification; refresh record."),
]
ACTS = [
    ("ACT-DSO-1", "Manage Database Technology", "1", "Transition-causing", ["REG-DSO-TEC"], ["TR-TEC-01"], ["SVC-DSO-01"]),
    ("ACT-DSO-1.1", "Understand Database Technology", "1.1", "Transition-causing", ["REG-DSO-TEC"], ["TR-TEC-01", "TR-TEC-08"], ["SVC-DSO-01"]),
    ("ACT-DSO-1.2", "Evaluate Database Technology", "1.2", "Transition-causing", ["REG-DSO-TEC"], ["TR-TEC-02", "TR-TEC-03", "TR-TEC-04", "TR-TEC-06"], ["SVC-DSO-01"]),
    ("ACT-DSO-1.3", "Manage and Monitor Database Technology", "1.3", "Transition-causing", ["REG-DSO-TEC"], ["TR-TEC-05", "TR-TEC-07"], ["SVC-DSO-03"]),
    ("ACT-DSO-2", "Manage Database Operations", "2", "Transition-causing", ["REG-DSO-ENV"], ["TR-ENV-01"], ["SVC-DSO-02"]),
    ("ACT-DSO-2.1", "Understand Requirements", "2.1", "Transition-causing", ["REG-DSO-ENV"], ["TR-ENV-01", "TR-ENV-09"], ["SVC-DSO-02"]),
    ("ACT-DSO-2.2", "Plan for Business Continuity", "2.2", "Transition-causing", ["REG-DSO-BCP"], ["TR-BCP-01", "TR-BCP-02", "TR-BCP-03", "TR-BCP-04", "TR-BCP-05", "TR-BCP-06", "TR-BCP-07", "TR-BCP-08", "TR-BCP-09"], ["SVC-DSO-07"]),
    ("ACT-DSO-2.3", "Develop Database Instances", "2.3", "Transition-causing", ["REG-DSO-ENV", "REG-DSO-STO"], ["TR-ENV-02", "TR-ENV-04", "TR-STO-01", "TR-STO-11"], ["SVC-DSO-02"]),
    ("ACT-DSO-2.4", "Manage Database Performance", "2.4", "Transition-causing", ["REG-DSO-ENV", "REG-DSO-STO"], ["TR-ENV-03", "TR-ENV-05", "TR-ENV-06", "TR-STO-02", "TR-STO-03"], ["SVC-DSO-03", "SVC-DSO-04"]),
    ("ACT-DSO-2.5", "Manage Test Datasets", "2.5", "Transition-causing", ["REG-DSO-TST"], ["TR-TST-01", "TR-TST-02", "TR-TST-03", "TR-TST-04", "TR-TST-05", "TR-TST-06", "TR-TST-07", "TR-TST-08", "TR-TST-09"], ["SVC-DSO-08"]),
    ("ACT-DSO-2.6", "Manage Data Migration", "2.6", "Transition-causing", ["REG-DSO-ENV", "REG-DSO-STO"], ["TR-ENV-07", "TR-ENV-08", "TR-STO-04", "TR-STO-05", "TR-STO-06", "TR-STO-07", "TR-STO-08", "TR-STO-09", "TR-STO-10", "TR-STO-12", "TR-STO-13", "TR-STO-14"], ["SVC-DSO-04", "SVC-DSO-05", "SVC-DSO-06"]),
]
ARTEFACTS = [
    ("ART-DSO-01", "Database Technology Evaluation Criteria", "STS-TEC-03", "Evaluate Database Technology", "Evidences Evaluated Technology."), ("ART-DSO-02", "Database Environments", "STS-ENV-04", "Develop Database Instances", "Evidences Environment in Service; cited by Global materialisation and custody."), ("ART-DSO-03", "Migrated/Replicated/Versioned Data", "STS-STO-05", "Manage Data Migration", "Evidences Instance in Migration and Replicated Instance; migration is cited by the Global custody transfer trigger."), ("ART-DSO-04", "Business Continuity Plans", "STS-BCP-03", "Plan for Business Continuity", "Evidences Tested Continuity; cited by Global active custody."), ("ART-DSO-05", "Database Performance OLA", "STS-ENV-04", "Manage Database Performance", "Evidences the OLA the environment in service is measured against."),
]
CONTRIB = [
    ("CON-DSO-01", "TR-EX-02", "guard", {"ENV": ["STS-ENV-04"], "STO": ["STS-STO-02", "STS-STO-03", "STS-STO-04", "STS-STO-05", "STS-STO-07"]}, "An asset is materialised only when its instance is loaded in an environment in service.", "DSO_environment_in_service and DSO_instance_loaded", "Required", "TR-STO-01 precedes TR-EX-02 in every scenario."),
    ("CON-DSO-02", "TR-CP-01", "guard", {"ENV": ["STS-ENV-04"], "BCP": ["STS-BCP-03"]}, "Active custody is established only in an environment in service under a tested continuity plan.", "DSO_environment_in_service and DSO_continuity_tested", "Required", "Custody is established before the asset is loaded (TR-CP-01 follows TR-EX-01), so the custodian's environment and plan gate custody; the backup gates preservation and restoration instead (CON-DSO-03, 04)."),
    ("CON-DSO-03", "TR-CP-02", "guard", {"STO": ["STS-STO-04"]}, "Preservation custody requires a verified archive copy.", "DSO_instance_archived", "Required", ""),
    ("CON-DSO-04", "TR-CP-03", "guard", {"STO": ["STS-STO-03"]}, "Active custody is restored only when the instance is restored from archive and protected again.", "DSO_instance_protected", "Required", ""),
    ("CON-DSO-05", "TR-CP-05", "event", {"STO": ["STS-STO-05"]}, "A migration of the instance to another custodian's environment is a custody transfer trigger; replication is not.", "DSO_instance_migrating", "Conditional", "DSO emits EV-CP-05 when TR-STO-06 or TR-STO-14 targets another custodian's environment."),
    ("CON-DSO-06", "TR-EX-05", "guard", {"STO": ["STS-STO-06"]}, "A materialised asset is destroyed only when its purge is confirmed.", "DSO_instance_purged", "Required", "Data Security adds the sanitisation guard on the same transition."),
    ("CON-DSO-07", "TR-EX-06", "guard", {"STO": ["STS-STO-06"]}, "A superseded asset is destroyed only when its purge is confirmed.", "DSO_instance_purged", "Required", ""),
    ("CON-DSO-08", "TR-CP-10", "guard", {"STO": ["STS-STO-06"]}, "Custody is closed after destruction only when the purge is confirmed.", "DSO_instance_purged", "Required", ""),
    ("CON-DSO-09", "TR-AS-05", "event", {"ENV": ["STS-ENV-05"], "BCP": ["STS-BCP-04"]}, "An OLA breach or a continuity invocation is a material change affecting the assurance claim.", "DSO_environment_degraded or DSO_continuity_invoked", "Conditional", "DSO emits EV-AS-05 when TR-ENV-05 or TR-BCP-04 fires."),
    ("CON-DSO-10", "TR-AS-02", "service", {"ENV": ["STS-ENV-04"]}, "Database Performance and Availability Monitoring supplies assurance evidence for the stored asset.", "SVC-DSO-03", "Conditional", "Assurance service; evidence EVD-DSO-04."),
    ("CON-DSO-11", "TR-AV-01", "guard", {"TST": ["STS-TST-04"]}, "A test dataset is released to the testing team only when masked to the asset's classification.", "DSO_test_dataset_masked or not DSO_test_dataset_active", "Conditional", "Applies to the test dataset as its own asset instance; a production asset with no test dataset is unaffected."),
]
KA_COUPLINGS = [
    ("KAC-DSO-01", "KA-DA", "TR-EDA-05", "", "DA_architecture_in_force", "An environment is developed within the data architecture in force (TR-ENV-02 cites the DA fact).", "Reverse coupling: a DSO transition cites a DA fact."),
    ("KAC-DSO-02", "KA-DMD", "TR-PDM-10", "", "DSO_environment_in_service", "A physical model is deployed only into an environment in service (the DMD transition cites the DSO fact); the load cites the deployed model (TR-STO-01 cites DMD_physical_deployed).", "Both directions."),
    ("KAC-DSO-03", "KA-DS", "TR-PRT-02", "", "DS_protected", "An instance is loaded only under confirmed protection for its classification (TR-STO-01 cites the DS fact).", "Reverse coupling: a DSO transition cites a DS fact."),
    ("KAC-DSO-04", "KA-DS", "TR-PRT-06", "", "DS_sanitised", "An instance is purged only after sanitisation (TR-STO-09 and TR-STO-10 cite the DS fact).", "Reverse coupling."),
    ("KAC-DSO-05", "KA-DG", "TR-ISS-01", "EV-ISS-01", "DSO_environment_degraded", "An OLA breach is logged as a Data Asset issue with source Data Storage and Operations (TR-ENV-05 emits EV-ISS-01).", "DG owns escalation; DSO owns the restoration."),
    ("KAC-DSO-07", "KA-DS", "TR-CLS-02", "", "DS_classified", "A test dataset is masked to the asset's security classification (TR-TST-04 cites the DS fact).", "Reverse coupling: a DSO transition cites a DS fact."),
    ("KAC-DSO-06", "KA-MM", "TR-AST-05", "", "DSO_instance_migrating", "A completed migration, replication or versioning refreshes the asset's technical metadata and lineage (the MM transition cites the DSO fact when TR-STO-07 fires).", "Forward coupling: an MM transition cites a DSO fact."),
]
FACT_BINDINGS = {
    "DSO_technology_adopted": {"region": "REG-DSO-TEC", "states": ["STS-TEC-04", "STS-TEC-05"]},
    "DSO_environment_in_service": {"region": "REG-DSO-ENV", "states": ["STS-ENV-04"]},
    "DSO_environment_degraded": {"region": "REG-DSO-ENV", "states": ["STS-ENV-05"]},
    "DSO_instance_loaded": {"region": "REG-DSO-STO", "states": ["STS-STO-02", "STS-STO-03", "STS-STO-04", "STS-STO-05", "STS-STO-07"]},
    "DSO_instance_replicated": {"region": "REG-DSO-STO", "states": ["STS-STO-07"]},
    "DSO_test_dataset_active": {"region": "REG-DSO-TST", "states": ["STS-TST-02", "STS-TST-03", "STS-TST-04", "STS-TST-05"]},
    "DSO_test_dataset_masked": {"region": "REG-DSO-TST", "states": ["STS-TST-04"]},
    "DSO_instance_protected": {"region": "REG-DSO-STO", "states": ["STS-STO-03"]},
    "DSO_instance_archived": {"region": "REG-DSO-STO", "states": ["STS-STO-04"]},
    "DSO_instance_migrating": {"region": "REG-DSO-STO", "states": ["STS-STO-05"]},
    "DSO_instance_purged": {"region": "REG-DSO-STO", "states": ["STS-STO-06"]},
    "DSO_continuity_tested": {"region": "REG-DSO-BCP", "states": ["STS-BCP-03"]},
    "DSO_continuity_invoked": {"region": "REG-DSO-BCP", "states": ["STS-BCP-04"]},
}
XRG = [
    ("XRG-DSO-01", "An environment is developed only on an adopted or monitored technology.", ["TR-ENV-02"], "Required", "TEC in ('STS-TEC-04','STS-TEC-05')"),
    ("XRG-DSO-02", "An environment is accepted into service only under a planned or tested continuity plan.", ["TR-ENV-03"], "Required", "BCP in ('STS-BCP-02','STS-BCP-03')"),
    ("XRG-DSO-03", "An instance is loaded, restored or reloaded only into an environment in service.", ["TR-STO-01", "TR-STO-05", "TR-STO-11"], "Required", "ENV in ('STS-ENV-04',)"),
    ("XRG-DSO-04", "An instance is protected only under a tested continuity plan (the backup regime is the plan's).", ["TR-STO-02", "TR-STO-07"], "Required", "BCP in ('STS-BCP-03','STS-BCP-04','STS-BCP-05')"),
    ("XRG-DSO-05", "An environment is decommissioned only when its stored instance is unstored, archived or purged.", ["TR-ENV-07", "TR-ENV-08"], "Required", "STO in ('STS-STO-01','STS-STO-04','STS-STO-06')"),
    ("XRG-DSO-06", "A technology is retired only when no environment runs on it.", ["TR-TEC-07"], "Required", "ENV in ('STS-ENV-01','STS-ENV-06')"),
    ("XRG-DSO-07", "A continuity plan is retired only when its environment is decommissioned.", ["TR-BCP-09"], "Required", "ENV in ('STS-ENV-06',)"),
    ("XRG-DSO-09", "A test dataset is provisioned or refreshed only from a protected or replicated stored instance.", ["TR-TST-02", "TR-TST-06"], "Required", "STO in ('STS-STO-03','STS-STO-07')"),
    ("XRG-DSO-10", "An instance is purged only when its test datasets are retired or absent.", ["TR-STO-09", "TR-STO-10"], "Required", "TST in ('STS-TST-01','STS-TST-06')"),
    ("XRG-DSO-08", "An instance is purged only when no legal hold applies to the asset: the hold check of the Global Existence region (its destruction transitions) must have passed and the sanitisation confirmed before the purge is confirmed.", ["TR-STO-09", "TR-STO-10"], "Required", "STO in ('STS-STO-03','STS-STO-04')"),
]
VECTORS = [
    ("CFG-DSO-01", "Greenfield", {"REG-DSO-TEC": "STS-TEC-01", "REG-DSO-ENV": "STS-ENV-01", "REG-DSO-STO": "STS-STO-01", "REG-DSO-BCP": "STS-BCP-01", "REG-DSO-TST": "STS-TST-01"}, "Initial configuration: no technology, environment, instance or plan; Global custody and materialisation blocked."),
    ("CFG-DSO-02", "Environment in service, plan tested", {"REG-DSO-TEC": "STS-TEC-05", "REG-DSO-ENV": "STS-ENV-04", "REG-DSO-STO": "STS-STO-01", "REG-DSO-BCP": "STS-BCP-03", "REG-DSO-TST": "STS-TST-01"}, "Legal: active custody can be established; materialisation waits for the load."),
    ("CFG-DSO-03", "Protected instance, masked test dataset", {"REG-DSO-TEC": "STS-TEC-05", "REG-DSO-ENV": "STS-ENV-04", "REG-DSO-STO": "STS-STO-03", "REG-DSO-BCP": "STS-BCP-03", "REG-DSO-TST": "STS-TST-04"}, "Legal: all DSO custody and materialisation guards satisfied; monitoring supplies assurance evidence; the test dataset can be released."),
    ("CFG-DSO-07", "Replicated instance", {"REG-DSO-TEC": "STS-TEC-05", "REG-DSO-ENV": "STS-ENV-04", "REG-DSO-STO": "STS-STO-07", "REG-DSO-BCP": "STS-BCP-03", "REG-DSO-TST": "STS-TST-01"}, "Legal: a second live copy under the same custody; no transfer trigger."),
    ("CFG-DSO-04", "Archived instance", {"REG-DSO-TEC": "STS-TEC-05", "REG-DSO-ENV": "STS-ENV-04", "REG-DSO-STO": "STS-STO-04", "REG-DSO-BCP": "STS-BCP-03", "REG-DSO-TST": "STS-TST-01"}, "Legal: preservation custody allowed; restoration waits for the restore."),
    ("CFG-DSO-05", "Degraded environment, plan invoked", {"REG-DSO-TEC": "STS-TEC-05", "REG-DSO-ENV": "STS-ENV-05", "REG-DSO-STO": "STS-STO-03", "REG-DSO-BCP": "STS-BCP-04", "REG-DSO-TST": "STS-TST-01"}, "Legal: EV-AS-05 emitted; DG issue logged; new materialisation and custody blocked until service is restored."),
    ("CFG-DSO-06", "Purged instance", {"REG-DSO-TEC": "STS-TEC-05", "REG-DSO-ENV": "STS-ENV-04", "REG-DSO-STO": "STS-STO-06", "REG-DSO-BCP": "STS-BCP-03", "REG-DSO-TST": "STS-TST-01"}, "Legal: destruction and custody closure allowed."),
]
EVIDENCE = [
    ("EVD-DSO-01", "Technology evaluation record", "Decision evidence", "TR-TEC-03", "Evaluation against the criteria; adoption decision and conditions."), ("EVD-DSO-02", "Environment development record", "Control evidence", "TR-ENV-02", "Change scripts, implementation path, naming standards applied."), ("EVD-DSO-03", "Service acceptance record", "Decision evidence", "TR-ENV-03", "Acceptance test against the OLA; monitoring activation."), ("EVD-DSO-04", "Monitoring report", "Assurance evidence", "TR-ENV-05", "Performance, storage, operations and service metrics; breach findings."), ("EVD-DSO-05", "Load record", "Control evidence", "TR-STO-01", "Source, environment, model version, row counts."), ("EVD-DSO-06", "Backup verification", "Control evidence", "TR-STO-02", "Backup, verification result, recovery point."), ("EVD-DSO-07", "Archive record", "Control evidence", "TR-STO-04", "Archive copy, verification, retention."), ("EVD-DSO-08", "Migration reconciliation", "Control evidence", "TR-STO-07", "Source and target reconciliation; cut-over."), ("EVD-DSO-09", "Purge record", "Control evidence", "TR-STO-09", "Scope, method, confirmation of instance and backups."), ("EVD-DSO-10", "Continuity test record", "Risk evidence", "TR-BCP-02", "Test scenario, recovery objectives, result."), ("EVD-DSO-11", "Invocation and recovery record", "Risk evidence", "TR-BCP-05", "Continuity event, invocation, recovery against objectives."), ("EVD-DSO-12", "Masking verification", "Control evidence", "TR-TST-04", "Masking rules, classification, verification result."), ("EVD-DSO-13", "Replication verification", "Control evidence", "TR-STO-12", "Replica environment, lag, verification."),
]
EXC = [("EXC-DSO-01", "Emergency Load", "TR-EX-02", "Materialisation of an asset into a degraded environment for an urgent business need.", "DR-DSO-03", "Breach open with a restoration date, instance protected on load, consumer accepts the degraded OLA, DG informed, evidence retained; expires at the restoration date.", "Draft / Approved / Expired / Closed")]

SPEC = {
    "meta": {"modelId": "KA-DSO", "name": "Data Storage and Operations FTS", "knowledgeArea": "Data Storage and Operations", "version": "0.1", "subjectType": KA_SUBJECT,
             "regionModel": "One FTS per managed element: a Database Technology (one per technology), a Database Environment (one per environment), the Stored Instance of a Data Asset (one per asset), the Business Continuity Plan of an environment and a Test Dataset (one per dataset) run concurrently and are coupled by cross-region constraints, facts and events, never a single subject.",
             "source": SRC_DECK + "; " + SRC_HOWARD + "; " + SRC_PROTOCOL,
             "note": "Five state regions, each its own FTS over one managed element of the Knowledge Area: a Database Technology, a Database Environment, the Stored Instance of a Data Asset, the Business Continuity Plan and a Test Dataset. The KA never becomes a region of the Data Asset; the environment, the stored instance and the plan reach the Global protocol through contributions (materialisation, active and preservation custody, restoration, the custody transfer trigger, destruction and custody closure, the assurance trigger and the monitoring service), and couple to Data Architecture, Data Modelling and Design, Data Security, DG and Metadata.",
             "definition": CONTEXT["definition"], "factBindings": FACT_BINDINGS},
    "context": CONTEXT, "regions": REGIONS, "states": STATES, "transitions": TRANS, "events": EVENTS, "decisionRights": DR, "roles": ROLES, "artefacts": ARTEFACTS, "activities": ACTS, "services": SERVICES, "contributions": CONTRIB, "kaCouplings": KA_COUPLINGS, "crossRegionConstraints": XRG, "stateVectors": VECTORS, "evidence": EVIDENCE, "exceptions": EXC,
    "sources": [
        {"id": "SRC-DSO-001", "source": SRC_DECK, "type": "Primary (image pages, captured)", "location": "Chat upload; OneDrive Data Lifecycle folder", "use": "Definition, goals, drivers, inputs, processes and sub-activities, deliverables, role players, techniques, tools, metrics", "limitations": "The context diagram gives the activities and deliverables but no instance lifecycle; the Stored Instance states (loaded, protected, archived, in migration, purged) are drafted from the Data Lifecycle Management technique and activities 2.3, 2.4 and 2.6. Test Dataset states (requested, provisioned, masked, refresh due, retired) are drafted from activity 2.5 on Howard's decision to give test datasets their own FTS."},
        {"id": "SRC-DSO-002", "source": SRC_HOWARD, "type": "Design direction", "location": "Chat", "use": "Managed elements, Global gating", "limitations": ""},
        {"id": "SRC-DSO-003", "source": SRC_PROTOCOL, "type": "Alignment target", "location": "Private repo models/", "use": "Global transition IDs for contributions; KA transition IDs for couplings", "limitations": ""},
    ],
    "qaNotes": [
        {"severity": "note", "rule": "GA-005", "element": "KA-DSO", "finding": "The technology, environment and plan change rarely relative to an instance and gate the instance through XRG-DSO-01..07; the Stored Instance is per asset and is the DSO region that gates Global materialisation, preservation, restoration and destruction."},
        {"severity": "note", "rule": "capture", "element": "REG-DSO-STO", "finding": "Stored Instance states are drafted from the Data Lifecycle Management technique and activities 2.3, 2.4 and 2.6; the context diagram lists no instance lifecycle. For Howard's review."},
        {"severity": "note", "rule": "decision", "element": "CON-DSO-02", "finding": "Active custody is gated on the environment in service under a tested continuity plan, and the backup gates preservation and restoration, because custody is established before the asset is loaded (TR-CP-01 follows TR-EX-01). Accepted by Howard 21 Sep 2026."},
        {"severity": "note", "rule": "derived", "element": "STATES", "finding": "All state names, events, decision rights, holders and services are first-pass drafts from the context diagram; every one is for Howard's review."},
    ],
}

if __name__ == "__main__":
    from ka_build import run_spec
    run_spec(SPEC, "data_storage_operations.fts.json")
