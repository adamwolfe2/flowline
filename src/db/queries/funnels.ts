import { db } from '@/db';
import { funnels } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import type { NewFunnel } from '@/db/schema';

export async function getFunnelsByUser(userId: string) {
  return db.select().from(funnels).where(eq(funnels.userId, userId));
}

export async function getFunnelById(id: string, userId?: string) {
  if (userId) {
    const result = await db.select().from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.userId, userId)));
    return result[0] ?? null;
  }
  const result = await db.select().from(funnels).where(eq(funnels.id, id));
  return result[0] ?? null;
}

export async function getFunnelBySlug(slug: string) {
  const result = await db.select().from(funnels)
    .where(and(eq(funnels.slug, slug), eq(funnels.published, true)));
  return result[0] ?? null;
}

export async function getFunnelByIdForPreview(id: string) {
  const result = await db.select().from(funnels).where(eq(funnels.id, id));
  return result[0] ?? null;
}

export async function getFunnelByCustomDomain(domain: string) {
  const result = await db.select().from(funnels)
    .where(and(eq(funnels.customDomain, domain), eq(funnels.published, true)));
  return result[0] ?? null;
}

export async function createFunnel(data: NewFunnel) {
  const result = await db.insert(funnels).values(data).returning();
  return result[0];
}

export async function updateFunnelConfig(id: string, userId: string, config: unknown) {
  const result = await db.update(funnels)
    .set({ config, updatedAt: new Date() })
    .where(and(eq(funnels.id, id), eq(funnels.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function updateFunnel(id: string, userId: string, data: Partial<typeof funnels.$inferInsert>) {
  const result = await db.update(funnels)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(funnels.id, id), eq(funnels.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function publishFunnel(id: string, userId: string) {
  const result = await db.update(funnels)
    .set({ published: true, publishedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(funnels.id, id), eq(funnels.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function unpublishFunnel(id: string, userId: string) {
  const result = await db.update(funnels)
    .set({ published: false, updatedAt: new Date() })
    .where(and(eq(funnels.id, id), eq(funnels.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteFunnel(id: string, userId: string) {
  await db.delete(funnels).where(and(eq(funnels.id, id), eq(funnels.userId, userId)));
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  const result = await db.select({ id: funnels.id }).from(funnels).where(eq(funnels.slug, slug));
  return result.length === 0;
}

export async function getFunnelCount(userId: string): Promise<number> {
  const result = await db.select().from(funnels).where(eq(funnels.userId, userId));
  return result.length;
}
