import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StudioShell } from "@/components/studio/studio-shell";
import { getSiteSettings } from "@/lib/data/public";
import { studioBrand } from "@/lib/studio";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const brand = studioBrand(settings);
  const indexable = settings.studio.indexable && !settings.seo.noindex;
  return {
    // `absolute` so the portfolio's root title template doesn't wrap the studio's own branding.
    title: { absolute: brand.tagline ? `${brand.name} — ${brand.tagline}` : brand.name, template: `%s · ${brand.name}` },
    description: settings.studio.subheadline || settings.studio.headline,
    applicationName: brand.name,
    openGraph: { siteName: brand.name, type: "website" },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  return <StudioShell settings={settings}>{children}</StudioShell>;
}
