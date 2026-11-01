import { Schema, type Types } from "mongoose";
import { getModel } from "./_shared";

export type PasswordResetDoc = {
  _id: Types.ObjectId;
  /** SHA-256 of the reset token; the raw token only ever lives in the emailed link. */
  tokenHash: string;
  adminId: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
};

const passwordResetSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
// MongoDB removes expired reset links automatically.
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetModel = getModel<PasswordResetDoc>("PasswordReset", passwordResetSchema);
