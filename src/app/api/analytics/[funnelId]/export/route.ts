import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { getFunnelById } from "@/db/queries/funnels";
import { logger } from "@/lib/logger";

function getDateCutoff(timeRange: string): Date | null {
  const now = new Date();
  switch (timeRange) {
    case '7d': now.setDate(now.getDate() - 7); return now;
    case '30d': now.setDate(now.getDate() - 30); return now;
    case '90d': now.setDate(now.getDate() - 90); return now;
    default: return null;
  }
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ funnelId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { funnelId } = await params;

    const funnel = await getFunnelById(funnelId, userId);
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const VALID_TIME_RANGES = ["7d", "30d", "90d", "all"];
    const rawTimeRange = req.nextUrl.searchParams.get("timeRange") ?? "all";
    const timeRange = VALID_TIME_RANGES.includes(rawTimeRange) ? rawTimeRange : "all";

    const cutoff = getDateCutoff(timeRange);
    const whereClause = cutoff
      ? and(eq(leads.funnelId, funnelId), gte(leads.createdAt, cutoff))
      : eq(leads.funnelId, funnelId);

    const allLeads = await db.select().from(leads)
      .where(whereClause)
      .orderBy(sql`${leads.createdAt} desc`)
      .limit(10000);

    const header = "Email,Score,Tier,Device,UTM Source,UTM Medium,UTM Campaign,Date";
    const rows = allLeads.map(l =>
      [
        escapeCsvField(l.email),
        String(l.score),
        l.calendarTier,
        l.deviceType ?? "",
        escapeCsvField(l.utmSource ?? ""),
        escapeCsvField(l.utmMedium ?? ""),
        escapeCsvField(l.utmCampaign ?? ""),
        l.createdAt.toISOString(),
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${funnel.slug}-leads-${timeRange}.csv"`,
      },
    });
  } catch (error) {
    logger.error("GET /api/analytics/export error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
