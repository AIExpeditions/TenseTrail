/* ---- Guided path: one route from A1 to C1 ----
   Every lesson stays open. The path only recommends an order.
   Lesson ids: g:<area>:<index> grammar lesson, t:<index> tense, k:<skill>:<topic> English Skills lesson. */
var PTK="tt_path_v1",PTL=["A1","A2","B1","B2","C1"],PTREV=0;
var PTLN={A1:"Starting out",A2:"Everyday English",B1:"Independent",B2:"Confident",C1:"Advanced"};
var PTU=[
 ["A1","First sentences","I can say simple sentences about myself and my day.",["g:sentences:0","g:nouns:0","t:0","g:adj:0","g:nouns:1","k:r:0"]],
 ["A1","People and things","I can talk about people, things and what is happening now.",["g:nouns:2","g:nouns:3","t:1","g:modals:0","k:l:0"]],
 ["A1","Joining ideas","I can join ideas, talk about the future and write a short message.",["g:preps:0","t:8","g:writing:0","k:s:0","k:w:0"]],
 ["A2","Questions and the past","I can ask questions and tell a simple story about the past.",["g:sentences:2","g:sentences:1","g:preps:1","g:preps:2","t:4","t:5"]],
 ["A2","Shopping and things","I can talk about amounts, prices and whose things are whose.",["g:nouns:5","g:nouns:6","g:nouns:4","g:nouns:7","k:r:1","k:l:1"]],
 ["A2","Comparing and describing","I can compare things and say how I feel about them.",["g:adj:1","g:adj:2","g:adj:3","g:adj:4","t:2","k:s:1"]],
 ["A2","Advice and plans","I can give advice and talk about plans and their results.",["g:modals:1","g:conditionals:0","g:patterns:0","g:patterns:1","k:w:1"]],
 ["B1","Experiences and habits","I can talk about my experiences and how life used to be.",["t:3","t:6","g:patterns:5","g:patterns:6","g:modals:2","g:sentences:3"]],
 ["B1","Rules and good guesses","I can explain rules and make good guesses about what is happening.",["g:modals:3","k:r:2","k:l:2","g:modals:4","g:modals:5","g:modals:6"]],
 ["B1","Future and conditions","I can talk about future plans and imagine different situations.",["t:9","t:10","g:conditionals:1","g:conditionals:2","k:s:2","k:w:2"]],
 ["B1","Describing in detail","I can describe people, places and things in more detail.",["g:sentences:4","g:sentences:5","g:adj:5","g:adj:6","g:adj:7","g:adj:8","g:nouns:8"]],
 ["B1","Reporting and the passive","I can say what other people said and what was done.",["g:passive:0","g:passive:1","g:passive:2","g:passive:3","g:nouns:9","g:preps:3"]],
 ["B1","Verb patterns and writing","I can use common verb patterns and write clear, correct sentences.",["g:patterns:2","g:patterns:3","g:patterns:4","g:writing:1","g:writing:2"]],
 ["B2","Looking back","I can talk about past regrets and how things could have been different.",["t:7","g:conditionals:3","g:conditionals:4","g:modals:7","k:r:3"]],
 ["B2","Work and the future","I can handle work conversations and talk about long-term plans.",["t:11","k:l:3","k:s:3","k:w:3"]],
 ["C1","Formal reporting","I can follow and use the formal language of news and reports.",["g:passive:4","g:passive:5","g:nouns:10","g:sentences:6","k:r:4","k:l:4"]],
 ["C1","Emphasis and nuance","I can add emphasis and talk about unreal and possible situations.",["g:sentences:7","g:sentences:8","g:conditionals:5","g:conditionals:6","g:modals:8","k:s:4"]],
 ["C1","Polished writing","I can write smooth, well-linked texts without repeating myself.",["g:preps:4","g:preps:5","g:sentences:9","g:patterns:7","k:w:4"]]
];
function ptLoad(){try{var o=JSON.parse(localStorage.getItem(PTK));if(o&&typeof o=="object")return o}catch(e){}return{}}
function ptSave(o){try{localStorage.setItem(PTK,JSON.stringify(o))}catch(e){}}
function ptLvl(l){return l=="Pre-A1"?"A1":l=="C2"?"C1":PTL.indexOf(l)>=0?l:null}
/* Where the trail starts: the learner's own choice, else the latest placement result. */
function ptStartLv(){var o=ptLoad();if(ptLvl(o.start))return{l:o.start,src:"you"};var h=lvHist().slice(-1)[0];if(h&&ptLvl(h.lvl))return{l:ptLvl(h.lvl),src:"test"};return null}
var PTC=null;
function ptStores(){var c={},now=Date.now();Object.keys(XA).forEach(function(a){var o=null;try{o=JSON.parse(localStorage.getItem(XA[a].k))}catch(e){}c[a]=o&&o.c?o.c:{}});c._sk=skLoad().d;c._now=now;return c}
function ptInfo(id,S){var p=id.split(":"),r={id:id,st:"new",due:false};
 if(p[0]=="g"){var A=XA[p[1]],x=A&&A.x[+p[2]];if(!x)return null;var o=S[p[1]][p[2]]||{};r.t=x.t;r.lv=x.lv;r.kind=A.n;r.e="✏️";r.h="#/worksheets/grammar/"+p[1]+"/"+p[2];r.area=p[1];
  if(o.best!=null){var n=o.n||20;r.sc=o.best+" / "+n;r.st=o.best>=Math.ceil(n*.8)?"pass":"start"}if(o.box&&o.due<=S._now)r.due=true}
 else if(p[0]=="t"){var i=+p[1],b=best("c",i);r.t=nm(i);r.lv=LV2[i];r.kind="Tense Studio";r.e="✨";r.h="#/worksheets/grammar/studio/"+i;if(b){r.sc=b+" / 15";r.st=b>=12?"pass":"start"}}
 else{var k=p[1],T=SKT[+p[2]];if(!T||!T[k])return null;r.t=T[k].ti;r.lv=T.lv;r.kind=SKN[k]+" skills";r.e=SKE[k];r.h="#/worksheets/"+SKSL[k]+"/"+p[2];if(S._sk[k+p[2]])r.st="pass"}
 return r}
function ptAll(){var S=ptStores(),sl=ptStartLv(),si=sl?PTL.indexOf(sl.l):0,out=[];
 PTU.forEach(function(u,ui){u[3].forEach(function(id){var r=ptInfo(id,S);if(!r)return;r.u=ui;if(r.st!="pass"&&PTL.indexOf(r.lv)<si&&PTL.indexOf(u[0])<si)r.st="placed";out.push(r)})});
 var nx=null;out.forEach(function(r){if(!nx&&r.st!="pass"&&r.st!="placed"&&PTL.indexOf(PTU[r.u][0])>=si)nx=r});
 if(!nx)out.forEach(function(r){if(!nx&&r.st!="pass")nx=r});
 return{list:out,next:nx,start:sl,S:S}}
/* Reviews due today, grouped by grammar area. The area review asks 2 questions per lesson, up to 10. */
function ptDue(S){var now=S._now,out=[];Object.keys(XA).forEach(function(a){var n=0;Object.keys(S[a]).forEach(function(k){var o=S[a][k];if(o&&o.box&&o.due<=now&&XA[a].x[k])n++});if(n)out.push({a:a,n:n,q:Math.min(10,n*2)})});return out}
function ptToday(P){var o=ptLoad(),d=ttDay(),due=ptDue(P.S),q=0,nx=P.next,h;due.forEach(function(x){q+=x.q});
 if(!o.td||o.td.d!=d||!o.td.id){o.td={d:d,id:nx?nx.id:""};ptSave(o)}
 var tl=null;P.list.forEach(function(r){if(r.id==o.td.id)tl=r});
 var done=tl&&tl.st=="pass"&&!due.length,heavy=q>40,min=Math.round(q*.4)+(heavy||done||!nx?0:10);
 h='<div class="ptday rv" id="pttoday"><div class="pthd"><small>Today</small><b>'+(done?"Done for today. Well done!":!due.length&&!nx?"You have finished the whole trail!":"About "+Math.max(5,min)+" minutes")+'</b></div>';
 if(due.length){h+='<div class="ptsec"><p><b>1. Review first.</b> '+(due.length>1?"Short mixed questions from lessons you have already done.":"A few quick questions from lessons you have already done.")+'</p><div class="ptrv">'+due.map(function(x){return'<button class="btn" onclick="ptRev(\''+x.a+'\')">Review '+sxH(XA[x.a].n)+' <small>'+x.n+' lesson'+(x.n>1?"s":"")+'</small></button>'}).join("")+'</div></div>'}
 if(heavy)h+='<p class="ptnote">Just reviews today. That is great for your memory, and the next lesson will be waiting tomorrow.</p>';
 else if(done){var nn=nx&&nx.id!=tl.id?nx:null;h+='<p class="ptnote">You finished <b>'+sxH(tl.t)+'</b> today.'+(nn?' Want an extra? Next on your trail: <a href="'+nn.h+'">'+sxH(nn.t)+'</a>.':'')+'</p>'}
 else if(nx){var tgt=tl&&tl.st!="pass"?tl:nx;h+='<div class="ptsec"><p><b>'+(due.length?"2. Then learn something new.":"Learn something new.")+'</b> Pass the practice with 16 out of 20 (12 out of 15 in the Tense Studio).</p><a class="ptbig" href="'+tgt.h+'"><span class="ptbe">'+tgt.e+'</span><span><b>'+sxH(tgt.t)+'</b><small>'+sxH(tgt.kind)+' · '+tgt.lv+(tgt.st=="start"?" · started, best "+tgt.sc:"")+'</small></span><span class="go">Start →</span></a></div>'}
 return h+'</div>'}
function ptRev(a){PTREV=a;location.hash="#/worksheets/grammar/"+a}
function ptAfter(r){if(r.n=="path"){var o=ptLoad();if(o.jump){o.jump=0;ptSave(o);ptJump()}}
 if(PTREV&&r.n=="worksheets"&&r.a=="grammar"&&r.b==PTREV){PTREV=0;setTimeout(function(){if($("#sxrev")&&typeof sxRevStart=="function"){sxRevStart();var e=$("#sxr");if(e)e.scrollIntoView({behavior:"smooth",block:"start"})}},250)}else if(r.n!="path")PTREV=0}
function ptSetStart(l){var o=ptLoad();if(l)o.start=l;else delete o.start;o.td=null;ptSave(o);render()}
function ptJump(){var e=$(".ptn.now");if(e)e.scrollIntoView({behavior:"smooth",block:"center"})}
function ptStateTxt(r){return r.st=="pass"?(r.sc?"Passed · "+r.sc:"Done"):r.st=="start"?"Started · best "+r.sc:r.st=="placed"?"Placed out":"Not started"}
function ptIcon(r){return r.st=="pass"?"✓":r.st=="placed"?"↷":r.st=="start"?"◐":""}
function ptMap(P){var h="",byU={};P.list.forEach(function(r){(byU[r.u]=byU[r.u]||[]).push(r)});
 PTL.forEach(function(L){var us=[],tot=0,ok=0;PTU.forEach(function(u,ui){if(u[0]==L)us.push(ui)});us.forEach(function(ui){(byU[ui]||[]).forEach(function(r){tot++;if(r.st=="pass"||r.st=="placed")ok++})});
  var pc=tot?Math.round(ok/tot*100):0;
  h+='<section class="ptlv rv" id="pt-'+L+'" style="--lc:'+LC[L]+'"><div class="ptlh"><span class="lv">'+L+'</span><div><h2>'+PTLN[L]+'</h2><small>'+ok+' of '+tot+' lessons done</small></div><div class="ptbar" role="img" aria-label="'+pc+'% of '+L+' done"><i style="width:'+pc+'%"></i></div></div>';
  us.forEach(function(ui){var u=PTU[ui],rs=byU[ui]||[],all=rs.length&&rs.every(function(r){return r.st=="pass"||r.st=="placed"});
   h+='<div class="ptu'+(all?" ok":"")+'"><div class="ptuh"><small>Unit '+(ui+1)+'</small><h3>'+sxH(u[1])+'</h3><p>'+(all?"✓ Now you can: ":"Goal: ")+sxH(u[2])+'</p></div><ol class="ptl">'
   +rs.map(function(r){var now=P.next&&P.next.id==r.id;return'<li><a class="ptn st-'+r.st+(now?" now":"")+(r.due?" due":"")+'" href="'+r.h+'"><span class="ptd" aria-hidden="true">'+(ptIcon(r)||r.e)+'</span><span class="ptt"><b>'+sxH(r.t)+'</b><small>'+sxH(r.kind)+' · '+r.lv+' · '+ptStateTxt(r)+'</small></span>'+(now?'<span class="tag">You are here</span>':'')+(r.due?'<span class="tag due">Review due</span>':'')+'</a></li>'}).join("")+'</ol></div>'});
  h+='</section>'});
 return h}
function ptWelcome(){return'<div class="ptday ptwel rv"><div class="pthd"><small>Welcome</small><b>Where should your trail start?</b></div><p>The trail runs from A1 to C1. Every lesson stays open, so you can always go anywhere. The trail just shows a good order and what to do each day.</p><div class="sxbt"><a class="btn" href="#/level">Take the level test (about 10 minutes)</a> <button class="btn ghost" onclick="ptSetStart(\'A1\')">Start at A1</button></div><p class="sxsub">Know your level already? <select aria-label="My level" onchange="if(this.value)ptSetStart(this.value)"><option value="">Choose…</option>'+PTL.map(function(l){return'<option>'+l+'</option>'}).join("")+'</select></p></div>'}
function ptHabit(){var o=ttAct(),st=ttStreak(o),wk=ttWeek(o),g=o.goal||5;return'<div class="pthab rv"><div><small>Streak</small><b>'+(st?"🔥 "+st+" day"+(st>1?"s":""):"Start today")+'</b></div><div><small>This week</small><b>'+wk+' / '+g+' sessions</b><select aria-label="Weekly goal" onchange="ttGoal(+this.value);render()">'+[3,5,7,10].map(function(x){return'<option'+(x==g?" selected":"")+'>'+x+'</option>'}).join("")+'</select></div></div>'}
/* ---- Save my progress: a code the learner can keep and paste back on another device ---- */
function ptExport(){var o={v:1,d:{}};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf("tt_")==0&&k!="tt_theme")o.d[k]=localStorage.getItem(k)}}catch(e){}
 var c="";try{c="TT1."+btoa(unescape(encodeURIComponent(JSON.stringify(o))))}catch(e){}var t=$("#ptcode");if(t){t.value=c;t.hidden=false;t.select()}var b=$("#ptcopy");if(b)b.hidden=!c}
function ptCopy(){var t=$("#ptcode");if(!t)return;t.select();try{navigator.clipboard.writeText(t.value).then(function(){ptMsg("Copied. Keep it somewhere safe, like an email to yourself.")},function(){document.execCommand("copy");ptMsg("Copied.")})}catch(e){try{document.execCommand("copy");ptMsg("Copied.")}catch(x){}}}
function ptImport(){var t=$("#ptin"),v=t?t.value.trim():"",o=null;if(v.indexOf("TT1.")==0)try{o=JSON.parse(decodeURIComponent(escape(atob(v.slice(4)))))}catch(e){}
 if(!o||!o.d){ptMsg("That code did not work. Check you copied all of it.");return}
 if(!confirm("Replace the progress on this device with the progress in this code?"))return;
 try{Object.keys(o.d).forEach(function(k){if(k.indexOf("tt_")==0)localStorage.setItem(k,o.d[k])})}catch(e){ptMsg("This browser would not save it. Is private browsing on?");return}
 location.reload()}
function ptMsg(m){var e=$("#ptmsg");if(e)e.textContent=m}
function ptBackup(){return'<details class="sxd ptbk rv"><summary>Save my progress</summary><p>Your progress is saved in this browser only. Make a backup code to keep it safe, or to carry it to another phone or computer.</p><div class="sxbt"><button class="btn ghost" onclick="ptExport()">Make my backup code</button> <button class="btn ghost" id="ptcopy" onclick="ptCopy()" hidden>Copy</button></div><textarea id="ptcode" class="ptta" readonly hidden aria-label="Your backup code"></textarea><p style="margin-top:16px"><b>Restore from a code</b></p><textarea id="ptin" class="ptta" aria-label="Paste a backup code" placeholder="Paste your code here"></textarea><div class="sxbt"><button class="btn ghost" onclick="ptImport()">Restore</button></div><p class="sxsub" id="ptmsg" aria-live="polite"></p></details>'}
PAGES.path=function(){var P=ptAll(),sl=P.start,any=P.list.some(function(r){return r.st=="pass"||r.st=="start"}),tot=P.list.length,ok=P.list.filter(function(r){return r.st=="pass"||r.st=="placed"}).length;
 var top=(!sl&&!any)?ptWelcome():ptToday(P);
 var bar='<div class="ptst rv"><span>Your trail starts at <b>'+(sl?sl.l:"A1")+'</b>'+(sl&&sl.src=="test"?" (from your level test)":"")+'. Change: <select aria-label="Starting level" onchange="ptSetStart(this.value)">'+(sl&&sl.src=="test"?"":'<option value="">From my level test</option>')+PTL.map(function(l){return'<option'+(sl&&sl.l==l?" selected":"")+'>'+l+'</option>'}).join("")+'</select></span><span>'+ok+' of '+tot+' lessons done</span>'+(P.next?'<button class="btn ghost" onclick="ptJump()">Jump to my place</button>':'')+'</div>';
 var how='<details class="sxd rv"><summary>How the trail works</summary><ul class="lvh"><li><b>Nothing is locked.</b> The trail suggests a good order. Open any lesson at any time.</li><li><b>Placed out</b> means your starting level is above that lesson. Do it anyway if you want a refresh.</li><li><b>Pass</b> a lesson with 16 out of 20 in its practice (12 out of 15 in the Tense Studio). English Skills lessons count when you finish them.</li><li><b>Reviews come first.</b> Lessons come back after 1, 3, 7, 14, 30, 60, 120 and 240 days. Reviews feel harder than the first practice. That effort is what makes it stick.</li><li><b>Little and often</b> works best: about 10 to 15 minutes a day.</li></ul></details>';
 return pg("🧭","Guided path","Your trail from A1 to C1: grammar, tenses and real-life skills in one order, with a plan for each day.",top+ptHabit()+bar+ptMap(P)+how+ptBackup())};
