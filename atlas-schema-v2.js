// Atlas Schema V2 — capa normalizada de conocimiento.
// Convive temporalmente con WORKS/CONCEPTS/RELATIONS para no romper la aplicación existente.
(function(){
 const VERSION='2.0.0';
 const slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/ß/g,'ss').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const uniq=a=>[...new Set((a||[]).filter(Boolean))];
 const obj=a=>Object.fromEntries((a||[]).map(x=>[x.id,x]));

 const RELATION_TYPES={
  authored_by:{label:'autoría',category:'bibliographic',directional:true},
  member_of:{label:'miembro de autoría colectiva',category:'bibliographic',directional:true},
  uses_concept:{label:'trabaja el concepto',category:'semantic',directional:true},
  addresses_problem:{label:'aborda el problema',category:'semantic',directional:true},
  belongs_to_tradition:{label:'pertenece a la tradición',category:'classification',directional:true},
  situated_in_era:{label:'se sitúa en la época',category:'context',directional:true},
  situated_in_context:{label:'se sitúa en el contexto',category:'context',directional:true},
  context_contains_entity:{label:'incluye entidad política',category:'context',directional:true},
  reception:{label:'recepción',category:'intellectual',directional:true},
  critique:{label:'crítica / controversia',category:'intellectual',directional:true},
  reinterpretation:{label:'relectura / reformulación',category:'intellectual',directional:true},
  documented_influence:{label:'influencia documentada',category:'intellectual',directional:true},
  conceptual_predecessor:{label:'antecedente conceptual',category:'comparative',directional:true},
  shared_tradition:{label:'tradición compartida',category:'comparative',directional:false},
  co_development:{label:'desarrollo conjunto',category:'intellectual',directional:false},
  critical_reception:{label:'recepción crítica',category:'intellectual',directional:true},
  intellectual_dialogue:{label:'diálogo intelectual',category:'intellectual',directional:false},
  legacy_intellectual_relation:{label:'relación intelectual por clasificar',category:'editorial',directional:true}
 };

 const PROBLEMS=[
  ['order-government','Orden y buen gobierno','¿Qué hace posible un orden político estable y un gobierno correcto?',['orden','realeza','gobierno','prudencia','virtud','autoridad']],
  ['justice','Justicia','¿Qué vuelve justo o injusto un orden, una ley o una distribución?',['justicia','maat','bien común']],
  ['law-constitution','Ley y constitución','¿Qué funda la ley y cómo deben organizarse las instituciones?',['ley','constitución','ley natural','dharma']],
  ['regime-citizenship','Régimen y ciudadanía','¿Quién gobierna, quién participa y qué régimen permite una vida política adecuada?',['régimen','ciudadanía','polis','politeia','república']],
  ['liberty-domination','Libertad y dominación','¿Qué significa ser libre y frente a qué formas de dependencia o dominación?',['libertad','dominación','libertas','no-dominación']],
  ['sovereignty-state','Soberanía y Estado','¿Dónde reside la autoridad última y cómo se constituye la unidad política?',['soberanía','Estado','majestad']],
  ['authority-legitimacy','Autoridad, legitimidad y obediencia','¿Por qué obedecer y cuándo pierde legitimidad una autoridad?',['autoridad','legitimidad','obediencia','obligación política','mandato']],
  ['representation-consent','Representación y consentimiento','¿Cómo puede una persona o institución actuar legítimamente en nombre de otros?',['representación','consentimiento','contrato']],
  ['democracy-equality','Democracia e igualdad','¿Qué exige el autogobierno de iguales y qué desigualdades lo contradicen?',['democracia','igualdad','pueblo']],
  ['property-economy','Propiedad y economía política','¿Cómo estructuran propiedad, trabajo y economía las relaciones políticas?',['propiedad','trabajo','comercio','capitalismo','clase']],
  ['conflict-war','Conflicto, guerra y violencia','¿Cómo debe entenderse y organizarse el conflicto político y la violencia?',['conflicto','guerra','violencia','stasis']],
  ['empire-international','Imperio y orden internacional','¿Cómo se gobiernan relaciones entre comunidades políticas y órdenes imperiales?',['imperio','diplomacia','guerra','orden internacional']],
  ['religion-politics','Religión y política','¿Cómo se relacionan autoridad política, religión, profecía y secularización?',['secularización','profecía','religión','ley divina']],
  ['revolution-emancipation','Revolución y emancipación','¿Cuándo y cómo puede transformarse radicalmente un orden político y social?',['revolución','emancipación']],
  ['nation-statebuilding','Nación y construcción estatal','¿Cómo se constituyen nación, territorio y capacidades estatales?',['nación','Estado','federalismo','desarrollo']],
  ['community-common-good','Comunidad y bien común','¿Cómo se articulan individuo, comunidad y fines compartidos?',['comunidad','bien común','solidaridad']],
  ['leadership-organization','Liderazgo y organización','¿Cómo se construye capacidad colectiva de dirección, estrategia y organización?',['liderazgo','organización','militancia','conducción']],
  ['hegemony-ideology','Hegemonía e ideología','¿Cómo se construyen dirección política, sentido común e identidades colectivas?',['hegemonía','ideología','pueblo','populismo']],
  ['rights-recognition','Derechos y reconocimiento','¿Qué pretensiones deben ser reconocidas y protegidas políticamente?',['derechos','reconocimiento','ciudadanía']],
  ['gender-patriarchy','Género y patriarcado','¿Cómo estructuran el género y la división sexual ciudadanía, autoridad y dependencia?',['género','contrato sexual']],
  ['race-coloniality','Raza y colonialidad','¿Cómo organizan raza, colonialidad y colonialismo jerarquías políticas persistentes?',['raza','colonialidad','colonialismo']],
  ['bureaucracy-capacity','Administración y capacidad estatal','¿Cómo se producen capacidad, información, burocracia y control administrativo?',['administración','burocracia','Estado','fiscalidad']],
  ['knowledge-education','Conocimiento y educación política','¿Qué relación existe entre saber, formación, verdad y gobierno?',['educación','conocimiento','filósofo-rey','rito']],
  ['public-sphere-deliberation','Esfera pública y deliberación','¿Cómo se forman opinión, razones públicas y decisiones colectivas?',['esfera pública','deliberación','palabra']]
 ].map(([id,label,question,concepts])=>({id,label,question,concepts}));

 const CURATED_CONCEPT_WORKS={
  'concept:legitimidad':['mencius','leviathan','locke','rousseau','weber','habermas','dussel','odonnell'],
  'concept:secularizacion':['citygod','marsilius','spinoza','locke'],
  'concept:tolerancia':['spinoza','locke'],
  'concept:obligacion-politica':['leviathan','locke','rousseau']
 };

 const AUTHOR_SPECIAL={
  'Tradición mesopotámica':{kind:'tradition'},
  'Tradición egipcia':{kind:'tradition'},
  'Tradición dharmaśāstra':{kind:'tradition'},
  'Mozi / tradición mohista':{kind:'collective',members:['Mozi','Tradición mohista']},
  'Laozi / tradición daoísta':{kind:'collective',members:['Laozi','Tradición daoísta']},
  'Shang Yang / escuela legalista':{kind:'collective',members:['Shang Yang','Escuela legalista']},
  'Kauṭilya / tradición':{kind:'collective',members:['Kauṭilya','Tradición del Arthaśāstra']},
  'Hamilton, Madison y Jay':{kind:'collective',members:['Alexander Hamilton','James Madison','John Jay']},
  'Karl Marx y Friedrich Engels':{kind:'collective',members:['Karl Marx','Friedrich Engels']},
  'Fernando H. Cardoso y Enzo Faletto':{kind:'collective',members:['Fernando Henrique Cardoso','Enzo Faletto']},
  'Silvia Sigal y Eliseo Verón':{kind:'collective',members:['Silvia Sigal','Eliseo Verón']}
 };

 const CURATED={
  'Confucio→Mencio':'reception','Confucio→Xunzi':'reception','Xunzi→Han Fei':'reception',
  'Mozi / tradición mohista→Han Fei':'critique','Heródoto→Tucídides':'conceptual_predecessor',
  'Platón→Aristóteles':'critique','Platón→Jenofonte':'shared_tradition','Aristóteles→Polibio':'reception',
  'Polibio→Cicerón':'reception','Cicerón→Agustín de Hipona':'reception','Aristóteles→Al-Fārābī':'reception',
  'Platón→Averroes':'reception','Aristóteles→Tomás de Aquino':'reception','Tomás de Aquino→Marsilio de Padua':'critical_reception',
  'Cicerón→Nicolás Maquiavelo':'reception','Polibio→Nicolás Maquiavelo':'reception',
  'Nicolás Maquiavelo→James Harrington':'reception','Nicolás Maquiavelo→Jean-Jacques Rousseau':'reception',
  'Jean Bodin→Thomas Hobbes':'conceptual_predecessor','Hugo Grocio→John Locke':'reception',
  'Thomas Hobbes→Baruch Spinoza':'critical_reception','Thomas Hobbes→John Locke':'critical_reception',
  'John Locke→Jean-Jacques Rousseau':'critical_reception','Montesquieu→Hamilton, Madison y Jay':'documented_influence',
  'Jean-Jacques Rousseau→G. W. F. Hegel':'reception','Edmund Burke→Alexis de Tocqueville':'conceptual_predecessor',
  'Benjamin Constant→Alexis de Tocqueville':'reception','G. W. F. Hegel→Karl Marx':'critique',
  'Karl Marx→Vladimir I. Lenin':'reinterpretation','Karl Marx→Rosa Luxemburgo':'reinterpretation','Karl Marx→Antonio Gramsci':'reinterpretation',
  'Friedrich Nietzsche→Michel Foucault':'reception','Max Weber→Carl Schmitt':'reception','Carl Schmitt→Hannah Arendt':'critical_reception',
  'John Stuart Mill→Isaiah Berlin':'reception','John Stuart Mill→John Rawls':'conceptual_predecessor',
  'John Rawls→Robert Nozick':'critique','John Rawls→Philip Pettit':'conceptual_predecessor',
  'Hannah Arendt→Jürgen Habermas':'critical_reception','Michel Foucault→Judith Butler':'reinterpretation',
  'Michel Foucault→Jacques Rancière':'intellectual_dialogue','Antonio Gramsci→Ernesto Laclau':'reinterpretation',
  'Antonio Gramsci→Chantal Mouffe':'reinterpretation','Frantz Fanon→Achille Mbembe':'reinterpretation',
  'Carole Pateman→Iris Marion Young':'reception','Carole Pateman→Charles W. Mills':'critical_reception',
  'Simón Bolívar→José Martí':'reception','José Martí→José Enrique Rodó':'reception','Karl Marx→José Carlos Mariátegui':'reinterpretation',
  'José Carlos Mariátegui→José Aricó':'reception','José Carlos Mariátegui→René Zavaleta Mercado':'reception',
  'René Zavaleta Mercado→Álvaro García Linera':'reception','Raúl Prebisch→Fernando H. Cardoso y Enzo Faletto':'critical_reception',
  'José Carlos Mariátegui→Aníbal Quijano':'reception','Aníbal Quijano→Enrique Dussel':'intellectual_dialogue',
  'Ernesto Laclau→Chantal Mouffe':'co_development',
  'Esteban Echeverría→Juan Bautista Alberdi':'shared_tradition','Esteban Echeverría→Domingo F. Sarmiento':'shared_tradition',
  'Manuel Ugarte→Raúl Scalabrini Ortiz':'reception','Raúl Scalabrini Ortiz→Arturo Jauretche':'reception',
  'Raúl Scalabrini Ortiz→Juan José Hernández Arregui':'reception','Juan Domingo Perón→John William Cooke':'reception',
  'Juan Domingo Perón→Silvia Sigal y Eliseo Verón':'critical_reception','Juan Domingo Perón→León Rozitchner':'critical_reception',
  'Juan Domingo Perón→Damián Selci':'critical_reception','Antonio Gramsci→Juan Carlos Portantiero':'reinterpretation',
  'Juan Bautista Alberdi→Natalio R. Botana':'critical_reception','Domingo F. Sarmiento→Natalio R. Botana':'critical_reception',
  'Ernesto Laclau→Damián Selci':'critical_reception','Nicolás Maquiavelo→Eduardo Rinesi':'reinterpretation','Thomas Hobbes→Eduardo Rinesi':'reinterpretation',
  'Juan B. Justo→Gino Germani':'conceptual_predecessor','Juan Domingo Perón→Arturo Enrique Sampay':'intellectual_dialogue',
  'Juan Domingo Perón→Arturo Jauretche':'shared_tradition','Juan Carlos Portantiero→José Nun':'intellectual_dialogue',
  'Carlos Santiago Nino→José Nun':'shared_tradition'
 };

 function authorEntity(name){
  const spec=AUTHOR_SPECIAL[name]||{};
  const id='author:'+slug(name);
  const inferredKind=spec.kind||(/^(Tradición|Escuela)\b/i.test(name)?'tradition':'person');
  return {id,name,slug:slug(name),kind:inferredKind,members:(spec.members||[]).map(n=>'author:'+slug(n)),workIds:[]};
 }
 function inferProblems(w){
  const c=new Set((w.concepts||[]).map(x=>String(x).toLowerCase()));
  const txt=(w.problem+' '+w.thesis+' '+w.context).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const scored=PROBLEMS.map(p=>{
   let score=0;
   p.concepts.forEach(k=>{const n=k.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); if(c.has(k.toLowerCase())||txt.includes(n))score+=2;});
   const words=(p.label+' '+p.question).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().split(/\W+/).filter(x=>x.length>4);
   words.forEach(x=>{if(txt.includes(x))score+=0.25});
   return [p.id,score];
  }).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
  return (scored.length?scored.slice(0,4).map(x=>x[0]):['order-government']);
 }
 function relationId(parts){return 'rel:'+slug(parts.join('-'))}
 function addRel(arr,seen,r){
  const key=[r.sourceType,r.sourceId,r.predicate,r.targetType,r.targetId].join('|');
  if(seen.has(key))return; seen.add(key); arr.push({id:relationId([key]),...r});
 }

 function build(){
  const works=typeof WORKS!=='undefined'?WORKS:[];
  const conceptsArr=typeof CONCEPTS!=='undefined'?CONCEPTS:[];
  const erasArr=typeof ERAS!=='undefined'?ERAS:[];
  const legacy=typeof RELATIONS!=='undefined'?RELATIONS:[];
  const contextsArr=window.WORLD_CONTEXTS||[];
  const sourcesArr=typeof SOURCES!=='undefined'?SOURCES:[];

  const authors={};
  works.forEach(w=>{const a=authorEntity(w.author);authors[a.id]=authors[a.id]||a;authors[a.id].workIds.push(w.id);});
  Object.entries(AUTHOR_SPECIAL).forEach(([name,s])=>(s.members||[]).forEach(m=>{const a=authorEntity(m);authors[a.id]=authors[a.id]||a;}));

  const concepts={};
  conceptsArr.forEach(c=>{const label=Array.isArray(c)?c[0]:c.label,definition=Array.isArray(c)?c[1]:c.definition;const id='concept:'+slug(label);concepts[id]={id,label,slug:slug(label),definition,definitionStatus:'defined',workIds:[]};});

  const traditions={};
  works.forEach(w=>{const id='tradition:'+slug(w.trad);traditions[id]=traditions[id]||{id,label:w.trad,slug:slug(w.trad),workIds:[]};traditions[id].workIds.push(w.id);});

  const eras={};
  erasArr.forEach(e=>eras['era:'+e[0]]={id:'era:'+e[0],key:e[0],label:e[1],color:e[2],workIds:[]});

  const problems=obj(PROBLEMS.map(p=>({...p,workIds:[]})));
  const normalizedWorks={};
  works.forEach(w=>{
   const authorId='author:'+slug(w.author),traditionId='tradition:'+slug(w.trad),eraId='era:'+w.era;
   const conceptIds=(w.concepts||[]).map(label=>{const id='concept:'+slug(label);if(!concepts[id])concepts[id]={id,label,slug:slug(label),definition:'Definición pendiente de normalización editorial.',definitionStatus:'pending',workIds:[]};concepts[id].workIds.push(w.id);return id;});
   const problemIds=inferProblems(w);problemIds.forEach(id=>{if(problems[id])problems[id].workIds.push(w.id)});
   if(eras[eraId])eras[eraId].workIds.push(w.id);
   normalizedWorks[w.id]={
    id:w.id,title:w.title,authorId,authorLabel:w.author,dateLabel:w.date,eraId,traditionId,conceptIds,problemIds,
    problemText:w.problem,thesis:w.thesis,contextText:w.context,reader:w.reader||'',readerEs:w.readerEs||w.readerES||'',readerEn:w.readerEn||w.readerEN||'',
    source:'legacy-WORKS',schemaVersion:VERSION
   };
  });

  Object.entries(CURATED_CONCEPT_WORKS).forEach(([cid,wids])=>{
   if(!concepts[cid])return;
   wids.forEach(wid=>{const w=normalizedWorks[wid];if(!w)return;if(!w.conceptIds.includes(cid))w.conceptIds.push(cid);if(!concepts[cid].workIds.includes(wid))concepts[cid].workIds.push(wid)});
  });

  const politicalEntities={},contexts={};
  contextsArr.forEach(c=>{
   const id='context:'+c.id;
   const entityIds=(c.entities||[]).map((e,i)=>{const eid='political-entity:'+slug(c.id+'-'+e.name);politicalEntities[eid]={id:eid,name:e.name,contextId:id,dates:e.dates||'',type:e.type||'',capital:e.capital||e.center||'',lon:e.lon,lat:e.lat,rx:e.rx,ry:e.ry,note:e.note||''};return eid;});
   contexts[id]={id,key:c.id,label:c.label,dates:c.dates,summary:c.summary,order:c.order,society:c.society,legitimacy:c.legitimacy,conflicts:c.conflicts,question:c.question,workIds:[...(c.works||[])],politicalEntityIds:entityIds,centers:[...(c.centers||[])],events:[...(c.events||[])]};
  });

  const researchSources={};
  sourcesArr.forEach((s,i)=>{const name=s.name||s.label||s[0]||('Fuente '+(i+1));const id='research-source:'+slug(name);researchSources[id]={id,name,url:s.url||s[1]||'',kind:s.kind||s.type||'',raw:s};});

  const relations=[],seen=new Set();
  Object.values(normalizedWorks).forEach(w=>{
   addRel(relations,seen,{sourceType:'work',sourceId:w.id,predicate:'authored_by',targetType:'author',targetId:w.authorId,status:'normalized'});
   w.conceptIds.forEach(id=>addRel(relations,seen,{sourceType:'work',sourceId:w.id,predicate:'uses_concept',targetType:'concept',targetId:id,status:'normalized'}));
   w.problemIds.forEach(id=>addRel(relations,seen,{sourceType:'work',sourceId:w.id,predicate:'addresses_problem',targetType:'problem',targetId:id,status:'rule_assigned'}));
   addRel(relations,seen,{sourceType:'work',sourceId:w.id,predicate:'belongs_to_tradition',targetType:'tradition',targetId:w.traditionId,status:'normalized'});
   addRel(relations,seen,{sourceType:'work',sourceId:w.id,predicate:'situated_in_era',targetType:'era',targetId:w.eraId,status:'normalized'});
  });
  Object.entries(AUTHOR_SPECIAL).forEach(([name,s])=>(s.members||[]).forEach(m=>addRel(relations,seen,{sourceType:'author',sourceId:'author:'+slug(m),predicate:'member_of',targetType:'author',targetId:'author:'+slug(name),status:'curated'})));
  Object.values(contexts).forEach(c=>{
   c.workIds.forEach(wid=>{if(normalizedWorks[wid])addRel(relations,seen,{sourceType:'work',sourceId:wid,predicate:'situated_in_context',targetType:'context',targetId:c.id,status:'curated'})});
   c.politicalEntityIds.forEach(eid=>addRel(relations,seen,{sourceType:'context',sourceId:c.id,predicate:'context_contains_entity',targetType:'politicalEntity',targetId:eid,status:'curated'}));
  });
  legacy.forEach(([a,b])=>{
   const source='author:'+slug(a),target='author:'+slug(b);
   if(!authors[source])authors[source]=authorEntity(a);
   if(!authors[target])authors[target]=authorEntity(b);
   const key=a+'→'+b,predicate=CURATED[key]||'legacy_intellectual_relation';
   addRel(relations,seen,{sourceType:'author',sourceId:source,predicate,targetType:'author',targetId:target,status:CURATED[key]?'curated':'needs_review',legacyPair:[a,b],evidence:CURATED[key]?'editorial_classification_v2':'legacy_relation_only'});
  });

  const genealogies={};
  if(typeof CLASSIC_GENEALOGIES!=='undefined')CLASSIC_GENEALOGIES.forEach(g=>genealogies[g.id]={id:g.id,label:g.name,description:g.desc,color:g.color,workIds:[...(g.works||[])]});

  const db={
   meta:{schemaVersion:VERSION,builtAt:new Date().toISOString(),compatibility:'WORKS/CONCEPTS/RELATIONS remain active during migration'},
   works:normalizedWorks,authors,concepts,problems,traditions,eras,contexts,politicalEntities,researchSources,genealogies,
   relationTypes:RELATION_TYPES,relations
  };
  const API={
   db,
   get(type,id){const aliases={work:'works',author:'authors',concept:'concepts',problem:'problems',tradition:'traditions',era:'eras',context:'contexts',politicalEntity:'politicalEntities',researchSource:'researchSources',genealogy:'genealogies'};return db[aliases[type]||type]?.[id]||null},
   list(type){return Object.values(db[type]||{})},
   relationsFor(type,id,predicate){return db.relations.filter(r=>(r.sourceType===type&&r.sourceId===id||r.targetType===type&&r.targetId===id)&&(!predicate||r.predicate===predicate))},
   worksByAuthor(id){
    const collectiveIds=Object.values(db.authors).filter(a=>(a.members||[]).includes(id)).map(a=>a.id);
    return Object.values(db.works).filter(w=>w.authorId===id||collectiveIds.includes(w.authorId));
   },
   worksByConcept(id){return Object.values(db.works).filter(w=>w.conceptIds.includes(id))},
   worksByProblem(id){return Object.values(db.works).filter(w=>w.problemIds.includes(id))},
   search(q){const n=slug(q);return {works:Object.values(db.works).filter(w=>slug(w.title+' '+w.authorLabel+' '+w.problemText+' '+w.thesis).includes(n)),authors:Object.values(db.authors).filter(a=>slug(a.name).includes(n)),concepts:Object.values(db.concepts).filter(c=>slug(c.label+' '+c.definition).includes(n)),problems:Object.values(db.problems).filter(p=>slug(p.label+' '+p.question).includes(n))};},
   slug
  };
  window.ATLAS_DB=db;window.AtlasDB=API;window.ATLAS_SCHEMA_VERSION=VERSION;
  return db;
 }
 window.buildAtlasDB=build;
 build();
})();