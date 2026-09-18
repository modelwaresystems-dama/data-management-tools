<script>
/* =====================================================================
   FACILITATOR GUIDE: drawer UI
   ===================================================================== */
var GD_MODE="screen";   /* screen | roles | all */

function gdList(title,items){
  if(!items||!items.length) return "";
  return '<div class="gd-sec"><h4>'+esc(title)+'</h4><ul>'+
    items.map(function(i){return "<li>"+i+"</li>";}).join("")+'</ul></div>';
}
function gdScreenHTML(tab,forPrint){
  var g=TAB_GUIDE[tab]; if(!g) return '<div class="empty">No guidance for this screen.</div>';
  var h="";
  if(forPrint) h+='<h2 style="margin-top:22px">'+esc(g.title)+'</h2>';
  h+='<div class="gd-sec"><h4>What this screen is</h4><p>'+esc(g.what)+'</p></div>';
  h+='<div class="gd-obj"><b>Objective</b>'+esc(g.obj)+'</div>';
  h+=gdList("Facilitator moves",g.facil);
  h+=gdList("By table",g.table);
  if(g.watch&&g.watch.length) h+='<div class="gd-watch">'+gdList("Watch for",g.watch).replace(/^<div class="gd-sec">|<\/div>$/g,"")+'</div>';
  h+='<div class="gd-done"><b>Done when</b> &middot; '+esc(g.done)+'</div>';
  if(tab==="session"&&!forPrint){
    var n=(STATE&&STATE.step)||1, st=STEPS.filter(function(x){return x.n===n;})[0];
    if(st) h='<div class="gd-tabs"><button class="on" data-gdv="step">This step ('+n+')</button>'+
      '<button data-gdv="screen">The whole screen</button></div>'+
      '<div id="gd-stepwrap">'+gdStepHTML(st)+'</div>'+
      '<div id="gd-screenwrap" style="display:none">'+h+'</div>';
  }
  return h;
}
function gdStepHTML(st,forPrint){
  var g=STEP_GUIDE[st.n]||{};
  var ph=PHASES.filter(function(p){return p.id===st.ph;})[0]||{};
  var h='<div class="gd-step"><div class="gd-n">Phase '+st.ph+' &middot; '+esc(st.t)+' min &middot; step '+st.n+' of '+STEPS.length+'</div>'+
    '<h3 style="margin:3px 0 0">'+esc(st.title)+'</h3></div>';
  if(g.obj) h+='<div class="gd-obj"><b>Objective of this step</b>'+esc(g.obj)+'</div>';
  if(forPrint){
    h+='<div class="gd-sec"><h4>On screen</h4><p>'+esc(st.slide)+'</p></div>';
    h+='<div class="gd-sec"><h4>What you say and do</h4><p>'+esc(st.facil)+'</p></div>';
  }
  h+=gdList("By table",g.table);
  if(g.watch&&g.watch.length) h+='<div class="gd-watch">'+gdList("Watch for",g.watch).replace(/^<div class="gd-sec">|<\/div>$/g,"")+'</div>';
  var sa=answerFor(st.n);
  if(sa&&!forPrint) h+='<div class="gd-sec"><h4>Model answer</h4><p class="mut" style="font-size:.8rem">'+
    'Hidden on the slide until you reveal it. Do not read it before every table has committed.</p></div>';
  if(sa&&forPrint) h+='<div class="gd-sec"><h4>Model answer (reveal after the room commits)</h4>'+sa+'</div>';
  h+='<div class="gd-done"><b>Canvas output</b> &middot; '+esc(st.out||"None")+'</div>';
  return h;
}
function gdRolesHTML(){
  var tables=(STATE&&STATE.session&&+STATE.session.tables)||4;
  var h='<div class="gd-sec"><h4>What a role card is</h4>'+
    '<p>Each card below is a one-page brief for <b>one seat</b> at a table, not a summary of the session. '+
    'It tells the person sitting there what they are in the room to contribute, which steps they lead, the question '+
    'they should keep asking, what they must refuse to let pass, and the specific failure they exist to prevent. '+
    'Four seats, four different cards.</p>'+
    '<p>They exist because a mixed table only behaves differently from a group of colleagues if each person knows '+
    'which argument is theirs to make. Without the cards the most senior voice answers everything.</p></div>'+
    '<div class="gd-sec"><h4>Producing them</h4><p>Press <b>Print</b> below while this view is open: it prints the four '+
    'cards only, roughly two to a page, ready to cut and lay on the tables. You have <b>'+tables+' table'+(tables===1?'':'s')+
    '</b> set on the Setup tab, so print <b>'+tables+' set'+(tables===1?'':'s')+'</b>, '+(tables*4)+' cards in total, '+
    'and put one at each seat before people arrive.</p></div>';
  h+=ROLE_CARDS.map(function(r){
    return '<div class="rolecard"><h3>'+esc(r.role)+'</h3><div class="pl-line">'+r.pillar+'</div>'+
      '<div class="gd-sec" style="margin-bottom:8px"><h4>What you bring</h4><p style="margin:0">'+esc(r.bring)+'</p></div>'+
      '<div class="gd-sec" style="margin-bottom:8px"><h4>You lead</h4><p style="margin:0">'+esc(r.leads)+'</p></div>'+
      '<div class="ask">'+esc(r.ask)+'</div>'+
      '<div class="gd-sec" style="margin-bottom:8px"><h4>Insist on</h4><ul style="margin:0">'+
        r.insist.map(function(i){return "<li>"+esc(i)+"</li>";}).join("")+'</ul></div>'+
      '<div class="gd-done" style="font-size:.82rem"><b>You prevent</b> &middot; '+esc(r.prevents)+'</div></div>';}).join("");
  h+='<div class="notice amb" style="font-size:.82rem">'+esc(ROLE_NOTE)+'</div>';
  return h;
}
var GD_ORDER=["setup","session","spine","register","framework","remed","gates","canvas","pack"];
function gdAllHTML(forPrint){
  var h="";
  if(forPrint) h+='<div class="panel"><h1 style="font-size:1.4rem;margin-bottom:4px">AI Eval Framework: facilitator guide</h1>'+
    '<p class="mut" style="font-size:.85rem">The redesigned 90-minute session, screen by screen. '+
    (STATE&&STATE.useCaseId?('Prepared for <b>'+esc(STATE.useCaseId)+'</b> '+esc(STATE.useCaseName)+
      ' &middot; '+esc(STATE.company||MODEL.company)+'.'):'')+'</p></div>';
  h+='<div class="panel"><h2>Table role cards</h2>'+gdRolesHTML()+'</div>';
  GD_ORDER.forEach(function(t,i){
    h+='<div class="panel">'+gdScreenHTML(t,true);
    if(t==="session"){
      h+='<h3 style="margin-top:20px">Step by step</h3>';
      PHASES.forEach(function(p){
        h+='<h4 style="margin-top:16px;font-size:.88rem">'+esc(p.name)+' &middot; '+esc(p.time)+'</h4>'+
           '<p class="mut" style="font-size:.82rem">'+esc(p.note)+'</p>';
        STEPS.filter(function(s){return s.ph===p.id;}).forEach(function(s){ h+=gdStepHTML(s,true); });});
    }
    h+='</div>';});
  return h;
}
function gdRender(){
  var g=$("#guide"); if(!g) return;
  var body=$("#gd-body");
  if(GD_MODE==="roles"){
    $("#gd-title").textContent="Table role cards";
    $("#gd-sub").textContent="One card per seat · four seats per table";
    body.innerHTML=gdRolesHTML();
  } else if(GD_MODE==="all"){
    $("#gd-title").textContent="Whole facilitator guide";
    $("#gd-sub").textContent="All nine screens and all eighteen steps";
    body.innerHTML=gdAllHTML(false);
  } else {
    var t=TAB_GUIDE[CURTAB]?CURTAB:"setup";
    $("#gd-title").textContent=TAB_GUIDE[t].title.split(":")[0].trim();
    $("#gd-sub").textContent= t==="session" && STATE ?
      ("Step "+STATE.step+" of "+STEPS.length+" · phase "+STATE.phase) : "Facilitator guide for this screen";
    body.innerHTML=gdScreenHTML(t,false);
    $$("[data-gdv]",body).forEach(function(b){ b.addEventListener("click",function(){
      $$("[data-gdv]",body).forEach(function(x){x.classList.toggle("on",x===b);});
      $("#gd-stepwrap").style.display   = b.dataset.gdv==="step"?"":"none";
      $("#gd-screenwrap").style.display = b.dataset.gdv==="screen"?"":"none"; });});
  }
  body.scrollTop=0;
}
/* ---- dock / float / width, remembered between sessions ---- */
var GD_PREF_KEY="aievalframework.guide.v1";
var GD_PREF={dock:true,width:460,open:false};
function gdLoadPref(){ try{ var p=JSON.parse(localStorage.getItem(GD_PREF_KEY)||"null");
  if(p&&typeof p==="object"){ GD_PREF.dock=p.dock!==false; GD_PREF.width=+p.width||460; GD_PREF.open=!!p.open; } }catch(e){} }
function gdSavePref(){ try{ localStorage.setItem(GD_PREF_KEY,JSON.stringify(GD_PREF)); }catch(e){} }
function gdApplyWidth(w){
  GD_PREF.width=Math.max(340,Math.min(w, Math.round(window.innerWidth*0.62)));
  document.documentElement.style.setProperty("--gd-w",GD_PREF.width+"px");
}
function gdApplyDock(){
  var open=$("#guide").classList.contains("on");
  document.body.classList.toggle("gd-docked", GD_PREF.dock && open);
  $("#gd-dock").textContent = GD_PREF.dock ? "FLOAT" : "DOCK";
  $("#gd-dock").title = GD_PREF.dock
    ? "Float the guide over the app instead of beside it"
    : "Dock the guide beside the app so you can work on the step while reading";
  $("#gd-scrim").classList.toggle("on", open && !GD_PREF.dock);
}
function gdOpen(mode){
  GD_MODE=mode||"screen";
  gdRender();
  $("#guide").classList.add("on"); $("#guide").setAttribute("aria-hidden","false");
  GD_PREF.open=true; gdApplyDock(); gdSavePref();
}
function gdClose(){
  $("#guide").classList.remove("on"); $("#guide").setAttribute("aria-hidden","true");
  $("#gd-scrim").classList.remove("on"); document.body.classList.remove("gd-docked");
  GD_PREF.open=false; gdSavePref();
}
function gdToggleDock(){ GD_PREF.dock=!GD_PREF.dock; gdApplyDock(); gdSavePref(); }
function gdWireResize(){
  var grip=$("#gd-grip"), startX=0, startW=0, dragging=false;
  function down(e){ dragging=true; startX=e.clientX; startW=GD_PREF.width;
    grip.classList.add("drag"); document.body.classList.add("gd-resizing");
    grip.setPointerCapture&&grip.setPointerCapture(e.pointerId); e.preventDefault(); }
  function move(e){ if(!dragging) return; gdApplyWidth(startW+(startX-e.clientX)); }
  function up(){ if(!dragging) return; dragging=false;
    grip.classList.remove("drag"); document.body.classList.remove("gd-resizing"); gdSavePref(); }
  grip.addEventListener("pointerdown",down);
  window.addEventListener("pointermove",move);
  window.addEventListener("pointerup",up);
  grip.addEventListener("dblclick",function(){ gdApplyWidth(460); gdSavePref(); });
}
function gdPrint(){
  var g=$("#guide"), body=$("#gd-body"), keep=body.innerHTML;
  body.innerHTML = GD_MODE==="roles" ? gdRolesHTML() : gdAllHTML(true);
  $$(".view").forEach(function(v){v.classList.remove("printing");});
  g.classList.add("printing");
  window.print();
  setTimeout(function(){ g.classList.remove("printing"); body.innerHTML=keep; gdRender(); },900);
}
function initGuide(){
  gdLoadPref(); gdApplyWidth(GD_PREF.width);
  $("#btn-guide").addEventListener("click",function(){
    $("#guide").classList.contains("on")?gdClose():gdOpen("screen"); });
  $("#gd-close").addEventListener("click",gdClose);
  $("#gd-dock").addEventListener("click",gdToggleDock);
  gdWireResize();
  window.addEventListener("resize",function(){ gdApplyWidth(GD_PREF.width); });
  $("#gd-scrim").addEventListener("click",gdClose);
  $("#gd-roles").addEventListener("click",function(){ gdOpen("roles"); });
  $("#gd-all").addEventListener("click",function(){ gdOpen("all"); });
  $("#gd-print").addEventListener("click",gdPrint);
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape"&&$("#guide").classList.contains("on")) gdClose();
    var tag=(e.target&&e.target.tagName||"").toLowerCase();
    if(tag==="input"||tag==="textarea"||tag==="select") return;
    if(e.key==="?"||(e.key==="/"&&e.shiftKey)){ e.preventDefault();
      $("#guide").classList.contains("on")?gdClose():gdOpen("screen"); }});
  /* keep the drawer in step with the app */
  var _showTab=showTab;
  showTab=function(t){ _showTab(t); if($("#guide").classList.contains("on")&&GD_MODE==="screen") gdRender(); };
  var _renderSession=renderSession;
  renderSession=function(){ _renderSession(); if($("#guide").classList.contains("on")&&GD_MODE==="screen") gdRender(); };
  /* re-open where the facilitator left it */
  if(GD_PREF.open) setTimeout(function(){ gdOpen("screen"); },0);
}
document.addEventListener("DOMContentLoaded",initGuide);
</script>
