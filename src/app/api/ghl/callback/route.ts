import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ghlConnections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

interface GHLTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  locationId: string;
  companyId: string;
}

export async function GET(req: NextRequest) {
  try {
    const clientId = process.env.GHL_CLIENT_ID;
    const clientSecret = process.env.GHL_CLIENT_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!clientId || !clientSecret || !appUrl) {
      return NextResponse.json(
        { error: "GoHighLevel integration is not configured" },
        { status: 503 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Validate state matches cookie
    const storedState = req.cookies.get("ghl_state")?.value;
    if (!storedState || state !== storedState) {
      logger.warn("GHL callback state mismatch");
      return NextResponse.json(
        { error: "State mismatch — possible CSRF attack" },
        { status: 403 }
      );
    }

    const userId = req.cookies.get("ghl_user_id")?.value;
    if (!userId) {
      return NextResponse.json(
        { error: "User session expired. Please try connecting again." },
        { status: 401 }
      );
    }

    // Exchange code for tokens
    const redirectUri = `${appUrl}/api/ghl/callback`;
    const tokenResponse = await fetch(
      "https://services.leadconnectorhq.com/oauth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      logger.error("GHL token exchange failed", {
        status: tokenResponse.status,
        error: errorText,
      });
      return NextResponse.json(
        { error: "Failed to complete GoHighLevel authorization" },
        { status: 502 }
      );
    }

    const tokenData = (await tokenResponse.json()) as GHLTokenResponse;

    const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Upsert connection
    const existing = await db
      .select({ id: ghlConnections.id })
      .from(ghlConnections)
      .where(eq(ghlConnections.locationId, tokenData.locationId));

    if (existing.length > 0) {
      await db
        .update(ghlConnections)
        .set({
          userId,
          companyId: tokenData.companyId,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenExpiresAt,
          scopes: "contacts.write contacts.readonly locations.readonly",
          connectedAt: new Date(),
        })
        .where(eq(ghlConnections.locationId, tokenData.locationId));
    } else {
      await db.insert(ghlConnections).values({
        userId,
        locationId: tokenData.locationId,
        companyId: tokenData.companyId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt,
        scopes: "contacts.write contacts.readonly locations.readonly",
      });
    }

    // Redirect to settings with success indicator
    const redirectUrl = new URL("/settings", appUrl);
    redirectUrl.searchParams.set("ghl", "connected");

    const response = NextResponse.redirect(redirectUrl.toString());
    response.cookies.delete("ghl_state");
    response.cookies.delete("ghl_user_id");

    return response;
  } catch (error) {
    logger.error("GET /api/ghl/callback error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
