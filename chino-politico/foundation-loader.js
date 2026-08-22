/* 政读 · base general de lectura (HSK 3.0 ES, MIT) */
(function(){
  const REV='9172e0ef590c658091895f75b0430c1074264c66';
  const KEY='zhengdu-foundation-es-v1';
  const BASE=`https://cdn.jsdelivr.net/gh/nar-ran/hsk-vocab-es@${REV}/data/`;
  const RAW=`https://raw.githubusercontent.com/nar-ran/hsk-vocab-es/${REV}/data/`;
  const files=['hsk1.json','hsk2.json','hsk3.json'];
  const F={ready:false,loading:false,error:null,chars:[],words:[],counts:{chars:0,words:0},revision:REV,license:'MIT',source:'nar-ran/hsk-vocab-es'};
  function normalize(parts){
    const chars=[],words=[];
    parts.forEach(d=>{
      const lvl=Number(d.level)||0;
      (d.characters||[]).forEach((x,i)=>chars.push({id:`fc:${lvl}:${i}`,h:x.hanzi,p:x.pinyin||'',m:(x.translation||[]).join(' / '),level:lvl,example:x.example||null,note:x.notes||'',foundation:true}));
      (d.words||[]).forEach((x,i)=>words.push({id:`fw:${lvl}:${i}`,h:x.hanzi,p:x.pinyin||'',m:(x.translation||[]).join(' / '),level:lvl,example:x.example||null,note:x.notes||'',foundation:true}));
    });
    return {chars,words,counts:{chars:chars.length,words:words.length},revision:REV,license:'MIT',source:'nar-ran/hsk-vocab-es'};
  }
  function hydrate(data){Object.assign(F,data,{ready:true,loading:false,error:null});document.dispatchEvent(new CustomEvent('zhengdu-foundation-ready',{detail:F}));return F}
  async function getFile(name){
    let r=await fetch(BASE+name,{cache:'force-cache'}).catch(()=>null);
    if(!r||!r.ok)r=await fetch(RAW+name,{cache:'force-cache'});
    if(!r.ok)throw new Error(`No se pudo cargar ${name}`);
    return r.json();
  }
  async function load(){
    if(F.ready)return F;if(F.loading)return new Promise((resolve,reject)=>{document.addEventListener('zhengdu-foundation-ready',()=>resolve(F),{once:true});setTimeout(()=>F.error&&reject(F.error),12000)});
    F.loading=true;
    try{const cached=localStorage.getItem(KEY);if(cached){const data=JSON.parse(cached);if(data.revision===REV&&data.chars?.length===900&&data.words?.length===2245)return hydrate(data)}}catch(e){}
    try{const data=normalize(await Promise.all(files.map(getFile)));if(data.chars.length!==900||data.words.length!==2245)throw new Error(`Conteo inesperado: ${data.chars.length}/${data.words.length}`);try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}return hydrate(data)}catch(e){F.loading=false;F.error=e;document.dispatchEvent(new CustomEvent('zhengdu-foundation-error',{detail:e}));throw e}
  }
  function clearCache(){localStorage.removeItem(KEY);F.ready=false;F.chars=[];F.words=[];F.counts={chars:0,words:0}}
  window.ZhengduFoundation=Object.assign(F,{load,clearCache,urls:files.map(x=>BASE+x)});
  load().catch(()=>{});
})();
