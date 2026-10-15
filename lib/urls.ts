/**
 * URL safety helpers shared by client and server code.
 * Nothing here performs network access.
 */

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /\.localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^0\./,
  /^\[?::1\]?$/,
  /^\[?f[cd][0-9a-f]{2}:/i,
  /^\[?fe80:/i,
];

/** True for hostnames that point at loopback, link-local or private networks. */
export function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return PRIVATE_HOST_PATTERNS.some((re) => re.test(host));
}

/** Parses an absolute http(s) URL without credentials. Returns null when unsafe. */
export function parseHttpUrl(raw: string): URL | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > 2048) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  if (!url.hostname || isPrivateHostname(url.hostname)) return null;
  return url;
}

export function isHttpUrl(raw: string): boolean {
  return parseHttpUrl(raw) !== null;
}

/** Root-relative path within this site, e.g. "/projects" or "/#contact". Rejects protocol-relative "//". */
export function isInternalPath(raw: string): boolean {
  if (typeof raw !== "string") return false;
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return false;
  if (value.length > 512) return false;
  // Only characters that are valid in a path, query or fragment; no whitespace or control chars.
  return /^\/[A-Za-z0-9\-._~/?#=&%+:@]*$/.test(value) && !value.includes("..");
}

/**
 * Accepts the link formats an editor may use for navigation and CTAs:
 * internal paths, in-page anchors, http(s) URLs and mailto: addresses.
 */
export function isSafeHref(raw: string): boolean {
  if (typeof raw !== "string") return false;
  const value = raw.trim();
  if (!value) return false;
  if (value.startsWith("#")) return /^#[A-Za-z][\w-]*$/.test(value);
  if (value.startsWith("/")) return isInternalPath(value);
  if (value.toLowerCase().startsWith("mailto:")) {
    return /^mailto:[^\s@<>()"]+@[^\s@<>()"]+\.[^\s@<>()"]+$/i.test(value) && value.length <= 320;
  }
  return isHttpUrl(value);
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Sanitizes a post-login redirect target. Only paths inside /admin are allowed,
 * which rules out open redirects (absolute URLs, "//evil.com", "/\evil.com").
 */
export function safeAdminRedirect(raw: unknown, fallback = "/admin"): string {
  if (typeof raw !== "string") return fallback;
  const value = raw.trim();
  if (!isInternalPath(value)) return fallback;
  if (value !== "/admin" && !value.startsWith("/admin/") && !value.startsWith("/admin?")) return fallback;
  if (value.startsWith("/admin/login")) return fallback;
  return value;
}
