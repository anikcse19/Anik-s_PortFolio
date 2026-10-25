import "server-only";
import { unstable_cache } from "next/cache";
import { TAGS } from "@/lib/cache-tags";
import { compareExperience } from "@/lib/dates";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import {
  ArticleModel,
  CaseStudyModel,
  ExperienceModel,
  ProjectModel,
  SettingModel,
  SkillCategoryModel,
} from "@/lib/models";
import { serializeDoc } from "@/lib/serialize";
import type { Article, CaseStudy, Experience, Project, SkillCategory } from "@/lib/types";
import {
  defaultSettings,
  parseStoredSettings,
  SETTINGS_KEYS,
  type SettingsKey,
  type SettingsValue,
} from "@/lib/validation/settings";

/**
 * Public, read-only content access.
 *
 * - Only `status: "published"` documents are ever returned from here.
 * - Results are cached with tags; admin mutations call `updateTag` so edits
 *   appear immediately, and a 1-hour revalidate acts as a safety net.
 * - When MONGODB_URI is not configured (e.g. a local build without a database)
 *   the site renders with defaults/empty states instead of failing. When it *is*
 *   configured but unreachable, errors propagate so ISR keeps serving the last good page.
 */

const REVALIDATE_SECONDS = 3600;
const PUBLISHED = { status: "published" } as const;
const LIST_LIMIT = 200;

function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  key: string,
  tags: string[],
  fallback: () => R,
): (...args: A) => Promise<R> {
  const wrapped = unstable_cache(fn, [key], { tags, revalidate: REVALIDATE_SECONDS });
  return async (...args: A) => {
    if (!isDatabaseConfigured()) return fallback();
    return wrapped(...args);
  };
}

/* ------------------------------------------------------------------ Settings */

export type SiteSettings = { [K in SettingsKey]: SettingsValue<K> };

function defaultSiteSettings(): SiteSettings {
  return Object.fromEntries(SETTINGS_KEYS.map((k) => [k, defaultSettings(k)])) as SiteSettings;
}

export const getSiteSettings = cached(
  async (): Promise<SiteSettings> => {
    await connectDB();
    const docs = await SettingModel.find({ key: { $in: SETTINGS_KEYS } }).lean();
    const byKey = new Map(docs.map((d) => [d.key, d.value]));
    return Object.fromEntries(SETTINGS_KEYS.map((k) => [k, parseStoredSettings(k, byKey.get(k))])) as SiteSettings;
  },
  // The key list is part of the cache key, so adding a settings section never serves a stale shape.
  `site-settings:${SETTINGS_KEYS.join(",")}`,
  [TAGS.settings],
  defaultSiteSettings,
);

/* ------------------------------------------------------------------ Projects */

const PROJECT_LIST_FIELDS =
  "title slug summary type category year organization role technologies impact outcomes coverImage liveUrl repoUrl featured status sortOrder seo publishedAt createdAt updatedAt";

export type ProjectListItem = Pick<
  Project,
  | "id"
  | "title"
  | "slug"
  | "summary"
  | "type"
  | "category"
  | "year"
  | "organization"
  | "role"
  | "technologies"
  | "impact"
  | "outcomes"
  | "coverImage"
  | "liveUrl"
  | "repoUrl"
  | "featured"
  | "sortOrder"
  | "publishedAt"
  | "updatedAt"
>;

export const getPublishedProjects = cached(
  async (): Promise<ProjectListItem[]> => {
    await connectDB();
    const docs = await ProjectModel.find(PUBLISHED)
      .select(PROJECT_LIST_FIELDS)
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(LIST_LIMIT)
      .lean();
    return docs.map((d) => serializeDoc<ProjectListItem>(d));
  },
  "published-projects",
  [TAGS.projects],
  () => [],
);

export const getProjectBySlug = cached(
  async (slug: string): Promise<Project | null> => {
    await connectDB();
    const doc = await ProjectModel.findOne({ ...PUBLISHED, slug }).lean();
    return doc ? serializeDoc<Project>(doc) : null;
  },
  "project-by-slug",
  [TAGS.projects],
  () => null,
);

/* -------------------------------------------------------------- Case studies */

export type CaseStudyListItem = Omit<CaseStudy, "sections" | "seo"> & { topics: string[] };

export const getPublishedCaseStudies = cached(
  async (): Promise<CaseStudyListItem[]> => {
    await connectDB();
    const docs = await CaseStudyModel.find(PUBLISHED).sort({ sortOrder: 1, createdAt: -1 }).limit(LIST_LIMIT).lean();
    return docs.map((d) => {
      const { sections, seo: _seo, ...rest } = serializeDoc<CaseStudy>(d);
      const topics = Array.from(new Set(sections.map((s) => s.topic).filter((t): t is NonNullable<typeof t> => Boolean(t))));
      return { ...rest, topics };
    });
  },
  "published-case-studies",
  [TAGS.caseStudies],
  () => [],
);

export const getCaseStudyBySlug = cached(
  async (slug: string): Promise<CaseStudy | null> => {
    await connectDB();
    const doc = await CaseStudyModel.findOne({ ...PUBLISHED, slug }).lean();
    return doc ? serializeDoc<CaseStudy>(doc) : null;
  },
  "case-study-by-slug",
  [TAGS.caseStudies],
  () => null,
);

/* ------------------------------------------------------------------ Articles */

export type ArticleListItem = Omit<Article, "blocks" | "seo">;

export const getPublishedArticles = cached(
  async (): Promise<ArticleListItem[]> => {
    await connectDB();
    const docs = await ArticleModel.find(PUBLISHED)
      .select("-blocks -seo")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(LIST_LIMIT)
      .lean();
    return docs.map((d) => serializeDoc<ArticleListItem>(d));
  },
  "published-articles",
  [TAGS.articles],
  () => [],
);

export const getArticleBySlug = cached(
  async (slug: string): Promise<Article | null> => {
    await connectDB();
    const doc = await ArticleModel.findOne({ ...PUBLISHED, slug }).lean();
    return doc ? serializeDoc<Article>(doc) : null;
  },
  "article-by-slug",
  [TAGS.articles],
  () => null,
);

/* ------------------------------------------------------- Experience & skills */

export const getPublishedExperience = cached(
  async (): Promise<Experience[]> => {
    await connectDB();
    const docs = await ExperienceModel.find(PUBLISHED).limit(LIST_LIMIT).lean();
    return docs.map((d) => serializeDoc<Experience>(d)).sort(compareExperience);
  },
  "published-experience",
  [TAGS.experience],
  () => [],
);

export const getPublishedSkillCategories = cached(
  async (): Promise<SkillCategory[]> => {
    await connectDB();
    const docs = await SkillCategoryModel.find(PUBLISHED).sort({ sortOrder: 1, createdAt: 1 }).limit(LIST_LIMIT).lean();
    return docs.map((d) => serializeDoc<SkillCategory>(d));
  },
  "published-skills",
  [TAGS.skills],
  () => [],
);
