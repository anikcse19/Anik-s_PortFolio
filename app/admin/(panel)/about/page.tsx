import { AboutForm } from "@/components/admin/settings/about-form";
import { readSettings } from "@/lib/admin/settings";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "About page" };

export default async function AboutSettingsPage() {
  await requireAdmin();
  return <AboutForm initial={await readSettings("about")} />;
}
