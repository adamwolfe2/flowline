"use client";

import { useEffect } from "react";
import { FunnelConfig } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deriveLightColor, deriveDarkColor } from "@/lib/colors";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface BrandEditorProps {
  config: FunnelConfig;
  onSave: (config: FunnelConfig) => void;
}

const FONT_OPTIONS = [
  "Inter", "DM Sans", "Plus Jakarta Sans", "Outfit", "Space Grotesk",
  "Manrope", "Sora", "Urbanist", "Poppins", "Montserrat",
];

export function BrandEditor({ config, onSave }: BrandEditorProps) {
  function updateColor(hex: string) {
    const newConfig = JSON.parse(JSON.stringify(config));
    newConfig.brand.primaryColor = hex;
    newConfig.brand.primaryColorLight = deriveLightColor(hex);
    newConfig.brand.primaryColorDark = deriveDarkColor(hex);
    onSave(newConfig);
  }

  useEffect(() => {
    const fonts = new Set([config.brand.fontHeading, config.brand.fontBody]);
    fonts.forEach((font) => {
      if (!FONT_OPTIONS.includes(font)) return;
      const id = `gfont-${font.replace(/\s+/g, "-")}`;
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, [config.brand.fontHeading, config.brand.fontBody]);

  return (
    <div className="space-y-5">
      <div id="editor-branding">
        <Label className="text-xs text-gray-500 mb-1.5">Business Name</Label>
        <Input
          value={config.brand.name}
          onChange={e => {
            const newConfig = JSON.parse(JSON.stringify(config));
            newConfig.brand.name = e.target.value;
            onSave(newConfig);
          }}
          className="text-sm"
          maxLength={60}
        />
      </div>

      {/* Logo Upload */}
      <div id="editor-logo">
        <Label className="text-xs text-gray-500 mb-1.5">Logo</Label>
        {config.brand.logoUrl ? (
          <div className="flex items-center gap-3 mb-2">
            <img src={config.brand.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-contain border border-[#E5E7EB]" />
            <button
              onClick={() => {
                const newConfig = JSON.parse(JSON.stringify(config));
                newConfig.brand.logoUrl = "";
                onSave(newConfig);
              }}
              className="text-xs text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#E5E7EB] rounded-xl cursor-pointer hover:border-[#2D6A4F] transition-colors bg-[#F9FAFB]">
            <Upload className="w-5 h-5 text-[#9CA3AF] mb-1" />
            <span className="text-xs text-[#9CA3AF]">Click to upload logo</span>
            <span className="text-[10px] text-[#D1D5DB]">PNG, JPG, SVG up to 2MB</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) {
                  toast.error("Logo must be under 2MB");
                  return;
                }
                const formData = new FormData();
                formData.append("file", file);
                try {
                  const res = await fetch("/api/upload/logo", { method: "POST", body: formData });
                  if (!res.ok) {
                    toast.error("Upload failed");
                    return;
                  }
                  const { url } = await res.json();
                  const newConfig = JSON.parse(JSON.stringify(config));
                  newConfig.brand.logoUrl = url;
                  onSave(newConfig);
                  toast.success("Logo uploaded");
                } catch {
                  toast.error("Upload failed");
                }
              }}
            />
          </label>
        )}
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2">Brand Color</Label>
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <input
              type="color"
              value={config.brand.primaryColor}
              onChange={e => updateColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer appearance-none p-0"
              style={{ backgroundColor: config.brand.primaryColor }}
              aria-label="Brand color"
            />
          </div>
          <Input
            value={config.brand.primaryColor}
            onChange={e => {
              const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
              if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                updateColor(v);
              }
            }}
            onBlur={e => {
              const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
              if (/^#[0-9a-fA-F]{6}$/.test(v)) updateColor(v);
            }}
            className="text-sm font-mono w-28"
            placeholder="#2D6A4F"
            maxLength={7}
          />
          <div className="flex gap-1">
            <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: config.brand.primaryColor }} title="Primary" />
            <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: config.brand.primaryColorLight }} title="Light" />
            <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: config.brand.primaryColorDark }} title="Dark" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            "#2D6A4F", "#1B4332", "#0B6E4F", "#0077B6", "#023E8A",
            "#7209B7", "#9B2226", "#DC2626", "#E63946", "#D97706",
            "#F59E0B", "#FBBF24", "#16A34A", "#0D9488", "#6366F1",
            "#8B5CF6", "#EC4899", "#F43F5E", "#1E293B", "#111827",
          ].map(hex => (
            <button
              key={hex}
              type="button"
              onClick={() => updateColor(hex)}
              className={`w-6 h-6 rounded-md border-2 transition-transform hover:scale-110 ${config.brand.primaryColor === hex ? "border-gray-900 scale-110" : "border-transparent"}`}
              style={{ backgroundColor: hex }}
              title={hex}
              aria-label={`Set color to ${hex}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-gray-500 mb-1.5">Heading Font</Label>
          <select
            value={config.brand.fontHeading}
            onChange={e => {
              if (!FONT_OPTIONS.includes(e.target.value)) return;
              const newConfig = JSON.parse(JSON.stringify(config));
              newConfig.brand.fontHeading = e.target.value;
              onSave(newConfig);
            }}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
          >
            {FONT_OPTIONS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1.5">Body Font</Label>
          <select
            value={config.brand.fontBody}
            onChange={e => {
              if (!FONT_OPTIONS.includes(e.target.value)) return;
              const newConfig = JSON.parse(JSON.stringify(config));
              newConfig.brand.fontBody = e.target.value;
              onSave(newConfig);
            }}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
          >
            {FONT_OPTIONS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
          </select>
        </div>
      </div>

      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-[11px] text-gray-500">
          Light and dark variants are auto-derived from your brand color. The preview updates in real time.
        </p>
      </div>
    </div>
  );
}
