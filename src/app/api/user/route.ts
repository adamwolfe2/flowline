import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { isSuperAdmin } from "@/lib/admin";


export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Delete user data from DB (funnels cascade to leads/sessions/events)
    await db.delete(users).where(eq(users.id, userId));

    // Note: Clerk user deletion would require the Clerk backend API.
    // DB data is deleted; the client redirects to home after this.
    logger.info("User account deleted", { userId });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("DELETE /api/user error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const isAdmin = await isSuperAdmin(userId);

    return NextResponse.json({
      plan: isAdmin ? "agency" : (user?.plan ?? "free"),
      stripeCustomerId: user?.stripeCustomerId ?? null,
      email: user?.email ?? null,
      isAdmin,
      notificationPreferences: user?.notificationPreferences ?? { leadAlerts: true, weeklyDigest: true },
      trialEndsAt: user?.trialEndsAt ?? null,
    }, {
      headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    logger.error("GET /api/user error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
