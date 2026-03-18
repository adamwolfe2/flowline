import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Admin | MyVSL",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
