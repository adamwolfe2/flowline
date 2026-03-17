import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
        <Zap className="w-8 h-8 text-gray-400" />
      </div>
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
