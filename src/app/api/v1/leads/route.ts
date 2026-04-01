import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads, funnels } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { apiKeyAuth } from "@/lib/api-key";
import { checkRateLimit, v1LeadsLimiter } from "@/lib/rate-limit";
import { insertLead } from "@/db/queries/leads";
import { fireWebhook } from "@/lib/webhook";
import { getUserTeamIds } from "@/lib/team-access";
import { logger } from "@/lib/logger";
import type { FunnelConfig } from "@/types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const VALID_TIERS = ["high", "mid", "low"] as const;

export async function GET(req: NextRequest) {
  try {
    const authResult = await apiKeyAuth(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!authResult.scopes.includes("read")) {
      return NextResponse.json({ error: "Insufficient scope: read required" }, { status: 403 });
    }

    // Rate limit per API key user
    const rateLimitResult = await checkRateLimit(v1LeadsLimiter, `v1-leads:${authResult.userId}`, 60);
    if (rateLimitResult.limited) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const funnelId = req.nextUrl.searchParams.get("funnelId");
    if (!funnelId) {
      return NextResponse.json(
        { error: "funnelId query parameter is required" },
        { status: 400 }
      );
    }
    if (!UUID_REGEX.test(funnelId)) {
      return NextResponse.json({ error: "Invalid funnelId format" }, { status: 400 });
    }

    // Verify the API key owner has access to this funnel
    const hasAccess = await verifyFunnelAccess(authResult.userId, authResult.teamId, funnelId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const page = Math.max(0, parseInt(req.nextUrl.searchParams.get("page") || "0") || 0);
    const limit = Math.min(
      Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") || "25") || 25),
      100
    );

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(eq(leads.funnelId, funnelId));

    const rows = await db
      .select()
      .from(leads)
      .where(eq(leads.funnelId, funnelId))
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(page * limit);

    return NextResponse.json({
      leads: rows,
      total: Number(countResult?.count ?? 0),
      page,
      limit,
    });
  } catch (error) {
    logger.error("GET /api/v1/leads error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await apiKeyAuth(req);
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!authResult.scopes.includes("write")) {
      return NextResponse.json({ error: "Insufficient scope: write required" }, { status: 403 });
    }

    // Rate limit per API key user
    const rateLimitResult = await checkRateLimit(v1LeadsLimiter, `v1-leads:${authResult.userId}`, 60);
    if (rateLimitResult.limited) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await req.json();
    const { funnelId, email, answers, score, calendarTier } = body as {
      funnelId?: string;
      email?: string;
      answers?: Record<string, string>;
      score?: number;
      calendarTier?: string;
    };

    // Validate funnelId
    if (!funnelId || typeof funnelId !== "string" || !UUID_REGEX.test(funnelId)) {
      return NextResponse.json(
        { error: "Valid funnelId is required" },
        { status: 400 }
      );
    }

    // Validate email
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Validate score
    const resolvedScore = typeof score === "number" ? score : 0;

    // Validate calendarTier
    const resolvedTier = VALID_TIERS.includes(calendarTier as typeof VALID_TIERS[number])
      ? (calendarTier as "high" | "mid" | "low")
      : "low";

    // Verify the API key owner has access to this funnel
    const hasAccess = await verifyFunnelAccess(authResult.userId, authResult.teamId, funnelId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Create lead
    const lead = await insertLead({
      funnelId,
      email,
      answers: answers ?? {},
      score: resolvedScore,
      calendarTier: resolvedTier,
    });

    // Fire webhook if configured (non-blocking)
    const [funnel] = await db
      .select({ config: funnels.config, slug: funnels.slug })
      .from(funnels)
      .where(eq(funnels.id, funnelId));
    if (funnel) {
      const config = funnel.config as FunnelConfig;
      if (config.webhook?.url) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";
        fireWebhook(
          config.webhook.url,
          {
            email,
            answers: answers ?? {},
            score: resolvedScore,
            calendar_tier: resolvedTier,
            timestamp: new Date().toISOString(),
            source: config.brand?.name ?? "",
            funnel_slug: funnel.slug,
            funnel_url: `${appUrl}/f/${funnel.slug}`,
          },
          funnelId,
          3,
          config.webhook?.format ?? "default"
        ).catch(() => {});
      }
    }

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    logger.error("POST /api/v1/leads error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Verify that a user (via API key) has access to a funnel.
 * Checks personal ownership and team membership.
 */
async function verifyFunnelAccess(
  userId: string,
  teamId: string | null | undefined,
  funnelId: string
): Promise<boolean> {
  const [funnel] = await db
    .select({ userId: funnels.userId, teamId: funnels.teamId })
    .from(funnels)
    .where(eq(funnels.id, funnelId));

  if (!funnel) return false;

  // Personal ownership
  if (funnel.userId === userId) return true;

  // Team access: API key teamId matches funnel teamId
  if (teamId && funnel.teamId === teamId) return true;

  // Team membership check
  if (funnel.teamId) {
    const teamIds = await getUserTeamIds(userId);
    if (teamIds.includes(funnel.teamId)) return true;
  }

  return false;
}
