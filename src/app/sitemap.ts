import { MetadataRoute } from "next";
import { db } from "@/db";
import { funnels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAllSlugs } from "@/app/compare/data";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const comparisonPages: MetadataRoute.Sitemap = getAllSlugs().map((slug) => ({
    url: `${BASE_URL}/compare/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/build`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    ...comparisonPages,
  ];

  try {
    const publishedFunnels = await db
      .select({ slug: funnels.slug, updatedAt: funnels.updatedAt })
      .from(funnels)
      .where(eq(funnels.published, true));

    const funnelPages: MetadataRoute.Sitemap = publishedFunnels.map((f) => ({
      url: `${BASE_URL}/f/${f.slug}`,
      lastModified: f.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...funnelPages];
  } catch {
    return staticPages;
  }
}
