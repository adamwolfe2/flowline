import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Hardcoded super admin — full unrestricted access to everything
const SUPER_ADMIN_EMAIL = "adamwolfe102@gmail.com";

/**
 * Check if a userId belongs to the super admin.
 * Checks env var first, then looks up email in DB.
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  // Fast path: env var match
  if (process.env.ADMIN_USER_ID && userId === process.env.ADMIN_USER_ID) {
    return true;
  }

  // DB lookup: check if user's email matches super admin
  const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
  return user?.email === SUPER_ADMIN_EMAIL;
}

/**
 * Super admin gets agency-level access to everything.
 * Call this in plan enforcement checks to bypass limits.
 */
export function getSuperAdminPlan(): "agency" {
  return "agency";
}
