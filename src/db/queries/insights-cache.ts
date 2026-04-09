import { db } from '@/db';
import { funnelInsights, type FunnelInsight, type NewFunnelInsight } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { InsightPayload } from '@/lib/insights/schema';

export async function getCachedInsight(
  funnelId: string,
  timeRange: string,
  configHash: string
): Promise<FunnelInsight | null> {
  const [row] = await db
    .select()
    .from(funnelInsights)
    .where(
      and(
        eq(funnelInsights.funnelId, funnelId),
        eq(funnelInsights.timeRange, timeRange),
        eq(funnelInsights.configHash, configHash)
      )
    )
    .orderBy(desc(funnelInsights.createdAt))
    .limit(1);

  return row ?? null;
}

export function isCacheFresh(row: FunnelInsight): boolean {
  return row.expiresAt > new Date();
}

export async function getLatestAnyInsight(
  funnelId: string,
  timeRange: string
): Promise<FunnelInsight | null> {
  const [row] = await db
    .select()
    .from(funnelInsights)
    .where(
      and(
        eq(funnelInsights.funnelId, funnelId),
        eq(funnelInsights.timeRange, timeRange)
      )
    )
    .orderBy(desc(funnelInsights.createdAt))
    .limit(1);

  return row ?? null;
}

interface SaveInsightParams {
  funnelId: string;
  configHash: string;
  timeRange: string;
  payload: InsightPayload;
  inputsSnapshot: unknown;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costMillicents: number;
  generationMs: number;
  sessionCountAtGeneration: number;
}

export async function saveInsight(params: SaveInsightParams): Promise<FunnelInsight> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const [row] = await db
    .insert(funnelInsights)
    .values({
      funnelId: params.funnelId,
      configHash: params.configHash,
      timeRange: params.timeRange,
      payload: params.payload,
      inputsSnapshot: params.inputsSnapshot as Record<string, unknown>,
      model: params.model,
      promptTokens: params.promptTokens,
      completionTokens: params.completionTokens,
      costUsd: params.costMillicents,
      generationMs: params.generationMs,
      sessionCountAtGeneration: params.sessionCountAtGeneration,
      expiresAt,
    } satisfies NewFunnelInsight)
    .returning();

  return row;
}
