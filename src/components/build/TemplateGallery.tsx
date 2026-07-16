"use client";

import { Loader2 } from "lucide-react";
import { LANDING_TEMPLATES, type LandingTemplate } from "@/lib/landing-templates";

interface TemplateGalleryProps {
  /** Called with the chosen template id. */
  onSelect: (templateId: string) => void;
  /** Id of the template currently being created (shows a spinner), if any. */
  pendingId?: string | null;
  /** Disables all cards while a create is in flight. */
  disabled?: boolean;
}

/** A tiny schematic of the template's layout, drawn from its block types. */
function TemplateThumb({ template }: { template: LandingTemplate }) {
  const types = template.buildBlocks().map((b) => b.type);
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 space-y-1.5">
      {types.map((type, i) => {
        if (type === "hero") {
          return (
            <div key={i} className="space-y-1">
              <div className="h-1.5 w-1/3 rounded-full bg-[#0A9AFF]/40 mx-auto" />
              <div className="h-2 w-3/4 rounded bg-[#0A0A0A]/70 mx-auto" />
              <div className="h-1 w-1/2 rounded bg-[#9CA3AF]/60 mx-auto" />
            </div>
          );
        }
        if (type === "video") {
          return (
            <div key={i} className="aspect-[16/7] w-full rounded bg-[#111827]/80 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white/90" />
            </div>
          );
        }
        if (type === "booking_form") {
          return (
            <div key={i} className="space-y-1 rounded border border-[#E5E7EB] bg-white p-1.5">
              <div className="h-2 w-full rounded bg-[#F3F4F6]" />
              <div className="h-2 w-full rounded bg-[#F3F4F6]" />
              <div className="h-2.5 w-full rounded bg-[#0A9AFF]" />
            </div>
          );
        }
        if (type === "calendar") {
          return <div key={i} className="h-6 w-full rounded bg-[#E6F4FF] border border-[#0A9AFF]/20" />;
        }
        // text and everything else
        return (
          <div key={i} className="space-y-1">
            <div className="h-1.5 w-2/3 rounded bg-[#9CA3AF]/50" />
            <div className="h-1.5 w-full rounded bg-[#E5E7EB]" />
            <div className="h-1.5 w-5/6 rounded bg-[#E5E7EB]" />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Grid of ready-made landing templates. Picking one creates a funnel seeded
 * with that template's blocks and hands off to the builder — no AI call.
 */
export function TemplateGallery({ onSelect, pendingId, disabled }: TemplateGalleryProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LANDING_TEMPLATES.map((template) => {
          const isPending = pendingId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              disabled={disabled}
              aria-busy={isPending}
              className="group text-left rounded-xl border-2 border-gray-100 p-3 transition-all hover:border-[#0A9AFF] hover:bg-[#F5FBFF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <TemplateThumb template={template} />
              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{template.name}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                    {template.description}
                  </p>
                </div>
                {isPending && (
                  <Loader2 className="w-4 h-4 text-[#0A9AFF] animate-spin flex-shrink-0 mt-0.5" aria-hidden="true" />
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
