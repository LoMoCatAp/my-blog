import Link from "next/link";
import CatIcon from "@/components/icons/CatIcon";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <CatIcon size={80} className="fill-[var(--accent)] opacity-50 mb-6 cat-wiggle" />
      <h1 className="text-6xl font-bold text-[var(--text)] mb-2">404</h1>
      <p className="text-lg text-[var(--text-muted)] mb-8">
        这个页面被猫叼走了 🐱
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-all"
      >
        回首页
      </Link>
    </div>
  );
}
