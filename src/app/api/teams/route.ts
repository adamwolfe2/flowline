import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { teams, teamMembers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

// GET user's teams
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userTeams = await db.select({
      id: teams.id,
      name: teams.name,
      ownerId: teams.ownerId,
      role: teamMembers.role,
      createdAt: teams.createdAt,
    })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, userId));

    return NextResponse.json(userTeams);
  } catch (error) {
    logger.error("Get teams error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST create team
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check user plan — only Agency can create teams
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || user.plan !== "agency") {
      return NextResponse.json({ error: "Teams require an Agency plan" }, { status: 403 });
    }

    const { name } = await req.json();
    if (!name || name.length > 50) {
      return NextResponse.json({ error: "Team name required (max 50 chars)" }, { status: 400 });
    }

    // Create team and add owner as member
    const [team] = await db.insert(teams).values({
      name,
      ownerId: userId,
    }).returning();

    await db.insert(teamMembers).values({
      teamId: team.id,
      userId,
      role: "owner",
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    logger.error("Create team error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
