import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { z } from "zod";

const preferencesSchema = z.object({
  leadAlerts: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = preferencesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentPrefs = user.notificationPreferences ?? { leadAlerts: true, weeklyDigest: true };
    const updatedPrefs = {
      leadAlerts: parsed.data.leadAlerts !== undefined ? parsed.data.leadAlerts : currentPrefs.leadAlerts,
      weeklyDigest: parsed.data.weeklyDigest !== undefined ? parsed.data.weeklyDigest : currentPrefs.weeklyDigest,
    };

    await db
      .update(users)
      .set({ notificationPreferences: updatedPrefs })
      .where(eq(users.id, userId));

    return NextResponse.json({ notificationPreferences: updatedPrefs });
  } catch (error) {
    logger.error("PATCH /api/user/preferences error:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
