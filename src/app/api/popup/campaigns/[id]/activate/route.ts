import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { popupCampaigns, funnels } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { apiLimiter, checkRateLimit } from "@/lib/rate-limit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 });

    const rl = await checkRateLimit(apiLimiter, userId);
    if (rl.limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const [campaign] = await db
      .select({
        id: popupCampaigns.id,
        funnelId: popupCampaigns.funnelId,
        status: popupCampaigns.status,
      })
      .from(popupCampaigns)
      .where(and(eq(popupCampaigns.id, id), eq(popupCampaigns.userId, userId)));

    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [funnel] = await db
      .select({ published: funnels.published })
      .from(funnels)
      .where(eq(funnels.id, campaign.funnelId));

    if (!funnel?.published) {
      return NextResponse.json({ error: "Cannot activate — associated funnel is not published" }, { status: 400 });
    }

    const [updated] = await db
      .update(popupCampaigns)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(popupCampaigns.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("POST /api/popup/campaigns/[id]/activate error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
