/* ============================================================================
   Model Explorer — resolves every element of the governed model and its true
   relationships. Builds an entity index (id → home sheet, display name,
   attributes) and a foreign-key adjacency index. A relationship exists ONLY
   where one element's row explicitly carries another element's governed ID in a
   column (a real foreign key) — on masters/forms the column is an attribute
   FK; on map/join sheets the row's key links to each referenced ID. Wide
   denormalised reporting views (traceability / registry / end-to-end) are
   excluded so they do not manufacture spurious links. Each edge is directional:
   → this element references that one, ← it is referenced by, ↔ both. Related
   elements are shown by NAME (id secondary), grouped by architecture layer.
   Shared by the Model Review page and the Element Relationships catalogue.
   ============================================================================ */
(function(){
  var W=window, MX=(W.MODELX={});
  var esc=function(s){ return (W.PACK&&PACK.esc)?PACK.esc(s):String(s==null?"":s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); };

  var GROUPS = [
   ["Strategy, Stakeholders & Value", ["stakeholder","persona","valueprop","value proposition","businessoutcome","business outcome","valuestream","value stream","valuestage","value stage","engagement","segment","outcome"]],
   ["Capabilities", ["capability","capabilit"]],
   ["Journeys & Experience", ["journey","experience","moment","touchpoint"," cx","hyperpersonal","personalis"]],
   ["Processes & Steps", ["process","sipoc","processstep","executiontype","execution type"]],
   ["Data Quality", ["criticaldataelement","cde","dataproductdq","dqrule","dq_","dqprofile","distribution","scorecard","fitness","assessment","dataquality","data quality","profile","cde_dq"]],
   ["Decisions", ["decision"]],
   ["Semantics, Glossary & Reference Data", ["lexical","spo","taxonomy","ontology","semanticbinding","semantic binding","referencedata","reference data","codeset","code set","businessrule","business rule","glossary","term","namingstandard"]],
   ["AI, Agents & Models", ["aiusecase","ai usecase","aiagent","ai agent","semanticmodel","semantic model","aimodel","ai model","knowledgeasset","knowledge asset","modelcard","modelmonitoring","aiinventory","inventory","prompt","eval","monitoring","fairness","explainability","usecase","use-case"," ai","agent"]],
   ["Information Concepts & Records", ["informationconcept","information concept","conceptlifecycle","recordclass","record class","evidence","concept","record"]],
   ["Data Products & Contracts", ["dataproduct","data product","datacontract","data contract","datadomain","data domain","dataasset","data asset","storageplatform","storage platform","cdp","activation","contract","domain"]],
   ["Governance, Policy & Controls", ["policy","control","audit","assurance","governancecouncil","governance council","ownershiprole","ownership role","role","risk","obligation","authority","standard","bundle","exception","governance","expectation","incident","error","prohibition","permission","enforcement"]],
   ["Ethical Stewardship", ["steward","ethical","humanoutcome","human outcome","equity","inclusion","collectivebenefit","collective benefit"]],
   ["Delivery, Change & Adoption", ["investmentcase","investment case","readiness","implementationgate","implementation","gate","poc","validationplan","initiative","release","dependency","changerequest","change request","backlog","adoption","training","champion","community"]],
   ["Traceability & Mappings", ["traceability","extended","naming","kpi","metric","map","registry"]],
  ];
  MX.GROUPS=GROUPS;
  MX.layerOf=function(name){
    var n=String(name).toLowerCase().replace(/^\s*\d+\s*·\s*/,"");
    for(var i=0;i<GROUPS.length;i++){ var kw=GROUPS[i][1];
      for(var j=0;j<kw.length;j++){ if(n.indexOf(kw[j])>=0) return GROUPS[i][0]; } }
    return "Other";
  };
  MX.slug=function(name){ return String(name).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); };
  MX.num=function(name){ var m=String(name).match(/^\s*(\d+)/); return m?parseInt(m[1],10):9999; };

  function toks(v){ return String(v==null?"":v).split(/[,;|\/\n]/).map(function(x){return x.trim();}).filter(Boolean); }

  // Denormalised reporting views — excluded from FK derivation (they enumerate a
  // whole chain per row and would otherwise create meaningless cross-links).
  // Only genuine denormalised reporting views (they enumerate a whole chain per
  // row). NOT registers/inventories, which are real masters with governed FKs.
  function isViewSheet(name){
    return /traceab|elementregistry|end.?to.?end/i.test(String(name));
  }

  // Pick the human display-name column: exact Name/Title/Label, else a *Name
  // column that is not an *ID, else the first column after the id, else the id.
  function nameIdx(headers){
    var lc=headers.map(function(h){return String(h).toLowerCase();});
    for(var i=0;i<lc.length;i++){ if(lc[i]==="name"||lc[i]==="title"||lc[i]==="label") return i; }
    for(var i=1;i<lc.length;i++){ if(/name$/.test(lc[i]) && !/id$/.test(lc[i])) return i; }
    for(var i=1;i<lc.length;i++){ if(/(stagename|kpiname|termname|conceptname|productname|rolename|agentname|modelname)/.test(lc[i])) return i; }
    return headers.length>1?1:0;
  }

  MX.build=function(sheets){
    MX.SHEETS=sheets||[];
    var ENT={};                              // id -> {id,name,sheet,kind,headers,row}
    function add(s){
      if(!s.headers.length || !/id$/i.test(s.headers[0])) return;
      var ni=nameIdx(s.headers);
      s.rows.forEach(function(r){ var id=r[0]; if(id==null||id==="") return;
        if(!ENT[id]){ var nm=(ni<r.length && r[ni]!=null && String(r[ni]).trim())?String(r[ni]).trim():id;
          ENT[id]={id:id,name:nm,sheet:s.name,kind:s.kind,headers:s.headers,row:r}; } });
    }
    MX.SHEETS.forEach(function(s){ if(s.kind!=="map") add(s); });   // masters/forms give home + name
    MX.SHEETS.forEach(function(s){ if(s.kind==="map") add(s); });   // maps fill any leftover ids
    MX.ENT=ENT;

    // adjacency: TRUE foreign keys only. For each row, its first column is the
    // owning key; every OTHER column whose token is a governed id becomes a
    // directed edge owner→target (owner references target). Views excluded.
    var ADJ={};
    function edge(a,o,sheet,field){
      if(a===o) return;
      var m=ADJ[a]||(ADJ[a]={}); var rec=m[o]||(m[o]={vias:{},dir:{}});
      rec.vias[sheet+" · "+field]=1; rec.dir.out=1;
      var m2=ADJ[o]||(ADJ[o]={}); var rec2=m2[a]||(m2[a]={vias:{},dir:{}});
      rec2.vias[sheet+" · "+field]=1; rec2.dir["in"]=1;
    }
    MX.SHEETS.forEach(function(s){
      if(isViewSheet(s.name)) return;
      var H=s.headers;
      s.rows.forEach(function(r){
        var owner=r[0]; if(owner==null||owner===""||!ENT[owner]) return;
        for(var i=1;i<r.length;i++){
          var field=H[i]||("col"+i);
          toks(r[i]).forEach(function(tk){ if(ENT[tk]) edge(owner,tk,s.name,field); });
        }
      });
    });
    MX.ADJ=ADJ;
    return MX;
  };

  MX.rels=function(id){ return (MX.ADJ&&MX.ADJ[id])||{}; };
  MX.isId=function(t){ return !!(MX.ENT&&MX.ENT[t]); };
  MX.nameOf=function(id){ var e=MX.ENT&&MX.ENT[id]; return e?(e.name||id):id; };

  // linkify an attribute value: id tokens become clickable (showing the name on
  // hover), prose stays text
  MX.linkVal=function(v){
    if(v==null||v==="") return '<span class="mut">·</span>';
    return String(v).split(/([,;|])/).map(function(p){ var t=p.trim();
      if(t && MX.ENT[t]){ var nm=MX.ENT[t].name||t;
        return '<a class="idlink" title="'+esc(nm)+'" onclick="MODELX.detail(\''+t.replace(/'/g,"\\'")+'\')">'+esc(t)+'</a>'; }
      return esc(p);
    }).join("");
  };

  MX.attrsHtml=function(id){
    var e=MX.ENT[id]; if(!e) return "";
    return '<table class="mxkv">'+e.headers.map(function(h,i){
      return '<tr><td class="k">'+esc(h)+'</td><td>'+MX.linkVal(e.row[i])+'</td></tr>';
    }).join("")+'</table>';
  };

  function arrowFor(dir){ var o=!!dir.out, i=!!dir["in"];
    return (o&&i)?"↔":(o?"→":(i?"←":"·")); }
  function relLabel(vias){ // shorten "12 · Sheet_Name · Field" -> "Sheet_Name · Field"
    return vias.map(function(v){ return v.replace(/^\s*\d+\s*·\s*/,""); }).join("\n");
  }

  // Structured relationships: related entities resolved to name + layer +
  // direction, sorted by layer then name. Deduplicated (one entry per element).
  MX.related=function(id){
    var rl=MX.rels(id), ids=Object.keys(rl), byL={}, order=[], count=ids.length;
    ids.forEach(function(o){
      var oe=MX.ENT[o]||{id:o,name:o,sheet:"—"};
      var layer=oe.sheet?MX.layerOf(oe.sheet):"Other";
      (byL[layer]=byL[layer]||[]).push({
        id:o, name:oe.name||o, sheet:oe.sheet,
        arrow:arrowFor(rl[o].dir), via:relLabel(Object.keys(rl[o].vias))
      });
    });
    GROUPS.forEach(function(g){ if(byL[g[0]]) order.push(g[0]); }); if(byL["Other"]) order.push("Other");
    Object.keys(byL).forEach(function(l){ byL[l].sort(function(a,b){ return String(a.name).localeCompare(String(b.name)); }); });
    return {order:order, byLayer:byL, count:count};
  };
  MX.relGroups=MX.related; // back-compat alias

  function nm(s,max){ s=String(s==null?"":s); return s.length>max?s.slice(0,max-1)+"…":s; }

  // Detail-panel view: chips grouped by layer, each showing arrow + NAME + id
  MX.relChipsHtml=function(id){
    var g=MX.related(id); if(!g.count) return '<span class="mut">No governed relationships.</span>';
    return g.order.map(function(l){
      var chips=g.byLayer[l].map(function(it){
        return '<a class="relchip" title="'+esc(it.via)+'" onclick="MODELX.detail(\''+it.id.replace(/'/g,"\\'")+'\')">'+
          '<span class="ar">'+it.arrow+'</span>'+esc(nm(it.name,46))+' <span class="rid">'+esc(it.id)+'</span></a>';
      }).join("");
      return '<div class="mxlg">'+esc(l)+' <span class="c">'+g.byLayer[l].length+'</span></div><div class="mxrelwrap">'+chips+'</div>';
    }).join("");
  };

  // Catalogue view: compact readable lines — NAME (id) per related element,
  // grouped by layer, with the direction arrow. Names primary, ids secondary.
  MX.relCompactHtml=function(id){
    var g=MX.related(id); if(!g.count) return '<span class="mut">No governed relationships.</span>';
    return g.order.map(function(l){
      var lst=g.byLayer[l].map(function(it){
        return '<a class="idlink relname" title="'+esc(it.name)+' — '+esc(it.via)+'" onclick="MODELX.detail(\''+it.id.replace(/'/g,"\\'")+'\')">'+
          '<span class="ar">'+it.arrow+'</span>'+esc(nm(it.name,52))+' <span class="rid">'+esc(it.id)+'</span></a>';
      }).join("");
      return '<div class="mxcline"><span class="ll">'+esc(l)+' ('+g.byLayer[l].length+')</span> '+lst+'</div>';
    }).join("");
  };

  MX.detail=function(id){
    var e=MX.ENT[id]; if(!e || !W.PACK || !PACK.openPanel) return;
    var g=MX.related(id);
    // deep-link to the governed term in the Glossary Workbench, if this element is one
    var gurl = (PACK.glossaryUrlFor ? (PACK.glossaryUrlFor(e.name) || PACK.glossaryUrlFor(id)) : "");
    var glossHtml = gurl ? ('<div style="margin:0 0 10px"><a href="'+esc(gurl)+'" target="_blank" rel="noopener" '+
        'style="display:inline-flex;align-items:center;gap:6px;font-size:.82rem;font-weight:600;color:#0e7490;text-decoration:none;border:1px solid #bae6fd;background:#f0f9ff;border-radius:8px;padding:5px 11px">'+
        '📖 Open “'+esc(e.name||id)+'” in the Glossary Workbench ↗</a></div>') : "";
    var body=
      '<div class="mxmeta"><span class="mut">'+esc(e.sheet)+'</span> &nbsp;·&nbsp; <span class="mut">'+esc(MX.layerOf(e.sheet))+'</span> &nbsp;·&nbsp; <span class="mut">'+esc(e.kind)+'</span></div>'+
      glossHtml+
      '<h4>Attributes</h4>'+MX.attrsHtml(id)+
      '<h4>Relationships <span class="mut">('+g.count+')</span></h4>'+
      '<div class="mut" style="font-size:.76rem;margin:0 0 8px">Every element linked to this one by a governed foreign key. &nbsp;→ references &nbsp;· &nbsp;← referenced by &nbsp;· &nbsp;↔ both. Hover for the joining sheet &amp; field; click any element to open it.</div>'+
      MX.relChipsHtml(id);
    PACK.openPanel(id, esc(e.name||id)+' <span style="font-weight:400;color:var(--mut);font-size:.82rem">'+esc(id)+'</span>', body);
  };
})();
