/* ---- Teacher hub: lesson finder, attendance register, tools ----
   Routes: #/teachers (lesson finder), #/teachers/attendance, #/teachers/attendance/<class id>/<register|students|report|settings>,
   #/teachers/tools.
   The register is saved in this browser only (localStorage "tt_att_v1"). Every class, student and register has an id and an
   "upd" time, and deletions leave a tombstone in "del", so a backup file can be merged on another device, and a sync
   through the Worker can be added later without changing the layout. */
var THK="tt_att_v1",THFK="tt_thf_v1",THD=null,THST=["P","L","A","E"],THSN={P:"Present",L:"Late",A:"Absent",E:"Excused"},THDAY=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],THLV=["A1","A2","B1","B2","C1","Mixed"];
function thE(t){return String(t==null?"":t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function thId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function thNew(){return{v:1,cls:[],ses:[],del:{},warn:80,bk:0}}
function thLoad(){try{var o=JSON.parse(localStorage.getItem(THK));if(o&&o.v==1&&Array.isArray(o.cls)&&Array.isArray(o.ses)){o.del=o.del||{};o.warn=o.warn||80;return o}}catch(e){}return thNew()}
function thSave(o){try{localStorage.setItem(THK,JSON.stringify(o));return true}catch(e){thMsg("This browser would not save the register. It may be in private mode or full.");return false}}
function thMsg(t,id){var m=$("#"+(id||"thmsg"));if(m){m.textContent="";setTimeout(function(){m.textContent=t},30)}}
function thCls(o,id){return o.cls.filter(function(c){return c.id==id})[0]}
function thDate(d){return new Date(d+"T12:00:00").toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
function thShort(d){return new Date(d+"T12:00:00").toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"})}
function thWd(d){return(new Date(d+"T12:00:00").getDay()+6)%7}

function thTabs(on){return'<nav class="thtabs" aria-label="Teacher tools">'+[["lessons","📚 Lessons","#/teachers"],["attendance","🗓️ Attendance","#/teachers/attendance"],["tools","🧰 Tools and tips","#/teachers/tools"]].map(function(t){return'<a href="'+t[2]+'"'+(t[0]==on?' class="on" aria-current="page"':'')+'>'+t[1]+'</a>'}).join("")+'</nav>'}
PAGES.teachers=function(r){var a=r.a=="attendance"||r.a=="tools"?r.a:"lessons";
 return pg("🍎","Teachers","Find a lesson, teach it in class, and keep track of who came.",thTabs(a)+(a=="attendance"?thAtt(r):a=="tools"?thTools():thLessons()))};

/* ---------- Lesson finder ---------- */
function thAll(){var out=[];
 Object.keys(XA).forEach(function(a){XA[a].x.forEach(function(x,k){out.push({id:"g:"+a+":"+k,t:x.t,lv:x.lv,e:x.e||"✏️",kind:XA[a].n,h:"#/worksheets/grammar/"+a+"/"+k,a:a,k:k})})});
 for(var i=0;i<12;i++)out.push({id:"t:"+i,t:nm(i),lv:LV2[i],e:"✨",kind:"Tense Studio",h:"#/worksheets/grammar/studio/"+i,ts:1});
 SKT.forEach(function(T,i){["r","l","s","w"].forEach(function(k){if(T[k])out.push({id:"k:"+k+":"+i,t:T[k].ti,lv:T.lv,e:SKE[k],kind:SKN[k]+" · "+T.t,h:"#/worksheets/"+SKSL[k]+"/"+i,sk:k})})});
 return out}
function thF(){var f={lv:"",by:"unit",q:""};try{var o=JSON.parse(localStorage.getItem(THFK));if(o){f.lv=o.lv||"";f.by=o.by=="area"?"area":"unit"}}catch(e){}return f}
var THF=null;
function thLessons(){THF=THF||thF();var n=thAll().length;
 return'<div class="thf rv"><label class="thq"><span>Find a lesson</span><input id="thq" type="search" autocomplete="off" placeholder="e.g. present perfect, shopping" value="'+thE(THF.q)+'" oninput="THF.q=this.value;thFind()"></label>'
 +'<div class="thlvs" role="group" aria-label="Level">'+[""].concat(THLV.slice(0,5)).map(function(l){return'<button type="button" aria-pressed="'+(THF.lv==l)+'" onclick="thLv(\''+l+'\')">'+(l||"All levels")+'</button>'}).join("")+'</div>'
 +'<label class="thby"><span>Group by</span><select id="thby" onchange="THF.by=this.value;thFind(1)"><option value="unit"'+(THF.by=="unit"?" selected":"")+'>Guided path unit</option><option value="area"'+(THF.by=="area"?" selected":"")+'>Area or skill</option></select></label></div>'
 +(typeof tnPlanBox=="function"?tnPlanBox():'')+'<p class="thcount" id="thcount" aria-live="polite"></p><p class="sxsub" id="ttms" aria-live="polite"></p><p class="sxsub" id="ttcs" aria-live="polite"></p><div id="thres">'+thRes(n)+'</div>'}
function thLv(l){THF.lv=l;$$(".thlvs button").forEach(function(b){b.setAttribute("aria-pressed",String((b.textContent=="All levels"?"":b.textContent)==l))});thFind(1)}
function thFind(keep){if(!THF)return;try{localStorage.setItem(THFK,JSON.stringify({lv:THF.lv,by:THF.by}))}catch(e){}var b=$("#thres");if(b)b.innerHTML=thRes();if(keep)return}
function thGroups(all){var by={},G=[];all.forEach(function(x){by[x.id]=x});
 if(THF.by=="unit"){var used={};PTU.forEach(function(u,ui){var L=u[3].map(function(id){used[id]=1;return by[id]}).filter(Boolean);G.push({t:"Unit "+(ui+1)+": "+u[1],s:u[0]+" · "+u[2],L:L})});
  var rest=all.filter(function(x){return!used[x.id]});if(rest.length)G.push({t:"More lessons",s:"Lessons that are not in a guided path unit",L:rest});return G}
 Object.keys(XA).forEach(function(a){G.push({t:XA[a].n,s:"Grammar Studio",L:all.filter(function(x){return x.a==a}),a:a})});
 G.push({t:"Verb tenses",s:"Tense Studio",L:all.filter(function(x){return x.ts})});
 ["r","l","s","w"].forEach(function(k){G.push({t:SKN[k],s:"English Skills",L:all.filter(function(x){return x.sk==k})})});return G}
function thRes(){var all=thAll(),q=(THF.q||"").toLowerCase().trim(),lv=THF.lv,n=0;
 var ok=function(x){return(!lv||x.lv==lv)&&(!q||(x.t+" "+x.kind).toLowerCase().indexOf(q)>=0)};
 var h=thGroups(all).map(function(g){var L=g.L.filter(ok);n+=L.length;if(!L.length)return"";
  return'<section class="thg"><div class="thgh"><div><h2>'+thE(g.t)+'</h2><p>'+thE(g.s)+'</p></div>'+(g.a?'<button class="btn ghost sm" onclick="thCheat(\''+g.a+'\')" aria-label="Cheat sheet PDF: '+thE(g.t)+'">🖨️ Cheat sheet</button>':'')+'</div><ul class="thl">'+L.map(thRow).join("")+'</ul></section>'}).join("");
 var c=$("#thcount"),txt=n==all.length?"All "+n+" lessons.":n?"Showing "+n+" of "+all.length+" lessons.":"";if(c)c.textContent=txt;else setTimeout(function(){var c2=$("#thcount");if(c2)c2.textContent=txt},0);
 return h||'<p class="thempty">No lesson matches. Try fewer words or another level.</p>'}
function thRow(x){var g=x.a!=null;return'<li class="thr"><span class="e" aria-hidden="true">'+x.e+'</span><a class="tht" href="'+x.h+'"><b>'+thE(x.t)+'</b><small>'+thE(x.kind)+'</small></a><span class="lv" style="--lc:'+LC[x.lv]+'">'+x.lv+'</span>'
 +(g?'<span class="tha"><button class="btn ghost sm" onclick="thPresent(\''+x.a+'\','+x.k+')" aria-label="Present: '+thE(x.t)+'">📽️ Present</button><button class="btn ghost sm" onclick="thSheet(\''+x.a+'\','+x.k+')" aria-label="Worksheet PDF: '+thE(x.t)+'">🖨️ Worksheet</button><button class="btn ghost sm" onclick="tnPlanAdd(\''+x.a+'\','+x.k+',this)" aria-label="Add to lesson plan: '+thE(x.t)+'">➕ Plan</button></span>':'')+'</li>'}
function thPresent(a,k){sxUse(a);prOpen(k)}
function thSheet(a,k){sxUse(a);ttSheet(k)}
function thCheat(a){sxUse(a);ttCheat()}

/* ---------- Tools and tips ---------- */
function thTools(){return cards([["🖨️","Worksheets for every lesson","Every Grammar Studio lesson has a Worksheet PDF with an answer key, a mixed section with its look-alike, and a personal question. At B2 and C1 it gives less help. The questions change each time, so each class can get a fresh copy.","#ffd9a8"],["📽️","Presentation mode","Press Present for big-text slides: notice, rule, mistakes with a reveal, dialogue, quiz and a writing task. Use the arrow keys, a clicker or swipe.","#b9e6ff"],["📄","Cheat sheets and area tests","Each grammar area has a two-page cheat sheet and a 20-question test with a certificate at 16 out of 20.","#bff2de"],["🎯","Placement test","Send learners to Find Your Level. It gives a CEFR level and a starting lesson in about 20 questions.","#fff0a8"],["✍️","Writing and speaking feedback","Learners get quick checks on their device and rubric-based feedback from an AI teacher. Use it as a second opinion, not a final mark.","#ffc9c2"],["🗓️","Attendance","Keep a register for each class, see who is falling behind, and download it for Excel. It stays on this computer.","#d8ccff"]])
 +'<div class="thtips rv"><h2>Marking and results</h2><p>The marking sheet has the five CEFR criteria the AI teacher uses, with a description for each level. Use it to mark by hand on the same scale.</p><div class="sxbt"><button class="btn" onclick="tnMarking()">🖨️ Marking sheet PDF</button><span class="sxsub" id="tnms" aria-live="polite"></span></div><p style="margin-top:16px">Learners get a <b>code for your teacher</b> at the end of the placement test and each area test. Type one here to read it, or add it to a student in <a href="#/teachers/attendance">Attendance</a>.</p><div class="sxbt"><label class="thw thn"><span>Result code</span><input id="tccin" maxlength="12" autocomplete="off" placeholder="XXXX-XXXX" onkeydown="if(event.key==\'Enter\')tcCheck()"></label><button class="btn ghost" onclick="tcCheck()">Read the code</button></div><p class="thlead" id="tccout" role="status"></p></div>'
 +'<div class="thtips rv"><h2>Tips for class</h2><ul><li><b>Lower levels (A1 to A2):</b> give the rule first, use lots of examples, and start with the choose-the-answer questions before typing.</li><li><b>Higher levels (B2 to C1):</b> let learners try first. Start with the Notice step or the practice, then check the rule together.</li><li><b>Mix look-alikes in review:</b> after a few lessons, mix similar points (for example past simple and present perfect) so learners practise choosing.</li><li><b>Come back to it:</b> review a lesson about a day, a week and a month later. Short mixed reviews beat one long session.</li></ul><p class="sxsub">Lessons, answer keys and videos were written by Claude and checked by tests. Tell us if you find a mistake.</p></div>'}

/* ---------- Attendance ---------- */
function thAtt(r){var o=thLoad(),c=r.b?thCls(o,r.b):null;if(c)return thClass(o,c,["register","students","report","settings"].indexOf(r.c)>=0?r.c:"register");return thClasses(o,r.b)}
function thPct(o,c,from,to){var p=0,a=0;o.ses.forEach(function(s){if(s.c!=c.id||(from&&s.d<from)||(to&&s.d>to))return;Object.keys(s.m||{}).forEach(function(k){var v=s.m[k];if(v=="P"||v=="L")p++;else if(v=="A")a++})});return p+a?Math.round(p/(p+a)*100):null}
function thLast(o,c){var d="";o.ses.forEach(function(s){if(s.c==c.id&&s.d>d)d=s.d});return d}
function thDays(c){return(c.days||[]).map(function(i){return THDAY[i]}).join(", ")+(c.time?" · "+thE(c.time):"")}
function thClasses(o,miss){var old=o.cls.length&&(!o.bk||Date.now()-o.bk>7*864e5);
 var h='<div class="thnote rv"><b>🔒 Saved on this computer only.</b> Students’ names never leave this browser. Download a backup file every week, and use it to move the register to another computer.</div>'
 +(miss?'<p class="thwarn">That class is not on this computer. It may have been deleted, or saved in another browser.</p>':'')
 +(old?'<p class="thwarn">'+(o.bk?"Your last backup was "+Math.floor((Date.now()-o.bk)/864e5)+" days ago.":"You have not made a backup yet.")+' <button class="lnk" onclick="thBackup()">Download a backup now</button></p>':'');
 h+='<h2 class="thh">Your classes</h2>';
 if(!o.cls.length)h+='<p class="thempty">No classes yet. Add your first class below. It takes a minute.</p>';
 else h+='<div class="thcl">'+o.cls.map(function(c){var n=c.st.filter(function(s){return!s.left}).length,p=thPct(o,c),l=thLast(o,c);
  return'<article class="thcc"><h3><a href="#/teachers/attendance/'+thE(c.id)+'">'+thE(c.name)+'</a> <span class="lv" style="--lc:'+(LC[c.lv]||"var(--line)")+'">'+thE(c.lv||"")+'</span></h3><p>'+(thDays(c)||"No class days set")+'</p><p><b>'+n+'</b> student'+(n==1?"":"s")+' · attendance <b>'+(p==null?"not yet":p+"%")+'</b>'+(l?' · last register '+thShort(l):'')+'</p><div class="sxbt"><a class="btn sm" href="#/teachers/attendance/'+thE(c.id)+'/register">Take the register</a><a class="btn ghost sm" href="#/teachers/attendance/'+thE(c.id)+'/report">Report</a></div></article>'}).join("")+'</div>';
 h+='<details class="sxd thadd"'+(o.cls.length?'':' open')+'><summary>Add a class</summary><form class="thform" onsubmit="thAddClass(event)">'+thClassFields({})+'<label class="thw"><span>Students (optional, one name per line)</span><textarea id="thnst" rows="5" class="sxta" placeholder="Amira&#10;Carlos&#10;Hana"></textarea></label><div class="sxbt"><button class="btn" type="submit">Add the class</button></div></form></details>';
 h+='<details class="sxd thadd"><summary>Backup, restore and settings</summary><div class="thbk"><p>A backup file holds every class and register. Restoring adds what is in the file to this computer. Where the same class or register is in both, the newer one is kept.</p><div class="sxbt"><button class="btn ghost" onclick="thBackup()">⬇️ Download backup file</button><label class="btn ghost thfile">⬆️ Restore from a file<input type="file" accept=".json,application/json" onchange="thRestore(this)"></label></div>'
 +'<label class="thw"><span>Warn me when a student’s attendance is under</span><select onchange="thWarn(this.value)">'+[70,75,80,85,90].map(function(x){return'<option value="'+x+'"'+(x==o.warn?" selected":"")+'>'+x+'%</option>'}).join("")+'</select></label>'
 +(o.cls.length?'<div class="thdanger"><button class="lnk" onclick="thWipe(this)">Delete all attendance data on this computer</button></div>':'')+'</div></details><p class="sxsub" id="thmsg" role="status"></p>';
 return h}
function thClassFields(c){var d=c.days||[];return'<label class="thw"><span>Class name</span><input id="thcn" required maxlength="60" autocomplete="off" value="'+thE(c.name||"")+'" placeholder="e.g. Monday evening B1"></label>'
 +'<label class="thw thn"><span>Level</span><select id="thcl">'+THLV.map(function(l){return'<option'+(l==(c.lv||"B1")?" selected":"")+'>'+l+'</option>'}).join("")+'</select></label>'
 +'<label class="thw thn"><span>Start time</span><input id="thct" type="time" value="'+thE(c.time||"")+'"></label>'
 +'<fieldset class="thdays"><legend>Class days</legend>'+THDAY.map(function(n,i){return'<label><input type="checkbox" value="'+i+'"'+(d.indexOf(i)>=0?" checked":"")+'><span>'+n+'</span></label>'}).join("")+'</fieldset>'}
function thReadClass(){var n=($("#thcn").value||"").trim().slice(0,60);if(!n){thMsg("Give the class a name first.");$("#thcn").focus();return null}
 return{name:n,lv:$("#thcl").value,time:$("#thct").value||"",days:$$(".thdays input:checked").map(function(x){return+x.value})}}
function thNames(t){return String(t||"").split(/\r?\n/).map(function(s){return s.trim().slice(0,60)}).filter(Boolean)}
function thAddClass(e){e.preventDefault();var v=thReadClass();if(!v)return;var o=thLoad(),now=Date.now(),c={id:thId(),name:v.name,lv:v.lv,time:v.time,days:v.days,st:thNames($("#thnst").value).map(function(n){return{id:thId(),n:n,upd:now}}),upd:now};
 o.cls.push(c);if(thSave(o))location.hash="#/teachers/attendance/"+c.id+"/"+(c.st.length?"register":"students")}
function thWarn(v){var o=thLoad();o.warn=+v||80;thSave(o);thMsg("Saved.")}
function thWipe(b){if(b.dataset.sure!="1"){b.dataset.sure="1";b.textContent="Are you sure? This cannot be undone. Click again to delete everything.";return}try{localStorage.removeItem(THK)}catch(e){}render()}

/* One class: register, students, report, settings */
function thClass(o,c,tab){var base="#/teachers/attendance/"+thE(c.id);
 var h='<a class="back" href="#/teachers/attendance">← All classes</a><div class="thch"><h2>'+thE(c.name)+' <span class="lv" style="--lc:'+(LC[c.lv]||"var(--line)")+'">'+thE(c.lv||"")+'</span></h2><p>'+(thDays(c)||"")+'</p></div>'
 +'<nav class="thsub" aria-label="'+thE(c.name)+'">'+[["register","Register"],["students","Students"],["report","Report"],["settings","Class settings"]].map(function(t){return'<a href="'+base+'/'+t[0]+'"'+(t[0]==tab?' class="on" aria-current="page"':'')+'>'+t[1]+'</a>'}).join("")+'</nav>';
 h+='<div id="thbody" data-c="'+thE(c.id)+'">'+(tab=="students"?thStudents(o,c):tab=="report"?thReport(o,c):tab=="settings"?thSettings(c):thRegister(o,c))+'</div><p class="sxsub" id="thmsg" role="status"></p>';return h}
function thRedraw(tab){var b=$("#thbody");if(!b)return;var o=thLoad(),c=thCls(o,b.dataset.c);if(!c)return;b.innerHTML=tab=="students"?thStudents(o,c):tab=="report"?thReport(o,c):thRegister(o,c)}
function thCur(){var b=$("#thbody");var o=thLoad();return{o:o,c:b?thCls(o,b.dataset.c):null}}
function thSes(o,c,d,make){var s=o.ses.filter(function(x){return x.c==c.id&&x.d==d})[0];if(!s&&make){s={id:thId(),c:c.id,d:d,m:{},tg:[],note:"",upd:Date.now()};o.ses.push(s)}return s}

function thRegister(o,c){var d=THD||ttDay(),s=thSes(o,c,d),m=s?s.m:{};
 var L=c.st.filter(function(x){return!x.left||m[x.id]});
 var h='<div class="threg"><div class="thdate"><label class="thw"><span>Date</span><input type="date" id="thdt" value="'+d+'" max="'+ttDay()+'" onchange="thSetDate(this.value)"></label><p><b>'+thDate(d)+'</b>'+(c.days&&c.days.length&&c.days.indexOf(thWd(d))<0?'<br><small>Not one of this class’s usual days.</small>':'')+'</p></div>';
 if(!L.length)return h+'<p class="thempty">This class has no students yet. <a href="#/teachers/attendance/'+thE(c.id)+'/students">Add students</a> first.</p></div>';
 h+=(typeof tnDueBox=="function"?tnDueBox(o,c):'')+'<div class="sxbt"><button class="btn ghost sm" onclick="thAllP()">✓ Mark everyone present</button><span class="thsum" id="thsum" aria-live="polite">'+thSum(L,m)+'</span></div><div class="thst">'
 +L.map(function(st){return'<fieldset class="thsr"><legend>'+thE(st.n)+(st.left?' <small>(left)</small>':'')+'</legend><div class="thseg">'+THST.map(function(k){return'<label class="k'+k+'"><input type="radio" name="m'+thE(st.id)+'" value="'+k+'"'+(m[st.id]==k?" checked":"")+' onchange="thMark(\''+thE(st.id)+'\',\''+k+'\')"><span>'+THSN[k]+'</span></label>'}).join("")+'</div></fieldset>'}).join("")+'</div>';
 var all=thAll(),by={};all.forEach(function(x){by[x.id]=x});var tg=s?s.tg:[];
 h+='<div class="thtaught"><h3>What you taught</h3><p class="sxsub">Optional. It shows in the report, and about a day, a week and a month later this page offers a mixed review sheet of those lessons.</p><ul class="thtg">'+tg.map(function(id){var x=by[id];return x?'<li><a href="'+x.h+'">'+thE(x.t)+'</a> <span class="lv" style="--lc:'+LC[x.lv]+'">'+x.lv+'</span><button class="thx" onclick="thUntaught(\''+thE(id)+'\')" aria-label="Remove '+thE(x.t)+'">✕</button></li>':""}).join("")+'</ul>'
 +'<div class="sxbt"><select id="thtgs" aria-label="Lesson taught"><option value="">Choose a lesson…</option>'+thOpts(all,c)+'</select><button class="btn ghost sm" onclick="thTaught()">Add</button></div>'
 +'<label class="thw"><span>Notes for this class (optional)</span><textarea id="thnote" class="sxta" rows="2" maxlength="500" onchange="thNote(this.value)">'+thE(s?s.note:"")+'</textarea></label></div>';
 h+=thPast(o,c,d)+'</div>';return h}
function thOpts(all,c){var gr={};all.forEach(function(x){var k=x.a!=null?XA[x.a].n:x.ts?"Tense Studio":SKN[x.sk];(gr[k]=gr[k]||[]).push(x)});
 return Object.keys(gr).map(function(k){return'<optgroup label="'+thE(k)+'">'+gr[k].map(function(x){return'<option value="'+x.id+'">'+thE(x.t)+' ('+x.lv+')</option>'}).join("")+'</optgroup>'}).join("")}
function thSum(L,m){var n={P:0,L:0,A:0,E:0},u=0;L.forEach(function(st){var v=m[st.id];if(n[v]!=null)n[v]++;else u++});return n.P+" present, "+n.L+" late, "+n.A+" absent, "+n.E+" excused"+(u?", "+u+" not marked yet":"")}
function thPast(o,c,cur){var S=o.ses.filter(function(s){return s.c==c.id}).sort(function(a,b){return a.d<b.d?1:-1});if(!S.length)return"";
 return'<div class="thpast"><h3>Past registers</h3><ul>'+S.slice(0,30).map(function(s){var n={P:0,L:0,A:0,E:0};Object.keys(s.m).forEach(function(k){if(n[s.m[k]]!=null)n[s.m[k]]++});
  return'<li'+(s.d==cur?' class="on"':'')+'><button class="lnk" onclick="thSetDate(\''+s.d+'\')">'+thShort(s.d)+(s.d==cur?' (open)':'')+'</button><span>'+(n.P+n.L)+' came, '+n.A+' absent'+(n.E?', '+n.E+' excused':'')+(s.tg.length?' · '+s.tg.length+' lesson'+(s.tg.length>1?"s":""):'')+'</span><button class="thx" onclick="thDelSes(\''+thE(s.id)+'\',this)" aria-label="Delete the register for '+thShort(s.d)+'">✕</button></li>'}).join("")+'</ul></div>'}
function thSetDate(d){if(!/^\d{4}-\d{2}-\d{2}$/.test(d||""))return;THD=d;thRedraw("register");var f=$("#thdt");if(f)f.focus()}
function thMark(sid,k){var x=thCur();if(!x.c)return;var s=thSes(x.o,x.c,THD||ttDay(),1);s.m[sid]=k;s.upd=Date.now();if(thSave(x.o)){var L=x.c.st.filter(function(t){return!t.left||s.m[t.id]});var e=$("#thsum");if(e)e.textContent=thSum(L,s.m)}}
function thAllP(){var x=thCur();if(!x.c)return;var s=thSes(x.o,x.c,THD||ttDay(),1);x.c.st.forEach(function(t){if(!t.left&&!s.m[t.id])s.m[t.id]="P"});s.upd=Date.now();if(thSave(x.o)){thRedraw("register");thMsg("Everyone not yet marked is now present. Change anyone who is late or away.")}}
function thTaught(){var v=$("#thtgs").value;if(!v)return;var x=thCur();if(!x.c)return;var s=thSes(x.o,x.c,THD||ttDay(),1);if(s.tg.indexOf(v)<0)s.tg.push(v);s.upd=Date.now();if(thSave(x.o)){thRedraw("register");thMsg("Lesson added.");var f=$("#thtgs");if(f)f.focus()}}
function thUntaught(id){var x=thCur();if(!x.c)return;var s=thSes(x.o,x.c,THD||ttDay());if(!s)return;s.tg=s.tg.filter(function(t){return t!=id});s.upd=Date.now();if(thSave(x.o)){thRedraw("register");thMsg("Lesson removed.");var f=$("#thtgs");if(f)f.focus()}}
function thNote(v){var x=thCur();if(!x.c)return;var s=thSes(x.o,x.c,THD||ttDay(),1);s.note=String(v).slice(0,500);s.upd=Date.now();if(thSave(x.o))thMsg("Note saved.")}
function thDelSes(id,b){if(b.dataset.sure!="1"){b.dataset.sure="1";b.textContent="Delete?";b.classList.add("sure");thMsg("Click again to delete this register.");return}
 var x=thCur();x.o.ses=x.o.ses.filter(function(s){return s.id!=id});x.o.del[id]=Date.now();if(thSave(x.o)){thRedraw("register");thMsg("Register deleted.")}}

function thStudents(o,c){var h='<div class="thstu">';
 if(c.st.length)h+='<ul class="thsl">'+c.st.map(function(st){var i=thE(st.id);return'<li><label class="thw"><span>Name</span><input value="'+thE(st.n)+'" maxlength="60" onchange="thStu(\''+i+'\',\'n\',this.value)"></label><label class="thw"><span>Note (optional)</span><input value="'+thE(st.note||"")+'" maxlength="120" onchange="thStu(\''+i+'\',\'note\',this.value)"></label><label class="thck"><input type="checkbox"'+(st.left?" checked":"")+' onchange="thStu(\''+i+'\',\'left\',this.checked)"> Left the class</label><button class="thx" onclick="thDelStu(\''+i+'\',this)" aria-label="Remove '+thE(st.n)+'">✕</button><div class="tcst">'+(st.res||[]).map(function(cd){var r=tcRead(cd);return r?'<p>'+thE(tcText(r))+'</p>':''}).join("")+'<label class="thw thn"><span>Result code</span><input id="tc'+i+'" maxlength="12" autocomplete="off" placeholder="XXXX-XXXX" onkeydown="if(event.key==\'Enter\')tcAdd(\''+i+'\')"></label><button class="btn ghost sm" onclick="tcAdd(\''+i+'\')" aria-label="Add result code for '+thE(st.n)+'">Add</button></div></li>'}).join("")+'</ul><p class="sxsub">Students who have left keep their past marks but drop off the register. Removing a student also deletes their marks. Result codes come from the end of the placement test or an area test: ask learners to send you theirs.</p>';
 else h+='<p class="thempty">No students yet.</p>';
 return h+'<h3>Add students</h3><label class="thw"><span>One name per line. First names or initials are enough.</span><textarea id="thnst" class="sxta" rows="4"></textarea></label><div class="sxbt"><button class="btn" onclick="thAddStu()">Add</button></div></div>'}
function thAddStu(){var x=thCur();if(!x.c)return;var N=thNames($("#thnst").value),now=Date.now();if(!N.length){thMsg("Type at least one name.");return}
 N.forEach(function(n){x.c.st.push({id:thId(),n:n,upd:now})});x.c.upd=now;if(thSave(x.o)){thRedraw("students");thMsg("Added "+N.length+" student"+(N.length>1?"s":"")+".");var f=$("#thnst");if(f)f.focus()}}
function thStu(id,k,v){var x=thCur();if(!x.c)return;var st=x.c.st.filter(function(s){return s.id==id})[0];if(!st)return;if(k=="n"){v=String(v).trim().slice(0,60);if(!v){thMsg("A name can’t be empty.");return}}if(k=="note")v=String(v).slice(0,120);st[k]=k=="left"?!!v:v;st.upd=x.c.upd=Date.now();if(thSave(x.o))thMsg("Saved.")}
function thDelStu(id,b){if(b.dataset.sure!="1"){b.dataset.sure="1";b.textContent="Remove?";b.classList.add("sure");thMsg("Click again to remove this student and their marks. To keep their marks, tick Left the class instead.");return}
 var x=thCur();if(!x.c)return;x.c.st=x.c.st.filter(function(s){return s.id!=id});x.o.del[id]=Date.now();x.c.upd=Date.now();x.o.ses.forEach(function(s){if(s.c==x.c.id&&s.m[id]){delete s.m[id];s.upd=Date.now()}});if(thSave(x.o)){thRedraw("students");thMsg("Student removed.")}}

/* Report: a period, a row per student, flags, CSV and print */
var THR={p:"month"};
function thRange(p){var t=new Date(),d=function(x){return ttDay(x)};
 if(p=="month")return[d(new Date(t.getFullYear(),t.getMonth(),1)),d(t)];
 if(p=="last"){return[d(new Date(t.getFullYear(),t.getMonth()-1,1)),d(new Date(t.getFullYear(),t.getMonth(),0))]}
 if(p=="4w"||p=="10w"){var f=new Date(t);f.setDate(f.getDate()-(p=="4w"?27:69));return[d(f),d(t)]}
 if(p=="custom"&&THR.f&&THR.t)return[THR.f,THR.t];return["",""]}
function thStats(o,c,f,t){var S=o.ses.filter(function(s){return s.c==c.id&&(!f||s.d>=f)&&(!t||s.d<=t)}).sort(function(a,b){return a.d<b.d?-1:1});
 var rows=c.st.filter(function(st){return!st.left||S.some(function(s){return s.m[st.id]})}).map(function(st){var n={P:0,L:0,A:0,E:0},run=0,mx=0;S.forEach(function(s){var v=s.m[st.id];if(n[v]!=null)n[v]++;if(v=="A"){run++;mx=Math.max(mx,run)}else if(v)run=0});
  var den=n.P+n.L+n.A;return{st:st,n:n,pc:den?Math.round((n.P+n.L)/den*100):null,run:mx}});return{S:S,rows:rows}}
function thReport(o,c){var R=thRange(THR.p),X=thStats(o,c,R[0],R[1]),w=o.warn||80,tp=0,ta=0;X.rows.forEach(function(r){tp+=r.n.P+r.n.L;ta+=r.n.A});
 var h='<div class="threp"><div class="thrc"><label class="thw thn"><span>Period</span><select onchange="thPeriod(this.value)">'+[["month","This month"],["last","Last month"],["4w","Last 4 weeks"],["10w","Last 10 weeks"],["all","All time"],["custom","Choose dates"]].map(function(p){return'<option value="'+p[0]+'"'+(THR.p==p[0]?" selected":"")+'>'+p[1]+'</option>'}).join("")+'</select></label>'
 +(THR.p=="custom"?'<label class="thw thn"><span>From</span><input type="date" id="thrf" value="'+(THR.f||"")+'" onchange="THR.f=this.value;thRedraw(\'report\')"></label><label class="thw thn"><span>To</span><input type="date" id="thrt" value="'+(THR.t||"")+'" onchange="THR.t=this.value;thRedraw(\'report\')"></label>':'')+'</div>';
 if(!X.S.length)return h+'<p class="thempty">No registers in this period yet.</p></div>';
 h+='<p class="thlead"><b>'+X.S.length+'</b> class'+(X.S.length>1?"es":"")+' from '+thShort(X.S[0].d)+' to '+thShort(X.S[X.S.length-1].d)+'. Class attendance: <b>'+(tp+ta?Math.round(tp/(tp+ta)*100)+"%":"not yet")+'</b>.</p>'
 +'<div class="thtw" tabindex="0" role="region" aria-label="Attendance by student"><table class="thtbl"><caption class="vh">Attendance by student</caption><thead><tr><th scope="col">Student</th><th scope="col">Present</th><th scope="col">Late</th><th scope="col">Absent</th><th scope="col">Excused</th><th scope="col">Attendance</th><th scope="col">Level</th><th scope="col">Check</th></tr></thead><tbody>'
 +X.rows.map(function(r){var fl=[];if(r.pc!=null&&r.pc<w)fl.push("Under "+w+"%");if(r.run>=3)fl.push(r.run+" absences in a row");
  return'<tr'+(fl.length?' class="fl"':'')+'><th scope="row">'+thE(r.st.n)+(r.st.left?' <small>(left)</small>':'')+'</th><td>'+r.n.P+'</td><td>'+r.n.L+'</td><td>'+r.n.A+'</td><td>'+r.n.E+'</td><td><b>'+(r.pc==null?"–":r.pc+"%")+'</b></td><td>'+(function(){var t=tcLatest(r.st);return t?t.lvl:"–"})()+'</td><td>'+(fl.length?'⚠️ '+fl.join(", "):'✓ OK')+'</td></tr>'}).join("")+'</tbody></table></div>'
 +'<p class="sxsub">Late counts as attended. Excused absences are left out of the percentage.</p>'
 +'<div class="sxbt"><button class="btn" onclick="thCsv()">⬇️ Download for Excel (CSV)</button><button class="btn ghost" onclick="thPrint()">🖨️ Print the register</button></div>';
 var all=thAll(),by={},tg={};all.forEach(function(x){by[x.id]=x});X.S.forEach(function(s){s.tg.forEach(function(id){if(by[id])(tg[id]=tg[id]||[]).push(s.d)})});
 var ks=Object.keys(tg);if(ks.length)h+='<h3>Lessons taught</h3><ul class="thtg">'+ks.map(function(id){var x=by[id];return'<li><a href="'+x.h+'">'+thE(x.t)+'</a> <span class="lv" style="--lc:'+LC[x.lv]+'">'+x.lv+'</span> <small>'+tg[id].map(thShort).join(", ")+'</small></li>'}).join("")+'</ul>';
 return h+'</div>'}
function thPeriod(p){THR.p=p;if(p=="custom"&&!THR.f){var r=thRange("month");THR.f=r[0];THR.t=r[1]}thRedraw("report")}
function thGrid(){var x=thCur();if(!x.c)return null;var R=thRange(THR.p),X=thStats(x.o,x.c,R[0],R[1]);return{c:x.c,S:X.S,rows:X.rows}}
function thCell(v){v=String(v==null?"":v);if(/^[=+\-@\t\r]/.test(v))v="'"+v;return/[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}
function thCsv(){var G=thGrid();if(!G||!G.S.length)return;var L=[["Student"].concat(G.S.map(function(s){return s.d}),["Present","Late","Absent","Excused","Attendance %"])];
 G.rows.forEach(function(r){L.push([r.st.n].concat(G.S.map(function(s){return s.m[r.st.id]||""}),[r.n.P,r.n.L,r.n.A,r.n.E,r.pc==null?"":r.pc]))});
 L.push([]);L.push(["P = present, L = late, A = absent, E = excused. Late counts as attended; excused is left out of the %."]);
 thDownload("TenseTrail-attendance-"+G.c.name.replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"")+"-"+G.S[0].d+"-to-"+G.S[G.S.length-1].d+".csv","﻿"+L.map(function(r){return r.map(thCell).join(",")}).join("\r\n"),"text/csv")}
function thPrint(){var G=thGrid();if(!G||!G.S.length)return;
 var h='<h1>'+thE(G.c.name)+' · attendance register</h1><p>'+thE(G.c.lv||"")+' · '+thDate(G.S[0].d)+' to '+thDate(G.S[G.S.length-1].d)+'</p><table class="threg-p"><thead><tr><th>Student</th>'+G.S.map(function(s){return'<th>'+thShort(s.d)+'</th>'}).join("")+'<th>P</th><th>L</th><th>A</th><th>E</th><th>%</th></tr></thead><tbody>'
 +G.rows.map(function(r){return'<tr><th>'+thE(r.st.n)+'</th>'+G.S.map(function(s){return'<td>'+(s.m[r.st.id]||"")+'</td>'}).join("")+'<td>'+r.n.P+'</td><td>'+r.n.L+'</td><td>'+r.n.A+'</td><td>'+r.n.E+'</td><td>'+(r.pc==null?"":r.pc+"%")+'</td></tr>'}).join("")+'</tbody></table><p>P present · L late · A absent · E excused. Late counts as attended; excused is left out of the percentage.</p><p>Teacher signature: ______________________</p>';
 var st=document.createElement("style");st.id="thpg";st.textContent="@page{size:A4 landscape;margin:12mm}";document.head.appendChild(st);addEventListener("afterprint",function rmv(){var e=$("#thpg");if(e)e.remove();removeEventListener("afterprint",rmv)});ttPrint(h)}
function thSettings(c){return'<form class="thform" onsubmit="thSaveClass(event)">'+thClassFields(c)+'<div class="sxbt"><button class="btn" type="submit">Save changes</button></div></form><div class="thdanger"><h3>Delete this class</h3><p class="sxsub">This deletes the class, its students and all its registers on this computer.</p><button class="btn ghost" onclick="thDelClass(this)">Delete this class</button></div>'}
function thSaveClass(e){e.preventDefault();var v=thReadClass();if(!v)return;var x=thCur();if(!x.c)return;x.c.name=v.name;x.c.lv=v.lv;x.c.time=v.time;x.c.days=v.days;x.c.upd=Date.now();if(thSave(x.o)){render();setTimeout(function(){thMsg("Changes saved.")},50)}}
function thDelClass(b){if(b.dataset.sure!="1"){b.dataset.sure="1";b.textContent="Click again to delete the class and its registers";return}
 var x=thCur();if(!x.c)return;var now=Date.now();x.o.del[x.c.id]=now;x.o.ses=x.o.ses.filter(function(s){if(s.c==x.c.id){x.o.del[s.id]=now;return false}return true});x.o.cls=x.o.cls.filter(function(c){return c.id!=x.c.id});if(thSave(x.o))location.hash="#/teachers/attendance"}

/* Backup and restore */
async function thDownload(fn,text,type){var b=new Blob([text],{type:type+";charset=utf-8"}),dl=null;try{dl=window.claude&&await claude.use("downloads")}catch(e){}
 if(dl){try{await dl.save({filename:fn,data:b});thMsg("Downloaded "+fn+".");return true}catch(e){if(e&&e.code=="declined")return false}}
 try{var u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000);thMsg("Downloaded "+fn+".");return true}catch(e){thMsg("This browser would not download the file.");return false}}
async function thBackup(){var o=thLoad();if(await thDownload("TenseTrail-attendance-backup-"+ttDay()+".json",JSON.stringify({app:"TenseTrail attendance",v:1,saved:new Date().toISOString(),data:o},null,1),"application/json")){o.bk=Date.now();thSave(o);var w=$(".thwarn");if(w&&/backup/.test(w.textContent))w.remove()}}
/* Clean a restored file: keep only the fields the register uses, as plain strings and numbers. */
function thClean(d){var s=function(v,n){return String(v==null?"":v).slice(0,n)},num=function(v){v=+v;return isFinite(v)&&v>0?v:0},idok=function(v){return typeof v=="string"&&/^[a-z0-9]{4,24}$/.test(v)};
 if(!d||typeof d!="object"||!Array.isArray(d.cls)||!Array.isArray(d.ses))return null;
 var cls=d.cls.filter(function(c){return c&&idok(c.id)}).slice(0,200).map(function(c){return{id:c.id,name:s(c.name,60)||"Class",lv:THLV.indexOf(c.lv)>=0?c.lv:"Mixed",time:/^\d{2}:\d{2}$/.test(c.time||"")?c.time:"",days:(Array.isArray(c.days)?c.days:[]).filter(function(x){return x>=0&&x<=6&&x%1==0}),upd:num(c.upd),
  st:(Array.isArray(c.st)?c.st:[]).filter(function(t){return t&&idok(t.id)}).slice(0,300).map(function(t){return{id:t.id,n:s(t.n,60)||"Student",note:s(t.note,120),left:!!t.left,upd:num(t.upd),res:(Array.isArray(t.res)?t.res:[]).map(function(x){var r=tcRead(x);return r?r.code:null}).filter(Boolean).slice(-20)}})}});
 var ses=d.ses.filter(function(x){return x&&idok(x.id)&&idok(x.c)&&/^\d{4}-\d{2}-\d{2}$/.test(x.d||"")}).slice(0,20000).map(function(x){var m={};if(x.m&&typeof x.m=="object")Object.keys(x.m).forEach(function(k){if(idok(k)&&THST.indexOf(x.m[k])>=0)m[k]=x.m[k]});
  return{id:x.id,c:x.c,d:x.d,m:m,tg:(Array.isArray(x.tg)?x.tg:[]).filter(function(t){return typeof t=="string"&&/^[gtk]:[a-z0-9:]{1,30}$/.test(t)}).slice(0,30),note:s(x.note,500),upd:num(x.upd)}});
 var del={};if(d.del&&typeof d.del=="object")Object.keys(d.del).forEach(function(k){if(idok(k))del[k]=num(d.del[k])});
 return{v:1,cls:cls,ses:ses,del:del,warn:[70,75,80,85,90].indexOf(+d.warn)>=0?+d.warn:80,bk:0}}
function thMerge(a,b){var del={},k;for(k in a.del)del[k]=a.del[k];for(k in b.del)del[k]=Math.max(del[k]||0,b.del[k]);
 var pick=function(A,B){var m={};A.concat(B).forEach(function(x){if(!m[x.id]||x.upd>m[x.id].upd)m[x.id]=x});return Object.keys(m).map(function(i){return m[i]}).filter(function(x){return!(del[x.id]>=x.upd)})};
 var cls=pick(a.cls,b.cls);cls.forEach(function(c){c.st=c.st.filter(function(t){return!(del[t.id]>=t.upd)})});var ids={};cls.forEach(function(c){ids[c.id]=1});
 return{v:1,cls:cls,ses:pick(a.ses,b.ses).filter(function(s){return ids[s.c]}),del:del,warn:a.warn||b.warn||80,bk:a.bk}}
function thRestore(inp){var f=inp.files&&inp.files[0];if(!f)return;if(f.size>5e6){thMsg("That file is too big to be a TenseTrail backup.");return}
 var rd=new FileReader();rd.onload=function(){var j=null;try{j=JSON.parse(rd.result)}catch(e){}var d=j&&j.app=="TenseTrail attendance"?thClean(j.data):null;inp.value="";
  if(!d){thMsg("That file is not a TenseTrail attendance backup.");return}var o=thMerge(thLoad(),d);if(thSave(o)){render();setTimeout(function(){thMsg("Restored "+d.cls.length+" class"+(d.cls.length==1?"":"es")+" and "+d.ses.length+" register"+(d.ses.length==1?"":"s")+" from the file.")},60)}};rd.readAsText(f)}
