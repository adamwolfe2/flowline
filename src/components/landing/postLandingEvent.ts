"use client";

/**
 * Best-effort, fire-and-forget landing analytics beacon.
 *
 * `/api/events` always returns 200 and drops anything it cannot store, so this
 * never throws and never blocks the user. `keepalive` lets the request survive
 * a navigation (e.g. a CTA that opens a booking link in the same tab).
 *
 * Skips the builder preview session: "preview" is not a valid UUID and the
 * events route would reject it — filtering here keeps previews out of analytics
 * without a round-trip.
 */
export function postLandingEvent(body: {
  funnelId: string;
  sessionId: string;
  eventType: string;
  stepKey?: string;
  [key: string]: unknown;
}): void {
  if (!body.sessionId || body.sessionId === "preview") return;
  if (!body.funnelId) return;

  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  })
    .then(() => undefined)
    .catch(() => undefined);
}
