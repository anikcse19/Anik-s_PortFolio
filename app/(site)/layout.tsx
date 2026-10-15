import type { ReactNode } from "react";
import { SiteShell } from "@/components/site/site-shell";
import { getSiteSettings } from "@/lib/data/public";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  return <SiteShell settings={settings}>{children}</SiteShell>;
}
