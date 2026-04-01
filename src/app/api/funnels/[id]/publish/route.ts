import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { publishFunnel } from "@/db/queries/funnels";
import { logger } from "@/lib/logger";
import { requireFunnelAccess } from "@/lib/team-access";
import { logAuditEvent } from "@/lib/audit";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const funnel = await publishFunnel(id, userId);
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Fire-and-forget audit log (team funnels only)
    if (funnelRow.teamId) {
      const config = funnelRow.config as { brand?: { name?: string } } | null;
      logAuditEvent({
        teamId: funnelRow.teamId,
        userId,
        action: "funnel.published",
        resourceType: "funnel",
        resourceId: id,
        metadata: { name: config?.brand?.name, slug: funnelRow.slug },
      }).catch(() => {});
    }

    return NextResponse.json(funnel);
  } catch (error) {
    logger.error("POST /api/funnels/[id]/publish error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
