import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

    // SSRF protection
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") {
        return NextResponse.json({ success: false, error: "Webhook URL must use HTTPS" }, { status: 400 });
      }
      const hostname = parsed.hostname;
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "0.0.0.0" ||
        hostname === "[::1]" ||
        hostname.startsWith("10.") ||
        hostname.startsWith("192.168.") ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
      ) {
        return NextResponse.json({ success: false, error: "Internal URLs are not allowed" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ success: false, error: "Invalid URL" }, { status: 400 });
    }

    const testPayload = {
      email: "test@example.com",
      answers: { q1: "b", q2: "c", q3: "a" },
      score: 7,
      calendar_tier: "high",
      timestamp: new Date().toISOString(),
      source: "MyVSL Test",
      funnel_slug: "test-funnel",
      _test: true,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        return NextResponse.json({ success: true, status: response.status });
      } else {
        return NextResponse.json({
          success: false,
          error: `Webhook returned ${response.status}`
        });
      }
    } catch (error) {
      clearTimeout(timeout);
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : "Connection failed"
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Connection failed"
    });
  }
}
