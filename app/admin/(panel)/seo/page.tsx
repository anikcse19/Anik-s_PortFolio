import { SeoForm } from "@/components/admin/settings/seo-form";
import { readSettings } from "@/lib/admin/settings";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "SEO" };

export default async function SeoSettingsPage() {
  await requireAdmin();
  return <SeoForm initial={await readSettings("seo")} />;
}
