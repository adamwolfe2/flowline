"use client";

import { FunnelConfig } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface CalendarEditorProps {
  config: FunnelConfig;
  onSave: (config: FunnelConfig) => void;
}

export function CalendarEditor({ config, onSave }: CalendarEditorProps) {
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
        <p className="text-[11px] text-gray-400 mt-1">
          Lead data will be sent here on each submission. Supports Zapier, Make, n8n.
        </p>
      </div>
    </div>
  );
}
