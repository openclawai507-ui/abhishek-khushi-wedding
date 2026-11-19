'use strict';
// Self-contained scroll animation engine: no libraries, build step, or server.
(() => {
 const root=document.documentElement;
 const $=s=>document.querySelector(s);
 const portal=$('.portal-scroll'),ring=$('.ring-scroll'),pheras=$('.pheras-section'),finale=$('.finale-scroll');
 const canvas=$('#celebration-canvas'),ctx=canvas.getContext('2d');
 const button=$('#motion-button'),label=$('#motion-label');
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 let enabled=!media.matches,frame=0,dirty=true,lastTime=0,width=innerWidth,height=innerHeight,dpr=1,finaleP=0,finaleVisible=false;
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const ease=p=>1-Math.pow(1-clamp(p),3);
 const css=(el,key,value)=>el.style.setProperty('--'+key,value);
 const range=(el)=>{const r=el.getBoundingClientRect();return {p:clamp(-r.top/Math.max(1,el.offsetHeight-el.firstElementChild.offsetHeight)),visible:r.bottom>0&&r.top<innerHeight,rect:r}};
 const passage=(el)=>{const r=el.getBoundingClientRect();return clamp((innerHeight-r.top)/(innerHeight+r.height))};
 // Marigold varmala: beads laid along an oval, with leaves, a rose pendant and a tassel.
 (function buildVarmala(){
  const svg=document.getElementById('varmala-svg');if(!svg)return;
  const NS='http://www.w3.org/2000/svg',el=(n,a)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);return e};
  const defs=el('defs',{});
  [['vm-o','#ffd36b','#e8711c'],['vm-y','#fff0a0','#f2b51f'],['vm-r','#ff6b6b','#a4122a']].forEach(([id,a,b])=>{const g=el('radialGradient',{id,cx:'40%',cy:'35%',r:'70%'});g.append(el('stop',{offset:'0','stop-color':a}),el('stop',{offset:'1','stop-color':b}));defs.append(g)});
  svg.append(defs);
  const cx=100,cy=128,rx=78,ry=96,n=34;
  svg.append(el('ellipse',{cx,cy,rx,ry,fill:'none',stroke:'#7a4a1c','stroke-width':2,opacity:.6}));
  const beads=el('g',{}),leaves=el('g',{});
  for(let i=0;i<n;i++){
   const a=-Math.PI/2+(i+.5)/n*Math.PI*2,x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry;
   if(Math.abs(Math.sin(a)+1)<.02)continue;
   if(i%3===1){const deg=a*180/Math.PI;leaves.append(el('ellipse',{cx:x+Math.cos(a)*9,cy:y+Math.sin(a)*9,rx:7,ry:3,fill:'#3f7a3a',transform:`rotate(${deg} ${x+Math.cos(a)*9} ${y+Math.sin(a)*9})`}))}
   beads.append(el('circle',{cx:x,cy:y,r:9.5,fill:`url(#${i%2?'vm-y':'vm-o'})`}),el('circle',{cx:x,cy:y,r:3,fill:i%2?'#e0961a':'#b8480f',opacity:.7}));
  }
  svg.append(leaves,beads);
  svg.append(el('path',{d:'M92 18Q100 4 108 18Q100 30 92 18Z',fill:'#c9302c',stroke:'#ffd67a','stroke-width':1.2}));
  const pend=el('g',{});
  pend.append(el('path',{d:'M100 222L100 240M94 222L90 238M106 222L110 238',stroke:'#ffd67a','stroke-width':2,'stroke-linecap':'round'}));
  [[100,222,11,'vm-r'],[88,216,7,'vm-o'],[112,216,7,'vm-o']].forEach(([x,y,r,f])=>pend.append(el('circle',{cx:x,cy:y,r,fill:`url(#${f})`})));
  pend.append(el('circle',{cx:100,cy:222,r:4,fill:'#7d0f20',opacity:.6}));
  svg.append(pend);
 })();
 const garudScroll=$('.garud-scroll'),garudStage=$('.garud-stage'),garudBird=$('.garud'),varmala=$('.varmala');
 const particles=Array.from({length:70},(_,i)=>({x:((i*73.17)%100)/100,y:((i*31.97)%100)/100,speed:.012+(i%5)*.004,size:1+(i%4)*.65,phase:i*1.9}));
 function layout(){width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);dirty=true;schedule()}
 function choreography(){
  if(!enabled)return;
  const opening=range(portal),p=opening.p,open=ease((p-.06)/.83);
  css(portal,'door-angle',(-106*open)+'deg');css(portal,'seal-opacity',1-clamp(p/.36));css(portal,'seal-scale',1+p*.8);css(portal,'world-scale',.86+open*.14);css(portal,'world-opacity',.15+open*.85);css(portal,'mandala-rotation',(p*65)+'deg');css(portal,'mandala-scale',.8+p*.3);
  if(garudScroll){
   const g=range(garudScroll);
   if(g.visible){
    const gp=g.p,W=garudStage.clientWidth,H=garudStage.clientHeight,bw=Math.min(innerWidth*.54,330);
    const vmw=varmala.offsetWidth,vmh=varmala.offsetHeight,smooth=t=>t*t*(3-2*t);
    const t=smooth(clamp(gp/.55)),exit=clamp((gp-.66)/.34),drop=ease(clamp((gp-.55)/.17));
    const S=[-.5*W-bw*.7,-.3*H],C=[-.18*W,.16*H],E=[0,-.22*H];
    let bx=(1-t)*(1-t)*S[0]+2*(1-t)*t*C[0]+t*t*E[0],by=(1-t)*(1-t)*S[1]+2*(1-t)*t*C[1]+t*t*E[1];
    let tilt=t<1?(14*(1-t)-6*Math.sin(t*Math.PI)):0,scale=.72+.28*t;
    if(gp>.55&&exit===0){by+=Math.sin((gp-.55)*40)*6}
    if(exit>0){const e=exit*exit;bx+=e*(.5*W+bw);by-=e*(.42*H+bw*.6);tilt=-20*ease(exit*2);scale=1-.25*e}
    css(garudBird,'garud-x',bx+'px');css(garudBird,'garud-y',by+'px');css(garudBird,'garud-tilt',tilt+'deg');css(garudBird,'garud-scale',scale);
    // Talon point, from the bird's centre, rotated with the bird.
    const k=bw/300*scale,rad=tilt*Math.PI/180,ox=15*k,oy=50*k;
    const tx=.5*W+bx+ox*Math.cos(rad)-oy*Math.sin(rad),ty=.5*H+by+ox*Math.sin(rad)+oy*Math.cos(rad);
    const hold=[tx-.5*W,ty-(.42*H-.46*vmh)],carried=.36,sway=Math.sin(gp*28)*7*(1-drop)+tilt*.6*(1-drop);
    css(varmala,'vm-x',(hold[0]*(1-drop))+'px');css(varmala,'vm-y',(hold[1]*(1-drop))+'px');css(varmala,'vm-scale',carried+(1-carried)*drop);css(varmala,'vm-rot',sway+'deg');
    const land=clamp((gp-.6)/.12),copy=ease(clamp((gp-.66)/.14));
    css(garudStage,'blessed-opacity',land);css(garudStage,'blessed-scale',.7+.3*land);css(garudStage,'halo-opacity',.15+.85*land);css(garudStage,'halo-scale',.6+.4*land);css(garudStage,'halo-spin',(gp*70)+'deg');
    css(garudStage,'shloka-opacity',.4+.6*clamp(gp/.12));css(garudStage,'shloka-y',((1-clamp(gp/.12))*14)+'px');css(garudStage,'copy-opacity',copy);css(garudStage,'copy-y',((1-copy)*28)+'px');
   }
  }
  const hero=$('.hero'),h=passage(hero);css(hero,'hero-rise',((.42-h)*65)+'px');css(hero,'hero-text-y',((h-.4)*-30)+'px');css(hero,'hero-tilt',((.48-h)*4)+'deg');css(hero,'hero-frame',1+Math.sin(h*Math.PI)*.045);
  css($('.invitation'),'family-rotation',(passage($('.invitation'))*100)+'deg');
  const r=range(ring),rp=r.p,re=ease(rp*1.8),rs=$('.ring-section');
  css(rs,'ring-art-y',((1-re)*90)+'px');css(rs,'ring-art-angle',(-9*(1-re)+Math.sin(rp*Math.PI)*2)+'deg');css(rs,'ring-art-scale',.86+re*.14);css(rs,'ring-art-opacity',.55+re*.45);css(rs,'ring-curtain',((1-re)*65)+'%');css(rs,'ring-frame-scale',1.08-re*.08);css(rs,'ring-text-y',((1-re)*25)+'px');css(rs,'ring-spin',(rp*110)+'deg');css(rs,'rings-apart',(-20*(1-ease(rp*2)))+'px');css(rs,'rings-scale',1+Math.sin(rp*Math.PI)*.18);css(rs,'rings-glow',(rp*22)+'px');css(rs,'rings-star',ease(rp*2));
  const sacred=range(pheras),sp=sacred.p,stage=$('.pheras-sticky');
  css(stage,'sacred-spin',(sp*110)+'deg');css(stage,'sacred-opacity',.06+sp*.16);css(stage,'sacred-scale',.8+sp*.42);css(stage,'aura-opacity',.2+sp*.8);css(stage,'sacred-art-scale',.96+sp*.06);css(stage,'sacred-rise',(-sp*10)+'px');css(stage,'sacred-glow',(sp*65)+'px');css(stage,'orbit-offset',100-sp*100);css(stage,'ember-scale',1+sp);
  document.querySelectorAll('.day-card').forEach((card,i)=>{const rect=card.getBoundingClientRect();const cp=ease(clamp((innerHeight-rect.top)/(innerHeight*.65)));css(card,'card-rise',((1-cp)*90)+'px');css(card,'card-tilt',((1-cp)*(i?-12:12))+'deg');css(card,'card-opacity',.3+cp*.7)});
  const f=range(finale);finaleP=f.p;finaleVisible=f.visible;const fe=ease(f.p*2.1),fs=$('.finale-stage');
  css(fs,'finale-rotation',(f.p*90)+'deg');css(fs,'finale-mandala-scale',.6+f.p*.65);css(fs,'finale-mandala-opacity',.07+f.p*.28);css(fs,'finale-light',f.p);css(fs,'finale-rise',((1-fe)*65)+'px');css(fs,'finale-scale',.88+fe*.12);css(fs,'finale-opacity',.25+fe*.75);css(fs,'title-glow',(f.p*35)+'px');css(fs,'finale-flower-opacity',f.p*.5);css(fs,'finale-flower-scale',.4+f.p*.6);
  const vp=passage($('.venue-section'));css($('.venue-section'),'venue-spin',(vp*120)+'deg');css($('.venue-section'),'venue-scale',.7+vp*.5);
 }
 function draw(time){
  if(!ctx)return;ctx.clearRect(0,0,width,height);
  const page=scrollY/Math.max(1,document.documentElement.scrollHeight-height);
  const count=width<640?36:64;
  for(let i=0;i<count;i++){
   const a=particles[i],x=a.x*width+Math.sin(time*.15+a.phase)*24,y=((a.y+time*a.speed+scrollY*.000025)%1)*height;
   const alpha=(.12+.2*(Math.sin(time+a.phase)*.5+.5))*(.6+page*.5);
   ctx.fillStyle=i%4===0&&!finaleVisible?`rgba(161,78,86,${alpha})`:`rgba(210,168,88,${alpha})`;
   ctx.save();ctx.translate(x,y);ctx.rotate(time*.12+a.phase+scrollY*.0005);ctx.beginPath();
   if(i%4===0){ctx.ellipse(0,0,a.size*1.2,a.size*2.5,0,0,Math.PI*2)}else{ctx.arc(0,0,a.size*.65,0,Math.PI*2)}ctx.fill();ctx.restore();
  }
  // Slow golden blooms intensify through the finale; no rapid flashing.
  if(finaleVisible&&finaleP>.12){
   const blooms=Math.min(5,1+Math.floor(finaleP*5));
   for(let b=0;b<blooms;b++){
    const phase=(time*.13+b*.23)%1,radius=(width<640?70:150)*ease(phase),opacity=Math.sin(phase*Math.PI)*.65*clamp(finaleP*2);
    const cx=width*(.12+((b*.273)% .8)),cy=height*(.14+((b*.193)%.62));
    ctx.strokeStyle=`rgba(235,191,111,${opacity})`;ctx.lineWidth=1;
    for(let ray=0;ray<28;ray++){const angle=ray/28*Math.PI*2+b;const inner=radius*(.6+phase*.2);ctx.beginPath();ctx.moveTo(cx+Math.cos(angle)*inner,cy+Math.sin(angle)*inner);ctx.lineTo(cx+Math.cos(angle)*radius,cy+Math.sin(angle)*radius);ctx.stroke()}
   }
  }
 }
 function tick(now){frame=0;if(!enabled||document.hidden)return;if(dirty){choreography();dirty=false}if(now-lastTime>32){draw(now/1000);lastTime=now}frame=requestAnimationFrame(tick)}
 function schedule(){if(enabled&&!document.hidden&&!frame)frame=requestAnimationFrame(tick)}
 function setEnabled(value){enabled=value;root.classList.toggle('motion-off',!enabled);root.classList.toggle('motion-enabled',enabled);button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'Turn off motion effects':'Turn on motion effects');label.textContent=enabled?'Motion on':'Motion off';if(!enabled){cancelAnimationFrame(frame);frame=0;ctx?.clearRect(0,0,width,height)}else{dirty=true;schedule()}}
 button.addEventListener('click',()=>setEnabled(!enabled));media.addEventListener('change',e=>setEnabled(!e.matches));
 addEventListener('scroll',()=>{dirty=true;schedule()},{passive:true});addEventListener('resize',layout);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else schedule()});
 layout();setEnabled(enabled);
})();
