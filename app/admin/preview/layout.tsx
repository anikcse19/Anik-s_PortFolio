import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/site/site-shell";
import { requireAdmin } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/data/public";

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

/** Admin-only previews of unpublished content rendered with the public components. */
export default async function PreviewLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const settings = await getSiteSettings();
  return (
    <SiteShell
      settings={settings}
      banner={
        <div role="status" className="bg-accent px-4 py-2 text-center text-sm text-accent-ink">
          Preview — this view is only visible to you and may include unpublished content.
        </div>
      }
    >
      {children}
    </SiteShell>
  );
}
