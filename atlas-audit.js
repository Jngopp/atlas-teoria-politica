// Auditoría editorial del corpus. Se ejecuta después de cargar todas las capas.
(function(){
 function run(){
  const works=typeof WORKS!=='undefined'?WORKS:[];
  const ids=works.map(w=>w.id);
  const duplicates=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
  const post=typeof auditPostdocGuides==='function'?auditPostdocGuides():{expected:0,complete:0,missing:[],shallow:[],ok:false};
  const argentina=window.ARGENTINA_CANON_IDS||[];
  const argMissing=argentina.filter(id=>{try{const w=works.find(x=>x.id===id);const g=w&&getRichStudyGuide(w);return !g||!(g.architecture||[]).length||Object.keys(g.keys||{}).length<3||(g.secondary||[]).length<3}catch{return true}});
  const structural=works.filter(w=>{try{const g=getRichStudyGuide(w);return !g||(g.problemAnalysis||[]).join(' ').length<250||(g.architecture||[]).length<3||Object.keys(g.keys||{}).length<3||(g.secondary||[]).length<3}catch{return true}}).map(w=>w.id);
  const report={
   generatedAt:new Date().toISOString(),
   works:works.length,
   uniqueIds:new Set(ids).size,
   duplicates,
   postdoctoral:{...post},
   argentina:{expected:argentina.length,complete:argentina.length-argMissing.length,missing:argMissing,ok:argMissing.length===0},
   structural:{complete:works.length-structural.length,incomplete:structural,ok:structural.length===0}
  };
  report.ok=duplicates.length===0&&post.ok&&report.argentina.ok&&report.structural.ok;
  window.ATLAS_AUDIT=report;
  document.documentElement.dataset.atlasAudit=report.ok?'ok':'issues';
  console.info('[Atlas] Auditoría editorial',report);
  return report;
 }
 window.auditAtlas=run;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,0),{once:true});else setTimeout(run,0);
})();