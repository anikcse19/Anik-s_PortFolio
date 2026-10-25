import { connectDB } from "@/lib/db";
import { isMailConfigured } from "@/lib/env";
import { ArticleModel, CaseStudyModel, ExperienceModel, MessageModel, ProjectModel, SkillCategoryModel } from "@/lib/models";
import { countByStatus } from "./crud";
import { homepageHasUnpublishedChanges, readSettings } from "./settings";
import { countOutOfSync } from "./sync";

export type DashboardWarning = { message: string; href: string };
export type RecentItem = { kind: string; title: string; href: string; updatedAt: string; status?: string };

/** Real counts and content-quality warnings computed from the database (no fabricated analytics). */
export async function getDashboardData() {
  await connectDB();
  const [projects, caseStudies, articles, experience, skills, unread, profile, contact, homepage, appearance, seo, resume] = await Promise.all([
    countByStatus("projects"),
    countByStatus("caseStudies"),
    countByStatus("articles"),
    countByStatus("experience"),
    countByStatus("skills"),
    MessageModel.countDocuments({ read: false }),
    readSettings("profile"),
    readSettings("contact"),
    readSettings("homepage"),
    readSettings("appearance"),
    readSettings("seo"),
    readSettings("resume"),
  ]);

  const warnings: DashboardWarning[] = [];
  const projectsMissingCover = await ProjectModel.find({ status: "published", $or: [{ coverImage: null }, { "coverImage.url": "" }] }).select("title").limit(10).lean();
  for (const p of projectsMissingCover) warnings.push({ message: `Published project “${String(p.title)}” has no cover image.`, href: `/admin/projects/${String(p._id)}` });
  const thinProjects = await ProjectModel.find({ status: "published", overview: "", problem: "", contribution: "" }).select("title").limit(10).lean();
  for (const p of thinProjects) warnings.push({ message: `“${String(p.title)}” has no overview, problem or contribution write-up yet.`, href: `/admin/projects/${String(p._id)}` });
  const undated = await ExperienceModel.find({ status: "published", startDate: "" }).select("title organization").limit(10).lean();
  for (const e of undated) warnings.push({ message: `Experience “${String(e.title)} · ${String(e.organization)}” is published without a start date.`, href: `/admin/experience/${String(e._id)}` });
  const currentRoles = await ExperienceModel.countDocuments({ status: "published", isCurrent: true });
  if (currentRoles > 1) warnings.push({ message: `${currentRoles} published experience entries are marked as current. Check this is intended.`, href: "/admin/experience" });
  const draftsNeedingReview = await ExperienceModel.countDocuments({ status: "draft" });
  if (draftsNeedingReview) warnings.push({ message: `${draftsNeedingReview} experience entr${draftsNeedingReview === 1 ? "y is" : "ies are"} in draft and need confirming before publishing.`, href: "/admin/experience?status=draft" });
  if (!contact.email) warnings.push({ message: "No public contact email is set.", href: "/admin/contact" });
  if (!profile.resumeUrl && !resume.useGenerated) warnings.push({ message: "No résumé is set up, so résumé links are hidden. Turn on the generated résumé or add a résumé URL.", href: "/admin/resume" });
  if (!profile.portrait) warnings.push({ message: "No portrait is set for the About page.", href: "/admin/profile" });
  if (!seo.ogImage && !profile.portrait) warnings.push({ message: "No default social sharing image is set.", href: "/admin/seo" });
  if (homepageHasUnpublishedChanges(homepage)) warnings.push({ message: "The homepage draft has unpublished changes.", href: "/admin/homepage" });
  if (!isMailConfigured()) warnings.push({ message: "Email notifications for the contact form are not configured (messages are still saved).", href: "/admin/messages" });
  if (seo.noindex) warnings.push({ message: "The site is hidden from search engines (noindex is on).", href: "/admin/seo" });
  const sync = await countOutOfSync();
  if (sync.changed || sync.removed) {
    const n = sync.changed + sync.removed;
    warnings.push({ message: `${n} item${n === 1 ? " has" : "s have"} changed since you last updated LinkedIn or GitHub.`, href: "/admin/sync" });
  } else if (sync.fresh) {
    warnings.push({ message: `${sync.fresh} LinkedIn and GitHub item${sync.fresh === 1 ? " has" : "s have"} never been synced.`, href: "/admin/sync" });
  }

  const recentQueries = [
    { model: ProjectModel, kind: "Project", field: "title", base: "/admin/projects" },
    { model: CaseStudyModel, kind: "Case study", field: "title", base: "/admin/case-studies" },
    { model: ArticleModel, kind: "Article", field: "title", base: "/admin/articles" },
    { model: ExperienceModel, kind: "Experience", field: "title", base: "/admin/experience" },
    { model: SkillCategoryModel, kind: "Skills", field: "name", base: "/admin/skills" },
  ];
  const recentLists = await Promise.all(
    recentQueries.map(async (q) => {
      const docs = await q.model.find({}).select(`${q.field} status updatedAt`).sort({ updatedAt: -1 }).limit(6).lean();
      return docs.map<RecentItem>((d) => ({
        kind: q.kind,
        title: String(d[q.field] ?? "Untitled"),
        href: `${q.base}/${String(d._id)}`,
        updatedAt: new Date(d.updatedAt as Date).toISOString(),
        status: d.status as string | undefined,
      }));
    }),
  );
  const recent = recentLists
    .flat()
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 10);

  return { counts: { projects, caseStudies, articles, experience, skills, unread }, warnings, recent, appearance };
}
