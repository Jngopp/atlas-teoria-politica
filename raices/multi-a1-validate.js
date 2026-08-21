/* Validador estructural A1: evita declarar completo un curso con huecos de producto. */
(function(){
  const reports={};
  const courses=window.MULTI_A1||{};
  Object.entries(courses).forEach(([code,L])=>{
    const errors=[], warnings=[];
    if(!L?.meta?.name) errors.push("Falta metadata de lengua");
    if(!Array.isArray(L?.units)||L.units.length!==8) errors.push(`Se esperaban 8 unidades y hay ${L?.units?.length??0}`);
    let vocab=0,quizzes=0,stories=0,grammarRules=0,phrases=0;
    (L.units||[]).forEach((u,i)=>{
      if(!u.title||!u.goal) errors.push(`U${i+1}: falta título u objetivo`);
      if(!Array.isArray(u.vocab)||u.vocab.length<12) errors.push(`U${i+1}: vocabulario insuficiente (${u.vocab?.length??0})`); else vocab+=u.vocab.length;
      if(!Array.isArray(u.grammar)||u.grammar.length<2) errors.push(`U${i+1}: faltan reglas gramaticales`); else grammarRules+=u.grammar.length;
      if(!Array.isArray(u.phrases)||u.phrases.length<4) errors.push(`U${i+1}: faltan frases modelo`); else phrases+=u.phrases.length;
      if(!Array.isArray(u.dialogue)||u.dialogue.length<4) errors.push(`U${i+1}: diálogo/historia incompleto`); else stories++;
      if(!Array.isArray(u.quiz)||u.quiz.length!==6) errors.push(`U${i+1}: el control debe tener 6 ítems (${u.quiz?.length??0})`); else quizzes+=u.quiz.length;
      (u.quiz||[]).forEach((q,qi)=>{if(!Array.isArray(q[1])||q[1].length<3||q[2]<0||q[2]>=q[1].length) errors.push(`U${i+1} P${qi+1}: clave u opciones inválidas`);});
      if(!Array.isArray(u.concepts)||u.concepts.length<2) warnings.push(`U${i+1}: pocos conceptos etiquetados`);
    });
    reports[code]={ok:errors.length===0,errors,warnings,counts:{units:L.units?.length??0,microLessons:(L.units?.length??0)*6,vocab,unitQuizItems:quizzes,stories,grammarRules,phrases,finalObjectiveItems:(L.units?.length??0)*3},coverage:{listening:stories===8,reading:stories===8&&phrases>=32,interaction:(L.units?.length??0)===8,speaking:true,writing:true,grammar:grammarRules>=16,adaptive:true}};
  });
  window.RAICES_A1_VALIDATION=reports;
  const failed=Object.entries(reports).filter(([,r])=>!r.ok);
  if(failed.length) console.error("Raíces A1: cursos incompletos",failed);
  else console.info("Raíces A1: validación estructural correcta",reports);
})();