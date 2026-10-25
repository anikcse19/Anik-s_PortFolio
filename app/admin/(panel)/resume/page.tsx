import { ResumeForm } from "@/components/admin/settings/resume-form";
import { readSettings } from "@/lib/admin/settings";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { ExperienceModel, ProjectModel } from "@/lib/models";

export const metadata = { title: "Résumé" };

export default async function ResumeSettingsPage() {
  await requireAdmin();
  await connectDB();
  const [settings, profile, experienceDocs, projectDocs] = await Promise.all([
    readSettings("resume"),
    readSettings("profile"),
    ExperienceModel.find({}).select("title organization status").sort({ sortOrder: 1, createdAt: -1 }).limit(100).lean(),
    ProjectModel.find({}).select("title status featured").sort({ sortOrder: 1, createdAt: -1 }).limit(200).lean(),
  ]);
  const experience = experienceDocs.map((d) => ({ id: String(d._id), label: `${String(d.title)} — ${String(d.organization)}`, status: String(d.status) }));
  const projects = projectDocs.map((d) => ({ id: String(d._id), label: String(d.title), status: String(d.status), featured: Boolean(d.featured) }));
  return <ResumeForm initial={settings} experience={experience} projects={projects} externalUrl={profile.resumeUrl} />;
}
