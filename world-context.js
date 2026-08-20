(function(){
 const esc=s=>(s??'').toString().replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
 const contexts=()=>window.WORLD_CONTEXTS||[];
 const works=()=>typeof WORKS!=='undefined'?WORKS:[];
 const byId=id=>contexts().find(c=>c.id===id);
 const getWork=id=>works().find(w=>w.id===id);
 const proj=(lon,lat)=>[500+(Number(lon)||0)*2.7777778,250-(Number(lat)||0)*2.7777778];
 const path=pts=>pts.map((p,i)=>{const [x,y]=proj(p[0],p[1]);return`${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`}).join(' ')+' Z';
 const LAND=[
  [[-168,72],[-142,71],[-124,58],[-112,51],[-96,50],[-82,44],[-65,47],[-52,58],[-75,20],[-92,15],[-107,22],[-120,33],[-132,52],[-155,60]],
  [[-82,12],[-67,10],[-50,3],[-35,-7],[-42,-24],[-55,-55],[-70,-51],[-78,-28],[-80,-5]],
  [[-11,36],[0,43],[14,45],[28,42],[40,50],[31,60],[25,71],[5,62],[-8,52]],
  [[-17,37],[10,37],[35,31],[50,12],[42,-10],[31,-35],[12,-35],[-4,-18],[-16,10]],
  [[30,35],[42,55],[67,72],[115,72],[170,61],[150,45],[145,22],[123,6],[103,8],[80,25],[60,24],[45,31]],
  [[112,-10],[154,-10],[153,-40],[116,-35]],
  [[-58,60],[-24,64],[-18,82],[-60,82]]
 ];
 function ensureStyle(){if(document.querySelector('link[href="world-context.css"]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='world-context.css';document.head.appendChild(l)}
 function ensureDOM(){
  const nav=document.querySelector('.nav');
  if(nav&&!nav.querySelector('[data-v="world"]')){const b=document.createElement('button');b.dataset.v='world';b.textContent='Mundo y contextos';const before=nav.querySelector('[data-v="concepts"]');nav.insertBefore(b,before||null);b.addEventListener('click',()=>{if(typeof show==='function')show('world');renderWorld();});}
  const main=document.querySelector('main.wrap');
  if(main&&!document.getElementById('world')){const s=document.createElement('section');s.id='world';s.className='view';s.innerHTML='<div class="section-head"><div><div class="eyebrow">CARTOGRAFÍA HISTÓRICA</div><h1>Mundo y contextos de la teoría política</h1><p>Un atlas para observar cómo cambian las preguntas políticas al cambiar Estados, imperios, ciudades, sociedades, guerras y lenguajes de legitimidad.</p></div></div><div id="worldApp"></div>';const concepts=document.getElementById('concepts');main.insertBefore(s,concepts||null);}
 }
 function centerXY(p){if(Number.isFinite(p.lon)&&Number.isFinite(p.lat))return proj(p.lon,p.lat);return[(Number(p.x)||50)*10,(Number(p.y)||50)*5]}
 function entitySVG(e,i){
  const [x,y]=proj(e.lon,e.lat),rx=Math.max(8,(e.rx||5)*2.7778),ry=Math.max(6,(e.ry||4)*2.7778);
  return `<g class="world-entity" data-entity="${i}"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"></ellipse><text x="${x}" y="${y+3}" text-anchor="middle">${esc(e.name)}</text></g>`;
 }
 function placeSVG(p,i){const [x,y]=centerXY(p);return `<g class="world-place" data-place="${i}" transform="translate(${x},${y})"><circle r="5.5"></circle><text x="9" y="4">${esc(p.name)}</text></g>`}
 function baseMap(ctx){
  const land=LAND.map(p=>`<path class="wm-land" d="${path(p)}"/>`).join('');
  const lonLines=[-120,-60,0,60,120].map(l=>{const [x]=proj(l,0);return`<line x1="${x}" y1="0" x2="${x}" y2="500"/>`}).join('');
  const latLines=[-60,-30,0,30,60].map(l=>{const [,y]=proj(0,l);return`<line x1="0" y1="${y}" x2="1000" y2="${y}"/>`}).join('');
  const ents=(ctx.entities||[]).map(entitySVG).join(''),pts=(ctx.places||[]).map(placeSVG).join('');
  return `<svg class="world-svg" viewBox="0 0 1000 500" role="img" aria-label="Mapa histórico mundial con entes políticos y focos intelectuales"><rect class="wm-ocean" width="1000" height="500"/><g class="wm-grid">${lonLines}${latLines}</g><g class="wm-continents">${land}</g><g class="world-entities" style="--wa:${ctx.accent}">${ents}</g><g class="world-centers-layer" style="--wa:${ctx.accent}">${pts}</g></svg>`;
 }
 function contextChain(ctx){
  const response=(ctx.works||[]).slice(0,7).map(id=>getWork(id)).filter(Boolean).map(w=>w.author).filter((x,i,a)=>a.indexOf(x)===i).join(' · ');
  return `<div class="world-chain"><div class="world-chain-row"><b>Estructura histórica</b><span class="arrow">→</span><p>${esc(ctx.order)}</p></div><div class="world-chain-row"><b>Conflicto</b><span class="arrow">→</span><p>${esc(ctx.conflicts)}</p></div><div class="world-chain-row"><b>Pregunta teórica</b><span class="arrow">→</span><p><strong>${esc(ctx.question)}</strong></p></div><div class="world-chain-row"><b>Autores / respuestas</b><span class="arrow">→</span><p>${esc(response||'Ver obras vinculadas.')}</p></div></div>`;
 }
 function workCards(ctx){return (ctx.works||[]).map(id=>getWork(id)).filter(Boolean).map(w=>`<button class="world-work" data-world-work="${w.id}" style="--wa:${ctx.accent}"><small>${esc(w.date)} · ${esc(w.trad)}</small><strong>${esc(w.author)}</strong><span>${esc(w.title)}</span><em>Abrir dossier →</em></button>`).join('')}
 function entitiesHTML(ctx){return (ctx.entities||[]).map((e,i)=>`<button class="world-entity-card" data-entity-card="${i}"><span class="world-entity-swatch"></span><div><strong>${esc(e.name)}</strong><small>${esc(e.dates)} · ${esc(e.kind)}</small><p><b>Centro:</b> ${esc(e.capital)}. ${esc(e.note)}</p></div></button>`).join('')}
 function mapLegendDefault(ctx){return `<b>${esc(ctx.label)}</b><p>${esc(ctx.entityNote||ctx.summary)}</p><div class="world-key"><span><i class="key-entity"></i>Ente político</span><span><i class="key-center"></i>Foco intelectual</span></div><div class="world-note">Las áreas de color representan alcance territorial aproximado y sirven para orientación comparativa; no son reconstrucciones cartográficas de fronteras. Revise las fechas porque dentro de períodos largos algunas entidades se suceden.</div>`}
 function render(ctxId){
  const app=document.getElementById('worldApp'),all=contexts(),ctx=byId(ctxId)||all[0];if(!app||!ctx)return;
  app.innerHTML=`<div class="world-shell" style="--wa:${ctx.accent}"><div class="world-toolbar panel"><div class="world-era-tabs">${all.map(c=>`<button data-world-era="${c.id}" class="${c.id===ctx.id?'on':''}">${esc(c.label)}</button>`).join('')}</div><select id="worldSelect">${all.map(c=>`<option value="${c.id}" ${c.id===ctx.id?'selected':''}>${esc(c.dates)} · ${esc(c.label)}</option>`).join('')}</select></div><div class="world-grid"><article class="world-map-card" id="worldMapCard"><div class="world-map-head"><div><div class="eyebrow">MAPA HISTÓRICO · FASE 1</div><h2>${esc(ctx.label)}</h2><p>${esc(ctx.dates)} · Entes políticos y focos intelectuales con localización geográfica normalizada.</p></div><div class="world-layers"><button class="on" data-layer="entities">Entes políticos</button><button class="on" data-layer="centers">Focos intelectuales</button><button class="on" data-layer="grid">Retícula</button></div></div><div class="world-map-wrap">${baseMap(ctx)}<div id="worldLegend" class="world-map-legend">${mapLegendDefault(ctx)}</div></div></article><article class="world-context-card"><div class="world-context-head"><div class="eyebrow">CONTEXTO DE ÉPOCA</div><h2>Qué mundo hace posible estas preguntas</h2><p>${esc(ctx.summary)}</p></div><div class="world-context-body"><article><h3>Orden político</h3><p>${esc(ctx.order)}</p></article><article><h3>Estructura social</h3><p>${esc(ctx.society)}</p></article><article><h3>Lenguajes de legitimidad</h3><p>${esc(ctx.legitimacy)}</p></article><article><h3>Conflictos estructurales</h3><p>${esc(ctx.conflicts)}</p></article></div><div class="world-entity-section"><div class="eyebrow">PRINCIPALES ENTES POLÍTICOS</div><p class="world-note">Selección analítica: entidades decisivas para comprender el campo de problemas del período, no inventario exhaustivo.</p><div class="world-entity-list">${entitiesHTML(ctx)}</div></div><div class="world-question"><small>PROBLEMA TEÓRICO DOMINANTE</small><strong>${esc(ctx.question)}</strong></div></article></div><div class="world-lower"><article class="world-timeline-card"><div class="eyebrow">CRONOLOGÍA SINCRONIZADA</div><h2 class="world-section-title">Acontecimientos y transformaciones</h2><div class="world-timeline">${ctx.events.map(e=>`<div class="world-event"><time>${esc(e[0])}</time><div class="dotcol"></div><p>${esc(e[1])}</p></div>`).join('')}</div></article><article class="world-theory-card"><div class="eyebrow">TEORÍA Y CONTEXTO</div><h2 class="world-section-title">Del mundo histórico al problema político</h2><div class="world-centers">${ctx.centers.map(x=>`<span>${esc(x)}</span>`).join('')}</div>${contextChain(ctx)}</article><article class="world-works-card"><div class="eyebrow">OBRAS VINCULADAS</div><h2 class="world-section-title">Qué leer para estudiar este contexto</h2><p class="world-note">La vinculación no afirma que el texto sea mero reflejo de su época: muestra el campo de problemas dentro del cual interviene y las traducciones posteriores que lo vuelven parte del canon.</p><div class="world-work-grid">${workCards(ctx)}</div></article></div></div>`;
  document.getElementById('worldSelect').onchange=e=>render(e.target.value);
  document.querySelectorAll('[data-world-era]').forEach(b=>b.onclick=()=>render(b.dataset.worldEra));
  document.querySelectorAll('[data-world-work]').forEach(b=>b.onclick=()=>{if(typeof openWork==='function')openWork(b.dataset.worldWork)});
  document.querySelectorAll('.world-place').forEach(g=>g.onclick=()=>selectPlace(ctx,Number(g.dataset.place),g));
  document.querySelectorAll('.world-entity').forEach(g=>g.onclick=()=>selectEntity(ctx,Number(g.dataset.entity),g));
  document.querySelectorAll('[data-entity-card]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.entityCard),node=document.querySelector(`.world-entity[data-entity="${i}"]`);selectEntity(ctx,i,node);node?.scrollIntoView({block:'nearest'});});
  document.querySelectorAll('[data-layer]').forEach(b=>b.onclick=()=>toggleLayer(b));
 }
 function toggleLayer(btn){const card=document.getElementById('worldMapCard'),layer=btn.dataset.layer;if(!card)return;btn.classList.toggle('on');card.classList.toggle(`hide-${layer}`,!btn.classList.contains('on'))}
 function clearMapSelection(){document.querySelectorAll('.world-place,.world-entity,.world-entity-card').forEach(x=>x.classList.remove('active'))}
 function selectEntity(ctx,i,node){
  const e=ctx.entities?.[i];if(!e)return;clearMapSelection();node?.classList.add('active');document.querySelector(`[data-entity-card="${i}"]`)?.classList.add('active');
  const legend=document.getElementById('worldLegend');if(!legend)return;
  legend.innerHTML=`<div class="legend-type">ENTE POLÍTICO</div><b>${esc(e.name)}</b><p><strong>${esc(e.dates)}</strong><br>${esc(e.kind)}</p><p><b>Capital / centro:</b> ${esc(e.capital)}</p><p>${esc(e.note)}</p><div class="world-note">Huella territorial deliberadamente aproximada. La ficha identifica la entidad histórica; el mapa no pretende fijar una frontera exacta para todo el intervalo.</div>`;
 }
 function selectPlace(ctx,i,node){
  const p=ctx.places?.[i];if(!p)return;clearMapSelection();node?.classList.add('active');
  const ws=(p.works||[]).map(getWork).filter(Boolean),legend=document.getElementById('worldLegend');if(!legend)return;
  legend.innerHTML=`<div class="legend-type">FOCO INTELECTUAL</div><b>${esc(p.name)}</b><p>${esc(p.note)}</p>${ws.length?`<div class="world-place-detail"><h4>${ws.length} obra${ws.length>1?'s':''} vinculada${ws.length>1?'s':''}</h4><p>${ws.slice(0,5).map(w=>esc(w.author+' · '+w.title)).join('<br>')}</p>${ws[0]?`<button data-place-open="${ws[0].id}">Abrir ${esc(ws[0].title)} →</button>`:''}</div>`:''}<div class="world-note">El punto usa coordenadas geográficas del foco o una localización representativa cuando la etiqueta reúne varios centros.</div>`;
  legend.querySelector('[data-place-open]')?.addEventListener('click',e=>{if(typeof openWork==='function')openWork(e.currentTarget.dataset.placeOpen)});
 }
 function renderWorld(){ensureStyle();ensureDOM();const all=contexts();if(!all.length)return;render(document.getElementById('worldSelect')?.value||all[0].id)}
 window.renderWorld=renderWorld;
 function boot(){ensureStyle();ensureDOM();const b=document.querySelector('[data-v="world"]');if(b&&!b.dataset.worldBound){b.dataset.worldBound='1';b.addEventListener('click',()=>setTimeout(renderWorld,0));}renderWorld();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();