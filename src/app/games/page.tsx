import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "小游戏 - LomoCat's Blog",
  description: "闲暇时刻玩点小游戏",
};

// SVG icons
const MicIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const FoodIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

const games = [
  {
    title: "IDOL SIMULATOR",
    subtitle: "韩娱爱豆生活模拟器",
    desc: "成为一名练习生或出道艺人，经历 28 天的偶像生涯。训练、演出、绯闻、压力——在荣耀与伤痕并存的韩娱世界里走到最后。",
    href: "/games/idol-simulator",
    color: "from-purple-500/20 to-pink-500/20",
    icon: MicIcon,
    accent: "text-purple-500",
  },
  {
    title: "今天吃什么",
    subtitle: "每日美食抽签器",
    desc: "不知道吃什么？选好口味偏好，让算法帮你决定。川湘粤菜、日韩东南亚，521 道菜等你翻牌。",
    href: "/games/food",
    color: "from-orange-500/20 to-yellow-500/20",
    icon: FoodIcon,
    accent: "text-orange-500",
  },
];

export default function GamesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-1">小游戏</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">闲暇时刻，玩点小游戏</p>
      <div className="grid gap-6">
        {games.map((g) => {
          const Icon = g.icon;
          return (
            <Link
              key={g.href}
              href={g.href}
              className="group block rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <div className={`bg-gradient-to-r ${g.color} p-6 flex items-center justify-center ${g.accent}`}>
                <Icon />
              </div>
              <div className="p-5">
                <h2 className="text-lg font-semibold text-[var(--text)] group-hover:text-[var(--accent-dark)] transition-colors">
                  {g.title}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 mb-2">{g.subtitle}</p>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{g.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
