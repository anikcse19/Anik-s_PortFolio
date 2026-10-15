import { NotFoundContent } from "@/components/site/not-found-content";
import { SiteShell } from "@/components/site/site-shell";
import { getSiteSettings } from "@/lib/data/public";

export const metadata = { title: "Page not found", robots: { index: false } };

export default async function GlobalNotFound() {
  const settings = await getSiteSettings();
  return (
    <SiteShell settings={settings}>
      <NotFoundContent />
    </SiteShell>
  );
}
