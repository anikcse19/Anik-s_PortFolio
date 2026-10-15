import { NavigationForm } from "@/components/admin/settings/navigation-form";
import { readSettings } from "@/lib/admin/settings";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Navigation & footer" };

export default async function NavigationSettingsPage() {
  await requireAdmin();
  return <NavigationForm initial={await readSettings("navigation")} />;
}
