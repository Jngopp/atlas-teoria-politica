function openMicro(ui,id){
  const handlers={vocab1:()=>openVocab(ui,0),vocab2:()=>openVocab(ui,1),grammar:()=>openGrammar(ui),listen:()=>openComprehension(ui),produce:()=>openProduction(ui),check:()=>runUnitQuiz(ui)};
  handlers[id]();
}
function shell(title,body,footer=""){
  modal.classList.remove("hidden");
  modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><div><div class="kicker" style="color:var(--brand)">Quechua A1</div><b>${title}</b></div></div>${body}${footer}</div>`;
  document.querySelector("#closeM").onclick=closeModal;
}
function openVocab(ui,part){
  const u=QA.units[ui], mid=Math.ceil(u.vocab.length/2), words=part===0?u.vocab.slice(0,mid):u.vocab.slice(mid);
  shell(`${u.title} · Palabras ${part+1}`,`
    <section class="card"><h3>👁️ Mirá, entendé y escuchá</h3><p class="note">No memorices ortografía sin sonido ni una traducción aislada: asociá forma, significado y uso.</p></section>
    <div class="word-grid">${words.map((v,i)=>`<article class="word-card"><div class="visual">${v[2]||"🧠"}</div><div><h3>${esc(v[0])}</h3><b>${esc(v[1])}</b><p>${esc(v[3]||"")}</p></div><button class="audio-btn" data-say="${i}">🔊</button></article>`).join("")}</div>
    <button id="completeV" class="primary full">Completar microlección · +8 XP</button>`);
  document.querySelectorAll("[data-say]").forEach(b=>b.onclick=()=>speak(words[+b.dataset.say][0]));
  document.querySelector("#completeV").onclick=()=>{markDone(ui,part===0?"vocab1":"vocab2");closeModal();renderLearn()};
}
function openGrammar(ui){
  const u=QA.units[ui];
  shell(`${u.title} · Cómo funciona`,`
    <section class="rule-card"><h3>👄 Pronunciación</h3><p>${u.pronunciation}</p></section>
    ${u.grammar.map(g=>`<section class="rule-card"><h3>🧩 ${g.title}</h3><p>${g.body}</p></section>`).join("")}
    <section class="rule-card"><h3>🌎 Contexto y uso</h3><p>${u.culture}</p></section>
    <section class="rule-card"><h3>💬 Expresiones modelo</h3>${u.phrases.map(p=>`<div class="phrase"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join("")}</section>
    <button id="completeG" class="primary full">Entendido · +8 XP</button>`);
  document.querySelector("#completeG").onclick=()=>{markDone(ui,"grammar");closeModal();renderLearn()};
}
function openComprehension(ui){
  const u=QA.units[ui]; let qi=0,score=0,answered=false;
  modal.classList.remove("hidden");
  function paint(){
    const q=u.comp[qi];
    modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><div class="progress"><i style="width:${(qi/u.comp.length)*100}%"></i></div></div>
    ${qi===0?`<section class="dialogue"><h3>🎧 Diálogo</h3><p class="note">Escuchá cada línea y después respondé. La síntesis de voz es solo aproximada.</p>${u.dialogue.map((d,i)=>`<div class="line"><div class="speaker">${esc(d[0])}</div><div class="native">${esc(d[1])} <button class="audio-btn" data-line="${i}">🔊</button></div><div class="translation">${esc(d[2])}</div></div>`).join("")}</section>`:""}
    <section class="question-card"><div class="kicker" style="color:var(--brand)">Comprensión ${qi+1}/${u.comp.length}</div><h3>${esc(q.q)}</h3><div class="opts">${q.opts.map((o,i)=>`<button class="opt" data-o="${i}">${esc(o)}</button>`).join("")}</div><div id="fb"></div><button id="nextQ" class="primary full" disabled>Comprobar</button></section></div>`;
    document.querySelector("#closeM").onclick=closeModal;
    document.querySelectorAll("[data-line]").forEach(b=>b.onclick=()=>speak(u.dialogue[+b.dataset.line][1]));
    let sel=null;const nextQ=document.querySelector("#nextQ"),fb=document.querySelector("#fb");document.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(answered)return;sel=+b.dataset.o;document.querySelectorAll(".opt").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");nextQ.disabled=false});
    nextQ.onclick=()=>{if(!answered){answered=true;const ok=sel===q.a;if(ok)score++;fb.className=`feedback ${ok?"ok":"bad"}`;fb.textContent=ok?"✓ Correcto":"✕ Revisá el diálogo: "+q.opts[q.a];nextQ.textContent=qi===u.comp.length-1?"Terminar":"Continuar";return}if(qi<u.comp.length-1){qi++;answered=false;paint()}else{markDone(ui,"listen",10);modal.innerHTML=`<div class="shell"><div class="trophy">🎧</div><h2>${score}/${u.comp.length} correctas</h2><p>Comprensión completada. Podés repetirla cuando quieras.</p><button id="back" class="primary full">Volver</button></div>`;document.querySelector("#back").onclick=()=>{closeModal();renderLearn()}}};
  } paint();
}
function openProduction(ui){
  const u=QA.units[ui];let pi=0;
  modal.classList.remove("hidden");
  function paint(){
    const p=u.production[pi];
    modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><div class="progress"><i style="width:${pi/u.production.length*100}%"></i></div></div>
    <section class="production-card"><div class="kicker" style="color:var(--brand)">Producción ${pi+1}/${u.production.length}</div><div class="prompt">${esc(p.prompt)}</div><textarea id="attempt" class="text-input" placeholder="Escribí tu respuesta o decila en voz alta…"></textarea><button id="reveal" class="secondary full">Ver un modelo posible</button><div id="modelWrap"></div><button id="nextP" class="primary full" disabled>${pi===u.production.length-1?"Completar":"Siguiente"}</button></section></div>`;
    document.querySelector("#closeM").onclick=closeModal;const reveal=document.querySelector("#reveal"),modelWrap=document.querySelector("#modelWrap"),nextP=document.querySelector("#nextP");
    reveal.onclick=()=>{modelWrap.innerHTML=`<div class="model"><b>Modelo:</b> ${esc(p.model)}</div>`;nextP.disabled=false};
    nextP.onclick=()=>{if(pi<u.production.length-1){pi++;paint()}else{markDone(ui,"produce",12);closeModal();renderLearn()}};
  }paint();
}
function runUnitQuiz(ui){
  const u=QA.units[ui], qs=u.quiz;let qi=0,score=0,answered=false,sel=null;
  modal.classList.remove("hidden");
  function paint(){
    const q=qs[qi];
    modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><div class="progress"><i style="width:${qi/qs.length*100}%"></i></div><b>${qi+1}/${qs.length}</b></div><section class="question-card"><div class="kicker" style="color:var(--brand)">Control de unidad</div><h3>${esc(q.q)}</h3><div class="opts">${q.opts.map((o,i)=>`<button class="opt" data-o="${i}">${esc(o)}</button>`).join("")}</div><div id="fb"></div><button id="quizNext" class="primary full" disabled>Comprobar</button></section></div>`;
    document.querySelector("#closeM").onclick=closeModal;sel=null;answered=false;const quizNext=document.querySelector("#quizNext"),fb=document.querySelector("#fb");
    document.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(answered)return;sel=+b.dataset.o;document.querySelectorAll(".opt").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");quizNext.disabled=false});
    quizNext.onclick=()=>{if(!answered){answered=true;const ok=sel===q.a;if(ok)score++;else state.hearts=Math.max(0,state.hearts-1);save();fb.className=`feedback ${ok?"ok":"bad"}`;fb.textContent=ok?"✓ Correcto":"✕ Respuesta: "+q.opts[q.a];quizNext.textContent=qi===qs.length-1?"Ver resultado":"Continuar";return}if(qi<qs.length-1){qi++;paint()}else finish()};
  }
  function finish(){
    const pass=score>=5;
    if(pass){state.unitPass[ui]=true;markDone(ui,"check",20)}
    modal.innerHTML=`<div class="shell"><div class="trophy">${pass?"🏆":"📚"}</div><h2 class="${pass?"pass":"fail"}">${score}/${qs.length}</h2><p>${pass?"Unidad aprobada. El umbral interno es 5/6.":"Necesitás 5/6. Repasá la unidad y volvé a intentar."}</p><button id="back" class="primary full">${pass?"Volver a la ruta":"Volver y repasar"}</button></div>`;
    document.querySelector("#back").onclick=()=>{closeModal();renderLearn()}
  }paint();
}
function openCriteria(){
  shell("Criterio de alineación A1",`
    <section class="card"><h3>Qué debe poder hacer un usuario A1</h3><p class="note">Comprender y usar expresiones muy frecuentes para necesidades concretas; presentarse; preguntar/responder datos personales; interactuar de forma simple si la otra persona habla lento, claro y ayuda.</p></section>
    ${QA.final.alignment.map(a=>`<details><summary>${esc(a.skill)}</summary><p class="note"><b>Descriptor:</b> ${esc(a.descriptor)}</p><p class="note"><b>Evidencia en Raíces:</b> ${esc(a.evidence)}</p></details>`).join("")}
    <section class="warning">${QA.meta.disclaimer}</section>
    <button id="closeCriteria" class="primary full">Volver</button>`);
  document.querySelector("#closeCriteria").onclick=closeModal;
}