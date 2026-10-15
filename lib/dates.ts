/**
 * Date helpers for employment history and publication dates.
 * Employment dates are stored as "YYYY-MM" strings with month precision.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function parseYearMonth(value: string | null | undefined): { year: number; month: number } | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function formatYearMonth(value: string | null | undefined): string {
  const parsed = parseYearMonth(value);
  if (!parsed) return "";
  return `${MONTHS[parsed.month - 1]} ${parsed.year}`;
}

export function toYearMonth(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Whole months between two "YYYY-MM" values, counting both the start and end
 * month (Jan–Mar = 3 months), which matches how résumés usually count tenure.
 */
export function monthsBetween(start: string, end: string): number | null {
  const a = parseYearMonth(start);
  const b = parseYearMonth(end);
  if (!a || !b) return null;
  const diff = (b.year - a.year) * 12 + (b.month - a.month) + 1;
  return diff > 0 ? diff : null;
}

export function formatDuration(months: number | null): string {
  if (!months) return "";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (rest) parts.push(`${rest} mo${rest > 1 ? "s" : ""}`);
  return parts.join(" ");
}

export type EmploymentPeriod = {
  /** e.g. "Feb 2021 – Dec 2023", "Apr 2025 – Present", or "" when dates are unknown. */
  range: string;
  /** e.g. "2 yrs 11 mos", or "" when it cannot be computed. */
  duration: string;
};

export function employmentPeriod(
  entry: { startDate: string; endDate: string; isCurrent: boolean },
  now: Date = new Date(),
): EmploymentPeriod {
  const start = formatYearMonth(entry.startDate);
  if (!start) return { range: entry.isCurrent ? "Current" : "", duration: "" };
  const endValue = entry.isCurrent ? toYearMonth(now) : entry.endDate;
  const end = entry.isCurrent ? "Present" : formatYearMonth(entry.endDate);
  const range = end ? `${start} – ${end}` : start;
  const duration = endValue ? formatDuration(monthsBetween(entry.startDate, endValue)) : "";
  return { range, duration };
}

/** Sort: current roles first, then most recent start date; undated entries last; sortOrder breaks ties. */
export function compareExperience(
  a: { isCurrent: boolean; startDate: string; sortOrder: number },
  b: { isCurrent: boolean; startDate: string; sortOrder: number },
): number {
  if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
  if (a.startDate !== b.startDate) {
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return a.startDate < b.startDate ? 1 : -1;
  }
  return a.sortOrder - b.sortOrder;
}

export function formatDate(iso: string | null | undefined, style: "long" | "short" = "long"): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: style === "long" ? "long" : "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
