"use client";

import { useActionState } from "react";
import { resetPasswordAction, type ResetPasswordState } from "@/app/admin/_actions/auth";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(resetPasswordAction, {});
  return (
    <form action={action} className="space-y-5">
      {state.error ? (
        <p role="alert" className="border-l-2 border-danger bg-surface px-3 py-2 text-sm text-ink">
          {state.error}
        </p>
      ) : null}
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="h-11 w-full rounded-sm border border-rule-strong bg-paper px-3 focus:border-ink focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="h-11 w-full rounded-sm border border-rule-strong bg-paper px-3 focus:border-ink focus:outline-none"
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
