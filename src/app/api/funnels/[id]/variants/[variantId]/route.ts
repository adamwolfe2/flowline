import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { funnels, funnelVariants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

// PATCH update a variant
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; variantId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, variantId } = await params;

    // Verify ownership
    const [funnel] = await db.select({ id: funnels.id })
      .from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.config !== undefined) updates.config = body.config;
    if (body.trafficWeight !== undefined) updates.trafficWeight = body.trafficWeight;
    if (body.active !== undefined) updates.active = body.active;

    const [updated] = await db.update(funnelVariants)
      .set(updates)
      .where(and(eq(funnelVariants.id, variantId), eq(funnelVariants.funnelId, id)))
      .returning();

    if (!updated) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Update variant error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE a variant
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; variantId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, variantId } = await params;

    // Verify ownership
    const [funnel] = await db.select({ id: funnels.id })
      .from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.delete(funnelVariants)
      .where(and(eq(funnelVariants.id, variantId), eq(funnelVariants.funnelId, id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Delete variant error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
