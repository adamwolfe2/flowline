"use client";

import { useState } from "react";
import { FunnelConfig, QuizQuestion } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

interface ContentEditorProps {
  config: FunnelConfig;
  onSave: (config: FunnelConfig) => void;
}

export function ContentEditor({ config, onSave }: ContentEditorProps) {
  const [expandedQ, setExpandedQ] = useState<number | null>(0);

  function updateField(path: string, value: string) {
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

      <div>
        <Label className="text-xs text-gray-500 mb-1.5">Headline</Label>
        <Textarea
          value={config.quiz.headline}
          onChange={e => updateField("quiz.headline", e.target.value)}
          className="text-sm resize-none"
          rows={2}
          maxLength={120}
        />
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-1.5">Subheadline</Label>
        <Input
          value={config.quiz.subheadline}
          onChange={e => updateField("quiz.subheadline", e.target.value)}
          className="text-sm"
          maxLength={200}
        />
      </div>

      <Separator />

      <div>
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
              <button
                onClick={() => setExpandedQ(expandedQ === qi ? null : qi)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-medium text-gray-700 truncate flex-1 mr-2">
                  Q{qi + 1}: {q.text}
                </span>
                {expandedQ === qi ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
              </button>

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
                const newConfig = JSON.parse(JSON.stringify(config));
                newConfig.quiz.thresholds.high = parseInt(e.target.value) || 0;
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
                const newConfig = JSON.parse(JSON.stringify(config));
                newConfig.quiz.thresholds.mid = parseInt(e.target.value) || 0;
                onSave(newConfig);
              }}
              className="text-xs mt-1"
            />
          </div>
        </div>
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
          <div>
            <Label className="text-[11px] text-gray-400 mb-1">Badge Text</Label>
            <Input
              value={config.quiz.badgeText ?? ""}
              onChange={e => updateField("quiz.badgeText", e.target.value)}
              placeholder="Free Application"
              className="text-xs"
              maxLength={40}
            />
          </div>

          <div>
            <Label className="text-[11px] text-gray-400 mb-1">CTA Button Text</Label>
            <Input
              value={config.quiz.ctaButtonText ?? ""}
              onChange={e => updateField("quiz.ctaButtonText", e.target.value)}
              placeholder="Take the Quiz — It Takes 60 Seconds"
              className="text-xs"
              maxLength={80}
            />
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
        </div>
      </div>
    </div>
  );
}
