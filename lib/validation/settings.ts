import { z } from "zod";
import {
  hrefSchema,
  objectIdSchema,
  optionalHrefSchema,
  optionalHttpUrl,
  optionalImageRefSchema,
  optionalImageUrlSchema,
  optionalText,
  requiredText,
  text,
} from "./common";

/**
 * Site-wide settings. Each key is stored once in the `settings` collection.
 * Every field has a default so the site renders before anything is configured.
 */

/* ------------------------------------------------------------------- Profile */

export const profileSettingsSchema = z.object({
  name: requiredText(80, "Name").default("Anik Chandra Deb"),
  title: requiredText(120, "Professional title").default("Senior Full-Stack Software Engineer"),
  positioning: optionalText(400).default(
    "Full-stack engineer with strong frontend experience, practical product-development skills, and a growing focus on backend architecture, system design, security, and scalable applications.",
  ),
  location: optionalText(120).default("Chattogram, Bangladesh"),
  availability: optionalText(160).default(""),
  resumeUrl: optionalHttpUrl,
  portrait: optionalImageRefSchema,
});
export type ProfileSettings = z.infer<typeof profileSettingsSchema>;

/* ------------------------------------------------------------------- Contact */

export const SOCIAL_KINDS = ["github", "linkedin", "x", "facebook", "website", "other"] as const;

export const contactSettingsSchema = z.object({
  email: z
    .string()
    .trim()
    .max(254)
    .default("")
    .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address"),
  formEnabled: z.boolean().default(true),
  formIntro: optionalText(400).default(""),
  responseNote: optionalText(200).default(""),
  socials: z
    .array(
      z.object({
        kind: z.enum(SOCIAL_KINDS).default("other"),
        label: requiredText(40, "Label"),
        url: optionalHttpUrl.refine((v) => v !== "", "URL is required"),
      }),
    )
    .max(12)
    .default([]),
});
export type ContactSettings = z.infer<typeof contactSettingsSchema>;

/* --------------------------------------------------------------------- About */

export const ABOUT_SECTION_KEYS = [
  "introduction",
  "philosophy",
  "expertise",
  "learning",
  "journey",
  "systemDesign",
  "approach",
  "interests",
] as const;
export type AboutSectionKey = (typeof ABOUT_SECTION_KEYS)[number];
export const ABOUT_SECTION_LABELS: Record<AboutSectionKey, string> = {
  introduction: "Introduction",
  philosophy: "Engineering philosophy",
  expertise: "Areas of expertise",
  learning: "Currently learning",
  journey: "Career journey",
  systemDesign: "System design & scale",
  approach: "Building reliable business software",
  interests: "Interests & goals",
};

export const aboutSettingsSchema = z.object({
  headline: optionalText(200).default(""),
  sections: z
    .object(
      Object.fromEntries(ABOUT_SECTION_KEYS.map((k) => [k, text(20000).default("")])) as Record<
        AboutSectionKey,
        z.ZodDefault<z.ZodString>
      >,
    )
    .default(Object.fromEntries(ABOUT_SECTION_KEYS.map((k) => [k, ""])) as Record<AboutSectionKey, string>),
});
export type AboutSettings = z.infer<typeof aboutSettingsSchema>;

/* ------------------------------------------------------------------ Homepage */

export const HOME_SECTION_TYPES = [
  "intro",
  "projects",
  "focus",
  "experience",
  "case_studies",
  "writing",
  "contact",
] as const;
export type HomeSectionType = (typeof HOME_SECTION_TYPES)[number];
export const HOME_SECTION_LABELS: Record<HomeSectionType, string> = {
  intro: "Introduction",
  projects: "Selected projects",
  focus: "Technical focus",
  experience: "Experience overview",
  case_studies: "Case studies",
  writing: "Writing",
  contact: "Contact",
};

export const HERO_VARIANTS = ["split", "statement"] as const;
export const PROJECT_LAYOUTS = ["ledger", "grid"] as const;

const ctaSchema = z.object({ label: optionalText(40), href: optionalHrefSchema });

export const homeSectionSchema = z.object({
  type: z.enum(HOME_SECTION_TYPES),
  enabled: z.boolean().default(true),
  eyebrow: optionalText(60),
  heading: optionalText(160),
  intro: optionalText(1200),
  limit: z.coerce.number().int().min(1).max(12).default(4),
  /** Manually selected items (projects, case studies or articles). Empty = use featured items. */
  itemIds: z.array(objectIdSchema).max(12).default([]),
  layout: z.enum(PROJECT_LAYOUTS).default("ledger"),
  cta: ctaSchema.default({ label: "", href: "" }),
});
export type HomeSection = z.infer<typeof homeSectionSchema>;

export const homeConfigSchema = z
  .object({
    hero: z
      .object({
        variant: z.enum(HERO_VARIANTS).default("split"),
        eyebrow: optionalText(80),
        statement: optionalText(400),
        showFacts: z.boolean().default(true),
        primaryCta: ctaSchema.default({ label: "Selected work", href: "/projects" }),
        secondaryCta: ctaSchema.default({ label: "Get in touch", href: "/contact" }),
      })
      .default({
        variant: "split",
        eyebrow: "",
        statement: "",
        showFacts: true,
        primaryCta: { label: "Selected work", href: "/projects" },
        secondaryCta: { label: "Get in touch", href: "/contact" },
      }),
    sections: z.array(homeSectionSchema).max(HOME_SECTION_TYPES.length),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>();
    value.sections.forEach((s, i) => {
      if (seen.has(s.type)) {
        ctx.addIssue({ code: "custom", path: ["sections", i, "type"], message: "Each section type can appear only once" });
      }
      seen.add(s.type);
    });
  });
export type HomeConfig = z.infer<typeof homeConfigSchema>;

export function defaultHomeConfig(): HomeConfig {
  const section = (type: HomeSectionType, partial: Partial<HomeSection> = {}): HomeSection => ({
    type,
    enabled: true,
    eyebrow: "",
    heading: "",
    intro: "",
    limit: 4,
    itemIds: [],
    layout: "ledger",
    cta: { label: "", href: "" },
    ...partial,
  });
  return {
    hero: {
      variant: "split",
      eyebrow: "",
      statement: "",
      showFacts: true,
      primaryCta: { label: "Selected work", href: "/projects" },
      secondaryCta: { label: "Get in touch", href: "/contact" },
    },
    sections: [
      section("intro", { heading: "What I work on" }),
      section("projects", { heading: "Selected work", limit: 5, cta: { label: "All projects", href: "/projects" } }),
      section("focus", { heading: "Technical focus" }),
      section("experience", { heading: "Experience", cta: { label: "Full experience", href: "/experience" } }),
      section("case_studies", { heading: "Case studies", limit: 3, cta: { label: "All case studies", href: "/case-studies" } }),
      section("writing", { heading: "Engineering notes", limit: 3, enabled: false, cta: { label: "All notes", href: "/writing" } }),
      section("contact", { heading: "Let’s talk about your system" }),
    ],
  };
}

export const homepageSettingsSchema = z.object({
  draft: homeConfigSchema.default(defaultHomeConfig),
  published: homeConfigSchema.default(defaultHomeConfig),
  publishedAt: z.string().nullable().default(null),
});
export type HomepageSettings = z.infer<typeof homepageSettingsSchema>;

/* ---------------------------------------------------------------- Navigation */

export const navigationSettingsSchema = z.object({
  items: z
    .array(z.object({ label: requiredText(40, "Label"), href: hrefSchema, enabled: z.boolean().default(true) }))
    .max(10)
    .default([
      { label: "Work", href: "/projects", enabled: true },
      { label: "Case studies", href: "/case-studies", enabled: true },
      { label: "Experience", href: "/experience", enabled: true },
      { label: "Writing", href: "/writing", enabled: true },
      { label: "About", href: "/about", enabled: true },
      { label: "Contact", href: "/contact", enabled: true },
    ]),
  footerNote: optionalText(300).default(""),
  showColophon: z.boolean().default(true),
});
export type NavigationSettings = z.infer<typeof navigationSettingsSchema>;

/* ----------------------------------------------------------------------- SEO */

export const SEO_PAGES = ["home", "projects", "caseStudies", "writing", "about", "experience", "contact"] as const;
export type SeoPage = (typeof SEO_PAGES)[number];

const pageMetaSchema = z.object({ title: optionalText(70), description: optionalText(170) });

export const seoSettingsSchema = z.object({
  siteName: optionalText(80).default("Anik Chandra Deb"),
  titleTemplate: z
    .string()
    .trim()
    .max(80)
    .default("%s · Anik Chandra Deb")
    .refine((v) => v.includes("%s"), "The template must contain %s where the page title goes"),
  defaultTitle: optionalText(70).default("Anik Chandra Deb — Full-Stack Software Engineer"),
  defaultDescription: optionalText(170).default(
    "Full-stack software engineer building production web applications with React, Next.js, Node.js and MongoDB, with a growing focus on backend architecture and system design.",
  ),
  ogImage: optionalImageUrlSchema,
  twitterHandle: z
    .string()
    .trim()
    .default("")
    .refine((v) => v === "" || /^@?[A-Za-z0-9_]{1,15}$/.test(v), "Use a handle like @username"),
  noindex: z.boolean().default(false),
  pages: z
    .object(Object.fromEntries(SEO_PAGES.map((p) => [p, pageMetaSchema.default({ title: "", description: "" })])) as Record<
      SeoPage,
      z.ZodDefault<typeof pageMetaSchema>
    >)
    .default(Object.fromEntries(SEO_PAGES.map((p) => [p, { title: "", description: "" }])) as Record<SeoPage, { title: string; description: string }>),
});
export type SeoSettings = z.infer<typeof seoSettingsSchema>;

/* ---------------------------------------------------------------- Appearance */

export const ACCENTS = ["signal", "cobalt", "moss", "ochre", "graphite"] as const;
export const ACCENT_LABELS: Record<(typeof ACCENTS)[number], { label: string; light: string; dark: string }> = {
  signal: { label: "Signal (vermilion)", light: "#B83A0A", dark: "#FF7A4D" },
  cobalt: { label: "Cobalt", light: "#1F4FD1", dark: "#8AAEFF" },
  moss: { label: "Moss", light: "#3E6115", dark: "#A3C985" },
  ochre: { label: "Ochre", light: "#875800", dark: "#E6B656" },
  graphite: { label: "Graphite (monochrome)", light: "#151513", dark: "#ECE9E2" },
};
export const THEMES = ["dark", "light", "system"] as const;
export const TYPOGRAPHY_PRESETS = ["journal", "editorial", "technical"] as const;
export const TYPOGRAPHY_LABELS: Record<(typeof TYPOGRAPHY_PRESETS)[number], string> = {
  journal: "Journal — Schibsted Grotesk + JetBrains Mono",
  editorial: "Editorial — Newsreader headings + Instrument Sans",
  technical: "Technical — IBM Plex Sans + IBM Plex Mono",
};
export const CONTAINER_WIDTHS = ["narrow", "default", "wide"] as const;
export const MOTION_LEVELS = ["full", "reduced", "none"] as const;

export const appearanceSettingsSchema = z.object({
  accent: z.enum(ACCENTS).default("signal"),
  defaultTheme: z.enum(THEMES).default("dark"),
  typography: z.enum(TYPOGRAPHY_PRESETS).default("journal"),
  container: z.enum(CONTAINER_WIDTHS).default("default"),
  stickyHeader: z.boolean().default(true),
  footerLayout: z.enum(["full", "minimal"]).default("full"),
  motion: z.enum(MOTION_LEVELS).default("full"),
  projectsLayout: z.enum(PROJECT_LAYOUTS).default("ledger"),
  writingEnabled: z.boolean().default(false),
  caseStudiesEnabled: z.boolean().default(true),
});
export type AppearanceSettings = z.infer<typeof appearanceSettingsSchema>;

/* ------------------------------------------------------------------ Registry */

export const SETTINGS_SCHEMAS = {
  profile: profileSettingsSchema,
  contact: contactSettingsSchema,
  about: aboutSettingsSchema,
  homepage: homepageSettingsSchema,
  navigation: navigationSettingsSchema,
  seo: seoSettingsSchema,
  appearance: appearanceSettingsSchema,
} as const;

export type SettingsKey = keyof typeof SETTINGS_SCHEMAS;
export type SettingsValue<K extends SettingsKey> = z.infer<(typeof SETTINGS_SCHEMAS)[K]>;
export const SETTINGS_KEYS = Object.keys(SETTINGS_SCHEMAS) as SettingsKey[];

/**
 * Parses stored settings tolerantly: invalid or missing top-level fields fall back
 * to their defaults instead of breaking the public site after a schema change.
 */
export function parseStoredSettings<K extends SettingsKey>(key: K, stored: unknown): SettingsValue<K> {
  const schema = SETTINGS_SCHEMAS[key] as unknown as z.ZodObject<z.ZodRawShape>;
  const full = schema.safeParse(stored ?? {});
  if (full.success) return full.data as SettingsValue<K>;

  const source = (stored && typeof stored === "object" ? stored : {}) as Record<string, unknown>;
  const repaired: Record<string, unknown> = {};
  for (const [field, fieldSchema] of Object.entries(schema.shape)) {
    const parsed = (fieldSchema as z.ZodType).safeParse(source[field]);
    if (parsed.success) repaired[field] = parsed.data;
  }
  const second = schema.safeParse(repaired);
  if (second.success) return second.data as SettingsValue<K>;
  return schema.parse({}) as SettingsValue<K>;
}

export function defaultSettings<K extends SettingsKey>(key: K): SettingsValue<K> {
  return parseStoredSettings(key, {});
}
