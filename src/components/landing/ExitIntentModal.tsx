"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { LandingConfig } from "@/types";
import { canFireExitIntent, resolveExitIntentCopy } from "@/lib/exit-intent";
import { useLandingInteractive } from "./LandingInteractive";

interface ExitIntentModalProps {
  funnelId: string;
  sessionId: string;
  isEmbed: boolean;
  exitIntent: LandingConfig["exitIntent"];
  /** Block to scroll to when the CTA is clicked (booking form / calendar). */
  targetBlockId?: string;
  brandColor: string;
}

/**
 * Desktop exit-intent popup. Fires once per session when the cursor leaves
 * through the top of the viewport before the visitor has converted. Mobile has
 * no reliable exit signal (mouseleave does not fire on touch), so it simply
 * never triggers there — a graceful no-op rather than a degraded modal.
 */
export function ExitIntentModal({
  funnelId,
  sessionId,
  isEmbed,
  exitIntent,
  targetBlockId,
  brandColor,
}: ExitIntentModalProps) {
  const { hasConverted, scrollToBlock, trackEvent } = useLandingInteractive();
  const [open, setOpen] = useState(false);

  const enabled = exitIntent?.enabled !== false;
  const isPreview = !sessionId || sessionId === "preview";

  // A ref mirrors hasConverted so the (once-attached) listener always reads the
  // latest value without re-binding on every conversion state change.
  const convertedRef = useRef(hasConverted);
  useEffect(() => {
    convertedRef.current = hasConverted;
  }, [hasConverted]);

  const storageKey = `myvsl-exit-intent-${funnelId}`;

  useEffect(() => {
    // Static guards that never change during a mount — bail before touching the
    // DOM listener when the popup can't fire at all here.
    if (!enabled || isEmbed || isPreview) return;

    let alreadyShown = false;
    try {
      alreadyShown = window.sessionStorage.getItem(storageKey) === "1";
    } catch {
      // sessionStorage can throw in private mode — treat as not-yet-shown.
    }
    if (alreadyShown) return;

    const handleMouseOut = (event: MouseEvent) => {
      // Only a real move out through the TOP edge counts. relatedTarget null +
      // clientY <= 0 filters out crossing into iframes/selects mid-page.
      if (event.relatedTarget !== null || event.clientY > 0) return;

      if (
        !canFireExitIntent({
          enabled,
          hasConverted: convertedRef.current,
          alreadyShown,
          isEmbed,
          isPreview,
        })
      ) {
        return;
      }

      alreadyShown = true;
      try {
        window.sessionStorage.setItem(storageKey, "1");
      } catch {
        // best-effort; still show once this mount even if we can't persist
      }
      setOpen(true);
      trackEvent("exit_intent_shown");
    };

    document.addEventListener("mouseout", handleMouseOut);
    return () => document.removeEventListener("mouseout", handleMouseOut);
  }, [enabled, isEmbed, isPreview, storageKey, trackEvent]);

  const close = useCallback(() => setOpen(false), []);

  const handleCta = useCallback(() => {
    setOpen(false);
    if (targetBlockId) scrollToBlock(targetBlockId);
    trackEvent("exit_intent_accepted");
  }, [targetBlockId, scrollToBlock, trackEvent]);

  // Escape-to-close while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  const copy = resolveExitIntentCopy(exitIntent);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A9AFF]"
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <h2
          id="exit-intent-title"
          className="text-2xl font-bold text-[#0A0A0A]"
          style={{ fontFamily: "var(--landing-font-heading)" }}
        >
          {copy.title}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-[#6B7280]">
          {copy.body}
        </p>

        <button
          type="button"
          onClick={handleCta}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A9AFF]"
          style={{ backgroundColor: brandColor }}
        >
          {copy.ctaLabel}
        </button>

        <button
          type="button"
          onClick={close}
          className="mt-3 text-sm text-[#9CA3AF] transition-colors hover:text-[#6B7280]"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
