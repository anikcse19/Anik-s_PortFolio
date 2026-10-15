import { Schema, type Types } from "mongoose";
import { getModel } from "./_shared";

export type AdminDoc = {
  _id: Types.ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  passwordChangedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    passwordHash: { type: String, required: true, select: false },
    passwordChangedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const AdminModel = getModel<AdminDoc>("Admin", adminSchema);
