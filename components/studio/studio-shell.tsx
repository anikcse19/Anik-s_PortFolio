import Link from "next/link";
import type { ReactNode } from "react";
import { HeaderNav } from "@/components/site/header-nav";
import { FooterLink } from "@/components/site/site-shell";
import type { SiteSettings } from "@/lib/data/public";
import { STUDIO_ROUTES, studioBrand, studioEmail } from "@/lib/studio";

/**
 * Layout chrome for the studio zone. Every link here stays inside the studio,
 * so visitors never hit the password screen by accident.
 */
export function StudioShell({ settings, children }: { settings: SiteSettings; children: ReactNode }) {
  const brand = studioBrand(settings);
  const email = studioEmail(settings);
  const nav = [
    { label: "Services", href: `${STUDIO_ROUTES.home}#services` },
    { label: "Case studies", href: STUDIO_ROUTES.work },
    { label: "Process", href: `${STUDIO_ROUTES.home}#process` },
    { label: "Engagements", href: `${STUDIO_ROUTES.home}#engagements` },
    { label: "FAQ", href: `${STUDIO_ROUTES.home}#faq` },
  ];
  const year = new Date().getFullYear();

  return (
    <div className="zone-studio min-h-[100dvh] bg-paper text-ink">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-rule bg-paper/90 supports-[backdrop-filter]:bg-paper/75 supports-[backdrop-filter]:backdrop-blur-md">
        <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href={STUDIO_ROUTES.home} className="flex items-center gap-2.5 text-ink">
            <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-md border border-rule-strong bg-surface font-mono text-sm font-semibold text-ink">
              {brand.name.charAt(0)}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-[0.9375rem] font-semibold tracking-tight">{brand.name}</span>
              {brand.tagline ? <span className="hidden text-xs text-ink-3 sm:block">{brand.tagline}</span> : null}
            </span>
            <span className="sr-only"> — home</span>
          </Link>
          <HeaderNav items={nav} name={brand.name} homeHref={STUDIO_ROUTES.home} cta={{ label: "Book a call", href: STUDIO_ROUTES.start }} />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>

      <footer className="mt-32 border-t border-rule">
        <div className="container-page grid gap-10 py-14 md:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))]">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">{brand.name}</p>
            {brand.tagline ? <p className="mt-1 text-ink-2">{brand.tagline}</p> : null}
            {email ? (
              <p className="mt-5">
                <a href={`mailto:${email}`} className="text-[0.9375rem] font-medium text-ink hover:text-accent">
                  {email}
                </a>
              </p>
            ) : null}
          </div>
          <nav aria-label="Footer">
            <p className="text-sm font-medium text-ink">Studio</p>
            <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
              {nav.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
              <li>
                <FooterLink href={STUDIO_ROUTES.start}>Start a project</FooterLink>
              </li>
            </ul>
          </nav>
          {settings.contact.socials.length ? (
            <div>
              <p className="text-sm font-medium text-ink">Elsewhere</p>
              <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
                {settings.contact.socials.map((s) => (
                  <li key={s.url}>
                    <FooterLink href={s.url}>{s.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="border-t border-rule">
          <div className="container-page flex flex-col gap-2 py-6 text-sm text-ink-3 sm:flex-row sm:justify-between">
            <p>
              © {year} {brand.name}
            </p>
            {settings.profile.location ? <p>{settings.profile.location}</p> : null}
          </div>
        </div>
      </footer>
    </div>
  );
}
