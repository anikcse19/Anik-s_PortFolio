import Link from "next/link";
import { StatusBadge } from "@/components/admin/fields";
import { DataTable, FlashNotice, ListToolbar, NewButton, PageHeader, Pagination, readListQuery } from "@/components/admin/list-page";
import { RowActions } from "@/components/admin/row-actions";
import { listDocuments } from "@/lib/admin/crud";
import { requireAdmin } from "@/lib/auth/session";
import type { SkillCategory } from "@/lib/types";

export const metadata = { title: "Skills" };

export default async function AdminSkillsPage({ searchParams }: PageProps<"/admin/skills">) {
  await requireAdmin();
  const params = await searchParams;
  const query = readListQuery(params);
  const result = await listDocuments<SkillCategory>("skills", query);
  return (
    <>
      <PageHeader title="Skills" description="Skill categories and the skills inside them. Order here is the public order." action={<NewButton href="/admin/skills/new">New category</NewButton>} />
      <FlashNotice show={params.deleted === "1"}>Category deleted.</FlashNotice>
      <ListToolbar basePath="/admin/skills" query={query} />
      <DataTable
        items={result.items}
        empty="No skill categories yet."
        columns={[
          {
            header: "Category",
            cell: (c) => (
              <Link href={`/admin/skills/${c.id}`} className="font-medium text-ink hover:text-accent">
                {c.name}
              </Link>
            ),
          },
          { header: "Skills", cell: (c) => <span className="text-ink-2">{c.skills.map((s) => s.name).slice(0, 6).join(", ")}{c.skills.length > 6 ? ` +${c.skills.length - 6}` : ""}</span> },
          { header: "Status", cell: (c) => <StatusBadge status={c.status} /> },
          { header: "Actions", className: "md:text-right", cell: (c) => <RowActions collection="skills" id={c.id} status={c.status} label={c.name} canMove={!query.q && !query.status} /> },
        ]}
      />
      <Pagination basePath="/admin/skills" query={query} result={result} />
    </>
  );
}
