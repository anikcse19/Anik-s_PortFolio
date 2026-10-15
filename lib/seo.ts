import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";
import type { SiteSettings } from "@/lib/data/public";
import type { SeoPage } from "@/lib/validation/settings";

type MetaInput = {
  title?: string;
  description?: string;
  path: string;
  image?: string | null;
  type?: "website" | "article" | "profile";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  noindex?: boolean;
  /** Use the title verbatim (no site-name template), e.g. on the homepage. */
  absoluteTitle?: boolean;
};

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Builds page metadata from per-page values with fallbacks to the global SEO settings. */
export function buildMetadata(settings: SiteSettings, input: MetaInput): Metadata {
  const { seo } = settings;
  const description = input.description || seo.defaultDescription;
  const image = input.image || seo.ogImage || settings.profile.portrait?.url || "";
  const title = input.title || seo.defaultTitle;
  const fullTitle = input.absoluteTitle || !input.title ? title : seo.titleTemplate.replace("%s", input.title);
  const noindex = seo.noindex || input.noindex;
  const url = absoluteUrl(input.path);

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: input.type === "article" ? "article" : input.type === "profile" ? "profile" : "website",
      url,
      title: fullTitle,
      description,
      siteName: seo.siteName || settings.profile.name,
      ...(image ? { images: [{ url: absoluteUrl(image) }] } : {}),
      ...(input.type === "article" && input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.type === "article" && input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: fullTitle,
      description,
      ...(seo.twitterHandle ? { creator: seo.twitterHandle.startsWith("@") ? seo.twitterHandle : `@${seo.twitterHandle}` } : {}),
      ...(image ? { images: [absoluteUrl(image)] } : {}),
    },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export function pageMeta(settings: SiteSettings, page: SeoPage, fallbackTitle: string, path: string): Metadata {
  const entry = settings.seo.pages[page];
  return buildMetadata(settings, {
    title: entry.title || fallbackTitle,
    description: entry.description || undefined,
    path,
    absoluteTitle: page === "home",
  });
}

/** schema.org Person for the homepage and About page. */
export function personJsonLd(settings: SiteSettings): Record<string, unknown> {
  const { profile, contact } = settings;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    description: profile.positioning || undefined,
    url: getSiteUrl(),
    ...(profile.portrait?.url ? { image: absoluteUrl(profile.portrait.url) } : {}),
    ...(profile.location ? { address: { "@type": "PostalAddress", addressLocality: profile.location } } : {}),
    sameAs: contact.socials.map((s) => s.url),
  };
}
