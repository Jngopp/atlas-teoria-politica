// Integra la capa postdoctoral con el dossier profundo sin perder las extensiones del curso.
(function(){
 const base=window.getRichStudyGuide;
 const uniq=a=>[...new Set((a||[]).filter(Boolean))];
 function merge(w){
  const b=typeof base==='function'?base(w):null;
  const p=window.getPostdocGuide?.(w);
  if(!p)return b;
  const keys={...(b?.keys||{}),...(p.concepts||{})};
  return {
   ...(b||{}),
   summary:p.overview?.length?p.overview:(b?.summary||[w.thesis]),
   problemAnalysis:uniq([...(p.overview||[]),...(b?.problemAnalysis||[])]),
   architecture:p.argument?.length?p.argument:(b?.architecture||[]),
   keys,
   debates:uniq([...(p.debates||[]),...(b?.debates||[])]),
   comparisons:uniq([...(p.comparisons||[]),...(b?.comparisons||[])]),
   reception:uniq([...(p.reception||[]),...(b?.reception||[])]),
   study:uniq([...(p.exam||[]),...(b?.study||[])]),
   secondary:uniq([...(p.bibliography||[]),...(b?.secondary||[])])
  };
 }
 window.getRichStudyGuide=merge;
 window.getIntegratedGuide=merge;
})();