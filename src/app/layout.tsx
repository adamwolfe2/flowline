import type { Metadata } from "next";
import { Inter, Instrument_Sans, Instrument_Serif } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", weight: ["400", "500", "600", "700"] });
const instrumentSerif = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument-serif", weight: "400", style: ["normal", "italic"] });

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
    images: [{ url: `${appUrl}/og.png`, width: 1200, height: 630 }],
    type: "website",
    siteName: "MyVSL",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyVSL | AI Funnel Builder That Books Calls",
    description: "Build quiz-to-calendar booking funnels in minutes.",
    images: [`${appUrl}/og.png`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="light">
        <head>
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        </head>
        <body className={`${inter.className} ${instrumentSans.variable} ${instrumentSerif.variable} antialiased bg-white text-gray-900`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
