import { ArrowRight, Download, Mail } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SiteImage } from "@/components/ui/site-image";
import { careerSummary } from "@/lib/career";
import type { ArticleListItem, CaseStudyListItem, ProjectListItem, SiteSettings } from "@/lib/data/public";
import type { Experience, SkillCategory } from "@/lib/types";
import { isExternalHref } from "@/lib/urls";
import { cn } from "@/lib/utils";
import type { Metric } from "@/lib/validation/common";
import type { HomeConfig, HomeSection } from "@/lib/validation/settings";
import { ArticleList, CaseStudyList, ExperienceList, SkillsGrid, visibleSkillCategories } from "./content-lists";
import { MetricGrid } from "./metrics";
import { ProjectLedger, ProjectShowcase } from "./project-list";
import { resumeHref } from "@/lib/resume";
import { SectionHeader } from "./section-header";

export type HomeData = {
  projects: ProjectListItem[];
  caseStudies: CaseStudyListItem[];
  articles: ArticleListItem[];
  experience: Experience[];
  skills: SkillCategory[];
};

/** Manually selected items in their chosen order, else featured items, else the first N. */
export function pickItems<T extends { id: string; featured: boolean }>(all: T[], section: Pick<HomeSection, "itemIds" | "limit">): T[] {
  if (section.itemIds.length) {
    return section.itemIds
      .map((id) => all.find((item) => item.id === id))
      .filter((item): item is T => Boolean(item))
      .slice(0, section.limit);
  }
  const featured = all.filter((item) => item.featured);
  return (featured.length ? featured : all).slice(0, section.limit);
}

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Distinct employers in display order (current first), e.g. for the "worked with" strip. */
export function employers(experience: Experience[]): string[] {
  return Array.from(new Set(experience.map((e) => e.organization.trim()).filter(Boolean)));
}

/** Hero numbers: the ones entered in Admin › Profile, else facts computed from published content. */
export function headlineMetrics(entered: Metric[], experience: Experience[], projects: ProjectListItem[]): Metric[] {
  if (entered.length) return entered;
  const career = careerSummary(experience);
  const shipped = projects.filter((p) => p.type === "professional").length;
  return [
    ...(career.years > 0 ? [{ value: `${career.years}+`, label: "Years in production" }] : []),
    ...(shipped > 0 ? [{ value: String(shipped), label: "Products shipped" }] : []),
    ...(career.companies > 0 ? [{ value: String(career.companies), label: "Companies" }] : []),
  ];
}

export function HomeView({ config, settings, data }: { config: HomeConfig; settings: SiteSettings; data: HomeData }) {
  const rendered: { key: string; node: React.ReactNode }[] = [];
  for (const section of config.sections) {
    if (!section.enabled) continue;
    const node = renderSection(section, settings, data);
    if (node) rendered.push({ key: section.type, node });
  }

  return (
    <>
      <Hero config={config} settings={settings} data={data} />
      <WorkedWith names={employers(data.experience)} />
      <div className="container-page mt-24 space-y-28 md:mt-32 md:space-y-36">
        {rendered.map((r) => (
          <div key={r.key}>{r.node}</div>
        ))}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------- Hero */

export function AvailabilityPill({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-rule bg-surface/60 px-3 py-1 font-mono text-[0.75rem] text-ink-2">
      <span aria-hidden className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
      </span>
      {children}
    </p>
  );
}

function Hero({ config, settings, data }: { config: HomeConfig; settings: SiteSettings; data: HomeData }) {
  const { profile } = settings;
  const { hero } = config;
  const statement = hero.statement || profile.positioning;
  const ctas = [hero.primaryCta, hero.secondaryCta].filter((c) => c.label && c.href);
  const metrics = headlineMetrics(profile.highlights, data.experience, data.projects);

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[44rem]" />
      <div className="container-page relative grid items-center gap-14 pb-20 pt-14 md:pb-28 md:pt-24 lg:grid-cols-[minmax(0,1fr)_29rem] lg:gap-16">
        <div>
          {profile.availability ? <AvailabilityPill>{profile.availability}</AvailabilityPill> : hero.eyebrow ? <p className="eyebrow">{hero.eyebrow}</p> : null}
          <h1 id="hero-title" className={cn("text-hero font-semibold", (profile.availability || hero.eyebrow) && "mt-7")}>
            {profile.name}
          </h1>
          <p className="mt-4 font-mono text-[0.9375rem] text-ink-2">
            {[profile.title, profile.location].filter(Boolean).join("  ·  ")}
          </p>
          {statement ? <p className="mt-7 max-w-2xl text-lead text-ink-2">{statement}</p> : null}
          <div className="mt-9 flex flex-wrap items-center gap-3">
            {ctas[0] ? (
              <ButtonLink href={ctas[0].href} className="h-11 px-5">
                {ctas[0].label} <ArrowRight aria-hidden className="h-4 w-4" />
              </ButtonLink>
            ) : null}
            {resumeHref(settings) ? (
              <ButtonLink href={resumeHref(settings)} variant="secondary" className="h-11 px-5">
                <Download aria-hidden className="h-4 w-4" />
                Download résumé
              </ButtonLink>
            ) : null}
            {ctas[1] ? (
              <ButtonLink href={ctas[1].href} variant="ghost" className="h-11 px-4">
                {ctas[1].label}
              </ButtonLink>
            ) : null}
          </div>
          {metrics.length ? <MetricGrid metrics={metrics} className="mt-14 max-w-2xl" /> : null}
        </div>
        <ProfileTerminal settings={settings} data={data} />
      </div>
    </section>
  );
}

/**
 * A terminal-style summary built entirely from real profile data:
 * current role, employers, primary stack and status.
 */
function ProfileTerminal({ settings, data }: { settings: SiteSettings; data: HomeData }) {
  const { profile, contact } = settings;
  const career = careerSummary(data.experience);
  // Headline tools only: three from the first category, two from the second, one from the third.
  const stack = visibleSkillCategories(data.skills, false)
    .slice(0, 3)
    .flatMap((c, i) => c.skills.slice(0, [3, 2, 1][i]).map((s) => s.name));
  const companies = employers(data.experience);

  type Line = { cmd: string; out: React.ReactNode };
  const lines = ([
    { cmd: "whoami", out: profile.name },
    ...(career.current ? [{ cmd: "cat role.txt", out: `${career.current.title} @ ${career.current.organization}` }] : []),
    ...(companies.length ? [{ cmd: "ls experience/", out: companies.join("   ") }] : []),
    ...(stack.length ? [{ cmd: "stack --primary", out: stack.join(" · ") }] : []),
    profile.availability
      ? { cmd: "status", out: <span className="text-success">● {profile.availability}</span> }
      : profile.location
        ? { cmd: "locate", out: profile.location }
        : null,
  ] as (Line | null)[]).filter((l): l is Line => l !== null);

  return (
    <aside aria-label="Profile summary" className="overflow-hidden rounded-xl border border-rule bg-surface/70 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.8)] backdrop-blur-sm">
      <div className="flex h-10 items-center gap-3 border-b border-rule px-4">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rule-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-rule-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-rule-strong" />
        </span>
        <span className="font-mono text-[0.75rem] text-ink-3">~/{profile.name.split(" ")[0].toLowerCase()}</span>
        {profile.portrait?.url ? (
          <SiteImage src={profile.portrait.url} alt="" aspect="1 / 1" sizes="28px" className="ml-auto h-7 w-7 rounded-full border border-rule" imgClassName="object-top" />
        ) : null}
      </div>
      <dl className="space-y-4 p-5 font-mono text-[0.8125rem] leading-relaxed md:p-6">
        {lines.map((line) => (
          <div key={line.cmd}>
            <dt className="text-ink-3">
              <span aria-hidden className="text-accent">$ </span>
              {line.cmd}
            </dt>
            <dd className="mt-1 text-ink">{line.out}</dd>
          </div>
        ))}
        <div aria-hidden className="text-ink-3">
          <span className="text-accent">$ </span>
          <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-ink-2 motion-reduce:animate-none" />
        </div>
      </dl>
      {contact.socials.length ? (
        <ul className="flex flex-wrap gap-x-5 gap-y-1 border-t border-rule px-5 py-3 font-mono text-[0.75rem] md:px-6">
          {contact.socials.map((s) => (
            <li key={s.url}>
              <a href={s.url} className="text-ink-3 transition-colors duration-fast hover:text-ink" {...(isExternalHref(s.url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {s.label.toLowerCase()} ↗
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}

export function WorkedWith({ names, label = "Worked with" }: { names: string[]; label?: string }) {
  if (names.length < 2) return null;
  return (
    <section aria-label={label} className="border-y border-rule bg-surface/30">
      <div className="container-page flex flex-col gap-4 py-7 md:flex-row md:items-center md:gap-12">
        <p className="eyebrow shrink-0">{label}</p>
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-3">
          {names.map((name) => (
            <li key={name} className="font-display text-lg font-semibold tracking-tight text-ink-3 transition-colors duration-fast hover:text-ink">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Sections */

function renderSection(section: HomeSection, settings: SiteSettings, data: HomeData): React.ReactNode {
  const cta = section.cta.label && section.cta.href ? section.cta : null;
  const headingId = `home-${section.type}`;

  switch (section.type) {
    case "intro": {
      const parts = paragraphs(section.intro);
      if (!parts.length) return null;
      return (
        <section aria-labelledby={headingId} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <div>
            <p className="eyebrow">{section.eyebrow || "About"}</p>
            <h2 id={headingId} className="mt-4 text-title-2 font-semibold">
              {section.heading || "Introduction"}
            </h2>
          </div>
          <div>
            <div className="space-y-5">
              {parts.map((p, i) => (
                <p key={i} className={i === 0 ? "text-title-3 font-medium leading-snug text-ink" : "max-w-prose text-[1.0625rem] text-ink-2"}>
                  {p}
                </p>
              ))}
            </div>
            {cta ? (
              <ButtonLink href={cta.href} variant="link" className="mt-6 text-[0.9375rem]">
                {cta.label} <span aria-hidden>→</span>
              </ButtonLink>
            ) : null}
          </div>
        </section>
      );
    }

    case "projects": {
      const items = pickItems(data.projects, section);
      if (!items.length) return null;
      // The first projects carry the page as full case-study rows; any extras follow as a compact list.
      const showcase = items.slice(0, 3);
      const rest = items.slice(3);
      return (
        <section aria-labelledby={headingId}>
          <SectionHeader label={section.eyebrow || "Work"} heading={section.heading || "Selected work"} intro={section.intro} id={headingId} cta={cta} />
          <div className="mt-12 space-y-6">
            <ProjectShowcase projects={showcase} />
            {rest.length ? <ProjectLedger projects={rest} /> : null}
          </div>
        </section>
      );
    }

    case "focus": {
      const categories = visibleSkillCategories(data.skills, settings.appearance.showLearningSkills);
      if (!categories.length) return null;
      return (
        <section aria-labelledby={headingId}>
          <SectionHeader label={section.eyebrow || "Stack"} heading={section.heading || "Technical focus"} intro={section.intro} id={headingId} cta={cta} />
          <div className="mt-12">
            <SkillsGrid categories={categories} />
          </div>
        </section>
      );
    }

    case "experience": {
      const entries = data.experience.slice(0, section.limit);
      if (!entries.length) return null;
      return (
        <section aria-labelledby={headingId}>
          <SectionHeader label={section.eyebrow || "Career"} heading={section.heading || "Experience"} intro={section.intro} id={headingId} cta={cta} />
          <div className="mt-12">
            <ExperienceList entries={entries} />
          </div>
        </section>
      );
    }

    case "case_studies": {
      if (!settings.appearance.caseStudiesEnabled) return null;
      const items = pickItems(data.caseStudies, section);
      if (!items.length) return null;
      return (
        <section aria-labelledby={headingId}>
          <SectionHeader label={section.eyebrow || "Engineering"} heading={section.heading || "Case studies"} intro={section.intro} id={headingId} cta={cta} />
          <div className="mt-12">
            <CaseStudyList items={items} />
          </div>
        </section>
      );
    }

    case "writing": {
      if (!settings.appearance.writingEnabled) return null;
      const items = pickItems(data.articles, section);
      if (!items.length) return null;
      return (
        <section aria-labelledby={headingId}>
          <SectionHeader label={section.eyebrow || "Writing"} heading={section.heading || "Engineering notes"} intro={section.intro} id={headingId} cta={cta} />
          <div className="mt-12">
            <ArticleList items={items} />
          </div>
        </section>
      );
    }

    case "contact":
      return <ContactBand section={section} settings={settings} headingId={headingId} />;

    default:
      return null;
  }
}

function ContactBand({ section, settings, headingId }: { section: HomeSection; settings: SiteSettings; headingId: string }) {
  const { contact } = settings;
  const cta = section.cta.label && section.cta.href ? section.cta : contact.formEnabled ? { label: "Send a message", href: "/contact" } : null;
  return (
    <section aria-labelledby={headingId} className="card relative overflow-hidden px-6 py-16 text-center md:px-12 md:py-20">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_100%,black,transparent)]" />
      <div className="relative">
        <p className="eyebrow">{section.eyebrow || "Contact"}</p>
        <h2 id={headingId} className="mx-auto mt-5 max-w-3xl text-title-1 font-semibold">
          {section.heading || "Get in touch"}
        </h2>
        {section.intro ? <p className="mx-auto mt-5 max-w-2xl text-lead text-ink-2">{section.intro}</p> : null}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {cta ? (
            <ButtonLink href={cta.href} className="h-11 px-5">
              {cta.label} <ArrowRight aria-hidden className="h-4 w-4" />
            </ButtonLink>
          ) : null}
          {contact.email ? (
            <ButtonLink href={`mailto:${contact.email}`} variant="secondary" className="h-11 px-5">
              <Mail aria-hidden className="h-4 w-4" />
              {contact.email}
            </ButtonLink>
          ) : null}
          {resumeHref(settings) ? (
            <ButtonLink href={resumeHref(settings)} variant="ghost" className="h-11 px-4">
              <Download aria-hidden className="h-4 w-4" />
              Résumé
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
