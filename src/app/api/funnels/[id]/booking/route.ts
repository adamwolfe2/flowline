import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { funnels, funnelSessions, leads } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { submitLimiter, checkRateLimit } from "@/lib/rate-limit";
import { fireWebhook, webhookEnabledFor } from "@/lib/webhook";
import { logger } from "@/lib/logger";
import type { FunnelConfig } from "@/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Public endpoint hit by the funnel client when a Cal.com / Calendly booking
 * is confirmed on the thank-you screen. Fires the "booking_confirmed" webhook
 * so funnel owners can track booked meetings even on calendars they don't own.
 *
 * No auth: this is called from the public funnel. It is rate limited, validates
 * that the session belongs to the funnel, and resolves lead PII server-side
 * (client payload is never trusted for email/score/tier).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const { limited } = await checkRateLimit(submitLimiter, ip);
    if (limited) return NextResponse.json({ success: true });

    const { id: funnelId } = await params;
    if (!UUID_RE.test(funnelId)) {
      return NextResponse.json({ error: "Invalid funnel ID" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : null;
    if (!sessionId || !UUID_RE.test(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const [funnel] = await db
      .select({ config: funnels.config, slug: funnels.slug })
      .from(funnels)
      .where(eq(funnels.id, funnelId));
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const config = funnel.config as FunnelConfig;
    if (!webhookEnabledFor(config.webhook, "booking")) {
      // Nothing to do (no URL or booking disabled) — succeed silently
      return NextResponse.json({ success: true });
    }

    // Session must belong to this funnel; stamp booking only on the null->set
    // transition so repeated postMessages / replays fire the webhook just once.
    const [session] = await db
      .update(funnelSessions)
      .set({ bookingConfirmedAt: new Date() })
      .where(and(
        eq(funnelSessions.id, sessionId),
        eq(funnelSessions.funnelId, funnelId),
        isNull(funnelSessions.bookingConfirmedAt),
      ))
      .returning({
        leadId: funnelSessions.leadId,
        utmSource: funnelSessions.utmSource,
        utmMedium: funnelSessions.utmMedium,
        utmCampaign: funnelSessions.utmCampaign,
        deviceType: funnelSessions.deviceType,
      });
    // No row = unknown session, wrong funnel, or already booked: succeed silently
    if (!session) return NextResponse.json({ success: true });

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
      event: "booking_confirmed",
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
    };
    const format = config.webhook?.format ?? "default";
    fireWebhook(config.webhook.url, payload, funnelId, 3, format).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("POST /api/funnels/[id]/booking error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ success: true });
  }
}
