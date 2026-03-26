import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { funnels, emailSequences, emailSteps, users } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { isSuperAdmin } from "@/lib/admin";
import { getPlanLimits } from "@/lib/plan-limits";

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

    // Plan enforcement — email sequences require Pro or Agency
    const isAdmin = await isSuperAdmin(userId);
    if (!isAdmin) {
      const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
      const limits = getPlanLimits(user?.plan ?? "free");
      if (!limits.emailSequences) {
        return NextResponse.json(
          { error: "Email sequences require a Pro plan. Upgrade to unlock this feature.", upgrade: true },
          { status: 403 }
        );
      }
    }

    const { name, triggerTier, triggerType } = await req.json();

    // Validate triggerTier if provided
    const validTiers = ['high', 'mid', 'low'] as const;
    if (triggerTier !== undefined && triggerTier !== null && !validTiers.includes(triggerTier)) {
      return NextResponse.json({ error: "triggerTier must be 'high', 'mid', 'low', or null" }, { status: 400 });
    }

    // Validate triggerType if provided
    const validTriggerTypes = ['lead_created', 'abandoned'] as const;
    if (triggerType !== undefined && !validTriggerTypes.includes(triggerType)) {
      return NextResponse.json({ error: "triggerType must be 'lead_created' or 'abandoned'" }, { status: 400 });
    }

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
      triggerType: triggerType || "lead_created",
    }).returning();

    // Create default first step — content varies by trigger type
    const isAbandoned = triggerType === "abandoned";
    const [step] = await db.insert(emailSteps).values({
      sequenceId: sequence.id,
      stepOrder: 1,
      subject: isAbandoned
        ? "You didn't finish your quiz!"
        : "Thanks for your interest!",
      body: isAbandoned
        ? "Hi there,\n\nWe noticed you started the {funnel_name} quiz but didn't get to finish.\n\nYour personalized results are just a few clicks away. Come back and complete the quiz to see what we recommend for you.\n\nBest regards"
        : "Hi there,\n\nThanks for taking the time to complete our quiz. We noticed you haven't booked a call yet.\n\nClick here to schedule: {calendar_url}\n\nBest regards",
      delayHours: isAbandoned ? 1 : 24,
    }).returning();

    return NextResponse.json({ ...sequence, steps: [step] }, { status: 201 });
  } catch (error) {
    logger.error("Create sequence error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
