import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/admin/editors/article-editor";
import { emptyArticle } from "@/lib/admin/defaults";
import { getDocument } from "@/lib/admin/crud";
import { NotFoundError } from "@/lib/admin/errors";
import { toInput } from "@/lib/admin/form-utils";
import { projectOptions } from "@/lib/admin/options";
import { readSettings } from "@/lib/admin/settings";
import { requireAdmin } from "@/lib/auth/session";
import type { Article } from "@/lib/types";

export const metadata = { title: "Edit article" };

export default async function EditArticlePage({ params }: PageProps<"/admin/articles/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const doc = await getDocument<Article>("articles", id).catch((e) => (e instanceof NotFoundError ? null : Promise.reject(e)));
  if (!doc) notFound();
  const [projects, appearance] = await Promise.all([projectOptions(), readSettings("appearance")]);
  const initial = { ...toInput(emptyArticle(), doc as unknown as Record<string, unknown>), publishedAt: doc.publishedAt ?? "" };
  return <ArticleEditor key={doc.id} id={doc.id} updatedAt={doc.updatedAt} initial={initial} projects={projects} writingEnabled={appearance.writingEnabled} />;
}
