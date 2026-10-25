import { renderToBuffer } from "@react-pdf/renderer";
import { ResumeDocument } from "@/components/resume/resume-document";
import { getPublishedExperience, getPublishedProjects, getPublishedSkillCategories, getSiteSettings } from "@/lib/data/public";
import { getSiteUrl } from "@/lib/env";
import { buildResume, resumeFilename } from "@/lib/resume";

/**
 * The résumé, generated from the same published content as the site. It is
 * cached like the pages and refreshed whenever content or settings are saved.
 */
export const revalidate = 3600;

export async function GET() {
  const [settings, experience, projects, skills] = await Promise.all([
    getSiteSettings(),
    getPublishedExperience(),
    getPublishedProjects(),
    getPublishedSkillCategories(),
  ]);
  const data = buildResume(settings, { experience, projects, skills }, getSiteUrl());
  const pdf = await renderToBuffer(<ResumeDocument data={data} />);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${resumeFilename(data.name)}"`,
      // A résumé is shared by link, not discovered through search.
      "X-Robots-Tag": "noindex",
    },
  });
}
