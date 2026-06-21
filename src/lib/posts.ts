import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
  image?: string;
  updated?: string;
  published: boolean;
}

export interface Post extends PostMeta {
  content: string;
}

function parseDate(dateStr: string): Date {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

  const postsWithMtime = files.map((file) => {
    const filePath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);

    const publishDate = data.date || "1970-01-01";

    // Get file mtime as the update date
    const stats = fs.statSync(filePath);
    const fileMtime = formatDate(stats.mtime);
    // Only show updated if it differs from publish date
    const updated = fileMtime !== formatDate(parseDate(publishDate)) ? fileMtime : undefined;

    return {
      slug: file.replace(/\.md$/, ""),
      title: data.title || file,
      date: publishDate,
      tags: data.tags || [],
      description: data.description || "",
      image: data.image || undefined,
      updated,
      published: data.published !== false,
      mtime: stats.mtime.getTime(),
    };
  });

  return postsWithMtime
    .filter((p) => p.published)
    .sort((a, b) => {
      const dateDiff = parseDate(b.date).getTime() - parseDate(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      // Same date: newest file modification first
      return b.mtime - a.mtime;
    })
    .map(({ mtime, ...post }) => post as PostMeta);
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const publishDate = data.date || "1970-01-01";
  const stats = fs.statSync(filePath);
  const fileMtime = formatDate(stats.mtime);
  const updated = fileMtime !== formatDate(parseDate(publishDate)) ? fileMtime : undefined;

  return {
    slug,
    title: data.title || slug,
    date: publishDate,
    tags: data.tags || [],
    description: data.description || "",
    image: data.image || undefined,
    updated,
    published: data.published !== false,
    content,
  };
}
