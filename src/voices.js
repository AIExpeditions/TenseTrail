/* Accent choice (Australian, British, American) for every piece of audio, plus studio voices:
   Kokoro-82M (Apache 2.0, hexgrad) running in the browser for British and American English.
   No free open neural model speaks Australian English, so Australian uses the best voice on the device. */
var ACC={au:{re:/en[-_]AU/i,n:"Australian",fl:"🇦🇺",lang:"en-AU",hi:["G'day! This is my voice. How ya going?","G'day mate! This is my voice. How ya going?"]},
 uk:{re:/en[-_]GB/i,n:"British",fl:"🇬🇧",lang:"en-GB",hi:["Hello! This is my voice. How are you doing?","Hello there! This is my voice. How are you doing?"]},
 us:{re:/en[-_]US/i,n:"American",fl:"🇺🇸",lang:"en-US",hi:["Hi there! This is my voice. How's it going?","Hey! This is my voice. How's it going?"]}};
var VACC=(function(){try{var a=localStorage.getItem("tt_acc");return ACC[a]?a:"au"}catch(e){return"au"}})();
var NVP=(function(){try{return localStorage.getItem("tt_nv")=="1"}catch(e){return false}})();
/* two voices per gender, so two women or two men in one dialogue sound different */
var NVV={uk:{f:["bf_emma","bf_isabella"],m:["bm_george","bm_fable"]},us:{f:["af_heart","af_bella"],m:["am_michael","am_fenrir"]}};
var NVN={bf_emma:"Emma",bf_isabella:"Isabella",bm_george:"George",bm_fable:"Fable",af_heart:"Heart",af_bella:"Bella",am_michael:"Michael",am_fenrir:"Fenrir"};
var NV={st:"off",p:0,send:null,q:{},ids:{},n:0,cache:new Map(),src:null,tms:[],ac:null};
var KJS="https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js";
/* small model files, used only when huggingface.co cannot be reached (the big files then come from jsDelivr) */
var NVLOC={"config.json":'{"model_type":"style_text_to_speech_2"}',"tokenizer_config.json":'{"model_max_length":512,"pad_token":"$","unk_token":"$","tokenizer_class":"PreTrainedTokenizer","added_tokens_decoder":{"0":{"content":"$","special":true}}}',"tokenizer.json":/*@include kokoro-tokenizer.js*/
};
/* runs in a worker (or on the page if workers are blocked): loads Kokoro and turns text into audio, one job at a time */
function nvCore(P,KJS){var tts=null,busy=0,jobs=[],HF="https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/",NPM="https://cdn.jsdelivr.net/npm/",of=self.fetch.bind(self);
 var get=function(u,i){return of(u,i).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r})};
 var join=function(urls,type){return Promise.all(urls.map(function(u){return get(u).then(function(r){return r.arrayBuffer()})})).then(function(b){return new Response(new Blob(b),{headers:{"content-type":type,"content-length":String(b.reduce(function(s,x){return s+x.byteLength},0))}})})};
 /* copies beside the page are base64 text, the only kind of data file the Claude preview serves */
 var b64=function(t){var s=atob(t.trim()),u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer};
 var joinTxt=function(urls,type){return Promise.all(urls.map(function(u){return get(u).then(function(r){return r.text()}).then(b64)})).then(function(b){return new Response(new Blob(b),{headers:{"content-type":type,"content-length":String(b.reduce(function(s,x){return s+x.byteLength},0))}})})};
 var pieces=function(pre,n,ext){var a=[];for(var i=0;i<n;i++)a.push(pre+i+(ext||".bin"));return a};
 /* each file can come from its usual host, from copies published next to the page (P.base), or from jsDelivr */
 var alts=function(s){var f=s.slice(HF.length).split("?")[0],m=/^voices\/(\w+)\.bin$/.exec(f),B=P.base,O="application/octet-stream";
  if(/ort-wasm-simd-threaded\.jsep\.wasm$/.test(s))return[function(){return joinTxt(pieces(B+"ort.part",2,".txt"),"application/wasm")}];
  if(s.indexOf(HF)!=0)return null;
  if(P.loc[f])return[function(){return new Response(P.loc[f],{headers:{"content-type":"application/json"}})}];
  if(f=="onnx/model_quantized.onnx")return[function(){return joinTxt(pieces(B+"model.part",9,".txt"),O)},function(){return join(pieces(NPM+"kokoro-q8-shards@1.0.0/kokoro-q8.part",6),O)}];
  if(m)return[function(){return joinTxt([B+"voices/"+m[1]+".txt"],O)},function(){return get(NPM+"kokoro-js@1.2.1/voices/"+m[1]+".bin")}];
  return[]};
 self.fetch=function(u,i){var s=typeof u=="string"?u:(u&&u.url)||String(u||""),a=alts(s);if(!a)return of(u,i);
  return get(s,i).catch(function(e){return a.reduce(function(p,fn){return p.catch(function(){return fn()})},Promise.reject(e))})};
 var next=function(){if(busy||!tts||!jobs.length)return;var k=0;for(var j=0;j<jobs.length;j++)if(jobs[j].pr){k=j;break}var d=jobs.splice(k,1)[0];busy=1;
  tts.generate(d.text,{voice:d.voice,speed:d.speed}).then(function(a){busy=0;P.post({t:"aud",id:d.id,pcm:a.audio,sr:a.sampling_rate},[a.audio.buffer]);next()},function(e){busy=0;P.post({t:"aud",id:d.id,err:String(e&&e.message||e)});next()})};
 P.onmessage=function(e){var d=e.data;
  if(d.t=="load")import(KJS).then(function(m){return m.KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX",{dtype:"q8",device:"wasm",progress_callback:function(p){if(p&&p.status=="progress"&&/\.onnx$/.test(p.file||""))P.post({t:"p",p:p.progress})}})}).then(function(t){tts=t;return t.generate("Ready.",{voice:"af_heart"})}).then(function(){P.post({t:"ready"});next()},function(e){P.post({t:"err",m:String(e&&e.message||e)})});
  else if(d.t=="gen"){jobs.push(d);next()}
  else if(d.t=="bump")jobs.forEach(function(j){if(j.id==d.id)j.pr=1})}}
function nvBase(){try{return new URL("kokoro/",location.href).href}catch(e){return"kokoro/"}}
function nvMain(){var P={post:function(m){setTimeout(function(){nvMsg(m)},0)},loc:NVLOC,base:nvBase()};nvCore(P,KJS);NV.send=function(m){P.onmessage({data:m})};NV.send({t:"load"})}
function nvStart(){if(NV.st=="loading"||NV.st=="ready")return;NV.st="loading";NV.p=0;nvUi();var w,ok=0;
 try{w=new Worker(URL.createObjectURL(new Blob(["var P={post:function(m,t){postMessage(m,t||[])},loc:"+JSON.stringify(NVLOC)+",base:"+JSON.stringify(nvBase())+"};onmessage=function(e){P.onmessage(e)};("+nvCore+")(P,"+JSON.stringify(KJS)+")"],{type:"text/javascript"})),{type:"module"})}catch(e){w=null}
 if(!w){nvMain();return}
 w.onmessage=function(e){ok=1;nvMsg(e.data)};w.onerror=function(e){if(e&&e.preventDefault)e.preventDefault();if(ok)return;try{w.terminate()}catch(x){}nvMain()};
 NV.send=function(m){w.postMessage(m)};NV.send({t:"load"})}
function nvMsg(d){if(d.t=="p"){NV.p=d.p||0;nvUi()}else if(d.t=="ready"){NV.st="ready";nvUi();vUi();cvVoices(1)}else if(d.t=="err"){NV.st="err";NV.err=d.m;nvUi()}else if(d.t=="aud"){var r=NV.q[d.id];delete NV.q[d.id];if(r)r(d)}}
function nvOn(){return NVP&&VACC!="au"&&NV.st=="ready"}
function nvVoice(g,alt){var s=NVV[VACC]||NVV.us;return s[g=="m"?"m":"f"][alt?1:0]}
function nvSpd(r){return Math.round(Math.max(.7,Math.min(1.35,(r||.92)/.92))*100)/100}
function nvGen(text,voice,speed,pr){var k=voice+"|"+speed+"|"+text,c=NV.cache.get(k);if(c){if(pr&&NV.ids[k])NV.send({t:"bump",id:NV.ids[k]});return c}
 var id=++NV.n,p=new Promise(function(res,rej){NV.q[id]=function(d){delete NV.ids[k];if(d.err)rej(d.err);else res(d)}});NV.ids[k]=id;NV.send({t:"gen",id:id,text:text,voice:voice,speed:speed,pr:pr?1:0});
 NV.cache.set(k,p);p.catch(function(){NV.cache.delete(k)});if(NV.cache.size>120)NV.cache.delete(NV.cache.keys().next().value);return p}
function nvPre(text,g,alt,rate){if(nvOn())nvGen(text,nvVoice(g,alt),nvSpd(rate),0).catch(function(){})}
function nvAC(){try{if(!NV.ac)NV.ac=new(window.AudioContext||window.webkitAudioContext)();if(NV.ac.state=="suspended")NV.ac.resume()}catch(e){}return NV.ac}
function nvStop(){var s=NV.src;NV.src=null;NV.tms.forEach(clearTimeout);NV.tms=[];if(s){s.onended=null;try{s.stop()}catch(e){}}}
function vCancel(){try{speechSynthesis.cancel()}catch(e){}nvStop()}
function nvTalk(text,o){var live=function(){return!o.alive||o.alive()},fb=0,ac=nvAC(),t=setTimeout(function(){fb=1;if(live())vTalkWeb(text,o)},30000);
 if(!ac){clearTimeout(t);vTalkWeb(text,o);return}
 nvGen(text,nvVoice(o.g,o.alt),nvSpd(o.rate),1).then(function(d){clearTimeout(t);if(!fb&&live())nvPlay(d,text,o)},function(){clearTimeout(t);if(!fb&&live())vTalkWeb(text,o)})}
function nvPlay(d,text,o){nvStop();var ac=nvAC(),b=ac.createBuffer(1,d.pcm.length,d.sr),s=ac.createBufferSource(),dur,re=/\S+/g,m;b.copyToChannel(d.pcm,0);s.buffer=b;s.connect(ac.destination);NV.src=s;dur=b.duration*1000;
 if(o.onword)while((m=re.exec(text)))(function(ci){NV.tms.push(setTimeout(function(){if(NV.src==s)o.onword({name:"word",charIndex:ci})},dur*ci/Math.max(1,text.length)))})(m.index);
 s.onended=function(){if(NV.src!=s)return;NV.src=null;NV.tms.forEach(clearTimeout);NV.tms=[];if((!o.alive||o.alive())&&o.onend)o.onend()};
 if(o.onstart)o.onstart(null);s.start()}
/* the accent panel in the header */
function vAcc(a){if(!ACC[a]||a==VACC)return;VACC=a;try{localStorage.setItem("tt_acc",a)}catch(e){}cvKill();vNote("");vLoad();if(NVP&&a!="au")nvStart();nvUi();vUi()}
function nvSet(on){NVP=on;try{localStorage.setItem("tt_nv",on?"1":"0")}catch(e){}if(on)nvStart();nvUi();vUi();cvVoices(1)}
function vTry(){cvKill();var my=++SAYT,h=ACC[VACC].hi,al=function(){return my==SAYT};vTalk(h[0],{v:vFor("f").v,g:"f",alive:al,onend:function(){setTimeout(function(){if(al())vTalk(h[1],{v:vFor("m").v,g:"m",alive:al})},350)}})}
function nvUi(){var f=$("#vflag");if(f)f.textContent=ACC[VACC].fl;$$("#vp [data-a]").forEach(function(b){b.classList.toggle("on",b.dataset.a==VACC);b.setAttribute("aria-pressed",b.dataset.a==VACC)});var q=$("#vpq");if(!q)return;var h;
 if(VACC=="au")h='<p>No free studio voice speaks Australian English yet, so TenseTrail uses the best Australian voice on your device. For the most natural sound, open the site in Microsoft Edge (Natasha and William), or on an iPhone or Mac add Karen or Lee (Premium) in Settings, Accessibility, Spoken Content.</p>';
 else if(!NVP)h='<button class="btn vst" onclick="nvSet(true)">✨ Turn on studio voices</button><p>Natural '+ACC[VACC].n+' voices that run on your device. About 90 MB, downloaded once and kept for next time.</p>';
 else if(NV.st=="ready")h='<p class="vok">✨ Studio voices are on: '+NVN[nvVoice("f")]+' and '+NVN[nvVoice("m")]+'.</p><button class="lk" onclick="nvSet(false)">Use my device\'s voice instead</button>';
 else if(NV.st=="err")h='<p>Studio voices could not load here, so your device\'s '+ACC[VACC].n+' voice is speaking.</p><button class="lk" onclick="NV.st=\'off\';nvStart()">Try again</button> · <button class="lk" onclick="nvSet(false)">Turn off</button>';
 else h='<div class="vbar"><i style="width:'+Math.round(NV.p)+'%"></i></div><p>Getting studio voices ready'+(NV.p?' ('+Math.round(NV.p)+'%)':'')+'. Your device\'s voice speaks until then.</p><button class="lk" onclick="nvSet(false)">Cancel</button>';
 q.innerHTML=h}
(function(){var b=$("#vbtn"),p=$("#vp");if(!b||!p)return;var shut=function(){p.hidden=true;b.setAttribute("aria-expanded","false")};
 b.onclick=function(e){e.stopPropagation();p.hidden=!p.hidden;b.setAttribute("aria-expanded",String(!p.hidden));if(!p.hidden){nvUi();var on=$("#vp .on");if(on)on.focus()}};
 p.onclick=function(e){e.stopPropagation();var a=e.target.closest&&e.target.closest("[data-a]");if(a)vAcc(a.dataset.a)};
 document.addEventListener("click",shut);document.addEventListener("keydown",function(e){if(e.key=="Escape"&&!p.hidden){shut();b.focus()}});
 nvUi();if(NVP&&VACC!="au")setTimeout(nvStart,1200)})();
