import { NextResponse, type NextRequest } from "next/server";
import { decideZone, UNLOCK_PATH, ZONE_COOKIE, ZONE_COOKIE_MAX_AGE } from "@/lib/zones";

/**
 * 1. Admin: optimistic redirect for signed-out visitors. This only checks that a
 *    session cookie *exists*; real authorization happens on the server in every
 *    admin page, data query and server action (see lib/auth/session.ts).
 * 2. Zones: keeps visitors inside the zone they landed in (portfolio or studio)
 *    and sends cross-zone navigation to the password screen (see lib/zones.ts).
 */
const ADMIN_COOKIE_NAMES = ["__Host-admin_session", "admin_session"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname.startsWith("/admin/login")) return NextResponse.next();
    const hasSession = ADMIN_COOKIE_NAMES.some((name) => request.cookies.get(name)?.value);
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      if (pathname !== "/admin") url.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const decision = decideZone(pathname, request.cookies.get(ZONE_COOKIE)?.value);
  if (decision.action === "remember") {
    const response = NextResponse.next();
    response.cookies.set(ZONE_COOKIE, decision.zone, {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: ZONE_COOKIE_MAX_AGE,
    });
    return response;
  }
  if (decision.action === "gate") {
    const url = request.nextUrl.clone();
    url.pathname = UNLOCK_PATH;
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next internals and image optimization; static files are filtered in lib/zones.ts.
  matcher: ["/((?!_next/static|_next/image|_next/data).*)"],
};
