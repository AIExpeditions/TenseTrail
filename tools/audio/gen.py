import json,os,sys,re,subprocess,numpy as np,time
from kokoro_onnx import Kokoro
k=Kokoro("kokoro-v1.0.onnx","voices.npz")
jobs=json.load(open(sys.argv[1]));os.makedirs("mp3",exist_ok=True);t0=time.time();n=0
def chunks(t):
    if len(t)<=320:return[t]
    s=re.split(r'(?<=[.!?])\s+',t);o=[];c=""
    for x in s:
        if c and len(c)+len(x)>300:o.append(c);c=x
        else:c=(c+" "+x).strip()
    if c:o.append(c)
    return o
for h,v,t in jobs:
    f=f"mp3/{h}.mp3"
    if os.path.exists(f):continue
    parts=[]
    for c in chunks(t.strip()):
        try:a,sr=k.create(c,voice=v,speed=1.0,lang=("en-us" if v[0]=="a" else "en-gb"))
        except Exception as e:print("ERR",h,e,flush=True);a=None;break
        parts.append(a);parts.append(np.zeros(int(sr*.22),dtype=np.float32))
    if a is None:continue
    a=np.concatenate(parts[:-1]).astype(np.float32)
    p=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-f","f32le","-ar",str(sr),"-ac","1","-i","-","-codec:a","libmp3lame","-b:a","40k","-ar","24000",f+".tmp.mp3"],input=a.tobytes())
    os.replace(f+".tmp.mp3",f);n+=1
    if n%50==0:print(n,round(time.time()-t0),flush=True)
print("done",n,round(time.time()-t0),flush=True)
