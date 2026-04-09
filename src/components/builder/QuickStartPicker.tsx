"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Briefcase,
  ShoppingBag,
  ChevronRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { TEMPLATE_META, type TemplateMeta } from "@/lib/funnel-templates";

type Industry = "coaching" | "agency" | "ecommerce";

interface IndustryCard {
  id: Industry;
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const INDUSTRIES: IndustryCard[] = [
  {
    id: "coaching",
    label: "Coaching",
    description: "1:1 coaching, group programs, masterminds",
    Icon: GraduationCap,
  },
  {
    id: "agency",
    label: "Agency",
    description: "Marketing, creative, consulting agencies",
    Icon: Briefcase,
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    description: "Physical products, DTC brands, online stores",
    Icon: ShoppingBag,
  },
];

const ARCHETYPE_LABELS: Record<string, string> = {
  "lead-gen": "Lead Gen Quiz",
  webinar: "Webinar Funnel",
  vsl: "VSL Funnel",
};

interface FormState {
  businessName: string;
  tagline: string;
  primaryColor: string;
}

export default function QuickStartPicker() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateMeta | null>(null);
  const [form, setForm] = useState<FormState>({
    businessName: "",
    tagline: "",
    primaryColor: "#2D6A4F",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const filteredTemplates = selectedIndustry
    ? TEMPLATE_META.filter((t) => t.industry === selectedIndustry)
    : [];

  function handleIndustrySelect(industry: Industry) {
    setSelectedIndustry(industry);
    setStep(2);
  }

  function handleTemplateSelect(template: TemplateMeta) {
    setSelectedTemplate(template);
    setStep(3);
  }

  function validateForm(): boolean {
    const newErrors: Partial<FormState> = {};
    if (form.businessName.trim().length < 2) {
      newErrors.businessName = "Business name must be at least 2 characters.";
    }
    if (form.tagline.trim().length < 5) {
      newErrors.tagline = "Tagline must be at least 5 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm() || !selectedTemplate) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/funnels/from-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          businessName: form.businessName.trim(),
          tagline: form.tagline.trim(),
          industry: selectedTemplate.industry,
          primaryColor: form.primaryColor,
        }),
      });

      if (res.status === 429) {
        toast.error("You've reached the limit for funnel creation. Please try again later.");
        return;
      }

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to create funnel");
      }

      const data = await res.json() as { funnelId: string; slug: string };
      toast.success("Funnel created from template.");
      router.push(`/builder/${data.funnelId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 flex-1 flex flex-col">
      {/* Step 1: Industry Picker */}
      {step === 1 && (
        <>
          <p className="text-sm text-[#6B7280] mb-5">
            Choose your industry to see the best funnel templates for your business.
          </p>
          <div className="space-y-3">
            {INDUSTRIES.map(({ id, label, description, Icon }) => (
              <button
                key={id}
                onClick={() => handleIndustrySelect(id)}
                className="w-full text-left flex items-center gap-4 px-4 py-4 rounded-xl border border-[#E5E7EB] hover:border-[#2D6A4F] hover:bg-[#F9FAFB] transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#2D6A4F]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2D6A4F]/15 transition-colors">
                  <Icon className="w-5 h-5 text-[#2D6A4F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827]">{label}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#2D6A4F] transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 2: Template Picker */}
      {step === 2 && selectedIndustry && (
        <>
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to industries
          </button>
          <p className="text-sm text-[#6B7280] mb-5">
            Pick the funnel type that best matches your goal.
          </p>
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="w-full text-left flex items-center gap-4 px-4 py-4 rounded-xl border border-[#E5E7EB] hover:border-[#2D6A4F] hover:bg-[#F9FAFB] transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#2D6A4F]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2D6A4F]/15 transition-colors">
                  <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-wide">
                    {ARCHETYPE_LABELS[template.archetype]?.split(" ")[0] ?? ""}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111827]">
                    {ARCHETYPE_LABELS[template.archetype] ?? template.archetype}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{template.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#2D6A4F] transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step 3: Customization Form */}
      {step === 3 && selectedTemplate && (
        <>
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#111827] transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to templates
          </button>

          <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg mb-5">
            <span className="text-xs font-medium text-[#166534]">
              {selectedTemplate.name}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">
                Business Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.businessName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, businessName: e.target.value }))
                }
                placeholder="e.g. Wolfe Coaching"
                className={`text-sm ${errors.businessName ? "border-red-400 focus:border-red-400" : ""}`}
              />
              {errors.businessName && (
                <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">
                Tagline <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.tagline}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tagline: e.target.value }))
                }
                placeholder="e.g. Helping founders scale to $1M ARR"
                className={`text-sm ${errors.tagline ? "border-red-400 focus:border-red-400" : ""}`}
              />
              {errors.tagline && (
                <p className="text-xs text-red-500 mt-1">{errors.tagline}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">
                Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, primaryColor: e.target.value }))
                  }
                  className="w-10 h-10 rounded-lg border border-[#E5E7EB] cursor-pointer p-0.5 bg-white"
                />
                <span className="text-sm font-mono text-[#6B7280]">{form.primaryColor}</span>
              </div>
            </div>

            <div className="mt-auto pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#2D6A4F] hover:bg-[#245840] text-white font-semibold text-sm py-3 rounded-xl transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating funnel...
                  </span>
                ) : (
                  "Create Funnel from Template"
                )}
              </Button>
              <p className="text-[10px] text-[#9CA3AF] text-center mt-2">
                You can customize everything in the builder after creation.
              </p>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
