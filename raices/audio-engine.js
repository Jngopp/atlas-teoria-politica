/* Raíces · Fase de voz: audio humano abierto + voces del sistema + fallback fonético */
(function(){
  if(!window.state || !window.speechSynthesis && !window.Audio) return;
  state.audio ??= {mode:"auto",speed:"normal",human:true,showToast:true};

  const CFG={
    qu:{name:"Quechua",native:["qu-PE","qu"],fallback:["es-PE","es-BO","es-419","es"],note:"Quechua sureño/Collao. q, aspiradas y eyectivas no pueden reproducirse fielmente con una voz española."},
    ay:{name:"Aymara",native:["ay-BO","ay-PE","ay"],fallback:["es-BO","es-PE","es-419","es"],note:"Aimara sureño. Las series simple/aspirada/glotalizada pierden contraste en un TTS español."},
    gn:{name:"Guaraní",native:["gn-PY","gn"],fallback:["es-PY","es-AR","es-419","es"],note:"Guaraní paraguayo. y/ỹ, nasalidad y la oclusión glotal reciben una aproximación cuando no hay voz guaraní."},
    arn:{name:"Mapuzugun",native:["arn-CL","arn"],fallback:["es-CL","es-AR","es-419","es"],note:"Mapuzugun. ü, ng y realizaciones de tr/r varían y el fallback castellano es solamente pedagógico."}
  };

  const HUMAN={
    qu:{
      "yupay":{file:"LL-Q7260479 (qxp)-Elwinlhq-yupay.wav",speaker:"Elwinlhq",variety:"Quechua de Puno (qxp)",license:"CC0"},
      "k'aqnay":{file:"LL-Q7260479 (qxp)-Elwinlhq-k'aqnay.wav",speaker:"Elwinlhq",variety:"Quechua de Puno (qxp)",license:"CC0"},
      "mankhay":{file:"LL-Q7260479 (qxp)-Elwinlhq-mankhay.wav",speaker:"Elwinlhq",variety:"Quechua de Puno (qxp)",license:"CC0"}
    }
  };

  const EXTERNAL={
    qu:[{label:"Lingua Libre · Quechua de Puno",url:"https://commons.wikimedia.org/wiki/Category:Lingua_Libre_pronunciation-qxp",open:true}],
    ay:[{label:"Aymara.org · materiales con audio",url:"https://aymara.org/webarchives/www2003/arusa/intro.php",open:false}],
    gn:[{label:"Guaraní con Ali · pronunciaciones",url:"https://www.idiomaguarani.com.py/",open:false},{label:"Forvo · Guaraní paraguayo",url:"https://es.forvo.com/languages/gn/",open:false}],
    arn:[{label:"Curso Mapuzugun · pronunciación",url:"https://lonkokilapang.cl/curso/Leccion3/leccion3.htm",open:false},{label:"Forvo · Mapudungun",url:"https://forvo.com/languages/arn/",open:false}]
  };

  let voices=[];
  function loadVoices(){try{voices=speechSynthesis.getVoices()||[]}catch(e){voices=[]}}
  loadVoices();
  if("speechSynthesis" in window){speechSynthesis.addEventListener?.("voiceschanged",loadVoices);speechSynthesis.onvoiceschanged=loadVoices}

  function key(s){return String(s||"").toLowerCase().trim().replace(/[¿?¡!.,;:]+$/g,"").replace(/\s+/g," ")}
  function humanUrl(file){return "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+encodeURIComponent(file).replace(/%2F/g,"/")}
  function voiceFor(tags){
    loadVoices();const lowered=tags.map(x=>x.toLowerCase());
    return voices.find(v=>lowered.includes((v.lang||"").toLowerCase())) || voices.find(v=>lowered.some(t=>(v.lang||"").toLowerCase().startsWith(t.split("-")[0]+"-"))) || null;
  }
  function codeFromLang(l){l=String(l||"").toLowerCase();if(l.startsWith("qu"))return"qu";if(l.startsWith("ay"))return"ay";if(l.startsWith("gn"))return"gn";if(l.startsWith("arn"))return"arn";return state.lang||"qu"}

  function phonetic(text,code){
    let s=String(text||"").normalize("NFC").replace(/[’‘]/g,"'");
    if(code==="qu"){
      s=s.replace(/ch'/gi,"ch-").replace(/q'/gi,"k-").replace(/k'/gi,"k-").replace(/p'/gi,"p-").replace(/t'/gi,"t-")
         .replace(/qh/gi,"kj").replace(/kh/gi,"kj").replace(/ph/gi,"pj").replace(/th/gi,"tj").replace(/chh/gi,"chj").replace(/q/gi,"k");
    }else if(code==="ay"){
      s=s.replace(/ch'/gi,"ch-").replace(/q'/gi,"k-").replace(/k'/gi,"k-").replace(/p'/gi,"p-").replace(/t'/gi,"t-")
         .replace(/qh/gi,"kj").replace(/kh/gi,"kj").replace(/ph/gi,"pj").replace(/th/gi,"tj").replace(/x/gi,"j").replace(/q/gi,"k");
    }else if(code==="gn"){
      s=s.replace(/g̃/gi,"ng").replace(/ỹ/gi,"ün").replace(/ã/gi,"an").replace(/ẽ/gi,"en").replace(/ĩ/gi,"in").replace(/õ/gi,"on").replace(/ũ/gi,"un")
         .replace(/y/gi,"ü").replace(/j/gi,"y").replace(/h/gi,"j").replace(/'/g,"-");
    }else if(code==="arn"){
      s=s.replace(/tx/gi,"ch").replace(/tr/gi,"chr").replace(/lh/gi,"ll").replace(/ü/gi,"u").replace(/'/g,"-");
    }
    return s.replace(/\s+/g," ").trim();
  }

  function toast(msg){
    if(state.audio.showToast===false)return;let t=document.querySelector("#audioToast");if(!t){t=document.createElement("div");t.id="audioToast";t.className="audio-toast";document.body.appendChild(t)}t.textContent=msg;t.classList.add("show");clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove("show"),1800)
  }
  function playHuman(sample){
    try{speechSynthesis.cancel()}catch(e){};const a=new Audio(humanUrl(sample.file));a.play().then(()=>toast(`🎙️ Voz humana · ${sample.variety} · ${sample.license}`)).catch(()=>toast("No se pudo cargar la grabación humana; uso la voz automática."));return a;
  }

  function choose(code,text){
    const cfg=CFG[code]||CFG.qu, exact=HUMAN[code]?.[key(text)];
    if(state.audio.mode==="auto" && state.audio.human!==false && exact)return{kind:"human",sample:exact};
    const nv=voiceFor(cfg.native);
    if(state.audio.mode!=="phonetic" && nv)return{kind:"native-system",voice:nv,text:String(text),lang:nv.lang};
    if(state.audio.mode==="original")return{kind:"original-system",voice:null,text:String(text),lang:cfg.native[0]};
    const fv=voiceFor(cfg.fallback);return{kind:"phonetic",voice:fv,text:phonetic(text,code),lang:fv?.lang||cfg.fallback[0]};
  }

  function speakSmart(text,code=state.lang,rate=.72){
    code=CFG[code]?code:"qu";const pick=choose(code,text);
    if(pick.kind==="human")return playHuman(pick.sample);
    if(!("speechSynthesis" in window)){toast("Este navegador no ofrece síntesis de voz.");return}
    const u=new SpeechSynthesisUtterance(pick.text);u.lang=pick.lang;u.rate=(state.audio.speed==="slow"?.58:rate);u.pitch=1;u.volume=1;if(pick.voice)u.voice=pick.voice;
    speechSynthesis.cancel();ORIGINAL_SPEAK(u);
    if(pick.kind==="native-system")toast(`🔊 ${CFG[code].name} · ${pick.voice.name}`);
    else if(pick.kind==="phonetic")toast(`🔊 Aproximación fonética · ${pick.lang}`);
    else toast(`🔊 Voz del sistema · ${pick.lang}`);
    return u;
  }

  const ORIGINAL_SPEAK=("speechSynthesis" in window)?speechSynthesis.speak.bind(speechSynthesis):()=>{};
  if("speechSynthesis" in window){
    try{
      speechSynthesis.speak=function(u){
        const code=codeFromLang(u.lang),pick=choose(code,u.text);
        if(pick.kind==="human"){playHuman(pick.sample);return}
        const nu=new SpeechSynthesisUtterance(pick.text);nu.lang=pick.lang;nu.rate=state.audio.speed==="slow"?.58:(u.rate||.72);nu.pitch=u.pitch||1;nu.volume=u.volume??1;if(pick.voice)nu.voice=pick.voice;
        ORIGINAL_SPEAK(nu);
        if(pick.kind==="native-system")toast(`🔊 ${CFG[code].name} · ${pick.voice.name}`);else if(pick.kind==="phonetic")toast(`🔊 Aproximación fonética · ${pick.lang}`);
      };
    }catch(e){}
  }
  window.speak=function(text,rate=.68){return speakSmart(text,state.lang,rate)};

  function status(code){
    const cfg=CFG[code],nv=voiceFor(cfg.native),fv=voiceFor(cfg.fallback);
    return{native:nv?`${nv.name} · ${nv.lang}`:null,fallback:fv?`${fv.name} · ${fv.lang}`:(cfg.fallback[0]+" solicitado"),human:Object.keys(HUMAN[code]||{}).length};
  }
  function soundGuide(code){
    const rows={
      qu:[["q","oclusiva uvular; k articulada más atrás"],["qh / kh / ph / th","consonantes aspiradas"],["q' / k' / p' / t' / ch'","eyectivas: cierre glotal + consonante"]],
      ay:[["q","uvular, más atrás que k"],["ph/th/kh/qh","serie aspirada"],["p'/t'/k'/q'","serie glotalizada/eyectiva"]],
      gn:[["y","vocal central, no la y consonántica española"],["ỹ / ã / ẽ / ĩ / õ / ũ","vocales nasales"],["'","oclusión glotal"],["mb / nd / ng","secuencias prenasalizadas frecuentes"]],
      arn:[["ü","vocal central/no redondeada según variedad"],["ng","nasal velar"],["tr","realización característica con variación territorial"],["r","no asumir automáticamente la r española"]]
    }[code];return rows;
  }

  function openSettings(){
    const code=state.lang, cfg=CFG[code],st=status(code),rows=soundGuide(code),samples=Object.entries(HUMAN[code]||{}),sources=EXTERNAL[code]||[];
    modal.classList.remove("hidden");modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeAudio">×</button><div><div class="kicker" style="color:var(--brand)">Audio · ${esc(cfg.name)}</div><b>Voz y pronunciación</b></div></div>
      <section class="audio-status-card"><h3>${st.native?"✅ Voz del idioma detectada":"🟡 Sin voz nativa del sistema"}</h3><p>${st.native?esc(st.native):`Raíces usa una aproximación fonética con ${esc(st.fallback)}.`}</p><p class="note">${esc(cfg.note)}</p></section>
      <section class="card"><h3>Modo de voz</h3><label class="audio-option"><input type="radio" name="audioMode" value="auto" ${state.audio.mode==="auto"?"checked":""}><span><b>Automático · recomendado</b><small>voz humana abierta → voz nativa del sistema → español fonetizado</small></span></label><label class="audio-option"><input type="radio" name="audioMode" value="original" ${state.audio.mode==="original"?"checked":""}><span><b>Ortografía original</b><small>manda el texto indígena tal cual al sintetizador</small></span></label><label class="audio-option"><input type="radio" name="audioMode" value="phonetic" ${state.audio.mode==="phonetic"?"checked":""}><span><b>Forzar aproximación fonética</b><small>usa voz castellana regional con transcripción pedagógica</small></span></label><label class="audio-check"><input id="audioSlow" type="checkbox" ${state.audio.speed==="slow"?"checked":""}> Hablar lento</label><label class="audio-check"><input id="audioHuman" type="checkbox" ${state.audio.human!==false?"checked":""}> Priorizar grabaciones humanas abiertas</label><button id="testAudio" class="primary full">🔊 Probar «${esc(testPhrase(code))}»</button></section>
      <section class="card"><h3>Cómo escuchar los sonidos difíciles</h3>${rows.map(r=>`<div class="sound-row"><b>${esc(r[0])}</b><span>${esc(r[1])}</span></div>`).join("")}<p class="note">La transcripción al español es un apoyo de inteligibilidad, no una equivalencia fonética exacta ni debe usarse para calificar pronunciación.</p></section>
      ${samples.length?`<section class="card"><h3>🎙️ Grabaciones humanas abiertas</h3><p class="note">Muestras CC0 de Lingua Libre/Wikimedia. Se reproducen antes que TTS cuando coincide exactamente la forma.</p>${samples.map(([w,s],i)=>`<div class="human-audio-row"><div><b>${esc(w)}</b><small>${esc(s.variety)} · ${esc(s.speaker)} · ${esc(s.license)}</small></div><button class="audio-btn" data-human="${i}">▶</button></div>`).join("")}</section>`:""}
      <section class="card"><h3>Fuentes humanas encontradas</h3>${sources.map(s=>`<a class="audio-source-link" href="${s.url}" target="_blank" rel="noopener"><b>${esc(s.label)}</b><small>${s.open?"licencia abierta verificada en las muestras usadas":"referencia externa; no redistribuida por falta de licencia abierta verificada"}</small></a>`).join("")}</section>
      <button id="closeAudio2" class="secondary full">Volver</button></div>`;
    document.querySelector("#closeAudio").onclick=closeModal;document.querySelector("#closeAudio2").onclick=closeModal;
    document.querySelectorAll("[name=audioMode]").forEach(r=>r.onchange=()=>{state.audio.mode=r.value;save()});document.querySelector("#audioSlow").onchange=e=>{state.audio.speed=e.target.checked?"slow":"normal";save()};document.querySelector("#audioHuman").onchange=e=>{state.audio.human=e.target.checked;save()};document.querySelector("#testAudio").onclick=()=>speakSmart(testPhrase(code),code,.68);
    const vals=samples.map(x=>x[1]);document.querySelectorAll("[data-human]").forEach(b=>b.onclick=()=>playHuman(vals[+b.dataset.human]));
  }
  function testPhrase(code){return{qu:"Rimaykullayki",ay:"Kamisaraki?",gn:"Mba'éichapa?",arn:"Mari mari"}[code]}

  function injectButton(){
    const stats=document.querySelector(".stats");if(!stats||document.querySelector("#audioSettingsBtn"))return;const b=document.createElement("button");b.id="audioSettingsBtn";b.className="audio-settings-btn";b.title="Configurar voz y pronunciación";b.textContent="🔊";b.onclick=openSettings;stats.prepend(b)
  }
  injectButton();
  window.RaicesAudio={speak:speakSmart,status,phonetic,openSettings,human:HUMAN,config:CFG};
})();