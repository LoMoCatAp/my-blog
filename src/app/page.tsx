import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import CatIcon from "@/components/icons/CatIcon";
import { MailIcon } from "@/components/icons/Icons";
import { getSiteContent } from "@/lib/site-content";
import { getDb } from "@/lib/db";
import { t } from "@/lib/i18n";
import HeroSection from "./HeroSection";

export default function Home() {
  const posts = getAllPosts();
  const content = getSiteContent();

  // Fetch view counts for all posts
  const db = getDb();
  const viewRows = db
    .prepare("SELECT slug, count FROM views")
    .all() as { slug: string; count: number }[];
  const viewMap = new Map(viewRows.map((r) => [r.slug, r.count]));

  return (
    <div>
      <HeroSection title={content.heroTitle} subtitle={content.heroSubtitle} />

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <MailIcon size={64} className="mx-auto mb-4 opacity-40" />
          <p className="text-xl">还没有文章</p>
          <p className="mt-2 text-sm">
            在 <code className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 px-2 py-0.5 rounded">src/content/posts/</code>{" "}
            下创建 .md 文件即可发布
          </p>
        </div>
      ) : (
        <div className="md:flex md:gap-12">
          <div className="flex-1 space-y-10">
            {posts.filter((_, i) => i % 2 === 0).map((post) => (
              <PostCard key={post.slug} post={post} views={viewMap.get(post.slug) || 0} side="left" />
            ))}
          </div>
          <div className="flex-1 space-y-10 md:mt-[180px]">
            {posts.filter((_, i) => i % 2 === 1).map((post) => (
              <PostCard key={post.slug} post={post} views={viewMap.get(post.slug) || 0} side="right" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
