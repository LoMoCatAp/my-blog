"use client";

import { useEffect, useState } from "react";

export default function TypingText({ text, speed = 80, className = "" }: { text: string; speed?: number; className?: string }) {
  const [displayed, setDisplayed] = useState(text);
  const [done, setDone] = useState(true);

  useEffect(() => {
    if (!text || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {setDisplayed(text);setDone(true);return;}
    let i = 0;
    setDisplayed("");
    setDone(false);
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className={className} style={{display:"inline-grid"}}>
      <span aria-hidden="true" style={{gridArea:"1 / 1",visibility:"hidden"}}>{text}</span>
      <span style={{gridArea:"1 / 1"}}>{displayed}{!done && <span className="typing-cursor" />}</span>
    </span>
  );
}
