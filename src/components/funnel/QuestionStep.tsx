"use client";

import { motion } from "framer-motion";
import { FunnelConfig, QuizQuestion } from "@/types";

interface QuestionStepProps {
  config: FunnelConfig;
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionId?: string;
  onSelect: (key: string, id: string) => void;
  onBack?: () => void;
}

export function QuestionStep({
  config,
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  onSelect,
  onBack,
}: QuestionStepProps) {
  const { brand } = config;

  return (
    <div className="w-full px-4">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Question {questionNumber} of {totalQuestions}
        </p>
        <h2
          className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug"
          style={{ fontFamily: brand.fontHeading }}
        >
          {question.text}
        </h2>
      </motion.div>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.22 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(question.key, opt.id)}
              className="w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-150 flex items-center justify-between group"
              style={{
                borderColor: isSelected ? brand.primaryColor : "#E5E7EB",
                backgroundColor: isSelected ? brand.primaryColorLight : "#FFFFFF",
                minHeight: "56px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = brand.primaryColor;
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = brand.primaryColorLight;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#E5E7EB";
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#FFFFFF";
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150"
                  style={{
                    borderColor: isSelected ? brand.primaryColor : "#D1D5DB",
                    backgroundColor: isSelected ? brand.primaryColor : "transparent",
                  }}
                >
                  {isSelected && (
                    <motion.svg
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>
                <span
                  className="text-sm sm:text-base font-medium"
                  style={{ color: isSelected ? brand.primaryColorDark : "#374151" }}
                >
                  {opt.label}
                </span>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: brand.primaryColor }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 sm:hidden mt-4 text-center">Tap an answer to continue</p>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          &larr; Back
        </button>
      )}
    </div>
  );
}
