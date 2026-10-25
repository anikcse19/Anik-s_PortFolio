/**
 * The site is split into two "zones" that present the same person differently:
 *
 * - `portfolio` — the personal portfolio for employers (`/`, `/projects`, ...).
 * - `studio`    — the custom-software service offering (`/studio` and below).
 *
 * A visitor's landing zone is remembered in a cookie. Crossing into the other
 * zone requires the gate password (see proxy.ts and app/unlock). This is a soft
 * separation between two audiences, not access control: anyone can land in
 * either zone directly from a shared link.
 *
 * Pure module: safe to import from the proxy, server and client code.
 */

export type Zone = "portfolio" | "studio";

/** URL segment of the studio. Rename together with the `app/studio` folder. */
export const STUDIO_BASE = "/studio";
export const UNLOCK_PATH = "/unlock";
export const ZONE_COOKIE = "site_zone";
export const ZONE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const ZONE_HOME: Record<Zone, string> = { portfolio: "/", studio: STUDIO_BASE };

/** Paths that belong to neither zone and are never gated. */
const NEUTRAL_PREFIXES = ["/admin", UNLOCK_PATH, "/_next", "/api", "/.well-known"];
const NEUTRAL_FILES = new Set(["/robots.txt", "/sitemap.xml", "/favicon.ico", "/manifest.webmanifest"]);

function hasPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Zone a path belongs to, or null for neutral paths (admin, unlock screen, assets, metadata). */
export function zoneForPath(pathname: string): Zone | null {
  if (NEUTRAL_FILES.has(pathname)) return null;
  if (NEUTRAL_PREFIXES.some((p) => hasPrefix(pathname, p))) return null;
  // Static files from /public (e.g. /p1.png, /resume.pdf) and generated icons.
  if (/\.[a-z0-9]{2,5}$/i.test(pathname)) return null;
  if (hasPrefix(pathname, STUDIO_BASE)) return "studio";
  return "portfolio";
}

export function parseZone(value: string | undefined | null): Zone | null {
  return value === "portfolio" || value === "studio" ? value : null;
}

export type ZoneDecision =
  | { action: "pass" }
  /** First visit (or unknown cookie): remember the landing zone. */
  | { action: "remember"; zone: Zone }
  /** Crossing into the other zone: show the password screen. */
  | { action: "gate"; from: Zone; to: Zone };

export function decideZone(pathname: string, cookieValue: string | undefined | null): ZoneDecision {
  const target = zoneForPath(pathname);
  if (!target) return { action: "pass" };
  const current = parseZone(cookieValue);
  if (!current) return { action: "remember", zone: target };
  if (current === target) return { action: "pass" };
  return { action: "gate", from: current, to: target };
}

/**
 * Validates the post-unlock destination. Only internal paths that belong to a
 * zone are accepted, which rules out open redirects and loops back to /unlock.
 */
export function safeZoneTarget(raw: unknown): { path: string; zone: Zone } | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\") || value.length > 512) return null;
  if (!/^\/[A-Za-z0-9\-._~/?#=&%+:@]*$/.test(value) || value.includes("..")) return null;
  const pathname = value.split(/[?#]/)[0] || "/";
  const zone = zoneForPath(pathname);
  return zone ? { path: value, zone } : null;
}
