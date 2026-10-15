import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/components/site/detail-views";
import { JsonLd } from "@/components/ui/json-ld";
import { getArticleBySlug, getPublishedArticles, getPublishedProjects, getSiteSettings } from "@/lib/data/public";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const items = await getPublishedArticles();
  return items.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/writing/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [settings, article] = await Promise.all([getSiteSettings(), getArticleBySlug(slug)]);
  if (!article || !settings.appearance.writingEnabled) return { title: "Not found", robots: { index: false } };
  return buildMetadata(settings, {
    title: article.seo.title || article.title,
    description: article.seo.description || article.excerpt,
    image: article.seo.ogImage || article.coverImage?.url,
    path: `/writing/${article.slug}`,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
  });
}

export default async function ArticlePage({ params }: PageProps<"/writing/[slug]">) {
  const { slug } = await params;
  const [settings, article, projects] = await Promise.all([getSiteSettings(), getArticleBySlug(slug), getPublishedProjects()]);
  if (!article || !settings.appearance.writingEnabled) notFound();
  const related = article.relatedProjectIds
    .map((id) => projects.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ slug: p.slug, title: p.title }));
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          description: article.excerpt,
          url: absoluteUrl(`/writing/${article.slug}`),
          author: { "@type": "Person", name: settings.profile.name },
          ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
          dateModified: article.updatedAt,
          keywords: article.tags.join(", "),
          ...(article.coverImage?.url ? { image: absoluteUrl(article.coverImage.url) } : {}),
        }}
      />
      <ArticleDetail article={article} relatedProjects={related} />
    </>
  );
}
