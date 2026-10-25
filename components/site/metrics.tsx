import { cn } from "@/lib/utils";
import type { Metric } from "@/lib/validation/common";

/** Row of headline numbers separated by hairlines. */
export function MetricGrid({ metrics, size = "lg", className }: { metrics: Metric[]; size?: "lg" | "sm"; className?: string }) {
  if (!metrics.length) return null;
  return (
    <dl
      className={cn(
        "grid divide-rule",
        metrics.length === 1 && "grid-cols-1",
        metrics.length === 2 && "grid-cols-2 divide-x",
        metrics.length === 3 && "grid-cols-3 divide-x",
        metrics.length >= 4 && "grid-cols-2 sm:grid-cols-4 sm:divide-x",
        className,
      )}
    >
      {metrics.map((m, i) => (
        <div key={`${m.value}-${m.label}`} className={cn(size === "lg" ? "px-5 py-1 first:pl-0" : "px-4 first:pl-0", metrics.length >= 4 && i >= 2 && "max-sm:mt-5", metrics.length >= 4 && i % 2 === 0 && "max-sm:pl-0")}>
          <dt className="sr-only">{m.label}</dt>
          <dd>
            <span className={cn("metric-value block", size === "lg" ? "text-[2rem] leading-none md:text-[2.5rem]" : "text-xl leading-tight")}>{m.value}</span>
            <span className={cn("mt-2 block text-ink-3", size === "lg" ? "font-mono text-[0.75rem] uppercase tracking-[0.08em]" : "text-[0.8125rem] leading-snug")}>{m.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
