const SNAP_PULL=0.28, FRICTION_TAU_MS=550, V_STOP=0.0012, SNAP_MAX_MS=260, SETTLE_TAU_MS=140, V_MAX=0.03;
function detent(x){const b=Math.round(x),f=x-b;return b+f-(SNAP_PULL*Math.sin(2*Math.PI*f))/(2*Math.PI);}
// detent continuity + pull direction
console.log("detent samples:");
for(const x of [0,0.1,0.25,0.4,0.499,0.5,0.501,0.75,1.0,-0.25]) console.log("  x="+x.toFixed(3)+" -> "+detent(x).toFixed(4));
// simulate release
function sim(o0,v0){let o=detent(o0),v=Math.max(-V_MAX,Math.min(V_MAX,v0)),target=null,tau=SETTLE_TAU_MS,t=0;
 for(let i=0;i<4000;i++){const dt=16.7;t+=dt;
  if(target===null){o+=v*dt;v*=Math.exp(-dt/FRICTION_TAU_MS);
   if(Math.abs(v)<V_STOP){const sp=Math.abs(v);let tg=Math.round(o+v*FRICTION_TAU_MS);
    if(sp>V_STOP*0.5&&(tg-o)*v<0){tg=v>0?Math.ceil(o):Math.floor(o);}
    target=tg;tau=sp<1e-4?SETTLE_TAU_MS:Math.max(70,Math.min(SNAP_MAX_MS,Math.abs(tg-o)/sp));}}
  else{o+=(target-o)*(1-Math.exp(-dt/tau));if(Math.abs(target-o)<0.002){return{o:target,t:Math.round(t)};}}}
 return{o:o,t:-1};}
console.log("\nrelease sims (start, velocity) -> settled slot, ms:");
for(const [o,v] of [[0.4,0],[0.4,0.0005],[0.6,0],[0.2,0.0008],[0.0,0.02],[1.3,-0.015],[2.45,0.0003],[0.5,0]]){
 const r=sim(o,v);console.log("  o0="+o+" v="+v+" -> "+r.o+" ("+r.t+"ms) integer="+Number.isInteger(r.o));}
