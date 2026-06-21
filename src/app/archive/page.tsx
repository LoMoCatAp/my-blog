import { getAllPosts } from "@/lib/posts";
import Link from "next/link";
import { EyeIcon } from "@/components/icons/Icons";
import { getDb } from "@/lib/db";

export const metadata = {
  title: "归档 - LomoCat's Blog",
  description: "所有文章按时间归档",
};

export default function ArchivePage() {
  const posts = getAllPosts();

  // Group by year → month
  const grouped: Record<string, Record<string, typeof posts>> = {};
  for (const post of posts) {
    const [year, month] = post.date.split("-");
    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][month]) grouped[year][month] = [];
    grouped[year][month].push(post);
  }

  // Get view counts
  const db = getDb();
  const viewRows = db
    .prepare("SELECT slug, count FROM views")
    .all() as { slug: string; count: number }[];
  const viewMap = new Map(viewRows.map((r) => [r.slug, r.count]));

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
  const totalPosts = posts.length;
  const totalViews = viewRows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">📚 归档</h1>
        <p className="text-sm text-[var(--text-muted)]">
          共 {totalPosts} 篇文章 · 累计 {totalViews.toLocaleString()} 次阅读
        </p>
      </div>

      <div className="space-y-10">
        {years.map((year) => (
          <section key={year}>
            <h2 className="text-2xl font-bold text-[var(--accent-dark)] mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-sm">
                {year}
              </span>
              {year}
            </h2>

            <div className="relative pl-6 border-l-2 border-[var(--border)]">
              {Object.keys(grouped[year])
                .sort((a, b) => Number(b) - Number(a))
                .map((month) => (
                  <div key={`${year}-${month}`} className="mb-6 relative">
                    {/* Month dot */}
                    <div className="absolute -left-[26px] top-1 w-3 h-3 rounded-full bg-[var(--accent)] border-2 border-[var(--bg)]" />
                    <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-3">
                      {month}月
                    </h3>
                    <div className="space-y-3">
                      {grouped[year][month].map((post) => (
                        <Link
                          key={post.slug}
                          href={`/posts/${post.slug}`}
                          className="block p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-base font-medium text-[var(--text)] group-hover:text-[var(--accent-dark)] transition-colors truncate">
                                {post.title}
                              </h4>
                              {post.description && (
                                <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-1">
                                  {post.description}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-3">
                                <span className="text-[10px] text-[var(--text-muted)]">
                                  {post.date}
                                </span>
                                {post.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] whitespace-nowrap shrink-0">
                              <EyeIcon size={13} />
                              {viewMap.get(post.slug) || 0}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
