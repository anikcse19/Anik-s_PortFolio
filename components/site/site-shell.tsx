import Link from "next/link";
import type { ReactNode } from "react";
import type { SiteSettings } from "@/lib/data/public";
import { isExternalHref, isFileHref } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { HeaderNav } from "./header-nav";
import { resumeHref } from "@/lib/resume";
import { visibleNavItems } from "./nav";

export function SiteShell({ settings, children, banner }: { settings: SiteSettings; children: ReactNode; banner?: ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {banner}
      <SiteHeader settings={settings} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}

function SiteHeader({ settings }: { settings: SiteSettings }) {
  const { profile, appearance } = settings;
  const items = visibleNavItems(settings);
  return (
    <header
      className={cn(
        "z-40 border-b border-rule bg-paper/90 supports-[backdrop-filter]:bg-paper/75 supports-[backdrop-filter]:backdrop-blur-md",
        appearance.stickyHeader ? "sticky top-0" : "relative",
      )}
    >
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href="/" className="font-display text-[1.0625rem] font-semibold tracking-tight text-ink">
          {profile.name}
          <span className="sr-only"> — home</span>
        </Link>
        <HeaderNav items={items} name={profile.name} cta={resumeHref(settings) ? { label: "Résumé", href: resumeHref(settings) } : null} />
      </div>
    </header>
  );
}

export function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const className = "text-ink-2 transition-colors duration-fast hover:text-ink";
  if (isExternalHref(href) || isFileHref(href) || href.startsWith("mailto:")) {
    return (
      <a href={href} className={className} {...(isExternalHref(href) || isFileHref(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function SiteFooter({ settings }: { settings: SiteSettings }) {
  const { profile, contact, navigation, appearance } = settings;
  const items = visibleNavItems(settings);
  const year = new Date().getFullYear();

  const bottom = (
    <div className="container-page flex flex-col gap-2 py-6 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between">
      <p>
        © {year} {profile.name}
        {profile.location ? ` · ${profile.location}` : ""}
      </p>
      {navigation.showColophon ? <p>Built with Next.js, TypeScript and MongoDB.</p> : null}
    </div>
  );

  if (appearance.footerLayout === "minimal") {
    return <footer className="mt-32 border-t border-rule">{bottom}</footer>;
  }

  return (
    <footer className="mt-32 border-t border-rule">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))]">
        <div>
          <p className="font-display text-lg font-semibold tracking-tight text-ink">{profile.name}</p>
          <p className="mt-1 text-ink-2">{profile.title}</p>
          {navigation.footerNote ? <p className="mt-4 max-w-md text-sm text-ink-3">{navigation.footerNote}</p> : null}
          {contact.email ? (
            <p className="mt-5">
              <a href={`mailto:${contact.email}`} className="text-[0.9375rem] font-medium text-ink hover:text-accent">
                {contact.email}
              </a>
            </p>
          ) : null}
        </div>
        <nav aria-label="Footer">
          <p className="text-sm font-medium text-ink">Pages</p>
          <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
            {items.map((item) => (
              <li key={item.href + item.label}>
                <FooterLink href={item.href}>{item.label}</FooterLink>
              </li>
            ))}
          </ul>
        </nav>
        {contact.socials.length || resumeHref(settings) ? (
          <div>
            <p className="text-sm font-medium text-ink">Elsewhere</p>
            <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
              {contact.socials.map((s) => (
                <li key={s.url}>
                  <FooterLink href={s.url}>{s.label}</FooterLink>
                </li>
              ))}
              {resumeHref(settings) ? (
                <li>
                  <FooterLink href={resumeHref(settings)}>Résumé</FooterLink>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="border-t border-rule">{bottom}</div>
    </footer>
  );
}
