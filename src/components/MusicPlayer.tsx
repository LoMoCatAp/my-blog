"use client";

import { useRef, useState, useEffect } from "react";
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
function DragButton({
  open,
  onToggle,
  getPos,
  setPos,
}: {
  open: boolean;
  onToggle: () => void;
  getPos: () => { x: number; y: number };
  setPos: (p: { x: number; y: number }) => void;
}) {
  const dragRef = useRef({ moved: false, startX: 0, startY: 0, elX: 0, elY: 0, pointerId: -1 });

  return (
    <div
      onPointerDown={(e: React.PointerEvent) => {
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        const p = getPos();
        dragRef.current = {
          moved: false, startX: e.clientX, startY: e.clientY, elX: p.x, elY: p.y, pointerId: e.pointerId,
        };
      }}
      onPointerMove={(e: React.PointerEvent) => {
        // Only respond when pointer button is pressed (PC hover fix)
        if (e.buttons !== 1) return;
        if (!dragRef.current.moved &&
            (Math.abs(e.clientX - dragRef.current.startX) > 3 ||
             Math.abs(e.clientY - dragRef.current.startY) > 3)) {
          dragRef.current.moved = true;
        }
        if (dragRef.current.moved) {
          const nx = Math.max(4, dragRef.current.elX + (dragRef.current.startX - e.clientX));
          const ny = Math.max(4, dragRef.current.elY + (dragRef.current.startY - e.clientY));
          setPos({ x: nx, y: ny });
        }
      }}
      onPointerUp={() => {
        if (!dragRef.current.moved) {
          onToggle();
        }
        // Reset moved flag so next hover doesn't trigger follow
        dragRef.current.moved = false;
      }}
      className="music-float-btn"
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        background: "var(--accent)",
        color: "white",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
        userSelect: "none",
        touchAction: "none",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
      }}
    >
      {open ? (
        <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )}
    </div>
  );
}

export default function MusicPlayer() {
  const { t } = useI18n();
  const audio = useRef<HTMLAudioElement>(null);
  const songsRef = useRef<any[]>([]);
  const [songs, setSongs] = useState<any[]>([]);
  const [idx, setIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(false);
  const [mode, setMode] = useState<PlayMode>("normal");
  const [volume, setVolume] = useState(0.6);
  const progressRef = useRef(0);
  const durationRef = useRef(0);
  const currentTimeRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const updateTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pos, setPos] = useState({ x: 24, y: 24 });

  // Load songs
  useEffect(() => {
    fetch("/api/music")
      .then((r) => r.json())
      .then((d) => {
        songsRef.current = d;
        setSongs(d);
        if (d.length > 0 && idx < 0) setIdx(0);
      })
      .catch(() => {});
  }, []);

  const song = songs[idx];

  // Switch to song i and play it — used by prev / next / pickSong
  const playIndex = (i: number) => {
    setIdx(i);
    setPlaying(true);
    // Force audio src reload & play right after state update
    setTimeout(() => {
      const el = audio.current;
      if (!el || !songsRef.current[i]) return;
      el.src = `/music/${encodeURIComponent(songsRef.current[i].filename)}`;
      el.load();
      el.play().catch(() => {});
    }, 0);
  };

  // Set up audio event listeners (single effect, stable callbacks)
  useEffect(() => {
    const el = audio.current;
    if (!el) return;

    // Use refs for rapid updates, sync to React state at 1fps
    let endedHandled = false;

    const onTime = () => {
      progressRef.current = el.duration ? (el.currentTime / el.duration) * 100 : 0;
      currentTimeRef.current = el.currentTime;

      // Detect song end via time position
      if (el.duration && el.currentTime >= el.duration - 0.05 && !endedHandled) {
        endedHandled = true;
        const m = mode;
        if (m === "normal") {
          el.currentTime = 0;
          el.play().catch(() => {});
          endedHandled = false;
        } else if (m === "shuffle") {
          const total = songsRef.current.length;
          if (!total) return;
          let n: number;
          do { n = Math.floor(Math.random() * total); } while (n === idx && total > 1);
          playIndex(n);
        } else {
          playIndex((idx + 1) % Math.max(songsRef.current.length, 1));
        }
      }
      if (el.currentTime < el.duration - 0.5) {
        endedHandled = false;
      }
    };
    const onMeta = () => {
      durationRef.current = el.duration;
      setDuration(el.duration);
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
    };
  }, [mode, idx, songs.length]);

  // Sync refs → React state every second (only when card is open)
  useEffect(() => {
    if (updateTimer.current) clearInterval(updateTimer.current);
    if (!open) return;
    updateTimer.current = setInterval(() => {
      setProgress(progressRef.current);
      setCurrentTime(currentTimeRef.current);
    }, 1000);
    return () => { if (updateTimer.current) clearInterval(updateTimer.current); };
  }, [open]);

  // Volume
  useEffect(() => {
    if (!audio.current) return;
    audio.current.volume = volume;
  }, [volume]);

  const prev = () => {
    const total = songs.length;
    if (!total) return;
    playIndex((idx - 1 + total) % total);
  };

  const nextSong = () => {
    const total = songs.length;
    if (!total) return;
    if (mode === "shuffle") {
      let n: number;
      do {
        n = Math.floor(Math.random() * total);
      } while (n === idx && total > 1);
      playIndex(n);
    } else {
      playIndex((idx + 1) % total);
    }
  };

  const togglePlay = () => {
    const el = audio.current;
    if (!songs.length) return;
    if (idx < 0) {
      playIndex(0);
      return;
    }
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play().catch(() => {});
      setPlaying(true);
    }
  };

  const pickSong = (i: number) => {
    playIndex(i);
    setList(false);
  };

  const cycleMode = () => {
    setMode((m) => (m === "repeat" ? "shuffle" : m === "normal" ? "repeat" : "normal")); // single→list→shuffle
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sc = Math.floor(s % 60);
    return `${m}:${String(sc).padStart(2, "0")}`;
  };

  return (
    <div style={{ position: "fixed", right: pos.x, bottom: pos.y, zIndex: 100 }}>
      <style>{`
        .music-btn { background:none; border:none; cursor:pointer; padding:4px; }
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

        .music-float-btn:hover { transform:scale(1.08); box-shadow:0 4px 16px rgba(0,0,0,0.25); }
        .music-float-btn:active { transform:scale(0.92); }

        .music-card {
          margin-bottom:8px; width:280px; border-radius:12px;
          border:1px solid var(--border); background:var(--card);
          box-shadow:0 4px 20px rgba(0,0,0,0.15); overflow:hidden;
          transition:opacity .3s ease, transform .3s ease;
          transform-origin:bottom left;
        }
        .music-card.enter { opacity:1; transform:scale(1); pointer-events:auto; }
        .music-card.leave { opacity:0; transform:scale(0.75); pointer-events:none; }
      `}</style>

      <audio ref={audio} preload="auto" />

      {/* Player card */}
      <div className={`music-card ${open ? "enter" : "leave"}`}>
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
          <button onClick={prev} className="music-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          {/* Play/Pause */}
          <button onClick={togglePlay} className="music-toggle-btn">
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
          <button onClick={nextSong} className="music-btn">
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
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: 44, height: 3, accentColor: "var(--accent)", cursor: "pointer" }} />
          </div>
        </div>

        {/* Playlist toggle */}
        {songs.length > 0 && (
          <button onClick={() => setList((v) => !v)} className="music-btn"
            style={{ width: "100%", padding: "6px", borderTop: "1px solid var(--border)", fontSize: 12, borderRadius: 0 }}>
            {list ? t("music.hideList") : `${t("music.playlist")} (${songs.length})`}
          </button>
        )}

        {list && (
          <div style={{ borderTop: "1px solid var(--border)" }}>
            {songs.map((s: any, i: number) => (
              <button key={s.id} onClick={() => pickSong(i)} className="music-btn"
                style={{ width: "100%", textAlign: "left", padding: "6px 16px", fontSize: 12, borderRadius: 0,
                  background: i === idx ? "var(--accent-light)" : "none",
                  color: i === idx ? "var(--accent-dark)" : "var(--text-muted)" }}>
                {s.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <DragButton open={open} onToggle={() => setOpen((v) => !v)} getPos={() => pos} setPos={setPos} />
    </div>
  );
}
