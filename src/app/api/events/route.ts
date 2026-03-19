import { NextResponse } from "next/server";
import { db } from "@/db";
import { events, funnelSessions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { eventLimiter, checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const VALID_EVENT_TYPES = [
  "funnel_viewed",
  "page_viewed",
  "cta_clicked",
  "answer_selected",
  "field_focused",
  "form_submitted",
  "lead_created",
  "funnel_completed",
  "funnel_abandoned",
  "back_navigated",
] as const;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { limited } = await checkRateLimit(eventLimiter, ip);
    if (limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const {
      sessionId, funnelId, eventType, stepIndex, stepKey,
      questionKey, answerId, answerLabel, answerPoints, cumulativeScore,
      utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
      deviceType, timeOnStepMs, sessionDurationMs,
      abandonedAtStep, reachedEmail,
      leadId, calendarTier, score,
    } = body;

    // Validate required fields
    if (!sessionId || typeof sessionId !== "string") {
      logger.warn("Event dropped: missing sessionId", { eventType: body?.eventType });
      return NextResponse.json({ success: false, reason: "missing or invalid sessionId" });
    }
    if (!funnelId || typeof funnelId !== "string") {
      logger.warn("Event dropped: missing funnelId", { eventType: body?.eventType });
      return NextResponse.json({ success: false, reason: "missing or invalid funnelId" });
    }
    if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
      logger.warn("Event dropped: invalid eventType", { eventType: body?.eventType });
      return NextResponse.json({ success: false, reason: "invalid eventType" });
    }

    await db.insert(events).values({
      sessionId, funnelId, eventType,
      stepIndex: stepIndex ?? 0,
      stepKey: stepKey ?? "unknown",
      questionKey: questionKey ?? null,
      answerId: answerId ?? null,
      answerLabel: answerLabel ?? null,
      answerPoints: answerPoints ?? null,
      cumulativeScore: cumulativeScore ?? null,
      utmSource: utmSource ?? null,
      utmMedium: utmMedium ?? null,
      utmCampaign: utmCampaign ?? null,
      utmTerm: utmTerm ?? null,
      utmContent: utmContent ?? null,
      deviceType: deviceType ?? "desktop",
      timeOnStepMs: timeOnStepMs ?? null,
      sessionDurationMs: sessionDurationMs ?? 0,
      abandonedAtStep: abandonedAtStep ?? null,
      reachedEmail: reachedEmail ?? null,
      leadId: leadId ?? null,
      calendarTier: calendarTier ?? null,
      score: score ?? null,
    });

    // Side effects per event type
    if (eventType === "funnel_abandoned") {
      await db.update(funnelSessions)
        .set({ abandonedAtStep, totalDurationMs: sessionDurationMs, endedAt: new Date() })
        .where(eq(funnelSessions.id, sessionId));
    }
    if (eventType === "funnel_completed") {
      await db.update(funnelSessions)
        .set({ completed: true, totalDurationMs: sessionDurationMs, endedAt: new Date() })
        .where(eq(funnelSessions.id, sessionId));
    }
    if (eventType === "lead_created" && leadId) {
      await db.update(funnelSessions)
        .set({ converted: true, leadId })
        .where(eq(funnelSessions.id, sessionId));
    }
    if (stepIndex !== undefined) {
      await db.update(funnelSessions)
        .set({ furthestStepReached: sql`greatest(COALESCE(${funnelSessions.furthestStepReached}, 0), ${stepIndex})` })
        .where(eq(funnelSessions.id, sessionId));
    }
  } catch (err) {
    logger.error("[events] tracking error", { error: err instanceof Error ? err.message : String(err) });
  }

  return NextResponse.json({ success: true });
}
