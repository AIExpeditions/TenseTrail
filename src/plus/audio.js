/* ---- Recorded studio audio: instant playback of pre-made British voices ---- */
var AP={ix:null,ld:null,bf:{},el:null,tok:0,u:null,unl:0};
function apH(s){var a=0x811c9dc5,b=0x9e3779b9;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(36)+"-"+(b>>>0).toString(36)}
function apGrp(h){var n=h[0],a=h[1],b=h[2];if(n=="worksheets"&&a=="grammar"){if(b=="studio")return"studio";if(b=="tenses")return"tenses";if(XA[b])return"g-"+b;return"misc"}if(n=="worksheets"&&SKK[a])return"sk-"+SKK[a];if(n=="level")return"level";return"misc"}
function apInit(){if(AP.ld)return AP.ld;AP.ld=fetch("aud/ix.json").then(function(r){return r.ok?r.json():null}).then(function(j){AP.ix=j;if(j)apPre(route());return j},function(){return null});return AP.ld}
function apOn(){return NVP&&(VACC=="uk"||VACC=="us")}
function apFind(text,o){if(!AP.ix||!apOn())return null;return AP.ix.i[apH(nvVoice(o.g,o.alt)+"|"+String(text).trim())]||null}
function apBuf(fi){return AP.bf[fi]||(AP.bf[fi]=fetch("aud/"+AP.ix.f[fi]).then(function(r){if(!r.ok)throw new Error("http");return r.arrayBuffer()}).catch(function(e){delete AP.bf[fi];throw e}))}
function apPre(r){if(!AP.ix||!apOn())return;var g=AP.ix.g[VACC+"/"+apGrp([r.n,r.a,r.b,r.c])];if(g)g.forEach(function(fi){apBuf(fi).catch(function(){})})}
function apEl(){if(!AP.el){AP.el=new Audio();AP.el.preload="auto";try{AP.el.preservesPitch=true;AP.el.webkitPreservesPitch=true}catch(e){}}return AP.el}
function apStop(){AP.tok++;var a=AP.el;if(a){a.onended=a.onerror=null;try{a.pause()}catch(e){}}if(AP.u){URL.revokeObjectURL(AP.u);AP.u=null}if(AP.tm){AP.tm.forEach(clearTimeout);AP.tm=null}}
/* unlock the audio element on the first tap so later plays work on phones */
function apUnlock(){if(AP.unl)return;AP.unl=1;var a=apEl();if(a.src)return;try{a.src="data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//OEwAAAAAAAAAAAAEluZm8AAAAPAAAABwAAA2AAVVVVVVVVVVVVVVVVVVVxcXFxcXFxcXFxcXFxcY6Ojo6Ojo6Ojo6Ojo6Oqqqqqqqqqqqqqqqqqqqqx8fHx8fHx8fHx8fHx8fj4+Pj4+Pj4+Pj4+Pj4///////////////////AAAAAExhdmM2MC4zMQAAAAAAAAAAAAAAACQEIAAAAAAAAANgmVBi7QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//NExAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExFMAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKYAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKwAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKwAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NExKwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NExKwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";a.muted=true;var p=a.play();if(p&&p.then)p.then(function(){if(a.src.indexOf("data:")==0)a.pause();a.muted=false},function(){a.muted=false})}catch(e){a.muted=false}}
addEventListener("pointerdown",apUnlock,{capture:true,passive:true});addEventListener("keydown",apUnlock,{capture:true});
function apTalk(text,o){if(!apOn())return false;if(!AP.ix){apInit();return false}var hit=apFind(text,o);
 if(!hit){if(NV.st=="off")nvStart();return false}
 apStop();var my=AP.tok,live=function(){return my==AP.tok&&(!o.alive||o.alive())},fb=function(){if(!live())return;if(nvOn())nvTalk(text,o);else vTalkWeb(text,o)};
 apBuf(hit[0]).then(function(ab){if(!live())return;var a=apEl(),u=URL.createObjectURL(new Blob([ab.slice(hit[1],hit[1]+hit[2])],{type:"audio/mpeg"}));AP.u=u;a.muted=false;a.src=u;a.playbackRate=nvSpd(o.rate);
  a.onended=function(){if(AP.u==u){URL.revokeObjectURL(u);AP.u=null}if(live()&&o.onend)o.onend()};a.onerror=function(){a.onerror=null;fb()};
  if(o.onword){a.onplaying=function(){a.onplaying=null;var d=(a.duration||0)*1000/(a.playbackRate||1),re=/\S+/g,m;if(!d||!isFinite(d))return;AP.tm=[];while((m=re.exec(text)))(function(ci){AP.tm.push(setTimeout(function(){if(live())o.onword({name:"word",charIndex:ci})},d*ci/Math.max(1,text.length)))})(m.index)}}else a.onplaying=null;
  if(o.onstart)o.onstart(null);var p=a.play();if(p&&p.catch)p.catch(function(e){if(e&&e.name=="AbortError")return;fb()})},fb);
 return true}
apInit();
/* ---- Shared player control: Play splits into Pause and Stop ---- */
var API={p:'<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="3" y="2" width="3.6" height="12" rx="1" fill="currentColor"/><rect x="9.4" y="2" width="3.6" height="12" rx="1" fill="currentColor"/></svg>',s:'<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" rx="2" fill="currentColor"/></svg>',r:'<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 2.2v11.6c0 .8.9 1.3 1.6.8l8.6-5.8c.6-.4.6-1.2 0-1.6L5.6 1.4C4.9.9 4 1.4 4 2.2z" fill="currentColor"/></svg>'};
var APZ={el:null,x:null,p:0,q:null,t:0};
function apIsOn(el){if(!el||!el.isConnected)return false;if(el.id=="cvplay")return typeof cv!="undefined"&&cv&&!!cv.play;if(el.id=="lvpl")return!!(LV&&LV.cur&&LV.cur.on);if(el.id&&el.id.indexOf("sxp-")==0)return/Stop/.test(el.textContent);return!!(el.dataset.pl||el.dataset.on||el.classList.contains("sayon"))}
function apCtlOn(el){if(!el)return;if(APZ.el===el&&APZ.x)return;apCtlOff();var ic=el.classList.contains("sxs")||el.textContent.trim().length<=2,foc=document.activeElement===el,x=document.createElement("span");
 x.className="apx"+(ic?" ic":"")+(el.classList.contains("sm")?" sm":"");x.setAttribute("role","group");x.setAttribute("aria-label","Audio controls");
 x.innerHTML='<button type="button" class="app" aria-label="Pause">'+API.p+'<span>Pause</span></button><button type="button" class="aps" aria-label="Stop">'+API.s+'<span>Stop</span></button>';
 x.firstChild.onclick=function(e){e.stopPropagation();apPauseTog()};x.lastChild.onclick=function(e){e.stopPropagation();apStopCtl()};
 el.after(x);el.classList.add("apHide");APZ.el=el;APZ.x=x;if(foc)try{x.firstChild.focus({preventScroll:true})}catch(e){}
 clearInterval(APZ.t);APZ.t=setInterval(function(){if(!APZ.el||(!APZ.p&&!apIsOn(APZ.el)))apCtlOff()},300)}
function apCtlOff(){clearInterval(APZ.t);var el=APZ.el,x=APZ.x,foc=x&&x.contains(document.activeElement);if(APZ.p)apUnpause(0);APZ.el=APZ.x=null;if(x)x.remove();if(el){el.classList.remove("apHide");if(foc)try{el.focus({preventScroll:true})}catch(e){}}}
function apPauseRaw(){var a=AP.el;APZ.wa=!!(a&&!a.paused&&a.src&&a.currentTime>0&&!a.ended);if(APZ.wa)try{a.pause()}catch(e){}try{if(NV.ac&&NV.ac.state=="running")NV.ac.suspend()}catch(e){}try{speechSynthesis.pause()}catch(e){}}
function apUnpause(go){var q=APZ.q;APZ.p=0;APZ.q=null;try{if(NV.ac&&NV.ac.state=="suspended")NV.ac.resume()}catch(e){}try{speechSynthesis.resume()}catch(e){}if(go){if(APZ.wa&&AP.el)try{AP.el.play()}catch(e){}if(q)q()}APZ.wa=0}
function apPauseTog(){var x=APZ.x;if(!x)return;var b=x.firstChild;if(!APZ.p){APZ.p=1;apPauseRaw();x.classList.add("pz");b.innerHTML=API.r+'<span>Resume</span>';b.setAttribute("aria-label","Resume")}
 else{x.classList.remove("pz");b.innerHTML=API.p+'<span>Pause</span>';b.setAttribute("aria-label","Pause");apUnpause(1)}}
function apStopCtl(){var el=APZ.el;if(APZ.p)apUnpause(0);try{speechSynthesis.cancel()}catch(e){}if(el){if(el.id=="cvplay"&&typeof cv!="undefined"&&cv){CVT++;vCancel();cv.play=0;cv.paused=0;cv.talk=0;try{cvMark(-1)}catch(e){}cvUi()}else if(apIsOn(el))el.click()}apCtlOff()}
