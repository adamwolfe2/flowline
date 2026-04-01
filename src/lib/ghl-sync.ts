import { db } from "@/db";
import { ghlConnections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

interface LeadData {
  email: string;
  name?: string;
  phone?: string;
  score: number;
  tier: string;
  answers: Record<string, string>;
}

/**
 * Refresh a GHL access token using the refresh token.
 * Returns the new access token or null on failure.
 */
async function refreshGHLToken(connectionId: string, refreshToken: string): Promise<string | null> {
  const clientId = process.env.GHL_CLIENT_ID;
  const clientSecret = process.env.GHL_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  try {
    const tokenResponse = await fetch(
      "https://services.leadconnectorhq.com/oauth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      }
    );

    if (!tokenResponse.ok) {
      logger.error("GHL token refresh failed during sync", {
        connectionId,
        status: tokenResponse.status,
      });
      return null;
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await db
      .update(ghlConnections)
      .set({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt,
      })
      .where(eq(ghlConnections.id, connectionId));

    return tokenData.access_token;
  } catch (error) {
    logger.error("GHL token refresh error during sync", {
      connectionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Sync a lead to GoHighLevel via the Contacts API.
 * If a GHL connection exists for the user and the token is valid (or can be refreshed),
 * the lead is pushed as a contact. Returns true on success, false on no-op or failure.
 */
export async function syncLeadToGHL(
  userId: string,
  lead: LeadData
): Promise<boolean> {
  try {
    // Look up GHL connection for this user
    const connections = await db
      .select()
      .from(ghlConnections)
      .where(eq(ghlConnections.userId, userId));

    if (connections.length === 0) {
      return false; // No connection — no-op
    }

    const connection = connections[0];
    let { accessToken } = connection;

    // Check if token is expired (with 5-minute buffer)
    const isExpired =
      connection.tokenExpiresAt.getTime() < Date.now() + 5 * 60 * 1000;

    if (isExpired) {
      const refreshedToken = await refreshGHLToken(
        connection.id,
        connection.refreshToken
      );
      if (!refreshedToken) {
        logger.warn("GHL sync skipped — token refresh failed", { userId });
        return false;
      }
      accessToken = refreshedToken;
    }

    // Build GHL contact payload
    const [firstName, ...lastParts] = (lead.name ?? "").split(" ");
    const lastName = lastParts.join(" ");

    const tags = ["myvsl-lead", `score-${lead.tier}`];

    const customFields: Array<{ key: string; value: string }> = [
      { key: "quiz_score", value: String(lead.score) },
      { key: "quiz_tier", value: lead.tier },
    ];

    // Add quiz answers as custom fields
    for (const [key, value] of Object.entries(lead.answers)) {
      customFields.push({
        key: `quiz_${key}`,
        value: String(value),
      });
    }

    const contactPayload = {
      email: lead.email,
      firstName: firstName || "",
      lastName: lastName || "",
      phone: lead.phone || "",
      tags,
      customField: customFields,
      source: "MyVSL Quiz Funnel",
    };

    const response = await fetch(
      "https://services.leadconnectorhq.com/contacts/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          Version: "2021-07-28",
        },
        body: JSON.stringify(contactPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.warn("GHL contact sync failed", {
        userId,
        status: response.status,
        error: errorText,
      });
      return false;
    }

    logger.info("GHL lead synced successfully", {
      userId,
      email: lead.email,
      tier: lead.tier,
    });

    return true;
  } catch (error) {
    logger.error("GHL sync error", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
