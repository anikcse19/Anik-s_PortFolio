import { notFound } from "next/navigation";
import { CaseStudyDetail } from "@/components/site/detail-views";
import { getDocument } from "@/lib/admin/crud";
import { NotFoundError } from "@/lib/admin/errors";
import { requireAdmin } from "@/lib/auth/session";
import type { CaseStudy, Project } from "@/lib/types";

export default async function PreviewCaseStudyPage({ params }: PageProps<"/admin/preview/case-studies/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const study = await getDocument<CaseStudy>("caseStudies", id).catch((e) => (e instanceof NotFoundError ? null : Promise.reject(e)));
  if (!study) notFound();
  const project = study.relatedProjectId ? await getDocument<Project>("projects", study.relatedProjectId).catch(() => null) : null;
  return <CaseStudyDetail study={study} relatedProject={project ? { slug: project.slug, title: project.title } : null} />;
}
