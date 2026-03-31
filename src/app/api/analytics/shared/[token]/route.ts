import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { funnels, leads, teams } from "@/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { getFunnelOverview, getDropoffWaterfall, getTierDistribution, getLeadsTimeSeries, getDeviceBreakdown } from "@/db/queries/analytics";
import { logger } from "@/lib/logger";
import { sharedAnalyticsLimiter, checkRateLimit } from "@/lib/rate-limit";
import type { FunnelConfig, TeamBranding } from "@/types";

const VALID_TIME_RANGES = ["7d", "30d", "90d"];

/** Mask email for privacy: "john@example.com" → "j***@example.com" */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***";
  if (local.length <= 1) return `${local}***@${domain}`;
  return `${local.charAt(0)}***@${domain}`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateLimitResult = await checkRateLimit(sharedAnalyticsLimiter, `shared:${ip}`);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        }
      );
    }

    const { token } = await params;

    // Validate token format (must be 64 hex chars from crypto.randomBytes(32))
    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const rawRange = req.nextUrl.searchParams.get("timeRange") ?? "30d";
    const timeRange = VALID_TIME_RANGES.includes(rawRange) ? rawRange : "30d";

    const [funnel] = await db.select()
      .from(funnels)
      .where(eq(funnels.shareToken, token));

    if (!funnel) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check share token expiry
    if (funnel.shareTokenExpiresAt && new Date() > new Date(funnel.shareTokenExpiresAt)) {
      return NextResponse.json({ error: "Share link has expired" }, { status: 410 });
    }

    const config = funnel.config as FunnelConfig;

    // Fetch team branding if the funnel belongs to a team
    let teamBranding: {
      logoUrl: string | null;
      appName: string | null;
      primaryColor: string | null;
    } = { logoUrl: null, appName: null, primaryColor: null };

    if (funnel.teamId) {
      const [team] = await db
        .select({ branding: teams.branding })
        .from(teams)
        .where(eq(teams.id, funnel.teamId));

      if (team?.branding) {
        const branding = team.branding as TeamBranding;
        teamBranding = {
          logoUrl: branding.logoUrl ?? null,
          appName: branding.appName ?? null,
          primaryColor: branding.primaryColor ?? null,
        };
      }
    }

    function getDateCutoff(range: string): Date | null {
      const now = new Date();
      switch (range) {
        case '7d': now.setDate(now.getDate() - 7); return now;
        case '30d': now.setDate(now.getDate() - 30); return now;
        case '90d': now.setDate(now.getDate() - 90); return now;
        default: return null;
      }
    }

    const cutoff = getDateCutoff(timeRange);
    const leadWhere = cutoff
      ? and(eq(leads.funnelId, funnel.id), gte(leads.createdAt, cutoff))
      : eq(leads.funnelId, funnel.id);

    const [stats, dropoff, tiers, timeSeries, devices, recentLeads] = await Promise.all([
      getFunnelOverview(funnel.id, timeRange),
      getDropoffWaterfall(funnel.id, timeRange, config),
      getTierDistribution(funnel.id, timeRange),
      getLeadsTimeSeries(funnel.id, timeRange),
      getDeviceBreakdown(funnel.id, timeRange),
      db.select({
        id: leads.id,
        email: leads.email,
        score: leads.score,
        calendarTier: leads.calendarTier,
        createdAt: leads.createdAt,
      })
        .from(leads)
        .where(leadWhere)
        .orderBy(desc(leads.createdAt))
        .limit(20),
    ]);

    return NextResponse.json({
      funnelName: config.brand?.name ?? "Funnel",
      brandLogoUrl: config.brand?.logoUrl ?? null,
      brandColor: config.brand?.primaryColor ?? "#2D6A4F",
      teamBranding,
      stats,
      dropoff,
      tiers,
      timeSeries,
      devices,
      recentLeads: recentLeads.map((l) => ({
        id: l.id,
        email: maskEmail(l.email),
        score: l.score,
        calendarTier: l.calendarTier,
        createdAt: l.createdAt,
      })),
    });
  } catch (error) {
    logger.error("GET /api/analytics/shared error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
