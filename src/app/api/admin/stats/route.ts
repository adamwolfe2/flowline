import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, funnels, leads, funnelSessions, events } from "@/db/schema";
import { sql, gte } from "drizzle-orm";

const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId || !ADMIN_USER_ID || userId !== ADMIN_USER_ID) {
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
      sessionsToday,
      recentUsers,
      topFunnels,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      db.select({ count: sql<number>`count(*)::int` }).from(funnels),
      db.select({ count: sql<number>`count(*)::int` }).from(funnels).where(sql`${funnels.published} = true`),
      db.select({ count: sql<number>`count(*)::int` }).from(leads),
      db.select({ count: sql<number>`count(*)::int` }).from(funnelSessions),
      db.select({ count: sql<number>`count(*)::int` }).from(events),
      db.select({ count: sql<number>`count(*)::int` }).from(leads).where(gte(leads.createdAt, dayAgo)),
      db.select({ count: sql<number>`count(*)::int` }).from(leads).where(gte(leads.createdAt, weekAgo)),
      db.select({ count: sql<number>`count(*)::int` }).from(funnelSessions).where(gte(funnelSessions.startedAt, dayAgo)),
      db.select().from(users).orderBy(sql`${users.createdAt} desc`).limit(10),
      db.select({
        funnelId: leads.funnelId,
        count: sql<number>`count(*)::int`,
      }).from(leads)
        .where(gte(leads.createdAt, monthAgo))
        .groupBy(leads.funnelId)
        .orderBy(sql`count(*) desc`)
        .limit(10),
    ]);

    return NextResponse.json({
      totalUsers: Number(totalUsers[0]?.count ?? 0),
      totalFunnels: Number(totalFunnels[0]?.count ?? 0),
      publishedFunnels: Number(publishedFunnels[0]?.count ?? 0),
      totalLeads: Number(totalLeads[0]?.count ?? 0),
      totalSessions: Number(totalSessions[0]?.count ?? 0),
      totalEvents: Number(totalEvents[0]?.count ?? 0),
      leadsToday: Number(leadsToday[0]?.count ?? 0),
      leadsThisWeek: Number(leadsThisWeek[0]?.count ?? 0),
      sessionsToday: Number(sessionsToday[0]?.count ?? 0),
      recentUsers,
      topFunnels,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
