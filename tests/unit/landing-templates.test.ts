import { describe, it, expect } from "vitest";
import { LANDING_TEMPLATES, getLandingTemplate } from "@/lib/landing-templates";
import { buildLandingConfig } from "@/components/build/buildLandingConfig";
import { validateLandingConfig } from "@/lib/landing";
import type { LandingBlock } from "@/types";

function idsOf(blocks: LandingBlock[]): Set<string> {
  return new Set(blocks.map((b) => b.id));
}

describe("LANDING_TEMPLATES", () => {
  it("exposes at least the four core archetypes with unique ids", () => {
    const ids = LANDING_TEMPLATES.map((t) => t.id);
    expect(ids).toContain("live-demo-booking");
    expect(ids).toContain("book-a-call");
    expect(ids).toContain("lead-magnet");
    expect(ids).toContain("webinar-registration");
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const template of LANDING_TEMPLATES) {
    describe(template.name, () => {
      const blocks = template.buildBlocks();

      it("assembles into a config that passes validateLandingConfig", () => {
        const config = buildLandingConfig({ description: "Acme demo", blocks });
        expect(validateLandingConfig(config)).toBeNull();
      });

      it("has exactly one hero", () => {
        expect(blocks.filter((b) => b.type === "hero")).toHaveLength(1);
      });

      it("never ships a testimonial (no fabricated reviews)", () => {
        expect(blocks.some((b) => b.type === "testimonial")).toBe(false);
      });

      it("has unique block ids", () => {
        expect(idsOf(blocks).size).toBe(blocks.length);
      });

      it("has a booking form that collects email", () => {
        const forms = blocks.filter((b) => b.type === "booking_form");
        expect(forms.length).toBeGreaterThan(0);
        for (const form of forms) {
          if (form.type !== "booking_form") continue;
          expect(form.props.fields).toContain("email");
        }
      });

      it("resolves every cross-block reference", () => {
        const ids = idsOf(blocks);
        for (const block of blocks) {
          if (block.type === "hero") {
            if (block.props.ctaTargetBlockId) expect(ids.has(block.props.ctaTargetBlockId)).toBe(true);
            if (block.props.secondaryCtaTargetBlockId)
              expect(ids.has(block.props.secondaryCtaTargetBlockId)).toBe(true);
          }
          if (block.type === "booking_form" && block.props.successCalendarBlockId) {
            expect(ids.has(block.props.successCalendarBlockId)).toBe(true);
          }
        }
      });

      it("only highlights text that actually appears in the headline", () => {
        for (const block of blocks) {
          if (block.type !== "hero" || !block.props.highlightText) continue;
          expect(block.props.headline).toContain(block.props.highlightText);
        }
      });

      it("only reveals a calendar when a calendar block exists", () => {
        const hasCalendar = blocks.some((b) => b.type === "calendar");
        const revealsCalendar = blocks.some(
          (b) => b.type === "booking_form" && b.props.successMode === "show_calendar"
        );
        if (revealsCalendar) expect(hasCalendar).toBe(true);
      });
    });
  }
});

describe("getLandingTemplate", () => {
  it("returns a known template", () => {
    expect(getLandingTemplate("book-a-call")?.name).toBe("Book a Call");
  });
  it("returns undefined for an unknown id", () => {
    expect(getLandingTemplate("nope")).toBeUndefined();
  });
});
