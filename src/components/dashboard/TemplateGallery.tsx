"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FUNNEL_TEMPLATES, FunnelTemplate } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutTemplate, Plus, Loader2, X, GraduationCap, Monitor, Megaphone, Home, Dumbbell } from "lucide-react";
import { toast } from "sonner";

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  coaching: GraduationCap,
  "saas-demo": Monitor,
  agency: Megaphone,
  "real-estate": Home,
  fitness: Dumbbell,
};

interface TemplateGalleryProps {
  onCreated?: () => void;
}

export function TemplateGallery({ onCreated }: TemplateGalleryProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  async function createFromTemplate(template: FunnelTemplate) {
    setCreating(template.id);
    try {
      const res = await fetch("/api/funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: template.config,
          slug: `${template.id}-${Math.random().toString(36).slice(2, 6)}`,
        }),
      });

      if (res.ok) {
        const funnel = await res.json();
        toast.success(`Created "${template.name}" funnel`);
        onCreated?.();
        router.push(`/builder/${funnel.id}`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create funnel");
      }
    } catch {
      toast.error("Failed to create funnel");
    }
    setCreating(null);
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
        <LayoutTemplate className="w-4 h-4" />
        Use a Template
      </Button>
    );
  }

  return (
    <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-[#737373]" />
          <h3 className="text-sm font-semibold text-[#333333]">Choose a Template</h3>
        </div>
        <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-md transition-colors" aria-label="Close template gallery">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Blank funnel */}
        <button
          onClick={() => {
            setOpen(false);
            router.push("/onboarding");
          }}
          className="text-left p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#2D6A4F] hover:bg-green-50/30 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
            <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#2D6A4F]" />
          </div>
          <p className="text-sm font-medium text-gray-900">Blank Funnel</p>
          <p className="text-xs text-gray-400 mt-0.5">Start from scratch with AI assistance</p>
        </button>

        {/* Templates */}
        {FUNNEL_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => createFromTemplate(template)}
            disabled={creating !== null}
            className="text-left p-4 border border-gray-100 rounded-xl hover:border-[#2D6A4F] hover:shadow-sm transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-2 mb-3">
              {(() => {
                const Icon = TEMPLATE_ICONS[template.id] || LayoutTemplate;
                return (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${template.config.brand.primaryColor}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: template.config.brand.primaryColor }} />
                  </div>
                );
              })()}
              <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-0.5">
              {creating === template.id ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Creating...
                </span>
              ) : (
                template.name
              )}
            </p>
            <p className="text-xs text-gray-400 line-clamp-2">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
