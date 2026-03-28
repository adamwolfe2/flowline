"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { FUNNEL_TEMPLATES, FunnelTemplate } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutTemplate, Plus, Loader2, X, GraduationCap, Monitor, Megaphone, Home, Dumbbell, ArrowLeft, ArrowRight, MessageSquare, Target } from "lucide-react";
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

export interface TemplateGalleryRef {
  open: () => void;
}

export const TemplateGallery = forwardRef<TemplateGalleryRef, TemplateGalleryProps>(function TemplateGallery({ onCreated }, ref) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<FunnelTemplate | null>(null);

  useImperativeHandle(ref, () => ({ open: () => setOpen(true) }), []);

  async function createFromTemplate(template: FunnelTemplate) {
    setCreating(template.id);
    try {
      const res = await fetch("/api/funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          slug: `${template.id}-${Math.random().toString(36).slice(2, 6)}`,
        }),
      });

      if (res.ok) {
        const funnel = await res.json();
        toast.success(`Created "${template.name}" funnel`);
        onCreated?.();
        router.push(`/builder/${funnel.id}`);
      } else if (res.status === 403) {
        toast.error("Free plan is limited to 1 funnel. Upgrade to Pro for unlimited funnels.", {
          action: { label: "Upgrade", onClick: () => router.push("/pricing") },
          duration: 6000,
        });
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

  // Template preview detail view
  if (previewing) {
    const Icon = TEMPLATE_ICONS[previewing.id] || LayoutTemplate;
    const questions = previewing.config.quiz.questions || [];
    const thresholds = previewing.config.quiz.thresholds;

    return (
      <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setPreviewing(null)}
            className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to templates
          </button>
          <button onClick={() => { setOpen(false); setPreviewing(null); }} className="p-1 hover:bg-gray-100 rounded-md transition-colors" aria-label="Close">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${previewing.config.brand.primaryColor}15` }}
              >
                <Icon className="w-5 h-5" style={{ color: previewing.config.brand.primaryColor }} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#111827]">{previewing.name}</h3>
                <Badge variant="secondary" className="text-[10px]">{previewing.category}</Badge>
              </div>
            </div>
            <p className="text-sm text-[#6B7280] mb-4">{previewing.description}</p>

            {/* Headline preview */}
            <div className="bg-[#F9FAFB] rounded-lg p-4 mb-4">
              <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">Headline</p>
              <p className="text-sm font-medium text-[#111827]">{previewing.config.quiz.headline}</p>
              {previewing.config.quiz.subheadline && (
                <p className="text-xs text-[#6B7280] mt-1">{previewing.config.quiz.subheadline}</p>
              )}
            </div>

            {/* Score thresholds */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span className="text-xs text-[#6B7280]">High: {thresholds.high}+</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#D97706]" />
                <span className="text-xs text-[#6B7280]">Mid: {thresholds.mid}+</span>
              </div>
            </div>

            <Button
              onClick={() => createFromTemplate(previewing)}
              disabled={creating !== null}
              className="gap-2 bg-[#2D6A4F] hover:bg-[#245840] text-white"
            >
              {creating === previewing.id ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...</>
              ) : (
                <>Use this template <ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </Button>
          </div>

          {/* Right: Questions preview */}
          <div>
            <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              {questions.length} Questions
            </p>
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={q.key} className="bg-[#F9FAFB] rounded-lg p-3">
                  <p className="text-xs font-medium text-[#111827] mb-2">
                    <span className="text-[#9CA3AF] mr-1.5">Q{i + 1}.</span>
                    {q.text}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {q.options.map((opt) => (
                      <span
                        key={opt.id}
                        className="text-[10px] px-2 py-0.5 rounded-full border border-[#E5E7EB] text-[#6B7280] bg-white"
                      >
                        {opt.label}
                        <span className="text-[#9CA3AF] ml-1">+{opt.points}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
            router.push("/build");
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
          <div
            key={template.id}
            className="text-left p-4 border border-gray-100 rounded-xl hover:border-[#2D6A4F] hover:shadow-sm transition-all disabled:opacity-50 group"
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
            <p className="text-sm font-medium text-gray-900 mb-0.5">{template.name}</p>
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">{template.description}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewing(template)}
                className="text-[11px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                Preview
              </button>
              <span className="text-gray-200">|</span>
              <button
                onClick={() => createFromTemplate(template)}
                disabled={creating !== null}
                className="text-[11px] font-medium text-[#2D6A4F] hover:underline transition-colors disabled:opacity-50"
              >
                {creating === template.id ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "Use template"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
