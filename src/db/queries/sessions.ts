import { db } from '@/db';
import { funnelSessions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export function parseDeviceType(userAgent: string): "mobile" | "desktop" | "tablet" {
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|windows phone|opera mini|iemobile/.test(ua)) return "mobile";
  return "desktop";
}

export async function insertSession(
  funnelId: string,
  utm?: { utmSource?: string; utmMedium?: string; utmCampaign?: string },
  deviceType?: "mobile" | "desktop" | "tablet"
) {
  const result = await db.insert(funnelSessions)
    .values({
      funnelId,
      utmSource: utm?.utmSource ?? null,
      utmMedium: utm?.utmMedium ?? null,
      utmCampaign: utm?.utmCampaign ?? null,
      deviceType: deviceType ?? null,
    }).returning();
  return result[0];
}

export async function completeSession(id: string) {
  await db.update(funnelSessions)
    .set({ completed: true }).where(eq(funnelSessions.id, id));
}

export async function convertSession(id: string) {
  await db.update(funnelSessions)
    .set({ converted: true }).where(eq(funnelSessions.id, id));
}

export async function getSessionStats(funnelId: string) {
  const result = await db.select({
    total: sql<number>`count(*)::int`,
    completed: sql<number>`sum(case when ${funnelSessions.completed} then 1 else 0 end)::int`,
    converted: sql<number>`sum(case when ${funnelSessions.converted} then 1 else 0 end)::int`,
  }).from(funnelSessions).where(eq(funnelSessions.funnelId, funnelId));

  const row = result[0];
  const total = Number(row?.total ?? 0);
  const completed = Number(row?.completed ?? 0);
  const converted = Number(row?.converted ?? 0);
  return {
    total,
    completed,
    converted,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
  };
}
