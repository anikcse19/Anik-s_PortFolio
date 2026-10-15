import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import type { ArticleListItem, CaseStudyListItem, ProjectListItem, SiteSettings } from "@/lib/data/public";
import type { Experience, SkillCategory } from "@/lib/types";
import { isExternalHref } from "@/lib/urls";
import { padIndex } from "@/lib/utils";
import type { HomeConfig, HomeSection } from "@/lib/validation/settings";
import { ArticleList, CaseStudyList, ExperienceList, SkillLegend, SkillsGrid } from "./content-lists";
import { ProjectGrid, ProjectLead, ProjectLedger } from "./project-list";
import { SectionHeader } from "./section-header";

export type HomeData = {
  projects: ProjectListItem[];
  caseStudies: CaseStudyListItem[];
  articles: ArticleListItem[];
  experience: Experience[];
  skills: SkillCategory[];
};

/** Manually selected items in their chosen order, else featured items, else the first N. */
export function pickItems<T extends { id: string; featured: boolean }>(all: T[], section: HomeSection): T[] {
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

export function HomeView({ config, settings, data }: { config: HomeConfig; settings: SiteSettings; data: HomeData }) {
  const rendered: { key: string; node: React.ReactNode }[] = [];
  for (const section of config.sections) {
    if (!section.enabled) continue;
    const index = padIndex(rendered.length);
    const node = renderSection(section, index, settings, data);
    if (node) rendered.push({ key: section.type, node });
  }

  return (
    <>
      <Hero config={config} settings={settings} data={data} />
      <div className="container-page space-y-24 md:space-y-32">
        {rendered.map((r) => (
          <div key={r.key}>{r.node}</div>
        ))}
      </div>
    </>
  );
}

function Hero({ config, settings, data }: { config: HomeConfig; settings: SiteSettings; data: HomeData }) {
  const { profile } = settings;
  const { hero } = config;
  const statement = hero.statement || profile.positioning;
  const focus = data.skills.slice(0, 3).map((c) => c.name);
  const facts: { term: string; value: string }[] = [
    { term: "Role", value: profile.title },
    ...(profile.location ? [{ term: "Based in", value: profile.location }] : []),
    ...(focus.length ? [{ term: "Focus", value: focus.join(", ") }] : []),
    ...(profile.availability ? [{ term: "Availability", value: profile.availability }] : []),
  ];
  const ctas = [hero.primaryCta, hero.secondaryCta].filter((c) => c.label && c.href);
  const nameParts = profile.name.split(" ");
  const lastWord = nameParts.pop();

  return (
    <section aria-labelledby="hero-title" className="container-page pb-20 pt-8 md:pb-28 md:pt-12">
      <div className="label flex items-center justify-between border-b border-rule pb-3">
        <span>{hero.eyebrow || "Portfolio"}</span>
        <span className="hidden sm:inline">{profile.title}</span>
      </div>

      {hero.variant === "statement" ? (
        <div className="grid-page mt-12 gap-y-10 md:mt-16">
          <div className="col-span-4 md:col-span-8 lg:col-span-10">
            <h1 id="hero-title" className="text-lead font-medium text-ink-2">
              {profile.name}
              <span className="text-ink-3"> — {profile.title}</span>
            </h1>
            <p className="mt-6 font-display text-title-1 font-semibold text-ink">{statement}</p>
          </div>
          <HeroActions ctas={ctas} resumeUrl={profile.resumeUrl} className="col-span-4 md:col-span-8" />
          {hero.showFacts ? <HeroFacts facts={facts} className="col-span-4 md:col-span-8 lg:col-span-12 lg:grid-cols-4" /> : null}
        </div>
      ) : (
        <div className="grid-page mt-10 gap-y-12 md:mt-14">
          <h1 id="hero-title" className="col-span-4 text-display font-semibold md:col-span-8 lg:col-span-11">
            {nameParts.join(" ")} <span className="text-ink-3">{lastWord}</span>
          </h1>
          <div className="col-span-4 md:col-span-5 lg:col-span-6">
            <p className="text-lead text-ink-2">{statement}</p>
            <HeroActions ctas={ctas} resumeUrl={profile.resumeUrl} className="mt-8" />
          </div>
          {hero.showFacts ? <HeroFacts facts={facts} className="col-span-4 md:col-span-3 lg:col-span-4 lg:col-start-9" /> : null}
        </div>
      )}
    </section>
  );
}

function HeroActions({
  ctas,
  resumeUrl,
  className,
}: {
  ctas: { label: string; href: string }[];
  resumeUrl: string;
  className?: string;
}) {
  if (!ctas.length && !resumeUrl) return null;
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-4 ${className ?? ""}`}>
      {ctas.map((cta, i) => (
        <ButtonLink key={cta.href + cta.label} href={cta.href} variant={i === 0 ? "primary" : "secondary"}>
          {cta.label}
          {i === 0 ? <span aria-hidden>→</span> : null}
        </ButtonLink>
      ))}
      {resumeUrl ? (
        <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="link ml-2 inline-flex items-center gap-1 text-[0.9375rem] text-ink">
          Résumé <ArrowUpRight aria-hidden className="h-4 w-4" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ) : null}
    </div>
  );
}

function HeroFacts({ facts, className }: { facts: { term: string; value: string }[]; className?: string }) {
  return (
    <dl className={`grid grid-cols-1 gap-px self-end border-y border-rule ${className ?? ""}`}>
      {facts.map((fact) => (
        <div key={fact.term} className="grid grid-cols-[7.5rem_1fr] items-baseline gap-4 border-b border-rule py-3 last:border-b-0 lg:grid-cols-[6.5rem_1fr]">
          <dt className="label">{fact.term}</dt>
          <dd className="text-[0.9375rem] text-ink">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function renderSection(section: HomeSection, index: string, settings: SiteSettings, data: HomeData): React.ReactNode {
  const cta = section.cta.label && section.cta.href ? section.cta : null;
  const headingId = `home-${section.type}`;

  switch (section.type) {
    case "intro": {
      const parts = paragraphs(section.intro);
      if (!parts.length) return null;
      return (
        <section aria-labelledby={headingId} className="grid-page gap-y-4 border-t border-rule pt-5">
          <p className="label col-span-4 md:col-span-2 lg:col-span-3">
            <span className="text-accent">{index}</span> — {section.eyebrow || "Introduction"}
          </p>
          <div className="col-span-4 md:col-span-6 lg:col-span-8">
            <h2 id={headingId} className={section.heading ? "text-title-3 font-semibold text-ink-3" : "sr-only"}>
              {section.heading || "Introduction"}
            </h2>
            <div className="mt-5 space-y-5">
              {parts.map((p, i) => (
                <p key={i} className={i === 0 ? "font-display text-title-3 font-medium leading-snug text-ink md:text-[1.75rem]" : "max-w-prose text-lead text-ink-2"}>
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
      const [lead, ...rest] = items;
      const useLead = section.layout === "ledger" && Boolean(lead.coverImage?.url);
      return (
        <section aria-labelledby={headingId}>
          <SectionHeader index={index} label={section.eyebrow || "Work"} heading={section.heading || "Selected work"} intro={section.intro} id={headingId} cta={cta} />
          <div className="mt-10">
            {section.layout === "grid" ? (
              <ProjectGrid projects={items} />
            ) : useLead ? (
              <>
                <ProjectLead project={lead} />
                {rest.length ? <ProjectLedger projects={rest} startIndex={1} /> : null}
              </>
            ) : (
              <ProjectLedger projects={items} />
            )}
          </div>
        </section>
      );
    }

    case "focus": {
      if (!data.skills.length) return null;
      return (
        <section aria-labelledby={headingId}>
          <SectionHeader index={index} label={section.eyebrow || "Capabilities"} heading={section.heading || "Technical focus"} intro={section.intro} id={headingId} cta={cta}>
            <div className="mt-6">
              <SkillLegend categories={data.skills} />
            </div>
          </SectionHeader>
          <div className="mt-10">
            <SkillsGrid categories={data.skills.slice(0, section.limit > 3 ? section.limit : 6)} />
          </div>
        </section>
      );
    }

    case "experience": {
      const entries = data.experience.slice(0, section.limit);
      if (!entries.length) return null;
      return (
        <section aria-labelledby={headingId}>
          <SectionHeader index={index} label={section.eyebrow || "Career"} heading={section.heading || "Experience"} intro={section.intro} id={headingId} cta={cta} />
          <div className="mt-10">
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
          <SectionHeader index={index} label={section.eyebrow || "Engineering"} heading={section.heading || "Case studies"} intro={section.intro} id={headingId} cta={cta} />
          <div className="mt-10">
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
          <SectionHeader index={index} label={section.eyebrow || "Notes"} heading={section.heading || "Engineering notes"} intro={section.intro} id={headingId} cta={cta} />
          <div className="mt-10">
            <ArticleList items={items} />
          </div>
        </section>
      );
    }

    case "contact":
      return <ContactBand section={section} index={index} settings={settings} headingId={headingId} />;

    default:
      return null;
  }
}

function ContactBand({ section, index, settings, headingId }: { section: HomeSection; index: string; settings: SiteSettings; headingId: string }) {
  const { contact, profile } = settings;
  const cta = section.cta.label && section.cta.href ? section.cta : contact.formEnabled ? { label: "Send a message", href: "/contact" } : null;
  return (
    <section aria-labelledby={headingId} className="grid-page gap-y-8 border-t border-rule pt-5">
      <p className="label col-span-4 md:col-span-2 lg:col-span-3">
        <span className="text-accent">{index}</span> — {section.eyebrow || "Contact"}
      </p>
      <div className="col-span-4 md:col-span-6 lg:col-span-9">
        <h2 id={headingId} className="text-title-1 font-semibold">
          {section.heading || "Get in touch"}
        </h2>
        {section.intro ? <p className="mt-5 max-w-prose text-lead text-ink-2">{section.intro}</p> : null}
        {contact.email ? (
          <p className="mt-8">
            <a href={`mailto:${contact.email}`} className="link break-all font-display text-title-3 font-medium text-ink">
              {contact.email}
            </a>
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-4">
          {cta ? (
            <ButtonLink href={cta.href}>
              {cta.label} <span aria-hidden>→</span>
            </ButtonLink>
          ) : null}
          {profile.resumeUrl ? (
            <ButtonLink href={profile.resumeUrl} variant="secondary">
              Résumé
            </ButtonLink>
          ) : null}
        </div>
        {contact.socials.length ? (
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-rule pt-5 text-[0.9375rem]">
            {contact.socials.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  className="link inline-flex items-center gap-1 text-ink-2"
                  {...(isExternalHref(s.url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {s.label}
                  <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
