import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { db } from "@/db";
import { users, teams, teamMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: { teamId?: string } = {};
    try {
      body = await req.json();
    } catch {
      // No body is fine — defaults to personal billing
    }

    const { teamId } = body;

    // --- Team billing portal ---
    if (teamId) {
      if (!UUID_REGEX.test(teamId)) {
        return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
      }

      // Verify user is the team owner
      const [membership] = await db
        .select({ role: teamMembers.role })
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

      if (!membership || membership.role !== "owner") {
        return NextResponse.json({ error: "Only the team owner can manage billing" }, { status: 403 });
      }

      const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
      if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      if (!team.stripeCustomerId) {
        return NextResponse.json({ error: "No active subscription for this team. Please upgrade first." }, { status: 400 });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getmyvsl.com";
      const session = await stripe.billingPortal.sessions.create({
        customer: team.stripeCustomerId,
        return_url: `${appUrl}/billing`,
      });

      return NextResponse.json({ url: session.url });
    }

    // --- Personal billing portal ---
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return NextResponse.json({ error: "Account not found. Please refresh and try again." }, { status: 400 });
    }
    if (!user.stripeCustomerId) {
      return NextResponse.json({ error: "No active subscription. Please upgrade first." }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getmyvsl.com";
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logger.error("Portal error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
