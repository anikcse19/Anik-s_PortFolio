import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Blocks, RichText } from "@/components/ui/rich-content";
import { SiteImage } from "@/components/ui/site-image";
import type { ProjectListItem } from "@/lib/data/public";
import { formatDate } from "@/lib/dates";
import { sanitizeRichText } from "@/lib/sanitize";
import type { Article, CaseStudy, Project } from "@/lib/types";
import { padIndex } from "@/lib/utils";
import { CASE_STUDY_KIND_LABELS, CASE_STUDY_TOPIC_LABELS, PROJECT_TYPE_LABELS } from "@/lib/validation/content";

/* ------------------------------------------------------------ Shared pieces */

function Breadcrumb({ href, label }: { href: string; label: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <Link href={href} className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors duration-fast hover:text-ink">
        <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
        {label}
      </Link>
    </nav>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1 text-ink">
      {children}
      <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

type TocEntry = { id: string; label: string };

/** Two-column article body: sticky table of contents on large screens, content on the right. */
function DocumentBody({ toc, children }: { toc: TocEntry[]; children: ReactNode }) {
  return (
    <div className="grid-page mt-16 gap-y-10">
      {toc.length > 1 ? (
        <nav aria-label="On this page" className="col-span-4 md:col-span-8 lg:col-span-3">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <p className="label mb-3">On this page</p>
            <ol className="space-y-1.5 border-l border-rule text-sm">
              {toc.map((entry, i) => (
                <li key={entry.id}>
                  <a href={`#${entry.id}`} className="-ml-px block border-l border-transparent py-0.5 pl-4 text-ink-2 transition-colors duration-fast hover:border-accent hover:text-ink">
                    <span className="mr-2 font-mono text-xs text-ink-3">{padIndex(i)}</span>
                    {entry.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      ) : null}
      <div className={toc.length > 1 ? "col-span-4 space-y-16 md:col-span-8 lg:col-span-8 lg:col-start-5" : "col-span-4 space-y-16 md:col-span-8 lg:col-span-8 lg:col-start-3"}>
        {children}
      </div>
    </div>
  );
}

function DocSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-28">
      <h2 id={id} className="mb-6 border-t border-rule pt-4 text-title-3 font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function TagList({ items, label }: { items: string[]; label: string }) {
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={label}>
      {items.map((t) => (
        <li key={t} className="tag">
          {t}
        </li>
      ))}
    </ul>
  );
}

function hasHtml(html: string) {
  return sanitizeRichText(html) !== "";
}

/* ------------------------------------------------------------------ Project */

export function ProjectDetail({
  project,
  relatedCaseStudies = [],
  neighbors,
}: {
  project: Project;
  relatedCaseStudies?: { slug: string; title: string; kind: CaseStudy["kind"] }[];
  neighbors?: { prev: ProjectListItem | null; next: ProjectListItem | null };
}) {
  const sections: { id: string; label: string; node: ReactNode }[] = [];
  if (hasHtml(project.overview)) sections.push({ id: "overview", label: "Overview", node: <RichText html={project.overview} /> });
  if (hasHtml(project.problem)) sections.push({ id: "problem", label: "The problem", node: <RichText html={project.problem} /> });
  if (hasHtml(project.contribution)) {
    sections.push({ id: "contribution", label: "My contribution", node: <RichText html={project.contribution} /> });
  }
  if (hasHtml(project.architecture)) {
    sections.push({ id: "architecture", label: "Architecture", node: <RichText html={project.architecture} /> });
  }
  if (project.decisions.length) {
    sections.push({
      id: "decisions",
      label: "Key decisions",
      node: (
        <ol className="space-y-6">
          {project.decisions.map((d, i) => (
            <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-x-2">
              <span className="font-mono text-sm text-ink-3">{padIndex(i)}</span>
              <div>
                <h3 className="font-semibold text-ink">{d.title}</h3>
                <p className="mt-1.5 max-w-prose whitespace-pre-line text-ink-2">{d.body}</p>
              </div>
            </li>
          ))}
        </ol>
      ),
    });
  }
  if (project.features.length) {
    sections.push({
      id: "features",
      label: "Key features",
      node: (
        <ul className="prose-journal">
          {project.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ),
    });
  }
  if (project.challenges.length) {
    sections.push({
      id: "challenges",
      label: "Challenges & solutions",
      node: (
        <dl className="divide-y divide-rule border-y border-rule">
          {project.challenges.map((c, i) => (
            <div key={i} className="grid gap-2 py-5 md:grid-cols-2 md:gap-8">
              <dt className="font-medium text-ink">{c.challenge}</dt>
              <dd className="whitespace-pre-line text-ink-2">{c.solution}</dd>
            </div>
          ))}
        </dl>
      ),
    });
  }
  if (project.outcomes.length) {
    sections.push({
      id: "outcomes",
      label: "Outcomes",
      node: (
        <ul className="prose-journal">
          {project.outcomes.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      ),
    });
  }
  if (project.gallery.length) {
    sections.push({
      id: "gallery",
      label: "Gallery",
      node: (
        <div className="grid gap-6 sm:grid-cols-2">
          {project.gallery.map((img, i) => (
            <figure key={img.url + i} className={project.gallery.length === 1 ? "sm:col-span-2" : undefined}>
              <SiteImage src={img.url} alt={img.alt} aspect="16 / 10" fit="contain" sizes="(min-width: 640px) 50vw, 100vw" className="border border-rule" />
              {img.caption ? <figcaption className="mt-2 text-sm text-ink-3">{img.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      ),
    });
  }

  const facts = [
    project.role ? { term: "Role", value: <>{project.role}</> } : null,
    project.organization ? { term: "Context", value: <>{project.organization}</> } : null,
    project.year ? { term: "Year", value: <>{project.year}</> } : null,
    project.liveUrl ? { term: "Live", value: <ExternalLink href={project.liveUrl}>{new URL(project.liveUrl).hostname.replace(/^www\./, "")}</ExternalLink> } : null,
    project.repoUrl ? { term: "Source", value: <ExternalLink href={project.repoUrl}>Repository</ExternalLink> } : null,
  ].filter((f): f is { term: string; value: React.ReactElement } => f !== null);

  return (
    <article className="container-page pt-10 md:pt-14">
      <Breadcrumb href="/projects" label="All projects" />
      <header className="grid-page gap-y-10">
        <div className="col-span-4 md:col-span-8 lg:col-span-8">
          <p className="label">
            {PROJECT_TYPE_LABELS[project.type]}
            {project.category ? ` · ${project.category}` : ""}
          </p>
          <h1 className="mt-4 text-title-1 font-semibold">{project.title}</h1>
          <p className="mt-6 max-w-prose text-lead text-ink-2">{project.summary}</p>
          <div className="mt-8">
            <TagList items={project.technologies} label="Technologies" />
          </div>
        </div>
        {facts.length ? (
          <dl className="col-span-4 self-end border-t border-rule md:col-span-8 lg:col-span-4">
            {facts.map((f) => (
              <div key={f.term} className="grid grid-cols-[6rem_1fr] gap-4 border-b border-rule py-3 text-[0.9375rem]">
                <dt className="label pt-0.5">{f.term}</dt>
                <dd className="text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </header>

      {project.coverImage?.url ? (
        <figure className="mt-14">
          <SiteImage
            src={project.coverImage.url}
            alt={project.coverImage.alt}
            aspect="16 / 9"
            priority
            sizes="(min-width: 1400px) 1400px, 100vw"
            className="border border-rule"
          />
          {project.coverImage.caption ? <figcaption className="mt-3 text-sm text-ink-3">{project.coverImage.caption}</figcaption> : null}
        </figure>
      ) : null}

      {sections.length ? (
        <DocumentBody toc={sections.map(({ id, label }) => ({ id, label }))}>
          {sections.map((s) => (
            <DocSection key={s.id} id={s.id} title={s.label}>
              {s.node}
            </DocSection>
          ))}
          {relatedCaseStudies.length ? (
            <aside className="border border-rule bg-surface p-6">
              <p className="label mb-3">Deeper dive</p>
              <ul className="space-y-2">
                {relatedCaseStudies.map((cs) => (
                  <li key={cs.slug}>
                    <Link href={`/case-studies/${cs.slug}`} className="link text-ink">
                      {cs.title}
                    </Link>
                    <span className="ml-2 text-sm text-ink-3">{CASE_STUDY_KIND_LABELS[cs.kind]}</span>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </DocumentBody>
      ) : null}

      {neighbors && (neighbors.prev || neighbors.next) ? (
        <nav aria-label="More projects" className="mt-24 grid grid-cols-1 border-t border-rule sm:grid-cols-2">
          {neighbors.prev ? (
            <Link href={`/projects/${neighbors.prev.slug}`} className="group py-6 sm:pr-6">
              <span className="label">Previous</span>
              <span className="mt-2 block text-title-3 font-semibold group-hover:text-accent">{neighbors.prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {neighbors.next ? (
            <Link href={`/projects/${neighbors.next.slug}`} className="group border-t border-rule py-6 sm:border-l sm:border-t-0 sm:pl-6 sm:text-right">
              <span className="label">Next</span>
              <span className="mt-2 block text-title-3 font-semibold group-hover:text-accent">{neighbors.next.title}</span>
            </Link>
          ) : null}
        </nav>
      ) : null}
    </article>
  );
}

/* --------------------------------------------------------------- Case study */

const KIND_NOTICE: Record<CaseStudy["kind"], string | null> = {
  production: null,
  design_exercise:
    "This is a design exercise: it describes a proposed architecture and the reasoning behind it, not a system running in production.",
  exploration:
    "This is a technical exploration: an investigation of an approach or technology, not a production deployment.",
};

export function CaseStudyDetail({ study, relatedProject }: { study: CaseStudy; relatedProject?: { slug: string; title: string } | null }) {
  const sections = study.sections.filter((s) => s.blocks.length > 0);
  const notice = KIND_NOTICE[study.kind];
  return (
    <article className="container-page pt-10 md:pt-14">
      <Breadcrumb href="/case-studies" label="All case studies" />
      <header className="grid-page gap-y-8">
        <div className="col-span-4 md:col-span-8 lg:col-span-9">
          <p className="label">
            <span className="text-accent">{CASE_STUDY_KIND_LABELS[study.kind]}</span>
            {study.context ? ` · ${study.context}` : ""}
          </p>
          <h1 className="mt-4 text-title-1 font-semibold">{study.title}</h1>
          <p className="mt-6 max-w-prose text-lead text-ink-2">{study.summary}</p>
        </div>
        <div className="col-span-4 space-y-5 md:col-span-8 lg:col-span-9">
          {notice ? (
            <p className="max-w-prose border-l-2 border-accent bg-surface px-4 py-3 text-[0.9375rem] text-ink-2" role="note">
              {notice}
            </p>
          ) : null}
          <dl className="flex flex-wrap gap-x-10 gap-y-3 text-[0.9375rem]">
            {study.role ? (
              <div>
                <dt className="label">My role</dt>
                <dd className="mt-1 text-ink">{study.role}</dd>
              </div>
            ) : null}
            {relatedProject ? (
              <div>
                <dt className="label">Project</dt>
                <dd className="mt-1">
                  <Link href={`/projects/${relatedProject.slug}`} className="link text-ink">
                    {relatedProject.title}
                  </Link>
                </dd>
              </div>
            ) : null}
          </dl>
          <TagList items={study.technologies} label="Technologies" />
        </div>
      </header>

      {study.coverImage?.url ? (
        <figure className="mt-14">
          <SiteImage src={study.coverImage.url} alt={study.coverImage.alt} aspect="16 / 9" priority sizes="100vw" className="border border-rule" />
          {study.coverImage.caption ? <figcaption className="mt-3 text-sm text-ink-3">{study.coverImage.caption}</figcaption> : null}
        </figure>
      ) : null}

      {sections.length ? (
        <DocumentBody toc={sections.map((s) => ({ id: `s-${s.id}`, label: s.heading }))}>
          {sections.map((s) => (
            <DocSection key={s.id} id={`s-${s.id}`} title={s.heading}>
              {s.topic ? <p className="label -mt-3 mb-5">{CASE_STUDY_TOPIC_LABELS[s.topic]}</p> : null}
              <Blocks blocks={s.blocks} />
            </DocSection>
          ))}
        </DocumentBody>
      ) : null}
    </article>
  );
}

/* ------------------------------------------------------------------ Article */

export function ArticleDetail({ article, relatedProjects = [] }: { article: Article; relatedProjects?: { slug: string; title: string }[] }) {
  return (
    <article className="container-page pt-10 md:pt-14">
      <Breadcrumb href="/writing" label="All notes" />
      <header className="mx-auto max-w-3xl">
        <p className="label">
          {article.category || "Note"}
          {article.publishedAt ? (
            <>
              {" · "}
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            </>
          ) : null}
          {" · "}
          {article.readingMinutes} min read
        </p>
        <h1 className="mt-4 text-title-1 font-semibold">{article.title}</h1>
        <p className="mt-6 text-lead text-ink-2">{article.excerpt}</p>
        <div className="mt-6">
          <TagList items={article.tags} label="Tags" />
        </div>
      </header>
      {article.coverImage?.url ? (
        <figure className="mx-auto mt-12 max-w-5xl">
          <SiteImage src={article.coverImage.url} alt={article.coverImage.alt} aspect="16 / 9" priority sizes="(min-width: 1024px) 1024px, 100vw" className="border border-rule" />
          {article.coverImage.caption ? <figcaption className="mt-3 text-sm text-ink-3">{article.coverImage.caption}</figcaption> : null}
        </figure>
      ) : null}
      <div className="mx-auto mt-12 max-w-3xl">
        <Blocks blocks={article.blocks} />
        {relatedProjects.length ? (
          <aside className="mt-16 border-t border-rule pt-6">
            <p className="label mb-3">Related projects</p>
            <ul className="space-y-2">
              {relatedProjects.map((p) => (
                <li key={p.slug}>
                  <Link href={`/projects/${p.slug}`} className="link text-ink">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </article>
  );
}
