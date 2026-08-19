// Reparación estructural V3: un único dossier, profundidad completa y visualizaciones estables.
(function(){
 const el=id=>document.getElementById(id);
 const esc=s=>(s??'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[m]));
 const list=a=>`<ul class="v2-list">${(a||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
 const paras=a=>(a||[]).map(x=>`<p>${esc(x)}</p>`).join('');
 const uniq=a=>[...new Set(a)];
 function concepts(o){return `<div class="v2-concepts">${Object.entries(o||{}).map(([k,v])=>`<article><b>${esc(k)}</b><span>${esc(v)}</span></article>`).join('')}</div>`;}
 function work(id){return WORKS.find(w=>w.id===id);}
 function safeGuide(w){try{return typeof getRichStudyGuide==='function'?getRichStudyGuide(w):(typeof getStudyGuide==='function'?getStudyGuide(w):null)}catch{return null}}
 function safeClass(w){try{return typeof getMiniClass==='function'?getMiniClass(w):null}catch{return null}}

 async function openDossier(id){
  const w=work(id); if(!w)return;
  const g=safeGuide(w)||{summary:[w.thesis],problemAnalysis:[w.context,w.thesis],architecture:[],keys:{},debates:[],comparisons:[],reception:[],study:[],secondary:[]};
  const mc=safeClass(w)||{lecture:g.summary||[w.thesis],route:g.architecture,compare:g.comparisons,exam:g.study,reading:g.secondary};
  const dialog=el('dlg'),box=el('dossier'); if(!dialog||!box)return;
  box.innerHTML=`
   <section class="v2-dhero">
    <div class="v2-dhero-copy"><div class="eyebrow">MINI CLASE + DOSSIER · ${esc(typeof eraName==='function'?eraName(w.era):w.era)}</div><h1>${esc(w.title)}</h1><div class="v2-author">${esc(w.author)}</div><p>${esc(w.problem)}</p><div class="chips">${(w.concepts||[]).map(c=>`<span class="chip">${esc(c)}</span>`).join('')}</div></div>
    <div class="v2-portrait"><img id="v2AuthorImg" alt="${esc(w.author)}"></div>
   </section>
   <div class="v2-dossier-grid"><main>
    <section class="v2-lecture"><div class="eyebrow">CLASE UNIVERSITARIA</div><h2>Cómo leer ${esc(w.title)}</h2>${paras(mc.lecture?.length?mc.lecture:g.summary)}</section>
    <section class="v2-block"><div class="v2-number">01</div><div><div class="eyebrow">PROBLEMA Y TESIS</div><h2>Qué problema intenta resolver y qué respuesta construye</h2>${paras(g.problemAnalysis?.length?g.problemAnalysis:[w.context,w.thesis])}<div class="v2-thesis-callout"><b>Tesis en una frase</b><p>${esc(w.thesis)}</p></div></div></section>
    <section class="v2-block"><div class="v2-number">02</div><div><div class="eyebrow">RECORRIDO ARGUMENTAL</div><h2>Cómo avanza el razonamiento</h2><p class="v2-intro-note">No es un índice mecánico: estos pasos muestran qué función cumple cada momento dentro de la respuesta general de la obra.</p>${list(g.architecture?.length?g.architecture:mc.route)}</div></section>
    <section class="v2-block"><div class="v2-number">03</div><div><div class="eyebrow">CONCEPTOS</div><h2>Vocabulario central, definido en contexto</h2><p class="v2-intro-note">Las definiciones corresponden al problema histórico de la obra. El mismo término puede significar algo distinto en otro autor o período.</p>${concepts(g.keys)}</div></section>
    <section class="v2-block"><div class="v2-number">04</div><div><div class="eyebrow">INTERPRETACIONES</div><h2>Debates que conviene conocer</h2><p class="v2-intro-note">Estos desacuerdos ayudan a evitar una lectura escolar única y muestran dónde interviene la investigación especializada.</p>${list(g.debates)}</div></section>
    <section class="v2-block"><div class="v2-number">05</div><div><div class="eyebrow">COMPARACIÓN</div><h2>Con quién ponerlo en diálogo y para qué</h2>${list(g.comparisons?.length?g.comparisons:mc.compare)}</div></section>
    <section class="v2-block"><div class="v2-number">06</div><div><div class="eyebrow">RECEPCIÓN</div><h2>Cómo cambió la obra al ser leída después</h2><p class="v2-intro-note">Recepción no equivale a influencia lineal: incluye apropiaciones, críticas, traducciones conceptuales y relecturas disciplinarias.</p>${list(g.reception)}</div></section>
    <section class="v2-block v2-exam"><div class="v2-number">07</div><div><div class="eyebrow">PARA EXAMEN</div><h2>Qué tenés que poder explicar</h2>${list(g.study?.length?g.study:mc.exam)}</div></section>
    <section class="v2-block"><div class="v2-number">08</div><div><div class="eyebrow">PARA SEGUIR</div><h2>Bibliografía secundaria y líneas de profundización</h2>${list(g.secondary?.length?g.secondary:mc.reading)}</div></section>
   </main><aside class="v2-side"><div class="v2-sidebox"><h3>Ficha rápida</h3><p><b>Autor:</b> ${esc(w.author)}</p><p><b>Fecha:</b> ${esc(w.date)}</p><p><b>Tradición:</b> ${esc(w.trad)}</p><p><b>Época:</b> ${esc(typeof eraName==='function'?eraName(w.era):w.era)}</p>${w.reader?`<a class="readerlink" target="_blank" rel="noopener" href="${w.reader}">Leer edición disponible ↗</a>`:''}<button class="primary v2-full" id="v2Papers">Buscar bibliografía</button></div></aside></div>`;
  try{dialog.showModal();}catch{dialog.setAttribute('open','');}
  const img=el('v2AuthorImg'); if(img&&typeof wikiImage==='function'){try{const src=await wikiImage(w.author);if(src)img.src=src;else if(typeof setImg==='function')setImg(img,w.author,w.author)}catch{}}
  const pb=el('v2Papers');if(pb)pb.onclick=()=>{try{dialog.close()}catch{};if(typeof show==='function')show('papers');const pq=el('pq');if(pq)pq.value=w.author+' '+w.title;if(typeof searchPapers==='function')searchPapers();};
 }
 window.openWork=openDossier;

 document.addEventListener('click',e=>{
  const card=e.target.closest?.('.card[data-id]');
  if(card){e.preventDefault();e.stopPropagation();openDossier(card.dataset.id);return;}
  const vnode=e.target.closest?.('[data-v2work]');
  if(vnode){e.preventDefault();openDossier(vnode.dataset.v2work);}
 },true);

 function authorLabel(w){return w.author.replace('Tradición ','').replace('Karl Marx y Friedrich Engels','Marx / Engels').replace('Hamilton, Madison y Jay','Federalistas');}
 function genealogyHTML(){
  return `<div class="v2-genealogies">${CLASSIC_GENEALOGIES.map(g=>{
    const ws=g.works.map(work).filter(Boolean);
    return `<article class="v2-genealogy" style="--gc:${g.color}"><header><div><span>GENEALOGÍA</span><h3>${esc(g.name)}</h3><p>${esc(g.desc)}</p></div><b>${ws.length} hitos</b></header><div class="v2-chain">${ws.map((w,i)=>`${i?'<div class="v2-arrow">→</div>':''}<button class="v2-node" data-v2work="${w.id}"><small>${esc(w.date)}</small><strong>${esc(authorLabel(w))}</strong><span>${esc(w.title)}</span></button>`).join('')}</div></article>`;
   }).join('')}</div>`;
 }
 function eraHTML(era){
  const ws=WORKS.filter(w=>w.era===era);
  const names=new Set(ws.map(w=>w.author));
  const rel=(RELATIONS||[]).filter(([a,b])=>names.has(a)&&names.has(b));
  return `<div class="v2-era-head"><div><div class="eyebrow">VISTA POR ÉPOCA</div><h3>${esc(typeof eraName==='function'?eraName(era):era)}</h3><p>${ws.length} obras · ${uniq(ws.map(w=>w.author)).length} autores/tradiciones · ${rel.length} relaciones internas registradas.</p></div></div><div class="v2-era-grid">${ws.map(w=>{
   const incoming=rel.filter(r=>r[1]===w.author).map(r=>r[0]);const outgoing=rel.filter(r=>r[0]===w.author).map(r=>r[1]);
   return `<button class="v2-era-card" data-v2work="${w.id}" style="--ec:${typeof eraColor==='function'?eraColor(w.era):'#555'}"><small>${esc(w.date)} · ${esc(w.trad)}</small><strong>${esc(w.author)}</strong><span>${esc(w.title)}</span><em>${incoming.length?'← '+esc(incoming.slice(0,2).join(', ')):''}${incoming.length&&outgoing.length?' · ':''}${outgoing.length?'→ '+esc(outgoing.slice(0,2).join(', ')):''}</em></button>`;
  }).join('')}</div>`;
 }
 function conceptHTML(){
  const freq={};WORKS.flatMap(w=>w.concepts||[]).forEach(c=>freq[c]=(freq[c]||0)+1);
  const rows=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,30),max=Math.max(...rows.map(x=>x[1]),1);
  return `<div class="v2-concept-map"><div class="v2-era-head"><div><div class="eyebrow">MAPA CONCEPTUAL</div><h3>Conceptos más presentes en la biblioteca</h3><p>Frecuencia descriptiva: indica cuántas obras están etiquetadas con cada concepto, no su importancia filosófica.</p></div></div>${rows.map(([k,v])=>`<div class="v2-cbar"><b>${esc(k)}</b><div><span style="width:${v/max*100}%"></span></div><strong>${v}</strong></div>`).join('')}</div>`;
 }
 function visualShell(){
  const sec=el('visuals'); if(!sec)return null;
  sec.innerHTML=`<div class="section-head"><div><div class="eyebrow">ATLAS VISUAL · V3</div><h1>Genealogías e influencias</h1><p>Vista estable y legible: genealogías troncales, exploración por época y distribución conceptual.</p></div></div><div class="v2-vis-toolbar panel"><button class="on" data-v2mode="gene">Genealogías troncales</button><button data-v2mode="era">Por época</button><button data-v2mode="concept">Conceptos</button><select id="v2EraSelect" hidden>${ERAS.map(e=>`<option value="${e[0]}">${esc(e[1])}</option>`).join('')}</select></div><div id="v2VisBody"></div>`;
  return sec;
 }
 function renderV2(){
  visualShell();const body=el('v2VisBody'),sel=el('v2EraSelect');
  const paint=mode=>{if(!body)return;if(mode==='gene')body.innerHTML=genealogyHTML();if(mode==='era')body.innerHTML=eraHTML(sel?.value||'greece');if(mode==='concept')body.innerHTML=conceptHTML();if(sel)sel.hidden=mode!=='era';};
  document.querySelectorAll('[data-v2mode]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-v2mode]').forEach(x=>x.classList.toggle('on',x===b));paint(b.dataset.v2mode);});if(sel)sel.onchange=()=>paint('era');paint('gene');
 }
 window.renderVisuals=renderV2;
 const visualBtn=document.querySelector('[data-v="visuals"]');if(visualBtn)visualBtn.addEventListener('click',()=>setTimeout(renderV2,0),true);
})();