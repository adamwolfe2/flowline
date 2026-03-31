import { db } from "@/db";
import { popupCampaigns, popupImpressions, funnels } from "@/db/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";

function getDateCutoff(timeRange: string): Date | null {
  const now = new Date();
  switch (timeRange) {
    case "7d": now.setDate(now.getDate() - 7); return now;
    case "30d": now.setDate(now.getDate() - 30); return now;
    case "90d": now.setDate(now.getDate() - 90); return now;
    default: return null;
  }
}

export async function getCampaignStats(campaignId: string, timeRange = "all") {
  const cutoff = getDateCutoff(timeRange);
  const whereClause = cutoff
    ? and(eq(popupImpressions.campaignId, campaignId), gte(popupImpressions.createdAt, cutoff))
    : eq(popupImpressions.campaignId, campaignId);

  const [result] = await db
    .select({
      totalImpressions: sql<number>`count(*)::int`,
      totalShown: sql<number>`coalesce(sum(case when ${popupImpressions.action} = 'shown' then 1 else 0 end), 0)::int`,
      totalDismissed: sql<number>`coalesce(sum(case when ${popupImpressions.action} = 'dismissed' then 1 else 0 end), 0)::int`,
      totalEngaged: sql<number>`coalesce(sum(case when ${popupImpressions.action} = 'engaged' then 1 else 0 end), 0)::int`,
      totalConverted: sql<number>`coalesce(sum(case when ${popupImpressions.action} = 'converted' then 1 else 0 end), 0)::int`,
    })
    .from(popupImpressions)
    .where(whereClause);

  const totalImpressions = Number(result?.totalImpressions ?? 0);
  const totalShown = Number(result?.totalShown ?? 0);
  const totalDismissed = Number(result?.totalDismissed ?? 0);
  const totalEngaged = Number(result?.totalEngaged ?? 0);
  const totalConverted = Number(result?.totalConverted ?? 0);

  return {
    totalImpressions,
    totalShown,
    totalDismissed,
    totalEngaged,
    totalConverted,
    engagementRate: totalShown > 0 ? totalEngaged / totalShown : 0,
    conversionRate: totalShown > 0 ? totalConverted / totalShown : 0,
    dismissRate: totalShown > 0 ? totalDismissed / totalShown : 0,
  };
}

export async function getCampaignsByUser(userId: string) {
  return db
    .select({
      id: popupCampaigns.id,
      funnelId: popupCampaigns.funnelId,
      userId: popupCampaigns.userId,
      name: popupCampaigns.name,
      status: popupCampaigns.status,
      displayMode: popupCampaigns.displayMode,
      position: popupCampaigns.position,
      triggers: popupCampaigns.triggers,
      targeting: popupCampaigns.targeting,
      suppression: popupCampaigns.suppression,
      styleOverrides: popupCampaigns.styleOverrides,
      priority: popupCampaigns.priority,
      createdAt: popupCampaigns.createdAt,
      updatedAt: popupCampaigns.updatedAt,
      funnelName: funnels.slug,
      funnelSlug: funnels.slug,
    })
    .from(popupCampaigns)
    .leftJoin(funnels, eq(popupCampaigns.funnelId, funnels.id))
    .where(eq(popupCampaigns.userId, userId))
    .orderBy(desc(popupCampaigns.createdAt));
}

export async function getCampaignsByFunnel(funnelId: string) {
  return db
    .select()
    .from(popupCampaigns)
    .where(eq(popupCampaigns.funnelId, funnelId))
    .orderBy(desc(popupCampaigns.createdAt));
}

export async function getPopupImpressionTimeSeries(campaignId: string, timeRange = "30d") {
  const cutoff = getDateCutoff(timeRange);
  const whereClause = cutoff
    ? and(eq(popupImpressions.campaignId, campaignId), gte(popupImpressions.createdAt, cutoff))
    : eq(popupImpressions.campaignId, campaignId);

  return db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${popupImpressions.createdAt}), 'YYYY-MM-DD')`,
      impressions: sql<number>`coalesce(sum(case when ${popupImpressions.action} = 'shown' then 1 else 0 end), 0)::int`,
      conversions: sql<number>`coalesce(sum(case when ${popupImpressions.action} = 'converted' then 1 else 0 end), 0)::int`,
    })
    .from(popupImpressions)
    .where(whereClause)
    .groupBy(sql`date_trunc('day', ${popupImpressions.createdAt})`)
    .orderBy(sql`date_trunc('day', ${popupImpressions.createdAt})`);
}

export async function getTriggerPerformance(campaignId: string, timeRange = "all") {
  const cutoff = getDateCutoff(timeRange);
  const baseConditions = [
    eq(popupImpressions.campaignId, campaignId),
    sql`${popupImpressions.triggerType} is not null`,
  ];
  if (cutoff) baseConditions.push(gte(popupImpressions.createdAt, cutoff));
  const whereClause = and(...baseConditions);

  const rows = await db
    .select({
      triggerType: popupImpressions.triggerType,
      shown: sql<number>`coalesce(sum(case when ${popupImpressions.action} = 'shown' then 1 else 0 end), 0)::int`,
      converted: sql<number>`coalesce(sum(case when ${popupImpressions.action} = 'converted' then 1 else 0 end), 0)::int`,
    })
    .from(popupImpressions)
    .where(whereClause)
    .groupBy(popupImpressions.triggerType);

  return rows.map((row) => {
    const shown = Number(row.shown);
    const converted = Number(row.converted);
    return {
      triggerType: row.triggerType ?? "unknown",
      shown,
      converted,
      conversionRate: shown > 0 ? converted / shown : 0,
    };
  });
}

export async function getUserPopupUsage(userId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [campaignResult, impressionResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(popupCampaigns)
      .where(and(eq(popupCampaigns.userId, userId), eq(popupCampaigns.status, "active"))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(popupImpressions)
      .innerJoin(popupCampaigns, eq(popupImpressions.campaignId, popupCampaigns.id))
      .where(
        and(
          eq(popupCampaigns.userId, userId),
          gte(popupImpressions.createdAt, monthStart)
        )
      ),
  ]);

  return {
    activeCampaigns: Number(campaignResult[0]?.count ?? 0),
    impressionsThisMonth: Number(impressionResult[0]?.count ?? 0),
  };
}
