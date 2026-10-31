import {chromium} from "/opt/node22/lib/node_modules/playwright/index.mjs";
import fs from "fs";
const b=await chromium.launch();const p=await b.newPage();await p.route(/fonts\.g|cdnjs|jsdelivr/,r=>r.abort());await p.goto("http://localhost:8765/index.html#/");await p.waitForTimeout(600);
const keys=await p.evaluate(()=>{const S={};for(let ti=0;ti<12;ti++)for(let sc=0;sc<6;sc++)for(let lv=0;lv<3;lv++)for(let k=0;k<2;k++){const c=cvGen(ti,sc,lv,cvSd(ti,sc,lv,k));const two=c.A[1]==c.B[1];c.lines.forEach(l=>{S[nvVoice(l.g=="she"?"f":"m",two&&l.sp==1)+"|"+String(l.p).trim()]=1})}return Object.keys(S)});
const G=JSON.parse(fs.readFileSync("/tmp/claude-0/kgen/groups.json"));let n=0;for(const k of keys)if(!G[k]){G[k]="studio";n++}
fs.writeFileSync("/tmp/claude-0/kgen/groups.json",JSON.stringify(G));
function apH(s){var a=0x811c9dc5,b=0x9e3779b9;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(36)+"-"+(b>>>0).toString(36)}
const jobs=keys.map(k=>{const i=k.indexOf("|");return[apH(k),k.slice(0,i),k.slice(i+1)]}).filter(j=>!fs.existsSync("/tmp/claude-0/kgen/mp3/"+j[0]+".mp3"));
fs.writeFileSync("/tmp/claude-0/kgen/jobs_cv.json",JSON.stringify(jobs));console.log("cv keys",keys.length,"new to group",n,"jobs",jobs.length,"chars",jobs.reduce((a,j)=>a+j[2].length,0));await b.close();
