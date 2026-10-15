/** Cache tags shared by the public data layer and admin mutations. */
export const TAGS = {
  projects: "projects",
  caseStudies: "case-studies",
  articles: "articles",
  experience: "experience",
  skills: "skills",
  settings: "settings",
} as const;

export type CacheTag = (typeof TAGS)[keyof typeof TAGS];
