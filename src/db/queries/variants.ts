import { db } from "@/db";
import { funnelVariants, variantAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getActiveVariants(funnelId: string) {
  return db.select().from(funnelVariants)
    .where(and(eq(funnelVariants.funnelId, funnelId), eq(funnelVariants.active, true)));
}

export function selectVariant(variants: Array<{ id: string; trafficWeight: number; config: unknown }>) {
  if (variants.length === 0) return null;

  const totalWeight = variants.reduce((sum, v) => sum + v.trafficWeight, 0);
  let random = Math.random() * totalWeight;

  for (const variant of variants) {
    random -= variant.trafficWeight;
    if (random <= 0) return variant;
  }

  return variants[variants.length - 1];
}

export async function recordAssignment(sessionId: string, funnelId: string, variantId: string) {
  try {
    await db.insert(variantAssignments).values({ sessionId, funnelId, variantId });
  } catch {
    // Non-critical — don't block funnel rendering
  }
}
