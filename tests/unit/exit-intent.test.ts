import { describe, it, expect } from "vitest";
import {
  isExitIntentEnabled,
  resolveExitIntentCopy,
  canFireExitIntent,
  type ExitIntentGuardState,
} from "@/lib/exit-intent";

describe("isExitIntentEnabled", () => {
  it("is on by default when the config is absent (legacy rows)", () => {
    expect(isExitIntentEnabled({ exitIntent: undefined })).toBe(true);
  });

  it("is on when the object exists without an explicit enabled:false", () => {
    expect(isExitIntentEnabled({ exitIntent: {} })).toBe(true);
    expect(isExitIntentEnabled({ exitIntent: { enabled: true } })).toBe(true);
    expect(isExitIntentEnabled({ exitIntent: { title: "x" } })).toBe(true);
  });

  it("is off only when explicitly disabled", () => {
    expect(isExitIntentEnabled({ exitIntent: { enabled: false } })).toBe(false);
  });
});

describe("resolveExitIntentCopy", () => {
  it("falls back to the spot-held defaults", () => {
    const copy = resolveExitIntentCopy(undefined);
    expect(copy.title).toMatch(/spot/i);
    expect(copy.body).toMatch(/held/i);
    expect(copy.ctaLabel).toMatch(/spot/i);
  });

  it("prefers non-blank author overrides", () => {
    const copy = resolveExitIntentCopy({ title: "Custom", body: "  ", ctaLabel: "Go" });
    expect(copy.title).toBe("Custom");
    // blank/whitespace override is ignored, default kept
    expect(copy.body).toMatch(/held/i);
    expect(copy.ctaLabel).toBe("Go");
  });
});

describe("canFireExitIntent", () => {
  const base: ExitIntentGuardState = {
    enabled: true,
    hasConverted: false,
    alreadyShown: false,
    isEmbed: false,
    isPreview: false,
  };

  it("fires when everything is clear", () => {
    expect(canFireExitIntent(base)).toBe(true);
  });

  it("is blocked by each guard independently", () => {
    expect(canFireExitIntent({ ...base, enabled: false })).toBe(false);
    expect(canFireExitIntent({ ...base, hasConverted: true })).toBe(false);
    expect(canFireExitIntent({ ...base, alreadyShown: true })).toBe(false);
    expect(canFireExitIntent({ ...base, isEmbed: true })).toBe(false);
    expect(canFireExitIntent({ ...base, isPreview: true })).toBe(false);
  });
});
