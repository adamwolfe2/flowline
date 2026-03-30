import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin | MyVSL",
  description: "MyVSL admin dashboard.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId || !(await isSuperAdmin(userId))) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="bg-white border-b border-[#EBEBEB] px-6 h-12 flex items-center gap-3">
        <Link href="/dashboard" className="text-xs text-[#737373] hover:text-[#333333] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>
        <div className="h-4 w-px bg-[#EBEBEB]" />
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span className="text-sm font-semibold text-[#333333]">Admin</span>
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
