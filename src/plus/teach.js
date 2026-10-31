/* ---- Study habits: continue, streak, weekly goal ---- */
var TTA="tt_act_v1",TTL="tt_last_v1";
function ttDay(d){d=d||new Date();return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
function ttAct(){try{var o=JSON.parse(localStorage.getItem(TTA));if(o&&o.d)return o}catch(e){}return{d:{},goal:5}}
function ttLog(){var o=ttAct(),k=ttDay();o.d[k]=(o.d[k]||0)+1;var ks=Object.keys(o.d).sort();while(ks.length>120)delete o.d[ks.shift()];try{localStorage.setItem(TTA,JSON.stringify(o))}catch(e){}}
function ttStreak(o){var n=0,d=new Date();if(!o.d[ttDay(d)])d.setDate(d.getDate()-1);while(o.d[ttDay(d)]){n++;d.setDate(d.getDate()-1)}return n}
function ttWeek(o){var d=new Date(),wd=(d.getDay()+6)%7,n=0;for(var i=0;i<=wd;i++){var x=new Date(d);x.setDate(d.getDate()-i);n+=o.d[ttDay(x)]||0}return n}
function ttGoal(g){var o=ttAct();o.goal=g;try{localStorage.setItem(TTA,JSON.stringify(o))}catch(e){}var b=$("#ttdash");if(b)b.outerHTML=ttDash()}
function ttSeen(a,k){try{localStorage.setItem(TTL,JSON.stringify({a:a,k:k,ts:Date.now()}))}catch(e){}}
function ttDue(){var now=Date.now(),n=0;Object.keys(XA).forEach(function(id){try{var o=JSON.parse(localStorage.getItem(XA[id].k));if(o&&o.c)Object.keys(o.c).forEach(function(k){var s=o.c[k];if(s&&s.box&&s.due<=now)n++})}catch(e){}});return n}
function ttDash(){var o=ttAct(),st=ttStreak(o),wk=ttWeek(o),g=o.goal||5,last=null,lv=lvHist().slice(-1)[0],due=ttDue();try{last=JSON.parse(localStorage.getItem(TTL))}catch(e){}
 var L0=last&&XA[last.a]&&XA[last.a].x[last.k];var S0=!L0&&typeof skLastInfo=="function"?skLastInfo(last):null;
 return'<div class="ttd rv" id="ttdash"><div class="ttc ttgo">'+(S0?'<small>Continue where you left off</small><b>'+sxH(S0.t)+'</b><span>'+sxH(S0.s)+'</span><a class="btn" href="'+S0.h+'">Continue →</a>':L0?'<small>Continue where you left off</small><b>'+sxH(L0.t)+'</b><span>'+sxH(XA[last.a].n)+' · '+L0.lv+'</span><a class="btn" href="#/worksheets/grammar/'+last.a+'/'+last.k+'">Continue →</a>':'<small>Start here</small><b>Not sure where to begin?</b><span>Take the placement test and get a starting lesson.</span><a class="btn" href="#/level">Find your level →</a>')+'</div>'
 +'<div class="ttc"><small>Streak</small><b class="ttn">'+(st?"🔥 "+st:"0")+'</b><span>'+(st?"day"+(st>1?"s":"")+" in a row. Practise today to keep it going.":"Finish a practice today to start a streak.")+'</span></div>'
 +'<div class="ttc"><small>This week</small><div class="ttring" style="--p:'+Math.min(100,Math.round(wk/g*100))+'"><b>'+wk+'/'+g+'</b></div><span>practice sessions. Goal: <select aria-label="Weekly goal" onchange="ttGoal(+this.value)">'+[3,5,7,10].map(function(x){return'<option'+(x==g?" selected":"")+'>'+x+'</option>'}).join("")+'</select></span></div>'
 +'<div class="ttc"><small>Your level</small><b class="ttn">'+(lv?lv.lvl:"?")+'</b><span>'+(lv?'From the placement test. <a href="#/level">Retake</a>':'<a href="#/level">Take the test</a> to find out.')+(due?'<br>'+due+' lesson'+(due>1?"s":"")+' due for review.':'')+'</span></div></div>'}
/* ---- PDF helpers (jsPDF) ---- */
function ttAsc(t){return sxC(String(t)).replace(/<[^>]+>/g,"").replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,"-").replace(/…/g,"...").replace(/ /g," ").replace(/[^\x20-\x7E -ÿ]/g,"")}
function ttDoc(title,sub,land){var J=window.jspdf;if(!J)return null;var d=new J.jsPDF({unit:"mm",format:"a4",orientation:land?"landscape":"portrait"}),W=land?297:210,H=land?210:297,P={d:d,y:0,W:W,H:H,L:16,R:W-16};
 P.head=function(a,b){d.setFont("helvetica","bold");d.setFontSize(18);d.setTextColor(0,127,126);d.text("TenseTrail",P.L,17);d.setFontSize(9);d.setTextColor(120,140,160);d.setFont("helvetica","normal");d.text("Grammar Studio",P.R,17,{align:"right"});d.setTextColor(22,50,79);d.setFont("helvetica","bold");d.setFontSize(15);d.text(d.splitTextToSize(ttAsc(a),P.R-P.L),P.L,27);d.setFont("helvetica","normal");d.setFontSize(10);d.text(d.splitTextToSize(ttAsc(b),P.R-P.L),P.L,33);P.y=41};
 P.need=function(h){if(P.y+h>H-14){d.addPage();P.y=18}};
 P.h=function(t){P.need(12);P.y+=3;d.setFont("helvetica","bold");d.setFontSize(12);d.setTextColor(0,127,126);d.text(ttAsc(t),P.L,P.y);P.y+=6;d.setFont("helvetica","normal");d.setTextColor(22,50,79)};
 P.p=function(t,ind,fs,col){fs=fs||10.5;d.setFontSize(fs);var a=d.splitTextToSize(ttAsc(t),P.R-P.L-(ind||0)),lh=fs*.3528*1.4;P.need(a.length*lh+1);if(col)d.setTextColor(col[0],col[1],col[2]);d.text(a,P.L+(ind||0),P.y);d.setTextColor(22,50,79);P.y+=a.length*lh+1.2};
 P.lines=function(n){for(var i=0;i<n;i++){P.need(9);P.y+=8;d.setDrawColor(200,212,224);d.line(P.L,P.y,P.R,P.y)}P.y+=4};
 P.head(title,sub);return P}
async function ttSave(P,fn,fallback){var b=null,dl=null;try{b=P&&P.d.output("blob")}catch(e){}try{dl=window.claude&&await claude.use("downloads")}catch(e){}
 if(dl&&b){try{await dl.save({filename:fn,data:b});return"saved"}catch(e){if(e&&e.code=="declined")return"declined"}}
 if(b&&!(window.claude&&window.claude.use)){try{var u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000);return"saved"}catch(e){}}
 ttPrint(fallback);return"print"}
function ttPrint(html){var p=$("#ttpr");if(!p){p=document.createElement("div");p.id="ttpr";document.body.appendChild(p)}p.innerHTML=html;document.body.classList.add("ttpr");var off=function(){document.body.classList.remove("ttpr");removeEventListener("afterprint",off)};addEventListener("afterprint",off);setTimeout(function(){try{window.print()}catch(e){}setTimeout(off,1500)},60)}
function ttScr(s){var w=s.split(" "),b=w.slice(),n=0;do{b=sxShuf2(w);n++}while(n<9&&b.join(" ")==s);return b.join("  /  ")}
/* ---- Lesson worksheet: quiz page + answer key ---- */
function ttSheetData(k){var c=SX[k],A=sxItemsFor(k),pick=function(t){return A.filter(function(x){return x.t==t})};return{c:c,mc:pick("mc"),fx:pick("fx"),gp:pick("gp"),fix:pick("fix"),bd:pick("bd").slice(0,6)}}
async function ttSheet(k,btn){var S=ttSheetData(k),c=S.c,P=ttDoc(c.t+" ("+c.lv+")",SXN+". Worksheet with answer key on the last page."),key=[],n=0,st=$("#ttms");if(st)st.textContent="Making your PDF…";
 var html='<h1>'+sxH(c.t)+' ('+c.lv+')</h1><p>Name: ________________ Date: __________</p><p><b>Remember:</b> '+sxH(c.rm)+'</p>';
 if(P){P.p("Name: ______________________    Date: ____________    Score: ____ / "+(S.mc.length+S.fx.length+S.gp.length+S.fix.length+S.bd.length));P.p("Remember: "+c.rm,0,10,[60,80,100])}
 var sec=function(t){if(P)P.h(t);html+='<h2>'+sxH(t)+'</h2>'},q=function(t,ind){n++;if(P)P.p(n+". "+t,ind);html+='<p>'+n+'. '+sxH(t)+'</p>'};
 sec("A. Choose the correct answer");S.mc.forEach(function(it){var d=it.d;q(d[0].replace("___","________"));var o=d[1].map(function(x,j){return"abc"[j]+") "+x}).join("     ");if(P)P.p(o,6,10,[60,80,100]);html+='<p class="o">'+sxH(o)+'</p>';key.push(n+". "+"abc"[d[2]]+") "+sxFull(it))});
 sec("B. Tick the correct sentence");S.fx.forEach(function(it){var d=it.d;q("[  ] "+d[1][0]);var t="[  ] "+d[1][1];if(P)P.p(t,P.d.getTextWidth(n+". "));html+='<p class="o">'+sxH(t)+'</p>';key.push(n+". "+d[1][d[2]])});
 sec("C. Write the missing word");S.gp.forEach(function(it){q(it.d[0].replace("___","____________"));key.push(n+". "+it.d[1].join(" / "))});
 sec("D. Correct the mistake");S.fix.forEach(function(it){q(it.d[0]);if(P)P.lines(1);html+='<p class="ln"></p>';key.push(n+". "+it.d[1])});
 sec("E. Put the words in order");S.bd.forEach(function(it){q(ttScr(it.d[0]));if(P)P.lines(1);html+='<p class="ln"></p>';key.push(n+". "+it.d[0]+".")});
 sec("F. Write it down");if(P){P.p(c.pr);P.lines(6)}html+='<p>'+sxH(c.pr)+'</p><p class="ln"></p><p class="ln"></p><p class="ln"></p>';
 if(P){P.d.addPage();P.y=18;P.h("Answer key: "+c.t);key.forEach(function(x){P.p(x,0,10)});P.p("Model answer for F: "+c.md,0,10,[60,80,100])}
 html+='<div class="pb"></div><h2>Answer key</h2>'+key.map(function(x){return'<p>'+sxH(x)+'</p>'}).join("")+'<p><i>Model answer for F:</i> '+sxH(c.md)+'</p>';
 var r=await ttSave(P,"TenseTrail-"+c.t.replace(/[^A-Za-z0-9]+/g,"-").replace(/-+$/,"")+"-worksheet.pdf",html);if(st)st.textContent=r=="saved"?"PDF ready. Questions change each time you make one.":r=="declined"?"":"Use Save as PDF in the print window."}
/* ---- Area cheat sheet ---- */
async function ttCheat(){var P=ttDoc(SXN+": cheat sheet","Every lesson in one place: the rule, an example and a mistake to avoid."),html='<h1>'+sxH(SXN)+': cheat sheet</h1>',st=$("#ttcs");if(st)st.textContent="Making your PDF…";
 SX.forEach(function(c){if(P){P.need(26);P.h(c.t+"  ("+c.lv+")");P.p(c.rm,0,10);P.p("Example: "+sxC(c.ex[0]),4,9.5,[60,80,100]);P.p("Not: "+c.ms[0][0]+"   Say: "+c.ms[0][1],4,9.5,[60,80,100])}
  html+='<h2>'+sxH(c.t)+' ('+c.lv+')</h2><p>'+sxH(c.rm)+'</p><p class="o">Example: '+sxH(sxC(c.ex[0]))+'</p><p class="o">Not: '+sxH(c.ms[0][0])+' Say: '+sxH(c.ms[0][1])+'</p>'});
 var r=await ttSave(P,"TenseTrail-"+SXN.replace(/[^A-Za-z0-9]+/g,"-")+"-cheat-sheet.pdf",html);if(st)st.textContent=r=="saved"?"PDF ready.":r=="print"?"Use Save as PDF in the print window.":""}
/* ---- Area test and certificate ---- */
var TTT="tt_test_v1";
function ttTests(){try{return JSON.parse(localStorage.getItem(TTT))||{}}catch(e){return{}}}
function ttTestStart(){var per=SX.map(function(_,k){return sxShuf2(sxItemsFor(k).filter(function(x){return x.t=="mc"||x.t=="gp"||x.t=="fx"||x.t=="fix"}))}),items=[],r=0;
 while(items.length<20&&r<10){sxShuf2(per.map(function(_,i){return i})).forEach(function(i){if(items.length<20&&per[i][r])items.push(per[i][r])});r++}
 $("#tttest").scrollIntoView({behavior:rm?"auto":"smooth",block:"start"});sxRun(sxShuf2(items),"#tttest","t")}
function ttTestEnd(s){var el=$(s.sel),n=s.items.length,pc=Math.round(s.ok/n*100),T=ttTests(),miss={};s.res.forEach(function(r){if(!r.ok)miss[r.k]=(miss[r.k]||0)+1});
 var o=T[SXA]||{};o.best=Math.max(o.best||0,s.ok);o.n=n;if(pc>=80){o.pass=Date.now()}T[SXA]=o;try{localStorage.setItem(TTT,JSON.stringify(T))}catch(e){}ttLog();
 var h='<div class="sxend"><div class="sxscore"><b>'+s.ok+'</b> / '+n+'</div><p>'+(pc>=80?"🎉 You passed the "+sxH(SXN)+" test!":"Score 16 or more to earn your certificate. Revise the lessons below, then try again.")+'</p>';
 var mk=Object.keys(miss);if(mk.length)h+='<p class="sxsub">Lessons to revise:</p><div class="ttmiss">'+mk.map(function(k){return'<a class="ch" href="#/worksheets/grammar/'+SXA+'/'+k+'">'+sxH(SX[k].t)+' ('+miss[k]+')</a>'}).join("")+'</div>';
 if(pc>=80)h+='<div class="ttcert"><label>Name for the certificate <input id="ttnm" autocomplete="name" maxlength="60" placeholder="Your name"></label><button class="btn" onclick="ttCert('+s.ok+','+n+')">Download certificate (PDF)</button><span class="sxsub" id="ttcm"></span></div>';
 h+='<div class="sxbt"><button class="btn ghost" onclick="ttTestStart()">Take the test again</button></div></div>';el.innerHTML=h;if(pc>=80&&typeof boom=="function")boom()}
async function ttCert(sc,n){var nm0=($("#ttnm").value||"").trim();if(!nm0){$("#ttcm").textContent="Type your name first.";return}var P=ttDoc("","",1),dt=new Date().toLocaleDateString("en-AU",{day:"numeric",month:"long",year:"numeric"}),m=$("#ttcm");
 if(P){var d=P.d;d.setFillColor(255,246,223);d.rect(0,0,297,210,"F");d.setDrawColor(15,163,163);d.setLineWidth(1.6);d.rect(10,10,277,190);d.setLineWidth(.4);d.rect(14,14,269,182);d.setTextColor(0,127,126);d.setFont("helvetica","bold");d.setFontSize(18);d.text("TenseTrail",148.5,36,{align:"center"});
  d.setTextColor(22,50,79);d.setFontSize(30);d.text("Certificate of Achievement",148.5,62,{align:"center"});d.setFont("helvetica","normal");d.setFontSize(13);d.text("This certifies that",148.5,82,{align:"center"});d.setFont("helvetica","bold");d.setFontSize(26);d.text(ttAsc(nm0),148.5,100,{align:"center"});
  d.setFont("helvetica","normal");d.setFontSize(13);d.text("passed the Grammar Studio area test",148.5,116,{align:"center"});d.setFont("helvetica","bold");d.setFontSize(18);d.text(ttAsc(SXN),148.5,130,{align:"center"});d.setFont("helvetica","normal");d.setFontSize(12);d.text("Score: "+sc+" / "+n+"   ("+SX[0].lv+" to "+SX[SX.length-1].lv+")",148.5,144,{align:"center"});d.text(dt,148.5,170,{align:"center"});d.setFontSize(9);d.setTextColor(120,140,160);d.text("A record of practice on TenseTrail. Not an official qualification.",148.5,188,{align:"center"})}
 var r=await ttSave(P,"TenseTrail-certificate-"+SXA+".pdf",'<div class="cert"><p>TenseTrail</p><h1>Certificate of Achievement</h1><p>This certifies that</p><h2>'+sxH(nm0)+'</h2><p>passed the Grammar Studio area test</p><h2>'+sxH(SXN)+'</h2><p>Score: '+sc+' / '+n+'</p><p>'+dt+'</p></div>');m.textContent=r=="saved"?"Certificate ready.":r=="print"?"Use Save as PDF in the print window.":""}
/* ---- Presentation mode for teachers ---- */
var PRS=null;
function prSlides(k){var c=SX[k],L0=SXL[k],S=[];S.push({t:"title",h:'<p class="prk">'+sxH(SXN)+' · '+c.lv+'</p><h1>'+c.e+' '+sxH(c.t)+'</h1><p class="prs">'+sxH(L0.se)+'</p>'});
 S.push({h:'<p class="prk">Notice</p><h2>'+sxH(c.nq)+'</h2><ul class="prl">'+c.nt.map(function(t){return'<li>'+sxM(t)+'</li>'}).join("")+'</ul>'});
 c.ru.forEach(function(r,i){S.push({h:'<p class="prk">The rule · '+(i+1)+' of '+c.ru.length+'</p><h2>'+r[0]+'</h2><p class="prb">'+r[1]+'</p>'})});
 S.push({h:'<p class="prk">Remember</p><h2 class="prb">'+sxH(c.rm)+'</h2>'});
 c.ms.forEach(function(m,i){S.push({h:'<p class="prk">Common mistakes · '+(i+1)+' of '+c.ms.length+'</p><p class="prx"><span>✗</span> '+sxH(m[0])+'</p><div class="prrv" hidden><p class="prv"><span>✓</span> '+sxH(m[1])+'</p><p class="prs">'+sxH(m[2])+'</p></div>',rv:1})});
 S.push({h:'<p class="prk">Hear it in real life</p><h2>'+sxH(c.dl.ti)+'</h2><div class="prd">'+c.dl.ln.map(function(l){var s=c.dl.sp[l[0]];return'<p><b>'+s[0]+':</b> '+sxM(l[1])+'</p>'}).join("")+'</div>'});
 c.mc.forEach(function(m,i){var st=m[0].indexOf("___")>=0?sxH(m[0]).replace("___","<u>   </u>"):sxH(m[0]);S.push({h:'<p class="prk">Quick quiz · '+(i+1)+' of '+c.mc.length+'</p><h2>'+st+'</h2><ol class="pro" type="a">'+m[1].map(function(o,j){return'<li data-ok="'+(j==m[2]?1:0)+'">'+sxH(o)+'</li>'}).join("")+'</ol><p class="prs prrv" hidden>'+sxH(m[3])+'</p>',rv:1})});
 S.push({h:'<p class="prk">Your turn</p><h2>'+sxH(L0.oq)+'</h2><ul class="prl sm">'+L0.os.map(function(s){return'<li>'+sxH(s)+'</li>'}).join("")+'</ul>'});
 S.push({h:'<p class="prk">Write it down</p><h2 class="prb">'+sxH(c.pr)+'</h2><ul class="prl sm">'+c.ck.map(function(x){return'<li>'+sxH(x)+'</li>'}).join("")+'</ul>'});return S}
function prOpen(k){cvKill();PRS={k:k,i:0,s:prSlides(k),rv:0};var o=$("#prs");if(!o){o=document.createElement("div");o.id="prs";o.className="prs0";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label","Presentation");document.body.appendChild(o);
  o.addEventListener("touchstart",function(e){PRS&&(PRS.tx=e.touches[0].clientX)},{passive:true});o.addEventListener("touchend",function(e){if(!PRS||PRS.tx==null)return;var dx=e.changedTouches[0].clientX-PRS.tx;if(Math.abs(dx)>50)prGo(dx<0?1:-1);PRS.tx=null},{passive:true})}
 o.hidden=false;document.body.classList.add("srop");prDraw();try{if(o.requestFullscreen&&innerWidth>700)o.requestFullscreen().catch(function(){})}catch(e){}}
function prDraw(){var o=$("#prs"),s=PRS.s[PRS.i];o.innerHTML='<div class="prin" key="'+PRS.i+'">'+s.h+'</div><div class="prbar"><button onclick="prClose()" aria-label="Close presentation">✕ Close</button><span>'+(PRS.i+1)+' / '+PRS.s.length+'</span><span class="prsp"></span>'+(s.rv?'<button onclick="prReveal()">Reveal answer</button>':'')+'<button onclick="prGo(-1)" aria-label="Previous slide"'+(PRS.i?'':' disabled')+'>←</button><button onclick="prGo(1)" aria-label="Next slide"'+(PRS.i<PRS.s.length-1?'':' disabled')+'>→</button></div>';PRS.rv=0;var b=$(".prbar button:last-child",o);if(b)b.focus({preventScroll:true})}
function prReveal(){PRS.rv=1;$$("#prs .prrv").forEach(function(e){e.hidden=false});$$("#prs .pro li").forEach(function(e){e.classList.add(e.dataset.ok=="1"?"ok":"dim")})}
function prGo(d){if(!PRS)return;var s=PRS.s[PRS.i];if(d>0&&s.rv&&!PRS.rv){prReveal();return}var n=PRS.i+d;if(n<0||n>=PRS.s.length)return;PRS.i=n;prDraw()}
function prClose(){var o=$("#prs");if(o)o.hidden=true;document.body.classList.remove("srop");PRS=null;try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}}
document.addEventListener("keydown",function(e){if(!PRS)return;if(e.key=="ArrowRight"||e.key=="PageDown"||e.key==" "){e.preventDefault();prGo(1)}else if(e.key=="ArrowLeft"||e.key=="PageUp"){e.preventDefault();prGo(-1)}else if(e.key=="Escape")prClose()});
