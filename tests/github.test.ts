import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SyncBoardItem } from "@/lib/admin/sync";
import { lineDiff, profileChanges, profilePatch, sameReadme } from "@/lib/github";

const profileItem: SyncBoardItem = {
  key: "github:profile",
  channel: "github",
  group: "Profile",
  title: "Profile details",
  fields: [
    { label: "Bio", value: "Senior Engineer · Node.js" },
    { label: "Location", value: "Dhaka" },
    { label: "Website", value: "https://anik.dev" },
  ],
  hash: "h1",
  status: "changed",
  syncedAt: null,
};
const readmeItem: SyncBoardItem = { ...profileItem, key: "github:readme", title: "Profile README", fields: [{ label: "README.md", value: "# Hi\n\nNew line", multiline: true }], hash: "h2" };

const markSynced = vi.fn();
vi.mock("@/lib/admin/sync", () => ({
  getSyncBoard: async () => ({ items: [profileItem, readmeItem], removed: [], githubUser: "anikcse19" }),
  markSynced: (...args: unknown[]) => markSynced(...args),
}));

describe("profilePatch / profileChanges", () => {
  it("maps site fields to API fields and never sends empty ones", () => {
    const patch = profilePatch(profileItem);
    expect(patch).toEqual({ bio: "Senior Engineer · Node.js", location: "Dhaka", blog: "https://anik.dev" });
    const changes = profileChanges({ bio: "Old bio", company: "@Acme", location: "Dhaka", blog: "" }, patch);
    expect(changes.map((c) => [c.field, c.changed])).toEqual([
      ["bio", true],
      ["location", false],
      ["blog", true],
    ]);
  });
});

describe("lineDiff", () => {
  it("marks removed, added and unchanged lines", () => {
    expect(lineDiff("a\nb\nc", "a\nB\nc\nd")).toEqual([
      { kind: "same", text: "a" },
      { kind: "remove", text: "b" },
      { kind: "add", text: "B" },
      { kind: "same", text: "c" },
      { kind: "add", text: "d" },
    ]);
  });

  it("treats a missing file as all additions and ignores line endings", () => {
    expect(lineDiff("", "x\ny").map((l) => l.kind)).toEqual(["add", "add"]);
    expect(lineDiff("x\r\ny\n", "x\ny").every((l) => l.kind === "same")).toBe(true);
    expect(sameReadme("x\r\ny\n\n", "x\ny")).toBe(true);
  });
});

type Call = { method: string; url: string; body?: Record<string, unknown> };

describe("GitHub client", () => {
  let calls: Call[];
  let routes: Record<string, () => Response>;
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  const user = { login: "anikcse19", bio: "Old bio", company: null, location: "Dhaka", blog: "" };

  beforeEach(() => {
    vi.stubEnv("GITHUB_TOKEN", "test-token");
    vi.stubEnv("SITE_URL", "https://anik.dev");
    markSynced.mockClear();
    calls = [];
    routes = {
      "GET /user": () => json(user),
      "PATCH /user": () => json(user),
      "GET /repos/anikcse19/anikcse19/readme": () => json({ path: "README.md", sha: "abc", encoding: "base64", content: Buffer.from("# Hi\n\nOld line\n").toString("base64") }),
      "PUT /repos/anikcse19/anikcse19/contents/README.md": () => json({}),
    };
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      const path = url.replace("https://api.github.com", "");
      const method = init.method ?? "GET";
      calls.push({ method, url: path, body: init.body ? JSON.parse(String(init.body)) : undefined });
      expect((init.headers as Record<string, string>).authorization).toBe("Bearer test-token");
      return (routes[`${method} ${path}`] ?? (() => json({ message: "Not Found" }, 404)))();
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("previews the README as a diff without writing anything", async () => {
    const { previewGithub } = await import("@/lib/admin/github");
    const preview = await previewGithub("github:readme");
    expect(preview.upToDate).toBe(false);
    expect(preview.readme?.diff.filter((l) => l.kind !== "same")).toEqual([
      { kind: "remove", text: "Old line" },
      { kind: "add", text: "New line" },
    ]);
    expect(calls.every((c) => c.method === "GET")).toBe(true);
  });

  it("patches only the profile fields set on the site, then marks the item synced", async () => {
    const { pushGithub } = await import("@/lib/admin/github");
    await expect(pushGithub("github:profile", "h1")).resolves.toEqual({ changed: true });
    expect(calls.find((c) => c.method === "PATCH")?.body).toEqual({ bio: "Senior Engineer · Node.js", location: "Dhaka", blog: "https://anik.dev" });
    expect(markSynced).toHaveBeenCalledWith([{ key: "github:profile", hash: "h1", title: "Profile details" }]);
  });

  it("updates the README with the current sha", async () => {
    const { pushGithub } = await import("@/lib/admin/github");
    await pushGithub("github:readme", "h2");
    const put = calls.find((c) => c.method === "PUT");
    expect(put?.body?.sha).toBe("abc");
    expect(Buffer.from(String(put?.body?.content), "base64").toString()).toBe("# Hi\n\nNew line\n");
  });

  it("skips the write when GitHub already matches", async () => {
    routes["GET /user"] = () => json({ ...user, bio: "Senior Engineer · Node.js", blog: "https://anik.dev" });
    const { pushGithub } = await import("@/lib/admin/github");
    await expect(pushGithub("github:profile", "h1")).resolves.toEqual({ changed: false });
    expect(calls.some((c) => c.method === "PATCH")).toBe(false);
    expect(markSynced).toHaveBeenCalled();
  });

  it("refuses stale reviews, a token for another account, and missing repositories", async () => {
    const { pushGithub } = await import("@/lib/admin/github");
    await expect(pushGithub("github:profile", "stale")).rejects.toThrow(/changed since you reviewed/);

    routes["GET /user"] = () => json({ ...user, login: "someone-else" });
    await expect(pushGithub("github:profile", "h1")).rejects.toThrow(/belongs to @someone-else/);

    routes["GET /user"] = () => json(user);
    delete routes["GET /repos/anikcse19/anikcse19/readme"];
    await expect(pushGithub("github:readme", "h2")).rejects.toThrow(/doesn't exist/);
    expect(calls.some((c) => c.method !== "GET")).toBe(false);
    expect(markSynced).not.toHaveBeenCalled();
  });

  it("explains permission and token errors without leaking the token", async () => {
    routes["PATCH /user"] = () => json({ message: "Resource not accessible by personal access token" }, 403);
    const { pushGithub } = await import("@/lib/admin/github");
    await expect(pushGithub("github:profile", "h1")).rejects.toThrow(/Profile: Read and write/);

    routes["GET /user"] = () => json({ message: "Bad credentials" }, 401);
    const error = await pushGithub("github:profile", "h1").catch((e: Error) => e);
    expect(String(error)).toMatch(/invalid or expired/);
    expect(String(error)).not.toContain("test-token");
    expect(markSynced).not.toHaveBeenCalled();
  });

  it("never publishes a localhost site URL", async () => {
    vi.stubEnv("SITE_URL", "http://localhost:3000");
    const { pushGithub } = await import("@/lib/admin/github");
    await expect(pushGithub("github:readme", "h2")).rejects.toThrow(/Set SITE_URL/);
    expect(calls).toEqual([]);
  });

  it("requires a token", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");
    const { previewGithub } = await import("@/lib/admin/github");
    await expect(previewGithub("github:profile")).rejects.toThrow(/GITHUB_TOKEN/);
    expect(calls).toEqual([]);
  });
});
