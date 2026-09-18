<script>
/* =====================================================================
   FACILITATOR GUIDE: per screen, per step, plus table role cards
   ===================================================================== */
var TAB_GUIDE = {
 setup:{
  title:"Setup: choose the object of study",
  what:"The input screen. It loads one company's Future State Model and asks you to commit to a single AI use case. Everything the rest of the app does is resolved from that one choice, so this screen decides what the session is about.",
  obj:"Leave this screen with one named use case, a room seated in mixed tables, and everyone clear that today evaluates a decision, not a technology.",
  facil:[
   "Load the workbook in front of the room. Say out loud that nothing is uploaded anywhere. The file stays on this machine. It matters for the data people.",
   "Show the use-case list briefly, then choose. Do not let the room shop around; the portfolio conversation is a different workshop.",
   "Read the selected use case's spine coverage aloud (“nn of 16 layers reachable”). If layers are missing, say so now. You are pre-loading the honesty the session depends on.",
   "Set assessment intensity deliberately. Standard for an operational journey; Deep for regulated, fiduciary or high-harm decisions. It changes how much evidence you will accept later."],
  table:[
   "Seat by role, not by function: every table needs a strategy voice, a programme or IMM/M&E voice, a data or AI voice, and a recorder who owns the evidence.",
   "Each table names its recorder out loud. That person is the only one who types into the shared canvas for their table.",
   "Each table writes its composition into the table-composition box, so afterwards you can tell who actually spoke for what.",
   "Table members state which quality pillar they expect to own. Disagreement here is useful. It surfaces before it costs anything."],
  watch:[
   "A room that self-sorts into functional cliques. Break it up now; the whole design depends on cross-functional friction.",
   "Someone proposing to “evaluate the AI strategy”. Narrow it back to one use case and one decision.",
   "A use case with no decision mapped to it. That is a finding, not a blocker. Note it and continue."],
  done:"One use case selected, tables mixed and named, intensity set."},

 session:{
  title:"Session: run the designed sequence",
  what:"The facilitation engine. Four phases, eighteen steps, each with what goes on screen, what you say, what the tables produce, and a timer sized to the slot. Model answers stay hidden until you reveal them.",
  obj:"Get the room to discover why a deeper model is needed before you give them one, then build the evaluation on top of that discovery.",
  facil:[
   "Do not skip ahead to Phase B because the room is struggling in Phase A. The struggle is the teaching.",
   "Start the timer on every step. Visible time pressure is what forces tables to commit rather than deliberate.",
   "Reveal the model answer only after every table has voted or committed. Reveal early and you replace their thinking with yours.",
   "Tick “Step complete” as you go. It drives the phase counters and the evidence checklist at the end.",
   "Steps 9, 15, 16 and 17 hand off to another tab. Do the work there, then come back to the flow."],
  table:[
   "One recorder types; everyone else argues. Two people typing means two records and no agreement.",
   "Every table commits to an answer at every step, even a bad one. “We couldn't agree” is only acceptable if the disagreement itself is written down.",
   "Where a table disagrees with the model answer after the reveal, capture the disagreement rather than overwriting the table's answer."],
  watch:[
   "The room converging too fast. If every table gives the same answer in Phase A, your evidence cards are too easy. Add ambiguity.",
   "A dominant voice at one table. Ask that table's recorder, not its loudest member, to report back.",
   "Running long in Phase A. Phases C and D are where the artefact gets built; protect them."],
  done:"All eighteen steps ticked and each phase counter complete."},

 spine:{
  title:"Golden thread: what the architecture actually asserts",
  what:"The full spine resolved from the model for this use case, sixteen layers from stakeholder down to governance. Layers the model cannot reach are flagged in red. Underneath, two lanes: what the model says today, and what this workshop proposes.",
  obj:"Separate evidence from intention. Agree what is genuinely mapped, and state any bridge as a proposed extension rather than pretending it already exists.",
  facil:[
   "Walk the spine top to bottom once, out loud. It takes ninety seconds and it orients everyone.",
   "Stop at every red layer and ask the room: is this a modelling gap, or does this layer genuinely not apply?",
   "Type the answer into the interpretation field on the row. That text goes into the exported workbook. It is the audit trail for the judgement.",
   "Be explicit about the two lanes. If the learner-value framing and the current portfolio mapping point at different outcomes, say so plainly and label the bridge as proposed."],
  table:[
   "Each table takes three or four adjacent layers and checks whether the resolved elements are the ones they would have named.",
   "Where the model reaches a layer only through a related branch, the table decides whether that counts as real coverage.",
   "The programme and M&E voices own the upper layers (stakeholder to value stage); data and AI own the lower ones (data product to CDE); the recorder writes the interpretation."],
  watch:[
   "Quiet acceptance of a red layer because it looks like criticism of someone in the room. Name it as an architecture finding, not a performance review.",
   "Someone editing the model in their head: “we do have that product, it's just not in the spreadsheet”. If it is not in the model, it is not governed. Write it in the proposed lane."],
  done:"Every red layer has an interpretation, and both lanes are written."},

 register:{
  title:"Eval register: prove the numbers",
  what:"Every recorded check for this use case's models and agents, with the recorded status beside a status recomputed from the result and the threshold. A disagreement is a mismatch; a recorded pass sitting over a computed fail is critical.",
  obj:"Teach the room, permanently, that a recorded status is an assertion and a computed status is arithmetic, and that only one of them is evidence.",
  facil:[
   "Before revealing anything, put four rows on screen and have tables recompute them by hand.",
   "Collect their answers, then scroll to the flags. The gap between the two is the whole lesson.",
   "Ask who, in this organisation, would have noticed the critical mismatch and when. The answer is usually 'nobody' or 'at audit'.",
   "Do not correct the recorded status in the app during the session. The mismatch is the finding; correcting it is remediation work with an owner."],
  table:[
   "Each table takes the checks for one model or agent and recomputes every row independently: value, operator, threshold, nothing else.",
   "Tables record, for each disagreement, whether they think the record was optimistic, stale, or simply mis-keyed. The cause changes the fix.",
   "The data or AI voice leads; the recorder writes the verdict; the strategy voice asks what decision was taken on the strength of the wrong status."],
  watch:[
   "Tables reading the recorded column first and anchoring on it. Cover it if you have to.",
   "Arguments about whether a threshold is the right threshold. Legitimate, but park it. Today's question is whether the status matches the number.",
   "Percent and ratio units mixed in one register. Flag it; it is a real source of silent error."],
  done:"Every mismatch and critical flag has been read out and understood."},

 assurance:{
  title:"Assurance: five lenses, eight concerns",
  what:"The five assurance lenses with their owners, and the eight configurable assurance concerns as questions rather than definitions. There is no RAG button. Each concern's status is derived from the Eval Requirements filed under it, so a concern with nothing specified reads Unevidenced rather than green. Below the concerns, a legacy table showing where each of the v1 eight dimensions went, and why v1 was reconstituted rather than extended.",
  obj:"Distribute ownership of assurance across the room, and let the room discover that two of the eight concerns have no owner because they were new in v2 and had been disappearing inside the old broader dimensions.",
  facil:[
   "Say this before anything else: you cannot type a colour on this screen. If the room wants a concern green it has to write a requirement, specify it and run it.",
   "Insist that each concern gets a named person, not a team name. 'Data' does not sign anything.",
   "Walk the legacy table deliberately. People who ran the old scorecard need to see that nothing was discarded quietly.",
   "Name the two unowned concerns out loud: System, Integration and Operational Resilience, and Security, Privacy and Misuse Resistance. Adding a lens did not add work, it revealed work already happening unowned."],
  table:[
   "Each table takes two concerns and writes the finding in one sentence that would survive being read by an auditor.",
   "For each concern the table must open its requirements and say whether the evidence is specified, run, or neither.",
   "Every table cross-reviews one concern owned by another table and may challenge the finding once.",
   "Where a concern shows Unevidenced, the table writes the requirement that would change it rather than arguing about a colour."],
  watch:[
   "A room trying to argue a concern green without touching the requirements. Point at the derived bar and move on.",
   "Monitoring being looked for as a concern. It is not one any more. It is cadence, monitoring window, trigger condition and retest deadline on every applicable requirement.",
   "Concern 4 Model Validity rated on model metrics alone, ignoring whether the metric measures the construct it claims to.",
   "Owners volunteered in absentia. Do not accept a name that is not in the room unless someone present will carry the message."],
  done:"Eight concerns with a finding and a named owner, every unevidenced concern carrying at least one written requirement, and the two unowned concerns named."},

 requirements:{
  title:"Requirements: the central object of v2",
  what:"The Eval Requirement register. Each requirement records the claim, risk or obligation it exists to test, the golden thread anchor it hangs from, the source artefact that seeded it, a typed Eval Specification written before the run, and the immutable runs that observed it. Status is computed at read time from the latest run. Nothing on this screen stores a Pass or a Fail.",
  obj:"Move the room from scoring to specification. A score is an opinion about evidence. A requirement is a statement of what would falsify the claim, written before anyone knows the answer.",
  facil:[
   "Press Generate from the model before the room arrives, so the screen opens with the organisation's own conditions, risks, controls, readiness weaknesses and existing checks already expressed as requirements.",
   "Open one seeded requirement fully and walk its source line. The room needs to see that the requirement came from their own stewardship decision, not from the model.",
   "Show a requirement with a draft specification. Unspecified is an honest state and it is not the same as failing.",
   "Show the four requirements one EAR condition generated: the measurable control, the affected-group outcome, the qualitative attestation and the monitoring trigger. One condition, four different kinds of proof."],
  table:[
   "Each table takes one gate-critical requirement and completes its specification: metric, operator, threshold, tolerance, dataset version, evaluator and evidence class.",
   "The table must state what result would falsify the claim. If nothing would, the requirement is not testable and should be rewritten or retired.",
   "For any requirement touching dignity, legitimacy, proportionality or meaningful appeal, the table sets evaluator type to attestation rather than inventing a number.",
   "Each table names the owner, the reviewer, and whether independence is required."],
  watch:[
   "Thresholds written after the result is known. Ask when the threshold was set. If the answer is today, say so in the specification status.",
   "A qualitative obligation being converted to a metric so that it can show green. This is the most damaging thing the room can do on this screen.",
   "Tolerance left blank on a measurement that has real sampling error, which produces a confident fail on noise.",
   "Requirements with no failure consequence written. If nothing happens when it fails, it is not a requirement."],
  done:"Every gate-critical requirement carries a typed specification with a named owner, and every requirement that cannot be numeric is marked as an attestation."},

 lifecycle:{
  title:"Lifecycle: where the six gates actually sit",
  what:"The governance lifecycle from S1 intake through G0 admissibility, G1 investment, G2 design authorisation, G3 pre-deployment evidence acceptance, G4 deployment authorisation, G5 triggered revalidation and G6 retirement closure. Hard gates show the gate-critical requirements that block them. The six U05 component gates are nested inside G2, G3 and G4.",
  obj:"Stop the room believing that six closed component gates is the same as permission to deploy. It is not, and the difference is where most AI governance fails.",
  facil:[
   "Say the principle before touching the screen: ethical acceptability is a precondition, not a business-value weight. A high-value quadrant means investment priority, never ethical or deployment approval.",
   "Point out what the six component gates do not contain: no admissibility screen, no investment gate, no change and revalidation gate, no retirement gate.",
   "Show a blocked hard gate and read its blocking requirements aloud. A gate is blocked by named requirements, not by a mood.",
   "Land the tiering point: a universal hard admissibility screen for every candidate, then a proportionate EAR. A full ten-step review for every speculative idea produces delay and superficial completion, which protects nobody."],
  table:[
   "Each table takes one hard gate and lists what evidence would be needed to record an outcome on it today.",
   "The table names the accountable decision maker for that gate, and checks that it is not the person who built the thing.",
   "For G5, the table writes the two triggers most likely to fire first for this use case.",
   "For G6, the table answers one question honestly: if this were switched off tomorrow, what would be left behind?"],
  watch:[
   "A room recording an outcome on a gate whose blockers are still listed. The app shows the blockers; ask who is accepting that risk by name.",
   "Deployment authorisation being signed by the builder. The release authority must be a different person and the model should show it.",
   "The change gate treated as optional. Most AI failures in production are change failures, not build failures.",
   "Retirement treated as switching something off. It is dependency removal, access revocation, records retention and lawful disposal."],
  done:"Every hard gate either carries a recorded outcome with a named decision maker, or carries a visible list of what blocks it."},

 reference:{
  title:"v2 reference: the framework behind the screens",
  what:"The full v2 specification as reference: the conceptual model, both schemas, the source to eval population table, the golden thread to eval mapping, the EAR condition expansion pattern, value maturation, readiness domains, eval types, measurement integrity controls, progressive population, synchronisation rules, card projections and the roadmap.",
  obj:"Give the room somewhere to check a definition without stopping the session, and give the sponsor something to read afterwards.",
  facil:[
   "Do not teach from this screen. It is reference, and reading it aloud will lose the room.",
   "Use it to settle exactly two arguments: what a Model Card is for, and why the status is computed rather than stored.",
   "Point sponsors at the roadmap section at the close. P0 is structural and it is what makes everything else possible.",
   "The card projection table is the one to show anyone who calls an idea-stage business record a model card."],
  table:[
   "No table exercise. This screen is consulted, not worked."],
  watch:[
   "The session turning into a walkthrough of the schema. The schema is not the lesson; the requirement is."],
  done:"Used as reference, not taught."},

 remed:{
  title:"Remediation: turn findings into owned work",
  what:"A backlog that can be generated from everything the session has found: computed failures, status mismatches, unreachable spine layers, failing and unspecified requirements, unpopulated assurance concerns, missing accountability. P0 items block the scale decision.",
  obj:"Ensure nothing discovered today dies in the room. Every finding leaves with a priority, a pillar and a person.",
  facil:[
   "Generate the suggestions in front of the room so people see their own findings appear.",
   "Work top down. P0 items are the ones that hold gates shut. Get owners on those before anything else.",
   "Force a name into the owner field for every P0 before you move on. An unowned P0 is a wish.",
   "Add anything the generator missed. It reads the structured findings, not the conversation."],
  table:[
   "Each table takes the P0 items touching its pillar and proposes an owner and a first action, not a project.",
   "Tables strike out any suggestion they judge to be a duplicate or a non-issue, and say why in the description.",
   "The recorder confirms each item reads as an action, starting with a verb, that someone could begin on Monday."],
  watch:[
   "Actions phrased as 'review' or 'investigate'. Push for the decision or artefact the action must produce.",
   "Every item landing on the same person. That is a capacity finding in its own right. Note it.",
   "Items priced as programmes. Split them until the first step fits inside a fortnight."],
  done:"Every P0 has an owner and a first action."},

 gates:{
  title:"Gates and decision: decide conditionally",
  what:"Six progression gates, each with a pass criterion, a decision rule, a status and an owner; then the decision itself with a required rationale and conditions. The app pushes back if scale is chosen over open gates.",
  obj:"Make a defensible decision. In most sessions that is a controlled pilot with the open gates attached as explicit, owned conditions.",
  facil:[
   "Take each gate in turn and ask its pillar owner one question: is your evidence sufficient to close it?",
   "Accept 'no' cleanly. An open gate is a condition, not a failure, and treating it as a failure is what produces optimistic records.",
   "Have every table vote on stop, pilot or scale in thirty seconds, then reveal the model answer.",
   "Do not let the room leave the decision at 'not decided'. A written rationale is what makes it auditable.",
   "If the room votes to scale over open gates, read the app's warning aloud and ask who is accepting that risk by name."],
  table:[
   "Each table decides its verdict independently before hearing any other table.",
   "The table must state its conditions in the form 'we would scale once X, owned by Y, is evidenced by Z'.",
   "The strategy voice states the consequence of being wrong; the recorder writes the rationale in one sentence."],
  watch:[
   "Consensus arriving too quickly because the sponsor spoke first. Take table votes before any plenary discussion.",
   "'Pilot' used as a way of avoiding the decision. A pilot with no conditions and no review date is just production without oversight.",
   "Risk acceptance offered by someone without the authority to accept it."],
  done:"Every gate has a status and an owner; the decision has a rationale, conditions, an approver and a review date."},

 canvas:{
  title:"Data products: specify the supply",
  what:"One seven-section canvas per data product the use case needs, pre-seeded from the model: owner, steward, domain, schema, contract, SLAs, critical data elements. A product that does not exist in the model is marked proposed.",
  obj:"Turn the data findings into a specification. The evaluation has just proved which supply is required; this is where that requirement becomes something a domain team can build and certify.",
  facil:[
   "Explain the order deliberately: the canvas comes after the evaluation, not before it, because only now do we know what the decision actually needs.",
   "Take the purpose statement first and hold the room to one sentence. If they cannot write it, the product should not be built.",
   "Work a proposed product last and slowly. That is the one holding a gate shut.",
   "The usability scorecard is a release gate, not a survey. Score on evidence, same rule as the dimensions."],
  table:[
   "Data and AI voices lead; the programme voice must approve the purpose statement in plain language.",
   "Each table takes one product and completes sections 1 to 3 (metadata, intent, semantic core) before touching contracts.",
   "Tables mark every field they cannot complete rather than guessing; blanks become remediation items with owners.",
   "For each critical data element, the table states the business term it binds to. An unbound field is a future argument."],
  watch:[
   "Schema copied in without anyone confirming the field means what the decision needs it to mean.",
   "Consumers listed speculatively. Only name a consumer that exists today.",
   "The no-AI alternative left blank. It is the cheapest question in the pack and it occasionally kills the product."],
  done:"Every required product has a canvas; proposed products are marked and their gaps are in the backlog."},

 pack:{
  title:"Evidence pack: leave with something signed",
  what:"A fourteen-item evidence checklist, the source trail, and the exports: the Excel evaluation workbook, the Data Product Canvas in Markdown, the session as JSON, and a printable pack with a signature block.",
  obj:"Close the session with an artefact that survives the room, one a reviewer, an auditor or a board can read six months from now.",
  facil:[
   "Put the checklist on screen and read the unticked items aloud. Those are your follow-ups, and naming them publicly is what gets them done.",
   "Export the workbook in front of the room so everyone has seen the artefact exist.",
   "Confirm who signs and by when. A pack nobody signs is a draft.",
   "Save the session JSON and send it with the workbook. It lets the next session resume rather than restart."],
  table:[
   "Each table confirms that its pillar's evidence is represented in the checklist and says so out loud.",
   "The recorders check that their table's findings survived into the exported workbook.",
   "Each table names one commitment leaving the room, with a person and a date."],
  watch:[
   "A high checklist score with weak evidence underneath. The checklist counts presence, not quality. You are still the judge.",
   "The pack being treated as the end. It is the input to the remediation work; set the review date before people leave."],
  done:"Workbook exported, signatures agreed, commitments named."}
};

/* ---- step-level guidance (Session tab) ---- */
var STEP_GUIDE = {
 1:{obj:"Put the room inside an ambiguous decision with no vocabulary to resolve it.",
    table:["Read the case and agree, in one sentence, what problem is actually being described.",
           "Note the first intervention that occurs to you. You will compare it with your answer later."],
    watch:["Someone asking for definitions. Refuse politely: “that is exactly the difficulty.”",
           "Any mention of AI. Park it; AI does not enter until step 8."]},
 2:{obj:"Introduce evidence of mixed quality without saying which is which.",
    table:["Read all six cards aloud at the table.",
           "Mark each card as an observation or a hypothesis, and be ready to defend the call.",
           "Add a card of your own if the case is missing something obvious."],
    watch:["Tables treating every card as fact. Do not correct them yet. Step 5 does it for you."]},
 3:{obj:"Force a classification and an intervention choice before any model exists.",
    table:["Place every card at one of the four depths. Every card must be placed.",
           "Choose one intervention and write what evidence would justify it.",
           "Record the assumption you are making to place the hardest card."],
    watch:["Tables placing everything deep because deep sounds more sophisticated.",
           "Cards left unplaced to avoid committing."]},
 4:{obj:"Make the disagreement visible and specific.",
    table:["Cast one vote per table for the depth at which you would intervene.",
           "Write why, in one line, in your own words rather than the case's words.",
           "List every term your table could not agree on."],
    watch:["Tables changing their vote after hearing another table. Collect all votes before discussion."]},
 5:{obj:"Reframe the difficulty as three governable problems, and capture the room's instinct about automation.",
    table:["Answer the automation question honestly: would you let a model make this call alone?",
           "If your answer is conditional, write the conditions. Those conditions become the HITL protocol in step 13."],
    watch:["A too-quick 'no'. Ask what would have to be true for the answer to be yes."]},
 6:{obj:"Give the room the vocabulary it has just discovered it needs.",
    table:["Reclassify two of your cards using the revealed model, and note what changed.",
           "Write your own one-line definition of each layer in the words your organisation actually uses."],
    watch:["Definitions copied from the screen. The point is a shared vocabulary, not a correct one."]},
 7:{obj:"Build the causal bridge from the chosen depth to a measurable outcome.",
    table:["Complete the chain: need, activities, outputs, outcomes, impact.",
           "Write the assumptions that must hold, and the external factors you do not control.",
           "State the benefit hypothesis in one sentence: if we do X, then Y changes by Z, because of mechanism M."],
    watch:["A benefit hypothesis with no number in it. Push for a baseline and a target, even a rough one."]},
 8:{obj:"Bound the AI. Four contributions, and a clear line where human judgement stays.",
    table:["Tick only the roles the AI genuinely performs here, and write its limit in each case.",
           "Write, explicitly, what the model must never decide on its own."],
    watch:["Enthusiasm creeping the model into the intervention choice. That line is the one this session exists to hold."]},
 9:{obj:"Confront the model with what the architecture actually asserts.",
    table:["On the Golden thread tab, check the layers your table owns.",
           "Say plainly whether the resolved elements match what you would have named."],
    watch:["Tables reading red as blame. It is a worklist."]},
 10:{obj:"Distribute ownership of the four quality pillars.",
    table:["Each member takes a primary pillar and names themselves in it.",
           "Name a cross-reviewer for each pillar from a different discipline."],
    watch:["Everyone choosing the pillar they already own at work. Encourage one deliberate stretch."]},
 11:{obj:"Attach the eight dimensions to owners and expose the overlaps.",
    table:["Place each of your dimensions under a pillar and name its lead.",
           "Where two tables claim the same dimension, resolve it now."],
    watch:["Dimensions nobody wants, usually monitoring and cost. Assign them anyway."]},
 12:{obj:"Fix the business case: beneficiary, outcome, KPI, baseline, target, mechanism, cost.",
    table:["Executive and programme voices lead; write numbers, not adjectives.",
           "Answer the no-AI alternative honestly before writing the value-for-money question."],
    watch:["A target with no baseline. Without one there is nothing to evaluate against later."]},
 13:{obj:"Specify a governable decision node and the human control around it.",
    table:["Write all six elements: inputs, permissible outputs, confidence threshold, explanation, escalation, override.",
           "Separate the human decision role from the human oversight role. They are not the same seat.",
           "Name who could be misclassified, excluded or harmed."],
    watch:["A threshold with no stated consequence below it. That is where silent automation happens."]},
 14:{obj:"Bound the data supply and the evidence that will be retained.",
    table:["Data and AI voices state what the use case may and may not consume.",
           "Records and governance voices state what is retained, where, and for how long.",
           "Name the accountable Responsible-AI owner."],
    watch:["A product boundary that quietly admits person-level data the decision does not need."]},
 15:{obj:"Recompute four results by hand and discover why records cannot be trusted.",
    table:["Recompute independently. Do not look at the recorded column.",
           "Report your verdict before the reveal."],
    watch:["Tables that finish suspiciously fast. Ask them to show the arithmetic."]},
 16:{obj:"Test each gate against the evidence actually in the room.",
    table:["Each pillar owner answers for their gate: sufficient, or not.",
           "If not, state precisely what evidence would close it and who would produce it."],
    watch:["Gates closed on the strength of work that is planned rather than done."]},
 17:{obj:"Take a decision, with conditions, that the room will defend.",
    table:["Decide in thirty seconds. Stop, pilot or scale.",
           "Write the rationale and the conditions before hearing the model answer."],
    watch:["Tables waiting to see where the room is going. Collect all votes simultaneously."]},
 18:{obj:"Close the loop and name what leaves the room.",
    table:["Each table names one commitment: who, what, by when.",
           "Confirm your findings appear in the exported pack."],
    watch:["Commitments without dates. A date is what makes it a commitment."]}
};

var ROLE_CARDS = [
 {role:"Strategy and executive voice", pillar:"Business Quality &middot; Records Quality",
  bring:"Authority over what value counts, what risk is acceptable, and what the organisation will fund.",
  leads:"Steps 12, 16 and 17: the business case, the gates and the decision.",
  ask:"“What happens to the outcome we care about if this is wrong?”",
  prevents:"A technically excellent evaluation of something the organisation does not need.",
  insist:["A benefit hypothesis with a baseline and a target.",
          "A stated cost ceiling per decision.",
          "A decision that carries a written rationale and a named approver."]},
 {role:"Programme, IMM and M&E voice", pillar:"Business Quality &middot; Decision Quality",
  bring:"The theory of change, the intervention logic, and how outcomes are actually measured in the field.",
  leads:"Steps 3, 7 and 12: classification, the causal chain and the outcome definition.",
  ask:"“Through what mechanism does this change the outcome, and how would we see it?”",
  prevents:"A model that optimises a proxy nobody in the programme recognises.",
  insist:["Assumptions and external factors written down, not implied.",
          "Measurement that reaches decision-makers while it can still change something.",
          "A depth of intervention the evidence can actually support."]},
 {role:"Data and AI voice", pillar:"Data Quality &middot; Decision Quality",
  bring:"Semantics, data products, contracts, model performance, calibration and monitoring.",
  leads:"Steps 13, 14 and 15: the decision spec, the data boundary and the eval recomputation.",
  ask:"“Is this evidence representative, lawful, semantically clear and fit for this decision?”",
  prevents:"A decision built on data that is fresh, complete and about something else.",
  insist:["Every critical data element bound to a governed business term.",
          "Recomputed statuses, never inherited ones.",
          "A monitoring plan with thresholds and a rollback."]},
 {role:"Recorder and evidence custodian", pillar:"Records Quality",
  bring:"Discipline. You are the only person at the table who types into the canvas.",
  leads:"Every step: you own the record of what your table decided.",
  ask:"“Would this sentence survive being read by an auditor in a year?”",
  prevents:"A workshop that felt productive and left nothing behind.",
  insist:["One sentence per finding, in the table's own words.",
          "Disagreement recorded as disagreement, not smoothed into consensus.",
          "Every owner captured as a person, not a department."]}
];

var ROLE_NOTE = "Four seats per table is the minimum. For a Deep assessment (regulated, fiduciary, or high-harm decisions) add a fifth: a Responsible AI, risk or safeguarding voice who owns fairness, accountability and retention, and who leads steps 10, 14 and 16 alongside the recorder.";
</script>
