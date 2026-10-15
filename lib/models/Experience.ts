import { Schema } from "mongoose";
import { baseOptions, getModel, STATUS_VALUES } from "./_shared";

const experienceSchema = new Schema(
  {
    organization: { type: String, required: true },
    organizationUrl: { type: String, default: "" },
    title: { type: String, required: true },
    employmentType: { type: String, default: null },
    location: { type: String, default: "" },
    workMode: { type: String, default: null },
    // "YYYY-MM" strings; empty when the date has not been confirmed.
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    isCurrent: { type: Boolean, default: false },
    summary: { type: String, default: "" },
    achievements: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    status: { type: String, enum: STATUS_VALUES, default: "draft" },
    sortOrder: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  baseOptions,
);
experienceSchema.index({ status: 1, isCurrent: -1, startDate: -1 });

export const ExperienceModel = getModel<Record<string, unknown>>("Experience", experienceSchema);
