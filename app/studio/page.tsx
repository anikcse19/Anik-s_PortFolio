import { StudioHome } from "@/components/studio/studio-home";
import { getPublishedExperience, getPublishedProjects, getSiteSettings } from "@/lib/data/public";
import { absoluteUrl } from "@/lib/seo";
import { STUDIO_ROUTES } from "@/lib/studio";

export const revalidate = 3600;

export async function generateMetadata() {
  return { alternates: { canonical: absoluteUrl(STUDIO_ROUTES.home) } };
}

export default async function StudioPage() {
  const [settings, projects, experience] = await Promise.all([getSiteSettings(), getPublishedProjects(), getPublishedExperience()]);
  return <StudioHome settings={settings} projects={projects} experience={experience} />;
}
