import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const funnel = store.updateFunnel(id, {
    published: true,
    published_at: new Date().toISOString(),
  });
  if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(funnel);
}
