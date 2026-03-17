import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const funnel = store.getFunnel(id);
  if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stats = store.getStats(id);
  const leads = store.getLeads(id);
  return NextResponse.json({ ...funnel, stats, leads });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const funnel = store.updateFunnel(id, body);
  if (!funnel) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(funnel);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = store.deleteFunnel(id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
