window.MINI_CLASSES=window.MINI_CLASSES||{};
window.getMiniClass=function(w){
 if(MINI_CLASSES[w.id]&&MINI_CLASSES[w.id].lecture?.length)return MINI_CLASSES[w.id];
 const g=typeof getStudyGuide==='function'?getStudyGuide(w):{summary:[w.thesis],architecture:[],keys:{},debates:[],reception:[],study:[],secondary:[]};
 const incoming=(RELATIONS||[]).filter(r=>r[1]===w.author).map(r=>r[0]);
 const outgoing=(RELATIONS||[]).filter(r=>r[0]===w.author).map(r=>r[1]);
 const concepts=(w.concepts||[]).slice(0,5);
 const ctext=concepts.length?concepts.join(', '):'sus conceptos centrales';
 const prev=incoming.length?`En la genealogía del Atlas, esta posición recibe problemas o vocabularios de ${incoming.slice(0,3).join(', ')}.`:'Dentro del Atlas, la obra ocupa una posición de relativa apertura: no se la reduce a ser mera continuación de un antecedente canónico.';
 const next=outgoing.length?`Su recepción posterior puede seguirse, entre otros, hacia ${outgoing.slice(0,3).join(', ')}, lo que permite estudiar cómo una tesis cambia al pasar a otro contexto.`:'Su importancia no depende únicamente de una cadena lineal de influencia: puede funcionar como repertorio conceptual recuperado selectivamente por tradiciones posteriores.';
 const lecture=[
  `${w.title}, de ${w.author}, debe leerse como una intervención situada en ${w.context} El punto de partida es la pregunta ${w.problem} No conviene comenzar memorizando una definición aislada: la obra organiza una respuesta a ese problema y sólo desde allí adquieren sentido sus conceptos.`,
  `La tesis básica puede formularse así: ${w.thesis} Para reconstruirla con rigor hay que observar la secuencia del argumento. ${g.architecture?.length?`El recorrido pasa por ${g.architecture.slice(0,4).join('; ')}.`:''} Esa arquitectura muestra que la teoría política del texto no reside sólo en una conclusión, sino en el modo en que vincula diagnóstico, antropología, instituciones y criterios normativos.`,
  `El vocabulario decisivo incluye ${ctext}. Cada término debe interpretarse en el lenguaje de la obra antes de traducirlo a categorías actuales. ${Object.entries(g.keys||{}).slice(0,3).map(([k,v])=>`${k}: ${v}`).join(' ')} El aprendizaje universitario consiste precisamente en poder explicar esas diferencias de significado y no convertir a todos los clásicos en versiones tempranas de debates contemporáneos.`,
  `${prev} ${next} Esta ubicación genealógica es una herramienta de estudio, no una afirmación de dependencia causal absoluta: permite comparar preguntas, rupturas y recepciones sin borrar contextos históricos.`,
  `La bibliografía especializada discute especialmente ${g.debates?.length?g.debates.slice(0,3).join('; '):'el alcance de la tesis, su contexto y sus posibles usos contemporáneos'}. Para un examen, una respuesta sólida debería combinar cuatro operaciones: formular el problema, reconstruir la tesis, definir conceptos en su sentido específico y comparar la obra con al menos un antecedente o una recepción posterior.`
 ];
 return {lecture,route:g.architecture||[],compare:[...incoming.slice(0,2).map(a=>`Comparar con ${a} como antecedente o interlocutor relevante.`),...outgoing.slice(0,2).map(a=>`Comparar con ${a} para observar una recepción o transformación posterior.`)],exam:g.study||[],reading:g.secondary||[]};
};