(()=>{
 const files=[
  '../postdoc-core.js','../postdoc-greece.js','../postdoc-rome.js','../postdoc-medieval-a.js','../postdoc-medieval-b.js',
  '../postdoc-modern-a.js','../postdoc-modern-b.js','../postdoc-revolutions-a.js','../postdoc-revolutions-b.js',
  '../postdoc-contemporary-a.js','../postdoc-contemporary-b.js','../postdoc-contemporary-c.js','../postdoc-contemporary-d.js','../postdoc-contemporary-e.js'
 ];
 function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=()=>resolve(src);s.onerror=()=>reject(new Error(src));document.head.appendChild(s)})}
 async function enrich(){for(const src of files){try{await load(src)}catch(e){console.warn('POLIS: enriquecimiento no disponible',src)}}document.documentElement.dataset.polisEnriched='true';}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(enrich,0),{once:true});else setTimeout(enrich,0);
})();