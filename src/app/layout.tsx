import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Qualifi — Quiz-Powered Funnels That Qualify, Score & Book Your Best Leads",
  description: "Build quiz-to-calendar booking funnels in 60 seconds. Smart scoring, automatic routing, no code required. Start free.",
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
