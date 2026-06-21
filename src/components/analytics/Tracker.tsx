"use client";

import { useEffect } from "react";

/**
 * Tracks page visits silently. Fires once per page navigation.
 * Records path, referrer, and page title.
 */
export default function AnalyticsTracker() {
  useEffect(() => {
    let cancelled = false;

    const track = () => {
      const path = window.location.pathname;
      const referrer = document.referrer || "";
      const pageTitle = document.title || "";

      // Don't track admin pages
      if (path.startsWith("/admin")) return;

      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, referrer, pageTitle }),
        // Keepalive ensures the request completes even if navigating away
        keepalive: true,
      }).catch(() => {
        // Silent fail — tracking is non-critical
      });
    };

    // Track on initial load
    track();

    // Track on client-side navigation (Next.js route changes)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      if (!cancelled) setTimeout(track, 100);
    };
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      if (!cancelled) setTimeout(track, 100);
    };

    return () => {
      cancelled = true;
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return null; // No visual output
}
