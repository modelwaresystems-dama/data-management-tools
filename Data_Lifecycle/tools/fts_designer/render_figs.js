// render_figs.js  -  state diagram figures for the documentation set, drawn with the viewer's wrapped layout (no Mermaid, no browser).
// usage: node render_figs.js <model.fts.json> <outdir> [width]
// writes <stem>_all.svg (every region expanded, one band per region) and <stem>_<REGIONCODE>.svg (one region alone, its own transitions,
// transition IDs as labels). The SVGs carry the same classes as the viewer's Simplified FTS tab.
const {fsmSource}=require('./fsm_source.js'); const {snakeSvg}=require('./snake_layout.js'); const fs=require('fs'); const path=require('path');
const [,, model, outdir, widthArg]=process.argv; const W=Number(widthArg||1180);
const M=JSON.parse(fs.readFileSync(model,'utf8')); const stem=path.basename(model).replace(/\.fts\.json$/,'');
fs.mkdirSync(outdir,{recursive:true});
const opts={level:"all",contracts:false,labelMode:"id",hideNotes:true,hideInnerInitial:false};
const out=fsmSource(M,opts);
const tops=(M.regions&&M.regions.length)?M.regions.map(r=>({id:r.id,name:r.name})):M.globalStates.map(g=>({id:g.id,name:g.name}));
const fix=s=>s.replace(/var\(--[a-z0-9-]+,\s*([^)]+)\)/g,'$1').replace(/ width="\d+" style="font-family:Segoe UI,system-ui,sans-serif;max-width:none"/,' style="font-family:Segoe UI,system-ui,sans-serif;width:100%;height:auto"');
const title=(M.meta&&(M.meta.knowledgeArea||M.meta.name))||stem;
fs.writeFileSync(path.join(outdir,stem+"_all.svg"), fix(snakeSvg(out.graph,tops,W,{title:title+": all regions"})));
const written=[stem+"_all.svg"];
tops.forEach(t=>{ const code=(t.id.split("-").pop()); const svg=snakeSvg(out.graph,[t],W,{title:t.name+" ("+t.id+")"}); const f=stem+"_"+code+".svg"; fs.writeFileSync(path.join(outdir,f),fix(svg)); written.push(f); });
console.log(stem, written.length, "figures", written.join(" "));
