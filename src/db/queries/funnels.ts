import { db } from '@/db';
import { funnels, funnelSessions, leads, clients } from '@/db/schema';
import { eq, and, sql, inArray, isNull, or } from 'drizzle-orm';
import type { NewFunnel } from '@/db/schema';

export async function getFunnelsByUser(userId: string, teamId?: string | null) {
  if (teamId) {
    const rows = await db
      .select({
        funnel: funnels,
        clientName: clients.name,
      })
      .from(funnels)
      .leftJoin(clients, eq(funnels.clientId, clients.id))
      .where(eq(funnels.teamId, teamId));
    return rows.map(r => ({ ...r.funnel, clientName: r.clientName }));
  }
  const rows = await db
    .select({
      funnel: funnels,
      clientName: clients.name,
    })
    .from(funnels)
    .leftJoin(clients, eq(funnels.clientId, clients.id))
    .where(and(eq(funnels.userId, userId), isNull(funnels.teamId)));
  return rows.map(r => ({ ...r.funnel, clientName: r.clientName }));
}

export async function getFunnelById(id: string, userId?: string, teamIds?: string[]) {
  if (userId && teamIds && teamIds.length > 0) {
    const result = await db.select().from(funnels)
      .where(and(
        eq(funnels.id, id),
        or(eq(funnels.userId, userId), inArray(funnels.teamId, teamIds))
      ));
    return result[0] ?? null;
  }
  if (userId) {
    const result = await db.select().from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));
    return result[0] ?? null;
  }
  const result = await db.select().from(funnels).where(eq(funnels.id, id));
  return result[0] ?? null;
}

export async function getFunnelBySlug(slug: string) {
  const result = await db.select().from(funnels)
    .where(and(eq(funnels.slug, slug), eq(funnels.published, true)));
  return result[0] ?? null;
}

export async function getFunnelByIdForPreview(id: string) {
  const result = await db.select().from(funnels).where(eq(funnels.id, id));
  return result[0] ?? null;
}

export async function getFunnelByCustomDomain(domain: string) {
  const result = await db.select().from(funnels)
    .where(and(eq(funnels.customDomain, domain), eq(funnels.published, true)));
  return result[0] ?? null;
}

export async function createFunnel(data: NewFunnel) {
  const result = await db.insert(funnels).values(data).returning();
  return result[0];
}

export async function updateFunnelConfig(id: string, userId: string, config: unknown) {
  const result = await db.update(funnels)
    .set({ config, updatedAt: new Date() })
    .where(and(eq(funnels.id, id), eq(funnels.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function updateFunnel(id: string, userId: string, data: Partial<typeof funnels.$inferInsert>) {
  const result = await db.update(funnels)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(funnels.id, id), eq(funnels.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function publishFunnel(id: string, userId: string) {
  const result = await db.update(funnels)
    .set({ published: true, publishedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(funnels.id, id), eq(funnels.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function unpublishFunnel(id: string, userId: string) {
  const result = await db.update(funnels)
    .set({ published: false, updatedAt: new Date() })
    .where(and(eq(funnels.id, id), eq(funnels.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteFunnel(id: string, userId: string) {
  await db.delete(funnels).where(and(eq(funnels.id, id), eq(funnels.userId, userId)));
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const result = await db.select({ id: funnels.id }).from(funnels).where(eq(funnels.slug, slug));
  return result.length === 0;
}

export async function getFunnelCount(userId: string, teamId?: string | null): Promise<number> {
  if (teamId) {
    const result = await db.select({ count: sql<number>`count(*)::int` })
      .from(funnels).where(eq(funnels.teamId, teamId));
    return Number(result[0]?.count ?? 0);
  }
  const result = await db.select({ count: sql<number>`count(*)::int` })
    .from(funnels).where(and(eq(funnels.userId, userId), isNull(funnels.teamId)));
  return Number(result[0]?.count ?? 0);
}

export async function getFunnelsWithStats(userId: string, teamId?: string | null) {
  const userFunnels = await getFunnelsByUser(userId, teamId);
  if (userFunnels.length === 0) return [];

  const funnelIds = userFunnels.map(f => f.id);

  // Batch: get all session stats for all funnels in ONE query
  const sessionStats = await db.select({
    funnelId: funnelSessions.funnelId,
    total: sql<number>`count(*)::int`,
    completed: sql<number>`coalesce(sum(case when ${funnelSessions.completed} then 1 else 0 end), 0)::int`,
    converted: sql<number>`coalesce(sum(case when ${funnelSessions.converted} then 1 else 0 end), 0)::int`,
  }).from(funnelSessions)
    .where(inArray(funnelSessions.funnelId, funnelIds))
    .groupBy(funnelSessions.funnelId);

  // Batch: get lead counts for all funnels in ONE query
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const leadStats = await db.select({
    funnelId: leads.funnelId,
    total: sql<number>`count(*)::int`,
    thisWeek: sql<number>`coalesce(sum(case when ${leads.createdAt} >= ${weekAgo} then 1 else 0 end), 0)::int`,
    thisMonth: sql<number>`coalesce(sum(case when ${leads.createdAt} >= ${monthAgo} then 1 else 0 end), 0)::int`,
  }).from(leads)
    .where(inArray(leads.funnelId, funnelIds))
    .groupBy(leads.funnelId);

  // Batch: get tier breakdown for all funnels in ONE query
  const tierStats = await db.select({
    funnelId: leads.funnelId,
    tier: leads.calendarTier,
    count: sql<number>`count(*)::int`,
  }).from(leads)
    .where(inArray(leads.funnelId, funnelIds))
    .groupBy(leads.funnelId, leads.calendarTier);

  // Map results to funnels
  const sessionMap = new Map(sessionStats.map(s => [s.funnelId, s]));
  const leadMap = new Map(leadStats.map(l => [l.funnelId, l]));
  const tierMap = new Map<string, Record<string, number>>();
  for (const t of tierStats) {
    if (!tierMap.has(t.funnelId)) tierMap.set(t.funnelId, { high: 0, mid: 0, low: 0 });
    const entry = tierMap.get(t.funnelId)!;
    if (t.tier) entry[t.tier] = Number(t.count);
  }

  return userFunnels.map(f => {
    const s = sessionMap.get(f.id);
    const l = leadMap.get(f.id);
    const t = tierMap.get(f.id) || { high: 0, mid: 0, low: 0 };
    const total = Number(s?.total ?? 0);
    const converted = Number(s?.converted ?? 0);

    return {
      ...f,
      stats: {
        totalSessions: total,
        completionRate: total > 0 ? Math.round((Number(s?.completed ?? 0) / total) * 100) : 0,
        conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
        leadsThisWeek: Number(l?.thisWeek ?? 0),
        leadsThisMonth: Number(l?.thisMonth ?? 0),
        tierBreakdown: t,
      },
    };
  });
}
