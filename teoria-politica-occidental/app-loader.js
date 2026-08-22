(async()=>{
  const screen=document.querySelector('#screen');
  try{
    const response=await fetch('app.js?v=3',{cache:'no-store'});
    if(!response.ok) throw new Error(`No se pudo cargar app.js (${response.status})`);
    let src=await response.text();
    const broken='next.disabled=false})}}}paint()}';
    const fixed='next.disabled=false})}}paint()}';
    if(src.includes(broken)) src=src.replace(broken,fixed);
    new Function(`${src}\n//# sourceURL=polis-app-runtime.js`)();
    window.POLIS_BOOT_ERROR=null;
    window.dispatchEvent(new Event('polis:ready'));
  }catch(error){
    window.POLIS_BOOT_ERROR=`${error.name||'Error'}: ${error.message||error}`;
    console.error('POLIS boot error',error);
    if(screen){
      screen.innerHTML=`<div class="page"><section class="hero"><div class="eyebrow">POLIS</div><h1>La interfaz no pudo iniciar</h1><p>El motor encontró un error durante el arranque.</p></section><section class="card"><b>Diagnóstico:</b><p class="note">${window.POLIS_BOOT_ERROR}</p><pre class="note" style="white-space:pre-wrap">${error.stack||''}</pre></section></div>`;
    }
  }
})();