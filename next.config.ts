import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), accelerometer=(), gyroscope=(), magnetometer=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com https://va.vercel-scripts.com https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.getmyvsl.com https://connect.facebook.net https://www.facebook.com https://analytics.tiktok.com https://www.googletagmanager.com https://www.google-analytics.com https://t.meetcursive.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.getmyvsl.com; font-src 'self' https://fonts.gstatic.com https://*.clerk.com https://clerk.getmyvsl.com; img-src 'self' https: data:; connect-src 'self' https: wss:; frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.getmyvsl.com; frame-ancestors 'self'; worker-src 'self' blob:",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|png|webp|avif|woff2|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/f/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com https://va.vercel-scripts.com https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.getmyvsl.com https://connect.facebook.net https://www.facebook.com https://analytics.tiktok.com https://www.googletagmanager.com https://www.google-analytics.com https://t.meetcursive.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.getmyvsl.com; font-src 'self' https://fonts.gstatic.com https://*.clerk.com https://clerk.getmyvsl.com; img-src 'self' https: data:; connect-src 'self' https: wss:; frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.getmyvsl.com; frame-ancestors *; worker-src 'self' blob:",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
