import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { ghlConnections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

interface GHLRefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export async function POST(req: NextRequest) {
  try {
    const clientId = process.env.GHL_CLIENT_ID;
    const clientSecret = process.env.GHL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "GoHighLevel integration is not configured" },
        { status: 503 }
      );
    }

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { connectionId?: string };
    const { connectionId } = body;

    if (!connectionId) {
      return NextResponse.json(
        { error: "connectionId is required" },
        { status: 400 }
      );
    }

    // Look up connection owned by this user
    const connections = await db
      .select()
      .from(ghlConnections)
      .where(
        and(
          eq(ghlConnections.id, connectionId),
          eq(ghlConnections.userId, userId)
        )
      );

    if (connections.length === 0) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    const connection = connections[0];

    const tokenResponse = await fetch(
      "https://services.leadconnectorhq.com/oauth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "refresh_token",
          refresh_token: connection.refreshToken,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      logger.error("GHL token refresh failed", {
        connectionId,
        status: tokenResponse.status,
        error: errorText,
      });
      return NextResponse.json(
        { error: "Failed to refresh GoHighLevel token" },
        { status: 502 }
      );
    }

    const tokenData = (await tokenResponse.json()) as GHLRefreshResponse;
    const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await db
      .update(ghlConnections)
      .set({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt,
      })
      .where(eq(ghlConnections.id, connectionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("POST /api/ghl/refresh error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
