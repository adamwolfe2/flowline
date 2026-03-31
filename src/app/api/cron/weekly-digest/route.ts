import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, funnels, funnelSessions, leads, teams } from "@/db/schema";
import { eq, and, gte, sql, inArray, isNotNull } from "drizzle-orm";
import { sendWeeklyDigestEmail } from "@/lib/resend";
import { logger } from "@/lib/logger";
import type { FunnelConfig, TeamBranding } from "@/types";

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get all users who have at least 1 published funnel
    const usersWithPublishedFunnels = await db
      .selectDistinct({ userId: funnels.userId })
      .from(funnels)
      .where(eq(funnels.published, true));

    if (usersWithPublishedFunnels.length === 0) {
      return NextResponse.json({ sent: 0, message: "No users with published funnels" });
    }

    const userIds = usersWithPublishedFunnels.map(u => u.userId);
    let sentCount = 0;

    for (const userId of userIds) {
      try {
        // Get user email and notification preferences
        const [user] = await db
          .select({ email: users.email, notificationPreferences: users.notificationPreferences })
          .from(users)
          .where(eq(users.id, userId));
        if (!user?.email) continue;

        // Skip users who opted out of weekly digest
        const userPrefs = user.notificationPreferences as { weeklyDigest?: boolean } | null;
        if (userPrefs?.weeklyDigest === false) continue;

        // Get all funnel IDs for this user
        const userFunnels = await db
          .select({ id: funnels.id, config: funnels.config })
          .from(funnels)
          .where(eq(funnels.userId, userId));

        if (userFunnels.length === 0) continue;
        const funnelIds = userFunnels.map(f => f.id);

        // This week's stats
        const [thisWeekSessions] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(funnelSessions)
          .where(and(inArray(funnelSessions.funnelId, funnelIds), gte(funnelSessions.startedAt, oneWeekAgo)));

        const [thisWeekLeads] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(leads)
          .where(and(inArray(leads.funnelId, funnelIds), gte(leads.createdAt, oneWeekAgo)));

        // Last week's stats (for comparison)
        const [lastWeekSessions] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(funnelSessions)
          .where(and(
            inArray(funnelSessions.funnelId, funnelIds),
            gte(funnelSessions.startedAt, twoWeeksAgo),
            sql`${funnelSessions.startedAt} < ${oneWeekAgo}`
          ));

        const [lastWeekLeads] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(leads)
          .where(and(
            inArray(leads.funnelId, funnelIds),
            gte(leads.createdAt, twoWeeksAgo),
            sql`${leads.createdAt} < ${oneWeekAgo}`
          ));

        const thisWeekSessionCount = Number(thisWeekSessions?.count ?? 0);
        const thisWeekLeadCount = Number(thisWeekLeads?.count ?? 0);
        const lastWeekSessionCount = Number(lastWeekSessions?.count ?? 0);
        const lastWeekLeadCount = Number(lastWeekLeads?.count ?? 0);

        const thisWeekConversion = thisWeekSessionCount > 0
          ? Math.round((thisWeekLeadCount / thisWeekSessionCount) * 100)
          : 0;
        const lastWeekConversion = lastWeekSessionCount > 0
          ? Math.round((lastWeekLeadCount / lastWeekSessionCount) * 100)
          : 0;

        // Top 3 funnels by leads this week
        const topFunnels = await db
          .select({
            funnelId: leads.funnelId,
            count: sql<number>`count(*)::int`,
          })
          .from(leads)
          .where(and(inArray(leads.funnelId, funnelIds), gte(leads.createdAt, oneWeekAgo)))
          .groupBy(leads.funnelId)
          .orderBy(sql`count(*) DESC`)
          .limit(3);

        const topFunnelData = topFunnels.map(tf => {
          const funnel = userFunnels.find(f => f.id === tf.funnelId);
          const config = funnel?.config as FunnelConfig | undefined;
          return {
            name: config?.brand?.name ?? "Unnamed Funnel",
            leads: Number(tf.count),
          };
        });

        // Look up team brand name from user's team-owned funnels
        let brandName: string | undefined;
        const teamFunnels = await db
          .select({ teamId: funnels.teamId })
          .from(funnels)
          .where(and(eq(funnels.userId, userId), isNotNull(funnels.teamId)))
          .limit(1);

        if (teamFunnels.length > 0 && teamFunnels[0].teamId) {
          const [team] = await db
            .select({ branding: teams.branding })
            .from(teams)
            .where(eq(teams.id, teamFunnels[0].teamId));
          const branding = team?.branding as TeamBranding | null;
          if (branding?.appName) {
            brandName = branding.appName;
          }
        }

        await sendWeeklyDigestEmail({
          toEmail: user.email,
          thisWeekSessions: thisWeekSessionCount,
          thisWeekLeads: thisWeekLeadCount,
          thisWeekConversion,
          lastWeekSessions: lastWeekSessionCount,
          lastWeekLeads: lastWeekLeadCount,
          lastWeekConversion,
          topFunnels: topFunnelData,
          brandName,
        });

        sentCount++;
      } catch (err) {
        logger.error("[weekly-digest] failed for user", {
          userId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({ sent: sentCount, total: userIds.length });
  } catch (error) {
    logger.error("[weekly-digest] cron error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
