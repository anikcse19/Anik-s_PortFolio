import { ExperienceList, SkillLegend, SkillsGrid, visibleSkillCategories } from "@/components/site/content-lists";
import { EmptyState, SectionHeader } from "@/components/site/section-header";
import { getPublishedExperience, getPublishedSkillCategories, getSiteSettings } from "@/lib/data/public";
import { pageMeta } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  return pageMeta(await getSiteSettings(), "experience", "Experience", "/experience");
}

export default async function ExperiencePage() {
  const [settings, entries, allSkills] = await Promise.all([getSiteSettings(), getPublishedExperience(), getPublishedSkillCategories()]);
  const skills = visibleSkillCategories(allSkills, settings.appearance.showLearningSkills);
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
          <SectionHeader label="Stack" heading="Skills" id="skills-heading" intro="The tools and practices I use to ship and run production software.">
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
