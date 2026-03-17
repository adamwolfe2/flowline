import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center">
        <Image src="/logo.png" alt="MyVSL" width={32} height={32} className="mx-auto mb-6" />
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
