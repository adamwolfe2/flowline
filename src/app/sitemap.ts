import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://getmyvsl.com", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://getmyvsl.com/pricing", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://getmyvsl.com/terms", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://getmyvsl.com/privacy", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
