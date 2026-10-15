import { describe, expect, it, vi } from "vitest";

// No session cookie: every admin action must refuse before touching the database.
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, set: () => undefined }),
  headers: async () => new Headers(),
}));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn, updateTag: vi.fn(), revalidateTag: vi.fn() }));

const ID = "0123456789abcdef01234567";

describe("server actions require an authenticated admin", () => {
  it("rejects every admin action without a session", async () => {
    const content = await import("@/app/admin/_actions/content");
    const settings = await import("@/app/admin/_actions/settings");
    const account = await import("@/app/admin/_actions/account");
    const messages = await import("@/app/admin/_actions/messages");

    const calls = [
      () => content.saveDocumentAction("projects", null, {}),
      () => content.saveDocumentAction("projects", ID, {}),
      () => content.setStatusAction("projects", ID, "published"),
      () => content.deleteDocumentAction("projects", ID),
      () => content.moveDocumentAction("projects", ID, "up"),
      () => content.listPickerItemsAction("projects"),
      () => content.getDocumentAction("projects", ID),
      () => content.listMediaAction(),
      () => settings.saveSettingsAction("profile", {}),
      () => settings.saveHomepageDraftAction({}),
      () => settings.publishHomepageAction({}),
      () => settings.discardHomepageDraftAction(),
      () => account.changePasswordAction({}),
      () => account.updateAccountAction({}),
      () => account.signOutOtherSessionsAction(),
      () => account.checkLinksAction(),
      () => messages.setMessageReadAction(ID, true),
      () => messages.deleteMessageAction(ID),
    ];

    for (const call of calls) {
      const res = await call();
      expect(res).toMatchObject({ ok: false, code: "UNAUTHORIZED" });
    }
  });
});
