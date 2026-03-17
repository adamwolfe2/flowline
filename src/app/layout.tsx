import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flowline — Build VSL Funnels in Minutes",
  description: "Create AI-powered quiz-to-calendar booking funnels. No code required.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="light">
        <body className={`${inter.className} antialiased bg-white text-gray-900`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
