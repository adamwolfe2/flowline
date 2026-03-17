export async function register() {
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
