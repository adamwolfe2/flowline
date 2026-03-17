import { db } from "@/db";
import { events, funnelSessions, leads } from "@/db/schema";
import { eq, and, gte, sql, avg } from "drizzle-orm";

const STEP_LABELS: Record<number, string> = {
  0: "Welcome",
  1: "Question 1",
  2: "Question 2",
  3: "Question 3",
  4: "Email",
  5: "Booked",
};

export async function getFunnelOverview(funnelId: string) {
  const [sessionStats, leadStats] = await Promise.all([
    db.select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`coalesce(sum(case when ${funnelSessions.completed} then 1 else 0 end), 0)::int`,
      converted: sql<number>`coalesce(sum(case when ${funnelSessions.converted} then 1 else 0 end), 0)::int`,
      avgDuration: avg(funnelSessions.totalDurationMs),
    }).from(funnelSessions).where(eq(funnelSessions.funnelId, funnelId)),
    db.select({ count: sql<number>`count(*)::int` }).from(leads).where(eq(leads.funnelId, funnelId)),
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

export async function getDropoffWaterfall(funnelId: string) {
  const result = await db.select({
    stepIndex: events.stepIndex,
    uniqueSessions: sql<number>`count(distinct ${events.sessionId})::int`,
  }).from(events)
    .where(and(eq(events.funnelId, funnelId), eq(events.eventType, "page_viewed")))
    .groupBy(events.stepIndex)
    .orderBy(events.stepIndex);

  const topOfFunnel = Number(result[0]?.uniqueSessions ?? 1);

  return result.map((row, i) => {
    const visitors = Number(row.uniqueSessions);
    const prev = result[i - 1];
    const prevVisitors = prev ? Number(prev.uniqueSessions) : visitors;
    return {
      stepIndex: row.stepIndex,
      stepLabel: STEP_LABELS[row.stepIndex] ?? `Step ${row.stepIndex}`,
      visitors,
      dropoffFromPrev: prevVisitors > 0 ? Math.round((1 - visitors / prevVisitors) * 100) : 0,
      retentionFromTop: topOfFunnel > 0 ? Math.round((visitors / topOfFunnel) * 100) : 0,
    };
  });
}

export async function getAnswerDistribution(funnelId: string) {
  const result = await db.select({
    questionKey: events.questionKey,
    answerId: events.answerId,
    answerLabel: events.answerLabel,
    count: sql<number>`count(*)::int`,
  }).from(events)
    .where(and(eq(events.funnelId, funnelId), eq(events.eventType, "answer_selected"), sql`${events.questionKey} is not null`))
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

export async function getAbandonHeatmap(funnelId: string) {
  const result = await db.select({
    stepIndex: funnelSessions.abandonedAtStep,
    count: sql<number>`count(*)::int`,
  }).from(funnelSessions)
    .where(and(eq(funnelSessions.funnelId, funnelId), sql`${funnelSessions.abandonedAtStep} is not null`))
    .groupBy(funnelSessions.abandonedAtStep)
    .orderBy(funnelSessions.abandonedAtStep);

  return result.map((r) => ({
    stepIndex: r.stepIndex ?? 0,
    stepLabel: STEP_LABELS[r.stepIndex ?? 0] ?? `Step ${r.stepIndex}`,
    abandonCount: Number(r.count),
  }));
}

export async function getDeviceBreakdown(funnelId: string) {
  return db.select({
    deviceType: funnelSessions.deviceType,
    count: sql<number>`count(*)::int`,
  }).from(funnelSessions)
    .where(eq(funnelSessions.funnelId, funnelId))
    .groupBy(funnelSessions.deviceType);
}

export async function getUTMBreakdown(funnelId: string) {
  return db.select({
    utmSource: leads.utmSource,
    count: sql<number>`count(*)::int`,
  }).from(leads)
    .where(and(eq(leads.funnelId, funnelId), sql`${leads.utmSource} is not null`))
    .groupBy(leads.utmSource)
    .orderBy(sql`count(*) desc`)
    .limit(10);
}

export async function getTierDistribution(funnelId: string) {
  return db.select({
    tier: leads.calendarTier,
    count: sql<number>`count(*)::int`,
  }).from(leads)
    .where(eq(leads.funnelId, funnelId))
    .groupBy(leads.calendarTier);
}

export async function getLeadsTimeSeries(funnelId: string) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return db.select({
    date: sql<string>`to_char(date_trunc('day', ${leads.createdAt}), 'YYYY-MM-DD')`,
    count: sql<number>`count(*)::int`,
  }).from(leads)
    .where(and(eq(leads.funnelId, funnelId), gte(leads.createdAt, cutoff)))
    .groupBy(sql`date_trunc('day', ${leads.createdAt})`)
    .orderBy(sql`date_trunc('day', ${leads.createdAt})`);
}

export async function getLeadCount(funnelId: string) {
  const result = await db.select({ count: sql<number>`count(*)::int` })
    .from(leads).where(eq(leads.funnelId, funnelId));
  return Number(result[0]?.count ?? 0);
}

export async function getLeadsForTable(funnelId: string, limit = 25, offset = 0) {
  return db.select().from(leads)
    .where(eq(leads.funnelId, funnelId))
    .orderBy(sql`${leads.createdAt} desc`)
    .limit(limit)
    .offset(offset);
}

export async function getFullAnalytics(funnelId: string, leadsPage = 0) {
  const leadsLimit = 25;
  const leadsOffset = leadsPage * leadsLimit;
  const [stats, dropoff, answers, abandons, devices, utmSources, tiers, timeSeries, recentLeads, totalLeadCount] = await Promise.all([
    getFunnelOverview(funnelId),
    getDropoffWaterfall(funnelId),
    getAnswerDistribution(funnelId),
    getAbandonHeatmap(funnelId),
    getDeviceBreakdown(funnelId),
    getUTMBreakdown(funnelId),
    getTierDistribution(funnelId),
    getLeadsTimeSeries(funnelId),
    getLeadsForTable(funnelId, leadsLimit, leadsOffset),
    getLeadCount(funnelId),
  ]);
  return { stats, dropoff, answers, abandons, devices, utmSources, tiers, timeSeries, recentLeads, totalLeadCount };
}
