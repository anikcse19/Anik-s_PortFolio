import { describe, expect, it } from "vitest";
import { checkImageUrl, canOptimizeImage } from "@/lib/images";
import { isSafeHref, safeAdminRedirect } from "@/lib/urls";
import { experienceInputSchema, projectInputSchema } from "@/lib/validation/content";
import { homeConfigSchema, defaultHomeConfig, parseStoredSettings } from "@/lib/validation/settings";

describe("image URL validation", () => {
  it("accepts https URLs and /public paths", () => {
    expect(checkImageUrl("https://res.cloudinary.com/demo/image/upload/sample.jpg")).toMatchObject({ ok: true, kind: "remote" });
    expect(checkImageUrl("/p1.png")).toMatchObject({ ok: true, kind: "local" });
    expect(checkImageUrl("")).toEqual({ ok: true, kind: "empty" });
  });

  it("rejects unsafe or non-image URLs", () => {
    for (const bad of ["javascript:alert(1)", "data:image/png;base64,xx", "ftp://x.com/a.png", "//evil.com/a.png", "/../secret.png", "http://localhost/a.png", "http://192.168.1.2/a.png", "https://user:pw@example.com/a.png", "https://example.com/page.html", "example.com/a.png"]) {
      expect(checkImageUrl(bad).ok, bad).toBe(false);
    }
  });

  it("warns about insecure http images", () => {
    const res = checkImageUrl("http://example.com/a.png");
    expect(res.ok && res.kind === "remote" && res.warning).toBeTruthy();
  });

  it("only optimizes allow-listed https hosts and non-SVG local files", () => {
    expect(canOptimizeImage("https://i.imgur.com/a.png", ["i.imgur.com"])).toBe(true);
    expect(canOptimizeImage("https://evil.com/a.png", ["i.imgur.com"])).toBe(false);
    expect(canOptimizeImage("https://i.imgur.com/a.svg", ["i.imgur.com"])).toBe(false);
    expect(canOptimizeImage("/p1.png", [])).toBe(true);
  });
});

describe("link and redirect safety", () => {
  it("accepts site paths, anchors, https and mailto", () => {
    expect(isSafeHref("/projects")).toBe(true);
    expect(isSafeHref("#contact")).toBe(true);
    expect(isSafeHref("https://github.com/x")).toBe(true);
    expect(isSafeHref("mailto:a@b.co")).toBe(true);
  });
  it("rejects scripts and protocol-relative links", () => {
    for (const bad of ["javascript:alert(1)", "//evil.com", "/\\evil.com", "data:text/html,x", " "]) expect(isSafeHref(bad), bad).toBe(false);
  });
  it("only redirects inside /admin after login", () => {
    expect(safeAdminRedirect("/admin/projects")).toBe("/admin/projects");
    expect(safeAdminRedirect("https://evil.com")).toBe("/admin");
    expect(safeAdminRedirect("//evil.com/admin")).toBe("/admin");
    expect(safeAdminRedirect("/projects")).toBe("/admin");
    expect(safeAdminRedirect("/admin/login")).toBe("/admin");
  });
});

describe("content schemas", () => {
  const base = { title: "T", slug: "t", summary: "S", type: "personal" };
  it("requires alt text for images", () => {
    const res = projectInputSchema.safeParse({ ...base, coverImage: { url: "https://i.imgur.com/a.png", alt: "" } });
    expect(res.success).toBe(false);
  });
  it("rejects bad slugs and unsafe links", () => {
    expect(projectInputSchema.safeParse({ ...base, slug: "Bad Slug" }).success).toBe(false);
    expect(projectInputSchema.safeParse({ ...base, liveUrl: "javascript:alert(1)" }).success).toBe(false);
  });
  it("defaults new projects to draft", () => {
    expect(projectInputSchema.parse(base).status).toBe("draft");
  });
  it("validates experience date logic", () => {
    const e = { organization: "O", title: "T" };
    expect(experienceInputSchema.safeParse({ ...e, startDate: "2024-05", endDate: "2023-01" }).success).toBe(false);
    expect(experienceInputSchema.safeParse({ ...e, isCurrent: true, endDate: "2024-01", startDate: "2023-01" }).success).toBe(false);
    expect(experienceInputSchema.safeParse({ ...e, startDate: "2024-13" }).success).toBe(false);
    expect(experienceInputSchema.safeParse({ ...e }).success).toBe(true);
  });
  it("rejects duplicate homepage section types", () => {
    const config = defaultHomeConfig();
    config.sections.push({ ...config.sections[0] });
    expect(homeConfigSchema.safeParse(config).success).toBe(false);
  });
  it("repairs invalid stored settings field by field", () => {
    const appearance = parseStoredSettings("appearance", { accent: "neon-pink", writingEnabled: true });
    expect(appearance.accent).toBe("signal");
    expect(appearance.writingEnabled).toBe(true);
  });
});
