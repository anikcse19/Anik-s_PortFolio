import type { Metadata } from "next";
import { EmptyState, SectionHeader } from "@/components/site/section-header";
import { ProjectGrid } from "@/components/site/project-list";
import { FinalCta } from "@/components/studio/studio-home";
import { getPublishedProjects, getSiteSettings } from "@/lib/data/public";
import { absoluteUrl } from "@/lib/seo";
import { STUDIO_ROUTES } from "@/lib/studio";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Case studies",
  alternates: { canonical: absoluteUrl(STUDIO_ROUTES.work) },
};

export default async function StudioWorkPage() {
  const [settings, projects] = await Promise.all([getSiteSettings(), getPublishedProjects()]);
  return (
    <div className="container-page pt-12 md:pt-16">
      <SectionHeader
        as="h1"
        label="Case studies"
        heading={settings.studio.workHeading || "Case studies"}
        intro="Platforms, business systems and stores designed and built for real organisations. Open any project for the problem, the approach and the result."
      />
      <div className="mt-12">
        {projects.length ? <ProjectGrid projects={projects} basePath={STUDIO_ROUTES.work} showType={false} /> : <EmptyState title="Projects are being added." />}
      </div>
      <div className="mt-28">
        <FinalCta settings={settings} />
      </div>
    </div>
  );
}
