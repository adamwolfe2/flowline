import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyVSL — AI Funnel Builder That Books Calls",
  description: "Build AI-powered quiz-to-calendar booking funnels in minutes. No code required.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  metadataBase: new URL("https://getmyvsl.com"),
  openGraph: {
    title: "MyVSL — Your VSL Funnel. Built in 60 Seconds.",
    description: "Describe your product in one sentence. AI generates the questions, scoring, and booking flow. You're live in minutes.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
    siteName: "MyVSL",
    url: "https://getmyvsl.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyVSL — Your VSL Funnel. Built in 60 Seconds.",
    description: "Describe your product in one sentence. AI generates the questions, scoring, and booking flow. You're live in minutes.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="light">
        <head>
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        </head>
        <body className={`${inter.className} antialiased bg-white text-gray-900`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
