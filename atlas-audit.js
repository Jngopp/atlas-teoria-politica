// Auditoría editorial visible del corpus y del esquema V2.
(function(){
 function esc(s){return String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
 function schemaAudit(){
  const db=window.ATLAS_DB,api=window.AtlasDB;
  if(!db||!api)return {loaded:false,ok:false,version:null,counts:{},invalidRelations:[],duplicateRelationIds:[],worksWithoutProblems:[],needsReview:[]};
  const relIds=db.relations.map(r=>r.id);
  const duplicateRelationIds=[...new Set(relIds.filter((id,i)=>relIds.indexOf(id)!==i))];
  const invalidRelations=db.relations.filter(r=>!api.get(r.sourceType,r.sourceId)||!api.get(r.targetType,r.targetId)).map(r=>r.id);
  const worksWithoutProblems=Object.values(db.works).filter(w=>!(w.problemIds||[]).length).map(w=>w.id);
  const needsReview=db.relations.filter(r=>r.status==='needs_review').map(r=>r.id);
  const counts={
   works:Object.keys(db.works).length,
   authors:Object.keys(db.authors).length,
   concepts:Object.keys(db.concepts).length,
   problems:Object.keys(db.problems).length,
   traditions:Object.keys(db.traditions).length,
   eras:Object.keys(db.eras).length,
   contexts:Object.keys(db.contexts).length,
   politicalEntities:Object.keys(db.politicalEntities).length,
   relations:db.relations.length,
   genealogies:Object.keys(db.genealogies).length,
   definedConcepts:Object.values(db.concepts).filter(c=>c.definitionStatus==='defined').length,
   pendingConceptDefinitions:Object.values(db.concepts).filter(c=>c.definitionStatus==='pending').length
  };
  return {loaded:true,version:db.meta?.schemaVersion||null,counts,invalidRelations,duplicateRelationIds,worksWithoutProblems,needsReview,ok:invalidRelations.length===0&&duplicateRelationIds.length===0&&worksWithoutProblems.length===0&&counts.works===WORKS.length};
 }
 function render(report){
  const home=document.getElementById('home'); if(!home)return;
  let box=document.getElementById('atlasEditorialStatus');
  if(!box){box=document.createElement('section');box.id='atlasEditorialStatus';box.className='panel';box.style.cssText='padding:20px;margin-top:22px';home.appendChild(box);}
  const hardIssues=[...report.duplicates,...report.postdoctoral.missing,...report.argentina.missing,...report.structural.incomplete,...report.schema.invalidRelations,...report.schema.duplicateRelationIds,...report.schema.worksWithoutProblems,...(report.routes?.collisions||[])];
  const debt=report.schema.needsReview.length;
  box.innerHTML='<div class="eyebrow">ESTADO EDITORIAL DEL CORPUS</div><h2 style="font:900 28px var(--serif);margin:6px 0 12px">Auditoría automática · Esquema V'+esc(report.schema.version||'—')+'</h2>'+
   '<div class="metrics" style="margin:0 0 12px"><div class="metric"><b>'+report.works+'</b><span>obras activas</span></div><div class="metric"><b>'+report.postdoctoral.complete+'/'+report.postdoctoral.expected+'</b><span>guías postdoctorales</span></div><div class="metric"><b>'+report.schema.counts.relations+'</b><span>relaciones normalizadas</span></div><div class="metric"><b>'+debt+'</b><span>relaciones por revisar</span></div></div>'+
   '<p class="note">'+(report.ok?'Corpus y esquema sin incidencias estructurales. Quedan '+debt+' relaciones intelectuales heredadas pendientes de clasificación editorial; no se presentan como “influencia” hasta ser revisadas.':'La auditoría detectó '+hardIssues.length+' incidencia(s) estructural(es): '+esc(hardIssues.slice(0,12).join(', '))+(hardIssues.length>12?'…':'')+'.')+'</p>'+
   '<p class="note">Base normalizada: '+report.schema.counts.authors+' autorías · '+report.schema.counts.concepts+' conceptos · '+report.schema.counts.problems+' problemas · '+report.schema.counts.traditions+' tradiciones · '+report.schema.counts.contexts+' contextos.</p>'+
   '<p class="note">Definiciones conceptuales globales: '+report.schema.counts.definedConcepts+' consolidadas · '+report.schema.counts.pendingConceptDefinitions+' pendientes para la futura enciclopedia de conceptos.</p>'+
   '<p class="note">Permalinks: '+(report.routes?.unique||0)+' rutas únicas de '+(report.routes?.total||0)+' entidades enrutable'+((report.routes?.total||0)!==1?'s':'')+' · '+((report.routes?.collisions||[]).length)+' colisiones.</p>';
 }
 function run(){
  const works=typeof WORKS!=='undefined'?WORKS:[];
  const ids=works.map(w=>w.id);
  const duplicates=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
  const post=typeof auditPostdocGuides==='function'?auditPostdocGuides():{expected:0,complete:0,missing:[],shallow:[],ok:false};
  const argentina=window.ARGENTINA_CANON_IDS||[];
  const argMissing=argentina.filter(id=>{try{const w=works.find(x=>x.id===id);const g=w&&getRichStudyGuide(w);return !g||!(g.architecture||[]).length||Object.keys(g.keys||{}).length<3||(g.secondary||[]).length<3}catch{return true}});
  const structural=works.filter(w=>{try{const g=getRichStudyGuide(w);return !g||(g.problemAnalysis||[]).join(' ').length<250||(g.architecture||[]).length<3||Object.keys(g.keys||{}).length<3||(g.secondary||[]).length<3}catch{return true}}).map(w=>w.id);
  const schema=schemaAudit();
  const routes=window.AtlasRouter?.audit?window.AtlasRouter.audit():{counts:{},total:0,unique:0,collisions:[],ok:false};
  const report={
   generatedAt:new Date().toISOString(),works:works.length,uniqueIds:new Set(ids).size,duplicates,
   postdoctoral:{...post},
   argentina:{expected:argentina.length,complete:argentina.length-argMissing.length,missing:argMissing,ok:argMissing.length===0},
   structural:{complete:works.length-structural.length,incomplete:structural,ok:structural.length===0},
   schema,routes
  };
  report.ok=duplicates.length===0&&post.missing.length===0&&report.argentina.ok&&report.structural.ok&&schema.ok&&routes.ok;
  window.ATLAS_AUDIT=report;
  document.documentElement.dataset.atlasAudit=report.ok?'ok':'issues';
  console.info('[Atlas] Auditoría editorial V2',report);
  render(report);
  return report;
 }
 window.auditAtlas=run;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,0),{once:true});else setTimeout(run,0);
})();