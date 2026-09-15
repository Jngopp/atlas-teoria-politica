// Atlas Entities V4 — artículos enciclopédicos de Autor, Concepto y Problema.
(function(){
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const uniq=a=>[...new Set((a||[]).filter(Boolean))];
 const DB=()=>window.ATLAS_DB;
 const API=()=>window.AtlasDB;
 const slug=s=>API()?.slug(s)||String(s||'').toLowerCase();
 const route=(type,id)=>{
  if(type==='work')return '/obra/'+id;
  if(type==='author')return '/autor/'+String(id).replace(/^author:/,'');
  if(type==='concept')return '/concepto/'+String(id).replace(/^concept:/,'');
  if(type==='problem')return '/problema/'+id;
  if(type==='context')return '/contexto/'+String(id).replace(/^context:/,'');
  if(type==='tradition')return '/tradicion/'+String(id).replace(/^tradition:/,'');
  if(type==='era')return '/epoca/'+String(id).replace(/^era:/,'');
  return '/inicio';
 };
 const work=id=>typeof WORKS!=='undefined'?WORKS.find(w=>w.id===id):null;
 const rich=w=>{try{return typeof getRichStudyGuide==='function'?getRichStudyGuide(w):null}catch{return null}};
 const eraOrder=id=>{const key=String(id||'').replace(/^era:/,'');return (typeof ERAS!=='undefined'?ERAS:[]).findIndex(e=>e[0]===key)};
 const eraLabel=id=>DB()?.eras?.[id]?.label||String(id||'').replace(/^era:/,'');
 const sec=()=>document.getElementById('entity');
 function showEntity(){if(typeof show==='function')show('entity');else{document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));sec()?.classList.add('on')}}
 function title(s){document.title=s+' · Atlas de Teoría Política'}
 function nav(path,label,cls=''){return '<button class="'+cls+'" data-route="'+esc(path)+'">'+esc(label)+'</button>'}
 function breadcrumb(items){return '<nav class="atlas-breadcrumb">'+items.map((x,i)=>i===items.length-1?'<span>'+esc(x[0])+'</span>':nav(x[1],x[0])+'<i>›</i>').join('')+'</nav>'}
 function wikiBar(type,label){return '<div class="atlas-wiki-bar"><div><span>ATLAS · '+esc(type.toUpperCase())+'</span><b>'+esc(label)+'</b></div><div class="atlas-wiki-actions"><button data-copy-permalink>Copiar enlace</button>'+nav('/enciclopedia','Índice')+'</div></div>'}
 function toc(items){return '<aside class="atlas-article-toc"><div class="eyebrow">CONTENIDOS</div>'+items.map((x,i)=>'<a href="#'+x[0]+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+esc(x[1])+'</a>').join('')+'</aside>'}
 function section(id,eyebrow,h,html){return '<section id="'+id+'" class="atlas-article-section"><div class="eyebrow">'+esc(eyebrow)+'</div><h2>'+esc(h)+'</h2>'+html+'</section>'}
 function chips(ids,type='concept',limit=40){return '<div class="atlas-linkchips">'+(ids||[]).slice(0,limit).map(id=>{const o=API().get(type,id);const label=o?.label||o?.name||o?.title;if(!o)return'';return nav(route(type,id),label)}).join('')+'</div>'}
 function workCards(ids,detail=true){const ws=(ids||[]).map(work).filter(Boolean);if(!ws.length)return'<p class="atlas-empty">Sin obras vinculadas.</p>';return '<div class="atlas-v4-workgrid">'+ws.map(w=>'<article class="atlas-v4-work"><div><small>'+esc(w.date)+' · '+esc(w.trad)+'</small><h3>'+esc(w.title)+'</h3><b>'+esc(w.author)+'</b>'+(detail?'<p>'+esc(w.problem)+'</p><blockquote>'+esc(w.thesis)+'</blockquote>':'')+'</div>'+nav(route('work',w.id),'Abrir dossier →','atlas-textlink')+'</article>').join('')+'</div>'}
 function contextsForWorks(ids){const set=new Set(ids);return Object.values(DB()?.contexts||{}).filter(c=>(c.workIds||[]).some(id=>set.has(id)))}
 function contextsHTML(contexts){if(!contexts.length)return'<p class="atlas-empty">Sin contexto histórico explícito vinculado.</p>';return '<div class="atlas-context-cards">'+contexts.map(c=>'<article><small>'+esc(c.dates)+'</small><h3>'+esc(c.label)+'</h3><p>'+esc(c.summary)+'</p>'+nav(route('context',c.id),'Abrir contexto →','atlas-textlink')+'</article>').join('')+'</div>'}
 function topFrequency(items,max=20){const f={};items.forEach(x=>f[x]=(f[x]||0)+1);return Object.entries(f).sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0]))).slice(0,max)}
 function bibliography(works){return uniq(works.flatMap(w=>rich(w)?.secondary||[])).slice(0,30)}
 function list(xs){return '<ul class="atlas-article-list">'+(xs||[]).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>'}
 function intellectualRelations(authorId){
  return API().relationsFor('author',authorId).filter(r=>['intellectual','comparative'].includes(DB().relationTypes[r.predicate]?.category));
 }
 function relHTML(authorId){
  const rels=intellectualRelations(authorId);if(!rels.length)return'<p class="atlas-empty">No hay relaciones intelectuales tipadas para esta entrada.</p>';
  return '<div class="atlas-v4-relations">'+rels.map(r=>{const out=r.sourceId===authorId,other=out?r.targetId:r.sourceId,a=API().get('author',other),rt=DB().relationTypes[r.predicate];if(!a)return'';return '<article><span>'+esc(out?'→':'←')+'</span><div><small>'+esc(rt?.label||r.predicate)+'</small><h3>'+esc(a.name)+'</h3><p>'+(out?'Desde esta entrada hacia ':'Desde ')+'una relación tipada como '+esc(rt?.label||r.predicate)+'.</p>'+nav(route('author',other),'Abrir '+a.name+' →','atlas-textlink')+'</div></article>'}).join('')+'</div>';
 }
 function leadFromWorks(a,works){
  const probs=topFrequency(works.flatMap(w=>w.problemIds||[]),3).map(([id])=>API().get('problem',id)?.label).filter(Boolean);
  const cs=topFrequency(works.flatMap(w=>w.conceptIds||[]),5).map(([id])=>API().get('concept',id)?.label).filter(Boolean);
  const traditions=uniq(works.map(w=>API().get('tradition',w.traditionId)?.label).filter(Boolean));
  if(!works.length)return a.kind==='tradition'?'Tradición textual incorporada al Atlas como entidad autoral colectiva.':'Entrada autoral todavía sin obras vinculadas.';
  return a.name+' ocupa en el Atlas un lugar vinculado principalmente con '+(probs.length?probs.join(', '):'problemas centrales de teoría política')+'. Su corpus incorporado trabaja especialmente '+(cs.length?cs.join(', '):'vocabularios políticos diversos')+(traditions.length?' dentro de '+traditions.slice(0,3).join(', '):'')+'. La ficha distingue el significado situado de sus obras de sus recepciones y reutilizaciones posteriores.';
 }
 function synthAuthor(works){
  const paras=works.slice(0,4).map(w=>{const g=rich(w);const s=g?.summary?.[0]||w.thesis;return '<p><b>'+esc(w.title)+':</b> '+esc(s)+'</p>'});
  return paras.join('')||'<p class="atlas-empty">Sin síntesis disponible.</p>';
 }
 function debatesReception(works){
  const debates=uniq(works.flatMap(w=>rich(w)?.debates||[])).slice(0,12);
  const reception=uniq(works.flatMap(w=>rich(w)?.reception||[])).slice(0,12);
  return '<div class="atlas-two-col"><div><h3>Debates interpretativos</h3>'+list(debates)+'</div><div><h3>Recepciones</h3>'+list(reception)+'</div></div>';
 }
 function authorInfobox(a,works,contexts){
  const eras=uniq(works.map(w=>w.eraId)).sort((x,y)=>eraOrder(x)-eraOrder(y));
  const trads=uniq(works.map(w=>w.traditionId));
  return '<aside class="atlas-infobox"><div class="atlas-infobox-title">'+esc(a.name)+'</div><dl><dt>Tipo</dt><dd>'+esc(a.kind==='person'?'Autor individual':a.kind==='collective'?'Autoría colectiva':'Tradición autoral')+'</dd><dt>Obras en Atlas</dt><dd>'+works.length+'</dd><dt>Épocas</dt><dd>'+eras.map(id=>nav(route('era',id),eraLabel(id),'atlas-inline-link')).join(' · ')+'</dd><dt>Tradiciones</dt><dd>'+trads.slice(0,6).map(id=>nav(route('tradition',id),API().get('tradition',id)?.label||id,'atlas-inline-link')).join(' · ')+'</dd><dt>Contextos</dt><dd>'+contexts.map(c=>nav(route('context',c.id),c.label,'atlas-inline-link')).join(' · ')+'</dd></dl></aside>';
 }

 function renderAuthor(slugId){
  const id='author:'+slugId,a=API().get('author',id);if(!a)return false;
  const works=API().worksByAuthor(id).sort((x,y)=>eraOrder(x.eraId)-eraOrder(y.eraId));
  const legacy=works.map(x=>work(x.id)).filter(Boolean),contexts=contextsForWorks(works.map(w=>w.id));
  const conceptIds=topFrequency(works.flatMap(w=>w.conceptIds||[]),30).map(x=>x[0]),problemIds=topFrequency(works.flatMap(w=>w.problemIds||[]),15).map(x=>x[0]);
  const items=[['sintesis','Síntesis intelectual'],['obras','Obras'],['problemas','Problemas y conceptos'],['contextos','Contextos'],['debates','Debates y recepción'],['red','Red intelectual'],['bibliografia','Bibliografía orientativa']];
  showEntity();title(a.name);
  sec().innerHTML=wikiBar('autor',a.name)+breadcrumb([['Inicio','/inicio'],['Enciclopedia','/autores'],[a.name]])+
  '<div class="atlas-article-layout">'+toc(items)+'<main class="atlas-article">'+
  '<header class="atlas-v4-hero"><div><div class="eyebrow">AUTOR / TRADICIÓN</div><h1>'+esc(a.name)+'</h1><p class="atlas-v4-lead">'+esc(leadFromWorks(a,works))+'</p>'+(a.members?.length?'<div class="atlas-members"><b>Autoría colectiva:</b> '+a.members.map(m=>nav(route('author',m),API().get('author',m)?.name||m,'atlas-inline-link')).join(', ')+'</div>':'')+'</div>'+authorInfobox(a,works,contexts)+'</header>'+
  section('sintesis','LECTURA DE CONJUNTO','Síntesis intelectual',synthAuthor(legacy))+
  section('obras','CORPUS PRIMARIO','Obras incorporadas',workCards(works.map(w=>w.id)))+
  section('problemas','ARQUITECTURA CONCEPTUAL','Problemas y conceptos','<h3>Problemas</h3>'+chips(problemIds,'problem')+'<h3>Conceptos</h3>'+chips(conceptIds,'concept'))+
  section('contextos','HISTORIA','Contextos históricos',contextsHTML(contexts))+
  section('debates','HISTORIA DE LAS INTERPRETACIONES','Debates y recepción',debatesReception(legacy))+
  section('red','RELACIONES','Red intelectual','<p class="atlas-method-note">Las relaciones están tipadas. Recepción, crítica, reformulación, diálogo y antecedente conceptual no son equivalentes a influencia causal.</p>'+relHTML(id))+
  section('bibliografia','PARA INVESTIGAR','Bibliografía orientativa',list(bibliography(legacy)))+
  '</main></div>';
  return true;
 }

 function conceptVariants(concept,works){
  const rows=[];
  works.forEach(nw=>{const w=work(nw.id),g=w&&rich(w);if(!w||!g)return;const target=slug(concept.label);const entry=Object.entries(g.keys||{}).find(([k])=>slug(k)===target);if(entry)rows.push({w,definition:entry[1]})});
  return rows.sort((a,b)=>eraOrder('era:'+a.w.era)-eraOrder('era:'+b.w.era));
 }
 function conceptLead(c,variants,works){
  if(c.definitionStatus==='defined')return c.definition;
  if(variants.length){
   const defs=uniq(variants.map(v=>v.definition));
   return 'El Atlas todavía no fija una definición transhistórica única de “'+c.label+'”. En las obras del corpus aparece con '+defs.length+' formulación'+(defs.length!==1?'es':'')+' situada'+(defs.length!==1?'s':'')+'. La entrada reconstruye esas variaciones antes de proponer equivalencias entre épocas.';
  }
  return 'Concepto presente en '+works.length+' obra'+(works.length!==1?'s':'')+' del corpus. Su definición global permanece abierta para evitar sustituir diferencias históricas por una fórmula genérica.';
 }
 function semanticTimeline(c,variants,works){
  if(variants.length)return '<div class="atlas-semantic-timeline">'+variants.map(v=>'<article><div class="atlas-semantic-date">'+esc(v.w.date)+'</div><div><h3>'+esc(v.w.author)+' · '+esc(v.w.title)+'</h3><p>'+esc(v.definition)+'</p>'+nav(route('work',v.w.id),'Abrir dossier →','atlas-textlink')+'</div></article>').join('')+'</div>';
  return '<div class="atlas-semantic-timeline">'+works.map(nw=>{const w=work(nw.id);return w?'<article><div class="atlas-semantic-date">'+esc(w.date)+'</div><div><h3>'+esc(w.author)+' · '+esc(w.title)+'</h3><p>'+esc(w.thesis)+'</p>'+nav(route('work',w.id),'Abrir dossier →','atlas-textlink')+'</div></article>':''}).join('')+'</div>';
 }
 function conceptEraMap(works){
  const groups={};works.forEach(w=>(groups[w.eraId]??=[]).push(w));
  return '<div class="atlas-era-map">'+Object.entries(groups).sort((a,b)=>eraOrder(a[0])-eraOrder(b[0])).map(([e,ws])=>'<article><h3>'+esc(eraLabel(e))+'</h3><b>'+ws.length+' obra'+(ws.length!==1?'s':'')+'</b><p>'+esc(uniq(ws.map(w=>w.authorLabel)).slice(0,8).join(' · '))+'</p>'+nav(route('era',e),'Ver época →','atlas-textlink')+'</article>').join('')+'</div>';
 }
 function renderConcept(slugId){
  const id='concept:'+slugId,c=API().get('concept',id);if(!c)return false;
  const works=API().worksByConcept(id).sort((a,b)=>eraOrder(a.eraId)-eraOrder(b.eraId)),variants=conceptVariants(c,works);
  const problemIds=uniq(works.flatMap(w=>w.problemIds||[]));
  const authors=uniq(works.map(w=>w.authorId));
  const items=[['definicion','Definición y método'],['variaciones','Variaciones históricas'],['problemas','Problemas relacionados'],['autores','Autores'],['corpus','Corpus'],['periodos','Distribución histórica']];
  showEntity();title(c.label);
  sec().innerHTML=wikiBar('concepto',c.label)+breadcrumb([['Inicio','/inicio'],['Enciclopedia','/conceptos'],[c.label]])+
  '<div class="atlas-article-layout">'+toc(items)+'<main class="atlas-article">'+
  '<header class="atlas-v4-hero concept"><div><div class="eyebrow">HISTORIA CONCEPTUAL</div><h1>'+esc(c.label)+'</h1><p class="atlas-v4-lead">'+esc(conceptLead(c,variants,works))+'</p></div><aside class="atlas-infobox"><div class="atlas-infobox-title">'+esc(c.label)+'</div><dl><dt>Obras</dt><dd>'+works.length+'</dd><dt>Autores</dt><dd>'+authors.length+'</dd><dt>Variantes definidas</dt><dd>'+variants.length+'</dd><dt>Estado global</dt><dd>'+esc(c.definitionStatus==='defined'?'Definición consolidada':'Definición en construcción')+'</dd></dl></aside></header>'+
  section('definicion','CRITERIO EDITORIAL','Definición y método','<p>'+esc(c.definitionStatus==='defined'?c.definition:'La definición global permanece deliberadamente abierta. El Atlas prioriza las definiciones situadas en cada obra y sólo consolida una formulación transversal cuando puede hacerlo sin borrar cambios semánticos.')+'</p><div class="atlas-method-note">Regla del Atlas: similitud nominal no implica identidad conceptual. Esta ficha organiza transformaciones, no una esencia eterna del término.</div>')+
  section('variaciones','GENEALOGÍA SEMÁNTICA','Variaciones históricas',semanticTimeline(c,variants,works))+
  section('problemas','PREGUNTAS','Problemas relacionados',chips(problemIds,'problem'))+
  section('autores','INTERLOCUTORES','Autores y tradiciones',chips(authors,'author',60))+
  section('corpus','TEXTOS','Corpus asociado',workCards(works.map(w=>w.id),false))+
  section('periodos','DISTRIBUCIÓN','Presencia por períodos',conceptEraMap(works))+
  '</main></div>';
  return true;
 }

 const PROBLEM_EDITORIAL={
  'order-government':{intro:'El problema del orden pregunta cómo una pluralidad de actores, jerarquías y conflictos puede convertirse en una forma relativamente estable de gobierno. En el Atlas permite comparar realeza antigua, virtud, prudencia, administración y Estado sin suponer que todos respondan con el mismo concepto.',tensions:['orden como armonía / orden como capacidad coercitiva','virtud del gobernante / diseño institucional','estabilidad / transformación política']},
  'justice':{intro:'La justicia atraviesa casi toda la historia de la teoría política, pero cambia de objeto: orden verdadero, virtud, legalidad, igualdad, distribución, reconocimiento o reparación. La entrada debe reconstruir esas mutaciones antes de comparar respuestas.',tensions:['orden jerárquico / igualdad','virtud / instituciones','distribución / reconocimiento']},
  'law-constitution':{intro:'Ley y constitución plantean qué convierte una regla en jurídicamente vinculante y políticamente legítima, y cómo debe organizarse el poder para que las normas no sean mera expresión de fuerza.',tensions:['naturaleza / voluntad','ley superior / soberanía','constitución formal / orden material']},
  'regime-citizenship':{intro:'Este problema conecta la antigua pregunta por quién gobierna con la moderna cuestión de quién pertenece plenamente al cuerpo político. Régimen y ciudadanía definen simultáneamente distribución de autoridad e inclusión.',tensions:['gobierno de pocos / gobierno de muchos','virtud / procedimiento','inclusión / exclusión']},
  'liberty-domination':{intro:'La libertad puede significar no ser esclavo, no sufrir interferencia, autogobernarse, desarrollar autonomía o no depender de una voluntad arbitraria. La historia del concepto es inseparable de aquello que cada tradición identifica como dominación.',tensions:['no interferencia / autogobierno','independencia / participación','libertad formal / dominación estructural']},
  'sovereignty-state':{intro:'Soberanía y Estado investigan cómo una comunidad produce autoridad última, capacidad administrativa y unidad política. El Atlas distingue el concepto moderno de soberanía de formas premodernas de autoridad y de teorías contemporáneas que descentran al Estado.',tensions:['unidad / pluralidad','decisión / legalidad','soberanía / poderes sociales']},
  'authority-legitimacy':{intro:'La autoridad no se reduce a capacidad de coacción: supone alguna pretensión de obediencia justificada o reconocida. La teoría política pregunta por las razones, creencias e instituciones que vuelven legítimo —o ilegítimo— el mando.',tensions:['fuerza / autoridad','legalidad / legitimidad','obediencia / resistencia']},
  'representation-consent':{intro:'Representación y consentimiento abordan cómo una pluralidad puede actuar como unidad y bajo qué condiciones alguien puede decidir en nombre de otros. El problema recorre contractualismo, constitucionalismo y democracia de masas.',tensions:['presencia / representación','autorización / control','consentimiento inicial / rendición de cuentas']},
  'democracy-equality':{intro:'La democracia combina una afirmación de igualdad política con instituciones concretas que siempre distribuyen de algún modo voz, poder y recursos. El problema consiste en determinar qué desigualdades son compatibles con autogobierno entre iguales.',tensions:['igualdad formal / desigualdad social','participación / representación','mayoría / minorías']},
  'property-economy':{intro:'La teoría política de la propiedad examina cómo control de bienes, trabajo y riqueza afecta independencia, ciudadanía y poder. Desde la propiedad republicana hasta capitalismo y clase, la economía aparece como estructura política.',tensions:['propiedad / igualdad','mercado / gobierno','derechos individuales / poder estructural']},
  'conflict-war':{intro:'Guerra, facción, stasis, antagonismo y violencia muestran que el conflicto no es un accidente externo a la política. Las teorías divergen en si debe suprimirse, moderarse, institucionalizarse o reconocerse como constitutivo.',tensions:['orden / conflicto','adversario / enemigo','violencia / deliberación']},
  'empire-international':{intro:'Imperio y orden internacional desplazan la teoría más allá de la comunidad política individual. Conquista, diplomacia, derecho entre pueblos, colonialismo e interdependencia obligan a preguntar qué límites existen fuera del Estado.',tensions:['soberanía / imperio','guerra / derecho','autonomía / dependencia']},
  'religion-politics':{intro:'La relación entre religión y política no sigue una línea simple de secularización. Ley divina, profecía, Iglesia, tolerancia y libertad religiosa reorganizan históricamente la distribución de autoridad.',tensions:['revelación / razón','autoridad espiritual / temporal','unidad confesional / tolerancia']},
  'revolution-emancipation':{intro:'Revolución y emancipación preguntan cuándo un orden deja de ser reformable y qué sujeto puede instituir uno nuevo. El problema comprende ruptura política, transformación social y los límites de la libertad meramente jurídica.',tensions:['reforma / ruptura','emancipación política / social','institución / revolución permanente']},
  'nation-statebuilding':{intro:'Nación y construcción estatal estudian cómo territorio, población, administración e identidad se vuelven una unidad política. En América Latina el problema revela que independencia jurídica y capacidad estatal no son equivalentes.',tensions:['nación / Estado','centro / periferias','unidad / pluralidad territorial']},
  'community-common-good':{intro:'Comunidad y bien común interrogan qué vínculos y fines compartidos pueden justificar obligaciones recíprocas sin absorber por completo autonomía individual y pluralismo.',tensions:['individuo / comunidad','bien común / pluralismo','solidaridad / coerción']},
  'leadership-organization':{intro:'Liderazgo y organización se ocupan de cómo una voluntad colectiva adquiere dirección, continuidad y capacidad de acción. El problema incluye educación, cuadros, partidos, conducción y burocracia.',tensions:['liderazgo / autonomía','espontaneidad / organización','dirección / burocratización']},
  'hegemony-ideology':{intro:'Hegemonía e ideología explican cómo un orden se sostiene también mediante categorías, instituciones y sentidos compartidos. El poder político aparece así como producción de dirección y subjetividad, no sólo como coerción.',tensions:['coerción / consenso','estructura / discurso','identidad dada / articulación política']},
  'rights-recognition':{intro:'Derechos y reconocimiento estudian qué pretensiones deben ser públicamente protegidas y qué sujetos cuentan como portadores plenos de dignidad, voz y estatus político.',tensions:['universalidad / diferencia','derechos individuales / colectivos','distribución / reconocimiento']},
  'gender-patriarchy':{intro:'La teoría política feminista muestra que la división entre público y privado, ciudadanía y dependencia, contrato y familia estuvo históricamente generizada. El género es una estructura del poder político, no un tema exterior a él.',tensions:['público / privado','igualdad / diferencia','contrato / dependencia']},
  'race-coloniality':{intro:'Raza y colonialidad permiten analizar cómo ciudadanía, trabajo, territorio y conocimiento fueron organizados mediante jerarquías producidas por conquista y colonialismo que pueden persistir después de la independencia formal.',tensions:['universalismo / jerarquía racial','colonialismo jurídico / colonialidad persistente','ciudadanía / subalternización']},
  'bureaucracy-capacity':{intro:'Administración y capacidad estatal preguntan cómo las decisiones políticas se convierten en información, recaudación, coerción, infraestructura y acción sostenida. La capacidad puede ampliar derechos o profundizar dominación.',tensions:['capacidad / control','burocracia / democracia','información / autonomía']},
  'knowledge-education':{intro:'Desde el filósofo-rey hasta educación cívica y poder-saber, la teoría política pregunta quién conoce, cómo se forman capacidades y de qué manera el saber legitima o cuestiona el gobierno.',tensions:['saber experto / igualdad política','educación / adoctrinamiento','verdad / poder']},
  'public-sphere-deliberation':{intro:'Esfera pública y deliberación estudian cómo la palabra, la opinión y el intercambio de razones pueden producir decisiones comunes. También interrogan las exclusiones que definen quién puede aparecer y ser escuchado.',tensions:['deliberación / poder','publicidad / exclusión','consenso / desacuerdo']}
 };
 function problemAxes(id){const x=PROBLEM_EDITORIAL[id];return x?'<div class="atlas-axis-grid">'+x.tensions.map(t=>'<div>'+esc(t)+'</div>').join('')+'</div>':''}
 function groupedAnswers(works){
  const groups={};works.forEach(w=>(groups[w.eraId]??=[]).push(w));
  return '<div class="atlas-answer-groups">'+Object.entries(groups).sort((a,b)=>eraOrder(a[0])-eraOrder(b[0])).map(([era,ws])=>'<section><header><h3>'+esc(eraLabel(era))+'</h3><span>'+ws.length+' obra'+(ws.length!==1?'s':'')+'</span></header>'+ws.map(nw=>{const w=work(nw.id);return w?'<article><b>'+esc(w.author)+'</b><h4>'+esc(w.title)+'</h4><p>'+esc(w.thesis)+'</p><div class="atlas-mini-chips">'+(nw.conceptIds||[]).slice(0,6).map(cid=>nav(route('concept',cid),API().get('concept',cid)?.label||cid)).join('')+'</div>'+nav(route('work',w.id),'Abrir dossier →','atlas-textlink')+'</article>':''}).join('')+'</section>').join('')+'</div>';
 }
 function renderProblem(id){
  const p=API().get('problem',id);if(!p)return false;
  const works=API().worksByProblem(id).sort((a,b)=>eraOrder(a.eraId)-eraOrder(b.eraId)),conceptIds=topFrequency(works.flatMap(w=>w.conceptIds||[]),36).map(x=>x[0]);
  const authors=uniq(works.map(w=>w.authorId)),eras=uniq(works.map(w=>w.eraId)),editorial=PROBLEM_EDITORIAL[id];
  const items=[['planteo','Planteo'],['tensiones','Tensiones'],['respuestas','Respuestas históricas'],['conceptos','Conceptos'],['autores','Autores'],['comparacion','Cómo comparar']];
  showEntity();title(p.label);
  sec().innerHTML=wikiBar('problema',p.label)+breadcrumb([['Inicio','/inicio'],['Enciclopedia','/problemas'],[p.label]])+
  '<div class="atlas-article-layout">'+toc(items)+'<main class="atlas-article">'+
  '<header class="atlas-v4-hero problem"><div><div class="eyebrow">PROBLEMA DE TEORÍA POLÍTICA</div><h1>'+esc(p.label)+'</h1><p class="atlas-v4-question">'+esc(p.question)+'</p><p class="atlas-v4-lead">'+esc(editorial?.intro||'Problema transversal utilizado por el Atlas para comparar respuestas históricas sin borrar diferencias semánticas.')+'</p></div><aside class="atlas-infobox"><div class="atlas-infobox-title">'+esc(p.label)+'</div><dl><dt>Obras</dt><dd>'+works.length+'</dd><dt>Autores</dt><dd>'+authors.length+'</dd><dt>Épocas</dt><dd>'+eras.length+'</dd><dt>Conceptos</dt><dd>'+conceptIds.length+'</dd></dl></aside></header>'+
  section('planteo','PREGUNTA RECTORA','Planteo del problema','<p>'+esc(editorial?.intro||p.question)+'</p><div class="atlas-method-note">El problema es una categoría comparativa del Atlas. No presupone que las obras compartan el mismo lenguaje, objeto o respuesta.</div>')+
  section('tensiones','EJES ANALÍTICOS','Tensiones internas',problemAxes(id))+
  section('respuestas','HISTORIA COMPARADA','Respuestas históricas',groupedAnswers(works))+
  section('conceptos','VOCABULARIO','Conceptos relacionados',chips(conceptIds,'concept'))+
  section('autores','INTERLOCUTORES','Autores y tradiciones',chips(authors,'author',80))+
  section('comparacion','MÉTODO','Cómo usar esta entrada','<ol class="atlas-compare-steps"><li>Reconstruir primero el vocabulario propio de cada texto.</li><li>Distinguir respuesta situada, concepto de alcance medio y pretensión filosófica general.</li><li>Comparar mecanismos argumentales, no sólo palabras iguales.</li><li>Separar antecedentes, recepciones documentadas y analogías analíticas.</li><li>Volver al contexto histórico cuando una semejanza parezca demasiado inmediata.</li></ol>')+
  '</main></div>';
  return true;
 }

 function indexData(kind){
  if(kind==='authors')return Object.values(DB()?.authors||{}).map(a=>({id:a.id,label:a.name,meta:(a.workIds||[]).length+' obra'+((a.workIds||[]).length!==1?'s':''),route:route('author',a.id),search:a.name}));
  if(kind==='problems')return Object.values(DB()?.problems||{}).map(p=>({id:p.id,label:p.label,meta:(p.workIds||[]).length+' obras · '+p.question,route:route('problem',p.id),search:p.label+' '+p.question}));
  return Object.values(DB()?.concepts||{}).map(c=>({id:c.id,label:c.label,meta:(c.workIds||[]).length+' obras · '+(c.definitionStatus==='defined'?'definición global':'definición en construcción'),route:route('concept',c.id),search:c.label+' '+c.definition,status:c.definitionStatus}));
 }
 function renderIndex(kind='concepts'){
  const view=document.getElementById('concepts');if(!view)return false;
  const labels={concepts:['Conceptos','Historia conceptual y vocabularios del corpus'],authors:['Autores','Autores, autorías colectivas y tradiciones textuales'],problems:['Problemas','Preguntas transversales para comparar la historia de la teoría política']};
  const [name,sub]=labels[kind]||labels.concepts,items=indexData(kind).sort((a,b)=>a.label.localeCompare(b.label,'es'));
  view.innerHTML='<div class="section-head"><div><div class="eyebrow">ENCICLOPEDIA</div><h1>'+name+'</h1><p>'+sub+'.</p></div></div>'+
  '<div class="atlas-index-tabs">'+nav('/autores','Autores',kind==='authors'?'on':'')+nav('/conceptos','Conceptos',kind==='concepts'?'on':'')+nav('/problemas','Problemas',kind==='problems'?'on':'')+'</div>'+
  '<div class="atlas-index-toolbar panel"><input id="atlasIndexSearch" placeholder="Buscar en '+name.toLowerCase()+'…"><span id="atlasIndexCount">'+items.length+' entradas</span></div>'+
  '<div id="atlasIndexGrid" class="atlas-index-grid">'+indexCards(items)+'</div>';
  const input=document.getElementById('atlasIndexSearch'),grid=document.getElementById('atlasIndexGrid'),count=document.getElementById('atlasIndexCount');
  input?.addEventListener('input',()=>{const q=slug(input.value);const f=items.filter(x=>slug(x.search).includes(q));grid.innerHTML=indexCards(f);count.textContent=f.length+' entradas'});
  return true;
 }
 function indexCards(items){return items.map(x=>'<button class="atlas-index-card '+(x.status==='pending'?'pending':'')+'" data-route="'+x.route+'"><h3>'+esc(x.label)+'</h3><p>'+esc(x.meta)+'</p><span>Abrir artículo →</span></button>').join('')}

 window.AtlasEntities={renderAuthor,renderConcept,renderProblem,renderIndex,problemEditorial:PROBLEM_EDITORIAL};
})();