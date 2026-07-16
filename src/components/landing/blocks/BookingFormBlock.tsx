"use client";

import { useCallback, useMemo, useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import type { BookingFormField, LandingBlock } from "@/types";
import { logger } from "@/lib/logger";
import { useLandingInteractive } from "../LandingInteractive";
import { trackLandingEvents } from "../trackLandingEvents";
import { safeHttpUrl } from "./url";

type BookingFormBlockData = Extract<LandingBlock, { type: "booking_form" }>;

interface BookingFormBlockProps {
  block: BookingFormBlockData;
  funnelId: string;
  sessionId: string;
}

type Status = "idle" | "submitting" | "success" | "redirecting";

const FIELD_META: Record<
  BookingFormField,
  { label: string; type: string; autoComplete: string; inputMode?: "text" | "email" | "tel" }
> = {
  name: { label: "Name", type: "text", autoComplete: "name", inputMode: "text" },
  email: { label: "Email", type: "email", autoComplete: "email", inputMode: "email" },
  phone: { label: "Phone", type: "tel", autoComplete: "tel", inputMode: "tel" },
};

// Deliberately permissive: the server is the authority on validity. This only
// catches obvious typos before a round-trip.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_VALUES: Record<BookingFormField, string> = { name: "", email: "", phone: "" };

export function BookingFormBlock({ block, funnelId, sessionId }: BookingFormBlockProps) {
  const { submitLabel, successMode, successCalendarBlockId, successMessage, redirectUrl } =
    block.props;
  // Defensive: a malformed config (empty/undefined fields) must not crash the
  // public renderer via `fields.map`. Fall back to an email-only form — the one
  // field the submit endpoint requires. validateLandingConfig also rejects this
  // upstream, but the renderer stays crash-proof regardless.
  const fields: BookingFormField[] = useMemo(
    () =>
      Array.isArray(block.props.fields) && block.props.fields.length > 0
        ? block.props.fields
        : ["email"],
    [block.props.fields]
  );
  const { revealBlock, trackEvent } = useLandingInteractive();
  const fieldFocusSent = useRef(false);
  const handleFieldFocus = useCallback(() => {
    // "Booking form starts" analytics stage: fire field_focused once per mount.
    if (fieldFocusSent.current) return;
    fieldFocusSent.current = true;
    trackEvent("field_focused", block.id);
  }, [trackEvent, block.id]);

  const [values, setValues] = useState<Record<BookingFormField, string>>(EMPTY_VALUES);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const setField = useCallback((field: BookingFormField, value: string) => {
    // New object per keystroke — never mutate the previous state value.
    setValues((previous) => ({ ...previous, [field]: value }));
  }, []);

  const validate = useCallback((): string | null => {
    for (const field of fields) {
      const value = values[field].trim();
      if (!value) return `Please enter your ${FIELD_META[field].label.toLowerCase()}.`;
      if (field === "email" && !EMAIL_RE.test(value)) return "Please enter a valid email address.";
    }
    return null;
  }, [fields, values]);

  /** Runs the configured post-submit behaviour. Exhaustive over successMode. */
  const applySuccessMode = useCallback(() => {
    switch (successMode) {
      case "show_calendar": {
        if (successCalendarBlockId) {
          // Reveals the target CalendarBlock and scrolls to it once mounted.
          revealBlock(successCalendarBlockId);
        } else {
          logger.error("[landing] show_calendar success mode has no successCalendarBlockId", {
            funnelId,
            blockId: block.id,
          });
        }
        setStatus("success");
        return;
      }
      case "message": {
        setStatus("success");
        return;
      }
      case "redirect": {
        // Never hand an unvalidated string to location.assign — an author-set
        // `javascript:` URL would otherwise execute on the visitor's page.
        const destination = safeHttpUrl(redirectUrl);
        if (!destination) {
          logger.error("[landing] redirect success mode has an invalid redirectUrl", {
            funnelId,
            blockId: block.id,
          });
          // The lead is already captured; degrade to a confirmation instead of
          // stranding the visitor on a form that looks like it failed.
          setStatus("success");
          return;
        }
        setStatus("redirecting");
        window.location.assign(destination);
        return;
      }
      default: {
        const _never: never = successMode;
        void _never;
        setStatus("success");
      }
    }
  }, [successMode, successCalendarBlockId, redirectUrl, revealBlock, funnelId, block.id]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (status === "submitting" || status === "redirecting") return;

      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setStatus("submitting");

      // Send only the fields this block is configured to collect.
      const payloadFields: Record<string, string> = {};
      for (const field of fields) {
        payloadFields[field] = values[field].trim();
      }

      try {
        const response = await fetch(`/api/submit/${funnelId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "landing", fields: payloadFields, sessionId }),
        });

        if (!response.ok) {
          throw new Error(`Submit failed with status ${response.status}`);
        }

        const result = (await response.json().catch(() => ({}))) as { leadId?: string };

        // Analytics + session stitching (best-effort, never blocks the user).
        // `lead_created` is load-bearing beyond analytics: the events route uses
        // it to mark the session converted and attach leadId, and the booking
        // webhook later reads session.leadId to resolve the lead's email. Skip
        // it and a landing booking fires a webhook with a null email.
        trackLandingEvents({
          funnelId,
          sessionId,
          leadId: result?.leadId,
          blockId: block.id,
        });

        applySuccessMode();
      } catch (err) {
        logger.error("[landing] booking form submit failed", {
          funnelId,
          blockId: block.id,
          error: err instanceof Error ? err.message : String(err),
        });
        setError("Something went wrong. Please try again.");
        setStatus("idle");
      }
    },
    [status, validate, fields, values, funnelId, sessionId, applySuccessMode, block.id]
  );

  if (status === "success") {
    const message =
      successMode === "show_calendar"
        ? "Thanks! Pick a time that works for you below."
        : successMessage || "Thanks! We'll be in touch shortly.";

    return (
      <section id={block.id} className="w-full py-6 sm:py-8">
        <div
          className="mx-auto max-w-xl rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center shadow-sm"
          role="status"
        >
          <p className="text-sm font-medium text-[#0A0A0A] sm:text-base">{message}</p>
        </div>
      </section>
    );
  }

  const isBusy = status === "submitting" || status === "redirecting";

  return (
    <section id={block.id} className="w-full py-6 sm:py-8">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto max-w-xl rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
      >
        <div className="space-y-4">
          {fields.map((field) => {
            const meta = FIELD_META[field];
            const inputId = `${block.id}-${field}`;
            return (
              <div key={field}>
                <label
                  htmlFor={inputId}
                  className="mb-1.5 block text-sm font-medium text-[#374151]"
                >
                  {meta.label}
                </label>
                <input
                  id={inputId}
                  name={field}
                  type={meta.type}
                  inputMode={meta.inputMode}
                  autoComplete={meta.autoComplete}
                  value={values[field]}
                  onChange={(event) => setField(field, event.target.value)}
                  onFocus={handleFieldFocus}
                  disabled={isBusy}
                  aria-invalid={error ? true : undefined}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-base text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:border-[#0A9AFF] focus:outline-none focus:ring-2 focus:ring-[#0A9AFF]/20 disabled:opacity-60"
                />
              </div>
            );
          })}
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-[#DC2626]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isBusy}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A9AFF] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          style={{ backgroundColor: "var(--landing-brand)" }}
        >
          {isBusy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isBusy ? "Submitting…" : submitLabel}
        </button>
      </form>
    </section>
  );
}
