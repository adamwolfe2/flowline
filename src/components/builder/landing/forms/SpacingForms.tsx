"use client";

import type { SpacingProps } from "@/types";
import { Label } from "@/components/ui/label";

/**
 * Shared size control for the two structural blocks (divider, spacer).
 *
 * Deliberately a *field*, not a whole block form: `divider` and `spacer` share
 * `SpacingProps`, and spreading their union would widen `type`/`props` apart.
 * Keeping the reconstruction in the (already narrowed) dispatcher means no cast
 * is needed anywhere.
 */

type SpacingSize = SpacingProps["size"];

const SIZES: readonly SpacingSize[] = ["sm", "md", "lg"];

const SIZE_LABELS: Record<SpacingSize, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
};

interface SpacingSizeFieldProps {
  value: SpacingSize;
  onChange: (size: SpacingSize) => void;
  helpText: string;
}

export function SpacingSizeField({ value, onChange, helpText }: SpacingSizeFieldProps) {
  return (
    <div>
      <Label className="text-[10px] text-gray-400">Size</Label>
      <div className="grid grid-cols-3 gap-1.5 mt-1">
        {SIZES.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            className={`py-2 rounded-md text-xs font-medium border transition-colors ${
              value === size
                ? "border-[#0A9AFF] bg-[#E6F4FF] text-[#0883DB]"
                : "border-[#E5E7EB] bg-white text-gray-600 hover:border-[#0A9AFF]"
            }`}
            aria-pressed={value === size}
          >
            {SIZE_LABELS[size]}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5">{helpText}</p>
    </div>
  );
}
