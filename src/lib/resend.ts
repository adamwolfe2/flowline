import { Resend } from "resend";
import { logger } from "@/lib/logger";
import { db } from "@/db";
import { funnels, teams } from "@/db/schema";
import { eq } from "drizzle-orm";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const DEFAULT_BRAND = "MyVSL";
const FROM = `${DEFAULT_BRAND} <noreply@getmyvsl.com>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";

/**
 * Look up team branding for a funnel.
 * Returns the team's appName if configured, otherwise "MyVSL".
 */
export async function getTeamBrandName(funnelId: string): Promise<string> {
  try {
    const [funnel] = await db
      .select({ teamId: funnels.teamId })
      .from(funnels)
      .where(eq(funnels.id, funnelId));

    if (!funnel?.teamId) return DEFAULT_BRAND;

    const [team] = await db
      .select({ branding: teams.branding })
      .from(teams)
      .where(eq(teams.id, funnel.teamId));

    const branding = team?.branding as { appName?: string } | null;
    return branding?.appName || DEFAULT_BRAND;
  } catch (err) {
    logger.error("[resend] getTeamBrandName failed", {
      funnelId,
      error: err instanceof Error ? err.message : String(err),
    });
    return DEFAULT_BRAND;
  }
}

/** Escape HTML special characters to prevent XSS in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendLeadNotification(params: {
  toEmail: string;
  funnelName: string;
  leadEmail: string;
  score: number;
  calendarTier: string;
  funnelId: string;
  brandName?: string;
}) {
  if (!resend) return;
  const brand = params.brandName ?? DEFAULT_BRAND;
  const fromLine = brand !== DEFAULT_BRAND ? `${brand} <noreply@getmyvsl.com>` : FROM;
  try {
    await resend.emails.send({
      from: fromLine,
      to: params.toEmail,
      subject: `New lead on ${params.funnelName} (${params.calendarTier} tier)`,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#111827">New Lead: ${escapeHtml(params.calendarTier)} fit</h2><p style="color:#6B7280">Someone just completed your <strong>${escapeHtml(params.funnelName)}</strong> funnel.</p><div style="background:#F9FAFB;border-radius:8px;padding:16px;margin:16px 0"><p><strong>Email:</strong> ${escapeHtml(params.leadEmail)}</p><p><strong>Score:</strong> ${params.score}</p><p><strong>Tier:</strong> ${escapeHtml(params.calendarTier)}</p></div><a href="${escapeHtml(process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com")}/analytics/${escapeHtml(params.funnelId)}" style="background:#2D6A4F;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">View Analytics</a><p style="color:#9CA3AF;font-size:11px;margin-top:24px;">Powered by ${escapeHtml(brand)}</p></div>`,
    });
  } catch (err) {
    logger.error("[resend] lead notification failed", { error: err instanceof Error ? err.message : String(err) });
  }
}

export async function sendWelcomeEmail(email: string) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Welcome to MyVSL! Let's build your first funnel",
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#111827">Welcome to MyVSL</h2><p style="color:#6B7280">You're 60 seconds away from your first VSL funnel.</p><div style="margin:24px 0"><p><strong>1.</strong> Describe your business</p><p><strong>2.</strong> Upload your logo + pick a color</p><p><strong>3.</strong> Add your calendar link + publish</p></div><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com"}/build" style="background:#2D6A4F;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Build My First Funnel</a><p style="color:#9CA3AF;font-size:12px;margin-top:24px">No credit card required. Free plan forever.</p></div>`,
    });
  } catch (err) {
    logger.error("[resend] welcome email failed", { error: err instanceof Error ? err.message : String(err) });
  }
}

export async function sendClientInviteEmail(params: {
  toEmail: string;
  brandName: string;
  shareUrl: string;
  poweredByName?: string;
}) {
  if (!resend) return;
  const footerBrand = params.poweredByName ?? DEFAULT_BRAND;
  const fromLine = footerBrand !== DEFAULT_BRAND ? `${footerBrand} <noreply@getmyvsl.com>` : FROM;
  try {
    await resend.emails.send({
      from: fromLine,
      to: params.toEmail,
      subject: `View your funnel analytics — ${params.brandName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 20px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                <tr><td style="padding:24px 32px;border-bottom:1px solid #f3f4f6;">
                  <span style="font-size:16px;font-weight:600;color:#111827;">${escapeHtml(params.brandName)}</span>
                </td></tr>
                <tr><td style="padding:32px;color:#374151;font-size:15px;line-height:1.6;">
                  <p style="margin:0 0 16px 0;">Hi,</p>
                  <p style="margin:0 0 16px 0;">You've been invited to view the analytics for <strong>${escapeHtml(params.brandName)}</strong>. Click below to see your funnel's performance.</p>
                  <a href="${escapeHtml(params.shareUrl)}" style="background:#2D6A4F;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:500;">View Analytics</a>
                </td></tr>
                <tr><td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #f3f4f6;">
                  <p style="margin:0;font-size:11px;color:#9ca3af;">
                    Powered by <a href="${escapeHtml(APP_URL)}" style="color:#9ca3af;">${escapeHtml(footerBrand)}</a>
                  </p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });
  } catch (err) {
    logger.error("[resend] client invite email failed", { error: err instanceof Error ? err.message : String(err) });
  }
}

export async function sendWeeklyDigestEmail(params: {
  toEmail: string;
  thisWeekSessions: number;
  thisWeekLeads: number;
  thisWeekConversion: number;
  lastWeekSessions: number;
  lastWeekLeads: number;
  lastWeekConversion: number;
  topFunnels: Array<{ name: string; leads: number }>;
  brandName?: string;
}) {
  if (!resend) return;
  try {
    const brand = params.brandName ?? DEFAULT_BRAND;
    const fromLine = brand !== DEFAULT_BRAND ? `${brand} <noreply@getmyvsl.com>` : FROM;
    const sessionsDelta = params.thisWeekSessions - params.lastWeekSessions;
    const leadsDelta = params.thisWeekLeads - params.lastWeekLeads;
    const convDelta = params.thisWeekConversion - params.lastWeekConversion;

    function arrow(value: number, suffix = ""): string {
      if (value > 0) return `<span style="color:#2D6A4F;">+${value}${suffix}</span>`;
      if (value < 0) return `<span style="color:#DC2626;">${value}${suffix}</span>`;
      return `<span style="color:#9CA3AF;">0${suffix}</span>`;
    }

    const topFunnelRows = params.topFunnels.map(f =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#374151;">${escapeHtml(f.name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111827;font-weight:600;text-align:right;">${f.leads}</td>
      </tr>`
    ).join("");

    await resend.emails.send({
      from: fromLine,
      to: params.toEmail,
      subject: `Your ${brand} Weekly Report — ${params.thisWeekLeads} new leads`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 20px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                <tr><td style="padding:24px 32px;border-bottom:1px solid #f3f4f6;">
                  <span style="font-size:16px;font-weight:600;color:#111827;">${escapeHtml(brand)} Weekly Report</span>
                </td></tr>
                <tr><td style="padding:32px;color:#374151;font-size:15px;line-height:1.6;">
                  <p style="margin:0 0 20px 0;">Here's how your funnels performed this week:</p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr>
                      <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center;width:33%;">
                        <p style="margin:0;font-size:28px;font-weight:700;color:#111827;">${params.thisWeekSessions}</p>
                        <p style="margin:4px 0 0 0;font-size:12px;color:#6B7280;">Sessions</p>
                        <p style="margin:4px 0 0 0;font-size:11px;">${arrow(sessionsDelta)} vs last week</p>
                      </td>
                      <td style="width:8px;"></td>
                      <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center;width:33%;">
                        <p style="margin:0;font-size:28px;font-weight:700;color:#111827;">${params.thisWeekLeads}</p>
                        <p style="margin:4px 0 0 0;font-size:12px;color:#6B7280;">Leads</p>
                        <p style="margin:4px 0 0 0;font-size:11px;">${arrow(leadsDelta)} vs last week</p>
                      </td>
                      <td style="width:8px;"></td>
                      <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center;width:33%;">
                        <p style="margin:0;font-size:28px;font-weight:700;color:#111827;">${params.thisWeekConversion}%</p>
                        <p style="margin:4px 0 0 0;font-size:12px;color:#6B7280;">Conversion</p>
                        <p style="margin:4px 0 0 0;font-size:11px;">${arrow(convDelta, "%")} vs last week</p>
                      </td>
                    </tr>
                  </table>

                  ${params.topFunnels.length > 0 ? `
                  <p style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:#111827;">Top Funnels</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                    <tr style="background:#f9fafb;">
                      <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Funnel</th>
                      <th style="padding:8px 12px;text-align:right;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Leads</th>
                    </tr>
                    ${topFunnelRows}
                  </table>
                  ` : ""}

                  <a href="${escapeHtml(APP_URL)}/dashboard" style="background:#2D6A4F;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:500;">View Dashboard</a>
                </td></tr>
                <tr><td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #f3f4f6;">
                  <p style="margin:0;font-size:11px;color:#9ca3af;">
                    Powered by <a href="${escapeHtml(APP_URL)}" style="color:#9ca3af;">${escapeHtml(brand)}</a>
                  </p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });
  } catch (err) {
    logger.error("[resend] weekly digest email failed", { error: err instanceof Error ? err.message : String(err) });
  }
}

export async function sendDailyDigestEmail(params: {
  toEmail: string;
  brandName: string;
  shareUrl: string;
  yesterdaySessions: number;
  yesterdayLeads: number;
  yesterdayConversionRate: number;
  prevDaySessions: number;
  prevDayLeads: number;
  prevDayConversionRate: number;
  poweredByName?: string;
}) {
  if (!resend) return;
  try {
    const footerBrand = params.poweredByName ?? DEFAULT_BRAND;
    const fromLine = footerBrand !== DEFAULT_BRAND ? `${footerBrand} <noreply@getmyvsl.com>` : FROM;
    const sessionsDelta = params.yesterdaySessions - params.prevDaySessions;
    const leadsDelta = params.yesterdayLeads - params.prevDayLeads;
    const convDelta = params.yesterdayConversionRate - params.prevDayConversionRate;

    function formatDelta(value: number, suffix = ""): string {
      if (value > 0) return `<span style="color:#2D6A4F;">+${value}${suffix}</span>`;
      if (value < 0) return `<span style="color:#DC2626;">${value}${suffix}</span>`;
      return `<span style="color:#9CA3AF;">0${suffix}</span>`;
    }

    await resend.emails.send({
      from: fromLine,
      to: params.toEmail,
      subject: `${params.brandName} — Daily Funnel Report`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 20px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                <tr><td style="padding:24px 32px;border-bottom:1px solid #f3f4f6;">
                  <span style="font-size:16px;font-weight:600;color:#111827;">${escapeHtml(params.brandName)} — Daily Report</span>
                </td></tr>
                <tr><td style="padding:32px;color:#374151;font-size:15px;line-height:1.6;">
                  <p style="margin:0 0 20px 0;">Here's how your funnel performed yesterday:</p>
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr>
                      <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center;width:33%;">
                        <p style="margin:0;font-size:24px;font-weight:700;color:#111827;">${params.yesterdaySessions}</p>
                        <p style="margin:4px 0 0 0;font-size:11px;color:#6B7280;">Sessions</p>
                        <p style="margin:4px 0 0 0;font-size:11px;">${formatDelta(sessionsDelta)} vs prev day</p>
                      </td>
                      <td style="width:8px;"></td>
                      <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center;width:33%;">
                        <p style="margin:0;font-size:24px;font-weight:700;color:#111827;">${params.yesterdayLeads}</p>
                        <p style="margin:4px 0 0 0;font-size:11px;color:#6B7280;">Leads</p>
                        <p style="margin:4px 0 0 0;font-size:11px;">${formatDelta(leadsDelta)} vs prev day</p>
                      </td>
                      <td style="width:8px;"></td>
                      <td style="padding:16px;background:#f9fafb;border-radius:8px;text-align:center;width:33%;">
                        <p style="margin:0;font-size:24px;font-weight:700;color:#111827;">${params.yesterdayConversionRate}%</p>
                        <p style="margin:4px 0 0 0;font-size:11px;color:#6B7280;">Conversion</p>
                        <p style="margin:4px 0 0 0;font-size:11px;">${formatDelta(convDelta, "%")} vs prev day</p>
                      </td>
                    </tr>
                  </table>
                  <a href="${escapeHtml(params.shareUrl)}" style="background:#2D6A4F;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:500;">View Full Analytics</a>
                </td></tr>
                <tr><td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #f3f4f6;">
                  <p style="margin:0;font-size:11px;color:#9ca3af;">
                    Powered by <a href="${escapeHtml(APP_URL)}" style="color:#9ca3af;">${escapeHtml(footerBrand)}</a>
                  </p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });
  } catch (err) {
    logger.error("[resend] daily digest email failed", { error: err instanceof Error ? err.message : String(err) });
  }
}
