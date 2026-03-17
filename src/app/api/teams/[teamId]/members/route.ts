import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { teams, teamMembers, teamInvites, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";
import crypto from "crypto";

// GET team members
export async function GET(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { teamId } = await params;

    // Verify membership
    const [member] = await db.select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
    if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const members = await db.select({
      id: teamMembers.id,
      userId: teamMembers.userId,
      role: teamMembers.role,
      email: users.email,
      joinedAt: teamMembers.joinedAt,
    })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));

    // Also get pending invites
    const invites = await db.select()
      .from(teamInvites)
      .where(and(eq(teamInvites.teamId, teamId), eq(teamInvites.acceptedAt, null as unknown as Date)));

    return NextResponse.json({ members, invites });
  } catch (error) {
    logger.error("Get members error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST invite member
export async function POST(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { teamId } = await params;
    const { email, role } = await req.json();

    // Verify admin/owner
    const [member] = await db.select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return NextResponse.json({ error: "Only admins can invite members" }, { status: 403 });
    }

    // Max 10 members per team
    const existingMembers = await db.select({ id: teamMembers.id })
      .from(teamMembers)
      .where(eq(teamMembers.teamId, teamId));
    if (existingMembers.length >= 10) {
      return NextResponse.json({ error: "Maximum 10 team members" }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [invite] = await db.insert(teamInvites).values({
      teamId,
      email,
      role: role || "member",
      invitedBy: userId,
      token,
      expiresAt,
    }).returning();

    // Send invite email if Resend is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getmyvsl.com";

        const [team] = await db.select().from(teams).where(eq(teams.id, teamId));

        await resend.emails.send({
          from: "MyVSL <noreply@getmyvsl.com>",
          to: email,
          subject: `You're invited to join ${team?.name || "a team"} on MyVSL`,
          html: `
            <p>You've been invited to join <strong>${team?.name}</strong> on MyVSL.</p>
            <p><a href="${appUrl}/invite/${token}" style="display:inline-block;padding:12px 24px;background:#2D6A4F;color:white;border-radius:8px;text-decoration:none;font-weight:600;">Accept Invite</a></p>
            <p style="color:#666;font-size:12px;">This invite expires in 7 days.</p>
          `,
        });
      } catch {
        // Email send failure is non-critical
      }
    }

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    logger.error("Invite member error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
