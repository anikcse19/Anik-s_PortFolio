import { CaseStudyEditor } from "@/components/admin/editors/case-study-editor";
import { emptyCaseStudy } from "@/lib/admin/defaults";
import { projectOptions } from "@/lib/admin/options";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "New case study" };

export default async function NewCaseStudyPage() {
  await requireAdmin();
  return <CaseStudyEditor id={null} updatedAt={null} initial={emptyCaseStudy()} projects={await projectOptions()} />;
}
