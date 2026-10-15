import type { SiteSettings } from "@/lib/data/public";

export type NavItem = { label: string; href: string };

/**
 * Navigation items with links to disabled features removed, so turning off
 * writing or case studies never leaves a link pointing at a 404.
 */
export function visibleNavItems(settings: SiteSettings): NavItem[] {
  const { appearance } = settings;
  return settings.navigation.items
    .filter((item) => item.enabled)
    .filter((item) => {
      const path = item.href.split(/[?#]/)[0];
      if (!appearance.writingEnabled && (path === "/writing" || path.startsWith("/writing/"))) return false;
      if (!appearance.caseStudiesEnabled && (path === "/case-studies" || path.startsWith("/case-studies/"))) return false;
      return true;
    })
    .map(({ label, href }) => ({ label, href }));
}
