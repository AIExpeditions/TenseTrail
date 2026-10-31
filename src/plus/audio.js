/* ---- Recorded studio audio: instant playback of pre-made British voices ---- */
var AP={ix:null,ld:null,bf:{},el:null,tok:0,u:null,unl:0};
function apH(s){var a=0x811c9dc5,b=0x9e3779b9;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(36)+"-"+(b>>>0).toString(36)}
function apGrp(h){var n=h[0],a=h[1],b=h[2];if(n=="worksheets"&&a=="grammar"){if(b=="studio")return"studio";if(b=="tenses")return"tenses";if(XA[b])return"g-"+b;return"misc"}if(n=="worksheets"&&SKK[a])return"sk-"+SKK[a];if(n=="level")return"level";return"misc"}
function apInit(){if(AP.ld)return AP.ld;AP.ld=fetch("aud/ix.json").then(function(r){return r.ok?r.json():null}).then(function(j){AP.ix=j;if(j)apPre(route());return j},function(){return null});return AP.ld}
function apOn(){return NVP&&VACC=="uk"}
function apFind(text,o){if(!AP.ix||!apOn())return null;return AP.ix.i[apH(nvVoice(o.g,o.alt)+"|"+String(text).trim())]||null}
function apBuf(fi){return AP.bf[fi]||(AP.bf[fi]=fetch("aud/"+AP.ix.f[fi]).then(function(r){if(!r.ok)throw new Error("http");return r.arrayBuffer()}).catch(function(e){delete AP.bf[fi];throw e}))}
function apPre(r){if(!AP.ix||!apOn())return;var g=AP.ix.g[apGrp([r.n,r.a,r.b,r.c])];if(g)g.forEach(function(fi){apBuf(fi).catch(function(){})})}
function apEl(){if(!AP.el){AP.el=new Audio();AP.el.preload="auto";try{AP.el.preservesPitch=true;AP.el.webkitPreservesPitch=true}catch(e){}}return AP.el}
function apStop(){AP.tok++;var a=AP.el;if(a){a.onended=a.onerror=null;try{a.pause()}catch(e){}}if(AP.u){URL.revokeObjectURL(AP.u);AP.u=null}if(AP.tm){AP.tm.forEach(clearTimeout);AP.tm=null}}
/* unlock the audio element on the first tap so later plays work on phones */
function apUnlock(){if(AP.unl)return;AP.unl=1;var a=apEl();try{a.src="data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//OEwAAAAAAAAAAAAEluZm8AAAAPAAAABwAAA2AAVVVVVVVVVVVVVVVVVVVxcXFxcXFxcXFxcXFxcY6Ojo6Ojo6Ojo6Ojo6Oqqqqqqqqqqqqqqqqqqqqx8fHx8fHx8fHx8fHx8fj4+Pj4+Pj4+Pj4+Pj4///////////////////AAAAAExhdmM2MC4zMQAAAAAAAAAAAAAAACQEIAAAAAAAAANgmVBi7QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//NExAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExFMAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKYAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKwAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKwAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NExKwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NExKwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";a.muted=true;var p=a.play();if(p&&p.then)p.then(function(){a.pause();a.muted=false},function(){a.muted=false;AP.unl=0})}catch(e){a.muted=false}}
addEventListener("pointerdown",apUnlock,{capture:true,passive:true});addEventListener("keydown",apUnlock,{capture:true});
function apTalk(text,o){if(!apOn())return false;if(!AP.ix){apInit();return false}var hit=apFind(text,o);
 if(!hit){if(NV.st=="off")nvStart();return false}
 apStop();var my=AP.tok,live=function(){return my==AP.tok&&(!o.alive||o.alive())},fb=function(){if(!live())return;if(nvOn())nvTalk(text,o);else vTalkWeb(text,o)};
 apBuf(hit[0]).then(function(ab){if(!live())return;var a=apEl(),u=URL.createObjectURL(new Blob([ab.slice(hit[1],hit[1]+hit[2])],{type:"audio/mpeg"}));AP.u=u;a.src=u;a.playbackRate=nvSpd(o.rate);
  a.onended=function(){if(AP.u==u){URL.revokeObjectURL(u);AP.u=null}if(live()&&o.onend)o.onend()};a.onerror=function(){a.onerror=null;fb()};
  if(o.onword){a.onplaying=function(){a.onplaying=null;var d=(a.duration||0)*1000/(a.playbackRate||1),re=/\S+/g,m;if(!d||!isFinite(d))return;AP.tm=[];while((m=re.exec(text)))(function(ci){AP.tm.push(setTimeout(function(){if(live())o.onword({name:"word",charIndex:ci})},d*ci/Math.max(1,text.length)))})(m.index)}}else a.onplaying=null;
  if(o.onstart)o.onstart(null);var p=a.play();if(p&&p.catch)p.catch(function(e){if(e&&e.name=="AbortError")return;fb()})},fb);
 return true}
apInit();
