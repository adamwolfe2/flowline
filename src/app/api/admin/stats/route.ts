import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, funnels, leads, funnelSessions, events, sequenceEnrollments, webhookDeliveries } from "@/db/schema";
import { sql, gte, eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { isSuperAdmin } from "@/lib/admin";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isAdmin = await isSuperAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalFunnels,
      publishedFunnels,
      totalLeads,
      totalSessions,
      totalEvents,
      leadsToday,
      leadsThisWeek,
      leadsThisMonth,
      sessionsToday,
      sessionsThisWeek,
      recentUsers,
      topFunnels,
      planBreakdown,
      usersThisWeek,
      usersThisMonth,
      totalEnrollments,
      totalWebhookDeliveries,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      db.select({ count: sql<number>`count(*)::int` }).from(funnels),
      db.select({ count: sql<number>`count(*)::int` }).from(funnels).where(sql`${funnels.published} = true`),
      db.select({ count: sql<number>`count(*)::int` }).from(leads),
      db.select({ count: sql<number>`count(*)::int` }).from(funnelSessions),
      db.select({ count: sql<number>`count(*)::int` }).from(events),
      db.select({ count: sql<number>`count(*)::int` }).from(leads).where(gte(leads.createdAt, dayAgo)),
      db.select({ count: sql<number>`count(*)::int` }).from(leads).where(gte(leads.createdAt, weekAgo)),
      db.select({ count: sql<number>`count(*)::int` }).from(leads).where(gte(leads.createdAt, monthAgo)),
      db.select({ count: sql<number>`count(*)::int` }).from(funnelSessions).where(gte(funnelSessions.startedAt, dayAgo)),
      db.select({ count: sql<number>`count(*)::int` }).from(funnelSessions).where(gte(funnelSessions.startedAt, weekAgo)),
      db.select().from(users).orderBy(sql`${users.createdAt} desc`).limit(20),
      db.select({
        funnelId: leads.funnelId,
        count: sql<number>`count(*)::int`,
      }).from(leads)
        .where(gte(leads.createdAt, monthAgo))
        .groupBy(leads.funnelId)
        .orderBy(sql`count(*) desc`)
        .limit(10),
      // Plan breakdown
      db.select({
        plan: users.plan,
        count: sql<number>`count(*)::int`,
      }).from(users).groupBy(users.plan),
      // Growth metrics
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, weekAgo)),
      db.select({ count: sql<number>`count(*)::int` }).from(users).where(gte(users.createdAt, monthAgo)),
      // System health
      db.select({ count: sql<number>`count(*)::int` }).from(sequenceEnrollments).where(eq(sequenceEnrollments.status, "active")),
      db.select({ count: sql<number>`count(*)::int` }).from(webhookDeliveries),
    ]);

    // Build plan breakdown map
    const plans: Record<string, number> = { free: 0, pro: 0, agency: 0 };
    for (const row of planBreakdown) {
      if (row.plan) plans[row.plan] = Number(row.count);
    }

    // Conversion rate: sessions -> leads
    const totalSessionsN = Number(totalSessions[0]?.count ?? 0);
    const totalLeadsN = Number(totalLeads[0]?.count ?? 0);
    const conversionRate = totalSessionsN > 0 ? Math.round((totalLeadsN / totalSessionsN) * 100) : 0;

    return NextResponse.json({
      totalUsers: Number(totalUsers[0]?.count ?? 0),
      totalFunnels: Number(totalFunnels[0]?.count ?? 0),
      publishedFunnels: Number(publishedFunnels[0]?.count ?? 0),
      totalLeads: totalLeadsN,
      totalSessions: totalSessionsN,
      totalEvents: Number(totalEvents[0]?.count ?? 0),
      leadsToday: Number(leadsToday[0]?.count ?? 0),
      leadsThisWeek: Number(leadsThisWeek[0]?.count ?? 0),
      leadsThisMonth: Number(leadsThisMonth[0]?.count ?? 0),
      sessionsToday: Number(sessionsToday[0]?.count ?? 0),
      sessionsThisWeek: Number(sessionsThisWeek[0]?.count ?? 0),
      conversionRate,
      planBreakdown: plans,
      usersThisWeek: Number(usersThisWeek[0]?.count ?? 0),
      usersThisMonth: Number(usersThisMonth[0]?.count ?? 0),
      activeEnrollments: Number(totalEnrollments[0]?.count ?? 0),
      totalWebhookDeliveries: Number(totalWebhookDeliveries[0]?.count ?? 0),
      recentUsers,
      topFunnels,
    });
  } catch (error) {
    logger.error("Admin stats error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
