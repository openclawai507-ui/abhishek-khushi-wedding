'use strict';
// Royal invitation reel: story timeline, a code-drawn Garud, and a canvas palace of diyas. No libraries.
(() => {
 const frame=document.querySelector('.reel-frame');if(!frame)return;
 const root=document.documentElement,NS='http://www.w3.org/2000/svg';
 const scenes=[...frame.querySelectorAll('.reel-scene')],bars=frame.querySelector('.reel-progress');
 const back=frame.querySelector('.reel-canvas'),front=back.cloneNode();back.classList.add('back');front.classList.add('front');back.after(front);
 const bctx=back.getContext('2d'),fctx=front.getContext('2d');
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
 const reduced=()=>root.classList.contains('motion-off')||matchMedia('(prefers-reduced-motion: reduce)').matches;

 // Optional real artwork per scene: <div class="scene-bg" data-img="assets/scenes/x.jpg">.
 frame.querySelectorAll('.scene-bg[data-img]').forEach(bg=>{const im=new Image();im.onload=()=>{bg.style.backgroundImage=`url("${bg.dataset.img}")`;bg.classList.add('custom')};im.src=bg.dataset.img});

 /* ---------- Garud model (SVG built from individual feathers) ---------- */
 let uid=0;
 const el=(n,a={},p)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);p&&p.append(e);return e};
 function grad(defs,stops,dir='h'){const id='gg'+(uid++);const g=el('linearGradient',dir==='h'?{id,x1:0,y1:0,x2:1,y2:0}:{id,x1:0,y1:0,x2:0,y2:1},defs);stops.forEach((c,i)=>el('stop',{offset:i/(stops.length-1),'stop-color':c},g));return `url(#${id})`}
 function feather(g,x,y,len,w,ang,fill,rachis){
  const f=el('path',{d:`M0 ${-w}Q${len*.55} ${-w*1.25} ${len} 0Q${len*.55} ${w*1.25} 0 ${w}Z`,fill,stroke:'#2a1406','stroke-width':.6,'stroke-opacity':.55,transform:`translate(${x} ${y}) rotate(${ang})`},g);
  if(rachis)el('path',{d:`M2 0L${len*.92} 0`,stroke:rachis,'stroke-width':.7,opacity:.6,transform:`translate(${x} ${y}) rotate(${ang})`},g);return f}
 function wing(parent,defs,dark){
  const k=dark?.62:1,c=(h)=>dark?shade(h,k):h;
  const g=el('g',{class:'flap'},parent);
  const P=grad(defs,[c('#f6cf7a'),c('#a8682a'),c('#3b210e')]),S=grad(defs,[c('#f3c56e'),c('#b07030'),c('#5a3214')]),C=grad(defs,[c('#fde3a4'),c('#d89a48')]),C2=grad(defs,[c('#fff0c4'),c('#e9b864')]);
  const Sh=[0,0],E=[-58,-72],Wr=[-96,-122],T=[-186,-152];
  for(let i=0;i<11;i++){const t=i/10,x=lerp(Wr[0],T[0],t),y=lerp(Wr[1],T[1],t);feather(g,x,y,62+t*44,7.5,lerp(138,186,t),P,'#ffe7b0')}
  for(let i=0;i<10;i++){const t=i/9,a=t<.5?[lerp(Sh[0],E[0],t*2),lerp(Sh[1],E[1],t*2)]:[lerp(E[0],Wr[0],(t-.5)*2),lerp(E[1],Wr[1],(t-.5)*2)];feather(g,a[0],a[1],58+t*6,8,lerp(112,136,t),S,'#ffe7b0')}
  for(let i=0;i<12;i++){const t=i/11,x=lerp(Sh[0],Wr[0]-20,t),y=lerp(Sh[1],Wr[1]-14,t);feather(g,x,y,38,7,lerp(118,150,t),C)}
  for(let i=0;i<10;i++){const t=i/9,x=lerp(Sh[0]-4,Wr[0]-8,t),y=lerp(Sh[1]-4,Wr[1]-6,t);feather(g,x,y,22,6.5,lerp(122,150,t),C2)}
  el('path',{d:`M6 6Q${E[0]} ${E[1]-6} ${Wr[0]} ${Wr[1]-4}Q${T[0]+30} ${T[1]+4} ${T[0]+6} ${T[1]+6}`,fill:'none',stroke:c('#ffe9b8'),'stroke-width':4,'stroke-linecap':'round',opacity:.85},g);
  return g}
 function shade(hex,k){const n=parseInt(hex.slice(1),16);return '#'+[16,8,0].map(s=>Math.round(((n>>s)&255)*k).toString(16).padStart(2,'0')).join('')}
 function buildGarud(svg,withGarland){
  const defs=el('defs',{},svg);
  const glow=el('radialGradient',{id:'gl'+(uid++)},defs);el('stop',{offset:0,'stop-color':'#ffd88a','stop-opacity':.5},glow);el('stop',{offset:1,'stop-color':'#ffd88a','stop-opacity':0},glow);
  el('ellipse',{cx:-10,cy:-30,rx:190,ry:140,fill:`url(#${glow.id})`},svg);
  const farWrap=el('g',{transform:'translate(-14 -6) scale(.9)'},svg),far=wing(farWrap,defs,true);
  const Tl=grad(defs,['#c88a3e','#4a2a10']);
  for(let i=0;i<7;i++)feather(svg,-58,34,64,8,lerp(146,196,i/6),Tl,'#f6d79a');
  const B=grad(defs,['#f0c070','#b26d2a','#6a3814'],'v');
  el('path',{d:'M-70 30C-42 2 26-6 62 6C86 16 88 40 62 54C22 68-40 62-70 30Z',fill:B},svg);
  for(let r=0;r<4;r++)for(let i=0;i<7-r;i++){const x=-20+i*13+r*6,y=14+r*10;el('path',{d:`M${x-6} ${y}q6 7 12 0`,fill:'none',stroke:'#fff1cc','stroke-width':.9,opacity:.45},svg)}
  const leg=(x,y)=>{el('path',{d:`M${x} ${y}L${x+5} ${y+26}`,stroke:'#e9b53e','stroke-width':7,'stroke-linecap':'round'},svg);for(let t=-1;t<=1;t++)el('path',{d:`M${x+5} ${y+26}q${t*7} 4 ${t*9+2} 12`,stroke:'#2b1a0c','stroke-width':2.4,fill:'none','stroke-linecap':'round'},svg)};
  leg(18,50);leg(38,48);
  if(withGarland){const gg=el('g',{},svg);for(let i=0;i<16;i++){const a=i/15*Math.PI,x=30+Math.cos(a)*22,y=82+Math.sin(a)*30;el('circle',{cx:x,cy:y,r:6.2,fill:i%3?'#d3123a':'#ff5d7a'},gg);el('circle',{cx:x-1.5,cy:y-1.5,r:2.4,fill:'#ff9fb0',opacity:.7},gg)}for(let i=0;i<5;i++)el('ellipse',{cx:14+i*8,cy:86,rx:7,ry:3,fill:'#2f6b2a',transform:`rotate(${i*25-50} ${14+i*8} 86)`},gg);el('circle',{cx:30,cy:116,r:8,fill:'#b30d2c'},gg)}
  const H=grad(defs,['#fff6dc','#f0d496','#c99a4e'],'v');
  el('path',{d:'M50 18C58-4 72-24 92-28C112-31 122-14 116 2C110 16 90 22 70 30Z',fill:H},svg);
  for(let i=0;i<6;i++)el('path',{d:`M${62+i*8} ${10-i*4}q5 6 10 1`,fill:'none',stroke:'#b88a46','stroke-width':.8,opacity:.6},svg);
  el('path',{d:'M108-16C128-20 138-6 130 10C127 3 121 1 113 3Z',fill:'#f4c22c',stroke:'#7a5208','stroke-width':.8},svg);
  el('path',{d:'M126 2Q131 8 129 12',stroke:'#3a2606','stroke-width':1.6,fill:'none'},svg);
  el('path',{d:'M90-20Q100-27 110-20',stroke:'#3a2008','stroke-width':3,fill:'none','stroke-linecap':'round'},svg);
  el('circle',{cx:100,cy:-15,r:4.6,fill:'#f2a51e'},svg);el('circle',{cx:101,cy:-15,r:2.3,fill:'#120a04'},svg);el('circle',{cx:99.4,cy:-16.5,r:1,fill:'#fff'},svg);
  el('path',{d:'M76-30L80-50L86-38L92-58L98-38L104-50L106-28Z',fill:'#ffd66e',stroke:'#fff3c8','stroke-width':1,style:'filter:drop-shadow(0 0 4px #ffcf6a)'},svg);
  el('circle',{cx:92,cy:-38,r:3,fill:'#d4202f'},svg);el('circle',{cx:92,cy:-60,r:2.2,fill:'#fff1c0'},svg);
  el('path',{d:'M58 22Q72 34 92 22',stroke:'#ffd66e','stroke-width':2.4,fill:'none'},svg);
  const nearWrap=el('g',{transform:'translate(4 2)'},svg),near=wing(nearWrap,defs,false);
  return [far,near]}
 const heroWings=buildGarud(frame.querySelector('.garud-hero'),true),farWings=buildGarud(frame.querySelector('.garud-far'),false);

 /* ---------- Canvas helpers ---------- */
 let W=0,H=0,dpr=1;
 function size(){const r=frame.getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(devicePixelRatio||1,2);for(const c of [back,front]){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr)}bctx.setTransform(dpr,0,0,dpr,0,0);fctx.setTransform(dpr,0,0,dpr,0,0)}
 const sprite=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,236,190,1)');g.addColorStop(.18,'rgba(255,190,90,.85)');g.addColorStop(.5,'rgba(255,140,40,.25)');g.addColorStop(1,'rgba(255,120,30,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return c})();
 const rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(7);
 const stars=Array.from({length:110},()=>({x:rnd(),y:rnd(),r:.3+rnd()*1.1,p:rnd()*6}));
 function sky(ctx,horizon,t){const g=ctx.createLinearGradient(0,0,0,horizon);g.addColorStop(0,'#04061a');g.addColorStop(.7,'#141433');g.addColorStop(1,'#3a2238');ctx.fillStyle=g;ctx.fillRect(0,0,W,horizon+2);for(const s of stars){if(s.y*horizon>horizon-6)continue;ctx.globalAlpha=.35+.45*Math.sin(t*1.3+s.p)**2;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s.x*W,s.y*horizon,s.r,0,7);ctx.fill()}ctx.globalAlpha=1}

 /* ---------- Aerial palace of diyas ---------- */
 const diyas=[],people=[],pools=[[-60,-16,34,76],[16,60,34,76],[-60,-16,112,170],[16,60,112,170]];
 (()=>{const add=(x,z)=>diyas.push({x,z,y:.3,p:rnd()*7});
  for(let z=22;z<=196;z+=3){add(-70,z);add(70,z)}
  for(let x=-70;x<=70;x+=3)add(x,196);
  for(let z=22;z<=86;z+=2.6){add(-6,z);add(6,z)}for(let z=114;z<=194;z+=2.6){add(-6,z);add(6,z)}
  for(const [x0,x1,z0,z1] of pools){for(let x=x0;x<=x1;x+=3.2){add(x,z0);add(x,z1)}for(let z=z0;z<=z1;z+=3.2){add(x0,z);add(x1,z)}for(let i=0;i<18;i++)diyas.push({x:lerp(x0+3,x1-3,rnd()),z:lerp(z0+3,z1-3,rnd()),y:.1,p:rnd()*7,lotus:1})}
  for(let x=-18;x<=18;x+=3){add(x,82);add(x,118)}for(let z=82;z<=118;z+=3){add(-18,z);add(18,z)}
  for(let i=0;i<130;i++){const a=rnd()*Math.PI*2,r=20+rnd()*9;people.push({x:Math.cos(a)*r,z:100+Math.sin(a)*r,c:['#c8142f','#f08a1c','#e2457a','#f5d06a','#8a2be2'][i%5]})}
 })();
 const lanterns=Array.from({length:16},()=>({x:rnd(),y:rnd(),s:.6+rnd(),v:.02+rnd()*.03,p:rnd()*6}));
 function palace(ctx,p,t){
  const e=ease(clamp(p)),camH=lerp(120,46,e),camZ=lerp(-70,-6,e),f=W*1.05,hy=H*lerp(.25,.16,e),cx=W/2;
  const P=(x,y,z)=>{const d=z-camZ;if(d<1)return null;const s=f/d;return [cx+x*s,hy+(camH-y)*s,s]};
  sky(ctx,hy,t);
  const glow=ctx.createRadialGradient(cx,hy,0,cx,hy,W*.9);glow.addColorStop(0,'rgba(255,150,60,.35)');glow.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
  const quad=(pts,fill)=>{const q=pts.map(a=>P(...a));if(q.some(v=>!v))return;ctx.beginPath();q.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill()};
  const lit=(x,y,s,a=1)=>{const r=Math.max(2.2,s*3.4);ctx.globalAlpha=a*.7;ctx.drawImage(sprite,x-r,y-r,r*2,r*2);ctx.globalAlpha=1};
  // Far facade with arches, domes and chhatris.
  quad([[-90,0,200],[90,0,200],[90,36,200],[-90,36,200]],'#2c160f');
  ctx.globalCompositeOperation='lighter';
  for(let r=0;r<4;r++)for(let x=-86;x<=86;x+=4.3){const a=P(x,4+r*8,200);if(!a)continue;const s=a[2];ctx.fillStyle='#ffb04a';ctx.globalAlpha=.85;ctx.fillRect(a[0]-1.1*s,a[1]-4.5*s,2.2*s,4.5*s);ctx.globalAlpha=1;if((x+r)%3<1.5)lit(a[0],a[1]-2*s,s*.9,.5)}
  ctx.globalCompositeOperation='source-over';
  for(const [x,r] of [[0,15],[-34,6],[34,6],[-64,5],[64,5],[-82,4],[82,4]]){const a=P(x,36,200);if(!a)continue;const s=a[2];ctx.fillStyle='#3a1d12';ctx.beginPath();ctx.ellipse(a[0],a[1],r*s,r*1.05*s,0,Math.PI,0);ctx.fill();ctx.strokeStyle='#ffc56a';ctx.lineWidth=Math.max(.6,s*.3);ctx.stroke();ctx.fillStyle='#ffd07a';ctx.fillRect(a[0]-.4*s,a[1]-r*1.05*s-4*s,.8*s,4*s)}
  // Side galleries.
  for(const sx of [-1,1]){quad([[sx*72,0,24],[sx*72,0,200],[sx*72,18,200],[sx*72,18,24]],'#2a140d');
   ctx.globalCompositeOperation='lighter';for(let z=26;z<=198;z+=4.5)for(const y of [4,11]){const a=P(sx*72,y,z);if(!a)continue;const s=a[2];ctx.fillStyle='#ffae48';ctx.globalAlpha=.85;ctx.fillRect(a[0]-.9*s,a[1]-4*s,1.8*s,4*s);ctx.globalAlpha=1}for(let z=24;z<=200;z+=3){const a=P(sx*72,18,z);a&&lit(a[0],a[1],a[2]*.8,.8)}ctx.globalCompositeOperation='source-over'}
  // Courtyard floor, paths and pools.
  quad([[-72,0,20],[72,0,20],[72,0,200],[-72,0,200]],'#3a2116');
  quad([[-8,0,20],[8,0,20],[8,0,200],[-8,0,200]],'#5b3a24');
  for(const [x0,x1,z0,z1] of pools)quad([[x0,0,z0],[x1,0,z0],[x1,0,z1],[x0,0,z1]],'#0e2428');
  for(const sx of [-1,1])for(let z=22;z<=196;z+=2.2){const a=P(sx*10,.4,z);if(!a)continue;ctx.fillStyle=(z|0)%2?'#c3102c':'#e8541e';ctx.beginPath();ctx.arc(a[0],a[1],Math.max(.5,a[2]*.9),0,7);ctx.fill()}
  // Diyas far to near, with the mandap drawn at its depth.
  const sorted=diyas.slice().sort((a,b)=>b.z-a.z);let mandapDone=false;
  ctx.globalCompositeOperation='lighter';
  for(const d of sorted){
   if(!mandapDone&&d.z<114){ctx.globalCompositeOperation='source-over';mandap(P,ctx,t);mandapDone=true;ctx.globalCompositeOperation='lighter'}
   const a=P(d.x,d.y,d.z);if(!a)continue;const fl=.82+.18*Math.sin(t*8+d.p);
   if(d.lotus){ctx.globalAlpha=.8;ctx.fillStyle='#ff8fb1';ctx.beginPath();ctx.arc(a[0],a[1],Math.max(.6,a[2]*.5),0,7);ctx.fill();ctx.globalAlpha=1}
   lit(a[0],a[1],a[2]*fl,fl);ctx.fillStyle='#fff3c8';ctx.beginPath();ctx.arc(a[0],a[1],Math.max(.45,a[2]*.28),0,7);ctx.fill()}
  ctx.globalCompositeOperation='source-over';if(!mandapDone)mandap(P,ctx,t);
  // Sky lanterns drifting up.
  ctx.globalCompositeOperation='lighter';
  for(const l of lanterns){const y=((l.y-t*l.v)%1+1)%1,x=l.x*W+Math.sin(t*.6+l.p)*10,yy=hy+ (y-.15)*H*.9,s=l.s*(W/380);if(yy>H*.85)continue;ctx.globalAlpha=.9;ctx.drawImage(sprite,x-9*s,yy-11*s,18*s,22*s);ctx.fillStyle='#ffdca0';ctx.fillRect(x-2*s,yy-3*s,4*s,6*s)}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  const v=ctx.createRadialGradient(cx,H*.55,H*.25,cx,H*.55,H*.8);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(6,2,10,.6)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
 }
 function mandap(P,ctx,t){
  const z0=86,z1=114,poly=(pts,fill,stroke)=>{const q=pts.map(a=>P(...a));if(q.some(v=>!v))return;ctx.beginPath();q.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}};
  for(const pp of people){const a=P(pp.x,.8,pp.z);if(!a)continue;ctx.fillStyle=pp.c;ctx.beginPath();ctx.arc(a[0],a[1],Math.max(.7,a[2]*.75),0,7);ctx.fill()}
  poly([[-15,3,z0],[15,3,z0],[15,3,z1],[-15,3,z1]],'#7a4524');poly([[-15,0,z0],[15,0,z0],[15,3,z0],[-15,3,z0]],'#4a2615');
  const c=P(0,9,100);if(c){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.9;const r=c[2]*22;ctx.drawImage(sprite,c[0]-r,c[1]-r,r*2,r*2);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
  ctx.strokeStyle='#ffcf70';for(const x of [-13,-4.5,4.5,13])for(const z of [z0+1,z1-1]){const a=P(x,3,z),b=P(x,17,z);if(!a||!b)continue;ctx.lineWidth=Math.max(.8,a[2]*.9);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
  ctx.setLineDash([1.5,2]);ctx.strokeStyle='#ff9a1e';for(const z of [z0+1]){const a=P(-13,15,z),m=P(0,11,z),b=P(13,15,z);if(a&&b&&m){ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.quadraticCurveTo(m[0],m[1],b[0],b[1]);ctx.stroke()}}ctx.setLineDash([]);
  const roof=(y0,y1,r0,r1,col)=>{const T=[[-r0,y0,100-r0],[r0,y0,100-r0],[r0,y0,100+r0],[-r0,y0,100+r0]],U=[[-r1,y1,100-r1],[r1,y1,100-r1],[r1,y1,100+r1],[-r1,y1,100+r1]];
   poly([T[3],T[2],U[2],U[3]],shade(col,.7));poly([T[1],T[2],U[2],U[1]],shade(col,.85),'#e8a85a');poly([T[3],T[0],U[0],U[3]],shade(col,.85),'#e8a85a');poly([T[0],T[1],U[1],U[0]],col,'#ffc66a');
   ctx.globalCompositeOperation='lighter';for(let i=0;i<=8;i++){const a=P(lerp(-r0,r0,i/8),y0,100-r0);if(a){const r=Math.max(2,a[2]*2.6);ctx.globalAlpha=.8;ctx.drawImage(sprite,a[0]-r,a[1]-r,r*2,r*2)}}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'};
  roof(17,24,19,11,'#6a2a1c');roof(24,36,12,.5,'#7a3020');
  const k=P(0,38.5,100);if(k){ctx.fillStyle='#ffd677';ctx.beginPath();ctx.arc(k[0],k[1],Math.max(1,k[2]*1.2),0,7);ctx.fill()}
 }

 /* ---------- Petals and sparkles ---------- */
 const petals=[];
 function petal(x,y,vx,vy){petals.push({x,y,vx,vy,r:rnd()*6,vr:(rnd()-.5)*4,s:3+rnd()*4,c:rnd()<.7?'#d0102f':'#ff6f8c',life:0})}
 function drawPetals(ctx,dt){for(let i=petals.length-1;i>=0;i--){const p=petals[i];p.life+=dt;p.vy+=dt*22;p.vx+=Math.sin(p.life*3+p.r)*dt*14;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;if(p.y>H+20){petals.splice(i,1);continue}
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.scale(1,.55+.45*Math.sin(p.life*5+p.r));ctx.fillStyle=p.c;ctx.beginPath();ctx.ellipse(0,0,p.s,p.s*.62,0,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.ellipse(-p.s*.3,-p.s*.15,p.s*.35,p.s*.2,0,0,7);ctx.fill();ctx.restore()}}
 const dust=Array.from({length:40},()=>({x:rnd(),y:rnd(),v:.02+rnd()*.05,p:rnd()*6,s:.6+rnd()*1.6}));
 function drawDust(ctx,t){ctx.globalCompositeOperation='lighter';for(const d of dust){const y=((d.y-t*d.v)%1+1)%1;ctx.globalAlpha=.25+.45*Math.sin(t*2+d.p)**2;ctx.fillStyle='#ffd98a';ctx.beginPath();ctx.arc(d.x*W+Math.sin(t+d.p)*8,y*H,d.s,0,7);ctx.fill()}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}

 /* ---------- Timeline ---------- */
 let idx=0,elapsed=0,playing=false,inView=false,held=false,manualPause=false,last=0,raf=0,t=0;
 bars.innerHTML=scenes.map(()=>'<span><i></i></span>').join('');const barEls=[...bars.children];
 const dur=i=>+scenes[i].dataset.duration||3000;
 function show(i){
  idx=(i+scenes.length)%scenes.length;elapsed=0;petals.length=0;
  scenes.forEach((s,j)=>{s.classList.toggle('active',j===idx);s.style.setProperty('--dur',dur(j)+'ms');s.setAttribute('aria-hidden',j===idx?'false':'true')});
  const s=scenes[idx];s.classList.remove('active');void s.offsetWidth;s.classList.add('active');
  barEls.forEach((b,j)=>{b.className=j<idx?'done':'';b.style.setProperty('--dur',dur(j)+'ms')});
  const b=barEls[idx];void b.offsetWidth;b.className='active';
  if(s.dataset.fx==='petals')for(let k=0;k<26;k++)petal(rnd()*W,-rnd()*H*.8,(rnd()-.5)*20,30+rnd()*40);
  render(0);
 }
 function render(dt){
  const fx=scenes[idx].dataset.fx,p=elapsed/dur(idx),calm=reduced();
  bctx.clearRect(0,0,W,H);fctx.clearRect(0,0,W,H);
  if(fx==='garud'){sky(bctx,H,t);const g=bctx.createRadialGradient(W*.5,H*1.05,0,W*.5,H*1.05,H*.7);g.addColorStop(0,'rgba(255,140,50,.45)');g.addColorStop(1,'rgba(255,120,40,0)');bctx.fillStyle=g;bctx.fillRect(0,0,W,H);
   bctx.globalCompositeOperation='lighter';for(let i=0;i<26;i++){const x=(i*.137%1)*W,y=H*(.86+.1*((i*.29)%1)),r=6+(i%5)*4;bctx.globalAlpha=.25;bctx.drawImage(sprite,x-r,y-r,r*2,r*2)}bctx.globalAlpha=1;bctx.globalCompositeOperation='source-over';
   if(!calm&&dt&&rnd()<.75){const svg=scenes[idx].querySelector('.garud-hero').getBoundingClientRect(),fr=frame.getBoundingClientRect();petal(svg.left-fr.left+svg.width*.55,svg.top-fr.top+svg.height*.86,(rnd()-.6)*40,20+rnd()*30)}}
  else if(fx==='palace')palace(bctx,calm?.55:p,t);
  if(!calm){if(fx==='sparkle'||fx==='palace')drawDust(fctx,t);if(fx==='petals'&&dt&&rnd()<.35)petal(rnd()*W,-10,(rnd()-.5)*20,30+rnd()*30);drawPetals(fctx,dt)}
  const flap=calm?.3:Math.sin(t*9);const set=(ws,amp)=>ws.forEach((w,i)=>w.setAttribute('transform',`rotate(${(flap*amp+(i?4:-2)).toFixed(2)})`));
  if(fx==='garud')set(heroWings,22);if(fx==='palace')set(farWings,28);
 }
 function loop(now){raf=0;const dt=Math.min(.05,(now-(last||now))/1000);last=now;
  if(playing&&!held&&!manualPause){elapsed+=dt*1000;t+=dt;if(elapsed>=dur(idx)){show(idx+1)}else render(dt)}
  if(playing)raf=requestAnimationFrame(loop)}
 function update(){const run=inView&&!document.hidden&&!reduced();frame.classList.toggle('paused',!run||held||manualPause);if(run&&!playing){playing=true;last=0;raf=raf||requestAnimationFrame(loop)}if(!run&&playing){playing=false;cancelAnimationFrame(raf);raf=0}}
 new IntersectionObserver(es=>{inView=es[0].isIntersecting;update()},{threshold:.35}).observe(frame);
 document.addEventListener('visibilitychange',update);
 new MutationObserver(()=>{update();render(0)}).observe(root,{attributes:true,attributeFilter:['class']});
 addEventListener('resize',()=>{size();render(0)});
 // Tap left/right to move, press and hold anywhere to pause.
 let downAt=0,holdTimer=0;
 frame.addEventListener('pointerdown',e=>{if(e.target.closest('.reel-pause'))return;downAt=performance.now();holdTimer=setTimeout(()=>{held=true;update()},220)});
 const release=()=>{clearTimeout(holdTimer);if(held){held=false;update();downAt=-1}};
 frame.addEventListener('pointerup',release);frame.addEventListener('pointercancel',release);frame.addEventListener('pointerleave',release);
 frame.querySelector('.reel-prev').addEventListener('click',()=>{if(downAt<0){downAt=0;return}show(idx-1)});
 frame.querySelector('.reel-next').addEventListener('click',()=>{if(downAt<0){downAt=0;return}show(idx+1)});
 const pauseBtn=frame.querySelector('.reel-pause');
 pauseBtn.addEventListener('click',()=>{manualPause=!manualPause;pauseBtn.setAttribute('aria-pressed',String(manualPause));pauseBtn.setAttribute('aria-label',manualPause?'Play invitation reel':'Pause invitation reel');update()});
 frame.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){show(idx+1);e.preventDefault()}if(e.key==='ArrowLeft'){show(idx-1);e.preventDefault()}if(e.key===' '){pauseBtn.click();e.preventDefault()}});
 size();show(0);
})();
