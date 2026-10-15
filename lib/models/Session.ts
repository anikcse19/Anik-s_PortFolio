import { Schema, type Types } from "mongoose";
import { getModel } from "./_shared";

export type SessionDoc = {
  _id: Types.ObjectId;
  /** SHA-256 of the session token; the raw token only ever lives in the cookie. */
  tokenHash: string;
  adminId: Types.ObjectId;
  expiresAt: Date;
  lastSeenAt: Date;
  userAgent: string;
  createdAt: Date;
};

const sessionSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    expiresAt: { type: Date, required: true },
    lastSeenAt: { type: Date, default: () => new Date() },
    userAgent: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
// MongoDB removes expired sessions automatically.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel = getModel<SessionDoc>("Session", sessionSchema);
