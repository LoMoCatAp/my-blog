import { getDb } from "./db";

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutContent: string;
  footerText: string;
}

const DEFAULTS: SiteContent = {
  heroTitle: "LomoCat 的猫窝",
  heroSubtitle: "写写代码，写写文字。",
  aboutContent: `## 🐱 关于我

我是 **洛陌（Lomo）**，一只写代码的猫。

这个博客是我自己从零搭的，用 Next.js + SQLite + Markdown，服务器跑在阿里云上。

## 📮 联系我

- GitHub: [github.com/lomocat](https://github.com)
- 博客: [lomocat.xyz](https://lomocat.xyz)

---

*猫窝建造于 2026 年 6 月 · 持续进化中 🚀*`,
  footerText: "© 2026 LomoCat · Built with Next.js",
};

export function getSiteContent(): SiteContent {
  const db = getDb();
  const keys = Object.keys(DEFAULTS) as (keyof SiteContent)[];

  const content = { ...DEFAULTS };

  for (const key of keys) {
    const row = db.prepare("SELECT value FROM site_content WHERE key = ?").get(key) as { value: string } | undefined;
    if (row) {
      (content as any)[key] = row.value;
    }
  }

  return content;
}

export function updateSiteContent(key: string, value: string): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO site_content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?"
  ).run(key, value, value);
}
