import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { getDb } from "@/lib/db";
import MarkdownRenderer from "./MarkdownRenderer";
import Comments from "@/components/Comments";
import TableOfContents from "@/components/TableOfContents";
import ShareLink from "@/components/ShareLink";
import { extractToc } from "@/lib/toc";
import { CalendarIcon, EditIcon, EyeIcon } from "@/components/icons/Icons";

const COVERS = [
  "https://cdn2.thecatapi.com/images/0iSghgPeZ.jpg",
  "https://cdn2.thecatapi.com/images/16k.jpg",
  "https://cdn2.thecatapi.com/images/1ou.jpg",
  "https://cdn2.thecatapi.com/images/242.jpg",
  "https://cdn2.thecatapi.com/images/2n4.jpg",
  "https://cdn2.thecatapi.com/images/3b8.jpg",
  "https://cdn2.thecatapi.com/images/3kh.jpg",
  "https://cdn2.thecatapi.com/images/42e.jpg",
  "https://cdn2.thecatapi.com/images/42n.jpg",
  "https://cdn2.thecatapi.com/images/54m.jpg",
  "https://cdn2.thecatapi.com/images/560.jpg",
  "https://cdn2.thecatapi.com/images/737.jpg",
  "https://cdn2.thecatapi.com/images/9av.jpg",
  "https://cdn2.thecatapi.com/images/a16.png",
  "https://cdn2.thecatapi.com/images/a7m.jpg",
  "https://cdn2.thecatapi.com/images/aav.jpg",
  "https://cdn2.thecatapi.com/images/abo.jpg",
  "https://cdn2.thecatapi.com/images/acd.jpg",
  "https://cdn2.thecatapi.com/images/amc.jpg",
  "https://cdn2.thecatapi.com/images/b1q.jpg",
  "https://cdn2.thecatapi.com/images/b4j.jpg",
  "https://cdn2.thecatapi.com/images/bid.jpg",
  "https://cdn2.thecatapi.com/images/bn0.jpg",
  "https://cdn2.thecatapi.com/images/bo1.jpg",
  "https://cdn2.thecatapi.com/images/bvg.jpg",
  "https://cdn2.thecatapi.com/images/clf.jpg",
  "https://cdn2.thecatapi.com/images/co3.jpg",
  "https://cdn2.thecatapi.com/images/dbo.jpg",
  "https://cdn2.thecatapi.com/images/dd7.jpg",
  "https://cdn2.thecatapi.com/images/eie.jpg",
  "https://cdn2.thecatapi.com/images/ik.jpg",
  "https://cdn2.thecatapi.com/images/MjAzMzQ0NA.jpg",
  "https://cdn2.thecatapi.com/images/MjAzOTQ2MA.jpg",
  "https://cdn2.thecatapi.com/images/MTcxNDI5Mg.jpg",
  "https://cdn2.thecatapi.com/images/MTcyMTMxOQ.jpg",
  "https://cdn2.thecatapi.com/images/MTg2Mzk0Mg.jpg",
  "https://cdn2.thecatapi.com/images/MTg5NTIwMw.jpg",
  "https://cdn2.thecatapi.com/images/MTk4NTc0NQ.jpg",
  "https://cdn2.thecatapi.com/images/MTU4MDMzNg.jpg",
  "https://cdn2.thecatapi.com/images/nNG4PzUzN.jpg",
];

function getCoverImage(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  return COVERS[Math.abs(hash) % COVERS.length];
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "404 - Not Found" };
  const cover = post.image || getCoverImage(slug);
  return {
    title: `${post.title} - LomoCat's Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://lomocat.xyz/posts/${slug}`,
      images: [{ url: cover, width: 800, height: 400 }],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Record view
  const db = getDb();
  db.prepare(
    "INSERT INTO views (slug, count) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET count = count + 1"
  ).run(slug);

  const row = db
    .prepare("SELECT count FROM views WHERE slug = ?")
    .get(slug) as { count: number } | undefined;
  const views = row?.count ?? 1;

  // Reading time: ~200 words/min for Chinese text (use character count)
  const charCount = post.content.length;
  const readTime = Math.max(1, Math.round(charCount / 400));

  const tocItems = extractToc(post.content);
  const coverImage = post.image || getCoverImage(slug);

  return (
    <>
      <TableOfContents items={tocItems} />
      {/* Shift article right by half the ToC width on desktop to balance visually */}
      <article className="lg:translate-x-[30px]">
        {/* Cover image */}
        <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8 bg-[var(--bg-secondary)]">
          <img
            src={coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              {post.title}
            </h1>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--text-muted)] mb-8">
          <span className="flex items-center gap-1">
            <CalendarIcon size={15} />
            发布: {post.date}
          </span>
          {post.updated && (
            <span className="flex items-center gap-1">
              <EditIcon size={14} />
              更新: {post.updated}
            </span>
          )}
          <span className="flex items-center gap-1">
            <EyeIcon size={17} />
            {views} 次阅读
          </span>
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {readTime} 分钟
          </span>
          {post.tags.length > 0 && (
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-orange-200 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="prose max-w-none">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Share link */}
        <div className="mt-10 flex items-center justify-center border-t border-[var(--border)] pt-6">
          <ShareLink />
        </div>

        {/* Comments */}
        <Comments slug={slug} />
      </article>
    </>
  );
}
