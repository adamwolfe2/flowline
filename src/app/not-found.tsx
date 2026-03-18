import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <Image src="/logo.png" alt="MyVSL" width={32} height={32} className="mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-[#111827] mb-2">404</h1>
        <p className="text-[#6B7280] mb-6">This page doesn&apos;t exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#2D6A4F] text-white text-sm font-medium hover:bg-[#245840] transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 rounded-lg border border-[#EBEBEB] text-sm text-[#333333] hover:bg-gray-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-8">
          Need help? <a href="mailto:support@getmyvsl.com" className="text-[#2D6A4F] hover:underline">support@getmyvsl.com</a>
        </p>
      </div>
    </div>
  );
}
