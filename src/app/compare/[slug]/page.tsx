import { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { ComparisonPage } from "@/components/marketing/ComparisonPage";
import { getCompetitorBySlug, getAllSlugs } from "@/app/compare/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getCompetitorBySlug(slug);
  if (!data) return {};

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical: `${appUrl}/compare/${data.slug}`,
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: `${appUrl}/compare/${data.slug}`,
      type: "website",
      siteName: "MyVSL",
    },
    twitter: {
      card: "summary_large_image",
      title: data.metaTitle,
      description: data.metaDescription,
    },
  };
}

export default async function CompareSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const data = getCompetitorBySlug(slug);
  if (!data) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.metaTitle,
    description: data.metaDescription,
    url: `${appUrl}/compare/${data.slug}`,
    mainEntity: {
      "@type": "Article",
      headline: data.tagline,
      description: data.heroDescription,
      author: {
        "@type": "Organization",
        name: "MyVSL",
        url: appUrl,
      },
      publisher: {
        "@type": "Organization",
        name: "MyVSL",
        url: appUrl,
        logo: {
          "@type": "ImageObject",
          url: `${appUrl}/logo.png`,
        },
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: appUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Compare",
          item: `${appUrl}/compare`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `MyVSL vs ${data.name}`,
          item: `${appUrl}/compare/${data.slug}`,
        },
      ],
    },
  };

  return (
    <div className="bg-white min-h-screen flex flex-col" style={{ fontFamily: "var(--font-instrument-sans)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingNav />
      <div className="flex-1">
        <ComparisonPage data={data} />
      </div>
      <MarketingFooter />
    </div>
  );
}
