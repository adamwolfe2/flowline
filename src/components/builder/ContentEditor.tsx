"use client";

import { useState } from "react";
import { FunnelConfig, QuizQuestion } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ArrowUp, ArrowDown, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

interface ContentEditorProps {
  config: FunnelConfig;
  onSave: (config: FunnelConfig) => void;
}

export function ContentEditor({ config, onSave }: ContentEditorProps) {
  const [expandedQ, setExpandedQ] = useState<number | null>(0);

  function updateField(path: string, value: string | string[]) {
    const parts = path.split(".");
    const newConfig = JSON.parse(JSON.stringify(config));
    let obj = newConfig as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]] as Record<string, unknown>;
    }
    obj[parts[parts.length - 1]] = value;
    onSave(newConfig);
  }

  function updateQuestion(qIndex: number, field: string, value: string) {
    const newConfig = JSON.parse(JSON.stringify(config));
    (newConfig.quiz.questions[qIndex] as Record<string, unknown>)[field] = value;
    onSave(newConfig);
  }

  function updateOption(qIndex: number, oIndex: number, field: string, value: string | number) {
    const newConfig = JSON.parse(JSON.stringify(config));
    (newConfig.quiz.questions[qIndex].options[oIndex] as Record<string, unknown>)[field] = value;
    onSave(newConfig);
  }

  function addOption(qIndex: number) {
    const newConfig = JSON.parse(JSON.stringify(config));
    const opts = newConfig.quiz.questions[qIndex].options;
    const nextId = String.fromCharCode(97 + opts.length);
    opts.push({ id: nextId, label: "New option", points: 1 });
    onSave(newConfig);
  }

  function removeOption(qIndex: number, oIndex: number) {
    const newConfig = JSON.parse(JSON.stringify(config));
    newConfig.quiz.questions[qIndex].options.splice(oIndex, 1);
    onSave(newConfig);
  }

  function moveQuestion(fromIndex: number, direction: "up" | "down") {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= config.quiz.questions.length) return;
    const newConfig = JSON.parse(JSON.stringify(config));
    const questions = newConfig.quiz.questions;
    [questions[fromIndex], questions[toIndex]] = [questions[toIndex], questions[fromIndex]];
    onSave(newConfig);
    setExpandedQ(toIndex);
  }

  function addQuestion() {
    const newConfig = JSON.parse(JSON.stringify(config));
    const qKey = `q${newConfig.quiz.questions.length + 1}`;
    newConfig.quiz.questions.push({
      key: qKey,
      text: "New question?",
      options: [
        { id: "a", label: "Option A", points: 0 },
        { id: "b", label: "Option B", points: 1 },
        { id: "c", label: "Option C", points: 2 },
        { id: "d", label: "Option D", points: 3 },
      ],
    });
    onSave(newConfig);
    setExpandedQ(newConfig.quiz.questions.length - 1);
  }

  function removeQuestion(qIndex: number) {
    const newConfig = JSON.parse(JSON.stringify(config));
    newConfig.quiz.questions.splice(qIndex, 1);
    onSave(newConfig);
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-500">Video Intro</Label>
          <Switch
            checked={config.quiz.video?.enabled ?? false}
            onCheckedChange={(checked) => {
              const newConfig = JSON.parse(JSON.stringify(config));
              if (!newConfig.quiz.video) newConfig.quiz.video = { enabled: false, url: "" };
              newConfig.quiz.video.enabled = checked;
              onSave(newConfig);
            }}
          />
        </div>
        {config.quiz.video?.enabled && (
          <Input
            value={config.quiz.video?.url ?? ""}
            onChange={(e) => {
              const newConfig = JSON.parse(JSON.stringify(config));
              if (!newConfig.quiz.video) newConfig.quiz.video = { enabled: false, url: "" };
              newConfig.quiz.video.url = e.target.value;
              onSave(newConfig);
            }}
            placeholder="https://youtube.com/watch?v=... or Vimeo/Loom URL"
            className="text-sm"
          />
        )}
      </div>

      <Separator />

      <div id="editor-headline">
        <Label className="text-xs text-gray-500 mb-1.5">Headline</Label>
        <Textarea
          value={config.quiz.headline}
          onChange={e => updateField("quiz.headline", e.target.value)}
          className="text-sm resize-none"
          rows={2}
          maxLength={120}
        />
      </div>

      <div id="editor-subheadline">
        <Label className="text-xs text-gray-500 mb-1.5">Subheadline</Label>
        <Input
          value={config.quiz.subheadline}
          onChange={e => updateField("quiz.subheadline", e.target.value)}
          className="text-sm"
          maxLength={200}
        />
      </div>

      <Separator />

      <div id="editor-questions">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Questions <span className="text-gray-400 font-normal normal-case">(max 7)</span>
          </Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={addQuestion}
            disabled={config.quiz.questions.length >= 7}
            className="gap-1 text-xs h-7"
          >
            <Plus className="w-3 h-3" /> Add
          </Button>
        </div>

        <div className="space-y-2">
          {config.quiz.questions.map((q: QuizQuestion, qi: number) => (
            <div key={q.key} className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="flex items-center p-3 hover:bg-gray-50 transition-colors">
                <button
                  onClick={() => setExpandedQ(expandedQ === qi ? null : qi)}
                  className="flex items-center flex-1 text-left min-w-0"
                >
                  <span className="text-xs font-medium text-gray-700 truncate flex-1 mr-2">
                    Q{qi + 1}: {q.text}
                  </span>
                </button>
                <div className="flex items-center gap-0.5 mr-1">
                  <button
                    onClick={() => moveQuestion(qi, "up")}
                    disabled={qi === 0}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move question up"
                  >
                    <ArrowUp className="w-3 h-3 text-gray-400" />
                  </button>
                  <button
                    onClick={() => moveQuestion(qi, "down")}
                    disabled={qi === config.quiz.questions.length - 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move question down"
                  >
                    <ArrowDown className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
                <button onClick={() => setExpandedQ(expandedQ === qi ? null : qi)}>
                  {expandedQ === qi ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                </button>
              </div>

              {expandedQ === qi && (
                <div className="px-3 pb-3 space-y-3 border-t border-gray-50">
                  <div className="pt-3">
                    <Label className="text-[11px] text-gray-400">Question text</Label>
                    <Input
                      value={q.text}
                      onChange={e => updateQuestion(qi, "text", e.target.value)}
                      className="text-xs mt-1"
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-gray-400">Options</Label>
                    {q.options.map((opt, oi) => (
                      <div key={opt.id} className="flex items-center gap-1.5">
                        <Input
                          value={opt.label}
                          onChange={e => updateOption(qi, oi, "label", e.target.value)}
                          className="text-xs flex-1"
                          maxLength={100}
                        />
                        <Input
                          type="number"
                          value={opt.points}
                          onChange={e => updateOption(qi, oi, "points", parseInt(e.target.value) || 0)}
                          className="text-xs w-14 text-center"
                          min={0}
                          max={10}
                        />
                        <button
                          onClick={() => removeOption(qi, oi)}
                          className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                          aria-label="Remove option"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addOption(qi)}
                      className="text-[11px] h-6 text-gray-400"
                    >
                      <Plus className="w-2.5 h-2.5 mr-1" /> Add option
                    </Button>
                  </div>

                  {config.quiz.questions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(qi)}
                      className="text-[11px] h-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-2.5 h-2.5 mr-1" /> Remove question
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-xs text-gray-500 mb-1.5">Score Thresholds</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[11px] text-gray-400">High tier (&ge;)</Label>
            <Input
              type="number"
              value={config.quiz.thresholds.high}
              onChange={e => {
                const val = parseInt(e.target.value) || 0;
                const newConfig = JSON.parse(JSON.stringify(config));
                newConfig.quiz.thresholds.high = val;
                // Enforce high >= mid
                if (val < newConfig.quiz.thresholds.mid) {
                  newConfig.quiz.thresholds.mid = val;
                }
                onSave(newConfig);
              }}
              className="text-xs mt-1"
            />
          </div>
          <div>
            <Label className="text-[11px] text-gray-400">Mid tier (&ge;)</Label>
            <Input
              type="number"
              value={config.quiz.thresholds.mid}
              onChange={e => {
                const val = parseInt(e.target.value) || 0;
                const newConfig = JSON.parse(JSON.stringify(config));
                newConfig.quiz.thresholds.mid = val;
                // Enforce mid <= high
                if (val > newConfig.quiz.thresholds.high) {
                  newConfig.quiz.thresholds.high = val;
                }
                onSave(newConfig);
              }}
              className="text-xs mt-1"
            />
          </div>
        </div>
        {config.quiz.thresholds.high < config.quiz.thresholds.mid && (
          <p className="text-xs text-red-500 mt-1.5">High threshold must be greater than or equal to mid threshold.</p>
        )}
      </div>
      <Separator />

      <div>
        <Label className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
          Funnel Text
        </Label>
        <p className="text-[11px] text-gray-400 mb-4">
          Customize the text shown on each step of your funnel. Leave blank to use defaults.
        </p>

        <div className="space-y-4">
          <div id="editor-badge">
            <Label className="text-[11px] text-gray-400 mb-1">Badge Text</Label>
            <Input
              value={config.quiz.badgeText ?? ""}
              onChange={e => updateField("quiz.badgeText", e.target.value)}
              placeholder="Free Application"
              className="text-xs"
              maxLength={40}
            />
          </div>

          <div id="editor-cta">
            <Label className="text-[11px] text-gray-400 mb-1">CTA Button Text</Label>
            <Input
              value={config.quiz.ctaButtonText ?? ""}
              onChange={e => updateField("quiz.ctaButtonText", e.target.value)}
              placeholder="Take the Quiz. It Takes 60 Seconds"
              className="text-xs"
              maxLength={80}
            />
          </div>

          <div id="editor-trust-badges">
            <Label className="text-[11px] text-gray-400 mb-1">Trust Badges</Label>
            <p className="text-[10px] text-gray-400 mb-2">Three short phrases shown below the CTA button.</p>
            <div className="space-y-2">
              <Input
                value={config.quiz.trustBadges?.[0] ?? ""}
                onChange={e => {
                  const badges: [string, string, string] = [
                    e.target.value,
                    config.quiz.trustBadges?.[1] ?? "Only 60 seconds",
                    config.quiz.trustBadges?.[2] ?? "100% free",
                  ];
                  updateField("quiz.trustBadges", badges);
                }}
                placeholder="No spam, ever"
                className="text-xs"
                maxLength={30}
              />
              <Input
                value={config.quiz.trustBadges?.[1] ?? ""}
                onChange={e => {
                  const badges: [string, string, string] = [
                    config.quiz.trustBadges?.[0] ?? "No spam, ever",
                    e.target.value,
                    config.quiz.trustBadges?.[2] ?? "100% free",
                  ];
                  updateField("quiz.trustBadges", badges);
                }}
                placeholder="Only 60 seconds"
                className="text-xs"
                maxLength={30}
              />
              <Input
                value={config.quiz.trustBadges?.[2] ?? ""}
                onChange={e => {
                  const badges: [string, string, string] = [
                    config.quiz.trustBadges?.[0] ?? "No spam, ever",
                    config.quiz.trustBadges?.[1] ?? "Only 60 seconds",
                    e.target.value,
                  ];
                  updateField("quiz.trustBadges", badges);
                }}
                placeholder="100% free"
                className="text-xs"
                maxLength={30}
              />
            </div>
          </div>

          <div>
            <Label className="text-[11px] text-gray-400 mb-1">Email Step Headline</Label>
            <Input
              value={config.quiz.emailHeadline ?? ""}
              onChange={e => updateField("quiz.emailHeadline", e.target.value)}
              placeholder="One last step"
              className="text-xs"
              maxLength={60}
            />
          </div>

          <div>
            <Label className="text-[11px] text-gray-400 mb-1">Email Step Subtext</Label>
            <Input
              value={config.quiz.emailSubtext ?? ""}
              onChange={e => updateField("quiz.emailSubtext", e.target.value)}
              placeholder="Enter your email to see your results and book your call."
              className="text-xs"
              maxLength={120}
            />
          </div>

          <div>
            <Label className="text-[11px] text-gray-400 mb-1">Email Button Text</Label>
            <Input
              value={config.quiz.emailButtonText ?? ""}
              onChange={e => updateField("quiz.emailButtonText", e.target.value)}
              placeholder="See My Results & Book a Call"
              className="text-xs"
              maxLength={60}
            />
          </div>

          <div>
            <Label className="text-[11px] text-gray-400 mb-1">Success Headline</Label>
            <Input
              value={config.quiz.successHeadline ?? ""}
              onChange={e => updateField("quiz.successHeadline", e.target.value)}
              placeholder="You qualify!"
              className="text-xs"
              maxLength={60}
            />
          </div>

          <div>
            <Label className="text-[11px] text-gray-400 mb-1">Success Subtext</Label>
            <Input
              value={config.quiz.successSubtext ?? ""}
              onChange={e => updateField("quiz.successSubtext", e.target.value)}
              placeholder="We sent a confirmation to {email}. Pick a time that works for you below."
              className="text-xs"
              maxLength={150}
            />
            <p className="text-[10px] text-gray-300 mt-1">
              Use {"{email}"} as a placeholder for the lead&apos;s email address.
            </p>
          </div>

          <div>
            <Label className="text-[11px] text-gray-400 mb-1">Redirect URL (optional)</Label>
            <Input
              value={config.quiz.successRedirectUrl ?? ""}
              onChange={e => updateField("quiz.successRedirectUrl", e.target.value)}
              placeholder="https://cal.com/you/call"
              className="text-xs font-mono"
            />
            <p className="text-[10px] text-gray-300 mt-1">
              Redirect leads to this URL after submission instead of showing the success page. Leave blank to show the default success page.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
          Personalized Results
        </Label>
        <p className="text-[11px] text-gray-400 mb-4">
          Show different messages based on lead score tier. Leave blank to use the default success text above.
        </p>

        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <Label className="text-[11px] text-emerald-700 font-medium">High Score Result</Label>
            </div>
            <Input
              value={config.quiz.results?.high?.headline ?? ""}
              onChange={e => {
                const newConfig = JSON.parse(JSON.stringify(config));
                if (!newConfig.quiz.results) newConfig.quiz.results = {};
                if (!newConfig.quiz.results.high) newConfig.quiz.results.high = {};
                newConfig.quiz.results.high.headline = e.target.value;
                onSave(newConfig);
              }}
              placeholder="Perfect score! You're an ideal fit."
              className="text-xs mb-2"
              maxLength={80}
            />
            <Input
              value={config.quiz.results?.high?.subtext ?? ""}
              onChange={e => {
                const newConfig = JSON.parse(JSON.stringify(config));
                if (!newConfig.quiz.results) newConfig.quiz.results = {};
                if (!newConfig.quiz.results.high) newConfig.quiz.results.high = {};
                newConfig.quiz.results.high.subtext = e.target.value;
                onSave(newConfig);
              }}
              placeholder="Book your VIP strategy session below."
              className="text-xs mb-2"
              maxLength={150}
            />
            <Input
              value={config.quiz.results?.high?.redirectUrl ?? ""}
              onChange={e => {
                const newConfig = JSON.parse(JSON.stringify(config));
                if (!newConfig.quiz.results) newConfig.quiz.results = {};
                if (!newConfig.quiz.results.high) newConfig.quiz.results.high = {};
                newConfig.quiz.results.high.redirectUrl = e.target.value;
                onSave(newConfig);
              }}
              placeholder="https://cal.com/you/vip-call (optional redirect)"
              className="text-xs font-mono"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <Label className="text-[11px] text-amber-700 font-medium">Mid Score Result</Label>
            </div>
            <Input
              value={config.quiz.results?.mid?.headline ?? ""}
              onChange={e => {
                const newConfig = JSON.parse(JSON.stringify(config));
                if (!newConfig.quiz.results) newConfig.quiz.results = {};
                if (!newConfig.quiz.results.mid) newConfig.quiz.results.mid = {};
                newConfig.quiz.results.mid.headline = e.target.value;
                onSave(newConfig);
              }}
              placeholder="Good potential. Let's explore further"
              className="text-xs mb-2"
              maxLength={80}
            />
            <Input
              value={config.quiz.results?.mid?.subtext ?? ""}
              onChange={e => {
                const newConfig = JSON.parse(JSON.stringify(config));
                if (!newConfig.quiz.results) newConfig.quiz.results = {};
                if (!newConfig.quiz.results.mid) newConfig.quiz.results.mid = {};
                newConfig.quiz.results.mid.subtext = e.target.value;
                onSave(newConfig);
              }}
              placeholder="Book a discovery call to discuss your goals."
              className="text-xs mb-2"
              maxLength={150}
            />
            <Input
              value={config.quiz.results?.mid?.redirectUrl ?? ""}
              onChange={e => {
                const newConfig = JSON.parse(JSON.stringify(config));
                if (!newConfig.quiz.results) newConfig.quiz.results = {};
                if (!newConfig.quiz.results.mid) newConfig.quiz.results.mid = {};
                newConfig.quiz.results.mid.redirectUrl = e.target.value;
                onSave(newConfig);
              }}
              placeholder="https://cal.com/you/discovery (optional redirect)"
              className="text-xs font-mono"
            />
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <Label className="text-[11px] text-gray-600 font-medium">Low Score Result</Label>
            </div>
            <Input
              value={config.quiz.results?.low?.headline ?? ""}
              onChange={e => {
                const newConfig = JSON.parse(JSON.stringify(config));
                if (!newConfig.quiz.results) newConfig.quiz.results = {};
                if (!newConfig.quiz.results.low) newConfig.quiz.results.low = {};
                newConfig.quiz.results.low.headline = e.target.value;
                onSave(newConfig);
              }}
              placeholder="Thanks for your interest!"
              className="text-xs mb-2"
              maxLength={80}
            />
            <Input
              value={config.quiz.results?.low?.subtext ?? ""}
              onChange={e => {
                const newConfig = JSON.parse(JSON.stringify(config));
                if (!newConfig.quiz.results) newConfig.quiz.results = {};
                if (!newConfig.quiz.results.low) newConfig.quiz.results.low = {};
                newConfig.quiz.results.low.subtext = e.target.value;
                onSave(newConfig);
              }}
              placeholder="Book an intro call to learn more about what we offer."
              className="text-xs mb-2"
              maxLength={150}
            />
            <Input
              value={config.quiz.results?.low?.redirectUrl ?? ""}
              onChange={e => {
                const newConfig = JSON.parse(JSON.stringify(config));
                if (!newConfig.quiz.results) newConfig.quiz.results = {};
                if (!newConfig.quiz.results.low) newConfig.quiz.results.low = {};
                newConfig.quiz.results.low.redirectUrl = e.target.value;
                onSave(newConfig);
              }}
              placeholder="https://yourdomain.com/resources (optional redirect)"
              className="text-xs font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
