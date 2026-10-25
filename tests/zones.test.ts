import { describe, expect, it } from "vitest";
import { decideZone, safeZoneTarget, zoneForPath } from "@/lib/zones";

describe("zoneForPath", () => {
  it("puts the studio and its children in the studio zone", () => {
    expect(zoneForPath("/studio")).toBe("studio");
    expect(zoneForPath("/studio/work/rexvet")).toBe("studio");
  });

  it("puts every other public page in the portfolio zone", () => {
    for (const p of ["/", "/projects", "/projects/rexvet", "/about", "/contact", "/studios", "/studio-x"]) {
      expect(zoneForPath(p), p).toBe("portfolio");
    }
  });

  it("treats admin, the unlock screen, assets and metadata as neutral", () => {
    for (const p of ["/admin", "/admin/login", "/unlock", "/_next/static/x.js", "/robots.txt", "/sitemap.xml", "/p1.png", "/resume.pdf", "/icon.svg"]) {
      expect(zoneForPath(p), p).toBeNull();
    }
  });
});

describe("decideZone", () => {
  it("remembers the landing zone on the first visit", () => {
    expect(decideZone("/studio", undefined)).toEqual({ action: "remember", zone: "studio" });
    expect(decideZone("/", "garbage")).toEqual({ action: "remember", zone: "portfolio" });
  });

  it("lets visitors move freely inside their zone", () => {
    expect(decideZone("/studio/work", "studio")).toEqual({ action: "pass" });
    expect(decideZone("/projects", "portfolio")).toEqual({ action: "pass" });
  });

  it("gates crossing in both directions", () => {
    expect(decideZone("/studio", "portfolio")).toEqual({ action: "gate", from: "portfolio", to: "studio" });
    expect(decideZone("/", "studio")).toEqual({ action: "gate", from: "studio", to: "portfolio" });
    expect(decideZone("/about", "studio")).toEqual({ action: "gate", from: "studio", to: "portfolio" });
  });

  it("never gates neutral paths", () => {
    expect(decideZone("/admin", "studio")).toEqual({ action: "pass" });
    expect(decideZone("/unlock", "studio")).toEqual({ action: "pass" });
  });
});

describe("safeZoneTarget", () => {
  it("accepts internal zone paths with query strings", () => {
    expect(safeZoneTarget("/studio/work?x=1")).toEqual({ path: "/studio/work?x=1", zone: "studio" });
    expect(safeZoneTarget("/")).toEqual({ path: "/", zone: "portfolio" });
  });

  it("rejects open redirects, neutral paths and junk", () => {
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "/unlock", "/admin", "/../x", "", null, 42]) {
      expect(safeZoneTarget(bad), String(bad)).toBeNull();
    }
  });
});
