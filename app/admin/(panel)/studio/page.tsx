import { StudioSettingsForm } from "@/components/admin/settings/studio-form";
import { readSettings } from "@/lib/admin/settings";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { getGatePassword } from "@/lib/env";
import { ProjectModel } from "@/lib/models";

export const metadata = { title: "Studio" };

export default async function StudioSettingsPage() {
  await requireAdmin();
  await connectDB();
  const [settings, docs] = await Promise.all([
    readSettings("studio"),
    ProjectModel.find({}).select("title status featured").sort({ sortOrder: 1, createdAt: -1 }).limit(200).lean(),
  ]);
  const projects = docs.map((d) => ({ id: String(d._id), label: String(d.title), status: String(d.status), featured: Boolean(d.featured) }));
  return <StudioSettingsForm initial={settings} projects={projects} gateConfigured={getGatePassword() !== null} />;
}
