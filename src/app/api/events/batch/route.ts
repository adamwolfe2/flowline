import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, funnelSessions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { checkRateLimit, eventLimiter } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const VALID_EVENT_TYPES = [
  "funnel_viewed", "page_viewed", "answer_selected", "field_focused",
  "form_submitted", "lead_created", "funnel_completed", "funnel_abandoned",
  "back_navigated", "cta_clicked",
] as const;

type EventType = (typeof VALID_EVENT_TYPES)[number];

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

    for (const e of batch) {
      if (
        !e.sessionId || typeof e.sessionId !== "string" ||
        !e.funnelId || typeof e.funnelId !== "string" ||
        !e.eventType || !VALID_EVENT_TYPES.includes(e.eventType as EventType)
      ) {
        continue;
      }

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

        // Side effects (same as individual events route)
        if (e.eventType === "funnel_abandoned") {
          await db.update(funnelSessions)
            .set({ abandonedAtStep: e.abandonedAtStep, totalDurationMs: e.sessionDurationMs, endedAt: new Date() })
            .where(eq(funnelSessions.id, e.sessionId));
        }
        if (e.eventType === "funnel_completed") {
          await db.update(funnelSessions)
            .set({ completed: true, totalDurationMs: e.sessionDurationMs, endedAt: new Date() })
            .where(eq(funnelSessions.id, e.sessionId));
        }
        if (e.eventType === "lead_created" && e.leadId) {
          await db.update(funnelSessions)
            .set({ converted: true, leadId: e.leadId })
            .where(eq(funnelSessions.id, e.sessionId));
        }
        if (e.stepIndex !== undefined) {
          await db.update(funnelSessions)
            .set({ furthestStepReached: sql`greatest(${funnelSessions.furthestStepReached}, ${e.stepIndex})` })
            .where(eq(funnelSessions.id, e.sessionId));
        }
      } catch {
        // Skip individual event errors
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Batch events error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ success: true });
  }
}
