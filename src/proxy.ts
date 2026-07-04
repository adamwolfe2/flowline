import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/builder(.*)',
  '/settings(.*)',
  '/billing(.*)',
  '/admin(.*)',
  '/analytics(.*)',
  '/leads(.*)',
  '/clients(.*)',
]);

const isPlatformDomain = (hostname: string) => {
  const platform = (process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'localhost').trim();
  const host = hostname.split(':')[0]; // strip port
  return host === platform
    || host === `www.${platform}`
    || host === `app.${platform}`
    || host.includes('localhost')
    || host.includes('vercel.app');
};

// In-memory cache for dashboard domain lookups to avoid DB calls on every request
const dashboardDomainCache = new Map<string, { teamId: string | null; expiresAt: number }>();
const DASHBOARD_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function checkDashboardDomain(hostname: string, reqUrl: string): Promise<string | null> {
  const host = hostname.split(':')[0].toLowerCase();

  // Check cache first
  const cached = dashboardDomainCache.get(host);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.teamId;
  }

  try {
    const url = new URL('/api/internal/check-dashboard-domain', reqUrl);
    url.searchParams.set('host', host);
    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      const teamId = data.teamId ?? null;
      dashboardDomainCache.set(host, { teamId, expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS });
      return teamId;
    }
  } catch {
    // Fall through — treat as non-dashboard domain
  }

  dashboardDomainCache.set(host, { teamId: null, expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS });
  return null;
}

export default clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get('host') ?? '';
  const { userId, redirectToSignIn } = await auth();

  if (!isPlatformDomain(hostname)) {
    // Let API routes pass through on custom domains — tracking, submissions, sessions
    const path = req.nextUrl.pathname;
    if (path.startsWith('/api/')) {
      return NextResponse.next();
    }

    // Check if this is a custom dashboard domain (not a funnel custom domain)
    const dashboardTeamId = await checkDashboardDomain(hostname, req.url);
    if (dashboardTeamId) {
      // Dashboard domain: serve the normal app, set a cookie so the client knows which team
      if (isProtectedRoute(req) && !userId) {
        return redirectToSignIn({ returnBackUrl: req.url });
      }

      const response = NextResponse.next();
      response.cookies.set('myvsl_team_domain', dashboardTeamId, {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });
      return response;
    }

    // Funnel subdomain rewrite
    const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? '';
    if (hostname.endsWith(`.${platformDomain}`)) {
      const slug = hostname.replace(`.${platformDomain}`, '');
      return NextResponse.rewrite(new URL(`/f/${slug}`, req.url));
    }
    return NextResponse.rewrite(new URL(`/f/domain/${hostname}`, req.url));
  }

  if (isProtectedRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/webhooks|api/stripe|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp|xml|txt|json|webmanifest)$).*)'],
};
