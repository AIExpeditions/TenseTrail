/* ---- Speaking and writing feedback (hybrid) ----
 Layer 1, for everyone, on this device: word and sentence counts, common learner-error patterns,
 and whether the lesson's target grammar appears. Speech uses the browser's speech recognition
 where it exists (Chrome, Edge, Safari). It shows what the computer understood, not accent quality.
 Layer 2, teacher feedback: an AI marks the text against CEFR-based analytic criteria (src/plus/rubric.js).
 On the live site this is Google Gemini, reached through our small proxy (worker/), which keeps the key
 secret. If FBGEM is empty, the page falls back to Claude for signed-in claude.ai viewers who allow it.
 Every correction must quote the learner's exact words; the page drops any that do not, so feedback is
 tied to what was actually written or said. */
/* Address of the deployed feedback Worker (see worker/README.md). Leave "" to turn Gemini off. */
var FBGEM="https://tensetrail-feedback.mamali-ghodsi.workers.dev/";
var FBX=[
[/(^|[.!?]\s+)(he|she|it)\s+(go|like|want|need|live|work|play|study|watch|come)\b/gi,"After he, she or it, the present simple verb adds -s: she likes, he works."],
[/\b(he|she|it)\s+don'?t\b/gi,"Use doesn't with he, she and it: she doesn't know."],
[/\bI\s+(is|are)\b|\b(you|we|they)\s+(is|was)\b/gi,"Check the verb be: I am, you are, he is; I was, you were."],
[/\b(more|most)\s+(better|worse|bigger|smaller|easier|happier|cheaper|faster|older|younger|taller|longer)\b/gi,"Don't add more to a comparative that already ends in -er: better, not more better."],
[/\bthe most (best|worst|biggest|smallest)\b/gi,"Best and worst are already superlatives: the best, not the most best."],
[/\b(I am|I'm|am)\s+agree\b/gi,"Agree is a verb: I agree, not I am agree."],
[/\b(didn't|did not|doesn't|does not|don't|do not)\s+(went|came|saw|ate|took|made|had|was|were|got|bought|did|said|told|goes|likes|wants)\b/gi,"After do, does or did, use the base verb: didn't go, doesn't like."],
[/\b(can|could|should|must|will|would|might|may)\s+to\s+[a-z]+/gi,"Modal verbs are followed by the base verb with no to: can swim, must go."],
[/\b(informations|advices|furnitures|equipments|homeworks|luggages|knowledges)\b/gi,"This noun is uncountable, so it has no plural -s: information, advice."],
[/\b(much)\s+(people|friends|cars|books|things|times|students|problems)\b/gi,"Use many with plural countable nouns: many people."],
[/\bsince\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(years|months|weeks|days|hours)\b/gi,"Use for with a length of time (for three years) and since with a starting point (since 2020)."],
[/\bI\s+have\s+\d+\s+years\b/gi,"Say your age with be: I am 30 (years old)."],
[/\ba\s+(apple|orange|hour|honest|egg|idea|umbrella|interesting|old|important|excellent|easy|answer|email|office)\b/gi,"Use an before a vowel sound: an apple, an hour."],
[/\ban\s+(university|european|uniform|user|useful|banana|car|house|book|big|good|new)\b/gi,"Use a before a consonant sound: a university, a new car."],
[/\bdiscuss about\b/gi,"Discuss takes a direct object: discuss the plan, not discuss about the plan."],
[/\bexplain me\b/gi,"Say explain to me or explain it to me."],
[/\bmarried with\b/gi,"The usual phrase is married to someone."],
[/\breturn back\b/gi,"Return already means go back. Just say return."],
[/\bdepend of\b/gi,"The preposition is on: it depends on the weather."],
[/\binterested on\b/gi,"The preposition is in: interested in."],
[/\bsay me\b/gi,"Use tell with a person: tell me, say to me."],
[/\blisten music\b/gi,"Listen needs to: listen to music."],
[/\bdo (a |many |some |lots of )?mistakes?\b/gi,"The collocation is make a mistake."],
[/\b(\w+)\s+\1\b/gi,"The same word appears twice in a row."]];
var FBS=["the","a","an","to","of","and","i","you","he","she","it","we","they","is","are","was","were","be","my","your","in","on","at","for","with","this","that","me","her","him","our","their","do","not"];
function fbTargets(k){if(!SX||!SX[k])return[];var c=SX[k],seg=[],cnt={};c.nt.concat(c.dl.ln.map(function(l){return l[1]})).forEach(function(t){String(t).replace(/\[\[(.+?)\]\]/g,function(_,m){seg.push(m.toLowerCase())})});
 seg.forEach(function(sg){var seen={};sg.replace(/[^a-z' -]/g," ").split(/\s+/).forEach(function(w){if(w&&FBS.indexOf(w)<0&&!seen[w]){seen[w]=1;cnt[w]=(cnt[w]||0)+1}})});
 return Object.keys(cnt).filter(function(w){return cnt[w]>=2}).sort(function(a,b){return cnt[b]-cnt[a]}).slice(0,8)}
function fbLocal(t,ctx){var words=(t.match(/[A-Za-z\u00C0-\u024F']+/g)||[]),sn=t.split(/[.!?]+/).filter(function(s){return s.trim()}),out=[],iss=[];
 out.push(["\uD83D\uDCCF",words.length+" words, "+sn.length+" sentence"+(sn.length==1?"":"s")+(sn.length?", about "+Math.round(words.length/sn.length)+" words per sentence":"")+"."]);
 if(ctx.min&&words.length<ctx.min)out.push(["\u2795","Try to write at least "+ctx.min+" words. Longer answers show more of what you can do."]);
 if(!ctx.speech){var low=sn.filter(function(s){var x=s.trim();return x&&/^[a-z]/.test(x)}).length;if(low)iss.push(["Capital letters",low+" sentence"+(low>1?"s start":" starts")+" with a small letter."]);
  if(/(^|\s)i(\s|')/.test(t))iss.push(["Capital I","Always write I as a capital letter."]);if(t.trim()&&!/[.!?]["')]*\s*$/.test(t.trim()))iss.push(["Full stop","End your last sentence with a full stop, question mark or exclamation mark."])}
 sn.forEach(function(s){var n=(s.match(/\S+/g)||[]).length;if(n>35)iss.push(["Long sentence","One sentence has "+n+" words. Think about splitting it."])});
 FBX.forEach(function(r){var m;r[0].lastIndex=0;while((m=r[0].exec(t))){iss.push(['\u201C'+m[0].trim()+'\u201D',r[1]]);if(!r[0].global)break}});
 var tg=ctx.k!=null?fbTargets(ctx.k):[],used=tg.filter(function(w){return new RegExp("\\b"+w.replace(/[^a-z' -]/g,"")+"\\b","i").test(t)});
 if(tg.length)out.push([used.length?"\u2705":"\uD83D\uDCA1",used.length?"You used today\u2019s grammar words: <b>"+used.map(sxH).join(", ")+"</b>. Check they follow the rule.":"Try to use today\u2019s grammar. Words that often go with it: <b>"+tg.slice(0,5).map(sxH).join(", ")+"</b>."]);
 return{out:out,iss:iss.slice(0,10)}}
var FBST={},FBSR=window.SpeechRecognition||window.webkitSpeechRecognition,FBSAMP=null,FBSN=0;
function fbGem(){return{gem:1,json:function(c,o){return fetch(FBGEM,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c),signal:o.signal}).then(function(r){return r.json().catch(function(){return{error:"upstream"}}).then(function(j){if(!r.ok||j.error){var e=new Error(j.error);e.code=r.status==429?"rate_limited":j.error;e.detail=j.detail;throw e}return j})},function(e){var x=new Error("net");x.code=e&&e.name=="AbortError"?"cancelled":"network";throw x})}}}
/* provider: Gemini when the Worker address is set, otherwise Claude on claude.ai, otherwise none */
function fbUse(){if(FBSAMP!==null)return Promise.resolve(FBSAMP);if(FBGEM)return Promise.resolve(FBSAMP=fbGem());if(!window.claude||!claude.use)return Promise.resolve(FBSAMP=false);return claude.use("sample").then(function(s){FBSAMP=s||false;return FBSAMP},function(){return FBSAMP=false})}
function fbWho(){return FBSAMP&&FBSAMP.gem?"Gemini":"Claude"}
function fbWidget(id,ctx){FBST[id]={ctx:ctx,sp:false};var dr="";ctx.store=ctx.store||"tt_fb_"+id;try{dr=localStorage.getItem(ctx.store)||""}catch(e){}
 return'<div class="fbw" id="fbw-'+id+'"><div class="fbmode" role="group" aria-label="Writing or speaking"><button class="on" onclick="fbMode(\''+id+'\',0)">\u270D\uFE0F Write</button><button onclick="fbMode(\''+id+'\',1)">\uD83C\uDFA4 Speak</button></div>'
 +'<p class="fbtask">'+sxH(ctx.task)+'</p><div class="fbsp" id="fbsp-'+id+'" hidden><button class="btn ghost" id="fbmic-'+id+'" onclick="fbMic(\''+id+'\')">\uD83C\uDFA4 Start speaking</button><span class="sxsub" id="fbms-'+id+'">'+(FBSR?'Speak clearly. Your words appear below. You can fix any the computer misheard.':'Speech recognition is not available in this browser. Say your answer aloud, then type what you said.')+'</span></div>'
 +'<textarea class="sxta" id="fbt-'+id+'" rows="5" placeholder="Write here\u2026" aria-label="Your answer" oninput="fbIn(\''+id+'\')">'+sxH(dr)+'</textarea><div class="fbbar"><span class="sxsub" id="fbwc-'+id+'"></span><span class="fbbtns"><button class="btn ghost" onclick="fbCheck(\''+id+'\')">Quick check</button><button class="btn" id="fbai-'+id+'" onclick="fbAI(\''+id+'\')" hidden>\u2728 Teacher feedback</button></span></div>'
 +'<div id="fbo-'+id+'" aria-live="polite"></div><div id="fba-'+id+'" aria-live="polite"></div><p class="sxsub fbnote" id="fbn-'+id+'">Quick check runs on this device and catches common mistakes only.</p></div>'}
function fbInit(id){fbIn(id,1);fbUse().then(function(s){var b=$("#fbai-"+id),n=$("#fbn-"+id);if(s&&b){b.hidden=false;if(n)n.innerHTML="Quick check runs on this device and catches common mistakes only. <b>Teacher feedback</b> "+(s.gem?"sends your answer to Google\u2019s Gemini AI, which marks it against CEFR criteria. Please don\u2019t include your name, address or other private details.":"asks Claude to mark your answer against CEFR criteria, using your own Claude account.")+" Every correction must quote your exact words."}})}
function fbIn(id,init){var t=$("#fbt-"+id);if(!t)return;var n=(t.value.match(/[A-Za-z\u00C0-\u024F']+/g)||[]).length,w=$("#fbwc-"+id);if(w)w.textContent=n+" word"+(n==1?"":"s");if(!init)try{localStorage.setItem(FBST[id].ctx.store,t.value)}catch(e){}}
function fbMode(id,m){var S=FBST[id];S.sp=!!m;$$("#fbw-"+id+" .fbmode button").forEach(function(b,i){b.classList.toggle("on",i==m)});$("#fbsp-"+id).hidden=!m;$("#fbt-"+id).placeholder=m?"Your spoken words appear here\u2026":"Write here\u2026";if(!m)fbStop(id)}
function fbStop(id){var S=FBST[id];if(S&&S.rec){try{S.rec.stop()}catch(e){}}}
function fbMic(id){var S=FBST[id],b=$("#fbmic-"+id),ms=$("#fbms-"+id),ta=$("#fbt-"+id);if(!FBSR){ta.focus();return}if(S.rec){fbStop(id);return}
 cvKill();var r=new FBSR(),base=ta.value?ta.value.replace(/\s*$/," "):"";r.lang={au:"en-AU",uk:"en-GB",us:"en-US"}[typeof VACC=="string"?VACC:"au"]||"en-AU";r.interimResults=true;r.continuous=true;S.rec=r;S.t0=Date.now();
 r.onresult=function(e){var fin="",tmp="";for(var i=0;i<e.results.length;i++){var x=e.results[i][0].transcript;if(e.results[i].isFinal)fin+=x;else tmp+=x}ta.value=base+fin+tmp;fbIn(id)};
 r.onerror=function(e){ms.textContent=e.error=="not-allowed"||e.error=="service-not-allowed"?"The microphone is blocked here. Allow it in your browser, or say your answer aloud and type it.":e.error=="no-speech"?"No speech heard. Check your microphone and try again.":"Speech recognition stopped ("+e.error+"). You can type instead."};
 r.onend=function(){S.rec=null;S.secs=Math.round((Date.now()-S.t0)/1000);b.textContent="\uD83C\uDFA4 Start speaking";b.classList.remove("rec")};
 try{r.start();b.textContent="\u25A0 Stop";b.classList.add("rec");ms.textContent="Listening\u2026 Speak now. Press Stop when you finish."}catch(e){ms.textContent="Could not start the microphone. You can type instead."}}
function fbCheck(id){var S=FBST[id],t=$("#fbt-"+id).value;if(!t.trim()){$("#fbo-"+id).innerHTML='<div class="sxfb hint"><b>Write or say something first.</b></div>';return}
 var r=fbLocal(t,{k:S.ctx.k,min:S.ctx.min||(S.ctx.mode=="placement"?60:0),speech:S.sp});
 $("#fbo-"+id).innerHTML='<div class="fbq"><b>Quick check</b><ul>'+r.out.map(function(o){return'<li><span>'+o[0]+'</span><span>'+o[1]+'</span></li>'}).join("")+'</ul>'+(r.iss.length?'<p class="fbh">Things to look at</p><ul class="fbis">'+r.iss.map(function(o){return'<li><b>'+sxH(o[0])+'</b> '+sxH(o[1])+'</li>'}).join("")+'</ul>':'<p class="fbh">No common mistakes found. That doesn\u2019t mean there are none.</p>')+'</div>'}
function fbNorm(t){return String(t).toLowerCase().replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/\s+/g," ").trim()}
/*@include plus/rubric.js*/
function fbPrompt(S,t){return fbRubric(S.ctx,S.sp,t)}
function fbAI(id){var S=FBST[id],t=$("#fbt-"+id).value.trim(),out=$("#fba-"+id),b=$("#fbai-"+id);if(!t){out.innerHTML='<div class="sxfb hint"><b>Write or say something first.</b></div>';return}
 fbUse().then(function(sample){if(!sample){b.hidden=true;out.innerHTML='<p class="sxsub">Teacher feedback needs this page to be open on claude.ai while you are signed in.</p>';return}
  if(S.busy){if(S.ctl)S.ctl.abort();return}S.busy=1;S.ctl=new AbortController();b.textContent="\u25A0 Stop";var tk=++FBSN;
  out.innerHTML='<div class="fbai"><p class="fbth"><span class="fbdot"></span> '+fbWho()+' is reading your answer and marking it against the criteria. This can take up to a minute.</p></div>';
  sample.json(sample.gem?{text:t,speech:S.sp,task:S.ctx.task||"",topic:S.ctx.topic||"",level:S.ctx.level||"",rule:S.ctx.rule||""}:fbPrompt(S,t),{signal:S.ctl.signal,modelTier:"default"}).then(function(r){if(tk==FBSN)fbShow(id,r,t)},function(e){var m={not_granted:"You chose not to allow Claude for this page. Quick check still works.",rate_limited:"Lots of people are asking for feedback right now. Please try again in a few minutes. Quick check still works.",cancelled:"Stopped.",invalid_json:"The feedback came back in the wrong format. Please try again.",sampling_disabled:"Asking Claude is turned off for this account.",session_expired:"Your session has expired. Reload the page and sign in again.",too_long:"Your answer is too long for teacher feedback. Try a shorter piece (under about 600 words).",network:"Could not reach the feedback service. Check your internet connection and try again.",timeout:"The AI marker took too long to answer. Please try again in a minute."}[e&&e.code]||"Feedback is not available right now. Please try again later.";out.innerHTML='<p class="sxsub">'+m+(e&&e.detail?'<br><small>Details for your teacher: '+sxH(String(e.detail).slice(0,300))+'</small>':'')+'</p>';if(e&&e.code=="not_granted")b.hidden=true}).then(function(){S.busy=0;b.textContent="\u2728 Teacher feedback"})})}
function fbShow(id,r,t){var LV6=["A1","A2","B1","B2","C1","C2"],ok=function(l){return LV6.indexOf(l)>=0},nt=fbNorm(t),drop=0;r=r||{};
 var cor=(r.corrections||[]).filter(function(c){var q=c&&c.quote&&fbNorm(c.quote);if(q&&nt.indexOf(q)>=0&&c.fix&&fbNorm(c.fix)!=q)return true;drop++;return false}).slice(0,8);
 var h='<div class="fbai"><div class="fbtop"><span class="lvl" style="--lc:'+(LC[r.overall]||"#e5e7eb")+'">'+(ok(r.overall)?r.overall:"?")+'</span><div><p class="lvkick">'+(ok(r.overall)?"Estimated level of this answer":"Not enough to estimate a level")+(r.confidence?' \u00B7 '+sxH(r.confidence)+' confidence':'')+'</p><p>'+sxH(r.summary||"")+'</p></div></div>';
 if(r.criteria&&r.criteria.length)h+='<div class="fbcr">'+r.criteria.map(function(c){return'<div><span class="lv" style="--lc:'+(LC[c.level]||"#e5e7eb")+'">'+(ok(c.level)?c.level:"\u2013")+'</span><b>'+sxH(c.name||"")+'</b><small>'+sxH(c.note||"")+'</small></div>'}).join("")+'</div>';
 if(r.target&&r.target.note)h+='<p class="fbtg">'+(r.target.used&&r.target.correct?"\u2705":"\uD83D\uDCA1")+' <b>Today\u2019s grammar:</b> '+sxH(r.target.note)+'</p>';
 if(cor.length)h+='<p class="fbh">Corrections</p><ul class="fbco">'+cor.map(function(c){return'<li><span class="fbq1"><s>'+sxH(c.quote)+'</s> \u2192 <ins>'+sxH(c.fix)+'</ins></span>'+(c.type?'<small class="fbty">'+sxH(c.type)+'</small>':'')+'<p>'+sxH(c.why||"")+'</p></li>'}).join("")+'</ul>';
 else h+='<p class="fbh">No corrections needed. Well done.</p>';
 if(drop)h+='<p class="sxsub">'+drop+' suggestion'+(drop>1?"s were":" was")+' removed because '+(drop>1?"they":"it")+' did not quote your exact words.</p>';
 if(r.strengths&&r.strengths.length)h+='<p class="fbh">What you did well</p><ul class="fbl">'+r.strengths.slice(0,2).map(function(x){return'<li>'+sxH(x)+'</li>'}).join("")+'</ul>';
 if(r.next&&r.next.length)h+='<p class="fbh">Next steps</p><ul class="fbl">'+r.next.slice(0,2).map(function(x){return'<li>'+sxH(x)+'</li>'}).join("")+'</ul>';
 if(r.rewrite)h+='<details class="sxd"><summary>See an improved version</summary><p class="fbrw">'+sxH(r.rewrite)+'</p><button class="sxs" onclick="sxSay(this.previousElementSibling.textContent,\'f\',this)" aria-label="Listen to the improved version">\uD83D\uDD0A</button></details>';
 h+='<p class="sxsub fbnote">Marked by '+fbWho()+' with a CEFR-based rubric. It is a teacher-style estimate from one short sample, not an official exam score.'+(FBST[id].sp?' Pronunciation is not judged, because the AI only sees the transcript.':'')+'</p></div>';
 $("#fba-"+id).innerHTML=h}
/* read-aloud check: what the speech recogniser understood, word by word */
function fbRead(target,btn){if(!FBSR){vNote("Speech recognition is not available in this browser. Try Chrome, Edge or Safari.");return}cvKill();
 var box=btn.closest(".sxrow"),out=box&&box.querySelector(".fbra");if(!out){out=document.createElement("div");out.className="fbra";box.appendChild(out)}
 var r=new FBSR();r.lang={au:"en-AU",uk:"en-GB",us:"en-US"}[typeof VACC=="string"?VACC:"au"]||"en-AU";r.interimResults=false;r.maxAlternatives=3;btn.classList.add("rec");out.innerHTML='<span class="sxsub">Listening\u2026 read the sentence aloud.</span>';
 r.onresult=function(e){var alts=[].slice.call(e.results[0]).map(function(a){return a.transcript}),want=sxExp(sxC(target)).split(" "),bestS=-1,bestH="";
  alts.forEach(function(a){var got=sxExp(a).split(" "),hit=want.filter(function(w){return got.indexOf(w)>=0}).length;if(hit>bestS){bestS=hit;bestH=a}});
  var pct=Math.round(bestS/want.length*100);out.innerHTML='<b>'+(pct>=90?"\u2705 Clear!":pct>=70?"\uD83D\uDC4D Nearly.":"\uD83D\uDD01 Try again.")+'</b> The computer understood '+bestS+' of '+want.length+' words: '+sxDiff(sxC(target),bestH)+'<br><small class="sxsub">Heard: \u201C'+sxH(bestH)+'\u201D. This shows how clear your speech is to a computer, not your accent.</small>'};
 r.onerror=function(e){out.innerHTML='<span class="sxsub">'+(e.error=="not-allowed"||e.error=="service-not-allowed"?"The microphone is blocked here. Allow it in your browser settings.":e.error=="no-speech"?"No speech heard. Try again.":"Speech recognition stopped. Try again.")+'</span>'};
 r.onend=function(){btn.classList.remove("rec")};try{r.start()}catch(e){btn.classList.remove("rec")}}
