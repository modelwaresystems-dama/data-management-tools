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
        '<div class="nav-right">'+
          (CFG.version?'<span class="ver-pill" title="Built '+PACK.esc(CFG.built||"")+'">'+PACK.esc(CFG.version)+'</span>':'')+
          '<div class="src-sel"><label>Source</label>'+
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
  PACK.ctx = function(){
    var q = {}; (location.search.replace(/^\?/,"").split("&")).forEach(function(p){
      if(!p) return; var kv=p.split("="); q[kv[0]]=decodeURIComponent(kv[1]||""); });
    return q;
  };
  PACK.ctxUrl = function(page, patch){
    var c = Object.assign(PACK.ctx(), patch||{});
    var qs = Object.keys(c).filter(function(k){return c[k];}).map(function(k){return k+"="+encodeURIComponent(c[k]);}).join("&");
    return page + (qs?("?"+qs):"");
  };
  PACK.navUrl = function(step, patch){ return PACK.ctxUrl("architecture_navigator.html", Object.assign({step:step}, patch||{})); };

  /* ---- breadcrumb rail (rendered on every page) --------------------------- */
  PACK.chainLabelFor = function(key, c){
    var v = c[key]; if(!v) return null;
    if(key==="sh"){ var o=PACK.MAP.SH[v]; return o?o.name:v; }
    if(key==="vp"){ var o2=PACK.MAP.VP[v]; return o2?o2.group:v; }
    if(key==="kpi"){ var o3=PACK.MAP.KPI[v]; return o3?o3.theme:v; }
    if(key==="cap"){ var o4=PACK.MAP.CAP[(v||"").split(".")[0]]; return o4?o4.name:v; }
    if(key==="cj"){ var o5=PACK.MAP.CJ[v]; return o5?o5.lob:v; }
    if(key==="proc"){ var o6=PACK.MAP.P[v]; return o6?o6.name:v; }
    if(key==="dec"){ var o7=PACK.MAP.D[v]; return o7?o7.name:v; }
    return v;
  };
  PACK.renderBreadcrumb = function(activeKey){
    var host = document.getElementById("breadcrumb"); if(!host) return;
    var c = PACK.ctx();
    var html = '<div class="bc-in"><span class="bc-lead">Traceability</span>'+
      CFG.chain.map(function(s,i){
        var lbl = PACK.chainLabelFor(s.key, c);
        var on = s.key===activeKey;
        var cls = "bc-step"+(on?" on":"")+(lbl?" has":"");
        var inner = '<span class="bc-k">'+PACK.esc(s.label)+'</span>'+(lbl?'<span class="bc-v">'+PACK.esc(lbl)+'</span>':'');
        var el = '<a class="'+cls+'" href="'+PACK.navUrl(s.key)+'">'+inner+'</a>';
        return (i?'<span class="bc-sep">›</span>':'')+el;
      }).join("")+'</div>';
    host.className = "breadcrumb"; host.innerHTML = html;
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
      return '<div class="vs-stream"><div class="vs-title">'+PACK.chip(j.id)+' <span class="muted" style="font-size:.82rem">value stream</span></div>'+
        '<div class="vs-grid">'+stageCols+'</div></div>';
    }).join("");
    host.innerHTML = head + (streams || '<p class="muted">No journeys mapped to this value proposition.</p>');
  };
  PACK._vsSet = function(vpId, mode, hostId){ PACK._vsMode=mode; PACK.valueStreamHeat(document.getElementById(hostId), vpId, {mode:mode}); };

  /* ---- SIPOC renderer ------------------------------------------------------ */
  PACK.renderSIPOC = function(host, procId){
    var p = PACK.MAP.P[procId]; var s = (D.processSIPOC||{})[procId];
    if(!p || !s){ host.innerHTML='<p class="muted">Select a process.</p>'; return; }
    function party(x){ return x.sh ? PACK.chip(x.sh, x.l) : '<span class="chip term off">'+PACK.esc(x.l)+'</span>'; }
    var bands = [
      {k:"SUPPLIERS", cls:"sup", body:'<div class="chiprow">'+s.suppliers.map(party).join("")+'</div>'},
      {k:"INPUTS",    cls:"inp", body:'<div class="siw">'+s.inputs.map(function(i){return '<span class="sitag">'+PACK.esc(i)+'</span>';}).join("")+'</div>'},
      {k:"PROCESS",   cls:"prc", body:'<div class="steps">'+'<span class="stp start">'+PACK.esc(p.name)+'</span>'+s.steps.map(function(st,i){return '<span class="stp">'+(i+1)+'. '+PACK.esc(st)+'</span>';}).join("")+'</div>'},
      {k:"OUTPUTS",   cls:"out", body:'<div class="siw">'+s.outputs.map(function(o){return '<span class="sitag">'+PACK.esc(o)+'</span>';}).join("")+'</div>'},
      {k:"CUSTOMERS", cls:"cus", body:'<div class="chiprow">'+s.customers.map(party).join("")+'</div>'}
    ];
    var cross = '<div class="sipoc-cross"><span class="lbl">Capabilities</span>'+PACK.chips(p.capabilities||[]).replace(/^<div class="chiprow">|<\/div>$/g,"")+'</div>';
    host.innerHTML = '<div class="sipoc">'+bands.map(function(b){
      return '<div class="sipoc-band"><div class="sipoc-k '+b.cls+'">'+b.k+'</div><div class="sipoc-b">'+b.body+'</div></div>';
    }).join("")+'</div>'+
      '<div class="sipoc-meta"><span class="muted">Participants:</span> '+PACK.esc(p.participants)+'</div>'+cross;
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
