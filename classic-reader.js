// Sinopsis de obra + gestión local del texto primario para las 109 fichas.
(function(){
 const esc=s=>(s??'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const uniq=a=>[...new Set((a||[]).filter(Boolean))];
 function guide(w){try{return typeof getRichStudyGuide==='function'?getRichStudyGuide(w):(typeof getStudyGuide==='function'?getStudyGuide(w):null)}catch{return null}}
 function mini(w){try{return typeof getMiniClass==='function'?getMiniClass(w):null}catch{return null}}
 function architectureSentence(items){
  const xs=(items||[]).filter(Boolean).slice(0,5);if(!xs.length)return'';
  return `El recorrido de la obra puede reconstruirse en cinco movimientos principales: ${xs.map((x,i)=>`${i+1}) ${x.replace(/[.;:]$/,'')}`).join('; ')}.`;
 }
 function synopsis(w){
  const g=guide(w),m=mini(w),out=[];
  const first=(g?.summary||m?.lecture||[]).filter(Boolean);
  if(first[0])out.push(first[0]);
  else out.push(`${w.title} se inscribe en ${w.context} Su problema rector puede formularse así: ${w.problem}`);
  const arch=architectureSentence(g?.architecture?.length?g.architecture:m?.route);
  if(arch)out.push(arch);
  out.push(`La respuesta central de ${w.author} es que ${String(w.thesis||'').replace(/^./,c=>c.toLowerCase())} La tesis no debe aislarse de su vocabulario: ${(w.concepts||[]).slice(0,6).join(', ')} forman el campo conceptual con el que la obra organiza el problema.`);
  if(first[1]&&first[1]!==first[0])out.push(first[1]);
  const rec=g?.reception?.[0]||g?.debates?.[0]||m?.compare?.[0];
  if(rec)out.push(`Para su lectura contemporánea conviene retener además este punto: ${rec}`);
  return uniq(out).slice(0,5);
 }
 function synopsisHTML(w){return `<section class="v2-block cr-synopsis"><div class="v2-number">00</div><div><div class="eyebrow">SINOPSIS DE LA OBRA</div><h2>Qué contiene, cómo está construida y qué sostiene</h2><p class="v2-intro-note">Esta sinopsis resume el recorrido de la obra como texto. La mini clase y los apartados posteriores desarrollan su interpretación, controversias y recepción.</p>${synopsis(w).map(p=>`<p class="cr-synopsis-p">${esc(p)}</p>`).join('')}</div></section>`}
 function classifyReader(w){
  const es=w.readerEs||w.readerES||''; if(es)return{url:es,lang:'es',label:'Edición abierta en español'};
  const en=w.readerEn||w.readerEN||''; if(en)return{url:en,lang:'en',label:'Edición abierta en inglés'};
  const u=w.reader||''; if(!u)return null;
  const low=u.toLowerCase();
  if(low.includes('es.wikisource')||low.includes('cervantesvirtual')||low.includes('biblioteca.org.ar')||low.includes('filosofia.org'))return{url:u,lang:'es',label:'Edición abierta en español'};
  if(low.includes('en.wikisource')||low.includes('gutenberg.org'))return{url:u,lang:'en',label:'Edición abierta en inglés'};
  return{url:u,lang:'unknown',label:'Edición abierta configurada'};
 }
 function textHTML(w){
  const r=classifyReader(w);
  return `<div class="v2-sidebox cr-primary-text" data-cr-work="${esc(w.id)}"><div class="eyebrow">TEXTO PRIMARIO</div><h3>Leer la obra</h3>${r?`<div class="cr-open-edition"><span class="cr-lang ${r.lang}">${r.lang==='es'?'ES':r.lang==='en'?'EN':'WEB'}</span><div><b>${esc(r.label)}</b><small>Fuente externa configurada en el Atlas.</small></div></div><a class="readerlink cr-reader-link" target="_blank" rel="noopener" href="${esc(r.url)}">Abrir texto completo ↗</a>`:`<div class="cr-no-edition"><b>Sin edición libre verificada</b><p>No hay en el Atlas una edición de libre disponibilidad verificada en español ni, subsidiariamente, en inglés.</p></div>`}<div class="cr-local" id="crLocal-${esc(w.id)}"><div class="cr-local-loading">Comprobando tu biblioteca local…</div></div><input type="file" id="crFile-${esc(w.id)}" accept="application/pdf,application/epub+zip,text/plain,text/html,.epub,.md" hidden><button class="secondary cr-upload" data-cr-upload="${esc(w.id)}">${r?'Usar mi propia edición':'Subir mi texto'}</button><p class="cr-privacy">El archivo queda guardado sólo en este navegador mediante IndexedDB. No se publica ni se envía al repositorio.</p></div>`;
 }
 const DB='atlas-teoria-politica',STORE='primaryTexts',VERSION=1;
 function db(){return new Promise((resolve,reject)=>{const q=indexedDB.open(DB,VERSION);q.onupgradeneeded=()=>{const d=q.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'workId'})};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
 async function getText(id){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readonly'),q=tx.objectStore(STORE).get(id);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error)})}
 async function putText(id,file){const d=await db(),rec={workId:id,name:file.name,type:file.type||'',size:file.size,updatedAt:Date.now(),blob:file};return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).put(rec);tx.oncomplete=()=>resolve(rec);tx.onerror=()=>reject(tx.error)})}
 async function delText(id){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
 function fmtSize(n){if(!Number.isFinite(n))return'';if(n<1024*1024)return`${Math.max(1,Math.round(n/1024))} KB`;return`${(n/1024/1024).toFixed(1)} MB`}
 function localHTML(rec){if(!rec)return`<div class="cr-local-empty"><b>Biblioteca personal</b><span>Todavía no cargaste una edición propia para esta obra.</span></div>`;const date=new Date(rec.updatedAt).toLocaleDateString('es-AR');return`<div class="cr-local-saved"><div><b>Tu edición guardada</b><span>${esc(rec.name)} · ${fmtSize(rec.size)} · ${date}</span></div><div class="cr-local-actions"><button data-cr-open-local="${esc(rec.workId)}">Abrir</button><button data-cr-replace="${esc(rec.workId)}">Reemplazar</button><button data-cr-delete="${esc(rec.workId)}">Eliminar</button></div></div>`}
 async function refresh(id){const box=document.getElementById(`crLocal-${CSS.escape(id)}`);if(!box)return;try{box.innerHTML=localHTML(await getText(id))}catch{box.innerHTML='<div class="cr-local-empty"><b>Biblioteca personal</b><span>El navegador no permitió acceder al almacenamiento local.</span></div>'}}
 async function openLocal(id){const rec=await getText(id);if(!rec?.blob)return;const u=URL.createObjectURL(rec.blob);window.open(u,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(u),120000)}
 async function choose(id){const input=document.getElementById(`crFile-${CSS.escape(id)}`);if(!input)return;input.value='';input.click()}
 function bind(w){
  refresh(w.id);
  const input=document.getElementById(`crFile-${CSS.escape(w.id)}`);if(input&&!input.dataset.bound){input.dataset.bound='1';input.addEventListener('change',async()=>{const f=input.files?.[0];if(!f)return;try{await putText(w.id,f);await refresh(w.id)}catch(e){alert('No se pudo guardar el archivo en este navegador.') }});}
 }
 document.addEventListener('click',async e=>{
  const up=e.target.closest?.('[data-cr-upload]');if(up){e.preventDefault();choose(up.dataset.crUpload);return}
  const rep=e.target.closest?.('[data-cr-replace]');if(rep){e.preventDefault();choose(rep.dataset.crReplace);return}
  const op=e.target.closest?.('[data-cr-open-local]');if(op){e.preventDefault();openLocal(op.dataset.crOpenLocal);return}
  const del=e.target.closest?.('[data-cr-delete]');if(del){e.preventDefault();if(confirm('¿Eliminar esta edición de tu biblioteca local?')){await delText(del.dataset.crDelete);refresh(del.dataset.crDelete)}return}
 },true);
 window.ClassicReader={synopsis,synopsisHTML,textHTML,bind,classifyReader,getText};
})();