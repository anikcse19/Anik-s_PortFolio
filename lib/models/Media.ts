import { Schema } from "mongoose";
import { baseOptions, getModel } from "./_shared";

/** A saved external image URL with metadata. Nothing is uploaded or stored locally. */
const mediaSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "" },
    caption: { type: String, default: "" },
    label: { type: String, default: "" },
    tags: { type: [String], default: [] },
  },
  baseOptions,
);
mediaSchema.index({ url: 1 });
mediaSchema.index({ createdAt: -1 });

export const MediaModel = getModel<Record<string, unknown>>("Media", mediaSchema);
