(async()=>{
  const modules=[
    'systems-v7-plato.js','systems-v7-hobbes.js','systems-v7-marx.js','systems-v7-cohesion.js','systems-v7-finalize.js',
    'systems-canon-builder.js','systems-canon-ancient-medieval.js','systems-canon-modern.js','systems-canon-idealism-contemporary.js',
    'course-enrichment-ancient-medieval.js','course-enrichment-modern.js','course-enrichment-idealism-marx.js','course-enrichment-contemporary.js',
    'systems-course-ui.js'
  ];
  const failures=[];
  async function runProtected(file){
    try{
      const r=await fetch(`${file}?v=12`,{cache:'no-store'});
      if(!r.ok)throw new Error(`${file}: HTTP ${r.status}`);
      const src=await r.text();
      new Function(`${src}\n//# sourceURL=${file}`)();
    }catch(error){
      failures.push({file,message:String(error.message||error)});
      console.error('POLIS module skipped',file,error);
    }
  }
  function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error(`No se pudo cargar ${src}`));document.body.appendChild(s)})}
  for(const file of modules)await runProtected(file);
  window.POLIS_V12_STATUS={modulesLoaded:modules.length-failures.length,failures,systems:window.POLIS_SYSTEMS?.systems?.length||0,courseProfiles:Object.keys(window.POLIS_COURSE_ENRICHMENT||{}).length};
  try{
    await loadScript('systems-learning-v9.js?v=12');
    await loadScript('settings.js?v=12');
  }catch(error){
    failures.push({file:'runtime',message:String(error.message||error)});
    console.error('POLIS v12 runtime failed',error);
  }
  window.dispatchEvent(new CustomEvent('polis:v12Ready',{detail:window.POLIS_V12_STATUS}));
})();
