import { ExperienceList, SkillLegend, SkillsGrid } from "@/components/site/content-lists";
import { EmptyState, SectionHeader } from "@/components/site/section-header";
import { getPublishedExperience, getPublishedSkillCategories, getSiteSettings } from "@/lib/data/public";
import { pageMeta } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  return pageMeta(await getSiteSettings(), "experience", "Experience", "/experience");
}

export default async function ExperiencePage() {
  const [settings, entries, skills] = await Promise.all([getSiteSettings(), getPublishedExperience(), getPublishedSkillCategories()]);
  return (
    <div className="container-page space-y-24 pt-12 md:pt-16">
      <section>
        <SectionHeader as="h1" label="Career" heading="Experience" intro={settings.seo.pages.experience.description || undefined} />
        <div className="mt-12">
          {entries.length ? <ExperienceList entries={entries} detailed /> : <EmptyState title="Experience details are being updated." />}
        </div>
      </section>
      {skills.length ? (
        <section aria-labelledby="skills-heading">
          <SectionHeader label="Capabilities" heading="Skills" id="skills-heading" intro="Grouped by area. Labels show where I have production experience, project experience, or am still learning.">
            <div className="mt-6">
              <SkillLegend categories={skills} />
            </div>
          </SectionHeader>
          <div className="mt-10">
            <SkillsGrid categories={skills} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
