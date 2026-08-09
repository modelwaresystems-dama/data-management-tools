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
  .band.steer>.bhdr{background:#16305a}.band.core>.bhdr{background:#2e6ba8}.band.enable>.bhdr{background:#2e7d7d}
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
    var enable='<div class="band enable"><div class="bhdr">'+esc(cfg.enablingLabel||"Enabling & Supporting capabilities")+'</div>'+
      '<div class="bbody"><div class="enable-row" style="grid-template-columns:repeat('+Math.min(4,(cfg.enabling||[]).length||1)+',1fr)">'+
      (cfg.enabling||[]).map(function(e){
        var cls=e.type==="ai"?"ai":(e.type==="gov"?"gov":"support");
        var tag=e.type==="ai"?"enabler":"";
        return '<div class="encell '+cls+'">'+(tag?'<span class="etag">'+tag+'</span>':'')+esc(e.name)+'</div>';
      }).join("")+'</div></div></div>';
    var legend='<div class="maplegend">'+
      '<span><i style="background:#eaf3e2;border:1px solid #c5dcb0"></i>Core capability</span>'+
      '<span><i style="background:#d9edea;border:1px solid #a9d5cf"></i>Supporting / technical enabler</span>'+
      '<span><i style="background:#ece3f7;border:1px solid #cdb8ec"></i>AI &amp; automation enabler</span>'+
      '<span><i style="background:#fdf1cf;border:1px solid #efd88a"></i>Governance, finance &amp; assurance</span></div>';
    host.innerHTML='<div class="camap">'+steer+core+enable+'</div>'+legend;
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
  var BPMN_LANES=[
    {key:"ops",name:"Business operations",fill:"#eef4fb"},
    {key:"ai",name:"AI / Automation",fill:"#f2ecfb"},
    {key:"human",name:"Human review & approval",fill:"#fff7ec"}
  ];
  function laneOf(s){
    var tt=(s.taskType||"").toLowerCase(), au=(s.automation||"").toLowerCase();
    if(s.hitl || tt.indexOf("approval")>=0) return "human";
    if(au.indexOf("ai")>=0 || tt.indexOf("model")>=0 || tt.indexOf("service")>=0) return "ai";
    return "ops";
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
    var leftW=132, colW=172, laneH=96, topPad=30, nodeW=132, nodeH=46, startGap=48;
    var laneIdx={}; BPMN_LANES.forEach(function(l,i){laneIdx[l.key]=i;});
    var n=steps.length;
    var W=leftW+startGap+(n+1)*colW, H=topPad+BPMN_LANES.length*laneH+16;
    function cx(i){ return leftW+startGap+colW*i+colW/2; }
    function ly(key){ return topPad+laneIdx[key]*laneH+laneH/2; }
    var parts=[];
    parts.push('<svg viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" font-family="system-ui,Segoe UI,Roboto,sans-serif">');
    // lane bands + labels
    BPMN_LANES.forEach(function(l,i){
      var y=topPad+i*laneH;
      parts.push('<rect x="0" y="'+y+'" width="'+W+'" height="'+laneH+'" fill="'+l.fill+'"/>');
      parts.push('<rect x="0" y="'+y+'" width="'+leftW+'" height="'+laneH+'" fill="#16305a"/>');
      parts.push('<text x="'+(leftW/2)+'" y="'+(y+laneH/2)+'" fill="#fff" font-size="11" font-weight="700" text-anchor="middle"><tspan x="'+(leftW/2)+'" dy="-4">'+svgEsc(l.name.split(" ")[0])+'</tspan><tspan x="'+(leftW/2)+'" dy="14">'+svgEsc(l.name.split(" ").slice(1).join(" "))+'</tspan></text>');
    });
    parts.push('<rect x="0" y="'+topPad+'" width="'+W+'" height="'+(BPMN_LANES.length*laneH)+'" fill="none" stroke="#c9d6e6"/>');
    parts.push('<text x="'+leftW+'" y="18" fill="#16305a" font-size="12" font-weight="700">'+svgEsc((opts.title||"Process")+" — BPMN 2.0 lifecycle")+'</text>');
    // flow: start -> nodes (with gateways on decision steps) -> end
    var startX=leftW+22, startY=ly(laneOf(steps[0]));
    var prevX=startX, prevY=startY;
    function connector(x1,y1,x2,y2,label,color){
      var midx=(x1+x2)/2;
      parts.push('<path d="M '+x1+' '+y1+' H '+midx+' V '+y2+' H '+x2+'" fill="none" stroke="'+(color||"#5b6b7f")+'" stroke-width="1.4"/>');
      // arrowhead
      parts.push('<path d="M '+(x2-6)+' '+(y2-4)+' L '+x2+' '+y2+' L '+(x2-6)+' '+(y2+4)+' Z" fill="'+(color||"#5b6b7f")+'"/>');
      if(label) parts.push('<text x="'+midx+'" y="'+((y1+y2)/2-4)+'" fill="#2f6a3f" font-size="9" text-anchor="middle">'+svgEsc(label)+'</text>');
    }
    // start event
    parts.push('<circle cx="'+startX+'" cy="'+startY+'" r="13" fill="#fff" stroke="#2f6a3f" stroke-width="2"/>');
    parts.push('<text x="'+startX+'" y="'+(startY+26)+'" font-size="8.5" fill="#5b6b7f" text-anchor="middle">start</text>');
    steps.forEach(function(s,i){
      var x=cx(i), y=ly(laneOf(s));
      // connector from prev to this node's left edge
      connector(prevX, prevY, x-nodeW/2, y);
      // node
      var ai=(s.automation||"").toLowerCase().indexOf("ai")>=0;
      var fill=ai?"#f0e9fb":"#ffffff", stroke=ai?"#7c4bc0":"#2e5c8a";
      parts.push('<rect x="'+(x-nodeW/2)+'" y="'+(y-nodeH/2)+'" width="'+nodeW+'" height="'+nodeH+'" rx="8" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.6"/>');
      if(ai) parts.push('<rect x="'+(x-30)+'" y="'+(y-nodeH/2-11)+'" width="60" height="14" rx="7" fill="#ece3f7" stroke="#7c4bc0" stroke-width="0.8"/><text x="'+x+'" y="'+(y-nodeH/2-1)+'" font-size="8" fill="#5b3a8e" text-anchor="middle" font-weight="700">AI-assisted</text>');
      var lines=wrap2(s.name,20);
      parts.push('<text x="'+x+'" y="'+y+'" font-size="9.5" fill="#233" text-anchor="middle"><tspan x="'+x+'" dy="'+(lines.length>1?-3:2)+'">'+svgEsc(lines[0])+'</tspan>'+(lines[1]?'<tspan x="'+x+'" dy="12">'+svgEsc(lines[1])+'</tspan>':'')+'</text>');
      parts.push('<text x="'+(x-nodeW/2+4)+'" y="'+(y-nodeH/2+11)+'" font-size="7.5" fill="#8595a8" font-family="monospace">'+svgEsc(s.id)+'</text>');
      prevX=x+nodeW/2; prevY=y;
      // decision gateway in the half-column gap
      if(s.decision){
        var gx=x+nodeW/2+(colW-nodeW)/2, gy=y, r=13;
        connector(prevX, prevY, gx-r, gy);
        parts.push('<path d="M '+gx+' '+(gy-r)+' L '+(gx+r)+' '+gy+' L '+gx+' '+(gy+r)+' L '+(gx-r)+' '+gy+' Z" fill="#fdf1cf" stroke="#c99700" stroke-width="1.4"/>');
        parts.push('<text x="'+gx+'" y="'+(gy+1)+'" font-size="8" fill="#8a6d1a" text-anchor="middle" font-weight="700">'+svgEsc(s.decision)+'</text>');
        if(s.hitl) parts.push('<text x="'+gx+'" y="'+(gy+r+10)+'" font-size="7.5" fill="#b91c1c" text-anchor="middle" font-weight="700">HITL</text>');
        prevX=gx+r; prevY=gy;
      }
    });
    // end event
    var endX=prevX+34, endY=prevY;
    connector(prevX, prevY, endX-13, endY);
    parts.push('<circle cx="'+endX+'" cy="'+endY+'" r="13" fill="#fff" stroke="#2f6a3f" stroke-width="3"/>');
    parts.push('<text x="'+endX+'" y="'+(endY+26)+'" font-size="8.5" fill="#5b6b7f" text-anchor="middle">end</text>');
    parts.push('</svg>');
    host.innerHTML='<div style="overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--panel);padding:6px">'+parts.join("")+'</div>'+
      '<div class="maplegend" style="margin-top:8px"><span>◯ start / end</span><span><i style="background:#fff;border:1px solid #2e5c8a"></i>task</span><span><i style="background:#f0e9fb;border:1px solid #7c4bc0"></i>AI-assisted step</span><span><i style="background:#fdf1cf;border:1px solid #c99700"></i>decision gateway</span><span style="color:#b91c1c">HITL = human-in-the-loop</span></div>';
  };
})();
