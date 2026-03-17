"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FunnelConfig } from "@/types";
import { DEFAULT_FUNNEL_CONFIG } from "@/lib/default-config";
import { deriveLightColor, deriveDarkColor } from "@/lib/colors";
import { generateSlug } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, ArrowLeft, Loader2, Palette, Calendar, Globe, Check, PartyPopper, Users, Briefcase, Laptop, Home, Dumbbell, LineChart, Upload } from "lucide-react";
import Image from "next/image";
import { TEMPLATES, Template } from "@/lib/templates";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const [step, setStep] = useState(0);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [generating, setGenerating] = useState(false);
  const [config, setConfig] = useState<FunnelConfig>(DEFAULT_FUNNEL_CONFIG);
  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [createdFunnelId, setCreatedFunnelId] = useState<string | null>(null);

  // Resume pending funnel after sign-up redirect
  useEffect(() => {
    const pending = localStorage.getItem("myvsl_pending_funnel");
    if (pending) {
      try {
        const { config: savedConfig, slug: savedSlug } = JSON.parse(pending);
        setConfig(savedConfig);
        setSlug(savedSlug);
        setStep(4); // Go to URL/publish step
        toast.success("Welcome back! Your funnel is ready to publish.");
      } catch {
        localStorage.removeItem("myvsl_pending_funnel");
      }
    }
  }, []);

  // Custom logo component for steps array (matches Lucide icon signature)
  const LogoIcon = ({ className }: { className?: string }) => (
    <Image src="/logo.png" alt="MyVSL" width={16} height={16} className={className} />
  );

  const steps = [
    { icon: LogoIcon, label: "Describe" },
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

      if (!res.ok) {
        toast.error(data.error || "Failed to generate funnel");
        setGenerating(false);
        return;
      }

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
      toast.error("Something went wrong. Try again.");
    }
    setGenerating(false);
  }

  // Auto-trigger generation if prompt was passed via query params
  const autoTriggered = useRef(false);
  useEffect(() => {
    if (initialPrompt && initialPrompt.length > 10 && !autoTriggered.current) {
      autoTriggered.current = true;
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [slugError, setSlugError] = useState<string | null>(null);

  async function checkSlug(s: string) {
    setSlug(s);
    setSlugError(null);
    if (s.length < 3) { setSlugAvailable(null); return; }
    if (s.length > 40) { setSlugError("Slug must be 40 characters or fewer"); setSlugAvailable(null); return; }
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(s)) { setSlugError("Lowercase letters, numbers, and hyphens only"); setSlugAvailable(null); return; }
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

      if (createRes.status === 401) {
        // Not signed in — save config to localStorage and redirect to sign-up
        localStorage.setItem("myvsl_pending_funnel", JSON.stringify({ config, slug }));
        toast.error("Sign up to publish your funnel — your progress is saved.");
        setTimeout(() => router.push("/sign-up"), 1500);
        setPublishing(false);
        return;
      }

      const funnel = await createRes.json();

      if (createRes.status === 403) {
        toast.error("You've reached the 1 funnel limit on the Free plan. Upgrade to Pro for unlimited funnels.");
        setTimeout(() => router.push("/pricing"), 2000);
        setPublishing(false);
        return;
      }

      if (!createRes.ok) {
        toast.error(funnel.error || "Failed to create funnel");
        setPublishing(false);
        return;
      }

      // Publish it
      const pubRes = await fetch(`/api/funnels/${funnel.id}/publish`, { method: "POST" });
      if (!pubRes.ok) {
        toast.error("Failed to publish funnel");
        setPublishing(false);
        return;
      }

      // Clear any saved pending funnel
      localStorage.removeItem("myvsl_pending_funnel");
      setCreatedFunnelId(funnel.id);
      setStep(5);
      toast.success("Your funnel is live!");
    } catch {
      toast.error("Something went wrong. Try again.");
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
            <div className="w-14 h-14 bg-[#F0F7F4] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Image src="/logo.png" alt="MyVSL" width={32} height={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Start with a template</h1>
            <p className="text-sm text-gray-500 mb-6">Pick an industry template to get started instantly, or describe your own below.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-2">
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
              className="text-base mb-4 resize-none"
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
                  <Image src="/logo.png" alt="" width={16} height={16} />
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
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1 gap-1.5 min-h-[44px]">
                <ArrowLeft className="w-3.5 h-3.5" />
                Regenerate
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1 gap-1.5 min-h-[44px]">
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
                  className="text-base"
                  maxLength={60}
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
                  <div className="flex flex-wrap gap-2">
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
              {/* Logo Upload */}
              <div>
                <Label className="text-xs text-[#6B7280] mb-1.5">Logo (optional)</Label>
                {config.brand.logoUrl ? (
                  <div className="flex items-center gap-3 mb-2">
                    <img src={config.brand.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-contain border border-[#E5E7EB]" />
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, brand: { ...prev.brand, logoUrl: "" } }))}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#E5E7EB] rounded-xl cursor-pointer hover:border-[#2D6A4F] transition-colors bg-[#F9FAFB]">
                    <Upload className="w-5 h-5 text-[#9CA3AF] mb-1" />
                    <span className="text-xs text-[#9CA3AF]">Click to upload logo</span>
                    <span className="text-[10px] text-[#D1D5DB]">PNG, JPG, SVG up to 2MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error("Logo must be under 2MB");
                          return;
                        }
                        const formData = new FormData();
                        formData.append("file", file);
                        try {
                          const res = await fetch("/api/upload/logo", { method: "POST", body: formData });
                          if (!res.ok) {
                            toast.error("Upload failed — sign in first to upload logos");
                            return;
                          }
                          const { url } = await res.json();
                          setConfig(prev => ({ ...prev, brand: { ...prev.brand, logoUrl: url } }));
                          toast.success("Logo uploaded");
                        } catch {
                          toast.error("Upload failed");
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 min-h-[44px]">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1 min-h-[44px]">
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
                  className="text-base"
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
                  className="text-base"
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
                  className="text-base"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 min-h-[44px]">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1 min-h-[44px]">
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
                  getmyvsl.com/f/
                </span>
                <input
                  value={slug}
                  onChange={e => checkSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 px-3 py-2.5 text-base outline-none"
                  placeholder="my-funnel"
                  maxLength={40}
                />
              </div>
              {slugError && (
                <p className="text-xs mt-1.5 text-red-500">{slugError}</p>
              )}
              {!slugError && slugAvailable !== null && (
                <p className={`text-xs mt-1.5 ${slugAvailable ? 'text-green-600' : 'text-red-500'}`}>
                  {slugAvailable ? 'Available!' : 'Already taken. Try another.'}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1 min-h-[44px]">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!slug || slugAvailable === false || publishing}
                className="flex-1 gap-1.5 min-h-[44px]"
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
                    getmyvsl.com/f/{slug}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(`https://getmyvsl.com/f/${slug}`)}
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
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                i < step ? "bg-green-100 text-green-600" :
                i === step ? "bg-[#2D6A4F] text-white" :
                "bg-gray-100 text-gray-400"
              }`}
            >
              {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-4 sm:w-8 h-0.5 ${i < step ? "bg-green-200" : "bg-gray-100"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-16">
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
