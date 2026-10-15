import { Schema } from "mongoose";
import { baseOptions, getModel, imageRefSchema, seoSchema, STATUS_VALUES } from "./_shared";

const articleSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    category: { type: String, default: "" },
    tags: { type: [String], default: [] },
    coverImage: { type: imageRefSchema, default: null },
    blocks: { type: [Schema.Types.Mixed], default: [] },
    readingMinutes: { type: Number, default: 1 },
    relatedProjectIds: { type: [Schema.Types.ObjectId], ref: "Project", default: [] },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: STATUS_VALUES, default: "draft" },
    seo: { type: seoSchema, default: () => ({}) },
    sortOrder: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  baseOptions,
);
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ tags: 1 });

export const ArticleModel = getModel<Record<string, unknown>>("Article", articleSchema);
