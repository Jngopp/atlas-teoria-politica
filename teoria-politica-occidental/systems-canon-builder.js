(()=>{
 const DATA=window.POLIS_SYSTEMS;if(!DATA)return;
 window.POLIS_SYSTEM_TEACHING=window.POLIS_SYSTEM_TEACHING||{};
 window.POLIS_SYSTEM_DISCOVERY=window.POLIS_SYSTEM_DISCOVERY||{};
 const skills=['concepts','argument','relations','application'];
 function addSystem(cfg){
  if(!cfg||DATA.systems.some(s=>s.id===cfg.id))return;
  const activities=[];
  const teaching=[];
  cfg.lessons.forEach((lesson,i)=>{
   const base=cfg.prefix+String(i+1).padStart(2,'0');
   const a1=base+'a',a2=base+'b',lessonId=cfg.id+'-'+(i+1);
   const check=lesson.check||{};
   activities.push({id:a1,type:check.type||'choice',skill:lesson.skill||skills[i%skills.length],title:check.title||lesson.title,prompt:check.prompt||'¿Cuál reconstruye mejor esta pieza del argumento?',scenario:check.scenario,options:check.options||[],answer:Number.isInteger(check.answer)?check.answer:0,explain:check.explain||lesson.tip||lesson.body});
   activities.push({id:a2,type:'order',skill:'argument',title:'Arquitectura · '+lesson.title,prompt:'Ordená el movimiento conceptual.',items:[...(lesson.relation||[])],explain:'La cadena reconstruye el movimiento argumental de esta microlección.'});
   teaching.push({id:lessonId,title:lesson.title,hook:lesson.hook,body:lesson.body,relation:lesson.relation||[],terms:lesson.terms||[],quote:lesson.quote||null,example:lesson.example||'',tip:lesson.tip||'',activities:[a1,a2]});
   if(lesson.discovery)window.POLIS_SYSTEM_DISCOVERY[lessonId]=lesson.discovery;
  });
  DATA.systems.push({id:cfg.id,author:cfg.author,work:cfg.work,workId:cfg.workId||'',icon:cfg.icon||'📚',tagline:cfg.tagline,nodes:cfg.lessons.map(l=>l.title),activities});
  window.POLIS_SYSTEM_TEACHING[cfg.id]=teaching;
 }
 window.POLIS_ADD_SYSTEM=addSystem;
 window.POLIS_ORDER_SYSTEMS=function(ids){const m=new Map(DATA.systems.map(s=>[s.id,s]));const ordered=ids.map(id=>m.get(id)).filter(Boolean);DATA.systems.forEach(s=>{if(!ids.includes(s.id))ordered.push(s)});DATA.systems.splice(0,DATA.systems.length,...ordered)};
})();
