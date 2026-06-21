"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TopPage {
  path: string;
  page_title: string;
  count: number;
}

interface DailyTrend {
  date: string;
  count: number;
}

interface TopReferrer {
  referrer: string;
  count: number;
}

interface Stats {
  today: { count: number; pages: number };
  total: number;
  topPages: TopPage[];
  dailyTrend: DailyTrend[];
  topReferrers: TopReferrer[];
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">
        加载中...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
          <svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            <path d="M9 9a3 3 0 0 1 3-3" />
            <path d="M12 6v6l3 2" />
          </svg>
          访问统计
        </h1>
        <Link href="/admin" className="text-sm text-[var(--accent)] hover:underline">
          ← 返回管理
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "今日访问", value: stats?.today.count ?? 0, icon: "today" },
          { label: "今日页面", value: stats?.today.pages ?? 0, icon: "pages" },
          { label: "历史总访问", value: stats?.total ?? 0, icon: "total" },
          { label: "日均(7天)", value: stats?.total ? Math.round(stats.total / Math.max(stats.dailyTrend?.length || 1, 1)) : 0, icon: "avg" },
        ].map((card) => (
          <div key={card.label} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <p className="text-xs text-[var(--text-muted)] mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-[var(--text)]">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Daily trend chart (simple bar chart) */}
      {stats?.dailyTrend && stats.dailyTrend.length > 0 && (
        <div className="mb-8 p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-sm font-semibold text-[var(--text)] mb-4">近 14 天趋势</h2>
          <div className="flex items-end gap-1.5 h-32">
            {stats.dailyTrend.map((day) => {
              const max = Math.max(...stats.dailyTrend.map((d) => d.count), 1);
              const height = (day.count / max) * 100;
              const label = day.date.slice(5); // MM-DD
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-[var(--text-muted)]">{day.count}</span>
                  <div
                    className="w-full rounded-t bg-[var(--accent)] opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.date}: ${day.count}`}
                  />
                  <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two column layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top pages */}
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-sm font-semibold text-[var(--text)] mb-4">本周热门页面</h2>
          {stats?.topPages && stats.topPages.length > 0 ? (
            <ul className="space-y-2">
              {stats.topPages.map((page, i) => (
                <li key={page.path} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)] truncate mr-2 flex items-center gap-2">
                    <span className="text-xs font-mono text-[var(--accent)] w-4">{i + 1}</span>
                    {page.page_title || page.path}
                  </span>
                  <span className="text-xs font-medium text-[var(--text)] whitespace-nowrap">
                    {page.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">暂无数据</p>
          )}
        </div>

        {/* Top referrers */}
        <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <h2 className="text-sm font-semibold text-[var(--text)] mb-4">本周来源</h2>
          {stats?.topReferrers && stats.topReferrers.length > 0 ? (
            <ul className="space-y-2">
              {stats.topReferrers.map((ref, i) => (
                <li key={ref.referrer} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)] truncate mr-2 flex items-center gap-2">
                    <span className="text-xs font-mono text-[var(--accent)] w-4">{i + 1}</span>
                    {new URL(ref.referrer).hostname}
                  </span>
                  <span className="text-xs font-medium text-[var(--text)] whitespace-nowrap">
                    {ref.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">暂无数据</p>
          )}
        </div>
      </div>
    </div>
  );
}
