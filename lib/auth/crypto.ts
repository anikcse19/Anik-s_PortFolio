import { createHash, createHmac, randomBytes } from "node:crypto";
import { getAuthSecret } from "@/lib/env";

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Keyed hash for values we must correlate but should not store raw (IPs, emails in rate-limit keys). */
export function hmac(value: string): string {
  return createHmac("sha256", getAuthSecret()).update(value).digest("hex").slice(0, 32);
}
