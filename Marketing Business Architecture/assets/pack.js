/* ============================================================================
   Nedbank Marketing Pack — shared behaviour (nav, sources, sign-off, panels,
   deep-links, glossary resolver). Depends on data.js (window.GENERIC / PACK_CONFIG).
   No server, no build — pure client-side, works offline from a folder.
   ========================================================================== */
(function(){
  "use strict";
  var CFG = window.PACK_CONFIG;
  var LS = window.localStorage;
  var PACK = window.PACK = {};

  /* ---- source management (only "generic" carries baked-in data for now) --- */
  function currentSourceId(){
    var s = LS.getItem("nbpack.source") || "generic";
    var def = CFG.sources.filter(function(x){return x.id===s;})[0];
    if(!def || !def.available) return "generic";
    return s;
  }
  PACK.source = currentSourceId();
  PACK.setSource = function(id){ LS.setItem("nbpack.source", id); location.reload(); };
  PACK.data = function(){
    /* Generic ships inside the app. Nedbank Public/Private load from the GitHub
       layer (wired later); until then they fall back to the Generic baseline. */
    return window.GENERIC;
  };

  /* ---- lookup maps --------------------------------------------------------- */
  var D = PACK.data();
  var MAP = PACK.MAP = {};
  function idx(arr){ var m={}; (arr||[]).forEach(function(o){m[o.id]=o;}); return m; }
  MAP.SH = idx(D.stakeholders); MAP.VP = idx(D.valuePropositions); MAP.CJ = idx(D.journeys);
  MAP.CAP = idx(D.capabilities); MAP.P = idx(D.processes); MAP.D = idx(D.decisions);
  MAP.KPI = idx(D.kpis); MAP.AI = idx(D.aiUseCases);

  /* ---- helpers ------------------------------------------------------------- */
  PACK.esc = function(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
  PACK.maturityInfo = function(v){
    if(v==null) return {name:"Unrated", color:CFG.unratedColor, v:null};
    var m = CFG.maturityScale.filter(function(x){return x.v===v;})[0];
    return m ? {name:m.name,color:m.color,v:v} : {name:"?",color:CFG.unratedColor,v:v};
  };

  /* ---- chip builders (deep-links) ----------------------------------------- */
  var KIND = { SH:{cls:"sh",map:"SH",name:function(o){return o.name;}},
    VP:{cls:"vp",map:"VP",name:function(o){return o.group;}},
    CJ:{cls:"cj",map:"CJ",name:function(o){return o.name;}},
    CAP:{cls:"cap",map:"CAP",name:function(o){return o.name;}},
    P:{cls:"proc",map:"P",name:function(o){return o.name;}},
    D:{cls:"dec",map:"D",name:function(o){return o.name;}},
    KPI:{cls:"kpi",map:"KPI",name:function(o){return o.theme;}},
    AI:{cls:"ai",map:"AI",name:function(o){return o.name;}} };
  /* infer kind from an id like SH01, VP03, CJ-RET-01, C4 / C4.1, P1/PX1, D1/DX1, KT1, U01 */
  PACK.kindOf = function(id){
    if(/^SH/.test(id))return"SH"; if(/^VP/.test(id))return"VP"; if(/^CJ/.test(id))return"CJ";
    if(/^C\d/.test(id))return"CAP"; if(/^P/.test(id))return"P"; if(/^D/.test(id))return"D";
    if(/^K/.test(id))return"KPI"; if(/^U/.test(id))return"AI"; return null;
  };
  PACK.lookup = function(id){
    var k = PACK.kindOf(id); if(!k) return null;
    if(k==="CAP"){ // capability could be L2 id like C4.1
      var base = id.split(".")[0]; return MAP.CAP[base] || null;
    }
    return MAP[KIND[k].map][id] || null;
  };
  /* chip(id) -> deep-link chip that opens the element's detail on its own page */
  PACK.chip = function(id, labelOverride){
    var k = PACK.kindOf(id); if(!k) return PACK.esc(id);
    var o = PACK.lookup(id);
    var nm = labelOverride || (o?KIND[k].name(o):id);
    var page = ({SH:"business_architecture",VP:"business_architecture",CJ:"customer_journey",
      CAP:"business_architecture",P:"business_architecture",D:"business_architecture",
      KPI:"business_architecture",AI:"ai_usecases"})[k];
    return '<a class="chip '+KIND[k].cls+'" href="'+page+'.html#'+id+'">'+
      '<span class="id">'+PACK.esc(id)+'</span>'+PACK.esc(nm)+'</a>';
  };
  PACK.chips = function(ids,label){
    if(!ids||!ids.length) return "";
    return '<div class="chiprow">'+(label?'<span class="lbl">'+PACK.esc(label)+'</span>':"")+
      ids.map(function(i){return PACK.chip(i);}).join("")+'</div>';
  };
  /* glossary term chip — resolves via configured template, else inert */
  PACK.termChip = function(term){
    var g = PACK.glossary();
    var key = String(term).replace(/\s+/g,"_");
    if(g.enabled && g.baseUrl){
      var url = g.linkTemplate.replace("{base}",g.baseUrl).replace("{key}",encodeURIComponent(key));
      return '<a class="chip term" href="'+PACK.esc(url)+'" target="_blank" rel="noopener">'+PACK.esc(term)+'</a>';
    }
    return '<span class="chip term off" title="Glossary link not configured — set it on the Glossary page">'+PACK.esc(term)+'</span>';
  };
  PACK.termChips = function(terms,label){
    if(!terms||!terms.length) return "";
    return '<div class="chiprow">'+(label?'<span class="lbl">'+PACK.esc(label)+'</span>':"")+
      terms.map(PACK.termChip).join("")+'</div>';
  };

  /* ---- glossary settings (persisted override of the baked default) -------- */
  PACK.glossary = function(){
    var saved = LS.getItem("nbpack.glossary");
    if(saved){ try{ return JSON.parse(saved); }catch(e){} }
    return CFG.glossary;
  };
  PACK.saveGlossary = function(obj){ LS.setItem("nbpack.glossary", JSON.stringify(obj)); };

  /* ---- sign-off store (localStorage; git-history is the real audit trail) -- */
  function soKey(){ return "nbpack.signoff."+PACK.source; }
  PACK.signoff = function(id){
    var all = {}; try{ all = JSON.parse(LS.getItem(soKey())||"{}"); }catch(e){}
    return all[id] || {status:null, vote:null, comment:""};
  };
  PACK.setSignoff = function(id, patch){
    var all = {}; try{ all = JSON.parse(LS.getItem(soKey())||"{}"); }catch(e){}
    all[id] = Object.assign(PACK.signoff(id), patch);
    LS.setItem(soKey(), JSON.stringify(all));
    return all[id];
  };
  PACK.signoffStats = function(ids){
    var s={agreed:0,needs:0,proposed:0,unset:0,total:ids.length};
    ids.forEach(function(id){ var st=PACK.signoff(id).status;
      if(st==="Agreed")s.agreed++; else if(st==="Needs work")s.needs++;
      else if(st==="Proposed")s.proposed++; else s.unset++; });
    return s;
  };
  /* renders an interactive sign-off widget into a container element */
  PACK.signoffWidget = function(el, id, opts){
    opts = opts||{};
    var cur = PACK.signoff(id);
    var statuses = CFG.statuses;
    var html = '<div class="signoff">'+
      '<div class="row"><label>Status</label><div class="segbtns" data-role="status">'+
        statuses.map(function(s){return '<button data-v="'+s+'" class="'+(cur.status===s?"on":"")+'">'+s+'</button>';}).join("")+
      '</div></div>'+
      (opts.maturity!==false ? '<div class="row"><label>Maturity</label><div class="segbtns" data-role="maturity">'+
        CFG.maturityScale.map(function(m){return '<button data-v="'+m.v+'" class="'+(cur.maturity===m.v?"on":"")+'" title="'+m.name+'">'+m.v+'</button>';}).join("")+
      '</div></div>' : '')+
      '<div class="row"><label>Vote</label><div class="vote" data-role="vote">'+
        '<button data-v="up" class="'+(cur.vote==="up"?"on":"")+'">▲ Agree</button>'+
        '<button data-v="down" class="'+(cur.vote==="down"?"on":"")+'">▼ Object</button>'+
      '</div></div>'+
      '<div class="row" style="display:block"><label style="display:block;margin-bottom:4px">Comment</label>'+
        '<textarea data-role="comment" placeholder="Rationale / note (saved locally; a commit in the working repo)">'+PACK.esc(cur.comment)+'</textarea></div>'+
      '<div class="muted" style="font-size:.72rem">Saved to this browser. In the working repo each change is a commit; PR merge is the sign-off gate.</div>'+
    '</div>';
    el.innerHTML = html;
    el.querySelectorAll('[data-role=status] button').forEach(function(b){
      b.onclick=function(){ var v=(PACK.signoff(id).status===b.dataset.v)?null:b.dataset.v;
        PACK.setSignoff(id,{status:v});
        el.querySelectorAll('[data-role=status] button').forEach(function(x){x.classList.toggle("on",x.dataset.v===v);});
        if(opts.onChange)opts.onChange(); };
    });
    var mbtns = el.querySelectorAll('[data-role=maturity] button');
    mbtns.forEach(function(b){ b.onclick=function(){ var v=parseInt(b.dataset.v,10);
      var nv=(PACK.signoff(id).maturity===v)?null:v; PACK.setSignoff(id,{maturity:nv});
      mbtns.forEach(function(x){x.classList.toggle("on",parseInt(x.dataset.v,10)===nv);});
      if(opts.onChange)opts.onChange(); }; });
    el.querySelectorAll('[data-role=vote] button').forEach(function(b){
      b.onclick=function(){ var v=(PACK.signoff(id).vote===b.dataset.v)?null:b.dataset.v;
        PACK.setSignoff(id,{vote:v});
        el.querySelectorAll('[data-role=vote] button').forEach(function(x){x.classList.toggle("on",x.dataset.v===v);});
        if(opts.onChange)opts.onChange(); };
    });
    el.querySelector('[data-role=comment]').oninput=function(){ PACK.setSignoff(id,{comment:this.value}); };
  };
  /* effective maturity = signed-off override, else baked value */
  PACK.effMaturity = function(cap){
    var so = PACK.signoff(cap.id);
    return (so.maturity!=null) ? so.maturity : (cap.maturity!=null?cap.maturity:null);
  };
  PACK.effStatus = function(id, baked){
    var so = PACK.signoff(id); return so.status || baked || null;
  };

  /* ---- sliding panel ------------------------------------------------------ */
  function ensurePanel(){
    if(document.getElementById("nbScrim")) return;
    var s=document.createElement("div"); s.id="nbScrim"; s.className="scrim"; s.onclick=PACK.closePanel;
    var p=document.createElement("div"); p.id="nbPanel"; p.className="panel";
    p.innerHTML='<div class="panel-head"><div><div class="pid" id="nbPid"></div><h3 id="nbPtitle"></h3></div>'+
      '<button class="panel-close" onclick="PACK.closePanel()">×</button></div><div class="panel-body" id="nbPbody"></div>';
    document.body.appendChild(s); document.body.appendChild(p);
  }
  PACK.openPanel = function(id,title,bodyHtml){
    ensurePanel();
    document.getElementById("nbPid").textContent=id||"";
    document.getElementById("nbPtitle").innerHTML=title||"";
    document.getElementById("nbPbody").innerHTML=bodyHtml||"";
    document.getElementById("nbScrim").classList.add("on");
    document.getElementById("nbPanel").classList.add("on");
    if(id) try{history.replaceState(null,"","#"+id);}catch(e){}
  };
  PACK.closePanel = function(){
    var s=document.getElementById("nbScrim"),p=document.getElementById("nbPanel");
    if(s)s.classList.remove("on"); if(p)p.classList.remove("on");
    try{history.replaceState(null,"",location.pathname+location.search);}catch(e){}
  };
  document.addEventListener("keydown",function(e){ if(e.key==="Escape")PACK.closePanel(); });

  /* ---- nav + workbook chips + source selector ----------------------------- */
  PACK.renderNav = function(activeFile){
    var g = PACK.glossary();
    var links = CFG.pages.map(function(p){
      return '<a href="'+p.file+'"'+(p.file===activeFile?' class="active"':'')+'>'+PACK.esc(p.nav)+'</a>';
    }).join("");
    var srcOpts = CFG.sources.map(function(s){
      return '<option value="'+s.id+'"'+(s.id===PACK.source?" selected":"")+(s.available?"":" disabled")+'>'+
        PACK.esc(s.label)+(s.available?"":" — pending")+'</option>';
    }).join("");
    var wb = (PACK._workbooks||[]).map(function(w){
      return '<a class="wbchip'+(w.href?"":" dim")+'"'+(w.href?' href="'+w.href+'" download':'')+'>⭳ '+PACK.esc(w.label)+'</a>';
    }).join("");
    var html =
    '<nav class="nav"><div class="nav-in">'+
      '<div class="nav-top">'+
        '<div class="brand"><span class="dot"></span>Modelware<small>Data Management</small></div>'+
        '<div class="nav-links">'+links+'</div>'+
        '<div class="nav-right"><div class="src-sel"><label>Source</label>'+
          '<select onchange="PACK.setSource(this.value)">'+srcOpts+'</select></div></div>'+
      '</div>'+
      (wb ? '<div class="nav-work"><span class="wl">Workbooks</span>'+wb+'</div>' : '')+
    '</div></nav>';
    document.getElementById("nav").outerHTML = html;
  };
  PACK.setWorkbooks = function(arr){ PACK._workbooks = arr; };

  /* ---- deep-link on load: open panel for #ID if page registers a handler --- */
  PACK.onHash = function(handler){
    PACK._hashHandler = handler;
    function fire(){ var h=location.hash.replace(/^#/,""); if(h && handler) handler(h); }
    window.addEventListener("hashchange",fire); setTimeout(fire,60);
  };

  PACK.footer = function(){
    return '<footer class="pf">'+PACK.esc(CFG.identity)+'  ·  '+PACK.esc(CFG.engagement)+
      '  ·  Client: '+PACK.esc(CFG.client)+'  ·  Generic reference content — self-contained, offline-capable.</footer>';
  };
})();
