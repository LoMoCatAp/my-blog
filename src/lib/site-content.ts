import { getDb } from "./db";

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutContent: string;
  footerText: string;
}

const DEFAULTS: SiteContent = {
  heroTitle: "你好，我是洛陌。",
  heroSubtitle: "做全栈开发，也做自己的项目。",
  aboutContent: `我是洛陌，也叫 Lomo。

GitHub：[LoMoCatAp](https://github.com/LoMoCatAp)  
博客：[lomocat.xyz](https://lomocat.xyz/)`,
  footerText: "© 2026 LomoCat",

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
