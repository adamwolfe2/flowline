import { describe, it, expect } from "vitest";
import { calculateFunnelHealth } from "@/lib/funnel-health";
import type { BrandConfig, FunnelConfig, LandingConfig } from "@/types";

const brand: BrandConfig = {
  name: "Test Co",
  logoUrl: "",
  primaryColor: "#0A9AFF",
  primaryColorLight: "#fff",
  primaryColorDark: "#000",
  fontHeading: "Inter",
  fontBody: "Inter",
};

function makeLanding(overrides: Partial<LandingConfig> = {}): LandingConfig {
  return {
    type: "landing",
    brand: { ...brand },
    webhook: { url: "" },
    meta: { title: "t", description: "d" },
    theme: { background: "#ffffff", maxWidth: "narrow", font: "inherit-from-brand" },
    blocks: [],
    ...overrides,
  };
}

function makeQuiz(overrides: Partial<FunnelConfig["quiz"]> = {}): FunnelConfig {
  return {
    brand: { ...brand },
    webhook: { url: "" },
    meta: { title: "t", description: "d" },
    quiz: {
      headline: "",
      subheadline: "",
      questions: [],
      thresholds: { high: 7, mid: 4 },
      calendars: { high: "", mid: "", low: "" },
      ...overrides,
    },
  };
}

const ids = (config: Parameters<typeof calculateFunnelHealth>[0], published = false, domain: string | null = null, plan?: "free" | "pro" | "agency") =>
  calculateFunnelHealth(config, published, domain, plan ? { plan } : undefined).checks.map((c) => c.id);

describe("calculateFunnelHealth — landing rules", () => {
  it("selects the landing rule set for a landing config", () => {
    expect(ids(makeLanding())).toEqual([
      "hero-headline",
      "booking",
      "logo",
      "color",
      "published",
    ]);
  });

  it("scores an empty landing page at 0", () => {
    expect(calculateFunnelHealth(makeLanding(), false, null).score).toBe(0);
  });

  it("passes hero-headline only when a hero block has a headline", () => {
    const withEmptyHero = makeLanding({
      blocks: [{ id: "h", type: "hero", props: { headline: "  " } }],
    });
    const withHero = makeLanding({
      blocks: [{ id: "h", type: "hero", props: { headline: "Book a call" } }],
    });
    const passed = (c: LandingConfig) =>
      calculateFunnelHealth(c, false, null).checks.find((x) => x.id === "hero-headline")!.passed;

    expect(passed(withEmptyHero)).toBe(false);
    expect(passed(withHero)).toBe(true);
  });

  it("accepts either a booking_form or a calendar block as the booking surface", () => {
    const booking = (c: LandingConfig) =>
      calculateFunnelHealth(c, false, null).checks.find((x) => x.id === "booking")!.passed;

    expect(
      booking(
        makeLanding({
          blocks: [
            {
              id: "b",
              type: "booking_form",
              props: { fields: ["email"], submitLabel: "Go", successMode: "message" },
            },
          ],
        })
      )
    ).toBe(true);

    expect(
      booking(
        makeLanding({
          blocks: [{ id: "c", type: "calendar", props: { url: "https://cal.com/x", provider: "cal" } }],
        })
      )
    ).toBe(true);

    expect(booking(makeLanding({ blocks: [{ id: "t", type: "text", props: { body: "hi" } }] }))).toBe(false);
  });

  it("counts a hero logo as the logo check", () => {
    const config = makeLanding({
      blocks: [{ id: "h", type: "hero", props: { headline: "x", logoUrl: "https://cdn/logo.png" } }],
    });
    expect(calculateFunnelHealth(config, false, null).checks.find((c) => c.id === "logo")!.passed).toBe(true);
  });

  it("omits the custom-domain check on free, includes it on pro/agency", () => {
    expect(ids(makeLanding(), false, null, "free")).not.toContain("domain");
    expect(ids(makeLanding(), false, null, "pro")).toContain("domain");
    expect(ids(makeLanding(), false, null, "agency")).toContain("domain");
  });

  it("lets a fully-configured free landing page reach 100 without a domain", () => {
    const config = makeLanding({
      brand: { ...brand, logoUrl: "https://cdn/logo.png", primaryColor: "#FF0000" },
      blocks: [
        { id: "h", type: "hero", props: { headline: "Book a call" } },
        { id: "c", type: "calendar", props: { url: "https://cal.com/x", provider: "cal" } },
      ],
    });
    expect(calculateFunnelHealth(config, true, null, { plan: "free" }).score).toBe(100);
  });

  it("caps a pro landing page below 100 until the domain is connected", () => {
    const config = makeLanding({
      brand: { ...brand, logoUrl: "https://cdn/logo.png", primaryColor: "#FF0000" },
      blocks: [
        { id: "h", type: "hero", props: { headline: "Book a call" } },
        { id: "c", type: "calendar", props: { url: "https://cal.com/x", provider: "cal" } },
      ],
    });
    expect(calculateFunnelHealth(config, true, null, { plan: "pro" }).score).toBe(90);
    expect(calculateFunnelHealth(config, true, "go.acme.com", { plan: "pro" }).score).toBe(100);
  });

  it("honours the type column over the config shape", () => {
    // Legacy quiz row: no `config.type`, column says quiz -> quiz rules.
    expect(ids(makeQuiz(), false, null)).toContain("questions");
    expect(
      calculateFunnelHealth(makeQuiz(), false, null, { type: "quiz" }).checks.map((c) => c.id)
    ).toContain("questions");
  });
});

describe("calculateFunnelHealth — quiz rules unchanged", () => {
  it("keeps the original quiz check set and weights", () => {
    const health = calculateFunnelHealth(makeQuiz(), false, null);
    expect(health.checks.map((c) => c.id)).toEqual([
      "headline",
      "questions",
      "options",
      "logo",
      "color",
      "calendar",
      "trust",
      "email",
      "published",
      "domain",
    ]);
    expect(health.checks.reduce((s, c) => s + c.points, 0)).toBe(100);
  });

  it("shows the domain check to quiz funnels on every plan", () => {
    expect(ids(makeQuiz(), false, null, "free")).toContain("domain");
  });

  it("scores a fully-configured quiz funnel at 100", () => {
    const config = makeQuiz({
      headline: "Do you qualify?",
      questions: [
        { key: "q1", text: "a", options: [{ id: "1", label: "x", points: 1 }, { id: "2", label: "y", points: 2 }] },
        { key: "q2", text: "b", options: [{ id: "1", label: "x", points: 1 }, { id: "2", label: "y", points: 2 }] },
        { key: "q3", text: "c", options: [{ id: "1", label: "x", points: 1 }, { id: "2", label: "y", points: 2 }] },
      ],
      calendars: { high: "https://cal.com/h", mid: "", low: "" },
      trustBadges: ["500+ clients", "", ""],
      emailHeadline: "One last step",
    });
    config.brand.logoUrl = "https://cdn/logo.png";
    config.brand.primaryColor = "#FF0000";

    expect(calculateFunnelHealth(config, true, "go.acme.com").score).toBe(100);
  });

  it("bands the score into the expected labels", () => {
    expect(calculateFunnelHealth(makeQuiz(), false, null).label).toBe("Needs work");
  });
});
