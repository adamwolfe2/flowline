import { NextRequest, NextResponse } from "next/server";
import { getFunnelById } from "@/db/queries/funnels";
import { insertLead } from "@/db/queries/leads";
import { calculateScore, getCalendarTier, getCalendarUrl } from "@/lib/scoring";
import type { FunnelConfig } from "@/types";

export async function POST(req: NextRequest, { params }: { params: Promise<{ funnelId: string }> }) {
  try {
    const { funnelId } = await params;
    const body = await req.json();
    const { email, answers } = body as { email: string; answers: Record<string, string> };

    const funnel = await getFunnelById(funnelId);
    if (!funnel) return NextResponse.json({ error: "Funnel not found" }, { status: 404 });

    const config = funnel.config as FunnelConfig;
    const score = calculateScore(config, answers);
    const calendarTier = getCalendarTier(config, answers);
    const calendarUrl = getCalendarUrl(config, answers);

    await insertLead({
      funnelId,
      email,
      answers,
      score,
      calendarTier,
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

    return NextResponse.json({ success: true, calendarUrl });
  } catch (error) {
    console.error("POST /api/submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
