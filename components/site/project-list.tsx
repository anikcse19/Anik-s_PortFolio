import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SiteImage } from "@/components/ui/site-image";
import type { ProjectListItem } from "@/lib/data/public";
import { cn, padIndex } from "@/lib/utils";
import { PROJECT_TYPE_LABELS } from "@/lib/validation/content";

function TechList({ items, max = 4 }: { items: string[]; max?: number }) {
  if (!items.length) return null;
  const shown = items.slice(0, max);
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
      {shown.map((t) => (
        <li key={t} className="tag">
          {t}
        </li>
      ))}
      {items.length > max ? <li className="tag border-transparent text-ink-3">+{items.length - max}</li> : null}
    </ul>
  );
}

/** Large lead entry used for the first project on the homepage when it has a cover image. */
export function ProjectLead({ project, index = 0 }: { project: ProjectListItem; index?: number }) {
  return (
    <article className="group grid-page gap-y-6 border-t border-rule py-8">
      <Link
        href={`/projects/${project.slug}`}
        className="col-span-4 md:col-span-8 lg:col-span-7"
        aria-label={`${project.title} — read the project write-up`}
        tabIndex={-1}
      >
        <SiteImage
          src={project.coverImage?.url}
          alt={project.coverImage?.alt ?? ""}
          aspect="16 / 10"
          sizes="(min-width: 1024px) 760px, 100vw"
          className="border border-rule transition-[filter] duration-base group-hover:brightness-[1.04]"
          placeholderLabel={project.title}
        />
      </Link>
      <div className="col-span-4 flex flex-col md:col-span-8 lg:col-span-5">
        <p className="label">
          <span className="text-accent">{padIndex(index)}</span> · {PROJECT_TYPE_LABELS[project.type]}
          {project.year ? ` · ${project.year}` : ""}
        </p>
        <h3 className="mt-3 text-title-2 font-semibold">
          <Link href={`/projects/${project.slug}`} className="transition-colors duration-fast hover:text-accent">
            {project.title}
          </Link>
        </h3>
        <p className="mt-4 text-ink-2">{project.summary}</p>
        {project.role || project.organization ? (
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
            {project.role ? (
              <>
                <dt className="text-ink-3">Role</dt>
                <dd className="text-ink">{project.role}</dd>
              </>
            ) : null}
            {project.organization ? (
              <>
                <dt className="text-ink-3">Context</dt>
                <dd className="text-ink">{project.organization}</dd>
              </>
            ) : null}
          </dl>
        ) : null}
        <div className="mt-6">
          <TechList items={project.technologies} max={6} />
        </div>
        <Link href={`/projects/${project.slug}`} className="link mt-auto inline-flex w-fit items-center gap-1 pt-8 text-[0.9375rem] text-ink">
          Read the write-up <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

/** Dense, scannable index of projects — the default layout. */
export function ProjectLedger({ projects, startIndex = 0 }: { projects: ProjectListItem[]; startIndex?: number }) {
  return (
    <ol className="border-b border-rule">
      {projects.map((project, i) => (
        <li key={project.id} className="border-t border-rule">
          <Link
            href={`/projects/${project.slug}`}
            className="group grid-page items-start gap-y-3 py-6 transition-colors duration-fast hover:bg-surface/60 md:py-7"
          >
            <span className="col-span-1 pt-1 font-mono text-sm text-ink-3 group-hover:text-accent" aria-hidden>
              {padIndex(startIndex + i)}
            </span>
            <div className="col-span-3 md:col-span-4 lg:col-span-5">
              <h3 className="text-title-3 font-semibold transition-colors duration-fast group-hover:text-accent">{project.title}</h3>
              <p className="mt-2 line-clamp-3 text-[0.975rem] text-ink-2 md:line-clamp-2">{project.summary}</p>
            </div>
            <div className="col-span-3 col-start-2 md:col-span-2 md:col-start-auto lg:col-span-3">
              <TechList items={project.technologies} max={3} />
            </div>
            <div className="col-span-3 col-start-2 text-sm text-ink-3 md:col-span-1 md:col-start-auto lg:col-span-2">
              <span className="block">{PROJECT_TYPE_LABELS[project.type]}</span>
              {project.category ? <span className="block">{project.category}</span> : null}
            </div>
            <span className="hidden items-start justify-end gap-2 font-mono text-sm text-ink-3 lg:col-span-1 lg:flex">
              {project.year}
              <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform duration-fast group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** Image-led alternative layout. */
export function ProjectGrid({ projects }: { projects: ProjectListItem[] }) {
  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
      {projects.map((project, i) => (
        <li key={project.id} className={cn("group border-t border-rule pt-5")}>
          <Link href={`/projects/${project.slug}`} className="block">
            <SiteImage
              src={project.coverImage?.url}
              alt={project.coverImage?.alt ?? ""}
              aspect="16 / 10"
              sizes="(min-width: 768px) 50vw, 100vw"
              className="border border-rule"
              placeholderLabel={project.title}
            />
            <p className="label mt-5">
              <span className="text-accent">{padIndex(i)}</span> · {PROJECT_TYPE_LABELS[project.type]}
              {project.year ? ` · ${project.year}` : ""}
            </p>
            <h3 className="mt-2 text-title-3 font-semibold transition-colors duration-fast group-hover:text-accent">{project.title}</h3>
            <p className="mt-2 line-clamp-3 text-ink-2">{project.summary}</p>
          </Link>
          <div className="mt-4">
            <TechList items={project.technologies} />
          </div>
        </li>
      ))}
    </ul>
  );
}
