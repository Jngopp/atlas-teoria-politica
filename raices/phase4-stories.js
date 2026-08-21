/* Raíces · Fase 4: historias y diálogos interactivos A1 */
(function(){
 if(!window.QA1)return;
 state.storyDone??={};
 const META=[
  ["Un primer encuentro","Dos personas se saludan y preguntan cómo están.","👋"],
  ["Nos conocemos","Killa y Amaru intercambian nombre, procedencia y residencia.","🧑‍🤝‍🧑"],
  ["Esta es mi familia","Killa presenta a su madre, a su hermano y su casa.","👨‍👩‍👧"],
  ["Mi casa","Una visita breve sirve para describir objetos, colores y un cerro cercano.","🏠"],
  ["En el mercado","Una compra sencilla practica cantidades, precio, papas y pan.","🛒"],
  ["¿Qué comés?","Una conversación cotidiana combina comida, bebida y estudio.","🥔"],
  ["¿Dónde está el mercado?","Killa pide indicaciones y sigue un recorrido corto.","🧭"],
  ["Un día de Amaru","Amaru cuenta una rutina simple desde la mañana hasta la noche.","🌅"]
 ];
 function unlocked(ui){return ui===0||!!state.unitPass[ui-1]||!!state.unitPass[ui]||unitDoneCount(ui)>=3}
 function renderStories(){
   if(state.lang!=="qu"){renderOther();return}
   const done=Object.values(state.storyDone).filter(Boolean).length;
   screen.innerHTML=`<section class="hero"><div class="kicker">Fase 4 · comprensión en contexto</div><h1>📖 Historias A1</h1><p>Diálogos graduados que reutilizan lo aprendido. Escuchá, leé, ocultá o revelá la traducción y respondé preguntas de comprensión.</p><div class="badge-row"><span class="hero-badge">${done}/8 completadas</span><span class="hero-badge">A1 gradual</span></div></section>
   <section class="card"><h3>Cómo usarlas</h3><p class="note">Primero intentá comprender el quechua sin traducción. Tocá una línea para revelar el español solo cuando lo necesites. El audio sintético sigue siendo orientativo.</p></section>
   <div class="story-list">${QA.units.map((u,ui)=>{const m=META[ui],lock=!unlocked(ui);return`<button class="story-card ${lock?"locked":""}" data-story="${ui}" ${lock?"disabled":""}><span class="story-ico">${m[2]}</span><span><em>Historia ${ui+1} · Unidad ${ui+1}</em><b>${m[0]}</b><small>${m[1]}</small></span><span class="story-state">${lock?"🔒":state.storyDone[ui]?"✓":"›"}</span></button>`}).join("")}</div>`;
   document.querySelectorAll("[data-story]").forEach(b=>b.onclick=()=>openStory(+b.dataset.story));
 }
 function openStory(ui){
   const u=QA.units[ui],m=META[ui];let qi=0,score=0,answered=false;
   modal.classList.remove("hidden");
   function read(){
     modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><div><div class="kicker" style="color:var(--brand)">Historia ${ui+1}</div><b>${m[0]}</b></div></div><section class="story-intro"><div class="story-bigico">${m[2]}</div><h2>${m[0]}</h2><p>${m[1]}</p></section><section class="story-dialogue">${u.dialogue.map((d,i)=>`<article class="story-line" data-translate="${i}"><div class="story-speaker">${esc(d[0])}</div><div class="story-native">${esc(d[1])} <button class="audio-btn" data-story-audio="${i}">🔊</button></div><div class="story-translation" id="tr${i}">${esc(d[2])}</div><small>Tocá la línea para ver/ocultar traducción</small></article>`).join("")}</section><button id="storyQuestions" class="primary full">Responder ${u.comp.length} preguntas</button></div>`;
     document.querySelector("#closeM").onclick=closeModal;
     document.querySelectorAll("[data-story-audio]").forEach(b=>b.onclick=e=>{e.stopPropagation();speak(u.dialogue[+b.dataset.storyAudio][1],.64)});
     document.querySelectorAll("[data-translate]").forEach(a=>a.onclick=()=>a.classList.toggle("show-translation"));
     document.querySelector("#storyQuestions").onclick=paintQ;
   }
   function paintQ(){
     const q=u.comp[qi];
     modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><div class="progress"><i style="width:${qi/u.comp.length*100}%"></i></div><b>${qi+1}/${u.comp.length}</b></div><section class="question-card"><div class="kicker" style="color:var(--brand)">Comprensión de historia</div><h3>${esc(q.q)}</h3><div class="opts">${q.opts.map((o,i)=>`<button class="opt" data-o="${i}">${esc(o)}</button>`).join("")}</div><div id="storyFb"></div><button id="storyNext" class="primary full" disabled>Comprobar</button></section></div>`;
     document.querySelector("#closeM").onclick=closeModal;let sel=null;answered=false;const next=document.querySelector("#storyNext"),fb=document.querySelector("#storyFb");
     document.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(answered)return;sel=+b.dataset.o;document.querySelectorAll(".opt").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");next.disabled=false});
     next.onclick=()=>{if(!answered){answered=true;const ok=sel===q.a;if(ok)score++;else state.hearts=Math.max(0,state.hearts-1);if(window.RaicesAdaptive)RaicesAdaptive.record(`c:${ui}:${qi}`,ok,"historia");else save();fb.className=`feedback ${ok?"ok":"bad"}`;fb.textContent=ok?"✓ Correcto":"✕ Respuesta: "+q.opts[q.a];next.textContent=qi===u.comp.length-1?"Terminar historia":"Continuar";return}if(qi<u.comp.length-1){qi++;paintQ()}else finish()};
   }
   function finish(){
     const pass=score>=Math.ceil(u.comp.length*.75);if(pass&&!state.storyDone[ui]){state.storyDone[ui]=true;state.xp+=20;touchStudy();save()}
     modal.innerHTML=`<div class="shell"><div class="trophy">${pass?"📖":"🧠"}</div><h2>${score}/${u.comp.length}</h2><p>${pass?"Historia completada. +20 XP. Volvé después: la comprensión también entra al motor adaptativo.":"Releé el diálogo sin apurarte y probá otra vez."}</p><button id="storyBack" class="primary full">Volver a historias</button></div>`;document.querySelector("#storyBack").onclick=()=>{closeModal();render("stories")};
   }
   read();
 }
 window.RaicesStories={render:renderStories,open:openStory};
})();