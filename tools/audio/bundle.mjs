import fs from "fs";
function apH(s){var a=0x811c9dc5,b=0x9e3779b9;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);a=Math.imul(a^c,16777619);b=Math.imul(b^c,2246822519)}return(a>>>0).toString(36)+"-"+(b>>>0).toString(36)}
const G=JSON.parse(fs.readFileSync("groups.json")),T=JSON.parse(fs.readFileSync("texts.json"));const keys=[...new Set([...Object.keys(G),...T])];
const out=process.argv[2];fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const by={};let miss=0;for(const k of keys){const id=apH(k),f="mp3/"+id+".mp3";if(!fs.existsSync(f)){miss++;continue}const g=(k[0]=="a"?"us":"uk")+"/"+(G[k]||"misc");(by[g]=by[g]||[]).push([id,f])}
const ix={f:[],g:{},i:{}},MAX=1.2e6;let tot=0;
for(const g of Object.keys(by).sort()){let part=0,bufs=[],size=0,fi=-1;const flush=()=>{if(!bufs.length)return;const name=g.replace("/","-")+"."+part+".mp3";fs.writeFileSync(out+"/"+name,Buffer.concat(bufs));tot+=size;bufs=[];size=0;part++};
 for(const [id,f] of by[g]){if(size>=MAX)flush();if(!bufs.length){ix.f.push(g.replace("/","-")+"."+part+".mp3");fi=ix.f.length-1;(ix.g[g]=ix.g[g]||[]).push(fi)}const b=fs.readFileSync(f);ix.i[id]=[fi,size,b.length];bufs.push(b);size+=b.length}flush()}
fs.writeFileSync(out+"/ix.json",JSON.stringify(ix));console.log("lines",Object.keys(ix.i).length,"missing",miss,"files",ix.f.length,"MB",(tot/1e6).toFixed(1),"ix KB",(fs.statSync(out+"/ix.json").size/1e3).toFixed(0));
