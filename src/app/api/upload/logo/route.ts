import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { uploadLimiter, checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    // Allow unauthenticated uploads (onboarding flow) — rate limit by IP instead
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";
    const identifier = userId || ip;
    const { limited } = await checkRateLimit(uploadLimiter, identifier, 10);
    if (limited) {
      return NextResponse.json({ error: "Upload limit reached. Try again later." }, { status: 429 });
    }

    const uploaderId = userId || `anon-${ip.replace(/[.:]/g, "-")}`;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "File upload is not configured. Contact support." }, { status: 503 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const ALLOWED_TYPES: Record<string, string> = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/svg+xml": "svg",
      "image/x-icon": "ico",
      "image/vnd.microsoft.icon": "ico",
    };

    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      return NextResponse.json({ error: "Supported formats: PNG, JPG, SVG, GIF, WebP" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 2MB" }, { status: 400 });
    }

    const filename = `logos/${uploaderId}-${Date.now()}.${ext}`;
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    logger.error("POST /api/upload/logo error:", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
