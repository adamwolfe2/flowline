import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export type AuditAction =
  | "funnel.created"
  | "funnel.updated"
  | "funnel.deleted"
  | "funnel.published"
  | "funnel.unpublished"
  | "client.created"
  | "client.updated"
  | "client.deleted"
  | "member.invited"
  | "member.removed"
  | "member.role_changed"
  | "team.settings_updated"
  | "team.branding_updated"
  | "team.domain_updated"
  | "popup.created"
  | "popup.activated"
  | "popup.paused"
  | "popup.deleted";

export type AuditResourceType =
  | "funnel"
  | "client"
  | "member"
  | "team"
  | "popup_campaign";

export async function logAuditEvent(params: {
  teamId: string;
  userId: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      teamId: params.teamId,
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId ?? null,
      metadata: params.metadata ?? null,
    });
  } catch {
    // Non-critical — don't block the operation
  }
}
