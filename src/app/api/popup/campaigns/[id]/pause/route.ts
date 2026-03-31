import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { popupCampaigns } from "@/db/schema";
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

    const [existing] = await db
      .select({ id: popupCampaigns.id })
      .from(popupCampaigns)
      .where(and(eq(popupCampaigns.id, id), eq(popupCampaigns.userId, userId)));

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [updated] = await db
      .update(popupCampaigns)
      .set({ status: "paused", updatedAt: new Date() })
      .where(eq(popupCampaigns.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("POST /api/popup/campaigns/[id]/pause error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
