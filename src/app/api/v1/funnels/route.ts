import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { funnels, leads } from "@/db/schema";
import { eq, and, sql, isNull, inArray } from "drizzle-orm";
import { apiKeyAuth } from "@/lib/api-key";
import { checkRateLimit, v1FunnelsLimiter } from "@/lib/rate-limit";
import { getUserTeamIds } from "@/lib/team-access";
import { logger } from "@/lib/logger";
import type { FunnelConfig } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const authResult = await apiKeyAuth(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!authResult.scopes.includes("read")) {
      return NextResponse.json({ error: "Insufficient scope: read required" }, { status: 403 });
    }

    // Rate limit per API key user: 30/minute
    const rateLimitResult = await checkRateLimit(v1FunnelsLimiter, `v1-funnels:${authResult.userId}`, 30);
    if (rateLimitResult.limited) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Get funnels accessible by this user
    // Personal funnels + team funnels they belong to
    const teamIds = await getUserTeamIds(authResult.userId);

    const conditions = [];

    // Personal funnels
    conditions.push(
      and(eq(funnels.userId, authResult.userId), isNull(funnels.teamId))
    );

    // Team funnels
    if (teamIds.length > 0) {
      conditions.push(inArray(funnels.teamId, teamIds));
    }

    const whereClause =
      conditions.length === 1 ? conditions[0] : sql`(${conditions[0]}) OR (${conditions[1]})`;

    const userFunnels = await db
      .select({
        id: funnels.id,
        slug: funnels.slug,
        published: funnels.published,
        publishedAt: funnels.publishedAt,
        createdAt: funnels.createdAt,
        updatedAt: funnels.updatedAt,
        config: funnels.config,
        teamId: funnels.teamId,
      })
      .from(funnels)
      .where(whereClause);

    // Get lead counts per funnel
    const funnelIds = userFunnels.map((f) => f.id);
    let leadCounts: Record<string, number> = {};
    if (funnelIds.length > 0) {
      const counts = await db
        .select({
          funnelId: leads.funnelId,
          count: sql<number>`count(*)::int`,
        })
        .from(leads)
        .where(inArray(leads.funnelId, funnelIds))
        .groupBy(leads.funnelId);

      leadCounts = Object.fromEntries(
        counts.map((c) => [c.funnelId, Number(c.count)])
      );
    }

    const result = userFunnels.map((f) => {
      const config = f.config as FunnelConfig;
      return {
        id: f.id,
        slug: f.slug,
        name: config?.brand?.name ?? "",
        published: f.published,
        publishedAt: f.publishedAt,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
        teamId: f.teamId,
        leadCount: leadCounts[f.id] ?? 0,
      };
    });

    return NextResponse.json({ funnels: result });
  } catch (error) {
    logger.error("GET /api/v1/funnels error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
