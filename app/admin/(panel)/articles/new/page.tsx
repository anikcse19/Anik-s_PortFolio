import { ArticleEditor } from "@/components/admin/editors/article-editor";
import { emptyArticle } from "@/lib/admin/defaults";
import { projectOptions } from "@/lib/admin/options";
import { readSettings } from "@/lib/admin/settings";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "New article" };

export default async function NewArticlePage() {
  await requireAdmin();
  const [projects, appearance] = await Promise.all([projectOptions(), readSettings("appearance")]);
  return <ArticleEditor id={null} updatedAt={null} initial={emptyArticle()} projects={projects} writingEnabled={appearance.writingEnabled} />;
}
