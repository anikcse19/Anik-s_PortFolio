import { Schema } from "mongoose";
import { baseOptions, getModel, STATUS_VALUES } from "./_shared";

const skillSchema = new Schema(
  { name: { type: String, required: true }, level: { type: String, default: null }, note: { type: String, default: "" } },
  { _id: false },
);

const skillCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    skills: { type: [skillSchema], default: [] },
    status: { type: String, enum: STATUS_VALUES, default: "published" },
    sortOrder: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  baseOptions,
);
skillCategorySchema.index({ status: 1, sortOrder: 1 });

export const SkillCategoryModel = getModel<Record<string, unknown>>("SkillCategory", skillCategorySchema);
