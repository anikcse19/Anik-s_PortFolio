import { z } from "zod";
import {
  hrefSchema,
  objectIdSchema,
  optionalHrefSchema,
  optionalHttpUrl,
  optionalImageRefSchema,
  optionalImageUrlSchema,
  metricListSchema,
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
  /** Impact numbers for the hero. Empty = facts computed from experience and projects. */
  highlights: metricListSchema(4),
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
export const TYPOGRAPHY_PRESETS = ["precision", "journal", "editorial", "technical"] as const;
export const TYPOGRAPHY_LABELS: Record<(typeof TYPOGRAPHY_PRESETS)[number], string> = {
  precision: "Precision — Geist + Geist Mono",
  journal: "Journal — Schibsted Grotesk + JetBrains Mono",
  editorial: "Editorial — Newsreader headings + Instrument Sans",
  technical: "Technical — IBM Plex Sans + IBM Plex Mono",
};
export const CONTAINER_WIDTHS = ["narrow", "default", "wide"] as const;
export const MOTION_LEVELS = ["full", "reduced", "none"] as const;

export const appearanceSettingsSchema = z.object({
  accent: z.enum(ACCENTS).default("cobalt"),
  defaultTheme: z.enum(THEMES).default("dark"),
  typography: z.enum(TYPOGRAPHY_PRESETS).default("precision"),
  container: z.enum(CONTAINER_WIDTHS).default("default"),
  stickyHeader: z.boolean().default(true),
  footerLayout: z.enum(["full", "minimal"]).default("full"),
  motion: z.enum(MOTION_LEVELS).default("full"),
  projectsLayout: z.enum(PROJECT_LAYOUTS).default("ledger"),
  writingEnabled: z.boolean().default(false),
  caseStudiesEnabled: z.boolean().default(true),
  /** Skills marked "Currently learning" are hidden from public skill lists unless this is on. */
  showLearningSkills: z.boolean().default(false),
});
export type AppearanceSettings = z.infer<typeof appearanceSettingsSchema>;

/* -------------------------------------------------------------------- Studio */

/**
 * The service-provider presentation under /studio, aimed at US and European
 * startups and SMBs. Defaults are written as commitments about how you work,
 * never as claims about past results; impact numbers are left for you to enter.
 */
const studioServiceSchema = z.object({
  title: requiredText(80, "Title"),
  description: optionalText(400),
  items: z.array(requiredText(60, "Item")).max(8).default([]),
});
const studioStepSchema = z.object({
  title: requiredText(80, "Title"),
  description: optionalText(400),
  duration: optionalText(40),
});
const studioEngagementSchema = z.object({
  name: requiredText(80, "Name"),
  description: optionalText(300),
  priceNote: optionalText(80),
  includes: z.array(requiredText(120, "Item")).max(10).default([]),
  featured: z.boolean().default(false),
});
const studioPointSchema = z.object({ title: requiredText(80, "Title"), description: optionalText(300) });

export const STUDIO_DEFAULT_BUDGETS = ["Under $10k", "$10k – $25k", "$25k – $50k", "$50k+", "Not sure yet"];
export const STUDIO_DEFAULT_TIMELINES = ["As soon as possible", "Within 1–3 months", "3–6 months out", "Flexible"];

export const studioSettingsSchema = z.object({
  brandName: optionalText(80).default(""),
  tagline: optionalText(80).default("Product engineering for startups"),
  eyebrow: optionalText(80).default("Senior engineering partner for startups"),
  headline: optionalText(200).default("Ship a production-grade product without hiring a whole team first."),
  subheadline: optionalText(500).default(
    "I help founders and growing companies in the US and Europe design, build and scale web platforms, from first MVP to a product customers rely on every day. Senior engineering, startup speed, fixed-price milestones.",
  ),
  availability: optionalText(120).default("Booking new projects"),
  /** One factual line of social proof under the hero. */
  trustLine: optionalText(160).default("Shipped production software with teams in the United States, the UAE and Bangladesh"),
  /** Impact numbers. Empty = facts computed from your experience and projects. */
  metrics: metricListSchema(4),
  highlights: z
    .array(z.object({ value: requiredText(20, "Value"), label: requiredText(120, "Label") }))
    .max(4)
    .default([
      { value: "Senior", label: "The engineer writing your code. No juniors, no hand-offs" },
      { value: "Weekly", label: "Demos of working software, not status reports" },
      { value: "100%", label: "Source code and IP owned by your company" },
    ]),
  services: z
    .array(studioServiceSchema)
    .max(9)
    .default([
      {
        title: "MVP & product builds",
        description: "Go from idea to a launched, production-ready product in weeks, on foundations that keep scaling after launch.",
        items: ["Product scoping", "Next.js & Node.js", "Launch-ready"],
      },
      {
        title: "SaaS platforms",
        description: "Multi-tenant web apps with subscriptions, roles and permissions, dashboards and the admin tools your team runs on.",
        items: ["Subscriptions & billing", "Roles & permissions", "Admin dashboards"],
      },
      {
        title: "Marketplaces & e-commerce",
        description: "Multi-vendor marketplaces and stores with the catalog, checkout, payments and order flows your business model needs.",
        items: ["Multi-vendor", "Checkout & payments", "Order management"],
      },
      {
        title: "APIs & integrations",
        description: "Clean REST and GraphQL APIs, payment and third-party integrations, webhooks and background jobs that don't fall over.",
        items: ["REST & GraphQL", "Webhooks", "Background jobs"],
      },
      {
        title: "Performance & reliability",
        description: "Make a slow or fragile product fast and dependable: profiling, caching, security hardening and monitoring.",
        items: ["Core Web Vitals", "Caching & queues", "Security review"],
      },
      {
        title: "Fractional senior engineer",
        description: "Join your team part-time to own features end to end, review code and set the technical direction.",
        items: ["Feature ownership", "Code review", "Architecture"],
      },
    ]),
  process: z
    .array(studioStepSchema)
    .max(6)
    .default([
      { title: "Discovery call", description: "We talk through your goals, users and constraints. You get an honest view of what to build first and what to skip.", duration: "Free · 30 min" },
      { title: "Scope & fixed quote", description: "A written scope with milestones, timeline and a fixed price per milestone, so the budget is clear before work starts.", duration: "Within a week" },
      { title: "Build in weekly sprints", description: "A working demo every week on a staging link. You steer priorities early, while changes are still cheap.", duration: "Weekly demos" },
      { title: "Launch & handover", description: "Production deployment, monitoring, documentation and a support window. Then a retainer only if you want one.", duration: "Ongoing support" },
    ]),
  engagements: z
    .array(studioEngagementSchema)
    .max(4)
    .default([
      {
        name: "MVP build",
        description: "For founders turning a validated idea into a launched product.",
        priceNote: "Fixed price · typically 6–10 weeks",
        includes: ["Product scoping workshop", "Design and build of core features", "Production deployment and monitoring", "30 days of post-launch support"],
        featured: true,
      },
      {
        name: "Product engineering retainer",
        description: "For startups that need senior engineering capacity every month.",
        priceNote: "Monthly · cancel anytime",
        includes: ["Reserved weekly hours", "Roadmap and sprint planning", "Code reviews and architecture", "Priority fixes"],
        featured: false,
      },
      {
        name: "Technical audit & rescue",
        description: "For products that are slow, unstable or stuck.",
        priceNote: "Fixed price · 1–2 weeks",
        includes: ["Codebase and architecture review", "Performance and security audit", "Prioritised action plan", "Optional implementation"],
        featured: false,
      },
    ]),
  /** How remote collaboration works: time zones, communication, contracts, payments. */
  remote: z
    .array(studioPointSchema)
    .max(6)
    .default([
      { title: "Your time zone", description: "Working hours overlap with the European business day, with async daily updates for US teams." },
      { title: "Clear communication", description: "Slack or Teams, a shared task board and a written update every week. You always know what is shipping." },
      { title: "Contracts & IP", description: "Simple contracts, NDA on request and full IP assignment to your company." },
      { title: "Easy payments", description: "Milestone-based invoices in USD or EUR, paid by international bank transfer." },
    ]),
  /** Show the "marketplace freelancer vs agency vs me" comparison. */
  showComparison: z.boolean().default(true),
  faqs: z
    .array(z.object({ question: requiredText(200, "Question"), answer: requiredText(1500, "Answer") }))
    .max(12)
    .default([
      { question: "How much does an MVP cost?", answer: "It depends on scope. After a short call I send a fixed quote broken into milestones, so you know the total before anything starts and pay as each milestone is delivered." },
      { question: "Do you work with non-technical founders?", answer: "Yes. I translate business goals into a technical plan, explain trade-offs in plain language and handle hosting, deployment and tooling for you." },
      { question: "How do we work across time zones?", answer: "My working day overlaps with European business hours. US teams get async written updates every day plus scheduled calls at a time that suits you." },
      { question: "Who owns the code?", answer: "Your company does. Code, accounts, infrastructure and documentation live in your organisation's accounts from day one." },
      { question: "Can you join our existing team or codebase?", answer: "Yes. I start with a short review of the code and infrastructure, then work inside your repositories, tools and review process." },
      { question: "What happens after launch?", answer: "Every build includes a support window for fixes. After that you can continue on a monthly retainer or bring me back when you need changes." },
    ]),
  workHeading: optionalText(120).default("Case studies"),
  /** Projects shown on the studio. Empty = featured projects, else all. */
  workIds: z.array(objectIdSchema).max(12).default([]),
  inquiry: z
    .object({
      intro: optionalText(400).default("Tell me about your product and where you are today. I'll reply with next steps and a few times for a short call."),
      responseNote: optionalText(200).default(""),
      budgets: z.array(requiredText(40, "Option")).max(8).default(STUDIO_DEFAULT_BUDGETS),
      timelines: z.array(requiredText(40, "Option")).max(8).default(STUDIO_DEFAULT_TIMELINES),
    })
    .default({
      intro: "Tell me about your product and where you are today. I'll reply with next steps and a few times for a short call.",
      responseNote: "",
      budgets: STUDIO_DEFAULT_BUDGETS,
      timelines: STUDIO_DEFAULT_TIMELINES,
    }),
  /** Public email for the studio. Empty = the contact email from Contact & social. */
  contactEmail: z
    .string()
    .trim()
    .max(254)
    .default("")
    .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address"),
  /** Off by default so search results for your name don't connect the two presentations. */
  indexable: z.boolean().default(false),
});
export type StudioSettings = z.infer<typeof studioSettingsSchema>;

/* -------------------------------------------------------------------- Résumé */

/**
 * The résumé PDF (/resume.pdf) is generated from the same content as the site,
 * so a new project or role reaches the résumé the moment it is published.
 * These settings only choose what to include and add résumé-only details.
 */
export const RESUME_PAPER_SIZES = ["A4", "LETTER"] as const;

export const resumeSettingsSchema = z.object({
  /** When on, every "Résumé" link on the site points to the generated PDF instead of Profile › Résumé URL. */
  useGenerated: z.boolean().default(false),
  paperSize: z.enum(RESUME_PAPER_SIZES).default("A4"),
  /** Empty = Profile title / positioning. */
  headline: optionalText(120).default(""),
  summary: optionalText(900).default(""),
  phone: optionalText(40).default(""),
  /** Experience entries to leave off the résumé (all published entries are included otherwise). */
  excludedExperienceIds: z.array(objectIdSchema).max(30).default([]),
  /** Projects in order. Empty = featured projects, else the first published ones. */
  projectIds: z.array(objectIdSchema).max(8).default([]),
  projectLimit: z.coerce.number().int().min(0).max(8).default(4),
  showSkills: z.boolean().default(true),
  education: z
    .array(
      z.object({
        institution: requiredText(140, "Institution"),
        degree: optionalText(140),
        period: optionalText(40),
        details: optionalText(300),
      }),
    )
    .max(4)
    .default([]),
  /** Short extra lines, e.g. "Languages: English (professional), Bengali (native)". */
  additional: z.array(requiredText(200, "Line")).max(8).default([]),
});
export type ResumeSettings = z.infer<typeof resumeSettingsSchema>;

/* ------------------------------------------------------------------ Registry */

export const SETTINGS_SCHEMAS = {
  profile: profileSettingsSchema,
  contact: contactSettingsSchema,
  about: aboutSettingsSchema,
  homepage: homepageSettingsSchema,
  navigation: navigationSettingsSchema,
  seo: seoSettingsSchema,
  appearance: appearanceSettingsSchema,
  studio: studioSettingsSchema,
  resume: resumeSettingsSchema,
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
