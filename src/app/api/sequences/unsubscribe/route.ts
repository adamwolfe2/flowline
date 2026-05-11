import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sequenceEnrollments } from "@/db/schema";
import { eq } from "drizzle-orm";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(htmlPage("Invalid Link", "No unsubscribe token provided."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Validate UUID shape so we return a clean 404 instead of a Postgres
  // "invalid input syntax for type uuid" 500 on malformed tokens.
  if (!UUID_REGEX.test(token)) {
    return new NextResponse(htmlPage("Not Found", "This unsubscribe link is no longer valid."), {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const [enrollment] = await db.select()
      .from(sequenceEnrollments)
      .where(eq(sequenceEnrollments.id, token));

    if (!enrollment) {
      return new NextResponse(htmlPage("Not Found", "This unsubscribe link is no longer valid."), {
        status: 404,
        headers: { "Content-Type": "text/html" },
      });
    }

    if (enrollment.status === "completed") {
      return new NextResponse(htmlPage("Already Unsubscribed", "You have already been unsubscribed from this email sequence."), {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }

    await db.update(sequenceEnrollments)
      .set({ status: "completed", completedAt: new Date() })
      .where(eq(sequenceEnrollments.id, token));

    return new NextResponse(htmlPage("Unsubscribed", "You have been successfully unsubscribed. You will no longer receive emails from this sequence."), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch {
    return new NextResponse(htmlPage("Error", "Something went wrong. Please try again later."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - MyVSL</title>
</head>
<body style="margin:0;padding:60px 20px;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;">
  <div style="max-width:400px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e5e7eb;">
    <h1 style="font-size:20px;color:#111827;margin:0 0 12px 0;">${title}</h1>
    <p style="font-size:14px;color:#6b7280;margin:0;line-height:1.6;">${message}</p>
  </div>
</body>
</html>`;
}
