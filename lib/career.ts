import { monthsBetween, toYearMonth } from "@/lib/dates";

type ExperienceLike = { startDate: string; isCurrent: boolean; title: string; organization: string };

export type CareerSummary<T extends ExperienceLike> = {
  /** Whole years since the earliest dated role (0 when unknown). */
  years: number;
  /** The first current role in display order, if any. */
  current: T | null;
  companies: number;
};

/** Facts derived from published experience, so the hero never shows hand-typed numbers that drift. */
export function careerSummary<T extends ExperienceLike>(experience: T[], now: Date = new Date()): CareerSummary<T> {
  const earliest = experience
    .map((e) => e.startDate)
    .filter(Boolean)
    .sort()[0];
  const months = earliest ? monthsBetween(earliest, toYearMonth(now)) : null;
  return {
    years: months ? Math.floor(months / 12) : 0,
    current: experience.find((e) => e.isCurrent) ?? null,
    companies: new Set(experience.map((e) => e.organization.trim().toLowerCase()).filter(Boolean)).size,
  };
}
