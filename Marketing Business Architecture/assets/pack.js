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

  /* ---- source management --------------------------------------------------
     "generic" ships inside the app. "imported" is a full model reconstructed
     from an Excel workbook (Model I/O page) and kept in localStorage, so the
     whole pack — Navigator, Graph and every page — renders from the imported
     model until it is cleared. Nedbank Public/Private load from the GitHub
     layer (wired later); until then they fall back to Generic. */
  var IMPORT_KEY = "nbpack.model";
  function importedModel(){ try{ var s=LS.getItem(IMPORT_KEY); return s?JSON.parse(s):null; }catch(e){ return null; } }
  PACK.hasImport = function(){ try{ return !!LS.getItem(IMPORT_KEY); }catch(e){ return false; } };
  function currentSourceId(){
    var s = LS.getItem("nbpack.source") || "generic";
    if(s==="imported") return importedModel() ? "imported" : "generic";
    var def = CFG.sources.filter(function(x){return x.id===s;})[0];
    if(!def || !def.available) return "generic";
    return s;
  }
  PACK.source = currentSourceId();
  PACK.setSource = function(id){ LS.setItem("nbpack.source", id); location.reload(); };
  PACK.data = function(){
    if(PACK.source==="imported"){ var m=importedModel(); if(m) return m; }
    return window.GENERIC;
  };
  /* install / clear an imported model (used by the Model I/O page) */
  PACK.setImportedModel = function(model){
    LS.setItem(IMPORT_KEY, JSON.stringify(model)); LS.setItem("nbpack.source","imported");
  };
  PACK.clearImportedModel = function(){
    try{ LS.removeItem(IMPORT_KEY); }catch(e){}
    if((LS.getItem("nbpack.source")||"")==="imported") LS.setItem("nbpack.source","generic");
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
    VP:{cls:"vp",map:"VP",name:function(o){return o.name||o.group;}},
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
  /* Resolve a term (by name or alias) to its EXACT glossary-workbench deep link,
     using the baked term dictionary (term -> [Name, SubjectArea]). Returns "" if
     the term is not a governed glossary term. Falls back to the {base}/{key}
     template only when a base URL is set but the term isn't in the dictionary. */
  PACK.glossaryUrlFor = function(term){
    var g = PACK.glossary();
    var dict = (g && g.terms) || (CFG.glossary && CFG.glossary.terms) || null;
    var norm = String(term==null?"":term).replace(/\s+/g," ").trim().toLowerCase();
    if(dict){
      // the baked dictionary is authoritative: match -> exact deep link, else inert
      if(dict[norm]){
        var d = dict[norm], name = d[0], area = d[1];
        var base = (g.baseUrl || (CFG.glossary&&CFG.glossary.baseUrl) || "");
        return base + "#glossary=" + encodeURIComponent(area) + "&term=" + encodeURIComponent(name);
      }
      return "";
    }
    // no dictionary (e.g. Nedbank): fall back to a configured {base}/{key} template
    if(g && g.enabled && g.baseUrl && g.linkTemplate){
      return g.linkTemplate.replace("{base}",g.baseUrl).replace("{key}",encodeURIComponent(String(term).replace(/\s+/g,"_")));
    }
    return "";
  };
  /* Is this term governed (in the glossary dictionary)? */
  PACK.isGlossaryTerm = function(term){
    var g = PACK.glossary();
    var dict = (g && g.terms) || (CFG.glossary && CFG.glossary.terms) || null;
    if(!dict) return false;
    return !!dict[String(term==null?"":term).replace(/\s+/g," ").trim().toLowerCase()];
  };
  /* Full glossary record for a term: name, subject area, definition, type, deep-link */
  PACK.glossaryInfo = function(term){
    var g = PACK.glossary();
    var dict = (g && g.terms) || (CFG.glossary && CFG.glossary.terms) || null;
    if(!dict) return null;
    var d = dict[String(term==null?"":term).replace(/\s+/g," ").trim().toLowerCase()];
    if(!d) return null;
    return { name:d[0], area:d[1], def:(d[2]||""), type:(d[3]||""), url:PACK.glossaryUrlFor(term) };
  };
  /* glossary term chip — deep-links to the exact term in the workbench, else inert */
  PACK.termChip = function(term){
    var url = PACK.glossaryUrlFor(term);
    if(url){
      return '<a class="chip term" href="'+PACK.esc(url)+'" target="_blank" rel="noopener" title="Open “'+PACK.esc(term)+'” in the Glossary Workbench">'+PACK.esc(term)+'</a>';
    }
    return '<span class="chip term off" title="Not a governed glossary term (or glossary link not configured)">'+PACK.esc(term)+'</span>';
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

  /* ---- Policy Inspector link-out (persisted override of the baked default) -- */
  PACK.policyInspector = function(){
    var saved = LS.getItem("nbpack.policyInspector");
    if(saved){ try{ return JSON.parse(saved); }catch(e){} }
    return CFG.policyInspector || {enabled:false,baseUrl:"",linkTemplate:"{base}?id={key}"};
  };
  PACK.savePolicyInspector = function(obj){ LS.setItem("nbpack.policyInspector", JSON.stringify(obj)); };
  /* build a deep-link URL to the external Policy Inspector app for any element id */
  PACK.policyInspectorUrl = function(key){
    var g = PACK.policyInspector();
    if(!(g.enabled && g.baseUrl)) return "";
    return g.linkTemplate.replace("{base}",g.baseUrl).replace("{key}",encodeURIComponent(key));
  };
  /* an "Open in Inspector ↗" link, or empty string when not configured */
  PACK.policyInspectorLink = function(key,label){
    var url = PACK.policyInspectorUrl(key);
    if(!url) return "";
    return '<a class="pi-extlink" href="'+PACK.esc(url)+'" target="_blank" rel="noopener" title="Open '+PACK.esc(key)+' in your Policy Inspector app">'+PACK.esc(label||"Open in Inspector")+' ↗</a>';
  };

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
    var links = CFG.pages.map(function(p,i){
      return '<a href="'+p.file+'"'+(p.file===activeFile?' class="active"':'')+
        '><span class="ix">'+(i+1)+'</span><span class="lb">'+PACK.esc(p.nav)+'</span></a>';
    }).join("");
    var srcOpts = CFG.sources.map(function(s){
      return '<option value="'+s.id+'"'+(s.id===PACK.source?" selected":"")+(s.available?"":" disabled")+'>'+
        PACK.esc(s.label)+(s.available?"":" — pending")+'</option>';
    }).join("");
    if(PACK.hasImport && PACK.hasImport()){
      srcOpts += '<option value="imported"'+(PACK.source==="imported"?" selected":"")+'>Imported (Excel)</option>';
    }
    /* only show the workbooks row once there are real downloads */
    var wb = (PACK._workbooks||[]).filter(function(w){return w.href;}).map(function(w){
      return '<a class="wbchip" href="'+w.href+'" download>⭳ '+PACK.esc(w.label)+'</a>';
    }).join("");
    var ver = CFG.version ? ('<div class="sb-ver"><span class="vpill">'+PACK.esc(CFG.version)+'</span>'+
      (CFG.built?'<span class="vbuilt">Updated '+PACK.esc(CFG.built)+'</span>':'')+'</div>') : '';
    var html =
    '<nav class="nav sidebar"><div class="sb-in">'+
      '<a class="brand" href="index.html"><span class="dot"></span>'+
        '<span class="bt"><strong>Modelware</strong><small>Data Management</small></span></a>'+
      '<div class="src-sel"><label>Source</label>'+
        '<select onchange="PACK.setSource(this.value)">'+srcOpts+'</select></div>'+
      '<div class="nav-links">'+links+'</div>'+
      (wb ? '<div class="nav-work"><span class="wl">Workbooks</span>'+wb+'</div>' : '')+
      ver+
    '</div></nav>';
    document.getElementById("nav").outerHTML = html;
    PACK.applyOrgTitle();
    PACK.applyOrgCopy();
  };
  PACK.setWorkbooks = function(arr){ PACK._workbooks = arr; };

  /* ---- org-aware document <title> --------------------------------------
     Static page titles read "… — Nedbank Marketing Pack". When another org
     is active, swap the Nedbank suffix for CFG.packName. ------------------ */
  PACK.applyOrgTitle = function(){
    if(!CFG.packName) return;
    try{
      document.title = document.title
        .replace(/Nedbank Marketing Pack/g, CFG.packName)
        .replace(/Nedbank Marketing Data & AI Engagement/g, CFG.engagement||CFG.packName);
    }catch(e){}
  };

  /* ---- org-aware static copy -------------------------------------------
     Elements carrying data-copy="key" get their text replaced when the
     active org supplies CFG.copy[key]. Nedbank supplies no CFG.copy, so the
     baked (Nedbank) text stands. Values containing markup are set as HTML. -- */
  PACK.applyOrgCopy = function(){
    /* static pages hardcode "Client: Nedbank" in the eyebrow — retarget to the
       active client for any org (Nedbank keeps its own name). */
    if(CFG.client && CFG.client!=="Nedbank"){
      var ebs=document.querySelectorAll('.eyebrow');
      for(var j=0;j<ebs.length;j++){
        if(/Client:\s*Nedbank/.test(ebs[j].innerHTML))
          ebs[j].innerHTML = ebs[j].innerHTML.replace(/Client:\s*Nedbank/, 'Client: '+PACK.esc(CFG.client));
      }
    }
    var C = CFG.copy; if(!C) return;
    var els = document.querySelectorAll('[data-copy]');
    for(var i=0;i<els.length;i++){
      var el=els[i], k=el.getAttribute('data-copy');
      if(C[k]==null) continue;
      if(/[<&]/.test(C[k])) el.innerHTML=C[k]; else el.textContent=C[k];
    }
  };
  /* fetch a single org copy override (for JS-built strings), else fallback */
  PACK.copyText = function(key, fallback){
    return (CFG.copy && CFG.copy[key]!=null) ? CFG.copy[key] : fallback;
  };

  /* ---- deep-link on load: open panel for #ID if page registers a handler --- */
  PACK.onHash = function(handler){
    PACK._hashHandler = handler;
    function fire(){ var h=location.hash.replace(/^#/,""); if(h && handler) handler(h); }
    window.addEventListener("hashchange",fire); setTimeout(fire,60);
  };

  PACK.footer = function(){
    var vb = (CFG.version?('  ·  <strong>'+PACK.esc(CFG.version)+'</strong>'):'')+(CFG.built?('  ·  Built '+PACK.esc(CFG.built)):'');
    return '<footer class="pf">'+PACK.esc(CFG.identity)+'  ·  '+PACK.esc(CFG.engagement)+
      '  ·  Client: '+PACK.esc(CFG.client)+vb+'  ·  Self-contained, offline-capable.</footer>';
  };
})();

/* ============================================================================
   v2 ADD-ONS: chain context, breadcrumb rail, reusable renderers
   (value-stream capability heat map, SIPOC, decision table)
   ========================================================================== */
(function(){
  var PACK = window.PACK, CFG = window.PACK_CONFIG, D = PACK.data();

  /* ---- chain context via URL query params (shareable, carries selection) -- */
  PACK._chainKeys = ["sh","vp","bo","vs","vsg","cj","cap","proc","dec","ai","ag","dp","dm"];
  function parseSearch(){
    var q = {}; (location.search.replace(/^\?/,"").split("&")).forEach(function(p){
      if(!p) return; var kv=p.split("="); q[kv[0]]=decodeURIComponent(kv[1]||""); });
    return q;
  }
  /* Chain context persists in localStorage so a selection survives ANY
     navigation — a top-nav link, a cross-page chip, or a full reload — not
     just links that happen to carry the query string. When the URL carries
     chain params they are authoritative (and saved); otherwise we hydrate the
     last-known chain from storage so the breadcrumb never comes up empty. */
  PACK.ctx = function(){
    var url = parseSearch();
    var hasChain = PACK._chainKeys.some(function(k){return url[k];}) || ("step" in url);
    if(hasChain){
      var store={}; PACK._chainKeys.forEach(function(k){ if(url[k]) store[k]=url[k]; });
      try{ window.localStorage.setItem("nbpack.chain", JSON.stringify(store)); }catch(e){}
      return url;
    }
    var s={}; try{ s=JSON.parse(window.localStorage.getItem("nbpack.chain")||"{}"); }catch(e){}
    return Object.assign({}, s, url);
  };
  PACK.resetChain = function(){ try{ window.localStorage.removeItem("nbpack.chain"); }catch(e){} };
  PACK.ctxUrl = function(page, patch){
    patch = patch||{};
    var order = PACK._chainKeys;
    var base = Object.assign({}, PACK.ctx()); delete base.step;
    var setKeys = Object.keys(patch).filter(function(k){return order.indexOf(k)>=0;});
    if(setKeys.length){ // a new selection clears everything downstream to keep the chain consistent
      var from = Math.min.apply(null, setKeys.map(function(k){return order.indexOf(k);}));
      order.slice(from+1).forEach(function(k){ delete base[k]; });
    }
    var c = Object.assign(base, patch);
    var qs = Object.keys(c).filter(function(k){return c[k];}).map(function(k){return k+"="+encodeURIComponent(c[k]);}).join("&");
    return page + (qs?("?"+qs):"");
  };
  PACK.navUrl = function(step, patch){ return PACK.ctxUrl("architecture_navigator.html", Object.assign({step:step}, patch||{})); };

  /* ---- breadcrumb rail (rendered on every page) --------------------------- */
  PACK.chainLabelFor = function(key, c){
    var v = c[key];
    var D = PACK.data();
    function find(arr,id){ return (arr||[]).filter(function(x){return x.id===id;})[0]; }
    if(!v){
      if(key==="bo"  && c.vp) return "business outcomes";
      if(key==="vs"  && c.vp) return "value streams";
      if(key==="vsg" && c.vs) return "value stages";
      if(key==="cap" && c.vsg) return "enabling capabilities";
      if(key==="ag"  && c.ai) return "AI agents";
      if(key==="dm"  && c.dp) return "data domain";
      return null;
    }
    if(key==="sh"){ var o=PACK.MAP.SH[v]; return o?o.name:v; }
    if(key==="vp"){ var o2=PACK.MAP.VP[v]; return o2?(o2.name||o2.group):v; }
    if(key==="bo"){ var b=find(D.businessOutcomes,v); return b?b.name:v; }
    if(key==="vs"){ var s=find(D.valueStreams,v); return s?s.name:v; }
    if(key==="vsg"){ var g=find(D.valueStages,v); return g?g.name:v; }
    if(key==="cj"){ var o5=PACK.MAP.CJ[v]; return o5?o5.lob:v; }
    if(key==="cap"){ var o4=PACK.MAP.CAP[v.split(".")[0]]; return o4?o4.name:v; }
    if(key==="proc"){ var o6=PACK.MAP.P[v]; return o6?o6.name:v; }
    if(key==="dec"){ var o7=PACK.MAP.D[v]; return o7?o7.name:v; }
    if(key==="ai"){ var o8=PACK.MAP.AI[v]; return o8?o8.name:v; }
    if(key==="ag"){ var a=find(D.aiAgents,v); return a?a.name:v; }
    if(key==="dp"){ var o9=PACK.dpById?PACK.dpById(v):null; return o9?o9.name:v; }
    if(key==="dm"){ var dm=PACK.domainById?PACK.domainById(v):null; return dm?dm.name:v; }
    return v;
  };
  PACK.renderBreadcrumb = function(activeKey){
    var host = document.getElementById("breadcrumb"); if(!host) return;
    /* the traceability path is only meaningful on the Navigator, where you build
       it — everywhere else it just added clutter, so hide it there. */
    var file = (location.pathname.split("/").pop()||"index.html").toLowerCase();
    if(file!=="architecture_navigator.html"){ host.innerHTML=""; host.className=""; return; }
    var c = PACK.ctx();
    var steps = '<div class="bc-in"><span class="bc-lead">Traceability</span>'+
      CFG.chain.map(function(s,i){
        var lbl = PACK.chainLabelFor(s.key, c);
        var on = s.key===activeKey;
        var cls = "bc-step"+(on?" on":"")+(lbl?" has":"");
        var inner = '<span class="bc-k">'+PACK.esc(s.label)+'</span>'+(lbl?'<span class="bc-v">'+PACK.esc(lbl)+'</span>':'');
        var el = '<a class="'+cls+'" href="'+PACK.navUrl(s.key)+'">'+inner+'</a>';
        return (i?'<span class="bc-sep">›</span>':'')+el;
      }).join("")+'</div>';
    host.className = "breadcrumb"; host.innerHTML = '<div class="bc-row">'+steps+'</div>';
    /* keep the active step in view when the chain is deep enough to scroll */
    try{
      var bcin = host.querySelector(".bc-in"), act = host.querySelector(".bc-step.on");
      if(bcin && act){ var want = act.offsetLeft - bcin.clientWidth + act.offsetWidth + 40;
        bcin.scrollLeft = Math.max(0, want); }
    }catch(e){}
  };

  /* ---- attention helpers --------------------------------------------------- */
  PACK.attnInfo = function(k){
    var a = (CFG.attentionScale||[]).filter(function(x){return x.k===k;})[0];
    return a? {k:a.k,color:a.color} : {k:"—",color:CFG.unratedColor};
  };
  PACK.effAttention = function(capId){
    var so = PACK.signoff(capId); if(so && so.attention) return so.attention;
    return (D.capAttention||{})[capId] || null;
  };

  /* ---- generic capability panel (reusable) -------------------------------- */
  PACK.openCapPanel = function(capId){
    var c = PACK.MAP.CAP[(capId||"").split(".")[0]]; if(!c) return;
    var m = PACK.maturityInfo(PACK.effMaturity(c));
    var a = PACK.attnInfo(PACK.effAttention(c.id));
    var kids = (c.children||[]).map(function(k){return '<span class="chip cap" style="cursor:default"><span class="id">'+k.id+'</span>'+PACK.esc(k.name)+'</span>';}).join(" ");
    var body =
      '<div class="def">'+PACK.esc(c.def)+'</div>'+
      '<div class="chiprow" style="margin:6px 0"><span class="pill" style="font-size:.72rem">Attention: <b style="color:'+a.color+'">'+a.k+'</b></span>'+
        '<span class="pill" style="font-size:.72rem">Maturity: '+(m.v==null?"Unrated":m.v+" "+m.name)+'</span>'+(c.ext?'<span class="pill" style="font-size:.72rem">Extension</span>':'')+'</div>'+
      '<h4>Level 2 / 3</h4><div class="chiprow">'+(kids||'<span class="muted">—</span>')+'</div>'+
      '<div style="margin-top:14px"><a class="btn ghost" href="'+PACK.ctxUrl("business_architecture.html",{cap:c.id})+'">Open in capability map ›</a></div>';
    PACK.openPanel(c.id, PACK.esc(c.name), body);
  };

  /* ---- value-stream capability heat map (capabilities under a VP) --------
     Renders each journey mapped to the value proposition as a value stream:
     stage chevrons across the top, capability tiles beneath each stage,
     coloured by attention or maturity (toggle).                            */
  PACK.valueStreamHeat = function(host, vpId, opts){
    opts = opts||{}; var mode = opts.mode || (PACK._vsMode||"attention"); PACK._vsMode = mode;
    host._vsOpts = opts; // remember opts (incl. journeyHref) so the mode toggle keeps them
    var vp = PACK.MAP.VP[vpId]; if(!vp){ host.innerHTML='<p class="muted">Select a value proposition.</p>'; return; }
    var jids = vp.journeys && vp.journeys.length ? vp.journeys : [];
    var legend = (mode==="attention")
      ? (CFG.attentionScale.map(function(a){return '<span class="sw"><i style="background:'+a.color+'"></i>'+a.k+'</span>';}).join(""))
      : (CFG.maturityScale.map(function(m){return '<span class="sw"><i style="background:'+m.color+'"></i>'+m.v+' '+m.name+'</span>';}).join("")+'<span class="sw"><i style="background:'+CFG.unratedColor+'"></i>Unrated</span>');
    var head = '<div class="vs-controls"><div class="seg2">'+
        '<button class="'+(mode==="attention"?"on":"")+'" onclick="PACK._vsSet(\''+vpId+'\',\'attention\',\''+host.id+'\')">Attention</button>'+
        '<button class="'+(mode==="maturity"?"on":"")+'" onclick="PACK._vsSet(\''+vpId+'\',\'maturity\',\''+host.id+'\')">Maturity</button>'+
      '</div><div class="legend">'+legend+'</div></div>';
    var streams = jids.map(function(jid){
      var j = PACK.MAP.CJ[jid]; if(!j) return "";
      var stageCols = j.stages.map(function(s){
        var tiles = (s.capabilities||[]).map(function(capId){
          var c=PACK.MAP.CAP[capId]; if(!c) return "";
          var col = (mode==="attention") ? PACK.attnInfo(PACK.effAttention(capId)).color : PACK.maturityInfo(PACK.effMaturity(c)).color;
          var badge = (mode==="attention") ? PACK.effAttention(capId) : (function(){var v=PACK.effMaturity(c);return v==null?"—":v;})();
          return '<div class="vs-cap" style="background:'+col+'" onclick="PACK.openCapPanel(\''+capId+'\')" title="'+PACK.esc(c.name)+'">'+
            '<span class="vc-id">'+capId+'</span><span class="vc-n">'+PACK.esc(c.name)+'</span><span class="vc-b">'+badge+'</span></div>';
        }).join("");
        return '<div class="vs-col"><div class="vs-stage">'+PACK.esc(s.stage)+'</div><div class="vs-tiles">'+(tiles||'<div class="vs-empty">—</div>')+'</div></div>';
      }).join("");
      var jhref = opts.journeyHref ? opts.journeyHref(jid) : ("customer_journey.html#"+jid);
      var jlink = '<a class="chip cj" href="'+jhref+'"><span class="id">'+jid+'</span>'+PACK.esc(j.name)+'</a>';
      return '<div class="vs-stream"><div class="vs-title">'+jlink+' <span class="muted" style="font-size:.82rem">value stream</span></div>'+
        '<div class="vs-grid">'+stageCols+'</div></div>';
    }).join("");
    host.innerHTML = head + (streams || '<p class="muted">No journeys mapped to this value proposition.</p>');
  };
  PACK._vsSet = function(vpId, mode, hostId){ PACK._vsMode=mode; var host=document.getElementById(hostId);
    var prev=(host&&host._vsOpts)||{}; PACK.valueStreamHeat(host, vpId, Object.assign({}, prev, {mode:mode})); };

  /* ---- SIPOC renderer ------------------------------------------------------ */
  /* ---- Process landscape (DERIVED for Modelware) ------------------------------
     Modelware carries a ProcessCatalogue (phase per process); when present we build
     the landscape from the org's OWN value chain instead of the baked Nedbank one:
     a Steering band of the strategy / governance processes, a Core band of the seven
     operational phases, and an Enabling band of the support processes. Nedbank and
     AGGPSA keep their baked PACK_CONFIG.processLandscape. ------------------------- */
  PACK.deriveProcessLandscape = function(){
    var D=PACK.data(); var cat=D.processCatalogue;
    if(!cat || !cat.length) return null;                 // only Modelware has it
    var ai={}; (D.processSteps||[]).forEach(function(s){ if(s.execType==="AIS"||s.execType==="AIE") ai[s.process]=1; });
    var CORE=["Planning & Setup","Marketing","Sales","Administration","Training","Completion","Follow-up & Operations"];
    var STEER=["P66","P67","P53","P63","P68"], steerSet={}; STEER.forEach(function(id){steerSet[id]=1;});
    var byId={}; cat.forEach(function(p){ byId[p.id]=p; });
    var byPhase={}; cat.forEach(function(p){ (byPhase[p.phase]=byPhase[p.phase]||[]).push(p); });
    var steering=STEER.map(function(id){ return byId[id]; }).filter(Boolean)
      .map(function(p){ return {id:p.id,name:p.name}; });
    var core=CORE.map(function(ph,i){ return {domain:(i+1)+" · "+ph, phase:ph,
      procs:(byPhase[ph]||[]).map(function(p){ return {id:p.id,name:p.name,ai:!!ai[p.id]}; })}; });
    var enabling=(byPhase["Enabling & Support"]||[]).filter(function(p){return !steerSet[p.id];})
      .map(function(p){ return {id:p.id,name:p.name,type:(ai[p.id]?"ai":"support")}; });
    return {streams:["All"].concat(CORE), steering:steering, core:core, enabling:enabling, derived:true};
  };
  /* Landscape tab filter — focus the Core band on one value-chain phase (or All) */
  PACK.plFilter = function(el){
    var ph=el.getAttribute("data-ph"), tabs=el.parentElement;
    var host=tabs.parentElement, cols=[].slice.call(host.querySelectorAll(".core-col"));
    // only filter when the tab maps to a real column phase (Modelware). For a baked
    // lifecycle that doesn't map to the columns (Nedbank), leave the band untouched.
    if(ph!=="All" && !cols.some(function(c){return c.getAttribute("data-ph")===ph;})) return;
    [].forEach.call(tabs.querySelectorAll(".plt"), function(t){ t.classList.toggle("on", t===el); });
    var vis=0;
    cols.forEach(function(c){ var show=(ph==="All" || c.getAttribute("data-ph")===ph); c.style.display=show?"":"none"; if(show)vis++; });
    var grid=host.querySelector(".core-cols"); if(grid) grid.style.gridTemplateColumns="repeat("+Math.max(1,vis)+",1fr)";
  };

  /* ---- SIPOC ------------------------------------------------------------------
     For processes that carry a step-level model (Modelware spec processes with a
     processActors map), the SIPOC is DERIVED from the process's own steps so every
     band aligns with the Main Flow: suppliers/customers from the actor map (split by
     who feeds the process vs. who receives its outputs), inputs from the Required
     Information, outputs from the concept end-states + evidence the steps produce.
     Processes with a curated baked SIPOC (Nedbank / AGGPSA) keep it. --------------- */
  function _reEsc(t){ return (t||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
  PACK.deriveSIPOC = function(procId, p){
    var pa=(D.processActors||{})[procId]; if(!pa||!pa.length) return null;
    var steps=(D.processSteps||[]).filter(function(s){return s.process===procId;}).sort(function(a,b){return a.seq-b.seq;});
    var infoItems=(D.processInfoItems||{})[procId]||[];
    // ---- inputs: the Required Information the steps consume ----
    var inputs=[], iSeen={};
    infoItems.forEach(function(x){ var l=x.item||x.concept; if(l&&!iSeen[l]){iSeen[l]=1; inputs.push(l);} });
    // ---- outputs: distinct concept end-states + the process's evidence output ----
    var outputs=[], oSeen={};
    steps.forEach(function(s){ (s.outConcepts||[]).forEach(function(c){ if(!c)return;
      var l=c+(s.toState?" ("+s.toState+")":""); if(!oSeen[l]){oSeen[l]=1; outputs.push(l);} }); });
    var ev=(D.processEvidence||{})[procId]; if(ev && !oSeen[ev]){ oSeen[ev]=1; outputs.push(ev); }
    // ---- suppliers vs customers, split from the actor map by information flow ----
    var deliver=/(available|deliver|provide|provided|issue|issued|publish|notif|inform|hand[ -]?over|route|sent|report|link|for use by|for sales|for marketing)/i;
    function isRecipient(a){
      if(a.type==="External" && /custom|client|student|learner|applicant|benefici|public|attendee|participant|delegate/i.test(a.actor)) return true;
      var re=new RegExp("\\b"+_reEsc((a.actor||"").toLowerCase())+"\\b");
      return steps.some(function(st){ var t=((st.name||"")+" "+(st.post||"")).toLowerCase(); return re.test(t)&&deliver.test(t); });
    }
    var suppliers=[], customers=[];
    pa.forEach(function(a){
      if(isRecipient(a)) customers.push(a);
      else if(a.raci==="Responsible") { /* performer — shown in the Process band */ }
      else suppliers.push(a);
    });
    // fallbacks so no band is empty
    if(!customers.length) customers=pa.filter(function(a){return a.type==="External";});
    if(!customers.length) customers=pa.filter(function(a){return a.raci==="Responsible";});
    if(!suppliers.length) suppliers=pa.filter(function(a){return a.type==="System"||a.type==="External";});
    if(!suppliers.length) suppliers=pa.filter(function(a){return a.raci==="Responsible";});
    return {suppliers:suppliers, inputs:inputs, outputs:outputs, customers:customers, derived:true};
  };
  PACK.renderSIPOC = function(host, procId){
    var p = PACK.MAP.P[procId];
    if(!p){ host.innerHTML='<p class="muted">Select a process.</p>'; return; }
    var baked = (D.processSIPOC||{})[procId];
    var s = PACK.deriveSIPOC(procId, p) || baked;
    if(!s){ host.innerHTML='<p class="muted">Select a process.</p>'; return; }
    function party(x){
      if(x.sh) return PACK.chip(x.sh, x.l);              // baked stakeholder chip
      var nm=x.actor||x.l||x;                            // derived actor
      var tag=(x.type&&x.type!=="Internal")?'<b style="font-size:.58rem;text-transform:uppercase;letter-spacing:.03em;opacity:.65;margin-right:4px">'+PACK.esc(x.type)+'</b>':'';
      return '<span class="chip term off">'+tag+PACK.esc(nm)+'</span>';
    }
    // PROCESS steps: use the process's actual Main Flow (sheet 204) when present so
    // the SIPOC always matches the "Main Flow · Process Steps" section.
    var _mf=(D.processMainFlow||{})[procId];
    var stepLabels = (_mf&&_mf.length)
      ? _mf.slice().sort(function(a,b){return a.no-b.no;}).map(function(x){return x.step;})
      : (s.steps||[]);
    var bands = [
      {k:"SUPPLIERS", cls:"sup", body:'<div class="chiprow">'+(s.suppliers||[]).map(party).join("")+'</div>'},
      {k:"INPUTS",    cls:"inp", body:'<div class="siw">'+(s.inputs||[]).map(function(i){return '<span class="sitag">'+PACK.esc(i)+'</span>';}).join("")+'</div>'},
      {k:"PROCESS",   cls:"prc", body:'<div class="steps">'+'<span class="stp start">'+PACK.esc(p.name)+'</span>'+stepLabels.map(function(st,i){return '<span class="stp">'+(i+1)+'. '+PACK.esc(st)+'</span>';}).join("")+'</div>'},
      {k:"OUTPUTS",   cls:"out", body:'<div class="siw">'+(s.outputs||[]).map(function(o){return '<span class="sitag">'+PACK.esc(o)+'</span>';}).join("")+'</div>'},
      {k:"CUSTOMERS", cls:"cus", body:'<div class="chiprow">'+(s.customers||[]).map(party).join("")+'</div>'}
    ];
    var cross = '<div class="sipoc-cross"><span class="lbl">Capabilities</span>'+PACK.chips(p.capabilities||[]).replace(/^<div class="chiprow">|<\/div>$/g,"")+'</div>';
    host.innerHTML = '<div class="sipoc">'+bands.map(function(b){
      return '<div class="sipoc-band"><div class="sipoc-k '+b.cls+'">'+b.k+'</div><div class="sipoc-b">'+b.body+'</div></div>';
    }).join("")+'</div>'+
      '<div class="sipoc-meta"><span class="muted">Participants:</span> '+PACK.esc(p.participants||"—")+'</div>'+cross;
  };

  /* ---- Decision table (DMN-style) ----------------------------------------- */
  PACK.renderDecisionTable = function(host, decId){
    var d = PACK.MAP.D[decId]; var rules = (D.decisionRules||{})[decId] || [];
    if(!d){ host.innerHTML='<p class="muted">Select a decision.</p>'; return; }
    var rows = rules.map(function(r,i){return '<tr><td class="dc-i">R'+(i+1)+'</td><td>'+PACK.esc(r.when)+'</td><td class="dc-then">'+PACK.esc(r.then)+'</td></tr>';}).join("");
    host.innerHTML =
      '<div class="dmn-head"><div><span class="mono" style="color:var(--c-dec);font-weight:700">'+d.id+'</span> <strong>'+PACK.esc(d.name)+'</strong></div>'+
        '<span class="status-pill" style="background:#f8e9f5;color:var(--c-dec)">Owner: '+PACK.esc(d.owner)+'</span></div>'+
      '<div class="dmn-io"><div><span class="lbl">Inputs</span> '+PACK.esc(d.inputs)+'</div><div><span class="lbl">Outcome</span> '+PACK.esc(d.outcome)+'</div></div>'+
      '<div class="tbl-wrap"><table class="tbl dmn"><tr><th>Rule</th><th>When (condition)</th><th>Then (outcome)</th></tr>'+
        (rows||'<tr><td class="dc-i">R1</td><td>'+PACK.esc(d.rules)+'</td><td class="dc-then">'+PACK.esc(d.outcome)+'</td></tr>')+'</table></div>';
  };

})();

/* ============================================================================
   v4 ADD-ONS: Data Product helpers + reusable card renderer
   ========================================================================== */
(function(){
  var PACK = window.PACK, D = PACK.data();
  PACK.dpById = function(id){ return (D.dataProducts||[]).filter(function(x){return x.id===id;})[0]; };
  PACK.domainById = function(id){ return (D.dataDomains||[]).filter(function(x){return x.id===id;})[0]; };
  /* data products required by an AI use-case: those that serve it directly, or
     that realise one of its required CDP services */
  PACK.dataProductsForAI = function(aiId){
    var svc = (D.aiCdp && D.aiCdp[aiId] ? D.aiCdp[aiId].services : []) || [];
    return (D.dataProducts||[]).filter(function(p){
      return (p.ai||[]).indexOf(aiId)>=0 || (p.cdp||[]).some(function(s){return svc.indexOf(s)>=0;});
    });
  };
  PACK.dpCardHtml = function(dp){
    var dom = PACK.domainById(dp.domain) || {name:dp.domain, owner:"—", steward:"—"};
    var cdpChips = (dp.cdp||[]).map(function(s){ return '<a class="chip proc" href="hyperpersonalisation_cdp.html"><span class="id">'+PACK.esc(s)+'</span></a>'; }).join("");
    var aiChips  = (dp.ai||[]).map(function(u){ return PACK.chip(u); }).join("");
    return '<div class="dpcard">'+
      '<div class="dp-top"><span class="dp-dom" title="'+PACK.esc(dom.name)+'">'+PACK.esc(dom.name)+'</span><span class="dp-id">'+PACK.esc(dp.id)+'</span></div>'+
      '<div class="dp-name">'+PACK.esc(dp.name)+'</div>'+
      '<p class="dp-desc">'+PACK.esc(dp.desc)+'</p>'+
      '<div class="dp-owner"><span>Owner: <b>'+PACK.esc(dom.owner)+'</b></span><span>Steward: <b>'+PACK.esc(dom.steward)+'</b></span></div>'+
      (cdpChips?'<div class="chiprow"><span class="lbl">'+PACK.copyText("dpRealisesCdp","Realises CDP")+'</span>'+cdpChips+'</div>':'')+
      (aiChips?'<div class="chiprow"><span class="lbl">Serves AI</span>'+aiChips+'</div>':'')+
      (dp.terms&&dp.terms.length?PACK.termChips(dp.terms,"Terms"):'')+
    '</div>';
  };
})();

/* ============================================================================
   v5 ADD-ONS: Data Product detail panel showing the full Data Contract
   ========================================================================== */
(function(){
  var PACK = window.PACK, D = PACK.data(), CFG = window.PACK_CONFIG;
  PACK.dataContract = function(dpId){
    var dp = PACK.dpById(dpId); if(!dp) return null;
    var c = (D.dataContracts||{})[dpId] || {};
    var def = D.contractDefaults || {sla:{},terms:{},quality:[]};
    var dom = PACK.domainById(dp.domain) || {};
    return {
      dp:dp, domain:dom,
      purpose: c.purpose || dp.desc,
      sources: c.sources || [],
      classification: c.classification || "Confidential",
      schema: c.schema || [],
      sla: Object.assign({}, def.sla, c.slaOverride||{}),
      terms: def.terms,
      quality: (def.quality||[]).concat(c.extraQuality||[]),
      consumersAI: dp.ai || [],
      realisesCDP: dp.cdp || [],
      terms_list: dp.terms || []
    };
  };
  PACK.ragDot = function(rag){
    var c = rag==="Green"?"#16a34a":(rag==="Amber"?"#d97706":(rag==="Red"?"#dc2626":"#94a3b8"));
    return '<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:'+c+';margin-right:5px;vertical-align:middle"></span>';
  };
  PACK.ragPill = function(rag){
    var m={Green:["#dcfce7","#166534","#bbf7d0"],Amber:["#fef9c3","#854d0e","#fde68a"],Red:["#fee2e2","#b91c1c","#fecaca"]};
    var c=m[rag]||["#f1f5f9","#475569","#e2e8f0"];
    return '<span style="display:inline-block;font-size:.66rem;font-weight:800;border-radius:6px;padding:2px 8px;background:'+c[0]+';color:'+c[1]+';border:1px solid '+c[2]+'">'+PACK.esc(rag)+'</span>';
  };
  // the DQ control + six-dimension scorecard for a data product that supplies decisions/agents
  PACK.dqScorecardHtml = function(dpId){
    var D=PACK.data();
    var ctl=(D.dataProductDQ||[]).filter(function(x){return x.dp===dpId;})[0];
    var sc=(D.dataProductScorecard||{})[dpId]||[];
    if(!ctl && !sc.length) return "";
    var rows=sc.map(function(s){
      return '<tr><td>'+PACK.esc(s.dim)+'</td><td class="muted">'+PACK.esc(s.target)+'</td>'+
        '<td><strong>'+PACK.esc(s.score)+'</strong></td><td>'+PACK.ragPill(s.rag)+'</td>'+
        '<td class="muted" style="white-space:nowrap">'+PACK.esc(s.trend)+'</td></tr>';
    }).join("");
    var head = ctl ? ('<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:2px 0 8px">'+
        PACK.ragPill(ctl.rag)+'<strong>Overall '+PACK.esc(ctl.score)+'</strong>'+
        '<span class="muted" style="font-size:.78rem">Control '+PACK.esc(ctl.control)+' · '+PACK.esc(ctl.freq)+' · governed by '+PACK.esc(ctl.policy)+'</span></div>'+
        (ctl.decisions&&ctl.decisions.length?'<div class="muted" style="font-size:.78rem;margin-bottom:2px">Supplies decisions: '+ctl.decisions.map(PACK.esc).join(", ")+'</div>':'')+
        (ctl.agents&&ctl.agents.length?'<div class="muted" style="font-size:.78rem;margin-bottom:6px">Supplies AI agents: '+ctl.agents.map(PACK.esc).join(", ")+'</div>':'')) : '';
    return '<h4>Data quality scorecard</h4>'+head+
      '<table class="tbl"><tr><th>Dimension</th><th>Target</th><th>Score</th><th>RAG</th><th>Trend</th></tr>'+rows+'</table>';
  };
  // the CDE data-quality rules that are enforceable clauses of this contract
  PACK.contractDqRulesHtml = function(dpId){
    var D=PACK.data();
    var rules=(D.contractDQRules||{})[dpId]||[];
    if(!rules.length) return '';
    function sev(s){ var c= /High/i.test(s)?["#fee2e2","#b91c1c"]:(/Medium/i.test(s)?["#fef9c3","#854d0e"]:["#f1f5f9","#475569"]);
      return '<span style="display:inline-block;font-size:.64rem;font-weight:800;border-radius:6px;padding:2px 7px;background:'+c[0]+';color:'+c[1]+'">'+PACK.esc(s)+'</span>'; }
    var rows=rules.map(function(r){
      return '<tr><td><a href="critical_data_elements.html" class="mono" style="color:#0e7490">'+PACK.esc(r.cde)+'</a> '+PACK.esc(r.cdeName)+'</td>'+
        '<td>'+PACK.esc(r.dims)+' <span class="muted">— '+PACK.esc(r.threshold)+'</span></td>'+
        '<td>'+sev(r.severity)+'</td><td class="muted">'+PACK.esc(r.enforcement)+'</td>'+
        '<td class="mono" style="font-size:.72rem">'+PACK.esc(r.rule)+'</td></tr>';
    }).join("");
    return '<p class="tight muted" style="font-size:.8rem;margin:0 0 6px">'+rules.length+' Critical Data Element quality rules are enforceable clauses of this contract, governed by the Data Quality policy (POL-DQ). The producer commits to them; a breach triggers the stated enforcement.</p>'+
      '<table class="tbl"><tr><th>Critical Data Element</th><th>Quality rule</th><th>Severity</th><th>Enforcement</th><th>Rule ID</th></tr>'+rows+'</table>';
  };
  // consumer map — AI use-cases that consume this product, with access + criticality
  PACK.dpConsumersHtml = function(dp){
    var cons = (dp && dp.consumers) || [];
    if(!cons.length) return '<div class="muted" style="font-size:.82rem">No AI use-case consumers registered.</div>';
    function critPill(c){ var m={High:["#fee2e2","#b91c1c"],Medium:["#fef9c3","#854d0e"],Low:["#f1f5f9","#475569"]}; var x=m[c]||m.Low;
      return '<span style="font-size:.62rem;font-weight:800;border-radius:5px;padding:1px 6px;background:'+x[0]+';color:'+x[1]+'">'+PACK.esc(c)+'</span>'; }
    var rows = cons.map(function(c){
      return '<tr><td>'+PACK.chip(c.uc)+'</td>'+
        '<td>'+critPill(c.crit)+'</td><td class="muted" style="white-space:nowrap">'+PACK.esc(c.need||"—")+'</td>'+
        '<td class="muted">'+PACK.esc(c.access||"—")+'</td><td class="mono" style="font-size:.72rem">'+PACK.esc(c.contract||"")+'</td></tr>';
    }).join("");
    return '<table class="tbl"><tr><th>AI use-case (consumer)</th><th>Criticality</th><th>Timeliness need</th><th>Access mode</th><th>Contract</th></tr>'+rows+'</table>';
  };
  // data assets that make up this product — output ports vs internal processing
  PACK.dpAssetsHtml = function(dpId){
    var assets = (PACK.data().dataAssets||[]).filter(function(a){return a.dp===dpId;});
    if(!assets.length) return '';
    var rows = assets.map(function(a){
      var isPort = /output/i.test(a.port||"");
      var portPill = '<span style="font-size:.62rem;font-weight:800;border-radius:5px;padding:1px 6px;background:'+(isPort?"#e0f2fe":"#f1f5f9")+';color:'+(isPort?"#075985":"#475569")+'">'+PACK.esc(a.port||"Internal")+'</span>';
      return '<tr><td class="mono">'+PACK.esc(a.name)+'</td><td class="muted">'+PACK.esc(a.type)+' · '+PACK.esc(a.layer)+'</td>'+
        '<td>'+portPill+'</td><td class="muted">'+PACK.esc(a.platform||"—")+'</td><td class="muted" style="white-space:nowrap">'+PACK.esc(a.refresh||"—")+'</td></tr>';
    }).join("");
    return '<h4>Data assets &amp; output ports</h4>'+
      '<p class="muted tight" style="font-size:.8rem;margin:0 0 6px">The physical assets this product is built from. <strong>Output Port</strong> assets are the governed, exposed interface consumers read; <strong>Internal</strong> assets are processing-only.</p>'+
      '<table class="tbl"><tr><th>Asset</th><th>Type · layer</th><th>Port role</th><th>Platform</th><th>Refresh</th></tr>'+rows+'</table>';
  };
  PACK.openDataProductPanel = function(dpId){
    var k = PACK.dataContract(dpId); if(!k) return;
    var dp = k.dp, dom = k.domain;
    function row(a,b){ return '<tr><td style="color:var(--mut);white-space:nowrap;padding-right:14px">'+a+'</td><td>'+b+'</td></tr>'; }
    var schema = k.schema.length ? ('<table class="tbl"><tr><th>Field</th><th>Type</th><th>PII</th></tr>'+
      k.schema.map(function(f){return '<tr><td class="mono">'+PACK.esc(f[0])+'</td><td class="muted">'+PACK.esc(f[1])+'</td><td>'+(f[2]==="pii"?'<span class="chip" style="background:#fdecea;color:#b42318;cursor:default">PII</span>':'—')+'</td></tr>';}).join("")+'</table>') : '<span class="muted">—</span>';
    var body =
      '<div class="dc">'+
      '<h4>Contract fundamentals</h4>'+
      '<table class="dc-kv">'+
        row("Data product","<strong>"+PACK.esc(dp.name)+"</strong> <span class=\"mono\" style=\"color:var(--accent)\">"+dp.id+"</span>")+
        row("Owning domain", PACK.esc(dom.name||dp.domainName||dp.domain)+' <span class="muted" style="font-size:.72rem">— the domain owns this product</span>')+
        (dp.productType?row("Product type", PACK.esc(dp.productType)):"")+
        row("Owner", "<strong>"+PACK.esc(dom.owner||"—")+"</strong>")+
        row("Steward", PACK.esc(dom.steward||"—"))+
        row("Status", '<span class="status-pill status-Agreed">Published (Generic)</span>')+
        row("Version", PACK.esc(CFG.version||"—"))+
        row("Classification", '<strong>'+PACK.esc(k.classification)+'</strong>')+
      '</table>'+
      '<h4>Purpose</h4><p class="tight">'+PACK.esc(k.purpose)+'</p>'+
      '<h4>Schema</h4>'+schema+
      '<h4>Semantics — governed terms</h4>'+(k.terms_list.length?PACK.termChips(k.terms_list):'<span class="muted">—</span>')+
      '<h4>Data quality rules</h4>'+
      PACK.contractDqRulesHtml(dp.id)+
      '<div class="muted tight" style="font-size:.78rem;margin:'+((PACK.data().contractDQRules||{})[dp.id]?'10px 0 4px':'0 0 4px')+'">'+((PACK.data().contractDQRules||{})[dp.id]?'General clauses':'')+'</div>'+
      '<ul class="dc-list">'+k.quality.map(function(q){return '<li>'+PACK.esc(q)+'</li>';}).join("")+'</ul>'+
      PACK.dqScorecardHtml(dp.id)+
      '<h4>Pipeline &amp; timeliness</h4>'+
      '<table class="dc-kv">'+
        row("Data refresh rate", '<strong>'+PACK.esc(dp.refresh||"—")+'</strong>')+
        row("Pipeline mode", PACK.esc(dp.pipeline||"—"))+
        row("Meets consumer timeliness", (dp.meetsTimeliness==="Yes"?'<span class="chip" style="background:#dcfce7;color:#166534;cursor:default">✓ Yes</span>':PACK.esc(dp.meetsTimeliness||"—")))+
        row("Provisioning", '<span class="muted" style="font-size:.8rem">'+PACK.esc(dp.timelinessSLA||"")+'</span>')+
      '</table>'+
      PACK.dpAssetsHtml(dp.id)+
      '<h4>SLA / service levels</h4><table class="dc-kv">'+
        row("Freshness",PACK.esc(dp.refresh||k.sla.freshness||"—"))+row("Latency",PACK.esc(k.sla.latency||"—"))+
        row("Availability",PACK.esc(k.sla.availability||"—"))+row("Update frequency",PACK.esc(dp.refresh||k.sla.frequency||"—"))+
        row("Retention",PACK.esc(k.sla.retention||"—"))+row("Support",PACK.esc(k.sla.support||"—"))+
      '</table>'+
      '<h4>Terms of use</h4><table class="dc-kv">'+
        row("Access",PACK.esc(k.terms.access))+row("Allowed purposes",PACK.esc(k.terms.purposes))+
        row("Restrictions",PACK.esc(k.terms.restrictions))+row("Consent",PACK.esc(k.terms.consent))+
      '</table>'+
      '<h4>Producers (source systems)</h4>'+(k.sources.length?('<div class="chiprow">'+k.sources.map(function(s){return '<span class="chip term off">'+PACK.esc(s)+'</span>';}).join("")+'</div>'):'<span class="muted">—</span>')+
      '<h4>Consumers <span class="muted" style="font-weight:400;font-size:.78rem">— AI use-cases consume this product; they do not define it</span></h4>'+
        (k.realisesCDP.length?('<div class="chiprow"><span class="lbl">CDP services</span>'+k.realisesCDP.map(function(s){return '<a class="chip proc" href="hyperpersonalisation_cdp.html"><span class="id">'+PACK.esc(s)+'</span></a>';}).join("")+'</div>'):'')+
        PACK.dpConsumersHtml(dp)+
      '</div>';
    PACK.openPanel(dp.id, PACK.esc(dp.name)+' — Data Contract', body);
  };
  // small pill for the pipeline refresh cadence
  PACK.freshPill = function(refresh, meets){
    if(!refresh) return "";
    var fresh = /real-time|near-real/i.test(refresh);
    var bg = fresh?"#dcfce7":"#e0f2fe", fg = fresh?"#166534":"#075985";
    var ok = (meets==="Yes"||meets===true);
    return '<span title="Pipeline provisioned to the strictest consumer timeliness need" '+
      'style="display:inline-flex;align-items:center;gap:5px;font-size:.66rem;font-weight:800;border-radius:6px;padding:2px 8px;background:'+bg+';color:'+fg+'">'+
      (ok?'⏱ ':'')+PACK.esc(refresh)+'</span>';
  };
  /* card with a "view data contract" affordance (opens the panel) */
  PACK.dpCardHtml = function(dp){
    var dom = PACK.domainById(dp.domain) || {name:dp.domainName||dp.domain, owner:"—", steward:"—"};
    var cdpChips = (dp.cdp||[]).map(function(s){ return '<a class="chip proc" href="hyperpersonalisation_cdp.html" onclick="event.stopPropagation()"><span class="id">'+PACK.esc(s)+'</span></a>'; }).join("");
    var aiChips  = (dp.ai||[]).map(function(u){ return PACK.chip(u).replace('<a ','<a onclick="event.stopPropagation()" '); }).join("");
    var typePill = dp.productType?'<span class="dp-type" style="font-size:.64rem;font-weight:800;letter-spacing:.02em;color:#475569;background:#f1f5f9;border-radius:6px;padding:2px 8px">'+PACK.esc(dp.productType)+'</span>':'';
    return '<div class="dpcard dpcard-click" onclick="PACK.openDataProductPanel(\''+dp.id+'\')">'+
      '<div class="dp-top"><span class="dp-dom" title="Owned by '+PACK.esc(dom.name)+'">'+PACK.esc(dom.name)+'</span><span class="dp-id">'+PACK.esc(dp.id)+'</span></div>'+
      '<div class="dp-name">'+PACK.esc(dp.name)+'</div>'+
      '<p class="dp-desc">'+PACK.esc(dp.desc)+'</p>'+
      ((typePill||dp.refresh)?'<div class="chiprow" style="gap:6px;margin:2px 0 8px">'+typePill+PACK.freshPill(dp.refresh,dp.meetsTimeliness)+(dp.pipeline?'<span class="muted" style="font-size:.7rem">'+PACK.esc(dp.pipeline)+'</span>':'')+'</div>':'')+
      '<div class="dp-owner"><span>Owner: <b>'+PACK.esc(dom.owner)+'</b></span><span>Steward: <b>'+PACK.esc(dom.steward)+'</b></span></div>'+
      (cdpChips?'<div class="chiprow"><span class="lbl">'+PACK.copyText("dpRealisesCdp","Realises CDP")+'</span>'+cdpChips+'</div>':'')+
      (aiChips?'<div class="chiprow"><span class="lbl">Consumed by</span>'+aiChips+'</div>':'')+
      (dp.terms&&dp.terms.length?PACK.termChips(dp.terms,"Terms"):'')+
      '<div class="dp-view">View data contract ›</div>'+
    '</div>';
  };
})();

/* ============================================================================
   Concept primer — in-context "what is this?" definitions, shown as a small
   info-dot popover. One shared source used by the Navigator, the Graph, etc.
   ========================================================================== */
(function(){
  var PACK = window.PACK;
  PACK.CONCEPTS = {
    sh:{term:"Stakeholder", what:"The people or groups the business serves or must answer to — customers and prospects, partners, regulators, and internal teams.", why:"Every AI initiative should trace back to a stakeholder need; without one it is a solution looking for a problem."},
    per:{term:"Persona", what:"A named, representative example of a stakeholder — a specific segment made concrete so teams design for a real person, not an average."},
    vp:{term:"Value Proposition", what:"The promise of value made to a stakeholder — what they get and why it is worth their attention.", why:"It anchors downstream investment to a benefit someone actually wants."},
    bo:{term:"Business Outcome", what:"The measurable result that proves the promise is being kept, together with the KPI that quantifies it.", why:"If an AI initiative cannot name the outcome and KPI it moves, it cannot be justified or measured."},
    kpi:{term:"KPI", what:"A specific number that measures a business outcome — the metric you watch to know whether value is being created.", why:"It turns a goal into evidence; AI earns its place by moving a KPI."},
    vs:{term:"Value Stream", what:"The end-to-end activities that create and deliver value, from trigger to result, seen from the business side.", why:"It gives an AI investment a concrete place to live — you improve a stream, not an abstraction."},
    vsg:{term:"Value Stage", what:"One step of a value stream, with a clear start and finish and its own KPI.", why:"AI is applied stage by stage; each stage KPI rolls up to the outcome, so you can see where value is won or lost."},
    cj:{term:"Customer Journey", what:"The same value seen from the customer side — the experience they go through, moment by moment.", why:"It keeps the customer in view, so AI does not improve an internal metric while worsening the experience."},
    cap:{term:"Capability", what:"An ability the business must have to deliver — a what-we-can-do, independent of how teams are organised.", why:"Capabilities are reusable building blocks; one AI investment in a capability can serve many streams and journeys."},
    proc:{term:"Business Process", what:"The concrete, repeatable way a capability actually gets done — its steps, inputs and outputs (shown as SIPOC).", why:"You cannot automate what you cannot describe; the process is where AI plugs into real work."},
    dec:{term:"Decision", what:"A single judgement made inside a process: inputs in, an outcome out, following rules.", why:"Most AI automates or assists a decision — naming it is where a vague AI idea becomes something concrete you can build and govern."},
    ai:{term:"AI Use-Case", what:"A specific application of AI to a decision or task, with a value it creates and a risk it carries.", why:"Anchored to a decision, outcome and KPI, its value and risk become visible and comparable against every other use-case."},
    ag:{term:"AI Agent", what:"The working system that runs a use-case — the model or service that does the job — plus its stance on human oversight.", why:"Executives need to know how AI is operated and controlled, not just that it is used."},
    hitl:{term:"Human-in-the-Loop", what:"A control where a person reviews or approves an AI output before it takes effect, used for high-value, high-risk or regulated decisions.", why:"It is the main dial between full automation and human control."},
    dp:{term:"Data Product", what:"A governed, owned, reusable data asset the AI needs, with a clear owner, an agreed definition and a quality contract.", why:"AI is only as good as its data; data products make the dependency explicit and accountable."},
    dm:{term:"Data Domain", what:"The area of the business that owns and governs a group of related data products, with a named owner and steward.", why:"Ownership and stewardship are what make data trustworthy at scale."},
    sem:{term:"Semantic model / governed term", what:"The agreed, written definition of a business term — what churn, active customer or lifetime value actually mean.", why:"When every model and report uses the same definition, the numbers reconcile."},
    cdp:{term:"CDP (Customer Data Platform)", what:"The engine that unifies customer signals in near-real-time and activates them, so a next-best-action can fire at the right moment.", why:"It is the plumbing beneath real-time personalisation."}
  };
  PACK.conceptTypeMap = {SH:"sh",PER:"per",VP:"vp",BO:"bo",K:"kpi",KPI:"kpi",VS:"vs",VSG:"vsg",STG:"vsg",CJ:"cj",CX:"cj",CAP:"cap",P:"proc",STEP:"proc",D:"dec",U:"ai",AG:"ag",SM:"sem",CDP:"cdp",DP:"dp",DM:"dm",HITL:"hitl"};
  PACK.conceptKeyForType = function(t){ return PACK.conceptTypeMap[t]||null; };
  PACK.infoDot = function(key){ var c=key&&PACK.CONCEPTS[key]; if(!c) return "";
    return '<button type="button" class="info-dot" onclick="return PACK.showConcept(event,\''+key+'\')" aria-label="What is '+PACK.esc(c.term)+'?" title="What is '+PACK.esc(c.term)+'?">i</button>'; };

  var pop=null;
  function ensurePop(){ if(pop) return pop; pop=document.createElement("div"); pop.className="pack-pop"; pop.style.display="none";
    (document.body||document.documentElement).appendChild(pop); return pop; }
  function closePop(){ if(pop) pop.style.display="none"; }
  PACK.closeConcept = closePop;
  /* inline onclick (not delegation) so a dot nested inside a nav link never navigates */
  PACK.showConcept = function(ev, key){
    if(ev){ ev.preventDefault(); ev.stopPropagation(); }
    var c = PACK.CONCEPTS[key]; if(!c) return false;
    var dot = ev && (ev.currentTarget||ev.target);
    var p = ensurePop();
    p.innerHTML = '<div class="pp-t">'+PACK.esc(c.term)+'</div>'+
      '<div class="pp-w"><strong>What it is.</strong> '+PACK.esc(c.what)+'</div>'+
      (c.why?'<div class="pp-y"><strong>Why it matters.</strong> '+PACK.esc(c.why)+'</div>':'')+
      '<a class="pp-more" href="user_manual.html#blocks">Learn more in the guide &rsaquo;</a>';
    p.style.display="block";
    var w=Math.min(340, (window.innerWidth||360)-24); p.style.width=w+"px";
    if(dot){ var r=dot.getBoundingClientRect();
      var left=window.scrollX + r.left - 6, top=window.scrollY + r.bottom + 8;
      if(left + w > window.scrollX + window.innerWidth - 12) left = window.scrollX + window.innerWidth - w - 12;
      p.style.left=Math.max(window.scrollX+8, left)+"px"; p.style.top=top+"px"; }
    return false;
  };
  document.addEventListener("click", function(e){
    if(e.target && e.target.closest && e.target.closest(".info-dot")) return;     // handled inline
    if(pop && pop.style.display!=="none" && !(e.target.closest && e.target.closest(".pack-pop"))) closePop();
  });
  window.addEventListener("scroll", closePop, true);
  window.addEventListener("resize", closePop);
})();

/* ============================================================================
   Global glossary term-highlighter
   ---------------------------------------------------------------------------
   Wherever a governed business term appears in the app's rendered text, wrap it
   in a clickable chip that opens its definition (and deep-links to the Glossary
   Workbench). MutationObserver-driven so dynamically-rendered cards, panels and
   tables are covered too. Physical schema-field attributes (all-lowercase /
   underscore names) are excluded to keep prose clean; they still deep-link where
   shown explicitly. Runs on every page (pack.js is loaded everywhere).
   ========================================================================== */
(function(){
  var PACK = window.PACK, CFG = window.PACK_CONFIG;
  if(!PACK) return;
  function dict(){ var g=PACK.glossary&&PACK.glossary(); return (g&&g.terms) || (CFG.glossary&&CFG.glossary.terms) || null; }
  function enabled(){
    var d=dict(); if(!d) return false;
    var g=PACK.glossary(); if(g && g.enabled===false) return false;
    try{ if(window.localStorage.getItem("nbpack.termHighlight")==="off") return false; }catch(e){}
    return true;
  }

  var RX=null;
  function build(){
    var d=dict(); if(!d) return false;
    var names=[];
    for(var k in d){ var name=d[k][0];
      if(!name || name.length<3) continue;
      if(/^[a-z0-9_]+$/.test(name)) continue;   // physical schema field / lone lowercase token
      names.push(name);
    }
    if(!names.length) return false;
    names.sort(function(a,b){ return b.length-a.length; });         // longest first
    var esc=names.map(function(n){ return n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); });
    try{ RX=new RegExp("(?<![\\w])("+esc.join("|")+")(?![\\w])","gi"); }
    catch(e){ RX=new RegExp("\\b("+esc.join("|")+")\\b","gi"); }
    return true;
  }

  var SKIP_TAG={SCRIPT:1,STYLE:1,NOSCRIPT:1,A:1,BUTTON:1,INPUT:1,TEXTAREA:1,SELECT:1,OPTION:1,CODE:1,PRE:1,svg:1,SVG:1};
  function skipEl(el){
    if(!el||el.nodeType!==1) return false;
    if(SKIP_TAG[el.nodeName]) return true;
    if(el.isContentEditable) return true;
    var c=el.classList;
    if(c && (c.contains("gterm")||c.contains("chip")||c.contains("info-dot")||c.contains("mono")||
             c.contains("pack-pop")||c.contains("sidebar")||c.contains("idlink")||c.contains("relchip")||
             c.contains("dp-id")||c.contains("rid")||c.contains("id"))) return true;
    if(el.id==="nav"||el.id==="breadcrumb") return true;
    return false;
  }
  function inSkipped(node){ for(var el=node.parentNode; el&&el.nodeType===1; el=el.parentNode){ if(skipEl(el)) return true; } return false; }

  var seen = (typeof WeakSet!=="undefined") ? new WeakSet() : null;
  function mark(n){ if(seen) seen.add(n); else n.__gt=1; }
  function done(n){ return seen?seen.has(n):n.__gt; }
  var CAP=6000, count=0;   // safety backstop for pathologically dense reference pages

  function highlightNode(tn){
    if(done(tn)) return;
    if(count>=CAP){ mark(tn); return; }
    var text=tn.nodeValue;
    if(!text || text.length<3 || !/[A-Za-z]/.test(text)){ mark(tn); return; }
    if(inSkipped(tn)){ mark(tn); return; }
    RX.lastIndex=0; if(!RX.test(text)){ mark(tn); return; }
    RX.lastIndex=0;
    var frag=document.createDocumentFragment(), last=0, m;
    while((m=RX.exec(text))){
      count++;
      var start=m.index, end=start+m[0].length;
      if(start>last) frag.appendChild(document.createTextNode(text.slice(last,start)));
      var span=document.createElement("span");
      span.className="gterm"; span.setAttribute("data-term", m[0]); span.textContent=m[0];
      if(span.firstChild) mark(span.firstChild);
      frag.appendChild(span);
      last=end;
      if(m[0].length===0){ RX.lastIndex++; }
    }
    if(last<text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    var parent=tn.parentNode; if(parent) parent.replaceChild(frag, tn);
  }
  function scan(root){
    if(!RX||!root) return;
    if(root.nodeType===3){ highlightNode(root); return; }
    if(root.nodeType!==1 || skipEl(root)) return;
    var walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var batch=[], n; while((n=walker.nextNode())){ if(!done(n)) batch.push(n); }
    for(var i=0;i<batch.length;i++) highlightNode(batch[i]);
  }

  /* ---- definition popover ---- */
  var pop=null;
  function ensure(){ if(pop) return pop; pop=document.createElement("div"); pop.className="pack-pop gterm-pop"; pop.style.display="none"; (document.body||document.documentElement).appendChild(pop); return pop; }
  function close(){ if(pop) pop.style.display="none"; }
  function openFor(el){
    var info=PACK.glossaryInfo(el.getAttribute("data-term")); if(!info) return;
    var p=ensure();
    p.innerHTML='<div class="pp-t">'+PACK.esc(info.name)+(info.type?' <span class="gt-type">'+PACK.esc(info.type)+'</span>':'')+'</div>'+
      (info.area?'<div class="pp-area">'+PACK.esc(info.area)+'</div>':'')+
      '<div class="pp-w">'+PACK.esc(info.def||"No definition recorded for this term yet.")+'</div>'+
      (info.url?'<a class="pp-more" href="'+PACK.esc(info.url)+'" target="_blank" rel="noopener">Open in the Glossary Workbench &rsaquo;</a>':'');
    p.style.display="block";
    var w=Math.min(360,(window.innerWidth||380)-24); p.style.width=w+"px";
    var r=el.getBoundingClientRect();
    var left=window.scrollX+r.left, top=window.scrollY+r.bottom+6;
    if(left+w>window.scrollX+window.innerWidth-12) left=window.scrollX+window.innerWidth-w-12;
    p.style.left=Math.max(window.scrollX+8,left)+"px"; p.style.top=top+"px";
  }
  document.addEventListener("click", function(e){
    var g=e.target&&e.target.closest&&e.target.closest(".gterm");
    if(g){ e.preventDefault(); e.stopPropagation(); openFor(g); return; }
    if(pop&&pop.style.display!=="none"&&!(e.target.closest&&e.target.closest(".gterm-pop"))) close();
  });
  window.addEventListener("scroll", close, true);
  window.addEventListener("resize", close);

  /* ---- observer + init (disconnect while we mutate, to avoid self-trigger) ---- */
  var obs=null, queued=false, pending=[];
  function flush(){
    queued=false; if(obs) obs.disconnect();
    var items=pending; pending=[];
    for(var i=0;i<items.length;i++){ try{ scan(items[i]); }catch(e){} }
    if(obs) obs.observe(document.body,{childList:true,subtree:true});
  }
  function enqueue(nd){ pending.push(nd); if(!queued){ queued=true; (window.requestAnimationFrame||function(f){setTimeout(f,50);})(flush); } }

  var started=false;
  function start(){
    if(started||!enabled()||!build()) return; started=true;
    try{ scan(document.body); }catch(e){}
    obs=new MutationObserver(function(muts){
      for(var i=0;i<muts.length;i++){ var a=muts[i].addedNodes;
        for(var j=0;j<a.length;j++){ if(a[j].nodeType===1||a[j].nodeType===3) enqueue(a[j]); } }
    });
    obs.observe(document.body,{childList:true,subtree:true});
    PACK.__gt={obs:obs, rescan:function(){ if(obs)obs.disconnect(); scan(document.body); if(obs)obs.observe(document.body,{childList:true,subtree:true}); }};
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  PACK.setTermHighlight=function(on){ try{ window.localStorage.setItem("nbpack.termHighlight", on?"on":"off"); }catch(e){} if(!on){ location.reload(); } else if(!started){ start(); } };
})();

/* ============================================================================
   Diagram zoom / lightbox — makes every SVG diagram (BPMN, DMN/DRD, capability
   and value maps, process landscape) clickable to open full-screen with wheel /
   button zoom and drag-to-pan. Dependency-free; installed once for all pages.
   ========================================================================== */
(function(){
  var PACK=window.PACK; if(!PACK||PACK._dgmZoom) return; PACK._dgmZoom=true;
  function ready(fn){ if(document.body) fn(); else document.addEventListener("DOMContentLoaded",fn); }
  ready(function(){
    var st=document.createElement("style");
    st.textContent=
      ".dgm-badge{position:absolute;top:8px;right:10px;z-index:6;display:inline-flex;gap:5px;align-items:center;"+
      "background:#16305a;color:#fff;border:none;border-radius:16px;padding:4px 11px;font-size:.72rem;font-weight:700;"+
      "cursor:pointer;opacity:.82;box-shadow:0 1px 4px rgba(0,0,0,.2)}.dgm-badge:hover{opacity:1}"+
      ".dgm-modal{position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.9);display:none;flex-direction:column}"+
      ".dgm-modal.open{display:flex}.dgm-bar{display:flex;align-items:center;gap:8px;padding:10px 14px;color:#fff;flex-wrap:wrap}"+
      ".dgm-bar .t{font-weight:700;font-size:.95rem;margin-right:auto;max-width:60vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"+
      ".dgm-btn{background:#243b63;color:#fff;border:1px solid #3a527e;border-radius:8px;padding:6px 11px;font-size:.85rem;cursor:pointer;font-weight:600}"+
      ".dgm-btn:hover{background:#2f4a78}.dgm-hint{color:#9fb2cf;font-size:.75rem;margin-right:8px}"+
      ".dgm-stage{flex:1;overflow:hidden;position:relative;cursor:grab;touch-action:none}.dgm-stage.grabbing{cursor:grabbing}"+
      ".dgm-canvas{position:absolute;left:0;top:0;transform-origin:0 0}"+
      ".dgm-canvas svg{display:block;background:#fff;border-radius:8px;box-shadow:0 6px 30px rgba(0,0,0,.4)}";
    document.head.appendChild(st);

    var modal=document.createElement("div"); modal.className="dgm-modal";
    modal.innerHTML='<div class="dgm-bar"><span class="t"></span>'+
      '<span class="dgm-hint">scroll to zoom · drag to pan</span>'+
      '<button class="dgm-btn" data-a="out">&#8722;</button>'+
      '<button class="dgm-btn" data-a="in">&#43;</button>'+
      '<button class="dgm-btn" data-a="fit">Fit</button>'+
      '<button class="dgm-btn" data-a="reset">100%</button>'+
      '<button class="dgm-btn" data-a="close">&#10005; Close</button></div>'+
      '<div class="dgm-stage"><div class="dgm-canvas"></div></div>';
    document.body.appendChild(modal);
    var stage=modal.querySelector(".dgm-stage"), canvas=modal.querySelector(".dgm-canvas"), titleEl=modal.querySelector(".t");
    var scale=1, tx=0, ty=0, baseW=800, baseH=400;
    function apply(){ canvas.style.transform="translate("+tx+"px,"+ty+"px) scale("+scale+")"; }
    function fit(){ var sw=stage.clientWidth-48, sh=stage.clientHeight-48;
      scale=Math.min(sw/baseW, sh/baseH); if(!isFinite(scale)||scale<=0)scale=1;
      tx=(stage.clientWidth-baseW*scale)/2; ty=(stage.clientHeight-baseH*scale)/2; apply(); }
    function zoomAt(f,cx,cy){ var ns=Math.max(0.1,Math.min(10,scale*f)), k=ns/scale;
      tx=cx-(cx-tx)*k; ty=cy-(cy-ty)*k; scale=ns; apply(); }
    function svgTitle(svg){ var t=[].slice.call(svg.querySelectorAll("text")).filter(function(x){return /lifecycle|—|–| → /.test(x.textContent);})[0];
      return t?t.textContent:(svg.querySelector("text")?svg.querySelector("text").textContent:"Diagram"); }
    function open(svg){
      if(!svg) return;
      baseW=parseFloat(svg.getAttribute("width"))||(svg.viewBox&&svg.viewBox.baseVal&&svg.viewBox.baseVal.width)||800;
      baseH=parseFloat(svg.getAttribute("height"))||(svg.viewBox&&svg.viewBox.baseVal&&svg.viewBox.baseVal.height)||400;
      var clone=svg.cloneNode(true);
      clone.setAttribute("width",baseW); clone.setAttribute("height",baseH); clone.style.pointerEvents="none";
      canvas.innerHTML=""; canvas.appendChild(clone);
      titleEl.textContent=svgTitle(svg);
      modal.classList.add("open"); fit();
    }
    function close(){ modal.classList.remove("open"); canvas.innerHTML=""; }
    modal.addEventListener("click", function(e){
      var b=e.target.closest(".dgm-btn"); if(!b){ if(e.target===modal||e.target===stage) close(); return; }
      var a=b.getAttribute("data-a");
      if(a==="close") close();
      else if(a==="in") zoomAt(1.25, stage.clientWidth/2, stage.clientHeight/2);
      else if(a==="out") zoomAt(0.8, stage.clientWidth/2, stage.clientHeight/2);
      else if(a==="fit") fit();
      else if(a==="reset"){ scale=1; tx=(stage.clientWidth-baseW)/2; ty=24; apply(); }
    });
    stage.addEventListener("wheel", function(e){ e.preventDefault(); var r=stage.getBoundingClientRect();
      zoomAt(e.deltaY<0?1.12:0.89, e.clientX-r.left, e.clientY-r.top); }, {passive:false});
    var drag=false, sx=0, sy=0;
    stage.addEventListener("pointerdown", function(e){ drag=true; stage.classList.add("grabbing"); sx=e.clientX-tx; sy=e.clientY-ty; try{stage.setPointerCapture(e.pointerId);}catch(_){}}); 
    stage.addEventListener("pointermove", function(e){ if(!drag)return; tx=e.clientX-sx; ty=e.clientY-sy; apply(); });
    stage.addEventListener("pointerup", function(){ drag=false; stage.classList.remove("grabbing"); });
    stage.addEventListener("pointercancel", function(){ drag=false; stage.classList.remove("grabbing"); });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape"&&modal.classList.contains("open")) close(); });

    function tag(svg){
      if(svg.__dgm) return;
      if(svg.closest(".dgm-canvas")) return;     // don't re-badge the enlarged clone
      var vb=svg.getAttribute("viewBox"); if(!vb) return;
      var w=parseFloat(svg.getAttribute("width"))||(svg.viewBox&&svg.viewBox.baseVal&&svg.viewBox.baseVal.width)||0;
      if(w<320) return;                          // skip small inline icon svgs
      svg.__dgm=true; svg.style.cursor="zoom-in";
      var host=svg.parentElement, mount=host;
      if(host){ var cs=getComputedStyle(host); if(/(auto|scroll)/.test((cs.overflowX||"")+(cs.overflow||""))) mount=host.parentElement||host; }
      if(mount && !mount.querySelector(":scope > .dgm-badge")){
        if(getComputedStyle(mount).position==="static") mount.style.position="relative";
        var badge=document.createElement("button"); badge.className="dgm-badge"; badge.type="button"; badge.innerHTML="&#10530; Expand";
        badge.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation();
          open(mount.querySelector("svg")||svg); });
        mount.appendChild(badge);
      }
    }
    function scan(root){ try{ (root||document).querySelectorAll("svg").forEach(tag); }catch(_){} }
    document.addEventListener("click", function(e){
      if(modal.classList.contains("open")) return;
      if(e.target.closest(".dgm-badge")) return;
      var svg=e.target.closest("svg"); if(!svg||!svg.__dgm) return;
      if(e.target.closest("a")) return;          // preserve in-diagram links
      open(svg);
    });
    var mo=new MutationObserver(function(muts){ muts.forEach(function(m){ if(m.addedNodes) m.addedNodes.forEach(function(n){
      if(n.nodeType===1){ if(n.tagName&&n.tagName.toLowerCase()==="svg") tag(n); else if(n.querySelectorAll) scan(n); } }); }); });
    mo.observe(document.body,{childList:true,subtree:true});
    // scan now and again after late renders — tag() re-attempts safely (it does not
    // mark an svg until it qualifies), so diagrams drawn outside the observer window
    // (some pages render on their own load handler) are still picked up.
    scan(document);
    window.addEventListener("load", function(){ scan(document); });
    setTimeout(function(){ scan(document); }, 400);
    setTimeout(function(){ scan(document); }, 1400);
    PACK.rescanDiagrams=function(){ scan(document); };
  });
})();
