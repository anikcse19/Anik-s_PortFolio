import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/site/detail-views";
import { getDocument } from "@/lib/admin/crud";
import { NotFoundError } from "@/lib/admin/errors";
import { requireAdmin } from "@/lib/auth/session";
import type { Article } from "@/lib/types";

export default async function PreviewArticlePage({ params }: PageProps<"/admin/preview/articles/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const article = await getDocument<Article>("articles", id).catch((e) => (e instanceof NotFoundError ? null : Promise.reject(e)));
  if (!article) notFound();
  return <ArticleDetail article={article} />;
}
