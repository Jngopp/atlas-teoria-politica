const D=window.ZHENGDU_DATA;
const screen=document.querySelector('#screen'),modal=document.querySelector('#modal');
const streakEl=document.querySelector('#streak'),xpEl=document.querySelector('#xp'),heartsEl=document.querySelector('#hearts');
const state=JSON.parse(localStorage.getItem('zhengdu-v1')||'{}');
state.xp??=0;state.hearts??=5;state.streak??=0;state.lastStudy??=null;state.done??={};state.unitPass??={};state.memory??={};state.events??=[];state.pinyin??=true;state.introSeen??=false;state.filters??={q:'',unit:'all'};
const DAY=86400000,MIN=60000;
function save(){localStorage.setItem('zhengdu-v1',JSON.stringify(state));renderStats()}
function touchStudy(){const today=new Date().toISOString().slice(0,10);if(state.lastStudy===today)return;if(state.lastStudy){const d=Math.round((new Date(today+'T12:00:00')-new Date(state.lastStudy+'T12:00:00'))/DAY);state.streak=d===1?state.streak+1:1}else state.streak=1;state.lastStudy=today}
function renderStats(){streakEl.textContent=state.streak;xpEl.textContent=state.xp;heartsEl.textContent=state.hearts;document.body.classList.toggle('pinyin-hidden',!state.pinyin)}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function key(ui,part){return `u${ui}-${part}`}
function unitDoneCount(ui){return ['chars','words','grammar','read'].filter(p=>state.done[key(ui,p)]).length+(state.unitPass[ui]?1:0)}
function markDone(ui,part,xp=10){const k=key(ui,part);if(!state.done[k]){state.done[k]=true;state.xp+=xp;touchStudy();save()}}
function closeModal(){modal.classList.add('hidden');modal.innerHTML=''}
function shell(title,body){modal.classList.remove('hidden');modal.innerHTML=`<div class="shell"><div class="modal-top"><button class="close-btn" id="closeM">×</button><div><div class="kicker" style="color:var(--brand)">政读 · Zhèngdú</div><b>${esc(title)}</b></div></div>${body}</div>`;document.querySelector('#closeM').onclick=closeModal}
function speak(text,rate=.72){if(!('speechSynthesis'in window)){alert('Este navegador no ofrece síntesis de voz.');return}const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=rate;const vs=speechSynthesis.getVoices();const v=vs.find(x=>/^zh(-CN)?/i.test(x.lang))||vs.find(x=>/^zh/i.test(x.lang));if(v)u.voice=v;speechSynthesis.cancel();speechSynthesis.speak(u)}
let AC=null;function tone(freq,dur,type='sine',gain=.04,delay=0){try{AC??=new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+delay;o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(gain,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+dur+.02)}catch(e){}}
function soundOK(){tone(520,.11,'sine',.035);tone(690,.16,'sine',.035,.09)}function soundBad(){tone(180,.16,'triangle',.045);tone(135,.19,'triangle',.04,.11)}
function mem(id){return state.memory[id]||(state.memory[id]={seen:0,correct:0,wrong:0,streak:0,stability:.5,last:null,due:Date.now(),introduced:false})}
function record(id,ok,source='lesson'){const r=mem(id),now=Date.now();r.seen++;r.last=now;r.introduced=true;if(ok){r.correct++;r.streak++;const ladder=[1,3,7,14,30,60,90];r.stability=Math.min(120,Math.max(.5,r.stability)*(1.25+Math.min(.3,r.streak*.05)));r.due=now+ladder[Math.min(r.streak-1,ladder.length-1)]*DAY}else{r.wrong++;r.streak=0;r.stability=Math.max(.25,r.stability*.52);r.due=now+10*MIN;state.hearts=Math.max(0,state.hearts-1)}state.events.push({t:now,id,ok,source});state.events=state.events.slice(-500);touchStudy();save()}
function strength(id){const r=state.memory[id];if(!r||!r.introduced)return null;if(!r.last)return 35;const days=Math.max(0,(Date.now()-r.last)/DAY);return Math.round(Math.max(2,Math.min(100,100*Math.exp(-days/Math.max(.35,r.stability||.5)))))}
function allChars(){const map=new Map();D.units.forEach((u,ui)=>u.chars.forEach((c,ci)=>{if(!map.has(c.h))map.set(c.h,{...c,ui,ci,id:`c:${c.h}`})}));return [...map.values()]}
function allWords(){const out=[];D.units.forEach((u,ui)=>u.words.forEach((x,wi)=>out.push({...x,ui,wi,id:`w:${ui}:${wi}`})));return out}
function introduceUnit(ui,kind){if(kind==='chars')D.units[ui].chars.forEach(c=>{const r=mem(`c:${c.h}`);r.introduced=true;r.due=Math.min(r.due||Date.now(),Date.now()+DAY)});if(kind==='words')D.units[ui].words.forEach((w,wi)=>{const r=mem(`w:${ui}:${wi}`);r.introduced=true;r.due=Math.min(r.due||Date.now(),Date.now()+DAY)});save()}
function progressPct(){const done=D.units.reduce((a,u,ui)=>a+unitDoneCount(ui),0);return Math.round(done/(D.units.length*5)*100)}
