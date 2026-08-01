import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";

  // Skip local development environments
  if (host.includes("localhost") || host.includes("127.0.0.1") || host.includes("::1")) {
    return NextResponse.next();
  }

  const primaryDomain = "akibhasan.online";

  // If host is an old domain (e.g. gds-training.vercel.app, training.airtechaviation.click, etc.), redirect 301
  if (host && !host.includes(primaryDomain)) {
    const redirectUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${primaryDomain}`);
    return NextResponse.redirect(redirectUrl, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
  ],
};
