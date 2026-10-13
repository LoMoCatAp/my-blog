import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata = { title: "文章" };
export default function PostsPage() {
  const posts = getAllPosts();
  return <section className="py-6"><h1 className="text-3xl font-semibold mb-8">文章</h1><div>{posts.map(post => <article key={post.slug} className="py-6 border-b border-[var(--border)]"><time className="text-xs text-[var(--text-muted)]">{post.date}</time><h2 className="text-xl font-semibold mt-2 mb-2"><Link href={`/posts/${post.slug}`} className="hover:text-[var(--accent-dark)]">{post.title}</Link></h2><p className="text-sm text-[var(--text-muted)] leading-relaxed">{post.description}</p></article>)}</div></section>;
}
