import { describe, expect, it } from "vitest";
import { estimateReadingMinutes, sanitizeBlocks } from "@/lib/content-utils";
import { compareExperience, employmentPeriod, monthsBetween } from "@/lib/dates";
import { sanitizeRichText } from "@/lib/sanitize";

describe("rich text sanitization (stored XSS)", () => {
  it("removes scripts, event handlers and dangerous URLs", () => {
    const dirty = `<p onclick="x()">Hi<script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">bad</a><iframe src="https://x"></iframe></p>`;
    const clean = sanitizeRichText(dirty);
    expect(clean).not.toMatch(/script|onclick|onerror|javascript:|iframe|<img/i);
    expect(clean).toContain("Hi");
  });
  it("keeps allowed formatting and hardens external links", () => {
    const clean = sanitizeRichText('<h2>T</h2><p><strong>b</strong> <a href="https://x.com">x</a></p>');
    expect(clean).toContain("<h2>T</h2>");
    expect(clean).toContain('rel="noopener noreferrer nofollow"');
  });
  it("sanitizes HTML inside blocks", () => {
    const [block] = sanitizeBlocks([{ id: "abcdef1", type: "rich", html: "<p>ok</p><script>x</script>" }]);
    expect(block.type === "rich" && block.html).toBe("<p>ok</p>");
  });
  it("estimates reading time", () => {
    const words = Array.from({ length: 660 }, () => "word").join(" ");
    expect(estimateReadingMinutes([{ id: "abcdef1", type: "rich", html: `<p>${words}</p>` }])).toBe(3);
  });
});

describe("employment dates", () => {
  it("counts months inclusively", () => {
    expect(monthsBetween("2021-02", "2023-12")).toBe(35);
  });
  it("formats ranges, current roles and unknown dates", () => {
    expect(employmentPeriod({ startDate: "2021-02", endDate: "2023-12", isCurrent: false })).toEqual({ range: "Feb 2021 – Dec 2023", duration: "2 yrs 11 mos" });
    expect(employmentPeriod({ startDate: "2025-04", endDate: "", isCurrent: true }, new Date("2025-06-15")).range).toBe("Apr 2025 – Present");
    expect(employmentPeriod({ startDate: "", endDate: "", isCurrent: false })).toEqual({ range: "", duration: "" });
  });
  it("sorts current roles first, then newest, undated last", () => {
    const list = [
      { isCurrent: false, startDate: "2021-02", sortOrder: 0, id: "a" },
      { isCurrent: false, startDate: "", sortOrder: 0, id: "b" },
      { isCurrent: true, startDate: "2025-04", sortOrder: 0, id: "c" },
      { isCurrent: false, startDate: "2024-01", sortOrder: 0, id: "d" },
    ].sort(compareExperience);
    expect(list.map((x) => x.id)).toEqual(["c", "d", "a", "b"]);
  });
});
