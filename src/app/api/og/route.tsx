import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || "MyVSL";
  const description = searchParams.get("description") || "AI-powered funnel builder";

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
          backgroundColor: "#FAFAF8",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Brand mark */}
        <img src="https://getmyvsl.com/logo.png" width={56} height={56} style={{ marginBottom: 24 }} />

        {/* Title */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#333333",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 22,
            color: "#737373",
            textAlign: "center",
            maxWidth: 600,
            marginTop: 16,
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
            gap: 8,
          }}
        >
          <img src="https://getmyvsl.com/logo.png" width={24} height={24} />
          <span style={{ fontSize: 18, fontWeight: 600, color: "#333333" }}>MyVSL</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
