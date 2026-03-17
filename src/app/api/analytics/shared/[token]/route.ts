import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { funnels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getFunnelOverview, getDropoffWaterfall, getTierDistribution, getLeadsTimeSeries } from "@/db/queries/analytics";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const timeRange = req.nextUrl.searchParams.get("timeRange") ?? "30d";

    const [funnel] = await db.select()
      .from(funnels)
      .where(eq(funnels.shareToken, token));

    if (!funnel) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const config = funnel.config as { brand?: { name?: string } };

    const [stats, dropoff, tiers, timeSeries] = await Promise.all([
      getFunnelOverview(funnel.id, timeRange),
      getDropoffWaterfall(funnel.id, timeRange),
      getTierDistribution(funnel.id, timeRange),
      getLeadsTimeSeries(funnel.id, timeRange),
    ]);

    return NextResponse.json({
      funnelName: config.brand?.name || "Funnel",
      stats,
      dropoff,
      tiers,
      timeSeries,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
