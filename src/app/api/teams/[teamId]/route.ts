import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { teams, teamMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { apiLimiter, checkRateLimit } from "@/lib/rate-limit";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const HTTPS_URL_REGEX = /^https:\/\/.+/;

interface TeamBranding {
  logoUrl?: string;
  logoWidth?: number;
  primaryColor?: string;
  appName?: string;
  faviconUrl?: string;
}

function validateBranding(branding: unknown): { valid: boolean; error?: string } {
  if (typeof branding !== "object" || branding === null || Array.isArray(branding)) {
    return { valid: false, error: "Branding must be an object" };
  }

  const b = branding as Record<string, unknown>;

  if (b.logoUrl !== undefined) {
    if (typeof b.logoUrl !== "string" || !HTTPS_URL_REGEX.test(b.logoUrl)) {
      return { valid: false, error: "logoUrl must be an https URL" };
    }
  }

  if (b.logoWidth !== undefined) {
    if (typeof b.logoWidth !== "number" || b.logoWidth < 40 || b.logoWidth > 400) {
      return { valid: false, error: "logoWidth must be a number between 40 and 400" };
    }
  }

  if (b.primaryColor !== undefined) {
    if (typeof b.primaryColor !== "string" || !HEX_COLOR_REGEX.test(b.primaryColor)) {
      return { valid: false, error: "primaryColor must be a hex color (#xxxxxx)" };
    }
  }

  if (b.appName !== undefined) {
    if (typeof b.appName !== "string" || b.appName.length > 50) {
      return { valid: false, error: "appName must be a string (max 50 chars)" };
    }
  }

  if (b.faviconUrl !== undefined) {
    if (typeof b.faviconUrl !== "string" || !HTTPS_URL_REGEX.test(b.faviconUrl)) {
      return { valid: false, error: "faviconUrl must be an https URL" };
    }
  }

  return { valid: true };
}

// GET team details including branding
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { limited } = await checkRateLimit(apiLimiter, userId);
    if (limited) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { teamId } = await params;

    if (!UUID_REGEX.test(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    // Verify membership
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

    if (!member) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [team] = await db.select().from(teams).where(eq(teams.id, teamId));

    if (!team) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(team, {
      headers: { "Cache-Control": "private, max-age=10" },
    });
  } catch (error) {
    logger.error("GET /api/teams/[teamId] error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH update team (name, branding)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { limited } = await checkRateLimit(apiLimiter, userId);
    if (limited) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { teamId } = await params;

    if (!UUID_REGEX.test(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    // Verify admin/owner
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return NextResponse.json(
        { error: "Only team owners and admins can update team settings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    // Validate name
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        return NextResponse.json({ error: "Team name cannot be empty" }, { status: 400 });
      }
      if (body.name.length > 100) {
        return NextResponse.json({ error: "Team name must be 100 characters or less" }, { status: 400 });
      }
      updates.name = body.name.trim();
    }

    // Validate branding
    if (body.branding !== undefined) {
      const validation = validateBranding(body.branding);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      updates.branding = body.branding as TeamBranding;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(teams)
      .set(updates)
      .where(eq(teams.id, teamId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("PATCH /api/teams/[teamId] error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
