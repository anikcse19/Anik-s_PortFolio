import { ExperienceEditor } from "@/components/admin/editors/experience-editor";
import { emptyExperience } from "@/lib/admin/defaults";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "New experience entry" };

export default async function NewExperiencePage() {
  await requireAdmin();
  return <ExperienceEditor id={null} updatedAt={null} initial={emptyExperience()} />;
}
