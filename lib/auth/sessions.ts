import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { AdminModel, SessionModel } from "@/lib/models";
import { generateSessionToken, hmac, sha256 } from "./crypto";
import { getDummyHash, verifyPassword } from "./password";
import { consumeRateLimit, peekRateLimit, RATE_LIMITS, resetRateLimit } from "./rate-limit";

/**
 * Database-level session logic, independent of Next.js request APIs so it can be
 * unit-tested. Cookie handling lives in ./session.ts.
 */

export const SESSION_ABSOLUTE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const SESSION_IDLE_TTL_MS = 24 * 60 * 60 * 1000;
const TOUCH_INTERVAL_MS = 10 * 60 * 1000;

export type SessionAdmin = { id: string; email: string; name: string; sessionId: string };

export async function createSession(adminId: string, userAgent = ""): Promise<{ token: string; expiresAt: Date }> {
  await connectDB();
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_ABSOLUTE_TTL_MS);
  await SessionModel.create({
    tokenHash: sha256(token),
    adminId: new Types.ObjectId(adminId),
    expiresAt,
    lastSeenAt: new Date(),
    userAgent: userAgent.slice(0, 300),
  });
  return { token, expiresAt };
}

export async function getAdminForToken(token: string | undefined | null): Promise<SessionAdmin | null> {
  if (!token || token.length < 20 || token.length > 200) return null;
  await connectDB();
  const now = Date.now();
  const session = await SessionModel.findOne({ tokenHash: sha256(token) }).lean();
  if (!session) return null;

  const expired = session.expiresAt.getTime() <= now;
  const idle = now - new Date(session.lastSeenAt).getTime() > SESSION_IDLE_TTL_MS;
  if (expired || idle) {
    await SessionModel.deleteOne({ _id: session._id });
    return null;
  }

  const admin = await AdminModel.findById(session.adminId).lean();
  if (!admin) {
    await SessionModel.deleteOne({ _id: session._id });
    return null;
  }
  // Sessions issued before the last password change are invalid.
  if (admin.passwordChangedAt && new Date(session.createdAt).getTime() < new Date(admin.passwordChangedAt).getTime()) {
    await SessionModel.deleteOne({ _id: session._id });
    return null;
  }

  if (now - new Date(session.lastSeenAt).getTime() > TOUCH_INTERVAL_MS) {
    await SessionModel.updateOne({ _id: session._id }, { $set: { lastSeenAt: new Date() } });
  }

  return { id: admin._id.toString(), email: admin.email, name: admin.name, sessionId: session._id.toString() };
}

export async function deleteSessionByToken(token: string | undefined | null): Promise<void> {
  if (!token) return;
  await connectDB();
  await SessionModel.deleteOne({ tokenHash: sha256(token) });
}

export async function deleteOtherSessions(adminId: string, keepToken?: string): Promise<number> {
  await connectDB();
  const filter: Record<string, unknown> = { adminId: new Types.ObjectId(adminId) };
  if (keepToken) filter.tokenHash = { $ne: sha256(keepToken) };
  const res = await SessionModel.deleteMany(filter);
  return res.deletedCount ?? 0;
}

export type LoginResult =
  | { ok: true; adminId: string }
  | { ok: false; reason: "invalid" }
  | { ok: false; reason: "rate_limited"; retryAfterSeconds: number };

/**
 * Verifies credentials with per-IP and per-account throttling.
 * Responses are identical for unknown accounts and wrong passwords.
 */
export async function verifyLogin(emailRaw: string, password: string, clientIp: string): Promise<LoginResult> {
  await connectDB();
  const email = emailRaw.trim().toLowerCase();
  const ipKey = `login:ip:${hmac(clientIp || "unknown")}`;
  const accountKey = `login:acct:${hmac(email)}`;

  const ipLimit = await consumeRateLimit(ipKey, RATE_LIMITS.loginPerIp.limit, RATE_LIMITS.loginPerIp.windowSeconds);
  if (!ipLimit.allowed) return { ok: false, reason: "rate_limited", retryAfterSeconds: ipLimit.retryAfterSeconds };

  const accountLimit = await peekRateLimit(accountKey, RATE_LIMITS.loginFailuresPerAccount.limit);
  if (!accountLimit.allowed) return { ok: false, reason: "rate_limited", retryAfterSeconds: accountLimit.retryAfterSeconds };

  const admin = email ? await AdminModel.findOne({ email }).select("+passwordHash").lean() : null;
  const valid = admin
    ? await verifyPassword(password, admin.passwordHash)
    : (await verifyPassword(password, await getDummyHash()), false);

  if (!admin || !valid) {
    await consumeRateLimit(
      accountKey,
      RATE_LIMITS.loginFailuresPerAccount.limit,
      RATE_LIMITS.loginFailuresPerAccount.windowSeconds,
    );
    return { ok: false, reason: "invalid" };
  }

  await resetRateLimit(accountKey);
  await AdminModel.updateOne({ _id: admin._id }, { $set: { lastLoginAt: new Date() } });
  return { ok: true, adminId: admin._id.toString() };
}
