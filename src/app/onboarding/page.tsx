"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FunnelConfig } from "@/types";
import { DEFAULT_FUNNEL_CONFIG } from "@/lib/default-config";
import { deriveLightColor, deriveDarkColor } from "@/lib/colors";
import { generateSlug } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, ArrowLeft, Loader2, Sparkles, Palette, Calendar, Globe, Check, PartyPopper, Users, Briefcase, Laptop, Home, Dumbbell, LineChart } from "lucide-react";
import { TEMPLATES, Template } from "@/lib/templates";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [config, setConfig] = useState<FunnelConfig>(DEFAULT_FUNNEL_CONFIG);
  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [createdFunnelId, setCreatedFunnelId] = useState<string | null>(null);

  const steps = [
    { icon: Sparkles, label: "Describe" },
    { icon: Zap, label: "Preview" },
    { icon: Palette, label: "Brand" },
    { icon: Calendar, label: "Calendars" },
    { icon: Globe, label: "URL" },
    { icon: Check, label: "Publish" },
  ];

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      setConfig(prev => ({
        ...prev,
        brand: {
          ...prev.brand,
          name: data.brandName || prev.brand.name,
        },
        quiz: {
          ...prev.quiz,
          headline: data.headline,
          subheadline: data.subheadline,
          questions: data.questions,
          thresholds: data.thresholds,
        },
        meta: {
          title: data.metaTitle || prev.meta.title,
          description: data.metaDescription || prev.meta.description,
        },
      }));

      setSlug(generateSlug(data.brandName || "my-funnel"));
      setStep(1);
    } catch {
      // Handle error
    }
    setGenerating(false);
  }

  async function checkSlug(s: string) {
    setSlug(s);
    if (s.length < 2) { setSlugAvailable(null); return; }
    const res = await fetch(`/api/slugs/check?slug=${s}`);
    const data = await res.json();
    setSlugAvailable(data.available);
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      // Create funnel
      const createRes = await fetch("/api/funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, slug }),
      });
      const funnel = await createRes.json();

      // Publish it
      await fetch(`/api/funnels/${funnel.id}/publish`, { method: "POST" });
      setCreatedFunnelId(funnel.id);
      setStep(5);
      toast.success("Your funnel is live!");
    } catch {
      // Handle error
    }
    setPublishing(false);
  }

  const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Users, Briefcase, Laptop, Home, Dumbbell, LineChart,
  };

  function selectTemplate(template: Template) {
    setConfig(template.config);
    setSlug(generateSlug(template.config.brand.name));
    setStep(1);
  }

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <div className="max-w-lg mx-auto text-center">
            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Start with a template</h1>
            <p className="text-sm text-gray-500 mb-6">Pick an industry template to get started instantly, or describe your own below.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
              {TEMPLATES.map((template) => {
                const Icon = ICON_MAP[template.icon];
                return (
                  <button
                    key={template.id}
                    onClick={() => selectTemplate(template)}
                    className="bg-white border border-[#EBEBEB] rounded-xl p-4 text-left hover:border-[#2D6A4F] hover:shadow-sm transition-all group"
                  >
                    <div className="w-9 h-9 bg-[#2D6A4F]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#2D6A4F]/20 transition-colors">
                      {Icon && <Icon className="w-4.5 h-4.5 text-[#2D6A4F]" />}
                    </div>
                    <h3 className="text-sm font-semibold text-[#333333] mb-1">{template.name}</h3>
                    <p className="text-xs text-[#A3A3A3]">{template.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-[#EBEBEB]" />
              <span className="text-xs text-[#A3A3A3]">or describe your own</span>
              <div className="flex-1 h-px bg-[#EBEBEB]" />
            </div>

            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="We help SaaS founders scale from $10k to $100k MRR through outbound sales systems. Our ideal clients are B2B SaaS companies doing at least $10k/mo..."
              rows={4}
              className="text-sm mb-4 resize-none"
            />
            <Button
              onClick={handleGenerate}
              disabled={prompt.length < 20 || generating}
              className="w-full gap-2"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating your funnel...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate My Funnel
                </>
              )}
            </Button>
            {generating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 space-y-1"
              >
                <p className="text-xs text-gray-400 animate-pulse">Writing your headline...</p>
              </motion.div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="max-w-md mx-auto text-center">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your funnel is ready</h1>
            <p className="text-sm text-gray-500 mb-6">Here&apos;s what AI generated. You can edit everything in the builder later.</p>

            <div className="text-left bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Headline</p>
                <p className="text-sm font-semibold text-gray-900">{config.quiz.headline}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Subheadline</p>
                <p className="text-sm text-gray-600">{config.quiz.subheadline}</p>
              </div>
              {config.quiz.questions.map((q, i) => (
                <div key={q.key}>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Question {i + 1}</p>
                  <p className="text-sm text-gray-700">{q.text}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {q.options.map(o => (
                      <span key={o.id} className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-full text-gray-500">
                        {o.label} ({o.points}pt)
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1 gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Regenerate
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1 gap-1.5">
                Looks Good
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-md mx-auto text-center">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Palette className="w-7 h-7 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Add your brand</h1>
            <p className="text-sm text-gray-500 mb-8">Pick your brand color and add your logo.</p>

            <div className="space-y-4 text-left">
              <div>
                <Label className="text-xs text-gray-500 mb-1.5">Business Name</Label>
                <Input
                  value={config.brand.name}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    brand: { ...prev.brand, name: e.target.value },
                  }))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1.5">Brand Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.brand.primaryColor}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      brand: {
                        ...prev.brand,
                        primaryColor: e.target.value,
                        primaryColorLight: deriveLightColor(e.target.value),
                        primaryColorDark: deriveDarkColor(e.target.value),
                      },
                    }))}
                    className="w-12 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                  />
                  <div className="flex gap-2 flex-wrap">
                    {["#2563EB", "#7C3AED", "#059669", "#DC2626", "#EA580C", "#0891B2", "#4F46E5", "#D946EF"].map(c => (
                      <button
                        key={c}
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          brand: {
                            ...prev.brand,
                            primaryColor: c,
                            primaryColorLight: deriveLightColor(c),
                            primaryColorDark: deriveDarkColor(c),
                          },
                        }))}
                        className="w-8 h-8 rounded-lg border-2 transition-all"
                        style={{
                          backgroundColor: c,
                          borderColor: config.brand.primaryColor === c ? "#000" : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1.5">Logo URL (optional)</Label>
                <Input
                  value={config.brand.logoUrl}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    brand: { ...prev.brand, logoUrl: e.target.value },
                  }))}
                  placeholder="https://your-site.com/logo.png"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-md mx-auto text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect your calendars</h1>
            <p className="text-sm text-gray-500 mb-8">Add your Cal.com or Calendly links. Leads are routed by score.</p>

            <div className="space-y-4 text-left">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <Label className="text-xs text-gray-500">Best Fit (high score)</Label>
                </div>
                <Input
                  value={config.quiz.calendars.high}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    quiz: { ...prev.quiz, calendars: { ...prev.quiz.calendars, high: e.target.value } },
                  }))}
                  placeholder="https://cal.com/you/discovery-call"
                  className="text-sm"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <Label className="text-xs text-gray-500">Good Fit (mid score)</Label>
                </div>
                <Input
                  value={config.quiz.calendars.mid}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    quiz: { ...prev.quiz, calendars: { ...prev.quiz.calendars, mid: e.target.value } },
                  }))}
                  placeholder="https://cal.com/you/intro-call"
                  className="text-sm"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <Label className="text-xs text-gray-500">Intro Call (low score)</Label>
                </div>
                <Input
                  value={config.quiz.calendars.low}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    quiz: { ...prev.quiz, calendars: { ...prev.quiz.calendars, low: e.target.value } },
                  }))}
                  placeholder="https://cal.com/you/learn-more"
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-md mx-auto text-center">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Globe className="w-7 h-7 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose your URL</h1>
            <p className="text-sm text-gray-500 mb-8">Pick a slug for your funnel. You can connect a custom domain later.</p>

            <div className="text-left mb-6">
              <Label className="text-xs text-gray-500 mb-1.5">Funnel URL</Label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <span className="px-3 py-2.5 bg-gray-50 text-sm text-gray-400 border-r border-gray-200 whitespace-nowrap">
                  flowline.app/f/
                </span>
                <input
                  value={slug}
                  onChange={e => checkSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 px-3 py-2.5 text-sm outline-none"
                  placeholder="my-funnel"
                />
              </div>
              {slugAvailable !== null && (
                <p className={`text-xs mt-1.5 ${slugAvailable ? 'text-green-600' : 'text-red-500'}`}>
                  {slugAvailable ? 'Available!' : 'Already taken. Try another.'}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!slug || slugAvailable === false || publishing}
                className="flex-1 gap-1.5"
              >
                {publishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish Funnel
                    <Zap className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="max-w-md mx-auto text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <PartyPopper className="w-10 h-10 text-green-600" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your funnel is live!</h1>
              <p className="text-sm text-gray-500 mb-6">Share your link and start booking calls.</p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-400 mb-2">Your funnel URL</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 text-left">
                    flowline.app/f/{slug}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(`https://flowline.app/f/${slug}`)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <a href={`/f/${slug}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full gap-1.5">
                    View Live Funnel
                  </Button>
                </a>
                {createdFunnelId && (
                  <Button onClick={() => router.push(`/builder/${createdFunnelId}`)} className="flex-1 gap-1.5">
                    Open Builder
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 py-6">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                i < step ? "bg-green-100 text-green-600" :
                i === step ? "bg-gray-900 text-white" :
                "bg-gray-100 text-gray-400"
              }`}
            >
              {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${i < step ? "bg-green-200" : "bg-gray-100"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
