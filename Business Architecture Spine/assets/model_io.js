/* ============================================================================
   Nedbank Marketing Pack — Model I/O (Excel export / import)
   Single source of truth for the "one sheet per level" workbook that mirrors
   the CORRECTED traceability hierarchy (the same one the Navigation Graph uses):

     Stakeholder → Value Proposition → Stream (Value Stream / Journey) → Stage
       Stage → KPIs + Capabilities
       Capability → Business Process → Decision (+ Human-in-the-Loop)
       Process/Decision → AI Use-Case → AI Agent
       AI Agent → Data Products + Semantic Models + Human-in-the-Loop
       Data Product → Data Domain

   build(model)      -> [{name, aoa}]           (array-of-arrays per sheet)
   parse(sheetMap)   -> model                   (overlay on a base clone)
   toWorkbook(model, XLSX) / fromWorkbook(wb, XLSX)
   validate(model)   -> [{level, sev, msg}]     (referential integrity)

   Works in the browser (window.PACK) and in Node (global.window). build/parse
   take the model explicitly so the exact same code produces the downloadable
   workbook and the in-pack export — they can never drift apart.
   ========================================================================== */
(function(){
  var W = (typeof window!=="undefined") ? window : (global.window = global.window || {});
  var PACK = W.PACK = W.PACK || {};

  /* ---- small helpers ------------------------------------------------------ */
  function A(x){ return Array.isArray(x)?x:(x==null?[]:[x]); }
  function list(a){ return A(a).join(", "); }
  function parseList(s){ if(Array.isArray(s)) return s.slice();
    return String(s==null?"":s).split(/[,|\n]/).map(function(x){return x.trim();}).filter(Boolean); }
  function num(v){ if(v==null||v==="") return null; var n=Number(v); return isNaN(n)?v:n; }
  function bool(v){ if(typeof v==="boolean") return v; var s=String(v==null?"":v).trim().toLowerCase();
    return s==="yes"||s==="true"||s==="y"||s==="1"; }
  function yn(b){ return b?"Yes":"No"; }
  function jstr(o){ try{ return JSON.stringify(o||{}); }catch(e){ return "{}"; } }
  function jparse(s, fallback){ if(s&&typeof s==="object") return s;
    try{ var o=JSON.parse(String(s)); return (o&&typeof o==="object")?o:fallback; }catch(e){ return fallback; } }
  function pairsOut(children){ return A(children).map(function(c){return c.id+" : "+c.name;}).join(" | "); }
  function pairsIn(s){ return String(s==null?"":s).split(/\s*\|\s*/).map(function(p){return p.trim();}).filter(Boolean)
      .map(function(p){ var i=p.indexOf(":"); return i<0?{id:p.trim(),name:""}:{id:p.slice(0,i).trim(),name:p.slice(i+1).trim()}; }); }
  function byId(arr){ var m={}; A(arr).forEach(function(o){m[o.id]=o;}); return m; }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }

  /* ---- derived relationship helpers (mirror navigation_graph.html) -------- */
  function vpsForSH(m, sid){ return A(m.valuePropositions).filter(function(v){return A(v.stakeholders).indexOf(sid)>=0;}); }
  function vpForStream(m, jid){ return A(m.valuePropositions).filter(function(v){return A(v.journeys).indexOf(jid)>=0;})[0]; }
  function stageKPIs(m, stage){ var w={}; A(stage.kpis).forEach(function(x){w[String(x).toLowerCase()]=1;});
    return A(m.kpis).filter(function(k){return A(k.items).some(function(it){return w[String(it).toLowerCase()];});}).map(function(k){return k.id;}); }
  function capProcesses(m, capId){ return A(m.processes).filter(function(p){return A(p.capabilities).indexOf(capId)>=0;}).map(function(p){return p.id;}); }
  function procDecisions(m, pid){ return A((m.processDecisions||{})[pid]).slice(); }
  function procsForDecision(m, did){ var out=[]; var pd=m.processDecisions||{};
    Object.keys(pd).forEach(function(pid){ if(A(pd[pid]).indexOf(did)>=0) out.push(pid); }); return out; }
  function aiForDecision(m, did){ return A(m.aiUseCases).filter(function(u){return A(u.decisions).indexOf(did)>=0;}).map(function(u){return u.id;}); }
  function agentsForUC(m, uid){ return A(m.aiAgents).filter(function(a){return A(a.useCases).indexOf(uid)>=0;}).map(function(a){return a.id;}); }
  function agentsForDecision(m, did){ var ucs=aiForDecision(m,did);
    return A(m.aiAgents).filter(function(a){return A(a.useCases).some(function(u){return ucs.indexOf(u)>=0;});}); }
  function agentsForDP(m, dpId){ return A(m.aiAgents).filter(function(a){return A(a.dataProducts).indexOf(dpId)>=0;}).map(function(a){return a.id;}); }
  function agentsForSM(m, smId){ return A(m.aiAgents).filter(function(a){return A(a.semanticModels).indexOf(smId)>=0;}).map(function(a){return a.id;}); }
  function dpForDomain(m, dmId){ return A(m.dataProducts).filter(function(p){return p.domain===dmId;}).map(function(p){return p.id;}); }
  function domainById(m, id){ return byId(m.dataDomains)[id]||{}; }
  function cdpForUC(m, uid){ return A((m.aiCdp||{})[uid] && m.aiCdp[uid].services); }
  function stagesFlat(m){ var out=[]; A(m.journeys).forEach(function(j){ A(j.stages).forEach(function(s,i){ out.push({j:j,s:s,idx:i}); }); }); return out; }
  function contract(m, dpId){ return (m.dataContracts||{})[dpId]||{}; }
  function attn(m, capId){ return (m.capAttention||{})[capId]||""; }

  /* ============================================================================
     SHEET SPECS — order defines the workbook (and the hierarchy top→bottom).
     Each: {name, level, element, parent, child, rows(m), cols[], apply(m,recs)}
     A col: {h, out(ctx,m), in:"field"|null, kind:"str|num|list|json|pairs|bool",
             note} — derived (read-only) cols set in:null.
     ========================================================================== */
  var SHEETS = [
    {
      name:"Stakeholder", level:1, element:"Stakeholder", parent:"—", child:"Value Proposition",
      rows:function(m){ return A(m.stakeholders); },
      cols:[
        {h:"ID", out:function(o){return o.id;}, in:"id"},
        {h:"Name", out:function(o){return o.name;}, in:"name"},
        {h:"Members", out:function(o){return o.members;}, in:"members"},
        {h:"Value delivered", out:function(o){return o.value;}, in:"value"},
        {h:"Segment notes", out:function(o){return o.segment;}, in:"segment"},
        {h:"→ Value Propositions", out:function(o,m){return vpsForSH(m,o.id).map(function(v){return v.id;}).join(", ");}, in:null}
      ],
      apply:function(m, recs){ m.stakeholders = recs.map(function(r){
        return {id:r["ID"], name:r["Name"], members:r["Members"], value:r["Value delivered"], segment:r["Segment notes"]}; }); }
    },
    {
      name:"ValueProposition", level:2, element:"Value Proposition", parent:"Stakeholder", child:"Stream",
      rows:function(m){ return A(m.valuePropositions); },
      cols:[
        {h:"ID", out:function(o){return o.id;}, in:"id"},
        {h:"Group", out:function(o){return o.group;}, in:"group"},
        {h:"← Stakeholders", out:function(o){return list(o.stakeholders);}, in:"stakeholders", kind:"list"},
        {h:"Generic promise", out:function(o){return o.generic;}, in:"generic"},
        {h:"Retail", out:function(o){return o.retail;}, in:"retail"},
        {h:"Commercial", out:function(o){return o.commercial;}, in:"commercial"},
        {h:"Wealth", out:function(o){return o.wealth;}, in:"wealth"},
        {h:"Trade", out:function(o){return o.trade;}, in:"trade"},
        {h:"→ Streams", out:function(o){return list(o.journeys);}, in:"journeys", kind:"list"}
      ],
      apply:function(m, recs){ m.valuePropositions = recs.map(function(r){
        return {id:r["ID"], group:r["Group"], stakeholders:parseList(r["← Stakeholders"]),
          generic:r["Generic promise"], retail:r["Retail"], commercial:r["Commercial"], wealth:r["Wealth"], trade:r["Trade"],
          journeys:parseList(r["→ Streams"])}; }); }
    },
    {
      name:"Stream", level:3, element:"Stream (Value Stream / Journey)", parent:"Value Proposition", child:"Stage",
      rows:function(m){ return A(m.journeys); },
      cols:[
        {h:"ID", out:function(o){return o.id;}, in:"id"},
        {h:"Line of business", out:function(o){return o.lob;}, in:"lob"},
        {h:"Name", out:function(o){return o.name;}, in:"name"},
        {h:"Persona", out:function(o){return o.persona;}, in:"persona"},
        {h:"← Value Proposition", out:function(o,m){var v=vpForStream(m,o.id);return v?v.id:"";}, in:null},
        {h:"Stage count", out:function(o){return A(o.stages).length;}, in:null},
        {h:"Stages", out:function(o){return A(o.stages).map(function(s){return s.stage;}).join(" → ");}, in:null}
      ],
      /* build shells; Stage sheet fills .stages (Stream applied before Stage) */
      apply:function(m, recs){ m.journeys = recs.map(function(r){
        return {id:r["ID"], lob:r["Line of business"], name:r["Name"], persona:r["Persona"], stages:[]}; }); }
    },
    {
      name:"Stage", level:4, element:"Value Stream Stage", parent:"Stream", child:"KPI + Capability",
      rows:function(m){ return stagesFlat(m); },
      cols:[
        {h:"Stream ID", out:function(c){return c.j.id;}, in:null},
        {h:"Stage #", out:function(c){return c.idx+1;}, in:null},
        {h:"Stage", out:function(c){return c.s.stage;}, in:null},
        {h:"Experience /5", out:function(c){return c.s.emotion;}, in:null},
        {h:"Touchpoints", out:function(c){return c.s.touchpoints;}, in:null},
        {h:"KPIs (stage metrics)", out:function(c){return list(c.s.kpis);}, in:null},
        {h:"→ KPI themes", out:function(c,m){return list(stageKPIs(m,c.s));}, in:null},
        {h:"→ Capabilities", out:function(c){return list(c.s.capabilities);}, in:null},
        {h:"→ Processes", out:function(c){return list(c.s.processes);}, in:null},
        {h:"→ Decisions", out:function(c){return list(c.s.decisions);}, in:null}
      ],
      apply:function(m, recs){
        var byStream={};
        recs.forEach(function(r){ var sid=r["Stream ID"]; (byStream[sid]=byStream[sid]||[]).push(r); });
        var jmap=byId(m.journeys);
        Object.keys(byStream).forEach(function(sid){
          var j=jmap[sid]; if(!j){ j={id:sid, lob:"", name:sid, persona:"", stages:[]}; m.journeys.push(j); jmap[sid]=j; }
          j.stages = byStream[sid].sort(function(a,b){return (num(a["Stage #"])||0)-(num(b["Stage #"])||0);}).map(function(r){
            return {stage:r["Stage"], emotion:num(r["Experience /5"]), touchpoints:r["Touchpoints"],
              kpis:parseList(r["KPIs (stage metrics)"]), capabilities:parseList(r["→ Capabilities"]),
              processes:parseList(r["→ Processes"]), decisions:parseList(r["→ Decisions"])}; });
        });
      }
    },
    {
      name:"KPI", level:5, element:"KPI theme", parent:"Stage", child:"—",
      rows:function(m){ return A(m.kpis); },
      cols:[
        {h:"ID", out:function(o){return o.id;}, in:"id"},
        {h:"Theme", out:function(o){return o.theme;}, in:"theme"},
        {h:"Metrics", out:function(o){return list(o.items);}, in:"items", kind:"list"},
        {h:"Used in stages", out:function(o,m){ return stagesFlat(m).filter(function(c){return stageKPIs(m,c.s).indexOf(o.id)>=0;})
            .map(function(c){return c.j.id+"#"+(c.idx+1);}).join(", "); }, in:null}
      ],
      apply:function(m, recs){ m.kpis = recs.map(function(r){
        return {id:r["ID"], theme:r["Theme"], items:parseList(r["Metrics"])}; }); }
    },
    {
      name:"Capability", level:6, element:"Business Capability", parent:"Stage", child:"Business Process",
      rows:function(m){ return A(m.capabilities); },
      cols:[
        {h:"ID", out:function(o){return o.id;}, in:"id"},
        {h:"Name", out:function(o){return o.name;}, in:"name"},
        {h:"Maturity", out:function(o){return o.maturity;}, in:"maturity", kind:"num"},
        {h:"Status", out:function(o){return o.status;}, in:"status"},
        {h:"Attention", out:function(o,m){return attn(m,o.id);}, in:null},
        {h:"Definition", out:function(o){return o.def;}, in:"def"},
        {h:"Extension", out:function(o){return yn(o.ext);}, in:null, note:"Added for this engagement vs the Trade Finance baseline"},
        {h:"L2 / L3 children (id : name | …)", out:function(o){return pairsOut(o.children);}, in:"children", kind:"pairs"},
        {h:"→ Business processes", out:function(o,m){return list(capProcesses(m,o.id));}, in:null}
      ],
      apply:function(m, recs){ m.capabilities = recs.map(function(r){
        var o={id:r["ID"], name:r["Name"], maturity:num(r["Maturity"]), status:r["Status"], def:r["Definition"],
          children:pairsIn(r["L2 / L3 children (id : name | …)"])};
        if(bool(r["Extension"])) o.ext=true; return o; }); }
    },
    {
      name:"BusinessProcess", level:7, element:"Business Process", parent:"Capability", child:"Decision",
      rows:function(m){ return A(m.processes); },
      cols:[
        {h:"ID", out:function(o){return o.id;}, in:"id"},
        {h:"Name", out:function(o){return o.name;}, in:"name"},
        {h:"← Capabilities", out:function(o){return list(o.capabilities);}, in:"capabilities", kind:"list"},
        {h:"Inputs", out:function(o){return o.inputs;}, in:"inputs"},
        {h:"Outputs", out:function(o){return o.outputs;}, in:"outputs"},
        {h:"Participants", out:function(o){return o.participants;}, in:"participants"},
        {h:"Extension", out:function(o){return yn(o.ext);}, in:null, note:"Added for this engagement vs the Trade Finance baseline"},
        {h:"→ Decisions", out:function(o,m){return list(procDecisions(m,o.id));}, in:"__procDec"},
        {h:"SIPOC suppliers", out:function(o,m){var s=(m.processSIPOC||{})[o.id];return s?A(s.suppliers).map(function(x){return x.l||x;}).join(", "):"";}, in:null},
        {h:"SIPOC steps", out:function(o,m){var s=(m.processSIPOC||{})[o.id];return s?A(s.steps).join(" › "):"";}, in:null}
      ],
      apply:function(m, recs){
        m.processDecisions = m.processDecisions || {};
        m.processes = recs.map(function(r){
          m.processDecisions[r["ID"]] = parseList(r["→ Decisions"]);
          var o={id:r["ID"], name:r["Name"], inputs:r["Inputs"], outputs:r["Outputs"],
            capabilities:parseList(r["← Capabilities"]), participants:r["Participants"]};
          if(bool(r["Extension"])) o.ext=true; return o; });
      }
    },
    {
      name:"DecisionModel", level:8, element:"Decision Model (+ Human-in-the-Loop)", parent:"Business Process", child:"AI Use-Case",
      rows:function(m){ return A(m.decisions); },
      cols:[
        {h:"ID", out:function(o){return o.id;}, in:"id"},
        {h:"Name", out:function(o){return o.name;}, in:"name"},
        {h:"Inputs", out:function(o){return o.inputs;}, in:"inputs"},
        {h:"Rule summary", out:function(o){return o.rules;}, in:"rules"},
        {h:"Outcome", out:function(o){return o.outcome;}, in:"outcome"},
        {h:"Owner", out:function(o){return o.owner;}, in:"owner"},
        {h:"Extension", out:function(o){return yn(o.ext);}, in:null, note:"Added for this engagement vs the Trade Finance baseline"},
        {h:"Decision rules (when ⇒ then)", out:function(o,m){return A((m.decisionRules||{})[o.id]).map(function(r){return r.when+" ⇒ "+r.then;}).join(" | ");}, in:null},
        {h:"Used in processes", out:function(o,m){return list(procsForDecision(m,o.id));}, in:null},
        {h:"→ AI use-cases", out:function(o,m){return list(aiForDecision(m,o.id));}, in:null},
        {h:"Human-in-the-Loop", out:function(o,m){return yn(agentsForDecision(m,o.id).some(function(a){return a.hitl;}));}, in:null},
        {h:"HITL reason", out:function(o,m){return agentsForDecision(m,o.id).filter(function(a){return a.hitl;}).map(function(a){return a.hitlReason;}).filter(Boolean).join(" | ");}, in:null}
      ],
      apply:function(m, recs){ m.decisions = recs.map(function(r){
        var o={id:r["ID"], name:r["Name"], inputs:r["Inputs"], rules:r["Rule summary"], outcome:r["Outcome"], owner:r["Owner"]};
        if(bool(r["Extension"])) o.ext=true; return o; }); }
    },
    {
      name:"AIUseCase", level:9, element:"AI Use-Case", parent:"Decision Model", child:"AI Agent",
      rows:function(m){ return A(m.aiUseCases); },
      cols:[
        {h:"ID", out:function(o){return o.id;}, in:"id"},
        {h:"Name", out:function(o){return o.name;}, in:"name"},
        {h:"Theme", out:function(o){return o.theme;}, in:"theme"},
        {h:"Phase", out:function(o){return o.phase;}, in:"phase"},
        {h:"Cost", out:function(o){return o.cost;}, in:"cost", kind:"num"},
        {h:"Description", out:function(o){return o.desc;}, in:"desc"},
        {h:"Value (json)", out:function(o){return jstr(o.value);}, in:"value", kind:"json"},
        {h:"Risk (json)", out:function(o){return jstr(o.risk);}, in:"risk", kind:"json"},
        {h:"← Decisions", out:function(o){return list(o.decisions);}, in:"decisions", kind:"list"},
        {h:"Glossary terms", out:function(o){return list(o.terms);}, in:"terms", kind:"list"},
        {h:"→ CDP services", out:function(o,m){return list(cdpForUC(m,o.id));}, in:"__cdp"},
        {h:"→ AI agents", out:function(o,m){return list(agentsForUC(m,o.id));}, in:null}
      ],
      apply:function(m, recs){
        m.aiCdp = m.aiCdp || {};
        m.aiUseCases = recs.map(function(r){
          var base = m.aiCdp[r["ID"]] || {services:[],models:[],data:[]};
          m.aiCdp[r["ID"]] = {services:parseList(r["→ CDP services"]), models:base.models||[], data:base.data||[]};
          return {id:r["ID"], name:r["Name"], theme:r["Theme"], phase:r["Phase"], cost:num(r["Cost"]), desc:r["Description"],
            value:jparse(r["Value (json)"],{}), risk:jparse(r["Risk (json)"],{}),
            decisions:parseList(r["← Decisions"]), terms:parseList(r["Glossary terms"])}; });
      }
    },
    {
      name:"AIAgent", level:10, element:"AI Agent", parent:"AI Use-Case", child:"Data Product + Semantic Model + HITL",
      rows:function(m){ return A(m.aiAgents); },
      cols:[
        {h:"ID", out:function(o){return o.id;}, in:"id"},
        {h:"Name", out:function(o){return o.name;}, in:"name"},
        {h:"Definition", out:function(o){return o.def;}, in:"def"},
        {h:"← AI use-cases", out:function(o){return list(o.useCases);}, in:"useCases", kind:"list"},
        {h:"→ Data products", out:function(o){return list(o.dataProducts);}, in:"dataProducts", kind:"list"},
        {h:"→ Semantic models", out:function(o){return list(o.semanticModels);}, in:"semanticModels", kind:"list"},
        {h:"Human-in-the-Loop", out:function(o){return yn(o.hitl);}, in:"hitl", kind:"bool"},
        {h:"HITL reason", out:function(o){return o.hitlReason||"";}, in:"hitlReason"}
      ],
      apply:function(m, recs){ m.aiAgents = recs.map(function(r){
        var o={id:r["ID"], name:r["Name"], def:r["Definition"], useCases:parseList(r["← AI use-cases"]),
          dataProducts:parseList(r["→ Data products"]), semanticModels:parseList(r["→ Semantic models"]),
          hitl:bool(r["Human-in-the-Loop"])};
        if(r["HITL reason"]) o.hitlReason=r["HITL reason"]; return o; }); }
    },
    {
      name:"SemanticModel", level:11, element:"Semantic Model", parent:"AI Agent", child:"—",
      rows:function(m){ return A(m.semanticModels); },
      cols:[
        {h:"ID", out:function(o){return o.id;}, in:"id"},
        {h:"Name", out:function(o){return o.name;}, in:"name"},
        {h:"Definition", out:function(o){return o.def;}, in:"def"},
        {h:"Governed terms", out:function(o){return list(o.terms);}, in:"terms", kind:"list"},
        {h:"Used by agents", out:function(o,m){return list(agentsForSM(m,o.id));}, in:null}
      ],
      apply:function(m, recs){ m.semanticModels = recs.map(function(r){
        return {id:r["ID"], name:r["Name"], def:r["Definition"], terms:parseList(r["Governed terms"])}; }); }
    },
    {
      name:"DataProduct", level:12, element:"Data Product", parent:"AI Agent", child:"Data Domain",
      rows:function(m){ return A(m.dataProducts); },
      cols:[
        {h:"ID", out:function(o){return o.id;}, in:"id"},
        {h:"Name", out:function(o){return o.name;}, in:"name"},
        {h:"← Domain", out:function(o){return o.domain;}, in:"domain"},
        {h:"Domain name", out:function(o,m){return domainById(m,o.domain).name||"";}, in:null},
        {h:"Owner", out:function(o,m){return domainById(m,o.domain).owner||"";}, in:null},
        {h:"Steward", out:function(o,m){return domainById(m,o.domain).steward||"";}, in:null},
        {h:"Description", out:function(o){return o.desc;}, in:"desc"},
        {h:"Realises CDP", out:function(o){return list(o.cdp);}, in:"cdp", kind:"list"},
        {h:"Serves AI use-cases", out:function(o){return list(o.ai);}, in:"ai", kind:"list"},
        {h:"Used by agents", out:function(o,m){return list(agentsForDP(m,o.id));}, in:null},
        {h:"Glossary terms", out:function(o){return list(o.terms);}, in:"terms", kind:"list"},
        {h:"Classification", out:function(o,m){return contract(m,o.id).classification||"";}, in:null},
        {h:"Schema (field:type[:pii])", out:function(o,m){return A(contract(m,o.id).schema).map(function(f){return f[0]+":"+f[1]+(f[2]==="pii"?":pii":"");}).join(" | ");}, in:null},
        {h:"Producers", out:function(o,m){return list(contract(m,o.id).sources);}, in:null}
      ],
      apply:function(m, recs){ m.dataProducts = recs.map(function(r){
        return {id:r["ID"], name:r["Name"], domain:r["← Domain"], desc:r["Description"],
          cdp:parseList(r["Realises CDP"]), ai:parseList(r["Serves AI use-cases"]), terms:parseList(r["Glossary terms"])}; }); }
    },
    {
      name:"DataDomain", level:13, element:"Data Domain", parent:"Data Product", child:"—",
      rows:function(m){ return A(m.dataDomains); },
      cols:[
        {h:"ID", out:function(o){return o.id;}, in:"id"},
        {h:"Name", out:function(o){return o.name;}, in:"name"},
        {h:"Owner", out:function(o){return o.owner;}, in:"owner"},
        {h:"Steward", out:function(o){return o.steward;}, in:"steward"},
        {h:"Definition", out:function(o){return o.def;}, in:"def"},
        {h:"→ Data products", out:function(o,m){return list(dpForDomain(m,o.id));}, in:null}
      ],
      apply:function(m, recs){ m.dataDomains = recs.map(function(r){
        return {id:r["ID"], name:r["Name"], owner:r["Owner"], steward:r["Steward"], def:r["Definition"]}; }); }
    }
  ];

  /* ---- referential-integrity validation ----------------------------------- */
  function validate(m){
    var issues=[];
    var SH=byId(m.stakeholders), VP=byId(m.valuePropositions), CJ=byId(m.journeys), KT=byId(m.kpis),
        CAP=byId(m.capabilities), P=byId(m.processes), D=byId(m.decisions), U=byId(m.aiUseCases),
        AG=byId(m.aiAgents), SM=byId(m.semanticModels), DP=byId(m.dataProducts), DM=byId(m.dataDomains);
    function chk(cond, level, sev, msg){ if(cond) issues.push({level:level, sev:sev, msg:msg}); }
    A(m.valuePropositions).forEach(function(v){
      A(v.stakeholders).forEach(function(s){ chk(!SH[s],"ValueProposition","error",v.id+" → unknown stakeholder "+s); });
      A(v.journeys).forEach(function(j){ chk(!CJ[j],"ValueProposition","error",v.id+" → unknown stream "+j); });
    });
    A(m.stakeholders).forEach(function(s){ chk(vpsForSH(m,s.id).length===0,"Stakeholder","warn",s.id+" ("+s.name+") has no value proposition"); });
    A(m.journeys).forEach(function(j){ chk(!vpForStream(m,j.id),"Stream","warn",j.id+" is not referenced by any value proposition");
      A(j.stages).forEach(function(st,i){ var tag=j.id+"#"+(i+1);
        A(st.capabilities).forEach(function(c){ chk(!CAP[c],"Stage","error",tag+" → unknown capability "+c); });
        A(st.processes).forEach(function(p){ chk(!P[p],"Stage","error",tag+" → unknown process "+p); });
        A(st.decisions).forEach(function(d){ chk(!D[d],"Stage","error",tag+" → unknown decision "+d); });
      });
    });
    A(m.processes).forEach(function(p){ A(p.capabilities).forEach(function(c){ chk(!CAP[c],"BusinessProcess","error",p.id+" → unknown capability "+c); }); });
    Object.keys(m.processDecisions||{}).forEach(function(pid){ chk(!P[pid],"BusinessProcess","warn","processDecisions references unknown process "+pid);
      A(m.processDecisions[pid]).forEach(function(d){ chk(!D[d],"BusinessProcess","error",pid+" → unknown decision "+d); }); });
    A(m.capabilities).forEach(function(c){ chk(capProcesses(m,c.id).length===0,"Capability","warn",c.id+" ("+c.name+") has no business process"); });
    A(m.decisions).forEach(function(d){ chk(aiForDecision(m,d.id).length===0,"DecisionModel","warn",d.id+" ("+d.name+") has no AI use-case"); });
    A(m.aiUseCases).forEach(function(u){ A(u.decisions).forEach(function(d){ chk(!D[d],"AIUseCase","error",u.id+" → unknown decision "+d); });
      chk(agentsForUC(m,u.id).length===0,"AIUseCase","warn",u.id+" ("+u.name+") has no AI agent"); });
    A(m.aiAgents).forEach(function(a){
      A(a.useCases).forEach(function(u){ chk(!U[u],"AIAgent","error",a.id+" → unknown AI use-case "+u); });
      A(a.dataProducts).forEach(function(d){ chk(!DP[d],"AIAgent","error",a.id+" → unknown data product "+d); });
      A(a.semanticModels).forEach(function(s){ chk(!SM[s],"AIAgent","error",a.id+" → unknown semantic model "+s); });
      chk(a.hitl && !a.hitlReason,"AIAgent","warn",a.id+" is HITL but has no reason");
    });
    A(m.dataProducts).forEach(function(p){ chk(!DM[p.domain],"DataProduct","error",p.id+" → unknown domain "+p.domain); });
    return issues;
  }

  /* ---- build / parse ------------------------------------------------------ */
  function build(m){
    return SHEETS.map(function(sh){
      var head = sh.cols.map(function(c){return c.h;});
      var aoa = [head];
      sh.rows(m).forEach(function(ctx){
        aoa.push(sh.cols.map(function(c){ var v=c.out(ctx,m); return v==null?"":v; }));
      });
      return {name:sh.name, aoa:aoa};
    });
  }
  /* recs: array of header-keyed objects for one sheet */
  function recsFromAoa(aoa){
    if(!aoa||!aoa.length) return [];
    var head=aoa[0].map(function(x){return String(x==null?"":x).trim();});
    return aoa.slice(1).filter(function(row){ return row.some(function(v){return v!=null && String(v).trim()!=="";}); })
      .map(function(row){ var o={}; head.forEach(function(h,i){ o[h]=row[i]; }); return o; });
  }
  /* sheetMap: {sheetName: aoa}. base: model to overlay onto (defaults to {}) */
  function parse(sheetMap, base){
    var m = base ? clone(base) : {};
    SHEETS.forEach(function(sh){
      var aoa = sheetMap[sh.name];
      if(!aoa) return;                 // sheet absent → keep base version
      var recs = recsFromAoa(aoa);
      if(!recs.length) return;
      sh.apply(m, recs);
    });
    return m;
  }

  /* ---- workbook glue (SheetJS) -------------------------------------------- */
  var OVERVIEW = "Hierarchy";
  function overviewAoa(m){
    var aoa=[];
    aoa.push(["Nedbank Marketing Data & AI — Model Hierarchy (export)"]);
    aoa.push(["This workbook holds the complete architecture model, one sheet per level, in the corrected hierarchy."]);
    aoa.push([]);
    aoa.push(["#","Sheet","Element","Parent","Child","Rows"]);
    SHEETS.forEach(function(sh){ aoa.push([sh.level, sh.name, sh.element, sh.parent, sh.child, sh.rows(m).length]); });
    aoa.push([]);
    aoa.push(["Reading the link columns"]);
    aoa.push(["← columns point UP to parents; → columns point DOWN to children (derived from the authoritative links)."]);
    aoa.push(["IDs in link columns are comma-separated. Capability children use  id : name  separated by  |  ."]);
    aoa.push(["On import, → columns marked derived are recomputed — edit the authoritative ← / link fields to change the shape."]);
    aoa.push([]);
    var issues=validate(m);
    aoa.push(["Validation — referential integrity ("+issues.length+" issue"+(issues.length===1?"":"s")+")"]);
    if(!issues.length){ aoa.push(["No broken references. Every link resolves. ✓"]); }
    else { aoa.push(["Level","Severity","Issue"]); issues.forEach(function(x){ aoa.push([x.level, x.sev, x.msg]); }); }
    return aoa;
  }
  function toWorkbook(m, XLSX){
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overviewAoa(m)), OVERVIEW);
    build(m).forEach(function(s){
      var ws = XLSX.utils.aoa_to_sheet(s.aoa);
      ws["!cols"] = s.aoa[0].map(function(h){ return {wch: Math.min(46, Math.max(10, String(h).length+2))}; });
      XLSX.utils.book_append_sheet(wb, ws, s.name);
    });
    return wb;
  }
  function fromWorkbook(wb, XLSX, base){
    var map={};
    SHEETS.forEach(function(sh){
      var ws = wb.Sheets[sh.name];
      if(ws) map[sh.name] = XLSX.utils.sheet_to_json(ws, {header:1, raw:true, defval:""});
    });
    return parse(map, base);
  }

  PACK.MODELIO = {
    SHEETS: SHEETS, OVERVIEW: OVERVIEW,
    build: build, parse: parse, validate: validate,
    toWorkbook: toWorkbook, fromWorkbook: fromWorkbook,
    _clone: clone
  };
  if(typeof module!=="undefined" && module.exports){ module.exports = PACK.MODELIO; }
})();
