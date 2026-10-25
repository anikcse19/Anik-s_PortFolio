import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/data/public";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  if (settings.seo.noindex) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/unlock"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
