"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface PostResult {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  snippet: string;
}

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results);
      } catch {
        setResults([]);
      }
      setLoading(false);
      setSearched(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[var(--text)] flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          搜索
        </h1>
      </header>

      <div className="relative mb-8">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章标题、描述、标签、正文..."
          className="w-full px-5 py-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-light)] transition-all text-lg"
        />
        {loading && (
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
            searching...
          </span>
        )}
      </div>

      {searched && (
        <p className="text-sm text-[var(--text-muted)] mb-6">
          {results.length === 0
            ? `没有找到与 "${query}" 相关的文章`
            : `找到 ${results.length} 篇与 "${query}" 相关的文章`}
        </p>
      )}

      <div className="space-y-4">
        {results.map((post) => (
          <article
            key={post.slug}
            className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] transition-all"
          >
            <Link href={`/posts/${post.slug}`} className="group block">
              <h2 className="text-xl font-semibold group-hover:text-[var(--accent-dark)] transition-colors">
                {highlightMatch(post.title, query)}
              </h2>
              {post.description && (
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  {highlightMatch(post.description, query)}
                </p>
              )}
              {/* Content snippet */}
              {post.snippet && (
                <p className="mt-2 text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2 bg-[var(--bg-secondary)] rounded-lg px-3 py-2">
                  {highlightMatch(post.snippet, query)}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <time>{post.date}</time>
                {post.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-amber-200 dark:bg-amber-800 text-inherit rounded px-0.5">{part}</mark>
      : part
  );
}
