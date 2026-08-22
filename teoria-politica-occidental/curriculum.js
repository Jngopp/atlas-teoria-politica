window.POLIS_CURRICULUM={
 name:'POLIS',subtitle:'Teoría política occidental · curso interactivo',
 eras:['greece','rome','medieval','modern','revolutions','contemporary'],
 prelude:['gilgamesh','hammurabi','merikare','peasant'],
 essential:[
  'herodotus','thucydides','sophocles','republic','statesman','laws','nicomachean','politics',
  'polybius','cicero','cicero-laws','sallust','tacitus','citygod','aquinas','dante','marsilius',
  'prince','discourses','more','bodin','grotius','leviathan','spinoza','locke',
  'hume','montesquieu','rousseau','smith','federalist','sieyes','burke','paine','wollstonecraft',
  'constant','hegel','tocqueville','manifesto','marx18','mill','nietzsche','dubois','weber',
  'lenin','luxemburg','gramsci','schmitt','arendt-origins','arendt','beauvoir','fanon','berlin',
  'rawls','nozick','foucault','pateman','mills-racial','young','habermas','ranciere','pettit','butler','mouffe','mbembe'
 ],
 eraMeta:{
  greece:{name:'Grecia · polis, justicia y constitución',icon:'🏛️',color:'#356b96'},
  rome:{name:'Roma · república, ley e imperio',icon:'🏺',color:'#8f3f3f'},
  medieval:{name:'Edad Media · autoridad, ley y jurisdicción',icon:'⛪',color:'#6f5685'},
  modern:{name:'Modernidad · Estado, soberanía y contrato',icon:'🦁',color:'#3f7058'},
  revolutions:{name:'Revoluciones y siglo XIX · derechos, nación y sociedad',icon:'⚑',color:'#b45136'},
  contemporary:{name:'Siglos XX–XXI · poder, justicia y democracia',icon:'◉',color:'#50545c'}
 },
 lenses:[
  {id:'justicia',label:'Justicia',terms:['justicia','equidad','ley natural']},
  {id:'libertad',label:'Libertad',terms:['libertad','libertas','no-dominación','autonomía']},
  {id:'autoridad',label:'Autoridad y obligación',terms:['autoridad','obediencia','obligación','legitimidad']},
  {id:'estado',label:'Estado y soberanía',terms:['Estado','soberanía','gobierno','administración']},
  {id:'democracia',label:'Democracia y representación',terms:['democracia','representación','ciudadanía','soberanía popular']},
  {id:'propiedad',label:'Propiedad y economía',terms:['propiedad','mercado','capitalismo','trabajo','clase']},
  {id:'revolucion',label:'Revolución y cambio',terms:['revolución','poder constituyente','emancipación','reforma']},
  {id:'poder',label:'Poder y dominación',terms:['poder','dominación','disciplina','hegemonía','violencia']},
  {id:'igualdad',label:'Igualdad y diferencia',terms:['igualdad','género','raza','reconocimiento','diferencia']},
  {id:'republica',label:'República y virtud',terms:['república','virtud','constitución mixta','corrupción']}
 ],
 milestones:[
  {id:'ancient',label:'Benchmark clásico',eras:['greece','rome'],min:10},
  {id:'medieval-modern',label:'Benchmark autoridad y Estado',eras:['medieval','modern'],min:8},
  {id:'revolutions',label:'Benchmark revoluciones y siglo XIX',eras:['revolutions'],min:8},
  {id:'contemporary',label:'Benchmark contemporáneo',eras:['contemporary'],min:12}
 ]
};