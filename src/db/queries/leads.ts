import { db } from '@/db';
import { leads } from '@/db/schema';
import { eq, desc, gte, sql, and } from 'drizzle-orm';

export async function insertLead(data: {
  funnelId: string;
  email: string;
  answers: Record<string, string>;
  score: number;
  calendarTier: 'high' | 'mid' | 'low';
}) {
  const result = await db.insert(leads).values(data).returning();
  return result[0];
}

export async function getLeadsByFunnel(funnelId: string) {
  return db.select().from(leads)
    .where(eq(leads.funnelId, funnelId))
    .orderBy(desc(leads.createdAt));
}

export async function getLeadCountByFunnel(funnelId: string) {
  const result = await db.select({ count: sql<number>`count(*)::int` })
    .from(leads).where(eq(leads.funnelId, funnelId));
  return Number(result[0]?.count ?? 0);
}

export async function getTierBreakdown(funnelId: string) {
  return db.select({
    tier: leads.calendarTier,
    count: sql<number>`count(*)::int`,
  }).from(leads)
    .where(eq(leads.funnelId, funnelId))
    .groupBy(leads.calendarTier);
}

export async function getLeadsThisWeek(funnelId: string) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const result = await db.select({ count: sql<number>`count(*)::int` })
    .from(leads)
    .where(and(eq(leads.funnelId, funnelId), gte(leads.createdAt, cutoff)));
  return Number(result[0]?.count ?? 0);
}

export async function getLeadsThisMonth(funnelId: string) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const result = await db.select({ count: sql<number>`count(*)::int` })
    .from(leads)
    .where(and(eq(leads.funnelId, funnelId), gte(leads.createdAt, cutoff)));
  return Number(result[0]?.count ?? 0);
}
