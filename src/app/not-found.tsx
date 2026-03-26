import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-[#2D6A4F]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-bold text-[#2D6A4F]">404</span>
        </div>
        <h1
          className="text-3xl font-bold text-[#111827] mb-3"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}
        >
          Page not found
        </h1>
        <p className="text-[#6B7280] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-sm font-medium hover:bg-[#245840] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#333333] hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-10">
          Need help?{" "}
          <a href="mailto:support@getmyvsl.com" className="text-[#2D6A4F] hover:underline">
            support@getmyvsl.com
          </a>
        </p>
      </div>
    </div>
  );
}
