const clamp=value=>Math.max(0,Math.min(1,value));

export function projectHoverPoint(x,y,width,height){
  const px=clamp(x/Math.max(1,width)),py=clamp(y/Math.max(1,height));
  return {tiltX:(py-.5)*-30,tiltY:(px-.5)*36,x:px*100,y:py*100,angle:135+(px-.5)*60-(py-.5)*35};
}

export function mountProjectHover(track,card){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const abort=new AbortController();
  let frame=0,active=false,cursor={x:0,y:0};
  const current={tiltX:0,tiltY:0,x:50,y:50,angle:135};
  const resting={...current};
  const write=()=>{
    card.style.setProperty('--project-tilt-x',`${current.tiltX.toFixed(2)}deg`);
    card.style.setProperty('--project-tilt-y',`${current.tiltY.toFixed(2)}deg`);
    card.style.setProperty('--project-glow-x',`${current.x.toFixed(2)}%`);
    card.style.setProperty('--project-glow-y',`${current.y.toFixed(2)}%`);
    card.style.setProperty('--project-glow-angle',`${current.angle.toFixed(2)}deg`);
  };
  const schedule=()=>{if(!frame&&!document.hidden)frame=requestAnimationFrame(update);};
  function update(){
    frame=0;
    let target=resting;
    if(active){
      // Read the stationary track, including the outer card's scroll translation.
      const r=track.getBoundingClientRect();
      const sx=parseFloat(card.style.getPropertyValue('--project-scroll-x'))||0;
      const sy=parseFloat(card.style.getPropertyValue('--project-scroll-y'))||0;
      target=projectHoverPoint(cursor.x-r.left-sx,cursor.y-r.top-sy,r.width,r.height);
    }
    let moving=false;
    for(const key of Object.keys(current)){
      const delta=target[key]-current[key];
      if(Math.abs(delta)>.025){current[key]+=delta*.24;moving=true;}else current[key]=target[key];
    }
    write();if(moving)schedule();
  }
  function move(event){
    if(event.pointerType==='touch'||reduced.matches)return;
    cursor={x:event.clientX,y:event.clientY};
    if(!active){active=true;card.dataset.hovered='true';window.addEventListener('scroll',schedule,{passive:true});}
    schedule();
  }
  function leave(){
    active=false;delete card.dataset.hovered;window.removeEventListener('scroll',schedule);schedule();
  }
  function reset(){
    active=false;delete card.dataset.hovered;window.removeEventListener('scroll',schedule);
    cancelAnimationFrame(frame);frame=0;Object.assign(current,resting);write();
  }
  card.addEventListener('pointerenter',move,{passive:true,signal:abort.signal});
  card.addEventListener('pointermove',move,{passive:true,signal:abort.signal});
  card.addEventListener('pointerleave',leave,{passive:true,signal:abort.signal});
  reduced.addEventListener('change',reset,{signal:abort.signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();},{signal:abort.signal});
  return()=>{abort.abort();reset();};
}
