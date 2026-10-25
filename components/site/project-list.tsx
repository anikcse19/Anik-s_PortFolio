import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SiteImage } from "@/components/ui/site-image";
import type { ProjectListItem } from "@/lib/data/public";
import { cn } from "@/lib/utils";
import { PROJECT_TYPE_LABELS } from "@/lib/validation/content";
import { BrowserFrame } from "./browser-frame";
import { MetricGrid } from "./metrics";

export function ChipList({ items, max = 4, label = "Technologies", className }: { items: string[]; max?: number; label?: string; className?: string }) {
  if (!items.length) return null;
  const shown = items.slice(0, max);
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label={label}>
      {shown.map((t) => (
        <li key={t} className="chip">
          {t}
        </li>
      ))}
      {items.length > max ? <li className="chip border-transparent bg-transparent text-ink-3">+{items.length - max}</li> : null}
    </ul>
  );
}

function projectMeta(project: ProjectListItem, showType = true): string {
  return [showType ? PROJECT_TYPE_LABELS[project.type] : "", project.category, project.year].filter(Boolean).join(" · ");
}

/** Documents saved before impact numbers existed have no `impact` field. */
export function impactOf(project: { impact?: ProjectListItem["impact"] }): ProjectListItem["impact"] {
  return project.impact ?? [];
}

type CardOptions = { basePath?: string; showType?: boolean };

/**
 * Case-study row: framed screenshot on one side, story and impact on the other.
 * Used for the projects that should carry the page.
 */
export function ProjectShowcase({ projects, basePath = "/projects", showType = true }: { projects: ProjectListItem[] } & CardOptions) {
  return (
    <ol className="space-y-6">
      {projects.map((project, i) => {
        const href = `${basePath}/${project.slug}`;
        const flip = i % 2 === 1;
        return (
          <li key={project.id}>
            <article className="card group relative grid items-center gap-8 overflow-hidden p-5 md:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
              <div className={cn(flip && "lg:order-2")}>
                <BrowserFrame
                  src={project.coverImage?.url}
                  alt={project.coverImage?.alt ?? ""}
                  url={project.liveUrl}
                  sizes="(min-width: 1024px) 560px, 100vw"
                  priority={i === 0}
                  placeholderLabel={project.title}
                  className="transition-transform duration-500 ease-out group-hover:-translate-y-1"
                />
              </div>
              <div>
                <p className="meta">{projectMeta(project, showType)}</p>
                <h3 className="mt-3 text-title-2 font-semibold">
                  <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                    {project.title}
                  </Link>
                </h3>
                <p className="mt-4 text-[1.0625rem] text-ink-2">{project.summary}</p>
                {impactOf(project).length ? <MetricGrid metrics={impactOf(project)} size="sm" className="mt-7 border-y border-rule py-5" /> : null}
                {project.role ? (
                  <p className="mt-5 text-[0.9375rem] text-ink-2">
                    <span className="meta mr-2">Role</span>
                    {project.role}
                  </p>
                ) : null}
                <ChipList items={project.technologies} max={6} className="mt-6" />
                <p className="mt-8 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink">
                  Read case study
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-1" />
                </p>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

/** Uniform project card for grids. */
export function ProjectCard({ project, priority = false, basePath = "/projects", showType = true }: { project: ProjectListItem; priority?: boolean } & CardOptions) {
  const href = `${basePath}/${project.slug}`;
  return (
    <article className="card card-link group relative flex h-full flex-col p-4">
      <BrowserFrame src={project.coverImage?.url} alt={project.coverImage?.alt ?? ""} url={project.liveUrl} sizes="(min-width: 768px) 50vw, 100vw" priority={priority} placeholderLabel={project.title} />
      <div className="flex flex-1 flex-col px-2 pb-2 pt-6">
        <p className="meta">{projectMeta(project, showType)}</p>
        <h3 className="mt-2 text-title-3 font-semibold">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {project.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 text-ink-2">{project.summary}</p>
        {impactOf(project).length ? <MetricGrid metrics={impactOf(project).slice(0, 3)} size="sm" className="mt-5 border-t border-rule pt-4" /> : null}
        <div className="mt-auto pt-6">
          <ChipList items={project.technologies} max={4} />
        </div>
      </div>
    </article>
  );
}

export function ProjectGrid({ projects, ...options }: { projects: ProjectListItem[] } & CardOptions) {
  return (
    <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {projects.map((project, i) => (
        <li key={project.id}>
          <ProjectCard project={project} priority={i < 2} {...options} />
        </li>
      ))}
    </ul>
  );
}

/** Compact list with thumbnails, for scanning many projects. */
export function ProjectLedger({ projects, basePath = "/projects", showType = true }: { projects: ProjectListItem[] } & CardOptions) {
  return (
    <ul className="card divide-y divide-rule overflow-hidden">
      {projects.map((project) => (
        <li key={project.id}>
          <Link href={`${basePath}/${project.slug}`} className="group flex gap-5 p-4 transition-colors duration-fast hover:bg-surface sm:p-5">
            <SiteImage
              src={project.coverImage?.url}
              alt=""
              aspect="16 / 10"
              sizes="176px"
              className="hidden w-44 shrink-0 rounded-md border border-rule sm:block"
              imgClassName="object-top"
              placeholderLabel=" "
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="meta">{projectMeta(project, showType)}</p>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight">{project.title}</h3>
                </div>
                <ArrowUpRight aria-hidden className="mt-1 h-5 w-5 shrink-0 text-ink-3 transition-transform duration-fast group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
              </div>
              <p className="mt-1.5 line-clamp-2 text-[0.9375rem] text-ink-2">{project.summary}</p>
              {impactOf(project).length ? (
                <p className="mt-2 text-sm text-ink-2">
                  {impactOf(project).map((m) => (
                    <span key={m.label} className="mr-4">
                      <span className="metric-value">{m.value}</span> <span className="text-ink-3">{m.label}</span>
                    </span>
                  ))}
                </p>
              ) : null}
              <ChipList items={project.technologies} max={5} className="mt-3" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
