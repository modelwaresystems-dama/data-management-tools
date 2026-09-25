#!/usr/bin/env python3
"""
protocol_build.py  -  builds the Global Data Asset Architecture model (schema v0.3):
Layer 1 Data Lifecycle, Layer 2 Formal Data Asset Protocol (four orthogonal regions, the Global FTS),
Layer 3 GRCA Services, with cross-region constraints, state vectors, permission records, conformance
clauses, recommendations and editorial decisions.

Source of record: Global_Data_Asset_Architecture_FTS_Specification_Report.pdf (20 Sep 2026) and
DMBOK Architectural Layers.docx. The validated workbook (Global_Data_Asset_Architecture_Formal_FTS_Validated.xlsx)
is encrypted under a sensitivity label and could not be read; rows that exist only there are marked
origin "workbook (not readable)" and the derived stand-ins carry trace "derived:...".

Usage: python protocol_build.py [out_dir]
Writes global_protocol.fts.json
"""
import json, sys, os, re, datetime
from collections import defaultdict, Counter

def now_sast():
    tz = datetime.timezone(datetime.timedelta(hours=2))
    return datetime.datetime.now(tz).strftime("%d %b %Y, %H:%M SAST")

SRC_REPORT = "Global_Data_Asset_Architecture_FTS_Specification_Report.pdf (20 Sep 2026)"
SRC_LAYERS = "DMBOK Architectural Layers.docx (20 Sep 2026)"
SRC_WB = "Global_Data_Asset_Architecture_Formal_FTS_Validated.xlsx (encrypted; not readable in this build)"
SRC_NAMING = "research_backed_naming_standard_for_three_layer_dmbok_architecture_20260920_080012.pdf"
SRC_DECK = "FTS_Data_Lifecycle_Architecture.pdf (Layer 1 explainer deck, 15 pages, 20 Sep 2026)"
STATUS = "Proposed / illustrative"

# ------------------------------------------------------------------ Layer 1: lifecycle
PHASES = [
    ("LC-01", "Plan and Specify Data", "Define purpose, intended use, scope, obligations, risk context and accountabilities.", "May recur after a material change to the asset.", "Initiating or materially revising an asset."),
    ("LC-02", "Create or Acquire Data", "Create, collect, receive or acquire the Data Asset under applicable authority and controls.", "May be incremental or repeated.", "Approved need and legitimate basis exist."),
    ("LC-03", "Manage and Preserve Data", "Maintain, protect, store, preserve and administer the Data Asset.", "Runs completely concurrently with use and transformation.", "The asset is materialized or in managed custody."),
    ("LC-04", "Use and Reuse Data", "Access, share, consume or apply the Data Asset for authorized purposes.", "Repeated, concurrent operations across multiple authorized users.", "Availability and intended-use conditions permit."),
    ("LC-05", "Transform or Derive Data", "Change representation, combine, enrich or derive data while preserving identity, lineage and obligations.", "May create a completely new governed version or new Data Asset.", "A change to representation, combination, enrichment or derivation is requested."),
    ("LC-06", "Retain or Dispose of Data", "Retain, preserve, transfer or destroy according to authorized disposition.", "Disposition can be actively blocked or deferred by legal holds and obligations.", "Disposition is due, deferred or activated."),
]
EFFECT_CLASSES = [
    ("State-preserving", "Evaluates the protocol, but the asset condition remains exactly the same. Work that requires permission but leaves the asset as it was.", "ACT-09 Access Data; ACT-10 Share Data; ACT-05 Operate Controls"),
    ("Transition-supporting", "Required to allow a state change, but does not cause the change itself: the GRCA homework that generates the evidence to allow a transition.", "ACT-04 Assess Risk; ACT-07 Validate Evidence; ACT-08 Authorize Transition"),
    ("Transition-causing", "Actively triggers a physical alteration to a state region: pushes a region from a source state to a target state.", "ACT-02 Register Data Asset; ACT-17 Destroy Asset; ACT-13 Transfer Custody"),
    ("Creates related asset", "Spawns a completely new governed identity, which requires its own separate State Vector.", "ACT-11 Transform Data"),
]
# (id, name, effect class, phases [drafted], related transitions [drafted], services [drafted])
ACTIVITIES = [
    ("ACT-01", "Define Asset Purpose", "State-preserving / transition-supporting", ["LC-01"], [], ["SVC-GOV-01", "SVC-RSK-01"]),
    ("ACT-02", "Register Data Asset", "Transition-causing", ["LC-01", "LC-02"], ["TR-EX-01"], ["SVC-CTL-01", "SVC-GOV-02"]),
    ("ACT-03", "Create or Acquire Data", "Transition-causing", ["LC-02"], ["TR-EX-02", "TR-CP-01"], ["SVC-CTL-02", "SVC-RSK-02"]),
    ("ACT-04", "Assess Risk", "State-preserving / transition-supporting", ["LC-01", "LC-02", "LC-03", "LC-04", "LC-05", "LC-06"], [], ["SVC-RSK-02", "SVC-RSK-03", "SVC-RSK-04", "SVC-RSK-05"]),
    ("ACT-05", "Operate Controls", "State-preserving", ["LC-03"], [], ["SVC-CTL-03", "SVC-CTL-04", "SVC-CTL-05"]),
    ("ACT-06", "Assess Assurance", "Transition-causing", ["LC-03"], ["TR-AS-01", "TR-AS-02", "TR-AS-03", "TR-AS-04", "TR-AS-07", "TR-AS-08"], ["SVC-ASR-01", "SVC-ASR-02", "SVC-ASR-04"]),
    ("ACT-07", "Validate Evidence", "State-preserving / transition-supporting", ["LC-03"], [], ["SVC-ASR-03"]),
    ("ACT-08", "Authorize Transition", "Transition-supporting", ["LC-01", "LC-02", "LC-03", "LC-04", "LC-05", "LC-06"], [], ["SVC-GOV-02", "SVC-GOV-04"]),
    ("ACT-09", "Access Data", "State-preserving", ["LC-04"], [], ["SVC-GOV-03", "SVC-RSK-03", "SVC-CTL-04", "SVC-ASR-03"]),
    ("ACT-10", "Share Data", "State-preserving", ["LC-04"], [], ["SVC-GOV-03", "SVC-RSK-03", "SVC-CTL-04"]),
    ("ACT-11", "Transform Data", "State-preserving or creates related asset", ["LC-05"], ["TR-AS-05", "TR-AS-06"], ["SVC-CTL-05", "SVC-RSK-04", "SVC-GOV-04"]),
    ("ACT-12", "Preserve Data", "Transition-causing or state-preserving", ["LC-03", "LC-06"], ["TR-CP-02", "TR-CP-03"], ["SVC-CTL-03"]),
    ("ACT-13", "Transfer Custody", "Transition-causing", ["LC-03", "LC-06"], ["TR-CP-04", "TR-CP-05", "TR-CP-06", "TR-CP-07", "TR-CP-08", "TR-CP-09"], ["SVC-GOV-05", "SVC-CTL-03"]),
    ("ACT-14", "Suspend Access", "Transition-causing", ["LC-03", "LC-04"], ["TR-AV-03"], ["SVC-CTL-04", "SVC-ASR-05"]),
    ("ACT-15", "Restore Access", "Transition-causing", ["LC-03", "LC-04"], ["TR-AV-04"], ["SVC-GOV-03", "SVC-CTL-04"]),
    ("ACT-16", "Supersede Asset", "Transition-causing", ["LC-05", "LC-06"], ["TR-EX-03", "TR-EX-04"], ["SVC-GOV-04", "SVC-CTL-05"]),
    ("ACT-17", "Destroy Asset", "Transition-causing", ["LC-06"], ["TR-EX-05", "TR-EX-06", "TR-CP-10"], ["SVC-GOV-05", "SVC-CTL-06"]),
    ("ACT-18", "Authorize Exception", "State-preserving / transition-supporting", ["LC-01", "LC-02", "LC-03", "LC-04", "LC-05", "LC-06"], [], ["SVC-GOV-02", "SVC-RSK-05"]),
    # v0.2.2 (Howard, 23 Sep 2026): the Availability release, restriction, withdrawal and emergency transitions were claimed by no
    # activity, so a requester could not name one truthfully. ACT-09 Access Data and ACT-10 Share Data are State-preserving and
    # cannot cause a transition; these two are the acts that exercise DR-06 and DR-08. TR-AS-09 and TR-AS-10 stay unclaimed by
    # design: assurance expiry is a time trigger raised by Data Quality (CON-DQ-09, CON-DQ-10), not an act anyone performs.
    ("ACT-19", "Release, Restrict or Withdraw Access", "Transition-causing", ["LC-03", "LC-04"], ["TR-AV-01", "TR-AV-02", "TR-AV-05", "TR-AV-06", "TR-AV-07", "TR-AV-10"], ["SVC-GOV-03", "SVC-CTL-04"]),
    ("ACT-20", "Grant and Close Emergency Access", "Transition-causing", ["LC-03", "LC-04"], ["TR-AV-08", "TR-AV-09"], ["SVC-GOV-02", "SVC-RSK-05", "SVC-CTL-04"]),
]

# ------------------------------------------------------------------ Layer 2: protocol regions
REGIONS = [
    ("REG-EX", "Existence", "EX", "Whether and in what governed identity/version condition the Data Asset exists.", "STS-EX-01", "Exactly one active state; Destruction is terminal for the governed asset instance."),
    ("REG-AS", "Assurance", "AS", "Current status of justified confidence against applicable criteria.", "STS-AS-01", "Historical assessment is not equivalent to current valid assurance."),
    ("REG-AV", "Availability", "AV", "Whether and under what conditions the Data Asset may be made available for authorized use.", "STS-AV-01", "Availability does not imply unrestricted access or fitness for every use."),
    ("REG-CP", "Custody / Preservation", "CP", "Current managed custody, persistence and preservation condition.", "STS-CP-01", "Custody and existence are distinct; transfer changes custodian, not necessarily identity."),
]
# (id, region, name, initial, terminal, definition, invariant summary)
STATES = [
    ("STS-EX-01", "REG-EX", "Proposal", True, False, "An intended Data Asset is identified and governed before materialization.", "Purpose, proposed identity and accountable sponsor remain identifiable."),
    ("STS-EX-02", "REG-EX", "Registration", False, False, "A governed identity and minimum registration record exist; data may not yet be materialized.", "Identifier is unique and registration remains traceable."),
    ("STS-EX-03", "REG-EX", "Material Existence", False, False, "The governed Data Asset exists in at least one controlled representation.", "At least one authoritative representation remains identifiable and controlled."),
    ("STS-EX-04", "REG-EX", "Supersession", False, False, "The asset still exists but a successor is designated for the governed purpose.", "Successor relationship and permitted residual uses remain explicit."),
    ("STS-EX-05", "REG-EX", "Destruction", False, True, "The governed asset instance has reached an authorized irreversible termination condition.", "Destruction evidence and residual metadata remain protected and traceable."),
    ("STS-AS-01", "REG-AS", "No Current Assurance", True, False, "No valid Assurance Result presently supports the required claim.", "The absence or expiry of assurance remains visible."),
    ("STS-AS-02", "REG-AS", "Assessment", False, False, "The Data Asset is undergoing evaluation against defined assurance criteria.", "Scope, criteria, assessor and evidence set remain identifiable."),
    ("STS-AS-03", "REG-AS", "Assurance Confirmation", False, False, "Applicable criteria are satisfied by a current valid Assurance Result.", "Assurance scope, validity and supporting evidence remain current."),
    ("STS-AS-04", "REG-AS", "Conditional Assurance", False, False, "Assurance is valid only subject to documented conditions or limitations.", "Conditions, expiry and monitoring obligations remain active."),
    ("STS-AS-05", "REG-AS", "Assurance Deficiency", False, False, "Assessment identified a material deficiency affecting the assurance claim.", "Deficiency, impact, owner and remediation remain traceable."),
    ("STS-AS-06", "REG-AS", "Assurance Suspension", False, False, "Previously valid assurance is temporarily inactive pending review or remediation.", "Reason, authority and reinstatement criteria remain explicit."),
    ("STS-AV-01", "REG-AV", "Restricted Access", True, False, "The Data Asset is not generally available; access is limited by explicit conditions.", "Restrictions and enforcement mechanism remain active."),
    ("STS-AV-02", "REG-AV", "Available Access", False, False, "The Data Asset may be accessed for authorized purposes under applicable controls.", "Purpose, entitlement and control conditions remain satisfied."),
    ("STS-AV-03", "REG-AV", "Suspended Access", False, False, "Availability is temporarily disabled pending resolution or decision.", "Suspension reason and review trigger remain active."),
    ("STS-AV-04", "REG-AV", "Withdrawn Access", False, False, "The Data Asset is unavailable for the previously authorized use.", "Withdrawal basis and any permitted residual access remain explicit."),
    ("STS-AV-05", "REG-AV", "Emergency Access", False, False, "Temporary exceptional access is available under enhanced monitoring and authority.", "Scope, authority, monitoring and expiry remain valid."),
    ("STS-CP-01", "REG-CP", "Transient Custody", True, False, "The Data Asset is temporarily held before an enduring custody arrangement is established.", "Temporary custodian, duration and handling obligations remain known."),
    ("STS-CP-02", "REG-CP", "Active Custody", False, False, "The Data Asset is maintained by an accountable custodian in an active managed environment.", "Custodian, location and protection obligations remain current."),
    ("STS-CP-03", "REG-CP", "Preservation Custody", False, False, "The Data Asset is maintained under a preservation-oriented custodial regime.", "Preservation package, integrity checks and retention basis remain valid."),
    ("STS-CP-04", "REG-CP", "External Custody", False, False, "An authorized external party holds custody while accountability and obligations remain traceable.", "External custodian, agreement and oversight remain active."),
    ("STS-CP-05", "REG-CP", "Transfer Pending", False, False, "A governed custody transfer has been initiated but not completed.", "Source custody continues until receipt and acceptance are evidenced."),
    ("STS-CP-06", "REG-CP", "Custody Closure", False, True, "Custodial responsibility has ended through accepted transfer or terminal destruction.", "Closure basis and chain-of-custody evidence remain retained."),
]
# (id, name, source, target, event, guard summary, decision right or None)
TRANSITIONS = [
    ("TR-EX-01", "Register Asset", "STS-EX-01", "STS-EX-02", "EV-EX-01", "Proposal identity, purpose and sponsor are sufficient; registration control passes.", "DR-01"),
    ("TR-EX-02", "Materialize Asset", "STS-EX-02", "STS-EX-03", "EV-EX-02", "Authorized representation exists; custody and minimum controls are established.", "DR-02"),
    ("TR-EX-03", "Supersede Asset", "STS-EX-03", "STS-EX-04", "EV-EX-03", "Successor is identified; residual use and retention requirements are decided.", "DR-03"),
    ("TR-EX-04", "Reinstate Asset", "STS-EX-04", "STS-EX-03", "EV-EX-04", "Supersession decision is revoked; asset remains intact and use conditions are reassessed.", "DR-03"),
    ("TR-EX-05", "Destroy Materialized Asset", "STS-EX-03", "STS-EX-05", "EV-EX-05", "Disposition is due; no active hold; custody is controlled; destruction authorization granted.", "DR-04"),
    ("TR-EX-06", "Destroy Superseded Asset", "STS-EX-04", "STS-EX-05", "EV-EX-05", "Disposition is due; no active hold; successor traceability is retained; authorization granted.", "DR-04"),
    ("TR-AS-01", "Initiate Assessment", "STS-AS-01", "STS-AS-02", "EV-AS-01", "Assurance criteria, scope, assessor and evidence request are defined.", "DR-05"),
    ("TR-AS-02", "Confirm Assurance", "STS-AS-02", "STS-AS-03", "EV-AS-02", "Required criteria pass and evidence is sufficient, current and attributable.", "DR-05"),
    ("TR-AS-03", "Grant Conditional Assurance", "STS-AS-02", "STS-AS-04", "EV-AS-03", "Residual limitations are acceptable; conditions, monitoring and expiry are authorized.", "DR-05"),
    ("TR-AS-04", "Record Assurance Deficiency", "STS-AS-02", "STS-AS-05", "EV-AS-04", "One or more material criteria fail or evidence is insufficient.", "DR-05"),
    ("TR-AS-05", "Suspend Assurance", "STS-AS-03", "STS-AS-06", "EV-AS-05", "Material change, control failure or evidence invalidation affects the assurance claim.", "DR-05"),
    ("TR-AS-06", "Suspend Conditional Assurance", "STS-AS-04", "STS-AS-06", "EV-AS-05", "Condition breached, expired or no longer monitored.", "DR-05"),
    ("TR-AS-07", "Reassess Deficiency", "STS-AS-05", "STS-AS-02", "EV-AS-06", "Remediation is declared ready and reassessment scope is approved.", "DR-05"),
    ("TR-AS-08", "Reassess Suspension", "STS-AS-06", "STS-AS-02", "EV-AS-06", "Suspension cause is addressed and reassessment is authorized.", "DR-05"),
    ("TR-AS-09", "Expire Assurance", "STS-AS-03", "STS-AS-01", "EV-AS-07", "Assurance validity has expired without completed reassessment.", None),
    ("TR-AS-10", "Expire Conditional Assurance", "STS-AS-04", "STS-AS-01", "EV-AS-07", "Conditional assurance validity has expired without renewal.", None),
    ("TR-AV-01", "Release Access", "STS-AV-01", "STS-AV-02", "EV-AV-01", "Purpose, entitlement, assurance, risk and controls satisfy the release policy.", "DR-06"),
    ("TR-AV-02", "Restrict Access", "STS-AV-02", "STS-AV-01", "EV-AV-02", "A valid restriction decision or changed classification requires limited access.", "DR-06"),
    ("TR-AV-03", "Suspend Access", "STS-AV-02", "STS-AV-03", "EV-AV-03", "A credible control failure, risk trigger or incident requires immediate temporary suspension.", "DR-07"),
    ("TR-AV-04", "Restore Access", "STS-AV-03", "STS-AV-02", "EV-AV-04", "Suspension cause is resolved; controls and assurance are current; restoration is authorized.", "DR-07"),
    ("TR-AV-05", "Withdraw Access", "STS-AV-02", "STS-AV-04", "EV-AV-05", "Authorized use has ended or withdrawal obligation applies.", "DR-06"),
    ("TR-AV-06", "Withdraw Suspended Access", "STS-AV-03", "STS-AV-04", "EV-AV-05", "Suspension review determines that access must end.", "DR-06"),
    ("TR-AV-07", "Reconsider Withdrawal", "STS-AV-04", "STS-AV-01", "EV-AV-06", "A new legitimate purpose exists and re-entry review is authorized.", "DR-06"),
    ("TR-AV-08", "Grant Emergency Access", "STS-AV-01", "STS-AV-05", "EV-AV-07", "Emergency basis, scope, monitoring, approver and expiry are recorded.", "DR-08"),
    ("TR-AV-09", "Close Emergency Access", "STS-AV-05", "STS-AV-01", "EV-AV-08", "Emergency purpose is complete or authorization expires; activity is reviewed.", "DR-08"),
    ("TR-AV-10", "Withdraw Restricted Access", "STS-AV-01", "STS-AV-04", "EV-AV-05", "Withdrawal obligation applies to an asset that was never released; residual access basis is recorded.", "DR-06"),
    ("TR-CP-01", "Establish Active Custody", "STS-CP-01", "STS-CP-02", "EV-CP-01", "Custodian accepts accountability; location and protection controls are active.", "DR-09"),
    ("TR-CP-02", "Enter Preservation Custody", "STS-CP-02", "STS-CP-03", "EV-CP-02", "Preservation criteria, package, retention basis and integrity controls are satisfied.", "DR-10"),
    ("TR-CP-03", "Restore Active Custody", "STS-CP-03", "STS-CP-02", "EV-CP-03", "Active management need exists; integrity and use controls are reassessed.", "DR-10"),
    ("TR-CP-04", "Place in External Custody", "STS-CP-02", "STS-CP-04", "EV-CP-04", "External arrangement, accountability, protection and oversight are approved.", "DR-11"),
    ("TR-CP-05", "Initiate Custody Transfer", "STS-CP-02", "STS-CP-05", "EV-CP-05", "Recipient, authority, transfer package and chain-of-custody plan are approved.", "DR-11"),
    ("TR-CP-06", "Initiate Preserved Transfer", "STS-CP-03", "STS-CP-05", "EV-CP-05", "Recipient, preservation obligations and transfer package are approved.", "DR-11"),
    ("TR-CP-07", "Complete External Transfer", "STS-CP-05", "STS-CP-04", "EV-CP-06", "Recipient receipt and acceptance are evidenced; obligations are transferred or retained explicitly.", "DR-11"),
    ("TR-CP-08", "Cancel Custody Transfer", "STS-CP-05", "STS-CP-02", "EV-CP-07", "Transfer is cancelled before acceptance and source custody remains intact.", "DR-11"),
    ("TR-CP-09", "Close Custody after Transfer", "STS-CP-04", "STS-CP-06", "EV-CP-08", "Local custodial responsibility has ended and closure evidence is complete.", "DR-11"),
    ("TR-CP-10", "Close Custody after Destruction", "STS-CP-02", "STS-CP-06", "EV-CP-09", "Existence is Destruction and destruction evidence is complete.", "DR-04"),
]
# Event names: the report gives IDs only; names drafted from the transitions they trigger (confirm from the workbook).
EVENTS = {
    "EV-EX-01": ("Registration request", "Request"), "EV-EX-02": ("Materialization request", "Request"), "EV-EX-03": ("Supersession decision", "Decision outcome"),
    "EV-EX-04": ("Supersession revocation", "Decision outcome"), "EV-EX-05": ("Disposition due", "Obligation trigger"),
    "EV-AS-01": ("Assessment initiation", "Request"), "EV-AS-02": ("Assessment pass", "Assessment outcome"), "EV-AS-03": ("Conditional assessment outcome", "Assessment outcome"),
    "EV-AS-04": ("Assessment failure", "Assessment outcome"), "EV-AS-05": ("Material change or control failure", "Monitoring trigger"), "EV-AS-06": ("Reassessment authorization", "Decision outcome"), "EV-AS-07": ("Assurance expiry", "Time trigger"),
    "EV-AV-01": ("Release request", "Request"), "EV-AV-02": ("Restriction decision", "Decision outcome"), "EV-AV-03": ("Incident or control failure", "Monitoring trigger"), "EV-AV-04": ("Suspension resolution", "Decision outcome"),
    "EV-AV-05": ("Withdrawal obligation", "Obligation trigger"), "EV-AV-06": ("New legitimate purpose", "Request"), "EV-AV-07": ("Emergency access request", "Request"), "EV-AV-08": ("Emergency completion or expiry", "Time trigger"),
    "EV-CP-01": ("Custodian acceptance", "Decision outcome"), "EV-CP-02": ("Preservation decision", "Decision outcome"), "EV-CP-03": ("Active management need", "Request"), "EV-CP-04": ("External arrangement approval", "Decision outcome"),
    "EV-CP-05": ("Transfer initiation", "Request"), "EV-CP-06": ("Recipient acceptance evidenced", "Evidence trigger"), "EV-CP-07": ("Transfer cancellation", "Decision outcome"), "EV-CP-08": ("Local responsibility ended", "Evidence trigger"), "EV-CP-09": ("Destruction evidence complete", "Evidence trigger"),
}
# Decision rights: DR-04 is named in the report; the rest are named from the transitions they authorize (confirm from the workbook).
DECISION_RIGHTS = {
    "DR-01": "Authorize Registration", "DR-02": "Authorize Materialization", "DR-03": "Authorize Supersession and Reinstatement",
    "DR-04": "Authorize Destruction and Custody Closure", "DR-05": "Authorize Assurance Determination", "DR-06": "Authorize Access Release, Restriction and Withdrawal",
    "DR-07": "Authorize Access Suspension and Restoration", "DR-08": "Authorize Emergency Access", "DR-09": "Authorize Custody Establishment",
    "DR-10": "Authorize Preservation Custody", "DR-11": "Authorize External Custody and Transfer",
}
DR_SERVICE = {"DR-01": "SVC-GOV-02", "DR-02": "SVC-GOV-02", "DR-03": "SVC-GOV-04", "DR-04": "SVC-GOV-05", "DR-05": "SVC-GOV-02", "DR-06": "SVC-GOV-03", "DR-07": "SVC-GOV-03", "DR-08": "SVC-GOV-03", "DR-09": "SVC-GOV-02", "DR-10": "SVC-GOV-05", "DR-11": "SVC-GOV-05"}

# Cross-region constraints, with a drafted evaluable expression over the state vector (EX, AS, AV, CP hold state IDs) and asset facts.
XRG = [
    ("XRG-001", "If an active legal, regulatory, contractual or investigation hold exists, destruction is prohibited.", ["TR-EX-05", "TR-EX-06"], "Non-waivable", "not hold_active"),
    ("XRG-002", "Destruction requires Active Custody or Preservation Custody and verified disposition control.", ["TR-EX-05", "TR-EX-06"], "Required", "CP in ('STS-CP-02','STS-CP-03') and disposition_control_verified"),
    ("XRG-003", "Available Access requires Existence = Material Existence or an explicitly authorized Supersession use.", ["TR-AV-01", "TR-AV-04"], "Required", "EX == 'STS-EX-03' or (EX == 'STS-EX-04' and supersession_use_authorized)"),
    ("XRG-004", "Where intended use requires assurance, Assurance must equal Assurance Confirmation or permitted Conditional Assurance.", ["TR-AV-01", "TR-AV-04"], "Conditional", "(not use_requires_assurance) or AS in ('STS-AS-03','STS-AS-04')"),
    ("XRG-005", "Material change to identity, representation, custody or use may suspend current assurance.", ["TR-AS-05", "TR-AS-06"], "Required when material change", "material_change"),
    ("XRG-006", "Before Destruction, Availability must be Withdrawn Access or transition atomically to it.", ["TR-EX-05", "TR-EX-06"], "Required", "AV == 'STS-AV-04' or atomic_withdrawal"),
    ("XRG-007", "Source custody remains accountable until recipient acceptance evidence is recorded.", ["TR-CP-07"], "Required", "recipient_acceptance_evidenced"),
    ("XRG-008", "Emergency Access requires enhanced monitoring, time-bounded authority and post-event assurance review.", ["TR-AV-08"], "Required", "enhanced_monitoring and time_bounded_authority and post_event_review_planned"),
]
# State vector examples from the report
CFG = [
    ("CFG-001", "Newly registered asset", ["STS-EX-02", "STS-AS-01", "STS-AV-01", "STS-CP-01"], "Legal if registration complete and access remains restricted."),
    ("CFG-002", "Controlled active asset", ["STS-EX-03", "STS-AS-03", "STS-AV-02", "STS-CP-02"], "Legal for authorized uses while assurance and controls remain valid."),
    ("CFG-003", "Asset under remediation", ["STS-EX-03", "STS-AS-05", "STS-AV-03", "STS-CP-02"], "Legal: access suspended while deficiency is remediated."),
    ("CFG-004", "Preserved superseded asset", ["STS-EX-04", "STS-AS-04", "STS-AV-01", "STS-CP-03"], "Legal where residual use is restricted and preservation obligations continue."),
    ("CFG-005", "Transfer in progress", ["STS-EX-03", "STS-AS-03", "STS-AV-03", "STS-CP-05"], "Legal while custody transfer is pending and normal access is suspended."),
    ("CFG-006", "Terminal asset record", ["STS-EX-05", "STS-AS-01", "STS-AV-04", "STS-CP-06"], "Legal terminal configuration; only residual metadata/evidence remains."),
]
# ------------------------------------------------------------------ Layer 3: GRCA services
SERVICES = [
    ("SVC-GOV-01", "Governance", "Policy and Obligation Interpretation", "Asset initiation or material change.", "Applicable requirement set."),
    ("SVC-GOV-02", "Governance", "Decision Rights Administration", "Decision or transition requires authority.", "Valid Decision Right."),
    ("SVC-GOV-03", "Governance", "Use Authorization", "Use/access request.", "Authorization decision."),
    ("SVC-GOV-04", "Governance", "Change Authorization", "Material change request.", "Authorization decision."),
    ("SVC-GOV-05", "Governance", "Disposition and Transfer Authorization", "Disposition/transfer due.", "Disposition/transfer decision."),
    ("SVC-RSK-01", "Risk", "Risk Context Establishment", "Planning or material change.", "Risk criteria."),
    ("SVC-RSK-02", "Risk", "Risk Identification and Analysis", "New activity or changed context.", "Inherent risk assessment."),
    ("SVC-RSK-03", "Risk", "Use Risk Evaluation", "Use/access request.", "Risk acceptability result."),
    ("SVC-RSK-04", "Risk", "Change Risk Evaluation", "Material change request.", "Risk treatment requirement."),
    ("SVC-RSK-05", "Risk", "Residual Risk Evaluation", "Treatment/control results available.", "Residual risk result."),
    ("SVC-CTL-01", "Control", "Registration Control", "Registration request.", "Registration control result."),
    ("SVC-CTL-02", "Control", "Materialization Control", "Materialization request.", "Materialization control result."),
    ("SVC-CTL-03", "Control", "Custody and Preservation Control", "Custody/preservation activity.", "Custody control result."),
    ("SVC-CTL-04", "Control", "Access Enforcement Control", "Access attempt or status change.", "Access control result."),
    ("SVC-CTL-05", "Control", "Change and Lineage Control", "Transformation/derivation.", "Change control result."),
    ("SVC-CTL-06", "Control", "Disposition Control", "Disposition due/requested.", "Disposition control result."),
    ("SVC-ASR-01", "Assurance", "Assurance Planning", "Assessment requested.", "Assurance plan."),
    ("SVC-ASR-02", "Assurance", "Control Assessment", "Assessment schedule or trigger.", "Control assessment result."),
    ("SVC-ASR-03", "Assurance", "Evidence Validation", "Evidence submitted.", "Evidence validity result."),
    ("SVC-ASR-04", "Assurance", "Assurance Determination", "Assessment complete.", "Assurance Result."),
    ("SVC-ASR-05", "Assurance", "Continuous Assurance Monitoring", "Time/event threshold.", "Alert, suspension or reassessment trigger."),
]
FAMILIES = {"Governance": ("Who has authority, under what policy and accountability?", "Requirement set, Decision Right, authorization, exception decision."),
            "Risk": ("What uncertainty and exposure exist, and what remains after treatment?", "Risk criteria, inherent risk, treatment need, residual-risk result."),
            "Control": ("What mechanism directs, prevents, detects, corrects or compensates?", "Control operation and Control Result."),
            "Assurance": ("What confidence is justified against defined claims and criteria?", "Assurance plan/result, evidence-validity result, monitoring alert. Evidence sits within Assurance.")}
# GRCA applicability per transition (drafted from the guard summaries and the service catalogue; workbook holds the record of truth)
TR_SERVICES = {
    "TR-EX-01": ["SVC-CTL-01", "SVC-GOV-02"], "TR-EX-02": ["SVC-CTL-02", "SVC-CTL-03", "SVC-GOV-02"], "TR-EX-03": ["SVC-GOV-04", "SVC-RSK-04", "SVC-CTL-05"],
    "TR-EX-04": ["SVC-GOV-04", "SVC-RSK-04"], "TR-EX-05": ["SVC-GOV-05", "SVC-CTL-06", "SVC-RSK-05", "SVC-ASR-03"], "TR-EX-06": ["SVC-GOV-05", "SVC-CTL-06", "SVC-RSK-05", "SVC-ASR-03"],
    "TR-AS-01": ["SVC-ASR-01"], "TR-AS-02": ["SVC-ASR-02", "SVC-ASR-03", "SVC-ASR-04"], "TR-AS-03": ["SVC-ASR-04", "SVC-RSK-05", "SVC-GOV-02"], "TR-AS-04": ["SVC-ASR-04"],
    "TR-AS-05": ["SVC-ASR-05", "SVC-CTL-05"], "TR-AS-06": ["SVC-ASR-05"], "TR-AS-07": ["SVC-ASR-01", "SVC-GOV-02"], "TR-AS-08": ["SVC-ASR-01", "SVC-GOV-02"], "TR-AS-09": ["SVC-ASR-05"], "TR-AS-10": ["SVC-ASR-05"],
    "TR-AV-01": ["SVC-GOV-03", "SVC-RSK-03", "SVC-CTL-04", "SVC-ASR-03"], "TR-AV-02": ["SVC-GOV-03", "SVC-CTL-04"], "TR-AV-03": ["SVC-CTL-04", "SVC-ASR-05", "SVC-RSK-03"], "TR-AV-04": ["SVC-GOV-03", "SVC-CTL-04", "SVC-ASR-02"],
    "TR-AV-05": ["SVC-GOV-03", "SVC-CTL-04"], "TR-AV-06": ["SVC-GOV-03"], "TR-AV-07": ["SVC-GOV-03", "SVC-RSK-03"], "TR-AV-08": ["SVC-GOV-03", "SVC-RSK-03", "SVC-ASR-05"], "TR-AV-09": ["SVC-ASR-02", "SVC-GOV-03"], "TR-AV-10": ["SVC-GOV-03", "SVC-CTL-04"],
    "TR-CP-01": ["SVC-CTL-03", "SVC-GOV-02"], "TR-CP-02": ["SVC-CTL-03", "SVC-GOV-05"], "TR-CP-03": ["SVC-CTL-03", "SVC-GOV-05"], "TR-CP-04": ["SVC-GOV-05", "SVC-RSK-02", "SVC-CTL-03"],
    "TR-CP-05": ["SVC-GOV-05", "SVC-CTL-03"], "TR-CP-06": ["SVC-GOV-05", "SVC-CTL-03"], "TR-CP-07": ["SVC-ASR-03", "SVC-CTL-03"], "TR-CP-08": ["SVC-GOV-05"], "TR-CP-09": ["SVC-ASR-03", "SVC-GOV-05"], "TR-CP-10": ["SVC-CTL-06", "SVC-ASR-03", "SVC-GOV-05"],
}
# Permission records: the report's worked examples only; the full matrix lives in the workbook.
PERMISSIONS = [
    ("PRM-001", "ACT-09", "CFG-002", "Conditional", "XRG-003 and XRG-004 hold; entitlement and access control result current; proceeds without changing state while guards, controls and authorization remain valid.", "DR-06 not required for state-preserving access; SVC-GOV-03 authorization applies", ["SVC-GOV-03", "SVC-RSK-03", "SVC-CTL-04", "SVC-ASR-03"], "Access log; authorization record", "State-preserving", "Worked example 1"),
    ("PRM-002", "ACT-09", "STS-AV-01", "Conditional", "Explicit access condition satisfied and enforced by SVC-CTL-04.", "SVC-GOV-03", ["SVC-GOV-03", "SVC-CTL-04"], "Access decision record", "State-preserving", "Derived from the Restricted Access definition"),
    ("PRM-003", "ACT-09", "STS-AV-03", "Prohibited", "Availability is Suspended Access.", "None; requires TR-AV-04 first", [], "", "Blocked", "Derived from the Suspended Access definition"),
    ("PRM-004", "ACT-17", "STS-EX-03", "Conditional", "XRG-001, XRG-002 and XRG-006 hold; disposition control verified.", "DR-04", ["SVC-GOV-05", "SVC-CTL-06", "SVC-RSK-05"], "Authorization, custody, control and destruction evidence", "Transition-causing (TR-EX-05)", "Worked example 2"),
    ("PRM-005", "ACT-17", "STS-EX-04", "Conditional", "XRG-001, XRG-002 and XRG-006 hold; successor traceability retained.", "DR-04", ["SVC-GOV-05", "SVC-CTL-06"], "Authorization, custody, control and destruction evidence", "Transition-causing (TR-EX-06)", "Worked example 2"),
    ("PRM-006", "ACT-17", "STS-EX-05", "Not applicable", "Asset already destroyed.", "None", [], "", "None", "Terminal state"),
    ("PRM-007", "ACT-11", "STS-EX-03", "Conditional", "Change and Lineage Control result current; XRG-005 evaluated for materiality.", "DR-03 or SVC-GOV-04 when material", ["SVC-CTL-05", "SVC-RSK-04", "SVC-GOV-04"], "Change control result; lineage record", "State-preserving or creates related asset", "Worked example 4"),
    ("PRM-008", "ACT-09", "STS-AV-05", "Conditional", "Emergency scope, monitoring and expiry valid (XRG-008).", "DR-08", ["SVC-GOV-03", "SVC-ASR-05"], "Emergency access record (EXC-02)", "State-preserving", "Worked example 3"),
]
EXCEPTIONS = [
    ("EXC-01", "Governed Exception to a Waivable Requirement", "", "A waivable requirement cannot be satisfied.", "Authorized Decision Right after risk evaluation", "Non-conformance identified; risk assessed; compensating controls evaluated; residual risk determined; authority decides; scope, rationale, effective date, expiry/review, monitoring and evidence recorded. Never overrides a non-waivable obligation (N-017, N-018).", "Draft / Approved / Rejected / Expired / Revoked"),
    ("EXC-02", "Emergency Access Exception Record", "TR-AV-08", "Urgent legitimate need for access while Availability is Restricted Access.", "DR-08", "Emergency basis, scope, monitoring, approver and expiry recorded; post-event assurance review (XRG-008); closed by TR-AV-09.", "Draft / Approved / Closed / Expired"),
]
EVIDENCE = [
    ("EVD-01", "Registration record", "Decision evidence", "TR-EX-01", "Registration control result and DR-01 authorization record."),
    ("EVD-02", "Destruction evidence", "Control evidence", "TR-EX-05", "Verified disposition control result, DR-04 authorization, custody confirmation; residual metadata retained."),
    ("EVD-03", "Assurance Result", "Assurance result", "TR-AS-02", "Assessment scope, criteria, assessor, evidence set, validity period."),
    ("EVD-04", "Emergency access record", "Exception evidence", "TR-AV-08", "Basis, scope, approver, monitoring, expiry, post-event review."),
    ("EVD-05", "Recipient acceptance evidence", "Chain-of-custody evidence", "TR-CP-07", "Receipt and acceptance by the recipient custodian; obligations transferred or retained."),
    ("EVD-06", "Custody closure evidence", "Chain-of-custody evidence", "TR-CP-09", "Closure basis and chain-of-custody record."),
    ("EVD-07", "Superseded asset destruction evidence", "Control evidence", "TR-EX-06", "Verified disposition control result, DR-04 authorization, successor traceability retained."),
    ("EVD-08", "Custody closure after destruction evidence", "Chain-of-custody evidence", "TR-CP-10", "Destruction evidence reference and closure basis; chain of custody retained."),
]
CONFORMANCE = [
    ("N-001", "Architecture conformance", "A conformant profile SHALL distinguish the Data Lifecycle, Formal Data Asset Protocol and GRCA Services as separate but traceable layers."),
    ("N-002", "Controlled subject", "Every FTS instance SHALL identify the controlled subject type and Data Asset instance. Representations, custodians and evidence records SHALL NOT be silently substituted for the asset identity."),
    ("N-003", "Lifecycle semantics", "Lifecycle phases SHALL describe work context and SHALL NOT be treated as formal states solely because they appear as boxes in a lifecycle diagram."),
    ("N-004", "Activity semantics", "Every activity SHALL use behavioural semantics and SHALL declare whether it is state-preserving, transition-supporting, transition-causing or potentially creates a related asset."),
    ("N-005", "Region profile", "The base profile SHALL define the Existence, Assurance, Availability and Custody / Preservation regions, or declare an approved profile variation."),
    ("N-006", "Orthogonality", "Exactly one applicable state SHALL be active in each region for a Data Asset observation. Regions SHALL describe independently varying conditions of the same subject."),
    ("N-007", "State definition", "Every state SHALL have a stable ID, region, condition-oriented name, definition, initial/terminal flags, at least one invariant and traceable entry/exit/transition semantics."),
    ("N-008", "State qualification", "A candidate state SHALL demonstrate distinguishability, persistence, behavioural significance, entry, invariant, permissible behaviour, exit and transition semantics."),
    ("N-009", "Transition definition", "Every transition SHALL identify one source state, one target state in the same region, an event, guards, relevant entry/exit predicates, invariant-preservation checks, effects and status."),
    ("N-010", "Transition contract", "A transition SHALL NOT execute unless the event is relevant, source is active, applicable exit conditions and guards are true, target entry is admissible, invariants are preserved and required GRCA conditions and authorization are satisfied."),
    ("N-011", "Determination separation", "Eligibility, Risk Acceptability, Control Satisfaction, Assurance Satisfaction and Authorization SHALL be modelled as distinct determinations."),
    ("N-012", "Permission records", "An executable lifecycle activity SHALL be governed by one or more Permission Records declaring Required, Permitted, Conditional, Prohibited or Not Applicable, plus guard, authority, control/service, evidence and effect classification."),
    ("N-013", "Composite legality", "A proposed State Vector SHALL be rejected when any active-state invariant or applicable cross-region guard is false."),
    ("N-014", "Control semantics", "A Control SHALL be represented as a mechanism. A Control Result MAY satisfy a Guard but SHALL NOT be represented as the Guard itself."),
    ("N-015", "Assurance and evidence", "Evidence SHALL support a defined Assurance claim/result and SHALL record provenance, relevance, sufficiency, validity and retention/protection conditions."),
    ("N-016", "Authorization", "A material transition requiring a Decision Right SHALL not execute solely because technical predicates pass."),
    ("N-017", "Exception", "An exception SHALL be limited to waivable requirements and SHALL record authority, scope, rationale, residual risk, compensating controls, effective date, expiry/review, monitoring and evidence."),
    ("N-018", "Non-waivable obligations", "A non-waivable obligation SHALL block the relevant activity or transition; an exception SHALL NOT override it."),
    ("N-019", "Traceability", "A conformant profile SHALL support typed traceability from lifecycle context/activity through protocol, permission, predicates, GRCA results, decision and resulting configuration."),
    ("N-020", "Validation", "A conformant profile SHALL test stable-ID uniqueness, reference integrity, region/state completeness, guard and invariant coverage, terminal-state behaviour, nonterminal liveness and source/status discipline."),
]
GUARDRAILS = [
    ("GA-001", "Data Asset centricity", "Every lifecycle activity, state, transition, service, control and material decision shall identify the Data Asset or Data Product to which it applies."),
    ("GA-002", "Lifecycle/state separation", "A lifecycle phase or activity shall not automatically be represented as a Global FTS State."),
    ("GA-003", "Condition/behaviour separation", "States describe conditions. Activities describe behaviour. Events describe occurrences."),
    ("GA-004", "Global orchestration", "The Global FTS shall orchestrate Data Asset state changes but shall not replicate the internal processes of Knowledge Areas."),
    ("GA-005", "Service-based KA integration", "Knowledge Areas should expose services, predicates, controls, decisions, evidence, events and obligations to the Global Architecture; they should not automatically be modeled as orthogonal state machines."),
    ("GA-006", "Governance authority", "Technical or management readiness does not itself constitute authorization. Where a Decision Right applies, Eligibility is not Authorization."),
    ("GA-007", "Predicate-based transition control", "A Global FTS transition may occur only when its required guards, invariants, control outcomes, authorizations and exception conditions are satisfied."),
    ("GA-008", "Evidence by design", "Material transitions and governance decisions must be capable of producing or referencing appropriate evidence."),
    ("GA-009", "Loose coupling", "Knowledge Area services should interact with the Global FTS through defined contracts, events, predicates and evidence, rather than through unnecessary synchronization of complete state machines."),
    ("GA-010", "Orthogonality by semantics", "Orthogonality should be used only where two conditions can genuinely vary independently for the same Data Asset."),
    ("GA-011", "No state explosion", "The Global Architecture should not enumerate every possible combination of conditions; the Data Asset has a configuration/state vector composed from the independent dimensions."),
    ("GA-012", "Full traceability", "Every material Global FTS transition should be traceable: Lifecycle Phase, Activity, Service, State, Event, Transition, Guard/Invariant, Rule/Policy, Control, Decision/Authorization/Exception, Evidence."),
]
RECOMMENDATIONS = [
    ("NR-01", "Adopt two-level publication", "Publish the lifecycle and architecture informatively in the chapter; publish the candidate formal specification as a normative annexure/digital companion.", "Accept"),
    ("NR-02", "Approve the Lifecycle-to-Protocol mapping rule", "Prohibit direct Phase to State interpretation; require activity/permission/state-vector mediation.", "Accept"),
    ("NR-03", "Approve the four-region base profile", "Use Existence, Assurance, Availability and Custody / Preservation as the initial base protocol profile.", "Revise/accept after domain review"),
    ("NR-04", "Approve Permission Records as a first-class metamodel element", "Require explicit activity outcomes and guards by state/context.", "Accept"),
    ("NR-05", "Approve Data Asset Configuration / State Vector terminology", "Use this term instead of Composite Data Management State.", "Accept"),
    ("NR-06", "Approve Evidence within Assurance", "Treat evidence as a resource/output of Assurance, not a fifth GRCA family.", "Accept"),
    ("NR-07", "Approve exception semantics", "Use the full non-conformance, risk, treatment, residual risk, decision, monitoring/evidence path.", "Accept"),
    ("NR-08", "Approve extension governance", "Allow additional regions only after subject, orthogonality, invariant and interaction tests pass.", "Accept"),
    ("NR-09", "Require public profile test cases", "Publish positive, negative, terminal, expiry, suspension, transfer and exception examples.", "Accept"),
    ("NR-10", "Defer Knowledge Area state models", "Add Knowledge Area services first; approve independent KA state models only when their governed subject is explicit.", "Defer"),
]
EDITORIAL = [
    ("ED-01", "Should the architecture be both informative and normative?", "Informative chapter architecture plus candidate normative annexure.", "Retain workbook as experimental companion only."),
    ("ED-02", "Is the no-one-to-one lifecycle/state mapping rule accepted?", "Yes; require activity and permission mediation.", "Lifecycle diagrams remain vulnerable to state/activity conflation."),
    ("ED-03", "Are the four regions accepted as the base profile?", "Approve subject to cross-domain review and state-definition refinement.", "Approve the metamodel but defer the state vocabulary."),
    ("ED-04", "Are State Permission records mandatory?", "Yes for executable or auditable profiles.", "Keep them recommended for informative use only."),
    ("ED-05", "Are the proposed normative clauses approved in principle?", "Approve for controlled editorial refinement and conformance testing.", "Publish only informative guidance."),
    ("ED-06", "How should Knowledge Areas integrate?", "Services and predicates first; independent FTS only when subject/orthogonality tests pass.", "Defer all KA formalization."),
    ("ED-07", "What is the status of this workbook profile?", "Candidate reference implementation; Proposed / illustrative until approved.", "Retain as a discussion artefact."),
]
NAMING = [
    ("Lifecycle Phase", "Active verb-object", "Plan and Specify Data"), ("Activity", "Active verb-object", "Register Data Asset"),
    ("Protocol State", "Durable condition noun phrase (preferred); participle only if it names a persistent resultant condition", "Restricted Access; Active Custody"),
    ("Event", "Occurrence noun phrase", "Registration request"), ("Transition", "Active change verb phrase", "Release Access"),
    ("Guard / Invariant", "Boolean predicate: is..., has..., remains...", "No active hold exists"), ("GRCA Service", "Noun phrase", "Use Authorization"),
    ("Decision Right", "Decision-type noun phrase (Authorize ...)", "Authorize Destruction and Custody Closure"), ("Control", "Noun phrase", "Access Enforcement Control"),
    ("Evidence", "Record / artefact noun phrase", "Destruction evidence"), ("Exception", "Record noun phrase", "Emergency Access Exception Record"),
]

# ------------------------------------------------------------------ naming QA (semantic test with grammar as a heuristic)
PARTICIPLE = re.compile(r"\b\w+(ed|en)\b$", re.I)
GERUND_FIRST = re.compile(r"^\w+ing\b", re.I)
VERB_FIRST = re.compile(r"^(Register|Materialize|Supersede|Reinstate|Destroy|Initiate|Confirm|Grant|Record|Suspend|Reassess|Expire|Release|Restrict|Restore|Withdraw|Reconsider|Close|Establish|Enter|Place|Complete|Cancel|Define|Create|Assess|Operate|Validate|Authorize|Access|Share|Transform|Preserve|Transfer|Plan|Manage|Use|Retain)\b", re.I)
def name_qa(kind, name):
    if kind == "state":
        if VERB_FIRST.match(name) and not name.endswith(("Access", "Custody", "Existence", "Closure", "Pending")):
            return ("REVIEW", "Verb-led label; a state must name a condition that holds.")
        if PARTICIPLE.search(name):
            return ("REVIEW", "Participial label; passes only as a persistent resultant condition (naming standard).")
        return ("PASS", f"Condition noun phrase: “The Data Asset is in {name}” reads as a condition that endures while activities occur.")
    if kind in ("transition", "activity", "phase"):
        return ("PASS", "Active verb-object.") if VERB_FIRST.match(name) else ("REVIEW", "Expected an active verb-object name.")
    if kind == "event":
        return ("REVIEW", "Verb-led; an event is an occurrence.") if VERB_FIRST.match(name) else ("PASS", "Occurrence noun phrase.")
    return ("PASS", "")

# ------------------------------------------------------------------ build
def build():
    stamp = now_sast()
    def row(d, origin, trace):
        d["origin"] = origin; d["trace"] = trace; d["status"] = STATUS; return d
    m = {"meta": {
        "modelId": "GDA-GLOBAL-PROTOCOL", "name": "Global Data Asset Architecture: Formal Data Asset Protocol (Global FTS)", "level": "global", "knowledgeArea": None,
        "version": "0.2.2", "schemaVersion": "0.3", "status": STATUS, "subjectType": "Data Asset (governed identity and its controlled representations)", "parallelRegions": True,
        "layers": [
            {"id": "L1", "name": "Data Lifecycle", "question": "What work is performed with or on the Data Asset?", "constructs": "Phases, activities, purpose, intended outcomes, iteration", "boundary": "Non-executable; does not itself authorize work or define asset state."},
            {"id": "L2", "name": "Formal Data Asset Protocol (Global FTS)", "question": "What durable conditions hold and what state changes are permissible?", "constructs": "Regions, states, events, transitions, guards, invariants, state vector", "boundary": "Does not absorb lifecycle work or internal GRCA workflows."},
            {"id": "L3", "name": "Governance, Risk, Control and Assurance Services", "question": "Under what authority, risk conditions, controls and assurance may work or change occur?", "constructs": "Services, results, decisions, exceptions and evidence", "boundary": "Does not become a fifth protocol region merely because it supplies a result."},
        ],
        "source": SRC_REPORT + "; " + SRC_LAYERS, "note": "Three-layer Global Data Asset Architecture. Layer 2 is the Global FTS: four orthogonal regions (Existence, Assurance, Availability, Custody / Preservation), each a state machine with its own initial state, running concurrently; the Data Asset's condition at a time is the State Vector <EX, AS, AV, CP>. The eight-stage Board vocabulary is out of scope (superseded). Content transcribed from the specification report; rows that only the encrypted workbook holds are marked.",
        "buildStamp": stamp, "generator": "protocol_build.py",
    }}
    m["rules"] = [{"id": g[0], "shortName": g[1], "statement": g[2], "rationale": "", "appliesTo": "Global Data Asset Architecture", "test": "", "compliant": "", "nonCompliant": "", "status": "Architectural guardrail", "authority": "Enterprise design material; not a Board approval", "notes": ""} for g in GUARDRAILS]
    m["lifecycle"] = {"phases": [row({"id": p[0], "name": p[1], "purpose": p[2], "nonLinearity": p[3], "entryContext": p[4], "nameQA": dict(zip(("status", "rationale"), name_qa("phase", p[1])))}, SRC_REPORT + "; " + SRC_DECK, "report:4.1; deck:phases") for p in PHASES],
                      "effectClasses": [{"effectClass": e[0], "definition": e[1], "examples": e[2], "origin": SRC_DECK} for e in EFFECT_CLASSES],
                      "mappingRule": "A lifecycle phase never directly determines a protocol state. The mapping is mediated by activities, permissions, predicates, services and decisions: Lifecycle Context (phase, activity, purpose) -> State Vector -> Permission Record -> GRCA applicability -> Evaluation (invariants hold and cross-region constraints pass and authorization exists) -> Required | Permitted | Conditional | Prohibited | Not applicable."}
    m["activities"] = [row({"id": a[0], "name": a[1], "effectClass": a[2], "lifecyclePhases": a[3], "relatedTransitions": a[4], "services": a[5], "permittedIn": "see Permission Records", "activityType": a[2], "nounVerb": "Verb", "permissibility": "Evaluated through Permission Records", "nameQA": dict(zip(("status", "rationale"), name_qa("activity", a[1]))), "notes": "Phase, transition and service links drafted from the report's worked examples and service triggers; the workbook holds the record of truth."}, SRC_REPORT, "report:4.2; derived:links") for a in ACTIVITIES]
    m["regions"] = [row({"id": r[0], "name": r[1], "code": r[2], "question": r[3], "initialState": r[4], "regionInvariant": r[5], "subject": m["meta"]["subjectType"]}, SRC_REPORT, "report:5.2") for r in REGIONS]
    # viewer-compatible containers: each region is a composite (globalState kind=region) holding its states
    m["globalStates"] = [row({"id": r[0], "name": r[1], "definition": r[3], "kind": "region", "stateType": "Orthogonal State Region", "initial": False, "terminal": False, "semanticClass": "Region", "nameQA": {"status": "Pass", "rationale": "Region, not a state."}, "retainedRuleIds": ["N-005", "N-006"], "notes": r[5]}, SRC_REPORT, "report:5.2") for r in REGIONS]
    m["subStates"] = []
    for s in STATES:
        qa = name_qa("state", s[2])
        m["subStates"].append(row({"id": s[0], "name": s[2], "parent": s[1], "region": s[1], "definition": s[5], "initial": s[3], "terminal": s[4], "sequence": int(s[0][-2:]), "requirement": "Required", "readiness": False, "kind": "sub", "semanticClass": "Condition noun phrase", "nameQA": {"status": qa[0], "rationale": qa[1]}, "retainedRuleIds": ["N-007", "N-008"], "notes": ""}, SRC_REPORT, "report:5.3-5.6; annexA"))
    m["invariants"] = [row({"id": "INV-" + s[0][4:], "appliesTo": s[0], "predicate": s[6], "severity": "High"}, SRC_REPORT, "report:invariant summary") for s in STATES]
    m["entryConditions"] = [row({"id": "EC-" + s[0][4:], "appliesTo": s[0], "predicate": f"The condition “{s[5].rstrip('.')}” can be established and its invariant can be made true.", "requirement": "Required", "conditionType": "State entry", "notes": "Generic; the report (14.3) says the workbook's entry and exit rows are generic and should be refined into domain-testable predicates."}, SRC_WB, "derived:generic entry") for s in STATES]
    m["exitConditions"] = [row({"id": "XC-" + s[0][4:], "appliesTo": s[0], "predicate": "The state's invariant has been recorded and a triggering event with a satisfiable guard exists." if not s[4] else "No exit: terminal state.", "requirement": "Required" if not s[4] else "Not applicable"}, SRC_WB, "derived:generic exit") for s in STATES]
    m["events"] = [row({"id": k, "name": v[0], "eventType": v[1], "meaning": "Triggers " + ", ".join(t[0] for t in TRANSITIONS if t[4] == k) + ".", "notes": "Name drafted from the transitions it triggers; confirm from the workbook."}, SRC_REPORT, "report:transition tables; derived:event name") for k, v in EVENTS.items()]
    m["transitions"] = []
    for t in TRANSITIONS:
        m["transitions"].append(row({"id": t[0], "name": t[1], "level": "Sub-State", "region": REGIONS[[r[2] for r in REGIONS].index(t[0][3:5])][0], "source": t[2], "target": t[3], "event": t[4], "transitionType": "Regional State Transition", "transitionKind": "external", "optionality": "Conditional", "guardSummary": t[5], "decisionRight": t[6], "services": TR_SERVICES.get(t[0], []), "crossRegionConstraints": [x[0] for x in XRG if t[0] in x[2]], "reversibility": "Irreversible" if t[3] in ("STS-EX-05", "STS-CP-06") else "Reversible by a further transition", "nameQA": dict(zip(("status", "rationale"), name_qa("transition", t[1])))}, SRC_REPORT, "report:annexA"))
    for t in m["transitions"]:
        if t["id"] == "TR-AV-10":
            t["origin"] = "Decision 20 Sep 2026 (AskUserQuestion): add Restricted to Withdrawn so a never-released asset can satisfy XRG-006 before destruction"; t["trace"] = "decision:availability-withdrawal"
    # initial pseudo-transitions per region (one machine per region)
    for r in REGIONS:
        m["transitions"].append(row({"id": f"TR-INIT-{r[2]}", "name": f"Initialize {r[1]}", "level": "Initial", "region": r[0], "source": "[Initial]", "target": r[4], "event": "EV-INIT", "transitionType": "Initial", "transitionKind": "external", "optionality": "Mandatory", "guardSummary": f"Region {r[1]} starts in {r[4]} when the Data Asset is first observed.", "decisionRight": None, "services": [], "crossRegionConstraints": [], "reversibility": "n/a"}, SRC_REPORT, "report:5.2 initial state"))
    m["events"].append(row({"id": "EV-INIT", "name": "Data Asset first observed", "eventType": "Initial", "meaning": "Instantiates the four regions at their initial states.", "notes": "Builder convention for the initial pseudo-transitions."}, "builder convention", "derived:initial"))
    m["guards"] = []
    for t in TRANSITIONS:
        m["guards"].append(row({"id": "GRD-" + t[0][3:], "name": t[1] + " Guard", "transition": t[0], "predicate": t[5], "scope": "Transition", "requirement": "Required", "expression": None}, SRC_REPORT, "report:guard summary"))
    for x in XRG:
        for tid in x[2]:
            m["guards"].append(row({"id": f"GRD-{x[0]}-{tid[3:]}", "name": f"{x[0]} on {tid}", "transition": tid, "predicate": x[1], "scope": "Cross-region", "requirement": x[3], "expression": x[4], "constraint": x[0]}, SRC_REPORT, "report:7.3"))
    m["crossRegionConstraints"] = [row({"id": x[0], "constraint": x[1], "transitions": x[2], "requirement": x[3], "expression": x[4], "expressionNote": "Expression drafted for the simulator over the state vector (EX, AS, AV, CP) and asset facts; not in the report."}, SRC_REPORT, "report:7.3; derived:expression") for x in XRG]
    m["stateVectors"] = [row({"id": c[0], "name": c[1], "vector": {"REG-EX": c[2][0], "REG-AS": c[2][1], "REG-AV": c[2][2], "REG-CP": c[2][3]}, "legality": c[3], "vectorType": "Example configuration"}, SRC_REPORT, "report:7.2") for c in CFG]
    m["compositeStates"] = [{"id": c["id"], "name": c["name"], "globalState": "", "subState": "; ".join(c["vector"].values()), "kaDimensions": "", "context": c["legality"], "vectorType": "State Vector (Data Asset Configuration)", "origin": SRC_REPORT, "trace": "alias of stateVectors", "status": STATUS} for c in m["stateVectors"]]
    m["services"] = [row({"id": s[0], "family": s[1], "name": s[2], "trigger": s[3], "output": s[4], "familyQuestion": FAMILIES[s[1]][0], "usedByTransitions": [t for t, l in TR_SERVICES.items() if s[0] in l], "usedByActivities": [a[0] for a in ACTIVITIES if s[0] in a[5]]}, SRC_REPORT, "report:9.2") for s in SERVICES]
    m["serviceFamilies"] = [{"family": k, "question": v[0], "outputs": v[1]} for k, v in FAMILIES.items()]
    m["controls"] = [row({"id": s[0].replace("SVC-CTL", "CTRL"), "name": s[2], "controlType": "Mechanism (control service)", "appliesTo": ", ".join(t for t, l in TR_SERVICES.items() if s[0] in l), "objective": s[3], "outcome": s[4], "service": s[0]}, SRC_REPORT, "report:9.2 control family") for s in SERVICES if s[1] == "Control"]
    m["roles"] = []
    # 22 Sep 2026 (holder register card H1 a): holders from the shared role vocabulary, DMBOK reference roles not the report's
    _v = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "role_vocabulary.json"), encoding="utf-8"))
    _gh = {g["id"]: g for g in _v.get("globalMapping", [])}
    m["decisionRights"] = [row({"id": k, "name": v, "holder": _gh.get(k, {}).get("holder", ""), "holderName": _gh.get(k, {}).get("holderName", ""), "appliesTo": ", ".join(t[0] for t in TRANSITIONS if t[6] == k), "definition": f"Authorize {', '.join(t[1] for t in TRANSITIONS if t[6] == k)}.", "requirement": "Required", "service": DR_SERVICE[k], "notes": ("Holder confirmed 22 Sep 2026 (holder register card H1): " + _gh[k]["holderName"] + "; a DMBOK reference role, as the report states no holder. " if k in _gh else "Holder role not stated in the report. ") + "DR-04's name is the report's, the others are drafted from the transitions they authorize."}, SRC_REPORT + " (names partly derived)", "report:annexA decision column; derived:name") for k, v in DECISION_RIGHTS.items()]
    _R = {r["id"]: r for r in _v["roles"]}
    for hid in sorted({d["holder"] for d in m["decisionRights"] if d["holder"]}):
        m["roles"].append(row({"id": hid, "name": _R[hid]["name"], "accountability": "Decision-Right Holder", "responsibility": _R[hid]["definition"], "appliesTo": ", ".join(d["id"] for d in m["decisionRights"] if d["holder"] == hid)}, "role_vocabulary.json", "holder register card H1"))
    m["permissionRecords"] = [row({"id": p[0], "activity": p[1], "context": p[2], "outcome": p[3], "guard": p[4], "authority": p[5], "services": p[6], "evidence": p[7], "effect": p[8], "basis": p[9]}, SRC_REPORT if "Worked" in p[9] else SRC_WB, "report:10 worked examples; derived" if "Worked" in p[9] else "derived:state definition") for p in PERMISSIONS]
    m["exceptions"] = [row({"id": x[0], "name": x[1], "transition": x[2], "basis": x[3], "authority": x[4], "conditions": x[5], "statusValues": x[6]}, SRC_REPORT, "report:9.4; 10.4") for x in EXCEPTIONS]
    m["evidence"] = [row({"id": e[0], "name": e[1], "evidenceType": e[2], "relatesTo": e[3], "description": e[4], "requirement": "Required"}, SRC_REPORT, "report:worked examples; derived") for e in EVIDENCE]
    m["artefacts"] = []
    m["rulesGov"] = [row({"id": n[0], "name": n[1], "scope": "Candidate normative clause", "statement": n[2], "appliesTo": "Conformant profile", "requirement": "SHALL (proposed)"}, SRC_REPORT, "report:11") for n in CONFORMANCE]
    m["conformance"] = [{"id": n[0], "title": n[1], "clause": n[2]} for n in CONFORMANCE]
    m["recommendations"] = [{"id": r[0], "title": r[1], "proposedDecision": r[2], "suggestedDisposition": r[3]} for r in RECOMMENDATIONS]
    m["editorialDecisions"] = [{"id": e[0], "question": e[1], "recommended": e[2], "ifDeferred": e[3]} for e in EDITORIAL]
    m["namingStandard"] = [{"elementType": n[0], "pattern": n[1], "example": n[2], "source": SRC_NAMING + "; " + SRC_LAYERS} for n in NAMING]
    m["kaInteractions"] = []; m["kaMatrix"] = []
    m["sources"] = [
        {"id": "SRC-001", "source": SRC_REPORT, "type": "Primary (transcribed)", "location": "OneDrive Data Lifecycle folder", "use": "Layers, lifecycle, regions, states, transitions, constraints, vectors, services, clauses, recommendations", "limitations": "Event names, decision-right names (except DR-04), activity links and permission rows beyond the worked examples are derived."},
        {"id": "SRC-002", "source": SRC_WB, "type": "Primary (not readable)", "location": "OneDrive Data Lifecycle folder; chat upload", "use": "Record of truth for permission matrix, entry/exit rows, roles, evidence and relationships", "limitations": "Encrypted with a Microsoft sensitivity label (DRMEncryptedDataSpace); to be merged when a readable copy is available."},
        {"id": "SRC-003", "source": SRC_LAYERS, "type": "Design basis", "location": "OneDrive Data Lifecycle folder", "use": "Three-layer definition, GRCA families, guardrails GA-001 to GA-012", "limitations": "Enterprise design material; not a Board approval."},
        {"id": "SRC-005", "source": SRC_DECK, "type": "Explainer deck (image pages)", "location": "Chat upload", "use": "Phase entry contexts and execution traits; four effect-class definitions with examples; ACT-09 worked result (Conditional)", "limitations": "Illustrative; consistent with the report."},
        {"id": "SRC-004", "source": SRC_NAMING, "type": "Research report", "location": "OneDrive Data Lifecycle folder", "use": "Naming patterns per element type; participle rule", "limitations": "Recommendations require Board review."},
    ]
    # relationships
    rel = []; n = [0]
    def R(s, typ, t, why=""):
        n[0] += 1; rel.append({"id": f"REL-{n[0]:04d}", "source": s, "type": typ, "target": t, "cardinality": "1..*", "optionality": "Required", "rationale": why, "origin": "derived", "status": STATUS})
    for s in STATES: R(s[1], "contains", s[0]); R(s[0], "maintains invariant", "INV-" + s[0][4:]); R(s[0], "has entry condition", "EC-" + s[0][4:]); R(s[0], "has exit condition", "XC-" + s[0][4:])
    for t in m["transitions"]:
        if t["source"] != "[Initial]": R(t["id"], "has source", t["source"])
        R(t["id"], "has target", t["target"]); R(t.get("event"), "triggers", t["id"])
        if t.get("decisionRight"): R(t["id"], "authorized by", t["decisionRight"])
        for s in t.get("services", []): R(t["id"], "requires service", s)
        for x in t.get("crossRegionConstraints", []): R(t["id"], "constrained by", x)
    for g in m["guards"]: R(g["transition"], "constrained by", g["id"])
    for a in m["activities"]:
        for p in a["lifecyclePhases"]: R(p, "invokes", a["id"])
        for t in a["relatedTransitions"]: R(a["id"], "may cause", t)
        for s in a["services"]: R(a["id"], "uses service", s)
    for p in m["permissionRecords"]: R(p["id"], "governs", p["activity"]); R(p["id"], "in context", p["context"])
    for e in m["evidence"]: R(e["relatesTo"], "supported by evidence", e["id"])
    for x in m["exceptions"]:
        if x["transition"]: R(x["transition"], "may be conditionally authorized by", x["id"])
    m["relationships"] = rel
    m["derivationTrace"] = [{"elementId": r["id"], "elementType": k, "name": r.get("name") or r.get("predicate") or r.get("constraint", ""), "derivedFrom": r.get("trace", "")} for k in ["lifecycle.phases", "activities", "regions", "subStates", "transitions", "events", "guards", "crossRegionConstraints", "stateVectors", "services", "decisionRights", "permissionRecords", "exceptions", "evidence"] for r in (m["lifecycle"]["phases"] if k == "lifecycle.phases" else m[k])]
    # QA
    qa = []
    ids = Counter(x["id"] for k in ["subStates", "globalStates", "transitions", "events", "guards", "services", "decisionRights", "permissionRecords", "activities", "crossRegionConstraints", "stateVectors"] for x in m[k])
    for i, c in ids.items():
        if c > 1: qa.append({"severity": "warning", "rule": "ID", "element": i, "finding": f"duplicate ID ({c})"})
    for s in m["subStates"]:
        if s["nameQA"]["status"] != "PASS": qa.append({"severity": "note", "rule": "N-007", "element": s["id"], "finding": s["nameQA"]["rationale"]})
    for t in m["transitions"]:
        if t.get("nameQA", {}).get("status") == "REVIEW": qa.append({"severity": "note", "rule": "naming", "element": t["id"], "finding": t["nameQA"]["rationale"]})
        if t["level"] != "Initial" and not t.get("decisionRight"): qa.append({"severity": "note", "rule": "N-016", "element": t["id"], "finding": "no Decision Right: the report marks this transition 'None' (time-triggered expiry); confirm it needs no authorization."})
        if t["level"] != "Initial":
            sr = next(s for s in STATES if s[0] == t["source"])[1]; tr_ = next(s for s in STATES if s[0] == t["target"])[1]
            if sr != tr_: qa.append({"severity": "warning", "rule": "N-009", "element": t["id"], "finding": "source and target in different regions"})
    for r in REGIONS:
        if not any(s[1] == r[0] and s[4] for s in STATES): qa.append({"severity": "note", "rule": "N-007", "element": r[0], "finding": "region has no terminal state (Assurance and Availability are non-terminating by design; confirm)"})
    for e in m["events"]:
        if "drafted" in e.get("notes", ""): pass
    qa.append({"severity": "note", "rule": "SRC-002", "element": "workbook", "finding": "The validated workbook is encrypted; permission matrix, roles, entry/exit rows, evidence and relationships are stand-ins to be merged from it."})
    qa.append({"severity": "note", "rule": "derived", "element": "events, decisionRights", "finding": f"{len(EVENTS)} event names and 10 of 11 decision-right names are drafted from the transitions; confirm against the workbook."})
    m["qaFindings"] = qa
    # State Contracts register (Howard, 25 Sep 2026, cards 3, 4 and 5 option a): entry and exit per way in and way out, and evidence for
    # every transition (fts_contracts.py). The Global protocol names no policy controls yet (its policy domains are an open card).
    import fts_contracts; fts_contracts.derive(m, {}, origin="derived")
    m["meta"]["counts"] = {k: len(m[k]) for k in ["regions", "subStates", "transitions", "events", "guards", "crossRegionConstraints", "stateVectors", "activities", "services", "controls", "decisionRights", "permissionRecords", "exceptions", "evidence", "rulesGov", "rules", "invariants", "entryConditions", "exitConditions", "relationships"]}
    m["meta"]["counts"]["lifecyclePhases"] = len(PHASES)
    m["meta"]["qaCounts"] = {"warnings": sum(1 for f in m["qaFindings"] if f["severity"] == "warning"), "notes": sum(1 for f in m["qaFindings"] if f["severity"] == "note")}
    return m

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(out, exist_ok=True)
    m = build()
    p = os.path.join(out, "global_protocol.fts.json")
    json.dump(m, open(p, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("wrote", p); print(json.dumps(m["meta"]["counts"])); print("QA", m["meta"]["qaCounts"])
    for f in m["qaFindings"]: print(" ", f["severity"], f["rule"], f["element"], "|", f["finding"])
