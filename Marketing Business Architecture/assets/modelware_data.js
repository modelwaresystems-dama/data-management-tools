/* ============================================================================
   Modelware Systems org pack — config + baked narrative overrides.
   window.ORG.modelware = { config: {...PACK_CONFIG overrides},
                            generic:{...GENERIC baked-section overrides} }
   The org resolver (org_switch.js) merges these when the Modelware source is
   selected. Model arrays come from window.MODELWARE_MODEL_SHEETS via the
   hydrator; this file supplies the config and landing narrative. Modelware has
   no baked glossary, so term-highlighting stays off for this source.
   ========================================================================== */
window.ORG = window.ORG || {};
window.ORG.modelware = {
  config:{
    client:"Modelware Systems",
    identity:"Modelware · Data Management",
    engagement:"Modelware Systems — Whole-Business Architecture (Option C)",
    packName:"Modelware Whole-Business Pack",
    archTitle:"Whole-Business Architecture",
    publishStatus:"Draft — working copy (Modelware Systems Option C, pending sign-off)",
    valueProp:null, capabilityMap:null, processLandscape:null,
    landing:{
      title:"Modelware Systems — Whole-Business Architecture (Option C)",
      lede:"An interactive whole-business architecture pack for Modelware Systems — a data & AI training, consulting, advisory and mentoring company. It traces one golden thread from stakeholders and value propositions, through outcomes, value streams, capabilities and processes, into decisions, information concepts, domain-owned data products and AI use cases, all under one governance and operating model. Built on the Option C coverage pattern: one integrated architecture for Training + Advisory + Consulting + Mentoring + Platforms + Partnerships + Community + Operations.",
      points:[
        "10 stakeholders and value propositions from individual learners to partners, executives and the internal team",
        "13 value streams and 8 journeys spanning demand, sales, onboarding, delivery, advisory, curriculum, community, partners, platforms, finance and governance",
        "24 capabilities, ~33 processes and 20 decisions preserving the existing 14 BPMN/DMN processes and filling the missing business areas",
        "10 data domains, 10 semantic models and 15 domain-owned data products consumed (not defined) by 10 AI use cases"
      ]
    }
  },
  generic:{}
};
