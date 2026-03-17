import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyVSL — AI Funnel Builder That Books Calls",
  description: "Build AI-powered quiz-to-calendar booking funnels in minutes. No code required.",
  openGraph: {
    title: "MyVSL — AI Funnel Builder That Books Calls",
    description: "Three questions. Smart scoring. Automatic calendar routing.",
    images: [{ url: "/api/og?title=MyVSL&description=AI-powered+funnel+builder+that+books+calls", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyVSL — AI Funnel Builder That Books Calls",
    description: "Build quiz-to-calendar booking funnels in minutes.",
    images: ["/api/og?title=MyVSL&description=AI-powered+funnel+builder+that+books+calls"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="light">
        <body className={`${inter.className} antialiased bg-white text-gray-900`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
