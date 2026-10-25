import { PageHeader } from "@/components/admin/list-page";
import { SyncBoard } from "@/components/admin/sync-board";
import { getSyncBoard } from "@/lib/admin/sync";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Profile sync" };

export default async function SyncPage() {
  await requireAdmin();
  const { items, removed } = await getSyncBoard();
  return (
    <>
      <PageHeader
        title="Profile sync"
        description="Your site is the source of truth. The portfolio and résumé update automatically; for LinkedIn and GitHub, copy the prepared text, then mark it as synced. Anything you change later shows up here."
      />
      <SyncBoard items={items} removed={removed} />
    </>
  );
}
