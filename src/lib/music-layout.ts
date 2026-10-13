export const MUSIC_BUTTON_SIZE = 40;
export const MUSIC_MARGIN = 8;

export function clampMusicPosition(pos: {x:number;y:number}, viewport: {width:number;height:number}) {
  return { x: Math.max(MUSIC_MARGIN,Math.min(pos.x,Math.max(MUSIC_MARGIN,viewport.width-MUSIC_BUTTON_SIZE-MUSIC_MARGIN))), y: Math.max(MUSIC_MARGIN,Math.min(pos.y,Math.max(MUSIC_MARGIN,viewport.height-MUSIC_BUTTON_SIZE-MUSIC_MARGIN))) };
}

export function placeMusicCard(pos: {x:number;y:number}, viewport: {width:number;height:number}, cardHeight: number) {
  const width=Math.min(280,Math.max(0,viewport.width-2*MUSIC_MARGIN));
  const buttonLeft=viewport.width-pos.x-MUSIC_BUTTON_SIZE;
  const buttonTop=viewport.height-pos.y-MUSIC_BUTTON_SIZE;
  const above=buttonTop-MUSIC_MARGIN-12;
  const below=viewport.height-(buttonTop+MUSIC_BUTTON_SIZE)-MUSIC_MARGIN-12;
  const up=above>=cardHeight||above>=below;
  const maxHeight=Math.max(0,up?above:below);
  const height=Math.min(cardHeight,maxHeight);
  const left=Math.max(MUSIC_MARGIN,Math.min(buttonLeft,viewport.width-width-MUSIC_MARGIN));
  const top=up?buttonTop-12-height:buttonTop+MUSIC_BUTTON_SIZE+12;
  return {left,top,width,maxHeight,origin: `${buttonLeft<viewport.width/2?"left":"right"} ${up?"bottom":"top"}`, direction:up?"above":"below"};
}
