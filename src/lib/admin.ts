import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Hardcoded super admin — full unrestricted access to everything
const SUPER_ADMIN_EMAIL = "adamwolfe102@gmail.com";

/**
 * Check if a userId belongs to the super admin.
 * Uses email lookup from the DB (Clerk userId -> users table -> email).
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  // Fast path: check env var first (avoids DB call for non-admin)
  if (process.env.ADMIN_USER_ID && userId === process.env.ADMIN_USER_ID) {
    return true;
  }

  // Check email in DB
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
