import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

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

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload),
    });

    if (response.ok) {
      return NextResponse.json({ success: true, status: response.status });
    } else {
      return NextResponse.json({
        success: false,
        error: `Webhook returned ${response.status}`
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Connection failed"
    });
  }
}
