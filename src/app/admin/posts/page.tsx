"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PostItem {
  slug: string;
  filename: string;
  size: number;
  mtime: string;
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [building, setBuilding] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin");
      return;
    }

    fetch("/admin/api/posts", {
      headers: { "x-admin-token": token },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setPosts(data.posts))
      .catch(() => {
        sessionStorage.removeItem("admin_token");
        router.replace("/admin");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleDelete = async (slug: string) => {
    if (!confirm(`确定删除 "${slug}"？`)) return;
    const token = sessionStorage.getItem("admin_token");
    try {
      const res = await fetch("/admin/api/posts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token || "",
        },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.slug !== slug));
        setMessage("已删除");
      }
    } catch {
      setMessage("删除失败");
    }
  };

  const handleRebuild = async () => {
    if (!confirm("重新构建网站？大约需要 30 秒。")) return;
    setBuilding(true);
    setMessage("");
    const token = sessionStorage.getItem("admin_token");
    try {
      const res = await fetch("/admin/api/rebuild", {
        method: "POST",
        headers: { "x-admin-token": token || "" },
      });
      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage("❌ 构建失败");
    }
    setBuilding(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    router.replace("/admin");
  };

  if (loading) {
    return <div className="text-center py-20 text-[var(--text-muted)]">加载中...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">📝 文章管理</h1>
          <p className="text-sm text-[var(--text-muted)]">共 {posts.length} 篇文章</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/posts/new"
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-all"
          >
            ✏️ 写新文章
          </Link>
          <Link
            href="/admin/site"
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
          >
            ⚙️ 站点设置
          </Link>
          <Link
            href="/admin/links"
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
          >
            🔗 友链
          </Link>
          <Link
            href="/admin/music"
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
          >
            ♫ 音乐
          </Link>
          <Link
            href="/admin/analytics"
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
          >
            📊 统计
          </Link>
          <Link
            href="/admin/food"
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
          >
            🍽️ 美食
          </Link>
          <button
            onClick={handleRebuild}
            disabled={building}
            className="px-4 py-2 rounded-lg border border-[var(--accent)] text-sm text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all"
          >
            {building ? "⏳ 构建中..." : "🔄 重新构建"}
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-red-500 transition-all"
          >
            退出
          </button>
        </div>
      </div>

      {message && (
        <p className="mb-4 text-sm text-green-600 dark:text-green-400">{message}</p>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]"
          >
            <div>
              <Link
                href={`/posts/${post.slug}`}
                target="_blank"
                className="font-medium text-[var(--text)] hover:text-[var(--accent-dark)]"
              >
                {post.slug}
              </Link>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {new Date(post.mtime).toLocaleString("zh-CN")} · {(post.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin/posts/${post.slug}/edit`}
                className="px-3 py-1.5 rounded text-xs border border-[var(--border)] text-[var(--accent-dark)] hover:bg-[var(--accent-light)] transition-all"
              >
                编辑
              </Link>
              <Link
                href={`/posts/${post.slug}`}
                target="_blank"
                className="px-3 py-1.5 rounded text-xs border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
              >
                查看
              </Link>
              <button
                onClick={() => handleDelete(post.slug)}
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
