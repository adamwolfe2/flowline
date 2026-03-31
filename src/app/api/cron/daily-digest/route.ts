import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { funnels, funnelSessions, leads, users, teams } from "@/db/schema";
import { eq, and, gte, lt, sql, isNotNull } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { sendDailyDigestEmail } from "@/lib/resend";
import type { TeamBranding } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

async function getDayStats(funnelId: string, dayStart: Date, dayEnd: Date) {
  const [sessionStats] = await db.select({
    total: sql<number>`count(*)::int`,
    converted: sql<number>`coalesce(sum(case when ${funnelSessions.converted} then 1 else 0 end), 0)::int`,
  })
    .from(funnelSessions)
    .where(
      and(
        eq(funnelSessions.funnelId, funnelId),
        gte(funnelSessions.startedAt, dayStart),
        lt(funnelSessions.startedAt, dayEnd),
      )
    );

  const [leadStats] = await db.select({
    count: sql<number>`count(*)::int`,
  })
    .from(leads)
    .where(
      and(
        eq(leads.funnelId, funnelId),
        gte(leads.createdAt, dayStart),
        lt(leads.createdAt, dayEnd),
      )
    );

  const sessions = Number(sessionStats?.total ?? 0);
  const converted = Number(sessionStats?.converted ?? 0);
  const leadCount = Number(leadStats?.count ?? 0);

  return {
    sessions,
    leads: leadCount,
    conversionRate: sessions > 0 ? Math.round((converted / sessions) * 100) : 0,
  };
}

export async function GET(req: Request) {
  // Verify cron authorization with timing-safe comparison
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || !authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expected = `Bearer ${cronSecret}`;
  const isValid =
    authHeader.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected));

  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find all funnels with daily digest enabled, a client email set, and a valid share token
    const eligibleFunnels = await db.select()
      .from(funnels)
      .where(
        and(
          eq(funnels.shareDailyDigest, true),
          isNotNull(funnels.shareClientEmail),
          isNotNull(funnels.shareToken),
          isNotNull(funnels.shareTokenExpiresAt),
        )
      );

    // Filter to those with non-expired tokens
    const activeFunnels = eligibleFunnels.filter((f) => {
      if (!f.shareTokenExpiresAt) return false;
      return new Date(f.shareTokenExpiresAt) > now;
    });

    let sent = 0;
    let skipped = 0;

    // Yesterday: midnight to midnight UTC
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setUTCDate(yesterdayEnd.getUTCDate() + 1);

    // Previous day: day before yesterday
    const prevDay = new Date(yesterday);
    prevDay.setUTCDate(prevDay.getUTCDate() - 1);

    for (const funnel of activeFunnels) {
      if (!funnel.shareClientEmail || !funnel.shareToken) {
        skipped++;
        continue;
      }

      // Check funnel owner's notification preferences
      const [owner] = await db
        .select({ notificationPreferences: users.notificationPreferences })
        .from(users)
        .where(eq(users.id, funnel.userId));
      const ownerPrefs = owner?.notificationPreferences as { leadAlerts?: boolean } | null;
      if (ownerPrefs?.leadAlerts === false) {
        skipped++;
        continue;
      }

      try {
        const [yesterdayStats, prevDayStats] = await Promise.all([
          getDayStats(funnel.id, yesterday, yesterdayEnd),
          getDayStats(funnel.id, prevDay, yesterday),
        ]);

        const config = funnel.config as { brand?: { name?: string } };
        const brandName = config.brand?.name || "Funnel";
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";
        const shareUrl = `${appUrl}/analytics/shared/${funnel.shareToken}`;

        // Look up team brand name for white-label footer
        let poweredByName: string | undefined;
        if (funnel.teamId) {
          const [team] = await db
            .select({ branding: teams.branding })
            .from(teams)
            .where(eq(teams.id, funnel.teamId));
          const branding = team?.branding as TeamBranding | null;
          if (branding?.appName) {
            poweredByName = branding.appName;
          }
        }

        await sendDailyDigestEmail({
          toEmail: funnel.shareClientEmail,
          brandName,
          shareUrl,
          yesterdaySessions: yesterdayStats.sessions,
          yesterdayLeads: yesterdayStats.leads,
          yesterdayConversionRate: yesterdayStats.conversionRate,
          prevDaySessions: prevDayStats.sessions,
          prevDayLeads: prevDayStats.leads,
          prevDayConversionRate: prevDayStats.conversionRate,
          poweredByName,
        });

        sent++;
      } catch (err) {
        logger.error("Daily digest send failed for funnel", {
          funnelId: funnel.id,
          error: err instanceof Error ? err.message : String(err),
        });
        skipped++;
      }
    }

    return NextResponse.json({
      eligible: activeFunnels.length,
      sent,
      skipped,
    });
  } catch (error) {
    logger.error("Cron daily-digest error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
