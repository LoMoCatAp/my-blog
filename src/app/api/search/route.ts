import { NextRequest, NextResponse } from "next/server";
import { getAllPosts, getPostBySlug } from "@/lib/posts";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim()?.toLowerCase() || "";
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const posts = getAllPosts();
  const results = posts
    .map((meta) => {
      const title = meta.title.toLowerCase();
      const desc = meta.description.toLowerCase();
      const tagText = meta.tags.join(" ").toLowerCase();

      const inTitle = title.includes(q);
      const inDesc = desc.includes(q);
      const inTags = tagText.includes(q);

      // Check content match if needed
      let inContent = false;
      let snippet = "";
      if (!inTitle && !inDesc && !inTags) {
        const post = getPostBySlug(meta.slug);
        if (post) {
          const content = post.content.toLowerCase();
          inContent = content.includes(q);
          if (inContent) {
            const idx = content.indexOf(q);
            const start = Math.max(0, idx - 40);
            const end = Math.min(post.content.length, idx + q.length + 60);
            let prefix = "";
            let suffix = "";
            if (start > 0) prefix = "...";
            if (end < post.content.length) suffix = "...";
            snippet = prefix + post.content.slice(start, end) + suffix;
          }
        }
      }

      // If matched by title/desc/tags, also try to get a snippet
      if ((inTitle || inDesc || inTags) && !snippet) {
        const post = getPostBySlug(meta.slug);
        if (post) {
          const contentLower = post.content.toLowerCase();
          if (contentLower.includes(q)) {
            const idx = contentLower.indexOf(q);
            const start = Math.max(0, idx - 40);
            const end = Math.min(post.content.length, idx + q.length + 60);
            let prefix = "";
            let suffix = "";
            if (start > 0) prefix = "...";
            if (end < post.content.length) suffix = "...";
            snippet = prefix + post.content.slice(start, end) + suffix;
          }
        }
      }

      if (!inTitle && !inDesc && !inContent && !inTags) return null;

      return {
        slug: meta.slug,
        title: meta.title,
        date: meta.date,
        description: meta.description,
        tags: meta.tags,
        snippet,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ query: request.nextUrl.searchParams.get("q"), results });
}
