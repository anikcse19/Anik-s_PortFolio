import Link from "next/link";
import { Notice, StatusBadge } from "@/components/admin/fields";
import { DataTable, FlashNotice, ListToolbar, NewButton, PageHeader, Pagination, readListQuery } from "@/components/admin/list-page";
import { RowActions } from "@/components/admin/row-actions";
import { listDocuments } from "@/lib/admin/crud";
import { readSettings } from "@/lib/admin/settings";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/dates";
import type { Article } from "@/lib/types";

export const metadata = { title: "Articles" };

export default async function AdminArticlesPage({ searchParams }: PageProps<"/admin/articles">) {
  await requireAdmin();
  const params = await searchParams;
  const query = readListQuery(params);
  const [result, appearance] = await Promise.all([listDocuments<Article>("articles", query), readSettings("appearance")]);
  return (
    <>
      <PageHeader title="Articles" description="Engineering notes. Drafts stay private until published." action={<NewButton href="/admin/articles/new">New article</NewButton>} />
      {!appearance.writingEnabled ? (
        <div className="mt-4">
          <Notice tone="warning">
            The writing section is disabled, so no articles are public and the navigation link is hidden. Enable it in{" "}
            <Link href="/admin/appearance" className="underline">
              Appearance
            </Link>
            .
          </Notice>
        </div>
      ) : null}
      <FlashNotice show={params.deleted === "1"}>Article deleted.</FlashNotice>
      <ListToolbar basePath="/admin/articles" query={query} />
      <DataTable
        items={result.items}
        empty={query.q || query.status ? "No articles match these filters." : "No articles yet."}
        columns={[
          {
            header: "Title",
            cell: (a) => (
              <div>
                <Link href={`/admin/articles/${a.id}`} className="font-medium text-ink hover:text-accent">
                  {a.title}
                </Link>
                <p className="text-xs text-ink-3">/{a.slug}</p>
              </div>
            ),
          },
          { header: "Published", cell: (a) => <span className="text-ink-3">{a.publishedAt ? formatDate(a.publishedAt, "short") : "—"}</span> },
          { header: "Read", cell: (a) => `${a.readingMinutes} min` },
          { header: "Status", cell: (a) => <StatusBadge status={a.status} /> },
          { header: "Actions", className: "md:text-right", cell: (a) => <RowActions collection="articles" id={a.id} status={a.status} label={a.title} /> },
        ]}
      />
      <Pagination basePath="/admin/articles" query={query} result={result} />
    </>
  );
}
