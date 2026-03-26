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

export default clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get('host') ?? '';
  const { userId, redirectToSignIn } = await auth();

  if (!isPlatformDomain(hostname)) {
    // Let API routes pass through on custom domains — tracking, submissions, sessions
    const path = req.nextUrl.pathname;
    if (path.startsWith('/api/')) {
      return NextResponse.next();
    }

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
