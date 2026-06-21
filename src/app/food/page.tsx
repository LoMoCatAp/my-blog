"use client";

import React, { useState, useEffect, useRef } from "react";
import { useI18n } from "@/components/I18nProvider";

interface Food {
  id: number;
  name: string;
  flavors: string;
  ingredients: string;
  methods: string;
  cuisines: string;
  satiety: string;
  mood: string;
}

const OPTIONS: Record<string, string[]> = {
  flavors: ["麻辣", "酸辣", "香辣", "糖醋", "酱香", "蒜香", "咖喱", "麻酱", "清淡"],
  ingredients: ["猪肉", "牛肉", "鸡肉", "鱼", "虾蟹", "蛋类", "豆制品", "蔬菜", "菌菇", "面食", "米饭"],
  methods: ["爆炒", "蒸煮", "煎炸烤", "炖焖煲", "凉拌"],
  cuisines: ["川湘", "粤菜", "江浙", "东北", "西北", "日韩", "东南亚", "西餐"],
  satiety: ["汤水多", "干爽无汤", "轻食七分饱", "硬菜大快朵颐"],
  moods: ["放纵", "克制", "没胃口"],
};

/* ── SVG icons for each category ── */
const FlavorIcon = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0"><circle cx="10" cy="10" r="6"/><path d="M6 10c0-2 1.5-4 4-4"/></svg>
);
const IngIcon = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0"><path d="M10 3v14M3 10h14"/></svg>
);
const MethodIcon = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0"><path d="M4 16L16 4M8 4l8 8M4 12l8 8"/></svg>
);
const CuisineIcon = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0"><circle cx="10" cy="10" r="7"/><path d="M10 3a7 7 0 0 1 0 14"/></svg>
);
const SatietyIcon = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0"><path d="M3 10h14M10 3v14"/><circle cx="10" cy="10" r="7"/></svg>
);
const MoodIcon = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0"><path d="M6 12c1 1.5 2 2 4 2s3-.5 4-2M7 8h.01M13 8h.01"/><circle cx="10" cy="10" r="7"/></svg>
);
const AvoidIcon = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0"><path d="M15 5L5 15M5 5l10 10"/></svg>
);
const SlotIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/></svg>
);
const RollIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0"><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 2a10 10 0 0 0 10 10"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10"/></svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0"><path d="M4 8l3 3 5-5"/></svg>
);

const CATEGORY_ICONS: Record<string, () => React.ReactNode> = {
  flavors: FlavorIcon,
  ingredients: IngIcon,
  methods: MethodIcon,
  cuisines: CuisineIcon,
  satiety: SatietyIcon,
  moods: MoodIcon,
};

const catLabels: Record<string, string> = {
  flavors: "味型偏好",
  ingredients: "想吃啥食材",
  methods: "烹饪方式",
  cuisines: "菜系",
  satiety: "饱腹感",
  moods: "今天心情",
};

export default function FoodPage() {
  const { t } = useI18n();
  const [pick, setPick] = useState<Food | null>(null);
  const [rolling, setRolling] = useState(false);
  const [foods, setFoods] = useState<Food[]>([]);
  const [filters, setFilters] = useState<Record<string, string[]>>({
    flavors: [], ingredients: [], methods: [], cuisines: [], satiety: [], moods: [],
  });
  const [avoidText, setAvoidText] = useState("");
  const [showing, setShowing] = useState(false);
  const [slotNames, setSlotNames] = useState<string[]>(['?', '?', '?']);
  const [slotFrame, setSlotFrame] = useState(0);
  const intervalRef = useRef<number>(0);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetch("/api/food?all=true").then(r => r.json()).then(d => setFoods(d.foods || d)).catch(() => {}); }, []);

  function toggleFilter(cat: string, val: string) {
    setFilters(f => ({ ...f, [cat]: f[cat].includes(val) ? f[cat].filter(v => v !== val) : [...f[cat], val] }));
  }

  async function roll() {
    setRolling(true);
    setPick(null);
    setShowing(false);
    setSlotNames(['?', '?', '?']);
    setSlotFrame(0);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v.length) params.set(k, v.join(",")); });
    if (avoidText.trim()) params.set("avoid", avoidText.trim());
    try {
      const res = await fetch("/api/food?" + params.toString());
      const json = await res.json();
      const items: Food[] = json.foods || json;
      if (!items.length) { setRolling(false); return; }
      const names = items.map(i => i.name);
      const totalFrames = 24;
      let frame = 0;
      intervalRef.current = window.setInterval(() => {
        const shuffled = [...names].sort(() => Math.random() - 0.5);
        setSlotNames(shuffled.slice(0, 3));
        setSlotFrame(frame);
        frame++;
        if (frame >= totalFrames) {
          clearInterval(intervalRef.current);
          const final = items[Math.floor(Math.random() * items.length)];
          setPick(final);
          setRolling(false);
          setShowing(true);
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
        }
      }, 80);
    } catch { setRolling(false); }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-[var(--text)]">
      <h1 className="text-2xl font-bold mb-2">{t("food.title")}</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">{t("food.subtitle")}</p>

      {/* ── All option categories ── */}
      <div className="space-y-4 mb-6">
        {["flavors", "ingredients", "methods", "cuisines", "satiety", "moods"].map((cat, ci) => {
          const CatIcon = CATEGORY_ICONS[cat];
          return (
            <div key={cat} className="option-category" style={{ animationDelay: `${ci * 0.05}s` }}>
              <p className="text-xs font-semibold text-[var(--text)] mb-1.5 flex items-center gap-1">
                <CatIcon /> {catLabels[cat]}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {OPTIONS[cat].map((val, vi) => {
                  const active = filters[cat].includes(val);
                  return (
                    <button
                      key={val}
                      onClick={() => toggleFilter(cat, val)}
                      className={`option-chip px-3.5 py-1.5 text-sm rounded-full font-medium transition-all duration-200 ${
                        active
                          ? "bg-[var(--accent)] text-white shadow-lg scale-105 ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--bg)]"
                          : "bg-[var(--bg-secondary)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)] hover:scale-105 hover:shadow-md"
                      }`}
                      style={{ animationDelay: `${vi * 0.03}s` }}
                    >
                      {active && <CheckIcon />} {val}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* ── 绝对不吃 ── */}
        <div className="option-category" style={{ animationDelay: "0.3s" }}>
          <p className="text-xs font-semibold text-[var(--text)] mb-1.5 flex items-center gap-1">
            <AvoidIcon /> 绝对不吃
          </p>
          <input
            value={avoidText}
            onChange={e => setAvoidText(e.target.value)}
            placeholder={t("food.avoidPlaceholder")}
            className="w-full px-4 py-2 text-sm rounded-xl border-2 border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(251,146,60,0.2)]"
          />
        </div>
      </div>

      {/* ── Roll button ── */}
      <button
        onClick={roll}
        disabled={rolling}
        className={`roll-btn w-full py-4 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-lg transition-all duration-200 shadow-xl flex items-center justify-center gap-3 ${
          rolling
            ? "opacity-80 scale-95 cursor-wait"
            : "hover:scale-[1.03] hover:shadow-2xl active:scale-95"
        } disabled:opacity-60`}
      >
        {rolling ? (
          <>
            <span className="inline-block animate-spin"><RollIcon /></span>
            <span>{t("food.rolling")}</span>
          </>
        ) : (
          <>
            <SlotIcon />
            <span>{t("food.roll")}</span>
          </>
        )}
      </button>

      {/* ── Slot machine ── */}
      {rolling && (
        <div className="mt-8 rounded-2xl border-2 border-orange-300 dark:border-orange-600 bg-[var(--card)] p-6 text-center shadow-lg slot-machine">
          <p className="text-xs font-medium text-[var(--text-muted)] mb-3 flex items-center justify-center gap-1.5">
            <SlotIcon /> 正在转动...
          </p>
          <div className="flex justify-center gap-3 mb-3 overflow-hidden h-14">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="slot-reel w-24 h-14 rounded-xl bg-[var(--bg-secondary)] border-2 border-orange-300 dark:border-orange-600 flex items-center justify-center overflow-hidden"
              >
                <span
                  className="text-base font-extrabold text-[var(--text)] px-1 truncate max-w-full"
                  style={{
                    animation: `slotItemIn 0.08s ease-out`,
                    animationDelay: `${i * 0.02}s`,
                  }}
                >
                  {slotNames[i] || "?"}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-[var(--bg-secondary)] rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-pink-400 rounded-full transition-all duration-100"
              style={{ width: `${Math.min((slotFrame / 24) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {pick && showing && (
        <div ref={resultRef} className="mt-8 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-lg result-card">
          <div className="text-5xl mb-4 result-emoji">
            <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" className="mx-auto">
              <circle cx="24" cy="24" r="20"/>
              <path d="M16 28c2 3 5.5 5 8 5s6-2 8-5M18 20h.01M30 20h.01"/>
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--text)] mb-4 result-name">{pick.name}</h2>
          <div className="flex flex-wrap justify-center gap-2 text-sm mb-6 result-tags">
            {pick.flavors.split(",").map(tag => (
              <span key={tag} className="tag-chip px-3 py-1 rounded-full font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">{tag}</span>
            ))}
            {pick.ingredients.split(",").map(tag => (
              <span key={tag} className="tag-chip px-3 py-1 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">{tag}</span>
            ))}
            {pick.cuisines.split(",").map(tag => (
              <span key={tag} className="tag-chip px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">{tag}</span>
            ))}
          </div>
          <button
            onClick={roll}
            className="mt-2 px-6 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-200"
          >
            <span className="flex items-center gap-1.5 justify-center">
              <RollIcon /> 再来一次
            </span>
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(12px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3) rotate(-10deg); }
          50% { transform: scale(1.2) rotate(5deg); }
          70% { transform: scale(0.95) rotate(-3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
        @keyframes slotItemIn {
          0% { transform: translateY(-40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes tagChipIn {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251, 146, 60, 0.3); }
          50% { box-shadow: 0 0 0 14px rgba(251, 146, 60, 0); }
        }

        .option-category {
          animation: fadeSlideIn 0.35s ease-out forwards;
          opacity: 0;
        }
        .option-chip {
          cursor: pointer;
          user-select: none;
        }
        .option-chip:active {
          transform: scale(0.92) !important;
        }

        .roll-btn {
          position: relative;
          overflow: hidden;
        }
        .roll-btn:not(:disabled)::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 200% 100%;
          animation: shimmer 1.8s ease-in-out infinite;
          pointer-events: none;
        }

        .slot-machine {
          animation: fadeSlideIn 0.3s ease-out;
        }
        .slot-reel {
          animation: pulseRing 0.8s ease-in-out infinite;
        }

        .result-emoji {
          animation: bounceIn 0.6s ease-out forwards;
        }
        .result-name {
          animation: fadeSlideIn 0.5s ease-out 0.15s forwards;
          opacity: 0;
        }
        .result-tags .tag-chip {
          animation: tagChipIn 0.3s ease-out forwards;
          opacity: 0;
        }
        .result-tags .tag-chip:nth-child(1) { animation-delay: 0.25s; }
        .result-tags .tag-chip:nth-child(2) { animation-delay: 0.3s; }
        .result-tags .tag-chip:nth-child(3) { animation-delay: 0.35s; }
        .result-tags .tag-chip:nth-child(4) { animation-delay: 0.4s; }
        .result-tags .tag-chip:nth-child(5) { animation-delay: 0.45s; }
        .result-tags .tag-chip:nth-child(6) { animation-delay: 0.5s; }
        .result-tags .tag-chip:nth-child(7) { animation-delay: 0.55s; }
        .result-tags .tag-chip:nth-child(8) { animation-delay: 0.6s; }
        .result-tags .tag-chip:nth-child(9) { animation-delay: 0.65s; }
        .result-tags .tag-chip:nth-child(10) { animation-delay: 0.7s; }
        .result-card {
          animation: fadeSlideIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
