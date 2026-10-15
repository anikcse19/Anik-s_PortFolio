import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/site/detail-views";
import { getDocument } from "@/lib/admin/crud";
import { NotFoundError } from "@/lib/admin/errors";
import { requireAdmin } from "@/lib/auth/session";
import type { Project } from "@/lib/types";

export default async function PreviewProjectPage({ params }: PageProps<"/admin/preview/projects/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const project = await getDocument<Project>("projects", id).catch((e) => (e instanceof NotFoundError ? null : Promise.reject(e)));
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
