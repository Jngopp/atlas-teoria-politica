// Atlas Router V3 — URLs permanentes y navegación enciclopédica por hash.
(function(){
 const DB=()=>window.ATLAS_DB;
 const API=()=>window.AtlasDB;
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const VIEW_ROUTES={home:'inicio',library:'biblioteca',visuals:'visualizaciones',world:'mundo',concepts:'conceptos',papers:'papers',discipline:'disciplina',guides:'guias'};
 const ROUTE_VIEWS=Object.fromEntries(Object.entries(VIEW_ROUTES).map(([k,v])=>[v,k]));
 let applying=false,suppressDialogClose=false,lastNonWork='#/biblioteca';
 const rawOpenWork=window.openWork;

 function hashPath(path){const p=String(path||'').replace(/^#?\/?/,'');return '#/'+p}
 function parse(){
  const raw=(location.hash||'#/inicio').replace(/^#\/?/,'');
  const parts=raw.split('/').filter(Boolean).map(decodeURIComponent);
  return {raw,kind:parts[0]||'inicio',id:parts.slice(1).join('/')};
 }
 function replaceOrPush(path,replace=false){
  const h=hashPath(path);
  if(location.hash===h){apply();return}
  if(replace)history.replaceState(null,'',h);else location.hash=h;
  if(replace)apply();
 }
 function navigate(path,opts={}){replaceOrPush(path,!!opts.replace)}
 function setTitle(title){document.title=(title?title+' · ':'')+'Atlas de Teoría Política'}
 function closeDialog(){
  const d=document.getElementById('dlg');
  if(d?.open){suppressDialogClose=true;try{d.close()}catch{};setTimeout(()=>suppressDialogClose=false,0)}
 }
 function showView(id){
  if(typeof window.show==='function')window.show(id);
  else{
   document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
   document.getElementById(id)?.classList.add('on');
   document.querySelectorAll('[data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===id));
   scrollTo(0,0);
  }
 }
 function ensureEntityView(){
  let s=document.getElementById('entity');
  if(s)return s;
  s=document.createElement('section');s.id='entity';s.className='view atlas-entity-view';
  const main=document.querySelector('main.wrap'),concepts=document.getElementById('concepts');
  main?.insertBefore(s,concepts||null);
  return s;
 }
 function legacyWork(id){return typeof WORKS!=='undefined'?WORKS.find(w=>w.id===id):null}
 function routeFor(type,id){
  if(type==='work')return '/obra/'+id;
  if(type==='author')return '/autor/'+String(id).replace(/^author:/,'');
  if(type==='concept')return '/concepto/'+String(id).replace(/^concept:/,'');
  if(type==='problem')return '/problema/'+id;
  if(type==='context')return '/contexto/'+String(id).replace(/^context:/,'');
  if(type==='tradition')return '/tradicion/'+String(id).replace(/^tradition:/,'');
  if(type==='era')return '/epoca/'+String(id).replace(/^era:/,'');
  return '/inicio';
 }
 function entityLabel(type,id){
  const x=API()?.get(type,id);
  return x?.name||x?.label||x?.title||id;
 }
 function copyCurrent(btn){
  const url=location.href;
  const done=()=>{const old=btn.textContent;btn.textContent='Enlace copiado ✓';setTimeout(()=>btn.textContent=old,1600)};
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(url).then(done).catch(()=>{});
  else{const t=document.createElement('textarea');t.value=url;document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch{}t.remove()}
 }
 function wikiBar(type,label){
  return '<div class="atlas-wiki-bar"><div><span>ATLAS · '+esc(type.toUpperCase())+'</span><b>'+esc(label)+'</b></div><div class="atlas-wiki-actions"><button data-copy-permalink>Copiar enlace</button><button data-route="/biblioteca">Biblioteca</button></div></div>';
 }
 function workButtons(ids){
  const ws=(ids||[]).map(legacyWork).filter(Boolean);
  if(!ws.length)return '<p class="atlas-empty">No hay obras vinculadas en la base actual.</p>';
  return '<div class="atlas-entity-workgrid">'+ws.map(w=>'<button class="atlas-entity-work" data-route="'+routeFor('work',w.id)+'"><small>'+esc(w.date)+' · '+esc(w.trad)+'</small><strong>'+esc(w.title)+'</strong><span>'+esc(w.author)+'</span><p>'+esc(w.problem)+'</p></button>').join('')+'</div>';
 }
 function conceptLinks(ids){
  if(!(ids||[]).length)return '';
  return '<div class="atlas-linkchips">'+ids.slice(0,24).map(id=>{const c=API().get('concept',id);return c?'<button data-route="'+routeFor('concept',id)+'">'+esc(c.label)+'</button>':''}).join('')+'</div>';
 }
 function problemLinks(ids){
  if(!(ids||[]).length)return '';
  return '<div class="atlas-linkchips problem">'+ids.map(id=>{const p=API().get('problem',id);return p?'<button data-route="'+routeFor('problem',id)+'">'+esc(p.label)+'</button>':''}).join('')+'</div>';
 }
 function relatedAuthors(authorId){
  const rels=API().relationsFor('author',authorId).filter(r=>['intellectual','comparative'].includes(DB().relationTypes[r.predicate]?.category));
  if(!rels.length)return '<p class="atlas-empty">No hay relaciones intelectuales tipadas para mostrar.</p>';
  return '<div class="atlas-rel-list">'+rels.slice(0,30).map(r=>{
   const outgoing=r.sourceType==='author'&&r.sourceId===authorId;
   const other=outgoing?r.targetId:r.sourceId;
   const a=API().get('author',other);if(!a)return'';
   const rt=DB().relationTypes[r.predicate];
   return '<button data-route="'+routeFor('author',other)+'"><span>'+esc(outgoing?'→':'←')+'</span><div><b>'+esc(a.name)+'</b><small>'+esc(rt?.label||r.predicate)+'</small></div></button>';
  }).join('')+'</div>';
 }
 function breadcrumb(items){
  return '<nav class="atlas-breadcrumb">'+items.map((x,i)=>i===items.length-1?'<span>'+esc(x[0])+'</span>':'<button data-route="'+x[1]+'">'+esc(x[0])+'</button><i>›</i>').join('')+'</nav>';
 }
 function renderAuthor(slug){
  const id='author:'+slug,a=API().get('author',id);if(!a)return render404('Autor',slug);
  const works=API().worksByAuthor(id),conceptIds=[...new Set(works.flatMap(w=>w.conceptIds))],problemIds=[...new Set(works.flatMap(w=>w.problemIds))];
  const sec=ensureEntityView();showView('entity');setTitle(a.name);
  sec.innerHTML=wikiBar('autor',a.name)+breadcrumb([['Inicio','/inicio'],['Autores','/biblioteca'],[a.name]])+
   '<header class="atlas-entity-hero"><div><div class="eyebrow">AUTOR / TRADICIÓN</div><h1>'+esc(a.name)+'</h1><p>'+esc(a.kind==='person'?'Autor individual':a.kind==='collective'?'Autoría colectiva':'Tradición textual o autoral')+' · '+works.length+' obra'+(works.length!==1?'s':'')+' en el Atlas.</p></div><div class="atlas-entity-stat"><b>'+works.length+'</b><span>obras</span></div></header>'+
   (a.members?.length?'<section class="atlas-entity-section"><h2>Integrantes de la autoría</h2><div class="atlas-linkchips">'+a.members.map(x=>'<button data-route="'+routeFor('author',x)+'">'+esc(entityLabel('author',x))+'</button>').join('')+'</div></section>':'')+
   '<section class="atlas-entity-section"><div class="eyebrow">OBRAS</div><h2>Textos incorporados al Atlas</h2>'+workButtons(works.map(w=>w.id))+'</section>'+
   '<div class="atlas-entity-columns"><section class="atlas-entity-section"><div class="eyebrow">CONCEPTOS</div><h2>Vocabulario asociado</h2>'+conceptLinks(conceptIds)+'</section><section class="atlas-entity-section"><div class="eyebrow">PROBLEMAS</div><h2>Preguntas del Atlas</h2>'+problemLinks(problemIds)+'</section></div>'+
   '<section class="atlas-entity-section"><div class="eyebrow">RED INTELECTUAL</div><h2>Relaciones tipadas</h2><p class="note">Las flechas distinguen recepción, crítica, reinterpretación, diálogo y antecedentes; no significan “influencia” de manera automática.</p>'+relatedAuthors(id)+'</section>';
 }
 function renderConcept(slug){
  const id='concept:'+slug,c=API().get('concept',id);if(!c)return render404('Concepto',slug);
  const works=API().worksByConcept(id),problems=Object.values(DB().problems).filter(p=>(p.concepts||[]).some(x=>API().slug(x)===slug)||p.workIds.some(w=>works.some(x=>x.id===w)));
  const sec=ensureEntityView();showView('entity');setTitle(c.label);
  sec.innerHTML=wikiBar('concepto',c.label)+breadcrumb([['Inicio','/inicio'],['Conceptos','/conceptos'],[c.label]])+
   '<header class="atlas-entity-hero concept-hero"><div><div class="eyebrow">HISTORIA CONCEPTUAL</div><h1>'+esc(c.label)+'</h1><p>'+esc(c.definition)+'</p>'+(c.definitionStatus==='pending'?'<div class="atlas-editorial-note">Definición global pendiente de normalización editorial. Las definiciones específicas de cada obra siguen disponibles en sus dossiers.</div>':'')+'</div><div class="atlas-entity-stat"><b>'+works.length+'</b><span>obras</span></div></header>'+
   '<section class="atlas-entity-section"><div class="eyebrow">PROBLEMAS RELACIONADOS</div><h2>Qué preguntas organiza</h2>'+problemLinks(problems.slice(0,8).map(p=>p.id))+'</section>'+
   '<section class="atlas-entity-section"><div class="eyebrow">CORPUS</div><h2>Obras que trabajan este concepto</h2>'+workButtons(works.map(w=>w.id))+'</section>';
 }
 function renderProblem(id){
  const p=API().get('problem',id);if(!p)return render404('Problema',id);
  const works=API().worksByProblem(id);
  const cids=[...new Set(works.flatMap(w=>w.conceptIds))];
  const sec=ensureEntityView();showView('entity');setTitle(p.label);
  sec.innerHTML=wikiBar('problema',p.label)+breadcrumb([['Inicio','/inicio'],['Problemas','/biblioteca'],[p.label]])+
   '<header class="atlas-entity-hero problem-hero"><div><div class="eyebrow">PROBLEMA TRANSVERSAL</div><h1>'+esc(p.label)+'</h1><p class="atlas-question">'+esc(p.question)+'</p><p>Los problemas son categorías comparativas del Atlas: vinculan textos de épocas distintas sin afirmar que usen conceptos idénticos.</p></div><div class="atlas-entity-stat"><b>'+works.length+'</b><span>obras</span></div></header>'+
   '<section class="atlas-entity-section"><div class="eyebrow">VOCABULARIO</div><h2>Conceptos asociados en el corpus</h2>'+conceptLinks(cids)+'</section>'+
   '<section class="atlas-entity-section"><div class="eyebrow">RESPUESTAS</div><h2>Obras que intervienen sobre el problema</h2>'+workButtons(works.map(w=>w.id))+'</section>';
 }
 function renderTradition(slug){
  const id='tradition:'+slug,t=API().get('tradition',id);if(!t)return render404('Tradición',slug);
  const sec=ensureEntityView();showView('entity');setTitle(t.label);
  sec.innerHTML=wikiBar('tradición',t.label)+breadcrumb([['Inicio','/inicio'],['Biblioteca','/biblioteca'],[t.label]])+
   '<header class="atlas-entity-hero"><div><div class="eyebrow">TRADICIÓN INTELECTUAL</div><h1>'+esc(t.label)+'</h1><p>Clasificación editorial normalizada del corpus.</p></div><div class="atlas-entity-stat"><b>'+t.workIds.length+'</b><span>obras</span></div></header>'+
   '<section class="atlas-entity-section"><h2>Obras vinculadas</h2>'+workButtons(t.workIds)+'</section>';
 }
 function renderEra(key){
  const id='era:'+key,e=API().get('era',id);if(!e)return render404('Época',key);
  const sec=ensureEntityView();showView('entity');setTitle(e.label);
  sec.innerHTML=wikiBar('época',e.label)+breadcrumb([['Inicio','/inicio'],['Biblioteca','/biblioteca'],[e.label]])+
   '<header class="atlas-entity-hero" style="--entity-accent:'+esc(e.color)+'"><div><div class="eyebrow">PERÍODO</div><h1>'+esc(e.label)+'</h1></div><div class="atlas-entity-stat"><b>'+e.workIds.length+'</b><span>obras</span></div></header>'+
   '<section class="atlas-entity-section"><h2>Corpus del período</h2>'+workButtons(e.workIds)+'</section>';
 }
 function render404(type,id){
  const sec=ensureEntityView();showView('entity');setTitle('No encontrado');
  sec.innerHTML=wikiBar('error','Entrada no encontrada')+'<div class="atlas-notfound"><div class="eyebrow">'+esc(type)+'</div><h1>No encontramos “'+esc(id)+'”</h1><p>La URL es válida como formato del Atlas, pero la entidad no existe en la base actual.</p><button class="primary" data-route="/biblioteca">Volver a la biblioteca</button></div>';
 }
 function decorateDossier(id){
  const w=legacyWork(id),box=document.getElementById('dossier');if(!w||!box)return;
  if(!box.querySelector('.atlas-dossier-routebar')){const bar=document.createElement('div');bar.className='atlas-dossier-routebar';bar.innerHTML='<span>URL PERMANENTE · OBRA</span><button data-copy-permalink>Copiar enlace</button>';box.prepend(bar)}
  const a=box.querySelector('.v2-author');if(a){a.classList.add('atlas-route-link');a.title='Abrir ficha de autor';a.dataset.route=routeFor('author','author:'+API().slug(w.author))}
  box.querySelectorAll('.v2-dhero .chip').forEach(ch=>{ch.classList.add('atlas-route-link');ch.title='Abrir ficha de concepto';ch.dataset.route=routeFor('concept','concept:'+API().slug(ch.textContent.trim()))});
 }
 function openWorkRoute(id){
  const w=legacyWork(id);if(!w)return render404('Obra',id);
  setTitle(w.title);showView('library');
  const p=rawOpenWork?.(id);setTimeout(()=>decorateDossier(id),0);Promise.resolve(p).then(()=>decorateDossier(id)).catch(()=>{});
 }
 function renderContext(key){
  const c=API().get('context','context:'+key);if(!c)return render404('Contexto',key);
  setTitle(c.label);showView('world');
  const run=()=>{if(typeof window.renderWorldContext==='function')window.renderWorldContext(key);else if(typeof window.renderWorld==='function'){window.renderWorld();setTimeout(()=>{const s=document.getElementById('worldSelect');if(s){s.value=key;s.dispatchEvent(new Event('change',{bubbles:true}))}},0)}};
  setTimeout(run,0);
 }
 function apply(){
  if(applying)return;applying=true;
  const r=parse();
  try{
   if(r.kind!=='obra')lastNonWork=location.hash||'#/biblioteca';
   if(r.kind!=='obra')closeDialog();
   if(ROUTE_VIEWS[r.kind]){setTitle('');showView(ROUTE_VIEWS[r.kind]);if(r.kind==='mundo')setTimeout(()=>window.renderWorld?.(),0);return}
   if(r.kind==='obra')return openWorkRoute(r.id);
   if(r.kind==='autor')return renderAuthor(r.id);
   if(r.kind==='concepto')return renderConcept(r.id);
   if(r.kind==='problema')return renderProblem(r.id);
   if(r.kind==='contexto')return renderContext(r.id);
   if(r.kind==='tradicion')return renderTradition(r.id);
   if(r.kind==='epoca')return renderEra(r.id);
   return render404('Ruta',r.raw);
  }finally{applying=false}
 }
 function bindNavigation(){
  document.addEventListener('click',e=>{
   const copy=e.target.closest?.('[data-copy-permalink]');
   if(copy){e.preventDefault();e.stopImmediatePropagation();copyCurrent(copy);return}
   const direct=e.target.closest?.('[data-route]');
   if(direct){e.preventDefault();e.stopImmediatePropagation();navigate(direct.dataset.route);return}
   const nav=e.target.closest?.('[data-v],[data-go]');
   if(nav){const view=nav.dataset.v||nav.dataset.go,route=VIEW_ROUTES[view];if(route){e.preventDefault();e.stopImmediatePropagation();navigate('/'+route);return}}
   const concept=e.target.closest?.('#conceptGrid .concept');
   if(concept){const name=concept.querySelector('h3')?.textContent?.trim();if(name){e.preventDefault();e.stopImmediatePropagation();navigate('/concepto/'+API().slug(name));return}}
  },true);
  const dlg=document.getElementById('dlg');
  dlg?.addEventListener('close',()=>{if(suppressDialogClose)return;const r=parse();if(r.kind==='obra')navigate(lastNonWork.replace(/^#/,''),{replace:true})});
 }
 function expose(){
  window.AtlasRouter={navigate,apply,routeFor,parse,permalink:(type,id)=>location.origin+location.pathname+hashPath(routeFor(type,id))};
  if(rawOpenWork)window.openWork=id=>navigate(routeFor('work',id));
 }
 function boot(){
  ensureEntityView();expose();bindNavigation();
  if(!location.hash)navigate('/inicio',{replace:true});else apply();
 }
 addEventListener('hashchange',apply);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();