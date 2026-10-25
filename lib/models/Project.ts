import { Schema } from "mongoose";
import { baseOptions, getModel, imageRefSchema, seoSchema, STATUS_VALUES } from "./_shared";

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    summary: { type: String, required: true },
    type: { type: String, required: true, enum: ["professional", "personal", "open_source"] },
    category: { type: String, default: "" },
    year: { type: String, default: "" },
    organization: { type: String, default: "" },
    role: { type: String, default: "" },
    technologies: { type: [String], default: [] },
    overview: { type: String, default: "" },
    problem: { type: String, default: "" },
    contribution: { type: String, default: "" },
    architecture: { type: String, default: "" },
    decisions: { type: [new Schema({ title: String, body: String }, { _id: false })], default: [] },
    features: { type: [String], default: [] },
    challenges: { type: [new Schema({ challenge: String, solution: String }, { _id: false })], default: [] },
    outcomes: { type: [String], default: [] },
    impact: { type: [new Schema({ value: String, label: String }, { _id: false })], default: [] },
    coverImage: { type: imageRefSchema, default: null },
    gallery: { type: [imageRefSchema], default: [] },
    liveUrl: { type: String, default: "" },
    repoUrl: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: STATUS_VALUES, default: "draft" },
    seo: { type: seoSchema, default: () => ({}) },
    sortOrder: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  baseOptions,
);
projectSchema.index({ status: 1, sortOrder: 1, createdAt: -1 });
projectSchema.index({ status: 1, featured: 1 });

export const ProjectModel = getModel<Record<string, unknown>>("Project", projectSchema);
