/* ============================================================================
   Rich architecture visuals (value proposition, capability map, process
   landscape, BPMN swimlane, DMN decision-requirements diagram). Config-driven
   from PACK_CONFIG (valueProp / capabilityMap / processLandscape) and model
   data (processSteps / decisionRequirements), so every org renders its own.
   Depends on pack.js (PACK.esc). Injects its own styles.
   ========================================================================== */
(function(){
  var PACK = window.PACK; if(!PACK) return;
  var esc = PACK.esc;

  /* ---- one-time style injection ---- */
  var CSS = `
  .vpwrap{margin:6px 0 4px}
  .vp-hero{background:linear-gradient(135deg,#12325a,#1c4a7a);color:#fff;border-radius:14px;padding:20px 26px;text-align:center;font-size:1.02rem;line-height:1.6;box-shadow:var(--shadow)}
  .vp-pillars{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:16px}
  @media(max-width:900px){.vp-pillars{grid-template-columns:repeat(2,1fr)}}
  .vp-p{background:var(--panel);border:1px solid var(--line);border-top:4px solid var(--pc);border-radius:12px;padding:16px 16px 18px;box-shadow:var(--shadow);text-align:center}
  .vp-p .vpn{width:34px;height:34px;border-radius:50%;border:2px solid var(--pc);color:var(--pc);font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 8px}
  .vp-p h4{margin:0 0 8px;color:var(--pc);font-size:.98rem}
  .vp-p p{margin:0;color:var(--mut);font-size:.86rem;line-height:1.5}
  .vp-benh{font-weight:700;color:var(--ink);margin:20px 0 8px}
  .vp-ben{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  @media(max-width:900px){.vp-ben{grid-template-columns:1fr}}
  .vp-b{background:#f6f8fb;border-left:5px solid var(--pc);border-radius:10px;padding:14px 16px}
  .vp-b h5{margin:0 0 6px;color:var(--pc);font-size:.92rem}
  .vp-b p{margin:0;color:var(--mut);font-size:.85rem;line-height:1.5}
  .vp-inst{margin-top:16px;background:#eef4fb;border:1px solid #d6e4f5;border-radius:10px;padding:12px 16px;font-size:.9rem}
  .vp-inst b{color:var(--accent)}
  /* capability / process banded map */
  .camap{display:flex;flex-direction:column;gap:16px;margin:6px 0}
  .band{border:1px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:var(--shadow)}
  .band>.bhdr{padding:9px 16px;font-weight:700;font-size:.82rem;letter-spacing:.03em;color:#fff}
  .band.steer>.bhdr{background:#16305a}.band.core>.bhdr{background:#2e6ba8}.band.enable>.bhdr{background:#2e7d7d}.band.data>.bhdr{background:#3b4a8a}
  .datacell{background:#e7ebf8;border:1px solid #c2ccec;border-radius:9px;padding:11px 12px;font-size:.84rem;color:#2b357a;text-align:center;font-weight:600}
  .band .bbody{padding:14px;background:var(--panel)}
  .steer-row,.enable-row{display:grid;gap:12px}
  .cbox{border:1px solid var(--line);border-radius:10px;padding:12px 14px;background:#fff;text-align:center;font-size:.9rem;font-weight:600;color:var(--ink);position:relative}
  .core-cols{display:grid;gap:12px}
  .core-col{background:#eef4fb;border:1px solid #d6e4f5;border-radius:12px;padding:10px}
  .core-col>.dttl{font-weight:700;font-size:.82rem;color:#1c4a7a;padding:4px 6px 8px}
  .capcell{background:#eaf3e2;border:1px solid #c5dcb0;border-radius:9px;padding:11px 12px;margin-bottom:9px;font-size:.84rem;color:#2f4a1e;position:relative;cursor:default}
  .capcell:last-child{margin-bottom:0}
  .capcell .cid{font-family:"SF Mono",monospace;font-size:.66rem;color:#4a7c3f;display:block;margin-bottom:2px}
  .cbox{padding-right:30px}
  .mv{position:absolute;top:8px;right:8px;width:17px;height:17px;border-radius:50%;font-size:.6rem;font-weight:700;color:#fff;display:inline-flex;align-items:center;justify-content:center}
  .encell{border-radius:10px;padding:13px 14px;font-size:.86rem;font-weight:600;position:relative}
  .encell.support{background:#d9edea;border:1px solid #a9d5cf;color:#155e63}
  .encell.ai{background:#ece3f7;border:1px solid #cdb8ec;color:#5b3a8e}
  .encell.gov{background:#fdf1cf;border:1px solid #efd88a;color:#8a6d1a}
  .encell .etag{position:absolute;top:7px;right:10px;font-size:.6rem;font-style:italic;opacity:.7}
  .maplegend{display:flex;gap:16px;flex-wrap:wrap;font-size:.78rem;color:var(--mut);margin-top:6px}
  .maplegend span{display:inline-flex;align-items:center;gap:6px}
  .maplegend i{width:13px;height:13px;border-radius:3px;display:inline-block}
  /* process landscape extras */
  .pl-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
  .pl-tabs .plt{border:1px solid var(--line);background:var(--panel);border-radius:8px;padding:7px 13px;font-size:.84rem;color:var(--mut)}
  .pl-tabs .plt.on{border-color:var(--accent);color:var(--accent);font-weight:600;background:var(--accent-soft)}
  .capcell.aihi{background:#ece3f7;border-color:#cdb8ec;color:#5b3a8e}
  .capcell .badge{position:absolute;bottom:7px;right:8px;background:#16305a;color:#fff;font-size:.58rem;font-weight:700;border-radius:5px;padding:1px 5px}
  `;
  var st=document.createElement("style"); st.textContent=CSS; document.head.appendChild(st);

  var PCOL = ["#4a7c3f","#2e5c8a","#c08a1e","#2e7d7d"]; // pillar / beneficiary colours

  /* ---- Value Proposition ------------------------------------------------- */
  PACK.renderValueProp = function(host, cfg){
    if(!host) return;
    if(!cfg){ host.style.display="none"; return; }
    host.style.display="";
    var pillars=(cfg.pillars||[]).map(function(p,i){
      return '<div class="vp-p" style="--pc:'+PCOL[i%4]+'"><div class="vpn">'+(p.n||i+1)+'</div>'+
        '<h4>'+esc(p.title)+'</h4><p>'+esc(p.desc)+'</p></div>';
    }).join("");
    var bens=(cfg.beneficiaries||[]).map(function(b,i){
      return '<div class="vp-b" style="--pc:'+PCOL[i%4]+'"><h5>'+esc(b.name)+'</h5><p>'+esc(b.benefit)+'</p></div>';
    }).join("");
    var inst=(cfg.instruments&&cfg.instruments.length)?
      '<div class="vp-inst"><b>'+esc(cfg.instrumentsLabel||"Core instruments")+':</b> &nbsp;'+cfg.instruments.map(esc).join(" &nbsp;·&nbsp; ")+'</div>':"";
    host.innerHTML='<div class="vpwrap">'+
      '<div class="vp-hero">'+esc(cfg.statement)+'</div>'+
      '<div class="vp-pillars">'+pillars+'</div>'+
      (bens?('<div class="vp-benh">'+esc(cfg.beneficiariesLabel||"Who benefits — and how")+'</div><div class="vp-ben">'+bens+'</div>'):"")+
      inst+'</div>';
  };

  /* ---- Capability Map (banded steering / core / enabling) ---------------- */
  PACK.renderCapabilityMap = function(host, cfg, matFn){
    if(!host) return;
    if(!cfg){ host.style.display="none"; return; }
    host.style.display="";
    function mvDot(id){
      if(!matFn) return "";
      var m=matFn(id); if(!m||m.v==null) return "";
      return '<span class="mv" title="Maturity '+m.v+' · '+esc(m.name)+'" style="background:'+m.color+'">'+m.v+'</span>';
    }
    function capCell(c){
      return '<div class="capcell">'+mvDot(c.id)+'<span class="cid">'+esc(c.id||"")+'</span>'+esc(c.name)+'</div>';
    }
    var steer='<div class="band steer"><div class="bhdr">'+esc(cfg.steeringLabel||"Steering & Governance capabilities")+'</div>'+
      '<div class="bbody"><div class="steer-row" style="grid-template-columns:repeat('+Math.min(4,(cfg.steering||[]).length||1)+',1fr)">'+
      (cfg.steering||[]).map(function(c){return '<div class="cbox">'+mvDot(c.id)+esc(c.name)+'</div>';}).join("")+'</div></div></div>';
    var core='<div class="band core"><div class="bhdr">'+esc(cfg.coreLabel||"Core capabilities (the value chain)")+'</div>'+
      '<div class="bbody"><div class="core-cols" style="grid-template-columns:repeat('+((cfg.core||[]).length||1)+',1fr)">'+
      (cfg.core||[]).map(function(d){
        return '<div class="core-col"><div class="dttl">'+esc(d.domain)+'</div>'+(d.caps||[]).map(capCell).join("")+'</div>';
      }).join("")+'</div></div></div>';
    var data = (cfg.data&&cfg.data.length) ? '<div class="band data"><div class="bhdr">'+esc(cfg.dataLabel||"Data Management foundation — the base AI and analytics build on")+'</div>'+
      '<div class="bbody"><div class="enable-row" style="grid-template-columns:repeat('+Math.min(4,cfg.data.length)+',1fr)">'+
      cfg.data.map(function(d){ return '<div class="datacell">'+esc(d.name||d)+'</div>'; }).join("")+'</div></div></div>' : '';
    var enable='<div class="band enable"><div class="bhdr">'+esc(cfg.enablingLabel||"Enabling & Supporting capabilities")+'</div>'+
      '<div class="bbody"><div class="enable-row" style="grid-template-columns:repeat('+Math.min(4,(cfg.enabling||[]).length||1)+',1fr)">'+
      (cfg.enabling||[]).map(function(e){
        var cls=e.type==="ai"?"ai":(e.type==="gov"?"gov":"support");
        var tag=e.type==="ai"?"enabler":"";
        return '<div class="encell '+cls+'">'+(tag?'<span class="etag">'+tag+'</span>':'')+esc(e.name)+'</div>';
      }).join("")+'</div></div></div>';
    var legend='<div class="maplegend">'+
      '<span><i style="background:#eaf3e2;border:1px solid #c5dcb0"></i>Core capability</span>'+
      '<span><i style="background:#e7ebf8;border:1px solid #c2ccec"></i>Data Management foundation</span>'+
      '<span><i style="background:#d9edea;border:1px solid #a9d5cf"></i>Supporting / technical enabler</span>'+
      '<span><i style="background:#ece3f7;border:1px solid #cdb8ec"></i>AI &amp; automation enabler</span>'+
      '<span><i style="background:#fdf1cf;border:1px solid #efd88a"></i>Governance, finance &amp; assurance</span></div>';
    host.innerHTML='<div class="camap">'+steer+core+data+enable+'</div>'+legend;
  };

  /* ---- Process Landscape (value-stream tabs + banded domains) ------------ */
  PACK.renderProcessLandscape = function(host, cfg, opts){
    if(!host) return;
    if(!cfg){ host.style.display="none"; return; }
    opts=opts||{};
    host.style.display="";
    var tabs=(cfg.streams||[]).map(function(s,i){ return '<div class="plt'+(i===0?" on":"")+'">'+esc(s)+'</div>'; }).join("");
    function procCell(p){
      var cls="capcell"+(p.ai?" aihi":"");
      var badge=p.badge?'<span class="badge">'+esc(p.badge)+'</span>':'';
      var click=(opts.onProc&&p.id)?' style="cursor:pointer" onclick="'+opts.onProc+'(\''+p.id+'\')"':'';
      return '<div class="'+cls+'"'+click+'>'+badge+(p.id?'<span class="cid">'+esc(p.id)+'</span>':'')+esc(p.name)+'</div>';
    }
    var steer='<div class="band steer"><div class="bhdr">Steering &amp; Governance processes</div>'+
      '<div class="bbody"><div class="steer-row" style="grid-template-columns:repeat('+Math.min(4,(cfg.steering||[]).length||1)+',1fr)">'+
      (cfg.steering||[]).map(function(s){return '<div class="cbox" style="padding-right:14px">'+esc(s)+'</div>';}).join("")+'</div></div></div>';
    var core='<div class="band core"><div class="bhdr">Core processes (aligned to the value-chain capability domains)</div>'+
      '<div class="bbody"><div class="core-cols" style="grid-template-columns:repeat('+((cfg.core||[]).length||1)+',1fr)">'+
      (cfg.core||[]).map(function(d){
        return '<div class="core-col"><div class="dttl">'+esc(d.domain)+'</div>'+(d.procs||[]).map(procCell).join("")+'</div>';
      }).join("")+'</div></div></div>';
    var enable='<div class="band enable"><div class="bhdr">Enabling &amp; Governance processes</div>'+
      '<div class="bbody"><div class="enable-row" style="grid-template-columns:repeat('+Math.min(5,(cfg.enabling||[]).length||1)+',1fr)">'+
      (cfg.enabling||[]).map(function(e){
        var cls=e.type==="ai"?"ai":(e.type==="gov"?"gov":"support");
        return '<div class="encell '+cls+'">'+esc(e.name)+'</div>';
      }).join("")+'</div></div></div>';
    var legend='<div class="maplegend"><span><i style="background:#eaf3e2;border:1px solid #c5dcb0"></i>Core process</span>'+
      '<span><i style="background:#ece3f7;border:1px solid #cdb8ec"></i>AI-assisted step</span>'+
      '<span><i style="background:#d9edea;border:1px solid #a9d5cf"></i>Enabling</span>'+
      '<span><i style="background:#fdf1cf;border:1px solid #efd88a"></i>Governance &amp; assurance</span></div>';
    host.innerHTML='<div class="pl-tabs">'+tabs+'</div><div class="camap">'+steer+core+enable+'</div>'+legend;
  };

  /* ---- BPMN 2.0 swimlane (SVG), driven by ProcessStep data --------------- */
  function svgEsc(s){ return String(s==null?"":s).replace(/[&<>]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
  function wrap2(s,max){ s=String(s||""); if(s.length<=max) return [s];
    var cut=s.lastIndexOf(" ",max); if(cut<8) cut=max;
    var a=s.slice(0,cut), b=s.slice(cut).trim();
    if(b.length>max) b=b.slice(0,max-1)+"…"; return [a,b]; }
  // Only fully-automated work goes in the AI / Automation lane: A = Automated,
  // AIE = AI-Executed (agent acts autonomously). AI-Supported (AIS) steps are
  // performed by a PERSON with AI assistance, so they stay in the department
  // lane (badged AIS); Human (H) and Data-Support (DS) stay there too. HITL
  // decision gateways drop into the Human review lane.
  // Everything the system / AI performs (Automated, AI-Supported, AI-Executed and
  // Data-Support) belongs in the AI / Automation lane; only Human (H) steps sit in a
  // department lane.
  var BPMN_AI_TYPES={A:1,AIS:1,AIE:1,DS:1};
  // Detect the actor a step names ("Marketing identifies…", "Admin generates…").
  var BPMN_DEPT_KW=[["marketing","Marketing"],["sales","Sales"],["admin","Admin"],
    ["management","Management"],["trainer","Trainer"],["finance","Finance"],["power bi","Power BI"],
    ["coach","Career Coach"],["curriculum","Curriculum"],["content qa","Content QA"],["partner","Partner"]];
  function bpmnDetectDept(s){
    var t=(s.name||"").toLowerCase(), best=null, bi=1e9;
    BPMN_DEPT_KW.forEach(function(kw){ var p=t.indexOf(kw[0]); if(p>=0&&p<bi){bi=p;best=kw[1];} });
    return best;
  }
  // Normalise an actor / role-lane name to a canonical department label.
  var BPMN_DEPT_NORM={"trainers":"Trainer","trainer":"Trainer","power bi / reporting":"Power BI","power bi":"Power BI",
    "administration":"Admin","admin":"Admin","management":"Management","chief executive officer":"Management",
    "sales":"Sales","marketing":"Marketing","finance":"Finance","content qa":"Content QA","curriculum":"Curriculum",
    "partner":"Partner","partner channel manager":"Partner","career coach":"Career Coach","coach":"Career Coach",
    "data":"Data","strategy":"Strategy","social":"Social","platform":"Platform","digital media":"Digital"};
  function bpmnNormDept(name){
    var t=(name||"").trim().toLowerCase();
    if(BPMN_DEPT_NORM[t]) return BPMN_DEPT_NORM[t];
    return name ? name.replace(/\b\w/g,function(c){return c.toUpperCase();}) : "Business operations";
  }
  /* ---- DMN Decision Requirements Diagram (SVG) --------------------------- */
  PACK.renderDMN = function(host, dr, opts){
    if(!host) return;
    if(!dr){ host.innerHTML='<p class="muted">No decision-requirement model for this decision.</p>'; return; }
    opts=opts||{};
    var ucNames=opts.ucNames||{};
    // sub-decisions: one per supporting use-case (max 2) + a Confidence assessment
    var subs=[];
    (dr.supportUseCases||[]).slice(0,2).forEach(function(u){ subs.push({t:(ucNames[u]||u)+" analytics",k:u}); });
    subs.push({t:"Confidence assessment"});
    // input data
    var inputs=["Governed concept state","Extracted inputs","Counterparty / eligibility status","Model confidence score"];
    // knowledge sources
    var knows=[{t:(dr.knowledge||"Policy & rules"),auth:false}];
    if(dr.hitl) knows.push({t:"AI Ethics & HITL Guardrail Policy",auth:true});

    var W=960, HH=474, subW=210, subH=58, inW=170, inH=44, decW=340, decH=64;
    var cxc=W/2;
    var decY=44, subY=190, inY=330;
    function xspread(count,i,pad){ pad=pad||60; var span=W-2*pad; return pad+span*(count===1?0.5:i/(count-1)); }
    var P=[];
    P.push('<svg viewBox="0 0 '+W+' '+HH+'" width="'+W+'" height="'+HH+'" font-family="system-ui,Segoe UI,Roboto,sans-serif">');
    // markers
    P.push('<defs><marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="#3a4a5c"/></marker><marker id="ahd" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="#c99700"/></marker></defs>');
    // decision (top)
    var decX=cxc-decW/2;
    function box(x,y,w,h,fill,stroke,label,sub,rx){
      P.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+(rx||6)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.6"/>');
      var lines=wrap2(label, w>250?46:26);
      var ty=y+h/2-(sub?6:(lines.length>1?2:4))+4;
      P.push('<text x="'+(x+w/2)+'" y="'+ty+'" font-size="12" font-weight="700" fill="#233" text-anchor="middle"><tspan x="'+(x+w/2)+'" dy="0">'+svgEsc(lines[0])+'</tspan>'+(lines[1]?'<tspan x="'+(x+w/2)+'" dy="14">'+svgEsc(lines[1])+'</tspan>':'')+'</text>');
      if(sub) P.push('<text x="'+(x+w/2)+'" y="'+(y+h-8)+'" font-size="9" fill="#5b6b7f" text-anchor="middle">'+svgEsc(sub)+'</text>');
    }
    // positions of subs
    var subX=subs.map(function(_,i){ return xspread(subs.length,i,120)-subW/2; });
    var inX=inputs.map(function(_,i){ return xspread(inputs.length,i,105)-inW/2; });
    // connectors: sub -> decision (solid)
    subs.forEach(function(s,i){
      var sx=subX[i]+subW/2;
      P.push('<path d="M '+sx+' '+subY+' C '+sx+' '+(subY-30)+', '+cxc+' '+(decY+decH+30)+', '+cxc+' '+(decY+decH)+'" fill="none" stroke="#3a4a5c" stroke-width="1.4" marker-end="url(#ah)"/>');
    });
    // inputs -> subs (distribute each input to nearest sub)
    inputs.forEach(function(_,i){
      var ix=inX[i]+inW/2; var si=Math.min(subs.length-1, Math.floor(i/Math.ceil(inputs.length/subs.length)));
      var sx=subX[si]+subW/2;
      P.push('<path d="M '+ix+' '+inY+' C '+ix+' '+(inY-24)+', '+sx+' '+(subY+subH+24)+', '+sx+' '+(subY+subH)+'" fill="none" stroke="#3a4a5c" stroke-width="1.2" marker-end="url(#ah)"/>');
    });
    // knowledge sources (right side / bottom), dashed to decision or sub
    knows.forEach(function(k,i){
      var kw=190, kh=46;
      var kx = k.auth ? (W-kw-6) : Math.max(8, Math.min(W-kw-8, subX[0]+subW/2-kw/2)), ky = k.auth ? (decY+6) : (inY+inH+18);
      // folder shape
      P.push('<path d="M '+kx+' '+(ky+8)+' q 0 -8 8 -8 h '+(kw-16)+' q 8 0 8 8 v '+(kh-16)+' q 0 8 -8 8 h -'+(kw-16)+' q -8 0 -8 -8 Z" fill="#fdf1cf" stroke="#c99700" stroke-width="1.3"/>');
      var kl=wrap2(k.t,30);
      P.push('<text x="'+(kx+kw/2)+'" y="'+(ky+kh/2-2)+'" font-size="9.5" fill="#8a6d1a" text-anchor="middle"><tspan x="'+(kx+kw/2)+'" dy="0">'+svgEsc(kl[0])+'</tspan>'+(kl[1]?'<tspan x="'+(kx+kw/2)+'" dy="12">'+svgEsc(kl[1])+'</tspan>':'')+'</text>');
      if(k.auth){ P.push('<path d="M '+kx+' '+(ky+kh/2)+' H '+(decX+decW)+'" fill="none" stroke="#c99700" stroke-width="1.3" stroke-dasharray="5 4" marker-end="url(#ahd)"/>'); }
      else { var sx=subX[0]+subW/2; P.push('<path d="M '+(kx+kw/2)+' '+ky+' C '+(kx+kw/2)+' '+(ky-40)+', '+sx+' '+(subY+subH+40)+', '+sx+' '+(subY+subH)+'" fill="none" stroke="#c99700" stroke-width="1.2" stroke-dasharray="5 4" marker-end="url(#ahd)"/>'); }
    });
    // draw nodes on top
    box(decX,decY,decW,decH,"#dbe9fb","#2e6ba8",(opts.decName||dr.name||"Decision"),"Automate · Refer to human · Reject");
    subs.forEach(function(s,i){ box(subX[i],subY,subW,subH,"#e6f2df","#4a7c3f",s.t); });
    inputs.forEach(function(t,i){
      P.push('<rect x="'+inX[i]+'" y="'+inY+'" width="'+inW+'" height="'+inH+'" rx="22" fill="#eef1f4" stroke="#9aa8b8" stroke-width="1.3"/>');
      var il=wrap2(inputs[i],24);
      P.push('<text x="'+(inX[i]+inW/2)+'" y="'+(inY+inH/2+3)+'" font-size="9.5" fill="#3a4a5c" text-anchor="middle"><tspan x="'+(inX[i]+inW/2)+'" dy="'+(il.length>1?-3:0)+'">'+svgEsc(il[0])+'</tspan>'+(il[1]?'<tspan x="'+(inX[i]+inW/2)+'" dy="11">'+svgEsc(il[1])+'</tspan>':'')+'</text>');
    });
    P.push('</svg>');
    host.innerHTML='<div style="overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--panel);padding:8px">'+P.join("")+'</div>'+
      '<div class="maplegend" style="margin-top:8px"><span><i style="background:#dbe9fb;border:1px solid #2e6ba8"></i>Decision</span><span><i style="background:#e6f2df;border:1px solid #4a7c3f"></i>Sub-decision</span><span><i style="background:#eef1f4;border:1px solid #9aa8b8;border-radius:50%"></i>Input data</span><span><i style="background:#fdf1cf;border:1px solid #c99700"></i>Knowledge source</span><span style="color:#8a6d1a">– – authority / HITL</span></div>';
  };

  PACK.renderBPMN = function(host, steps, opts){
    if(!host) return;
    steps=(steps||[]).slice().sort(function(a,b){return a.seq-b.seq;});
    if(!steps.length){ host.innerHTML='<p class="muted">No step-level flow recorded for this process.</p>'; return; }
    opts=opts||{};
    var conceptNames=opts.conceptNames||{};
    var actors=opts.actors||[];
    // candidate department order: actors from the map (Responsible first), then
    // any actor a step names. We only KEEP a lane if it actually performs a step.
    var candOrder=[], candSeen={};
    function addCand(name){ var d=bpmnNormDept(name); if(d && !candSeen[d]){ candSeen[d]=1; candOrder.push(d); } }
    actors.filter(function(a){return a.type==="Internal"&&a.raci==="Responsible";}).forEach(function(a){addCand(a.actor);});
    actors.filter(function(a){return a.type==="Internal"&&a.raci!=="Responsible";}).forEach(function(a){addCand(a.actor);});
    steps.forEach(function(s){ if(BPMN_AI_TYPES[s.execType||""])return; var d=bpmnDetectDept(s); if(d)addCand(d); else addCand(s.lane); });
    if(!candOrder.length) candOrder.push("Business operations");
    var responsibleDept=candOrder[0], candSet={}; candOrder.forEach(function(d){candSet[d]=1;});
    function laneKeyOf(s){
      if(BPMN_AI_TYPES[s.execType||""]) return "__ai";
      var d=bpmnDetectDept(s); if(!(d&&candSet[d])){ var rl=bpmnNormDept(s.lane||""); d=candSet[rl]?rl:responsibleDept; }
      return "dept:"+d;
    }
    var laneHasStep={}; steps.forEach(function(s){ laneHasStep[laneKeyOf(s)]=1; });
    var decInfo=opts.decInfo||{};
    // Lane model (top → bottom): one lane per DEPARTMENT / ACTOR that performs human (H)
    // work; then an AI / Automation lane for everything the system / AI performs; then,
    // when the flow reaches a human-in-the-loop decision, an AI Steward lane where that
    // decision is reviewed by the accountable role before the flow hands back. Empty
    // lanes are dropped.
    var shade=["#eef4fb","#e9f0f9"], si=0;
    var LANES=candOrder.filter(function(d){return laneHasStep["dept:"+d];})
      .map(function(d){ return {key:"dept:"+d,name:d,fill:shade[(si++)%2],kind:"dept"}; });
    if(laneHasStep["__ai"]) LANES.push({key:"__ai",name:"AI / Automation",fill:"#f2ecfb",kind:"ai"});
    var hasHitl=steps.some(function(s){return s.decision&&s.hitl;});
    if(hasHitl){
      var stwRoles=[]; steps.forEach(function(s){ if(s.decision&&s.hitl){ var r=(decInfo[s.decision]||{}).ownerRole; if(r&&stwRoles.indexOf(r)<0)stwRoles.push(r);} });
      LANES.push({key:"__steward",name:(stwRoles.length===1?("AI Steward — "+stwRoles[0]):"AI Steward"),fill:"#fff7ec",kind:"steward"});
    }
    // supporting / consulted internal actors that perform no step → a caption,
    // not an empty lane. Plus external / system touchpoints.
    var supporting=candOrder.filter(function(d){return !laneHasStep["dept:"+d];});
    actors.filter(function(a){return a.type==="Internal";}).forEach(function(a){ var d=bpmnNormDept(a.actor);
      if(!laneHasStep["dept:"+d] && supporting.indexOf(d)<0) supporting.push(d); });
    var externals=[], exSeen={};
    actors.filter(function(a){return a.type!=="Internal";}).forEach(function(a){ if(!exSeen[a.actor]){exSeen[a.actor]=1; externals.push(a);} });
    var altFlows=(opts.altFlows||[]).filter(Boolean).map(function(a){ return (a&&a.step!=null)?a.step:a; });
    // exception / alternate flows get their OWN lane at the foot of the pool, so the
    // boundary events sit inside a swimlane rather than floating below the diagram.
    if(altFlows.length) LANES.push({key:"__exception",name:"Exception & alternate flows",fill:"#fdeeee",kind:"exception"});
    // decision outcome → gateway branch labels ("Live / online / self-study" → 3)
    function branchLabels(s){
      var di=decInfo[s.decision]||{};
      var raw=(di.outcome||"").toString();
      var arr=raw.split(/\s*\/\s*/).map(function(t){return t.trim();}).filter(Boolean);
      return arr.length?arr.slice(0,4):["outcome"];
    }
    var maxOut=1; steps.forEach(function(s){ if(s.decision){ var b=branchLabels(s); if(b.length>maxOut)maxOut=b.length; } });

    var leftW=150, topPad=30, nodeW=132, nodeH=44, startGap=40;
    var colGap=34, decW=126, decH=46, gwR=14;
    var BASELANE=124, NODEROW=62, OUTSTEP=60;
    var laneIdx={}; LANES.forEach(function(l,i){laneIdx[l.key]=i;});
    function laneKeyOfSafe(s){ var k=laneKeyOf(s); return (k in laneIdx)?k:LANES[0].key; }
    // a decision lives in the AI Steward lane when it is HITL, else in its step's lane
    function decLaneKey(s){ return (s.hitl && ("__steward" in laneIdx)) ? "__steward" : laneKeyOfSafe(s); }
    // how many end events stack BELOW a gateway in each lane → grow that lane to fit,
    // so no element is ever drawn outside a swimlane.
    var laneExtraOut={};
    steps.forEach(function(s){ if(!s.decision) return; var lk=decLaneKey(s);
      laneExtraOut[lk]=Math.max(laneExtraOut[lk]||0, Math.max(0, branchLabels(s).length-1)); });
    // variable lane geometry (each lane tall enough for all of its content)
    var laneTop={}, laneHt={}, _cy=topPad;
    LANES.forEach(function(l){ var extra=laneExtraOut[l.key]||0;
      laneTop[l.key]=_cy; laneHt[l.key]=BASELANE + (extra>0 ? extra*OUTSTEP+16 : 0); _cy+=laneHt[l.key]; });
    var poolBottom=_cy;
    function ly(key){ key=(key in laneTop)?key:LANES[0].key; return laneTop[key]+NODEROW; }
    function ly0(){ return ly(laneKeyOfSafe(steps[0])); }
    var startX=leftW+22;
    // measure flow width by simulating the cursor
    var mcur=startX+18;
    steps.forEach(function(s){ mcur += colGap+nodeW; if(s.decision){ mcur += colGap+decW + colGap+gwR*2; } });
    mcur += colGap+30;
    if(steps[steps.length-1] && steps[steps.length-1].decision) mcur += 120;
    // exception-lane row width (events sit inside the lane, after the label band)
    var exW=leftW+14; altFlows.forEach(function(af){ exW += 30 + Math.min(210, Math.max(80, (af+"").length*5.4+40)); });
    var W=Math.max(mcur+30, exW+16) + (maxOut>1?70:0), H=poolBottom+16;

    var parts=[];
    parts.push('<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" font-family="system-ui,Segoe UI,Roboto,sans-serif">');
    // lane bands + labels (variable height — grows to contain every element)
    LANES.forEach(function(l){
      var y=laneTop[l.key], h=laneHt[l.key];
      parts.push('<rect x="0" y="'+y+'" width="'+W+'" height="'+h+'" fill="'+l.fill+'"/>');
      parts.push('<rect x="0" y="'+y+'" width="'+leftW+'" height="'+h+'" fill="'+(l.kind==="ai"?"#4c2f7a":(l.kind==="steward"?"#8a5a1a":(l.kind==="exception"?"#9a3d3d":"#16305a")))+'"/>');
      var ll=wrap2(l.name, 15);
      parts.push('<text x="'+(leftW/2)+'" y="'+(y+h/2)+'" fill="#fff" font-size="10.5" font-weight="700" text-anchor="middle"><tspan x="'+(leftW/2)+'" dy="'+(ll.length>1?-4:3)+'">'+svgEsc(ll[0])+'</tspan>'+(ll[1]?'<tspan x="'+(leftW/2)+'" dy="13">'+svgEsc(ll[1])+'</tspan>':'')+'</text>');
    });
    parts.push('<rect x="0" y="'+topPad+'" width="'+W+'" height="'+(poolBottom-topPad)+'" fill="none" stroke="#c9d6e6"/>');
    parts.push('<text x="'+leftW+'" y="18" fill="#16305a" font-size="12" font-weight="700">'+svgEsc((opts.title||"Process")+" — BPMN 2.0 lifecycle")+'</text>');

    function connector(x1,y1,x2,y2,label,color){
      var midx=(x1+x2)/2;
      parts.push('<path d="M '+x1+' '+y1+' H '+midx+' V '+y2+' H '+x2+'" fill="none" stroke="'+(color||"#5b6b7f")+'" stroke-width="1.4"/>');
      parts.push('<path d="M '+(x2-6)+' '+(y2-4)+' L '+x2+' '+y2+' L '+(x2-6)+' '+(y2+4)+' Z" fill="'+(color||"#5b6b7f")+'"/>');
      if(label){ var lw=(label+"").length*4.9+8; parts.push('<rect x="'+(midx-lw/2)+'" y="'+((y1+y2)/2-14)+'" width="'+lw+'" height="12" rx="6" fill="#fff" opacity="0.9"/><text x="'+midx+'" y="'+((y1+y2)/2-5)+'" fill="#2f6a3f" font-size="8.5" text-anchor="middle" font-weight="700">'+svgEsc(label)+'</text>'); }
    }

    var startY=ly0();
    parts.push('<circle cx="'+startX+'" cy="'+startY+'" r="13" fill="#fff" stroke="#2f6a3f" stroke-width="2"/>');
    parts.push('<text x="'+startX+'" y="'+(startY+26)+'" font-size="8.5" fill="#5b6b7f" text-anchor="middle">start</text>');

    var XC={H:{f:"#e0e7ff",s:"#4f46e5"},A:{f:"#dcfce7",s:"#16a34a"},AIS:{f:"#fef9c3",s:"#ca8a04"},AIE:{f:"#fae8ff",s:"#c026d3"},DS:{f:"#e2e8f0",s:"#64748b"}};
    var prevX=startX+13, prevY=startY, cur=startX+18, pendingLabel=null, flowEnded=false;

    steps.forEach(function(s, stepIdx){
      var y=ly(laneKeyOfSafe(s));
      var x=cur+colGap+nodeW/2;
      connector(prevX, prevY, x-nodeW/2, y, pendingLabel); pendingLabel=null;
      var xt=s.execType||"", xc=XC[xt]||{f:"#ffffff",s:"#2e5c8a"};
      parts.push('<rect x="'+(x-nodeW/2)+'" y="'+(y-nodeH/2)+'" width="'+nodeW+'" height="'+nodeH+'" rx="8" fill="'+xc.f+'" stroke="'+xc.s+'" stroke-width="1.6"/>');
      if(xt) parts.push('<rect x="'+(x-20)+'" y="'+(y-nodeH/2-11)+'" width="40" height="14" rx="7" fill="#fff" stroke="'+xc.s+'" stroke-width="0.9"/><text x="'+x+'" y="'+(y-nodeH/2-1)+'" font-size="8" fill="'+xc.s+'" text-anchor="middle" font-weight="800">'+svgEsc(xt)+'</text>');
      var lines=wrap2(s.name,20);
      parts.push('<text x="'+x+'" y="'+y+'" font-size="9.5" fill="#233" text-anchor="middle"><tspan x="'+x+'" dy="'+(lines.length>1?-3:2)+'">'+svgEsc(lines[0])+'</tspan>'+(lines[1]?'<tspan x="'+x+'" dy="12">'+svgEsc(lines[1])+'</tspan>':'')+'</text>');
      parts.push('<text x="'+(x-nodeW/2+4)+'" y="'+(y-nodeH/2+11)+'" font-size="7.5" fill="#8595a8" font-family="monospace">'+svgEsc(s.id)+'</text>');
      var conceptNm = conceptNames[s.concept] || s.concept;
      if(conceptNm){
        var doW=118, doH=22, dox=x-doW/2, doy=y+nodeH/2+9, fold=8;
        parts.push('<path d="M '+dox+' '+doy+' h '+(doW-fold)+' l '+fold+' '+fold+' v '+(doH-fold)+' h -'+doW+' Z" fill="#eef4fb" stroke="#9db6d6" stroke-width="1"/>');
        parts.push('<path d="M '+(dox+doW-fold)+' '+doy+' v '+fold+' h '+fold+'" fill="none" stroke="#9db6d6" stroke-width="1"/>');
        parts.push('<line x1="'+x+'" y1="'+(y+nodeH/2)+'" x2="'+x+'" y2="'+doy+'" stroke="#9db6d6" stroke-width="1" stroke-dasharray="3 2"/>');
        var cl=wrap2(conceptNm,22);
        parts.push('<text x="'+x+'" y="'+(doy+(s.crud?9:13))+'" font-size="8" fill="#1e3a5f" text-anchor="middle" font-weight="600">'+svgEsc(cl[0].slice(0,24))+'</text>');
        if(s.crud) parts.push('<text x="'+x+'" y="'+(doy+doH-4)+'" font-size="7" fill="#5b6b7f" text-anchor="middle">'+svgEsc(s.crud)+(s.toState?' → '+svgEsc(s.toState):'')+'</text>');
      }
      prevX=x+nodeW/2; prevY=y; cur=x+nodeW/2;

      if(s.decision){
        // ---- business-rule (decision) task. A human-in-the-loop decision is reviewed
        // in the AI Steward lane by the accountable role; otherwise it stays in the
        // step's own lane. The flow hands back to the next step's lane afterwards. ----
        var dx=cur+colGap+decW/2, dyy=(s.hitl?ly("__steward"):y);
        connector(prevX,prevY, dx-decW/2, dyy);
        var di=decInfo[s.decision]||{};
        parts.push('<a href="decisions.html#'+svgEsc(s.decision)+'"><title>'+svgEsc(s.decision+(di.name?" · "+di.name:"")+(s.decisionInput?" · inputs: "+s.decisionInput:""))+'</title>');
        if(s.decisionInput){
          var dtxt=wrap2(s.decisionInput,30);
          parts.push('<rect x="'+(dx-54)+'" y="'+(dyy-decH/2-23)+'" width="108" height="18" rx="9" fill="#eef1f4" stroke="#9aa8b8" stroke-width="0.9"/>');
          parts.push('<text x="'+dx+'" y="'+(dyy-decH/2-11)+'" font-size="6.6" fill="#3a4a5c" text-anchor="middle">'+svgEsc((dtxt[0]||"").slice(0,28))+'</text>');
          parts.push('<line x1="'+dx+'" y1="'+(dyy-decH/2-5)+'" x2="'+dx+'" y2="'+(dyy-decH/2)+'" stroke="#9aa8b8" stroke-width="0.8" stroke-dasharray="2 2"/>');
        }
        parts.push('<rect x="'+(dx-decW/2)+'" y="'+(dyy-decH/2)+'" width="'+decW+'" height="'+decH+'" rx="8" fill="#fdf6e3" stroke="#c99700" stroke-width="1.7"/>');
        // 3×3 decision-table grid icon (marks this as a business-rule task)
        var gi=dx-decW/2+7, gj=dyy-decH/2+7;
        parts.push('<rect x="'+gi+'" y="'+gj+'" width="15" height="12" fill="#fff" stroke="#c99700" stroke-width="1"/>');
        parts.push('<line x1="'+gi+'" y1="'+(gj+4)+'" x2="'+(gi+15)+'" y2="'+(gj+4)+'" stroke="#c99700" stroke-width="0.7"/><line x1="'+gi+'" y1="'+(gj+8)+'" x2="'+(gi+15)+'" y2="'+(gj+8)+'" stroke="#c99700" stroke-width="0.7"/>');
        parts.push('<line x1="'+(gi+5)+'" y1="'+gj+'" x2="'+(gi+5)+'" y2="'+(gj+12)+'" stroke="#c99700" stroke-width="0.7"/><line x1="'+(gi+10)+'" y1="'+gj+'" x2="'+(gi+10)+'" y2="'+(gj+12)+'" stroke="#c99700" stroke-width="0.7"/>');
        parts.push('<text x="'+(gi+21)+'" y="'+(gj+9)+'" font-size="8" fill="#8a6d1a" font-weight="800" font-family="monospace">'+svgEsc(s.decision)+'</text>');
        var dn=wrap2(di.name||"Decision",22);
        parts.push('<text x="'+dx+'" y="'+(dyy+7)+'" font-size="9" fill="#5b4708" text-anchor="middle" font-weight="600"><tspan x="'+dx+'" dy="0">'+svgEsc(dn[0])+'</tspan>'+(dn[1]?'<tspan x="'+dx+'" dy="10">'+svgEsc(dn[1])+'</tspan>':'')+'</text>');
        if(s.hitl){
          parts.push('<rect x="'+(dx+decW/2-31)+'" y="'+(dyy-decH/2-9)+'" width="31" height="13" rx="6.5" fill="#fee2e2" stroke="#b91c1c" stroke-width="0.8"/><text x="'+(dx+decW/2-15.5)+'" y="'+(dyy-decH/2+1)+'" font-size="7.5" fill="#b91c1c" text-anchor="middle" font-weight="700">HITL</text>');
          // the accountable role that performs the human-in-the-loop review
          var role=(di.ownerRole||di.owner||"Accountable role");
          var rl=wrap2("HITL review · "+role, 26);
          parts.push('<text x="'+dx+'" y="'+(dyy+decH/2+12)+'" font-size="7.8" fill="#7a4d0a" text-anchor="middle" font-weight="700">'+svgEsc(rl[0])+'</text>'+(rl[1]?'<text x="'+dx+'" y="'+(dyy+decH/2+22)+'" font-size="7.8" fill="#7a4d0a" text-anchor="middle" font-weight="700">'+svgEsc(rl[1])+'</text>':''));
        }
        parts.push('</a>');
        prevX=dx+decW/2; prevY=dyy; cur=dx+decW/2;

        // ---- XOR gateway. Every outcome must terminate properly: an alternate /
        // negative outcome ends in a message end event (notify the requesting party);
        // a positive outcome that closes the flow ends in a message end event that
        // creates the result and notifies. Only a NON-terminal positive outcome
        // continues to the next step. ----
        var gx=cur+colGap+gwR, gy=dyy;
        connector(prevX,prevY, gx-gwR-2, gy);
        parts.push('<path d="M '+gx+' '+(gy-gwR)+' L '+(gx+gwR)+' '+gy+' L '+gx+' '+(gy+gwR)+' L '+(gx-gwR)+' '+gy+' Z" fill="#fff" stroke="#c99700" stroke-width="1.6"/>');
        parts.push('<text x="'+gx+'" y="'+(gy+4)+'" font-size="13" fill="#c99700" text-anchor="middle" font-weight="800">&#215;</text>');
        var bl=branchLabels(s);
        var isLastStep=(stepIdx===steps.length-1);
        var endR=13, exGap=54, oX=gx+exGap+endR;
        // message end event (circle + envelope) + outcome and the specific action it
        // triggers — taken from the decision's outcome handler (create <artefact> ·
        // notify <party>), falling back to polarity if no handler is supplied.
        var decHandlers=(decInfo[s.decision]||{}).handlers||{};
        function msgEnd(ox,oy,label){
          var h=decHandlers[label];
          var neg=h ? !h.pos : /\b(declin|reject|suppress|ineligib|unqualif|hold|retir|deny|defer|withdraw|exit|fail|cancel|clos|remov|block|drop|abandon|discard|no)\w*/i.test(label);
          var col=neg?"#b45309":"#2f6a3f";
          parts.push('<circle cx="'+ox+'" cy="'+oy+'" r="'+endR+'" fill="#fff" stroke="'+col+'" stroke-width="2.6"/>');
          parts.push('<rect x="'+(ox-6)+'" y="'+(oy-4)+'" width="12" height="8" fill="none" stroke="'+col+'" stroke-width="0.9"/><path d="M '+(ox-6)+' '+(oy-4)+' L '+ox+' '+(oy+1.5)+' L '+(ox+6)+' '+(oy-4)+'" fill="none" stroke="'+col+'" stroke-width="0.9"/>');
          var act=h ? h.act : (neg?"notify requester":"create & notify");
          var cl=wrap2(label,15), al=wrap2(act,22);
          parts.push('<text x="'+ox+'" y="'+(oy+endR+11)+'" font-size="8" fill="#33424f" text-anchor="middle" font-weight="700">'+svgEsc(cl[0])+'</text>');
          parts.push('<text x="'+ox+'" y="'+(oy+endR+20)+'" font-size="7" fill="#5b6b7f" text-anchor="middle">'+svgEsc(al[0])+'</text>'+(al[1]?'<text x="'+ox+'" y="'+(oy+endR+28)+'" font-size="7" fill="#5b6b7f" text-anchor="middle">'+svgEsc(al[1])+'</text>':''));
        }
        if(isLastStep){
          // terminal decision — EVERY outcome ends in its own message end event
          connector(gx+gwR, gy, oX-endR, gy, bl[0]);
          msgEnd(oX, gy, bl[0]);
          for(var bi=1; bi<bl.length; bi++){
            var oy=gy+bi*OUTSTEP;
            parts.push('<path d="M '+gx+' '+(gy+gwR)+' V '+oy+' H '+(oX-endR)+'" fill="none" stroke="#b6892a" stroke-width="1.2" stroke-dasharray="4 2"/>');
            parts.push('<path d="M '+(oX-endR-6)+' '+(oy-4)+' L '+(oX-endR)+' '+oy+' L '+(oX-endR-6)+' '+(oy+4)+' Z" fill="#b6892a"/>');
            parts.push('<text x="'+(gx+16)+'" y="'+((gy+oy)/2-2)+'" font-size="7.6" fill="#8a6d1a" font-weight="700">'+svgEsc(bl[bi])+'</text>');
            msgEnd(oX, oy, bl[bi]);
          }
          flowEnded=true;
          prevX=oX+endR; prevY=gy; cur=oX+endR;
        } else {
          // mid-flow — primary continues; alternate (off-ramp) outcomes end within the
          // gateway's own lane (never below the pool)
          pendingLabel=bl[0];
          for(var bj=1; bj<bl.length; bj++){
            var byy=gy + bj*OUTSTEP;
            parts.push('<path d="M '+gx+' '+(gy+gwR)+' V '+byy+' H '+(gx+exGap)+'" fill="none" stroke="#b6892a" stroke-width="1.1" stroke-dasharray="4 2"/>');
            parts.push('<text x="'+(gx+10)+'" y="'+(byy-3)+'" font-size="7.4" fill="#8a6d1a" font-weight="700">'+svgEsc(bl[bj])+'</text>');
            msgEnd(gx+exGap+endR, byy, bl[bj]);
          }
          prevX=gx+gwR; prevY=gy; cur=gx+gwR;
        }
      }
    });
    if(!flowEnded){
      var endX=cur+colGap+13, endY=prevY;
      connector(prevX, prevY, endX-13, endY, pendingLabel);
      parts.push('<circle cx="'+endX+'" cy="'+endY+'" r="13" fill="#fff" stroke="#2f6a3f" stroke-width="3"/>');
      parts.push('<text x="'+endX+'" y="'+(endY+26)+'" font-size="8.5" fill="#5b6b7f" text-anchor="middle">end</text>');
    }

    // ---- exception / alternate flows — boundary error events INSIDE their own lane ----
    if(altFlows.length && ("__exception" in laneTop)){
      var ery=laneTop["__exception"]+laneHt["__exception"]/2, exX=leftW+14;
      altFlows.forEach(function(af){
        var lbl=(af+""), w=Math.min(210, Math.max(80, lbl.length*5.4+40));
        parts.push('<circle cx="'+(exX+13)+'" cy="'+ery+'" r="11" fill="#fff" stroke="#b91c1c" stroke-width="1.5"/>');
        parts.push('<circle cx="'+(exX+13)+'" cy="'+ery+'" r="8.4" fill="none" stroke="#b91c1c" stroke-width="0.7"/>');
        parts.push('<path d="M '+(exX+8.5)+' '+(ery+3)+' l 3 -6 l 2.5 3.4 l 3 -5.4" fill="none" stroke="#b91c1c" stroke-width="1.3"/>');
        var el=wrap2(lbl,26);
        parts.push('<text x="'+(exX+28)+'" y="'+(ery-2)+'" font-size="8" fill="#7f1d1d"><tspan x="'+(exX+28)+'" dy="0">'+svgEsc(el[0])+'</tspan>'+(el[1]?'<tspan x="'+(exX+28)+'" dy="10">'+svgEsc(el[1])+'</tspan>':'')+'</text>');
        exX += 30 + w;
      });
    }
    parts.push('</svg>');
    // supporting / consulted actors (no performed step) + external / system
    // touchpoints — shown compactly as pills, NOT as empty swimlanes.
    var tpBand="";
    var pills=supporting.map(function(d){
        return '<span style="display:inline-flex;align-items:center;gap:5px;background:#eef2f7;color:#475569;border-radius:20px;padding:3px 11px">'+
          '<b style="font-size:.6rem;text-transform:uppercase;letter-spacing:.03em;opacity:.7">supports</b>'+svgEsc(d)+'</span>'; })
      .concat(externals.map(function(a){ var sys=a.type==="System";
        return '<span style="display:inline-flex;align-items:center;gap:5px;background:'+(sys?"#e2e8f0":"#fef3c7")+';color:'+(sys?"#334155":"#92400e")+';border-radius:20px;padding:3px 11px">'+
          '<b style="font-size:.6rem;text-transform:uppercase;letter-spacing:.03em;opacity:.7">'+(sys?"system":"external")+'</b>'+svgEsc(a.actor)+'</span>'; }));
    if(pills.length){
      tpBand='<div style="margin-top:8px;display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:.78rem">'+
        '<span style="font-weight:700;color:#475569">Also involved (touchpoints):</span>'+pills.join("")+'</div>';
    }
    host.innerHTML='<div style="overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--panel);padding:6px">'+parts.join("")+'</div>'+
      tpBand+
      '<div class="maplegend" style="margin-top:8px"><span>◯ start / end</span><span><i style="background:#e0e7ff;border:1px solid #4f46e5"></i>H · Human</span><span><i style="background:#dcfce7;border:1px solid #16a34a"></i>A · Automated</span><span><i style="background:#fef9c3;border:1px solid #ca8a04"></i>AIS · AI-Supported</span><span><i style="background:#fae8ff;border:1px solid #c026d3"></i>AIE · AI-Executed</span><span><i style="background:#e2e8f0;border:1px solid #64748b"></i>DS · Data Support</span><span><i style="background:#fdf6e3;border:1px solid #c99700"></i>decision (business rule) + × gateway</span><span><i style="background:#fff;border:1px solid #b91c1c;border-radius:50%"></i>exception / boundary event</span><span><i style="background:#fff;border:2px solid #2f6a3f;border-radius:50%"></i>message end (create / notify)</span><span style="color:#b91c1c">HITL = human-in-the-loop</span></div>';
  };
})();
