import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import {
  getDateCutoff,
  getDeviceBreakdown,
  getDeviceConversion,
  getFunnelOverview,
  getLeadCount,
  getLeadsForTable,
  getLeadsTimeSeries,
  getSourceConversion,
  getTimeToConvertHistogram,
  getUTMBreakdown,
} from "./analytics";

/**
 * Analytics for `funnels.type === 'landing'`.
 *
 * A landing page has no steps, no questions, no score and no calendar tier, so
 * none of the quiz widgets (step waterfall, answer distribution, abandon-by-step,
 * tier breakdown) have anything true to say about one. Rather than feed them
 * quiz-shaped defaults — which is how a landing page ended up with a step
 * labelled "Question 1" — this module answers the questions a landing page
 * actually has: did they see it, did they start the booking form, did they
 * submit, did they book.
 */

/** Same row shape the WaterfallChart already consumes, so the UI is reused. */
export interface LandingStage {
  key: string;
  stepLabel: string;
  visitors: number;
  dropoffFromPrev: number;
  retentionFromTop: number;
}

export interface LandingEngagement {
  stages: LandingStage[];
  videoPlayRate: {
    /** Distinct sessions that started a video block. */
    plays: number;
    /** Distinct sessions that viewed the page (the denominator). */
    views: number;
    /** Percent of viewers who played a video. 0 when there is no traffic. */
    rate: number;
  };
}

/**
 * One pass over `events`, bucketing distinct sessions per stage with FILTER.
 *
 * Distinct-session counts can't be summed across event types, so each stage
 * gets its own FILTER rather than a GROUP BY + merge. Event types that the
 * landing renderer doesn't emit yet simply count 0 — the funnel degrades to
 * "views only" instead of throwing.
 */
export async function getLandingEngagement(
  funnelId: string,
  timeRange = "all"
): Promise<LandingEngagement> {
  const cutoff = getDateCutoff(timeRange);
  const whereClause = cutoff
    ? and(eq(events.funnelId, funnelId), gte(events.createdAt, cutoff))
    : eq(events.funnelId, funnelId);

  const [row] = await db
    .select({
      views: sql<number>`count(distinct ${events.sessionId}) filter (where ${events.eventType} = 'page_viewed')::int`,
      // "Started the booking flow": focused a form field, or clicked the CTA
      // that scrolls to it. Either is a real intent signal; a session that did
      // both is still counted once.
      formStarts: sql<number>`count(distinct ${events.sessionId}) filter (where ${events.eventType} in ('field_focused', 'cta_clicked'))::int`,
      // Client-side submit and the server-side lead insert are the same act;
      // union them so a dropped client beacon doesn't undercount.
      submissions: sql<number>`count(distinct ${events.sessionId}) filter (where ${events.eventType} in ('booking_submitted', 'lead_created'))::int`,
      bookings: sql<number>`count(distinct ${events.sessionId}) filter (where ${events.eventType} = 'funnel_completed')::int`,
      videoPlays: sql<number>`count(distinct ${events.sessionId}) filter (where ${events.eventType} = 'video_played')::int`,
    })
    .from(events)
    .where(whereClause);

  const views = Number(row?.views ?? 0);
  const counts: Array<{ key: string; stepLabel: string; visitors: number }> = [
    { key: "views", stepLabel: "Page views", visitors: views },
    { key: "form_starts", stepLabel: "Booking form starts", visitors: Number(row?.formStarts ?? 0) },
    { key: "submissions", stepLabel: "Submissions", visitors: Number(row?.submissions ?? 0) },
    { key: "bookings", stepLabel: "Bookings", visitors: Number(row?.bookings ?? 0) },
  ];

  const topOfFunnel = counts[0].visitors;
  const stages: LandingStage[] = counts.map((stage, i) => {
    const prevVisitors = i > 0 ? counts[i - 1].visitors : stage.visitors;
    return {
      ...stage,
      dropoffFromPrev:
        prevVisitors > 0 ? Math.max(0, Math.round((1 - stage.visitors / prevVisitors) * 100)) : 0,
      retentionFromTop:
        topOfFunnel > 0 ? Math.min(100, Math.round((stage.visitors / topOfFunnel) * 100)) : 0,
    };
  });

  const videoPlays = Number(row?.videoPlays ?? 0);
  return {
    stages,
    videoPlayRate: {
      plays: videoPlays,
      views,
      rate: views > 0 ? Math.min(100, Math.round((videoPlays / views) * 100)) : 0,
    },
  };
}

/**
 * The landing counterpart to `getFullAnalytics`.
 *
 * Deliberately omits `dropoff`, `answers`, `abandons` and `tiers` — those are
 * quiz-only. The shared widgets (overview, devices, UTM, time series, leads)
 * are type-agnostic and reused as-is.
 */
export async function getLandingFullAnalytics(
  funnelId: string,
  leadsPage = 0,
  timeRange = "all"
) {
  const leadsLimit = 25;
  const leadsOffset = leadsPage * leadsLimit;

  const [
    stats,
    engagement,
    devices,
    utmSources,
    timeSeries,
    recentLeads,
    totalLeadCount,
    sourceConversion,
    deviceConversion,
    timeToConvertHistogram,
  ] = await Promise.all([
    getFunnelOverview(funnelId, timeRange),
    getLandingEngagement(funnelId, timeRange),
    getDeviceBreakdown(funnelId, timeRange),
    getUTMBreakdown(funnelId, timeRange),
    getLeadsTimeSeries(funnelId, timeRange),
    getLeadsForTable(funnelId, leadsLimit, leadsOffset, timeRange),
    getLeadCount(funnelId, timeRange),
    getSourceConversion(funnelId, timeRange),
    getDeviceConversion(funnelId, timeRange),
    // Session-based and type-agnostic — a landing session converts the same way
    // a quiz one does, so the Audience Insights row stays whole.
    getTimeToConvertHistogram(funnelId, timeRange),
  ]);

  return {
    stats,
    landingStages: engagement.stages,
    videoPlayRate: engagement.videoPlayRate,
    devices,
    utmSources,
    timeSeries,
    recentLeads,
    totalLeadCount,
    sourceConversion,
    deviceConversion,
    timeToConvertHistogram,
  };
}
