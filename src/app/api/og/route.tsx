import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { ogLimiter, checkRateLimit } from "@/lib/rate-limit";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { limited } = await checkRateLimit(ogLimiter, ip, 30);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || "MyVSL";
  const description =
    searchParams.get("description") || "AI-powered funnel builder that books calls";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
          position: "relative",
        }}
      >
        {/* Green accent bar at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: "#2D6A4F",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: 64,
            height: 64,
            backgroundColor: "#2D6A4F",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#FFFFFF",
            }}
          >
            M
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#111827",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 24,
            color: "#6B7280",
            textAlign: "center",
            maxWidth: 600,
            marginTop: 20,
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              backgroundColor: "#2D6A4F",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>M</div>
          </div>
          <span style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>
            MyVSL
          </span>
          <span style={{ fontSize: 16, color: "#9CA3AF", marginLeft: 4 }}>
            getmyvsl.com
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
