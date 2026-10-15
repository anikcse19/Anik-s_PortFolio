import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  index?: string;
  label: string;
  heading?: string;
  intro?: string;
  cta?: { label: string; href: string } | null;
  id?: string;
  as?: "h1" | "h2";
  children?: ReactNode;
  className?: string;
};

/**
 * Editorial section opener: a mono "rail" label on the left (index + name)
 * and the heading/intro in the content columns. The rule above each section
 * gives the page its journal-like rhythm.
 */
export function SectionHeader({ index, label, heading, intro, cta, id, as = "h2", children, className }: SectionHeaderProps) {
  const Heading = as;
  return (
    <div className={cn("grid-page gap-y-4 border-t border-rule pt-5", className)}>
      <p className="label col-span-4 md:col-span-2 lg:col-span-3">
        {index ? <span className="text-accent">{index}</span> : null}
        {index ? <span aria-hidden> — </span> : null}
        {label}
      </p>
      <div className="col-span-4 md:col-span-6 lg:col-span-9">
        {heading ? (
          <Heading id={id} className={cn("font-semibold", as === "h1" ? "text-title-1" : "text-title-2")}>
            {heading}
          </Heading>
        ) : null}
        {intro ? <p className="mt-4 max-w-prose text-lead text-ink-2">{intro}</p> : null}
        {children}
        {cta?.label && cta.href ? (
          <ButtonLink href={cta.href} variant="link" className="mt-5 text-[0.9375rem]">
            {cta.label} <span aria-hidden>→</span>
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-dashed border-rule-strong px-6 py-10 text-center">
      <p className="font-medium text-ink">{title}</p>
      {children ? <div className="mx-auto mt-2 max-w-md text-sm text-ink-3">{children}</div> : null}
    </div>
  );
}
