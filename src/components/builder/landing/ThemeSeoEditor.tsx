"use client";

import type { LandingConfig } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ThemeSeoEditorProps {
  config: LandingConfig;
  onChange: (config: LandingConfig) => void;
}

const BACKGROUND_PRESETS = ["#ffffff", "#FAFAF8", "#F9FAFB", "#F3F4F6", "#0A0A0A"];

const MAX_WIDTHS: readonly LandingConfig["theme"]["maxWidth"][] = ["narrow", "wide"];

const MAX_WIDTH_LABELS: Record<LandingConfig["theme"]["maxWidth"], string> = {
  narrow: "Narrow",
  wide: "Wide",
};

const SEO_TITLE_MAX = 60;
const SEO_DESCRIPTION_MAX = 160;

/** Page-level settings: theme background/width and SEO metadata. */
export function ThemeSeoEditor({ config, onChange }: ThemeSeoEditorProps) {
  const { theme, seo } = config;

  function setBackground(hex: string) {
    onChange({ ...config, theme: { ...theme, background: hex } });
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[10px] text-gray-400">Page Background</Label>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="color"
            value={theme.background}
            onChange={(e) => setBackground(e.target.value)}
            className="w-9 h-9 rounded-lg border border-[#E5E7EB] cursor-pointer appearance-none p-0 flex-shrink-0"
            style={{ backgroundColor: theme.background }}
            aria-label="Page background colour"
          />
          <Input
            value={theme.background}
            onChange={(e) => {
              const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
              if (/^#[0-9a-fA-F]{6}$/.test(v)) setBackground(v);
            }}
            className="text-xs font-mono w-24"
            placeholder="#ffffff"
            maxLength={7}
          />
          <div className="flex gap-1">
            {BACKGROUND_PRESETS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setBackground(hex)}
                className={`w-6 h-6 rounded-md border-2 transition-transform hover:scale-110 ${
                  theme.background.toLowerCase() === hex.toLowerCase()
                    ? "border-gray-900 scale-110"
                    : "border-[#E5E7EB]"
                }`}
                style={{ backgroundColor: hex }}
                title={hex}
                aria-label={`Set background to ${hex}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <Label className="text-[10px] text-gray-400">Content Width</Label>
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          {MAX_WIDTHS.map((width) => (
            <button
              key={width}
              type="button"
              onClick={() => onChange({ ...config, theme: { ...theme, maxWidth: width } })}
              className={`py-2 rounded-md text-xs font-medium border transition-colors ${
                theme.maxWidth === width
                  ? "border-[#0A9AFF] bg-[#E6F4FF] text-[#0883DB]"
                  : "border-[#E5E7EB] bg-white text-gray-600 hover:border-[#0A9AFF]"
              }`}
              aria-pressed={theme.maxWidth === width}
            >
              {MAX_WIDTH_LABELS[width]}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-1 border-t border-[#E5E7EB]">
        <p className="text-[11px] font-medium text-gray-500 mt-3 mb-2">Search & Social</p>
        <div className="space-y-2.5">
          <div>
            <Label className="text-[10px] text-gray-400">Meta Title</Label>
            <Input
              value={seo?.metaTitle ?? ""}
              onChange={(e) =>
                onChange({ ...config, seo: { ...seo, metaTitle: e.target.value } })
              }
              placeholder={config.brand.name}
              className="text-xs mt-1"
              maxLength={SEO_TITLE_MAX}
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {(seo?.metaTitle ?? "").length}/{SEO_TITLE_MAX} — shown as the search result title.
            </p>
          </div>
          <div>
            <Label className="text-[10px] text-gray-400">Meta Description</Label>
            <Textarea
              value={seo?.metaDescription ?? ""}
              onChange={(e) =>
                onChange({ ...config, seo: { ...seo, metaDescription: e.target.value } })
              }
              className="text-xs mt-1 resize-none"
              rows={3}
              maxLength={SEO_DESCRIPTION_MAX}
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {(seo?.metaDescription ?? "").length}/{SEO_DESCRIPTION_MAX}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
