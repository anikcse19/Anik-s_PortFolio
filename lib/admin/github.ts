import "server-only";
import { getGithubToken, getSiteUrl } from "@/lib/env";
import { isPrivateHostname } from "@/lib/urls";
import {
  isGithubPushKey,
  lineDiff,
  profileChanges,
  profilePatch,
  readmeText,
  sameReadme,
  type DiffLine,
  type GithubProfile,
  type GithubPushKey,
  type ProfileChange,
} from "@/lib/github";
import { ConflictError, NotFoundError, ValidationError } from "./errors";
import { getSyncBoard, markSynced, type SyncBoardItem } from "./sync";

/**
 * Pushes the GitHub sync items (profile fields and profile README) with the
 * REST API. Called only from admin actions. The text written is always rebuilt
 * here from published content; the client only names the item and the
 * fingerprint it reviewed, so a stale review can't be pushed.
 *
 * Pinned repositories have no API and stay manual.
 */

const API = "https://api.github.com";
const TIMEOUT_MS = 10_000;
const README_COMMIT_MESSAGE = "docs: update profile README from portfolio";

const PERMISSION_HINT = {
  profile: "Give the token the account permission “Profile: Read and write”.",
  readme: "Give the token access to the profile repository with “Contents: Read and write”.",
} as const;

type GithubUser = { login: string; bio: string | null; company: string | null; location: string | null; blog: string | null };
type GithubReadme = { path: string; sha: string; content: string; encoding: string };

class GithubHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly rateLimited: boolean,
  ) {
    super(`GitHub API responded ${status}`);
    this.name = "GithubHttpError";
  }
}

function requireToken(): string {
  const token = getGithubToken();
  if (!token) throw new ValidationError("GitHub isn't connected. Set GITHUB_TOKEN in the environment and redeploy.");
  return token;
}

async function github<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      method: init.method ?? "GET",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${requireToken()}`,
        "x-github-api-version": "2022-11-28",
        "user-agent": "PortfolioProfileSync/1.0",
        ...(init.body ? { "content-type": "application/json" } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError("Couldn't reach GitHub. Check your connection and try again.");
  }
  if (!res.ok) throw new GithubHttpError(res.status, res.headers.get("x-ratelimit-remaining") === "0");
  return (await res.json()) as T;
}

/** Turns HTTP failures into messages the admin can act on. Never includes the token or response bodies. */
function explain(error: unknown, scope: keyof typeof PERMISSION_HINT): never {
  if (!(error instanceof GithubHttpError)) throw error;
  if (error.rateLimited) throw new ValidationError("GitHub's rate limit was reached. Try again in a few minutes.");
  if (error.status === 401) throw new ValidationError("GitHub rejected the token: it's invalid or expired. Create a new one and update GITHUB_TOKEN.");
  if (error.status === 403) throw new ValidationError(`The token isn't allowed to do this. ${PERMISSION_HINT[scope]}`);
  if (error.status === 409) throw new ConflictError("The README changed on GitHub while you were reviewing it. Review the changes again.");
  if (error.status === 422) throw new ValidationError("GitHub rejected the update as invalid. Check the text for unsupported values.");
  throw new ValidationError(`GitHub returned an error (${error.status}). Try again later.`);
}

async function getViewer(siteUser: string): Promise<GithubUser> {
  const user = await github<GithubUser>("/user").catch((e) => explain(e, "profile"));
  if (siteUser && siteUser.toLowerCase() !== user.login.toLowerCase()) {
    throw new ConflictError(`The token belongs to @${user.login}, but your site links to @${siteUser}. Use a token for @${siteUser} or fix the GitHub link in Contact.`);
  }
  return user;
}

/** The profile README of `login` (repository `login/login`), or null when the repository or file doesn't exist. */
async function getReadme(login: string): Promise<{ repoExists: boolean; file: GithubReadme | null }> {
  const repo = `/repos/${encodeURIComponent(login)}/${encodeURIComponent(login)}`;
  try {
    return { repoExists: true, file: await github<GithubReadme>(`${repo}/readme`) };
  } catch (error) {
    if (!(error instanceof GithubHttpError) || error.status !== 404) explain(error, "readme");
  }
  // 404 for the README: find out whether the repository itself is missing (or hidden from the token).
  try {
    await github(repo);
    return { repoExists: true, file: null };
  } catch (error) {
    if (error instanceof GithubHttpError && error.status === 404) return { repoExists: false, file: null };
    explain(error, "readme");
  }
}

function decode(file: GithubReadme): string {
  return file.encoding === "base64" ? Buffer.from(file.content, "base64").toString("utf8") : file.content;
}

function profileOf(user: GithubUser): GithubProfile {
  return { bio: user.bio ?? "", company: user.company ?? "", location: user.location ?? "", blog: user.blog ?? "" };
}

async function loadItem(key: string, hash?: string): Promise<{ item: SyncBoardItem; siteUser: string }> {
  if (!isGithubPushKey(key)) throw new ValidationError("This item can't be pushed to GitHub.");
  const { items, githubUser } = await getSyncBoard();
  const item = items.find((i) => i.key === key);
  if (!item) throw new NotFoundError("This item no longer exists on your site.");
  if (hash !== undefined && item.hash !== hash) throw new ConflictError("Your site content changed since you reviewed it. Review the changes again.");
  return { item, siteUser: githubUser };
}

export type GithubPreview = {
  key: GithubPushKey;
  /** Fingerprint of the reviewed text; pushing requires it to still match. */
  hash: string;
  login: string;
  upToDate: boolean;
  profile?: ProfileChange[];
  readme?: { repo: string; path: string; repoExists: boolean; fileExists: boolean; diff: DiffLine[] };
};

export async function previewGithub(key: string): Promise<GithubPreview> {
  const { item, siteUser } = await loadItem(key);
  const user = await getViewer(siteUser);
  const base = { key: item.key as GithubPushKey, hash: item.hash, login: user.login };

  if (item.key === "github:profile") {
    const changes = profileChanges(profileOf(user), profilePatch(item));
    return { ...base, profile: changes, upToDate: changes.every((c) => !c.changed) };
  }

  const { repoExists, file } = await getReadme(user.login);
  const current = file ? decode(file) : "";
  const next = readmeText(item);
  return {
    ...base,
    upToDate: Boolean(file) && sameReadme(current, next),
    readme: { repo: `${user.login}/${user.login}`, path: file?.path ?? "README.md", repoExists, fileExists: Boolean(file), diff: lineDiff(current, next) },
  };
}

/** Writes the item to GitHub (skipping the write when GitHub already matches), then marks it as synced. */
export async function pushGithub(key: string, hash: string): Promise<{ changed: boolean }> {
  // The text links to the site; never publish a localhost URL from a local server.
  if (isPrivateHostname(new URL(getSiteUrl()).hostname)) {
    throw new ValidationError(`Your site URL is ${getSiteUrl()}, which would be published to GitHub. Set SITE_URL to your public domain first.`);
  }
  const { item, siteUser } = await loadItem(key, hash);
  const user = await getViewer(siteUser);
  let changed = false;

  if (item.key === "github:profile") {
    const patch = profilePatch(item);
    changed = profileChanges(profileOf(user), patch).some((c) => c.changed);
    if (changed) await github("/user", { method: "PATCH", body: patch }).catch((e) => explain(e, "profile"));
  } else {
    const { repoExists, file } = await getReadme(user.login);
    if (!repoExists) {
      throw new ValidationError(`The repository ${user.login}/${user.login} doesn't exist, or the token can't see it. Create it as a public repository on GitHub (it's what shows the README on your profile), then try again.`);
    }
    const next = readmeText(item);
    changed = !file || !sameReadme(decode(file), next);
    if (changed) {
      const path = (file?.path ?? "README.md").split("/").map(encodeURIComponent).join("/");
      await github(`/repos/${encodeURIComponent(user.login)}/${encodeURIComponent(user.login)}/contents/${path}`, {
        method: "PUT",
        body: { message: README_COMMIT_MESSAGE, content: Buffer.from(`${next}\n`, "utf8").toString("base64"), ...(file ? { sha: file.sha } : {}) },
      }).catch((e) => explain(e, "readme"));
    }
  }

  await markSynced([{ key: item.key, hash: item.hash, title: item.title }]);
  return { changed };
}
