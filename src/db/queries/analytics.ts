import { db } from "@/db";
import { events, funnelSessions, leads, funnelVariants, variantAssignments } from "@/db/schema";
import { eq, and, gte, sql, avg } from "drizzle-orm";

function getDateCutoff(timeRange: string): Date | null {
  const now = new Date();
  switch (timeRange) {
    case '7d': now.setDate(now.getDate() - 7); return now;
    case '30d': now.setDate(now.getDate() - 30); return now;
    case '90d': now.setDate(now.getDate() - 90); return now;
    default: return null; // 'all' — no cutoff
  }
}

function getStepLabel(index: number, totalQuestions: number, hasVideo: boolean): string {
  if (index === 0) return "Welcome";
  const videoOffset = hasVideo ? 1 : 0;
  if (hasVideo && index === 1) return "Video";
  const qStart = 1 + videoOffset;
  if (index >= qStart && index < qStart + totalQuestions) return `Question ${index - qStart + 1}`;
  if (index === qStart + totalQuestions) return "Email";
  if (index === qStart + totalQuestions + 1) return "Booked";
  return `Step ${index}`;
}

export async function getFunnelOverview(funnelId: string, timeRange = 'all') {
  const cutoff = getDateCutoff(timeRange);
  const sessionWhere = cutoff
    ? and(eq(funnelSessions.funnelId, funnelId), gte(funnelSessions.startedAt, cutoff))
    : eq(funnelSessions.funnelId, funnelId);
  const leadWhere = cutoff
    ? and(eq(leads.funnelId, funnelId), gte(leads.createdAt, cutoff))
    : eq(leads.funnelId, funnelId);

  const [sessionStats, leadStats] = await Promise.all([
    db.select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`coalesce(sum(case when ${funnelSessions.completed} then 1 else 0 end), 0)::int`,
      converted: sql<number>`coalesce(sum(case when ${funnelSessions.converted} then 1 else 0 end), 0)::int`,
      avgDuration: avg(funnelSessions.totalDurationMs),
    }).from(funnelSessions).where(sessionWhere),
    db.select({ count: sql<number>`count(*)::int` }).from(leads).where(leadWhere),
  ]);

  const s = sessionStats[0];
  const total = Number(s?.total ?? 0);
  const completed = Number(s?.completed ?? 0);
  const converted = Number(s?.converted ?? 0);

  return {
    totalSessions: total,
    totalLeads: Number(leadStats[0]?.count ?? 0),
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
    avgCompletionTimeSec: s?.avgDuration ? Math.round(Number(s.avgDuration) / 1000) : 0,
  };
}

export async function getDropoffWaterfall(funnelId: string, timeRange = 'all', totalQuestions = 3, hasVideo = false) {
  const cutoff = getDateCutoff(timeRange);
  const whereClause = cutoff
    ? and(eq(events.funnelId, funnelId), eq(events.eventType, "page_viewed"), gte(events.createdAt, cutoff))
    : and(eq(events.funnelId, funnelId), eq(events.eventType, "page_viewed"));

  const result = await db.select({
    stepIndex: events.stepIndex,
    uniqueSessions: sql<number>`count(distinct ${events.sessionId})::int`,
  }).from(events)
    .where(whereClause)
    .groupBy(events.stepIndex)
    .orderBy(events.stepIndex);

  const topOfFunnel = Number(result[0]?.uniqueSessions ?? 1);

  return result.map((row, i) => {
    const visitors = Number(row.uniqueSessions);
    const prev = result[i - 1];
    const prevVisitors = prev ? Number(prev.uniqueSessions) : visitors;
    return {
      stepIndex: row.stepIndex,
      stepLabel: getStepLabel(row.stepIndex, totalQuestions, hasVideo),
      visitors,
      dropoffFromPrev: prevVisitors > 0 ? Math.round((1 - visitors / prevVisitors) * 100) : 0,
      retentionFromTop: topOfFunnel > 0 ? Math.round((visitors / topOfFunnel) * 100) : 0,
    };
  });
}

export async function getAnswerDistribution(funnelId: string, timeRange = 'all') {
  const cutoff = getDateCutoff(timeRange);
  const whereClause = cutoff
    ? and(eq(events.funnelId, funnelId), eq(events.eventType, "answer_selected"), sql`${events.questionKey} is not null`, gte(events.createdAt, cutoff))
    : and(eq(events.funnelId, funnelId), eq(events.eventType, "answer_selected"), sql`${events.questionKey} is not null`);

  const result = await db.select({
    questionKey: events.questionKey,
    answerId: events.answerId,
    answerLabel: events.answerLabel,
    count: sql<number>`count(*)::int`,
  }).from(events)
    .where(whereClause)
    .groupBy(events.questionKey, events.answerId, events.answerLabel)
    .orderBy(events.questionKey);

  const grouped: Record<string, Array<{ answerId: string | null; answerLabel: string | null; count: number }>> = {};
  for (const row of result) {
    const key = row.questionKey ?? "unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ answerId: row.answerId, answerLabel: row.answerLabel, count: Number(row.count) });
  }
  return grouped;
}

export async function getAbandonHeatmap(funnelId: string, timeRange = 'all', totalQuestions = 3, hasVideo = false) {
  const cutoff = getDateCutoff(timeRange);
  const whereClause = cutoff
    ? and(eq(funnelSessions.funnelId, funnelId), sql`${funnelSessions.abandonedAtStep} is not null`, gte(funnelSessions.startedAt, cutoff))
    : and(eq(funnelSessions.funnelId, funnelId), sql`${funnelSessions.abandonedAtStep} is not null`);

  const result = await db.select({
    stepIndex: funnelSessions.abandonedAtStep,
    count: sql<number>`count(*)::int`,
  }).from(funnelSessions)
    .where(whereClause)
    .groupBy(funnelSessions.abandonedAtStep)
    .orderBy(funnelSessions.abandonedAtStep);

  return result.map((r) => ({
    stepIndex: r.stepIndex ?? 0,
    stepLabel: getStepLabel(r.stepIndex ?? 0, totalQuestions, hasVideo),
    abandonCount: Number(r.count),
  }));
}

export async function getDeviceBreakdown(funnelId: string, timeRange = 'all') {
  const cutoff = getDateCutoff(timeRange);
  const whereClause = cutoff
    ? and(eq(funnelSessions.funnelId, funnelId), gte(funnelSessions.startedAt, cutoff))
    : eq(funnelSessions.funnelId, funnelId);

  return db.select({
    deviceType: funnelSessions.deviceType,
    count: sql<number>`count(*)::int`,
  }).from(funnelSessions)
    .where(whereClause)
    .groupBy(funnelSessions.deviceType);
}

export async function getUTMBreakdown(funnelId: string, timeRange = 'all') {
  const cutoff = getDateCutoff(timeRange);
  const baseConditions = [eq(leads.funnelId, funnelId), sql`${leads.utmSource} is not null`];
  if (cutoff) baseConditions.push(gte(leads.createdAt, cutoff));
  const whereClause = and(...baseConditions);

  return db.select({
    utmSource: leads.utmSource,
    count: sql<number>`count(*)::int`,
  }).from(leads)
    .where(whereClause)
    .groupBy(leads.utmSource)
    .orderBy(sql`count(*) desc`)
    .limit(10);
}

export async function getTierDistribution(funnelId: string, timeRange = 'all') {
  const cutoff = getDateCutoff(timeRange);
  const whereClause = cutoff
    ? and(eq(leads.funnelId, funnelId), gte(leads.createdAt, cutoff))
    : eq(leads.funnelId, funnelId);

  return db.select({
    tier: leads.calendarTier,
    count: sql<number>`count(*)::int`,
  }).from(leads)
    .where(whereClause)
    .groupBy(leads.calendarTier);
}

export async function getLeadsTimeSeries(funnelId: string, timeRange = '30d') {
  const cutoff = getDateCutoff(timeRange);
  const whereClause = cutoff
    ? and(eq(leads.funnelId, funnelId), gte(leads.createdAt, cutoff))
    : eq(leads.funnelId, funnelId);

  return db.select({
    date: sql<string>`to_char(date_trunc('day', ${leads.createdAt}), 'YYYY-MM-DD')`,
    count: sql<number>`count(*)::int`,
  }).from(leads)
    .where(whereClause)
    .groupBy(sql`date_trunc('day', ${leads.createdAt})`)
    .orderBy(sql`date_trunc('day', ${leads.createdAt})`);
}

export async function getLeadCount(funnelId: string, timeRange = 'all') {
  const cutoff = getDateCutoff(timeRange);
  const whereClause = cutoff
    ? and(eq(leads.funnelId, funnelId), gte(leads.createdAt, cutoff))
    : eq(leads.funnelId, funnelId);
  const result = await db.select({ count: sql<number>`count(*)::int` })
    .from(leads).where(whereClause);
  return Number(result[0]?.count ?? 0);
}

export async function getLeadsForTable(funnelId: string, limit = 25, offset = 0, timeRange = 'all') {
  const cutoff = getDateCutoff(timeRange);
  const whereClause = cutoff
    ? and(eq(leads.funnelId, funnelId), gte(leads.createdAt, cutoff))
    : eq(leads.funnelId, funnelId);
  return db.select().from(leads)
    .where(whereClause)
    .orderBy(sql`${leads.createdAt} desc`)
    .limit(limit)
    .offset(offset);
}

export async function getVariantPerformance(funnelId: string, timeRange = 'all') {
  const cutoff = getDateCutoff(timeRange);

  // Get all active variants for this funnel
  const variants = await db.select().from(funnelVariants)
    .where(and(eq(funnelVariants.funnelId, funnelId), eq(funnelVariants.active, true)));

  if (variants.length === 0) return [];

  const results = await Promise.all(variants.map(async (variant) => {
    // Get sessions assigned to this variant
    const assignmentConditions = [
      eq(variantAssignments.variantId, variant.id),
      eq(variantAssignments.funnelId, funnelId),
    ];
    if (cutoff) {
      assignmentConditions.push(gte(variantAssignments.createdAt, cutoff));
    }

    const sessionIds = await db.select({ sessionId: variantAssignments.sessionId })
      .from(variantAssignments)
      .where(and(...assignmentConditions));

    if (sessionIds.length === 0) {
      return {
        variantId: variant.id,
        variantName: variant.name,
        isControl: variant.isControl,
        trafficWeight: variant.trafficWeight,
        sessions: 0,
        completions: 0,
        conversions: 0,
        completionRate: 0,
        conversionRate: 0,
        avgScore: 0,
      };
    }

    const ids = sessionIds.map(s => s.sessionId);

    const [sessionStats] = await db.select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`coalesce(sum(case when ${funnelSessions.completed} then 1 else 0 end), 0)::int`,
      converted: sql<number>`coalesce(sum(case when ${funnelSessions.converted} then 1 else 0 end), 0)::int`,
    }).from(funnelSessions)
      .where(sql`${funnelSessions.id} in (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`);

    const [scoreStats] = await db.select({
      avgScore: avg(leads.score),
    }).from(leads)
      .where(sql`${leads.sessionId} in (${sql.join(ids.map(id => sql`${id}`), sql`, `)})`);

    const total = Number(sessionStats?.total ?? 0);
    const completed = Number(sessionStats?.completed ?? 0);
    const converted = Number(sessionStats?.converted ?? 0);

    return {
      variantId: variant.id,
      variantName: variant.name,
      isControl: variant.isControl,
      trafficWeight: variant.trafficWeight,
      sessions: total,
      completions: completed,
      conversions: converted,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
      avgScore: scoreStats?.avgScore ? Math.round(Number(scoreStats.avgScore)) : 0,
    };
  }));

  return results;
}

export async function getFullAnalytics(funnelId: string, leadsPage = 0, timeRange = 'all') {
  const leadsLimit = 25;
  const leadsOffset = leadsPage * leadsLimit;
  const [stats, dropoff, answers, abandons, devices, utmSources, tiers, timeSeries, recentLeads, totalLeadCount, variantPerformance] = await Promise.all([
    getFunnelOverview(funnelId, timeRange),
    getDropoffWaterfall(funnelId, timeRange),
    getAnswerDistribution(funnelId, timeRange),
    getAbandonHeatmap(funnelId, timeRange),
    getDeviceBreakdown(funnelId, timeRange),
    getUTMBreakdown(funnelId, timeRange),
    getTierDistribution(funnelId, timeRange),
    getLeadsTimeSeries(funnelId, timeRange),
    getLeadsForTable(funnelId, leadsLimit, leadsOffset, timeRange),
    getLeadCount(funnelId, timeRange),
    getVariantPerformance(funnelId, timeRange),
  ]);
  return { stats, dropoff, answers, abandons, devices, utmSources, tiers, timeSeries, recentLeads, totalLeadCount, variantPerformance };
}
