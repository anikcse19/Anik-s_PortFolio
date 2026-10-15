"use server";

import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { ValidationError } from "@/lib/admin/errors";
import { checkLinks, type LinkCheckResult } from "@/lib/admin/link-check";
import { hmac } from "@/lib/auth/crypto";
import { hashPassword, PASSWORD_MAX_LENGTH, validatePasswordStrength, verifyPassword } from "@/lib/auth/password";
import { consumeRateLimit, RATE_LIMITS } from "@/lib/auth/rate-limit";
import { getSessionToken, getUserAgent, setSessionCookie } from "@/lib/auth/session";
import { createSession, deleteOtherSessions } from "@/lib/auth/sessions";
import { connectDB, isDuplicateKeyError } from "@/lib/db";
import { AdminModel } from "@/lib/models";
import type { ActionResult } from "@/lib/types";

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password").max(PASSWORD_MAX_LENGTH),
  newPassword: z.string().max(PASSWORD_MAX_LENGTH),
  confirmPassword: z.string().max(PASSWORD_MAX_LENGTH),
});

async function assertCurrentPassword(adminId: string, password: string): Promise<void> {
  const limit = await consumeRateLimit(`reauth:${hmac(adminId)}`, 5, 15 * 60);
  if (!limit.allowed) throw new ValidationError("Too many attempts. Try again in a few minutes.");
  await connectDB();
  const admin = await AdminModel.findById(adminId).select("+passwordHash").lean();
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    throw new ValidationError("Current password is incorrect.", { currentPassword: "Current password is incorrect" });
  }
}

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  return adminAction(async (admin) => {
    const parsed = passwordChangeSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Please fill in all fields.");
    const { currentPassword, newPassword, confirmPassword } = parsed.data;
    if (newPassword !== confirmPassword) {
      throw new ValidationError("The new passwords do not match.", { confirmPassword: "Passwords do not match" });
    }
    const weakness = validatePasswordStrength(newPassword, admin.email);
    if (weakness) throw new ValidationError(weakness, { newPassword: weakness });
    await assertCurrentPassword(admin.id, currentPassword);

    const passwordHash = await hashPassword(newPassword);
    const changedAt = new Date();
    await AdminModel.updateOne({ _id: admin.id }, { $set: { passwordHash, passwordChangedAt: changedAt } });
    // Every existing session (including this one) is now invalid; issue a fresh one for this browser.
    await deleteOtherSessions(admin.id);
    const { token, expiresAt } = await createSession(admin.id, await getUserAgent());
    await setSessionCookie(token, expiresAt);
    return undefined;
  }, "Password changed. Other devices have been signed out.");
}

const accountSchema = z.object({
  name: z.string().trim().max(80),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  currentPassword: z.string().max(PASSWORD_MAX_LENGTH),
});

export async function updateAccountAction(input: unknown): Promise<ActionResult> {
  return adminAction(async (admin) => {
    const parsed = accountSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Enter a valid email address.", { email: "Enter a valid email address" });
    const { name, email, currentPassword } = parsed.data;
    if (email !== admin.email) {
      if (!currentPassword) throw new ValidationError("Confirm your password to change the sign-in email.", { currentPassword: "Required to change email" });
      await assertCurrentPassword(admin.id, currentPassword);
    }
    try {
      await AdminModel.updateOne({ _id: admin.id }, { $set: { name, email } });
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new ValidationError("That email is already used by another admin.", { email: "Already in use" });
      throw error;
    }
    return undefined;
  }, "Account updated");
}

export async function signOutOtherSessionsAction(): Promise<ActionResult<number>> {
  return adminAction(async (admin) => deleteOtherSessions(admin.id, await getSessionToken()), "Other sessions signed out");
}

export async function checkLinksAction(): Promise<ActionResult<LinkCheckResult[]>> {
  return adminAction(async (admin) => {
    const limit = await consumeRateLimit(`linkcheck:${hmac(admin.id)}`, RATE_LIMITS.linkCheck.limit, RATE_LIMITS.linkCheck.windowSeconds);
    if (!limit.allowed) throw new ValidationError("Link checks are limited to a few per 10 minutes. Try again shortly.");
    return checkLinks();
  });
}
