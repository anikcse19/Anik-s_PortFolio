"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hmac, sha256 } from "@/lib/auth/crypto";
import { consumeRateLimit, RATE_LIMITS } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/auth/session";
import { isDatabaseConfigured } from "@/lib/db";
import { getGatePassword } from "@/lib/env";
import { safeZoneTarget, ZONE_COOKIE, ZONE_COOKIE_MAX_AGE } from "@/lib/zones";

export type UnlockState = { error: string | null };

function passwordMatches(input: string, expected: string): boolean {
  // Compare fixed-length digests so neither length nor content leaks through timing.
  return timingSafeEqual(Buffer.from(sha256(input), "hex"), Buffer.from(sha256(expected), "hex"));
}

export async function unlockAction(_prev: UnlockState, formData: FormData): Promise<UnlockState> {
  const target = safeZoneTarget(formData.get("next"));
  if (!target) return { error: "This link is not valid. Go back and try again." };

  const expected = getGatePassword();
  if (!expected) return { error: "Access is not configured on this site yet." };

  if (isDatabaseConfigured()) {
    const limit = await consumeRateLimit(`gate:${hmac(await getClientIp())}`, RATE_LIMITS.gatePerIp.limit, RATE_LIMITS.gatePerIp.windowSeconds);
    if (!limit.allowed) {
      return { error: `Too many attempts. Try again in about ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` };
    }
  }

  const password = String(formData.get("password") ?? "");
  if (!password || !passwordMatches(password, expected)) return { error: "That password is not correct." };

  (await cookies()).set(ZONE_COOKIE, target.zone, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ZONE_COOKIE_MAX_AGE,
  });
  redirect(target.path);
}
