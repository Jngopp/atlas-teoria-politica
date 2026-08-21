/* Raíces · Fase 2B: modelo de conceptos y práctica lingüística dirigida */
(function(){
  if(!window.RaicesAdaptive || !window.QA1) return;
  const DAY=86400000;
  state.conceptModel ??= {version:1, events:[], settings:{conceptSessionSize:8}};
  const CM=state.conceptModel;
  CM.version=1; CM.events??=[]; CM.settings??={conceptSessionSize:8};

  const CONCEPTS={
    greetings:{label:"Saludos y cortesía",group:"Funciones",desc:"Abrir, sostener y cerrar intercambios sociales muy breves.",units:[0]},
    vowels3:{label:"Sistema a–i–u",group:"Pronunciación",desc:"Reconocer la escritura vocálica de tres vocales del quechua sureño.",units:[0]},
    q_uvular:{label:"q posterior / uvular",group:"Pronunciación",desc:"Distinguir q de k y no castellanizarla automáticamente.",units:[0,1,3,4,6]},
    asp_ejective:{label:"Aspiradas y eyectivas",group:"Pronunciación",desc:"Reconocer h aspirada y apóstrofo eyectivo en la variedad Collao.",units:[0,3,5,6,7],prereq:["q_uvular"]},
    pronouns:{label:"ñuqa · qam · pay",group:"Morfología",desc:"Pronombres personales singulares y ausencia de género en pay.",units:[0,1]},
    kay_person:{label:"kani · kanki · kan",group:"Morfología",desc:"Persona singular del verbo kay «ser/estar».",units:[1],prereq:["pronouns"]},
    topic_qa:{label:"Tópico -qa",group:"Discurso",desc:"Marcar el tópico del enunciado con -qa.",units:[1,2,3,6]},
    evidential_mi:{label:"Afirmativo/evidencial -mi/-m",group:"Discurso",desc:"Reconocer el patrón afirmativo -mi/-m en usos iniciales.",units:[0,1,2,3,4,5,6]},
    case_manta:{label:"Caso -manta · desde/de",group:"Casos",desc:"Origen o procedencia: Puno-manta, qhatu-manta.",units:[1,6]},
    case_pi:{label:"Caso -pi · en",group:"Casos",desc:"Ubicación concreta: Qusqu-pi, wasi-pi.",units:[1,3,6,7]},
    yuq:{label:"-yuq · que tiene",group:"Morfología",desc:"Expresar edad y composición de numerales con -yuq.",units:[1,4]},
    possessive:{label:"Posesión -y/-yki/-n",group:"Morfología",desc:"mi/tu/su incorporados al nombre.",units:[2,6],prereq:["pronouns"]},
    genitive_pa:{label:"Genitivo -pa",group:"Casos",desc:"Marcar al poseedor: Maria-pa wasi-n.",units:[2],prereq:["possessive"]},
    plural_kuna:{label:"Plural -kuna",group:"Morfología",desc:"Plural nominal y su omisión habitual después de numeral.",units:[2,4]},
    kinship:{label:"Parentesco perspectival",group:"Léxico y cultura",desc:"wawqi/pana/turi/ñaña según relación y hablante.",units:[2]},
    demonstratives:{label:"kay · chay · haqay",group:"Sintaxis",desc:"Demostrativos de proximidad, distancia media y lejanía.",units:[2,3]},
    adjective_order:{label:"Adjetivo + nombre",group:"Sintaxis",desc:"Orden básico: hatun wasi, puka punku.",units:[3]},
    existence_kan:{label:"Existencia con kan",group:"Sintaxis",desc:"Expresar presencia/existencia concreta: Wasipi tiyana kan.",units:[3],prereq:["case_pi"]},
    numerals:{label:"Numerales 1–20",group:"Léxico y estructura",desc:"Sistema decimal y composición 11–19.",units:[4]},
    quantity:{label:"hayk'a · cantidad",group:"Funciones",desc:"Preguntar y responder cantidades y precios simples.",units:[4],prereq:["numerals"]},
    object_ta:{label:"Objeto directo -ta",group:"Casos",desc:"Marcar el objeto: papa-ta mikhu-ni, t'anta-ta ranti-ni.",units:[4,5,7]},
    present_person:{label:"Presente -ni/-nki/-n",group:"Morfología verbal",desc:"Persona singular en verbos frecuentes.",units:[5,7],prereq:["pronouns"]},
    infinitive_munay:{label:"Acción + -ta + munay",group:"Morfología verbal",desc:"Expresar deseo de hacer algo: mikhuyta munani.",units:[5],prereq:["object_ta","present_person"]},
    negation_chu:{label:"mana(m)…-chu",group:"Sintaxis",desc:"Negación discontinua y preguntas sí/no con -chu.",units:[5],prereq:["present_person"]},
    imperative:{label:"Imperativo en -y",group:"Morfología verbal",desc:"Órdenes básicas: hamuy, riy, uyariy, qhaway.",units:[5,6]},
    case_man:{label:"Caso -man · hacia/a",group:"Casos",desc:"Destino y dirección: wasi-man, paña-man.",units:[6,7]},
    case_wan:{label:"Caso -wan · con",group:"Casos",desc:"Acompañamiento: mama-y-wan.",units:[6,7],prereq:["possessive"]},
    locative_question:{label:"maypi / maymanta",group:"Funciones",desc:"Preguntar ubicación y origen combinando may + caso + -taq.",units:[1,6],prereq:["case_pi","case_manta"]},
    directions:{label:"Dar direcciones",group:"Funciones",desc:"Combinar direccionales, lugares e imperativos.",units:[6],prereq:["case_man","imperative"]},
    sequence:{label:"ñawpaqta · chaymanta · hinaspa",group:"Discurso",desc:"Conectar acciones de una rutina simple.",units:[7],prereq:["present_person"]},
    additive_pas:{label:"-pas · también",group:"Discurso",desc:"Agregar información: ñuqapas «yo también».",units:[7]},
    suffix_stacking:{label:"Apilamiento de sufijos",group:"Morfología",desc:"Segmentar cadenas productivas: mama-y-wan, wasi-man, papa-ta mikhu-ni.",units:[6,7],prereq:["possessive","case_wan","object_ta"]},
    routine:{label:"Rutina cotidiana",group:"Funciones",desc:"Describir un día simple con tiempo + acción + secuencia.",units:[7],prereq:["present_person","sequence"]}
  };

  const QUIZ_TAGS=[
    [["greetings"],["vowels3"],["pronouns"],["asp_ejective"],["greetings"],["greetings"]],
    [["case_manta","locative_question"],["kay_person"],["case_pi","locative_question"],["case_manta"],["case_pi"],["pronouns"]],
    [["possessive"],["possessive"],["genitive_pa"],["plural_kuna","numerals"],["kinship"],["kinship"]],
    [["adjective_order"],["demonstratives"],["adjective_order"],["existence_kan","case_pi"],["asp_ejective"],["demonstratives"]],
    [["numerals"],["numerals"],["numerals","yuq"],["numerals","plural_kuna"],["quantity"],["object_ta"]],
    [["present_person"],["present_person"],["infinitive_munay"],["negation_chu"],["imperative"],["object_ta"]],
    [["case_man"],["case_manta"],["case_wan"],["locative_question","case_pi"],["directions","case_man","imperative"],["suffix_stacking","possessive","case_wan"]],
    [["sequence"],["routine"],["case_man","present_person"],["additive_pas"],["sequence"],["suffix_stacking","possessive","case_wan"]]
  ];
  const COMP_TAGS=[
    ["greetings"],["case_manta","case_pi","locative_question"],["kinship","possessive"],["demonstratives","adjective_order","existence_kan"],
    ["numerals","quantity","object_ta"],["present_person","object_ta","negation_chu"],["locative_question","directions","case_man"],["routine","sequence","present_person"]
  ];
  const UNIT_VOCAB_TAG=["greetings","pronouns","kinship","demonstratives","numerals","present_person","directions","routine"];

  function norm(s){return String(s||"").toLowerCase()}
  function unique(a){return [...new Set(a)]}
  function itemConcepts(item){
    let tags=[];
    if(item.kind==="quiz") tags=QUIZ_TAGS[item.ui]?.[item.qi]||[];
    if(item.kind==="comp") tags=COMP_TAGS[item.ui]||[];
    if(item.kind==="vocab"){
      tags=[UNIT_VOCAB_TAG[item.ui]];
      const w=norm(item.front);
      if(w.includes("q'")||w.includes("k'")||w.includes("p'")||w.includes("t'")||w.includes("ch'"))tags.push("asp_ejective");
      if(/qh|kh|ph|th|chh/.test(w))tags.push("asp_ejective");
      if(w.includes("q"))tags.push("q_uvular");
      if(["ñuqa","qam","pay"].includes(w))tags.push("pronouns");
      if(w.includes("-pi"))tags.push("case_pi"); if(w.includes("-man"))tags.push("case_man"); if(w.includes("-manta"))tags.push("case_manta"); if(w.includes("-wan"))tags.push("case_wan");
      if(w.includes("-kuna"))tags.push("plural_kuna"); if(w.includes("-pas"))tags.push("additive_pas");
    }
    return unique(tags.filter(Boolean));
  }
  const BANK=()=>RaicesAdaptive.bank();
  function itemById(id){return BANK().find(x=>x.id===id)}
  function eligible(item){
    const r=state.adaptive?.cards?.[item.id];
    if(item.kind==="vocab"){
      const u=QA.units[item.ui],mid=Math.ceil(u.vocab.length/2),micro=item.wi<mid?"vocab1":"vocab2";
      return !!state.qdone[qkey(item.ui,micro)]||!!state.unitPass[item.ui]||(r?.seen||0)>0;
    }
    if(item.kind==="quiz")return !!state.qdone[qkey(item.ui,"check")]||!!state.unitPass[item.ui]||(r?.seen||0)>0;
    if(item.kind==="comp")return !!state.qdone[qkey(item.ui,"listen")]||!!state.unitPass[item.ui]||(r?.seen||0)>0;
    return false;
  }
  function conceptItems(cid,onlyEligible=true){return BANK().filter(i=>itemConcepts(i).includes(cid)&&(!onlyEligible||eligible(i)))}
  function conceptIntroduced(cid){return CONCEPTS[cid].units.some(ui=>unitDoneCount(ui)>0)||conceptItems(cid,true).length>0}

  function mappedAdaptiveEvents(){
    return (state.adaptive?.events||[]).flatMap(e=>{
      const item=itemById(e.id); if(!item)return[];
      return itemConcepts(item).map(cid=>({t:e.t,ok:e.ok,cid,source:e.source,itemId:e.id}));
    });
  }
  function allConceptEvents(){return [...mappedAdaptiveEvents(),...(CM.events||[])].sort((a,b)=>a.t-b.t)}
  function estimate(cid){
    const ev=allConceptEvents().filter(e=>e.cid===cid); const introduced=conceptIntroduced(cid);
    if(!ev.length)return {cid,mastery:introduced?35:null,confidence:0,seen:0,wrong:0,last:null,status:introduced?"sin diagnóstico":"no introducido"};
    let p=.25; const guess=.25,slip=.10,learn=.08;
    for(const e of ev){
      if(e.ok){const den=p*(1-slip)+(1-p)*guess;p=den? p*(1-slip)/den:p;}
      else{const den=p*slip+(1-p)*(1-guess);p=den? p*slip/den:p;}
      p=p+(1-p)*learn;
    }
    const last=ev[ev.length-1].t,days=Math.max(0,(Date.now()-last)/DAY);p=.20+(p-.20)*Math.exp(-days/45);
    const seen=ev.length,wrong=ev.filter(e=>!e.ok).length,confidence=Math.round(100*(1-Math.exp(-seen/6)));
    let mastery=Math.round(p*100); const cap=Math.min(96,42+seen*7); mastery=Math.min(mastery,cap);
    const status=mastery>=80?"fuerte":mastery>=60?"en desarrollo":mastery>=45?"frágil":"débil";
    return {cid,mastery,confidence,seen,wrong,last,status};
  }
  function allEstimates(){return Object.keys(CONCEPTS).map(estimate)}
  function recentErrors(cid){return allConceptEvents().filter(e=>e.cid===cid&&!e.ok&&Date.now()-e.t<14*DAY).length}
  function blockedBy(cid){return (CONCEPTS[cid].prereq||[]).filter(p=>{const x=estimate(p);return x.mastery!=null&&x.mastery<55})}
  function priorityConcept(x){if(x.mastery==null)return -999;return (100-x.mastery)*.65+(100-x.confidence)*.18+recentErrors(x.cid)*5+blockedBy(x.cid).length*3}
  function recommendation(){
    const candidates=allEstimates().filter(x=>conceptIntroduced(x.cid)).sort((a,b)=>priorityConcept(b)-priorityConcept(a));
    return candidates[0]||null;
  }
  function reasonFor(x){
    if(!x)return "Completá una microlección para que el motor tenga evidencia.";
    const bits=[]; if(x.seen<3)bits.push("todavía hay poca evidencia"); if(x.wrong)bits.push(`${x.wrong} error${x.wrong===1?"":"es"} registrado${x.wrong===1?"":"s"}`); if((x.mastery??100)<50)bits.push("dominio estimado bajo"); if(recentErrors(x.cid))bits.push("fallos recientes");
    const blockers=blockedBy(x.cid); if(blockers.length)bits.push("depende de "+blockers.map(b=>CONCEPTS[b].label).join(", "));
    return bits.length?bits.join(" · "):"conviene consolidarlo antes de ampliar el intervalo";
  }
  function conceptRecord(cid,ok,source="concept-practice",itemId=null){
    CM.events.push({t:Date.now(),cid,ok:!!ok,source,itemId}); CM.events=CM.events.slice(-700); touchStudy(); save();
  }

  const DRILLS={
    case_pi:()=>({q:"Elegí la pieza que significa «en la casa».",opts:["wasi-pi","wasi-man","wasi-manta","wasi-wan"],a:0}),
    case_man:()=>({q:"Elegí la pieza que significa «hacia la casa».",opts:["wasi-man","wasi-pi","wasi-manta","wasi-wan"],a:0}),
    case_manta:()=>({q:"Elegí la pieza que significa «desde la casa».",opts:["wasi-manta","wasi-man","wasi-pi","wasi-wan"],a:0}),
    case_wan:()=>({q:"¿Cuál expresa «con mi madre»?",opts:["mama-y-wan","mama-y-man","mama-y-pi","mama-y-manta"],a:0}),
    object_ta:()=>({q:"Querés decir «como papa». ¿Qué forma marca el objeto?",opts:["papa-ta mikhu-ni","papa-pi mikhu-ni","papa-man mikhu-ni","papa-wan mikhu-ni"],a:0}),
    possessive:()=>({q:"¿Cuál serie significa «mi casa / tu casa / su casa»?",opts:["wasi-y / wasi-yki / wasi-n","wasi-ni / wasi-nki / wasi-n","wasi-pa / wasi-pi / wasi-man","wasi-kuna / wasi-ta / wasi-wan"],a:0}),
    genitive_pa:()=>({q:"¿Cómo construís «la casa de María»?",opts:["Maria-pa wasi-n","Maria-man wasi","Maria-ta wasi-y","Maria-pi wasi-kuna"],a:0}),
    present_person:()=>({q:"Completá: ñuqa mikhu-__ / qam mikhu-__ / pay mikhu-__",opts:["ni / nki / n","nki / ni / n","n / nki / ni","ni / n / nki"],a:0}),
    kay_person:()=>({q:"Completá: ñuqa __ / qam __ / pay __",opts:["kani / kanki / kan","kanki / kani / kan","kan / kanki / kani","kani / kan / kanki"],a:0}),
    negation_chu:()=>({q:"¿Cuál sigue el patrón A1 de «no como pan»?",opts:["Manam t'antata mikhunichu.","Mana t'antata mikhuni.","T'antata manam mikhuni.","Mikhunichu t'antata."],a:0}),
    demonstratives:()=>({q:"Ordená de más cercano a más lejano.",opts:["kay → chay → haqay","haqay → kay → chay","chay → haqay → kay","kay → haqay → chay"],a:0}),
    numerals:()=>({q:"¿Cómo se forma 12?",opts:["chunka iskayniyuq","iskay chunka","chunka iskaykuna","iskayniyuq chunka"],a:0}),
    sequence:()=>({q:"¿Cuál secuencia expresa «primero… después…»?",opts:["ñawpaqta … chaymanta …","chaymanta … ñawpaqta …","maypi … hinaspa …","mana … -chu"],a:0}),
    additive_pas:()=>({q:"En ñuqapas, -pas aporta…",opts:["también","negación","dirección","posesión"],a:0}),
    suffix_stacking:()=>({q:"Segmentá mamaywan.",opts:["mama + -y + -wan","mama + -ta + -man","mama + -pa + -pi","mama + -kuna"],a:0}),
    asp_ejective:()=>({q:"¿Qué signo representa una consonante eyectiva en la ortografía usada aquí?",opts:["apóstrofo ' ","tilde ´","diéresis ¨","guion -"],a:0}),
    vowels3:()=>({q:"¿Qué vocales usa la escritura estándar enseñada en este curso?",opts:["a, i, u","a, e, i, o, u","a, e, u","i, o, u"],a:0}),
    adjective_order:()=>({q:"¿Cuál es el orden básico para «casa grande»?",opts:["hatun wasi","wasi hatun","wasita hatun","hatun wasipi"],a:0})
  };

  function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
  function realQuestion(item){
    if(item.kind==="quiz")return {q:item.q.q,opts:item.q.opts,a:item.q.a,item};
    if(item.kind==="comp")return {q:item.q.q,opts:item.q.opts,a:item.q.a,item};
    if(item.kind==="vocab"){
      const pool=BANK().filter(x=>x.kind==="vocab"&&x.id!==item.id&&eligible(x));
      const wrong=shuffle(pool).map(x=>x.back).filter((v,i,a)=>v!==item.back&&a.indexOf(v)===i).slice(0,3);
      const opts=shuffle([item.back,...wrong]); return {q:`¿Qué significa «${item.front}»?`,opts,a:opts.indexOf(item.back),item};
    }
  }
  function chooseConceptQuestions(cid,size=CM.settings.conceptSessionSize||8){
    const items=conceptItems(cid,true); const out=[]; const seenUnits=new Set();
    const sorted=shuffle(items).sort((a,b)=>((state.adaptive?.cards?.[a.id]?.seen||0)-(state.adaptive?.cards?.[b.id]?.seen||0)));
    for(const it of sorted){if(out.length>=Math.max(3,size-2))break;if(seenUnits.has(it.ui)&&items.length>5)continue;out.push(realQuestion(it));seenUnits.add(it.ui)}
    if(DRILLS[cid]){while(out.length<size)out.push({...DRILLS[cid](),generated:true,cid})}
    for(const it of sorted){if(out.length>=size)break;if(!out.some(x=>x.item?.id===it.id))out.push(realQuestion(it))}
    return shuffle(out).slice(0,size);
  }
  function runConceptSession(cid){
    const meta=CONCEPTS[cid],qs=chooseConceptQuestions(cid); if(!qs.length){alert("Este concepto todavía no tiene suficiente material introducido. Avanzá un poco más en la ruta A1.");return}
    let qi=0,score=0,answered=false; modal.classList.remove("hidden");
    function paint(){const q=qs[qi];modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><div class="progress"><i style="width:${qi/qs.length*100}%"></i></div><b>${qi+1}/${qs.length}</b></div><section class="question-card"><div class="kicker" style="color:var(--brand)">Práctica dirigida · ${esc(meta.label)}</div><h3>${esc(q.q)}</h3><div class="opts">${q.opts.map((o,i)=>`<button class="opt" data-o="${i}">${esc(o)}</button>`).join("")}</div><div id="conceptFb"></div><button id="conceptNext" class="primary full" disabled>Comprobar</button></section></div>`;
      document.querySelector("#closeM").onclick=closeModal;let sel=null;answered=false;const next=document.querySelector("#conceptNext"),fb=document.querySelector("#conceptFb");document.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(answered)return;sel=+b.dataset.o;document.querySelectorAll(".opt").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");next.disabled=false});next.onclick=()=>{if(!answered){answered=true;const ok=sel===q.a;if(ok)score++;if(q.item)RaicesAdaptive.record(q.item.id,ok,"concepto-"+cid,[]);conceptRecord(cid,ok,q.generated?"drill-generado":"practica-dirigida",q.item?.id||null);fb.className=`feedback ${ok?"ok":"bad"}`;fb.innerHTML=ok?`✓ Correcto · ${esc(meta.label)}`:`✕ ${esc(q.opts[q.a])}<br><small>El error actualiza específicamente el concepto «${esc(meta.label)}».</small>`;next.textContent=qi===qs.length-1?"Ver diagnóstico":"Continuar";return}if(qi<qs.length-1){qi++;paint()}else finish()}}
    function finish(){const x=estimate(cid);modal.innerHTML=`<div class="shell"><div class="trophy">${x.mastery>=70?"🧠":"🧩"}</div><h2>${score}/${qs.length}</h2><p><b>${esc(meta.label)}:</b> dominio estimado ${x.mastery??"—"}% · confianza ${x.confidence}%.</p><div class="concept-meter"><i style="width:${x.mastery||0}%"></i></div><p class="note">El porcentaje no es una nota escolar: es una estimación dinámica basada en evidencia y decae si pasa mucho tiempo sin práctica.</p><button id="conceptBack" class="primary full">Volver a práctica</button></div>`;document.querySelector("#conceptBack").onclick=()=>{closeModal();render("practice")}}
    paint();
  }
  function runDiagnostic(){
    const candidates=allEstimates().filter(x=>conceptIntroduced(x.cid)).sort((a,b)=>a.confidence-b.confidence||priorityConcept(b)-priorityConcept(a));
    if(!candidates.length){alert("Completá al menos una microlección para iniciar el diagnóstico.");return}
    runConceptSession(candidates[0].cid);
  }

  function conceptDashboardHTML(){
    const estimates=allEstimates(),rec=recommendation(),introduced=estimates.filter(x=>conceptIntroduced(x.cid));
    const groups={}; introduced.forEach(x=>(groups[CONCEPTS[x.cid].group]??=[]).push(x));
    return `<section class="concept-hero"><div><div class="kicker" style="color:var(--brand)">Diagnóstico lingüístico</div><h2>🧬 Mapa de conceptos</h2><p>La app agrupa errores distintos cuando dependen de la misma regla. Así distingue «olvidé una palabra» de «todavía no domino -ta».</p></div>${rec?`<div class="recommend-box"><small>PRÓXIMO FOCO RECOMENDADO</small><b>${esc(CONCEPTS[rec.cid].label)}</b><span>${esc(reasonFor(rec))}</span><button class="primary full" data-focus="${rec.cid}">Practicar este concepto</button></div>`:""}</section>
      <div class="concept-summary"><div><b>${introduced.filter(x=>x.mastery>=80).length}</b><small>conceptos fuertes</small></div><div><b>${introduced.filter(x=>x.mastery!=null&&x.mastery<55).length}</b><small>conceptos frágiles</small></div><div><b>${introduced.filter(x=>x.confidence<45).length}</b><small>con poca evidencia</small></div></div>
      <section class="card"><div class="concept-title-row"><h3>Competencias</h3><button id="conceptDiagnostic" class="secondary">Diagnóstico</button></div>${Object.entries(groups).map(([g,xs])=>`<div class="concept-group"><h4>${esc(g)}</h4>${xs.sort((a,b)=>(a.mastery??0)-(b.mastery??0)).map(x=>{const c=CONCEPTS[x.cid],m=x.mastery??0,block=blockedBy(x.cid);return`<button class="concept-row" data-focus="${x.cid}"><div><b>${esc(c.label)}</b><small>${x.status}${block.length?` · prerequisito débil: ${block.map(b=>CONCEPTS[b].label).join(", ")}`:""}</small></div><div class="concept-score"><span>${x.mastery==null?"—":x.mastery+"%"}</span><div><i style="width:${m}%"></i></div><small>conf. ${x.confidence}%</small></div></button>`}).join("")}</div>`).join("")}</section>`;
  }
  function wireDashboard(){document.querySelectorAll("[data-focus]").forEach(b=>b.onclick=()=>runConceptSession(b.dataset.focus));const d=document.querySelector("#conceptDiagnostic");if(d)d.onclick=runDiagnostic}

  const oldPractice=renderPractice;
  renderPractice=function(){oldPractice();if(state.lang!=="qu")return;const host=document.createElement("div");host.innerHTML=conceptDashboardHTML();const hero=screen.querySelector(".hero");if(hero)hero.insertAdjacentElement("afterend",host);else screen.prepend(host);wireDashboard()};

  const oldProfile=renderProfile;
  renderProfile=function(){oldProfile();if(state.lang!=="qu")return;const xs=allEstimates().filter(x=>conceptIntroduced(x.cid));const measured=xs.filter(x=>x.mastery!=null),avg=measured.length?Math.round(measured.reduce((a,x)=>a+x.mastery,0)/measured.length):0;const weakest=[...measured].sort((a,b)=>a.mastery-b.mastery).slice(0,5);const sec=document.createElement("section");sec.className="card";sec.innerHTML=`<h3>🧬 Dominio lingüístico</h3><div class="skill-grid"><div class="skill"><b>${avg}%</b><small>dominio medio conceptual</small></div><div class="skill"><b>${xs.length}</b><small>conceptos introducidos</small></div><div class="skill"><b>${xs.filter(x=>x.mastery>=80).length}</b><small>conceptos fuertes</small></div><div class="skill"><b>${xs.filter(x=>x.confidence<45).length}</b><small>con poca evidencia</small></div></div>${weakest.length?`<h4>Focos más débiles</h4>${weakest.map(x=>`<div class="mini-concept"><b>${esc(CONCEPTS[x.cid].label)}</b><span>${x.mastery}%</span></div>`).join("")}`:""}<button id="profileConcepts" class="secondary full">Abrir mapa y practicar</button>`;screen.appendChild(sec);document.querySelector("#profileConcepts").onclick=()=>render("practice")};

  window.RaicesConcepts={catalog:CONCEPTS,estimate,allEstimates,itemConcepts,runConceptSession,recommendation};
})();