import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { funnels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ogLimiter, checkRateLimit } from "@/lib/rate-limit";

export const runtime = "edge";

export async function GET(req: NextRequest, { params }: { params: Promise<{ funnelId: string }> }) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const { limited } = await checkRateLimit(ogLimiter, ip, 30);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { funnelId } = await params;

  try {
    const [funnel] = await db.select().from(funnels).where(eq(funnels.id, funnelId));

    if (!funnel || !funnel.published) {
      return new ImageResponse(
        (
          <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAFB", fontSize: 32, color: "#666" }}>
            Funnel not found
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const config = funnel.config as {
      brand: { name: string; primaryColor: string; primaryColorLight: string; logoUrl: string };
      quiz: { headline: string; subheadline: string; ctaButtonText?: string; badgeText?: string };
    };
    const brandName = config.brand?.name || "My Funnel";
    const headline = config.quiz?.headline || "Take the quiz";
    const subheadline = config.quiz?.subheadline || "";
    const primaryColor = config.brand?.primaryColor || "#2D6A4F";
    const lightColor = config.brand?.primaryColorLight || "#E8F5E9";
    const logoUrl = config.brand?.logoUrl || "";
    const ctaText = config.quiz?.ctaButtonText || "Take the Quiz";
    const badgeText = config.quiz?.badgeText || "FREE ASSESSMENT";

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: "100%",
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* Left content area */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "60px",
              justifyContent: "center",
            }}
          >
            {/* Logo + brand name */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  width={48}
                  height={48}
                  style={{ borderRadius: "12px", objectFit: "contain" }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    backgroundColor: primaryColor,
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "22px",
                    fontWeight: 700,
                  }}
                >
                  {brandName.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ display: "flex", fontSize: "20px", color: "#6B7280", fontWeight: 500 }}>
                {brandName}
              </div>
            </div>

            {/* Badge */}
            <div
              style={{
                display: "flex",
                fontSize: "13px",
                fontWeight: 700,
                color: primaryColor,
                backgroundColor: lightColor,
                padding: "6px 16px",
                borderRadius: "20px",
                marginBottom: "24px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                width: "fit-content",
              }}
            >
              {badgeText}
            </div>

            {/* Headline */}
            <div style={{ display: "flex", fontSize: "44px", fontWeight: 700, color: "#111827", lineHeight: 1.15, marginBottom: "16px", maxWidth: "580px" }}>
              {headline}
            </div>

            {/* Subheadline */}
            {subheadline && (
              <div style={{ display: "flex", fontSize: "20px", color: "#6B7280", lineHeight: 1.5, marginBottom: "32px", maxWidth: "500px" }}>
                {subheadline}
              </div>
            )}

            {/* CTA button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 32px",
                backgroundColor: primaryColor,
                borderRadius: "14px",
                color: "white",
                fontSize: "20px",
                fontWeight: 600,
                width: "fit-content",
              }}
            >
              {ctaText}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Right accent panel */}
          <div
            style={{
              display: "flex",
              width: "200px",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              padding: "40px 40px",
              position: "relative",
            }}
          >
            {/* Brand color accent bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: "8px",
                backgroundColor: primaryColor,
              }}
            />
            {/* Powered by */}
            <div style={{ display: "flex", fontSize: "13px", color: "#D1D5DB" }}>
              getmyvsl.com
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch {
    return new ImageResponse(
      (
        <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAFB", fontSize: 32, color: "#666" }}>
          MyVSL
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
