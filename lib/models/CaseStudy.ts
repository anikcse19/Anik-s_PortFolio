import { Schema } from "mongoose";
import { baseOptions, getModel, imageRefSchema, seoSchema, STATUS_VALUES } from "./_shared";

const caseStudySchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    summary: { type: String, required: true },
    kind: { type: String, required: true, enum: ["production", "design_exercise", "exploration"] },
    context: { type: String, default: "" },
    role: { type: String, default: "" },
    technologies: { type: [String], default: [] },
    coverImage: { type: imageRefSchema, default: null },
    // Validated by zod before every write; stored as plain structured data.
    sections: { type: [Schema.Types.Mixed], default: [] },
    relatedProjectId: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: STATUS_VALUES, default: "draft" },
    seo: { type: seoSchema, default: () => ({}) },
    sortOrder: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  baseOptions,
);
caseStudySchema.index({ status: 1, sortOrder: 1, createdAt: -1 });

export const CaseStudyModel = getModel<Record<string, unknown>>("CaseStudy", caseStudySchema);
