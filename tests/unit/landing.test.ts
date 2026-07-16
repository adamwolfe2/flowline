import { describe, it, expect } from "vitest";
import {
  extractLandingFields,
  extractLandingEmail,
  validateLandingConfig,
  isLanding,
  getLandingCalendarUrl,
} from "@/lib/landing";
import type { LandingConfig, AnyFunnelConfig } from "@/types";

function makeLandingConfig(overrides: Partial<LandingConfig> = {}): LandingConfig {
  return {
    type: "landing",
    brand: {
      name: "Test Co",
      logoUrl: "",
      primaryColor: "#0A9AFF",
      primaryColorLight: "#fff",
      primaryColorDark: "#000",
      fontHeading: "Inter",
      fontBody: "Inter",
    },
    webhook: { url: "" },
    meta: { title: "t", description: "d" },
    theme: { background: "#ffffff", maxWidth: "narrow", font: "inherit-from-brand" },
    blocks: [],
    ...overrides,
  };
}

describe("extractLandingFields", () => {
  it("keeps name and phone", () => {
    expect(extractLandingFields({ name: "Ada", phone: "555-0100" })).toEqual({
      name: "Ada",
      phone: "555-0100",
    });
  });

  it("drops email — it lives on its own lead column, not in answers", () => {
    expect(extractLandingFields({ name: "Ada", email: "a@b.com" })).toEqual({ name: "Ada" });
  });

  it("drops unknown keys so a client cannot inject data into the lead", () => {
    expect(
      extractLandingFields({ name: "Ada", isAdmin: "true", score: "999" })
    ).toEqual({ name: "Ada" });
  });

  it("drops non-string and empty values", () => {
    expect(extractLandingFields({ name: "", phone: 42 })).toEqual({});
  });

  it("trims whitespace", () => {
    expect(extractLandingFields({ name: "  Ada  " })).toEqual({ name: "Ada" });
  });

  it("caps field length at 200 chars (storage-abuse guard)", () => {
    const long = "x".repeat(5000);
    const out = extractLandingFields({ name: long });
    expect(out.name).toHaveLength(200);
  });

  it("returns {} for non-object input", () => {
    expect(extractLandingFields(null)).toEqual({});
    expect(extractLandingFields(undefined)).toEqual({});
    expect(extractLandingFields("nope")).toEqual({});
    expect(extractLandingFields(["a"])).toEqual({});
  });
});

describe("extractLandingEmail", () => {
  it("reads and trims the email", () => {
    expect(extractLandingEmail({ email: "  a@b.com " })).toBe("a@b.com");
  });

  it("returns undefined when absent or not a string", () => {
    expect(extractLandingEmail({})).toBeUndefined();
    expect(extractLandingEmail({ email: 5 })).toBeUndefined();
    expect(extractLandingEmail(null)).toBeUndefined();
  });
});

describe("validateLandingConfig", () => {
  it("accepts a well-formed config", () => {
    expect(validateLandingConfig(makeLandingConfig())).toBeNull();
  });

  it("rejects a quiz config", () => {
    expect(validateLandingConfig({ type: "quiz" })).toMatch(/type must be 'landing'/);
  });

  it("rejects duplicate block ids", () => {
    const config = makeLandingConfig({
      blocks: [
        { id: "dup", type: "divider", props: { size: "md" } },
        { id: "dup", type: "spacer", props: { size: "md" } },
      ],
    });
    expect(validateLandingConfig(config)).toMatch(/Duplicate block id: dup/);
  });

  it("rejects a block with no id", () => {
    const config = makeLandingConfig({
      blocks: [{ type: "divider", props: { size: "md" } } as never],
    });
    expect(validateLandingConfig(config)).toMatch(/non-empty id/);
  });

  it("rejects missing blocks array / theme / brand", () => {
    expect(validateLandingConfig({ type: "landing" })).toMatch(/brand/);
    expect(
      validateLandingConfig({ type: "landing", brand: {}, blocks: "no" })
    ).toMatch(/blocks array/);
    expect(
      validateLandingConfig({ type: "landing", brand: {}, blocks: [] })
    ).toMatch(/theme/);
  });

  it("rejects non-objects", () => {
    expect(validateLandingConfig(null)).toMatch(/must be an object/);
  });

  it("accepts a booking_form that collects email", () => {
    const config = makeLandingConfig({
      blocks: [
        { id: "bf", type: "booking_form", props: { fields: ["email", "name"] } } as never,
      ],
    });
    expect(validateLandingConfig(config)).toBeNull();
  });

  it("rejects a booking_form with empty/missing fields (renderer would crash on fields.map)", () => {
    const config = makeLandingConfig({
      blocks: [{ id: "bf", type: "booking_form", props: {} } as never],
    });
    expect(validateLandingConfig(config)).toMatch(/at least one field/);
  });

  it("rejects a booking_form that does not collect email (submit would 400)", () => {
    const config = makeLandingConfig({
      blocks: [
        { id: "bf", type: "booking_form", props: { fields: ["name", "phone"] } } as never,
      ],
    });
    expect(validateLandingConfig(config)).toMatch(/must collect an email/);
  });

  it("rejects a booking_form with an unknown field name", () => {
    const config = makeLandingConfig({
      blocks: [
        { id: "bf", type: "booking_form", props: { fields: ["email", "ssn"] } } as never,
      ],
    });
    expect(validateLandingConfig(config)).toMatch(/must be name, email, or phone/);
  });

  it("accepts a calendar with a valid gate value", () => {
    const config = makeLandingConfig({
      blocks: [
        {
          id: "cal",
          type: "calendar",
          props: { url: "https://cal.com/x", provider: "cal", gate: "blur_overlay" },
        } as never,
      ],
    });
    expect(validateLandingConfig(config)).toBeNull();
  });

  it("accepts a calendar with no gate (legacy rows default to ungated)", () => {
    const config = makeLandingConfig({
      blocks: [
        { id: "cal", type: "calendar", props: { url: "https://cal.com/x", provider: "cal" } } as never,
      ],
    });
    expect(validateLandingConfig(config)).toBeNull();
  });

  it("rejects a calendar with an unknown gate value", () => {
    const config = makeLandingConfig({
      blocks: [
        {
          id: "cal",
          type: "calendar",
          props: { url: "https://cal.com/x", provider: "cal", gate: "paywall" },
        } as never,
      ],
    });
    expect(validateLandingConfig(config)).toMatch(/gate must be 'none' or 'blur_overlay'/);
  });
});

describe("isLanding", () => {
  it("narrows on the type discriminator", () => {
    expect(isLanding(makeLandingConfig())).toBe(true);
  });

  it("treats a legacy config with no type as a quiz", () => {
    // Pre-landing rows have no `type` key at all.
    const legacy = { brand: {}, quiz: {}, webhook: {}, meta: {} } as unknown as AnyFunnelConfig;
    expect(isLanding(legacy)).toBe(false);
  });
});

describe("getLandingCalendarUrl", () => {
  it("returns the single calendar url", () => {
    const config = makeLandingConfig({
      blocks: [
        { id: "h", type: "hero", props: { headline: "hi" } },
        { id: "c", type: "calendar", props: { url: "https://cal.com/x", provider: "cal" } },
      ],
    });
    expect(getLandingCalendarUrl(config)).toBe("https://cal.com/x");
  });

  it("returns undefined when there is no calendar block", () => {
    expect(getLandingCalendarUrl(makeLandingConfig())).toBeUndefined();
  });

  it("returns undefined when the calendar url is blank", () => {
    const config = makeLandingConfig({
      blocks: [{ id: "c", type: "calendar", props: { url: "", provider: "cal" } }],
    });
    expect(getLandingCalendarUrl(config)).toBeUndefined();
  });
});
