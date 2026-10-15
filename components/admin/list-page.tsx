import { Plus, Search } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClasses } from "@/components/ui/button";
import type { ListResult } from "@/lib/admin/crud";
import { cn } from "@/lib/utils";

export type ListQuery = { q: string; status: string; page: number };

export function readListQuery(params: Record<string, string | string[] | undefined>): ListQuery {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const page = Number.parseInt(one(params.page), 10);
  return { q: one(params.q).slice(0, 100), status: one(params.status), page: Number.isFinite(page) && page > 0 ? page : 1 };
}

export function PageHeader({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-5 pt-8">
      <div>
        <h1 className="text-title-3 font-semibold">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-ink-3">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function NewButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={buttonClasses("primary", "sm")}>
      <Plus className="h-4 w-4" aria-hidden />
      {children}
    </Link>
  );
}

/** GET-based search and status filter (works without JavaScript). */
export function ListToolbar({ basePath, query, withStatus = true }: { basePath: string; query: ListQuery; withStatus?: boolean }) {
  return (
    <form action={basePath} method="get" role="search" className="flex flex-wrap items-center gap-2 py-4">
      <label className="relative min-w-[14rem] flex-1">
        <span className="sr-only">Search</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
        <input
          type="search"
          name="q"
          defaultValue={query.q}
          placeholder="Search…"
          className="h-9 w-full rounded-sm border border-rule-strong bg-paper pl-9 pr-3 text-sm focus:border-ink focus:outline-none"
        />
      </label>
      {withStatus ? (
        <label>
          <span className="sr-only">Status</span>
          <select name="status" defaultValue={query.status} className="h-9 rounded-sm border border-rule-strong bg-paper px-2 text-sm">
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </label>
      ) : null}
      <button type="submit" className={buttonClasses("secondary", "sm")}>
        Apply
      </button>
      {query.q || query.status ? (
        <Link href={basePath} className="text-sm text-ink-3 underline">
          Reset
        </Link>
      ) : null}
    </form>
  );
}

export function Pagination<T>({ basePath, query, result }: { basePath: string; query: ListQuery; result: ListResult<T> }) {
  if (result.pageCount <= 1) return null;
  const href = (page: number) => {
    const sp = new URLSearchParams();
    if (query.q) sp.set("q", query.q);
    if (query.status) sp.set("status", query.status);
    if (page > 1) sp.set("page", String(page));
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between py-4 text-sm">
      <span className="text-ink-3">
        Page {result.page} of {result.pageCount} · {result.total} items
      </span>
      <div className="flex gap-2">
        {result.page > 1 ? (
          <Link href={href(result.page - 1)} className={buttonClasses("secondary", "sm")} rel="prev">
            Previous
          </Link>
        ) : null}
        {result.page < result.pageCount ? (
          <Link href={href(result.page + 1)} className={buttonClasses("secondary", "sm")} rel="next">
            Next
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

export type Column<T> = { header: string; className?: string; cell: (item: T) => ReactNode };

/** Responsive table: a real <table> on wide screens, stacked rows on small ones. */
export function DataTable<T extends { id: string }>({ items, columns, empty }: { items: T[]; columns: Column<T>[]; empty: ReactNode }) {
  if (!items.length) return <div className="border border-dashed border-rule-strong px-6 py-12 text-center text-sm text-ink-3">{empty}</div>;
  return (
    <div className="border-y border-rule">
      <table className="w-full text-left text-sm">
        <thead className="hidden md:table-header-group">
          <tr className="border-b border-rule">
            {columns.map((c) => (
              <th key={c.header} scope="col" className={cn("label px-3 py-2 font-normal", c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="block border-b border-rule py-3 last:border-b-0 md:table-row md:py-0">
              {columns.map((c) => (
                <td key={c.header} className={cn("block px-3 py-1 align-middle md:table-cell md:py-3", c.className)}>
                  <span className="label mr-2 md:hidden">{c.header}</span>
                  {c.cell(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FlashNotice({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;
  return (
    <p role="status" className="mt-4 border-l-2 border-success bg-surface px-4 py-2 text-sm">
      {children}
    </p>
  );
}
