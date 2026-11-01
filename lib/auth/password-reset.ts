import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { AdminModel, PasswordResetModel, SessionModel } from "@/lib/models";
import { generateSessionToken, hmac, sha256 } from "./crypto";
import { hashPassword, validatePasswordStrength } from "./password";
import { consumeRateLimit, RATE_LIMITS, resetRateLimit } from "./rate-limit";

/**
 * Forgotten-password flow, independent of Next.js request APIs so it can be
 * unit-tested. A reset link carries a random 256-bit token; the database stores
 * only its SHA-256 hash. Links expire after 30 minutes and work once.
 */

export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export type ResetRequestResult =
  | { ok: true; issued: { token: string; email: string } | null }
  | { ok: false; reason: "rate_limited"; retryAfterSeconds: number };

/**
 * Issues a reset token when the email belongs to an admin. The caller must
 * respond identically whether or not a token was issued, so the form never
 * reveals which emails have accounts.
 */
export async function requestPasswordReset(emailRaw: string, clientIp: string): Promise<ResetRequestResult> {
  await connectDB();
  const email = emailRaw.trim().toLowerCase();
  const ipLimit = await consumeRateLimit(
    `reset:ip:${hmac(clientIp || "unknown")}`,
    RATE_LIMITS.resetRequestPerIp.limit,
    RATE_LIMITS.resetRequestPerIp.windowSeconds,
  );
  if (!ipLimit.allowed) return { ok: false, reason: "rate_limited", retryAfterSeconds: ipLimit.retryAfterSeconds };
  if (!email) return { ok: true, issued: null };

  // Per-account cap stops the form being used to flood the admin's inbox; excess requests are silently dropped.
  const accountLimit = await consumeRateLimit(
    `reset:acct:${hmac(email)}`,
    RATE_LIMITS.resetRequestPerAccount.limit,
    RATE_LIMITS.resetRequestPerAccount.windowSeconds,
  );
  if (!accountLimit.allowed) return { ok: true, issued: null };

  const admin = await AdminModel.findOne({ email }).lean();
  if (!admin) return { ok: true, issued: null };

  // Only the newest link is valid.
  await PasswordResetModel.deleteMany({ adminId: admin._id });
  const token = generateSessionToken();
  await PasswordResetModel.create({
    tokenHash: sha256(token),
    adminId: admin._id,
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });
  return { ok: true, issued: { token, email: admin.email } };
}

function isWellFormedToken(token: unknown): token is string {
  return typeof token === "string" && token.length >= 20 && token.length <= 200;
}

/** True when the token matches an unexpired reset link (does not consume it). */
export async function isResetTokenValid(token: unknown): Promise<boolean> {
  if (!isWellFormedToken(token)) return false;
  await connectDB();
  return Boolean(await PasswordResetModel.exists({ tokenHash: sha256(token), expiresAt: { $gt: new Date() } }));
}

export type ResetPasswordResult =
  | { ok: true; adminId: string }
  | { ok: false; reason: "invalid_token" }
  | { ok: false; reason: "weak_password"; message: string }
  | { ok: false; reason: "rate_limited"; retryAfterSeconds: number };

/** Sets a new password from a reset link, then signs out every session and clears login lockouts. */
export async function resetPasswordWithToken(token: unknown, newPassword: string, clientIp: string): Promise<ResetPasswordResult> {
  await connectDB();
  const ipLimit = await consumeRateLimit(
    `reset:submit:${hmac(clientIp || "unknown")}`,
    RATE_LIMITS.resetSubmitPerIp.limit,
    RATE_LIMITS.resetSubmitPerIp.windowSeconds,
  );
  if (!ipLimit.allowed) return { ok: false, reason: "rate_limited", retryAfterSeconds: ipLimit.retryAfterSeconds };
  if (!isWellFormedToken(token)) return { ok: false, reason: "invalid_token" };

  const tokenHash = sha256(token);
  const pending = await PasswordResetModel.findOne({ tokenHash, expiresAt: { $gt: new Date() } }).lean();
  if (!pending) return { ok: false, reason: "invalid_token" };
  const admin = await AdminModel.findById(pending.adminId).lean();
  if (!admin) return { ok: false, reason: "invalid_token" };

  const weakness = validatePasswordStrength(newPassword, admin.email);
  if (weakness) return { ok: false, reason: "weak_password", message: weakness };

  // Consume atomically so a link cannot be used twice, even by concurrent requests.
  const consumed = await PasswordResetModel.findOneAndDelete({ _id: pending._id });
  if (!consumed) return { ok: false, reason: "invalid_token" };

  const passwordHash = await hashPassword(newPassword);
  await AdminModel.updateOne({ _id: admin._id }, { $set: { passwordHash, passwordChangedAt: new Date() } });
  await SessionModel.deleteMany({ adminId: new Types.ObjectId(admin._id) });
  await PasswordResetModel.deleteMany({ adminId: admin._id });
  await resetRateLimit(`login:acct:${hmac(admin.email)}`);
  return { ok: true, adminId: admin._id.toString() };
}
