// Fase 3 · Mindmap interactivo de cada contexto histórico.
(function(){
 const esc=s=>(s??'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const contexts=()=>window.WORLD_CONTEXTS||[];
 const works=()=>typeof WORKS!=='undefined'?WORKS:[];
 const getWork=id=>works().find(w=>w.id===id);
 const getCtx=id=>contexts().find(c=>c.id===id);
 const uniq=a=>[...new Set((a||[]).filter(Boolean))];
 const guide=w=>{try{return typeof getRichStudyGuide==='function'?getRichStudyGuide(w):(typeof getStudyGuide==='function'?getStudyGuide(w):null)}catch{return null}};
 function ensureStyle(){if(document.querySelector('link[href="world-phase3.css"]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='world-phase3.css';document.head.appendChild(l)}
 function splitIdeas(s){return (s||'').split(/;|\.\s+(?=[A-ZÁÉÍÓÚÑ¿])/).map(x=>x.trim()).filter(x=>x.length>18).slice(0,6)}
 function conceptFreq(ws){const f={};ws.forEach(w=>(w.concepts||[]).forEach(c=>f[c]=(f[c]||0)+1));return Object.entries(f).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,10).map(x=>x[0])}
 function receptions(ws){const out=[];ws.forEach(w=>{const g=guide(w);(g?.reception||[]).slice(0,2).forEach(r=>out.push({work:w,text:r}))});return out.slice(0,8)}
 function node(label,attrs='',meta=''){return `<button class="mm-node" ${attrs}><span>${esc(label)}</span>${meta?`<small>${esc(meta)}</small>`:''}</button>`}
 function branch(id,title,subtitle,items,side){return `<article class="mm-branch ${side}" data-mm-branch="${id}"><button class="mm-branch-head" data-mm-toggle="${id}"><span>${esc(title)}</span><small>${esc(subtitle)}</small><b>−</b></button><div class="mm-nodes">${items.join('')}</div></article>`}
 function branchData(ctx){
  const ws=(ctx.works||[]).map(getWork).filter(Boolean);
  const authors=uniq(ws.map(w=>w.author));
  const contextsNodes=[
   node('Orden político',`data-mm-detail="${esc(ctx.order)}"`),
   node('Estructura social',`data-mm-detail="${esc(ctx.society)}"`),
   node('Legitimidad',`data-mm-detail="${esc(ctx.legitimacy)}"`)
  ];
  const entityNodes=(ctx.entities||[]).slice(0,9).map((e,i)=>node(e.name,`data-mm-entity="${i}" data-mm-detail="${esc(e.note)}"`,e.dates));
  const conflictNodes=splitIdeas(ctx.conflicts).map(x=>node(x,`data-mm-detail="${esc(x)}"`));
  const conceptNodes=conceptFreq(ws).map(c=>node(c,`data-mm-concept="${esc(c)}"`));
  const authorNodes=authors.slice(0,10).map(a=>node(a,`data-mm-author="${esc(a)}"`,`${ws.filter(w=>w.author===a).length} obra${ws.filter(w=>w.author===a).length>1?'s':''}`));
  const workNodes=ws.slice(0,12).map(w=>node(w.title,`data-mm-work="${w.id}"`,w.author));
  const questionNodes=[node(ctx.question,`data-mm-detail="${esc(ctx.question)}"`),...splitIdeas(ctx.summary).slice(0,2).map(x=>node(x,`data-mm-detail="${esc(x)}"`))];
  const receptionNodes=receptions(ws).map(r=>node(r.text,`data-mm-reception="${r.work.id}"`,r.work.author));
  return [
   branch('context','Contexto','condiciones de posibilidad',contextsNodes,'left'),
   branch('entities','Entes políticos','quién organiza poder y territorio',entityNodes,'left'),
   branch('conflicts','Conflictos','tensiones que estructuran la coyuntura',conflictNodes,'left'),
   branch('concepts','Conceptos','vocabularios dominantes del corpus',conceptNodes,'left'),
   branch('authors','Autores','interlocutores del período',authorNodes,'right'),
   branch('works','Obras','intervenciones textuales',workNodes,'right'),
   branch('questions','Preguntas','problemas teóricos abiertos',questionNodes,'right'),
   branch('receptions','Recepciones','cómo continúa la discusión',receptionNodes,'right')
  ];
 }
 function html(ctx){const branches=branchData(ctx);return `<article class="world-mindmap-section" id="worldMindmapSection" data-mm-context="${ctx.id}" style="--wa:${ctx.accent}">
   <div class="world-mindmap-head"><div><div class="eyebrow">FASE 3 · MINDMAP INTERACTIVO</div><h2>Arquitectura intelectual del período</h2><p>El mapa mental conecta contexto, estructuras políticas, conflictos, conceptos, autores, obras, preguntas y recepciones. No supone causalidad lineal: organiza relaciones para estudiar y comparar.</p></div><div class="mm-actions"><button data-mm-expand="all">Expandir todo</button><button data-mm-expand="none">Contraer ramas</button></div></div>
   <div class="mindmap-shell">
    <div class="mindmap-left">${branches.slice(0,4).join('')}</div>
    <div class="mindmap-core"><div class="mm-core-ring"><small>${esc(ctx.dates)}</small><strong>${esc(ctx.label)}</strong><p>${esc(ctx.question)}</p><span>${(ctx.works||[]).length} obras · ${(ctx.entities||[]).length} entes</span></div></div>
    <div class="mindmap-right">${branches.slice(4).join('')}</div>
   </div>
   <div class="mm-inspector" id="mmInspector"><div><div class="eyebrow">LECTURA DEL NODO</div><h3>${esc(ctx.label)}</h3><p>Seleccioná un nodo para ver su relación con el período. Las obras abren directamente el dossier; los entes políticos vuelven al mapa histórico.</p></div><div id="mmInspectorActions"></div></div>
  </article>`}
 function inject(){
  ensureStyle();const app=document.getElementById('worldApp');if(!app)return;
  const ctx=getCtx(document.getElementById('worldSelect')?.value)||contexts()[0];if(!ctx)return;
  const old=document.getElementById('worldMindmapSection');if(old?.dataset.mmContext===ctx.id)return;if(old)old.remove();
  const lower=app.querySelector('.world-lower');if(!lower)return;const wrap=document.createElement('div');wrap.innerHTML=html(ctx);const section=wrap.firstElementChild;if(!section)return;
  const synopsis=document.getElementById('worldSynopsisSection'),worksCard=lower.querySelector('.world-works-card');
  if(synopsis&&synopsis.parentElement===lower)synopsis.insertAdjacentElement('afterend',section);else if(worksCard)lower.insertBefore(section,worksCard);else lower.appendChild(section);
 }
 function inspect(title,text,actions=''){const box=document.getElementById('mmInspector');if(!box)return;box.querySelector('h3').textContent=title;box.querySelector('p').textContent=text||'';const a=document.getElementById('mmInspectorActions');if(a)a.innerHTML=actions}
 function showAuthor(author){const ctx=getCtx(document.getElementById('worldSelect')?.value),ws=(ctx?.works||[]).map(getWork).filter(w=>w&&w.author===author);inspect(author,`En este período aparece asociado a ${ws.length} obra${ws.length!==1?'s':''} del Atlas.`,ws.map(w=>`<button data-mm-open-work="${w.id}">${esc(w.title)} →</button>`).join(''))}
 function showConcept(c){const ctx=getCtx(document.getElementById('worldSelect')?.value),ws=(ctx?.works||[]).map(getWork).filter(w=>w&&(w.concepts||[]).includes(c));inspect(c,`Concepto presente en ${ws.length} obra${ws.length!==1?'s':''} de este contexto. Conviene comparar su significado entre autores antes de asumir continuidad semántica.`,`<button data-mm-library-concept="${esc(c)}">Ver obras con “${esc(c)}” →</button>`)}
 function focusEntity(i){const node=document.querySelector(`.world-entity[data-entity="${i}"]`);if(node){node.dispatchEvent(new MouseEvent('click',{bubbles:true}));document.getElementById('worldMapCard')?.scrollIntoView({behavior:'smooth',block:'center'})}}
 function schedule(){setTimeout(inject,10)}
 document.addEventListener('click',e=>{
  const work=e.target.closest?.('[data-mm-work],[data-mm-open-work]');if(work){e.preventDefault();const id=work.dataset.mmWork||work.dataset.mmOpenWork;if(typeof openWork==='function')openWork(id);return}
  const ent=e.target.closest?.('[data-mm-entity]');if(ent){e.preventDefault();focusEntity(Number(ent.dataset.mmEntity));return}
  const author=e.target.closest?.('[data-mm-author]');if(author){e.preventDefault();showAuthor(author.dataset.mmAuthor);return}
  const concept=e.target.closest?.('[data-mm-concept]');if(concept){e.preventDefault();showConcept(concept.dataset.mmConcept);return}
  const rec=e.target.closest?.('[data-mm-reception]');if(rec){e.preventDefault();inspect('Recepción',rec.querySelector('span')?.textContent||'',`<button data-mm-open-work="${rec.dataset.mmReception}">Abrir obra de origen →</button>`);return}
  const detail=e.target.closest?.('[data-mm-detail]');if(detail){e.preventDefault();inspect(detail.querySelector('span')?.textContent||'Nodo',detail.dataset.mmDetail);return}
  const toggle=e.target.closest?.('[data-mm-toggle]');if(toggle){e.preventDefault();const b=document.querySelector(`[data-mm-branch="${toggle.dataset.mmToggle}"]`);b?.classList.toggle('collapsed');const sign=b?.querySelector('.mm-branch-head b');if(sign)sign.textContent=b.classList.contains('collapsed')?'+':'−';return}
  const exp=e.target.closest?.('[data-mm-expand]');if(exp){e.preventDefault();document.querySelectorAll('.mm-branch').forEach(b=>{const collapse=exp.dataset.mmExpand==='none';b.classList.toggle('collapsed',collapse);const sign=b.querySelector('.mm-branch-head b');if(sign)sign.textContent=collapse?'+':'−'});return}
  const lib=e.target.closest?.('[data-mm-library-concept]');if(lib){e.preventDefault();if(typeof show==='function')show('library');const t=document.getElementById('theme');if(t){t.value=lib.dataset.mmLibraryConcept;t.dispatchEvent(new Event('input',{bubbles:true}))}return}
  if(e.target.closest?.('[data-world-era]')||e.target.closest?.('[data-v="world"]'))schedule();
 },true);
 document.addEventListener('change',e=>{if(e.target?.id==='worldSelect')schedule()},true);
 function boot(){ensureStyle();schedule()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
 window.renderWorldPhase3=inject;
})();