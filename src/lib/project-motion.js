const clamp=value=>Math.max(0,Math.min(1,value));

// Measure the stationary track, so translating the card cannot change its progress.
export function projectMotion(top,height,viewportHeight,side){
  const enter=clamp((viewportHeight+120-top)/380);
  const exit=clamp((top+height+100)/Math.min(height+100,360));
  const opacity=Math.min(enter,exit),distance=1-opacity;
  return {opacity,x:distance*(side==='left'?-120:120),y:distance*30};
}

export function mobileProjectMotion(top,height,viewportHeight,side){
  const progress=clamp((viewportHeight*.5-top)/Math.max(1,height));
  return {tiltX:(progress-.5)*8,tiltY:side==='left'?-2.5:2.5,lightY:progress*100};
}

export function mountProjectMotion(root){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact=window.matchMedia('(max-width: 767px), (hover: none), (pointer: coarse)');
  const tracks=[...root.querySelectorAll('.project-track')];
  let frame=0;
  const update=()=>{
    frame=0;
    const measurements=tracks.map(track=>({track,rect:track.getBoundingClientRect()}));
    // Only the card nearest the viewport centre receives the mobile light sweep.
    let active=null,nearest=Infinity;
    if(compact.matches&&!reduced.matches){
      for(const {track,rect} of measurements){
        if(track.dataset.side==='center'||rect.bottom<=0||rect.top>=window.innerHeight)continue;
        const distance=Math.abs(rect.top+rect.height*.5-window.innerHeight*.5);
        if(distance<nearest){nearest=distance;active=track;}
      }
    }
    for(const {track,rect} of measurements){
      const card=track.firstElementChild;
      const m=reduced.matches?{opacity:1,x:0,y:0}:projectMotion(rect.top,rect.height,window.innerHeight,track.dataset.side);
      if(track.dataset.side==='center')m.x=0;
      card.style.setProperty('--project-opacity',m.opacity.toFixed(3));
      card.style.setProperty('--project-scroll-x',`${m.x.toFixed(2)}px`);
      card.style.setProperty('--project-scroll-y',`${m.y.toFixed(2)}px`);
      const isActive=track===active;
      if(isActive){
        const mobile=mobileProjectMotion(rect.top,rect.height,window.innerHeight,track.dataset.side);
        card.dataset.mobileActive='true';
        card.style.setProperty('--project-mobile-tilt-x',`${mobile.tiltX.toFixed(2)}deg`);
        card.style.setProperty('--project-mobile-tilt-y',`${mobile.tiltY.toFixed(2)}deg`);
        card.style.setProperty('--project-mobile-light-y',`${mobile.lightY.toFixed(2)}%`);
      }else{
        delete card.dataset.mobileActive;
        card.style.setProperty('--project-mobile-tilt-x','0deg');
        card.style.setProperty('--project-mobile-tilt-y','0deg');
      }
    }
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  update();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);compact.addEventListener('change',schedule);
  const observer=new ResizeObserver(schedule);observer.observe(root);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule);compact.removeEventListener('change',schedule);};
}
