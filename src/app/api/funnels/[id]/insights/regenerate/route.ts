import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { isSuperAdmin } from '@/lib/admin';
import { getPlanLimits } from '@/lib/plan-limits';
import { requireFunnelAccess } from '@/lib/team-access';
import { hashFunnelConfig } from '@/lib/insights/config-hash';
import { generateInsights } from '@/lib/insights/generate';
import { getInsightInputs } from '@/db/queries/insights';
import { saveInsight, getLatestAnyInsight } from '@/db/queries/insights-cache';
import { insightsProLimiter, insightsAgencyLimiter, checkRateLimit } from '@/lib/rate-limit';
import type { FunnelConfig } from '@/types';

const VALID_TIME_RANGES = ['7d', '30d', '90d', 'all'];
const MIN_SESSIONS = 20;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    let funnel;
    try {
      funnel = await requireFunnelAccess(userId, id, 'view');
    } catch (err) {
      const e = err as { status?: number; error?: string };
      return NextResponse.json({ error: e.error || 'Not found' }, { status: e.status || 404 });
    }

    // Plan gate + rate limit
    const isAdmin = await isSuperAdmin(userId);
    let userPlan = 'agency';

    if (!isAdmin) {
      const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
      userPlan = user?.plan ?? 'free';
      const limits = getPlanLimits(userPlan);
      if (!limits.advancedAnalytics) {
        return NextResponse.json(
          { error: 'AI Insights require a Pro plan.', upgrade: true, teaser: true },
          { status: 403 }
        );
      }
    }

    // Rate limit by plan
    const limiter = userPlan === 'agency' || isAdmin ? insightsAgencyLimiter : insightsProLimiter;
    const { limited } = await checkRateLimit(limiter, `insights:${userId}:${id}`);
    if (limited) {
      return NextResponse.json(
        { error: 'Daily insights generation limit reached. Try again tomorrow.' },
        { status: 429 }
      );
    }

    const rawTimeRange = req.nextUrl.searchParams.get('timeRange') ?? '30d';
    const timeRange = VALID_TIME_RANGES.includes(rawTimeRange) ? rawTimeRange : '30d';

    const config = funnel.config as FunnelConfig;
    const configHash = hashFunnelConfig(config, timeRange);

    // Get inputs (includes session count check)
    const inputs = await getInsightInputs(id, timeRange, config);

    if (inputs.overview.sessions < MIN_SESSIONS) {
      return NextResponse.json({
        status: 'insufficient_data',
        requiredSessions: MIN_SESSIONS,
        currentSessions: inputs.overview.sessions,
        message: `AI Insights need at least ${MIN_SESSIONS} sessions to generate meaningful analysis. You have ${inputs.overview.sessions} session${inputs.overview.sessions === 1 ? '' : 's'} in this time range.`,
      });
    }

    try {
      const result = await generateInsights(inputs);

      const saved = await saveInsight({
        funnelId: id,
        configHash,
        timeRange,
        payload: result.payload,
        inputsSnapshot: inputs,
        model: result.model,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        costMillicents: result.costMillicents,
        generationMs: result.generationMs,
        sessionCountAtGeneration: inputs.overview.sessions,
      });

      logger.info('Insights generated successfully', {
        funnelId: id,
        timeRange,
        sessions: inputs.overview.sessions,
        costMillicents: result.costMillicents,
        generationMs: result.generationMs,
      });

      return NextResponse.json({
        status: 'ready',
        insight: result.payload,
        generatedAt: saved.createdAt,
        stale: false,
        fromCache: false,
      });
    } catch (genError) {
      logger.error('Insights generation failed, attempting fallback', {
        funnelId: id,
        error: genError instanceof Error ? genError.message : String(genError),
      });

      // Fallback to latest insight regardless of hash/staleness
      const fallback = await getLatestAnyInsight(id, timeRange);
      if (fallback) {
        return NextResponse.json({
          status: 'ready',
          insight: fallback.payload,
          generatedAt: fallback.createdAt,
          stale: true,
          fromCache: true,
          warning: 'Using previously generated insights. Refresh will retry when the service is available.',
        });
      }

      return NextResponse.json(
        {
          status: 'unavailable',
          message: 'Insights will be ready shortly. Please try again in a few minutes.',
        },
        { status: 503 }
      );
    }
  } catch (error) {
    logger.error('POST /api/funnels/[id]/insights/regenerate error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
