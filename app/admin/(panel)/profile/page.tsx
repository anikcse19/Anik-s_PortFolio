import { ProfileForm } from "@/components/admin/settings/profile-form";
import { readSettings } from "@/lib/admin/settings";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  await requireAdmin();
  return <ProfileForm initial={await readSettings("profile")} />;
}
