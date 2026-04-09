import { db } from '@/db';
import { events, funnelSessions, leads } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import type { FunnelConfig } from '@/types';
import {
  getFunnelOverview,
  getDropoffWaterfall,
  getAbandonHeatmap,
  getAnswerDistribution,
  getDeviceBreakdown,
  getTierDistribution,
} from './analytics';

function getDateCutoff(timeRange: string): Date | null {
  const now = new Date();
  switch (timeRange) {
    case '7d': now.setDate(now.getDate() - 7); return now;
    case '30d': now.setDate(now.getDate() - 30); return now;
    case '90d': now.setDate(now.getDate() - 90); return now;
    default: return null;
  }
}

export interface InsightInputs {
  funnelMeta: {
    name: string;
    questionCount: number;
    hasVideo: boolean;
    questionTexts: string[];
    thresholds: { high: number; mid: number } | undefined;
  };
  overview: {
    sessions: number;
    leads: number;
    completionRate: number;
    conversionRate: number;
    avgCompletionSec: number;
  };
  steps: Array<{
    stepIndex: number;
    stepLabel: string;
    visitors: number;
    dropoffFromPrev: number;
    retentionFromTop: number;
    avgTimeMs: number;
    medianTimeMs: number;
    timeRatioVsMedian: number;
  }>;
  answers: Record<string, Array<{ label: string; count: number; percentage: number }>>;
  abandons: Array<{ stepIndex: number; stepLabel: string; count: number }>;
  devices: Array<{ deviceType: string; sessions: number; completionRate: number }>;
  utmSources: Array<{ source: string; sessions: number; conversions: number; conversionRate: number }>;
  tiers: { high: number; mid: number; low: number };
}

async function getUtmSourceConversions(funnelId: string, cutoff: Date | null) {
  const conditions = cutoff
    ? and(eq(funnelSessions.funnelId, funnelId), gte(funnelSessions.startedAt, cutoff))
    : eq(funnelSessions.funnelId, funnelId);

  const rows = await db.select({
    utmSource: funnelSessions.utmSource,
    sessions: sql<number>`count(*)::int`,
    conversions: sql<number>`coalesce(sum(case when ${funnelSessions.converted} then 1 else 0 end), 0)::int`,
  }).from(funnelSessions)
    .where(conditions)
    .groupBy(funnelSessions.utmSource)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  return rows.map(r => ({
    source: r.utmSource ?? '(direct)',
    sessions: Number(r.sessions),
    conversions: Number(r.conversions),
    conversionRate: Number(r.sessions) > 0
      ? Math.round((Number(r.conversions) / Number(r.sessions)) * 100)
      : 0,
  }));
}

async function getDeviceConversionSplit(funnelId: string, cutoff: Date | null) {
  const conditions = cutoff
    ? and(eq(funnelSessions.funnelId, funnelId), gte(funnelSessions.startedAt, cutoff))
    : eq(funnelSessions.funnelId, funnelId);

  const rows = await db.select({
    deviceType: funnelSessions.deviceType,
    sessions: sql<number>`count(*)::int`,
    completions: sql<number>`coalesce(sum(case when ${funnelSessions.completed} then 1 else 0 end), 0)::int`,
  }).from(funnelSessions)
    .where(conditions)
    .groupBy(funnelSessions.deviceType);

  return rows.map(r => ({
    deviceType: r.deviceType ?? 'unknown',
    sessions: Number(r.sessions),
    completionRate: Number(r.sessions) > 0
      ? Math.round((Number(r.completions) / Number(r.sessions)) * 100)
      : 0,
  }));
}

async function getPerStepTimings(funnelId: string, cutoff: Date | null) {
  const whereClause = cutoff
    ? and(
        eq(events.funnelId, funnelId),
        eq(events.eventType, 'page_viewed'),
        sql`${events.timeOnStepMs} is not null`,
        gte(events.createdAt, cutoff)
      )
    : and(
        eq(events.funnelId, funnelId),
        eq(events.eventType, 'page_viewed'),
        sql`${events.timeOnStepMs} is not null`
      );

  const rows = await db.select({
    stepIndex: events.stepIndex,
    avgTimeMs: sql<number>`round(avg(${events.timeOnStepMs}))::int`,
    medianTimeMs: sql<number>`round(percentile_cont(0.5) within group (order by ${events.timeOnStepMs}))::int`,
  }).from(events)
    .where(whereClause)
    .groupBy(events.stepIndex)
    .orderBy(events.stepIndex);

  return rows.map(r => ({
    stepIndex: r.stepIndex,
    avgTimeMs: Number(r.avgTimeMs ?? 0),
    medianTimeMs: Number(r.medianTimeMs ?? 0),
  }));
}

export async function getInsightInputs(
  funnelId: string,
  timeRange: string,
  config: FunnelConfig
): Promise<InsightInputs> {
  const cutoff = getDateCutoff(timeRange);

  const [overview, waterfall, abandonData, answerDist, deviceBreakdown, tierDist, utmSources, deviceConversions, stepTimings] = await Promise.all([
    getFunnelOverview(funnelId, timeRange),
    getDropoffWaterfall(funnelId, timeRange, config),
    getAbandonHeatmap(funnelId, timeRange, config),
    getAnswerDistribution(funnelId, timeRange),
    getDeviceBreakdown(funnelId, timeRange),
    getTierDistribution(funnelId, timeRange),
    getUtmSourceConversions(funnelId, cutoff),
    getDeviceConversionSplit(funnelId, cutoff),
    getPerStepTimings(funnelId, cutoff),
  ]);

  const questions = config.quiz?.questions ?? [];
  const hasVideo = config.quiz?.video?.enabled === true;
  const questionTexts = questions.map(q => q.text);

  // Build timings map by stepIndex
  const timingMap = new Map(stepTimings.map(t => [t.stepIndex, t]));

  // Calculate overall median time for ratio
  const allMedians = stepTimings.map(t => t.medianTimeMs).filter(Boolean);
  const globalMedian = allMedians.length > 0
    ? allMedians.reduce((a, b) => a + b, 0) / allMedians.length
    : 0;

  // Enrich waterfall steps with timing data
  const steps = waterfall.map(step => {
    const timing = timingMap.get(step.stepIndex);
    const avgTimeMs = timing?.avgTimeMs ?? 0;
    const medianTimeMs = timing?.medianTimeMs ?? 0;
    const timeRatioVsMedian = globalMedian > 0 ? Math.round((medianTimeMs / globalMedian) * 100) / 100 : 1;
    return {
      stepIndex: step.stepIndex,
      stepLabel: step.stepLabel,
      visitors: step.visitors,
      dropoffFromPrev: step.dropoffFromPrev,
      retentionFromTop: step.retentionFromTop,
      avgTimeMs,
      medianTimeMs,
      timeRatioVsMedian,
    };
  });

  // Normalize answers to include percentages
  const answers: InsightInputs['answers'] = {};
  for (const [key, opts] of Object.entries(answerDist)) {
    const total = opts.reduce((s, o) => s + o.count, 0) || 1;
    answers[key] = opts.map(o => ({
      label: o.answerLabel ?? o.answerId ?? 'unknown',
      count: o.count,
      percentage: Math.round((o.count / total) * 100),
    }));
  }

  // Normalize device breakdown (use device conversions for richer data)
  const deviceMap = new Map(deviceConversions.map(d => [d.deviceType, d]));
  const devices = (deviceBreakdown as Array<{ deviceType: string | null; count: number }>).map(d => {
    const key = d.deviceType ?? 'unknown';
    const conv = deviceMap.get(key);
    return {
      deviceType: key,
      sessions: d.count,
      completionRate: conv?.completionRate ?? 0,
    };
  });

  // Tier distribution
  const tierMap: Record<string, number> = {};
  for (const t of tierDist as Array<{ tier: string | null; count: number }>) {
    tierMap[t.tier ?? 'unknown'] = Number(t.count);
  }

  return {
    funnelMeta: {
      name: config.brand?.name ?? 'Unknown',
      questionCount: questions.length,
      hasVideo,
      questionTexts,
      thresholds: config.quiz?.thresholds,
    },
    overview: {
      sessions: overview.totalSessions,
      leads: overview.totalLeads,
      completionRate: overview.completionRate,
      conversionRate: overview.conversionRate,
      avgCompletionSec: overview.avgCompletionTimeSec,
    },
    steps,
    answers,
    abandons: abandonData.map(a => ({
      stepIndex: a.stepIndex,
      stepLabel: a.stepLabel,
      count: a.abandonCount,
    })),
    devices,
    utmSources,
    tiers: {
      high: tierMap['high'] ?? 0,
      mid: tierMap['mid'] ?? 0,
      low: tierMap['low'] ?? 0,
    },
  };
}
