import { parseHttpUrl } from "./urls";

/**
 * Image URL rules (shared by the admin UI and server-side validation).
 *
 * Images are never uploaded. Every image field stores either:
 *  - an absolute http(s) URL hosted elsewhere, or
 *  - a root-relative path to a file committed under /public (e.g. "/projects/rexvet.png").
 */

const LOCAL_IMAGE_PATH = /^\/(?!\/)[A-Za-z0-9_\-./]+\.(png|jpe?g|webp|gif|avif|svg)$/i;

export type ImageUrlCheck =
  | { ok: true; kind: "empty" }
  | { ok: true; kind: "local" | "remote"; url: string; warning?: string }
  | { ok: false; error: string };

export function checkImageUrl(raw: string | null | undefined): ImageUrlCheck {
  const value = (raw ?? "").trim();
  if (!value) return { ok: true, kind: "empty" };

  if (value.startsWith("/") && !value.startsWith("//")) {
    if (value.includes("..") || !LOCAL_IMAGE_PATH.test(value)) {
      return { ok: false, error: "Local paths must point to an image file in /public, e.g. /projects/cover.png" };
    }
    return { ok: true, kind: "local", url: value };
  }

  if (!/^https?:\/\//i.test(value)) {
    return { ok: false, error: "Enter a full image URL starting with https://" };
  }
  const url = parseHttpUrl(value);
  if (!url) {
    return { ok: false, error: "This URL is not allowed. Use a public http(s) address without credentials." };
  }
  if (/\.(html?|php|aspx?)$/i.test(url.pathname)) {
    return { ok: false, error: "This looks like a web page, not an image. Use the direct image address." };
  }
  if (url.protocol === "http:") {
    return {
      ok: true,
      kind: "remote",
      url: url.toString(),
      warning: "Insecure http:// image. Browsers will try https:// and block it if unavailable.",
    };
  }
  return { ok: true, kind: "remote", url: url.toString() };
}

export function isValidImageUrl(raw: string): boolean {
  const res = checkImageUrl(raw);
  return res.ok && res.kind !== "empty";
}

/** Hosts next/image may optimize (configured in next.config.ts). */
export function getOptimizedHosts(): string[] {
  return (process.env.NEXT_PUBLIC_OPTIMIZED_IMAGE_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
}

/** Whether a stored image URL can go through next/image (local files and allow-listed https hosts). */
export function canOptimizeImage(src: string, hosts: string[] = getOptimizedHosts()): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return !src.toLowerCase().endsWith(".svg");
  try {
    const url = new URL(src);
    if (url.protocol !== "https:") return false;
    if (url.pathname.toLowerCase().endsWith(".svg")) return false;
    return hosts.includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

/** Notes shown next to image fields so editors understand hotlinking limits. */
export const IMAGE_HOSTING_HINT =
  "Paste a direct image link (it should open just the image in a browser tab). Share-page links from Google Drive, Dropbox or Google Photos usually do not work because those services block embedding.";
