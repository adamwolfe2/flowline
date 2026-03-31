import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { getUserTeamRole } from "@/lib/team-access";
import { apiLimiter, checkRateLimit } from "@/lib/rate-limit";
import { getClientsByTeam } from "@/db/queries/clients";
import { logger } from "@/lib/logger";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(apiLimiter, userId);
    if (rateLimit.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { teamId } = await params;
    if (!UUID_REGEX.test(teamId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const role = await getUserTeamRole(userId, teamId);
    if (!role) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const result = await getClientsByTeam(teamId);

    return NextResponse.json({ clients: result }, {
      headers: {
        "Cache-Control": "private, max-age=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    logger.error("List clients error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(apiLimiter, userId);
    if (rateLimit.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { teamId } = await params;
    if (!UUID_REGEX.test(teamId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const role = await getUserTeamRole(userId, teamId);
    if (!role || role === "member") {
      return NextResponse.json({ error: "Only owners and admins can create clients" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, company, notes } = body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ error: "Name must be 100 characters or less" }, { status: 400 });
    }

    // Validate email
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (email.length > 200) {
      return NextResponse.json({ error: "Email must be 200 characters or less" }, { status: 400 });
    }

    // Validate company (optional)
    if (company !== undefined && company !== null) {
      if (typeof company !== "string" || company.length > 100) {
        return NextResponse.json({ error: "Company must be 100 characters or less" }, { status: 400 });
      }
    }

    // Validate notes (optional)
    if (notes !== undefined && notes !== null) {
      if (typeof notes !== "string" || notes.length > 500) {
        return NextResponse.json({ error: "Notes must be 500 characters or less" }, { status: 400 });
      }
    }

    const [created] = await db
      .insert(clients)
      .values({
        teamId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company?.trim() || null,
        notes: notes?.trim() || null,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    logger.error("Create client error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
