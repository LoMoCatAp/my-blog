import {deformCloudPoint,layoutGlyphs} from './dot-cloud.js';
const shapes = {
  cube:'<path d="m32 7 23 13v25L32 58 9 45V20Z M9 20l23 13 23-13 M32 33v25"/><path d="m32 7 23 13-23 13L9 20Z" fill="currentColor" fill-opacity=".08"/>',
  cat:'<path d="M12 29 10 8l18 12h8L54 8l-2 21c8 22-3 29-20 29S4 51 12 29Z"/><path d="M19 40h6m14 0h6m-18 9 5 3 5-3"/>',
  paw:'<ellipse cx="32" cy="44" rx="15" ry="12"/><ellipse cx="13" cy="26" rx="6" ry="8" transform="rotate(-20 13 26)"/><ellipse cx="26" cy="16" rx="6" ry="8"/><ellipse cx="41" cy="17" rx="6" ry="8"/><ellipse cx="52" cy="29" rx="6" ry="8" transform="rotate(20 52 29)"/>',
  star:'<path d="m32 5 6 21 21 6-21 6-6 21-6-21L5 32l21-6Z"/>',
  brackets:'<path d="m23 13-17 19 17 19m18-38 17 19-17 19"/>',
  diamond:'<path d="m32 7 21 25-21 25L11 32Z"/><path d="M11 32h42M32 7v50" opacity=".4"/>',
  moon:'<path d="M45 8c-17 5-26 27-9 39 6 4 12 4 20 0-8 17-37 20-46-2S18 3 45 8Z"/>',
};
const glyph=type=>`<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[type]}</svg>`;

export function mountOrbitBackground(host){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse=window.matchMedia('(pointer: coarse)');
  const abort=new AbortController();
  const listen=(target,event,callback)=>target.addEventListener(event,callback,{passive:true,signal:abort.signal});
  let width=0,height=0,ratio=1,spacing=26,columns=0,rows=0,frameId=0,lastDraw=0,paused=false,destroyed=false;
  let mouseX=-1000,mouseY=-1000,cloudX=-1000,cloudY=-1000,strength=0,targetStrength=0;
  let scroll=window.scrollY,targetScroll=scroll,sway=0,accent='#fb923c',previousPatch=null;
  let points=[],positions=[],animations=[];
  host.classList.add('lomo-orbit-background');host.setAttribute('aria-hidden','true');
  host.innerHTML='<div class="lob-wash"></div><canvas class="lob-cloud" aria-hidden="true"></canvas><svg class="lob-orbits" fill="none" aria-hidden="true"></svg><div class="lob-glyphs"></div><div class="lob-trails"></div>';
  const field=host.querySelector('.lob-glyphs'),orbits=host.querySelector('.lob-orbits'),trails=host.querySelector('.lob-trails');
  const activeBursts=new Map(),pendingClicks=new Map();
  const canvas=host.querySelector('.lob-cloud'),context=canvas.getContext('2d');
  const base=document.createElement('canvas'),baseContext=base.getContext('2d');
  const names=Object.keys(shapes),elements=[];
  for(let i=0;i<28;i++){
    const node=document.createElement('span');node.className='lob-glyph';
    node.innerHTML=glyph(names[(i*3+Math.floor(i/7))%names.length]);
    node.style.opacity=String(.27+(i%4)*.04);field.append(node);elements.push(node);
  }
  const rings=[{rx:.43,ry:.28,rotation:-19},{rx:.56,ry:.41,rotation:17},{rx:.68,ry:.53,rotation:-8}];
  const orbitNodes=rings.map((ring,i)=>{
    const group=document.createElementNS('http://www.w3.org/2000/svg','g');
    group.innerHTML=`<ellipse class="lob-orbit-line"/><circle class="lob-orbit-point" r="${i===0?4.5:3.5}"/><circle class="lob-orbit-point lob-orbit-point-soft" r="9"/>`;
    orbits.append(group);return {ring,group,ellipse:group.children[0],point:group.children[1],soft:group.children[2],phase:.75+i*2.1};
  });
  function paintDots(ctx,dots,deform=false){
    if(!ctx)return;
    const buckets=Array.from({length:10},()=>[]);
    for(const dot of dots){
      const p=deform?deformCloudPoint(dot.x,dot.y,cloudX,cloudY,strength):{...dot,lift:0,hollow:0};
      const alpha=(.19+p.lift/160)*(1-p.hollow*.7)*(dot.central?.62:1);
      buckets[Math.min(9,Math.floor(alpha*20))].push(p);
    }
    ctx.fillStyle=accent;
    buckets.forEach((dots,i)=>{
      if(!dots.length)return;ctx.globalAlpha=(i+.5)/20;ctx.beginPath();
      for(const p of dots){const r=.8+p.lift/70;ctx.moveTo(p.x+r,p.y);ctx.arc(p.x,p.y,r,0,Math.PI*2);}
      ctx.fill();
    });ctx.globalAlpha=1;
  }
  function restorePatch(rect){
    if(!context||!rect)return;
    context.clearRect(rect.x,rect.y,rect.w,rect.h);
    context.drawImage(base,rect.x*ratio,rect.y*ratio,rect.w*ratio,rect.h*ratio,rect.x,rect.y,rect.w,rect.h);
  }
  function drawCloud(){
    if(!context)return;
    restorePatch(previousPatch);previousPatch=null;
    if(strength<.001||reduced.matches||coarse.matches)return;
    const x=Math.max(0,Math.floor(cloudX-220)),y=Math.max(0,Math.floor(cloudY-220));
    const right=Math.min(width,Math.ceil(cloudX+220)),bottom=Math.min(height,Math.ceil(cloudY+220));
    if(right<=x||bottom<=y)return;
    const patch={x,y,w:right-x,h:bottom-y};
    context.clearRect(x,y,patch.w,patch.h);context.save();context.beginPath();context.rect(x,y,patch.w,patch.h);context.clip();
    const nearby=[];
    for(let row=Math.max(0,Math.floor((y-12)/spacing));row<Math.min(rows,Math.ceil((bottom-12)/spacing)+1);row++)
      for(let col=Math.max(0,Math.floor((x-12)/spacing));col<Math.min(columns,Math.ceil((right-12)/spacing)+1);col++)nearby.push(points[row*columns+col]);
    paintDots(context,nearby,true);context.restore();previousPatch=patch;
  }
  function drawGlyphs(){
    const period=height+160;
    positions.forEach((p,i)=>{
      // Wrap only outside the viewport; the whole field travels more slowly than the page.
      const y=((p.y-scroll*.075)%period+period)%period-80;
      elements[i].style.top='0px';
      elements[i].style.transform=`translate(-50%,-50%) translate3d(0,${y.toFixed(2)}px,0) rotate(${(p.rotation+sway*(p.rotation<0?-1:1)).toFixed(2)}deg)`;
    });
  }
  function running(){return !destroyed&&!paused&&!reduced.matches&&!document.hidden;}
  function schedule(){if(running()&&!frameId)frameId=requestAnimationFrame(frame);}
  function frame(now){
    frameId=0;if(!running())return;
    if(now-lastDraw<1000/30){schedule();return;}lastDraw=now;
    const cloudMoving=Math.abs(mouseX-cloudX)>.12||Math.abs(mouseY-cloudY)>.12||Math.abs(targetStrength-strength)>.001;
    if(cloudMoving){cloudX+=(mouseX-cloudX)*.28;cloudY+=(mouseY-cloudY)*.28;strength+=(targetStrength-strength)*.2;if(targetStrength===0&&strength<.001)strength=0;drawCloud();}
    const delta=targetScroll-scroll;
    if(Math.abs(delta)>.08||Math.abs(sway)>.02){
      scroll+=delta*.2;sway+=(Math.max(-7,Math.min(7,delta*.08))-sway)*.25;
      if(Math.abs(delta)<.08)scroll=targetScroll;
      drawGlyphs();
    }
    if(cloudMoving||Math.abs(targetScroll-scroll)>.08||Math.abs(sway)>.02)schedule();
  }
  function resize(){
    if(destroyed)return;
    width=host.clientWidth;height=host.clientHeight;ratio=Math.min(window.devicePixelRatio||1,1.5);
    const contentWidth=Math.min(width,816),contentLeft=(width-contentWidth)/2,contentRight=width-contentLeft;
    host.style.setProperty('--lob-content-left',`${contentLeft}px`);host.style.setProperty('--lob-content-right',`${contentRight}px`);
    for(const c of [canvas,base]){c.width=Math.ceil(width*ratio);c.height=Math.ceil(height*ratio);}
    canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
    context?.setTransform(ratio,0,0,ratio,0,0);baseContext?.setTransform(ratio,0,0,ratio,0,0);
    spacing=width<768?28:26;columns=Math.ceil((width-12)/spacing);rows=Math.ceil((height-12)/spacing);points=[];
    for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
      const x=12+col*spacing,y=12+row*spacing;points.push({x,y,central:x>contentLeft&&x<contentRight});
    }
    // Cache the idle field once. Pointer movement repaints only a small nearby patch.
    baseContext?.clearRect(0,0,width,height);paintDots(baseContext,points);
    context?.clearRect(0,0,width,height);context?.drawImage(base,0,0,base.width,base.height,0,0,base.width/ratio,base.height/ratio);previousPatch=null;
    animations.forEach(a=>a.cancel());animations=[];
    positions=layoutGlyphs(width,height+160,contentLeft,contentRight);
    elements.forEach((node,i)=>{
      const p=positions[i];node.hidden=!p;
      if(!p)return;node.style.left=`${p.x}px`;node.style.width=`${p.size}px`;node.style.height=`${p.size}px`;
      if(!reduced.matches){
        const a=node.firstElementChild.animate([
          {transform:'translate(-3px, -4px) rotate(-3deg)'},
          {transform:'translate(3px, 4px) rotate(3deg)'},
          {transform:'translate(-3px, -4px) rotate(-3deg)'}
        ],{duration:14000+(i%7)*2100,iterations:Infinity,easing:'ease-in-out',delay:-(i*1900)});animations.push(a);
      }
    });
    orbits.setAttribute('viewBox',`0 0 ${width} ${height}`);
    orbitNodes.forEach(({ring,group,ellipse,point,soft,phase},i)=>{
      group.setAttribute('transform',`translate(${width/2},${height*.4}) rotate(${ring.rotation})`);
      ellipse.setAttribute('rx',String(width*ring.rx));ellipse.setAttribute('ry',String(height*ring.ry));
      soft.setAttribute('cx',String(Math.cos(phase+Math.PI)*width*ring.rx));soft.setAttribute('cy',String(Math.sin(phase+Math.PI)*height*ring.ry));
      const frames=Array.from({length:65},(_,n)=>{const angle=phase+n/64*Math.PI*2;return {transform:`translate(${Math.cos(angle)*width*ring.rx}px,${Math.sin(angle)*height*ring.ry}px)`};});
      point.style.transform=frames[0].transform;
      if(!reduced.matches)animations.push(point.animate(frames,{duration:88000+i*17000,iterations:Infinity}));
    });
    drawGlyphs();drawCloud();sync();
  }
  function sync(){
    host.dataset.paused=String(!running());
    if(frameId)cancelAnimationFrame(frameId);frameId=0;
    animations.forEach(a=>running()?a.play():a.pause());
    if(!running()){activeBursts.forEach(cleanup=>cleanup());pendingClicks.clear();}
    if(reduced.matches){strength=0;drawCloud();}
    if(running())schedule();
  }
  listen(window,'resize',resize);
  listen(window,'scroll',()=>{targetScroll=window.scrollY;schedule();});
  listen(window,'pointermove',e=>{
    if(e.pointerType==='touch'||coarse.matches||!running())return;
    mouseX=e.clientX;mouseY=e.clientY;
    if(!targetStrength){cloudX=mouseX;cloudY=mouseY;}targetStrength=1;schedule();
  });
  listen(document.documentElement,'pointerleave',()=>{targetStrength=0;schedule();});
  listen(document,'visibilitychange',sync);listen(reduced,'change',resize);listen(coarse,'change',resize);
  function burst(x,y,touch){
    if(!running()||activeBursts.size>=4)return;
    const node=document.createElement('span');node.className='lob-click-burst';node.style.left=`${x}px`;node.style.top=`${y}px`;
    node.innerHTML='<i class="lob-click-halo"></i><i class="lob-click-ring"></i><i class="lob-click-core"></i>';
    trails.append(node);
    const effects=[],ease='cubic-bezier(.16,.7,.3,1)';
    const animate=(el,frames,duration)=>{const a=el.animate(frames,{duration,easing:ease,fill:'both'});effects.push(a);};
    animate(node.children[0],[{opacity:0,transform:'translate(-50%,-50%) scale(.3)'},{opacity:.24,offset:.15,transform:'translate(-50%,-50%) scale(.75)'},{opacity:0,transform:'translate(-50%,-50%) scale(1.2)'}],520);
    animate(node.children[1],[{opacity:.5,transform:'translate(-50%,-50%) scale(.18)'},{opacity:.18,offset:.55,transform:'translate(-50%,-50%) scale(.9)'},{opacity:0,transform:'translate(-50%,-50%) scale(1.35)'}],560);
    animate(node.children[2],[{opacity:.75,transform:'translate(-50%,-50%) scale(.55)'},{opacity:0,transform:'translate(-50%,-50%) scale(1.4)'}],260);
    const count=touch?4:6,phase=Math.random()*Math.PI*2;
    for(let i=0;i<count;i++){
      const dot=document.createElement('i');dot.className='lob-click-particle';
      const size=1.8+Math.random()*1.5,angle=phase+i*Math.PI*2/count+(Math.random()-.5)*.35,distance=16+Math.random()*15;
      dot.style.width=`${size}px`;dot.style.height=`${size}px`;node.append(dot);
      animate(dot,[{opacity:0,transform:'translate(-50%,-50%) scale(.5)'},{opacity:.7,offset:.12,transform:`translate(${Math.cos(angle)*4}px,${Math.sin(angle)*4}px) scale(1)`},{opacity:0,transform:`translate(${Math.cos(angle)*distance}px,${Math.sin(angle)*distance+5}px) scale(.2)`}],400+Math.random()*140);
    }
    let cleaned=false;
    const cleanup=()=>{if(cleaned)return;cleaned=true;effects.forEach(a=>a.cancel());node.remove();activeBursts.delete(node);};
    activeBursts.set(node,cleanup);Promise.allSettled(effects.map(a=>a.finished)).then(cleanup);
  }
  listen(window,'pointerdown',e=>{
    if(!running()||e.button!==0||!(e.target instanceof Element)||e.target.closest('a,button,input,textarea,select,pre,nav,[contenteditable]')||pendingClicks.size>=5)return;
    pendingClicks.set(e.pointerId,{x:e.clientX,y:e.clientY,time:performance.now()});
  });
  // A tap triggers feedback after release; scrolling and dragging do not.
  listen(window,'pointermove',e=>{const start=pendingClicks.get(e.pointerId);if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>8)pendingClicks.delete(e.pointerId);});
  listen(window,'pointercancel',e=>pendingClicks.delete(e.pointerId));
  listen(window,'pointerup',e=>{
    const start=pendingClicks.get(e.pointerId);pendingClicks.delete(e.pointerId);
    if(start&&performance.now()-start.time<700&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<=8)burst(e.clientX,e.clientY,e.pointerType==='touch'||coarse.matches);
  });
  const themeObserver=new MutationObserver(()=>{accent=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||getComputedStyle(host).color;resize();});themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  accent=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||getComputedStyle(host).color;resize();
  return {
    setPaused(value){paused=Boolean(value);sync();},
    destroy(){destroyed=true;abort.abort();themeObserver.disconnect();if(frameId)cancelAnimationFrame(frameId);animations.forEach(a=>a.cancel());activeBursts.forEach(cleanup=>cleanup());activeBursts.clear();pendingClicks.clear();host.replaceChildren();},
  };
}
