import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic redirect for signed-out visitors. This only checks that a session
 * cookie *exists*; real authorization happens on the server in every admin
 * page, data query and server action (see lib/auth/session.ts).
 */
const COOKIE_NAMES = ["__Host-admin_session", "admin_session"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  const hasSession = COOKIE_NAMES.some((name) => request.cookies.get(name)?.value);
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    if (pathname !== "/admin") url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
