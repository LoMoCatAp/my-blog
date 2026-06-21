import MarkdownRenderer from "@/app/posts/[slug]/MarkdownRenderer";
import { getSiteContent } from "@/lib/site-content";

export const metadata = {
  title: "关于 - LomoCat's Blog",
  description: "关于洛陌和这个博客",
};

export default function AboutPage() {
  const content = getSiteContent();

  return (
    <article>
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">关于</h1>
      </header>
      <div className="prose">
        <MarkdownRenderer content={content.aboutContent} />
      </div>
    </article>
  );
}
