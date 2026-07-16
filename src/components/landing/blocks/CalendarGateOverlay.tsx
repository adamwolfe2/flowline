"use client";

import { useCallback, useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { logger } from "@/lib/logger";
import { useLandingInteractive } from "../LandingInteractive";
import { trackLandingEvents } from "../trackLandingEvents";

interface CalendarGateOverlayProps {
  funnelId: string;
  sessionId: string;
  /** The calendar block id — used as the analytics stepKey, mirroring BookingFormBlock. */
  blockId: string;
  brandColor: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  /** Called once the lead is captured so the calendar can unlock. */
  onUnlock: () => void;
}

type Status = "idle" | "submitting";

// Deliberately permissive: the server is the authority on validity. This only
// catches obvious typos before a round-trip (mirrors BookingFormBlock).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A static, non-interactive faux month grid rendered behind the blur. We
// deliberately do NOT mount the real Cal.com embed until the lead is captured:
// loading the third-party script early would let a visitor tab/click into the
// booking iframe behind the blur and book WITHOUT being captured — defeating
// the gate. The skeleton reads as "a calendar is waiting" under heavy blur.
function CalendarSkeleton() {
  const cells = Array.from({ length: 35 }, (_, i) => i);
  return (
    <div
      className="pointer-events-none select-none blur-[6px]"
      aria-hidden="true"
      inert
    >
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-28 rounded bg-[#E5E7EB]" />
          <div className="flex gap-2">
            <div className="h-6 w-6 rounded bg-[#E5E7EB]" />
            <div className="h-6 w-6 rounded bg-[#E5E7EB]" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell) => (
            <div key={cell} className="aspect-square rounded-lg bg-[#F3F4F6]" />
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-9 flex-1 rounded-lg bg-[#F3F4F6]" />
          <div className="h-9 flex-1 rounded-lg bg-[#F3F4F6]" />
          <div className="h-9 flex-1 rounded-lg bg-[#F3F4F6]" />
        </div>
      </div>
    </div>
  );
}

/**
 * The blur_overlay gate presentation: a blurred, inert calendar skeleton with a
 * name/email capture card floating over it. On submit the visitor is captured
 * as a landing lead through the hardened /api/submit path (which nulls
 * score/tier and never trusts a client-supplied score), then `onUnlock` swaps
 * the skeleton for the live calendar embed.
 */
export function CalendarGateOverlay({
  funnelId,
  sessionId,
  blockId,
  brandColor,
  title,
  subtitle,
  ctaLabel,
  onUnlock,
}: CalendarGateOverlayProps) {
  const { trackEvent, markConverted } = useLandingInteractive();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const fieldFocusSent = useRef(false);
  const handleFieldFocus = useCallback(() => {
    // "Booking form starts" analytics stage: fire field_focused once per mount,
    // matching BookingFormBlock so the gate participates in the same waterfall.
    if (fieldFocusSent.current) return;
    fieldFocusSent.current = true;
    trackEvent("field_focused", blockId);
  }, [trackEvent, blockId]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (status === "submitting") return;

      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      if (!trimmedName) {
        setError("Please enter your name.");
        return;
      }
      if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail)) {
        setError("Please enter a valid email address.");
        return;
      }

      setError(null);
      setStatus("submitting");

      try {
        // Reuse the hardened submit path exactly as BookingFormBlock does. The
        // server allowlists these fields, stores a landing lead with null
        // score/tier, and fires the webhook fire-and-forget. Nothing here forges
        // a score/tier or invents lead columns.
        const response = await fetch(`/api/submit/${funnelId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "landing",
            fields: { name: trimmedName, email: trimmedEmail },
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Submit failed with status ${response.status}`);
        }

        const result = (await response.json().catch(() => ({}))) as { leadId?: string };

        // Analytics + session stitching (best-effort, never blocks the user).
        trackLandingEvents({ funnelId, sessionId, leadId: result?.leadId, blockId });

        // Lead captured — suppress exit-intent and reveal the real calendar.
        markConverted();
        onUnlock();
      } catch (err) {
        logger.error("[landing] calendar gate submit failed", {
          funnelId,
          blockId,
          error: err instanceof Error ? err.message : String(err),
        });
        setError("Something went wrong. Please try again.");
        setStatus("idle");
      }
    },
    [status, name, email, funnelId, sessionId, blockId, onUnlock, markConverted]
  );

  const nameId = `gate-name-${blockId}`;
  const emailId = `gate-email-${blockId}`;
  const isBusy = status === "submitting";

  return (
    <div className="relative">
      <CalendarSkeleton />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white/95 p-6 text-center shadow-xl backdrop-blur-sm"
          role="dialog"
          aria-modal="false"
          aria-labelledby={`gate-title-${blockId}`}
        >
          <h3
            id={`gate-title-${blockId}`}
            className="text-lg font-bold text-[#0A0A0A] sm:text-xl"
            style={{ fontFamily: "var(--landing-font-heading)" }}
          >
            {title}
          </h3>
          <p className="mt-1.5 text-sm text-[#6B7280]">{subtitle}</p>

          <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3 text-left">
            <div>
              <label htmlFor={nameId} className="mb-1.5 block text-sm font-medium text-[#374151]">
                Name
              </label>
              <input
                id={nameId}
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={handleFieldFocus}
                disabled={isBusy}
                aria-invalid={error ? true : undefined}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:border-[#0A9AFF] focus:outline-none focus:ring-2 focus:ring-[#0A9AFF]/20 disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor={emailId} className="mb-1.5 block text-sm font-medium text-[#374151]">
                Email
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleFieldFocus}
                disabled={isBusy}
                aria-invalid={error ? true : undefined}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:border-[#0A9AFF] focus:outline-none focus:ring-2 focus:ring-[#0A9AFF]/20 disabled:opacity-60"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-[#DC2626]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A9AFF] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
              style={{ backgroundColor: brandColor }}
            >
              {isBusy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {isBusy ? "Submitting…" : ctaLabel}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
