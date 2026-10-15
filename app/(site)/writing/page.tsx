import { notFound } from "next/navigation";
import { ArticleList } from "@/components/site/content-lists";
import { EmptyState, SectionHeader } from "@/components/site/section-header";
import { getPublishedArticles, getSiteSettings } from "@/lib/data/public";
import { pageMeta } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  return pageMeta(await getSiteSettings(), "writing", "Engineering notes", "/writing");
}

export default async function WritingPage() {
  const [settings, items] = await Promise.all([getSiteSettings(), getPublishedArticles()]);
  if (!settings.appearance.writingEnabled) notFound();
  return (
    <div className="container-page pt-12 md:pt-16">
      <SectionHeader as="h1" label="Notes" heading="Engineering notes" intro={settings.seo.pages.writing.description || undefined} />
      <div className="mt-12">{items.length ? <ArticleList items={items} /> : <EmptyState title="Nothing published yet." />}</div>
    </div>
  );
}
