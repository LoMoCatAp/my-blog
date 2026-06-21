"use client";
import { useState, useCallback, useEffect, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────
interface Stats { stamina: number; stress: number; skill: number; popularity: number; loyalty: number; }
interface Activity { id: string; label: string; emoji: string; effects: Partial<Stats>; }
interface GameEvent { title: string; desc: string; options: { label: string; effects: Record<string,number>; text: string }[]; }
interface HistoryEntry { day: number; slot: string; text: string; stats: Stats; }

const ACTIVITIES: Activity[] = [
  { id:"vocal", label:"声乐练习", emoji:"🎤", effects:{stamina:-15,stress:+8,skill:+5,popularity:+1} },
  { id:"dance", label:"舞蹈练习", emoji:"💃", effects:{stamina:-20,stress:+10,skill:+6,popularity:+1} },
  { id:"gym", label:"健身", emoji:"💪", effects:{stamina:-10,stress:+5,skill:+2} },
  { id:"compose", label:"自作曲创作", emoji:"🎹", effects:{stamina:-12,stress:+6,skill:+4,popularity:+2} },
  { id:"language", label:"语言学习", emoji:"📖", effects:{stamina:-8,stress:+4,skill:+3} },
  { id:"sns", label:"SNS营业", emoji:"📱", effects:{stamina:-5,stress:+3,popularity:+4,loyalty:+2} },
  { id:"fanmeet", label:"粉丝见面会", emoji:"💝", effects:{stamina:-18,stress:+12,popularity:+6,loyalty:+5} },
  { id:"variety", label:"综艺录制", emoji:"📺", effects:{stamina:-15,stress:+10,popularity:+5,skill:+2} },
  { id:"musicbank", label:"打歌舞台", emoji:"🏆", effects:{stamina:-25,stress:+15,popularity:+8,skill:+3,loyalty:+3} },
  { id:"rest", label:"休息", emoji:"😴", effects:{stamina:+20,stress:-10} },
  { id:"hospital", label:"医院检查", emoji:"🏥", effects:{stamina:+10,stress:-5} },
  { id:"counsel", label:"心理咨询", emoji:"🧠", effects:{stamina:+5,stress:-15,loyalty:+1} },
];

const EVENTS: GameEvent[] = [
  { title:"深夜练习室传闻", desc:"有人在匿名社区发帖说看到你深夜独自在练习室……暗示了一些不好的事情。", options:[
    { label:"📄 发声明澄清", effects:{stress:-5,popularity:+2}, text:"公司发了声明，大部分粉丝表示理解。" },
    { label:"🙅 冷处理不回应", effects:{stress:+10,popularity:-3}, text:"传闻持续发酵，路人观感下降。" },
    { label:"📱 开直播坦诚聊", effects:{stress:-8,popularity:+5,loyalty:+3}, text:"你开了直播坦诚说明，粉丝觉得你很真诚。" },
  ]},
  { title:"一位候补", desc:"这次回归进入打歌节目一位候补！最终结果即将公布。", options:[
    { label:"🗳️ 拼命拉票", effects:{stamina:-15,stress:+10,popularity:+8,loyalty:+2}, text:"全力拉票后拿下了第一位！" },
    { label:"😌 随缘心态", effects:{stress:-5,popularity:+2}, text:"虽然没有拿到，但舞台收获了好评。" },
  ]},
  { title:"私生饭跟踪", desc:"有人在公司楼下等你，还拍了你的宿舍窗户。", options:[
    { label:"👮 报警处理", effects:{stress:-10,loyalty:+2}, text:"警方介入了，粉丝支持你的做法。" },
    { label:"📱 发SNS劝退", effects:{stress:+5,popularity:+2}, text:"你发了SNS，理智粉帮忙维护秩序。" },
  ]},
  { title:"公司内部评价", desc:"季度考核结果出来，理事找你谈话。", options:[
    { label:"🙇 虚心接受", effects:{stress:-5,skill:+3}, text:"认真听取意见后进步明显。" },
    { label:"💬 据理力争", effects:{stress:+10,popularity:+2}, text:"你表达了想法，理事记住了你。" },
  ]},
  { title:"综艺邀约", desc:"一档热门综艺邀请你作为固定嘉宾！", options:[
    { label:"✨ 接受邀约", effects:{stamina:-15,stress:+10,popularity:+8,skill:+2}, text:"综艺表现亮眼，圈了不少路人粉。" },
    { label:"😅 婉拒——太忙了", effects:{stress:-5}, text:"婉拒了邀约，专注音乐。" },
  ]},
  { title:"受伤风险", desc:"高强度练习后，身体发出了警告信号。", options:[
    { label:"💪 坚持练习", effects:{stamina:-20,stress:+10,skill:+3}, text:"咬牙坚持了，但状态更差了。" },
    { label:"🏥 去检查休息", effects:{stamina:+15,stress:-10}, text:"幸好来得早，休息几天就好了。" },
  ]},
  { title:"恶评爆发", desc:"有人在论坛上发了篇恶意帖子迅速扩散。", options:[
    { label:"🎯 正面回应", effects:{stress:+5,popularity:+4,loyalty:+3}, text:"回应得体大方，反而赢得了尊重。" },
    { label:"🙉 无视", effects:{stress:-3,popularity:-2}, text:"无视处理，但有些路人信了那些话。" },
  ]},
];

const FAMOUS = ["金泰亨","田柾国","朴智旻","金硕珍","闵玧其","郑号锡","金南俊","LISA","JENNIE","ROSÉ","JISOO","李马克","黄仁俊","李帝努","李楷灿","罗渽民","钟辰乐","朴志晟","张元英","安宥真","李瑞","KARINA","WINTER","宁艺卓","GISELLE","崔然竣","崔秀彬","崔范奎","姜太显","休宁凯","SANA","MINA","周子瑜","林娜琏","朴志效","俞定延","金多贤","孙彩瑛","边伯贤","朴灿烈","金钟仁","都暻秀","吴世勋","方灿","李旻浩","徐彰彬","黄铉辰","韩知城","金昇玟","MINJI","HANNI","DANIELLE","HAERIN","HYEIN","金采源","宫脇咲良","许允真","中村一叶","洪恩採"];
const GROUPS = ["BTS","BLACKPINK","NCT DREAM","IVE","aespa","TOMORROW X TOGETHER","TWICE","EXO","SEVENTEEN","Stray Kids","ITZY","NewJeans","LE SSERAFIM","ENHYPEN"];

function shuffle<T>(a: T[]): T[] { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]} return b; }
function pick<T>(a: T[]): T { return a[Math.floor(Math.random()*a.length)]; }
function clamp(v: number, mn=0, mx=100): number { return Math.max(mn,Math.min(mx,v)); }

// ─── Main ─────────────────────────────────────────────────────────────
export default function IdolSimulator() {
  const [phase, setPhase] = useState("create");
  const [charName, setCharName] = useState("");
  const [charGroup, setCharGroup] = useState("");
  const [customName, setCustomName] = useState("");
  const [useFamous, setUseFamous] = useState(false);
  const [names, setNames] = useState(() => shuffle(FAMOUS));
  const [nameIdx, setNameIdx] = useState(0);
  const [stats, setStats] = useState({stamina:100,stress:0,skill:20,popularity:10,loyalty:5});
  const [day, setDay] = useState(1);
  const [slot, setSlot] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [msg, setMsg] = useState("");
  const [showEnd, setShowEnd] = useState(false);

  const slotLabel = ["上午","下午","晚上"][slot];
  const isNight = slot === 2;
  const stressBlink = stats.stress > 80;

  function advance() {
    if (slot >= 2) {
      setSlot(0);
      if (day >= 28) { setTimeout(() => setShowEnd(true), 300); }
      setDay(d => d + 1);
    } else {
      setSlot(s => s + 1);
    }
  }

  function apply(effects: Record<string,number>, text: string) {
    setStats(prev => ({
      stamina: clamp(prev.stamina + (effects.stamina || 0)),
      stress: clamp(prev.stress + (effects.stress || 0)),
      skill: clamp(prev.skill + (effects.skill || 0)),
      popularity: clamp(prev.popularity + (effects.popularity || 0)),
      loyalty: clamp(prev.loyalty + (effects.loyalty || 0)),
    }));
    setMsg(text);
    const n = {...stats};
    history.push({day,slot:slotLabel,text,stats:n});
    if ((stats.stamina + (effects.stamina||0)) <= 0 || (stats.stress + (effects.stress||0)) >= 100) {
      setTimeout(() => setShowEnd(true), 500);
    }
  }

  function doActivity(activity: Activity) {
    if (showEnd) return;
    if (Math.random() < 0.2 && EVENTS.length) {
      setCurrentEvent(pick(EVENTS));
      return;
    }
    apply(activity.effects, activity.emoji + " " + activity.label);
    advance();
  }

  function handleEvent(i: number) {
    if (!currentEvent) return;
    const opt = currentEvent.options[i];
    apply(opt.effects, currentEvent.title + "\n" + opt.text);
    setCurrentEvent(null);
    advance();
  }

  function startGame() {
    let name = customName.trim() || "未知练习生";
    if (useFamous) name = names[nameIdx % names.length];
    setCharName(name);
    setCharGroup(pick(GROUPS));
    setStats({stamina:100,stress:0,skill:20,popularity:10,loyalty:5});
    setDay(1); setSlot(0); setHistory([]); setCurrentEvent(null); setMsg(""); setShowEnd(false);
    setPhase("play");
  }

  const ending = useMemo(() => {
    const s=stats;
    if (s.stress>=90||s.stamina<=10) return {title:"崩溃退队",desc:"压力压垮了一切。你选择了离开。",c:"#ef4444",e:"😢"};
    if (s.popularity>=80&&s.skill>=60) return {title:"大赏新人",desc:"你成为年度最耀眼的新人。荣耀加身，未来可期。",c:"#eab308",e:"🏆"};
    if (s.popularity>=60&&s.stress<50) return {title:"稳扎稳打",desc:"一步一个脚印。或许不是最耀眼的，但路走得很稳。",c:"#22c55e",e:"📈"};
    if (s.stress>=70) return {title:"陷入瓶颈",desc:"压力太大，状态下滑。需要停下来喘口气。",c:"#f97316",e:"😔"};
    if (s.popularity>=50&&s.loyalty<=20) return {title:"黑红争议",desc:"有人气但有争议。爱与恨都同样响亮。",c:"#a855f7",e:"🔥"};
    return {title:"平凡毕业",desc:"没有大风大浪没有闪耀时刻。但坚持本身就是胜利。",c:"#3b82f6",e:"📄"};
  },[stats]);

  // ── Styles ──
  const s = (light: string, dark?: string) => isNight ? (dark||light) : light;
  const c = { white:"#fff", text: s("#1a1a2e","#fff"), text2: s("rgba(0,0,0,0.5)","rgba(255,255,255,0.5)"), text3: s("rgba(0,0,0,0.4)","rgba(255,255,255,0.4)"), card: s("rgba(255,255,255,0.7)","rgba(255,255,255,0.08)"), border: s("rgba(0,0,0,0.06)","rgba(255,255,255,0.1)"), bar: s("rgba(0,0,0,0.06)","rgba(255,255,255,0.08)"), btn: s("rgba(255,255,255,0.5)","rgba(255,255,255,0.05)"), log: s("rgba(0,0,0,0.03)","rgba(255,255,255,0.05)") };

  // ── Create ──
  if (phase === "create") return (
    <div style={{minHeight:"100dvh",background:"linear-gradient(135deg,#1a0a2e,#2d1b4e,#1a1a3e,#0d0d2b)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{maxWidth:400,width:"100%",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(24px)",borderRadius:24,padding:32,border:"1px solid rgba(255,255,255,0.12)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:48,marginBottom:8}}>🌟</div>
          <div style={{fontSize:22,fontWeight:700,color:"#fff"}}>IDOL SIMULATOR</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:4}}>韩娱爱豆生活模拟器</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:6}}>选择身份</div>
            <div style={{display:"flex",gap:8}}>
              <div onClick={()=>setUseFamous(false)} style={{flex:1,padding:"8px 0",borderRadius:12,textAlign:"center",fontSize:12,fontWeight:600,cursor:"pointer",background:useFamous?"rgba(255,255,255,0.08)":"rgba(168,85,247,0.6)",color:useFamous?"rgba(255,255,255,0.6)":"#fff"}}>自定义</div>
              <div onClick={()=>setUseFamous(true)} style={{flex:1,padding:"8px 0",borderRadius:12,textAlign:"center",fontSize:12,fontWeight:600,cursor:"pointer",background:useFamous?"rgba(168,85,247,0.6)":"rgba(255,255,255,0.08)",color:useFamous?"#fff":"rgba(255,255,255,0.6)"}}>知名爱豆</div>
            </div>
          </div>
          {useFamous ? (
            <div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:6}}>随机爱豆</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <div style={{flex:1,padding:"10px 16px",borderRadius:12,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",fontSize:14,color:"#fff",textAlign:"center"}}>{names[nameIdx%names.length]}</div>
                <div onClick={()=>setNameIdx(i=>i+1)} style={{padding:"10px",borderRadius:12,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:14}}>▶️</div>
                <div onClick={()=>{setNames(shuffle(FAMOUS));setNameIdx(0)}} style={{padding:"10px",borderRadius:12,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:14}}>🔀</div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:6}}>艺名</div>
              <input value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="输入你的艺名…" maxLength={20} style={{width:"100%",padding:"10px 16px",borderRadius:12,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",fontSize:14,color:"#fff",outline:"none",boxSizing:"border-box"}} />
            </div>
          )}
          <div onClick={startGame} style={{width:"100%",padding:"12px 0",borderRadius:12,textAlign:"center",background:"linear-gradient(135deg,#a855f7,#ec4899)",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",opacity:(useFamous||customName.trim())?1:0.4}}>✨ 开始偶像生涯</div>
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",textAlign:"center",marginTop:16}}>28 天 · 活下来 · 闪耀吧</div>
      </div>
    </div>
  );

  // ── End ──
  if (showEnd) return (
    <div style={{minHeight:"100dvh",background:"linear-gradient(135deg,#0a0a1a,#1a0a2e,#0d0d2b)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{maxWidth:400,width:"100%",background:"rgba(255,255,255,0.08)",backdropFilter:"blur(24px)",borderRadius:24,padding:32,border:"1px solid rgba(255,255,255,0.12)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:40,marginBottom:8}}>🎬</div>
          <div style={{fontSize:20,fontWeight:700,color:"#fff"}}>偶像生涯结局</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginTop:4}}>{charName} · {charGroup}</div>
        </div>
        <div style={{fontSize:20,fontWeight:700,textAlign:"center",color:ending.c,marginBottom:8}}>{ending.e} {ending.title}</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",textAlign:"center",marginBottom:24}}>{ending.desc}</div>
        <div style={{background:"rgba(255,255,255,0.05)",borderRadius:16,padding:16,marginBottom:24}}>
          {[{l:"最终实力",v:stats.skill},{l:"最高人气",v:stats.popularity},{l:"粉丝忠诚度",v:stats.loyalty},{l:"压力峰值",v:Math.min(100,history.reduce((m,h)=>Math.max(m,h.stats.stress),0))}].map((x,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"4px 0"}}><span style={{color:"rgba(255,255,255,0.4)"}}>{x.l}</span><span style={{color:"#fff",fontWeight:700}}>{x.v}</span></div>
          ))}
        </div>
        <div onClick={()=>setPhase("create")} style={{width:"100%",padding:"12px 0",borderRadius:12,textAlign:"center",background:"linear-gradient(135deg,#a855f7,#ec4899)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>🔄 再来一次</div>
      </div>
    </div>
  );

  // ── Play ──
  const bg = isNight ? "linear-gradient(180deg,#0f0c29,#1a1040,#24243e,#0a0a1a)" : "linear-gradient(135deg,#f8e8ff,#e8d5f5,#fce4ec,#f0e6ff)";
  return (
    <div style={{minHeight:"100dvh",background:bg,padding:"16px 16px 32px",position:"relative",overflow:"hidden"}}>
      {stressBlink && <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,background:"radial-gradient(ellipse at center,rgba(255,0,0,0.08),transparent 60%)"}} />}
      <a href="/games" style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:12,color:c.text3,textDecoration:"none",marginBottom:8,padding:"4px 10px",borderRadius:8,background:c.log}}>← 返回</a>
      <div style={{maxWidth:420,margin:"0 auto",position:"relative",zIndex:2}}>
        {/* Status */}
        <div style={{borderRadius:20,padding:20,background:c.card,backdropFilter:"blur(16px)",border:"1px solid " + c.border,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,#a855f7,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🎤</div>
            <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700,color:c.text}}>{charName}</div><div style={{fontSize:11,color:c.text2}}>{charGroup}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:11,color:c.text2}}>Day {day}/28</div><div style={{fontSize:11,color:c.text2}}>{slotLabel}</div></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {[
              ["❤️ 体力",stats.stamina,"#22c55e",false],
              ["💢 压力",stats.stress,"#ef4444",true],
              ["⭐ 实力",stats.skill,"#3b82f6",false],
              ["🔥 人气",stats.popularity,"#eab308",false],
              ["💎 忠诚度",stats.loyalty,"#ec4899",false],
            ].map((x: any,i)=>{
              const pct = x[3] ? 100-x[1] : x[1];
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}>
                  <span style={{width:70,color:c.text2,whiteSpace:"nowrap"}}>{x[0]}</span>
                  <div style={{flex:1,height:8,borderRadius:4,background:c.bar,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:4,background:x[2],width:pct+"%",transition:"width 0.5s ease"}} />
                  </div>
                  <span style={{width:24,textAlign:"right",color:c.text2,fontWeight:600}}>{x[1]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message */}
        {msg && <div style={{borderRadius:12,padding:"10px 14px",background:c.card,backdropFilter:"blur(16px)",border:"1px solid " + c.border,marginBottom:12,fontSize:13,color:c.text,whiteSpace:"pre-line"}}>{msg}</div>}

        {/* Event or Activities */}
        {currentEvent ? (
          <div style={{borderRadius:20,padding:20,background:c.card,backdropFilter:"blur(16px)",border:"1px solid " + c.border}}>
            <div style={{fontSize:15,fontWeight:700,color:c.text,marginBottom:8}}>📰 {currentEvent.title}</div>
            <div style={{fontSize:12,color:c.text2,marginBottom:16,lineHeight:1.6}}>{currentEvent.desc}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {currentEvent.options.map((o,i)=>(
                <div key={i} onClick={()=>handleEvent(i)} style={{width:"100%",padding:"10px 14px",borderRadius:12,border:"1px solid " + c.border,fontSize:12,color:c.text,cursor:"pointer",background:c.btn,textAlign:"left"}}>{o.label}</div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div style={{fontSize:11,color:c.text3,marginBottom:8,marginLeft:4}}>{slotLabel}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {ACTIVITIES.map(a=>(
                <div key={a.id} onClick={()=>doActivity(a)} style={{borderRadius:14,padding:"12px 4px",border:"1px solid " + c.border,cursor:"pointer",background:c.btn,backdropFilter:"blur(8px)",textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:4}}>{a.emoji}</div>
                  <div style={{fontSize:11,color:c.text,lineHeight:1.2}}>{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Log */}
        <div style={{marginTop:16}}>
          <div style={{fontSize:11,color:c.text3,marginBottom:6,marginLeft:4}}>📜 日志</div>
          <div style={{maxHeight:140,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {history.slice(-15).reverse().map((h,i)=>(
              <div key={i} style={{borderRadius:8,padding:"6px 10px",background:c.log,fontSize:11,color:c.text2,display:"flex",gap:8}}>
                <span style={{opacity:0.5,whiteSpace:"nowrap",width:48}}>Day{h.day}</span>
                <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{h.text.length>50?h.text.slice(0,50)+"...":h.text}</span>
              </div>
            ))}
            {history.length===0 && <div style={{fontSize:11,color:c.text3,textAlign:"center",padding:16}}>开始你的偶像生涯吧 ✨</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
