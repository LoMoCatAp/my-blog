"use client";

import { useState, useCallback, useRef } from "react";
import { CheckIcon } from "./icons/Icons";

/** Copy text to clipboard with fallback for HTTP (no HTTPS required) */
async function copyToClipboard(text: string): Promise<boolean> {
  // Modern API (requires HTTPS)
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to fallback
    }
  }
  // Fallback: create temp textarea
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setFailed(true);
      setTimeout(() => setFailed(false), 2000);
    }
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-mono
        bg-white/10 hover:bg-white/20 text-white/60 hover:text-white/90
        transition-all opacity-0 group-hover:opacity-100"
      title="复制代码"
    >
      {copied ? (
        <span className="flex items-center gap-1">
          <CheckIcon size={12} /> 已复制
        </span>
      ) : failed ? (
        "复制失败"
      ) : (
        "复制"
      )}
    </button>
  );
}
