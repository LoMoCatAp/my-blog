"use client";

import { useEffect, useRef } from "react";
import { mountOrbitBackground } from "@/lib/orbit-background";
import "./OrbitBackground.css";

export default function PawDecorations() {
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const background = mountOrbitBackground(host);
    return () => background.destroy();
  }, []);
  return <div ref={hostRef} className="lomo-orbit-background" aria-hidden="true" />;
}
