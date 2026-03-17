import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { calculateScore, getCalendarTier, getCalendarUrl } from "@/lib/scoring";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: Promise<{ funnelId: string }> }) {
  const { funnelId } = await params;
  const body = await req.json();
  const { email, answers } = body as { email: string; answers: Record<string, string> };

  const funnel = store.getFunnel(funnelId);
  if (!funnel) return NextResponse.json({ error: "Funnel not found" }, { status: 404 });

  const score = calculateScore(funnel.config, answers);
  const calendarTier = getCalendarTier(funnel.config, answers);
  const calendarUrl = getCalendarUrl(funnel.config, answers);

  // Save lead
  store.addLead({
    id: generateId(),
    funnel_id: funnelId,
    email,
    answers,
    score,
    calendar_tier: calendarTier,
    created_at: new Date().toISOString(),
  });

  // Fire webhook if configured (non-blocking)
  if (funnel.config.webhook.url) {
    fetch(funnel.config.webhook.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        answers,
        score,
        calendar_tier: calendarTier,
        timestamp: new Date().toISOString(),
        source: funnel.config.brand.name,
        funnel_slug: funnel.slug,
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ success: true, calendarUrl });
}
