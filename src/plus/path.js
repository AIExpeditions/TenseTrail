/* ---- Guided path: one route from A1 to C1 ----
   Every lesson stays open. The path only recommends an order.
   Lesson ids: g:<area>:<index> grammar lesson, t:<index> tense, k:<skill>:<topic> English Skills lesson. */
var PTK="tt_path_v1",PTL=["A1","A2","B1","B2","C1"],PTREV=0;
var PTLN={A1:"Starting out",A2:"Everyday English",B1:"Independent",B2:"Confident",C1:"Advanced"};
function ptLoad(){try{var o=JSON.parse(localStorage.getItem(PTK));if(o&&typeof o=="object")return o}catch(e){}return{}}
function ptSave(o){try{localStorage.setItem(PTK,JSON.stringify(o))}catch(e){}}
function ptLvl(l){return l=="Pre-A1"?"A1":l=="C2"?"C1":PTL.indexOf(l)>=0?l:null}
/* Where the trail starts: the learner's own choice, else the latest placement result. */
function ptStartLv(){var o=ptLoad();if(ptLvl(o.start))return{l:o.start,src:"you"};var h=lvHist().slice(-1)[0];if(h&&ptLvl(h.lvl))return{l:ptLvl(h.lvl),src:"test"};return null}
var PTC=null;
function ptStores(){var c={},now=Date.now();Object.keys(XA).forEach(function(a){var o=null;try{o=JSON.parse(localStorage.getItem(XA[a].k))}catch(e){}c[a]=o&&o.c?o.c:{}});c._sk=skLoad().d;c._now=now;return c}
function ptInfo(id,S){var p=id.split(":"),r={id:id,st:"new",due:false};
 if(p[0]=="g"){var A=XA[p[1]],x=A&&A.x[+p[2]];if(!x)return null;var o=S[p[1]][p[2]]||{};r.t=x.t;r.lv=x.lv;r.kind=A.n;r.e="✏️";r.h="#/worksheets/grammar/"+p[1]+"/"+p[2];r.area=p[1];
  if(o.best!=null){var n=o.n||20;r.sc=o.best+" / "+n;r.st=o.best>=Math.ceil(n*.8)||o.rp?"pass":"start";if(o.rp&&o.best<Math.ceil(n*.8))r.sc+=", retest passed"}if(o.box&&o.due<=S._now)r.due=true;r.np=!!o.np;r.sec=r.st=="pass"&&(o.rv||0)>=2&&!o.np}
 else if(p[0]=="t"){var i=+p[1],b=best("c",i);r.t=nm(i);r.lv=LV2[i];r.kind="Tense Studio";r.e="✨";r.h="#/worksheets/grammar/studio/"+i;if(b){r.sc=b+" / 15";r.st=b>=12?"pass":"start"}}
 else{var k=p[1],T=SKT[+p[2]];if(!T||!T[k])return null;r.t=T[k].ti;r.lv=T.lv;r.kind=SKN[k]+" skills";r.e=SKE[k];r.h="#/worksheets/"+SKSL[k]+"/"+p[2];r.topic=T.id;if(S._sk[k+p[2]])r.st="pass"}
 return r}
function ptAll(){var S=ptStores(),sl=ptStartLv(),si=sl?PTL.indexOf(sl.l):0,out=[];
 PTU.forEach(function(u,ui){u[3].forEach(function(id){var r=ptInfo(id,S);if(!r)return;r.u=ui;if(r.st!="pass"&&PTL.indexOf(r.lv)<si&&PTL.indexOf(u[0])<si)r.st="placed";out.push(r)})});
 var nx=null;out.forEach(function(r){if(!nx&&r.st!="pass"&&r.st!="placed"&&PTL.indexOf(PTU[r.u][0])>=si)nx=r});
 if(!nx)out.forEach(function(r){if(!nx&&r.st!="pass")nx=r});
 return{list:out,next:nx,start:sl,S:S}}
/* Lessons due for review today, most overdue first. Each takes 4 questions in the mixed review. */
function ptDue(S){var now=S._now,out=[];Object.keys(XA).forEach(function(a){Object.keys(S[a]).forEach(function(k){var o=S[a][k];if(o&&o.box&&o.due<=now&&XA[a].x[k])out.push({a:a,k:+k,due:o.due})})});return out.sort(function(x,y){return x.due-y.due})}
function ptToday(P){var o=ptLoad(),d=ttDay(),due=ptDue(P.S),nl=Math.min(due.length,PTMAX),q=due.length*4,nx=P.next,cp=ptCpDue(P),tk=cp<0?ptTkDue(P):-1,h;
 if(!o.td||o.td.d!=d||!o.td.id){o.td={d:d,id:nx?nx.id:""};ptSave(o)}
 var tl=null;P.list.forEach(function(r){if(r.id==o.td.id)tl=r});
 var done=tl&&tl.st=="pass"&&!due.length&&cp<0&&tk<0,heavy=q>40,min=Math.round(nl*4*.4)+(heavy||done||!nx?0:10);
 h='<div class="ptday rv" id="pttoday"><div class="pthd"><small>Today</small><b>'+(done?"Done for today. Well done!":!due.length&&!nx?"You have finished the whole trail!":"About "+Math.max(5,min)+" minutes")+'</b></div>';
 if(due.length){h+='<div class="ptsec"><p><b>1. Review first.</b> '+nl*4+' mixed questions from '+(nl>1?nl+" lessons":"a lesson")+' you have already done'+(due.length>nl?" (the most overdue "+nl+" of "+due.length+")":"")+'. Mixed reviews feel harder than the first practice. That effort is what makes it stick.</p><div class="ptrv"><button class="btn" onclick="ptMix()">Start today\'s review</button></div></div>'}
 if(heavy)h+='<p class="ptnote">Just reviews today. That is great for your memory, and the next lesson will be waiting tomorrow.</p>';
 else if(done){var nn=nx&&nx.id!=tl.id?nx:null;h+='<p class="ptnote">You finished <b>'+sxH(tl.t)+'</b> today.'+(nn?' Want an extra? Next on your trail: <a href="'+nn.h+'">'+sxH(nn.t)+'</a>.':'')+'</p>'}
 else if(cp>=0){h+='<div class="ptsec"><p><b>'+(due.length?"2. Then check a unit.":"Check a unit.")+'</b> You finished every lesson in this unit. A mixed check shows what has stuck.</p><button class="ptbig" onclick="ptCp('+cp+')"><span class="ptbe">🏁</span><span><b>Unit check: '+sxH(PTU[cp][1])+'</b><small>'+ptCpN(cp)+' mixed questions · pass with 80%</small></span><span class="go">Start →</span></button></div>'}
 else if(tk>=0){h+='<div class="ptsec"><p><b>'+(due.length?"2. Then use it.":"Use what you learned.")+'</b> Write or say a short text for this unit, get feedback, then improve it.</p><button class="ptbig" onclick="ptTask('+tk+')"><span class="ptbe">✍️</span><span><b>Unit task: '+sxH(PTU[tk][1])+'</b><small>Writing or speaking · feedback from your AI teacher</small></span><span class="go">Start →</span></button></div>'}
 else if(nx){var tgt=tl&&tl.st!="pass"?tl:nx;h+='<div class="ptsec"><p><b>'+(due.length?"2. Then learn something new.":"Learn something new.")+'</b> Pass the practice with 16 out of 20 (12 out of 15 in the Tense Studio).</p><a class="ptbig" href="'+tgt.h+'"><span class="ptbe">'+tgt.e+'</span><span><b>'+sxH(tgt.t)+'</b><small>'+sxH(tgt.kind)+' · '+tgt.lv+(tgt.st=="start"?" · started, best "+tgt.sc:"")+'</small></span><span class="go">Start →</span></a></div>'}
 var gl=ptGoalNext(P);if(gl&&!heavy&&(!nx||gl.id!=nx.id))h+='<p class="ptnote">For your goal: <a href="'+gl.h+'">'+gl.e+' '+sxH(gl.t)+'</a> ('+sxH(gl.kind)+', '+gl.lv+')</p>';
 return h+'</div>'}
function ptRev(a){PTREV=a;location.hash="#/worksheets/grammar/"+a}
function ptAfter(r){if(r.n=="path"){var o=ptLoad();if(o.jump){o.jump=0;ptSave(o);ptJump()}}
 if(PTREV&&r.n=="worksheets"&&r.a=="grammar"&&r.b==PTREV){PTREV=0;setTimeout(function(){if($("#sxrev")&&typeof sxRevStart=="function"){sxRevStart();var e=$("#sxr");if(e)e.scrollIntoView({behavior:"smooth",block:"start"})}},250)}else if(r.n!="path")PTREV=0}
function ptSetStart(l){var o=ptLoad();if(l)o.start=l;else delete o.start;o.td=null;ptSave(o);render()}
function ptJump(){var e=$(".ptn.now");if(e)e.scrollIntoView({behavior:"smooth",block:"center"})}
function ptStateTxt(r){return r.sec?"Secure · "+r.sc:r.st=="pass"?(r.sc?"Passed · "+r.sc:"Done"):r.st=="start"?"Started · best "+r.sc:r.st=="placed"?"Placed out":"Not started"}
function ptIcon(r){return r.sec?"★":r.st=="pass"?"✓":r.st=="placed"?"↷":r.st=="start"?"◐":""}
function ptMap(P){var h="",byU={};P.list.forEach(function(r){(byU[r.u]=byU[r.u]||[]).push(r)});
 PTL.forEach(function(L){var us=[],tot=0,ok=0;PTU.forEach(function(u,ui){if(u[0]==L)us.push(ui)});us.forEach(function(ui){(byU[ui]||[]).forEach(function(r){tot++;if(r.st=="pass"||r.st=="placed")ok++})});
  var pc=tot?Math.round(ok/tot*100):0;
  h+='<section class="ptlv rv" id="pt-'+L+'" style="--lc:'+LC[L]+'"><div class="ptlh"><span class="lv">'+L+'</span><div><h2>'+PTLN[L]+'</h2><small>'+ok+' of '+tot+' lessons done</small></div><div class="ptbar" role="img" aria-label="'+pc+'% of '+L+' done"><i style="width:'+pc+'%"></i></div></div>';
  us.forEach(function(ui){var u=PTU[ui],rs=byU[ui]||[],all=rs.length&&rs.every(function(r){return r.st=="pass"||r.st=="placed"});
   h+='<div class="ptu'+(all?" ok":"")+'"><div class="ptuh"><small>Unit '+(ui+1)+'</small><h3>'+sxH(u[1])+'</h3><p>'+(all?"✓ Now you can: ":"Goal: ")+sxH(u[2])+'</p></div><ol class="ptl">'
   +rs.map(function(r){var now=P.next&&P.next.id==r.id;return'<li><a class="ptn st-'+r.st+(now?" now":"")+(r.due?" due":"")+'" href="'+r.h+'"><span class="ptd" aria-hidden="true">'+(ptIcon(r)||r.e)+'</span><span class="ptt"><b>'+sxH(r.t)+'</b><small>'+sxH(r.kind)+' · '+r.lv+' · '+ptStateTxt(r)+'</small></span>'+(now?'<span class="tag">You are here</span>':'')+(r.due?'<span class="tag due">Review due</span>':r.np?'<span class="tag np">Needs practice</span>':'')+(r.topic&&r.topic==ptLoad().goal&&r.st!="pass"?'<span class="tag gl">Your goal</span>':'')+'</a></li>'}).join("")+ptCpNode(P,ui)+ptTkNode(ui)+'</ol></div>'});
  h+='</section>'});
 return h}
function ptWelcome(){return'<div class="ptday ptwel rv"><div class="pthd"><small>Welcome</small><b>Where should your trail start?</b></div><p>The trail runs from A1 to C1. Every lesson stays open, so you can always go anywhere. The trail just shows a good order and what to do each day.</p><div class="sxbt"><a class="btn" href="#/level">Take the level test (about 10 minutes)</a> <button class="btn ghost" onclick="ptSetStart(\'A1\')">Start at A1</button></div><p class="sxsub">Know your level already? <select aria-label="My level" onchange="if(this.value)ptSetStart(this.value)"><option value="">Choose…</option>'+PTL.map(function(l){return'<option>'+l+'</option>'}).join("")+'</select></p>'+ptPlanForm()+'</div>'}
function ptHabit(P){var o=ttAct(),st=ttStreak(o),wk=ttWeek(o),g=o.goal||5;return'<div class="pthab rv">'+ptPlanBox(P)+'<div><small>Streak</small><b>'+(st?"🔥 "+st+" day"+(st>1?"s":""):"Start today")+'</b></div><div><small>This week</small><b>'+wk+' / '+g+' sessions</b><select aria-label="Weekly goal" onchange="ttGoal(+this.value);render()">'+[3,5,7,10].map(function(x){return'<option'+(x==g?" selected":"")+'>'+x+'</option>'}).join("")+'</select></div></div>'}
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
 var top=((!sl&&!any)?ptWelcome():ptToday(P))+'<div id="ptrun" class="ptrun"></div>';
 var bar='<div class="ptst rv"><span>Your trail starts at <b>'+(sl?sl.l:"A1")+'</b>'+(sl&&sl.src=="test"?" (from your level test)":"")+'. Change: <select aria-label="Starting level" onchange="ptSetStart(this.value)">'+(sl&&sl.src=="test"?"":'<option value="">From my level test</option>')+PTL.map(function(l){return'<option'+(sl&&sl.l==l?" selected":"")+'>'+l+'</option>'}).join("")+'</select></span><span>'+ok+' of '+tot+' lessons done</span>'+(P.next?'<button class="btn ghost" onclick="ptJump()">Jump to my place</button>':'')+'</div>';
 var how='<details class="sxd rv"><summary>How the trail works</summary><ul class="lvh"><li><b>Nothing is locked.</b> The trail suggests a good order. Open any lesson at any time.</li><li><b>Placed out</b> means your starting level is above that lesson. Do it anyway if you want a refresh.</li><li><b>Pass</b> a lesson with 16 out of 20 in its practice (12 out of 15 in the Tense Studio). English Skills lessons count when you finish them.</li><li><b>Reviews come first.</b> Lessons come back after 1, 3, 7, 14, 30, 60, 120 and 240 days. Today\'s review mixes lessons, and look-alike grammar (like <i>a</i> and <i>the</i>, or the second and third conditional) comes back side by side.</li><li><b>Secure ★</b> means you passed the lesson and then remembered it in two reviews on later days. <b>Needs practice</b> means a review or unit check went wrong. It comes back tomorrow.</li><li><b>Unit checks 🏁</b> mix questions from every grammar lesson in a unit. Pass with 80%.</li><li><b>Unit tasks ✍️</b> ask you to write or speak about real life in Adelaide. Get feedback, fix your text, then send it again.</li><li><b>Missed the pass mark?</b> You get a different explanation and a 10-question retest. Pass it with 8 out of 10. After two tries the trail moves on, and the lesson comes back in tomorrow\'s review.</li><li><b>Little and often</b> works best: about 10 to 15 minutes a day.</li></ul></details>';
 return pg("🧭","Guided path","Your trail from A1 to C1: grammar, tenses and real-life skills in one order, with a plan for each day.",top+ptHabit(P)+bar+ptMap(P)+how+ptBackup())};
/* ---- Stage 2: mixed review, look-alike pairs, unit checks ---- */
var PTMAX=7;
/* Look-alike pairs: when one comes up for review, one question from its partner joins it (if the partner has been practised). */
var PTPAIR=[["nouns:3","nouns:4"],["nouns:5","nouns:6"],["nouns:0","nouns:8"],["adj:1","adj:2"],["adj:3","adj:4"],["adj:6","adj:7"],["preps:1","preps:2"],["preps:0","preps:3"],["preps:3","preps:4"],["modals:0","modals:2"],["modals:1","modals:3"],["modals:4","modals:5"],["modals:5","modals:7"],["modals:6","modals:8"],["conditionals:0","conditionals:1"],["conditionals:1","conditionals:3"],["conditionals:0","conditionals:2"],["conditionals:4","conditionals:6"],["conditionals:3","conditionals:5"],["passive:1","passive:2"],["passive:3","passive:5"],["passive:0","passive:4"],["patterns:0","patterns:2"],["patterns:5","patterns:6"],["patterns:4","patterns:7"],["patterns:3","adj:3"],["sentences:4","sentences:5"],["sentences:1","sentences:3"],["sentences:7","sentences:8"]];
/* n questions from one lesson: about half typed (missing word, correct the mistake), the rest choice. */
function ptPick(a,k,n){if(!XA[a]||!XA[a].x[k])return[];sxUse(a);var all=sxShuf2(sxItemsFor(k)),ty=[],ch=[],ot=[];all.forEach(function(x){x.a=a;(x.t=="gp"||x.t=="fix"?ty:x.t=="mc"||x.t=="fx"?ch:x.t=="bd"?ot:[]).push(x)});
 var m=Math.ceil(n/2),out=ty.slice(0,m);out=out.concat(ch.slice(0,n-out.length));if(out.length<n)out=out.concat(ty.slice(m,m+n-out.length));if(out.length<n)out=out.concat(ot.slice(0,n-out.length));return out}
function ptMix(){var S=ptStores(),due=ptDue(S).slice(0,PTMAX),items=[],seen={};if(!due.length)return;due.forEach(function(d){seen[d.a+":"+d.k]=1});
 due.forEach(function(d){items=items.concat(ptPick(d.a,d.k,4));PTPAIR.forEach(function(p){var me=d.a+":"+d.k,o=p[0]==me?p[1]:p[1]==me?p[0]:null;if(!o||seen[o])return;var q=o.split(":"),r=S[q[0]]&&S[q[0]][q[1]];if(!r||r.best==null)return;seen[o]=1;items=items.concat(ptPick(q[0],+q[1],1))})});
 ptGo(sxShuf2(items),"p",{ls:due})}
function ptGo(items,mode,extra){if(!items.length)return;sxRun(items,"#ptrun",mode);Object.keys(extra||{}).forEach(function(k){SXS[k]=extra[k]});var e=$("#ptrun");if(e)setTimeout(function(){e.scrollIntoView({behavior:rm?"auto":"smooth",block:"start"})},50)}
function ptGl(ui){return PTU[ui][3].filter(function(id){return id.indexOf("g:")==0}).map(function(id){var p=id.split(":");return{a:p[1],k:+p[2]}})}
function ptCpN(ui){var g=ptGl(ui),n=g.length;return n<2?0:Math.min(20,n*Math.max(3,Math.ceil(18/n)))}
/* The first finished unit (from the start level on) whose check has not been taken yet, or -1. */
function ptCpDue(P){var o=ptLoad().cp||{},si=P.start?PTL.indexOf(P.start.l):0,byU={},res=-1;P.list.forEach(function(r){(byU[r.u]=byU[r.u]||[]).push(r)});
 PTU.forEach(function(u,ui){if(res>=0||PTL.indexOf(u[0])<si||!ptCpN(ui)||o[ui])return;if((byU[ui]||[]).every(function(r){return r.st=="pass"}))res=ui});return res}
function ptCp(ui){var g=ptGl(ui),n=g.length;if(n<2)return;var per=Math.max(3,Math.ceil(18/n)),items=[];g.forEach(function(x){items=items.concat(ptPick(x.a,x.k,per))});ptGo(sxShuf2(items).slice(0,20),"u",{ui:ui})}
function ptCpNode(P,ui){var n=ptCpN(ui);if(!n)return"";var c=(ptLoad().cp||{})[ui];return'<li><button class="ptn ptcp st-'+(c&&c.pass?"pass":c?"start":"new")+'" onclick="ptCp('+ui+')"><span class="ptd" aria-hidden="true">🏁</span><span class="ptt"><b>Unit check</b><small>'+n+' mixed questions from this unit · '+(c?(c.pass?"Passed · ":"Best ")+c.b+" / "+c.n:"pass with 80%")+'</small></span></button></li>'}
function ptStore(a){var o=null;try{o=JSON.parse(localStorage.getItem(XA[a].k))}catch(e){}return o&&o.c?o:{c:{}}}
/* Called by the practice engine when a path review (p) or unit check (u) ends. */
function ptEnd(s){var el=$(s.sel),now=Date.now(),by={},keys=[],st={},lines=[];ttLog();
 s.res.forEach(function(r){var k=r.a+":"+r.k;if(!by[k]){by[k]={ok:0,n:0,a:r.a,k:r.k};keys.push(k)}by[k].n++;if(r.ok)by[k].ok++});
 var inSet=s.mode=="p"?s.ls.map(function(d){return d.a+":"+d.k}):keys;
 keys.forEach(function(key){if(inSet.indexOf(key)<0)return;var b=by[key],A=st[b.a]=st[b.a]||ptStore(b.a),o=A.c[b.k]=A.c[b.k]||{},r=b.ok/b.n,msg,cls;
  if(s.mode=="p"){var box=o.box||1;if(r>=.75){o.box=Math.min(SXI.length,box+1);o.rv=(o.rv||0)+1;o.np=0;msg="Remembered. Next review "}else if(r<.5){o.box=Math.max(1,box-2);o.np=1;msg="Not yet. It comes back "}else{o.box=box;msg="Nearly. It comes back "}o.due=now+sxGap(o.box);msg+=sxDate(o.due)+".";cls=r>=.75?"ok":"no"}
  else{if(r<.8){o.np=1;if(!o.box)o.box=1;o.due=now+SXDAY;msg="Needs practice. It comes back tomorrow.";cls="no"}else{o.np=0;msg="Good: 80% or more.";cls="ok"}}
  lines.push('<li class="'+cls+'"><b>'+sxH(XA[b.a].x[b.k].t)+'</b> <span>'+b.ok+' / '+b.n+'. '+msg+'</span></li>')});
 Object.keys(st).forEach(function(a){try{localStorage.setItem(XA[a].k,JSON.stringify(st[a]))}catch(e){}});
 var n=s.items.length,head,pass=s.ok>=Math.ceil(n*.8);
 if(s.mode=="u"){var o=ptLoad();o.cp=o.cp||{};var c=o.cp[s.ui]||{};o.cp[s.ui]={b:Math.max(c.b||0,s.ok),n:n,pass:c.pass||pass,ts:now};ptSave(o);head=pass?'<p><b>Unit passed!</b> Now you can: '+sxH(PTU[s.ui][2])+'</p>':'<p>Not quite 80% yet. Practise the lessons marked below, then take the check again.</p>';if(pass&&typeof boom=="function")try{boom()}catch(e){}}
 else head='<p>Review finished. Each lesson moves to its next review date.</p>';
 el.innerHTML='<div class="sxend"><div class="sxscore"><b>'+s.ok+'</b> / '+n+'</div>'+head+'<ul class="sxrl">'+lines.join("")+'</ul><button class="btn" onclick="render()">Back to my trail</button></div>'}
/* ---- Stage 3: retest after a miss, unit tasks, goal and study plan ---- */
/* After a practice under 80%: a different explanation, then a 10-question retest with new gap questions. */
function ptRtOffer(s){var el=$(s.sel+" .sxend");if(!el)return;var o=sxLoad().c[s.k]||{},left=2-(o.rt||0);if(left<=0)return;
 PTW=s.items.filter(function(x,i){return s.res[i]&&!s.res[i].ok});
 el.insertAdjacentHTML("beforeend",'<div class="ptrt"><b>Not 16 yet?</b> <span>Look at it another way, then take a short retest ('+left+' tr'+(left>1?"ies":"y")+' left).</span> <button class="btn ghost" onclick="ptAnother('+s.k+')">Look at it another way →</button></div>')}
var PTW=[];
function ptGap(c){var out=[];c.nt.forEach(function(t){var m=t.match(/\[\[(.+?)\]\]/);if(!m)return;var a=sxC(m[1]);if(!sxNorm(a))return;out.push({t:"gp",d:[sxC(t.replace(m[0],"___")),[a],c.rm]})});return out}
function ptAnother(k){var c=SX[k],el=$("#sxp");if(!c||!el)return;var miss={};PTW.forEach(function(x){if(x.t=="fix"||x.t=="fx")miss[sxC(x.t=="fix"?x.d[1]:x.d[1][x.d[2]])]=1});
 var ms=c.ms.slice().sort(function(a,b){return(miss[sxC(b[1])]?1:0)-(miss[sxC(a[1])]?1:0)}).slice(0,4);
 el.innerHTML='<div class="ptanw"><h3>Let\'s look at it another way</h3><p class="sxsub">'+sxH(c.rm)+'</p><div class="ptrules">'+c.ru.map(function(r){return'<div><b>'+sxH(r[0])+'</b><p>'+r[1]+'</p></div>'}).join("")+'</div>'
 +'<p class="fbh">Common mistakes to avoid</p><ul class="ptms">'+ms.map(function(m){return'<li><span class="bad">✗ '+sxH(sxC(m[0]))+'</span><span class="good">✓ '+sxH(sxC(m[1]))+'</span><small>'+sxH(m[2])+'</small></li>'}).join("")+'</ul>'
 +(PTW.length?'<p class="fbh">Your answers to check again</p><ul class="ptms">'+PTW.slice(0,4).map(function(x){return'<li><span class="good">✓ '+sxH(sxFull(x))+'</span></li>'}).join("")+'</ul>':'')
 +'<div class="sxbt"><button class="btn" onclick="ptRetest('+k+')">Start the retest (10 questions)</button></div></div>';
 scrollTo({top:el.getBoundingClientRect().top+scrollY-150,behavior:rm?"auto":"smooth"})}
function ptRetest(k){var c=SX[k];if(!c)return;var g=sxShuf2(ptGap(c)).map(function(x){x.k=k;return x}),seen={},items=g.slice(0,4);
 PTW.slice(0,3).forEach(function(x){items.push(x)});items.forEach(function(x){seen[JSON.stringify(x.d)]=1});
 sxShuf2(sxItemsFor(k)).forEach(function(x){if(items.length<10&&x.t!="dc"&&!seen[JSON.stringify(x.d)]){seen[JSON.stringify(x.d)]=1;items.push(x)}});
 sxRun(sxShuf2(items),"#sxp","x",k)}
function ptRtEnd(s){var el=$(s.sel),st=sxLoad(),o=st.c[s.k]||{},n=s.items.length,pass=s.ok>=Math.ceil(n*.8),now=Date.now(),nx=s.k<SX.length-1,msg;ttLog();
 o.rt=(o.rt||0)+1;if(pass){o.rp=1;o.np=0;if(!o.box){o.box=1;o.due=now+SXI[0]*SXDAY}msg='<p><b>Passed!</b> This lesson now counts as passed on your trail.</p>'}
 else if(o.rt>=2){o.np=1;o.box=o.box||1;o.due=now+SXDAY;msg='<p>Let\'s move on for now. This lesson is marked <b>Needs practice</b> and comes back in tomorrow\'s review. A break often helps it click.</p>'}
 else msg='<p>Nearly. Try one more retest, or move on and come back later.</p>';
 st.c[s.k]=o;sxSave(st);if(pass&&typeof boom=="function")try{boom()}catch(e){}
 el.innerHTML='<div class="sxend"><div class="sxscore"><b>'+s.ok+'</b> / '+n+'</div>'+msg+'<div class="sxbt">'+(!pass&&o.rt<2?'<button class="btn ghost" onclick="ptAnother('+s.k+')">Look again and retest</button> ':'')+'<a class="btn ghost" href="#/path">My trail</a>'+(nx?' <a class="btn" href="#/worksheets/grammar/'+SXA+'/'+(s.k+1)+'">Next lesson →</a>':'')+'</div></div>'}
function ptTkCtx(ui){var u=PTU[ui],S=ptStores();return{task:ptTkText(ui),level:u[0],topic:"Unit "+(ui+1)+": "+u[1],rule:u[3].filter(function(id){return id.indexOf("k:")!=0}).map(function(id){var r=ptInfo(id,S);return r&&r.t}).filter(Boolean).join("; "),store:"tt_fb_pu"+ui}}
function ptTask(ui){var el=$("#ptrun");if(!el||!PTTK[ui])return;var c=(ptLoad().tk||{})[ui];
 el.innerHTML='<div class="pttask"><div class="pthd"><small>Unit task · '+PTU[ui][0]+'</small><b>'+sxH(PTU[ui][1])+'</b></div><p class="sxsub">Write it, or switch to Speak and say it. Ask for <b>Teacher feedback</b>, fix what it suggests in your text, then ask again to see how much better it is.'+(c?' You have had feedback '+c.n+' time'+(c.n>1?"s":"")+'.':'')+'</p>'+fbWidget("pu"+ui,ptTkCtx(ui))+'<div class="sxbt"><button class="btn ghost" onclick="render()">Back to my trail</button></div></div>';
 fbInit("pu"+ui);el.scrollIntoView({behavior:rm?"auto":"smooth",block:"start"})}
function ptFbDone(id,t){if(String(id).indexOf("pu")!=0)return;var ui=+id.slice(2),o=ptLoad();o.tk=o.tk||{};var c=o.tk[ui]||{n:0};if(!c.first)c.first=t;c.n++;c.ts=Date.now();o.tk[ui]=c;ptSave(o);
 var a=$("#fba-"+id);if(!a)return;a.insertAdjacentHTML("beforeend",'<div class="ptrw">'+(c.n==1?'<b>Next:</b> fix what the feedback suggests in your text above, then ask for Teacher feedback again.':'<b>Well done for improving it.</b><details><summary>Compare with your first version</summary><p>'+sxH(c.first)+'</p></details>')+'</div>')}
function ptTkDone(ui){var c=(ptLoad().tk||{})[ui];return c&&c.n>0}
function ptTkNode(ui){if(!PTTK[ui])return"";var c=(ptLoad().tk||{})[ui];return'<li><button class="ptn pttk st-'+(c?"pass":"new")+'" onclick="ptTask('+ui+')"><span class="ptd" aria-hidden="true">✍️</span><span class="ptt"><b>Unit task</b><small>Write or speak · '+(c?"feedback "+c.n+" time"+(c.n>1?"s":""):"AI teacher feedback")+'</small></span></button></li>'}
/* The first unit (from the start level on) whose lessons and check are done but whose task is not, or -1. */
function ptTkDue(P){var o=ptLoad(),cp=o.cp||{},si=P.start?PTL.indexOf(P.start.l):0,byU={},res=-1;P.list.forEach(function(r){(byU[r.u]=byU[r.u]||[]).push(r)});
 PTU.forEach(function(u,ui){if(res>=0||PTL.indexOf(u[0])<si||ptTkDone(ui))return;var all=(byU[ui]||[]).every(function(r){return r.st=="pass"});if(all&&(!ptCpN(ui)||(cp[ui]&&cp[ui].pass)))res=ui});return res}
/* Goal and study plan */
var PTG=[["around","Getting around"],["shopping","Shopping and money"],["health","Health and the GP"],["work","Work"],["news","News and study"],["general","General English"]];
function ptPlan(k,v){var o=ptLoad();o[k]=v;ptSave(o);render()}
function ptPlanForm(){var o=ptLoad();return'<div class="ptplan"><label>What do you need English for most? <select aria-label="My goal" onchange="ptPlan(\'goal\',this.value)"><option value="">Choose…</option>'+PTG.map(function(g){return'<option value="'+g[0]+'"'+(o.goal==g[0]?" selected":"")+'>'+g[1]+'</option>'}).join("")+'</select></label><label>Days a week I can study: <select aria-label="Study days a week" onchange="ptPlan(\'days\',+this.value)"><option value="">Choose…</option>'+[2,3,4,5,6,7].map(function(d){return'<option'+(o.days==d?" selected":"")+'>'+d+'</option>'}).join("")+'</select></label></div>'}
function ptPlanBox(P){var o=ptLoad(),g=null;PTG.forEach(function(x){if(x[0]==o.goal)g=x[1]});var est="";
 if(o.days&&P&&P.next){var L=PTU[P.next.u][0],left=P.list.filter(function(r){return PTU[r.u][0]==L&&r.st!="pass"&&r.st!="placed"}).length,wk=Math.max(1,Math.ceil(left/o.days)),d=new Date(Date.now()+wk*7*SXDAY);est='<span class="ptest">'+L+' done by about '+d.toLocaleDateString("en-AU",{day:"numeric",month:"long"})+' ('+left+' lesson'+(left==1?"":"s")+' left)</span>'}
 return'<div class="ptpb"><small>My plan</small><b>'+(o.days?o.days+" days a week":"Set your plan")+(g?" · "+sxH(g):"")+'</b>'+est+'<details><summary>Change</summary>'+ptPlanForm()+'</details></div>'}
function ptGoalNext(P){var g=ptLoad().goal;if(!g||g=="general"||!P.next)return null;var mx=PTL.indexOf(PTU[P.next.u][0]),best=null;P.list.forEach(function(r){if(!best&&r.topic==g&&r.st!="pass"&&PTL.indexOf(r.lv)<=mx)best=r});return best}
