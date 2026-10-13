"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { DRINK_KINDS, EMPTY_PREFERENCES, type MealPreferences, type MealResult } from "@/lib/meal-types";
import styles from "./food.module.css";
import { snapshotCard, turnCalendar, particles } from "./meal-motion";

const OPTIONS = {
  flavors: ["清淡", "麻辣", "酸辣", "香辣", "糖醋", "酱香", "蒜香", "咖喱", "麻酱"],
  ingredients: ["猪肉", "牛肉", "羊肉", "鸡肉", "鸭肉", "鱼", "虾蟹", "蛋类", "豆制品", "蔬菜", "菌菇", "面食", "米饭"],
  methods: ["爆炒", "蒸煮", "煎炸烤", "炖焖煲", "凉拌"],
  cuisines: ["川湘", "粤菜", "江浙", "东北", "西北", "日韩", "东南亚", "西餐", "云贵", "台式", "广西"],
};
function Icon({ name }: { name: "shuffle" | "cup" | "bowl" | "sliders" | "down" | "refresh" }) {
  const paths = {
    shuffle: <><path d="m18 3 3 3-3 3M18 15l3 3-3 3M3 6h3c5 0 7 12 12 12h3M3 18h3c2 0 3.5-2.5 5-5M14 9c1.3-2 2.5-3 4-3h3" /></>,
    cup: <><path d="m5 8 2 13h10l2-13ZM4 8h16M13 8l2-6h4" /></>,
    bowl: <><path d="M3 11h18a9 9 0 0 1-18 0ZM7 22h10M8 7c-3-3 3-3 0-6M16 7c-3-3 3-3 0-6" /></>,
    sliders: <><path d="M3 6h6m4 0h8M3 18h10m4 0h4" /><circle cx="11" cy="6" r="2" /><circle cx="15" cy="18" r="2" /></>,
    down: <path d="m6 9 6 6 6-6" />,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5M5 8a8 8 0 0 1 13-3l2 2M4 17l2 2a8 8 0 0 0 13-3" /></>,
  };
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} onPointerDown={e => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) e.currentTarget.querySelector("span[data-bloom]")?.animate([{ opacity: .45, transform: "scale(.05)" }, { opacity: 0, transform: "scale(1.4)" }], { duration: 480, easing: "ease-out" });
  }}><span data-bloom className={styles.bloom} aria-hidden="true" />{children}</button>;
}
function Chips({ label, choices, values, onChange }: { label: string; choices: string[]; values: string[]; onChange: (value: string) => void }) {
  return <fieldset className={styles.fieldset}><legend>{label}</legend><div className={styles.chips}>{choices.map(value => <Button key={value} className={styles.chip} aria-pressed={values.includes(value)} onClick={() => onChange(value)}>{value}</Button>)}</div></fieldset>;
}
function tilt(event: PointerEvent<HTMLElement>) {
  if (event.pointerType === "touch" || event.currentTarget.classList.contains(styles.turning) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = event.currentTarget, rect = el.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width, y = (event.clientY - rect.top) / rect.height;
  el.style.setProperty("--tilt-x", `${(y - .5) * -10}deg`);
  el.style.setProperty("--tilt-y", `${(x - .5) * 12}deg`);
  el.style.setProperty("--light-x", `${x * 100}%`);
  el.style.setProperty("--light-y", `${y * 100}%`);
}
function resetTilt(event: PointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty("--tilt-x", "0deg");
  event.currentTarget.style.setProperty("--tilt-y", "0deg");
}
function resultParams(prefs: MealPreferences, pair: MealResult | null, mode: "meal" | "drink") {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(prefs)) if (Array.isArray(value) ? value.length : value) params.set(key, Array.isArray(value) ? value.join(",") : value);
  params.set("previousFood", String(pair?.food?.id || 0));
  params.set("previousDrink", String(pair?.drink?.id || 0));
  params.set("mode", mode);
  params.set("preview", "1");
  return params;
}

export default function FoodPage() {
  const [prefs, setPrefs] = useState<MealPreferences>({ ...EMPTY_PREFERENCES });
  const [pair, setPair] = useState<MealResult | null>(null);
  const [preview, setPreview] = useState<MealResult | null>(null);
  const [busy, setBusy] = useState<"meal" | "drink" | null>(null);
  const [message, setMessage] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [more, setMore] = useState(false);
  const mealRef = useRef<HTMLElement>(null), drinkRef = useRef<HTMLElement>(null);
  const mounted = useRef(false), controller = useRef<AbortController | null>(null);
  const animations = useRef<Animation[]>([]);
  const locked = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const initial = new AbortController();
    const initialTimeout = window.setTimeout(() => initial.abort(), 10000);
    fetch("/api/drinks", { signal: initial.signal }).then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<{ brands: string[] }>; })
      .then(catalogue => { if (mounted.current && !initial.signal.aborted) setBrands(catalogue.brands); })
      .catch(() => {}).finally(() => window.clearTimeout(initialTimeout));
    for (const art of ["meal", "bowl", "coffee", "drink"]) { const image = new Image(); image.src = `/food-art-v7/${art}.png`; }
    return () => { window.clearTimeout(initialTimeout); initial.abort(); mounted.current = false; controller.current?.abort(); animations.current.forEach(x => x.cancel()); };
  }, []);

  async function draw(mode: "meal" | "drink") {
    if (locked.current || (mode === "drink" && !pair?.food)) return;
    locked.current = true;
    setBusy(mode); setMessage("");
    const request = new AbortController();
    controller.current = request;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = (mode === "meal" ? [mealRef.current, drinkRef.current] : [drinkRef.current]).filter(Boolean) as HTMLElement[];
    animations.current.forEach(animation => animation.cancel());
    animations.current = [];
    const timeout = window.setTimeout(() => request.abort(), 10000);
    try {
      const [result] = await Promise.all([
        fetch("/api/meal?" + resultParams(prefs, pair, mode), { signal: request.signal }).then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<MealResult>; }),
        brands.length ? Promise.resolve() : fetch("/api/drinks", { signal: request.signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(catalogue => { if (mounted.current && !request.signal.aborted) setBrands(catalogue.brands); }).catch(() => {}),
      ]);
      window.clearTimeout(timeout);
      if (!mounted.current || request.signal.aborted) return;
      if (!reduced && result.food) {
        const weights = Array.from({ length: 6 }, (_, i) => 1.5 ** i), total = weights.reduce((a, b) => a + b, 0);
        for (let turn = 0; turn < weights.length; turn++) {
          if (!mounted.current || request.signal.aborted) return;
          const before = cards.map(snapshotCard), face = turn === 5 ? result : result.previews?.[turn] || result;
          flushSync(() => setPreview(face));
          const duration = 2400 * weights[turn] / total;
          cards.forEach(card => { card.dataset.flip = String(turn + 1); card.dataset.flipDuration = String(Math.round(duration)); });
          if (turn === 0 || turn === 5) cards.forEach(card => particles(card, animations.current, turn === 5));
          await Promise.all(cards.map((card, i) => turnCalendar(card, before[i], snapshotCard(card), animations.current, i * 24, duration)));
        }
      }
      if (!mounted.current || request.signal.aborted) return;
      setPair(result); setPreview(null); setMessage(result.message);
    } catch {
      if (mounted.current) { setPreview(null); setMessage("这次没能加载菜单，再试一次吧。"); }
    } finally {
      window.clearTimeout(timeout);
      animations.current.forEach(x => x.cancel()); animations.current = [];
      if (mounted.current) { locked.current = false; setBusy(null); }
    }
  }
  function toggle(key: keyof typeof OPTIONS, value: string) {
    setPrefs(old => ({ ...old, [key]: old[key].includes(value) ? old[key].filter(x => x !== value) : [...old[key], value] }));
  }
  const shown = preview || pair;
  const food = shown?.food, drink = shown?.drink;
  const mealArt = food && /面|粉|汤|粥/.test(food.name) ? "bowl" : "meal";
  const flavor = prefs.flavors.length === 0 ? "随意" : prefs.flavors.length === 1 ? prefs.flavors[0] : "";
  const preferenceCount = Object.values(prefs).reduce((n, v) => n + (Array.isArray(v) ? v.length : v ? 1 : 0), 0);
  function cardContent(label: string, icon: "cup" | "bowl", art: string, content: ReactNode) {
    return <><div data-ticket-face className={styles.face}><div className={styles.cardLabel}><Icon name={icon} />{label}</div>{food && <><div className={styles.art}><img src={`/food-art-v7/${art}.png`} width="256" height="256" alt="" draggable="false" /></div><div className={styles.copy}>{content}</div></>}</div><div data-calendar className={styles.calendar} aria-hidden="true" /></>;
  }
  return <div className={styles.page}>
    <section className={styles.product} aria-label="今天吃什么抽签舞台">
      <header className={styles.header}><div><span className={styles.wordmark}>LomoCat</span><h1>今天吃什么</h1></div><Icon name="bowl" /></header>
      <div className={styles.stage} aria-busy={!!busy}>
        <div className={styles.stageHeading}><h2>这次就吃</h2><Button className={styles.primary} disabled={!!busy} onClick={() => draw("meal")}><Icon name="shuffle" />{busy === "meal" ? "抽签中…" : pair?.food ? "换一餐" : "抽一餐"}</Button></div>
        <div className={styles.pair}>
          <article ref={mealRef} className={`${styles.ticket} ${styles.meal}`} onPointerMove={tilt} onPointerLeave={resetTilt} aria-label="餐食结果">
            {cardContent("餐食", "bowl", mealArt, <><h3>{food?.name || (busy ? "抽签中…" : "等你抽一餐")}</h3><p>{food ? [food.flavors?.split(",")[0], food.cuisines?.split(",")[0]].filter(Boolean).join(" · ") : "选点口味，交给这一签"}</p><span className={styles.ticketFoot}>{food?.ingredients?.split(",").slice(0, 3).join(" · ") || "餐食签"}</span></>)}
          </article>
          <article ref={drinkRef} className={`${styles.ticket} ${styles.drink}`} onPointerMove={tilt} onPointerLeave={resetTilt} aria-label="饮品结果">
            {cardContent("饮品", "cup", drink?.kind === "coffee" ? "coffee" : "drink", <><span className={styles.brand}>{drink?.brand || "自动搭配"}</span><h3>{drink?.name || (busy ? "配一杯…" : "暂时没有合适的饮品")}</h3><p>{drink ? DRINK_KINDS[drink.kind] : "可以调整下方偏好"}</p><span className={styles.ticketFoot}>{drink?.ingredients?.split(",").filter(x => x !== "奶").slice(0, 2).join(" · ") || "饮品签"}</span></>)}
          </article>
          <div data-particles className={styles.particles} aria-hidden="true" />
        </div>
        <div className={styles.resultActions}><span className={styles.reason}>{!busy && pair?.reason}</span><Button className={styles.secondary} disabled={!!busy || !pair?.food} onClick={() => draw("drink")}><Icon name="refresh" />{busy === "drink" ? "换一杯…" : "只换饮品"}</Button></div>
        <div className={styles.controls}><Chips label="口味" choices={["随意", "清淡", "香辣"]} values={[flavor]} onChange={value => setPrefs(old => ({ ...old, flavors: value === "随意" ? [] : [value] }))} /></div>
        <div className={styles.preferences}>
          <button type="button" className={styles.summary} onClick={() => setMore(x => !x)} aria-expanded={more} aria-controls="meal-preferences"><span><Icon name="sliders" />偏好设置{preferenceCount > 0 && <small>{preferenceCount}</small>}</span><span className={more ? styles.openChevron : ""}><Icon name="down" /></span></button>
          <div className={`${styles.accordion} ${more ? styles.expanded : ""}`} aria-hidden={!more} inert={!more} id="meal-preferences"><div className={styles.settingsWrap}><div className={styles.settings}>
            <label className={styles.field}>不想吃 / 喝的<input maxLength={250} value={prefs.avoid} onChange={e => setPrefs(old => ({ ...old, avoid: e.target.value }))} placeholder="例如：牛肉、芒果" /></label>
            <label className={styles.field}>饮品品牌<select value={prefs.brand} onChange={e => setPrefs(old => ({ ...old, brand: e.target.value }))}><option value="">不限品牌</option>{brands.map(brand => <option key={brand}>{brand}</option>)}</select></label>
            <div className={styles.full}><Chips label="饮品类型" choices={["随意", "茶饮", "咖啡", "果茶", "奶茶"]} values={[({ "": "随意", "tea-drinks": "茶饮", coffee: "咖啡", "fruit-tea": "果茶", "milk-tea": "奶茶" } as Record<string, string>)[prefs.kind]]} onChange={value => setPrefs(old => ({ ...old, kind: ({ "随意": "", "茶饮": "tea-drinks", "咖啡": "coffee", "果茶": "fruit-tea", "奶茶": "milk-tea" } as Record<string, string>)[value] }))} /></div>
            {(["flavors", "ingredients", "methods", "cuisines"] as const).map(key => <div key={key} className={styles.full}><Chips label={{ flavors: "更多口味", ingredients: "食材", methods: "做法", cuisines: "菜系" }[key]} choices={OPTIONS[key]} values={prefs[key]} onChange={value => toggle(key, value)} /></div>)}
            <label className={styles.field}>饱腹感<select value={prefs.satiety} onChange={e => setPrefs(old => ({ ...old, satiety: e.target.value }))}><option value="">随意</option>{["汤水多", "干爽无汤", "轻食七分饱", "硬菜大快朵颐"].map(x => <option key={x}>{x}</option>)}</select></label>
            <label className={styles.field}>心情<select value={prefs.mood} onChange={e => setPrefs(old => ({ ...old, mood: e.target.value }))}><option value="">随意</option>{["放纵", "克制", "没胃口", "一般"].map(x => <option key={x}>{x}</option>)}</select></label>
            <button type="button" className={styles.reset} onClick={() => setPrefs({ ...EMPTY_PREFERENCES })}>清空偏好</button>
          </div></div></div>
        </div>
        <p className={message ? styles.message : styles.announcement} role="status" aria-live="polite">{message || (pair?.food && !busy ? `${food?.name}，${drink ? `${drink.brand} · ${drink.name}` : "暂无配饮"}` : "")}</p>
        <p className={styles.menuNote}>饮品以门店当日菜单为准。{drink?.source_url && <a href={drink.source_url} target="_blank" rel="noopener noreferrer">单品来源 ↗</a>}</p>
      </div>
    </section>
  </div>;
}
