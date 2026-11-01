import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { canConnect, closeTestDatabase, useTestDatabase } from "./db";

const dbAvailable = await canConnect();

describe.skipIf(!dbAvailable)("password reset (MongoDB)", () => {
  let adminId = "";
  beforeAll(async () => {
    await useTestDatabase();
    const { AdminModel } = await import("@/lib/models");
    const admin = await AdminModel.create({ email: "reset-admin@example.com", name: "R", passwordHash: await hashPassword("Str0ng!Passw0rd") });
    adminId = admin._id.toString();
  });
  afterAll(closeTestDatabase);

  it("issues nothing for unknown emails and stores only the token hash", async () => {
    const { requestPasswordReset } = await import("@/lib/auth/password-reset");
    const { PasswordResetModel } = await import("@/lib/models");
    expect(await requestPasswordReset("nobody@example.com", "2.2.2.1")).toEqual({ ok: true, issued: null });

    const res = await requestPasswordReset(" Reset-Admin@Example.com ", "2.2.2.1");
    expect(res.ok && res.issued?.email).toBe("reset-admin@example.com");
    const token = res.ok && res.issued ? res.issued.token : "";
    expect(await PasswordResetModel.exists({ tokenHash: token })).toBeNull();
    expect(await PasswordResetModel.countDocuments({ adminId })).toBe(1);
  });

  it("only the newest link is valid, and it works exactly once", async () => {
    const { isResetTokenValid, requestPasswordReset, resetPasswordWithToken } = await import("@/lib/auth/password-reset");
    const { createSession, getAdminForToken } = await import("@/lib/auth/sessions");
    const { AdminModel } = await import("@/lib/models");

    const first = await requestPasswordReset("reset-admin@example.com", "2.2.2.2");
    const second = await requestPasswordReset("reset-admin@example.com", "2.2.2.2");
    const oldToken = first.ok && first.issued ? first.issued.token : "";
    const token = second.ok && second.issued ? second.issued.token : "";
    expect(await isResetTokenValid(oldToken)).toBe(false);
    expect(await isResetTokenValid(token)).toBe(true);

    expect(await resetPasswordWithToken(token, "short", "2.2.2.2")).toMatchObject({ ok: false, reason: "weak_password" });
    expect(await isResetTokenValid(token)).toBe(true);

    const session = await createSession(adminId);
    await new Promise((r) => setTimeout(r, 5));
    expect(await resetPasswordWithToken(token, "N3w!Passphrase", "2.2.2.2")).toEqual({ ok: true, adminId });
    const admin = await AdminModel.findById(adminId).select("+passwordHash").lean();
    expect(await verifyPassword("N3w!Passphrase", admin!.passwordHash)).toBe(true);
    expect(await getAdminForToken(session.token)).toBeNull();

    expect(await resetPasswordWithToken(token, "An0ther!Passphrase", "2.2.2.2")).toEqual({ ok: false, reason: "invalid_token" });
  });

  it("rejects expired links", async () => {
    const { isResetTokenValid, requestPasswordReset, resetPasswordWithToken } = await import("@/lib/auth/password-reset");
    const { PasswordResetModel } = await import("@/lib/models");
    const res = await requestPasswordReset("reset-admin@example.com", "2.2.2.3");
    const token = res.ok && res.issued ? res.issued.token : "";
    await PasswordResetModel.updateMany({ adminId }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await isResetTokenValid(token)).toBe(false);
    expect(await resetPasswordWithToken(token, "N3w!Passphrase2", "2.2.2.3")).toEqual({ ok: false, reason: "invalid_token" });
  });

  it("caps requests per account without revealing it", async () => {
    const { requestPasswordReset } = await import("@/lib/auth/password-reset");
    const { RateLimitModel } = await import("@/lib/models");
    await RateLimitModel.deleteMany({});
    const results = [];
    for (let i = 0; i < 4; i++) results.push(await requestPasswordReset("reset-admin@example.com", `3.3.3.${i}`));
    expect(results.slice(0, 3).every((r) => r.ok && r.issued)).toBe(true);
    expect(results[3]).toEqual({ ok: true, issued: null });
  });
});
