import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { popupCampaigns, funnels } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { apiLimiter, checkRateLimit } from "@/lib/rate-limit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_DISPLAY_MODES = ["modal", "slide_in", "full_screen"] as const;
const VALID_POSITIONS = ["center", "bottom_left", "bottom_right"] as const;
const VALID_STATUSES = ["draft", "active", "paused"] as const;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 });

    const rl = await checkRateLimit(apiLimiter, userId);
    if (rl.limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const [row] = await db
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
        funnelName: funnels.slug,
        funnelSlug: funnels.slug,
        funnelPublished: funnels.published,
      })
      .from(popupCampaigns)
      .innerJoin(funnels, eq(popupCampaigns.funnelId, funnels.id))
      .where(and(eq(popupCampaigns.id, id), eq(popupCampaigns.userId, userId)));

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(row, {
      headers: { "Cache-Control": "private, max-age=10, stale-while-revalidate=30" },
    });
  } catch (error) {
    logger.error("GET /api/popup/campaigns/[id] error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 });

    const rl = await checkRateLimit(apiLimiter, userId);
    if (rl.limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const [existing] = await db
      .select({ id: popupCampaigns.id, status: popupCampaigns.status })
      .from(popupCampaigns)
      .where(and(eq(popupCampaigns.id, id), eq(popupCampaigns.userId, userId)));

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 });
      }
      if (body.name.length > 100) {
        return NextResponse.json({ error: "name too long (max 100 chars)" }, { status: 400 });
      }
      updates.name = body.name.trim();
    }

    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
      }
      if (existing.status === "paused" && body.status === "draft") {
        return NextResponse.json({ error: "Cannot transition from paused to draft" }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.displayMode !== undefined) {
      if (!VALID_DISPLAY_MODES.includes(body.displayMode)) {
        return NextResponse.json({ error: `Invalid displayMode. Must be one of: ${VALID_DISPLAY_MODES.join(", ")}` }, { status: 400 });
      }
      updates.displayMode = body.displayMode;
    }

    if (body.position !== undefined) {
      if (!VALID_POSITIONS.includes(body.position)) {
        return NextResponse.json({ error: `Invalid position. Must be one of: ${VALID_POSITIONS.join(", ")}` }, { status: 400 });
      }
      updates.position = body.position;
    }

    if (body.triggers !== undefined) {
      if (typeof body.triggers !== "object" || body.triggers === null) {
        return NextResponse.json({ error: "triggers must be an object" }, { status: 400 });
      }
      updates.triggers = body.triggers;
    }

    if (body.targeting !== undefined) {
      if (typeof body.targeting !== "object" || body.targeting === null) {
        return NextResponse.json({ error: "targeting must be an object" }, { status: 400 });
      }
      updates.targeting = body.targeting;
    }

    if (body.suppression !== undefined) {
      if (typeof body.suppression !== "object" || body.suppression === null) {
        return NextResponse.json({ error: "suppression must be an object" }, { status: 400 });
      }
      updates.suppression = body.suppression;
    }

    if (body.styleOverrides !== undefined) {
      if (typeof body.styleOverrides !== "object" || body.styleOverrides === null) {
        return NextResponse.json({ error: "styleOverrides must be an object" }, { status: 400 });
      }
      updates.styleOverrides = body.styleOverrides;
    }

    if (body.priority !== undefined) {
      if (typeof body.priority !== "number" || !Number.isInteger(body.priority)) {
        return NextResponse.json({ error: "priority must be an integer" }, { status: 400 });
      }
      updates.priority = body.priority;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(popupCampaigns)
      .set(updates)
      .where(and(eq(popupCampaigns.id, id), eq(popupCampaigns.userId, userId)))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("PATCH /api/popup/campaigns/[id] error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 });

    const rl = await checkRateLimit(apiLimiter, userId);
    if (rl.limited) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const [existing] = await db
      .select({ id: popupCampaigns.id })
      .from(popupCampaigns)
      .where(and(eq(popupCampaigns.id, id), eq(popupCampaigns.userId, userId)));

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.delete(popupCampaigns).where(eq(popupCampaigns.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("DELETE /api/popup/campaigns/[id] error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
