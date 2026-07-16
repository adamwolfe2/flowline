import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getFullAnalytics } from "@/db/queries/analytics";
import { getLandingFullAnalytics } from "@/db/queries/analytics-landing";
import { logger } from "@/lib/logger";
import { requireFunnelAccess } from "@/lib/team-access";
import { isSuperAdmin } from "@/lib/admin";
import type { FunnelConfig } from "@/types";

export async function GET(req: NextRequest, { params }: { params: Promise<{ funnelId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { funnelId } = await params;

    let funnel;
    try {
      funnel = await requireFunnelAccess(userId, funnelId, "view");
    } catch (err) {
      const e = err as { status?: number; error?: string };
      return NextResponse.json({ error: e.error || "Not found" }, { status: e.status || 404 });
    }

    const leadsPage = Math.max(0, parseInt(req.nextUrl.searchParams.get("leadsPage") ?? "0", 10) || 0);
    const VALID_TIME_RANGES = ["7d", "30d", "90d", "all"];
    const rawTimeRange = req.nextUrl.searchParams.get("timeRange") ?? "all";
    const timeRange = VALID_TIME_RANGES.includes(rawTimeRange) ? rawTimeRange : "all";
    // Narrow on the `type` COLUMN, never on config shape: the column is NOT
    // NULL and defaulted, so legacy rows resolve to 'quiz' and keep the exact
    // quiz payload they had before landing pages existed.
    const funnelType = funnel.type;
    const analytics =
      funnelType === "landing"
        ? await getLandingFullAnalytics(funnelId, leadsPage, timeRange)
        : await getFullAnalytics(funnelId, leadsPage, timeRange, funnel.config as FunnelConfig);

    const isAdmin = await isSuperAdmin(userId);
    let userPlan = 'agency';
    if (!isAdmin) {
      const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
      userPlan = user?.plan ?? 'free';
    }

    return NextResponse.json({ funnel, funnelType, ...analytics, userPlan, isAdmin }, {
      headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    logger.error("GET /api/analytics error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
