import type { ProjectListItem, SiteSettings } from "@/lib/data/public";
import { employmentPeriod } from "@/lib/dates";
import type { Experience, SkillCategory } from "@/lib/types";
import type { Metric } from "@/lib/validation/common";

/** Public path of the generated résumé. */
export const RESUME_PATH = "/resume.pdf";

/** Where every "Résumé" link on the site points: the generated PDF when enabled, else the external URL. */
export function resumeHref(settings: Pick<SiteSettings, "resume" | "profile">): string {
  return settings.resume.useGenerated ? RESUME_PATH : settings.profile.resumeUrl;
}

export type ResumeLink = { label: string; href?: string };

export type ResumeData = {
  name: string;
  headline: string;
  summary: string;
  contact: ResumeLink[];
  experience: { title: string; organization: string; meta: string; period: string; bullets: string[]; stack: string[] }[];
  projects: { title: string; url: string; summary: string; metrics: Metric[]; bullets: string[]; stack: string[] }[];
  skills: { name: string; items: string[] }[];
  education: SiteSettings["resume"]["education"];
  additional: string[];
  paperSize: SiteSettings["resume"]["paperSize"];
};

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

/**
 * Maps site content onto résumé sections. Pure, so it is unit tested and the
 * PDF component only handles layout.
 */
export function buildResume(
  settings: SiteSettings,
  content: { experience: Experience[]; projects: ProjectListItem[]; skills: SkillCategory[] },
  siteUrl: string,
): ResumeData {
  const { profile, contact, resume, appearance } = settings;

  const links: ResumeLink[] = [
    ...(profile.location ? [{ label: profile.location }] : []),
    ...(contact.email ? [{ label: contact.email, href: `mailto:${contact.email}` }] : []),
    ...(resume.phone ? [{ label: resume.phone, href: `tel:${resume.phone.replace(/[^\d+]/g, "")}` }] : []),
    { label: displayUrl(siteUrl), href: siteUrl },
    ...contact.socials.filter((s) => s.kind === "github" || s.kind === "linkedin").map((s) => ({ label: displayUrl(s.url), href: s.url })),
  ];

  const excluded = new Set(resume.excludedExperienceIds);
  const experience = content.experience
    .filter((e) => !excluded.has(e.id))
    .map((e) => ({
      title: e.title,
      organization: e.organization,
      meta: [e.location, e.workMode === "remote" ? "Remote" : ""].filter(Boolean).join(" · "),
      period: employmentPeriod(e).range,
      // Achievements are the résumé bullets; the summary is the fallback.
      bullets: e.achievements.length ? e.achievements : e.summary ? [e.summary] : [],
      stack: e.technologies.slice(0, 10),
    }));

  const chosen = resume.projectIds.length
    ? resume.projectIds.map((id) => content.projects.find((p) => p.id === id)).filter((p): p is ProjectListItem => Boolean(p))
    : (() => {
        const featured = content.projects.filter((p) => p.featured);
        return featured.length ? featured : content.projects;
      })();
  const projects = chosen.slice(0, resume.projectLimit).map((p) => ({
    title: p.title,
    url: p.liveUrl,
    summary: p.summary,
    metrics: p.impact ?? [],
    bullets: (p.outcomes ?? []).slice(0, 3),
    stack: p.technologies.slice(0, 8),
  }));

  const skills = resume.showSkills
    ? content.skills
        .map((c) => ({ name: c.name, items: c.skills.filter((s) => appearance.showLearningSkills || s.level !== "learning").map((s) => s.name) }))
        .filter((c) => c.items.length > 0)
    : [];

  return {
    name: profile.name,
    headline: resume.headline || profile.title,
    summary: resume.summary || profile.positioning,
    contact: links,
    experience,
    projects,
    skills,
    education: resume.education,
    additional: resume.additional,
    paperSize: resume.paperSize,
  };
}

export function resumeFilename(name: string): string {
  return `${name.trim().replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "") || "Resume"}-Resume.pdf`;
}
