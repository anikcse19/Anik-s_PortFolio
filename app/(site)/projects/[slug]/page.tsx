import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/site/detail-views";
import { JsonLd } from "@/components/ui/json-ld";
import { getProjectBySlug, getPublishedCaseStudies, getPublishedProjects, getSiteSettings } from "@/lib/data/public";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [settings, project] = await Promise.all([getSiteSettings(), getProjectBySlug(slug)]);
  if (!project) return { title: "Project not found", robots: { index: false } };
  return buildMetadata(settings, {
    title: project.seo.title || project.title,
    description: project.seo.description || project.summary,
    image: project.seo.ogImage || project.coverImage?.url,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const [project, all, caseStudies, settings] = await Promise.all([
    getProjectBySlug(slug),
    getPublishedProjects(),
    getPublishedCaseStudies(),
    getSiteSettings(),
  ]);
  if (!project) notFound();
  const index = all.findIndex((p) => p.slug === slug);
  const related = settings.appearance.caseStudiesEnabled
    ? caseStudies.filter((cs) => cs.relatedProjectId === project.id).map((cs) => ({ slug: cs.slug, title: cs.title, kind: cs.kind }))
    : [];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.summary,
          url: absoluteUrl(`/projects/${project.slug}`),
          author: { "@type": "Person", name: settings.profile.name },
          keywords: project.technologies.join(", "),
          ...(project.coverImage?.url ? { image: absoluteUrl(project.coverImage.url) } : {}),
        }}
      />
      <ProjectDetail
        project={project}
        relatedCaseStudies={related}
        neighbors={{ prev: index > 0 ? all[index - 1] : null, next: index >= 0 && index < all.length - 1 ? all[index + 1] : null }}
      />
    </>
  );
}
