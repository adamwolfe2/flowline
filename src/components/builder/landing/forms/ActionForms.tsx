"use client";

import type { BookingFormField, CalendarProps, LandingBlock } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BlockReferenceSelect } from "../BlockReferenceSelect";
import type { BlockFormProps } from "./formTypes";

/** Property forms for the conversion blocks: calendar, booking_form, button. */

// --- calendar --------------------------------------------------------------

type CalendarProvider = CalendarProps["provider"];

const CALENDAR_PROVIDERS: readonly CalendarProvider[] = ["cal", "calendly", "other"];

const CALENDAR_PROVIDER_LABELS: Record<CalendarProvider, string> = {
  cal: "Cal.com",
  calendly: "Calendly",
  other: "Other (iframe embed)",
};

const CALENDAR_PROVIDER_PLACEHOLDERS: Record<CalendarProvider, string> = {
  cal: "https://cal.com/your-name/30min",
  calendly: "https://calendly.com/your-name/30min",
  other: "https://...",
};

function isCalendarProvider(value: string): value is CalendarProvider {
  return (CALENDAR_PROVIDERS as readonly string[]).includes(value);
}

type CalendarGate = NonNullable<CalendarProps["gate"]>;

const CALENDAR_GATES: readonly CalendarGate[] = ["none", "blur_overlay"];

const CALENDAR_GATE_LABELS: Record<CalendarGate, string> = {
  none: "Off — show the calendar immediately",
  blur_overlay: "On — capture name & email before booking",
};

function isCalendarGate(value: string): value is CalendarGate {
  return (CALENDAR_GATES as readonly string[]).includes(value);
}

export function CalendarForm({ block, onChange }: BlockFormProps<"calendar">) {
  const { props } = block;

  return (
    <div className="space-y-2.5">
      <div>
        <Label className="text-[10px] text-gray-400">Provider</Label>
        <select
          value={props.provider}
          onChange={(e) => {
            if (!isCalendarProvider(e.target.value)) return;
            onChange({ ...block, props: { ...props, provider: e.target.value } });
          }}
          className="w-full border border-[#E5E7EB] rounded-md px-2.5 py-2 text-xs bg-white mt-1"
          aria-label="Calendar provider"
        >
          {CALENDAR_PROVIDERS.map((provider) => (
            <option key={provider} value={provider}>
              {CALENDAR_PROVIDER_LABELS[provider]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label className="text-[10px] text-gray-400">Calendar URL</Label>
        <Input
          value={props.url}
          onChange={(e) => onChange({ ...block, props: { ...props, url: e.target.value } })}
          placeholder={CALENDAR_PROVIDER_PLACEHOLDERS[props.provider]}
          className="text-xs mt-1"
        />
      </div>
      <p className="text-[10px] text-gray-400">
        A landing page books against a single calendar — there is no tier routing.
      </p>

      <div>
        <Label className="text-[10px] text-gray-400">Lead gate</Label>
        <select
          value={props.gate ?? "none"}
          onChange={(e) => {
            if (!isCalendarGate(e.target.value)) return;
            onChange({ ...block, props: { ...props, gate: e.target.value } });
          }}
          className="w-full border border-[#E5E7EB] rounded-md px-2.5 py-2 text-xs bg-white mt-1"
          aria-label="Calendar lead gate"
        >
          {CALENDAR_GATES.map((gate) => (
            <option key={gate} value={gate}>
              {CALENDAR_GATE_LABELS[gate]}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-gray-400 mt-1">
          Blurs the calendar behind a name/email form. The lead is captured even if
          they never pick a time.
        </p>
      </div>

      {(props.gate ?? "none") === "blur_overlay" && (
        <div className="space-y-2.5 border-l-2 border-[#E5E7EB] pl-3">
          <div>
            <Label className="text-[10px] text-gray-400">Gate headline</Label>
            <Input
              value={props.gateTitle ?? ""}
              onChange={(e) => onChange({ ...block, props: { ...props, gateTitle: e.target.value } })}
              placeholder="See available times"
              className="text-xs mt-1"
              maxLength={80}
            />
          </div>
          <div>
            <Label className="text-[10px] text-gray-400">Gate subtext</Label>
            <Input
              value={props.gateSubtitle ?? ""}
              onChange={(e) =>
                onChange({ ...block, props: { ...props, gateSubtitle: e.target.value } })
              }
              placeholder="Enter your name and email to unlock the calendar and pick a time."
              className="text-xs mt-1"
              maxLength={140}
            />
          </div>
          <div>
            <Label className="text-[10px] text-gray-400">Button label</Label>
            <Input
              value={props.gateCtaLabel ?? ""}
              onChange={(e) =>
                onChange({ ...block, props: { ...props, gateCtaLabel: e.target.value } })
              }
              placeholder="Unlock the calendar"
              className="text-xs mt-1"
              maxLength={40}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- booking_form ----------------------------------------------------------

/** Canonical render order; the stored `fields` array is rebuilt against this. */
const FIELD_ORDER: readonly BookingFormField[] = ["name", "email", "phone"];

const FIELD_LABELS: Record<BookingFormField, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
};

type SuccessMode = "show_calendar" | "message" | "redirect";

const SUCCESS_MODES: readonly SuccessMode[] = ["message", "show_calendar", "redirect"];

const SUCCESS_MODE_LABELS: Record<SuccessMode, string> = {
  message: "Show a thank-you message",
  show_calendar: "Reveal a calendar block",
  redirect: "Redirect to a URL",
};

function isSuccessMode(value: string): value is SuccessMode {
  return (SUCCESS_MODES as readonly string[]).includes(value);
}

export function BookingFormForm({ block, blocks, onChange }: BlockFormProps<"booking_form">) {
  const { props } = block;

  function toggleField(field: BookingFormField, enabled: boolean) {
    const selected = new Set(props.fields);
    if (enabled) selected.add(field);
    else selected.delete(field);
    // Rebuild in canonical order rather than appending, so toggling a field off
    // and on again does not shuffle the form.
    onChange({ ...block, props: { ...props, fields: FIELD_ORDER.filter((f) => selected.has(f)) } });
  }

  return (
    <div className="space-y-2.5">
      <div>
        <Label className="text-[10px] text-gray-400">Fields</Label>
        <div className="space-y-1 mt-1">
          {FIELD_ORDER.map((field) => {
            // Email backs the lead's NOT NULL email column, so it is always
            // collected and cannot be switched off.
            const locked = field === "email";
            const checked = props.fields.includes(field);
            return (
              <label
                key={field}
                className={`flex items-center gap-2 px-2.5 py-2 border border-[#E5E7EB] rounded-md text-xs ${
                  locked ? "bg-[#F9FAFB] text-gray-400" : "bg-white text-gray-700 cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={locked ? true : checked}
                  disabled={locked}
                  onChange={(e) => toggleField(field, e.target.checked)}
                  className="accent-[#0A9AFF]"
                />
                {FIELD_LABELS[field]}
                {locked && <span className="text-[10px] text-gray-400 ml-auto">Always required</span>}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-[10px] text-gray-400">Submit Button Label</Label>
        <Input
          value={props.submitLabel}
          onChange={(e) => onChange({ ...block, props: { ...props, submitLabel: e.target.value } })}
          className="text-xs mt-1"
          maxLength={40}
        />
      </div>

      <div>
        <Label className="text-[10px] text-gray-400">On submit</Label>
        <select
          value={props.successMode}
          onChange={(e) => {
            if (!isSuccessMode(e.target.value)) return;
            onChange({ ...block, props: { ...props, successMode: e.target.value } });
          }}
          className="w-full border border-[#E5E7EB] rounded-md px-2.5 py-2 text-xs bg-white mt-1"
          aria-label="Behaviour after submit"
        >
          {SUCCESS_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {SUCCESS_MODE_LABELS[mode]}
            </option>
          ))}
        </select>
      </div>

      {props.successMode === "message" && (
        <div>
          <Label className="text-[10px] text-gray-400">Thank-you message</Label>
          <Textarea
            value={props.successMessage ?? ""}
            onChange={(e) =>
              onChange({ ...block, props: { ...props, successMessage: e.target.value } })
            }
            className="text-xs mt-1 resize-none"
            rows={3}
            maxLength={300}
          />
        </div>
      )}

      {props.successMode === "show_calendar" && (
        <BlockReferenceSelect
          label="Calendar to reveal"
          blocks={blocks}
          selfId={block.id}
          value={props.successCalendarBlockId}
          onChange={(id) =>
            onChange({ ...block, props: { ...props, successCalendarBlockId: id } })
          }
          filter={(b: LandingBlock) => b.type === "calendar"}
          emptyHint="Add a Calendar block first — there is nothing to reveal yet."
        />
      )}

      {props.successMode === "redirect" && (
        <div>
          <Label className="text-[10px] text-gray-400">Redirect URL</Label>
          <Input
            value={props.redirectUrl ?? ""}
            onChange={(e) => onChange({ ...block, props: { ...props, redirectUrl: e.target.value } })}
            placeholder="https://..."
            className="text-xs mt-1"
          />
        </div>
      )}
    </div>
  );
}

// --- button ----------------------------------------------------------------

export function ButtonForm({ block, blocks, onChange }: BlockFormProps<"button">) {
  const { props } = block;

  return (
    <div className="space-y-2.5">
      <div>
        <Label className="text-[10px] text-gray-400">Label</Label>
        <Input
          value={props.label}
          onChange={(e) => onChange({ ...block, props: { ...props, label: e.target.value } })}
          className="text-xs mt-1"
          maxLength={40}
        />
      </div>
      <div>
        <Label className="text-[10px] text-gray-400">Action</Label>
        <select
          value={props.action}
          onChange={(e) => {
            const action = e.target.value === "link" ? "link" : "scroll";
            onChange({ ...block, props: { ...props, action } });
          }}
          className="w-full border border-[#E5E7EB] rounded-md px-2.5 py-2 text-xs bg-white mt-1"
          aria-label="Button action"
        >
          <option value="scroll">Scroll to a block</option>
          <option value="link">Open a URL</option>
        </select>
      </div>

      {props.action === "scroll" && (
        <BlockReferenceSelect
          label="Scrolls to"
          blocks={blocks}
          selfId={block.id}
          value={props.targetBlockId}
          onChange={(id) => onChange({ ...block, props: { ...props, targetBlockId: id } })}
          emptyHint="Add another block to give this button somewhere to scroll to."
        />
      )}

      {props.action === "link" && (
        <div>
          <Label className="text-[10px] text-gray-400">URL</Label>
          <Input
            value={props.url ?? ""}
            onChange={(e) => onChange({ ...block, props: { ...props, url: e.target.value } })}
            placeholder="https://..."
            className="text-xs mt-1"
          />
        </div>
      )}
    </div>
  );
}
