const CACHE='zhengdu-v1';
const CORE=['./','index.html','styles.css','data.js','app.js','manifest.webmanifest','icon.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{if(resp.ok&&new URL(e.request.url).origin===location.origin){const cp=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return resp}).catch(()=>caches.match('./'))))});
