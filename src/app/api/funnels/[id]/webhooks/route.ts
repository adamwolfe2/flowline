import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { funnels, webhookDeliveries } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "@/lib/logger";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: "Invalid funnel ID" }, { status: 400 });
    }

    // Verify ownership
    const [funnel] = await db.select({ id: funnels.id })
      .from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const deliveries = await db.select()
      .from(webhookDeliveries)
      .where(eq(webhookDeliveries.funnelId, id))
      .orderBy(desc(webhookDeliveries.createdAt))
      .limit(20);

    return NextResponse.json(deliveries);
  } catch (error) {
    logger.error("GET /api/funnels/[id]/webhooks error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
