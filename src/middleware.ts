import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/builder(.*)',
  '/onboarding(.*)',
  '/settings(.*)',
]);

const isPlatformDomain = (hostname: string) => {
  const platform = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'localhost';
  return hostname === platform
    || hostname === `app.${platform}`
    || hostname.includes('localhost')
    || hostname.includes('vercel.app');
};

export default clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get('host') ?? '';
  const { userId, redirectToSignIn } = await auth();

  if (!isPlatformDomain(hostname)) {
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)'],
};
