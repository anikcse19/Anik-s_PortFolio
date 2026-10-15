import Link from "next/link";
import type { ArticleListItem, CaseStudyListItem } from "@/lib/data/public";
import { employmentPeriod, formatDate } from "@/lib/dates";
import type { Experience, SkillCategory } from "@/lib/types";
import { padIndex } from "@/lib/utils";
import {
  CASE_STUDY_KIND_LABELS,
  CASE_STUDY_TOPIC_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  SKILL_LEVEL_LABELS,
  SKILL_LEVEL_SHORT,
  SKILL_LEVELS,
} from "@/lib/validation/content";

/* ---------------------------------------------------------------- Experience */

export function ExperienceList({ entries, detailed = false }: { entries: Experience[]; detailed?: boolean }) {
  return (
    <ol className="border-b border-rule">
      {entries.map((entry) => {
        const period = employmentPeriod(entry);
        return (
          <li key={entry.id} className="grid-page gap-y-3 border-t border-rule py-7">
            <div className="col-span-4 md:col-span-2 lg:col-span-3">
              {period.range ? <p className="font-mono text-sm text-ink">{period.range}</p> : null}
              {period.duration ? <p className="mt-1 font-mono text-xs text-ink-3">{period.duration}</p> : null}
              {entry.isCurrent ? (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                  Current role
                </p>
              ) : null}
            </div>
            <div className="col-span-4 md:col-span-6 lg:col-span-9">
              <h3 className="text-title-3 font-semibold">
                {entry.title}
                <span className="text-ink-3"> · </span>
                {entry.organizationUrl ? (
                  <a href={entry.organizationUrl} target="_blank" rel="noopener noreferrer" className="link">
                    {entry.organization}
                  </a>
                ) : (
                  entry.organization
                )}
              </h3>
              {[entry.employmentType ? EMPLOYMENT_TYPE_LABELS[entry.employmentType] : "", entry.location, entry.workMode ? capitalize(entry.workMode) : ""]
                .filter(Boolean)
                .length ? (
                <p className="mt-1 text-sm text-ink-3">
                  {[entry.employmentType ? EMPLOYMENT_TYPE_LABELS[entry.employmentType] : "", entry.location, entry.workMode ? capitalize(entry.workMode) : ""]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
              {entry.summary ? <p className="mt-4 max-w-prose text-ink-2">{entry.summary}</p> : null}
              {detailed && entry.achievements.length ? (
                <ul className="prose-journal mt-4">
                  {entry.achievements.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              ) : null}
              {entry.technologies.length ? (
                <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies used">
                  {entry.technologies.slice(0, detailed ? 30 : 6).map((t) => (
                    <li key={t} className="tag">
                      {t}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* -------------------------------------------------------------------- Skills */

export function SkillLegend({ categories }: { categories: SkillCategory[] }) {
  const used = new Set(categories.flatMap((c) => c.skills.map((s) => s.level)).filter(Boolean));
  if (!used.size) return null;
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-3" aria-label="Skill label legend">
      {SKILL_LEVELS.filter((l) => used.has(l)).map((level) => (
        <div key={level} className="flex items-center gap-2">
          <dt className="tag">{SKILL_LEVEL_SHORT[level]}</dt>
          <dd>{SKILL_LEVEL_LABELS[level]}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SkillsGrid({ categories }: { categories: SkillCategory[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, i) => (
        <section key={category.id} aria-labelledby={`skill-cat-${category.id}`} className="border-t border-rule pb-10 pt-6">
          <p className="font-mono text-xs text-ink-3">{padIndex(i)}</p>
          <h3 id={`skill-cat-${category.id}`} className="mt-2 text-lg font-semibold">
            {category.name}
          </h3>
          {category.description ? <p className="mt-2 text-[0.9375rem] text-ink-2">{category.description}</p> : null}
          <ul className="mt-5 space-y-2">
            {category.skills.map((skill) => (
              <li key={skill.name} className="flex items-baseline justify-between gap-4 border-b border-dotted border-rule pb-2 text-[0.9375rem]">
                <span className="text-ink" title={skill.note || undefined}>
                  {skill.name}
                </span>
                {skill.level ? (
                  <span className="tag shrink-0" title={SKILL_LEVEL_LABELS[skill.level]}>
                    {SKILL_LEVEL_SHORT[skill.level]}
                    <span className="sr-only"> — {SKILL_LEVEL_LABELS[skill.level]}</span>
                  </span>
                ) : null}
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
    <ol className="border-b border-rule">
      {items.map((item, i) => (
        <li key={item.id} className="border-t border-rule">
          <Link href={`/case-studies/${item.slug}`} className="group grid-page gap-y-3 py-8 transition-colors duration-fast hover:bg-surface/60">
            <div className="col-span-4 md:col-span-2 lg:col-span-3">
              <p className="label">
                <span className="text-accent">{padIndex(i)}</span> · {CASE_STUDY_KIND_LABELS[item.kind]}
              </p>
              {item.context ? <p className="mt-2 text-sm text-ink-3">{item.context}</p> : null}
            </div>
            <div className="col-span-4 md:col-span-6 lg:col-span-9">
              <h3 className="text-title-2 font-semibold transition-colors duration-fast group-hover:text-accent">{item.title}</h3>
              <p className="mt-3 max-w-prose text-ink-2">{item.summary}</p>
              {item.topics.length ? (
                <p className="mt-4 text-sm text-ink-3">
                  <span className="sr-only">Covers: </span>
                  {item.topics.map((t) => CASE_STUDY_TOPIC_LABELS[t as keyof typeof CASE_STUDY_TOPIC_LABELS] ?? t).join(" · ")}
                </p>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ Articles */

export function ArticleList({ items }: { items: ArticleListItem[] }) {
  return (
    <ol className="border-b border-rule">
      {items.map((item) => (
        <li key={item.id} className="border-t border-rule">
          <Link href={`/writing/${item.slug}`} className="group grid-page gap-y-2 py-6 transition-colors duration-fast hover:bg-surface/60">
            <p className="col-span-4 font-mono text-sm text-ink-3 md:col-span-2 lg:col-span-3">
              <time dateTime={item.publishedAt ?? undefined}>{formatDate(item.publishedAt, "short")}</time>
            </p>
            <div className="col-span-4 md:col-span-5 lg:col-span-7">
              <h3 className="text-title-3 font-semibold transition-colors duration-fast group-hover:text-accent">{item.title}</h3>
              <p className="mt-2 line-clamp-2 text-ink-2">{item.excerpt}</p>
            </div>
            <p className="col-span-4 text-sm text-ink-3 md:col-span-1 md:text-right lg:col-span-2">{item.readingMinutes} min read</p>
          </Link>
        </li>
      ))}
    </ol>
  );
}
