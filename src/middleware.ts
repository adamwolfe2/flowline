import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") || "";
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "localhost:3000";
  const pathname = req.nextUrl.pathname;

  // Static files and API routes — pass through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Platform routes — pass through (includes localhost for dev)
  const isLocalhost = hostname.startsWith("localhost") || hostname.startsWith("127.0.0.1");
  const isPlatform = hostname === platformDomain || hostname === `app.${platformDomain}` || isLocalhost;

  if (isPlatform) {
    return NextResponse.next();
  }

  // Subdomain funnel: slug.yourdomain.com
  if (hostname.endsWith(`.${platformDomain}`)) {
    const slug = hostname.replace(`.${platformDomain}`, "");
    const url = req.nextUrl.clone();
    url.pathname = `/f/${slug}`;
    return NextResponse.rewrite(url);
  }

  // Custom domain — rewrite to domain route
  const url = req.nextUrl.clone();
  url.pathname = `/f/domain/${hostname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
