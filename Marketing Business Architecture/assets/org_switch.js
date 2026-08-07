/* ============================================================================
   Org resolver — selects which organisation the pack renders.
   Runs AFTER data.js (Nedbank baseline GENERIC + PACK_CONFIG), model_all.js
   (NB_MODEL_SHEETS), aggpsa_model_all.js (AGGPSA_MODEL_SHEETS) and aggpsa_data.js
   (window.ORG.aggpsa), and BEFORE model_hydrate.js and pack.js.

   Default / any non-AGGPSA source  → Nedbank (baseline, unchanged).
   Source id "aggpsa"               → apply AGGPSA config + baked-narrative
                                      overrides and point the hydrator at
                                      AGGPSA_MODEL_SHEETS.
   ========================================================================== */
(function(){
  var W = window, CFG = W.PACK_CONFIG, G = W.GENERIC;
  if(!CFG || !G) return;

  var srcId = "generic";
  try { srcId = W.localStorage.getItem("nbpack.source") || "generic"; } catch(e){}

  // Default: Nedbank baseline
  W.ACTIVE_MODEL_SHEETS = W.NB_MODEL_SHEETS;
  CFG.activeOrg = "nedbank";

  if(srcId === "aggpsa" && W.ORG && W.ORG.aggpsa){
    var org = W.ORG.aggpsa, cfg = org.config || {}, gen = org.generic || {};
    CFG.activeOrg = "aggpsa";
    // point the hydrator at the AGGPSA model (fall back to Nedbank if missing)
    W.ACTIVE_MODEL_SHEETS = W.AGGPSA_MODEL_SHEETS || W.NB_MODEL_SHEETS;
    // config overrides
    ["client","identity","engagement","publishStatus"].forEach(function(k){
      if(cfg[k] != null) CFG[k] = cfg[k];
    });
    if(cfg.landing) CFG.landing = cfg.landing;
    // philanthropy nav-label overrides (by page file)
    if(cfg.navLabels && CFG.pages){
      CFG.pages.forEach(function(p){ if(cfg.navLabels[p.file]) p.nav = cfg.navLabels[p.file]; });
    }
    // baked-narrative GENERIC overrides (sections the hydrator does not rebuild)
    Object.keys(gen).forEach(function(k){ G[k] = gen[k]; });
  }
})();
