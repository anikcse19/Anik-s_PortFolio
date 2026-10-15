import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/fields";
import { LinkChecker } from "@/components/admin/link-checker";
import { PageHeader } from "@/components/admin/list-page";
import { buttonClasses } from "@/components/ui/button";
import { getDashboardData } from "@/lib/admin/dashboard";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/dates";

export const metadata = { title: "Dashboard" };

function Stat({ label, published, draft, href }: { label: string; published: number; draft?: number; href: string }) {
  return (
    <Link href={href} className="group block border border-rule p-4 hover:border-ink">
      <p className="label">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{published}</p>
      <p className="mt-1 text-sm text-ink-3">
        published{typeof draft === "number" ? ` · ${draft} draft${draft === 1 ? "" : "s"}` : ""}
      </p>
    </Link>
  );
}

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const { counts, warnings, recent, appearance } = await getDashboardData();

  return (
    <>
      <PageHeader title={`Welcome back${admin.name ? `, ${admin.name.split(" ")[0]}` : ""}`} description="Content status at a glance. All numbers come from your database." />

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Projects" published={counts.projects.published} draft={counts.projects.draft} href="/admin/projects" />
        <Stat label="Case studies" published={counts.caseStudies.published} draft={counts.caseStudies.draft} href="/admin/case-studies" />
        <Stat label="Articles" published={counts.articles.published} draft={counts.articles.draft} href="/admin/articles" />
        <Stat label="Experience" published={counts.experience.published} draft={counts.experience.draft} href="/admin/experience" />
        <Stat label="Skill groups" published={counts.skills.published} draft={counts.skills.draft} href="/admin/skills" />
        <Link href="/admin/messages?filter=unread" className="block border border-rule p-4 hover:border-ink">
          <p className="label">Messages</p>
          <p className="mt-2 font-display text-3xl font-semibold tabular-nums">{counts.unread}</p>
          <p className="mt-1 text-sm text-ink-3">unread</p>
        </Link>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-8">
          <section aria-labelledby="warnings-heading">
            <h2 id="warnings-heading" className="mb-3 text-[0.9375rem] font-semibold">
              Needs attention {warnings.length ? <span className="text-ink-3">({warnings.length})</span> : null}
            </h2>
            {warnings.length ? (
              <ul className="divide-y divide-rule border-y border-rule">
                {warnings.map((w, i) => (
                  <li key={i}>
                    <Link href={w.href} className="flex items-start gap-3 px-2 py-2.5 text-sm hover:bg-surface">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
                      <span className="flex-1">{w.message}</span>
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-3">Nothing flagged.</p>
            )}
          </section>

          <section aria-labelledby="links-heading">
            <h2 id="links-heading" className="mb-3 text-[0.9375rem] font-semibold">
              Broken links
            </h2>
            <LinkChecker />
          </section>
        </div>

        <div className="space-y-8">
          <section aria-labelledby="quick-heading">
            <h2 id="quick-heading" className="mb-3 text-[0.9375rem] font-semibold">
              Quick actions
            </h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/projects/new" className={buttonClasses("primary", "sm")}>
                New project
              </Link>
              <Link href="/admin/case-studies/new" className={buttonClasses("secondary", "sm")}>
                New case study
              </Link>
              {appearance.writingEnabled ? (
                <Link href="/admin/articles/new" className={buttonClasses("secondary", "sm")}>
                  New article
                </Link>
              ) : null}
              <Link href="/admin/homepage" className={buttonClasses("secondary", "sm")}>
                Edit homepage
              </Link>
              <Link href="/" target="_blank" className={buttonClasses("ghost", "sm")}>
                View site ↗
              </Link>
            </div>
          </section>

          <section aria-labelledby="recent-heading">
            <h2 id="recent-heading" className="mb-3 text-[0.9375rem] font-semibold">
              Recently updated
            </h2>
            {recent.length ? (
              <ul className="divide-y divide-rule border-y border-rule">
                {recent.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className="block px-2 py-2.5 hover:bg-surface">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{r.title}</span>
                        {r.status ? <StatusBadge status={r.status} /> : null}
                      </span>
                      <span className="text-xs text-ink-3">
                        {r.kind} · {formatDate(r.updatedAt, "short")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-3">No content yet. Run the seed script or create your first project.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
