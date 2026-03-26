import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, funnels, leads, funnelSessions, events } from "@/db/schema";
import { sql, desc } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { isSuperAdmin } from "@/lib/admin";
import { apiLimiter, checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResult = await checkRateLimit(apiLimiter, userId);
    if (rateLimitResult.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const isAdmin = await isSuperAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalUsersResult,
      totalFunnelsResult,
      totalSessionsResult,
      totalEventsResult,
      totalLeadsResult,
      eventTypesResult,
      sessionsWithoutEventsResult,
      sessionsWithDeviceTypeResult,
      recentSessionsResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      db.select({ count: sql<number>`count(*)::int` }).from(funnels),
      db.select({ count: sql<number>`count(*)::int` }).from(funnelSessions),
      db.select({ count: sql<number>`count(*)::int` }).from(events),
      db.select({ count: sql<number>`count(*)::int` }).from(leads),
      db
        .select({
          eventType: events.eventType,
          count: sql<number>`count(*)::int`,
        })
        .from(events)
        .groupBy(events.eventType),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(funnelSessions)
        .where(
          sql`${funnelSessions.id} NOT IN (SELECT DISTINCT ${events.sessionId} FROM ${events})`
        ),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(funnelSessions)
        .where(sql`${funnelSessions.deviceType} IS NOT NULL`),
      db
        .select({
          id: funnelSessions.id,
          funnelId: funnelSessions.funnelId,
          startedAt: funnelSessions.startedAt,
          deviceType: funnelSessions.deviceType,
          completed: funnelSessions.completed,
        })
        .from(funnelSessions)
        .orderBy(desc(funnelSessions.startedAt))
        .limit(10),
    ]);

    // Build event types map
    const eventTypes: Record<string, number> = {};
    for (const row of eventTypesResult) {
      eventTypes[row.eventType] = row.count;
    }

    // Get funnel slugs for recent sessions
    const recentSessionFunnelIds = [
      ...new Set(recentSessionsResult.map((s) => s.funnelId)),
    ];
    const funnelSlugMap: Record<string, string> = {};
    if (recentSessionFunnelIds.length > 0) {
      const funnelRows = await db
        .select({ id: funnels.id, slug: funnels.slug })
        .from(funnels)
        .where(
          sql`${funnels.id} IN ${recentSessionFunnelIds}`
        );
      for (const row of funnelRows) {
        funnelSlugMap[row.id] = row.slug;
      }
    }

    // Count events per recent session
    const recentSessionIds = recentSessionsResult.map((s) => s.id);
    const eventCountMap: Record<string, number> = {};
    if (recentSessionIds.length > 0) {
      const eventCounts = await db
        .select({
          sessionId: events.sessionId,
          count: sql<number>`count(*)::int`,
        })
        .from(events)
        .where(sql`${events.sessionId} IN ${recentSessionIds}`)
        .groupBy(events.sessionId);
      for (const row of eventCounts) {
        eventCountMap[row.sessionId] = row.count;
      }
    }

    const recentSessions = recentSessionsResult.map((s) => ({
      id: s.id,
      funnelSlug: funnelSlugMap[s.funnelId] || s.funnelId,
      startedAt: s.startedAt.toISOString(),
      deviceType: s.deviceType || null,
      completed: s.completed,
      events: eventCountMap[s.id] || 0,
    }));

    const totalSessions = Number(totalSessionsResult[0]?.count ?? 0);
    const sessionsWithoutEvents = Number(
      sessionsWithoutEventsResult[0]?.count ?? 0
    );

    return NextResponse.json({
      database: "connected",
      totalUsers: Number(totalUsersResult[0]?.count ?? 0),
      totalFunnels: Number(totalFunnelsResult[0]?.count ?? 0),
      totalSessions,
      totalEvents: Number(totalEventsResult[0]?.count ?? 0),
      totalLeads: Number(totalLeadsResult[0]?.count ?? 0),
      eventTypes,
      sessionsWithoutEvents,
      sessionsWithDeviceType: Number(
        sessionsWithDeviceTypeResult[0]?.count ?? 0
      ),
      trackingHealthPercent:
        totalSessions > 0
          ? Math.round(
              ((totalSessions - sessionsWithoutEvents) / totalSessions) * 100
            )
          : 0,
      recentSessions,
    });
  } catch (error) {
    logger.error("Admin diagnostics error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
