"use client";

import { useRef, useState, useEffect } from "react";
import { clampMusicPosition, placeMusicCard } from "@/lib/music-layout";
import { useI18n } from "./I18nProvider";

type PlayMode = "normal" | "repeat" | "shuffle";

/* ── shared mini style sheet ── */
const S = {
  btn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    color: "var(--text-muted)",
    transition: "color 0.2s, transform 0.15s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,

  hoverBtn: {
    ...({} as React.CSSProperties),
  },
};

/* ── Draggable floating button (uses Pointer Events, no synthetic mouse issues) ── */
function DragButton({open,onToggle,getPos,setPos,bounds,onDragging,onSettle}: {
  open:boolean; onToggle:()=>void; getPos:()=>{x:number;y:number};
  onDragging:(value:boolean)=>void; onSettle:()=>void;
  setPos:(p:{x:number;y:number})=>void; bounds:{width:number;height:number};
}) {
  const dragRef=useRef({moved:false,startX:0,startY:0,elX:0,elY:0,pointerId:-1});
  return <button type="button" aria-label={open ? "收起音乐播放器" : "展开音乐播放器"}
    aria-expanded={open} aria-controls="music-player-card" className="music-float-btn"
    onPointerDown={e=>{
      if(e.button!==0||!e.isPrimary)return;
      e.currentTarget.setPointerCapture(e.pointerId);onDragging(true);
      const p=getPos();dragRef.current={moved:false,startX:e.clientX,startY:e.clientY,elX:p.x,elY:p.y,pointerId:e.pointerId};
    }}
    onPointerMove={e=>{
      const d=dragRef.current;if(d.pointerId!==e.pointerId)return;
      if(Math.hypot(e.clientX-d.startX,e.clientY-d.startY)>5)d.moved=true;
      if(d.moved)setPos(clampMusicPosition({x:d.elX+d.startX-e.clientX,y:d.elY+d.startY-e.clientY},bounds));
    }}
    onPointerUp={()=>{dragRef.current.pointerId=-1;onDragging(false);if(dragRef.current.moved)onSettle();}}
    onPointerCancel={()=>{dragRef.current.pointerId=-1;dragRef.current.moved=false;onDragging(false);}}
    onLostPointerCapture={()=>{dragRef.current.pointerId=-1;onDragging(false);}}
    onClick={e=>{if(e.detail!==0&&dragRef.current.moved){dragRef.current.moved=false;return;}onToggle();}}
    style={{width:40,height:40,borderRadius:20,background:"var(--accent)",color:"white",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"grab",boxShadow:"0 2px 12px rgba(0,0,0,.2)",userSelect:"none",touchAction:"none",transition:"box-shadow .2s"}}>
    {open ? <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m18 6-12 12m0-12 12 12"/></svg> : <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>}
  </button>;
}

export interface MusicSong { id:number; title:string; artist:string; filename:string; }

export default function MusicPlayer({initialSongs=[]}:{initialSongs?:MusicSong[]}) {
  const {t}=useI18n();
  const audio=useRef<HTMLAudioElement>(null);
  const songsRef=useRef<MusicSong[]>(initialSongs);
  const indexRef=useRef(initialSongs.length?0:-1);
  const modeRef=useRef<PlayMode>("normal");
  const hasPlayed=useRef(false);
  const [songs,setSongs]=useState(initialSongs);
  const [idx,setIdx]=useState(initialSongs.length?0:-1);
  const [playing,setPlaying]=useState(false);
  const [open,setOpen]=useState(false);
  const [list,setList]=useState(false);
  const [mode,setMode]=useState<PlayMode>("normal");
  const [volume,setVolume]=useState(.6);
  const [progress,setProgress]=useState(0);
  const [duration,setDuration]=useState(0);
  const [currentTime,setCurrentTime]=useState(0);
  const [pos,setPos]=useState({x:24,y:24});
  const positionRef=useRef(pos);
  const dragFrame=useRef(0);
  const [dragging,setDragging]=useState(false);
  const moveTo=(p:{x:number;y:number})=>{
    positionRef.current=p;
    if(!dragFrame.current)dragFrame.current=requestAnimationFrame(()=>{dragFrame.current=0;setPos({...positionRef.current});});
  };
  const settle=()=>{const p=positionRef.current;moveTo(clampMusicPosition({...p,x:p.x<viewport.width/2?16:viewport.width-56},viewport));};
  useEffect(()=>()=>cancelAnimationFrame(dragFrame.current),[]);
  const cardRef=useRef<HTMLDivElement>(null);
  const [viewport,setViewport]=useState({width:1024,height:768});
  const [cardHeight,setCardHeight]=useState(160);
  const song=songs[idx];
  const source=(track:MusicSong)=>`/music/${encodeURIComponent(track.filename)}`;
  const prepareSource=(index:number)=>{
    const el=audio.current,track=songsRef.current[index];if(!el||!track)return null;
    indexRef.current=index;setIdx(index);
    const src=source(track);
    if(el.getAttribute("src")!==src){el.src=src;el.load();setCurrentTime(0);setProgress(0);setDuration(0);}
    return el;
  };
  const playIndex=(index:number)=>{
    const el=prepareSource(index);if(!el)return;
    // Invoke play inside the actual click, before yielding user activation.
    el.play().catch(()=>setPlaying(false));
  };
  const nextIndex=()=>{
    const total=songsRef.current.length;if(!total)return -1;
    if(modeRef.current!=="shuffle")return (indexRef.current+1)%total;
    if(total===1)return 0;
    const step=1+Math.floor(Math.random()*(total-1));return (Math.max(0,indexRef.current)+step)%total;
  };
  useEffect(()=>{
    const update=()=>{
      const size={width:window.visualViewport?.width||document.documentElement.clientWidth,height:window.visualViewport?.height||window.innerHeight};
      setViewport(size);setPos(p=>{const next=clampMusicPosition(p,size);positionRef.current=next;return next;});
    };
    update();window.addEventListener("resize",update);window.visualViewport?.addEventListener("resize",update);
    return()=>{window.removeEventListener("resize",update);window.visualViewport?.removeEventListener("resize",update);};
  },[]);
  useEffect(()=>{
    const card=cardRef.current;if(!card)return;
    const measure=()=>{
      const playlist=card.querySelector<HTMLElement>('.music-playlist');
      const inner=card.querySelector<HTMLElement>('.music-playlist-inner');
      const base=card.scrollHeight+card.offsetHeight-card.clientHeight-(playlist?.offsetHeight||0);
      setCardHeight(base+(list?(inner?.scrollHeight||0):0));
    };
    measure();const observer=new ResizeObserver(measure);observer.observe(card);
    return()=>observer.disconnect();
  },[open,list,songs.length,viewport.width]);
  const cardPlacement=placeMusicCard(pos,viewport,cardHeight);
  useEffect(()=>{
    if(indexRef.current>=0)prepareSource(indexRef.current);
    const controller=new AbortController();
    fetch("/api/music",{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json();}).then((data:MusicSong[])=>{
      if(!Array.isArray(data))return;
      const current=songsRef.current[indexRef.current]?.filename;
      const index=Math.max(0,data.findIndex(track=>track.filename===current));
      songsRef.current=data;setSongs(data);
      if(data.length)prepareSource(index);else {audio.current?.pause();indexRef.current=-1;setIdx(-1);}
    }).catch(()=>{});
    return()=>controller.abort();
  },[]);
  useEffect(()=>{
    const el=audio.current;if(!el)return;
    const onMetadata=()=>setDuration(Number.isFinite(el.duration)?el.duration:0);
    const onEnded=()=>{const i=nextIndex();if(i>=0)playIndex(i);};
    el.addEventListener("loadedmetadata",onMetadata);el.addEventListener("ended",onEnded);
    onMetadata();
    return()=>{el.removeEventListener("loadedmetadata",onMetadata);el.removeEventListener("ended",onEnded);};
  },[]);
  useEffect(()=>{
    if(!open)return;
    const update=()=>{const el=audio.current;if(!el)return;setCurrentTime(el.currentTime);setProgress(el.duration?el.currentTime/el.duration*100:0);};
    update();const timer=setInterval(update,1000);return()=>clearInterval(timer);
  },[open]);
  useEffect(()=>{if(audio.current)audio.current.volume=volume;},[volume]);
  const prev=()=>{const total=songsRef.current.length;if(total)playIndex((Math.max(0,indexRef.current)-1+total)%total);};
  const nextSong=()=>{const i=nextIndex();if(i>=0)playIndex(i);};
  const togglePlay=()=>{
    const el=audio.current;if(!el||!songsRef.current.length)return;
    if(!el.paused){el.pause();return;}playIndex(Math.max(0,indexRef.current));
  };
  const togglePanel=()=>{
    if(!open&&!hasPlayed.current&&songsRef.current.length)playIndex(Math.max(0,indexRef.current));
    setOpen(value=>!value);
  };
  const pickSong=(i:number)=>{playIndex(i);setList(false);};
  const cycleMode=()=>{const next=modeRef.current==="normal"?"repeat":modeRef.current==="repeat"?"shuffle":"normal";modeRef.current=next;setMode(next);};

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sc = Math.floor(s % 60);
    return `${m}:${String(sc).padStart(2, "0")}`;
  };

  return (
    <div className={`music-layer ${dragging?"is-dragging":""}`} style={{position:"fixed",inset:0,zIndex:100,pointerEvents:"none"}}>
      <style>{`
        .music-btn { background:none; border:none; cursor:pointer; padding:4px;
          color:var(--text-muted); transition:color .2s, transform .15s;
          display:inline-flex; align-items:center; justify-content:center; }
        .music-btn:hover { color:var(--accent-dark); transform:scale(1.15); }
        .music-btn:active { transform:scale(0.92); }

        .music-toggle-btn { width:36px; height:36px; border-radius:18px; border:none;
          background:var(--accent); color:white; cursor:pointer;
          display:inline-flex; align-items:center; justify-content:center;
          transition:transform .2s, box-shadow .2s; }
        .music-toggle-btn:hover { transform:scale(1.1); box-shadow:0 0 12px var(--accent-light); }
        .music-toggle-btn:active { transform:scale(0.92); }

        .music-dock {position:absolute;right:0;bottom:0;width:40px;height:40px;pointer-events:auto;transition:transform .32s cubic-bezier(.22,1,.36,1);will-change:transform;}
        .music-positioner {position:absolute;left:0;top:0;transition:transform .3s cubic-bezier(.22,1,.36,1);}
        .music-layer.is-dragging .music-dock,.music-layer.is-dragging .music-positioner {transition:transform .075s linear;}
        .music-float-btn {transition:transform .2s,box-shadow .2s !important;}
        .music-layer.is-dragging .music-float-btn {transform:scale(1.04);cursor:grabbing !important;}
        .music-float-btn:hover { transform:scale(1.08); box-shadow:0 4px 16px rgba(0,0,0,0.25); }
        .music-float-btn:active { transform:scale(0.92); }

        .music-card {
          position:relative; border-radius:12px;
          border:1px solid var(--border); background:var(--card);
          box-shadow:0 4px 20px rgba(0,0,0,0.15); overflow-x:hidden; overflow-y:auto; overscroll-behavior:contain;
          transition:opacity .24s ease, transform .32s cubic-bezier(.22,1,.36,1), visibility 0s linear .32s;
          
        }
        .music-card.enter { opacity:1; transform:translateY(0) scale(1); pointer-events:auto; visibility:visible; transition-delay:0s; }
        .music-card.leave { opacity:0; transform:translateY(var(--music-shift,12px)) scale(.86); pointer-events:none; visibility:hidden; }
        .music-playlist {display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .3s cubic-bezier(.22,1,.36,1),opacity .22s ease;}
        .music-playlist.is-open {grid-template-rows:1fr;opacity:1;}
        .music-playlist-inner {min-height:0;overflow:hidden;}
        @media(prefers-reduced-motion:reduce){.music-card,.music-dock,.music-positioner,.music-playlist,.music-layer.is-dragging .music-dock,.music-layer.is-dragging .music-positioner{transition:none}.music-card.leave{transform:none}}
        .music-list-btn:hover, .music-song-btn:hover, .music-list-btn:active, .music-song-btn:active { transform:none; }
        .music-song-btn { display:block; overflow-wrap:anywhere; }
      `}</style>

      <audio ref={audio} preload="metadata" src={initialSongs[0] ? source(initialSongs[0]) : undefined} loop={mode==="normal"}
        onPlay={()=>{hasPlayed.current=true;setPlaying(true);}} onPause={()=>setPlaying(false)} onError={()=>setPlaying(false)} />

      {/* Player card */}
      <div className="music-positioner" style={{transform:`translate3d(${cardPlacement.left}px,${cardPlacement.top}px,0)`,width:cardPlacement.width}}>
      <div ref={cardRef} id="music-player-card" aria-label="音乐播放器" aria-hidden={!open} inert={!open} data-placement={cardPlacement.direction} className={`music-card ${open ? "enter" : "leave"}`} style={{maxHeight:cardPlacement.maxHeight,transformOrigin:cardPlacement.origin,"--music-shift":cardPlacement.direction==="above"?"12px":"-12px"} as React.CSSProperties}>
        {/* Song info */}
        <div style={{ padding: "12px 16px 4px" }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {song ? song.title : t("music.noSong")}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{song ? song.artist : "\u2014"}</p>
        </div>

        {/* Progress bar */}
        <div style={{ padding: "4px 16px 0" }}>
          <div
            style={{ height: 4, background: "var(--border)", borderRadius: 2, cursor: "pointer", position: "relative" }}
            onClick={(e) => {
              const el = audio.current;
              if (!el || !duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              el.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
            }}
          >
            <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.1s linear" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "6px 12px" }}>
          {/* Mode toggle */}
          <button onClick={cycleMode} className="music-btn"
            title={mode === "normal" ? "单曲循环" : mode === "repeat" ? "列表循环" : "随机播放"}>
            {mode === "shuffle" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            ) : mode === "repeat" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            ) : mode === "normal" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                <text x="12" y="15" fontSize="9" fontWeight="bold" textAnchor="middle" fill="currentColor" stroke="none">1</text>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            )}
          </button>

          {/* Prev */}
          <button onClick={prev} className="music-btn" aria-label="上一首">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button onClick={togglePlay} className="music-toggle-btn" aria-label={playing ? "暂停音乐" : "播放音乐"}>
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            )}
          </button>

          {/* Next */}
          <button onClick={nextSong} className="music-btn" aria-label="下一首">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>

          {/* Volume */}
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)" }}>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              {volume > 0 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />}
            </svg>
            <input aria-label="音量" type="range" min="0" max="1" step="0.05" value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: 44, height: 3, accentColor: "var(--accent)", cursor: "pointer" }} />
          </div>
        </div>

        {/* Playlist toggle */}
        {songs.length > 0 && (
          <button onClick={() => setList((v) => !v)} aria-expanded={list} aria-controls="music-playlist" className="music-btn music-list-btn"
            style={{ width: "100%", padding: "6px", borderTop: "1px solid var(--border)", fontSize: 12, borderRadius: 0 }}>
            {list ? t("music.hideList") : `${t("music.playlist")} (${songs.length})`}
          </button>
        )}

        <div id="music-playlist" className={`music-playlist ${list?"is-open":""}`} aria-hidden={!list} inert={!list}>
          <div className="music-playlist-inner"><div style={{ borderTop: "1px solid var(--border)" }}>
            {songs.map((s: any, i: number) => (
              <button key={s.id} onClick={() => pickSong(i)} className="music-btn music-song-btn"
                style={{ width: "100%", textAlign: "left", padding: "6px 16px", fontSize: 12, borderRadius: 0,
                  background: i === idx ? "var(--accent-light)" : "none",
                  color: i === idx ? "#1c1917" : "var(--text-muted)" }}>
                {s.title}
              </button>
            ))}
          </div></div>
        </div>
      </div></div>

      <div className="music-dock" style={{transform:`translate3d(${-pos.x}px,${-pos.y}px,0)`}}>
      <DragButton open={open} onToggle={togglePanel} getPos={() => positionRef.current} setPos={moveTo} bounds={viewport} onDragging={setDragging} onSettle={settle} />
      </div>
    </div>
  );
}
