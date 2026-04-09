"use client";

import { FunnelConfig } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Bell, Clock } from "lucide-react";

interface EngagementEditorProps {
  config: FunnelConfig | null;
  onSave: (config: FunnelConfig) => void;
}

export function EngagementEditor({ config, onSave }: EngagementEditorProps) {
  if (!config) return null;

  const exitIntent = config.engagementTriggers?.exitIntent ?? {
    enabled: false,
    headline: "Wait! Don't leave yet.",
    subtext: "You're one step away from finding out if you qualify.",
    ctaText: "Continue",
  };

  const urgency = config.engagementTriggers?.urgency ?? {
    enabled: false,
    deadlineMinutes: 10,
    label: "Offer expires in",
  };

  function updateExitIntent(patch: Partial<typeof exitIntent>) {
    onSave({
      ...config!,
      engagementTriggers: {
        ...config!.engagementTriggers,
        exitIntent: { ...exitIntent, ...patch },
      },
    });
  }

  function updateUrgency(patch: Partial<typeof urgency>) {
    onSave({
      ...config!,
      engagementTriggers: {
        ...config!.engagementTriggers,
        urgency: { ...urgency, ...patch },
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Exit-Intent */}
      <div className="border border-[#E5E7EB] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#2D6A4F]" />
            <span className="text-sm font-semibold text-gray-900">Exit-Intent Popup</span>
          </div>
          <Switch
            checked={exitIntent.enabled}
            onCheckedChange={(checked) => updateExitIntent({ enabled: checked })}
          />
        </div>
        <p className="text-xs text-gray-500">
          Shows a recovery modal when the visitor moves to close the tab or scrolls back to the top on mobile.
        </p>

        {exitIntent.enabled && (
          <div className="space-y-3 pt-1">
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Headline</Label>
              <Input
                id="editor-exitIntent"
                value={exitIntent.headline ?? ""}
                onChange={(e) => updateExitIntent({ headline: e.target.value })}
                placeholder="Wait! Don't leave yet."
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Subtext</Label>
              <Input
                value={exitIntent.subtext ?? ""}
                onChange={(e) => updateExitIntent({ subtext: e.target.value })}
                placeholder="You're one step away from finding out if you qualify."
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Button Text</Label>
              <Input
                value={exitIntent.ctaText ?? ""}
                onChange={(e) => updateExitIntent({ ctaText: e.target.value })}
                placeholder="Continue"
                className="text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Urgency Timer */}
      <div className="border border-[#E5E7EB] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2D6A4F]" />
            <span className="text-sm font-semibold text-gray-900">Urgency Countdown Timer</span>
          </div>
          <Switch
            checked={urgency.enabled}
            onCheckedChange={(checked) => updateUrgency({ enabled: checked })}
          />
        </div>
        <p className="text-xs text-gray-500">
          Displays a countdown timer above the quiz to create urgency. Resets each session.
        </p>

        {urgency.enabled && (
          <div className="space-y-3 pt-1">
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Deadline (minutes)</Label>
              <Input
                id="editor-urgency"
                type="number"
                min={1}
                max={60}
                value={urgency.deadlineMinutes ?? 10}
                onChange={(e) => updateUrgency({ deadlineMinutes: Math.max(1, Math.min(60, parseInt(e.target.value) || 10)) })}
                className="text-sm w-24"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Label</Label>
              <Input
                value={urgency.label ?? "Offer expires in"}
                onChange={(e) => updateUrgency({ label: e.target.value })}
                placeholder="Offer expires in"
                className="text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
