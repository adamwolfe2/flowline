import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { popupCampaigns, funnels, users } from "@/db/schema";
import { eq, and, desc, or, inArray, isNull } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { apiLimiter, checkRateLimit } from "@/lib/rate-limit";
import { getPlanLimits, hasFeature } from "@/lib/plan-limits";
import { isSuperAdmin } from "@/lib/admin";
import { getUserTeamIds, requireFunnelAccess } from "@/lib/team-access";
import { logAuditEvent } from "@/lib/audit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rl = await checkRateLimit(apiLimiter, userId);
    if (rl.limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const workspaceTeamId = req.headers.get("x-workspace-team-id");
    const teamIds = await getUserTeamIds(userId);
    const isValidTeam = workspaceTeamId && teamIds.includes(workspaceTeamId);

    // Build ownership condition: personal campaigns OR campaigns on team funnels
    const ownershipCondition = isValidTeam
      ? eq(funnels.teamId, workspaceTeamId)
      : and(eq(popupCampaigns.userId, userId), isNull(funnels.teamId));

    const campaigns = await db
      .select({
        id: popupCampaigns.id,
        funnelId: popupCampaigns.funnelId,
        userId: popupCampaigns.userId,
        name: popupCampaigns.name,
        status: popupCampaigns.status,
        displayMode: popupCampaigns.displayMode,
        position: popupCampaigns.position,
        triggers: popupCampaigns.triggers,
        targeting: popupCampaigns.targeting,
        suppression: popupCampaigns.suppression,
        styleOverrides: popupCampaigns.styleOverrides,
        priority: popupCampaigns.priority,
        createdAt: popupCampaigns.createdAt,
        updatedAt: popupCampaigns.updatedAt,
        funnelSlug: funnels.slug,
        funnelPublished: funnels.published,
      })
      .from(popupCampaigns)
      .innerJoin(funnels, eq(popupCampaigns.funnelId, funnels.id))
      .where(ownershipCondition)
      .orderBy(desc(popupCampaigns.createdAt));

    return NextResponse.json(campaigns, {
      headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=30" },
    });
  } catch (error) {
    logger.error("GET /api/popup/campaigns error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rl = await checkRateLimit(apiLimiter, userId);
    if (rl.limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const isAdmin = await isSuperAdmin(userId);

    if (!isAdmin) {
      const [userRow] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
      const plan = userRow?.plan ?? "free";

      if (!hasFeature(plan, "popups")) {
        return NextResponse.json({ error: "Popup campaigns require Pro plan", upgrade: true }, { status: 403 });
      }

      const limits = getPlanLimits(plan);
      if (limits.popupCampaigns !== -1) {
        const existing = await db
          .select({ id: popupCampaigns.id })
          .from(popupCampaigns)
          .where(eq(popupCampaigns.userId, userId));

        if (existing.length >= limits.popupCampaigns) {
          return NextResponse.json(
            { error: `Your ${plan} plan allows ${limits.popupCampaigns} popup campaigns. Upgrade for more.`, upgrade: true },
            { status: 403 },
          );
        }
      }
    }

    const body = await req.json();
    const { funnelId, name } = body;

    if (!funnelId || typeof funnelId !== "string" || !UUID_RE.test(funnelId)) {
      return NextResponse.json({ error: "funnelId must be a valid UUID" }, { status: 400 });
    }
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ error: "name too long (max 100 chars)" }, { status: 400 });
    }

    let funnel;
    try {
      funnel = await requireFunnelAccess(userId, funnelId, "edit");
    } catch (err) {
      const e = err as { status?: number; error?: string };
      return NextResponse.json({ error: e.error || "Funnel not found" }, { status: e.status || 404 });
    }

    if (!funnel.published) {
      return NextResponse.json({ error: "Funnel must be published before creating a popup campaign" }, { status: 400 });
    }

    const [campaign] = await db
      .insert(popupCampaigns)
      .values({
        funnelId,
        userId,
        name: name.trim(),
      })
      .returning();

    // Fire-and-forget audit log (team funnels only)
    if (funnel.teamId) {
      logAuditEvent({
        teamId: funnel.teamId,
        userId,
        action: "popup.created",
        resourceType: "popup_campaign",
        resourceId: campaign.id,
        metadata: { name: name.trim(), funnelId },
      }).catch(() => {});
    }

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    logger.error("POST /api/popup/campaigns error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
