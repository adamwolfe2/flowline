import { NextResponse } from "next/server";
import { db } from "@/db";
import { events, funnelSessions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sessionId, funnelId, eventType, stepIndex, stepKey,
      questionKey, answerId, answerLabel, answerPoints, cumulativeScore,
      utmSource, utmMedium, utmCampaign, utmTerm, utmContent,
      deviceType, timeOnStepMs, sessionDurationMs,
      abandonedAtStep, reachedEmail,
      leadId, calendarTier, score,
    } = body;

    if (!sessionId || !funnelId || !eventType) {
      return NextResponse.json({ success: true });
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
        .set({ furthestStepReached: sql`greatest(${funnelSessions.furthestStepReached}, ${stepIndex})` })
        .where(eq(funnelSessions.id, sessionId));
    }
  } catch (err) {
    console.error("[events] tracking error:", err);
  }

  return NextResponse.json({ success: true });
}
