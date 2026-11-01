"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { toActionError } from "@/lib/admin/action";
import { PASSWORD_MAX_LENGTH } from "@/lib/auth/password";
import { requestPasswordReset, RESET_TOKEN_TTL_MS, resetPasswordWithToken } from "@/lib/auth/password-reset";
import {
  clearSessionCookie,
  getClientIp,
  getSessionToken,
  getUserAgent,
  setSessionCookie,
} from "@/lib/auth/session";
import { createSession, deleteSessionByToken, verifyLogin } from "@/lib/auth/sessions";
import { isDatabaseConfigured } from "@/lib/db";
import { getSiteUrl } from "@/lib/env";
import { isSmtpConfigured, sendPasswordResetEmail } from "@/lib/mail";
import { safeAdminRedirect } from "@/lib/urls";

export type LoginState = { error?: string; email?: string; redirectTo?: string };

const loginSchema = z.object({
  email: z.string().trim().max(254),
  password: z.string().min(1).max(256),
});

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")).slice(0, 254) : "";
  if (!parsed.success) return { error: "Enter your email and password.", email };
  if (!isDatabaseConfigured()) return { error: "The database is not configured (MONGODB_URI).", email };

  let destination: string;
  try {
    const result = await verifyLogin(parsed.data.email, parsed.data.password, await getClientIp());
    if (!result.ok) {
      if (result.reason === "rate_limited") {
        const minutes = Math.ceil(result.retryAfterSeconds / 60);
        return { error: `Too many sign-in attempts. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`, email };
      }
      return { error: "Incorrect email or password.", email };
    }
    const { token, expiresAt } = await createSession(result.adminId, await getUserAgent());
    await setSessionCookie(token, expiresAt);
    destination = safeAdminRedirect(formData.get("next"));
  } catch (error) {
    const mapped = toActionError(error);
    return { error: mapped.ok ? "Unexpected error." : mapped.error, email };
  }
  // The form does a full page load to the destination rather than redirect() here. A server-action
  // redirect renders the admin inside the login request and merges it into the signed-out client
  // router state, which could briefly show a stale "not found" page before the dashboard.
  return { redirectTo: destination };
}

export type ForgotPasswordState = { error?: string; sent?: boolean; email?: string };

export async function requestPasswordResetAction(_prev: ForgotPasswordState, formData: FormData): Promise<ForgotPasswordState> {
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")).trim().slice(0, 254) : "";
  if (!email) return { error: "Enter your email.", email };
  if (!isDatabaseConfigured()) return { error: "The database is not configured (MONGODB_URI).", email };
  if (!isSmtpConfigured()) return { error: "Email (SMTP) is not configured, so reset links cannot be sent.", email };

  try {
    const result = await requestPasswordReset(email, await getClientIp());
    if (!result.ok) {
      const minutes = Math.ceil(result.retryAfterSeconds / 60);
      return { error: `Too many reset requests. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`, email };
    }
    if (result.issued) {
      const url = `${getSiteUrl()}/admin/reset-password?token=${encodeURIComponent(result.issued.token)}`;
      try {
        await sendPasswordResetEmail(result.issued.email, url, RESET_TOKEN_TTL_MS / 60_000);
      } catch (error) {
        // Logged server-side only; the response stays identical so it never reveals whether the account exists.
        console.error("Password reset email failed:", error instanceof Error ? error.message : error);
      }
    }
  } catch (error) {
    const mapped = toActionError(error);
    return { error: mapped.ok ? "Unexpected error." : mapped.error, email };
  }
  return { sent: true, email };
}

export type ResetPasswordState = { error?: string };

const resetSchema = z.object({
  token: z.string().max(200),
  password: z.string().max(PASSWORD_MAX_LENGTH),
  confirmPassword: z.string().max(PASSWORD_MAX_LENGTH),
});

export async function resetPasswordAction(_prev: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: "Please fill in both password fields." };
  if (parsed.data.password !== parsed.data.confirmPassword) return { error: "The passwords do not match." };

  try {
    const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password, await getClientIp());
    if (!result.ok) {
      if (result.reason === "weak_password") return { error: result.message };
      if (result.reason === "rate_limited") return { error: "Too many attempts. Try again in a few minutes." };
      return { error: "This reset link is invalid or has expired. Request a new one." };
    }
  } catch (error) {
    const mapped = toActionError(error);
    return { error: mapped.ok ? "Unexpected error." : mapped.error };
  }
  redirect("/admin/login?reset=1");
}

export async function logout(): Promise<void> {
  try {
    await deleteSessionByToken(await getSessionToken());
  } finally {
    await clearSessionCookie();
  }
  redirect("/admin/login?signedOut=1");
}
