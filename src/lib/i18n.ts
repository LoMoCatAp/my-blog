import zh from "@/locales/zh.json";
import en from "@/locales/en.json";

export type Lang = "zh" | "en";

const messages: Record<Lang, Record<string, string>> = { zh, en };

export function t(lang: Lang, key: string, params?: Record<string, string | number>): string {
  let text = messages[lang]?.[key] || messages["zh"]?.[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
