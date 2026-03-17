import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { funnels, emailSequences, emailSteps } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; sequenceId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, sequenceId } = await params;

    const [funnel] = await db.select({ id: funnels.id })
      .from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();

    // Update sequence metadata
    if (body.name !== undefined || body.active !== undefined || body.triggerTier !== undefined) {
      const updates: Record<string, unknown> = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.active !== undefined) updates.active = body.active;
      if (body.triggerTier !== undefined) updates.triggerTier = body.triggerTier;

      await db.update(emailSequences)
        .set(updates)
        .where(and(eq(emailSequences.id, sequenceId), eq(emailSequences.funnelId, id)));
    }

    // Update steps if provided
    if (body.steps && Array.isArray(body.steps)) {
      try {
        await db.delete(emailSteps).where(eq(emailSteps.sequenceId, sequenceId));

        for (let i = 0; i < body.steps.length; i++) {
          const step = body.steps[i];
          await db.insert(emailSteps).values({
            sequenceId,
            stepOrder: i + 1,
            subject: step.subject || "Follow up",
            body: step.body || "",
            delayHours: step.delayHours ?? 24,
          });
        }
      } catch (stepError) {
        logger.error("Failed to update sequence steps", {
          sequenceId,
          error: stepError instanceof Error ? stepError.message : String(stepError)
        });
        return NextResponse.json({ error: "Failed to update steps" }, { status: 500 });
      }
    }

    // Return updated sequence with steps
    const [updated] = await db.select().from(emailSequences)
      .where(eq(emailSequences.id, sequenceId));
    const steps = await db.select().from(emailSteps)
      .where(eq(emailSteps.sequenceId, sequenceId))
      .orderBy(asc(emailSteps.stepOrder));

    return NextResponse.json({ ...updated, steps });
  } catch (error) {
    logger.error("Update sequence error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; sequenceId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, sequenceId } = await params;

    const [funnel] = await db.select({ id: funnels.id })
      .from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.delete(emailSequences)
      .where(and(eq(emailSequences.id, sequenceId), eq(emailSequences.funnelId, id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Delete sequence error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
