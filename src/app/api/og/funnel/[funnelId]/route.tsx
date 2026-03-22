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

    const config = funnel.config as { brand: { name: string; primaryColor: string }; quiz: { headline: string } };
    const brandName = config.brand?.name || "My Funnel";
    const headline = config.quiz?.headline || "Take the quiz";
    const primaryColor = config.brand?.primaryColor || "#2D6A4F";

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            backgroundColor: "#FFFFFF",
            padding: "60px",
          }}
        >
          {/* Top bar with brand color */}
          <div style={{ display: "flex", width: "100%", height: "6px", backgroundColor: primaryColor, borderRadius: "3px", marginBottom: "40px" }} />

          {/* Brand name */}
          <div style={{ display: "flex", fontSize: "24px", color: "#6B7280", marginBottom: "20px", fontWeight: 500 }}>
            {brandName}
          </div>

          {/* Headline */}
          <div style={{ display: "flex", fontSize: "52px", fontWeight: 700, color: "#111827", lineHeight: 1.2, maxWidth: "800px" }}>
            {headline}
          </div>

          {/* Bottom section */}
          <div style={{ display: "flex", marginTop: "auto", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            {/* CTA pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 28px",
                backgroundColor: primaryColor,
                borderRadius: "12px",
                color: "white",
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              Take the Quiz
            </div>

            {/* Powered by */}
            <div style={{ display: "flex", fontSize: "14px", color: "#9CA3AF" }}>
              Built with MyVSL
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
