import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { popupCampaigns, popupImpressions } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { apiLimiter, checkRateLimit } from "@/lib/rate-limit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_RANGES = ["7d", "30d", "90d", "all"] as const;

function getDateCutoff(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case "7d": return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d": return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d": return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default: return null;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 });

    const rl = await checkRateLimit(apiLimiter, userId);
    if (rl.limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const [campaign] = await db
      .select({ id: popupCampaigns.id })
      .from(popupCampaigns)
      .where(and(eq(popupCampaigns.id, id), eq(popupCampaigns.userId, userId)));

    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("timeRange") ?? "30d";
    if (!VALID_RANGES.includes(timeRange as typeof VALID_RANGES[number])) {
      return NextResponse.json({ error: `Invalid timeRange. Must be one of: ${VALID_RANGES.join(", ")}` }, { status: 400 });
    }

    const cutoff = getDateCutoff(timeRange);

    const conditions = [eq(popupImpressions.campaignId, id)];
    if (cutoff) {
      conditions.push(gte(popupImpressions.createdAt, cutoff));
    }

    const rows = await db
      .select({
        action: popupImpressions.action,
        count: sql<number>`count(*)::int`,
      })
      .from(popupImpressions)
      .where(and(...conditions))
      .groupBy(popupImpressions.action);

    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.action] = row.count;
    }

    const totalImpressions = (counts.triggered ?? 0) + (counts.shown ?? 0) + (counts.dismissed ?? 0) + (counts.engaged ?? 0) + (counts.converted ?? 0);
    const totalShown = counts.shown ?? 0;
    const totalDismissed = counts.dismissed ?? 0;
    const totalEngaged = counts.engaged ?? 0;
    const totalConverted = counts.converted ?? 0;

    const engagementRate = totalShown > 0 ? Math.round((totalEngaged / totalShown) * 10000) / 100 : 0;
    const conversionRate = totalShown > 0 ? Math.round((totalConverted / totalShown) * 10000) / 100 : 0;
    const dismissRate = totalShown > 0 ? Math.round((totalDismissed / totalShown) * 10000) / 100 : 0;

    return NextResponse.json({
      totalImpressions,
      totalShown,
      totalDismissed,
      totalEngaged,
      totalConverted,
      engagementRate,
      conversionRate,
      dismissRate,
    }, {
      headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=30" },
    });
  } catch (error) {
    logger.error("GET /api/popup/campaigns/[id]/stats error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
