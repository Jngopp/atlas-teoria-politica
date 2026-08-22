const CACHE='polis-western-v7';
const CORE=['./','index.html','styles.css','systems.css','systems-teaching.css','learning-flow.css','systems-dense.css','curriculum.js','app.js','app-loader.js','genealogies.js','enrichment.js','systems-data.js','systems-engine.js','systems-teaching-data.js','systems-discovery-data.js','systems-v7-plato.js','systems-v7-hobbes.js','systems-v7-marx.js','systems-v7-finalize.js','systems-teaching-loader.js','systems-dense-ui.js','settings.js','manifest.webmanifest','icon.svg','../data.js','../world-context-data.js'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
function put(req,resp){if(resp&&resp.ok&&new URL(req.url).origin===location.origin){const cp=resp.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return resp}
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url),fresh=e.request.mode==='navigate'||/\.(?:js|css|html)$/.test(u.pathname);
 if(fresh){e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>put(e.request,r)).catch(()=>caches.match(e.request).then(r=>r||caches.match('./'))));return}
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>put(e.request,x)).catch(()=>caches.match('./'))));
});