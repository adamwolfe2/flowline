import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { teamInvites, teamMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { submitLimiter, checkRateLimit } from "@/lib/rate-limit";

// POST accept invite
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const { limited } = await checkRateLimit(submitLimiter, ip);
    if (limited) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }

    const { token } = await params;

    const [invite] = await db.select().from(teamInvites)
      .where(eq(teamInvites.token, token));

    if (!invite) {
      return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
    }

    if (invite.acceptedAt) {
      return NextResponse.json({ error: "Invite already accepted" }, { status: 400 });
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ error: "Invite has expired" }, { status: 400 });
    }

    // Check not already a member
    const [existing] = await db.select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, invite.teamId), eq(teamMembers.userId, userId)));

    if (existing) {
      return NextResponse.json({ error: "Already a team member" }, { status: 400 });
    }

    // Add member and mark invite accepted
    await db.insert(teamMembers).values({
      teamId: invite.teamId,
      userId,
      role: invite.role,
    });

    await db.update(teamInvites)
      .set({ acceptedAt: new Date() })
      .where(eq(teamInvites.id, invite.id));

    return NextResponse.json({ success: true, teamId: invite.teamId });
  } catch (error) {
    logger.error("Accept invite error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
