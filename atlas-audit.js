// Auditoría editorial visible del corpus. Se ejecuta después de cargar todas las capas.
(function(){
 function esc(s){return String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
 function render(report){
  const home=document.getElementById('home'); if(!home)return;
  let box=document.getElementById('atlasEditorialStatus');
  if(!box){box=document.createElement('section');box.id='atlasEditorialStatus';box.className='panel';box.style.cssText='padding:20px;margin-top:22px';home.appendChild(box);}
  const issues=[...report.duplicates,...report.postdoctoral.missing,...report.postdoctoral.shallow,...report.argentina.missing,...report.structural.incomplete];
  box.innerHTML='<div class="eyebrow">ESTADO EDITORIAL DEL CORPUS</div><h2 style="font:900 28px var(--serif);margin:6px 0 12px">Auditoría automática</h2>'+
   '<div class="metrics" style="margin:0 0 12px"><div class="metric"><b>'+report.works+'</b><span>obras activas</span></div><div class="metric"><b>'+report.postdoctoral.complete+'/'+report.postdoctoral.expected+'</b><span>guías postdoctorales</span></div><div class="metric"><b>'+report.argentina.complete+'/'+report.argentina.expected+'</b><span>guías argentinas</span></div><div class="metric"><b>'+report.uniqueIds+'</b><span>IDs únicos</span></div></div>'+
   '<p class="note">'+(report.ok?'Corpus sin incidencias estructurales detectadas en la auditoría actual.':'La auditoría detectó '+issues.length+' incidencia(s): '+esc(issues.slice(0,12).join(', '))+(issues.length>12?'…':'')+'.')+'</p>';
 }
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
  render(report);
  return report;
 }
 window.auditAtlas=run;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,0),{once:true});else setTimeout(run,0);
})();