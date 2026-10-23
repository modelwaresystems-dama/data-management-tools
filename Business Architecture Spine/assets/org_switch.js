/* ============================================================================
   Org resolver — public Modelware Spine.
   Modelware is the baseline: data.js already carries the Modelware GENERIC +
   PACK_CONFIG, and the model hydrator renders from MODELWARE_MODEL_SHEETS.
   Client packs live in the private repo and are not loaded here.
   ============================================================================ */
(function(){
  var W=window;
  W.ACTIVE_MODEL_SHEETS = W.MODELWARE_MODEL_SHEETS || W.ACTIVE_MODEL_SHEETS || null;
  if(W.PACK_CONFIG) W.PACK_CONFIG.activeOrg = "modelware";
})();
