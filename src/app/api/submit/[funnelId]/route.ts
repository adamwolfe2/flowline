import { NextRequest, NextResponse } from "next/server";
import { getFunnelById } from "@/db/queries/funnels";
import { insertLead } from "@/db/queries/leads";
import { calculateScore, getCalendarTier, getCalendarUrl } from "@/lib/scoring";
import { submitLimiter, checkRateLimit } from "@/lib/rate-limit";
import { sendLeadNotification } from "@/lib/resend";
import { fireWebhook } from "@/lib/webhook";
import { db } from "@/db";
import { leads, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { FunnelConfig } from "@/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ funnelId: string }> }) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { success } = await checkRateLimit(submitLimiter, ip);
    if (!success) {
      return NextResponse.json({ error: "Too many submissions" }, { status: 429 });
    }

    const { funnelId } = await params;
    const body = await req.json();
    const { email, answers, sessionId } = body as {
      email: string;
      answers: Record<string, string>;
      sessionId?: string;
    };

    const funnel = await getFunnelById(funnelId);
    if (!funnel) return NextResponse.json({ error: "Funnel not found" }, { status: 404 });

    const config = funnel.config as FunnelConfig;
    const score = calculateScore(config, answers);
    const calendarTier = getCalendarTier(config, answers);
    const calendarUrl = getCalendarUrl(config, answers);

    // Duplicate email prevention — same email + same funnel = skip insert
    const existing = await db.select({ id: leads.id }).from(leads)
      .where(and(eq(leads.funnelId, funnelId), eq(leads.email, email)));
    if (existing.length > 0) {
      return NextResponse.json({ success: true, calendarUrl, deduplicated: true });
    }

    const lead = await insertLead({
      funnelId,
      email,
      answers,
      score,
      calendarTier,
      sessionId: sessionId ?? null,
    });

    // Send email notification to funnel owner (non-blocking)
    const [owner] = await db.select({ email: users.email }).from(users).where(eq(users.id, funnel.userId));
    if (owner?.email) {
      sendLeadNotification({
        toEmail: owner.email,
        funnelName: config.brand.name,
        leadEmail: email,
        score,
        calendarTier,
        funnelId,
      }).catch(() => {});
    }

    // Fire webhook if configured (retries with exponential backoff, non-blocking)
    if (config.webhook?.url) {
      fireWebhook(config.webhook.url, {
        email, answers, score,
        calendar_tier: calendarTier,
        timestamp: new Date().toISOString(),
        source: config.brand.name,
        funnel_slug: funnel.slug,
      }).catch(() => {}); // Final catch for the retry chain — truly best-effort
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      score,
      calendarTier,
      calendarUrl,
    });
  } catch (error) {
    console.error("POST /api/submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
