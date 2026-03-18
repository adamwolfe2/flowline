import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = "MyVSL <noreply@getmyvsl.com>";

export async function sendLeadNotification(params: {
  toEmail: string;
  funnelName: string;
  leadEmail: string;
  score: number;
  calendarTier: string;
  funnelId: string;
}) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: params.toEmail,
      subject: `New lead on ${params.funnelName} (${params.calendarTier} tier)`,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#111827">New Lead: ${params.calendarTier} fit</h2><p style="color:#6B7280">Someone just completed your <strong>${params.funnelName}</strong> funnel.</p><div style="background:#F9FAFB;border-radius:8px;padding:16px;margin:16px 0"><p><strong>Email:</strong> ${params.leadEmail}</p><p><strong>Score:</strong> ${params.score}</p><p><strong>Tier:</strong> ${params.calendarTier}</p></div><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com"}/analytics/${params.funnelId}" style="background:#2D6A4F;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">View Analytics</a></div>`,
    });
  } catch (err) {
    console.error("[resend] lead notification failed:", err);
  }
}

export async function sendWelcomeEmail(email: string) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Welcome to MyVSL! Let's build your first funnel",
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#111827">Welcome to MyVSL</h2><p style="color:#6B7280">You're 60 seconds away from your first VSL funnel.</p><div style="margin:24px 0"><p><strong>1.</strong> Describe your business</p><p><strong>2.</strong> Upload your logo + pick a color</p><p><strong>3.</strong> Add your calendar link + publish</p></div><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com"}/onboarding" style="background:#2D6A4F;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Build My First Funnel</a><p style="color:#9CA3AF;font-size:12px;margin-top:24px">No credit card required. Free plan forever.</p></div>`,
    });
  } catch (err) {
    console.error("[resend] welcome email failed:", err);
  }
}
