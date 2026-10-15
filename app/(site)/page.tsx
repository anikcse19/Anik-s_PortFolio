import { HomeView } from "@/components/site/home-view";
import { JsonLd } from "@/components/ui/json-ld";
import {
  getPublishedArticles,
  getPublishedCaseStudies,
  getPublishedExperience,
  getPublishedProjects,
  getPublishedSkillCategories,
  getSiteSettings,
} from "@/lib/data/public";
import { pageMeta, personJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return pageMeta(settings, "home", settings.seo.defaultTitle, "/");
}

export default async function HomePage() {
  const [settings, projects, caseStudies, articles, experience, skills] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects(),
    getPublishedCaseStudies(),
    getPublishedArticles(),
    getPublishedExperience(),
    getPublishedSkillCategories(),
  ]);
  return (
    <>
      <JsonLd data={personJsonLd(settings)} />
      <HomeView config={settings.homepage.published} settings={settings} data={{ projects, caseStudies, articles, experience, skills }} />
    </>
  );
}
