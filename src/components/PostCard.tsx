"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { EyeIcon, EditIcon } from "./icons/Icons";

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

function getCover(slug: string): string {
  if (slug.includes("hello")) return COVERS[0];
  let hash = 0;
  for (const ch of slug) hash = ((hash << 5) - hash) + ch.charCodeAt(0);
  return COVERS[Math.abs(hash) % COVERS.length];
}

const TAG_COLORS: Record<string, string> = {
  "随笔": "bg-pink-200 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200",
  "技术": "bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
  "Next.js": "bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200",
  "Minecraft": "bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-200",
  "游戏": "bg-indigo-200 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200",
  "博客": "bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
};

function getTagStyle(tag: string) {
  return TAG_COLORS[tag] || "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
}

export default function PostCard({ post, views: initialViews, index = 0, side = "left" }: { post: PostMeta; views?: number; index?: number; side?: "left" | "right" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);
  const [visibility, setVisibility] = useState(0);
  const sideSign = side === "left" ? -1 : 1;

  // Progressive visibility via scroll listener (no IntersectionObserver toggling)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // entryZone: card enters 200px before viewport bottom
      const entryStart = vh + 200;
      const entryEnd = vh - 300;
      // exitZone: card exits 200px before viewport top
      const exitStart = -200;
      const exitEnd = rect.height - 200;

      let alpha = 1;
      // Fade in (card entering from bottom)
      if (rect.top > entryStart) {
        alpha = 0;
      } else if (rect.top > entryEnd) {
        alpha = 1 - (rect.top - entryEnd) / (entryStart - entryEnd);
      }
      // Fade out (card leaving from top)
      if (rect.bottom < exitStart) {
        alpha = 0;
      } else if (rect.bottom < exitEnd) {
        alpha = (rect.bottom - exitStart) / (exitEnd - exitStart);
      }
      setVisibility(Math.max(0, Math.min(1, alpha)));
    };

    const onScroll = () => requestAnimationFrame(update);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onMove = useCallback((e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -24, y: ((e.clientX - r.left) / r.width - 0.5) * 24 });
  }, []);
  const onEnter = useCallback(() => setHover(true), []);
  const onLeave = useCallback(() => { setHover(false); setTilt({ x: 0, y: 0 }); }, []);

  const views = initialViews ?? 0;
  const cover = post.image || getCover(post.slug);

  const t3d = `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`;

  // Progressive fade: position → transforms
  const fadeTx = Math.round((1 - visibility) * sideSign * 120);
  const fadeTy = Math.round((1 - visibility) * 30);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        opacity: hover ? 1 : visibility,
        transform: hover ? t3d : `translate(${fadeTx}px, ${fadeTy}px)`,
        transition: hover ? "transform 0.12s ease-out, box-shadow 0.3s ease" : "transform 0.15s linear",
        zIndex: hover ? 10 : 1,
      }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden group"
    >
      <div
        style={{ boxShadow: hover ? "0 24px 48px rgba(0,0,0,0.15)" : "0 1px 3px rgba(0,0,0,0.06)" }}
        className="transition-shadow duration-300"
      >
        <Link href={`/posts/${post.slug}`}>
          <div className="relative h-44 overflow-hidden">
            <img src={cover} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-3 flex gap-2">
              {post.tags.map((tag, i) => (
                <span key={tag} className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300 ${getTagStyle(tag)}`}
                  style={{ transform: hover ? "translateY(0)" : "translateY(8px)", opacity: hover ? 1 : 0, transitionDelay: `${i * 0.05}s` }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </Link>
        <div className="p-5" style={{ background: "var(--card)" }}>
          <Link href={`/posts/${post.slug}`} className="group block">
            <h2 className="text-lg font-semibold text-[var(--text)] group-hover:text-[var(--accent-dark)] transition-colors leading-snug">{post.title}</h2>
          </Link>
          {post.description && <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2">{post.description}</p>}
          <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>
              <time>{post.date}</time>
              {post.updated && <span className="ml-2 opacity-60 inline-flex items-center gap-0.5"><EditIcon size={12} />{post.updated}</span>}
            </span>
            <span className="inline-flex items-center gap-1"><EyeIcon size={14} />{views} 次阅读</span>
          </div>
        </div>
      </div>
    </div>
  );
}
