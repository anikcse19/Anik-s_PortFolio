import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hashPassword, validatePasswordStrength, verifyPassword } from "@/lib/auth/password";
import { canConnect, closeTestDatabase, useTestDatabase } from "./db";

describe("password hashing", () => {
  it("hashes with a per-password salt and verifies", async () => {
    const a = await hashPassword("correct horse battery staple");
    const b = await hashPassword("correct horse battery staple");
    expect(a).not.toBe(b);
    expect(a.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse battery staple", a)).toBe(true);
    expect(await verifyPassword("wrong", a)).toBe(false);
    expect(await verifyPassword("x", "garbage")).toBe(false);
  });
  it("rejects weak passwords", () => {
    expect(validatePasswordStrength("short")).not.toBeNull();
    expect(validatePasswordStrength("aaaaaaaaaaaaaa")).not.toBeNull();
    expect(validatePasswordStrength("Str0ng!Passw0rd")).toBeNull();
  });
});

const dbAvailable = await canConnect();

describe.skipIf(!dbAvailable)("sessions and login (MongoDB)", () => {
  let adminId = "";
  beforeAll(async () => {
    await useTestDatabase();
    const { AdminModel } = await import("@/lib/models");
    const admin = await AdminModel.create({ email: "a@example.com", name: "A", passwordHash: await hashPassword("Str0ng!Passw0rd") });
    adminId = admin._id.toString();
  });
  afterAll(closeTestDatabase);

  it("creates sessions and stores only the token hash", async () => {
    const { createSession, getAdminForToken } = await import("@/lib/auth/sessions");
    const { SessionModel } = await import("@/lib/models");
    const { token } = await createSession(adminId);
    expect(await SessionModel.exists({ tokenHash: token })).toBeNull();
    expect((await getAdminForToken(token))?.email).toBe("a@example.com");
    expect(await getAdminForToken("not-a-real-token-value-xxxxxxxx")).toBeNull();
    expect(await getAdminForToken(undefined)).toBeNull();
  });

  it("invalidates sessions on logout and after a password change", async () => {
    const { createSession, deleteSessionByToken, getAdminForToken } = await import("@/lib/auth/sessions");
    const { AdminModel } = await import("@/lib/models");
    const first = await createSession(adminId);
    await deleteSessionByToken(first.token);
    expect(await getAdminForToken(first.token)).toBeNull();

    const second = await createSession(adminId);
    await new Promise((r) => setTimeout(r, 5));
    await AdminModel.updateOne({ _id: adminId }, { $set: { passwordChangedAt: new Date() } });
    expect(await getAdminForToken(second.token)).toBeNull();
  });

  it("rejects bad credentials identically and rate-limits by account", async () => {
    const { verifyLogin } = await import("@/lib/auth/sessions");
    expect(await verifyLogin("nobody@example.com", "x", "1.1.1.1")).toEqual({ ok: false, reason: "invalid" });
    expect(await verifyLogin("a@example.com", "wrong", "1.1.1.2")).toEqual({ ok: false, reason: "invalid" });
    for (let i = 0; i < 5; i++) await verifyLogin("a@example.com", "wrong", `2.2.2.${i}`);
    const limited = await verifyLogin("a@example.com", "Str0ng!Passw0rd", "3.3.3.3");
    expect(limited.ok).toBe(false);
    expect(!limited.ok && limited.reason).toBe("rate_limited");
  });
});
