"use client";
import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────
interface Stats { stamina: number; stress: number; skill: number; popularity: number; loyalty: number; }
interface GameEvent { title: string; desc: string; options: { label: string; emoji: string; effects: Record<string,number>; text: string }[]; }
interface LogEntry { day: number; slot: string; text: string; stats: Stats; }

const ACTIVITIES: { id: string; label: string; emoji: string; effects: Record<string,number> }[] = [
  { id:"vocal",     label:"声乐练习",  emoji:"🎤",  effects:{stamina:-15,stress:+8, skill:+5, popularity:+1                              } },
  { id:"dance",     label:"舞蹈练习",  emoji:"💃",  effects:{stamina:-20,stress:+10,skill:+6, popularity:+1                              } },
  { id:"gym",       label:"健身",     emoji:"💪",  effects:{stamina:-10,stress:+5, skill:+2                                              } },
  { id:"compose",   label:"创作",     emoji:"🎹",  effects:{stamina:-12,stress:+6, skill:+4, popularity:+2                              } },
  { id:"sns",       label:"SNS营业",  emoji:"📱",  effects:{stamina:-5, stress:+3,           popularity:+4, loyalty:+2                  } },
  { id:"fanmeet",   label:"粉丝见面",  emoji:"💝",  effects:{stamina:-18,stress:+12,          popularity:+6, loyalty:+5                  } },
  { id:"variety",   label:"综艺",     emoji:"📺",  effects:{stamina:-15,stress:+10,          popularity:+5, skill:+2                    } },
  { id:"showcase",  label:"打歌舞台",  emoji:"🏆",  effects:{stamina:-25,stress:+15,skill:+3, popularity:+8, loyalty:+3                  } },
  { id:"rest",      label:"休息",     emoji:"😴",  effects:{stamina:+20,stress:-10                                                     } },
  { id:"hospital",  label:"医院",     emoji:"🏥",  effects:{stamina:+10,stress:-5                                                      } },
  { id:"counsel",   label:"心理疏导",  emoji:"🧠",  effects:{stamina:+5, stress:-15,                          loyalty:+1                  } },
  { id:"collab",    label:"合作舞台",  emoji:"🎭",  effects:{stamina:-18,stress:+8, skill:+5, popularity:+6,  loyalty:+2                 } },
];

const EVENTS: GameEvent[] = [
  { title:"深夜练习室传闻", desc:"有人在匿名社区发帖说看到你深夜独自在练习室……暗示了一些不好的事情。", options:[
    { label:"发声明澄清", emoji:"📄", effects:{stress:-5, popularity:+2},      text:"公司发了声明，大部分粉丝表示理解。" },
    { label:"冷处理",    emoji:"🙅", effects:{stress:+10,popularity:-3},      text:"传闻持续发酵，路人观感下降。" },
    { label:"开直播聊聊", emoji:"📱", effects:{stress:-8, popularity:+5, loyalty:+3}, text:"你开了直播坦诚说明，粉丝觉得你很真诚。" },
  ]},
  { title:"一位候补", desc:"这次回归进入一位候补！最终结果即将公布…", options:[
    { label:"拼命拉票", emoji:"🗳️", effects:{stamina:-15,stress:+10,popularity:+8, loyalty:+2}, text:"全力拉票后拿下了第一位！" },
    { label:"随缘",    emoji:"😌", effects:{stress:-5, popularity:+2},                        text:"虽然没有拿到，但舞台收获了好评。" },
  ]},
  { title:"私生饭跟踪", desc:"有人在公司楼下等你，还拍了你的宿舍窗户。", options:[
    { label:"报警处理",  emoji:"👮", effects:{stress:-10, loyalty:+2},      text:"警方介入了，粉丝支持你的做法。" },
    { label:"发SNS劝退", emoji:"📱", effects:{stress:+5,  popularity:+2},  text:"你发了SNS，理智粉帮忙维护秩序。" },
  ]},
  { title:"季度考核", desc:"公司内部评价结果出来，理事找你谈话。", options:[
    { label:"虚心接受",  emoji:"🙇", effects:{stress:-5, skill:+3},       text:"认真听取意见后进步明显。" },
    { label:"据理力争",  emoji:"💬", effects:{stress:+10,popularity:+2},  text:"你表达了想法，理事记住了你。" },
  ]},
  { title:"综艺邀约", desc:"一档热门综艺邀请你作为固定嘉宾！", options:[
    { label:"接受邀约", emoji:"✨",   effects:{stamina:-15,stress:+10,popularity:+8, skill:+2}, text:"综艺表现亮眼，圈了不少路人粉。" },
    { label:"婉拒——太忙", emoji:"😅", effects:{stress:-5},                                    text:"婉拒了邀约，专注音乐。" },
  ]},
  { title:"身体警告", desc:"高强度练习后，身体发出了警报。", options:[
    { label:"坚持练习",  emoji:"💪", effects:{stamina:-20,stress:+10,skill:+3}, text:"咬牙坚持了，但状态更差了。" },
    { label:"去检查",   emoji:"🏥", effects:{stamina:+15,stress:-10},            text:"幸好来得早，休息几天就好了。" },
  ]},
  { title:"恶评爆发", desc:"有人在论坛上发了篇恶意帖子迅速扩散。", options:[
    { label:"正面回应", emoji:"🎯", effects:{stress:+5, popularity:+4, loyalty:+3}, text:"回应得体大方，反而赢得了尊重。" },
    { label:"无视",    emoji:"🙉", effects:{stress:-3, popularity:-2},             text:"无视处理，但有些路人信了那些话。" },
  ]},
  { title:"品牌代言", desc:"有品牌找上门来想要合作！", options:[
    { label:"签约代言", emoji:"💎", effects:{stamina:-10,stress:+8, popularity:+10, loyalty:+2}, text:"代言照出圈了，人气大涨。" },
    { label:"再考虑",   emoji:"🤔", effects:{stress:-3},                                        text:"你决定再看看其他机会。" },
  ]},
  { title:"粉丝送礼", desc:"粉丝为你准备了惊喜应援！", options:[
    { label:"暖心回应", emoji:"❤️", effects:{stress:-8, popularity:+3, loyalty:+5}, text:"你在SNS上回应了，粉丝感动落泪。" },
    { label:"低调收下", emoji:"🤫", effects:{stress:-3, popularity:+1, loyalty:+2}, text:"默默收下了心意。" },
  ]},
];

const FAMOUS = ["金泰亨","田柾国","朴智旻","金硕珍","闵玧其","郑号锡","金南俊","LISA","JENNIE","ROSÉ","JISOO","李马克","黄仁俊","李帝努","李楷灿","罗渽民","朴志晟","张元英","安宥真","KARINA","WINTER","宁艺卓","GISELLE","崔然竣","崔秀彬","崔范奎","姜太显","休宁凯","SANA","MINA","周子瑜","林娜琏","朴志效","金多贤","边伯贤","朴灿烈","金钟仁","都暻秀","吴世勋","方灿","李旻浩","徐彰彬","黄铉辰","韩知城","金昇玟","MINJI","HANNI","DANIELLE","HAERIN","HYEIN","金采源","宫脇咲良","许允真","中村一叶","洪恩採"];
const GROUPS = ["BTS","BLACKPINK","NCT DREAM","IVE","aespa","TOMORROW X TOGETHER","TWICE","EXO","SEVENTEEN","Stray Kids","ITZY","NewJeans","LE SSERAFIM","ENHYPEN","BABYMONSTER","RIIZE","ZEROBASEONE"];

const PARTICLE_COLORS = ["#a855f7","#ec4899","#eab308","#22c55e","#3b82f6","#f97316"];

function shuffle<T>(a: T[]): T[] { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]} return b; }
function pick<T>(a: T[]): T { return a[Math.floor(Math.random()*a.length)]; }
function clamp(v: number, mn=0, mx=100): number { return Math.max(mn,Math.min(mx,v)); }

// ─── Particle ─────────────────────────────────────────────────────────
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let w = c.width = window.innerWidth, h = c.height = window.innerHeight;
    const particles: {x:number;y:number;vx:number;vy:number;r:number;c:string;a:number}[] = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random()*w, y: Math.random()*h,
        vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5,
        r: Math.random()*3+1, c: pick(PARTICLE_COLORS), a: Math.random()*0.4+0.1,
      });
    }
    let anim: number;
    function draw() {
      ctx!.clearRect(0,0,w,h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx!.fillStyle = p.c;
        ctx!.globalAlpha = p.a;
        ctx!.fill();
      });
      ctx!.globalAlpha = 1;
      anim = requestAnimationFrame(draw);
    }
    draw();
    const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(anim); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}} />;
}

// ─── SVG Icons ────────────────────────────────────────────────────────
// Using only SVGs for activity buttons; games page can keep emojis
const SVGS: Record<string,()=>React.ReactNode> = {
  vocal: ()=><svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"><circle cx="14" cy="14" r="10"/><path d="M10 13c1 2 2 3.5 4 3.5s3-1.5 4-3.5"/><circle cx="10" cy="11" r="1" fill="#a855f7"/><circle cx="18" cy="11" r="1" fill="#a855f7"/></svg>,
  dance: ()=><svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round"><circle cx="14" cy="6" r="3"/><path d="M8 24l3-7 5 2 4-5"/><path d="M11 17l-3 7"/></svg>,
  gym: ()=><svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"><path d="M6 14h16M14 6v16M10 8l4-4 4 4M10 20l4 4 4-4"/><circle cx="14" cy="14" r="12" strokeDasharray="2 2"/></svg>,
  compose: ()=><svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="6" width="20" height="16" rx="3"/><line x1="9" y1="12" x2="19" y2="12"/><line x1="9" y1="16" x2="16" y2="16"/><line x1="9" y1="20" x2="13" y2="20"/></svg>,
  sns: ()=><svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="4" width="20" height="20" rx="4"/><circle cx="14" cy="14" r="5"/><circle cx="21" cy="7" r="1.5" fill="#3b82f6"/></svg>,
  fanmeet: ()=><svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round"><path d="M8 16c1 1.5 3 3 6 3s5-1.5 6-3"/><circle cx="8" cy="10" r="2.5"/><circle cx="14" cy="8" r="3"/><circle cx="20" cy="10" r="2.5"/><path d="M4 24c1-2 4-4 10-4s9 2 10 4"/></svg>,
  variety: ()=><svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="6" width="22" height="16" rx="3"/><polyline points="9,12 12,14 9,16"/><line x1="15" y1="15" x2="19" y2="15"/></svg>,
  showcase: ()=><svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round"><circle cx="14" cy="10" r="7"/><path d="M10 22l4-5 4 5"/><path d="M5 14l9-4 9 4"/></svg>,
  rest: ()=><svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"><path d="M8 14c0-4 2-8 6-8s6 4 6 8"/><path d="M6 14h16"/><path d="M10 18c1 1 2.5 2 4 2s3-1 4-2"/></svg>,
  hospital: ()=><svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"><rect x="6" y="3" width="16" height="22" rx="3"/><line x1="14" y1="9" x2="14" y2="17"/><line x1="10" y1="13" x2="18" y2="13"/></svg>,
  counsel: ()=><svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"><circle cx="10" cy="11" r="4"/><circle cx="18" cy="13" r="3"/><path d="M5 22c1-3 3-5 5-5s4 2 5 5"/><path d="M13 20c1-2 3-3 5-3s4 1 5 3"/></svg>,
  collab: ()=><svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="9" r="4"/><circle cx="19" cy="9" r="4"/><path d="M9 13a8 8 0 0 0-5 7"/><path d="M19 13a8 8 0 0 1 5 7"/><path d="M14 15c-2 0-4 2-5 5"/></svg>,
};

export default function IdolSimulator() {
  const [phase, setPhase] = useState("create");
  const [charName, setCharName] = useState("");
  const [charGroup, setCharGroup] = useState("");
  const [customName, setCustomName] = useState("");
  const [useFamous, setUseFamous] = useState(true);
  const [names, setNames] = useState(() => shuffle(FAMOUS));
  const [nameIdx, setNameIdx] = useState(0);
  const [stats, setStats] = useState<Stats>({stamina:100,stress:0,skill:20,popularity:10,loyalty:5});
  const [day, setDay] = useState(1);
  const [slot, setSlot] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [msg, setMsg] = useState("");
  const [showEnd, setShowEnd] = useState(false);
  const [flash, setFlash] = useState<string|null>(null);
  const [combo, setCombo] = useState(0);
  const [eventFlash, setEventFlash] = useState(false);

  const slotLabel = ["上午","下午","晚上"][slot];
  const isNight = slot === 2;
  const stressBlink = stats.stress > 75;

  useEffect(() => {
    if (phase === "create") {
      setNames(shuffle(FAMOUS));
      setNameIdx(0);
    }
  }, [phase]);

  function advance() {
    if (slot >= 2) {
      if (day >= 28) { setTimeout(() => setShowEnd(true), 500); }
      setSlot(0);
      setDay(d => d + 1);
    } else {
      setSlot(s => s + 1);
    }
  }

  function apply(effects: Record<string,number>, text: string) {
    const updated: Stats = {
      stamina: clamp(stats.stamina + (effects.stamina || 0)),
      stress: clamp(stats.stress + (effects.stress || 0)),
      skill: clamp(stats.skill + (effects.skill || 0)),
      popularity: clamp(stats.popularity + (effects.popularity || 0)),
      loyalty: clamp(stats.loyalty + (effects.loyalty || 0)),
    };
    setStats(updated);
    setMsg(text);
    setLog(prev => [...prev, {day,slot:slotLabel,text,stats:updated}]);

    // Flash effects for specific stat changes
    const flashParts: string[] = [];
    if ((effects.stamina||0) < 0) flashParts.push("stamina");
    if ((effects.stress||0) > 0) flashParts.push("stress");
    if ((effects.popularity||0) > 0) flashParts.push("popularity");
    if ((effects.skill||0) > 0) flashParts.push("skill");
    if (flashParts.length) setFlash(flashParts[0]);
    setTimeout(() => setFlash(null), 600);

    // Game over check
    if (updated.stamina <= 0 || updated.stress >= 100) {
      setTimeout(() => setShowEnd(true), 800);
    }
  }

  function doActivity(a: typeof ACTIVITIES[0]) {
    if (showEnd) return;
    setCombo(c => Math.min(c + 1, 10));
    if (Math.random() < 0.25) {
      setCurrentEvent(pick(EVENTS));
      setEventFlash(true);
      setTimeout(() => setEventFlash(false), 300);
      return;
    }
    apply(a.effects, a.label);
    advance();
  }

  function handleEvent(i: number) {
    if (!currentEvent) return;
    const opt = currentEvent.options[i];
    apply(opt.effects, currentEvent.title + "：\n" + opt.text);
    setCurrentEvent(null);
    advance();
  }

  function startGame() {
    let name = customName.trim() || "未知练习生";
    if (useFamous) name = names[nameIdx % names.length];
    setCharName(name);
    setCharGroup(pick(GROUPS));
    setStats({stamina:100,stress:0,skill:20,popularity:10,loyalty:5});
    setDay(1); setSlot(0); setLog([]); setCurrentEvent(null); setMsg(""); setShowEnd(false); setCombo(0);
    setPhase("play");
  }

  const ending = useMemo(() => {
    const s=stats;
    if (s.stress>=90||s.stamina<=10) return {title:"崩溃退队",desc:"压力压垮了一切。你选择了离开。",c:"#ef4444"};
    if (s.popularity>=80&&s.skill>=60) return {title:"大赏新人",desc:"你成为年度最耀眼的新人。荣耀加身，未来可期。",c:"#eab308"};
    if (s.popularity>=60&&s.stress<50) return {title:"稳扎稳打",desc:"一步一个脚印。或许不是最耀眼的，但路走得很稳。",c:"#22c55e"};
    if (s.stress>=70) return {title:"陷入瓶颈",desc:"压力太大，状态下滑。需要停下来喘口气。",c:"#f97316"};
    if (s.popularity>=50&&s.loyalty<=20) return {title:"黑红争议",desc:"有人气但有争议。爱与恨都同样响亮。",c:"#a855f7"};
    if (s.skill>=60&&s.popularity<30) return {title:"实力派",desc:"实力超群但不为人知。等待一个爆发的机会。",c:"#3b82f6"};
    return {title:"平凡毕业",desc:"没有大风大浪没有闪耀时刻。但坚持本身就是胜利。",c:"#64748b"};
  },[stats]);

  // ── Styling ──
  const isDark = true; // Always dark theme for idol simulator, full-screen
  const tc = (alpha: string) => `rgba(255,255,255,${alpha})`;

  const btnStyle: React.CSSProperties = {
    width:"100%",padding:"12px 0",borderRadius:12,textAlign:"center",
    background:"linear-gradient(135deg,#a855f7,#ec4899)",color:"#fff",
    fontSize:14,fontWeight:600,cursor:"pointer",border:"none",outline:"none",
    opacity:(useFamous||customName.trim())?1:0.4,
    transition:"opacity 0.2s, transform 0.15s",
  };

  // ── Create ──
  if (phase === "create") return (
    <div style={{position:"fixed",inset:0,overflow:"auto",background:"linear-gradient(135deg,#0a0a1a,#1a0a2e,#2d1b4e,#1a1a3e)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}}>
      <Particles />
      <div style={{maxWidth:400,width:"100%",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(24px)",borderRadius:24,padding:32,margin:16,border:"1px solid rgba(255,255,255,0.12)",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:48,marginBottom:8}}>
            <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"><circle cx="24" cy="24" r="20"/><path d="M16 30c2 2.5 5 4 8 4s6-1.5 8-4"/><circle cx="16" cy="19" r="2.5" fill="#a855f7"/><circle cx="32" cy="19" r="2.5" fill="#a855f7"/><path d="M20 14c2-2 6-2 8 0"/></svg>
          </div>
          <div style={{fontSize:22,fontWeight:700,color:"#fff"}}>IDOL SIMULATOR</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:4}}>韩娱爱豆生活模拟器</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:6}}>身份</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setUseFamous(true)}
                style={{flex:1,padding:"8px 0",borderRadius:12,fontSize:12,fontWeight:600,cursor:"pointer",border:"1px solid transparent",
                  background:useFamous?"rgba(168,85,247,0.35)":"rgba(255,255,255,0.05)",
                  color:useFamous?"#fff":"rgba(255,255,255,0.5)",transition:"all 0.2s"}}>
                🎲 随机爱豆
              </button>
              <button onClick={()=>setUseFamous(false)}
                style={{flex:1,padding:"8px 0",borderRadius:12,fontSize:12,fontWeight:600,cursor:"pointer",border:"1px solid transparent",
                  background:useFamous?"rgba(255,255,255,0.05)":"rgba(168,85,247,0.35)",
                  color:useFamous?"rgba(255,255,255,0.5)":"#fff",transition:"all 0.2s"}}>
                ✏️ 自定义
              </button>
            </div>
          </div>
          {useFamous ? (
            <div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:6}}>随机爱豆</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <div style={{flex:1,padding:"10px 16px",borderRadius:12,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",fontSize:16,fontWeight:700,color:"#fff",textAlign:"center"}}>{names[nameIdx%names.length]}</div>
                <button onClick={()=>setNameIdx(i=>i+1)}
                  style={{padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:16,color:"#fff"}}>▶️</button>
                <button onClick={()=>{setNames(shuffle(FAMOUS));setNameIdx(0)}}
                  style={{padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:16,color:"#fff"}}>🔀</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:6}}>艺名</div>
              <input value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="输入你的艺名…" maxLength={20}
                style={{width:"100%",padding:"10px 16px",borderRadius:12,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",fontSize:14,color:"#fff",outline:"none",boxSizing:"border-box"}} />
            </div>
          )}
          <button onClick={startGame} style={btnStyle}>✨ 开始偶像生涯</button>
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",textAlign:"center",marginTop:16}}>28 天 · 活下来 · 闪耀吧</div>
      </div>
    </div>
  );

  // ── End ──
  if (showEnd) return (
    <div style={{position:"fixed",inset:0,overflow:"auto",background:"linear-gradient(135deg,#0a0a1a,#1a0a2e,#0d0d2b)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}}>
      <Particles />
      <div style={{maxWidth:400,width:"100%",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(24px)",borderRadius:24,padding:32,margin:16,border:"1px solid rgba(255,255,255,0.12)",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:8}}>🎬</div>
          <div style={{fontSize:20,fontWeight:700,color:"#fff"}}>偶像生涯结局</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginTop:4}}>{charName} · {charGroup}</div>
        </div>
        <div style={{fontSize:22,fontWeight:800,textAlign:"center",color:ending.c,marginBottom:8,borderBottom:`2px solid ${ending.c}40`,paddingBottom:12,display:"inline-block",width:"100%"}}>{ending.title}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",textAlign:"center",marginBottom:24,marginTop:12,lineHeight:1.6}}>{ending.desc}</div>
        <div style={{background:"rgba(255,255,255,0.05)",borderRadius:16,padding:16,marginBottom:24}}>
          {[
            {l:"最终实力",v:stats.skill,c:"#3b82f6"},
            {l:"最高人气",v:stats.popularity,c:"#eab308"},
            {l:"粉丝忠诚度",v:stats.loyalty,c:"#ec4899"},
            {l:"体力余量",v:stats.stamina,c:"#22c55e"},
            {l:"最终压力",v:stats.stress,c:"#ef4444"},
          ].map((x,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,padding:"5px 0"}}>
              <span style={{color:"rgba(255,255,255,0.4)"}}>{x.l}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:60,height:4,borderRadius:2,background:"rgba(255,255,255,0.1)",overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:2,background:x.c,width:Math.min(x.v,100)+"%"}} />
                </div>
                <span style={{color:"#fff",fontWeight:700,width:24,textAlign:"right"}}>{x.v}</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={()=>setPhase("create")}
          style={{width:"100%",padding:"12px 0",borderRadius:12,border:"none",textAlign:"center",background:"linear-gradient(135deg,#a855f7,#ec4899)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>🔄 再来一次</button>
      </div>
    </div>
  );

  // ── Play ──
  const bg = isNight
    ? "linear-gradient(180deg,#0f0c29,#1a1040,#24243e,#0a0a1a)"
    : "linear-gradient(135deg,#1a0a2e,#2d1b4e,#1a1a3e,#0d0d2b)";

  return (
    <div style={{position:"fixed",inset:0,overflow:"auto",background:bg,zIndex:9999}}>
      <Particles />
      {stressBlink && <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,background:"radial-gradient(ellipse at center,rgba(255,0,0,0.12),transparent 60%)",animation:"pulseRed 1s ease-in-out infinite"}} />}
      {eventFlash && <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,background:"radial-gradient(ellipse at center,rgba(168,85,247,0.15),transparent 60%)",animation:"pulseEvent 0.3s ease-out"}} />}

      <div style={{maxWidth:420,margin:"0 auto",padding:"16px 16px 32px",position:"relative",zIndex:2}}>
        {/* Back */}
        <a href="/games" style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:12,color:"rgba(255,255,255,0.4)",textDecoration:"none",marginBottom:8,padding:"4px 10px",borderRadius:8,background:"rgba(255,255,255,0.05)"}}>← 返回小游戏</a>

        {/* Status card */}
        <div style={{borderRadius:20,padding:20,background:"rgba(255,255,255,0.06)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.08)",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,#a855f7,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 15c1 1.5 2.5 2.5 4 2.5s3-1 4-2.5"/><circle cx="9" cy="10" r="1.5" fill="#fff"/><circle cx="15" cy="10" r="1.5" fill="#fff"/></svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{charName}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{charGroup}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>Day {day}/28</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontWeight:600}}>{slotLabel}</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            {[
              ["体力", stats.stamina, "#22c55e", false],
              ["压力", stats.stress, "#ef4444", true],
              ["实力", stats.skill, "#3b82f6", false],
              ["人气", stats.popularity, "#eab308", false],
              ["忠诚度", stats.loyalty, "#ec4899", false],
            ].map((x:any,i)=>{
              const pct = x[3] ? 100-x[1] : x[1];
              const isFlash = flash === ["stamina","stress","skill","popularity","loyalty"][i];
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}>
                  <span style={{width:48,color:"rgba(255,255,255,0.4)",whiteSpace:"nowrap"}}>{x[0]}</span>
                  <div style={{flex:1,height:7,borderRadius:4,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:4,background:x[2],width:pct+"%",transition:"width 0.5s ease",opacity:isFlash?0.6:1}} />
                  </div>
                  <span style={{width:22,textAlign:"right",color:isFlash?x[2]:"rgba(255,255,255,0.5)",fontWeight:isFlash?700:600,transition:"all 0.3s"}}>{x[1]}</span>
                </div>
              );
            })}
          </div>
          {combo >= 3 && (
            <div style={{textAlign:"center",marginTop:8,fontSize:11,color:"#eab308",fontWeight:600,animation:"fadeIn 0.3s"}}>
              🔥 {combo} 连击！保持状态
            </div>
          )}
        </div>

        {/* Message */}
        {msg && (
          <div style={{borderRadius:12,padding:"10px 14px",background:"rgba(255,255,255,0.06)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.08)",marginBottom:12,fontSize:13,color:"rgba(255,255,255,0.85)",whiteSpace:"pre-line",animation:"fadeSlide 0.3s ease-out",lineHeight:1.5}}>
            {msg}
          </div>
        )}

        {/* Event */}
        {currentEvent ? (
          <div style={{borderRadius:20,padding:20,background:"rgba(255,255,255,0.06)",backdropFilter:"blur(16px)",border:"1px solid rgba(168,85,247,0.3)",animation:"fadeSlide 0.3s ease-out"}}>
            <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><line x1="10" y1="6" x2="10" y2="10"/><line x1="10" y1="13" x2="10.01" y2="13"/></svg>
              {currentEvent.title}
            </div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:16,lineHeight:1.6}}>{currentEvent.desc}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {currentEvent.options.map((o,i)=>(
                <button key={i} onClick={()=>handleEvent(i)}
                  style={{width:"100%",padding:"10px 14px",borderRadius:12,border:"1px solid rgba(255,255,255,0.1)",fontSize:12,color:"#fff",cursor:"pointer",background:"rgba(255,255,255,0.05)",textAlign:"left",transition:"all 0.15s",display:"flex",alignItems:"center",gap:6}}
                  onMouseEnter={e=>(e.currentTarget.style.background="rgba(168,85,247,0.2)")}
                  onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.05)")}>
                  <span>{o.emoji}</span>
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Activities grid */
          <div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:8,marginLeft:4,display:"flex",alignItems:"center",gap:4}}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><polyline points="8,4 8,8 11,10"/></svg>
              {slotLabel}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {ACTIVITIES.map(a=>{
                const SvgIcon = SVGS[a.id];
                return (
                  <button key={a.id} onClick={()=>doActivity(a)}
                    style={{borderRadius:14,padding:"12px 4px",border:"1px solid rgba(255,255,255,0.08)",cursor:"pointer",background:"rgba(255,255,255,0.03)",backdropFilter:"blur(8px)",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.transform="scale(1.05)";e.currentTarget.style.borderColor="rgba(168,85,247,0.3)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.transform="scale(1)";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";}}>
                    <SvgIcon />
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",lineHeight:1.2}}>{a.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Log */}
        {log.length > 0 && (
          <div style={{marginTop:16}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:6,marginLeft:4}}>📜 日志</div>
            <div style={{maxHeight:130,overflowY:"auto",display:"flex",flexDirection:"column",gap:3,paddingRight:4}}>
              {log.slice(-10).reverse().map((h,i)=>(
                <div key={i} style={{borderRadius:8,padding:"5px 10px",background:"rgba(255,255,255,0.03)",fontSize:11,color:"rgba(255,255,255,0.4)",display:"flex",gap:8,alignItems:"center",animation:"fadeSlide 0.2s ease-out"}}>
                  <span style={{opacity:0.4,whiteSpace:"nowrap",width:44}}>D{h.day}</span>
                  <span style={{opacity:0.6,width:28}}>{h.slot}</span>
                  <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{h.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulseRed { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        @keyframes pulseEvent { 0% { opacity:0; } 50% { opacity:1; } 100% { opacity:0; } }
        @keyframes fadeSlide { 0% { opacity:0; transform:translateY(6px); } 100% { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { 0% { opacity:0; } 100% { opacity:1; } }
      `}</style>
    </div>
  );
}
