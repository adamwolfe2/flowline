import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { and, isNotNull, gt, lt, sql, eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ sent: 0, message: "Resend not configured" });
  }

  try {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    // Find users on pro trial that expire within the next 2 days
    const expiringUsers = await db
      .select({ id: users.id, email: users.email, trialEndsAt: users.trialEndsAt })
      .from(users)
      .where(
        and(
          isNotNull(users.trialEndsAt),
          gt(users.trialEndsAt, now),
          lt(users.trialEndsAt, twoDaysFromNow),
          eq(users.plan, "pro"),
        )
      );

    if (expiringUsers.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";

    let sent = 0;

    for (const user of expiringUsers) {
      if (!user.trialEndsAt) continue;

      const msRemaining = user.trialEndsAt.getTime() - now.getTime();
      const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 0) continue;

      const dayLabel = daysRemaining === 1 ? "1 day" : `${daysRemaining} days`;

      try {
        await resend.emails.send({
          from: "MyVSL <noreply@getmyvsl.com>",
          to: user.email,
          subject: "Your MyVSL Pro trial ends soon",
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
                      <tr>
                        <td style="padding:24px 32px;border-bottom:1px solid #f3f4f6;">
                          <span style="font-size:16px;font-weight:600;color:#111827;">MyVSL</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:32px;color:#374151;font-size:15px;line-height:1.6;">
                          <p style="margin:0 0 16px 0;">Hi there,</p>
                          <p style="margin:0 0 16px 0;">Your 14-day free Pro trial ends in <strong>${dayLabel}</strong>.</p>
                          <p style="margin:0 0 24px 0;">Upgrade now to keep access to all Pro features — advanced analytics, custom domains, unlimited submissions, and more.</p>
                          <p style="margin:0 0 0 0;">
                            <a href="${appUrl}/billing" style="display:inline-block;background-color:#2D6A4F;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                              Upgrade Now
                            </a>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #f3f4f6;">
                          <p style="margin:0;font-size:11px;color:#9ca3af;">
                            Sent by <a href="${appUrl}" style="color:#9ca3af;">MyVSL</a>
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
      } catch (emailErr) {
        logger.error("Trial reminder cron: email send failed", {
          userId: user.id,
          error: emailErr instanceof Error ? emailErr.message : String(emailErr),
        });
      }
    }

    return NextResponse.json({ sent, total: expiringUsers.length });
  } catch (error) {
    logger.error("Trial reminder cron error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
