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

interface OptionItem {
  label: string;
  value: string;
}

const OPTIONS: Record<string, OptionItem[]> = {
  flavors: [
    { label: "🌶️ 麻辣", value: "麻辣" },
    { label: "🍋 酸辣", value: "酸辣" },
    { label: "🔥 香辣", value: "香辣" },
    { label: "🍬 糖醋", value: "糖醋" },
    { label: "🧄 酱香", value: "酱香" },
    { label: "🧄 蒜香", value: "蒜香" },
    { label: "🍛 咖喱", value: "咖喱" },
    { label: "🥜 麻酱", value: "麻酱" },
    { label: "🥬 清淡", value: "清淡" },
  ],
  ingredients: [
    { label: "🥩 猪肉", value: "猪肉" },
    { label: "🐂 牛肉", value: "牛肉" },
    { label: "🐔 鸡肉", value: "鸡肉" },
    { label: "🐟 鱼", value: "鱼" },
    { label: "🦐 虾蟹", value: "虾蟹" },
    { label: "🥚 蛋类", value: "蛋类" },
    { label: "🫘 豆制品", value: "豆制品" },
    { label: "🥬 蔬菜", value: "蔬菜" },
    { label: "🍄 菌菇", value: "菌菇" },
    { label: "🍜 面食", value: "面食" },
    { label: "🍚 米饭", value: "米饭" },
  ],
  methods: [
    { label: "🔥 爆炒", value: "爆炒" },
    { label: "♨️ 蒸煮", value: "蒸煮" },
    { label: "🍳 煎炸烤", value: "煎炸烤" },
    { label: "🍲 炖焖煲", value: "炖焖煲" },
    { label: "🥗 凉拌", value: "凉拌" },
  ],
  cuisines: [
    { label: "🌶️ 川湘", value: "川湘" },
    { label: "🥟 粤菜", value: "粤菜" },
    { label: "🍃 江浙", value: "江浙" },
    { label: "🧊 东北", value: "东北" },
    { label: "🐑 西北", value: "西北" },
    { label: "🍣 日韩", value: "日韩" },
    { label: "🌴 东南亚", value: "东南亚" },
    { label: "🍝 西餐", value: "西餐" },
  ],
  satiety: [
    { label: "🥣 汤水多", value: "汤水多" },
    { label: "🍽️ 干爽无汤", value: "干爽无汤" },
    { label: "🥗 轻食七分饱", value: "轻食七分饱" },
    { label: "🍖 硬菜大快朵颐", value: "硬菜大快朵颐" },
  ],
  moods: [
    { label: "🎉 放纵", value: "放纵" },
    { label: "🧘 克制", value: "克制" },
    { label: "😔 没胃口", value: "没胃口" },
  ],
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
const AvoidIcon = () => (
  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="shrink-0"><path d="M15 5L5 15M5 5l10 10"/></svg>
);
const SlotIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/></svg>
);
const RollIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0"><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 2a10 10 0 0 0 10 10"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10"/></svg>
);

const CATEGORY_ICONS: Record<string, () => React.ReactNode> = {
  flavors: FlavorIcon,
  ingredients: IngIcon,
  methods: MethodIcon,
  cuisines: CuisineIcon,
};

// ── simplified category theme (no gradients, just solid subtle colors) ──
const CAT_THEME: Record<string, { badge: string; bg: string; chip: string; chipActive: string; border: string }> = {
  flavors:    { badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300", bg: "bg-rose-50/50 dark:bg-rose-950/10", chip: "bg-white dark:bg-[var(--bg-secondary)] text-[var(--text)] border-[var(--border)] dark:border-[var(--border)]", chipActive: "bg-[var(--accent)] text-white", border: "border-rose-200/50 dark:border-rose-900/30" },
  ingredients: { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", bg: "bg-emerald-50/50 dark:bg-emerald-950/10", chip: "bg-white dark:bg-[var(--bg-secondary)] text-[var(--text)] border-[var(--border)] dark:border-[var(--border)]", chipActive: "bg-[var(--accent)] text-white", border: "border-emerald-200/50 dark:border-emerald-900/30" },
  methods:    { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", bg: "bg-amber-50/50 dark:bg-amber-950/10", chip: "bg-white dark:bg-[var(--bg-secondary)] text-[var(--text)] border-[var(--border)] dark:border-[var(--border)]", chipActive: "bg-[var(--accent)] text-white", border: "border-amber-200/50 dark:border-amber-900/30" },
  cuisines:   { badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300", bg: "bg-sky-50/50 dark:bg-sky-950/10", chip: "bg-white dark:bg-[var(--bg-secondary)] text-[var(--text)] border-[var(--border)] dark:border-[var(--border)]", chipActive: "bg-[var(--accent)] text-white", border: "border-sky-200/50 dark:border-sky-900/30" },
};

const catLabels: Record<string, string> = {
  flavors: "味型偏好",
  ingredients: "想吃啥食材",
  methods: "烹饪方式",
  cuisines: "菜系",
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
  const [showMore, setShowMore] = useState(false);
  const [showing, setShowing] = useState(false);
  const [slotNames, setSlotNames] = useState<string[]>(['?', '?', '?']);
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
        frame++;
        if (frame >= totalFrames) {
          clearInterval(intervalRef.current);
          const final = items[Math.floor(Math.random() * items.length)];
          setPick(final);
          setRolling(false);
          setShowing(true);
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
        }
      }, 100);
    } catch { setRolling(false); }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-[var(--text)]">
      {/* ── Header ── */}
      <h1 className="text-2xl font-bold text-[var(--text)] mb-1">{t("food.title")}</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">{t("food.subtitle")}</p>

      {/* ── Option categories ── */}
      <div className="space-y-3 mb-4">
        {["flavors", "ingredients", "methods"].map((cat, ci) => {
          const CatIcon = CATEGORY_ICONS[cat];
          const theme = CAT_THEME[cat];
          return (
            <div
              key={cat}
              className={`option-category rounded-xl border ${theme.border} ${theme.bg} p-3.5`}
            >
              <p className="text-xs font-semibold text-[var(--text)] mb-2 flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${theme.badge}`}>
                  <CatIcon /> {catLabels[cat]}
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {OPTIONS[cat].map((opt, vi) => {
                  const active = filters[cat].includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleFilter(cat, opt.value)}
                      className={`option-chip px-3 py-1.5 text-sm rounded-lg font-medium select-none transition-all duration-150 ${
                        active
                          ? `${theme.chipActive} shadow-sm`
                          : `${theme.chip} border hover:shadow-sm hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]`
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* ── 更多选项 toggle (only in flavors box) ── */}
              {cat === "flavors" && (
                <div className="mt-2.5 pt-2.5 border-t border-dashed border-[var(--border)]">
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-150 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showMore ? "收起" : "更多选项"} →</span>
                    {!showMore && filters.cuisines.length > 0 && (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold leading-none">
                        {filters.cuisines.length}
                      </span>
                    )}
                  </button>

                  {showMore && (
                    <div className="mt-2.5">
                      {(() => {
                        const theme = CAT_THEME["cuisines"];
                        const cat = "cuisines";
                        const CatIcon = CATEGORY_ICONS[cat];
                        return (
                          <>
                            <p className="text-xs font-semibold text-[var(--text)] mb-2 flex items-center gap-1.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${theme.badge}`}>
                                <CatIcon /> {catLabels[cat]}
                              </span>
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {OPTIONS[cat].map((opt) => {
                                const active = filters[cat].includes(opt.value);
                                return (
                                  <button
                                    key={opt.value}
                                    onClick={() => toggleFilter(cat, opt.value)}
                                    className={`option-chip px-3 py-1.5 text-sm rounded-lg font-medium select-none transition-all duration-150 ${
                                      active
                                        ? `${theme.chipActive} shadow-sm`
                                        : `${theme.chip} border hover:shadow-sm hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]`
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* ── 绝对不吃 ── */}
        <div className="option-category rounded-xl border border-red-200/50 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 p-3.5">
          <p className="text-xs font-semibold text-[var(--text)] mb-2 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
              <AvoidIcon /> 绝对不吃
            </span>
          </p>
          <input
            value={avoidText}
            onChange={e => setAvoidText(e.target.value)}
            placeholder={t("food.avoidPlaceholder")}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] outline-none transition-all duration-150 focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(249,115,22,0.12)] placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* ── Roll button ── */}
      <button
        onClick={roll}
        disabled={rolling}
        className={`roll-btn w-full py-4 rounded-xl bg-[var(--accent)] text-white font-bold text-lg transition-all duration-150 shadow-md flex items-center justify-center gap-3 ${
          rolling
            ? "opacity-80 cursor-wait"
            : "hover:shadow-lg hover:brightness-110 active:brightness-90"
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

      {/* ── Slot reveal ── */}
      {rolling && (
        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-center shadow-sm slot-machine">
          <p className="text-xs font-medium text-[var(--text-muted)] mb-3 flex items-center justify-center gap-1.5">
            <SlotIcon /> 正在为你精选...
          </p>
          <div className="flex justify-center gap-3 mb-1 overflow-hidden">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="slot-reel w-28 h-14 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center overflow-hidden"
              >
                <span className="text-sm font-extrabold text-[var(--text)] px-1 truncate max-w-full">
                  {slotNames[i] || "?"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {pick && showing && (
        <div ref={resultRef} className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-sm result-card">
          <div className="text-5xl mb-2 result-emoji">🍜</div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-3 result-name">{pick.name}</h2>
          <div className="flex flex-wrap justify-center gap-1.5 text-xs mb-4 result-tags">
            {pick.flavors.split(",").map(tag => (
              <span key={tag} className="tag-chip px-2.5 py-1 rounded-full font-medium bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300 border border-rose-200 dark:border-rose-800/30">{tag}</span>
            ))}
            {pick.ingredients.split(",").map(tag => (
              <span key={tag} className="tag-chip px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30">{tag}</span>
            ))}
            {pick.cuisines.split(",").map(tag => (
              <span key={tag} className="tag-chip px-2.5 py-1 rounded-full font-medium bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300 border border-sky-200 dark:border-sky-800/30">{tag}</span>
            ))}
          </div>
          <button
            onClick={roll}
            className="mt-1 px-5 py-2 text-sm font-bold rounded-lg bg-[var(--accent)] text-white shadow-sm hover:shadow-md hover:brightness-110 active:brightness-90 transition-all duration-150"
          >
            <span className="flex items-center gap-1.5 justify-center">
              <RollIcon /> 再来一次
            </span>
          </button>
        </div>
      )}

      <style>{`
        @keyframes chipHover {
          0% { transform: scale(1); }
          40% { transform: scale(1.08); }
          70% { transform: scale(0.96); }
          100% { transform: scale(1); }
        }

        .option-category {
          animation: fadeSlideIn 0.35s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .option-chip {
          cursor: pointer;
        }
        .option-chip:hover:not(.bg-\\[var\\(--accent\\)\\]) {
          animation: chipHover 0.35s ease-out;
        }
        .option-chip:active {
          transform: scale(0.92) !important;
        }

        .slot-machine {
          animation: fadeSlideIn 0.3s ease-out;
        }

        @keyframes gentlePop {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes tagChipIn {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }

        .result-emoji {
          animation: gentlePop 0.4s ease-out forwards;
        }
        .result-name {
          animation: fadeSlideIn 0.35s ease-out 0.1s forwards;
          opacity: 0;
        }
        .result-tags .tag-chip {
          animation: tagChipIn 0.25s ease-out forwards;
          opacity: 0;
        }
        .result-tags .tag-chip:nth-child(1) { animation-delay: 0.15s; }
        .result-tags .tag-chip:nth-child(2) { animation-delay: 0.2s; }
        .result-tags .tag-chip:nth-child(3) { animation-delay: 0.25s; }
        .result-tags .tag-chip:nth-child(4) { animation-delay: 0.3s; }
        .result-tags .tag-chip:nth-child(5) { animation-delay: 0.35s; }
        .result-tags .tag-chip:nth-child(6) { animation-delay: 0.4s; }
        .result-card {
          animation: fadeSlideIn 0.35s ease-out;
        }
      `}</style>
    </div>
  );
}
