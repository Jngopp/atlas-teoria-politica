(()=>{
const screen=document.querySelector('#screen'),modal=document.querySelector('#modal');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function allLessons(){return Object.entries(window.POLIS_SYSTEM_TEACHING||{}).flatMap(([sys,ls])=>ls.map((l,i)=>({...l,sys,seq:i+1})))}
function enrichTeaching(){
 const card=modal?.querySelector('.teach-card');
 if(!card||card.dataset.dense==='1')return;
 const title=card.querySelector('h2')?.textContent?.trim();
 const l=allLessons().find(x=>x.title===title); if(!l)return;
 card.dataset.dense='1';
 const hook=card.querySelector('.teach-hook');
 const anchor=hook||card.querySelector('h2');
 const terms=(l.terms||[]).map(t=>`<div class="term-chip"><b>${esc(t[0])}</b>${t[1]?`<span>${esc(t[1])}</span>`:''}<small>${esc(t[2]||'')}</small></div>`).join('');
 const q=l.quote;
 const block=document.createElement('div');
 block.className='dense-concept-block';
 block.innerHTML=`<div class="lesson-seq">Microlección ${l.seq}/10 · ${l.sys==='plato'?'griego':l.sys==='hobbes'?'inglés':'alemán'} original</div>
 ${terms?`<section class="term-panel"><div class="dense-label">Términos técnicos</div><div class="term-grid">${terms}</div></section>`:''}
 ${q?`<section class="quote-panel"><div class="dense-label">Cita central · después de la inferencia</div><blockquote>${esc(q.original)}</blockquote><p>${esc(q.translation)} <small class="pedagogical-translation">(traducción pedagógica)</small></p><footer><b>${esc(q.source)}</b>${q.note?`<span>${esc(q.note)}</span>`:''}</footer></section>`:''}`;
 anchor.insertAdjacentElement('afterend',block);
 const steps=card.querySelector('.learning-steps');
 if(steps&&!steps.querySelector('.integrate-step'))steps.insertAdjacentHTML('beforeend','<i>›</i><span class="integrate-step">4 🧠 Integrá</span>');
}
function enrichGuide(){
 const shell=modal?.querySelector('.guide-shell'); if(!shell||shell.dataset.dense==='1')return;
 shell.dataset.dense='1';
 const id=(()=>{try{return JSON.parse(localStorage.getItem('polis-systems-v1')||'{}').current}catch(e){return null}})();
 const lessons=window.POLIS_SYSTEM_TEACHING?.[id]||[];
 shell.querySelectorAll('.guide-lesson').forEach((el,i)=>{
   const l=lessons[i]; if(!l)return;
   const terms=(l.terms||[]).slice(0,4).map(t=>`<span><b>${esc(t[0])}</b> · ${esc(t[2]||t[1]||'')}</span>`).join('');
   if(terms)el.querySelector('div')?.insertAdjacentHTML('beforeend',`<div class="guide-terms">${terms}</div>`);
   if(l.quote)el.querySelector('div')?.insertAdjacentHTML('beforeend',`<div class="guide-quote">“${esc(l.quote.original)}” <small>${esc(l.quote.source)}</small></div>`);
 });
}
function groupPath(){
 const path=screen?.querySelector('.lesson-path'); if(!path||path.dataset.dense==='1')return;
 const id=(()=>{try{return JSON.parse(localStorage.getItem('polis-systems-v1')||'{}').current}catch(e){return null}})();
 const lessons=window.POLIS_SYSTEM_TEACHING?.[id]||[]; if(!lessons.length)return;
 path.dataset.dense='1';
 const rows=[...path.querySelectorAll('.path-row')];
 lessons.forEach((l,i)=>{
   const row=rows[i*2]; if(!row)return;
   const terms=(l.terms||[]).slice(0,2).map(t=>t[0]).join(' · ');
   row.insertAdjacentHTML('beforebegin',`<div class="micro-unit-divider"><span>${i+1}</span><div><b>${esc(l.title)}</b><small>${esc(terms)}</small></div></div>`);
 });
 const title=path.previousElementSibling;
 if(title?.classList.contains('section-title'))title.textContent='10 microlecciones · 20 desafíos';
}
function enrichMap(){
 const map=screen?.querySelector('.system-map'); if(!map||map.dataset.dense==='1')return;
 map.dataset.dense='1';
 const head=map.querySelector('.map-title span');
 if(head)head.textContent=head.textContent.replace('nodos','microlecciones');
}
const obs=new MutationObserver(()=>{enrichTeaching();enrichGuide();groupPath();enrichMap()});
if(screen)obs.observe(screen,{childList:true,subtree:true});
if(modal)obs.observe(modal,{childList:true,subtree:true});
setTimeout(()=>{groupPath();enrichMap()},1200);
window.POLIS_DENSE_UI={refresh(){enrichTeaching();enrichGuide();groupPath();enrichMap()}};
})();