/* ============================================================================
   Decision outcome handlers — the authorable field that tells the BPMN what each
   decision OUTCOME actually does at the end of the flow: which artefact it creates
   and which party it notifies. Keyed by active org → decision id → outcome label.

   Each handler entry may specify any of:
     create : the artefact / record the outcome produces (positive outcomes)
     notify : the specific party to notify (overrides the derived SIPOC party)
     note   : a short qualifier shown after the action (e.g. "suppressed")

   Anything not specified here falls back to a value DERIVED from the process's
   own model — the notified party defaults to the process's SIPOC customer /
   requesting party, so every outcome still names a real party even when it is not
   authored below. This file only refines wording; it never has to be complete.
   ========================================================================== */
window.DECISION_HANDLERS = {

  aggpsa: {
    // Partnership & Relational Capital (P14) — the example from review
    D9: { "Partner": { create:"partnership agreement", notify:"the partner" },
          "decline": { notify:"the requesting partner", note:"declined" } }
  },

  modelware: {
    // Capture Marketing Contact (P4)
    D004: { "Eligible": { create:"outreach task", notify:"Sales" },
            "suppress": { notify:"the contact", note:"added to suppression list" } },
    // Create & Maintain Student Group (P2)
    D027: { "Create": { create:"student group", notify:"the Trainer" },
            "assign Student Group": { create:"student-group assignment", notify:"the Trainer" } },
    D011: { "Live":       { create:"scheduled session", notify:"the learner" },
            "online":     { create:"scheduled session", notify:"the learner" },
            "self-study": { create:"self-study enrolment", notify:"the learner" } }
  },

  nedbank: {
    // Strategic-fit / permanent filter (D1)
    D1: { "Pursue":  { create:"qualified opportunity", notify:"the relationship manager" },
          "decline": { notify:"the requesting channel", note:"declined" } }
  }

};
