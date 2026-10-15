import type { Model } from "mongoose";
import type { z } from "zod";
import { TAGS, type CacheTag } from "@/lib/cache-tags";
import { estimateReadingMinutes, sanitizeBlocks, sanitizeSections } from "@/lib/content-utils";
import {
  ArticleModel,
  CaseStudyModel,
  ExperienceModel,
  MediaModel,
  ProjectModel,
  SkillCategoryModel,
} from "@/lib/models";
import { sanitizeRichText } from "@/lib/sanitize";
import {
  articleInputSchema,
  caseStudyInputSchema,
  experienceInputSchema,
  mediaInputSchema,
  projectInputSchema,
  skillCategoryInputSchema,
  type ArticleInput,
  type CaseStudyInput,
  type ProjectInput,
} from "@/lib/validation/content";

/**
 * Declarative description of each admin-managed collection. The generic CRUD
 * service (./crud.ts) uses these to validate, sanitize, persist and invalidate.
 */
export type CollectionConfig = {
  key: CollectionKey;
  label: string;
  model: Model<Record<string, unknown>>;
  schema: z.ZodType;
  tags: CacheTag[];
  searchFields: string[];
  defaultSort: Record<string, 1 | -1>;
  hasStatus: boolean;
  hasSlug: boolean;
  /** Converts validated input into the stored document (sanitization, derived fields). */
  toDocument?: (input: never) => Record<string, unknown>;
};

export type CollectionKey = "projects" | "caseStudies" | "articles" | "experience" | "skills" | "media";

export const COLLECTIONS: Record<CollectionKey, CollectionConfig> = {
  projects: {
    key: "projects",
    label: "Project",
    model: ProjectModel,
    schema: projectInputSchema,
    tags: [TAGS.projects],
    searchFields: ["title", "summary", "category", "organization", "technologies"],
    defaultSort: { sortOrder: 1, createdAt: -1 },
    hasStatus: true,
    hasSlug: true,
    toDocument: ((input: ProjectInput) => ({
      ...input,
      overview: sanitizeRichText(input.overview),
      problem: sanitizeRichText(input.problem),
      contribution: sanitizeRichText(input.contribution),
      architecture: sanitizeRichText(input.architecture),
    })) as never,
  },
  caseStudies: {
    key: "caseStudies",
    label: "Case study",
    model: CaseStudyModel,
    schema: caseStudyInputSchema,
    // Case studies can link to projects; project pages show related case studies.
    tags: [TAGS.caseStudies, TAGS.projects],
    searchFields: ["title", "summary", "context", "technologies"],
    defaultSort: { sortOrder: 1, createdAt: -1 },
    hasStatus: true,
    hasSlug: true,
    toDocument: ((input: CaseStudyInput) => ({ ...input, sections: sanitizeSections(input.sections) })) as never,
  },
  articles: {
    key: "articles",
    label: "Article",
    model: ArticleModel,
    schema: articleInputSchema,
    tags: [TAGS.articles],
    searchFields: ["title", "excerpt", "category", "tags"],
    defaultSort: { publishedAt: -1, createdAt: -1 },
    hasStatus: true,
    hasSlug: true,
    toDocument: ((input: ArticleInput) => {
      const blocks = sanitizeBlocks(input.blocks);
      const { publishedAt, ...rest } = input;
      return {
        ...rest,
        blocks,
        readingMinutes: estimateReadingMinutes(blocks),
        // An explicit date overrides the automatic "first published" timestamp.
        ...(publishedAt ? { publishedAt: new Date(publishedAt) } : {}),
      };
    }) as never,
  },
  experience: {
    key: "experience",
    label: "Experience entry",
    model: ExperienceModel,
    schema: experienceInputSchema,
    tags: [TAGS.experience],
    searchFields: ["organization", "title", "summary", "technologies"],
    defaultSort: { isCurrent: -1, startDate: -1, sortOrder: 1 },
    hasStatus: true,
    hasSlug: false,
  },
  skills: {
    key: "skills",
    label: "Skill category",
    model: SkillCategoryModel,
    schema: skillCategoryInputSchema,
    tags: [TAGS.skills],
    searchFields: ["name", "description", "skills.name"],
    defaultSort: { sortOrder: 1, createdAt: 1 },
    hasStatus: true,
    hasSlug: true,
  },
  media: {
    key: "media",
    label: "Image",
    model: MediaModel,
    schema: mediaInputSchema,
    tags: [],
    searchFields: ["url", "alt", "caption", "label", "tags"],
    defaultSort: { createdAt: -1 },
    hasStatus: false,
    hasSlug: false,
  },
};
