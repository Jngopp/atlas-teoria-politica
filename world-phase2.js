// Fase 2 · Sinopsis de tesis de los textos clásicos dentro de Mundo y contextos.
(function(){
 const esc=s=>(s??'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const contexts=()=>window.WORLD_CONTEXTS||[];
 const works=()=>typeof WORKS!=='undefined'?WORKS:[];
 const getWork=id=>works().find(w=>w.id===id);
 const getCtx=id=>contexts().find(c=>c.id===id);
 const uniq=a=>[...new Set((a||[]).filter(Boolean))];
 function ensureStyle(){if(document.querySelector('link[href="world-phase2.css"]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='world-phase2.css';document.head.appendChild(l)}
 function guide(w){try{return typeof getRichStudyGuide==='function'?getRichStudyGuide(w):(typeof getStudyGuide==='function'?getStudyGuide(w):null)}catch{return null}}
 function mini(w){try{return typeof getMiniClass==='function'?getMiniClass(w):null}catch{return null}}
 function importance(w,g,m){
  const candidates=[
   g?.summary?.[1],
   g?.reception?.[0],
   m?.lecture?.[1],
   m?.compare?.[0]
  ].filter(Boolean);
  if(candidates.length)return candidates[0];
  const cs=(w.concepts||[]).slice(0,3).join(', ');
  return `La obra reorganiza el problema de ${cs||'la autoridad y el orden político'} dentro de ${w.trad}, y ofrece un vocabulario que permite comparar esa coyuntura con problemas posteriores sin borrar su especificidad histórica.`;
 }
 function synopsisCard(w,ctx,index){
  const g=guide(w),m=mini(w),why=importance(w,g,m),concepts=uniq(w.concepts||[]).slice(0,6);
  return `<article class="world-synopsis" style="--wa:${ctx.accent}">
   <header><div><small>${esc(w.date)} · ${esc(w.trad)}</small><h3>${esc(w.title)}</h3><strong>${esc(w.author)}</strong></div><span class="world-synopsis-index">${String(index+1).padStart(2,'0')}</span></header>
   <div class="world-synopsis-body">
    <section><b>Problema</b><p>${esc(w.problem)}</p></section>
    <section class="thesis"><b>Tesis central</b><p>${esc(w.thesis)}</p></section>
    <section><b>Por qué importa</b><p>${esc(why)}</p></section>
   </div>
   <div class="world-synopsis-concepts">${concepts.map(c=>`<span>${esc(c)}</span>`).join('')}</div>
   <footer><button data-world-synopsis-work="${w.id}">Abrir dossier completo →</button></footer>
  </article>`;
 }
 function phase2HTML(ctx){
  const ws=(ctx.works||[]).map(getWork).filter(Boolean);
  if(!ws.length)return'';
  return `<article class="world-synopsis-section" id="worldSynopsisSection" style="--wa:${ctx.accent}">
   <div class="world-synopsis-head"><div><div class="eyebrow">FASE 2 · SINOPSIS DE TESIS</div><h2>Textos clásicos del período</h2><p>Una lectura comparativa de las intervenciones teóricas del contexto seleccionado. La sinopsis distingue el problema histórico de cada obra, su tesis y su aporte; el dossier conserva el desarrollo argumental, debates y bibliografía.</p></div><div class="world-synopsis-count"><b>${ws.length}</b><span>obras vinculadas</span></div></div>
   <div class="world-synopsis-grid">${ws.map((w,i)=>synopsisCard(w,ctx,i)).join('')}</div>
  </article>`;
 }
 function inject(){
  ensureStyle();
  const app=document.getElementById('worldApp');if(!app)return;
  const select=document.getElementById('worldSelect');
  const ctx=getCtx(select?.value)||contexts()[0];if(!ctx)return;
  document.getElementById('worldSynopsisSection')?.remove();
  const lower=app.querySelector('.world-lower');if(!lower)return;
  const worksCard=lower.querySelector('.world-works-card');
  const wrap=document.createElement('div');wrap.innerHTML=phase2HTML(ctx);const node=wrap.firstElementChild;if(!node)return;
  if(worksCard)lower.insertBefore(node,worksCard);else lower.appendChild(node);
 }
 function schedule(){setTimeout(inject,0)}
 document.addEventListener('click',e=>{
  const open=e.target.closest?.('[data-world-synopsis-work]');
  if(open){e.preventDefault();if(typeof openWork==='function')openWork(open.dataset.worldSynopsisWork);return;}
  if(e.target.closest?.('[data-world-era]')||e.target.closest?.('[data-v="world"]'))schedule();
 },true);
 document.addEventListener('change',e=>{if(e.target?.id==='worldSelect')schedule()},true);
 function boot(){ensureStyle();schedule()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
 window.renderWorldPhase2=inject;
})();