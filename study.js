// Capa de estudio avanzada: dossiers extensos + mapa principal/secundario.
(function(){
 const byId=id=>WORKS.find(w=>w.id===id), esc=s=>(s??'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const bulletList=a=>`<ul class="study-list">${(a||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
 const paras=a=>(a||[]).map(x=>`<p>${esc(x)}</p>`).join('');
 const conceptTable=o=>`<div class="concept-defs">${Object.entries(o||{}).map(([k,v])=>`<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>`;

 window.openWork=async function(id){
  const w=byId(id); if(!w)return; const g=getStudyGuide(w);
  dossier.innerHTML=`
  <section class="dhero study-hero"><div><div class="eyebrow">DOSSIER DE ESTUDIO · ${esc(eraName(w.era))}</div><h1>${esc(w.title)}</h1><div class="author big">${esc(w.author)}</div><p class="dlead">${esc(w.problem)}</p><div class="chips">${w.concepts.map(c=>`<span class="chip">${esc(c)}</span>`).join('')}</div></div><div class="portrait"><img id="authorPic"></div><div class="portrait bookpic"><img id="bookPic"></div></section>
  <section class="study-layout"><main>
    <section class="study-block intro"><div class="study-num">01</div><div><div class="eyebrow">ORIENTACIÓN GENERAL</div><h2>¿Qué hay que entender de esta obra?</h2>${paras(g.summary)}</div></section>
    <section class="study-block"><div class="study-num">02</div><div><div class="eyebrow">PROBLEMA Y TESIS</div><h2>El argumento en su contexto</h2><p><b>Problema:</b> ${esc(w.problem)}</p><p><b>Tesis:</b> ${esc(w.thesis)}</p><p>${esc(w.context)}</p></div></section>
    <section class="study-block"><div class="study-num">03</div><div><div class="eyebrow">ARQUITECTURA</div><h2>Cómo está construido el texto</h2>${bulletList(g.architecture)}</div></section>
    <section class="study-block"><div class="study-num">04</div><div><div class="eyebrow">CONCEPTOS CLAVE</div><h2>Vocabulario que conviene dominar</h2>${conceptTable(g.keys)}<div class="concept-pics study-pics">${w.concepts.slice(0,6).map(c=>`<div class="concept-img"><img data-ci="${esc(c)}"><b>${esc(c)}</b></div>`).join('')}</div></div></section>
    <section class="study-block"><div class="study-num">05</div><div><div class="eyebrow">DEBATES DE INTERPRETACIÓN</div><h2>Qué discute la bibliografía</h2>${bulletList(g.debates)}</div></section>
    <section class="study-block"><div class="study-num">06</div><div><div class="eyebrow">RECEPCIÓN</div><h2>Qué ocurrió con la obra después</h2>${bulletList(g.reception)}</div></section>
    <section class="study-block exam"><div class="study-num">07</div><div><div class="eyebrow">PARA ESTUDIAR</div><h2>Qué deberías poder explicar sin mirar</h2>${bulletList(g.study)}</div></section>
    <section class="study-block"><div class="study-num">08</div><div><div class="eyebrow">BIBLIOGRAFÍA PARA PROFUNDIZAR</div><h2>Pistas de lectura secundaria</h2>${bulletList(g.secondary||[])}</div></section>
  </main><aside class="study-aside">
    <div class="sidebox sticky"><h3>Ficha rápida</h3><dl class="quickfacts"><dt>Autor</dt><dd>${esc(w.author)}</dd><dt>Fecha</dt><dd>${esc(w.date)}</dd><dt>Tradición</dt><dd>${esc(w.trad)}</dd><dt>Época</dt><dd>${esc(eraName(w.era))}</dd></dl>${w.reader?`<a class="readerlink" target="_blank" rel="noopener" href="${w.reader}">Leer edición disponible ↗</a>`:'<p class="note">Sin edición abierta verificada configurada.</p>'}<button class="secondary upload" onclick="file.click()">Subir mi edición</button><button class="primary upload" id="paperFromWork">Buscar bibliografía</button></div>
  </aside></section>`;
  dlg.showModal();
  let a=await wikiImage(w.author);if(a)authorPic.src=a;else setImg(authorPic,w.author,w.author);
  let b=await wikiImage(w.title);if(!b)b=a;if(b)bookPic.src=b;else setImg(bookPic,w.title,w.title);
  $$('[data-ci]').forEach(im=>setImg(im,im.dataset.ci,im.dataset.ci));
  paperFromWork.onclick=()=>{dlg.close();show('papers');pq.value=w.author+' '+w.title;searchPapers()};
 };

 const short=s=>s.replace(/^Tradición\s+/,'').replace('Karl Marx y Friedrich Engels','Marx/Engels').replace('Hamilton, Madison y Jay','Federalistas').split(/\s+/).slice(-2).join(' ');
 const pathFor=(pts)=>pts.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');
 function mainGenealogy(){
  const rows=CLASSIC_GENEALOGIES; const x0=115, step=155, rowH=118, top=68;
  const width=Math.max(1700,...rows.map(r=>x0+(r.works.length-1)*step+150)),height=top+rows.length*rowH+40;
  const nodes=new Map(); let out='';
  rows.forEach((r,ri)=>{const y=top+ri*rowH;out+=`<rect x="0" y="${y-38}" width="${width}" height="${rowH-8}" class="gene-row-bg"/><text x="18" y="${y-7}" class="gene-row-title" fill="${r.color}">${esc(r.name)}</text><text x="18" y="${y+10}" class="gene-row-desc">${esc(r.desc)}</text>`;r.works.forEach((id,i)=>{const w=byId(id);if(!w)return;const x=x0+i*step;nodes.set(r.id+'|'+id,{x,y,w});if(i<r.works.length-1){const nId=r.works[i+1],nw=byId(nId);if(nw)out+=`<path d="M ${x+17} ${y} H ${x+step-17}" class="gene-link" stroke="${r.color}" marker-end="url(#garrow)"/>`;}out+=`<g class="gene-node" data-gwork="${w.id}" transform="translate(${x},${y})"><circle r="17" fill="${r.color}"/><text y="34" text-anchor="middle">${esc(short(w.author))}</text><title>${esc(w.author)} · ${esc(w.title)}</title></g>`;});});
  return `<svg viewBox="0 0 ${width} ${height}" class="genealogy-svg"><defs><marker id="garrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="context-stroke"/></marker></defs>${out}</svg>`;
 }
 function eraView(era='greece'){
  const list=authorNodes().filter(w=>w.era===era).sort((a,b)=>year(a)-year(b));
  const x0=90,step=165,y=150,width=Math.max(1350,x0+(list.length-1)*step+120),height=300;
  const known=new Set(list.map(w=>w.author)),relations=RELATIONS.filter(([a,b])=>known.has(a)&&known.has(b));
  const pos={};list.forEach((w,i)=>pos[w.author]={x:x0+i*step,y,w});
  const links=relations.map(([a,b])=>{const A=pos[a],B=pos[b];return `<path d="M ${A.x+17} ${A.y} H ${B.x-17}" class="era-link" marker-end="url(#earrow)"/>`}).join('');
  const ns=list.map(w=>`<g class="gene-node era-node" data-gwork="${w.id}" transform="translate(${pos[w.author].x},${y})"><circle r="17" fill="${eraColor(w.era)}"/><text y="34" text-anchor="middle">${esc(short(w.author))}</text><text y="48" text-anchor="middle" class="work-mini">${esc(w.date)}</text></g>`).join('');
  return `<svg viewBox="0 0 ${width} ${height}" class="genealogy-svg"><defs><marker id="earrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#a89b87"/></marker></defs><text x="20" y="32" class="era-title">${esc(eraName(era))}</text><text x="20" y="52" class="era-subtitle">Autores de la biblioteca y relaciones internas de recepción/influencia.</text>${links}${ns}</svg>`;
 }
 function bindGeneNodes(){ $$('.gene-node').forEach(n=>n.onclick=()=>openWork(n.dataset.gwork)); }
 window.renderVisuals=function(){
  if(!$('#mapModeBar')){network.insertAdjacentHTML('beforebegin',`<div id="mapModeBar" class="map-mode-bar"><button class="on" data-mapmode="main">Genealogías principales</button><button data-mapmode="era">Vista por época</button><select id="eraMapSelect" hidden>${ERAS.map(e=>`<option value="${e[0]}">${esc(e[1])}</option>`).join('')}</select></div>`);}
  const paint=()=>{const mode=$('[data-mapmode].on')?.dataset.mapmode||'main';if(mode==='main'){network.innerHTML=mainGenealogy();networkInfo.innerHTML='<b>Vista principal:</b> siete genealogías troncales. No intenta mostrar a todos los autores; privilegia claridad conceptual y continuidad histórica.';}else{network.innerHTML=eraView($('#eraMapSelect').value);networkInfo.innerHTML='<b>Vista secundaria por época:</b> muestra el conjunto más amplio de autores de ese período y relaciones internas registradas en el Atlas.';}bindGeneNodes();};
  $$('[data-mapmode]').forEach(b=>b.onclick=()=>{$$('[data-mapmode]').forEach(x=>x.classList.toggle('on',x===b));$('#eraMapSelect').hidden=b.dataset.mapmode!=='era';paint();});$('#eraMapSelect').onchange=paint;paint();
  const ec=ERAS.map(e=>[e[1],WORKS.filter(w=>w.era===e[0]).length]);bars(eraBars,ec);const f={};WORKS.flatMap(w=>w.concepts).forEach(c=>f[c]=(f[c]||0)+1);bars(conceptBars,Object.entries(f).sort((a,b)=>b[1]-a[1]).slice(0,20));renderMatrix();
 };
})();