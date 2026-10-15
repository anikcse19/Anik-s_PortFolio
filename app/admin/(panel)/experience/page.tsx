import Link from "next/link";
import { StatusBadge } from "@/components/admin/fields";
import { DataTable, FlashNotice, ListToolbar, NewButton, PageHeader, Pagination, readListQuery } from "@/components/admin/list-page";
import { RowActions } from "@/components/admin/row-actions";
import { listDocuments } from "@/lib/admin/crud";
import { requireAdmin } from "@/lib/auth/session";
import { employmentPeriod } from "@/lib/dates";
import type { Experience } from "@/lib/types";

export const metadata = { title: "Experience" };

export default async function AdminExperiencePage({ searchParams }: PageProps<"/admin/experience">) {
  await requireAdmin();
  const params = await searchParams;
  const query = readListQuery(params);
  const result = await listDocuments<Experience>("experience", query);
  return (
    <>
      <PageHeader title="Experience" description="Positions are shown chronologically. Entries without confirmed dates show no date label." action={<NewButton href="/admin/experience/new">New entry</NewButton>} />
      <FlashNotice show={params.deleted === "1"}>Entry deleted.</FlashNotice>
      <ListToolbar basePath="/admin/experience" query={query} />
      <DataTable
        items={result.items}
        empty="No experience entries yet."
        columns={[
          {
            header: "Position",
            cell: (e) => (
              <div>
                <Link href={`/admin/experience/${e.id}`} className="font-medium text-ink hover:text-accent">
                  {e.title}
                </Link>
                <p className="text-xs text-ink-3">{e.organization}</p>
              </div>
            ),
          },
          {
            header: "Dates",
            cell: (e) => {
              const p = employmentPeriod(e);
              return p.range ? <span className="font-mono text-xs">{p.range}</span> : <span className="text-xs text-warning">Dates not set</span>;
            },
          },
          { header: "Status", cell: (e) => <StatusBadge status={e.status} /> },
          { header: "Actions", className: "md:text-right", cell: (e) => <RowActions collection="experience" id={e.id} status={e.status} label={`${e.title} at ${e.organization}`} /> },
        ]}
      />
      <Pagination basePath="/admin/experience" query={query} result={result} />
    </>
  );
}
