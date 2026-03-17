import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-[#2D6A4F] rounded-xl flex items-center justify-center mx-auto mb-6">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <h1
          className="text-4xl font-bold text-[#111827] mb-2"
          style={{ fontFamily: "var(--font-lora, serif)" }}
        >
          404
        </h1>
        <p className="text-[#6B7280] mb-6">This page doesn&apos;t exist.</p>
        <Link
          href="/"
          className="text-sm text-[#2D6A4F] hover:underline"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
