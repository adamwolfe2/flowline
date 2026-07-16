import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { aiLimiter, checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { makeBlockId } from "@/lib/landing-defaults";
import type { LandingBlock } from "@/types";
import { z } from "zod";

/**
 * AI generation for the LANDING page funnel type.
 *
 * Mirrors /api/ai/generate (the quiz path): same auth, same aiLimiter, same
 * gpt-4o model, same zod validation, same SILENT mock fallback (HTTP 200) when
 * the key is missing or the model output is unusable.
 *
 * Returns CONTENT ONLY — `{ blocks }`. Brand, theme, calendar URLs and the real
 * video URL are layered on in the builder, exactly as the quiz route omits
 * calendars/colors/logo.
 */

// The model is NOT trusted to produce block ids — ids are generated server-side
// with makeBlockId() so they are always unique and well-formed.
const aiHeroSchema = z.object({
  type: z.literal("hero"),
  props: z.object({
    eyebrow: z.string().optional(),
    headline: z.string().min(1),
    highlightText: z.string().optional(),
    subheadline: z.string().optional(),
    ctaLabel: z.string().optional(),
    note: z.string().optional(),
  }),
});

const aiTextSchema = z.object({
  type: z.literal("text"),
  props: z.object({
    heading: z.string().optional(),
    body: z.string().min(1),
  }),
});

// Video is always a placeholder: whatever the model returns for props is
// discarded in favour of the empty-url placeholder below.
const aiVideoSchema = z.object({
  type: z.literal("video"),
  props: z.object({}).loose().optional(),
});

const aiTestimonialSchema = z.object({
  type: z.literal("testimonial"),
  props: z.object({
    quote: z.string().min(1),
    author: z.string().min(1),
    role: z.string().optional(),
  }),
});

const aiBookingFormSchema = z.object({
  type: z.literal("booking_form"),
  props: z.object({
    fields: z.array(z.enum(["name", "email", "phone"])).min(1),
    submitLabel: z.string().min(1),
    successMessage: z.string().min(1),
  }),
});

const aiBlockSchema = z.discriminatedUnion("type", [
  aiHeroSchema,
  aiTextSchema,
  aiVideoSchema,
  aiTestimonialSchema,
  aiBookingFormSchema,
]);

const aiOutputSchema = z.object({
  blocks: z
    .array(aiBlockSchema)
    .min(1)
    .refine((blocks) => blocks.some((b) => b.type === "hero"), {
      message: "blocks must include a hero",
    }),
});

type AiBlock = z.infer<typeof aiBlockSchema>;

/** The video block the AI path always emits: a placeholder, never a real URL. */
function placeholderVideoBlock(): LandingBlock {
  return {
    id: makeBlockId(),
    type: "video",
    props: {
      provider: "youtube",
      url: "",
      autoplay: false,
      aspectRatio: "16:9",
    },
  };
}

/**
 * Attaches server-generated ids to the model's blocks and normalizes the props
 * the model is not trusted with (video url, booking-form success mode).
 * Also wires the hero CTA to scroll to the booking form when both exist.
 */
type BookingField = "name" | "email" | "phone";

/**
 * Ensures a booking form always collects `email` (required by /api/submit).
 * Returns the accepted fields in a fixed canonical order (email, name, phone),
 * with unknown values dropped and duplicates removed.
 */
function normalizeBookingFields(fields: readonly string[]): BookingField[] {
  const allowed: BookingField[] = ["email", "name", "phone"];
  const present = new Set(fields.filter((f): f is BookingField => (allowed as string[]).includes(f)));
  present.add("email");
  return allowed.filter((f) => present.has(f));
}

function materializeBlocks(aiBlocks: AiBlock[]): LandingBlock[] {
  const blocks: LandingBlock[] = aiBlocks.map((block): LandingBlock => {
    switch (block.type) {
      case "hero":
        return {
          id: makeBlockId(),
          type: "hero",
          props: {
            eyebrow: block.props.eyebrow,
            headline: block.props.headline,
            highlightText: block.props.highlightText,
            subheadline: block.props.subheadline,
            ctaLabel: block.props.ctaLabel,
            note: block.props.note,
          },
        };
      case "text":
        return {
          id: makeBlockId(),
          type: "text",
          props: { heading: block.props.heading, body: block.props.body },
        };
      case "video":
        return placeholderVideoBlock();
      case "testimonial":
        return {
          id: makeBlockId(),
          type: "testimonial",
          props: {
            quote: block.props.quote,
            author: block.props.author,
            role: block.props.role,
          },
        };
      case "booking_form":
        return {
          id: makeBlockId(),
          type: "booking_form",
          props: {
            // `email` is required by the submit endpoint; the AI schema only
            // enforces .min(1), so guarantee email is present (first) and
            // dedupe. Without this, a name/phone-only form 400s every visitor.
            fields: normalizeBookingFields(block.props.fields),
            submitLabel: block.props.submitLabel,
            // successMode is forced: 'show_calendar' would need a calendar
            // block id, and the AI path never emits calendars.
            successMode: "message",
            successMessage: block.props.successMessage,
          },
        };
      default: {
        const exhaustive: never = block;
        throw new Error(`Unknown AI block: ${JSON.stringify(exhaustive)}`);
      }
    }
  });

  // Point the hero CTA at the booking form so the generated page works on load.
  const bookingForm = blocks.find((b) => b.type === "booking_form");
  if (!bookingForm) return blocks;
  return blocks.map((b) =>
    b.type === "hero"
      ? { ...b, props: { ...b.props, ctaTargetBlockId: bookingForm.id } }
      : b
  );
}

function buildSystemPrompt(context?: {
  businessType?: string;
  targetAudience?: string;
  offering?: string;
}) {
  const base = `You are a direct-response landing page copywriter. Given a business description, output ONLY valid JSON matching this landing-page block schema. Produce a hero (headline outcome-focused, subheadline who-it's-for), one text block of supporting copy, a video block placeholder, a testimonial, and a booking_form block. Do not include calendar URLs, brand colors, or logo.`;

  const contextBlock = context?.businessType
    ? `\n\nYou are building a landing page for a "${context.businessType}" business${context.targetAudience ? ` that serves "${context.targetAudience}"` : ""}.${context.offering ? `\nTheir offer: "${context.offering}".` : ""}\n\nWrite copy specifically tailored to this business and audience.`
    : "";

  return `${base}${contextBlock}

Return ONLY valid JSON matching this exact schema:
{
  "blocks": [
    {
      "type": "hero",
      "props": {
        "eyebrow": "string, optional short badge naming the audience, max 6 words",
        "headline": "string, outcome-focused, max 12 words",
        "highlightText": "string, optional — an exact substring of the headline to accent, max 4 words",
        "subheadline": "string, clarifies who this is for, max 20 words",
        "ctaLabel": "string, max 5 words",
        "note": "string, optional reassurance line under the button, max 15 words"
      }
    },
    {
      "type": "text",
      "props": {
        "heading": "string, short section heading",
        "body": "string, 2-3 short paragraphs of supporting copy, markdown allowed"
      }
    },
    { "type": "video", "props": {} },
    {
      "type": "testimonial",
      "props": {
        "quote": "string, specific and believable, max 40 words",
        "author": "string, plausible full name",
        "role": "string, job title and company"
      }
    },
    {
      "type": "booking_form",
      "props": {
        "fields": ["name", "email"],
        "submitLabel": "string, max 5 words",
        "successMessage": "string, confirms the next step"
      }
    }
  ]
}

Return the blocks in that order. Do NOT invent block "id" values, calendar URLs, video URLs, image URLs, colors, or a logo. The video block is a placeholder and takes no props. Do not use em dashes in any generated text. Return JSON only, no markdown, no backticks.`;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  // Rate limit: by userId if authenticated, by IP if not
  const identifier = userId || req.headers.get("x-forwarded-for") || "anonymous";
  const { limited } = await checkRateLimit(aiLimiter, identifier);
  if (limited) {
    return NextResponse.json({ error: "AI generation limit reached. Try again later." }, { status: 429 });
  }

  const body = await req.json();
  const { prompt, context } = body as {
    prompt: string;
    context?: { businessType?: string; targetAudience?: string; offering?: string };
  };

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0 || prompt.length > 2000) {
    return NextResponse.json({ error: "Prompt must be 1-2000 characters" }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(context);

  // Build a richer user message when context is available
  const userMessage = context
    ? `${prompt}\n\nAdditional context:\n- Business type: ${context.businessType || "Not specified"}\n- Target audience: ${context.targetAudience || "Not specified"}\n- Offering: ${context.offering || "Not specified"}`
    : prompt;

  // If OpenAI key is available, use it
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        logger.error("AI landing response was not valid JSON", { content: content?.slice(0, 200) });
        parsed = null;
      }

      if (parsed) {
        const validated = aiOutputSchema.safeParse(parsed);
        if (validated.success) {
          return NextResponse.json({ blocks: materializeBlocks(validated.data.blocks) });
        }
        logger.error("AI landing response failed schema validation", {
          errors: validated.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
        });
        // Fall through to mock
      }
    } catch (error) {
      logger.error("AI generate-landing OpenAI request failed", { error: error instanceof Error ? error.message : String(error) });
      // Fall through to mock
    }
  }

  // Mock/fallback response
  logger.warn("AI landing generation falling back to mock response");
  const mockBlocks: AiBlock[] = [
    {
      type: "hero",
      props: {
        headline: "Book More Qualified Calls Without Chasing Leads",
        subheadline: "For founders and agency owners doing $10k+ per month who want a predictable pipeline.",
        ctaLabel: "Book My Call",
      },
    },
    {
      type: "text",
      props: {
        heading: "Why most funnels leak",
        body: "Most teams pour traffic into a page that asks for a meeting before it earns one. The result is a calendar full of people who were never going to buy.\n\nWe flip the order. The page does the qualifying first, so the only calls that land on your calendar are the ones worth taking.\n\nNo new ad spend. No new tools. Just the same traffic, converted properly.",
      },
    },
    { type: "video", props: {} },
    {
      type: "testimonial",
      props: {
        quote: "We cut our no-show rate in half and doubled closed revenue in one quarter, from the exact same ad budget.",
        author: "Marcus Reed",
        role: "Founder, Northline Growth",
      },
    },
    {
      type: "booking_form",
      props: {
        fields: ["name", "email"],
        submitLabel: "Book My Call",
        successMessage: "You're in. Check your inbox for the confirmation and next steps.",
      },
    },
  ];

  return NextResponse.json({ blocks: materializeBlocks(mockBlocks) });
}
