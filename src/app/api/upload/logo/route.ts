import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { uploadLimiter, checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { limited } = await checkRateLimit(uploadLimiter, userId, 10);
    if (limited) {
      return NextResponse.json({ error: "Upload limit reached. Try again later." }, { status: 429 });
    }

    const uploaderId = userId;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "File upload is not configured. Contact support." }, { status: 503 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Images only" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 2MB" }, { status: 400 });
    }

    const ext = file.type.split("/")[1] || "png";
    const filename = `logos/${uploaderId}-${Date.now()}.${ext}`;
    const blob = await put(filename, file, { access: "public" });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("POST /api/upload/logo error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
