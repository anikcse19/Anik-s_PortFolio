import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ArticleListItem, CaseStudyListItem } from "@/lib/data/public";
import { employmentPeriod, formatDate } from "@/lib/dates";
import type { Experience, SkillCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CASE_STUDY_KIND_LABELS, CASE_STUDY_TOPIC_LABELS, EMPLOYMENT_TYPE_LABELS, SKILL_LEVEL_LABELS, SKILL_LEVELS } from "@/lib/validation/content";
import { ChipList } from "./project-list";

/* ---------------------------------------------------------------- Experience */

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Vertical timeline: dates on the left, role details on the right. */
export function ExperienceList({ entries, detailed = false }: { entries: Experience[]; detailed?: boolean }) {
  return (
    <ol>
      {entries.map((entry, i) => {
        const period = employmentPeriod(entry);
        const meta = [entry.employmentType ? EMPLOYMENT_TYPE_LABELS[entry.employmentType] : "", entry.location, entry.workMode ? capitalize(entry.workMode) : ""].filter(Boolean);
        const last = i === entries.length - 1;
        return (
          <li key={entry.id} className="grid gap-x-8 gap-y-2 md:grid-cols-[11rem_1fr]">
            <div className="md:pt-0.5 md:text-right">
              {period.range ? <p className="font-mono text-[0.8125rem] text-ink">{period.range}</p> : null}
              {period.duration ? <p className="meta mt-0.5">{period.duration}</p> : null}
            </div>
            <div className={cn("relative border-l border-rule pl-7", !last && "pb-10")}>
              <span
                aria-hidden
                className={cn("absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full ring-4 ring-paper", entry.isCurrent ? "bg-accent" : "bg-rule-strong")}
              />
              <h3 className="text-lg font-semibold tracking-tight">{entry.title}</h3>
              <p className="mt-0.5 text-ink-2">
                {entry.organizationUrl ? (
                  <a href={entry.organizationUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline decoration-rule-strong underline-offset-4 hover:decoration-ink">
                    {entry.organization}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <span className="font-medium text-ink">{entry.organization}</span>
                )}
                {meta.length ? <span className="text-ink-3"> · {meta.join(" · ")}</span> : null}
              </p>
              {entry.summary ? <p className="mt-3 max-w-prose text-ink-2">{entry.summary}</p> : null}
              {detailed && entry.achievements.length ? (
                <ul className="prose-journal mt-4">
                  {entry.achievements.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              ) : null}
              <ChipList items={entry.technologies} max={detailed ? 30 : 6} label="Technologies used" className="mt-4" />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* -------------------------------------------------------------------- Skills */

const LEVEL_DOT: Record<(typeof SKILL_LEVELS)[number], string> = {
  production: "bg-accent",
  hands_on: "bg-ink-3",
  learning: "border border-ink-3 bg-transparent",
};

export function SkillLegend({ categories }: { categories: SkillCategory[] }) {
  const used = new Set(categories.flatMap((c) => c.skills.map((s) => s.level)).filter(Boolean));
  if (used.size < 2) return null;
  return (
    <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-3" aria-label="Skill legend">
      {SKILL_LEVELS.filter((l) => used.has(l)).map((level) => (
        <div key={level} className="flex items-center gap-2">
          <dt>
            <span aria-hidden className={cn("block h-2 w-2 rounded-full", LEVEL_DOT[level])} />
            <span className="sr-only">Marker</span>
          </dt>
          <dd>{SKILL_LEVEL_LABELS[level]}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Removes skills marked "learning" (unless the site shows them) and any
 * category left empty, so public skill lists lead with production work.
 */
export function visibleSkillCategories(categories: SkillCategory[], showLearning: boolean): SkillCategory[] {
  if (showLearning) return categories;
  return categories
    .map((c) => ({ ...c, skills: c.skills.filter((s) => s.level !== "learning") }))
    .filter((c) => c.skills.length > 0);
}

/** Compact stack table: one row per category, skills as chips. */
export function SkillsGrid({ categories }: { categories: SkillCategory[] }) {
  return (
    <div className="card divide-y divide-rule">
      {categories.map((category) => (
        <section key={category.id} aria-labelledby={`skill-cat-${category.id}`} className="grid gap-3 px-5 py-5 md:grid-cols-[17rem_minmax(0,1fr)] md:gap-8 md:px-7">
          <div>
            <h3 id={`skill-cat-${category.id}`} className="font-medium text-ink">
              {category.name}
            </h3>
            {category.description ? <p className="mt-1 text-sm text-ink-3">{category.description}</p> : null}
          </div>
          <ul className="flex flex-wrap content-start gap-1.5">
            {category.skills.map((skill) => (
              <li key={skill.name} className="chip" title={[skill.level ? SKILL_LEVEL_LABELS[skill.level] : "", skill.note].filter(Boolean).join(" — ") || undefined}>
                {skill.level ? <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", LEVEL_DOT[skill.level])} /> : null}
                {skill.name}
                {skill.level ? <span className="sr-only"> — {SKILL_LEVEL_LABELS[skill.level]}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------- Case studies */

export function CaseStudyList({ items }: { items: CaseStudyListItem[] }) {
  return (
    <ul className={cn("grid grid-cols-1 gap-5", items.length > 1 && "md:grid-cols-2", items.length % 3 === 0 && "lg:grid-cols-3")}>
      {items.map((item) => (
        <li key={item.id}>
          <article className="card card-link group relative flex h-full flex-col p-6">
            <p className="meta">
              <span className="font-medium text-accent">{CASE_STUDY_KIND_LABELS[item.kind]}</span>
              {item.context ? ` · ${item.context}` : ""}
            </p>
            <h3 className="mt-2 text-title-3 font-semibold">
              <Link href={`/case-studies/${item.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-hover:text-accent">
                {item.title}
              </Link>
            </h3>
            <p className="mt-3 line-clamp-4 text-ink-2">{item.summary}</p>
            {item.topics.length ? (
              <ChipList
                items={item.topics.map((t) => CASE_STUDY_TOPIC_LABELS[t as keyof typeof CASE_STUDY_TOPIC_LABELS] ?? t)}
                max={4}
                label="Topics covered"
                className="mt-auto pt-6"
              />
            ) : null}
          </article>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ Articles */

export function ArticleList({ items }: { items: ArticleListItem[] }) {
  return (
    <ul className="card divide-y divide-rule overflow-hidden">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={`/writing/${item.slug}`} className="group flex items-start gap-6 p-5 transition-colors duration-fast hover:bg-surface md:p-6">
            <div className="min-w-0 flex-1">
              <p className="meta">
                <time dateTime={item.publishedAt ?? undefined}>{formatDate(item.publishedAt, "short")}</time> · {item.readingMinutes} min read
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight transition-colors duration-fast group-hover:text-accent">{item.title}</h3>
              <p className="mt-1.5 line-clamp-2 text-[0.9375rem] text-ink-2">{item.excerpt}</p>
            </div>
            <ArrowUpRight aria-hidden className="mt-1 h-5 w-5 shrink-0 text-ink-3 transition-transform duration-fast group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
