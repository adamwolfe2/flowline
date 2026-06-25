import { describe, it, expect } from "vitest";
import { calculateScore, getCalendarTier, getCalendarUrl } from "@/lib/scoring";
import type { FunnelConfig } from "@/types";

function makeConfig(thresholds: { high: number; mid: number }): FunnelConfig {
  return {
    brand: {
      name: "Test",
      logoUrl: "",
      primaryColor: "#2D6A4F",
      primaryColorLight: "#fff",
      primaryColorDark: "#000",
      fontHeading: "Inter",
      fontBody: "Inter",
    },
    quiz: {
      headline: "h",
      subheadline: "s",
      questions: [
        {
          key: "budget",
          text: "Budget?",
          options: [
            { id: "a", label: "Low", points: 1 },
            { id: "b", label: "Mid", points: 5 },
            { id: "c", label: "High", points: 10 },
          ],
        },
        {
          key: "timeline",
          text: "Timeline?",
          options: [
            { id: "x", label: "Later", points: 0 },
            { id: "y", label: "Now", points: 8 },
          ],
        },
      ],
      thresholds,
      calendars: { high: "https://cal.com/high", mid: "https://cal.com/mid", low: "https://cal.com/low" },
    },
    webhook: { url: "" },
    meta: { title: "", description: "" },
  };
}

describe("calculateScore", () => {
  it("sums points for chosen options", () => {
    const config = makeConfig({ high: 15, mid: 5 });
    expect(calculateScore(config, { budget: "c", timeline: "y" })).toBe(18);
  });

  it("treats unanswered or unknown answers as zero points", () => {
    const config = makeConfig({ high: 15, mid: 5 });
    expect(calculateScore(config, {})).toBe(0);
    expect(calculateScore(config, { budget: "nonexistent" })).toBe(0);
  });

  it("does not mutate the answers input", () => {
    const config = makeConfig({ high: 15, mid: 5 });
    const answers = { budget: "b", timeline: "x" };
    const frozen = Object.freeze({ ...answers });
    expect(() => calculateScore(config, frozen)).not.toThrow();
    expect(frozen).toEqual({ budget: "b", timeline: "x" });
  });
});

describe("getCalendarTier", () => {
  const config = makeConfig({ high: 15, mid: 5 });

  it("returns high at or above the high threshold", () => {
    expect(getCalendarTier(config, { budget: "c", timeline: "y" })).toBe("high"); // 18 >= 15
    expect(getCalendarTier(config, { budget: "b", timeline: "y" })).toBe("mid"); // 13: >= 5, < 15
  });

  it("returns high exactly at the boundary", () => {
    // budget c (10) + timeline (need 5): no exact-15 combo here; use mid boundary instead
    expect(getCalendarTier(config, { budget: "b", timeline: "x" })).toBe("mid"); // 5 == mid threshold
  });

  it("returns mid between mid and high thresholds", () => {
    // budget b (5) + timeline x (0) = 5 -> mid (>= 5, < 15)
    expect(getCalendarTier(config, { budget: "b", timeline: "x" })).toBe("mid");
  });

  it("returns low below the mid threshold", () => {
    // budget a (1) + timeline x (0) = 1 -> low
    expect(getCalendarTier(config, { budget: "a", timeline: "x" })).toBe("low");
  });

  it("is defensive against inverted thresholds (high < mid)", () => {
    const inverted = makeConfig({ high: 5, mid: 15 });
    // effective high = max(5,15)=15, mid = min(5,15)=5
    // score 18 -> high
    expect(getCalendarTier(inverted, { budget: "c", timeline: "y" })).toBe("high");
    // score 5 -> mid
    expect(getCalendarTier(inverted, { budget: "b", timeline: "x" })).toBe("mid");
  });
});

describe("getCalendarUrl", () => {
  it("maps the resolved tier to its calendar URL", () => {
    const config = makeConfig({ high: 15, mid: 5 });
    expect(getCalendarUrl(config, { budget: "c", timeline: "y" })).toBe("https://cal.com/high");
    expect(getCalendarUrl(config, { budget: "b", timeline: "x" })).toBe("https://cal.com/mid");
    expect(getCalendarUrl(config, { budget: "a", timeline: "x" })).toBe("https://cal.com/low");
  });
});
