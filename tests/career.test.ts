import { describe, expect, it } from "vitest";
import { careerSummary } from "@/lib/career";

const role = (startDate: string, organization: string, isCurrent = false) => ({ startDate, organization, isCurrent, title: "Engineer" });

describe("careerSummary", () => {
  it("counts whole years from the earliest dated role", () => {
    // Nov 2021 – Sep 2026 is 59 months, counting both ends like the rest of the site.
    const now = new Date(Date.UTC(2026, 8, 1));
    const summary = careerSummary([role("2024-01", "B"), role("2021-11", "A"), role("", "C")], now);
    expect(summary.years).toBe(4);
    expect(summary.companies).toBe(3);
  });

  it("picks the first current role and copes with no data", () => {
    expect(careerSummary([role("2020-01", "A"), role("2025-01", "B", true)]).current?.organization).toBe("B");
    expect(careerSummary([])).toEqual({ years: 0, current: null, companies: 0 });
  });
});
