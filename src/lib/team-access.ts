import { db } from "@/db";
import { teams, teamMembers, funnels } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/admin";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type TeamRole = "owner" | "admin" | "member";

type FunnelAccessResult = {
  allowed: boolean;
  role: TeamRole | "personal" | null;
  isPersonal: boolean;
};

/**
 * Get all team IDs a user belongs to.
 * Super admin does NOT bypass this — they only see teams they're actually in.
 */
export async function getUserTeamIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId));

  return rows.map((r) => r.teamId);
}

/**
 * Get a user's role in a specific team, or null if not a member.
 */
export async function getUserTeamRole(
  userId: string,
  teamId: string
): Promise<TeamRole | null> {
  const [row] = await db
    .select({ role: teamMembers.role })
    .from(teamMembers)
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)));

  return row?.role ?? null;
}

/**
 * Check whether a user can access a funnel and in what capacity.
 */
export async function canAccessFunnel(
  userId: string,
  funnelId: string
): Promise<FunnelAccessResult> {
  const notAllowed: FunnelAccessResult = {
    allowed: false,
    role: null,
    isPersonal: false,
  };

  const [funnel] = await db
    .select()
    .from(funnels)
    .where(eq(funnels.id, funnelId));

  if (!funnel) {
    return notAllowed;
  }

  // Personal ownership
  if (funnel.userId === userId) {
    return { allowed: true, role: "personal", isPersonal: true };
  }

  // Team membership
  if (funnel.teamId) {
    const teamRole = await getUserTeamRole(userId, funnel.teamId);
    if (teamRole) {
      return { allowed: true, role: teamRole, isPersonal: false };
    }
  }

  // Super admin fallback
  if (await isSuperAdmin(userId)) {
    return { allowed: true, role: "admin", isPersonal: false };
  }

  return notAllowed;
}

/**
 * Check whether a user can edit a funnel.
 * Owner/admin can edit any team funnel.
 * Members can only edit funnels they created.
 * Personal funnels: only the owner.
 */
export async function canEditFunnel(
  userId: string,
  funnelId: string
): Promise<boolean> {
  if (await isSuperAdmin(userId)) {
    return true;
  }

  const access = await canAccessFunnel(userId, funnelId);
  if (!access.allowed) {
    return false;
  }

  // Personal funnel — only the direct owner
  if (access.isPersonal) {
    return true;
  }

  // Team funnel: owner and admin can edit any
  if (access.role === "owner" || access.role === "admin") {
    return true;
  }

  // Member: check if they created the funnel
  const [funnel] = await db
    .select({ userId: funnels.userId })
    .from(funnels)
    .where(eq(funnels.id, funnelId));

  return funnel?.userId === userId;
}

/**
 * Check whether a user has a specific team-level permission.
 */
export async function checkTeamPermission(
  userId: string,
  teamId: string,
  action: "manage_members" | "manage_clients" | "manage_settings" | "delete_team"
): Promise<boolean> {
  if (await isSuperAdmin(userId)) return true;

  const role = await getUserTeamRole(userId, teamId);
  if (!role) return false;

  switch (action) {
    case "manage_members":
    case "delete_team":
      return role === "owner";
    case "manage_clients":
    case "manage_settings":
      return role === "owner" || role === "admin";
    default:
      return false;
  }
}

/**
 * Main authorization gate for API routes.
 * Validates UUID, checks access, enforces permission level, and returns the funnel row.
 * Throws `{ status, error }` on failure — catch in route handler and return as NextResponse.
 */
export async function requireFunnelAccess(
  userId: string,
  funnelId: string,
  permission: "view" | "edit" | "delete"
): Promise<typeof funnels.$inferSelect> {
  if (!UUID_REGEX.test(funnelId)) {
    throw { status: 404, error: "Not found" };
  }

  const [funnel] = await db
    .select()
    .from(funnels)
    .where(eq(funnels.id, funnelId));

  if (!funnel) {
    throw { status: 404, error: "Not found" };
  }

  const access = await canAccessFunnel(userId, funnelId);

  if (!access.allowed) {
    throw { status: 404, error: "Not found" };
  }

  if (permission === "edit") {
    const canEdit = await canEditFunnel(userId, funnelId);
    if (!canEdit) {
      throw { status: 404, error: "Not found" };
    }
  }

  if (permission === "delete") {
    if (await isSuperAdmin(userId)) {
      // Super admin can always delete
    } else if (access.isPersonal) {
      // Personal funnel: owner confirmed via canAccessFunnel
    } else {
      // Team funnel: only owner or admin can delete — members cannot delete even their own
      if (access.role !== "owner" && access.role !== "admin") {
        throw { status: 404, error: "Not found" };
      }
    }
  }

  return funnel;
}

/**
 * Resolve workspace context for a user.
 * Falls back to personal workspace if the user isn't a member of the requested team.
 */
export async function getTeamForWorkspace(
  userId: string,
  teamId: string | null | undefined
): Promise<
  | { type: "personal"; teamId: null }
  | { type: "team"; teamId: string; teamName: string; role: string }
> {
  if (!teamId) {
    return { type: "personal", teamId: null };
  }

  const [membership] = await db
    .select({
      role: teamMembers.role,
      teamName: teams.name,
      teamId: teams.id,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)));

  if (!membership) {
    return { type: "personal", teamId: null };
  }

  return {
    type: "team",
    teamId: membership.teamId,
    teamName: membership.teamName,
    role: membership.role,
  };
}

/**
 * Get the team's plan directly from the teams table.
 * Used for plan limit checks when creating funnels in team context.
 */
export async function getTeamPlan(teamId: string): Promise<string> {
  const [team] = await db
    .select({ plan: teams.plan })
    .from(teams)
    .where(eq(teams.id, teamId));

  return team?.plan ?? "free";
}
