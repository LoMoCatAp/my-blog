import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/posts";

export async function generateStaticParams() {
  const posts = getAllPosts();
  const tags = new Set(posts.flatMap((p) => p.tags));
  return Array.from(tags).map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  return { title: `#${decodeURIComponent(tag)} - LomoCat's Blog` };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const posts = getAllPosts().filter((p) => p.tags.includes(tag));

  if (posts.length === 0) notFound();

  return (
    <div>
      <header className="mb-8">
        <Link
          href="/tags"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-dark)] mb-2 inline-block"
        >
          ← 所有标签
        </Link>
        <h1 className="text-3xl font-bold text-[var(--text)] flex items-center gap-2">
          <span className="text-[var(--accent-dark)]">#</span>
          {tag}
          <span className="text-lg font-normal text-[var(--text-muted)]">
            ({posts.length} 篇文章)
          </span>
        </h1>
      </header>

      <div className="space-y-4">
        {posts.map((post) => (
          <article
            key={post.slug}
            className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] transition-all"
          >
            <Link href={`/posts/${post.slug}`} className="group block">
              <h2 className="text-xl font-semibold group-hover:text-[var(--accent-dark)] transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{post.description}</p>
              <time className="mt-2 inline-block text-xs text-[var(--text-muted)]">{post.date}</time>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
