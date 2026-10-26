import type { SyncItem } from "@/lib/profile-sync";

/**
 * GitHub push support for the profile sync board: maps sync items to the REST
 * API's fields and diffs the current GitHub text against the site's.
 *
 * Pure module (no database, no network) so it is fully unit tested. The client
 * that talks to GitHub lives in lib/admin/github.ts.
 */

export const GITHUB_PUSH_KEYS = ["github:profile", "github:readme"] as const;
export type GithubPushKey = (typeof GITHUB_PUSH_KEYS)[number];

export function isGithubPushKey(key: string): key is GithubPushKey {
  return (GITHUB_PUSH_KEYS as readonly string[]).includes(key);
}

/** Sync field label → field name accepted by `PATCH /user`. */
export const GITHUB_PROFILE_FIELDS = { Bio: "bio", Company: "company", Location: "location", Website: "blog" } as const;
export type GithubProfileField = (typeof GITHUB_PROFILE_FIELDS)[keyof typeof GITHUB_PROFILE_FIELDS];
export type GithubProfile = Record<GithubProfileField, string>;

/**
 * The `PATCH /user` body for the profile item. Fields that are empty on the
 * site are left out, so pushing never clears something set on GitHub.
 */
export function profilePatch(item: SyncItem): Partial<GithubProfile> {
  const patch: Partial<GithubProfile> = {};
  for (const field of item.fields) {
    const name = GITHUB_PROFILE_FIELDS[field.label as keyof typeof GITHUB_PROFILE_FIELDS];
    if (name && field.value) patch[name] = field.value;
  }
  return patch;
}

export function readmeText(item: SyncItem): string {
  return item.fields[0]?.value ?? "";
}

export type ProfileChange = { label: string; field: GithubProfileField; current: string; next: string; changed: boolean };

/** Field-by-field comparison of GitHub's current profile with the patch that would be sent. */
export function profileChanges(current: GithubProfile, patch: Partial<GithubProfile>): ProfileChange[] {
  return (Object.entries(GITHUB_PROFILE_FIELDS) as [string, GithubProfileField][])
    .filter(([, field]) => patch[field] !== undefined)
    .map(([label, field]) => {
      const next = patch[field] ?? "";
      const now = current[field] ?? "";
      return { label, field, current: now, next, changed: now.trim() !== next.trim() };
    });
}

export type DiffLine = { kind: "same" | "add" | "remove"; text: string };

/** Line diff (longest common subsequence). Inputs are capped so a huge README can't stall the server. */
export function lineDiff(before: string, after: string, maxLines = 1500): DiffLine[] {
  const lines = (text: string) => (text ? normalizeNewlines(text).trimEnd().split("\n").slice(0, maxLines) : []);
  const a = lines(before);
  const b = lines(after);
  const n = a.length;
  const m = b.length;
  // lcs[i][j] = length of the LCS of a[i:] and b[j:]
  const lcs: Uint16Array[] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ kind: "same", text: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ kind: "remove", text: a[i++] });
    } else {
      out.push({ kind: "add", text: b[j++] });
    }
  }
  while (i < n) out.push({ kind: "remove", text: a[i++] });
  while (j < m) out.push({ kind: "add", text: b[j++] });
  return out;
}

export function normalizeNewlines(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}

/** README equality that ignores line endings and trailing whitespace at the end of the file. */
export function sameReadme(a: string, b: string): boolean {
  return normalizeNewlines(a).trimEnd() === normalizeNewlines(b).trimEnd();
}
