import type { NextConfig } from "next";

/**
 * Remote image hosts that next/image is allowed to optimize.
 *
 * Images from any other http(s) host still render, but as plain lazy-loaded
 * <img> elements without server-side optimization. Keeping this list explicit
 * prevents the optimizer from being used as an open image proxy, and keeps the
 * Vercel free-tier image-optimization quota predictable.
 *
 * Override with IMAGE_REMOTE_HOSTS="host-a.com,host-b.com" (set it to "none" to
 * disable remote optimization entirely).
 */
const DEFAULT_IMAGE_HOSTS = [
  "res.cloudinary.com",
  "images.unsplash.com",
  "i.imgur.com",
  "i.ibb.co",
  "raw.githubusercontent.com",
  "user-images.githubusercontent.com",
  "avatars.githubusercontent.com",
];

function parseImageHosts(): string[] {
  const raw = process.env.IMAGE_REMOTE_HOSTS;
  if (raw === undefined || raw.trim() === "") return DEFAULT_IMAGE_HOSTS;
  if (raw.trim().toLowerCase() === "none") return [];
  return raw
    .split(",")
    .map((h) => h.trim().toLowerCase())
    // Hostnames only: no wildcards, schemes, ports, or paths.
    .filter((h) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(h));
}

const imageHosts = parseImageHosts();
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  // Next.js injects inline bootstrap scripts; a nonce-based policy would force
  // every page to render dynamically, which defeats static generation here.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Uses Node-only modules (fontkit, yoga); load it at runtime instead of bundling.
  serverExternalPackages: ["@react-pdf/renderer"],
  env: {
    // Not a secret: the client image component needs to know which hosts the
    // optimizer accepts so it can fall back to a plain <img> for others.
    NEXT_PUBLIC_OPTIMIZED_IMAGE_HOSTS: imageHosts.join(","),
  },
  images: {
    remotePatterns: imageHosts.map((hostname) => ({ protocol: "https" as const, hostname, pathname: "/**" })),
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
  async redirects() {
    return [{ source: "/api/message", destination: "/contact", permanent: true }];
  },
};

export default nextConfig;
