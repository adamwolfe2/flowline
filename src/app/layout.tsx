import type { Metadata } from "next";
import { Inter, Instrument_Sans, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { WorkspaceWrapper } from "@/components/WorkspaceWrapper";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", weight: ["400", "500", "600"], display: "swap" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument-serif", weight: "400", style: ["normal", "italic"], display: "swap" });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta", weight: ["500", "600", "700", "800"], display: "swap" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getmyvsl.com";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "MyVSL | AI Funnel Builder That Books Calls",
  description: "Build AI-powered quiz-to-calendar booking funnels in minutes. No code required.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "MyVSL | AI Funnel Builder That Books Calls",
    description: "Three questions. Smart scoring. Automatic calendar routing.",
    url: appUrl,
    images: [{ url: `${appUrl}/og.jpg`, width: 1200, height: 630 }],
    type: "website",
    siteName: "MyVSL",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyVSL | AI Funnel Builder That Books Calls",
    description: "Build quiz-to-calendar booking funnels in minutes.",
    images: [`${appUrl}/og.jpg`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="light">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://clerk.com" />
          <link rel="dns-prefetch" href="https://api.clerk.com" />
        </head>
        <body className={`${inter.className} ${instrumentSans.variable} ${instrumentSerif.variable} ${plusJakarta.variable} antialiased bg-white text-gray-900`}>
          <WorkspaceWrapper>
            {children}
          </WorkspaceWrapper>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
