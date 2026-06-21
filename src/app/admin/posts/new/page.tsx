"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const DRAFT_KEY = "blog_draft";

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(data: Record<string, string>) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // storage full
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [preview, setPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin");
      return;
    }
    // Restore draft
    if (!initialized.current) {
      const draft = loadDraft();
      if (draft) {
        setTitle(draft.title || "");
        setSlug(draft.slug || "");
        setDescription(draft.description || "");
        setTags(draft.tags || "");
        setContent(draft.content || "");
        if (draft.slug) setAutoSlug(false);
      }
      initialized.current = true;
    }
  }, [router]);

  // Auto-save every 5 seconds if anything changed
  const autoSave = useCallback(() => {
    const draft = { title, slug, description, tags, content };
    saveDraft(draft);
    setLastSaved(new Date().toLocaleTimeString("zh-CN"));
  }, [title, slug, description, tags, content]);

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(autoSave, 5000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [autoSave]);

  const generateSlug = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\s-]/g, "")
      .replace(/[\s]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "untitled";

  const handleTitleChange = (t: string) => {
    setTitle(t);
    if (autoSlug) setSlug(generateSlug(t));
  };

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

    const finalSlug = slug || generateSlug(title);
    const md = generateFrontmatter();

    const token = sessionStorage.getItem("admin_token");
    try {
      const res = await fetch("/admin/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token || "",
        },
        body: JSON.stringify({ slug: finalSlug, content: md }),
      });
      if (res.ok) {
        clearDraft();
        setMessage(`✅ 发布成功！请记得在文章管理页点击「重新构建」使网站生效。`);
        setTimeout(() => router.push("/admin/posts"), 1500);
      } else {
        setMessage("❌ 保存失败");
      }
    } catch {
      setMessage("❌ 保存失败");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">✏️ 写新文章</h1>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-[var(--text-muted)]">
              💾 {lastSaved} 已自动保存
            </span>
          )}
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
            {saving ? "保存中..." : "发布 🐾"}
          </button>
        </div>
      </div>

      {message && (
        <p className="mb-4 p-3 rounded-lg border border-[var(--border)] text-sm">{message}</p>
      )}

      <div className="space-y-4">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="文章标题"
          className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] text-xl font-bold outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-muted)]"
        />

        {/* Slug + Tags */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setAutoSlug(false);
            }}
            placeholder="URL 标识 (slug)"
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] text-sm outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="标签，用逗号隔开"
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] text-sm outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-muted)]"
          />
        </div>

        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="文章摘要（可选）"
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] text-sm outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-muted)]"
        />

        {/* Editor / Preview */}
        {preview ? (
          <div className="min-h-[400px] p-6 rounded-lg border border-[var(--border)] bg-[var(--card)] prose max-w-none">
            {/* Render simple markdown headings for preview */}
            {content.split("\n").map((line, i) => {
              if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
              if (line.startsWith("## ")) return <h2 key={i}>{line.slice(3)}</h2>;
              if (line.startsWith("# ")) return <h1 key={i}>{line.slice(2)}</h1>;
              if (line.trim() === "") return <br key={i} />;
              return <p key={i} className="text-sm">{line}</p>;
            })}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在此输入 Markdown 内容..."
            rows={20}
            className="w-full px-4 py-4 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] text-sm font-mono outline-none focus:border-[var(--accent)] transition-colors resize-y placeholder:text-[var(--text-muted)]"
          />
        )}
      </div>
    </div>
  );
}
