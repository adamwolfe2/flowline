# MyVSL Outgoing Webhook Contract

For receivers ingesting MyVSL funnel events (e.g. the AM Collective attribution service at send.amcollectivecapital.com).

## Transport

- `POST`, `Content-Type: application/json`, 10s timeout, 3 attempts with exponential backoff
- Every delivery (success or failure) is logged in the `webhook_deliveries` table
- Configured per funnel: `funnel.config.webhook = { url, format?, authToken?, events? }`
- `format: "ghl"` transforms payloads to GoHighLevel contact shape — **do not use for attribution receivers**; leave `format` unset

## Authentication headers

Both are applied when configured; verify at least the HMAC.

### 1. HMAC signature (set `WEBHOOK_SIGNING_SECRET`, same value both sides)

```
X-Webhook-Timestamp: <unix seconds>
X-Webhook-Signature: hex( HMAC-SHA256(secret, `${timestamp}.${rawBody}`) )
```

Verification (Node/Next.js receiver):

```ts
import crypto from "crypto";

export function verifyMyVslSignature(rawBody: string, headers: Headers, secret: string): boolean {
  const ts = headers.get("x-webhook-timestamp");
  const sig = headers.get("x-webhook-signature");
  if (!ts || !sig) return false;
  // Reject replays older than 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${ts}.${rawBody}`, "utf8").digest("hex");
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
```

Important: compute over the **raw request body string**, before any JSON parsing.

### 2. Bearer token (per-funnel `webhook.authToken`)

```
Authorization: Bearer <authToken>
```

## Event types

Enable/disable per funnel via `webhook.events`. Absent config = `lead`, `completed`, `booking` all ON; `raw` is **explicit opt-in** (`events.raw === true`).

### `lead_captured` — form submitted (email captured)

```jsonc
{
  "event": "lead_captured",
  "email": "prospect@example.com",
  "answers": { "revenue": "c", "timeline": "a" },   // question key → chosen option id
  "score": 7,
  "calendar_tier": "high",
  "timestamp": "2026-07-04T18:00:00.000Z",
  "source": "Brand Name",
  "funnel_slug": "my-funnel",
  "funnel_url": "https://getmyvsl.com/f/my-funnel",
  "utm_source": "facebook",            // nullable
  "utm_medium": "cpc",                 // nullable
  "utm_campaign": "july-launch",       // nullable
  "device_type": "mobile",             // nullable
  "session_id": "b3f0…-uuid",          // nullable — STITCHING KEY
  "session_duration_ms": 48231,        // nullable
  "quiz_answers_formatted": "Q1: $20k - $100k (2pts), Q2: ASAP (3pts)",
  "total_questions": 5,
  "questions_answered": 5
}
```

### `funnel_completed` — visitor reached thank-you screen

Fires once per session (idempotent, false→true transition). Lead PII pulled from DB, never client payload.

```jsonc
{
  "event": "funnel_completed",
  "email": "prospect@example.com",     // nullable if no lead captured
  "answers": {},
  "score": 7,                          // nullable
  "calendar_tier": "high",             // nullable
  "timestamp": "2026-07-04T18:01:12.000Z",
  "source": "Brand Name",
  "funnel_slug": "my-funnel",
  "funnel_url": "https://getmyvsl.com/f/my-funnel",
  "utm_source": null,
  "utm_medium": null,
  "utm_campaign": null,
  "device_type": "desktop",
  "session_id": "b3f0…-uuid",          // STITCHING KEY
  "session_duration_ms": 120500
}
```

### `booking_confirmed` — Cal.com / Calendly booking confirmed

Fires once per session (booking stamped only on null→set transition; replays ignored).

```jsonc
{
  "event": "booking_confirmed",
  "email": "prospect@example.com",     // nullable
  "answers": { "revenue": "c" },
  "score": 7,                          // nullable
  "calendar_tier": "high",             // nullable
  "timestamp": "2026-07-04T18:05:00.000Z",
  "source": "Brand Name",
  "funnel_slug": "my-funnel",
  "funnel_url": "https://getmyvsl.com/f/my-funnel",
  "utm_source": "facebook",
  "utm_medium": "cpc",
  "utm_campaign": "july-launch",
  "device_type": "mobile",
  "session_id": "b3f0…-uuid"           // STITCHING KEY
}
```

### Raw step events — opt-in (`events.raw: true`), never GHL format

Batched per funnel per request (max 20 events/batch). `timestamp` is the server receive time of the batch.

```jsonc
{
  "funnel_slug": "my-funnel",
  "events": [
    {
      "eventType": "page_viewed",      // funnel_viewed | page_viewed | answer_selected | field_focused | form_submitted | lead_created | funnel_completed | funnel_abandoned | ...
      "sessionId": "b3f0…-uuid",       // STITCHING KEY
      "funnelId": "a1c2…-uuid",
      "stepIndex": 2,
      "stepKey": "revenue",
      "timeOnStepMs": 5400,            // nullable
      "sessionDurationMs": 31200,
      "utmSource": "facebook",         // nullable
      "utmMedium": "cpc",              // nullable
      "utmCampaign": "july-launch",    // nullable
      "deviceType": "mobile",
      "timestamp": "2026-07-04T18:00:05.000Z"
    }
  ]
}
```

## Stitching model (attribution receiver)

`session_id` is the join key across the whole journey:

```
raw events (events[].sessionId)
  → lead_captured (session_id)
    → funnel_completed (session_id)
      → booking_confirmed (session_id)
```

Dedupe guidance: `completed` and `booking` are already once-per-session at the source. `lead_captured` keys naturally on `email + funnel_slug`. Raw events have no delivery-level dedupe — receiver should upsert on `(sessionId, eventType, stepIndex, timestamp)` or tolerate duplicates.

## Receiver response contract

Return 2xx quickly (MyVSL times out at 10s and will retry up to 3× on non-2xx/network errors — process async, respond immediately).
