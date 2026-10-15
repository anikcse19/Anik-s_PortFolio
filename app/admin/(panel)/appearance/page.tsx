import { AppearanceForm } from "@/components/admin/settings/appearance-form";
import { readSettings } from "@/lib/admin/settings";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Appearance" };

export default async function AppearanceSettingsPage() {
  await requireAdmin();
  return <AppearanceForm initial={await readSettings("appearance")} />;
}
