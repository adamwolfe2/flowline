import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Image src="/logo.png" alt="MyVSL" width={32} height={32} className="mb-6" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No funnels yet</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        Create your first AI-powered booking funnel in under 5 minutes. No code required.
      </p>
      <Link href="/onboarding">
        <Button className="gap-2">
          Create Your First Funnel
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}
