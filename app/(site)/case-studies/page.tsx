import { notFound } from "next/navigation";
import { CaseStudyList } from "@/components/site/content-lists";
import { EmptyState, SectionHeader } from "@/components/site/section-header";
import { getPublishedCaseStudies, getSiteSettings } from "@/lib/data/public";
import { pageMeta } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata() {
  return pageMeta(await getSiteSettings(), "caseStudies", "Case studies", "/case-studies");
}

export default async function CaseStudiesPage() {
  const [settings, items] = await Promise.all([getSiteSettings(), getPublishedCaseStudies()]);
  if (!settings.appearance.caseStudiesEnabled) notFound();
  return (
    <div className="container-page pt-12 md:pt-16">
      <SectionHeader
        as="h1"
        label="Engineering"
        heading="Case studies"
        intro={
          settings.seo.pages.caseStudies.description ||
          "Longer write-ups on architecture, data modelling, reliability and trade-offs. Each is labelled as a production system, a design exercise or a technical exploration."
        }
      />
      <div className="mt-12">
        {items.length ? <CaseStudyList items={items} /> : <EmptyState title="No case studies published yet." />}
      </div>
    </div>
  );
}
