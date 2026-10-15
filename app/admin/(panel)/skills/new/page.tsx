import { SkillCategoryEditor } from "@/components/admin/editors/skill-category-editor";
import { emptySkillCategory } from "@/lib/admin/defaults";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "New skill category" };

export default async function NewSkillCategoryPage() {
  await requireAdmin();
  return <SkillCategoryEditor id={null} updatedAt={null} initial={emptySkillCategory()} />;
}
