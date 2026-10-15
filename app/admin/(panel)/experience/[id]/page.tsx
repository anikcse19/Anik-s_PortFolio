import { notFound } from "next/navigation";
import { ExperienceEditor } from "@/components/admin/editors/experience-editor";
import { emptyExperience } from "@/lib/admin/defaults";
import { getDocument } from "@/lib/admin/crud";
import { NotFoundError } from "@/lib/admin/errors";
import { toInput } from "@/lib/admin/form-utils";
import { requireAdmin } from "@/lib/auth/session";
import type { Experience } from "@/lib/types";

export const metadata = { title: "Edit experience" };

export default async function EditExperiencePage({ params }: PageProps<"/admin/experience/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const doc = await getDocument<Experience>("experience", id).catch((e) => (e instanceof NotFoundError ? null : Promise.reject(e)));
  if (!doc) notFound();
  return <ExperienceEditor key={doc.id} id={doc.id} updatedAt={doc.updatedAt} initial={toInput(emptyExperience(), doc)} />;
}
