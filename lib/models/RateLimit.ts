import { Schema } from "mongoose";
import { getModel } from "./_shared";

const rateLimitSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false },
);
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimitModel = getModel<{ key: string; count: number; expiresAt: Date }>("RateLimit", rateLimitSchema);
