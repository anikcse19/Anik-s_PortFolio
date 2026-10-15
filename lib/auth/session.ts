import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getAdminForToken, type SessionAdmin } from "./sessions";

/**
 * Cookie + request integration for admin sessions.
 *
 * The cookie holds a random 256-bit token; the database stores only its SHA-256
 * hash. Cookies are httpOnly, SameSite=Lax and Secure in production (with the
 * __Host- prefix, which pins them to this origin and path "/").
 */

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-admin_session" : "admin_session";

export class UnauthorizedError extends Error {
  constructor() {
    super("Your session has expired. Please sign in again.");
    this.name = "UnauthorizedError";
  }
}

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Current admin for this request (memoized per request). Null when signed out or expired. */
export const getCurrentAdmin = cache(async (): Promise<SessionAdmin | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  return getAdminForToken(token);
});

/** For Server Components / pages: redirects to the login page when unauthenticated. */
export async function requireAdmin(): Promise<SessionAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** For Server Actions and data access: throws instead of redirecting. */
export async function requireAdminForAction(): Promise<SessionAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new UnauthorizedError();
  return admin;
}

/** Client IP as reported by the hosting proxy (Vercel overwrites x-forwarded-for). */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip")?.trim() ?? "unknown";
}

export async function getUserAgent(): Promise<string> {
  return (await headers()).get("user-agent") ?? "";
}
