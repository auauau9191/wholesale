import json, math
PEN=[0.165,0.27,0.78,1]   # carbon-pen blue, the colour of every human mark
def tr(): return {"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0}}
def ks(p=(0,0),a=(0,0),s=None,r=None,o=None):
    return {"o":o or {"a":0,"k":100},"r":r or {"a":0,"k":0},"p":{"a":0,"k":[p[0],p[1],0]},"a":{"a":0,"k":[a[0],a[1],0]},"s":s or {"a":0,"k":[100,100,100]}}
def kf(frames):  # [(t, value)], eased like a pen: quick start, soft landing
    out=[]
    for i,(t,v) in enumerate(frames):
        k={"t":t,"s":v if isinstance(v,list) else [v]}
        if i<len(frames)-1: k.update({"i":{"x":[0.25],"y":[1]},"o":{"x":[0.45],"y":[0]}})
        out.append(k)
    return {"a":1,"k":out}
def stroke(w): return {"ty":"st","c":{"a":0,"k":PEN},"o":{"a":0,"k":100},"w":{"a":0,"k":w},"lc":2,"lj":2,"ml":4}
def path(pts,closed=False,ins=None,outs=None):
    n=len(pts); return {"ty":"sh","ks":{"a":0,"k":{"i":ins or [[0,0]]*n,"o":outs or [[0,0]]*n,"v":pts,"c":closed}}}
def trim(endk): return {"ty":"tm","s":{"a":0,"k":0},"e":endk,"o":{"a":0,"k":0},"m":1}
def layer(shapes,op,ks_=None,ind=1):
    return {"ddd":0,"ind":ind,"ty":4,"nm":"l%d"%ind,"sr":1,"ks":ks_ or ks(),"ao":0,"shapes":shapes,"ip":0,"op":op,"st":0,"bm":0}
def comp(nm,w,h,op,layers): return {"v":"5.7.4","fr":60,"ip":0,"op":op,"w":w,"h":h,"nm":nm,"ddd":0,"assets":[],"layers":layers}

# 1. Tick: a hand stroke, short leg then long leg. 24 frames (400 ms).
tick=comp("tick",40,40,40,[layer([{"ty":"gr","it":[path([[7,21],[15.5,29.5],[33,9.5]],ins=[[0,0],[-1.5,-1],[0,0]],outs=[[0,0],[2,-3],[0,0]]),trim(kf([(0,0),(24,100)])),stroke(3.4),tr()]}],40)])

# 2. Ring: an imperfect pen loop that overshoots its start, like circling a figure. 30 frames.
pts=[];ins=[];outs=[]
N=6; rx,ry=46,22; cx,cy=50,25
for i in range(N+1):
    a=-math.pi*0.62+ i*(2*math.pi*1.08)/N
    jitter=1+0.05*math.sin(i*2.1)
    x=cx+rx*jitter*math.cos(a); y=cy+ry*jitter*math.sin(a)
    k=4/3*math.tan((2*math.pi*1.08/N)/4)
    tx=-rx*math.sin(a)*k; ty=ry*math.cos(a)*k
    pts.append([round(x,2),round(y,2)]); ins.append([round(-tx,2),round(-ty,2)]); outs.append([round(tx,2),round(ty,2)])
ring=comp("ring",100,50,50,[layer([{"ty":"gr","it":[path(pts,ins=ins,outs=outs),trim(kf([(0,0),(30,100)])),stroke(2.6),tr()]}],50,ks_=ks(p=(50,25),a=(50,25),r={"a":0,"k":-4}))])

# 3. Stamp: double ring lands hard (scale 160 -> 94 -> 100), ink spreads (opacity), slight settle rotation. 36 frames.
def rect(w,h,r): return {"ty":"rc","p":{"a":0,"k":[0,0]},"s":{"a":0,"k":[w,h]},"r":{"a":0,"k":r}}
stamp_shapes=[{"ty":"gr","it":[rect(196,84,10),stroke(5),tr()]},{"ty":"gr","it":[rect(180,68,6),stroke(2),tr()]}]
sk={"a":1,"k":[{"t":0,"s":[165,165,100],"i":{"x":[0.2],"y":[1]},"o":{"x":[0.7],"y":[0]}},{"t":7,"s":[93,93,100],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.3],"y":[0]}},{"t":14,"s":[101,101,100],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.3],"y":[0]}},{"t":20,"s":[100,100,100]}]}
ok={"a":1,"k":[{"t":0,"s":[0],"i":{"x":[0.2],"y":[1]},"o":{"x":[0.5],"y":[0]}},{"t":6,"s":[100]},{"t":30,"s":[100],"i":{"x":[0.3],"y":[1]},"o":{"x":[0.3],"y":[0]}},{"t":36,"s":[88]}]}
rk={"a":1,"k":[{"t":0,"s":[-14],"i":{"x":[0.2],"y":[1]},"o":{"x":[0.6],"y":[0]}},{"t":10,"s":[-7]}]}
stamp=comp("stamp",220,110,40,[layer(stamp_shapes,40,ks_=ks(p=(110,55),s=sk,o=ok,r=rk))])

js="window.LOTTIE="+json.dumps({"tick":tick,"ring":ring,"stamp":stamp},separators=(",",":"))+";"
open("lotties.js","w").write(js); print(len(js))
