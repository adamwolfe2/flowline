import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Hardcoded super admin — full unrestricted access to everything
const SUPER_ADMIN_EMAIL = "adamwolfe102@gmail.com";
const SUPER_ADMIN_USER_ID = "user_3BDXaPSL6jBfBefM44mC1PldhHz";

/**
 * Check if a userId belongs to the super admin.
 * Triple-check: hardcoded user ID, env var, then DB email lookup.
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  // Fast path 1: hardcoded user ID (cannot fail)
  if (userId === SUPER_ADMIN_USER_ID) {
    return true;
  }

  // Fast path 2: env var match
  if (process.env.ADMIN_USER_ID && userId === process.env.ADMIN_USER_ID) {
    return true;
  }

  // Fallback: DB lookup by email
  try {
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
    return user?.email === SUPER_ADMIN_EMAIL;
  } catch {
    return false;
  }
}

/**
 * Super admin gets agency-level access to everything.
 * Call this in plan enforcement checks to bypass limits.
 */
export function getSuperAdminPlan(): "agency" {
  return "agency";
}
