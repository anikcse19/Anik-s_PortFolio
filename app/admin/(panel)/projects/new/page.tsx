import { ProjectEditor } from "@/components/admin/editors/project-editor";
import { emptyProject } from "@/lib/admin/defaults";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { ProjectModel } from "@/lib/models";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  await requireAdmin();
  await connectDB();
  const suggestions = (await ProjectModel.distinct("technologies")) as string[];
  return <ProjectEditor id={null} updatedAt={null} initial={emptyProject()} techSuggestions={suggestions.sort()} />;
}
