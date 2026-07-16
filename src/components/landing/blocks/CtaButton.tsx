"use client";

import { useCallback } from "react";
import { useLandingInteractive } from "../LandingInteractive";
import { safeHttpUrl } from "./url";

/**
 * The one clickable CTA primitive on a landing page, shared by HeroBlock
 * (server) and ButtonBlock (client) so both get identical styling and
 * identical scroll/link semantics.
 */
interface CtaButtonProps {
  label: string;
  action: "scroll" | "link";
  /** Target block id for action === 'scroll'. */
  targetBlockId?: string;
  /** Destination for action === 'link'. Must be http(s) or nothing renders. */
  url?: string;
  className?: string;
}

const BASE_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm sm:text-base " +
  "font-semibold text-white shadow-lg transition-opacity hover:opacity-90 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A9AFF] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export function CtaButton({ label, action, targetBlockId, url, className = "" }: CtaButtonProps) {
  const { scrollToBlock, trackEvent } = useLandingInteractive();

  // Only a scroll CTA counts as a "booking form start" (it jumps the visitor to
  // the form). An off-site link CTA is not a form-start, so it does NOT emit
  // cta_clicked — otherwise it would inflate the analytics form-start stage,
  // which unions cta_clicked with field_focused.
  const handleScroll = useCallback(() => {
    trackEvent("cta_clicked", targetBlockId);
    if (!targetBlockId) return;
    scrollToBlock(targetBlockId);
  }, [scrollToBlock, trackEvent, targetBlockId]);

  const classes = `${BASE_CLASS} ${className}`.trim();
  const style = { backgroundColor: "var(--landing-brand)" };

  if (action === "link") {
    const href = safeHttpUrl(url);
    // A link CTA with no usable destination is dead UI — render nothing rather
    // than a button that silently does nothing when tapped.
    if (!href) return null;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} style={style}>
        {label}
      </a>
    );
  }

  if (!targetBlockId) return null;

  return (
    <button type="button" onClick={handleScroll} className={classes} style={style}>
      {label}
    </button>
  );
}
