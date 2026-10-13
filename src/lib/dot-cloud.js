// Lift a regular point field around a ring, then project it back onto the screen.
export function deformCloudPoint(x,y,cx,cy,strength=1) {
  const dx=x-cx,dy=y-cy;
  if(strength<.001||dx*dx+dy*dy>200*200)return {x,y,lift:0,hollow:0};
  const distance=Math.hypot(dx,dy);
  const lift=46*Math.exp(-(((distance-105)/34)**2))*strength;
  const perspective=1+lift/280;
  const hollow=Math.exp(-((distance/48)**2))*strength;
  return {x:cx+dx*perspective,y:cy+dy*perspective-lift*.42,lift,hollow};
}

export function layoutGlyphs(width,height,contentLeft,contentRight) {
  const gutter=Math.min(contentLeft,width-contentRight);
  if(gutter<100)return [];
  let seed=27321;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const points=[];
  const count=Math.min(14,Math.max(2,Math.floor(gutter*height/19000)));
  for(let side=0;side<2;side++)for(let attempt=0,accepted=0;attempt<1500&&accepted<count;attempt++){
    const size=30+random()*22,r=size/Math.SQRT2+14;
    if(gutter<r*2+10)continue;
    const x=r+random()*(gutter-r*2-8),y=64+random()*(height-104);
    const p={x:side?width-x:x,y,size,rotation:(side?1:-1)*(14+random()*24),depth:.35+random()*.65};
    // Envelopes include the whole rotated glyph and its idle sway.
    if(points.some(q=>Math.abs(q.x-p.x)<(q.size+p.size)/Math.SQRT2+28&&Math.abs(q.y-p.y)<(q.size+p.size)/Math.SQRT2+28))continue;
    points.push(p);accepted++;
  }
  return points;
}
