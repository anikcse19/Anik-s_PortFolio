import { connectDB } from "@/lib/db";
import { RateLimitModel } from "@/lib/models";

/**
 * Fixed-window rate limiter backed by MongoDB, so limits hold across
 * serverless instances (in-memory counters would reset on every cold start).
 * Expired windows are removed by a TTL index.
 */

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

export async function consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  await connectDB();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowSeconds * 1000);

  // Atomic upsert: start a new window if the previous one expired, otherwise increment.
  const doc = await RateLimitModel.collection.findOneAndUpdate(
    { key },
    [
      {
        $set: {
          count: {
            $cond: [{ $or: [{ $lte: ["$expiresAt", now] }, { $eq: [{ $type: "$expiresAt" }, "missing"] }] }, 1, { $add: ["$count", 1] }],
          },
          expiresAt: {
            $cond: [{ $or: [{ $lte: ["$expiresAt", now] }, { $eq: [{ $type: "$expiresAt" }, "missing"] }] }, windowEnd, "$expiresAt"],
          },
        },
      },
    ],
    { upsert: true, returnDocument: "after" },
  );

  const count = typeof doc?.count === "number" ? doc.count : 1;
  const expiresAt = doc?.expiresAt instanceof Date ? doc.expiresAt : windowEnd;
  const retryAfterSeconds = Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000));
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), retryAfterSeconds };
}

/** Reads the current count without consuming an attempt. */
export async function peekRateLimit(key: string, limit: number): Promise<RateLimitResult> {
  await connectDB();
  const now = new Date();
  const doc = await RateLimitModel.findOne({ key, expiresAt: { $gt: now } }).lean();
  if (!doc) return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  const retryAfterSeconds = Math.max(1, Math.ceil((doc.expiresAt.getTime() - now.getTime()) / 1000));
  return { allowed: doc.count < limit, remaining: Math.max(0, limit - doc.count), retryAfterSeconds };
}

export async function resetRateLimit(key: string): Promise<void> {
  await connectDB();
  await RateLimitModel.deleteOne({ key });
}

export const RATE_LIMITS = {
  loginPerIp: { limit: 10, windowSeconds: 15 * 60 },
  loginFailuresPerAccount: { limit: 5, windowSeconds: 15 * 60 },
  contactPerIp: { limit: 5, windowSeconds: 60 * 60 },
  gatePerIp: { limit: 10, windowSeconds: 15 * 60 },
  linkCheck: { limit: 6, windowSeconds: 10 * 60 },
} as const;
