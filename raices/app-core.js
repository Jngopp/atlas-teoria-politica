const QA = window.QA1;
const OTHERS = window.OTHER_LANGS;
const MICRO = [
  {id:"vocab1", icon:"👁️", name:"Palabras I", sub:"Descubrir"},
  {id:"vocab2", icon:"👁️", name:"Palabras II", sub:"Descubrir"},
  {id:"grammar", icon:"🧩", name:"Cómo funciona", sub:"Gramática"},
  {id:"listen", icon:"🎧", name:"Comprender", sub:"Escucha"},
  {id:"produce", icon:"💬", name:"Producir", sub:"Hablar/escribir"},
  {id:"check", icon:"✅", name:"Control", sub:"5/6 para aprobar"}
];
const ROUTE = {
  A1: QA.units.map(u=>u.title),
  A2:["Pasado cotidiano","Planes y futuro","Estados y experiencias","Instrucciones y consejos","Comparar y elegir","Fuente de información","Historias breves","Conversación cotidiana"],
  B1:["Narrar con detalle","Causas y consecuencias","Opiniones y desacuerdo","Discurso referido","Textos, audios y medios","Trabajo, estudio y territorio","Resolver problemas","Proyecto B1"]
};
const ROUTE_GOALS = {
  A1:"Curso completo actual: necesidades concretas, presentación, familia, casa, cantidades, acciones, direcciones y rutina.",
  A2:"Fase siguiente: intercambios rutinarios más amplios, pasado/futuro y relatos simples.",
  B1:"Objetivo futuro: usuario independiente en temas familiares, narración y explicación."
};
const state = JSON.parse(localStorage.getItem("raices-a1-v4") || "{}");
state.lang ??= "qu"; state.xp ??= 0; state.hearts ??= 5; state.streak ??= 0;
state.lastStudy ??= null; state.qdone ??= {}; state.unitPass ??= {};
state.routeLevel ??= "A1"; state.final ??= {objective:null,writing:0,speaking:0,passed:false};
state.otherDone ??= {};
const screen=document.querySelector("#screen"), modal=document.querySelector("#modal");
const langButton=document.querySelector("#langButton"), xp=document.querySelector("#xp"), hearts=document.querySelector("#hearts"), streak=document.querySelector("#streak");
function save(){localStorage.setItem("raices-a1-v4",JSON.stringify(state));renderStats()}
function qkey(ui,id){return `qu-${ui}-${id}`}
function markDone(ui,id,xp=8){const k=qkey(ui,id);if(!state.qdone[k]){state.qdone[k]=true;state.xp+=xp;touchStudy()}save()}
function touchStudy(){const today=new Date().toISOString().slice(0,10);if(state.lastStudy===today)return;if(state.lastStudy){const d=Math.round((new Date(today+"T12:00:00")-new Date(state.lastStudy+"T12:00:00"))/86400000);state.streak=d===1?state.streak+1:1}else state.streak=1;state.lastStudy=today}
function renderStats(){const labels={qu:["☀️","Quechua"],ay:["🏔️","Aymara"],gn:["🌿","Guaraní"],arn:["🌋","Mapuzugun"]};const [ico,n]=labels[state.lang];langButton.textContent=`${ico} ${n} ▾`;xp.textContent=state.xp;hearts.textContent=state.hearts;streak.textContent=state.streak;const colors={qu:["#7a4f2b","#b5753f"],ay:["#66508e","#8b71af"],gn:["#2f7d4a","#4b9a63"],arn:["#934a3f","#c36d52"]}[state.lang];document.documentElement.style.setProperty("--brand",colors[0]);document.documentElement.style.setProperty("--brand2",colors[1])}
function closeModal(){modal.classList.add("hidden");modal.innerHTML=""}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function speak(text,rate=.68){if(!("speechSynthesis" in window)){alert("Este navegador no ofrece síntesis de voz.");return}const u=new SpeechSynthesisUtterance(text);u.lang="qu-PE";u.rate=rate;speechSynthesis.cancel();speechSynthesis.speak(u)}
function completedMicro(){return Object.values(state.qdone).filter(Boolean).length}
function passedUnits(){return Object.values(state.unitPass).filter(Boolean).length}
function unitDoneCount(ui){return MICRO.filter(m=>state.qdone[qkey(ui,m.id)]).length}
function isFinalUnlocked(){return passedUnits()===8}
function renderLearn(){
  if(state.lang!=="qu"){renderOther();return}
  const counts=QA.meta.counts, done=completedMicro();
  screen.innerHTML=`<section class="hero"><div class="kicker">Fase 1 terminada · curso A1</div><h1>☀️ ${QA.meta.native}</h1><p>${QA.meta.variant}</p><div class="badge-row"><span class="hero-badge">8 unidades</span><span class="hero-badge">48 microlecciones</span><span class="hero-badge">${counts.learning_entries} entradas</span><span class="hero-badge">A1 alineado</span></div></section><div class="warning"><b>🎙️ Audio:</b> la voz del navegador es una guía aproximada, no un modelo fonético validado. La escritura y la progresión usan quechua sureño; el audio humano por variedad queda como capa posterior.</div><section class="card"><b>Progreso A1 · ${done}/48</b><div class="progress"><i style="width:${done/48*100}%"></i></div><p class="note">Cada unidad exige enseñanza, comprensión, producción y un control de 6 ítems. El control se aprueba con 5/6.</p><button id="criteriaBtn" class="secondary full">Ver qué significa A1 aquí</button></section><h2 class="section-title">Ruta Quechua A1</h2>${QA.units.map((u,ui)=>`<section class="unit-card"><div class="unit-head"><div class="unit-num">${ui+1}</div><div><h3>${u.title}</h3><small>${unitDoneCount(ui)}/6 microlecciones · ${state.unitPass[ui]?"✓ control aprobado":"control pendiente"}</small></div></div><p class="can-do"><b>Al terminar:</b> ${u.goal}</p><div class="progress"><i style="width:${unitDoneCount(ui)/6*100}%"></i></div><div class="micro-grid">${MICRO.map(m=>`<button class="micro-btn ${state.qdone[qkey(ui,m.id)]?"done":""}" data-ui="${ui}" data-micro="${m.id}"><span class="micro-icon">${m.icon}</span><b>${m.name}</b><small>${state.qdone[qkey(ui,m.id)]?"✓ completada":m.sub}</small></button>`).join("")}</div></section>`).join("")}<section class="checkpoint-card"><h3>🏁 Evaluación integradora A1</h3><p class="note">24 ítems objetivos: escucha, lectura e interacción + producción escrita y oral con rúbricas.</p><button id="finalBtn" class="${isFinalUnlocked()?"primary":"secondary"} full">${isFinalUnlocked()?"Realizar checkpoint A1":"🔒 Aprobá los 8 controles para desbloquear"}</button></section>`;
  document.querySelectorAll("[data-micro]").forEach(b=>b.onclick=()=>openMicro(+b.dataset.ui,b.dataset.micro));document.querySelector("#criteriaBtn").onclick=openCriteria;document.querySelector("#finalBtn").onclick=()=>isFinalUnlocked()?startFinal():alert("Primero aprobá el control de las 8 unidades.")
}