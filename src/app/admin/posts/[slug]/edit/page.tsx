"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

interface PostData {
  frontmatter: Record<string, string | string[]>;
  body: string;
}

function parseFrontmatter(raw: string): PostData {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };

  const fm: Record<string, string | string[]> = {};
  const lines = match[1].split("\n");
  for (const line of lines) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) {
      let value: string | string[] = kv[2].trim().replace(/^"|"$/g, "");
      // Parse tags array
      if (kv[1] === "tags" && value.startsWith("[")) {
        value = value
          .replace(/[\[\]"]/g, "")
          .split(/[,，\s]+/)
          .filter(Boolean);
      }
      fm[kv[1]] = value;
    }
  }

  return { frontmatter: fm, body: match[2].trim() };
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [title, setTitle] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin");
      return;
    }

    // Fetch post content
    fetch(`/admin/api/posts?slug=${slug}`, {
      headers: { "x-admin-token": token },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const { frontmatter, body } = parseFrontmatter(data.content);
        setTitle((frontmatter.title as string) || "");
        setPostSlug(slug);
        setDescription((frontmatter.description as string) || "");
        setTags(Array.isArray(frontmatter.tags) ? frontmatter.tags.join(", ") : (frontmatter.tags as string) || "");
        setContent(body);
      })
      .catch(() => {
        router.replace("/admin/posts");
      })
      .finally(() => setLoading(false));
  }, [router, slug]);

  const generateFrontmatter = () => `---
title: "${title}"
date: "${new Date().toISOString().split("T")[0]}"
tags: [${tags.split(/[,，\s]+/).filter(Boolean).map((t) => `"${t}"`).join(", ")}]
description: "${description}"
published: true
---

${content}`;

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setMessage("标题和内容不能为空");
      return;
    }
    setSaving(true);
    setMessage("");

    const md = generateFrontmatter();
    const token = sessionStorage.getItem("admin_token");

    try {
      const res = await fetch("/admin/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token || "",
        },
        body: JSON.stringify({ slug: postSlug, content: md }),
      });
      if (res.ok) {
        setMessage("✅ 保存成功！请记得在文章管理页点击「重新构建」使网站生效。");
      } else {
        setMessage("❌ 保存失败");
      }
    } catch {
      setMessage("❌ 保存失败");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-20 text-[var(--text-muted)]">加载中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">✏️ 编辑文章</h1>
          <p className="text-sm text-[var(--text-muted)]">{postSlug}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPreview(!preview)}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
          >
            {preview ? "编辑" : "预览"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {saving ? "保存中..." : "保存 🐾"}
          </button>
        </div>
      </div>

      {message && (
        <p className={`mb-4 p-3 rounded-lg border border-[var(--border)] text-sm ${
          message.startsWith("✅") ? "text-green-600 dark:text-green-400" : "text-red-500"
        }`}>
          {message}
        </p>
      )}

      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题"
          className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] text-xl font-bold outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-muted)]"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="标签，用逗号隔开"
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] text-sm outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="文章摘要"
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] text-sm outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-muted)]"
          />
        </div>

        {preview ? (
          <div className="min-h-[400px] p-6 rounded-lg border border-[var(--border)] bg-[var(--card)] prose">
            <SimplePreview content={content} />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在此输入 Markdown 内容..."
            rows={20}
            className="w-full px-4 py-4 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] text-sm font-mono outline-none focus:border-[var(--accent)] transition-colors resize-y placeholder:text-[var(--text-muted)]"
          />
        )}
      </div>

      {/* Article comments section */}
      <ArticleComments slug={slug} />
    </div>
  );

  function ArticleComments({ slug: s }: { slug: string }) {
    const [list, setList] = useState<{ id: number; name: string; content: string; created_at: string; parent_id: number | null }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (!s) return;
      setLoading(true);
      fetch(`/api/comments?slug=${s}`)
        .then((r) => r.json())
        .then((data) => {
          // Flatten
          const flat: typeof list = [];
          (function flatten(items: any[]) {
            for (const item of items) {
              flat.push(item);
              if (item.replies?.length) flatten(item.replies);
            }
          })(data);
          setList(flat);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [s]);

    const deleteComment = useCallback(async (id: number) => {
      if (!confirm("确定删除这条评论？")) return;
      const token = sessionStorage.getItem("admin_token");
      await fetch("/api/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-token": token || "" },
        body: JSON.stringify({ id }),
      });
      setList((prev) => prev.filter((c) => c.id !== id));
    }, []);

    return (
      <div className="mt-10 pt-8 border-t border-[var(--border)]">
        <h2 className="text-lg font-bold text-[var(--text)] mb-4">
          <svg viewBox="0 0 24 24" width={18} height={18} className="inline mr-2 align-middle" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          评论 ({list.length})
        </h2>
        {loading ? (
          <p className="text-sm text-[var(--text-muted)]">加载中...</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">暂无评论</p>
        ) : (
          <div className="space-y-2">
            {list.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--card)]">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--text-muted)]">
                    <span className="font-medium text-[var(--accent-dark)]">{c.name}</span>
                    {c.parent_id ? <span className="ml-1">· 回复</span> : null}
                    <span className="ml-2">{new Date(c.created_at).toLocaleString("zh-CN")}</span>
                  </p>
                  <p className="text-sm text-[var(--text)] mt-1 whitespace-pre-wrap">{c.content}</p>
                </div>
                <button
                  onClick={() => deleteComment(c.id)}
                  className="shrink-0 px-2 py-1 rounded text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

function SimplePreview({ content }: { content: string }) {
  const html = content
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");

  return <div dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />;
}
