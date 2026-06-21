"use client";

import Link from "next/link";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { useI18n } from "./I18nProvider";
import CatIcon from "./icons/CatIcon";

export default function Header() {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/search", label: t("nav.search") },
    { href: "/archive", label: t("nav.archive") },
    { href: "/games", label: t("nav.games") },
    { href: "/tags", label: t("nav.tags") },
    { href: "/links", label: t("nav.links") },
    { href: "/about", label: t("nav.about") },
    { href: "/feed.xml", label: t("nav.rss"), target: "_blank" },
  ];

  return (
    <header className="border-b border-[var(--border)] sticky top-0 z-50" style={{ background: "var(--bg-header)" }}>
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group" onClick={() => setMenuOpen(false)}>
          <span className="cat-wiggle inline-block">
            <CatIcon size={36} className="fill-[var(--accent)] group-hover:fill-[var(--accent-dark)] transition-colors" />
          </span>
          <span className="text-xl font-bold text-[var(--text)] group-hover:text-[var(--accent-dark)] transition-colors">
            LomoCat
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              target={l.target || undefined}
              className="text-[var(--text-muted)] hover:text-[var(--accent-dark)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className="lang-btn"
          >
            {lang === "zh" ? "EN" : "中"}
          </button>
          <button onClick={toggle} className="theme-btn" aria-label="切换主题">
            {theme === "light" ? (
              <svg viewBox="0 0 1024 1024" width={20} height={20} fill="currentColor">
                <path d="M525.963636 93.090909c225.745455 6.981818 404.945455 193.163636 404.945455 418.909091 0 230.4-188.509091 418.909091-418.909091 418.909091-174.545455 0-323.490909-107.054545-386.327273-256H139.636364c230.4 0 418.909091-188.509091 418.909091-418.909091 0-58.181818-11.636364-111.709091-32.581819-162.909091m0-93.090909c-30.254545 0-58.181818 13.963636-76.8 39.563636-18.618182 25.6-20.945455 60.509091-9.309091 88.436364 16.290909 41.890909 25.6 83.781818 25.6 128 0 179.2-146.618182 325.818182-325.818181 325.818182h-11.636364-2.327273c-30.254545 0-58.181818 13.963636-76.8 39.563636-18.618182 25.6-20.945455 60.509091-9.309091 88.436364C121.018182 900.654545 304.872727 1024 512 1024c281.6 0 512-230.4 512-512C1024 235.054545 807.563636 9.309091 528.290909 0h-2.327273z" />
              </svg>
            ) : (
              <svg viewBox="0 0 1024 1024" width={20} height={20} fill="currentColor">
                <path d="M512.000213 733.353497c-122.06857 0-221.353283-99.284713-221.353283-221.353284S389.931643 290.64693 512.000213 290.64693 733.353497 389.931643 733.353497 512.000213 634.026117 733.353497 512.000213 733.353497z m0-357.373767A136.148482 136.148482 0 0 0 375.97973 512.000213 136.148482 136.148482 0 0 0 512.000213 648.020697 136.148482 136.148482 0 0 0 648.020697 512.000213 136.148482 136.148482 0 0 0 512.000213 375.97973zM554.666613 171.735673A42.154403 42.154403 0 0 1 512.000213 213.335413c-23.551853 0-42.6664-18.645217-42.6664-41.59974V41.603153A42.154403 42.154403 0 0 1 512.000213 0.003413c23.551853 0 42.6664 18.645217 42.6664 41.59974v130.13252zM554.666613 982.397273A42.154403 42.154403 0 0 1 512.000213 1023.997013c-23.594519 0-42.666401-18.687883-42.666401-41.59974v-130.175186A42.111737 42.111737 0 0 1 512.000213 810.665013c23.551853 0 42.6664 18.60255 42.6664 41.59974v130.13252zM171.735673 469.333813c22.954523 0 41.59974 19.114547 41.59974 42.6664 0 23.594519-18.645217 42.6664-41.59974 42.6664H41.603153A42.154403 42.154403 0 0 1 0.003413 512.000213c0-23.551853 18.645217-42.6664 41.59974-42.6664h130.13252zM982.397273 469.333813c22.954523 0 41.59974 19.114547 41.59974 42.6664 0 23.594519-18.687883 42.6664-41.59974 42.6664h-130.175186A42.111737 42.111737 0 0 1 810.665013 512.000213c0-23.551853 18.60255-42.6664 41.59974-42.6664h130.13252zM241.239239 722.430898a42.06907 42.06907 0 0 1 59.562294 0.767995 42.111737 42.111737 0 0 1 0.767996 59.562295l-92.031425 92.074091a42.154403 42.154403 0 0 1-59.562295-0.853328 42.154403 42.154403 0 0 1-0.767995-59.562294l92.031425-91.988759zM814.462323 149.207814a42.154403 42.154403 0 0 1 59.562294 0.767995 42.154403 42.154403 0 0 1 0.767996 59.562295l-92.031425 92.031425a42.06907 42.06907 0 0 1-59.562295-0.767996 42.111737 42.111737 0 0 1-0.810661-59.562294l92.074091-92.031425zM241.239239 301.526862a42.19707 42.19707 0 0 0 59.604961-0.725329 42.111737 42.111737 0 0 0 0.767995-59.562294L209.538104 149.122481a42.154403 42.154403 0 0 0-59.562295 0.853328 42.111737 42.111737 0 0 0-0.767995 59.562295l92.031425 91.988758zM814.462323 874.792613a42.111737 42.111737 0 0 0 59.562294-0.810662 42.154403 42.154403 0 0 0 0.767996-59.562294l-92.031425-92.031425a42.06907 42.06907 0 0 0-59.562295 0.767995 42.111737 42.111737 0 0 0-0.810661 59.562294l92.074091 92.074092z" />
              </svg>
            )}
          </button>
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-all"
            aria-label="菜单"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-header)]">
          <nav className="max-w-3xl mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                target={l.target || undefined}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--accent-dark)] hover:bg-[var(--bg-secondary)] transition-all"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
