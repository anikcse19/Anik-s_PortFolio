import { AppWindow, ArrowRight, Check, Clock, FileSignature, Gauge, Layers, Mail, MessagesSquare, Minus, Plug, ShoppingBag, UserRoundCog, Wallet, type LucideIcon } from "lucide-react";
import { AvailabilityPill, employers, headlineMetrics, WorkedWith } from "@/components/site/home-view";
import { MetricGrid } from "@/components/site/metrics";
import { ProjectShowcase } from "@/components/site/project-list";
import { SectionHeader } from "@/components/site/section-header";
import { ButtonLink } from "@/components/ui/button";
import { SiteImage } from "@/components/ui/site-image";
import { careerSummary } from "@/lib/career";
import type { ProjectListItem, SiteSettings } from "@/lib/data/public";
import { STUDIO_ROUTES, studioEmail, studioProjects } from "@/lib/studio";
import type { Experience } from "@/lib/types";
import { cn } from "@/lib/utils";

const SERVICE_ICONS: LucideIcon[] = [AppWindow, Layers, ShoppingBag, Plug, Gauge, UserRoundCog];
const REMOTE_ICONS: LucideIcon[] = [Clock, MessagesSquare, FileSignature, Wallet];

export function StudioHome({ settings, projects, experience }: { settings: SiteSettings; projects: ProjectListItem[]; experience: Experience[] }) {
  const { studio } = settings;
  const work = studioProjects(settings, projects, 4);
  const metrics = headlineMetrics(studio.metrics, experience, projects);

  return (
    <>
      <Hero settings={settings} />
      <WorkedWith names={employers(experience)} label="Experience across" />
      <div className="container-page mt-24 space-y-28 md:mt-32 md:space-y-36">
        {metrics.length ? (
          <section aria-label="Track record" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-end lg:gap-16">
            <div>
              <p className="eyebrow">Track record</p>
              <p className="mt-4 text-title-3 font-medium text-ink">Production software, shipped and supported for real businesses.</p>
            </div>
            <MetricGrid metrics={metrics} />
          </section>
        ) : null}
        {studio.services.length ? <Services settings={settings} /> : null}
        {work.length ? (
          <section aria-labelledby="studio-work">
            <SectionHeader
              id="studio-work"
              label="Case studies"
              heading={studio.workHeading || "Case studies"}
              intro="Platforms designed, built and shipped for real businesses: what they needed, how it was built, and the stack behind it."
              cta={projects.length > work.length ? { label: "All case studies", href: STUDIO_ROUTES.work } : null}
            />
            <div className="mt-12">
              <ProjectShowcase projects={work} basePath={STUDIO_ROUTES.work} showType={false} />
            </div>
          </section>
        ) : null}
        <WhyMe settings={settings} />
        {studio.process.length ? <Process settings={settings} /> : null}
        {studio.engagements.length ? <Engagements settings={settings} /> : null}
        {studio.remote.length ? <Remote settings={settings} /> : null}
        <WhoYouWorkWith settings={settings} experience={experience} />
        {studio.faqs.length ? <Faq settings={settings} /> : null}
        <FinalCta settings={settings} />
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------- Hero */

function Hero({ settings }: { settings: SiteSettings }) {
  const { studio } = settings;
  return (
    <section aria-labelledby="studio-hero" className="relative overflow-hidden">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[44rem]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 opacity-50"
        style={{ background: "radial-gradient(closest-side, rgb(var(--accent) / 0.12), transparent)" }}
      />
      <div className="container-page relative grid items-center gap-14 pb-20 pt-14 md:pb-28 md:pt-24 lg:grid-cols-[minmax(0,1fr)_27rem] lg:gap-16">
        <div>
          {studio.availability || studio.eyebrow ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {studio.availability ? <AvailabilityPill>{studio.availability}</AvailabilityPill> : null}
              {studio.eyebrow ? <p className="eyebrow">{studio.eyebrow}</p> : null}
            </div>
          ) : null}
          <h1 id="studio-hero" className="mt-5 max-w-3xl text-hero font-semibold">
            {studio.headline}
          </h1>
          {studio.subheadline ? <p className="mt-7 max-w-2xl text-lead text-ink-2">{studio.subheadline}</p> : null}
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={STUDIO_ROUTES.start} className="h-12 px-6">
              Book a discovery call <ArrowRight aria-hidden className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href={STUDIO_ROUTES.work} variant="secondary" className="h-12 px-6">
              See case studies
            </ButtonLink>
          </div>
          {studio.trustLine ? <p className="mt-8 font-mono text-[0.8125rem] text-ink-3">{studio.trustLine}</p> : null}
        </div>
        {studio.process.length ? <DeliveryCard settings={settings} /> : null}
      </div>
    </section>
  );
}

/** Hero visual: the actual delivery process from settings, presented as a project plan. */
function DeliveryCard({ settings }: { settings: SiteSettings }) {
  const steps = settings.studio.process;
  return (
    <aside aria-label="How your project ships" className="overflow-hidden rounded-xl border border-rule bg-surface/70 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.8)] backdrop-blur-sm">
      <div className="flex h-10 items-center justify-between border-b border-rule px-4">
        <span className="font-mono text-[0.75rem] text-ink-3">project-plan.md</span>
        <span className="font-mono text-[0.6875rem] text-ink-3">{steps.length} phases</span>
      </div>
      <ol className="p-5 md:p-6">
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={step.title} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  aria-hidden
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[0.6875rem]",
                    i === 0 ? "border-accent bg-accent text-accent-ink" : "border-rule-strong text-ink-3",
                  )}
                >
                  {i + 1}
                </span>
                {!last ? <span aria-hidden className="my-1 w-px flex-1 bg-rule" /> : null}
              </div>
              <div className={cn(!last && "pb-6")}>
                <p className="font-medium text-ink">{step.title}</p>
                {step.duration ? <p className="mt-0.5 font-mono text-[0.75rem] text-ink-3">{step.duration}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

/* ------------------------------------------------------------------ Sections */

function Services({ settings }: { settings: SiteSettings }) {
  const { services } = settings.studio;
  return (
    <section id="services" aria-labelledby="studio-services" className="scroll-mt-24">
      <SectionHeader
        id="studio-services"
        label="Services"
        heading="What I build for startups"
        intro="End-to-end product engineering: architecture, backend, frontend and the infrastructure to run it. One senior engineer, accountable for the result."
      />
      <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => {
          const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
          return (
            <li key={service.title} className="flex flex-col bg-paper p-6 md:p-7">
              <Icon aria-hidden className="h-5 w-5 text-accent" strokeWidth={1.75} />
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{service.title}</h3>
              {service.description ? <p className="mt-2 text-[0.9375rem] text-ink-2">{service.description}</p> : null}
              {service.items.length ? (
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-6" aria-label={`${service.title} includes`}>
                  {service.items.map((item) => (
                    <li key={item} className="chip">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Positioning table. It describes how you work, so it can be switched off in Admin › Studio. */
const COMPARISON: { row: string; market: string; agency: string; me: string }[] = [
  { row: "Senior engineer writing your code", market: "Varies", agency: "Often junior staff", me: "Always" },
  { row: "Direct line to the person building it", market: "Yes", agency: "Via account manager", me: "Yes" },
  { row: "Fixed-price milestones", market: "Rarely", agency: "Sometimes", me: "Yes" },
  { row: "Production practices: tests, CI, security review", market: "Varies", agency: "Yes", me: "Yes" },
  { row: "Support after launch", market: "Rarely", agency: "At a premium", me: "Retainer or on demand" },
  { row: "Typical cost", market: "$", agency: "$$$", me: "$$" },
];

function Cell({ value, strong }: { value: string; strong?: boolean }) {
  const positive = value === "Yes" || value === "Always";
  const negative = value === "Rarely";
  return (
    <span className={cn("inline-flex items-center gap-1.5", strong ? "font-medium text-ink" : "text-ink-2")}>
      {positive ? <Check aria-hidden className={cn("h-4 w-4", strong ? "text-accent" : "text-ink-3")} /> : negative ? <Minus aria-hidden className="h-4 w-4 text-ink-3" /> : null}
      {value}
    </span>
  );
}

function WhyMe({ settings }: { settings: SiteSettings }) {
  const { studio } = settings;
  if (!studio.showComparison && !studio.highlights.length) return null;
  return (
    <section aria-labelledby="studio-why">
      <SectionHeader
        id="studio-why"
        label="Why work with me"
        heading="Senior expertise without agency overhead"
        intro="Founders usually choose between a marketplace freelancer and an agency. Here is where I sit."
      />
      {studio.highlights.length ? (
        <ul className={cn("mt-12 grid gap-4 sm:grid-cols-2", studio.highlights.length === 3 && "lg:grid-cols-3", studio.highlights.length === 4 && "lg:grid-cols-4")}>
          {studio.highlights.map((h) => (
            <li key={h.label} className="card p-6">
              <p className="metric-value text-title-3">{h.value}</p>
              <p className="mt-2 text-[0.9375rem] text-ink-2">{h.label}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {studio.showComparison ? (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-[0.9375rem]">
            <caption className="sr-only">Comparison of a typical freelance marketplace, a typical agency and working with me</caption>
            <thead>
              <tr className="border-b border-rule font-mono text-[0.75rem] uppercase tracking-[0.08em] text-ink-3">
                <th scope="col" className="px-6 py-4 font-medium">
                  <span className="sr-only">Criteria</span>
                </th>
                <th scope="col" className="px-4 py-4 font-medium">
                  Freelance marketplace
                </th>
                <th scope="col" className="px-4 py-4 font-medium">
                  Typical agency
                </th>
                <th scope="col" className="bg-accent/[0.06] px-6 py-4 font-medium text-accent">
                  Working with me
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {COMPARISON.map((r) => (
                <tr key={r.row}>
                  <th scope="row" className="px-6 py-4 font-normal text-ink">
                    {r.row}
                  </th>
                  <td className="px-4 py-4">
                    <Cell value={r.market} />
                  </td>
                  <td className="px-4 py-4">
                    <Cell value={r.agency} />
                  </td>
                  <td className="bg-accent/[0.06] px-6 py-4">
                    <Cell value={r.me} strong />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function Process({ settings }: { settings: SiteSettings }) {
  const steps = settings.studio.process;
  return (
    <section id="process" aria-labelledby="studio-process" className="scroll-mt-24">
      <SectionHeader id="studio-process" label="Process" heading="From first call to production" intro="A clear, low-risk path. You see working software every week and always know what comes next." />
      <ol className={cn("mt-12 grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-2", steps.length >= 4 && "lg:grid-cols-4", steps.length === 3 && "lg:grid-cols-3")}>
        {steps.map((step, i) => (
          <li key={step.title} className="bg-paper p-6 md:p-7">
            <p className="font-mono text-[0.75rem] text-ink-3">
              <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
              {step.duration ? ` · ${step.duration}` : ""}
            </p>
            <h3 className="mt-4 text-lg font-semibold tracking-tight">{step.title}</h3>
            {step.description ? <p className="mt-2 text-[0.9375rem] text-ink-2">{step.description}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Engagements({ settings }: { settings: SiteSettings }) {
  const items = settings.studio.engagements;
  return (
    <section id="engagements" aria-labelledby="studio-engagements" className="scroll-mt-24">
      <SectionHeader id="studio-engagements" label="Engagements" heading="Ways to work together" intro="Every engagement starts with a free discovery call and a written proposal with a fixed price." />
      <ul className={cn("mt-12 grid items-stretch gap-5", items.length === 2 ? "md:grid-cols-2" : items.length >= 3 ? "md:grid-cols-2 lg:grid-cols-3" : "")}>
        {items.map((e) => (
          <li key={e.name} className={cn("relative flex flex-col rounded-xl border p-7", e.featured ? "border-accent/60 bg-accent/[0.04]" : "border-rule bg-surface/40")}>
            {e.featured ? (
              <span className="absolute -top-3 left-7 rounded-md bg-accent px-2.5 py-0.5 font-mono text-[0.6875rem] font-medium uppercase tracking-wide text-accent-ink">Most requested</span>
            ) : null}
            <h3 className="text-title-3 font-semibold">{e.name}</h3>
            {e.description ? <p className="mt-2 text-[0.9375rem] text-ink-2">{e.description}</p> : null}
            {e.priceNote ? <p className="mt-5 font-mono text-[0.8125rem] text-ink">{e.priceNote}</p> : null}
            {e.includes.length ? (
              <ul className="mt-5 space-y-2.5 border-t border-rule pt-5 text-[0.9375rem]">
                {e.includes.map((item) => (
                  <li key={item} className="flex gap-2.5 text-ink-2">
                    <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-auto pt-7">
              <ButtonLink href={STUDIO_ROUTES.start} variant={e.featured ? "primary" : "secondary"} className="w-full">
                Discuss your project
              </ButtonLink>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Remote({ settings }: { settings: SiteSettings }) {
  const points = settings.studio.remote;
  return (
    <section aria-labelledby="studio-remote" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
      <SectionHeader
        id="studio-remote"
        label="Remote by design"
        heading="Easy to work with, from anywhere"
        intro="Built for teams in the US and Europe: predictable communication, clean contracts and simple payments."
        className="self-start"
      />
      <ul className="grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-2">
        {points.map((p, i) => {
          const Icon = REMOTE_ICONS[i % REMOTE_ICONS.length];
          return (
            <li key={p.title} className="bg-paper p-6">
              <Icon aria-hidden className="h-5 w-5 text-accent" strokeWidth={1.75} />
              <h3 className="mt-4 font-semibold text-ink">{p.title}</h3>
              {p.description ? <p className="mt-1.5 text-[0.9375rem] text-ink-2">{p.description}</p> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function WhoYouWorkWith({ settings, experience }: { settings: SiteSettings; experience: Experience[] }) {
  const { profile } = settings;
  const { years, current } = careerSummary(experience);
  return (
    <section aria-labelledby="studio-who" className="card grid gap-8 p-6 md:grid-cols-[11rem_minmax(0,1fr)] md:items-center md:gap-10 md:p-10">
      {profile.portrait?.url ? (
        <SiteImage src={profile.portrait.url} alt={profile.portrait.alt} aspect="1 / 1" sizes="176px" className="w-36 rounded-xl border border-rule md:w-44" imgClassName="object-top" />
      ) : null}
      <div>
        <p className="eyebrow">Who you&apos;ll work with</p>
        <h2 id="studio-who" className="mt-4 text-title-2 font-semibold">
          {profile.name}
        </h2>
        <p className="mt-2 font-mono text-[0.8125rem] text-ink-3">
          {[profile.title, current ? `currently ${current.title} @ ${current.organization}` : "", profile.location].filter(Boolean).join("  ·  ")}
        </p>
        <p className="mt-5 max-w-2xl text-[1.0625rem] text-ink-2">
          {years > 0 ? `${years}+ years building production software with teams across several countries. ` : ""}
          You talk directly to the engineer responsible for your product: no account managers, no hand-offs, no surprises.
        </p>
      </div>
    </section>
  );
}

function Faq({ settings }: { settings: SiteSettings }) {
  return (
    <section id="faq" aria-labelledby="studio-faq" className="grid scroll-mt-24 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] lg:gap-16">
      <SectionHeader
        id="studio-faq"
        label="FAQ"
        heading="Questions founders ask"
        intro="Anything else? Ask in the project form and I'll answer directly."
        className="self-start lg:sticky lg:top-24"
      />
      <ul className="card divide-y divide-rule">
        {settings.studio.faqs.map((faq) => (
          <li key={faq.question}>
            <details className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-medium text-ink">
                {faq.question}
                <span
                  aria-hidden
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-rule font-mono text-ink-3 transition-transform duration-base group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-prose whitespace-pre-line text-ink-2">{faq.answer}</p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FinalCta({ settings }: { settings: SiteSettings }) {
  const email = studioEmail(settings);
  return (
    <section aria-labelledby="studio-cta" className="card relative overflow-hidden px-6 py-16 text-center md:px-12 md:py-24">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_100%,black,transparent)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[50rem] -translate-x-1/2"
        style={{ background: "radial-gradient(closest-side, rgb(var(--accent) / 0.14), transparent)" }}
      />
      <div className="relative">
        <p className="eyebrow">Start a project</p>
        <h2 id="studio-cta" className="mx-auto mt-5 max-w-3xl text-title-1 font-semibold">
          Have a product to build?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lead text-ink-2">Tell me where you are today. You&apos;ll get a clear answer on scope, timeline and cost, with no obligation.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href={STUDIO_ROUTES.start} className="h-12 px-6">
            Book a discovery call <ArrowRight aria-hidden className="h-4 w-4" />
          </ButtonLink>
          {email ? (
            <ButtonLink href={`mailto:${email}`} variant="secondary" className="h-12 px-6">
              <Mail aria-hidden className="h-4 w-4" /> {email}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
