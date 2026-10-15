import { notFound } from "next/navigation";
import { SkillCategoryEditor } from "@/components/admin/editors/skill-category-editor";
import { emptySkillCategory } from "@/lib/admin/defaults";
import { getDocument } from "@/lib/admin/crud";
import { NotFoundError } from "@/lib/admin/errors";
import { toInput } from "@/lib/admin/form-utils";
import { requireAdmin } from "@/lib/auth/session";
import type { SkillCategory } from "@/lib/types";

export const metadata = { title: "Edit skill category" };

export default async function EditSkillCategoryPage({ params }: PageProps<"/admin/skills/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const doc = await getDocument<SkillCategory>("skills", id).catch((e) => (e instanceof NotFoundError ? null : Promise.reject(e)));
  if (!doc) notFound();
  return <SkillCategoryEditor key={doc.id} id={doc.id} updatedAt={doc.updatedAt} initial={toInput(emptySkillCategory(), doc)} />;
}
