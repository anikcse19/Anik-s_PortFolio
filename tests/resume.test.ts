import { describe, expect, it } from "vitest";
import type { ProjectListItem, SiteSettings } from "@/lib/data/public";
import { buildResume, resumeFilename, resumeHref } from "@/lib/resume";
import type { Experience, SkillCategory } from "@/lib/types";
import { defaultSettings, SETTINGS_KEYS } from "@/lib/validation/settings";

function settings(overrides: { resume?: Partial<SiteSettings["resume"]>; profile?: Partial<SiteSettings["profile"]> } = {}): SiteSettings {
  const base = Object.fromEntries(SETTINGS_KEYS.map((k) => [k, defaultSettings(k)])) as SiteSettings;
  return {
    ...base,
    profile: { ...base.profile, resumeUrl: "https://drive.example.com/cv", ...overrides.profile },
    contact: { ...base.contact, email: "me@example.com", socials: [{ kind: "github", label: "GitHub", url: "https://github.com/me" }, { kind: "x", label: "X", url: "https://x.com/me" }] },
    resume: { ...base.resume, ...overrides.resume },
  };
}

const role = (id: string, extra: Partial<Experience> = {}) =>
  ({ id, title: "Engineer", organization: `Org ${id}`, startDate: "2022-01", endDate: "2023-01", isCurrent: false, location: "Remote", workMode: null, summary: "Did things.", achievements: [], technologies: ["TypeScript"], ...extra }) as unknown as Experience;

const project = (id: string, extra: Partial<ProjectListItem> = {}) =>
  ({ id, title: `Project ${id}`, summary: "A product.", featured: false, liveUrl: "", technologies: ["Next.js"], impact: [], outcomes: [], ...extra }) as unknown as ProjectListItem;

const skills = [{ id: "s", name: "Backend", skills: [{ name: "Node.js", level: null }, { name: "Kafka", level: "learning" }] }] as unknown as SkillCategory[];

describe("resumeHref", () => {
  it("switches every résumé link to the generated PDF only when enabled", () => {
    expect(resumeHref(settings())).toBe("https://drive.example.com/cv");
    expect(resumeHref(settings({ resume: { useGenerated: true } }))).toBe("/resume.pdf");
  });
});

describe("buildResume", () => {
  it("uses achievements as bullets, falls back to the summary, and honours exclusions", () => {
    const data = buildResume(settings({ resume: { excludedExperienceIds: ["c"] } }), {
      experience: [role("a", { achievements: ["Cut load time 3×"] }), role("b"), role("c")],
      projects: [],
      skills: [],
    }, "https://anik.dev");
    expect(data.experience.map((e) => e.bullets)).toEqual([["Cut load time 3×"], ["Did things."]]);
  });

  it("picks chosen projects in order, else featured ones, within the limit", () => {
    const projects = [project("1"), project("2", { featured: true }), project("3", { featured: true })];
    expect(buildResume(settings({ resume: { projectIds: ["3", "1"] } }), { experience: [], projects, skills: [] }, "https://x.dev").projects.map((p) => p.title)).toEqual(["Project 3", "Project 1"]);
    expect(buildResume(settings({ resume: { projectLimit: 1 } }), { experience: [], projects, skills: [] }, "https://x.dev").projects.map((p) => p.title)).toEqual(["Project 2"]);
  });

  it("hides learning skills and keeps only GitHub/LinkedIn among socials", () => {
    const data = buildResume(settings(), { experience: [], projects: [], skills }, "https://anik.dev/");
    expect(data.skills).toEqual([{ name: "Backend", items: ["Node.js"] }]);
    expect(data.contact.map((c) => c.label)).toEqual(["Chattogram, Bangladesh", "me@example.com", "anik.dev", "github.com/me"]);
  });

  it("builds a safe filename", () => {
    expect(resumeFilename("Anik Chandra Deb")).toBe("Anik-Chandra-Deb-Resume.pdf");
  });
});
