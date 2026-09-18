<script>
/* =====================================================================
   CORE: workbook parsing, model index, state and persistence
   ===================================================================== */
"use strict";
var $  = function(s,r){return (r||document).querySelector(s);};
var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
/* House style: no em dashes in anything this app generates. Text pulled from the
   company workbook may carry them, so they are normalised to a comma on the way
   out. Only U+2014 is touched. En dashes are left alone because they carry
   meaning in numeric ranges such as 0.80-1.25 and 45-80 min. */
function noem(s){ return String(s==null?"":s).replace(/\s*\u2014\s*/g,", "); }
function esc(s){return noem(s).replace(/[&<>"']/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function el(tag,attrs,html){var e=document.createElement(tag);
  if(attrs)Object.keys(attrs).forEach(function(k){ if(k==="class")e.className=attrs[k];
    else if(k.slice(0,2)==="on")e.addEventListener(k.slice(2),attrs[k]); else e.setAttribute(k,attrs[k]);});
  if(html!=null)e.innerHTML=html; return e;}
function uid(p){return (p||"x")+Math.random().toString(36).slice(2,8);}
function splitList(v){ if(v==null)return []; return String(v).split(/[,;|]/).map(function(s){return s.trim();}).filter(Boolean);}
/* Some generators serialise an absent value as the literal text "None" or "nan".
   Treat those as blank, or every join against them silently matches nothing. */
function cell(v){ var s=String(v==null?"":v).trim();
  if(s==="None"||s==="nan"||s==="NaN"||s==="null"||s==="undefined") return "";
  /* TODO marks a cell a human has still to decide. It is never a value.
     Reading it as one would report an unsigned verdict as signed. */
  if(s==="TODO"||s==="TBD"||s==="Threshold TBD") return "";
  return s; }
function nowISO(){return new Date().toISOString().slice(0,10);}
/* Saving a file. Locally this is a blob link. Published on claude.ai the viewer
   sandbox blocks that, so route through the downloads capability when present. */
var HOSTED = (typeof window!=="undefined" && window.claude && typeof window.claude.use==="function");
function download(name,blob){
  if(HOSTED){ hostedSave(name,blob); return; }
  var u=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=u;a.download=name;document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(u);a.remove();},400);}
function hostedSave(name,blob){
  window.claude.use("downloads").then(function(d){
    if(!d){ alert("This hosted copy cannot save files. Open the downloadable AI Eval Framework HTML file to export."); return; }
    return blob.arrayBuffer().then(function(buf){ return d.save({filename:name,data:buf}); });
  }).then(function(r){ if(r) toast("Saved "+name); })
   .catch(function(e){
    var c=e&&e.code;
    if(c==="declined") return;
    if(c==="rejected_extension"||c==="extension_not_enabled")
      alert("This hosted copy cannot hand you a ."+String(name.split(".").pop())+" file.\n\n"+
            "Markdown and JSON exports work here. For the Excel evaluation workbook, open the downloadable "+
            "AI Eval Framework HTML file. It runs the same app with full exports.");
    else alert("Could not save "+name+(e&&e.message?": "+e.message:"."));
  });}
function toast(msg){
  var t=document.getElementById("toast");
  if(!t){ t=document.createElement("div"); t.id="toast";
    t.style.cssText="position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#12325a;color:#fff;"+
      "padding:9px 16px;border-radius:20px;font-size:.83rem;z-index:99;box-shadow:0 4px 14px rgba(20,40,80,.28)";
    document.body.appendChild(t);}
  t.textContent=msg; t.style.display="block";
  clearTimeout(toast._t); toast._t=setTimeout(function(){t.style.display="none";},2600);}

/* ---------------------------------------------------------------
   MODEL: read a FutureState workbook into indexed tables
   Convention: row 1 sheet name, row 2 company, row 3 blank,
   row 4 headers, rows 5+ data. Detected defensively.
   --------------------------------------------------------------- */
var MODEL = {loaded:false, company:"", sheets:{}, file:""};

function normSheet(name){ return String(name).replace(/^\s*\d+\s*[·.\-]\s*/,"").trim(); }

function findHeaderRow(rows){
  for(var i=0;i<Math.min(rows.length,10);i++){
    var r=rows[i]||[], filled=r.filter(function(c){return c!=null&&String(c).trim()!=="";});
    if(filled.length<2) continue;
    var first=String(r[0]||"").trim();
    if(!first) continue;
    if(/id$/i.test(first)||/^(ref|priority|gate|spine layer|quality pillar|component|field name|section)$/i.test(first)) return i;
    var next=rows[i+1]||[];
    if(next.filter(function(c){return c!=null&&String(c).trim()!=="";}).length>=2 && filled.length>=2 && i>=2) return i;
  }
  return rows.length>3?3:0;
}

function parseWorkbook(ab){
  var wb=XLSX.read(ab,{type:"array"});
  var sheets={}, company="";
  wb.SheetNames.forEach(function(sn){
    var rows=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,defval:null,blankrows:true});
    if(!rows.length) return;
    if(!company && rows[1] && rows[1][0]){
      var c=String(rows[1][0]); if(/architecture|—|-/.test(c)) company=c.split("—")[0].trim();
    }
    var h=findHeaderRow(rows), hdr=(rows[h]||[]).map(function(c){return String(c==null?"":c).trim();});
    var data=[];
    for(var i=h+1;i<rows.length;i++){
      var r=rows[i]||[];
      if(r.filter(function(c){return c!=null&&String(c).trim()!=="";}).length===0) continue;
      var o={};
      for(var j=0;j<hdr.length;j++){ if(!hdr[j]) continue; var v=r[j]; o[hdr[j]]=(v==null||v==="")?"":v; }
      o.__row=i+1; data.push(o);
    }
    sheets[normSheet(sn)]={raw:sn,headers:hdr,rows:data};
  });
  MODEL.sheets=sheets; MODEL.company=company||"Company"; MODEL.loaded=true;
  return sheets;
}

function S(name){ var s=MODEL.sheets[name]; return s?s.rows:[]; }
function col(row,names){ for(var i=0;i<names.length;i++){ if(row&&row[names[i]]!=null&&row[names[i]]!=="") return row[names[i]]; } return ""; }
function findRow(sheet,idField,id){ var rs=S(sheet); for(var i=0;i<rs.length;i++){ if(String(rs[i][idField]).trim()===String(id).trim()) return rs[i]; } return null; }
function findRows(sheet,field,id){ return S(sheet).filter(function(r){return String(r[field]||"").trim()===String(id).trim();}); }
function nameOf(sheet,idField,id,nameField){ var r=findRow(sheet,idField,id); return r?String(r[nameField||"Name"]||id):""; }

/* ---------------------------------------------------------------
   Golden thread resolution for one AI Use Case
   --------------------------------------------------------------- */
function resolveDomainId(v){
  v=String(v||"").trim(); if(!v) return "";
  if(findRow("DataDomain","DataDomainID",v)) return v;
  var m=S("DataDomain").filter(function(r){return String(r.Name||"").trim().toLowerCase()===v.toLowerCase();})[0];
  return m?String(m.DataDomainID):v;
}
function resolveSpine(ucId){
  var out={}, uc=findRow("AIUseCase","AIUseCaseID",ucId);
  function put(k,ids,names,note){ out[k]={ids:ids||[],names:names||[],note:note||""}; }
  if(!uc) return out;

  put("usecase",[ucId],[String(uc.Name||"")], String(uc.Description||""));

  /* decisions */
  var decIds=splitList(uc.Decisions);
  findRows("Decision_AIUseCase_Map","AIUseCaseID",ucId).forEach(function(r){
    splitList(r.DecisionID).forEach(function(d){ if(decIds.indexOf(d)<0)decIds.push(d); });});
  put("decision",decIds,decIds.map(function(d){return nameOf("DecisionModel","DecisionID",d);}));

  /* agents & models */
  var agIds=splitList(uc.Agents);
  findRows("AIUseCase_AIAgent_Map","AIUseCaseID",ucId).forEach(function(r){
    splitList(r.AgentID).forEach(function(a){ if(agIds.indexOf(a)<0)agIds.push(a); });});
  var agNames=agIds.map(function(a){return nameOf("AIAgent","AgentID",a);});
  var models=S("AIModel").filter(function(m){
    return agIds.some(function(a){return String(col(m,["AgentID","UsedByAgent","Agent"])||"").indexOf(a)>=0;});});
  models.forEach(function(m){ var id=String(col(m,["AIModelID","ModelID"])||"");
    if(id&&agIds.indexOf(id)<0){agIds.push(id);agNames.push(String(m.Name||""));}});
  put("agent",agIds,agNames);

  /* semantic models */
  var semIds=[];
  agIds.forEach(function(a){ var ag=findRow("AIAgent","AgentID",a);
    if(ag) splitList(ag.SemanticModels).forEach(function(s){if(semIds.indexOf(s)<0)semIds.push(s);});});
  S("SemanticModel").forEach(function(sm){
    var used=splitList(sm.UsedByAgents);
    if(used.some(function(u){return agIds.indexOf(u)>=0;})){
      var id=String(sm.SemanticModelID||""); if(semIds.indexOf(id)<0)semIds.push(id);}});
  put("semantic",semIds,semIds.map(function(s){return nameOf("SemanticModel","SemanticModelID",s);}));

  /* data products */
  var dpIds=[],dpNote=[];
  findRows("DataProduct_AIUseCase_Map","AIUseCaseID",ucId).forEach(function(r){
    var d=String(r.DataProductID||"").trim();
    if(d&&dpIds.indexOf(d)<0){dpIds.push(d);
      if(r.ApprovalStatus) dpNote.push(d+": "+r.ApprovalStatus+(r.ContractID?" · "+r.ContractID:""));}});
  agIds.forEach(function(a){ findRows("AIAgent_DataProduct_Map","AgentID",a).forEach(function(r){
    var d=String(r.DataProductID||"").trim();
    if(d&&dpIds.indexOf(d)<0){dpIds.push(d); dpNote.push(d+": reached via agent "+a+", not certified to the use case");}});});
  put("dataproduct",dpIds,dpIds.map(function(d){return nameOf("DataProduct","DataProductID",d);}),dpNote.join(" · "));

  /* data domains */
  var domIds=[];
  var domIdOf=resolveDomainId;
  function _unusedDomIdOf(v){ v=String(v||"").trim(); if(!v) return "";
    if(findRow("DataDomain","DataDomainID",v)) return v;
    var m=S("DataDomain").filter(function(r){return String(r.Name||"").trim().toLowerCase()===v.toLowerCase();})[0];
    return m?String(m.DataDomainID):v; }
  dpIds.forEach(function(d){ var dp=findRow("DataProduct","DataProductID",d);
    var dm=dp?domIdOf(dp.Domain):"";
    if(dm&&domIds.indexOf(dm)<0)domIds.push(dm);
    findRows("DataProduct_DataDomain_Map","DataProductID",d).forEach(function(r){
      var x=String(r.DataDomainID||"").trim(); if(x&&domIds.indexOf(x)<0)domIds.push(x);});});
  put("domain",domIds,domIds.map(function(d){ var r=findRow("DataDomain","DataDomainID",d);
    return r?String(r.Name||d):d;}));

  /* CDEs via decisions */
  var cdeIds=[];
  decIds.forEach(function(d){ findRows("Decision_CDE_Map","DecisionID",d).forEach(function(r){
    var c=String(r.CDEID||"").trim(); if(c&&cdeIds.indexOf(c)<0)cdeIds.push(c);});});
  S("CriticalDataElement").forEach(function(c){
    if(splitList(c.Decisions).some(function(d){return decIds.indexOf(d)>=0;})){
      var id=String(c.CDEID||""); if(id&&cdeIds.indexOf(id)<0)cdeIds.push(id);}});
  put("cde",cdeIds,cdeIds.map(function(c){return nameOf("CriticalDataElement","CDEID",c);}));

  /* processes from decisions */
  var procIds=[];
  decIds.forEach(function(d){
    S("BusinessProcess").forEach(function(p){
      if(splitList(p.Decisions).indexOf(d)>=0){var id=String(p.ProcessID||"");if(procIds.indexOf(id)<0)procIds.push(id);}});
    findRows("Process_Decision_Map","DecisionID",d).forEach(function(r){
      var p=String(r.ProcessID||"").trim(); if(p&&procIds.indexOf(p)<0)procIds.push(p);});
    findRows("ProcessStep_Decision_Map","DecisionID",d).forEach(function(r){
      var p=String(col(r,["ProcessStepID","StepID"])||"").trim(); if(p&&procIds.indexOf(p)<0)procIds.push(p);});});
  put("process",procIds,procIds.map(function(p){
    return nameOf("BusinessProcess","ProcessID",p)||nameOf("ProcessStep","ProcessStepID",p)||"";}));

  /* capabilities from processes */
  var capIds=[];
  procIds.forEach(function(p){ var pr=findRow("BusinessProcess","ProcessID",p);
    if(pr) splitList(pr.Capabilities).forEach(function(c){if(capIds.indexOf(c)<0)capIds.push(c);});});
  put("capability",capIds,capIds.map(function(c){return nameOf("BusinessCapability","CapabilityID",c);}));

  /* value stages from capabilities */
  var vsgIds=[];
  capIds.forEach(function(c){ findRows("ValueStage_Capability_Map","CapabilityID",c).forEach(function(r){
    var v=String(col(r,["ValueStageID","StageID"])||"").trim(); if(v&&vsgIds.indexOf(v)<0)vsgIds.push(v);});});
  put("vstage",vsgIds,vsgIds.map(function(v){ var r=findRow("ValueStage","ValueStageID",v);
    return r?String(col(r,["StageName","Name"])||v):v;}));

  /* value streams */
  var vsIds=[];
  vsgIds.forEach(function(v){ var r=findRow("ValueStage","ValueStageID",v);
    var s=r?String(r.ValueStreamID||"").trim():""; if(s&&vsIds.indexOf(s)<0)vsIds.push(s);});
  put("vstream",vsIds,vsIds.map(function(v){return nameOf("ValueStream","ValueStreamID",v);}));

  /* value propositions */
  var vpIds=[];
  vsIds.forEach(function(v){ var r=findRow("ValueStream","ValueStreamID",v);
    if(r) splitList(r.RelatedValuePropositions).forEach(function(p){if(vpIds.indexOf(p)<0)vpIds.push(p);});
    findRows("VP_ValueStream_Map","ValueStreamID",v).forEach(function(m){
      splitList(m.ValuePropositionID).forEach(function(p){ if(vpIds.indexOf(p)<0)vpIds.push(p); });});});
  put("vp",vpIds,vpIds.map(function(p){ var r=findRow("ValueProposition","ValuePropositionID",p);
    return r?String(col(r,["ValuePropositionName","GenericPromise","Name"])||p):p;}));

  /* stakeholders */
  var shIds=[];
  vpIds.forEach(function(p){ var r=findRow("ValueProposition","ValuePropositionID",p);
    var s=r?String(r.StakeholderID||"").trim():""; if(s&&shIds.indexOf(s)<0)shIds.push(s);
    findRows("Stakeholder_VP_Map","ValuePropositionID",p).forEach(function(m){
      splitList(m.StakeholderID).forEach(function(x){ if(shIds.indexOf(x)<0)shIds.push(x); });});});
  vsIds.forEach(function(v){ var r=findRow("ValueStream","ValueStreamID",v);
    var s=r?String(r.TriggerStakeholderID||"").trim():""; if(s&&shIds.indexOf(s)<0)shIds.push(s);});
  put("stakeholder",shIds,shIds.map(function(s){return nameOf("Stakeholder","StakeholderID",s);}));

  /* outcomes + KPIs */
  var outIds=[],outNames=[];
  findRows("UseCase_BusinessOutcome_Map","UseCaseID",ucId).concat(findRows("UseCase_BusinessOutcome_Map","AIUseCaseID",ucId))
    .forEach(function(r){var o=String(col(r,["OutcomeID","BusinessOutcomeID"])||"").trim();
      if(o&&outIds.indexOf(o)<0)outIds.push(o);});
  var pf=findRow("UseCasePortfolio","UseCaseID",ucId);
  if(pf&&pf.OutcomeID&&outIds.indexOf(String(pf.OutcomeID))<0) outIds.push(String(pf.OutcomeID));
  vpIds.forEach(function(p){ findRows("VP_BusinessOutcome_Map","ValuePropositionID",p).forEach(function(r){
    var o=String(col(r,["OutcomeID","BusinessOutcomeID"])||"").trim(); if(o&&outIds.indexOf(o)<0)outIds.push(o);});});
  outNames=outIds.map(function(o){return nameOf("BusinessOutcome","OutcomeID",o);});
  var kpiIds=[];
  outIds.forEach(function(o){ findRows("BusinessOutcome_KPI_Map","OutcomeID",o).forEach(function(r){
    var k=String(r.KPIID||"").trim(); if(k&&kpiIds.indexOf(k)<0)kpiIds.push(k);});});
  put("outcome",outIds.concat(kpiIds),
      outNames.concat(kpiIds.map(function(k){ var r=findRow("OutcomeKPI","KPIID",k); return r?String(r.KPIName||k):k;})));

  /* records / governance */
  var ctlIds=[];
  findRows("AIUseCase_Control_Map","AIUseCaseID",ucId).forEach(function(r){
    var c=String(r.ControlID||"").trim(); if(c&&ctlIds.indexOf(c)<0)ctlIds.push(c);});
  put("records",ctlIds.slice(0,12),ctlIds.slice(0,12).map(function(c){
    var r=findRow("Standard_Control","ControlID",c); return r?String(r.Name||c):c;}),
    ctlIds.length>12?(ctlIds.length+" mapped controls in total"):"");
  var roles=[];
  S("Role_Allocation").forEach(function(r){
    if(String(col(r,["UseCaseID","AIUseCaseID"])||"").trim()===ucId){
      var rl=String(col(r,["RoleID","Role","OwnerRole"])||""); if(rl&&roles.indexOf(rl)<0)roles.push(rl);}});
  S("UseCase_RoleAllocation").forEach(function(r){
    if(String(col(r,["UseCaseID","AIUseCaseID"])||"").trim()===ucId){
      var rl=String(col(r,["RoleID","Role","OwnerRole"])||""); if(rl&&roles.indexOf(rl)<0)roles.push(rl);}});
  put("governance",roles,roles.map(function(r){return nameOf("OwnershipRole","RoleID",r)||"";}));
  return out;
}

/* eval rows for the use case's agents/models */
function evalRowsFor(ucId,spine){
  var targets={}; (spine.agent&&spine.agent.ids||[]).forEach(function(a){targets[a]=1;});
  targets[ucId]=1;
  var out=[];
  S("AIEval").forEach(function(r){
    var t=String(r.TargetID||"").trim();
    if(targets[t]) out.push({
      id:String(r.EvalID||uid("EV")), target:t, targetName:String(r.TargetName||""),
      evalName:String(r.EvalName||""), category:String(r.Category||""), metric:String(r.Metric||""),
      threshold:String(r.Threshold||""), method:String(r.Method||""), freq:String(r.Frequency||""),
      result:String(r.Result==null?"":r.Result),
      /* v2 renames Status to RecordedStatus_Historic to say plainly that it is
         history and never authority. Both spellings are read, because the
         recorded-versus-computed mismatch is the exercise in session step 15
         and it must survive the rename. */
      recorded:String(r.RecordedStatus_Historic||r.Status||""), evidence:String(r.EvidenceID||""),
      owner:String(r.OwnerRole||"")});
  });
  return out;
}

/* ---- threshold recomputation ---------------------------------- */
function num(v){ if(v==null||v==="")return null; var n=parseFloat(String(v).replace(/[^0-9.\-eE]/g,"")); return isNaN(n)?null:n; }
function parseThreshold(t){
  var s=String(t||"").replace(/\s+/g,"").replace(/[–—]/g,"-").replace(/≥/g,">=").replace(/≤/g,"<=").replace(/%/g,"");
  if(!s) return {op:"manual"};
  var m=s.match(/^(-?\d*\.?\d+)-(-?\d*\.?\d+)$/);
  if(m) return {op:"range",lo:parseFloat(m[1]),hi:parseFloat(m[2])};
  m=s.match(/^(>=|<=|>|<|=)?(-?\d*\.?\d+)$/);
  if(m) return {op:m[1]||">=",v:parseFloat(m[2])};
  return {op:"manual"};
}
function computeStatus(result,threshold){
  var p=parseThreshold(threshold), r=num(result);
  if(p.op==="manual"||r===null) return "";
  switch(p.op){
    case "range": return (r>=p.lo&&r<=p.hi)?"Pass":"Fail";
    case ">=": return r>=p.v?"Pass":"Fail";
    case "<=": return r<=p.v?"Pass":"Fail";
    case ">":  return r> p.v?"Pass":"Fail";
    case "<":  return r< p.v?"Pass":"Fail";
    case "=":  return r===p.v?"Pass":"Fail";
  }
  return "";
}
function flagOf(recorded,computed){
  if(!computed) return "";
  var rec=String(recorded||"").trim();
  if(!rec) return "Unrecorded";
  if(rec.toLowerCase()===computed.toLowerCase()) return "";
  if(computed==="Fail"&&/pass/i.test(rec)) return "Critical";
  return "Mismatch";
}

/* ---------------------------------------------------------------
   STATE
   --------------------------------------------------------------- */
/* Model answers live in the facilitator build only. The student build ships a stub. */
function answerFor(n){
  return (typeof MODEL_ANSWERS!=="undefined" && MODEL_ANSWERS[n]) ? MODEL_ANSWERS[n] : "";
}
function isFacilitator(){ return typeof FACILITATOR!=="undefined" && FACILITATOR===true; }

var STATE = null;
var LSKEY = "aievalframework.session.v1";

function blankState(){
  return {
    version:APP_VERSION, created:new Date().toISOString(),
    company:"", modelFile:"", useCaseId:"", useCaseName:"",
    session:{date:nowISO(),facilitator:"",intensity:"Standard",tables:4,participants:16,posture:"Unassessed",tableComp:""},
    step:1, phase:"A", stepsDone:{},
    fields:{},                       /* free-text answers keyed by field key */
    evidence:EVIDENCE_SEED.map(function(e,i){return {id:"EC"+(i+1),text:e.t,kind:e.kind,layer:""};}),
    votes:[], vocab:{}, airoles:{}, pillarOwners:{}, dimOwners:{},
    spine:{}, lanes:{asis:"",prop:""},
    evals:[], framework:{}, remediation:[], gates:[], canvases:[], activeCanvas:"",
    requirements:[], assurance:{}, lifecycle:{},
    decision:{choice:"Not decided",rationale:"",conditions:"",approver:"",review:""},
    sources:DEFAULT_SOURCES.map(function(s){return {ref:s.ref,src:s.src,use:s.use};})
  };
}
function save(){ try{ localStorage.setItem(LSKEY, JSON.stringify(STATE)); }catch(e){} }
function load(){ try{ var s=localStorage.getItem(LSKEY); return s?JSON.parse(s):null; }catch(e){ return null; } }
function setF(k,v){ STATE.fields[k]=v; save(); }
function getF(k,d){ var v=STATE.fields[k]; return (v==null||v==="")?(d||""):v; }
</script>
