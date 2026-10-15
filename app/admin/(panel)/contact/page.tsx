import { ContactSettingsForm } from "@/components/admin/settings/contact-form";
import { readSettings } from "@/lib/admin/settings";
import { requireAdmin } from "@/lib/auth/session";
import { isMailConfigured } from "@/lib/env";

export const metadata = { title: "Contact & social" };

export default async function ContactSettingsPage() {
  await requireAdmin();
  return <ContactSettingsForm initial={await readSettings("contact")} mailConfigured={isMailConfigured()} />;
}
