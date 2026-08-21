/* Ajustes de consistencia posteriores a la carga de los cursos. */
(function(){
  if(window.OTHER_LANGS){
    ["ay","gn","arn"].forEach(k=>{if(window.OTHER_LANGS[k]) window.OTHER_LANGS[k].status="A1 completo";});
  }
  const ay=window.MULTI_A1?.ay;
  if(ay?.units?.[5]?.vocab){
    const row=ay.units[5].vocab.find(v=>v[0]==="munayaña");
    if(row) row[0]="munaña";
  }
})();