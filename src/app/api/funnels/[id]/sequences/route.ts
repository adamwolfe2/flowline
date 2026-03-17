import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { funnels, emailSequences, emailSteps } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const [funnel] = await db.select({ id: funnels.id })
      .from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const sequences = await db.select().from(emailSequences)
      .where(eq(emailSequences.funnelId, id));

    // Fetch steps for each sequence
    const result = await Promise.all(sequences.map(async (seq) => {
      const steps = await db.select().from(emailSteps)
        .where(eq(emailSteps.sequenceId, seq.id))
        .orderBy(asc(emailSteps.stepOrder));
      return { ...seq, steps };
    }));

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Get sequences error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { name, triggerTier } = await req.json();

    const [funnel] = await db.select({ id: funnels.id })
      .from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));
    if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Max 3 sequences per funnel
    const existing = await db.select({ id: emailSequences.id })
      .from(emailSequences)
      .where(eq(emailSequences.funnelId, id));
    if (existing.length >= 3) {
      return NextResponse.json({ error: "Maximum 3 sequences per funnel" }, { status: 400 });
    }

    const [sequence] = await db.insert(emailSequences).values({
      funnelId: id,
      userId,
      name: name || "Follow-up Sequence",
      triggerTier: triggerTier || null,
    }).returning();

    // Create default first step
    const [step] = await db.insert(emailSteps).values({
      sequenceId: sequence.id,
      stepOrder: 1,
      subject: "Thanks for your interest!",
      body: "Hi there,\n\nThanks for taking the time to complete our quiz. We noticed you haven't booked a call yet.\n\nClick here to schedule: {calendar_url}\n\nBest regards",
      delayHours: 24,
    }).returning();

    return NextResponse.json({ ...sequence, steps: [step] }, { status: 201 });
  } catch (error) {
    logger.error("Create sequence error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
