(function(){
 const esc=s=>(s??'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const original=window.openWork;
 if(!original)return;
 window.openWork=async function(id){
  await original(id);
  const w=WORKS.find(x=>x.id===id); if(!w)return;
  const mc=getMiniClass(w);
  const html=`<section class="mini-class panel"><div class="mini-class-head"><div><div class="eyebrow">MINI CLASE UNIVERSITARIA</div><h2>${esc(w.author)} · ${esc(w.title)}</h2><p>Lectura guiada para estudio, repaso y preparación de examen.</p></div><span class="class-badge">${esc(w.date)}</span></div><div class="lecture-prose">${(mc.lecture||[]).map(p=>`<p>${esc(p)}</p>`).join('')}</div><div class="lecture-grid"><div><h3>Recorrido del argumento</h3><ol>${(mc.route||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div><div><h3>Comparaciones útiles</h3><ul>${(mc.compare||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><h3>Para un examen</h3><ul>${(mc.exam||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div>${mc.reading?.length?`<div class="lecture-reading"><h3>Lecturas para seguir</h3><ul>${mc.reading.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}</section>`;
  const hero=document.querySelector('#dossier .study-hero');
  if(hero)hero.insertAdjacentHTML('afterend',html);
 };
})();