import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createFunnel, checkSlugAvailable, getFunnelCount } from "@/db/queries/funnels";
import { generateSlug } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { isSuperAdmin } from "@/lib/admin";
import { requireFunnelAccess, getUserTeamIds } from "@/lib/team-access";
import type { FunnelConfig } from "@/types";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    let sourceFunnel;
    try {
      sourceFunnel = await requireFunnelAccess(userId, id, "view");
    } catch (err) {
      const e = err as { status?: number; error?: string };
      return NextResponse.json({ error: e.error || "Funnel not found" }, { status: e.status || 404 });
    }

    const body = await req.json();
    const { targetEmail } = body as { targetEmail?: string };

    const config = sourceFunnel.config as FunnelConfig;
    let targetUserId = userId;

    // If sharing to another account
    if (targetEmail) {
      if (!EMAIL_REGEX.test(targetEmail)) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }

      const [targetUser] = await db
        .select({ id: users.id, plan: users.plan })
        .from(users)
        .where(eq(users.email, targetEmail));

      if (!targetUser) {
        return NextResponse.json(
          { error: "User not found. They need a MyVSL account first." },
          { status: 404 }
        );
      }

      targetUserId = targetUser.id;

      // Check plan limits for the target user
      const isAdmin = await isSuperAdmin(targetUserId);
      if (!isAdmin) {
        const count = await getFunnelCount(targetUserId);
        if (targetUser.plan === "free" && count >= 1) {
          return NextResponse.json(
            { error: "Target user is on the free plan (limited to 1 funnel). They need to upgrade." },
            { status: 403 }
          );
        }
      }
    } else {
      // Self-duplicate — check own plan limits
      const isAdmin = await isSuperAdmin(userId);
      if (!isAdmin) {
        const [userRow] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
        const count = await getFunnelCount(userId);
        if (userRow?.plan === "free" && count >= 1) {
          return NextResponse.json(
            { error: "Free plan limited to 1 funnel. Upgrade to Pro." },
            { status: 403 }
          );
        }
      }
    }

    // Generate unique slug with retry
    const baseSlug = generateSlug(config.brand?.name ?? "my-funnel");
    let slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

    let isAvailable = await checkSlugAvailable(slug);
    if (!isAvailable) {
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
      isAvailable = await checkSlugAvailable(slug);
      if (!isAvailable) {
        return NextResponse.json({ error: "Could not generate unique slug. Try again." }, { status: 409 });
      }
    }

    // Resolve workspace team context for the cloned funnel
    let cloneTeamId: string | null = null;
    if (!targetEmail) {
      const workspaceTeamId = req.headers.get("x-workspace-team-id");
      if (workspaceTeamId) {
        const teamIds = await getUserTeamIds(userId);
        if (teamIds.includes(workspaceTeamId)) {
          cloneTeamId = workspaceTeamId;
        }
      }
    }

    const newFunnel = await createFunnel({
      userId: targetUserId,
      slug,
      config: sourceFunnel.config,
      teamId: cloneTeamId,
    });

    return NextResponse.json({
      ...newFunnel,
      shared: !!targetEmail,
    }, { status: 201 });
  } catch (error) {
    logger.error("POST /api/funnels/[id]/clone error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
