import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com https://va.vercel-scripts.com https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.getmyvsl.com https://connect.facebook.net https://www.facebook.com https://analytics.tiktok.com https://www.googletagmanager.com https://www.google-analytics.com https://t.meetcursive.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.getmyvsl.com; font-src 'self' https://fonts.gstatic.com https://*.clerk.com https://clerk.getmyvsl.com; img-src 'self' https: data:; connect-src 'self' https: wss:; frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.getmyvsl.com; frame-ancestors 'self'; worker-src 'self' blob:",
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
        ],
      },
    ];
  },
};

export default nextConfig;
