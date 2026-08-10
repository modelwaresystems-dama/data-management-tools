/* ============================================================================
   Model Explorer — resolves every element of the governed model and all of its
   relationships. Builds an entity index (id → home sheet, name, attributes) and
   an adjacency index (id ↔ id) by treating every ID that co-occurs in a row as a
   relationship, labelled by the sheet + field and direction (references / is
   referenced by). Shared by the Model Review page and the Element Relationships
   catalogue.
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

  MX.build=function(sheets){
    MX.SHEETS=sheets||[];
    var ENT={};                              // id -> {id,name,sheet,kind,headers,row}
    function add(s){
      if(!s.headers.length || !/id$/i.test(s.headers[0])) return;
      s.rows.forEach(function(r){ var id=r[0]; if(id==null||id==="") return;
        if(!ENT[id]) ENT[id]={id:id,name:(r.length>1&&r[1]?r[1]:id),sheet:s.name,kind:s.kind,headers:s.headers,row:r}; });
    }
    MX.SHEETS.forEach(function(s){ if(s.kind!=="map") add(s); });   // masters/forms give home + name
    MX.SHEETS.forEach(function(s){ if(s.kind==="map") add(s); });   // maps fill any leftover ids
    MX.ENT=ENT;
    // adjacency: co-occurrence in a row = relationship (labelled by sheet+field, with direction)
    var ADJ={};
    MX.SHEETS.forEach(function(s){
      s.rows.forEach(function(r){
        var pres=[];
        for(var i=0;i<r.length;i++){ toks(r[i]).forEach(function(tk){ if(ENT[tk]) pres.push({id:tk,field:s.headers[i]||("col"+i)}); }); }
        if(pres.length<2) return;
        var head0=r[0];
        for(var a=0;a<pres.length;a++){ for(var c=0;c<pres.length;c++){ if(a===c) continue;
          var A=pres[a].id, O=pres[c].id; if(A===O) continue;
          var m=ADJ[A]||(ADJ[A]={}); var rec=m[O]||(m[O]={vias:{},dirs:{}});
          rec.vias[s.name+" · "+pres[c].field]=1;
          rec.dirs[(head0===A)?"out":((head0===O)?"in":"via")]=1;
        }}
      });
    });
    MX.ADJ=ADJ;
    return MX;
  };

  MX.rels=function(id){ return (MX.ADJ&&MX.ADJ[id])||{}; };
  MX.isId=function(t){ return !!(MX.ENT&&MX.ENT[t]); };

  // linkify an attribute value: id tokens become clickable, prose stays text
  MX.linkVal=function(v){
    if(v==null||v==="") return '<span class="mut">·</span>';
    return String(v).split(/([,;|])/).map(function(p){ var t=p.trim();
      return (t && MX.ENT[t]) ? '<a class="idlink" onclick="MODELX.detail(\''+t.replace(/'/g,"\\'")+'\')">'+esc(t)+'</a>' : esc(p);
    }).join("");
  };

  MX.attrsHtml=function(id){
    var e=MX.ENT[id]; if(!e) return "";
    return '<table class="mxkv">'+e.headers.map(function(h,i){
      return '<tr><td class="k">'+esc(h)+'</td><td>'+MX.linkVal(e.row[i])+'</td></tr>';
    }).join("")+'</table>';
  };

  // relationships grouped by the related entity's architecture layer
  MX.relGroups=function(id){
    var rl=MX.rels(id), ids=Object.keys(rl), byL={};
    ids.forEach(function(o){ var oe=MX.ENT[o]; var ol=oe?MX.layerOf(oe.sheet):"Other"; (byL[ol]=byL[ol]||[]).push(o); });
    var order=[]; GROUPS.forEach(function(g){ if(byL[g[0]]) order.push(g[0]); }); if(byL["Other"]) order.push("Other");
    Object.keys(byL).forEach(function(l){ byL[l].sort(); });
    return {order:order, byLayer:byL, count:ids.length, rl:rl};
  };
  function arrowFor(dirs){ var d=Object.keys(dirs);
    return (d.indexOf("out")>=0&&d.indexOf("in")>=0)?"↔":(d[0]==="out"?"→":(d[0]==="in"?"←":"·")); }

  MX.relChipsHtml=function(id){
    var g=MX.relGroups(id); if(!g.count) return '<span class="mut">No relationships.</span>';
    return g.order.map(function(l){
      var chips=g.byLayer[l].map(function(o){ var oe=MX.ENT[o]||{name:o};
        var via=Object.keys(g.rl[o].vias).join("\n");
        return '<a class="relchip" title="'+esc(via)+'" onclick="MODELX.detail(\''+o.replace(/'/g,"\\'")+'\')">'+
          '<span class="ar">'+arrowFor(g.rl[o].dirs)+'</span><span class="rid">'+esc(o)+'</span> '+esc(String(oe.name||o).slice(0,44))+'</a>';
      }).join("");
      return '<div class="mxlg">'+esc(l)+' <span class="c">'+g.byLayer[l].length+'</span></div><div class="mxrelwrap">'+chips+'</div>';
    }).join("");
  };
  // compact relationship line (ids only, grouped) — for the print catalogue
  MX.relCompactHtml=function(id){
    var g=MX.relGroups(id); if(!g.count) return '<span class="mut">No relationships.</span>';
    return g.order.map(function(l){
      var lst=g.byLayer[l].map(function(o){ var oe=MX.ENT[o]||{name:o};
        return '<a class="idlink" title="'+esc(oe.name||o)+' — '+esc(Object.keys(g.rl[o].vias)[0]||"")+'" onclick="MODELX.detail(\''+o.replace(/'/g,"\\'")+'\')">'+esc(o)+'</a>';
      }).join(", ");
      return '<div class="mxcline"><span class="ll">'+esc(l)+' ('+g.byLayer[l].length+')</span> '+lst+'</div>';
    }).join("");
  };

  MX.detail=function(id){
    var e=MX.ENT[id]; if(!e || !W.PACK || !PACK.openPanel) return;
    var g=MX.relGroups(id);
    var body=
      '<div class="mxmeta"><span class="mut">'+esc(e.sheet)+'</span> &nbsp;·&nbsp; <span class="mut">'+esc(MX.layerOf(e.sheet))+'</span> &nbsp;·&nbsp; <span class="mut">'+esc(e.kind)+'</span></div>'+
      '<h4>Attributes</h4>'+MX.attrsHtml(id)+
      '<h4>Relationships <span class="mut">('+g.count+')</span></h4>'+
      '<div class="mut" style="font-size:.76rem;margin:0 0 8px">Every element linked to this one across the whole model. &nbsp;→ references &nbsp;· &nbsp;← referenced by &nbsp;· &nbsp;↔ both. Hover for how; click to open.</div>'+
      MX.relChipsHtml(id);
    PACK.openPanel(id, esc(e.name||id)+' <span style="font-weight:400;color:var(--mut);font-size:.82rem">'+esc(id)+'</span>', body);
  };
})();
