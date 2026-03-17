"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <h2 className="text-xl font-semibold text-[#111827] mb-2">Something went wrong</h2>
      <p className="text-sm text-[#6B7280] mb-6">An unexpected error occurred.</p>
      <button onClick={reset} className="bg-[#2D6A4F] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#245840] transition-colors">
        Try again
      </button>
    </div>
  );
}
