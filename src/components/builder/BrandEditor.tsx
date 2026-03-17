"use client";

import { FunnelConfig } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deriveLightColor, deriveDarkColor } from "@/lib/colors";

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

  return (
    <div className="space-y-5">
      <div>
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

      <div>
        <Label className="text-xs text-gray-500 mb-1.5">Logo URL</Label>
        <Input
          value={config.brand.logoUrl}
          onChange={e => {
            const newConfig = JSON.parse(JSON.stringify(config));
            newConfig.brand.logoUrl = e.target.value;
            onSave(newConfig);
          }}
          placeholder="https://... or /logo.svg"
          className="text-sm"
        />
        <p className="text-[11px] text-gray-400 mt-1">Paste a public URL to your logo image. File upload coming soon.</p>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-2">Brand Color</Label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={config.brand.primaryColor}
              onChange={e => updateColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer appearance-none p-0"
              style={{ backgroundColor: config.brand.primaryColor }}
            />
          </div>
          <Input
            value={config.brand.primaryColor}
            onChange={e => {
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                updateColor(e.target.value);
              }
            }}
            className="text-sm font-mono w-28"
            maxLength={7}
          />
          <div className="flex gap-1">
            <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: config.brand.primaryColor }} title="Primary" />
            <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: config.brand.primaryColorLight }} title="Light" />
            <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: config.brand.primaryColorDark }} title="Dark" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-gray-500 mb-1.5">Heading Font</Label>
          <select
            value={config.brand.fontHeading}
            onChange={e => {
              const newConfig = JSON.parse(JSON.stringify(config));
              newConfig.brand.fontHeading = e.target.value;
              onSave(newConfig);
            }}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
          >
            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1.5">Body Font</Label>
          <select
            value={config.brand.fontBody}
            onChange={e => {
              const newConfig = JSON.parse(JSON.stringify(config));
              newConfig.brand.fontBody = e.target.value;
              onSave(newConfig);
            }}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
          >
            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
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
