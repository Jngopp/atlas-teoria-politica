(()=>{
  const synth=window.speechSynthesis;
  if(!synth||typeof SpeechSynthesisUtterance==='undefined')return;
  document.documentElement.classList.add('speech-supported');
  let voices=[];let active=null;
  const refreshVoices=()=>{voices=synth.getVoices()||[]};refreshVoices();if('onvoiceschanged' in synth)synth.onvoiceschanged=refreshVoices;
  function currentSystem(){try{return JSON.parse(localStorage.getItem('polis-systems-v1')||'{}').current||null}catch(e){return null}}
  const LANG={plato:'el-GR',aristotle:'el-GR',augustine:'la',aquinas:'la',machiavelli:'it-IT',spinoza:'la',hobbes:'en-GB',locke:'en-GB',rousseau:'fr-FR',kant:'de-DE',hegel:'de-DE',marx:'de-DE',schmitt:'de-DE',arendt:'en-US'};
  function langFor(text){if(/[\u0370-\u03ff\u1f00-\u1fff]/.test(text))return'el-GR';return LANG[currentSystem()]||'es-AR'}
  function chooseVoice(lang){refreshVoices();const base=lang.split('-')[0].toLowerCase();return voices.find(v=>v.lang?.toLowerCase()===lang.toLowerCase())||voices.find(v=>v.lang?.toLowerCase().startsWith(base))||voices.find(v=>v.default)||voices[0]||null}
  function speak(text,opts={}){text=String(text||'').trim();if(!text)return false;try{synth.cancel();const lang=opts.lang||langFor(text);const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=opts.rate||(lang==='el-GR'?.72:.78);u.pitch=1;const voice=chooseVoice(lang);if(voice)u.voice=voice;if(active)active.classList.remove('speaking');active=opts.element||null;u.onstart=()=>active?.classList.add('speaking');u.onend=u.onerror=()=>{active?.classList.remove('speaking');active=null};synth.speak(u);return true}catch(e){console.warn('POLIS speech unavailable',e);return false}}
  function stop(){try{synth.cancel()}catch(e){};active?.classList.remove('speaking');active=null}
  document.addEventListener('click',e=>{const term=e.target.closest?.('.term-chip');if(term){const original=term.querySelector('b')?.textContent?.trim();if(original){e.preventDefault();e.stopPropagation();speak(original,{element:term});return}}const quote=e.target.closest?.('.quote-panel blockquote');if(quote){e.preventDefault();e.stopPropagation();speak(quote.textContent,{element:quote,rate:.72});return}const termScreen=e.target.closest?.('.dense-check h2');if(termScreen&&termScreen.closest('.dense-check')){const label=termScreen.textContent?.trim();if(label){e.preventDefault();e.stopPropagation();speak(label,{element:termScreen});return}}},true);
  window.POLIS_SPEECH={speak,stop,langFor,voices:()=>voices.slice(),languages:{...LANG}};
})();
