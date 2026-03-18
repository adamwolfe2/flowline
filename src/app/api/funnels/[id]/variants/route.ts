import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { funnels, funnelVariants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

// GET all variants for a funnel
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Verify ownership
    const [funnel] = await db.select({ id: funnels.id })
      .from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const variants = await db.select().from(funnelVariants)
      .where(eq(funnelVariants.funnelId, id));

    return NextResponse.json(variants);
  } catch (error) {
    logger.error("Get variants error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create a new variant
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { name, config, trafficWeight: rawWeight, isControl } = await req.json();
    const trafficWeight = rawWeight != null ? Math.max(0, Math.min(100, Number(rawWeight))) : undefined;

    // Verify ownership
    const [funnel] = await db.select()
      .from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Limit to 5 variants per funnel
    const existing = await db.select({ id: funnelVariants.id })
      .from(funnelVariants)
      .where(eq(funnelVariants.funnelId, id));
    if (existing.length >= 5) {
      return NextResponse.json({ error: "Maximum 5 variants per funnel" }, { status: 400 });
    }

    const [variant] = await db.insert(funnelVariants).values({
      funnelId: id,
      name: name || `Variant ${String.fromCharCode(65 + existing.length)}`,
      config: config || funnel.config,
      trafficWeight: trafficWeight ?? 50,
      isControl: isControl ?? false,
    }).returning();

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    logger.error("Create variant error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
