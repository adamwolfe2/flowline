import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateFunnelConfig, updateFunnel, deleteFunnel } from "@/db/queries/funnels";
import { getSessionStats } from "@/db/queries/sessions";
import { getLeadsByFunnel, getLeadsThisWeek, getLeadsThisMonth, getTierBreakdown } from "@/db/queries/leads";
import { logger } from "@/lib/logger";
import { requireFunnelAccess } from "@/lib/team-access";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    let funnel;
    try {
      funnel = await requireFunnelAccess(userId, id, "view");
    } catch (err) {
      const e = err as { status?: number; error?: string };
      return NextResponse.json({ error: e.error || "Not found" }, { status: e.status || 404 });
    }

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

    let funnelRow;
    try {
      funnelRow = await requireFunnelAccess(userId, id, "edit");
    } catch (err) {
      const e = err as { status?: number; error?: string };
      return NextResponse.json({ error: e.error || "Not found" }, { status: e.status || 404 });
    }

    const body = await req.json();

    // Handle clientId update (separate from config update)
    if (body.clientId !== undefined) {
      if (body.clientId !== null) {
        if (typeof body.clientId !== "string" || !UUID_REGEX.test(body.clientId)) {
          return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
        }
        // Verify the client belongs to the same team as the funnel
        if (!funnelRow.teamId) {
          return NextResponse.json({ error: "Cannot assign a client to a personal funnel" }, { status: 400 });
        }
        const [client] = await db
          .select({ id: clients.id })
          .from(clients)
          .where(and(eq(clients.id, body.clientId), eq(clients.teamId, funnelRow.teamId)));
        if (!client) {
          return NextResponse.json({ error: "Client not found in this team" }, { status: 404 });
        }
      }

      // Use funnelRow.userId for the update since team members may not be the funnel creator
      const funnel = await updateFunnel(id, funnelRow.userId, { clientId: body.clientId });
      if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(funnel);
    }

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

    try {
      await requireFunnelAccess(userId, id, "delete");
    } catch (err) {
      const e = err as { status?: number; error?: string };
      return NextResponse.json({ error: e.error || "Not found" }, { status: e.status || 404 });
    }

    await deleteFunnel(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("DELETE /api/funnels/[id] error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
