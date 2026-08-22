/* Raíces · feedback sonoro + corrección obligatoria */
(function(){
  if(typeof state==="undefined") return;
  state.feedbackSfx ??= true;

  let audioCtx=null;
  function ensureAudio(){
    if(!state.feedbackSfx) return null;
    try{
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(!Ctx) return null;
      audioCtx ??= new Ctx();
      if(audioCtx.state==="suspended") audioCtx.resume().catch(()=>{});
      return audioCtx;
    }catch(e){return null}
  }
  function tone(freq,start,duration,gain=.045,type="sine"){
    const c=ensureAudio();if(!c)return;
    const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;
    g.gain.setValueAtTime(0.0001,c.currentTime+start);
    g.gain.exponentialRampToValueAtTime(gain,c.currentTime+start+.015);
    g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+start+duration);
    o.connect(g);g.connect(c.destination);o.start(c.currentTime+start);o.stop(c.currentTime+start+duration+.02);
  }
  function good(){tone(523.25,0,.10,.045);tone(659.25,.09,.11,.04);tone(783.99,.18,.16,.035)}
  function bad(){tone(220,0,.13,.05,"triangle");tone(164.81,.12,.20,.045,"triangle")}

  const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[¡!¿?,.;:]/g,"").replace(/\s+/g," ").trim();
  function feedbackIn(scope){return scope.querySelector(".feedback.ok,.feedback.bad,#fb.feedback,#mfb.feedback,#bfb.feedback,#buildFeedback.feedback")}
  function answerFromFeedback(fb,opts=[]){
    const bold=fb.querySelector("b");
    if(bold && /modelo|respuesta/i.test(fb.textContent||"")) return bold.textContent.trim();
    let first=(fb.innerText||fb.textContent||"").split(/\n/)[0].trim();
    first=first.replace(/^[✕×❌]\s*/,"")
      .replace(/^respuesta\s*:\s*/i,"")
      .replace(/^modelo(?:\s+esperado)?\s*:\s*/i,"")
      .replace(/^revis[aá]\s+el\s+di[aá]logo\s*:\s*/i,"")
      .replace(/^correcta?\s*:\s*/i,"").trim();
    if(opts.length){
      const nf=norm(first);
      const exact=opts.find(o=>norm(o.textContent)===nf);if(exact)return exact.textContent.trim();
      const inside=opts.find(o=>nf.includes(norm(o.textContent))||norm(o.textContent).includes(nf));if(inside)return inside.textContent.trim();
    }
    return first;
  }
  function correctionMessage(fb,correct){
    fb.className="feedback bad retry-feedback";
    fb.innerHTML=`<b>✕ Respuesta correcta: ${typeof esc==="function"?esc(correct):correct}</b><span>Ahora completalo correctamente para poder continuar.</span>`;
  }
  function successMessage(fb){fb.className="feedback ok retry-feedback";fb.innerHTML="<b>✓ Ahora sí.</b><span>Corregiste el error. Ya podés continuar.</span>"}

  function setupChoiceRetry(scope,button,fb){
    const oldOptions=[...scope.querySelectorAll(".opt")];if(!oldOptions.length)return false;
    const correct=answerFromFeedback(fb,oldOptions);if(!correct)return false;
    const originalContinue=button.onclick;
    const wrap=oldOptions[0].parentElement;
    const clones=oldOptions.map(o=>{const n=o.cloneNode(true);o.replaceWith(n);return n});
    let selected=null;
    clones.forEach(o=>{
      o.classList.remove("selected");
      o.onclick=()=>{selected=o;clones.forEach(x=>x.classList.remove("selected"));o.classList.add("selected");button.disabled=false};
    });
    correctionMessage(fb,correct);
    button.dataset.retryManaged="1";button.textContent="Comprobar de nuevo";button.disabled=true;
    button.onclick=()=>{
      if(!selected)return;
      const ok=norm(selected.textContent)===norm(correct);
      if(!ok){bad();selected.classList.add("retry-wrong");correctionMessage(fb,correct);button.disabled=true;selected=null;return}
      good();clones.forEach(x=>x.disabled=true);selected.classList.add("retry-correct");successMessage(fb);button.textContent="Continuar";button.disabled=false;
      button.onclick=()=>{delete button.dataset.retryManaged;if(typeof originalContinue==="function")originalContinue.call(button)};
    };
    wrap?.classList.add("retry-active");return true;
  }

  function setupBuilderRetry(scope,button,fb){
    const answer=scope.querySelector("#ba,#sentenceAnswer,.builder-answer,.sentence-answer");if(!answer)return false;
    const correct=answerFromFeedback(fb,[]);if(!correct)return false;
    const originalContinue=button.onclick;
    correctionMessage(fb,correct);button.dataset.retryManaged="1";button.textContent="Comprobar de nuevo";
    function current(){
      const chips=[...answer.querySelectorAll("[data-ret],.answer-chip,.builder-chip")];
      return chips.map(x=>x.textContent.trim()).join(" ").trim();
    }
    button.onclick=()=>{
      const ok=norm(current())===norm(correct);
      if(!ok){bad();correctionMessage(fb,correct);return}
      good();successMessage(fb);button.textContent="Continuar";
      button.onclick=()=>{delete button.dataset.retryManaged;if(typeof originalContinue==="function")originalContinue.call(button)};
    };
    return true;
  }

  function inspect(trigger){
    const scope=trigger.closest(".question-card,.production-card,.shell")||document.querySelector("#modal")||document.body;
    const fb=feedbackIn(scope);if(!fb)return;
    if(fb.classList.contains("ok")){if(!trigger.dataset.feedbackPlayed){good();trigger.dataset.feedbackPlayed="1"}return}
    if(!fb.classList.contains("bad"))return;
    if(trigger.dataset.retryManaged)return;
    bad();trigger.dataset.feedbackPlayed="1";
    setupChoiceRetry(scope,trigger,fb)||setupBuilderRetry(scope,trigger,fb);
  }

  document.addEventListener("click",e=>{
    ensureAudio();
    const b=e.target.closest("button");if(!b)return;
    if(b.dataset.retryManaged)return;
    const isCheck=/comprobar/i.test(b.textContent||"") || ["quizNext","nextQ","mn","bc","checkBuild","fnext"].includes(b.id);
    const isImmediate=b.classList.contains("opt") && !b.closest(".question-card")?.querySelector("button[id*='next'],button[id='mn'],button[id='fnext'],button[id='quizNext'],button[id='nextQ']");
    if(isCheck||isImmediate)setTimeout(()=>inspect(b),0);
  },true);

  window.RaicesFeedback={good,bad};
})();