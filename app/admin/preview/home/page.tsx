import { HomeView } from "@/components/site/home-view";
import { readSettings } from "@/lib/admin/settings";
import { requireAdmin } from "@/lib/auth/session";
import {
  getPublishedArticles,
  getPublishedCaseStudies,
  getPublishedExperience,
  getPublishedProjects,
  getPublishedSkillCategories,
  getSiteSettings,
} from "@/lib/data/public";

export default async function PreviewHomePage() {
  await requireAdmin();
  const [settings, homepage, projects, caseStudies, articles, experience, skills] = await Promise.all([
    getSiteSettings(),
    readSettings("homepage"),
    getPublishedProjects(),
    getPublishedCaseStudies(),
    getPublishedArticles(),
    getPublishedExperience(),
    getPublishedSkillCategories(),
  ]);
  return <HomeView config={homepage.draft} settings={settings} data={{ projects, caseStudies, articles, experience, skills }} />;
}
