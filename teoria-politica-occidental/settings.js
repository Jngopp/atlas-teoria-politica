(()=>{
 const btn=document.querySelector('#settingsBtn'),modal=document.querySelector('#modal');
 if(!btn||!modal)return;
 function openSettings(){
  modal.classList.remove('hidden');
  modal.innerHTML=`<div class="sys-shell settings-shell"><div class="settings-head"><button id="closeSettings">×</button><div><div class="q-kicker">⚙️ AJUSTES</div><h2>POLIS</h2></div></div>
   <section class="settings-card"><h3>Progreso</h3><p>Podés volver a empezar sin borrar el contenido de la aplicación.</p>
    <button class="settings-action" data-reset="systems"><span>🧠</span><div><b>Reiniciar solo Sistemas</b><small>Borra el progreso de los 14 sistemas canónicos, enseñanza, descubrimiento y duelo.</small></div></button>
    <button class="settings-action danger" data-reset="all"><span>↺</span><div><b>Reiniciar todo POLIS</b><small>Borra ruta, XP, corazones, SRS, benchmarks y Sistemas.</small></div></button>
   </section>
   <section class="settings-card"><h3>🔊 Audio conceptual</h3><p>Tocá cualquier término técnico o una cita original marcada con 🔊 para escucharla. POLIS usa las voces instaladas en tu dispositivo.</p><button id="stopSpeech" class="settings-action"><span>⏹️</span><div><b>Detener reproducción</b><small>Interrumpe la voz que esté sonando.</small></div></button><p class="settings-note">El motor intenta usar griego para Platón y Aristóteles; latín para Agustín, Tomás y Spinoza; italiano para Maquiavelo; inglés para Hobbes, Locke y Arendt; francés para Rousseau; alemán para Kant, Hegel, Marx y Schmitt. Si una voz no está instalada, usa una alternativa del dispositivo.</p></section>
   <section class="settings-card"><h3>Cómo aprende Sistemas</h3><div class="settings-flow"><span>🔎 Descubrí</span><i>›</i><span>📘 Aprendé</span><i>›</i><span>🧩 Término</span><i>›</i><span>🔗 Relación</span><i>›</i><span>🎯 Probalo</span></div><p class="settings-note">Las fases de descubrimiento y enseñanza son de bajo riesgo: una hipótesis incorrecta no quita corazones.</p></section>
   <div id="settingsConfirm"></div></div>`;
  document.querySelector('#closeSettings').onclick=closeSettings;
  document.querySelector('#stopSpeech').onclick=()=>window.POLIS_SPEECH?.stop();
  document.querySelectorAll('[data-reset]').forEach(b=>b.onclick=()=>askReset(b.dataset.reset));
 }
 function closeSettings(){window.POLIS_SPEECH?.stop();modal.classList.add('hidden');modal.innerHTML=''}
 function askReset(scope){
  const all=scope==='all',box=document.querySelector('#settingsConfirm');
  box.innerHTML=`<section class="reset-confirm"><div class="reset-icon">${all?'⚠️':'🧠'}</div><h3>${all?'¿Reiniciar todo POLIS?':'¿Reiniciar Sistemas?'}</h3><p>${all?'Se eliminará todo tu progreso local en POLIS. Esta acción no se puede deshacer.':'Los 14 sistemas volverán a cero. El resto de POLIS conservará su progreso.'}</p><div class="reset-buttons"><button id="cancelReset">Cancelar</button><button id="confirmReset" class="${all?'danger':''}">${all?'Sí, borrar todo':'Sí, reiniciar Sistemas'}</button></div></section>`;
  box.scrollIntoView({behavior:'smooth',block:'center'});
  document.querySelector('#cancelReset').onclick=()=>box.innerHTML='';
  document.querySelector('#confirmReset').onclick=()=>performReset(scope);
 }
 function performReset(scope){
  window.POLIS_SPEECH?.stop();
  if(scope==='systems')localStorage.removeItem('polis-systems-v1');
  else Object.keys(localStorage).filter(k=>k.startsWith('polis-')).forEach(k=>localStorage.removeItem(k));
  modal.innerHTML=`<div class="sys-shell"><div class="reset-done"><span>✓</span><h2>Progreso reiniciado</h2><p>${scope==='systems'?'Sistemas vuelve a empezar desde la primera inferencia.':'POLIS vuelve a empezar desde cero.'}</p></div></div>`;
  setTimeout(()=>location.replace(location.pathname+'?v=11&reset=1'),650);
 }
 btn.onclick=openSettings;
 window.POLIS_SETTINGS={open:openSettings};
})();
