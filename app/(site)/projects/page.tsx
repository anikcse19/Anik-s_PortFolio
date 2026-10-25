import { Suspense } from "react";
import { ProjectLedger } from "@/components/site/project-list";
import { ProjectsExplorer } from "@/components/site/projects-explorer";
import { EmptyState, SectionHeader } from "@/components/site/section-header";
import { getPublishedProjects, getSiteSettings } from "@/lib/data/public";
import { pageMeta } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  return pageMeta(await getSiteSettings(), "projects", "Projects", "/projects");
}

export default async function ProjectsPage() {
  const [settings, projects] = await Promise.all([getSiteSettings(), getPublishedProjects()]);
  const intro = settings.seo.pages.projects.description;
  return (
    <div className="container-page pt-12 md:pt-16">
      <SectionHeader as="h1" label="Work" heading="Projects" intro={intro || "Professional work, personal projects and open-source contributions. Each entry notes the context it was built in and my role."} />
      <div className="mt-12">
        {projects.length ? (
          <Suspense fallback={<ProjectLedger projects={projects} />}>
            <ProjectsExplorer projects={projects} layout={settings.appearance.projectsLayout} />
          </Suspense>
        ) : (
          <EmptyState title="No published projects yet.">Projects appear here once they are published from the admin panel.</EmptyState>
        )}
      </div>
    </div>
  );
}
