"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [status, setStatus] = useState<"loading" | "accepting" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      // Redirect to sign-in with return URL
      router.push(`/sign-in?redirect_url=/invite/${token}`);
      return;
    }

    // Accept the invite
    setStatus("accepting");
    fetch(`/api/teams/invite/${token}`, { method: "POST" })
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus("success");
          setTimeout(() => router.push("/settings"), 2000);
        } else {
          setStatus("error");
          setError(data.error || "Failed to accept invite");
        }
      })
      .catch(() => {
        setStatus("error");
        setError("Something went wrong");
      });
  }, [isLoaded, isSignedIn, token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm px-4">
        {(status === "loading" || status === "accepting") && (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F] mx-auto mb-4" />
            <p className="text-sm text-gray-500">Accepting your invite...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">You're in!</h2>
            <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Invite Error</h2>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button onClick={() => router.push("/dashboard")} variant="outline" size="sm">
              Go to Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
