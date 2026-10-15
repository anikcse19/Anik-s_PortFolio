import Link from "next/link";
import type { ReactNode } from "react";
import type { SiteSettings } from "@/lib/data/public";
import { isExternalHref } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { HeaderNav } from "./header-nav";
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
  const [first, ...rest] = profile.name.split(" ");
  return (
    <header
      className={cn(
        "z-40 border-b border-rule bg-paper/95 supports-[backdrop-filter]:bg-paper/85 supports-[backdrop-filter]:backdrop-blur-sm",
        appearance.stickyHeader ? "sticky top-0" : "relative",
      )}
    >
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href="/" className="group flex items-baseline gap-2 font-display text-[0.9375rem] font-semibold tracking-tight text-ink">
          <span>
            {first}
            {rest.length ? <span className="hidden sm:inline"> {rest.join(" ")}</span> : null}
          </span>
          <span className="hidden font-mono text-xs font-normal text-ink-3 lg:inline">/ {profile.title}</span>
          <span className="sr-only">— home</span>
        </Link>
        <HeaderNav items={items} name={profile.name} />
      </div>
    </header>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  if (isExternalHref(href) || href.startsWith("mailto:")) {
    return (
      <a href={href} className="link text-ink-2" {...(isExternalHref(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="link text-ink-2">
      {children}
    </Link>
  );
}

function SiteFooter({ settings }: { settings: SiteSettings }) {
  const { profile, contact, navigation, appearance } = settings;
  const items = visibleNavItems(settings);
  const year = new Date().getFullYear();

  if (appearance.footerLayout === "minimal") {
    return (
      <footer className="mt-24 border-t border-rule">
        <div className="container-page flex flex-col gap-4 py-8 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {profile.name}
            {profile.location ? ` · ${profile.location}` : ""}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {contact.socials.map((s) => (
              <li key={s.url}>
                <FooterLink href={s.url}>{s.label}</FooterLink>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-28 border-t border-rule">
      <div className="container-page grid-page gap-y-10 py-14">
        <div className="col-span-4 md:col-span-8 lg:col-span-5">
          <p className="font-display text-title-3 font-semibold tracking-tight text-ink">{profile.name}</p>
          <p className="mt-2 max-w-sm text-ink-2">{profile.title}</p>
          {navigation.footerNote ? <p className="mt-5 max-w-md text-sm text-ink-3">{navigation.footerNote}</p> : null}
          {contact.email ? (
            <p className="mt-6">
              <a href={`mailto:${contact.email}`} className="link font-mono text-sm text-ink">
                {contact.email}
              </a>
            </p>
          ) : null}
        </div>
        <nav aria-label="Footer" className="col-span-2 md:col-span-3 lg:col-span-2 lg:col-start-7">
          <p className="label mb-4">Index</p>
          <ul className="space-y-2 text-[0.9375rem]">
            <li>
              <FooterLink href="/">Home</FooterLink>
            </li>
            {items.map((item) => (
              <li key={item.href + item.label}>
                <FooterLink href={item.href}>{item.label}</FooterLink>
              </li>
            ))}
          </ul>
        </nav>
        {contact.socials.length || profile.resumeUrl ? (
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <p className="label mb-4">Elsewhere</p>
            <ul className="space-y-2 text-[0.9375rem]">
              {contact.socials.map((s) => (
                <li key={s.url}>
                  <FooterLink href={s.url}>{s.label}</FooterLink>
                </li>
              ))}
              {profile.resumeUrl ? (
                <li>
                  <FooterLink href={profile.resumeUrl}>Résumé</FooterLink>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
        {navigation.showColophon ? (
          <div className="col-span-4 md:col-span-2 lg:col-span-2">
            <p className="label mb-4">Colophon</p>
            <p className="text-sm text-ink-3">Built with Next.js, TypeScript and MongoDB. Content managed through a custom CMS.</p>
          </div>
        ) : null}
      </div>
      <div className="border-t border-rule">
        <div className="container-page flex flex-col gap-2 py-5 text-sm text-ink-3 sm:flex-row sm:justify-between">
          <p>
            © {year} {profile.name}
          </p>
          {profile.location ? <p>{profile.location}</p> : null}
        </div>
      </div>
    </footer>
  );
}
