import { getDb } from "@/lib/db";

interface Link {
  id: number;
  name: string;
  url: string;
  description: string;
}

export const metadata = {
  title: "友链 - LomoCat's Blog",
  description: "友情链接",
};

export default function LinksPage() {
  const db = getDb();
  const links = db.prepare("SELECT id, name, url, description FROM links ORDER BY sort_order ASC, id ASC").all() as Link[];

  return (
    <div>
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-[var(--text)]">友情链接</h1>
        <p className="text-[var(--text-muted)] mt-2">
          {links.length === 0 ? "还没有友链，以后会有的 🐾" : `共 ${links.length} 个小伙伴`}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-hover)] hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-light)] flex items-center justify-center text-lg font-bold text-[var(--accent-dark)]">
                {link.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-[var(--text)] group-hover:text-[var(--accent-dark)] transition-colors truncate">
                  {link.name}
                </h2>
                {link.description && (
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{link.description}</p>
                )}
                <p className="text-xs text-[var(--accent)] mt-1 truncate opacity-70">{link.url}</p>
              </div>
              <span className="text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
