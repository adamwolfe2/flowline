function validateEnv() {
  const required = ["DATABASE_URL", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[MyVSL] Missing required env vars: ${missing.join(", ")}`);
  }

  const optional: Record<string, string> = {
    STRIPE_SECRET_KEY: "Billing/checkout disabled",
    RESEND_API_KEY: "Email sending disabled",
    OPENAI_API_KEY: "AI funnel generation disabled",
    BLOB_READ_WRITE_TOKEN: "Logo uploads disabled",
    SENTRY_DSN: "Error tracking disabled",
    UPSTASH_REDIS_REST_URL: "Rate limiting will use in-memory fallback",
  };
  for (const [key, impact] of Object.entries(optional)) {
    if (!process.env[key]) {
      console.warn(`[MyVSL] ${key} not set — ${impact}`);
    }
  }
}

export async function register() {
  validateEnv();

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
      enabled: !!process.env.SENTRY_DSN,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
      enabled: !!process.env.SENTRY_DSN,
    });
  }
}

export const onRequestError = async (
  error: Error,
  request: { method: string; url: string; headers: Record<string, string> },
  context: { routerKind: string; routePath: string; routeType: string; renderSource: string }
) => {
  if (process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error, {
      extra: {
        method: request.method,
        url: request.url,
        routePath: context.routePath,
        routeType: context.routeType,
      },
    });
  }
};
