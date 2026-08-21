/* Raíces · antesala Fase 4: banco de palabras + gramática + vocabulario */
(function(){
  if(!window.QA1) return;
  state.storyDone ??= {};
  state.vocabFilter ??= {unit:"all",status:"all",query:""};

  const DAY=86400000;
  function memStrength(id){
    const r=state.adaptive?.cards?.[id];
    if(!r) return null;
    if(!r.last) return r.introduced?35:null;
    const elapsed=Math.max(0,(Date.now()-r.last)/DAY), stab=Math.max(.25,r.stability||.55);
    return Math.round(Math.max(2,Math.min(100,100*Math.exp(-elapsed/stab))));
  }
  function vocabRows(){
    return QA.units.flatMap((u,ui)=>u.vocab.map((v,wi)=>({ui,wi,word:v[0],meaning:v[1],icon:v[2]||"🧠",note:v[3]||"",id:`v:${ui}:${wi}`,unit:u.title})));
  }
  function introduced(v){
    const u=QA.units[v.ui],mid=Math.ceil(u.vocab.length/2),micro=v.wi<mid?"vocab1":"vocab2";
    return !!state.qdone[qkey(v.ui,micro)]||!!state.unitPass[v.ui]||!!state.adaptive?.cards?.[v.id]?.seen;
  }

  function cleanModel(s){return String(s||"").replace(/\s+/g," ").trim()}
  function builderEligible(p,pi){
    const m=cleanModel(p.model), n=m.split(" ").length;
    if(pi%4===3) return false;
    if(n<2||n>11) return false;
    if(/[\/;]/.test(m)) return false;
    if(/sin mirar|formá|tres acciones|números 1|decí los números/i.test(p.prompt)) return false;
    return true;
  }
  function normalizeSentence(s){return String(s||"").toLocaleLowerCase("es").replace(/[¡!¿?,.;:]/g,"").replace(/\s+/g," ").trim()}
  function distractors(ui,modelTokens){
    const used=new Set(modelTokens.map(x=>normalizeSentence(x)));
    return shuffle(QA.units[ui].vocab.map(v=>v[0])).filter(w=>!used.has(normalizeSentence(w))).slice(0,Math.min(2,Math.max(0,7-modelTokens.length)));
  }
  function wordBuilderHTML(ui,p){
    const model=cleanModel(p.model), base=model.split(" "), bank=shuffle([...base,...distractors(ui,base)]).map((text,i)=>({text,id:`w${i}`}));
    return `<section class="production-card sentence-builder" data-model="${esc(model)}"><div class="prompt">${esc(p.prompt)}</div><div class="builder-help">Tocá las palabras en el orden correcto.</div><div id="sentenceAnswer" class="sentence-answer"><span class="answer-placeholder">Tu oración aparece acá…</span></div><div id="wordBank" class="word-bank">${bank.map(w=>`<button class="word-chip" data-chip="${w.id}" data-text="${esc(w.text)}">${esc(w.text)}</button>`).join("")}</div><div id="buildFeedback"></div><button id="checkBuild" class="primary full" disabled>Comprobar</button></section>`;
  }
  function setupBuilder(ui,p,onDone){
    const answer=document.querySelector("#sentenceAnswer"),bank=document.querySelector("#wordBank"),check=document.querySelector("#checkBuild"),fb=document.querySelector("#buildFeedback");
    const chosen=[];
    function paintAnswer(){
      answer.innerHTML=chosen.length?chosen.map(x=>`<button class="answer-chip" data-return="${x.id}">${esc(x.text)}</button>`).join(""):'<span class="answer-placeholder">Tu oración aparece acá…</span>';
      check.disabled=!chosen.length;
      answer.querySelectorAll("[data-return]").forEach(b=>b.onclick=()=>{const idx=chosen.findIndex(x=>x.id===b.dataset.return);if(idx<0)return;const [x]=chosen.splice(idx,1),source=bank.querySelector(`[data-chip="${x.id}"]`);if(source)source.disabled=false;paintAnswer()});
    }
    bank.querySelectorAll("[data-chip]").forEach(b=>b.onclick=()=>{if(b.disabled)return;chosen.push({id:b.dataset.chip,text:b.dataset.text});b.disabled=true;paintAnswer()});
    check.onclick=()=>{
      const attempt=chosen.map(x=>x.text).join(" "), model=cleanModel(p.model), ok=normalizeSentence(attempt)===normalizeSentence(model);
      fb.className=`feedback ${ok?"ok":"bad"}`;fb.innerHTML=ok?"✓ Muy bien. La oración está bien construida.":`✕ Modelo esperado: <b>${esc(model)}</b>`;
      check.textContent=ok?"Continuar":"Entendido · continuar";check.onclick=()=>onDone(ok);if(!ok){state.hearts=Math.max(0,state.hearts-1);save()}
    };
  }

  openProduction=function(ui){
    const u=QA.units[ui];let pi=0;
    modal.classList.remove("hidden");
    function advance(){if(pi<u.production.length-1){pi++;paint()}else{markDone(ui,"produce",12);closeModal();renderLearn()}}
    function paint(){
      const p=u.production[pi],builder=builderEligible(p,pi);
      modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><div class="progress"><i style="width:${pi/u.production.length*100}%"></i></div><b>${pi+1}/${u.production.length}</b></div><div class="kicker" style="color:var(--brand)">Producción · ${builder?"ordenar palabras":"respuesta libre"}</div>${builder?wordBuilderHTML(ui,p):`<section class="production-card"><div class="prompt">${esc(p.prompt)}</div><textarea id="attempt" class="text-input" placeholder="Escribí tu respuesta sin mirar el modelo…"></textarea><button id="reveal" class="secondary full">Comparar con un modelo</button><div id="modelWrap"></div><button id="nextP" class="primary full" disabled>${pi===u.production.length-1?"Completar":"Siguiente"}</button></section>`}</div>`;
      document.querySelector("#closeM").onclick=closeModal;
      if(builder){setupBuilder(ui,p,advance);return}
      const reveal=document.querySelector("#reveal"),modelWrap=document.querySelector("#modelWrap"),next=document.querySelector("#nextP"),attempt=document.querySelector("#attempt");
      reveal.onclick=()=>{modelWrap.innerHTML=`<div class="model"><b>Modelo posible:</b> ${esc(p.model)}</div>`;next.disabled=!attempt.value.trim()};attempt.oninput=()=>{if(modelWrap.innerHTML)next.disabled=!attempt.value.trim()};next.onclick=advance;
    }
    paint();
  };

  const GUIDE=[
    ["🧱","La palabra se construye","El quechua combina una raíz con sufijos productivos. En vez de memorizar palabras largas como bloques, aprendé a segmentarlas: wasi-y-wan = casa + mi + con."],
    ["📍","Los casos van pegados","-pi = en; -man = hacia; -manta = desde; -wan = con; -ta = objeto directo. La misma pieza puede reutilizarse con muchas raíces."],
    ["👤","La persona suele estar en el verbo","Con muchos verbos de A1: -ni = yo, -nki = vos/tú, -n = él/ella. Por eso el pronombre puede omitirse cuando el contexto es claro."],
    ["🚫","La negación abraza la frase","El patrón inicial es mana(m)…-chu: Manam t'antata mikhunichu = no como pan."],
    ["🧭","El orden ayuda, los sufijos informan","El orden frecuente es sujeto–objeto–verbo, pero las marcas de caso y persona aportan información que en español depende más del orden y las preposiciones."],
    ["💬","-qa y -mi/-m organizan el discurso","-qa marca con frecuencia tópico; -mi/-m aparece en afirmaciones directamente asumidas por el hablante. En A1 se aprenden como patrones de uso antes de profundizar sus valores."],
    ["👄","No leer como español","La escritura estándar usa a–i–u. q es posterior/uvular; en Collao aparecen además aspiradas y eyectivas. La ortografía conserva esas diferencias."]
  ];
  function renderGrammarHub(){
    if(state.lang!=="qu"){renderOther();return}
    screen.innerHTML=`<section class="hero"><div class="kicker">Referencia A1</div><h1>📘 Gramática quechua</h1><p>Una guía para entender el sistema, no una lista de excepciones. Volvé acá cuando una regla de una lección no cierre.</p></section><section class="card"><h3>El mapa general</h3><div class="grammar-overview">${GUIDE.map(g=>`<article><span>${g[0]}</span><div><b>${g[1]}</b><p>${g[2]}</p></div></article>`).join("")}</div></section><h2 class="section-title">Reglas por unidad</h2>${QA.units.map((u,ui)=>`<details class="grammar-unit" ${ui===0?"open":""}><summary><span>U${ui+1}</span> ${esc(u.title)}</summary><div class="grammar-inside"><div class="pronunciation-box"><b>👄 Pronunciación</b><p>${u.pronunciation}</p></div>${u.grammar.map(g=>`<article class="grammar-rule"><h3>${esc(g.title)}</h3><p>${esc(g.body)}</p></article>`).join("")}<h3>Ejemplos</h3>${u.phrases.slice(0,6).map(p=>`<div class="phrase"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join("")}</div></details>`).join("")}`;
  }

  function renderVocabulary(){
    if(state.lang!=="qu"){renderOther();return}
    const all=vocabRows(),f=state.vocabFilter;
    let rows=all.filter(v=>{const q=(f.query||"").toLowerCase(),strength=memStrength(v.id),intro=introduced(v);return(!q||v.word.toLowerCase().includes(q)||v.meaning.toLowerCase().includes(q))&&(f.unit==="all"||String(v.ui)===String(f.unit))&&(f.status==="all"||(f.status==="new"&&!intro)||(f.status==="weak"&&intro&&(strength??35)<55)||(f.status==="strong"&&intro&&(strength??0)>=80))});
    const learned=all.filter(introduced).length,weak=all.filter(v=>introduced(v)&&(memStrength(v.id)??35)<55).length;
    screen.innerHTML=`<section class="hero"><div class="kicker">Diccionario personal</div><h1>📚 Vocabulario A1</h1><p>${all.length} entradas del curso. Buscá por quechua o español y revisá qué palabras están fuertes o necesitan repaso.</p><div class="badge-row"><span class="hero-badge">${learned} introducidas</span><span class="hero-badge">${weak} débiles</span></div></section><section class="vocab-tools"><input id="vocabSearch" class="vocab-search" value="${esc(f.query||"")}" placeholder="Buscar: wasi, casa, mercado…"><div class="vocab-filters"><select id="vocabUnit"><option value="all">Todas las unidades</option>${QA.units.map((u,i)=>`<option value="${i}" ${String(f.unit)===String(i)?"selected":""}>U${i+1} · ${esc(u.title)}</option>`).join("")}</select><select id="vocabStatus"><option value="all">Todos los estados</option><option value="new" ${f.status==="new"?"selected":""}>No introducidas</option><option value="weak" ${f.status==="weak"?"selected":""}>Débiles</option><option value="strong" ${f.status==="strong"?"selected":""}>Fuertes</option></select></div></section><div class="vocab-list">${rows.map(v=>{const m=memStrength(v.id),intro=introduced(v),status=!intro?"nueva":(m??35)>=80?"fuerte":(m??35)<55?"débil":"aprendiendo";return`<button class="vocab-entry" data-vocab="${v.ui}:${v.wi}"><span class="vocab-icon">${v.icon}</span><span class="vocab-main"><b>${esc(v.word)}</b><small>${esc(v.meaning)}</small><em>U${v.ui+1} · ${status}</em></span><span class="vocab-memory">${intro?(m??35)+"%":"—"}</span></button>`}).join("")||'<section class="card"><p class="note">No hay palabras con esos filtros.</p></section>'}</div>`;
    const search=document.querySelector("#vocabSearch"),unit=document.querySelector("#vocabUnit"),status=document.querySelector("#vocabStatus");search.oninput=()=>{state.vocabFilter.query=search.value;save();const pos=search.selectionStart;renderVocabulary();const n=document.querySelector("#vocabSearch");if(n){n.focus();n.setSelectionRange(pos,pos)}};unit.onchange=()=>{state.vocabFilter.unit=unit.value;save();renderVocabulary()};status.onchange=()=>{state.vocabFilter.status=status.value;save();renderVocabulary()};document.querySelectorAll("[data-vocab]").forEach(b=>b.onclick=()=>{const[ui,wi]=b.dataset.vocab.split(":").map(Number);openVocabDetail(ui,wi)});
  }
  function openVocabDetail(ui,wi){
    const u=QA.units[ui],v=u.vocab[wi],m=memStrength(`v:${ui}:${wi}`),examples=u.phrases.filter(p=>p[0].toLowerCase().includes(String(v[0]).toLowerCase().replace(/^-/,""))).slice(0,4);
    shell(`${u.title} · vocabulario`,`<section class="vocab-detail"><div class="visual">${v[2]||"🧠"}</div><div><div class="kicker" style="color:var(--brand)">Unidad ${ui+1}</div><h1>${esc(v[0])}</h1><h3>${esc(v[1])}</h3></div><button id="vocabSay" class="big-audio">🔊</button></section>${v[3]?`<section class="card"><p>${esc(v[3])}</p></section>`:""}<section class="card"><b>Memoria estimada</b><div class="progress"><i style="width:${m??0}%"></i></div><p class="note">${m==null?"Todavía no introducida en tu ruta.":m+"% según el motor de repetición."}</p></section>${examples.length?`<section class="card"><h3>En frases</h3>${examples.map(p=>`<div class="phrase"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join("")}</section>`:""}<button id="closeVocabDetail" class="primary full">Volver</button>`);document.querySelector("#vocabSay").onclick=()=>speak(v[0],.64);document.querySelector("#closeVocabDetail").onclick=closeModal;
  }

  const oldLearn=renderLearn;
  renderLearn=function(){oldLearn();if(state.lang!=="qu")return;const hero=screen.querySelector(".hero");if(!hero)return;const tools=document.createElement("section");tools.className="learn-reference";tools.innerHTML=`<button id="grammarHub"><span>📘</span><div><b>Gramática A1</b><small>Reglas, ejemplos y pronunciación</small></div></button><button id="storyHub"><span>📖</span><div><b>Historias</b><small>Leer y comprender en contexto</small></div></button>`;hero.insertAdjacentElement("afterend",tools);document.querySelector("#grammarHub").onclick=()=>render("grammar");document.querySelector("#storyHub").onclick=()=>render("stories")};
  const baseRender=render;
  render=function(tab="learn"){document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));if(tab==="vocab")return renderVocabulary();if(tab==="grammar")return renderGrammarHub();if(tab==="stories"&&window.RaicesStories)return window.RaicesStories.render();return baseRender(tab)};
  window.RaicesUI4={renderGrammarHub,renderVocabulary,openVocabDetail};
  render("learn");
})();