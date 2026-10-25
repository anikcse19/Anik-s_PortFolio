import type { ProjectListItem, SiteSettings } from "@/lib/data/public";
import { STUDIO_BASE } from "@/lib/zones";

/** Studio routes, all inside the studio zone. */
export const STUDIO_ROUTES = {
  home: STUDIO_BASE,
  work: `${STUDIO_BASE}/work`,
  start: `${STUDIO_BASE}/start`,
} as const;

export function studioBrand(settings: SiteSettings): { name: string; tagline: string } {
  return { name: settings.studio.brandName || settings.profile.name, tagline: settings.studio.tagline };
}

export function studioEmail(settings: SiteSettings): string {
  return settings.studio.contactEmail || settings.contact.email;
}

/** Projects chosen for the studio, else featured projects, else all of them. */
export function studioProjects(settings: SiteSettings, projects: ProjectListItem[], limit = 6): ProjectListItem[] {
  const { workIds } = settings.studio;
  if (workIds.length) {
    return workIds
      .map((id) => projects.find((p) => p.id === id))
      .filter((p): p is ProjectListItem => Boolean(p))
      .slice(0, limit);
  }
  const featured = projects.filter((p) => p.featured);
  return (featured.length ? featured : projects).slice(0, limit);
}

/** Most-used technologies across the given projects, for the "built with" strip. */
export function topTechnologies(projects: ProjectListItem[], limit = 12): string[] {
  const counts = new Map<string, number>();
  for (const p of projects) for (const t of p.technologies) counts.set(t, (counts.get(t) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([t]) => t);
}
