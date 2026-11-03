/* ---- Feedback tasks: every writing and speaking task the site can send for teacher feedback ----
 tools/build.py runs fbTaskList() at build time (through tools/tasks.mjs) and builds the list into
 worker/feedback-worker.js. The Worker then marks only these tasks and takes the topic, level and
 grammar rule from this list, not from the request. So if a task's wording changes, rebuild and
 paste the new Worker code into Cloudflare, or feedback for that task stops with "unknown_task".
 Keep this file plain ES5 that only reads lesson and skills data (no DOM, no other site globals). */
var LVTASK="Describe the place where you live and say what you like and dislike about it. Write or say 60 to 150 words.",LVTOPIC="General placement sample";
function skTaskS(S){return"Role-play. "+S.sit+" The partner said: "+S.task.turns.map(function(t){return t[0]}).join(" / ")+". The text below is only the learner's turns."}
function skTaskW(W){return W.task+" ("+W.ty+", "+W.min+"-"+W.max+" words)"}
function fbTaskList(){var out=[],A={sentences:SX,modals:MX,conditionals:CX,passive:PX,patterns:VX,nouns:NX,adj:AX,preps:RX,writing:WX};
 Object.keys(A).forEach(function(a){A[a].forEach(function(c){out.push({task:c.pr,topic:c.t,level:c.lv,rule:c.rm})})});
 out.push({task:LVTASK,topic:LVTOPIC,level:"",rule:""});
 SKT.forEach(function(T){out.push({task:T.r.resp[0],topic:T.r.ti,level:T.lv,rule:""});out.push({task:skTaskS(T.s),topic:T.s.ti,level:T.lv,rule:""});out.push({task:skTaskW(T.w),topic:T.w.ti,level:T.lv,rule:""})});
 return out}
