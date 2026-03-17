"use client";

import { useState } from "react";
import { FunnelConfig } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CalendarEditorProps {
  config: FunnelConfig;
  onSave: (config: FunnelConfig) => void;
}

function isValidUrl(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

export function CalendarEditor({ config, onSave }: CalendarEditorProps) {
  const [testingWebhook, setTestingWebhook] = useState(false);
  function updateCalendar(tier: 'high' | 'mid' | 'low', url: string) {
    const newConfig = JSON.parse(JSON.stringify(config));
    newConfig.quiz.calendars[tier] = url;
    onSave(newConfig);
  }

  function updateWebhook(url: string) {
    const newConfig = JSON.parse(JSON.stringify(config));
    newConfig.webhook.url = url;
    onSave(newConfig);
  }

  return (
    <div className="space-y-5">
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700 font-medium mb-1">How calendar routing works</p>
        <p className="text-[11px] text-blue-600 leading-relaxed">
          Based on quiz answers, leads get a score. High scorers see your &quot;Best fit&quot; calendar,
          mid-scorers see &quot;Good fit,&quot; and lower scorers see &quot;Intro call.&quot;
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <Label className="text-xs text-gray-500">Best Fit Calendar (score &ge; {config.quiz.thresholds.high})</Label>
        </div>
        <Input
          value={config.quiz.calendars.high}
          onChange={e => updateCalendar('high', e.target.value)}
          placeholder="https://cal.com/your-name/hot-lead"
          className="text-sm"
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <Label className="text-xs text-gray-500">Good Fit Calendar (score &ge; {config.quiz.thresholds.mid})</Label>
        </div>
        <Input
          value={config.quiz.calendars.mid}
          onChange={e => updateCalendar('mid', e.target.value)}
          placeholder="https://cal.com/your-name/warm-lead"
          className="text-sm"
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <Label className="text-xs text-gray-500">Intro Call Calendar (score &lt; {config.quiz.thresholds.mid})</Label>
        </div>
        <Input
          value={config.quiz.calendars.low}
          onChange={e => updateCalendar('low', e.target.value)}
          placeholder="https://cal.com/your-name/intro-call"
          className="text-sm"
        />
      </div>

      <Separator />

      <div>
        <Label className="text-xs text-gray-500 mb-1.5">Webhook URL (optional)</Label>
        <Input
          value={config.webhook.url}
          onChange={e => updateWebhook(e.target.value)}
          placeholder="https://hooks.zapier.com/hooks/catch/..."
          className="text-sm"
        />
        {config.webhook.url && !isValidUrl(config.webhook.url) && (
          <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
        )}
        <p className="text-[11px] text-gray-400 mt-1">
          Lead data will be sent here on each submission. Supports Zapier, Make, n8n.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={!config.webhook.url || !isValidUrl(config.webhook.url) || testingWebhook}
            onClick={async () => {
              setTestingWebhook(true);
              try {
                const res = await fetch("/api/webhooks/test", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url: config.webhook.url }),
                });
                const data = await res.json();
                if (data.success) {
                  toast.success(`Webhook responded with ${data.status} OK`);
                } else {
                  toast.error(data.error || "Webhook test failed");
                }
              } catch {
                toast.error("Failed to send test");
              }
              setTestingWebhook(false);
            }}
          >
            {testingWebhook ? "Sending..." : "Send test payload"}
          </Button>
        </div>
        <div className="mt-3 p-3 bg-[#FBFBFB] rounded-lg border border-[#EBEBEB]">
          <p className="text-[11px] text-[#A3A3A3] font-medium mb-1">Webhook payload format</p>
          <pre className="text-[10px] text-[#737373] font-mono overflow-x-auto">
{`{
  "email": "lead@example.com",
  "answers": { "q1": "b", "q2": "c" },
  "score": 7,
  "calendar_tier": "high",
  "timestamp": "2026-01-01T00:00:00Z",
  "source": "Your Business",
  "funnel_slug": "your-funnel"
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
