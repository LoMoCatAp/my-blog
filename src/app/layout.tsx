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
              <p className="mt-2">
                <a
                  href="https://beian.miit.gov.cn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--accent)] transition-colors"
                >
                  鲁ICP备2026035862号-1
                </a>
              </p>
              <p className="mt-2 flex items-center justify-center gap-1">
                <img src="/beian-icon.png" alt="" className="inline-block w-3.5 h-3.5" />
                <a
                  href="https://beian.mps.gov.cn/#/query/webSearch?code=37030502001093"
                  rel="noreferrer"
                  target="_blank"
                  className="hover:text-[var(--accent)] transition-colors"
                >
                  鲁公网安备37030502001093号
                </a>
              </p>
            </footer>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
