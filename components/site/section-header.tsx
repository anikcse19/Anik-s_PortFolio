import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  /** Small accent label above the heading. */
  label?: string;
  heading?: string;
  intro?: string;
  cta?: { label: string; href: string } | null;
  id?: string;
  as?: "h1" | "h2";
  children?: ReactNode;
  className?: string;
};

/**
 * The one section opener used across the public site: eyebrow, heading and
 * intro on the left, an optional "view all" link aligned to the right.
 */
export function SectionHeader({ label, heading, intro, cta, id, as = "h2", children, className }: SectionHeaderProps) {
  const Heading = as;
  return (
    <div className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10", className)}>
      <div className="max-w-3xl">
        {label ? <p className="eyebrow">{label}</p> : null}
        {heading ? (
          <Heading id={id} className={cn("font-semibold", label && "mt-4", as === "h1" ? "text-title-1" : "text-title-2")}>
            {heading}
          </Heading>
        ) : null}
        {intro ? <p className={cn("max-w-2xl text-ink-2", as === "h1" ? "mt-5 text-lead" : "mt-4 text-[1.0625rem]")}>{intro}</p> : null}
        {children}
      </div>
      {cta?.label && cta.href ? <ViewAllLink href={cta.href}>{cta.label}</ViewAllLink> : null}
    </div>
  );
}

export function ViewAllLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex shrink-0 items-center gap-1.5 text-[0.9375rem] font-medium text-ink transition-colors duration-fast hover:text-ink-2", className)}
    >
      {children}
      <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5" />
    </Link>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-rule-strong px-6 py-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      {children ? <div className="mx-auto mt-2 max-w-md text-sm text-ink-3">{children}</div> : null}
    </div>
  );
}
