import { notFound } from "next/navigation";
import { CaseStudyEditor } from "@/components/admin/editors/case-study-editor";
import { emptyCaseStudy } from "@/lib/admin/defaults";
import { getDocument } from "@/lib/admin/crud";
import { NotFoundError } from "@/lib/admin/errors";
import { toInput } from "@/lib/admin/form-utils";
import { projectOptions } from "@/lib/admin/options";
import { requireAdmin } from "@/lib/auth/session";
import type { CaseStudy } from "@/lib/types";

export const metadata = { title: "Edit case study" };

export default async function EditCaseStudyPage({ params }: PageProps<"/admin/case-studies/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const doc = await getDocument<CaseStudy>("caseStudies", id).catch((e) => (e instanceof NotFoundError ? null : Promise.reject(e)));
  if (!doc) notFound();
  return <CaseStudyEditor key={doc.id} id={doc.id} updatedAt={doc.updatedAt} initial={toInput(emptyCaseStudy(), doc)} projects={await projectOptions()} />;
}
