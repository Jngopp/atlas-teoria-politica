function startFinal(){
  let section=0,qi=0,score=0,total=0;
  const groups=[
    {name:"Escucha",icon:"🎧",items:QA.final.listening,type:"listening"},
    {name:"Lectura",icon:"📖",items:QA.final.reading,type:"reading"},
    {name:"Interacción",icon:"💬",items:QA.final.interaction,type:"interaction"}
  ];
  modal.classList.remove("hidden");
  function paintObjective(){
    const g=groups[section],q=g.items[qi], doneBefore=groups.slice(0,section).reduce((a,x)=>a+x.items.length,0)+qi, grand=24;
    const prompt=g.type==="listening"?`<button id="playFinal" class="audio-btn">🔊</button><p class="note">Escuchá sin mirar el texto.</p>`:g.type==="reading"?`<div class="rule-card"><div class="native">${esc(q.text)}</div></div>`:"";
    modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><div class="progress"><i style="width:${doneBefore/grand*100}%"></i></div><b>${doneBefore+1}/${grand}</b></div><section class="question-card"><div class="kicker" style="color:var(--brand)">${g.icon} ${g.name}</div>${prompt}<h3>${esc(q.q)}</h3><div class="opts">${q.opts.map((o,i)=>`<button class="opt" data-o="${i}">${esc(o)}</button>`).join("")}</div><div id="fb"></div><button id="fnext" class="primary full" disabled>Comprobar</button></section></div>`;
    document.querySelector("#closeM").onclick=closeModal;const playFinal=document.querySelector("#playFinal"),fnext=document.querySelector("#fnext"),fb=document.querySelector("#fb");if(g.type==="listening")playFinal.onclick=()=>speak(q.say,.62);
    let sel=null,answered=false;document.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(answered)return;sel=+b.dataset.o;document.querySelectorAll(".opt").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");fnext.disabled=false});
    fnext.onclick=()=>{if(!answered){answered=true;total++;const ok=sel===q.a;if(ok)score++;fb.className=`feedback ${ok?"ok":"bad"}`;fb.textContent=ok?"✓ Correcto":"✕ Respuesta: "+q.opts[q.a];fnext.textContent=(section===2&&qi===g.items.length-1)?"Pasar a producción":"Continuar";return}if(qi<g.items.length-1){qi++;paintObjective()}else if(section<groups.length-1){section++;qi=0;paintObjective()}else{state.final.objective=Math.round(score/total*100);save();paintWriting()}};
  }
  function paintWriting(){
    const w=QA.final.writing;
    modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><b>✍️ Producción escrita</b></div><section class="production-card"><div class="prompt">${esc(w.prompt)}</div><textarea id="writingText" class="text-input" placeholder="Escribí 5–7 oraciones…"></textarea><button id="showWModel" class="secondary full">Ver modelo después de escribir</button><div id="wmodel"></div><h3>Rúbrica</h3><p class="note">Marcá solo criterios que tu texto realmente cumple.</p><div class="rubric">${w.rubric.map((r,i)=>`<label><input type="checkbox" data-wr="${i}"><span>${esc(r)}</span></label>`).join("")}</div><button id="toSpeak" class="primary full">Continuar a producción oral</button></section></div>`;
    document.querySelector("#closeM").onclick=closeModal;const showWModel=document.querySelector("#showWModel"),wmodel=document.querySelector("#wmodel"),toSpeak=document.querySelector("#toSpeak");showWModel.onclick=()=>wmodel.innerHTML=`<div class="model"><b>Modelo posible:</b> ${esc(w.model)}</div>`;
    toSpeak.onclick=()=>{state.final.writing=document.querySelectorAll("[data-wr]:checked").length;save();paintSpeaking()};
  }
  function paintSpeaking(){
    const sp=QA.final.speaking;
    modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><b>🎙️ Producción oral</b></div><section class="production-card"><div class="prompt">${esc(sp.prompt)}</div><div class="record-box"><b>Grabación opcional en el navegador</b><p class="record-status" id="recStatus">Podés grabarte para escucharte antes de completar la rúbrica.</p><div class="action-row"><button id="recStart" class="secondary">● Grabar</button><button id="recStop" class="secondary" disabled>■ Detener</button></div><audio id="recAudio" controls style="width:100%;margin-top:9px;display:none"></audio></div><h3>Rúbrica oral</h3><div class="rubric">${sp.rubric.map((r,i)=>`<label><input type="checkbox" data-sr="${i}"><span>${esc(r)}</span></label>`).join("")}</div><button id="finishA1" class="primary full">Calcular resultado A1</button></section></div>`;
    document.querySelector("#closeM").onclick=closeModal;setupRecorder();const finishA1=document.querySelector("#finishA1");
    finishA1.onclick=()=>{state.final.speaking=document.querySelectorAll("[data-sr]:checked").length;const obj=state.final.objective||0;state.final.passed=obj>=75&&state.final.writing>=4&&state.final.speaking>=4&&passedUnits()===8;if(state.final.passed){state.xp+=100;touchStudy()}save();showFinalResult()};
  }
  function showFinalResult(){
    const f=state.final;
    modal.innerHTML=`<div class="shell"><div class="trophy">${f.passed?"🏆":"🧭"}</div><h2 class="${f.passed?"pass":"fail"}">${f.passed?"A1 alineado superado":"Todavía no alcanza el umbral interno"}</h2><div class="skill-grid"><div class="skill"><b>${f.objective??0}%</b><small>Escucha + lectura + interacción (mín. 75%)</small></div><div class="skill"><b>${f.writing}/5</b><small>Escritura (mín. 4)</small></div><div class="skill"><b>${f.speaking}/5</b><small>Oral (mín. 4)</small></div><div class="skill"><b>${passedUnits()}/8</b><small>Controles de unidad</small></div></div><section class="warning"><b>Importante:</b> “A1 alineado” significa que el currículo y este checkpoint cubren los descriptores funcionales A1. No equivale a una certificación oficial ni reemplaza una evaluación oral/escrita por un examinador competente.</section><button id="backProfile" class="primary full">Ver perfil</button></div>`;
    document.querySelector("#backProfile").onclick=()=>{closeModal();render("profile")}
  }
  paintObjective();
}
let mediaStream=null,mediaRecorder=null,chunks=[];
async function setupRecorder(){
  const start=document.querySelector("#recStart"),stop=document.querySelector("#recStop"),status=document.querySelector("#recStatus"),audio=document.querySelector("#recAudio");
  if(!start)return;
  if(!navigator.mediaDevices?.getUserMedia||!("MediaRecorder" in window)){status.textContent="Tu navegador no permite grabar acá. Hacé la presentación en voz alta y completá la rúbrica.";start.disabled=true;return}
  start.onclick=async()=>{try{mediaStream=await navigator.mediaDevices.getUserMedia({audio:true});chunks=[];mediaRecorder=new MediaRecorder(mediaStream);mediaRecorder.ondataavailable=e=>chunks.push(e.data);mediaRecorder.onstop=()=>{const blob=new Blob(chunks,{type:mediaRecorder.mimeType});audio.src=URL.createObjectURL(blob);audio.style.display="block";mediaStream.getTracks().forEach(t=>t.stop());status.textContent="Escuchá tu grabación y evaluá si cumple los criterios."};mediaRecorder.start();status.textContent="Grabando…";start.disabled=true;stop.disabled=false}catch(e){status.textContent="No se pudo acceder al micrófono. Podés hacer la tarea oral sin grabación."}};
  stop.onclick=()=>{if(mediaRecorder?.state==="recording")mediaRecorder.stop();stop.disabled=true;start.disabled=false};
}
function renderPath(){
  screen.innerHTML=`<section class="hero"><div class="kicker">Ruta completa del proyecto</div><h1>🧭 Quechua A1 → B1</h1><p>A1 está desarrollado en esta fase. A2 y B1 permanecen como arquitectura curricular para las siguientes fases.</p></section><div class="tabs">${["A1","A2","B1"].map(l=>`<button class="tab ${state.routeLevel===l?"active":""}" data-level="${l}">${l}</button>`).join("")}</div><section class="card"><h3>${state.routeLevel}</h3><p class="note">${ROUTE_GOALS[state.routeLevel]}</p>${ROUTE[state.routeLevel].map((t,i)=>{const done=state.routeLevel==="A1"&&state.unitPass[i];return`<div class="route-unit"><div class="route-status ${done?"done":""}">${done?"✓":i+1}</div><div><b>${esc(t)}</b><div class="note">${state.routeLevel==="A1"?"6 microlecciones · control 5/6":state.routeLevel==="A2"?"planificado para fase 2":"planificado para fase 3"}</div></div></div>`}).join("")}</section>`;
  document.querySelectorAll("[data-level]").forEach(b=>b.onclick=()=>{state.routeLevel=b.dataset.level;save();renderPath()});
}
function renderPractice(){
  if(state.lang!=="qu"){renderOther();return}
  const weak=QA.units.flatMap((u,ui)=>u.quiz.map(q=>({...q,ui})));
  screen.innerHTML=`<section class="hero"><div class="kicker">Práctica</div><h1>🎯 Repaso Quechua A1</h1><p>Repetí controles completos o una pregunta aleatoria. El motor adaptativo fino vendrá en una fase posterior.</p></section><section class="card"><h3>Control aleatorio</h3><p class="note">Una pregunta tomada de las 8 unidades.</p><button id="randomQ" class="primary full">Practicar ahora</button></section>${QA.units.map((u,i)=>`<section class="unit-card"><b>Unidad ${i+1} · ${u.title}</b><button class="secondary full" style="margin-top:9px" data-retry="${i}">Repetir control</button></section>`).join("")}`;
  document.querySelector("#randomQ").onclick=()=>{const q=weak[Math.floor(Math.random()*weak.length)];singlePractice(q)};
  document.querySelectorAll("[data-retry]").forEach(b=>b.onclick=()=>runUnitQuiz(+b.dataset.retry));
}
function singlePractice(q){
  shell("Repaso rápido",`<section class="question-card"><h3>${esc(q.q)}</h3><div class="opts">${q.opts.map((o,i)=>`<button class="opt" data-o="${i}">${esc(o)}</button>`).join("")}</div><div id="fb"></div></section>`);
  const fb=document.querySelector("#fb");document.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{const ok=+b.dataset.o===q.a;fb.className=`feedback ${ok?"ok":"bad"}`;fb.textContent=ok?"✓ Correcto":"✕ Respuesta: "+q.opts[q.a]});
}
function renderProfile(){
  if(state.lang!=="qu"){renderOther();return}
  const done=completedMicro(),f=state.final;
  screen.innerHTML=`<section class="hero"><div class="kicker">Perfil de aprendizaje</div><h1>👤 Quechua A1</h1><p>${state.xp} XP · ${state.streak} días de racha.</p>${f.passed?'<div class="badge-row"><span class="hero-badge">🏆 A1 alineado superado</span></div>':""}</section><div class="skill-grid"><div class="skill"><b>${done}/48</b><small>microlecciones</small></div><div class="skill"><b>${passedUnits()}/8</b><small>unidades aprobadas</small></div><div class="skill"><b>${f.objective??"—"}${f.objective!=null?"%":""}</b><small>checkpoint objetivo</small></div><div class="skill"><b>${f.passed?"✓":"—"}</b><small>A1 alineado</small></div></div><section class="card"><h3>Alcance real</h3><p class="note">${QA.meta.disclaimer}</p><button id="critProfile" class="secondary full">Descriptores y evidencias</button></section><section class="card"><h3>Fuentes lingüísticas y pedagógicas</h3>${QA.sources.map(s=>`<a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join("")}</section>${isFinalUnlocked()?`<button id="repeatFinal" class="primary full">${f.objective==null?"Realizar evaluación A1":"Repetir evaluación A1"}</button>`:""}`;
  document.querySelector("#critProfile").onclick=openCriteria;const rf=document.querySelector("#repeatFinal");if(rf)rf.onclick=startFinal;
}
function renderOther(){
  const c=OTHERS[state.lang];
  screen.innerHTML=`<section class="hero"><div class="kicker">Próximas fases</div><h1>${c.icon} ${c.native}</h1><p>${c.status}. En esta fase el curso plenamente desarrollado y alineado es Quechua A1.</p></section><section class="warning">Estas palabras siguen disponibles como demostración, pero no constituyen un curso A1.</section><section class="card"><h3>Vocabulario inicial</h3>${c.vocab.map((v,i)=>`<button class="micro-btn" style="width:100%;margin:5px 0" data-other="${i}"><span class="micro-icon">${v[2]}</span><b>${esc(v[0])}</b><small>${esc(v[1])}</small></button>`).join("")}</section>`;
  document.querySelectorAll("[data-other]").forEach(b=>b.onclick=()=>openOtherWord(+b.dataset.other));
}
function openOtherWord(i){
  const c=OTHERS[state.lang],v=c.vocab[i];
  shell(`${c.name} · prototipo`,`<div class="visual" style="margin:auto">${v[2]}</div><h1 style="text-align:center">${esc(v[0])}</h1><h3 style="text-align:center">${esc(v[1])}</h3><div class="warning">Contenido demostrativo. Todavía no está validado como curso A1 completo.</div><button id="closeOther" class="primary full">Volver</button>`);
  document.querySelector("#closeOther").onclick=closeModal;
}
function openLanguagePicker(){
  modal.classList.remove("hidden");
  const all={qu:{name:"Quechua",native:"Urin Qichwa · Qullaw",icon:"☀️",status:"A1 completo"},...OTHERS};
  modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><h2>Elegí una lengua</h2></div><div class="lang-grid">${Object.entries(all).map(([k,c])=>`<button class="lang-card" data-lang="${k}"><div class="ico">${c.icon}</div><b>${c.name}</b><small>${c.native}<br>${c.status||""}</small></button>`).join("")}</div></div>`;
  document.querySelector("#closeM").onclick=closeModal;document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{state.lang=b.dataset.lang;save();closeModal();render("learn")});
}
function render(tab="learn"){
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
  if(tab==="learn")renderLearn();if(tab==="path")renderPath();if(tab==="practice")renderPractice();if(tab==="profile")renderProfile();
}
langButton.onclick=openLanguagePicker;
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>render(b.dataset.tab));
renderStats();render("learn");
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));