import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/editors/project-editor";
import { emptyProject } from "@/lib/admin/defaults";
import { getDocument } from "@/lib/admin/crud";
import { NotFoundError } from "@/lib/admin/errors";
import { toInput } from "@/lib/admin/form-utils";
import { requireAdmin } from "@/lib/auth/session";
import { ProjectModel } from "@/lib/models";
import type { Project } from "@/lib/types";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const doc = await getDocument<Project>("projects", id).catch((e) => {
    if (e instanceof NotFoundError) return null;
    throw e;
  });
  if (!doc) notFound();
  const suggestions = (await ProjectModel.distinct("technologies")) as string[];
  return <ProjectEditor key={doc.id} id={doc.id} updatedAt={doc.updatedAt} initial={toInput(emptyProject(), doc)} techSuggestions={suggestions.sort()} />;
}
