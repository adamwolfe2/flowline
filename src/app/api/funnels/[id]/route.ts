import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getFunnelById, updateFunnelConfig, deleteFunnel } from "@/db/queries/funnels";
import { getSessionStats } from "@/db/queries/sessions";
import { getLeadsByFunnel, getLeadsThisWeek, getLeadsThisMonth, getTierBreakdown } from "@/db/queries/leads";
import { logger } from "@/lib/logger";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const funnel = await getFunnelById(id, userId);
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const stats = await getSessionStats(id);
    const leads = await getLeadsByFunnel(id);
    const leadsWeek = await getLeadsThisWeek(id);
    const leadsMonth = await getLeadsThisMonth(id);
    const tierData = await getTierBreakdown(id);

    const tierBreakdown = { high: 0, mid: 0, low: 0 };
    tierData.forEach((t) => {
      tierBreakdown[t.tier as keyof typeof tierBreakdown] = Number(t.count);
    });

    return NextResponse.json({
      ...funnel,
      stats: {
        totalSessions: stats.total,
        completionRate: stats.completionRate,
        conversionRate: stats.conversionRate,
        leadsThisWeek: leadsWeek,
        leadsThisMonth: leadsMonth,
        tierBreakdown,
      },
      leads,
    });
  } catch (error) {
    logger.error("GET /api/funnels/[id] error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function validateConfig(config: unknown): config is Record<string, unknown> {
  if (!config || typeof config !== 'object') return false;
  const c = config as Record<string, unknown>;
  if (!c.brand || typeof c.brand !== 'object') return false;
  if (!c.quiz || typeof c.quiz !== 'object') return false;
  return true;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await req.json();

    if (!validateConfig(body.config)) {
      return NextResponse.json({ error: "Invalid config format" }, { status: 400 });
    }

    const funnel = await updateFunnelConfig(id, userId, body.config);
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(funnel);
  } catch (error) {
    logger.error("PATCH /api/funnels/[id] error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await deleteFunnel(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("DELETE /api/funnels/[id] error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
