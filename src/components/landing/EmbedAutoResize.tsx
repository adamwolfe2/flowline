"use client";

import { useEffect } from "react";

/**
 * Posts `myvsl:resize` messages to the parent frame so the embed script
 * (`/api/embed/[funnelId]/script.js`) can size the iframe to the landing
 * page's content. Without this the iframe stays pinned at its 500px min-height
 * and long landing pages are clipped.
 *
 * Mirrors the resize logic in `src/components/funnel/FunnelClient.tsx` (~:90).
 * Rendered only when the page is embedded (`isEmbed`), so it is inert on the
 * normal public page.
 */
export function EmbedAutoResize() {
  useEffect(() => {
    const sendResize = () => {
      try {
        const height = document.body.scrollHeight;
        window.parent.postMessage({ type: "myvsl:resize", height }, "*");
      } catch {
        // Silently ignore cross-origin errors
      }
    };
    sendResize();
    const observer = new ResizeObserver(sendResize);
    observer.observe(document.body);
    // Late-loading media (video iframes, calendar embeds) changes height after
    // first paint; a load listener catches what ResizeObserver on <body> may miss.
    window.addEventListener("load", sendResize);
    return () => {
      observer.disconnect();
      window.removeEventListener("load", sendResize);
    };
  }, []);

  return null;
}
