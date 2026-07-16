import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { uploadLimiter, checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

/**
 * Shared upload handler backing both `/api/upload/logo` (legacy) and
 * `/api/upload/asset` (generalized). Kinds differ only in their allowed MIME
 * types, size ceiling, and blob path prefix.
 */

type UploadKind = "logo" | "image";

interface KindConfig {
  allowed: Record<string, string>;
  maxBytes: number;
  prefix: string;
  errorMsg: string;
}

const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

const KIND_CONFIG: Record<UploadKind, KindConfig> = {
  // Logos keep SVG/ICO for back-compat (favicons, vector logos). SVG is a
  // stored-XSS vector when served with its own content-type, so it is NOT
  // allowed for general content images below.
  logo: {
    allowed: {
      ...IMAGE_TYPES,
      "image/svg+xml": "svg",
      "image/x-icon": "ico",
      "image/vnd.microsoft.icon": "ico",
    },
    maxBytes: 2 * 1024 * 1024,
    prefix: "logos",
    errorMsg: "Supported formats: PNG, JPG, SVG, GIF, WebP, ICO",
  },
  // Content images for landing blocks. No SVG (XSS), larger ceiling for photos.
  image: {
    allowed: IMAGE_TYPES,
    maxBytes: 5 * 1024 * 1024,
    prefix: "assets",
    errorMsg: "Supported formats: PNG, JPG, GIF, WebP",
  },
};

function isUploadKind(value: unknown): value is UploadKind {
  return value === "logo" || value === "image";
}

/**
 * Handles a multipart upload. `defaultKind` is used when the request does not
 * specify one (the legacy logo route pins it to 'logo').
 */
export async function handleUpload(
  req: NextRequest,
  defaultKind: UploadKind = "image"
): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    // Allow unauthenticated uploads (onboarding flow) — rate limit by IP instead.
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
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // `kind` comes off an allowlist — never interpolated into the blob path raw.
    const rawKind = formData.get("kind");
    const kind: UploadKind = isUploadKind(rawKind) ? rawKind : defaultKind;
    const config = KIND_CONFIG[kind];

    const ext = config.allowed[file.type];
    if (!ext) {
      return NextResponse.json({ error: config.errorMsg }, { status: 400 });
    }
    if (file.size > config.maxBytes) {
      const mb = Math.round(config.maxBytes / (1024 * 1024));
      return NextResponse.json({ error: `Max ${mb}MB` }, { status: 400 });
    }

    const filename = `${config.prefix}/${uploaderId}-${Date.now()}.${ext}`;
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    logger.error("upload error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
