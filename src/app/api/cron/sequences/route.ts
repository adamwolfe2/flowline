import { NextResponse } from "next/server";
import { db } from "@/db";
import { sequenceEnrollments, emailSteps, emailSequences, leads, funnels } from "@/db/schema";
import { eq, and, lte, asc } from "drizzle-orm";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find enrollments ready to send
    const pendingEnrollments = await db.select()
      .from(sequenceEnrollments)
      .where(and(
        eq(sequenceEnrollments.status, "active"),
        lte(sequenceEnrollments.nextSendAt, now),
      ))
      .limit(50);

    let sent = 0;
    let completed = 0;

    for (const enrollment of pendingEnrollments) {
      try {
        // Get the next step
        const [step] = await db.select().from(emailSteps)
          .where(and(
            eq(emailSteps.sequenceId, enrollment.sequenceId),
            eq(emailSteps.stepOrder, enrollment.currentStep + 1),
          ));

        if (!step) {
          // No more steps — mark complete
          await db.update(sequenceEnrollments)
            .set({ status: "completed", completedAt: now })
            .where(eq(sequenceEnrollments.id, enrollment.id));
          completed++;
          continue;
        }

        // Get lead email and funnel info
        const [lead] = await db.select().from(leads)
          .where(eq(leads.id, enrollment.leadId));
        if (!lead) continue;

        const [sequence] = await db.select().from(emailSequences)
          .where(eq(emailSequences.id, enrollment.sequenceId));
        if (!sequence) continue;

        const [funnel] = await db.select().from(funnels)
          .where(eq(funnels.id, sequence.funnelId));

        // Send email via Resend
        if (process.env.RESEND_API_KEY) {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);

          const funnelConfig = funnel?.config as Record<string, unknown> | undefined;
          const brand = funnelConfig?.brand as Record<string, string> | undefined;
          const fromName = brand?.name || "MyVSL";

          // Replace placeholders in body
          const emailBody = step.body
            .replace(/\{email\}/g, lead.email)
            .replace(/\{score\}/g, String(lead.score))
            .replace(/\{tier\}/g, lead.calendarTier);

          await resend.emails.send({
            from: `${fromName} <noreply@getmyvsl.com>`,
            to: lead.email,
            subject: step.subject,
            text: emailBody,
          });
          sent++;
        }

        // Advance enrollment
        const nextStepOrder = step.stepOrder + 1;
        const [nextStep] = await db.select().from(emailSteps)
          .where(and(
            eq(emailSteps.sequenceId, enrollment.sequenceId),
            eq(emailSteps.stepOrder, nextStepOrder),
          ));

        if (nextStep) {
          await db.update(sequenceEnrollments)
            .set({
              currentStep: step.stepOrder,
              nextSendAt: new Date(now.getTime() + nextStep.delayHours * 60 * 60 * 1000),
            })
            .where(eq(sequenceEnrollments.id, enrollment.id));
        } else {
          await db.update(sequenceEnrollments)
            .set({ status: "completed", currentStep: step.stepOrder, completedAt: now })
            .where(eq(sequenceEnrollments.id, enrollment.id));
          completed++;
        }
      } catch (err) {
        logger.error("Sequence step failed", {
          enrollmentId: enrollment.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({ processed: pendingEnrollments.length, sent, completed });
  } catch (error) {
    logger.error("Cron sequences error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
