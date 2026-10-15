import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { getSiteSettings } from "@/lib/data/public";
import { getSiteUrl } from "@/lib/env";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: settings.seo.defaultTitle, template: settings.seo.titleTemplate },
    description: settings.seo.defaultDescription,
    applicationName: settings.seo.siteName || settings.profile.name,
    authors: [{ name: settings.profile.name }],
    robots: settings.seo.noindex ? { index: false, follow: false } : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0E0D" },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { appearance } = await getSiteSettings();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={fontVariables}
      data-accent={appearance.accent}
      data-container={appearance.container}
      data-motion={appearance.motion}
      data-typography={appearance.typography}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme={appearance.defaultTheme} enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
