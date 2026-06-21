"use client";

import { useEffect, useState, useRef } from "react";
import type { TocItem } from "@/lib/toc";
import { useI18n } from "./I18nProvider";

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState("");
  const { t } = useI18n();
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const ids = items.map((i) => i.id);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => {
            const idxA = ids.indexOf(a.target.id);
            const idxB = ids.indexOf(b.target.id);
            return idxA - idxB;
          });
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observerRef.current.observe(el);
    }

    // Set initial active heading
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setActiveId(item.id);
          break;
        }
      }
    }

    return () => observerRef.current?.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      // Offset for sticky header (~64px) + some breathing room
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
    }
  };

  return (
    <nav
      className="hidden lg:block fixed"
      style={{
        // Content center is at 50%. Content left edge is at calc(50% - 384px) (half of max-w-3xl).
        // ToC right edge should sit 24px to the left of content.
        // ToC width is ~190px, so left = calc(50% - 384px - 24px - 190px)
        left: "calc(max(1rem, calc(50% - 598px)))",
        top: "7rem",
        width: "190px",
        maxHeight: "calc(100vh - 8rem)",
        overflowY: "auto",
      }}
    >
      <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
        {t("toc.title")}
      </div>
      <ul className="space-y-0.5 border-l-2 border-[var(--border)]">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className={`block text-xs py-1.5 pr-2 transition-all duration-200 ${
                activeId === item.id
                  ? "text-[var(--accent)] font-medium"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
              style={{ paddingLeft: `${(item.level - 2) * 12 + 14}px` }}
            >
              <span
                className={`block truncate transition-all duration-200 ${
                  activeId === item.id
                    ? "border-l-2 border-[var(--accent)] -ml-[2px] pl-[10px]"
                    : ""
                }`}
              >
                {item.text}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
