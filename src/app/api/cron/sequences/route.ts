import { NextResponse } from "next/server";
import { db } from "@/db";
import { sequenceEnrollments, emailSteps, emailSequences, leads, funnels } from "@/db/schema";
import { eq, and, lte, asc } from "drizzle-orm";
import { logger } from "@/lib/logger";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Vercel crons send this header automatically
  const isVercelCron = req.headers.get("x-vercel-cron") === "true";

  if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
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
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getmyvsl.com";

          // Replace placeholders in body
          const emailBody = step.body
            .replace(/\{email\}/g, escapeHtml(lead.email))
            .replace(/\{score\}/g, escapeHtml(String(lead.score)))
            .replace(/\{tier\}/g, escapeHtml(lead.calendarTier));

          await resend.emails.send({
            from: `${fromName} <noreply@getmyvsl.com>`,
            to: lead.email,
            subject: step.subject,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 20px;">
                  <tr>
                    <td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                        <!-- Header -->
                        <tr>
                          <td style="padding:24px 32px;border-bottom:1px solid #f3f4f6;">
                            <span style="font-size:16px;font-weight:600;color:#111827;">${fromName}</span>
                          </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                          <td style="padding:32px;color:#374151;font-size:15px;line-height:1.6;">
                            ${emailBody.split('\n').map(line => `<p style="margin:0 0 12px 0;">${line}</p>`).join('')}
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #f3f4f6;">
                            <p style="margin:0;font-size:11px;color:#9ca3af;">
                              Sent by ${fromName} via <a href="${appUrl}" style="color:#9ca3af;">MyVSL</a>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
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
