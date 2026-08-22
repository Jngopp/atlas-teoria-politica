(async()=>{
 const screen=document.querySelector('#screen');
 const modal=document.querySelector('#modal');
 try{
  const response=await fetch('systems-engine.js?v=5',{cache:'no-store'});
  if(!response.ok)throw new Error(`No se pudo cargar systems-engine.js (${response.status})`);
  let src=await response.text();
  const stateMarker="S.progress??={};S.xp??=0;S.duel??={best:0,done:false};S.current??=null;";
  if(src.includes(stateMarker))src=src.replace(stateMarker,stateMarker+"S.taught??={};");
  const oldStart="function startActivity(sysId,index){const s=DATA.systems.find(x=>x.id===sysId),a=s?.activities[index];if(!a)return;const r=activityRecord(sysId,a.id);r.attempts++;save();if(a.type==='order')return renderOrder(s,a,index);if(a.type==='match')return renderMatch(s,a,index);return renderChoice(s,a,index)}";
  const newStart=`function teachingFor(sysId,activityId){return (window.POLIS_SYSTEM_TEACHING?.[sysId]||[]).find(l=>(l.activities||[]).includes(activityId))||null}
function teachingSeen(sysId,lessonId){S.taught??={};return !!(S.taught[sysId]||{})[lessonId]}
function markTeachingSeen(sysId,lessonId){S.taught??={};S.taught[sysId]??={};S.taught[sysId][lessonId]=true;save()}
function launchActivity(sysId,index){const s=DATA.systems.find(x=>x.id===sysId),a=s?.activities[index];if(!a)return;const r=activityRecord(sysId,a.id);r.attempts++;save();if(a.type==='order')return renderOrder(s,a,index);if(a.type==='match')return renderMatch(s,a,index);return renderChoice(s,a,index)}
function renderTeaching(s,a,index,l){const chain=(l.relation||[]).map(x=>'<span>'+esc(x)+'</span>').join('<i>→</i>');openModal(header(s,a,index)+'<section class="teach-card"><div class="teach-label">📘 APRENDÉ</div><h2>'+esc(l.title)+'</h2><p class="teach-hook">'+esc(l.hook)+'</p><p class="teach-body">'+esc(l.body)+'</p>'+(chain?'<div class="teach-chain">'+chain+'</div>':'')+(l.example?'<div class="teach-example"><b>Ejemplo</b><p>'+esc(l.example)+'</p></div>':'')+(l.tip?'<div class="teach-tip"><b>💡 Pista</b><p>'+esc(l.tip)+'</p></div>':'')+'<button id="teachTry" class="sys-primary full">Ahora probalo</button></section>');document.querySelector('#closeSysQ').onclick=closeModal;document.querySelector('#teachTry').onclick=()=>{markTeachingSeen(s.id,l.id);launchActivity(s.id,index)}}
function startActivity(sysId,index){const s=DATA.systems.find(x=>x.id===sysId),a=s?.activities[index];if(!a)return;const l=teachingFor(sysId,a.id);if(l&&!teachingSeen(sysId,l.id))return renderTeaching(s,a,index,l);return launchActivity(sysId,index)}`;
  if(!src.includes(oldStart))throw new Error('No se encontró el punto de integración de microenseñanza');
  src=src.replace(oldStart,newStart);
  new Function(`${src}\n//# sourceURL=polis-systems-runtime.js`)();
  installGuideButton();
  window.dispatchEvent(new Event('polis:systemsReady'));
 }catch(error){
  console.error('POLIS systems teaching boot error',error);
  if(screen&&!document.querySelector('.systems-page'))screen.innerHTML=`<div class="page"><section class="hero"><div class="eyebrow">POLIS Sistemas</div><h1>No pudo iniciar el modo de sistemas</h1><p>El resto de POLIS sigue disponible.</p></section><section class="card"><b>Diagnóstico:</b><p class="note">${String(error.message||error)}</p></section></div>`;
 }
 function esc2(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
 function currentSystem(){try{return JSON.parse(localStorage.getItem('polis-systems-v1')||'{}').current||null}catch(e){return null}}
 function openGuide(id){const lessons=window.POLIS_SYSTEM_TEACHING?.[id]||[];const sys=window.POLIS_SYSTEMS?.systems?.find(x=>x.id===id);if(!lessons.length||!modal)return;modal.classList.remove('hidden');modal.innerHTML=`<div class="sys-shell guide-shell"><div class="guide-top"><button id="closeGuide">×</button><div><div class="q-kicker">📘 Guía del sistema</div><h2>${esc2(sys?.author||id)}</h2></div></div><div class="guide-lessons">${lessons.map((l,i)=>`<article class="guide-lesson"><span class="guide-num">${i+1}</span><div><h3>${esc2(l.title)}</h3><p>${esc2(l.body)}</p><div class="teach-chain compact">${(l.relation||[]).map(x=>`<span>${esc2(x)}</span>`).join('<i>→</i>')}</div><small>${esc2(l.tip||'')}</small></div></article>`).join('')}</div></div>`;document.querySelector('#closeGuide').onclick=()=>{modal.classList.add('hidden');modal.innerHTML=''}}
 function installGuideButton(){if(!screen)return;const obs=new MutationObserver(()=>{const banner=screen.querySelector('.system-banner');const map=screen.querySelector('.system-map');if(!banner||!map||screen.querySelector('#systemTeachGuide'))return;const id=currentSystem();if(!id||!(window.POLIS_SYSTEM_TEACHING?.[id]||[]).length)return;const b=document.createElement('button');b.id='systemTeachGuide';b.className='teach-guide-btn';b.innerHTML='📘 <span>Guía del sistema</span><small>Repasar las ideas que vas desbloqueando</small>';b.onclick=()=>openGuide(id);map.parentNode.insertBefore(b,map)});obs.observe(screen,{childList:true,subtree:true});setTimeout(()=>obs.takeRecords(),0)}
})();