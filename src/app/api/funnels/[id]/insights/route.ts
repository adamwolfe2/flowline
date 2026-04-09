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
import { getCachedInsight, isCacheFresh } from '@/db/queries/insights-cache';
import type { FunnelConfig } from '@/types';

const VALID_TIME_RANGES = ['7d', '30d', '90d', 'all'];

export async function GET(
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

    // Plan gate
    const isAdmin = await isSuperAdmin(userId);
    if (!isAdmin) {
      const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
      const limits = getPlanLimits(user?.plan ?? 'free');
      if (!limits.advancedAnalytics) {
        return NextResponse.json(
          { error: 'AI Insights require a Pro plan.', upgrade: true, teaser: true },
          { status: 403 }
        );
      }
    }

    const rawTimeRange = req.nextUrl.searchParams.get('timeRange') ?? '30d';
    const timeRange = VALID_TIME_RANGES.includes(rawTimeRange) ? rawTimeRange : '30d';

    const config = funnel.config as FunnelConfig;
    const configHash = hashFunnelConfig(config, timeRange);

    const cached = await getCachedInsight(id, timeRange, configHash);

    if (cached && isCacheFresh(cached)) {
      return NextResponse.json(
        {
          status: 'ready',
          insight: cached.payload,
          generatedAt: cached.createdAt,
          stale: false,
          fromCache: true,
        },
        { headers: { 'Cache-Control': 'private, max-age=300, stale-while-revalidate=600' } }
      );
    }

    // Cache miss or stale — client should trigger regeneration
    return NextResponse.json({
      status: 'needs_generation',
      lastGeneratedAt: cached?.createdAt ?? null,
      staleInsight: cached ? cached.payload : null,
    });
  } catch (error) {
    logger.error('GET /api/funnels/[id]/insights error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
