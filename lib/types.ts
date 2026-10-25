import type {
  ArticleInput,
  CaseStudyInput,
  ExperienceInput,
  MediaInput,
  ProjectInput,
  SkillCategoryInput,
} from "@/lib/validation/content";

/** Fields every stored document exposes once serialized for React (dates as ISO strings). */
export type DocMeta = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type Project = ProjectInput & DocMeta;
export type CaseStudy = CaseStudyInput & DocMeta;
export type Article = Omit<ArticleInput, "publishedAt"> & DocMeta & { readingMinutes: number };
export type Experience = ExperienceInput & DocMeta;
export type SkillCategory = SkillCategoryInput & DocMeta;
export type Media = MediaInput & Omit<DocMeta, "publishedAt">;

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  delivery: "stored" | "emailed" | "email_failed";
  /** Missing on messages stored before studio inquiries existed. */
  source?: "portfolio" | "studio";
  details?: { company?: string; service?: string; budget?: string; timeline?: string };
  createdAt: string;
};

/** Result shape returned by every admin server action. */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | {
      ok: false;
      error: string;
      code: "UNAUTHORIZED" | "VALIDATION" | "CONFLICT" | "NOT_FOUND" | "RATE_LIMITED" | "SERVER";
      fieldErrors?: Record<string, string>;
    };
