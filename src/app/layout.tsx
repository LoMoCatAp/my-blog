import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";
import I18nProvider from "@/components/I18nProvider";
import PawDecorations from "@/components/PawDecorations";
import MusicPlayer from "@/components/MusicPlayer";
import AnalyticsTracker from "@/components/analytics/Tracker";
import CatIcon from "@/components/icons/CatIcon";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "LomoCat's Blog",
  description: "洛陌的猫窝 — 用文字记录思考，用代码改变世界",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = getSiteContent();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <I18nProvider>
            <AnalyticsTracker />
          <PawDecorations />
            <Header />
            <MusicPlayer />
            <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
            <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text-muted)]">
              <div className="mb-3 flex justify-center">
                <CatIcon size={40} className="fill-[var(--accent)] opacity-40" />
              </div>
              <p>{content.footerText}</p>
            </footer>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
