"use client";

import { useEffect, useRef } from "react";
import { fireBookingEvent } from "@/components/funnel/TrackingPixels";
import type { TrackingConfig } from "@/types";

/**
 * Listens for a booking-confirmed postMessage from an embedded Cal.com /
 * Calendly calendar, fires the ad pixel, and notifies the backend so the
 * `booking` webhook fires.
 *
 * This mirrors the logic in `src/components/funnel/SuccessStep.tsx` (~:29-71).
 * It is deliberately a copy rather than a shared extraction: SuccessStep is part
 * of the live quiz state machine, which is explicitly out of scope for the
 * landing-page work. If the quiz side is ever refactored, collapse these two
 * into one hook — the origin allowlist and provider message shapes must stay
 * in sync.
 */
export function useBookingConfirmed({
  funnelId,
  sessionId,
  tracking,
}: {
  funnelId: string;
  sessionId: string;
  tracking?: TrackingConfig;
}) {
  const bookingFired = useRef(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      try {
        // Only trust booking messages from the calendar providers we support
        let trustedOrigin = false;
        try {
          const h = new URL(event.origin).hostname.toLowerCase();
          trustedOrigin =
            h === "cal.com" || h.endsWith(".cal.com") ||
            h === "calendly.com" || h.endsWith(".calendly.com");
        } catch {
          return;
        }
        if (!trustedOrigin) return;

        const data = event.data;
        if (!data || typeof data !== "object") return;

        const isCalDotCom =
          data.type === "CAL:BOOKING_SUCCESSFUL" ||
          data.type === "bookingSuccessfulV2" ||
          (data.namespace === "calcom" && data.action === "bookingSuccessful");
        // Calendly emits { event: "calendly.event_scheduled" }
        const isCalendly = data.event === "calendly.event_scheduled";
        if (!isCalDotCom && !isCalendly) return;

        if (bookingFired.current) return; // one booking signal per mount
        bookingFired.current = true;

        fireBookingEvent(tracking);

        // Notify backend to fire the booking_confirmed webhook (best-effort).
        // "preview" is not a valid UUID and is rejected server-side, which
        // keeps builder previews out of real analytics.
        if (funnelId && sessionId && sessionId !== "preview") {
          fetch(`/api/funnels/${funnelId}/booking`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Never throw — booking tracking is best-effort
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [funnelId, sessionId, tracking]);
}
