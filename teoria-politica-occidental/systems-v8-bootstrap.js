(async()=>{
  const advanced=['systems-v7-plato.js','systems-v7-hobbes.js','systems-v7-marx.js','systems-v7-cohesion.js','systems-v7-finalize.js'];
  const failures=[];
  async function runProtected(file){
    try{
      const r=await fetch(`${file}?v=8`,{cache:'no-store'});
      if(!r.ok) throw new Error(`${file}: HTTP ${r.status}`);
      const src=await r.text();
      new Function(`${src}\n//# sourceURL=${file}`)();
    }catch(error){
      failures.push({file,message:String(error.message||error)});
      console.error('POLIS advanced module skipped',file,error);
    }
  }
  function loadScript(src){
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error(`No se pudo cargar ${src}`));
      document.body.appendChild(s);
    });
  }
  for(const file of advanced) await runProtected(file);
  window.POLIS_V8_STATUS={advancedLoaded:advanced.length-failures.length,failures};
  try{
    await loadScript('systems-teaching-loader.js?v=8');
    await loadScript('systems-dense-ui.js?v=8');
    await loadScript('systems-dense-practice.js?v=8');
    await loadScript('settings.js?v=8');
  }catch(error){
    failures.push({file:'runtime',message:String(error.message||error)});
    console.error('POLIS runtime layer failed',error);
  }
  window.dispatchEvent(new CustomEvent('polis:v8Ready',{detail:window.POLIS_V8_STATUS}));
})();