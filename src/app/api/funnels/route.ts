import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { DEFAULT_FUNNEL_CONFIG } from "@/lib/default-config";
import { generateSlug } from "@/lib/utils";
import { deriveLightColor, deriveDarkColor } from "@/lib/colors";

export async function GET() {
  const funnels = store.getFunnels(store.DEMO_USER_ID);
  const funnelsWithStats = funnels.map(f => ({
    ...f,
    stats: store.getStats(f.id),
  }));
  return NextResponse.json(funnelsWithStats);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { config, slug: rawSlug } = body;

  const slug = rawSlug || generateSlug(config?.brand?.name || "my-funnel");

  if (!store.isSlugAvailable(slug)) {
    return NextResponse.json({ error: "Slug is already taken" }, { status: 409 });
  }

  // Auto-derive light/dark colors if only primaryColor is provided
  const finalConfig = {
    ...DEFAULT_FUNNEL_CONFIG,
    ...config,
    brand: {
      ...DEFAULT_FUNNEL_CONFIG.brand,
      ...(config?.brand || {}),
      primaryColorLight: config?.brand?.primaryColorLight || deriveLightColor(config?.brand?.primaryColor || "#2563EB"),
      primaryColorDark: config?.brand?.primaryColorDark || deriveDarkColor(config?.brand?.primaryColor || "#2563EB"),
    },
  };

  const funnel = store.createFunnel(store.DEMO_USER_ID, finalConfig, slug);
  return NextResponse.json(funnel, { status: 201 });
}
