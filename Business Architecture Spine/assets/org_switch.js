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

  // resolve which org config + model to apply (default Nedbank)
  var ORGSEL = null, ORGMODEL = null, ORGID = null;
  if(srcId === "aggpsa" && W.ORG && W.ORG.aggpsa){ ORGSEL = W.ORG.aggpsa; ORGMODEL = W.AGGPSA_MODEL_SHEETS; ORGID = "aggpsa"; }
  else if(srcId === "modelware" && W.ORG && W.ORG.modelware){ ORGSEL = W.ORG.modelware; ORGMODEL = W.MODELWARE_MODEL_SHEETS; ORGID = "modelware"; }

  if(ORGSEL){
    var org = ORGSEL, cfg = org.config || {}, gen = org.generic || {};
    CFG.activeOrg = ORGID;
    // point the hydrator at the selected org model (fall back to Nedbank if missing)
    W.ACTIVE_MODEL_SHEETS = ORGMODEL || W.NB_MODEL_SHEETS;
    // config overrides
    ["client","identity","engagement","publishStatus","vpSegments","archTitle",
     "packName","pageDir","workbooks","copy","ethical","manual","pageTitles",
     "valueProp","capabilityMap","processLandscape","glossary"].forEach(function(k){
      if(cfg[k] != null) CFG[k] = cfg[k];
    });
    if(cfg.landing) CFG.landing = cfg.landing;
    // philanthropy nav-label + page-title overrides (by page file)
    if(CFG.pages){
      CFG.pages.forEach(function(p){
        if(cfg.navLabels && cfg.navLabels[p.file]) p.nav = cfg.navLabels[p.file];
        if(cfg.pageTitles && cfg.pageTitles[p.file]) p.title = cfg.pageTitles[p.file];
      });
    }
    // baked-narrative GENERIC overrides (sections the hydrator does not rebuild)
    Object.keys(gen).forEach(function(k){ G[k] = gen[k]; });
  }
})();
