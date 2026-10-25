import { describe, expect, it } from "vitest";
import type { ProjectListItem, SiteSettings } from "@/lib/data/public";
import { buildSyncItems, fit, LIMITS, removedRecords, syncStatus, type SyncInput } from "@/lib/profile-sync";
import type { Experience, SkillCategory } from "@/lib/types";
import { defaultSettings, SETTINGS_KEYS } from "@/lib/validation/settings";

const ID_A = "a".repeat(24);
const ID_P = "b".repeat(24);

function input(overrides: Partial<{ experience: Experience[]; projects: ProjectListItem[] }> = {}): SyncInput {
  const base = Object.fromEntries(SETTINGS_KEYS.map((k) => [k, defaultSettings(k)])) as SiteSettings;
  const settings: SiteSettings = {
    ...base,
    contact: {
      ...base.contact,
      socials: [
        { kind: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/anik-deb/" },
        { kind: "github", label: "GitHub", url: "https://github.com/anikcse19" },
      ],
    },
  };
  return {
    settings,
    experience: overrides.experience ?? [
      { id: ID_A, title: "Senior Engineer", organization: "Acme", startDate: "2024-01", endDate: "", isCurrent: true, location: "Remote", workMode: "remote", employmentType: "full_time", summary: "Led the platform.", achievements: ["Cut p95 latency 40%"], technologies: ["Node.js", "TypeScript"] } as unknown as Experience,
    ],
    projects: overrides.projects ?? [
      { id: ID_P, slug: "shop", title: "Shop", summary: "A store.", featured: true, liveUrl: "https://shop.example", technologies: ["Next.js"], impact: [{ value: "2×", label: "conversion" }], outcomes: [], role: "Lead", category: "", year: "2025" } as unknown as ProjectListItem,
    ],
    skills: [{ id: "s", name: "Backend", skills: [{ name: "Node.js", level: null }, { name: "Kafka", level: "learning" }] }] as unknown as SkillCategory[],
    aboutText: ["I build reliable systems."],
    siteUrl: "https://anik.dev",
  };
}

const byKey = (items: ReturnType<typeof buildSyncItems>, key: string) => items.find((i) => i.key === key)!;

describe("buildSyncItems", () => {
  it("builds LinkedIn entries with the edit links for the profile's handle", () => {
    const items = buildSyncItems(input());
    const role = byKey(items, `linkedin:experience:${ID_A}`);
    expect(role.editUrl).toBe("https://www.linkedin.com/in/anik-deb/details/experience/");
    expect(role.fields.find((f) => f.label === "End date")?.value).toBe("I am currently working in this role");
    expect(role.fields.find((f) => f.label === "Description")?.value).toContain("• Cut p95 latency 40%");
    expect(byKey(items, `linkedin:project:${ID_P}`).fields.find((f) => f.label === "Description")?.value).toContain("Impact: 2× conversion");
    expect(byKey(items, "github:readme").editUrl).toBe("https://github.com/anikcse19/anikcse19/edit/main/README.md");
  });

  it("leaves learning skills out and keeps every field within its limit", () => {
    const items = buildSyncItems(input());
    expect(byKey(items, "linkedin:skills").fields[0].value).toBe("Node.js");
    for (const i of items) for (const f of i.fields) if (f.limit) expect(f.value.length, `${i.key} ${f.label}`).toBeLessThanOrEqual(f.limit);
  });

  it("changes an item's fingerprint only when its text changes", () => {
    const before = byKey(buildSyncItems(input()), `linkedin:experience:${ID_A}`);
    const same = byKey(buildSyncItems(input()), `linkedin:experience:${ID_A}`);
    const edited = byKey(
      buildSyncItems(input({ experience: [{ ...input().experience[0], achievements: ["Cut p95 latency 45%"] } as Experience] })),
      `linkedin:experience:${ID_A}`,
    );
    expect(same.hash).toBe(before.hash);
    expect(edited.hash).not.toBe(before.hash);
    expect(syncStatus(edited, { key: edited.key, hash: before.hash, syncedAt: "", title: "" })).toBe("changed");
    expect(syncStatus(before, { key: before.key, hash: before.hash, syncedAt: "", title: "" })).toBe("synced");
    expect(syncStatus(before, undefined)).toBe("new");
  });

  it("reports synced items that no longer exist on the site", () => {
    const items = buildSyncItems(input({ projects: [] }));
    const removed = removedRecords(items, [{ key: `linkedin:project:${ID_P}`, hash: "x", syncedAt: "", title: "Shop" }]);
    expect(removed.map((r) => r.title)).toEqual(["Shop"]);
  });
});

describe("fit", () => {
  it("trims on a word boundary with an ellipsis", () => {
    expect(fit("short", 10)).toBe("short");
    const out = fit("one two three four five six", 15);
    expect(out.length).toBeLessThanOrEqual(15);
    expect(out.endsWith("…")).toBe(true);
    expect(LIMITS.githubBio).toBe(160);
  });
});
