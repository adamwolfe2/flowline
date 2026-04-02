import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { emailSequences, emailSteps } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { requireFunnelAccess } from "@/lib/team-access";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; sequenceId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, sequenceId } = await params;

    try {
      await requireFunnelAccess(userId, id, "edit");
    } catch (err) {
      const e = err as { status?: number; error?: string };
      return NextResponse.json({ error: e.error || "Not found" }, { status: e.status || 404 });
    }

    const body = await req.json();

    // Validate triggerTier if provided
    if (body.triggerTier !== undefined && body.triggerTier !== null) {
      const validTiers = ['high', 'mid', 'low'] as const;
      if (!validTiers.includes(body.triggerTier)) {
        return NextResponse.json({ error: "triggerTier must be 'high', 'mid', 'low', or null" }, { status: 400 });
      }
    }

    // Validate triggerType if provided
    if (body.triggerType !== undefined) {
      const validTriggerTypes = ['lead_created', 'abandoned'] as const;
      if (!validTriggerTypes.includes(body.triggerType)) {
        return NextResponse.json({ error: "triggerType must be 'lead_created' or 'abandoned'" }, { status: 400 });
      }
    }

    // Update sequence metadata
    if (body.name !== undefined || body.active !== undefined || body.triggerTier !== undefined || body.triggerType !== undefined) {
      const updates: Record<string, unknown> = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.active !== undefined) updates.active = body.active;
      if (body.triggerTier !== undefined) updates.triggerTier = body.triggerTier;
      if (body.triggerType !== undefined) updates.triggerType = body.triggerType;

      await db.update(emailSequences)
        .set(updates)
        .where(and(eq(emailSequences.id, sequenceId), eq(emailSequences.funnelId, id)));
    }

    // Update steps if provided — wrapped in transaction to prevent data loss
    if (body.steps && Array.isArray(body.steps)) {
      if (body.steps.length > 10) {
        return NextResponse.json({ error: "Maximum 10 steps per sequence" }, { status: 400 });
      }
      for (const step of body.steps) {
        if (step.subject && step.subject.length > 200) {
          return NextResponse.json({ error: "Subject must be under 200 characters" }, { status: 400 });
        }
        if (step.body && step.body.length > 10000) {
          return NextResponse.json({ error: "Email body must be under 10,000 characters" }, { status: 400 });
        }
      }
      try {
        await db.transaction(async (tx) => {
          await tx.delete(emailSteps).where(eq(emailSteps.sequenceId, sequenceId));

          for (let i = 0; i < body.steps.length; i++) {
            const step = body.steps[i];
            await tx.insert(emailSteps).values({
              sequenceId,
              stepOrder: i + 1,
              subject: step.subject || "Follow up",
              body: step.body || "",
              delayHours: step.delayHours ?? 24,
            });
          }
        });
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

    try {
      await requireFunnelAccess(userId, id, "edit");
    } catch (err) {
      const e = err as { status?: number; error?: string };
      return NextResponse.json({ error: e.error || "Not found" }, { status: e.status || 404 });
    }

    await db.delete(emailSequences)
      .where(and(eq(emailSequences.id, sequenceId), eq(emailSequences.funnelId, id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Delete sequence error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
