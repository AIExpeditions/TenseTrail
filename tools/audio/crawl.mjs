import {chromium} from "/opt/node22/lib/node_modules/playwright/index.mjs";
import fs from "fs";
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:900}});await p.route(/fonts\.g|cdnjs|jsdelivr/,r=>r.abort());
await p.addInitScript(()=>{localStorage.setItem("tt_acc2","uk");localStorage.setItem("tt_nv2","0");window.REC={};const st=window.setTimeout;window.setTimeout=(f,ms,...a)=>st(f,window.FAST?0:ms,...a);
 window.VREC=(t,o)=>{const v=nvVoice(o.g,o.alt);const k=v+"|"+t;if(!window.REC[k])window.REC[k]=window.GRP||"misc";if(o.onend)st(()=>{try{o.onend()}catch(e){}},0)}});
await p.goto("http://localhost:8765/index.html#/");await p.waitForTimeout(600);
const routes=await p.evaluate(()=>{const r=["#/","#/level","#/worksheets/grammar"];Object.keys(XA).forEach(id=>{r.push("#/worksheets/grammar/"+id);XA[id].x.forEach((x,k)=>r.push("#/worksheets/grammar/"+id+"/"+k))});for(let i=0;i<12;i++)r.push("#/worksheets/grammar/studio/"+i);items(GC[0]).forEach((x,k)=>r.push("#/worksheets/grammar/tenses/"+k));["reading","listening","speaking","writing"].forEach(s=>{for(let i=0;i<5;i++)r.push("#/worksheets/"+s+"/"+i)});return r});
const RX=/sxSay|sxEx\(|sxNt\(|sxDlTog|skSay|skPlay|skRA|\bsay\(|cvGlSay|vTry|lvPlay|sxAnim/;
for(const r of routes){await p.evaluate(h=>{cvKill();window.GRP=apGrp(h.replace(/^#\/?/,'').split('/'));location.hash=h},r);await p.waitForTimeout(250);
 await p.evaluate(async(rxs)=>{window.FAST=1;const RX=new RegExp(rxs);const clickAll=async()=>{for(const e of [...document.querySelectorAll('[onclick]')].filter(e=>RX.test(e.getAttribute('onclick')))){try{e.click()}catch(x){}await new Promise(r=>setTimeout(r,0));await new Promise(r=>requestAnimationFrame?setTimeout(r,5):r())}
   for(const e of document.querySelectorAll('[data-s]')){if(e.closest('.sxbar'))continue;try{say(e.dataset.s)}catch(x){}}};
  await clickAll();
  if(typeof SXR=="object")for(const id in SXR){const R=SXR[id];for(let i=0;i<R.ln.length;i++){try{sxDl(id,i,false)}catch(x){}}}
  if(document.querySelector('#gt')){for(const t of ["learn","game","practice","sheet"]){try{gtab(t)}catch(x){}await clickAll()}}
  window.FAST=0},RX.source);
 await p.waitForTimeout(150)}
// data-driven extras
await p.evaluate(()=>{window.FAST=1;window.GRP='level';const add=(t,g,alt)=>VREC(t,{g:g,alt:alt});
 LVI.forEach(it=>{if(it.au)it.au.forEach(l=>add(l[2],l[0]))});
 window.GRP='sk-s';SKT.forEach(T=>{const s=T.s;s.task.turns.forEach(t=>add(t[0],s.task.sp[1]=="she"?"f":"m"))});
 ["uk","us"].forEach(()=>{});window.GRP='misc';ACC.uk.hi.forEach((h,i)=>add(h,i?"m":"f"));
 Object.keys(XA).forEach(id=>{sxUse(id);window.GRP='g-'+id;SX.forEach((x,k)=>{for(let n=0;n<30;n++){let its=[];try{its=sxItemsFor(k)}catch(e){}its.forEach(it=>{add(sxC(sxFull(it)),"f");if(it.t=="dc"){add(sxC(it.d[0]),"f");add(sxC(it.d[0]),"m")}})}})})});
await p.waitForTimeout(500);
const R=await p.evaluate(()=>REC),rec=Object.keys(R);fs.writeFileSync("/tmp/claude-0/kgen/groups.json",JSON.stringify(R));
const ch=rec.reduce((a,k)=>a+k.length,0),byv={};rec.forEach(k=>{const v=k.split("|")[0];byv[v]=(byv[v]||0)+1});const gc={};Object.values(R).forEach(g=>gc[g]=(gc[g]||0)+1);console.log(gc);console.log("routes",routes.length,"lines",rec.length,"chars",ch,byv);await b.close();
