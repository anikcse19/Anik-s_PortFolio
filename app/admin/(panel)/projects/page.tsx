import Link from "next/link";
import { StatusBadge } from "@/components/admin/fields";
import { DataTable, FlashNotice, ListToolbar, NewButton, PageHeader, Pagination, readListQuery } from "@/components/admin/list-page";
import { RowActions } from "@/components/admin/row-actions";
import { listDocuments } from "@/lib/admin/crud";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/dates";
import type { Project } from "@/lib/types";
import { PROJECT_TYPE_LABELS } from "@/lib/validation/content";

export const metadata = { title: "Projects" };

export default async function AdminProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  await requireAdmin();
  const params = await searchParams;
  const query = readListQuery(params);
  const result = await listDocuments<Project>("projects", query);

  return (
    <>
      <PageHeader title="Projects" description="Professional work, personal projects and open-source contributions. Order here is the public order." action={<NewButton href="/admin/projects/new">New project</NewButton>} />
      <FlashNotice show={params.deleted === "1"}>Project deleted.</FlashNotice>
      <ListToolbar basePath="/admin/projects" query={query} />
      <DataTable
        items={result.items}
        empty={query.q || query.status ? "No projects match these filters." : "No projects yet. Create the first one."}
        columns={[
          {
            header: "Title",
            cell: (p) => (
              <div>
                <Link href={`/admin/projects/${p.id}`} className="font-medium text-ink hover:text-accent">
                  {p.title}
                </Link>
                {p.featured ? <span className="ml-2 font-mono text-[0.6875rem] uppercase text-accent">Featured</span> : null}
                <p className="text-xs text-ink-3">/{p.slug}</p>
              </div>
            ),
          },
          { header: "Type", cell: (p) => PROJECT_TYPE_LABELS[p.type] },
          { header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
          { header: "Updated", cell: (p) => <span className="text-ink-3">{formatDate(p.updatedAt, "short")}</span> },
          {
            header: "Actions",
            className: "md:text-right",
            cell: (p) => <RowActions collection="projects" id={p.id} status={p.status} label={p.title} canMove={!query.q && !query.status} />,
          },
        ]}
      />
      <Pagination basePath="/admin/projects" query={query} result={result} />
    </>
  );
}
