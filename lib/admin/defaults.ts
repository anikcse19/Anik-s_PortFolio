/**
 * Empty editor values for new documents. Kept out of the "use client" editor
 * modules so server pages can call them too.
 */
import type { ArticleInput, CaseStudyInput, ExperienceInput, ProjectInput, SkillCategoryInput } from "@/lib/validation/content";

export function emptyProject(): ProjectInput {
  return {
    title: "",
    slug: "",
    summary: "",
    type: "professional",
    category: "",
    year: "",
    organization: "",
    role: "",
    technologies: [],
    overview: "",
    problem: "",
    contribution: "",
    architecture: "",
    decisions: [],
    features: [],
    challenges: [],
    outcomes: [],
    impact: [],
    coverImage: null,
    gallery: [],
    liveUrl: "",
    repoUrl: "",
    featured: false,
    status: "draft",
    seo: { title: "", description: "", ogImage: "" },
    sortOrder: 0,
  };
}

export function emptyCaseStudy(): CaseStudyInput {
  return {
    title: "",
    slug: "",
    summary: "",
    kind: "design_exercise",
    context: "",
    role: "",
    technologies: [],
    coverImage: null,
    sections: [],
    relatedProjectId: null,
    featured: false,
    status: "draft",
    seo: { title: "", description: "", ogImage: "" },
    sortOrder: 0,
  };
}

export function emptyArticle(): ArticleInput {
  return {
    title: "",
    slug: "",
    excerpt: "",
    category: "",
    tags: [],
    coverImage: null,
    blocks: [],
    publishedAt: "",
    relatedProjectIds: [],
    featured: false,
    status: "draft",
    seo: { title: "", description: "", ogImage: "" },
  };
}

export function emptyExperience(): ExperienceInput {
  return {
    organization: "",
    organizationUrl: "",
    title: "",
    employmentType: null,
    location: "",
    workMode: null,
    startDate: "",
    endDate: "",
    isCurrent: false,
    summary: "",
    achievements: [],
    technologies: [],
    status: "draft",
    sortOrder: 0,
  };
}

export function emptySkillCategory(): SkillCategoryInput {
  return { name: "", slug: "", description: "", skills: [], status: "published", sortOrder: 0 };
}
