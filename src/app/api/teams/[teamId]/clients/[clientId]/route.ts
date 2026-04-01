import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { clients, funnels } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserTeamRole, checkTeamPermission } from "@/lib/team-access";
import { apiLimiter, checkRateLimit } from "@/lib/rate-limit";
import { getClientWithFunnels, getClientStats } from "@/db/queries/clients";
import { logger } from "@/lib/logger";
import { logAuditEvent } from "@/lib/audit";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RouteParams = { params: Promise<{ teamId: string; clientId: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(apiLimiter, userId);
    if (rateLimit.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { teamId, clientId } = await params;
    if (!UUID_REGEX.test(teamId) || !UUID_REGEX.test(clientId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const role = await getUserTeamRole(userId, teamId);
    if (!role) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const result = await getClientWithFunnels(clientId, teamId);
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const stats = await getClientStats(clientId);

    return NextResponse.json({
      ...result.client,
      funnels: result.funnels,
      stats,
    });
  } catch (error) {
    logger.error("Get client error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(apiLimiter, userId);
    if (rateLimit.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { teamId, clientId } = await params;
    if (!UUID_REGEX.test(teamId) || !UUID_REGEX.test(clientId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const canManage = await checkTeamPermission(userId, teamId, "manage_clients");
    if (!canManage) {
      return NextResponse.json({ error: "Only owners and admins can update clients" }, { status: 403 });
    }

    const body = await req.json();
    const updates: Record<string, string | null> = {};

    // Validate name
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      if (body.name.length > 100) {
        return NextResponse.json({ error: "Name must be 100 characters or less" }, { status: 400 });
      }
      updates.name = body.name.trim();
    }

    // Validate email
    if (body.email !== undefined) {
      if (typeof body.email !== "string" || !EMAIL_REGEX.test(body.email)) {
        return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
      }
      if (body.email.length > 200) {
        return NextResponse.json({ error: "Email must be 200 characters or less" }, { status: 400 });
      }
      updates.email = body.email.trim().toLowerCase();
    }

    // Validate company
    if (body.company !== undefined) {
      if (body.company === null) {
        updates.company = null;
      } else if (typeof body.company !== "string" || body.company.length > 100) {
        return NextResponse.json({ error: "Company must be 100 characters or less" }, { status: 400 });
      } else {
        updates.company = body.company.trim() || null;
      }
    }

    // Validate notes
    if (body.notes !== undefined) {
      if (body.notes === null) {
        updates.notes = null;
      } else if (typeof body.notes !== "string" || body.notes.length > 500) {
        return NextResponse.json({ error: "Notes must be 500 characters or less" }, { status: 400 });
      } else {
        updates.notes = body.notes.trim() || null;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(clients)
      .set(updates)
      .where(and(eq(clients.id, clientId), eq(clients.teamId, teamId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Update client error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(apiLimiter, userId);
    if (rateLimit.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { teamId, clientId } = await params;
    if (!UUID_REGEX.test(teamId) || !UUID_REGEX.test(clientId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const canManage = await checkTeamPermission(userId, teamId, "manage_clients");
    if (!canManage) {
      return NextResponse.json({ error: "Only owners and admins can delete clients" }, { status: 403 });
    }

    // Unset clientId on all funnels assigned to this client
    await db
      .update(funnels)
      .set({ clientId: null, updatedAt: new Date() })
      .where(eq(funnels.clientId, clientId));

    // Delete the client (scoped to team)
    const [deleted] = await db
      .delete(clients)
      .where(and(eq(clients.id, clientId), eq(clients.teamId, teamId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Fire-and-forget audit log
    logAuditEvent({
      teamId,
      userId,
      action: "client.deleted",
      resourceType: "client",
      resourceId: clientId,
      metadata: { name: deleted.name, email: deleted.email },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Delete client error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
