import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, funnelSessions, funnels, leads } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { checkRateLimit, eventLimiter } from "@/lib/rate-limit";
import { fireWebhook, webhookEnabledFor } from "@/lib/webhook";
import { logger } from "@/lib/logger";
import type { FunnelConfig } from "@/types";

type FunnelInfo = { config: FunnelConfig; slug: string };
type FunnelResolver = (funnelId: string) => Promise<FunnelInfo | null>;

/**
 * Per-request funnel config cache: the funnel row is fetched at most once per
 * request (lazily, only when a webhook path needs it), shared between the
 * completion webhook and raw event forwarding. Caches the promise so
 * concurrent fire-and-forget callers never double-fetch.
 */
function createFunnelResolver(): FunnelResolver {
  const cache = new Map<string, Promise<FunnelInfo | null>>();
  return (funnelId: string) => {
    let cached = cache.get(funnelId);
    if (!cached) {
      cached = db
        .select({ config: funnels.config, slug: funnels.slug })
        .from(funnels)
        .where(eq(funnels.id, funnelId))
        .then(([f]) => (f ? { config: f.config as FunnelConfig, slug: f.slug } : null));
      cache.set(funnelId, cached);
    }
    return cached;
  };
}

/**
 * Fire the "funnel_completed" webhook when a visitor reaches the thank-you
 * screen. Called only on the false->true completion transition (idempotent),
 * so client retries never double-send.
 */
async function fireCompletionWebhook(
  funnelId: string,
  sessionId: string,
  getFunnel: FunnelResolver,
  session: { leadId: string | null; utmSource: string | null; utmMedium: string | null; utmCampaign: string | null; deviceType: string | null },
  sessionDurationMs: number | null
) {
  try {
    const funnel = await getFunnel(funnelId);
    if (!funnel) return;

    const config = funnel.config;
    if (!webhookEnabledFor(config.webhook, "completed")) return;

    // Authoritative lead data from the DB (never trust client payload for PII)
    let lead: { email: string; score: number; calendarTier: string; answers: unknown } | null = null;
    if (session.leadId) {
      const [l] = await db
        .select({ email: leads.email, score: leads.score, calendarTier: leads.calendarTier, answers: leads.answers })
        .from(leads)
        .where(eq(leads.id, session.leadId));
      lead = l ?? null;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";
    const payload: Record<string, unknown> = {
      event: "funnel_completed",
      email: lead?.email ?? null,
      answers: lead?.answers ?? {},
      score: lead?.score ?? null,
      calendar_tier: lead?.calendarTier ?? null,
      timestamp: new Date().toISOString(),
      source: config.brand?.name ?? "",
      funnel_slug: funnel.slug,
      funnel_url: `${appUrl}/f/${funnel.slug}`,
      utm_source: session.utmSource,
      utm_medium: session.utmMedium,
      utm_campaign: session.utmCampaign,
      device_type: session.deviceType,
      session_id: sessionId,
      session_duration_ms: sessionDurationMs,
    };
    const format = config.webhook?.format ?? "default";
    await fireWebhook(config.webhook.url, payload, funnelId, 3, format, { authToken: config.webhook?.authToken });
  } catch (err) {
    logger.error("[webhook] completion fire failed", { error: err instanceof Error ? err.message : String(err) });
  }
}

/**
 * Forward raw step-level events to the funnel's webhook so a downstream
 * attribution system can compute funnel drop-off. Explicit opt-in via
 * webhook.events.raw === true (default OFF), and never sent in GHL format
 * (GHL expects contact-shaped payloads, not event streams).
 */
async function forwardRawEvents(
  funnelId: string,
  rawEvents: Record<string, unknown>[],
  getFunnel: FunnelResolver
) {
  try {
    const funnel = await getFunnel(funnelId);
    if (!funnel) return;

    const config = funnel.config;
    if (!webhookEnabledFor(config.webhook, "raw")) return;
    if ((config.webhook?.format ?? "default") === "ghl") return;

    const payload: Record<string, unknown> = {
      funnel_slug: funnel.slug,
      events: rawEvents,
    };
    await fireWebhook(config.webhook.url, payload, funnelId, 3, "default", { authToken: config.webhook?.authToken });
  } catch (err) {
    logger.error("[webhook] raw event forward failed", { error: err instanceof Error ? err.message : String(err) });
  }
}

const VALID_EVENT_TYPES = [
  "funnel_viewed", "page_viewed", "answer_selected", "field_focused",
  "form_submitted", "lead_created", "funnel_completed", "funnel_abandoned",
  "back_navigated", "cta_clicked", "email_captured",
] as const;

type EventType = (typeof VALID_EVENT_TYPES)[number];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const { limited } = await checkRateLimit(eventLimiter, ip);
    if (limited) {
      return NextResponse.json({ success: true });
    }

    const body = await req.json();
    const eventList = body.events;

    if (!Array.isArray(eventList) || eventList.length === 0) {
      return NextResponse.json({ success: true });
    }

    // Cap batch size and validate
    const batch = eventList.slice(0, 20);

    // Funnel config is fetched at most once per request, only when a webhook
    // path (completion or raw forwarding) actually needs it.
    const getFunnel = createFunnelResolver();

    // Validated events collected for raw forwarding (opt-in), stamped with
    // the server receive time.
    const receivedAt = new Date().toISOString();
    const validatedForForwarding: Record<string, unknown>[] = [];

    for (const e of batch) {
      if (
        !e.sessionId || typeof e.sessionId !== "string" || !UUID_RE.test(e.sessionId) ||
        !e.funnelId || typeof e.funnelId !== "string" || !UUID_RE.test(e.funnelId) ||
        !e.eventType || !VALID_EVENT_TYPES.includes(e.eventType as EventType)
      ) {
        continue;
      }

      validatedForForwarding.push({
        eventType: e.eventType,
        sessionId: e.sessionId,
        funnelId: e.funnelId,
        stepIndex: e.stepIndex ?? 0,
        stepKey: e.stepKey ?? "unknown",
        timeOnStepMs: e.timeOnStepMs ?? null,
        sessionDurationMs: e.sessionDurationMs ?? 0,
        utmSource: e.utmSource ?? null,
        utmMedium: e.utmMedium ?? null,
        utmCampaign: e.utmCampaign ?? null,
        deviceType: e.deviceType ?? "desktop",
        timestamp: receivedAt,
      });

      try {
        await db.insert(events).values({
          sessionId: e.sessionId,
          funnelId: e.funnelId,
          eventType: e.eventType,
          stepIndex: e.stepIndex ?? 0,
          stepKey: e.stepKey ?? "unknown",
          questionKey: e.questionKey ?? null,
          answerId: e.answerId ?? null,
          answerLabel: e.answerLabel ?? null,
          answerPoints: e.answerPoints ?? null,
          cumulativeScore: e.cumulativeScore ?? null,
          utmSource: e.utmSource ?? null,
          utmMedium: e.utmMedium ?? null,
          utmCampaign: e.utmCampaign ?? null,
          utmTerm: e.utmTerm ?? null,
          utmContent: e.utmContent ?? null,
          deviceType: e.deviceType ?? "desktop",
          timeOnStepMs: e.timeOnStepMs ?? null,
          sessionDurationMs: e.sessionDurationMs ?? 0,
          abandonedAtStep: e.abandonedAtStep ?? null,
          reachedEmail: e.reachedEmail ?? null,
          leadId: e.leadId ?? null,
          calendarTier: e.calendarTier ?? null,
          score: e.score ?? null,
        });

        // Side effects. Every session mutation is bound to (sessionId AND funnelId)
        // so a client cannot mutate or exfiltrate another funnel's session/leads.
        const ownsSession = and(eq(funnelSessions.id, e.sessionId), eq(funnelSessions.funnelId, e.funnelId));
        if (e.eventType === "funnel_abandoned") {
          await db.update(funnelSessions)
            .set({ abandonedAtStep: e.abandonedAtStep, totalDurationMs: e.sessionDurationMs, endedAt: new Date() })
            .where(ownsSession);
        }
        if (e.eventType === "funnel_completed") {
          // Only act on the false->true transition so retries don't double-fire
          const completed = await db.update(funnelSessions)
            .set({ completed: true, totalDurationMs: e.sessionDurationMs, endedAt: new Date() })
            .where(and(ownsSession, eq(funnelSessions.completed, false)))
            .returning({
              leadId: funnelSessions.leadId,
              utmSource: funnelSessions.utmSource,
              utmMedium: funnelSessions.utmMedium,
              utmCampaign: funnelSessions.utmCampaign,
              deviceType: funnelSessions.deviceType,
            });
          if (completed[0]) {
            fireCompletionWebhook(e.funnelId, e.sessionId, getFunnel, completed[0], e.sessionDurationMs ?? null).catch(() => {});
          }
        }
        if (e.eventType === "lead_created" && e.leadId) {
          await db.update(funnelSessions)
            .set({ converted: true, leadId: e.leadId })
            .where(ownsSession);
        }
        if (e.eventType === "email_captured" && e.email && typeof e.email === "string") {
          await db.update(funnelSessions)
            .set({ partialEmail: e.email })
            .where(ownsSession);
        }
        if (e.stepIndex !== undefined) {
          await db.update(funnelSessions)
            .set({ furthestStepReached: sql`greatest(${funnelSessions.furthestStepReached}, ${e.stepIndex})` })
            .where(ownsSession);
        }
      } catch (err) {
        // Skip individual event errors so one bad row never fails the batch,
        // but surface them so systemic write failures stay observable.
        logger.warn("[events/batch] event insert/update skipped", {
          eventType: typeof e?.eventType === "string" ? e.eventType : "unknown",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // Raw event forwarding (fire-and-forget, never blocks the response).
    // Grouped per funnel so a mixed batch can never leak one funnel's events
    // to another funnel's webhook.
    if (validatedForForwarding.length > 0) {
      const funnelIds = new Set(validatedForForwarding.map(ev => String(ev.funnelId)));
      for (const funnelId of funnelIds) {
        const rawEvents = validatedForForwarding.filter(ev => ev.funnelId === funnelId);
        forwardRawEvents(funnelId, rawEvents, getFunnel).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Batch events error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ success: true });
  }
}
