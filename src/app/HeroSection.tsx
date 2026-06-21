"use client";

import CatIcon from "@/components/icons/CatIcon";
import TypingText from "@/components/TypingText";

export default function HeroSection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="mb-16 text-center py-12">
      <div className="cat-float mb-4 flex justify-center">
        <CatIcon size={100} className="fill-[var(--accent)] opacity-80" />
      </div>
      <h1 className="text-4xl font-bold mb-3 text-[var(--text)]">
        <TypingText text={title} speed={100} />
      </h1>
      <p className="text-lg text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
        {subtitle}
      </p>
      <div className="mt-6 flex justify-center gap-3 text-xs text-[var(--text-muted)] opacity-40">
        <span>code</span>
        <span>·</span>
        <span>write</span>
        <span>·</span>
        <span>think</span>
      </div>
    </section>
  );
}
