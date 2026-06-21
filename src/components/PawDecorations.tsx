"use client";

import { useEffect, useState, useRef } from "react";

function PawPrintSVG({ size, opacity, rotation }: { size: number; opacity: number; rotation: number }) {
  return (
    <svg
      width={size}
      height={size * (1024 / 1063)}
      viewBox="0 0 1063 1024"
      style={{ transform: `rotate(${rotation}deg)`, opacity, display: "block" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M587.303385 1009.152c-40.172308-1.181538-83.219692-7.089231-128.393847-21.543385-177.703385-53.169231-272.738462-184.241231-233.156923-320.590769 38.675692-132.568615 196.923077-205.193846 375.177847-172.110769l7.68 1.811692c171.52 79.990154 260.962462 217.875692 218.427076 349.499077-27.766154 102.754462-118.390154 162.658462-239.734153 162.934154z m-71.089231-444.849231c-105.078154 0-193.063385 48.364308-214.646154 124.258462-29.814154 94.129231 42.535385 183.611077 178.884923 223.192615 136.388923 39.542154 245.602462 4.135385 274.550154-86.173538 28.947692-90.348308-40.723692-191.291077-171.795692-253.912616-23.000615-5.316923-43.086769-5.907692-66.993231-7.364923z m-359.266462-54.665846c-8.546462 2.087385-16.226462 0.315077-27.726769-2.363077-72.940308-16.817231-118.390154-100.076308-98.855385-184.516923 9.728-42.180923 29.184-74.043077 63.133539-98.579692 33.988923-24.497231 72.073846-31.901538 106.574769-23.906462 34.540308 7.995077 68.529231 36.036923 85.307077 68.214154 15.950769 35.997538 23.315692 74.082462 13.587692 116.302769-20.676923 72.034462-80.896 122.801231-142.020923 124.849231z m14.808616-239.104c-12.406154 1.181538-20.992 3.229538-31.31077 12.996923-15.044923 12.681846-27.175385 30.089846-32.492307 53.129846-10.633846 46.08 12.996923 83.849846 39.857231 90.033231 26.860308 6.183385 64.669538-17.408 75.303384-63.448615a96.728615 96.728615 0 0 0-5.907692-61.991385c-8.861538-14.178462-18.589538-24.497231-33.949539-28.041846l-11.500307-2.678154z m700.770461 238.592c-12.406154 1.181538-23.906462-1.496615-39.266461-5.041231-48.994462-15.36-78.532923-62.582154-84.401231-124.573538-5.907692-61.991385 16.817231-125.44 59.076923-168.251077 42.180923-42.811077 98.264615-58.131692 143.438769-43.677539 29.814154 10.909538 53.169231 32.492308 69.947077 64.669539 21.858462 45.449846 21.858462 97.988923 1.772308 149.937231-25.403077 74.988308-89.481846 124.849231-150.567385 126.936615z m-13.863384-79.990154c25.993846 10.043077 72.310154-15.635692 93.302153-71.443692 10.909538-29.814154 11.224615-66.126769 0.275693-88.851692-5.907692-9.452308-11.815385-18.904615-22.449231-25.403077-18.274462-8.270769-40.999385 2.678154-61.676308 22.134154-26.269538 26.269538-39.857231 67.623385-36.312615 104.802461-2.363077 27.766154 8.546462 50.491077 26.860308 58.761846z m-362.811077-39.305846c-32.452923 0.590769-65.220923-15.044923-87.670154-40.448-35.131077-40.448-48.679385-104.211692-34.500923-165.612308 14.178462-61.44 54.311385-112.758154 103.581538-133.710769 49.348923-20.952615 103.069538-8.546462 138.200616 31.901539 35.091692 40.448 48.679385 104.211692 34.500923 165.612307-14.178462 61.400615-54.350769 112.758154-103.620923 133.71077-20.952615 3.229538-34.264615 8.270769-50.491077 8.546461z m-48.403693-193.063385c-8.861538 38.360615-1.457231 76.445538 17.99877 97.122462 12.721231 15.044923 28.041846 18.589538 46.08 10.633846 26.545231-10.043077 49.860923-41.038769 58.722461-79.399384 8.861538-38.4 1.496615-76.484923-17.998769-97.122462-12.681846-15.084308-28.041846-18.628923-46.040615-10.633846-27.451077 13.863385-50.806154 44.859077-58.761847 79.399384z"
        fill="var(--accent)"
      />
    </svg>
  );
}

export default function PawDecorations() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Direct DOM scroll animation — skips React rendering entirely
  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    // Collect child elements and their data
    const items: { el: HTMLElement; depth: number; phase: number }[] = [];
    for (let i = 0; i < container.children.length; i++) {
      const el = container.children[i] as HTMLElement;
      items.push({
        el,
        depth: parseFloat(el.dataset.depth || "0.5"),
        phase: parseFloat(el.dataset.phase || "0"),
      });
    }

    let ticking = false;

    const update = () => {
      const scrollY = window.scrollY;
      for (const item of items) {
        const pY = scrollY * item.depth * 0.04;
        const wX = Math.sin(scrollY * 0.002 + item.phase) * item.depth * 3;
        item.el.style.transform = `translate(-50%, -50%) translateY(${pY}px) translateX(${wX}px)`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mounted]);

  if (!mounted) return null;

  // Generate paw positions during render (same as original)
  type PawData = {
    top: string;
    left: string;
    size: number;
    opacity: number;
    rotation: number;
    depth: number;
    phase: number;
  };

  const paws: PawData[] = [];
  const rows = 12;
  const cols = 16;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const xPos = (c / (cols - 1)) * 2 - 1;
      const absX = Math.abs(xPos);
      const baseSize = 25 + absX * 45;
      const size = baseSize + (Math.random() - 0.5) * 10;
      const skipChance = 0.9 - absX * 0.7;
      if (Math.random() < skipChance) continue;
      const opacity = 0.08 + absX * 0.1;
      const rot = xPos * 40 + (Math.random() - 0.5) * 10;
      const maxJitter = (100 / cols) * 0.25;

      paws.push({
        top: `${(r / rows) * 100 + (Math.random() - 0.5) * (100 / rows) * 0.5}%`,
        left: `${(c / cols) * 100 + (Math.random() - 0.5) * maxJitter}%`,
        size: Math.round(size),
        opacity,
        rotation: Math.round(rot),
        depth: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  return (
    <div
      ref={containerRef}
      className="paw-deco-container"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: -1, overflow: "hidden" }}
    >
      {paws.map((p, i) => (
        <div
          key={i}
          data-depth={p.depth}
          data-phase={p.phase}
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            transform: `translate(-50%, -50%)`,
            willChange: "transform",
          }}
        >
          <div className="cat-paw-float" style={{ animationDelay: `${(i % 5) * 0.6}s` }}>
            <PawPrintSVG size={p.size} opacity={p.opacity} rotation={p.rotation} />
          </div>
        </div>
      ))}
    </div>
  );
}
