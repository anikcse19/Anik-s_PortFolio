"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { ProjectListItem } from "@/lib/data/public";
import { cn } from "@/lib/utils";
import { PROJECT_TYPE_LABELS, PROJECT_TYPES } from "@/lib/validation/content";
import { ProjectGrid, ProjectLedger } from "./project-list";

type Filters = { q: string; type: string; category: string; tech: string };

/**
 * Client-side search and filtering over the (small, bounded) list of published
 * projects. Filters live in the URL so filtered views are shareable.
 */
export function ProjectsExplorer({ projects, layout }: { projects: ProjectListItem[]; layout: "ledger" | "grid" }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters: Filters = {
    q: params.get("q") ?? "",
    type: params.get("type") ?? "",
    category: params.get("category") ?? "",
    tech: params.get("tech") ?? "",
  };

  const categories = useMemo(() => Array.from(new Set(projects.map((p) => p.category).filter(Boolean))).sort(), [projects]);
  const technologies = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) for (const t of p.technologies) counts.set(t, (counts.get(t) ?? 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([t]) => t);
  }, [projects]);
  const types = PROJECT_TYPES.filter((t) => projects.some((p) => p.type === t));

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return projects.filter((p) => {
      if (filters.type && p.type !== filters.type) return false;
      if (filters.category && p.category !== filters.category) return false;
      if (filters.tech && !p.technologies.includes(filters.tech)) return false;
      if (!q) return true;
      return [p.title, p.summary, p.category, p.organization, p.role, ...p.technologies].join(" ").toLowerCase().includes(q);
    });
  }, [projects, filters.q, filters.type, filters.category, filters.tech]);

  function update(next: Partial<Filters>) {
    const merged = { ...filters, ...next };
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) search.set(k, v);
    const qs = search.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const active = Boolean(filters.q || filters.type || filters.category || filters.tech);

  return (
    <div>
      <div className="card grid gap-3 p-3 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]" role="search">
        <label className="relative block">
          <span className="sr-only">Search projects</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search by name, stack, domain…"
            className="h-10 w-full rounded-lg border border-rule bg-paper pl-9 pr-3 text-[0.9375rem] text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none"
          />
        </label>
        <FilterSelect label="Type" value={filters.type} onChange={(v) => update({ type: v })} options={types.map((t) => ({ value: t, label: PROJECT_TYPE_LABELS[t] }))} />
        <FilterSelect label="Domain" value={filters.category} onChange={(v) => update({ category: v })} options={categories.map((c) => ({ value: c, label: c }))} />
        <FilterSelect label="Technology" value={filters.tech} onChange={(v) => update({ tech: v })} options={technologies.map((t) => ({ value: t, label: t }))} />
      </div>

      <div className="flex items-center justify-between py-4 text-sm text-ink-3" aria-live="polite">
        <p>
          {filtered.length === projects.length ? `${projects.length} projects` : `${filtered.length} of ${projects.length} projects`}
        </p>
        {active ? (
          <button type="button" onClick={() => update({ q: "", type: "", category: "", tech: "" })} className="inline-flex items-center gap-1 text-ink-2 hover:text-ink">
            <X aria-hidden className="h-3.5 w-3.5" /> Clear filters
          </button>
        ) : null}
      </div>

      {filtered.length ? (
        layout === "grid" ? (
          <ProjectGrid projects={filtered} />
        ) : (
          <ProjectLedger projects={filtered} />
        )
      ) : (
        <div className="rounded-2xl border border-dashed border-rule-strong py-16 text-center text-ink-2">
          <p>No projects match these filters.</p>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!options.length}
        className={cn(
          "h-10 w-full rounded-lg border border-rule bg-paper px-3 text-[0.9375rem] focus:border-ink focus:outline-none",
          value ? "text-ink" : "text-ink-3",
        )}
      >
        <option value="">All {label === "Type" ? "types" : label === "Domain" ? "domains" : "technologies"}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
