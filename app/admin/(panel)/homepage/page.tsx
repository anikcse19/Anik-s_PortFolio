import { HomepageEditor } from "@/components/admin/settings/homepage-editor";
import { homepageHasUnpublishedChanges, readSettings } from "@/lib/admin/settings";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { ArticleModel, CaseStudyModel, ProjectModel } from "@/lib/models";

export const metadata = { title: "Homepage" };

async function options(model: typeof ProjectModel) {
  const docs = await model.find({}).select("title status featured").sort({ sortOrder: 1, createdAt: -1 }).limit(200).lean();
  return docs.map((d) => ({ id: String(d._id), label: String(d.title), status: String(d.status), featured: Boolean(d.featured) }));
}

export default async function HomepageSettingsPage() {
  await requireAdmin();
  await connectDB();
  const [settings, projects, caseStudies, articles] = await Promise.all([readSettings("homepage"), options(ProjectModel), options(CaseStudyModel), options(ArticleModel)]);
  return (
    <HomepageEditor
      draft={settings.draft}
      hasUnpublished={homepageHasUnpublishedChanges(settings)}
      publishedAt={settings.publishedAt}
      options={{ projects, caseStudies, articles }}
    />
  );
}
