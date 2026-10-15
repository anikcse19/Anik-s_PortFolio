import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyDetail } from "@/components/site/detail-views";
import { JsonLd } from "@/components/ui/json-ld";
import { getCaseStudyBySlug, getPublishedCaseStudies, getPublishedProjects, getSiteSettings } from "@/lib/data/public";
import { absoluteUrl, buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const items = await getPublishedCaseStudies();
  return items.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [settings, study] = await Promise.all([getSiteSettings(), getCaseStudyBySlug(slug)]);
  if (!study || !settings.appearance.caseStudiesEnabled) return { title: "Not found", robots: { index: false } };
  return buildMetadata(settings, {
    title: study.seo.title || study.title,
    description: study.seo.description || study.summary,
    image: study.seo.ogImage || study.coverImage?.url,
    path: `/case-studies/${study.slug}`,
    type: "article",
    publishedTime: study.publishedAt,
    modifiedTime: study.updatedAt,
  });
}

export default async function CaseStudyPage({ params }: PageProps<"/case-studies/[slug]">) {
  const { slug } = await params;
  const [settings, study, projects] = await Promise.all([getSiteSettings(), getCaseStudyBySlug(slug), getPublishedProjects()]);
  if (!study || !settings.appearance.caseStudiesEnabled) notFound();
  const related = study.relatedProjectId ? projects.find((p) => p.id === study.relatedProjectId) : null;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: study.title,
          description: study.summary,
          url: absoluteUrl(`/case-studies/${study.slug}`),
          author: { "@type": "Person", name: settings.profile.name },
          ...(study.publishedAt ? { datePublished: study.publishedAt } : {}),
          dateModified: study.updatedAt,
        }}
      />
      <CaseStudyDetail study={study} relatedProject={related ? { slug: related.slug, title: related.title } : null} />
    </>
  );
}
