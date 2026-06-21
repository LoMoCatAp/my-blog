import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "标签 - LomoCat's Blog",
  description: "按标签浏览文章",
};

export default function TagsPage() {
  const posts = getAllPosts();

  // Collect all tags with counts
  const tagMap = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }

  const tags = Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-[var(--text)]">标签</h1>
        <p className="text-[var(--text-muted)] mt-2">共 {tags.length} 个标签</p>
      </header>

      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {tags.map(([tag, count]) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="group"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all text-sm">
              {tag}
              <span className="text-xs opacity-60 group-hover:opacity-100">({count})</span>
            </span>
          </Link>
        ))}
      </div>

      {/* Group posts by tag */}
      {tags.map(([tag]) => {
        const taggedPosts = posts.filter((p) => p.tags.includes(tag));
        return (
          <section key={tag} className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-[var(--accent-dark)] flex items-center gap-2">
              <span>#</span>{tag}
              <span className="text-sm font-normal text-[var(--text-muted)]">({taggedPosts.length})</span>
            </h2>
            <div className="space-y-3">
              {taggedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  className="block p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[var(--text)] hover:text-[var(--accent-dark)]">
                      {post.title}
                    </span>
                    <time className="text-xs text-[var(--text-muted)]">{post.date}</time>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
