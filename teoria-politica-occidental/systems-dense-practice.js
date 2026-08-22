(()=>{
const modal=document.querySelector('#modal');if(!modal)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
function lessons(){return Object.values(window.POLIS_SYSTEM_TEACHING||{}).flat()}
function currentLesson(){const title=modal.querySelector('.teach-card h2')?.textContent?.trim();return lessons().find(l=>l.title===title)}
function openTermCheck(l,proceed){
 const terms=l.terms||[];if(!terms.length)return openRelationCheck(l,proceed);
 const target=terms[Math.min(terms.length-1,Math.max(0,(l.id.match(/(\d+)$/)?.[1]||1)-1)%terms.length)];
 const opts=shuffle(terms.map(t=>({label:t[2]||t[1],term:t[0],correct:t===target})));
 modal.innerHTML=`<div class="sys-shell"><section class="dense-check"><div class="learning-steps"><span class="done">1 🔎 Descubrí</span><i>›</i><span class="done">2 📘 Aprendé</span><i>›</i><span class="active">3a 🧩 Términos</span><i>›</i><span>3b 🔗 Relación</span></div><div class="dense-check-label">TÉRMINO TÉCNICO</div><h2>${esc(target[0])}</h2>${target[1]?`<p class="term-pron">${esc(target[1])}</p>`:''}<p>¿Cuál es la equivalencia conceptual correcta en esta microlección?</p><div class="dense-check-options">${opts.map((o,i)=>`<button data-dopt="${i}">${esc(o.label)}</button>`).join('')}</div><div id="denseFb"></div><button id="denseNext" class="sys-primary full" disabled>Continuar</button></section></div>`;
 let chosen=null;const next=modal.querySelector('#denseNext'),fb=modal.querySelector('#denseFb');
 function wire(){modal.querySelectorAll('[data-dopt]').forEach(b=>b.onclick=()=>{chosen=+b.dataset.dopt;modal.querySelectorAll('[data-dopt]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');next.disabled=false})}wire();
 next.onclick=()=>{const ok=opts[chosen]?.correct;if(ok){fb.innerHTML=`<div class="dense-good">✓ ${esc(target[0])} → ${esc(target[2]||target[1])}</div>`;next.textContent='Reconstruir la relación →';next.disabled=false;next.onclick=()=>openRelationCheck(l,proceed);return}fb.innerHTML=`<div class="dense-wrong"><b>Equivalencia correcta</b><p>${esc(target[0])} → ${esc(target[2]||target[1])}</p><small>Esto es práctica de aprendizaje: no perdés corazones.</small></div>`;next.disabled=true;wire()}
}
function openRelationCheck(l,proceed){
 const rel=l.relation||[];if(rel.length<2)return finish(l,proceed);
 const bank=shuffle(rel.map((t,i)=>({t,id:'r'+i}))),chosen=[];
 modal.innerHTML=`<div class="sys-shell"><section class="dense-check"><div class="learning-steps"><span class="done">1 🔎 Descubrí</span><i>›</i><span class="done">2 📘 Aprendé</span><i>›</i><span class="done">3a 🧩 Términos</span><i>›</i><span class="active">3b 🔗 Relación</span></div><div class="dense-check-label">ARQUITECTURA DEL ARGUMENTO</div><h2>Reconstruí la cadena</h2><p>Ordená las piezas según la lógica que acabás de aprender.</p><div id="denseAnswer" class="dense-answer"><span>Tu cadena aparece acá…</span></div><div id="denseBank" class="dense-bank">${bank.map(x=>`<button data-rchip="${x.id}" data-text="${esc(x.t)}">${esc(x.t)}</button>`).join('')}</div><div id="denseFb"></div><button id="denseRelCheck" class="sys-primary full" disabled>Comprobar relación</button></section></div>`;
 const ans=modal.querySelector('#denseAnswer'),check=modal.querySelector('#denseRelCheck'),fb=modal.querySelector('#denseFb'),bankEl=modal.querySelector('#denseBank');
 function paint(){ans.innerHTML=chosen.length?chosen.map(x=>`<button data-rback="${x.id}">${esc(x.t)}</button>`).join('<i>→</i>'):'<span>Tu cadena aparece acá…</span>';check.disabled=chosen.length!==rel.length;ans.querySelectorAll('[data-rback]').forEach(b=>b.onclick=()=>{const i=chosen.findIndex(x=>x.id===b.dataset.rback);const [x]=chosen.splice(i,1);bankEl.querySelector(`[data-rchip="${x.id}"]`).disabled=false;paint()})}
 bankEl.querySelectorAll('[data-rchip]').forEach(b=>b.onclick=()=>{chosen.push({id:b.dataset.rchip,t:b.dataset.text});b.disabled=true;paint()});
 check.onclick=()=>{const ok=chosen.map(x=>x.t).join('|')===rel.join('|');if(ok)return finish(l,proceed);fb.innerHTML=`<div class="dense-wrong"><b>Relación correcta</b><p>${rel.map(esc).join(' → ')}</p><small>Reconstruila correctamente para continuar.</small></div>`;chosen.splice(0);bankEl.querySelectorAll('[data-rchip]').forEach(b=>b.disabled=false);paint()}
}
function finish(l,proceed){
 modal.innerHTML=`<div class="sys-shell"><section class="dense-integrate"><span>🧠</span><div class="dense-check-label">INTEGRÁ</div><h2>Ya tenés la pieza conceptual</h2><div class="teach-chain">${(l.relation||[]).map(x=>`<span>${esc(x)}</span>`).join('<i>→</i>')}</div><p>Ahora la vas a usar en un problema nuevo. Si fallás, POLIS te devuelve a la relación correcta.</p><button id="denseProceed" class="sys-primary full">🎯 Ahora probalo</button></section></div>`;
 modal.querySelector('#denseProceed').onclick=()=>proceed?.();
}
function patch(){const card=modal.querySelector('.teach-card'),btn=modal.querySelector('#teachTry');if(!card||!btn||btn.dataset.densePractice==='1')return;const l=currentLesson();if(!l)return;btn.dataset.densePractice='1';btn.textContent='🧩 Practicar términos y relación';const proceed=btn.onclick;btn.onclick=()=>openTermCheck(l,proceed)}
new MutationObserver(patch).observe(modal,{childList:true,subtree:true});setTimeout(patch,800);
})();