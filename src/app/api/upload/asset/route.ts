import { NextRequest } from "next/server";
import { handleUpload } from "@/lib/upload";

// Generalized upload endpoint. The multipart body may include a `kind` field
// ('logo' | 'image'); it defaults to 'image'. Each kind has its own MIME
// allowlist, size ceiling, and blob path prefix (see @/lib/upload).
export async function POST(req: NextRequest) {
  return handleUpload(req, "image");
}
