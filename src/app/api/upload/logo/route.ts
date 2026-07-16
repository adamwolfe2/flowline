import { NextRequest } from "next/server";
import { handleUpload } from "@/lib/upload";

// Legacy endpoint. Kept as a thin delegate so existing callers (BrandEditor,
// onboarding) keep working unchanged. New code should POST to /api/upload/asset
// with a `kind` field. This route pins kind to 'logo'.
export async function POST(req: NextRequest) {
  return handleUpload(req, "logo");
}
