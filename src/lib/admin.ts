import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Hardcoded super admin — full unrestricted access to everything
const SUPER_ADMIN_EMAIL = "adamwolfe102@gmail.com";

// Cache the admin userId after first lookup to avoid repeated DB queries
let cachedAdminUserId: string | null = null;

/**
 * Check if a userId belongs to the super admin.
 * First checks env var, then cached userId, then falls back to DB lookup.
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  // Fast path 1: env var
  if (process.env.ADMIN_USER_ID && userId === process.env.ADMIN_USER_ID) {
    return true;
  }

  // Fast path 2: cached from previous lookup
  if (cachedAdminUserId && userId === cachedAdminUserId) {
    return true;
  }
  if (cachedAdminUserId && userId !== cachedAdminUserId) {
    return false;
  }

  // DB lookup (only happens once per server instance)
  const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
  if (user?.email === SUPER_ADMIN_EMAIL) {
    cachedAdminUserId = userId;
    return true;
  }
  return false;
}

/**
 * Super admin gets agency-level access to everything.
 * Call this in plan enforcement checks to bypass limits.
 */
export function getSuperAdminPlan(): "agency" {
  return "agency";
}
