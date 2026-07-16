import { db } from '@/db';
import { leads } from '@/db/schema';
import { eq, desc, gte, sql, and } from 'drizzle-orm';

export async function insertLead(data: {
  funnelId: string;
  email: string;
  answers: Record<string, string>;
  /** null for landing-page leads — they are not scored. */
  score?: number | null;
  /** null for landing-page leads — they are not tier-routed. */
  calendarTier?: 'high' | 'mid' | 'low' | null;
  sessionId?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}) {
  const result = await db.insert(leads).values({
    funnelId: data.funnelId,
    email: data.email,
    answers: data.answers,
    score: data.score ?? null,
    calendarTier: data.calendarTier ?? null,
    sessionId: data.sessionId ?? null,
    utmSource: data.utmSource ?? null,
    utmMedium: data.utmMedium ?? null,
    utmCampaign: data.utmCampaign ?? null,
  }).returning();
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
