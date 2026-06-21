"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Link {
  id: number;
  name: string;
  url: string;
  description: string;
}

export default function AdminLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Link> | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) { router.replace("/admin"); return; }
    fetchLinks();
  }, [router]);

  const fetchLinks = async () => {
    const token = sessionStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/links", { headers: { "x-admin-token": token || "" } });
      if (res.ok) setLinks(await res.json());
    } catch {}
    setLoading(false);
  };

  const saveLink = async () => {
    if (!editing?.name?.trim() || !editing?.url?.trim()) return;
    const token = sessionStorage.getItem("admin_token");
    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token || "" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      setMessage("✅ 已保存");
      setEditing(null);
      fetchLinks();
    } else {
      setMessage("❌ 保存失败");
    }
  };

  const deleteLink = async (id: number) => {
    if (!confirm("确定删除？")) return;
    const token = sessionStorage.getItem("admin_token");
    const res = await fetch("/api/links", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-token": token || "" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setMessage("已删除");
      fetchLinks();
    }
  };

  if (loading) return <div className="text-center py-20 text-[var(--text-muted)]">加载中...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">🔗 友链管理</h1>
          <p className="text-sm text-[var(--text-muted)]">共 {links.length} 个友链</p>
        </div>
        <button
          onClick={() => setEditing({ name: "", url: "", description: "" })}
          className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-all"
        >
          ➕ 添加友链
        </button>
      </div>

      {message && <p className="mb-4 text-sm text-green-600 dark:text-green-400">{message}</p>}

      {/* Edit form */}
      {editing && (
        <div className="mb-6 p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <h3 className="font-medium text-[var(--text)]">{editing.id ? "编辑友链" : "添加友链"}</h3>
          <input
            type="text"
            value={editing.name || ""}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            placeholder="网站名称"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--accent)]"
          />
          <input
            type="url"
            value={editing.url || ""}
            onChange={(e) => setEditing({ ...editing, url: e.target.value })}
            placeholder="URL (https://...)"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--accent)]"
          />
          <input
            type="text"
            value={editing.description || ""}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            placeholder="简介（可选）"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--accent)]"
          />
          <div className="flex gap-2">
            <button onClick={saveLink} className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90">保存</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border text-sm text-[var(--text-muted)]">取消</button>
          </div>
        </div>
      )}

      {/* Link list */}
      <div className="space-y-3">
        {links.map((link) => (
          <div key={link.id} className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
            <div>
              <p className="font-medium text-[var(--text)]">{link.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{link.url}</p>
              {link.description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{link.description}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(link)}
                className="px-3 py-1.5 rounded text-xs border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
              >
                编辑
              </button>
              <button
                onClick={() => deleteLink(link.id)}
                className="px-3 py-1.5 rounded text-xs border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
