"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutContent: string;
  footerText: string;
}

export default function AdminSitePage() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin");
      return;
    }

    fetch("/api/site-content")
      .then((r) => r.json())
      .then(setContent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (key: string, value: string) => {
    const token = sessionStorage.getItem("admin_token");
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/site-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token || "",
        },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setMessage("✅ 已保存");
      } else {
        setMessage("❌ 保存失败");
      }
    } catch {
      setMessage("❌ 保存失败");
    }
    setSaving(false);
  };

  const saveAll = async () => {
    if (!content) return;
    const token = sessionStorage.getItem("admin_token");
    setSaving(true);
    setMessage("");
    try {
      const promises = Object.entries(content).map(([key, value]) =>
        fetch("/api/site-content", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": token || "",
          },
          body: JSON.stringify({ key, value }),
        })
      );
      await Promise.all(promises);
      setMessage("✅ 全部保存成功！");
    } catch {
      setMessage("❌ 保存失败");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-20 text-[var(--text-muted)]">加载中...</div>;
  }

  if (!content) {
    return <div className="text-center py-20 text-red-500">加载失败</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">⚙️ 站点设置</h1>
          <p className="text-sm text-[var(--text-muted)]">编辑首页和关于页的文字内容</p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {saving ? "保存中..." : "💾 保存全部"}
        </button>
      </div>

      {message && (
        <p className={`mb-4 p-3 rounded-lg border text-sm ${
          message.startsWith("✅") ? "border-green-200 text-green-600 dark:text-green-400" : "border-red-200 text-red-500"
        }`}>
          {message}
        </p>
      )}

      <div className="space-y-8">
        {/* Hero Title */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">首页大标题</label>
          <input
            type="text"
            value={content.heroTitle}
            onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
            onBlur={() => handleSave("heroTitle", content.heroTitle)}
            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] text-lg font-bold outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {/* Hero Subtitle */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">首页副标题</label>
          <textarea
            value={content.heroSubtitle}
            onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
            onBlur={() => handleSave("heroSubtitle", content.heroSubtitle)}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors resize-none"
          />
        </div>

        {/* About Content */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            关于页面内容 <span className="text-[var(--text-muted)] font-normal">(Markdown 格式)</span>
          </label>
          <textarea
            value={content.aboutContent}
            onChange={(e) => setContent({ ...content, aboutContent: e.target.value })}
            onBlur={() => handleSave("aboutContent", content.aboutContent)}
            rows={12}
            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] text-sm font-mono outline-none focus:border-[var(--accent)] transition-colors resize-y"
          />
        </div>

        {/* Footer */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">页脚文字</label>
          <input
            type="text"
            value={content.footerText}
            onChange={(e) => setContent({ ...content, footerText: e.target.value })}
            onBlur={() => handleSave("footerText", content.footerText)}
            className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
