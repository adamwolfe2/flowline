"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif", margin: 0 }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          padding: "24px",
        }}>
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <div style={{
              width: "56px",
              height: "56px",
              backgroundColor: "rgba(45, 106, 79, 0.1)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "8px",
            }}>
              Something went wrong
            </h2>
            <p style={{
              fontSize: "14px",
              color: "#6B7280",
              marginBottom: "24px",
              lineHeight: 1.5,
            }}>
              An unexpected error occurred. Our team has been notified and is looking into it.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  backgroundColor: "#2D6A4F",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <a
                href="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 20px",
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  color: "#333333",
                  fontSize: "14px",
                  fontWeight: 500,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
