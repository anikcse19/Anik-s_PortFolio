import type { MetadataRoute } from "next";
import { getPublishedArticles, getPublishedCaseStudies, getPublishedProjects, getSiteSettings } from "@/lib/data/public";
import { absoluteUrl } from "@/lib/seo";
import { STUDIO_ROUTES } from "@/lib/studio";

export const revalidate = 3600;

/** Only published content is listed; drafts are never exposed here. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  if (settings.seo.noindex) return [];
  const { appearance } = settings;
  const [projects, caseStudies, articles] = await Promise.all([
    getPublishedProjects(),
    appearance.caseStudiesEnabled ? getPublishedCaseStudies() : Promise.resolve([]),
    appearance.writingEnabled ? getPublishedArticles() : Promise.resolve([]),
  ]);

  const staticRoutes = ["/", "/projects", "/experience", "/about", "/contact"];
  if (appearance.caseStudiesEnabled) staticRoutes.push("/case-studies");
  if (appearance.writingEnabled) staticRoutes.push("/writing");

  return [
    ...staticRoutes.map((path) => ({ url: absoluteUrl(path), changeFrequency: "monthly" as const, priority: path === "/" ? 1 : 0.7 })),
    ...projects.map((p) => ({ url: absoluteUrl(`/projects/${p.slug}`), lastModified: p.updatedAt, priority: 0.8 })),
    ...caseStudies.map((c) => ({ url: absoluteUrl(`/case-studies/${c.slug}`), lastModified: c.updatedAt, priority: 0.8 })),
    ...articles.map((a) => ({ url: absoluteUrl(`/writing/${a.slug}`), lastModified: a.updatedAt, priority: 0.6 })),
    // The studio is opt-in (Admin › Studio) so search results don't connect it to the portfolio.
    ...(settings.studio.indexable
      ? [
          ...[STUDIO_ROUTES.home, STUDIO_ROUTES.work, STUDIO_ROUTES.start].map((path) => ({ url: absoluteUrl(path), priority: path === STUDIO_ROUTES.home ? 0.9 : 0.6 })),
          ...projects.map((p) => ({ url: absoluteUrl(`${STUDIO_ROUTES.work}/${p.slug}`), lastModified: p.updatedAt, priority: 0.5 })),
        ]
      : []),
  ];
}
