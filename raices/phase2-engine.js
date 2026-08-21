/* Raíces · Fase 2: motor pedagógico adaptativo */
(function(){
  const DAY=86400000, MIN=60000;
  state.adaptive ??= {version:2,cards:{},events:[],sessions:[],settings:{sessionSize:10}};
  const AD=state.adaptive;
  AD.version=2; AD.cards??={}; AD.events??=[]; AD.sessions??=[]; AD.settings??={sessionSize:10};

  const OPEN_AUDIO=[
    {label:"yupay",note:"Muestra de Quechua de Puno (qxp), voz: Elwinlhq · CC0",file:"LL-Q7260479 (qxp)-Elwinlhq-yupay.wav",source:"https://commons.wikimedia.org/wiki/File:LL-Q7260479_(qxp)-Elwinlhq-yupay.wav"},
    {label:"k'aqnay",note:"Muestra de Quechua de Puno (qxp), útil para escuchar k' eyectiva · voz: Elwinlhq · CC0",file:"LL-Q7260479 (qxp)-Elwinlhq-k'aqnay.wav",source:"https://commons.wikimedia.org/wiki/File:LL-Q7260479_(qxp)-Elwinlhq-k%27aqnay.wav"}
  ];

  function audioUrl(file){return "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+encodeURIComponent(file).replace(/%2F/g,"/")}
  function allBank(){
    const out=[];
    QA.units.forEach((u,ui)=>{
      u.vocab.forEach((v,wi)=>out.push({id:`v:${ui}:${wi}`,kind:"vocab",skill:"vocabulario",ui,wi,front:v[0],back:v[1],icon:v[2]||"🧠",context:v[3]||""}));
      u.quiz.forEach((q,qi)=>out.push({id:`q:${ui}:${qi}`,kind:"quiz",skill:"estructura",ui,qi,q}));
      u.comp.forEach((q,qi)=>out.push({id:`c:${ui}:${qi}`,kind:"comp",skill:"comprensión",ui,qi,q,dialogue:u.dialogue}));
    });
    return out;
  }
  function bankMap(){return new Map(allBank().map(x=>[x.id,x]))}
  function defaultRec(){return {seen:0,correct:0,wrong:0,streak:0,lapses:0,stability:.55,ease:2.25,interval:0,last:null,due:Date.now(),lastWrong:null,introduced:false,history:[]}}
  function rec(id){return AD.cards[id]||(AD.cards[id]=defaultRec())}
  function memoryStrength(r,now=Date.now()){
    if(!r.last) return r.introduced?35:20;
    const elapsed=Math.max(0,(now-r.last)/DAY), stab=Math.max(.25,r.stability||.55);
    return Math.round(Math.max(2,Math.min(100,100*Math.exp(-elapsed/stab))));
  }
  function errorRate(r){return r.seen? r.wrong/r.seen : 0}
  function overdueScore(r,now=Date.now()){
    if(!r.due||r.due>now)return 0;
    return Math.min(1,(now-r.due)/(7*DAY)+.2);
  }
  function weakness(r,now=Date.now()){
    const mem=(100-memoryStrength(r,now))/100;
    return Math.min(1, mem*.48 + errorRate(r)*.28 + overdueScore(r,now)*.16 + Math.min(.08,(r.lapses||0)*.025));
  }
  function priority(item,mode="smart"){
    const r=rec(item.id), now=Date.now(), weak=weakness(r,now), due=r.due<=now?1:0, err=errorRate(r);
    if(mode==="errors") return (r.lastWrong?2:0)+err*2+(r.lapses||0)*.12+weak;
    if(mode==="weak") return weak*3+err+.2*(r.seen===0);
    if(mode==="due") return due*3+overdueScore(r,now)+weak;
    return due*2.2+weak*1.8+err*.8+(r.seen===0?.35:0)+Math.random()*.15;
  }
  function isVocabIntroduced(item){
    const u=QA.units[item.ui], mid=Math.ceil(u.vocab.length/2), micro=item.wi<mid?"vocab1":"vocab2";
    return !!state.qdone[qkey(item.ui,micro)] || !!state.unitPass[item.ui] || rec(item.id).seen>0;
  }
  function eligible(item){
    if(item.kind==="vocab") return isVocabIntroduced(item);
    if(item.kind==="quiz") return !!state.qdone[qkey(item.ui,"check")] || !!state.unitPass[item.ui] || rec(item.id).seen>0;
    if(item.kind==="comp") return !!state.qdone[qkey(item.ui,"listen")] || !!state.unitPass[item.ui] || rec(item.id).seen>0;
    return false;
  }
  function seedIntroduced(){
    QA.units.forEach((u,ui)=>{
      const mid=Math.ceil(u.vocab.length/2);
      [[0,mid,"vocab1"],[mid,u.vocab.length,"vocab2"]].forEach(([a,b,m])=>{
        if(state.qdone[qkey(ui,m)]||state.unitPass[ui]) for(let wi=a;wi<b;wi++){
          const r=rec(`v:${ui}:${wi}`); if(!r.introduced){r.introduced=true;r.due=Date.now();r.stability=.45;}
        }
      });
    });
  }
  function linkedVocab(ui,q){
    const hay=(q.q+" "+(q.opts?.[q.a]||"")).toLowerCase();
    return QA.units[ui].vocab.map((v,wi)=>({v,wi})).filter(x=>{
      const w=String(x.v[0]).toLowerCase(), m=String(x.v[1]).toLowerCase().split("/")[0].trim();
      return (w.length>2&&hay.includes(w))||(m.length>3&&hay.includes(m));
    }).map(x=>`v:${ui}:${x.wi}`).slice(0,2);
  }
  function adaptiveRecord(id,ok,source="practice",linked=[]){
    const r=rec(id), now=Date.now();
    r.seen++; r.last=now; r.introduced=true;
    if(ok){
      r.correct++; r.streak=(r.streak||0)+1; r.ease=Math.min(2.9,(r.ease||2.25)+.04);
      const ladder=[1,3,7,14,30,60,90];
      const base=ladder[Math.min(r.streak-1,ladder.length-1)];
      r.interval=Math.max(1,Math.round(base*Math.max(.8,(r.ease||2.25)/2.25)));
      r.stability=Math.min(120,Math.max(.65,r.stability||.55)*(1.28+Math.min(.32,r.streak*.055)));
      r.due=now+r.interval*DAY;
    }else{
      r.wrong++; r.lapses=(r.lapses||0)+1; r.streak=0; r.ease=Math.max(1.45,(r.ease||2.25)-.14);
      r.stability=Math.max(.25,(r.stability||.55)*.52); r.interval=10/(24*60); r.due=now+10*MIN; r.lastWrong=now;
    }
    r.history=(r.history||[]).concat([{t:now,ok:!!ok,source}]).slice(-20);
    AD.events.push({t:now,id,ok:!!ok,source,linked}); AD.events=AD.events.slice(-400);
    linked.forEach(lid=>{if(lid!==id){const lr=rec(lid);lr.introduced=true;lr.seen=(lr.seen||0)+1;if(!ok){lr.wrong=(lr.wrong||0)+1;lr.lapses=(lr.lapses||0)+1;lr.lastWrong=now;lr.stability=Math.max(.25,(lr.stability||.55)*.72);lr.due=Math.min(lr.due||now,now+10*MIN)}else{lr.correct=(lr.correct||0)+1;if(!lr.last)lr.due=Math.min(lr.due||now,now+DAY)}}});
    touchStudy(); save();
  }
  function humanTime(ts){
    if(!ts)return "ahora"; const d=ts-Date.now();
    if(d<=0)return "ahora"; if(d<60*MIN)return `${Math.ceil(d/MIN)} min`; if(d<DAY)return `${Math.ceil(d/(60*MIN))} h`; return `${Math.ceil(d/DAY)} d`;
  }
  function cardLabel(item){
    if(item.kind==="vocab")return `${item.front} · ${item.back}`;
    if(item.kind==="quiz")return item.q.q;
    return `Comprensión U${item.ui+1}: ${item.q.q}`;
  }
  function metrics(){
    seedIntroduced(); const items=allBank().filter(eligible), now=Date.now();
    const vocab=items.filter(x=>x.kind==="vocab"), due=items.filter(x=>rec(x.id).due<=now), errors=AD.events.filter(e=>!e.ok).slice(-50);
    const weak=vocab.map(i=>({item:i,r:rec(i.id),score:weakness(rec(i.id),now)})).filter(x=>x.r.introduced).sort((a,b)=>b.score-a.score);
    const avg=vocab.length?Math.round(vocab.reduce((a,i)=>a+memoryStrength(rec(i.id),now),0)/vocab.length):0;
    return {items,vocab,due,errors,weak,avg};
  }

  const oldMarkDone=markDone;
  markDone=function(ui,id,xpValue=8){oldMarkDone(ui,id,xpValue);if(id==="vocab1"||id==="vocab2"){const u=QA.units[ui],mid=Math.ceil(u.vocab.length/2),range=id==="vocab1"?[0,mid]:[mid,u.vocab.length];for(let wi=range[0];wi<range[1];wi++){const r=rec(`v:${ui}:${wi}`);if(!r.introduced){r.introduced=true;r.stability=.45;r.due=Date.now()+10*MIN;}}save();}};

  runUnitQuiz=function(ui){
    const u=QA.units[ui],qs=u.quiz;let qi=0,score=0,answered=false,sel=null;
    modal.classList.remove("hidden");
    function paint(){const q=qs[qi];modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><div class="progress"><i style="width:${qi/qs.length*100}%"></i></div><b>${qi+1}/${qs.length}</b></div><section class="question-card"><div class="kicker" style="color:var(--brand)">Control de unidad · motor adaptativo activo</div><h3>${esc(q.q)}</h3><div class="opts">${q.opts.map((o,i)=>`<button class="opt" data-o="${i}">${esc(o)}</button>`).join("")}</div><div id="fb"></div><button id="quizNext" class="primary full" disabled>Comprobar</button></section></div>`;document.querySelector("#closeM").onclick=closeModal;sel=null;answered=false;const next=document.querySelector("#quizNext"),fb=document.querySelector("#fb");document.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(answered)return;sel=+b.dataset.o;document.querySelectorAll(".opt").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");next.disabled=false});next.onclick=()=>{if(!answered){answered=true;const ok=sel===q.a;if(ok)score++;else state.hearts=Math.max(0,state.hearts-1);adaptiveRecord(`q:${ui}:${qi}`,ok,"control-unidad",linkedVocab(ui,q));fb.className=`feedback ${ok?"ok":"bad"}`;fb.innerHTML=ok?"✓ Correcto":`✕ Respuesta: ${esc(q.opts[q.a])}<br><small>Este error entra al banco de práctica y reaparecerá antes.</small>`;next.textContent=qi===qs.length-1?"Ver resultado":"Continuar";return}if(qi<qs.length-1){qi++;paint()}else finish()}};
    function finish(){const pass=score>=5;if(pass){state.unitPass[ui]=true;markDone(ui,"check",20)}modal.innerHTML=`<div class="shell"><div class="trophy">${pass?"🏆":"📚"}</div><h2 class="${pass?"pass":"fail"}">${score}/${qs.length}</h2><p>${pass?"Unidad aprobada.":"Necesitás 5/6. Los errores ya fueron incorporados a Práctica inteligente."}</p><button id="back" class="primary full">Volver</button></div>`;document.querySelector("#back").onclick=()=>{closeModal();renderLearn()}} paint();
  };

  openComprehension=function(ui){
    const u=QA.units[ui];let qi=0,score=0,answered=false;
    modal.classList.remove("hidden");
    function paint(){const q=u.comp[qi];modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><div class="progress"><i style="width:${qi/u.comp.length*100}%"></i></div></div>${qi===0?`<section class="dialogue"><h3>🎧 Diálogo</h3><p class="note">La síntesis de voz sigue siendo aproximada. Tus respuestas sí alimentan el motor adaptativo.</p>${u.dialogue.map((d,i)=>`<div class="line"><div class="speaker">${esc(d[0])}</div><div class="native">${esc(d[1])} <button class="audio-btn" data-line="${i}">🔊</button></div><div class="translation">${esc(d[2])}</div></div>`).join("")}</section>`:""}<section class="question-card"><div class="kicker" style="color:var(--brand)">Comprensión ${qi+1}/${u.comp.length}</div><h3>${esc(q.q)}</h3><div class="opts">${q.opts.map((o,i)=>`<button class="opt" data-o="${i}">${esc(o)}</button>`).join("")}</div><div id="fb"></div><button id="nextQ" class="primary full" disabled>Comprobar</button></section></div>`;document.querySelector("#closeM").onclick=closeModal;document.querySelectorAll("[data-line]").forEach(b=>b.onclick=()=>speak(u.dialogue[+b.dataset.line][1]));let sel=null;const next=document.querySelector("#nextQ"),fb=document.querySelector("#fb");document.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(answered)return;sel=+b.dataset.o;document.querySelectorAll(".opt").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");next.disabled=false});next.onclick=()=>{if(!answered){answered=true;const ok=sel===q.a;if(ok)score++;adaptiveRecord(`c:${ui}:${qi}`,ok,"comprension");fb.className=`feedback ${ok?"ok":"bad"}`;fb.textContent=ok?"✓ Correcto":"✕ Revisá el diálogo: "+q.opts[q.a];next.textContent=qi===u.comp.length-1?"Terminar":"Continuar";return}if(qi<u.comp.length-1){qi++;answered=false;paint()}else{markDone(ui,"listen",10);modal.innerHTML=`<div class="shell"><div class="trophy">🎧</div><h2>${score}/${u.comp.length} correctas</h2><p>Comprensión completada. Los ítems débiles quedaron programados para repaso.</p><button id="back" class="primary full">Volver</button></div>`;document.querySelector("#back").onclick=()=>{closeModal();renderLearn()}}}} paint();
  };

  function chooseSession(mode="smart",size=AD.settings.sessionSize||10){
    const m=metrics(), now=Date.now(); let pool=m.items;
    if(mode==="errors") pool=pool.filter(i=>rec(i.id).wrong>0);
    if(mode==="weak") pool=pool.filter(i=>i.kind==="vocab"&&rec(i.id).introduced);
    if(mode==="due") pool=pool.filter(i=>rec(i.id).due<=now);
    pool=[...pool].sort((a,b)=>priority(b,mode)-priority(a,mode));
    const selected=[]; const byUnit=new Map();
    for(const item of pool){if(selected.length>=size)break;const n=byUnit.get(item.ui)||0;if(n>=3&&pool.length>size)continue;selected.push(item);byUnit.set(item.ui,n+1)}
    if(selected.length<size){for(const item of pool){if(selected.length>=size)break;if(!selected.some(x=>x.id===item.id))selected.push(item)}}
    return selected;
  }
  function vocabOpts(item,direction){
    const pool=allBank().filter(x=>x.kind==="vocab"&&x.id!==item.id&&eligible(x));
    const correct=direction==="toES"?item.back:item.front;
    const vals=shuffle(pool).map(x=>direction==="toES"?x.back:x.front).filter((v,i,a)=>v!==correct&&a.indexOf(v)===i).slice(0,3);
    return shuffle([correct,...vals]);
  }
  function runAdaptiveSession(mode="smart"){
    const session=chooseSession(mode); if(!session.length){alert("Todavía no hay material elegible para esta práctica. Completá primero una microlección de vocabulario o un control.");return}
    let qi=0,score=0,answered=false,missed=[]; const start=Date.now();
    modal.classList.remove("hidden");
    function paint(){
      const item=session[qi],r=rec(item.id);let prompt="",opts=[],correct="",audioText=null,context="";
      if(item.kind==="vocab"){
        const variant=(r.seen+qi)%3;
        if(variant===0){prompt=`¿Qué significa «${item.front}»?`;opts=vocabOpts(item,"toES");correct=item.back}
        else if(variant===1){prompt=`¿Cómo se dice «${item.back}»?`;opts=vocabOpts(item,"toQU");correct=item.front}
        else{prompt="Escuchá y elegí el significado";opts=vocabOpts(item,"toES");correct=item.back;audioText=item.front}
      }else if(item.kind==="quiz"){prompt=item.q.q;opts=item.q.opts;correct=item.q.opts[item.q.a]}
      else{prompt=item.q.q;opts=item.q.opts;correct=item.q.opts[item.q.a];context=`<details class="adaptive-context"><summary>Ver contexto del diálogo</summary>${item.dialogue.map((d,i)=>`<div class="line"><b>${esc(d[0])}</b>: ${esc(d[1])} <button class="audio-btn" data-adline="${i}">🔊</button></div>`).join("")}</details>`}
      modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><div class="progress"><i style="width:${qi/session.length*100}%"></i></div><b>${qi+1}/${session.length}</b></div><section class="question-card"><div class="adaptive-meta"><span>${item.kind==="vocab"?"🧠 palabra":item.kind==="quiz"?"🧩 estructura":"🎧 comprensión"}</span><span>memoria ${memoryStrength(r)}%</span></div>${audioText?`<button id="adaptiveAudio" class="big-audio">🔊</button>`:""}<h3>${esc(prompt)}</h3>${context}<div class="opts">${opts.map((o,i)=>`<button class="opt" data-o="${i}" data-value="${esc(o)}">${esc(o)}</button>`).join("")}</div><div id="fb"></div><button id="adNext" class="primary full" disabled>Comprobar</button></section></div>`;
      document.querySelector("#closeM").onclick=closeModal;if(audioText){document.querySelector("#adaptiveAudio").onclick=()=>speak(audioText,.62);setTimeout(()=>speak(audioText,.62),100)}if(item.kind==="comp")document.querySelectorAll("[data-adline]").forEach(b=>b.onclick=()=>speak(item.dialogue[+b.dataset.adline][1],.64));let sel=null;answered=false;const next=document.querySelector("#adNext"),fb=document.querySelector("#fb");document.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(answered)return;sel=b.dataset.value;document.querySelectorAll(".opt").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");next.disabled=false});next.onclick=()=>{if(!answered){answered=true;const ok=sel===correct;if(ok)score++;else{missed.push(item.id);if(!item._retry&&!session.slice(qi+1).some(x=>x.id===item.id))session.push({...item,_retry:true})}adaptiveRecord(item.id,ok,"practica-"+mode,item.kind==="quiz"?linkedVocab(item.ui,item.q):[]);fb.className=`feedback ${ok?"ok":"bad"}`;fb.innerHTML=ok?`✓ Correcto · próximo repaso: ${humanTime(rec(item.id).due)}`:`✕ ${esc(correct)}<br><small>Reaparece antes: ${humanTime(rec(item.id).due)}</small>`;next.textContent=qi===session.length-1?"Ver resultado":"Continuar";return}if(qi<session.length-1){qi++;paint()}else finish()};
    }
    function finish(){AD.sessions.push({t:start,end:Date.now(),mode,total:session.length,score,missed});AD.sessions=AD.sessions.slice(-60);save();modal.innerHTML=`<div class="shell"><div class="trophy">${score/session.length>=.8?"🎯":"🧠"}</div><h2>${score}/${session.length}</h2><p>${missed.length?`${missed.length} ítems quedan reforzados en la cola de memoria.`:"Sesión limpia. Los intervalos de las respuestas correctas se ampliaron."}</p><div class="adaptive-summary"><div><b>${metrics().due.length}</b><small>vencidos ahora</small></div><div><b>${metrics().weak.filter(x=>x.score>.42).length}</b><small>palabras débiles</small></div></div><button id="adBack" class="primary full">Volver a práctica</button></div>`;document.querySelector("#adBack").onclick=()=>{closeModal();render("practice")}}
    paint();
  }

  function playOpenAudio(sample,button){
    const a=new Audio(audioUrl(sample.file));button.disabled=true;button.textContent="⏳";a.oncanplay=()=>{button.textContent="🔊";button.disabled=false};a.onerror=()=>{button.textContent="No disponible";button.disabled=false};a.play().catch(()=>{button.textContent="▶ Escuchar";button.disabled=false});
  }

  renderPractice=function(){
    if(state.lang!=="qu"){renderOther();return}
    const m=metrics(), weakTop=m.weak.slice(0,6), recent=AD.events.filter(e=>!e.ok).slice(-6).reverse(), map=bankMap();
    const strong=m.vocab.filter(i=>memoryStrength(rec(i.id))>=80).length, learning=m.vocab.filter(i=>{const x=memoryStrength(rec(i.id));return x>=50&&x<80}).length, atRisk=m.vocab.filter(i=>memoryStrength(rec(i.id))<50).length;
    screen.innerHTML=`<section class="hero"><div class="kicker">Fase 2 · motor pedagógico</div><h1>🎯 Práctica inteligente</h1><p>STS/SRS: repetición espaciada + banco de errores + palabras débiles. La sesión se arma según tu memoria estimada, no al azar.</p><div class="badge-row"><span class="hero-badge">${m.due.length} para hoy</span><span class="hero-badge">memoria media ${m.avg}%</span></div></section>
    <div class="adaptive-summary"><div><b>${m.due.length}</b><small>vencidos</small></div><div><b>${weakTop.filter(x=>x.score>.42).length}</b><small>débiles</small></div><div><b>${recent.length}</b><small>errores recientes</small></div><div><b>${AD.sessions.length}</b><small>sesiones</small></div></div>
    <section class="smart-card"><div><div class="kicker" style="color:var(--brand)">Recomendado</div><h3>🧠 Sesión inteligente</h3><p>Prioriza vencidos, errores y recuerdos cerca del umbral de olvido; mezcla vocabulario, estructura y comprensión.</p></div><button id="smartStart" class="primary full">Empezar ${AD.settings.sessionSize||10} ejercicios</button></section>
    <div class="practice-modes"><button data-mode="due"><b>⏰ Vencidos</b><small>${m.due.length} ítems</small></button><button data-mode="errors"><b>🩹 Errores</b><small>corregir lapsos</small></button><button data-mode="weak"><b>🧱 Débiles</b><small>solo vocabulario</small></button></div>
    <section class="card"><h3>Mapa de memoria</h3><div class="memory-stack"><span class="strong" style="flex:${Math.max(1,strong)}">${strong} fuertes</span><span class="learning" style="flex:${Math.max(1,learning)}">${learning} aprendiendo</span><span class="risk" style="flex:${Math.max(1,atRisk)}">${atRisk} en riesgo</span></div><p class="note">La fuerza cae con el tiempo. Un acierto amplía el intervalo; un error reduce estabilidad y agenda un repaso cercano.</p></section>
    <section class="card"><h3>Palabras débiles</h3>${weakTop.length?weakTop.map(x=>`<div class="weak-row"><div><b>${esc(x.item.front)}</b><small>${esc(x.item.back)}</small></div><div class="weak-meter"><i style="width:${memoryStrength(x.r)}%"></i></div><span>${memoryStrength(x.r)}%</span></div>`).join(""):'<p class="note">Todavía no hay palabras introducidas. Empezá una unidad.</p>'}</section>
    <section class="card"><h3>Errores recientes</h3>${recent.length?recent.map(e=>{const it=map.get(e.id);return`<div class="error-row"><span>↻</span><div><b>${esc(it?cardLabel(it):e.id)}</b><small>${new Date(e.t).toLocaleDateString()} · ${esc(e.source)}</small></div></div>`}).join(""):'<p class="note">Todavía no hay errores registrados por el motor.</p>'}</section>
    <section class="card"><h3>🎙️ Audio humano abierto · experimental</h3><p class="note">Estas muestras no sustituyen aún el audio del curso. Son grabaciones identificadas como Quechua de Puno (qxp) y se incorporan como referencia fonética complementaria.</p>${OPEN_AUDIO.map((a,i)=>`<div class="audio-open-row"><div><b>${esc(a.label)}</b><small>${esc(a.note)}</small></div><button class="audio-btn" data-open-audio="${i}">▶</button><a href="${a.source}" target="_blank" rel="noopener">fuente</a></div>`).join("")}</section>`;
    document.querySelector("#smartStart").onclick=()=>runAdaptiveSession("smart");document.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>runAdaptiveSession(b.dataset.mode));document.querySelectorAll("[data-open-audio]").forEach(b=>b.onclick=()=>playOpenAudio(OPEN_AUDIO[+b.dataset.openAudio],b));
  };

  const oldProfile=renderProfile;
  renderProfile=function(){oldProfile();if(state.lang!=="qu")return;const m=metrics();const sec=document.createElement("section");sec.className="card";sec.innerHTML=`<h3>🧠 Memoria adaptativa</h3><div class="skill-grid"><div class="skill"><b>${m.avg}%</b><small>fuerza media vocabulario</small></div><div class="skill"><b>${m.due.length}</b><small>repasos vencidos</small></div><div class="skill"><b>${m.weak.filter(x=>x.score>.42).length}</b><small>palabras débiles</small></div><div class="skill"><b>${AD.events.filter(e=>!e.ok).length}</b><small>errores registrados</small></div></div><p class="note">El motor guarda los datos solo en este dispositivo por ahora.</p><button id="goSmart" class="secondary full">Abrir práctica inteligente</button>`;screen.appendChild(sec);document.querySelector("#goSmart").onclick=()=>render("practice")};

  seedIntroduced();save();
  window.RaicesAdaptive={metrics,runAdaptiveSession,record:adaptiveRecord,bank:allBank};
})();