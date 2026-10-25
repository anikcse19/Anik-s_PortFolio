import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/site/detail-views";
import { FinalCta } from "@/components/studio/studio-home";
import { getProjectBySlug, getPublishedProjects, getSiteSettings } from "@/lib/data/public";
import { absoluteUrl } from "@/lib/seo";
import { STUDIO_ROUTES } from "@/lib/studio";

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/studio/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found", robots: { index: false } };
  return {
    title: project.seo.title || project.title,
    description: project.seo.description || project.summary,
    alternates: { canonical: absoluteUrl(`${STUDIO_ROUTES.work}/${project.slug}`) },
  };
}

export default async function StudioProjectPage({ params }: PageProps<"/studio/work/[slug]">) {
  const { slug } = await params;
  const [project, all, settings] = await Promise.all([getProjectBySlug(slug), getPublishedProjects(), getSiteSettings()]);
  if (!project) notFound();
  const index = all.findIndex((p) => p.slug === slug);
  return (
    <ProjectDetail
      project={project}
      basePath={STUDIO_ROUTES.work}
      backLabel="All case studies"
      neighbors={{ prev: index > 0 ? all[index - 1] : null, next: index >= 0 && index < all.length - 1 ? all[index + 1] : null }}
      footer={
        <div className="mt-24">
          <FinalCta settings={settings} />
        </div>
      }
    />
  );
}
