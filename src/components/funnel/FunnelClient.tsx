"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FunnelConfig } from "@/types";
import { WelcomeStep } from "./WelcomeStep";
import { QuestionStep } from "./QuestionStep";
import { EmailStep } from "./EmailStep";
import { SuccessStep } from "./SuccessStep";
import { ProgressBar } from "./ProgressBar";
import { useTracking } from "./useTracking";

interface FunnelClientProps {
  config: FunnelConfig;
  funnelId: string;
  sessionId: string;
}

export function FunnelClient({ config, funnelId, sessionId }: FunnelClientProps) {
  const totalQuestions = config.quiz.questions.length;
  // Steps: 0=Welcome, 1..N=Questions, N+1=Email, N+2=Success
  const emailStep = totalQuestions + 1;
  const successStep = totalQuestions + 2;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [calendarUrl, setCalendarUrl] = useState("");

  const {
    trackPageView, trackAnswer, trackCTAClick, trackFieldFocus,
    trackFormSubmit, trackLeadCreated, trackFunnelCompleted, trackBackNavigation,
  } = useTracking({ funnelId, sessionId });

  // Track page views on step change
  useEffect(() => {
    trackPageView(step);
  }, [step, trackPageView]);

  const handleStart = useCallback(() => {
    trackCTAClick();
    setStep(1);
  }, [trackCTAClick]);

  const handleSelect = useCallback(
    (key: string, id: string) => {
      // Find the question and option to get label + points
      const question = config.quiz.questions.find((q) => q.key === key);
      const option = question?.options.find((o) => o.id === id);
      if (question && option) {
        trackAnswer(step, key, id, option.label, option.points);
      }

      setAnswers((prev) => ({ ...prev, [key]: id }));
      // Auto-advance after a brief delay
      setTimeout(() => {
        setStep((prev) => prev + 1);
      }, 350);
    },
    [config.quiz.questions, step, trackAnswer]
  );

  const handleBack = useCallback(() => {
    trackBackNavigation(step);
    setStep((s) => s - 1);
  }, [step, trackBackNavigation]);

  const handleEmailFocus = useCallback(() => {
    trackFieldFocus();
  }, [trackFieldFocus]);

  const handleEmailSubmit = useCallback(
    async (submittedEmail: string) => {
      setEmail(submittedEmail);
      trackFormSubmit();

      try {
        const res = await fetch(`/api/submit/${funnelId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: submittedEmail, answers, sessionId }),
        });
        const data = await res.json();
        if (data.calendarUrl) {
          setCalendarUrl(data.calendarUrl);
        }
        if (data.leadId) {
          trackLeadCreated(data.leadId, data.score, data.calendarTier);
        }
      } catch {
        // Still show success step even if submit fails
      }

      setStep(successStep);
    },
    [answers, funnelId, sessionId, successStep, trackFormSubmit, trackLeadCreated]
  );

  // Track funnel completed when reaching success step
  useEffect(() => {
    if (step === successStep) {
      trackFunnelCompleted();
    }
  }, [step, successStep, trackFunnelCompleted]);

  // Determine current question index (0-based) from step (1-based for questions)
  const currentQuestionIndex = step - 1;
  const currentQuestion = config.quiz.questions[currentQuestionIndex];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50"
      style={{ fontFamily: config.brand.fontBody }}
    >
      <div className="w-full max-w-lg mx-auto py-12 px-4">
        <ProgressBar config={config} step={step} totalQuestions={totalQuestions} />

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <WelcomeStep config={config} onStart={handleStart} />
            </motion.div>
          )}

          {step >= 1 && step <= totalQuestions && currentQuestion && (
            <motion.div
              key={`question-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <QuestionStep
                config={config}
                question={currentQuestion}
                questionNumber={step}
                totalQuestions={totalQuestions}
                selectedOptionId={answers[currentQuestion.key]}
                onSelect={handleSelect}
              />
            </motion.div>
          )}

          {step === emailStep && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <EmailStep config={config} onSubmit={handleEmailSubmit} onFieldFocus={handleEmailFocus} />
            </motion.div>
          )}

          {step === successStep && (
            <motion.div
              key="success"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <SuccessStep
                config={config}
                calendarUrl={calendarUrl}
                email={email}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
