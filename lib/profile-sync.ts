import type { ProjectListItem, SiteSettings } from "@/lib/data/public";
import { formatYearMonth } from "@/lib/dates";
import type { Experience, SkillCategory } from "@/lib/types";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/validation/content";

/**
 * Profile sync: the site's content is the source of truth. For channels that
 * can't be updated automatically (LinkedIn, GitHub for now), this builds the
 * exact text to paste, and tracks whether it changed since it was last synced.
 *
 * Pure module (no database, no Node APIs) so it is fully unit tested.
 */

export type SyncChannel = "linkedin" | "github";
export const SYNC_CHANNEL_LABELS: Record<SyncChannel, string> = { linkedin: "LinkedIn", github: "GitHub" };

/**
 * Field limits as published by LinkedIn and GitHub at the time of writing.
 * If a platform changes them, update the numbers here.
 */
export const LIMITS = {
  linkedinHeadline: 220,
  linkedinAbout: 2600,
  linkedinPositionTitle: 100,
  linkedinDescription: 2000,
  linkedinProjectName: 255,
  linkedinSkillsPerEntry: 5,
  linkedinSkillsTotal: 100,
  githubBio: 160,
} as const;

export type SyncField = { label: string; value: string; limit?: number; multiline?: boolean };

export type SyncItem = {
  /** Stable identity, e.g. "linkedin:experience:<id>". */
  key: string;
  channel: SyncChannel;
  group: "Profile" | "Experience" | "Projects" | "Skills";
  title: string;
  subtitle?: string;
  fields: SyncField[];
  editUrl?: string;
  /** Fingerprint of the field values; a change means the channel is out of date. */
  hash: string;
};

export type SyncRecord = { key: string; hash: string; syncedAt: string; title: string };
export type SyncStatus = "synced" | "changed" | "new";

/** Small deterministic string hash (FNV-1a, 53-bit). Change detection only, not security. */
export function fingerprint(value: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x5bd1e995);
  }
  return ((h2 >>> 0) * 0x200000 + ((h1 >>> 0) & 0x1fffff)).toString(36);
}

function item(base: Omit<SyncItem, "hash">): SyncItem {
  return { ...base, hash: fingerprint(JSON.stringify(base.fields.map((f) => [f.label, f.value]))) };
}

/** Trims to a limit on a word boundary, adding an ellipsis, so pasted text is never rejected. */
export function fit(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > limit * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

function bullets(lines: string[]): string {
  return lines.map((l) => `• ${l}`).join("\n");
}

function joinBlocks(blocks: (string | false | null | undefined)[]): string {
  return blocks.filter((b): b is string => Boolean(b && b.trim())).join("\n\n");
}

/** Path part of a social profile URL, e.g. "anik-deb" from https://www.linkedin.com/in/anik-deb/. */
function handleFrom(url: string | undefined, pattern: RegExp): string {
  if (!url) return "";
  const match = pattern.exec(url);
  return match ? match[1] : "";
}

const WORK_MODE_LABELS: Record<string, string> = { remote: "Remote", onsite: "On-site", hybrid: "Hybrid" };

export type SyncInput = {
  settings: SiteSettings;
  experience: Experience[];
  projects: ProjectListItem[];
  skills: SkillCategory[];
  /** Plain-text About sections (HTML already stripped by the caller). */
  aboutText: string[];
  siteUrl: string;
};

export function buildSyncItems(input: SyncInput): SyncItem[] {
  const { settings, experience, projects, aboutText, siteUrl } = input;
  const { profile, contact, appearance } = settings;
  const linkedinUrl = contact.socials.find((s) => s.kind === "linkedin")?.url;
  const githubUrl = contact.socials.find((s) => s.kind === "github")?.url;
  const linkedinHandle = handleFrom(linkedinUrl, /linkedin\.com\/in\/([^/?#]+)/i);
  const githubUser = handleFrom(githubUrl, /github\.com\/([^/?#]+)/i);
  const linkedinBase = linkedinHandle ? `https://www.linkedin.com/in/${linkedinHandle}` : undefined;

  const skillNames = input.skills.flatMap((c) => c.skills.filter((s) => appearance.showLearningSkills || s.level !== "learning").map((s) => s.name));
  const topStack = skillNames.slice(0, 6);
  const current = experience.find((e) => e.isCurrent);
  const items: SyncItem[] = [];

  /* ------------------------------------------------------------- LinkedIn */

  items.push(
    item({
      key: "linkedin:headline",
      channel: "linkedin",
      group: "Profile",
      title: "Headline",
      fields: [{ label: "Headline", value: fit([profile.title, topStack.slice(0, 4).join(" · "), current ? `${current.title} at ${current.organization}` : ""].filter(Boolean).join(" | "), LIMITS.linkedinHeadline), limit: LIMITS.linkedinHeadline }],
      editUrl: linkedinBase,
    }),
  );

  items.push(
    item({
      key: "linkedin:about",
      channel: "linkedin",
      group: "Profile",
      title: "About",
      fields: [
        {
          label: "About",
          multiline: true,
          limit: LIMITS.linkedinAbout,
          value: fit(
            joinBlocks([profile.positioning, ...aboutText, topStack.length ? `Core stack: ${skillNames.slice(0, 12).join(", ")}.` : "", `Portfolio and case studies: ${siteUrl}`]),
            LIMITS.linkedinAbout,
          ),
        },
      ],
      editUrl: linkedinBase,
    }),
  );

  for (const e of experience) {
    const description = joinBlocks([e.summary, e.achievements.length ? bullets(e.achievements) : ""]);
    items.push(
      item({
        key: `linkedin:experience:${e.id}`,
        channel: "linkedin",
        group: "Experience",
        title: `${e.title} — ${e.organization}`,
        subtitle: [formatYearMonth(e.startDate), e.isCurrent ? "Present" : formatYearMonth(e.endDate)].filter(Boolean).join(" – "),
        fields: [
          { label: "Title", value: fit(e.title, LIMITS.linkedinPositionTitle), limit: LIMITS.linkedinPositionTitle },
          { label: "Company", value: e.organization },
          { label: "Employment type", value: e.employmentType ? EMPLOYMENT_TYPE_LABELS[e.employmentType] : "" },
          { label: "Location", value: e.location },
          { label: "Location type", value: e.workMode ? (WORK_MODE_LABELS[e.workMode] ?? "") : "" },
          { label: "Start date", value: formatYearMonth(e.startDate) },
          { label: "End date", value: e.isCurrent ? "I am currently working in this role" : formatYearMonth(e.endDate) },
          { label: "Description", value: fit(description, LIMITS.linkedinDescription), limit: LIMITS.linkedinDescription, multiline: true },
          { label: "Skills", value: e.technologies.slice(0, LIMITS.linkedinSkillsPerEntry).join(", ") },
        ].filter((f) => f.value),
        editUrl: linkedinBase ? `${linkedinBase}/details/experience/` : undefined,
      }),
    );
  }

  for (const p of projects) {
    const impact = (p.impact ?? []).map((m) => `${m.value} ${m.label}`).join(" · ");
    const description = joinBlocks([p.summary, impact ? `Impact: ${impact}` : "", (p.outcomes ?? []).length ? bullets(p.outcomes ?? []) : "", p.role ? `My role: ${p.role}` : ""]);
    items.push(
      item({
        key: `linkedin:project:${p.id}`,
        channel: "linkedin",
        group: "Projects",
        title: p.title,
        subtitle: [p.category, p.year].filter(Boolean).join(" · "),
        fields: [
          { label: "Project name", value: fit(p.title, LIMITS.linkedinProjectName), limit: LIMITS.linkedinProjectName },
          { label: "Description", value: fit(description, LIMITS.linkedinDescription), limit: LIMITS.linkedinDescription, multiline: true },
          { label: "Project URL", value: p.liveUrl || `${siteUrl}/projects/${p.slug}` },
          { label: "Skills", value: p.technologies.slice(0, LIMITS.linkedinSkillsPerEntry).join(", ") },
        ],
        editUrl: linkedinBase ? `${linkedinBase}/details/projects/` : undefined,
      }),
    );
  }

  if (skillNames.length) {
    items.push(
      item({
        key: "linkedin:skills",
        channel: "linkedin",
        group: "Skills",
        title: "Skills",
        subtitle: `${Math.min(skillNames.length, LIMITS.linkedinSkillsTotal)} skills`,
        fields: [{ label: "Skills (one per line)", value: skillNames.slice(0, LIMITS.linkedinSkillsTotal).join("\n"), multiline: true }],
        editUrl: linkedinBase ? `${linkedinBase}/details/skills/` : undefined,
      }),
    );
  }

  /* --------------------------------------------------------------- GitHub */

  items.push(
    item({
      key: "github:profile",
      channel: "github",
      group: "Profile",
      title: "Profile details",
      fields: [
        { label: "Bio", value: fit([profile.title, topStack.slice(0, 4).join(", ")].filter(Boolean).join(" · "), LIMITS.githubBio), limit: LIMITS.githubBio },
        { label: "Company", value: current ? `@${current.organization}` : "" },
        { label: "Location", value: profile.location },
        { label: "Website", value: siteUrl },
      ].filter((f) => f.value),
      editUrl: "https://github.com/settings/profile",
    }),
  );

  const featured = projects.filter((p) => p.featured);
  const readmeProjects = (featured.length ? featured : projects).slice(0, 4);
  const readme = [
    `# Hi, I'm ${profile.name.split(" ")[0]} 👋`,
    "",
    `**${profile.title}**${profile.location ? ` · ${profile.location}` : ""}`,
    "",
    profile.positioning,
    "",
    ...(current ? [`- 💼 Currently: ${current.title} at ${current.organization}`] : []),
    `- 🌐 Portfolio: ${siteUrl}`,
    ...(linkedinUrl ? [`- 🔗 LinkedIn: ${linkedinUrl}`] : []),
    ...(contact.email ? [`- 📫 ${contact.email}`] : []),
    "",
    ...(topStack.length ? ["### Stack", "", skillNames.slice(0, 16).map((s) => `\`${s}\``).join(" "), ""] : []),
    ...(readmeProjects.length
      ? ["### Selected work", "", ...readmeProjects.map((p) => `- **[${p.title}](${p.liveUrl || `${siteUrl}/projects/${p.slug}`})** — ${p.summary}`), ""]
      : []),
  ].join("\n");

  items.push(
    item({
      key: "github:readme",
      channel: "github",
      group: "Profile",
      title: "Profile README",
      subtitle: githubUser ? `${githubUser}/${githubUser} · README.md` : "README.md in a public repository named after your username",
      fields: [{ label: "README.md", value: readme.trim(), multiline: true }],
      editUrl: githubUser ? `https://github.com/${githubUser}/${githubUser}/edit/main/README.md` : undefined,
    }),
  );

  return items;
}

export function syncStatus(item: SyncItem, record: SyncRecord | undefined): SyncStatus {
  if (!record) return "new";
  return record.hash === item.hash ? "synced" : "changed";
}

/** Records whose item no longer exists on the site: remove them from the channel too. */
export function removedRecords(items: SyncItem[], records: SyncRecord[]): SyncRecord[] {
  const keys = new Set(items.map((i) => i.key));
  return records.filter((r) => !keys.has(r.key));
}
