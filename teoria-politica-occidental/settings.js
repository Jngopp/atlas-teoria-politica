(()=>{
 const btn=document.querySelector('#settingsBtn'),modal=document.querySelector('#modal');
 if(!btn||!modal)return;
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 function openSettings(){
  modal.classList.remove('hidden');
  modal.innerHTML=`<div class="sys-shell settings-shell"><div class="settings-head"><button id="closeSettings">×</button><div><div class="q-kicker">⚙️ AJUSTES</div><h2>POLIS</h2></div></div>
   <section class="settings-card"><h3>Progreso</h3><p>Podés volver a empezar sin borrar el contenido de la aplicación.</p>
    <button class="settings-action" data-reset="systems"><span>🧠</span><div><b>Reiniciar solo Sistemas</b><small>Borra Platón, Hobbes, Marx, enseñanza, descubrimiento y duelo.</small></div></button>
    <button class="settings-action danger" data-reset="all"><span>↺</span><div><b>Reiniciar todo POLIS</b><small>Borra ruta, XP, corazones, SRS, benchmarks y Sistemas.</small></div></button>
   </section>
   <section class="settings-card"><h3>Cómo aprende Sistemas</h3><div class="settings-flow"><span>🔎 Descubrí</span><i>›</i><span>📘 Aprendé</span><i>›</i><span>🧩 Término</span><i>›</i><span>🔗 Relación</span><i>›</i><span>🎯 Probalo</span></div><p class="settings-note">Las fases de descubrimiento y enseñanza son de bajo riesgo: una hipótesis incorrecta no quita corazones.</p></section>
   <div id="settingsConfirm"></div></div>`;
  document.querySelector('#closeSettings').onclick=closeSettings;
  document.querySelectorAll('[data-reset]').forEach(b=>b.onclick=()=>askReset(b.dataset.reset));
 }
 function closeSettings(){modal.classList.add('hidden');modal.innerHTML=''}
 function askReset(scope){
  const all=scope==='all',box=document.querySelector('#settingsConfirm');
  box.innerHTML=`<section class="reset-confirm"><div class="reset-icon">${all?'⚠️':'🧠'}</div><h3>${all?'¿Reiniciar todo POLIS?':'¿Reiniciar Sistemas?'}</h3><p>${all?'Se eliminará todo tu progreso local en POLIS. Esta acción no se puede deshacer.':'Platón, Hobbes y Marx volverán a cero. El resto de POLIS conservará su progreso.'}</p><div class="reset-buttons"><button id="cancelReset">Cancelar</button><button id="confirmReset" class="${all?'danger':''}">${all?'Sí, borrar todo':'Sí, reiniciar Sistemas'}</button></div></section>`;
  box.scrollIntoView({behavior:'smooth',block:'center'});
  document.querySelector('#cancelReset').onclick=()=>box.innerHTML='';
  document.querySelector('#confirmReset').onclick=()=>performReset(scope);
 }
 function performReset(scope){
  if(scope==='systems')localStorage.removeItem('polis-systems-v1');
  else Object.keys(localStorage).filter(k=>k.startsWith('polis-')).forEach(k=>localStorage.removeItem(k));
  modal.innerHTML=`<div class="sys-shell"><div class="reset-done"><span>✓</span><h2>Progreso reiniciado</h2><p>${scope==='systems'?'Sistemas vuelve a empezar desde la primera inferencia.':'POLIS vuelve a empezar desde cero.'}</p></div></div>`;
  setTimeout(()=>location.replace(location.pathname+'?v=9&reset=1'),650);
 }
 btn.onclick=openSettings;
 window.POLIS_SETTINGS={open:openSettings};
})();