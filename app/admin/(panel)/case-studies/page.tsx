import Link from "next/link";
import { StatusBadge } from "@/components/admin/fields";
import { DataTable, FlashNotice, ListToolbar, NewButton, PageHeader, Pagination, readListQuery } from "@/components/admin/list-page";
import { RowActions } from "@/components/admin/row-actions";
import { listDocuments } from "@/lib/admin/crud";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/dates";
import type { CaseStudy } from "@/lib/types";
import { CASE_STUDY_KIND_LABELS } from "@/lib/validation/content";

export const metadata = { title: "Case studies" };

export default async function AdminCaseStudiesPage({ searchParams }: PageProps<"/admin/case-studies">) {
  await requireAdmin();
  const params = await searchParams;
  const query = readListQuery(params);
  const result = await listDocuments<CaseStudy>("caseStudies", query);
  return (
    <>
      <PageHeader title="Case studies" description="Deep technical write-ups with sections, code, callouts and diagrams." action={<NewButton href="/admin/case-studies/new">New case study</NewButton>} />
      <FlashNotice show={params.deleted === "1"}>Case study deleted.</FlashNotice>
      <ListToolbar basePath="/admin/case-studies" query={query} />
      <DataTable
        items={result.items}
        empty={query.q || query.status ? "No case studies match these filters." : "No case studies yet."}
        columns={[
          {
            header: "Title",
            cell: (c) => (
              <div>
                <Link href={`/admin/case-studies/${c.id}`} className="font-medium text-ink hover:text-accent">
                  {c.title}
                </Link>
                <p className="text-xs text-ink-3">/{c.slug}</p>
              </div>
            ),
          },
          { header: "Kind", cell: (c) => CASE_STUDY_KIND_LABELS[c.kind] },
          { header: "Sections", cell: (c) => c.sections.length },
          { header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
          { header: "Updated", cell: (c) => <span className="text-ink-3">{formatDate(c.updatedAt, "short")}</span> },
          { header: "Actions", className: "md:text-right", cell: (c) => <RowActions collection="caseStudies" id={c.id} status={c.status} label={c.title} canMove={!query.q && !query.status} /> },
        ]}
      />
      <Pagination basePath="/admin/case-studies" query={query} result={result} />
    </>
  );
}
