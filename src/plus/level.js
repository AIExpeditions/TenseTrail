/* ---- Find Your Level: adaptive placement test ----
 Method (see the project brief for sources):
 - 3-parameter logistic IRT model with fixed slope a and guessing c = 1/4 (four options).
 - Optional CEFR "can do" self-assessment sets the prior (DIALANG-style).
 - Ability is re-estimated after every answer by EAP (expected a posteriori) on a grid.
 - Next item: most information at the current estimate, chosen at random from the best 3
   (randomesque exposure control), with content balancing across five skills.
 - Stop when the standard error is 0.45 or less after at least 15 items, or after 30 items. */
var LVB={A1:-2.6,A2:-1.4,B1:-0.2,B2:1.0,C1:2.2,C2:3.4},LVA=1.4,LVC=.25,LVMIN=15,LVMAX=30,LVSE=.45,LVK="tt_lvl_v1",LVR="tt_lvl_run";
var LVSK={g:"Grammar",v:"Vocabulary",f:"Everyday language",r:"Reading",l:"Listening"},LVT={g:.38,v:.22,f:.1,r:.15,l:.15};
var LVCUT=[[-3.2,"Pre-A1"],[-2,"A1"],[-.8,"A2"],[.4,"B1"],[1.6,"B2"],[2.8,"C1"],[99,"C2"]];
var LVD={"Pre-A1":"You are starting out. You know a few words and phrases.","A1":"Beginner. You can use familiar everyday phrases and very basic sentences.","A2":"Elementary. You can talk about routines, shopping, family and simple needs.","B1":"Intermediate. You can handle most everyday situations and give opinions with reasons.","B2":"Upper intermediate. You can discuss many topics with fluency and follow complex ideas.","C1":"Advanced. You use English flexibly for work and study, with control of complex structures.","C2":"Proficient. You understand almost everything and express fine shades of meaning."};
var LVSA=[["A1","I can introduce myself and ask simple questions, like where someone lives."],["A2","I can talk about my routine, go shopping and ask for directions."],["B1","I can manage most travel situations and describe experiences, plans and opinions."],["B2","I can follow the TV news and take part in a discussion at work."],["C1","I can read long, complex texts and speak fluently without searching for words."],["C2","I understand almost everything I hear or read and can express fine shades of meaning."]];
(function(){var n={};LVI.forEach(function(it,i){var k=it.l+it.s;n[k]=(n[k]||[]);n[k].push(i)});Object.keys(n).forEach(function(k){var a=n[k];a.forEach(function(ix,j){LVI[ix].b=LVB[LVI[ix].l]+(a.length>1?-.3+.6*j/(a.length-1):0);LVI[ix].id=ix})})})();
var LV=null,LVG=[];for(var _g=-5;_g<=5.51;_g+=.1)LVG.push(Math.round(_g*10)/10);
function lvP(th,b){return LVC+(1-LVC)/(1+Math.exp(-LVA*(th-b)))}
function lvInfo(th,b){var p=lvP(th,b);return LVA*LVA*Math.pow(p-LVC,2)/Math.pow(1-LVC,2)*(1-p)/p}
function lvEst(mu,res){var w=LVG.map(function(t){var l=Math.exp(-Math.pow(t-mu,2)/(2*1.4*1.4));res.forEach(function(r){var p=lvP(t,LVI[r.i].b);l*=r.ok?p:1-p});return l}),s=0,m=0,v=0;w.forEach(function(x,i){s+=x;m+=x*LVG[i]});m/=s;w.forEach(function(x,i){v+=x*Math.pow(LVG[i]-m,2)});return{th:m,se:Math.sqrt(v/s)}}
function lvLevel(th){for(var i=0;i<LVCUT.length;i++)if(th<LVCUT[i][0])return LVCUT[i][1];return"C2"}
function lvSub(th){var L=lvLevel(th),i=LVCUT.map(function(c){return c[1]}).indexOf(L),lo=i?LVCUT[i-1][0]:-5,hi=LVCUT[i][0]>50?4.2:LVCUT[i][0],f=(th-lo)/(hi-lo);return f<.34?"low":f<.67?"mid":"high"}
function lvScore(th){return Math.max(0,Math.min(100,Math.round((th+4)/8.4*100)))}
function lvHist(){try{return JSON.parse(localStorage.getItem(LVK))||[]}catch(e){return[]}}
function lvSaveRun(){try{if(LV&&LV.ph=="test")localStorage.setItem(LVR,JSON.stringify(LV));else localStorage.removeItem(LVR)}catch(e){}}
function lvLoadRun(){try{var o=JSON.parse(localStorage.getItem(LVR));if(o&&o.ph=="test"&&o.res&&o.v==LVI.length)return o}catch(e){}return null}
function lvShuf(a){var b=a.slice();for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=b[i];b[i]=b[j];b[j]=t}return b}
function lvNextItem(){var s=LV,used={},pu={},cnt={g:0,v:0,f:0,r:0,l:0},n=s.res.length;s.res.forEach(function(r){used[r.i]=1;var it=LVI[r.i];cnt[it.s]++;if(it.p)pu[it.p]=1});
 var ok=function(i){var it=LVI[i];return!used[i]&&!(it.p&&pu[it.p])},sk=Object.keys(LVT).sort(function(a,b){return(LVT[b]*(n+1)-cnt[b])-(LVT[a]*(n+1)-cnt[a])});
 for(var q=0;q<sk.length;q++){var pool=LVI.map(function(_,i){return i}).filter(function(i){return ok(i)&&LVI[i].s==sk[q]});if(!pool.length)continue;
  pool.sort(function(a,b){return lvInfo(s.th,LVI[b].b)-lvInfo(s.th,LVI[a].b)});return pool[Math.floor(Math.random()*Math.min(3,pool.length))]}
 return-1}
function lvPage(){return pg("🧭","Find Your Level","An adaptive placement test. Every answer changes the next question, so it finds your level in about 15 to 25 questions.",'<div id="lvbox">'+lvIntro()+'</div>')}
function lvIntro(){var h=lvHist(),run=lvLoadRun(),last=h[h.length-1];
 var x='<div class="lvi rv"><div class="lvsteps"><div><b>1</b><span>Tell us what you can do (optional)</span></div><div><b>2</b><span>Answer 15 to 30 questions: grammar, vocabulary, everyday language, reading and listening</span></div><div><b>3</b><span>Get your CEFR level, a skills profile and where to start</span></div></div>'
 +'<ul class="lvh"><li><b>Adaptive.</b> Get one right and the next is harder. Miss one and it gets easier. The test stops when it is confident.</li><li><b>No tricks.</b> If you do not know, choose <i>I don’t know</i>. Guessing makes the result less accurate.</li><li><b>Listening</b> questions play a short conversation. You can play each one twice. Turn your sound on.</li><li><b>About 10 to 15 minutes.</b> Your progress is saved on this device, so you can stop and come back.</li></ul>'
 +'<div class="sxbt">'+(run?'<button class="btn" onclick="lvResume()">Continue my test ('+run.res.length+' answered)</button> <button class="btn ghost" onclick="lvSelf()">Start again</button>':'<button class="btn" onclick="lvSelf()">Start the test</button>')+'</div></div>';
 if(last)x+='<div class="lvi rv"><h3>Your results on this device</h3><div class="lvhist">'+h.slice(-6).reverse().map(function(r){return'<div><span class="lv" style="--lc:'+(LC[r.lvl]||"#ccc")+'">'+r.lvl+'</span><b>'+r.score+'/100</b><small>'+new Date(r.ts).toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"})+' · '+r.n+' questions</small></div>'}).join("")+'</div><p class="sxsub">Retake the test every few months to see how far you have come. The questions change each time.</p></div>';
 x+='<details class="sxd lvhow"><summary>How the test works</summary><p>Each question has a difficulty on the same scale as your ability. After every answer, the test updates its estimate of your ability and how sure it is (the standard error). It then picks the question that tells it the most about you, while keeping a balance of skills. This is called computer-adaptive testing, and it is how tests like Linguaskill work.</p><p>The levels follow the Common European Framework of Reference (CEFR), from A1 to C2.</p><p><b>Please note:</b> question difficulties are expert estimates. They have not yet been calibrated with results from real learners, so treat your level as a guide, not a certificate. This test does not measure speaking or writing. You can add a writing or speaking sample at the end for a separate estimate.</p></details>';
 return x}
function lvSelf(){try{localStorage.removeItem(LVR)}catch(e){}cvKill();$("#lvbox").innerHTML='<div class="lvi lvin"><h3>Which sentence sounds most like you today?</h3><p class="sxsub">Pick the highest one that is true. This only chooses where the test starts.</p><div class="lvsa">'+LVSA.map(function(s,i){return'<button class="sxo" onclick="lvBegin(\''+s[0]+'\')"><span class="lv" style="--lc:'+LC[s[0]]+'">'+s[0]+'</span> '+sxH(s[1])+'</button>'}).join("")+'<button class="sxo" onclick="lvBegin(\'\')">I’m not sure. Start in the middle.</button></div></div>';lvTop()}
function lvTop(){var b=$("#lvbox");if(b&&b.getBoundingClientRect().top<70)scrollTo({top:b.offsetTop-90,behavior:rm?"auto":"smooth"})}
function lvBegin(sa){var mu=sa?LVB[sa]:-.2;LV={ph:"test",v:LVI.length,mu:mu,sa:sa,th:mu,se:1.4,res:[],t0:Date.now()};lvAsk()}
function lvResume(){LV=lvLoadRun();if(!LV){lvSelf();return}var e=lvEst(LV.mu,LV.res);LV.th=e.th;LV.se=e.se;LV.cur=null;lvAsk()}
function lvAsk(){var s=LV,n=s.res.length;if(n>=LVMAX||(n>=LVMIN&&s.se<=LVSE)){lvDone();return}var i=lvNextItem();if(i<0){lvDone();return}
 s.cur={i:i,o:lvShuf(LVI[i].o.map(function(_,j){return j})),t:Date.now(),pl:0};lvSaveRun();lvDraw()}
function lvDraw(){var s=LV,c=s.cur,it=LVI[c.i],n=s.res.length,pr=Math.max(n/LVMAX,Math.min(1,(1.4-s.se)/(1.4-LVSE))*(n/LVMIN<1?n/LVMIN:1));
 var h='<div class="lvi lvq"><div class="sxpb"><i style="width:'+Math.round(Math.min(.97,pr)*100)+'%"></i></div><div class="sxqh"><span>Question '+(n+1)+'</span><b>'+LVSK[it.s]+'</b></div>';
 if(it.p)h+='<div class="lvp">'+sxH(LVP[it.p])+'</div>';
 if(it.au)h+='<div class="lvau"><button class="btn ghost" id="lvpl" onclick="lvPlay()">▶ Play the conversation</button><span class="sxsub" id="lvpn">You can play it twice.</span></div>';
 h+='<p class="sxst2">'+sxH(it.q).replace("___",'<span class="sxbl">  </span>')+'</p><div class="sxos">'+c.o.map(function(j,k){return'<button class="sxo" onclick="lvAns('+j+')"><kbd>'+(k+1)+'</kbd> '+sxH(it.o[j])+'</button>'}).join("")+'<button class="sxo lvdk" onclick="lvAns(-1)"><kbd>0</kbd> I don’t know</button></div>';
 h+='<div class="lvft"><button class="lnk" onclick="lvQuit()">Save and stop for now</button></div></div>';
 $("#lvbox").innerHTML=h;lvTop()}
function lvPlay(){var c=LV&&LV.cur;if(!c)return;var it=LVI[c.i];if(c.pl>=2)return;c.pl++;cvKill();var my=++SXT,b=$("#lvpl"),n=$("#lvpn");if(n)n.textContent=c.pl>=2?"That was your last play.":"One more play left.";if(b){b.disabled=true;b.textContent="🔊 Playing…"}
 var done=function(){if(b){b.disabled=c.pl>=2;b.textContent=c.pl>=2?"No plays left":"▶ Play again"}};
 (function nx(k){if(my!=SXT){done();return}if(k>=it.au.length){done();return}var ln=it.au[k],f=vFor(ln[0]);vTalk(ln[2],{v:f.v,g:ln[0],rate:LVI[c.i].l<"B"?.88:.97,alive:function(){return my==SXT},onend:function(){setTimeout(function(){nx(k+1)},350)},onfail:function(){done();if(n)n.textContent="Audio is not available on this device. Choose I don’t know to skip this question."}})})(0)}
function lvAns(j){var s=LV;if(!s||!s.cur)return;var c=s.cur;cvKill();SXT++;s.res.push({i:c.i,ok:j==0,c:j,ms:Date.now()-c.t});var e=lvEst(s.mu,s.res);s.th=e.th;s.se=e.se;s.cur=null;lvAsk()}
function lvQuit(){lvSaveRun();cvKill();SXT++;LV=null;$("#lvbox").innerHTML=lvIntro();obs()}
function lvKey(e){if(!LV||!LV.cur||!$("#lvbox")||/INPUT|TEXTAREA/.test((e.target||{}).tagName||""))return;var k=e.key;if(k=="0"){lvAns(-1);return}var d=+k;if(d>=1&&d<=LV.cur.o.length)lvAns(LV.cur.o[d-1])}
document.addEventListener("keydown",lvKey);
function lvDone(){var s=LV,e=lvEst(s.mu,s.res),th=e.th,se=e.se,lvl=lvLevel(th),lo=lvLevel(th-1.28*se),hi=lvLevel(th+1.28*se),sk={},ar={},fast=0,nl=0;
 s.res.forEach(function(r){var it=LVI[r.i],p=lvP(th,it.b),o=sk[it.s]=sk[it.s]||[0,0,0];o[0]+=r.ok?1:0;o[1]++;o[2]+=p;if(it.s!="l"){nl++;if(r.ms<2500&&r.c>=0)fast++}
  if(it.t){var a=ar[it.t]=ar[it.t]||{w:0,r:0};if(!r.ok&&p>=.5)a.w++;if(r.ok)a.r++}});
 var rec={ts:Date.now(),lvl:lvl,sub:lvSub(th),th:Math.round(th*100)/100,se:Math.round(se*100)/100,score:lvScore(th),n:s.res.length,lo:lo,hi:hi,sk:sk,sa:s.sa};
 var h=lvHist();h.push(rec);try{localStorage.setItem(LVK,JSON.stringify(h.slice(-20)));localStorage.removeItem(LVR)}catch(x){}
 s.ph="done";s.rec=rec;s.ar=ar;s.fast=nl&&fast/nl>.25;ttLog();lvResult();if(typeof boom=="function"&&lvScore(th)>=40)boom()}
function lvResult(){var s=LV,r=s.rec,i;var weak=Object.keys(s.ar).filter(function(a){return s.ar[a].w>0}).sort(function(a,b){return s.ar[b].w-s.ar[a].w}).slice(0,3);
 var h='<div class="lvi lvres"><div class="lvbig"><span class="lvl" style="--lc:'+(LC[r.lvl]||"#ffd9a8")+'">'+r.lvl+'</span><div><p class="lvkick">Your estimated level</p><h2>'+r.lvl+' <small>('+r.sub+')</small></h2><p>'+LVD[r.lvl]+'</p></div></div>';
 h+='<div class="lvmeter" aria-label="Score '+r.score+' out of 100"><div class="lvbar"><i style="left:'+lvScore(r.th-1.28*r.se)+'%;right:'+(100-lvScore(r.th+1.28*r.se))+'%"></i><b style="left:'+r.score+'%"></b></div><div class="lvticks">'+["A1","A2","B1","B2","C1","C2"].map(function(l){return'<span>'+l+'</span>'}).join("")+'</div></div>';
 h+='<p class="lvconf">Score <b>'+r.score+'/100</b> from '+r.n+' questions. '+(r.lo==r.hi?'We are fairly confident you are at <b>'+r.lvl+'</b>.':'Your level is most likely between <b>'+r.lo+'</b> and <b>'+r.hi+'</b> (80% range).')+'</p>';
 if(s.fast)h+='<p class="sxfb hint">Some answers were very quick. If you were guessing, take the test again and choose <i>I don’t know</i> instead.</p>';
 h+='<h3>Your skills</h3><div class="lvsk">'+Object.keys(LVSK).filter(function(k){return r.sk[k]}).map(function(k){var o=r.sk[k],d=(o[0]-o[2])/o[1],lab=o[1]<2?"Too few questions to say":d>.15?"Stronger than your overall level":d<-.15?"Weaker than your overall level":"In line with your level",cl=o[1]<2?"":d>.15?"up":d<-.15?"dn":"eq";return'<div class="lvs '+cl+'"><b>'+LVSK[k]+'</b><span>'+o[0]+' of '+o[1]+' correct</span><small>'+lab+'</small></div>'}).join("")+'</div>';
 h+='<h3>Where to start</h3><div class="lvrec">'+lvRecs(r.lvl,weak)+'</div>';
 h+='<details class="sxd"><summary>Review your answers</summary><ol class="lvrev">'+s.res.map(function(x){var it=LVI[x.i];return'<li class="'+(x.ok?"ok":"no")+'"><small>'+LVSK[it.s]+' · '+it.l+'</small>'+(it.p?'<p class="lvp sm">'+sxH(LVP[it.p])+'</p>':'')+(it.au?'<p class="lvp sm">'+it.au.map(function(a){return'<b>'+a[1]+':</b> '+sxH(a[2])}).join("<br>")+'</p>':'')+'<p>'+sxH(it.q)+'</p><p>'+(x.ok?'✓ ':'✗ Your answer: '+(x.c<0?'I don’t know':sxH(it.o[x.c]))+'. ')+'<b>'+sxH(it.o[0])+'</b></p><p class="sxsub">'+sxH(it.x)+'</p></li>'}).join("")+'</ol></details>';
 h+='<h3>Add a writing or speaking sample (optional)</h3><p class="sxsub">This test covers grammar, vocabulary, reading and listening. Write or say 60 to 150 words to get a separate estimate for writing or speaking.</p>'+fbWidget("lv",{task:"Describe the place where you live and say what you like and dislike about it. Write or say 60 to 150 words.",level:r.lvl,topic:"General placement sample",mode:"placement"});
 h+='<div class="sxbt" style="margin-top:20px"><button class="btn ghost" onclick="lvSelf()">Take the test again</button> <a class="btn" href="#/worksheets/grammar">Open the Grammar Studio</a></div><p class="sxsub" style="margin-top:12px">Saved on this device. Difficulties are expert estimates, not yet calibrated with real learners, so use this level as a guide.</p></div>';
 $("#lvbox").innerHTML=h;lvTop();fbInit("lv")}
function lvRecs(lvl,weak){var L2=["A1","A2","B1","B2","C1"],tgt=lvl=="Pre-A1"?"A1":lvl=="C2"?"C1":lvl,out=[],seen={};
 var pick=function(area){if(area=="tenses"){var t=tgt<"B"?(tgt=="A1"?0:4):tgt=="B1"?2:6;return{h:"#/worksheets/grammar/studio/"+t,t:nm(t),a:"Verb tenses",l:LV2[t]}}var A=XA[area];if(!A)return null;var best=null;A.x.forEach(function(x,k){var d=Math.abs(L2.indexOf(x.lv)-L2.indexOf(tgt));if(L2.indexOf(x.lv)>L2.indexOf(tgt))d+=.5;if(!best||d<best.d)best={d:d,k:k}});var x=A.x[best.k];return{h:"#/worksheets/grammar/"+area+"/"+best.k,t:x.t,a:A.n,l:x.lv}};
 weak.forEach(function(a){var p=pick(a);if(p&&!seen[p.h]){seen[p.h]=1;p.why="You missed questions on this at your level.";out.push(p)}});
 ["tenses","sentences","modals","nouns","conditionals","adj","preps","passive","patterns"].forEach(function(a){if(out.length>=4)return;var p=pick(a);if(p&&!seen[p.h]&&p.l==tgt){seen[p.h]=1;p.why="A key "+tgt+" topic.";out.push(p)}});
 return out.map(function(p,i){return'<a class="rl" style="--i:'+i+';--lc:'+LC[p.l]+'" href="'+p.h+'"><span class="lv">'+p.l+'</span><b>'+sxH(p.t)+'</b><small>'+sxH(p.a)+'. '+p.why+'</small><span class="rs o">Start here →</span></a>'}).join("")}
