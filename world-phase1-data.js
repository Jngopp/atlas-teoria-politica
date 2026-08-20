(function(){
 const C=window.WORLD_CONTEXTS||[];
 const cfg={
  'ancient-east':{
   dates:'c. 3000 a. C.–220 d. C. · trayectorias no sincrónicas',
   entityNote:'Este bloque reúne tradiciones de larga duración de Egipto, Mesopotamia, China e India. Los entes mostrados no fueron todos contemporáneos: las fechas de cada uno son parte del argumento histórico.',
   entities:[
    {name:'Reinos de Egipto faraónico',dates:'c. 2686–1070 a. C. (Reinos Antiguo–Nuevo)',kind:'monarquía territorial sacral',capital:'Menfis / Tebas',lon:31,lat:27,rx:7,ry:11,note:'Realeza, administración escribal, tributación y Maat como gramática de orden.'},
    {name:'Babilonia paleobabilónica',dates:'c. 1894–1595 a. C.',kind:'monarquía mesopotámica',capital:'Babilonia',lon:44.4,lat:32.5,rx:6,ry:5,note:'Marco histórico de Hammurabi y de la autorrepresentación del rey como juez.'},
    {name:'Imperio neoasirio',dates:'911–609 a. C.',kind:'imperio tributario-militar',capital:'Nínive',lon:43.2,lat:36.3,rx:17,ry:10,note:'Centralización militar, deportaciones y administración imperial de gran escala.'},
    {name:'Imperio aqueménida',dates:'c. 550–330 a. C.',kind:'imperio multinacional',capital:'Persépolis / Susa',lon:52.5,lat:31,rx:34,ry:15,note:'Satrapías, caminos imperiales y gobierno de poblaciones diversas.'},
    {name:'Zhou tardío / Reinos Combatientes',dates:'770–221 a. C.',kind:'sistema de reinos rivales',capital:'Luoyang y cortes regionales',lon:112,lat:34.5,rx:18,ry:10,note:'Competencia interestatal que estructura confucianismo, mohismo, daoísmo y legalismo.'},
    {name:'Imperio Qin y comienzo Han',dates:'221 a. C.–220 d. C.',kind:'imperio burocrático centralizado',capital:'Xianyang / Chang’an',lon:109,lat:34,rx:17,ry:10,note:'Unificación administrativa, estandarización y consolidación de un Estado imperial.'},
    {name:'Imperio Maurya',dates:'c. 321–185 a. C.',kind:'imperio territorial',capital:'Pataliputra',lon:85.1,lat:25.6,rx:16,ry:11,note:'Gran escala territorial y desarrollo de repertorios de administración, fiscalidad y diplomacia.'}
   ]
  },
  'greece':{
   entityNote:'La teoría griega surge en un sistema de poleis autónomas atravesado por ligas, hegemonías e imperios. El mapa distingue la escala de la polis de la escala imperial persa y macedónica.',
   entities:[
    {name:'Atenas y Liga de Delos',dates:'478–404 a. C.',kind:'polis democrática / hegemonía marítima',capital:'Atenas',lon:23.73,lat:37.98,rx:5,ry:4,note:'Democracia directa, imperio marítimo y conflicto entre ciudadanía e imperialismo.'},
    {name:'Esparta y Liga del Peloponeso',dates:'s. VI–IV a. C.',kind:'polis oligárquico-militar / liga',capital:'Esparta',lon:22.43,lat:37.07,rx:5,ry:4,note:'Contramodelo institucional de Atenas y potencia decisiva en la Guerra del Peloponeso.'},
    {name:'Liga Beocia / Tebas',dates:'c. 379–338 a. C.',kind:'federación de poleis',capital:'Tebas',lon:23.32,lat:38.32,rx:4,ry:3,note:'Hegemonía breve que muestra la pluralidad de arreglos federales del mundo griego.'},
    {name:'Imperio aqueménida',dates:'550–330 a. C.',kind:'imperio multinacional',capital:'Persépolis / Susa',lon:52.5,lat:31,rx:34,ry:15,note:'Gran potencia oriental frente a la cual autores griegos construyen contrastes sobre libertad, monarquía e imperio.'},
    {name:'Reino de Macedonia / imperio de Alejandro',dates:'359–323 a. C.',kind:'monarquía militar expansiva',capital:'Pella',lon:22.52,lat:40.76,rx:26,ry:12,note:'Desarticula el equilibrio clásico de las poleis y abre el mundo helenístico.'}
   ]
  },
  'rome':{
   entityNote:'El período incluye entidades helenísticas y dos formas romanas distintas. La superposición permite ver el tránsito desde pluralidad mediterránea hacia hegemonía romana.',
   entities:[
    {name:'República romana',dates:'509–27 a. C.',kind:'república aristocrático-popular',capital:'Roma',lon:12.5,lat:41.9,rx:30,ry:14,note:'Magistraturas, Senado y pueblo articulan un régimen mixto en expansión.'},
    {name:'Imperio romano',dates:'27 a. C.–395/476 d. C.',kind:'principado / monarquía imperial',capital:'Roma / Constantinopla',lon:18,lat:40,rx:39,ry:17,note:'Centralización principesca, ejército profesional y administración provincial.'},
    {name:'Reino ptolemaico',dates:'305–30 a. C.',kind:'monarquía helenística',capital:'Alejandría',lon:29.92,lat:31.2,rx:8,ry:8,note:'Egipto helenístico y gran centro mediterráneo de producción y traducción.'},
    {name:'Imperio seléucida',dates:'312–63 a. C.',kind:'monarquía helenística imperial',capital:'Antioquía / Seleucia',lon:38,lat:35,rx:25,ry:12,note:'Amplio espacio de ciudades y poblaciones heterogéneas entre Mediterráneo y Asia.'},
    {name:'Macedonia antigónida',dates:'277–168 a. C.',kind:'monarquía helenística',capital:'Pella',lon:22.5,lat:40.7,rx:7,ry:5,note:'Una de las grandes monarquías sucesoras de Alejandro.'}
   ]
  },
  'medieval':{
   entityNote:'La Edad Media no forma un sistema político unitario. Imperios, califatos, reinos, papado y ciudades superponen jurisdicciones; esa pluralidad es parte del problema teórico.',
   entities:[
    {name:'Imperio romano de Oriente',dates:'330–1453',kind:'imperio cristiano',capital:'Constantinopla',lon:28.98,lat:41.01,rx:15,ry:9,note:'Continuidad imperial romana oriental y centro político-cristiano del Mediterráneo.'},
    {name:'Califato omeya',dates:'661–750',kind:'califato imperial',capital:'Damasco',lon:36.29,lat:33.51,rx:42,ry:15,note:'Expansión desde Iberia hasta Asia central bajo una autoridad califal.'},
    {name:'Califato abasí',dates:'750–1258',kind:'califato imperial',capital:'Bagdad',lon:44.36,lat:33.31,rx:27,ry:14,note:'Bagdad se vuelve núcleo de traducción, filosofía y administración.'},
    {name:'Califato de Córdoba',dates:'929–1031',kind:'califato occidental',capital:'Córdoba',lon:-4.78,lat:37.88,rx:8,ry:5,note:'Centro andalusí de poder y cultura filosófica.'},
    {name:'Sacro Imperio Romano Germánico',dates:'962–1806',kind:'monarquía imperial electiva',capital:'corte itinerante',lon:10,lat:50,rx:10,ry:8,note:'Múltiples principados y ciudades bajo una estructura imperial no centralizada.'},
    {name:'Reino de Francia',dates:'987–1453',kind:'monarquía feudal en centralización',capital:'París',lon:2.35,lat:48.86,rx:8,ry:6,note:'Ejemplo de consolidación dinástica dentro del mosaico jurisdiccional medieval.'},
    {name:'Estados Pontificios',dates:'756–1870',kind:'principado eclesiástico',capital:'Roma',lon:12.5,lat:42.5,rx:4,ry:4,note:'Poder temporal del papado y actor central en disputas de jurisdicción.'}
   ]
  },
  'early-modern':{
   entityNote:'La formación del Estado moderno convive con monarquías compuestas, repúblicas mercantiles e imperios. La centralización es un proceso desigual, no un punto de partida.',
   entities:[
    {name:'Monarquía francesa',dates:'1453–1688',kind:'monarquía territorial',capital:'París',lon:2.3,lat:47,rx:9,ry:6,note:'Consolidación fiscal, judicial y militar atravesada por guerras de religión.'},
    {name:'Reino de Inglaterra',dates:'1485–1688',kind:'monarquía parlamentaria en transformación',capital:'Londres',lon:-1.5,lat:52,rx:5,ry:5,note:'Reforma, guerra civil, Commonwealth, Restauración y Revolución Gloriosa.'},
    {name:'Monarquía Hispánica',dates:'1479–1700',kind:'monarquía compuesta e imperio atlántico',capital:'Madrid',lon:-4,lat:40,rx:10,ry:8,note:'Corona europea y dominio ultramarino; centro decisivo del primer sistema atlántico moderno.'},
    {name:'República de las Provincias Unidas',dates:'1588–1795',kind:'república federal mercantil',capital:'La Haya / Ámsterdam',lon:5.3,lat:52.1,rx:3,ry:2,note:'Federalismo, comercio, tolerancia relativa y gran esfera editorial.'},
    {name:'Sacro Imperio',dates:'962–1806',kind:'imperio compuesto',capital:'sin capital única',lon:10,lat:50,rx:10,ry:8,note:'Persistencia de jurisdicciones y soberanías compartidas.'},
    {name:'Imperio otomano',dates:'c. 1453–1688',kind:'imperio dinástico',capital:'Constantinopla',lon:32,lat:39,rx:20,ry:12,note:'Gran potencia euroasiática y mediterránea del período.'},
    {name:'República de Venecia',dates:'697–1797',kind:'república oligárquica mercantil',capital:'Venecia',lon:12.33,lat:45.44,rx:5,ry:4,note:'Modelo de estabilidad republicana y poder comercial.'},
    {name:'Florencia / Gran Ducado de Toscana',dates:'s. XV–XVII',kind:'república y luego principado',capital:'Florencia',lon:11.25,lat:43.77,rx:3,ry:3,note:'Laboratorio político inmediato de Maquiavelo.'}
   ]
  },
  'enlightenment-revolutions':{
   entityNote:'La era atlántica combina monarquías imperiales con nuevos Estados constitucionales. Las fechas permiten distinguir el orden anterior a 1789 de los regímenes revolucionarios que lo reemplazan.',
   entities:[
    {name:'Gran Bretaña',dates:'1707–1815',kind:'monarquía parlamentaria e imperio',capital:'Londres',lon:-2,lat:54,rx:6,ry:7,note:'Sociedad comercial, parlamento y creciente imperio atlántico.'},
    {name:'Monarquía francesa / Francia revolucionaria',dates:'c. 1688–1815',kind:'monarquía, república e imperio',capital:'París',lon:2,lat:47,rx:9,ry:6,note:'El mismo espacio territorial atraviesa una transformación radical de legitimidad.'},
    {name:'Estados Unidos',dates:'1776–1815',kind:'república federal',capital:'Filadelfia / Washington',lon:-79,lat:38,rx:15,ry:9,note:'Constitucionalismo representativo, federalismo y expansión territorial.'},
    {name:'Saint-Domingue / Haití',dates:'1791–1804+',kind:'revolución esclava / república independiente',capital:'Cap-Haïtien / Puerto Príncipe',lon:-72.3,lat:19,rx:2.5,ry:2.2,note:'La revolución haitiana radicaliza la contradicción entre derechos universales y esclavitud.'},
    {name:'Monarquía española',dates:'1700–1815',kind:'monarquía imperial',capital:'Madrid',lon:-4,lat:40,rx:10,ry:8,note:'Imperio atlántico cuya crisis abre el ciclo de independencias hispanoamericanas.'},
    {name:'Reino de Prusia',dates:'1701–1815',kind:'monarquía militar-burocrática',capital:'Berlín',lon:13.4,lat:52.5,rx:8,ry:5,note:'Potencia en ascenso y referencia para debates sobre Estado y reforma.'}
   ]
  },
  'long-19th':{
   entityNote:'El siglo XIX combina Estados nacionales en consolidación con imperios multinacionales y coloniales. Las entidades seleccionadas explican el trasfondo de nacionalismo, industrialización, clase y democratización.',
   entities:[
    {name:'Reino Unido de Gran Bretaña e Irlanda',dates:'1801–1914',kind:'monarquía parlamentaria e imperio',capital:'Londres',lon:-3,lat:54,rx:6,ry:7,note:'Epicentro de industrialización, liberalismo parlamentario y expansión imperial.'},
    {name:'Francia',dates:'1815–1914',kind:'monarquías, imperio y repúblicas',capital:'París',lon:2,lat:47,rx:9,ry:6,note:'Revoluciones, bonapartismo y republicanización convierten al país en laboratorio de cambio de régimen.'},
    {name:'Imperio alemán',dates:'1871–1918',kind:'monarquía federal imperial',capital:'Berlín',lon:10,lat:51,rx:9,ry:6,note:'Unificación nacional, industrialización acelerada y Estado burocrático.'},
    {name:'Imperio ruso',dates:'1721–1917',kind:'autocracia imperial',capital:'San Petersburgo',lon:60,lat:55,rx:35,ry:18,note:'Gran imperio territorial con modernización desigual y conflictividad revolucionaria.'},
    {name:'Estados Unidos',dates:'1815–1914',kind:'república federal',capital:'Washington',lon:-98,lat:39,rx:25,ry:12,note:'Democratización para varones blancos, expansión continental, guerra civil y reconstrucción.'},
    {name:'Imperio austrohúngaro',dates:'1867–1918',kind:'monarquía dual multinacional',capital:'Viena / Budapest',lon:16,lat:48,rx:10,ry:7,note:'Pluralidad nacional dentro de una estructura imperial dinástica.'},
    {name:'Imperio otomano',dates:'s. XIX–1914',kind:'imperio multinacional',capital:'Constantinopla',lon:32,lat:39,rx:18,ry:11,note:'Reformas, nacionalismos y pérdida territorial en el Mediterráneo y los Balcanes.'}
   ]
  },
  'worldwars':{
   entityNote:'Entre 1914 y 1945 cambian varias veces las formas de régimen dentro de los mismos territorios. El mapa muestra los principales Estados y no identifica Estado, régimen y nación como equivalentes.',
   entities:[
    {name:'Alemania: Imperio, Weimar y Tercer Reich',dates:'1914–1945',kind:'monarquía / república / dictadura nazi',capital:'Berlín',lon:10,lat:51,rx:9,ry:6,note:'Secuencia crucial para Weber, Schmitt y el problema del derrumbe democrático.'},
    {name:'URSS',dates:'1922–1945',kind:'Estado socialista federal de partido único',capital:'Moscú',lon:60,lat:55,rx:35,ry:18,note:'Consolidación del Estado soviético tras la Revolución rusa y guerra civil.'},
    {name:'Italia fascista',dates:'1922–1943',kind:'dictadura fascista',capital:'Roma',lon:12.5,lat:42,rx:6,ry:7,note:'Contexto inmediato de encarcelamiento y reflexión de Gramsci.'},
    {name:'Reino Unido',dates:'1914–1945',kind:'monarquía parlamentaria e imperio',capital:'Londres',lon:-3,lat:54,rx:6,ry:7,note:'Democracia de masas, guerra total e imperio global.'},
    {name:'Francia',dates:'1914–1945',kind:'república / régimen de Vichy / Francia Libre',capital:'París',lon:2,lat:47,rx:9,ry:6,note:'Crisis republicana, ocupación y resistencia.'},
    {name:'Estados Unidos',dates:'1914–1945',kind:'república federal',capital:'Washington',lon:-98,lat:39,rx:25,ry:12,note:'Pragmatismo democrático, New Deal y movilización industrial.'},
    {name:'Imperio japonés',dates:'1868–1945',kind:'monarquía imperial militarizada',capital:'Tokio',lon:138,lat:37,rx:8,ry:9,note:'Gran potencia imperial asiática y protagonista de la guerra total en el Pacífico.'}
   ]
  },
  'coldwar-decolonization':{
   entityNote:'La Guerra Fría estructura un sistema bipolar, pero la descolonización multiplica Estados y proyectos de desarrollo. El mapa combina grandes potencias y casos políticamente relevantes para las obras del Atlas.',
   entities:[
    {name:'Estados Unidos',dates:'1945–1991',kind:'república federal / potencia bipolar',capital:'Washington',lon:-98,lat:39,rx:25,ry:12,note:'Centro del orden liberal occidental y de debates normativos sobre libertad y justicia.'},
    {name:'Unión Soviética',dates:'1945–1991',kind:'Estado socialista federal / potencia bipolar',capital:'Moscú',lon:60,lat:55,rx:35,ry:18,note:'Polo comunista del sistema internacional y referencia de debates sobre revolución y totalitarismo.'},
    {name:'República Popular China',dates:'1949–1991',kind:'Estado socialista de partido único',capital:'Pekín',lon:104,lat:35,rx:21,ry:12,note:'Revolución socialista y tercer gran polo político del mundo comunista.'},
    {name:'India',dates:'1947–1991',kind:'república poscolonial',capital:'Nueva Delhi',lon:79,lat:22.5,rx:12,ry:10,note:'Independencia, democracia de masas y liderazgo del no alineamiento.'},
    {name:'Argelia',dates:'1962–1991',kind:'república poscolonial',capital:'Argel',lon:2.5,lat:28,rx:8,ry:6,note:'La guerra de independencia es central para Fanon y la teoría anticolonial.'},
    {name:'Argentina',dates:'1945–1991',kind:'Estado nacional con alternancia de democracia y dictadura',capital:'Buenos Aires',lon:-64,lat:-35,rx:8,ry:12,note:'Peronismo, desarrollismo, autoritarismo y transición democrática.'},
    {name:'Brasil',dates:'1945–1991',kind:'Estado nacional con democracia y dictadura',capital:'Río / Brasilia',lon:-52,lat:-10,rx:13,ry:14,note:'Desarrollo, dependencia, pedagogía crítica y autoritarismo.'},
    {name:'Cuba',dates:'1959–1991',kind:'Estado socialista',capital:'La Habana',lon:-79.5,lat:22,rx:3,ry:2,note:'Revolución y proyección continental en la Guerra Fría latinoamericana.'}
   ]
  },
  'global-contemporary':{
   entityNote:'El mapa contemporáneo muestra Estados y una entidad supranacional. No implica que el poder global se reduzca a ellos: organismos internacionales, empresas y redes transnacionales también estructuran el contexto.',
   entities:[
    {name:'Estados Unidos',dates:'1991–presente',kind:'república federal / potencia global',capital:'Washington',lon:-98,lat:39,rx:25,ry:12,note:'Centralidad militar, financiera y tecnológica del orden posterior a la Guerra Fría.'},
    {name:'República Popular China',dates:'1991–presente',kind:'Estado socialista de partido único / potencia global',capital:'Pekín',lon:104,lat:35,rx:21,ry:12,note:'Ascenso económico y geopolítico que modifica la estructura del sistema mundial.'},
    {name:'Federación Rusa',dates:'1991–presente',kind:'federación presidencial',capital:'Moscú',lon:70,lat:57,rx:31,ry:15,note:'Estado postsoviético con importante capacidad militar y territorial.'},
    {name:'Unión Europea',dates:'1993–presente',kind:'entidad supranacional',capital:'Bruselas / sedes múltiples',lon:10,lat:50,rx:14,ry:9,note:'Experimento supranacional de derecho, ciudadanía y gobernanza multinivel.'},
    {name:'India',dates:'1991–presente',kind:'república federal',capital:'Nueva Delhi',lon:79,lat:22.5,rx:12,ry:10,note:'Gran democracia de masas y potencia económica emergente.'},
    {name:'Brasil',dates:'1991–presente',kind:'república federal',capital:'Brasilia',lon:-52,lat:-10,rx:13,ry:14,note:'Potencia regional decisiva para debates latinoamericanos de democracia y desarrollo.'},
    {name:'Sudáfrica',dates:'1994–presente',kind:'república constitucional',capital:'Pretoria / Ciudad del Cabo',lon:24,lat:-29,rx:8,ry:7,note:'Transición post-apartheid y debates sobre raza, ciudadanía y justicia.'}
   ]
  }
 };
 const coords={
  'Mesopotamia':[44,33],'Egipto':[31,27],'China':[114,35],'India':[79,24],
  'Atenas':[23.73,37.98],'Esparta':[22.43,37.07],'Persia aqueménida':[52,32],'Macedonia':[22.5,40.6],
  'Roma':[12.5,41.9],'Mediterráneo oriental':[29,36],'Alejandría':[29.92,31.2],
  'Hipona / Roma':[10,39.5],'Bagdad':[44.36,33.31],'Córdoba':[-4.78,37.88],'El Cairo / Fustat':[31.24,30.04],'París / Italia':[7,45],
  'Florencia':[11.25,43.77],'Francia':[2.3,46.5],'Emden / Provincias Unidas':[6,52.7],'Inglaterra':[-1.5,52],
  'Escocia':[-4,56],'París / Ginebra':[4,47],'Filadelfia / Nueva York':[-74.5,40],'Londres':[-0.1,51.5],
  'París':[2.35,48.86],'Berlín / Alemania':[13.4,52.5],'Estados Unidos':[-98,39],
  'Alemania':[10,51],'Rusia':[37.6,55.75],'Italia':[12.5,42],
  'Reino Unido':[-2,54],'Argelia / África':[3,30],'América Latina':[-60,-15],
  'Europa':[10,50],'Princeton / angloesfera':[-74.66,40.35],'África':[20,5]
 };
 C.forEach(ctx=>{
  const x=cfg[ctx.id];if(x)Object.assign(ctx,x);
  (ctx.places||[]).forEach(p=>{const c=coords[p.name];if(c){p.lon=c[0];p.lat=c[1];}});
 });
 window.WORLD_PHASE1_READY=true;
})();