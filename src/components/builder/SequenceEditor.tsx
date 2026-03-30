"use client";

import { useState, useEffect } from "react";
import { Funnel } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Mail, Loader2, ChevronDown, ChevronUp, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { EmailPreview } from "@/components/builder/EmailPreview";

interface Step {
  id?: string;
  subject: string;
  body: string;
  delayHours: number;
  stepOrder: number;
}

interface Sequence {
  id: string;
  name: string;
  active: boolean;
  triggerTier: string | null;
  triggerType: string;
  steps: Step[];
}

interface SequenceEditorProps {
  funnel: Funnel;
}

export function SequenceEditor({ funnel }: SequenceEditorProps) {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSeq, setExpandedSeq] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [previewSteps, setPreviewSteps] = useState<Set<string>>(new Set());

  function togglePreview(seqId: string, stepIndex: number) {
    const key = `${seqId}-${stepIndex}`;
    setPreviewSteps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  useEffect(() => {
    fetch(`/api/funnels/${funnel.id}/sequences`)
      .then(r => r.json())
      .then(data => {
        setSequences(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [funnel.id]);

  async function createSequence() {
    try {
      const res = await fetch(`/api/funnels/${funnel.id}/sequences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Follow-up Sequence" }),
      });
      if (res.ok) {
        const seq = await res.json();
        setSequences(prev => [...prev, seq]);
        setExpandedSeq(seq.id);
        toast.success("Sequence created");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create sequence");
      }
    } catch {
      toast.error("Failed to create sequence");
    }
  }

  async function saveSequence(seq: Sequence) {
    const previousSequences = [...sequences];
    setSaving(seq.id);
    try {
      const res = await fetch(`/api/funnels/${funnel.id}/sequences/${seq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: seq.name,
          active: seq.active,
          triggerTier: seq.triggerTier,
          triggerType: seq.triggerType,
          steps: seq.steps,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSequences(prev => prev.map(s => s.id === seq.id ? updated : s));
        toast.success("Sequence saved");
      } else {
        setSequences(previousSequences);
        toast.error("Failed to save");
      }
    } catch {
      setSequences(previousSequences);
      toast.error("Failed to save");
    }
    setSaving(null);
  }

  async function deleteSequence(seqId: string) {
    try {
      const res = await fetch(`/api/funnels/${funnel.id}/sequences/${seqId}`, { method: "DELETE" });
      if (res.ok) {
        setSequences(prev => prev.filter(s => s.id !== seqId));
        toast.success("Sequence deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  }

  function updateLocal(seqId: string, updates: Partial<Sequence>) {
    setSequences(prev => prev.map(s => s.id === seqId ? { ...s, ...updates } : s));
  }

  function addStep(seqId: string) {
    setSequences(prev => prev.map(s => {
      if (s.id !== seqId) return s;
      return {
        ...s,
        steps: [...s.steps, {
          subject: "Following up",
          body: "Hi there,\n\nJust checking in...",
          delayHours: 48,
          stepOrder: s.steps.length + 1,
        }],
      };
    }));
  }

  function removeStep(seqId: string, stepIndex: number) {
    setSequences(prev => prev.map(s => {
      if (s.id !== seqId) return s;
      const steps = s.steps.filter((_, i) => i !== stepIndex)
        .map((step, i) => ({ ...step, stepOrder: i + 1 }));
      return { ...s, steps };
    }));
  }

  function updateStep(seqId: string, stepIndex: number, field: string, value: string | number) {
    setSequences(prev => prev.map(s => {
      if (s.id !== seqId) return s;
      const steps = [...s.steps];
      steps[stepIndex] = { ...steps[stepIndex], [field]: value };
      return { ...s, steps };
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700 font-medium mb-1">Email Sequences</p>
        <p className="text-[11px] text-blue-600 leading-relaxed">
          Automatically send follow-up emails to leads after they complete your funnel,
          or recover abandoned quiz visitors. Use placeholders: {"{email}"}, {"{score}"}, {"{tier}"}, {"{funnel_name}"}, {"{calendar_url}"} (the booking link for this lead&apos;s tier).
        </p>
      </div>

      {sequences.length === 0 ? (
        <div className="text-center py-6">
          <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-1">No sequences yet</p>
          <p className="text-xs text-gray-400 mb-4">
            Create an email sequence to follow up with leads automatically.
          </p>
          <Button onClick={createSequence} size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Create Sequence
          </Button>
        </div>
      ) : (
        <>
          {sequences.map((seq) => (
            <div key={seq.id} className="border border-gray-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSeq(expandedSeq === seq.id ? null : seq.id)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-700">{seq.name}</span>
                  <Badge variant={seq.active ? "default" : "secondary"} className="text-[10px]">
                    {seq.active ? "Active" : "Draft"}
                  </Badge>
                  {seq.triggerType === "abandoned" && (
                    <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600 bg-amber-50">
                      Abandoned
                    </Badge>
                  )}
                  <span className="text-[10px] text-gray-400">{seq.steps.length} step{seq.steps.length !== 1 ? "s" : ""}</span>
                </div>
                {expandedSeq === seq.id ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
              </button>

              {expandedSeq === seq.id && (
                <div className="px-3 pb-3 space-y-3 border-t border-gray-50">
                  <div className="pt-3">
                    <Label className="text-[10px] text-gray-400">Trigger Type</Label>
                    <select
                      value={seq.triggerType || "lead_created"}
                      onChange={e => updateLocal(seq.id, { triggerType: e.target.value })}
                      className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs bg-white mt-1 h-7"
                      aria-label="Trigger type"
                    >
                      <option value="lead_created">Lead Created</option>
                      <option value="abandoned">Quiz Abandoned</option>
                    </select>
                    {seq.triggerType === "abandoned" && (
                      <div className="flex items-start gap-1.5 mt-2 p-2 bg-amber-50 rounded-md border border-amber-100">
                        <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-amber-700 leading-relaxed">
                          Sends to visitors who started the quiz and entered their email but didn&apos;t complete it.
                          Emails are sent 30 minutes after abandonment.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-gray-400">Sequence Name</Label>
                      <Input
                        value={seq.name}
                        onChange={e => updateLocal(seq.id, { name: e.target.value })}
                        className="text-xs h-7 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-400">Trigger Tier</Label>
                      <select
                        value={seq.triggerTier || ""}
                        onChange={e => updateLocal(seq.id, { triggerTier: e.target.value || null })}
                        className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs bg-white mt-1 h-7"
                        aria-label="Trigger tier"
                      >
                        <option value="">All tiers</option>
                        <option value="high">High only</option>
                        <option value="mid">Mid only</option>
                        <option value="low">Low only</option>
                      </select>
                    </div>
                  </div>

                  <Separator />

                  {seq.steps.map((step, si) => {
                    const previewKey = `${seq.id}-${si}`;
                    const isPreviewOpen = previewSteps.has(previewKey);
                    return (
                    <div key={step.id || `step-${si}`} className="p-2 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium text-gray-500">
                          Step {si + 1} {si === 0 ? "" : `(after ${step.delayHours}h)`}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => togglePreview(seq.id, si)}
                            className="p-0.5 text-gray-300 hover:text-[#2D6A4F] transition-colors"
                            aria-label={isPreviewOpen ? "Hide preview" : "Show preview"}
                            title={isPreviewOpen ? "Hide preview" : "Preview email"}
                          >
                            {isPreviewOpen ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          {seq.steps.length > 1 && (
                            <button onClick={() => removeStep(seq.id, si)} className="p-0.5 text-gray-300 hover:text-red-400" aria-label="Remove step">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      {si > 0 && (
                        <div>
                          <Label className="text-[10px] text-gray-400">Delay (hours)</Label>
                          <Input
                            type="number"
                            value={step.delayHours}
                            onChange={e => updateStep(seq.id, si, "delayHours", parseInt(e.target.value) || 1)}
                            className="text-xs h-6 w-20 mt-0.5"
                            min={1}
                          />
                        </div>
                      )}
                      <div>
                        <Label className="text-[10px] text-gray-400">Subject</Label>
                        <Input
                          value={step.subject}
                          onChange={e => updateStep(seq.id, si, "subject", e.target.value)}
                          className="text-xs h-7 mt-0.5"
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-gray-400">Body</Label>
                        <Textarea
                          value={step.body}
                          onChange={e => updateStep(seq.id, si, "body", e.target.value)}
                          className="text-xs mt-0.5 resize-none"
                          rows={4}
                        />
                      </div>
                      {isPreviewOpen && (
                        <div className="mt-2">
                          <EmailPreview
                            subject={step.subject}
                            body={step.body}
                            brandName={(funnel.config as { brand?: { name?: string } })?.brand?.name || ""}
                            brandColor={(funnel.config as { brand?: { primaryColor?: string } })?.brand?.primaryColor}
                          />
                        </div>
                      )}
                    </div>
                    );
                  })}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addStep(seq.id)}
                    disabled={seq.steps.length >= 5}
                    className="text-[10px] h-6 text-gray-400 gap-1"
                  >
                    <Plus className="w-2.5 h-2.5" /> Add Step {seq.steps.length >= 5 && "(max 5)"}
                  </Button>

                  <Separator />

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="text-xs h-7"
                        disabled={saving === seq.id}
                        onClick={() => saveSequence(seq)}
                      >
                        {saving === seq.id ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => {
                          updateLocal(seq.id, { active: !seq.active });
                          saveSequence({ ...seq, active: !seq.active });
                        }}
                      >
                        {seq.active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                    <button
                      onClick={() => deleteSequence(seq.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <Button
            onClick={createSequence}
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs"
            disabled={sequences.length >= 3}
          >
            <Plus className="w-3 h-3" />
            Add Sequence {sequences.length >= 3 && "(max 3)"}
          </Button>
        </>
      )}
    </div>
  );
}
