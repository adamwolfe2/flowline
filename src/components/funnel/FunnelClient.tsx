"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FunnelConfig } from "@/types";
import { WelcomeStep } from "./WelcomeStep";
import { QuestionStep } from "./QuestionStep";
import { EmailStep } from "./EmailStep";
import { SuccessStep } from "./SuccessStep";
import { ProgressBar } from "./ProgressBar";

interface FunnelClientProps {
  config: FunnelConfig;
  funnelId: string;
}

export function FunnelClient({ config, funnelId }: FunnelClientProps) {
  const totalQuestions = config.quiz.questions.length;
  // Steps: 0=Welcome, 1..N=Questions, N+1=Email, N+2=Success
  const emailStep = totalQuestions + 1;
  const successStep = totalQuestions + 2;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [calendarUrl, setCalendarUrl] = useState("");
  const sessionIdRef = useRef<string | null>(null);

  // Track session start on mount
  useEffect(() => {
    const trackSession = async () => {
      try {
        const res = await fetch(`/api/sessions/${funnelId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "start" }),
        });
        if (res.ok) {
          const data = await res.json();
          sessionIdRef.current = data.sessionId ?? null;
        }
      } catch {
        // Non-blocking — session tracking is best-effort
      }
    };
    trackSession();
  }, [funnelId]);

  const handleStart = useCallback(() => {
    setStep(1);
  }, []);

  const handleSelect = useCallback(
    (key: string, id: string) => {
      setAnswers((prev) => ({ ...prev, [key]: id }));
      // Auto-advance after a brief delay
      setTimeout(() => {
        setStep((prev) => prev + 1);
      }, 350);
    },
    []
  );

  const handleEmailSubmit = useCallback(
    async (submittedEmail: string) => {
      setEmail(submittedEmail);
      try {
        const res = await fetch(`/api/submit/${funnelId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: submittedEmail, answers }),
        });
        const data = await res.json();
        if (data.calendarUrl) {
          setCalendarUrl(data.calendarUrl);
        }
      } catch {
        // Still show success step even if submit fails
      }

      // Mark session completed + converted
      if (sessionIdRef.current) {
        fetch(`/api/sessions/${funnelId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "complete",
            sessionId: sessionIdRef.current,
          }),
        }).catch(() => {});
      }

      setStep(successStep);
    },
    [answers, funnelId, successStep]
  );

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
              <EmailStep config={config} onSubmit={handleEmailSubmit} />
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
