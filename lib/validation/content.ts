import { z } from "zod";
import { blocksSchema } from "./blocks";
import {
  imageRefSchema,
  labelListSchema,
  objectIdSchema,
  optionalHttpUrl,
  optionalImageRefSchema,
  optionalText,
  requiredText,
  seoSchema,
  slugSchema,
  sortOrderSchema,
  statusSchema,
  text,
  yearMonthSchema,
  metricListSchema,
} from "./common";

/* ------------------------------------------------------------------ Projects */

export const PROJECT_TYPES = ["professional", "personal", "open_source"] as const;
export const PROJECT_TYPE_LABELS: Record<(typeof PROJECT_TYPES)[number], string> = {
  professional: "Professional work",
  personal: "Personal project",
  open_source: "Open source",
};

const richHtml = (max = 30000) => text(max).default("");

export const projectInputSchema = z.object({
  title: requiredText(140, "Title"),
  slug: slugSchema,
  summary: requiredText(320, "Short description"),
  type: z.enum(PROJECT_TYPES),
  category: optionalText(60),
  year: z
    .string()
    .trim()
    .default("")
    .refine((v) => v === "" || /^(19|20)\d{2}(\s?[–-]\s?((19|20)\d{2}|present))?$/i.test(v), "Use a year like 2024 or 2023–2024"),
  organization: optionalText(140),
  role: optionalText(140),
  technologies: labelListSchema(30),
  overview: richHtml(),
  problem: richHtml(),
  contribution: richHtml(),
  architecture: richHtml(),
  decisions: z
    .array(z.object({ title: requiredText(140, "Decision"), body: requiredText(2000, "Rationale") }))
    .max(20)
    .default([]),
  features: labelListSchema(30, 200),
  challenges: z
    .array(z.object({ challenge: requiredText(400, "Challenge"), solution: requiredText(2000, "Solution") }))
    .max(20)
    .default([]),
  outcomes: labelListSchema(20, 300),
  /** Headline impact numbers shown on project cards, e.g. { value: "3×", label: "faster page loads" }. */
  impact: metricListSchema(4),
  coverImage: optionalImageRefSchema,
  gallery: z.array(imageRefSchema).max(16, "Use at most 16 gallery images").default([]),
  liveUrl: optionalHttpUrl,
  repoUrl: optionalHttpUrl,
  featured: z.boolean().default(false),
  status: statusSchema.default("draft"),
  seo: seoSchema,
  sortOrder: sortOrderSchema,
});
export type ProjectInput = z.infer<typeof projectInputSchema>;

/* -------------------------------------------------------------- Case studies */

export const CASE_STUDY_KINDS = ["production", "design_exercise", "exploration"] as const;
export const CASE_STUDY_KIND_LABELS: Record<(typeof CASE_STUDY_KINDS)[number], string> = {
  production: "Production system",
  design_exercise: "Design exercise",
  exploration: "Technical exploration",
};

export const CASE_STUDY_TOPICS = [
  "requirements",
  "architecture",
  "data_flow",
  "data_model",
  "caching",
  "async_processing",
  "auth",
  "reliability",
  "security",
  "scalability",
  "tradeoffs",
  "my_role",
  "next_steps",
] as const;
export const CASE_STUDY_TOPIC_LABELS: Record<(typeof CASE_STUDY_TOPICS)[number], string> = {
  requirements: "Requirements & constraints",
  architecture: "Architecture",
  data_flow: "Data flow",
  data_model: "Data model & indexing",
  caching: "Caching",
  async_processing: "Async processing",
  auth: "Authentication & authorization",
  reliability: "Reliability & failure handling",
  security: "Security",
  scalability: "Scalability",
  tradeoffs: "Alternatives & trade-offs",
  my_role: "What I implemented",
  next_steps: "Future improvements",
};

export const caseStudySectionSchema = z.object({
  id: z.string().trim().regex(/^[A-Za-z0-9_-]{6,40}$/),
  heading: requiredText(140, "Section heading"),
  topic: z.enum(CASE_STUDY_TOPICS).nullable().default(null),
  blocks: blocksSchema,
});

export const caseStudyInputSchema = z.object({
  title: requiredText(160, "Title"),
  slug: slugSchema,
  summary: requiredText(400, "Summary"),
  kind: z.enum(CASE_STUDY_KINDS),
  context: optionalText(160),
  role: optionalText(160),
  technologies: labelListSchema(30),
  coverImage: optionalImageRefSchema,
  sections: z.array(caseStudySectionSchema).max(30).default([]),
  relatedProjectId: objectIdSchema.nullable().default(null),
  featured: z.boolean().default(false),
  status: statusSchema.default("draft"),
  seo: seoSchema,
  sortOrder: sortOrderSchema,
});
export type CaseStudyInput = z.infer<typeof caseStudyInputSchema>;
export type CaseStudySection = z.infer<typeof caseStudySectionSchema>;

/* ------------------------------------------------------------------ Articles */

export const articleInputSchema = z.object({
  title: requiredText(160, "Title"),
  slug: slugSchema,
  excerpt: requiredText(400, "Excerpt"),
  category: optionalText(60),
  tags: labelListSchema(12),
  coverImage: optionalImageRefSchema,
  blocks: blocksSchema,
  publishedAt: z
    .string()
    .trim()
    .default("")
    .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Enter a valid date"),
  relatedProjectIds: z.array(objectIdSchema).max(6).default([]),
  featured: z.boolean().default(false),
  status: statusSchema.default("draft"),
  seo: seoSchema,
});
export type ArticleInput = z.infer<typeof articleInputSchema>;

/* ---------------------------------------------------------------- Experience */

export const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "freelance", "internship", "founder"] as const;
export const EMPLOYMENT_TYPE_LABELS: Record<(typeof EMPLOYMENT_TYPES)[number], string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
  founder: "Co-founder",
};
export const WORK_MODES = ["remote", "onsite", "hybrid"] as const;

export const experienceInputSchema = z
  .object({
    organization: requiredText(140, "Organization"),
    organizationUrl: optionalHttpUrl,
    title: requiredText(140, "Job title"),
    employmentType: z.enum(EMPLOYMENT_TYPES).nullable().default(null),
    location: optionalText(120),
    workMode: z.enum(WORK_MODES).nullable().default(null),
    startDate: yearMonthSchema.or(z.literal("")).default(""),
    endDate: yearMonthSchema.or(z.literal("")).default(""),
    isCurrent: z.boolean().default(false),
    summary: optionalText(1200),
    achievements: labelListSchema(15, 400),
    technologies: labelListSchema(25),
    status: statusSchema.default("draft"),
    sortOrder: sortOrderSchema,
  })
  .superRefine((value, ctx) => {
    if (value.isCurrent && value.endDate) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "Clear the end date for a current role" });
    }
    if (value.startDate && value.endDate && value.endDate < value.startDate) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date must be after the start date" });
    }
    if (value.endDate && !value.startDate) {
      ctx.addIssue({ code: "custom", path: ["startDate"], message: "Add a start date when an end date is set" });
    }
  });
export type ExperienceInput = z.infer<typeof experienceInputSchema>;

/* -------------------------------------------------------------------- Skills */

export const SKILL_LEVELS = ["production", "hands_on", "learning"] as const;
export const SKILL_LEVEL_LABELS: Record<(typeof SKILL_LEVELS)[number], string> = {
  production: "Production experience",
  hands_on: "Hands-on projects",
  learning: "Currently learning",
};
export const SKILL_LEVEL_SHORT: Record<(typeof SKILL_LEVELS)[number], string> = {
  production: "Prod",
  hands_on: "Projects",
  learning: "Learning",
};

export const skillSchema = z.object({
  name: requiredText(60, "Skill name"),
  level: z.enum(SKILL_LEVELS).nullable().default(null),
  note: optionalText(200),
});

export const skillCategoryInputSchema = z.object({
  name: requiredText(80, "Category name"),
  slug: slugSchema,
  description: optionalText(400),
  skills: z.array(skillSchema).max(60).default([]),
  status: statusSchema.default("published"),
  sortOrder: sortOrderSchema,
});
export type SkillCategoryInput = z.infer<typeof skillCategoryInputSchema>;
export type Skill = z.infer<typeof skillSchema>;

/* --------------------------------------------------------------------- Media */

export const mediaInputSchema = z.object({
  url: imageRefSchema.shape.url,
  alt: requiredText(300, "Alt text"),
  caption: optionalText(300),
  label: optionalText(120),
  tags: labelListSchema(10),
});
export type MediaInput = z.infer<typeof mediaInputSchema>;

/* ------------------------------------------------------------------- Contact */

export const contactMessageSchema = z.object({
  name: requiredText(120, "Name"),
  email: z.string().trim().max(254).pipe(z.email("Enter a valid email address")),
  subject: optionalText(160),
  message: text(5000).min(10, "Please write at least a sentence (10+ characters)"),
});
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

/** Project inquiry from the studio: a contact message plus project details. */
export const studioInquirySchema = contactMessageSchema.extend({
  company: optionalText(120),
  service: optionalText(80),
  budget: optionalText(40),
  timeline: optionalText(40),
});
export type StudioInquiryInput = z.infer<typeof studioInquirySchema>;
