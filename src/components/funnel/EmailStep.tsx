"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FunnelConfig } from "@/types";

interface EmailStepProps {
  config: FunnelConfig;
  onSubmit: (email: string) => void;
  onFieldFocus?: () => void;
}

export function EmailStep({ config, onSubmit, onFieldFocus }: EmailStepProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { brand } = config;

  function validateEmail(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);
    onSubmit(email);
  }

  return (
    <div className="flex flex-col items-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        {brand.logoUrl ? (
          <div className="inline-flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-3 mb-6">
            <Image
              src={brand.logoUrl}
              alt={brand.name}
              width={100}
              height={36}
              style={{ objectFit: "contain" }}
            />
          </div>
        ) : (
          <div className="inline-flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-3 mb-6">
            <span
              className="text-lg font-bold"
              style={{ color: brand.primaryColor, fontFamily: brand.fontHeading }}
            >
              {brand.name}
            </span>
          </div>
        )}
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: brand.primaryColorLight }}>
          <svg className="w-6 h-6" style={{ color: brand.primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2
          className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: brand.fontHeading }}
        >
          One last step
        </h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Enter your email to see your results and book your call.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="w-full max-w-sm"
        noValidate
      >
        <div className="mb-3">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            className="w-full px-4 py-3.5 rounded-xl border-2 text-base text-gray-900 placeholder-gray-400 outline-none transition-all duration-150 focus:ring-2"
            style={{
              borderColor: error ? "#EF4444" : "#E5E7EB",
              fontSize: "16px",
            }}
            onFocus={(e) => {
              onFieldFocus?.();
              if (!error) (e.currentTarget as HTMLInputElement).style.borderColor = brand.primaryColor;
            }}
            onBlur={(e) => {
              if (!error) (e.currentTarget as HTMLInputElement).style.borderColor = "#E5E7EB";
            }}
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 mt-1.5 text-left"
            >
              {error}
            </motion.p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full py-4 rounded-xl text-white font-semibold text-base shadow-lg transition-all"
          style={{
            backgroundColor: loading ? "#93C5FD" : brand.primaryColor,
            cursor: loading ? "not-allowed" : "pointer",
            minHeight: "48px",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          ) : (
            "See My Results & Book a Call →"
          )}
        </motion.button>

        <p className="text-xs text-gray-400 mt-3">
          No spam. Unsubscribe anytime.
        </p>
      </motion.form>
    </div>
  );
}
