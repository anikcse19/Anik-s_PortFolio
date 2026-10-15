import "server-only";
import { unstable_rethrow } from "next/navigation";
import { requireAdminForAction, UnauthorizedError } from "@/lib/auth/session";
import type { SessionAdmin } from "@/lib/auth/sessions";
import { DatabaseNotConfiguredError } from "@/lib/db";
import type { ActionResult } from "@/lib/types";
import { ConflictError, NotFoundError, ValidationError } from "./errors";

/**
 * Wraps every admin server action:
 *  1. verifies the session server-side (never trusts the proxy or the client),
 *  2. runs the mutation,
 *  3. maps known errors to a typed result and hides unexpected ones.
 */
export async function adminAction<T>(
  fn: (admin: SessionAdmin) => Promise<T>,
  successMessage?: string,
): Promise<ActionResult<T>> {
  try {
    const admin = await requireAdminForAction();
    const data = await fn(admin);
    return { ok: true, data, message: successMessage };
  } catch (error) {
    unstable_rethrow(error);
    return toActionError(error);
  }
}

export function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof UnauthorizedError) {
    return { ok: false, code: "UNAUTHORIZED", error: error.message };
  }
  if (error instanceof ValidationError) {
    return { ok: false, code: "VALIDATION", error: error.message, fieldErrors: error.fieldErrors };
  }
  if (error instanceof ConflictError) {
    return { ok: false, code: "CONFLICT", error: error.message, fieldErrors: error.fieldErrors };
  }
  if (error instanceof NotFoundError) {
    return { ok: false, code: "NOT_FOUND", error: error.message };
  }
  if (error instanceof DatabaseNotConfiguredError) {
    return { ok: false, code: "SERVER", error: "The database is not configured. Set MONGODB_URI and try again." };
  }
  // Log the error type only; messages can contain connection strings or user data.
  console.error("Admin action failed:", error instanceof Error ? `${error.name}: ${error.message.slice(0, 200)}` : "unknown");
  return { ok: false, code: "SERVER", error: "Something went wrong on the server. Your changes were not saved." };
}
