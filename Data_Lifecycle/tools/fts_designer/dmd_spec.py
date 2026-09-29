#!/usr/bin/env python3
"""
dmd_spec.py  -  Data Modelling and Design FTS v0.1: four state regions, each its own FTS over one managed element of
the Knowledge Area, derived from the DMBOK Data Modelling and Design context diagram (deck pages 43 to 47) and aligned
to the Global Data Asset Protocol.

Howard's managed elements (21 Sep 2026): 1 the Modelling Standards and Plan of the scope; 2 the Conceptual Data
Model of a Data Asset; 3 the Logical Data Model of a Data Asset; 4 the Physical Data Model of a Data Asset (one FTS
per model level, each per asset, with draft, reviewed, approved, managed, revision and superseded states; the Physical level adds Deployed).
Decisions 21 Sep 2026: DMD gates Global registration (approved conceptual model) and materialisation (reviewed,
approved and deployed physical model); a physical model revision emits the Assurance material-change trigger; model
validation measurement is an assurance service; every Return for Rework logs a DG Data Asset issue; every transition
carries a Decision Right (holders confirmed 22 Sep 2026 from the shared role vocabulary, role_vocabulary.json).

Usage: python dmd_spec.py [out_dir] [--overrides spec/data_modelling_design_overrides.json]   -> data_modelling_design.fts.json
"""
import json, os, sys
from ka_build import build

SRC_DECK = "DMBOK Data Lifecycle and KA Context Diagrams.pdf, Data Modelling and Design pages 43 to 47 (What, Why, Activities, Role Players and Technical Drivers)"
SRC_HOWARD = "Howard Diesel, 21 Sep 2026: four Data Modelling and Design managed elements (Modelling Standards and Plan; Conceptual, Logical and Physical Data Model of a Data Asset, one FTS per level), Global gating of register on the conceptual model and materialise on the deployed physical model, revision trigger, validation as assurance service, every review rejection a DG issue"
SRC_PROTOCOL = "global_protocol.fts.json v0.2.1 for the contribution targets; data_governance v0.2, data_architecture, metadata_management and reference_master_data v0.1 for the couplings"

CONTEXT = {
    "knowledgeArea": "Data Modelling and Design",
    "definition": "Data modeling is the process of discovering, analyzing, and scoping data requirements, and then representing and communicating these data requirements in a precise form called the data model. This process is iterative and may include a conceptual, logical, and physical model. Each model contains a set of components such as entities, relationships, attributes, facts and keys. Data Models contain Metadata uncovered during the modelling process which is essential to other data management functions.",
    "ensures": "Every Data Asset has a confirmed, documented understanding of its data requirements at conceptual, logical and physical level, built to the modelling standards, reviewed, approved and managed as versions, so that applications align with business requirements and the models serve master data management and data governance.",
    "goals": ["To confirm and document an understanding of different perspectives, which leads to applications that more closely align with current and future business requirements and creates a foundation to successfully compete broad-scoped initiatives such as master data management and data governance programs", "Formalisation", "Scope-definition", "Knowledge retention / documentation"],
    "businessDrivers": ["Provide common vocabulary around data", "Capture and document explicit knowledge about the organisation's data and systems", "Primary communications tool during projects", "Provide the starting point for customisation, integration or replacement of an application"],
    "inputs": ["Existing data models and databases", "Data standards", "Data sets", "Initial data requirements", "Original data requirements", "Data architecture", "Enterprise taxonomy"],
    "processes": [
        {"id": "1", "name": "Plan for Data Modeling", "phase": "P", "subActivities": []},
        {"id": "2", "name": "Build the Data Models", "phase": "D", "subActivities": ["2.1 Create the Conceptual Data Model", "2.2 Create the Logical Data Model", "2.3 Create the Physical Data Model"]},
        {"id": "3", "name": "Review the Data Models", "phase": "C", "subActivities": []},
        {"id": "4", "name": "Manage the Data Models", "phase": "O", "subActivities": []},
    ],
    "deliverables": ["Conceptual Data Model", "Logical Data Model", "Physical Data Model"],
    "suppliers": ["Business Professionals", "Business Analysts", "Data Architects", "Database Administrators and Developers", "Subject Matter Experts", "Data Stewards", "Metadata Administrators"],
    "participants": ["Business Analysts", "Data Modelers"],
    "consumers": ["Business Analysts", "Data Modelers", "Database Administrators and Developers", "Software Developers", "Data Stewards", "Data Quality Analysts", "Data Consumers"],
    "techniques": ["Naming conventions", "Database design", "Database type selection"],
    "tools": ["Data modeling tools", "Lineage tools", "Metadata repositories", "Data model patterns", "Industry data models"],
    "metrics": ["Data model validation measurement"],
    "phaseTags": "(P) Planning, (C) Control, (D) Development, (O) Operations",
}

KA_SUBJECT = "Data Modelling and Design Knowledge Area: four managed elements, one FTS (state region) each; the Data Asset is the Global subject reached through contributions"

# the three model levels share one lifecycle pattern; each is its own region over its own managed element
LEVELS = [
    ("CDM", "Conceptual Data Model", "conceptual", "2.1", "the business entities, their relationships and definitions of the asset, in business vocabulary, placed within the enterprise data model", "inputs:Initial data requirements"),
    ("LDM", "Logical Data Model", "logical", "2.2", "the attributes, keys, facts and normalised structures of the asset, independent of technology, derived from the approved conceptual model", "inputs:Original data requirements"),
    ("PDM", "Physical Data Model", "physical", "2.3", "the tables, columns, keys, indexes and database-type-specific design of the asset, derived from the approved logical model, which the stored asset implements", "techniques:Database design"),
]
REGIONS = [
    ("REG-DMD-STD", "Modelling Standards and Plan", "STD", "Whether the modelling plan (scope, approach, tool set) and the modelling standards (naming conventions, model patterns, database design standards) of the scope exist, are approved, are in force or are under revision.", "STS-STD-01", "Exactly one active state; revised standards supersede, never coexist with, the standards in force.",
     "Modelling Standards and Plan of the governed scope: the plan for data modelling (scope, approach, tool set, industry models and patterns adopted) and the modelling standards (naming conventions, database design standards, validation criteria) every model is built and reviewed to",
     {"instanceScope": "One instance per governed scope.", "elementKind": "Governing element", "contributesTo": "No Global transition is gated on the standards directly; they gate every model through cross-region constraints and are governing instruments held with Data Governance.", "conditionsThatMatter": "None; planned; approved; in force; under revision."}),
]
for code, name, adj, sub, what, _ in LEVELS:
    REGIONS.append((f"REG-DMD-{code}", name, code, f"Whether the {adj} data model of one Data Asset is drafted, reviewed, approved, managed as the current version, " + ("deployed to the store, " if code == "PDM" else "") + "under revision or superseded.", f"STS-{code}-01", f"Exactly one active state per asset; exactly one managed {adj} model version is current at a time.",
        f"{name} of a Data Asset: {what}; versioned and managed in the modelling tool and metadata repository",
        {"instanceScope": "One instance per Data Asset; versions are successive states of the same instance.", "elementKind": "Managed per-asset element (deliverable)",
         "contributesTo": {"CDM": "Existence: an asset is registered only under an approved conceptual model, which formalises its requirements (TR-EX-01).", "LDM": "No Global transition is gated on the logical model directly; it gates the physical model through cross-region constraints and is the model the master data domain models cite.", "PDM": "Existence: an asset is materialised only under a reviewed, approved and deployed physical model (TR-EX-02); Assurance: a physical model revision emits the material-change trigger (TR-AS-05) and the model validation measurement supplies assurance evidence (TR-AS-02)."}[code],
         "conditionsThatMatter": "None; draft; reviewed; approved; managed; deployed (physical only); revision; superseded."}))

STATES = [
    ("STS-STD-01", "REG-DMD-STD", "No Modelling Standards", True, False, "No modelling plan or standards exist for the governed scope; models are built ad hoc.", "The absence of standards remains visible to governance bodies.", ["inputs:Data standards"]),
    ("STS-STD-02", "REG-DMD-STD", "Planned Modelling", False, False, "The plan for data modelling (scope, approach, tool set, industry models and patterns to adopt) is drafted with the naming conventions and design standards.", "Each planned standard remains traceable to a data standard, pattern or architecture input.", ["process:1", "inputs:Data standards", "inputs:Data architecture", "tools:Data model patterns", "tools:Industry data models"]),
    ("STS-STD-03", "REG-DMD-STD", "Approved Standards", False, False, "The modelling standards and plan are approved and the standards approved as governing instruments.", "The approved standards, plan and approving authority remain traceable.", ["process:1", "techniques:Naming conventions"]),
    ("STS-STD-04", "REG-DMD-STD", "Standards in Force", False, False, "The standards are applied to every model and review; validation measurement is reported against them.", "Every reviewed model cites the standards version it was reviewed against.", ["process:3", "process:4", "metric:Data model validation measurement"]),
    ("STS-STD-05", "REG-DMD-STD", "Standards Revision", False, False, "The standards or plan are under revision after a tool, architecture or pattern trigger while the standards in force stay in force.", "The standards in force remain valid until the revision is approved.", ["process:1"]),
]
def _n(code):
    """state numbers per level: Managed, Deployed (physical only), Revision, Superseded"""
    return {"MAN": "05", "DEP": "06" if code == "PDM" else None, "REV": "07" if code == "PDM" else "06", "SUP": "08" if code == "PDM" else "07"}
for code, name, adj, sub, what, ctx in LEVELS:
    n = _n(code)
    STATES += [
        (f"STS-{code}-01", f"REG-DMD-{code}", f"No {name}", True, False, f"No {adj} data model exists for the asset.", f"The absence of a {adj} model remains visible.", [ctx]),
        (f"STS-{code}-02", f"REG-DMD-{code}", f"Draft {name}", False, False, f"The {adj} model is being built to the standards from its inputs and the level above.", "The draft remains traceable to its requirements and to the model it derives from.", [f"process:{sub}", "tools:Data modeling tools"]),
        (f"STS-{code}-03", f"REG-DMD-{code}", f"Reviewed {name}", False, False, f"The {adj} model is reviewed against the standards and the level above; findings and the validation measurement are recorded and await the approval decision.", "Review findings, the standards version and the validation measurement remain recorded.", ["process:3", "metric:Data model validation measurement"]),
        (f"STS-{code}-04", f"REG-DMD-{code}", f"Approved {name}", False, False, f"The {adj} model version is approved with its review findings closed.", "The approved version, its findings and the approving authority remain traceable.", ["process:3", f"deliverable:{name}"]),
        (f"STS-{code}-{n['MAN']}", f"REG-DMD-{code}", f"Managed {name}", False, False, f"The approved {adj} model is published as the current version in the modelling tool and metadata repository and managed under change control.", "Exactly one current version; its lineage and metadata are registered.", ["process:4", "tools:Metadata repositories", "tools:Lineage tools"]),
    ]
    if n["DEP"]:
        STATES.append((f"STS-{code}-{n['DEP']}", f"REG-DMD-{code}", f"Deployed {name}", False, False, "The managed physical model is implemented as the schema of the store that holds the asset; the deployed schema matches the managed version.", "The deployed schema and the managed version remain identical; drift is a finding.", ["process:4", "techniques:Database design", "techniques:Database type selection"]))
    STATES += [
        (f"STS-{code}-{n['REV']}", f"REG-DMD-{code}", f"{name} Revision", False, False, f"A new {adj} model version is in draft under a change request while the current version stays " + ("deployed." if n["DEP"] else "managed."), "The current version remains valid until the revision is approved and published.", ["process:4", f"process:{sub}"]),
        (f"STS-{code}-{n['SUP']}", f"REG-DMD-{code}", f"Superseded {name}", False, False, f"The {adj} model is withdrawn (asset disposed or descoped, or replaced by another model) and retained for the record.", "The successor model (if any) and retention remain recorded.", ["process:4"]),
    ]
EVENTS = {
    "EV-STD-01": ("Modelling planning", "Request"), "EV-STD-02": ("Standards approval", "Decision outcome"), "EV-STD-03": ("Standards activation", "Decision outcome"), "EV-STD-04": ("Standards revision trigger", "Monitoring trigger"), "EV-STD-05": ("Revised standards approval", "Decision outcome"), "EV-STD-06": ("Standards retirement", "Decision outcome"),
}
for code, name, adj, sub, what, ctx in LEVELS:
    EVENTS.update({f"EV-{code}-01": (f"{name} initiation", "Request"), f"EV-{code}-02": (f"{name} review completion", "Assessment outcome"), f"EV-{code}-03": (f"{name} review rejection", "Decision outcome"), f"EV-{code}-04": (f"{name} approval", "Decision outcome"), f"EV-{code}-05": (f"{name} publication", "Decision outcome"), f"EV-{code}-06": (f"{name} change request", "Request"), f"EV-{code}-07": (f"{name} supersession", "Decision outcome")})
EVENTS["EV-PDM-08"] = ("Physical Data Model deployment", "Evidence trigger")
DR = {
    "DR-DMD-01": ("Approve the Modelling Standards and Plan", "ROLE-PM-DMD", "Confirmed 22 Sep 2026 (holder register): Data Modelling and Design Practice Manager; drafted as Data Modelers"),
    "DR-DMD-02": ("Activate, Revise and Retire the Modelling Standards", "ROLE-DMOD", "Confirmed 22 Sep 2026 (holder register): Data Modeller; drafted as Data Modelers"),
    "DR-DMD-03": ("Initiate and Revise a Data Model", "ROLE-DMOD", "Confirmed 22 Sep 2026 (holder register): Data Modeller; drafted as Data Modelers"),
    "DR-DMD-04": ("Review a Data Model and Record its Validation Measurement", "ROLE-BA", "Confirmed 22 Sep 2026 (holder register): Business Analyst; drafted as Business Analysts"),
    "DR-DMD-05": ("Approve or Reject a Data Model Version", "ROLE-PM-DMD", "Confirmed 22 Sep 2026 (holder register): Data Modelling and Design Practice Manager; drafted as Data Modelers"),
    "DR-DMD-06": ("Publish, Supersede and Re-model a Data Model", "ROLE-DMOD", "Confirmed 22 Sep 2026 (holder register): Data Modeller; drafted as Data Modelers"),
}
ROLES = [
    ("ROLE-DMD-S01", "Business Professionals", "Supplier", "Supply business requirements and vocabulary."), ("ROLE-DMD-S02", "Business Analysts", "Supplier", "Supply analysed requirements."), ("ROLE-DMD-S03", "Data Architects", "Supplier", "Supply the data architecture and enterprise data model."), ("ROLE-DMD-S04", "Database Administrators and Developers", "Supplier", "Supply existing databases and physical constraints."), ("ROLE-DMD-S05", "Subject Matter Experts", "Supplier", "Supply business meaning."), ("ROLE-DMD-S06", "Data Stewards", "Supplier", "Supply data standards and definitions."), ("ROLE-DMD-S07", "Metadata Administrators", "Supplier", "Supply existing models and metadata."),
    ("ROLE-DMD-P01", "Business Analysts", "Participant", "Analyse requirements; review models against the business."), ("ROLE-DMD-P02", "Data Modelers", "Participant", "Plan the modelling; build, revise and manage the models; approve versions."),
    ("ROLE-DMD-C01", "Business Analysts", "Consumer", "Consume the conceptual and logical models."), ("ROLE-DMD-C02", "Data Modelers", "Consumer", "Consume managed models as patterns and inputs."), ("ROLE-DMD-C03", "Database Administrators and Developers", "Consumer", "Consume the physical model to implement storage."), ("ROLE-DMD-C04", "Software Developers", "Consumer", "Consume the logical and physical models."), ("ROLE-DMD-C05", "Data Stewards", "Consumer", "Consume the models as documented definitions."), ("ROLE-DMD-C06", "Data Quality Analysts", "Consumer", "Consume model constraints as quality expectations."), ("ROLE-DMD-C07", "Data Consumers", "Consumer", "Consume the models as the common vocabulary."),
]
TRANS = [
    ("TR-STD-01", "Plan Modelling", "STS-STD-01", "STS-STD-02", "EV-STD-01", "Data standards, the data architecture, patterns and industry models are available as inputs.", "DR-DMD-02", ["SVC-DMD-01"], ["ACT-DMD-1"]),
    ("TR-STD-02", "Approve Standards", "STS-STD-02", "STS-STD-03", "EV-STD-02", "The modelling standards and plan are approved and the standards approved as governing instruments under Data Governance.", "DR-DMD-01", ["SVC-DMD-01"], ["ACT-DMD-1"]),
    ("TR-STD-03", "Bring Standards into Force", "STS-STD-03", "STS-STD-04", "EV-STD-03", "The standards are published to the modelling tools and review checklists.", "DR-DMD-02", ["SVC-DMD-01"], ["ACT-DMD-1"]),
    ("TR-STD-04", "Open Standards Revision", "STS-STD-04", "STS-STD-05", "EV-STD-04", "A tool, architecture or pattern trigger is recorded; the standards in force are retained meanwhile.", "DR-DMD-02", ["SVC-DMD-01"], ["ACT-DMD-1"]),
    ("TR-STD-05", "Approve Revised Standards", "STS-STD-05", "STS-STD-03", "EV-STD-05", "The revised standards and plan are approved.", "DR-DMD-01", ["SVC-DMD-01"], ["ACT-DMD-1"]),
    ("TR-STD-06", "Retire Standards", "STS-STD-05", "STS-STD-01", "EV-STD-06", "The standards are retired without replacement and the retirement recorded.", "DR-DMD-02", ["SVC-DMD-01"], ["ACT-DMD-1"]),
]
for code, name, adj, sub, what, ctx in LEVELS:
    above = {"CDM": "the requirements and the enterprise data model", "LDM": "the approved conceptual model", "PDM": "the approved logical model and the selected database type"}[code]
    act = f"ACT-DMD-{sub}"; n = _n(code); cur = n["DEP"] or n["MAN"]
    TRANS += [
        (f"TR-{code}-01", f"Draft {name}", f"STS-{code}-01", f"STS-{code}-02", f"EV-{code}-01", f"The {adj} model is built to the standards in force from {above}.", "DR-DMD-03", ["SVC-DMD-02"], ["ACT-DMD-2", act]),
        (f"TR-{code}-02", f"Review {name}", f"STS-{code}-02", f"STS-{code}-03", f"EV-{code}-02", f"The {adj} model is reviewed against the standards and {above}; the validation measurement is recorded.", "DR-DMD-04", ["SVC-DMD-03"], ["ACT-DMD-3"]),
        (f"TR-{code}-03", f"Return {name} for Rework", f"STS-{code}-03", f"STS-{code}-02", f"EV-{code}-03", "The review findings require rework before approval; a Data Asset issue is logged with Data Governance.", "DR-DMD-05", ["SVC-DMD-04"], ["ACT-DMD-3"]),
        (f"TR-{code}-04", f"Approve {name}", f"STS-{code}-03", f"STS-{code}-04", f"EV-{code}-04", "The review findings are closed and the model version approved.", "DR-DMD-05", ["SVC-DMD-04"], ["ACT-DMD-3"]),
        (f"TR-{code}-05", f"Publish {name}", f"STS-{code}-04", f"STS-{code}-{n['MAN']}", f"EV-{code}-05", "The approved version is published as the current version in the modelling tool and metadata repository with its lineage.", "DR-DMD-06", ["SVC-DMD-05"], ["ACT-DMD-4"]),
        (f"TR-{code}-06", f"Open {name} Revision", f"STS-{code}-{cur}", f"STS-{code}-{n['REV']}", f"EV-{code}-06", "A change request opens a new version in draft; the current version stays " + ("deployed." if n["DEP"] else "managed."), "DR-DMD-03", ["SVC-DMD-02", "SVC-DMD-05"], ["ACT-DMD-4", act]),
        (f"TR-{code}-07", f"Review {name} Revision", f"STS-{code}-{n['REV']}", f"STS-{code}-03", f"EV-{code}-02", "The revised version is reviewed against the standards and its differences from the current version recorded.", "DR-DMD-04", ["SVC-DMD-03"], ["ACT-DMD-3"]),
        (f"TR-{code}-08", f"Supersede {name}", f"STS-{code}-{cur}", f"STS-{code}-{n['SUP']}", f"EV-{code}-07", "The asset is disposed or descoped, or the model is replaced by another managed model; the model is withdrawn and retained.", "DR-DMD-06", ["SVC-DMD-05"], ["ACT-DMD-4"]),
        (f"TR-{code}-09", f"Re-model {name}", f"STS-{code}-{n['SUP']}", f"STS-{code}-02", f"EV-{code}-01", "A superseded model is needed again and re-drafted from its retained version.", "DR-DMD-06", ["SVC-DMD-02"], ["ACT-DMD-2", act]),
    ]
    if n["DEP"]:
        TRANS += [
            (f"TR-{code}-10", f"Deploy {name}", f"STS-{code}-{n['MAN']}", f"STS-{code}-{n['DEP']}", "EV-PDM-08", "The managed physical model is implemented as the schema of the store and the deployment verified against the managed version.", "DR-DMD-06", ["SVC-DMD-05"], ["ACT-DMD-4"]),
            (f"TR-{code}-11", f"Withdraw Undeployed {name}", f"STS-{code}-{n['MAN']}", f"STS-{code}-{n['SUP']}", f"EV-{code}-07", "A managed physical model that was never deployed is withdrawn and retained.", "DR-DMD-06", ["SVC-DMD-05"], ["ACT-DMD-4"]),
        ]
SERVICES = [
    ("SVC-DMD-01", "Governance", "Modelling Planning and Standards", "Planning; standards approval, activation, revision, retirement.", "Modelling plan; naming conventions; design standards; adopted patterns and industry models."),
    ("SVC-DMD-02", "Control", "Model Building", "Model initiation; change request; re-modelling.", "Draft conceptual, logical or physical model built to the standards."),
    ("SVC-DMD-03", "Assurance", "Data Model Review and Validation Measurement", "Draft or revised model.", "Review findings; data model validation measurement against the standards and the level above."),
    ("SVC-DMD-04", "Governance", "Model Version Approval", "Reviewed model.", "Approved or rejected model version with closed findings."),
    ("SVC-DMD-05", "Control", "Model Management and Publication", "Approved version; change request; supersession.", "Current managed version in the modelling tool and metadata repository; lineage; version history."),
]
ACTS = [
    ("ACT-DMD-1", "Plan for Data Modeling", "1", "Transition-causing", ["REG-DMD-STD"], ["TR-STD-01", "TR-STD-02", "TR-STD-03", "TR-STD-04", "TR-STD-05", "TR-STD-06"], ["SVC-DMD-01"]),
    ("ACT-DMD-2", "Build the Data Models", "2", "Transition-causing", ["REG-DMD-CDM", "REG-DMD-LDM", "REG-DMD-PDM"], [f"TR-{c}-0{n}" for c in ("CDM", "LDM", "PDM") for n in (1, 9)], ["SVC-DMD-02"]),
    ("ACT-DMD-2.1", "Create the Conceptual Data Model", "2.1", "Transition-causing", ["REG-DMD-CDM"], ["TR-CDM-01", "TR-CDM-06", "TR-CDM-09"], ["SVC-DMD-02"]),
    ("ACT-DMD-2.2", "Create the Logical Data Model", "2.2", "Transition-causing", ["REG-DMD-LDM"], ["TR-LDM-01", "TR-LDM-06", "TR-LDM-09"], ["SVC-DMD-02"]),
    ("ACT-DMD-2.3", "Create the Physical Data Model", "2.3", "Transition-causing", ["REG-DMD-PDM"], ["TR-PDM-01", "TR-PDM-06", "TR-PDM-09"], ["SVC-DMD-02"]),
    ("ACT-DMD-3", "Review the Data Models", "3", "Transition-causing", ["REG-DMD-CDM", "REG-DMD-LDM", "REG-DMD-PDM"], [f"TR-{c}-0{n}" for c in ("CDM", "LDM", "PDM") for n in (2, 3, 4, 7)], ["SVC-DMD-03", "SVC-DMD-04"]),
    ("ACT-DMD-4", "Manage the Data Models", "4", "Transition-causing", ["REG-DMD-CDM", "REG-DMD-LDM", "REG-DMD-PDM"], [f"TR-{c}-0{n}" for c in ("CDM", "LDM", "PDM") for n in (5, 6, 8)] + ["TR-PDM-10", "TR-PDM-11"], ["SVC-DMD-05"]),
]
ARTEFACTS = [
    ("ART-DMD-01", "Conceptual Data Model", "STS-CDM-05", "Create the Conceptual Data Model", "Evidences Managed Conceptual Data Model; cited by Global registration."), ("ART-DMD-02", "Logical Data Model", "STS-LDM-05", "Create the Logical Data Model", "Evidences Managed Logical Data Model; cited by the master data domain model."), ("ART-DMD-03", "Physical Data Model", "STS-PDM-06", "Create the Physical Data Model", "Evidences Managed Physical Data Model; cited by Global materialisation."),
]
CONTRIB = [
    ("CON-DMD-01", "TR-EX-01", "guard", {"CDM": ["STS-CDM-04", "STS-CDM-05", "STS-CDM-06"]}, "An asset is registered only under an approved conceptual data model, which formalises its data requirements.", "DMD_conceptual_approved", "Required", "Register Asset cites the conceptual model version."),
    ("CON-DMD-02", "TR-EX-02", "guard", {"PDM": ["STS-PDM-06", "STS-PDM-07"]}, "An asset is materialised only under a reviewed, approved physical data model deployed as the schema of its store.", "DMD_physical_deployed", "Required", "Materialize Asset cites the deployed physical model version; the logical model is implied by XRG-DMD-03."),
    ("CON-DMD-03", "TR-AS-05", "event", {"PDM": ["STS-PDM-07"]}, "A physical model revision is a material change affecting the assurance claim.", "DMD_physical_revision", "Conditional", "DMD emits EV-AS-05 when TR-PDM-06 fires."),
    ("CON-DMD-04", "TR-AS-02", "service", {"PDM": ["STS-PDM-06"]}, "The Data Model Review and Validation Measurement supplies assurance evidence for the asset's model.", "SVC-DMD-03", "Conditional", "Assurance service; evidence EVD-DMD-04."),
    ("CON-DMD-05", "TR-CP-01", "guard", {"PDM": ["STS-PDM-06", "STS-PDM-07"]}, "A custodian accepts accountability for a stored asset only when a deployed physical data model describes what is held.", "DMD_physical_deployed or not DMD_model_managed", "Conditional", "Howard, 22 Sep (open decisions record, Custody sweep): assets with no managed physical model are unaffected."),
    ("CON-DMD-06", "TR-CP-04", "guard", {"LDM": ["STS-LDM-04", "STS-LDM-05", "STS-LDM-06"]}, "An asset is placed in external custody only with an approved logical data model as the data contract handed to the external custodian.", "DMD_logical_approved or not DMD_model_managed", "Conditional", "Howard, 22 Sep (open decisions record, Custody sweep)."),
    ("CON-DMD-07", "TR-CP-05", "guard", {"LDM": ["STS-LDM-04", "STS-LDM-05", "STS-LDM-06"]}, "A custody transfer is initiated only when the transfer package is described by an approved logical data model.", "DMD_logical_approved or not DMD_model_managed", "Conditional", "Howard, 22 Sep (open decisions record, Custody sweep)."),
]
KA_COUPLINGS = [
    ("KAC-DMD-01", "KA-DG", "TR-POL-03", "", "DMD_policy_set_in_force", "The modelling standards are governing instruments published under Data Governance (TR-STD-02 and TR-STD-05 cite this Knowledge Area's own instrument set (Howard, 24 Sep 2026: one policy with its procedures per Knowledge Area, each set its own fact)).", "Reverse coupling: a DMD transition cites a DG fact."),
    ("KAC-DMD-02", "KA-DG", "TR-ISS-01", "EV-ISS-01", "DMD_review_rejected", "Every review rejection is logged as a Data Asset issue with source Data Modelling and Design (TR-CDM-03, TR-LDM-03 and TR-PDM-03 emit EV-ISS-01).", "DG owns escalation; DMD owns the rework; the issue closes when the model is approved."),
    ("KAC-DMD-03", "KA-DA", "TR-EDM-04", "", "DA_model_published", "A conceptual model is drafted within the published enterprise data model (TR-CDM-01 cites the DA fact).", "Reverse coupling: a DMD transition cites a DA fact."),
    ("KAC-DMD-04", "KA-DA", "TR-CNF-02", "", "DMD_physical_deployed", "The architectural conformance review of an asset cites its approved physical model (the DA transition cites the DMD fact).", "Forward coupling: a DA transition cites a DMD fact."),
    ("KAC-DMD-05", "KA-MM", "TR-AST-02", "", "DMD_model_managed", "The managed models carry the metadata uncovered in modelling; describing an asset cites its managed models (the MM transition cites the DMD fact).", "Forward coupling: an MM transition cites a DMD fact."),
    ("KAC-DMD-06", "KA-RMD", "TR-DOM-03", "", "DMD_logical_approved", "A master data domain model is approved as the logical model of the domain (the RMD transition cites the DMD fact).", "Forward coupling: an RMD transition cites a DMD fact."),
]
FACT_BINDINGS = {
    "DMD_standards_in_force": {"region": "REG-DMD-STD", "states": ["STS-STD-04", "STS-STD-05"]},
    "DMD_conceptual_approved": {"region": "REG-DMD-CDM", "states": ["STS-CDM-04", "STS-CDM-05", "STS-CDM-06"]},
    "DMD_logical_approved": {"region": "REG-DMD-LDM", "states": ["STS-LDM-04", "STS-LDM-05", "STS-LDM-06"]},
    "DMD_physical_approved": {"region": "REG-DMD-PDM", "states": ["STS-PDM-04", "STS-PDM-05", "STS-PDM-06", "STS-PDM-07"]},
    "DMD_physical_deployed": {"region": "REG-DMD-PDM", "states": ["STS-PDM-06", "STS-PDM-07"]},
    "DMD_physical_revision": {"region": "REG-DMD-PDM", "states": ["STS-PDM-07"]},
    "DMD_model_managed": {"region": "REG-DMD-PDM", "states": ["STS-PDM-05", "STS-PDM-06", "STS-PDM-07"]},
}
XRG = [
    ("XRG-DMD-01", "A model is drafted, revised or re-modelled only under approved or in-force standards.", ["TR-CDM-01", "TR-CDM-06", "TR-CDM-09", "TR-LDM-01", "TR-LDM-06", "TR-LDM-09", "TR-PDM-01", "TR-PDM-06", "TR-PDM-09"], "Required", "STD in ('STS-STD-03','STS-STD-04','STS-STD-05')"),
    ("XRG-DMD-02", "A logical model is drafted only from an approved or managed conceptual model.", ["TR-LDM-01", "TR-LDM-09"], "Required", "CDM in ('STS-CDM-04','STS-CDM-05','STS-CDM-06')"),
    ("XRG-DMD-03", "A physical model is drafted only from an approved or managed logical model.", ["TR-PDM-01", "TR-PDM-09"], "Required", "LDM in ('STS-LDM-04','STS-LDM-05','STS-LDM-06')"),
    ("XRG-DMD-04", "A model is reviewed only under standards in force.", ["TR-CDM-02", "TR-CDM-07", "TR-LDM-02", "TR-LDM-07", "TR-PDM-02", "TR-PDM-07"], "Required", "STD in ('STS-STD-04','STS-STD-05')"),
    ("XRG-DMD-05", "A conceptual model is superseded only when its logical model is superseded or absent.", ["TR-CDM-08"], "Required", "LDM in ('STS-LDM-01','STS-LDM-07')"),
    ("XRG-DMD-06", "A logical model is superseded only when its physical model is superseded or absent.", ["TR-LDM-08"], "Required", "PDM in ('STS-PDM-01','STS-PDM-08')"),
    ("XRG-DMD-07", "The standards are retired only when no model is managed under them.", ["TR-STD-06"], "Required", "CDM in ('STS-CDM-01','STS-CDM-07') and LDM in ('STS-LDM-01','STS-LDM-07') and PDM in ('STS-PDM-01','STS-PDM-08')"),
]
VECTORS = [
    ("CFG-DMD-01", "Greenfield", {"REG-DMD-STD": "STS-STD-01", "REG-DMD-CDM": "STS-CDM-01", "REG-DMD-LDM": "STS-LDM-01", "REG-DMD-PDM": "STS-PDM-01"}, "Initial configuration: no standards, no models; Global registration blocked by CON-DMD-01."),
    ("CFG-DMD-02", "Conceptual model approved", {"REG-DMD-STD": "STS-STD-04", "REG-DMD-CDM": "STS-CDM-04", "REG-DMD-LDM": "STS-LDM-02", "REG-DMD-PDM": "STS-PDM-01"}, "Legal: registration allowed; materialisation blocked until the physical model is approved."),
    ("CFG-DMD-03", "All models managed, physical deployed", {"REG-DMD-STD": "STS-STD-04", "REG-DMD-CDM": "STS-CDM-05", "REG-DMD-LDM": "STS-LDM-05", "REG-DMD-PDM": "STS-PDM-06"}, "Legal: all DMD contributions satisfied; the asset can be materialised; validation measurement supplies assurance evidence."),
    ("CFG-DMD-04", "Physical model revision", {"REG-DMD-STD": "STS-STD-04", "REG-DMD-CDM": "STS-CDM-05", "REG-DMD-LDM": "STS-LDM-05", "REG-DMD-PDM": "STS-PDM-07"}, "Legal: EV-AS-05 emitted; the deployed physical version stays in force so materialisation of a new instance remains allowed."),
    ("CFG-DMD-05", "Models superseded", {"REG-DMD-STD": "STS-STD-04", "REG-DMD-CDM": "STS-CDM-07", "REG-DMD-LDM": "STS-LDM-07", "REG-DMD-PDM": "STS-PDM-08"}, "Legal: asset disposed or descoped; models retained for the record."),
    ("CFG-DMD-06", "Standards revision", {"REG-DMD-STD": "STS-STD-05", "REG-DMD-CDM": "STS-CDM-05", "REG-DMD-LDM": "STS-LDM-05", "REG-DMD-PDM": "STS-PDM-06"}, "Legal: standards in force retained; models remain managed."),
]
EVIDENCE = [
    ("EVD-DMD-01", "Standards approval record", "Decision evidence", "TR-STD-02", "Approved plan, naming conventions, design standards, adopted patterns."), ("EVD-DMD-02", "Conceptual model review record", "Assurance evidence", "TR-CDM-02", "Findings, standards version, validation measurement."), ("EVD-DMD-03", "Logical model review record", "Assurance evidence", "TR-LDM-02", "Findings, standards version, validation measurement."), ("EVD-DMD-04", "Physical model review record", "Assurance evidence", "TR-PDM-02", "Findings, standards version, database type selection, validation measurement."), ("EVD-DMD-05", "Model version approval", "Decision evidence", "TR-PDM-04", "Approved version, closed findings, approving authority (one per level)."), ("EVD-DMD-06", "Model publication record", "Control evidence", "TR-PDM-05", "Published version, repository entry, lineage (one per level)."), ("EVD-DMD-07", "Change request record", "Control evidence", "TR-PDM-06", "Change request, new version, differences (one per level)."), ("EVD-DMD-08", "Supersession record", "Control evidence", "TR-PDM-08", "Reason, successor model, retention (one per level)."), ("EVD-DMD-09", "Deployment record", "Control evidence", "TR-PDM-10", "Deployed schema, store, verification against the managed version."),
]
EXC = [("EXC-DMD-01", "Provisional Physical Model", "TR-EX-02", "Materialisation of an asset whose physical model is managed but whose deployment verification is outstanding.", "DR-DMD-05", "Physical model managed, deployment verification scheduled with a date, DG informed, evidence retained; expires at the verification date.", "Draft / Approved / Expired / Closed")]

# Coupling roles (Howard, 24 Sep 2026, Influence Map Register card 2 option a): each coupling says which Knowledge Area produces
# the fact and which transitions depend on it. kind condition: the twin engine adds the fact as a guard on every dependent
# transition (Required, or Conditional with a qualifier fact that must be true for the guard to apply). kind event: the
# emitter transitions raise the event in the target Knowledge Area (effect resolve: evidence that resolves the issue the
# named coupling raised). Generated from the coupling text and the fact names, then kept here as the source of truth.
COUPLING_ROLES = {'KAC-DMD-01': {'dependents': [{'model': 'KA-DMD', 'transition': 'TR-STD-02'}, {'model': 'KA-DMD', 'transition': 'TR-STD-05'}],
                'kind': 'condition',
                'producer': 'KA-DG',
                'requirement': 'Required'},
 'KAC-DMD-02': {'emitters': ['TR-CDM-03', 'TR-LDM-03', 'TR-PDM-03'], 'kind': 'event', 'producer': 'KA-DMD'},
 'KAC-DMD-03': {'dependents': [{'model': 'KA-DMD', 'transition': 'TR-CDM-01'}], 'kind': 'condition', 'producer': 'KA-DA', 'requirement': 'Required'},
 'KAC-DMD-04': {'dependents': [{'model': 'KA-DA', 'transition': 'TR-CNF-02'}], 'kind': 'condition', 'producer': 'KA-DMD', 'requirement': 'Required'},
 'KAC-DMD-05': {'kind': 'citation', 'producer': 'KA-DMD', 'cites': {'model': 'KA-MM', 'transition': 'TR-AST-02'}, 'raises': {'model': 'KA-MM', 'event': 'EV-AST-05'}, 'onlyIf': 'MM_asset_described'},
 'KAC-DMD-06': {'dependents': [{'model': 'KA-RMD', 'transition': 'TR-DOM-03'}], 'kind': 'condition', 'producer': 'KA-DMD', 'requirement': 'Required'}}

# State Contracts register (Howard, 25 Sep 2026, cards 7 and 8 option a): each transition names the policy controls that govern it, by
# policy domain and control number of the Knowledge Area policy in the FutureState workbooks (the wording and the implementing
# procedure are resolved per organisation from the private catalogue spec/policy_controls.json and the workbooks). Drafted
# 25 Sep 2026 for Howard's review (status Proposed); an empty list means no control of the allowed domains fits the step.
POLICY_CONTROLS = {'TR-STD-01': {'controls': [('PD-DMOD', 'C07')], 'why': 'Planning produces the modelling standards to be published.'},
 'TR-STD-02': {'controls': [('PD-DMOD', 'C07')], 'why': 'The modelling standards are approved for publication.'},
 'TR-STD-03': {'controls': [('PD-DMOD', 'C07')], 'why': 'The standards are published to the modelling tools and checklists.'},
 'TR-STD-04': {'controls': [('PD-DMOD', 'C07')], 'why': 'A revision reopens the published standards.'},
 'TR-STD-05': {'controls': [('PD-DMOD', 'C07')], 'why': 'Revised standards are approved for publication.'},
 'TR-STD-06': {'controls': [('PD-DMOD', 'C07')], 'why': 'Retiring the standards reverses their publication.'},
 'TR-CDM-01': {'controls': [('PD-DMOD', 'C04')], 'why': 'The conceptual model is built and grounded in the glossary.'},
 'TR-CDM-02': {'controls': [('PD-DMOD', 'C04'), ('PD-DMOD', 'C12')],
               'why': 'The review checks the conceptual model and reconciles its names and definitions with the glossary.'},
 'TR-CDM-03': {'controls': [('PD-DMOD', 'C04')], 'why': 'Rework is part of maintaining the conceptual model.'},
 'TR-CDM-04': {'controls': [('PD-DMOD', 'C04')], 'why': 'The conceptual model version is approved.'},
 'TR-CDM-05': {'controls': [('PD-DMOD', 'C04')], 'why': 'The approved conceptual model is published as the maintained version.'},
 'TR-CDM-06': {'controls': [('PD-DMOD', 'C04')], 'why': 'A change request opens a new conceptual model version.'},
 'TR-CDM-07': {'controls': [('PD-DMOD', 'C04'), ('PD-DMOD', 'C12')], 'why': 'The revised conceptual model is reviewed and reconciled with the glossary.'},
 'TR-CDM-08': {'controls': [('PD-DMOD', 'C04')], 'why': 'Withdrawing the conceptual model reverses its maintenance and retains it.'},
 'TR-CDM-09': {'controls': [('PD-DMOD', 'C04')], 'why': 'The conceptual model is re-drafted from its retained version.'},
 'TR-LDM-01': {'controls': [('PD-DMOD', 'C04'), ('PD-DMOD', 'C11')],
               'why': 'The logical model is built from the conceptual model with elements bound to governed definitions.'},
 'TR-LDM-02': {'controls': [('PD-DMOD', 'C04'), ('PD-DMOD', 'C10'), ('PD-DMOD', 'C12')],
               'why': 'The review checks naming conformance and reconciles names and definitions with the glossary.'},
 'TR-LDM-03': {'controls': [('PD-DMOD', 'C04')], 'why': 'Rework is part of maintaining the logical model.'},
 'TR-LDM-04': {'controls': [('PD-DMOD', 'C04'), ('PD-DMOD', 'C05')], 'why': 'Approving the logical model is the sign-off required before physical design.'},
 'TR-LDM-05': {'controls': [('PD-DMOD', 'C04')], 'why': 'The approved logical model is published as the maintained version.'},
 'TR-LDM-06': {'controls': [('PD-DMOD', 'C06')], 'why': 'A change request opens a governed change to a shared logical model.'},
 'TR-LDM-07': {'controls': [('PD-DMOD', 'C06'), ('PD-DMOD', 'C12')], 'why': 'The logical model change is reviewed and reconciled with the glossary.'},
 'TR-LDM-08': {'controls': [('PD-DMOD', 'C06')], 'why': 'Withdrawing or replacing a shared logical model is a governed change.'},
 'TR-LDM-09': {'controls': [('PD-DMOD', 'C04')], 'why': 'The logical model is re-drafted from its retained version.'},
 'TR-PDM-01': {'controls': [('PD-DMOD', 'C05'), ('PD-DMOD', 'C07')],
               'why': 'Physical design starts from an approved logical model and follows the physical design standards.'},
 'TR-PDM-02': {'controls': [('PD-DMOD', 'C08'), ('PD-DMOD', 'C10')],
               'why': 'The physical design is reviewed for conformance, reuse and naming before deployment.'},
 'TR-PDM-03': {'controls': [('PD-DMOD', 'C08'), ('PD-DMOD', 'C09')], 'why': 'Review findings require the non-conformant design to be remediated.'},
 'TR-PDM-04': {'controls': [('PD-DMOD', 'C08')], 'why': 'Approval closes the physical design review.'},
 'TR-PDM-05': {'controls': [('PD-DMOD', 'C08')], 'why': 'Only a reviewed and approved physical design is published for deployment.'},
 'TR-PDM-06': {'controls': [('PD-DMOD', 'C07')], 'why': 'A new physical model version is drafted to the physical design standards.'},
 'TR-PDM-07': {'controls': [('PD-DMOD', 'C08'), ('PD-DMOD', 'C10')],
               'why': 'The revised physical design is reviewed for conformance and naming before deployment.'},
 'TR-PDM-08': {'controls': [('PD-DMOD', 'C08')], 'why': 'Withdrawing a deployed physical model reverses its reviewed deployment.'},
 'TR-PDM-09': {'controls': [('PD-DMOD', 'C05'), ('PD-DMOD', 'C07')],
               'why': 'The physical model is re-drafted from an approved logical model to the standards.'},
 'TR-PDM-10': {'controls': [('PD-DMOD', 'C08')], 'why': 'Deployment is permitted only for the reviewed and managed design and is verified against it.'},
 'TR-PDM-11': {'controls': [('PD-DMOD', 'C08')], 'why': 'Withdrawing an undeployed physical model reverses its reviewed publication.'}}

SPEC = {
    "meta": {"modelId": "KA-DMD", "name": "Data Modelling and Design FTS", "knowledgeArea": "Data Modelling and Design", "version": "0.1", "subjectType": KA_SUBJECT,
             "regionModel": "One FTS per managed element: the Modelling Standards and Plan (scope level) and the Conceptual, Logical and Physical Data Model of a Data Asset (one per asset, one FTS per level) run concurrently and are coupled by cross-region constraints (each level derives from the approved level above), facts and events, never a single subject.",
             "source": SRC_DECK + "; " + SRC_HOWARD + "; " + SRC_PROTOCOL,
             "note": "Four state regions, each its own FTS over one managed element of the Knowledge Area: the Modelling Standards and Plan and the Conceptual, Logical and Physical Data Model of a Data Asset. The three model levels share one lifecycle pattern (draft, reviewed, approved, managed, revision, superseded; the physical level adds deployed) and are chained by cross-region constraints. The KA never becomes a region of the Data Asset; the models reach the Global protocol through contributions (registration on the conceptual model, materialisation on the deployed physical model, the assurance material-change trigger on a physical revision and the validation measurement as an assurance service), and couple to DG, Data Architecture, Metadata and Reference and Master Data.",
             "definition": CONTEXT["definition"], "factBindings": FACT_BINDINGS},
    "context": CONTEXT, "regions": REGIONS, "states": STATES, "transitions": TRANS, "events": EVENTS, "decisionRights": DR, "roles": ROLES, "artefacts": ARTEFACTS, "activities": ACTS, "services": SERVICES, "contributions": CONTRIB, "kaCouplings": KA_COUPLINGS, "couplingRoles": COUPLING_ROLES, "policyControls": POLICY_CONTROLS, "crossRegionConstraints": XRG, "stateVectors": VECTORS, "evidence": EVIDENCE, "exceptions": EXC,
    "sources": [
        {"id": "SRC-DMD-001", "source": SRC_DECK, "type": "Primary (image pages, captured)", "location": "Chat upload; OneDrive Data Lifecycle folder", "use": "Definition, goals, drivers, inputs, processes and sub-activities, deliverables, role players, techniques, tools, metrics", "limitations": "The context diagram lists the activities (plan, build, review, manage) and the three deliverables but no version lifecycle; the shared level lifecycle (draft, reviewed, approved, managed, revision, superseded) is drafted from Review and Manage the Data Models."},
        {"id": "SRC-DMD-002", "source": SRC_HOWARD, "type": "Design direction", "location": "Chat", "use": "Managed elements (one FTS per model level), Global gating", "limitations": ""},
        {"id": "SRC-DMD-003", "source": SRC_PROTOCOL, "type": "Alignment target", "location": "Private repo models/", "use": "Global transition IDs for contributions; KA transition IDs for couplings", "limitations": ""},
    ],
    "qaNotes": [
        {"severity": "note", "rule": "GA-005", "element": "KA-DMD", "finding": "The standards change rarely relative to a model and gate every level through XRG-DMD-01 and 04; the three model levels are per asset and chained (XRG-DMD-02, 03, 05, 06); the conceptual and physical levels are the DMD regions that gate Global registration and materialisation."},
        {"severity": "note", "rule": "capture", "element": "REG-DMD-CDM", "finding": "The three levels share one lifecycle pattern generated from a single template so that a review change applies to all three; the physical level adds Deployed (Howard, 21 Sep) and gates materialisation on it. The pattern is drafted from Review and Manage the Data Models. For Howard's review."},
        {"severity": "note", "rule": "derived", "element": "STATES", "finding": "All state names, events, decision rights, holders and services are first-pass drafts from the context diagram; every one is for Howard's review."},
    ],
}

if __name__ == "__main__":
    from ka_build import run_spec
    run_spec(SPEC, "data_modelling_design.fts.json")
