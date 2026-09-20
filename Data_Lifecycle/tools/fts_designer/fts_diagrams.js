#!/usr/bin/env node
// fts_diagrams.js: write the UML and simplified Mermaid sources for a model.
// Usage: node fts_diagrams.js model.fts.json outdir
const fs=require('fs'), path=require('path'); const {fsmSource}=require('./fsm_source.js');
const M=JSON.parse(fs.readFileSync(process.argv[2],'utf8')); const out=process.argv[3]||'.';
M.globalStates.forEach(s=>s.kind='global'); M.subStates.forEach(s=>s.kind='sub');
const base=path.join(out,(M.meta&&M.meta.modelId||'fts').toLowerCase().replace(/[^a-z0-9]+/g,'_'));
const uml=fsmSource(M,{level:'all',contracts:true,labelMode:'full'});
const simp=fsmSource(M,{level:'sub',contracts:false,labelMode:'code',hideNotes:true});
const glob=fsmSource(M,{level:'global',contracts:false,labelMode:'code'});
fs.writeFileSync(base+'_uml.mmd',uml.src); fs.writeFileSync(base+'_simplified.mmd',simp.src); fs.writeFileSync(base+'_global_only.mmd',glob.src);
fs.writeFileSync(base+'_legend.json',JSON.stringify(simp.legend,null,1));
console.log('Wrote',base+'_uml.mmd',base+'_simplified.mmd',base+'_global_only.mmd');
