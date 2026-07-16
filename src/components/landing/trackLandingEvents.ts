"use client";

/**
 * Best-effort analytics emission for a successful landing booking-form submit.
 *
 * Fires two events:
 *  - `booking_submitted` — the landing analogue of the quiz's form_submitted.
 *  - `lead_created`      — load-bearing. `/api/events` uses it to mark the
 *                          session converted and attach `leadId`, which the
 *                          booking webhook later reads to resolve the lead's
 *                          email. Without it a landing booking fires a webhook
 *                          with `email: null`.
 *
 * Never throws and never blocks the user: /api/events always returns 200 and
 * drops anything it cannot store.
 */
export function trackLandingEvents({
  funnelId,
  sessionId,
  leadId,
  blockId,
}: {
  funnelId: string;
  sessionId: string;
  leadId?: string;
  blockId: string;
}): void {
  // "preview" is not a valid UUID; the events route rejects it. Skipping here
  // keeps builder previews out of real analytics without relying on that.
  if (!sessionId || sessionId === "preview") return;

  // `stepKey` is the events route's free-form identifier column. It does not
  // accept a `blockId` field — that would be silently dropped on insert.
  void postEvent({
    funnelId,
    sessionId,
    eventType: "booking_submitted",
    stepKey: blockId,
  });

  if (leadId) {
    void postEvent({
      funnelId,
      sessionId,
      eventType: "lead_created",
      leadId,
    });
  }

  // A landing page has no steps, so "completed" means the booking form was
  // submitted. Firing this keeps session.completed (and therefore the existing
  // completion-rate stat) meaningful for landing funnels.
  void postEvent({
    funnelId,
    sessionId,
    eventType: "funnel_completed",
  });
}

function postEvent(body: Record<string, unknown>): Promise<void> {
  return fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  })
    .then(() => undefined)
    .catch(() => undefined);
}
