import { NextRequest, NextResponse } from "next/server";
import { getFunnelById } from "@/db/queries/funnels";
import { insertLead } from "@/db/queries/leads";
import { calculateScore, getCalendarTier, getCalendarUrl } from "@/lib/scoring";
import { submitLimiter, checkRateLimit } from "@/lib/rate-limit";
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

    const lead = await insertLead({
      funnelId,
      email,
      answers,
      score,
      calendarTier,
      sessionId: sessionId ?? null,
    });

    // Fire webhook if configured
    if (config.webhook?.url) {
      fetch(config.webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, answers, score,
          calendar_tier: calendarTier,
          timestamp: new Date().toISOString(),
          source: config.brand.name,
        }),
      }).catch(() => {});
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
