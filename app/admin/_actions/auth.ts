"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { toActionError } from "@/lib/admin/action";
import {
  clearSessionCookie,
  getClientIp,
  getSessionToken,
  getUserAgent,
  setSessionCookie,
} from "@/lib/auth/session";
import { createSession, deleteSessionByToken, verifyLogin } from "@/lib/auth/sessions";
import { isDatabaseConfigured } from "@/lib/db";
import { safeAdminRedirect } from "@/lib/urls";

export type LoginState = { error?: string; email?: string };

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
  redirect(destination);
}

export async function logout(): Promise<void> {
  try {
    await deleteSessionByToken(await getSessionToken());
  } finally {
    await clearSessionCookie();
  }
  redirect("/admin/login?signedOut=1");
}
