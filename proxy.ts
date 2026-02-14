import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "akib_admin_session";

const isProtectedAdminPage = (path: string) => path.startsWith("/admin") && path !== "/admin/login";
const isProtectedAdminApi = (path: string) => path.startsWith("/api/admin") && path !== "/api/admin/login";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedAdminPage(pathname) && !isProtectedAdminApi(pathname)) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.get(ADMIN_COOKIE)?.value === "authorized";
  if (hasSession) {
    return NextResponse.next();
  }

  if (isProtectedAdminApi(pathname)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
