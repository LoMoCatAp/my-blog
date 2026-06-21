import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "小游戏 - LomoCat's Blog",
  description: "闲暇时刻玩点小游戏",
};

const MicIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const FoodIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
    href: "/games/idol-simulator",
    color: "from-purple-400/30 to-pink-400/30",
    icon: MicIcon,
    accent: "text-purple-400",
  },
  {
    title: "今天吃什么",
    subtitle: "每日美食抽签器",
    href: "/games/food",
    color: "from-orange-400/30 to-yellow-400/30",
    icon: FoodIcon,
    accent: "text-orange-400",
  },
];

export default function GamesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-8 text-center">小游戏</h1>
      <div className="flex flex-col gap-5">
        {games.map((g) => {
          const Icon = g.icon;
          return (
            <Link
              key={g.href}
              href={g.href}
              className="group flex items-center gap-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center ${g.accent}`}>
                <Icon />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text)] group-hover:text-[var(--accent-dark)] transition-colors">
                  {g.title}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{g.subtitle}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
